import { zoneAt, HOME_DOOR } from '../data/zones';
import { isSolid } from '../world/map';
import { directionOf, facingOf } from './input';
import { advanceClock, sleepUntilMorning } from './days';
import { updateMonsters } from './monsters';
import { updatePeople, personNear, talkTo } from './people';
import { updateFollowers } from './followers';
import { updatePowers } from './powers';
import { updateRaid } from './raid';
import { updateStory } from './chapters';
import { updateParticles, dust } from './particles';
import { isSoil, workField, dig, chestNear, openChest } from './farm';
import { saveGame } from './save';
import { say, notify, removeOldToasts } from './messages';

// One step of the world. Called at every frame while the player is on the map.

const WALK_SPEED = 4.2; // tiles per second
const BODY = 0.28; // half the width of the hero, in tiles (to not walk into the walls)
const SAVE_EVERY = 10; // seconds
const FRONT = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

// ---------- Walking ----------

// Is the hero's body (a small square around x, y) free of walls?
function canStand(x, y) {
  return !isSolid(x - BODY, y - BODY) && !isSolid(x + BODY, y - BODY) && !isSolid(x - BODY, y + BODY) && !isSolid(x + BODY, y + BODY);
}

function walk(game, input, dt) {
  const player = game.player;
  const direction = directionOf(input);
  game.run.walking = direction.x !== 0 || direction.y !== 0;
  if (!game.run.walking) return;

  const speed = WALK_SPEED * (Date.now() < game.run.dashUntil ? 2 : 1) * dt;
  if (canStand(player.x + direction.x * speed, player.y)) player.x += direction.x * speed;
  if (canStand(player.x, player.y + direction.y * speed)) player.y += direction.y * speed;
  player.dir = facingOf(direction.x, direction.y);

  const stepBefore = Math.floor(player.step);
  player.step += dt * 7;
  if (Math.floor(player.step) !== stepBefore && Math.floor(player.step) % 2 === 0) dust(game, player.x, player.y);
}

// Entering a new zone: its name is shown, and it is remembered (for the map and the quests).
function noticeZone(game) {
  const zone = zoneAt(game.player.x, game.player.y);
  if (zone.id === game.run.zoneId) return;
  game.run.zoneId = zone.id;
  game.visited[zone.id] = true;
}

// ---------- The action button ----------

// The tile just in front of the hero.
function frontTile(player) {
  const [dx, dy] = FRONT[player.dir];
  return { x: Math.floor(player.x + dx), y: Math.floor(player.y + dy) };
}

function isAtHomeDoor(player) {
  const front = frontTile(player);
  return front.x === HOME_DOOR.x && front.y === HOME_DOOR.y;
}

function goToBed(game) {
  if (game.raid.active) {
    notify(game, 'You can not sleep: the village is under attack!', '#ff6060');
    return;
  }
  sleepUntilMorning(game);
  saveGame(game);
  notify(game, '💤 You slept well. HP and mana are full.', '#9fd8ff');
}

function offerSleep(game) {
  say(game, null, ['Your home. The bed looks soft.'], [
    { label: 'Sleep until morning', icon: 'sleep', run: () => goToBed(game) },
    { label: 'Not now', run: () => {} },
  ]);
}

// The action button does the most useful thing where the hero stands:
// talk to someone, sleep at home, open a chest, work the field, or dig.
export function act(game) {
  const player = game.player;
  const person = personNear(game);
  const chest = chestNear(game);
  const front = frontTile(player);

  if (person) talkTo(game, person);
  else if (isAtHomeDoor(player)) offerSleep(game);
  else if (chest) openChest(game, chest);
  else if (isSoil(player.x, player.y)) workField(game, player.x, player.y);
  else if (isSoil(front.x, front.y)) workField(game, front.x, front.y);
  else dig(game, front.x, front.y);
}

// What the action button would do right now: the name of its icon (see draw/icons.js).
export function actionIcon(game) {
  const player = game.player;
  const front = frontTile(player);
  if (personNear(game)) return 'talk';
  if (isAtHomeDoor(player)) return 'sleep';
  if (chestNear(game)) return 'chest';
  if (isSoil(player.x, player.y) || isSoil(front.x, front.y)) return 'carrot';
  return 'dig';
}

// ---------- The frame ----------

// Things that do not need to run at every frame.
function slowUpdates(game, dt) {
  game.run.storyTime += dt;
  if (game.run.storyTime >= 1) {
    game.run.storyTime = 0;
    updateStory(game);
    removeOldToasts(game);
  }
  game.run.saveTime += dt;
  if (game.run.saveTime >= SAVE_EVERY) {
    game.run.saveTime = 0;
    saveGame(game);
  }
}

// dt: seconds since the last frame.
export function updateGame(game, input, dt) {
  advanceClock(game, dt);
  walk(game, input, dt);
  noticeZone(game);
  updatePeople(game, dt);
  updateFollowers(game, dt);
  updateMonsters(game, dt);
  updatePowers(game, dt);
  updateRaid(game, dt);
  slowUpdates(game, dt);
}

// Runs even when a menu or a fight is open: the particles keep flying.
export function updateEffects(game, dt) {
  updateParticles(game, dt);
}
