import { randomInt } from 'node:crypto';

const INQUIRY_REFERENCE_NUMBER = /^\d{8}$/;

const INQUIRY_REFERENCE_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isInquiryReferenceNumber(inquiryId: string): boolean {
  return INQUIRY_REFERENCE_NUMBER.test(inquiryId);
}

/** @deprecated Legacy UUID references from earlier submissions. */
export function isInquiryReferenceUuid(inquiryId: string): boolean {
  return INQUIRY_REFERENCE_UUID.test(inquiryId);
}

/** Generates an 8-digit numeric inquiry reference (e.g. `04812356`). */
export function generateInquiryReferenceId(): string {
  return randomInt(0, 100_000_000).toString().padStart(8, '0');
}

/** Customer-facing inquiry reference for display, emails, and R2 folder suffixes. */
export function formatShortInquiryReference(inquiryId: string): string {
  if (isInquiryReferenceNumber(inquiryId)) {
    return inquiryId;
  }

  if (INQUIRY_REFERENCE_UUID.test(inquiryId)) {
    return inquiryId.slice(0, 8).toLowerCase();
  }

  return inquiryId.replace(/-/g, '').slice(0, 8).toLowerCase();
}
