import { VILLAGES, MONSTER_TOWNS, zoneAt } from '../../data/zones';
import { SPECIES } from '../../data/monsters';
import { pickRandom } from '../../../logic/random';
import { makeMonster } from '../monsters';
import { wallStrength, closestStandingSection, hitSection, turretSpots } from '../walls';
import { refreshWorld } from '../worldState';
import { earnLexis, gainXp } from '../player';
import { addHappiness } from '../village';
import { notify } from '../messages';
import { burst, dust, floatText } from '../particles';
import { cue } from '../cues';
import {
  dist,
  centerOfPlace,
  townOf,
  villageById,
  ensureWar,
  ensureRunWar,
  nextWarId,
  moveSlide,
  placeNearSpot,
  spawnWarEffect,
  addCorpse,
  isVillageUnderAttack,
} from './state';

const AWAKE_RANGE = 220;
const MARCH_PER_DAY = 170;
const TURRET_RANGE = 14;
const THROW_RANGE = 11;

function isVillageNearPlayer(game, village, range = AWAKE_RANGE) {
  const dx = Math.max(village.x - game.player.x, 0, game.player.x - village.x - village.w);
  const dy = Math.max(village.y - game.player.y, 0, game.player.y - village.y - village.h);
  return Math.hypot(dx, dy) < range;
}

function warbandMonstersOf(game, bandId) {
  return game.run.monsters.filter((m) => m.warbandId === bandId && m.health > 0);
}

function killMonsterOnMap(game, monster, color = '#ffd23f') {
  game.run.monsters = game.run.monsters.filter((other) => other !== monster);
  burst(game, monster.x, monster.y, color, 18);
  spawnWarEffect(game, 'hit', monster.x, monster.y, color, { life: 0.3 });
}

// ---------- Off-screen growth, launches & marches ----------

export function growMonsterTowns(game) {
  const war = ensureWar(game);
  // Solecis on The Silent Isle feeds demon and monster power until defeated.
  if (game.bosses && game.bosses.king) return;
  const generalMod = game.bosses && game.bosses.general ? 0.65 : 1;
  for (const town of MONSTER_TOWNS) {
    const state = war.towns[town.id];
    const demonBoost = zoneAt(town.x, town.y).id === 'demon' ? 1.35 : 1;
    const gain = Math.max(1, Math.round(state.growthRate * (1 + state.conquered * 0.45) * generalMod * demonBoost));
    state.strength = Math.min(350, state.strength + gain);
  }
}

function pickRaidTarget(game, town) {
  const townCenter = centerOfPlace(town);
  const candidates = VILLAGES.filter((v) => game.villages[v.id] && game.villages[v.id].owner === 'people')
    .map((v) => {
      const c = centerOfPlace(v);
      return { village: v, far: Math.hypot(c.x - townCenter.x, c.y - townCenter.y) };
    })
    .filter((entry) => entry.far < 900)
    .sort((a, b) => {
      const storyPenaltyA = a.village.story ? 260 : 0;
      const storyPenaltyB = b.village.story ? 260 : 0;
      return a.far + storyPenaltyA - (b.far + storyPenaltyB);
    });
  if (candidates.length === 0) return null;
  const top = candidates.slice(0, Math.min(2, candidates.length));
  return pickRandom(top).village;
}

export function launchWarbands(game) {
  const war = ensureWar(game);
  if (game.bosses && game.bosses.king) return;
  for (const town of MONSTER_TOWNS) {
    const tState = war.towns[town.id];
    if (game.day < tState.nextRaidDay) continue;
    const hasActive = war.warbands.some((b) => b.townId === town.id && b.state !== 'occupying');
    if (hasActive) continue;
    const target = pickRaidTarget(game, town);
    if (!target) continue;

    const strength = Math.max(20, Math.round(tState.strength * (0.55 + Math.min(0.45, tState.conquered * 0.12))));
    const count = Math.max(3, Math.min(10, Math.round(strength / 11)));
    const start = centerOfPlace(town);
    war.warbands.push({
      id: nextWarId(game, 'band'),
      townId: town.id,
      targetId: target.id,
      species: town.species || 'goblin',
      strength: strength,
      count: count,
      x: start.x,
      y: start.y,
      state: 'marching',
      launchedDay: game.day,
    });
    tState.strength = Math.max(15, tState.strength - Math.round(strength * 0.35));
    const cadence = Math.max(2, 5 - Math.min(3, tState.conquered));
    tState.nextRaidDay = game.day + cadence;
  }
}

