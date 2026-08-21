import { formatShortInquiryReference } from '../utils/inquiry-reference.util';

/** Strip path segments and unsafe characters from an upload file name. */
export function sanitizeUploadFileName(fileName: string): string {
  const base = fileName.replace(/\\/g, '/').split('/').pop() ?? 'upload';
  const sanitized = base.replace(/[^\w.\-()+\u0590-\u05FF\s]/g, '_').trim();

  if (!sanitized || sanitized === '.' || sanitized === '..') {
    return 'upload';
  }

  return sanitized.slice(0, 200);
}

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

const LEGACY_INQUIRY_FOLDER_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const NAMED_INQUIRY_FOLDER_HEX_SUFFIX = /^[\w.\-\u0590-\u05FF]+-[0-9a-f]{8}$/i;

const NAMED_INQUIRY_FOLDER_DMY_TIMESTAMP_SUFFIX =
  /^[\w.\-\u0590-\u05FF]+-\d{1,2}-\d{1,2}-\d{4}-\d{2}:\d{2}:\d{2}$/;

const NAMED_INQUIRY_FOLDER_DMY_TIMESTAMP_NUMERIC_REFERENCE_SUFFIX =
  /^[\w.\-\u0590-\u05FF]+-\d{1,2}-\d{1,2}-\d{4}-\d{2}:\d{2}:\d{2}-\d{8}$/;

/** @deprecated ISO date folders (YYYY-MM-DD) from earlier submissions. */
const NAMED_INQUIRY_FOLDER_TIMESTAMP_SUFFIX =
  /^[\w.\-\u0590-\u05FF]+-\d{4}-\d{2}-\d{2}-\d{2}:\d{2}:\d{2}$/;

/** @deprecated ISO date folders with numeric reference suffix. */
const NAMED_INQUIRY_FOLDER_TIMESTAMP_NUMERIC_REFERENCE_SUFFIX =
  /^[\w.\-\u0590-\u05FF]+-\d{4}-\d{2}-\d{2}-\d{2}:\d{2}:\d{2}-\d{8}$/;

/** @deprecated Hex reference suffix from earlier submissions. */
const NAMED_INQUIRY_FOLDER_TIMESTAMP_HEX_REFERENCE_SUFFIX =
  /^[\w.\-\u0590-\u05FF]+-\d{4}-\d{2}-\d{2}-\d{2}:\d{2}:\d{2}-[0-9a-f]{8}$/i;

/** @deprecated Earlier format with reference before timestamp — still accepted for existing folders. */
const NAMED_INQUIRY_FOLDER_REFERENCE_TIMESTAMP_SUFFIX =
  /^[\w.\-\u0590-\u05FF]+-[0-9a-f]{8}-\d{4}-\d{2}-\d{2}-\d{2}:\d{2}:\d{2}$/i;

const NAMED_INQUIRY_FOLDER_TIMESTAMP_SUFFIX_LEGACY =
  /^[\w.\-\u0590-\u05FF]+-\d{4}-\d{2}-\d{2}-\d{6}$/;

const INQUIRY_FOLDER_ID_PATTERN = /^inquiries\/([^/]+)\//;

const INQUIRY_FOLDER_TIMESTAMP_TIMEZONE = 'Asia/Jerusalem';

export function isLegacyInquiryFolderId(folderId: string): boolean {
  return LEGACY_INQUIRY_FOLDER_UUID.test(folderId);
}

