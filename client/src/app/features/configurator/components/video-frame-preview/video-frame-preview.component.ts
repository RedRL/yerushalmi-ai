import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { LocaleService } from '../../../../core/i18n/locale.service';
import {
  DEFAULT_SUBTITLES_COLOR,
  DEFAULT_SUBTITLES_HIGHLIGHT_COLOR,
  normalizeHexColor,
  VIDEO_FORMAT_OPTIONS,
} from '../../../../core/config/pricing.config';
import type { SubtitlesId, VideoFormatId } from '../../../../shared/models/pricing.model';
import { FILLED_STILLS, SUBTITLE_SAMPLE, VIDEO_STILL_SRC } from '../../experience/experience.config';

@Component({
  selector: 'app-video-frame-preview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './video-frame-preview.component.html',
  styleUrl: './video-frame-preview.component.scss',
})
export class VideoFramePreviewComponent {
  readonly i18n = inject(LocaleService);

  readonly format = input<VideoFormatId>('landscape');
  readonly subtitles = input<SubtitlesId | ''>('none');
  readonly filled = input(false);
  readonly compact = input(false);
  readonly badge = input('');
  readonly karaoke = input(false);
  readonly captionColor = input(DEFAULT_SUBTITLES_COLOR);
  readonly highlightColor = input(DEFAULT_SUBTITLES_HIGHLIGHT_COLOR);

  readonly sampleWords = computed(() => this.i18n.tx(SUBTITLE_SAMPLE).split(/\s+/).filter(Boolean));
  /** Which sample word is highlighted in karaoke mode (the last one in English). */
  readonly karaokeWordIndex = computed(() => (this.i18n.isEnglish() ? this.sampleWords().length - 1 : 1));

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

  readonly resolvedCaptionColor = computed(() =>
    normalizeHexColor(this.captionColor(), DEFAULT_SUBTITLES_COLOR),
  );

  readonly resolvedHighlightColor = computed(() =>
    normalizeHexColor(this.highlightColor(), DEFAULT_SUBTITLES_HIGHLIGHT_COLOR),
  );
}
