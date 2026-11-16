export type PortfolioItemKind = 'video' | 'song';

export type PortfolioCategoryId = 'birthday_photos' | 'ai_generated' | 'real_footage' | 'songs';

export interface PortfolioCategory {
  id: PortfolioCategoryId;
  titleHe: string;
  titleEn: string;
  descriptionHe: string;
  descriptionEn: string;
}

export interface PortfolioVideo {
  id: string;
  titleHe: string;
  titleEn: string;
  categoryId: PortfolioCategoryId;
  kind?: PortfolioItemKind;
  /** Short genre/style tags shown on the card. */
  tagsHe: readonly string[];
  tagsEn: readonly string[];
  /** Words or phrases that had to appear in the lyrics — kept as-is in both locales. */
  requiredWordsHe?: readonly string[];
  /** Overrides the category badge label on the card when set. */
  categoryLabelHe?: string;
  categoryLabelEn?: string;
  /** Overrides the category description on the card when set. */
  descriptionHe?: string;
  descriptionEn?: string;
  youtubeUrl?: string;
  youtubeId?: string;
  /** Local or hosted audio file. When set, songs play in a native player instead of YouTube. */
  audioUrl?: string;
}
