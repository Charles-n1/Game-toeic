import { POWERS, powerOf } from '../data/powers';
import { isSolid } from '../world/map';
import { heal, maxMana } from './player';
import { lootMonster } from './loot';
import { notify } from './messages';
import { burst, bolt, floatText } from './particles';

// The powers used on the map: obsidian, lightning, and the elements.
// A power never kills a big monster: only a good answer can. (And a kill without answer gives no XP.)

const MAX_SOLDIERS = 3;
const MANA_EVERY = 15; // seconds to get 1 mana back, just by walking around
const DIRECTIONS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

export function knownPowers(player) {
  return POWERS.filter((power) => player.powers.includes(power.key));
}

// Seconds before this power can be used again (0 = ready).
export function cooldownLeft(game, powerId) {
  const readyAt = game.run.cooldowns[powerId] || 0;
  return Math.max(0, Math.ceil((readyAt - Date.now()) / 1000));
}

export function canUsePower(game, power) {
  return game.player.mana >= power.mana && cooldownLeft(game, power.id) === 0;
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

// ---------- Obsidian ----------

// A ring of black glass, 2 tiles around the player.
function raiseBarrier(game) {
  const centerX = Math.floor(game.player.x);
  const centerY = Math.floor(game.player.y);
  const until = Date.now() + 10000;
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      const isRing = Math.abs(dx) === 2 || Math.abs(dy) === 2;
      if (isRing && !isSolid(centerX + dx, centerY + dy)) {
        game.run.barriers.push({ x: centerX + dx, y: centerY + dy, until: until });
        burst(game, centerX + dx + 0.5, centerY + dy + 0.5, '#3a2f5b', 4);
      }
    }
  }
  return true;
}

function summonSoldier(game) {
  if (game.player.soldiers >= MAX_SOLDIERS) {
    notify(game, 'You can not hold more than ' + MAX_SOLDIERS + ' soldiers.');
    return false;
  }
  game.player.soldiers += 1;
  burst(game, game.player.x, game.player.y, '#3a2f5b', 30);
  notify(game, '♟️ An obsidian soldier rises. +10 damage.');
  return true;
}

function summonPet(game) {
  if (game.player.pet) {
    notify(game, 'Your obsidian cat is already here.');
    return false;
  }
  game.player.pet = true;
  burst(game, game.player.x, game.player.y, '#3a2f5b', 20);
  notify(game, '🐈‍⬛ It purrs like breaking glass. It will show the treasures near you.');
  return true;
}

function forgeBlade(game) {
  game.player.obsidianBlade = 5;
  burst(game, game.player.x, game.player.y, '#b48cff', 30);
  notify(game, '🔪 Obsidian Blade: +20 damage for 5 fights.');
  return true;
}

// ---------- Lightning ----------

// A power wounds a monster. A small one can die of it, a big one always keeps half a heart.
function wound(game, monster, damage) {
  bolt(game, monster.x, monster.y);
  monster.health -= damage;
  if (monster.health > 0) return;
  if (monster.tier === 'small') lootMonster(game, monster);
  else monster.health = 10;
}

function thunderVerdict(game) {
  const near = game.run.monsters.filter((monster) => distance(monster, game.player) < 4);
  for (const monster of near) {
    const damage = monster.tier === 'small' ? monster.health : Math.ceil(monster.health / 2);
    wound(game, monster, damage);
  }
  game.run.flashUntil = Date.now() + 200; // the whole screen turns white for a moment
  if (near.length === 0) notify(game, 'The thunder falls on nothing.');
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
  if (!canUsePower(game, power)) return;
  if (!EFFECTS[powerId](game)) return;
  game.player.mana -= power.mana;
  game.run.cooldowns[powerId] = Date.now() + power.cooldown * 1000;
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
  }
}

function regainMana(game, dt) {
  game.run.manaTime += dt;
  if (game.run.manaTime < MANA_EVERY) return;
  game.run.manaTime = 0;
  if (game.player.mana < maxMana(game.player)) game.player.mana += 1;
}

export function updatePowers(game, dt) {
  const now = Date.now();
  game.run.barriers = game.run.barriers.filter((barrier) => barrier.until > now);
  if (game.run.storm && game.run.storm.until < now) game.run.storm = null;
  game.run.balls.forEach((ball) => moveBall(game, ball, dt));
  game.run.balls = game.run.balls.filter((ball) => ball.life > 0);
  regainMana(game, dt);
}
