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
}

export const CONFIGURATOR_STEPS: readonly ConfiguratorStepDef[] = [
  { id: 'product', labelHe: 'סוג הפרויקט' },
  { id: 'details', labelHe: 'הסיפור' },
  { id: 'song', labelHe: 'השיר' },
  { id: 'video', labelHe: 'הסרטון' },
  { id: 'extras', labelHe: 'פרטים נוספים' },
  { id: 'upload', labelHe: 'חומרים' },
  { id: 'summary', labelHe: 'סיכום' },
  { id: 'contact', labelHe: 'פרטי קשר' },
];
