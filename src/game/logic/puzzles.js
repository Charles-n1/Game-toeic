import { PUZZLES } from '../world/map';
import { isSolid } from '../world/map';
import { WILD_PROPS } from '../data/zones';
import { startFight } from './fight';
import { makeDuel } from './duels';
import { earnLexis, gainXp, addItem } from './player';
import { say, notify } from './messages';
import { burst } from './particles';
import { cue } from './cues';
import { pickRandom } from '../../logic/random';

// The puzzles of the dungeons, and the riddles of the obelisks.
//   - a plate: a boulder must be pushed onto it (walk into the boulder to push it). Then its gate opens.
//   - a word door: it opens to good sentences (a short duel of hard questions).
//   - an obelisk, in the wild: a riddle of very hard sentences. Solved once: Lexis, XP and a treasure.
// game.puzzles: { id: { open, boulder: { x, y } } }. game.riddles: { id: true } (the obelisks solved).

const RIDDLE_REWARDS = ['gem', 'oldCoin', 'bigPotion', 'manaPotion', 'gem'];

export function firstPuzzles() {
  const puzzles = {};
  for (const puzzle of PUZZLES) puzzles[puzzle.id] = { open: false, boulder: puzzle.boulder ? { ...puzzle.boulder } : null };
  return puzzles;
}

function stateOf(game, puzzle) {
  if (!game.puzzles[puzzle.id]) game.puzzles[puzzle.id] = { open: false, boulder: puzzle.boulder ? { ...puzzle.boulder } : null };
  return game.puzzles[puzzle.id];
}

// The props of the puzzles right now: the closed gates and doors, the boulders (they block), the plates.
export function puzzleProps(game) {
  const props = [];
  for (const puzzle of PUZZLES) {
    const state = stateOf(game, puzzle);
    if (!state.open) puzzle.gate.forEach((tile) => props.push({ kind: puzzle.kind === 'word' ? 'wordDoor' : 'bars', x: tile.x, y: tile.y, w: 1, h: 1, puzzle: puzzle.id }));
    if (puzzle.plate) {
      props.push({ kind: 'plate', x: puzzle.plate.x, y: puzzle.plate.y, w: 1, h: 1, walkable: true, pressed: state.open });
      props.push({ kind: 'boulder', x: state.boulder.x, y: state.boulder.y, w: 1, h: 1, puzzle: puzzle.id });
    }
  }
  return props;
}

function boulderAt(game, x, y) {
  return PUZZLES.find((puzzle) => puzzle.plate && stateOf(game, puzzle).boulder.x === x && stateOf(game, puzzle).boulder.y === y) || null;
}

// The hero walks into the tile (x, y) going (dx, dy): if a boulder is there, it rolls one tile (if it can).
// Returns true if it moved (then the world must be refreshed).
export function pushBoulder(game, x, y, dx, dy) {
  const puzzle = boulderAt(game, x, y);
  if (!puzzle || (dx !== 0 && dy !== 0)) return false;
  const state = stateOf(game, puzzle);
  const toX = x + dx;
  const toY = y + dy;
  if (isSolid(toX + 0.5, toY + 0.5) || boulderAt(game, toX, toY)) return false;
  state.boulder = { x: toX, y: toY };
  cue(game, 'step');
  if (toX === puzzle.plate.x && toY === puzzle.plate.y && !state.open) {
    state.open = true;
    burst(game, toX + 0.5, toY + 0.5, '#7cfc9a', 20);
    notify(game, '⚙️ Click! Somewhere, a gate opens.', '#7cfc9a');
  }
  return true;
}

// A boulder stuck in a corner can be put back where it was (the puzzle can always be solved).
export function boulderPuzzleAt(game, x, y) {
  return boulderAt(game, x, y);
}

export function offerBoulderReset(game, puzzle, refresh) {
  say(game, null, ['A heavy boulder. Pushed into a corner, it can not move anymore...'], [
    {
      label: 'Roll it back to where it was',
      icon: 'dots',
      run: () => {
        stateOf(game, puzzle).boulder = { ...puzzle.boulder };
        refresh();
      },
    },
    { label: 'Leave it', run: () => {} },
  ]);
}

// The closed word door at the tile (x, y), or null.
export function wordDoorAt(game, x, y) {
  return PUZZLES.find((puzzle) => puzzle.kind === 'word' && !stateOf(game, puzzle).open && puzzle.gate.some((tile) => tile.x === x && tile.y === y)) || null;
}

// A spirit of words guards the doors and the obelisks (drawn like a wisp).
function riddleKeeper(name) {
  return { id: null, name: name, look: null };
}

// The door asks for 3 good sentences (hard ones). 2 mistakes: it stays closed (the hero can try again).
export function openWordDoor(game, puzzle, refresh) {
  const keeper = riddleKeeper('The Door of Words');
  function win() {
    stateOf(game, puzzle).open = true;
    notify(game, '🚪 The runes fade. The door opens.', '#ffd23f');
    refresh();
  }
  function lose() {
    say(game, null, ['The runes stay bright. The door waits for better sentences.']);
  }
  say(game, null, ['Glowing runes cover the door. They form a sentence with a hole in it...'], [
    { label: 'Complete the sentences', icon: 'book', run: () => startFight(game, makeDuel(keeper, { title: 'Riddle', category: game.focus.current, tag: 'hard', health: 3, mistakesAllowed: 2, shape: 'wisp', onWin: win, onLose: lose })) },
    { label: 'Leave', run: () => {} },
  ]);
}

// ---------- The obelisks of the wild ----------

export function obeliskNear(game) {
  return WILD_PROPS.find((prop) => prop.kind === 'obelisk' && Math.hypot(prop.x + 0.5 - game.player.x, prop.y + 0.5 - game.player.y) < 1.6) || null;
}

export function isRiddleSolved(game, obelisk) {
  return game.riddles[obelisk.riddle] === true;
}

// An obelisk asks 4 very hard sentences (extreme). Solved: a reward that is worth the walk.
export function readObelisk(game, obelisk) {
  if (isRiddleSolved(game, obelisk)) {
    say(game, null, ['The letters of the obelisk are quiet now. You already gave it its words.']);
    return;
  }
  const keeper = riddleKeeper('The Obelisk');
  function win() {
    game.riddles[obelisk.riddle] = true;
    const reward = pickRandom(RIDDLE_REWARDS);
    earnLexis(game, 150);
    gainXp(game, 80);
    addItem(game.player, reward);
    burst(game, obelisk.x + 0.5, obelisk.y, '#8fd6ff', 30);
    say(game, null, ['The letters glow, then fall quiet. A hidden drawer opens at the foot of the stone.', '+150 Lexis, +80 XP, and: ' + reward + '.']);
  }
  function lose() {
    say(game, null, ['The letters flicker and go dark. Come back stronger: the obelisk will wait.']);
  }
  say(game, null, ['An obelisk older than the kingdom. Its letters glow: a riddle of words, very hard.'], [
    { label: 'Answer the riddle (4 sentences)', icon: 'book', run: () => startFight(game, makeDuel(keeper, { title: 'Riddle of the Obelisk', category: game.focus.current, tag: 'extreme', health: 4, mistakesAllowed: 2, shape: 'wisp', onWin: win, onLose: lose })) },
    { label: 'Leave', run: () => {} },
  ]);
}
