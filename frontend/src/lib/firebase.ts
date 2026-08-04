import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

// Production Firebase Configuration for novaresumeai
const firebaseConfig = {
  apiKey: "AIzaSyB7EBkWkFc7EJeJRcNaPNKkAZ2cjBZ-sbw",
  authDomain: "novaresumeai.firebaseapp.com",
  projectId: "novaresumeai",
  storageBucket: "novaresumeai.firebasestorage.app",
  messagingSenderId: "295014863853",
  appId: "1:295014863853:web:ac259ae28ab91298398de4",
  measurementId: "G-N74F5W138G"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export type { FirebaseUser };
export {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  signInWithPopup,
  doc,
  setDoc,
  getDoc,
  updateDoc
};
