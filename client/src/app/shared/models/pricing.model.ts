export type MainProductId = 'song_only' | 'video_existing_song' | 'video_new_song';

export type VideoSourceId = 'customer_photos' | 'ai_only' | 'mixed' | 'customer_videos';

export type VideoLengthId = 'up_to_1_min' | 'up_to_2_min' | 'up_to_3_min' | 'custom_length';

export type VideoFormatId = 'landscape' | 'portrait' | 'both';

export type SubtitlesId = 'none' | 'selected' | 'full';

export type AddonId =
  | 'social_short_version'
  | 'custom_intro'
  | 'outro_screen'
  | 'names_dates_overlay'
  | 'extra_version'
  | 'separate_audio_file'
  | 'extra_revision_round';

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
