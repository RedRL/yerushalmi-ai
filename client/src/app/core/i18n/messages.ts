import { l10n, type L10nText } from './locale.types';

/**
 * Bilingual (he / en) UI messages for shared chrome and the configurator.
 *
 * Conventions:
 * - Flat, dot-separated keys: `<area>.<name>` (e.g. `header.cta`, `config.next`).
 * - Interpolation uses `{name}` tokens (e.g. `{count}`); callers replace them at runtime.
 * - Newlines (`\n`) are preserved where the source Hebrew used them.
 */
export const UI_MESSAGES = {
  // ---------------------------------------------------------------------------
  // Site / brand
  // ---------------------------------------------------------------------------
  'site.tagline': l10n('קליפים מוזיקליים ושירים בהתאמה אישית', 'Custom music videos & personalized songs'),
  'site.title': l10n(
    'YERUSHALMI.AI | קליפים מוזיקליים ושירים בהתאמה אישית',
    'YERUSHALMI.AI | Custom Music Videos & Personalized Songs',
  ),
  'site.description': l10n(
    'קליפים מוזיקליים אישיים, שירים מקוריים וסרטוני AI שנוצרים מתמונות, סיפורים ורגעים מיוחדים. לאירועים, למשפחה, לחברות ולארגונים, וגם סתם לאדם שאוהבים, בלי שום סיבה מיוחדת 😊.',
    'Personal music videos, original songs and AI films created from your photos, stories and special moments. For events, families, companies and organizations — or simply for someone you love, for no special reason at all 😊.',
  ),
  'site.whatsappDefaultMessage': l10n(
    'היי, אשמח לקבל פרטים על יצירת קליפ או שיר אישי דרך YERUSHALMI.AI',
    "Hi, I'd love to get details about creating a personal music video or song with YERUSHALMI.AI",
  ),

  // ---------------------------------------------------------------------------
  // Language switcher
  // ---------------------------------------------------------------------------
  'language.switchToHe': l10n('עברית', 'עברית'),
  'language.switchToEn': l10n('English', 'English'),
  'language.switchAria': l10n('החלפת שפה', 'Change language'),
  'language.switchToHeAria': l10n('מעבר לעברית', 'Switch to Hebrew'),
  'language.switchToEnAria': l10n('מעבר לאנגלית', 'Switch to English'),

  // ---------------------------------------------------------------------------
  // Header
  // ---------------------------------------------------------------------------
  'header.cta': l10n('התחילו ליצור', 'Start creating'),
  'header.navAria': l10n('ניווט ראשי', 'Main navigation'),
  'header.mobileNavAria': l10n('ניווט ראשי - נייד', 'Main navigation - mobile'),
  'header.menuOpen': l10n('פתיחת תפריט ניווט', 'Open navigation menu'),
  'header.menuClose': l10n('סגירת תפריט ניווט', 'Close navigation menu'),
  'header.backdropClose': l10n('סגירת תפריט', 'Close menu'),
  // Label of the language toggle: always the OTHER language, written in that language.
  'header.langSwitch': l10n('English', 'עברית'),
  // Aria label of the language toggle (describes the action in the current language).
  'header.langSwitchAria': l10n('החלפת שפה לאנגלית', 'Switch language to Hebrew'),
  'header.currencySwitchAria': l10n('החלפת מטבע', 'Switch currency'),

  // ---------------------------------------------------------------------------
  // Navigation links (NAV_LINKS)
  // ---------------------------------------------------------------------------
  'nav.portfolio': l10n('דוגמאות', 'Examples'),
  'nav.howItWorks': l10n('איך זה עובד', 'How it works'),
  'nav.transparency': l10n('שקיפות', 'Transparency'),
  'nav.pricing': l10n('חבילות', 'Packages'),
  'nav.configurator': l10n('בניית הפרויקט', 'Build your project'),
  'nav.contact': l10n('יצירת קשר', 'Contact'),

  // ---------------------------------------------------------------------------
  // Footer
  // ---------------------------------------------------------------------------
  'footer.mailLabel': l10n('מייל -', 'Email -'),
  'footer.whatsappAria': l10n('פתיחת שיחת וואטסאפ עם YERUSHALMI.AI', 'Open a WhatsApp chat with YERUSHALMI.AI'),
  'footer.rights': l10n('כל הזכויות שמורות.', 'All rights reserved.'),
  'footer.terms': l10n('תקנון', 'Terms'),

  // ---------------------------------------------------------------------------
  // Common
  // ---------------------------------------------------------------------------
  'common.optional': l10n('רשות', 'Optional'),
  'common.optionalParen': l10n('(רשות)', '(optional)'),
  'common.optionalSkipHint': l10n('רשות. אפשר להמשיך גם בלי למלא.', 'Optional. You can continue without filling this in.'),
  'common.edit': l10n('עריכה', 'Edit'),
  'common.close': l10n('סגירה', 'Close'),
  'common.skip': l10n('דלג', 'Skip'),
  'common.continue': l10n('המשך', 'Continue'),
  'common.showMore': l10n('הצג עוד', 'Show more'),
  'common.included': l10n('כלול', 'Included'),
  'common.today': l10n('היום', 'Today'),
  'common.other': l10n('אחר', 'Other'),
  'common.imagesCount': l10n('{count} תמונות', '{count} images'),
  'common.videosCount': l10n('{count} סרטונים', '{count} videos'),

  // ---------------------------------------------------------------------------
  // Package cards / pricing
  // ---------------------------------------------------------------------------
  'package.pricePrefix': l10n('החל מ', 'From'),
  'pricing.introBadge': l10n('מחיר היכרות · לזמן מוגבל', 'Intro price · limited time'),
  'pricing.estimatedTotal': l10n('סה"כ משוער', 'Estimated total'),

  // ---------------------------------------------------------------------------
  // Configurator: chrome
  // ---------------------------------------------------------------------------
  'config.eyebrow': l10n('בניית הפרויקט', 'Build your project'),
  'config.subtitle': l10n(
    'עוברים שלב אחר שלב, רואים מחיר משוער בזמן אמת, ושולחים בקשה מפורטת בלי שום התחייבות.',
    'Go step by step, see an estimated price in real time, and send a detailed request with no commitment.',
  ),
  'config.back': l10n('הקודם', 'Back'),
  'config.next': l10n('הבא', 'Next'),
  'config.submit': l10n('הגשת הבקשה', 'Submit request'),
  'config.estimatedTotal': l10n('סה"כ משוער', 'Estimated total'),
  'config.introPrice': l10n('מחיר היכרות · לזמן מוגבל', 'Intro price · limited time'),
  'config.couponPercent': l10n('קופון {percent}%', '{percent}% coupon'),
  'config.removeCoupon': l10n('הסרת הקופון', 'Remove coupon'),
  'config.priceSummaryAria': l10n('סיכום מחיר', 'Price summary'),
  'config.progressAria': l10n('שלבי בניית הפרויקט', 'Project build steps'),
  'config.stepAria': l10n('שלב {index} מתוך {total}: {label}', 'Step {index} of {total}: {label}'),
  'config.doNotClose': l10n('נא להמתין — אל תסגרו את הדף', 'Please wait — do not close this page'),

  // Step labels (progress bar)
  'config.step.product': l10n('הפרויקט', 'Project'),
  'config.step.details': l10n('הסיפור', 'Story'),
  'config.step.song': l10n('השיר', 'Song'),
  'config.step.video': l10n('הסרטון', 'Video'),
  'config.step.extras': l10n('פרטים', 'Details'),
  'config.step.upload': l10n('חומרים', 'Media'),
  'config.step.summary': l10n('סיכום', 'Summary'),
  'config.step.contact': l10n('פרטי קשר', 'Contact'),

  // Submit status
  'config.submit.uploading': l10n('מעלים את החומרים...', 'Uploading your files...'),
  'config.submit.uploadingProgress': l10n(
    'מעלים את החומרים ({completed} מתוך {total})...',
    'Uploading your files ({completed} of {total})...',
  ),
  'config.submit.sending': l10n('שולחים את הבקשה...', 'Sending your request...'),
  'config.submit.working': l10n('שולחים...', 'Sending...'),
  'config.submit.failed': l10n('שליחת הבקשה נכשלה. נסו שוב.', 'Failed to send your request. Please try again.'),
  'config.submit.uploadFailed': l10n('העלאת החומרים נכשלה. נסו שוב.', 'Failed to upload your files. Please try again.'),

  // ---------------------------------------------------------------------------
  // Price summary
  // ---------------------------------------------------------------------------
  'priceSummary.included': l10n('כלול', 'Included'),
  'priceSummary.couponDiscount': l10n('הנחת קופון {percent}%', '{percent}% coupon discount'),
  'priceSummary.removeCoupon': l10n('הסרת הקופון', 'Remove coupon'),
  'priceSummary.total': l10n('סה"כ משוער', 'Estimated total'),
  'priceSummary.introPrice': l10n('מחיר היכרות · לזמן מוגבל', 'Intro price · limited time'),
  'priceSummary.disclaimer': l10n(
    'המחיר המוצג הוא מחיר משוער בהתאם לבחירות שסומנו. המחיר הסופי יאושר לאחר מעבר על החומרים ותיאום קצר. התשלום לא מתבצע בשלב זה, והשליחה אינה מתחילה את העבודה באופן אוטומטי - ניצור איתכם קשר לאישור לפני התחלת התהליך.',
    "The price shown is an estimate based on your selections. The final price is confirmed after we review your materials and have a short chat. No payment is taken at this stage, and submitting does not automatically start the work — we'll contact you for confirmation before we begin.",
  ),
  'priceSummary.empty': l10n('בחרו חבילה כדי לראות הערכת מחיר.', 'Choose a package to see a price estimate.'),
  'priceSummary.addonSurcharge': l10n('תוספת {price}', '+{price}'),
  'priceSummary.includedInPrice': l10n('כלול במחיר', 'Included in price'),

  // ---------------------------------------------------------------------------
  // Product step
  // ---------------------------------------------------------------------------
  'product.kicker': l10n('הפרויקט', 'Project'),
  'product.heading': l10n('בחרו', 'Choose'),
  'product.groupAria': l10n('סוג הפרויקט', 'Project type'),

  // ---------------------------------------------------------------------------
  // Add-ons step
  // ---------------------------------------------------------------------------
  'addons.title': l10n('רוצים להוסיף עוד משהו מיוחד?', 'Want to add something special?'),
  'addons.description': l10n(
    'אפשר לבחור כמה תוספות שרוצים, או להמשיך בלי אף אחת מהן - המחיר יתעדכן באופן מיידי.',
    'Pick as many add-ons as you like, or continue without any — the price updates instantly.',
  ),
  'addons.groupAria': l10n('תוספות אפשריות', 'Available add-ons'),

  // ---------------------------------------------------------------------------
  // Story / project details step
  // ---------------------------------------------------------------------------
  'details.kicker': l10n('הסיפור', 'Story'),
  'details.personName.description': l10n('השם שסביבו נבנה את הפרויקט.', 'The name your project is built around.'),
  'details.personName.placeholder': l10n('שם מלא, או כמה שמות', 'Full name, or several names'),
  'details.occasion.heading': l10n('איזה אירוע חוגגים?', 'What are we celebrating?'),
  'details.occasion.description': l10n(
    'בחרו את סוג האירוע — השאלות בהמשך יותאמו בהתאם.',
    'Choose the occasion — the next questions will adapt accordingly.',
  ),
  'details.occasion.aria': l10n('סוג האירוע', 'Occasion type'),
  'details.occasion.placeholder': l10n('בחרו אירוע', 'Choose an occasion'),
  'details.occasion.customLabel': l10n('מהו האירוע?', "What's the occasion?"),
  'details.occasion.customPlaceholder': l10n(
    'לדוגמה: עלייה לכיתה א׳, סיום שירות...',
    'e.g. starting first grade, finishing military service...',
  ),
  'details.occasion.weddingNote': l10n('לחתונות יש לנו דף ייעודי —', 'We have a dedicated page for weddings —'),
  'details.occasion.weddingLink': l10n('למעבר לדף החתונות', 'Go to the weddings page'),
  'details.story.placeholder': l10n('כתבו כאן בחופשיות...', 'Write freely here...'),
  'details.story.tooShort': l10n(
    'לפחות 10 תווים, כדי שיהיה לנו ממה להתחיל',
    'At least 10 characters, so we have something to start from',
  ),
  'details.eventDate.heading': l10n('למתי צריך את הפרויקט?', 'When do you need the project?'),
  'details.eventDate.description': l10n(
    'רשות. רק כדי לדעת מתי האירוע, בלי להשפיע על זמן ההכנה.',
    "Optional. Just so we know when the event is — it doesn't affect preparation time.",
  ),
  'details.calendar.open': l10n('פתיחת לוח שנה', 'Open calendar'),
  'details.calendar.pick': l10n('בחירת תאריך', 'Choose a date'),
  'details.calendar.prevMonth': l10n('חודש קודם', 'Previous month'),
  'details.calendar.nextMonth': l10n('חודש הבא', 'Next month'),

  // Occasion options
  'occasion.select': l10n('בחרו אירוע', 'Choose an occasion'),
  'occasion.birthday': l10n('יום הולדת', 'Birthday'),
  'occasion.bar_mitzvah': l10n('בר מצווה', 'Bar Mitzvah'),
  'occasion.bat_mitzvah': l10n('בת מצווה', 'Bat Mitzvah'),
  'occasion.wedding': l10n('חתונה', 'Wedding'),
  'occasion.anniversary': l10n('יום נישואין', 'Anniversary'),
  'occasion.just_because': l10n('סתם ככה, בלי סיבה מיוחדת', 'Just because, no special reason'),
  'occasion.other': l10n('אחר', 'Other'),

  // Occasion copy by voice (male / female / plural / neutral)
  'occasion.male.whoHeading': l10n('מי הוא', 'Who is he?'),
  'occasion.male.howHeading': l10n('איך הוא', 'What is he like?'),
  'occasion.male.relationshipLabel': l10n('הקשר שלכם אליו', 'Your relationship to him'),
  'occasion.male.relationshipPlaceholder': l10n('אבא, אח, חבר...', 'Dad, brother, friend...'),
  'occasion.male.traitsPlaceholder': l10n('מצחיק, עקשן, נדיב...', 'Funny, stubborn, generous...'),
  'occasion.male.storyHeading': l10n('מה חשוב שנדע עליו?', 'What should we know about him?'),
  'occasion.male.storyDescription': l10n(
    'כתבו בחופשיות, כאילו אתם מספרים לחבר. לפחות כמה משפטים.',
    "Write freely, as if you're telling a friend. A few sentences at least.",
  ),
  'occasion.female.whoHeading': l10n('מי היא', 'Who is she?'),
  'occasion.female.howHeading': l10n('איך היא', 'What is she like?'),
  'occasion.female.relationshipLabel': l10n('הקשר שלכם אליה', 'Your relationship to her'),
  'occasion.female.relationshipPlaceholder': l10n('אמא, אחות, חברה...', 'Mom, sister, friend...'),
  'occasion.female.traitsPlaceholder': l10n('מצחיקה, עקשנית, נדיבה...', 'Funny, stubborn, generous...'),
  'occasion.female.storyHeading': l10n('מה חשוב שנדע עליה?', 'What should we know about her?'),
  'occasion.female.storyDescription': l10n(
    'כתבו בחופשיות, כאילו אתם מספרים לחברה. לפחות כמה משפטים.',
    "Write freely, as if you're telling a friend. A few sentences at least.",
  ),
  'occasion.plural.whoHeading': l10n('מי הם', 'Who are they?'),
  'occasion.plural.howHeading': l10n('איך הם', 'What are they like?'),
  'occasion.plural.relationshipLabel': l10n('הקשר שלכם אליהם', 'Your relationship to them'),
  'occasion.plural.relationshipPlaceholder': l10n('ההורים, חברים, משפחה...', 'Parents, friends, family...'),
  'occasion.plural.traitsPlaceholder': l10n('מצחיקים, עקשנים, נדיבים...', 'Funny, stubborn, generous...'),
  'occasion.plural.storyHeading': l10n('מה חשוב שנדע עליהם?', 'What should we know about them?'),
  'occasion.plural.storyDescription': l10n(
    'כתבו בחופשיות, כאילו אתם מספרים לחבר. לפחות כמה משפטים.',
    "Write freely, as if you're telling a friend. A few sentences at least.",
  ),
  'occasion.neutral.whoHeading': l10n('מי הם', 'Who is it for?'),
  'occasion.neutral.howHeading': l10n('איך הם', 'What are they like?'),
  'occasion.neutral.relationshipLabel': l10n('הקשר שלכם לאדם', 'Your relationship to them'),
  'occasion.neutral.relationshipPlaceholder': l10n('בן/בת זוג, הורה...', 'Partner, parent...'),
  'occasion.neutral.traitsPlaceholder': l10n('מצחיק, עקשן, נדיב...', 'Funny, stubborn, generous...'),
  'occasion.neutral.storyHeading': l10n('מה חשוב שנדע?', 'What should we know?'),
  'occasion.neutral.storyDescription': l10n(
    'כתבו בחופשיות, כאילו אתם מספרים לחבר. לפחות כמה משפטים.',
    "Write freely, as if you're telling a friend. A few sentences at least.",
  ),

  // ---------------------------------------------------------------------------
  // Song step
  // ---------------------------------------------------------------------------
  'song.kicker': l10n('השיר', 'Song'),
  'song.style.heading': l10n('איזה סגנון מתנגן לכם בראש?', 'What style is playing in your head?'),
  'song.style.description': l10n(
    'אפשר לבחור שילוב של כמה סגנונות. לחיצה משמיעה דוגמה קצרה, מומלץ להפעיל רמקולים.',
    'You can combine several styles. Tap one to hear a short sample — turn your speakers on.',
  ),
  'song.style.groupAria': l10n('סגנונות מוזיקליים', 'Music styles'),
  'song.style.other': l10n('אחר', 'Other'),
  'song.style.customPlaceholder': l10n(
    'איזה סגנון? אפשר כמה, מופרדים בפסיקים',
    'Which style? You can list several, separated by commas',
  ),
  'song.style.customAria': l10n('סגנון מותאם אישית', 'Custom style'),
  'song.voice.heading': l10n('איזה קול ישיר?', 'Which voice should sing?'),
  'song.voice.description': l10n(
    'לחיצה על קול משמיעה דוגמה קצרה. מומלץ להפעיל רמקולים.',
    'Tap a voice to hear a short sample. Turn your speakers on.',
  ),
  'song.voice.groupAria': l10n('בחירת קול', 'Choose a voice'),
  'song.optional.heading': l10n('עוד על השיר', 'More about the song'),
  'song.existing.nameHeading': l10n('איך קוראים לשיר?', "What's the song called?"),
  'song.existing.nameDescription': l10n('השיר שסביבו נבנה את הקליפ.', 'The song the video is built around.'),
  'song.existing.namePlaceholder': l10n('שם השיר', 'Song title'),
  'song.existing.linkHeading': l10n('איפה אפשר לשמוע אותו?', 'Where can we listen to it?'),
  'song.existing.linkDescription': l10n(
    'קישור מיוטיוב, ספוטיפיי או כל מקום אחר.',
    'A link from YouTube, Spotify or anywhere else.',
  ),
  'song.existing.linkInvalid': l10n(
    'נא להזין קישור מלא, למשל https://youtube.com/...',
    'Please enter a full link, e.g. https://youtube.com/...',
  ),

  // ---------------------------------------------------------------------------
  // Video step
  // ---------------------------------------------------------------------------
  'video.kicker': l10n('הסרטון', 'Video'),
  'video.length.heading': l10n('כמה ארוך הסרטון?', 'How long should the video be?'),
  'video.format.heading': l10n('איך הסרטון יישב במסך?', 'How should the video fit the screen?'),
  'video.format.headingWedding': l10n('איזה פורמט יהיה הסרטון?', 'What format will the video be?'),
  'video.format.description': l10n('הפריים מתעדכן לפי הבחירה.', 'The frame updates with your choice.'),
  'video.format.descriptionNoPrice': l10n(
    'הפריים מתעדכן לפי הבחירה. הפורמט לא משנה את המחיר.',
    "The frame updates with your choice. The format doesn't change the price.",
  ),
  'video.format.groupAria': l10n('פורמט יציאה', 'Output format'),
  'video.framePreviewAlt': l10n('תמונת מסך לדוגמה של הסרטון', 'Sample screenshot of the video'),
  'video.subtitles.heading': l10n('כתוביות על הפריים', 'Subtitles on the frame'),
  'video.subtitles.description': l10n(
    'אפשר לבחור סגנון קריוקי וצבעים מועדפים לכתוביות.',
    'You can choose a karaoke style and preferred subtitle colors.',
  ),
  'video.subtitles.groupAria': l10n('כתוביות', 'Subtitles'),
  'video.karaoke.groupAria': l10n('סגנון קריוקי', 'Karaoke style'),
  'video.karaoke.offTitle': l10n('בלי קריוקי', 'No karaoke'),
  'video.karaoke.offHint': l10n('כל המילים באותו צבע', 'All words in the same color'),
  'video.karaoke.onTitle': l10n('קריוקי', 'Karaoke'),
  'video.karaoke.onHint': l10n('כל מילה מושרת מודגשת', 'Each sung word is highlighted'),
  'video.subtitles.color': l10n('צבע הכתוביות', 'Subtitle color'),
  'video.subtitles.highlightColor': l10n('צבע המילה המודגשת', 'Highlighted word color'),
  'video.notes.label': l10n('הערות', 'Notes'),
  'video.notes.placeholder': l10n('משהו שחשוב לנו לדעת על הכתוביות...', 'Anything we should know about the subtitles...'),

  // ---------------------------------------------------------------------------
  // Optional details (extras) step
  // ---------------------------------------------------------------------------
  'extras.kicker': l10n('פרטים', 'Details'),
  'extras.age': l10n('גיל', 'Age'),
  'extras.occupation': l10n('מקצוע או עיסוק', 'Profession or occupation'),
  'extras.traits': l10n('תכונות אופי', 'Personality traits'),
  'extras.hobbies': l10n('תחביבים', 'Hobbies'),
  'extras.hobbiesPlaceholder': l10n('כדורגל, בישול, טיולים...', 'Football, cooking, hiking...'),
  'extras.notes.heading': l10n('עוד משהו שכדאי שנדע', 'Anything else we should know'),
  'extras.notes.description': l10n(
    "רשות. אפשר גם הערות על השיר עצמו, על הז'אנרים, וכל דבר שתרצו להוסיף.",
    'Optional. You can also add notes about the song itself, the genres, or anything else you would like to share.',
  ),
  'extras.notes.placeholder': l10n(
    "הערות על השיר, על הז'אנרים, בדיחה פנימית, או כל דבר נוסף",
    'Notes about the song, the genres, an inside joke, or anything else',
  ),

  // ---------------------------------------------------------------------------
  // Upload step
  // ---------------------------------------------------------------------------
  'upload.kicker': l10n('החומרים', 'Media'),
  'upload.title': l10n('תמונות וסרטונים לקליפ', 'Photos and videos for your clip'),
  'upload.tabsAria': l10n('בחירת סוג העלאה', 'Choose upload type'),
  'upload.tab.images': l10n('תמונות', 'Photos'),
  'upload.tab.videos': l10n('סרטונים', 'Videos'),
  'upload.imagesInfoAria': l10n('מידע על העלאת תמונות', 'About uploading photos'),
  'upload.videosInfoAria': l10n('מידע על העלאת סרטונים', 'About uploading videos'),
  'upload.imageGuidance': l10n(
    'יש לספק {min}-{recommended} תמונות ועד {max} לכל היותר - בהתאם לאורך הסרטון שנבחר.',
    'Please provide {min}-{recommended} photos, up to {max} at most — depending on the selected video length.',
  ),
  'upload.videoGuidance': l10n(
    'אפשר להוסיף סרטונים של עד חצי דקה, ועד {max} סרטונים לכל היותר - בהתאם לאורך הסרטון שנבחר.',
    'You can add videos of up to 30 seconds, with up to {max} videos at most — depending on the selected video length.',
  ),
  'upload.orderGuidance': l10n(
    'אם חשוב לכם שהתמונות/סרטונים יופיעו בסדר מסוים, כדאי לתת שמות כרונולוגיים ברורים (למשל 1, 2, 3...). אחרת, נסדר אותם כפי שנראה לנו לנכון בהתאם לחומרים עצמם ולשיר ברקע.',
    "If the order of your photos/videos matters, give them clear chronological names (e.g. 1, 2, 3...). Otherwise we'll arrange them as we see fit, based on the materials themselves and the background song.",
  ),
  'upload.accept.images': l10n('JPEG, PNG, WEBP או HEIC', 'JPEG, PNG, WEBP or HEIC'),
  'upload.accept.videos': l10n('MP4, MOV או WEBM', 'MP4, MOV or WEBM'),
  'upload.summary': l10n('{images} תמונות · {videos} סרטונים', '{images} photos · {videos} videos'),
  'upload.progress': l10n(
    'יש להעלות עוד {remaining} תמונות לפחות\n(מינימום {minimum} לאורך הסרטון שבחרתם, הועלו {count})',
    'Upload at least {remaining} more photos\n(minimum {minimum} for your chosen video length, {count} uploaded)',
  ),
  'upload.limitExceeded': l10n(
    'יש להסיר {excess} תמונות\n(מקסימום {maximum} לאורך הסרטון שבחרתם, הועלו {count})',
    'Remove {excess} photos\n(maximum {maximum} for your chosen video length, {count} uploaded)',
  ),
  'upload.videoLimitExceeded': l10n(
    'יש להסיר {excess} סרטונים\n(מקסימום {maximum} לאורך הסרטון שבחרתם, ועד 30 שניות לסרטון)',
    'Remove {excess} videos\n(maximum {maximum} for your chosen video length, up to 30 seconds each)',
  ),
  'upload.error.videoUnreadable': l10n(
    'לא ניתן לקרוא את הסרטון "{name}". ודאו שמדובר בקובץ וידאו תקין.',
    'We can\'t read the video "{name}". Make sure it is a valid video file.',
  ),
  'upload.error.videoTooLong': l10n(
    '"{name}" ארוך מדי. אפשר להעלות סרטונים באורך עד חצי דקה.',
    '"{name}" is too long. Videos can be up to 30 seconds.',
  ),
  'upload.error.localFilesMissing': l10n(
    'חלק מהקבצים לא נמצאו במכשיר. נא לחזור לשלב החומרים ולהעלות שוב.',
    'Some files could not be found on your device. Please go back to the media step and upload them again.',
  ),
  'upload.error.imageMissing': l10n(
    'התמונה לא נמצאה במכשיר. נא להעלות אותה שוב.',
    'The photo could not be found on your device. Please upload it again.',
  ),
  'upload.error.videoMissing': l10n(
    'הסרטון לא נמצא במכשיר. נא להעלות אותו שוב.',
    'The video could not be found on your device. Please upload it again.',
  ),
  'upload.error.multipleFolders': l10n(
    'תמונות ההעלאה נמצאות במספר תיקיות שונות. נא לנסות שוב.',
    'Your uploaded photos are spread across several folders. Please try again.',
  ),
  'upload.error.unsavedFiles': l10n(
    'יש קבצים שלא נשמרו במכשיר — הסירו אותם או העלו מחדש',
    "Some files weren't saved on your device — remove them or upload again",
  ),

  // ---------------------------------------------------------------------------
  // Summary step
  // ---------------------------------------------------------------------------
  'summary.title': l10n('כך נראה הפרויקט שבנינו יחד', "Here's the project we built together"),
  'summary.productType': l10n('סוג הפרויקט', 'Project type'),
  'summary.story': l10n('הסיפור', 'Story'),
  'summary.for': l10n('עבור', 'For'),
  'summary.occasion': l10n('אירוע', 'Occasion'),
  'summary.eventDate': l10n('תאריך האירוע', 'Event date'),
  'summary.storyText': l10n('הסיפור', 'Story'),
  'summary.song': l10n('השיר', 'Song'),
  'summary.existingSong': l10n('שיר קיים', 'Existing song'),
  'summary.style': l10n('סגנון', 'Style'),
  'summary.voice': l10n('קול', 'Voice'),
  'summary.length': l10n('אורך', 'Length'),
  'summary.video': l10n('הסרטון', 'Video'),
  'summary.format': l10n('פורמט', 'Format'),
  'summary.subtitles': l10n('כתוביות', 'Subtitles'),
  'summary.subtitlesColor': l10n('צבע כתוביות', 'Subtitle color'),
  'summary.subtitlesHighlightColor': l10n('צבע מילה מודגשת', 'Highlighted word color'),
  'summary.notes': l10n('הערות', 'Notes'),
  'summary.extraDetails': l10n('פרטים נוספים', 'Additional details'),
  'summary.additionalInfo': l10n('מידע נוסף', 'Additional info'),
  'summary.files': l10n('קבצים', 'Files'),
  'summary.images': l10n('תמונות', 'Photos'),
  'summary.videos': l10n('סרטונים', 'Videos'),
  'summary.fullStory': l10n('הסיפור המלא', 'Full story'),

  // ---------------------------------------------------------------------------
  // Contact step
  // ---------------------------------------------------------------------------
  'contact.kicker': l10n('פרטי קשר', 'Contact details'),
  'contact.title': l10n('כמעט סיימנו - איך נחזור אליכם?', "Almost done — how do we reach you?"),
  'contact.name': l10n('שם מלא *', 'Full name *'),
  'contact.phone': l10n('טלפון *', 'Phone *'),
  'contact.email': l10n('מייל *', 'Email *'),
  'contact.message': l10n('הודעה נוספת', 'Additional message'),
  'contact.consent.materials': l10n(
    'יש לי הרשאה להשתמש ולשלוח את התמונות והמידע שסיפקתי. *',
    'I have permission to use and send the photos and information I provided. *',
  ),
  'contact.consent.contact': l10n('אפשר לחזור אליי בנוגע לבקשה. *', 'You may contact me about this request. *'),
  'contact.consent.termsPrefix': l10n('קראתי את', 'I have read the'),
  'contact.consent.termsLink': l10n('תקנון השירות', 'terms of service'),
  'contact.consent.termsSuffix': l10n('והסכמתי לו. *', 'and agree to them. *'),
  'contact.coupon.label': l10n('קוד קופון', 'Coupon code'),
  'contact.coupon.placeholder': l10n('הקוד', 'Code'),
  'contact.coupon.apply': l10n('הפעלה', 'Apply'),
  'contact.coupon.invalid': l10n('הקוד לא קיים', "That code doesn't exist"),
  'contact.coupon.applied': l10n('הופעלה הנחה של {percent}%', '{percent}% discount applied'),
  'contact.submit': l10n('הגשת הבקשה', 'Submit request'),
  'contact.contactFormLink': l10n('מעבר לטופס יצירת הקשר', 'Go to the contact form'),

  // Submission success
  'contact.success.title': l10n('הבקשה נשלחה בהצלחה!', 'Your request was sent!'),
  'contact.success.body': l10n(
    'תודה! קיבלנו את כל הפרטים והחומרים. נחזור אליכם בהקדם לאישור סופי ולתחילת התהליך.',
    "Thank you! We received all your details and materials. We'll get back to you soon for final confirmation and to start the process.",
  ),
  'contact.success.reference': l10n('מספר הפנייה שלכם:', 'Your reference number:'),
  'contact.success.delivery': l10n(
    'העבודה תימסר עד שבעה ימי עסקים ממועד האישור שלנו שהעבודה החלה.',
    'Your work will be delivered within seven business days of our confirmation that work has started.',
  ),
  'contact.success.emailSent': l10n(
    'שלחנו אליכם מייל אישור. אם הוא לא מופיע בדואר הנכנס, בדקו גם בתיקיית ספאם או קידומי מכירות — זה עלול לקרות וזה תקין.',
    "We've sent you a confirmation email. If it isn't in your inbox, check your spam or promotions folder — it happens and it's normal.",
  ),
  'contact.success.noWorkStarted': l10n(
    'שליחת הבקשה אינה מהווה תחילת עבודה בפועל, ולא בוצע כל תשלום בשלב זה.',
    'Submitting the request does not mean work has started, and no payment has been made at this stage.',
  ),
  'contact.success.moreMaterials': l10n(
    'רוצים לשלוח תמונות או חומרים נוספים? השיבו למייל האישור — עם מספר הפנייה בהודעה.',
    'Want to send more photos or materials? Reply to the confirmation email — and include your reference number.',
  ),
  'contact.success.whatsapp': l10n('מעדיפים לדבר עכשיו? שליחת הודעה בוואטסאפ', 'Prefer to talk now? Message us on WhatsApp'),
  'contact.success.newProject': l10n('התחלת פרויקט נוסף', 'Start another project'),

  // ---------------------------------------------------------------------------
  // Validation: forward navigation (tooltips)
  // ---------------------------------------------------------------------------
  'validation.completeStep': l10n('נא להשלים את השלב הנוכחי כדי להמשיך', 'Please complete the current step to continue'),
  'validation.productRequired': l10n('נא לבחור סוג פרויקט כדי להמשיך', 'Please choose a project type to continue'),
  'validation.videoDetailsRequired': l10n('נא להשלים את פרטי הסרטון כדי להמשיך', 'Please complete the video details to continue'),
  'validation.songDetailsRequired': l10n('נא להשלים את פרטי השיר כדי להמשיך', 'Please complete the song details to continue'),
  'validation.requiredFields': l10n('נא להשלים את השדות החובה כדי להמשיך', 'Please complete the required fields to continue'),
  'validation.contactDetailsRequired': l10n('נא להשלים את פרטי הקשר כדי להמשיך', 'Please complete your contact details to continue'),
  'validation.photosRequired': l10n('נא להעלות תמונות כדי להמשיך', 'Please upload photos to continue'),
  'validation.completeFields': l10n('נא להשלים: {fields}', 'Please complete: {fields}'),

  // Validation: song step
  'validation.songNameRequired': l10n('נא להזין את שם השיר כדי להמשיך', 'Please enter the song title to continue'),
  'validation.songLinkRequired': l10n('נא להזין קישור לשיר (יוטיוב גם בסדר)', 'Please enter a link to the song (YouTube is fine)'),
  'validation.songStyleRequired': l10n('נא לבחור לפחות סגנון שיר אחד כדי להמשיך', 'Please choose at least one song style to continue'),
  'validation.songCustomStyleRequired': l10n('נא לפרט את הסגנון המוזיקלי כדי להמשיך', 'Please describe the music style to continue'),
  'validation.vocalistRequired': l10n('נא לבחור זמר, זמרת או שילוב של שניהם', 'Please choose a male singer, a female singer, or both'),
  'validation.songLengthRequired': l10n('נא לבחור אורך משוער כדי להמשיך', 'Please choose an approximate length to continue'),
  'validation.moodTooLong': l10n('מצב הרוח ארוך מדי — קצרו את הטקסט כדי להמשיך', 'The mood text is too long — please shorten it to continue'),
  'validation.namesTooLong': l10n('רשימת השמות ארוכה מדי — קצרו את הטקסט כדי להמשיך', 'The names list is too long — please shorten it to continue'),
  'validation.wordsTooLong': l10n('רשימת המילים ארוכה מדי — קצרו את הטקסט כדי להמשיך', 'The words list is too long — please shorten it to continue'),
  'validation.topicsTooLong': l10n('רשימת הנושאים ארוכה מדי — קצרו את הטקסט כדי להמשיך', 'The topics list is too long — please shorten it to continue'),
  'validation.songNotesTooLong': l10n('הערות השיר ארוכות מדי — קצרו את הטקסט כדי להמשיך', 'The song notes are too long — please shorten them to continue'),

  // Validation: story / details fields
  'validation.personNameRequired': l10n('נא למלא שם כדי להמשיך', 'Please enter a name to continue'),
  'validation.occasionCustomRequired': l10n('נא לכתוב מהו האירוע', 'Please write what the occasion is'),
  'validation.occasionRequired': l10n('נא לבחור סוג אירוע', 'Please choose an occasion type'),
  'validation.storyRequired': l10n(
    'מה חשוב שנדע על הפרויקט? (לפחות 10 תווים)',
    'What should we know about the project? (at least 10 characters)',
  ),
  'validation.eventDatePast': l10n('תאריך האירוע לא יכול להיות לפני היום', "The event date can't be before today"),
  'validation.eventDateInvalid': l10n('נא להזין תאריך תקין', 'Please enter a valid date'),
  'validation.textTooLong': l10n('הטקסט ארוך מדי — קצרו אותו כדי להמשיך', 'The text is too long — please shorten it to continue'),

  // Validation: missing-field names (used with `validation.completeFields`)
  'validation.missing.personName': l10n('שם האדם/האנשים', "The person's / people's name"),
  'validation.missing.occasion': l10n('סוג האירוע', 'Occasion type'),
  'validation.missing.story': l10n(
    'מה חשוב שנדע על הפרויקט? (לפחות 10 תווים)',
    'What should we know about the project? (at least 10 characters)',
  ),
  'validation.missing.fullName': l10n('שם מלא', 'Full name'),
  'validation.missing.phone': l10n('טלפון', 'Phone'),
  'validation.missing.email': l10n('אימייל', 'Email'),
  'validation.missing.materialsConsent': l10n('אישור הרשאות לחומרים', 'Materials permission confirmation'),
  'validation.missing.contactConsent': l10n('אישור ליצירת קשר', 'Permission to contact you'),
  'validation.missing.termsConsent': l10n('אישור תקנון', 'Terms agreement'),

  // Submission errors
  'validation.contactNameBeforeSubmit': l10n(
    'נא למלא את שם איש הקשר לפני שליחת הבקשה.',
    'Please enter the contact name before submitting the request.',
  ),

  // ---------------------------------------------------------------------------
  // File upload component
  // ---------------------------------------------------------------------------
  'fileUpload.noun.image': l10n('תמונות', 'photos'),
  'fileUpload.noun.video': l10n('סרטונים', 'videos'),
  'fileUpload.importing': l10n('מעבד קבצים...', 'Processing files...'),
  'fileUpload.dragOr': l10n('גררו {noun} לכאן או', 'Drag {noun} here or'),
  'fileUpload.clickToChoose': l10n('לחצו לבחירת {noun}', 'click to choose {noun}'),

  // ---------------------------------------------------------------------------
  // Weddings configurator questionnaire + upload intro
  // ---------------------------------------------------------------------------
  'details.wedding.kicker': l10n('הסיפור שלכם', 'Your story'),
  'details.wedding.intro.heading': l10n('הסיפור שלכם, בדרך לקליפ 🎬', 'Your story, on the way to a clip 🎬'),
  'details.wedding.intro.description': l10n(
    'כמה פרטים קטנים יעזרו לנו ליצור שיר וקליפ שמרגישים בדיוק אתם. כתבו בחופשיות — לא צריך לחרוז או לנסח יפה.',
    'A few small details will help us create a song and clip that feel exactly like you. Write freely — no need to rhyme or polish.',
  ),
  'details.wedding.coupleNames.heading': l10n('מה השמות של בני הזוג?', "What are the couple's names?"),
  'details.wedding.coupleNames.description': l10n(
    'שני שמות — סביבם נבנה את השיר והקליפ.',
    'Two names — we will build the song and clip around them.',
  ),
  'details.wedding.partner1.placeholder': l10n('שם בן/בת הזוג הראשון/ה', "First partner's name"),
  'details.wedding.partner2.placeholder': l10n('שם בן/בת הזוג השני/ה', "Second partner's name"),
  'details.wedding.whoPrepares.heading': l10n('מי מכין את הקליפ?', 'Who is preparing the clip?'),
  'details.wedding.whoPrepares.description': l10n(
    'כדי שנדע איך לפנות אליכם ומה הקשר לסיפור.',
    'So we know how to address you and how you relate to the story.',
  ),
  'details.wedding.whoPrepares.couple': l10n('אנחנו בני הזוג', 'We are the couple'),
  'details.wedding.whoPrepares.friends': l10n('חברים', 'Friends'),
  'details.wedding.whoPrepares.family': l10n('משפחה', 'Family'),
  'details.wedding.preparerRelation.label': l10n(
    'ממי הקליפ, ומה הקשר שלכם לזוג?',
    'Who is this from, and how are you related to the couple?',
  ),
  'details.wedding.preparerRelation.placeholder': l10n(
    'לדוגמה: החברה הכי טובה של הכלה',
    "e.g. the bride's best friend",
  ),
  'details.wedding.partnerAbout.heading': l10n(
    'מה הכי מאפיין כל אחד מבני הזוג?',
    'What best describes each partner?',
  ),
  'details.wedding.partnerAbout.heading.they': l10n(
    'מה הכי מאפיין כל אחד מבני הזוג?',
    'What best describes each partner?',
  ),
  'details.wedding.partnerAbout.description': l10n(
    'שתיים־שלוש תכונות, תחביבים או הרגלים שממש מזוהים איתו או איתה. למשל: אוהב לישון, תמיד מאחרת, מוזיקאי בנשמה או זאת שמדברת עם כולם.',
    'Two or three traits, hobbies or habits that really define them. For example: loves sleeping in, always late, a musician at heart, or the one who talks to everyone.',
  ),
  'details.wedding.partnerAbout.description.they': l10n(
    'שתיים־שלוש תכונות, תחביבים או הרגלים שממש מזוהים איתו או איתה. למשל: אוהב לישון, תמיד מאחרת, מוזיקאי בנשמה או זאת שמדברת עם כולם.',
    'Two or three traits, hobbies or habits that really define them. For example: loves sleeping in, always late, a musician at heart, or the one who talks to everyone.',
  ),
  'details.wedding.partnerAbout.about': l10n('ספרו קצת על {name}', 'Tell us a bit about {name}'),
  'details.wedding.partnerAbout.fallback1': l10n('בן/בת הזוג הראשון/ה', 'the first partner'),
  'details.wedding.partnerAbout.fallback2': l10n('בן/בת הזוג השני/ה', 'the second partner'),
  'details.wedding.partnerAbout.placeholder': l10n(
    'תכונות, תחביבים, הרגלים…',
    'Traits, hobbies, habits…',
  ),
  'details.wedding.howMet.heading': l10n('איך הכרתם?', 'How did you meet?'),
  'details.wedding.howMet.heading.they': l10n('איך הם הכירו?', 'How did they meet?'),
  'details.wedding.howMet.description': l10n(
    'איפה הכול התחיל, מי עשה את הצעד הראשון ומה אתם זוכרים מההתחלה? אם יש פרט מצחיק בדרך לדייט הראשון — זה המקום.',
    'Where it all started, who made the first move, and what you remember from the beginning. If there is a funny detail on the way to the first date — this is the place.',
  ),
  'details.wedding.howMet.description.they': l10n(
    'איפה הכול התחיל, מי עשה את הצעד הראשון ומה הם זוכרים מההתחלה? אם יש פרט מצחיק בדרך לדייט הראשון — זה המקום.',
    'Where it all started, who made the first move, and what they remember from the beginning. If there is a funny detail on the way to the first date — this is the place.',
  ),
  'details.wedding.howMet.placeholder': l10n('כתבו בחופשיות…', 'Write freely…'),
  'details.wedding.lifeTogether.heading': l10n(
    "מה הכי 'אתם' בחיים המשותפים?",
    "What feels most 'you' in life together?",
  ),
  'details.wedding.lifeTogether.heading.they': l10n(
    "מה הכי 'הם' בחיים המשותפים?",
    "What feels most 'them' in life together?",
  ),
  'details.wedding.lifeTogether.description': l10n(
    'מה אתם אוהבים לעשות יחד, במה אתם שונים ואילו הרגלים קטנים יש רק לכם? שתפו שניים־שלושה פרטים.',
    'What you love doing together, how you differ, and which little habits are yours alone. Share two or three details.',
  ),
  'details.wedding.lifeTogether.description.they': l10n(
    'מה הם אוהבים לעשות יחד, במה הם שונים ואילו הרגלים קטנים יש רק להם? שתפו שניים־שלושה פרטים.',
    'What they love doing together, how they differ, and which little habits are theirs alone. Share two or three details.',
  ),
  'details.wedding.lifeTogether.placeholder': l10n('כתבו בחופשיות…', 'Write freely…'),
  'details.wedding.hasNicknames': l10n('יש לנו כינויי חיבה', 'We have pet names'),
  'details.wedding.hasNicknames.they': l10n('יש להם כינויי חיבה', 'They have pet names'),
  'details.wedding.nicknames.placeholder': l10n('איך אתם קוראים זה לזו?', 'What do you call each other?'),
  'details.wedding.nicknames.placeholder.they': l10n('איך הם קוראים זה לזו?', 'What do they call each other?'),
  'details.wedding.hasPet': l10n('יש לנו חיית מחמד שתיכנס לקליפ', 'We have a pet that should be in the clip'),
  'details.wedding.hasPet.they': l10n('יש להם חיית מחמד שתיכנס לקליפ', 'They have a pet that should be in the clip'),
  'details.wedding.pet.placeholder': l10n('מה השם שלה ואיזו חיה היא?', "What's their name and what animal are they?"),
  'details.wedding.vibe.heading': l10n('איזה וייב תרצו לקליפ?', 'What vibe do you want for the clip?'),
  'details.wedding.vibe.heading.they': l10n('איזה וייב ירצו לקליפ?', 'What vibe will they want for the clip?'),
  'details.wedding.vibe.description': l10n(
    'בחרו את האווירה שתרצו שהקליפ ישדר.',
    'Choose the atmosphere you want the clip to convey.',
  ),
  'details.wedding.vibe.description.they': l10n(
    'בחרו את האווירה שירצו שהקליפ ישדר.',
    'Choose the atmosphere they want the clip to convey.',
  ),
  'details.wedding.vibe.funny_upbeat': l10n('מצחיק וקצבי', 'Funny and upbeat'),
  'details.wedding.vibe.emotional_romantic': l10n('מרגש ורומנטי', 'Emotional and romantic'),
  'details.wedding.vibe.party': l10n('מסיבה והרמות', 'Party energy'),
  'details.wedding.vibe.mix': l10n('שילוב של צחוק ורגש', 'A mix of laughs and emotion'),
  'details.wedding.vibe.other': l10n('אחר', 'Other'),
  'details.wedding.vibe.customPlaceholder': l10n('תארו את הוייב הרצוי…', 'Describe the vibe you want…'),
  'details.wedding.mustInclude.heading': l10n('יש סיפור שחייב להיכנס לשיר?', 'Is there a story that must be in the song?'),
  'details.wedding.mustInclude.heading.they': l10n(
    'יש סיפור שחייב להיכנס לשיר שלהם?',
    'Is there a story that must be in their song?',
  ),
  'details.wedding.mustInclude.description': l10n(
    'רשות — אפשר גם להמשיך בלי.',
    'Optional — you can also continue without one.',
  ),
  'details.wedding.mustInclude.description.they': l10n(
    'רשות — אפשר גם להמשיך בלי.',
    'Optional — you can also continue without one.',
  ),
  'details.wedding.mustInclude.proposal': l10n('הצעת הנישואים', 'The proposal'),
  'details.wedding.mustInclude.funny_moment': l10n('רגע מצחיק או בלתי נשכח', 'A funny or unforgettable moment'),
  'details.wedding.mustInclude.both': l10n('גם וגם', 'Both'),
  'details.wedding.proposal.heading': l10n('איך הייתה הצעת הנישואים?', 'How was the proposal?'),
  'details.wedding.proposal.placeholder': l10n(
    'איפה זה קרה, איך זה התגלגל והאם משהו השתבש או הפתיע?',
    'Where it happened, how it unfolded, and whether anything went wrong or surprised you.',
  ),
  'details.wedding.memorable.heading': l10n('ספרו על הרגע שלכם', 'Tell us about your moment'),
  'details.wedding.memorable.placeholder': l10n(
    'מה קרה, ואיזה פרט הופך את הסיפור הזה לשלכם?',
    'What happened, and which detail makes this story yours?',
  ),
  'details.wedding.notes.heading': l10n('יש משהו נוסף שחשוב שנדע?', 'Anything else we should know?'),
  'details.wedding.notes.heading.they': l10n(
    'יש משהו נוסף שחשוב שנדע עליהם?',
    'Anything else we should know about them?',
  ),
  'details.wedding.notes.description': l10n(
    'משפט קבוע, בדיחה פרטית, משהו שחייב להופיע — או נושא שתרצו להשאיר מחוץ לקליפ.',
    'A catchphrase, an inside joke, something that must appear — or a topic you want left out of the clip.',
  ),
  'details.wedding.notes.description.they': l10n(
    'משפט קבוע, בדיחה פרטית, משהו שחייב להופיע — או נושא שכדאי להשאיר מחוץ לקליפ.',
    'A catchphrase, an inside joke, something that must appear — or a topic to leave out of the clip.',
  ),
  'details.wedding.notes.placeholder': l10n('רשות…', 'Optional…'),

  'upload.wedding.intro.kicker': l10n('החומרים', 'Media'),
  'upload.wedding.intro.heading': l10n('עכשיו מוסיפים אתכם לתמונה 📸', "Now let's add you to the picture 📸"),
  'upload.wedding.intro.lead': l10n('העלו כאן את כל התמונות יחד:', 'Upload all the photos here together:'),
  'upload.wedding.intro.item1': l10n(
    'תמונות עדכניות של כל אחד מבני הזוג: פנים ברורות, רצוי מכמה זוויות.',
    'Recent photos of each partner: clear faces, ideally from a few angles.',
  ),
  'upload.wedding.intro.item2': l10n(
    'תמונות שלכם יחד: מתחילת הקשר, מטיולים ומרגעים משמעותיים או יומיומיים שאתם אוהבים.',
    'Photos of you together: from the start of the relationship, trips, and meaningful or everyday moments you love.',
  ),
  'upload.wedding.intro.item3': l10n(
    'תמונות ילדות ונעורים של שניכם: אם תרצו שנשלב בקליפ את הדרך שעברתם מילדות ועד החתונה.',
    'Childhood and youth photos of both of you: if you want us to weave in the journey from childhood to the wedding.',
  ),
  'upload.wedding.intro.item4': l10n(
    'תמונות שקשורות לסיפורים ששיתפתם: למשל הצעת הנישואים, מקום מיוחד או חיית מחמד.',
    'Photos tied to the stories you shared: for example the proposal, a special place, or a pet.',
  ),
  'upload.wedding.intro.videosTitle': l10n('אפשר להוסיף גם סרטונים — ברשות בלבד.', 'You can also add videos — optional only.'),
  'upload.wedding.intro.videosBody': l10n(
    'אם יש לכם סרטונים מרגעים משותפים שתרצו לשלב בקליפ, העלו גם אותם כאן.',
    'If you have videos from shared moments you want in the clip, upload them here too.',
  ),
  'upload.wedding.intro.namingTitle': l10n('איך נדע מי בתמונה?', 'How will we know who is in the photo?'),
  'upload.wedding.intro.namingBody': l10n(
    'לפני ההעלאה, תנו לקבצים שמות ברורים שמציינים מי מופיע בהם, ובמידת הצורך גם גיל, תקופה או אירוע. למשל:',
    'Before uploading, give files clear names that say who appears in them, and if needed also age, period or event. For example:',
  ),
  'upload.wedding.intro.namingExamples': l10n(
    '״הראל_ילדות_גיל_6.jpg״ · ״פז_נעורים.jpg״ · ״הראל_ופז_טיול_בפריז.jpg״ · ״סנפי_הכלב.jpg״',
    '"Harel_childhood_age_6.jpg" · "Paz_youth.jpg" · "Harel_and_Paz_Paris_trip.jpg" · "Snufi_the_dog.jpg"',
  ),
  'upload.wedding.intro.namingNote': l10n(
    'אין צורך לשנות שם לכל קובץ — רק כשזהות המצולמים או ההקשר לא ברורים.',
    'No need to rename every file — only when who is pictured or the context is unclear.',
  ),
  'upload.wedding.intro.orderTitle': l10n(
    'רוצים שהתמונות או הסרטונים יופיעו בסדר מסוים?',
    'Want the photos or videos in a specific order?',
  ),
  'upload.wedding.intro.orderBody': l10n(
    'הוסיפו מספר בתחילת שם הקובץ לפי הסדר הרצוי. למשל: ״01_הראל_ילדות.jpg״, ״02_פז_ילדות.jpg״, ״03_הדייט_הראשון.mp4״.',
    'Add a number at the start of the filename in the desired order. For example: "01_Harel_childhood.jpg", "02_Paz_childhood.jpg", "03_first_date.mp4".',
  ),
  'upload.wedding.intro.orderNote': l10n(
    'אין צורך לכתוב תיאור נפרד לכל תמונה או סרטון.',
    'No need to write a separate description for every photo or video.',
  ),
  'upload.wedding.intro.continue': l10n('הבנתי, בואו נעלה', "Got it, let's upload"),

  'validation.wedding.coupleNames': l10n('נא למלא את שני שמות בני הזוג', "Please enter both partners' names"),
  'validation.wedding.whoPrepares': l10n('נא לבחור מי מכין את הקליפ', 'Please choose who is preparing the clip'),
  'validation.wedding.partnerAbout': l10n('נא לספר קצת על כל אחד מבני הזוג', 'Please tell us a bit about each partner'),
  'validation.wedding.howMet': l10n('נא לספר איך הכרתם (לפחות כמה מילים)', 'Please tell us how you met (at least a few words)'),
  'validation.wedding.lifeTogether': l10n('נא לספר על החיים המשותפים שלכם', 'Please tell us about your life together'),
  'validation.wedding.vibe': l10n('נא לבחור וייב לקליפ', 'Please choose a vibe for the clip'),
  'validation.wedding.customVibe': l10n('נא לתאר את הוייב הרצוי', 'Please describe the vibe you want'),
  'validation.wedding.mustInclude': l10n('נא להשלים את פרטי הסיפור שבחרתם', 'Please complete the story details you selected'),

  // ---------------------------------------------------------------------------
  // Email compose dialog
  // ---------------------------------------------------------------------------
  'emailDialog.close': l10n('סגירת החלון', 'Close dialog'),
  'emailDialog.title': l10n('איך לשלוח את המייל?', 'How would you like to send the email?'),
  'emailDialog.gmail': l10n("ג'ימייל", 'Gmail'),
  'emailDialog.desktopApp': l10n('תוכנת המייל במחשב', 'Email app on your computer'),
  'emailDialog.copy': l10n('העתקת הכתובת', 'Copy address'),
  'emailDialog.copied': l10n('הכתובת הועתקה', 'Address copied'),

  // ---------------------------------------------------------------------------
  // Configurator: additional copy (steps' headings / helper texts)
  // ---------------------------------------------------------------------------
  'details.personName.headingVideo': l10n(
    'שם האדם או האנשים שהקליפ עבורם',
    'The name of the person or people the video is for',
  ),
  'details.personName.headingSong': l10n(
    'שם האדם או האנשים שהשיר עבורם',
    'The name of the person or people the song is for',
  ),
  'extras.who.description': l10n(
    'רשות. מה שתמלאו כאן נכנס לשיר.',
    'Optional. Whatever you fill in here goes into the song.',
  ),
  'song.length.heading': l10n('כמה ארוך השיר?', 'How long should the song be?'),
  'song.length.headingCombined': l10n('כמה ארוכים השיר והסרטון?', 'How long should the song and video be?'),
  'song.length.headingCombinedWedding': l10n(
    'כמה ארוך הקליפ (השיר והסרטון)?',
    'How long should the clip (song and video) be?',
  ),
  'song.length.description': l10n('גררו את המד לאורך הרצוי', 'Drag the slider to the length you want'),
  'song.field.mood.title': l10n('איזה מצב רוח?', 'What mood?'),
  'song.field.mood.placeholder': l10n('שמח, מרגש, קצבי...', 'Happy, touching, upbeat...'),
  'song.field.names.title': l10n('שמות שחשוב שיופיעו', 'Names that must appear'),
  'song.field.words.title': l10n('מילים שחייבות להיכנס', 'Words that must be included'),
  'song.field.excluded.title': l10n('מה לא להכניס לשיר?', 'What should stay out of the song?'),
  'song.field.notes.title': l10n('עוד משהו על השיר?', 'Anything else about the song?'),
  'song.field.notes.placeholder': l10n('הערה קצרה', 'A short note'),
  'song.field.commaSeparated': l10n('הפרידו בפסיקים', 'Separate with commas'),
  'video.length.descriptionExistingSong': l10n(
    'מומלץ לבחור אורך שמתאים לשיר שבחרתם.',
    'We recommend choosing a length that fits the song you picked.',
  ),
  'video.length.descriptionHalfStep': l10n(
    'כל חצי דקה נוספת היא עוד {price}.',
    'Each additional half minute is another {price}.',
  ),
  'summary.relationship': l10n('קשר', 'Relationship'),
  'summary.occupation': l10n('מקצוע', 'Occupation'),

  // ---------------------------------------------------------------------------
  // Simple contact section (home page)
  // ---------------------------------------------------------------------------
  'simpleContact.eyebrow': l10n('יצירת קשר', 'Contact'),
  'simpleContact.headline': l10n('יש שאלות?', 'Got questions?'),
  'simpleContact.leadBeforeWhatsapp': l10n('אפשר לשלוח הודעה קצרה, לפנות', 'Send a short message, reach us on'),
  'simpleContact.whatsappLink': l10n('בוואטסאפ', 'WhatsApp'),
  'simpleContact.leadAfterWhatsapp': l10n('או לכתוב אלינו ל-', 'or email us at'),
  'simpleContact.success': l10n('תודה! ההודעה התקבלה. נחזור אליכם בהקדם.', 'Thanks! We got your message and will get back to you soon.'),
  'simpleContact.sendAnother': l10n('שליחת הודעה נוספת', 'Send another message'),
  'simpleContact.name': l10n('שם *', 'Name *'),
  'simpleContact.nameError': l10n('נא להזין שם', 'Please enter a name'),
  'simpleContact.phone': l10n('טלפון *', 'Phone *'),
  'simpleContact.phoneError': l10n('נא להזין מספר טלפון תקין', 'Please enter a valid phone number'),
  'simpleContact.email': l10n('אימייל *', 'Email *'),
  'simpleContact.emailError': l10n('נא להזין כתובת אימייל תקינה', 'Please enter a valid email address'),
  'simpleContact.message': l10n('הודעה *', 'Message *'),
  'simpleContact.messagePlaceholder': l10n(
    'ספרו בקצרה על מה שאתם מחפשים...',
    'Tell us briefly what you are looking for...',
  ),
  'simpleContact.messageError': l10n('נא לכתוב הודעה קצרה', 'Please write a short message'),
  'simpleContact.sending': l10n('שולח...', 'Sending...'),
  'simpleContact.submit': l10n('שלחו הודעה', 'Send message'),
  'simpleContact.failed': l10n('שליחת ההודעה נכשלה. נסו שוב.', 'Sending failed. Please try again.'),

  // ---------------------------------------------------------------------------
  // Portfolio section chrome
  // ---------------------------------------------------------------------------
  'portfolio.eyebrow': l10n('פורטפוליו', 'Portfolio'),
  'portfolio.heading': l10n('מה אפשר לקבל?', 'What can you get?'),
  'portfolio.subtitle': l10n(
    'גללו בין דוגמאות אמיתיות — מספיקות תמונות ותיאור קצר, ואנחנו הופכים אותן לקליפ מוזיקלי מלא.',
    'Browse real examples — a few photos and a short description are enough for a full music video.',
  ),
  'portfolio.prev': l10n('גלילה לדוגמה הקודמת', 'Previous example'),
  'portfolio.next': l10n('גלילה לדוגמה הבאה', 'Next example'),
  'portfolio.galleryAria': l10n('גלריית קליפים', 'Video gallery'),
  'portfolio.reactionsTitle': l10n('תגובות לסרטונים', 'Reactions to the videos'),
  'portfolio.songsTitle': l10n('דוגמאות לשירים', 'Song examples'),
  'portfolio.songsSubtitle': l10n('האזנה לשירים מקוריים — בלי קליפ.', 'Listen to original songs — no video.'),
  'portfolio.watchAria': l10n('צפייה בקליפ: {title}', 'Watch clip: {title}'),
  'portfolio.styleLabel': l10n('סגנון:', 'Style:'),
  'portfolio.stylesAria': l10n('סגנונות מוזיקליים', 'Music styles'),
  'portfolio.requiredWordsLabel': l10n('מילים שצריכות להופיע:', 'Words that must appear:'),
  'portfolio.requiredWordsAria': l10n('מילים שצריכות להופיע', 'Required words'),
  'portfolio.songOnly': l10n('שיר בלבד — בלי קליפ', 'Song only — no video'),
  'portfolio.close': l10n('סגירת החלון', 'Close'),
} as const satisfies Record<string, L10nText>;

export type UiMessageKey = keyof typeof UI_MESSAGES;
