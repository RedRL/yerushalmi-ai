import {
  AfterViewInit,
  Directive,
  ElementRef,
  NgZone,
  OnDestroy,
  inject,
} from '@angular/core';

/**
 * Replaces the native scrollbar with a custom brand-gradient thumb that stays visible.
 * The rail is rendered on the shell parent so it is not clipped by overflow.
 * The rail is shown only when the host can actually scroll.
 */
@Directive({
  selector: '[appPersistentScrollbar]',
  host: { class: 'persistent-scroll-host' },
})
export class PersistentScrollbarDirective implements AfterViewInit, OnDestroy {
  private static readonly gutterClass = 'persistent-scroll-shell--gutter';

  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly zone = inject(NgZone);

  private shell: HTMLElement | null = null;
  private readonly rail = document.createElement('div');
  private readonly thumb = document.createElement('div');
  private resizeObserver: ResizeObserver | null = null;
  private mutationObserver: MutationObserver | null = null;
  private frameId: number | null = null;
  private observedNodes = new Set<Element>();
  private measuring = false;

  private dragging = false;
  private dragPointerId: number | null = null;
  private dragOffsetY = 0;

  private readonly onScroll = (): void => {
    this.scheduleThumbSync();
  };

  ngAfterViewInit(): void {
    const el = this.host.nativeElement;
    this.shell = el.parentElement;

    if (!this.shell) {
      return;
    }

    this.shell.classList.add('persistent-scroll-shell');
    this.rail.className = 'persistent-scroll__rail';
    this.rail.hidden = true;
    this.rail.setAttribute('role', 'scrollbar');
    this.rail.setAttribute('aria-orientation', 'vertical');
    this.rail.setAttribute('aria-hidden', 'true');
    this.thumb.className = 'persistent-scroll__thumb';
    this.rail.appendChild(this.thumb);
    this.shell.insertBefore(this.rail, el);
    this.hideRail();

    this.zone.runOutsideAngular(() => {
      el.addEventListener('scroll', this.onScroll, { passive: true });
      window.addEventListener('resize', this.onWindowResize, { passive: true });
      this.rail.addEventListener('pointerdown', this.onRailPointerDown);

      this.resizeObserver = new ResizeObserver(() => this.scheduleVisibilityUpdate());
      this.observeResizeTargets();

      this.mutationObserver = new MutationObserver(() => {
        this.observeResizeTargets();
        this.scheduleVisibilityUpdate();
      });
      this.mutationObserver.observe(el, { childList: true, subtree: true, characterData: true });
    });

    this.scheduleVisibilityUpdate();
  }

  ngOnDestroy(): void {
    const el = this.host.nativeElement;
    el.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('resize', this.onWindowResize);
    this.rail.removeEventListener('pointerdown', this.onRailPointerDown);
    this.stopDrag();
    this.resizeObserver?.disconnect();
    this.mutationObserver?.disconnect();
    this.observedNodes.clear();

    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
    }

