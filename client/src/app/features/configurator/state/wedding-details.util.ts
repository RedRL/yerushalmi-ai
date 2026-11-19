import { FIELD_LIMITS } from '../../../core/config/field-limits.config';
import type { Locale } from '../../../core/i18n/locale.types';

export type WeddingPreparer = 'couple' | 'friends' | 'family';
export type WeddingVibe = 'funny_upbeat' | 'emotional_romantic' | 'party' | 'mix' | 'other';
export type WeddingMustInclude = 'proposal' | 'funny_moment' | 'both';

export interface WeddingFormValue {
  partner1Name: string;
  partner2Name: string;
  whoPrepares: WeddingPreparer | '';
  preparerRelation: string;
  partner1About: string;
  partner2About: string;
  howMet: string;
  lifeTogether: string;
  hasNicknames: boolean;
  nicknames: string;
  hasPet: boolean;
  petDetails: string;
  vibe: WeddingVibe | '';
  customVibe: string;
  mustInclude: WeddingMustInclude | '';
  proposalStory: string;
  memorableMoment: string;
  additionalNotes: string;
}

export interface MappedWeddingProjectDetails {
  personName: string;
  occasion: string;
  relationship?: string;
  characterTraits?: string;
  hobbies?: string;
  desiredAtmosphere?: string;
  peopleToMention?: string;
  story: string;
  additionalNotes?: string;
}

function trim(value: string): string {
  return value.trim();
}

function undefinedIfEmpty(value: string): string | undefined {
  const cleaned = trim(value);
  return cleaned.length > 0 ? cleaned : undefined;
}

function truncate(value: string, max: number): string {
  const cleaned = trim(value);
  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
}

function joinParts(parts: Array<string | undefined>, separator = '\n\n'): string {
  return parts.map((part) => (part ? trim(part) : '')).filter(Boolean).join(separator);
}

const PREPARER_LABEL: Record<WeddingPreparer, Record<Locale, string>> = {
  couple: { he: 'בני הזוג', en: 'The couple' },
  friends: { he: 'חברים', en: 'Friends' },
  family: { he: 'משפחה', en: 'Family' },
};

const VIBE_LABEL: Record<WeddingVibe, Record<Locale, string>> = {
  funny_upbeat: { he: 'מצחיק וקצבי', en: 'Funny and upbeat' },
  emotional_romantic: { he: 'מרגש ורומנטי', en: 'Emotional and romantic' },
  party: { he: 'מסיבה והרמות', en: 'Party energy' },
  mix: { he: 'שילוב של צחוק ורגש', en: 'A mix of laughs and emotion' },
  other: { he: 'אחר', en: 'Other' },
};

const MUST_INCLUDE_LABEL: Record<WeddingMustInclude, Record<Locale, string>> = {
  proposal: { he: 'הצעת הנישואים', en: 'The proposal' },
  funny_moment: { he: 'רגע מצחיק או בלתי נשכח', en: 'A funny or unforgettable moment' },
  both: { he: 'גם וגם', en: 'Both' },
};

export function weddingOccasionLabel(locale: Locale): string {
  return locale === 'en' ? 'Wedding' : 'חתונה';
}

/** Always Hebrew for admin/email consistency (matches occasion.config resolveOccasionLabel). */
export function weddingOccasionLabelHe(): string {
  return 'חתונה';
}

export function weddingPreparerLabel(value: WeddingPreparer | '', locale: Locale): string {
  if (!value) return '';
  return PREPARER_LABEL[value][locale];
}

export function weddingVibeLabel(
  value: WeddingVibe | '',
  locale: Locale,
  customVibe = '',
): string {
  if (!value) return '';
  if (value === 'other') {
    const custom = trim(customVibe);
    return custom || VIBE_LABEL.other[locale];
  }
  return VIBE_LABEL[value][locale];
}

export function weddingMustIncludeLabel(value: WeddingMustInclude | '', locale: Locale): string {
  if (!value) return '';
  return MUST_INCLUDE_LABEL[value][locale];
}

export function composeWeddingCoupleName(partner1: string, partner2: string): string {
  const a = trim(partner1);
  const b = trim(partner2);
  if (a && b) return `${a} & ${b}`;
  return a || b;
}

