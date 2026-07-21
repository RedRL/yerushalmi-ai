import { ChangeDetectionStrategy, Component, HostListener, signal } from '@angular/core';
import { NAV_LINKS, SITE_CONFIG, WHATSAPP_CONFIG } from '../../../core/config/site.config';
import { scrollToSectionFromNav } from '../../utils/scroll-to.util';

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  readonly brandName = SITE_CONFIG.brandName;
  readonly navLinks = NAV_LINKS;
  readonly whatsappUrl = WHATSAPP_CONFIG.url;

  readonly isScrolled = signal(false);
  readonly isMobileMenuOpen = signal(false);

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.isScrolled.set(window.scrollY > 24);
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update((open) => !open);
  }

  navigateTo(sectionId: string): void {
    this.isMobileMenuOpen.set(false);

    if (sectionId === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    scrollToSectionFromNav(sectionId);
  }
}
