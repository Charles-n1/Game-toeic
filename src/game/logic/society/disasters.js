import { VILLAGES, zoneAt, isInsideWorld } from '../../data/zones';
import { PORTS, TILE, biomeAt, isSolid, tileAt } from '../../world/map';
import { hitSection, closestStandingSection } from '../walls';
import { refreshWorld } from '../worldState';
import { addHappiness } from '../village';
import { notify } from '../messages';
import { dust } from '../particles';
import { cue } from '../cues';
import { ensureSociety } from './state';

// Rare climate disasters: Tornado (swirling funnel outdoors) and Tsunami (coastal mega-wave).

const TORNADO_DURATION = 15;
const TSUNAMI_WARNING = 5;
const TSUNAMI_DURATION = 15;

function nearestSeaPoint(player) {
  let best = null;
  let bestFar = Infinity;
  for (const port of PORTS) {
    const far = Math.hypot(port.x - player.x, port.y - player.y);
    if (far < bestFar) {
      best = { x: port.x, y: port.y };
      bestFar = far;
    }
  }
  if (best && bestFar < 130) return { point: best, far: bestFar };

  // Also scan a quick ring for open water near the player
  for (let r = 8; r <= 36; r += 7) {
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      const wx = player.x + Math.cos(a) * r;
      const wy = player.y + Math.sin(a) * r;
      if (tileAt(wx, wy) === TILE.WATER) return { point: { x: wx, y: wy }, far: r };
    }
  }
  return null;
}

export function triggerDisaster(game, forcedKind = null) {
  const s = ensureSociety(game);
  if (isInsideWorld(game.player.y)) return null;

  const sea = nearestSeaPoint(game.player);
  const kind = forcedKind || (sea && (biomeAt(game.player.x, game.player.y) === 'coast' || sea.far < 70) && Math.random() < 0.6 ? 'tsunami' : 'tornado');
  s.nextDisasterDay = game.day + 9 + Math.floor(Math.random() * 6);

  if (kind === 'tsunami') {
    const origin = sea ? sea.point : { x: game.player.x + 18, y: game.player.y };
    const dx = game.player.x - origin.x;
    const dy = game.player.y - origin.y;
    const len = Math.max(1, Math.hypot(dx, dy));
    s.disaster = {
      kind: 'tsunami',
      originX: origin.x,
      originY: origin.y,
      dirX: dx / len,
      dirY: dy / len,
      warningSeconds: TSUNAMI_WARNING,
      duration: TSUNAMI_DURATION,
      elapsed: 0,
      width: 26,
      maxDist: Math.min(42, Math.max(24, len + 12)),
      hitPlayer: false,
      hitVillagers: {},
      hitWalls: {},
      soundAt: 0,
    };
    cue(game, 'alarm');
    notify(game, '🌊 TSUNAMI WARNING! The sea pulls back — run inland or indoors!', '#5fd3e8');
    return s.disaster;
  }

  const angle = Math.random() * Math.PI * 2;
  const startX = game.player.x + Math.cos(angle) * 12;
  const startY = game.player.y + Math.sin(angle) * 10;
  const toPlayer = Math.atan2(game.player.y - startY, game.player.x - startX) + (Math.random() - 0.5) * 0.4;
  const speed = 2.1;
  s.disaster = {
    kind: 'tornado',
    x: startX,
    y: startY,
    vx: Math.cos(toPlayer) * speed,
    vy: Math.sin(toPlayer) * speed,
    radius: 3.6,
    duration: TORNADO_DURATION,
    elapsed: 0,
    hitAt: 0,
    soundAt: 0,
  };
  cue(game, 'tornado');
  notify(game, '🌪️ A violent TORNADO has formed nearby! Seek shelter!', '#d8b4f8');
  return s.disaster;
}

export function newDayDisasters(game) {
  const s = ensureSociety(game);
  if (s.disaster || game.day < s.nextDisasterDay) return;
  if (isInsideWorld(game.player.y)) return;
  if (Math.random() < 0.06) triggerDisaster(game);
}

export function slowDisasters(game) {
  const s = ensureSociety(game);
  if (s.disaster || game.day < s.nextDisasterDay) return;
  if (isInsideWorld(game.player.y)) return;
  if (game.weather && game.weather.kind === 'storm' && Math.random() < 0.012) {
    triggerDisaster(game);
  }
}

function pushEntitySafely(entity, dx, dy) {
  if (!isSolid(entity.x + dx, entity.y)) entity.x += dx;
  if (!isSolid(entity.x, entity.y + dy)) entity.y += dy;
}

function damageNearbyWalls(game, x, y, radius, damage) {
  let brokeAny = false;
  for (const village of VILLAGES) {
    const state = game.villages[village.id];
    if (!state || state.owner !== 'people') continue;
    const hit = closestStandingSection(game, village, x, y);
    if (hit && hit.far <= radius) {
      if (hitSection(state, hit.section, damage)) brokeAny = true;
    }
  }
  if (brokeAny) refreshWorld(game);
}

