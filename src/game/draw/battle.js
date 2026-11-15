import { typeOf } from '../data/types';
import { npcOf } from '../data/npcs';
import { personSprite, swordSprite, obsidianSoldier, obsidianCat } from './people';
import { monsterSprite } from './monsters';
import { spriteOf, once } from './pixels';
import { OUTLINE } from './palette';
import { TILE_PX } from './tiles';

// A fight happens right on the map: the hero on the left, the opponent on the right, face to face.
// Everything moves with the time since the last answer (fight.last.at): the hero winds up, dashes and slashes
// (a crescent of light), or glows and throws a spell; the opponent jumps to bite; the one who is hit is pushed
// back and blinks; the winner celebrates, the loser falls.

const BATTLE_GAP = 2.5; // tiles between the hero and a small opponent (a big one stands farther)
const FOE_JUMP = 300; // milliseconds: the opponent jumps forward and back
const FOE_LANDS = FOE_JUMP / 2; // its bite lands in the middle of the jump
const WIND_UP = 90; // the hero pulls the sword back...
const DASH = 110; // ...runs to the opponent...
const SLASH = 170; // ...cuts...
const BACK = 180; // ...and comes back
const STRIKE_TIME = WIND_UP + DASH + SLASH + BACK;
const CAST_TIME = 380; // a spell: the hero glows...
const SPELL_START = 150; // ...and the ball flies
const SPELL_FLIGHT = 260;
const HURT_TIME = 320; // pushed back after a hit
const FLASH_TIME = 240; // blinking after a hit
const DRINK_TIME = 800;
const FADE_TIME = 500; // a beaten opponent disappears

function foeSprite(opponent, frame) {
  if (opponent.duel) return personSprite(opponent.look, 'left', frame ? 'breath' : 'stand');
  return monsterSprite(opponent, 'left', frame);
}

// Tiles between the two fighters: enough room for the opponent, however big it is.
export function battleGap(game) {
  const width = foeSprite(game.run.fight.opponent, 0).canvas.width;
  return Math.max(BATTLE_GAP, (width / 2 + 20) / TILE_PX);
}

// Where the two fighters stand, in tiles.
export function battlePlaces(game) {
  const player = game.player;
  return { hero: { x: player.x, y: player.y }, foe: { x: player.x + battleGap(game), y: player.y } };
}

// ---------- The time line of a turn ----------

// How long the hero's move lasts, and when it hits (ms after its start).
function heroMoveTime(mode) {
  return mode === 'strike' ? STRIKE_TIME : SPELL_START + SPELL_FLIGHT;
}

function heroLands(mode) {
  return mode === 'strike' ? WIND_UP + DASH + 30 : SPELL_START + SPELL_FLIGHT;
}

// When each one starts to move (ms after the answer): the one who strikes first goes first.
function startsOf(last) {
  const heroFirst = last.first || last.taken === 0;
  return heroFirst ? { hero: 0, foe: heroMoveTime(last.mode) } : { hero: FOE_JUMP, foe: 0 };
}

// The moments (ms after the answer) when the blows land: for the sparks and the sounds (see FightScreen).
export function hitMoments(last) {
  const starts = startsOf(last);
  return { foe: starts.hero + heroLands(last.mode || 'strike'), hero: starts.foe + FOE_LANDS };
}

// How long ago each one started to move, and how long ago each blow landed (ms; negative = not yet).
function agesOf(last) {
  if (!last) return { hero: -1, foe: -1, heroHit: -1, foeHit: -1, all: Infinity };
  const age = Date.now() - last.at;
  const starts = startsOf(last);
  const hero = age - starts.hero;
  const foe = age - starts.foe;
  return { hero: hero, foe: foe, foeHit: hero - heroLands(last.mode || 'strike'), heroHit: foe - FOE_LANDS, all: age };
}

// ---------- How the fighters move ----------

// How far the hero is from their place (pixels): back a bit to wind up, forward to slash, then back.
function dashOf(last, age, reach) {
  if (!last || last.damage <= 0 || last.mode !== 'strike' || age < 0 || age > STRIKE_TIME) return 0;
  if (age < WIND_UP) return -2;
  if (age < WIND_UP + DASH) return Math.round((reach * (age - WIND_UP)) / DASH);
  if (age < WIND_UP + DASH + SLASH) return reach;
  return Math.round(reach * (1 - (age - WIND_UP - DASH - SLASH) / BACK));
}

