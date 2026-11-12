import { SPECIES } from '../data/monsters';
import { ZONES, zoneAt } from '../data/zones';
import { pickRandom } from '../../logic/random';
import { isSolid, dungeonMonsters } from '../world/map';
import { monsterCategory } from './learning';
import { isNight } from './clock';
import { startFight } from './fight';
import { isBarrier } from './powers';

// The monsters walking on the map. Touching one starts a fight.

const WILD_BY_DAY = 3; // how many wild monsters can be around the player
const WILD_BY_NIGHT = 6;
const SPAWN_EVERY = 1.5; // seconds between two tries to add a wild monster
const TOO_FAR = 18; // tiles: a wild monster this far from the player disappears
const SIGHT = 5.5; // tiles: a monster this close runs to the player
const TOUCH = 0.7; // tiles: this close = the fight starts

// A new monster. Its type (grammar category) is its own, or follows what the player must train.
export function makeMonster(game, speciesId, x, y, extra = {}) {
  const species = SPECIES[speciesId];
  return {
    ...species,
    species: speciesId,
    category: species.category || monsterCategory(game),
    maxHealth: species.health,
    x: x,
    y: y,
    walkX: 0, // the direction it wanders in
    walkY: 0,
    walkTime: 0, // seconds before it picks a new direction
    step: Math.random() * 10, // for its little animation
    ...extra,
  };
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

// ---------- Dungeons: guards and bosses ----------

function isGone(game, place) {
  const species = SPECIES[place.species];
  const isPresent = game.run.monsters.some((monster) => monster.key === place.key);
  if (isPresent) return true;
  return species.boss ? game.bosses[place.species] === true : game.cleared[place.key] === game.day;
}

// Puts the guards and bosses in their rooms (when the game opens, and every morning).
export function placeDungeonMonsters(game) {
  for (const zone of ZONES.filter((item) => item.guard)) {
    for (const place of dungeonMonsters(zone)) {
      if (!isGone(game, place)) {
        game.run.monsters.push(makeMonster(game, place.species, place.x, place.y, { key: place.key, zoneId: zone.id }));
      }
    }
  }
}

// ---------- Wild monsters ----------

function isWild(monster) {
  return !monster.key && !monster.raid;
}

function speciesFor(game, zone) {
  const night = isNight(game);
  const list = zone.species.filter((id) => night || !SPECIES[id].night);
  if (night) list.push('bat');
  return list;
}

// A free tile at 7 to 10 tiles from the player, in the wild. null if the try fell on a tree, a village...
function spawnPlace(game) {
  const angle = Math.random() * Math.PI * 2;
  const far = 7 + Math.random() * 3;
  const x = game.player.x + Math.cos(angle) * far;
  const y = game.player.y + Math.sin(angle) * far;
  const isFree = !isSolid(x, y) && zoneAt(x, y).kind === 'land';
  return isFree ? { x: x, y: y } : null;
}

function spawnWild(game) {
  const max = isNight(game) ? WILD_BY_NIGHT : WILD_BY_DAY;
  if (game.run.monsters.filter(isWild).length >= max) return;
  const place = spawnPlace(game);
  if (!place) return;
  const list = speciesFor(game, zoneAt(place.x, place.y));
  if (list.length > 0) game.run.monsters.push(makeMonster(game, pickRandom(list), place.x, place.y));
}

function removeFarMonsters(game) {
  game.run.monsters = game.run.monsters.filter((monster) => !isWild(monster) || distance(monster, game.player) < TOO_FAR);
}

// ---------- Moving ----------

// Wild monsters never enter a village, guards never leave their dungeon, and nobody crosses an obsidian barrier.
function canMonsterWalk(game, monster, x, y) {
  if (isSolid(x, y) || isBarrier(game, x, y)) return false;
  const zone = zoneAt(x, y);
  if (monster.raid) return true;
  if (monster.key) return zone.id === monster.zoneId;
  return zone.kind === 'land';
}

// Moves the monster by (dx, dy) if nothing blocks. Each direction is tried alone: it slides along the walls.
function push(game, monster, dx, dy) {
  if (canMonsterWalk(game, monster, monster.x + dx, monster.y)) monster.x += dx;
  if (canMonsterWalk(game, monster, monster.x, monster.y + dy)) monster.y += dy;
}

// Tiles per second. A slime crawls, an imp almost runs. The player is always a bit faster.
function walkSpeed(monster) {
  return 1 + monster.speed * 0.12;
}

function wander(game, monster, dt) {
  monster.walkTime -= dt;
  if (monster.walkTime <= 0) {
    const angle = Math.random() * Math.PI * 2;
    const isResting = Math.random() < 0.4;
    monster.walkX = isResting ? 0 : Math.cos(angle);
    monster.walkY = isResting ? 0 : Math.sin(angle);
    monster.walkTime = 1 + Math.random() * 2;
  }
  const speed = walkSpeed(monster) * 0.4 * dt;
  push(game, monster, monster.walkX * speed, monster.walkY * speed);
}

function runTo(game, monster, target, dt) {
  const far = distance(monster, target);
  if (far < 0.05) return;
  const speed = walkSpeed(monster) * dt;
  push(game, monster, ((target.x - monster.x) / far) * speed, ((target.y - monster.y) / far) * speed);
}

// The player is safe inside a village (except during a raid).
function canSeePlayer(game, monster) {
  const isPlayerSafe = zoneAt(game.player.x, game.player.y).kind === 'village' && !monster.raid;
  return !isPlayerSafe && distance(monster, game.player) < SIGHT;
}

function moveMonster(game, monster, dt) {
  monster.step += dt;
  if (canSeePlayer(game, monster)) runTo(game, monster, game.player, dt);
  else if (monster.raid) runTo(game, monster, monster.target, dt); // the raid chooses its target (see raid.js)
  else wander(game, monster, dt);
}

function touchedMonster(game) {
  return game.run.monsters.find((monster) => distance(monster, game.player) < TOUCH);
}

// Called every frame. dt: seconds since the last frame.
export function updateMonsters(game, dt) {
  game.run.spawnTime -= dt;
  if (game.run.spawnTime <= 0) {
    game.run.spawnTime = SPAWN_EVERY;
    spawnWild(game);
    removeFarMonsters(game);
  }
  game.run.monsters.forEach((monster) => moveMonster(game, monster, dt));

  const touched = touchedMonster(game);
  if (touched && Date.now() > game.run.safeUntil) startFight(game, touched);
}
