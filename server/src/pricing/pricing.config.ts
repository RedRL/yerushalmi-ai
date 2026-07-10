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

/** Charged when the request includes a brand new personal song. */
export const NEW_SONG_BASE_PRICE = 890; // TODO(pricing): placeholder

/** Charged when the request includes any video creation. */
export const VIDEO_BASE_PRICE = 1290; // TODO(pricing): placeholder

export const MAIN_PRODUCT_LABELS: Record<MainProductId, string> = {
  song_only: 'שיר אישי בלבד',
  video_existing_song: 'סרטון עם שיר קיים',
  video_new_song: 'סרטון עם שיר חדש בהתאמה אישית',
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
  customer_photos: { labelHe: 'מתמונות שהלקוח מספק', price: 0 }, // TODO(pricing): placeholder
  ai_only: { labelHe: 'יצירת כל הוויזואליה באמצעות AI', price: 350 }, // TODO(pricing): placeholder
  mixed: { labelHe: 'שילוב תמונות אמיתיות ויצירת AI', price: 250 }, // TODO(pricing): placeholder
  customer_videos: { labelHe: 'עריכה מסרטונים אמיתיים שהלקוח מספק', price: 150 }, // TODO(pricing): placeholder
};

export const VIDEO_LENGTH_PRICES: Record<VideoLengthId, { labelHe: string; price: number }> = {
  up_to_1_min: { labelHe: 'עד דקה', price: 0 }, // TODO(pricing): placeholder
  up_to_2_min: { labelHe: 'עד שתי דקות', price: 150 }, // TODO(pricing): placeholder
  up_to_3_min: { labelHe: 'עד שלוש דקות', price: 300 }, // TODO(pricing): placeholder
  custom_length: { labelHe: 'אורך מיוחד', price: 450 }, // TODO(pricing): placeholder
};

export const VIDEO_FORMAT_PRICES: Record<VideoFormatId, { labelHe: string; price: number }> = {
  landscape: { labelHe: 'אופקי 16:9', price: 0 }, // TODO(pricing): placeholder
  portrait: { labelHe: 'אנכי 9:16', price: 0 }, // TODO(pricing): placeholder
  both: { labelHe: 'שני הפורמטים', price: 120 }, // TODO(pricing): placeholder
};

export const SUBTITLES_PRICES: Record<SubtitlesId, { labelHe: string; price: number }> = {
  none: { labelHe: 'ללא כתוביות', price: 0 }, // TODO(pricing): placeholder
  selected: { labelHe: 'כתוביות נבחרות', price: 80 }, // TODO(pricing): placeholder
  full: { labelHe: 'כתוביות מלאות', price: 150 }, // TODO(pricing): placeholder
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
