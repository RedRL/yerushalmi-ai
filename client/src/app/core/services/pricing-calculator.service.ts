import { Injectable } from '@angular/core';
import {
  ADDON_OPTIONS,
  MAIN_PRODUCT_INTRO_PRICES,
  MAIN_PRODUCT_ORIGINAL_PRICES,
  MAIN_PRODUCT_OPTIONS,
  PRODUCT_INCLUDES_NEW_SONG,
  PRODUCT_INCLUDES_VIDEO,
  getSongLengthPrice,
  getSongLengthOptions,
  usesCombinedSongVideoLength,
  SUBTITLES_OPTIONS,
  VIDEO_FORMAT_OPTIONS,
  VIDEO_LENGTH_OPTIONS,
  VIDEO_SOURCE_OPTIONS,
} from '../config/pricing.config';
import type { MainProductId, PriceBreakdown, PricingLineItem, PricingSelection } from '../../shared/models/pricing.model';

export interface PriceTotals {
  introTotal: number;
  originalTotal: number;
}

/**
 * Client-side price estimator for immediate UX feedback while configuring a
 * project. This mirrors `server/src/pricing/pricing.service.ts` but is NOT
 * the source of truth - the backend always recalculates the trusted total
 * from the submitted option identifiers before storing/emailing an inquiry.
 */
@Injectable({ providedIn: 'root' })
export class PricingCalculatorService {
  calculate(selection: PricingSelection): PriceBreakdown {
    return this.calculateWithBasePrices(selection, MAIN_PRODUCT_INTRO_PRICES);
  }

  calculateOriginal(selection: PricingSelection): PriceBreakdown {
    return this.calculateWithBasePrices(selection, MAIN_PRODUCT_ORIGINAL_PRICES);
  }

  estimateTotals(selection: PricingSelection): PriceTotals {
    return {
      introTotal: this.calculate(selection).total,
      originalTotal: this.calculateOriginal(selection).total,
    };
  }

  private calculateWithBasePrices(
    selection: PricingSelection,
    basePrices: Record<MainProductId, number>,
  ): PriceBreakdown {
    const lineItems: PricingLineItem[] = [];
    const includesVideo = PRODUCT_INCLUDES_VIDEO[selection.mainProduct];
    const includesNewSong = PRODUCT_INCLUDES_NEW_SONG[selection.mainProduct];

    const productLabel = MAIN_PRODUCT_OPTIONS.find((option) => option.id === selection.mainProduct)?.titleHe ?? '';
    lineItems.push({
      id: `main_product:${selection.mainProduct}`,
      labelHe: productLabel,
      amount: basePrices[selection.mainProduct],
      quantity: 1,
    });

    if (includesNewSong && selection.songLength) {
      const songLengthPrice = getSongLengthPrice(selection.mainProduct, selection.songLength);
      const options = getSongLengthOptions(selection.mainProduct);
      const songLength = options.find((option) => option.id === selection.songLength);
      lineItems.push({
        id: `song_length:${selection.songLength}`,
        labelHe: `אורך — ${songLength?.labelHe ?? selection.songLength}`,
        amount: songLengthPrice,
        quantity: 1,
      });
    }

    if (includesVideo) {
      const source = VIDEO_SOURCE_OPTIONS.find((option) => option.id === selection.videoSource);
      if (source) {
        lineItems.push({ id: `video_source:${source.id}`, labelHe: source.labelHe, amount: source.price, quantity: 1 });
      }

      const length = VIDEO_LENGTH_OPTIONS.find((option) => option.id === selection.videoLength);
      if (length && !usesCombinedSongVideoLength(selection.mainProduct)) {
        lineItems.push({ id: `video_length:${length.id}`, labelHe: length.labelHe, amount: length.price, quantity: 1 });
      }

      const format = VIDEO_FORMAT_OPTIONS.find((option) => option.id === selection.videoFormat);
      if (format) {
        lineItems.push({ id: `video_format:${format.id}`, labelHe: format.labelHe, amount: format.price, quantity: 1 });
      }

      const subtitles = SUBTITLES_OPTIONS.find((option) => option.id === selection.subtitles);
      if (subtitles) {
        lineItems.push({ id: `subtitles:${subtitles.id}`, labelHe: subtitles.labelHe, amount: subtitles.price, quantity: 1 });
      }
    }

    const uniqueAddons = Array.from(new Set(selection.addons ?? []));
    for (const addonId of uniqueAddons) {
      const addon = ADDON_OPTIONS.find((option) => option.id === addonId);
      if (addon) {
        lineItems.push({ id: `addon:${addon.id}`, labelHe: addon.labelHe, amount: addon.price, quantity: 1 });
      }
    }

    const subtotal = lineItems.reduce((sum, item) => sum + item.amount * item.quantity, 0);

    return {
      currency: 'ILS',
      lineItems,
      subtotal,
      discount: 0,
      vatRate: 0,
      vatAmount: 0,
      total: subtotal,
      isEstimate: true,
    };
  }
}
