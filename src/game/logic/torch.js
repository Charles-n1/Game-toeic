import { PROPS, zoneAt } from '../data/zones';
import { TILE, tileAt } from '../world/map';
import { countItem, addItem, removeItem } from './player';
import { notify } from './messages';
import { burst, floatText } from './particles';
import { cue } from './cues';

// The light of the hero. At night nobody has light by default: the hero must carry a torch.
// A torch = a branch (from a tree) + lamp oil (Old Bea, Rin) + cloth (Lila).
// To light it: a fire that already burns (a lamp, a torch, a campfire: the flame passes to the torch),
// or 2 flint stones (from a rock) struck together. A lit torch burns for TORCH_HOURS hours of the game.
// game.player.torchHours: the hours of light left (0 = no light).

export const TORCH_RECIPE = ['branch', 'oil', 'cloth'];
export const TORCH_HOURS = 6;
const FLINT_FOR_FIRE = 2;
const FIRE_KINDS = ['lamp', 'torch', 'campfire'];
const FIRE_RANGE = 1.8; // tiles: close enough to pass the flame

// ---------- Light ----------

export function hasLight(game) {
  return game.player.torchHours > 0;
}

// Time passes: the torch burns. hours: the hours that just passed.
export function burnTorch(game, hours) {
  const player = game.player;
  if (player.torchHours <= 0) return;
  player.torchHours = Math.max(0, player.torchHours - hours);
  if (player.torchHours === 0) notify(game, '🕯️ Your torch went out.', '#ffb070');
}

// ---------- Making and lighting the torch ----------

export function canCraftTorch(player) {
  return TORCH_RECIPE.every((itemId) => countItem(player, itemId) > 0);
}

export function craftTorch(game) {
  if (!canCraftTorch(game.player)) return;
  TORCH_RECIPE.forEach((itemId) => removeItem(game.player, itemId));
  addItem(game.player, 'torch');
  notify(game, '🔦 You made a torch. Light it at a fire, or with 2 flint stones.', '#ffd86b');
}

// The burning thing close to the hero (null = none). Its middle is where the flame is.
export function fireNear(game) {
  const player = game.player;
  return PROPS.find((prop) => FIRE_KINDS.includes(prop.kind) && Math.hypot(prop.x + 0.5 - player.x, prop.y + 0.5 - player.y) < FIRE_RANGE) || null;
}

// Can the hero light a torch here? (A torch in the bag, not already lit, and a fire near or 2 flint stones.)
export function canLightTorch(game, withFlint) {
  const player = game.player;
  if (countItem(player, 'torch') === 0 || hasLight(game)) return false;
  return withFlint ? countItem(player, 'flint') >= FLINT_FOR_FIRE : fireNear(game) !== null;
}

function startBurning(game) {
  removeItem(game.player, 'torch');
  game.player.torchHours = TORCH_HOURS;
  burst(game, game.player.x, game.player.y - 0.6, '#ffb040', 14);
  cue(game, 'coin');
}

// The flame of a lamp, a torch or a campfire passes to the torch of the hero.
export function lightAtFire(game) {
  if (!canLightTorch(game, false)) return;
  startBurning(game);
  notify(game, '🔥 Your torch takes the flame. ' + TORCH_HOURS + ' hours of light.', '#ffd86b');
}

// Two flint stones, struck together: sparks, then fire.
export function lightWithFlint(game) {
  if (!canLightTorch(game, true)) return;
  removeItem(game.player, 'flint', FLINT_FOR_FIRE);
  startBurning(game);
  notify(game, '🔥 Clack, clack... sparks! Your torch burns. ' + TORCH_HOURS + ' hours of light.', '#ffd86b');
}

// ---------- Gathering: a branch from a tree, flint stones from a rock ----------
// game.gathered: { "x,y": the day it was gathered }. A tree gives one branch a day, a rock one stone a day.

function keyOf(x, y) {
  return Math.floor(x) + ',' + Math.floor(y);
}

// What the tile gives: 'branch', 'flint', or null (nothing, or a cactus of the desert).
function gatherableAt(x, y) {
  const tile = tileAt(x, y);
  if (tile === TILE.TREE && zoneAt(x, y).biome !== 'desert') return 'branch';
  if (tile === TILE.DEAD_TREE) return 'branch';
  if (tile === TILE.ROCK) return 'flint';
  return null;
}

// What the hero can gather on this tile right now (null = nothing).
export function canGather(game, x, y) {
  const itemId = gatherableAt(x, y);
  if (!itemId) return null;
  return game.gathered[keyOf(x, y)] === game.day ? null : itemId;
}

export function gather(game, x, y) {
  const itemId = canGather(game, x, y);
  if (!itemId) return;
  game.gathered[keyOf(x, y)] = game.day;
  addItem(game.player, itemId);
  burst(game, x + 0.5, y + 0.5, itemId === 'branch' ? '#a0683a' : '#9aa6b8', 8);
  floatText(game, x + 0.5, y, itemId === 'branch' ? '+1 Branch' : '+1 Flint', '#ffe9a8');
}
