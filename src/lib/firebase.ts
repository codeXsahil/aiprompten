import { initializeApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";

// CONFIGURATION - Replace with your Firebase credentials
export const firebaseConfig = {
  apiKey: "AIzaSyAA76KwXiz1415R0Ogr-BiqhOV29Rwpolc",
  authDomain: "ai-art-prompt-bc87f.firebaseapp.com",
  projectId: "ai-art-prompt-bc87f",
  storageBucket: "ai-art-prompt-bc87f.firebasestorage.app",
  messagingSenderId: "778571230462",
  appId: "1:778571230462:web:72438c4a008b7c4bbbc9af"
};

export const cloudinaryConfig = {
  cloudName: "dop0p5gir",
  uploadPreset: "prompt_art"
};

export const isConfigured = 
  firebaseConfig.apiKey !== "" && 
  cloudinaryConfig.cloudName !== "";

let app: FirebaseApp | undefined;
let db: Firestore | undefined;
let auth: Auth | undefined;

if (firebaseConfig.apiKey !== "") {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
}

export { db, auth };
