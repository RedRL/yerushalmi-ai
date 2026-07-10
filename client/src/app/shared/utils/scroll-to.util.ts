/** Smoothly scrolls to a section by element id, accounting for the sticky header height. */
export function scrollToSection(elementId: string, offset = 88): void {
  const target = document.getElementById(elementId);
  if (!target) return;

  const top = target.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: 'smooth' });
}
