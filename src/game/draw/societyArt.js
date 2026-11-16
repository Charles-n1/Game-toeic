import { villageOf, isInsideWorld } from '../data/zones';
import { KINGDOMS } from '../data/kingdoms';
import { propsInArea } from '../world/map';
import { isFestivalActive } from '../logic/society';
import { visibleVillagers } from '../logic/villagers';
import { TILE_PX } from './tiles';
import { personSprite, walkPose } from './people';
import { makeGrid, dot, fillRect, fillBall, fillTriangle, toneOf, addOutline, mirrored, toCanvas, once } from './pixels';
import { OUTLINE, STONE_RAMP, WOOD_RAMP, WOOD } from './palette';

// Pixel art drawings and visual effects for society.js:
// statues, wild totems, game stalls, bounty boards, cages & captives, slave traders,
// merchant & ridden horses, town decorations, festival bonfires & fireworks, tornadoes & tsunamis.

const T = TILE_PX;

const HORSE_COATS = {
  bay: ['#4a2a16', '#7a4a26', '#9a6236', '#b87a48'],
  white: ['#9aa0aa', '#c9ced6', '#eef2f8', '#ffffff'],
  chestnut: ['#5a2414', '#8a3a1e', '#b0522c', '#d06e3e'],
  black: ['#16141e', '#262232', '#383448', '#4e4862'],
};

function isNearView(view, x, y, w, h) {
  return x * T < view.x + view.width + 48 && (x + w) * T > view.x - 48 && y * T < view.y + view.height + 72 && (y + h) * T > view.y - 48;
}

function put(ctx, sprite, x, y, view) {
  ctx.drawImage(sprite.canvas, Math.round(x - sprite.ax - view.x), Math.round(y - sprite.ay - view.y));
}

// ---------- Pixel Sprites (cached with once) ----------

function statueSprite(used) {
  return once('socStatue' + used, () => {
    const grid = makeGrid(28, 38);
    const marble = ['#8f93a2', '#b8bcc8', '#d9dce6', '#f2f4fa'];
    // Stone pedestal
    fillRect(grid, 4, 28, 20, 9, STONE_RAMP[2]);
    fillRect(grid, 3, 27, 22, 2, STONE_RAMP[4]);
    fillRect(grid, 2, 35, 24, 3, STONE_RAMP[1]);
    // Robed statue figure + raised sword/book
    fillTriangle(grid, [8, 27], [14, 11], [20, 27], (x, y) => toneOf(marble, 0.75 - (x - 8) * 0.03, x, y));
    fillBall(grid, 14, 9, 4, 4, marble, { ambient: 0.3 });
    fillRect(grid, 18, 4, 2, 14, used ? '#9aa6b8' : '#ffd23f');
    fillRect(grid, 16, 12, 6, 2, used ? '#9aa6b8' : '#e8b83a');
    if (!used) fillBall(grid, 14, 2, 2, 2, ['#e8b83a', '#ffd23f', '#ffffff']);
    return { canvas: toCanvas(addOutline(grid, OUTLINE)), ax: 14, ay: 37 };
  });
}

function totemSprite(used) {
  return once('socTotem' + used, () => {
    const grid = makeGrid(18, 36);
    const grey = ['#3b3d48', '#525563', '#6b6f80', '#868b9e'];
    fillRect(grid, 4, 5, 10, 29, grey[1]);
    fillRect(grid, 5, 3, 8, 30, grey[2]);
    fillRect(grid, 2, 31, 14, 4, grey[0]);
    fillRect(grid, 3, 10, 12, 3, grey[3]); // carved brow
    const glow = used ? '#5a5f70' : '#8fd6ff';
    dot(grid, 7, 14, glow);
    dot(grid, 10, 14, glow);
    fillRect(grid, 7, 18, 4, 2, glow);
    fillRect(grid, 6, 23, 6, 1, glow);
    fillRect(grid, 7, 26, 4, 2, glow);
    return { canvas: toCanvas(addOutline(grid, OUTLINE)), ax: 9, ay: 35 };
  });
}

