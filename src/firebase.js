// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCfuiRIJ_CCfQJa371oOzSpHHqOS5ObYyA",
  authDomain: "fairdose-c2f86.firebaseapp.com",
  projectId: "fairdose-c2f86",
  storageBucket: "fairdose-c2f86.firebasestorage.app",
  messagingSenderId: "980917471438",
  appId: "1:980917471438:web:13b6cddc465e6fe812e89f"
};

const app = initializeApp(firebaseConfig);

// 👇 THIS LINE IS CRITICAL
export const db = getFirestore(app);