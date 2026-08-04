import {
  auth,
  db,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  doc,
  setDoc,
  getDoc
} from '../lib/firebase';
import type { FirebaseUser } from '../lib/firebase';
import type { UserProfile } from '../components/auth/AuthModal';

export const firebaseAuthService = {
  /**
   * Register new user in Firebase Auth & create user document in Firestore
   */
  async register(fullName: string, email: string, pass: string): Promise<UserProfile> {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const user = userCredential.user;

    // Set display name in Firebase Auth
    await updateProfile(user, { displayName: fullName });

    // Store User document in Firestore users collection
    const userRef = doc(db, 'users', user.uid);
    const profileData = {
      uid: user.uid,
      name: fullName,
      email: user.email,
      createdAt: new Date().toISOString()
    };
    await setDoc(userRef, profileData, { merge: true });

    return {
      id: user.uid,
      name: fullName,
      email: user.email || email,
      avatarUrl: user.photoURL || null
    };
  },

  /**
   * Login user with Email & Password
   */
  async login(email: string, pass: string): Promise<UserProfile> {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    const user = userCredential.user;

    // Fetch user document from Firestore if name isn't set in auth
    let name = user.displayName;
    if (!name) {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        name = userDoc.data().name;
      }
    }

    return {
      id: user.uid,
      name: name || user.email?.split('@')[0] || 'User',
      email: user.email || email,
      avatarUrl: user.photoURL || null
    };
  },

  /**
   * Send Password Reset Email via Firebase Auth
   */
  async sendPasswordReset(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
  },

  /**
   * Sign out current user
   */
  async logout(): Promise<void> {
    await firebaseSignOut(auth);
  },

  /**
   * Subscribe to Firebase Auth state changes
   */
  onAuthState(callback: (user: UserProfile | null) => void) {
    return onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (!firebaseUser) {
        callback(null);
        return;
      }

      let name = firebaseUser.displayName;
      if (!name) {
        try {
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            name = userDoc.data().name;
          }
        } catch {
          name = firebaseUser.email?.split('@')[0] || 'User';
        }
      }

      callback({
        id: firebaseUser.uid,
        name: name || firebaseUser.email?.split('@')[0] || 'User',
        email: firebaseUser.email || '',
        avatarUrl: firebaseUser.photoURL || null
      });
    });
  }
};
