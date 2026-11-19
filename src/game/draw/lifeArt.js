import { VILLAGES, zoneAt } from '../data/zones';
import { seasonOf, isNight } from '../logic/clock';
import { visibleVillagers } from '../logic/villagers';
import { ensureLife, ensureRunLife, isShopOpenNow } from '../logic/life/state';
import { TILE } from '../world/tileKinds';
import { tileAt, biomeAt } from '../world/map';
import { TILE_PX } from './tiles';
import { personSprite, walkPose } from './people';
import { animalSprite } from './animals';
import { makeGrid, dot, fillRect, addOutline, toCanvas, once } from './pixels';
import { OUTLINE, WOOD, STONE_RAMP } from './palette';

function drawFeetShadow(ctx, x, y, view) {
  ctx.fillStyle = 'rgba(14, 10, 24, 0.34)';
  ctx.fillRect(Math.round(x - 4 - view.x), Math.round(y - 2 - view.y), 8, 3);
}

const T = TILE_PX;

function isNear(view, x, y, w = 2, h = 2) {
  return x * T < view.x + view.width + 64 && (x + w) * T > view.x - 64 && y * T < view.y + view.height + 64 && (y + h) * T > view.y - 64;
}

function put(ctx, spr, x, y, view) {
  ctx.drawImage(spr.canvas, Math.round(x - spr.ax - view.x), Math.round(y - spr.ay - view.y));
}

function catSprite(color = '#e8963e', pose = 0) {
  return once('lifeCat|' + color + '|' + pose, () => {
    const grid = makeGrid(12, 10);
    fillRect(grid, 3, 4, 6, 4, color);
    fillRect(grid, 7, 2, 4, 4, color);
    dot(grid, 7, 1, color);
    dot(grid, 10, 1, color);
    dot(grid, 8, 3, '#7cfc9a');
    dot(grid, 10, 3, '#7cfc9a');
    fillRect(grid, pose ? 1 : 2, pose ? 2 : 3, 2, 1, color);
    return { canvas: toCanvas(addOutline(grid, OUTLINE)), ax: 6, ay: 9 };
  });
}

function whiteStagSprite() {
  return once('lifeWhiteStag', () => {
    const grid = makeGrid(26, 26);
    const white = '#f4f8ff';
    const silver = '#cad8f0';
    fillRect(grid, 5, 13, 13, 6, white);
    fillRect(grid, 6, 17, 11, 2, silver);
    fillRect(grid, 15, 7, 4, 7, white);
    fillRect(grid, 17, 6, 5, 3, white);
    fillRect(grid, 16, 1, 1, 5, '#fff6c8');
    fillRect(grid, 19, 1, 1, 5, '#fff6c8');
    fillRect(grid, 14, 2, 7, 1, '#fff6c8');
    fillRect(grid, 6, 19, 2, 5, silver);
    fillRect(grid, 15, 19, 2, 5, silver);
    dot(grid, 20, 7, '#7fd6ff');
    return { canvas: toCanvas(addOutline(grid, '#2c3d66')), ax: 13, ay: 25 };
  });
}

function gravestoneSprite() {
  return once('lifeGrave', () => {
    const grid = makeGrid(14, 16);
    fillRect(grid, 3, 3, 8, 10, STONE_RAMP[2]);
    fillRect(grid, 4, 2, 6, 2, STONE_RAMP[3]);
    fillRect(grid, 2, 12, 10, 3, STONE_RAMP[1]);
    fillRect(grid, 6, 5, 2, 5, STONE_RAMP[4]);
    fillRect(grid, 5, 6, 4, 1, STONE_RAMP[4]);
    return { canvas: toCanvas(addOutline(grid, OUTLINE)), ax: 7, ay: 15 };
  });
}

function statueHeroSprite() {
  return once('lifeHeroStatue', () => {
    const grid = makeGrid(20, 28);
    fillRect(grid, 3, 21, 14, 6, STONE_RAMP[1]);
    fillRect(grid, 4, 20, 12, 2, STONE_RAMP[3]);
    fillRect(grid, 7, 9, 6, 11, STONE_RAMP[3]);
    fillRect(grid, 8, 4, 4, 5, STONE_RAMP[4]);
    fillRect(grid, 13, 3, 2, 12, '#ffd86b');
    fillRect(grid, 12, 11, 4, 1, '#ffd86b');
    return { canvas: toCanvas(addOutline(grid, OUTLINE)), ax: 10, ay: 27 };
  });
}

function scaffoldSprite(stage = 1) {
  return once('lifeScaffold|' + stage, () => {
    const grid = makeGrid(28, 28);
    if (stage >= 2) fillRect(grid, 4, 10, 20, 15, '#c9b393');
    if (stage >= 3) fillRect(grid, 2, 5, 24, 6, '#9c422c');
    fillRect(grid, 2, 2, 2, 25, WOOD.dark);
    fillRect(grid, 24, 2, 2, 25, WOOD.dark);
    fillRect(grid, 1, 12, 26, 2, WOOD.base);
    fillRect(grid, 1, 20, 26, 2, WOOD.base);
    return { canvas: toCanvas(addOutline(grid, OUTLINE)), ax: 14, ay: 27 };
  });
}

