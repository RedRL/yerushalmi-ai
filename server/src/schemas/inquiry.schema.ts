import { z } from 'zod';
import {
  getMinimumImageCountForVideoLength,
  getMaximumImageCountForVideoLength,
  getMaximumVideoCountForVideoLength,
  MAX_UPLOADED_FILES_PER_INQUIRY,
  resolveVideoLengthForUploadValidation,
} from '../upload/upload-requirements';
import { extractInquiryFolderId, inquiryFolderContainsReference } from '../storage/storage-key.util';
import { formatShortInquiryReference } from '../utils/inquiry-reference.util';
import { inquiryFolderIdSchema } from './inquiry-folder.schema';
import { inquiryReferenceIdSchema } from './inquiry-reference.schema';

export const mainProductSchema = z.enum(['song_only', 'video_existing_song', 'video_new_song']);

export const videoSourceSchema = z.enum(['customer_photos', 'ai_only', 'mixed', 'customer_videos']);

export const videoLengthSchema = z.enum(['min_2_0', 'min_2_5', 'min_3_0', 'min_3_5', 'min_4_0', 'min_4_5']);

export const videoFormatSchema = z.enum(['landscape', 'portrait', 'portrait_3_4', 'classic', 'square', 'both']);

export const subtitlesSchema = z.enum(['none', 'selected', 'full']);

export const addonSchema = z.enum([
  'social_short_version',
  'custom_intro',
  'outro_screen',
  'names_dates_overlay',
  'extra_version',
  'separate_audio_file',
  'extra_revision_round',
  'ai_image_fill',
]);

export const uploadedFileTypeSchema = z.enum(['image', 'video', 'audio']);

const phoneRegex = /^[0-9+\-\s()]{7,20}$/;

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'נא להזין שם מלא').max(120),
  phone: z.string().trim().regex(phoneRegex, 'מספר טלפון לא תקין'),
  email: z.string().trim().email('כתובת אימייל לא תקינה').optional().or(z.literal('')),
  preferredContactMethod: z.enum(['phone', 'whatsapp', 'email']).optional(),
  message: z.string().trim().max(2000).optional(),
});

export const vocalistSchema = z.enum(['male', 'female', 'both']);

export const songConfigSchema = z.object({
  style: z.string().trim().max(100).optional(),
  customStyle: z.string().trim().max(150).optional(),
  vocalist: vocalistSchema.optional(),
  mood: z.string().trim().max(100).optional(),
  length: z.string().trim().max(100).optional(),
  namesToInclude: z.array(z.string().trim().max(100)).max(20).optional().default([]),
  importantWords: z.array(z.string().trim().max(200)).max(30).optional().default([]),
  excludedTopics: z.array(z.string().trim().max(200)).max(30).optional().default([]),
  additionalNotes: z.string().trim().max(2000).optional(),
  existingSongName: z.string().trim().max(200).optional(),
  existingSongArtist: z.string().trim().max(200).optional(),
  existingSongLink: z.string().trim().url('קישור לא תקין').optional().or(z.literal('')),
});

export const videoConfigSchema = z.object({
  source: videoSourceSchema.optional(),
  length: videoLengthSchema.optional(),
  format: videoFormatSchema.optional(),
  subtitles: subtitlesSchema.optional(),
  revisionNotes: z.string().trim().max(1000).optional(),
});

export const projectDetailsSchema = z.object({
  personName: z.string().trim().min(1, 'נא להזין את שם האדם או האנשים').max(120),
  occasion: z.string().trim().min(1, 'נא לבחור סוג אירוע').max(150),
  eventDate: z
    .string()
    .trim()
    .refine((value) => value.length === 0 || /^\d{4}-\d{2}-\d{2}$/.test(value), {
      message: 'נא לבחור תאריך אירוע תקין',
    })
    .optional(),
  age: z.string().trim().max(20).optional(),
  relationship: z.string().trim().max(150).optional(),
  characterTraits: z.string().trim().max(500).optional(),
  hobbies: z.string().trim().max(500).optional(),
  occupation: z.string().trim().max(200).optional(),
  peopleToMention: z.string().trim().max(500).optional(),
  desiredAtmosphere: z.string().trim().max(500).optional(),
  story: z.string().trim().min(10, 'נא לשתף כמה שיותר פרטים על האדם והסיפור').max(800),
  additionalNotes: z.string().trim().max(2000).optional(),
});

export const uploadedFileReferenceSchema = z.object({
  id: z.string().min(1),
  type: uploadedFileTypeSchema,
  name: z.string().min(1).max(255),
  storageKey: z.string().min(1),
  url: z.string().url().optional(),
  durationSeconds: z.number().positive().max(31).optional(),
});

export const consentsSchema = z.object({
  mediaRights: z.literal(true, {
    message: 'יש לאשר הרשאת שימוש בחומרים שסופקו',
  }),
  contactPermission: z.literal(true, {
    message: 'יש לאשר חזרה בנוגע לבקשה',
  }),
  termsAccepted: z.literal(true, {
    message: 'יש לאשר את תקנון השירות',
  }),
  musicRights: z.boolean().optional(),
});

