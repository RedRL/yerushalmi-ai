import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-intro-price',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './intro-price.component.html',
  styleUrl: './intro-price.component.scss',
})
export class IntroPriceComponent {
  readonly introTotal = input.required<number>();
  readonly originalTotal = input.required<number>();
  readonly compact = input(false);
  readonly showBadge = input(true);

  readonly hasIntroDiscount = computed(() => this.originalTotal() > this.introTotal());
}
