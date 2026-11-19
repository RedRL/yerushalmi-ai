import { InjectionToken } from '@angular/core';

export type ExperienceMode = 'clips' | 'weddings';

/** Optional page-scoped token — Home defaults to clips; Weddings provides `'weddings'`. */
export const CONFIGURATOR_EXPERIENCE_MODE = new InjectionToken<ExperienceMode>(
  'CONFIGURATOR_EXPERIENCE_MODE',
);
