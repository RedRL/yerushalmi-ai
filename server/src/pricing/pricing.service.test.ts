import { describe, expect, it } from 'vitest';
import { calculatePriceBreakdown } from './pricing.service';
import {
  ADDON_CONFIG,
  MAIN_PRODUCT_INTRO_PRICES,
  SUBTITLES_PRICES,
  VIDEO_FORMAT_PRICES,
  VIDEO_LENGTH_PRICES,
  VIDEO_SOURCE_PRICES,
} from './pricing.config';
import type { PricingSelection } from './pricing.types';

describe('calculatePriceBreakdown', () => {
  it('charges the song package intro price for song_only', () => {
    const selection: PricingSelection = { mainProduct: 'song_only', addons: [] };
    const breakdown = calculatePriceBreakdown(selection);

    expect(breakdown.total).toBe(MAIN_PRODUCT_INTRO_PRICES.song_only);
    expect(breakdown.lineItems.some((item) => item.id === 'main_product:song_only')).toBe(true);
  });

  it('charges the video package intro price for video_existing_song with no extras', () => {
    const selection: PricingSelection = {
      mainProduct: 'video_existing_song',
      videoSource: 'customer_photos',
      videoLength: 'min_1_0',
      videoFormat: 'landscape',
      subtitles: 'none',
      addons: [],
    };
    const breakdown = calculatePriceBreakdown(selection);

    expect(breakdown.total).toBe(MAIN_PRODUCT_INTRO_PRICES.video_existing_song);
  });

  it('charges the full experience intro price for a 1-minute video_new_song', () => {
    const selection: PricingSelection = {
      mainProduct: 'video_new_song',
      songLength: 'min_1_0',
      videoSource: 'customer_photos',
      videoFormat: 'landscape',
      subtitles: 'none',
      addons: [],
    };
    const breakdown = calculatePriceBreakdown(selection);

    expect(breakdown.total).toBe(MAIN_PRODUCT_INTRO_PRICES.video_new_song);
  });

  it('adds a linear 2-minute surcharge on the full experience (2 × ₪150)', () => {
    const selection: PricingSelection = {
      mainProduct: 'video_new_song',
      songLength: 'min_2_0',
      videoSource: 'customer_photos',
      videoFormat: 'landscape',
      subtitles: 'none',
      addons: [],
    };
    const breakdown = calculatePriceBreakdown(selection);

    expect(breakdown.total).toBe(MAIN_PRODUCT_INTRO_PRICES.video_new_song + 300);
    expect(breakdown.lineItems.some((item) => item.id === 'song_length:min_2_0' && item.amount === 300)).toBe(
      true,
    );
  });

  it('allows a 4-minute full experience length', () => {
    const selection: PricingSelection = {
      mainProduct: 'video_new_song',
      songLength: 'min_4_0',
      videoSource: 'customer_photos',
      videoFormat: 'landscape',
      subtitles: 'none',
      addons: [],
    };
    const breakdown = calculatePriceBreakdown(selection);

    expect(breakdown.total).toBe(MAIN_PRODUCT_INTRO_PRICES.video_new_song + 900);
  });

  it('adds a song_only surcharge for a 1.5-minute length', () => {
    const selection: PricingSelection = {
      mainProduct: 'song_only',
      songLength: 'min_1_5',
      addons: [],
    };
    const breakdown = calculatePriceBreakdown(selection);

    expect(breakdown.total).toBe(MAIN_PRODUCT_INTRO_PRICES.song_only + 50);
  });

  it('adds video source, length, format and subtitle surcharges', () => {
    const selection: PricingSelection = {
      mainProduct: 'video_existing_song',
      videoSource: 'ai_only',
      videoLength: 'min_3_0',
      videoFormat: 'portrait',
      subtitles: 'selected',
      addons: [],
    };
    const breakdown = calculatePriceBreakdown(selection);

    const expectedTotal =
      MAIN_PRODUCT_INTRO_PRICES.video_existing_song +
      VIDEO_SOURCE_PRICES.ai_only.price +
      VIDEO_LENGTH_PRICES.min_3_0.price +
      VIDEO_FORMAT_PRICES.portrait.price +
      SUBTITLES_PRICES.selected.price;

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

    expect(breakdown.total).toBe(MAIN_PRODUCT_INTRO_PRICES.song_only + expectedAddonsTotal);
  });

  it('adds the AI image fill addon for video products', () => {
    const selection: PricingSelection = {
      mainProduct: 'video_existing_song',
      videoSource: 'customer_photos',
      videoLength: 'min_1_0',
      videoFormat: 'landscape',
      subtitles: 'none',
      addons: ['ai_image_fill'],
    };
    const breakdown = calculatePriceBreakdown(selection);

    expect(breakdown.total).toBe(MAIN_PRODUCT_INTRO_PRICES.video_existing_song + ADDON_CONFIG.ai_image_fill.price);
  });

  it('does not apply VAT, and leaves the discount at 0 without a coupon', () => {
    const selection: PricingSelection = { mainProduct: 'song_only', addons: [] };
    const breakdown = calculatePriceBreakdown(selection);

    expect(breakdown.discount).toBe(0);
    expect(breakdown.couponCode).toBeUndefined();
    expect(breakdown.vatAmount).toBe(0);
    expect(breakdown.isEstimate).toBe(true);
  });

  it('applies a 20% discount for the BACKSTAGE coupon, ignoring letter case', () => {
    const selection: PricingSelection = { mainProduct: 'song_only', addons: [], couponCode: 'backstage' };
    const breakdown = calculatePriceBreakdown(selection);
    const discount = Math.round(MAIN_PRODUCT_INTRO_PRICES.song_only * 0.2);

    expect(breakdown.subtotal).toBe(MAIN_PRODUCT_INTRO_PRICES.song_only);
    expect(breakdown.discount).toBe(discount);
    expect(breakdown.total).toBe(MAIN_PRODUCT_INTRO_PRICES.song_only - discount);
    expect(breakdown.couponCode).toBe('BACKSTAGE');
  });

  it('applies a 30% discount for the ALMOGUSHI coupon, ignoring letter case', () => {
    const selection: PricingSelection = { mainProduct: 'song_only', addons: [], couponCode: 'almogushi' };
    const breakdown = calculatePriceBreakdown(selection);
    const discount = Math.round(MAIN_PRODUCT_INTRO_PRICES.song_only * 0.3);

    expect(breakdown.subtotal).toBe(MAIN_PRODUCT_INTRO_PRICES.song_only);
    expect(breakdown.discount).toBe(discount);
    expect(breakdown.total).toBe(MAIN_PRODUCT_INTRO_PRICES.song_only - discount);
    expect(breakdown.couponCode).toBe('ALMOGUSHI');
  });

  it('ignores an unknown coupon code', () => {
    const selection: PricingSelection = { mainProduct: 'song_only', addons: [], couponCode: 'NOPE' };
    const breakdown = calculatePriceBreakdown(selection);

    expect(breakdown.discount).toBe(0);
    expect(breakdown.total).toBe(MAIN_PRODUCT_INTRO_PRICES.song_only);
    expect(breakdown.couponCode).toBeUndefined();
  });

  it('ignores unknown addon identifiers instead of throwing', () => {
    const selection = {
      mainProduct: 'song_only',
      addons: ['not_a_real_addon'],
    } as unknown as PricingSelection;

    expect(() => calculatePriceBreakdown(selection)).not.toThrow();
  });
});