function gameStallSprite(frame) {
  return once('socGameStall' + frame, () => {
    const grid = makeGrid(34, 32);
    // Striped purple & gold awning
    for (let x = 1; x < 33; x += 4) fillRect(grid, x, 2, 4, 7, ((x - 1) / 4) % 2 === 0 ? '#6442a8' : '#ffd23f');
    fillRect(grid, 2, 9, 2, 21, WOOD.dark);
    fillRect(grid, 30, 9, 2, 21, WOOD.dark);
    fillRect(grid, 1, 19, 32, 11, WOOD.base);
    fillRect(grid, 1, 19, 32, 2, WOOD.light);
    // Spinning enigma wheel on the stall
    fillBall(grid, 17, 13, 4.5, 4.5, ['#2a1a4e', '#4e3288', '#7d5cc4']);
    const spin = frame % 2;
    dot(grid, 17 + (spin ? 2 : 0), 10, '#ffd23f');
    dot(grid, 17 + (spin ? 0 : -2), 16, '#7cfc9a');
    dot(grid, 14 + (spin ? 0 : 2), 13, '#ff6fa8');
    // Word cards on counter
    fillRect(grid, 6, 17, 5, 3, '#fff6e0');
    fillRect(grid, 23, 17, 5, 3, '#fff6e0');
    return { canvas: toCanvas(addOutline(grid, OUTLINE)), ax: 17, ay: 31 };
  });
}

function boardSprite() {
  return once('socBoard', () => {
    const grid = makeGrid(18, 24);
    fillRect(grid, 3, 8, 2, 15, WOOD.dark);
    fillRect(grid, 13, 8, 2, 15, WOOD.dark);
    fillRect(grid, 1, 2, 16, 11, WOOD.base);
    fillRect(grid, 2, 3, 14, 9, WOOD_RAMP[2]);
    // Pinned bounty parchments
    fillRect(grid, 3, 4, 5, 6, '#f6efe0');
    fillRect(grid, 10, 5, 5, 6, '#f2e0b8');
    dot(grid, 5, 4, '#e8423f');
    dot(grid, 12, 5, '#e8423f');
    fillRect(grid, 4, 6, 3, 1, '#5a3a22');
    fillRect(grid, 11, 7, 3, 1, '#5a3a22');
    return { canvas: toCanvas(addOutline(grid, OUTLINE)), ax: 9, ay: 23 };
  });
}

function cageSprite(freed) {
  return once('socCage' + freed, () => {
    const grid = makeGrid(46, 30);
    // Floor & roof of cage
    fillRect(grid, 2, 24, 42, 4, WOOD.dark);
    fillRect(grid, 2, 3, 42, 3, '#3a3442');
    fillRect(grid, 2, 3, 42, 1, '#6d7686');
    // Iron bars
    for (let x = 3; x <= 42; x += 5) {
      if (freed && x >= 18 && x <= 28) continue; // smashed open middle
      fillRect(grid, x, 6, 2, 18, '#7a8296');
      fillRect(grid, x, 6, 1, 18, '#b9c2d2');
    }
    if (!freed) {
      // Captive standing inside
      fillBall(grid, 23, 12, 3.5, 3.5, ['#c99872', '#e9b98f', '#f3d2b3']);
      fillRect(grid, 20, 15, 6, 8, '#6b8a3a');
      fillRect(grid, 21, 9, 4, 2, '#5a3a1e');
      // Re-draw front iron bars over captive
      for (const x of [18, 23, 28]) {
        fillRect(grid, x, 6, 2, 18, '#7a8296');
        fillRect(grid, x, 6, 1, 18, '#b9c2d2');
      }
      fillRect(grid, 21, 15, 4, 3, '#e8b83a'); // padlock
    }
    return { canvas: toCanvas(addOutline(grid, OUTLINE)), ax: 23, ay: 28 };
  });
}

function horseSprite(color, hasPacks, dir, frame) {
  return once('socHorse' + color + hasPacks + dir + frame, () => {
    const coat = HORSE_COATS[color] || HORSE_COATS.bay;
    const grid = makeGrid(30, 26);
    const step = frame ? 1 : 0;
    [5 + step, 8 - step, 20 + step, 23 - step].forEach((x) => fillRect(grid, x, 17, 2, 8, coat[0]));
    fillBall(grid, 14, 13, 11, 5.5, coat);
    fillRect(grid, 22, 4, 4, 10, coat[2]);
    fillBall(grid, 26, 5, 3.5, 2.5, coat);
    fillRect(grid, 21, 2, 2, 9, coat[0]);
    dot(grid, 26, 4, '#1c1726');
    fillRect(grid, 1, 11, 2, 9, coat[0]);
    // Saddle / merchant packs
    fillRect(grid, 10, 8, 8, 3, '#7a4a24');
    if (hasPacks) {
      fillRect(grid, 7, 10, 5, 5, '#c48c52');
      fillRect(grid, 15, 10, 5, 5, '#a0683a');
      fillRect(grid, 16, 11, 3, 2, '#e8b83a');
    }
    const outlined = addOutline(dir === 'left' ? mirrored(grid) : grid, OUTLINE);
    return { canvas: toCanvas(outlined), ax: Math.floor(outlined.width / 2), ay: outlined.height - 1 };
  });
}

