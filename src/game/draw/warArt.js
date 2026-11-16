import { VILLAGES, CAMPS, MONSTER_TOWNS } from '../data/zones';
import { npcOf } from '../data/npcs';
import { TILE_PX } from './tiles';
import { OUTLINE, WOOD, WOOD_RAMP, STONE_RAMP } from './palette';
import { makeGrid, dot, fillRect, fillEllipse, drawLine, fillTriangle, addOutline, mirrored, toCanvas, once, spriteOf } from './pixels';
import { personSprite, walkPose } from './people';
import { animalSprite } from './animals';
import { monsterSprite } from './monsters';
import * as props from './props';
import { isVillageUnderAttack } from '../logic/war/state';
import { cagePosOf, kidnappedIdsAt } from '../logic/war/bandits';

const T = TILE_PX;

function isNear(view, x, y, w = 2, h = 2) {
  return x * T < view.x + view.width + 48 && (x + w) * T > view.x - 48 && y * T < view.y + view.height + 64 && (y + h) * T > view.y - 48;
}

function put(ctx, sprite, x, y, view) {
  ctx.drawImage(sprite.canvas, Math.round(x - sprite.ax - view.x), Math.round(y - sprite.ay - view.y));
}

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

// ---------- Pixel sprites cached with once() ----------

function shadowSprite() {
  return once('warShadow', () => {
    const grid = makeGrid(12, 5);
    fillEllipse(grid, 6, 2.5, 6, 2.5, '#14101e55');
    return { canvas: toCanvas(grid), ax: 6, ay: 3 };
  });
}

function graveSprite() {
  return once('warGrave', () => {
    const grid = makeGrid(16, 18);
    fillEllipse(grid, 8, 14, 6, 2.5, '#6b4a2c'); // earth mound
    fillEllipse(grid, 8, 13.5, 5, 2, '#8a623c');
    fillRect(grid, 7, 2, 2, 11, WOOD_RAMP[2]); // wooden cross
    fillRect(grid, 4, 5, 8, 2, WOOD_RAMP[3]);
    dot(grid, 7, 2, WOOD_RAMP[4]);
    return { canvas: toCanvas(addOutline(grid, OUTLINE)), ax: 8, ay: 16 };
  });
}

function caravanPackSprite() {
  return once('warPack', () => {
    const grid = makeGrid(14, 12);
    fillRect(grid, 1, 3, 12, 7, WOOD.base);
    fillRect(grid, 1, 3, 12, 2, WOOD.light);
    fillRect(grid, 2, 1, 5, 3, '#d8b46a'); // sack
    fillRect(grid, 7, 2, 5, 2, '#b84040'); // rolled cloth
    fillRect(grid, 5, 3, 1, 7, '#4f2e17');
    return { canvas: toCanvas(addOutline(grid, OUTLINE)), ax: 7, ay: 10 };
  });
}

function pitchforkSprite(dir) {
  return once('warPitchfork' + dir, () => {
    const grid = makeGrid(12, 22);
    if (dir === 'left' || dir === 'right') {
      drawLine(grid, 1, 16, 9, 5, WOOD_RAMP[3]); // angled shaft
      drawLine(grid, 8, 4, 11, 7, STONE_RAMP[4]); // crossbar
      drawLine(grid, 9, 4, 11, 1, '#e8eef7'); // prongs
      drawLine(grid, 10, 5, 11, 2, '#e8eef7');
      drawLine(grid, 7, 5, 9, 2, '#e8eef7');
      const final = dir === 'left' ? mirrored(grid) : grid;
      return { canvas: toCanvas(addOutline(final, OUTLINE)), ax: dir === 'left' ? 10 : 2, ay: 18 };
    }
    fillRect(grid, 5, 6, 2, 15, WOOD_RAMP[3]);
    fillRect(grid, 3, 5, 6, 2, STONE_RAMP[4]);
    fillRect(grid, 3, 1, 1, 4, '#e8eef7');
    fillRect(grid, 5, 0, 2, 5, '#e8eef7');
    fillRect(grid, 8, 1, 1, 4, '#e8eef7');
    return { canvas: toCanvas(addOutline(grid, OUTLINE)), ax: 6, ay: 20 };
  });
}

