import { POWERS, powerOf } from '../data/powers';
import { NPCS } from '../data/npcs';
import { isSolid } from '../world/map';
import { heal, maxMana } from './player';
import { lootMonster } from './loot';
import { notify, say } from './messages';
import { burst, bolt, floatText, bloodSplatter, bloodHit } from './particles';
import { startFight } from './fight';
import { makeDuel } from './duels';
import { saveGame } from './save';
import { hurtAnimal } from './animals';
import { soldierUnitMaxHp, emitObsidianShockwave, eruptObsidianSpikes } from './obsidian';

// The powers used on the map: obsidian, lightning, and the elements.
// A power never kills a big monster: only a good answer can. (And a kill without answer gives no XP.)

const MAX_SOLDIERS = 3;
export const SOLDIER_MAX_HP = 45;
// The obsidian soldiers and the cat crumble after a while (seconds of walking on the map, not in a fight or a menu).
// "Obsidian Control", trained at the training dummies of the villages (logic/school.js), keeps them longer.
const SUMMON_SECONDS = 20;
const SECONDS_PER_CONTROL = 20;
export const MAX_CONTROL = 5;
const MANA_EVERY = 15; // seconds to get 1 mana back, just by walking around
const DIRECTIONS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

export function knownPowers(player) {
  return POWERS.filter((power) => player.powers.includes(power.key));
}

export function isPowerUnlocked(player, powerId) {
  const power = powerOf(powerId);
  if (!power || !player.powers.includes(power.key)) return false;
  if (!power.train) return true;
  if (power.key === 'obsidian') {
    const unlocked = player.obsidianUnlocked || ['obsidianBarrier'];
    return unlocked.includes(powerId);
  }
  return true;
}

export function gainObsidianXp(game, amount = 1) {
  const player = game.player;
  if (!player.powers.includes('obsidian')) return;
  if (!Array.isArray(player.obsidianUnlocked)) player.obsidianUnlocked = ['obsidianBarrier'];
  player.obsidianXp = (player.obsidianXp || 0) + amount;
  for (const power of POWERS) {
    if (power.key !== 'obsidian' || !power.train) continue;
    if (!player.obsidianUnlocked.includes(power.id) && player.obsidianXp >= power.train.xp) {
      player.obsidianUnlocked.push(power.id);
      notify(game, '🌑 Obsidian training complete: unlocked ' + power.name + '!', '#c9a8ff');
    }
  }
}

export function trainObsidianPower(game, powerId) {
  const power = powerOf(powerId);
  const player = game.player;
  if (!power || !power.train || isPowerUnlocked(player, powerId)) return;
  if (!Array.isArray(player.obsidianUnlocked)) player.obsidianUnlocked = ['obsidianBarrier'];
  const guide = NPCS[0];
  startFight(
    game,
    makeDuel(guide, {
      title: 'Obsidian Trial: ' + power.name,
      category: game.focus.current || 'connectors',
      tag: 'normal',
      health: power.train.trial,
      speed: 11,
      shape: 'wisp',
      onWin: () => {
        if (!player.obsidianUnlocked.includes(powerId)) player.obsidianUnlocked.push(powerId);
        player.obsidianXp = Math.max(player.obsidianXp || 0, power.train.xp);
        say(game, null, ['🌑 The black glass answers your command! You mastered ' + power.name + '!']);
        saveGame(game);
      },
      onLose: () => say(game, null, ['The obsidian shard cools down. Train harder or fight more to unlock ' + power.name + '.']),
    })
  );
}

// Seconds before this power can be used again (0 = ready).
export function cooldownLeft(game, powerId) {
  const readyAt = game.run.cooldowns[powerId] || 0;
  return Math.max(0, Math.ceil((readyAt - Date.now()) / 1000));
}

export function canUsePower(game, power) {
  return isPowerUnlocked(game.player, power.id) && game.player.mana >= power.mana && cooldownLeft(game, power.id) === 0;
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

// ---------- Obsidian ----------

// A ring of black glass, 2 tiles around the player.
function raiseBarrier(game) {
  const centerX = Math.floor(game.player.x);
  const centerY = Math.floor(game.player.y);
  const until = Date.now() + 12000;
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      const isRing = Math.abs(dx) === 2 || Math.abs(dy) === 2;
      if (isRing && !isSolid(centerX + dx, centerY + dy)) {
        game.run.barriers.push({ x: centerX + dx, y: centerY + dy, until: until });
        burst(game, centerX + dx + 0.5, centerY + dy + 0.5, '#3a2f5b', 4);
      }
    }
  }
  emitObsidianShockwave(game, game.player.x, game.player.y, 3.2, '#b48cff');
  if (!game.player.obsidianUnlocked) game.player.obsidianUnlocked = ['obsidianBarrier'];
  gainObsidianXp(game, 1);
  return true;
}

