import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { couponDiscountPercent } from '../../../core/config/coupon.config';
import { findPackage } from '../../../core/config/packages.config';
import { localizedOptionLabel } from '../../../core/config/pricing.config';
import { CurrencyService } from '../../../core/i18n/currency.service';
import { LocaleService } from '../../../core/i18n/locale.service';
import type { MainProductId, PriceBreakdown, PricingLineItem } from '../../models/pricing.model';

@Component({
  selector: 'app-price-summary',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './price-summary.component.html',
  styleUrl: './price-summary.component.scss',
})
export class PriceSummaryComponent {
  readonly i18n = inject(LocaleService);
  readonly money = inject(CurrencyService);

  readonly breakdown = input<PriceBreakdown | null>(null);
  readonly originalTotal = input<number | null>(null);
  readonly compact = input(false);
  readonly mainProductId = input<MainProductId | null>(null);
  readonly couponRemove = output<void>();

  readonly justUpdated = signal(false);

  readonly showIntroPricing = computed(() => {
    const intro = this.breakdown()?.total;
    const original = this.originalTotal();
    return intro != null && original != null && original > intro;
  });

  readonly packageInfo = computed(() => {
    const id = this.mainProductId();
    return id ? findPackage(id) : null;
  });

  readonly packagePrice = computed(() => {
    const item = (this.breakdown()?.lineItems ?? []).find((line) =>
      line.id.startsWith('main_product:'),
    );
    return item ? item.amount * item.quantity : null;
  });

  readonly addonItems = computed(() => {
    const items = this.breakdown()?.lineItems ?? [];
    return items.filter(
      (item) =>
        !item.id.startsWith('main_product:') &&
        item.id !== 'subtitles:none' &&
        item.id !== 'addon:ai_image_fill',
    );
  });

  readonly couponPercent = computed(() => couponDiscountPercent(this.breakdown()?.couponCode));

  /** Line-item label in the active locale (Hebrew fallback when no English label exists). */
  itemLabel(item: PricingLineItem): string {
    return localizedOptionLabel(item, this.i18n.locale());
  }

  private previousTotal: number | null = null;
  private bumpTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    effect(() => {
      const total = this.breakdown()?.total ?? null;
      if (total !== null && this.previousTotal !== null && total !== this.previousTotal) {
        this.justUpdated.set(true);
        if (this.bumpTimeout) clearTimeout(this.bumpTimeout);
        this.bumpTimeout = setTimeout(() => this.justUpdated.set(false), 420);
      }
      this.previousTotal = total;
    });
  }
}
