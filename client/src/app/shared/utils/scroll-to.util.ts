/** Default scroll offset for in-page section links (sticky header clearance). */
const DEFAULT_SCROLL_OFFSET = 132;

/** Default offset for header/nav clicks. */
const NAV_SCROLL_OFFSET_DEFAULT = 24;

/** Per-section nav offsets on desktop — higher value lands higher on the page. */
const NAV_SCROLL_OFFSETS: Readonly<Record<string, number>> = {
  'how-it-works': 112,
  transparency: -20,
  'hero-stage': 115,
  portfolio: 16,
  pricing: 0,
  configurator: -18,
  contact: -20,
};

/** Mobile menu nav — tuned separately from desktop header links. */
const NAV_SCROLL_OFFSETS_MOBILE: Readonly<Record<string, number>> = {
  'how-it-works': 42,
  portfolio: 12,
  transparency: 8,
  pricing: 28,
  configurator: 28,
  contact: 24,
};

/** Below 1024px — "בניית הפרויקט" / "התחילו ליצור" land higher on the page. */
const CONFIGURATOR_BELOW_DESKTOP_OFFSET = 84;

/** 1024–1199 — same links, milder lift than phone so they don't overshoot. */
const CONFIGURATOR_TABLET_OFFSET = 12;

/** At 1000px and below — "דוגמאות" lands higher on the page. */
const PORTFOLIO_BELOW_1000_OFFSET = 36;

const SCROLL_DURATION_MS = 720;
const JS_SCROLL_CLASS = 'is-js-scrolling';

let activeScrollFrame = 0;

function isMobileNavViewport(): boolean {
  return window.matchMedia('(max-width: 1023px)').matches;
}

function getNavScrollOffset(sectionId: string): number {
  const width = window.innerWidth;

  if (sectionId === 'configurator' && width < 1200) {
    return width >= 1024 ? CONFIGURATOR_TABLET_OFFSET : CONFIGURATOR_BELOW_DESKTOP_OFFSET;
  }

  if (sectionId === 'portfolio' && width <= 1000) {
    return PORTFOLIO_BELOW_1000_OFFSET;
  }

  const offsets = isMobileNavViewport() ? NAV_SCROLL_OFFSETS_MOBILE : NAV_SCROLL_OFFSETS;
  return offsets[sectionId] ?? NAV_SCROLL_OFFSET_DEFAULT;
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (2 * (1 - t)) ** 3 / 2;
}

function maxScrollY(): number {
  return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
}

function setScrollY(y: number): void {
  const top = Math.max(0, y);
  window.scrollTo({ top, left: 0, behavior: 'instant' });
  document.documentElement.scrollTop = top;
  document.body.scrollTop = top;
}

function stopAnimatedScroll(): void {
  if (activeScrollFrame) {
    cancelAnimationFrame(activeScrollFrame);
    activeScrollFrame = 0;
  }
  document.documentElement.classList.remove(JS_SCROLL_CLASS);
}

/**
 * Animate window scroll with rAF so it works even when CSS `scroll-behavior`
 * or `prefers-reduced-motion` would make `behavior: 'smooth'` jump instantly.
 */
export function animateWindowScrollTo(targetY: number, durationMs = SCROLL_DURATION_MS): void {
  stopAnimatedScroll();

  const startY = window.scrollY;
  const endY = Math.min(Math.max(0, targetY), maxScrollY());
  const distance = endY - startY;

  if (Math.abs(distance) < 1) {
    setScrollY(endY);
    return;
  }

  document.documentElement.classList.add(JS_SCROLL_CLASS);
  const startTime = performance.now();

  const step = (now: number): void => {
    const elapsed = now - startTime;
    const t = Math.min(1, elapsed / durationMs);
    setScrollY(startY + distance * easeInOutCubic(t));

    if (t < 1) {
      activeScrollFrame = requestAnimationFrame(step);
      return;
    }

    setScrollY(endY);
    stopAnimatedScroll();
  };

  activeScrollFrame = requestAnimationFrame(step);
}

/** Smoothly scrolls to a section by element id, accounting for the sticky header height. */
export function scrollToSection(elementId: string, offset = DEFAULT_SCROLL_OFFSET): void {
  const target = document.getElementById(elementId);
  if (!target) return;

  const top = target.getBoundingClientRect().top + window.scrollY - offset;
  animateWindowScrollTo(top);
}

/** Header and primary nav — section-specific scroll landing positions. */
export function scrollToSectionFromNav(sectionId: string): void {
  scrollToSection(sectionId, getNavScrollOffset(sectionId));
}

export function scrollToConfigurator(): void {
  scrollToSection('configurator', getNavScrollOffset('configurator'));
}

export function scrollToConfiguratorProgress(): void {
  scrollToSection('configurator-progress', 32);
}

export function scrollToPageTop(): void {
  animateWindowScrollTo(0);
}
