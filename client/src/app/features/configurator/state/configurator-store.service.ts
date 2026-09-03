import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, Validators } from '@angular/forms';
import { firstValueFrom, merge } from 'rxjs';

import { InquiryApiService } from '../../../core/services/inquiry-api.service';
import { UploadApiService } from '../../../core/services/upload-api.service';
import { PricingCalculatorService, type PriceTotals } from '../../../core/services/pricing-calculator.service';
import { ADDON_OPTIONS, DEFAULT_VIDEO_SOURCE, DEFAULT_LENGTH_ID, DEFAULT_VIDEO_FORMAT, normalizeLengthId, normalizeVideoFormatId, getSongLengthOptions, findAddon, PRODUCT_INCLUDES_VIDEO } from '../../../core/config/pricing.config';
import { getMinimumImageCountForVideoLength, getMaximumImageCountForVideoLength, getMaximumVideoCountForVideoLength } from '../../../core/config/upload-requirements.config';
import type { AddonId, MainProductId, PriceBreakdown, PricingSelection, SongLengthId, VideoFormatId, VideoLengthId, VocalistId } from '../../../shared/models/pricing.model';
import type { UploadedFileReference } from '../../../shared/models/upload.model';
import type { InquiryPayload } from '../../../shared/models/inquiry.model';
import { generateClientId } from '../../../shared/utils/id-generator.util';
import {
  extractInquiryFolderId,
  inquiryFolderContainsReference,
  inquiryFolderMatchesName,
  isLegacyInquiryFolderId,
} from '../../../shared/utils/inquiry-folder.util';
import { generateInquiryReferenceId } from '../../../shared/utils/inquiry-reference.util';
import { deleteUploadFile, getUploadFile } from '../../../shared/utils/upload-file-store.util';
import { compressImageForUpload } from '../../../shared/utils/compress-image.util';
import { toHebrewUserError } from '../../../shared/utils/network-error.util';
import { FIELD_LIMITS } from '../../../core/config/field-limits.config';
import { CONFIGURATOR_STEPS, type ConfiguratorStepId } from '../configurator.model';
import {
  clearConfiguratorState,
  loadConfiguratorState,
  saveConfiguratorState,
  type PersistedConfiguratorState,
  type ProductPricingSnapshot,
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

function filterAddonsForProduct(addons: AddonId[], product: MainProductId): AddonId[] {
  const includesVideo = PRODUCT_INCLUDES_VIDEO[product];
  return addons.filter((id) => {
    const addon = findAddon(id);
    if (!addon) return false;
    if (addon.videoOnly && !includesVideo) return false;
    return true;
  });
}

export interface SubmitResult {
  inquiryId: string;
  priceBreakdown: PriceBreakdown;
}

export type SubmitPhase = 'uploading' | 'sending';

@Injectable()
export class ConfiguratorStoreService {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly pricingCalculator = inject(PricingCalculatorService);
  private readonly inquiryApi = inject(InquiryApiService);
  private readonly uploadApi = inject(UploadApiService);

  /** Bumped on every reactive-form change so validation computeds stay in sync. */
  private readonly formRevision = signal(0);

  readonly steps = CONFIGURATOR_STEPS;

  readonly currentStepIndex = signal(0);
  readonly mainProduct = signal<MainProductId | null>(null);
  readonly addons = signal<AddonId[]>([]);
  readonly productPricingByProduct = signal<Partial<Record<MainProductId, ProductPricingSnapshot>>>({});
  readonly uploadedFiles = signal<UploadedFileReference[]>([]);
  readonly inquiryFolderId = signal('');
  readonly inquiryReferenceId = signal('');

  readonly isSubmitting = signal(false);
  readonly submitPhase = signal<SubmitPhase | null>(null);
  readonly submitUploadProgress = signal<{ completed: number; total: number } | null>(null);
  readonly submitError = signal<string | null>(null);
  readonly submitResult = signal<SubmitResult | null>(null);

  readonly addonOptions = ADDON_OPTIONS;

  readonly songForm = this.fb.group({
    style: this.fb.control(''),
    customStyle: this.fb.control('', Validators.maxLength(FIELD_LIMITS.customStyle)),
    vocalist: this.fb.control<VocalistId | ''>(''),
    mood: this.fb.control('', Validators.maxLength(FIELD_LIMITS.mood)),
    length: this.fb.control<SongLengthId | ''>(DEFAULT_LENGTH_ID, Validators.required),
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
    format: this.fb.control<VideoFormatId>(DEFAULT_VIDEO_FORMAT),
    subtitles: this.fb.control<'none' | 'selected' | 'full'>('none'),
  });

  readonly projectDetailsForm = this.fb.group({
    personName: this.fb.control('', [Validators.required, Validators.maxLength(FIELD_LIMITS.personName)]),
    occasion: this.fb.control('', [Validators.required, Validators.maxLength(FIELD_LIMITS.occasion)]),
    eventDate: this.fb.control('', Validators.pattern(/^\d{4}-\d{2}-\d{2}$/)),
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
    const saved = loadConfiguratorState();
    if (saved) {
      this.applyPersistedFormState(saved);
      this.productPricingByProduct.set(saved.productPricingByProduct ?? {});
      const savedIncludesVideo =
        saved.mainProduct === 'video_existing_song' || saved.mainProduct === 'video_new_song';

      if (savedIncludesVideo) {
        if (saved.inquiryFolderId && !isLegacyInquiryFolderId(saved.inquiryFolderId)) {
          this.inquiryFolderId.set(saved.inquiryFolderId);
        } else if (saved.inquiryFolderId && isLegacyInquiryFolderId(saved.inquiryFolderId)) {
          this.inquiryFolderId.set('');
        }
        void this.restoreUploadedFilesFromStore(saved.uploadedFiles ?? []);
      } else {
        this.inquiryFolderId.set('');
        void this.clearPersistedUploadFiles(saved.uploadedFiles ?? []);
        this.persistState();
      }
    }
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
      if (!value.length) return false;
      const styles = parseSongStyles(value.style);
      if (styles.length === 0) return false;
      const vocalist = value.vocalist;
      if (vocalist !== 'male' && vocalist !== 'female' && vocalist !== 'both') return false;
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
    this.formRevision();
    this.uploadedFiles();
    if (!this.requiresUploadStep()) return true;
    const images = this.uploadedFiles().filter((file) => file.type === 'image');
    const videos = this.uploadedFiles().filter((file) => file.type === 'video');
    if (images.some((file) => file.status === 'error') || videos.some((file) => file.status === 'error')) return false;
    const imageCount = this.uploadImageCount();
    const videoCount = this.uploadVideoCount();
    return (
      imageCount >= this.minimumRequiredImages() &&
      imageCount <= this.maximumAllowedImages() &&
      videoCount <= this.maximumAllowedVideos()
    );
  });

  readonly selectedVideoLengthId = computed((): VideoLengthId => {
    this.formRevision();
    if (this.mainProduct() === 'video_new_song') {
      const length = this.songForm.controls.length.value;
      return isSongLengthId(length) ? length : DEFAULT_LENGTH_ID;
    }
    return this.videoForm.controls.length.value || DEFAULT_LENGTH_ID;
  });

  readonly minimumRequiredImages = computed(() =>
    getMinimumImageCountForVideoLength(this.selectedVideoLengthId()),
  );

  readonly maximumAllowedImages = computed(() =>
    getMaximumImageCountForVideoLength(this.selectedVideoLengthId()),
  );

  readonly maximumAllowedVideos = computed(() =>
    getMaximumVideoCountForVideoLength(this.selectedVideoLengthId()),
  );

  readonly uploadImageCount = computed(
    () => this.uploadedFiles().filter((file) => file.type === 'image').length,
  );

  readonly uploadVideoCount = computed(
    () => this.uploadedFiles().filter((file) => file.type === 'video').length,
  );

  readonly pendingImageCount = computed(
    () => this.uploadedFiles().filter((file) => file.type === 'image' && file.status === 'pending').length,
  );

  readonly remainingRequiredImages = computed(() =>
    Math.max(0, this.minimumRequiredImages() - this.uploadImageCount()),
  );

  readonly uploadProgressLabelHe = computed(() => {
    const count = this.uploadImageCount();
    const minimum = this.minimumRequiredImages();
    const remaining = this.remainingRequiredImages();
    return `יש להעלות עוד ${remaining} תמונות לפחות\n(מינימום ${minimum} לאורך הסרטון שבחרתם, הועלו ${count})`;
  });

  readonly uploadLimitExceededLabelHe = computed(() => {
    const count = this.uploadImageCount();
    const maximum = this.maximumAllowedImages();
    const excess = count - maximum;
    return `יש להסיר ${excess} תמונות\n(מקסימום ${maximum} לאורך הסרטון שבחרתם, הועלו ${count})`;
  });

  readonly uploadVideoLimitExceededLabelHe = computed(() => {
    const count = this.uploadVideoCount();
    const maximum = this.maximumAllowedVideos();
    const excess = Math.max(0, count - maximum);
    return `יש להסיר ${excess} סרטונים\n(מקסימום ${maximum} לאורך הסרטון שבחרתם, ועד 30 שניות לסרטון)`;
  });

  readonly submitStatusLabelHe = computed(() => {
    const phase = this.submitPhase();
    if (phase === 'uploading') {
      const progress = this.submitUploadProgress();
      if (progress && progress.total > 0) {
        return `מעלים את החומרים (${progress.completed} מתוך ${progress.total})...`;
      }
      return 'מעלים את החומרים...';
    }
    if (phase === 'sending') {
      return 'שולחים את הבקשה...';
    }
    return 'שולחים...';
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

  readonly isSubmissionValid = computed(() => {
    this.formRevision();
    this.uploadedFiles();
    return this.visibleSteps().every((step) => this.isStepValid(step.id));
  });

  readonly submissionValidationMessage = computed(() => {
    this.formRevision();
    this.uploadedFiles();
    const messages = this.visibleSteps()
      .filter((step) => !this.isStepValid(step.id))
      .map((step) => this.getStepValidationMessage(step.id));
    return messages.length ? messages.join('\n') : null;
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
    if (step.id === 'upload') {
      this.uploadedFiles();
      this.selectedVideoLengthId();
      return this.isUploadStepValid();
    }
    return this.isStepValid(step.id);
  });

  readonly currentStepValidationMessage = computed(() => {
    const step = this.currentStep();
    if (!step || this.isStepValid(step.id)) return null;
    return this.getStepValidationMessage(step.id);
  });

  getStepValidationMessage(id: ConfiguratorStepId): string {
    switch (id) {
      case 'product':
        return 'נא לבחור סוג פרויקט כדי להמשיך';
      case 'song':
        return this.getSongStepValidationMessage();
      case 'video':
        return 'נא להשלים את פרטי הסרטון כדי להמשיך';
      case 'details':
        return this.getDetailsStepValidationMessage();
      case 'extras':
        return this.getDetailsStepValidationMessage();
      case 'upload':
        return this.getUploadStepValidationMessage();
      case 'summary':
        return 'נא להשלים את השלב הנוכחי כדי להמשיך';
      case 'contact':
        return this.getContactStepValidationMessage();
      default:
        return 'נא להשלים את השלב הנוכחי כדי להמשיך';
    }
  }

  private getSongStepValidationMessage(): string {
    this.formRevision();
    const value = this.songValue();

    if (this.songForm.controls.additionalNotes.invalid) {
      return 'הערות השיר ארוכות מדי — קצרו את הטקסט כדי להמשיך';
    }

    if (this.requiresExistingSongRights()) {
      return 'נא להזין את שם השיר כדי להמשיך';
    }

    if (this.includesNewSong()) {
      if (!value.length) {
        return 'נא לבחור אורך משוער כדי להמשיך';
      }
      const styles = parseSongStyles(value.style);
      if (styles.length === 0) {
        return 'נא לבחור לפחות סגנון שיר אחד כדי להמשיך';
      }
      const vocalist = value.vocalist;
      if (vocalist !== 'male' && vocalist !== 'female' && vocalist !== 'both') {
        return 'נא לבחור זמר, זמרת או שילוב של שניהם';
      }
      if (styles.length === 1 && styles[0] === 'אחר' && value.customStyle.trim().length === 0) {
        return 'נא לפרט את הסגנון המוזיקלי כדי להמשיך';
      }
    }

    return 'נא להשלים את פרטי השיר כדי להמשיך';
  }

  private getDetailsStepValidationMessage(): string {
    this.formRevision();
    const missing: string[] = [];
    const form = this.projectDetailsForm;

    if (form.controls.personName.invalid) {
      missing.push('שם האדם/האנשים');
    }
    if (form.controls.occasion.invalid) {
      missing.push('סוג האירוע');
    }
    if (form.controls.story.hasError('required') || form.controls.story.hasError('minlength')) {
      missing.push('הסיפור (לפחות 10 תווים)');
    }

    if (missing.length === 1) {
      return `נא להשלים: ${missing[0]}`;
    }
    if (missing.length > 1) {
      return `נא להשלים: ${missing.join(', ')}`;
    }

    return 'נא להשלים את השדות החובה כדי להמשיך';
  }

  private getUploadStepValidationMessage(): string {
    const images = this.uploadedFiles().filter((file) => file.type === 'image');
    const videos = this.uploadedFiles().filter((file) => file.type === 'video');

    if (images.some((file) => file.status === 'error') || videos.some((file) => file.status === 'error')) {
      return 'יש קבצים שלא נשמרו במכשיר — הסירו אותם או העלו מחדש';
    }

    const count = this.uploadImageCount();
    const videoCount = this.uploadVideoCount();

    if (count > this.maximumAllowedImages()) {
      return this.uploadLimitExceededLabelHe();
    }

    if (videoCount > this.maximumAllowedVideos()) {
      return this.uploadVideoLimitExceededLabelHe();
    }

    if (count < this.minimumRequiredImages()) {
      return this.uploadProgressLabelHe();
    }

    return 'נא להעלות תמונות כדי להמשיך';
  }

  private getContactStepValidationMessage(): string {
    this.formRevision();
    const missing: string[] = [];
    const form = this.contactForm;

    if (form.controls.name.invalid) {
      missing.push('שם מלא');
    }
    if (form.controls.phone.invalid) {
      missing.push('טלפון');
    }
    if (form.controls.email.invalid) {
      missing.push('אימייל');
    }
    if (form.controls.mediaRightsConsent.invalid) {
      missing.push('אישור הרשאות לחומרים');
    }
    if (form.controls.contactPermissionConsent.invalid) {
      missing.push('אישור ליצירת קשר');
    }
    if (form.controls.termsConsent.invalid) {
      missing.push('אישור תקנון');
    }

    if (missing.length === 1) {
      return `נא להשלים: ${missing[0]}`;
    }
    if (missing.length > 1) {
      return `נא להשלים: ${missing.join(', ')}`;
    }

    return 'נא להשלים את פרטי הקשר כדי להמשיך';
  }

  selectMainProduct(id: MainProductId): void {
    const previous = this.mainProduct();
    if (previous === id) {
      this.persistState();
      return;
    }

    if (previous) {
      this.productPricingByProduct.update((map) => ({
        ...map,
        [previous]: this.capturePricingSnapshot(),
      }));
    }

    this.mainProduct.set(id);
    if (id === 'song_only') {
      this.clearStoredUploads();
    }
    if (id === 'video_existing_song' || id === 'video_new_song') {
      this.videoForm.controls.source.setValue(DEFAULT_VIDEO_SOURCE, { emitEvent: false });
    }

    const savedSnapshot = this.productPricingByProduct()[id];
    if (savedSnapshot) {
      this.applyPricingSnapshot(savedSnapshot, id);
    } else {
      this.applyPricingDefaults();
    }

    this.ensureSongLengthDefault();
    this.persistState();
  }

  beginWithPackage(id: MainProductId): void {
    this.selectMainProduct(id);
    this.navigateToStep(1);
  }

  isAddonSelected(id: AddonId): boolean {
    return this.addons().includes(id);
  }

  selectVocalist(id: VocalistId): void {
    this.songForm.controls.vocalist.setValue(id);
    this.songForm.controls.vocalist.markAsTouched();
  }

  private capturePricingSnapshot(): ProductPricingSnapshot {
    const songLength = resolveSongLength(this.songForm.controls.length.value, this.mainProduct());
    return {
      songLength,
      videoLength: this.videoForm.controls.length.value || DEFAULT_LENGTH_ID,
      videoFormat: this.videoForm.controls.format.value || DEFAULT_VIDEO_FORMAT,
      subtitles: this.videoForm.controls.subtitles.value || 'none',
      addons: [...this.addons()],
    };
  }

  private applyPricingDefaults(): void {
    this.songForm.controls.length.setValue(DEFAULT_LENGTH_ID, { emitEvent: false });
    this.videoForm.controls.length.setValue(DEFAULT_LENGTH_ID, { emitEvent: false });
    this.videoForm.controls.format.setValue(DEFAULT_VIDEO_FORMAT, { emitEvent: false });
    this.videoForm.controls.subtitles.setValue('none', { emitEvent: false });
    this.addons.set([]);
  }

  private applyPricingSnapshot(snapshot: ProductPricingSnapshot, product: MainProductId): void {
    this.songForm.controls.length.setValue(resolveSongLength(snapshot.songLength, product), { emitEvent: false });
    this.videoForm.controls.length.setValue(snapshot.videoLength || DEFAULT_LENGTH_ID, { emitEvent: false });
    this.videoForm.controls.format.setValue(normalizeVideoFormatId(snapshot.videoFormat), { emitEvent: false });
    const subtitles = snapshot.subtitles === 'selected' || snapshot.subtitles === 'full' ? snapshot.subtitles : 'none';
    this.videoForm.controls.subtitles.setValue(subtitles, { emitEvent: false });
    this.addons.set(filterAddonsForProduct(snapshot.addons ?? [], product));
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

  private getContactNameForUpload(): string {
    const name = this.contactForm.getRawValue().name.trim();
    if (!name) {
      throw new Error('נא למלא את שם איש הקשר לפני שליחת הבקשה.');
    }
    return name;
  }

  private resolveInquiryFolderIdForSubmit(): string | undefined {
    const folderIds = [
      ...new Set(
        this.uploadedFiles()
          .filter((file) => file.status === 'complete' && file.storageKey)
          .map((file) => extractInquiryFolderId(file.storageKey))
          .filter((folderId): folderId is string => Boolean(folderId)),
      ),
    ];

    if (folderIds.length > 1) {
      throw new Error('תמונות ההעלאה נמצאות במספר תיקיות שונות. נא לנסות שוב.');
    }

    if (folderIds.length === 1) {
      this.inquiryFolderId.set(folderIds[0]!);
      return folderIds[0];
    }

    return undefined;
  }

  private toUploadedFilePayload(
    file: UploadedFileReference,
  ): {
    id: string;
    type: UploadedFileReference['type'];
    name: string;
    storageKey: string;
    url?: string;
    durationSeconds?: number;
  } {
    const payload = {
      id: file.id,
      type: file.type,
      name: file.name,
      storageKey: file.storageKey,
      ...(file.durationSeconds ? { durationSeconds: file.durationSeconds } : {}),
    };

    if (file.url?.startsWith('http://') || file.url?.startsWith('https://')) {
      return { ...payload, url: file.url };
    }

    return payload;
  }

  private uploadFolderIdForRequest(): string | undefined {
    const current = this.inquiryFolderId();
    if (!current || isLegacyInquiryFolderId(current)) {
      return undefined;
    }
    return current;
  }

  toggleAddon(id: AddonId): void {
    this.addons.update((current) =>
      current.includes(id) ? current.filter((addonId) => addonId !== id) : [...current, id],
    );
    this.persistState();
  }

  addUploadedFile(file: UploadedFileReference): void {
    this.uploadedFiles.update((files) => [...files, file]);
    this.persistState();
  }

  updateUploadedFile(id: string, patch: Partial<UploadedFileReference>): void {
    this.uploadedFiles.update((files) => files.map((file) => (file.id === id ? { ...file, ...patch } : file)));
    this.persistState();
  }

  removeUploadedFile(id: string): void {
    this.uploadedFiles.update((files) => {
      const target = files.find((file) => file.id === id);
      if (target?.previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return files.filter((file) => file.id !== id);
    });
    void deleteUploadFile(id);
    this.persistState();
  }

  goNext(): void {
    if (!this.isCurrentStepValid()) {
      this.markCurrentStepTouched();
      return;
    }
    const total = this.visibleSteps().length;
    const nextIndex = Math.min(this.currentStepIndex() + 1, total - 1);
    this.navigateToStep(nextIndex);
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
        this.songForm.controls.vocalist.markAsTouched();
        this.songForm.controls.length.markAsTouched();
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
    const nextIndex = Math.max(this.currentStepIndex() - 1, 0);
    this.navigateToStep(nextIndex);
  }

  goToStep(index: number): void {
    if (index <= this.currentStepIndex()) {
      this.navigateToStep(index);
      return;
    }

    for (let i = this.currentStepIndex(); i < index; i++) {
      const step = this.visibleSteps()[i];
      if (!step || !this.isStepValid(step.id)) return;
    }
    this.navigateToStep(index);
  }

  private navigateToStep(index: number): void {
    this.currentStepIndex.set(index);
    this.clearStepErrors(this.visibleSteps()[index]?.id);
    this.persistState();
  }

  private clearStepErrors(stepId: ConfiguratorStepId | undefined): void {
    switch (stepId) {
      case 'song':
        this.songForm.markAsUntouched();
        break;
      case 'video':
        this.videoForm.markAsUntouched();
        break;
      case 'details':
      case 'extras':
        this.projectDetailsForm.markAsUntouched();
        break;
      case 'contact':
        this.contactForm.markAsUntouched();
        this.submitError.set(null);
        break;
      default:
        break;
    }
    this.formRevision.update((value) => value + 1);
  }

  private buildInquiryPayload(): InquiryPayload {
    const mainProduct = this.mainProduct();
    if (!mainProduct) throw new Error('Main product must be selected before submitting.');

    const song = this.songValue();
    const video = this.videoValue();
    const details = this.projectDetailsValue();
    const contact = this.contactValue();
    const inquiryFolderId = this.includesVideo() ? this.resolveInquiryFolderIdForSubmit() : undefined;

    const payload: InquiryPayload = {
      contact: {
        name: contact.name.trim(),
        phone: contact.phone.trim(),
        email: contact.email.trim(),
        message: undefinedIfEmpty(contact.message),
      },
      mainProduct,
      addons: this.addons(),
      projectDetails: {
        personName: details.personName.trim(),
        occasion: details.occasion.trim(),
        eventDate: undefinedIfEmpty(details.eventDate.trim()),
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
      uploadedFiles: this.includesVideo()
        ? this.uploadedFiles()
            .filter((file) => file.status === 'complete')
            .map((file) => this.toUploadedFilePayload(file))
        : [],
      ...(inquiryFolderId ? { inquiryFolderId } : {}),
      inquiryReferenceId: this.inquiryReferenceId(),
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
        vocalist: song.vocalist === 'male' || song.vocalist === 'female' || song.vocalist === 'both' ? song.vocalist : undefined,
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

    const requiresUploads = this.requiresUploadStep();
    const pendingUploadCountBeforePrepare = requiresUploads
      ? this.uploadedFiles().filter(
          (file) => (file.type === 'image' || file.type === 'video') && file.status === 'pending',
        ).length
      : 0;
    this.submitPhase.set(pendingUploadCountBeforePrepare > 0 ? 'uploading' : 'sending');
    this.submitUploadProgress.set(null);

    try {
      if (!requiresUploads) {
        this.clearStoredUploads();
      }

      const contactName = this.getContactNameForUpload();
      const inquiryReferenceId = this.inquiryReferenceId() || generateInquiryReferenceId();
      this.inquiryReferenceId.set(inquiryReferenceId);

      if (requiresUploads) {
        this.prepareUploadSessionForSubmit(contactName, inquiryReferenceId);

        const pendingUploadCount = this.uploadedFiles().filter(
          (file) => (file.type === 'image' || file.type === 'video') && file.status === 'pending',
        ).length;
        if (pendingUploadCount > 0) {
          this.submitPhase.set('uploading');
          await this.uploadPendingFiles(contactName, inquiryReferenceId);
        }
      }

      this.submitPhase.set('sending');
      this.submitUploadProgress.set(null);

      const payload = this.buildInquiryPayload();
      const response = await firstValueFrom(this.inquiryApi.submitInquiry(payload));
      this.submitResult.set({
        inquiryId: response.data.inquiryId,
        priceBreakdown: response.data.priceBreakdown,
      });
      this.revokeUploadedFilePreviewUrls();
      clearConfiguratorState();
    } catch (error) {
      this.submitError.set(toHebrewUserError(error, 'שליחת הבקשה נכשלה. נסו שוב.'));
    } finally {
      this.isSubmitting.set(false);
      this.submitPhase.set(null);
      this.submitUploadProgress.set(null);
    }
  }

  private prepareUploadSessionForSubmit(contactName: string, inquiryReferenceId: string): void {
    if (isLegacyInquiryFolderId(this.inquiryFolderId())) {
      this.inquiryFolderId.set('');
    }

    const completeFiles = this.uploadedFiles().filter(
      (file) => (file.type === 'image' || file.type === 'video') && file.status === 'complete' && file.storageKey,
    );
    const folderIds = [
      ...new Set(
        completeFiles
          .map((file) => extractInquiryFolderId(file.storageKey))
          .filter((folderId): folderId is string => Boolean(folderId)),
      ),
    ];

    const hasLegacyFolder = folderIds.some((folderId) => isLegacyInquiryFolderId(folderId));
    const hasMultipleFolders = folderIds.length > 1;
    const hasNameMismatch = folderIds.some(
      (folderId) => !inquiryFolderMatchesName(folderId, contactName),
    );

    const hasReferenceMismatch = folderIds.some(
      (folderId) => !inquiryFolderContainsReference(folderId, inquiryReferenceId),
    );

    if (!hasLegacyFolder && !hasMultipleFolders && !hasNameMismatch && !hasReferenceMismatch && folderIds.length === 1) {
      this.inquiryFolderId.set(folderIds[0]!);
      return;
    }

    if (completeFiles.length === 0) {
      this.inquiryFolderId.set('');
      return;
    }

    this.inquiryFolderId.set('');
    this.uploadedFiles.update((files) =>
      files.map((file) => {
        if ((file.type !== 'image' && file.type !== 'video') || file.status !== 'complete') {
          return file;
        }

        return {
          ...file,
          status: 'pending',
          storageKey: '',
          url: undefined,
        };
      }),
    );
  }

  private async uploadPendingFiles(contactName: string, inquiryReferenceId: string): Promise<void> {
    const pendingFiles = this.uploadedFiles().filter(
      (file) => (file.type === 'image' || file.type === 'video') && file.status === 'pending',
    );
    const total = pendingFiles.length;

    this.submitPhase.set('uploading');
    this.submitUploadProgress.set({ completed: 0, total });
    const imageCount = this.uploadImageCount();
    const videoCount = this.uploadVideoCount();

    if (this.requiresUploadStep() && imageCount > this.maximumAllowedImages()) {
      throw new Error(this.uploadLimitExceededLabelHe().replace('\n', ' '));
    }

    if (this.requiresUploadStep() && imageCount < this.minimumRequiredImages()) {
      throw new Error(this.uploadProgressLabelHe().replace('\n', ' '));
    }

    if (this.requiresUploadStep() && videoCount > this.maximumAllowedVideos()) {
      throw new Error(this.uploadVideoLimitExceededLabelHe().replace('\n', ' '));
    }

    const concurrency = 3;
    let nextIndex = 0;
    let completed = 0;
    let firstError: Error | null = null;

    const workers = Array.from({ length: Math.min(concurrency, pendingFiles.length) }, async () => {
      while (!firstError) {
        const index = nextIndex++;
        if (index >= pendingFiles.length) return;

        const reference = pendingFiles[index]!;
        try {
          await this.uploadOnePendingFile(reference, contactName, inquiryReferenceId);
          completed += 1;
          this.submitUploadProgress.set({ completed, total });
        } catch (error) {
          firstError =
            error instanceof Error ? error : new Error(toHebrewUserError(error, 'העלאת החומרים נכשלה. נסו שוב.'));
        }
      }
    });

    await Promise.all(workers);

    if (firstError) {
      throw firstError;
    }

    if (total > 0) {
      this.submitUploadProgress.set({ completed: total, total });
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      });
    }
  }

  private async uploadOnePendingFile(
    reference: UploadedFileReference,
    contactName: string,
    inquiryReferenceId: string,
  ): Promise<void> {
    const original = reference.file ?? (await getUploadFile(reference.id));
    if (!original) {
      this.updateUploadedFile(reference.id, {
        status: 'error',
        errorMessageHe: reference.type === 'video' ? 'הסרטון לא נמצא במכשיר. נא להעלות אותו שוב.' : 'התמונה לא נמצאה במכשיר. נא להעלות אותה שוב.',
      });
      throw new Error('חלק מהקבצים לא נמצאו במכשיר. נא לחזור לשלב החומרים ולהעלות שוב.');
    }

    this.updateUploadedFile(reference.id, { status: 'uploading', file: original });

    try {
      const fileToUpload = reference.type === 'image' ? await compressImageForUpload(original) : original;
      const result = await this.uploadApi.registerFile(
        fileToUpload,
        reference.type,
        contactName,
        inquiryReferenceId,
        this.uploadFolderIdForRequest(),
      );
      const folderId = extractInquiryFolderId(result.storageKey);
      if (folderId) {
        this.inquiryFolderId.set(folderId);
      }
      this.updateUploadedFile(reference.id, {
        status: 'complete',
        storageKey: result.storageKey,
        url: result.url,
        file: undefined,
        errorMessageHe: undefined,
      });
    } catch (error) {
      const message = toHebrewUserError(error, 'העלאת החומרים נכשלה. נסו שוב.');
      this.updateUploadedFile(reference.id, {
        status: 'pending',
        file: original,
        errorMessageHe: undefined,
      });
      throw new Error(message);
    }
  }

  reset(): void {
    this.currentStepIndex.set(0);
    this.mainProduct.set(null);
    this.addons.set([]);
    this.productPricingByProduct.set({});
    this.revokeUploadedFilePreviewUrls();
    this.uploadedFiles.set([]);
    this.inquiryFolderId.set('');
    this.inquiryReferenceId.set('');
    this.songForm.reset({
      style: '',
      customStyle: '',
      vocalist: '',
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
    this.videoForm.reset({ source: DEFAULT_VIDEO_SOURCE, length: DEFAULT_LENGTH_ID, format: DEFAULT_VIDEO_FORMAT, subtitles: 'none' });
    this.projectDetailsForm.reset({
      personName: '',
      occasion: '',
      eventDate: '',
      age: '',
      relationship: '',
      characterTraits: '',
      hobbies: '',
      occupation: '',
      peopleToMention: '',
      desiredAtmosphere: '',
      story: '',
      additionalNotes: '',
    });
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
    this.submitPhase.set(null);
    this.submitUploadProgress.set(null);
    clearConfiguratorState();
  }

  private persistState(): void {
    if (this.submitResult()) return;

    const state: PersistedConfiguratorState = {
      currentStepIndex: this.currentStepIndex(),
      mainProduct: this.mainProduct(),
      addons: this.addons(),
      productPricingByProduct: this.productPricingByProduct(),
      inquiryFolderId: this.includesVideo() ? this.inquiryFolderId() : '',
      songForm: this.songForm.getRawValue() as Record<string, string>,
      videoForm: this.videoForm.getRawValue(),
      projectDetailsForm: this.projectDetailsForm.getRawValue(),
      contactForm: this.contactForm.getRawValue(),
      uploadedFiles: this.includesVideo()
        ? this.uploadedFiles().map((file) => ({
            id: file.id,
            type: file.type,
            name: file.name,
            storageKey: file.storageKey,
            url: file.url,
            status: file.status,
            sizeBytes: file.sizeBytes,
            errorMessageHe: file.errorMessageHe,
            thumbnailDataUrl: file.thumbnailDataUrl,
            durationSeconds: file.durationSeconds,
          }))
        : [],
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

  private applyPersistedFormState(saved: PersistedConfiguratorState): void {
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
    savedVideoForm.format = normalizeVideoFormatId(savedVideoForm.format);
    this.videoForm.patchValue(savedVideoForm as typeof this.videoForm.value, { emitEvent: false });
    this.projectDetailsForm.patchValue(saved.projectDetailsForm ?? {}, { emitEvent: false });
    this.contactForm.patchValue(saved.contactForm ?? {}, { emitEvent: false });
    this.formRevision.update((value) => value + 1);
  }

  private async restoreUploadedFilesFromStore(
    savedFiles: PersistedConfiguratorState['uploadedFiles'],
  ): Promise<void> {
    const restored: UploadedFileReference[] = [];

    for (const meta of savedFiles) {
      if (meta.type !== 'image' && meta.type !== 'video') continue;

      const file = await getUploadFile(meta.id);
      if (!file) continue;

      restored.push({
        id: meta.id,
        type: meta.type,
        name: meta.name,
        sizeBytes: meta.sizeBytes,
        storageKey: '',
        status: 'pending',
        file,
        previewUrl: URL.createObjectURL(file),
        thumbnailDataUrl: meta.thumbnailDataUrl,
        durationSeconds: meta.durationSeconds,
      });
    }

    this.uploadedFiles.set(restored);
    this.persistState();
  }

  private async clearPersistedUploadFiles(
    savedFiles: PersistedConfiguratorState['uploadedFiles'],
  ): Promise<void> {
    await Promise.all(savedFiles.map((file) => deleteUploadFile(file.id)));
  }

  private clearStoredUploads(): void {
    this.revokeUploadedFilePreviewUrls();
    const files = this.uploadedFiles();
    this.uploadedFiles.set([]);
    this.inquiryFolderId.set('');
    void Promise.all(files.map((file) => deleteUploadFile(file.id)));
    this.persistState();
  }

  private revokeUploadedFilePreviewUrls(): void {
    this.uploadedFiles().forEach((file) => {
      if (file.previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(file.previewUrl);
      }
    });
  }

  generateFileId(): string {
    return generateClientId('file');
  }
}
