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
  fetchAllDailyEntries: jest.fn().mockResolvedValue([]),
}));

jest.mock('@/services/driverAdvanceService', () => ({
  fetchAllOwnerDriverAdvances: jest.fn().mockResolvedValue([]),
}));

jest.mock('@/services/driverPaymentService', () => ({
  fetchAllOwnerDriverPayments: jest.fn().mockResolvedValue([]),
}));

describe('DriverPaymentDetailsScreen', () => {
  it('renders the empty state when no driver has salary or payments', async () => {
    const renderer = await renderScreen(<DriverPaymentDetailsScreen />);

    expect(treeContainsText(renderer, 'No payment details')).toBe(true);
  });
});
