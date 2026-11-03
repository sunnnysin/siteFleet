import { Image, Linking } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { generatePDF } from 'react-native-html-to-pdf';
import { DriverDetailCard } from '../src/components/DriverDetailCard';
import { DriverListItem } from '../src/components/DriverListItem';
import { shareDriverMonthlyReport } from '../src/services/driverReportService';
import {
  driverFormSchema,
  hasDriverPhone,
  type Driver,
} from '../src/types/driver';
import { treeContainsText } from './screens/testUtils';

jest.mock('react-native-html-to-pdf', () => ({
  generatePDF: jest.fn().mockResolvedValue({ filePath: '/tmp/report.pdf' }),
}));

jest.mock('react-native-share', () => ({
  __esModule: true,
  default: { open: jest.fn().mockResolvedValue(undefined) },
}));

const BASE_FORM_VALUES = {
  name: 'Ravi Kumar',
  phone: '',
  upiId: '',
  vehicleNumber: '1234',
  vehicleType: 'ACE' as const,
  routeId: 'route-1',
  dailyRate: '400',
  driverType: 'permanent' as const,
};

function buildDriver(phone: string): Driver {
  return {
    id: 'driver-1',
    ownerId: 'owner-1',
    name: 'Ravi Kumar',
    phone,
    upiId: '',
    vehicleNumber: '1234',
    vehicleType: 'ACE',
    routeId: 'route-1',
    dailyRate: 400,
    driverType: 'permanent',
    createdAt: '2026-01-01T00:00:00.000Z',
    isActive: true,
  };
}

const BALANCE = {
  totalSalary: 0,
  fuelDeduction: { extraLitres: 0, ratePerLitre: 0, amount: 0 },
  advanceTotal: 0,
  paidTotal: 0,
  carriedForward: 0,
  remaining: 0,
  isFullyPaid: false,
};

function renderCard(driver: Driver): ReactTestRenderer.ReactTestRenderer {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
  ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(
      <DriverDetailCard
        driver={driver}
        routeLabel="Route 1"
        monthlyFuelTaken={0}
        fuelBalance={0}
        advanceMoney={0}
        balance={BALANCE}
        onEdit={() => {}}
      />,
    );
  });
  return renderer as ReactTestRenderer.ReactTestRenderer;
}

async function generateReportHtml(driver: Driver): Promise<string> {
  await shareDriverMonthlyReport(
    driver,
    'Route 1',
    'June 2026',
    [],
    0,
    0,
    null,
    [],
    BALANCE,
  );
  const call = jest.mocked(generatePDF).mock.calls.at(-1);
  return call?.[0].html ?? '';
}

describe('optional driver phone number', () => {
  it('accepts a blank phone and still validates a filled one', () => {
    expect(driverFormSchema.safeParse(BASE_FORM_VALUES).success).toBe(true);
    expect(
      driverFormSchema.safeParse({ ...BASE_FORM_VALUES, phone: '   ' }).success,
    ).toBe(true);
    expect(
      driverFormSchema.safeParse({ ...BASE_FORM_VALUES, phone: '9876543210' })
        .success,
    ).toBe(true);
    expect(
      driverFormSchema.safeParse({ ...BASE_FORM_VALUES, phone: '12345' })
        .success,
    ).toBe(false);
  });

  it('treats an empty phone as not added', () => {
    expect(hasDriverPhone(buildDriver(''))).toBe(false);
    expect(hasDriverPhone(buildDriver('  '))).toBe(false);
    expect(hasDriverPhone(buildDriver('9876543210'))).toBe(true);
  });

  it('shows the phone row on the driver card only when a phone exists', () => {
    expect(
      treeContainsText(renderCard(buildDriver('9876543210')), 'Phone'),
    ).toBe(true);
    expect(treeContainsText(renderCard(buildDriver('')), 'Phone')).toBe(false);
  });

  it('shows the call button on the list item only when a phone exists', () => {
    const openUrl = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    const renderItem = (driver: Driver) => {
      let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
      ReactTestRenderer.act(() => {
        renderer = ReactTestRenderer.create(
          <DriverListItem
            driver={driver}
            routeName="Route 1"
            fuelBalance={0}
            onPress={() => {}}
            onToggleActive={() => {}}
          />,
        );
      });
      return renderer as ReactTestRenderer.ReactTestRenderer;
    };

    expect(
      renderItem(buildDriver('9876543210')).root.findAllByType(Image),
    ).toHaveLength(1);
    expect(renderItem(buildDriver('')).root.findAllByType(Image)).toHaveLength(
      0,
    );
    openUrl.mockRestore();
  });

  it('prints the phone in the report only when a phone exists', async () => {
    expect(await generateReportHtml(buildDriver('9876543210'))).toContain(
      'Phone:',
    );
    expect(await generateReportHtml(buildDriver(''))).not.toContain('Phone:');
  });
});
