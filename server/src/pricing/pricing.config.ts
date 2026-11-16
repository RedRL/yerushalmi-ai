import type {
  AddonId,
  MainProductId,
  SubtitlesId,
  VideoFormatId,
  VideoLengthId,
  VideoSourceId,
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
export const NEW_SONG_BASE_PRICE = 200;

/** Charged when the request includes any video creation. @deprecated */
export const VIDEO_BASE_PRICE = 750;

/**
 * Package prices for the shortest included length.
 * All packages start at ~1 minute; longer lengths add a surcharge.
 */
export const MAIN_PRODUCT_INTRO_PRICES: Record<MainProductId, number> = {
  song_only: 200,
  video_existing_song: 750,
  video_new_song: 900,
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
  customer_photos: { labelHe: 'עריכה מתמונות שהלקוח מספק', price: 0 },
  customer_videos: { labelHe: 'עריכה מתמונות שהלקוח מספק', price: 0 },
  mixed: { labelHe: 'שילוב חלקי של סרטוני AI שלא ממה שסיפק הלקוח', price: 100 },
  ai_only: { labelHe: 'רוב או כל הסרטון מסרטוני AI שלא מהחומרים שסיפק הלקוח', price: 200 },
};

/** Extra half-minute for existing-song videos and as the shared video length step. */
export const LENGTH_HALF_STEP_PRICE = 150;
/** Extra half-minute on the full experience. */
export const FULL_EXPERIENCE_LENGTH_HALF_STEP_PRICE = 150;
/** Extra half-minute on song-only projects. */
export const SONG_ONLY_LENGTH_HALF_STEP_PRICE = 50;
/** Shortest selectable length for all packages. */
export const PACKAGE_START_LENGTH_ID: VideoLengthId = 'min_1_0';
/** @deprecated Use PACKAGE_START_LENGTH_ID — all video packages now start at 1 minute. */
export const EXISTING_SONG_START_LENGTH_ID: VideoLengthId = PACKAGE_START_LENGTH_ID;

const LENGTH_PRICE_DEFS: readonly {
  id: VideoLengthId;
  labelHe: string;
  /** Half-minute steps above ~1 minute. */
  halfStepsFromOneMinute: number;
}[] = [
  { id: 'min_1_0', labelHe: 'כ-1 דקה', halfStepsFromOneMinute: 0 },
  { id: 'min_1_5', labelHe: 'כ-1.5 דקות', halfStepsFromOneMinute: 1 },
  { id: 'min_2_0', labelHe: 'כ-2 דקות', halfStepsFromOneMinute: 2 },
  { id: 'min_2_5', labelHe: 'כ-2.5 דקות', halfStepsFromOneMinute: 3 },
  { id: 'min_3_0', labelHe: 'כ-3 דקות', halfStepsFromOneMinute: 4 },
  { id: 'min_3_5', labelHe: 'כ-3.5 דקות', halfStepsFromOneMinute: 5 },
  { id: 'min_4_0', labelHe: 'כ-4 דקות', halfStepsFromOneMinute: 6 },
  { id: 'min_4_5', labelHe: 'כ-4.5 דקות', halfStepsFromOneMinute: 7 },
];

/** Length surcharge for N half-steps above the range minimum. */
export function lengthSurcharge(halfSteps: number, halfStepPrice: number): number {
  return halfSteps > 0 ? halfSteps * halfStepPrice : 0;
}

function buildLengthPrices(
  maxId: VideoLengthId,
  halfStepPrice = LENGTH_HALF_STEP_PRICE,
  minId: VideoLengthId = PACKAGE_START_LENGTH_ID,
): Partial<Record<VideoLengthId, { labelHe: string; price: number }>> {
  const minIndex = LENGTH_PRICE_DEFS.findIndex((option) => option.id === minId);
  const maxIndex = LENGTH_PRICE_DEFS.findIndex((option) => option.id === maxId);
  if (minIndex < 0 || maxIndex < 0 || maxIndex < minIndex) return {};
  const baseSteps = LENGTH_PRICE_DEFS[minIndex].halfStepsFromOneMinute;
  return LENGTH_PRICE_DEFS.slice(minIndex, maxIndex + 1).reduce(
    (acc, option) => {
      acc[option.id] = {
        labelHe: option.labelHe,
        price: lengthSurcharge(option.halfStepsFromOneMinute - baseSteps, halfStepPrice),
      };
      return acc;
    },
    {} as Partial<Record<VideoLengthId, { labelHe: string; price: number }>>,
  );
}

/** Personal song only — 1–4 minutes; package price is the 1-minute starting price. */
export const SONG_LENGTH_PRICES = buildLengthPrices(
  'min_4_0',
  SONG_ONLY_LENGTH_HALF_STEP_PRICE,
  PACKAGE_START_LENGTH_ID,
);

/** Full experience combined length: 1–4 minutes; package price is the 1-minute starting price. */
export const SONG_LENGTH_FULL_EXPERIENCE_PRICES = buildLengthPrices(
  'min_4_0',
  FULL_EXPERIENCE_LENGTH_HALF_STEP_PRICE,
  PACKAGE_START_LENGTH_ID,
);

export function usesCombinedSongVideoLength(mainProduct: MainProductId): boolean {
  return mainProduct === 'video_new_song';
}

/** Existing-song video: 1–4.5 minutes in half-minute steps. */
export const VIDEO_LENGTH_PRICES = buildLengthPrices(
  'min_4_5',
  LENGTH_HALF_STEP_PRICE,
  PACKAGE_START_LENGTH_ID,
);

export const VIDEO_FORMAT_PRICES: Record<VideoFormatId, { labelHe: string; price: number }> = {
  landscape: { labelHe: '16:9', price: 0 },
  portrait: { labelHe: '9:16', price: 0 },
  portrait_3_4: { labelHe: '3:4', price: 0 },
  classic: { labelHe: '4:3', price: 0 },
  square: { labelHe: '1:1', price: 0 },
  both: { labelHe: 'שני הפורמטים', price: 0 },
};

export const SUBTITLES_PRICES: Record<SubtitlesId, { labelHe: string; price: number }> = {
  none: { labelHe: 'ללא כתוביות', price: 0 },
  selected: { labelHe: 'כתוביות מעוצבות', price: 0 },
  full: { labelHe: 'כתוביות מלאות', price: 0 },
};

export const ADDON_CONFIG: Record<AddonId, { labelHe: string; price: number }> = {
  social_short_version: { labelHe: 'גרסה קצרה לרשתות חברתיות', price: 150 }, // TODO(pricing): placeholder
  custom_intro: { labelHe: 'פתיח מותאם אישית', price: 120 }, // TODO(pricing): placeholder
  outro_screen: { labelHe: 'מסך סיום', price: 60 }, // TODO(pricing): placeholder
  names_dates_overlay: { labelHe: 'שילוב שמות ותאריכים', price: 60 }, // TODO(pricing): placeholder
  extra_version: { labelHe: 'גרסה נוספת', price: 200 }, // TODO(pricing): placeholder
  separate_audio_file: { labelHe: 'מסירת קובץ אודיו נפרד', price: 50 }, // TODO(pricing): placeholder
  extra_revision_round: { labelHe: 'סבב תיקונים נוסף', price: 150 }, // TODO(pricing): placeholder
  ai_image_fill: { labelHe: 'מילוי אוטומטי של התמונות לפורמט היציאה', price: 0 },
};

/** Reserved for future use - VAT is not applied to estimates in Milestone 1. */
export const VAT_RATE = 0;
