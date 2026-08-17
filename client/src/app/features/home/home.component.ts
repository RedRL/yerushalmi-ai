import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { HeroComponent } from './components/hero/hero.component';
import { PortfolioComponent } from '../portfolio/portfolio.component';
import { ProcessSectionComponent } from './components/process-section/process-section.component';
import { CreationProcessSectionComponent } from './components/creation-process-section/creation-process-section.component';
import { PricingSectionComponent } from './components/pricing-section/pricing-section.component';
import { ConfiguratorComponent } from '../configurator/configurator.component';
import { ConfiguratorStoreService } from '../configurator/state/configurator-store.service';
import { ContactSectionComponent } from '../contact/contact-section.component';

@Component({
  selector: 'app-home',
  providers: [ConfiguratorStoreService],
  imports: [
    HeaderComponent,
    HeroComponent,
    PortfolioComponent,
    ProcessSectionComponent,
    CreationProcessSectionComponent,
    PricingSectionComponent,
    ConfiguratorComponent,
    ContactSectionComponent,
    FooterComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {}
