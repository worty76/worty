// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDr4TB-kfFY-v-Ex2fow8OjrB7xv8TYiTw",
  authDomain: "shopcart-4dbd1.firebaseapp.com",
  projectId: "shopcart-4dbd1",
  storageBucket: "shopcart-4dbd1.appspot.com",
  messagingSenderId: "19011260530",
  appId: "1:19011260530:web:e7c66e1815b9358ee3b2eb",
  measurementId: "G-28CB5XYQF2",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const database = getFirestore(app);
