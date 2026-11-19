import type { PackageDefinition } from './packages.config';
import { PACKAGE_CTA } from './packages.config';
import { l10n } from '../i18n/locale.types';

/** Wedding-specific package copy (same product IDs / prices as clips). */
export const WEDDING_PACKAGE_DEFINITIONS: readonly PackageDefinition[] = [
  {
    id: 'song_only',
    emoji: '🎵',
    title: l10n('שיר אישי', 'Personal song'),
    description: l10n(
      'שיר מקורי בהתאמה אישית — יכול להיות השיר שיתנגן תחת החופה, או מתנה מוזיקלית לערב.',
      'An original personalized song — perfect as a custom piece played under the chuppah, or a musical gift for the evening.',
    ),
    features: [
      l10n('✔ שיר מקורי בהתאמה אישית', '✔ Original, personalized song'),
      l10n('✔ מתאים לניגון תחת החופה', '✔ Suitable to play under the chuppah'),
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
    title: l10n('קליפ לשיר קיים לבחירתכם', 'Video for an existing song of your choice'),
    description: l10n(
      'יוצרים סרטון מרגש שמספר את הסיפור שלכם, לרקע שיר שכבר קיים שתבחרו — בלי כתיבת שיר חדש בהתאמה אישית.',
      'A moving video that tells your story, set to an existing song you choose — not a newly written custom song.',
    ),
    features: [
      l10n('✔ קליפ בהתאמה אישית', '✔ Personalized music video'),
      l10n('✔ שימוש בשיר קיים לבחירתכם', '✔ Uses an existing song of your choice'),
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
    emoji: '💍',
    title: l10n('החוויה המלאה', 'The full experience'),
    description: l10n(
      'שיר מקורי וקליפ מוזיקלי לחתונה — מהרעיון ועד הסרטון המוגמר.',
      'An original song and wedding music video — from the first idea to the finished clip.',
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
    recommendedBadge: l10n('מומלץ לחתונה', 'Recommended'),
  },
];
