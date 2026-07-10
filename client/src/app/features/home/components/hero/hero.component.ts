import { ChangeDetectionStrategy, Component } from '@angular/core';
import { scrollToSection } from '../../../../shared/utils/scroll-to.util';

@Component({
  selector: 'app-hero',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss',
})
export class HeroComponent {
  goToConfigurator(): void {
    scrollToSection('configurator');
  }

  goToPortfolio(): void {
    scrollToSection('portfolio');
  }
}
