import { where } from 'firebase/firestore';
import {
  getDocumentById,
  queryCollection,
  setDocumentById,
} from '@/firebase/firestore';
import { getCurrentUserId } from '@/firebase/auth';
import { FIRESTORE_COLLECTIONS } from '@/types/collections';
import { VEHICLE_TYPES, type VehicleType } from '@/types/driver';
import type { VehicleRate, VehicleRateDraft } from '@/types/vehicleRate';

const DEFAULT_VEHICLE_RATES: Record<VehicleType, number> = {
  ACE: 955,
  'Bolero/PickUp': 1000,
};

function slugifyVehicleType(vehicleType: VehicleType): string {
  return vehicleType.replace(/\//g, '-');
}

function buildVehicleRateId(ownerId: string, vehicleType: VehicleType): string {
  return `${ownerId}_${slugifyVehicleType(vehicleType)}`;
}

export async function fetchVehicleRates(): Promise<VehicleRate[]> {
  return queryCollection<VehicleRate>(FIRESTORE_COLLECTIONS.vehicleRates, [
    where('ownerId', '==', getCurrentUserId()),
  ]);
}

export async function fetchVehicleRate(
  vehicleType: VehicleType,
): Promise<VehicleRate | null> {
  return getDocumentById<VehicleRate>(
    FIRESTORE_COLLECTIONS.vehicleRates,
    buildVehicleRateId(getCurrentUserId(), vehicleType),
  );
}

export async function setVehicleRate(
  draft: VehicleRateDraft,
): Promise<VehicleRate> {
  const ownerId = getCurrentUserId();
  const id = buildVehicleRateId(ownerId, draft.vehicleType);
  const vehicleRate: VehicleRate = {
    id,
    ownerId,
    vehicleType: draft.vehicleType,
    ratePerTrip: draft.ratePerTrip,
    updatedAt: new Date().toISOString(),
  };
  await setDocumentById(FIRESTORE_COLLECTIONS.vehicleRates, id, vehicleRate);
  return vehicleRate;
}

export function buildVehicleRateMap(
  rates: VehicleRate[],
): Record<VehicleType, number> {
  const map = Object.fromEntries(
    VEHICLE_TYPES.map(vehicleType => [
      vehicleType,
      DEFAULT_VEHICLE_RATES[vehicleType],
    ]),
  ) as Record<VehicleType, number>;
  rates.forEach(rate => {
    map[rate.vehicleType] = rate.ratePerTrip;
  });
  return map;
}
