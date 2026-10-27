import { generatePDF } from 'react-native-html-to-pdf';
import { shareBillReport } from '../src/services/billReportService';
import { shareGoraulBillReport } from '../src/services/goraulBillReportService';
import { shareGoraulSummaryReport } from '../src/services/goraulSummaryReportService';
import { shareSummaryReport } from '../src/services/summaryReportService';
import { SUPPLIER_PROFILES } from '../src/types/supplier';

jest.mock('react-native-html-to-pdf', () => ({
  generatePDF: jest.fn().mockResolvedValue({ filePath: '/tmp/report.pdf' }),
}));

jest.mock('react-native-share', () => ({
  __esModule: true,
  default: { open: jest.fn().mockResolvedValue(undefined) },
}));

const mockedGeneratePDF = jest.mocked(generatePDF);

const LINE_ITEMS = [{ vehicleType: 'ACE' as const, nos: 10, ratePerTrip: 955 }];

function lastGeneratedHtml(): string {
  const call = mockedGeneratePDF.mock.calls.at(-1);
  return call?.[0].html ?? '';
}

describe('Supplier details on Hilalpur and Goraul reports', () => {
  beforeEach(() => {
    mockedGeneratePDF.mockClear();
  });

  it('prints the Ravindra Kumar Singh details on the Hilalpur bill', async () => {
    await shareBillReport('Jun-2026', LINE_ITEMS, SUPPLIER_PROFILES.ravindra);
    const html = lastGeneratedHtml();

    expect(html).toContain('RAVINDRA KUMAR SINGH');
    expect(html).toContain('9430483150');
    expect(html).toContain('6016002100003104');
    expect(html).toContain('PUNB0601600');
    expect(html).toContain('ELQPS3865C');
    expect(html).toContain('2584 7795 3161');
    expect(html).not.toContain('MR. INDUSTRIES');
    expect(html).not.toContain('6016002100004334');
    expect(html).not.toContain('NOMPS3118J');
    expect(html).not.toContain('9246 1996 0950');
  });

  it('prints the MR. Industries details on the Hilalpur bill', async () => {
    await shareBillReport(
      'Jun-2026',
      LINE_ITEMS,
      SUPPLIER_PROFILES.mrIndustries,
    );
    const html = lastGeneratedHtml();

    expect(html).toContain('MR. INDUSTRIES');
    expect(html).toContain('9430483150');
    expect(html).toContain('6016002100004334');
    expect(html).toContain('PUNB0601600');
    expect(html).toContain('NOMPS3118J');
    expect(html).toContain('9246 1996 0950');
    expect(html).not.toContain('RAVINDRA KUMAR SINGH');
    expect(html).not.toContain('6016002100003104');
    expect(html).not.toContain('ELQPS3865C');
    expect(html).not.toContain('2584 7795 3161');
  });

  it('uses the selected supplier name on the Hilalpur summary', async () => {
    await shareSummaryReport('2026-06', [], SUPPLIER_PROFILES.ravindra);
    const ravindraHtml = lastGeneratedHtml();
    await shareSummaryReport('2026-06', [], SUPPLIER_PROFILES.mrIndustries);
    const mrIndustriesHtml = lastGeneratedHtml();

    expect(ravindraHtml).toContain('RAVINDRA KUMAR SINGH');
    expect(ravindraHtml).not.toContain('MR. INDUSTRIES');
    expect(mrIndustriesHtml).toContain('MR. INDUSTRIES');
    expect(mrIndustriesHtml).not.toContain('RAVINDRA KUMAR SINGH');
    expect(mrIndustriesHtml).not.toContain('6016002100');
  });

  it('keeps the existing Goraul bill details for Minni Kumari', async () => {
    await shareGoraulBillReport(
      'Jun-2026',
      LINE_ITEMS,
      SUPPLIER_PROFILES.minni,
    );
    const html = lastGeneratedHtml();

    expect(html).toContain('MINNI KUMARI');
    expect(html).toContain('9430483150');
    expect(html).toContain('6016002100003089');
    expect(html).toContain('CKLPK4604F');
    expect(html).toContain('799595576883');
    expect(html).not.toContain('RAVINDRA KUMAR SINGH');
    expect(html).not.toContain('6016002100003104');
  });

  it('prints the Ravindra Kumar Singh details on the Goraul bill', async () => {
    await shareGoraulBillReport(
      'Jun-2026',
      LINE_ITEMS,
      SUPPLIER_PROFILES.ravindra,
    );
    const html = lastGeneratedHtml();

    expect(html).toContain('RAVINDRA KUMAR SINGH');
    expect(html).toContain('6016002100003104');
    expect(html).toContain('ELQPS3865C');
    expect(html).toContain('mona bisanpur, patedi belsar');
    expect(html).not.toContain('MINNI KUMARI');
    expect(html).not.toContain('6016002100003089');
    expect(html).not.toContain('CKLPK4604F');
  });

  it('uses the selected supplier title on the Goraul summary', async () => {
    await shareGoraulSummaryReport('2026-06', [], SUPPLIER_PROFILES.minni);
    const minniHtml = lastGeneratedHtml();
    await shareGoraulSummaryReport('2026-06', [], SUPPLIER_PROFILES.ravindra);
    const ravindraHtml = lastGeneratedHtml();

    expect(minniHtml).toContain('Mini TRANSPORT');
    expect(minniHtml).not.toContain('RAVINDRA KUMAR SINGH');
    expect(ravindraHtml).toContain('RAVINDRA KUMAR SINGH');
    expect(ravindraHtml).not.toContain('Mini TRANSPORT');
    expect(ravindraHtml).toContain('Mona Bisanpur Patedi Belsar');
  });

  it('prints the MR. Industries details on the Goraul bill', async () => {
    await shareGoraulBillReport(
      'Jun-2026',
      LINE_ITEMS,
      SUPPLIER_PROFILES.mrIndustries,
    );
    const html = lastGeneratedHtml();

    expect(html).toContain('MR. INDUSTRIES');
    expect(html).toContain('6016002100004334');
    expect(html).toContain('NOMPS3118J');
    expect(html).toContain('9246 1996 0950');
    expect(html).toContain('PUNB0601600');
    expect(html).toContain('mona bisanpur, patedi belsar');
    expect(html).not.toContain('MINNI KUMARI');
    expect(html).not.toContain('6016002100003089');
    expect(html).not.toContain('RAVINDRA KUMAR SINGH');
  });

  it('prints MR. INDUSTRIES as the Goraul summary title', async () => {
    await shareGoraulSummaryReport(
      '2026-06',
      [],
      SUPPLIER_PROFILES.mrIndustries,
    );
    const html = lastGeneratedHtml();

    expect(html).toContain('MR. INDUSTRIES');
    expect(html).toContain('Mona Bisanpur Patedi Belsar');
    expect(html).not.toContain('Mini TRANSPORT');
    expect(html).not.toContain('RAVINDRA KUMAR SINGH');
  });
});
