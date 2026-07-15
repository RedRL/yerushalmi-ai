import type { PortfolioCategory, PortfolioVideo } from '../../../shared/models/portfolio-video.model';

export const PORTFOLIO_CATEGORIES: readonly PortfolioCategory[] = [
  {
    id: 'birthday_photos',
    titleHe: 'סרטוני יום הולדת מתמונות אמיתיות',
    descriptionHe: 'תמונות אמיתיות שהופכות לסצנות וידאו מרגשות, יחד עם שיר אישי שנוצר במיוחד.',
  },
  {
    id: 'ai_generated',
    titleHe: 'קליפים מבוססי AI',
    descriptionHe: 'קליפים שנוצרים מאפס בעזרת AI, עם עולם ויזואלי מקורי ושיר מותאם אישית.',
  },
  {
    id: 'real_footage',
    titleHe: 'קליפ מקטעי וידאו אמיתיים',
    descriptionHe: 'עריכה מוזיקלית מקטעי וידאו אמיתיים, בשילוב שיר אישי.',
  },
];

export const PORTFOLIO_VIDEOS: readonly PortfolioVideo[] = [
  {
    id: 'yair',
    titleHe: 'מזל טוב ליאיר',
    categoryId: 'birthday_photos',
    tagsHe: ['פופ', 'ים תיכוני'],
    youtubeUrl: 'https://youtu.be/4rhTEXQGJJU',
    youtubeId: '4rhTEXQGJJU',
  },
  {
    id: 'dad',
    titleHe: 'מזל טוב לאבא',
    categoryId: 'birthday_photos',
    tagsHe: ['בלדה', 'מרגש', 'אחר · המנון הפועל'],
    youtubeUrl: 'https://youtu.be/LX_jkaLsTAw',
    youtubeId: 'LX_jkaLsTAw',
  },
  {
    id: 'babylicious',
    titleHe: 'בייבילישס',
    categoryId: 'real_footage',
    descriptionHe: 'שיר לא-AI עם קליפ שמבוסס על תמונות וסרטונים.',
    tagsHe: [],
    youtubeUrl: 'https://youtu.be/eXWSwv_8uwQ',
    youtubeId: 'eXWSwv_8uwQ',
  },
  {
    id: 'dor-34',
    titleHe: 'DOR 34',
    categoryId: 'ai_generated',
    categoryLabelHe: 'מבוסס על תוכן שנוצר ב-AI',
    descriptionHe: 'קליפ מבוסס על תוכן שנוצר ב-AI — ללא תמונות או סרטונים מהלקוח.',
    tagsHe: ['פופ', 'רוק'],
    youtubeUrl: 'https://youtu.be/8LqiYpObWZc',
    youtubeId: '8LqiYpObWZc',
  },
  {
    id: 'mom',
    titleHe: 'מזל טוב לאמא',
    categoryId: 'birthday_photos',
    tagsHe: ['פופ', 'ג\'אז'],
    youtubeUrl: 'https://youtu.be/QE3Er29fk9U',
    youtubeId: 'QE3Er29fk9U',
  },
];
