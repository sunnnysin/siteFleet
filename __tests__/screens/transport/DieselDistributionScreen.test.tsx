import { DieselDistributionScreen } from '@/screens/transport/DieselDistributionScreen';
import { renderScreen, treeContainsText } from '../testUtils';

jest.mock('@/services/driverService', () => ({
  fetchDrivers: jest.fn().mockResolvedValue([]),
}));

jest.mock('@/services/dieselDistributionService', () => ({
  fetchDieselDistributionForDate: jest.fn().mockResolvedValue([]),
  saveDieselDistributionEntries: jest.fn(),
}));

jest.mock('@/services/dieselDistributionReportService', () => ({
  shareDieselDistributionReport: jest.fn(),
}));

describe('DieselDistributionScreen', () => {
  it('renders without throwing and shows the empty state', async () => {
    const renderer = await renderScreen(<DieselDistributionScreen />);

    expect(treeContainsText(renderer, 'No drivers added yet')).toBe(true);
  });
});
