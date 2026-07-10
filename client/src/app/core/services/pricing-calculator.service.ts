import { Injectable } from '@angular/core';
import {
  ADDON_OPTIONS,
  MAIN_PRODUCT_OPTIONS,
  NEW_SONG_BASE_PRICE,
  PRODUCT_INCLUDES_NEW_SONG,
  PRODUCT_INCLUDES_VIDEO,
  SUBTITLES_OPTIONS,
  VIDEO_BASE_PRICE,
  VIDEO_FORMAT_OPTIONS,
  VIDEO_LENGTH_OPTIONS,
  VIDEO_SOURCE_OPTIONS,
} from '../config/pricing.config';
import type { PriceBreakdown, PricingLineItem, PricingSelection } from '../../shared/models/pricing.model';

/**
 * Client-side price estimator for immediate UX feedback while configuring a
 * project. This mirrors `server/src/pricing/pricing.service.ts` but is NOT
 * the source of truth - the backend always recalculates the trusted total
 * from the submitted option identifiers before storing/emailing an inquiry.
 */
@Injectable({ providedIn: 'root' })
export class PricingCalculatorService {
  calculate(selection: PricingSelection): PriceBreakdown {
    const lineItems: PricingLineItem[] = [];

    const includesNewSong = PRODUCT_INCLUDES_NEW_SONG[selection.mainProduct];
    const includesVideo = PRODUCT_INCLUDES_VIDEO[selection.mainProduct];

    const productLabel = MAIN_PRODUCT_OPTIONS.find((option) => option.id === selection.mainProduct)?.titleHe ?? '';
    lineItems.push({ id: `main_product:${selection.mainProduct}`, labelHe: productLabel, amount: 0, quantity: 1 });

    if (includesNewSong) {
      lineItems.push({ id: 'new_song_base', labelHe: 'שיר אישי מקורי', amount: NEW_SONG_BASE_PRICE, quantity: 1 });
    }

    if (includesVideo) {
      lineItems.push({ id: 'video_base', labelHe: 'יצירת קליפ', amount: VIDEO_BASE_PRICE, quantity: 1 });

      const source = VIDEO_SOURCE_OPTIONS.find((option) => option.id === selection.videoSource);
      if (source) {
        lineItems.push({ id: `video_source:${source.id}`, labelHe: source.labelHe, amount: source.price, quantity: 1 });
      }

      const length = VIDEO_LENGTH_OPTIONS.find((option) => option.id === selection.videoLength);
      if (length) {
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
