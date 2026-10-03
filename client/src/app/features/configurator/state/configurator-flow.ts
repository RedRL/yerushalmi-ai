import type { MainProductId } from '../../../shared/models/pricing.model';
import type { ConfiguratorStepId } from '../configurator.model';

export type StoryField = 'personName' | 'occasion' | 'story' | 'eventDate';
export type SongField = 'styles' | 'vocalist' | 'length' | 'optional' | 'existingSongName' | 'existingSongLink';
export type VideoField = 'length' | 'format' | 'subtitles' | 'fill';
export type ExtrasField = 'who' | 'how' | 'notes';

export interface FlowScreen {
  field?: StoryField | SongField | VideoField | ExtrasField;
  skippable: boolean;
}

const STORY_SCREENS: readonly FlowScreen[] = [
  { field: 'personName', skippable: false },
  { field: 'occasion', skippable: false },
  { field: 'story', skippable: false },
  { field: 'eventDate', skippable: true },
];

const NEW_SONG_SCREENS: readonly FlowScreen[] = [
  { field: 'styles', skippable: false },
  { field: 'vocalist', skippable: false },
  { field: 'length', skippable: false },
  { field: 'optional', skippable: false },
];

const EXISTING_SONG_SCREENS: readonly FlowScreen[] = [
  { field: 'existingSongName', skippable: false },
  { field: 'existingSongLink', skippable: false },
];

const VIDEO_SCREENS: readonly FlowScreen[] = [
  { field: 'length', skippable: false },
  { field: 'format', skippable: false },
  { field: 'subtitles', skippable: false },
  { field: 'fill', skippable: false },
];

const FULL_EXPERIENCE_VIDEO_SCREENS: readonly FlowScreen[] = [
  { field: 'format', skippable: false },
  { field: 'subtitles', skippable: false },
  { field: 'fill', skippable: false },
];

export function screensForStep(
  step: ConfiguratorStepId | undefined,
  product: MainProductId | null,
): readonly FlowScreen[] {
  switch (step) {
    case 'details':
      return STORY_SCREENS;
    case 'song':
      if (product === 'video_existing_song') return EXISTING_SONG_SCREENS;
      if (product === 'song_only' || product === 'video_new_song') return NEW_SONG_SCREENS;
      return [{ skippable: true }];
    case 'video':
      return product === 'video_new_song' ? FULL_EXPERIENCE_VIDEO_SCREENS : VIDEO_SCREENS;
    case 'extras':
      return [
        { field: 'who', skippable: false },
        { field: 'how', skippable: false },
        { field: 'notes', skippable: false },
      ];
    default:
      return [{ skippable: false }];
  }
}