export function mapWeddingFormToProjectDetails(
  form: WeddingFormValue,
  locale: Locale,
): MappedWeddingProjectDetails {
  const partner1 = trim(form.partner1Name);
  const partner2 = trim(form.partner2Name);
  const personName = composeWeddingCoupleName(partner1, partner2);

  const preparer = form.whoPrepares;
  const preparerLabel = weddingPreparerLabel(preparer, locale);
  const relation = trim(form.preparerRelation);
  const relationship =
    preparer === 'friends' || preparer === 'family'
      ? undefinedIfEmpty(joinParts([preparerLabel, relation], ' — '))
      : undefinedIfEmpty(preparerLabel);

  const storyParts = [
    trim(form.howMet) ? `${locale === 'en' ? 'How we met' : 'איך הכרנו'}: ${trim(form.howMet)}` : '',
    trim(form.lifeTogether)
      ? `${locale === 'en' ? 'Life together' : 'החיים המשותפים'}: ${trim(form.lifeTogether)}`
      : '',
  ];

  if (form.mustInclude === 'proposal' || form.mustInclude === 'both') {
    const proposal = trim(form.proposalStory);
    if (proposal) {
      storyParts.push(
        `${locale === 'en' ? 'Proposal' : 'הצעת נישואים'}: ${proposal}`,
      );
    }
  }
  if (form.mustInclude === 'funny_moment' || form.mustInclude === 'both') {
    const moment = trim(form.memorableMoment);
    if (moment) {
      storyParts.push(
        `${locale === 'en' ? 'Memorable moment' : 'רגע בלתי נשכח'}: ${moment}`,
      );
    }
  }

  const peopleBits = [
    form.hasNicknames ? undefinedIfEmpty(form.nicknames) : undefined,
    form.hasPet ? undefinedIfEmpty(form.petDetails) : undefined,
  ].filter(Boolean) as string[];

  const leftoverNotes = joinParts([
    form.mustInclude
      ? `${locale === 'en' ? 'Must include' : 'חייב להיכנס'}: ${weddingMustIncludeLabel(form.mustInclude, locale)}`
      : undefined,
    undefinedIfEmpty(form.additionalNotes),
  ]);

  return {
    personName: truncate(personName, FIELD_LIMITS.personName),
    occasion: weddingOccasionLabelHe(),
    relationship: relationship
      ? truncate(relationship, FIELD_LIMITS.relationship)
      : undefined,
    characterTraits: undefinedIfEmpty(form.partner1About)
      ? truncate(trim(form.partner1About), FIELD_LIMITS.characterTraits)
      : undefined,
    hobbies: undefinedIfEmpty(form.partner2About)
      ? truncate(trim(form.partner2About), FIELD_LIMITS.hobbies)
      : undefined,
    desiredAtmosphere: form.vibe
      ? truncate(weddingVibeLabel(form.vibe, 'he', form.customVibe), FIELD_LIMITS.desiredAtmosphere)
      : undefined,
    peopleToMention: peopleBits.length
      ? truncate(peopleBits.join(' · '), FIELD_LIMITS.peopleToMention)
      : undefined,
    story: truncate(joinParts(storyParts), FIELD_LIMITS.story),
    additionalNotes: leftoverNotes
      ? truncate(leftoverNotes, FIELD_LIMITS.projectAdditionalNotes)
      : undefined,
  };
}

export function isWeddingDetailsComplete(form: WeddingFormValue): boolean {
  if (!trim(form.partner1Name) || !trim(form.partner2Name)) return false;
  if (!form.whoPrepares) return false;
  if (!trim(form.partner1About) || !trim(form.partner2About)) return false;
  if (trim(form.howMet).length < 10) return false;
  if (trim(form.lifeTogether).length < 10) return false;
  if (!form.vibe) return false;
  if (form.vibe === 'other' && !trim(form.customVibe)) return false;
  if (form.hasNicknames && !trim(form.nicknames)) return false;
  if (form.hasPet && !trim(form.petDetails)) return false;
  if (
    (form.mustInclude === 'proposal' || form.mustInclude === 'both') &&
    trim(form.proposalStory).length < 5
  ) {
    return false;
  }
  if (
    (form.mustInclude === 'funny_moment' || form.mustInclude === 'both') &&
    trim(form.memorableMoment).length < 5
  ) {
    return false;
  }
  return true;
}
