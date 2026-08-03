import { PumpScreen } from '@/screens/transport/PumpScreen';
import { renderScreen, treeContainsText } from '../testUtils';

jest.mock('@/services/fuelPriceService', () => ({
  fetchFuelPriceForDate: jest.fn().mockResolvedValue(null),
}));

jest.mock('@/services/dailyEntryService', () => ({
  fetchDailyEntriesForDate: jest.fn().mockResolvedValue([]),
}));

jest.mock('@/services/pumpEntryService', () => ({
  computePumpEntriesTotals: jest
    .fn()
    .mockReturnValue({ totalLitres: 0, totalCost: 0 }),
  fetchPumpEntriesForMonth: jest.fn().mockResolvedValue([]),
  fetchPumpEntryForDate: jest.fn().mockResolvedValue(null),
  savePumpEntryForDate: jest.fn(),
}));

jest.mock('@/services/pumpReportService', () => ({
  sharePumpMonthlyReport: jest.fn(),
}));

describe('PumpScreen', () => {
  it('renders without throwing and shows the litres field', async () => {
    const renderer = await renderScreen(<PumpScreen />);

    expect(treeContainsText(renderer, 'Fuel taken (litres)')).toBe(true);
  });
});
