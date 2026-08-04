import {
  auth,
  db,
  googleProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
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
   * Register new user in Firebase Auth & create user document in Firestore.
   * Immediately signs out so user is NOT auto-logged in upon registration.
   */
  async register(fullName: string, email: string, pass: string): Promise<UserProfile> {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const user = userCredential.user;

    // Set display name in Firebase Auth
    await updateProfile(user, { displayName: fullName }).catch(() => {});

    // Non-blocking Firestore save (never hangs UI)
    const userRef = doc(db, 'users', user.uid);
    setDoc(userRef, {
      uid: user.uid,
      name: fullName,
      email: user.email,
      createdAt: new Date().toISOString()
    }, { merge: true }).catch(() => {});

    const createdProfile: UserProfile = {
      id: user.uid,
      name: fullName,
      email: user.email || email,
      avatarUrl: user.photoURL || null
    };

    // Immediately sign out so registration does NOT auto-login
    await firebaseSignOut(auth);

    return createdProfile;
  },

  /**
   * Login user with Email & Password
   */
  async login(email: string, pass: string): Promise<UserProfile> {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    const user = userCredential.user;

    let name = user.displayName;
    if (!name) {
      try {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          name = userDoc.data().name;
        }
      } catch {
        name = user.email?.split('@')[0] || 'User';
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
   * Login/Signup with Google OAuth via Firebase Popup.
   * Instant UI response (never hangs on Firestore network latency).
   */
  async loginWithGoogle(): Promise<UserProfile> {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    const userProfile: UserProfile = {
      id: user.uid,
      name: user.displayName || user.email?.split('@')[0] || 'Google User',
      email: user.email || '',
      avatarUrl: user.photoURL || null
    };

    // Non-blocking Firestore save (runs safely in background without blocking login completion)
    const userRef = doc(db, 'users', user.uid);
    setDoc(userRef, {
      uid: user.uid,
      name: userProfile.name,
      email: userProfile.email,
      avatarUrl: userProfile.avatarUrl,
      updatedAt: new Date().toISOString()
    }, { merge: true }).catch((err) => {
      console.warn('Firestore user profile sync warning:', err);
    });

    return userProfile;
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