function spearSprite(dir) {
  return once('warSpear' + dir, () => {
    const grid = makeGrid(12, 22);
    if (dir === 'left' || dir === 'right') {
      drawLine(grid, 1, 16, 9, 5, WOOD_RAMP[2]);
      fillTriangle(grid, [8, 4], [11, 1], [11, 6], () => '#e8eef7');
      const final = dir === 'left' ? mirrored(grid) : grid;
      return { canvas: toCanvas(addOutline(final, OUTLINE)), ax: dir === 'left' ? 10 : 2, ay: 18 };
    }
    fillRect(grid, 5, 5, 2, 16, WOOD_RAMP[2]);
    fillTriangle(grid, [4, 5], [6, 0], [8, 5], () => '#e8eef7');
    return { canvas: toCanvas(addOutline(grid, OUTLINE)), ax: 6, ay: 20 };
  });
}

function rallyBubbleSprite() {
  return once('warRally', () => {
    const rows = [
      '.YYYYY.',
      'YWWWWWY',
      'YWYYYWY',
      'YWYWWWY',
      'YWWWWWY',
      '.YYYYY.',
      '...Y...',
    ];
    return { canvas: spriteOf(rows, { Y: '#ffd23f', W: '#fff6c8' }, OUTLINE), ax: 4, ay: 8 };
  });
}

function swordsBubbleSprite() {
  return once('warSwords', () => {
    const rows = [
      'R.....R',
      '.R...R.',
      '..R.R..',
      '...W...',
      '..R.R..',
      '.Y...Y.',
      'Y.....Y',
    ];
    return { canvas: spriteOf(rows, { R: '#ff5a6e', W: '#ffffff', Y: '#ffd23f' }, OUTLINE), ax: 4, ay: 8 };
  });
}

function cageBarsSprite() {
  return once('warCage', () => {
    const grid = makeGrid(24, 22);
    fillRect(grid, 1, 1, 22, 3, '#3a3442');
    fillRect(grid, 1, 19, 22, 2, '#3a3442');
    for (let x = 2; x <= 20; x += 4) fillRect(grid, x, 3, 2, 17, '#7a7286');
    fillRect(grid, 1, 10, 22, 2, '#5a5266');
    return { canvas: toCanvas(addOutline(grid, OUTLINE)), ax: 12, ay: 21 };
  });
}

function conqueredBannerSprite() {
  return once('warConqueredBanner', () => {
    const grid = makeGrid(14, 28);
    fillRect(grid, 6, 0, 2, 27, '#2a1a24');
    fillRect(grid, 2, 3, 10, 14, '#7a1220');
    fillTriangle(grid, [2, 17], [7, 22], [12, 17], () => '#7a1220');
    fillRect(grid, 5, 7, 4, 4, '#e6dcc4');
    dot(grid, 6, 8, '#1c1726');
    dot(grid, 8, 8, '#1c1726');
    return { canvas: toCanvas(addOutline(grid, OUTLINE)), ax: 7, ay: 27 };
  });
}

function drawHpBar(ctx, x, y, value, max, color = '#ff3b4f') {
  if (value >= max) return;
  ctx.fillStyle = '#1c1726';
  ctx.fillRect(x - 8, y, 16, 3);
  ctx.fillStyle = color;
  ctx.fillRect(x - 7, y + 1, Math.max(1, Math.round((14 * Math.max(0, value)) / max)), 1);
}

// ---------- Standing drawings sorted by Y ----------

function graveDrawings(game, view) {
  const graves = game.war && Array.isArray(game.war.graves) ? game.war.graves : [];
  return graves
    .filter((g) => isNear(view, g.x - 1, g.y - 1, 2, 2))
    .map((g) => ({
      y: g.y,
      draw: (ctx) => put(ctx, graveSprite(), g.x * T, g.y * T, view),
    }));
}

function corpseDrawings(game, view) {
  const corpses = game.war && Array.isArray(game.war.corpses) ? game.war.corpses : [];
  return corpses
    .filter((c) => isNear(view, c.x - 1, c.y - 1, 2, 2))
    .map((c) => ({
      y: c.y,
      draw: (ctx) => {
        const sprite = personSprite(c.look, 'down', 'stand');
        const px = Math.round(c.x * T - view.x);
        const py = Math.round(c.y * T - view.y);
        ctx.fillStyle = 'rgba(20, 16, 30, 0.35)';
        ctx.fillRect(px - 10, py - 3, 20, 5);
        ctx.save();
        ctx.translate(px, py - 2);
        ctx.rotate(-Math.PI / 2);
        ctx.drawImage(sprite.canvas, -sprite.canvas.height + 4, -sprite.canvas.width / 2);
        ctx.restore();
        if (c.kind === 'merchant') put(ctx, caravanPackSprite(), (c.x + 0.6) * T, c.y * T, view);
      },
    }));
}

