import type { UploadedFileReference } from '../models/upload.model';
import { isHeicLikeFile } from './file-type.util';

const TILE_MAX_EDGE_PX = 160;
const LIGHTBOX_MAX_EDGE_PX = 1280;
const TILE_QUALITY = 0.62;
const LIGHTBOX_QUALITY = 0.72;
const DECODE_TIMEOUT_MS = 8000;

export interface ImagePreviewSet {
  thumbnailDataUrl: string;
  lightboxPreviewUrl: string;
}

function canvasFromSize(width: number, height: number, maxEdgePx: number): HTMLCanvasElement {
  const scale = Math.min(1, maxEdgePx / Math.max(width, height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  return canvas;
}

function drawToCanvas(
  source: CanvasImageSource,
  width: number,
  height: number,
  maxEdgePx: number,
): HTMLCanvasElement {
  const canvas = canvasFromSize(width, height, maxEdgePx);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas;
}

function canvasToJpegBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to encode image preview'));
        return;
      }
      resolve(blob);
    }, 'image/jpeg', quality);
  });
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(label)), ms);
    }),
  ]);
}

function loadHtmlImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    const finish = (error?: unknown): void => {
      URL.revokeObjectURL(url);
      if (error) {
        reject(error instanceof Error ? error : new Error('Failed to load image for preview'));
        return;
      }
      resolve(image);
    };
    image.onload = () => finish();
    image.onerror = () => finish(new Error('Failed to load image for preview'));
    image.src = url;
  });
}

async function decodeBitmap(file: File): Promise<ImageBitmap> {
  return withTimeout(
    createImageBitmap(file, { imageOrientation: 'from-image' }),
    DECODE_TIMEOUT_MS,
    'preview-timeout',
  );
}

function previewsFromSource(
  source: CanvasImageSource,
  width: number,
  height: number,
): Promise<ImagePreviewSet> {
  const lightboxCanvas = drawToCanvas(source, width, height, LIGHTBOX_MAX_EDGE_PX);
  const thumbCanvas = drawToCanvas(source, width, height, TILE_MAX_EDGE_PX);
  const thumbnailDataUrl = thumbCanvas.toDataURL('image/jpeg', TILE_QUALITY);
  return canvasToJpegBlob(lightboxCanvas, LIGHTBOX_QUALITY).then((blob) => ({
    thumbnailDataUrl,
    lightboxPreviewUrl: URL.createObjectURL(blob),
  }));
}

/** Tile JPEG + medium lightbox blob URL from a single decode. */
export async function createImagePreviewSet(file: File): Promise<ImagePreviewSet> {
  if (typeof createImageBitmap !== 'undefined') {
    try {
      const bitmap = await decodeBitmap(file);
      try {
        return await previewsFromSource(bitmap, bitmap.width, bitmap.height);
      } finally {
        bitmap.close();
      }
    } catch {
      // HEIC and some iOS bitmaps fail here; try a regular image decode next.
    }
  }

  const image = await withTimeout(loadHtmlImage(file), DECODE_TIMEOUT_MS, 'preview-timeout');
  return previewsFromSource(image, image.naturalWidth, image.naturalHeight);
}

/** Small JPEG data URL for gallery tiles. Not persisted — localStorage quota is too small on mobile. */
export async function createImageThumbnailDataUrl(
  file: File,
  maxEdgePx = TILE_MAX_EDGE_PX,
  quality = TILE_QUALITY,
): Promise<string> {
  const previews = await createImagePreviewSet(file);
  URL.revokeObjectURL(previews.lightboxPreviewUrl);
  if (maxEdgePx === TILE_MAX_EDGE_PX && quality === TILE_QUALITY) {
    return previews.thumbnailDataUrl;
  }
  return previews.thumbnailDataUrl;
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
    const canvas = drawToCanvas(video, width, height, maxEdgePx);
    return canvas.toDataURL('image/jpeg', quality);
  } finally {
    video.removeAttribute('src');
    video.load();
    URL.revokeObjectURL(url);
  }
}

export function resolveUploadedFileTileUrl(
  file: Pick<UploadedFileReference, 'previewUrl' | 'thumbnailDataUrl' | 'lightboxPreviewUrl' | 'url' | 'type' | 'name'>,
): string | undefined {
  if (file.thumbnailDataUrl) return file.thumbnailDataUrl;
  if (file.type === 'image' && file.url?.startsWith('http')) return file.url;
  return undefined;
}

export function resolveUploadedFileLightboxUrl(
  file: Pick<UploadedFileReference, 'previewUrl' | 'thumbnailDataUrl' | 'lightboxPreviewUrl' | 'url' | 'type' | 'name'>,
): string | undefined {
  if (file.lightboxPreviewUrl) return file.lightboxPreviewUrl;
  if (file.previewUrl && !isHeicLikeFile(file)) return file.previewUrl;
  if (file.thumbnailDataUrl) return file.thumbnailDataUrl;
  if (file.type === 'image' && file.url?.startsWith('http')) return file.url;
  return undefined;
}

export function resolveUploadedFilePreviewUrl(
  file: Pick<UploadedFileReference, 'previewUrl' | 'thumbnailDataUrl' | 'lightboxPreviewUrl' | 'url' | 'type' | 'name'>,
): string | undefined {
  return resolveUploadedFileLightboxUrl(file);
}
