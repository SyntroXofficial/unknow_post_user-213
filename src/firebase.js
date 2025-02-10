import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAUggY2U4HHhGZ4bMg-qlEeq1Des6jTiQA",
  authDomain: "azcorp-top.firebaseapp.com",
  projectId: "azcorp-top",
  storageBucket: "azcorp-top.firebasestorage.app",
  messagingSenderId: "311599697367",
  appId: "1:311599697367:web:bda4f9dff314ce51be0f92",
  measurementId: "G-H3XWXK4T2E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, analytics, auth, db, storage };