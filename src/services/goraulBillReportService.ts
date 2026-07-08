import { generatePDF } from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import type { VehicleType } from '@/types/driver';

const GORAUL_VEHICLE_TYPE_BILL_LABELS: Record<VehicleType, string> = {
  ACE: 'ACE',
  'Bolero/PickUp': 'BOLERO - PICK UP',
};

function formatBillAmount(amount: number): string {
  return amount.toFixed(2);
}

export interface GoraulBillLineItem {
  vehicleType: VehicleType;
  nos: number;
  ratePerTrip: number;
}

function buildReportHtml(
  monthLabel: string,
  lineItems: GoraulBillLineItem[],
): string {
  const rows = lineItems
    .map(item => {
      const amount = item.nos * item.ratePerTrip;
      return `
        <tr>
          <td>${GORAUL_VEHICLE_TYPE_BILL_LABELS[item.vehicleType]}</td>
          <td class="center">${item.nos}</td>
          <td class="center">${formatBillAmount(item.ratePerTrip)}</td>
          <td class="center"><strong>${formatBillAmount(amount)}</strong></td>
        </tr>`;
    })
    .join('');

  const totalAmount = lineItems.reduce(
    (sum, item) => sum + item.nos * item.ratePerTrip,
    0,
  );

  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: -apple-system, Helvetica, Arial, sans-serif; color: #111827; padding: 32px; }
          .mobile { text-align: right; font-weight: bold; }
          .title { text-align: center; font-size: 16px; margin-top: -8px; }
          .name { text-align: center; font-size: 24px; font-weight: bold; margin-top: 24px; margin-bottom: 4px; }
          .address { text-align: center; font-size: 13px; margin: 2px 0; }
          .meta { margin-top: 32px; font-size: 13px; }
          .meta-row { display: flex; margin-bottom: 4px; }
          .meta-label { width: 140px; }
          .month { text-align: right; margin-top: 24px; font-size: 14px; }
          .month strong { font-size: 15px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          th, td { border: 1px solid #000; padding: 10px 12px; font-size: 13px; }
          th { background: #F5F6FA; text-align: center; }
          td.center { text-align: center; }
          .signature { margin-top: 96px; text-align: right; font-size: 13px; }
        </style>
      </head>
      <body>
        <div class="mobile">Mob:- 9430483150</div>
        <div class="title">BILL</div>
        <div class="name">MINNI KUMARI</div>
        <div class="address">At:- Pakauli, PO:- Rajason, Vaishali, pin-844102</div>
        <div class="address">All Type of Vehicle Supplier.</div>

        <div class="meta">
          <div class="meta-row"><span class="meta-label">Party Name:-</span><span>Ekta Shakti Foundation (Regd.)</span></div>
          <div class="meta-row"><span class="meta-label">Address:-</span><span>mona bisanpur, patedi belsar</span></div>
          <div class="meta-row"><span class="meta-label"></span><span>Vaishali, pin-844118</span></div>
        </div>

        <div class="meta">
          <div class="meta-row"><span class="meta-label">Account Details:-</span></div>
          <div class="meta-row"><span class="meta-label">Account Number:-</span><span>6016002100003089</span></div>
          <div class="meta-row"><span class="meta-label">IFSC Code:-</span><span>PUNB0601600</span></div>
          <div class="meta-row"><span class="meta-label">PAN NO.:-</span><span>CKLPK4604F</span></div>
          <div class="meta-row"><span class="meta-label">Aadhar No.:-</span><span>799595576883</span></div>
        </div>

        <div class="month">Month:-<strong>${monthLabel}</strong></div>

        <table>
          <thead>
            <tr>
              <th>Particulars</th>
              <th>Nos.</th>
              <th>Rate</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
            <tr>
              <td colspan="3"><strong>TOTAL AMOUNT</strong></td>
              <td class="center"><strong>${formatBillAmount(
                totalAmount,
              )}</strong></td>
            </tr>
          </tbody>
        </table>

        <div class="signature">
          <div>Signature Of Proprietor</div>
          <div>Transport Authority</div>
        </div>
      </body>
    </html>
  `;
}

export async function shareGoraulBillReport(
  monthLabel: string,
  lineItems: GoraulBillLineItem[],
): Promise<void> {
  const html = buildReportHtml(monthLabel, lineItems);
  const fileName = `GoraulBill_${monthLabel.replace(/[\s-]+/g, '_')}`;
  const { filePath } = await generatePDF({
    html,
    fileName,
    base64: false,
  });

  await Share.open({
    url: `file://${filePath}`,
    type: 'application/pdf',
    title: `Goraul Bill — ${monthLabel}`,
    failOnCancel: false,
  });
}

export { GORAUL_VEHICLE_TYPE_BILL_LABELS };
