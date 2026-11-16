import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FIELD_LIMITS } from '../../../../../core/config/field-limits.config';
import { LocaleService } from '../../../../../core/i18n/locale.service';
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
  readonly i18n = inject(LocaleService);
  readonly limits = FIELD_LIMITS;

  /** Bilingual occasion copy (`L10nText` fields) — resolve with `i18n.tx()`. */
  readonly copy = this.store.occasionCopy;

  screenIndex(): number {
    return this.store.subStepPosition();
  }

  screenTotal(): number {
    return this.store.currentScreens().length;
  }
}
