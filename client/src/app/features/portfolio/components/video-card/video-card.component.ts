import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import type { PortfolioVideo } from '../../../../shared/models/portfolio-video.model';

@Component({
  selector: 'app-video-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './video-card.component.html',
  styleUrl: './video-card.component.scss',
})
export class VideoCardComponent {
  readonly video = input.required<PortfolioVideo>();
  readonly categoryLabel = input.required<string>();
  readonly descriptionHe = input.required<string>();

  readonly play = output<PortfolioVideo>();

  readonly thumbnailUrl = computed(() => `https://i.ytimg.com/vi/${this.video().youtubeId}/hqdefault.jpg`);

  onActivate(): void {
    this.play.emit(this.video());
  }
}
