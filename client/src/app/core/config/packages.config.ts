import type { MainProductId } from '../../shared/models/pricing.model';
import { l10n, type L10nText } from '../i18n/locale.types';

export interface PackageDefinition {
  readonly id: MainProductId;
  readonly emoji: string;
  readonly title: L10nText;
  readonly subtitle?: L10nText;
  readonly description: L10nText;
  readonly features: readonly L10nText[];
  /** Lowest package price (≈1 minute for song / full experience). */
  readonly introPrice: number;
  readonly originalPrice: number;
  /** When true, UI shows "החל מ" / "From" before the intro price. */
  readonly priceStartsFrom: boolean;
  readonly cta: L10nText;
  readonly featured: boolean;
  readonly recommendedBadge?: L10nText;
}

/** Introductory package CTA label — shared across all packages. */
export const PACKAGE_CTA = l10n('בואו נתחיל', "Let's get started");

/** @deprecated Use `PACKAGE_CTA.he` (or the bilingual `PACKAGE_CTA`). */
export const PACKAGE_CTA_HE = PACKAGE_CTA.he;

export const PACKAGE_DEFINITIONS: readonly PackageDefinition[] = [
  {
    id: 'song_only',
    emoji: '🎵',
    title: l10n('שיר אישי', 'Personal song'),
    description: l10n(
      'שיר מקורי שנכתב והופק במיוחד עבורכם, בהשראת הסיפור, האנשים והרגעים החשובים שלכם.',
      'An original song written and produced especially for you, inspired by your story, your people and your important moments.',
    ),
    features: [
      l10n('✔ שיר מקורי בהתאמה אישית', '✔ Original, personalized song'),
      l10n('✔ סבב תיקונים אחד לשיר', '✔ One revision round for the song'),
      l10n('✔ מסירה עד 7 ימי עסקים', '✔ Delivery within 7 business days'),
      l10n('✔ קובץ שמע באיכות גבוהה', '✔ High-quality audio file'),
    ],
    introPrice: 200,
    originalPrice: 360,
    priceStartsFrom: true,
    cta: PACKAGE_CTA,
    featured: false,
  },
  {
    id: 'video_existing_song',
    emoji: '🎬',
    title: l10n('קליפ לשיר לבחירתכם', 'Video for a song of your choice'),
    description: l10n(
      'יוצרים סרטון מרגש ומרשים שמספר את הסיפור שלכם, לרקע שיר לבחירתכם.',
      'We create a moving, impressive video that tells your story, set to a song of your choice.',
    ),
    features: [
      l10n('✔ קליפ בהתאמה אישית', '✔ Personalized music video'),
      l10n('✔ שימוש בשיר לבחירתכם', '✔ Uses a song of your choice'),
      l10n('✔ סבב תיקונים אחד לסרטון', '✔ One revision round for the video'),
      l10n('✔ מסירה עד 7 ימי עסקים', '✔ Delivery within 7 business days'),
      l10n('✔ סרטון באיכות Full HD', '✔ Full HD video quality'),
    ],
    introPrice: 750,
    originalPrice: 1160,
    priceStartsFrom: true,
    cta: PACKAGE_CTA,
    featured: false,
  },
  {
    id: 'video_new_song',
    emoji: '👑',
    title: l10n('החוויה המלאה', 'The full experience'),
    description: l10n(
      'מהרעיון הראשון ועד הסרטון המוגמר – כל החוויה במקום אחד.',
      'From the first idea to the finished video — the whole experience in one place.',
    ),
    features: [
      l10n('✔ שיר מקורי בהתאמה אישית', '✔ Original, personalized song'),
      l10n('✔ קליפ בהתאמה אישית', '✔ Personalized music video'),
      l10n('✔ סבב תיקונים אחד לשיר וסבב אחד לקליפ', '✔ One revision round for the song and one for the video'),
      l10n('✔ מסירה עד 7 ימי עסקים', '✔ Delivery within 7 business days'),
      l10n('✔ סרטון באיכות Full HD', '✔ Full HD video quality'),
    ],
    introPrice: 900,
    originalPrice: 1410,
    priceStartsFrom: true,
    cta: PACKAGE_CTA,
    featured: true,
    recommendedBadge: l10n('מומלץ', 'Recommended'),
  },
];

export function findPackage(id: MainProductId): PackageDefinition {
  return PACKAGE_DEFINITIONS.find((pkg) => pkg.id === id) ?? PACKAGE_DEFINITIONS[0];
}
