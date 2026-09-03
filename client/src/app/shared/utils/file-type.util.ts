const EXTENSION_BY_MIME: Record<string, string[]> = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/heic': ['.heic', '.heif'],
  'image/heif': ['.heic', '.heif'],
  'video/mp4': ['.mp4', '.m4v'],
  'video/quicktime': ['.mov'],
  'video/webm': ['.webm'],
  'video/3gpp': ['.3gp'],
};

function fileExtension(name: string): string {
  const dotIndex = name.lastIndexOf('.');
  return dotIndex >= 0 ? name.slice(dotIndex).toLowerCase() : '';
}

const MIME_BY_EXTENSION: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.heic': 'image/heic',
  '.heif': 'image/heif',
  '.mp4': 'video/mp4',
  '.m4v': 'video/mp4',
  '.mov': 'video/quicktime',
  '.webm': 'video/webm',
  '.3gp': 'video/3gpp',
};

/** Resolves a file MIME type from the browser value or the file extension. */
export function resolveFileMimeType(file: File): string {
  const mime = (file.type || '').toLowerCase();
  if (mime && mime !== 'application/octet-stream') {
    return mime;
  }

  return MIME_BY_EXTENSION[fileExtension(file.name)] ?? file.type ?? 'application/octet-stream';
}

/** Checks whether a file matches an HTML `accept` attribute value (MIME types and extensions). */
export function isAcceptedFileType(file: File, accept: string): boolean {
  const accepted = accept
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  if (accepted.length === 0) {
    return true;
  }

  const mime = (file.type || '').toLowerCase();
  const extension = fileExtension(file.name);

  for (const token of accepted) {
    if (token.startsWith('.')) {
      if (extension === token) {
        return true;
      }
      continue;
    }

    if (token.endsWith('/*')) {
      const prefix = token.slice(0, -1);
      if (mime.startsWith(prefix)) {
        return true;
      }
      continue;
    }

    if (mime === token) {
      return true;
    }

    const extensions = EXTENSION_BY_MIME[token];
    if (extensions?.includes(extension)) {
      return true;
    }
  }

  return false;
}
