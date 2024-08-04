// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getFirestore} from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD8EPpEmXCvztCP0-HaBlqdJHUXv1khTn0",
  authDomain: "inventory-tracker-6e49c.firebaseapp.com",
  projectId: "inventory-tracker-6e49c",
  storageBucket: "inventory-tracker-6e49c.appspot.com",
  messagingSenderId: "707989901845",
  appId: "1:707989901845:web:c52b7aeded4c0f5b9e741c",
  measurementId: "G-QWV66BXBZH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
let analytics
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export {firestore, analytics};