import {
  ADDON_CONFIG,
  MAIN_PRODUCT_INTRO_PRICES,
  MAIN_PRODUCT_LABELS,
  PRODUCT_INCLUDES_NEW_SONG,
  PRODUCT_INCLUDES_VIDEO,
  SONG_LENGTH_PRICES,
  SONG_LENGTH_FULL_EXPERIENCE_PRICES,
  usesCombinedSongVideoLength,
  SUBTITLES_PRICES,
  VAT_RATE,
  VIDEO_FORMAT_PRICES,
  VIDEO_LENGTH_PRICES,
  VIDEO_SOURCE_PRICES,
} from './pricing.config';
import type { PriceBreakdown, PriceLineItem, PricingSelection } from './pricing.types';

/**
 * Pure pricing calculation. Given validated selection identifiers, returns the
 * trusted, server-calculated price breakdown. This function must never trust
 * or read any price/total sent from the client - only option identifiers.
 */
export function calculatePriceBreakdown(selection: PricingSelection): PriceBreakdown {
  const lineItems: PriceLineItem[] = [];
  const includesVideo = PRODUCT_INCLUDES_VIDEO[selection.mainProduct];
  const includesNewSong = PRODUCT_INCLUDES_NEW_SONG[selection.mainProduct];

  lineItems.push({
    id: `main_product:${selection.mainProduct}`,
    labelHe: MAIN_PRODUCT_LABELS[selection.mainProduct],
    amount: MAIN_PRODUCT_INTRO_PRICES[selection.mainProduct],
    quantity: 1,
  });

  if (includesNewSong && selection.songLength) {
    const songLengthPrices =
      selection.mainProduct === 'video_new_song'
        ? SONG_LENGTH_FULL_EXPERIENCE_PRICES
        : SONG_LENGTH_PRICES;
    const songLength = songLengthPrices[selection.songLength];
    if (songLength && songLength.price > 0) {
      lineItems.push({
        id: `song_length:${selection.songLength}`,
        labelHe: `אורך שיר — ${songLength.labelHe}`,
        amount: songLength.price,
        quantity: 1,
      });
    }
  }

  if (includesVideo) {
    if (selection.videoSource) {
      const source = VIDEO_SOURCE_PRICES[selection.videoSource];
      if (source) {
        lineItems.push({
          id: `video_source:${selection.videoSource}`,
          labelHe: source.labelHe,
          amount: source.price,
          quantity: 1,
        });
      }
    }

    if (selection.videoLength && !usesCombinedSongVideoLength(selection.mainProduct)) {
      const length = VIDEO_LENGTH_PRICES[selection.videoLength];
      if (length) {
        lineItems.push({
          id: `video_length:${selection.videoLength}`,
          labelHe: length.labelHe,
          amount: length.price,
          quantity: 1,
        });
      }
    }

    if (selection.videoFormat) {
      const format = VIDEO_FORMAT_PRICES[selection.videoFormat];
      if (format && format.price > 0) {
        lineItems.push({
          id: `video_format:${selection.videoFormat}`,
          labelHe: format.labelHe,
          amount: format.price,
          quantity: 1,
        });
      }
    }

    if (selection.subtitles) {
      const subtitles = SUBTITLES_PRICES[selection.subtitles];
      if (subtitles) {
        lineItems.push({
          id: `subtitles:${selection.subtitles}`,
          labelHe: subtitles.labelHe,
          amount: subtitles.price,
          quantity: 1,
        });
      }
    }
  }

  const uniqueAddons = Array.from(new Set(selection.addons ?? []));
  for (const addonId of uniqueAddons) {
    const addon = ADDON_CONFIG[addonId];
    if (addon) {
      lineItems.push({
        id: `addon:${addonId}`,
        labelHe: addon.labelHe,
        amount: addon.price,
        quantity: 1,
      });
    }
  }

  const subtotal = lineItems.reduce((sum, item) => sum + item.amount * item.quantity, 0);
  const discount = 0;
  const vatAmount = Math.round(subtotal * VAT_RATE * 100) / 100;
  const total = subtotal - discount + vatAmount;

  return {
    currency: 'ILS',
    lineItems,
    subtotal,
    discount,
    vatRate: VAT_RATE,
    vatAmount,
    total,
    isEstimate: true,
  };
}
