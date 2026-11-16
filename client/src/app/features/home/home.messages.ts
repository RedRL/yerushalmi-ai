import { L10nText, l10n } from '../../core/i18n/locale.types';

/**
 * Bilingual UI messages for the home page: hero + services, process,
 * creation-process (transparency) and pricing section headings/content.
 */

export interface HomeServiceMessage {
  id: string;
  title: L10nText;
  description: L10nText;
}

export interface HomeProcessStepMessage {
  step: number;
  title: L10nText;
  description: L10nText;
}

export type HomeCreationMethod = 'manual' | 'ai' | 'hybrid';

export interface HomeCreationStageMessage {
  step: number;
  title: L10nText;
  description: L10nText;
  method: HomeCreationMethod;
  methodLabel: L10nText;
}

export const HOME_MESSAGES = {
  hero: {
    bannerAlt: l10n(
      'YERUSHALMI.AI — שיר אישי וקליפ מוזיקלי מתמונות ליום הולדת, חתונה ומתנה, וגם סתם לאדם שאוהבים',
      'YERUSHALMI.AI — a personal song and music video made from photos, for birthdays, weddings and gifts, or just for someone you love',
    ),
    scrollAria: l10n('גלילה לתוכן הבא', 'Scroll to next section'),
    scrollLabel: l10n('גללו מטה', 'Scroll down'),
    kicker: l10n('שירים וקליפים אישיים · YERUSHALMI.AI', 'Personal songs & music videos · YERUSHALMI.AI'),
    headlineLine1: l10n('הופכים זיכרונות', 'Turning memories'),
    headlineLine2: l10n('לשיר ולקליפ', 'into a song and a video'),
    headlineAccent: l10n('שלא שוכחים', 'you will never forget'),
    subtitle: l10n(
      'שיר אישי וקליפ מוזיקלי שנבנים מהתמונות ומהסיפור שלכם. מתנה ליום הולדת, לחתונה, לבר ובת מצווה ולמשפחה, וגם סתם לאדם שאוהבים, בלי שום סיבה מיוחדת 😊. מספיקות תמונות ותיאור קצר, ואנחנו כותבים את השיר ובונים את הקליפ מהתמונות עצמן.',
      'A personal song and music video built from your photos and your story. A gift for a birthday, a wedding, a Bar/Bat Mitzvah or the whole family — or just for someone you love, for no special reason at all 😊. A few photos and a short description are all you need: we write the song and build the video from the photos themselves.',
    ),
    ctaPrimary: l10n('בנו את הפרויקט שלכם', 'Build your project'),
    ctaSecondary: l10n('צפו בדוגמאות', 'See examples'),
  },

  services: {
    eyebrow: l10n('השירותים', 'Services'),
    heading: l10n('מה אפשר ליצור?', 'What can we create?'),
    subtitle: l10n(
      'שיר, קליפ, או שניהם — בוחרים מה שמתאים לכם, בלי לחץ ובלי מונחים מסובכים.',
      'A song, a music video, or both — choose what suits you, with no pressure and no complicated jargon.',
    ),
    highlightTag: l10n('החבילה המלאה', 'The full package'),
    highlightCta: l10n('בנו הצעת מחיר לחבילה הזו', 'Get a quote for this package'),
    cta: l10n('בנו הצעת מחיר', 'Get a quote'),
    items: [
      {
        id: 'song-only',
        title: l10n('שיר אישי בלבד', 'Personal song only'),
        description: l10n(
          'שיר מקורי שנכתב לפי האדם, הסיפור, הזיכרונות והסגנון שתבחרו.',
          'An original song written around the person, the story, the memories and the style you choose.',
        ),
      },
      {
        id: 'video-existing-song',
        title: l10n('קליפ עם שיר קיים', 'Music video for an existing song'),
        description: l10n(
          'אתם מספקים שיר קיים, ואנחנו יוצרים עבורו קליפ המבוסס על תמונות או סצנות שנוצרות באמצעות AI.',
          'You provide an existing song, and we create a music video for it based on photos or AI-generated scenes.',
        ),
      },
      {
        id: 'video-new-song',
        title: l10n('קליפ עם שיר אישי חדש', 'Music video with a new personal song'),
        description: l10n(
          'חבילה מלאה הכוללת כתיבה ויצירה של שיר אישי יחד עם קליפ מוזיקלי מותאם.',
          'A complete package that includes writing and producing a personal song together with a tailored music video.',
        ),
      },
      {
        id: 'video-photos',
        title: l10n('קליפ מתמונות אמיתיות', 'Music video from real photos'),
        description: l10n(
          'תמונות שהלקוח מספק הופכות לסצנות וידאו קולנועיות ומרגשות.',
          'Photos supplied by the customer are turned into cinematic, moving video scenes.',
        ),
      },
      {
        id: 'video-ai',
        title: l10n('קליפ AI מלא', 'Full AI music video'),
        description: l10n(
          'הוויזואליה נוצרת מאפס בהתאם לסיפור, לקונספט ולאווירה הרצויה.',
          'The visuals are created from scratch to fit the story, the concept and the mood you want.',
        ),
      },
    ] satisfies HomeServiceMessage[],
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
          'שיר, קליפ או שילוב מלא של שיר וקליפ.',
          'A song, a music video, or the full combination of both.',
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
          'מספיקות תמונות ותיאור קצר — אנחנו בונים את הקליפ מהתמונות עצמן, יחד עם כל הפרטים החשובים.',
          'A few photos and a short description are enough — we build the video from the photos themselves, along with all the important details.',
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
          'התמונות שאתם שולחים עוברות עריכה בכלי AI. אפשר גם לשלוח תמונות ישנות בשחור-לבן של יקיריכם — והן יקבלו צבע. כל התמונות מותאמות לפורמט שנבחר, כולל מילוי אוטומטי של הקצוות באמצעות כלי AI. אם תרצו, תוכלו לקבל גם את התמונות הערוכות — ללא תוספת תשלום.',
          'The photos you send are edited with AI tools. You can even send old black-and-white photos of your loved ones — and they will be colorized. All photos are adapted to the chosen format, including automatic edge filling with AI tools. If you wish, you can also receive the edited photos — at no extra charge.',
        ),
        method: 'ai',
        methodLabel: l10n('כלי AI', 'AI tools'),
      },
      {
        step: 4,
        title: l10n('הנפשה', 'Animation'),
        description: l10n(
          'התמונות מונפשות באמצעות כלי AI שונים, והופכות לסצנות וידאו. גם כאן יש תהליך ידני: אנחנו בוחרים אילו תמונות מתאימות להיות מונפשות יחד — לכדי סרטון אחד שמשלב שתי תמונות.',
          'The photos are animated using various AI tools and turned into video scenes. Here too there is a manual process: we choose which photos work well animated together — into a single clip that combines two images.',
        ),
        method: 'hybrid',
        methodLabel: l10n('AI + ידני', 'AI + manual'),
      },
      {
        step: 5,
        title: l10n('עריכת הווידאו', 'Video editing'),
        description: l10n(
          'התוכן של הסרטונים מותאם לשיר עצמו. זה תהליך ידני: אנחנו בוחרים תוכן שיתאים למילות השיר ולמוזיקה במקום המתאים, עורכים אפקטים ומבצעים התאמות כדי שהסרטונים ישולבו יחד כמו שצריך.',
          'The content of the clips is matched to the song itself. This is a manual process: we choose content that fits the lyrics and the music at the right moment, edit effects and make adjustments so the clips blend together seamlessly.',
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
    eyebrow: l10n('חבילות', 'Packages'),
    heading: l10n(
      'בחרו איך תרצו להפוך את הרעיון שלכם למתנה בלתי נשכחת',
      'Choose how you want to turn your idea into an unforgettable gift',
    ),
    subtitle: l10n(
      'מתאים לאירועים, למשפחה, לחברות ולארגונים, וגם סתם לאדם שאוהבים, בלי שום סיבה מיוחדת 😊.',
      'Perfect for events, family, friends and organizations — or just for someone you love, for no special reason at all 😊.',
    ),
  },
};
