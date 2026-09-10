import { formatShortInquiryReference } from './inquiry-reference.util';

const LEGACY_INQUIRY_FOLDER_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Strip unsafe characters and collapse whitespace for an R2 folder segment. */
export function sanitizeInquiryFolderSlug(name: string): string {
  const slug = name
    .trim()
    .replace(/[^\w.\-\u0590-\u05FF\s]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);

  return (slug || 'inquiry').toLowerCase();
}

export function isLegacyInquiryFolderId(folderId: string): boolean {
  return LEGACY_INQUIRY_FOLDER_UUID.test(folderId);
}

export function inquiryFolderMatchesName(folderId: string, name: string): boolean {
  const slug = sanitizeInquiryFolderSlug(name);
  return folderId.startsWith(`${slug}-`);
}

export function inquiryFolderContainsReference(folderId: string, inquiryReferenceId: string): boolean {
  const shortRef = formatShortInquiryReference(inquiryReferenceId);
  return folderId.endsWith(`-${shortRef}`) || folderId.includes(`-${shortRef}-`);
}

const INQUIRY_FOLDER_TIMESTAMP_TIMEZONE = 'Asia/Jerusalem';

export function buildInquiryFolderTimestampSuffix(date: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: INQUIRY_FOLDER_TIMESTAMP_TIMEZONE,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? '0';
  const withoutLeadingZero = (value: string) => String(Number(value));

  return `${withoutLeadingZero(get('day'))}-${withoutLeadingZero(get('month'))}-${get('year')}-${get('hour')}:${get('minute')}:${get('second')}`;
}

/** One folder id for the whole inquiry — generated once, then reused for every upload. */
export function buildInquiryFolderId(
  contactName: string,
  inquiryReferenceId: string,
  submittedAt: Date = new Date(),
): string {
  const slug = sanitizeInquiryFolderSlug(contactName);
  const suffix = `${buildInquiryFolderTimestampSuffix(submittedAt)}-${formatShortInquiryReference(inquiryReferenceId)}`;
  return `${slug}-${suffix}`;
}

export function extractInquiryFolderId(storageKey: string): string | null {
  const match = /^inquiries\/([^/]+)\//.exec(storageKey);
  return match?.[1] ?? null;
}
