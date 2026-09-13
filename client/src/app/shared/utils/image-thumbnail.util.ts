import type { UploadedFileReference } from '../models/upload.model';
import { isHeicLikeFile } from './file-type.util';

function canvasFromSize(width: number, height: number, maxEdgePx: number): HTMLCanvasElement {
  const scale = Math.min(1, maxEdgePx / Math.max(width, height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  return canvas;
}

function thumbnailFromImageElement(
  file: File,
  maxEdgePx: number,
  quality: number,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    const finish = (error?: unknown, dataUrl?: string): void => {
      clearTimeout(timeoutId);
      URL.revokeObjectURL(url);
      if (dataUrl) {
        resolve(dataUrl);
        return;
      }
      reject(error instanceof Error ? error : new Error('Failed to load image for thumbnail'));
    };
    const timeoutId = setTimeout(() => finish(new Error('thumbnail-timeout')), 2500);
    image.onload = () => {
      try {
        const canvas = canvasFromSize(image.naturalWidth, image.naturalHeight, maxEdgePx);
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas not supported');
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        finish(undefined, canvas.toDataURL('image/jpeg', quality));
      } catch (error) {
        finish(error);
      }
    };
    image.onerror = () => finish(new Error('Failed to load image for thumbnail'));
    image.src = url;
  });
}

/** Small JPEG data URL for gallery tiles. Not persisted — localStorage quota is too small on mobile. */
export async function createImageThumbnailDataUrl(
  file: File,
  maxEdgePx = 128,
  quality = 0.62,
): Promise<string> {
  if (typeof createImageBitmap !== 'undefined') {
    try {
      const bitmap = await Promise.race([
        createImageBitmap(file),
        new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('thumbnail-timeout')), 2500);
        }),
      ]);
      try {
        const canvas = canvasFromSize(bitmap.width, bitmap.height, maxEdgePx);
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas not supported');
        ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg', quality);
      } finally {
        bitmap.close();
      }
    } catch {
      // HEIC and some iOS bitmaps fail here; try a regular image decode next.
    }
  }

  return thumbnailFromImageElement(file, maxEdgePx, quality);
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
  file: Pick<UploadedFileReference, 'previewUrl' | 'thumbnailDataUrl' | 'url' | 'type' | 'name'>,
): string | undefined {
  if (file.thumbnailDataUrl) return file.thumbnailDataUrl;
  if (file.type === 'image') {
    if (file.previewUrl && !isHeicLikeFile(file)) return file.previewUrl;
    if (file.url?.startsWith('http')) return file.url;
  }
  return undefined;
}

export function resolveUploadedFileLightboxUrl(
  file: Pick<UploadedFileReference, 'previewUrl' | 'thumbnailDataUrl' | 'url' | 'type' | 'name'>,
): string | undefined {
  if (file.previewUrl && !isHeicLikeFile(file)) return file.previewUrl;
  if (file.thumbnailDataUrl) return file.thumbnailDataUrl;
  if (file.type === 'image' && file.url?.startsWith('http')) return file.url;
  return undefined;
}

export function resolveUploadedFilePreviewUrl(
  file: Pick<UploadedFileReference, 'previewUrl' | 'thumbnailDataUrl' | 'url' | 'type' | 'name'>,
): string | undefined {
  if (file.previewUrl && !isHeicLikeFile(file)) return file.previewUrl;
  if (file.thumbnailDataUrl) return file.thumbnailDataUrl;
  if (file.type === 'image' && file.url?.startsWith('http')) return file.url;
  return undefined;
}
