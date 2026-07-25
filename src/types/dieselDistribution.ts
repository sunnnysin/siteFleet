export interface DieselDistributionEntry {
  id: string;
  ownerId: string;
  date: string;
  month: string;
  driverId: string;
  driverName: string;
  vehicleNumber: string;
  litres: number;
  createdAt: string;
}

export interface DieselDistributionEntryDraft {
  driverId: string;
  driverName: string;
  vehicleNumber: string;
  litres: number;
}
