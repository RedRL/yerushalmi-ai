import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MAIN_PRODUCT_OPTIONS, VIDEO_FORMAT_OPTIONS, VIDEO_LENGTH_OPTIONS, VIDEO_SOURCE_OPTIONS, SUBTITLES_OPTIONS, findAddon } from '../../../../../core/config/pricing.config';
import { PriceSummaryComponent } from '../../../../../shared/components/price-summary/price-summary.component';
import { ConfiguratorStoreService } from '../../../state/configurator-store.service';

@Component({
  selector: 'app-summary-step',
  imports: [PriceSummaryComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './summary-step.component.html',
  styleUrl: './summary-step.component.scss',
})
export class SummaryStepComponent {
  readonly store = inject(ConfiguratorStoreService);

  readonly productLabel = computed(
    () => MAIN_PRODUCT_OPTIONS.find((option) => option.id === this.store.mainProduct())?.titleHe ?? '—',
  );

  readonly sourceLabel = computed(
    () => VIDEO_SOURCE_OPTIONS.find((option) => option.id === this.store.videoForm.controls.source.value)?.labelHe,
  );

  readonly lengthLabel = computed(
    () => VIDEO_LENGTH_OPTIONS.find((option) => option.id === this.store.videoForm.controls.length.value)?.labelHe,
  );

  readonly formatLabel = computed(
    () => VIDEO_FORMAT_OPTIONS.find((option) => option.id === this.store.videoForm.controls.format.value)?.labelHe,
  );

  readonly subtitlesLabel = computed(
    () => SUBTITLES_OPTIONS.find((option) => option.id === this.store.videoForm.controls.subtitles.value)?.labelHe,
  );

  readonly addonLabels = computed(() =>
    this.store.addons().map((id) => findAddon(id)?.labelHe ?? id),
  );

  goToStep(stepId: 'product' | 'song' | 'video' | 'addons' | 'details' | 'upload'): void {
    const index = this.store.visibleSteps().findIndex((step) => step.id === stepId);
    if (index >= 0) this.store.goToStep(index);
  }
}
