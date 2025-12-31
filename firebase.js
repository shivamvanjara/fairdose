import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// Your Firebase config (SAFE to expose on web)
const firebaseConfig = {
  apiKey: "AIzaSyCfuiRIJ_CCfQJa371oOzSpHHqOS5ObYyA",
  authDomain: "fairdose-c2f86.firebaseapp.com",
  projectId: "fairdose-c2f86",
  storageBucket: "fairdose-c2f86.firebasestorage.app",
  messagingSenderId: "980917471438",
  appId: "1:980917471438:web:13b6cddc465e6fe812e89f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Export db
export { db };
