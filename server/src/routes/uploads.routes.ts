import { Router } from 'express';
import { completeUpload, initiateUpload } from '../controllers/uploads.controller';
import { uploadsRateLimiter } from '../middleware/rate-limit';
import { validateBody } from '../middleware/validate';
import { completeUploadSchema, initiateUploadSchema } from '../schemas/upload.schema';
import { asyncHandler } from '../utils/async-handler';

export const uploadsRouter = Router();

uploadsRouter.post(
  '/uploads/initiate',
  uploadsRateLimiter,
  validateBody(initiateUploadSchema),
  asyncHandler(initiateUpload),
);

uploadsRouter.post(
  '/uploads/complete',
  uploadsRateLimiter,
  validateBody(completeUploadSchema),
  asyncHandler(completeUpload),
);
