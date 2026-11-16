import { Pipe, PipeTransform, inject } from '@angular/core';
import { LocaleService } from './locale.service';
import type { L10nText } from './locale.types';
import { UI_MESSAGES, type UiMessageKey } from './messages';

/**
 * `{{ 'header.cta' | t }}` for dictionary keys, or `{{ someL10n | t }}` for bilingual values.
 * Impure so it updates when LocaleService.locale changes.
 */
@Pipe({ name: 't', pure: false })
export class TranslatePipe implements PipeTransform {
  private readonly locale = inject(LocaleService);

  transform(value: UiMessageKey | L10nText | string | null | undefined): string {
    if (value == null) return '';
    if (typeof value === 'object') {
      return this.locale.tx(value);
    }
    if (Object.prototype.hasOwnProperty.call(UI_MESSAGES, value)) {
      return this.locale.t(value as UiMessageKey);
    }
    return value;
  }
}