export function conquerVillage(game, village, band) {
  const war = ensureWar(game);
  const vState = game.villages[village.id];
  const town = townOf(band.townId);
  const tState = war.towns[band.townId];
  vState.owner = 'monsters';
  vState.adults = 0;
  vState.kids = 0;
  vState.knights = 0;
  if (tState) {
    tState.conquered += 1;
    tState.strength = Math.min(350, tState.strength + 25);
  }
  war.conqueredBy[village.id] = band.townId;
  band.state = 'occupying';
  const center = centerOfPlace(village);
  band.x = center.x;
  band.y = center.y;
  if (!war.warbands.includes(band)) war.warbands.push(band);
  game.run.villagers = game.run.villagers.filter((v) => v.village !== village.id);
  addHappiness(game, -5);
  notify(game, '💀 ' + village.name + ' fell to ' + (town ? town.name : 'monsters') + '!', '#ff4d5a');
}

export function liberateVillage(game, village) {
  const war = ensureWar(game);
  const vState = game.villages[village.id];
  if (!vState || vState.owner === 'people') return false;
  vState.owner = 'people';
  vState.adults = Math.max(6, vState.adults || 0);
  vState.kids = Math.max(2, vState.kids || 0);
  vState.mood = Math.min(100, (vState.mood || 50) + 20);
  const townId = war.conqueredBy[village.id];
  if (townId && war.towns[townId]) {
    war.towns[townId].conquered = Math.max(0, war.towns[townId].conquered - 1);
  }
  delete war.conqueredBy[village.id];
  war.warbands = war.warbands.filter((b) => !(b.targetId === village.id && b.state === 'occupying'));
  earnLexis(game, 80);
  gainXp(game, 40);
  addHappiness(game, 8);
  cue(game, 'warHorn');
  notify(game, '🏳️ ' + village.name + ' has been liberated! +80 Lexis, +40 XP', '#7CFC9A');
  return true;
}

function resolveOffscreenSiege(game, band, village) {
  const war = ensureWar(game);
  const vState = game.villages[village.id];
  if (!vState || vState.owner !== 'people') {
    war.warbands = war.warbands.filter((b) => b !== band);
    return;
  }
  const defense = Math.round(wallStrength(vState) / 25 + vState.adults * 2.2 + (vState.knights || 0) * 14 + (vState.turrets || []).length * 18);
  const wallSection = closestStandingSection(game, village, band.x, band.y);
  let broke = false;
  if (wallSection) {
    const wallDmg = Math.min(90, Math.round(band.strength * 0.9));
    if (hitSection(vState, wallSection.section, wallDmg)) broke = true;
  }
  if (broke) refreshWorld(game);

  if (band.strength > defense) {
    const adultLoss = Math.max(2, Math.round((band.strength - defense * 0.4) / 5));
    const knightLoss = vState.knights > 0 && band.strength > defense * 0.8 ? 1 : 0;
    vState.knights = Math.max(0, vState.knights - knightLoss);
    vState.adults = Math.max(village.story ? 2 : 0, vState.adults - adultLoss);
    if (vState.adults <= 0 && !village.story) {
      conquerVillage(game, village, band);
      return;
    }
    notify(game, '⚔️ ' + village.name + ' barely survived a monster assault!', '#ffb070');
  } else {
    vState.adults = Math.max(village.story ? 3 : 2, vState.adults - 1);
  }
  war.warbands = war.warbands.filter((b) => b !== band);
}

