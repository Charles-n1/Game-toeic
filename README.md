# Prep my TOEIC

Train for the TOEIC reading part: training with justifications, timed tests, spaced-repetition recovery, and a spider chart of your grammar categories.

**Open it:** https://charles-n1.github.io/Prep-my-toeicc/

## On iPhone

1. Open the link in **Safari**.
2. Tap **Share** → **Add to Home Screen**.
3. Open it from the icon: it works like an app, even offline.

Your progress is saved in the browser of your phone. Clearing Safari's website data erases it.

## Accounts (Firebase)

With an account, the progress is saved online (never lost, and on every phone), and the player stays logged in.
Until `src/firebaseConfig.js` is filled, there are no accounts: the app works as before, only on the phone.

Setup (once, free):

1. https://console.firebase.google.com → **Create a project** (Google Analytics: not needed).
2. **Build → Authentication** → Get started → Sign-in method → **Email/Password** → Enable.
3. **Build → Firestore Database** → Create database → a location in Europe → production mode.
4. Firestore → **Rules** → paste the content of `firestore.rules` → Publish.
5. **Project settings** (⚙) → Your apps → **Web** (`</>`) → register the app → copy the values of
   `firebaseConfig` into `src/firebaseConfig.js`.
6. Authentication → Settings → Authorized domains → add `charles-n1.github.io`.
7. Push: the site is published with accounts.

The values of `firebaseConfig.js` are not secret (they only name the project): the data is protected by
`firestore.rules` (each account can only read and write its own save).

## Develop

```bash
npm install
npm run dev     # http://localhost:5173/Prep-my-toeicc/
npm run build   # the site goes in dist/
```

Test the accounts without touching the real Firebase (needs Java):

```bash
npx firebase-tools emulators:start --only auth,firestore --project demo-prep-my-toeic
VITE_FIREBASE_EMULATOR=1 npm run dev   # in another terminal
```

Every push to `main` publishes the site automatically (GitHub Actions).
