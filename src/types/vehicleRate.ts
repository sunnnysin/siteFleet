import type { VehicleType } from '@/types/driver';

export interface VehicleRate {
  id: string;
  ownerId: string;
  vehicleType: VehicleType;
  ratePerTrip: number;
  updatedAt: string;
}

export interface VehicleRateDraft {
  vehicleType: VehicleType;
  ratePerTrip: number;
}
