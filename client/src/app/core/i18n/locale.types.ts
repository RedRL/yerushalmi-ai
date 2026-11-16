export type Locale = 'he' | 'en';

export type L10nText = Readonly<Record<Locale, string>>;

export function l10n(he: string, en: string): L10nText {
  return { he, en };
}

export function pickL10n(
  value: L10nText | string | null | undefined,
  locale: Locale,
  fallback = '',
): string {
  if (value == null) return fallback;
  if (typeof value === 'string') return value;
  return value[locale] || value.he || value.en || fallback;
}

export function localeDir(locale: Locale): 'rtl' | 'ltr' {
  return locale === 'he' ? 'rtl' : 'ltr';
}

export function localeHtmlLang(locale: Locale): string {
  return locale === 'he' ? 'he' : 'en';
}

/** Replace `{token}` placeholders in a translated string. */
export function fillTemplate(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? `{${key}}`));
}
