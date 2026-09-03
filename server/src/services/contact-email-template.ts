import { formatDateTimeHeIl } from '../utils/datetime.util';
import { escapeHtml } from '../utils/html-escape';
import type { ContactMessageInput } from '../schemas/contact.schema';

export function buildContactEmailHtml(payload: ContactMessageInput, submittedAt: Date): string {
  return `
    <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
      <h2>הודעת יצירת קשר חדשה · YERUSHALMI.AI</h2>
      <p><strong>שם:</strong> ${escapeHtml(payload.name)}</p>
      <p><strong>טלפון:</strong> ${escapeHtml(payload.phone)}</p>
      <p><strong>אימייל:</strong> ${escapeHtml(payload.email)}</p>
      <p><strong>הודעה:</strong></p>
      <p style="white-space: pre-wrap;">${escapeHtml(payload.message)}</p>
      <hr />
      <p style="font-size: 12px; color: #666;">נשלח בתאריך ${formatDateTimeHeIl(submittedAt)}</p>
    </div>
  `.trim();
}
