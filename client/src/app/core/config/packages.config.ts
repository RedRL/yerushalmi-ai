import type { MainProductId } from '../../shared/models/pricing.model';

export interface PackageDefinition {
  readonly id: MainProductId;
  readonly emoji: string;
  readonly titleHe: string;
  readonly subtitleHe?: string;
  readonly descriptionHe: string;
  readonly featuresHe: readonly string[];
  /** Lowest package price (≈1 minute for song / full experience). */
  readonly introPrice: number;
  readonly originalPrice: number;
  /** When true, UI shows "החל מ" before the intro price. */
  readonly priceStartsFrom: boolean;
  readonly ctaHe: string;
  readonly featured: boolean;
  readonly recommendedBadgeHe?: string;
}

/** Introductory package CTA label — shared across all packages. */
export const PACKAGE_CTA_HE = 'בואו נתחיל';

export const PACKAGE_DEFINITIONS: readonly PackageDefinition[] = [
  {
    id: 'song_only',
    emoji: '🎵',
    titleHe: 'שיר אישי',
    descriptionHe:
      'שיר מקורי שנכתב והופק במיוחד עבורכם, בהשראת הסיפור, האנשים והרגעים החשובים שלכם.',
    featuresHe: [
      '✔ שיר מקורי בהתאמה אישית',
      '✔ סבב תיקונים אחד לשיר',
      '✔ מסירה עד 7 ימי עסקים',
      '✔ קובץ שמע באיכות גבוהה',
    ],
    introPrice: 200,
    originalPrice: 360,
    priceStartsFrom: true,
    ctaHe: PACKAGE_CTA_HE,
    featured: false,
  },
  {
    id: 'video_existing_song',
    emoji: '🎬',
    titleHe: 'קליפ לשיר לבחירתכם',
    descriptionHe: 'יוצרים סרטון מרגש ומרשים שמספר את הסיפור שלכם, לרקע שיר לבחירתכם.',
    featuresHe: [
      '✔ קליפ בהתאמה אישית',
      '✔ שימוש בשיר לבחירתכם',
      '✔ סבב תיקונים אחד לסרטון',
      '✔ מסירה עד 7 ימי עסקים',
      '✔ סרטון באיכות Full HD',
    ],
    introPrice: 750,
    originalPrice: 1160,
    priceStartsFrom: true,
    ctaHe: PACKAGE_CTA_HE,
    featured: false,
  },
  {
    id: 'video_new_song',
    emoji: '👑',
    titleHe: 'החוויה המלאה',
    descriptionHe: 'מהרעיון הראשון ועד הסרטון המוגמר – כל החוויה במקום אחד.',
    featuresHe: [
      '✔ שיר מקורי בהתאמה אישית',
      '✔ קליפ בהתאמה אישית',
      '✔ סבב תיקונים אחד לשיר וסבב אחד לקליפ',
      '✔ מסירה עד 7 ימי עסקים',
      '✔ סרטון באיכות Full HD',
    ],
    introPrice: 900,
    originalPrice: 1410,
    priceStartsFrom: true,
    ctaHe: PACKAGE_CTA_HE,
    featured: true,
    recommendedBadgeHe: 'מומלץ',
  },
];

export function findPackage(id: MainProductId): PackageDefinition {
  return PACKAGE_DEFINITIONS.find((pkg) => pkg.id === id) ?? PACKAGE_DEFINITIONS[0];
}
