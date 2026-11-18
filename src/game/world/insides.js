import { INSIDES, DUNGEONS, HOME_DOOR, dungeonOf } from '../data/zones';
import { TILE } from './tileKinds';
import { getTile, setTile, fillRect } from './grid';
import { randomOf } from './seeded';

// The insides, out of the island (see INSIDES in data/zones.js): the floors of the dungeons, the caves, the home.
// Each floor is made of rooms joined by corridors, always the same (the random numbers come from its name).
// The stairs join the floors; the first floor joins the door outside.
// The puzzles:
//   - a boulder to push on a stone plate: the gate of the plate opens (see logic/puzzles.js);
//   - a word door: it opens to a good sentence (a hard question).

const T = TILE;

export const INSIDE_PROPS = []; // the things standing inside (furniture, torches...)
export const LINKS = new Map(); // "x,y" of a stairs tile -> { x, y }: where the walker arrives
export const PUZZLES = []; // { id, kind: 'plate' | 'word', ... }
export const INSIDE_CHESTS = []; // { x, y, key, zone }
export const INSIDE_MONSTERS = []; // { species, x, y, key, zoneId, boss? }

// ---------- Small tools ----------

// Walking on the stairs at (x, y) takes you to (to.x, to.y) (the middle of that tile).
function linkOneWay(x, y, to) {
  LINKS.set(x + ',' + y, { x: to.x + 0.5, y: to.y + 0.5 });
}

// ---------- A floor of rooms ----------

// The rooms of a floor, from the left to the right: [{ x, y, w, h }].
function roomsOf(inside, random, count) {
  const rooms = [];
  const columnWidth = Math.floor((inside.w - 2) / count);
  for (let i = 0; i < count; i++) {
    const w = 5 + Math.floor(random() * Math.max(1, columnWidth - 6));
    const h = 5 + Math.floor(random() * (inside.h - 12));
    const x = inside.x + 1 + i * columnWidth + Math.floor(random() * Math.max(1, columnWidth - w - 1));
    const y = inside.y + 2 + Math.floor(random() * Math.max(1, inside.h - h - 4));
    rooms.push({ x: x, y: y, w: w, h: h });
  }
  return rooms;
}

function middleOf(room) {
  return { x: room.x + Math.floor(room.w / 2), y: room.y + Math.floor(room.h / 2) };
}

// A corridor 2 tiles wide from a room to the next: across, then up or down. Returns its tiles in order.
function corridor(a, b) {
  const from = middleOf(a);
  const to = middleOf(b);
  const path = [];
  for (let x = from.x; x <= to.x; x++) path.push([x, from.y]);
  const step = to.y > from.y ? 1 : -1;
  for (let y = from.y; y !== to.y; y += step) path.push([to.x, y]);
  path.forEach(([x, y]) => fillRect(x, y, 2, 2, T.FLOOR));
  return path;
}

// In a mine: some walls next to the floor hold ore (iron or crystal).
function addOre(inside, random) {
  for (let y = inside.y + 1; y < inside.y + inside.h - 1; y++) {
    for (let x = inside.x + 1; x < inside.x + inside.w - 1; x++) {
      const touchesFloor = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => getTile(x + dx, y + dy) === T.FLOOR);
      if (getTile(x, y) === T.WALL && touchesFloor && random() < 0.08) setTile(x, y, T.ORE);
    }
  }
}

// The boulder puzzle in a room: the plate in a corner, the boulder 2 tiles beside it (it can be pushed on it),
// and a gate of 2 tiles closing the corridor to the next room.
function plateTrap(id, room, gateTiles) {
  const plate = { x: room.x + 1, y: room.y + room.h - 2 };
  PUZZLES.push({ id: id, kind: 'plate', plate: plate, boulder: { x: plate.x + 2, y: plate.y }, gate: gateTiles });
}

// A word door of 2 tiles: it opens to a good sentence.
function wordDoor(id, tilesOfDoor) {
  PUZZLES.push({ id: id, kind: 'word', gate: tilesOfDoor });
}

// The 2 tiles of a corridor just before it enters a room (where a gate or a door can close it).
function corridorEnd(path, room) {
  const inside = (x, y) => x >= room.x && x < room.x + room.w && y >= room.y && y < room.y + room.h;
  for (let i = 0; i < path.length; i++) {
    const [x, y] = path[i];
    if (inside(x, y) || inside(x + 1, y) || inside(x, y + 1)) {
      const [px, py] = path[Math.max(0, i - 2)];
      const isAcross = i > 0 && path[i - 1][1] === y;
      return isAcross ? [{ x: px, y: py }, { x: px, y: py + 1 }] : [{ x: px, y: py }, { x: px + 1, y: py }];
    }
  }
  return [];
}

