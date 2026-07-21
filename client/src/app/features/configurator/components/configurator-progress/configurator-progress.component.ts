import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ConfiguratorStoreService } from '../../state/configurator-store.service';

@Component({
  selector: 'app-configurator-progress',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './configurator-progress.component.html',
  styleUrl: './configurator-progress.component.scss',
})
export class ConfiguratorProgressComponent {
  readonly store = inject(ConfiguratorStoreService);

  stepState(index: number): 'completed' | 'current' | 'upcoming' {
    if (index < this.store.currentStepIndex()) return 'completed';
    if (index === this.store.currentStepIndex()) return 'current';
    return 'upcoming';
  }

  onStepClick(index: number): void {
    this.store.goToStep(index);
  }
}
