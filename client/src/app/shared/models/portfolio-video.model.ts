export type PortfolioItemKind = 'video' | 'song';

export type PortfolioCategoryId = 'birthday_photos' | 'ai_generated' | 'real_footage' | 'songs';

export interface PortfolioCategory {
  id: PortfolioCategoryId;
  titleHe: string;
  descriptionHe: string;
}

export interface PortfolioVideo {
  id: string;
  titleHe: string;
  categoryId: PortfolioCategoryId;
  kind?: PortfolioItemKind;
  /** Short genre/style tags shown on the card. */
  tagsHe: readonly string[];
  /** Overrides the category badge label on the card when set. */
  categoryLabelHe?: string;
  /** Overrides the category description on the card when set. */
  descriptionHe?: string;
  youtubeUrl: string;
  youtubeId: string;
}
