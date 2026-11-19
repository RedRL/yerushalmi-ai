import { L10nText, l10n } from '../../core/i18n/locale.types';
import type {
  HomeCreationMethod,
  HomeCreationStageMessage,
  HomeProcessStepMessage,
} from '../home/home.messages';

/**
 * Bilingual marketing + wedding-configurator copy for `/weddings`.
 * Process / creation structure mirrors HOME_MESSAGES; pricing & hero are wedding-specific.
 */

export interface WeddingsCreationStageMessage {
  step: number;
  title: L10nText;
  description: L10nText;
  method: HomeCreationMethod;
  methodLabel: L10nText;
}

export const WEDDINGS_MESSAGES = {
  hero: {
    bannerAlt: l10n(
      'YERUSHALMI.AI — קליפ מוזיקלי להקרנה בחתונה שלכם',
      'YERUSHALMI.AI — a musical clip to screen at your wedding',
    ),
    scrollAria: l10n('גלילה לתוכן הבא', 'Scroll to next section'),
    scrollLabel: l10n('גללו מטה', 'Scroll down'),
    kicker: l10n('קליפי חתונה אישיים · YERUSHALMI.AI', 'Personal wedding clips · YERUSHALMI.AI'),
    headlineLine1: l10n('הסיפור שלכם', 'Your story'),
    headlineLine2: l10n('הופך לקליפ', 'becomes a clip'),
    headlineAccent: l10n('לחתונה שלא שוכחים', 'for a wedding you never forget'),
    subtitle: l10n(
      'קליפ מוזיקלי אישי שנבנה מהתמונות ומהסיפור שלכם — מוקרן באולם החתונה, אחרי החופה.',
      'A personal music video built from your photos and story — screened at the wedding hall, after the ceremony.',
    ),
    ctaPrimary: l10n('בנו את הקליפ שלכם', 'Build your clip'),
    ctaSecondary: l10n('צפו בדוגמה', 'Watch an example'),
  },

  demo: {
    eyebrow: l10n('דוגמה', 'Example'),
    heading: l10n('סרטון לדוגמה', 'Example video'),
    subtitle: l10n(
      'הנה דוגמה לקליפ חתונה בסגנון שלנו — כדי שתרגישו את האווירה לפני שמתחילים.',
      'Here is an example of a wedding clip in our style — so you can feel the vibe before you begin.',
    ),
    label: l10n('סרטון דוגמה', 'Example video'),
    videoTitleHe: l10n('בייבילישס — דוגמת קליפ חתונה', 'Babylicious — wedding clip example'),
    videoTitleEn: l10n('Babylicious — wedding clip example', 'Babylicious — wedding clip example'),
  },

  process: {
    eyebrow: l10n('התהליך', 'The Process'),
    heading: l10n('האם זה מסובך?', 'Is it complicated?'),
    subtitle: l10n(
      'לא. ארבעה שלבים ברורים — בוחרים, מספרים, שולחים, ואנחנו חוזרים אליכם.',
      'Not at all. Four clear steps — you choose, you tell us, you send, and we get back to you.',
    ),
    steps: [
      {
        step: 1,
        title: l10n('בוחרים את סוג הפרויקט', 'Choose your project type'),
        description: l10n(
          'שיר לחופה, קליפ, או שילוב מלא של שיר וקליפ לחתונה.',
          'A song for the chuppah, a clip, or the full wedding song-and-video package.',
        ),
      },
      {
        step: 2,
        title: l10n('מתאימים את האפשרויות', 'Customize your options'),
        description: l10n(
          'בוחרים סגנון מוזיקלי, סוג וידאו, כתוביות, אורך ותוספות.',
          'Pick a musical style, video type, subtitles, length and add-ons.',
        ),
      },
      {
        step: 3,
        title: l10n('שולחים פרטים וחומרים', 'Send details and materials'),
        description: l10n(
          'מספיקות תמונות ותיאור קצר של הסיפור שלכם — אנחנו בונים את הקליפ מהתמונות עצמן.',
          'A few photos and a short description of your story are enough — we build the video from the photos themselves.',
        ),
      },
      {
        step: 4,
        title: l10n('אנחנו עוברים על הבקשה', 'We review your request'),
        description: l10n(
          'לאחר מעבר על החומרים והפרטים, אנחנו חוזרים אליכם לאישור סופי. העבודה תימסר עד שבעה ימי עסקים ממועד האישור שלנו שהעבודה החלה.',
          'After reviewing the materials and details, we get back to you for final approval. Your work will be delivered within seven business days from the date we confirm that work has begun.',
        ),
      },
    ] satisfies HomeProcessStepMessage[],
  },

  creation: {
    eyebrow: l10n('שקיפות', 'Transparency'),
    heading: l10n('איך באמת נוצר קליפ כזה?', 'How is a video like this really made?'),
    subtitle: l10n(
      'בינה מלאכותית יכולה לעשות היום הרבה מאוד. אבל כדי ליצור קליפ כזה צריך לשלב כלים שונים — וגם עבודה ידנית מדויקת.',
      'Artificial intelligence can do a great deal today. But creating a video like this takes a combination of different tools — plus precise manual work.',
    ),
    methodLabels: {
      manual: l10n('ידני', 'Manual'),
      ai: l10n('כלי AI', 'AI tools'),
      hybrid: l10n('AI + ידני', 'AI + manual'),
    },
    stages: [
      {
        step: 1,
        title: l10n('כתיבת השיר', 'Writing the song'),
        description: l10n(
          'השיר נכתב גם באמצעות כלי AI. נכתבת סקיצה ראשונית לשיר, שמתבססת על המידע שסיפקתם. כלי AI לא מתמחים כיום בכתיבת שירים, ולכן נדרשת גם התערבות וכתיבה ידנית. עם ידע וניסיון רב בכתיבה והלחנת שירים — זה חלק שאנחנו מתערבים בו בעצמנו, וברמה גבוהה.',
          'The song is written partly with AI tools. A first draft is created based on the information you provided. AI tools are not yet specialized in songwriting, so manual intervention and writing are also required. With extensive knowledge and experience in writing and composing songs, this is a part we handle ourselves, to a high standard.',
        ),
        method: 'hybrid',
        methodLabel: l10n('AI + ידני', 'AI + manual'),
      },
      {
        step: 2,
        title: l10n('הלחנה', 'Composition'),
        description: l10n(
          'תהליך ההלחנה נעשה באמצעות כלי AI. גם כאן התוצאות דורשות פעמים רבות תיקונים והתערבות ידנית, עד שהשיר מרגיש מדויק.',
          'The composition process is done with AI tools. Here too, the results often require corrections and manual intervention until the song feels just right.',
        ),
        method: 'hybrid',
        methodLabel: l10n('AI + ידני', 'AI + manual'),
      },
      {
        step: 3,
        title: l10n('עריכת התמונות', 'Photo editing'),
        description: l10n(
          'התמונות שאתם שולחים עוברות עריכה בכלי AI. אפשר גם לשלוח תמונות ישנות בשחור-לבן — והן יקבלו צבע. כל התמונות מותאמות לפורמט שנבחר, כולל מילוי אוטומטי של הקצוות באמצעות כלי AI.',
          'The photos you send are edited with AI tools. You can even send old black-and-white photos — and they will be colorized. All photos are adapted to the chosen format, including automatic edge filling with AI tools.',
        ),
        method: 'ai',
        methodLabel: l10n('כלי AI', 'AI tools'),
      },
      {
        step: 4,
        title: l10n('הנפשה', 'Animation'),
        description: l10n(
          'התמונות מונפשות באמצעות כלי AI שונים, והופכות לסצנות וידאו. גם כאן יש תהליך ידני: אנחנו בוחרים אילו תמונות מתאימות להיות מונפשות יחד.',
          'The photos are animated using various AI tools and turned into video scenes. Here too there is a manual process: we choose which photos work well animated together.',
        ),
        method: 'hybrid',
        methodLabel: l10n('AI + ידני', 'AI + manual'),
      },
      {
        step: 5,
        title: l10n('עריכת הווידאו', 'Video editing'),
        description: l10n(
          'התוכן של הסרטונים מותאם לשיר עצמו. זה תהליך ידני: אנחנו בוחרים תוכן שיתאים למילות השיר ולמוזיקה במקום המתאים.',
          'The content of the clips is matched to the song itself. This is a manual process: we choose content that fits the lyrics and the music at the right moment.',
        ),
        method: 'manual',
        methodLabel: l10n('ידני', 'Manual'),
      },
      {
        step: 6,
        title: l10n('כתוביות', 'Subtitles'),
        description: l10n(
          'הכתוביות נוצרות רק באמצעות כלי AI — מותאמות לקצב ולמילים של השיר.',
          'Subtitles are created using AI tools only — timed to the rhythm and lyrics of the song.',
        ),
        method: 'ai',
        methodLabel: l10n('כלי AI', 'AI tools'),
      },
    ] satisfies HomeCreationStageMessage[],
  },

  pricing: {
    eyebrow: l10n('חבילות לחתונה', 'Wedding packages'),
    heading: l10n(
      'בחרו איך להפוך את הסיפור שלכם לקליפ לחתונה',
      'Choose how to turn your story into a wedding clip',
    ),
    subtitle: l10n(
      'שיר לחופה, קליפ מרגש, או החוויה המלאה — בחרו את החבילה שמתאימה לכם.',
      'A song for the chuppah, a moving clip, or the full experience — choose the package that fits you.',
    ),
  },
} as const;

export type WeddingsMessages = typeof WEDDINGS_MESSAGES;