// One floor of a dungeon (or a level of a mine).
function buildFloor(inside) {
  const dungeon = dungeonOf(inside.dungeon);
  const random = randomOf(inside.id);
  const isLast = inside.floor === dungeon.floors;
  fillRect(inside.x, inside.y, inside.w, inside.h, T.WALL);
  const count = dungeon.look === 'mine' ? 5 : dungeon.wild ? 3 + Math.floor(random() * 2) : 4 + Math.floor(random() * 2);
  const rooms = roomsOf(inside, random, count);
  rooms.forEach((room) => fillRect(room.x, room.y, room.w, room.h, T.FLOOR));
  const corridors = [];
  for (let i = 0; i < rooms.length - 1; i++) corridors.push(corridor(rooms[i], rooms[i + 1]));
  if (dungeon.look === 'mine' || dungeon.wild) addOre(inside, random);

  const first = rooms[0];
  const last = rooms[rooms.length - 1];
  const up = { x: first.x + 1, y: first.y };
  setTile(up.x, up.y, T.STAIRS);
  inside.up = up;
  inside.landing = { x: up.x, y: up.y + 1 };
  INSIDE_PROPS.push({ kind: 'wallTorch', x: first.x + first.w - 2, y: first.y - 1, w: 1, h: 1, walkable: true });
  INSIDE_PROPS.push({ kind: 'wallTorch', x: last.x + 1, y: last.y - 1, w: 1, h: 1, walkable: true });

  if (!isLast) {
    const down = { x: last.x + last.w - 2, y: last.y };
    setTile(down.x, down.y, T.STAIRS);
    inside.down = down;
  }

  // the monsters of the middle rooms, the boss (or the guardian) and the treasure in the last room
  const floorBoss = dungeon.floorBosses ? dungeon.floorBosses[inside.floor] : null;
  rooms.slice(1, isLast || floorBoss ? -1 : undefined).forEach((room, i) => {
    const middle = middleOf(room);
    const species = dungeon.guards[Math.floor(random() * dungeon.guards.length)];
    INSIDE_MONSTERS.push({ species: species, x: middle.x + 0.5, y: middle.y + 0.5, key: inside.id + ':' + i, zoneId: inside.id });
  });
  if (floorBoss && !isLast) {
    const middle = middleOf(last);
    INSIDE_MONSTERS.push({ species: floorBoss, x: middle.x + 0.5, y: middle.y + 0.5, key: inside.id + ':boss', zoneId: inside.id, boss: true });
  }
  if (isLast) {
    const middle = middleOf(last);
    const boss = dungeon.boss || dungeon.guardian;
    INSIDE_MONSTERS.push({ species: boss, x: middle.x + 0.5, y: middle.y + 0.5, key: inside.id + ':boss', zoneId: inside.id, boss: Boolean(dungeon.boss) });
    INSIDE_CHESTS.push({ x: last.x + last.w - 2, y: last.y + 1, key: inside.id, zone: { ...dungeon, danger: dungeon.danger + 1 } });
  } else if (random() < 0.6) {
    const room = rooms[1 + Math.floor(random() * (rooms.length - 2))];
    INSIDE_CHESTS.push({ x: room.x + room.w - 2, y: room.y + room.h - 2, key: inside.id + ':small', zone: dungeon });
  }

  // a puzzle closes the way to the last room: a boulder on a plate (odd floors), a word door (even floors)
  const lockedCorridor = corridors[corridors.length - 1];
  const gate = corridorEnd(lockedCorridor, last);
  if (gate.length === 2 && rooms.length >= 3) {
    if (inside.floor % 2 === 1) plateTrap(inside.id + ':plate', rooms[rooms.length - 2], gate);
    else wordDoor(inside.id + ':word', gate);
  }
}

// A floor of the old watchtower: one round room, the stairs on both sides, a word door before the stairs up.
function buildTowerFloor(inside) {
  const dungeon = dungeonOf(inside.dungeon);
  const isLast = inside.floor === dungeon.floors;
  const cx = inside.x + 7;
  const cy = inside.y + 7;
  for (let y = inside.y; y < inside.y + inside.h; y++) {
    for (let x = inside.x; x < inside.x + inside.w; x++) setTile(x, y, Math.hypot(x + 0.5 - cx - 0.5, y + 0.5 - cy - 0.5) < 6.5 ? T.FLOOR : T.WALL);
  }
  const up = { x: cx - 4, y: cy + 4 };
  setTile(up.x, up.y, T.STAIRS);
  inside.up = up;
  inside.landing = { x: up.x + 1, y: up.y };
  if (!isLast) {
    const down = { x: cx + 4, y: cy - 4 };
    setTile(down.x, down.y, T.STAIRS);
    inside.down = down;
    fillRect(cx + 1, cy - 5, 1, 5, T.WALL); // a wall around the stairs up...
    fillRect(cx + 1, cy - 1, 5, 1, T.WALL);
    setTile(cx + 1, cy - 1, T.WALL);
    wordDoor(inside.id + ':word', [{ x: cx + 2, y: cy - 1 }, { x: cx + 3, y: cy - 1 }]); // ...with a word door in it
  }
  INSIDE_PROPS.push({ kind: 'wallTorch', x: cx, y: inside.y + 1, w: 1, h: 1, walkable: true });
  const species = isLast ? dungeon.guardian : dungeon.guards[inside.floor % dungeon.guards.length];
  INSIDE_MONSTERS.push({ species: species, x: cx + 0.5, y: cy + 1.5, key: inside.id + (isLast ? ':boss' : ':0'), zoneId: inside.id });
  if (isLast) INSIDE_CHESTS.push({ x: cx + 3, y: cy - 3, key: inside.id, zone: { ...dungeon, danger: dungeon.danger + 1 } });
}

