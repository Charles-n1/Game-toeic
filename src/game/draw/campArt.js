import { makeGrid, dot, fillRect, fillEllipse, fillBall, fillTriangle, drawLine, drawPicture, toneOf, addOutline, toCanvas, once } from './pixels';
import { OUTLINE, WOOD, STONE_RAMP } from './palette';
import { TILE_PX } from './tiles';

// The drawings of logic/camp.js on the map: tent, stone campfire (wood or Magic Auto-Heater),
// cooking pot on a tripod, log seat, and glowing embers / cooking steam.

const T = TILE_PX;

const FIRE_FRAMES = [
  ['...R....', '..ROR...', '..ROOR..', '.ROYOR..', '.ROYYOR.', '.ROYYOR.', '..RYYR..', '...RR...'],
  ['....R...', '...ROR..', '..ROR...', '..ROYOR.', '.ROYYOR.', '.ROYYOR.', '..ROYR..', '...RR...'],
  ['..R.....', '..ROR.R.', '.ROOR...', '.ROYOR..', '.ROYYOR.', 'ROYYYOR.', '.RYYYR..', '..RRR...'],
];
const WOOD_FLAME_COLORS = { R: '#e8421c', O: '#ff9a2b', Y: '#ffe066' };
const HEATER_FLAME_COLORS = { R: '#2b72c8', O: '#7fd6ff', Y: '#ffd23f' };

function sprite(grid, ax, ay) {
  return { canvas: toCanvas(addOutline(grid, OUTLINE)), ax: ax, ay: ay };
}

function isNear(view, x, y) {
  const px = x * T;
  const py = y * T;
  return px >= view.x - 64 && px <= view.x + view.width + 64 && py >= view.y - 64 && py <= view.y + view.height + 64;
}

function put(ctx, img, x, y, view) {
  ctx.drawImage(img.canvas, Math.round(x - img.ax - view.x), Math.round(y - img.ay - view.y));
}

// A cozy pitched A-frame traveler's tent with wooden poles and tied-back entrance.
function campTent() {
  return once('campTent', () => {
    const w = 36;
    const h = 28;
    const grid = makeGrid(w, h);
    const cloth = ['#6e3f20', '#8c542b', '#b06d38', '#d49052'];
    const trim = '#d9b671';

    // Soft ground shadow behind and under the tent.
    fillEllipse(grid, 18, 25, 16, 2.5, '#14101e40');

    // Main tent body (shaded left to right) and front ridge pole.
    fillTriangle(grid, [2, 24], [18, 3], [34, 24], (x, y) => toneOf(cloth, 0.85 - (x / w) * 0.55 - (y / h) * 0.12, x, y));
    fillRect(grid, 2, 23, 32, 2, cloth[0]); // bottom hem
    fillRect(grid, 17, 1, 2, 4, WOOD.dark); // top finial pole
    drawLine(grid, 18, 3, 2, 24, trim); // left trim rope
    drawLine(grid, 18, 3, 34, 24, cloth[1]);

    // Open entrance flap showing dark cozy interior and rolled bedroll inside.
    fillTriangle(grid, [12, 24], [18, 10], [24, 24], () => '#1b1420');
    fillRect(grid, 14, 21, 8, 3, '#3f9a4a'); // cozy green sleeping roll
    fillRect(grid, 15, 20, 6, 2, '#f6efe0'); // pillow peek
    drawLine(grid, 12, 24, 15, 14, '#e7c98a'); // tied-back front flaps
    drawLine(grid, 24, 24, 21, 14, '#c9a35e');

    // Wooden side stakes.
    fillRect(grid, 1, 23, 1, 3, WOOD.base);
    fillRect(grid, 34, 23, 1, 3, WOOD.base);
    return sprite(grid, 18, 25);
  });
}

// Stone ring campfire: unlit ashes, burning firewood, or glowing blue-gold Magic Auto-Heater.
function campFireSprite(lit, heater, frame) {
  return once('campFire' + lit + heater + frame, () => {
    const grid = makeGrid(18, 20);
    if (!lit) {
      drawLine(grid, 4, 16, 13, 13, '#3a3442');
      drawLine(grid, 4, 13, 13, 16, '#2a2530');
      fillEllipse(grid, 9, 15, 3, 1.5, '#5f5a66'); // grey ash
    } else if (heater) {
      // Arcane brass-and-gold brazier core + blue/gold magic flames.
      drawPicture(grid, FIRE_FRAMES[frame], HEATER_FLAME_COLORS, 5, 3);
      fillBall(grid, 9, 14, 3.2, 2.2, ['#2a4a8a', '#5aa8ee', '#fff2a8'], { ambient: 0.35 });
      dot(grid, 8, 13, '#ffffff');
      fillRect(grid, 5, 15, 8, 1, '#e8b83a'); // gold rune ring
    } else {
      drawPicture(grid, FIRE_FRAMES[frame], WOOD_FLAME_COLORS, 5, 3);
      drawLine(grid, 3, 16, 14, 13, WOOD.dark);
      drawLine(grid, 3, 13, 14, 16, WOOD.base);
      drawLine(grid, 4, 13, 14, 15, WOOD.light);
    }

    // Ring of stones around the hearth.
    const stones = heater
      ? ['#5a5266', '#7a7286', '#b3aeb8', '#e8b83a']
      : STONE_RAMP;
    [[2.5, 15], [5.5, 17], [9, 17.5], [12.5, 17], [15.5, 15]].forEach(([x, y]) => fillBall(grid, x, y, 1.7, 1.1, stones));
    return sprite(grid, 9, 18);
  });
}

