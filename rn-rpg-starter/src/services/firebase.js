import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD-3wQVq2S8I5YiO36iLCl0cksAli3BbCM",
  authDomain: "loreforgeapp.firebaseapp.com",
  projectId: "loreforgeapp",
  storageBucket: "loreforgeapp.firebasestorage.app",
  messagingSenderId: "923992909623",
  appId: "1:923992909623:web:1283f075996a4712809cb2",
  measurementId: "G-9ZF420F7FM"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, auth, db };
export default app;