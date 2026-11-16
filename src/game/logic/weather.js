import { NPCS, npcOf } from '../data/npcs';
import { zoneAt, HOUSES, doorOf } from '../data/zones';
import { isSolid, propsAround } from '../world/map';
import { pickRandom } from '../../logic/random';
import { killNpc, addFriendship, addHappiness } from './village';
import { addBoost, clearBoostSource } from './boosts';
import { say, notify } from './messages';
import { burst } from './particles';
import { cue } from './cues';
import { emote } from './emotes';

// The sky: clear, cloudy, rain, or a storm. Sometimes a strong wind blows too (always in a storm): it puts out torches. A storm throws lightning at random: whoever is hit is knocked out
// (KO), or killed (only the simple villagers can die of it). A KO person can be saved: the hero carries them
// to a healing house (a clinic) before 12 hours pass.
// game.weather: { kind, windy, until } (until: the hour of the game, counted from day 1, when it changes).
// game.npcs[id].ko: { since } (hours). game.player.carrying: { kind: 'npc' | 'villager', id } or null.

const KINDS = [
  ['clear', 50],
  ['cloudy', 20],
  ['rain', 20],
  ['storm', 10],
];
const WINDY_CHANCE = { clear: 0.1, cloudy: 0.25, rain: 0.3, storm: 1 }; // the chance of a strong wind, for each sky
const KO_HOURS = 12; // after that, a KO person dies
const STRIKE_EVERY = [6, 16]; // seconds between two lightning strikes, in a storm
const STRIKE_RANGE = 9; // tiles around the hero (the strikes far away are not seen)
const HIT_RANGE = 1.2;

function hoursNow(game) {
  return game.day * 24 + game.hour;
}

function pickWeather() {
  let roll = Math.random() * 100;
  for (const [kind, chance] of KINDS) {
    roll -= chance;
    if (roll < 0) return kind;
  }
  return 'clear';
}

function pickWind(kind) {
  return Math.random() < WINDY_CHANCE[kind];
}

export function firstWeather() {
  return { kind: 'clear', windy: false, until: 24 + 12 };
}

export function isRaining(game) {
  return game.weather.kind === 'rain' || game.weather.kind === 'storm';
}

export function isWindy(game) {
  return Boolean(game.weather.windy);
}

// Is the hero under the sky? (Not inside a dungeon or the home.)
export function isOutdoors(game) {
  return zoneAt(game.player.x, game.player.y).kind !== 'inside';
}

// ---------- The lightning ----------

function strike(game, x, y) {
  game.run.bolts.push({ x: x, y: y, at: Date.now() });
  game.run.flashUntil = Date.now() + 120;
  cue(game, 'thunder');
  burst(game, x, y, '#fff6b0', 18);
  const player = game.player;
  if (Math.hypot(player.x - x, player.y - y) < HIT_RANGE) {
    player.health = Math.max(0, player.health - 35);
    notify(game, '⚡ The lightning hits you! −35 HP', '#ff8a95');
    game.run.shakeUntil = Date.now() + 400;
  }
  for (const npc of NPCS) {
    const place = game.run.people[npc.id];
    const state = game.npcs[npc.id];
    if (place && state.alive && !state.ko && Math.hypot(place.x - x, place.y - y) < HIT_RANGE && game.run.visible[npc.id]) knockOutNpc(game, npc.id);
  }
  for (const villager of game.run.villagers) {
    if (!villager.ko && Math.hypot(villager.x - x, villager.y - y) < HIT_RANGE) {
      if (Math.random() < 0.3) {
        villager.dead = true;
        villager.ko = true;
        notify(game, '⚡ The lightning killed a ' + villager.name.toLowerCase() + '...', '#ff8080');
        addHappiness(game, -3);
      } else {
        villager.ko = { since: hoursNow(game) };
        notify(game, '⚡ A ' + villager.name.toLowerCase() + ' was hit! Carry them to a healing house.', '#ffb070');
      }
    }
  }
}

function knockOutNpc(game, npcId) {
  game.npcs[npcId].ko = { since: hoursNow(game) };
  notify(game, '⚡ ' + npcOf(npcId).name + ' was hit by the lightning! Carry them to a healing house, fast.', '#ffb070');
}

// A strike falls somewhere around the hero. Mostly on what stands tall: people, trees... or anywhere.
function nextStrikePlace(game) {
  const player = game.player;
  const targets = [...NPCS.filter((npc) => game.run.visible[npc.id]).map((npc) => game.run.people[npc.id]), ...game.run.villagers.filter((villager) => !villager.ko)];
  const near = targets.filter((target) => Math.hypot(target.x - player.x, target.y - player.y) < STRIKE_RANGE);
  if (near.length > 0 && Math.random() < 0.18) return pickRandom(near);
  if (Math.random() < 0.06) return player;
  return { x: player.x + (Math.random() - 0.5) * STRIKE_RANGE * 2, y: player.y + (Math.random() - 0.5) * STRIKE_RANGE * 1.4 };
}

export function cureCold(game, reason = null) {
  const cold = game.player.cold;
  if (!cold) return false;
  const wasSick = Boolean(cold.active);
  cold.active = false;
  cold.exposure = 0;
  clearBoostSource(game, 'cold');
  if (wasSick && reason) notify(game, reason, '#7cfc9a');
  return wasSick;
}

