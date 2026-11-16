import { DUNGEONS, ISLE_BRIDGE } from '../data/zones';
import { noise } from './noise';

// The outside of the dungeons, built on the island: a cave in a cliff, a frozen castle, a camp of tents,
// the titanic castle of the demon, broken ruins, a tower, the mouth of a mine.
// Each one has a door (a STAIRS tile) that leads to its first floor (see insides.js).
// The tiles are written in `tiles`; the things standing on them are listed in STRUCTURE_PROPS.

// The numbers of world/map.js TILE (copied here: map.js imports this file).
const T = { GRASS: 0, PATH: 2, SAND: 3, WATER: 4, STONE: 7, ASH: 8, LAVA: 9, WALL: 11, FLOOR: 12, BRIDGE: 17, CLIFF: 18, STAIRS: 20 };

export const STRUCTURE_PROPS = [];

function set(tiles, x, y, tile) {
  if (x >= 0 && y >= 0 && x < 256 && y < 256) tiles[y * 256 + x] = tile;
}

function get(tiles, x, y) {
  return tiles[y * 256 + x];
}

function fill(tiles, x, y, w, h, tile) {
  for (let row = y; row < y + h; row++) for (let column = x; column < x + w; column++) set(tiles, column, row, tile);
}

// The border of a rectangle, `thick` tiles thick, with a hole of `gap` tiles in the middle of the bottom side.
function ring(tiles, x, y, w, h, tile, gap) {
  fill(tiles, x, y, w, 1, tile);
  fill(tiles, x, y, 1, h, tile);
  fill(tiles, x + w - 1, y, 1, h, tile);
  const middle = x + Math.floor(w / 2) - Math.floor(gap / 2);
  fill(tiles, x, y + h - 1, middle - x, 1, tile);
  fill(tiles, middle + gap, y + h - 1, x + w - middle - gap, 1, tile);
}

function prop(kind, x, y, w = 1, h = 1, extra = {}) {
  STRUCTURE_PROPS.push({ kind: kind, x: x, y: y, w: w, h: h, ...extra });
}

// A path of 2 tiles from (x, y) going down until it meets a road (or 20 tiles): nobody is locked out.
function pathDown(tiles, x, y) {
  for (let step = 0; step < 20; step++) {
    const row = y + step;
    const met = step > 1 && (get(tiles, x, row) === T.PATH || get(tiles, x + 1, row) === T.PATH);
    for (const column of [x, x + 1]) {
      const tile = get(tiles, column, row);
      if (tile === T.WATER) set(tiles, column, row, T.BRIDGE);
      else if (tile !== T.BRIDGE && tile !== T.STAIRS) set(tiles, column, row, T.PATH);
    }
    if (met) return;
  }
}

// ---------- The looks ----------

// A cave in a cliff of blue crystals.
function buildCave(tiles, d) {
  fill(tiles, d.x, d.y, d.w, d.h, T.GRASS);
  fill(tiles, d.x + 2, d.y + 1, d.w - 4, d.h - 4, T.CLIFF);
  set(tiles, d.door[0], d.door[1], T.STAIRS);
  set(tiles, d.door[0], d.door[1] - 1, T.CLIFF);
  for (const [dx, dy] of [[1, 2], [d.w - 2, 3], [3, d.h - 2], [d.w - 4, d.h - 2], [1, d.h - 4]]) prop('crystal', d.x + dx, d.y + dy);
  pathDown(tiles, d.door[0], d.door[1] + 1);
}

// The frozen castle: walls of ice, four towers, a courtyard of snow, the keep with its door.
function buildCastle(tiles, d) {
  fill(tiles, d.x, d.y, d.w, d.h, T.STONE);
  ring(tiles, d.x + 1, d.y + 1, d.w - 2, d.h - 2, T.WALL, 4);
  for (const [tx, ty] of [[d.x, d.y], [d.x + d.w - 3, d.y], [d.x, d.y + d.h - 3], [d.x + d.w - 3, d.y + d.h - 3]]) fill(tiles, tx, ty, 3, 3, T.WALL);
  const keepW = 14;
  const keepX = d.door[0] - Math.floor(keepW / 2) + 1;
  fill(tiles, keepX, d.y + 5, keepW, d.door[1] - d.y - 5, T.WALL);
  set(tiles, d.door[0], d.door[1], T.STAIRS);
  set(tiles, d.door[0] + 1, d.door[1], T.STAIRS);
  prop('keepFacade', keepX, d.door[1] - 1, keepW, 1, { look: 'ice', walkable: true }); // drawn over the front of the keep
  prop('turret', keepX - 1, d.y + 7, 2, 1, { look: 'ice', walkable: true });
  prop('turret', keepX + keepW - 1, d.y + 7, 2, 1, { look: 'ice', walkable: true });
  prop('banner', d.door[0] - 2, d.door[1] + 1, 1, 1, { color: '#9fd8ff' });
  prop('banner', d.door[0] + 3, d.door[1] + 1, 1, 1, { color: '#9fd8ff' });
  prop('torch', d.door[0] - 1, d.door[1] + 1);
  prop('torch', d.door[0] + 2, d.door[1] + 1);
  fill(tiles, d.door[0], d.door[1] + 1, 2, d.y + d.h - d.door[1] - 1, T.PATH);
  pathDown(tiles, d.door[0], d.y + d.h);
}

