import { Router } from 'express';
import { createContactMessage } from '../controllers/contact.controller';
import { contactRateLimiter } from '../middleware/rate-limit';
import { validateBody } from '../middleware/validate';
import { contactMessageSchema } from '../schemas/contact.schema';
import { asyncHandler } from '../utils/async-handler';

export const contactRouter = Router();

contactRouter.post(
  '/contact-messages',
  contactRateLimiter,
  validateBody(contactMessageSchema),
  asyncHandler(createContactMessage),
);
