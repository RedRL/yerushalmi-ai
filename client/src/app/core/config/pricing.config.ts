import type {
  AddonId,
  AddonOption,
  MainProductId,
  MainProductOption,
  SelectableOption,
  SubtitlesId,
  VideoFormatId,
  VideoLengthId,
  VideoSourceId,
  SongLengthId,
} from '../../shared/models/pricing.model';

/**
 * Frontend pricing configuration - used ONLY to render an immediate, friendly
 * price estimate while the customer configures their project.
 *
 * ⚠️ THE BACKEND IS THE SOURCE OF TRUTH. `server/src/pricing/pricing.config.ts`
 * recalculates the final trusted price from option identifiers alone and
 * ignores any total sent by the client. Keep the identifiers (the `id` /
 * record keys below) in sync with the backend file - the amounts are
 * duplicated here purely for optimistic UI and may briefly drift from the
 * backend until prices are finalized.
 *
 * ⚠️ TODO(pricing): All amounts below are TEMPORARY PLACEHOLDER VALUES. The
 * real business has not supplied final prices yet. Replace the numbers in
 * this file (and the matching backend file) once pricing is finalized.
 */

export const CURRENCY_SYMBOL = '₪';

/** Introductory package prices — keep in sync with server `MAIN_PRODUCT_INTRO_PRICES`. */
export const MAIN_PRODUCT_INTRO_PRICES = {
  song_only: 290,
  video_existing_song: 990,
  video_new_song: 1190,
} as const;

/** Original list prices shown with strikethrough in marketing UI. */
export const MAIN_PRODUCT_ORIGINAL_PRICES = {
  song_only: 450,
  video_existing_song: 1400,
  video_new_song: 1700,
} as const;

/** @deprecated Use MAIN_PRODUCT_INTRO_PRICES.song_only */
export const NEW_SONG_BASE_PRICE = MAIN_PRODUCT_INTRO_PRICES.song_only;
/** @deprecated Use MAIN_PRODUCT_INTRO_PRICES.video_existing_song */
export const VIDEO_BASE_PRICE = MAIN_PRODUCT_INTRO_PRICES.video_existing_song;

export const MAIN_PRODUCT_OPTIONS: readonly MainProductOption[] = [
  {
    id: 'song_only',
    titleHe: 'שיר אישי',
    descriptionHe:
      'שיר מקורי שנכתב והופק במיוחד עבורכם, בהשראת הסיפור, האנשים והרגעים החשובים שלכם.',
  },
  {
    id: 'video_existing_song',
    titleHe: 'סרטון עם שיר לבחירתכם',
    descriptionHe: 'יוצרים סרטון מרגש ומרשים שמספר את הסיפור שלכם, לרקע שיר לבחירתכם.',
  },
  {
    id: 'video_new_song',
    titleHe: 'החוויה המלאה',
    descriptionHe: 'מהרעיון הראשון ועד הסרטון המוגמר – כל החוויה במקום אחד.',
  },
];

export const PRODUCT_INCLUDES_NEW_SONG: Record<MainProductId, boolean> = {
  song_only: true,
  video_existing_song: false,
  video_new_song: true,
};

export const PRODUCT_INCLUDES_VIDEO: Record<MainProductId, boolean> = {
  song_only: false,
  video_existing_song: true,
  video_new_song: true,
};

export const SONG_STYLE_OPTIONS: readonly string[] = [
  'פופ',
  'רוק',
  'ים תיכוני',
  'בלדה',
  'היפ הופ',
  'גוספל',
  'קצבי',
  'מרגש',
  'אחר',
];

export const VIDEO_SOURCE_OPTIONS: readonly PriceableOptionLike<VideoSourceId>[] = [
  {
    id: 'customer_videos',
    labelHe: 'עריכה מתמונות ו/או סרטונים אמיתיים שהלקוח מספק',
    descriptionHe: 'עריכה מוזיקלית מתמונות וקטעי וידאו שסיפקתם.',
    price: 0,
  },
];

export const DEFAULT_VIDEO_SOURCE: VideoSourceId = 'customer_videos';

/** Default output format for new video projects. */
export const DEFAULT_VIDEO_FORMAT: VideoFormatId = 'landscape';

export const LENGTH_HALF_STEP_PRICE = 120;

export const DEFAULT_LENGTH_ID: VideoLengthId = 'min_2_0';

type PriceableOptionLike<TId extends string> = SelectableOption<TId> & { price: number };

export interface VideoFormatOption extends PriceableOptionLike<VideoFormatId> {
  /** CSS `aspect-ratio` value shown as a visual preview in the configurator. */
  previewAspectRatio: string;
  previewOrientation: 'landscape' | 'portrait' | 'square';
}

const LENGTH_OPTION_DEFS: readonly {
  id: VideoLengthId;
  labelHe: string;
  halfStepsFromBase: number;
}[] = [
  { id: 'min_2_0', labelHe: 'כ-2 דקות', halfStepsFromBase: 0 },
  { id: 'min_2_5', labelHe: 'כ-2.5 דקות', halfStepsFromBase: 1 },
  { id: 'min_3_0', labelHe: 'כ-3 דקות', halfStepsFromBase: 2 },
  { id: 'min_3_5', labelHe: 'כ-3.5 דקות', halfStepsFromBase: 3 },
  { id: 'min_4_0', labelHe: 'כ-4 דקות', halfStepsFromBase: 4 },
  { id: 'min_4_5', labelHe: 'כ-4.5 דקות', halfStepsFromBase: 5 },
];

