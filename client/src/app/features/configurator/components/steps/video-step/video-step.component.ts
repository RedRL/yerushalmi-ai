import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, viewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FIELD_LIMITS } from '../../../../../core/config/field-limits.config';
import {
  DEFAULT_SUBTITLES_COLOR,
  DEFAULT_SUBTITLES_HIGHLIGHT_COLOR,
  FULL_EXPERIENCE_LENGTH_HALF_STEP_PRICE,
  localizedOptionLabel,
  normalizeHexColor,
  SUBTITLES_OPTIONS,
  VIDEO_FORMAT_OPTIONS,
  VIDEO_LENGTH_OPTIONS,
} from '../../../../../core/config/pricing.config';
import { CurrencyService } from '../../../../../core/i18n/currency.service';
import { LocaleService } from '../../../../../core/i18n/locale.service';
import type { SubtitlesId, VideoFormatId, VideoLengthId } from '../../../../../shared/models/pricing.model';
import { FORMAT_CAPTIONS } from '../../../experience/experience.config';
import { ConfiguratorStoreService } from '../../../state/configurator-store.service';
import { LengthSliderComponent } from '../../length-slider/length-slider.component';
import { VideoFramePreviewComponent } from '../../video-frame-preview/video-frame-preview.component';
import { WizardScreenComponent } from '../../wizard-screen/wizard-screen.component';

@Component({
  selector: 'app-video-step',
  imports: [ReactiveFormsModule, WizardScreenComponent, VideoFramePreviewComponent, LengthSliderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './video-step.component.html',
  styleUrl: './video-step.component.scss',
})
export class VideoStepComponent {
  readonly store = inject(ConfiguratorStoreService);
  readonly i18n = inject(LocaleService);
  readonly money = inject(CurrencyService);
  readonly lengthOptions = VIDEO_LENGTH_OPTIONS;
  readonly formatOptions = VIDEO_FORMAT_OPTIONS;
  readonly subtitlesOptions = SUBTITLES_OPTIONS;
  readonly formatCaptions = FORMAT_CAPTIONS;
  readonly limits = FIELD_LIMITS;
  private readonly subtitleOptions = viewChild<ElementRef<HTMLElement>>('subtitleOptions');

  readonly formatHeading = computed(() =>
    this.i18n.t(this.store.isWeddingsMode() ? 'video.format.headingWedding' : 'video.format.heading'),
  );

  lengthDescription(): string {
    if (this.store.requiresExistingSongRights()) {
      return this.i18n.t('video.length.descriptionExistingSong');
    }
    return this.i18n.tf('video.length.descriptionHalfStep', {
      price: this.money.format(FULL_EXPERIENCE_LENGTH_HALF_STEP_PRICE),
    });
  }

  optionLabel(option: { labelHe: string; labelEn?: string }): string {
    return localizedOptionLabel(option, this.i18n.locale());
  }

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

  hasSubtitles(): boolean {
    return this.store.subtitleStyle().hasSubtitles;
  }

  karaokeEnabled(): boolean {
    return this.store.subtitleStyle().karaoke;
  }

  subtitlesColor(): string {
    return this.store.subtitleStyle().color;
  }

  highlightColor(): string {
    return this.store.subtitleStyle().highlightColor;
  }

  lengthLabel(): string {
    const id = this.store.videoForm.controls.length.value;
    const option = this.lengthOptions.find((candidate) => candidate.id === id);
    return option ? this.optionLabel(option) : '';
  }

  selectLength(id: string): void {
    this.store.videoForm.controls.length.setValue(id as VideoLengthId);
  }

  selectFormat(id: VideoFormatId): void {
    this.store.videoForm.controls.format.setValue(id);
  }

  selectSubtitles(id: SubtitlesId): void {
    this.store.videoForm.controls.subtitles.setValue(id);
    if (id === 'none') {
      this.store.videoForm.controls.subtitlesKaraoke.setValue(false);
      return;
    }
    setTimeout(() => this.scrollSubtitleOptionsIntoView());
  }

  private scrollSubtitleOptionsIntoView(): void {
    const options = this.subtitleOptions()?.nativeElement;
    if (!options) return;

    const scroller = options.closest('.configurator__body');
    if (!(scroller instanceof HTMLElement)) {
      options.scrollIntoView({ block: 'nearest', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
      return;
    }

    const optionsRect = options.getBoundingClientRect();
    const scrollerRect = scroller.getBoundingClientRect();
    const padding = 12;
    const footer = document.querySelector('.configurator__footer');
    let limitBottom = scrollerRect.bottom;
    if (footer instanceof HTMLElement) {
      const footerRect = footer.getBoundingClientRect();
      if (footerRect.top < limitBottom && footerRect.bottom > 0) {
        limitBottom = Math.min(limitBottom, footerRect.top);
      }
    }

    if (optionsRect.top >= scrollerRect.top + padding && optionsRect.bottom <= limitBottom - padding) {
      return;
    }

    const delta =
      optionsRect.bottom > limitBottom - padding
        ? optionsRect.bottom - (limitBottom - padding)
        : optionsRect.top - (scrollerRect.top + padding);
    scroller.scrollTo({
      top: scroller.scrollTop + delta,
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });
  }

  selectKaraoke(enabled: boolean): void {
    this.store.videoForm.controls.subtitlesKaraoke.setValue(enabled);
  }

  onSubtitlesColorInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.store.videoForm.controls.subtitlesColor.setValue(
      normalizeHexColor(value, DEFAULT_SUBTITLES_COLOR),
    );
  }

  onHighlightColorInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.store.videoForm.controls.subtitlesHighlightColor.setValue(
      normalizeHexColor(value, DEFAULT_SUBTITLES_HIGHLIGHT_COLOR),
    );
  }

  advance(): void {
    this.store.advanceSubStep();
  }
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
