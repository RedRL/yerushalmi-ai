import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { LocaleService } from '../../../../core/i18n/locale.service';
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
  readonly i18n = inject(LocaleService);
  readonly video = input.required<PortfolioVideo>();
  readonly descriptionHe = input<string | null>(null);
  readonly descriptionEn = input<string | null>(null);
  readonly size = input<VideoCardSize>('default');

  readonly play = output<PortfolioVideo>();
  readonly audioPlaying = signal(false);

  readonly title = computed(() =>
    this.i18n.isEnglish() ? this.video().titleEn : this.video().titleHe,
  );

  readonly description = computed(() => {
    if (this.i18n.isEnglish()) {
      return this.descriptionEn() || this.video().descriptionEn || '';
    }
    return this.descriptionHe() || this.video().descriptionHe || '';
  });

  readonly tags = computed(() =>
    this.i18n.isEnglish() ? this.video().tagsEn : this.video().tagsHe,
  );

  readonly watchAria = computed(() =>
    this.i18n.tf('portfolio.watchAria', { title: this.title() }),
  );

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
