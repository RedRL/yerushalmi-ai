import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { findPackage } from '../../../../../core/config/packages.config';
import { MAIN_PRODUCT_OPTIONS } from '../../../../../core/config/pricing.config';
import type { MainProductId } from '../../../../../shared/models/pricing.model';
import { PRODUCT_VISUALS } from '../../../experience/experience.config';
import { ConfiguratorStoreService } from '../../../state/configurator-store.service';
import { WizardScreenComponent } from '../../wizard-screen/wizard-screen.component';

@Component({
  selector: 'app-product-step',
  imports: [WizardScreenComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-step.component.html',
  styleUrl: './product-step.component.scss',
})
export class ProductStepComponent {
  readonly store = inject(ConfiguratorStoreService);
  readonly options = MAIN_PRODUCT_OPTIONS;
  readonly visuals = PRODUCT_VISUALS;
  readonly leavingId = signal<MainProductId | null>(null);
  private leaveTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      if (this.leaveTimer !== null) clearTimeout(this.leaveTimer);
    });
  }

  price(id: MainProductId): number {
    return findPackage(id).introPrice;
  }

  select(id: MainProductId): void {
    if (this.leavingId()) return;
    this.store.selectMainProduct(id);
    this.leavingId.set(id);
    this.leaveTimer = setTimeout(() => {
      this.leaveTimer = null;
      this.store.goNext();
    }, 280);
  }
}
