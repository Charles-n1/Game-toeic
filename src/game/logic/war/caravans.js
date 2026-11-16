import { VILLAGES, zoneAt } from '../../data/zones';
import { ITEMS } from '../../data/items';
import { MEN_NAMES, SKINS, HAIRS } from '../../data/villagers';
import { TILE, tileAt } from '../../world/map';
import { pickRandom } from '../../../logic/random';
import { makeMonster } from '../monsters';
import { earnLexis, gainXp, addItem } from '../player';
import { addHappiness } from '../village';
import { notify } from '../messages';
import { dust, floatText } from '../particles';
import { cue } from '../cues';
import {
  dist,
  centerOfPlace,
  villageById,
  ensureWar,
  ensureRunWar,
  nextWarId,
  canStep,
  moveSlide,
  placeNearSpot,
  spawnWarEffect,
  addCorpse,
  addGrave,
} from './state';

const MAX_CARAVANS = 2;
const CARAVAN_SPEED = 1.75;
const CARAVAN_SPAWN_EVERY = 22;

function merchantLook() {
  return {
    skin: pickRandom(SKINS),
    hair: pickRandom(HAIRS),
    style: 'short',
    eyes: '#3b3b3b',
    outfit: pickRandom(['#3a7b5a', '#6b5a2a', '#2f5f8f', '#8a5a3a']),
    trim: '#e8b83a',
    beard: Math.random() < 0.5,
  };
}

export function spawnCaravan(game, originVillage = null, destVillage = null) {
  const runWar = ensureRunWar(game);
  const friendly = VILLAGES.filter((v) => game.villages[v.id] && game.villages[v.id].owner === 'people');
  if (friendly.length < 2) return null;

  let from = originVillage;
  if (!from) {
    const near = friendly.filter((v) => dist(centerOfPlace(v), game.player) < 200);
    from = near.length > 0 ? pickRandom(near) : pickRandom(friendly);
  }
  let to = destVillage;
  if (!to) {
    const fromCenter = centerOfPlace(from);
    const others = friendly
      .filter((v) => v.id !== from.id)
      .map((v) => ({ v, far: dist(centerOfPlace(v), fromCenter) }))
      .filter((entry) => entry.far < 520)
      .sort((a, b) => a.far - b.far);
    if (others.length === 0) return null;
    to = pickRandom(others.slice(0, Math.min(3, others.length))).v;
  }

  const toCenter = centerOfPlace(to);
  const gates = from.plan.gates || [];
  const bestGate = gates.reduce((best, g) => (!best || dist(g, toCenter) < dist(best, toCenter) ? g : best), null);
  const rawX = bestGate ? bestGate.x + bestGate.dx * 4 : from.x + from.w / 2;
  const rawY = bestGate ? bestGate.y + bestGate.dy * 4 : from.y + from.h + 3;
  const start = placeNearSpot(game, rawX, rawY, 0, 5);

  const caravan = {
    id: nextWarId(game, 'caravan'),
    name: pickRandom(MEN_NAMES) + ' the Merchant',
    fromId: from.id,
    toId: to.id,
    x: start.x,
    y: start.y,
    dir: 'right',
    step: 0,
    horseStep: 0,
    hp: 60,
    maxHp: 60,
    alive: true,
    underAttack: false,
    attackedOnce: false,
    rewarded: false,
    merchantLook: merchantLook(),
    targetX: toCenter.x,
    targetY: toCenter.y,
    despawnAt: Date.now() + 240000,
  };
  game.run.caravans.push(caravan);
  runWar.caravanTimer = CARAVAN_SPAWN_EVERY;
  return caravan;
}