export function advanceWarbandsDay(game) {
  const war = ensureWar(game);
  for (const band of [...war.warbands]) {
    if (band.state === 'occupying') continue;
    const village = villageById(band.targetId);
    if (!village) {
      war.warbands = war.warbands.filter((b) => b !== band);
      continue;
    }
    if (isVillageNearPlayer(game, village, AWAKE_RANGE)) continue; // handled live on screen
    if (band.state === 'marching') {
      const target = centerOfPlace(village);
      const far = dist(band, target);
      if (far <= MARCH_PER_DAY) {
        band.x = target.x;
        band.y = target.y;
        band.state = 'sieging';
      } else {
        band.x += ((target.x - band.x) / far) * MARCH_PER_DAY;
        band.y += ((target.y - band.y) / far) * MARCH_PER_DAY;
      }
    }
    if (band.state === 'sieging') resolveOffscreenSiege(game, band, village);
  }
}

// ---------- On-screen spawning & cleanup ----------

function spawnPointOutsideVillage(game, village, fromPos, index, total) {
  const center = centerOfPlace(village);
  const baseAngle = Math.atan2(fromPos.y - center.y, fromPos.x - center.x);
  const spread = ((index / Math.max(1, total - 1)) - 0.5) * 1.1;
  const angle = baseAngle + spread;
  const rx = village.w / 2 + 4 + (index % 3) * 1.5;
  const ry = village.h / 2 + 4 + (index % 3) * 1.5;
  const tx = center.x + Math.cos(angle) * rx;
  const ty = center.y + Math.sin(angle) * ry;
  return placeNearSpot(game, tx, ty, 0, 5);
}

function speciesForWarband(band) {
  const base = SPECIES[band.species] ? band.species : 'goblin';
  if (band.strength >= 90 && Math.random() < 0.35) return 'orc';
  if (band.strength >= 140 && Math.random() < 0.25) return 'darkKnight';
  return base;
}

export function spawnWarbandEntities(game, band) {
  const village = villageById(band.targetId);
  if (!village) return;
  const runWar = ensureRunWar(game);
  const town = townOf(band.townId);
  const from = town ? centerOfPlace(town) : { x: band.x, y: band.y };
  const existing = warbandMonstersOf(game, band.id);
  if (existing.length > 0) {
    runWar.spawnedBands[band.id] = true;
    return;
  }

  const isOccupy = band.state === 'occupying';
  const count = isOccupy ? Math.max(3, Math.min(6, band.count)) : band.count;
  const center = centerOfPlace(village);
  for (let i = 0; i < count; i++) {
    const spot = isOccupy
      ? placeNearSpot(game, center.x + (Math.random() - 0.5) * 18, center.y + (Math.random() - 0.5) * 14, 1, 6)
      : spawnPointOutsideVillage(game, village, from, i, count);
    const sp = speciesForWarband(band);
    const roleMode = i % 2 === 0 ? 'wall' : 'breach';
    const monster = makeMonster(game, sp, spot.x, spot.y, {
      key: 'war:band:' + band.id + ':' + i,
      zoneId: '__war__',
      warKind: isOccupy ? 'occupier' : 'warband',
      warbandId: band.id,
      targetVillageId: village.id,
      attackCd: Math.random() * 0.6,
      siegeRole: roleMode,
      target: center,
    });
    game.run.monsters.push(monster);
  }
  runWar.spawnedBands[band.id] = true;
  if (!isOccupy && !band.announced) {
    band.announced = true;
    cue(game, 'warHorn');
    notify(game, '📯 ' + (town ? town.name : 'Monsters') + ' warband attacks ' + village.name + '!', '#ff6a4a');
  }
}