// Tripod poles suspending an iron cooking pot above the campfire.
function campPotSprite(lit, frame) {
  return once('campPot' + lit + frame, () => {
    const grid = makeGrid(18, 22);
    // Tripod poles anchored behind/beside the fire ring.
    drawLine(grid, 9, 1, 2, 20, WOOD.dark);
    drawLine(grid, 9, 1, 15, 20, WOOD.dark);
    drawLine(grid, 9, 1, 10, 17, WOOD.deep);
    fillRect(grid, 8, 1, 3, 2, '#5a5266'); // apex iron collar
    fillRect(grid, 9, 3, 1, 4, '#9aa6b8'); // hanging hook

    // Iron cooking pot suspended in the middle.
    fillBall(grid, 9, 10, 4.2, 3.5, ['#1c1726', '#2e2a38', '#4a455a', '#6d687d'], { ambient: 0.25 });
    fillRect(grid, 5, 7, 8, 1, '#7a7286'); // pot rim
    if (lit) {
      fillRect(grid, 6, 7, 6, 1, frame % 2 === 0 ? '#ffd23f' : '#ff9a2b'); // simmering stew glint
      dot(grid, 8, 5 - (frame % 2), '#ffffffaa'); // tiny steam speck
    }
    return sprite(grid, 9, 20);
  });
}

// Small timber log bench beside the fire.
function campLogSeat() {
  return once('campLogSeat', () => {
    const grid = makeGrid(14, 10);
    fillEllipse(grid, 7, 7, 6, 2, '#14101e40');
    fillRect(grid, 1, 3, 12, 5, WOOD.base);
    fillRect(grid, 1, 3, 12, 2, WOOD.light);
    fillEllipse(grid, 12, 5.5, 1.5, 2.5, '#d6a46a');
    return sprite(grid, 7, 8);
  });
}

// The things standing on the map, sorted with the others: [{ y (feet line, in tiles), draw: (ctx) => {} }].
export function campDrawings(game, view, time) {
  const camp = game && game.camp ? game.camp.active : null;
  if (!camp || !isNear(view, camp.x, camp.y)) return [];

  const frame = Math.floor(time * 8) % 3;
  const tentX = (camp.x - 0.8) * T;
  const tentY = (camp.y - 0.35) * T;
  const fireX = (camp.x + 0.35) * T;
  const fireY = (camp.y + 0.2) * T;
  const logX = (camp.x + 1.15) * T;
  const logY = (camp.y + 0.1) * T;

  const drawings = [
    { y: camp.y - 0.35, draw: (ctx) => put(ctx, campTent(), tentX, tentY, view) },
    { y: camp.y + 0.2, draw: (ctx) => put(ctx, campFireSprite(Boolean(camp.lit), Boolean(camp.heater), frame), fireX, fireY, view) },
    { y: camp.y + 0.1, draw: (ctx) => put(ctx, campLogSeat(), logX, logY, view) },
  ];

  if (game.camp.hasPot !== false) {
    drawings.push({
      y: camp.y + 0.22,
      draw: (ctx) => put(ctx, campPotSprite(Boolean(camp.lit), frame), fireX, fireY + 2, view),
    });
  }
  return drawings;
}

// Drawn over everything (before the night and the weather): warm firelight glow, sparks, and cooking steam.
export function drawCampEffects(ctx, game, view, time) {
  const camp = game && game.camp ? game.camp.active : null;
  if (!camp || !camp.lit || !isNear(view, camp.x, camp.y)) return;

  const fx = Math.round((camp.x + 0.35) * T - view.x);
  const fy = Math.round((camp.y + 0.05) * T - view.y);
  const radius = 26 + Math.sin(time * 5) * 2;

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const glow = ctx.createRadialGradient(fx, fy, 1, fx, fy, radius);
  if (camp.heater) {
    glow.addColorStop(0, 'rgba(130, 220, 255, 0.28)');
    glow.addColorStop(0.5, 'rgba(255, 210, 90, 0.12)');
    glow.addColorStop(1, 'rgba(70, 140, 255, 0)');
  } else {
    glow.addColorStop(0, 'rgba(255, 175, 70, 0.28)');
    glow.addColorStop(1, 'rgba(255, 100, 30, 0)');
  }
  ctx.fillStyle = glow;
  ctx.fillRect(fx - radius, fy - radius, radius * 2, radius * 2);
  ctx.restore();

  // Rising fire embers (gold/cyan for Magic Auto-Heater, gold/orange for firewood).
  for (let i = 0; i < 5; i++) {
    const life = (time * 0.75 + i / 5) % 1;
    const sx = fx + Math.sin(time * 3 + i * 1.9) * 4;
    const sy = fy - 3 - life * 18;
    ctx.fillStyle = camp.heater ? (life < 0.5 ? '#ffd23f' : '#7fd6ff') : life < 0.5 ? '#ffe066' : '#ff6a2b';
    ctx.fillRect(Math.round(sx), Math.round(sy), 1, 1);
  }

  // Gentle cooking steam from the pot when lit.
  if (game.camp.hasPot !== false) {
    for (let i = 0; i < 3; i++) {
      const life = (time * 0.45 + i / 3) % 1;
      const sx = fx - 1 + Math.sin(time * 2 + i * 2.1) * 2;
      const sy = fy - 11 - life * 11;
      ctx.fillStyle = 'rgba(245, 242, 255, ' + (0.55 * (1 - life)).toFixed(2) + ')';
      ctx.fillRect(Math.round(sx), Math.round(sy), 2, 1);
    }
  }
}
