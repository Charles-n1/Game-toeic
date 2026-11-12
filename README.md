# Prep my TOEIC

Train for the TOEIC reading part: training with justifications, timed tests, spaced-repetition recovery, and a spider chart of your grammar categories.

**Open it:** https://charles-n1.github.io/Game-toeic/

## Lexia, the game (⚔️ in the footer)

An isekai in 2D where every fight is a TOEIC question. To enter: do the level test, or type your reading score.

- **Fights**: a good answer strikes (half a heart by default), a bad one lets the monster strike. Answer fast to strike first.
  The time to answer depends on your speed against the monster's.
- **Types**: the color of a monster is its grammar category (pink = gerunds, yellow = tenses...). Most monsters are of
  the category you must train. When your goal is reached in it, the training swaps to your next weakness, and the
  category comes back later. Failed questions come back too, like in Recovery. Every answer counts in the app's stats.
- **Monsters**: small ones ask RC 10 / RC 8, big ones the hard questions, the demons of the north the long texts (RC 55).
- **The world**: day and night, 2 villages, 3 dungeons, the castle of the Demon King, a raid on the village every 7 nights.
  Talk, help (quests), give gifts, recruit, date, marry. Plant carrots, dig treasures, work as a scribe, negotiate prices.
- **Death**: Aria carries you home 3 times. After that, dying erases the game (not your stats).

Keys: arrows / WASD to walk, `Space` or `E` to act, `1`-`4` to answer, `B` bag, `P` powers, `J` journal, `M` map.

The code is in `src/game/`: `data/` (monsters, people, story...), `logic/` (the rules, one file per subject),
`draw/` (the canvas) and `ui/` (the screens).

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
npm run dev     # http://localhost:5173/Game-toeic/
npm run build   # the site goes in dist/
```

Test the accounts without touching the real Firebase (needs Java):

```bash
npx firebase-tools emulators:start --only auth,firestore --project demo-prep-my-toeic
VITE_FIREBASE_EMULATOR=1 npm run dev   # in another terminal
```

Every push to `main` publishes the site automatically (GitHub Actions).
