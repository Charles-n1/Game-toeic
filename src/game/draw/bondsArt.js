import expressionsUrl from '../assets/characters/expressions-atlas.png';
import { EXPRESSION_FRAMES } from '../assets/characters/expressionFrames';
import effectsUrl from '../assets/characters/effects-atlas.png';
import { EFFECT_FRAMES } from '../assets/characters/effectFrames';
import { npcOf } from '../data/npcs';
import { TILE_PX } from './tiles';
import { personSprite, swordSprite } from './people';
import { makeGrid, fillEllipse, toCanvas, once } from './pixels';
import { battlePlaces } from './battle';
import { stationedSpot, companionRank, movesFor } from '../logic/bonds/training';

// The drawings of logic/bonds.js on the map:
// - Companions stationed at village training corners practicing on dummies/logs
// - Character-specific effect sprites from effects-atlas.png (tiers 1..4) on training swings & in combat
// - Expression portrait helpers from expressions-atlas.png (joy, sadness, anger, fear, surprise, love, disgust)
// - Emotion particle auras on the map during dialog reactions

const T = TILE_PX;

const ALLY_SPOTS = [
  [-27, -11],
  [-31, 10],
  [-48, -5],
  [-50, 13],
  [-14, 15],
];

const expressionsAtlas = new Image();
expressionsAtlas.src = expressionsUrl;

const effectsAtlas = new Image();
effectsAtlas.src = effectsUrl;

export function isExpressionsReady() {
  return expressionsAtlas.complete && expressionsAtlas.naturalWidth > 0;
}

export function isEffectsReady() {
  return effectsAtlas.complete && effectsAtlas.naturalWidth > 0;
}

function cutBox(atlas, box) {
  const [x, y, w, h] = box;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  canvas.getContext('2d').drawImage(atlas, x, y, w, h, 0, 0, w, h);
  return { canvas: canvas, w: w, h: h };
}

// Returns { canvas, w, h } for a character's expression ('joy'..'disgust'), or null if neutral/unavailable.
export function expressionSprite(characterId, expr) {
  const box = EXPRESSION_FRAMES[characterId]?.[expr];
  if (!box || !isExpressionsReady()) return null;
  return once('exprSprite:' + characterId + ':' + expr, () => cutBox(expressionsAtlas, box));
}

// Returns { canvas, w, h } for a character's tier 1..4 combat/training effect sprite, or null.
export function characterEffectSprite(characterId, tier) {
  const clamped = Math.max(1, Math.min(4, tier));
  const box = EFFECT_FRAMES[characterId]?.[clamped];
  if (!box || !isEffectsReady()) return null;
  return once('charEffect:' + characterId + ':' + clamped, () => cutBox(effectsAtlas, box));
}

export const EXPRESSION_META = {
  joy: { label: 'Joy', color: '#ffd23f', accent: '#fff6b0', icon: 'sparkle' },
  love: { label: 'Love', color: '#ff6fa8', accent: '#ffd6e8', icon: 'heart' },
  anger: { label: 'Anger', color: '#ff3b4f', accent: '#ffb0b8', icon: '!' },
  sadness: { label: 'Sadness', color: '#5fb8ff', accent: '#bfe6ff', icon: 'sweat' },
  fear: { label: 'Fear', color: '#9fd8ff', accent: '#ffffff', icon: 'sweat' },
  surprise: { label: 'Surprise', color: '#ffe066', accent: '#ffffff', icon: '!' },
  disgust: { label: 'Disgust', color: '#7cc45a', accent: '#c8ffd8', icon: 'dots' },
  neutral: { label: 'Neutral', color: '#c9d1e0', accent: '#ffffff', icon: null },
};

const shadow = () =>
  once('bondsShadow', () => {
    const grid = makeGrid(12, 5);
    fillEllipse(grid, 6, 2.5, 6, 2.5, '#14101e55');
    return { canvas: toCanvas(grid), ax: 6, ay: 3 };
  });

function put(ctx, sprite, x, y, view) {
  ctx.drawImage(sprite.canvas, Math.round(x - sprite.ax - view.x), Math.round(y - sprite.ay - view.y));
}

function isNearView(view, x, y, w, h) {
  return x * T < view.x + view.width + 32 && (x + w) * T > view.x - 32 && y * T < view.y + view.height + 64 && (y + h) * T > view.y - 32;
}

function trainingCycle(time, slot) {
  return (time * 0.85 + slot * 0.37) % 1;
}

function trainingPose(look, cycle) {
  if (look.sheet) {
    if (cycle >= 0.66 && cycle < 0.88) return 'walk1';
    if (cycle >= 0.45 && cycle < 0.66) return 'walk0';
    return Math.floor(cycle * 4) % 2 ? 'breath' : 'stand';
  }
  if (cycle >= 0.45 && cycle < 0.66) return 'windup';
  if (cycle >= 0.66 && cycle < 0.88) return 'slash';
  return Math.floor(cycle * 4) % 2 ? 'ready1' : 'ready0';
}

