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

function paintNight(ctx, width, height, dark, lights) {
  lightMap.width = width;
  lightMap.height = height;
  const map = lightMap.getContext('2d');
  map.fillStyle = 'rgba(10, 10, 34, ' + NIGHT_STRENGTH * dark + ')';
  map.fillRect(0, 0, width, height);
  map.globalCompositeOperation = 'destination-out';
  for (const light of lights) {
    const glow = map.createRadialGradient(light.x, light.y, 0, light.x, light.y, light.radius);
    glow.addColorStop(0, 'rgba(0, 0, 0, 1)');
    glow.addColorStop(0.52, 'rgba(0, 0, 0, 0.72)');
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    map.fillStyle = glow;
    map.fillRect(light.x - light.radius, light.y - light.radius, light.radius * 2, light.radius * 2);
  }
  ctx.drawImage(lightMap, 0, 0);
}

function paintGlows(ctx, lights, strength) {
  ctx.globalCompositeOperation = 'lighter';
  const bloomScale = Math.max(0.28, strength);
  for (const light of lights.filter((item) => item.warm)) {
    const radius = light.radius * 0.68;
    const glow = ctx.createRadialGradient(light.x, light.y, 0, light.x, light.y, radius);
    glow.addColorStop(0, 'rgba(255, 178, 72, ' + (0.26 * bloomScale).toFixed(3) + ')');
    glow.addColorStop(0.6, 'rgba(255, 118, 42, ' + (0.1 * bloomScale).toFixed(3) + ')');
    glow.addColorStop(1, 'rgba(255, 100, 30, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(light.x - radius, light.y - radius, radius * 2, radius * 2);
  }
  ctx.globalCompositeOperation = 'source-over';
}

function paintTint(ctx, width, height, color) {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);
}

function paintVignette(ctx, width, height) {
  const rad = Math.max(width, height) * 0.72;
  const g = ctx.createRadialGradient(width / 2, height / 2, rad * 0.45, width / 2, height / 2, rad);
  g.addColorStop(0, 'rgba(14, 10, 24, 0)');
  g.addColorStop(1, 'rgba(10, 8, 22, 0.28)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, width, height);
}

export function drawLights(ctx, game, width, height, lights, dark = darkness(game)) {
  const sunset = sunsetAmount(game.hour);
  if (sunset > 0) paintTint(ctx, width, height, 'rgba(255, 115, 48, ' + (0.19 * sunset).toFixed(3) + ')');
  if (game.raid.active) paintTint(ctx, width, height, 'rgba(255, 50, 18, 0.24)');
  if (bloodMoonTint(game)) paintTint(ctx, width, height, bloodMoonTint(game));
  if (dark > 0) paintNight(ctx, width, height, dark, lights);
  paintGlows(ctx, lights, dark);
  paintVignette(ctx, width, height);
}
