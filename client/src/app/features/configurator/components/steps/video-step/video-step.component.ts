import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  VIDEO_FORMAT_OPTIONS,
  VIDEO_LENGTH_OPTIONS,
  SUBTITLES_OPTIONS,
} from '../../../../../core/config/pricing.config';
import type { SubtitlesId, VideoFormatId, VideoLengthId } from '../../../../../shared/models/pricing.model';
import { ConfiguratorStoreService } from '../../../state/configurator-store.service';

@Component({
  selector: 'app-video-step',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './video-step.component.html',
  styleUrl: './video-step.component.scss',
})
export class VideoStepComponent {
  readonly store = inject(ConfiguratorStoreService);

  readonly lengthOptions = VIDEO_LENGTH_OPTIONS;
  readonly formatOptions = VIDEO_FORMAT_OPTIONS;
  readonly subtitlesOptions = SUBTITLES_OPTIONS;

  readonly hideVideoLength = computed(() => this.store.isFullExperience());
  readonly showSongLengthHint = computed(() => this.store.requiresExistingSongRights());

  selectLength(id: VideoLengthId): void {
    this.store.videoForm.controls.length.setValue(id);
  }

  selectFormat(id: VideoFormatId): void {
    this.store.videoForm.controls.format.setValue(id);
  }

  selectSubtitles(id: SubtitlesId): void {
    this.store.videoForm.controls.subtitles.setValue(id);
  }

  selectImageFill(enabled: boolean): void {
    if (this.store.isAddonSelected('ai_image_fill') !== enabled) {
      this.store.toggleAddon('ai_image_fill');
    }
  }
}
