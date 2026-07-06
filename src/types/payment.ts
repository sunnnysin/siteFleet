import type { PaymentStatus } from '@/types/dailyEntry';

export interface MonthlyPayment {
  id: string;
  ownerId: string;
  driverId: string;
  driverName: string;
  month: string;
  daysPresent: number;
  totalAmount: number;
  amountSettledSameDay: number;
  amountDue: number;
  paymentStatus: PaymentStatus;
  paidAt: string | null;
}
