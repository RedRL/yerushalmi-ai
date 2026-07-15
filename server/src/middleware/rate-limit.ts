import rateLimit from 'express-rate-limit';

/** Applied to POST /api/inquiries - a real customer will not submit dozens per minute. */
export const inquiriesRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { message: 'יותר מדי בקשות. נסו שוב בעוד כמה דקות.' } },
});

/** Applied to POST /api/contact-messages. */
export const contactRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { message: 'יותר מדי הודעות. נסו שוב בעוד כמה דקות.' } },
});

/** Applied to upload endpoints - initiating many uploads quickly is expected, but bounded. */
export const uploadsRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { message: 'יותר מדי בקשות העלאה. נסו שוב בעוד כמה דקות.' } },
});
