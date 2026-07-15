import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, Validators } from '@angular/forms';
import { firstValueFrom, merge } from 'rxjs';

import { InquiryApiService } from '../../../core/services/inquiry-api.service';
import { PricingCalculatorService } from '../../../core/services/pricing-calculator.service';
import { ADDON_OPTIONS } from '../../../core/config/pricing.config';
import type { AddonId, MainProductId, PriceBreakdown, PricingSelection, SongLengthId } from '../../../shared/models/pricing.model';
import type { UploadedFileReference } from '../../../shared/models/upload.model';
import type { InquiryPayload } from '../../../shared/models/inquiry.model';
import { generateClientId } from '../../../shared/utils/id-generator.util';
import { CONFIGURATOR_STEPS, type ConfiguratorStepId } from '../configurator.model';

function splitToList(value: string): string[] {
  return value
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseSongStyles(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function joinSongStyles(styles: string[]): string {
  return styles.join(', ');
}

function undefinedIfEmpty(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function isSongLengthId(value: string): value is SongLengthId {
  return value === 'up_to_2_min' || value === 'up_to_3_min' || value === 'up_to_4_min';
}

export interface SubmitResult {
  inquiryId: string;
  priceBreakdown: PriceBreakdown;
}

@Injectable()
export class ConfiguratorStoreService {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly pricingCalculator = inject(PricingCalculatorService);
  private readonly inquiryApi = inject(InquiryApiService);

  /** Bumped on every reactive-form change so validation computeds stay in sync. */
  private readonly formRevision = signal(0);

  readonly steps = CONFIGURATOR_STEPS;

  readonly currentStepIndex = signal(0);
  readonly mainProduct = signal<MainProductId | null>(null);
  readonly addons = signal<AddonId[]>([]);
  readonly uploadedFiles = signal<UploadedFileReference[]>([]);

  readonly isSubmitting = signal(false);
  readonly submitError = signal<string | null>(null);
  readonly submitResult = signal<SubmitResult | null>(null);

  readonly addonOptions = ADDON_OPTIONS;

  readonly songForm = this.fb.group({
    style: this.fb.control(''),
    customStyle: this.fb.control(''),
    mood: this.fb.control(''),
    length: this.fb.control<SongLengthId | ''>(''),
    namesToInclude: this.fb.control(''),
    importantWords: this.fb.control(''),
    excludedTopics: this.fb.control(''),
    additionalNotes: this.fb.control(''),
    existingSongName: this.fb.control(''),
    existingSongArtist: this.fb.control(''),
    existingSongLink: this.fb.control(''),
  });

  readonly videoForm = this.fb.group({
    source: this.fb.control<'customer_photos' | 'ai_only' | 'mixed' | 'customer_videos' | ''>(''),
    length: this.fb.control<'up_to_2_min' | 'up_to_3_min' | 'up_to_4_min'>('up_to_2_min'),
    format: this.fb.control<'landscape' | 'portrait' | 'both'>('landscape'),
    subtitles: this.fb.control<'none' | 'selected' | 'full'>('none'),
  });

  readonly projectDetailsForm = this.fb.group({
    personName: this.fb.control('', Validators.required),
    occasion: this.fb.control('', Validators.required),
    age: this.fb.control(''),
    relationship: this.fb.control(''),
    characterTraits: this.fb.control(''),
    hobbies: this.fb.control(''),
    occupation: this.fb.control(''),
    peopleToMention: this.fb.control(''),
    desiredAtmosphere: this.fb.control(''),
    story: this.fb.control('', [Validators.required, Validators.minLength(10)]),
    additionalNotes: this.fb.control(''),
  });

  readonly contactForm = this.fb.group({
    name: this.fb.control('', Validators.required),
    phone: this.fb.control('', [Validators.required, Validators.pattern(/^[0-9+\-\s()]{7,20}$/)]),
    email: this.fb.control('', {
      validators: [
        (control) => {
          const value = control.value?.trim?.() ?? control.value;
          if (!value) return null;
          return Validators.email(control);
        },
      ],
    }),
    message: this.fb.control(''),
    mediaRightsConsent: this.fb.control(false),
    contactPermissionConsent: this.fb.control(false),
    musicRightsConsent: this.fb.control(false),
  });

  constructor() {
    merge(
      this.songForm.valueChanges,
      this.videoForm.valueChanges,
      this.projectDetailsForm.valueChanges,
      this.contactForm.valueChanges,
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.formRevision.update((value) => value + 1));
  }

  private songValue() {
    this.formRevision();
    return this.songForm.getRawValue();
  }

  private videoValue() {
    this.formRevision();
    return this.videoForm.getRawValue();
  }

  private projectDetailsValue() {
    this.formRevision();
    return this.projectDetailsForm.getRawValue();
  }

  private contactValue() {
    this.formRevision();
    return this.contactForm.getRawValue();
  }

  readonly selectedSongStyles = computed(() => parseSongStyles(this.songValue().style));

  readonly includesNewSong = computed(
    () => this.mainProduct() === 'song_only' || this.mainProduct() === 'video_new_song',
  );
  readonly includesVideo = computed(
    () => this.mainProduct() === 'video_existing_song' || this.mainProduct() === 'video_new_song',
  );
  readonly requiresExistingSongRights = computed(() => this.mainProduct() === 'video_existing_song');

  readonly requiresUploadStep = computed(() => {
    const source = this.videoValue().source;
    return this.includesVideo() && (source === 'mixed' || source === 'customer_videos');
  });

  readonly visibleSteps = computed(() =>
    this.steps.filter((step) => this.isStepVisible(step.id)),
  );

  readonly pricingSelection = computed<PricingSelection>(() => {
    const songLength = this.songValue().length;
    return {
      mainProduct: this.mainProduct() ?? 'song_only',
      videoSource: this.videoValue().source || undefined,
      videoLength: this.videoValue().length,
      songLength: isSongLengthId(songLength) ? songLength : undefined,
      videoFormat: this.videoValue().format,
      subtitles: this.videoValue().subtitles,
      addons: this.addons(),
    };
  });

  readonly priceBreakdown = computed<PriceBreakdown | null>(() =>
    this.mainProduct() ? this.pricingCalculator.calculate(this.pricingSelection()) : null,
  );

  readonly isProductStepValid = computed(() => this.mainProduct() !== null);

  readonly isSongStepValid = computed(() => {
    if (!this.mainProduct()) return false;
    const value = this.songValue();
    if (this.requiresExistingSongRights()) {
      return value.existingSongName.trim().length > 0;
    }
    if (this.includesNewSong()) {
      const styles = parseSongStyles(value.style);
      return styles.length > 0 || value.customStyle.trim().length > 0;
    }
    return true;
  });

  readonly isVideoStepValid = computed(() => {
    if (!this.includesVideo()) return true;
    const value = this.videoValue();
    return Boolean(value.source && value.length && value.format && value.subtitles);
  });

  readonly isDetailsStepValid = computed(() => {
    this.formRevision();
    return this.projectDetailsForm.valid;
  });

  readonly isUploadStepValid = computed(() => {
    if (!this.requiresUploadStep()) return true;
    const source = this.videoValue().source;
    const files = this.uploadedFiles();
    if (source === 'customer_videos') return files.some((file) => file.type === 'video');
    return files.some((file) => file.type === 'image');
  });

  readonly isSummaryStepValid = computed(() => true);

  readonly isContactStepValid = computed(() => {
    const value = this.contactValue();
    const baseValid =
      this.contactForm.controls.name.valid &&
      this.contactForm.controls.phone.valid &&
      this.contactForm.controls.email.valid &&
      value.mediaRightsConsent &&
      value.contactPermissionConsent;

    if (this.requiresExistingSongRights()) {
      return baseValid && value.musicRightsConsent;
    }
    return baseValid;
  });

  isStepVisible(id: ConfiguratorStepId): boolean {
    switch (id) {
      case 'video':
        return this.includesVideo();
      case 'upload':
        return this.requiresUploadStep();
      default:
        return true;
    }
  }

  isStepValid(id: ConfiguratorStepId): boolean {
    switch (id) {
      case 'product':
        return this.isProductStepValid();
      case 'song':
        return this.isSongStepValid();
      case 'video':
        return this.isVideoStepValid();
      case 'details':
        return this.isDetailsStepValid();
      case 'upload':
        return this.isUploadStepValid();
      case 'summary':
        return this.isSummaryStepValid();
      case 'contact':
        return this.isContactStepValid();
      default:
        return false;
    }
  }

  readonly currentStep = computed(() => this.visibleSteps()[this.currentStepIndex()]);

  readonly isCurrentStepValid = computed(() => {
    const step = this.currentStep();
    if (!step) return false;
    return this.isStepValid(step.id);
  });

  selectMainProduct(id: MainProductId): void {
    this.mainProduct.set(id);
  }

  beginWithPackage(id: MainProductId): void {
    this.mainProduct.set(id);
    this.currentStepIndex.set(1);
  }

  isSongStyleSelected(style: string): boolean {
    return this.selectedSongStyles().includes(style);
  }

  toggleSongStyle(style: string): void {
    const current = parseSongStyles(this.songForm.controls.style.value);

    if (style === 'אחר') {
      const next = current.includes('אחר')
        ? current.filter((item) => item !== 'אחר')
        : [...current, 'אחר'];
      this.songForm.controls.style.setValue(joinSongStyles(next));
      if (!next.includes('אחר')) {
        this.songForm.controls.customStyle.setValue('');
      }
    } else {
      const next = current.includes(style)
        ? current.filter((item) => item !== style)
        : [...current, style];
      this.songForm.controls.style.setValue(joinSongStyles(next));
    }

    this.songForm.controls.style.markAsTouched();
    this.formRevision.update((value) => value + 1);
  }

  toggleAddon(id: AddonId): void {
    this.addons.update((current) =>
      current.includes(id) ? current.filter((addonId) => addonId !== id) : [...current, id],
    );
  }

  addUploadedFile(file: UploadedFileReference): void {
    this.uploadedFiles.update((files) => [...files, file]);
  }

  updateUploadedFile(id: string, patch: Partial<UploadedFileReference>): void {
    this.uploadedFiles.update((files) => files.map((file) => (file.id === id ? { ...file, ...patch } : file)));
  }

  removeUploadedFile(id: string): void {
    this.uploadedFiles.update((files) => {
      const target = files.find((file) => file.id === id);
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return files.filter((file) => file.id !== id);
    });
  }

  goNext(): void {
    if (!this.isCurrentStepValid()) return;
    const total = this.visibleSteps().length;
    this.currentStepIndex.update((index) => Math.min(index + 1, total - 1));
  }

  goBack(): void {
    this.currentStepIndex.update((index) => Math.max(index - 1, 0));
  }

  goToStep(index: number): void {
    if (index <= this.currentStepIndex()) {
      this.currentStepIndex.set(index);
      return;
    }

    for (let i = this.currentStepIndex(); i < index; i++) {
      const step = this.visibleSteps()[i];
      if (!step || !this.isStepValid(step.id)) return;
    }
    this.currentStepIndex.set(index);
  }

  private buildInquiryPayload(): InquiryPayload {
    const mainProduct = this.mainProduct();
    if (!mainProduct) throw new Error('Main product must be selected before submitting.');

    const song = this.songValue();
    const video = this.videoValue();
    const details = this.projectDetailsValue();
    const contact = this.contactValue();

    const payload: InquiryPayload = {
      contact: {
        name: contact.name.trim(),
        phone: contact.phone.trim(),
        email: undefinedIfEmpty(contact.email),
      },
      mainProduct,
      addons: this.addons(),
      projectDetails: {
        personName: details.personName.trim(),
        occasion: details.occasion.trim(),
        age: undefinedIfEmpty(details.age),
        relationship: undefinedIfEmpty(details.relationship),
        characterTraits: undefinedIfEmpty(details.characterTraits),
        hobbies: undefinedIfEmpty(details.hobbies),
        occupation: undefinedIfEmpty(details.occupation),
        peopleToMention: undefinedIfEmpty(details.peopleToMention),
        desiredAtmosphere: undefinedIfEmpty(details.desiredAtmosphere),
        story: details.story.trim(),
        additionalNotes: undefinedIfEmpty(details.additionalNotes),
      },
      uploadedFiles: this.uploadedFiles()
        .filter((file) => file.status === 'complete')
        .map((file) => ({ id: file.id, type: file.type, name: file.name, storageKey: file.storageKey, url: file.url })),
      consents: {
        mediaRights: true,
        contactPermission: true,
        musicRights: this.requiresExistingSongRights() ? contact.musicRightsConsent : undefined,
      },
      clientPricePreview: { total: this.priceBreakdown()?.total ?? 0 },
    };

    if (this.includesNewSong() || this.requiresExistingSongRights()) {
      payload.song = {
        style: undefinedIfEmpty(song.style),
        customStyle: undefinedIfEmpty(song.customStyle),
        mood: undefinedIfEmpty(song.mood),
        length: undefinedIfEmpty(song.length),
        namesToInclude: splitToList(song.namesToInclude),
        importantWords: splitToList(song.importantWords),
        excludedTopics: splitToList(song.excludedTopics),
        additionalNotes: undefinedIfEmpty(song.additionalNotes),
        existingSongName: undefinedIfEmpty(song.existingSongName),
        existingSongArtist: undefinedIfEmpty(song.existingSongArtist),
        existingSongLink: undefinedIfEmpty(song.existingSongLink),
      };
    }

    if (this.includesVideo()) {
      payload.video = {
        source: video.source || undefined,
        length: video.length,
        format: video.format,
        subtitles: video.subtitles,
      };
    }

    return payload;
  }

  async submit(): Promise<void> {
    this.isSubmitting.set(true);
    this.submitError.set(null);

    try {
      const payload = this.buildInquiryPayload();
      const response = await firstValueFrom(this.inquiryApi.submitInquiry(payload));
      this.submitResult.set({
        inquiryId: response.data.inquiryId,
        priceBreakdown: response.data.priceBreakdown,
      });
    } catch (error) {
      this.submitError.set(error instanceof Error ? error.message : 'שליחת הבקשה נכשלה. נסו שוב.');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  reset(): void {
    this.currentStepIndex.set(0);
    this.mainProduct.set(null);
    this.addons.set([]);
    this.uploadedFiles().forEach((file) => file.previewUrl && URL.revokeObjectURL(file.previewUrl));
    this.uploadedFiles.set([]);
    this.songForm.reset({
      style: '',
      customStyle: '',
      mood: '',
      length: '',
      namesToInclude: '',
      importantWords: '',
      excludedTopics: '',
      additionalNotes: '',
      existingSongName: '',
      existingSongArtist: '',
      existingSongLink: '',
    });
    this.videoForm.reset({ source: '', length: 'up_to_2_min', format: 'landscape', subtitles: 'none' });
    this.projectDetailsForm.reset();
    this.contactForm.reset({
      name: '',
      phone: '',
      email: '',
      message: '',
      mediaRightsConsent: false,
      contactPermissionConsent: false,
      musicRightsConsent: false,
    });
    this.submitError.set(null);
    this.submitResult.set(null);
  }

  generateFileId(): string {
    return generateClientId('file');
  }
}