function drawRankStars(ctx, rank, px, py) {
  if (rank <= 0) return;
  const totalWidth = rank * 4 - 1;
  const startX = Math.round(px - totalWidth / 2);
  for (let i = 0; i < rank; i++) {
    ctx.fillStyle = '#1c1726';
    ctx.fillRect(startX + i * 4 - 1, py - 1, 4, 4);
    ctx.fillStyle = rank >= 4 ? '#ff9ec4' : '#ffd23f';
    ctx.fillRect(startX + i * 4, py, 2, 2);
  }
}

// The things standing on the map, sorted with the others: [{ y (feet line, in tiles), draw: (ctx) => {} }].
export function bondsDrawings(game, view, time) {
  if (!game || !game.bonds || !game.bonds.training) return [];
  const drawings = [];
  for (const [npcId, entry] of Object.entries(game.bonds.training)) {
    if (!entry || !entry.stationedAt) continue;
    const npc = npcOf(npcId);
    if (!npc || (game.npcs?.[npcId] && !game.npcs[npcId].alive)) continue;
    const spot = stationedSpot(game, npcId);
    if (!spot || !isNearView(view, spot.x - 1, spot.y - 2, 3, 3)) continue;

    const cycle = trainingCycle(time, spot.slot);
    const pose = trainingPose(npc.look, cycle);
    const lungePx = cycle >= 0.66 && cycle < 0.88 ? 3 : cycle >= 0.45 && cycle < 0.66 ? -1 : 0;
    const rank = companionRank(game, npcId);
    const heroClose = Math.hypot(game.player.x - spot.x, game.player.y - spot.y) < 5;

    drawings.push({
      y: spot.y,
      draw: (ctx) => {
        const px = spot.x * T + lungePx;
        const py = spot.y * T;
        put(ctx, shadow(), px, py, view);
        const sprite = personSprite(npc.look, 'right', pose);
        put(ctx, sprite, px, py, view);
        if (sprite.sword !== undefined && sprite.hand) {
          const weaponId = rank >= 3 ? 'steelSword' : rank >= 1 ? 'ironSword' : 'woodSword';
          const sword = swordSprite(sprite.sword, weaponId);
          ctx.drawImage(
            sword.canvas,
            Math.round(px - sprite.ax + sprite.hand[0] - sword.ax - view.x),
            Math.round(py - sprite.ay + sprite.hand[1] - sword.ay - view.y),
          );
        }
        if (heroClose) drawRankStars(ctx, rank, Math.round(px - view.x), Math.round(py - (npc.look.sheet ? 43 : 33) - view.y));
      },
    });
  }
  return drawings;
}

function drawTrainingSlash(ctx, npcId, spot, view, cycle, rank, color) {
  if (cycle < 0.68 || cycle > 0.9) return;
  const progress = (cycle - 0.68) / 0.22;
  const cx = Math.round(spot.targetX * T - view.x);
  const cy = Math.round(spot.targetY * T - view.y - 10);

  const effect = rank >= 1 ? characterEffectSprite(npcId, rank) : null;
  if (effect) {
    ctx.save();
    ctx.globalAlpha = Math.max(0.25, 1 - Math.abs(progress - 0.5) * 1.4);
    ctx.drawImage(effect.canvas, Math.round(cx - effect.w / 2), Math.round(cy - effect.h / 2));
    ctx.restore();
  } else {
    ctx.fillStyle = progress < 0.5 ? '#ffffff' : color;
    for (let i = -3; i <= 3; i++) {
      const arcX = cx - 4 + Math.round(progress * 4) + Math.abs(i);
      const arcY = cy + i * 2;
      ctx.fillRect(arcX, arcY, 2, 1);
    }
  }
  for (let i = 0; i < 4; i++) {
    const dx = Math.round(Math.cos(i * 1.4 + progress * 2) * (3 + progress * 6));
    const dy = Math.round(Math.sin(i * 1.7) * (2 + progress * 4) - progress * 3);
    ctx.fillStyle = i % 2 === 0 ? '#ffe066' : '#d6b45a';
    ctx.fillRect(cx + dx, cy + dy, 1, 1);
  }
}

function drawTinyHeart(ctx, x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x - 2, y - 1, 2, 2);
  ctx.fillRect(x + 1, y - 1, 2, 2);
  ctx.fillRect(x - 1, y, 3, 2);
  ctx.fillRect(x, y + 2, 1, 1);
}

