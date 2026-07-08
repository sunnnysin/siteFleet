import { generatePDF } from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import { format } from 'date-fns';
import { VEHICLE_TYPES, type VehicleType } from '@/types/driver';
import { parseDateKey, parseMonthKey } from '@/utils/dateUtils';
import type { DailyVehicleTypeCounts } from '@/services/vehicleSummaryService';

const VEHICLE_TYPE_SUMMARY_LABELS: Record<VehicleType, string> = {
  ACE: 'ACE',
  'Bolero/PickUp': 'Bolero/PickUp',
};

function formatSummaryDate(dateKey: string): string {
  return format(parseDateKey(dateKey), 'dd/MM/yyyy');
}

function formatCount(count: number): string {
  return String(count).padStart(2, '0');
}

function buildReportHtml(
  monthKey: string,
  dailyCounts: DailyVehicleTypeCounts[],
): string {
  const monthLabel = format(parseMonthKey(monthKey), 'MMMM-yyyy');

  const rows = dailyCounts
    .map(
      day => `
        <tr>
          <td>${formatSummaryDate(day.date)}</td>
          ${VEHICLE_TYPES.map(
            vehicleType => `<td>${formatCount(day.counts[vehicleType])}</td>`,
          ).join('')}
          <td class="total-cell">${formatCount(day.total)}</td>
        </tr>`,
    )
    .join('');

  const grandTotals = VEHICLE_TYPES.map(vehicleType =>
    dailyCounts.reduce((sum, day) => sum + day.counts[vehicleType], 0),
  );
  const grandTotal = dailyCounts.reduce((sum, day) => sum + day.total, 0);

  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: -apple-system, Helvetica, Arial, sans-serif; color: #111827; padding: 32px; }
          h1 { text-align: center; font-size: 28px; letter-spacing: 1px; margin-bottom: 4px; }
          .address { text-align: center; font-size: 13px; margin: 2px 0; }
          .meta-row { display: flex; justify-content: space-between; margin-top: 20px; font-size: 14px; }
          .meta-row strong { font-size: 15px; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          th, td { border: 1px solid #000; padding: 8px 10px; font-size: 13px; text-align: center; }
          th { background: #F5F6FA; }
          .total-cell { font-weight: bold; }
          .footer-row td { font-weight: bold; }
          .signature { display: flex; justify-content: space-between; margin-top: 96px; font-size: 13px; text-align: center; }
        </style>
      </head>
      <body>
        <h1>SHIVAM TRANSPORT</h1>
        <div class="address">At. :- Pakauli, PO :- Rajason, Dist. :- Vaishali 844102</div>
        <div class="address">To :- EKTA SHAKTI FOUNDATION (Regd.)</div>
        <div class="address">Hilalpur Hajipur Vaishali, pin-844102</div>

        <div class="meta-row">
          <span>Block Hilalpur Hajipur , Vaishali</span>
          <span>Month :-<strong>${monthLabel}</strong></span>
        </div>

        <table>
          <thead>
            <tr>
              <th>DATE</th>
              ${VEHICLE_TYPES.map(
                vehicleType =>
                  `<th>${VEHICLE_TYPE_SUMMARY_LABELS[vehicleType]}</th>`,
              ).join('')}
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${
              rows.length > 0
                ? rows
                : `<tr><td colspan="${
                    VEHICLE_TYPES.length + 2
                  }">No entries for this month</td></tr>`
            }
            <tr class="footer-row">
              <td>Total Vehicle</td>
              ${grandTotals.map(total => `<td>${total}</td>`).join('')}
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

export async function shareSummaryReport(
  monthKey: string,
  dailyCounts: DailyVehicleTypeCounts[],
): Promise<void> {
  const html = buildReportHtml(monthKey, dailyCounts);
  const monthLabel = format(parseMonthKey(monthKey), 'MMMM_yyyy');
  const fileName = `Summary_${monthLabel}`;
  const { filePath } = await generatePDF({
    html,
    fileName,
    base64: false,
  });

  await Share.open({
    url: `file://${filePath}`,
    type: 'application/pdf',
    title: `Vehicle Summary — ${monthLabel}`,
    failOnCancel: false,
  });
}