function borderTowerSprite() {
  return once('lifeBorderTower', () => {
    const grid = makeGrid(22, 32);
    fillRect(grid, 5, 10, 12, 20, WOOD.dark);
    fillRect(grid, 7, 12, 8, 16, WOOD.base);
    fillRect(grid, 3, 4, 16, 7, WOOD.light);
    fillRect(grid, 3, 2, 3, 3, STONE_RAMP[2]);
    fillRect(grid, 9, 2, 4, 3, STONE_RAMP[2]);
    fillRect(grid, 16, 2, 3, 3, STONE_RAMP[2]);
    fillRect(grid, 10, 16, 3, 4, '#241a18');
    return { canvas: toCanvas(addOutline(grid, OUTLINE)), ax: 11, ay: 31 };
  });
}

function treeStageSprite(kind = 'oak', stage = 0) {
  return once('lifeSapling|' + kind + '|' + stage, () => {
    const grid = makeGrid(24, 28);
    if (stage === 0) {
      fillRect(grid, 11, 21, 2, 5, WOOD.dark);
      fillRect(grid, 9, 18, 6, 4, '#5cc94c');
    } else if (stage === 1) {
      fillRect(grid, 10, 17, 4, 9, WOOD.base);
      fillRect(grid, 6, 10, 12, 9, '#48a842');
    } else {
      fillRect(grid, 9, 14, 6, 12, WOOD.dark);
      fillRect(grid, 3, 3, 18, 13, '#398c36');
      fillRect(grid, 6, 2, 12, 4, '#5ec454');
    }
    return { canvas: toCanvas(addOutline(grid, OUTLINE)), ax: 12, ay: 26 };
  });
}

function milestoneSprite() {
  return once('lifeMilestone', () => {
    const grid = makeGrid(14, 18);
    fillRect(grid, 6, 6, 2, 11, WOOD.dark);
    fillRect(grid, 2, 2, 10, 6, WOOD.light);
    fillRect(grid, 3, 4, 8, 1, '#5a3a22');
    return { canvas: toCanvas(addOutline(grid, OUTLINE)), ax: 7, ay: 17 };
  });
}

function wagonSprite(color = '#8a2be2', furniture = false) {
  return once('lifeWagon|' + color + '|' + (furniture ? 1 : 0), () => {
    const grid = makeGrid(30, 22);
    fillRect(grid, 3, 6, 24, 11, color);
    if (furniture) {
      fillRect(grid, 5, 2, 6, 5, '#b8763e'); // oak chest
      fillRect(grid, 14, 1, 5, 6, '#d89b52'); // chair back & seat
    } else {
      fillRect(grid, 4, 3, 22, 3, '#ffd23f');
    }
    fillRect(grid, 2, 16, 26, 3, WOOD.dark);
    fillRect(grid, 6, 17, 4, 4, WOOD.base);
    fillRect(grid, 20, 17, 4, 4, WOOD.base);
    return { canvas: toCanvas(addOutline(grid, OUTLINE)), ax: 15, ay: 21 };
  });
}

