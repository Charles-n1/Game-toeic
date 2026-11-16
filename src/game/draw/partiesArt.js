import { TILE_PX } from './tiles';
import { OUTLINE } from './palette';
import { personSprite, walkPose, swordSprite } from './people';
import { makeGrid, dot, fillRect, addOutline, toCanvas, once } from './pixels';
import * as props from './props';

// Pixel art rendering for roaming NPC adventurer parties, their weapons, camp chat bubbles, and arrows/spells.

const T = TILE_PX;

function isNear(view, x, y, w = 2, h = 2) {
  return x * T < view.x + view.width + 48 && (x + w) * T > view.x - 48 && y * T < view.y + view.height + 64 && (y + h) * T > view.y - 48;
}

function put(ctx, sprite, x, y, view) {
  ctx.drawImage(sprite.canvas, Math.round(x - sprite.ax - view.x), Math.round(y - sprite.ay - view.y));
}

function shadowSprite() {
  return once('partyShadow', () => {
    const grid = makeGrid(12, 5);
    fillRect(grid, 2, 1, 8, 3, '#14101e44');
    dot(grid, 1, 2, '#14101e44');
    dot(grid, 10, 2, '#14101e44');
    return { canvas: toCanvas(grid), ax: 6, ay: 3 };
  });
}

function bowSprite(dir) {
  return once('partyBow|' + dir, () => {
    const grid = makeGrid(8, 16);
    if (dir === 'left') {
      fillRect(grid, 4, 2, 2, 12, '#8a5a30');
      dot(grid, 2, 4, '#c48c52');
      dot(grid, 2, 11, '#c48c52');
      fillRect(grid, 5, 3, 1, 10, '#e8eef7');
    } else {
      fillRect(grid, 2, 2, 2, 12, '#8a5a30');
      dot(grid, 5, 4, '#c48c52');
      dot(grid, 5, 11, '#c48c52');
      fillRect(grid, 2, 3, 1, 10, '#e8eef7');
    }
    return { canvas: toCanvas(addOutline(grid, OUTLINE)), ax: 4, ay: 8 };
  });
}

function staffSprite(glow = '#5fd3e8') {
  return once('partyStaff|' + glow, () => {
    const grid = makeGrid(8, 18);
    fillRect(grid, 3, 4, 2, 13, '#6b3e1f');
    fillRect(grid, 2, 1, 4, 4, glow);
    dot(grid, 3, 2, '#ffffff');
    return { canvas: toCanvas(addOutline(grid, OUTLINE)), ax: 4, ay: 12 };
  });
}

function drawMemberWeapon(ctx, m, px, py, view, time, now) {
  const dir = m.dir || 'down';
  const age = m.attackAnimAt ? now - m.attackAnimAt : 9999;
  const striking = age >= 0 && age < 320;
  const p = striking ? age / 320 : 0;
  const handX = dir === 'left' ? -6 : dir === 'right' ? 6 : 6;

  if (m.role === 'knight' || m.role === 'cleric') {
    const baseAngle = dir === 'left' ? -155 : dir === 'right' ? -25 : dir === 'up' ? -90 : 75;
    const angle = striking ? baseAngle - 60 + Math.sin(p * Math.PI) * 130 : baseAngle + Math.sin(time * 4 + m.x) * 8;
    const sword = swordSprite(angle, m.role === 'knight' ? 'steelSword' : 'ironSword');
    const rx = striking && m.attackDx ? Math.sign(m.attackDx) * Math.sin(p * Math.PI) * 5 : 0;
    const ry = striking && m.attackDy ? Math.sign(m.attackDy) * Math.sin(p * Math.PI) * 4 : 0;
    put(ctx, sword, px + handX + rx, py - 10 + ry, view);
  } else if (m.role === 'archer') {
    put(ctx, bowSprite(dir), px + handX, py - 9 + (striking ? -2 : 0), view);
  } else if (m.role === 'mage') {
    put(ctx, staffSprite('#5fd3e8'), px + handX, py - 7 - (striking ? 3 : 0), view);
  }
}

export function partyDrawings(game, view, time) {
  const parties = game && game.run && Array.isArray(game.run.parties) ? game.run.parties : [];
  if (parties.length === 0) return [];
  const now = Date.now();
  const list = [];

  for (const party of parties) {
    party.members.forEach((m, idx) => {
      if (m.hp <= 0 || !isNear(view, m.x - 1, m.y - 2, 2, 2)) return;
      list.push({
        y: m.y,
        draw: (ctx) => {
          const px = m.x * T;
          const py = m.y * T;
          put(ctx, shadowSprite(), px, py, view);
          put(ctx, personSprite(m.look, m.dir || 'down', walkPose(m.step || 0, m.walking, time, idx)), px, py, view);
          drawMemberWeapon(ctx, m, px, py, view, time, now);
          if (m.hp < m.maxHp) {
            const x = Math.round(px - view.x);
            const y = Math.round(py - view.y - 34);
            ctx.fillStyle = '#1c1726';
            ctx.fillRect(x - 8, y, 16, 3);
            ctx.fillStyle = '#7cfc9a';
            ctx.fillRect(x - 7, y + 1, Math.max(1, Math.round((14 * m.hp) / m.maxHp)), 1);
          }
          if (party.state === 'camping' && party.chat && party.chat.memberIndex === idx) {
            put(ctx, props.bubble('!'), px, py - 34 + Math.round(Math.sin(time * 4)), view);
          } else if (idx === 0 && party.state !== 'fighting' && Math.hypot(m.x - game.player.x, m.y - game.player.y) < 5.5) {
            put(ctx, props.bubble('?'), px, py - 34 + Math.round(Math.sin(time * 4)), view);
          }
        },
      });
    });
  }
  return list;
}

export function drawPartyEffects(ctx, game, view) {
  const parties = game && game.run && Array.isArray(game.run.parties) ? game.run.parties : [];
  for (const party of parties) {
    for (const proj of party.projectiles || []) {
      const x = Math.round(proj.x * T - view.x);
      const y = Math.round(proj.y * T - view.y - 8);
      if (proj.kind === 'spell') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x - 2, y - 2, 5, 5);
        ctx.fillStyle = proj.color;
        ctx.fillRect(x - 1, y - 1, 3, 3);
      } else {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(proj.angle || 0);
        ctx.fillStyle = '#ffd23f';
        ctx.fillRect(-5, -1, 9, 2);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(3, -1, 2, 2);
        ctx.restore();
      }
    }
  }
}
