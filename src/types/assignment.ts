import type { AttendanceStatus } from '@/types/dailyEntry';

export interface AssignmentRowState {
  vehicleType: string;
  vehicleNumber: string;
  route: string;
  attendance: AttendanceStatus;
}
