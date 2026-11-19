import { darkness } from '../logic/clock';
import { bloodMoonTint } from './isekaiArt';

// HD-2D Atmospheric Lighting:
// Directional golden sun rays at morning/dusk, deep indigo midnight ambient shadows,
// soft warm radial blooms around lanterns/windows/campfires, and subtle edge vignette.

const lightMap = document.createElement('canvas');
const NIGHT_STRENGTH = 0.82;

function sunsetAmount(hour) {
  if (hour >= 17 && hour < 21) return 1 - Math.abs(hour - 19) / 2;
  if (hour >= 5 && hour < 8.5) return (1 - Math.abs(hour - 6.75) / 1.75) * 0.6;
  return 0;
}

// The pictures of a light, made once (64 x 64) and copied at the size of each light at every frame:
// a hole in the darkness, and a warm glow. (A new gradient for each light at each frame was slow.)
const HALO = 64;
let darkHole = null;
let warmGlow = null;

function haloPicture(stops) {
  const canvas = document.createElement('canvas');
  canvas.width = HALO;
  canvas.height = HALO;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(HALO / 2, HALO / 2, 0, HALO / 2, HALO / 2, HALO / 2);
  for (const [at, color] of stops) gradient.addColorStop(at, color);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, HALO, HALO);
  return canvas;
}

function darkHolePicture() {
  if (!darkHole) darkHole = haloPicture([[0, 'rgba(0, 0, 0, 1)'], [0.52, 'rgba(0, 0, 0, 0.72)'], [1, 'rgba(0, 0, 0, 0)']]);
  return darkHole;
}

function warmGlowPicture() {
  if (!warmGlow) warmGlow = haloPicture([[0, 'rgba(255, 178, 72, 0.26)'], [0.6, 'rgba(255, 118, 42, 0.1)'], [1, 'rgba(255, 100, 30, 0)']]);
  return warmGlow;
}

function paintNight(ctx, width, height, dark, lights) {
  if (lightMap.width !== width || lightMap.height !== height) {
    lightMap.width = width; // (a new size empties the canvas: only when the size changes, not every frame)
    lightMap.height = height;
  }
  const map = lightMap.getContext('2d');
  map.globalCompositeOperation = 'source-over';
  map.clearRect(0, 0, width, height);
  map.fillStyle = 'rgba(10, 10, 34, ' + NIGHT_STRENGTH * dark + ')';
  map.fillRect(0, 0, width, height);
  map.globalCompositeOperation = 'destination-out';
  const hole = darkHolePicture();
  for (const light of lights) map.drawImage(hole, light.x - light.radius, light.y - light.radius, light.radius * 2, light.radius * 2);
  map.globalCompositeOperation = 'source-over';
  ctx.drawImage(lightMap, 0, 0);
}

function paintGlows(ctx, lights, strength) {
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = Math.max(0.28, strength);
  const glow = warmGlowPicture();
  for (const light of lights) {
    if (!light.warm) continue;
    const radius = light.radius * 0.68;
    ctx.drawImage(glow, light.x - radius, light.y - radius, radius * 2, radius * 2);
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

function paintTint(ctx, width, height, color) {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);
}

// The dark edges of the screen: made once for a size of screen, then copied.
const vignette = document.createElement('canvas');
let vignetteSize = ''; // the size it was painted for ('' = never painted: a new canvas is already 300 x 150)

function paintVignette(ctx, width, height) {
  if (vignetteSize !== width + 'x' + height) {
    vignetteSize = width + 'x' + height;
    vignette.width = width;
    vignette.height = height;
    const v = vignette.getContext('2d');
    const rad = Math.max(width, height) * 0.72;
    const g = v.createRadialGradient(width / 2, height / 2, rad * 0.45, width / 2, height / 2, rad);
    g.addColorStop(0, 'rgba(14, 10, 24, 0)');
    g.addColorStop(1, 'rgba(10, 8, 22, 0.28)');
    v.fillStyle = g;
    v.fillRect(0, 0, width, height);
  }
  ctx.drawImage(vignette, 0, 0);
}

export function drawLights(ctx, game, width, height, lights, dark = darkness(game)) {
  const h = game.hour ?? 12;
  const morning = h >= 5 && h < 8.5 ? 1 - Math.abs(h - 6.75) / 1.75 : 0;
  const noon = h >= 11 && h < 14.5 ? 1 - Math.abs(h - 12.75) / 1.75 : 0;
  const evening = h >= 17 && h < 21 ? 1 - Math.abs(h - 19) / 2 : 0;
  if (morning > 0) paintTint(ctx, width, height, 'rgba(255, 206, 98, ' + (0.14 * morning).toFixed(3) + ')');
  if (noon > 0) paintTint(ctx, width, height, 'rgba(255, 255, 245, ' + (0.06 * noon).toFixed(3) + ')');
  if (evening > 0) paintTint(ctx, width, height, 'rgba(255, 115, 48, ' + (0.2 * evening).toFixed(3) + ')');
  if (game.raid.active) paintTint(ctx, width, height, 'rgba(255, 50, 18, 0.24)');
  if (bloodMoonTint(game)) paintTint(ctx, width, height, bloodMoonTint(game));
  if (dark > 0) paintNight(ctx, width, height, dark, lights);
  paintGlows(ctx, lights, dark);
  paintVignette(ctx, width, height);
}
