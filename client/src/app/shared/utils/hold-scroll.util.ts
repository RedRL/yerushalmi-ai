const HOLD_CLASS = 'is-js-scrolling';

type ScrollSnapshot = {
  el: HTMLElement;
  top: number;
  left: number;
};

let holdGeneration = 0;
let teardownHold: (() => void) | null = null;

function isScrollable(el: HTMLElement): boolean {
  const style = getComputedStyle(el);
  const y = style.overflowY;
  const x = style.overflowX;
  return (
    y === 'auto' ||
    y === 'scroll' ||
    y === 'overlay' ||
    x === 'auto' ||
    x === 'scroll' ||
    x === 'overlay' ||
    x === 'clip' ||
    y === 'clip'
  );
}

function collectScrollers(origin?: HTMLElement | null): HTMLElement[] {
  const found: HTMLElement[] = [];
  const add = (el: HTMLElement | null | undefined): void => {
    if (!el || found.includes(el)) return;
    found.push(el);
  };

  const scrolling = document.scrollingElement;
  if (scrolling instanceof HTMLElement) add(scrolling);
  add(document.documentElement);
  add(document.body);

  const main = document.querySelector('main');
  if (main instanceof HTMLElement) add(main);

  let node: HTMLElement | null = origin ?? null;
  while (node) {
    if (isScrollable(node)) add(node);
    node = node.parentElement;
  }

  return found;
}

function applySnapshot(windowX: number, windowY: number, scrollers: ScrollSnapshot[]): void {
  window.scrollTo({ left: windowX, top: windowY, behavior: 'instant' });
  document.documentElement.scrollTop = windowY;
  document.documentElement.scrollLeft = windowX;
  document.body.scrollTop = windowY;
  document.body.scrollLeft = windowX;

  for (const item of scrollers) {
    if (item.el.scrollTop !== item.top) item.el.scrollTop = item.top;
    if (item.el.scrollLeft !== item.left) item.el.scrollLeft = item.left;
  }
}

/**
 * Freezes only the window scroll so a layout swap cannot jump the page.
 * Does not lock inner overflow containers.
 */
export function holdWindowScroll(durationMs = 450): void {
  const windowX = window.scrollX;
  const windowY = window.scrollY;
  const started = performance.now();

  const restore = (): void => {
    if (window.scrollX !== windowX || window.scrollY !== windowY) {
      window.scrollTo({ left: windowX, top: windowY, behavior: 'instant' });
    }
  };

  const onScroll = (): void => restore();
  window.addEventListener('scroll', onScroll, true);

  const tick = (now: number): void => {
    restore();
    if (now - started < durationMs) {
      requestAnimationFrame(tick);
      return;
    }
    window.removeEventListener('scroll', onScroll, true);
  };

  restore();
  requestAnimationFrame(tick);
}

/**
 * Freezes the window and overflow ancestors at the current position
 * so layout changes or focus cannot jump the page.
 */
export function holdScrollPositions(
  origin?: HTMLElement | null,
  durationMs = 700,
): void {
  teardownHold?.();

  const myGen = ++holdGeneration;
  const windowX = window.scrollX;
  const windowY = window.scrollY;
  const scrollers = collectScrollers(origin).map((el) => ({
    el,
    top: el.scrollTop,
    left: el.scrollLeft,
  }));

  const html = document.documentElement;
  html.classList.add(HOLD_CLASS);

  let restoring = false;
  const restore = (): void => {
    if (restoring) return;
    restoring = true;
    applySnapshot(windowX, windowY, scrollers);
    restoring = false;
  };

  const onScroll = (): void => {
    restore();
  };

  window.addEventListener('scroll', onScroll, true);
  for (const item of scrollers) {
    item.el.addEventListener('scroll', onScroll, true);
  }

  const teardown = (): void => {
    window.removeEventListener('scroll', onScroll, true);
    for (const item of scrollers) {
      item.el.removeEventListener('scroll', onScroll, true);
    }
    if (holdGeneration === myGen) {
      html.classList.remove(HOLD_CLASS);
    }
    if (teardownHold === teardown) teardownHold = null;
  };

  teardownHold = teardown;

  const started = performance.now();
  const tick = (now: number): void => {
    if (holdGeneration !== myGen) return;
    restore();
    if (now - started < durationMs) {
      requestAnimationFrame(tick);
      return;
    }
    teardown();
  };

  restore();
  requestAnimationFrame(tick);
}
