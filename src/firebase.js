// Firebase Configuration & Initialization
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAiMIupnLI79I7i5E1KFdqVonS7FoglswI",
  authDomain: "persiapanwed.firebaseapp.com",
  projectId: "persiapanwed",
  storageBucket: "persiapanwed.firebasestorage.app",
  messagingSenderId: "454398561345",
  appId: "1:454398561345:web:ee9e4a0426936725644ac0"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
