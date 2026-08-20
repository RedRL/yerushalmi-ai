import { Resend } from 'resend';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import type { InquiryInput } from '../schemas/inquiry.schema';
import type { PriceBreakdown } from '../pricing/pricing.types';
import { buildInquiryEmailHtml } from './email-template';
import { buildInquiryConfirmationEmail } from './inquiry-confirmation-email-template';
import { buildContactEmailHtml } from './contact-email-template';
import type { ContactMessageInput } from '../schemas/contact.schema';
import { parseEmailFromHeader } from '../utils/email-from.util';

export interface SendInquiryEmailResult {
  delivered: boolean;
  provider: 'resend' | 'dev-log';
}

export interface SendContactEmailResult {
  delivered: boolean;
  provider: 'resend' | 'dev-log';
}

const DEFAULT_CONTACT_RECIPIENT = 'harel.red@gmail.com';

function resolveContactRecipient(): string {
  return env.contactEmail.trim() || DEFAULT_CONTACT_RECIPIENT;
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
    const customerReplyTo = payload.contact.email?.trim();
    await resend.emails.send({
      from: env.emailFrom,
      to: env.contactEmail,
      ...(customerReplyTo ? { replyTo: customerReplyTo } : {}),
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

/**
 * Sends an automatic confirmation email to the customer who submitted an inquiry.
 */
export async function sendInquiryConfirmationEmail(
  customerEmail: string,
  customerName: string,
  inquiryId: string,
): Promise<SendInquiryEmailResult> {
  const replyTo = parseEmailFromHeader(env.emailFrom);
  const { subject, html, text } = buildInquiryConfirmationEmail({
    customerName,
    inquiryId,
  });

  if (!env.isEmailConfigured) {
    logger.warn('Email is not configured — skipping customer confirmation.', {
      subject,
      customerEmail,
      inquiryId,
    });
    logger.info('Generated inquiry confirmation email', { text });
    return { delivered: false, provider: 'dev-log' };
  }

  try {
    const resend = new Resend(env.resendApiKey);
    await resend.emails.send({
      from: env.emailFrom,
      to: customerEmail,
      replyTo,
      subject,
      html,
      text,
      headers: {
        'Auto-Submitted': 'auto-generated',
      },
    });
    logger.info('Inquiry confirmation email sent via Resend', { to: customerEmail, inquiryId });
    return { delivered: true, provider: 'resend' };
  } catch (error) {
    logger.error('Failed to send inquiry confirmation email via Resend', {
      error: error instanceof Error ? error.message : String(error),
      customerEmail,
      inquiryId,
    });
    logger.info('Generated inquiry confirmation email', { text });
    return { delivered: false, provider: 'dev-log' };
  }
}

/**
 * Sends a simple contact-form message to the business owner.
 * Falls back to structured logging when Resend is not configured.
 */
export async function sendContactMessageEmail(
  payload: ContactMessageInput,
  submittedAt: Date,
): Promise<SendContactEmailResult> {
  const html = buildContactEmailHtml(payload, submittedAt);
  const subject = `הודעה חדשה מ-${payload.name} | YERUSHALMI.AI`;
  const recipient = resolveContactRecipient();

  if (!env.isEmailConfigured) {
    logger.warn('Email is not configured. Logging simple contact message instead.', {
      subject,
      recipient,
      contact: payload,
    });
    logger.info('Generated contact email HTML', { html });
    return { delivered: false, provider: 'dev-log' };
  }

  try {
    const resend = new Resend(env.resendApiKey);
    await resend.emails.send({
      from: env.emailFrom,
      to: recipient,
      subject,
      html,
      replyTo: payload.email,
    });
    logger.info('Contact message email sent via Resend', { to: recipient });
    return { delivered: true, provider: 'resend' };
  } catch (error) {
    logger.error('Failed to send contact message via Resend - logging content as fallback', {
      error: error instanceof Error ? error.message : String(error),
    });
    logger.info('Generated contact email HTML', { html });
    return { delivered: false, provider: 'dev-log' };
  }
}
