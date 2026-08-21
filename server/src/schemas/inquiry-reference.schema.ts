import { z } from 'zod';
import { isInquiryReferenceNumber } from '../utils/inquiry-reference.util';

export const inquiryReferenceIdSchema = z
  .string()
  .trim()
  .refine(isInquiryReferenceNumber, 'מזהה פנייה לא תקין');
