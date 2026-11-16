import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { findPackage } from '../../../../../core/config/packages.config';
import { localizedProductTitle, MAIN_PRODUCT_OPTIONS } from '../../../../../core/config/pricing.config';
import { CurrencyService } from '../../../../../core/i18n/currency.service';
import { LocaleService } from '../../../../../core/i18n/locale.service';
import type { MainProductId, MainProductOption } from '../../../../../shared/models/pricing.model';
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
  readonly i18n = inject(LocaleService);
  readonly money = inject(CurrencyService);
  readonly options = MAIN_PRODUCT_OPTIONS;
  readonly visuals = PRODUCT_VISUALS;
  readonly leavingId = signal<MainProductId | null>(null);
  private leaveTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      if (this.leaveTimer !== null) clearTimeout(this.leaveTimer);
    });
  }

  priceLabel(id: MainProductId): string {
    const pkg = findPackage(id);
    const price = this.money.format(pkg.introPrice);
    return pkg.priceStartsFrom ? `${this.i18n.t('package.pricePrefix')} ${price}` : price;
  }

  productTitle(option: MainProductOption): string {
    return localizedProductTitle(option, this.i18n.locale());
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
