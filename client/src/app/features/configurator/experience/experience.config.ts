import { l10n, type L10nText } from '../../../core/i18n/locale.types';
import type { MainProductId, VideoFormatId, VocalistId } from '../../../shared/models/pricing.model';

export const VIDEO_STILL_SRC = '/configurator/video-still-source.jpg';

export const FILLED_STILLS: Partial<Record<VideoFormatId, string>> = {
  landscape: '/configurator/video-still-16x9.jpg',
  classic: '/configurator/video-still-4x3.jpg',
  square: '/configurator/video-still-1x1.jpg',
  portrait: '/configurator/video-still-9x16.jpg',
  portrait_3_4: '/configurator/video-still.png',
};
export const SUBTITLE_SAMPLE = l10n('זה הרגע שלכם', 'This is your moment');

export interface ToneVisual {
  color: string;
  ink: string;
}

export const PRODUCT_VISUALS: Record<MainProductId, { image: string; blurb: L10nText }> = {
  song_only: {
    image: '/configurator/product-song.png',
    blurb: l10n('שיר מקורי, שנכתב רק עבורכם', 'An original song, written just for you'),
  },
  video_existing_song: {
    image: '/configurator/product-video.png',
    blurb: l10n('קליפ לרקע שיר שאתם בוחרים', 'A video set to a song you choose'),
  },
  video_new_song: {
    image: '/configurator/product-full.png',
    blurb: l10n('שיר וקליפ, מהרעיון ועד היצירה המוכנה', 'A song and a video, from the idea to the finished piece'),
  },
};

export const STYLE_TONES: Record<string, ToneVisual> = {
  'פופ': { color: '#ff4d8d', ink: '#fff8fb' },
  'רוק': { color: '#ef4444', ink: '#fff7f7' },
  'ים תיכוני': { color: '#f5a524', ink: '#1c1304' },
  'בלדה': { color: '#8b5cf6', ink: '#f7f3ff' },
  'היפ הופ': { color: '#14532d', ink: '#ecfdf3' },
  'גוספל': { color: '#f6d365', ink: '#2a2108' },
  'קאנטרי': { color: '#d97706', ink: '#fff8ef' },
  'בלוז': { color: '#3b82f6', ink: '#f4f8ff' },
  'אינדי': { color: '#2dd4bf', ink: '#042f2e' },
  'אחר': { color: '#c084fc', ink: '#1e1033' },
};

export const VOICE_TONES: Record<VocalistId, ToneVisual> = {
  male: { color: '#1d4ed8', ink: '#f5f8ff' },
  female: { color: '#e11d48', ink: '#fff5f7' },
  both: { color: '#7c3aed', ink: '#f7f3ff' },
};

export const FORMAT_CAPTIONS: Record<VideoFormatId, L10nText> = {
  landscape: l10n('לרוחב', 'Landscape'),
  classic: l10n('קלאסי', 'Classic'),
  square: l10n('ריבוע', 'Square'),
  portrait: l10n('סטורי', 'Story'),
  portrait_3_4: l10n('פורטרט', 'Portrait'),
  both: l10n('שני הפורמטים', 'Both formats'),
};
