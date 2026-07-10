import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SectionHeadingComponent } from '../../shared/components/section-heading/section-heading.component';
import { ConfiguratorProgressComponent } from './components/configurator-progress/configurator-progress.component';
import { ProductStepComponent } from './components/steps/product-step/product-step.component';
import { SongStepComponent } from './components/steps/song-step/song-step.component';
import { VideoStepComponent } from './components/steps/video-step/video-step.component';
import { AddonsStepComponent } from './components/steps/addons-step/addons-step.component';
import { ProjectDetailsStepComponent } from './components/steps/project-details-step/project-details-step.component';
import { UploadStepComponent } from './components/steps/upload-step/upload-step.component';
import { SummaryStepComponent } from './components/steps/summary-step/summary-step.component';
import { ContactStepComponent } from './components/steps/contact-step/contact-step.component';
import { ConfiguratorStoreService } from './state/configurator-store.service';

@Component({
  selector: 'app-configurator',
  imports: [
    SectionHeadingComponent,
    ConfiguratorProgressComponent,
    ProductStepComponent,
    SongStepComponent,
    VideoStepComponent,
    AddonsStepComponent,
    ProjectDetailsStepComponent,
    UploadStepComponent,
    SummaryStepComponent,
    ContactStepComponent,
  ],
  providers: [ConfiguratorStoreService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './configurator.component.html',
  styleUrl: './configurator.component.scss',
})
export class ConfiguratorComponent {
  constructor(readonly store: ConfiguratorStoreService) {}

  get isFinalStep(): boolean {
    return this.store.currentStep().id === 'contact';
  }

  get isFirstStep(): boolean {
    return this.store.currentStepIndex() === 0;
  }
}
