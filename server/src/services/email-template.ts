import type { InquiryInput } from '../schemas/inquiry.schema';
import type { PriceBreakdown } from '../pricing/pricing.types';
import { escapeHtml, escapeHtmlMultiline } from '../utils/html-escape';
import { MAIN_PRODUCT_LABELS } from '../pricing/pricing.config';

function row(label: string, value: string | undefined | null): string {
  if (!value) return '';
  return `
    <tr>
      <td style="padding:6px 12px;color:#8a8a99;font-size:13px;white-space:nowrap;">${escapeHtml(label)}</td>
      <td style="padding:6px 12px;color:#1a1a2e;font-size:14px;">${escapeHtml(value)}</td>
    </tr>`;
}

function listRow(label: string, values: string[] | undefined): string {
  if (!values || values.length === 0) return '';
  return row(label, values.join(', '));
}

/** Builds an RTL-friendly HTML email summarizing a new inquiry for the business owner. */
export function buildInquiryEmailHtml(payload: InquiryInput, breakdown: PriceBreakdown, submittedAt: Date): string {
  const lineItemsHtml = breakdown.lineItems
    .map(
      (item) => `
      <tr>
        <td style="padding:6px 12px;color:#1a1a2e;font-size:14px;">${escapeHtml(item.labelHe)}</td>
        <td style="padding:6px 12px;color:#1a1a2e;font-size:14px;text-align:left;">₪${item.amount * item.quantity}</td>
      </tr>`,
    )
    .join('');

  return `<!doctype html>
<html lang="he" dir="rtl">
<head>
<meta charset="utf-8" />
<title>בקשה חדשה - YERUSHALMI.AI</title>
</head>
<body style="margin:0;padding:24px;background:#f4f4f8;font-family:Arial,Helvetica,sans-serif;direction:rtl;">
  <table role="presentation" width="100%" style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;">
    <tr>
      <td style="background:#141428;padding:20px 24px;">
        <span style="color:#ffffff;font-size:20px;font-weight:bold;">YERUSHALMI.AI</span>
        <div style="color:#b9b9d6;font-size:13px;margin-top:4px;">בקשה חדשה מהאתר</div>
      </td>
    </tr>
    <tr>
      <td style="padding:20px 24px;">
        <h2 style="color:#1a1a2e;font-size:16px;margin:0 0 8px;">פרטי לקוח</h2>
        <table role="presentation" width="100%">
          ${row('שם', payload.contact.name)}
          ${row('טלפון', payload.contact.phone)}
          ${row('אימייל', payload.contact.email)}
        </table>

        <h2 style="color:#1a1a2e;font-size:16px;margin:20px 0 8px;">סוג פרויקט</h2>
        <table role="presentation" width="100%">
          ${row('מוצר עיקרי', MAIN_PRODUCT_LABELS[payload.mainProduct])}
        </table>

        ${
          payload.song
            ? `<h2 style="color:#1a1a2e;font-size:16px;margin:20px 0 8px;">פרטי השיר</h2>
        <table role="presentation" width="100%">
          ${row('סטייל', payload.song.style)}
          ${row('סטייל (אחר)', payload.song.customStyle)}
          ${row('מצב רוח', payload.song.mood)}
          ${row('אורך משוער', payload.song.length)}
          ${listRow('שמות שיש לכלול', payload.song.namesToInclude)}
          ${listRow('מילים חשובות', payload.song.importantWords)}
          ${listRow('נושאים להימנע מהם', payload.song.excludedTopics)}
          ${row('הערות נוספות', payload.song.additionalNotes)}
          ${row('שם שיר קיים', payload.song.existingSongName)}
          ${row('אמן', payload.song.existingSongArtist)}
          ${row('קישור לשיר', payload.song.existingSongLink)}
        </table>`
            : ''
        }

        ${
          payload.video
            ? `<h2 style="color:#1a1a2e;font-size:16px;margin:20px 0 8px;">פרטי הסרטון</h2>
        <table role="presentation" width="100%">
          ${row('מקור הוויזואליה', payload.video.source)}
          ${row('אורך', payload.video.length)}
          ${row('פורמט', payload.video.format)}
          ${row('כתוביות', payload.video.subtitles)}
        </table>`
            : ''
        }

        ${
          payload.addons && payload.addons.length > 0
            ? `<h2 style="color:#1a1a2e;font-size:16px;margin:20px 0 8px;">תוספות</h2>
        <table role="presentation" width="100%">${listRow('נבחרו', payload.addons)}</table>`
            : ''
        }

        <h2 style="color:#1a1a2e;font-size:16px;margin:20px 0 8px;">פרטי הפרויקט והסיפור</h2>
        <table role="presentation" width="100%">
          ${row('עבור', payload.projectDetails.personName)}
          ${row('סוג אירוע', payload.projectDetails.occasion)}
          ${row('גיל', payload.projectDetails.age)}
          ${row('קשר למזמין', payload.projectDetails.relationship)}
          ${row('תכונות אופי', payload.projectDetails.characterTraits)}
          ${row('תחביבים', payload.projectDetails.hobbies)}
          ${row('מקצוע', payload.projectDetails.occupation)}
          ${row('אנשים להזכיר', payload.projectDetails.peopleToMention)}
          ${row('אווירה רצויה', payload.projectDetails.desiredAtmosphere)}
        </table>
        <div style="margin-top:10px;padding:12px;background:#f4f4f8;border-radius:8px;color:#1a1a2e;font-size:14px;line-height:1.6;">
          ${escapeHtmlMultiline(payload.projectDetails.story)}
        </div>
        ${
          payload.projectDetails.additionalNotes
            ? `<div style="margin-top:10px;color:#1a1a2e;font-size:14px;line-height:1.6;">${escapeHtmlMultiline(payload.projectDetails.additionalNotes)}</div>`
            : ''
        }

        ${
          payload.uploadedFiles.length > 0
            ? `<h2 style="color:#1a1a2e;font-size:16px;margin:20px 0 8px;">קבצים שהועלו (${payload.uploadedFiles.length})</h2>
        <table role="presentation" width="100%">
          ${payload.uploadedFiles
            .map((file) => row(file.type, `${file.name} — ${file.url ?? file.storageKey}`))
            .join('')}
        </table>`
            : '<p style="color:#8a8a99;font-size:13px;">לא הועלו קבצים.</p>'
        }

        <h2 style="color:#1a1a2e;font-size:16px;margin:20px 0 8px;">פירוט מחיר משוער (מחושב בשרת)</h2>
        <table role="presentation" width="100%">
          ${lineItemsHtml}
          <tr>
            <td style="padding:10px 12px;color:#1a1a2e;font-size:15px;font-weight:bold;border-top:1px solid #eee;">סה"כ משוער</td>
            <td style="padding:10px 12px;color:#1a1a2e;font-size:15px;font-weight:bold;border-top:1px solid #eee;text-align:left;">₪${breakdown.total}</td>
          </tr>
        </table>

        <h2 style="color:#1a1a2e;font-size:16px;margin:20px 0 8px;">אישורים</h2>
        <table role="presentation" width="100%">
          ${row('הרשאת שימוש בחומרים', payload.consents.mediaRights ? 'כן' : 'לא')}
          ${row('אישור חזרה', payload.consents.contactPermission ? 'כן' : 'לא')}
          ${row('אישור תקנון', payload.consents.termsAccepted ? 'כן' : 'לא')}
          ${payload.consents.musicRights !== undefined ? row('הרשאת שימוש בשיר קיים', payload.consents.musicRights ? 'כן' : 'לא') : ''}
        </table>

        <p style="color:#8a8a99;font-size:12px;margin-top:24px;">התקבל בתאריך ${submittedAt.toLocaleString('he-IL')}</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
