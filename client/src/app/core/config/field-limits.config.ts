/** Max character lengths for form fields across the app. */
export const FIELD_LIMITS = {
  personName: 40,
  occasion: 40,
  age: 3,
  relationship: 30,
  characterTraits: 50,
  hobbies: 50,
  occupation: 40,
  peopleToMention: 80,
  desiredAtmosphere: 50,
  story: 800,
  projectAdditionalNotes: 200,
  songAdditionalNotes: 150,
  mood: 30,
  namesToInclude: 60,
  importantWords: 60,
  excludedTopics: 60,
  customStyle: 30,
  existingSongName: 50,
  existingSongArtist: 40,
  existingSongLink: 200,
  contactName: 40,
  contactPhone: 20,
  contactEmail: 80,
  contactMessage: 200,
  simpleContactMessage: 300,
} as const;

export const STORY_PREVIEW_LENGTH = 90;

export const SUMMARY_TEXT_MAX_LENGTH = 60;
