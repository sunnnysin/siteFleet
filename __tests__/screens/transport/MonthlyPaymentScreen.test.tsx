import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MonthlyPaymentScreen } from '@/screens/transport/MonthlyPaymentScreen';
import type { TransportStackParamList } from '@/navigation/types';
import {
  createNavigationMock,
  createRouteMock,
  renderScreen,
  treeContainsText,
} from '../testUtils';

type Props = NativeStackScreenProps<
  TransportStackParamList,
  'MonthlyPayment'
>;

jest.mock('@/services/driverService', () => ({
  fetchDriverById: jest.fn().mockResolvedValue(null),
  fetchDrivers: jest.fn().mockResolvedValue([]),
  updateDriver: jest.fn(),
}));

jest.mock('@/services/paymentService', () => ({
  computeMonthlyPayments: jest.fn().mockResolvedValue([]),
  markMonthlyPaymentPaid: jest.fn(),
  markMonthlyPaymentUnpaid: jest.fn(),
}));

jest.mock('@/services/upiService', () => ({
  fetchAvailableUpiApps: jest.fn().mockResolvedValue([]),
  openUpiAppDeepLink: jest.fn(),
}));

describe('MonthlyPaymentScreen', () => {
  it('renders without throwing and shows the empty state', async () => {
    const renderer = await renderScreen(
      <MonthlyPaymentScreen
        navigation={
          createNavigationMock() as unknown as Props['navigation']
        }
        route={createRouteMock() as unknown as Props['route']}
      />,
    );

    expect(treeContainsText(renderer, 'No payments this month')).toBe(true);
  });
});
