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

/** יום הולדת לטל — background video for the hero stage. */
const HERO_VIDEO_ID = 'ch_ACN8mS_w';
const YT_PLAYING = 1;
const YT_UNSTARTED = -1;

/** Native pixel dimensions of `hero-banner-desktop.png`. */
const DESKTOP_BANNER_WIDTH = 1903;
const DESKTOP_BANNER_HEIGHT = 826;

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
  private readonly heroVideoRef = viewChild<ElementRef<HTMLIFrameElement>>('heroVideo');
  private keepPlayingTimer = 0;
  private heroVideoVisible = false;

  readonly desktopBannerImageUrl = '/hero-banner-desktop.png';
  readonly mobileBannerImageUrl = '/hero-banner-mobile.png';
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

    const resume = () => this.playHeroVideo();
    const onVisibility = () => {
      if (document.visibilityState === 'visible') this.playHeroVideo();
    };
    const onPlayerMessage = (event: MessageEvent) => this.onYouTubeMessage(event);

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('focus', resume);
    window.addEventListener('pageshow', resume);
    window.addEventListener('message', onPlayerMessage);

    const iframe = this.heroVideoRef()?.nativeElement;
    const observer =
      iframe &&
      new IntersectionObserver(
        (entries) => {
          this.heroVideoVisible = entries.some((entry) => entry.isIntersecting && entry.intersectionRatio > 0.15);
          if (this.heroVideoVisible) this.playHeroVideo();
        },
        { threshold: [0, 0.15, 0.4] },
      );
    if (iframe && observer) observer.observe(iframe);

    this.destroyRef.onDestroy(() => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('focus', resume);
      window.removeEventListener('pageshow', resume);
      window.removeEventListener('message', onPlayerMessage);
      observer?.disconnect();
      if (this.keepPlayingTimer) window.clearInterval(this.keepPlayingTimer);
    });
  }

  onVideoLoad(): void {
    this.videoReady.set(true);
    this.bindYouTubePlayer();
    this.playHeroVideo();
    if (this.keepPlayingTimer) window.clearInterval(this.keepPlayingTimer);
    this.keepPlayingTimer = window.setInterval(() => this.playHeroVideo(), 2000);
  }

  private bindYouTubePlayer(): void {
    this.postToHeroPlayer({ event: 'listening', id: 1 });
  }

  private playHeroVideo(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (document.visibilityState !== 'visible') return;
    this.postToHeroPlayer({ event: 'command', func: 'playVideo', args: [] });
  }

  private onYouTubeMessage(event: MessageEvent): void {
    if (typeof event.data !== 'string' || !event.data.includes('info')) return;

    try {
      const payload = JSON.parse(event.data) as {
        event?: string;
        info?: number | { playerState?: number };
      };
      const state =
        typeof payload.info === 'number'
          ? payload.info
          : typeof payload.info?.playerState === 'number'
            ? payload.info.playerState
            : null;
      if (state === null || state === YT_PLAYING || state === YT_UNSTARTED) return;
      this.playHeroVideo();
    } catch {
      return;
    }
  }

  private postToHeroPlayer(message: object): void {
    const frame = this.heroVideoRef()?.nativeElement.contentWindow;
    if (!frame) return;
    frame.postMessage(JSON.stringify(message), '*');
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

    this.bannerShift.set(Math.round(scrollY * 0.1));
    this.stageLift.set(-Math.round(Math.min(scrollY * 0.35, bannerHeight * 0.5)));

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
