import { describe, expect, it } from 'vitest';
import {
  buildInquiryFolderSuffix,
  buildInquiryFolderTimestampSuffix,
  buildInquiryPhotoBundleKey,
  buildInquiryStorageKey,
  extractInquiryFolderId,
  isValidInquiryFolderId,
  resolveUploadFolderId,
} from './storage-key.util';

describe('storage-key.util inquiry folders', () => {
  const submittedAt = new Date('2026-08-21T01:07:32.000Z');
  const inquiryReferenceId = '48123456';

  it('accepts legacy UUID folder ids', () => {
    const folderId = 'e719c35a-d4b9-4d5a-95a9-0cf1bd8c2a8d';
    expect(isValidInquiryFolderId(folderId)).toBe(true);
    expect(extractInquiryFolderId(buildInquiryStorageKey(folderId, 'photo.jpg', 'abcd1234'))).toBe(folderId);
  });

  it('accepts contact-name folder ids with hex suffix', () => {
    const folderId = 'יוסי-כהן-a1b2c3d4';
    expect(isValidInquiryFolderId(folderId)).toBe(true);
    expect(buildInquiryPhotoBundleKey(folderId)).toBe('inquiries/יוסי-כהן-a1b2c3d4/photos.zip');
  });

  it('accepts contact-name folder ids with reference and timestamp suffix', () => {
    const folderId = 'הראל-ירושלמי-21-8-2026-04:07:32-48123456';
    expect(isValidInquiryFolderId(folderId)).toBe(true);
    expect(buildInquiryFolderSuffix(inquiryReferenceId, submittedAt)).toBe('21-8-2026-04:07:32-48123456');
    expect(buildInquiryFolderTimestampSuffix(submittedAt)).toBe('21-8-2026-04:07:32');
  });

  it('accepts legacy ISO date folder ids', () => {
    expect(isValidInquiryFolderId('הראל-ירושלמי-2026-08-21-04:07:32-48123456')).toBe(true);
  });

  it('accepts legacy folder ids with reference before timestamp', () => {
    expect(isValidInquiryFolderId('הראל-ירושלמי-181d4a54-2026-08-21-04:07:32')).toBe(true);
  });

  it('accepts legacy timestamp suffix without colons', () => {
    expect(isValidInquiryFolderId('הראל-ירושלמי-2026-08-21-040732')).toBe(true);
  });

  it('rejects invalid folder ids', () => {
    expect(isValidInquiryFolderId('../escape')).toBe(false);
    expect(isValidInquiryFolderId('no-suffix')).toBe(false);
  });

  it('replaces legacy client folder ids with a contact-name folder', () => {
    const legacyId = '181d4a54-80b2-48df-afd7-3dec2c1018b3';
    const resolved = resolveUploadFolderId('משה כהן', legacyId, submittedAt, inquiryReferenceId);

    expect(resolved).toBe('משה-כהן-21-8-2026-04:07:32-48123456');
    expect(resolved).not.toBe(legacyId);
  });

  it('reuses a matching named folder id within the same inquiry', () => {
    const folderId = 'moshe-cohen-a1b2c3d4';
    expect(resolveUploadFolderId('Moshe Cohen', folderId)).toBe(folderId);
  });

  it('ignores legacy uuid folder ids even when provided', () => {
    const legacyId = '181d4a54-80b2-48df-afd7-3dec2c1018b3';
    const resolved = resolveUploadFolderId('Moshe Cohen', legacyId, submittedAt, inquiryReferenceId);

    expect(resolved).toBe('moshe-cohen-21-8-2026-04:07:32-48123456');
    expect(resolved).not.toBe(legacyId);
  });

  it('reuses a named folder id when contactName is omitted', () => {
    const folderId = 'moshe-cohen-a1b2c3d4';
    expect(resolveUploadFolderId('', folderId)).toBe(folderId);
  });
});
