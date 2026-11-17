import { TILE_PX } from './tiles';
import { OUTLINE, WOOD_RAMP } from './palette';
import { makeGrid, dot, fillRect, fillEllipse, fillTriangle, addOutline, mirrored, toCanvas, once } from './pixels';
import { animalSprite } from './animals';
import { personSprite, walkPose } from './people';
import { ensureEconomy } from '../logic/economy/state';

// Pixel art rendering for real maritime shipping vessels, mounted kingdom road patrols,
// and local paid village gatherers carrying raw resource bundles.

const T = TILE_PX;

function isNear(view, x, y, w = 2, h = 2) {
  return x * T < view.x + view.width + 48 && (x + w) * T > view.x - 48 && y * T < view.y + view.height + 64 && (y + h) * T > view.y - 48;
}

function put(ctx, sprite, x, y, view) {
  ctx.drawImage(sprite.canvas, Math.round(x - sprite.ax - view.x), Math.round(y - sprite.ay - view.y));
}

function shadowSprite() {
  return once('econShadow', () => {
    const grid = makeGrid(12, 5);
    fillEllipse(grid, 6, 2.5, 6, 2.5, '#14101e55');
    return { canvas: toCanvas(grid), ax: 6, ay: 3 };
  });
}

function bundleSprite(itemId) {
  return once('econBundle|' + itemId, () => {
    const grid = makeGrid(10, 9);
    const col = itemId === 'ore' ? '#6d7686' : itemId === 'herb' ? '#4cc35a' : '#8a5228';
    const hi = itemId === 'ore' ? '#cfd8e6' : itemId === 'herb' ? '#9fe8a8' : '#d8b46a';
    fillRect(grid, 1, 2, 8, 6, col);
    fillRect(grid, 2, 1, 6, 2, hi);
    dot(grid, 4, 4, '#ffd23f');
    return { canvas: toCanvas(addOutline(grid, OUTLINE)), ax: 5, ay: 7 };
  });
}

export function merchantShipSprite(dir, frame, flagColor = '#e8b83a') {
  return once('econShip|' + dir + '|' + (frame % 2) + '|' + flagColor, () => {
    const grid = makeGrid(32, 26);
    const sway = (frame % 2) === 0 ? 0 : 1;
    fillRect(grid, 5, 17, 22, 5, WOOD_RAMP[1]); // sturdy timber hull
    fillRect(grid, 7, 15, 18, 3, WOOD_RAMP[2]);
    fillTriangle(grid, [24, 15], [30, 14], [26, 21], () => WOOD_RAMP[2]); // bowsprit prow
    fillRect(grid, 14, 3, 2, 14, WOOD_RAMP[0]); // tall mast
    fillRect(grid, 10 + sway, 5, 11, 9, '#fffaf0'); // billowing main sail
    fillRect(grid, 12 + sway, 8, 7, 2, '#d8e4f2');
    fillRect(grid, 16, 2, 5, 3, flagColor); // kingdom pennant
    fillRect(grid, 9, 14, 6, 3, '#c48c52'); // stacked cargo crates
    const finalGrid = dir === 'left' ? mirrored(grid) : grid;
    return { canvas: toCanvas(addOutline(finalGrid, OUTLINE)), ax: 16, ay: 22 };
  });
}

export function economyDrawings(game, view, time) {
  if (!game || !game.run) return [];
  const econ = ensureEconomy(game);
  const items = [];

  // 1. Autonomous maritime vessels sailing on sea tiles between ports
  for (const ship of econ.ships || []) {
    if (!isNear(view, ship.x - 2, ship.y - 2, 4, 4)) continue;
    items.push({
      y: ship.y,
      draw: (ctx) => {
        const frame = Math.floor(time * 2.2) % 2;
        const bob = Math.round(Math.sin(time * 2.6 + ship.x) * 1.2);
        const bx = Math.round(ship.x * T - view.x);
        const by = Math.round(ship.y * T - view.y);
        ctx.fillStyle = 'rgba(220, 245, 255, 0.45)';
        ctx.fillRect(bx - 12 - frame * 2, by - 1, 24 + frame * 3, 2); // water wake
        put(ctx, merchantShipSprite(ship.dir || 'right', frame, '#ffd23f'), ship.x * T, ship.y * T + bob, view);
      },
    });
  }

  // 2. Mounted kingdom road patrols protecting routes
  for (const p of econ.patrols || []) {
    if (!isNear(view, p.x - 2, p.y - 2, 4, 4)) continue;
    const look = {
      skin: '#f3d2b3',
      hair: '#2b2b3a',
      style: 'short',
      eyes: '#3b3b3b',
      outfit: '#9aa6b8',
      trim: p.color || '#e8b83a',
      pants: '#5d6676',
      boots: '#3a3442',
      helmet: true,
      scarf: true,
      sword: true,
    };
    const hDir = p.dir === 'left' || p.dir === 'right' ? p.dir : 'right';
    const frame = Math.floor(p.step || 0) % 2;
    const bob = Math.round(Math.sin((p.step || 0) * Math.PI) * 1.1);
    items.push({
      y: p.y,
      draw: (ctx) => {
        put(ctx, shadowSprite(), p.x * T, p.y * T, view);
        put(ctx, animalSprite('horse', hDir, frame), p.x * T, p.y * T, view);
        put(ctx, personSprite(look, p.dir || 'right', 'stand'), p.x * T, p.y * T - 9 + bob, view);
      },
    });
  }

  // 3. Paid local village gatherers carrying raw resource bundles
  for (const g of game.run.gatherers || []) {
    if (!isNear(view, g.x - 1, g.y - 1, 2, 2)) continue;
    items.push({
      y: g.y,
      draw: (ctx) => {
        put(ctx, shadowSprite(), g.x * T, g.y * T, view);
        put(ctx, personSprite(g.look, g.dir || 'down', walkPose(g.step || 0, g.wait <= 0)), g.x * T, g.y * T, view);
        if (g.carrying) put(ctx, bundleSprite(g.itemId), g.x * T, g.y * T - 18, view);
      },
    });
  }

  return items;
}
