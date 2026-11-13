import { NPCS, npcOf, HERO_LOOK } from '../data/npcs';
import { HOUSES, PROPS, SEALS, zoneAt } from '../data/zones';
import { typeOf } from '../data/types';
import { MAP_SIZE, TILE, tileAt, noise, CHESTS } from '../world/map';
import { isOutside } from '../logic/people';
import { activeQuestOf, offeredQuest, isQuestReady } from '../logic/quests';
import { cropAt, isCropReady, closestTreasure } from '../logic/farm';
import { isSealOpen } from '../logic/seals';
import { TILE_PX, groundTile, flowersDecal } from './tiles';
import { personSprite, walkFrame, obsidianSoldier, obsidianCat } from './people';
import { monsterSprite } from './monsters';
import { drawBattle } from './battle';
import { drawLights } from './lights';
import { makeGrid, fillEllipse, toCanvas, once } from './pixels';
import * as props from './props';

// Draws the world. Everything is painted at its real pixel size in a small hidden canvas (the "buffer"),
// then the buffer is drawn 2 to 4 times bigger on the screen, without smoothing: crisp pixel art.
// A "view" is the part of the world on screen: { x, y, width, height } in pixels of the art.

const T = TILE_PX;
const buffer = document.createElement('canvas');
const NAME_RANGE = 2.5; // tiles: the names of the people this close are written above them