// Dedicated mount sprite drawn just beneath the hero in all 4 directions.
function mountSprite(color, dir, frame) {
  return once('socMount' + color + dir + frame, () => {
    const coat = HORSE_COATS[color] || HORSE_COATS.bay;
    const step = frame % 2;
    if (dir === 'up' || dir === 'down') {
      const grid = makeGrid(22, 26);
      fillRect(grid, 6, 16 + step, 3, 8, coat[0]);
      fillRect(grid, 13, 16 + (1 - step), 3, 8, coat[0]);
      fillBall(grid, 11, 13, 7, 6, coat);
      fillRect(grid, 6, 8, 10, 4, '#b8303a'); // saddle cloth
      if (dir === 'down') {
        fillBall(grid, 11, 16, 3.5, 4, coat, { ambient: 0.3 });
        dot(grid, 9, 15, '#1c1726');
        dot(grid, 13, 15, '#1c1726');
      } else {
        fillRect(grid, 9, 10, 4, 8, coat[0]); // tail
      }
      return { canvas: toCanvas(addOutline(grid, OUTLINE)), ax: 11, ay: 20 };
    }
    const grid = makeGrid(32, 26);
    const legShift = step ? 2 : -1;
    fillRect(grid, 5 + legShift, 17, 2, 7, coat[0]);
    fillRect(grid, 9 - legShift, 17, 2, 7, coat[0]);
    fillRect(grid, 21 + legShift, 17, 2, 7, coat[0]);
    fillRect(grid, 25 - legShift, 17, 2, 7, coat[0]);
    fillBall(grid, 15, 13, 11, 5.2, coat);
    fillRect(grid, 10, 8, 9, 4, '#b8303a'); // saddle cloth
    fillRect(grid, 23, 5, 4, 9, coat[2]); // neck & head
    fillBall(grid, 27, 5, 3.5, 2.5, coat);
    dot(grid, 27, 4, '#1c1726');
    fillRect(grid, 22, 3, 2, 7, coat[0]); // mane
    fillRect(grid, 2, 11, 2, 8, coat[0]); // tail
    const finalGrid = dir === 'left' ? mirrored(grid) : grid;
    return { canvas: toCanvas(addOutline(finalGrid, OUTLINE)), ax: Math.floor(finalGrid.width / 2), ay: 19 };
  });
}

function decorBannerSprite(color) {
  return once('socDecorBanner' + color, () => {
    const grid = makeGrid(12, 28);
    fillRect(grid, 5, 0, 2, 28, WOOD.dark);
    fillRect(grid, 1, 2, 10, 14, color);
    fillTriangle(grid, [1, 16], [6, 20], [11, 16], () => color);
    fillRect(grid, 3, 5, 6, 2, '#ffd23f');
    return { canvas: toCanvas(addOutline(grid, OUTLINE)), ax: 6, ay: 27 };
  });
}

function lanternPostSprite(glowing) {
  return once('socLantern' + glowing, () => {
    const grid = makeGrid(12, 22);
    fillRect(grid, 5, 4, 2, 17, WOOD.dark);
    fillRect(grid, 5, 3, 6, 2, WOOD.dark);
    fillRect(grid, 8, 5, 4, 5, glowing ? '#ffe066' : '#ff9a2b');
    fillRect(grid, 7, 4, 6, 1, '#3a3442');
    fillRect(grid, 7, 10, 6, 1, '#3a3442');
    return { canvas: toCanvas(addOutline(grid, OUTLINE)), ax: 6, ay: 21 };
  });
}

