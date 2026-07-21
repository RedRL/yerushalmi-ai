import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { findPackage } from '../../../../../core/config/packages.config';
import { STORY_PREVIEW_LENGTH, SUMMARY_TEXT_MAX_LENGTH } from '../../../../../core/config/field-limits.config';
import {
  getSongLengthOptions,
  VIDEO_FORMAT_OPTIONS,
  VIDEO_LENGTH_OPTIONS,
  VIDEO_SOURCE_OPTIONS,
  SUBTITLES_OPTIONS,
} from '../../../../../core/config/pricing.config';
import { ConfiguratorStoreService } from '../../../state/configurator-store.service';
import { containScrollWheel } from '../../../../../shared/utils/contain-scroll-wheel.util';

function truncateSummaryText(value: string | null | undefined, maxLength: number): string {
  const text = (value ?? '').trim();
  if (!text) return '—';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}...`;
}

@Component({
  selector: 'app-summary-step',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './summary-step.component.html',
  styleUrl: './summary-step.component.scss',
})
export class SummaryStepComponent {
  readonly store = inject(ConfiguratorStoreService);
  readonly storyDialogOpen = signal(false);

  readonly productLabel = computed(() => {
    const id = this.store.mainProduct();
    return id ? truncateSummaryText(findPackage(id).titleHe, SUMMARY_TEXT_MAX_LENGTH) : '—';
  });

  readonly storyText = computed(() => this.store.projectDetailsForm.controls.story.value.trim());

  readonly storyPreview = computed(() => truncateSummaryText(this.storyText(), STORY_PREVIEW_LENGTH));

  readonly storyIsTruncated = computed(() => this.storyText().length > STORY_PREVIEW_LENGTH);

  readonly personNameDisplay = computed(() =>
    truncateSummaryText(this.store.projectDetailsForm.controls.personName.value, SUMMARY_TEXT_MAX_LENGTH),
  );

  readonly occasionDisplay = computed(() =>
    truncateSummaryText(this.store.projectDetailsForm.controls.occasion.value, SUMMARY_TEXT_MAX_LENGTH),
  );

  readonly existingSongDisplay = computed(() =>
    truncateSummaryText(this.store.songForm.controls.existingSongName.value, SUMMARY_TEXT_MAX_LENGTH),
  );

  readonly songLengthLabel = computed(() => {
    const lengthId = this.store.songForm.controls.length.value;
    if (!lengthId) return null;
    const options = getSongLengthOptions(this.store.mainProduct());
    const label = options.find((option) => option.id === lengthId)?.labelHe ?? null;
    return label ? truncateSummaryText(label, SUMMARY_TEXT_MAX_LENGTH) : null;
  });

  readonly sourceLabel = computed(() =>
    truncateSummaryText(
      VIDEO_SOURCE_OPTIONS.find((option) => option.id === this.store.videoForm.controls.source.value)?.labelHe,
      SUMMARY_TEXT_MAX_LENGTH,
    ),
  );

  readonly lengthLabel = computed(() =>
    truncateSummaryText(
      VIDEO_LENGTH_OPTIONS.find((option) => option.id === this.store.videoForm.controls.length.value)?.labelHe,
      SUMMARY_TEXT_MAX_LENGTH,
    ),
  );

  readonly formatLabel = computed(() =>
    truncateSummaryText(
      VIDEO_FORMAT_OPTIONS.find((option) => option.id === this.store.videoForm.controls.format.value)?.labelHe,
      SUMMARY_TEXT_MAX_LENGTH,
    ),
  );

  readonly subtitlesLabel = computed(() =>
    truncateSummaryText(
      SUBTITLES_OPTIONS.find((option) => option.id === this.store.videoForm.controls.subtitles.value)?.labelHe,
      SUMMARY_TEXT_MAX_LENGTH,
    ),
  );

  readonly videoDetailsSummary = computed(() => {
    if (!this.store.isFullExperience()) {
      return truncateSummaryText(
        `אורך: ${this.lengthLabel()} · פורמט: ${this.formatLabel()} · כתוביות: ${this.subtitlesLabel()}`,
        100,
      );
    }
    return truncateSummaryText(`פורמט: ${this.formatLabel()} · כתוביות: ${this.subtitlesLabel()}`, 100);
  });

  readonly songStyleSummary = computed(() => {
    const styles = this.store.selectedSongStyles();
    const custom = this.store.songForm.controls.customStyle.value.trim();
    const labels = [...styles.filter((style) => style !== 'אחר')];
    if (styles.includes('אחר') && custom) labels.push(custom);
    return truncateSummaryText(labels.length > 0 ? labels.join(', ') : '', SUMMARY_TEXT_MAX_LENGTH);
  });

  openStoryDialog(): void {
    this.storyDialogOpen.set(true);
  }

  closeStoryDialog(): void {
    this.storyDialogOpen.set(false);
  }

  onStoryDialogWheel(event: WheelEvent): void {
    const dialog = event.currentTarget as HTMLElement;
    containScrollWheel(event, dialog.querySelector('.summary-step__dialog-body'));
  }

  goToStep(stepId: 'product' | 'song' | 'video' | 'details' | 'extras' | 'upload'): void {
    const index = this.store.visibleSteps().findIndex((step) => step.id === stepId);
    if (index >= 0) this.store.goToStep(index);
  }
}
