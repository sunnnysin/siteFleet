import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  type CollectionReference,
  type QueryConstraint,
  type WithFieldValue,
} from 'firebase/firestore';
import { firestoreDb } from '@/firebase/config';

export function collectionRef(collectionName: string): CollectionReference {
  return collection(firestoreDb, collectionName);
}

export function generateDocumentId(collectionName: string): string {
  return doc(collectionRef(collectionName)).id;
}

export async function getDocumentById<T>(
  collectionName: string,
  id: string,
): Promise<T | null> {
  const snapshot = await getDoc(doc(firestoreDb, collectionName, id));
  return snapshot.exists() ? (snapshot.data() as T) : null;
}

export async function setDocumentById<T extends object>(
  collectionName: string,
  id: string,
  data: T,
): Promise<void> {
  await setDoc(doc(firestoreDb, collectionName, id), data as WithFieldValue<T>);
}

export async function queryCollection<T>(
  collectionName: string,
  constraints: QueryConstraint[] = [],
): Promise<T[]> {
  const snapshot = await getDocs(
    query(collectionRef(collectionName), ...constraints),
  );
  return snapshot.docs.map(docSnapshot => docSnapshot.data() as T);
}
