import type { L10nText } from '../../core/i18n/locale.types';
import { UI_MESSAGES } from '../../core/i18n/messages';

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
  /** Bilingual progress label — resolve with `LocaleService.tx()`. */
  label: L10nText;
  /** Shorter progress label for mobile when the default is too long. */
  labelMobile?: L10nText;
}

export const CONFIGURATOR_STEPS: readonly ConfiguratorStepDef[] = [
  { id: 'product', label: UI_MESSAGES['config.step.product'] },
  { id: 'details', label: UI_MESSAGES['config.step.details'] },
  { id: 'song', label: UI_MESSAGES['config.step.song'] },
  { id: 'video', label: UI_MESSAGES['config.step.video'] },
  { id: 'extras', label: UI_MESSAGES['config.step.extras'] },
  { id: 'upload', label: UI_MESSAGES['config.step.upload'] },
  { id: 'summary', label: UI_MESSAGES['config.step.summary'] },
  { id: 'contact', label: UI_MESSAGES['config.step.contact'] },
];
