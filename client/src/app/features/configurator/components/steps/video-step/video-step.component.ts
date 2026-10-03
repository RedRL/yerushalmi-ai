import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  SUBTITLES_OPTIONS,
  VIDEO_FORMAT_OPTIONS,
  VIDEO_LENGTH_OPTIONS,
} from '../../../../../core/config/pricing.config';
import type { SubtitlesId, VideoFormatId, VideoLengthId } from '../../../../../shared/models/pricing.model';
import { FORMAT_CAPTIONS } from '../../../experience/experience.config';
import { ConfiguratorStoreService } from '../../../state/configurator-store.service';
import { LengthSliderComponent } from '../../length-slider/length-slider.component';
import { VideoFramePreviewComponent } from '../../video-frame-preview/video-frame-preview.component';
import { WizardScreenComponent } from '../../wizard-screen/wizard-screen.component';

@Component({
  selector: 'app-video-step',
  imports: [WizardScreenComponent, VideoFramePreviewComponent, LengthSliderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './video-step.component.html',
  styleUrl: './video-step.component.scss',
})
export class VideoStepComponent {
  readonly store = inject(ConfiguratorStoreService);
  readonly lengthOptions = VIDEO_LENGTH_OPTIONS;
  readonly formatOptions = VIDEO_FORMAT_OPTIONS;
  readonly subtitlesOptions = SUBTITLES_OPTIONS;
  readonly formatCaptions = FORMAT_CAPTIONS;

  screenIndex(): number {
    return this.store.subStepPosition();
  }

  screenTotal(): number {
    return this.store.currentScreens().length;
  }

  format(): VideoFormatId {
    return this.store.videoForm.controls.format.value || 'landscape';
  }

  subtitles(): SubtitlesId {
    return this.store.videoForm.controls.subtitles.value || 'none';
  }

  filled(): boolean {
    return this.store.isAddonSelected('ai_image_fill');
  }

  lengthLabel(): string {
    const id = this.store.videoForm.controls.length.value;
    return this.lengthOptions.find((option) => option.id === id)?.labelHe ?? '';
  }

  selectLength(id: string): void {
    this.store.videoForm.controls.length.setValue(id as VideoLengthId);
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

  advance(): void {
    this.store.advanceSubStep();
  }
}
