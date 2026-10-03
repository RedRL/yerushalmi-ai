import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FIELD_LIMITS } from '../../../../../core/config/field-limits.config';
import { getSongLengthOptions, SONG_STYLE_OPTIONS, VOCALIST_OPTIONS } from '../../../../../core/config/pricing.config';
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
  readonly player = inject(StylePreviewPlayer);
  readonly styleOptions = SONG_STYLE_OPTIONS;
  readonly vocalistOptions = VOCALIST_OPTIONS;
  readonly styleTones = STYLE_TONES;
  readonly voiceTones = VOICE_TONES;
  readonly limits = FIELD_LIMITS;

  readonly optionalFields = [
    {
      id: 'mood',
      title: 'איזה מצב רוח?',
      placeholder: 'שמח, מרגש, קצבי...',
      control: 'mood',
      max: FIELD_LIMITS.mood,
    },
    {
      id: 'namesToInclude',
      title: 'שמות שחשוב שיופיעו',
      placeholder: 'הפרידו בפסיקים',
      control: 'namesToInclude',
      max: FIELD_LIMITS.namesToInclude,
    },
    {
      id: 'importantWords',
      title: 'מילים שחייבות להיכנס',
      placeholder: 'הפרידו בפסיקים',
      control: 'importantWords',
      max: FIELD_LIMITS.importantWords,
    },
    {
      id: 'excludedTopics',
      title: 'מה לא להכניס לשיר?',
      placeholder: 'הפרידו בפסיקים',
      control: 'excludedTopics',
      max: FIELD_LIMITS.excludedTopics,
    },
    {
      id: 'additionalNotes',
      title: 'עוד משהו על השיר?',
      placeholder: 'הערה קצרה',
      control: 'additionalNotes',
      max: FIELD_LIMITS.songAdditionalNotes,
    },
  ] as const;

  readonly lengthOptions = computed(() => getSongLengthOptions(this.store.mainProduct()));

  readonly lengthTitle = computed(() =>
    this.store.isFullExperience() ? 'כמה ארוכים השיר והסרטון?' : 'כמה ארוך השיר?',
  );

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
  }

  pickVoice(id: VocalistId): void {
    const alreadySelected = this.store.songForm.controls.vocalist.value === id;
    this.store.selectVocalist(id);
    if (alreadySelected) return;
    this.player.playVoice(id);
  }

  setLength(id: string): void {
    this.store.songForm.controls.length.setValue(id as SongLengthId);
    this.store.songForm.controls.length.markAsTouched();
  }
}
