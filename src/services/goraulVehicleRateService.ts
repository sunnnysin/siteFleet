import { where } from 'firebase/firestore';
import {
  getDocumentById,
  queryCollection,
  setDocumentById,
} from '@/firebase/firestore';
import { getCurrentUserId } from '@/firebase/auth';
import { FIRESTORE_COLLECTIONS } from '@/types/collections';
import { VEHICLE_TYPES, type VehicleType } from '@/types/driver';
import type {
  GoraulVehicleRate,
  GoraulVehicleRateDraft,
} from '@/types/goraulVehicleRate';

const DEFAULT_GORAUL_VEHICLE_RATES: Record<VehicleType, number> = {
  ACE: 955,
  'Bolero/PickUp': 1000,
};

function slugifyVehicleType(vehicleType: VehicleType): string {
  return vehicleType.replace(/\//g, '-');
}

function buildGoraulVehicleRateId(
  ownerId: string,
  vehicleType: VehicleType,
): string {
  return `${ownerId}_${slugifyVehicleType(vehicleType)}`;
}

export async function fetchGoraulVehicleRates(): Promise<GoraulVehicleRate[]> {
  return queryCollection<GoraulVehicleRate>(
    FIRESTORE_COLLECTIONS.goraulVehicleRates,
    [where('ownerId', '==', getCurrentUserId())],
  );
}

export async function fetchGoraulVehicleRate(
  vehicleType: VehicleType,
): Promise<GoraulVehicleRate | null> {
  return getDocumentById<GoraulVehicleRate>(
    FIRESTORE_COLLECTIONS.goraulVehicleRates,
    buildGoraulVehicleRateId(getCurrentUserId(), vehicleType),
  );
}

export async function setGoraulVehicleRate(
  draft: GoraulVehicleRateDraft,
): Promise<GoraulVehicleRate> {
  const ownerId = getCurrentUserId();
  const id = buildGoraulVehicleRateId(ownerId, draft.vehicleType);
  const goraulVehicleRate: GoraulVehicleRate = {
    id,
    ownerId,
    vehicleType: draft.vehicleType,
    ratePerTrip: draft.ratePerTrip,
    updatedAt: new Date().toISOString(),
  };
  await setDocumentById(
    FIRESTORE_COLLECTIONS.goraulVehicleRates,
    id,
    goraulVehicleRate,
  );
  return goraulVehicleRate;
}

export function buildGoraulVehicleRateMap(
  rates: GoraulVehicleRate[],
): Record<VehicleType, number> {
  const map = Object.fromEntries(
    VEHICLE_TYPES.map(vehicleType => [
      vehicleType,
      DEFAULT_GORAUL_VEHICLE_RATES[vehicleType],
    ]),
  ) as Record<VehicleType, number>;
  rates.forEach(rate => {
    map[rate.vehicleType] = rate.ratePerTrip;
  });
  return map;
}