// Pushed back when hit: `distance` pixels at once, then back to the place.
function pushBack(age, distance) {
  if (age < 0 || age > HURT_TIME) return 0;
  return Math.round(distance * (1 - age / HURT_TIME));
}

// The opponent jumps forward (and up) to strike, and is pushed back when it is hit.
function foeShift(last, ages, reach) {
  let x = 0;
  let y = 0;
  if (last && last.taken > 0 && ages.foe >= 0 && ages.foe <= FOE_JUMP) {
    const jump = Math.sin((ages.foe / FOE_JUMP) * Math.PI);
    x -= Math.round(jump * reach);
    y -= Math.round(jump * 6);
  }
  if (last && last.damage > 0) x += pushBack(ages.foeHit, last.critical ? 9 : 5);
  return { x: x, y: y };
}

// How the hero strikes: a jump on a critical hit, a power attack in a combo, else a simple slash.
function strikeStyle(fight) {
  if (fight.last.critical) return 'Jump';
  return fight.combo >= 3 ? 'Combo' : '';
}

// The picture of the hero while they strike: wind up, dash, slash.
function strikePose(fight, age) {
  const style = strikeStyle(fight);
  if (age < WIND_UP) return 'windup' + style;
  if (age < WIND_UP + DASH) return 'dash' + style;
  return 'slash' + style;
}

// The picture of the hero right now.
function heroPose(fight, ages, time) {
  const last = fight.last;
  const strikes = last && last.damage > 0;
  const isHit = last && last.taken > 0 && ages.heroHit >= 0 && ages.heroHit < HURT_TIME;
  const drinking = fight.drankAt ? Date.now() - fight.drankAt : Infinity;
  if (fight.phase === 'lost' && !fight.opponent.duel && last && ages.heroHit >= 0) return ages.heroHit < 250 ? 'fall' : 'ko';
  if (fight.phase === 'won' && ages.hero > heroMoveTime(last.mode)) return 'victory';
  if (fight.phase === 'fled') return 'roll';
  if (drinking < DRINK_TIME) return drinking < DRINK_TIME / 2 ? 'drink' : 'cheer';
  if (isHit) return last.isCorrect ? 'guard' : 'hurt'; // a good but slow answer: the hero blocks half of the blow
  if (strikes && last.mode === 'strike' && ages.hero >= 0 && ages.hero < STRIKE_TIME - BACK / 2) return strikePose(fight, ages.hero);
  if (strikes && last.mode !== 'strike' && ages.hero >= 0 && ages.hero < CAST_TIME) return 'cast';
  return Math.floor(time * 2.5) % 2 ? 'ready1' : 'ready0';
}

// Is this fighter blinking right now? (just after a hit)
function isBlinking(hitAge) {
  return hitAge >= 0 && hitAge < FLASH_TIME && Math.floor(hitAge / 60) % 2 === 0;
}

// A beaten opponent fades away: 1 = fully there, 0 = gone.
function foeOpacity(fight, ages) {
  if (fight.phase !== 'won') return 1;
  return Math.max(0, Math.min(1, 1 - (ages.foeHit - FLASH_TIME) / FADE_TIME));
}

// ---------- Small pictures of the effects ----------

const STAR = ['..Y..', '..Y..', 'YYWYY', '..Y..', '..Y..'];
const PLUS = ['..G..', '..G..', 'GGWGG', '..G..', '..G..'];
const IMPACT = ['Y..Y..Y', '.Y.Y.Y.', '..WWW..', 'YYWWWYY', '..WWW..', '.Y.Y.Y.', 'Y..Y..Y'];
const GHOST = ['..WWW..', '.WWWWW.', 'WWDWDWW', 'WWWWWWW', 'WWWWWWW', 'WWWWWWW', 'W.W.W.W'];

function picture(name, rows, colors) {
  return once('effect' + name, () => spriteOf(rows, colors, OUTLINE));
}

function drawCentered(ctx, canvas, x, y) {
  ctx.drawImage(canvas, Math.round(x - canvas.width / 2), Math.round(y - canvas.height / 2));
}

// ---------- The effects ----------

const BLUE_ARC = ['#1f4fd8', '#3a8cff', '#8fd0ff', '#ffffff'];
const GOLD_ARC = ['#c46a00', '#ff9d1a', '#ffd84a', '#ffffff'];

