import type { AddonId, MainProductId, PriceBreakdown, SubtitlesId, VideoFormatId, VideoLengthId, VideoSourceId, VocalistId } from './pricing.model';
import type { UploadedFileKind } from './upload.model';

export interface InquiryContactPayload {
  name: string;
  phone: string;
  email?: string;
  message?: string;
}

export interface InquirySongPayload {
  style?: string;
  customStyle?: string;
  vocalist?: VocalistId;
  mood?: string;
  length?: string;
  namesToInclude?: string[];
  importantWords?: string[];
  excludedTopics?: string[];
  additionalNotes?: string;
  existingSongName?: string;
  existingSongArtist?: string;
  existingSongLink?: string;
}

export interface InquiryVideoPayload {
  source?: VideoSourceId;
  length?: VideoLengthId;
  format?: VideoFormatId;
  subtitles?: SubtitlesId;
}

export interface InquiryProjectDetailsPayload {
  personName: string;
  occasion: string;
  eventDate?: string;
  age?: string;
  relationship?: string;
  characterTraits?: string;
  hobbies?: string;
  occupation?: string;
  peopleToMention?: string;
  desiredAtmosphere?: string;
  story: string;
  additionalNotes?: string;
}

export interface InquiryUploadedFilePayload {
  id: string;
  type: UploadedFileKind;
  name: string;
  storageKey: string;
  url?: string;
  durationSeconds?: number;
}

export interface InquiryConsentsPayload {
  mediaRights: true;
  contactPermission: true;
  termsAccepted: true;
  musicRights?: boolean;
}

export interface InquiryPayload {
  contact: InquiryContactPayload;
  mainProduct: MainProductId;
  song?: InquirySongPayload;
  video?: InquiryVideoPayload;
  addons: AddonId[];
  projectDetails: InquiryProjectDetailsPayload;
  uploadedFiles: InquiryUploadedFilePayload[];
  inquiryFolderId?: string;
  inquiryReferenceId?: string;
  consents: InquiryConsentsPayload;
  /** Sent for UX/debug purposes only - the backend never trusts this value. */
  clientPricePreview: { total: number };
}

export interface InquiryResponse {
  success: true;
  data: {
    inquiryId: string;
    submittedAt: string;
    priceBreakdown: PriceBreakdown;
    emailDelivered: boolean;
    customerEmailDelivered: boolean;
  };
}

export interface InquiryErrorResponse {
  success: false;
  error: {
    message: string;
    details?: unknown;
  };
}
