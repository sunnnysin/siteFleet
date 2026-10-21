import { DriverPaymentDetailsScreen } from '@/screens/transport/DriverPaymentDetailsScreen';
import { renderScreen, treeContainsText } from '../testUtils';

jest.mock('@/services/driverService', () => ({
  fetchDrivers: jest.fn().mockResolvedValue([
    {
      id: 'driver-1',
      name: 'Ravi Kumar',
      dailyRate: 400,
    },
  ]),
}));

jest.mock('@/services/dailyEntryService', () => ({
  ...jest.requireActual<Record<string, unknown>>(
    '@/services/dailyEntryService',
  ),
  fetchAllDailyEntries: jest.fn().mockResolvedValue([
    {
      driverId: 'deleted-driver',
      driverName: 'Gone Driver',
      dailyRate: 300,
      month: new Date().toISOString().slice(0, 7),
      date: new Date().toISOString().slice(0, 10),
      attendance: 'present',
      fuelLitres: 0,
      routeFuelLitres: 0,
      fuelCost: 0,
    },
  ]),
}));

jest.mock('@/services/driverAdvanceService', () => ({
  fetchAllOwnerDriverAdvances: jest.fn().mockResolvedValue([]),
}));

jest.mock('@/services/driverPaymentService', () => ({
  fetchAllOwnerDriverPayments: jest.fn().mockResolvedValue([]),
}));

describe('DriverPaymentDetailsScreen', () => {
  it('shows a deleted driver with a Deleted badge', async () => {
    const renderer = await renderScreen(<DriverPaymentDetailsScreen />);

    expect(treeContainsText(renderer, 'Gone Driver')).toBe(true);
    expect(treeContainsText(renderer, 'Deleted')).toBe(true);
  });
});
