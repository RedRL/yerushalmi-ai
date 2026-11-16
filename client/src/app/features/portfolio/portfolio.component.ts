import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { LocaleService } from '../../core/i18n/locale.service';
import { SectionHeadingComponent } from '../../shared/components/section-heading/section-heading.component';
import { RevealOnScrollDirective } from '../../shared/directives/reveal-on-scroll.directive';
import type { PortfolioCategory, PortfolioVideo } from '../../shared/models/portfolio-video.model';
import {
  PORTFOLIO_CATEGORIES,
  PORTFOLIO_REACTIONS,
  PORTFOLIO_SONGS,
  PORTFOLIO_VIDEOS,
} from './data/portfolio-data';
import { VideoCardComponent } from './components/video-card/video-card.component';
import { VideoModalComponent } from './components/video-modal/video-modal.component';

const LOOP_SETS = 3;

/** Reversed within each set for RTL display (right-to-left reading order). */
const DISPLAY_VIDEOS = [...PORTFOLIO_VIDEOS].reverse();

@Component({
  selector: 'app-portfolio',
  imports: [SectionHeadingComponent, VideoCardComponent, VideoModalComponent, RevealOnScrollDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './portfolio.component.html',
  styleUrl: './portfolio.component.scss',
})
export class PortfolioComponent implements AfterViewInit, OnDestroy {
  readonly i18n = inject(LocaleService);
  private readonly scrollerRef = viewChild<ElementRef<HTMLElement>>('scroller');
  private scrollEndHandler: (() => void) | null = null;
  private scrollHandler: (() => void) | null = null;
  private scrollFrame = 0;

  private readonly categoryById = new Map<string, PortfolioCategory>(
    PORTFOLIO_CATEGORIES.map((category) => [category.id, category]),
  );

  readonly videos = PORTFOLIO_VIDEOS;
  readonly songs = PORTFOLIO_SONGS;
  readonly reactions = PORTFOLIO_REACTIONS;
  readonly loopVideos = Array.from({ length: LOOP_SETS }, () => [...DISPLAY_VIDEOS]).flat();
  readonly selectedVideo = signal<PortfolioVideo | null>(null);
  readonly centeredIndex = signal(this.middleSetIndexOf('babylicious'));

  categoryOf(video: PortfolioVideo): PortfolioCategory {
    return this.categoryById.get(video.categoryId) ?? PORTFOLIO_CATEGORIES[0];
  }

  ngAfterViewInit(): void {
    const scroller = this.scrollerRef()?.nativeElement;
    if (!scroller) return;

    queueMicrotask(() => {
      this.scrollToMiddleSet(scroller);
      this.updateCenteredIndex(scroller);
      this.scrollEndHandler = () => this.normalizeLoop(scroller);
      this.scrollHandler = () => {
        if (this.scrollFrame) return;
        this.scrollFrame = requestAnimationFrame(() => {
          this.scrollFrame = 0;
          this.updateCenteredIndex(scroller);
        });
      };
      scroller.addEventListener('scrollend', this.scrollEndHandler, { passive: true });
      scroller.addEventListener('scroll', this.scrollHandler, { passive: true });
    });
  }

  ngOnDestroy(): void {
    const scroller = this.scrollerRef()?.nativeElement;
    if (this.scrollFrame) cancelAnimationFrame(this.scrollFrame);
    if (!scroller) return;
    if (this.scrollEndHandler) scroller.removeEventListener('scrollend', this.scrollEndHandler);
    if (this.scrollHandler) scroller.removeEventListener('scroll', this.scrollHandler);
  }

  openVideo(video: PortfolioVideo): void {
    this.selectedVideo.set(video);
  }

  closeModal(): void {
    this.selectedVideo.set(null);
  }

  /** Visually to the right in RTL reading order */
  scrollPrev(): void {
    this.scrollByCards(1);
  }

  /** Visually to the left in RTL reading order */
  scrollNext(): void {
    this.scrollByCards(-1);
  }

  private scrollByCards(direction: -1 | 1): void {
    const scroller = this.scrollerRef()?.nativeElement;
    if (!scroller) return;

    const items = scroller.querySelectorAll<HTMLElement>('.portfolio__item');
    if (items.length === 0) return;

    const current = this.findClosestIndex(scroller, items);
    const target = items[current + direction];
    if (!target) return;

    this.scrollItemToCenter(scroller, target);
    requestAnimationFrame(() => this.normalizeLoop(scroller));
  }

  private normalizeLoop(scroller: HTMLElement): void {
    const setWidth = this.setWidth(scroller);
    if (setWidth <= 0) return;

    const maxScroll = scroller.scrollWidth - scroller.clientWidth;
    if (maxScroll <= 0) return;

    const left = scroller.scrollLeft;
    const edgeBuffer = Math.min(setWidth * 0.15, maxScroll * 0.1);

    if (left < edgeBuffer) {
      this.jumpScroll(scroller, left + setWidth);
      return;
    }

    if (left > maxScroll - edgeBuffer) {
      this.jumpScroll(scroller, left - setWidth);
    }

    this.updateCenteredIndex(scroller);
  }

  private jumpScroll(scroller: HTMLElement, nextLeft: number): void {
    const maxScroll = scroller.scrollWidth - scroller.clientWidth;
    const clamped = Math.max(0, Math.min(nextLeft, maxScroll));
    scroller.style.scrollSnapType = 'none';
    scroller.scrollLeft = clamped;
    scroller.style.scrollSnapType = '';
    this.updateCenteredIndex(scroller);
  }

  private middleSetIndexOf(videoId: string): number {
    const offset = DISPLAY_VIDEOS.findIndex((video) => video.id === videoId);
    const indexInSet = offset >= 0 ? offset : Math.floor(DISPLAY_VIDEOS.length / 2);
    return DISPLAY_VIDEOS.length + indexInSet;
  }

  private scrollToMiddleSet(scroller: HTMLElement): void {
    const items = scroller.querySelectorAll<HTMLElement>('.portfolio__item');
    const target = items[this.middleSetIndexOf('babylicious')];
    if (!target) return;

    this.scrollItemToCenter(scroller, target);
    this.updateCenteredIndex(scroller);
  }

  /** Scroll so the item's visual center matches the scroller's visual center. */
  private scrollItemToCenter(scroller: HTMLElement, target: HTMLElement): void {
    scroller.style.scrollSnapType = 'none';

    const scrollerRect = scroller.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const delta =
      targetRect.left + targetRect.width / 2 - (scrollerRect.left + scrollerRect.width / 2);

    scroller.scrollLeft += delta;
    scroller.style.scrollSnapType = '';
  }

  private updateCenteredIndex(scroller: HTMLElement): void {
    const items = scroller.querySelectorAll<HTMLElement>('.portfolio__item');
    if (items.length === 0) return;
    this.centeredIndex.set(this.findClosestIndex(scroller, items));
  }

  /** Pick the item whose visual center is closest to the scroller's visual center. */
  private findClosestIndex(
    scroller: HTMLElement,
    items: NodeListOf<HTMLElement> | HTMLElement[],
  ): number {
    const scrollerRect = scroller.getBoundingClientRect();
    const viewportCenter = scrollerRect.left + scrollerRect.width / 2;
    let closest = 0;
    let closestDist = Number.POSITIVE_INFINITY;

    items.forEach((item, index) => {
      const rect = item.getBoundingClientRect();
      const distance = Math.abs(rect.left + rect.width / 2 - viewportCenter);
      if (distance < closestDist) {
        closestDist = distance;
        closest = index;
      }
    });

    return closest;
  }

  private setWidth(scroller: HTMLElement): number {
    const items = scroller.querySelectorAll<HTMLElement>('.portfolio__item');
    const count = DISPLAY_VIDEOS.length;
    if (items.length <= count) return 0;

    const gap = Number.parseFloat(getComputedStyle(scroller).gap || '0');
    const cardWidth = items[0].offsetWidth;
    return count * cardWidth + Math.max(0, count - 1) * gap;
  }
}
