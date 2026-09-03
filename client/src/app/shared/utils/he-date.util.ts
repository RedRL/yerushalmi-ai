const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const HE_DATE_PATTERN = /^(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{4})$/;

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

function isValidYmd(year: number, month: number, day: number): boolean {
  if (year < 1900 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) {
    return false;
  }
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

/** Formats YYYY-MM-DD as DD/MM/YYYY for Israel display. */
export function formatIsoDateToHeIl(iso: string | null | undefined): string {
  if (!iso) return '';
  const match = ISO_DATE_PATTERN.exec(iso.trim());
  if (!match) return iso.trim();
  return `${match[3]}/${match[2]}/${match[1]}`;
}

/** Parses a Israel date (DD/MM/YYYY) or ISO date into YYYY-MM-DD. Empty → ''. Invalid → null. */
export function parseHeIlDateToIso(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return '';

  const isoMatch = ISO_DATE_PATTERN.exec(trimmed);
  if (isoMatch) {
    const year = Number(isoMatch[1]);
    const month = Number(isoMatch[2]);
    const day = Number(isoMatch[3]);
    return isValidYmd(year, month, day) ? trimmed : null;
  }

  const heMatch = HE_DATE_PATTERN.exec(trimmed);
  if (!heMatch) return null;
  const day = Number(heMatch[1]);
  const month = Number(heMatch[2]);
  const year = Number(heMatch[3]);
  if (!isValidYmd(year, month, day)) return null;
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

/** Keeps only digits and inserts DD/MM/YYYY separators while typing. */
export function maskHeIlDateInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  const day = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const year = digits.slice(4, 8);
  if (digits.length <= 2) return day;
  if (digits.length <= 4) return `${day}/${month}`;
  return `${day}/${month}/${year}`;
}
