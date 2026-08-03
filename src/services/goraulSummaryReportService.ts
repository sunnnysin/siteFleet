import { generatePDF } from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import { format } from 'date-fns';
import { parseDateKey, parseMonthKey } from '@/utils/dateUtils';
import type { GoraulSummaryEntry } from '@/types/goraulSummary';

function formatSummaryDate(dateKey: string): string {
  return format(parseDateKey(dateKey), 'dd/MM/yyyy');
}

function formatCount(count: number): string {
  return String(count).padStart(2, '0');
}

function buildReportHtml(
  monthKey: string,
  entries: GoraulSummaryEntry[],
): string {
  const monthLabel = format(parseMonthKey(monthKey), 'MMMM-yyyy');

  const rows = entries
    .map(
      entry => `
        <tr>
          <td>${formatSummaryDate(entry.date)}</td>
          <td>${formatCount(entry.ace)}</td>
          <td>${formatCount(entry.bolero)}</td>
          <td class="total-cell">${formatCount(entry.ace + entry.bolero)}</td>
        </tr>`,
    )
    .join('');

  const grandAce = entries.reduce((sum, entry) => sum + entry.ace, 0);
  const grandBolero = entries.reduce((sum, entry) => sum + entry.bolero, 0);
  const grandTotal = grandAce + grandBolero;

  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: -apple-system, Helvetica, Arial, sans-serif; color: #111827; padding: 20px; }
          h1 { text-align: center; font-size: 24px; letter-spacing: 1px; margin-bottom: 4px; }
          .address { text-align: center; font-size: 12px; margin: 1px 0; letter-spacing: 0.3px; }
          .meta-row { display: flex; justify-content: space-between; margin-top: 30px; font-size: 13px; }
          .meta-row strong { font-size: 14px; }
          table { width: 100%; table-layout: fixed; border-collapse: collapse; margin-top: 8px; }
          th, td { border: 1px solid #000; padding: 4px 8px; font-size: 12px; text-align: center; }
          th:nth-child(1), td:nth-child(1),
          th:nth-child(2), td:nth-child(2),
          th:nth-child(3), td:nth-child(3) { width: 27%; }
          th:nth-child(4), td:nth-child(4) { width: 19%; }
          th { background: #F5F6FA; }
          .total-cell { font-weight: bold; }
          .footer-row td { font-weight: bold; }
          .signature { display: flex; justify-content: space-between; margin-top: 86px; font-size: 12px; text-align: center; }
        </style>
      </head>
      <body>
        <h1>Mini TRANSPORT</h1>
        <div class="address">At. :- Pakauli, PO :- Rajason, Dist. :- Vaishali 844102</div>
        <div class="address">To :- EKTA SHAKTI FOUNDATION (Regd.)</div>
        <div class="address">Mona Bisanpur Patedi Belsar, Belsar Vaishali, pin-844118</div>

        <div class="meta-row">
          <span>Block :- Mona Bisanpur, Patedi Belsar, Vaishali</span>
          <span>Month :-<strong>${monthLabel}</strong></span>
        </div>

        <table>
          <thead>
            <tr>
              <th>DATE</th>
              <th>ACE</th>
              <th>Bolero/PickUp</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${
              rows.length > 0
                ? rows
                : `<tr><td colspan="4">No entries for this month</td></tr>`
            }
            <tr class="footer-row">
              <td>Total Vehicles</td>
              <td>${grandAce}</td>
              <td>${grandBolero}</td>
              <td>${grandTotal}</td>
            </tr>
          </tbody>
        </table>

        <div class="signature">
          <div>
            <div>SIGNATURE.</div>
            <div>KICHEN -IN-CHARGE.</div>
          </div>
          <div>
            <div>SIGNATURE</div>
            <div>TRANSPORT AUTHORITY</div>
          </div>
        </div>
      </body>
    </html>
  `;
}

export async function shareGoraulSummaryReport(
  monthKey: string,
  entries: GoraulSummaryEntry[],
): Promise<void> {
  const html = buildReportHtml(monthKey, entries);
  const monthLabel = format(parseMonthKey(monthKey), 'MMMM_yyyy');
  const fileName = `GoraulSummary_${monthLabel}`;
  const { filePath } = await generatePDF({
    html,
    fileName,
    base64: false,
  });

  await Share.open({
    url: `file://${filePath}`,
    type: 'application/pdf',
    title: `Goraul Summary — ${monthLabel}`,
    failOnCancel: false,
  });
}
