import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "primeplaceestate.firebaseapp.com",
  projectId: "primeplaceestate",
  storageBucket: "primeplaceestate.firebasestorage.app",
  messagingSenderId: "908408857144",
  appId: "1:908408857144:web:1fef26b5801257198a7ccd",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export default app;