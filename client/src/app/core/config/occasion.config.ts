/** Occasion choices for the story step, with a grammatical voice for follow-up copy. */

import { pickL10n, type L10nText, type Locale } from '../i18n/locale.types';
import { UI_MESSAGES } from '../i18n/messages';

export type OccasionId =
  | 'birthday'
  | 'bar_mitzvah'
  | 'bat_mitzvah'
  | 'wedding'
  | 'anniversary'
  | 'just_because'
  | 'other';

export type OccasionVoice = 'male' | 'female' | 'plural' | 'neutral';

export interface OccasionOption {
  readonly id: OccasionId;
  /** Bilingual label. The inquiry payload always uses `label.he` (see `resolveOccasionLabel`). */
  readonly label: L10nText;
  readonly voice: OccasionVoice;
}

export const OCCASION_OPTIONS: readonly OccasionOption[] = [
  { id: 'birthday', label: UI_MESSAGES['occasion.birthday'], voice: 'neutral' },
  { id: 'bar_mitzvah', label: UI_MESSAGES['occasion.bar_mitzvah'], voice: 'male' },
  { id: 'bat_mitzvah', label: UI_MESSAGES['occasion.bat_mitzvah'], voice: 'female' },
  { id: 'wedding', label: UI_MESSAGES['occasion.wedding'], voice: 'plural' },
  { id: 'anniversary', label: UI_MESSAGES['occasion.anniversary'], voice: 'plural' },
  { id: 'just_because', label: UI_MESSAGES['occasion.just_because'], voice: 'neutral' },
  { id: 'other', label: UI_MESSAGES['occasion.other'], voice: 'neutral' },
] as const;

const OCCASION_BY_ID = Object.fromEntries(
  OCCASION_OPTIONS.map((option) => [option.id, option]),
) as Record<OccasionId, OccasionOption>;

export function isOccasionId(value: string | null | undefined): value is OccasionId {
  return Boolean(value && value in OCCASION_BY_ID);
}

export function findOccasionOption(id: string | null | undefined): OccasionOption | null {
  return isOccasionId(id) ? OCCASION_BY_ID[id] : null;
}

/**
 * Occasion label for the inquiry payload / admin. ALWAYS Hebrew, regardless of the active
 * UI locale, so the admin sees one consistent language. A custom ("other") occasion is
 * returned exactly as the customer typed it.
 */
export function resolveOccasionLabel(
  occasionId: string | null | undefined,
  customOccasion: string | null | undefined,
): string {
  if (!isOccasionId(occasionId)) return '';
  if (occasionId === 'other') return (customOccasion ?? '').trim();
  return OCCASION_BY_ID[occasionId].label.he;
}

/** Occasion label for customer-facing UI (e.g. the summary step) in the given locale. */
export function resolveOccasionDisplayLabel(
  occasionId: string | null | undefined,
  customOccasion: string | null | undefined,
  locale: Locale,
): string {
  if (!isOccasionId(occasionId)) return '';
  if (occasionId === 'other') return (customOccasion ?? '').trim();
  return pickL10n(OCCASION_BY_ID[occasionId].label, locale);
}

export function resolveOccasionVoice(
  occasionId: string | null | undefined,
): OccasionVoice {
  return findOccasionOption(occasionId)?.voice ?? 'neutral';
}

