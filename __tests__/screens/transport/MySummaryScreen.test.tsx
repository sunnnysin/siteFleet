import { MySummaryScreen } from '@/screens/transport/MySummaryScreen';
import { renderScreen, treeContainsText } from '../testUtils';

jest.mock('@/services/dailyEntryService', () => ({
  computeEffectiveFuelCost: jest.fn().mockReturnValue(0),
  fetchDailyEntriesForMonth: jest.fn().mockResolvedValue([]),
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
  buildVehicleRateMap: jest
    .fn()
    .mockReturnValue({ ACE: 955, 'Bolero/PickUp': 1000 }),
  fetchVehicleRates: jest.fn().mockResolvedValue([]),
}));

describe('MySummaryScreen', () => {
  it('renders without throwing and shows the summary cards', async () => {
    const renderer = await renderScreen(<MySummaryScreen />);

    expect(treeContainsText(renderer, 'Total driver payment')).toBe(true);
  });
});
