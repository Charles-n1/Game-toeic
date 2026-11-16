import { NPCS } from '../data/npcs';
import { SCENES } from '../data/story';
import { zoneAt, villageOf } from '../data/zones';
import { pickRandom } from '../../logic/random';
import { makeMonster } from './monsters';
import { isNight, NIGHTFALL, SUNRISE } from './clock';
import { killNpc, addHappiness } from './village';
import { earnLexis, awaken } from './player';
import { say, notify } from './messages';

// Every 7 nights, the north attacks Eldermoor. The monsters walk to the villagers and kill them,
// unless the player fights them first. Each raid is bigger than the one before.
// game.raid: { nextDay, count (raids survived), perfect (raids without a death), active, deaths }

const DAYS_BETWEEN_RAIDS = 7;
const BITE_SECONDS = 6; // how long a monster must stay on a villager to kill them
// The raiders come in by the gates of Eldermoor (in the middle of each gate, 2 tiles outside).
const ELDERMOOR = villageOf('lexia');
const GATES = ELDERMOOR.plan.gates.map((gate) => ({ x: gate.x + (gate.dx === 0 ? 1 : 0.5) + gate.dx * 2, y: gate.y + (gate.dy === 0 ? 1 : 0.5) + gate.dy * 2 }));
// The monsters of the 1st raid, of the 2nd... (the last list is used for all the next ones).
const WAVES = [['wolf', 'goblin'], ['wolf', 'orc'], ['orc', 'skeleton'], ['orc', 'drake'], ['darkKnight', 'shadowMage']];

function raiders(game) {
  return game.run.monsters.filter((monster) => monster.raid);
}

// 3 monsters the first time, 2 more each raid. Without their general, they are half as many.
function raidSize(game) {
  const size = 3 + game.raid.count * 2;
  return game.bosses.general ? Math.ceil(size / 2) : size;
}

function spawnRaider(game) {
  const gate = pickRandom(GATES);
  const wave = WAVES[Math.min(game.raid.count, WAVES.length - 1)];
  const x = gate.x + (Math.random() - 0.5) * 2;
  const y = gate.y + (Math.random() - 0.5) * 2;
  game.run.monsters.push(makeMonster(game, pickRandom(wave), x, y, { raid: true, target: gate, biteTime: 0 }));
}

// The first raid is a scene of the story: the elder dies, and the lightning wakes up in the player.
function playNightOfSilence(game) {
  if (game.npcs.orin.alive) {
    say(game, 'orin', SCENES.nightOfSilence.lines);
    killNpc(game, 'orin', null);
  }
  awaken(game, 'lightning', { speaker: null, lines: ['LIGHTNING has awakened. Open the menu: Powers.'] });
}

function startRaid(game) {
  game.raid.active = true;
  game.raid.deaths = 0;
  if (game.raid.count === 0) playNightOfSilence(game);
  for (let i = 0; i < raidSize(game); i++) spawnRaider(game);
  notify(game, '🔥 LEXIA IS UNDER ATTACK! Protect the villagers!', '#ff6060');
}

// The hero must be close to Eldermoor (else the raid waits for a night when they are there).
function isHeroNear(game) {
  return Math.hypot(game.player.x - (ELDERMOOR.x + ELDERMOOR.w / 2), game.player.y - (ELDERMOOR.y + ELDERMOOR.h / 2)) < 200;
}

function shouldStart(game) {
  return !game.bosses.king && game.day >= game.raid.nextDay && game.hour >= NIGHTFALL && isHeroNear(game);
}

// The people a raider can kill: the adults who are in Eldermoor. (The children hide.)
function villagers(game) {
  return NPCS.filter((npc) => {
    const place = game.run.people[npc.id];
    return !npc.child && game.npcs[npc.id].alive && !game.player.party.includes(npc.id) && zoneAt(place.x, place.y).id === 'lexia';
  });
}

function closestVillager(game, monster) {
  let closest = null;
  let best = Infinity;
  for (const npc of villagers(game)) {
    const place = game.run.people[npc.id];
    const far = Math.hypot(place.x - monster.x, place.y - monster.y);
    if (far < best) {
      closest = npc;
      best = far;
    }
  }
  return closest;
}

// The raider walks to its victim. If it stays on them long enough, they die.
function hunt(game, monster, dt) {
  const victim = closestVillager(game, monster);
  if (!victim) {
    monster.target = game.player; // nobody left: it comes for the player
    return;
  }
  const place = game.run.people[victim.id];
  monster.target = place;
  if (Math.hypot(place.x - monster.x, place.y - monster.y) > 1) return;
  monster.biteTime += dt;
  if (monster.biteTime >= BITE_SECONDS) {
    monster.biteTime = 0;
    game.raid.deaths += 1;
    killNpc(game, victim.id, [victim.name + ' screams. Then the scream stops, like a sentence cut in the middle.']);
  }
}

// won: all the raiders are dead. Not won: the sun came up and the survivors went back north.
function endRaid(game, won) {
  const raid = game.raid;
  game.run.monsters = game.run.monsters.filter((monster) => !monster.raid);
  raid.active = false;
  raid.count += 1;
  raid.nextDay = game.day + (game.hour < SUNRISE ? DAYS_BETWEEN_RAIDS - 1 : DAYS_BETWEEN_RAIDS);
  if (raid.deaths === 0) raid.perfect += 1;
  if (!won) {
    addHappiness(game, -5);
    notify(game, 'The sun rises. The monsters go back north.');
    return;
  }
  const reward = 40 * raid.count;
  earnLexis(game, reward);
  addHappiness(game, raid.deaths === 0 ? 10 : 4);
  notify(game, '🛡️ The raid is over! The village gives you ' + reward + ' Lexis.', '#7CFC9A');
}

// Called every frame.
export function updateRaid(game, dt) {
  if (!game.raid.active) {
    if (shouldStart(game)) startRaid(game);
    return;
  }
  const attackers = raiders(game);
  attackers.forEach((monster) => hunt(game, monster, dt));
  if (attackers.length === 0) endRaid(game, true);
  else if (!isNight(game)) endRaid(game, false);
}

// Days before the next raid (0 = tonight).
export function daysBeforeRaid(game) {
  return Math.max(0, game.raid.nextDay - game.day);
}
