// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "indianestate-73708.firebaseapp.com",
  projectId: "indianestate-73708",
  storageBucket: "indianestate-73708.appspot.com",
  messagingSenderId: "108139049135",
  appId: "1:108139049135:web:18097853288dad79f4e45a"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);