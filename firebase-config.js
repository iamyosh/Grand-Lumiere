// firebase-config.js - Create this file ONCE
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';

// Your web app's Firebase configuration (Paste the object from Firebase console)
const firebaseConfig = {
  apiKey: "AIzaSyAacaHmJ9u9VOkyqo6sditvfh4X-rijWtU",
  authDomain: "grand-lumiere.firebaseapp.com",
  projectId: "grand-lumiere",
  storageBucket: "grand-lumiere.firebasestorage.app",
  messagingSenderId: "417218970731",
  appId: "1:417218970731:web:c98ce6b18874fa5bd05d2e",
  measurementId: "G-2D9RHPGW51"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const functions = getFunctions(app);

export { app, db, functions, httpsCallable };
