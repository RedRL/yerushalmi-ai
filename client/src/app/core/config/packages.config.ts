import type { MainProductId } from '../../shared/models/pricing.model';

export interface PackageDefinition {
  readonly id: MainProductId;
  readonly emoji: string;
  readonly titleHe: string;
  readonly subtitleHe?: string;
  readonly descriptionHe: string;
  readonly featuresHe: readonly string[];
  readonly introPrice: number;
  readonly originalPrice: number;
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
      '✔ מילים בהתאמה אישית',
      '✔ שיר מקורי בהתאמה אישית',
      '✔ סבב תיקונים אחד',
      '✔ קובץ שמע באיכות גבוהה',
    ],
    introPrice: 290,
    originalPrice: 450,
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
      '✔ סבב תיקונים אחד',
      '✔ סרטון באיכות Full HD',
    ],
    introPrice: 990,
    originalPrice: 1400,
    ctaHe: PACKAGE_CTA_HE,
    featured: false,
  },
  {
    id: 'video_new_song',
    emoji: '👑',
    titleHe: 'החוויה המלאה',
    descriptionHe: 'מהרעיון הראשון ועד הסרטון המוגמר – כל החוויה במקום אחד.',
    featuresHe: [
      '✔ מילים בהתאמה אישית',
      '✔ שיר מקורי בהתאמה אישית',
      '✔ קליפ בהתאמה אישית',
      '✔ סבב תיקונים אחד',
      '✔ סרטון באיכות Full HD',
    ],
    introPrice: 1190,
    originalPrice: 1700,
    ctaHe: PACKAGE_CTA_HE,
    featured: true,
    recommendedBadgeHe: 'מומלץ',
  },
];

export function findPackage(id: MainProductId): PackageDefinition {
  return PACKAGE_DEFINITIONS.find((pkg) => pkg.id === id) ?? PACKAGE_DEFINITIONS[0];
}
