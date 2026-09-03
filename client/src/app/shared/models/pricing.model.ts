export type MainProductId = 'song_only' | 'video_existing_song' | 'video_new_song';

export type VideoSourceId = 'customer_photos' | 'ai_only' | 'mixed' | 'customer_videos';

export type VideoLengthId =
  | 'min_2_0'
  | 'min_2_5'
  | 'min_3_0'
  | 'min_3_5'
  | 'min_4_0'
  | 'min_4_5';

export type SongLengthId = VideoLengthId;

export type VideoFormatId = 'landscape' | 'portrait' | 'portrait_3_4' | 'classic' | 'square' | 'both';

export type SubtitlesId = 'none' | 'selected' | 'full';

export type VocalistId = 'male' | 'female' | 'both';

export type AddonId =
  | 'social_short_version'
  | 'custom_intro'
  | 'outro_screen'
  | 'names_dates_overlay'
  | 'extra_version'
  | 'separate_audio_file'
  | 'extra_revision_round'
  | 'ai_image_fill';

export interface MainProductOption {
  id: MainProductId;
  titleHe: string;
  descriptionHe: string;
}

export interface SelectableOption<TId extends string> {
  id: TId;
  labelHe: string;
  descriptionHe?: string;
}

export interface PriceableOption<TId extends string> extends SelectableOption<TId> {
  /** Frontend estimate only - the backend recalculates this from `id`. */
  price: number;
}

export interface AddonOption extends PriceableOption<AddonId> {
  /** Used to filter which addons make sense to show for the current product/video selection. */
  videoOnly: boolean;
}

/** Raw selection identifiers sent to the backend for trusted recalculation. */
export interface PricingSelection {
  mainProduct: MainProductId;
  videoSource?: VideoSourceId;
  videoLength?: VideoLengthId;
  songLength?: SongLengthId;
  videoFormat?: VideoFormatId;
  subtitles?: SubtitlesId;
  addons: AddonId[];
}

export interface PricingLineItem {
  id: string;
  labelHe: string;
  amount: number;
  quantity: number;
}

export interface PriceBreakdown {
  currency: 'ILS';
  lineItems: PricingLineItem[];
  subtotal: number;
  discount: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  isEstimate: true;
}
