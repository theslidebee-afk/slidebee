import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

// New Firebase credentials will be loaded from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSy_NEW_KEY_PENDING",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "slidebee-auth.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "slidebee-auth",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "slidebee-auth.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "000000000000",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:000000000000:web:0000000000000000"
};

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
