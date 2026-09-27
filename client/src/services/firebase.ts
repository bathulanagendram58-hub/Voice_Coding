import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from 'firebase/auth';

// Vite environment variables for Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

// Check if Firebase credentials are fully provided
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId
);

// Initialize Firebase App singleton safely
export const firebaseApp = !getApps().length && isFirebaseConfigured
  ? initializeApp(firebaseConfig)
  : getApps().length
  ? getApp()
  : null;

// Export Auth instance
export const auth = firebaseApp ? getAuth(firebaseApp) : null;
export const googleProvider = new GoogleAuthProvider();

// Google Sign-In helper
export async function signInWithGoogle(): Promise<{
  name: string;
  email: string;
  token: string;
  photoURL?: string;
}> {
  if (!auth) {
    throw new Error(
      'Firebase is not configured yet. Please add your Firebase credentials in client/.env (see .env.example) or use the Email/Password and Demo login.'
    );
  }
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;
  const token = await user.getIdToken();
  return {
    name: user.displayName || user.email?.split('@')[0] || 'Firebase User',
    email: user.email || '',
    token,
    photoURL: user.photoURL || undefined,
  };
}

// Firebase Email & Password Sign-In
export async function loginWithFirebase(email: string, password: string): Promise<{
  name: string;
  email: string;
  token: string;
}> {
  if (!auth) {
    throw new Error('Firebase is not configured yet. Use direct local login or add Firebase config to client/.env');
  }
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const user = credential.user;
  const token = await user.getIdToken();
  return {
    name: user.displayName || user.email?.split('@')[0] || 'Firebase User',
    email: user.email || '',
    token,
  };
}

// Firebase Sign-Out
export async function logoutFromFirebase(): Promise<void> {
  if (auth) {
    await signOut(auth);
  }
}
