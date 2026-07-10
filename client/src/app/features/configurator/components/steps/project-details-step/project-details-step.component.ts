import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ConfiguratorStoreService } from '../../../state/configurator-store.service';

export const STORY_MAX_LENGTH = 5000;

@Component({
  selector: 'app-project-details-step',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './project-details-step.component.html',
  styleUrl: './project-details-step.component.scss',
})
export class ProjectDetailsStepComponent {
  readonly store = inject(ConfiguratorStoreService);
  readonly storyMaxLength = STORY_MAX_LENGTH;
}
