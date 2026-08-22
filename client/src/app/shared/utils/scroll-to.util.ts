/** Default scroll offset for in-page section links (sticky header clearance). */
const DEFAULT_SCROLL_OFFSET = 132;

/** Default offset for header/nav clicks. */
const NAV_SCROLL_OFFSET_DEFAULT = 24;

/** Per-section nav offsets on desktop — higher value lands higher on the page. */
const NAV_SCROLL_OFFSETS: Readonly<Record<string, number>> = {
  'how-it-works': 112,
  transparency: 15,
  'hero-stage': 115,
  portfolio: 52,
  pricing: 0,
  configurator: -18,
  contact: -20,
};

/** Mobile menu nav — tuned separately from desktop header links. */
const NAV_SCROLL_OFFSETS_MOBILE: Readonly<Record<string, number>> = {
  'how-it-works': 42,
  portfolio: 44,
  transparency: 40,
  pricing: 28,
  configurator: 28,
  contact: 24,
};

function isMobileNavViewport(): boolean {
  return window.matchMedia('(max-width: 1023px)').matches;
}

function getNavScrollOffset(sectionId: string): number {
  const offsets = isMobileNavViewport() ? NAV_SCROLL_OFFSETS_MOBILE : NAV_SCROLL_OFFSETS;
  return offsets[sectionId] ?? NAV_SCROLL_OFFSET_DEFAULT;
}

/** Smoothly scrolls to a section by element id, accounting for the sticky header height. */
export function scrollToSection(elementId: string, offset = DEFAULT_SCROLL_OFFSET): void {
  const target = document.getElementById(elementId);
  if (!target) return;

  const top = target.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: 'smooth' });
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
