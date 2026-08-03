import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AddEditRouteScreen } from '@/screens/transport/AddEditRouteScreen';
import type { TransportStackParamList } from '@/navigation/types';
import {
  createNavigationMock,
  createRouteMock,
  renderScreen,
  treeContainsText,
} from '../testUtils';

type Props = NativeStackScreenProps<TransportStackParamList, 'AddEditRoute'>;

jest.mock('@/services/routeService', () => ({
  createRoute: jest.fn(),
  fetchRouteById: jest.fn().mockResolvedValue(null),
  updateRoute: jest.fn(),
}));

describe('AddEditRouteScreen', () => {
  it('renders without throwing and shows the route name field', async () => {
    const renderer = await renderScreen(
      <AddEditRouteScreen
        navigation={
          createNavigationMock() as unknown as Props['navigation']
        }
        route={createRouteMock({}) as unknown as Props['route']}
      />,
    );

    expect(treeContainsText(renderer, 'Route name')).toBe(true);
  });
});
