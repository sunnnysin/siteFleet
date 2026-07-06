import { where } from 'firebase/firestore';
import {
  generateDocumentId,
  getDocumentById,
  queryCollection,
  setDocumentById,
} from '@/firebase/firestore';
import { getCurrentUserId } from '@/firebase/auth';
import { FIRESTORE_COLLECTIONS } from '@/types/collections';
import type { Driver, DriverDraft } from '@/types/driver';

export async function fetchDrivers(): Promise<Driver[]> {
  const drivers = await queryCollection<Driver>(FIRESTORE_COLLECTIONS.drivers, [
    where('ownerId', '==', getCurrentUserId()),
  ]);
  return [...drivers].sort((first, second) =>
    first.name.localeCompare(second.name),
  );
}

export async function fetchDriverById(
  driverId: string,
): Promise<Driver | null> {
  return getDocumentById<Driver>(FIRESTORE_COLLECTIONS.drivers, driverId);
}

export async function createDriver(draft: DriverDraft): Promise<Driver> {
  const id = generateDocumentId(FIRESTORE_COLLECTIONS.drivers);
  const driver: Driver = {
    ...draft,
    id,
    ownerId: getCurrentUserId(),
    createdAt: new Date().toISOString(),
  };
  await setDocumentById(FIRESTORE_COLLECTIONS.drivers, id, driver);
  return driver;
}

export async function updateDriver(driver: Driver): Promise<Driver> {
  await setDocumentById(FIRESTORE_COLLECTIONS.drivers, driver.id, driver);
  return driver;
}

export async function setDriverActiveStatus(
  driver: Driver,
  isActive: boolean,
): Promise<Driver> {
  return updateDriver({ ...driver, isActive });
}
