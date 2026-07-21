/** Default scroll offset for in-page section links (sticky header clearance). */
const DEFAULT_SCROLL_OFFSET = 132;

/** Default offset for header/nav clicks. */
const NAV_SCROLL_OFFSET_DEFAULT = 24;

/** Per-section nav offsets — higher value lands higher on the page. */
const NAV_SCROLL_OFFSETS: Readonly<Record<string, number>> = {
  'how-it-works': 112,
  'hero-stage': 105,
  pricing: 0,
  configurator: 64,
};

/** Smoothly scrolls to a section by element id, accounting for the sticky header height. */
export function scrollToSection(elementId: string, offset = DEFAULT_SCROLL_OFFSET): void {
  const target = document.getElementById(elementId);
  if (!target) return;

  const top = target.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: 'smooth' });
}

function getNavScrollOffset(sectionId: string): number {
  return NAV_SCROLL_OFFSETS[sectionId] ?? NAV_SCROLL_OFFSET_DEFAULT;
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
