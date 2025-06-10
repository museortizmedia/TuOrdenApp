import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIRE_KEY,
  authDomain: "tu-orden-app-6e39c.firebaseapp.com",
  projectId: "tu-orden-app-6e39c",
  storageBucket: "tu-orden-app-6e39c.firebasestorage.app",
  messagingSenderId: "48343587884",
  appId: "1:48343587884:web:6e21ae6acf92dd20648589"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
