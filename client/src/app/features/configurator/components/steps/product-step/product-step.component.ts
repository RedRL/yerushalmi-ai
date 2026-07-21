import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAIN_PRODUCT_INTRO_PRICES, MAIN_PRODUCT_OPTIONS, MAIN_PRODUCT_ORIGINAL_PRICES } from '../../../../../core/config/pricing.config';
import { IntroPriceComponent } from '../../../../../shared/components/intro-price/intro-price.component';
import { ConfiguratorStoreService } from '../../../state/configurator-store.service';
import type { MainProductId } from '../../../../../shared/models/pricing.model';

@Component({
  selector: 'app-product-step',
  imports: [IntroPriceComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-step.component.html',
  styleUrl: './product-step.component.scss',
})
export class ProductStepComponent {
  readonly store = inject(ConfiguratorStoreService);
  readonly options = MAIN_PRODUCT_OPTIONS;
  readonly introPrices = MAIN_PRODUCT_INTRO_PRICES;
  readonly originalPrices = MAIN_PRODUCT_ORIGINAL_PRICES;

  select(id: MainProductId): void {
    this.store.selectMainProduct(id);
  }
}
