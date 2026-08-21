import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

const skipInDevelopment = (): boolean => env.nodeEnv === 'development';

/** Applied to POST /api/inquiries - a real customer will not submit dozens per minute. */
export const inquiriesRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInDevelopment,
  message: { success: false, error: { message: 'יותר מדי בקשות. נסו שוב בעוד כמה דקות.' } },
});

/** Applied to POST /api/contact-messages. */
export const contactRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInDevelopment,
  message: { success: false, error: { message: 'יותר מדי הודעות. נסו שוב בעוד כמה דקות.' } },
});

/** Applied to upload endpoints - a full inquiry submit may initiate one request per photo. */
export const uploadsRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInDevelopment,
  message: { success: false, error: { message: 'יותר מדי בקשות העלאה. נסו שוב בעוד כמה דקות.' } },
});
