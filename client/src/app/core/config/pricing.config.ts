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
  VocalistId,
} from '../../shared/models/pricing.model';
import { l10n, type L10nText, type Locale } from '../i18n/locale.types';

/** Anything with a Hebrew label and an optional English one. */
export interface LocalizedLabelSource {
  readonly labelHe: string;
  readonly labelEn?: string;
}

/**
 * Customer-facing label of a pricing option for `locale`.
 * Falls back to Hebrew when no English label exists.
 */
export function localizedOptionLabel(option: LocalizedLabelSource, locale: Locale): string {
  return locale === 'en' ? option.labelEn || option.labelHe : option.labelHe;
}

/** Customer-facing description of a pricing option for `locale`. */
export function localizedOptionDescription(
  option: { readonly descriptionHe?: string; readonly descriptionEn?: string },
  locale: Locale,
): string {
  return locale === 'en' ? option.descriptionEn || option.descriptionHe || '' : option.descriptionHe ?? '';
}

/** Customer-facing title of a main product for `locale`. */
export function localizedProductTitle(option: MainProductOption, locale: Locale): string {
  return locale === 'en' ? option.titleEn || option.titleHe : option.titleHe;
}

/** Bilingual view of an option label, for APIs that take `L10nText` (e.g. `LocaleService.tx`). */
export function optionLabelL10n(option: LocalizedLabelSource): L10nText {
  return l10n(option.labelHe, option.labelEn || option.labelHe);
}

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

/**
 * Introductory package prices for the shortest included length — keep in sync with
 * server `MAIN_PRODUCT_INTRO_PRICES`. All packages start at ~1 minute; longer lengths add a surcharge.
 */
export const MAIN_PRODUCT_INTRO_PRICES = {
  song_only: 200,
  video_existing_song: 750,
  video_new_song: 900,
} as const;

/** Original list prices shown with strikethrough in marketing UI. */
export const MAIN_PRODUCT_ORIGINAL_PRICES = {
  song_only: 360,
  video_existing_song: 1160,
  video_new_song: 1410,
} as const;

/** @deprecated Use MAIN_PRODUCT_INTRO_PRICES.song_only */
export const NEW_SONG_BASE_PRICE = MAIN_PRODUCT_INTRO_PRICES.song_only;
/** @deprecated Use MAIN_PRODUCT_INTRO_PRICES.video_existing_song */
export const VIDEO_BASE_PRICE = MAIN_PRODUCT_INTRO_PRICES.video_existing_song;

