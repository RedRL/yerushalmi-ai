import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { HeroComponent } from './components/hero/hero.component';
import { ServicesSectionComponent } from './components/services-section/services-section.component';
import { ProcessSectionComponent } from './components/process-section/process-section.component';
import { PortfolioComponent } from '../portfolio/portfolio.component';
import { ConfiguratorComponent } from '../configurator/configurator.component';
import { ContactSectionComponent } from '../contact/contact-section.component';

@Component({
  selector: 'app-home',
  imports: [
    HeaderComponent,
    HeroComponent,
    PortfolioComponent,
    ServicesSectionComponent,
    ProcessSectionComponent,
    ConfiguratorComponent,
    ContactSectionComponent,
    FooterComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {}
