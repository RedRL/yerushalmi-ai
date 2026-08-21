import { describe, expect, it } from 'vitest';
import { initiateUploadSchema, normalizeInitiateUploadInput } from './upload.schema';

describe('upload.schema initiate normalization', () => {
  const inquiryReferenceId = '48123456';

  it('maps a misplaced contact name from inquiryFolderId to contactName', () => {
    const normalized = normalizeInitiateUploadInput({
      fileName: 'photo.jpg',
      fileType: 'image',
      mimeType: 'image/jpeg',
      sizeBytes: 1000,
      inquiryFolderId: 'משה כהן',
      inquiryReferenceId,
    });

    const result = initiateUploadSchema.safeParse(normalized);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.contactName).toBe('משה כהן');
      expect(result.data.inquiryFolderId).toBeUndefined();
    }
  });

  it('strips legacy uuid folder ids and keeps contactName', () => {
    const result = initiateUploadSchema.safeParse({
      fileName: 'photo.jpg',
      fileType: 'image',
      mimeType: 'image/jpeg',
      sizeBytes: 1000,
      contactName: 'Test User',
      inquiryReferenceId,
      inquiryFolderId: '181d4a54-80b2-48df-afd7-3dec2c1018b3',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.contactName).toBe('Test User');
      expect(result.data.inquiryFolderId).toBeUndefined();
    }
  });

  it('allows reusing a named folder id without resending contactName', () => {
    const result = initiateUploadSchema.safeParse({
      fileName: 'photo.jpg',
      fileType: 'image',
      mimeType: 'image/jpeg',
      sizeBytes: 1000,
      inquiryFolderId: 'moshe-cohen-a1b2c3d4',
    });

    expect(result.success).toBe(true);
  });
});
