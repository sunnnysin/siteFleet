import {
  computeDriverFuelBalance,
  computeEffectiveDriverPay,
  computeEffectiveFuelCost,
  saveDailyEntry,
} from '@/services/dailyEntryService';
import { fetchFuelPriceForDate } from '@/services/fuelPriceService';
import { fetchRouteById } from '@/services/routeService';
import { getDocumentById } from '@/firebase/firestore';
import type { DailyEntry } from '@/types/dailyEntry';
import type { DailyEntryDriverSource } from '@/services/dailyEntryService';

jest.mock('@/firebase/auth', () => ({
  getCurrentUserId: () => 'owner-1',
}));

jest.mock('@/firebase/firestore', () => ({
  getDocumentById: jest.fn(),
  setDocumentById: jest.fn(),
  deleteDocumentById: jest.fn(),
  queryCollection: jest.fn(),
}));

jest.mock('@/services/fuelPriceService', () => ({
  fetchFuelPriceForDate: jest.fn(),
}));

jest.mock('@/services/routeService', () => ({
  fetchRouteById: jest.fn(),
}));

function buildEntry(overrides: Partial<DailyEntry>): DailyEntry {
  return {
    id: 'owner-1_2026-08-01_driver-1',
    ownerId: 'owner-1',
    date: '2026-08-01',
    month: '2026-08',
    driverId: 'driver-1',
    driverName: 'Test Driver',
    vehicleType: 'ACE',
    vehicleNumber: '1234',
    route: 'Route 01',
    attendance: 'present',
    dailyRate: 400,
    fuelLitres: 0,
    routeFuelLitres: 0,
    fuelCost: 0,
    settlementType: 'monthly',
    paymentStatus: 'unpaid',
    paidAt: null,
    ...overrides,
  };
}

describe('computeDriverFuelBalance', () => {
  it('sums fuelLitres - routeFuelLitres across present-day entries', () => {
    const entries = [
      buildEntry({ fuelLitres: 4, routeFuelLitres: 2 }),
      buildEntry({ fuelLitres: 2, routeFuelLitres: 2 }),
    ];
    expect(computeDriverFuelBalance(entries)).toBe(2);
  });

  it('returns a positive balance when the driver has taken a fuel advance', () => {
    const entries = [buildEntry({ fuelLitres: 16, routeFuelLitres: 2 })];
    expect(computeDriverFuelBalance(entries)).toBe(14);
  });

  it('returns a negative balance when the driver has taken less than the route requires', () => {
    const entries = [
      buildEntry({ fuelLitres: 0, routeFuelLitres: 2 }),
      buildEntry({ fuelLitres: 0, routeFuelLitres: 2 }),
      buildEntry({ fuelLitres: 0, routeFuelLitres: 2 }),
    ];
    expect(computeDriverFuelBalance(entries)).toBe(-6);
  });
});

describe('computeEffectiveDriverPay / computeEffectiveFuelCost', () => {
  it('pays the daily rate and fuel cost on a present day', () => {
    const entry = buildEntry({
      attendance: 'present',
      dailyRate: 400,
      fuelCost: 199.5,
    });
    expect(computeEffectiveDriverPay(entry)).toBe(400);
    expect(computeEffectiveFuelCost(entry)).toBe(199.5);
  });

  it('pays nothing for driver pay or fuel cost on an absent day', () => {
    const entry = buildEntry({
      attendance: 'absent',
      dailyRate: 400,
      fuelCost: 199.5,
    });
    expect(computeEffectiveDriverPay(entry)).toBe(0);
    expect(computeEffectiveFuelCost(entry)).toBe(0);
  });
});

describe('saveDailyEntry', () => {
  const driver: DailyEntryDriverSource = {
    id: 'driver-1',
    name: 'Test Driver',
    vehicleType: 'ACE',
    vehicleNumber: '1234',
    dailyRate: 400,
    driverType: 'permanent',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (fetchRouteById as jest.Mock).mockResolvedValue({
      id: 'route-1',
      ownerId: 'owner-1',
      name: 'Route 01',
      description: 'A - B',
      fuelLitres: 2,
      createdAt: '2026-08-01T00:00:00.000Z',
    });
    (getDocumentById as jest.Mock).mockResolvedValue(null);
  });

  it('throws and blocks the save when fuel litres are entered but no fuel price is set for the date', async () => {
    (fetchFuelPriceForDate as jest.Mock).mockResolvedValue(null);

    await expect(
      saveDailyEntry(driver, {
        date: '2026-08-01',
        driverId: 'driver-1',
        routeId: 'route-1',
        route: 'Route 01',
        attendance: 'present',
        fuelLitres: 5,
      }),
    ).rejects.toThrow('No fuel price set for 2026-08-01');
  });

  it('computes fuelCost from that date\'s price and does not require a price when fuelLitres is 0', async () => {
    (fetchFuelPriceForDate as jest.Mock).mockResolvedValue({
      id: 'owner-1_2026-08-01',
      ownerId: 'owner-1',
      date: '2026-08-01',
      month: '2026-08',
      pricePerLitre: 99.44,
      setAt: '2026-08-01T00:00:00.000Z',
    });

    const savedWithFuel = await saveDailyEntry(driver, {
      date: '2026-08-01',
      driverId: 'driver-1',
      routeId: 'route-1',
      route: 'Route 01',
      attendance: 'present',
      fuelLitres: 5,
    });
    expect(savedWithFuel.fuelCost).toBeCloseTo(497.2);

    const savedWithoutFuel = await saveDailyEntry(driver, {
      date: '2026-08-01',
      driverId: 'driver-1',
      routeId: 'route-1',
      route: 'Route 01',
      attendance: 'present',
      fuelLitres: 0,
    });
    expect(savedWithoutFuel.fuelCost).toBe(0);
  });
});
