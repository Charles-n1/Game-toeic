import { DUNGEONS, ISLE_BRIDGE } from '../data/zones';
import { TILE } from './tileKinds';
import { getTile, setTile, fillRect, natureBiome } from './grid';
import { noise } from './noise';

// The outside of the dungeons: a cave in a cliff, a frozen castle, a camp of tents, the titanic castle of the
// demon, broken ruins, a tower, the mouth of a mine. Each one has a door (a STAIRS tile) that leads to its
// first floor (see insides.js). The tiles are written on the map; the things standing on them are listed in
// STRUCTURE_PROPS.

export const STRUCTURE_PROPS = [];

const GROUND_OF = { mountain: TILE.STONE, desert: TILE.SAND, coast: TILE.SAND, demon: TILE.ASH };

// The bare ground of the land at (x, y): grass, sand, snow or ash.
function bareGround(x, y) {
  return GROUND_OF[natureBiome(x, y)] ?? TILE.GRASS;
}

function clear(x, y, w, h) {
  for (let row = y; row < y + h; row++) for (let column = x; column < x + w; column++) setTile(column, row, bareGround(column, row));
}

// The border of a rectangle, with a hole of `gap` tiles in the middle of the bottom side.
function ring(x, y, w, h, tile, gap) {
  fillRect(x, y, w, 1, tile);
  fillRect(x, y, 1, h, tile);
  fillRect(x + w - 1, y, 1, h, tile);
  const middle = x + Math.floor(w / 2) - Math.floor(gap / 2);
  fillRect(x, y + h - 1, middle - x, 1, tile);
  fillRect(middle + gap, y + h - 1, x + w - middle - gap, 1, tile);
}

function prop(kind, x, y, w = 1, h = 1, extra = {}) {
  STRUCTURE_PROPS.push({ kind: kind, x: x, y: y, w: w, h: h, ...extra });
}

// A path of 2 tiles from (x, y) down to the bottom of the place (the roads of world/roads.js go on from there).
function pathDown(x, y, bottom) {
  for (let row = y; row < bottom; row++) {
    for (const column of [x, x + 1]) {
      const tile = getTile(column, row);
      if (tile === TILE.WATER) setTile(column, row, TILE.BRIDGE);
      else if (tile !== TILE.BRIDGE && tile !== TILE.STAIRS) setTile(column, row, TILE.PATH);
    }
  }
}

// ---------- The looks ----------

// A cave in a cliff (of blue crystals when it hides some).
function buildCave(d) {
  const [doorX, doorY] = d.door;
  clear(d.x, doorY + 1, d.w, d.y + d.h - doorY - 1);
  fillRect(d.x + 2, d.y, d.w - 4, doorY - d.y + 1, TILE.CLIFF);
  setTile(doorX, doorY, TILE.STAIRS);
  if (d.crystals && !d.wild) {
    for (const [dx, dy] of [[1, 2], [d.w - 2, 3], [3, d.h - 2], [d.w - 4, d.h - 2], [1, d.h - 4]]) prop('crystal', d.x + dx, d.y + dy);
  } else {
    setTile(d.x + 1, doorY + 1, TILE.ROCK);
    setTile(d.x + d.w - 2, doorY + 2, TILE.ROCK);
  }
  pathDown(doorX, doorY + 1, d.y + d.h);
}

// The frozen castle: walls of ice, four towers, a courtyard of snow, the keep with its door.
function buildCastle(d) {
  const [doorX, doorY] = d.door;
  fillRect(d.x, d.y, d.w, d.h, TILE.STONE);
  ring(d.x + 1, d.y + 1, d.w - 2, d.h - 2, TILE.WALL, 4);
  for (const [tx, ty] of [[d.x, d.y], [d.x + d.w - 4, d.y], [d.x, d.y + d.h - 4], [d.x + d.w - 4, d.y + d.h - 4]]) fillRect(tx, ty, 4, 4, TILE.WALL);
  const keepW = 20;
  const keepX = doorX - Math.floor(keepW / 2) + 1;
  fillRect(keepX, d.y + 7, keepW, doorY - d.y - 7, TILE.WALL);
  setTile(doorX, doorY, TILE.STAIRS);
  setTile(doorX + 1, doorY, TILE.STAIRS);
  prop('keepFacade', keepX, doorY - 1, keepW, 1, { look: 'ice', walkable: true }); // drawn over the front of the keep
  prop('turret', keepX - 1, d.y + 9, 2, 1, { look: 'ice', walkable: true });
  prop('turret', keepX + keepW - 1, d.y + 9, 2, 1, { look: 'ice', walkable: true });
  prop('banner', doorX - 3, doorY + 1, 1, 1, { color: '#9fd8ff' });
  prop('banner', doorX + 4, doorY + 1, 1, 1, { color: '#9fd8ff' });
  prop('torch', doorX - 1, doorY + 1);
  prop('torch', doorX + 2, doorY + 1);
  pathDown(doorX, doorY + 1, d.y + d.h);
}

