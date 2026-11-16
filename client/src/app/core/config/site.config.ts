/** Site-wide constants: brand copy, navigation and contact channels. */

import type { UiMessageKey } from '../i18n/messages';

export interface NavLink {
  labelKey: UiMessageKey;
  sectionId: string;
}

export const SITE_CONFIG = {
  brandName: 'YERUSHALMI.AI',
  canonicalUrl: 'https://yerushalmi.ai/clips',
  /** Dedicated weddings landing — sibling of /clips; page content comes later. */
  weddingsUrl: 'https://yerushalmi.ai/weddings',
} as const;

export const NAV_LINKS: readonly NavLink[] = [
  { labelKey: 'nav.portfolio', sectionId: 'portfolio' },
  { labelKey: 'nav.howItWorks', sectionId: 'how-it-works' },
  { labelKey: 'nav.transparency', sectionId: 'transparency' },
  { labelKey: 'nav.pricing', sectionId: 'pricing' },
  { labelKey: 'nav.configurator', sectionId: 'configurator' },
  { labelKey: 'nav.contact', sectionId: 'contact' },
];

export const WHATSAPP_CONFIG = {
  localPhone: '026480886',
  internationalPhone: '97226480886',
  buildUrl(message: string): string {
    return `https://wa.me/${this.internationalPhone}?text=${encodeURIComponent(message)}`;
  },
} as const;

export const CONTACT_EMAIL_CONFIG = {
  address: 'info@yerushalmi.ai',
  get mailtoUrl(): string {
    return `mailto:${this.address}`;
  },
} as const;
