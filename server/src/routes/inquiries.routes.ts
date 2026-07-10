import { Router } from 'express';
import { createInquiry } from '../controllers/inquiries.controller';
import { inquiriesRateLimiter } from '../middleware/rate-limit';
import { validateBody } from '../middleware/validate';
import { inquirySchema } from '../schemas/inquiry.schema';
import { asyncHandler } from '../utils/async-handler';

export const inquiriesRouter = Router();

inquiriesRouter.post(
  '/inquiries',
  inquiriesRateLimiter,
  validateBody(inquirySchema),
  asyncHandler(createInquiry),
);
