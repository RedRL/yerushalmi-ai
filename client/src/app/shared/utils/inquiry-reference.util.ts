/** Generates an 8-digit numeric inquiry reference (e.g. `04812356`). */
export function generateInquiryReferenceId(): string {
  const value = crypto.getRandomValues(new Uint32Array(1))[0]! % 100_000_000;
  return value.toString().padStart(8, '0');
}

export function isInquiryReferenceNumber(inquiryId: string): boolean {
  return /^\d{8}$/.test(inquiryId);
}

/** Customer-facing inquiry reference for display. */
export function formatShortInquiryReference(inquiryId: string): string {
  if (isInquiryReferenceNumber(inquiryId)) {
    return inquiryId;
  }

  return inquiryId.slice(0, 8).toLowerCase();
}