function updateCold(game, dt) {
  const player = game.player;
  if (!player.cold) player.cold = { active: false, exposure: 0 };
  const nearFire = propsAround(player.x, player.y, 3).some((prop) => prop.kind === 'campfire' || prop.kind === 'stove');
  if (nearFire || !isOutdoors(game)) {
    player.cold.exposure = Math.max(0, player.cold.exposure - dt * 2.5);
    if (nearFire && player.cold.active && Math.random() < dt * 0.08) {
      cureCold(game, '🔥 The fire warmed you right up — your cold is gone!');
    }
    return;
  }
  if (!isRaining(game)) {
    player.cold.exposure = Math.max(0, player.cold.exposure - dt * 0.6);
    return;
  }
  player.cold.exposure += dt * (game.weather.kind === 'storm' ? 1.6 : 1.0);
  if (!player.cold.active && player.cold.exposure >= 22) {
    player.cold.active = true;
    addBoost(game, 'speed', -2, null, 'cold');
    addBoost(game, 'attack', -3, null, 'cold');
    emote(game, 'hero', 'sweat');
    notify(game, '🤧 You caught a cold in the rain! (-2 Speed, -3 Attack). Warm up indoors, by a fire, or with hot soup/tea.', '#9fd8ff');
  }
}

// ---------- Every frame ----------

export function updateWeather(game, dt) {
  if (hoursNow(game) >= game.weather.until) {
    const kind = pickWeather();
    const windy = pickWind(kind);
    game.weather = { kind: kind, windy: windy, until: hoursNow(game) + 2 + Math.random() * 5 };
    if (kind === 'storm') notify(game, '⛈️ A storm is coming. Stay away from the open fields...', '#9fb4ff');
    if (kind === 'rain') notify(game, '🌧️ It starts to rain.', '#9fd8ff');
    if (windy && kind !== 'storm') notify(game, '💨 A strong wind rises. Torches will not hold.', '#cfe3ff');
  }
  updateCold(game, dt);
  game.run.bolts = game.run.bolts.filter((bolt) => Date.now() - bolt.at < 600);
  if (game.weather.kind !== 'storm' || !isOutdoors(game)) return;
  game.run.strikeTime -= dt;
  if (game.run.strikeTime <= 0) {
    game.run.strikeTime = STRIKE_EVERY[0] + Math.random() * (STRIKE_EVERY[1] - STRIKE_EVERY[0]);
    const place = nextStrikePlace(game);
    strike(game, place.x, place.y);
  }
}

// ---------- The KO people ----------

// Too late: a KO person who waited more than 12 hours dies.
export function checkKnockedOut(game) {
  for (const npc of NPCS) {
    const ko = game.npcs[npc.id].ko;
    if (ko && hoursNow(game) - ko.since > KO_HOURS && game.player.carrying?.id !== npc.id) {
      game.npcs[npc.id].ko = null;
      killNpc(game, npc.id, [npc.name + ' never woke up. Nobody carried them to a healer in time.']);
    }
  }
  for (const villager of game.run.villagers) {
    if (villager.ko && villager.ko.since !== undefined && hoursNow(game) - villager.ko.since > KO_HOURS && game.player.carrying?.id !== villager.id) villager.dead = true;
  }
}

// The KO person close to the hero (npc or villager): { kind, id, name } or null.
export function knockedOutNear(game) {
  if (game.player.carrying) return null;
  const player = game.player;
  for (const npc of NPCS) {
    const place = game.run.people[npc.id];
    if (game.npcs[npc.id].ko && place && Math.hypot(place.x - player.x, place.y - player.y) < 1.5) return { kind: 'npc', id: npc.id, name: npc.name };
  }
  const villager = game.run.villagers.find((item) => item.ko && !item.dead && Math.hypot(item.x - player.x, item.y - player.y) < 1.5);
  return villager ? { kind: 'villager', id: villager.id, name: 'the ' + villager.name.toLowerCase() } : null;
}

export function carry(game, person) {
  game.player.carrying = person;
  say(game, null, ['You lift ' + person.name + ' on your back. Quick: to a healing house (a clinic, with the red potion on its sign).']);
}

// The doors of the healing houses (the clinics of the villages).
function clinicsNear(game) {
  return HOUSES.filter((house) => house.role === 'clinic').map(doorOf).filter((door) => Math.hypot(door.x + 0.5 - game.player.x, door.y + 1.5 - game.player.y) < 2);
}

// Called every second: the hero arrives at a clinic with someone on their back -> saved.
export function checkRescue(game) {
  const carrying = game.player.carrying;
  if (!carrying || clinicsNear(game).length === 0) return;
  game.player.carrying = null;
  if (carrying.kind === 'npc') {
    game.npcs[carrying.id].ko = null;
    addFriendship(game, carrying.id, 20);
    say(game, carrying.id, ['...Where am I? You carried me here? All the way?', 'I owe you my life. I will not forget it.']);
  } else {
    const villager = game.run.villagers.find((item) => item.id === carrying.id);
    if (villager) villager.ko = false;
    say(game, null, ['The healer takes care of ' + carrying.name + '. They will live, thanks to you.']);
  }
  addHappiness(game, 5);
}

// Where the carried person is put down: next to the hero (if they want to stop carrying).
export function putDown(game) {
  const carrying = game.player.carrying;
  if (!carrying) return;
  game.player.carrying = null;
  const spot = isSolid(game.player.x + 1, game.player.y) ? { x: game.player.x, y: game.player.y + 1 } : { x: game.player.x + 1, y: game.player.y };
  if (carrying.kind === 'npc') Object.assign(game.run.people[carrying.id], spot);
  else Object.assign(game.run.villagers.find((item) => item.id === carrying.id) || {}, spot);
}
