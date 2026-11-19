import type { AddonId, MainProductId, SongLengthId, SubtitlesId, VideoFormatId, VideoLengthId } from '../../../shared/models/pricing.model';
import type { UploadedFileReference } from '../../../shared/models/upload.model';
import { clearUploadFileStore } from '../../../shared/utils/upload-file-store.util';
import type { ExperienceMode } from '../experience/experience-mode';

const STORAGE_KEY_CLIPS = 'yerushalmi.configurator.v2';
const STORAGE_KEY_WEDDINGS = 'yerushalmi.configurator.weddings.v2';

function storageKeyFor(mode: ExperienceMode): string {
  return mode === 'weddings' ? STORAGE_KEY_WEDDINGS : STORAGE_KEY_CLIPS;
}

export interface ProductPricingSnapshot {
  songLength: SongLengthId;
  videoLength: VideoLengthId;
  videoFormat: VideoFormatId;
  subtitles: SubtitlesId;
  subtitlesKaraoke: boolean;
  subtitlesColor: string;
  subtitlesHighlightColor: string;
  revisionNotes: string;
  addons: AddonId[];
}

export interface PersistedConfiguratorState {
  currentStepIndex: number;
  subStepIndex?: number;
  mainProduct: MainProductId | null;
  addons: AddonId[];
  inquiryFolderId?: string;
  inquiryReferenceId?: string;
  productPricingByProduct?: Partial<Record<MainProductId, ProductPricingSnapshot>>;
  songForm: Record<string, string>;
  videoForm: {
    source: string;
    length: string;
    format: string;
    subtitles: string;
    subtitlesKaraoke?: boolean;
    subtitlesColor?: string;
    subtitlesHighlightColor?: string;
    revisionNotes?: string;
  };
  projectDetailsForm: Record<string, string>;
  weddingForm?: Record<string, string | boolean>;
  contactForm: Record<string, string | boolean>;
  appliedCouponCode?: string | null;
  uploadedFiles: Omit<UploadedFileReference, 'previewUrl' | 'file' | 'thumbnailDataUrl' | 'lightboxPreviewUrl'>[];
}

export function loadConfiguratorState(mode: ExperienceMode = 'clips'): PersistedConfiguratorState | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(storageKeyFor(mode));
    if (!raw) return null;
    return JSON.parse(raw) as PersistedConfiguratorState;
  } catch {
    return null;
  }
}

export function saveConfiguratorState(
  state: PersistedConfiguratorState,
  mode: ExperienceMode = 'clips',
): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(storageKeyFor(mode), JSON.stringify(state));
  } catch {
    // Ignore quota / private mode errors.
  }
}

export function clearConfiguratorState(mode: ExperienceMode = 'clips'): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(storageKeyFor(mode));
  void clearUploadFileStore();
}
