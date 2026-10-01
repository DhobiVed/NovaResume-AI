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
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  getDocs,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  increment,
  writeBatch
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';

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

// Initialize Firebase App & Auth
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Force local storage persistence across browser redirects & multi-tabs
setPersistence(auth, browserLocalPersistence).catch(() => {});

export const googleProvider = new GoogleAuthProvider();

// Initialize Firestore
let db: any = null;
try {
  db = getFirestore(app);
} catch (err) {
  console.warn('Firestore database notice:', err);
}

// Initialize Firebase Storage
let storage: any = null;
try {
  storage = getStorage(app);
} catch (err) {
  console.warn('Firebase Storage notice:', err);
}

export { db, storage };
export type { FirebaseUser };
export {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  getDocs,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  increment,
  writeBatch,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
};

