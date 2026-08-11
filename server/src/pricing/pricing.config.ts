import type {
  AddonId,
  MainProductId,
  SubtitlesId,
  VideoFormatId,
  VideoLengthId,
  VideoSourceId,
  SongLengthId,
} from './pricing.types';

/**
 * Centralized pricing configuration - the single source of truth for the API.
 *
 * ⚠️ TODO(pricing): All amounts below are TEMPORARY PLACEHOLDER VALUES for
 * development only. The real business has not supplied final prices yet.
 * Replace the numbers in this file once pricing is finalized. Do not add
 * prices anywhere else in the codebase.
 *
 * All amounts are in ILS (₪) and VAT-exclusive.
 */

export const CURRENCY = 'ILS' as const;

/** Charged when the request includes a brand new personal song. @deprecated */
export const NEW_SONG_BASE_PRICE = 290;

/** Charged when the request includes any video creation. @deprecated */
export const VIDEO_BASE_PRICE = 990;

export const MAIN_PRODUCT_INTRO_PRICES: Record<MainProductId, number> = {
  song_only: 290,
  video_existing_song: 990,
  video_new_song: 1190,
};

export const MAIN_PRODUCT_LABELS: Record<MainProductId, string> = {
  song_only: 'שיר אישי',
  video_existing_song: 'סרטון עם שיר לבחירתכם',
  video_new_song: 'החוויה המלאה',
};

/** Whether a given main product requires a newly written song. */
export const PRODUCT_INCLUDES_NEW_SONG: Record<MainProductId, boolean> = {
  song_only: true,
  video_existing_song: false,
  video_new_song: true,
};

/** Whether a given main product includes video creation. */
export const PRODUCT_INCLUDES_VIDEO: Record<MainProductId, boolean> = {
  song_only: false,
  video_existing_song: true,
  video_new_song: true,
};

export const VIDEO_SOURCE_PRICES: Record<VideoSourceId, { labelHe: string; price: number }> = {
  customer_photos: { labelHe: 'מתמונות שהלקוח מספק', price: 0 },
  customer_videos: { labelHe: 'עריכה מתמונות ו/או סרטונים אמיתיים שהלקוח מספק', price: 0 },
  mixed: { labelHe: 'שילוב חלקי של סרטוני AI שלא ממה שסיפק הלקוח', price: 100 },
  ai_only: { labelHe: 'רוב או כל הסרטון מסרטוני AI שלא מהחומרים שסיפק הלקוח', price: 200 },
};

export const LENGTH_HALF_STEP_PRICE = 120;

const LENGTH_PRICE_DEFS: readonly {
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

function buildLengthPrices(maxId: VideoLengthId): Record<VideoLengthId, { labelHe: string; price: number }> {
  const maxIndex = LENGTH_PRICE_DEFS.findIndex((option) => option.id === maxId);
  return LENGTH_PRICE_DEFS.slice(0, maxIndex + 1).reduce(
    (acc, option) => {
      acc[option.id] = {
        labelHe: option.labelHe,
        price: option.halfStepsFromBase * LENGTH_HALF_STEP_PRICE,
      };
      return acc;
    },
    {} as Record<VideoLengthId, { labelHe: string; price: number }>,
  );
}

export const SONG_LENGTH_PRICES = buildLengthPrices('min_2_0') as Record<SongLengthId, { labelHe: string; price: number }>;

export const SONG_LENGTH_FULL_EXPERIENCE_PRICES = buildLengthPrices('min_3_5') as Record<
  SongLengthId,
  { labelHe: string; price: number }
>;

export function usesCombinedSongVideoLength(mainProduct: MainProductId): boolean {
  return mainProduct === 'video_new_song';
}

export const VIDEO_LENGTH_PRICES = buildLengthPrices('min_4_5');

export const VIDEO_FORMAT_PRICES: Record<VideoFormatId, { labelHe: string; price: number }> = {
  landscape: { labelHe: 'אופקי 16:9', price: 0 }, // TODO(pricing): placeholder
  portrait: { labelHe: 'אנכי 9:16', price: 0 }, // TODO(pricing): placeholder
  both: { labelHe: 'שני הפורמטים', price: 120 }, // TODO(pricing): placeholder
};

export const SUBTITLES_PRICES: Record<SubtitlesId, { labelHe: string; price: number }> = {
  none: { labelHe: 'ללא כתוביות', price: 0 },
  selected: { labelHe: 'כתוביות מעוצבות', price: 80 },
  full: { labelHe: 'כתוביות מלאות', price: 150 },
};

export const ADDON_CONFIG: Record<AddonId, { labelHe: string; price: number }> = {
  social_short_version: { labelHe: 'גרסה קצרה לרשתות חברתיות', price: 150 }, // TODO(pricing): placeholder
  custom_intro: { labelHe: 'פתיח מותאם אישית', price: 120 }, // TODO(pricing): placeholder
  outro_screen: { labelHe: 'מסך סיום', price: 60 }, // TODO(pricing): placeholder
  names_dates_overlay: { labelHe: 'שילוב שמות ותאריכים', price: 60 }, // TODO(pricing): placeholder
  extra_version: { labelHe: 'גרסה נוספת', price: 200 }, // TODO(pricing): placeholder
  separate_audio_file: { labelHe: 'מסירת קובץ אודיו נפרד', price: 50 }, // TODO(pricing): placeholder
  extra_revision_round: { labelHe: 'סבב תיקונים נוסף', price: 150 }, // TODO(pricing): placeholder
};

/** Reserved for future use - VAT is not applied to estimates in Milestone 1. */
export const VAT_RATE = 0;
