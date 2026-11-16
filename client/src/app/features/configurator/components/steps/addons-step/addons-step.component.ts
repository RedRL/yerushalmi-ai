import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { localizedOptionLabel } from '../../../../../core/config/pricing.config';
import { LocaleService } from '../../../../../core/i18n/locale.service';
import type { AddonId, AddonOption } from '../../../../../shared/models/pricing.model';
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
  readonly i18n = inject(LocaleService);

  addonLabel(addon: AddonOption): string {
    return localizedOptionLabel(addon, this.i18n.locale());
  }

  readonly relevantAddons = computed(() =>
    this.store.addonOptions.filter(
      (addon) =>
        addon.selectable !== false && (this.store.includesVideo() || !addon.videoOnly),
    ),
  );

  isSelected(id: AddonId): boolean {
    return this.store.addons().includes(id);
  }

  toggle(id: AddonId): void {
    this.store.toggleAddon(id);
  }
}
