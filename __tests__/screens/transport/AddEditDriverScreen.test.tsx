import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AddEditDriverScreen } from '@/screens/transport/AddEditDriverScreen';
import type { TransportStackParamList } from '@/navigation/types';
import {
  createNavigationMock,
  createRouteMock,
  renderScreen,
  treeContainsText,
} from '../testUtils';

type Props = NativeStackScreenProps<TransportStackParamList, 'AddEditDriver'>;

jest.mock('@/services/driverService', () => ({
  createDriver: jest.fn(),
  fetchDriverById: jest.fn().mockResolvedValue(null),
  updateDriver: jest.fn(),
}));

jest.mock('@/services/routeService', () => ({
  fetchRoutes: jest.fn().mockResolvedValue([]),
}));

describe('AddEditDriverScreen', () => {
  it('renders without throwing and shows the name field', async () => {
    const renderer = await renderScreen(
      <AddEditDriverScreen
        navigation={
          createNavigationMock() as unknown as Props['navigation']
        }
        route={createRouteMock({}) as unknown as Props['route']}
      />,
    );

    expect(treeContainsText(renderer, 'Name')).toBe(true);
  });
});