function summonSoldier(game) {
  if (game.player.soldiers >= MAX_SOLDIERS) {
    notify(game, 'You can not hold more than ' + MAX_SOLDIERS + ' soldiers.');
    return false;
  }
  const unitHp = soldierUnitMaxHp(game.player);
  game.player.soldiers += 1;
  game.player.soldierHp = Math.min(game.player.soldiers * unitHp, (game.player.soldierHp || 0) + unitHp);
  game.player.soldierTime = summonSeconds(game.player); // a new soldier: the whole guard stays longer
  emitObsidianShockwave(game, game.player.x, game.player.y, 2.6, '#9f78ff');
  notify(game, '♟️ Obsidian Sentinel rises (' + unitHp + ' shield HP)! Attacks every turn & shields in front.');
  return true;
}

function summonPet(game) {
  if (game.player.pet) {
    notify(game, 'Your obsidian cat is already here.');
    return false;
  }
  game.player.pet = true;
  game.player.petTime = summonSeconds(game.player);
  emitObsidianShockwave(game, game.player.x, game.player.y, 2.2, '#c9a8ff');
  notify(game, '🐈‍⬛ It purrs like breaking glass. Reveals treasures & boosts rare drops.');
  return true;
}

function forgeBlade(game) {
  game.player.obsidianBlade = 5;
  emitObsidianShockwave(game, game.player.x, game.player.y, 3.0, '#d8b4f8');
  notify(game, '🔪 Obsidian Blade active for 5 fights: pierces armor & slashes abyssal shards!');
  return true;
}

// ---------- How long the obsidian guard and the cat stay ----------

// 20 seconds, +20 for each level of Obsidian Control.
export function summonSeconds(player) {
  return SUMMON_SECONDS + (player.obsidianControl || 0) * SECONDS_PER_CONTROL;
}

// The soldiers go back to the ground (the player sent them away, or their time is over).
export function dismissSoldiers(game) {
  if (game.player.soldiers > 0) burst(game, game.player.x, game.player.y, '#3a2f5b', 20);
  game.player.soldiers = 0;
  game.player.soldierHp = 0;
  game.player.soldierTime = 0;
}

export function dismissPet(game) {
  if (game.player.pet) burst(game, game.player.x, game.player.y, '#3a2f5b', 10);
  game.player.pet = false;
  game.player.petTime = 0;
}

// Every frame on the map: the time of the soldiers and of the cat runs out.
function countDownSummons(game, dt) {
  const player = game.player;
  if (player.soldiers > 0) {
    player.soldierTime -= dt;
    if (player.soldierTime <= 0) {
      dismissSoldiers(game);
      notify(game, '♟️ Your obsidian guard crumbles back into the ground.', '#c9a8ff');
    }
  }
  if (player.pet) {
    player.petTime -= dt;
    if (player.petTime <= 0) {
      dismissPet(game);
      notify(game, '🐈‍⬛ The obsidian cat melts into a shadow.', '#c9a8ff');
    }
  }
}

// ---------- Lightning ----------

// A power wounds a monster. A small one can die of it, a big one always keeps half a heart.
function wound(game, monster, damage) {
  bolt(game, monster.x, monster.y);
  monster.health -= damage;
  if (monster.health > 0) {
    bloodHit(game, monster.x, monster.y, 5);
    return;
  }
  if (monster.tier === 'small') {
    bloodSplatter(game, monster.x, monster.y, 11);
    lootMonster(game, monster);
  } else {
    bloodHit(game, monster.x, monster.y, 6);
    monster.health = 10;
  }
}

function thunderVerdict(game) {
  const near = game.run.monsters.filter((monster) => distance(monster, game.player) < 4);
  for (const monster of near) {
    const damage = monster.tier === 'small' ? monster.health : Math.ceil(monster.health / 2);
    wound(game, monster, damage);
  }
  const prey = [...(game.run.wildAnimals || []), ...(game.run.animals || [])].filter((a) => distance(a, game.player) < 4);
  for (const animal of prey) hurtAnimal(game, animal, 50);
  game.run.flashUntil = Date.now() + 200; // the whole screen turns white for a moment
  if (near.length === 0 && prey.length === 0) notify(game, 'The thunder falls on nothing.');
  return true;
}

function raiseStorm(game) {
  game.run.storm = { x: game.player.x, y: game.player.y, radius: 4, until: Date.now() + 30000 };
  notify(game, '🌩️ Storm Field: fight inside it!');
  return true;
}

export function isInStormField(game) {
  const storm = game.run.storm;
  return storm !== null && distance(storm, game.player) < storm.radius;
}