    this.rail.remove();
    this.shell?.classList.remove(PersistentScrollbarDirective.gutterClass);
  }

  private readonly onWindowResize = (): void => {
    this.scheduleVisibilityUpdate();
  };

  private readonly onRailPointerDown = (event: PointerEvent): void => {
    if (event.button !== 0 || this.rail.hidden) return;

    event.preventDefault();
    event.stopPropagation();

    const el = this.host.nativeElement;
    const railRect = this.rail.getBoundingClientRect();
    const thumbHeight = this.thumb.offsetHeight || 32;
    const onThumb = event.target === this.thumb || this.thumb.contains(event.target as Node);

    this.dragOffsetY = onThumb
      ? event.clientY - this.thumb.getBoundingClientRect().top
      : thumbHeight / 2;

    this.dragging = true;
    this.dragPointerId = event.pointerId;
    this.rail.classList.add('persistent-scroll__rail--dragging');
    this.thumb.classList.add('persistent-scroll__thumb--dragging');
    this.rail.setPointerCapture(event.pointerId);
    window.addEventListener('pointermove', this.onDragMove);
    window.addEventListener('pointerup', this.onDragEnd);
    window.addEventListener('pointercancel', this.onDragEnd);

    this.scrollToRailY(el, railRect, event.clientY);
  };

  private readonly onDragMove = (event: PointerEvent): void => {
    if (!this.dragging || event.pointerId !== this.dragPointerId) return;
    event.preventDefault();
    this.scrollToRailY(this.host.nativeElement, this.rail.getBoundingClientRect(), event.clientY);
  };

  private readonly onDragEnd = (event: PointerEvent): void => {
    if (event.pointerId !== this.dragPointerId) return;
    this.stopDrag();
  };

  private stopDrag(): void {
    if (this.dragPointerId !== null && this.rail.hasPointerCapture(this.dragPointerId)) {
      this.rail.releasePointerCapture(this.dragPointerId);
    }
    this.dragging = false;
    this.dragPointerId = null;
    this.rail.classList.remove('persistent-scroll__rail--dragging');
    this.thumb.classList.remove('persistent-scroll__thumb--dragging');
    window.removeEventListener('pointermove', this.onDragMove);
    window.removeEventListener('pointerup', this.onDragEnd);
    window.removeEventListener('pointercancel', this.onDragEnd);
  }

  private scrollToRailY(el: HTMLElement, railRect: DOMRect, clientY: number): void {
    const thumbHeight = this.thumb.offsetHeight || 32;
    const trackRange = Math.max(0, railRect.height - thumbHeight);
    const maxScroll = Math.max(0, el.scrollHeight - el.clientHeight);
    if (trackRange <= 0 || maxScroll <= 0) return;

    const y = clientY - railRect.top - this.dragOffsetY;
    const ratio = Math.min(1, Math.max(0, y / trackRange));
    el.scrollTop = ratio * maxScroll;
  }

  private observeResizeTargets(): void {
    const el = this.host.nativeElement;
    if (!this.resizeObserver) return;

    const next = new Set<Element>([el]);
    for (const child of Array.from(el.children)) {
      if (child instanceof Element) {
        next.add(child);
      }
    }

    for (const node of this.observedNodes) {
      if (!next.has(node)) {
        this.resizeObserver.unobserve(node);
      }
    }

    for (const node of next) {
      if (!this.observedNodes.has(node)) {
        this.resizeObserver.observe(node);
      }
    }

    this.observedNodes = next;
  }

  private scheduleThumbSync(): void {
    if (this.rail.hidden) return;
    if (this.frameId !== null) return;
    this.frameId = requestAnimationFrame(() => {
      this.frameId = null;
      this.syncThumb();
    });
  }

  private scheduleVisibilityUpdate(): void {
    if (this.measuring || this.dragging) return;
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
    }
    this.frameId = requestAnimationFrame(() => {
      this.frameId = null;
      this.updateVisibility();
    });
  }

  private canActuallyScroll(el: HTMLElement): boolean {
    const style = getComputedStyle(el);
    const overflowY = style.overflowY;
    if (overflowY !== 'auto' && overflowY !== 'scroll' && overflowY !== 'overlay') {
      return false;
    }
    if (el.scrollTop > 0) return true;

    const kids = Array.from(el.children).filter((node): node is HTMLElement => node instanceof HTMLElement);
    if (kids.length > 0) {
      const box = el.getBoundingClientRect();
      const paddingBottom = Number.parseFloat(style.paddingBottom) || 0;
      const lastBottom = kids[kids.length - 1].getBoundingClientRect().bottom;
      return lastBottom > box.bottom - paddingBottom + 8;
    }

    const before = el.scrollTop;
    el.scrollTop = before + 64;
    const moved = el.scrollTop - before;
    el.scrollTop = before;
    return moved >= 8;
  }

  private hideRail(): void {
    this.rail.hidden = true;
    this.rail.setAttribute('aria-hidden', 'true');
    this.shell?.classList.remove(PersistentScrollbarDirective.gutterClass);
  }

  private updateVisibility(): void {
    const el = this.host.nativeElement;
    this.measuring = true;
    this.hideRail();
    void el.offsetHeight;

    if (!this.canActuallyScroll(el)) {
      this.measuring = false;
      return;
    }

    this.rail.hidden = false;
    this.rail.removeAttribute('aria-hidden');
    this.shell?.classList.add(PersistentScrollbarDirective.gutterClass);
    this.syncThumb();
    requestAnimationFrame(() => {
      this.measuring = false;
    });
  }

  private syncThumb(): void {
    if (this.rail.hidden) return;

    const el = this.host.nativeElement;
    const { scrollHeight, clientHeight, scrollTop } = el;
    const maxScroll = Math.max(0, scrollHeight - clientHeight);
    if (maxScroll < 8) {
      this.hideRail();
      return;
    }

    const minThumb = 32;
    const thumbHeight = Math.max(minThumb, (clientHeight / scrollHeight) * clientHeight);
    const trackRange = Math.max(0, clientHeight - thumbHeight);
    const scrollRatio = maxScroll > 0 ? Math.min(1, Math.max(0, scrollTop / maxScroll)) : 0;
    const thumbOffset = scrollRatio * trackRange;

    this.thumb.style.height = `${thumbHeight}px`;
    this.thumb.style.top = `${thumbOffset}px`;
    this.thumb.style.backgroundSize = `${this.thumb.offsetWidth || 7}px ${clientHeight}px`;
    this.thumb.style.backgroundPosition = `0 ${-thumbOffset}px`;
    this.rail.setAttribute('aria-valuemin', '0');
    this.rail.setAttribute('aria-valuemax', String(Math.round(maxScroll)));
    this.rail.setAttribute('aria-valuenow', String(Math.round(scrollTop)));
  }
}
