import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { SectionHeadingComponent } from '../../shared/components/section-heading/section-heading.component';
import type { PortfolioCategory, PortfolioVideo } from '../../shared/models/portfolio-video.model';
import { PORTFOLIO_CATEGORIES, PORTFOLIO_VIDEOS } from './data/portfolio-data';
import { VideoCardComponent } from './components/video-card/video-card.component';
import { VideoModalComponent } from './components/video-modal/video-modal.component';

interface PortfolioCategoryGroup {
  category: PortfolioCategory;
  videos: PortfolioVideo[];
}

@Component({
  selector: 'app-portfolio',
  imports: [SectionHeadingComponent, VideoCardComponent, VideoModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './portfolio.component.html',
  styleUrl: './portfolio.component.scss',
})
export class PortfolioComponent {
  readonly categoryGroups: readonly PortfolioCategoryGroup[] = PORTFOLIO_CATEGORIES.map((category) => ({
    category,
    videos: PORTFOLIO_VIDEOS.filter((video) => video.categoryId === category.id),
  }));

  readonly selectedVideo = signal<PortfolioVideo | null>(null);

  openVideo(video: PortfolioVideo): void {
    this.selectedVideo.set(video);
  }

  closeModal(): void {
    this.selectedVideo.set(null);
  }
}