export const inquirySchema = z
  .object({
    contact: contactSchema,
    mainProduct: mainProductSchema,
    song: songConfigSchema.optional(),
    video: videoConfigSchema.optional(),
    addons: z.array(addonSchema).max(20).optional().default([]),
    projectDetails: projectDetailsSchema,
    uploadedFiles: z.array(uploadedFileReferenceSchema).max(MAX_UPLOADED_FILES_PER_INQUIRY).optional().default([]),
    inquiryFolderId: inquiryFolderIdSchema.optional(),
    inquiryReferenceId: inquiryReferenceIdSchema.optional(),
    consents: consentsSchema,
    // Accepted for forward-compatibility with the client payload shape, but
    // NEVER used for the trusted price calculation. See pricing.service.ts.
    clientPricePreview: z.object({ total: z.number() }).optional(),
  })
  .superRefine((data, ctx) => {
    const includesNewSong = data.mainProduct === 'song_only' || data.mainProduct === 'video_new_song';
    const includesVideo = data.mainProduct === 'video_existing_song' || data.mainProduct === 'video_new_song';

    if (includesNewSong && !data.song) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['song'],
        message: 'נא למלא את פרטי השיר',
      });
    }

    if (includesVideo && !data.video) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['video'],
        message: 'נא למלא את פרטי הסרטון',
      });
    }

    if (includesNewSong && !data.song?.vocalist) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['song', 'vocalist'],
        message: 'נא לבחור זמר, זמרת או שילוב של שניהם',
      });
    }

    if (data.mainProduct === 'video_existing_song') {
      if (!data.song?.existingSongName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['song', 'existingSongName'],
          message: 'נא למלא את שם השיר הקיים',
        });
      }
      if (data.consents.musicRights !== true) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['consents', 'musicRights'],
          message: 'יש לאשר הרשאת שימוש בחומרים (כולל השיר הקיים)',
        });
      }
    }

    if (data.mainProduct === 'song_only') {
      if ((data.uploadedFiles?.length ?? 0) > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['uploadedFiles'],
          message: 'שיר אישי אינו כולל העלאת תמונות',
        });
      }
      if (data.inquiryFolderId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['inquiryFolderId'],
          message: 'שיר אישי אינו כולל תיקיית העלאה',
        });
      }
    }

    if (includesVideo) {
      const imageCount = data.uploadedFiles?.filter((file) => file.type === 'image').length ?? 0;
      const videoCount = data.uploadedFiles?.filter((file) => file.type === 'video').length ?? 0;
      const videoLength = resolveVideoLengthForUploadValidation({
        mainProduct: data.mainProduct,
        songLength: data.song?.length,
        videoLength: data.video?.length,
      });
      const minimumRequired = getMinimumImageCountForVideoLength(videoLength);
      const maximumAllowed = getMaximumImageCountForVideoLength(videoLength);
      const maximumVideos = getMaximumVideoCountForVideoLength(videoLength);

      if (imageCount > maximumAllowed) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['uploadedFiles'],
          message: `ניתן להעלות עד ${maximumAllowed} תמונות לאורך הסרטון שבחרתם (הועלו ${imageCount})`,
        });
      } else if (imageCount < minimumRequired) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['uploadedFiles'],
          message:
            imageCount === 0
              ? `הועלו 0 מתוך מינימום של ${minimumRequired}`
              : `הועלו ${imageCount} מתוך מינימום של ${minimumRequired}`,
        });
      }

      if (videoCount > maximumVideos) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['uploadedFiles'],
          message: `ניתן להעלות עד ${maximumVideos} סרטונים קצרים לאורך הסרטון שבחרתם (הועלו ${videoCount})`,
        });
      }
    }

    const uploadedFiles = data.uploadedFiles ?? [];
    if (uploadedFiles.length > 0) {
      const expectedFolderId = data.inquiryFolderId;
      const folderIds = new Set(
        uploadedFiles
          .map((file) => extractInquiryFolderId(file.storageKey))
          .filter((folderId): folderId is string => Boolean(folderId)),
      );

      if (folderIds.size !== 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['uploadedFiles'],
          message: 'כל הקבצים חייבים להיות באותה תיקיית העלאה',
        });
      } else if (expectedFolderId && !folderIds.has(expectedFolderId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['inquiryFolderId'],
          message: 'מזהה תיקיית ההעלאה אינו תואם לקבצים שהועלו',
        });
      }

      if (
        data.inquiryReferenceId &&
        data.inquiryFolderId &&
        !inquiryFolderContainsReference(data.inquiryFolderId, data.inquiryReferenceId)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['inquiryFolderId'],
          message: `מזהה תיקיית ההעלאה אינו תואם למספר הפנייה ${formatShortInquiryReference(data.inquiryReferenceId)}`,
        });
      }
    }
  });

export type InquiryInput = z.infer<typeof inquirySchema>;