export function syncOnScreenWarbands(game) {
  const war = ensureWar(game);
  const runWar = ensureRunWar(game);

  // Ensure occupied villages near the player have occupying monsters spawned.
  for (const village of VILLAGES) {
    const vState = game.villages[village.id];
    if (vState.owner === 'monsters' && isVillageNearPlayer(game, village, AWAKE_RANGE)) {
      let occ = war.warbands.find((b) => b.targetId === village.id && b.state === 'occupying');
      if (!occ) {
        const townId = war.conqueredBy[village.id] || MONSTER_TOWNS[0].id;
        const center = centerOfPlace(village);
        occ = {
          id: nextWarId(game, 'occ'),
          townId: townId,
          targetId: village.id,
          species: (townOf(townId) || {}).species || 'orc',
          strength: 50,
          count: 4,
          x: center.x,
          y: center.y,
          state: 'occupying',
          launchedDay: game.day,
        };
        war.warbands.push(occ);
      }
      spawnWarbandEntities(game, occ);
    }
  }

  for (const band of war.warbands) {
    const village = villageById(band.targetId);
    if (!village) continue;
    const near = isVillageNearPlayer(game, village, AWAKE_RANGE) || dist(game.player, band) < 120;
    if (near) {
      if (band.state === 'marching') {
        const center = centerOfPlace(village);
        band.x = center.x;
        band.y = center.y;
        band.state = 'sieging';
      }
      spawnWarbandEntities(game, band);
    } else {
      // Despawn distant on-screen monsters while saving remaining strength.
      const alive = warbandMonstersOf(game, band.id);
      if (alive.length > 0) {
        band.count = alive.length;
        band.strength = Math.max(12, alive.length * 11);
        game.run.monsters = game.run.monsters.filter((m) => m.warbandId !== band.id);
      }
      delete runWar.spawnedBands[band.id];
    }
  }

  // Clean up transient war:* keys from game.cleared so save files stay tidy.
  if (game.cleared) {
    for (const k of Object.keys(game.cleared)) {
      if (k.startsWith('war:')) delete game.cleared[k];
    }
  }
}

// ---------- On-screen combat: warband monsters, defenders, turrets, projectiles ----------

function defendersOfVillage(game, villageId) {
  return game.run.villagers.filter((v) => v.village === villageId && !v.dead && !v.ko);
}

function closestEntry(list, from) {
  let best = null;
  let bestFar = Infinity;
  for (const item of list) {
    const far = dist(item, from);
    if (far < bestFar) {
      best = item;
      bestFar = far;
    }
  }
  return best ? { item: best, far: bestFar } : null;
}

function damageVillagerDefender(game, village, defender, damage) {
  const vState = game.villages[village.id];
  defender.hp = (defender.hp ?? defender.maxHp ?? 25) - damage;
  spawnWarEffect(game, 'slash', defender.x, defender.y, '#ff5a6e');
  floatText(game, defender.x, defender.y, '-' + damage, '#ff8a95');
  if (defender.hp > 0) return;
  defender.dead = true;
  defender.ko = true;
  defender.fighting = false;
  if (defender.knight) vState.knights = Math.max(0, vState.knights - 1);
  else vState.adults = Math.max(0, vState.adults - 1);
  if (Math.random() < 0.35) addCorpse(game, 'villager', defender.name, defender.x, defender.y, defender.look);
  floatText(game, defender.x, defender.y - 0.5, 'FALLEN!', '#ff3b4f');
}

