import { ChangeDetectionStrategy, Component } from '@angular/core';



import { SectionHeadingComponent } from '../../shared/components/section-heading/section-heading.component';



import { PriceSummaryComponent } from '../../shared/components/price-summary/price-summary.component';



import { RevealOnScrollDirective } from '../../shared/directives/reveal-on-scroll.directive';



import { ConfiguratorProgressComponent } from './components/configurator-progress/configurator-progress.component';



import { ProductStepComponent } from './components/steps/product-step/product-step.component';



import { SongStepComponent } from './components/steps/song-step/song-step.component';



import { VideoStepComponent } from './components/steps/video-step/video-step.component';



import { ProjectDetailsStepComponent } from './components/steps/project-details-step/project-details-step.component';



import { OptionalDetailsStepComponent } from './components/steps/optional-details-step/optional-details-step.component';



import { UploadStepComponent } from './components/steps/upload-step/upload-step.component';



import { SummaryStepComponent } from './components/steps/summary-step/summary-step.component';



import { ContactStepComponent } from './components/steps/contact-step/contact-step.component';



import { ConfiguratorStoreService } from './state/configurator-store.service';







@Component({



  selector: 'app-configurator',



  imports: [



    SectionHeadingComponent,



    PriceSummaryComponent,



    RevealOnScrollDirective,



    ConfiguratorProgressComponent,



    ProductStepComponent,



    SongStepComponent,



    VideoStepComponent,



    ProjectDetailsStepComponent,



    OptionalDetailsStepComponent,



    UploadStepComponent,



    SummaryStepComponent,



    ContactStepComponent,



  ],



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







  get showSidebarPrice(): boolean {



    return !this.store.submitResult() && !!this.store.mainProduct();



  }







  goNext(): void {



    this.store.goNext();



  }







  goBack(): void {



    this.store.goBack();



  }



}



