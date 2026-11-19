import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  DOCUMENT,
  inject,
  OnInit,
} from '@angular/core';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { ProcessSectionComponent } from '../home/components/process-section/process-section.component';
import { CreationProcessSectionComponent } from '../home/components/creation-process-section/creation-process-section.component';
import { ConfiguratorComponent } from '../configurator/configurator.component';
import { ConfiguratorStoreService } from '../configurator/state/configurator-store.service';
import { CONFIGURATOR_EXPERIENCE_MODE } from '../configurator/experience/experience-mode';
import { ContactSectionComponent } from '../contact/contact-section.component';
import { WeddingsHeroComponent } from './components/weddings-hero/weddings-hero.component';
import { WeddingsDemoComponent } from './components/weddings-demo/weddings-demo.component';
import { WeddingsPricingComponent } from './components/weddings-pricing/weddings-pricing.component';
import { WEDDINGS_MESSAGES } from './weddings.messages';

@Component({
  selector: 'app-weddings',
  providers: [
    { provide: CONFIGURATOR_EXPERIENCE_MODE, useValue: 'weddings' as const },
    ConfiguratorStoreService,
  ],
  imports: [
    HeaderComponent,
    WeddingsHeroComponent,
    WeddingsDemoComponent,
    ProcessSectionComponent,
    CreationProcessSectionComponent,
    WeddingsPricingComponent,
    ConfiguratorComponent,
    ContactSectionComponent,
    FooterComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './weddings.component.html',
  styleUrl: './weddings.component.scss',
})
export class WeddingsComponent implements OnInit {
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);

  readonly processMessages = WEDDINGS_MESSAGES.process;
  readonly creationMessages = WEDDINGS_MESSAGES.creation;

  ngOnInit(): void {
    this.document.documentElement.classList.add('weddings-theme');
    this.destroyRef.onDestroy(() => {
      this.document.documentElement.classList.remove('weddings-theme');
    });
  }
}