function flowerBoxSprite() {
  return once('socFlowerBox', () => {
    const grid = makeGrid(14, 12);
    fillRect(grid, 1, 6, 12, 6, WOOD.base);
    fillRect(grid, 1, 6, 12, 1, WOOD.light);
    fillRect(grid, 2, 3, 10, 3, '#4caf50');
    dot(grid, 3, 3, '#ff6fa8');
    dot(grid, 6, 2, '#ffd23f');
    dot(grid, 9, 3, '#ff6fa8');
    dot(grid, 11, 4, '#5fd3e8');
    return { canvas: toCanvas(addOutline(grid, OUTLINE)), ax: 7, ay: 11 };
  });
}

// ---------- Decor & Festival Village Elements ----------

function addPropDrawings(game, view, time, list) {
  const s = game.society;
  const props = propsInArea(Math.floor(view.x / T) - 6, Math.floor(view.y / T) - 4, Math.ceil((view.x + view.width) / T) + 6, Math.ceil((view.y + view.height) / T) + 8);
  const wheelFrame = Math.floor(time * 4) % 2;

  for (const prop of props) {
    if (!isNearView(view, prop.x, prop.y, prop.w, prop.h + 4)) continue;
    if (prop.kind === 'statue') {
      const id = 'statue-' + Math.floor(prop.x) + ',' + Math.floor(prop.y);
      const used = s.statuesUsed.includes(id);
      list.push({ y: prop.y + prop.h + 0.02, draw: (ctx) => put(ctx, statueSprite(used), (prop.x + prop.w / 2) * T, (prop.y + prop.h) * T, view) });
    } else if (prop.kind === 'totem') {
      const id = prop.totem || 'totem-' + Math.floor(prop.x) + ',' + Math.floor(prop.y);
      const used = s.statuesUsed.includes(id);
      list.push({ y: prop.y + prop.h + 0.02, draw: (ctx) => put(ctx, totemSprite(used), (prop.x + prop.w / 2) * T, (prop.y + prop.h) * T, view) });
    } else if (prop.kind === 'gameStall') {
      list.push({ y: prop.y + prop.h + 0.02, draw: (ctx) => put(ctx, gameStallSprite(wheelFrame), (prop.x + prop.w / 2) * T, (prop.y + prop.h) * T, view) });
    } else if (prop.kind === 'board') {
      list.push({ y: prop.y + prop.h + 0.02, draw: (ctx) => put(ctx, boardSprite(), (prop.x + prop.w / 2) * T, (prop.y + prop.h) * T, view) });
    } else if (prop.kind === 'cage') {
      const key = Math.floor(prop.x) + ',' + Math.floor(prop.y);
      const freed = Boolean(s.cagesFreed[key]);
      list.push({ y: prop.y + prop.h + 0.02, draw: (ctx) => put(ctx, cageSprite(freed), (prop.x + prop.w / 2) * T, (prop.y + prop.h) * T, view) });
    }
  }
}

