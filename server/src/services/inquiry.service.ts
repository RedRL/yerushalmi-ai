import { randomUUID } from 'node:crypto';
import { calculatePriceBreakdown } from '../pricing/pricing.service';
import type { PriceBreakdown, PricingSelection } from '../pricing/pricing.types';
import type { InquiryInput } from '../schemas/inquiry.schema';
import { logger } from '../utils/logger';
import { sendInquiryEmail } from './email.service';

export interface InquiryResult {
  inquiryId: string;
  submittedAt: string;
  priceBreakdown: PriceBreakdown;
  emailDelivered: boolean;
}

function toPricingSelection(payload: InquiryInput): PricingSelection {
  return {
    mainProduct: payload.mainProduct,
    videoSource: payload.video?.source,
    videoLength: payload.video?.length,
    videoFormat: payload.video?.format,
    subtitles: payload.video?.subtitles,
    addons: payload.addons ?? [],
  };
}

/**
 * Orchestrates a validated inquiry: recalculates the trusted price server-side
 * (ignoring any client-provided total), sends the notification email, and
 * returns a response the frontend can use to show a confirmation.
 */
export async function processInquiry(payload: InquiryInput): Promise<InquiryResult> {
  const inquiryId = randomUUID();
  const submittedAt = new Date();

  // The client may have sent `clientPricePreview` for its own UX purposes -
  // it is intentionally never read here. Only option identifiers are trusted.
  const priceBreakdown = calculatePriceBreakdown(toPricingSelection(payload));

  logger.info('New inquiry received', {
    inquiryId,
    mainProduct: payload.mainProduct,
    total: priceBreakdown.total,
    uploadedFileCount: payload.uploadedFiles.length,
  });

  const emailResult = await sendInquiryEmail(payload, priceBreakdown, submittedAt);

  return {
    inquiryId,
    submittedAt: submittedAt.toISOString(),
    priceBreakdown,
    emailDelivered: emailResult.delivered,
  };
}
