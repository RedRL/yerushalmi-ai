import type { AddonId, MainProductId, SongLengthId, SubtitlesId, VideoFormatId, VideoLengthId } from '../../../shared/models/pricing.model';
import type { UploadedFileReference } from '../../../shared/models/upload.model';
import { clearUploadFileStore } from '../../../shared/utils/upload-file-store.util';

const STORAGE_KEY = 'yerushalmi.configurator.v2';

export interface ProductPricingSnapshot {
  songLength: SongLengthId;
  videoLength: VideoLengthId;
  videoFormat: VideoFormatId;
  subtitles: SubtitlesId;
  addons: AddonId[];
}

export interface PersistedConfiguratorState {
  currentStepIndex: number;
  mainProduct: MainProductId | null;
  addons: AddonId[];
  inquiryFolderId?: string;
  productPricingByProduct?: Partial<Record<MainProductId, ProductPricingSnapshot>>;
  songForm: Record<string, string>;
  videoForm: {
    source: string;
    length: string;
    format: string;
    subtitles: string;
  };
  projectDetailsForm: Record<string, string>;
  contactForm: Record<string, string | boolean>;
  uploadedFiles: Omit<UploadedFileReference, 'previewUrl' | 'file'>[];
}

export function loadConfiguratorState(): PersistedConfiguratorState | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedConfiguratorState;
  } catch {
    return null;
  }
}

export function saveConfiguratorState(state: PersistedConfiguratorState): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore quota / private mode errors.
  }
}

export function clearConfiguratorState(): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
  void clearUploadFileStore();
}
