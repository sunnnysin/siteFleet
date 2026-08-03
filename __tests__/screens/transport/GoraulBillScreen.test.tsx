import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GoraulBillScreen } from '@/screens/transport/GoraulBillScreen';
import type { TransportStackParamList } from '@/navigation/types';
import {
  createNavigationMock,
  createRouteMock,
  renderScreen,
  treeContainsText,
} from '../testUtils';

type Props = NativeStackScreenProps<TransportStackParamList, 'GoraulBill'>;

jest.mock('@/services/goraulSummaryService', () => ({
  computeGoraulSummaryTotals: jest
    .fn()
    .mockReturnValue({ ace: 0, bolero: 0, total: 0 }),
  fetchGoraulSummary: jest.fn().mockResolvedValue(null),
}));

jest.mock('@/services/goraulVehicleRateService', () => ({
  fetchGoraulVehicleRates: jest.fn().mockResolvedValue([]),
  buildGoraulVehicleRateMap: jest
    .fn()
    .mockReturnValue({ ACE: 955, 'Bolero/PickUp': 1000 }),
  setGoraulVehicleRate: jest.fn(),
}));

jest.mock('@/services/goraulBillReportService', () => ({
  shareGoraulBillReport: jest.fn(),
  GORAUL_VEHICLE_TYPE_BILL_LABELS: {
    ACE: 'ACE',
    'Bolero/PickUp': 'BOLERO - PICK UP',
  },
}));

describe('GoraulBillScreen', () => {
  it('renders without throwing and shows the no-summary empty state', async () => {
    const renderer = await renderScreen(
      <GoraulBillScreen
        navigation={
          createNavigationMock() as unknown as Props['navigation']
        }
        route={createRouteMock() as unknown as Props['route']}
      />,
    );

    expect(treeContainsText(renderer, 'No summary yet')).toBe(true);
  });
});
