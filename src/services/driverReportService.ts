import { generatePDF } from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import {
  computeEffectiveDriverPay,
  computeEffectiveFuelCost,
} from '@/services/dailyEntryService';
import { formatCurrency } from '@/utils/currencyUtils';
import { formatDisplayDate } from '@/utils/dateUtils';
import type { Driver } from '@/types/driver';
import type { DailyEntry } from '@/types/dailyEntry';

function buildReportHtml(
  driver: Driver,
  routeLabel: string,
  monthLabel: string,
  entries: DailyEntry[],
): string {
  const daysPresent = entries.filter(
    entry => entry.attendance === 'present',
  ).length;
  const totalFuelCost = entries.reduce(
    (sum, entry) => sum + computeEffectiveFuelCost(entry),
    0,
  );
  const totalDriverPay = entries.reduce(
    (sum, entry) => sum + computeEffectiveDriverPay(entry),
    0,
  );
  const totalUnpaid = entries
    .filter(entry => entry.paymentStatus === 'unpaid')
    .reduce((sum, entry) => sum + computeEffectiveDriverPay(entry), 0);

  const rows = entries
    .map(
      entry => `
        <tr>
          <td>${formatDisplayDate(entry.date)}</td>
          <td>${entry.attendance === 'present' ? 'Present' : 'Absent'}</td>
          <td>${entry.route}</td>
          <td>${entry.vehicleType} · ${entry.vehicleNumber}</td>
          <td>${entry.fuelLitres} L</td>
          <td>${formatCurrency(computeEffectiveFuelCost(entry))}</td>
          <td>${formatCurrency(computeEffectiveDriverPay(entry))}</td>
          <td>${
            entry.settlementType === 'sameDay' ? 'Same-day' : 'Monthly'
          }</td>
          <td>${entry.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}</td>
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
          .meta { margin: 16px 0; font-size: 13px; }
          .meta span { display: inline-block; width: 50%; margin-bottom: 6px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          th, td { border: 1px solid #E5E7EB; padding: 6px 8px; font-size: 11px; text-align: left; }
          th { background: #F5F6FA; }
          .summary { margin-top: 20px; font-size: 13px; }
          .summary div { margin-bottom: 4px; }
          .summary strong { display: inline-block; width: 220px; }
        </style>
      </head>
      <body>
        <h1>${driver.name}</h1>
        <h2>${monthLabel} · Driver Report</h2>
        <div class="meta">
          <span><strong>Phone:</strong> ${driver.phone}</span>
          <span><strong>Vehicle:</strong> ${driver.vehicleType} · ${
    driver.vehicleNumber
  }</span>
          <span><strong>Route:</strong> ${routeLabel}</span>
          <span><strong>Rate per day:</strong> ${formatCurrency(
            driver.dailyRate,
          )}</span>
          <span><strong>Type:</strong> ${
            driver.driverType === 'permanent' ? 'Permanent' : 'Replacement'
          }</span>
          <span><strong>UPI ID:</strong> ${
            driver.upiId.length > 0 ? driver.upiId : '-'
          }</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Attendance</th>
              <th>Route</th>
              <th>Vehicle</th>
              <th>Fuel</th>
              <th>Fuel cost</th>
              <th>Driver pay</th>
              <th>Settlement</th>
              <th>Payment</th>
            </tr>
          </thead>
          <tbody>
            ${
              rows.length > 0
                ? rows
                : '<tr><td colspan="9">No entries for this month</td></tr>'
            }
          </tbody>
        </table>
        <div class="summary">
          <div><strong>Days present:</strong> ${daysPresent}</div>
          <div><strong>Total fuel cost:</strong> ${formatCurrency(
            totalFuelCost,
          )}</div>
          <div><strong>Total driver pay:</strong> ${formatCurrency(
            totalDriverPay,
          )}</div>
          <div><strong>Unpaid amount:</strong> ${formatCurrency(
            totalUnpaid,
          )}</div>
        </div>
      </body>
    </html>
  `;
}

export async function shareDriverMonthlyReport(
  driver: Driver,
  routeLabel: string,
  monthLabel: string,
  entries: DailyEntry[],
): Promise<void> {
  const html = buildReportHtml(driver, routeLabel, monthLabel, entries);
  const fileName = `${driver.name.replace(/\s+/g, '_')}_${monthLabel.replace(
    /\s+/g,
    '_',
  )}`;
  const { filePath } = await generatePDF({
    html,
    fileName,
    base64: false,
  });

  await Share.open({
    url: `file://${filePath}`,
    type: 'application/pdf',
    title: `${driver.name} — ${monthLabel} report`,
    failOnCancel: false,
  });
}
