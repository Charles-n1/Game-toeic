import { SPECIES, speciesForSkill } from '../data/monsters';
import { zoneAt, MONSTER_TOWNS, DUNGEONS, WILD_STRUCTURES } from '../data/zones';
import { pickRandom } from '../../logic/random';
import { isSolid, dungeonMonsters } from '../world/map';
import { monsterCategory } from './learning';
import { TAG_POWER, TAG_ATTACK, tagOf, higherTag, nextTag } from './skills';
import { isNight } from './clock';
import { startFight } from './fight';
import { isBarrier } from './powers';
import { isLairCleared } from './isekaiStructures';
import { monsterCrowd } from './isekai/events';
import { dust } from './particles';
import { isWorldTimeFrozen } from './isekaiTodo/magicPlus';
import { monsterRankInfo } from './isekaiTodo/monstersPlus';
import { ensureRealism } from './realism/state';
import { maybePlayPreBossScene } from './soul';

// The monsters walking on the map. Touching one starts a fight.
// Wild monsters emerge from Monster Camps, Monster Towns, and Dungeon/Cave mouths rather than appearing randomly in thin air.

const WILD_BY_DAY = 4; // how many wild monsters can prowl around nearby camps
const WILD_BY_NIGHT = 7;
const SPAWN_EVERY = 1.5; // seconds between two tries to add a wild monster
const TOO_FAR = 34; // tiles: a wild monster this far from the player disappears
const SIGHT = 5.5; // tiles: a monster this close runs to the player
const TOUCH = 0.7; // tiles: this close = the fight starts
const TURN_AT = 0.15; // tiles: a monster turns to a side after walking this far to it (else it would flicker left / right)

const ELITE_CHANCE = 0.1; // in the dangerous lands, a wild monster is sometimes one tag above the hero
const PACK_CHANCE = 0.3; // a wild monster sometimes comes with friends: a duo...
const TRIO_CHANCE = 0.1; // ...or a trio
const PACK_RANGE = 3; // tiles: the monsters this close to the one touched join the fight
const PACK_MAX = 3; // never more than 3 monsters in one fight

// The tag of a new monster: the tag of its species, or the tag the hero has reached in its type (the higher one).
// In a dangerous land (danger 2 and more), a wild one is sometimes an "elite": one tag higher.
function tagFor(game, species, category, x, y, isWild) {
  const tag = higherTag(species.tag || 'normal', tagOf(game, category));
  const isElite = isWild && zoneAt(x, y).danger >= 2 && Math.random() < ELITE_CHANCE && nextTag(tag);
  return isElite ? nextTag(tag) : tag;
}

