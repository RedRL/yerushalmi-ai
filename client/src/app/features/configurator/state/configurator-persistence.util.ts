import type { AddonId, MainProductId, SongLengthId } from '../../../shared/models/pricing.model';
import type { UploadedFileReference } from '../../../shared/models/upload.model';

const STORAGE_KEY = 'yerushalmi.configurator.v1';

export interface PersistedConfiguratorState {
  currentStepIndex: number;
  mainProduct: MainProductId | null;
  addons: AddonId[];
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
}
