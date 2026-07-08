import type { VehicleType } from '@/types/driver';

export interface GoraulVehicleRate {
  id: string;
  ownerId: string;
  vehicleType: VehicleType;
  ratePerTrip: number;
  updatedAt: string;
}

export interface GoraulVehicleRateDraft {
  vehicleType: VehicleType;
  ratePerTrip: number;
}
