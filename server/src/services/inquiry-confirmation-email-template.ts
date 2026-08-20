import { escapeHtml } from '../utils/html-escape';

export interface InquiryConfirmationEmailContent {
  subject: string;
  html: string;
  text: string;
}

export function buildInquiryConfirmationEmail(params: {
  customerName: string;
  inquiryId: string;
}): InquiryConfirmationEmailContent {
  const shortId = params.inquiryId.slice(0, 8);
  const safeName = escapeHtml(params.customerName);
  const safeShortId = escapeHtml(shortId);
  const subject = `אישור קבלת בקשה · מס' ${shortId}`;

  const bodyLines = [
    `שלום ${params.customerName},`,
    '',
    'קיבלנו את הבקשה שלכם עם כל הפרטים והחומרים.',
    'נחזור אליכם בהקדם האפשרי לאישור סופי ולתיאום המשך.',
    '',
    `מספר הפנייה: ${shortId}`,
    '',
    'מה קורה עכשיו?',
    '1. נעבור על הפרטים והחומרים ששלחתם',
    '2. נחזור אליכם לאישור סופי ותיאום',
    '3. לאחר אישור — מתחילים ליצור',
    '',
    'שימו לב: שליחת הבקשה אינה מהווה תחילת עבודה בפועל, ולא בוצע כל תשלום בשלב זה.',
    '',
    'לשאלות או לשליחת תמונות וחומרים נוספים — השיבו למייל זה עם מספר הפנייה.',
    '',
    'בברכה,',
    'YERUSHALMI.AI',
  ];

  const text = bodyLines.join('\n');

  const html = `<!doctype html>
<html lang="he" dir="rtl">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="color-scheme" content="light" />
<title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#eef1f8;font-family:Arial,Helvetica,sans-serif;direction:rtl;-webkit-text-size-adjust:100%;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef1f8;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e4e8f2;">
          <tr>
            <td style="height:4px;background:#6366f1;font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="background:#0c1228;padding:28px 32px 24px;text-align:center;">
              <div style="font-size:22px;font-weight:bold;letter-spacing:0.04em;color:#ffffff;">YERUSHALMI.AI</div>
              <div style="margin-top:8px;font-size:14px;color:#b4bdd4;">אישור קבלת בקשה</div>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 32px 8px;text-align:center;">
              <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:0 auto 20px;">
                <tr>
                  <td align="center" width="56" height="56" style="width:56px;height:56px;border-radius:28px;background:#ecfdf5;color:#059669;font-size:28px;line-height:56px;font-weight:bold;">
                    &#10003;
                  </td>
                </tr>
              </table>
              <h1 style="margin:0 0 12px;font-size:22px;line-height:1.35;color:#101832;font-weight:bold;">הבקשה התקבלה בהצלחה</h1>
              <p style="margin:0;font-size:16px;line-height:1.7;color:#4b5568;">שלום ${safeName},<br />קיבלנו את הבקשה שלכם עם כל הפרטים והחומרים.<br />נחזור אליכם בהקדם האפשרי לאישור סופי ולתיאום המשך.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 32px 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:12px;">
                <tr>
                  <td style="padding:18px 20px;text-align:center;">
                    <div style="font-size:12px;font-weight:bold;letter-spacing:0.08em;text-transform:uppercase;color:#7c3aed;">מספר הפנייה</div>
                    <div style="margin-top:8px;font-size:28px;line-height:1.2;font-weight:bold;letter-spacing:0.12em;color:#1e1b4b;font-family:Consolas,'Courier New',monospace;">${safeShortId}</div>
                    <div style="margin-top:6px;font-size:13px;color:#6b7280;">שמרו מספר זה לכל התכתבות המשך</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 24px;">
              <h2 style="margin:0 0 14px;font-size:16px;color:#101832;font-weight:bold;">מה קורה עכשיו?</h2>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #eef1f8;">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="28" valign="top" style="width:28px;padding-left:12px;font-size:14px;font-weight:bold;color:#6366f1;">1</td>
                        <td style="font-size:15px;line-height:1.6;color:#374151;">נעבור על הפרטים והחומרים ששלחתם</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #eef1f8;">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="28" valign="top" style="width:28px;padding-left:12px;font-size:14px;font-weight:bold;color:#6366f1;">2</td>
                        <td style="font-size:15px;line-height:1.6;color:#374151;">נחזור אליכם לאישור סופי ותיאום</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="28" valign="top" style="width:28px;padding-left:12px;font-size:14px;font-weight:bold;color:#6366f1;">3</td>
                        <td style="font-size:15px;line-height:1.6;color:#374151;">לאחר אישור — מתחילים ליצור</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;">
                <tr>
                  <td style="padding:14px 16px;font-size:14px;line-height:1.65;color:#92400e;">
                    <strong style="display:block;margin-bottom:4px;">שימו לב</strong>
                    שליחת הבקשה אינה מהווה תחילת עבודה בפועל, ולא בוצע כל תשלום בשלב זה.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;">
                <tr>
                  <td style="padding:16px 18px;">
                    <div style="font-size:14px;font-weight:bold;color:#101832;margin-bottom:8px;">צריכים עזרה?</div>
                    <p style="margin:0;font-size:14px;line-height:1.65;color:#4b5568;">לשאלות או לשליחת תמונות וחומרים נוספים — השיבו למייל זה עם מספר הפנייה.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px 28px;border-top:1px solid #eef1f8;text-align:center;background:#fafbfd;">
              <a href="https://yerushalmi.ai" style="font-size:14px;font-weight:bold;color:#6366f1;text-decoration:none;">YERUSHALMI.AI</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, html, text };
}
