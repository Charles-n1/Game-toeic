import { zoneAt } from '../data/zones';
import { biomeAt } from '../world/map';
import { darkness } from '../logic/clock';
import { TILE_PX } from './tiles';

// The effects of the sky and of the places, painted over the world (in the buffer, see scene.js):
// the rain, the lightning of the storms, the snow of the mountains, the leaves of the forests,
// the embers of the demon island. They only depend on the time: nothing to remember.

const T = TILE_PX;

// How dark it is where the hero stands (0 = day, 1 = black). The dungeons are always dark (a torch!),
// the home is lit by its windows, the clouds and the storms darken the day.
export function darknessHere(game) {
  const zone = zoneAt(game.player.x, game.player.y);
  if (zone.kind === 'inside') return zone.id === 'home' ? darkness(game) * 0.5 : 0.95;
  const clouds = { clear: 0, cloudy: 0.12, rain: 0.25, storm: 0.45 }[game.weather.kind] || 0;
  return Math.min(1, darkness(game) + clouds);
}

// A number from 0 to 1 that is always the same for the same i (the drops, the leaves...).
function fixed(i, salt) {
  const n = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

function drawRain(ctx, width, height, time, count) {
  ctx.fillStyle = 'rgba(170, 200, 255, 0.55)';
  for (let i = 0; i < count; i++) {
    const speed = 260 + fixed(i, 1) * 140;
    const x = Math.round((fixed(i, 2) * (width + 60) + time * 60) % (width + 60)) - 30;
    const y = Math.round((fixed(i, 3) * height + time * speed) % (height + 20)) - 10;
    ctx.fillRect(x, y, 1, 5);
    ctx.fillRect(x - 1, y + 5, 1, 2);
  }
  ctx.fillStyle = 'rgba(200, 220, 255, 0.5)';
  for (let i = 0; i < count / 4; i++) {
    const life = (time * 3 + fixed(i, 4)) % 1;
    if (life > 0.3) continue;
    ctx.fillRect(Math.round(fixed(i, 5) * width), Math.round(fixed(i, 6) * height), 2, 1); // a splash
  }
}

// A lightning bolt: a broken line from the top of the screen to where it falls, white then gone.
function drawBolts(ctx, game, view) {
  for (const bolt of game.run.bolts) {
    const age = (Date.now() - bolt.at) / 600;
    const x = Math.round(bolt.x * T - view.x);
    const y = Math.round(bolt.y * T - view.y);
    ctx.strokeStyle = 'rgba(255, 252, 220, ' + (1 - age) + ')';
    ctx.lineWidth = 2;
    ctx.beginPath();
    let px = x + 20;
    ctx.moveTo(px, -10);
    for (let py = -10; py < y; py += 12) {
      px += Math.round((fixed(py, bolt.at % 97) - 0.5) * 16);
      ctx.lineTo(px, py);
    }
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255, 240, 160, ' + 0.6 * (1 - age) + ')';
    ctx.fillRect(x - 6, y - 2, 12, 4);
  }
  ctx.lineWidth = 1;
}

function drawSnow(ctx, width, height, time) {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  for (let i = 0; i < 70; i++) {
    const x = Math.round((fixed(i, 7) * width + Math.sin(time + i) * 8 + time * 10) % width);
    const y = Math.round((fixed(i, 8) * height + time * (18 + fixed(i, 9) * 20)) % height);
    ctx.fillRect(x, y, i % 3 === 0 ? 2 : 1, i % 3 === 0 ? 2 : 1);
  }
}

const LEAF_COLORS = ['#7cc45a', '#c9a227', '#e0782a', '#4f9a3e'];

function drawLeaves(ctx, width, height, time) {
  for (let i = 0; i < 16; i++) {
    const fall = time * (10 + fixed(i, 10) * 10);
    const x = Math.round((fixed(i, 11) * width + Math.sin(time * 1.5 + i) * 14 + fall * 0.4) % width);
    const y = Math.round((fixed(i, 12) * height + fall) % height);
    ctx.fillStyle = LEAF_COLORS[i % LEAF_COLORS.length];
    const flip = Math.sin(time * 4 + i) > 0;
    ctx.fillRect(x, y, flip ? 3 : 2, flip ? 2 : 3);
  }
}

function drawEmbers(ctx, width, height, time) {
  for (let i = 0; i < 30; i++) {
    const life = (time * (0.2 + fixed(i, 13) * 0.3) + fixed(i, 14)) % 1;
    const x = Math.round(fixed(i, 15) * width + Math.sin(time * 2 + i) * 6);
    const y = Math.round(height - life * height * 1.1);
    ctx.fillStyle = life < 0.5 ? '#ffd23f' : life < 0.8 ? '#ff6a2b' : '#8a2c14';
    ctx.fillRect(x, y, 1, 1);
  }
}

export function drawWeather(ctx, game, view, time) {
  const zone = zoneAt(game.player.x, game.player.y);
  if (zone.kind === 'inside') return;
  const width = view.width;
  const height = view.height;
  const biome = biomeAt(game.player.x, game.player.y);
  const kind = game.weather.kind;
  if (biome === 'demon') drawEmbers(ctx, width, height, time);
  if (biome === 'mountain' && kind !== 'clear') drawSnow(ctx, width, height, time);
  else if (kind === 'rain') drawRain(ctx, width, height, time, 90);
  else if (kind === 'storm') drawRain(ctx, width, height, time, 170);
  if ((biome === 'forest' || zone.id === 'woods') && kind !== 'storm') drawLeaves(ctx, width, height, time);
  drawBolts(ctx, game, view);
}