// The camp of the bandits: a palisade, tents, fires, and the big tent of the General.
function buildCamp(tiles, d) {
  fill(tiles, d.x, d.y, d.w, d.h, T.SAND);
  for (let x = d.x; x < d.x + d.w; x++) {
    prop('palisade', x, d.y, 1, 1, { side: 'row' });
    if (Math.abs(x - d.door[0]) > 1) prop('palisade', x, d.y + d.h - 1, 1, 1, { side: 'row' });
  }
  for (let y = d.y + 1; y < d.y + d.h - 1; y++) {
    prop('palisade', d.x, y, 1, 1, { side: 'column' });
    prop('palisade', d.x + d.w - 1, y, 1, 1, { side: 'column' });
  }
  prop('bigTent', d.door[0] - 2, d.door[1] - 3, 5, 3);
  set(tiles, d.door[0], d.door[1], T.STAIRS);
  for (const [dx, dy] of [[3, 3], [d.w - 7, 3], [3, d.h - 7], [d.w - 7, d.h - 7]]) prop('tent', d.x + dx, d.y + dy, 3, 2);
  prop('campfire', d.door[0] - 4, d.door[1] + 2);
  prop('campfire', d.door[0] + 4, d.door[1] + 2);
  prop('crates', d.x + 2, d.y + d.h - 3);
  prop('barrels', d.x + d.w - 3, d.y + d.h - 3);
  fill(tiles, d.door[0] - 1, d.door[1] + 1, 2, d.y + d.h - d.door[1], T.PATH);
  pathDown(tiles, d.door[0] - 1, d.y + d.h);
}

// The castle of the Demon King: titanic. Black walls, seven towers, a ring of lava inside the walls,
// a courtyard of ash, the keep in the middle. Rivers of lava all around it (see lavaRivers).
function buildDemonCastle(tiles, d) {
  fill(tiles, d.x, d.y, d.w, d.h, T.ASH);
  ring(tiles, d.x + 1, d.y + 1, d.w - 2, d.h - 2, T.WALL, 4);
  ring(tiles, d.x + 2, d.y + 2, d.w - 4, d.h - 4, T.WALL, 4);
  const towers = [[0, 0], [d.w - 4, 0], [0, d.h - 4], [d.w - 4, d.h - 4], [Math.floor(d.w / 2) - 2, 0], [0, Math.floor(d.h / 2) - 2], [d.w - 4, Math.floor(d.h / 2) - 2]];
  towers.forEach(([dx, dy]) => fill(tiles, d.x + dx, d.y + dy, 4, 4, T.WALL));
  ring(tiles, d.x + 5, d.y + 5, d.w - 10, d.h - 10, T.LAVA, 4); // the ring of lava, crossed by the way to the keep
  const keepW = 22;
  const keepX = d.door[0] - Math.floor(keepW / 2) + 1;
  fill(tiles, keepX, d.y + 8, keepW, d.door[1] - d.y - 8, T.WALL);
  set(tiles, d.door[0], d.door[1], T.STAIRS);
  set(tiles, d.door[0] + 1, d.door[1], T.STAIRS);
  for (const [dx, dy] of [[7, 9], [d.w - 10, 9], [7, d.h - 11], [d.w - 10, d.h - 11]]) fill(tiles, d.x + dx, d.y + dy, 3, 2, T.LAVA);
  prop('keepFacade', keepX, d.door[1] - 1, keepW, 1, { look: 'demon', walkable: true }); // drawn over the front of the keep
  for (const tx of [keepX - 1, keepX + keepW - 1]) for (const ty of [d.y + 9, d.door[1] - 8]) prop('turret', tx, ty, 2, 1, { look: 'demon', walkable: true });
  prop('banner', d.door[0] - 3, d.door[1] + 1, 1, 1, { color: '#ff3b4f' });
  prop('banner', d.door[0] + 4, d.door[1] + 1, 1, 1, { color: '#ff3b4f' });
  prop('torch', d.door[0] - 1, d.door[1] + 1);
  prop('torch', d.door[0] + 2, d.door[1] + 1);
  prop('demonSpire', d.door[0] - 3, d.y + 8, 8, 1, { walkable: true }); // drawn over the keep: its titanic tower
  // the road from the gate of the castle to the bridge of the isle (it crosses the lava ring and the walls)
  for (let y = d.door[1] + 1; y < 66; y++) fill(tiles, d.door[0], y, 2, 1, T.PATH);
}