// The home of the player: main hall, kitchen, two bedrooms (master + guest/companion), and a letterbox outside.
function buildHome(inside) {
  fillRect(inside.x, inside.y, inside.w, inside.h, T.WALL);
  fillRect(inside.x + 1, inside.y + 2, inside.w - 2, inside.h - 3, T.WOOD_FLOOR);
  // Bedroom wing partition walls with open doorways to master (north) and guest/companion (south) bedrooms
  fillRect(inside.x + 1, inside.y + 5, 3, 1, T.WALL);
  fillRect(inside.x + 4, inside.y + 2, 1, inside.h - 3, T.WALL);
  setTile(inside.x + 4, inside.y + 4, T.WOOD_FLOOR);
  setTile(inside.x + 4, inside.y + 7, T.WOOD_FLOOR);

  const mat = { x: inside.x + Math.floor(inside.w / 2), y: inside.y + inside.h - 1 };
  setTile(mat.x, mat.y, T.STAIRS);
  inside.landing = { x: mat.x, y: mat.y - 1 };
  linkOneWay(mat.x, mat.y, { x: HOME_DOOR.x, y: HOME_DOOR.y + 1 });
  linkOneWay(HOME_DOOR.x, HOME_DOOR.y, inside.landing); // the door of the house (outside) leads in
  INSIDE_PROPS.push({ kind: 'bed', x: inside.x + 1, y: inside.y + 2, w: 2, h: 2, fixed: true });
  INSIDE_PROPS.push({ kind: 'bed', x: inside.x + 1, y: inside.y + 6, w: 2, h: 2, fixed: true });
  INSIDE_PROPS.push({ kind: 'stove', x: inside.x + inside.w - 3, y: inside.y + 1, w: 2, h: 2, fixed: true });
  INSIDE_PROPS.push({ kind: 'storage', x: inside.x + inside.w - 2, y: inside.y + inside.h - 3, w: 1, h: 1, fixed: true });
  INSIDE_PROPS.push({ kind: 'window', x: inside.x + 1, y: inside.y + 1, w: 2, h: 1, walkable: true });
  INSIDE_PROPS.push({ kind: 'window', x: inside.x + 5, y: inside.y + 1, w: 2, h: 1, walkable: true });
  INSIDE_PROPS.push({ kind: 'window', x: inside.x + 8, y: inside.y + 1, w: 2, h: 1, walkable: true });
  INSIDE_PROPS.push({ kind: 'furniture', itemId: 'candelabra', look: 'lamp', color: '#ffbe44', x: inside.x + 7, y: inside.y + 2, w: 1, h: 1, fixed: true });
  INSIDE_PROPS.push({ kind: 'furniture', itemId: 'hearthTorch', look: 'lamp', color: '#ff8a2a', x: inside.x + 3, y: inside.y + 6, w: 1, h: 1, fixed: true });
  INSIDE_PROPS.push({ kind: 'mailbox', x: HOME_DOOR.x + 2, y: HOME_DOOR.y, w: 1, h: 1, walkable: true });
}

// ---------- Joining the floors ----------

// The door outside <-> the stairs of the first floor; the stairs down <-> the stairs up of the next floor.
function joinFloors() {
  for (const dungeon of DUNGEONS) {
    const floors = INSIDES.filter((inside) => inside.dungeon === dungeon.id);
    const [doorX, doorY] = dungeon.door;
    const outside = { x: doorX, y: doorY + 1 };
    for (const dx of [0, 1]) {
      if (getTile(doorX + dx, doorY) === T.STAIRS) linkOneWay(doorX + dx, doorY, floors[0].landing);
    }
    linkOneWay(floors[0].up.x, floors[0].up.y, outside);
    for (let i = 0; i < floors.length - 1; i++) {
      const here = floors[i];
      const next = floors[i + 1];
      linkOneWay(here.down.x, here.down.y, next.landing);
      linkOneWay(next.up.x, next.up.y, { x: here.down.x - 1, y: here.down.y + 1 });
    }
  }
}

export function buildInsides() {
  for (const inside of INSIDES) {
    if (inside.kind === 'home') buildHome(inside);
    else if (inside.kind === 'houseVisit') continue;
    else if (dungeonOf(inside.dungeon).look === 'tower') buildTowerFloor(inside);
    else buildFloor(inside);
  }
  joinFloors();
}