function updateWarbandMonster(game, band, monster, village, defenders, dt) {
  const vState = game.villages[village.id];
  monster.attackCd = Math.max(0, (monster.attackCd || 0) - dt);
  const speed = (1 + (monster.speed || 8) * 0.12) * 0.9;

  if (band.state === 'occupying') {
    const nearPlayer = dist(monster, game.player) < 7;
    const goal = nearPlayer ? game.player : centerOfPlace(village);
    const far = dist(monster, goal);
    if (far > 0.8) moveSlide(game, monster, ((goal.x - monster.x) / far) * speed * dt, ((goal.y - monster.y) / far) * speed * dt);
    return;
  }

  // 1. Attack nearby wall section if standing right next to one.
  const wall = closestStandingSection(game, village, monster.x, monster.y);
  if (wall && wall.far <= 1.55) {
    monster.target = wall;
    if (monster.attackCd <= 0) {
      monster.attackCd = 1.1;
      const dmg = Math.max(10, Math.round(((monster.attack || 14) + (monster.magicAttack || 0)) * 0.65));
      const broke = hitSection(vState, wall.section, dmg);
      spawnWarEffect(game, 'slash', wall.x, wall.y, '#e8b83a');
      dust(game, wall.x, wall.y, '#b8a898');
      if (broke) {
        cue(game, 'wallBreak');
        burst(game, wall.x, wall.y, '#94909b', 14);
        floatText(game, wall.x, wall.y, 'BREACH!', '#ff8a3d');
        refreshWorld(game);
      } else {
        cue(game, 'wallHit');
      }
    }
    return;
  }

  // 2. Attack adjacent defending villagers.
  const activeDefenders = defenders.filter((v) => v.fighting);
  const nearestDef = closestEntry(activeDefenders, monster);
  if (nearestDef && nearestDef.far <= 1.35) {
    monster.target = nearestDef.item;
    if (monster.attackCd <= 0) {
      monster.attackCd = 1.15;
      const dmg = Math.max(6, Math.round((monster.attack || 12) * 0.45));
      damageVillagerDefender(game, village, nearestDef.item, dmg);
    }
    return;
  }

  // 3. March toward standing wall (if outside) or nearest defender / square.
  const outsideVillage = monster.x < village.x || monster.x >= village.x + village.w || monster.y < village.y || monster.y >= village.y + village.h;
  let goal = centerOfPlace(village);
  if (outsideVillage && wall && (monster.siegeRole === 'wall' || wall.far < 10)) {
    goal = wall;
  } else if (nearestDef && nearestDef.far < 18) {
    goal = nearestDef.item;
  } else if (dist(monster, game.player) < 6) {
    goal = game.player;
  }
  monster.target = goal;
  const far = dist(monster, goal);
  if (far > 0.4) {
    moveSlide(game, monster, ((goal.x - monster.x) / far) * speed * dt, ((goal.y - monster.y) / far) * speed * dt);
  }
}

function fireProjectile(game, kind, from, target, damage, speed, color) {
  const runWar = ensureRunWar(game);
  const far = Math.max(0.1, dist(from, target));
  runWar.projectiles.push({
    kind: kind,
    x: from.x,
    y: from.y,
    vx: ((target.x - from.x) / far) * speed,
    vy: ((target.y - from.y) / far) * speed,
    damage: damage,
    color: color,
    life: Math.min(1.8, far / speed + 0.35),
    angle: Math.atan2(target.y - from.y, target.x - from.x),
  });
}

function strikeMonster(game, monster, damage, color) {
  monster.health -= damage;
  spawnWarEffect(game, 'hit', monster.x, monster.y, color);
  floatText(game, monster.x, monster.y - 0.3, '-' + damage, color);
  if (monster.health <= 0) {
    killMonsterOnMap(game, monster, color);
    return true;
  }
  return false;
}

function faceToward(entity, target) {
  const dx = target.x - entity.x;
  const dy = target.y - entity.y;
  entity.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : dy < 0 ? 'up' : 'down';
}

