import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { WEDDING_PACKAGE_DEFINITIONS } from '../../../../core/config/wedding-packages.config';
import { LocaleService } from '../../../../core/i18n/locale.service';
import { PackageCardComponent } from '../../../../shared/components/package-card/package-card.component';
import { SectionHeadingComponent } from '../../../../shared/components/section-heading/section-heading.component';
import { RevealOnScrollDirective } from '../../../../shared/directives/reveal-on-scroll.directive';
import type { MainProductId } from '../../../../shared/models/pricing.model';
import { scrollToConfigurator } from '../../../../shared/utils/scroll-to.util';
import { ConfiguratorStoreService } from '../../../configurator/state/configurator-store.service';
import { WEDDINGS_MESSAGES } from '../../weddings.messages';

@Component({
  selector: 'app-weddings-pricing',
  imports: [SectionHeadingComponent, PackageCardComponent, RevealOnScrollDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './weddings-pricing.component.html',
  styleUrl: './weddings-pricing.component.scss',
})
export class WeddingsPricingComponent {
  private readonly store = inject(ConfiguratorStoreService);
  readonly i18n = inject(LocaleService);
  readonly msg = WEDDINGS_MESSAGES.pricing;
  readonly packages = WEDDING_PACKAGE_DEFINITIONS;

  startWithPackage(id: MainProductId): void {
    this.store.beginWithPackage(id);
    scrollToConfigurator();
  }
}
