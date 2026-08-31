import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  projectId: "xyztemplates-32b47",
  appId: "1:720202083664:web:8df87952b7508e3af5d055",
  storageBucket: "xyztemplates-32b47.firebasestorage.app",
  apiKey: "AIzaSyB5mDUvQFB6wGK3GUbjneSyu0sovLJ5N9A",
  authDomain: "xyztemplates-32b47.firebaseapp.com",
  messagingSenderId: "720202083664",
  measurementId: "G-1JRT89DLPD"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
