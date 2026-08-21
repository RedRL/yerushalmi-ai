import { calculatePriceBreakdown } from '../pricing/pricing.service';
import type { PriceBreakdown, PricingSelection, SongLengthId } from '../pricing/pricing.types';
import type { InquiryInput } from '../schemas/inquiry.schema';
import { getStorageService } from '../storage/storage.factory';
import { extractInquiryFolderId } from '../storage/storage-key.util';
import { generateInquiryReferenceId, isInquiryReferenceNumber } from '../utils/inquiry-reference.util';
import { logger } from '../utils/logger';
import { sendInquiryConfirmationEmail, sendInquiryEmail } from './email.service';

export interface InquiryResult {
  inquiryId: string;
  submittedAt: string;
  priceBreakdown: PriceBreakdown;
  emailDelivered: boolean;
  customerEmailDelivered: boolean;
  photosBundleUrl?: string;
}

function isSongLengthId(value?: string): value is SongLengthId {
  return (
    value === 'min_2_0' ||
    value === 'min_2_5' ||
    value === 'min_3_0' ||
    value === 'min_3_5' ||
    value === 'min_4_0' ||
    value === 'min_4_5'
  );
}

function toPricingSelection(payload: InquiryInput): PricingSelection {
  return {
    mainProduct: payload.mainProduct,
    videoSource: payload.video?.source,
    videoLength: payload.video?.length,
    songLength: isSongLengthId(payload.song?.length) ? payload.song.length : undefined,
    videoFormat: payload.video?.format,
    subtitles: payload.video?.subtitles,
    addons: payload.addons ?? [],
  };
}

function resolveInquiryFolderId(payload: InquiryInput): string | undefined {
  if (payload.inquiryFolderId) return payload.inquiryFolderId;

  const fromStorageKey = payload.uploadedFiles[0]
    ? extractInquiryFolderId(payload.uploadedFiles[0].storageKey)
    : null;

  return fromStorageKey ?? undefined;
}

function resolveInquiryReferenceId(payload: InquiryInput): string {
  if (payload.inquiryReferenceId && isInquiryReferenceNumber(payload.inquiryReferenceId)) {
    return payload.inquiryReferenceId;
  }

  return generateInquiryReferenceId();
}

async function createPhotosBundle(payload: InquiryInput, folderId: string): Promise<string | undefined> {
  const storage = getStorageService();
  if (!storage.createInquiryPhotoBundle || payload.uploadedFiles.length === 0) {
    return undefined;
  }

  try {
    const bundle = await storage.createInquiryPhotoBundle({
      folderId,
      storageKeys: payload.uploadedFiles.map((file) => file.storageKey),
    });
    return bundle.url;
  } catch (error) {
    logger.error('Failed to create inquiry photo bundle', {
      folderId,
      error: error instanceof Error ? error.message : String(error),
    });
    return undefined;
  }
}

/**
 * Orchestrates a validated inquiry: recalculates the trusted price server-side
 * (ignoring any client-provided total), sends the notification email, and
 * returns a response the frontend can use to show a confirmation.
 */
export async function processInquiry(payload: InquiryInput): Promise<InquiryResult> {
  const inquiryFolderId = resolveInquiryFolderId(payload);
  const inquiryId = resolveInquiryReferenceId(payload);
  const submittedAt = new Date();

  const priceBreakdown = calculatePriceBreakdown(toPricingSelection(payload));

  const photosBundleUrl =
    inquiryFolderId && payload.uploadedFiles.length > 0
      ? await createPhotosBundle(payload, inquiryFolderId)
      : undefined;

  logger.info('New inquiry received', {
    inquiryId,
    inquiryFolderId,
    mainProduct: payload.mainProduct,
    total: priceBreakdown.total,
    uploadedFileCount: payload.uploadedFiles.length,
    photosBundleCreated: Boolean(photosBundleUrl),
  });

  const emailResult = await sendInquiryEmail(payload, priceBreakdown, submittedAt, inquiryId, photosBundleUrl);

  const customerEmail = payload.contact.email?.trim();
  const customerEmailResult = customerEmail
    ? await sendInquiryConfirmationEmail(customerEmail, payload.contact.name, inquiryId)
    : { delivered: false, provider: 'dev-log' as const };

  return {
    inquiryId,
    submittedAt: submittedAt.toISOString(),
    priceBreakdown,
    emailDelivered: emailResult.delivered,
    customerEmailDelivered: customerEmailResult.delivered,
    photosBundleUrl,
  };
}