// Draws expression particles at a world/buffer coordinate.
export function drawExpressionOverlay(ctx, expr, px, py, time) {
  const meta = EXPRESSION_META[expr];
  if (!meta || expr === 'neutral') return;
  if (expr === 'love') {
    for (let i = 0; i < 2; i++) {
      const rise = (time * 12 + i * 7) % 14;
      drawTinyHeart(ctx, Math.round(px - 5 + i * 10 + Math.sin(time * 4 + i) * 2), Math.round(py - rise), i === 0 ? meta.color : meta.accent);
    }
  } else if (expr === 'joy') {
    for (let i = 0; i < 3; i++) {
      const sx = Math.round(px + Math.cos(time * 4 + i * 2.1) * 8);
      const sy = Math.round(py - 4 + Math.sin(time * 5 + i * 2.1) * 4);
      ctx.fillStyle = i % 2 === 0 ? meta.color : meta.accent;
      ctx.fillRect(sx - 1, sy, 3, 1);
      ctx.fillRect(sx, sy - 1, 1, 3);
    }
  } else if (expr === 'anger') {
    const pulse = Math.floor(time * 6) % 2;
    ctx.fillStyle = meta.color;
    ctx.fillRect(Math.round(px + 6), Math.round(py - 4 - pulse), 3, 1);
    ctx.fillRect(Math.round(px + 7), Math.round(py - 6 - pulse), 1, 4);
  } else if (expr === 'sadness' || expr === 'fear') {
    const drop = (time * 14) % 10;
    ctx.fillStyle = meta.color;
    ctx.fillRect(Math.round(px - 6), Math.round(py - 4 + drop), 2, 3);
    ctx.fillStyle = meta.accent;
    ctx.fillRect(Math.round(px + 6), Math.round(py - 2 + ((drop + 5) % 10)), 2, 2);
  } else if (expr === 'surprise') {
    ctx.fillStyle = meta.color;
    ctx.fillRect(Math.round(px), Math.round(py - 10), 2, 5);
    ctx.fillRect(Math.round(px), Math.round(py - 3), 2, 2);
  } else if (expr === 'disgust') {
    ctx.fillStyle = meta.color;
    ctx.fillRect(Math.round(px - 5), Math.round(py - 6 + Math.sin(time * 6) * 2), 3, 2);
    ctx.fillRect(Math.round(px + 3), Math.round(py - 8 + Math.cos(time * 6) * 2), 2, 2);
  }
}

function drawBattleCompanionEffects(ctx, game, view, time) {
  const fight = game.run.fight;
  if (!fight || !game.player?.party?.length) return;
  const places = battlePlaces(game);
  const heroX = places.hero.x * T - view.x;
  const heroY = places.hero.y * T - view.y;
  game.player.party.slice(0, ALLY_SPOTS.length).forEach((id, i) => {
    const rank = companionRank(game, id);
    if (rank <= 0) return;
    const [dx, dy] = ALLY_SPOTS[i];
    const ax = Math.round(heroX + dx);
    const ay = Math.round(heroY + dy);
    const color = movesFor(id).special.color;
    if (rank >= 2) {
      ctx.fillStyle = color;
      for (let p = 0; p < Math.min(3, rank); p++) {
        const ang = time * 3 + p * 2.1 + i;
        ctx.fillRect(Math.round(ax + Math.cos(ang) * 9), Math.round(ay - 12 + Math.sin(ang) * 4), 1, 1);
      }
    }
    const last = fight.last;
    if (last && last.isCorrect && last.damage > 0) {
      const age = Date.now() - last.at;
      if (age >= 60 && age <= 450) {
        const progress = (age - 60) / 390;
        const foeX = places.foe.x * T - view.x;
        const foeY = places.foe.y * T - view.y - 12;
        const bx = Math.round(ax + (foeX - ax) * progress);
        const by = Math.round(ay - 14 + (foeY - (ay - 14)) * progress - Math.sin(progress * Math.PI) * 8);
        const effect = characterEffectSprite(id, rank);
        if (effect) {
          ctx.save();
          ctx.globalAlpha = Math.max(0.3, 1 - progress * 0.45);
          ctx.drawImage(effect.canvas, Math.round(bx - effect.w / 2), Math.round(by - effect.h / 2));
          ctx.restore();
        } else if (rank >= 4) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(bx - 2, by - 2, 4, 4);
          ctx.fillStyle = color;
          ctx.fillRect(bx - 1, by - 3, 2, 6);
          ctx.fillRect(bx - 3, by - 1, 6, 2);
        }
      }
    }
  });
}

// Drawn over everything (before the night and the weather): effects, flying things.
export function drawBondsEffects(ctx, game, view, time) {
  if (!game || !game.run) return;
  if (game.bonds?.training) {
    for (const [npcId, entry] of Object.entries(game.bonds.training)) {
      if (!entry || !entry.stationedAt) continue;
      const spot = stationedSpot(game, npcId);
      if (!spot || !isNearView(view, spot.x - 1, spot.y - 2, 4, 4)) continue;
      const cycle = trainingCycle(time, spot.slot);
      drawTrainingSlash(ctx, npcId, spot, view, cycle, companionRank(game, npcId), movesFor(npcId).special.color);
    }
  }
  const activeExpr = game.run.dialogExpression;
  if (activeExpr && activeExpr.npcId && activeExpr.expr && activeExpr.expr !== 'neutral') {
    const npc = npcOf(activeExpr.npcId);
    const place = game.run.visible?.[activeExpr.npcId]
      ? game.run.people?.[activeExpr.npcId]
      : stationedSpot(game, activeExpr.npcId);
    if (npc && place && isNearView(view, place.x - 1, place.y - 3, 2, 3)) {
      const topOffset = npc.look?.sheet ? 42 : 32;
      drawExpressionOverlay(ctx, activeExpr.expr, place.x * T - view.x, place.y * T - topOffset - view.y, time);
    }
  }
  drawBattleCompanionEffects(ctx, game, view, time);
}
