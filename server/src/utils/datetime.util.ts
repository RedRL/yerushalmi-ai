const ISRAEL_TIME_ZONE = 'Asia/Jerusalem';

/** Formats a timestamp in Israel local time for customer-facing emails. */
export function formatDateTimeHeIl(date: Date): string {
  return date.toLocaleString('he-IL', {
    timeZone: ISRAEL_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

/** Formats a YYYY-MM-DD event date for Hebrew display. */
export function formatEventDateHeIl(isoDate: string | undefined): string | undefined {
  if (!isoDate) return undefined;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate.trim());
  if (!match) return isoDate;
  const date = new Date(`${isoDate}T12:00:00+03:00`);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString('he-IL', { timeZone: ISRAEL_TIME_ZONE });
}
