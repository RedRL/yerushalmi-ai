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
    descriptionHe: 'הופכים את השיר שאתם אוהבים לסרטון מרגש ומרשים שמספר את הסיפור שלכם.',
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
  'ילדים',
  'קצבי',
  'מרגש',
  'אחר',
];

export const VIDEO_SOURCE_OPTIONS: readonly PriceableOptionLike<VideoSourceId>[] = [
  { id: 'customer_videos', labelHe: 'עריכה מסרטונים אמיתיים שהלקוח מספק', descriptionHe: 'עריכה מוזיקלית מקטעי וידאו שסיפקתם.', price: 0 },
  { id: 'mixed', labelHe: 'שילוב תמונות אמיתיות ויצירת AI', descriptionHe: 'שילוב של תמונות שהועלו וסצנות AI חדשות.', price: 200 },
  { id: 'ai_only', labelHe: 'יצירת כל הוויזואליה באמצעות AI', descriptionHe: 'הסצנות נוצרות מהתיאור והסיפור, בלי צורך בתמונות.', price: 400 },
];

export const SONG_LENGTH_OPTIONS: readonly PriceableOptionLike<SongLengthId>[] = [
  { id: 'up_to_2_min', labelHe: 'כ-2 דקות', price: 0 },
  { id: 'up_to_3_min', labelHe: 'כ-3 דקות', price: 200 },
  { id: 'up_to_4_min', labelHe: 'כ-4 דקות', price: 300 },
];

export const VIDEO_LENGTH_OPTIONS: readonly PriceableOptionLike<VideoLengthId>[] = [
  { id: 'up_to_2_min', labelHe: 'כ-2 דקות', price: 0 },
  { id: 'up_to_3_min', labelHe: 'כ-3 דקות', price: 200 },
  { id: 'up_to_4_min', labelHe: 'כ-4 דקות', price: 300 },
];

export const VIDEO_FORMAT_OPTIONS: readonly PriceableOptionLike<VideoFormatId>[] = [
  { id: 'landscape', labelHe: 'אופקי 16:9', price: 0 },
  { id: 'portrait', labelHe: 'אנכי 9:16', price: 0 },
];

export const SUBTITLES_OPTIONS: readonly PriceableOptionLike<SubtitlesId>[] = [
  { id: 'none', labelHe: 'ללא כתוביות', price: 0 },
  { id: 'selected', labelHe: 'כתוביות מעוצבות', price: 80 },
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

type PriceableOptionLike<TId extends string> = SelectableOption<TId> & { price: number };