// A crescent of light: the trace of the sword. The arc goes from the angle `from` to `to` (radians, 0 = forward),
// thick in its middle and thin at its ends; its outer edge is the brightest. colors: from dark to bright.
function drawCrescent(ctx, cx, cy, radius, thickness, from, to, colors) {
  for (let y = -radius; y <= radius; y++) {
    for (let x = -radius; x <= radius; x++) {
      const distance = Math.hypot(x, y);
      const along = (Math.atan2(y, x) - from) / (to - from); // 0 at the start of the arc, 1 at its end
      if (along < 0 || along > 1 || distance > radius) continue;
      const thick = thickness * Math.sin(along * Math.PI);
      const depth = (radius - distance) / thick; // 0 on the outer edge
      if (depth > 1) continue;
      ctx.fillStyle = colors[Math.min(colors.length - 1, Math.floor((1 - depth) * colors.length))];
      ctx.fillRect(Math.round(cx + x), Math.round(cy + y), 1, 1);
    }
  }
}

// The slash of the sword: the crescent grows from the top to the bottom, then its tail catches up.
function drawSlash(ctx, shoulder, age, last) {
  const start = WIND_UP + DASH - 20;
  const progress = (age - start) / (SLASH + 20);
  if (progress < 0 || progress > 1) return;
  const top = (-100 * Math.PI) / 180;
  const sweep = (170 * Math.PI) / 180;
  const head = top + sweep * Math.min(1, progress * 1.7);
  const tail = top + sweep * Math.max(0, (progress - 0.45) / 0.55);
  if (head - tail < 0.05) return;
  const big = last.critical ? 1.3 : 1;
  drawCrescent(ctx, shoulder.x, shoulder.y, Math.round(20 * big), 6 * big, tail, head, last.critical ? GOLD_ARC : BLUE_ARC);
}

// A spell: the hero glows with the color of the spell, then a ball of light flies to the opponent.
function drawCast(ctx, hero, target, age, color) {
  if (age >= 0 && age < CAST_TIME) {
    ctx.globalAlpha = 0.35 + 0.25 * Math.sin(age / 40);
    ctx.fillStyle = color;
    for (let y = -20; y <= 2; y++) {
      for (let x = -12; x <= 12; x++) {
        const ring = (x * x) / 144 + ((y + 9) * (y + 9)) / 144;
        if (ring > 0.75 && ring <= 1 && (x + y) % 2 === 0) ctx.fillRect(Math.round(hero.x + x), Math.round(hero.y + y), 1, 1);
      }
    }
    ctx.globalAlpha = 1;
    for (let i = 0; i < 6; i++) {
      const rise = (age / 6 + i * 17) % 24; // sparks going up
      ctx.fillStyle = i % 2 ? '#ffffff' : color;
      ctx.fillRect(Math.round(hero.x - 10 + i * 4), Math.round(hero.y - rise), 1, 2);
    }
  }
  const progress = (age - SPELL_START) / SPELL_FLIGHT;
  if (progress < 0 || progress > 1) return;
  const from = { x: hero.x + 10, y: hero.y - 16 };
  const at = (t) => ({ x: from.x + (target.x - from.x) * t, y: from.y + (target.y - from.y) * t - Math.sin(t * Math.PI) * 10 });
  [0.12, 0.07].forEach((back, i) => {
    const trail = at(Math.max(0, progress - back));
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(trail.x) - 1 + i, Math.round(trail.y) - 1 + i, 3 - i, 3 - i);
  });
  const ball = at(progress);
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(ball.x) - 3, Math.round(ball.y) - 2, 6, 4);
  ctx.fillRect(Math.round(ball.x) - 2, Math.round(ball.y) - 3, 4, 6);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(Math.round(ball.x) - 1, Math.round(ball.y) - 1, 2, 2);
}

// A star of light where a blow lands.
function drawImpact(ctx, x, y, hitAge) {
  if (hitAge < 0 || hitAge > 140) return;
  drawCentered(ctx, picture('impact', IMPACT, { Y: '#fff2a0', W: '#ffffff' }), x, y);
}

// Red marks next to the hero when they are hit.
function drawHurtMarks(ctx, x, y, hitAge) {
  if (hitAge < 0 || hitAge > 220) return;
  ctx.fillStyle = '#ff3b4f';
  [-6, 0, 6].forEach((dy, i) => {
    for (let k = 0; k < 4; k++) ctx.fillRect(Math.round(x + 10 + k + i), Math.round(y + dy - k), 1, 1);
  });
}

