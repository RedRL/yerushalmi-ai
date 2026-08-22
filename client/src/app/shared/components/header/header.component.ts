import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, HostListener, inject, signal } from '@angular/core';
import { NAV_LINKS, SITE_CONFIG } from '../../../core/config/site.config';
import { scrollToSectionFromNav } from '../../utils/scroll-to.util';

const MOBILE_MENU_CLOSE_MS = 180;

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  private readonly hostRef = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);
  private closeMenuTimer: ReturnType<typeof setTimeout> | null = null;

  readonly brandName = SITE_CONFIG.brandName;
  readonly navLinks = NAV_LINKS;

  readonly isScrolled = signal(false);
  readonly isMobileMenuOpen = signal(false);
  readonly isMobileMenuClosing = signal(false);

  constructor() {
    const onDocumentScroll = (event: Event): void => this.onNestedScroll(event);
    document.addEventListener('scroll', onDocumentScroll, { capture: true, passive: true });
    this.destroyRef.onDestroy(() => {
      document.removeEventListener('scroll', onDocumentScroll, { capture: true });
    });
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.isScrolled.set(window.scrollY > 24);

    if (this.isMobileMenuOpen() && this.isMobileViewport()) {
      this.closeMobileMenu();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isMobileMenuOpen() || !this.isMobileViewport()) return;

    const target = event.target;
    if (!(target instanceof Node) || this.hostRef.nativeElement.contains(target)) return;

    this.closeMobileMenu();
  }

  private onNestedScroll(event: Event): void {
    if (!this.isMobileMenuOpen() || !this.isMobileViewport()) return;

    const mobileNav = this.hostRef.nativeElement.querySelector('.header__mobile-nav');
    if (event.target instanceof Node && mobileNav?.contains(event.target)) return;

    this.closeMobileMenu();
  }

  toggleMobileMenu(event: Event): void {
    event.stopPropagation();

    if (this.isMobileMenuOpen()) {
      this.closeMobileMenu();
      return;
    }

    this.isMobileMenuClosing.set(false);
    this.isMobileMenuOpen.set(true);
  }

  closeMobileMenu(): void {
    if (!this.isMobileMenuOpen()) return;

    this.isMobileMenuOpen.set(false);
    this.isMobileMenuClosing.set(true);

    if (this.closeMenuTimer) clearTimeout(this.closeMenuTimer);
    this.closeMenuTimer = setTimeout(() => {
      this.isMobileMenuClosing.set(false);
      this.closeMenuTimer = null;
    }, MOBILE_MENU_CLOSE_MS);
  }

  navigateTo(sectionId: string): void {
    this.closeMobileMenu();

    if (sectionId === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    scrollToSectionFromNav(sectionId);
  }

  isHeaderSolid(): boolean {
    return this.isScrolled() || this.isMobileMenuOpen() || this.isMobileMenuClosing();
  }

  private isMobileViewport(): boolean {
    return window.matchMedia('(max-width: 1023px)').matches;
  }
}
