import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PACKAGE_DEFINITIONS } from '../../../../core/config/packages.config';
import { SectionHeadingComponent } from '../../../../shared/components/section-heading/section-heading.component';
import { PackageCardComponent } from '../../../../shared/components/package-card/package-card.component';
import { RevealOnScrollDirective } from '../../../../shared/directives/reveal-on-scroll.directive';
import type { MainProductId } from '../../../../shared/models/pricing.model';
import { scrollToConfigurator } from '../../../../shared/utils/scroll-to.util';
import { ConfiguratorStoreService } from '../../../configurator/state/configurator-store.service';

@Component({
  selector: 'app-pricing-section',
  imports: [SectionHeadingComponent, PackageCardComponent, RevealOnScrollDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pricing-section.component.html',
  styleUrl: './pricing-section.component.scss',
})
export class PricingSectionComponent {
  private readonly store = inject(ConfiguratorStoreService);

  readonly packages = PACKAGE_DEFINITIONS;

  startWithPackage(id: MainProductId): void {
    this.store.beginWithPackage(id);
    scrollToConfigurator();
  }
}
