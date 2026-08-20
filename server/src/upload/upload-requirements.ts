import type { VideoLengthId } from '../pricing/pricing.types';

/** Minimum photos required per minute of finished video (keep in sync with client upload-requirements.config.ts). */
export const MIN_IMAGES_PER_VIDEO_MINUTE = 18;

export const RECOMMENDED_MAX_IMAGES_PER_VIDEO_MINUTE = 22;

/** Hard maximum photos allowed per minute of finished video. */
export const MAX_IMAGES_PER_VIDEO_MINUTE = 25;

export const MAX_SUPPORTED_VIDEO_LENGTH_ID: VideoLengthId = 'min_4_5';

export function videoLengthIdToMinutes(lengthId: VideoLengthId): number {
  const match = /^min_(\d+)_(\d)$/.exec(lengthId);
  if (!match) return 2;
  return Number(match[1]) + Number(match[2]) / 10;
}

export function getMinimumImageCountForVideoLength(lengthId: VideoLengthId): number {
  return Math.ceil(videoLengthIdToMinutes(lengthId) * MIN_IMAGES_PER_VIDEO_MINUTE);
}

export function getRecommendedMaxImageCountForVideoLength(lengthId: VideoLengthId): number {
  return Math.ceil(videoLengthIdToMinutes(lengthId) * RECOMMENDED_MAX_IMAGES_PER_VIDEO_MINUTE);
}

export function getMaximumImageCountForVideoLength(lengthId: VideoLengthId): number {
  return Math.ceil(videoLengthIdToMinutes(lengthId) * MAX_IMAGES_PER_VIDEO_MINUTE);
}

/** Hard cap on photos per inquiry — max allowed at longest video length (113 at 4.5 min). */
export const MAX_UPLOADED_IMAGES_PER_INQUIRY = getMaximumImageCountForVideoLength(
  MAX_SUPPORTED_VIDEO_LENGTH_ID,
);

export function isVideoLengthId(value: string | undefined): value is VideoLengthId {
  return /^min_\d+_\d$/.test(value ?? '');
}

export function resolveVideoLengthForUploadValidation(params: {
  mainProduct: 'song_only' | 'video_existing_song' | 'video_new_song';
  songLength?: string;
  videoLength?: VideoLengthId;
}): VideoLengthId {
  if (params.mainProduct === 'video_new_song' && isVideoLengthId(params.songLength)) {
    return params.songLength;
  }
  if (isVideoLengthId(params.videoLength)) {
    return params.videoLength;
  }
  return 'min_2_0';
}
