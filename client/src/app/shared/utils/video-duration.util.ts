const READ_TIMEOUT_MS = 8_000;

/** Reads media duration in seconds from a local video file. */
export function readVideoDurationSeconds(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;

    const cleanup = (): void => {
      window.clearTimeout(timeoutId);
      video.removeAttribute('src');
      video.load();
      URL.revokeObjectURL(url);
    };

    const timeoutId = window.setTimeout(() => {
      cleanup();
      reject(new Error('לא ניתן לקרוא את אורך הסרטון. נסו קובץ אחר.'));
    }, READ_TIMEOUT_MS);

    video.onloadedmetadata = () => {
      const duration = video.duration;
      cleanup();
      if (!Number.isFinite(duration) || duration <= 0) {
        reject(new Error('לא ניתן לקרוא את אורך הסרטון. נסו קובץ אחר.'));
        return;
      }
      resolve(duration);
    };

    video.onerror = () => {
      cleanup();
      reject(new Error('לא ניתן לקרוא את הסרטון. ודאו שמדובר בקובץ וידאו תקין.'));
    };

    video.src = url;
  });
}
