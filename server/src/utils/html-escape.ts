const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/** Escapes user-provided text before inserting it into HTML email markup. */
export function escapeHtml(value: string | undefined | null): string {
  if (!value) return '';
  return value.replace(/[&<>"']/g, (char) => HTML_ESCAPE_MAP[char] ?? char);
}

/** Escapes and preserves line breaks as <br> for readable multi-line email content. */
export function escapeHtmlMultiline(value: string | undefined | null): string {
  return escapeHtml(value).replace(/\n/g, '<br>');
}
