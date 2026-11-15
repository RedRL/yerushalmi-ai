import { ChangeDetectionStrategy, Component, ElementRef, inject, viewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FIELD_LIMITS } from '../../../../../core/config/field-limits.config';
import { WHATSAPP_CONFIG } from '../../../../../core/config/site.config';
import { formatShortInquiryReference } from '../../../../../shared/utils/inquiry-reference.util';
import { ConfiguratorStoreService } from '../../../state/configurator-store.service';

@Component({
  selector: 'app-contact-step',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './contact-step.component.html',
  styleUrl: './contact-step.component.scss',
})
export class ContactStepComponent {
  readonly store = inject(ConfiguratorStoreService);
  readonly whatsappUrl = WHATSAPP_CONFIG.url;
  readonly limits = FIELD_LIMITS;
  readonly formatShortInquiryReference = formatShortInquiryReference;
  private readonly couponMessage = viewChild<ElementRef<HTMLElement>>('couponMessage');

  applyCoupon(): void {
    this.store.applyCoupon();
    if (!this.store.couponApplyError() && !this.store.appliedCouponCode()) return;
    this.scrollCouponMessageIntoView();
  }

  submit(): void {
    if (this.store.isSubmitting() || this.store.submitResult()) return;
    if (!this.store.isSubmissionValid()) {
      this.store.contactForm.markAllAsTouched();
      return;
    }
    void this.store.submit();
  }

  startNewProject(): void {
    this.store.reset();
  }

  /** On mobile the coupon note sits under the field and can fall below the visible area. */
  private scrollCouponMessageIntoView(): void {
    if (!window.matchMedia('(max-width: 1023px)').matches) return;

    setTimeout(() => {
      const message = this.couponMessage()?.nativeElement;
      if (!message || !message.textContent?.trim()) return;

      const padding = 12;
      const rect = message.getBoundingClientRect();
      const viewportBottom = window.visualViewport?.height ?? window.innerHeight;
      const footer = document.querySelector('.configurator__footer');
      let limitBottom = viewportBottom;
      if (footer instanceof HTMLElement) {
        const footerRect = footer.getBoundingClientRect();
        if (footerRect.top < limitBottom && footerRect.bottom > 0) {
          limitBottom = Math.min(limitBottom, footerRect.top);
        }
      }

      const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
      const scroller = findScrollParent(message);
      const scrollerRect = scroller?.getBoundingClientRect();
      const clippedByScroller = !!scroller && !!scrollerRect && (
        rect.bottom > scrollerRect.bottom - padding || rect.top < scrollerRect.top + padding
      );
      const clippedByViewport = rect.bottom > limitBottom - padding || rect.top < padding;
      if (!clippedByScroller && !clippedByViewport) return;

      if (clippedByScroller && scroller && scrollerRect) {
        const visibleBottom = Math.min(scrollerRect.bottom, limitBottom) - padding;
        const visibleTop = Math.max(scrollerRect.top, padding);
        const delta = rect.bottom > visibleBottom ? rect.bottom - visibleBottom : rect.top - visibleTop;
        scroller.scrollTo({ top: scroller.scrollTop + delta, behavior });
        return;
      }

      const delta = rect.bottom > limitBottom - padding
        ? rect.bottom - (limitBottom - padding)
        : rect.top - padding;
      window.scrollBy({ top: delta, behavior });
    });
  }
}

function findScrollParent(element: HTMLElement): HTMLElement | null {
  let node = element.parentElement;
  while (node) {
    const overflowY = getComputedStyle(node).overflowY;
    if ((overflowY === 'auto' || overflowY === 'scroll') && node.scrollHeight > node.clientHeight + 1) {
      return node;
    }
    node = node.parentElement;
  }
  return null;
}