// How many screen pixels for one pixel of the art. A phone (~400 px wide) gets 3.
export function pixelScale(width) {
  return Math.max(2, Math.min(4, Math.round(width / 150)));
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

// Draws a sprite ({ canvas, ax, ay }) with its feet at (x, y), in pixels of the world.
function put(ctx, sprite, x, y, view) {
  ctx.drawImage(sprite.canvas, Math.round(x - sprite.ax - view.x), Math.round(y - sprite.ay - view.y));
}

// ---------- The camera ----------

// The player stays in the middle. In a fight, the two fighters stand in the top third (the questions are below).
function viewOf(game, width, height) {
  const fight = game.run.fight;
  const centerX = (game.player.x + (fight ? 1.25 : 0)) * T;
  const centerY = (game.player.y - 0.6) * T;
  const worldSize = MAP_SIZE * T;
  let x = clamp(centerX - width / 2, 0, worldSize - width);
  let y = clamp(centerY - height * (fight ? 0.36 : 0.5), 0, worldSize - height);
  if (Date.now() < game.run.shakeUntil) {
    x += Math.round((Math.random() - 0.5) * 6);
    y += Math.round((Math.random() - 0.5) * 6);
  }
  return { x: Math.round(x), y: Math.round(y), width: width, height: height };
}

// The tiles on screen (+ a margin for the tall things whose feet are just outside).
function tilesOf(view, margin) {
  return {
    left: Math.floor(view.x / T) - margin,
    top: Math.floor(view.y / T) - 1,
    right: Math.ceil((view.x + view.width) / T) + margin,
    bottom: Math.ceil((view.y + view.height) / T) + margin + 2,
  };
}

// ---------- The ground ----------

function drawGround(ctx, game, view, time) {
  const area = tilesOf(view, 0);
  for (let y = area.top; y < area.bottom; y++) {
    for (let x = area.left; x < area.right; x++) {
      const px = x * T - view.x;
      const py = y * T - view.y;
      ctx.drawImage(groundTile(x, y, time), px, py);
      if (tileAt(x, y) === TILE.FLOWER) ctx.drawImage(flowersDecal(x, y), px, py);
      const crop = game && tileAt(x, y) === TILE.SOIL ? cropAt(game, x, y) : null;
      if (crop) put(ctx, props.crop(isCropReady(game, crop)), (x + 0.5) * T, (y + 1) * T - 3, view);
    }
  }
}

// ---------- The things standing on the map ----------

// The tree or the rock of a tile, following the land it grows in (null = nothing stands there).
function standingSprite(x, y) {
  const tile = tileAt(x, y);
  const biome = zoneAt(x, y).biome;
  if (tile === TILE.TREE && biome === 'forest') return props.oakTree(noise(x, y, 3) < 0.5 ? 0 : 1);
  if (tile === TILE.TREE && biome === 'mountain') return props.pineTree();
  if (tile === TILE.TREE && biome === 'desert') return props.cactus();
  if (tile === TILE.TREE) return props.roundTree();
  if (tile === TILE.DEAD_TREE) return props.deadTree();
  if (tile === TILE.ROCK && biome === 'mountain') return noise(x, y, 5) < 0.45 ? props.iceCrystal() : props.rock('snow');
  if (tile === TILE.ROCK) return props.rock(biome === 'coast' || biome === 'desert' ? null : 'moss');
  return null;
}

// Each drawing: { y (the line of its feet, in tiles: who is lower is drawn later, in front), draw }.
function treesAndRocks(view) {
  const area = tilesOf(view, 2);
  const drawings = [];
  for (let y = area.top; y < area.bottom; y++) {
    for (let x = area.left; x < area.right; x++) {
      const sprite = standingSprite(x, y);
      if (sprite) drawings.push({ y: y + 1, draw: (ctx) => put(ctx, sprite, (x + 0.5) * T, (y + 1) * T - 2, view) });
    }
  }
  return drawings;
}

function isNear(view, x, y, w, h) {
  return x * T < view.x + view.width + 32 && (x + w) * T > view.x - 32 && y * T < view.y + view.height + 64 && (y + h) * T > view.y - 32;
}

// The flames on the roofs of Lexia, during a raid.
function roofFires(house, time) {
  const spots = [
    [12, 10],
    [44, 14],
    [28, 2],
    [52, 34],
  ];
  return spots.map(([dx, dy], i) => (ctx, view) => {
    put(ctx, props.bigFlame(Math.floor(time * 9 + i) % 3), house.x * T + dx, house.y * T + dy, view);
  });
}

function isBurning(game, house) {
  return game !== null && game.raid.active && zoneAt(house.x, house.y).id === 'lexia';
}

function houses(view, game, time) {
  return HOUSES.filter((house) => isNear(view, house.x, house.y - 1, 4, 4)).map((house) => ({
    y: house.y + 3,
    draw: (ctx) => {
      put(ctx, props.houseSprite(house), house.x * T, (house.y + 3) * T, view);
      if (isBurning(game, house)) roofFires(house, time).forEach((fire) => fire(ctx, view));
    },
  }));
}

function propSprite(prop, time) {
  if (prop.kind === 'fountain') return props.fountain(Math.floor(time * 4) % 2);
  if (prop.kind === 'lamp') return props.lampPost();
  if (prop.kind === 'torch') return props.torch(Math.floor(time * 8) % 3);
  if (prop.kind === 'stall') return props.marketStall();
  if (prop.kind === 'barrels') return props.barrels();
  if (prop.kind === 'crates') return props.crates();
  if (prop.kind === 'signpost') return props.signpost();
  return props.fence();
}

function villageProps(view, time) {
  return PROPS.filter((prop) => isNear(view, prop.x, prop.y, prop.w, prop.h)).map((prop) => ({
    y: prop.y + prop.h,
    draw: (ctx) => {
      const sprite = propSprite(prop, time);
      if (prop.kind === 'fence') {
        for (let i = 0; i < prop.w; i++) put(ctx, sprite, (prop.x + i + 0.5) * T, (prop.y + 1) * T - 1, view);
      } else {
        put(ctx, sprite, (prop.x + prop.w / 2) * T, (prop.y + prop.h) * T - 1, view);
      }
    },
  }));
}

function chestsAndBarriers(view, game) {
  const chests = CHESTS.filter((chest) => isNear(view, chest.x, chest.y, 1, 1)).map((chest) => ({
    y: chest.y + 1,
    draw: (ctx) => put(ctx, props.chest(game !== null && game.chests[chest.key] === true), (chest.x + 0.5) * T, (chest.y + 1) * T - 2, view),
  }));
  const barriers = game
    ? game.run.barriers.map((barrier) => ({
        y: barrier.y + 1,
        draw: (ctx) => put(ctx, props.obsidianShard(), (barrier.x + 0.5) * T, (barrier.y + 1) * T - 2, view),
      }))
    : [];
  return [...chests, ...barriers];
}

// A closed seal: a wall of red runes that pulses.
function sealDrawings(view, game, time) {
  if (!game) return [];
  return SEALS.filter((seal) => !isSealOpen(game, seal) && isNear(view, seal.x, seal.y, seal.w, seal.h)).map((seal) => ({
    y: seal.y + seal.h,
    draw: (ctx) => {
      const x = seal.x * T - view.x;
      const y = seal.y * T - view.y;
      ctx.fillStyle = 'rgba(255, 50, 70, ' + (0.35 + Math.sin(time * 4) * 0.15) + ')';
      ctx.fillRect(x, y - 10, seal.w * T, T + 10);
      ctx.fillStyle = '#ffb0b8';
      for (let i = 0; i < seal.w * 4; i++) {
        const rx = x + 2 + i * 4;
        const ry = y - 6 + Math.round(Math.sin(time * 3 + i) * 2);
        ctx.fillRect(rx, ry, 2, 2); // the runes
        ctx.fillRect(rx, ry + 8, 1, 3);
      }
    },
  }));
}

// ---------- The living ----------

const shadow = () =>
  once('shadow', () => {
    const grid = makeGrid(12, 5);
    fillEllipse(grid, 6, 2.5, 6, 2.5, '#14101e55');
    return { canvas: toCanvas(grid), ax: 6, ay: 3 };
  });

// The mark above someone who has a quest: ! = a new one, ? = done, come and tell them.
function questMark(game, npc) {
  const active = activeQuestOf(game, npc.id);
  if (active) return isQuestReady(game, active) ? '?' : null;
  return offeredQuest(game, npc.id) ? '!' : null;
}

function personDrawing(look, place, view, extra) {
  return {
    y: place.y,
    draw: (ctx) => {
      put(ctx, shadow(), place.x * T, place.y * T, view);
      put(ctx, personSprite(look, place.dir || 'down', walkFrame(place.step, place.walking)), place.x * T, place.y * T, view);
      if (extra) extra(ctx);
    },
  };
}

function npcDrawings(game, view, time) {
  const fight = game.run.fight;
  const dueling = fight && fight.opponent.duel ? fight.opponent.npcId : null;
  const isVisible = (npc) => isNear(view, game.run.people[npc.id].x - 1, game.run.people[npc.id].y - 2, 2, 2);
  return NPCS.filter((npc) => isOutside(game, npc) && npc.id !== dueling && isVisible(npc)).map((npc) => {
    const place = game.run.people[npc.id];
    const mark = questMark(game, npc);
    const bob = Math.round(Math.sin(time * 4) * 1.5);
    return personDrawing(npc.look, place, view, (ctx) => {
      if (mark) put(ctx, props.bubble(mark), place.x * T, place.y * T - 30 + bob, view);
    });
  });
}

function followerDrawings(game, view, time) {
  return game.run.followers.map((follower) => {
    if (follower.kind === 'person') return personDrawing(npcOf(follower.id).look, follower, view);
    const sprite = follower.kind === 'soldier' ? obsidianSoldier(Math.floor(time * 4)) : obsidianCat();
    return { y: follower.y, draw: (ctx) => put(ctx, sprite, follower.x * T, follower.y * T, view) };
  });
}

// A monster looks at the player when it is close, else where it walks.
function facingOf(monster, player) {
  const isClose = Math.hypot(player.x - monster.x, player.y - monster.y) < 6;
  const dx = isClose ? player.x - monster.x : monster.target ? monster.target.x - monster.x : monster.walkX;
  return dx < 0 ? 'left' : 'right';
}

function smallHealthBar(ctx, monster, x, y) {
  if (monster.health >= monster.maxHealth) return;
  ctx.fillStyle = '#1c1726';
  ctx.fillRect(x - 8, y, 16, 3);
  ctx.fillStyle = '#ff3b4f';
  ctx.fillRect(x - 7, y + 1, Math.max(1, Math.round((14 * monster.health) / monster.maxHealth)), 1);
}

function monsterDrawings(game, view, time) {
  const opponent = game.run.fight ? game.run.fight.opponent : null;
  return game.run.monsters
    .filter((monster) => monster !== opponent && isNear(view, monster.x - 1, monster.y - 2, 2, 2))
    .map((monster) => ({
      y: monster.y,
      draw: (ctx) => {
        const sprite = monsterSprite(monster, facingOf(monster, game.player), Math.floor(time * 3 + monster.step) % 2);
        const x = monster.x * T;
        const y = monster.y * T;
        put(ctx, shadow(), x, y, view);
        put(ctx, sprite, x, y, view);
        const top = y - sprite.ay - view.y;
        put(ctx, props.typeDiamond(typeOf(monster.category).color), x, y - sprite.ay - 3 + Math.round(Math.sin(time * 5)), view);
        smallHealthBar(ctx, monster, Math.round(x - view.x), top - 10);
      },
    }));
}

function heroDrawing(game, view) {
  const player = game.player;
  return personDrawing(HERO_LOOK, { x: player.x, y: player.y, dir: player.dir, step: player.step, walking: game.run.walking }, view);
}

// ---------- Effects ----------

function drawBalls(ctx, game, view) {
  for (const ball of game.run.balls) {
    const x = Math.round(ball.x * T - view.x);
    const y = Math.round(ball.y * T - view.y - 10);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x - 3, y - 3, 6, 6);
    ctx.fillStyle = ball.color;
    ctx.fillRect(x - 2, y - 2, 4, 4);
  }
}

