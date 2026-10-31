// admin/src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Firebase config (SAFE to expose)
const firebaseConfig = {
  apiKey: "AIzaSyCfuiRIJ_CCfQJa371oOzSpHHqOS5ObYyA",
  authDomain: "fairdose-c2f86.firebaseapp.com",
  projectId: "fairdose-c2f86",
  storageBucket: "fairdose-c2f86.appspot.com",
  messagingSenderId: "980917471438",
  appId: "1:980917471438:web:13b6cddc465e6fe812e89f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Services
export const db = getFirestore(app);
export const auth = getAuth(app);
