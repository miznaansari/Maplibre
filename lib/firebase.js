import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCVt40tduZZl1LDKkMTVenS3Ts-Wo2QviE",
  authDomain: "samad-agency.firebaseapp.com",
  projectId: "samad-agency",
  storageBucket: "samad-agency.firebasestorage.app",
  messagingSenderId: "850405386177",
  appId: "1:850405386177:web:1b929e896221eca0ad3140",
  measurementId: "G-BV4BXWG3YX"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();