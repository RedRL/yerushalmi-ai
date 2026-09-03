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
  {
    id: 'songs',
    titleHe: 'דוגמאות לשירים',
    descriptionHe: 'שירים מקוריים בלבד — בלי קליפ.',
  },
];

export const PORTFOLIO_VIDEOS: readonly PortfolioVideo[] = [
  {
    id: 'yair',
    titleHe: 'יום הולדת ליאיר',
    categoryId: 'birthday_photos',
    tagsHe: ['פופ', 'ים תיכוני'],
    descriptionHe:
      'קליפ דוגמה מהדור הקודם של הכלים. היום התוצאה חדה ומדויקת יותר. התמונות שהונפשו מסומנות בקליפ כ-AI generated.',
    youtubeUrl: 'https://youtu.be/4rhTEXQGJJU',
    youtubeId: '4rhTEXQGJJU',
  },
  {
    id: 'mom',
    titleHe: 'יום הולדת לורד',
    categoryId: 'birthday_photos',
    tagsHe: ['פופ', "ג'אז"],
    youtubeUrl: 'https://youtu.be/QE3Er29fk9U',
    youtubeId: 'QE3Er29fk9U',
  },
];

export const PORTFOLIO_SONGS: readonly PortfolioVideo[] = [
  {
    id: 'dad',
    titleHe: 'יום הולדת לשלום',
    categoryId: 'songs',
    kind: 'song',
    tagsHe: ['בלדה', 'אחר · המנון הפועל'],
    youtubeUrl: 'https://youtu.be/LX_jkaLsTAw',
    youtubeId: 'LX_jkaLsTAw',
  },
  {
    id: 'dor-34',
    titleHe: 'יום הולדת לדור',
    categoryId: 'songs',
    kind: 'song',
    categoryLabelHe: 'שיר מקורי',
    tagsHe: ['פופ', 'רוק'],
    youtubeUrl: 'https://youtu.be/8LqiYpObWZc',
    youtubeId: '8LqiYpObWZc',
  },
];
