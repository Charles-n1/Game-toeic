import { NPCS, npcOf } from '../data/npcs';
import { HOUSES, SEALS, WORLD_SIZE, INSIDE_TOP, HOME_DOOR, zoneAt, houseSize } from '../data/zones';
import { typeOf } from '../data/types';
import { TILE, tileAt, biomeAt, noise, CHESTS, PORTS, propsInArea, getMapRevision } from '../world/map';
import { activeQuestOf, offeredQuest, isQuestReady } from '../logic/quests';
import { isCropReady, closestTreasure } from '../logic/farm';
import { isSealOpen } from '../logic/seals';
import { hasLight } from '../logic/torch';
import { visibleVillagers } from '../logic/villagers';
import { isRiddleSolved } from '../logic/puzzles';
import { BED_COLORS, WALL_COLORS } from '../logic/home';
import { drawWeather, darknessHere } from './weather';
import { animalSprite } from './animals';
import * as buildings from './buildings';
import { TILE_PX, groundTile, flowersDecal, setHomeWallColor } from './tiles';
import { personSprite, walkPose, obsidianSoldier, obsidianCat } from './people';
import { monsterSprite } from './monsters';
import { drawBattle, battleGap, writeBattleWords } from './battle';
import { activeEmotes, emoteOwner } from '../logic/emotes';
import { drawLights } from './lights';
import { makeGrid, fillEllipse, toCanvas, once } from './pixels';
import * as props from './props';
import { warDrawings, drawWarEffects } from './warArt';
import { societyDrawings, drawSocietyEffects } from './societyArt';
import { campDrawings, drawCampEffects } from './campArt';
import { bondsDrawings, drawBondsEffects } from './bondsArt';
import { partyDrawings, drawPartyEffects } from './partiesArt';
import * as isekaiArt from './isekaiArt';
import * as structuresArt from './structuresArt';
import * as decorArt from './decorArt';
import { FLAT_DECORS } from '../data/decorations';
import { isPropHarvested } from '../logic/harvest';
import { economyDrawings } from './economyArt';
import { familyKidsList } from '../logic/families';

// Draws the world. Everything is painted at its real pixel size in a small hidden canvas (the "buffer"),
// then the buffer is drawn 2 to 4 times bigger on the screen, without smoothing: crisp pixel art.
// A "view" is the part of the world on screen: { x, y, width, height } in pixels of the art.

const T = TILE_PX;
const buffer = document.createElement('canvas');
const NAME_RANGE = 2.5; // tiles: the names of the people this close are written above them

