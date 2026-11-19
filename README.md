# Prep my TOEIC

Train for the TOEIC reading part: training with justifications, timed tests, spaced-repetition recovery, and a spider chart of your grammar categories.

**Open it:** https://charles-n1.github.io/Game-toeic/

## Lexia, the game (⚔️ in the footer)

An isekai in 2D where every fight is a TOEIC question. To enter: do the level test, or type your reading score.

- **Fights**: a good answer strikes (half a heart by default), a bad one lets the monster strike. Answer fast to strike first.
  The time to answer depends on your speed against the monster's. Everything is animated: the hero winds up, dashes
  and slashes (a crescent of light, golden on a critical hit), casts spells, drinks potions, is pushed back when hit,
  raises the sword when they win and falls when knocked out. The friends of the party fight behind the hero.
- **Types**: the color of a monster is its grammar category (pink = gerunds, yellow = tenses...). Most monsters are of
  the category you must train. When your goal is reached in it, the training swaps to your next weakness, and the
  category comes back later. Failed questions come back too, like in Recovery. Every answer counts in the app's stats.
- **Monsters**: small ones ask RC 10 / RC 8, big ones the hard questions, the demons of the north the long texts (RC 55).
- **The world**: an island with rivers, bridges, a desert, snowy peaks and a volcanic land. Day and night, 2 villages,
  3 dungeons, the castle of the Demon King (sealed until General Barbarism falls), a raid on the village every 7 nights.
- **The demon land**: the demons only appear on their land. They come out of the Silent Isle and take a bit more land
  every day (in red on the world map), often setting its forests on fire (the fire spreads from tree to tree, the rain
  puts it out). Beat a demon on their land to take it back; the bosses push it back. Their generals never leave the isle.
- **The world map** (`M`): what you explored, the rest is in the fog. The maps sold by Luna show more (roads, the whole
  land, the treasures). Main quest, side quests, shops, your party and a legend.
  Talk, help (quests), give gifts, recruit, date, marry. Plant carrots, dig treasures, work as a scribe, negotiate prices.
- **Death**: Aria carries you home 3 times. After that, dying erases the game (not your stats).

- **Menus**: a title menu (Continue / New game / Options / Credits), 3 save slots, and each save can be exported to a
  file and imported back. Options: music and effects volume, text speed, relaxed mode (+50% time to answer).
- **Your hero**: a name and an avatar (body, hair style, hair color, outfit).
- **Sound**: chiptune music and effects, played live by the game (no sound file).

Keys: arrows / WASD to walk, `Space` or `E` to act, `1`-`4` or `A`-`D` to answer, `Esc` menu, `I` inventory,
`C` stats, `P` powers, `J` journal, `M` map, `O` options.

The code is in `src/game/`: `data/` (monsters, people, story...), `logic/` (the rules, one file per subject),
`draw/` (the pixel art, painted with code: shaded balls, tubes and cloth lit from the top-left, dithered between
the tones of a color ramp; a few small icons are "text pictures" where one letter = one pixel) and `ui/` (the screens).
On a computer the screens are laid out side by side, like a console RPG; on a phone they are stacked.
The default hero (spiky brown hair, blue outfit) is drawn from a real sprite sheet: `art/hero-sheet.png` is cut by
`python3 tools/cut_hero_sheet.py` (Pillow, numpy, scipy) into `src/game/assets/hero/` (an atlas, the list of its
pictures and a portrait). Run it again after changing the sheet; the boxes of the pictures are listed in the script.
The pixel font is Pixelify Sans (SIL Open Font License, see `src/game/assets/fonts/OFL.txt`).

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