function caravanDrawings(game, view, time) {
  const caravans = game.run && Array.isArray(game.run.caravans) ? game.run.caravans : [];
  const list = [];
  for (const c of caravans) {
    if (!c.alive || !isNear(view, c.x - 2, c.y - 2, 4, 4)) continue;
    const dir = c.dir === 'left' ? 'left' : 'right';
    const ox = dir === 'left' ? 0.9 : -0.9;
    list.push({
      y: c.y - 0.1,
      draw: (ctx) => {
        const hx = (c.x + ox) * T;
        const hy = (c.y - 0.1) * T;
        put(ctx, shadowSprite(), hx, hy, view);
        put(ctx, animalSprite('horse', dir, Math.floor(c.horseStep || 0) % 2), hx, hy, view);
        put(ctx, caravanPackSprite(), hx, hy - 11, view);
      },
    });
    list.push({
      y: c.y,
      draw: (ctx) => {
        const mx = c.x * T;
        const my = c.y * T;
        put(ctx, shadowSprite(), mx, my, view);
        put(ctx, personSprite(c.merchantLook, c.dir || 'down', walkPose(c.step, !c.underAttack, time, c.x)), mx, my, view);
        if (c.underAttack) {
          put(ctx, props.bubble('!'), mx, my - 34 + Math.round(Math.sin(time * 6) * 1.5), view);
          drawHpBar(ctx, Math.round(mx - view.x), Math.round(my - view.y - 38), c.hp, c.maxHp, '#7cfc9a');
        }
      },
    });
  }
  return list;
}

function defenderOverlayDrawings(game, view, time) {
  const villagers = game.run && Array.isArray(game.run.villagers) ? game.run.villagers : [];
  const list = [];
  for (const v of villagers) {
    if (!v.fighting || v.dead || v.ko || !isNear(view, v.x - 1, v.y - 2, 2, 2)) continue;
    list.push({
      y: v.y + 0.05,
      draw: (ctx) => {
        const px = v.x * T;
        const py = v.y * T;
        if (v.job === 'foreman') {
          ctx.strokeStyle = 'rgba(255, 210, 63, ' + (0.4 + Math.sin(time * 5) * 0.2) + ')';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(Math.round(px - view.x), Math.round(py - view.y), 10, 0, Math.PI * 2);
          ctx.stroke();
          put(ctx, rallyBubbleSprite(), px, py - 33 + Math.round(Math.sin(time * 5)), view);
        } else if (v.sex === 'man' && !v.knight) {
          const dir = v.dir || 'right';
          const handDx = dir === 'left' ? -6 : dir === 'right' ? 6 : 7;
          put(ctx, pitchforkSprite(dir), px + handDx, py - 2, view);
        }
      },
    });
  }
  return list;
}

function banditAndAmbushDrawings(game, view, time) {
  const runWar = game.run && game.run.war;
  if (!runWar) return [];
  const units = [...(runWar.campUnits || []), ...(runWar.ambushFoes || [])];
  const opponent = game.run.fight ? game.run.fight.opponent : null;
  return units
    .filter((u) => u.health > 0 && u !== opponent && isNear(view, u.x - 1, u.y - 2, 2, 2))
    .map((u, i) => ({
      y: u.y,
      draw: (ctx) => {
        const px = u.x * T;
        const py = u.y * T;
        put(ctx, shadowSprite(), px, py, view);
        if (u.species === 'bandit') {
          put(ctx, personSprite(u.look, u.dir || 'down', walkPose(u.step || 0, u.walking, time, i)), px, py, view);
          if (u.role === 'chief') put(ctx, props.bubble('!'), px, py - 34 + Math.round(Math.sin(time * 4)), view);
        } else {
          put(ctx, monsterSprite(u, u.dir === 'left' ? 'left' : 'right', Math.floor(time * 3 + i) % 2), px, py, view);
        }
        drawHpBar(ctx, Math.round(px - view.x), Math.round(py - view.y - 34), u.health, u.maxHealth);
      },
    }));
}

