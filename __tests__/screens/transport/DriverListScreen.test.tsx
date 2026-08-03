import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DriverListScreen } from '@/screens/transport/DriverListScreen';
import type { TransportStackParamList } from '@/navigation/types';
import {
  createNavigationMock,
  createRouteMock,
  renderScreen,
  treeContainsText,
} from '../testUtils';

type Props = NativeStackScreenProps<TransportStackParamList, 'DriverList'>;

jest.mock('@/services/driverService', () => ({
  fetchDrivers: jest.fn().mockResolvedValue([]),
  setDriverActiveStatus: jest.fn(),
}));

jest.mock('@/services/routeService', () => ({
  fetchRoutes: jest.fn().mockResolvedValue([]),
}));

jest.mock('@/services/dailyEntryService', () => ({
  fetchDailyEntriesForDriverAndMonth: jest.fn().mockResolvedValue([]),
  computeDriverFuelBalance: jest.fn().mockReturnValue(0),
}));

describe('DriverListScreen', () => {
  it('renders without throwing and shows the search field', async () => {
    const renderer = await renderScreen(
      <DriverListScreen
        navigation={
          createNavigationMock() as unknown as Props['navigation']
        }
        route={createRouteMock() as unknown as Props['route']}
      />,
    );

    expect(treeContainsText(renderer, 'Search by name')).toBe(true);
  });
});