// Ruins: broken walls (holes everywhere), pillars, and a temple in the middle with the stairs down.
function buildRuins(tiles, d) {
  for (let y = d.y; y < d.y + d.h; y++) {
    for (let x = d.x; x < d.x + d.w; x++) {
      const isWallLine = (x - d.x) % 9 === 0 || (y - d.y) % 8 === 0;
      set(tiles, x, y, isWallLine && noise(x, y, 77) < 0.55 ? T.WALL : noise(x, y, 78) < 0.5 ? T.FLOOR : T.GRASS);
    }
  }
  fill(tiles, d.door[0] - 4, d.door[1] - 5, 10, 5, T.WALL);
  fill(tiles, d.door[0] - 4, d.door[1] + 1, 10, 3, T.FLOOR);
  set(tiles, d.door[0], d.door[1], T.STAIRS);
  set(tiles, d.door[0] + 1, d.door[1], T.STAIRS);
  for (let i = 0; i < 10; i++) {
    const x = d.x + 2 + Math.floor(noise(i, 3, 79) * (d.w - 4));
    const y = d.y + 2 + Math.floor(noise(3, i, 79) * (d.h - 4));
    if (Math.abs(x - d.door[0]) > 5 || Math.abs(y - d.door[1]) > 6) prop('ruinPillar', x, y);
  }
  fill(tiles, d.door[0], d.door[1] + 1, 2, d.y + d.h - d.door[1] - 1, T.PATH);
  pathDown(tiles, d.door[0], d.y + d.h);
}

// The old watchtower: a round tower of stone (its picture is a prop), the door at its foot.
function buildTower(tiles, d) {
  fill(tiles, d.x, d.y, d.w, d.h, T.GRASS);
  const cx = d.door[0];
  for (let y = d.door[1] - 6; y < d.door[1]; y++) {
    for (let x = cx - 3; x <= cx + 3; x++) {
      if (Math.hypot(x - cx, y - (d.door[1] - 3)) <= 3.6) set(tiles, x, y, T.WALL);
    }
  }
  set(tiles, cx, d.door[1], T.STAIRS);
  prop('watchtower', cx - 3, d.door[1], 7, 1, { walkable: true }); // its picture covers the walls, its door on the stairs
  pathDown(tiles, cx, d.door[1] + 1);
}

// The mouth of a mine: a small cliff with a frame of wood, rails going in.
function buildMine(tiles, d) {
  fill(tiles, d.x, d.y, d.w, d.h, T.GRASS);
  fill(tiles, d.x + 1, d.y, d.w - 2, d.door[1] - d.y, T.CLIFF);
  set(tiles, d.door[0], d.door[1], T.STAIRS);
  fill(tiles, d.door[0], d.door[1] + 1, 1, 2, T.PATH);
  prop('mineFrame', d.door[0] - 1, d.door[1], 3, 1, { walkable: true });
  prop('minecart', d.door[0] + 2, d.door[1] + 1);
  prop('lamp', d.door[0] - 2, d.door[1] + 1);
  pathDown(tiles, d.door[0], d.door[1] + 2);
}

const BUILDERS = { cave: buildCave, castle: buildCastle, camp: buildCamp, demonCastle: buildDemonCastle, ruins: buildRuins, tower: buildTower, mine: buildMine };

// Rivers of lava on the demon island, from the castle to the sea: "plenty of lava".
function lavaRivers(tiles) {
  const starts = [[20, 30], [70, 26], [30, 50], [62, 52], [12, 12], [80, 8]];
  starts.forEach(([x0, y0], i) => {
    let x = x0;
    let y = y0;
    for (let step = 0; step < 40; step++) {
      if (get(tiles, x, y) === T.ASH) set(tiles, x, y, T.LAVA);
      if (get(tiles, x + 1, y) === T.ASH && step % 3 === 0) set(tiles, x + 1, y, T.LAVA);
      x += Math.round((noise(step, i, 80) - 0.5) * 2.4);
      y += noise(i, step, 81) < 0.5 ? 1 : -1;
      if (x < 1 || y < 1 || x > 100 || y > 64) return;
    }
  });
}

// The bridge to the demon island, over its moat.
function isleBridge(tiles) {
  fill(tiles, ISLE_BRIDGE.x, ISLE_BRIDGE.y, ISLE_BRIDGE.w, ISLE_BRIDGE.h, T.BRIDGE);
  fill(tiles, ISLE_BRIDGE.x, ISLE_BRIDGE.y - 1, ISLE_BRIDGE.w, 1, T.PATH);
  fill(tiles, ISLE_BRIDGE.x, ISLE_BRIDGE.y + ISLE_BRIDGE.h, ISLE_BRIDGE.w, 2, T.PATH);
  prop('torch', ISLE_BRIDGE.x - 1, ISLE_BRIDGE.y + ISLE_BRIDGE.h);
  prop('torch', ISLE_BRIDGE.x + ISLE_BRIDGE.w, ISLE_BRIDGE.y + ISLE_BRIDGE.h);
}

export function buildStructures(tiles) {
  lavaRivers(tiles);
  for (const dungeon of DUNGEONS) BUILDERS[dungeon.look](tiles, dungeon);
  isleBridge(tiles);
}