// How many screen pixels for one pixel of the art. A phone (420 px wide) gets 3 (about 9 tiles across),
// a computer (900 px high) gets 4 (about 14 tiles high, like a console RPG).
export function pixelScale(width, height = width) {
  const isWide = width > height;
  return Math.max(2, Math.min(6, Math.round(Math.min(width, height) / (isWide ? 210 : 150))));
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

// Draws a sprite ({ canvas, ax, ay }) with its feet at (x, y), in pixels of the world.
function put(ctx, sprite, x, y, view) {
  ctx.drawImage(sprite.canvas, Math.round(x - sprite.ax - view.x), Math.round(y - sprite.ay - view.y));
}

// ---------- The camera ----------

// The part of the world the camera may show (pixels): the island, or the room of an inside (a floor, the home).
function boundsOf(game) {
  const zone = zoneAt(game.player.x, game.player.y);
  if (zone.kind === 'inside' && zone.w) return { left: (zone.x - 1) * T, top: (zone.y - 2) * T, right: (zone.x + zone.w + 1) * T, bottom: (zone.y + zone.h + 1) * T };
  return { left: 0, top: 0, right: WORLD_SIZE * T, bottom: WORLD_SIZE * T };
}

// One axis of the camera: inside the bounds, or centered when the bounds are smaller than the screen.
function cameraAxis(center, size, low, high) {
  if (high - low <= size) return (low + high) / 2 - size / 2;
  return clamp(center - size / 2, low, high - size);
}

// The player stays in the middle. In a fight, the two fighters stand in the top third (the questions are below).
function viewOf(game, width, height) {
  const fight = game.run.fight;
  const centerX = (game.player.x + (fight ? battleGap(game) / 2 : 0)) * T;
  const centerY = (game.player.y - 0.6) * T;
  const bounds = boundsOf(game);
  let x = cameraAxis(centerX, width, bounds.left, bounds.right);
  let y = cameraAxis(centerY + height * (fight ? 0.14 : 0), height, bounds.top, bounds.bottom);
  if (Date.now() < game.run.shakeUntil) {
    x += Math.round((Math.random() - 0.5) * 6);
    y += Math.round((Math.random() - 0.5) * 6);
  }
  return { x: Math.round(x), y: Math.round(y), width: width, height: height };
}

// The tiles on screen (+ a margin for the tall things whose feet are just outside).
function tilesOf(view, margin, bottomMargin = margin) {
  return {
    left: Math.floor(view.x / T) - margin,
    top: Math.floor(view.y / T) - 1,
    right: Math.ceil((view.x + view.width) / T) + margin,
    bottom: Math.ceil((view.y + view.height) / T) + bottomMargin + 2,
  };
}

// ---------- The ground (16 x 16 tile chunk cache for fast scrolling & low CPU) ----------

const CHUNK = 16;
const CHUNK_PX = CHUNK * T;
const MAX_CHUNKS = 96;
const groundChunks = new Map();

function chunkHasAnimation(cx, cy) {
  const x0 = cx * CHUNK - 1;
  const y0 = cy * CHUNK - 1;
  for (let y = y0; y <= y0 + CHUNK + 1; y++) {
    for (let x = x0; x <= x0 + CHUNK + 1; x++) {
      const t = tileAt(x, y);
      if (t === TILE.WATER || t === TILE.LAVA) return true;
    }
  }
  return false;
}

function getGroundChunk(cx, cy, time, wallColor) {
  const rev = getMapRevision();
  const isInside = cy * CHUNK + CHUNK > INSIDE_TOP;
  const baseKey = cx + ',' + cy + '|' + rev + (isInside ? '|' + wallColor : '');
  let entry = groundChunks.get(baseKey);
  if (!entry) {
    if (groundChunks.size >= MAX_CHUNKS) groundChunks.delete(groundChunks.keys().next().value);
    entry = { animated: chunkHasAnimation(cx, cy), frames: {} };
    groundChunks.set(baseKey, entry);
  } else {
    // Refresh LRU order
    groundChunks.delete(baseKey);
    groundChunks.set(baseKey, entry);
  }
  const frame = entry.animated ? Math.floor(time * 2) % 4 : 0;
  if (!entry.frames[frame]) {
    const canvas = document.createElement('canvas');
    canvas.width = CHUNK_PX;
    canvas.height = CHUNK_PX;
    const cctx = canvas.getContext('2d');
    const ox = cx * CHUNK;
    const oy = cy * CHUNK;
    for (let y = 0; y < CHUNK; y++) {
      for (let x = 0; x < CHUNK; x++) {
        cctx.drawImage(groundTile(ox + x, oy + y, frame * 0.5), x * T, y * T);
        if (tileAt(ox + x, oy + y) === TILE.FLOWER) cctx.drawImage(flowersDecal(ox + x, oy + y), x * T, y * T);
      }
    }
    entry.frames[frame] = canvas;
  }
  return entry.frames[frame];
}

function drawGround(ctx, game, view, time) {
  const wallColor = game ? WALL_COLORS[game.home.wall] : WALL_COLORS[0];
  setHomeWallColor(wallColor);
  const area = tilesOf(view, 0);
  const cx0 = Math.floor(area.left / CHUNK);
  const cy0 = Math.floor(area.top / CHUNK);
  const cx1 = Math.floor((area.right - 1) / CHUNK);
  const cy1 = Math.floor((area.bottom - 1) / CHUNK);
  for (let cy = cy0; cy <= cy1; cy++) {
    for (let cx = cx0; cx <= cx1; cx++) {
      const chunk = getGroundChunk(cx, cy, time, wallColor);
      ctx.drawImage(chunk, cx * CHUNK_PX - view.x, cy * CHUNK_PX - view.y);
    }
  }
  if (game && game.crops) {
    for (const [key, crop] of Object.entries(game.crops)) {
      const [x, y] = key.split(',').map(Number);
      if (x >= area.left && x < area.right && y >= area.top && y < area.bottom && tileAt(x, y) === TILE.SOIL) {
        put(ctx, props.crop(isCropReady(game, crop)), (x + 0.5) * T, (y + 1) * T - 3, view);
      }
    }
  }
}

// ---------- The things standing on the map ----------

// The tree or the rock of a tile, following the land it grows in (null = nothing stands there).
function standingSprite(x, y) {
  const tile = tileAt(x, y);
  const biome = biomeAt(x, y);
  if (tile === TILE.TREE && biome === 'forest') return noise(x, y, 4) < 0.25 ? props.pineTree() : props.oakTree(Math.floor(noise(x, y, 3) * 3));
  if (tile === TILE.TREE && biome === 'mountain') return props.pineTree();
  if (tile === TILE.TREE && biome === 'desert') return props.cactus();
  if (tile === TILE.TREE) return props.roundTree(Math.floor(noise(x, y, 3) * 3));
  if (tile === TILE.DEAD_TREE) return props.deadTree();
  if (tile === TILE.ROCK && biome === 'mountain') return noise(x, y, 5) < 0.45 ? props.iceCrystal() : props.rock('snow');
  if (tile === TILE.ROCK && zoneAt(x, y).theme === 'crystal') return props.iceCrystal();
  if (tile === TILE.ROCK) return props.rock(biome === 'coast' || biome === 'desert' ? null : 'moss');
  if (isBushy(x, y, tile, biome)) return props.bush(Math.floor(noise(x, y, 45) * 4));
  return null;
}

// Bushes grow on some tiles of grass (only to look at: nobody is stopped by them).
const BUSHES = { forest: 0.12, meadow: 0.04, plains: 0.05, lake: 0.04, village: 0.015 };

function isBushy(x, y, tile, biome) {
  return (tile === TILE.GRASS || tile === TILE.FLOWER) && noise(x, y, 44) < (BUSHES[biome] || 0);
}

// The things made of pieces, one per tile (a fence, a wall, a palisade, spikes).
const IN_PIECES = ['fence', 'wall', 'palisade', 'spikes'];

const STANDING_BLOCKS = new Map();
const MAX_STANDING_BLOCKS = 120;

function standingBlock(bx, by) {
  const key = bx + ',' + by;
  let items = STANDING_BLOCKS.get(key);
  if (items) return items;
  if (STANDING_BLOCKS.size >= MAX_STANDING_BLOCKS) STANDING_BLOCKS.delete(STANDING_BLOCKS.keys().next().value);
  items = [];
  const x0 = bx * CHUNK;
  const y0 = by * CHUNK;
  for (let y = y0; y < y0 + CHUNK; y++) {
    for (let x = x0; x < x0 + CHUNK; x++) {
      const sprite = standingSprite(x, y);
      if (sprite) items.push({ x: x, y: y, sprite: sprite });
    }
  }
  STANDING_BLOCKS.set(key, items);
  return items;
}

// Each drawing: { y (the line of its feet, in tiles: who is lower is drawn later, in front), draw }.
function treesAndRocks(view) {
  const area = tilesOf(view, 4, 8);
  const bx0 = Math.floor(area.left / CHUNK);
  const by0 = Math.floor(area.top / CHUNK);
  const bx1 = Math.floor((area.right - 1) / CHUNK);
  const by1 = Math.floor((area.bottom - 1) / CHUNK);
  const drawings = [];
  for (let by = by0; by <= by1; by++) {
    for (let bx = bx0; bx <= bx1; bx++) {
      for (const item of standingBlock(bx, by)) {
        if (item.x >= area.left && item.x < area.right && item.y >= area.top && item.y < area.bottom) {
          drawings.push({ y: item.y + 1, draw: (ctx) => put(ctx, item.sprite, (item.x + 0.5) * T, (item.y + 1) * T - 2, view) });
        }
      }
    }
  }
  return drawings;
}

function isNear(view, x, y, w, h) {
  return x * T < view.x + view.width + 64 && (x + w) * T > view.x - 64 && y * T < view.y + view.height + 128 && (y + h) * T > view.y - 64;
}

const HOUSE_CELL = 32;
const HOUSES_OF_CELL = new Map();
for (const house of HOUSES) {
  const sz = houseSize(house);
  for (let cy = Math.floor(house.y / HOUSE_CELL); cy <= Math.floor((house.y + sz.h) / HOUSE_CELL); cy++) {
    for (let cx = Math.floor(house.x / HOUSE_CELL); cx <= Math.floor((house.x + sz.w) / HOUSE_CELL); cx++) {
      const k = cy * 1000 + cx;
      if (!HOUSES_OF_CELL.has(k)) HOUSES_OF_CELL.set(k, []);
      HOUSES_OF_CELL.get(k).push(house);
    }
  }
}

function housesNear(view) {
  const x0 = Math.floor((view.x - 64) / (T * HOUSE_CELL));
  const y0 = Math.floor((view.y - 64) / (T * HOUSE_CELL));
  const x1 = Math.floor((view.x + view.width + 64) / (T * HOUSE_CELL));
  const y1 = Math.floor((view.y + view.height + 128) / (T * HOUSE_CELL));
  const found = new Set();
  for (let cy = y0; cy <= y1; cy++) {
    for (let cx = x0; cx <= x1; cx++) {
      for (const h of HOUSES_OF_CELL.get(cy * 1000 + cx) || []) found.add(h);
    }
  }
  return [...found];
}

// The flames on the roofs of a village under attack.
function roofFires(house, time) {
  const w = house.w * T;
  const h = house.h * T;
  const spots = [
    [w * 0.22, h * 0.25],
    [w * 0.5, h * 0.14],
    [w * 0.78, h * 0.28],
    [w * 0.36, h * 0.45],
    [w * 0.68, h * 0.5],
  ];
  return spots.map(([dx, dy], i) => (ctx, view) => {
    put(ctx, props.bigFlame(Math.floor(time * 9 + i) % 3), house.x * T + dx, house.y * T + dy, view);
  });
}

function isBurning(game, house) {
  if (!game || !house.village || house.style === 'tent') return false;
  const state = game.villages && game.villages[house.village];
  if (state && (state.underAttack || state.burning || state.raided)) return true;
  if (game.war && game.war.attacks && game.war.attacks.some((attack) => attack.village === house.village && attack.active)) return true;
  return Boolean(game.raid.active && house.village === (game.raid.village || 'lexia'));
}

function burningHouses(game, view) {
  if (!game) return [];
  return housesNear(view).filter((house) => isNear(view, house.x, house.y - 2, house.w, house.h + 2) && isBurning(game, house));
}

function houseSpriteOf(house) {
  if (house.style === 'tent') return buildings.tent(house.role === 'chief', house.roof, house.w, house.h);
  if (house.role === 'school') return props.schoolSprite();
  if (house.role === 'guild') return buildings.guildSprite();
  if (house.size === 'church') return buildings.churchSprite(house);
  if (house.size === 'mill') return buildings.millSprite(house);
  if (house.size === 'palace') return buildings.palaceSprite(house);
  return props.houseSprite(house);
}

function houses(view, game, time) {
  const sailFrame = Math.floor(time * 5) % 4;
  return housesNear(view)
    .filter((house) => isNear(view, house.x, house.y - 4, houseSize(house).w, houseSize(house).h + 4))
    .map((house) => {
    const bottom = house.y + houseSize(house).h;
    const hasChimney = house.style !== 'tent' && house.size !== 'church' && house.size !== 'palace' && house.size !== 'mill';
    return {
      y: bottom,
      draw: (ctx) => {
        put(ctx, houseSpriteOf(house), house.x * T, bottom * T, view);
        if (house.size === 'mill') {
          put(ctx, buildings.millSailsSprite(sailFrame), house.x * T + 64, bottom * T - 102, view);
        }
        if (hasChimney && !isBurning(game, house)) {
          const sx = house.x * T + Math.round(house.w * T * 0.72);
          const sy = (bottom - house.h) * T - 4;
          for (let i = 0; i < 3; i++) {
            const life = (time * 0.42 + i / 3 + (house.x % 7) * 0.13) % 1;
            const px = Math.round(sx + Math.sin(time * 2.2 + i * 2) * 3 + life * 4 - view.x);
            const py = Math.round(sy - life * 18 - view.y);
            const sz = life < 0.5 ? 2 : 3;
            ctx.fillStyle = 'rgba(235, 240, 250, ' + (0.45 * (1 - life)).toFixed(2) + ')';
            ctx.fillRect(px, py, sz, sz);
          }
        }
        if (isBurning(game, house)) roofFires(house, time).forEach((fire) => fire(ctx, view));
      },
    };
  });
}

// The picture of a prop. game: the game (null on the title screen).
function propSprite(prop, time, game) {
  const flame = Math.floor(time * 8) % 3;
  const blink = Math.floor(time * 2) % 2;
  const pictures = {
    tent: () => buildings.tent(false, prop.look || 'bandit', prop.w, prop.h),
    bigTent: () => buildings.tent(true, prop.look || 'bandit', prop.w, prop.h),
    banner: () => buildings.banner(prop.color),
    demonSpire: () => buildings.demonSpire(blink),
    watchtower: () => buildings.watchtower(),
    mineFrame: () => buildings.mineFrame(),
    minecart: () => buildings.minecart(),
    ruinPillar: () => buildings.ruinPillar(),
    obelisk: () => buildings.obelisk(game !== null && isRiddleSolved(game, prop), blink),
    hut: () => buildings.hut(),
    well: () => buildings.well(),
    dummy: () => buildings.dummy(),
    logs: () => buildings.logs(),
    wallTorch: () => buildings.wallTorch(flame),
    bed: () => buildings.bed(game ? BED_COLORS[game.home.bed] : BED_COLORS[0]),
    smallBed: () => buildings.smallBed(prop.color || '#5a9fd6'),
    toilet: () => buildings.toilet(),
    basin: () => buildings.basin(),
    diningTable: () => buildings.diningTable(),
    throne: () => buildings.throne(),
    barCounter: () => buildings.barCounter(prop.w),
    tavernTable: () => buildings.tavernTable(),
    wardrobe: () => buildings.wardrobe(),
    stove: () => buildings.stove(blink),
    storage: () => buildings.storage(),
    window: () => buildings.windowOnWall(),
    boulder: () => buildings.boulder(),
    plate: () => buildings.plate(prop.pressed),
    bars: () => buildings.bars(),
    wordDoor: () => buildings.wordDoor(blink),
    furniture: () => buildings.furniture(prop.look, prop.color),
    keepFacade: () => buildings.keepFacade(prop.look, prop.w, blink),
    turret: () => buildings.turret(prop.look),
    hotSpring: () => isekaiArt.hotSpring(Math.floor(time * 3) % 3),
    heroGrave: () => isekaiArt.heroGrave(blink),
  };
  if (pictures[prop.kind]) return pictures[prop.kind]();
  if (prop.kind === 'fountain') return props.fountain(Math.floor(time * 4) % 2);
  if (prop.kind === 'lamp') return props.lampPost();
  if (prop.kind === 'torch') return props.torch(flame);
  if (prop.kind === 'campfire') return props.campfire(flame);
  if (prop.kind === 'crystal') return props.arcaneCrystal(blink);
  if (prop.kind === 'wall') return props.stoneWall(prop.side || (prop.h > 1 ? 'column' : 'row'));
  if (prop.kind === 'palisade') return props.palisade(prop.side || (prop.h > 1 ? 'column' : 'row'));
  if (prop.kind === 'spikes') return props.spikes(prop.side || (prop.h > 1 ? 'column' : 'row'));
  if (prop.kind === 'warTotem') return props.warTotem();
  if (prop.kind === 'bones') return props.bones();
  if (prop.kind === 'cage') return props.cage();
  if (prop.kind === 'gameStall') return props.gameStall();
  if (prop.kind === 'board') return props.board();
  if (prop.kind === 'statue') return props.statue();
  if (prop.kind === 'totem') return props.totem();
  if (prop.kind === 'rubble') return props.rubble(prop.look);
  if (prop.kind === 'target') return props.target();
  if (prop.kind === 'grave') return props.grave();
  if (prop.kind === 'hay') return props.hay();
  if (prop.kind === 'stall') return props.marketStall();
  if (prop.kind === 'barrels') return props.barrels();
  if (prop.kind === 'crates') return props.crates();
  if (prop.kind === 'signpost') return props.signpost();
  if (prop.kind === 'flowerPot') return props.flowerPot(prop.variant || 0);
  if (prop.kind === 'bench') return props.bench();
  if (prop.kind === 'topiary') return props.topiary();
  if (prop.kind === 'banner') return props.bannerPole(prop.color, Math.floor(time * 4 + (prop.x + prop.y) * 0.7) % 3);
  if (prop.kind === 'flowerBed') return props.flowerBed(prop.variant || 0);
  if (prop.kind === 'flowerArch') return props.flowerArch();
  if (prop.kind === 'scarecrow') return props.scarecrow(Math.floor(time * 2 + prop.x) % 2);
  if (prop.kind === 'wheelbarrow') return props.wheelbarrow();
  if (prop.kind === 'weaponRack') return props.weaponRack();
  if (prop.kind === 'harborGear') return props.harborGear();
  if (prop.kind === 'cauldron') return props.cauldron(flame);
  if (prop.kind === 'bedroll') return props.bedroll();
  if (prop.kind === 'spikeTrap') {
    const armed = !game?.war?.disarmedTraps?.[prop.structId];
    return props.spikeTrap(armed);
  }
  if (prop.kind === 'tripwire') {
    const armed = !game?.war?.disarmedTraps?.[prop.structId];
    return props.tripwire(armed);
  }
  if (prop.kind === 'shrine') {
    const used = Boolean(game?.society?.shrinesUsed?.[prop.structId]);
    return props.shrine(used);
  }
  if (prop.kind === 'portalRuins') return props.portalRuins(blink);
  if (prop.kind === 'monsterBanner') return props.monsterBanner();
  const decorSprite = decorArt.decorSprite(prop.kind, time, isPropHarvested(game, prop));
  if (decorSprite) return decorSprite;
  const structSprite = structuresArt.structureSprite(prop.kind, time, !game || game.hour >= 18 || game.hour < 6);
  if (structSprite) return structSprite;
  return props.fence();
}

// The props on the floor (plates, rugs, bones, rubble, traps, bedrolls, flowers/burrows) are drawn under everything; the others stand.
const FLAT = ['plate', 'window', 'bones', 'rubble', 'spikeTrap', 'tripwire', 'bedroll', 'fairyRing', 'abyssRift', 'coralTidepool', 'moonMirror', ...FLAT_DECORS];

// The props around the view (the tall ones whose feet are just below are drawn too).
function propsOfView(view, game = null) {
  const staticList = propsInArea(Math.floor(view.x / T) - 8, Math.floor(view.y / T) - 4, Math.ceil((view.x + view.width) / T) + 8, Math.ceil((view.y + view.height) / T) + 16);
  const dynamicCamp = game && game.run && Array.isArray(game.run.campProps) ? game.run.campProps : [];
  return dynamicCamp.length > 0 ? [...staticList, ...dynamicCamp] : staticList;
}

function villageProps(view, time, game) {
  return propsOfView(view, game).filter((prop) => isNear(view, prop.x, prop.y, prop.w, prop.h + 14)).map((prop) => ({
    y: FLAT.includes(prop.kind) || prop.look === 'rug' ? prop.y - 9 : prop.y + prop.h,
    draw: (ctx) => {
      const sprite = propSprite(prop, time, game);
      if (IN_PIECES.includes(prop.kind)) {
        for (let dy = 0; dy < prop.h; dy++) {
          for (let dx = 0; dx < prop.w; dx++) put(ctx, sprite, (prop.x + dx + 0.5) * T, (prop.y + dy + 1) * T - 1, view);
        }
      } else if (sprite.ax === 0) {
        put(ctx, sprite, prop.x * T, (prop.y + prop.h) * T, view); // a big building: from its left side
      } else {
        put(ctx, sprite, (prop.x + prop.w / 2) * T, (prop.y + prop.h) * T - 1, view);
      }
    },
  }));
}

function chestsAndBarriers(view, game) {
  const chests = CHESTS.filter((chest) => isNear(view, chest.x, chest.y, 1, 1)).map((chest) => ({
    y: chest.y + 1,
    draw: (ctx) => put(ctx, props.chest(game !== null && game.chests[chest.key] === true), (chest.x + 0.5) * T, (chest.y + 1) * T - 2, view),
  }));
  const barriers = game
    ? game.run.barriers.map((barrier) => ({
        y: barrier.y + 1,
        draw: (ctx) => put(ctx, props.obsidianShard(), (barrier.x + 0.5) * T, (barrier.y + 1) * T - 2, view),
      }))
    : [];
  return [...chests, ...barriers];
}

// A closed seal: a wall of red runes that pulses.
function sealDrawings(view, game, time) {
  if (!game) return [];
  return SEALS.filter((seal) => !isSealOpen(game, seal) && isNear(view, seal.x, seal.y, seal.w, seal.h)).map((seal) => ({
    y: seal.y + seal.h,
    draw: (ctx) => {
      const x = seal.x * T - view.x;
      const y = seal.y * T - view.y;
      ctx.fillStyle = 'rgba(255, 50, 70, ' + (0.35 + Math.sin(time * 4) * 0.15) + ')';
      ctx.fillRect(x, y - 10, seal.w * T, T + 10);
      ctx.fillStyle = '#ffb0b8';
      for (let i = 0; i < seal.w * 4; i++) {
        const rx = x + 2 + i * 4;
        const ry = y - 6 + Math.round(Math.sin(time * 3 + i) * 2);
        ctx.fillRect(rx, ry, 2, 2); // the runes
        ctx.fillRect(rx, ry + 8, 1, 3);
      }
    },
  }));
}

// ---------- The living ----------

const shadow = () =>
  once('shadow', () => {
    const grid = makeGrid(12, 5);
    fillEllipse(grid, 6, 2.5, 6, 2.5, '#14101e55');
    return { canvas: toCanvas(grid), ax: 6, ay: 3 };
  });

// How high the top of the head is, in pixels above the feet: the people of the sprite sheets are taller.
function headHeight(look) {
  return look && look.sheet ? 40 : 30;
}

// The mark above someone who has a quest: ! = a new one, ? = done, come and tell them.
function questMark(game, npc) {
  const active = activeQuestOf(game, npc.id);
  if (active) return isQuestReady(game, active) ? '?' : null;
  return offeredQuest(game, npc.id) ? '!' : null;
}

// salt: a number of this person, so that everyone breathes at their own moment.
function personDrawing(look, place, view, time, salt, extra) {
  return {
    y: place.y,
    draw: (ctx) => {
      put(ctx, shadow(), place.x * T, place.y * T, view);
      put(ctx, personSprite(look, place.dir || 'down', walkPose(place.step, place.walking, time, salt)), place.x * T, place.y * T, view);
      if (extra) extra(ctx);
    },
  };
}

// The people inside guild halls & palaces (logic/guildHall.js, logic/houses.js): drinkers lift mugs, servers walk, rulers hold court.
function guildPatronDrawings(game, view, time) {
  const patrons = game.run.visitHouse && Array.isArray(game.run.visitHouse.patrons) ? game.run.visitHouse.patrons : [];
  return patrons.map((patron, i) => {
    if (!patron.drinking) {
      return personDrawing(patron.look, patron, view, time, i, (ctx) => {
        if (patron.kind === 'server' && Math.sin(time * 2.2 + i * 2) > 0.72) {
          const px = Math.round(patron.x * T - view.x);
          const py = Math.round(patron.y * T - view.y - 30 - Math.abs(Math.sin(time * 4)) * 3);
          ctx.fillStyle = '#ff6fa8';
          ctx.fillRect(px - 2, py, 2, 2);
          ctx.fillRect(px + 1, py, 2, 2);
          ctx.fillRect(px - 1, py + 1, 3, 2);
        }
      });
    }
    return {
      y: patron.y,
      draw: (ctx) => {
        put(ctx, shadow(), patron.x * T, patron.y * T, view);
        put(ctx, personSprite(patron.look, patron.dir, 'drink'), patron.x * T, patron.y * T, view);
        const rise = Math.round((time * 12 + i * 3) % 10);
        ctx.fillStyle = '#fff3b0';
        ctx.fillRect(Math.round(patron.x * T - view.x + (patron.dir === 'left' ? -5 : 4)), Math.round(patron.y * T - view.y - 16 - rise), 2, 2);
      },
    };
  });
}

// Someone knocked out: lying on the ground (the picture turned), with stars over the head.
function lyingDrawing(look, place, view, time) {
  return {
    y: place.y,
    draw: (ctx) => {
      const sprite = personSprite(look, 'down', 'stand');
      ctx.save();
      ctx.translate(Math.round(place.x * T - view.x), Math.round(place.y * T - view.y - 3));
      ctx.rotate(-Math.PI / 2);
      ctx.drawImage(sprite.canvas, -sprite.canvas.height + 4, -sprite.canvas.width / 2);
      ctx.restore();
      for (let i = 0; i < 3; i++) {
        const angle = time * 3 + (i * Math.PI * 2) / 3;
        ctx.fillStyle = '#ffe066';
        ctx.fillRect(Math.round(place.x * T - view.x - 10 + Math.cos(angle) * 5), Math.round(place.y * T - view.y - 10 + Math.sin(angle) * 2), 2, 2);
      }
    },
  };
}

function npcDrawings(game, view, time) {
  const fight = game.run.fight;
  const dueling = fight && fight.opponent.duel ? fight.opponent.npcId : null;
  const isVisible = (npc) => isNear(view, game.run.people[npc.id].x - 1, game.run.people[npc.id].y - 2, 2, 2);
  return NPCS.filter((npc) => game.run.visible[npc.id] && npc.id !== dueling && isVisible(npc)).map((npc) => {
    const place = game.run.people[npc.id];
    if (game.npcs[npc.id].ko) return lyingDrawing(npc.look, place, view, time);
    const mark = questMark(game, npc);
    const bob = Math.round(Math.sin(time * 4) * 1.5);
    return personDrawing(npc.look, place, view, time, npc.x, (ctx) => {
      if (mark) put(ctx, props.bubble(mark), place.x * T, place.y * T - headHeight(npc.look) + bob, view);
    });
  });
}

// The people at work in the villages, and the ones lying after a lightning strike.
function villagerDrawings(game, view, time) {
  const now = Date.now();
  return visibleVillagers(game)
    .concat(game.run.villagers.filter((villager) => villager.ko && !villager.dead && game.player.carrying?.id !== villager.id))
    .filter((villager) => isNear(view, villager.x - 1, villager.y - 2, 2, 2))
    .map((villager, i) => {
      if (villager.ko) return lyingDrawing(villager.look, villager, view, time);
      const age = villager.attackAnimAt ? now - villager.attackAnimAt : 9999;
      if (age >= 0 && age < 320 && (villager.attackDx || villager.attackDy)) {
        const len = Math.max(0.1, Math.hypot(villager.attackDx || 0, villager.attackDy || 0));
        const pulse = Math.sin((age / 320) * Math.PI) * 0.25;
        const shifted = { ...villager, x: villager.x + ((villager.attackDx || 0) / len) * pulse, y: villager.y + ((villager.attackDy || 0) / len) * pulse };
        return personDrawing(villager.look, shifted, view, time, i);
      }
      return personDrawing(villager.look, villager, view, time, i);
    });
}

function childDrawings(game, view, time) {
  return familyKidsList(game)
    .filter((kid) => isNear(view, kid.x - 1, kid.y - 2, 2, 2))
    .map((kid, i) => personDrawing(kid.look, kid, view, time, 200 + i));
}

function drawAnimalHp(ctx, animal, x, y, sprite, view) {
  if (!animal.maxHp || animal.hp === undefined || animal.hp >= animal.maxHp) return;
  const px = Math.round(x - view.x);
  const py = Math.round(y - sprite.ay - view.y) - 4;
  const w = 14;
  const fill = Math.max(1, Math.round((Math.max(0, animal.hp) / animal.maxHp) * w));
  ctx.fillStyle = '#1c1726';
  ctx.fillRect(px - 7, py, w, 3);
  ctx.fillStyle = '#ff4d6d';
  ctx.fillRect(px - 7, py, fill, 2);
}

function animalDrawings(game, view, time) {
  const HOP_KINDS = new Set(['rabbit', 'rabbitBrown', 'frog', 'squirrel', 'fawn', 'piglet', 'lamb', 'sparrow', 'crow', 'pheasant']);
  const farm = (game.run.animals || [])
    .filter((animal) => isNear(view, animal.x - 1, animal.y - 1, 2, 2))
    .map((animal) => ({
      y: animal.y,
      draw: (ctx) => {
        const sp = animalSprite(animal.kind, animal.dir, Math.floor(animal.step) % 2);
        put(ctx, shadow(), animal.x * T, animal.y * T, view);
        put(ctx, sp, animal.x * T, animal.y * T, view);
        drawAnimalHp(ctx, animal, animal.x * T, animal.y * T, sp, view);
      },
    }));
  const wild = (game.run.wildAnimals || [])
    .filter((w) => isNear(view, w.x - 1, w.y - 1, 2, 2))
    .map((w) => {
      const moving = w.walkX !== 0 || w.walkY !== 0;
      const frame = moving ? Math.floor(w.step) % 2 : Math.floor(time * 2 + w.x) % 2;
      const hop = moving && HOP_KINDS.has(w.kind) ? -Math.abs(Math.sin(w.step * 2.2)) * 3 : 0;
      const sp = animalSprite(w.kind, w.dir, frame);
      return {
        y: w.y,
        draw: (ctx) => {
          put(ctx, shadow(), w.x * T, w.y * T, view);
          put(ctx, sp, w.x * T, w.y * T + hop, view);
          drawAnimalHp(ctx, w, w.x * T, w.y * T + hop, sp, view);
        },
      };
    });
  return [...farm, ...wild];
}

// The boats of the harbors, rocking on the water with gentle ripples.
function boatDrawings(view, time) {
  return PORTS.filter((boat) => isNear(view, boat.x - 2, boat.y - 3, 4, 4)).map((boat) => ({
    y: boat.y + 1,
    draw: (ctx) => {
      const f = Math.floor(time * 1.5) % 2;
      const bx = Math.round((boat.x + 0.5) * T - view.x);
      const by = Math.round((boat.y + 1) * T - view.y);
      ctx.fillStyle = 'rgba(230, 246, 255, 0.55)';
      ctx.fillRect(bx - 12 - f, by - 2, 24 + f * 2, 2);
      put(ctx, buildings.boat(f), (boat.x + 0.5) * T, (boat.y + 1) * T, view);
    },
  }));
}

// Sparkling sun glints and blooming water lilies on calm outdoor waters.
function drawWaterLife(ctx, view, time) {
  const area = tilesOf(view, 0);
  if (area.bottom > INSIDE_TOP) return;
  for (let y = area.top; y <= area.bottom; y++) {
    for (let x = area.left; x <= area.right; x++) {
      if (tileAt(x, y) !== TILE.WATER) continue;
      const n = noise(x, y, 88);
      if (n < 0.032) {
        const nearBank = tileAt(x + 1, y) === TILE.GRASS || tileAt(x - 1, y) === TILE.GRASS || tileAt(x, y + 1) === TILE.GRASS || tileAt(x, y - 1) === TILE.GRASS;
        if (nearBank) {
          const bob = Math.sin(time * 2 + x + y) * 1.2;
          put(ctx, props.waterLily(x + y), (x + 0.5) * T, (y + 0.65) * T + bob, view);
          continue;
        }
      }
      if (n > 0.91 && Math.sin(time * 4.5 + x * 1.9 + y * 2.7) > 0.65) {
        const sx = Math.round((x + 0.25 + (n * 10 - 9) * 0.6) * T - view.x);
        const sy = Math.round((y + 0.4 + ((x + y) % 3) * 0.2) * T - view.y);
        ctx.fillStyle = 'rgba(235, 250, 255, 0.7)';
        ctx.fillRect(sx, sy, 3, 1);
      }
    }
  }
}

function followerDrawings(game, view, time) {
  return game.run.followers.map((follower, i) => {
    if (follower.kind === 'person') return personDrawing(npcOf(follower.id).look, follower, view, time, follower.x);
    if (follower.kind === 'soldier') {
      const frame = follower.walking ? Math.floor(follower.step * 2) % 2 : Math.floor(time * 2 + i) % 2;
      const sprite = obsidianSoldier(frame);
      const march = follower.walking ? -Math.abs(Math.sin(follower.step * 3)) * 2 : Math.sin(time * 2.5 + i) * 0.8;
      return {
        y: follower.y,
        draw: (ctx) => {
          put(ctx, shadow(), follower.x * T, follower.y * T, view);
          put(ctx, sprite, follower.x * T, follower.y * T + march, view);
        },
      };
    }
    const petBob = follower.walking ? -Math.abs(Math.sin(follower.step * 4)) * 2 : 0;
    return {
      y: follower.y,
      draw: (ctx) => {
        put(ctx, shadow(), follower.x * T, follower.y * T, view);
        put(ctx, obsidianCat(), follower.x * T, follower.y * T + petBob, view);
      },
    };
  });
}

// The picture of a monster on the map: 4 steps when it walks, a slow breath when it stands.
// It looks to the side it last walked to (monster.dir, see logic/monsters.js).
function monsterPicture(monster, time) {
  const dir = monster.dir || 'left';
  if (monster.moving === false) return monsterSprite(monster, dir, Math.floor(time * 1.5 + monster.step) % 2, 'idle');
  return monsterSprite(monster, dir, Math.floor(monster.step * 6) % 4);
}

function smallHealthBar(ctx, monster, x, y) {
  if (monster.health >= monster.maxHealth) return;
  ctx.fillStyle = '#1c1726';
  ctx.fillRect(x - 8, y, 16, 3);
  ctx.fillStyle = '#ff3b4f';
  ctx.fillRect(x - 7, y + 1, Math.max(1, Math.round((14 * monster.health) / monster.maxHealth)), 1);
}

// During a fight, the other monsters keep away from the fighters (they would hide them).
function isNearTheFight(game, monster) {
  return game.run.fight && Math.hypot(monster.x - game.player.x - 2, monster.y - game.player.y) < 6;
}

function monsterDrawings(game, view, time) {
  const opponent = game.run.fight ? game.run.fight.opponent : null;
  const now = Date.now();
  return game.run.monsters
    .filter((monster) => monster !== opponent && !isNearTheFight(game, monster) && isNear(view, monster.x - 1, monster.y - 3, 3, 3))
    .map((monster) => ({
      y: monster.y,
      draw: (ctx) => {
        const hitAge = monster.hitAt ? now - monster.hitAt : 9999;
        const shake = hitAge >= 0 && hitAge < 180 ? Math.round(Math.sin(hitAge * 0.09) * 2) : 0;
        const sprite = monsterPicture(monster, time);
        const x = monster.x * T + shake;
        const y = monster.y * T;
        put(ctx, shadow(), x, y, view);
        if (hitAge >= 0 && hitAge < 120 && Math.floor(hitAge / 35) % 2 === 0 && sprite.white) {
          put(ctx, { ...sprite, canvas: sprite.white }, x, y, view);
        } else {
          put(ctx, sprite, x, y, view);
        }
        const top = y - sprite.ay - view.y;
        put(ctx, props.typeDiamond(typeOf(monster.category).color), x, y - sprite.ay - 3 + Math.round(Math.sin(time * 5)), view);
        if (monster.tag !== 'normal') put(ctx, props.tagMark(monster.tag), x + 6, y - sprite.ay - 2, view); // Hard ! / Extreme !!
        smallHealthBar(ctx, monster, Math.round(x - view.x), top - 10);
      },
    }));
}

// The emotes over the heads: they pop up, then stay a moment.
function drawEmotes(ctx, game, view) {
  for (const item of activeEmotes(game)) {
    const { place, look } = emoteOwner(game, item, (id) => npcOf(id).look);
    if (!place) continue;
    const pop = Math.max(0, Math.round((item.until - Date.now() - 1450) / 50)); // the first moment: higher
    put(ctx, props.emoteBubble(item.icon), place.x * T + 6, place.y * T - headHeight(look) - pop, view);
  }
}

// The hero (with the person they carry on their back, if any).
function heroDrawing(game, view, time) {
  const player = game.player;
  const carried = player.carrying;
  return personDrawing(player.look, { x: player.x, y: player.y, dir: player.dir, step: player.step, walking: game.run.walking }, view, time, 0, (ctx) => {
    if (!carried) return;
    const look = carried.kind === 'npc' ? npcOf(carried.id).look : (game.run.villagers.find((item) => item.id === carried.id) || {}).look;
    if (look) lyingDrawing(look, { x: player.x, y: player.y - 1.2 }, view, time).draw(ctx);
  });
}

// ---------- Effects ----------

function drawBalls(ctx, game, view) {
  for (const ball of game.run.balls) {
    const x = Math.round(ball.x * T - view.x);
    const y = Math.round(ball.y * T - view.y - 10);
    for (let t = 3; t >= 1; t--) {
      ctx.globalAlpha = 0.22 * (4 - t) / 3;
      ctx.fillStyle = ball.color;
      const tx = Math.round((ball.x - ball.dx * t * 0.22) * T - view.x);
      const ty = Math.round((ball.y - ball.dy * t * 0.22) * T - view.y - 10);
      ctx.fillRect(tx - 2, ty - 2, 4, 4);
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x - 3, y - 3, 6, 6);
    ctx.fillStyle = ball.color;
    ctx.fillRect(x - 2, y - 2, 4, 4);
  }
}

function drawVfxRings(ctx, game, view) {
  for (const ring of game.run.vfxRings || []) {
    const t = Math.min(1, ring.age / ring.life);
    const r = (0.4 + ring.maxRadius * t) * T;
    ctx.globalAlpha = Math.max(0, 1 - t) * 0.85;
    ctx.strokeStyle = ring.color || '#b48cff';
    ctx.lineWidth = Math.max(1, (ring.width || 2) * (1 - t * 0.5));
    ctx.beginPath();
    ctx.arc(Math.round(ring.x * T - view.x), Math.round(ring.y * T - view.y - 4), r, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.lineWidth = 1;
}

function drawObsidianSpikes(ctx, game, view) {
  for (const sp of game.run.spikes || []) {
    const p = sp.age / sp.life;
    const grow = Math.min(1, p * 4.5);
    const fade = p > 0.7 ? Math.max(0, (1 - p) / 0.3) : 1;
    const h = Math.round(sp.h * grow);
    const x = Math.round(sp.x * T - view.x);
    const y = Math.round(sp.y * T - view.y);
    ctx.globalAlpha = fade;
    ctx.fillStyle = '#1c1428';
    ctx.beginPath();
    ctx.moveTo(x - 4, y);
    ctx.lineTo(x, y - h);
    ctx.lineTo(x + 4, y);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = sp.color || '#b48cff';
    ctx.fillRect(x - 1, y - h + 2, 2, Math.max(2, h - 4));
    ctx.fillStyle = '#f3d8ff';
    ctx.fillRect(x, y - h, 1, 3);
  }
  ctx.globalAlpha = 1;
}

function drawBarrierAuras(ctx, game, view, time) {
  for (const b of game.run.barriers || []) {
    const bx = Math.round((b.x + 0.5) * T - view.x);
    const by = Math.round((b.y + 0.7) * T - view.y);
    ctx.fillStyle = 'rgba(180, 140, 255, ' + (0.16 + Math.sin(time * 7 + b.x) * 0.08).toFixed(2) + ')';
    ctx.fillRect(bx - 7, by - 4, 14, 7);
  }
}

function drawHeroAura(ctx, game, view, time) {
  const player = game.player;
  if (!player.powers?.includes('obsidian')) return;
  const blade = player.obsidianBlade > 0;
  const active = blade || player.soldiers > 0 || player.obsidianResonance;
  const shards = blade || player.obsidianResonance ? 4 : active ? 3 : 1;
  const cx = player.x * T - view.x;
  const cy = player.y * T - view.y - 10;
  for (let i = 0; i < shards; i++) {
    const angle = time * (blade ? 4.2 : 2.5) + (i * Math.PI * 2) / shards;
    const sx = Math.round(cx + Math.cos(angle) * (blade ? 13 : 10));
    const sy = Math.round(cy + Math.sin(angle) * 5);
    ctx.fillStyle = '#1c1428';
    ctx.fillRect(sx - 2, sy - 2, 4, 4);
    ctx.fillStyle = blade || player.obsidianResonance ? '#e8c8ff' : '#9f78ff';
    ctx.fillRect(sx - 1, sy - 1, 2, 2);
  }
}

function drawStorm(ctx, game, view, time) {
  const storm = game.run.storm;
  if (!storm) return;
  ctx.strokeStyle = 'rgba(159, 216, 255, ' + (0.5 + Math.sin(time * 10) * 0.3) + ')';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(Math.round(storm.x * T - view.x), Math.round(storm.y * T - view.y), storm.radius * T, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = 'rgba(120, 180, 255, 0.12)';
  ctx.fill();
}

// A treasure shines when the player is very close, or from far with the obsidian cat.
function drawTreasureHint(ctx, game, view, time) {
  const treasure = closestTreasure(game, game.player.pet ? 9 : 2.5);
  if (!treasure || Math.sin(time * 6) < 0) return;
  const x = Math.round((treasure.x + 0.5) * T - view.x);
  const y = Math.round((treasure.y + 0.5) * T - view.y);
  ctx.fillStyle = '#fff6b0';
  ctx.fillRect(x - 3, y, 7, 1);
  ctx.fillRect(x, y - 3, 1, 7);
}

function drawParticleSquares(ctx, particles, view) {
  for (const particle of particles.filter((item) => !item.text)) {
    ctx.globalAlpha = Math.max(0, 1 - particle.age / particle.life);
    ctx.fillStyle = particle.color;
    ctx.fillRect(Math.round(particle.x * T - view.x), Math.round(particle.y * T - view.y), particle.size, particle.size);
  }
  ctx.globalAlpha = 1;
}

// Sparks rising from the burning houses during a raid. They only depend on the time: nothing to remember.
function drawEmbers(ctx, game, view, time) {
  for (const house of burningHouses(game, view)) {
    const span = Math.max(16, house.w * T - 16);
    for (let i = 0; i < 8; i++) {
      const life = (time * 0.6 + i / 8) % 1;
      const x = house.x * T + 8 + ((i * 37) % span) + Math.sin(time * 3 + i) * 4;
      const y = house.y * T + house.h * T * 0.25 - life * 45;
      ctx.fillStyle = life < 0.5 ? '#ffd23f' : '#ff6a2b';
      ctx.fillRect(Math.round(x - view.x), Math.round(y - view.y), 1, 1);
    }
  }
}

// Dark smoke rising from the burning houses.
function drawSmoke(ctx, game, view, time) {
  for (const house of burningHouses(game, view)) {
    for (let i = 0; i < 6; i++) {
      const life = (time * 0.25 + i / 6) % 1;
      const size = 3 + Math.round(life * 7);
      const x = house.x * T + house.w * T * (0.15 + i * 0.14) + Math.sin(time + i) * 6 - view.x;
      const y = house.y * T + house.h * T * 0.2 - life * 75 - view.y;
      ctx.fillStyle = 'rgba(40, 32, 44, ' + 0.55 * (1 - life) + ')';
      ctx.fillRect(Math.round(x - size / 2), Math.round(y - size / 2), size, size);
    }
  }
}

// ---------- Lights ----------

// The things that burn or glow.
const LIGHT_KINDS = { lamp: 58, torch: 52, campfire: 70, cauldron: 50, crystal: 40, wallTorch: 58, stove: 44, homeLamp: 44, obelisk: 24, shrine: 40, portalRuins: 46, hotSpring: 40, heroGrave: 26 }; // their radius, in pixels
const COLD_LIGHTS = ['crystal', 'obelisk', 'shrine', 'portalRuins', 'hotSpring', 'heroGrave']; // a magic light: no warm halo
const HERO_TORCH_LIGHT = 92; // pixels
const WINDOW_LIGHT = 44;
const KNIGHT_TORCH_LIGHT = 46;
const DEMON_GLOW = 26;
const BEDTIME = [21, 24]; // each house puts its lights out between these hours (and lights them again before dawn)

// No light by default at night: only the torch of the hero, the lamps, the fires and the magic.
function lightsOf(game, view, time = 0) {
  const lights = [];
  if (hasLight(game)) {
    const flick = Math.round(Math.sin(time * 7) * 3);
    lights.push({ x: game.player.x * T - view.x, y: game.player.y * T - 10 - view.y, radius: HERO_TORCH_LIGHT + flick, warm: true });
  }
  if (game.run.fight) {
    // a fight at night: a big light on the two fighters (and on the friends behind the hero)
    const middle = game.player.x + battleGap(game) / 2;
    lights.push({ x: middle * T - view.x, y: game.player.y * T - 16 - view.y, radius: 120 }, { x: middle * T - view.x, y: game.player.y * T - 16 - view.y, radius: 90 });
  }
  for (const prop of propsOfView(view, game)) {
    if (!isNear(view, prop.x, prop.y, prop.w, prop.h)) continue;
    const spec = structuresArt.structureLightSpec(prop.kind) || decorArt.decorLightSpec(prop.kind);
    const radius = LIGHT_KINDS[prop.kind] || (spec ? spec.radius : 0);
    if (!radius) continue;
    const flick = Math.round(Math.sin(time * 6 + prop.x * 1.7 + prop.y) * 3);
    const warm = LIGHT_KINDS[prop.kind] ? !COLD_LIGHTS.includes(prop.kind) : !spec.cold;
    lights.push({ x: (prop.x + prop.w / 2) * T - view.x, y: (prop.y + prop.h) * T - 12 - view.y, radius: radius + flick, warm: warm });
  }
  for (const house of burningHouses(game, view)) {
    lights.push({ x: (house.x + house.w / 2) * T - view.x, y: (house.y + house.h * 0.3) * T - view.y, radius: Math.max(70, house.w * 8), warm: true });
  }
  lights.push(...windowLights(game, view), ...walkingLights(game, view, time), ...isekaiArt.isekaiLights(game, view, time));
  return lights;
}

// Is somebody still awake in this house? Each house has its own bedtime, and wakes up a bit before the sun.
function hasLitWindows(game, house) {
  const bedtime = BEDTIME[0] + noise(house.x, house.y, 61) * (BEDTIME[1] - BEDTIME[0]);
  return (game.hour >= 17 && game.hour < bedtime) || (game.hour >= 5 && game.hour < 8);
}

// The windows of the houses where people are awake: a warm light on their front wall.
function windowLights(game, view) {
  return housesNear(view)
    .filter((house) => house.style !== 'tent' && isNear(view, house.x - 3, house.y - 3, house.w + 6, house.h + 6) && hasLitWindows(game, house))
    .map((house) => ({ x: (house.x + house.w / 2) * T - view.x, y: (house.y + house.h - 1.4) * T - view.y, radius: WINDOW_LIGHT + house.w * 2, warm: true }));
}

// The lights that walk: the torches of the knights on guard, the red glow of the demons.
function walkingLights(game, view, time) {
  const lights = [];
  for (const knight of visibleVillagers(game).filter((villager) => villager.knight && isNear(view, villager.x - 3, villager.y - 3, 6, 6))) {
    const flick = Math.round(Math.sin(time * 6 + knight.x) * 2);
    lights.push({ x: knight.x * T - view.x, y: knight.y * T - 10 - view.y, radius: KNIGHT_TORCH_LIGHT + flick, warm: true });
  }
  for (const monster of game.run.monsters.filter((item) => item.tier === 'demon' && isNear(view, item.x - 2, item.y - 3, 4, 4))) {
    lights.push({ x: monster.x * T - view.x, y: monster.y * T - 10 - view.y, radius: DEMON_GLOW, warm: true });
  }
  return lights;
}

// The screen goes black for a moment when the hero takes stairs or a boat.
function drawFade(ctx, game) {
  const left = game.run.fadeUntil - Date.now();
  if (left <= 0) return;
  ctx.fillStyle = 'rgba(0, 0, 0, ' + Math.min(1, left / 250) + ')';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

// ---------- The texts, written on the big screen (sharper than in the buffer) ----------

function writeText(ctx, text, x, y, size, color) {
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

function writeNames(ctx, game, view, scale) {
  if (game.run.fight) return;
  for (const npc of NPCS.filter((item) => game.run.visible[item.id])) {
    const place = game.run.people[npc.id];
    if (Math.hypot(place.x - game.player.x, place.y - game.player.y) > NAME_RANGE) continue;
    writeText(ctx, npc.name, (place.x * T - view.x) * scale, (place.y * T - headHeight(npc.look) - view.y) * scale, 13, '#ffe9a8');
  }
  for (const party of game.run.parties || []) {
    if (!party.chat || !party.chat.text) continue;
    const speaker = party.members[party.chat.memberIndex] || party.members[0];
    if (!speaker || speaker.hp <= 0) continue;
    if (Math.hypot(speaker.x - game.player.x, speaker.y - game.player.y) > 9) continue;
    writeText(ctx, speaker.name + ': ' + party.chat.text, (speaker.x * T - view.x) * scale, (speaker.y * T - 38 - view.y) * scale, 12, '#e6f6ff');
  }
}

function writeFloatingTexts(ctx, game, view, scale) {
  for (const particle of game.run.particles.filter((item) => item.text)) {
    ctx.globalAlpha = Math.max(0, 1 - particle.age / particle.life);
    writeText(ctx, particle.text, (particle.x * T - view.x) * scale, (particle.y * T - view.y) * scale, particle.size + 4, particle.color);
  }
  ctx.globalAlpha = 1;
}

// During a raid, the edges of the screen pulse in red. A thunder makes everything white for a moment.
function drawAlerts(ctx, game, width, height, time) {
  if (game.raid.active) {
    ctx.strokeStyle = 'rgba(255, 40, 40, ' + (0.35 + Math.sin(time * 4) * 0.2) + ')';
    ctx.lineWidth = 12;
    ctx.strokeRect(0, 0, width, height);
  }
  if (Date.now() < game.run.flashUntil) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillRect(0, 0, width, height);
  }
}

// ---------- Everything ----------

// The buffer, at the size of the screen divided by the scale.
function prepareBuffer(width, height, scale) {
  const w = Math.ceil(width / scale);
  const h = Math.ceil(height / scale);
  if (buffer.width !== w || buffer.height !== h) {
    buffer.width = w;
    buffer.height = h;
  }
  const ctx = buffer.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  return ctx;
}

function drawSorted(ctx, drawings) {
  drawings.sort((a, b) => a.y - b.y).forEach((drawing) => drawing.draw(ctx));
}

function showBuffer(ctx, width, height, scale) {
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(buffer, 0, 0, buffer.width * scale, buffer.height * scale);
}

// In a fight, the camera comes closer (bigger pixels): the fighters fill the screen. The world must stay
// at least 200 pixels of art wide (room for the friends behind the hero and the opponent).
function fightScale(width, height) {
  const scale = pixelScale(width, height);
  return Math.max(scale, Math.min(Math.round(scale * 1.35), Math.floor(width / 200)));
}

// Persistent crimson blood pools & splatters on the map after combat.
function drawBloodPools(ctx, game, view) {
  const blood = game && game.run && Array.isArray(game.run.blood) ? game.run.blood : [];
  for (const pool of blood) {
    if (!isNear(view, pool.x - 1, pool.y - 1, 2, 2)) continue;
    const fade = Math.max(0, Math.min(1, (pool.life - pool.age) / 6));
    const cx = Math.round(pool.x * T - view.x);
    const cy = Math.round(pool.y * T - view.y);
    const rx = Math.max(3, Math.round(pool.r * T));
    const ry = Math.max(2, Math.round(rx * 0.62));
    ctx.globalAlpha = fade * 0.85;
    ctx.fillStyle = '#5c0912';
    ctx.fillRect(cx - rx, cy - ry + 1, rx * 2, ry * 2 - 1);
    ctx.fillStyle = '#9e1522';
    ctx.fillRect(cx - Math.max(2, rx - 1), cy - Math.max(1, ry - 1), Math.max(3, rx * 2 - 2), Math.max(2, ry * 2 - 3));
    const sx = ((pool.seed * 13) % 5) - 2;
    const sy = ((pool.seed * 29) % 4) - 2;
    ctx.fillStyle = '#7a0e16';
    ctx.fillRect(cx + Math.round(sx) - rx - 1, cy + Math.round(sy), 2, 2);
    ctx.fillRect(cx - Math.round(sx) + rx, cy - Math.round(sy), 2, 1);
  }
  ctx.globalAlpha = 1;
}

// Temporary footprints & herd hoof tracks fading gently in sand, snow or rain-wet soil.
function drawTracks(ctx, game, view) {
  const tracks = game && game.run && Array.isArray(game.run.tracks) ? game.run.tracks : [];
  if (tracks.length === 0) return;
  for (const track of tracks) {
    if (!isNear(view, track.x - 1, track.y - 1, 2, 2)) continue;
    const fade = Math.max(0, Math.min(1, 1 - track.age / track.life));
    const cx = Math.round(track.x * T - view.x);
    const cy = Math.round(track.y * T - view.y);
    ctx.globalAlpha = fade * 0.42;
    ctx.fillStyle = '#302820';
    if (track.kind === 'hoof') {
      ctx.fillRect(cx - 1, cy - 1, 1, 2);
      ctx.fillRect(cx + 1, cy - 1, 1, 2);
    } else {
      ctx.fillRect(cx - 1, cy, 2, 2);
    }
  }
  ctx.globalAlpha = 1;
}

function drawHeroSlash(ctx, game, view) {
  const left = game.run.slashUntil ? game.run.slashUntil - Date.now() : 0;
  if (left <= 0) return;
  const cx = Math.round(game.player.x * T - view.x);
  const cy = Math.round(game.player.y * T - view.y - 8);
  const dir = game.run.slashDir || game.player.dir;
  const angles = { right: [-0.95, 0.95], left: [Math.PI - 0.95, Math.PI + 0.95], down: [Math.PI / 2 - 0.95, Math.PI / 2 + 0.95], up: [-Math.PI / 2 - 0.95, -Math.PI / 2 + 0.95] };
  const [a0, a1] = angles[dir] || angles.down;
  const alpha = Math.min(1, left / 150).toFixed(2);
  const obsidian = game.player.obsidianBlade > 0;
  ctx.strokeStyle = obsidian ? 'rgba(180, 110, 255, ' + alpha + ')' : 'rgba(130, 210, 255, ' + alpha + ')';
  ctx.lineWidth = obsidian ? 5 : 4;
  ctx.beginPath();
  ctx.arc(cx, cy, obsidian ? 16 : 14, a0, a1);
  ctx.stroke();
  ctx.strokeStyle = obsidian ? 'rgba(255, 225, 255, ' + alpha + ')' : 'rgba(255, 250, 210, ' + alpha + ')';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, obsidian ? 15 : 13, a0 + 0.15, a1 - 0.15);
  ctx.stroke();
  ctx.lineWidth = 1;
}

// The world around the player. width, height: the size of the screen canvas. time: seconds.
export function drawScene(ctx, game, width, height, time) {
  const scale = game.run.fight ? fightScale(width, height) : pixelScale(width, height);
  const art = prepareBuffer(width, height, scale);
  const view = viewOf(game, buffer.width, buffer.height);
  const fight = game.run.fight;

  drawGround(art, game, view, time);
  drawTracks(art, game, view);
  drawWaterLife(art, view, time);
  drawBloodPools(art, game, view);
  drawBarrierAuras(art, game, view, time);
  drawStorm(art, game, view, time);
  drawTreasureHint(art, game, view, time);
  const followers = fight ? [] : followerDrawings(game, view, time); // in a fight, the friends stand with the hero (battle.js)
  const living = [...npcDrawings(game, view, time), ...villagerDrawings(game, view, time), ...childDrawings(game, view, time), ...guildPatronDrawings(game, view, time), ...animalDrawings(game, view, time), ...followers, ...monsterDrawings(game, view, time)];
  if (!fight) living.push(heroDrawing(game, view, time));
  living.push(...warDrawings(game, view, time), ...societyDrawings(game, view, time), ...campDrawings(game, view, time), ...bondsDrawings(game, view, time), ...partyDrawings(game, view, time), ...economyDrawings(game, view, time));
  drawSorted(art, [...treesAndRocks(view), ...houses(view, game, time), ...villageProps(view, time, game), ...chestsAndBarriers(view, game), ...sealDrawings(view, game, time), ...boatDrawings(view, time), ...living]);
  if (!fight) {
    drawHeroAura(art, game, view, time);
    drawHeroSlash(art, game, view);
    drawObsidianSpikes(art, game, view);
    drawVfxRings(art, game, view);
  }
  if (!fight) drawEmotes(art, game, view);
  if (fight) drawBattle(art, game, view, time);
  drawBalls(art, game, view);
  drawParticleSquares(art, game.run.particles, view);
  drawEmbers(art, game, view, time);
  drawSmoke(art, game, view, time);
  drawWarEffects(art, game, view, time);
  drawSocietyEffects(art, game, view, time);
  drawCampEffects(art, game, view, time);
  drawBondsEffects(art, game, view, time);
  drawPartyEffects(art, game, view);
  isekaiArt.drawIsekaiEffects(art, game, view, time);
  structuresArt.drawStructureAmbience(art, game, view, time);
  drawWeather(art, game, view, time);
  drawLights(art, game, buffer.width, buffer.height, lightsOf(game, view, time), darknessHere(game));
  drawFade(art, game);

  showBuffer(ctx, width, height, scale);
  writeNames(ctx, game, view, scale);
  writeFloatingTexts(ctx, game, view, scale);
  if (fight) writeBattleWords(ctx, game, view, scale, time);
  drawAlerts(ctx, game, width, height, time);
}

const landscapeCache = { key: '', canvas: document.createElement('canvas') };

// A place of the world, without its people: the background of the start screen (Eldermoor, slowly passing by),
// or the small picture of a place on the world map. center: { x, y } in tiles (null = Eldermoor, moving).
// scale: screen pixels per pixel of the art (null = the usual one).
export function drawLandscape(ctx, width, height, time, center = null, scale = null) {
  scale = scale || pixelScale(width, height);
  const w = Math.ceil(width / scale);
  const h = Math.ceil(height / scale);
  const centerX = center ? center.x * T : (HOME_DOOR.x + Math.sin(time * 0.04) * 8) * T; // Eldermoor, slowly passing by
  const centerY = center ? center.y * T : HOME_DOOR.y * T;
  const vx = Math.round(centerX - w / 2);
  const vy = Math.round(centerY - h / 2);
  const waterFrame = Math.floor(time * 2) % 4;
  const flameFrame = Math.floor(time * 6) % 3;
  const cacheKey = `${w}x${h}|${vx},${vy}|${waterFrame}|${flameFrame}|${getMapRevision()}`;

  if (landscapeCache.key === cacheKey && landscapeCache.canvas.width === w && landscapeCache.canvas.height === h) {
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(landscapeCache.canvas, 0, 0, w * scale, h * scale);
    return;
  }

  const art = prepareBuffer(width, height, scale);
  const view = { x: vx, y: vy, width: buffer.width, height: buffer.height };
  drawGround(art, null, view, time);
  drawSorted(art, [...treesAndRocks(view), ...houses(view, null, time), ...villageProps(view, time, null), ...chestsAndBarriers(view, null), ...boatDrawings(view, time)]);

  if (landscapeCache.canvas.width !== w || landscapeCache.canvas.height !== h) {
    landscapeCache.canvas.width = w;
    landscapeCache.canvas.height = h;
  }
  const lctx = landscapeCache.canvas.getContext('2d');
  lctx.imageSmoothingEnabled = false;
  lctx.drawImage(buffer, 0, 0);
  landscapeCache.key = cacheKey;
  showBuffer(ctx, width, height, scale);
}
