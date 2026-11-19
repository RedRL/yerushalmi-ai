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
import { LocaleService } from '../../../../core/i18n/locale.service';
import { HOME_MESSAGES } from '../../home.messages';
import { scrollToConfigurator, scrollToSectionFromNav } from '../../../../shared/utils/scroll-to.util';
import {
  bindYouTubePlayer,
  buildYouTubeEmbedUrl,
  disableYouTubeCaptions,
  postToYouTubePlayer,
} from '../../../../shared/utils/youtube-embed.util';

/** בייבילישס — background video for the hero stage (HE / EN). */
const HERO_VIDEO_ID_HE = '7pcjSw9pBPc';
const HERO_VIDEO_ID_EN = 'RgYnfu_Zk9I';
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
  readonly i18n = inject(LocaleService);
  readonly msg = HOME_MESSAGES.hero;

  private readonly sanitizer = inject(DomSanitizer);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly bannerRef = viewChild<ElementRef<HTMLElement>>('banner');
  private readonly stageRef = viewChild<ElementRef<HTMLElement>>('stage');
  private readonly heroVideoRef = viewChild<ElementRef<HTMLIFrameElement>>('heroVideo');
  private keepPlayingTimer = 0;
  private heroVideoVisible = false;

  // EN banners are lossless PNGs cloned from the HE masters (tagline only changed).
  readonly desktopBannerImageUrl = computed(() =>
    this.i18n.isEnglish() ? '/hero-banner-desktop-en.png?v=17' : '/hero-banner-desktop.png',
  );
  readonly mobileBannerImageUrl = computed(() =>
    this.i18n.isEnglish() ? '/hero-banner-mobile-en.png?v=18' : '/hero-banner-mobile.png',
  );
  readonly desktopBannerWidth = DESKTOP_BANNER_WIDTH;
  readonly desktopBannerHeight = DESKTOP_BANNER_HEIGHT;
  readonly heroVideoId = computed(() =>
    this.i18n.isEnglish() ? HERO_VIDEO_ID_EN : HERO_VIDEO_ID_HE,
  );
  readonly heroPosterUrl = computed(
    () => `https://i.ytimg.com/vi/${this.heroVideoId()}/maxresdefault.jpg`,
  );
  readonly videoPlaying = signal(false);
  readonly heroVideoEmbedUrl = computed(() => this.buildVideoEmbedUrl(this.heroVideoId()));

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
    const iframe = this.heroVideoRef()?.nativeElement;
    bindYouTubePlayer(iframe);
    disableYouTubeCaptions(iframe);
    this.playHeroVideo();
    if (this.keepPlayingTimer) window.clearInterval(this.keepPlayingTimer);
    this.keepPlayingTimer = window.setInterval(() => {
      this.playHeroVideo();
      disableYouTubeCaptions(this.heroVideoRef()?.nativeElement);
    }, 2000);
  }

  private playHeroVideo(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (document.visibilityState !== 'visible') return;
    postToYouTubePlayer(this.heroVideoRef()?.nativeElement, 'playVideo');
  }

  private onYouTubeMessage(event: MessageEvent): void {
    if (event.source !== this.heroVideoRef()?.nativeElement?.contentWindow) return;
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
      if (state === YT_PLAYING) {
        this.videoPlaying.set(true);
        disableYouTubeCaptions(this.heroVideoRef()?.nativeElement);
        return;
      }
      if (state === null || state === YT_UNSTARTED) return;
      this.playHeroVideo();
    } catch {
      return;
    }
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

  private buildVideoEmbedUrl(videoId: string): SafeResourceUrl {
    const origin = isPlatformBrowser(this.platformId)
      ? window.location.origin
      : 'https://yerushalmi.ai';

    return this.sanitizer.bypassSecurityTrustResourceUrl(
      buildYouTubeEmbedUrl(videoId, {
        autoplay: true,
        mute: true,
        loop: true,
        controls: false,
        origin,
      }),
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