function buildLengthOptions(maxId: VideoLengthId): readonly PriceableOptionLike<VideoLengthId>[] {
  const maxIndex = LENGTH_OPTION_DEFS.findIndex((option) => option.id === maxId);
  if (maxIndex < 0) return [];
  return LENGTH_OPTION_DEFS.slice(0, maxIndex + 1).map((option) => ({
    id: option.id,
    labelHe: option.labelHe,
    price: option.halfStepsFromBase * LENGTH_HALF_STEP_PRICE,
  }));
}

function buildFreeLengthOptions(maxId: VideoLengthId): readonly PriceableOptionLike<VideoLengthId>[] {
  return buildLengthOptions(maxId).map((option) => ({ ...option, price: 0 }));
}

/** Existing-song video: 2–4.5 minutes in half-minute steps. */
export const VIDEO_LENGTH_OPTIONS = buildLengthOptions('min_4_5');

/** Full experience combined length: 2–3 minutes in half-minute steps. */
export const SONG_LENGTH_OPTIONS_FULL_EXPERIENCE = buildLengthOptions('min_3_0');

/** Personal song only — 2–3 minutes, no surcharge. */
export const SONG_LENGTH_OPTIONS = buildFreeLengthOptions('min_3_0');

export function getSongLengthOptions(
  mainProduct: MainProductId | null,
): readonly PriceableOptionLike<SongLengthId>[] {
  return mainProduct === 'video_new_song' ? SONG_LENGTH_OPTIONS_FULL_EXPERIENCE : SONG_LENGTH_OPTIONS;
}

export function getVideoLengthOptions(
  _mainProduct: MainProductId | null,
): readonly PriceableOptionLike<VideoLengthId>[] {
  return VIDEO_LENGTH_OPTIONS;
}

export function getSongLengthPrice(mainProduct: MainProductId, lengthId: SongLengthId): number {
  const options =
    mainProduct === 'video_new_song' ? SONG_LENGTH_OPTIONS_FULL_EXPERIENCE : SONG_LENGTH_OPTIONS;
  return options.find((option) => option.id === lengthId)?.price ?? 0;
}

export function getVideoLengthPrice(lengthId: VideoLengthId): number {
  return VIDEO_LENGTH_OPTIONS.find((option) => option.id === lengthId)?.price ?? 0;
}

export function usesCombinedSongVideoLength(mainProduct: MainProductId | null): boolean {
  return mainProduct === 'video_new_song';
}

export const LEGACY_LENGTH_ID_MAP: Record<string, VideoLengthId> = {
  up_to_2_min: 'min_2_0',
  up_to_3_min: 'min_3_0',
  up_to_4_min: 'min_4_0',
};

export function normalizeLengthId(value: string | null | undefined): VideoLengthId | '' {
  if (!value) return '';
  if (LEGACY_LENGTH_ID_MAP[value]) return LEGACY_LENGTH_ID_MAP[value];
  return LENGTH_OPTION_DEFS.some((option) => option.id === value) ? (value as VideoLengthId) : '';
}

export const VIDEO_FORMAT_OPTIONS: readonly VideoFormatOption[] = [
  { id: 'landscape', labelHe: '16:9', price: 0, previewAspectRatio: '16 / 9', previewOrientation: 'landscape' },
  { id: 'classic', labelHe: '4:3', price: 0, previewAspectRatio: '4 / 3', previewOrientation: 'landscape' },
  { id: 'square', labelHe: '1:1', price: 0, previewAspectRatio: '1 / 1', previewOrientation: 'square' },
  { id: 'portrait', labelHe: '9:16', price: 0, previewAspectRatio: '9 / 16', previewOrientation: 'portrait' },
  { id: 'portrait_3_4', labelHe: '3:4', price: 0, previewAspectRatio: '3 / 4', previewOrientation: 'portrait' },
];

const VIDEO_FORMAT_IDS = new Set<VideoFormatId>(VIDEO_FORMAT_OPTIONS.map((option) => option.id));

export function normalizeVideoFormatId(value: string | null | undefined): VideoFormatId {
  if (value === 'portrait_feed') {
    return 'portrait_3_4';
  }

  return value && VIDEO_FORMAT_IDS.has(value as VideoFormatId) ? (value as VideoFormatId) : DEFAULT_VIDEO_FORMAT;
}

export const SUBTITLES_OPTIONS: readonly PriceableOptionLike<SubtitlesId>[] = [
  { id: 'none', labelHe: 'ללא כתוביות', price: 0 },
  { id: 'selected', labelHe: 'כתוביות מעוצבות', price: 120 },
];

export const ADDON_OPTIONS: readonly AddonOption[] = [
  { id: 'social_short_version', labelHe: 'גרסה קצרה לרשתות חברתיות', price: 150, videoOnly: true },
  { id: 'custom_intro', labelHe: 'פתיח מותאם אישית', price: 120, videoOnly: true },
  { id: 'outro_screen', labelHe: 'מסך סיום', price: 60, videoOnly: true },
  { id: 'names_dates_overlay', labelHe: 'שילוב שמות ותאריכים', price: 60, videoOnly: true },
  { id: 'extra_version', labelHe: 'גרסה נוספת', price: 200, videoOnly: false },
  { id: 'separate_audio_file', labelHe: 'מסירת קובץ אודיו נפרד', price: 50, videoOnly: false },
  { id: 'extra_revision_round', labelHe: 'סבב תיקונים נוסף', price: 150, videoOnly: false },
];

export function findAddon(id: AddonId): AddonOption | undefined {
  return ADDON_OPTIONS.find((addon) => addon.id === id);
}
