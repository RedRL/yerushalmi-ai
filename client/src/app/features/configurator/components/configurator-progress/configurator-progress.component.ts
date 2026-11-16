import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LocaleService } from '../../../../core/i18n/locale.service';
import type { ConfiguratorStepDef } from '../../configurator.model';
import { ConfiguratorStoreService } from '../../state/configurator-store.service';

@Component({
  selector: 'app-configurator-progress',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './configurator-progress.component.html',
  styleUrl: './configurator-progress.component.scss',
})
export class ConfiguratorProgressComponent {
  readonly store = inject(ConfiguratorStoreService);
  readonly i18n = inject(LocaleService);

  stepState(index: number): 'completed' | 'current' | 'upcoming' {
    if (this.store.submitResult()) return 'completed';
    if (index < this.store.currentStepIndex()) return 'completed';
    if (index === this.store.currentStepIndex()) return 'current';
    return 'upcoming';
  }

  stepAriaLabel(index: number, step: ConfiguratorStepDef): string {
    return this.i18n.tf('config.stepAria', {
      index: index + 1,
      total: this.store.visibleSteps().length,
      label: this.i18n.tx(step.label),
    });
  }

  onStepClick(index: number): void {
    this.store.goToStep(index);
  }
}
