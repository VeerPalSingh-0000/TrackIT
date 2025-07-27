// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDtRG4hgelCZlQWsL06Tb07A7CipDSE2lU",
  authDomain: "study-tracker-cd631.firebaseapp.com",
  projectId: "study-tracker-cd631",
  storageBucket: "study-tracker-cd631.firebasestorage.app",
  messagingSenderId: "573843213419",
  appId: "1:573843213419:web:820842ab8437faada7f52e",
  measurementId: "G-NYQSD67FW4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