export function triggerCaravanAttack(game, caravan) {
  if (!caravan || !caravan.alive || caravan.attackedOnce) return false;
  caravan.underAttack = true;
  caravan.attackedOnce = true;

  const zone = zoneAt(caravan.x, caravan.y);
  const pool = (zone.species && zone.species.length > 0 ? zone.species : ['wolf', 'goblin']).filter((s) => s !== 'mimic');
  const species = pickRandom(pool.length > 0 ? pool : ['goblin', 'wolf']);
  const count = 2 + (zone.danger >= 2 ? 1 : 0);

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + 0.5;
    const spot = placeNearSpot(game, caravan.x + Math.cos(angle) * 4, caravan.y + Math.sin(angle) * 4, 1, 5);
    const raider = makeMonster(game, species, spot.x, spot.y, {
      key: 'war:caravan:' + caravan.id + ':' + i,
      zoneId: '__war__',
      warKind: 'caravanAttacker',
      caravanId: caravan.id,
      attackCd: 0.4 + Math.random() * 0.4,
      target: caravan,
    });
    game.run.monsters.push(raider);
  }
  if (dist(caravan, game.player) < 55) {
    cue(game, 'warHorn');
    notify(game, '🛒 Caravan under attack! Help ' + caravan.name + '!', '#ffd23f');
  }
  return true;
}

function stepCaravanAlongRoad(game, caravan, dt) {
  const dest = { x: caravan.targetX, y: caravan.targetY };
  const far = dist(caravan, dest);
  if (far < 10) return true; // arrived at destination

  const baseAngle = Math.atan2(dest.y - caravan.y, dest.x - caravan.x);
  const offsets = [0, 0.4, -0.4, 0.85, -0.85, 1.3, -1.3];
  let best = null;
  let bestScore = -Infinity;

  for (const offset of offsets) {
    const angle = baseAngle + offset;
    const nx = caravan.x + Math.cos(angle) * CARAVAN_SPEED * dt;
    const ny = caravan.y + Math.sin(angle) * CARAVAN_SPEED * dt;
    if (!canStep(game, nx, ny)) continue;
    const lookX = caravan.x + Math.cos(angle) * 2.2;
    const lookY = caravan.y + Math.sin(angle) * 2.2;
    const t = tileAt(lookX, lookY);
    const roadBonus = t === TILE.PATH || t === TILE.BRIDGE ? 2.5 : 0;
    const score = roadBonus - Math.abs(offset);
    if (score > bestScore) {
      bestScore = score;
      best = { x: nx, y: ny, dx: Math.cos(angle), dy: Math.sin(angle) };
    }
  }

  if (best) {
    caravan.x = best.x;
    caravan.y = best.y;
    caravan.dir = Math.abs(best.dx) > Math.abs(best.dy) ? (best.dx < 0 ? 'left' : 'right') : best.dy < 0 ? 'up' : 'down';
    caravan.step += dt * 6;
    caravan.horseStep += dt * 5;
  } else {
    moveSlide(game, caravan, Math.cos(baseAngle) * CARAVAN_SPEED * 0.5 * dt, Math.sin(baseAngle) * CARAVAN_SPEED * 0.5 * dt);
  }
  return false;
}

function rewardCaravanRescue(game, caravan) {
  caravan.underAttack = false;
  caravan.rewarded = true;
  if (dist(caravan, game.player) > 65) return;

  const lexis = 40 + Math.floor(Math.random() * 25);
  earnLexis(game, lexis);
  const prize = pickRandom(['caravanParcel', 'warRations', 'merchantKeepsake', 'warShield', 'sturdyPitchfork']);
  addItem(game.player, prize);
  addHappiness(game, 2);
  cue(game, 'victory');
  notify(game, '🛒 Saved ' + caravan.name + '! +' + lexis + ' Lexis & ' + ITEMS[prize].name + '!', '#7CFC9A');
}

