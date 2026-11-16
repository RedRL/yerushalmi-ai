import { L10nText, l10n } from '../../core/i18n/locale.types';

/**
 * Bilingual content for the Terms of Service page.
 *
 * Replaceable tokens inside strings:
 *  - `{brand}`  → SITE_CONFIG.brandName
 *  - `{email}`  → CONTACT_EMAIL_CONFIG.address (render as a mailto link)
 *  - `**text**` → bold (use `parseStrong()` to split a string into plain/bold segments)
 */

export interface TermsSection {
  title: L10nText;
  paragraphs?: L10nText[];
  bullets?: L10nText[];
}

export interface TermsTextSegment {
  text: string;
  strong: boolean;
}

export const TERMS_LAST_UPDATED = l10n('ספטמבר 2026', 'September 2026');

export const TERMS_CONTENT = {
  backLabel: l10n('→ חזרה לדף הבית', '← Back to home'),
  title: l10n('תקנון שירות', 'Terms of Service'),
  updatedPrefix: l10n('עודכן לאחרונה:', 'Last updated:'),
  lastUpdated: TERMS_LAST_UPDATED,
  intro: l10n(
    'ברוכים הבאים ל-{brand}. תקנון זה מסדיר את תנאי השימוש בשירותי יצירת שירים וקליפים מוזיקליים בהתאמה אישית. שליחת בקשה דרך האתר מהווה הסכמה לתנאים המפורטים להלן.',
    'Welcome to {brand}. These Terms of Service govern the use of our custom song and music video creation services. Submitting a request through the website constitutes your agreement to the terms set out below.',
  ),
  sections: [
    // 1
    {
      title: l10n('1. כללי', '1. General'),
      paragraphs: [
        l10n(
          '{brand} (להלן: "החברה", "אנחנו") מספקת שירותי כתיבה, הפקה מוזיקלית, עריכה ויצירת קליפים מותאמים אישית. התקנון חל על כל שימוש באתר, שליחת בקשות, תשלומים וקבלת תוצרים.',
          '{brand} (hereinafter: the "Company", "we", "us") provides songwriting, music production, editing and custom music video creation services. These Terms apply to any use of the website, the submission of requests, payments and the receipt of deliverables.',
        ),
      ],
    },
    // 2
    {
      title: l10n('2. תהליך ההזמנה', '2. Ordering Process'),
      bullets: [
        l10n(
          'הלקוח ממלא את טופס בניית הפרויקט באתר ושולח בקשה ללא התחייבות.',
          'The customer fills out the project builder form on the website and submits a request with no obligation.',
        ),
        l10n(
          'המחיר המוצג באתר הוא הערכה בלבד; המחיר הסופי יאושר לאחר מעבר על החומרים ותיאום קצר.',
          'The price shown on the website is an estimate only; the final price will be confirmed after we review the materials and have a brief coordination call.',
        ),
        l10n(
          'התחלת העבודה תתבצע רק לאחר אישור מפורש מול הלקוח, כולל אישור מחיר סופי.',
          'Work will begin only after explicit confirmation from the customer, including approval of the final price.',
        ),
        l10n(
          '«תחילת העבודה» היא המועד שבו הודענו ללקוח בכתב שהעבודה החלה. ממועד זה נספרים ימי האספקה, וממנו חל גם הביטול ללא החזר.',
          '"Start of work" is the date on which we notify the customer in writing that work has begun. Delivery days are counted from that date, and the no-refund cancellation policy applies from that date as well.',
        ),
        l10n(
          'החברה שומרת לעצמה את הזכות לסרב לפרויקט שאינו מתאים לשירות, לפי שיקול דעתה.',
          'The Company reserves the right, at its sole discretion, to decline any project that is not suitable for the service.',
        ),
      ],
    },
    // 3
    {
      title: l10n('3. תשלום', '3. Payment'),
      bullets: [
        l10n(
          'התשלום מתבצע במלואו מראש, לאחר אישור הפרויקט והמחיר הסופי, וטרם תחילת העבודה.',
          'Payment is made in full in advance, after the project and final price have been approved and before work begins.',
        ),
        l10n(
          'אמצעי התשלום (העברה בנקאית, ביט, אשראי וכדומה) יימסרו ללקוח לאחר אישור הפרויקט.',
          'Payment methods (bank transfer, Bit, credit card, etc.) will be provided to the customer after the project is approved.',
        ),
        l10n(
          'המחירים באתר מוצגים בשקלים חדשים (₪) או בדולרים ($), לפי בחירתכם, וכוללים מע"מ.',
          'Prices on the website are shown in New Israeli Shekels (₪) or US Dollars ($), according to your selection, and include VAT.',
        ),
      ],
    },
    // 4
    {
      title: l10n('4. זכויות יוצרים — חומרים שהלקוח מעלה', '4. Copyright — Materials Uploaded by the Customer'),
      paragraphs: [
        l10n(
          'בכפוף לאישורכם בטופס, אתם מצהירים ומתחייבים כי לכל התמונות, הטקסטים והמידע שאתם מעלים או מספקים לפרויקט יש לכם זכויות שימוש מלאות, או שקיבלתם הרשאה מפורשת מהבעלים לשימוש בהם לצורך יצירת הפרויקט.',
          'Subject to your confirmation in the form, you represent and warrant that you hold full usage rights to all images, texts and information you upload or provide for the project, or that you have received explicit permission from their owner to use them for the purpose of creating the project.',
        ),
        l10n(
          'האחריות המלאה לנכונות ההצהרה ולכל תביעה, דרישה או נזק הנובעים מהפרת זכויות יוצרים בחומרים שסיפקתם חלה עליכם בלבד. החברה אינה אחראית לבדיקה עצמאית של מקור החומרים, ואינה נושאת באחריות לשימוש בחומרים שלא סופקו בהרשאה מתאימה.',
          'You alone bear full responsibility for the accuracy of this declaration and for any claim, demand or damage arising from the infringement of copyright in the materials you provided. The Company is not responsible for independently verifying the source of the materials and bears no liability for the use of materials that were not provided with proper authorization.',
        ),
        l10n(
          'ההצהרה חלה גם על מי שמופיע בתמונות ובמידע. אם מופיע אדם אחר, ובפרט קטין, אתם מצהירים שקיבלתם את הסכמתו — ואם הוא קטין, את הסכמת ההורה או האפוטרופוס — לשימוש בדמותו לצורך יצירת הפרויקט.',
          'This declaration also extends to anyone who appears in the images and information. If another person appears, and in particular a minor, you declare that you have obtained their consent — or, if they are a minor, the consent of their parent or legal guardian — to use their likeness for the purpose of creating the project.',
        ),
      ],
    },
    // 5
    {
      title: l10n('5. שיר חיצוני / שיר קיים', '5. External / Existing Song'),
      paragraphs: [
        l10n(
          'כאשר הלקוח בוחר להשתמש בשיר קיים או בשיר חיצוני (שלא נוצר על ידי החברה), הלקוח מצהיר כי יש לו הרשאה חוקית לשימוש בשיר לצורך יצירת הקליפ, כולל שימוש מסחרי או אישי, לפי הצורך.',
          'When the customer chooses to use an existing or external song (one not created by the Company), the customer declares that they have lawful authorization to use the song for the purpose of creating the music video, including commercial or personal use, as applicable.',
        ),
        l10n(
          '**כל השימוש בשיר חיצוני, לרבות רישוי, תשלומים לגופי ניהול זכויות, וכל חבות משפטית הנובעת מכך — הוא באחריות הלקוח בלבד.** החברה אינה אחראית לרכישת רישיונות, לתשלום תמלוגים, או לכל טענה מצד בעלי זכויות בשיר.',
          '**All use of an external song, including licensing, payments to rights-management organizations, and any resulting legal liability, is the sole responsibility of the customer.** The Company is not responsible for purchasing licenses, paying royalties, or for any claim made by the song\'s rights holders.',
        ),
      ],
    },
    // 6
    {
      title: l10n('6. זכויות יוצרים בתוצרים', '6. Copyright in Deliverables'),
      bullets: [
        l10n(
          'זכויות היוצרים בשיר מקורי ובקליפ שנוצרים על ידי החברה נשארות של החברה.',
          'Copyright in an original song and music video created by the Company remains with the Company.',
        ),
        l10n(
          'לאחר תשלום מלא, הלקוח מקבל רישיון שימוש אישי ופרטי בתוצר שנמסר לו — שיר, קליפ או שניהם — אלא אם הוסכם אחרת בכתב.',
          'Upon full payment, the customer receives a personal, private-use license to the deliverable provided to them — a song, a music video, or both — unless otherwise agreed in writing.',
        ),
        l10n(
          'בקליפ לשיר של הלקוח, הרישיון חל על הסרטון שנוצר על ידי החברה. הזכויות בשיר החיצוני נשארות אצל בעליהן.',
          'For a music video created for the customer\'s own song, the license applies to the video created by the Company. Rights in the external song remain with their owners.',
        ),
        l10n(
          'שימוש מסחרי, שידור, הפצה רחבה או שימוש בתוכן לצרכי פרסום יחייב את הסכמתנו מראש ובכתב.',
          'Commercial use, broadcasting, wide distribution, or use of the content for advertising purposes requires our prior written consent.',
        ),
        l10n(
          'כל עוד לא הוסכם אחרת בכתב, החברה רשאית להשתמש בתוצרים שנוצרו בפרויקט ולפרסם אותם באתר, ברשתות החברתיות, בתיק העבודות ובחומרי שיווק — לצורך הצגת השירות והיכולות המקצועיות.',
          'Unless otherwise agreed in writing, the Company may use the deliverables created in the project and publish them on the website, on social media, in its portfolio and in marketing materials — for the purpose of showcasing the service and its professional capabilities.',
        ),
        l10n(
          'לקוח שמעדיף שלא יפורסם הפרויקט יכול לפנות אלינו לפני תחילת העבודה — נשמח לדבר על כך ולמצוא פתרון מתאים.',
          'A customer who prefers that the project not be published may contact us before work begins — we will be happy to discuss it and find a suitable solution.',
        ),
      ],
    },
    // 7
    {
      title: l10n('7. בינה מלאכותית', '7. Artificial Intelligence'),
      paragraphs: [
        l10n(
          'חלק מיצירת השיר והקליפ נעשה באמצעות כלי בינה מלאכותית, לצד עבודה ידנית. התוצאה תלויה בחומרים ובפרטים שנמסרים. אנחנו לא מתחייבים שהדמויות, הפנים או הקול ייצאו זהים למציאות.',
          'Part of the creation of the song and music video is carried out using artificial intelligence tools, alongside manual work. The result depends on the materials and details provided. We do not guarantee that characters, faces or voices will match reality exactly.',
        ),
        l10n(
          'חומרים עשויים להיות מעובדים גם בכלים חיצוניים, לצורך יצירת התוצר בלבד.',
          'Materials may also be processed by external tools, solely for the purpose of creating the deliverable.',
        ),
      ],
    },
    // 8
    {
      title: l10n('8. סבבי תיקונים ומסירה', '8. Revision Rounds and Delivery'),
      bullets: [
        l10n('שיר מקורי כולל סבב תיקונים אחד לשיר.', 'An original song includes one revision round for the song.'),
        l10n('קליפ כולל סבב תיקונים אחד לסרטון.', 'A music video includes one revision round for the video.'),
        l10n(
          'חבילה הכוללת שיר וקליפ כוללת סבב תיקונים אחד לשיר וסבב תיקונים אחד לסרטון.',
          'A package that includes both a song and a music video includes one revision round for the song and one revision round for the video.',
        ),
        l10n(
          'בפרויקט הכולל שיר מקורי וקליפ, השיר יישלח ללקוח לאישור ולהערות לפני תחילת יצירת הסרטון.',
          'In a project that includes an original song and a music video, the song will be sent to the customer for approval and comments before the creation of the video begins.',
        ),
        l10n(
          'סבב תיקונים הוא בקשה אחת לתיקונים בתוך מה שסוכם: ניסוח, פרטים, אווירה, בחירת קטעים, תמונות או עריכה דומה.',
          'A revision round is a single request for changes within what was agreed: wording, details, mood, selection of segments, images, or similar editing.',
        ),
        l10n(
          'שינוי כיוון, החלפת הסיפור, או בקשה שחורגת מההיקף שסוכם אינם חלק מסבב התיקונים, ועשויים להיות בתשלום נוסף.',
          'A change of direction, replacing the story, or any request that goes beyond the agreed scope is not part of the revision round and may be subject to an additional fee.',
        ),
        l10n(
          'זמן האספקה הוא עד שבעה ימי עסקים מתחילת העבודה.',
          'Delivery time is up to seven business days from the start of work.',
        ),
        l10n(
          'בקשה או אישור שמתקבלים לאחר השעה 17:00 ייחשבו כאילו התקבלו ביום העסקים הבא.',
          'Any request or approval received after 5:00 PM will be treated as received on the next business day.',
        ),
        l10n(
          'עיכובים הנובעים מאיחור במסירת חומרים, אישורים או תשלום — אינם באחריות החברה.',
          'Delays resulting from late delivery of materials, approvals or payment are not the Company\'s responsibility.',
        ),
      ],
    },
    // 9
    {
      title: l10n('9. ביטול והחזרים', '9. Cancellation and Refunds'),
      bullets: [
        l10n(
          'ביטול לפני תחילת העבודה: ניתן לבטל ללא חיוב, והתשלום (אם שולם) יוחזר במלואו.',
          'Cancellation before work begins: you may cancel free of charge, and any payment made will be refunded in full.',
        ),
        l10n(
          'ביטול על ידי הלקוח לאחר תחילת העבודה: לא יינתן החזר, לא מלא ולא חלקי.',
          'Cancellation by the customer after work has begun: no refund will be given, neither full nor partial.',
        ),
        l10n(
          'החברה רשאית לבטל פרויקט במקרה של הפרת תנאים או אי-תשלום.',
          'The Company may cancel a project in the event of a breach of these terms or non-payment.',
        ),
        l10n(
          'אם אנחנו מבטלים פרויקט אחרי שהתשלום התקבל, שלא בשל הפרת תנאים מצד הלקוח, התשלום יוחזר במלואו.',
          'If we cancel a project after payment has been received, other than due to a breach of terms by the customer, the payment will be refunded in full.',
        ),
      ],
    },
    // 10
    {
      title: l10n('10. פרטיות ושמירת מידע', '10. Privacy and Data Retention'),
      paragraphs: [
        l10n(
          'פרטי הקשר והחומרים שתספקו ישמשו ליצירת הפרויקט, לתיאום, לחיוב ולמתן השירות. ייתכן שהחומרים יועברו גם לספקי כלים המשמשים ליצירה, לרבות כלי בינה מלאכותית, ורק לצורך זה.',
          'The contact details and materials you provide will be used to create the project, for coordination, billing and delivery of the service. The materials may also be passed on to providers of the tools used for creation, including artificial intelligence tools, and only for that purpose.',
        ),
        l10n(
          'פרסום התוצר המוגמר, כמפורט בסעיף זכויות היוצרים בתוצרים, נעשה רק אם לא סוכם אחרת לפני תחילת העבודה. חומרים גולמיים שלא נכללו בתוצר שפורסם לא יפורסמו בנפרד. לא נמכור את המידע לצדדים שלישיים. ניתן לפנות אלינו בבקשה למחיקת חומרים לאחר סיום הפרויקט, בכפוף לצרכים תפעוליים וחוקיים.',
          'Publication of the finished deliverable, as described in the Copyright in Deliverables section, takes place only if nothing different was agreed before work began. Raw materials that were not included in the published deliverable will not be published separately. We will not sell your information to third parties. You may contact us to request deletion of materials after the project is complete, subject to operational and legal requirements.',
        ),
      ],
    },
    // 11
    {
      title: l10n('11. הגבלת אחריות', '11. Limitation of Liability'),
      paragraphs: [
        l10n(
          'השירות מסופק "כפי שהוא". החברה עושה מאמץ לספק תוצר איכותי ומותאם, אך אינה מתחייבת שהתוצר יעמוד בכל ציפייה סובייקטיבית. אחריות החברה, ככל שתחול, מוגבלת לסכום ששולם עבור הפרויקט.',
          'The service is provided "as is". The Company makes an effort to deliver a high-quality, tailored result, but does not guarantee that the deliverable will meet every subjective expectation. The Company\'s liability, if any, is limited to the amount paid for the project.',
        ),
      ],
    },
    // 12
    {
      title: l10n('12. שינויים בתקנון', '12. Changes to These Terms'),
      paragraphs: [
        l10n(
          'החברה רשאית לעדכן תקנון זה מעת לעת. גרסה מעודכנת תפורסם בדף זה. המשך שימוש באתר לאחר העדכון מהווה הסכמה לתנאים המעודכנים.',
          'The Company may update these Terms from time to time. An updated version will be published on this page. Continued use of the website after an update constitutes agreement to the updated terms.',
        ),
      ],
    },
    // 13
    {
      title: l10n('13. יצירת קשר', '13. Contact'),
      paragraphs: [
        l10n(
          'לכל שאלה בנוגע לתקנון, לזכויות יוצרים או לפרויקט — ניתן לפנות אלינו דרך טופס יצירת הקשר באתר, בוואטסאפ או במייל {email}.',
          'For any questions regarding these Terms, copyright, or a project — you may contact us through the contact form on the website, via WhatsApp, or by email at {email}.',
        ),
      ],
    },
  ] satisfies TermsSection[],
};

/** Replaces `{brand}`, `{email}` (and any other `{key}`) tokens in a localized string. */
export function fillTerms(text: string, vars: Readonly<Record<string, string>>): string {
  return text.replace(/\{(\w+)\}/g, (match, key: string) => vars[key] ?? match);
}

/** Splits a string with `**bold**` markers into plain/strong segments. */
export function parseStrong(text: string): TermsTextSegment[] {
  return text
    .split(/(\*\*[^*]+\*\*)/g)
    .filter((part) => part.length > 0)
    .map((part) =>
      part.startsWith('**') && part.endsWith('**')
        ? { text: part.slice(2, -2), strong: true }
        : { text: part, strong: false },
    );
}
