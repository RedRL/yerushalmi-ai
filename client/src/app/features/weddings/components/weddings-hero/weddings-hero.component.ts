import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { LocaleService } from '../../../../core/i18n/locale.service';
import { scrollToConfigurator, scrollToSectionFromNav } from '../../../../shared/utils/scroll-to.util';
import { WEDDINGS_MESSAGES } from '../../weddings.messages';

const DESKTOP_BANNER_WIDTH = 1903;
const DESKTOP_BANNER_HEIGHT = 826;

@Component({
  selector: 'app-weddings-hero',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './weddings-hero.component.html',
  styleUrl: './weddings-hero.component.scss',
})
export class WeddingsHeroComponent implements AfterViewInit {
  readonly i18n = inject(LocaleService);
  readonly msg = WEDDINGS_MESSAGES.hero;

  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly bannerRef = viewChild<ElementRef<HTMLElement>>('banner');
  private readonly stageRef = viewChild<ElementRef<HTMLElement>>('stage');

  readonly desktopBannerImageUrl = computed(() =>
    this.i18n.isEnglish()
      ? '/hero-banner-desktop-weddings-en.png?v=11'
      : '/hero-banner-desktop-weddings-he.png?v=11',
  );
  readonly mobileBannerImageUrl = computed(() =>
    this.i18n.isEnglish()
      ? '/hero-banner-mobile-weddings-en.png?v=11'
      : '/hero-banner-mobile-weddings-he.png?v=11',
  );
  readonly desktopBannerWidth = DESKTOP_BANNER_WIDTH;
  readonly desktopBannerHeight = DESKTOP_BANNER_HEIGHT;

  private readonly bannerShift = signal(0);
  private readonly bannerScale = signal(1);
  private readonly stageLift = signal(0);
  private readonly bannerOpacity = signal(1);
  readonly bannerFadePx = signal(0);

  readonly bannerStyle = computed(() => ({
    transform: `translate3d(0, ${this.bannerShift()}px, 0) scale(${this.bannerScale()})`,
    opacity: this.bannerOpacity(),
  }));

  readonly stageStyle = computed(() => ({
    transform: `translate3d(0, -${this.stageLift()}px, 0)`,
  }));

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const update = () => this.updateScrollParallax();
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });

    this.destroyRef.onDestroy(() => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    });
  }

  private updateScrollParallax(): void {
    const banner = this.bannerRef()?.nativeElement;
    const stage = this.stageRef()?.nativeElement;
    if (!banner || !stage) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.bannerShift.set(0);
      this.bannerScale.set(1);
      this.stageLift.set(0);
      this.bannerOpacity.set(1);
      this.bannerFadePx.set(0);
      return;
    }

    const scrollY = window.scrollY;
    const bannerHeight = banner.offsetHeight;
    const progress = Math.min(Math.max(scrollY / Math.max(bannerHeight * 0.9, 1), 0), 1);
    const fade = Math.round(progress * Math.min(bannerHeight * 0.72, 520));

    this.bannerShift.set(Math.round(scrollY * 0.28));
    this.bannerScale.set(1 - progress * 0.1);
    this.stageLift.set(-Math.round(Math.min(scrollY * 0.18, bannerHeight * 0.28)));
    this.bannerOpacity.set(Math.max(1 - progress * 0.28, 0.72));
    this.bannerFadePx.set(fade);
  }

  goToConfigurator(): void {
    scrollToConfigurator();
  }

  goToDemo(): void {
    scrollToSectionFromNav('portfolio');
  }

  goToStage(): void {
    scrollToSectionFromNav('hero-stage');
  }
}
