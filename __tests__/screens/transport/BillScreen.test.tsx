import { BillScreen } from '@/screens/transport/BillScreen';
import { renderScreen, treeContainsText } from '../testUtils';

jest.mock('@/services/dailyEntryService', () => ({
  fetchDailyEntriesForMonth: jest.fn().mockResolvedValue([]),
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
  setVehicleRate: jest.fn(),
}));

jest.mock('@/services/billReportService', () => ({
  shareBillReport: jest.fn(),
  VEHICLE_TYPE_BILL_LABELS: { ACE: 'ACE', 'Bolero/PickUp': 'BOLERO - PICK UP' },
}));

describe('BillScreen', () => {
  it('renders without throwing and shows the rate per trip section', async () => {
    const renderer = await renderScreen(<BillScreen />);

    expect(treeContainsText(renderer, 'Rate per trip')).toBe(true);
  });
});