// Green crosses going up around the hero who drinks a potion.
function drawHealing(ctx, x, y, age) {
  if (age < 0 || age > DRINK_TIME) return;
  const plus = picture('plus', PLUS, { G: '#3fd46a', W: '#d8ffe0' });
  [-11, 9, -4].forEach((dx, i) => drawCentered(ctx, plus, x + dx, y - 10 - ((age / 30 + i * 9) % 22)));
}

// Golden stars that twinkle around the winner.
function drawVictory(ctx, x, y, time) {
  const star = picture('star', STAR, { Y: '#ffd84a', W: '#ffffff' });
  [
    [-13, -30],
    [12, -36],
    [16, -14],
    [-16, -12],
  ].forEach(([dx, dy], i) => {
    if (Math.floor(time * 4 + i) % 3 !== 0) drawCentered(ctx, star, x + dx, y + dy);
  });
}

// A little ghost goes up from the knocked out hero.
function drawGhost(ctx, x, y, hitAge) {
  const rise = Math.min(14, hitAge / 90);
  ctx.globalAlpha = 0.85;
  drawCentered(ctx, picture('ghost', GHOST, { W: '#f4f6ff', D: '#1c1726' }), x + Math.sin(hitAge / 200) * 3, y - 22 - rise);
  ctx.globalAlpha = 1;
}

