export type UploadedFileKind = 'image' | 'video' | 'audio';

export interface InitiateUploadInput {
  fileName: string;
  fileType: UploadedFileKind;
  mimeType: string;
  sizeBytes: number;
  contactName?: string;
  inquiryFolderId?: string;
  inquiryReferenceId?: string;
}

export interface CreateInquiryPhotoBundleInput {
  folderId: string;
  storageKeys: string[];
}

/**
 * Result of initiating an upload. Real providers (R2/S3/Cloudinary) would
 * return a signed URL the browser can PUT/POST directly to, so file bytes
 * never pass through the Express server or get stored on its filesystem.
 */
export interface InitiateUploadResult {
  storageKey: string;
  uploadUrl: string;
  method: 'PUT' | 'POST';
  /** Additional form fields required by some providers (e.g. S3 POST policies). */
  fields?: Record<string, string>;
  expiresAt: string;
}

export interface CompleteUploadResult {
  storageKey: string;
  url: string;
}

/**
 * Storage abstraction so the rest of the app never depends on a specific
 * provider. Swap the implementation returned by `storage.factory.ts` once a
 * provider (Cloudflare R2, Amazon S3 or Cloudinary) is selected.
 */
export interface StorageService {
  readonly providerName: string;
  initiateUpload(input: InitiateUploadInput): Promise<InitiateUploadResult>;
  completeUpload(storageKey: string): Promise<CompleteUploadResult>;
  getPublicUrl(storageKey: string): string;
  createInquiryPhotoBundle?(input: CreateInquiryPhotoBundleInput): Promise<CompleteUploadResult>;
}
