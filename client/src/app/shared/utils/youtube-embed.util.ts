/** Shared YouTube embed helpers — captions off, JS API enabled. */

export interface YouTubeEmbedOptions {
  autoplay?: boolean;
  mute?: boolean;
  loop?: boolean;
  controls?: boolean;
  origin?: string;
}

export function buildYouTubeEmbedUrl(videoId: string, options: YouTubeEmbedOptions = {}): string {
  const params = new URLSearchParams({
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
    iv_load_policy: '3',
    cc_load_policy: '0',
    enablejsapi: '1',
    autoplay: options.autoplay ? '1' : '0',
    mute: options.mute ? '1' : '0',
    controls: options.controls === false ? '0' : '1',
  });

  if (options.loop) {
    params.set('loop', '1');
    params.set('playlist', videoId);
  }

  if (options.controls === false) {
    params.set('disablekb', '1');
  }

  if (options.origin) {
    params.set('origin', options.origin);
  }

  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

export function postToYouTubePlayer(
  iframe: HTMLIFrameElement | null | undefined,
  func: string,
  args: unknown[] = [],
): void {
  iframe?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func, args }), '*');
}

export function bindYouTubePlayer(iframe: HTMLIFrameElement | null | undefined): void {
  iframe?.contentWindow?.postMessage(JSON.stringify({ event: 'listening', id: 1 }), '*');
}

/** Best-effort: YouTube user prefs can re-enable captions, so call this on load and on play. */
export function disableYouTubeCaptions(iframe: HTMLIFrameElement | null | undefined): void {
  postToYouTubePlayer(iframe, 'unloadModule', ['captions']);
  postToYouTubePlayer(iframe, 'unloadModule', ['cc']);
}
