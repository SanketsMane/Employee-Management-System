// Firebase configuration
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDvDyHQK_EcEIDyBG05WjGY1wKRQ5I0FVI",
  authDomain: "ems-formonex.firebaseapp.com",
  projectId: "ems-formonex",
  storageBucket: "ems-formonex.firebasestorage.app",
  messagingSenderId: "844511018208",
  appId: "1:844511018208:web:76d59cdefb464d2323a485",
  measurementId: "G-3S2PPKB9M1",
  databaseURL: "https://ems-formonex-default-rtdb.firebaseio.com/"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app); // Real-time database for chat and online status
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

export default app;
