import { z } from 'zod';
import { uploadedFileTypeSchema } from './inquiry.schema';

const IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']);
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif'];

function isImageUpload(fileName: string, mimeType: string): boolean {
  const extension = fileName.includes('.') ? fileName.slice(fileName.lastIndexOf('.')).toLowerCase() : '';
  const mime = mimeType.toLowerCase();

  if (IMAGE_MIME_TYPES.has(mime)) {
    return true;
  }

  return IMAGE_EXTENSIONS.includes(extension);
}

export const MAX_UPLOAD_SIZE_BYTES = 200 * 1024 * 1024; // 200MB, TODO(storage): revisit once a real provider is wired up

export const initiateUploadSchema = z
  .object({
    fileName: z.string().min(1).max(255),
    fileType: uploadedFileTypeSchema,
    mimeType: z.string().min(1).max(150),
    sizeBytes: z
      .number()
      .int()
      .positive()
      .max(MAX_UPLOAD_SIZE_BYTES, 'הקובץ חורג מהגודל המקסימלי המותר'),
  })
  .superRefine((data, ctx) => {
    if (data.fileType === 'image' && !isImageUpload(data.fileName, data.mimeType)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'ניתן להעלות קבצי תמונה בלבד (JPEG, PNG, WEBP או HEIC)',
        path: ['mimeType'],
      });
    }
  });

export const completeUploadSchema = z.object({
  storageKey: z.string().min(1),
});

export type InitiateUploadInput = z.infer<typeof initiateUploadSchema>;
export type CompleteUploadInput = z.infer<typeof completeUploadSchema>;
