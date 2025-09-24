// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDM3OFz-Q9IoCz1jbvXt4Ywcc762Ng7hu8",
  authDomain: "project-kalpana-sih.firebaseapp.com",
  projectId: "project-kalpana-sih",
  storageBucket: "project-kalpana-sih.firebasestorage.app",
  messagingSenderId: "292165626067",
  appId: "1:292165626067:web:ec8a7531cbaf991129cc26"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Initialize and export Firebase services for use in other parts of our app
export const auth = getAuth(app);
export const db = getFirestore(app);