// A ball flying in the direction the player looks at.
function throwBall(game, damage, color) {
  const [dx, dy] = DIRECTIONS[game.player.dir];
  game.run.balls.push({ x: game.player.x, y: game.player.y, dx: dx, dy: dy, damage: damage, color: color, life: 1.2 });
  return true;
}

function throwLightningBall(game) {
  return throwBall(game, 40, '#9fd8ff');
}

// ---------- Elements ----------

function healingRain(game) {
  heal(game.player, 60);
  burst(game, game.player.x, game.player.y, '#6ec6ff', 30);
  floatText(game, game.player.x, game.player.y, '+60', '#7CFC9A');
  return true;
}

function throwFireball(game) {
  return throwBall(game, 20, '#ff7b3a');
}

function windDash(game) {
  game.run.dashUntil = Date.now() + 8000;
  burst(game, game.player.x, game.player.y, '#c8ffd8', 20);
  return true;
}

function stoneSkin(game) {
  game.player.stoneSkin = true;
  burst(game, game.player.x, game.player.y, '#b08a5a', 20);
  notify(game, '⛰️ Stone Skin: +20 armor for your next fight.');
  return true;
}

// What each power does. Each function returns false if the power could not be used (nothing is paid then).
const EFFECTS = {
  obsidianBarrier: raiseBarrier,
  obsidianSoldier: summonSoldier,
  obsidianPet: summonPet,
  obsidianBlade: forgeBlade,
  obsidianSpike: (game) => eruptObsidianSpikes(game, (m, dmg) => wound(game, m, dmg), (a, dmg) => hurtAnimal(game, a, dmg)),
  lightningStrike: thunderVerdict,
  lightningField: raiseStorm,
  lightningBall: throwLightningBall,
  water: healingRain,
  fire: throwFireball,
  wind: windDash,
  earth: stoneSkin,
};

export function usePower(game, powerId) {
  const power = powerOf(powerId);
  if (!canUsePower(game, power)) return false;
  if (!EFFECTS[powerId](game)) return false;
  game.player.mana -= power.mana;
  game.run.cooldowns[powerId] = Date.now() + power.cooldown * 1000;
  return true;
}

// ---------- Every frame ----------

export function isBarrier(game, x, y) {
  return game.run.barriers.some((barrier) => barrier.x === Math.floor(x) && barrier.y === Math.floor(y));
}

function moveBall(game, ball, dt) {
  ball.life -= dt;
  ball.x += ball.dx * 9 * dt;
  ball.y += ball.dy * 9 * dt;
  if (isSolid(ball.x, ball.y)) ball.life = 0;
  const hit = game.run.monsters.find((monster) => distance(monster, ball) < 0.7);
  if (hit) {
    wound(game, hit, ball.damage);
    ball.life = 0;
    return;
  }
  const hitAnimal = [...(game.run.wildAnimals || []), ...(game.run.animals || [])].find((a) => distance(a, ball) < 0.8);
  if (hitAnimal) {
    hurtAnimal(game, hitAnimal, ball.damage);
    ball.life = 0;
  }
}

function regainMana(game, dt) {
  game.run.manaTime += dt;
  if (game.run.manaTime < MANA_EVERY) return;
  game.run.manaTime = 0;
  if (game.player.mana < maxMana(game.player)) game.player.mana += 1;
}

function applyBarrierThorns(game, now) {
  if (!game.run.barriers || game.run.barriers.length === 0) return;
  for (const m of [...(game.run.monsters || [])]) {
    if (m.barrierCd && now < m.barrierCd) continue;
    const touching = game.run.barriers.find((b) => Math.hypot(b.x + 0.5 - m.x, b.y + 0.5 - m.y) < 0.85);
    if (!touching) continue;
    m.barrierCd = now + 1100;
    const dx = m.x - (touching.x + 0.5);
    const dy = m.y - (touching.y + 0.5);
    const len = Math.max(0.1, Math.hypot(dx, dy));
    m.x += (dx / len) * 0.45;
    m.y += (dy / len) * 0.45;
    burst(game, m.x, m.y, '#b48cff', 6);
    if (m.health > 6 || m.tier === 'small') wound(game, m, 6);
  }
}

export function updatePowers(game, dt) {
  const now = Date.now();
  game.run.barriers = game.run.barriers.filter((barrier) => barrier.until > now);
  applyBarrierThorns(game, now);
  if (game.run.storm && game.run.storm.until < now) game.run.storm = null;
  game.run.balls.forEach((ball) => moveBall(game, ball, dt));
  game.run.balls = game.run.balls.filter((ball) => ball.life > 0);
  regainMana(game, dt);
  countDownSummons(game, dt);
}
