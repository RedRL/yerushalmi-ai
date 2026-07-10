import { z } from 'zod';
import { uploadedFileTypeSchema } from './inquiry.schema';

export const MAX_UPLOAD_SIZE_BYTES = 200 * 1024 * 1024; // 200MB, TODO(storage): revisit once a real provider is wired up

export const initiateUploadSchema = z.object({
  fileName: z.string().min(1).max(255),
  fileType: uploadedFileTypeSchema,
  mimeType: z.string().min(1).max(150),
  sizeBytes: z
    .number()
    .int()
    .positive()
    .max(MAX_UPLOAD_SIZE_BYTES, 'הקובץ חורג מהגודל המקסימלי המותר'),
});

export const completeUploadSchema = z.object({
  storageKey: z.string().min(1),
});

export type InitiateUploadInput = z.infer<typeof initiateUploadSchema>;
export type CompleteUploadInput = z.infer<typeof completeUploadSchema>;