const PRISONER_LOOK = { skin: '#f3d2b3', hair: '#5a3a1e', style: 'short', eyes: '#3b3b3b', outfit: '#7a7a5a', trim: '#c9a227' };

function prisonerDrawings(game, view, time) {
  const list = [];
  const campsState = (game.war && game.war.camps) || {};
  for (const camp of CAMPS) {
    const pos = cagePosOf(camp);
    if (!isNear(view, pos.x - 2, pos.y - 2, 4, 4)) continue;
    const cState = campsState[camp.id];
    const kidnappedIds = kidnappedIdsAt(game, camp.id);
    if (cState && cState.freed && kidnappedIds.length === 0) continue;

    list.push({
      y: pos.y + 0.1,
      draw: (ctx) => {
        if (kidnappedIds.length > 0) {
          kidnappedIds.forEach((npcId, idx) => {
            const npc = npcOf(npcId);
            if (npc) put(ctx, personSprite(npc.look, 'down', Math.floor(time * 2 + idx) % 2 ? 'breath' : 'stand'), (pos.x - 0.3 + idx * 0.6) * T, pos.y * T, view);
          });
        } else {
          put(ctx, personSprite(PRISONER_LOOK, 'down', Math.floor(time * 2) % 2 ? 'breath' : 'stand'), pos.x * T, pos.y * T, view);
        }
        put(ctx, cageBarsSprite(), pos.x * T, (pos.y + 0.3) * T, view);
        put(ctx, props.bubble('?'), pos.x * T, pos.y * T - 34 + Math.round(Math.sin(time * 4)), view);
      },
    });
  }

  for (const town of MONSTER_TOWNS) {
    const kidnappedIds = kidnappedIdsAt(game, town.id);
    if (kidnappedIds.length === 0) continue;
    const pos = cagePosOf(town);
    if (!isNear(view, pos.x - 2, pos.y - 2, 4, 4)) continue;
    list.push({
      y: pos.y + 0.1,
      draw: (ctx) => {
        kidnappedIds.forEach((npcId, idx) => {
          const npc = npcOf(npcId);
          if (npc) put(ctx, personSprite(npc.look, 'down', 'stand'), (pos.x - 0.2 + idx * 0.5) * T, pos.y * T, view);
        });
        put(ctx, cageBarsSprite(), pos.x * T, (pos.y + 0.3) * T, view);
        put(ctx, props.bubble('!'), pos.x * T, pos.y * T - 34 + Math.round(Math.sin(time * 4)), view);
      },
    });
  }
  return list;
}

function skirmishDrawings(game, view, time) {
  const skirmishes = game.run && Array.isArray(game.run.skirmishes) ? game.run.skirmishes : [];
  const list = [];
  for (const s of skirmishes) {
    if (!isNear(view, s.x - 3, s.y - 3, 6, 6)) continue;
    const all = [...(s.fightersA || []), ...(s.fightersB || [])];
    all.forEach((f, idx) => {
      list.push({
        y: f.y,
        draw: (ctx) => {
          const px = f.x * T;
          const py = f.y * T;
          put(ctx, shadowSprite(), px, py, view);
          put(ctx, personSprite(f.look, f.dir, s.state === 'active' && Math.floor(time * 4 + idx) % 2 ? 'walk0' : 'stand'), px, py, view);
          if (s.state === 'active') put(ctx, spearSprite(f.dir), px + (f.dir === 'left' ? -6 : 6), py - 2, view);
        },
      });
    });
    if (s.state === 'active') {
      list.push({
        y: s.y + 0.5,
        draw: (ctx) => put(ctx, swordsBubbleSprite(), s.x * T, s.y * T - 30 + Math.round(Math.sin(time * 5) * 1.5), view),
      });
    }
  }
  return list;
}

