import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import firebaseConfigJson from "../../firebase-applet-config.json";

// The platform injects VITE_FIREBASE_CONFIG into the environment for web targets
const firebaseConfig = import.meta.env.VITE_FIREBASE_CONFIG 
  ? JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG)
  : firebaseConfigJson;

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);
