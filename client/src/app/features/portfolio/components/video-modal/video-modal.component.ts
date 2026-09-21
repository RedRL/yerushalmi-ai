import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  computed,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { DomSanitizer, type SafeResourceUrl } from '@angular/platform-browser';
import { AudioPlayerComponent } from '../../../../shared/components/audio-player/audio-player.component';
import type { PortfolioVideo } from '../../../../shared/models/portfolio-video.model';
import {
  bindYouTubePlayer,
  buildYouTubeEmbedUrl,
  disableYouTubeCaptions,
} from '../../../../shared/utils/youtube-embed.util';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

@Component({
  selector: 'app-video-modal',
  imports: [AudioPlayerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './video-modal.component.html',
  styleUrl: './video-modal.component.scss',
})
export class VideoModalComponent implements OnInit, OnDestroy {
  readonly video = input.required<PortfolioVideo>();
  readonly closed = output<void>();

  private readonly hostRef: ElementRef<HTMLElement> = inject(ElementRef);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly dialogRef = viewChild<ElementRef<HTMLElement>>('dialog');
  private readonly youtubeFrame = viewChild<ElementRef<HTMLIFrameElement>>('youtubeFrame');
  private previouslyFocusedElement: HTMLElement | null = null;
  private lockedScrollY = 0;
  private readonly onPlayerMessage = (event: MessageEvent): void => this.onYouTubeMessage(event);

  readonly isSong = computed(() => this.video().kind === 'song');
  readonly audioSrc = computed(() => {
    const audioUrl = this.video().audioUrl;
    return audioUrl ? encodeURI(audioUrl) : '';
  });

  readonly embedUrl = computed<SafeResourceUrl | null>(() => {
    const youtubeId = this.video().youtubeId;
    if (!youtubeId) return null;

    return this.sanitizer.bypassSecurityTrustResourceUrl(
      buildYouTubeEmbedUrl(youtubeId, {
        autoplay: true,
        origin: window.location.origin,
      }),
    );
  });

  readonly backdropUrl = computed(() => {
    const youtubeId = this.video().youtubeId;
    return youtubeId ? `https://i.ytimg.com/vi/${youtubeId}/maxresdefault.jpg` : '';
  });

  ngOnInit(): void {
    this.lockedScrollY = window.scrollY;
    this.previouslyFocusedElement = document.activeElement as HTMLElement | null;
    this.lockBodyScroll();
    window.addEventListener('message', this.onPlayerMessage);
    queueMicrotask(() => this.dialogRef()?.nativeElement.focus());
  }

  ngOnDestroy(): void {
    window.removeEventListener('message', this.onPlayerMessage);
    this.unlockBodyScroll();
    this.restoreFocusWithoutScroll();
  }

  onYouTubeLoad(): void {
    const iframe = this.youtubeFrame()?.nativeElement;
    bindYouTubePlayer(iframe);
    disableYouTubeCaptions(iframe);
  }

  private onYouTubeMessage(event: MessageEvent): void {
    if (event.source !== this.youtubeFrame()?.nativeElement?.contentWindow) return;
    if (typeof event.data !== 'string' || !event.data.includes('info')) return;
    disableYouTubeCaptions(this.youtubeFrame()?.nativeElement);
  }

  private lockBodyScroll(): void {
    document.body.classList.add('scroll-locked');
    document.body.style.top = `-${this.lockedScrollY}px`;
  }

  private unlockBodyScroll(): void {
    const scrollY = this.lockedScrollY;
    document.body.classList.remove('scroll-locked');
    document.body.style.removeProperty('top');
    window.scrollTo({ top: scrollY, left: 0, behavior: 'instant' });
  }

  private restoreFocusWithoutScroll(): void {
    const element = this.previouslyFocusedElement;
    if (!element?.focus) return;

    try {
      element.focus({ preventScroll: true });
    } catch {
      element.focus();
    }
  }

  close(): void {
    this.closed.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
      return;
    }

    if (event.key === 'Tab') {
      this.trapFocus(event);
    }
  }

  private trapFocus(event: KeyboardEvent): void {
    const focusable = this.hostRef.nativeElement.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }
}
