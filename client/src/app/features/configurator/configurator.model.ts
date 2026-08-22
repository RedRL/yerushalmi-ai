export type ConfiguratorStepId =
  | 'product'
  | 'song'
  | 'video'
  | 'details'
  | 'extras'
  | 'upload'
  | 'summary'
  | 'contact';

export interface ConfiguratorStepDef {
  id: ConfiguratorStepId;
  labelHe: string;
  /** Shorter progress label for mobile when the default is too long. */
  labelHeMobile?: string;
}

export const CONFIGURATOR_STEPS: readonly ConfiguratorStepDef[] = [
  { id: 'product', labelHe: 'סוג הפרויקט', labelHeMobile: 'הפרויקט' },
  { id: 'details', labelHe: 'הסיפור' },
  { id: 'song', labelHe: 'השיר' },
  { id: 'video', labelHe: 'הסרטון' },
  { id: 'extras', labelHe: 'פרטים נוספים', labelHeMobile: 'פרטים' },
  { id: 'upload', labelHe: 'תמונות' },
  { id: 'summary', labelHe: 'סיכום' },
  { id: 'contact', labelHe: 'פרטי קשר' },
];
