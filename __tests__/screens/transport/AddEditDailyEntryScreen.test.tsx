import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AddEditDailyEntryScreen } from '@/screens/transport/AddEditDailyEntryScreen';
import type { TransportStackParamList } from '@/navigation/types';
import {
  createNavigationMock,
  createRouteMock,
  renderScreen,
  treeContainsText,
} from '../testUtils';

type Props = NativeStackScreenProps<
  TransportStackParamList,
  'AddEditDailyEntry'
>;

jest.mock('@/services/driverService', () => ({
  fetchDrivers: jest.fn().mockResolvedValue([]),
}));

jest.mock('@/services/routeService', () => ({
  fetchRoutes: jest.fn().mockResolvedValue([]),
}));

jest.mock('@/services/dailyEntryService', () => ({
  fetchDailyEntriesForDate: jest.fn().mockResolvedValue([]),
  fetchDailyEntry: jest.fn().mockResolvedValue(null),
  saveDailyEntry: jest.fn(),
}));

jest.mock('@/services/dieselDistributionService', () => ({
  fetchDieselDistributionForDate: jest.fn().mockResolvedValue([]),
}));

describe('AddEditDailyEntryScreen', () => {
  it('renders without throwing and shows the attendance field', async () => {
    const renderer = await renderScreen(
      <AddEditDailyEntryScreen
        navigation={
          createNavigationMock() as unknown as Props['navigation']
        }
        route={
          createRouteMock({
            date: '2026-08-03',
          }) as unknown as Props['route']
        }
      />,
    );

    expect(treeContainsText(renderer, 'Attendance')).toBe(true);
  });
});
