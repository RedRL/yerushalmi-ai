const STORAGE_PREFIX = 'yerushalmi.scroll.v1:';
const MAX_RESTORE_ATTEMPTS = 24;

function storageKey(pathname: string): string {
  return `${STORAGE_PREFIX}${pathname || '/'}`;
}

/** Prefer manual restoration so refresh returns to the saved position reliably. */
export function enableManualScrollRestoration(): void {
  if (typeof history !== 'undefined' && 'scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
}

export function savePageScrollPosition(pathname = window.location.pathname): void {
  if (typeof sessionStorage === 'undefined') return;

  try {
    sessionStorage.setItem(storageKey(pathname), String(Math.round(window.scrollY)));
  } catch {
    // Ignore quota / private mode errors.
  }
}

export function readSavedPageScrollPosition(pathname = window.location.pathname): number | null {
  if (typeof sessionStorage === 'undefined') return null;

  try {
    const raw = sessionStorage.getItem(storageKey(pathname));
    if (!raw) return null;

    const y = Number(raw);
    return Number.isFinite(y) && y >= 0 ? y : null;
  } catch {
    return null;
  }
}

/** Restore window scroll after reload; retries until lazy content expands the page. */
export function restorePageScrollPosition(pathname = window.location.pathname): void {
  const targetY = readSavedPageScrollPosition(pathname);
  if (targetY === null || targetY <= 0) return;

  let attempts = 0;

  const apply = (): void => {
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const nextY = Math.min(targetY, maxScroll);
    window.scrollTo({ top: nextY, left: 0, behavior: 'auto' });

    attempts++;
    const closeEnough = Math.abs(window.scrollY - nextY) <= 2;
    const layoutReady = document.documentElement.scrollHeight >= targetY + window.innerHeight * 0.35;

    if (!closeEnough && attempts < MAX_RESTORE_ATTEMPTS && !layoutReady) {
      requestAnimationFrame(apply);
    }
  };

  requestAnimationFrame(apply);
}
