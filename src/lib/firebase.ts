import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, signInAnonymously, type Auth } from "firebase/auth";
import { getDatabase, type Database } from "firebase/database";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const isConfigured = firebaseConfig.apiKey && firebaseConfig.databaseURL;

const app: FirebaseApp | null = isConfigured
  ? getApps().length
    ? getApp()
    : initializeApp(firebaseConfig)
  : null;

const auth: Auth | null = app ? getAuth(app) : null;
const db: Database | null = app ? getDatabase(app) : null;

if (!isConfigured) {
  console.warn("Firebase configuration is missing or incomplete. Functionality will be limited.");
}

let anonymousAuthPromise: Promise<any> | null = null;
export const ensureAnonymousAuth = () => {
    if (!auth) {
        return Promise.reject(new Error("Firebase auth is not configured."));
    }
    if (auth.currentUser) {
        return Promise.resolve(auth.currentUser);
    }
    if (!anonymousAuthPromise) {
        anonymousAuthPromise = signInAnonymously(auth);
    }
    return anonymousAuthPromise;
};

export { app, auth, db };
