import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DashboardScreen } from '@/screens/DashboardScreen';
import type { TransportStackParamList } from '@/navigation/types';
import {
  createNavigationMock,
  createRouteMock,
  renderScreen,
  treeContainsText,
} from './testUtils';

type Props = NativeStackScreenProps<TransportStackParamList, 'Dashboard'>;

jest.mock('@/services/dailyEntryService', () => ({
  fetchDailyEntriesForDate: jest.fn().mockResolvedValue([]),
  fetchDailyEntriesForMonth: jest.fn().mockResolvedValue([]),
  computeEffectiveFuelCost: jest.fn().mockReturnValue(0),
}));

jest.mock('@/services/fuelPriceService', () => ({
  fetchFuelPriceForDate: jest.fn().mockResolvedValue(null),
}));

jest.mock('@/services/paymentService', () => ({
  computeMonthlyPayments: jest.fn().mockResolvedValue([]),
}));

jest.mock('@/services/driverService', () => ({
  fetchDrivers: jest.fn().mockResolvedValue([]),
}));

jest.mock('@/services/vehicleSummaryService', () => ({
  computeVehicleTypeTotalsForMonth: jest
    .fn()
    .mockReturnValue({ ACE: 0, 'Bolero/PickUp': 0 }),
}));

jest.mock('@/services/vehicleRateService', () => ({
  fetchVehicleRates: jest.fn().mockResolvedValue([]),
  buildVehicleRateMap: jest
    .fn()
    .mockReturnValue({ ACE: 955, 'Bolero/PickUp': 1000 }),
}));

describe('DashboardScreen', () => {
  it('renders without throwing and shows the nav sections', async () => {
    const renderer = await renderScreen(
      <DashboardScreen
        navigation={
          createNavigationMock() as unknown as Props['navigation']
        }
        route={createRouteMock() as unknown as Props['route']}
      />,
    );

    expect(treeContainsText(renderer, 'Transport')).toBe(true);
    expect(treeContainsText(renderer, 'Drivers')).toBe(true);
  });
});
