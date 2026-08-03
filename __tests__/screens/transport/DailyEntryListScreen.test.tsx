import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DailyEntryListScreen } from '@/screens/transport/DailyEntryListScreen';
import type { TransportStackParamList } from '@/navigation/types';
import {
  createNavigationMock,
  createRouteMock,
  renderScreen,
  treeContainsText,
} from '../testUtils';

type Props = NativeStackScreenProps<
  TransportStackParamList,
  'DailyEntryList'
>;

jest.mock('react-native/Libraries/Lists/FlatList', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@/services/dailyEntryService', () => ({
  computeEffectiveDriverPay: jest.fn().mockReturnValue(0),
  computeEffectiveFuelCost: jest.fn().mockReturnValue(0),
  deleteDailyEntry: jest.fn(),
  fetchDailyEntriesForDate: jest.fn().mockResolvedValue([]),
  markDailyEntryPaid: jest.fn(),
}));

jest.mock('@/services/fuelPriceService', () => ({
  fetchFuelPriceForDate: jest.fn().mockResolvedValue(null),
}));

jest.mock('@/services/upiService', () => ({
  openUpiPayment: jest.fn(),
}));

jest.mock('@/services/driverService', () => ({
  fetchDriverById: jest.fn().mockResolvedValue(null),
}));

describe('DailyEntryListScreen', () => {
  it('renders without throwing and shows the fuel price warning', async () => {
    const renderer = await renderScreen(
      <DailyEntryListScreen
        navigation={
          createNavigationMock() as unknown as Props['navigation']
        }
        route={createRouteMock() as unknown as Props['route']}
      />,
    );

    expect(
      treeContainsText(renderer, 'No fuel price set for this date'),
    ).toBe(true);
  });
});
