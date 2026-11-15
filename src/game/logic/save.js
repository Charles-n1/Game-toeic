import { saveGameData, loadGameData, forgetGameData } from '../../logic/storage';
import { goalOf, CHAPTERS } from '../data/story';
import { GAME_VERSION, wakeUp } from './newGame';

// The game is saved in the browser, like the rest of the app: everything but `run` (what is on screen).
// There are 3 save slots. A save can also be exported to a file, and imported back (another browser, a backup).

export const SLOTS = [1, 2, 3];

export function saveGame(game) {
  if (game.raid.active) return; // no save in the middle of a raid: closing the app can not skip it half-way
  game.savedAt = Date.now();
  const { run, ...saved } = game;
  saveGameData(game.slot, saved);
}

// 🔒 A save that is broken, or from an old version of the game, is ignored.
function isValidSave(saved) {
  return saved !== null && typeof saved === 'object' && saved.version === GAME_VERSION && typeof saved.player === 'object' && saved.player !== null;
}

// The saved game of a slot, ready to play. null = no game in this slot.
export function loadGame(slot) {
  const saved = loadGameData(slot);
  if (!isValidSave(saved)) return null;
  saved.slot = slot;
  wakeUp(saved);
  return saved;
}

export function forgetGame(slot) {
  forgetGameData(slot);
}

// What the save screen shows about a slot: { name, level, day, goal, chapter, savedAt }. null = empty.
export function slotSummary(slot) {
  const saved = loadGameData(slot);
  if (!isValidSave(saved)) return null;
  const chapter = CHAPTERS[saved.goal] && CHAPTERS[saved.goal][saved.chapter];
  return {
    name: saved.player.name || 'Hero',
    level: saved.player.level,
    day: saved.day,
    goal: goalOf(saved.goal) ? goalOf(saved.goal).title : '',
    chapter: chapter ? chapter.title : 'The end',
    savedAt: saved.savedAt || 0,
  };
}

// The slot saved most recently (for "Continue"). null = no save at all.
export function lastSlot() {
  const saved = SLOTS.map((slot) => ({ slot: slot, summary: slotSummary(slot) })).filter((item) => item.summary);
  if (saved.length === 0) return null;
  return saved.reduce((last, item) => (item.summary.savedAt > last.summary.savedAt ? item : last)).slot;
}

// The save of a slot, as text (to put in a file). null = empty slot.
export function exportSave(slot) {
  const saved = loadGameData(slot);
  return isValidSave(saved) ? JSON.stringify(saved) : null;
}

// Puts a save file into a slot. Returns false if the file is not a save of this game.
export function importSave(slot, text) {
  let saved;
  try {
    saved = JSON.parse(text);
  } catch (error) {
    return false;
  }
  if (!isValidSave(saved)) return false;
  saveGameData(slot, { ...saved, slot: slot });
  return true;
}