// Ground-level worn trampled grass paths (#93), overflowing river ripples (#44), puddles (#44) & coastal surf (#55).
export function drawLifeGround(ctx, game, view, time) {
  if (!game?.player) return;
  const zone = zoneAt(game.player.x, game.player.y);
  if (zone.kind === 'inside') return;
  const life = ensureLife(game);
  const rl = ensureRunLife(game);
  const now = Date.now();

  // Trampled earth footsteps along worn grass (#93)
  for (const wt of life.wornTiles || []) {
    const hits = wt.hits || wt.count || 0;
    if (hits < 1 || !isNear(view, wt.x, wt.y, 1, 1)) continue;
    const px = Math.round(wt.x * T - view.x);
    const py = Math.round(wt.y * T - view.y);
    const alpha = Math.min(0.45, 0.14 + hits * 0.04);
    ctx.fillStyle = 'rgba(132, 98, 62, ' + alpha.toFixed(2) + ')';
    ctx.fillRect(px + 3, py + 5, 9, 6);
  }

  // Flooded Riverbanks (#44)
  if (rl.riverFlooded) {
    const startX = Math.floor(view.x / T);
    const startY = Math.floor(view.y / T);
    const cols = Math.ceil(view.width / T) + 2;
    const rows = Math.ceil(view.height / T) + 2;
    for (let ty = startY; ty < startY + rows; ty += 2) {
      for (let tx = startX; tx < startX + cols; tx += 2) {
        if (tileAt(tx, ty) !== TILE.WATER && (tileAt(tx + 1, ty) === TILE.WATER || tileAt(tx, ty + 1) === TILE.WATER)) {
          ctx.fillStyle = 'rgba(84, 152, 224, 0.34)';
          ctx.fillRect(Math.round(tx * T - view.x), Math.round(ty * T - view.y), T, T - 2);
        }
      }
    }
  }

  // Coastal surf foam (#55)
  if (biomeAt(game.player.x, game.player.y) === 'coast') {
    const startX = Math.floor(view.x / T);
    const startY = Math.floor(view.y / T);
    const cols = Math.ceil(view.width / T) + 2;
    const rows = Math.ceil(view.height / T) + 2;
    for (let ty = startY; ty < startY + rows; ty += 2) {
      for (let tx = startX; tx < startX + cols; tx += 2) {
        if (tileAt(tx, ty) === TILE.WATER && tileAt(tx, ty - 1) === TILE.SAND) {
          const wave = Math.sin(time * 2.5 + tx * 0.4) * 2;
          ctx.fillStyle = 'rgba(230, 248, 255, 0.55)';
          ctx.fillRect(Math.round(tx * T - view.x), Math.round(ty * T + wave - view.y), T + 4, 2);
        }
      }
    }
  }

  // Reflective rain puddles (#44)
  if (now < (life.puddlesUntil || 0) || game.weather?.kind === 'rain' || game.weather?.kind === 'storm') {
    const bx0 = Math.floor(view.x / T / 4) * 4;
    const by0 = Math.floor(view.y / T / 4) * 4;
    for (let y = by0; y < by0 + 28; y += 5) {
      for (let x = bx0; x < bx0 + 36; x += 6) {
        const t = tileAt(x, y);
        if (t !== TILE.GRASS && t !== TILE.PATH) continue;
        const px = Math.round(x * T - view.x);
        const py = Math.round(y * T - view.y);
        ctx.fillStyle = 'rgba(92, 164, 232, 0.42)';
        ctx.fillRect(px + 2, py + 5, 9, 4);
        ctx.fillStyle = 'rgba(220, 244, 255, 0.48)';
        ctx.fillRect(px + 4, py + 6, 3, 1);
      }
    }
  }
}

