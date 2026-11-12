import { initializeApp } from 'firebase/app';
import {
  getAuth,
  connectAuthEmulator,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, doc, getDoc, setDoc } from 'firebase/firestore/lite';
import { FIREBASE_CONFIG } from '../firebaseConfig';
import { exportSave, importSave, loadSync, saveSync, onSaveChanged } from './storage';

// The account: the progress is also kept online (Firebase), so it's never lost and comes back on any phone.
// Firebase remembers the account on the phone: the next times, the player is logged in automatically.
// The save of an account = ONE document "users/{account id}": { save: "the JSON of exportSave()", savedAt }.
// (One text, not an object: some question keys are longer than what Firebase allows for a field name.)

// Tests on the PC only: `VITE_FIREBASE_EMULATOR=1 npm run dev` = a fake Firebase on the PC ("firebase emulators"),
// not the real one. (import.meta.env.DEV is false in the built site: this is never used there.)
const EMULATOR = import.meta.env.DEV && import.meta.env.VITE_FIREBASE_EMULATOR === '1';
const CONFIG = EMULATOR ? { apiKey: 'demo-key', projectId: 'demo-prep-my-toeic' } : FIREBASE_CONFIG;

export const CLOUD_READY = CONFIG.apiKey !== ''; // false = no Firebase project yet: no accounts
const UPLOAD_AFTER = 2000; // ms: several changes in a row = one upload

let auth = null;
let db = null;
let user = null; // the logged-in account (null = none)
let ready = false; // the first check with the cloud is done. Before it: no upload (it could erase a newer save)
let timer = null;
let status = 'off'; // 'off' (not logged in) | 'saving' | 'saved' | 'offline'
let statusListener = null;

function setStatus(newStatus) {
  status = newStatus;
  if (statusListener) statusListener(status);
}

// callback(status): called now, then each time the status changes. Returns the function that stops listening.
export function listenSyncStatus(callback) {
  statusListener = callback;
  callback(status);
  return function stopListening() {
    if (statusListener === callback) statusListener = null;
  };
}

function userDoc() {
  return doc(db, 'users', user.uid);
}

// When the app opens. onAccount(email | null): who is logged in (called again at each login / logout).
export function startCloud(onAccount) {
  if (!CLOUD_READY) return;
  const app = initializeApp(CONFIG);
  auth = getAuth(app);
  db = getFirestore(app);
  if (EMULATOR) {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
  }
  onSaveChanged(scheduleUpload);
  window.addEventListener('online', scheduleUpload); // back online: send what's waiting

  // The automatic login: Firebase gives the account it remembers (or null), then every login / logout.
  onAuthStateChanged(auth, function accountChanged(newUser) {
    user = newUser;
    ready = false;
    onAccount(newUser ? newUser.email : null);
    if (newUser) {
      firstSync();
    } else {
      setStatus('off');
    }
  });
}

// The cloud save, or null (no save yet, or a broken one).
function readCloud(snapshot) {
  if (!snapshot.exists()) return null;
  const data = snapshot.data();
  try {
    return typeof data.save === 'string' && Number.isFinite(data.savedAt)
      ? { save: JSON.parse(data.save), savedAt: data.savedAt }
      : null;
  } catch (error) {
    return null;
  }
}

// Just logged in (or the app just opened): who has the right save, the phone or the cloud?
async function firstSync() {
  setStatus('saving');
  try {
    const cloud = readCloud(await getDoc(userDoc()));
    const sync = loadSync();
    if (cloud && cloud.savedAt !== sync.syncedAt) {
      // Saved from another phone since (or this phone has never had this account's save): the cloud wins.
      importSave(cloud.save);
      saveSync({ syncedAt: cloud.savedAt, dirty: false });
      // Reload: the app reads the saves when it opens. (Only if the phone really kept them: else it would reload forever.)
      if (loadSync().syncedAt === cloud.savedAt) window.location.reload();
      else setStatus('offline');
      return;
    }
    ready = true;
    if (!cloud || sync.dirty) {
      await upload(); // a new account, or changes made here: the cloud gets them
    } else {
      setStatus('saved');
    }
  } catch (error) {
    setStatus('offline'); // no internet: we try again at the next change, or when the internet is back
  }
}

// Sends the phone's save to the cloud.
async function upload() {
  const text = JSON.stringify(exportSave());
  const savedAt = Date.now();
  setStatus('saving');
  try {
    await setDoc(userDoc(), { save: text, savedAt: savedAt });
    // Something changed during the upload: still "dirty" (another upload is already planned).
    saveSync({ syncedAt: savedAt, dirty: JSON.stringify(exportSave()) !== text });
    setStatus('saved');
  } catch (error) {
    setStatus('offline');
  }
}

// Something changed: send it in 2 s (if more changes come, we wait for the last one).
function scheduleUpload() {
  if (!user) return;
  clearTimeout(timer);
  timer = setTimeout(ready ? upload : firstSync, UPLOAD_AFTER);
}

// ---------- The buttons of the account page ----------
// They throw an error when it fails (wrong password...): see errorMessage.

export async function createAccount(email, password) {
  await createUserWithEmailAndPassword(auth, email.trim(), password);
}

export async function logIn(email, password) {
  await signInWithEmailAndPassword(auth, email.trim(), password);
}

export async function forgotPassword(email) {
  await sendPasswordResetEmail(auth, email.trim());
}

// The progress stays on the phone, it's just not sent anymore.
export async function logOut() {
  clearTimeout(timer);
  await signOut(auth);
  saveSync({ syncedAt: null, dirty: false });
}

// A Firebase error -> a sentence for the player.
export function errorMessage(error) {
  const code = error && error.code;
  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found')
    return 'Wrong email or password.';
  if (code === 'auth/email-already-in-use') return 'This email already has an account: log in instead.';
  if (code === 'auth/invalid-email' || code === 'auth/missing-email') return 'This email is not valid.';
  if (code === 'auth/weak-password' || code === 'auth/missing-password') return 'Password: 6 characters minimum.';
  if (code === 'auth/network-request-failed') return 'No internet connection.';
  if (code === 'auth/too-many-requests') return 'Too many tries. Wait a bit, then try again.';
  return 'Something went wrong (' + (code || 'unknown error') + ').';
}
