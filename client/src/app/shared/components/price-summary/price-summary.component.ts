import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { PriceBreakdown } from '../../models/pricing.model';

@Component({
  selector: 'app-price-summary',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './price-summary.component.html',
  styleUrl: './price-summary.component.scss',
})
export class PriceSummaryComponent {
  readonly breakdown = input<PriceBreakdown | null>(null);
  readonly compact = input(false);
}
