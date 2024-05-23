// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs, addDoc, updateDoc, doc, deleteDoc } from "firebase/firestore"; 

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDjkgzwPUSj5kP_ZryOBgA4n17G7ZpTXJo",
  authDomain: "nextgen-e1796.firebaseapp.com",
  databaseURL: "https://nextgen-e1796-default-rtdb.firebaseio.com",
  projectId: "nextgen-e1796",
  storageBucket: "nextgen-e1796.appspot.com",
  messagingSenderId: "538712986423",
  appId: "1:538712986423:web:b8c4396d8004472f2f80b2",
  measurementId: "G-CH93G410RX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app); // Correct initialization for Firestore

export { db, collection, query, where, getDocs, addDoc, updateDoc, doc, deleteDoc };
