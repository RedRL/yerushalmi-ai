export type PortfolioCategoryId = 'birthday_photos' | 'ai_generated' | 'real_footage';

export interface PortfolioCategory {
  id: PortfolioCategoryId;
  titleHe: string;
  descriptionHe: string;
}

export interface PortfolioVideo {
  id: string;
  titleHe: string;
  categoryId: PortfolioCategoryId;
  youtubeUrl: string;
  youtubeId: string;
}
