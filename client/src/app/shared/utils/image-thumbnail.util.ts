import type { UploadedFileReference } from '../models/upload.model';

/** Small JPEG data URL for gallery tiles — persisted in localStorage across refresh. */
export async function createImageThumbnailDataUrl(
  file: File,
  maxEdgePx = 160,
  quality = 0.72,
): Promise<string> {
  if (typeof createImageBitmap !== 'undefined') {
    const bitmap = await createImageBitmap(file);
    try {
      const scale = Math.min(1, maxEdgePx / Math.max(bitmap.width, bitmap.height));
      const width = Math.max(1, Math.round(bitmap.width * scale));
      const height = Math.max(1, Math.round(bitmap.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported');
      ctx.drawImage(bitmap, 0, 0, width, height);
      return canvas.toDataURL('image/jpeg', quality);
    } finally {
      bitmap.close();
    }
  }

  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      try {
        const scale = Math.min(1, maxEdgePx / Math.max(image.naturalWidth, image.naturalHeight));
        const width = Math.max(1, Math.round(image.naturalWidth * scale));
        const height = Math.max(1, Math.round(image.naturalHeight * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas not supported');
        ctx.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      } catch (error) {
        reject(error);
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for thumbnail'));
    };
    image.src = url;
  });
}

/** First-frame JPEG data URL for gallery tiles. */
export async function createVideoThumbnailDataUrl(
  file: File,
  maxEdgePx = 160,
  quality = 0.72,
): Promise<string> {
  const url = URL.createObjectURL(file);
  const video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;
  video.preload = 'auto';

  try {
    await new Promise<void>((resolve, reject) => {
      video.onloadeddata = () => resolve();
      video.onerror = () => reject(new Error('Failed to load video for thumbnail'));
      video.src = url;
      video.load();
    });

    const seekTo = Number.isFinite(video.duration) && video.duration > 0
      ? Math.min(0.15, video.duration * 0.05)
      : 0;
    if (video.currentTime !== seekTo) {
      await new Promise<void>((resolve) => {
        video.onseeked = () => resolve();
        video.currentTime = seekTo;
      });
    }

    const width = video.videoWidth || maxEdgePx;
    const height = video.videoHeight || maxEdgePx;
    const scale = Math.min(1, maxEdgePx / Math.max(width, height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas not supported');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', quality);
  } finally {
    video.removeAttribute('src');
    video.load();
    URL.revokeObjectURL(url);
  }
}

export function resolveUploadedFileTileUrl(
  file: Pick<UploadedFileReference, 'previewUrl' | 'thumbnailDataUrl' | 'url' | 'type'>,
): string | undefined {
  if (file.thumbnailDataUrl) return file.thumbnailDataUrl;
  if (file.type === 'image') {
    if (file.previewUrl) return file.previewUrl;
    if (file.url?.startsWith('http')) return file.url;
  }
  return undefined;
}

export function resolveUploadedFileLightboxUrl(
  file: Pick<UploadedFileReference, 'previewUrl' | 'thumbnailDataUrl' | 'url' | 'type'>,
): string | undefined {
  if (file.previewUrl) return file.previewUrl;
  if (file.type === 'image' && file.url?.startsWith('http')) return file.url;
  return undefined;
}

export function resolveUploadedFilePreviewUrl(
  file: Pick<UploadedFileReference, 'previewUrl' | 'thumbnailDataUrl' | 'url' | 'type'>,
): string | undefined {
  if (file.previewUrl) return file.previewUrl;
  if (file.thumbnailDataUrl) return file.thumbnailDataUrl;
  if (file.type === 'image' && file.url?.startsWith('http')) return file.url;
  return undefined;
}
