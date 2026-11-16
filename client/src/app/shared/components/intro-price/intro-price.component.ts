import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { CurrencyService } from '../../../core/i18n/currency.service';

@Component({
  selector: 'app-intro-price',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './intro-price.component.html',
  styleUrl: './intro-price.component.scss',
})
export class IntroPriceComponent {
  readonly money = inject(CurrencyService);
  readonly introTotal = input.required<number>();
  readonly originalTotal = input.required<number>();
  readonly compact = input(false);
  readonly showBadge = input(true);

  readonly hasIntroDiscount = computed(() => this.originalTotal() > this.introTotal());
}
