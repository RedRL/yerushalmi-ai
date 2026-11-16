import { afterNextRender, ChangeDetectionStrategy, Component, computed, DestroyRef, effect, ElementRef, inject, signal, viewChild } from '@angular/core';
import { findPackage } from '../../../../../core/config/packages.config';
import { SUMMARY_TEXT_MAX_LENGTH } from '../../../../../core/config/field-limits.config';
import {
  getSongLengthOptions,
  localizedOptionLabel,
  localizedSongStyleLabel,
  VIDEO_FORMAT_OPTIONS,
  VIDEO_LENGTH_OPTIONS,
  SUBTITLES_OPTIONS,
  VOCALIST_OPTIONS,
} from '../../../../../core/config/pricing.config';
import { LocaleService } from '../../../../../core/i18n/locale.service';
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
  readonly i18n = inject(LocaleService);
  private readonly destroyRef = inject(DestroyRef);
  readonly storyDialogOpen = signal(false);
  readonly additionalNotesDialogOpen = signal(false);
  readonly storyOverflows = signal(false);
  readonly additionalNotesOverflows = signal(false);

  private readonly storyTextEl = viewChild<ElementRef<HTMLElement>>('storyTextEl');
  private readonly additionalNotesEl = viewChild<ElementRef<HTMLElement>>('additionalNotesEl');
  private resizeObserver: ResizeObserver | null = null;

  readonly productLabel = computed(() => {    const id = this.store.mainProduct();
    return id ? truncateSummaryText(this.i18n.tx(findPackage(id).title), SUMMARY_TEXT_MAX_LENGTH) : '—';
  });

  readonly storyText = computed(() => this.store.projectDetailsForm.controls.story.value.trim());

  readonly optionalDetailsLines = computed(() => {    const details = this.store.projectDetailsForm.getRawValue();
    const fields: { id: string; label: string; value: string }[] = [
      { id: 'age', label: this.i18n.t('extras.age'), value: details.age.trim() },
      { id: 'relationship', label: this.i18n.t('summary.relationship'), value: details.relationship.trim() },
      { id: 'traits', label: this.i18n.t('extras.traits'), value: details.characterTraits.trim() },
      { id: 'hobbies', label: this.i18n.t('extras.hobbies'), value: details.hobbies.trim() },
      { id: 'occupation', label: this.i18n.t('summary.occupation'), value: details.occupation.trim() },
    ];

    return fields
      .filter((field) => field.value.length > 0)
      .map((field) => ({
        id: field.id,
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
    truncateSummaryText(this.store.occasionLabel(), SUMMARY_TEXT_MAX_LENGTH),
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
    const found = options.find((option) => option.id === lengthId);
    const label = found ? localizedOptionLabel(found, this.i18n.locale()) : null;
    return label ? truncateSummaryText(label, SUMMARY_TEXT_MAX_LENGTH) : null;
  });

  readonly lengthLabel = computed(() =>
    truncateSummaryText(
      this.localizedLabel(
        VIDEO_LENGTH_OPTIONS.find((option) => option.id === this.store.videoForm.controls.length.value),
      ),
      SUMMARY_TEXT_MAX_LENGTH,
    ),
  );

  readonly formatLabel = computed(() =>
    truncateSummaryText(
      this.localizedLabel(
        VIDEO_FORMAT_OPTIONS.find((option) => option.id === this.store.videoForm.controls.format.value),
      ),
      SUMMARY_TEXT_MAX_LENGTH,
    ),
  );

  readonly subtitlesLabel = computed(() =>
    truncateSummaryText(
      this.localizedLabel(
        SUBTITLES_OPTIONS.find((option) => option.id === this.store.videoForm.controls.subtitles.value),
      ),
      SUMMARY_TEXT_MAX_LENGTH,
    ),
  );

  readonly karaokeLabel = computed(() => {
    const style = this.store.subtitleStyle();
    if (!style.hasSubtitles) return null;
    return style.karaoke
      ? `${this.i18n.t('video.karaoke.onTitle')} — ${this.i18n.t('video.karaoke.onHint')}`
      : this.i18n.t('video.karaoke.offTitle');
  });

  readonly subtitlesColorLabel = computed(() => {
    const style = this.store.subtitleStyle();
    return style.hasSubtitles ? style.color : null;
  });

  readonly subtitlesHighlightColorLabel = computed(() => {
    const style = this.store.subtitleStyle();
    return style.hasSubtitles && style.karaoke ? style.highlightColor : null;
  });

  readonly videoNotesLabel = computed(() => {
    const notes = this.store.subtitleStyle().notes;
    return notes ? truncateSummaryText(notes, SUMMARY_TEXT_MAX_LENGTH) : null;
  });

  readonly songStyleSummary = computed(() => {
    const styles = this.store.selectedSongStyles();
    const custom = this.store.songForm.controls.customStyle.value.trim();
    const locale = this.i18n.locale();
    const labels = styles
      .filter((style) => style !== 'אחר')
      .map((style) => localizedSongStyleLabel(style, locale));
    if (styles.includes('אחר') && custom) labels.push(custom);
    return truncateSummaryText(labels.length > 0 ? labels.join(', ') : '', SUMMARY_TEXT_MAX_LENGTH);
  });

  readonly vocalistLabel = computed(() => {
    const id = this.store.songForm.controls.vocalist.value;
    const option = VOCALIST_OPTIONS.find((candidate) => candidate.id === id);
    return option ? localizedOptionLabel(option, this.i18n.locale()) : null;
  });

  private localizedLabel(option: { labelHe: string; labelEn?: string } | undefined): string | undefined {
    return option ? localizedOptionLabel(option, this.i18n.locale()) : undefined;
  }

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
