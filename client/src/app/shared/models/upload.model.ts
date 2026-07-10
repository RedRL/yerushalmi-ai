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
  errorMessageHe?: string;
}
