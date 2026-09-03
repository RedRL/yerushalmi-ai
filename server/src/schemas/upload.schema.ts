import { z } from 'zod';
import { isLegacyInquiryFolderId, isValidInquiryFolderId } from '../storage/storage-key.util';
import { uploadedFileTypeSchema } from './inquiry.schema';
import { inquiryFolderIdSchema } from './inquiry-folder.schema';
import { inquiryReferenceIdSchema } from './inquiry-reference.schema';

const IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']);
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif'];
const VIDEO_MIME_TYPES = new Set(['video/mp4', 'video/quicktime', 'video/webm', 'video/3gpp']);
const VIDEO_EXTENSIONS = ['.mp4', '.m4v', '.mov', '.webm', '.3gp'];

function isVideoUpload(fileName: string, mimeType: string): boolean {
  const extension = fileName.includes('.') ? fileName.slice(fileName.lastIndexOf('.')).toLowerCase() : '';
  const mime = mimeType.toLowerCase();

  if (VIDEO_MIME_TYPES.has(mime) || mime.startsWith('video/')) {
    return true;
  }

  return VIDEO_EXTENSIONS.includes(extension);
}

function isImageUpload(fileName: string, mimeType: string): boolean {
  const extension = fileName.includes('.') ? fileName.slice(fileName.lastIndexOf('.')).toLowerCase() : '';
  const mime = mimeType.toLowerCase();

  if (IMAGE_MIME_TYPES.has(mime)) {
    return true;
  }

  return IMAGE_EXTENSIONS.includes(extension);
}

/** Older clients sent the contact name in `inquiryFolderId` before upload supported `contactName`. */
export function normalizeInitiateUploadInput(value: unknown): unknown {
  if (typeof value !== 'object' || value === null) {
    return value;
  }

  const input = { ...(value as Record<string, unknown>) };
  const contactName = typeof input.contactName === 'string' ? input.contactName.trim() : '';
  let inquiryFolderId =
    typeof input.inquiryFolderId === 'string' ? input.inquiryFolderId.trim() : undefined;

  if (inquiryFolderId && isLegacyInquiryFolderId(inquiryFolderId)) {
    delete input.inquiryFolderId;
    inquiryFolderId = undefined;
  }

  if (!contactName && inquiryFolderId && !isValidInquiryFolderId(inquiryFolderId)) {
    input.contactName = inquiryFolderId;
    delete input.inquiryFolderId;
  }

  return input;
}

export const MAX_UPLOAD_SIZE_BYTES = 200 * 1024 * 1024; // 200MB, TODO(storage): revisit once a real provider is wired up

export const initiateUploadSchema = z.preprocess(
  normalizeInitiateUploadInput,
  z
    .object({
      fileName: z.string().min(1).max(255),
      fileType: uploadedFileTypeSchema,
      mimeType: z.string().min(1).max(150),
      contactName: z
        .string({
          required_error: 'נא למלא את שם איש הקשר בשלב פרטי קשר',
        })
        .trim()
        .min(2, 'נא להזין שם מלא')
        .max(120)
        .optional(),
      inquiryFolderId: inquiryFolderIdSchema.optional(),
      inquiryReferenceId: inquiryReferenceIdSchema.optional(),
      sizeBytes: z
        .number()
        .int()
        .positive()
        .max(MAX_UPLOAD_SIZE_BYTES, 'הקובץ חורג מהגודל המקסימלי המותר'),
    })
    .superRefine((data, ctx) => {
      const hasContactName = Boolean(data.contactName && data.contactName.length >= 2);
      const hasNamedFolderId = Boolean(
        data.inquiryFolderId &&
          !isLegacyInquiryFolderId(data.inquiryFolderId) &&
          isValidInquiryFolderId(data.inquiryFolderId),
      );

      if (!hasContactName && !hasNamedFolderId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'נא למלא את שם איש הקשר בשלב פרטי קשר. אם השגיאה חוזרת, רעננו את הדף (Ctrl+Shift+R).',
          path: ['contactName'],
        });
      }

      if (!hasNamedFolderId && !data.inquiryReferenceId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'חסר מזהה פנייה. נא לרענן את הדף ולשלוח שוב.',
          path: ['inquiryReferenceId'],
        });
      }

      if (data.fileType === 'image' && !isImageUpload(data.fileName, data.mimeType)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'ניתן להעלות קבצי תמונה בלבד (JPEG, PNG, WEBP או HEIC)',
          path: ['mimeType'],
        });
      }

      if (data.fileType === 'video' && !isVideoUpload(data.fileName, data.mimeType)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'ניתן להעלות סרטונים בפורמט MP4, MOV או WEBM',
          path: ['mimeType'],
        });
      }
    }),
);

export const completeUploadSchema = z.object({
  storageKey: z.string().min(1),
});

export type InitiateUploadInput = z.infer<typeof initiateUploadSchema>;
export type CompleteUploadInput = z.infer<typeof completeUploadSchema>;