// The camp of the General: a palisade, tents, fires, and the big tent of the General.
function buildCamp(d) {
  const [doorX, doorY] = d.door;
  fillRect(d.x, d.y, d.w, d.h, TILE.SAND);
  for (let x = d.x; x < d.x + d.w; x++) {
    prop('palisade', x, d.y, 1, 1, { side: 'row' });
    if (Math.abs(x - doorX) > 2) prop('palisade', x, d.y + d.h - 1, 1, 1, { side: 'row' });
  }
  for (let y = d.y + 1; y < d.y + d.h - 1; y++) {
    prop('palisade', d.x, y, 1, 1, { side: 'column' });
    prop('palisade', d.x + d.w - 1, y, 1, 1, { side: 'column' });
  }
  prop('bigTent', doorX - 4, doorY - 5, 10, 6);
  setTile(doorX, doorY, TILE.STAIRS);
  for (const [dx, dy] of [[4, 4], [d.w - 11, 4], [4, d.h - 10], [d.w - 11, d.h - 10]]) prop('tent', d.x + dx, d.y + dy, 6, 4);
  prop('campfire', doorX - 6, doorY + 3);
  prop('campfire', doorX + 6, doorY + 3);
  prop('crates', d.x + 2, d.y + d.h - 3);
  prop('barrels', d.x + d.w - 3, d.y + d.h - 3);
  prop('cage', d.x + d.w - 9, d.y + 3, 3, 2);
  pathDown(doorX - 1, doorY + 1, d.y + d.h);
}

// The castle of the Demon King: titanic. Black walls, nine towers, a ring of lava inside the walls,
// a courtyard of ash, the keep in the middle, its tower over everything.
function buildDemonCastle(d) {
  const [doorX, doorY] = d.door;
  fillRect(d.x, d.y, d.w, d.h, TILE.ASH);
  ring(d.x + 1, d.y + 1, d.w - 2, d.h - 2, TILE.WALL, 4);
  ring(d.x + 2, d.y + 2, d.w - 4, d.h - 4, TILE.WALL, 4);
  ring(d.x + 3, d.y + 3, d.w - 6, d.h - 6, TILE.WALL, 4);
  const half = { x: Math.floor(d.w / 2) - 3, y: Math.floor(d.h / 2) - 3 };
  const towers = [[0, 0], [d.w - 6, 0], [0, d.h - 6], [d.w - 6, d.h - 6], [half.x, 0], [0, half.y], [d.w - 6, half.y], [Math.floor(d.w / 4), d.h - 6], [Math.floor((d.w * 3) / 4) - 6, d.h - 6]];
  towers.forEach(([dx, dy]) => fillRect(d.x + dx, d.y + dy, 6, 6, TILE.WALL));
  ring(d.x + 9, d.y + 9, d.w - 18, d.h - 18, TILE.LAVA, 4); // the ring of lava, crossed by the way to the keep
  ring(d.x + 10, d.y + 10, d.w - 20, d.h - 20, TILE.LAVA, 4);
  const keepW = 40;
  const keepX = doorX - Math.floor(keepW / 2) + 1;
  fillRect(keepX, d.y + 16, keepW, doorY - d.y - 16, TILE.WALL);
  setTile(doorX, doorY, TILE.STAIRS);
  setTile(doorX + 1, doorY, TILE.STAIRS);
  for (const [dx, dy] of [[14, 16], [d.w - 19, 16], [14, d.h - 20], [d.w - 19, d.h - 20]]) fillRect(d.x + dx, d.y + dy, 5, 4, TILE.LAVA);
  prop('keepFacade', keepX, doorY - 1, keepW, 1, { look: 'demon', walkable: true });
  for (const tx of [keepX - 1, keepX + keepW - 1]) for (const ty of [d.y + 18, doorY - 10]) prop('turret', tx, ty, 2, 1, { look: 'demon', walkable: true });
  for (const dx of [-4, 5, -9, 10]) prop('banner', doorX + dx, doorY + 1, 1, 1, { color: '#ff3b4f' });
  prop('torch', doorX - 1, doorY + 1);
  prop('torch', doorX + 2, doorY + 1);
  prop('demonSpire', doorX - 4, d.y + 18, 10, 1, { walkable: true, size: 2 }); // its titanic tower, drawn over the keep
}

