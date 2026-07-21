import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FIELD_LIMITS } from '../../../../../core/config/field-limits.config';
import { ConfiguratorStoreService } from '../../../state/configurator-store.service';

@Component({
  selector: 'app-optional-details-step',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './optional-details-step.component.html',
  styleUrl: './optional-details-step.component.scss',
})
export class OptionalDetailsStepComponent {
  readonly store = inject(ConfiguratorStoreService);
  readonly limits = FIELD_LIMITS;
}
