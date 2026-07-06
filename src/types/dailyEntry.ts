export type AttendanceStatus = 'present' | 'absent';
export type SettlementType = 'monthly' | 'sameDay';
export type PaymentStatus = 'paid' | 'unpaid';

export interface DailyEntry {
  id: string;
  ownerId: string;
  date: string;
  month: string;
  driverId: string;
  driverName: string;
  vehicleType: string;
  vehicleNumber: string;
  route: string;
  attendance: AttendanceStatus;
  dailyRate: number;
  fuelLitres: number;
  fuelCost: number;
  settlementType: SettlementType;
  paymentStatus: PaymentStatus;
  paidAt: string | null;
}

export type DailyAssignmentDraft = Pick<
  DailyEntry,
  | 'date'
  | 'driverId'
  | 'driverName'
  | 'vehicleType'
  | 'vehicleNumber'
  | 'route'
  | 'attendance'
>;

export type DailyFuelDraft = Pick<
  DailyEntry,
  'dailyRate' | 'fuelLitres' | 'settlementType'
>;
