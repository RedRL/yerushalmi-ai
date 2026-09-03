import type { InquiryInput } from '../schemas/inquiry.schema';
import type { PriceBreakdown } from '../pricing/pricing.types';
import { escapeHtml, escapeHtmlMultiline } from '../utils/html-escape';
import { MAIN_PRODUCT_LABELS } from '../pricing/pricing.config';
import { formatShortInquiryReference } from '../utils/inquiry-reference.util';
import { formatDateTimeHeIl, formatEventDateHeIl } from '../utils/datetime.util';
import {
  formatSongStyleDisplay,
  resolveAddonLabels,
  resolveSongLengthLabel,
  resolveSubtitlesLabel,
  resolveVideoFormatLabel,
  resolveVideoLengthLabel,
  resolveVocalistLabel,
} from '../utils/inquiry-display.util';

function row(label: string, value: string | undefined | null): string {
  if (!value) return '';
  return `
    <tr>
      <td style="padding:6px 12px;color:#8a8a99;font-size:13px;white-space:nowrap;vertical-align:top;">${escapeHtml(label)}</td>
      <td style="padding:6px 12px;color:#1a1a2e;font-size:14px;">${escapeHtml(value)}</td>
    </tr>`;
}

function listRow(label: string, values: string[] | undefined): string {
  if (!values || values.length === 0) return '';
  return row(label, values.join(', '));
}

function multilineBlock(label: string, value: string | undefined | null): string {
  if (!value?.trim()) return '';
  return `
    <div style="margin-top:12px;">
      <div style="color:#8a8a99;font-size:13px;margin-bottom:6px;">${escapeHtml(label)}</div>
      <div style="padding:12px;background:#f4f4f8;border-radius:8px;color:#1a1a2e;font-size:14px;line-height:1.6;">
        ${escapeHtmlMultiline(value)}
      </div>
    </div>`;
}

function section(title: string, body: string): string {
  const trimmed = body.trim();
  if (!trimmed) return '';
  return `
    <h2 style="color:#1a1a2e;font-size:16px;margin:20px 0 8px;">${escapeHtml(title)}</h2>
    ${trimmed}`;
}