// A new monster. Its type (grammar category) is its own, or follows what the player must train.
// Its tag makes it stronger: health x5 per tag, blows x2, rewards x5 (see logic/skills.js).
export function makeMonster(game, speciesId, x, y, extra = {}) {
  const species = SPECIES[speciesId];
  const category = extra.category || species.category || monsterCategory(game);
  const tag = tagFor(game, species, category, x, y, !extra.key && !extra.raid);
  const nem = !extra.key && !extra.raid && game?.realism ? ensureRealism(game).world?.nemesis?.[speciesId] : null;
  const isNemesis = Boolean(nem && !extra.boss);
  return {
    ...species,
    species: speciesId,
    name: isNemesis ? nem.name : species.name,
    isNemesis,
    category: category,
    tag: tag,
    rank: monsterRankInfo({ ...species, tag, x, y }).rank,
    health: species.health * TAG_POWER[tag],
    maxHealth: species.health * TAG_POWER[tag],
    attack: Math.round(species.attack * TAG_ATTACK[tag] * (isNemesis ? 1.2 : 1)),
    magicAttack: species.magicAttack * TAG_ATTACK[tag],
    xp: species.xp * TAG_POWER[tag],
    lexis: species.lexis * TAG_POWER[tag],
    x: x,
    y: y,
    walkX: 0, // the direction it wanders in
    walkY: 0,
    walkTime: 0, // seconds before it picks a new direction
    step: Math.random() * 10, // for its little animation
    dir: Math.random() < 0.5 ? 'left' : 'right', // where it looks
    moving: false,
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

// Puts the guards and bosses in the floors of the dungeons (when the game opens, and every morning).
export function placeDungeonMonsters(game) {
  for (const place of dungeonMonsters()) {
    if (!isGone(game, place)) game.run.monsters.push(makeMonster(game, place.species, place.x, place.y, { key: place.key, zoneId: place.zoneId }));
  }
}

// ---------- Wild monsters ----------

function isWild(monster) {
  return !monster.key && !monster.raid;
}

// The monsters of a land; at night the ghosts come out too (and bats in the gentle lands).
const NIGHT_GUESTS = { meadow: ['bat'], lake: ['bat', 'drowner'], coast: ['drowner'], woods: ['bat', 'banshee'], forest: ['banshee'], heartwood: ['wraith'], oldwood: ['wraith', 'banshee'], watch: ['banshee'], swamp: ['wraith', 'banshee'], oldroad: ['bat'], southshore: ['bat'], storm: ['drowner'] };

const CAMP_KINDS = new Set(['monsterCamp', 'goblinTotem', 'boneCairn', 'abyssRift']);
const CAMP_SOURCES = [
  ...MONSTER_TOWNS.map((t) => ({ id: t.id, kind: 'monsterTown', x: t.x + t.w / 2, y: t.y + t.h / 2, species: [t.species] })),
  ...WILD_STRUCTURES.filter((s) => CAMP_KINDS.has(s.kind)).map((s) => ({ id: s.id, kind: 'monsterCamp', x: s.x, y: s.y, species: s.species })),
  ...DUNGEONS.filter((d) => d.look === 'cave' || d.look === 'ruins').map((d) => ({
    id: d.id,
    kind: 'cave',
    x: d.door ? d.door[0] : d.x + d.w / 2,
    y: (d.door ? d.door[1] : d.y + d.h) + 2,
    species: d.guards || [],
  })),
];

function speciesForCamp(game, source, x, y) {
  const zone = zoneAt(x, y);
  const night = isNight(game);
  const pool = [...zone.species, ...(source && Array.isArray(source.species) ? source.species : [])].filter(
    (id) => SPECIES[id] && (night || !SPECIES[id].night)
  );
  if (night) pool.push(...(NIGHT_GUESTS[zone.id] || []));
  return [...new Set(pool)];
}

// Picks an active monster camp / monster town / cave near the player so monsters always originate from real lairs.
function spawnPlace(game) {
  const nearbyCamps = CAMP_SOURCES.filter((src) => {
    if (src.kind === 'monsterCamp' && isLairCleared(game, src.id)) return false;
    const far = distance(src, game.player);
    return far >= 4 && far <= 55;
  });
  let source = nearbyCamps.length > 0 ? pickRandom(nearbyCamps) : null;
  if (!source) {
    // Player is deep in open wilds far from major towns: check closest active camp within 85 tiles.
    let best = null;
    let bestFar = 85;
    for (const src of CAMP_SOURCES) {
      if (src.kind === 'monsterCamp' && isLairCleared(game, src.id)) continue;
      const far = distance(src, game.player);
      if (far < bestFar) {
        best = src;
        bestFar = far;
      }
    }
    if (!best) return null;
    source = best;
  }

  // Spawn around the camp itself when within 30 tiles; otherwise along a patrol trail leading outward from that camp!
  const sourceFar = distance(source, game.player);
  const origin =
    sourceFar <= 30
      ? source
      : {
          x: game.player.x + ((source.x - game.player.x) / sourceFar) * (11 + Math.random() * 5),
          y: game.player.y + ((source.y - game.player.y) / sourceFar) * (11 + Math.random() * 5),
        };
  for (let tries = 0; tries < 6; tries++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 2 + Math.random() * 4.5;
    const x = origin.x + Math.cos(angle) * radius;
    const y = origin.y + Math.sin(angle) * radius;
    if (distance({ x, y }, game.player) < 5) continue;
    if (!isSolid(x, y) && zoneAt(x, y).kind === 'land') return { x, y, source };
  }
  return null;
}

function pickWeakestSpecies(game, campList, night) {
  const targetCat = monsterCategory(game);
  const skillMatches = speciesForSkill(targetCat).filter((id) => SPECIES[id] && !SPECIES[id].boss && (night || !SPECIES[id].night));
  const localMatches = campList.filter((id) => SPECIES[id]?.category === targetCat);
  if (localMatches.length > 0 && Math.random() < 0.8) return pickRandom(localMatches);
  if (skillMatches.length > 0 && Math.random() < 0.65) {
    const smallMatches = skillMatches.filter((id) => SPECIES[id].tier === 'small');
    return pickRandom(smallMatches.length > 0 ? smallMatches : skillMatches);
  }
  return pickRandom(campList);
}

function spawnWild(game) {
  const night = isNight(game);
  const max = Math.round((night ? WILD_BY_NIGHT : WILD_BY_DAY) * monsterCrowd(game)); // more on a Blood Moon, a stampede
  if (game.run.monsters.filter(isWild).length >= max) return;
  const place = spawnPlace(game);
  if (!place) return;
  const list = speciesForCamp(game, place.source, place.x, place.y);
  if (list.length === 0) return;
  const roll = Math.random();
  const size = roll < TRIO_CHANCE ? 3 : roll < PACK_CHANCE ? 2 : 1;
  for (let i = 0; i < size; i++) {
    const spot = i === 0 ? place : { x: place.x + (Math.random() - 0.5) * 2, y: place.y + (Math.random() - 0.5) * 2 };
    if (i > 0 && isSolid(spot.x, spot.y)) continue;
    game.run.monsters.push(
      makeMonster(game, pickWeakestSpecies(game, list, night), spot.x, spot.y, {
        homeCampId: place.source.id,
        campX: place.source.x,
        campY: place.source.y,
      })
    );
  }
}

// The wild monsters near the one touched join the fight (a duo or a trio). Never with a boss or a guard.
function packOf(game, touched) {
  if (!isWild(touched) || touched.boss || touched.warKind) return [];
  return game.run.monsters
    .filter((monster) => monster !== touched && isWild(monster) && !monster.boss && !monster.warKind && distance(monster, touched) < PACK_RANGE)
    .slice(0, PACK_MAX - 1);
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
    if (monster.campX !== undefined && Math.hypot(monster.x - monster.campX, monster.y - monster.campY) > 15 && Math.hypot(game.player.x - monster.campX, game.player.y - monster.campY) < 28) {
      const len = Math.max(0.1, Math.hypot(monster.campX - monster.x, monster.campY - monster.y));
      monster.walkX = (monster.campX - monster.x) / len;
      monster.walkY = (monster.campY - monster.y) / len;
      monster.walkTime = 1.4 + Math.random();
    } else {
      const angle = Math.random() * Math.PI * 2;
      const isResting = Math.random() < 0.4;
      monster.walkX = isResting ? 0 : Math.cos(angle);
      monster.walkY = isResting ? 0 : Math.sin(angle);
      monster.walkTime = 1 + Math.random() * 2;
    }
  }
  const speed = walkSpeed(monster) * 0.4 * dt;
  push(game, monster, monster.walkX * speed, monster.walkY * speed);
}

// A little dust under the feet of a running monster, from time to time (only near the hero: they see it).
const DUST_EVERY = 0.35; // seconds of running
const DUST_RANGE = 12; // tiles

function runTo(game, monster, target, dt) {
  const far = distance(monster, target);
  if (far < 0.05) return;
  const speed = walkSpeed(monster) * dt;
  push(game, monster, ((target.x - monster.x) / far) * speed, ((target.y - monster.y) / far) * speed);
  monster.dustTime = (monster.dustTime || 0) + dt;
  if (monster.dustTime >= DUST_EVERY && distance(monster, game.player) < DUST_RANGE) {
    monster.dustTime = 0;
    dust(game, monster.x, monster.y);
  }
}

// The player is safe inside a village (except during a raid). Repellent or Disguise Hood reduces detection range.
function canSeePlayer(game, monster) {
  const isPlayerSafe = zoneAt(game.player.x, game.player.y).kind === 'village' && !monster.raid;
  const r = game?.realism ? ensureRealism(game) : null;
  let sight = SIGHT;
  if (r?.health?.repellentHours > 0 && !monster.boss && !monster.raid) sight *= 0.5;
  if (game.player?.accessory === 'hoodedCloak' && !monster.boss) sight *= 0.7;
  return !isPlayerSafe && distance(monster, game.player) < sight;
}

// Where the monster looks (monster.dir) and if it walks (monster.moving), from how it really moved since the last
// frame (whoever moved it: this file, a raid, a war). It only turns after TURN_AT tiles to a side: going up, down
// or resting, it keeps looking where it looked.
function watchMove(monster, dt) {
  const dx = monster.x - (monster.lastX ?? monster.x);
  const dy = monster.y - (monster.lastY ?? monster.y);
  monster.lastX = monster.x;
  monster.lastY = monster.y;
  monster.sideways = Math.max(-TURN_AT, Math.min(TURN_AT, (monster.sideways || 0) + dx));
  if (Math.abs(monster.sideways) >= TURN_AT) monster.dir = monster.sideways < 0 ? 'left' : 'right';
  monster.moving = Math.hypot(dx, dy) > 0.0005;
  if (monster.moving) monster.step += dt; // its legs only move when it walks
}

function moveMonster(game, monster, dt) {
  watchMove(monster, dt);
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
  if (!isWorldTimeFrozen(game)) {
    game.run.monsters.forEach((monster) => moveMonster(game, monster, dt));
  }

  const touched = touchedMonster(game);
  if (touched && Date.now() > game.run.safeUntil) {
    if (touched.boss) {
      maybePlayPreBossScene(game, touched, () => startFight(game, touched, packOf(game, touched)));
    } else {
      startFight(game, touched, packOf(game, touched));
    }
  }
}
