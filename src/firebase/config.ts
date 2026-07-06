import { initializeApp } from 'firebase/app';
import { initializeAuth, type Persistence } from 'firebase/auth';
import * as firebaseAuthModule from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import { mmkvStorageAdapter } from '@/firebase/mmkvStorageAdapter';
import {
  FIREBASE_API_KEY,
  FIREBASE_APP_ID,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
} from '@env';

const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID,
};

export const firebaseApp = initializeApp(firebaseConfig);

const getReactNativePersistence = (
  firebaseAuthModule as unknown as {
    getReactNativePersistence: (storage: unknown) => Persistence;
  }
).getReactNativePersistence;

export const firebaseAuth = initializeAuth(firebaseApp, {
  persistence: getReactNativePersistence(mmkvStorageAdapter),
});

export const firestoreDb = initializeFirestore(firebaseApp, {
  experimentalForceLongPolling: true,
});
