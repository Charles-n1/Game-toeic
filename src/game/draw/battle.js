import { HERO_LOOK } from '../data/npcs';
import { typeOf } from '../data/types';
import { personSprite } from './people';
import { monsterSprite } from './monsters';
import { TILE_PX } from './tiles';

// A fight happens right on the map: the hero on the left, the opponent on the right, face to face.

export const BATTLE_GAP = 2.5; // tiles between the hero and the opponent
const LUNGE_TIME = 300; // milliseconds of a jump forward
const LUNGE_DISTANCE = 14; // pixels of the art

// Where the two fighters stand, in tiles.
export function battlePlaces(game) {
  const player = game.player;
  return { hero: { x: player.x, y: player.y }, foe: { x: player.x + BATTLE_GAP, y: player.y } };
}

// How far a fighter has jumped forward, `age` milliseconds after the start of their strike.
function lunge(age) {
  if (age < 0 || age > LUNGE_TIME) return 0;
  return Math.round(Math.sin((age / LUNGE_TIME) * Math.PI) * LUNGE_DISTANCE);
}

// The order of a turn: the one who strikes first jumps first, the other one right after.
function timingOf(last) {
  const age = Date.now() - last.at;
  const heroFirst = last.first || last.taken === 0;
  const heroStart = heroFirst ? 0 : LUNGE_TIME;
  const foeStart = heroFirst ? LUNGE_TIME : 0;
  return { heroAge: age - heroStart, foeAge: age - foeStart };
}

// Is this fighter blinking right now? (the hit lands in the middle of the other one's jump)
function isHit(age, strikes) {
  return strikes && age > LUNGE_TIME * 0.4 && age < LUNGE_TIME * 1.2 && Math.floor(age / 60) % 2 === 0;
}

function drawSprite(ctx, sprite, x, y, camera) {
  ctx.drawImage(sprite.canvas, Math.round(x - sprite.ax - camera.x), Math.round(y - sprite.ay - camera.y));
}

// The red bar above the opponent (its health).
function drawHealthBar(ctx, x, y, value, max) {
  const width = 26;
  const left = Math.round(x - width / 2);
  ctx.fillStyle = '#1c1726';
  ctx.fillRect(left - 1, y - 1, width + 2, 5);
  ctx.fillStyle = '#5a1620';
  ctx.fillRect(left, y, width, 3);
  ctx.fillStyle = '#ff3b4f';
  ctx.fillRect(left, y, Math.round((width * Math.max(0, value)) / max), 3);
  ctx.fillStyle = '#ff8a95';
  ctx.fillRect(left, y, Math.round((width * Math.max(0, value)) / max), 1);
}

// A white slash on the opponent, when the sword hits it.
function drawSlash(ctx, x, y, age) {
  if (age < LUNGE_TIME * 0.3 || age > LUNGE_TIME) return;
  const size = 10;
  ctx.fillStyle = '#ffffff';
  for (let i = -size; i <= size; i++) ctx.fillRect(Math.round(x + i), Math.round(y - i * 0.9), 2, 1);
  ctx.fillStyle = '#fff6b0';
  for (let i = -size + 3; i <= size - 3; i++) ctx.fillRect(Math.round(x + i + 2), Math.round(y - i * 0.9 + 2), 1, 1);
}

// A ball of the color of the spell, flying from the hero to the opponent.
function drawSpell(ctx, from, to, age, color) {
  const progress = age / LUNGE_TIME;
  if (progress < 0 || progress > 1) return;
  const x = Math.round(from.x + (to.x - from.x) * progress);
  const y = Math.round(from.y + (to.y - from.y) * progress - Math.sin(progress * Math.PI) * 10);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x - 3, y - 3, 6, 6);
  ctx.fillStyle = color;
  ctx.fillRect(x - 2, y - 2, 4, 4);
}

// The opponent fades away when it dies.
function isGone(fight) {
  return fight.phase === 'won' && Date.now() - fight.last.at > LUNGE_TIME * 3;
}

function foeSprite(opponent, frame) {
  if (opponent.duel) return personSprite(opponent.look, 'left', 0);
  return monsterSprite(opponent, 'left', frame);
}

// Draws the two fighters and the effects of the last answer. camera: the top-left of the screen, in pixels.
export function drawBattle(ctx, game, camera, time) {
  const fight = game.run.fight;
  const places = battlePlaces(game);
  const hero = { x: places.hero.x * TILE_PX, y: places.hero.y * TILE_PX };
  const foe = { x: places.foe.x * TILE_PX, y: places.foe.y * TILE_PX };
  const last = fight.last;
  const timing = last ? timingOf(last) : { heroAge: -1, foeAge: -1 };
  const heroStrikes = last && last.damage > 0;
  const foeStrikes = last && last.taken > 0;
  const heroX = hero.x + (heroStrikes && last.mode === 'strike' ? lunge(timing.heroAge) : 0);
  const foeX = foe.x - (foeStrikes ? lunge(timing.foeAge) : 0);
  const frame = Math.floor(time * 3) % 2;

  const heroSprite = personSprite(HERO_LOOK, 'right', 0, true);
  if (!isHit(timing.foeAge, foeStrikes)) drawSprite(ctx, heroSprite, heroX, hero.y, camera);

  if (!isGone(fight)) {
    const sprite = foeSprite(fight.opponent, frame);
    const flashing = isHit(timing.heroAge, heroStrikes) && sprite.white;
    drawSprite(ctx, flashing ? { ...sprite, canvas: sprite.white } : sprite, foeX, foe.y, camera);
    if (!fight.opponent.duel) drawHealthBar(ctx, foe.x - camera.x, foe.y - sprite.ay - camera.y - 6, fight.opponent.health, fight.opponent.maxHealth);
  }
  if (heroStrikes && last.mode === 'strike') drawSlash(ctx, foe.x - camera.x, foe.y - 12 - camera.y, timing.heroAge);
  if (heroStrikes && last.mode !== 'strike') {
    drawSpell(ctx, { x: hero.x - camera.x + 8, y: hero.y - 14 - camera.y }, { x: foe.x - camera.x, y: foe.y - 12 - camera.y }, timing.heroAge, typeOf(last.mode).color);
  }
}
