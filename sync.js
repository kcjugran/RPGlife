// sync.js — Firebase wrapper as an ES module.
// Loaded by index.html as type="module" and exposes window.RPGLifeSync.

import { initializeApp } from './vendor/firebase-app.js';
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from './vendor/firebase-auth.js';
import {
  initializeFirestore,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  persistentLocalCache,
  persistentMultipleTabManager,
} from './vendor/firebase-firestore.js';

const cfg = window.FIREBASE_CONFIG;
if (!cfg || cfg.apiKey === 'PASTE_API_KEY_HERE') {
  window.__RPGLIFE_NEEDS_CONFIG__ = true;
}

let app, auth, db;

if (!window.__RPGLIFE_NEEDS_CONFIG__) {
  try {
    app = initializeApp(cfg);
    auth = getAuth(app);
    // Firestore with offline persistence so the app keeps working without internet
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
    });
  } catch (e) {
    console.error('Firebase init failed:', e);
    window.__RPGLIFE_INIT_ERROR__ = String(e.message || e);
  }
}

// Surface a friendly auth-error message
function friendlyError(err) {
  const code = (err && err.code) || '';
  if (code === 'auth/invalid-email') return 'That email address doesn\'t look right.';
  if (code === 'auth/missing-password') return 'Please enter a password.';
  if (code === 'auth/weak-password') return 'Password should be at least 6 characters.';
  if (code === 'auth/email-already-in-use') return 'An account with this email already exists. Try signing in instead.';
  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found')
    return 'Email or password doesn\'t match an account.';
  if (code === 'auth/network-request-failed') return 'Network problem — check your connection.';
  if (code === 'auth/too-many-requests') return 'Too many tries. Wait a minute and try again.';
  return (err && err.message) || 'Something went wrong.';
}

const RPGLifeSync = {
  isConfigured() {
    return !window.__RPGLIFE_NEEDS_CONFIG__ && !window.__RPGLIFE_INIT_ERROR__;
  },
  configError() {
    return window.__RPGLIFE_INIT_ERROR__ || null;
  },
  onAuthChange(callback) {
    if (!auth) return () => {};
    return onAuthStateChanged(auth, callback);
  },
  async signIn(email, password) {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return { user: result.user };
    } catch (e) {
      return { error: friendlyError(e) };
    }
  },
  async signUp(email, password) {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      return { user: result.user };
    } catch (e) {
      return { error: friendlyError(e) };
    }
  },
  async signOut() {
    try {
      await signOut(auth);
    } catch (e) {
      console.error('Sign out failed:', e);
    }
  },
  async loadState(uid) {
    try {
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) {
        const data = snap.data();
        return data.state || null;
      }
      return null;
    } catch (e) {
      console.error('loadState failed:', e);
      return null;
    }
  },
  async saveState(uid, state) {
    try {
      await setDoc(doc(db, 'users', uid), {
        state,
        updatedAt: Date.now(),
      }, { merge: true });
      return true;
    } catch (e) {
      console.error('saveState failed:', e);
      return false;
    }
  },
  subscribeToState(uid, callback) {
    if (!db) return () => {};
    const ref = doc(db, 'users', uid);
    return onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        callback(data.state || null, data.updatedAt || 0);
      } else {
        callback(null, 0);
      }
    }, (err) => {
      console.error('subscribe error:', err);
    });
  },
};

window.RPGLifeSync = RPGLifeSync;
window.dispatchEvent(new Event('rpglife-sync-ready'));
