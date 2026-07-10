import type { AddonId, MainProductId, SubtitlesId, VideoFormatId, VideoLengthId, VideoSourceId } from './pricing.model';
import type { UploadedFileReference } from './upload.model';

export interface SongConfiguration {
  style?: string;
  customStyle?: string;
  mood?: string;
  length?: string;
  namesToInclude?: string;
  importantWords?: string;
  excludedTopics?: string;
  additionalNotes?: string;
  existingSongName?: string;
  existingSongArtist?: string;
  existingSongLink?: string;
}

export interface VideoConfiguration {
  source?: VideoSourceId;
  length?: VideoLengthId;
  format?: VideoFormatId;
  subtitles?: SubtitlesId;
}

export interface ProjectDetails {
  personName: string;
  occasion: string;
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

export interface ContactDetails {
  name: string;
  phone: string;
  email?: string;
  message?: string;
}

export interface ConsentState {
  mediaRights: boolean;
  contactPermission: boolean;
  musicRights?: boolean;
}

export interface ConfiguratorSnapshot {
  mainProduct: MainProductId | null;
  song: SongConfiguration;
  video: VideoConfiguration;
  addons: AddonId[];
  projectDetails: ProjectDetails;
  uploadedFiles: UploadedFileReference[];
  contact: ContactDetails;
  consents: ConsentState;
}
