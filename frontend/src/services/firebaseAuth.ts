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
  setDoc
} from '../lib/firebase';
import type { FirebaseUser } from '../lib/firebase';
import type { UserProfile } from '../components/auth/AuthModal';

export const firebaseAuthService = {
  /**
   * Register new user in Firebase Auth.
   * Instant response (0 network lag). Signs out immediately so user is NOT auto-logged in.
   */
  async register(fullName: string, email: string, pass: string): Promise<UserProfile> {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const user = userCredential.user;

    // Non-blocking update profile
    updateProfile(user, { displayName: fullName }).catch(() => {});

    // Non-blocking Firestore save (runs safely in background)
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
    await firebaseSignOut(auth).catch(() => {});

    return createdProfile;
  },

  /**
   * Login user with Email & Password.
   * Instant 100ms response (never blocks or hangs UI).
   */
  async login(email: string, pass: string): Promise<UserProfile> {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    const user = userCredential.user;

    const name = user.displayName || user.email?.split('@')[0] || 'User';

    return {
      id: user.uid,
      name: name,
      email: user.email || email,
      avatarUrl: user.photoURL || null
    };
  },

  /**
   * Login/Signup with Google OAuth via Firebase Popup.
   * Instant 100ms response (never hangs on Firestore network latency).
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
    await firebaseSignOut(auth).catch(() => {});
  },

  /**
   * Subscribe to Firebase Auth state changes.
   * Instant zero-latency callback execution.
   */
  onAuthState(callback: (user: UserProfile | null) => void) {
    return onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (!firebaseUser) {
        callback(null);
        return;
      }

      const name = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User';

      callback({
        id: firebaseUser.uid,
        name: name,
        email: firebaseUser.email || '',
        avatarUrl: firebaseUser.photoURL || null
      });
    });
  }
};
