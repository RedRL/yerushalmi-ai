import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { VIDEO_FORMAT_OPTIONS } from '../../../../core/config/pricing.config';
import type { SubtitlesId, VideoFormatId } from '../../../../shared/models/pricing.model';
import { FILLED_STILLS, SUBTITLE_SAMPLE, VIDEO_STILL_SRC } from '../../experience/experience.config';

@Component({
  selector: 'app-video-frame-preview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './video-frame-preview.component.html',
  styleUrl: './video-frame-preview.component.scss',
})
export class VideoFramePreviewComponent {
  readonly format = input<VideoFormatId>('landscape');
  readonly subtitles = input<SubtitlesId | ''>('none');
  readonly filled = input(false);
  readonly compact = input(false);
  readonly badge = input('');

  readonly sample = SUBTITLE_SAMPLE;

  readonly still = computed(() => {
    if (!this.filled()) return VIDEO_STILL_SRC;
    return FILLED_STILLS[this.format()] ?? VIDEO_STILL_SRC;
  });

  readonly ratio = computed(() => {
    return VIDEO_FORMAT_OPTIONS.find((option) => option.id === this.format())?.previewAspectRatio ?? '16 / 9';
  });

  readonly frameWidth = computed(() => {
    const [rawWidth, rawHeight] = this.ratio().split('/').map((part) => Number(part.trim()));
    const widthRatio = rawWidth || 16;
    const heightRatio = rawHeight || 9;
    const maxHeight = this.compact() ? 140 : 230;
    const maxWidth = this.compact() ? 300 : 440;
    return `${Math.min(maxWidth, (maxHeight * widthRatio) / heightRatio)}px`;
  });

  readonly showCaption = computed(() => this.subtitles() === 'selected' || this.subtitles() === 'full');
}