function updateCaravanAttackers(game, caravan, dt) {
  const attackers = game.run.monsters.filter((m) => m.caravanId === caravan.id && m.health > 0);
  if (attackers.length === 0) {
    if (caravan.alive && caravan.underAttack) rewardCaravanRescue(game, caravan);
    return;
  }
  for (const m of attackers) {
    m.attackCd = Math.max(0, (m.attackCd || 0) - dt);
    const goal = dist(m, game.player) < 4.5 ? game.player : caravan;
    m.target = goal;
    const far = dist(m, goal);
    const speed = (1 + (m.speed || 8) * 0.12) * 0.95;
    if (far > 1.1) {
      moveSlide(game, m, ((goal.x - m.x) / far) * speed * dt, ((goal.y - m.y) / far) * speed * dt);
    } else if (goal === caravan && m.attackCd <= 0) {
      m.attackCd = 1.2;
      const dmg = Math.max(7, Math.round((m.attack || 14) * 0.55));
      caravan.hp = Math.max(0, caravan.hp - dmg);
      spawnWarEffect(game, 'slash', caravan.x, caravan.y, '#ff5a6e');
      floatText(game, caravan.x, caravan.y - 0.5, '-' + dmg, '#ff8a95');
      if (caravan.hp <= 0) {
        caravan.alive = false;
        caravan.underAttack = false;
        addCorpse(game, 'merchant', caravan.name, caravan.x, caravan.y, caravan.merchantLook);
        game.run.monsters = game.run.monsters.filter((other) => other.caravanId !== caravan.id);
        notify(game, '💀 ' + caravan.name + ' fell on the road...', '#ff8080');
        return;
      }
    }
  }
}

export function slowCaravans(game) {
  ensureRunWar(game);
  const now = Date.now();
  game.run.caravans = game.run.caravans.filter((c) => c.alive && now < c.despawnAt && dist(c, game.player) < 240);

  for (const caravan of game.run.caravans) {
    if (!caravan.attackedOnce && !caravan.underAttack && zoneAt(caravan.x, caravan.y).kind === 'land' && dist(caravan, game.player) < 45) {
      if (Math.random() < 0.08) triggerCaravanAttack(game, caravan);
    }
  }
}

export function updateCaravans(game, dt) {
  const runWar = ensureRunWar(game);
  if (zoneAt(game.player.x, game.player.y).kind !== 'inside') {
    runWar.caravanTimer -= dt;
    if (runWar.caravanTimer <= 0) {
      runWar.caravanTimer = CARAVAN_SPAWN_EVERY;
      if (game.run.caravans.length < MAX_CARAVANS) spawnCaravan(game);
    }
  }

  const remaining = [];
  for (const caravan of game.run.caravans) {
    if (!caravan.alive) continue;
    if (caravan.underAttack) {
      updateCaravanAttackers(game, caravan, dt);
      if (caravan.alive) remaining.push(caravan);
      continue;
    }
    const arrived = stepCaravanAlongRoad(game, caravan, dt);
    if (!arrived) remaining.push(caravan);
  }
  game.run.caravans = remaining;
}

// ---------- Corpses & Burying ----------

export function corpseNear(game, range = 1.8) {
  const war = ensureWar(game);
  let best = null;
  let bestFar = range;
  for (const corpse of war.corpses) {
    const far = dist(corpse, game.player);
    if (far < bestFar) {
      best = corpse;
      bestFar = far;
    }
  }
  return best;
}

export function buryCorpse(game, corpse) {
  const war = ensureWar(game);
  if (!corpse) return false;
  war.corpses = war.corpses.filter((c) => c.id !== corpse.id);
  addGrave(game, corpse.name, corpse.x, corpse.y);
  cue(game, 'bury');
  dust(game, corpse.x, corpse.y, '#9a8266');
  addHappiness(game, 3);
  gainXp(game, 15);
  floatText(game, corpse.x, corpse.y, '+15 XP', '#7CFC9A');

  const roll = Math.random();
  if (roll < 0.35) {
    addItem(game.player, 'merchantKeepsake');
    notify(game, '🪦 Buried ' + corpse.name + '. Found a Merchant Keepsake (+3 happiness).', '#c9d1e0');
  } else if (roll < 0.65) {
    const lexis = 12 + Math.floor(Math.random() * 14);
    earnLexis(game, lexis);
    notify(game, '🪦 Buried ' + corpse.name + '. Found ' + lexis + ' Lexis (+3 happiness).', '#c9d1e0');
  } else {
    notify(game, '🪦 You buried ' + corpse.name + ' respectfully (+3 happiness, +15 XP).', '#c9d1e0');
  }
  return true;
}

// Helper for inspecting village caravan endpoints if needed.
export function caravanDestinationName(caravan) {
  const v = villageById(caravan.toId);
  return v ? v.name : 'a nearby town';
}
