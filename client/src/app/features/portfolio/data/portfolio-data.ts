import type { PortfolioCategory, PortfolioVideo } from '../../../shared/models/portfolio-video.model';

export const PORTFOLIO_CATEGORIES: readonly PortfolioCategory[] = [
  {
    id: 'birthday_photos',
    titleHe: 'סרטוני יום הולדת מתמונות אמיתיות',
    descriptionHe: 'תמונות אמיתיות שהופכות לסצנות וידאו מרגשות, יחד עם שיר אישי שנכתב במיוחד.',
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
    youtubeUrl: 'https://youtu.be/4rhTEXQGJJU',
    youtubeId: '4rhTEXQGJJU',
  },
  {
    id: 'dad',
    titleHe: 'מזל טוב לאבא',
    categoryId: 'birthday_photos',
    youtubeUrl: 'https://youtu.be/LX_jkaLsTAw',
    youtubeId: 'LX_jkaLsTAw',
  },
  {
    id: 'mom',
    titleHe: 'מזל טוב לאמא',
    categoryId: 'birthday_photos',
    youtubeUrl: 'https://youtu.be/QE3Er29fk9U',
    youtubeId: 'QE3Er29fk9U',
  },
  {
    id: 'aviv',
    titleHe: 'מזל טוב לאביב',
    categoryId: 'ai_generated',
    youtubeUrl: 'https://youtu.be/KToRrp1NDxw',
    youtubeId: 'KToRrp1NDxw',
  },
  {
    id: 'dor-34',
    titleHe: 'Dor 34',
    categoryId: 'ai_generated',
    youtubeUrl: 'https://youtu.be/8LqiYpObWZc',
    youtubeId: '8LqiYpObWZc',
  },
  {
    id: 'babylicious',
    titleHe: 'בייבילישס',
    categoryId: 'real_footage',
    youtubeUrl: 'https://youtu.be/eXWSwv_8uwQ',
    youtubeId: 'eXWSwv_8uwQ',
  },
];
