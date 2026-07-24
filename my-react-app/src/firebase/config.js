// src/firebase/config.js
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDy5BOudUC5GatYm4ZgFO8EuCTOkK6JUqI",
  authDomain: "anesguard.firebaseapp.com",
  projectId: "anesguard",
  storageBucket: "anesguard.firebasestorage.app",
  messagingSenderId: "1011299271251",
  appId: "1:1011299271251:web:0b26bb318b06a922587ca6",
  measurementId: "G-XRP041Z5BV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword
};