function updateDefender(game, villager, monsters, foremanPos, dt) {
  const now = Date.now();
  villager.attackCd = Math.max(0, (villager.attackCd || 0) - dt);
  const nearest = closestEntry(monsters, villager);
  if (!nearest) return;

  const isRallied = (villager._ralliedUntil || 0) > now;
  const rallyMul = isRallied ? 1.35 : 1;
  const monster = nearest.item;

  // Foreman rallies nearby defenders and fights if a monster gets close.
  if (villager.job === 'foreman') {
    const targetPos = foremanPos || monster;
    const far = dist(villager, targetPos);
    if (far > 1.8) {
      moveSlide(game, villager, ((targetPos.x - villager.x) / far) * 1.9 * dt, ((targetPos.y - villager.y) / far) * 1.9 * dt);
      villager.walking = true;
      villager.step = (villager.step || 0) + dt * 6;
      faceToward(villager, targetPos);
    } else {
      villager.walking = false;
      faceToward(villager, monster);
    }
    if (nearest.far <= 1.5 && villager.attackCd <= 0) {
      villager.attackCd = 1.1;
      strikeMonster(game, monster, 14, '#ffd23f');
    }
    return;
  }

  // Knights charge into melee for heavy blows.
  if (villager.knight) {
    faceToward(villager, monster);
    if (nearest.far > 1.25) {
      const speed = 2.6;
      moveSlide(game, villager, ((monster.x - villager.x) / nearest.far) * speed * dt, ((monster.y - villager.y) / nearest.far) * speed * dt);
      villager.walking = true;
      villager.step = (villager.step || 0) + dt * 7;
    } else {
      villager.walking = false;
      if (villager.attackCd <= 0) {
        villager.attackCd = 0.95;
        const dmg = Math.round(18 * rallyMul);
        strikeMonster(game, monster, dmg, '#ffe066');
      }
    }
    return;
  }

  // Male villagers fight with pitchforks in melee and throw stones/pitchforks at range.
  faceToward(villager, monster);
  if (nearest.far <= 1.55) {
    villager.walking = false;
    if (villager.attackCd <= 0) {
      villager.attackCd = isRallied ? 0.95 : 1.15;
      const dmg = Math.round(10 * rallyMul);
      strikeMonster(game, monster, dmg, '#e8eef7');
    }
  } else if (nearest.far <= THROW_RANGE) {
    villager.walking = false;
    if (villager.attackCd <= 0) {
      villager.attackCd = isRallied ? 1.15 : 1.5;
      const throwFork = Math.random() < 0.35;
      const dmg = Math.round((throwFork ? 12 : 8) * rallyMul);
      fireProjectile(game, throwFork ? 'pitchfork' : 'stone', villager, monster, dmg, throwFork ? 9.5 : 8.5, throwFork ? '#c9d1e0' : '#94909b');
      cue(game, 'pitchforkThrow');
    }
  } else {
    moveSlide(game, villager, ((monster.x - villager.x) / nearest.far) * 1.8 * dt, ((monster.y - villager.y) / nearest.far) * 1.8 * dt);
    villager.walking = true;
    villager.step = (villager.step || 0) + dt * 6;
  }
}

function updateVillageDefense(game, village, monsters, dt) {
  const vState = game.villages[village.id];
  const villagers = defendersOfVillage(game, village.id);
  const canDefend = vState.adults >= 4 || (vState.knights || 0) > 0;

  if (!canDefend || monsters.length === 0) {
    villagers.forEach((v) => (v.fighting = false));
    return;
  }

  const now = Date.now();
  const fighters = villagers.filter((v) => !v.kid && (v.knight || v.job === 'foreman' || v.sex === 'man'));
  const nonFighters = villagers.filter((v) => !fighters.includes(v));
  nonFighters.forEach((v) => {
    v.fighting = false;
    const farHome = dist(v, v.home);
    if (farHome > 0.6) {
      moveSlide(game, v, ((v.home.x - v.x) / farHome) * 2.1 * dt, ((v.home.y - v.y) / farHome) * 2.1 * dt);
      v.walking = true;
      v.step = (v.step || 0) + dt * 6;
    } else {
      v.walking = false;
      v.hidden = true;
    }
  });

  // Foremen rally nearby defenders within 8 tiles.
  const foremen = fighters.filter((v) => v.job === 'foreman');
  let rallyTarget = null;
  const frontFighters = fighters.filter((v) => v.job !== 'foreman');
  if (frontFighters.length > 0) {
    const sx = frontFighters.reduce((sum, f) => sum + f.x, 0) / frontFighters.length;
    const sy = frontFighters.reduce((sum, f) => sum + f.y, 0) / frontFighters.length;
    rallyTarget = { x: sx, y: sy };
  }
  for (const foreman of foremen) {
    for (const mate of fighters) {
      if (mate !== foreman && dist(foreman, mate) <= 8) mate._ralliedUntil = now + 1500;
    }
  }

  for (const defender of fighters) {
    defender.fighting = true;
    defender.hidden = false;
    updateDefender(game, defender, monsters, rallyTarget, dt);
  }
}

