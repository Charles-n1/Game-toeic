import { TILE, tileAt, biomeAt } from '../world/map';
import { zoneAt, dungeonOf } from '../data/zones';
import { ITEMS } from '../data/items';
import { addItem } from './player';
import { DAY_SECONDS } from './clock';
import { isRaining, isWindy, isOutdoors } from './weather';
import { notify } from './messages';
import { burst, floatText } from './particles';
import { cue } from './cues';
import { isResourceDepleted, markResourceExhausted } from './realism/foodAndNature';

// The light of the hero. At night nobody has light by default, but the hero always carries a torch.
// The player lights it or puts it out when they want (key T, or the torch on the HUD).
// A lit torch burns about 5 real minutes, then goes out: light it again.
// Under the sky, the rain or a strong wind put the flame out, and the torch can not be lit until they stop.
// game.player.torchHours: the hours of the game of light left (0 = the torch is out).

const TORCH_MINUTES = 5;
export const TORCH_HOURS = (TORCH_MINUTES * 60 * 24) / DAY_SECONDS; // 5 real minutes, counted in hours of the game

const BLOWN_OUT = {
  rain: '🌧️ The rain put out your torch.',
  wind: '💨 The wind blew out your torch.',
};
const CAN_NOT_LIGHT = {
  rain: '🌧️ Too wet: the torch will not light in the rain.',
  wind: '💨 Too much wind: the flame dies at once.',
};

// ---------- Light ----------

export function hasLight(game) {
  return game.player.torchHours > 0;
}

// What stops the flame here: 'rain', 'wind', or null (nothing). Inside, nothing stops it.
export function torchBlocker(game) {
  if (!isOutdoors(game)) return null;
  if (isRaining(game)) return 'rain';
  if (isWindy(game)) return 'wind';
  return null;
}

// "4:32": the real minutes and seconds of light left.
export function torchTimeLeft(game) {
  const seconds = Math.ceil((game.player.torchHours * DAY_SECONDS) / 24);
  return Math.floor(seconds / 60) + ':' + String(seconds % 60).padStart(2, '0');
}

// ---------- Lighting and putting out the torch ----------

export function lightTorch(game) {
  if (hasLight(game)) return;
  const blocker = torchBlocker(game);
  if (blocker) {
    notify(game, CAN_NOT_LIGHT[blocker], '#ffb070');
    return;
  }
  game.player.torchHours = TORCH_HOURS;
  burst(game, game.player.x, game.player.y - 0.6, '#ffb040', 14);
  cue(game, 'coin');
  notify(game, '🔥 Your torch burns (' + TORCH_MINUTES + ' minutes).', '#ffd86b');
}

export function putOutTorch(game) {
  if (!hasLight(game)) return;
  game.player.torchHours = 0;
  notify(game, '🕯️ You put out your torch.', '#ffb070');
}

// The torch button: lit -> out, out -> lit.
export function toggleTorch(game) {
  if (hasLight(game)) putOutTorch(game);
  else lightTorch(game);
}

// Time passes: the torch burns. hours: the hours of the game that just passed.
export function burnTorch(game, hours) {
  const player = game.player;
  if (player.torchHours <= 0) return;
  const blocker = torchBlocker(game);
  if (blocker) {
    player.torchHours = 0;
    notify(game, BLOWN_OUT[blocker], '#ffb070');
    return;
  }
  player.torchHours = Math.max(0, player.torchHours - hours);
  if (player.torchHours === 0) notify(game, '🕯️ Your torch went out. Light it again (T).', '#ffb070');
}

// ---------- Gathering: a branch from a tree, flint stones from a rock ----------
// game.gathered: { "x,y": the day it was gathered }. A tree gives one branch a day, a rock one stone a day.

function keyOf(x, y) {
  return Math.floor(x) + ',' + Math.floor(y);
}

// What the tile gives: 'branch', 'flint', 'ore' or 'crystal' (a mine), or null (nothing, or a cactus).
function gatherableAt(x, y) {
  const tile = tileAt(x, y);
  if (tile === TILE.TREE && biomeAt(x, y) !== 'desert') return 'branch';
  if (tile === TILE.DEAD_TREE) return 'branch';
  if (tile === TILE.ROCK) return 'flint';
  if (tile === TILE.ORE) {
    if (dungeonOf(zoneAt(x, y).dungeon)?.crystals) return 'crystal';
    return ((Math.floor(x) * 7 + Math.floor(y) * 13) % 10 + 10) % 10 === 0 ? 'crystal' : 'ore';
  }
  return null;
}

// What the hero can gather on this tile right now (null = nothing).
export function canGather(game, x, y) {
  const itemId = gatherableAt(x, y);
  if (!itemId) return null;
  if (game?.realism && isResourceDepleted(game, 'gather:' + keyOf(x, y))) return null;
  return game.gathered[keyOf(x, y)] === game.day ? null : itemId;
}

export function gather(game, x, y) {
  const itemId = canGather(game, x, y);
  if (!itemId) return;
  game.gathered[keyOf(x, y)] = game.day;
  if (game?.realism) markResourceExhausted(game, 'gather:' + keyOf(x, y), itemId === 'branch' ? 'hollowStump' : itemId);
  addItem(game.player, itemId);
  burst(game, x + 0.5, y + 0.5, itemId === 'branch' ? '#a0683a' : itemId === 'crystal' ? '#7fd6ff' : '#9aa6b8', 8);
  floatText(game, x + 0.5, y, '+1 ' + ITEMS[itemId].name, '#ffe9a8');
}