/** Legacy UUID folders and `{contact-name-slug}-{timestamp|hex}` folders are both valid. */
export function isValidInquiryFolderId(folderId: string): boolean {
  return (
    isLegacyInquiryFolderId(folderId) ||
    NAMED_INQUIRY_FOLDER_HEX_SUFFIX.test(folderId) ||
    NAMED_INQUIRY_FOLDER_DMY_TIMESTAMP_NUMERIC_REFERENCE_SUFFIX.test(folderId) ||
    NAMED_INQUIRY_FOLDER_DMY_TIMESTAMP_SUFFIX.test(folderId) ||
    NAMED_INQUIRY_FOLDER_TIMESTAMP_NUMERIC_REFERENCE_SUFFIX.test(folderId) ||
    NAMED_INQUIRY_FOLDER_TIMESTAMP_HEX_REFERENCE_SUFFIX.test(folderId) ||
    NAMED_INQUIRY_FOLDER_REFERENCE_TIMESTAMP_SUFFIX.test(folderId) ||
    NAMED_INQUIRY_FOLDER_TIMESTAMP_SUFFIX.test(folderId) ||
    NAMED_INQUIRY_FOLDER_TIMESTAMP_SUFFIX_LEGACY.test(folderId)
  );
}

export function inquiryFolderMatchesName(folderId: string, name: string): boolean {
  const slug = sanitizeInquiryFolderSlug(name);
  return folderId.startsWith(`${slug}-`);
}

export function buildInquiryFolderIdFromContactName(contactName: string, suffix: string): string {
  return `${sanitizeInquiryFolderSlug(contactName)}-${suffix}`;
}

/** Israel-local submit timestamp for R2 folder suffixes (D-M-YYYY-HH:mm:ss, e.g. 21-8-2026-14:57:11). */
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

/** Folder suffix: timestamp first, inquiry reference last (21-8-2026-14:57:11-48123456). */
export function buildInquiryFolderSuffix(inquiryReferenceId: string, submittedAt: Date = new Date()): string {
  return `${buildInquiryFolderTimestampSuffix(submittedAt)}-${formatShortInquiryReference(inquiryReferenceId)}`;
}

export function inquiryFolderContainsReference(folderId: string, inquiryReferenceId: string): boolean {
  const shortRef = formatShortInquiryReference(inquiryReferenceId);
  return folderId.endsWith(`-${shortRef}`) || folderId.includes(`-${shortRef}-`);
}

/** Prefer a named folder for the contact; reuse a matching non-legacy id from the client. */
export function resolveUploadFolderId(
  contactName: string,
  requestedFolderId?: string,
  submittedAt: Date = new Date(),
  inquiryReferenceId?: string,
): string {
  const trimmedName = contactName.trim();

  if (
    requestedFolderId &&
    !isLegacyInquiryFolderId(requestedFolderId) &&
    isValidInquiryFolderId(requestedFolderId) &&
    (!trimmedName || inquiryFolderMatchesName(requestedFolderId, trimmedName))
  ) {
    return requestedFolderId;
  }

  if (!trimmedName) {
    throw new Error('Contact name is required to resolve an upload folder id.');
  }

  if (!inquiryReferenceId) {
    throw new Error('Inquiry reference id is required to resolve an upload folder id.');
  }

  return buildInquiryFolderIdFromContactName(
    trimmedName,
    buildInquiryFolderSuffix(inquiryReferenceId, submittedAt),
  );
}

/** Keys generated by our storage services always live under inquiries/{folderId}/. */
export function isManagedStorageKey(storageKey: string): boolean {
  const folderId = extractInquiryFolderId(storageKey);
  return Boolean(folderId) && !storageKey.includes('..');
}

export function extractInquiryFolderId(storageKey: string): string | null {
  const match = INQUIRY_FOLDER_ID_PATTERN.exec(storageKey);
  const folderId = match?.[1];
  if (!folderId || !isValidInquiryFolderId(folderId)) {
    return null;
  }
  return folderId;
}

export function buildInquiryStorageKey(folderId: string, fileName: string, uniqueSuffix: string): string {
  const safeName = sanitizeUploadFileName(fileName);
  return `inquiries/${folderId}/${uniqueSuffix}-${safeName}`;
}

export function buildInquiryPhotoBundleKey(folderId: string): string {
  return `inquiries/${folderId}/photos.zip`;
}

export function isInquiryPhotoBundleKey(storageKey: string): boolean {
  return /\/photos\.zip$/i.test(storageKey);
}
