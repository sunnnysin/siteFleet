import { generatePDF } from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import { computePumpEntriesTotals } from '@/services/pumpEntryService';
import { formatCurrency } from '@/utils/currencyUtils';
import { formatDisplayDate } from '@/utils/dateUtils';
import type { PumpEntry } from '@/types/pumpEntry';

function buildReportHtml(monthLabel: string, entries: PumpEntry[]): string {
  const { totalLitres, totalCost } = computePumpEntriesTotals(entries);
  const sortedEntries = [...entries].sort((first, second) =>
    first.date.localeCompare(second.date),
  );

  const rows = sortedEntries
    .map(
      entry => `
        <tr>
          <td>${formatDisplayDate(entry.date)}</td>
          <td>${entry.litres} L</td>
          <td>${formatCurrency(entry.pricePerLitre)}</td>
          <td>${formatCurrency(entry.totalCost)}</td>
        </tr>`,
    )
    .join('');

  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: -apple-system, Helvetica, Arial, sans-serif; color: #111827; padding: 24px; }
          h1 { font-size: 20px; margin-bottom: 4px; }
          h2 { font-size: 14px; color: #6B7280; font-weight: normal; margin-top: 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          th, td { border: 1px solid #E5E7EB; padding: 6px 8px; font-size: 12px; text-align: left; }
          th { background: #F5F6FA; }
          .summary { margin-top: 20px; font-size: 13px; }
          .summary div { margin-bottom: 4px; }
          .summary strong { display: inline-block; width: 160px; }
        </style>
      </head>
      <body>
        <h1>Diesel Pump Report</h1>
        <h2>${monthLabel}</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Fuel taken</th>
              <th>Price / litre</th>
              <th>Cost</th>
            </tr>
          </thead>
          <tbody>
            ${
              rows.length > 0
                ? rows
                : '<tr><td colspan="4">No entries for this month</td></tr>'
            }
          </tbody>
        </table>
        <div class="summary">
          <div><strong>Total fuel taken:</strong> ${totalLitres} L</div>
          <div><strong>Grand total:</strong> ${formatCurrency(totalCost)}</div>
        </div>
      </body>
    </html>
  `;
}

export async function sharePumpMonthlyReport(
  monthLabel: string,
  entries: PumpEntry[],
): Promise<void> {
  const html = buildReportHtml(monthLabel, entries);
  const fileName = `Diesel_Pump_${monthLabel.replace(/\s+/g, '_')}`;
  const { filePath } = await generatePDF({
    html,
    fileName,
    base64: false,
  });

  await Share.open({
    url: `file://${filePath}`,
    type: 'application/pdf',
    title: `Diesel Pump — ${monthLabel} report`,
    failOnCancel: false,
  });
}
