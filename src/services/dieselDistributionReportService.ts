import { generatePDF } from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import { formatDisplayDate } from '@/utils/dateUtils';

export interface DieselDistributionLineItem {
  driverName: string;
  vehicleNumber: string;
  litres: number;
}

function buildReportHtml(
  date: string,
  lineItems: DieselDistributionLineItem[],
): string {
  const dateLabel = formatDisplayDate(date);
  const totalLitres = lineItems.reduce((sum, item) => sum + item.litres, 0);

  const rows = lineItems
    .map(
      (item, index) => `
        <tr>
          <td>${index + 1}</td>
          <td class="driver-cell">${item.driverName}</td>
          <td>${item.vehicleNumber}</td>
          <td>${item.litres} L</td>
        </tr>`,
    )
    .join('');

  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: -apple-system, Helvetica, Arial, sans-serif; color: #111827; padding: 32px; }
          h1 { text-align: center; font-size: 26px; letter-spacing: 1px; margin-bottom: 4px; }
          .address { text-align: center; font-size: 13px; margin: 2px 0; }
          .date { margin-top: 20px; font-size: 15px; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          th, td { border: 1px solid #000; padding: 8px 10px; font-size: 13px; text-align: center; }
          th { background: #F5F6FA; }
          .driver-cell { text-align: left; }
          .footer-row td { font-weight: bold; text-align: center; }
        </style>
      </head>
      <body>
        <h1>SHIVAM TRANSPORT</h1>
        <div class="address">At. :- Pakauli, PO :- Rajason, Dist. :- Vaishali 844102</div>
        <div class="date">Date: ${dateLabel}</div>
        <table>
          <thead>
            <tr>
              <th>Sr. No.</th>
              <th>Driver Name</th>
              <th>Vehicle Number</th>
              <th>Litres</th>
            </tr>
          </thead>
          <tbody>
            ${
              rows.length > 0
                ? rows
                : '<tr><td colspan="4">No drivers added</td></tr>'
            }
            <tr class="footer-row">
              <td colspan="3">Total</td>
              <td>${totalLitres} L</td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  `;
}

export async function shareDieselDistributionReport(
  date: string,
  lineItems: DieselDistributionLineItem[],
): Promise<void> {
  const html = buildReportHtml(date, lineItems);
  const fileName = `Diesel_Distribution_${date}`;
  const { filePath } = await generatePDF({
    html,
    fileName,
    base64: false,
  });

  await Share.open({
    url: `file://${filePath}`,
    type: 'application/pdf',
    title: `Diesel Distribution — ${formatDisplayDate(date)}`,
    failOnCancel: false,
  });
}
