import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { AudioPlayerComponent } from '../../../../shared/components/audio-player/audio-player.component';
import type { PortfolioVideo } from '../../../../shared/models/portfolio-video.model';

export type VideoCardSize = 'default' | 'featured' | 'gallery';

@Component({
  selector: 'app-video-card',
  imports: [AudioPlayerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './video-card.component.html',
  styleUrl: './video-card.component.scss',
})
export class VideoCardComponent {
  readonly video = input.required<PortfolioVideo>();
  readonly descriptionHe = input.required<string>();
  readonly size = input<VideoCardSize>('default');

  readonly play = output<PortfolioVideo>();
  readonly audioPlaying = signal(false);

  readonly isAudioSong = computed(() => !!this.video().audioUrl);
  readonly audioSrc = computed(() => encodeURI(this.video().audioUrl ?? ''));
  readonly thumbnailUrl = computed(() => {
    const youtubeId = this.video().youtubeId;
    return youtubeId ? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg` : '';
  });

  onActivate(): void {
    if (this.isAudioSong()) return;
    this.play.emit(this.video());
  }
}
