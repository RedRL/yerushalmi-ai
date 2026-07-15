export type ConfiguratorStepId =
  | 'product'
  | 'song'
  | 'video'
  | 'details'
  | 'upload'
  | 'summary'
  | 'contact';

export interface ConfiguratorStepDef {
  id: ConfiguratorStepId;
  labelHe: string;
}

export const CONFIGURATOR_STEPS: readonly ConfiguratorStepDef[] = [
  { id: 'product', labelHe: 'סוג הפרויקט' },
  { id: 'song', labelHe: 'השיר' },
  { id: 'video', labelHe: 'הסרטון' },
  { id: 'details', labelHe: 'הסיפור' },
  { id: 'upload', labelHe: 'חומרים' },
  { id: 'summary', labelHe: 'סיכום' },
  { id: 'contact', labelHe: 'פרטי קשר' },
];
