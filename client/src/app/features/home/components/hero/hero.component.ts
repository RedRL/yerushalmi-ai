import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  inject,
  PLATFORM_ID,
  signal,
  viewChild,
} from '@angular/core';
import { DomSanitizer, type SafeResourceUrl } from '@angular/platform-browser';
import { scrollToConfigurator, scrollToSectionFromNav } from '../../../../shared/utils/scroll-to.util';

/** Dor 34 — background video for the hero stage. */
const HERO_VIDEO_ID = '8LqiYpObWZc';

/** Native pixel dimensions of `og-image-16-9-high res-shortest-large-centered.png`. */
const DESKTOP_BANNER_WIDTH = 3344;
const DESKTOP_BANNER_HEIGHT = 1453;

@Component({
  selector: 'app-hero',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss',
})
export class HeroComponent implements AfterViewInit {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly bannerRef = viewChild<ElementRef<HTMLElement>>('banner');
  private readonly stageRef = viewChild<ElementRef<HTMLElement>>('stage');

  readonly desktopBannerImageUrl = '/og-image-16-9-high%20res-shortest-large-centered.png';
  readonly mobileBannerImageUrl = '/og-image-mobile.png';
  readonly desktopBannerWidth = DESKTOP_BANNER_WIDTH;
  readonly desktopBannerHeight = DESKTOP_BANNER_HEIGHT;
  readonly heroPosterUrl = `https://i.ytimg.com/vi/${HERO_VIDEO_ID}/maxresdefault.jpg`;
  readonly videoReady = signal(false);
  readonly heroVideoEmbedUrl = this.buildVideoEmbedUrl();

  private readonly bannerShift = signal(0);
  private readonly stageLift = signal(0);
  private readonly bannerOpacity = signal(1);

  readonly bannerStyle = computed(() => ({
    transform: `translate3d(0, ${this.bannerShift()}px, 0)`,
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

  onVideoLoad(): void {
    this.videoReady.set(true);
  }

  private updateScrollParallax(): void {
    const banner = this.bannerRef()?.nativeElement;
    const stage = this.stageRef()?.nativeElement;
    if (!banner || !stage) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.bannerShift.set(0);
      this.stageLift.set(0);
      this.bannerOpacity.set(1);
      return;
    }

    const scrollY = window.scrollY;
    const bannerHeight = banner.offsetHeight;

    this.bannerShift.set(scrollY * 0.1);
    this.stageLift.set(-Math.min(scrollY * 0.35, bannerHeight * 0.5));

    // Fully transparent well before the hero stage finishes scrolling past.
    const stageBottomScroll = scrollY + stage.getBoundingClientRect().bottom;
    const fadeEnd = stageBottomScroll * 0.45;
    const fadeProgress = Math.min(scrollY / Math.max(fadeEnd, 1), 1);
    this.bannerOpacity.set(Math.max(1 - fadeProgress ** 0.35, 0));
  }

  private buildVideoEmbedUrl(): SafeResourceUrl {
    const origin = isPlatformBrowser(this.platformId)
      ? window.location.origin
      : 'https://yerushalmi.ai';

    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube.com/embed/${HERO_VIDEO_ID}` +
        `?autoplay=1&mute=1&loop=1&playlist=${HERO_VIDEO_ID}` +
        '&controls=0&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3' +
        `&disablekb=1&enablejsapi=1&origin=${encodeURIComponent(origin)}`,
    );
  }

  goToConfigurator(): void {
    scrollToConfigurator();
  }

  goToPortfolio(): void {
    scrollToSectionFromNav('portfolio');
  }

  goToStage(): void {
    scrollToSectionFromNav('hero-stage');
  }
}
