// The Firebase project of the app (the accounts + the cloud save). See README.md: "Accounts".
// Copy here the "firebaseConfig" given by Firebase (Project settings > Your apps > Web app).
// These values are NOT secret: they only say which project to talk to. What protects the data
// is the rules in firestore.rules (each account can only read and write its own save).
// apiKey empty = no accounts: the app works like before, only on the phone.
export const FIREBASE_CONFIG = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
};
