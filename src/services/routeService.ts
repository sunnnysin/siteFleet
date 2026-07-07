import { where } from 'firebase/firestore';
import {
  deleteDocumentById,
  generateDocumentId,
  getDocumentById,
  queryCollection,
  setDocumentById,
} from '@/firebase/firestore';
import { getCurrentUserId } from '@/firebase/auth';
import { FIRESTORE_COLLECTIONS } from '@/types/collections';
import type { Route, RouteDraft } from '@/types/route';

export async function fetchRoutes(): Promise<Route[]> {
  const routes = await queryCollection<Route>(FIRESTORE_COLLECTIONS.routes, [
    where('ownerId', '==', getCurrentUserId()),
  ]);
  return [...routes].sort((first, second) =>
    first.name.localeCompare(second.name),
  );
}

export async function fetchRouteById(routeId: string): Promise<Route | null> {
  return getDocumentById<Route>(FIRESTORE_COLLECTIONS.routes, routeId);
}

export async function createRoute(draft: RouteDraft): Promise<Route> {
  const id = generateDocumentId(FIRESTORE_COLLECTIONS.routes);
  const route: Route = {
    ...draft,
    id,
    ownerId: getCurrentUserId(),
    createdAt: new Date().toISOString(),
  };
  await setDocumentById(FIRESTORE_COLLECTIONS.routes, id, route);
  return route;
}

export async function updateRoute(route: Route): Promise<Route> {
  await setDocumentById(FIRESTORE_COLLECTIONS.routes, route.id, route);
  return route;
}

export async function deleteRoute(routeId: string): Promise<void> {
  await deleteDocumentById(FIRESTORE_COLLECTIONS.routes, routeId);
}
