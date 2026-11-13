import { darkness } from '../logic/clock';

// The light of the world: the night falls, the lamps glow, the sunset turns everything orange,
// and during a raid the burning village lights the sky in red.
// lights: [{ x, y, radius, warm }] in pixels of the screen buffer.

const lightMap = document.createElement('canvas');

// 0 = no sunset, 1 = the most orange moment (19:00). The morning has a softer pink one.
function sunsetAmount(hour) {
  if (hour >= 17 && hour < 21) return 1 - Math.abs(hour - 19) / 2;
  if (hour >= 5 && hour < 8) return (1 - Math.abs(hour - 6.5) / 1.5) * 0.5;
  return 0;
}

// The dark blue of the night, with holes where there is light.
function paintNight(ctx, width, height, dark, lights) {
  lightMap.width = width;
  lightMap.height = height;
  const map = lightMap.getContext('2d');
  map.fillStyle = 'rgba(8, 10, 40, ' + 0.86 * dark + ')';
  map.fillRect(0, 0, width, height);
  map.globalCompositeOperation = 'destination-out';
  for (const light of lights) {
    const glow = map.createRadialGradient(light.x, light.y, 0, light.x, light.y, light.radius);
    glow.addColorStop(0, 'rgba(0, 0, 0, 1)');
    glow.addColorStop(0.5, 'rgba(0, 0, 0, 0.7)');
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    map.fillStyle = glow;
    map.fillRect(light.x - light.radius, light.y - light.radius, light.radius * 2, light.radius * 2);
  }
  ctx.drawImage(lightMap, 0, 0);
}

// The warm halo around the lamps and the fires.
function paintGlows(ctx, lights, strength) {
  ctx.globalCompositeOperation = 'lighter';
  for (const light of lights.filter((item) => item.warm)) {
    const radius = light.radius * 0.6;
    const glow = ctx.createRadialGradient(light.x, light.y, 0, light.x, light.y, radius);
    glow.addColorStop(0, 'rgba(255, 170, 70, ' + 0.22 * strength + ')');
    glow.addColorStop(1, 'rgba(255, 120, 40, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(light.x - radius, light.y - radius, radius * 2, radius * 2);
  }
  ctx.globalCompositeOperation = 'source-over';
}

function paintTint(ctx, width, height, color) {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);
}

export function drawLights(ctx, game, width, height, lights) {
  const dark = darkness(game);
  const sunset = sunsetAmount(game.hour);
  if (sunset > 0) paintTint(ctx, width, height, 'rgba(255, 120, 50, ' + 0.16 * sunset + ')');
  if (game.raid.active) paintTint(ctx, width, height, 'rgba(255, 60, 20, 0.24)');
  if (dark > 0) {
    paintNight(ctx, width, height, dark, lights);
    paintGlows(ctx, lights, dark);
  }
}