export function lifeDrawings(game, view, time) {
  if (!game?.player) return [];
  if (zoneAt(game.player.x, game.player.y).kind === 'inside') return [];
  const life = ensureLife(game);
  const rl = ensureRunLife(game);
  const list = [];

  // Elder porch benches (#9)
  for (const b of rl.porchBenches || []) {
    if (!isNear(view, b.x - 1, b.y - 1, 2, 2)) continue;
    list.push({
      y: b.y - 0.15,
      draw: (ctx) => {
        const px = Math.round(b.x * T - view.x);
        const py = Math.round(b.y * T - view.y);
        ctx.fillStyle = '#5a3a22';
        ctx.fillRect(px - 7, py - 4, 14, 3);
        ctx.fillStyle = '#8a5a30';
        ctx.fillRect(px - 7, py - 7, 14, 3);
      },
    });
  }

  // Frontier Fortified Watchtowers (#62)
  for (const twr of life.borderTowers || []) {
    if (!isNear(view, twr.x - 2, twr.y - 2, 4, 4)) continue;
    list.push({
      y: twr.y + 0.5,
      draw: (ctx) => put(ctx, borderTowerSprite(), twr.x * T, twr.y * T, view),
    });
  }

  // Roof Cats (#7)
  for (const c of rl.roofCats) {
    if (!isNear(view, c.x - 1, c.y - 1, 2, 2)) continue;
    list.push({
      y: c.y + 0.2,
      draw: (ctx) => put(ctx, catSprite(c.color, Math.sin(time * 2 + c.phase) > 0 ? 1 : 0), c.x * T, c.y * T, view),
    });
  }

  // Town Dogs (#7), Night Foxes (#42), Farm Rabbits (#42)
  for (const d of rl.townDogs) {
    if (!isNear(view, d.x - 1, d.y - 1, 2, 2)) continue;
    list.push({
      y: d.y,
      draw: (ctx) => put(ctx, animalSprite('shepherdDog', d.dir || 'right', Math.floor(d.step || time * 4) % 2), d.x * T, d.y * T, view),
    });
  }
  for (const fox of rl.nightFoxes || []) {
    if (!isNear(view, fox.x - 1, fox.y - 1, 2, 2)) continue;
    list.push({
      y: fox.y,
      draw: (ctx) => put(ctx, animalSprite('fox', fox.dir || 'right', Math.floor(fox.step || time * 5) % 2), fox.x * T, fox.y * T, view),
    });
  }
  for (const rab of rl.fieldRabbits || []) {
    if (!isNear(view, rab.x - 1, rab.y - 1, 2, 2)) continue;
    list.push({
      y: rab.y,
      draw: (ctx) => put(ctx, animalSprite('rabbitBrown', rab.dir || 'right', Math.floor(time * 4) % 2), rab.x * T, rab.y * T, view),
    });
  }

  // Ground Scattering Songbirds (#41)
  for (const b of rl.groundBirds || []) {
    if (!isNear(view, b.x - 1, b.y - 1, 2, 2)) continue;
    const alt = b.flying ? Math.round(b.age * 16) : Math.round(Math.abs(Math.sin(time * 5 + b.x)) * 2);
    list.push({
      y: b.y,
      draw: (ctx) => {
        const px = Math.round(b.x * T - view.x);
        const py = Math.round(b.y * T - view.y);
        if (b.flying) drawFeetShadow(ctx, b.x * T, b.y * T, view);
        ctx.fillStyle = b.color;
        ctx.fillRect(px - 2, py - 2 - alt, 5, 3);
        ctx.fillStyle = '#fff6c8';
        ctx.fillRect(px + (b.vx >= 0 ? 3 : -3), py - 2 - alt, 2, 1);
      },
    });
  }

  // Bird Nests (#43), Hunter Carcass (#59), Post-Rain Mushrooms (#54), Broken Fences (#51)
  for (const ns of rl.birdNests || []) {
    if (!isNear(view, ns.x - 1, ns.y - 1, 2, 2)) continue;
    list.push({
      y: ns.y,
      draw: (ctx) => {
        const px = Math.round(ns.x * T - view.x);
        const py = Math.round(ns.y * T - view.y);
        ctx.fillStyle = '#8a6236';
        ctx.fillRect(px - 4, py - 2, 8, 3);
        ctx.fillStyle = '#e8f4ff';
        ctx.fillRect(px - 2, py - 3, 2, 2);
        ctx.fillRect(px + 1, py - 3, 2, 2);
      },
    });
  }
  for (const crc of rl.hunterCarcasses || []) {
    if (crc.gathered || !isNear(view, crc.x - 1, crc.y - 1, 2, 2)) continue;
    list.push({
      y: crc.y,
      draw: (ctx) => {
        const px = Math.round(crc.x * T - view.x);
        const py = Math.round(crc.y * T - view.y);
        ctx.fillStyle = '#8b4528';
        ctx.fillRect(px - 5, py - 3, 10, 5);
        ctx.fillStyle = '#f2ece0';
        ctx.fillRect(px + 4, py - 2, 3, 2);
      },
    });
  }
  for (const m of life.rainMushrooms || []) {
    if (!isNear(view, m.x - 1, m.y - 1, 2, 2)) continue;
    list.push({
      y: m.y,
      draw: (ctx) => {
        const px = Math.round(m.x * T - view.x);
        const py = Math.round(m.y * T - view.y);
        ctx.fillStyle = '#f6efe0';
        ctx.fillRect(px - 1, py - 2, 2, 3);
        ctx.fillStyle = '#d9483b';
        ctx.fillRect(px - 3, py - 5, 6, 3);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(px - 2, py - 4, 1, 1);
        ctx.fillRect(px + 1, py - 4, 1, 1);
      },
    });
  }
  for (const bf of life.brokenFences || []) {
    if (bf.repaired || !isNear(view, bf.x - 1, bf.y - 1, 2, 2)) continue;
    list.push({
      y: bf.y,
      draw: (ctx) => {
        const px = Math.round(bf.x * T - view.x);
        const py = Math.round(bf.y * T - view.y);
        ctx.fillStyle = '#6b4423';
        ctx.fillRect(px - 6, py - 5, 3, 6);
        ctx.fillRect(px + 3, py - 3, 3, 5);
        ctx.fillStyle = '#9c6b3e';
        ctx.fillRect(px - 6, py - 2, 12, 2);
      },
    });
  }

  // Performers, Lamplighter, Pickpockets, Newcomer Cart, Funeral Procession, Washerwoman, Crier, Guard Relief
  const folk = [...rl.performers, ...rl.pickpockets];
  if (rl.lamplighter) folk.push(rl.lamplighter);
  for (let i = 0; i < folk.length; i++) {
    const p = folk[i];
    if (!isNear(view, p.x - 2, p.y - 2, 4, 4)) continue;
    list.push({
      y: p.y,
      draw: (ctx) => {
        if (p.kind === 'newcomerCart') put(ctx, wagonSprite('#4f7a9a', true), (p.x - 1.3) * T, p.y * T, view);
        if (p.kind === 'washer') {
          const wx = Math.round((p.x + 0.6) * T - view.x);
          const wy = Math.round(p.y * T - view.y);
          ctx.fillStyle = '#7c4e2a';
          ctx.fillRect(wx - 4, wy - 4, 8, 5);
          ctx.fillStyle = '#e8f6ff';
          ctx.fillRect(wx - 3, wy - 5, 6, 2);
        }
        drawFeetShadow(ctx, p.x * T, p.y * T, view);
        put(ctx, personSprite(p.look, p.dir || 'down', walkPose(p.step || 0, p.walking, time, i)), p.x * T, p.y * T, view);
      },
    });
  }

  // Scaffolds (#25, #32), Graves (#23), Hero Statues (#71), Planted Trees (#95), Fallen Branches (#51), Traps (#59), Milestones (#81)
  for (const site of life.constructions) {
    if (!isNear(view, site.x - 1, site.y - 2, 3, 3)) continue;
    list.push({ y: site.y + 0.5, draw: (ctx) => put(ctx, scaffoldSprite(site.stage), site.x * T, site.y * T, view) });
  }
  for (const grv of life.graves) {
    if (!isNear(view, grv.x - 1, grv.y - 2, 2, 2)) continue;
    list.push({ y: grv.y, draw: (ctx) => put(ctx, gravestoneSprite(), grv.x * T, grv.y * T, view) });
  }
  for (const st of life.statues) {
    if (!isNear(view, st.x - 1, st.y - 2, 2, 2)) continue;
    list.push({ y: st.y, draw: (ctx) => put(ctx, statueHeroSprite(), st.x * T, st.y * T, view) });
  }
  for (const t of life.plantedTrees) {
    if (!isNear(view, t.x - 1, t.y - 2, 2, 2)) continue;
    if (t.stage >= 3) {
      list.push({
        y: t.y,
        draw: (ctx) => {
          const px = Math.round(t.x * T - view.x);
          const py = Math.round(t.y * T - view.y);
          ctx.fillStyle = '#4f2f19';
          ctx.fillRect(px - 3, py - 14, 6, 14);
          ctx.fillStyle = '#2d7a2d';
          ctx.fillRect(px - 10, py - 26, 20, 14);
        },
      });
    } else {
      list.push({ y: t.y, draw: (ctx) => put(ctx, treeStageSprite(t.kind, t.stage), t.x * T, t.y * T, view) });
    }
  }
  for (const b of life.fallenBranches) {
    if (!isNear(view, b.x - 1, b.y - 1, 2, 2)) continue;
    list.push({
      y: b.y,
      draw: (ctx) => {
        const px = Math.round(b.x * T - view.x);
        const py = Math.round(b.y * T - view.y);
        ctx.fillStyle = '#5a3a22';
        ctx.fillRect(px - 7, py - 3, 14, 4);
        ctx.fillStyle = '#488c38';
        ctx.fillRect(px + 2, py - 6, 5, 3);
      },
    });
  }
  for (const tr of rl.forestTraps) {
    if (!isNear(view, tr.x - 1, tr.y - 1, 2, 2)) continue;
    list.push({
      y: tr.y,
      draw: (ctx) => {
        const px = Math.round(tr.x * T - view.x);
        const py = Math.round(tr.y * T - view.y);
        ctx.fillStyle = '#4f5a66';
        ctx.fillRect(px - 4, py - 2, 8, 3);
        if (tr.sprung) {
          ctx.fillStyle = '#ffd23f';
          ctx.fillRect(px - 1, py - 4, 2, 2);
        }
      },
    });
  }
  for (const m of rl.milestones) {
    if (!isNear(view, m.x - 1, m.y - 2, 2, 2)) continue;
    list.push({ y: m.y, draw: (ctx) => put(ctx, milestoneSprite(), m.x * T, m.y * T, view) });
  }

  // War Entities (#61-#73) & Road Events (#76-#88)
  for (let i = 0; i < rl.warEntities.length; i++) {
    const w = rl.warEntities[i];
    if (!isNear(view, w.x - 2, w.y - 2, 4, 4)) continue;
    list.push({
      y: w.y,
      draw: (ctx) => {
        if (w.kind === 'refugee') put(ctx, wagonSprite('#7a5a3a'), (w.x - 1.2) * T, w.y * T, view);
        drawFeetShadow(ctx, w.x * T, w.y * T, view);
        put(ctx, personSprite(w.look, w.dir || 'right', walkPose(w.step || 0, true, time, i)), w.x * T, w.y * T, view);
      },
    });
  }
  for (let i = 0; i < rl.roadEvents.length; i++) {
    const ev = rl.roadEvents[i];
    if (ev.solved || !isNear(view, ev.x - 2, ev.y - 2, 4, 4)) continue;
    list.push({
      y: ev.y,
      draw: (ctx) => {
        if (ev.kind === 'circus') put(ctx, wagonSprite('#9e28b5'), (ev.x - 1.3) * T, ev.y * T, view);
        if (ev.kind === 'royalCarriage') put(ctx, wagonSprite('#b8253f'), (ev.x - 1.3) * T, ev.y * T, view);
        if (ev.kind === 'drover') put(ctx, animalSprite('sheep', 'right', Math.floor(time * 2) % 2), (ev.x + 1.2) * T, ev.y * T, view);
        if (ev.kind === 'campfire') {
          const cx = Math.round((ev.x + 0.8) * T - view.x);
          const cy = Math.round(ev.y * T - view.y);
          ctx.fillStyle = '#5a3a22';
          ctx.fillRect(cx - 4, cy - 2, 8, 3);
          ctx.fillStyle = '#ff8c32';
          ctx.fillRect(cx - 2, cy - 5, 4, 4);
        }
        if (ev.kind === 'tollGate') {
          const cx = Math.round((ev.x - 1) * T - view.x);
          const cy = Math.round(ev.y * T - view.y);
          ctx.fillStyle = '#4a4e5c';
          ctx.fillRect(cx - 6, cy - 12, 12, 12);
          ctx.fillStyle = '#d9b44a';
          ctx.fillRect(cx + 6, cy - 5, 14, 2);
        }
        drawFeetShadow(ctx, ev.x * T, ev.y * T, view);
        put(ctx, personSprite(ev.look, ev.dir || 'down', walkPose(ev.step || 0, ev.kind !== 'campfire' && ev.kind !== 'tollGate', time, i + 40)), ev.x * T, ev.y * T, view);
      },
    });
  }

  if (rl.whiteStagEntity && isNear(view, rl.whiteStagEntity.x - 2, rl.whiteStagEntity.y - 2, 4, 4)) {
    const ws = rl.whiteStagEntity;
    list.push({
      y: ws.y,
      draw: (ctx) => {
        drawFeetShadow(ctx, ws.x * T, ws.y * T, view);
        put(ctx, whiteStagSprite(), ws.x * T, ws.y * T, view);
      },
    });
  }

  for (const fr of rl.pondFrogs) {
    if (!isNear(view, fr.x - 1, fr.y - 1, 2, 2)) continue;
    list.push({
      y: fr.y,
      draw: (ctx) => {
        const hop = Math.round(Math.abs(Math.sin(time * 3 + fr.phase)) * 3);
        put(ctx, animalSprite('frog', 'right', 0), fr.x * T, fr.y * T - hop, view);
      },
    });
  }
  for (const jf of rl.jumpingFish) {
    if (!isNear(view, jf.x - 1, jf.y - 1, 2, 2)) continue;
    const p = jf.age / jf.life;
    const arc = Math.round(Math.sin(p * Math.PI) * 14);
    list.push({
      y: jf.y,
      draw: (ctx) => {
        const px = Math.round(jf.x * T - view.x);
        const py = Math.round(jf.y * T - view.y);
        ctx.fillStyle = '#9ee6ff';
        ctx.fillRect(px - 2, py - arc, 5, 3);
        ctx.fillStyle = 'rgba(220, 246, 255, 0.7)';
        ctx.fillRect(px - 4, py, 9, 1);
      },
    });
  }

  return list;
}

