import { SummaryScreen } from '@/screens/transport/SummaryScreen';
import { renderScreen, treeContainsText } from '../testUtils';

jest.mock('@/services/dailyEntryService', () => ({
  fetchDailyEntriesForMonth: jest.fn().mockResolvedValue([]),
}));

jest.mock('@/services/driverService', () => ({
  fetchDrivers: jest.fn().mockResolvedValue([]),
}));

jest.mock('@/services/vehicleSummaryService', () => ({
  computeDailyVehicleTypeCounts: jest.fn().mockReturnValue([]),
}));

jest.mock('@/services/summaryReportService', () => ({
  shareSummaryReport: jest.fn(),
}));

describe('SummaryScreen', () => {
  it('renders without throwing and shows the empty state', async () => {
    const renderer = await renderScreen(<SummaryScreen />);

    expect(treeContainsText(renderer, 'No entries this month')).toBe(true);
  });
});