export const MAIN_PRODUCT_OPTIONS: readonly MainProductOption[] = [
  {
    id: 'song_only',
    titleHe: 'שיר אישי',
    titleEn: 'Personal song',
    descriptionHe:
      'שיר מקורי שנכתב והופק במיוחד עבורכם, בהשראת הסיפור, האנשים והרגעים החשובים שלכם.',
    descriptionEn:
      'An original song written and produced especially for you, inspired by your story, your people and your important moments.',
  },
  {
    id: 'video_existing_song',
    titleHe: 'סרטון עם שיר קיים לבחירתכם',
    titleEn: 'Video with an existing song of your choice',
    descriptionHe:
      'יוצרים סרטון מרגש ומרשים שמספר את הסיפור שלכם, לרקע שיר שכבר קיים שתבחרו — בלי כתיבת שיר חדש בהתאמה אישית.',
    descriptionEn:
      'We create a moving, impressive video that tells your story, set to an existing song you choose — not a newly written custom song.',
  },
  {
    id: 'video_new_song',
    titleHe: 'החוויה המלאה',
    titleEn: 'The full experience',
    descriptionHe:
      'מהרעיון הראשון ועד הסרטון המוגמר – כל החוויה במקום אחד.',
    descriptionEn: 'From the first idea to the finished video — the whole experience in one place.',
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
  'קאנטרי',
  'בלוז',
  'אינדי',
  'אחר',
];

/**
 * English display names for `SONG_STYLE_OPTIONS`. The Hebrew string stays the stored
 * value / identifier (it is what the backend and admin receive); this map is display-only.
 */
export const SONG_STYLE_LABELS_EN: Readonly<Record<string, string>> = {
  'פופ': 'Pop',
  'רוק': 'Rock',
  'ים תיכוני': 'Mediterranean',
  // Short form used only when the full English label would overflow a tone tile.
  'ים תיכוני__short': 'Med.',
  'בלדה': 'Ballad',
  'היפ הופ': 'Hip hop',
  'גוספל': 'Gospel',
  'קאנטרי': 'Country',
  'בלוז': 'Blues',
  'אינדי': 'Indie',
  'אחר': 'Other',
};

/** Display name of a song style (stored Hebrew value) for `locale`. */
export function localizedSongStyleLabel(style: string, locale: Locale, short = false): string {
  if (locale !== 'en') return style;
  if (short) {
    const shortLabel = SONG_STYLE_LABELS_EN[`${style}__short`];
    if (shortLabel) return shortLabel;
  }
  return SONG_STYLE_LABELS_EN[style] ?? style;
}

export const VOCALIST_OPTIONS: readonly { id: VocalistId; labelHe: string; labelEn: string }[] = [
  { id: 'male', labelHe: 'זמר', labelEn: 'Male singer' },
  { id: 'female', labelHe: 'זמרת', labelEn: 'Female singer' },
  { id: 'both', labelHe: 'שילוב של שניהם', labelEn: 'Both combined' },
];

export const VIDEO_SOURCE_OPTIONS: readonly PriceableOptionLike<VideoSourceId>[] = [
  {
    id: 'customer_photos',
    labelHe: 'עריכה מתמונות שהלקוח מספק',
    labelEn: 'Edited from photos you provide',
    descriptionHe: 'עריכה מוזיקלית מתמונות שסיפקתם.',
    descriptionEn: 'Musical editing from the photos you provided.',
    price: 0,
  },
];

export const DEFAULT_VIDEO_SOURCE: VideoSourceId = 'customer_photos';

/** Default output format for new video projects. */
export const DEFAULT_VIDEO_FORMAT: VideoFormatId = 'landscape';

/** Extra half-minute for existing-song videos and as the shared video length step. */
export const LENGTH_HALF_STEP_PRICE = 150;
/** Extra half-minute on the full experience. */
export const FULL_EXPERIENCE_LENGTH_HALF_STEP_PRICE = 150;
/** Extra half-minute on song-only projects. */
export const SONG_ONLY_LENGTH_HALF_STEP_PRICE = 50;
/**
 * Shortest selectable length for all packages.
 * Package intro prices are the "from" price for this length.
 */
export const PACKAGE_START_LENGTH_ID: VideoLengthId = 'min_1_0';
/** @deprecated Use PACKAGE_START_LENGTH_ID — all video packages now start at 1 minute. */
export const EXISTING_SONG_START_LENGTH_ID: VideoLengthId = PACKAGE_START_LENGTH_ID;
/** Default slider position — cheapest package length (~1 minute). */
export const DEFAULT_LENGTH_ID: VideoLengthId = PACKAGE_START_LENGTH_ID;

type PriceableOptionLike<TId extends string> = SelectableOption<TId> & { price: number };

export interface VideoFormatOption extends PriceableOptionLike<VideoFormatId> {
  /** CSS `aspect-ratio` value shown as a visual preview in the configurator. */
  previewAspectRatio: string;
  previewOrientation: 'landscape' | 'portrait' | 'square';
}

const LENGTH_OPTION_DEFS: readonly {
  id: VideoLengthId;
  labelHe: string;
  labelEn: string;
  /** Half-minute steps above ~1 minute. */
  halfStepsFromOneMinute: number;
}[] = [
  { id: 'min_1_0', labelHe: 'כ-1 דקה', labelEn: 'About 1 minute', halfStepsFromOneMinute: 0 },
  { id: 'min_1_5', labelHe: 'כ-1.5 דקות', labelEn: 'About 1.5 minutes', halfStepsFromOneMinute: 1 },
  { id: 'min_2_0', labelHe: 'כ-2 דקות', labelEn: 'About 2 minutes', halfStepsFromOneMinute: 2 },
  { id: 'min_2_5', labelHe: 'כ-2.5 דקות', labelEn: 'About 2.5 minutes', halfStepsFromOneMinute: 3 },
  { id: 'min_3_0', labelHe: 'כ-3 דקות', labelEn: 'About 3 minutes', halfStepsFromOneMinute: 4 },
  { id: 'min_3_5', labelHe: 'כ-3.5 דקות', labelEn: 'About 3.5 minutes', halfStepsFromOneMinute: 5 },
  { id: 'min_4_0', labelHe: 'כ-4 דקות', labelEn: 'About 4 minutes', halfStepsFromOneMinute: 6 },
  { id: 'min_4_5', labelHe: 'כ-4.5 דקות', labelEn: 'About 4.5 minutes', halfStepsFromOneMinute: 7 },
];

/** Length surcharge for N half-steps above the range minimum. */
export function lengthSurcharge(halfSteps: number, halfStepPrice: number): number {
  return halfSteps > 0 ? halfSteps * halfStepPrice : 0;
}

function buildLengthOptions(
  maxId: VideoLengthId,
  halfStepPrice = LENGTH_HALF_STEP_PRICE,
  minId: VideoLengthId = PACKAGE_START_LENGTH_ID,
): readonly PriceableOptionLike<VideoLengthId>[] {
  const minIndex = LENGTH_OPTION_DEFS.findIndex((option) => option.id === minId);
  const maxIndex = LENGTH_OPTION_DEFS.findIndex((option) => option.id === maxId);
  if (minIndex < 0 || maxIndex < 0 || maxIndex < minIndex) return [];
  const baseSteps = LENGTH_OPTION_DEFS[minIndex].halfStepsFromOneMinute;
  return LENGTH_OPTION_DEFS.slice(minIndex, maxIndex + 1).map((option) => ({
    id: option.id,
    labelHe: option.labelHe,
    labelEn: option.labelEn,
    price: lengthSurcharge(option.halfStepsFromOneMinute - baseSteps, halfStepPrice),
  }));
}

/** Existing-song video: 1–4.5 minutes in half-minute steps. */
export const VIDEO_LENGTH_OPTIONS = buildLengthOptions(
  'min_4_5',
  LENGTH_HALF_STEP_PRICE,
  PACKAGE_START_LENGTH_ID,
);

/** Full experience combined length: 1–4 minutes; package price is the 1-minute starting price. */
export const SONG_LENGTH_OPTIONS_FULL_EXPERIENCE = buildLengthOptions(
  'min_4_0',
  FULL_EXPERIENCE_LENGTH_HALF_STEP_PRICE,
  PACKAGE_START_LENGTH_ID,
);

/** Personal song only — 1–4 minutes; package price is the 1-minute starting price. */
export const SONG_LENGTH_OPTIONS = buildLengthOptions(
  'min_4_0',
  SONG_ONLY_LENGTH_HALF_STEP_PRICE,
  PACKAGE_START_LENGTH_ID,
);

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
  { id: 'landscape', labelHe: '16:9', labelEn: '16:9', price: 0, previewAspectRatio: '16 / 9', previewOrientation: 'landscape' },
  { id: 'classic', labelHe: '4:3', labelEn: '4:3', price: 0, previewAspectRatio: '4 / 3', previewOrientation: 'landscape' },
  { id: 'square', labelHe: '1:1', labelEn: '1:1', price: 0, previewAspectRatio: '1 / 1', previewOrientation: 'square' },
  { id: 'portrait', labelHe: '9:16', labelEn: '9:16', price: 0, previewAspectRatio: '9 / 16', previewOrientation: 'portrait' },
  { id: 'portrait_3_4', labelHe: '3:4', labelEn: '3:4', price: 0, previewAspectRatio: '3 / 4', previewOrientation: 'portrait' },
];

