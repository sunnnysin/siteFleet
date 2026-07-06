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
  routeFuelLitres: number;
  fuelCost: number;
  settlementType: SettlementType;
  paymentStatus: PaymentStatus;
  paidAt: string | null;
}

export interface DailyEntryDraft {
  date: string;
  driverId: string;
  routeId: string;
  route: string;
  attendance: AttendanceStatus;
  fuelLitres: number;
}