function updateTornado(game, d, dt) {
  d.x += d.vx * dt;
  d.y += d.vy * dt;
  d.soundAt = (d.soundAt || 0) - dt;
  if (d.soundAt <= 0) {
    d.soundAt = 2.4;
    if (Math.hypot(d.x - game.player.x, d.y - game.player.y) < 28) cue(game, 'tornado');
  }
  if (Math.random() < dt * 14) {
    dust(game, d.x + (Math.random() - 0.5) * 2.2, d.y + (Math.random() - 0.5) * 1.4, '#c9d1e0');
  }

  d.hitAt = (d.hitAt || 0) - dt;
  const doDamage = d.hitAt <= 0;
  if (doDamage) d.hitAt = 1.4;

  // Knock back & lightly hurt hero if outdoors
  if (!isInsideWorld(game.player.y)) {
    const dist = Math.hypot(game.player.x - d.x, game.player.y - d.y);
    if (dist < d.radius) {
      const push = 3.2 * dt;
      const nx = dist > 0.1 ? (game.player.x - d.x) / dist : 1;
      const ny = dist > 0.1 ? (game.player.y - d.y) / dist : 0;
      pushEntitySafely(game.player, (-ny * 0.7 + nx * 0.5) * push, (nx * 0.7 + ny * 0.5) * push);
      if (doDamage) {
        game.player.health = Math.max(5, game.player.health - 4);
        game.run.shakeUntil = Date.now() + 260;
        notify(game, '🌪️ Caught in the tornado winds! −4 HP', '#ffb070');
      }
    }
  }

  // Push villagers & damage nearby walls slightly
  for (const villager of game.run.villagers) {
    if (villager.ko || villager.dead) continue;
    const dist = Math.hypot(villager.x - d.x, villager.y - d.y);
    if (dist < d.radius) {
      const nx = dist > 0.1 ? (villager.x - d.x) / dist : 1;
      const ny = dist > 0.1 ? (villager.y - d.y) / dist : 0;
      pushEntitySafely(villager, nx * 2.5 * dt, ny * 2.5 * dt);
      if (doDamage && Math.random() < 0.25) villager.hp = Math.max(1, villager.hp - 3);
    }
  }
  if (doDamage) damageNearbyWalls(game, d.x, d.y, d.radius + 1, 7);
}

function updateTsunami(game, d, dt) {
  if (d.elapsed < d.warningSeconds) return;
  const waveTime = d.elapsed - d.warningSeconds;
  const sweepTime = d.duration - d.warningSeconds;
  const progress = Math.min(1, waveTime / Math.max(1, sweepTime));
  const waveDist = progress * d.maxDist;
  const waveX = d.originX + d.dirX * waveDist;
  const waveY = d.originY + d.dirY * waveDist;

  d.soundAt = (d.soundAt || 0) - dt;
  if (d.soundAt <= 0) {
    d.soundAt = 2.6;
    cue(game, 'tsunami');
  }
  if (Math.random() < dt * 16) {
    const perpX = -d.dirY * (Math.random() - 0.5) * d.width * 0.6;
    const perpY = d.dirX * (Math.random() - 0.5) * d.width * 0.6;
    dust(game, waveX + perpX, waveY + perpY, '#bfe6ff');
  }

  const inWave = (tx, ty) => {
    const rx = tx - d.originX;
    const ry = ty - d.originY;
    const along = rx * d.dirX + ry * d.dirY;
    const perp = Math.abs(rx * -d.dirY + ry * d.dirX);
    return Math.abs(along - waveDist) < 2.2 && perp < d.width / 2;
  };

  if (!isInsideWorld(game.player.y) && inWave(game.player.x, game.player.y)) {
    pushEntitySafely(game.player, d.dirX * 4.5 * dt, d.dirY * 4.5 * dt);
    if (!d.hitPlayer) {
      d.hitPlayer = true;
      game.player.health = Math.max(5, game.player.health - 8);
      game.run.shakeUntil = Date.now() + 350;
      notify(game, '🌊 Swept by the tsunami wave! −8 HP', '#5fd3e8');
    }
  }

  for (const villager of game.run.villagers) {
    if (villager.ko || villager.dead) continue;
    if (inWave(villager.x, villager.y)) {
      pushEntitySafely(villager, d.dirX * 3.5 * dt, d.dirY * 3.5 * dt);
      if (!d.hitVillagers[villager.id]) {
        d.hitVillagers[villager.id] = true;
        villager.hp = Math.max(1, villager.hp - 5);
      }
    }
  }

  // Slight coastal wall damage once
  const key = Math.floor(waveDist / 4);
  if (!d.hitWalls[key]) {
    d.hitWalls[key] = true;
    damageNearbyWalls(game, waveX, waveY, d.width / 2, 10);
  }
}

export function updateDisasters(game, dt) {
  const s = ensureSociety(game);
  const d = s.disaster;
  if (!d) return;

  d.elapsed = (d.elapsed || 0) + dt;
  if (d.elapsed >= d.duration) {
    const label = d.kind === 'tsunami' ? '🌊 The tsunami waters recede.' : '🌪️ The tornado finally fades away.';
    s.disaster = null;
    if (zoneAt(game.player.x, game.player.y).kind === 'village') addHappiness(game, -1);
    notify(game, label, '#9fd8ff');
    return;
  }

  if (d.kind === 'tornado') updateTornado(game, d, dt);
  else if (d.kind === 'tsunami') updateTsunami(game, d, dt);
}