function addVillageDecorAndChurchStatues(game, view, time, list) {
  const s = game.society;
  const awake = game.run.awake || [];
  const glowing = game.hour >= 17 || game.hour < 6;

  for (const id of awake) {
    const village = villageOf(id);
    const state = game.villages[id];
    if (!village || !state) continue;
    if (!isNearView(view, village.x, village.y, village.w, village.h)) continue;

    // Church statue beside church door
    const church = village.plan.houses.find((h) => h.role === 'church');
    if (church) {
      const sx = church.x + church.w - 1.5;
      const sy = church.y + church.h + 0.6;
      if (isNearView(view, sx - 1, sy - 2, 2, 3)) {
        const used = s.statuesUsed.includes('church-' + id);
        list.push({ y: sy, draw: (ctx) => put(ctx, statueSprite(used), sx * T, sy * T, view) });
      }
    }

    const decor = state.decor || 0;
    const festival = isFestivalActive(game, id);
    if (decor <= 0 && !festival) continue;

    const sq = village.plan.square;
    const kingdom = KINGDOMS.find((k) => k.id === village.kingdom);
    const bannerColor = kingdom ? kingdom.color : '#e8423f';

    // Flower boxes at decor >= 1 or festival
    if (decor >= 1 || festival) {
      const corners = [[sq.x + 2, sq.y + 1], [sq.x + sq.w - 2, sq.y + 1], [sq.x + 2, sq.y + sq.h - 1], [sq.x + sq.w - 2, sq.y + sq.h - 1]];
      for (const [fx, fy] of corners) {
        if (isNearView(view, fx - 1, fy - 1, 2, 2)) {
          list.push({ y: fy, draw: (ctx) => put(ctx, flowerBoxSprite(), fx * T, fy * T, view) });
        }
      }
    }

    // Hanging festival lanterns at decor >= 2 or festival
    if (decor >= 2 || festival) {
      const lanterns = [[sq.x + 1, sq.y + Math.floor(sq.h / 2)], [sq.x + sq.w - 1, sq.y + Math.floor(sq.h / 2)]];
      for (const [lx, ly] of lanterns) {
        if (isNearView(view, lx - 1, ly - 2, 2, 3)) {
          list.push({ y: ly, draw: (ctx) => put(ctx, lanternPostSprite(glowing), lx * T, ly * T, view) });
        }
      }
    }

    // Tall kingdom banners at decor >= 3 or festival
    if (decor >= 3 || festival) {
      const posts = [[sq.x + Math.floor(sq.w / 2) - 4, sq.y + 1], [sq.x + Math.floor(sq.w / 2) + 4, sq.y + 1]];
      for (const [bx, by] of posts) {
        if (isNearView(view, bx - 1, by - 2, 2, 3)) {
          list.push({ y: by, draw: (ctx) => put(ctx, decorBannerSprite(bannerColor), bx * T, by * T, view) });
        }
      }
    }

    // Colorful bunting strung across the square when decor >= 1 or festival
    if ((decor >= 1 || festival) && isNearView(view, sq.x, sq.y, sq.w, sq.h)) {
      list.push({
        y: sq.y + 0.1,
        draw: (ctx) => {
          const palette = ['#ff5a6e', '#ffd23f', '#7cfc9a', '#5fd3e8', '#d8b4f8'];
          const yPx = Math.round(sq.y * T - view.y + 4);
          const left = Math.round((sq.x + 1) * T - view.x);
          const right = Math.round((sq.x + sq.w - 1) * T - view.x);
          ctx.fillStyle = '#5a3a22';
          ctx.fillRect(left, yPx, right - left, 1);
          for (let px = left + 4; px < right - 4; px += 8) {
            const sag = Math.round(Math.sin(((px - left) / Math.max(1, right - left)) * Math.PI) * 4);
            ctx.fillStyle = palette[Math.floor(px / 8) % palette.length];
            ctx.fillRect(px, yPx + sag, 4, 3);
            ctx.fillRect(px + 1, yPx + sag + 3, 2, 1);
          }
        },
      });
    }

    // Extra dancing festival bonfire spark sprites over campfire
    if (festival) {
      const cf = village.plan.props.find((p) => p.kind === 'campfire');
      if (cf && isNearView(view, cf.x - 1, cf.y - 2, 3, 3)) {
        list.push({
          y: cf.y + 1.2,
          draw: (ctx) => {
            const x = Math.round((cf.x + 0.5) * T - view.x);
            const y = Math.round((cf.y + 0.8) * T - view.y);
            for (let i = 0; i < 4; i++) {
              const rise = ((time * 18 + i * 7) % 16);
              ctx.fillStyle = i % 2 ? '#ffe066' : '#ff6a2b';
              ctx.fillRect(x - 3 + ((i * 3) % 7), y - 8 - Math.round(rise), 2, 2);
            }
          },
        });
      }
    }
  }
}

function addFestivalVillagerMarks(game, view, time, list) {
  for (const villager of visibleVillagers(game)) {
    if (!isNearView(view, villager.x - 1, villager.y - 2, 2, 2)) continue;
    if (villager.dancing || villager.drunk > 0) {
      list.push({
        y: villager.y + 0.05,
        draw: (ctx) => {
          const px = Math.round(villager.x * T - view.x);
          const py = Math.round(villager.y * T - view.y - 32);
          if (villager.dancing) {
            const bob = Math.round(Math.sin(time * 8 + villager.x) * 2);
            ctx.fillStyle = '#ffd23f';
            ctx.fillRect(px + 5, py + bob, 2, 4);
            ctx.fillRect(px + 5, py + bob, 4, 1);
            ctx.fillRect(px + 4, py + bob + 3, 2, 2);
          }
          if (villager.drunk > 0) {
            const wobble = Math.round(Math.sin(time * 5 + villager.y) * 3);
            ctx.fillStyle = '#ff9ec4';
            ctx.fillRect(px - 6 + wobble, py - 2, 2, 2);
            ctx.fillRect(px + 2 - wobble, py - 4, 2, 2);
          }
        },
      });
    }
  }
}

