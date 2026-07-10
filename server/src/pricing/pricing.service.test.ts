import { describe, expect, it } from 'vitest';
import { calculatePriceBreakdown } from './pricing.service';
import {
  ADDON_CONFIG,
  NEW_SONG_BASE_PRICE,
  SUBTITLES_PRICES,
  VIDEO_BASE_PRICE,
  VIDEO_FORMAT_PRICES,
  VIDEO_LENGTH_PRICES,
  VIDEO_SOURCE_PRICES,
} from './pricing.config';
import type { PricingSelection } from './pricing.types';

describe('calculatePriceBreakdown', () => {
  it('charges only the new song price for song_only', () => {
    const selection: PricingSelection = { mainProduct: 'song_only', addons: [] };
    const breakdown = calculatePriceBreakdown(selection);

    expect(breakdown.total).toBe(NEW_SONG_BASE_PRICE);
    expect(breakdown.lineItems.some((item) => item.id === 'video_base')).toBe(false);
    expect(breakdown.lineItems.some((item) => item.id === 'new_song_base')).toBe(true);
  });

  it('charges only the video base price for video_existing_song with no extras', () => {
    const selection: PricingSelection = {
      mainProduct: 'video_existing_song',
      videoSource: 'customer_photos',
      videoLength: 'up_to_1_min',
      videoFormat: 'landscape',
      subtitles: 'none',
      addons: [],
    };
    const breakdown = calculatePriceBreakdown(selection);

    expect(breakdown.total).toBe(VIDEO_BASE_PRICE);
    expect(breakdown.lineItems.some((item) => item.id === 'new_song_base')).toBe(false);
  });

  it('charges both the new song and video base price for video_new_song', () => {
    const selection: PricingSelection = {
      mainProduct: 'video_new_song',
      videoSource: 'customer_photos',
      videoLength: 'up_to_1_min',
      videoFormat: 'landscape',
      subtitles: 'none',
      addons: [],
    };
    const breakdown = calculatePriceBreakdown(selection);

    expect(breakdown.total).toBe(NEW_SONG_BASE_PRICE + VIDEO_BASE_PRICE);
  });

  it('adds video source, length, format and subtitle surcharges', () => {
    const selection: PricingSelection = {
      mainProduct: 'video_existing_song',
      videoSource: 'ai_only',
      videoLength: 'up_to_3_min',
      videoFormat: 'both',
      subtitles: 'full',
      addons: [],
    };
    const breakdown = calculatePriceBreakdown(selection);

    const expectedTotal =
      VIDEO_BASE_PRICE +
      VIDEO_SOURCE_PRICES.ai_only.price +
      VIDEO_LENGTH_PRICES.up_to_3_min.price +
      VIDEO_FORMAT_PRICES.both.price +
      SUBTITLES_PRICES.full.price;

    expect(breakdown.total).toBe(expectedTotal);
  });

  it('sums all requested addons exactly once, ignoring duplicates', () => {
    const selection: PricingSelection = {
      mainProduct: 'song_only',
      addons: ['extra_revision_round', 'extra_revision_round', 'separate_audio_file'],
    };
    const breakdown = calculatePriceBreakdown(selection);

    const expectedAddonsTotal =
      ADDON_CONFIG.extra_revision_round.price + ADDON_CONFIG.separate_audio_file.price;

    expect(breakdown.total).toBe(NEW_SONG_BASE_PRICE + expectedAddonsTotal);
  });

  it('never applies VAT or discounts in Milestone 1', () => {
    const selection: PricingSelection = { mainProduct: 'song_only', addons: [] };
    const breakdown = calculatePriceBreakdown(selection);

    expect(breakdown.discount).toBe(0);
    expect(breakdown.vatAmount).toBe(0);
    expect(breakdown.isEstimate).toBe(true);
  });

  it('ignores unknown addon identifiers instead of throwing', () => {
    const selection = {
      mainProduct: 'song_only',
      addons: ['not_a_real_addon'],
    } as unknown as PricingSelection;

    expect(() => calculatePriceBreakdown(selection)).not.toThrow();
  });
});
