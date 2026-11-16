/** Occasion choices for the story step, with Hebrew voice for follow-up copy. */

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
  readonly labelHe: string;
  readonly voice: OccasionVoice;
}

export const OCCASION_OPTIONS: readonly OccasionOption[] = [
  { id: 'birthday', labelHe: 'יום הולדת', voice: 'neutral' },
  { id: 'bar_mitzvah', labelHe: 'בר מצווה', voice: 'male' },
  { id: 'bat_mitzvah', labelHe: 'בת מצווה', voice: 'female' },
  { id: 'wedding', labelHe: 'חתונה', voice: 'plural' },
  { id: 'anniversary', labelHe: 'יום נישואין', voice: 'plural' },
  { id: 'just_because', labelHe: 'סתם ככה, בלי סיבה מיוחדת', voice: 'neutral' },
  { id: 'other', labelHe: 'אחר', voice: 'neutral' },
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

export function resolveOccasionLabel(
  occasionId: string | null | undefined,
  customOccasion: string | null | undefined,
): string {
  if (!isOccasionId(occasionId)) return '';
  if (occasionId === 'other') return (customOccasion ?? '').trim();
  return OCCASION_BY_ID[occasionId].labelHe;
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

  const exact = OCCASION_OPTIONS.find(
    (option) => option.id !== 'other' && option.labelHe === text,
  );
  if (exact) return { occasionId: exact.id, customOccasion: '' };

  const lower = text.toLowerCase();
  if (lower.includes('בת מצווה') || lower.includes('בת-מצווה')) {
    return { occasionId: 'bat_mitzvah', customOccasion: '' };
  }
  if (lower.includes('בר מצווה') || lower.includes('בר-מצווה')) {
    return { occasionId: 'bar_mitzvah', customOccasion: '' };
  }
  if (text.includes('חתונה')) return { occasionId: 'wedding', customOccasion: '' };
  if (text.includes('נישואין') || text.includes('נישואים')) {
    return { occasionId: 'anniversary', customOccasion: '' };
  }
  if (text.includes('יום הולדת') || text.includes('יומולדת')) {
    return { occasionId: 'birthday', customOccasion: '' };
  }
  if (text.includes('סתם') || text.includes('בלי סיבה')) {
    return { occasionId: 'just_because', customOccasion: '' };
  }

  return { occasionId: 'other', customOccasion: text };
}

export interface OccasionCopy {
  whoHeading: string;
  howHeading: string;
  relationshipLabel: string;
  relationshipPlaceholder: string;
  traitsPlaceholder: string;
  storyHeading: string;
  storyDescription: string;
}

export function occasionCopyFor(voice: OccasionVoice): OccasionCopy {
  switch (voice) {
    case 'male':
      return {
        whoHeading: 'מי הוא',
        howHeading: 'איך הוא',
        relationshipLabel: 'הקשר שלכם אליו',
        relationshipPlaceholder: 'אבא, אח, חבר...',
        traitsPlaceholder: 'מצחיק, עקשן, נדיב...',
        storyHeading: 'מה חשוב שנדע עליו?',
        storyDescription: 'כתבו בחופשיות, כאילו אתם מספרים לחבר. לפחות כמה משפטים.',
      };
    case 'female':
      return {
        whoHeading: 'מי היא',
        howHeading: 'איך היא',
        relationshipLabel: 'הקשר שלכם אליה',
        relationshipPlaceholder: 'אמא, אחות, חברה...',
        traitsPlaceholder: 'מצחיקה, עקשנית, נדיבה...',
        storyHeading: 'מה חשוב שנדע עליה?',
        storyDescription: 'כתבו בחופשיות, כאילו אתם מספרים לחברה. לפחות כמה משפטים.',
      };
    case 'plural':
      return {
        whoHeading: 'מי הם',
        howHeading: 'איך הם',
        relationshipLabel: 'הקשר שלכם אליהם',
        relationshipPlaceholder: 'ההורים, חברים, משפחה...',
        traitsPlaceholder: 'מצחיקים, עקשנים, נדיבים...',
        storyHeading: 'מה חשוב שנדע עליהם?',
        storyDescription: 'כתבו בחופשיות, כאילו אתם מספרים לחבר. לפחות כמה משפטים.',
      };
    default:
      return {
        whoHeading: 'מי הם',
        howHeading: 'איך הם',
        relationshipLabel: 'הקשר שלכם לאדם',
        relationshipPlaceholder: 'בן/בת זוג, הורה...',
        traitsPlaceholder: 'מצחיק, עקשן, נדיב...',
        storyHeading: 'מה חשוב שנדע?',
        storyDescription: 'כתבו בחופשיות, כאילו אתם מספרים לחבר. לפחות כמה משפטים.',
      };
  }
}
