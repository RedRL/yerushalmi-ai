import { describe, expect, it } from 'vitest';
import { buildInquiryStorageKey, resolveUploadFolderId } from '../storage/storage-key.util';
import { inquirySchema } from './inquiry.schema';

describe('inquirySchema', () => {
  const inquiryReferenceId = '48123456';
  const submittedAt = new Date('2026-08-21T01:07:32.000Z');

  it('accepts an inquiry with a contact-name upload folder', () => {
    const folderId = resolveUploadFolderId('משה כהן', undefined, submittedAt, inquiryReferenceId);
    const uploadedFiles = Array.from({ length: 36 }, (_, index) => ({
      id: String(index),
      type: 'image' as const,
      name: `photo-${index}.jpg`,
      storageKey: buildInquiryStorageKey(folderId, `photo-${index}.jpg`, String(index).padStart(8, '0')),
    }));

    const result = inquirySchema.safeParse({
      contact: { name: 'משה כהן', phone: '0501234567', email: 'test@example.com' },
      mainProduct: 'video_existing_song',
      song: { existingSongName: 'שיר קיים' },
      video: {
        source: 'customer_photos',
        length: 'min_2_0',
        format: 'landscape',
        subtitles: 'none',
      },
      projectDetails: {
        personName: 'דוד',
        occasion: 'יום הולדת',
        story: 'זהו סיפור ארוך מספיק לבדיקה',
      },
      uploadedFiles,
      inquiryFolderId: folderId,
      inquiryReferenceId,
      consents: {
        mediaRights: true,
        contactPermission: true,
        termsAccepted: true,
        musicRights: true,
      },
    });

    expect(result.success).toBe(true);
  });

  it('rejects when inquiryFolderId does not match uploaded file folders', () => {
    const folderId = resolveUploadFolderId('משה כהן', undefined, submittedAt, inquiryReferenceId);
    const otherFolderId = resolveUploadFolderId(
      'משה כהן',
      undefined,
      new Date('2026-08-21T01:08:00.000Z'),
      '87654321',
    );
    const storageKey = buildInquiryStorageKey(folderId, 'photo.jpg', 'abcd1234');

    const result = inquirySchema.safeParse({
      contact: { name: 'משה כהן', phone: '0501234567', email: 'test@example.com' },
      mainProduct: 'video_existing_song',
      song: { existingSongName: 'שיר קיים' },
      video: {
        source: 'customer_photos',
        length: 'min_2_0',
        format: 'landscape',
        subtitles: 'none',
      },
      projectDetails: {
        personName: 'דוד',
        occasion: 'יום הולדת',
        story: 'זהו סיפור ארוך מספיק לבדיקה',
      },
      uploadedFiles: [{ id: '1', type: 'image', name: 'photo.jpg', storageKey }],
      inquiryFolderId: otherFolderId,
      inquiryReferenceId,
      consents: {
        mediaRights: true,
        contactPermission: true,
        termsAccepted: true,
        musicRights: true,
      },
    });

    expect(result.success).toBe(false);
  });

  it('rejects uploads for song-only inquiries', () => {
    const folderId = resolveUploadFolderId('Test User', undefined, submittedAt, inquiryReferenceId);
    const storageKey = buildInquiryStorageKey(folderId, 'photo.jpg', 'abcd1234');

    const result = inquirySchema.safeParse({
      contact: { name: 'Test User', phone: '0501234567', email: 'test@example.com' },
      mainProduct: 'song_only',
      song: { style: 'פופ' },
      projectDetails: {
        personName: 'David',
        occasion: 'Birthday',
        story: 'Long enough story for validation',
      },
      uploadedFiles: [{ id: '1', type: 'image', name: 'photo.jpg', storageKey }],
      inquiryFolderId: folderId,
      inquiryReferenceId,
      consents: {
        mediaRights: true,
        contactPermission: true,
        termsAccepted: true,
      },
    });

    expect(result.success).toBe(false);
  });

  it('rejects blob preview urls on uploaded files', () => {
    const folderId = resolveUploadFolderId(
      'Test User',
      undefined,
      submittedAt,
      inquiryReferenceId,
    );
    const storageKey = buildInquiryStorageKey(folderId, 'photo.jpg', 'abcd1234');

    const result = inquirySchema.safeParse({
      contact: { name: 'Test User', phone: '0501234567', email: 'test@example.com' },
      mainProduct: 'video_existing_song',
      song: { existingSongName: 'Song' },
      video: {
        source: 'customer_photos',
        length: 'min_2_0',
        format: 'landscape',
        subtitles: 'none',
      },
      projectDetails: {
        personName: 'David',
        occasion: 'Birthday',
        story: 'Long enough story for validation',
      },
      uploadedFiles: [
        {
          id: '1',
          type: 'image',
          name: 'photo.jpg',
          storageKey,
          url: 'blob:http://localhost:4200/fake-preview',
        },
      ],
      inquiryFolderId: folderId,
      inquiryReferenceId,
      consents: {
        mediaRights: true,
        contactPermission: true,
        termsAccepted: true,
        musicRights: true,
      },
    });

    expect(result.success).toBe(false);
  });
});
