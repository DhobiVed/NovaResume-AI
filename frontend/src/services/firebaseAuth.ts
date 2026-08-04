import {
  auth,
  db,
  googleProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  doc,
  setDoc
} from '../lib/firebase';
import type { FirebaseUser } from '../lib/firebase';
import type { UserProfile } from '../components/auth/AuthModal';

// Guard flag to prevent onAuthStateChanged from logging in user during registration
let isRegistering = false;

export const firebaseAuthService = {
  /**
   * Register new user in Firebase Auth.
   * Explicitly signs out and blocks onAuthStateChanged auto-login.
   */
  async register(fullName: string, email: string, pass: string): Promise<UserProfile> {
    isRegistering = true;
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const user = userCredential.user;

      // Update display name in Firebase Auth
      await updateProfile(user, { displayName: fullName }).catch(() => {});

      // Safely store user document in Firestore if active
      if (db) {
        try {
          const userRef = doc(db, 'users', user.uid);
          setDoc(userRef, {
            uid: user.uid,
            name: fullName,
            email: user.email,
            createdAt: new Date().toISOString()
          }, { merge: true }).catch(() => {});
        } catch {}
      }

      const createdProfile: UserProfile = {
        id: user.uid,
        name: fullName,
        email: user.email || email,
        avatarUrl: user.photoURL || null
      };

      // Explicitly sign out so user MUST log in manually
      await firebaseSignOut(auth);

      return createdProfile;
    } finally {
      // Suppress auth listener for 1s to ensure registration NEVER triggers auto-login
      setTimeout(() => {
        isRegistering = false;
      }, 1000);
    }
  },

  /**
   * Login user with Email & Password.
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
   * Login/Signup with Google OAuth.
   * Auto-detects mobile devices and uses signInWithRedirect for 100% mobile compatibility.
   */
  async loginWithGoogle(): Promise<UserProfile | null> {
    const isMobile = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile) {
      console.log('Mobile device detected: launching Google Redirect Auth...');
      await signInWithRedirect(auth, googleProvider);
      return null;
    }

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userProfile: UserProfile = {
        id: user.uid,
        name: user.displayName || user.email?.split('@')[0] || 'Google User',
        email: user.email || '',
        avatarUrl: user.photoURL || null
      };

      if (db) {
        try {
          const userRef = doc(db, 'users', user.uid);
          setDoc(userRef, {
            uid: user.uid,
            name: userProfile.name,
            email: userProfile.email,
            avatarUrl: userProfile.avatarUrl,
            updatedAt: new Date().toISOString()
          }, { merge: true }).catch(() => {});
        } catch {}
      }

      return userProfile;
    } catch (err: any) {
      console.warn('Google Popup login error, retrying with Redirect mode:', err);
      
      // Fallback to Redirect mode for any popup blocker or iframe restrictions
      if (err.code !== 'auth/popup-closed-by-user') {
        await signInWithRedirect(auth, googleProvider);
        return null;
      }

      throw err;
    }
  },

  /**
   * Check for Google Redirect Result on App Load (for mobile devices)
   */
  async checkRedirectResult(): Promise<UserProfile | null> {
    try {
      const result = await getRedirectResult(auth);
      if (result && result.user) {
        const user = result.user;
        const userProfile: UserProfile = {
          id: user.uid,
          name: user.displayName || user.email?.split('@')[0] || 'Google User',
          email: user.email || '',
          avatarUrl: user.photoURL || null
        };

        if (db) {
          try {
            const userRef = doc(db, 'users', user.uid);
            setDoc(userRef, {
              uid: user.uid,
              name: userProfile.name,
              email: userProfile.email,
              avatarUrl: userProfile.avatarUrl,
              updatedAt: new Date().toISOString()
            }, { merge: true }).catch(() => {});
          } catch {}
        }

        return userProfile;
      }
    } catch (err) {
      console.warn('Redirect result check:', err);
    }
    return null;
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
   */
  onAuthState(callback: (user: UserProfile | null) => void) {
    return onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      // Ignore auth state changes during registration process
      if (isRegistering) {
        callback(null);
        return;
      }

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
