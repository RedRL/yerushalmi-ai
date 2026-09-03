import { afterNextRender, ChangeDetectionStrategy, Component, computed, DestroyRef, effect, ElementRef, inject, signal, viewChild } from '@angular/core';
import { findPackage } from '../../../../../core/config/packages.config';
import { SUMMARY_TEXT_MAX_LENGTH } from '../../../../../core/config/field-limits.config';import { getSongLengthOptions, VIDEO_FORMAT_OPTIONS, VIDEO_LENGTH_OPTIONS, SUBTITLES_OPTIONS, VOCALIST_OPTIONS } from '../../../../../core/config/pricing.config';
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
  private readonly destroyRef = inject(DestroyRef);
  readonly storyDialogOpen = signal(false);
  readonly additionalNotesDialogOpen = signal(false);
  readonly storyOverflows = signal(false);
  readonly additionalNotesOverflows = signal(false);

  private readonly storyTextEl = viewChild<ElementRef<HTMLElement>>('storyTextEl');
  private readonly additionalNotesEl = viewChild<ElementRef<HTMLElement>>('additionalNotesEl');
  private resizeObserver: ResizeObserver | null = null;

  readonly productLabel = computed(() => {    const id = this.store.mainProduct();
    return id ? truncateSummaryText(findPackage(id).titleHe, SUMMARY_TEXT_MAX_LENGTH) : '—';
  });

  readonly storyText = computed(() => this.store.projectDetailsForm.controls.story.value.trim());

  readonly optionalDetailsLines = computed(() => {    const details = this.store.projectDetailsForm.getRawValue();
    const fields: { label: string; value: string }[] = [
      { label: 'גיל', value: details.age.trim() },
      { label: 'קשר', value: details.relationship.trim() },
      { label: 'תכונות אופי', value: details.characterTraits.trim() },
      { label: 'תחביבים', value: details.hobbies.trim() },
      { label: 'מקצוע', value: details.occupation.trim() },
    ];

    return fields
      .filter((field) => field.value.length > 0)
      .map((field) => ({
        label: field.label,
        value: truncateSummaryText(field.value, SUMMARY_TEXT_MAX_LENGTH),
      }));
  });

  readonly additionalNotesText = computed(() =>
    this.store.projectDetailsForm.controls.additionalNotes.value.trim(),
  );

  readonly hasOptionalDetails = computed(    () => this.optionalDetailsLines().length > 0 || this.additionalNotesText().length > 0,
  );

  readonly personNameDisplay = computed(() =>
    truncateSummaryText(this.store.projectDetailsForm.controls.personName.value, SUMMARY_TEXT_MAX_LENGTH),
  );

  readonly occasionDisplay = computed(() =>
    truncateSummaryText(this.store.projectDetailsForm.controls.occasion.value, SUMMARY_TEXT_MAX_LENGTH),
  );

  readonly eventDateDisplay = computed(() => {
    const value = this.store.projectDetailsForm.controls.eventDate.value;
    if (!value) return null;
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) return value;
    return `${match[3]}/${match[2]}/${match[1]}`;
  });

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

  readonly vocalistLabel = computed(() => {
    const id = this.store.songForm.controls.vocalist.value;
    return VOCALIST_OPTIONS.find((option) => option.id === id)?.labelHe ?? null;
  });

  readonly aiFillLabel = computed(() =>
    this.store.isAddonSelected('ai_image_fill') ? 'מילוי אוטומטי לפורמט היציאה' : null,
  );

  readonly uploadSummary = computed(() => {
    const images = this.store.uploadImageCount();
    const videos = this.store.uploadVideoCount();
    if (videos > 0) {
      return `${images} תמונות · ${videos} סרטונים`;
    }
    return `${images} תמונות`;
  });

  constructor() {
    effect(() => {
      this.storyText();
      this.additionalNotesText();
      queueMicrotask(() => this.bindOverflowObserver());
    });

    afterNextRender(() => {
      this.resizeObserver = new ResizeObserver(() => this.measureTextOverflow());
      this.bindOverflowObserver();
      this.destroyRef.onDestroy(() => this.resizeObserver?.disconnect());
    });
  }

  private bindOverflowObserver(): void {
    if (!this.resizeObserver) return;

    this.resizeObserver.disconnect();
    const story = this.storyTextEl()?.nativeElement;
    const notes = this.additionalNotesEl()?.nativeElement;
    if (story) this.resizeObserver.observe(story);
    if (notes) this.resizeObserver.observe(notes);
    this.measureTextOverflow();
  }

  private measureTextOverflow(): void {
    const story = this.storyTextEl()?.nativeElement;
    const notes = this.additionalNotesEl()?.nativeElement;

    this.storyOverflows.set(story ? story.scrollWidth > story.clientWidth + 1 : false);
    this.additionalNotesOverflows.set(notes ? notes.scrollWidth > notes.clientWidth + 1 : false);
  }

  openStoryDialog(): void {    this.storyDialogOpen.set(true);
  }

  closeStoryDialog(): void {
    this.storyDialogOpen.set(false);
  }

  openAdditionalNotesDialog(): void {
    this.additionalNotesDialogOpen.set(true);
  }

  closeAdditionalNotesDialog(): void {
    this.additionalNotesDialogOpen.set(false);
  }

  onStoryDialogWheel(event: WheelEvent): void {
    const dialog = event.currentTarget as HTMLElement;
    containScrollWheel(event, dialog.querySelector('.summary-step__dialog-body'));
  }

  onAdditionalNotesDialogWheel(event: WheelEvent): void {
    const dialog = event.currentTarget as HTMLElement;
    containScrollWheel(event, dialog.querySelector('.summary-step__dialog-body'));
  }

  goToStep(stepId: 'product' | 'song' | 'video' | 'details' | 'extras' | 'upload'): void {
    const index = this.store.visibleSteps().findIndex((step) => step.id === stepId);
    if (index >= 0) this.store.goToStep(index);
  }
}