function drawStorm(ctx, game, view, time) {
  const storm = game.run.storm;
  if (!storm) return;
  ctx.strokeStyle = 'rgba(159, 216, 255, ' + (0.5 + Math.sin(time * 10) * 0.3) + ')';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(Math.round(storm.x * T - view.x), Math.round(storm.y * T - view.y), storm.radius * T, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = 'rgba(120, 180, 255, 0.12)';
  ctx.fill();
}

// A treasure shines when the player is very close, or from far with the obsidian cat.
function drawTreasureHint(ctx, game, view, time) {
  const treasure = closestTreasure(game, game.player.pet ? 9 : 2.5);
  if (!treasure || Math.sin(time * 6) < 0) return;
  const x = Math.round((treasure.x + 0.5) * T - view.x);
  const y = Math.round((treasure.y + 0.5) * T - view.y);
  ctx.fillStyle = '#fff6b0';
  ctx.fillRect(x - 3, y, 7, 1);
  ctx.fillRect(x, y - 3, 1, 7);
}

function drawParticleSquares(ctx, particles, view) {
  for (const particle of particles.filter((item) => !item.text)) {
    ctx.globalAlpha = Math.max(0, 1 - particle.age / particle.life);
    ctx.fillStyle = particle.color;
    ctx.fillRect(Math.round(particle.x * T - view.x), Math.round(particle.y * T - view.y), particle.size, particle.size);
  }
  ctx.globalAlpha = 1;
}

// Sparks rising from the burning houses during a raid. They only depend on the time: nothing to remember.
function drawEmbers(ctx, game, view, time) {
  if (!game.raid.active) return;
  for (const house of HOUSES.filter((item) => isBurning(game, item) && isNear(view, item.x, item.y, 4, 3))) {
    for (let i = 0; i < 6; i++) {
      const life = (time * 0.6 + i / 6) % 1;
      const x = house.x * T + 8 + ((i * 37) % 48) + Math.sin(time * 3 + i) * 4;
      const y = house.y * T + 4 - life * 40;
      ctx.fillStyle = life < 0.5 ? '#ffd23f' : '#ff6a2b';
      ctx.fillRect(Math.round(x - view.x), Math.round(y - view.y), 1, 1);
    }
  }
}

// Dark smoke rising from the burning houses.
function drawSmoke(ctx, game, view, time) {
  if (!game.raid.active) return;
  for (const house of HOUSES.filter((item) => isBurning(game, item) && isNear(view, item.x, item.y, 4, 3))) {
    for (let i = 0; i < 5; i++) {
      const life = (time * 0.25 + i / 5) % 1;
      const size = 3 + Math.round(life * 6);
      const x = house.x * T + 12 + i * 10 + Math.sin(time + i) * 6 - view.x;
      const y = house.y * T - life * 70 - view.y;
      ctx.fillStyle = 'rgba(40, 32, 44, ' + 0.55 * (1 - life) + ')';
      ctx.fillRect(Math.round(x - size / 2), Math.round(y - size / 2), size, size);
    }
  }
}

// ---------- Lights ----------

function lightsOf(game, view) {
  const lights = [{ x: game.player.x * T - view.x, y: game.player.y * T - 10 - view.y, radius: 60 }];
  for (const prop of PROPS.filter((item) => (item.kind === 'lamp' || item.kind === 'torch') && isNear(view, item.x, item.y, 1, 1))) {
    lights.push({ x: (prop.x + 0.5) * T - view.x, y: (prop.y + 1) * T - 20 - view.y, radius: 44, warm: true });
  }
  for (const house of HOUSES.filter((item) => isBurning(game, item) && isNear(view, item.x, item.y, 4, 3))) {
    lights.push({ x: (house.x + 2) * T - view.x, y: house.y * T - view.y, radius: 70, warm: true });
  }
  return lights;
}

// ---------- The texts, written on the big screen (sharper than in the buffer) ----------

function writeText(ctx, text, x, y, size, color) {
  ctx.font = size + 'px "Pixelify Sans", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = Math.max(3, size / 4);
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#1c1726';
  ctx.strokeText(text, x, y);
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

function writeNames(ctx, game, view, scale) {
  if (game.run.fight) return;
  for (const npc of NPCS.filter((item) => isOutside(game, item))) {
    const place = game.run.people[npc.id];
    if (Math.hypot(place.x - game.player.x, place.y - game.player.y) > NAME_RANGE) continue;
    writeText(ctx, npc.name, (place.x * T - view.x) * scale, (place.y * T - 30 - view.y) * scale, 13, '#ffe9a8');
  }
}

function writeFloatingTexts(ctx, game, view, scale) {
  for (const particle of game.run.particles.filter((item) => item.text)) {
    ctx.globalAlpha = Math.max(0, 1 - particle.age / particle.life);
    writeText(ctx, particle.text, (particle.x * T - view.x) * scale, (particle.y * T - view.y) * scale, particle.size + 4, particle.color);
  }
  ctx.globalAlpha = 1;
}

// During a raid, the edges of the screen pulse in red. A thunder makes everything white for a moment.
function drawAlerts(ctx, game, width, height, time) {
  if (game.raid.active) {
    ctx.strokeStyle = 'rgba(255, 40, 40, ' + (0.35 + Math.sin(time * 4) * 0.2) + ')';
    ctx.lineWidth = 12;
    ctx.strokeRect(0, 0, width, height);
  }
  if (Date.now() < game.run.flashUntil) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillRect(0, 0, width, height);
  }
}

// ---------- Everything ----------

// The buffer, at the size of the screen divided by the scale.
function prepareBuffer(width, height, scale) {
  const w = Math.ceil(width / scale);
  const h = Math.ceil(height / scale);
  if (buffer.width !== w || buffer.height !== h) {
    buffer.width = w;
    buffer.height = h;
  }
  const ctx = buffer.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  return ctx;
}

function drawSorted(ctx, drawings) {
  drawings.sort((a, b) => a.y - b.y).forEach((drawing) => drawing.draw(ctx));
}

function showBuffer(ctx, width, height, scale) {
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(buffer, 0, 0, buffer.width * scale, buffer.height * scale);
}

// The world around the player. width, height: the size of the screen canvas. time: seconds.
export function drawScene(ctx, game, width, height, time) {
  const scale = pixelScale(width);
  const art = prepareBuffer(width, height, scale);
  const view = viewOf(game, buffer.width, buffer.height);
  const fight = game.run.fight;

  drawGround(art, game, view, time);
  drawStorm(art, game, view, time);
  drawTreasureHint(art, game, view, time);
  const living = [...npcDrawings(game, view, time), ...followerDrawings(game, view, time), ...monsterDrawings(game, view, time)];
  if (!fight) living.push(heroDrawing(game, view));
  drawSorted(art, [...treesAndRocks(view), ...houses(view, game, time), ...villageProps(view, time), ...chestsAndBarriers(view, game), ...sealDrawings(view, game, time), ...living]);
  if (fight) drawBattle(art, game, view, time);
  drawBalls(art, game, view);
  drawParticleSquares(art, game.run.particles, view);
  drawEmbers(art, game, view, time);
  drawSmoke(art, game, view, time);
  drawLights(art, game, buffer.width, buffer.height, lightsOf(game, view));

  showBuffer(ctx, width, height, scale);
  writeNames(ctx, game, view, scale);
  writeFloatingTexts(ctx, game, view, scale);
  drawAlerts(ctx, game, width, height, time);
}

// A place of the world, without its people: the background of the start screen (Lexia, slowly passing by),
// or the small picture of a place on the world map. center: { x, y } in tiles (null = Lexia, moving).
// scale: screen pixels per pixel of the art (null = the usual one).
export function drawLandscape(ctx, width, height, time, center = null, scale = null) {
  scale = scale || pixelScale(width);
  const art = prepareBuffer(width, height, scale);
  const centerX = center ? center.x * T : (64 + Math.sin(time * 0.04) * 8) * T;
  const centerY = center ? center.y * T : 70 * T;
  const view = { x: Math.round(centerX - buffer.width / 2), y: Math.round(centerY - buffer.height / 2), width: buffer.width, height: buffer.height };
  drawGround(art, null, view, time);
  drawSorted(art, [...treesAndRocks(view), ...houses(view, null, time), ...villageProps(view, time), ...chestsAndBarriers(view, null)]);
  showBuffer(ctx, width, height, scale);
}
