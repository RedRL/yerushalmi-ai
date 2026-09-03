const MAX_EDGE_PX = 1920;
const JPEG_QUALITY = 0.82;
const SKIP_UNDER_BYTES = 400 * 1024;

function isJpeg(file: File): boolean {
  const mime = (file.type || '').toLowerCase();
  const name = file.name.toLowerCase();
  return mime === 'image/jpeg' || name.endsWith('.jpg') || name.endsWith('.jpeg');
}

function canvasToJpegFile(canvas: HTMLCanvasElement, originalName: string): Promise<File> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Image compression failed'));
          return;
        }
        const name = originalName.replace(/\.[^.]+$/, '') + '.jpg';
        resolve(new File([blob], name, { type: 'image/jpeg' }));
      },
      'image/jpeg',
      JPEG_QUALITY,
    );
  });
}

/** Shrinks large photos before upload to speed up mobile submissions. Falls back to the original file. */
export async function compressImageForUpload(file: File): Promise<File> {
  if (file.size <= SKIP_UNDER_BYTES && isJpeg(file)) {
    return file;
  }

  try {
    if (typeof createImageBitmap !== 'undefined') {
      const bitmap = await createImageBitmap(file);
      try {
        const scale = Math.min(1, MAX_EDGE_PX / Math.max(bitmap.width, bitmap.height));
        if (scale >= 1 && isJpeg(file) && file.size <= SKIP_UNDER_BYTES * 2) {
          return file;
        }

        const width = Math.max(1, Math.round(bitmap.width * scale));
        const height = Math.max(1, Math.round(bitmap.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return file;
        ctx.drawImage(bitmap, 0, 0, width, height);
        const compressed = await canvasToJpegFile(canvas, file.name);
        return compressed.size > 0 && compressed.size < file.size ? compressed : file;
      } finally {
        bitmap.close();
      }
    }
  } catch {
    return file;
  }

  return file;
}
