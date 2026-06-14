// sync.js — Firebase wrapper using gstatic CDN (shares state correctly across modules).
// Loaded by index.html as type="module" and exposes window.RPGLifeSync.

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js';
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js';
import {
  initializeFirestore,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js';

const cfg = window.FIREBASE_CONFIG;
if (!cfg || cfg.apiKey === 'PASTE_API_KEY_HERE') {
  window.__RPGLIFE_NEEDS_CONFIG__ = true;
}

let app, auth, db;

if (!window.__RPGLIFE_NEEDS_CONFIG__) {
  try {
    app = initializeApp(cfg);
    auth = getAuth(app);
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
    });
  } catch (e) {
    console.error('Firebase init failed:', e);
    window.__RPGLIFE_INIT_ERROR__ = String(e.message || e);
  }
}

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

// Firestore does not support nested arrays (arrays-of-arrays).
// Duration XP curves are stored as [[minutes, xp], ...] in app memory,
// which Firestore rejects. We convert to/from [{m, x}, ...] at the
// Firestore boundary — transparently, so the rest of the app is unchanged.

function encodeState(state) {
  if (!state || !state.activities) return state;
  return {
    ...state,
    activities: state.activities.map(act => {
      if (act.type !== 'duration' || !Array.isArray(act.curve)) return act;
      return {
        ...act,
        curve: act.curve.map(point =>
          Array.isArray(point) ? { m: point[0], x: point[1] } : point
        ),
      };
    }),
  };
}

function decodeState(state) {
  if (!state || !state.activities) return state;
  return {
    ...state,
    activities: state.activities.map(act => {
      if (act.type !== 'duration' || !Array.isArray(act.curve)) return act;
      return {
        ...act,
        curve: act.curve.map(point =>
          (point && typeof point === 'object' && 'm' in point)
            ? [point.m, point.x]
            : point
        ),
      };
    }),
  };
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
        return { state: decodeState(data.state) || null, updatedAt: data.updatedAt || 0 };
      }
      return { state: null, updatedAt: 0 };
    } catch (e) {
      console.error('loadState failed:', e);
      return { state: null, updatedAt: 0 };
    }
  },
  async saveState(uid, state) {
    const encoded = encodeState(state);
    async function attempt() {
      await setDoc(doc(db, 'users', uid), {
        state: encoded,
        updatedAt: Date.now(),
      }, { merge: true });
    }
    try {
      await attempt();
      return { ok: true };
    } catch (e) {
      const code = e && e.code;
      // Retry once on errors that are typically transient (not permission errors)
      const isTransient = !code || code === 'unavailable' || code === 'deadline-exceeded' || code === 'resource-exhausted';
      if (isTransient) {
        try {
          await new Promise(r => setTimeout(r, 1000)); // brief wait
          await attempt();
          return { ok: true };
        } catch (e2) {
          console.error('saveState failed after retry:', e2);
          return { ok: false, error: String((e2 && e2.message) || e2) };
        }
      }
      console.error('saveState failed:', e);
      return { ok: false, error: String((e && e.message) || e) };
    }
  },
  subscribeToState(uid, callback) {
    if (!db) return () => {};
    const ref = doc(db, 'users', uid);
    return onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        callback(decodeState(data.state) || null, data.updatedAt || 0);
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
