import { Resend } from 'resend';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import type { InquiryInput } from '../schemas/inquiry.schema';
import type { PriceBreakdown } from '../pricing/pricing.types';
import { buildInquiryEmailHtml } from './email-template';

export interface SendInquiryEmailResult {
  delivered: boolean;
  provider: 'resend' | 'dev-log';
}

/**
 * Sends the inquiry notification email to the business owner via Resend.
 *
 * If Resend is not configured (no API key / contact email / from address),
 * this never throws - it logs the inquiry and the generated email content
 * instead, so local development works without any external credentials.
 */
export async function sendInquiryEmail(
  payload: InquiryInput,
  breakdown: PriceBreakdown,
  submittedAt: Date,
): Promise<SendInquiryEmailResult> {
  const html = buildInquiryEmailHtml(payload, breakdown, submittedAt);
  const subject = `בקשה חדשה מ-${payload.contact.name} | YERUSHALMI.AI`;

  if (!env.isEmailConfigured) {
    logger.warn('Email is not configured (RESEND_API_KEY / CONTACT_EMAIL / EMAIL_FROM missing). Logging instead.', {
      subject,
      contact: payload.contact,
      mainProduct: payload.mainProduct,
      total: breakdown.total,
    });
    logger.info('Generated inquiry email HTML', { html });
    return { delivered: false, provider: 'dev-log' };
  }

  try {
    const resend = new Resend(env.resendApiKey);
    await resend.emails.send({
      from: env.emailFrom,
      to: env.contactEmail,
      subject,
      html,
    });
    logger.info('Inquiry email sent via Resend', { to: env.contactEmail });
    return { delivered: true, provider: 'resend' };
  } catch (error) {
    logger.error('Failed to send inquiry email via Resend - logging content as fallback', {
      error: error instanceof Error ? error.message : String(error),
    });
    logger.info('Generated inquiry email HTML', { html });
    return { delivered: false, provider: 'dev-log' };
  }
}