// The road from the gate of the demon castle to its bridge, and the bridge over the moat.
function buildIsleRoad() {
  const road = ISLE_BRIDGE.road;
  for (let y = road.from; y < road.to; y++) fillRect(road.x - 1, y, 3, 1, TILE.PATH);
  fillRect(ISLE_BRIDGE.x, ISLE_BRIDGE.y, ISLE_BRIDGE.w, ISLE_BRIDGE.h, TILE.BRIDGE);
  fillRect(ISLE_BRIDGE.x, ISLE_BRIDGE.y + ISLE_BRIDGE.h, ISLE_BRIDGE.w, 3, TILE.PATH);
  prop('torch', ISLE_BRIDGE.x - 1, ISLE_BRIDGE.y + ISLE_BRIDGE.h);
  prop('torch', ISLE_BRIDGE.x + ISLE_BRIDGE.w, ISLE_BRIDGE.y + ISLE_BRIDGE.h);
}

// Ruins: broken walls (holes everywhere), pillars, and a temple in the middle with the stairs down.
function buildRuins(d) {
  const [doorX, doorY] = d.door;
  for (let y = d.y; y < d.y + d.h; y++) {
    for (let x = d.x; x < d.x + d.w; x++) {
      const isWallLine = (x - d.x) % 11 === 0 || (y - d.y) % 10 === 0;
      setTile(x, y, isWallLine && noise(x, y, 77) < 0.55 ? TILE.WALL : noise(x, y, 78) < 0.5 ? TILE.FLOOR : TILE.GRASS);
    }
  }
  fillRect(doorX - 6, doorY - 7, 14, 7, TILE.WALL);
  fillRect(doorX - 6, doorY + 1, 14, 4, TILE.FLOOR);
  setTile(doorX, doorY, TILE.STAIRS);
  setTile(doorX + 1, doorY, TILE.STAIRS);
  for (let i = 0; i < 18; i++) {
    const x = d.x + 2 + Math.floor(noise(i, 3, 79) * (d.w - 4));
    const y = d.y + 2 + Math.floor(noise(3, i, 79) * (d.h - 4));
    if (Math.abs(x - doorX) > 8 || Math.abs(y - doorY) > 9) prop('ruinPillar', x, y);
  }
  pathDown(doorX, doorY + 1, d.y + d.h);
}

// The old watchtower: a round tower of stone (its picture is a prop), the door at its foot.
function buildTower(d) {
  const [doorX, doorY] = d.door;
  clear(d.x, d.y, d.w, d.h);
  for (let y = doorY - 7; y < doorY; y++) {
    for (let x = doorX - 4; x <= doorX + 4; x++) {
      if (Math.hypot(x - doorX, y - (doorY - 3.5)) <= 4.2) setTile(x, y, TILE.WALL);
    }
  }
  setTile(doorX, doorY, TILE.STAIRS);
  prop('watchtower', doorX - 3, doorY, 7, 1, { walkable: true, size: 2 }); // its picture covers the walls, its door on the stairs
  pathDown(doorX, doorY + 1, d.y + d.h);
}

// The mouth of a mine: a small cliff with a frame of wood, rails going in.
function buildMine(d) {
  const [doorX, doorY] = d.door;
  clear(d.x, d.y, d.w, d.h);
  fillRect(d.x + 1, d.y, d.w - 2, doorY - d.y, TILE.CLIFF);
  setTile(doorX, doorY, TILE.STAIRS);
  fillRect(doorX, doorY + 1, 1, 2, TILE.PATH);
  prop('mineFrame', doorX - 1, doorY, 3, 1, { walkable: true });
  prop('minecart', doorX + 2, doorY + 1);
  prop('lamp', doorX - 2, doorY + 1);
  pathDown(doorX, doorY + 2, d.y + d.h);
}

const BUILDERS = { cave: buildCave, castle: buildCastle, camp: buildCamp, demonCastle: buildDemonCastle, ruins: buildRuins, tower: buildTower, mine: buildMine };

export function buildStructures() {
  for (const dungeon of DUNGEONS) BUILDERS[dungeon.look](dungeon);
  buildIsleRoad();
}
