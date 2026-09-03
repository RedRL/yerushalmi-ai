import type { VideoLengthId } from '../../shared/models/pricing.model';

/** Minimum photos required per minute of finished video (matches upload-step guidance). */
export const MIN_IMAGES_PER_VIDEO_MINUTE = 18;

/** Upper end of the recommended range shown in customer-facing copy. */
export const RECOMMENDED_MAX_IMAGES_PER_VIDEO_MINUTE = 22;

/** Hard maximum photos allowed per minute of finished video. */
export const MAX_IMAGES_PER_VIDEO_MINUTE = 25;

/** Maximum customer-supplied clips allowed per minute of finished video. */
export const MAX_VIDEOS_PER_VIDEO_MINUTE = 3;

/** Maximum duration of each uploaded clip, in seconds. */
export const MAX_VIDEO_DURATION_SECONDS = 30;

/** Longest selectable video length in the configurator. */
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

export function getMaximumVideoCountForVideoLength(lengthId: VideoLengthId): number {
  return Math.ceil(videoLengthIdToMinutes(lengthId) * MAX_VIDEOS_PER_VIDEO_MINUTE);
}

/** Hard cap on short clips per inquiry — max allowed at longest video length. */
export const MAX_UPLOADED_VIDEOS_PER_INQUIRY = getMaximumVideoCountForVideoLength(
  MAX_SUPPORTED_VIDEO_LENGTH_ID,
);

export const MAX_UPLOADED_FILES_PER_INQUIRY =
  MAX_UPLOADED_IMAGES_PER_INQUIRY + MAX_UPLOADED_VIDEOS_PER_INQUIRY;