function conqueredVillageDrawings(game, view) {
  const list = [];
  for (const v of VILLAGES) {
    const state = game.villages && game.villages[v.id];
    if (!state || state.owner !== 'monsters') continue;
    const center = { x: v.x + v.w / 2, y: v.y + v.h / 2 };
    if (dist(center, game.player) > 180) continue;
    const spots = [
      { x: center.x - 3, y: center.y - 2 },
      { x: center.x + 3, y: center.y - 2 },
    ];
    for (const sp of spots) {
      if (!isNear(view, sp.x - 1, sp.y - 2, 2, 3)) continue;
      list.push({
        y: sp.y,
        draw: (ctx) => put(ctx, conqueredBannerSprite(), sp.x * T, sp.y * T, view),
      });
    }
  }
  return list;
}

// The things standing on the map, sorted with the others: [{ y (feet line, in tiles), draw: (ctx) => {} }].
export function warDrawings(game, view, time) {
  if (!game || !game.war) return [];
  return [
    ...graveDrawings(game, view),
    ...corpseDrawings(game, view),
    ...caravanDrawings(game, view, time),
    ...defenderOverlayDrawings(game, view, time),
    ...banditAndAmbushDrawings(game, view, time),
    ...prisonerDrawings(game, view, time),
    ...skirmishDrawings(game, view, time),
    ...conqueredVillageDrawings(game, view),
  ];
}

// ---------- Overlays & projectiles ----------

function drawProjectile(ctx, proj, view, time) {
  const x = Math.round(proj.x * T - view.x);
  const y = Math.round(proj.y * T - view.y - 8);
  if (proj.kind === 'stone') {
    ctx.fillStyle = 'rgba(20, 16, 30, 0.35)';
    ctx.fillRect(x - 1, y + 7, 3, 1);
    ctx.fillStyle = '#5f5a66';
    ctx.fillRect(x - 2, y - 2, 4, 4);
    ctx.fillStyle = '#b3aeb8';
    ctx.fillRect(x - 1, y - 1, 2, 2);
  } else if (proj.kind === 'bolt') {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(proj.angle || 0);
    ctx.fillStyle = '#ffd23f';
    ctx.fillRect(-5, -1, 10, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(3, -1, 3, 2);
    ctx.restore();
  } else {
    // Thrown pitchfork spinning slightly in flight.
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((proj.angle || 0) + time * 12);
    ctx.fillStyle = '#8c582d';
    ctx.fillRect(-6, -1, 10, 2);
    ctx.fillStyle = '#e8eef7';
    ctx.fillRect(4, -3, 4, 1);
    ctx.fillRect(4, 0, 5, 1);
    ctx.fillRect(4, 2, 4, 1);
    ctx.restore();
  }
}

function drawEffect(ctx, fx, view) {
  const progress = Math.min(1, fx.age / Math.max(0.01, fx.life));
  const x = Math.round(fx.x * T - view.x);
  const y = Math.round(fx.y * T - view.y - 6);
  ctx.globalAlpha = 1 - progress;
  ctx.fillStyle = fx.color || '#ffd23f';
  if (fx.kind === 'muzzle') {
    ctx.fillRect(x - 4, y - 4, 8, 8);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x - 2, y - 2, 4, 4);
  } else {
    const r = Math.round(3 + progress * 6);
    ctx.fillRect(x - r, y, r * 2, 1);
    ctx.fillRect(x, y - r, 1, r * 2);
  }
  ctx.globalAlpha = 1;
}

// Drawn over everything (before the night and the weather): projectiles, sparks, siege alerts.
export function drawWarEffects(ctx, game, view, time) {
  if (!game || !game.run || !game.run.war) return;
  const runWar = game.run.war;

  for (const proj of runWar.projectiles || []) {
    if (isNear(view, proj.x - 1, proj.y - 1, 2, 2)) drawProjectile(ctx, proj, view, time);
  }
  for (const fx of runWar.effects || []) {
    if (isNear(view, fx.x - 1, fx.y - 1, 2, 2)) drawEffect(ctx, fx, view);
  }

  // Subtle amber edge glow when a nearby village is under siege (and story raid isn't active).
  const siegeNear = VILLAGES.some((v) => isVillageUnderAttack(game, v.id) && dist({ x: v.x + v.w / 2, y: v.y + v.h / 2 }, game.player) < 180);
  if (siegeNear && !(game.raid && game.raid.active)) {
    ctx.strokeStyle = 'rgba(255, 140, 45, ' + (0.28 + Math.sin(time * 5) * 0.14) + ')';
    ctx.lineWidth = 4;
    ctx.strokeRect(1, 1, view.width - 2, view.height - 2);
  }
}
