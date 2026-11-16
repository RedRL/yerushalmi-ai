import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, computed, effect, inject, viewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FIELD_LIMITS } from '../../../../../core/config/field-limits.config';
import {
  getSongLengthOptions,
  localizedOptionLabel,
  localizedSongStyleLabel,
  SONG_STYLE_OPTIONS,
  VOCALIST_OPTIONS,
} from '../../../../../core/config/pricing.config';
import { LocaleService } from '../../../../../core/i18n/locale.service';
import type { UiMessageKey } from '../../../../../core/i18n/messages';
import type { SongLengthId, VocalistId } from '../../../../../shared/models/pricing.model';
import { STYLE_TONES, VOICE_TONES } from '../../../experience/experience.config';
import { StylePreviewPlayer } from '../../../experience/style-preview-player.service';
import { ConfiguratorStoreService } from '../../../state/configurator-store.service';
import { LengthSliderComponent } from '../../length-slider/length-slider.component';
import { WizardScreenComponent } from '../../wizard-screen/wizard-screen.component';

@Component({
  selector: 'app-song-step',
  imports: [ReactiveFormsModule, WizardScreenComponent, LengthSliderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './song-step.component.html',
  styleUrl: './song-step.component.scss',
})
export class SongStepComponent {
  readonly store = inject(ConfiguratorStoreService);
  readonly i18n = inject(LocaleService);
  readonly player = inject(StylePreviewPlayer);
  readonly styleOptions = SONG_STYLE_OPTIONS;
  readonly vocalistOptions = VOCALIST_OPTIONS;
  readonly styleTones = STYLE_TONES;
  readonly voiceTones = VOICE_TONES;
  readonly limits = FIELD_LIMITS;
  private readonly customStyleInput = viewChild<ElementRef<HTMLInputElement>>('customStyleInput');

  readonly optionalFields = [
    {
      id: 'mood',
      titleKey: 'song.field.mood.title',
      placeholderKey: 'song.field.mood.placeholder',
      control: 'mood',
      max: FIELD_LIMITS.mood,
    },
    {
      id: 'namesToInclude',
      titleKey: 'song.field.names.title',
      placeholderKey: 'song.field.commaSeparated',
      control: 'namesToInclude',
      max: FIELD_LIMITS.namesToInclude,
    },
    {
      id: 'importantWords',
      titleKey: 'song.field.words.title',
      placeholderKey: 'song.field.commaSeparated',
      control: 'importantWords',
      max: FIELD_LIMITS.importantWords,
    },
    {
      id: 'excludedTopics',
      titleKey: 'song.field.excluded.title',
      placeholderKey: 'song.field.commaSeparated',
      control: 'excludedTopics',
      max: FIELD_LIMITS.excludedTopics,
    },
    {
      id: 'additionalNotes',
      titleKey: 'song.field.notes.title',
      placeholderKey: 'song.field.notes.placeholder',
      control: 'additionalNotes',
      max: FIELD_LIMITS.songAdditionalNotes,
    },
  ] as const satisfies readonly {
    id: string;
    titleKey: UiMessageKey;
    placeholderKey: UiMessageKey;
    control: string;
    max: number;
  }[];

  readonly lengthOptions = computed(() => getSongLengthOptions(this.store.mainProduct()));

  readonly lengthTitle = computed(() =>
    this.i18n.t(this.store.isFullExperience() ? 'song.length.headingCombined' : 'song.length.heading'),
  );

  styleLabel(style: string): string {
    return localizedSongStyleLabel(style, this.i18n.locale());
  }

  styleLabelShort(style: string): string {
    return localizedSongStyleLabel(style, this.i18n.locale(), true);
  }

  styleHasShort(style: string): boolean {
    if (!this.i18n.isEnglish()) return false;
    const full = localizedSongStyleLabel(style, 'en');
    const short = localizedSongStyleLabel(style, 'en', true);
    return short !== full;
  }

  vocalistLabel(option: { labelHe: string; labelEn?: string }): string {
    return localizedOptionLabel(option, this.i18n.locale());
  }

  constructor() {
    effect(() => {
      this.store.activeScreen().field;
      this.player.stop();
    });
    inject(DestroyRef).onDestroy(() => this.player.stop());
  }

  screenIndex(): number {
    return this.store.subStepPosition();
  }

  screenTotal(): number {
    return this.store.currentScreens().length;
  }

  linkReady(): boolean {
    return this.store.acceptsExistingSongLink(this.store.songForm.controls.existingSongLink.value);
  }

  pickStyle(style: string): void {
    const alreadySelected = this.store.isSongStyleSelected(style);
    this.store.toggleSongStyle(style);
    if (alreadySelected) {
      if (this.player.playingId() === `style:${style}`) this.player.stop();
      return;
    }
    this.player.playStyle(style);
    if (style === 'אחר') {
      setTimeout(() => this.scrollCustomStyleIntoView());
    }
  }

  private scrollCustomStyleIntoView(): void {
    const input = this.customStyleInput()?.nativeElement;
    if (!input) return;
    const scroller = input.closest('.configurator__body');
    if (!(scroller instanceof HTMLElement)) return;

    const inputRect = input.getBoundingClientRect();
    const scrollerRect = scroller.getBoundingClientRect();
    const padding = 12;
    if (inputRect.top >= scrollerRect.top + padding && inputRect.bottom <= scrollerRect.bottom - padding) {
      return;
    }

    const delta = inputRect.bottom > scrollerRect.bottom - padding
      ? inputRect.bottom - (scrollerRect.bottom - padding)
      : inputRect.top - (scrollerRect.top + padding);
    scroller.scrollTo({ top: scroller.scrollTop + delta, behavior: 'smooth' });
  }

  pickVoice(id: VocalistId): void {
    const alreadySelected = this.store.songForm.controls.vocalist.value === id;
    if (alreadySelected) {
      this.store.clearVocalist();
      this.player.stop();
      return;
    }
    this.store.selectVocalist(id);
    this.player.playVoice(id);
  }

  setLength(id: string): void {
    this.store.songForm.controls.length.setValue(id as SongLengthId);
    this.store.songForm.controls.length.markAsTouched();
  }
}
