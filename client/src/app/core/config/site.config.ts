/** Site-wide constants: brand copy, navigation and contact channels. */

export interface NavLink {
  labelHe: string;
  sectionId: string;
}

export const SITE_CONFIG = {
  brandName: 'YERUSHALMI.AI',
  taglineHe: 'קליפים מוזיקליים ושירים בהתאמה אישית',
  titleHe: 'YERUSHALMI.AI | קליפים מוזיקליים ושירים בהתאמה אישית',
  descriptionHe:
    'קליפים מוזיקליים אישיים, שירים מקוריים וסרטוני AI שנוצרים מתמונות, סיפורים ורגעים מיוחדים.',
  canonicalUrl: 'https://yerushalmi.ai/',
} as const;

export const NAV_LINKS: readonly NavLink[] = [
  { labelHe: 'דוגמאות', sectionId: 'portfolio' },
  { labelHe: 'שירותים', sectionId: 'services' },
  { labelHe: 'איך זה עובד', sectionId: 'how-it-works' },
  { labelHe: 'בניית הפרויקט', sectionId: 'configurator' },
  { labelHe: 'יצירת קשר', sectionId: 'contact' },
];

export const WHATSAPP_CONFIG = {
  localPhone: '0546602230',
  internationalPhone: '972546602230',
  defaultMessageHe: 'היי, אשמח לקבל פרטים על יצירת קליפ או שיר אישי דרך YERUSHALMI.AI',
  get url(): string {
    return `https://wa.me/${this.internationalPhone}?text=${encodeURIComponent(this.defaultMessageHe)}`;
  },
} as const;
