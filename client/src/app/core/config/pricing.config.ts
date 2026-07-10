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

export const NEW_SONG_BASE_PRICE = 890; // TODO(pricing): placeholder
export const VIDEO_BASE_PRICE = 1290; // TODO(pricing): placeholder

export const MAIN_PRODUCT_OPTIONS: readonly MainProductOption[] = [
  {
    id: 'song_only',
    titleHe: 'שיר אישי בלבד',
    descriptionHe: 'שיר מקורי שנכתב לפי האדם, הסיפור, הזיכרונות והסגנון שתבחרו.',
  },
  {
    id: 'video_existing_song',
    titleHe: 'סרטון עם שיר קיים',
    descriptionHe: 'אתם מספקים שיר קיים, ואני יוצר עבורו קליפ מבוסס תמונות, סרטונים או AI.',
  },
  {
    id: 'video_new_song',
    titleHe: 'סרטון עם שיר חדש בהתאמה אישית',
    descriptionHe: 'חבילה מלאה: כתיבת שיר אישי חדש יחד עם קליפ מוזיקלי מותאם.',
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
  { id: 'customer_photos', labelHe: 'מתמונות שהלקוח מספק', descriptionHe: 'תמונות אמיתיות שהופכות לסצנות וידאו.', price: 0 },
  { id: 'ai_only', labelHe: 'יצירת כל הוויזואליה באמצעות AI', descriptionHe: 'הסצנות נוצרות מהתיאור והסיפור, בלי צורך בתמונות.', price: 350 },
  { id: 'mixed', labelHe: 'שילוב תמונות אמיתיות ויצירת AI', descriptionHe: 'שילוב של תמונות שהועלו וסצנות AI חדשות.', price: 250 },
  { id: 'customer_videos', labelHe: 'עריכה מסרטונים אמיתיים שהלקוח מספק', descriptionHe: 'עריכה מוזיקלית מקטעי וידאו שסיפקתם.', price: 150 },
];

export const VIDEO_LENGTH_OPTIONS: readonly PriceableOptionLike<VideoLengthId>[] = [
  { id: 'up_to_1_min', labelHe: 'עד דקה', price: 0 },
  { id: 'up_to_2_min', labelHe: 'עד שתי דקות', price: 150 },
  { id: 'up_to_3_min', labelHe: 'עד שלוש דקות', price: 300 },
  { id: 'custom_length', labelHe: 'אורך מיוחד', price: 450 },
];

export const VIDEO_FORMAT_OPTIONS: readonly PriceableOptionLike<VideoFormatId>[] = [
  { id: 'landscape', labelHe: 'אופקי 16:9', price: 0 },
  { id: 'portrait', labelHe: 'אנכי 9:16', price: 0 },
  { id: 'both', labelHe: 'שני הפורמטים', price: 120 },
];

export const SUBTITLES_OPTIONS: readonly PriceableOptionLike<SubtitlesId>[] = [
  { id: 'none', labelHe: 'ללא כתוביות', price: 0 },
  { id: 'selected', labelHe: 'כתוביות נבחרות', price: 80 },
  { id: 'full', labelHe: 'כתוביות מלאות', price: 150 },
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
