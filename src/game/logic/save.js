import { saveGameData, loadGameData, forgetGameData } from '../../logic/storage';
import { GAME_VERSION, wakeUp } from './newGame';

// The game is saved in the browser, like the rest of the app. Everything but `run` (what is on screen).

export function saveGame(game) {
  if (game.raid.active) return; // no save in the middle of a raid: closing the app can not skip it half-way
  const { run, ...saved } = game;
  saveGameData(saved);
}

// 🔒 A save that is broken, or from an old version of the game, is ignored (a new game starts).
function isValidSave(saved) {
  return saved !== null && typeof saved === 'object' && saved.version === GAME_VERSION && typeof saved.player === 'object' && saved.player !== null;
}

// The saved game, ready to play. null = no game yet.
export function loadGame() {
  const saved = loadGameData();
  if (!isValidSave(saved)) return null;
  wakeUp(saved);
  return saved;
}

export function forgetGame() {
  forgetGameData();
}
