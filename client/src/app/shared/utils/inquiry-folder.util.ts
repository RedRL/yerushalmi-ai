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

import { formatShortInquiryReference } from './inquiry-reference.util';

export function inquiryFolderContainsReference(folderId: string, inquiryReferenceId: string): boolean {
  const shortRef = formatShortInquiryReference(inquiryReferenceId);
  return folderId.endsWith(`-${shortRef}`) || folderId.includes(`-${shortRef}-`);
}

export function extractInquiryFolderId(storageKey: string): string | null {
  const match = /^inquiries\/([^/]+)\//.exec(storageKey);
  return match?.[1] ?? null;
}
