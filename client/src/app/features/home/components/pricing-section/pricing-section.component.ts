import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PACKAGE_DEFINITIONS } from '../../../../core/config/packages.config';
import { LocaleService } from '../../../../core/i18n/locale.service';
import { SectionHeadingComponent } from '../../../../shared/components/section-heading/section-heading.component';
import { PackageCardComponent } from '../../../../shared/components/package-card/package-card.component';
import { RevealOnScrollDirective } from '../../../../shared/directives/reveal-on-scroll.directive';
import type { MainProductId } from '../../../../shared/models/pricing.model';
import { scrollToConfigurator } from '../../../../shared/utils/scroll-to.util';
import { ConfiguratorStoreService } from '../../../configurator/state/configurator-store.service';
import { HOME_MESSAGES } from '../../home.messages';

@Component({
  selector: 'app-pricing-section',
  imports: [SectionHeadingComponent, PackageCardComponent, RevealOnScrollDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pricing-section.component.html',
  styleUrl: './pricing-section.component.scss',
})
export class PricingSectionComponent {
  private readonly store = inject(ConfiguratorStoreService);
  readonly i18n = inject(LocaleService);
  readonly msg = HOME_MESSAGES.pricing;

  readonly packages = PACKAGE_DEFINITIONS;

  startWithPackage(id: MainProductId): void {
    this.store.beginWithPackage(id);
    scrollToConfigurator();
  }
}
