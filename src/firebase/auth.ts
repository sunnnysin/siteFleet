import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
  signOut,
  type User,
} from 'firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GOOGLE_WEB_CLIENT_ID } from '@env';
import { firebaseAuth } from '@/firebase/config';
import { setDocumentById } from '@/firebase/firestore';
import { FIRESTORE_COLLECTIONS } from '@/types/collections';
import type { UserProfile } from '@/types/user';

GoogleSignin.configure({
  webClientId: GOOGLE_WEB_CLIENT_ID,
  offlineAccess: false,
});

export async function signInWithGoogle(): Promise<User> {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const signInResult = await GoogleSignin.signIn();
  const idToken = signInResult.data?.idToken;

  if (idToken === null || idToken === undefined) {
    throw new Error('Google Sign-In did not return an ID token');
  }

  const credential = GoogleAuthProvider.credential(idToken);
  const userCredential = await signInWithCredential(firebaseAuth, credential);
  return userCredential.user;
}

export async function upsertUserProfile(user: User): Promise<UserProfile> {
  const userProfile: UserProfile = {
    uid: user.uid,
    displayName: user.displayName,
    email: user.email,
    photoUrl: user.photoURL,
    lastSignedInAt: new Date().toISOString(),
  };
  await setDocumentById(FIRESTORE_COLLECTIONS.users, user.uid, userProfile);
  return userProfile;
}

export async function signOutOfApp(): Promise<void> {
  await GoogleSignin.signOut();
  await signOut(firebaseAuth);
}

export function subscribeToAuthChanges(
  onChange: (user: User | null) => void,
): () => void {
  return onAuthStateChanged(firebaseAuth, onChange);
}

export function getCurrentUserId(): string {
  const uid = firebaseAuth.currentUser?.uid;
  if (uid === undefined) {
    throw new Error('No authenticated user');
  }
  return uid;
}
