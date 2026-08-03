import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AddDriverAdvanceScreen } from '@/screens/transport/AddDriverAdvanceScreen';
import type { TransportStackParamList } from '@/navigation/types';
import {
  createNavigationMock,
  createRouteMock,
  renderScreen,
  treeContainsText,
} from '../testUtils';

type Props = NativeStackScreenProps<
  TransportStackParamList,
  'AddDriverAdvance'
>;

jest.mock('@/services/driverAdvanceService', () => ({
  saveDriverAdvance: jest.fn(),
}));

describe('AddDriverAdvanceScreen', () => {
  it('renders without throwing and shows the amount field', async () => {
    const renderer = await renderScreen(
      <AddDriverAdvanceScreen
        navigation={
          createNavigationMock() as unknown as Props['navigation']
        }
        route={
          createRouteMock({ driverId: 'driver-1' }) as unknown as Props['route']
        }
      />,
    );

    expect(treeContainsText(renderer, 'Amount paid')).toBe(true);
  });
});
