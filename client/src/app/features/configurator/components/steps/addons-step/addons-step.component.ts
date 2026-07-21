import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import type { AddonId } from '../../../../../shared/models/pricing.model';
import { ConfiguratorStoreService } from '../../../state/configurator-store.service';

@Component({
  selector: 'app-addons-step',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './addons-step.component.html',
  styleUrl: './addons-step.component.scss',
})
export class AddonsStepComponent {
  readonly store = inject(ConfiguratorStoreService);

  readonly relevantAddons = computed(() =>
    this.store.addonOptions.filter((addon) => this.store.includesVideo() || !addon.videoOnly),
  );

  isSelected(id: AddonId): boolean {
    return this.store.addons().includes(id);
  }

  toggle(id: AddonId): void {
    this.store.toggleAddon(id);
  }
}
