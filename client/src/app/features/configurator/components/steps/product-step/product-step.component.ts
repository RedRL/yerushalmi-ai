import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAIN_PRODUCT_OPTIONS } from '../../../../../core/config/pricing.config';
import type { MainProductId } from '../../../../../shared/models/pricing.model';
import { ConfiguratorStoreService } from '../../../state/configurator-store.service';

@Component({
  selector: 'app-product-step',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-step.component.html',
  styleUrl: './product-step.component.scss',
})
export class ProductStepComponent {
  readonly store = inject(ConfiguratorStoreService);
  readonly options = MAIN_PRODUCT_OPTIONS;

  select(id: MainProductId): void {
    this.store.selectMainProduct(id);
  }
}