const VIDEO_FORMAT_IDS = new Set<VideoFormatId>(VIDEO_FORMAT_OPTIONS.map((option) => option.id));

export function normalizeVideoFormatId(value: string | null | undefined): VideoFormatId {
  if (value === 'portrait_feed') {
    return 'portrait_3_4';
  }

  return value && VIDEO_FORMAT_IDS.has(value as VideoFormatId) ? (value as VideoFormatId) : DEFAULT_VIDEO_FORMAT;
}

export const SUBTITLES_OPTIONS: readonly PriceableOptionLike<SubtitlesId>[] = [
  { id: 'none', labelHe: 'ללא כתוביות', labelEn: 'No subtitles', price: 0 },
  { id: 'selected', labelHe: 'כתוביות מעוצבות', labelEn: 'Styled subtitles', price: 0 },
];

/** Default subtitle text color when styled subtitles are selected. */
export const DEFAULT_SUBTITLES_COLOR = '#FFFFFF';
/** Default karaoke highlight color for the currently sung word. */
export const DEFAULT_SUBTITLES_HIGHLIGHT_COLOR = '#FFD60A';

const HEX_COLOR_PATTERN = /^#[0-9A-Fa-f]{6}$/;

export function normalizeHexColor(
  value: string | null | undefined,
  fallback: string,
): string {
  const trimmed = (value ?? '').trim();
  if (HEX_COLOR_PATTERN.test(trimmed)) return trimmed.toUpperCase();
  if (/^[0-9A-Fa-f]{6}$/.test(trimmed)) return `#${trimmed.toUpperCase()}`;
  return fallback;
}

export const ADDON_OPTIONS: readonly AddonOption[] = [
  { id: 'social_short_version', labelHe: 'גרסה קצרה לרשתות חברתיות', labelEn: 'Short version for social media', price: 150, videoOnly: true },
  { id: 'custom_intro', labelHe: 'פתיח מותאם אישית', labelEn: 'Custom intro', price: 120, videoOnly: true },
  { id: 'outro_screen', labelHe: 'מסך סיום', labelEn: 'End screen', price: 60, videoOnly: true },
  { id: 'names_dates_overlay', labelHe: 'שילוב שמות ותאריכים', labelEn: 'Names and dates overlay', price: 60, videoOnly: true },
  { id: 'extra_version', labelHe: 'גרסה נוספת', labelEn: 'Additional version', price: 200, videoOnly: false },
  { id: 'separate_audio_file', labelHe: 'מסירת קובץ אודיו נפרד', labelEn: 'Separate audio file delivery', price: 50, videoOnly: false },
  { id: 'extra_revision_round', labelHe: 'סבב תיקונים נוסף', labelEn: 'Extra revision round', price: 150, videoOnly: false },
  {
    id: 'ai_image_fill',
    labelHe: 'מילוי אוטומטי של התמונות לפורמט היציאה',
    labelEn: 'Automatic image fill for the output format',
    price: 0,
    videoOnly: true,
    selectable: false,
  },
];

/** Always applied on video products — not offered as a configurator choice. */
export const ALWAYS_INCLUDED_VIDEO_ADDONS: readonly AddonId[] = ['ai_image_fill'];

export function findAddon(id: AddonId): AddonOption | undefined {
  return ADDON_OPTIONS.find((addon) => addon.id === id);
}

export function isSelectableAddon(id: AddonId): boolean {
  return findAddon(id)?.selectable !== false;
}