// The red bar above the opponent (its health). width: in pixels of the art.
function drawHealthBar(ctx, x, y, width, value, max) {
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

function drawSprite(ctx, sprite, x, y) {
  ctx.drawImage(sprite.canvas, Math.round(x - sprite.ax), Math.round(y - sprite.ay));
}

// ---------- The friends of the hero ----------

// Where the friends stand, from the hero (pixels): behind them, some higher (farther), some lower (closer).
const ALLY_SPOTS = [
  [-27, -11],
  [-31, 10],
  [-48, -5],
  [-50, 13],
  [-14, 15],
];

// The friends who fight with the hero: the recruited people, the obsidian soldiers, the obsidian cat.
// inFront: true = only the ones lower than the hero (drawn after the hero), false = the others.
function drawAllies(ctx, game, hero, time, inFront) {
  const player = game.player;
  const friends = [
    ...player.party.map((id, i) => personSprite(npcOf(id).look, 'right', Math.floor(time * 1.4 + i) % 2 ? 'breath' : 'stand')),
    ...Array.from({ length: player.soldiers }, (_, i) => obsidianSoldier(Math.floor(time * 3) + i)),
    ...(player.pet ? [obsidianCat()] : []),
  ];
  friends.slice(0, ALLY_SPOTS.length).forEach((sprite, i) => {
    const [dx, dy] = ALLY_SPOTS[i];
    if (dy > 0 === inFront) drawSprite(ctx, sprite, hero.x + dx, hero.y + dy);
  });
}

// ---------- Everything ----------

// Where everything is right now, in pixels of the screen buffer. camera: the top-left of the screen.
function stageOf(game, camera, time) {
  const fight = game.run.fight;
  const last = fight.last;
  const ages = agesOf(last);
  const places = battlePlaces(game);
  const frame = Math.floor(time * 3) % 2;
  const foeLook = foeSprite(fight.opponent, frame);
  const home = { x: places.hero.x * TILE_PX - camera.x, y: places.hero.y * TILE_PX - camera.y };
  const foeHome = { x: places.foe.x * TILE_PX - camera.x, y: places.foe.y * TILE_PX - camera.y };
  const reach = Math.max(12, foeHome.x - home.x - foeLook.ax - 14);
  const shift = foeShift(last, ages, reach);
  const hero = { x: home.x + dashOf(last, ages.hero, reach) - (last && last.taken > 0 ? pushBack(ages.heroHit, 5) : 0), y: home.y };
  const foe = { x: foeHome.x + shift.x, y: foeHome.y + shift.y };
  return { fight, last, ages, frame, home, hero, foe, foeHome, foeLook, pose: heroPose(fight, ages, time) };
}

// Draws the two fighters and the effects of the last answer. camera: the top-left of the screen, in pixels.
export function drawBattle(ctx, game, camera, time) {
  const stage = stageOf(game, camera, time);
  const { fight, last, ages, home, hero, foe, foeHome, foeLook, pose } = stage;

  drawAllies(ctx, game, home, time, false);
  const heroSprite = personSprite(game.player.look, 'right', pose);
  drawSprite(ctx, heroSprite, hero.x, hero.y);
  if (heroSprite.sword !== undefined && heroSprite.hand) {
    const sword = swordSprite(heroSprite.sword, game.player.weapon);
    drawSprite(ctx, sword, hero.x - heroSprite.ax + heroSprite.hand[0], hero.y - heroSprite.ay + heroSprite.hand[1]);
  }

  drawAllies(ctx, game, home, time, true);

  const opacity = foeOpacity(fight, ages);
  const middle = { x: foeHome.x, y: foeHome.y - Math.round(foeLook.ay / 2) }; // where the blows land
  if (opacity > 0) {
    const flashing = last && last.damage > 0 && isBlinking(ages.foeHit) && foeLook.white;
    ctx.globalAlpha = opacity;
    drawSprite(ctx, flashing ? { ...foeLook, canvas: foeLook.white } : foeLook, foe.x, foe.y + Math.round((1 - opacity) * 4));
    ctx.globalAlpha = 1;
    const barWidth = Math.max(26, Math.round(foeLook.canvas.width * 0.6));
    if (!fight.opponent.duel) drawHealthBar(ctx, foeHome.x, foeHome.y - foeLook.ay - 6, barWidth, fight.opponent.health, fight.opponent.maxHealth);
  }

  if (last && last.damage > 0 && last.mode === 'strike') drawSlash(ctx, { x: hero.x + 3, y: hero.y - 13 }, ages.hero, last);
  if (last && last.damage > 0 && last.mode !== 'strike') drawCast(ctx, hero, middle, ages.hero, typeOf(last.mode).color);
  if (last && last.damage > 0) drawImpact(ctx, middle.x - 4, middle.y, ages.foeHit);
  if (last && last.taken > 0) drawHurtMarks(ctx, hero.x, hero.y - 18, ages.heroHit);
  if (fight.drankAt) drawHealing(ctx, hero.x, hero.y, Date.now() - fight.drankAt);
  if (pose === 'victory') drawVictory(ctx, hero.x, hero.y, time);
  if (pose === 'ko') drawGhost(ctx, hero.x, hero.y, ages.heroHit - 250);
}

// ---------- What the hero shouts ----------

// The words in the bubble over the hero, or null.
function shoutOf(fight, ages) {
  const last = fight.last;
  if (!last) return fight.asked === 0 && Date.now() - fight.startedAt < 1300 ? 'To battle!' : null;
  if (fight.phase === 'won' && ages.all > 750 && ages.all < 2600) return "It's over!";
  if (last.damage <= 0 || ages.hero < 0 || ages.hero > 800) return null;
  if (last.critical) return 'Take that!';
  if (last.mode !== 'strike') return typeOf(last.mode).spell + '!';
  if (fight.combo >= 3) return 'One more!';
  return 'Haaa!';
}

// A comic bubble over the hero's head, written at the size of the screen (crisp text). scale: screen pixels per art pixel.
export function writeBattleWords(ctx, game, camera, scale, time) {
  const stage = stageOf(game, camera, time);
  const words = shoutOf(stage.fight, stage.ages);
  if (!words || stage.pose === 'ko' || stage.pose === 'fall') return;
  const size = Math.max(13, Math.round(scale * 4.2));
  ctx.font = 'bold ' + size + 'px "Pixelify Sans", monospace';
  const width = ctx.measureText(words).width + size * 1.2;
  const height = size * 1.7;
  const x = Math.round(stage.hero.x * scale - width / 2);
  const y = Math.round((stage.hero.y - 44) * scale - height);
  ctx.fillStyle = '#fffaf0';
  ctx.strokeStyle = '#1c1726';
  ctx.lineWidth = Math.max(2, Math.round(scale * 0.7));
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, size * 0.5);
  ctx.moveTo(x + width * 0.42, y + height);
  ctx.lineTo(x + width * 0.5, y + height + size * 0.7); // the tail points to the hero
  ctx.lineTo(x + width * 0.58, y + height);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#fffaf0';
  ctx.fillRect(x + width * 0.42 + 1, y + height - ctx.lineWidth, width * 0.16 - 2, ctx.lineWidth * 2); // hides the line under the tail
  ctx.fillStyle = '#1c1726';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(words, x + width / 2, y + height / 2 + 1);
}
