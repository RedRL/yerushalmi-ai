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
 * Gutter padding on the shell is toggled only when content overflows.
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

  private readonly onScroll = (): void => {
    this.scheduleUpdate();
  };

  ngAfterViewInit(): void {
    const el = this.host.nativeElement;
    this.shell = el.parentElement;

    if (!this.shell) {
      return;
    }

    this.shell.classList.add('persistent-scroll-shell');
    this.rail.className = 'persistent-scroll__rail';
    this.rail.setAttribute('aria-hidden', 'true');
    this.thumb.className = 'persistent-scroll__thumb';
    this.rail.appendChild(this.thumb);
    this.shell.insertBefore(this.rail, el);

    this.zone.runOutsideAngular(() => {
      el.addEventListener('scroll', this.onScroll, { passive: true });
      window.addEventListener('resize', this.onScroll, { passive: true });

      this.resizeObserver = new ResizeObserver(() => this.scheduleUpdate());
      this.resizeObserver.observe(el);
      this.resizeObserver.observe(this.shell!);

      this.mutationObserver = new MutationObserver(() => this.scheduleUpdate());
      this.mutationObserver.observe(el, { childList: true, subtree: true });
    });

    this.scheduleUpdate();
  }

  ngOnDestroy(): void {
    const el = this.host.nativeElement;
    el.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('resize', this.onScroll);
    this.resizeObserver?.disconnect();
    this.mutationObserver?.disconnect();

    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
    }

    this.rail.remove();
    this.shell?.classList.remove(PersistentScrollbarDirective.gutterClass);
  }

  private scheduleUpdate(): void {
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
    }

    this.frameId = requestAnimationFrame(() => {
      this.frameId = null;
      this.update();
    });
  }

  private update(): void {
    const el = this.host.nativeElement;
    const style = getComputedStyle(el);
    const canScroll = style.overflowY === 'scroll' || style.overflowY === 'auto';
    const { scrollHeight, clientHeight, scrollTop } = el;
    const needsScrollbar = canScroll && scrollHeight > clientHeight + 1;

    if (!needsScrollbar) {
      this.rail.hidden = true;
      this.shell?.classList.remove(PersistentScrollbarDirective.gutterClass);
      return;
    }

    this.rail.hidden = false;
    this.shell?.classList.add(PersistentScrollbarDirective.gutterClass);

    const minThumb = 32;
    const thumbHeight = Math.max(minThumb, (clientHeight / scrollHeight) * clientHeight);
    const maxScroll = scrollHeight - clientHeight;
    const trackRange = Math.max(0, clientHeight - thumbHeight);
    const scrollRatio = maxScroll > 0 ? Math.min(1, Math.max(0, scrollTop / maxScroll)) : 0;
    const thumbOffset = scrollRatio * trackRange;

    this.thumb.style.height = `${thumbHeight}px`;
    this.thumb.style.top = `${thumbOffset}px`;
    this.thumb.style.backgroundSize = `100% ${clientHeight}px`;
    this.thumb.style.backgroundPosition = `0 ${-thumbOffset}px`;
  }
}