export function drawLifeEffects(ctx, game, view, time) {
  if (!game?.player) return;
  if (zoneAt(game.player.x, game.player.y).kind === 'inside') return;
  const life = ensureLife(game);
  const season = seasonOf(game);
  const openShop = isShopOpenNow(game);
  const raid = Boolean(game.raid?.active);
  const now = Date.now();

  for (const v of VILLAGES) {
    if (!isNear(view, v.x, v.y, v.w, v.h)) continue;
    const houses = v.plan?.houses || [];
    const conquered = game.villages?.[v.id]?.owner === 'monsters';
    const mourning = life.graves.some((g) => g.villageId === v.id && (game.day || 1) <= (g.mourningUntil || 0));

    for (let i = 0; i < houses.length; i++) {
      const h = houses[i];
      if (!isNear(view, h.x - 1, h.y - 1, h.w + 2, h.h + 2)) continue;
      const hx = Math.round((h.x + h.w / 2) * T - view.x);
      const hy = Math.round((h.y + h.h - 1) * T - view.y);
      const abandoned = (life.abandonedHouses || []).some((a) => a.villageId === v.id && a.x === h.x && a.y === h.y);

      // Winter Snow Frost Roof Caps (#90, #50)
      if (season === 'Winter' && h.style !== 'tent' && !conquered) {
        const rx = Math.round(h.x * T - view.x);
        const ry = Math.round(h.y * T - view.y);
        ctx.fillStyle = 'rgba(242, 248, 255, 0.85)';
        ctx.fillRect(rx + 2, ry + 1, Math.max(8, h.w * T - 4), 4);
      }

      // Abandoned boarded house doors (#16)
      if (abandoned) {
        ctx.fillStyle = '#3e2718';
        ctx.fillRect(hx - 5, hy - 6, 10, 2);
        ctx.fillRect(hx - 4, hy - 3, 8, 2);
      }

      // Charred Soot & Burned Beams on Monster-Conquered Towns (#64)
      if (conquered) {
        ctx.fillStyle = 'rgba(22, 18, 24, 0.52)';
        ctx.fillRect(Math.round(h.x * T - view.x) + 2, Math.round(h.y * T - view.y) + 2, h.w * T - 4, h.h * T - 4);
      }

      if (raid && h.style !== 'tent') {
        ctx.fillStyle = '#2d1c12';
        ctx.fillRect(hx - 10, hy - 8, 5, 6);
        ctx.fillRect(hx + 6, hy - 8, 5, 6);
      }
      if (mourning && i === 0) {
        ctx.fillStyle = '#18141c';
        ctx.fillRect(hx - 12, hy - 14, 4, 10);
      }
      if (['potions', 'armory', 'arcane', 'market', 'bakery', 'weaver', 'carpenter', 'forge', 'inn'].includes(h.role)) {
        ctx.fillStyle = '#2a1d14';
        ctx.fillRect(hx + 9, hy - 10, 12, 6);
        ctx.fillStyle = openShop ? '#66e07a' : '#ff6b7a';
        ctx.fillRect(hx + 10, hy - 9, 10, 4);
      }
      if (i % 3 === 0 && h.style !== 'tent' && !abandoned) {
        if (season === 'Spring') {
          ctx.fillStyle = '#ff8ca8';
          ctx.fillRect(hx - 6, hy - 13, 3, 2);
          ctx.fillStyle = '#7cfc9a';
          ctx.fillRect(hx + 4, hy - 13, 3, 2);
        } else if (season === 'Summer') {
          ctx.fillStyle = '#ffd23f';
          ctx.fillRect(hx - 6, hy - 14, 3, 4);
        } else if (season === 'Autumn') {
          ctx.fillStyle = '#e86a1c';
          ctx.fillRect(hx - 14, hy + 2, 5, 4);
        } else if (season === 'Winter') {
          ctx.fillStyle = '#9ee6ff';
          ctx.fillRect(hx - 8, hy - 13, 16, 1);
          ctx.fillStyle = '#fff6c8';
          ctx.fillRect(hx - 6, hy - 12, 2, 2);
          ctx.fillRect(hx + 5, hy - 12, 2, 2);
        }
      }
      if (i % 4 === 1 && !abandoned && !isNight(game) && game.weather?.kind === 'clear' && houses[i + 1] && Math.abs(houses[i + 1].x - (h.x + h.w)) <= 5 && Math.abs(houses[i + 1].y - h.y) <= 1) {
        const x1 = Math.round((h.x + h.w) * T - view.x);
        const x2 = Math.round(houses[i + 1].x * T - view.x);
        const ly = Math.round((h.y + 1.5) * T - view.y);
        ctx.fillStyle = '#e6dec8';
        ctx.fillRect(x1, ly, Math.max(4, x2 - x1), 1);
        const sway = Math.round(Math.sin(time * 3 + i) * 1);
        ctx.fillStyle = '#8cbcff';
        ctx.fillRect(x1 + 4 + sway, ly + 1, 5, 5);
        ctx.fillStyle = '#ff9bb4';
        ctx.fillRect(x1 + 12 + sway, ly + 1, 5, 5);
      }
    }
  }

  // Spring Petal Breeze (#90)
  if (season === 'Spring' && !isNight(game) && game.weather?.kind === 'clear') {
    ctx.fillStyle = 'rgba(255, 168, 198, 0.72)';
    for (let p = 0; p < 10; p++) {
      const px = Math.round(((time * 24 + p * 67) % Math.max(120, view.width)));
      const py = Math.round(((time * 14 + p * 43) % Math.max(120, view.height)));
      ctx.fillRect(px, py, 2, 2);
    }
  }

  // Carried tools & Winter icy breath puffs (#12, #50, #90)
  for (const v of visibleVillagers(game)) {
    if (!isNear(view, v.x - 1, v.y - 2, 2, 2)) continue;
    const vx = Math.round(v.x * T - view.x);
    const vy = Math.round(v.y * T - view.y - 6);
    if (season === 'Winter' && (game.hour < 9 || isNight(game))) {
      const puff = (time * 0.9 + (v.x || 0)) % 1;
      ctx.fillStyle = 'rgba(230, 244, 255, ' + (0.45 * (1 - puff)).toFixed(2) + ')';
      ctx.fillRect(vx + 2, vy - 10 - Math.round(puff * 5), 2, 2);
    }
    if (!v.carry) continue;
    if (v.carry === 'bucket') {
      ctx.fillStyle = '#7a8a9e';
      ctx.fillRect(vx + 4, vy, 4, 4);
    } else if (v.carry === 'flour' || v.carry === 'bread') {
      ctx.fillStyle = v.carry === 'bread' ? '#d98a38' : '#f6efe0';
      ctx.fillRect(vx + 3, vy - 2, 5, 4);
    } else if (v.carry === 'firewood') {
      ctx.fillStyle = '#7c4e2a';
      ctx.fillRect(vx - 6, vy - 1, 5, 3);
    } else if (v.carry === 'fishBasket') {
      ctx.fillStyle = '#b88248';
      ctx.fillRect(vx - 6, vy, 5, 4);
    } else if (v.carry === 'herbs') {
      ctx.fillStyle = '#4ec45a';
      ctx.fillRect(vx + 3, vy - 1, 4, 4);
    } else if (v.carry === 'rod') {
      ctx.fillStyle = '#c89e5a';
      ctx.fillRect(vx + 4, vy - 8, 1, 10);
    }
  }

  // Chimney Hearth Smoke (#33) — skipped on abandoned dark houses (#16) and conquered villages (#64)
  if ((game.hour < 10 || game.hour >= 17 || season === 'Winter') && !raid) {
    for (const v of VILLAGES) {
      if (game.villages?.[v.id]?.owner === 'monsters' || !isNear(view, v.x, v.y, v.w, v.h)) continue;
      for (let i = 0; i < (v.plan?.houses || []).length; i += 2) {
        const h = v.plan.houses[i];
        const abandoned = (life.abandonedHouses || []).some((a) => a.villageId === v.id && a.x === h.x && a.y === h.y);
        if (abandoned || h.style === 'tent' || !isNear(view, h.x, h.y, h.w, h.h)) continue;
        const puff = (time * 0.45 + i * 0.3) % 1;
        const cx = Math.round((h.x + h.w * 0.75) * T + Math.sin(time * 1.5 + i) * 4 - view.x);
        const cy = Math.round((h.y + 0.5) * T - puff * 18 - view.y);
        ctx.fillStyle = 'rgba(235, 240, 248, ' + (0.48 * (1 - puff)).toFixed(2) + ')';
        ctx.fillRect(cx, cy, 3, 3);
      }
    }
  }

  // Horizon War Smoke Plumes (#65)
  if (VILLAGES.some((v) => game.villages?.[v.id]?.owner === 'monsters')) {
    for (let s = 0; s < 3; s++) {
      const lifePuff = (time * 0.16 + s * 0.33) % 1;
      const sx = Math.round(view.width * (0.25 + s * 0.25));
      const sy = Math.round(14 - lifePuff * 12);
      ctx.fillStyle = 'rgba(50, 44, 58, ' + (0.42 * (1 - lifePuff)).toFixed(2) + ')';
      ctx.fillRect(sx - 6, sy, 12, 5);
    }
  }

  // Post-Rain Sky Rainbow (#44, #99)
  if (now < (life.rainbowUntil || 0) && !isNight(game)) {
    const colors = ['rgba(255,90,90,0.22)', 'rgba(255,190,70,0.22)', 'rgba(255,255,100,0.22)', 'rgba(100,240,140,0.22)', 'rgba(110,180,255,0.22)', 'rgba(180,120,255,0.22)'];
    ctx.save();
    colors.forEach((c, idx) => {
      ctx.strokeStyle = c;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(view.width * 0.5, view.height * 0.48, view.width * 0.42 - idx * 2, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();
    });
    ctx.restore();
  }
}

export function writeLifeLabels(ctx, game, view, scale) {
  const rl = ensureRunLife(game);
  const life = ensureLife(game);

  for (const v of visibleVillagers(game)) {
    if (v.lifeBubble && Math.hypot(v.x - game.player.x, v.y - game.player.y) < 9) {
      writeBadge(ctx, v.lifeBubble, (v.x * T - view.x) * scale, (v.y * T - 34 - view.y) * scale, 11, '#fff6d8');
    }
  }
  for (const d of rl.townDogs) {
    if (d.shout && Math.hypot(d.x - game.player.x, d.y - game.player.y) < 10) {
      writeBadge(ctx, d.shout, (d.x * T - view.x) * scale, (d.y * T - 20 - view.y) * scale, 11, '#ffe680');
    }
  }
  for (const p of [...rl.performers, ...rl.pickpockets]) {
    if (p.shout && Math.hypot(p.x - game.player.x, p.y - game.player.y) < 10) {
      writeBadge(ctx, p.shout, (p.x * T - view.x) * scale, (p.y * T - 34 - view.y) * scale, 11, p.kind === 'pickpocket' ? '#ff6b7a' : '#b8ffd0');
    }
  }
  for (const m of rl.milestones) {
    if (Math.hypot(m.x - game.player.x, m.y - game.player.y) < 5.5) {
      writeBadge(ctx, '📍 ' + m.name + ' (' + m.paces + 'p)', (m.x * T - view.x) * scale, (m.y * T - 22 - view.y) * scale, 11, '#ffd86b');
    }
  }
  for (const grv of life.graves) {
    if (Math.hypot(grv.x - game.player.x, grv.y - game.player.y) < 4) {
      writeBadge(ctx, '🪦 ' + grv.name, (grv.x * T - view.x) * scale, (grv.y * T - 20 - view.y) * scale, 11, '#cfd6e6');
    }
  }
  for (const st of life.statues) {
    if (Math.hypot(st.x - game.player.x, st.y - game.player.y) < 5) {
      writeBadge(ctx, '🗿 ' + st.title, (st.x * T - view.x) * scale, (st.y * T - 32 - view.y) * scale, 11, '#ffd23f');
    }
  }
}

function writeBadge(ctx, text, x, y, size, color) {
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
