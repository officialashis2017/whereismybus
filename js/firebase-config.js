// Firebase configuration
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCmDnkrfqxXvSZVqhknvKHDz3fPWjEP0tE",
  authDomain: "whereismybus-30450.firebaseapp.com",
  projectId: "whereismybus-30450",
  storageBucket: "whereismybus-30450.firebasestorage.app",
  messagingSenderId: "688245905652",
  appId: "1:688245905652:web:a698adccacc004d3ba26a1",
  measurementId: "G-ER7XHC9RK3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Make Firebase instances available globally for legacy code
window.firebaseApp = app;
window.firebaseDb = db;
window.firebaseAuth = auth;

export { app, db, auth }; 