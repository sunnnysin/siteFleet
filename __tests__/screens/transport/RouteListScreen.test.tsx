import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RouteListScreen } from '@/screens/transport/RouteListScreen';
import type { TransportStackParamList } from '@/navigation/types';
import {
  createNavigationMock,
  createRouteMock,
  renderScreen,
  treeContainsText,
} from '../testUtils';

type Props = NativeStackScreenProps<TransportStackParamList, 'RouteList'>;

jest.mock('@/services/routeService', () => ({
  deleteRoute: jest.fn(),
  fetchRoutes: jest.fn().mockResolvedValue([]),
}));

describe('RouteListScreen', () => {
  it('renders without throwing and shows the empty state', async () => {
    const renderer = await renderScreen(
      <RouteListScreen
        navigation={
          createNavigationMock() as unknown as Props['navigation']
        }
        route={createRouteMock() as unknown as Props['route']}
      />,
    );

    expect(treeContainsText(renderer, 'No routes yet')).toBe(true);
  });
});
