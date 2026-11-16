import gearAtlasUrl from '../assets/characters/gear-atlas.png';
import expressionsAtlasUrl from '../assets/characters/expressions-atlas.png';
import effectsAtlasUrl from '../assets/characters/effects-atlas.png';
import { GEAR_FRAMES } from '../assets/characters/gearFrames';
import { EXPRESSION_FRAMES } from '../assets/characters/expressionFrames';
import { EFFECT_FRAMES } from '../assets/characters/effectFrames';

// Character equipment icons, expression portraits, and battle effects cut from art/Characters/*.png
// by tools/cut_character_extras.py. Every lookup stays safe before atlases load and in headless Node tests.

function loadAtlas(url) {
  const img = new Image();
  img.src = url;
  return img;
}

function isAtlasReady(img) {
  return Boolean(img && img.complete && img.naturalWidth > 0);
}

const gearAtlas = loadAtlas(gearAtlasUrl);
const expressionsAtlas = loadAtlas(expressionsAtlasUrl);
const effectsAtlas = loadAtlas(effectsAtlasUrl);

const gearUrls = new Map();
const expressionUrls = new Map();
const effectSprites = new Map();

function cutCanvas(atlas, box) {
  const [x, y, w, h] = box;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (ctx) ctx.drawImage(atlas, x, y, w, h, 0, 0, w, h);
  return canvas;
}

function cutDataUrl(atlas, box) {
  const canvas = cutCanvas(atlas, box);
  return typeof canvas.toDataURL === 'function' ? canvas.toDataURL() : null;
}

export function hasGearIcon(key) {
  return Boolean(key && GEAR_FRAMES[key] !== undefined);
}

export function gearIconUrl(key) {
  if (!hasGearIcon(key) || !isAtlasReady(gearAtlas)) return null;
  if (!gearUrls.has(key)) {
    const url = cutDataUrl(gearAtlas, GEAR_FRAMES[key]);
    if (!url) return null;
    gearUrls.set(key, url);
  }
  return gearUrls.get(key);
}

export function hasExpression(sheetId, expr) {
  const frames = sheetId ? EXPRESSION_FRAMES[sheetId] : undefined;
  return Boolean(frames && expr && frames[expr] !== undefined);
}

export function expressionUrl(sheetId, expr) {
  if (!hasExpression(sheetId, expr) || !isAtlasReady(expressionsAtlas)) return null;
  const cacheKey = `${sheetId}:${expr}`;
  if (!expressionUrls.has(cacheKey)) {
    const url = cutDataUrl(expressionsAtlas, EXPRESSION_FRAMES[sheetId][expr]);
    if (!url) return null;
    expressionUrls.set(cacheKey, url);
  }
  return expressionUrls.get(cacheKey);
}

export function effectSprite(sheetId, tier) {
  const frames = sheetId ? EFFECT_FRAMES[sheetId] : undefined;
  const box = frames && tier !== undefined ? frames[tier] : undefined;
  if (!box || !isAtlasReady(effectsAtlas)) return null;
  const cacheKey = `${sheetId}:${tier}`;
  if (!effectSprites.has(cacheKey)) {
    const [, , w, h] = box;
    effectSprites.set(cacheKey, {
      canvas: cutCanvas(effectsAtlas, box),
      ax: Math.floor(w / 2),
      ay: Math.floor(h / 2),
    });
  }
  return effectSprites.get(cacheKey);
}
