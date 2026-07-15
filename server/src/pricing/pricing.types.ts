/**
 * Shared pricing identifiers and types for the YERUSHALMI.AI configurator.
 *
 * These identifiers MUST stay in sync with the frontend copy at
 * `client/src/app/core/config/pricing.config.ts`. There is no shared package
 * yet (kept intentionally simple for Milestone 1) - if the identifiers drift,
 * the backend price recalculation will silently ignore unknown selections.
 */

export type MainProductId = 'song_only' | 'video_existing_song' | 'video_new_song';

export type VideoSourceId = 'customer_photos' | 'ai_only' | 'mixed' | 'customer_videos';

export type VideoLengthId = 'up_to_2_min' | 'up_to_3_min' | 'up_to_4_min';

export type SongLengthId = VideoLengthId;

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

/** Raw selection identifiers coming from the client. Never trust attached prices. */
export interface PricingSelection {
  mainProduct: MainProductId;
  videoSource?: VideoSourceId;
  videoLength?: VideoLengthId;
  songLength?: SongLengthId;
  videoFormat?: VideoFormatId;
  subtitles?: SubtitlesId;
  addons: AddonId[];
}

export interface PriceLineItem {
  id: string;
  labelHe: string;
  amount: number;
  quantity: number;
}

export interface PriceBreakdown {
  currency: 'ILS';
  lineItems: PriceLineItem[];
  subtotal: number;
  /** Reserved for future discount campaigns. Always 0 in Milestone 1. */
  discount: number;
  /** Reserved for future VAT handling. Always 0 in Milestone 1 (prices are not final). */
  vatRate: number;
  vatAmount: number;
  total: number;
  /** Always true until real payment/checkout is introduced. */
  isEstimate: true;
}
