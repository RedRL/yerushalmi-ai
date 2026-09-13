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
      'קליפ דוגמה מהדור הקודם של הכלים, באורך של כ־2 דקות. היום התוצאה חדה ומדויקת יותר. התמונות שהונפשו מסומנות בקליפ כ-AI Generate.',
    youtubeUrl: 'https://youtu.be/4rhTEXQGJJU',
    youtubeId: '4rhTEXQGJJU',
  },
  {
    id: 'tal',
    titleHe: 'יום הולדת לטל',
    categoryId: 'birthday_photos',
    tagsHe: ['היפ הופ', 'גוספל'],
    descriptionHe: 'קליפ דוגמה עם טכנולוגיות מתקדמות יותר, באורך של כ־3 דקות.',
    requiredWordsHe: ['כוסית על'],
    youtubeUrl: 'https://youtu.be/ch_ACN8mS_w',
    youtubeId: 'ch_ACN8mS_w',
  },
  {
    id: 'mom',
    titleHe: 'יום הולדת לורד',
    categoryId: 'birthday_photos',
    tagsHe: ['פופ', "ג'אז"],
    descriptionHe:
      'קליפ דוגמה שמשלב הנפשת תמונות בטכנולוגיות ישנות יותר וסרטונים אמיתיים, באורך של כ־3 וחצי דקות.',
    youtubeUrl: 'https://youtu.be/QE3Er29fk9U',
    youtubeId: 'QE3Er29fk9U',
  },
];

export const PORTFOLIO_REACTIONS: readonly PortfolioVideo[] = [
  {
    id: 'tal-reaction',
    titleHe: 'טליה מגיבה לסרטון',
    categoryId: 'birthday_photos',
    categoryLabelHe: 'תגובה',
    tagsHe: [],
    descriptionHe: 'טלטול מגיבה לקליפ יום ההולדת שלה.',
    youtubeUrl: 'https://youtu.be/cL_UgC1TmGo',
    youtubeId: 'cL_UgC1TmGo',
  },
];

export const PORTFOLIO_SONGS: readonly PortfolioVideo[] = [
  {
    id: 'dor-34',
    titleHe: 'יום הולדת לדור',
    categoryId: 'songs',
    kind: 'song',
    categoryLabelHe: 'שיר מקורי',
    descriptionHe: 'שיר מקורי באורך של כ־3 וחצי דקות.',
    tagsHe: ['פופ', 'רוק'],
    requiredWordsHe: ['הבוטנים האסירים', 'הראלון של השבתות'],
    audioUrl: '/audio/DOR 34.mp3',
  },
];
