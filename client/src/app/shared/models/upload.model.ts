export type UploadedFileKind = 'image' | 'video' | 'audio';

export type UploadStatus = 'pending' | 'uploading' | 'complete' | 'error';

export interface UploadedFileReference {
  id: string;
  type: UploadedFileKind;
  name: string;
  sizeBytes: number;
  storageKey: string;
  url?: string;
  status: UploadStatus;
  /** Local preview URL (object URL) - must be revoked with URL.revokeObjectURL on cleanup. */
  previewUrl?: string;
  /** Small persisted thumbnail (data URL) for gallery tiles after refresh. */
  thumbnailDataUrl?: string;
  /** In-memory file handle for the current session (not persisted). */
  file?: File;
  errorMessageHe?: string;
}
