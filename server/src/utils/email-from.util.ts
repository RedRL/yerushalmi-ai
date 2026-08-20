/** Parses `Name <user@domain>` or plain `user@domain` from an EMAIL_FROM value. */
export function parseEmailFromHeader(fromHeader: string): string {
  const trimmed = fromHeader.trim();
  const angleMatch = trimmed.match(/<([^>]+)>/);
  if (angleMatch?.[1]) return angleMatch[1].trim();
  return trimmed;
}
