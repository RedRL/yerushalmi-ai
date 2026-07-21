import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  VIDEO_FORMAT_OPTIONS,
  VIDEO_LENGTH_OPTIONS,
  VIDEO_SOURCE_OPTIONS,
  SUBTITLES_OPTIONS,
} from '../../../../../core/config/pricing.config';
import type {
  SubtitlesId,
  VideoFormatId,
  VideoLengthId,
  VideoSourceId,
} from '../../../../../shared/models/pricing.model';
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

  readonly sourceOptions = VIDEO_SOURCE_OPTIONS;
  readonly lengthOptions = VIDEO_LENGTH_OPTIONS;
  readonly formatOptions = VIDEO_FORMAT_OPTIONS;
  readonly subtitlesOptions = SUBTITLES_OPTIONS;

  readonly hideVideoLength = computed(() => this.store.isFullExperience());
  readonly showSongLengthHint = computed(() => this.store.requiresExistingSongRights());

  selectSource(id: VideoSourceId): void {
    this.store.videoForm.controls.source.setValue(id);
  }

  selectLength(id: VideoLengthId): void {
    this.store.videoForm.controls.length.setValue(id);
  }

  selectFormat(id: VideoFormatId): void {
    this.store.videoForm.controls.format.setValue(id);
  }

  selectSubtitles(id: SubtitlesId): void {
    this.store.videoForm.controls.subtitles.setValue(id);
  }
}