// The things standing on the map, sorted with the others: [{ y, draw: (ctx) => {} }].
export function societyDrawings(game, view, time) {
  if (!game || !game.society) return [];
  const s = game.society;
  const list = [];

  addPropDrawings(game, view, time, list);
  addVillageDecorAndChurchStatues(game, view, time, list);
  addFestivalVillagerMarks(game, view, time, list);

  // Slave traders standing beside cages
  for (const trader of game.run.slaveTraders || []) {
    if (!isNearView(view, trader.x - 1, trader.y - 2, 2, 2)) continue;
    list.push({
      y: trader.y,
      draw: (ctx) => {
        const sprite = personSprite(trader.look, 'down', walkPose(0, false, time, trader.x));
        put(ctx, sprite, trader.x * T, trader.y * T, view);
      },
    });
  }

  // Merchant horses
  for (const horse of game.run.merchantHorses || []) {
    if (!isNearView(view, horse.x - 1, horse.y - 2, 2, 2)) continue;
    list.push({
      y: horse.y,
      draw: (ctx) => {
        const frame = horse.walkX !== 0 || horse.walkY !== 0 ? Math.floor(horse.step) % 2 : 0;
        put(ctx, horseSprite(horse.color, true, horse.dir, frame), horse.x * T, horse.y * T, view);
      },
    });
  }

  // Dismounted parked horse
  if (s.parkedHorse && isNearView(view, s.parkedHorse.x - 1, s.parkedHorse.y - 2, 2, 2)) {
    const h = s.parkedHorse;
    list.push({
      y: h.y,
      draw: (ctx) => put(ctx, horseSprite(h.color || 'bay', false, 'right', 0), h.x * T, h.y * T, view),
    });
  }

  // Ridden horse drawn right under the hero
  if (s.riding && s.riding.active && !game.run.fight && !isInsideWorld(game.player.y)) {
    const p = game.player;
    const frame = game.run.walking ? Math.floor(p.step) % 2 : 0;
    list.push({
      y: p.y - 0.01,
      draw: (ctx) => put(ctx, mountSprite(s.riding.color || 'bay', p.dir || 'down', frame), p.x * T, p.y * T + 5, view),
    });
  }

  return list;
}

// ---------- Overlay Effects (Bonfire glow, Fireworks, Tornado, Tsunami) ----------

function drawFestivalGlowAndFireworks(ctx, game, view, time) {
  const isEvening = game.hour >= 17 || game.hour < 6;
  if (isEvening) {
    for (const id of game.run.awake || []) {
      if (!isFestivalActive(game, id)) continue;
      const village = villageOf(id);
      const cf = village && village.plan.props.find((p) => p.kind === 'campfire');
      if (!cf || !isNearView(view, cf.x - 4, cf.y - 4, 9, 9)) continue;
      const cx = Math.round((cf.x + 0.5) * T - view.x);
      const cy = Math.round((cf.y + 0.5) * T - view.y);
      const radius = 64 + Math.sin(time * 6) * 5;
      const glow = ctx.createRadialGradient(cx, cy, 4, cx, cy, radius);
      glow.addColorStop(0, 'rgba(255, 190, 70, 0.42)');
      glow.addColorStop(0.5, 'rgba(255, 110, 30, 0.18)');
      glow.addColorStop(1, 'rgba(255, 80, 10, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
    }
  }

  for (const fw of game.run.fireworks || []) {
    const progress = fw.age / fw.life;
    const bx = Math.round(fw.x * T - view.x);
    const by = Math.round(fw.y * T - view.y);
    if (progress < 0.28) {
      const climb = progress / 0.28;
      const ry = Math.round(by + 36 * (1 - climb));
      ctx.fillStyle = '#fff6b0';
      ctx.fillRect(bx, ry, 2, 4);
    } else {
      const burstProg = (progress - 0.28) / 0.72;
      const fade = Math.max(0, 1 - burstProg);
      const rad = 4 + burstProg * 28;
      ctx.globalAlpha = fade;
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2 + fw.seed;
        const sx = Math.round(bx + Math.cos(angle) * rad);
        const sy = Math.round(by + Math.sin(angle) * rad + burstProg * 6);
        ctx.fillStyle = i % 2 === 0 ? fw.color : fw.color2;
        ctx.fillRect(sx - 1, sy - 1, 2, 2);
      }
      ctx.globalAlpha = 1;
    }
  }
}

