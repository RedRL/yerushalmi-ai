import { z } from 'zod';
import { isValidInquiryFolderId } from '../storage/storage-key.util';

export const inquiryFolderIdSchema = z
  .string()
  .min(3, 'מזהה תיקיית העלאה לא תקין')
  .max(100, 'מזהה תיקיית העלאה לא תקין')
  .refine(isValidInquiryFolderId, 'מזהה תיקיית העלאה לא תקין');
