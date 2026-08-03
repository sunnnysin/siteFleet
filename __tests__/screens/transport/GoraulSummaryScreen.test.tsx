import { GoraulSummaryScreen } from '@/screens/transport/GoraulSummaryScreen';
import { renderScreen, treeContainsText } from '../testUtils';

jest.mock('@/services/goraulSummaryService', () => ({
  computeGoraulSummaryTotals: jest
    .fn()
    .mockReturnValue({ ace: 0, bolero: 0, total: 0 }),
  fetchGoraulSummary: jest.fn().mockResolvedValue(null),
  saveGoraulSummary: jest.fn(),
}));

jest.mock('@/services/goraulSummaryReportService', () => ({
  shareGoraulSummaryReport: jest.fn(),
}));

describe('GoraulSummaryScreen', () => {
  it('renders without throwing and shows the no-summary empty state', async () => {
    const renderer = await renderScreen(<GoraulSummaryScreen />);

    expect(treeContainsText(renderer, 'No summary yet')).toBe(true);
  });
});
