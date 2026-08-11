import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, Validators } from '@angular/forms';
import { firstValueFrom, merge } from 'rxjs';

import { InquiryApiService } from '../../../core/services/inquiry-api.service';
import { PricingCalculatorService, type PriceTotals } from '../../../core/services/pricing-calculator.service';
import { ADDON_OPTIONS, DEFAULT_VIDEO_SOURCE, DEFAULT_LENGTH_ID, normalizeLengthId, getSongLengthOptions } from '../../../core/config/pricing.config';
import type { AddonId, MainProductId, PriceBreakdown, PricingSelection, SongLengthId, VideoLengthId } from '../../../shared/models/pricing.model';
import type { UploadedFileReference } from '../../../shared/models/upload.model';
import type { InquiryPayload } from '../../../shared/models/inquiry.model';
import { generateClientId } from '../../../shared/utils/id-generator.util';
import { FIELD_LIMITS } from '../../../core/config/field-limits.config';
import { CONFIGURATOR_STEPS, type ConfiguratorStepId } from '../configurator.model';
import {
  clearConfiguratorState,
  loadConfiguratorState,
  saveConfiguratorState,
  type PersistedConfiguratorState,
} from './configurator-persistence.util';

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
  return normalizeLengthId(value) !== '';
}

function resolveSongLength(length: string | null | undefined, mainProduct: MainProductId | null): SongLengthId {
  const normalized = normalizeLengthId(length) || DEFAULT_LENGTH_ID;
  const options = getSongLengthOptions(mainProduct);
  return options.some((option) => option.id === normalized) ? normalized : DEFAULT_LENGTH_ID;
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
    customStyle: this.fb.control('', Validators.maxLength(FIELD_LIMITS.customStyle)),
    mood: this.fb.control('', Validators.maxLength(FIELD_LIMITS.mood)),
    length: this.fb.control<SongLengthId | ''>(DEFAULT_LENGTH_ID),
    namesToInclude: this.fb.control('', Validators.maxLength(FIELD_LIMITS.namesToInclude)),
    importantWords: this.fb.control('', Validators.maxLength(FIELD_LIMITS.importantWords)),
    excludedTopics: this.fb.control('', Validators.maxLength(FIELD_LIMITS.excludedTopics)),
    additionalNotes: this.fb.control('', Validators.maxLength(FIELD_LIMITS.songAdditionalNotes)),
    existingSongName: this.fb.control('', Validators.maxLength(FIELD_LIMITS.existingSongName)),
    existingSongArtist: this.fb.control('', Validators.maxLength(FIELD_LIMITS.existingSongArtist)),
    existingSongLink: this.fb.control('', Validators.maxLength(FIELD_LIMITS.existingSongLink)),
  });

  readonly videoForm = this.fb.group({
    source: this.fb.control<'customer_photos' | 'ai_only' | 'mixed' | 'customer_videos' | ''>(DEFAULT_VIDEO_SOURCE),
    length: this.fb.control<VideoLengthId>(DEFAULT_LENGTH_ID),
    format: this.fb.control<'landscape' | 'portrait' | 'both'>('landscape'),
    subtitles: this.fb.control<'none' | 'selected' | 'full'>('none'),
  });

  readonly projectDetailsForm = this.fb.group({
    personName: this.fb.control('', [Validators.required, Validators.maxLength(FIELD_LIMITS.personName)]),
    occasion: this.fb.control('', [Validators.required, Validators.maxLength(FIELD_LIMITS.occasion)]),
    age: this.fb.control('', Validators.maxLength(FIELD_LIMITS.age)),
    relationship: this.fb.control('', Validators.maxLength(FIELD_LIMITS.relationship)),
    characterTraits: this.fb.control('', Validators.maxLength(FIELD_LIMITS.characterTraits)),
    hobbies: this.fb.control('', Validators.maxLength(FIELD_LIMITS.hobbies)),
    occupation: this.fb.control('', Validators.maxLength(FIELD_LIMITS.occupation)),
    peopleToMention: this.fb.control('', Validators.maxLength(FIELD_LIMITS.peopleToMention)),
    desiredAtmosphere: this.fb.control('', Validators.maxLength(FIELD_LIMITS.desiredAtmosphere)),
    story: this.fb.control('', [
      Validators.required,
      Validators.minLength(10),
      Validators.maxLength(FIELD_LIMITS.story),
    ]),
    additionalNotes: this.fb.control('', Validators.maxLength(FIELD_LIMITS.projectAdditionalNotes)),
  });

  readonly contactForm = this.fb.group({
    name: this.fb.control('', [Validators.required, Validators.maxLength(FIELD_LIMITS.contactName)]),
    phone: this.fb.control('', [
      Validators.required,
      Validators.pattern(/^[0-9+\-\s()]{7,20}$/),
      Validators.maxLength(FIELD_LIMITS.contactPhone),
    ]),
    email: this.fb.control('', [
      Validators.required,
      Validators.email,
      Validators.maxLength(FIELD_LIMITS.contactEmail),
    ]),
    message: this.fb.control('', Validators.maxLength(FIELD_LIMITS.contactMessage)),
    mediaRightsConsent: this.fb.control(false, Validators.requiredTrue),
    contactPermissionConsent: this.fb.control(false, Validators.requiredTrue),
    termsConsent: this.fb.control(false, Validators.requiredTrue),
  });

  constructor() {
    this.restorePersistedState();
    this.ensureSongLengthDefault();

    merge(
      this.songForm.valueChanges,
      this.videoForm.valueChanges,
      this.projectDetailsForm.valueChanges,
      this.contactForm.valueChanges,
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.formRevision.update((value) => value + 1);
        this.persistState();
      });

    this.songForm.controls.length.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((length) => {
        if (this.mainProduct() === 'video_new_song' && isSongLengthId(length)) {
          this.videoForm.controls.length.setValue(length, { emitEvent: false });
        }
      });
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

  readonly songCustomStyleText = computed(() => this.songValue().customStyle);

  readonly songCustomStyleTouched = computed(() => {
    this.formRevision();
    return this.songForm.controls.customStyle.touched;
  });

  readonly isFullExperience = computed(() => this.mainProduct() === 'video_new_song');

  readonly includesNewSong = computed(
    () => this.mainProduct() === 'song_only' || this.mainProduct() === 'video_new_song',
  );
  readonly includesVideo = computed(
    () => this.mainProduct() === 'video_existing_song' || this.mainProduct() === 'video_new_song',
  );
  readonly requiresExistingSongRights = computed(() => this.mainProduct() === 'video_existing_song');

  readonly requiresUploadStep = computed(() => this.includesVideo());

  readonly visibleSteps = computed(() =>
    this.steps.filter((step) => this.isStepVisible(step.id)),
  );

  readonly pricingSelection = computed<PricingSelection>(() => {
    const songLength = this.songValue().length;
    return {
      mainProduct: this.mainProduct() ?? 'song_only',
      videoSource: this.includesVideo() ? DEFAULT_VIDEO_SOURCE : undefined,
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

  readonly originalPriceTotal = computed<number | null>(() =>
    this.mainProduct() ? this.pricingCalculator.calculateOriginal(this.pricingSelection()).total : null,
  );

  estimateTotals(overrides: Partial<PricingSelection> = {}): PriceTotals {
    const current = this.pricingSelection();
    const selection: PricingSelection = {
      ...current,
      ...overrides,
      addons: overrides.addons ?? current.addons,
    };
    return this.pricingCalculator.estimateTotals(selection);
  }

  readonly isProductStepValid = computed(() => this.mainProduct() !== null);

  readonly isSongStepValid = computed(() => {
    if (!this.mainProduct()) return false;
    const value = this.songValue();
    if (this.songForm.controls.additionalNotes.invalid) return false;
    if (this.requiresExistingSongRights()) {
      return value.existingSongName.trim().length > 0;
    }
    if (this.includesNewSong()) {
      const styles = parseSongStyles(value.style);
      if (styles.length === 0) return false;
      const onlyOther = styles.length === 1 && styles[0] === 'אחר';
      if (onlyOther) return value.customStyle.trim().length > 0;
      return true;
    }
    return true;
  });

  readonly isVideoStepValid = computed(() => {
    if (!this.includesVideo()) return true;
    const value = this.videoValue();
    return Boolean(value.length && value.format && value.subtitles);
  });

  readonly isDetailsStepValid = computed(() => {
    this.formRevision();
    return this.projectDetailsForm.valid;
  });

  readonly isUploadStepValid = computed(() => {
    if (!this.requiresUploadStep()) return true;
    const files = this.uploadedFiles();
    return files.some((file) => file.status === 'complete');
  });

  readonly isExtrasStepValid = computed(() => {
    this.formRevision();
    return this.projectDetailsForm.valid;
  });

  readonly isSummaryStepValid = computed(() => true);

  readonly isContactStepValid = computed(() => {
    this.formRevision();
    return this.contactForm.valid;
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
      case 'extras':
        return this.isExtrasStepValid();
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
    if (id === 'video_existing_song' || id === 'video_new_song') {
      this.videoForm.controls.source.setValue(DEFAULT_VIDEO_SOURCE, { emitEvent: false });
    }
    this.ensureSongLengthDefault();
    this.persistState();
  }

  beginWithPackage(id: MainProductId): void {
    this.mainProduct.set(id);
    if (id === 'video_existing_song' || id === 'video_new_song') {
      this.videoForm.controls.source.setValue(DEFAULT_VIDEO_SOURCE, { emitEvent: false });
    }
    this.ensureSongLengthDefault();
    this.currentStepIndex.set(1);
    this.persistState();
  }

  isSongStyleSelected(style: string): boolean {
    return this.selectedSongStyles().includes(style);
  }

  private isOtherStyleOnly(): boolean {
    const styles = this.selectedSongStyles();
    return styles.length === 1 && styles[0] === 'אחר';
  }

  markSongCustomStyleTouched(): void {
    this.songForm.controls.customStyle.markAsTouched();
    this.formRevision.update((value) => value + 1);
  }

  toggleSongStyle(style: string): void {
    const current = parseSongStyles(this.songForm.controls.style.value);

    if (style === 'אחר') {
      const next = current.includes('אחר')
        ? current.filter((item) => item !== 'אחר')
        : [...current, 'אחר'];
      this.songForm.controls.style.setValue(joinSongStyles(next));
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
    if (!this.isCurrentStepValid()) {
      this.markCurrentStepTouched();
      return;
    }
    const total = this.visibleSteps().length;
    this.currentStepIndex.update((index) => Math.min(index + 1, total - 1));
    this.persistState();
  }

  private markCurrentStepTouched(): void {
    const stepId = this.currentStep()?.id;
    switch (stepId) {
      case 'details':
      case 'extras':
        this.projectDetailsForm.markAllAsTouched();
        break;
      case 'contact':
        this.contactForm.markAllAsTouched();
        break;
      case 'song':
        this.songForm.controls.style.markAsTouched();
        if (this.isOtherStyleOnly()) {
          this.songForm.controls.customStyle.markAsTouched();
        }
        break;
      default:
        break;
    }
    this.formRevision.update((value) => value + 1);
  }

  goBack(): void {
    this.currentStepIndex.update((index) => Math.max(index - 1, 0));
    this.persistState();
  }

  goToStep(index: number): void {
    if (index <= this.currentStepIndex()) {
      this.currentStepIndex.set(index);
      this.persistState();
      return;
    }

    for (let i = this.currentStepIndex(); i < index; i++) {
      const step = this.visibleSteps()[i];
      if (!step || !this.isStepValid(step.id)) return;
    }
    this.currentStepIndex.set(index);
    this.persistState();
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
        email: contact.email.trim(),
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
        termsAccepted: true,
        musicRights: this.requiresExistingSongRights() ? true : undefined,
      },
      clientPricePreview: { total: this.priceBreakdown()?.total ?? 0 },
    };

    if (this.includesNewSong() || this.requiresExistingSongRights()) {
      const styles = parseSongStyles(song.style);
      payload.song = {
        style: undefinedIfEmpty(song.style),
        customStyle: styles.includes('אחר') ? undefinedIfEmpty(song.customStyle) : undefined,
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
        source: DEFAULT_VIDEO_SOURCE,
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
      clearConfiguratorState();
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
      length: DEFAULT_LENGTH_ID,
      namesToInclude: '',
      importantWords: '',
      excludedTopics: '',
      additionalNotes: '',
      existingSongName: '',
      existingSongArtist: '',
      existingSongLink: '',
    });
    this.videoForm.reset({ source: DEFAULT_VIDEO_SOURCE, length: DEFAULT_LENGTH_ID, format: 'landscape', subtitles: 'none' });
    this.projectDetailsForm.reset();
    this.contactForm.reset({
      name: '',
      phone: '',
      email: '',
      message: '',
      mediaRightsConsent: false,
      contactPermissionConsent: false,
      termsConsent: false,
    });
    this.submitError.set(null);
    this.submitResult.set(null);
    clearConfiguratorState();
  }

  private persistState(): void {
    if (this.submitResult()) return;

    const state: PersistedConfiguratorState = {
      currentStepIndex: this.currentStepIndex(),
      mainProduct: this.mainProduct(),
      addons: this.addons(),
      songForm: this.songForm.getRawValue() as Record<string, string>,
      videoForm: this.videoForm.getRawValue(),
      projectDetailsForm: this.projectDetailsForm.getRawValue(),
      contactForm: this.contactForm.getRawValue(),
      uploadedFiles: this.uploadedFiles().map((file) => ({
        id: file.id,
        type: file.type,
        name: file.name,
        storageKey: file.storageKey,
        url: file.url,
        status: file.status,
        sizeBytes: file.sizeBytes,
        errorMessageHe: file.errorMessageHe,
      })),
    };
    saveConfiguratorState(state);
  }

  private ensureSongLengthDefault(): void {
    const next = resolveSongLength(this.songForm.controls.length.value, this.mainProduct());
    if (this.songForm.controls.length.value !== next) {
      this.songForm.controls.length.setValue(next, { emitEvent: false });
    }
    if (this.mainProduct() === 'video_new_song') {
      this.videoForm.controls.length.setValue(next, { emitEvent: false });
    }
  }

  private restorePersistedState(): void {
    const saved = loadConfiguratorState();
    if (!saved) return;

    if (saved.mainProduct) this.mainProduct.set(saved.mainProduct);
    this.addons.set(saved.addons ?? []);
    this.currentStepIndex.set(saved.currentStepIndex ?? 0);
    this.songForm.patchValue(saved.songForm ?? {}, { emitEvent: false });
    this.songForm.controls.length.setValue(
      resolveSongLength(saved.songForm?.['length'], saved.mainProduct ?? null),
      { emitEvent: false },
    );
    const savedVideoForm = { ...(saved.videoForm ?? {}) };
    if (savedVideoForm.source !== DEFAULT_VIDEO_SOURCE) {
      savedVideoForm.source = DEFAULT_VIDEO_SOURCE;
    }
    const normalizedVideoLength = normalizeLengthId(savedVideoForm.length);
    if (normalizedVideoLength) {
      savedVideoForm.length = normalizedVideoLength;
    }
    this.videoForm.patchValue(savedVideoForm as typeof this.videoForm.value, { emitEvent: false });
    this.projectDetailsForm.patchValue(saved.projectDetailsForm ?? {}, { emitEvent: false });
    this.contactForm.patchValue(saved.contactForm ?? {}, { emitEvent: false });
    this.uploadedFiles.set((saved.uploadedFiles ?? []) as UploadedFileReference[]);
    this.formRevision.update((value) => value + 1);
  }

  generateFileId(): string {
    return generateClientId('file');
  }
}