/** Map a previously free-typed occasion string onto a dropdown id when possible. */
export function migrateLegacyOccasion(raw: string | null | undefined): {
  occasionId: OccasionId | '';
  customOccasion: string;
} {
  const text = (raw ?? '').trim();
  if (!text) return { occasionId: '', customOccasion: '' };

  const lower = text.toLowerCase();

  // Exact match against either language of a predefined label.
  const exact = OCCASION_OPTIONS.find(
    (option) =>
      option.id !== 'other' &&
      (option.label.he === text || option.label.en.toLowerCase() === lower),
  );
  if (exact) return { occasionId: exact.id, customOccasion: '' };

  if (lower.includes('בת מצווה') || lower.includes('בת-מצווה') || /bat[\s-]?mitzvah/.test(lower)) {
    return { occasionId: 'bat_mitzvah', customOccasion: '' };
  }
  if (lower.includes('בר מצווה') || lower.includes('בר-מצווה') || /bar[\s-]?mitzvah/.test(lower)) {
    return { occasionId: 'bar_mitzvah', customOccasion: '' };
  }
  if (text.includes('חתונה') || /\bwedding\b/.test(lower)) {
    return { occasionId: 'wedding', customOccasion: '' };
  }
  if (text.includes('נישואין') || text.includes('נישואים') || /\banniversary\b/.test(lower)) {
    return { occasionId: 'anniversary', customOccasion: '' };
  }
  if (text.includes('יום הולדת') || text.includes('יומולדת') || /\bbirthday\b/.test(lower)) {
    return { occasionId: 'birthday', customOccasion: '' };
  }
  if (text.includes('סתם') || text.includes('בלי סיבה') || /\bjust because\b/.test(lower)) {
    return { occasionId: 'just_because', customOccasion: '' };
  }

  return { occasionId: 'other', customOccasion: text };
}

export interface OccasionCopy {
  whoHeading: L10nText;
  howHeading: L10nText;
  relationshipLabel: L10nText;
  relationshipPlaceholder: L10nText;
  traitsPlaceholder: L10nText;
  storyHeading: L10nText;
  storyDescription: L10nText;
}

/** Bilingual follow-up copy for an occasion voice. Texts live in `UI_MESSAGES` (`occasion.<voice>.*`). */
export function occasionCopyFor(voice: OccasionVoice): OccasionCopy {
  switch (voice) {
    case 'male':
      return {
        whoHeading: UI_MESSAGES['occasion.male.whoHeading'],
        howHeading: UI_MESSAGES['occasion.male.howHeading'],
        relationshipLabel: UI_MESSAGES['occasion.male.relationshipLabel'],
        relationshipPlaceholder: UI_MESSAGES['occasion.male.relationshipPlaceholder'],
        traitsPlaceholder: UI_MESSAGES['occasion.male.traitsPlaceholder'],
        storyHeading: UI_MESSAGES['occasion.male.storyHeading'],
        storyDescription: UI_MESSAGES['occasion.male.storyDescription'],
      };
    case 'female':
      return {
        whoHeading: UI_MESSAGES['occasion.female.whoHeading'],
        howHeading: UI_MESSAGES['occasion.female.howHeading'],
        relationshipLabel: UI_MESSAGES['occasion.female.relationshipLabel'],
        relationshipPlaceholder: UI_MESSAGES['occasion.female.relationshipPlaceholder'],
        traitsPlaceholder: UI_MESSAGES['occasion.female.traitsPlaceholder'],
        storyHeading: UI_MESSAGES['occasion.female.storyHeading'],
        storyDescription: UI_MESSAGES['occasion.female.storyDescription'],
      };
    case 'plural':
      return {
        whoHeading: UI_MESSAGES['occasion.plural.whoHeading'],
        howHeading: UI_MESSAGES['occasion.plural.howHeading'],
        relationshipLabel: UI_MESSAGES['occasion.plural.relationshipLabel'],
        relationshipPlaceholder: UI_MESSAGES['occasion.plural.relationshipPlaceholder'],
        traitsPlaceholder: UI_MESSAGES['occasion.plural.traitsPlaceholder'],
        storyHeading: UI_MESSAGES['occasion.plural.storyHeading'],
        storyDescription: UI_MESSAGES['occasion.plural.storyDescription'],
      };
    default:
      return {
        whoHeading: UI_MESSAGES['occasion.neutral.whoHeading'],
        howHeading: UI_MESSAGES['occasion.neutral.howHeading'],
        relationshipLabel: UI_MESSAGES['occasion.neutral.relationshipLabel'],
        relationshipPlaceholder: UI_MESSAGES['occasion.neutral.relationshipPlaceholder'],
        traitsPlaceholder: UI_MESSAGES['occasion.neutral.traitsPlaceholder'],
        storyHeading: UI_MESSAGES['occasion.neutral.storyHeading'],
        storyDescription: UI_MESSAGES['occasion.neutral.storyDescription'],
      };
  }
}