function drawTornado(ctx, d, view, time) {
  const cx = Math.round(d.x * T - view.x);
  const cy = Math.round(d.y * T - view.y);

  // Dark ground shadow
  ctx.fillStyle = 'rgba(20, 16, 30, 0.45)';
  ctx.beginPath();
  ctx.ellipse(cx, cy, 24, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  // Swirling multi-tier funnel
  for (let i = 0; i < 18; i++) {
    const frac = i / 17; // 0 at ground -> 1 at sky
    const y = cy - i * 4;
    const w = 6 + frac * 34 + Math.sin(time * 12 + i * 0.7) * 3;
    const sway = Math.sin(time * 9 + i * 0.5) * (4 + frac * 6);
    ctx.fillStyle = i % 3 === 0 ? 'rgba(130, 140, 165, 0.65)' : i % 3 === 1 ? 'rgba(90, 96, 120, 0.72)' : 'rgba(190, 200, 220, 0.55)';
    ctx.fillRect(Math.round(cx + sway - w / 2), y - 3, Math.round(w), 4);
  }

  // Orbiting debris specks
  for (let i = 0; i < 14; i++) {
    const angle = time * 8 + i * 1.1;
    const h = (i * 5 + time * 15) % 64;
    const rx = (8 + (h / 64) * 20) * Math.cos(angle);
    const ry = -h + Math.sin(angle) * 4;
    ctx.fillStyle = i % 2 ? '#d8c9a8' : '#7cc45a';
    ctx.fillRect(Math.round(cx + rx), Math.round(cy + ry), 2, 2);
  }

  // Wind streaks across screen
  ctx.fillStyle = 'rgba(220, 230, 245, 0.35)';
  for (let i = 0; i < 12; i++) {
    const sx = Math.round(((time * 220 + i * 73) % (view.width + 40)) - 20);
    const sy = Math.round((i * 47) % view.height);
    ctx.fillRect(sx, sy, 14, 1);
  }
}

function drawTsunami(ctx, d, view, time) {
  if (d.elapsed < d.warningSeconds) {
    const pulse = 0.14 + Math.sin(time * 8) * 0.08;
    ctx.fillStyle = 'rgba(40, 150, 220, ' + pulse + ')';
    ctx.fillRect(0, 0, view.width, view.height);
    return;
  }

  const waveTime = d.elapsed - d.warningSeconds;
  const sweepTime = Math.max(1, d.duration - d.warningSeconds);
  const progress = Math.min(1, waveTime / sweepTime);
  const waveDist = progress * d.maxDist;
  const wx = (d.originX + d.dirX * waveDist) * T - view.x;
  const wy = (d.originY + d.dirY * waveDist) * T - view.y;
  const px = -d.dirY;
  const py = d.dirX;
  const halfW = (d.width * T) / 2;

  ctx.save();
  ctx.translate(wx, wy);
  ctx.rotate(Math.atan2(py, px));
  // Massive surging wall of ocean water & white foam crest
  const grad = ctx.createLinearGradient(0, -28, 0, 24);
  grad.addColorStop(0, 'rgba(240, 250, 255, 0.92)');
  grad.addColorStop(0.25, 'rgba(90, 185, 245, 0.85)');
  grad.addColorStop(0.7, 'rgba(28, 95, 185, 0.82)');
  grad.addColorStop(1, 'rgba(18, 55, 130, 0.65)');
  ctx.fillStyle = grad;
  ctx.fillRect(-halfW, -24, halfW * 2, 48);

  // Frothy crest bubbles
  ctx.fillStyle = '#ffffff';
  for (let x = -halfW + 4; x < halfW - 4; x += 10) {
    const bob = Math.round(Math.sin(time * 10 + x * 0.2) * 3);
    ctx.fillRect(Math.round(x), -24 + bob, 6, 3);
  }
  ctx.restore();
}

// Drawn over everything (before night and weather): festival glow, fireworks, disasters.
export function drawSocietyEffects(ctx, game, view, time) {
  if (!game || !game.society) return;
  drawFestivalGlowAndFireworks(ctx, game, view, time);
  const d = game.society.disaster;
  if (!d) return;
  if (d.kind === 'tornado') drawTornado(ctx, d, view, time);
  else if (d.kind === 'tsunami') drawTsunami(ctx, d, view, time);
}