function updateTurrets(game, village, monsters, dt) {
  const vState = game.villages[village.id];
  const turrets = vState.turrets || [];
  if (turrets.length === 0 || vState.owner !== 'people' || monsters.length === 0) return;
  const runWar = ensureRunWar(game);
  const spots = turretSpots(village);

  for (const index of turrets) {
    const spot = spots[index];
    if (!spot) continue;
    const origin = { x: spot.x + 1, y: spot.y + 1 };
    const key = village.id + ':' + index;
    runWar.turretCooldowns[key] = Math.max(0, (runWar.turretCooldowns[key] || 0) - dt);
    if (runWar.turretCooldowns[key] > 0) continue;

    const target = closestEntry(monsters, origin);
    if (!target || target.far > TURRET_RANGE) continue;

    runWar.turretCooldowns[key] = 1.25;
    fireProjectile(game, 'bolt', origin, target.item, 16, 14, '#ffd23f');
    spawnWarEffect(game, 'muzzle', origin.x, origin.y, '#ffd23f', { life: 0.2 });
    cue(game, 'turretShot');
  }
}

function updateProjectiles(game, dt) {
  const runWar = ensureRunWar(game);
  const survivors = [];
  for (const proj of runWar.projectiles) {
    proj.life -= dt;
    proj.x += proj.vx * dt;
    proj.y += proj.vy * dt;
    if (proj.life <= 0) continue;

    const hit = game.run.monsters.find((m) => m.health > 0 && dist(m, proj) < 0.8);
    if (hit) {
      strikeMonster(game, hit, proj.damage, proj.kind === 'bolt' ? '#ffd23f' : '#ffffff');
      continue;
    }
    survivors.push(proj);
  }
  runWar.projectiles = survivors;
}

export function updateWarbandsAndDefense(game, dt) {
  const war = ensureWar(game);
  const runWar = ensureRunWar(game);

  // Update visual FX timers.
  runWar.effects.forEach((fx) => (fx.age += dt));
  runWar.effects = runWar.effects.filter((fx) => fx.age < fx.life);

  // Move and evaluate on-screen warbands.
  for (const band of [...war.warbands]) {
    const village = villageById(band.targetId);
    if (!village) {
      war.warbands = war.warbands.filter((b) => b !== band);
      continue;
    }
    if (!isVillageNearPlayer(game, village, AWAKE_RANGE) && dist(game.player, band) >= 120) continue;

    const monsters = warbandMonstersOf(game, band.id);
    if (monsters.length > 0) {
      runWar.spawnedBands[band.id] = true;
    } else {
      if (!runWar.spawnedBands[band.id]) {
        if (band.state === 'occupying' || band.state === 'sieging') spawnWarbandEntities(game, band);
        continue;
      }
      delete runWar.spawnedBands[band.id];
      if (band.state === 'occupying') {
        liberateVillage(game, village);
      } else if (band.state === 'sieging') {
        war.warbands = war.warbands.filter((b) => b !== band);
        if (isVillageNearPlayer(game, village, 160)) {
          earnLexis(game, 35);
          addHappiness(game, 3);
          cue(game, 'victory');
          notify(game, '🛡️ ' + village.name + ' repelled the warband! +35 Lexis', '#7CFC9A');
        }
      }
      continue;
    }

    const vState = game.villages[village.id];
    const defenders = defendersOfVillage(game, village.id);
    for (const m of monsters) updateWarbandMonster(game, band, m, village, defenders, dt);

    if (band.state === 'sieging' && vState.owner === 'people') {
      if (vState.adults <= 0) {
        if (village.story) {
          vState.adults = 1;
        } else {
          conquerVillage(game, village, band);
        }
      }
    }
  }

  // Update awake villages' defenders & turrets.
  for (const village of VILLAGES) {
    if (!isVillageNearPlayer(game, village, AWAKE_RANGE)) continue;
    const vState = game.villages[village.id];
    if (vState.owner !== 'people') continue;
    const center = centerOfPlace(village);
    const nearbyHostiles = game.run.monsters.filter(
      (m) => m.health > 0 && (m.targetVillageId === village.id || (m.raid && village.id === 'lexia') || dist(m, center) < Math.max(village.w, village.h) * 0.75)
    );
    if (isVillageUnderAttack(game, village.id) || nearbyHostiles.length > 0) {
      updateVillageDefense(game, village, nearbyHostiles, dt);
      updateTurrets(game, village, nearbyHostiles, dt);
    } else {
      defendersOfVillage(game, village.id).forEach((v) => (v.fighting = false));
    }
  }

  updateProjectiles(game, dt);
}
