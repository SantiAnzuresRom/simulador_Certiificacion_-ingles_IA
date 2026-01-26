import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
       apiKey: "AIzaSyA_7yxFVOEC9z079J58qT27QHLKfL_f5io",
  authDomain: "simulator-certification-cf6dd.firebaseapp.com",
  projectId: "simulator-certification-cf6dd",
  storageBucket: "simulator-certification-cf6dd.firebasestorage.app",
  messagingSenderId: "617043166827",
  appId: "1:617043166827:web:66e91f7bbc393c7586532e"
};


const firebase_app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(firebase_app);
export const db = getFirestore(firebase_app); 

