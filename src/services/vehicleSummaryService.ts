import { VEHICLE_TYPES, type VehicleType } from '@/types/driver';
import type { DailyEntry } from '@/types/dailyEntry';

// Daily entries snapshot the driver's vehicleType at save time as a plain
// string. Older entries/drivers may still carry retired values (Van, Auto,
// old PickUp) from before vehicle types were trimmed down to just ACE and
// Bolero/PickUp — bucket anything that isn't ACE into Bolero/PickUp instead
// of silently dropping it from the counts.
function normalizeVehicleType(vehicleType: string): VehicleType {
  return vehicleType === 'ACE' ? 'ACE' : 'Bolero/PickUp';
}

function emptyVehicleTypeCounts(): Record<VehicleType, number> {
  return Object.fromEntries(
    VEHICLE_TYPES.map(vehicleType => [vehicleType, 0]),
  ) as Record<VehicleType, number>;
}

// Prefer the driver's current vehicle type over the entry's frozen snapshot,
// so re-classifying a driver (e.g. Van -> ACE) is reflected for all of their
// past entries, not just ones logged after the change.
function resolveEntryVehicleType(
  entry: DailyEntry,
  driverVehicleTypes: Map<string, VehicleType>,
): VehicleType {
  return (
    driverVehicleTypes.get(entry.driverId) ??
    normalizeVehicleType(entry.vehicleType)
  );
}

export function computeVehicleTypeTotalsForMonth(
  entries: DailyEntry[],
  driverVehicleTypes: Map<string, VehicleType>,
): Record<VehicleType, number> {
  const totals = emptyVehicleTypeCounts();
  entries.forEach(entry => {
    if (entry.attendance === 'present') {
      totals[resolveEntryVehicleType(entry, driverVehicleTypes)] += 1;
    }
  });
  return totals;
}

export interface DailyVehicleTypeCounts {
  date: string;
  counts: Record<VehicleType, number>;
  total: number;
}

export function computeDailyVehicleTypeCounts(
  entries: DailyEntry[],
  driverVehicleTypes: Map<string, VehicleType>,
): DailyVehicleTypeCounts[] {
  const byDate = new Map<string, Record<VehicleType, number>>();

  entries.forEach(entry => {
    if (entry.attendance !== 'present') {
      return;
    }
    const counts = byDate.get(entry.date) ?? emptyVehicleTypeCounts();
    counts[resolveEntryVehicleType(entry, driverVehicleTypes)] += 1;
    byDate.set(entry.date, counts);
  });

  return [...byDate.entries()]
    .map(([date, counts]) => ({
      date,
      counts,
      total: VEHICLE_TYPES.reduce((sum, type) => sum + counts[type], 0),
    }))
    .sort((first, second) => first.date.localeCompare(second.date));
}
