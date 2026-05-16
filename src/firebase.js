import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBxWSvYF_qQbn79un80u7BNhZdKe3xOjow",
  authDomain: "bondit-app.firebaseapp.com",
  projectId: "bondit-app",
  storageBucket: "bondit-app.firebasestorage.app",
  messagingSenderId: "363866168810",
  appId: "1:363866168810:web:9d33e6e637b8e7a3512693",
  measurementId: "G-2PNXSF6G80"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