/** Builds an RTL-friendly HTML email summarizing a new inquiry for the business owner. */
export function buildInquiryEmailHtml(
  payload: InquiryInput,
  breakdown: PriceBreakdown,
  submittedAt: Date,
  inquiryId: string,
  photosBundleUrl?: string,
): string {
  const shortInquiryId = formatShortInquiryReference(inquiryId);
  const lineItemsHtml = breakdown.lineItems
    .map(
      (item) => `
      <tr>
        <td style="padding:6px 12px;color:#1a1a2e;font-size:14px;">${escapeHtml(item.labelHe)}</td>
        <td style="padding:6px 12px;color:#1a1a2e;font-size:14px;text-align:left;">₪${item.amount * item.quantity}</td>
      </tr>`,
    )
    .join('');

  const songStyleDisplay = payload.song
    ? formatSongStyleDisplay(payload.song.style, payload.song.customStyle)
    : undefined;

  const songSection = payload.song
    ? section(
        'פרטי השיר',
        `<table role="presentation" width="100%">
          ${row('סגנון', songStyleDisplay)}
          ${row('קול', resolveVocalistLabel(payload.song.vocalist))}
          ${row('מצב רוח', payload.song.mood)}
          ${row('אורך משוער', resolveSongLengthLabel(payload.song.length, payload.mainProduct))}
          ${listRow('שמות שיש לכלול', payload.song.namesToInclude)}
          ${listRow('מילים חשובות', payload.song.importantWords)}
          ${listRow('נושאים להימנע מהם', payload.song.excludedTopics)}
          ${row('שם שיר קיים', payload.song.existingSongName)}
          ${row('אמן', payload.song.existingSongArtist)}
          ${row('קישור לשיר', payload.song.existingSongLink)}
        </table>
        ${multilineBlock('הערות נוספות לשיר', payload.song.additionalNotes)}`,
      )
    : '';

  const videoSection = payload.video
    ? section(
        'פרטי הסרטון',
        `<table role="presentation" width="100%">
          ${row('אורך', resolveVideoLengthLabel(payload.video.length))}
          ${row('פורמט', resolveVideoFormatLabel(payload.video.format))}
          ${row('כתוביות', resolveSubtitlesLabel(payload.video.subtitles))}
        </table>
        ${multilineBlock('הערות לסרטון', payload.video.revisionNotes)}`,
      )
    : '';

  const addonsSection =
    payload.addons && payload.addons.length > 0
      ? section('תוספות', `<table role="presentation" width="100%">${listRow('נבחרו', resolveAddonLabels(payload.addons))}</table>`)
      : '';

  const optionalDetailsRows = [
    row('גיל', payload.projectDetails.age),
    row('קשר למזמין', payload.projectDetails.relationship),
    row('תכונות אופי', payload.projectDetails.characterTraits),
    row('תחביבים', payload.projectDetails.hobbies),
    row('מקצוע', payload.projectDetails.occupation),
    row('אנשים להזכיר', payload.projectDetails.peopleToMention),
    row('אווירה רצויה', payload.projectDetails.desiredAtmosphere),
  ].join('');

  const optionalDetailsSection =
    optionalDetailsRows.trim() || payload.projectDetails.additionalNotes?.trim()
      ? section(
          'פרטים נוספים',
          `<table role="presentation" width="100%">${optionalDetailsRows}</table>
        ${multilineBlock('מידע נוסף', payload.projectDetails.additionalNotes)}`,
        )
      : '';

  const uploadedFilesHtml =
    payload.uploadedFiles.length > 0
      ? photosBundleUrl
        ? `<p style="margin:0;">
          <a href="${escapeHtml(photosBundleUrl)}" style="display:inline-block;padding:10px 16px;background:#6d28d9;color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;">
            הורדת כל הקבצים (ZIP)
          </a>
        </p>`
        : '<p style="color:#8a8a99;font-size:13px;">לא ניתן היה ליצור קובץ ZIP. נא לפנות לתמיכה.</p>'
      : '<p style="color:#8a8a99;font-size:13px;">לא הועלו קבצים.</p>';

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
        <div style="margin:0 0 16px;padding:12px 14px;background:#f4f0ff;border:1px solid #ddd6fe;border-radius:8px;">
          <div style="color:#7c3aed;font-size:12px;font-weight:bold;letter-spacing:0.06em;">מספר הפנייה</div>
          <div style="color:#1a1a2e;font-size:22px;font-weight:bold;margin-top:4px;font-family:Consolas,Monaco,monospace;">${escapeHtml(shortInquiryId)}</div>
        </div>

        ${section(
          'פרטי לקוח',
          `<table role="presentation" width="100%">
          ${row('שם', payload.contact.name)}
          ${row('טלפון', payload.contact.phone)}
          ${row('אימייל', payload.contact.email)}
        </table>
        ${multilineBlock('הודעה מהלקוח', payload.contact.message)}`,
        )}

        ${section('סוג פרויקט', `<table role="presentation" width="100%">${row('מוצר עיקרי', MAIN_PRODUCT_LABELS[payload.mainProduct])}</table>`)}

        ${songSection}
        ${videoSection}
        ${addonsSection}

        ${section(
          'פרטי הפרויקט והסיפור',
          `<table role="presentation" width="100%">
          ${row('עבור', payload.projectDetails.personName)}
          ${row('סוג אירוע', payload.projectDetails.occasion)}
          ${row('תאריך האירוע', formatEventDateHeIl(payload.projectDetails.eventDate))}
        </table>
        ${multilineBlock('הסיפור', payload.projectDetails.story)}`,
        )}

        ${optionalDetailsSection}

        ${section(`קבצים שהועלו (${payload.uploadedFiles.length})`, uploadedFilesHtml)}

        ${section(
          'פירוט מחיר משוער (מחושב בשרת)',
          `<table role="presentation" width="100%">
          ${lineItemsHtml}
          <tr>
            <td style="padding:10px 12px;color:#1a1a2e;font-size:15px;font-weight:bold;border-top:1px solid #eee;">סה"כ משוער</td>
            <td style="padding:10px 12px;color:#1a1a2e;font-size:15px;font-weight:bold;border-top:1px solid #eee;text-align:left;">₪${breakdown.total}</td>
          </tr>
        </table>`,
        )}

        ${section(
          'אישורים',
          `<table role="presentation" width="100%">
          ${row('הרשאת שימוש בחומרים', payload.consents.mediaRights ? 'כן' : 'לא')}
          ${row('אישור חזרה', payload.consents.contactPermission ? 'כן' : 'לא')}
          ${row('אישור תקנון', payload.consents.termsAccepted ? 'כן' : 'לא')}
          ${payload.consents.musicRights !== undefined ? row('הרשאת שימוש בשיר קיים', payload.consents.musicRights ? 'כן' : 'לא') : ''}
        </table>`,
        )}

        <p style="color:#8a8a99;font-size:12px;margin-top:24px;">התקבל בתאריך ${formatDateTimeHeIl(submittedAt)}</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
