import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FIELD_LIMITS } from '../../../../../core/config/field-limits.config';
import { ConfiguratorStoreService } from '../../../state/configurator-store.service';
import { WizardScreenComponent } from '../../wizard-screen/wizard-screen.component';

@Component({
  selector: 'app-optional-details-step',
  imports: [ReactiveFormsModule, WizardScreenComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './optional-details-step.component.html',
  styleUrl: './optional-details-step.component.scss',
})
export class OptionalDetailsStepComponent {
  readonly store = inject(ConfiguratorStoreService);
  readonly limits = FIELD_LIMITS;

  readonly whoDescription = 'רשות. מה שתמלאו כאן נכנס לשיר.';

  screenIndex(): number {
    return this.store.subStepPosition();
  }

  screenTotal(): number {
    return this.store.currentScreens().length;
  }
}
