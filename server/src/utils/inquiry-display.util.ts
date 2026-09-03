import type { MainProductId, AddonId, VideoLengthId, SongLengthId, VideoFormatId, VideoSourceId, SubtitlesId } from '../pricing/pricing.types';
import {
  ADDON_CONFIG,
  SONG_LENGTH_FULL_EXPERIENCE_PRICES,
  SONG_LENGTH_PRICES,
  SUBTITLES_PRICES,
  usesCombinedSongVideoLength,
  VIDEO_FORMAT_PRICES,
  VIDEO_LENGTH_PRICES,
  VIDEO_SOURCE_PRICES,
} from '../pricing/pricing.config';

export function resolveVideoLengthLabel(lengthId: string | undefined): string | undefined {
  if (!lengthId) return undefined;
  return VIDEO_LENGTH_PRICES[lengthId as VideoLengthId]?.labelHe ?? lengthId;
}

export function resolveSongLengthLabel(
  lengthId: string | undefined,
  mainProduct: MainProductId,
): string | undefined {
  if (!lengthId) return undefined;
  const prices = usesCombinedSongVideoLength(mainProduct)
    ? SONG_LENGTH_FULL_EXPERIENCE_PRICES
    : SONG_LENGTH_PRICES;
  return prices[lengthId as SongLengthId]?.labelHe ?? lengthId;
}

export function resolveVideoFormatLabel(formatId: string | undefined): string | undefined {
  if (!formatId) return undefined;
  return VIDEO_FORMAT_PRICES[formatId as VideoFormatId]?.labelHe ?? formatId;
}

export function resolveVideoSourceLabel(sourceId: string | undefined): string | undefined {
  if (!sourceId) return undefined;
  return VIDEO_SOURCE_PRICES[sourceId as VideoSourceId]?.labelHe ?? sourceId;
}

export function resolveSubtitlesLabel(subtitlesId: string | undefined): string | undefined {
  if (!subtitlesId) return undefined;
  return SUBTITLES_PRICES[subtitlesId as SubtitlesId]?.labelHe ?? subtitlesId;
}

export function resolveVocalistLabel(vocalistId: string | undefined): string | undefined {
  if (!vocalistId) return undefined;
  if (vocalistId === 'male') return 'זמר';
  if (vocalistId === 'female') return 'זמרת';
  if (vocalistId === 'both') return 'שילוב של זמר וזמרת';
  return vocalistId;
}

export function resolveAddonLabel(addonId: string): string {
  return ADDON_CONFIG[addonId as AddonId]?.labelHe ?? addonId;
}

export function resolveAddonLabels(addonIds: string[] | undefined): string[] {
  return (addonIds ?? []).map(resolveAddonLabel);
}

/** Song styles are stored as comma-separated Hebrew labels; append custom style when "אחר" was chosen. */
export function formatSongStyleDisplay(style: string | undefined, customStyle: string | undefined): string | undefined {
  const parts = (style ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  const labels = parts.filter((item) => item !== 'אחר');
  if (parts.includes('אחר') && customStyle?.trim()) {
    labels.push(customStyle.trim());
  }

  return labels.length > 0 ? labels.join(', ') : undefined;
}
