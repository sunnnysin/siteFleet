import { FuelPriceScreen } from '@/screens/transport/FuelPriceScreen';
import { renderScreen, treeContainsText } from '../testUtils';

jest.mock('@/services/fuelPriceService', () => ({
  fetchFuelPriceForDate: jest.fn().mockResolvedValue(null),
  fetchFuelPricesForMonth: jest.fn().mockResolvedValue([]),
  setFuelPriceForDate: jest.fn(),
}));

describe('FuelPriceScreen', () => {
  it('renders without throwing and shows the price field', async () => {
    const renderer = await renderScreen(<FuelPriceScreen />);

    expect(treeContainsText(renderer, 'Price per litre')).toBe(true);
  });
});
