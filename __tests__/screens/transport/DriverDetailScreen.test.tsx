import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DriverDetailScreen } from '@/screens/transport/DriverDetailScreen';
import type { TransportStackParamList } from '@/navigation/types';
import {
  createNavigationMock,
  createRouteMock,
  renderScreen,
  treeContainsText,
} from '../testUtils';

type Props = NativeStackScreenProps<TransportStackParamList, 'DriverDetail'>;

jest.mock('@/services/driverService', () => ({
  deleteDriver: jest.fn(),
  fetchDriverById: jest.fn().mockResolvedValue({
    id: 'driver-1',
    ownerId: 'owner-1',
    name: 'Ravi Kumar',
    phone: '9876543210',
    upiId: '',
    vehicleNumber: '1234',
    vehicleType: 'ACE',
    routeId: '',
    dailyRate: 500,
    driverType: 'permanent',
    createdAt: '2026-01-01T00:00:00.000Z',
    isActive: true,
  }),
}));

jest.mock('@/services/dailyEntryService', () => ({
  computeDriverFuelBalance: jest.fn().mockReturnValue(0),
  fetchDailyEntriesForDriverAndMonth: jest.fn().mockResolvedValue([]),
}));

jest.mock('@/services/driverAdvanceService', () => ({
  computeTotalAdvance: jest.fn().mockReturnValue(0),
  fetchDriverAdvancesForMonth: jest.fn().mockResolvedValue([]),
}));

jest.mock('@/services/routeService', () => ({
  fetchRouteById: jest.fn().mockResolvedValue(null),
}));

jest.mock('@/services/driverReportService', () => ({
  shareDriverMonthlyReport: jest.fn(),
}));

jest.mock('@/services/paymentService', () => ({
  computeMonthlyPayments: jest.fn().mockResolvedValue([]),
}));

describe('DriverDetailScreen', () => {
  it('renders without throwing and shows the monthly history section', async () => {
    const renderer = await renderScreen(
      <DriverDetailScreen
        navigation={
          createNavigationMock() as unknown as Props['navigation']
        }
        route={
          createRouteMock({ driverId: 'driver-1' }) as unknown as Props['route']
        }
      />,
    );

    expect(treeContainsText(renderer, 'Monthly history')).toBe(true);
  });
});
