import { ChangeDetectionStrategy, Component, computed, effect, input, signal } from '@angular/core';
import { findPackage } from '../../../core/config/packages.config';
import type { MainProductId, PriceBreakdown } from '../../models/pricing.model';

@Component({
  selector: 'app-price-summary',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './price-summary.component.html',
  styleUrl: './price-summary.component.scss',
})
export class PriceSummaryComponent {
  readonly breakdown = input<PriceBreakdown | null>(null);
  readonly originalTotal = input<number | null>(null);
  readonly compact = input(false);
  readonly mainProductId = input<MainProductId | null>(null);

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

  readonly addonItems = computed(() => {
    const items = this.breakdown()?.lineItems ?? [];
    return items.filter((item) => !item.id.startsWith('main_product:'));
  });

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
