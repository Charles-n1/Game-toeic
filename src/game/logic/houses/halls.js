import { NPCS } from '../../data/npcs';
import { insideOf, doorOf, villageOf } from '../../data/zones';
import { TILE } from '../../world/tileKinds';
import { setTile, fillRect } from '../../world/grid';
import { CLASS_ACADEMIES, academyForRole } from '../../data/classes';
import { makeResidentLook, makeHouseResidents } from './residents';

// The inside of the big buildings: the palace, the academies, the shops, the church, the inn...
// Each one has its furniture and the people who work there, on two floors. (Entering them: logic/houses.js.)

export const SPECIAL_ROLES = new Set([
  'arena', 'church', 'clinic', 'forge', 'smithy', 'barracks', 'inn', 'library',
  'potions', 'armory', 'arcane', 'market', 'bakery', 'weaver', 'carpenter',
  ...CLASS_ACADEMIES.map((a) => a.role),
]);

export const SPECIAL_NOTIFY = {
  arena: (t) => '⚔️ ' + t + ': step onto the sand pit or speak with the Arena Master.',
  church: (t) => '⛪ ' + t + ': speak with the Priestess for a blessing or curse rite.',
  clinic: (t) => '🩺 ' + t + ': clean infirmary beds and herbal remedies await (no combat potions sold here).',
  potions: (t) => '🧪 ' + t + ': shelves of healing potions, elixirs and alchemy brews!',
  armory: (t) => '⚔️ ' + t + ': racks of blades, shields, armor and upgrade tools.',
  arcane: (t) => '🔮 ' + t + ': staves, scrolls, charms and enchanted gear.',
  market: (t) => '🧺 ' + t + ': town market supplies, maps, lanterns and tools.',
  bakery: (t) => '🥖 ' + t + ': fresh loaves, warm soup and baking provisions.',
  weaver: (t) => '🧵 ' + t + ': spun cloaks, leather boots and fine fabrics.',
  carpenter: (t) => '🪚 ' + t + ': handcrafted home furniture and timber.',
  forge: (t) => '⚒️ ' + t + ': roaring furnaces warm the room and Master Smiths mend steel.',
  smithy: (t) => '⚒️ ' + t + ': roaring furnaces warm the room and Master Smiths mend steel.',
  barracks: (t) => '🛡️ ' + t + ': training dummies and tactical tables of the watch.',
  inn: (t) => '🍺 ' + t + ': warm hearth, hot meals and soft beds for travelers.',
  library: (t) => '📜 ' + t + ': ancient tomes and scholars teaching world languages.',
};

// Finalizes an interior room layout with walls, exit mat, base washroom props, and doorway coordinates.
function finalizeHall(house, inside, floorTile, props, patrons, opts = {}) {
  const { x, y, w, h } = inside;
  fillRect(x, y, w, h, TILE.WALL);
  fillRect(x + 1, y + 2, w - 2, h - 3, floorTile);
  if (opts.sandPit) fillRect(opts.sandPit.x, opts.sandPit.y, opts.sandPit.w, opts.sandPit.h, TILE.SAND);
  if (!props.some((p) => p.kind === 'toilet')) props.push({ kind: 'toilet', x: x + 19, y: y + 2, w: 1, h: 1, fixed: true });
  if (!props.some((p) => p.kind === 'basin')) props.push({ kind: 'basin', x: x + 17, y: y + 2, w: 1, h: 1, fixed: true });
  const mat = { x: x + 10, y: y + h - 1 };
  setTile(mat.x, mat.y, TILE.STAIRS);
  const door = doorOf(house);
  return {
    house,
    palace: Boolean(opts.palace),
    specialRole: opts.specialRole || null,
    pit: opts.sandPit || null,
    info: { names: patrons.map((p) => p.name) },
    title: opts.title,
    isFamily: false,
    props,
    patrons,
    mat,
    landing: { x: mat.x + 0.5, y: mat.y - 1 },
    exit: { x: door.x + 0.5, y: door.y + 1.5 },
  };
}

export function buildPalaceHall(game, house) {
  const inside = insideOf('visitHouse');
  const { x, y } = inside;
  const village = villageOf(house.village);
  const ruler = NPCS.find((n) => n.rulerOf === village?.kingdom);
  const props = [
    { kind: 'throne', x: x + 10, y: y + 3, w: 2, h: 1, fixed: true },
    { kind: 'furniture', look: 'rug', color: '#8a1c34', x: x + 10, y: y + 5, w: 2, h: 9, walkable: true },
    { kind: 'banner', color: '#e8b83a', x: x + 4, y: y + 2, w: 1, h: 1, walkable: true },
    { kind: 'banner', color: '#e8b83a', x: x + 17, y: y + 2, w: 1, h: 1, walkable: true },
    { kind: 'wallTorch', x: x + 6, y: y + 1, w: 1, h: 1, walkable: true },
    { kind: 'wallTorch', x: x + 15, y: y + 1, w: 1, h: 1, walkable: true },
    { kind: 'window', x: x + 8, y: y + 1, w: 2, h: 1, walkable: true },
    { kind: 'window', x: x + 12, y: y + 1, w: 2, h: 1, walkable: true },
    { kind: 'weaponRack', x: x + 2, y: y + 3, w: 2, h: 1 },
    { kind: 'weaponRack', x: x + 18, y: y + 3, w: 2, h: 1 },
    { kind: 'diningTable', x: x + 3, y: y + 8, w: 2, h: 1, fixed: true },
    { kind: 'diningTable', x: x + 17, y: y + 8, w: 2, h: 1, fixed: true },
    { kind: 'flowerPot', variant: 0, x: x + 2, y: y + 13, w: 1, h: 1, walkable: true },
    { kind: 'flowerPot', variant: 2, x: x + 19, y: y + 13, w: 1, h: 1, walkable: true },
  ];
  const guardLook = { skin: '#e8c49a', hair: '#3a3442', style: 'short', eyes: '#3a6fd8', outfit: '#5a667d', trim: '#ffd23f' };
  const patrons = [
    { kind: 'royalGuard', name: 'Royal Guard', look: guardLook, x: x + 7.5, y: y + 5.5, dir: 'right' },
    { kind: 'royalGuard', name: 'Royal Guard', look: guardLook, x: x + 14.5, y: y + 5.5, dir: 'left' },
  ];
  if (ruler && game.npcs?.[ruler.id]?.alive) {
    patrons.push({ kind: 'ruler', npcId: ruler.id, name: ruler.name, look: ruler.look, x: x + 11, y: y + 4.3, dir: 'down' });
  }
  return finalizeHall(house, inside, TILE.FLOOR, props, patrons, { palace: true, title: (village?.name || 'Royal') + ' Throne Room' });
}

function specialHallSpec(role, vName, vid, x, y) {
  const redLook = { skin: '#c99a72', hair: '#2a1d17', style: 'short', eyes: '#3a2416', outfit: '#8a1a1a', trim: '#ffd23f' };
  const goldLook = { skin: '#fde0c8', hair: '#d6b45a', style: 'long', eyes: '#3a6fd8', outfit: '#eef2ff', trim: '#ffd23f' };
  const healLook = { skin: '#f1c9a5', hair: '#8fd0ff', style: 'long', eyes: '#4fb37a', outfit: '#d8f0ff', trim: '#4fb37a' };
  const smithLook = { skin: '#d8a47f', hair: '#8a2a1a', style: 'short', eyes: '#3a2416', outfit: '#5a3a22', trim: '#e08b3a', race: vid === 'capital-frosthold' ? 'dwarf' : 'human' };
  const capLook = { skin: '#f1c9a5', hair: '#4a3222', style: 'short', eyes: '#3a6fd8', outfit: '#2f50a0', trim: '#ffd23f' };
  const innLook = { skin: '#c99a72', hair: '#5a3b22', style: 'short', eyes: '#3a2416', outfit: '#7a4a24', trim: '#f2c14e' };
  const bookLook = { skin: '#fde0c8', hair: '#9aa6b8', style: 'long', eyes: '#4fb37a', outfit: '#4a2f7a', trim: '#c9a8ff' };
  const specs = {
    arena: {
      title: vName + ' Combat Arena',
      floor: TILE.FLOOR,
      sandPit: { x: x + 4, y: y + 4, w: 14, h: 7 },
      props: [
        { kind: 'weaponRack', x: x + 2, y: y + 3, w: 2, h: 1 },
        { kind: 'weaponRack', x: x + 18, y: y + 11, w: 2, h: 1 },
        { kind: 'dummy', x: x + 2, y: y + 6, w: 1, h: 1, fixed: true },
        { kind: 'target', x: x + 19, y: y + 6, w: 1, h: 1, fixed: true },
        { kind: 'banner', color: '#c8102e', x: x + 5, y: y + 2, w: 1, h: 1, walkable: true },
        { kind: 'banner', color: '#ffd23f', x: x + 15, y: y + 2, w: 1, h: 1, walkable: true },
        { kind: 'wallTorch', x: x + 7, y: y + 1, w: 1, h: 1, walkable: true },
        { kind: 'wallTorch', x: x + 14, y: y + 1, w: 1, h: 1, walkable: true },
        { kind: 'bench', x: x + 6, y: y + 12, w: 2, h: 1 },
        { kind: 'bench', x: x + 14, y: y + 12, w: 2, h: 1 },
        { kind: 'diningTable', x: x + 2, y: y + 11, w: 2, h: 1, fixed: true },
      ],
      patrons: [
        { kind: 'arenaMaster', name: 'Arena Master', look: redLook, x: x + 9, y: y + 12.6, dir: 'up' },
        { kind: 'spectator', name: 'Roaring Fan', look: innLook, x: x + 6.5, y: y + 12.6, dir: 'up' },
        { kind: 'spectator', name: 'Scout', look: capLook, x: x + 15.5, y: y + 12.6, dir: 'up' },
      ],
    },
    church: {
      title: 'Cathedral of ' + vName,
      floor: TILE.FLOOR,
      props: [
        { kind: 'statue', x: x + 10, y: y + 3, w: 1, h: 1, fixed: true },
        { kind: 'crystal', x: x + 8, y: y + 3, w: 1, h: 1, fixed: true },
        { kind: 'crystal', x: x + 12, y: y + 3, w: 1, h: 1, fixed: true },
        { kind: 'furniture', look: 'rug', color: '#8a1c34', x: x + 10, y: y + 5, w: 2, h: 8, walkable: true },
        { kind: 'bench', x: x + 4, y: y + 7, w: 2, h: 1 },
        { kind: 'bench', x: x + 14, y: y + 7, w: 2, h: 1 },
        { kind: 'bench', x: x + 4, y: y + 10, w: 2, h: 1 },
        { kind: 'bench', x: x + 14, y: y + 10, w: 2, h: 1 },
        { kind: 'wallTorch', x: x + 6, y: y + 1, w: 1, h: 1, walkable: true },
        { kind: 'wallTorch', x: x + 15, y: y + 1, w: 1, h: 1, walkable: true },
        { kind: 'window', x: x + 8, y: y + 1, w: 2, h: 1, walkable: true },
        { kind: 'window', x: x + 12, y: y + 1, w: 2, h: 1, walkable: true },
        { kind: 'flowerPot', variant: 0, x: x + 2, y: y + 13, w: 1, h: 1, walkable: true },
        { kind: 'diningTable', x: x + 2, y: y + 11, w: 2, h: 1, fixed: true },
      ],
      patrons: [{ kind: 'priest', name: 'High Priestess', look: goldLook, x: x + 10.5, y: y + 4.8, dir: 'down' }],
    },
    clinic: {
      title: vName + ' Infirmary',
      floor: TILE.FLOOR,
      props: [
        { kind: 'bed', x: x + 3, y: y + 3, w: 2, h: 2, fixed: true },
        { kind: 'bed', x: x + 7, y: y + 3, w: 2, h: 2, fixed: true },
        { kind: 'bed', x: x + 11, y: y + 3, w: 2, h: 2, fixed: true },
        { kind: 'stove', x: x + 2, y: y + 9, w: 2, h: 2, fixed: true },
        { kind: 'diningTable', x: x + 5, y: y + 9, w: 2, h: 1, fixed: true },
        { kind: 'storage', x: x + 2, y: y + 12, w: 1, h: 1, fixed: true },
        { kind: 'flowerPot', variant: 1, x: x + 15, y: y + 12, w: 1, h: 1, walkable: true },
        { kind: 'window', x: x + 8, y: y + 1, w: 2, h: 1, walkable: true },
      ],
      patrons: [{ kind: 'healer', name: 'Clinic Healer', look: healLook, x: x + 6.5, y: y + 6.5, dir: 'down' }],
    },
    forge: {
      title: vName + ' Grand Forge',
      floor: TILE.FLOOR,
      props: [
        { kind: 'stove', x: x + 3, y: y + 2, w: 2, h: 2, fixed: true },
        { kind: 'stove', x: x + 6, y: y + 2, w: 2, h: 2, fixed: true },
        { kind: 'weaponRack', x: x + 10, y: y + 3, w: 2, h: 1 },
        { kind: 'weaponRack', x: x + 13, y: y + 3, w: 2, h: 1 },
        { kind: 'barrels', x: x + 2, y: y + 6, w: 1, h: 1, fixed: true },
        { kind: 'crates', x: x + 17, y: y + 8, w: 1, h: 1, fixed: true },
        { kind: 'wallTorch', x: x + 5, y: y + 1, w: 1, h: 1, walkable: true },
        { kind: 'wallTorch', x: x + 14, y: y + 1, w: 1, h: 1, walkable: true },
        { kind: 'diningTable', x: x + 3, y: y + 10, w: 2, h: 1, fixed: true },
      ],
      patrons: [{ kind: 'smith', name: 'Master Forger', look: smithLook, x: x + 8.5, y: y + 5.8, dir: 'down' }],
    },
    barracks: {
      title: vName + ' Garrison',
      floor: TILE.WOOD_FLOOR,
      props: [
        { kind: 'dummy', x: x + 4, y: y + 4, w: 1, h: 1, fixed: true },
        { kind: 'dummy', x: x + 7, y: y + 4, w: 1, h: 1, fixed: true },
        { kind: 'target', x: x + 11, y: y + 4, w: 1, h: 1, fixed: true },
        { kind: 'weaponRack', x: x + 2, y: y + 8, w: 2, h: 1 },
        { kind: 'bed', x: x + 15, y: y + 7, w: 2, h: 2, fixed: true },
        { kind: 'bed', x: x + 18, y: y + 7, w: 2, h: 2, fixed: true },
        { kind: 'banner', color: '#2f50a0', x: x + 3, y: y + 2, w: 1, h: 1, walkable: true },
        { kind: 'crates', x: x + 15, y: y + 12, w: 1, h: 1, fixed: true },
        { kind: 'diningTable', x: x + 6, y: y + 10, w: 2, h: 1, fixed: true },
      ],
      patrons: [
        { kind: 'captain', name: 'Garrison Captain', look: capLook, x: x + 7.5, y: y + 7.2, dir: 'down' },
        { kind: 'watchman', name: 'Watchman', look: capLook, x: x + 13.5, y: y + 5.5, dir: 'left' },
      ],
    },
    inn: {
      title: vName + ' Tavern & Inn',
      floor: TILE.WOOD_FLOOR,
      props: [
        { kind: 'barCounter', x: x + 11, y: y + 4, w: 6, h: 1, fixed: true },
        { kind: 'barrels', x: x + 12, y: y + 2, w: 1, h: 1, fixed: true },
        { kind: 'barrels', x: x + 15, y: y + 2, w: 1, h: 1, fixed: true },
        { kind: 'stove', x: x + 2, y: y + 2, w: 2, h: 2, fixed: true },
        { kind: 'tavernTable', x: x + 4, y: y + 7, w: 2, h: 1, fixed: true },
        { kind: 'tavernTable', x: x + 14, y: y + 9, w: 2, h: 1, fixed: true },
        { kind: 'bed', x: x + 2, y: y + 11, w: 2, h: 2, fixed: true },
        { kind: 'bed', x: x + 5, y: y + 11, w: 2, h: 2, fixed: true },
        { kind: 'wallTorch', x: x + 6, y: y + 1, w: 1, h: 1, walkable: true },
        { kind: 'diningTable', x: x + 8, y: y + 11, w: 2, h: 1, fixed: true },
      ],
      patrons: [
        { kind: 'innkeeper', name: 'Innkeeper', look: innLook, x: x + 12.5, y: y + 5.5, dir: 'down' },
        { kind: 'traveler', name: 'Traveling Bard', look: bookLook, x: x + 4.5, y: y + 8.3, dir: 'up' },
      ],
    },
    library: {
      title: vName + ' Grand Archives',
      floor: TILE.WOOD_FLOOR,
      props: [
        { kind: 'crystal', x: x + 3, y: y + 3, w: 1, h: 1, fixed: true },
        { kind: 'crystal', x: x + 14, y: y + 3, w: 1, h: 1, fixed: true },
        { kind: 'furniture', look: 'rug', color: '#4a2f7a', x: x + 8, y: y + 6, w: 4, h: 4, walkable: true },
        { kind: 'diningTable', x: x + 5, y: y + 6, w: 2, h: 1, fixed: true },
        { kind: 'diningTable', x: x + 13, y: y + 6, w: 2, h: 1, fixed: true },
        { kind: 'furniture', look: 'chair', color: '#8a5a30', x: x + 5, y: y + 7, w: 1, h: 1 },
        { kind: 'furniture', look: 'chair', color: '#8a5a30', x: x + 13, y: y + 7, w: 1, h: 1 },
        { kind: 'window', x: x + 6, y: y + 1, w: 2, h: 1, walkable: true },
        { kind: 'window', x: x + 11, y: y + 1, w: 2, h: 1, walkable: true },
        { kind: 'flowerPot', variant: 2, x: x + 2, y: y + 13, w: 1, h: 1, walkable: true },
      ],
      patrons: [{ kind: 'archivist', name: 'Head Archivist', look: bookLook, x: x + 9.5, y: y + 5.3, dir: 'down' }],
    },
    potions: {
      title: vName + ' House of Potions',
      floor: TILE.FLOOR,
      props: [
        { kind: 'cauldron', x: x + 3, y: y + 3, w: 1, h: 1, fixed: true },
        { kind: 'cauldron', x: x + 6, y: y + 3, w: 1, h: 1, fixed: true },
        { kind: 'crystalLantern', x: x + 10, y: y + 3, w: 1, h: 1, fixed: true },
        { kind: 'diningTable', x: x + 10, y: y + 6, w: 2, h: 1, fixed: true },
        { kind: 'storage', x: x + 3, y: y + 8, w: 1, h: 1, fixed: true },
        { kind: 'furniture', look: 'shelf', color: '#7a4a24', x: x + 14, y: y + 3, w: 1, h: 1 },
        { kind: 'furniture', look: 'rug', color: '#4f7a58', x: x + 9, y: y + 8, w: 3, h: 2, walkable: true },
        { kind: 'window', x: x + 8, y: y + 1, w: 2, h: 1, walkable: true },
        { kind: 'window', x: x + 13, y: y + 1, w: 2, h: 1, walkable: true },
      ],
      patrons: [{ kind: 'shopkeeper', shopKind: 'potions', name: 'Elara the Alchemist', look: healLook, x: x + 10.5, y: y + 5.2, dir: 'down' }],
    },
    armory: {
      title: vName + ' Grand Armory',
      floor: TILE.WOOD_FLOOR,
      props: [
        { kind: 'weaponRack', x: x + 3, y: y + 3, w: 2, h: 1 },
        { kind: 'weaponRack', x: x + 7, y: y + 3, w: 2, h: 1 },
        { kind: 'weaponRack', x: x + 11, y: y + 3, w: 2, h: 1 },
        { kind: 'dummy', x: x + 16, y: y + 5, w: 1, h: 1, fixed: true },
        { kind: 'diningTable', x: x + 8, y: y + 7, w: 2, h: 1, fixed: true },
        { kind: 'storage', x: x + 3, y: y + 9, w: 1, h: 1, fixed: true },
        { kind: 'banner', color: '#b8303a', x: x + 5, y: y + 2, w: 1, h: 1, walkable: true },
        { kind: 'banner', color: '#8a9ab0', x: x + 14, y: y + 2, w: 1, h: 1, walkable: true },
      ],
      patrons: [{ kind: 'shopkeeper', shopKind: 'armory', name: 'Quartermaster', look: smithLook, x: x + 8.5, y: y + 5.8, dir: 'down' }],
    },
    arcane: {
      title: vName + ' Arcane Emporium',
      floor: TILE.FLOOR,
      props: [
        { kind: 'crystal', x: x + 4, y: y + 3, w: 1, h: 1, fixed: true },
        { kind: 'crystal', x: x + 15, y: y + 3, w: 1, h: 1, fixed: true },
        { kind: 'crystalLantern', x: x + 10, y: y + 3, w: 1, h: 1, fixed: true },
        { kind: 'furniture', look: 'rug', color: '#58388e', x: x + 8, y: y + 6, w: 4, h: 3, walkable: true },
        { kind: 'diningTable', x: x + 9, y: y + 6, w: 2, h: 1, fixed: true },
        { kind: 'window', x: x + 7, y: y + 1, w: 2, h: 1, walkable: true },
      ],
      patrons: [{ kind: 'shopkeeper', shopKind: 'arcane', name: 'Arcane Merchant', look: bookLook, x: x + 10.5, y: y + 5.2, dir: 'down' }],
    },
    market: {
      title: vName + ' Market House',
      floor: TILE.WOOD_FLOOR,
      props: [
        { kind: 'crates', x: x + 3, y: y + 3, w: 1, h: 1, fixed: true },
        { kind: 'barrels', x: x + 5, y: y + 3, w: 1, h: 1, fixed: true },
        { kind: 'diningTable', x: x + 9, y: y + 6, w: 2, h: 1, fixed: true },
        { kind: 'storage', x: x + 15, y: y + 4, w: 1, h: 1, fixed: true },
      ],
      patrons: [{ kind: 'shopkeeper', shopKind: 'market', name: 'Market Clerk', look: innLook, x: x + 9.5, y: y + 5.2, dir: 'down' }],
    },
    bakery: {
      title: vName + ' Warm Bakery',
      floor: TILE.WOOD_FLOOR,
      props: [
        { kind: 'stove', x: x + 3, y: y + 2, w: 2, h: 2, fixed: true },
        { kind: 'stove', x: x + 6, y: y + 2, w: 2, h: 2, fixed: true },
        { kind: 'diningTable', x: x + 10, y: y + 6, w: 2, h: 1, fixed: true },
        { kind: 'barrels', x: x + 14, y: y + 4, w: 1, h: 1, fixed: true },
      ],
      patrons: [{ kind: 'shopkeeper', shopKind: 'bakery', name: 'Town Baker', look: innLook, x: x + 10.5, y: y + 5.2, dir: 'down' }],
    },
    weaver: {
      title: vName + ' Weaver & Tailor',
      floor: TILE.WOOD_FLOOR,
      props: [
        { kind: 'wardrobe', x: x + 3, y: y + 3, w: 1, h: 1, fixed: true },
        { kind: 'wardrobe', x: x + 6, y: y + 3, w: 1, h: 1, fixed: true },
        { kind: 'furniture', look: 'rug', color: '#8a3458', x: x + 8, y: y + 6, w: 4, h: 3, walkable: true },
        { kind: 'diningTable', x: x + 9, y: y + 6, w: 2, h: 1, fixed: true },
      ],
      patrons: [{ kind: 'shopkeeper', shopKind: 'weaver', name: 'Master Tailor', look: goldLook, x: x + 9.5, y: y + 5.2, dir: 'down' }],
    },
    carpenter: {
      title: vName + ' Carpenter Workshop',
      floor: TILE.WOOD_FLOOR,
      props: [
        { kind: 'logs', x: x + 3, y: y + 3, w: 2, h: 1, fixed: true },
        { kind: 'crates', x: x + 6, y: y + 3, w: 1, h: 1, fixed: true },
        { kind: 'diningTable', x: x + 9, y: y + 6, w: 2, h: 1, fixed: true },
        { kind: 'wardrobe', x: x + 14, y: y + 3, w: 1, h: 1, fixed: true },
      ],
      patrons: [{ kind: 'shopkeeper', shopKind: 'carpenter', name: 'Master Carpenter', look: smithLook, x: x + 9.5, y: y + 5.2, dir: 'down' }],
    },
  };
  const resolved = role === 'smithy' ? 'forge' : role;
  if (specs[resolved]) return specs[resolved];
  const acad = academyForRole(resolved);
  if (acad) {
    const isCombat = ['academyKnight', 'academyBlade', 'academyShadow', 'academyWilds'].includes(acad.role);
    const props = [
      { kind: isCombat ? 'dummy' : 'crystal', x: x + 4, y: y + 4, w: 1, h: 1, fixed: true },
      { kind: isCombat ? 'weaponRack' : 'crystal', x: x + 15, y: y + 4, w: isCombat ? 2 : 1, h: 1, fixed: true },
      { kind: 'diningTable', x: x + 9, y: y + 6, w: 2, h: 1, fixed: true },
      { kind: 'banner', color: isCombat ? '#b8303a' : '#4a3f9a', x: x + 7, y: y + 2, w: 1, h: 1, walkable: true },
      { kind: 'banner', color: '#ffd23f', x: x + 13, y: y + 2, w: 1, h: 1, walkable: true },
      { kind: 'window', x: x + 8, y: y + 1, w: 2, h: 1, walkable: true },
      { kind: 'window', x: x + 12, y: y + 1, w: 2, h: 1, walkable: true },
      { kind: 'furniture', look: 'rug', color: '#3b4f8c', x: x + 8, y: y + 8, w: 4, h: 3, walkable: true },
    ];
    if (acad.role === 'academyAlchemist') props.push({ kind: 'cauldron', x: x + 7, y: y + 4, w: 1, h: 1, fixed: true });
    return {
      title: vName + ' ' + acad.title,
      floor: isCombat ? TILE.WOOD_FLOOR : TILE.FLOOR,
      props,
      patrons: [
        { kind: 'academyMaster', academyRole: acad.role, name: acad.title + ' Headmaster', look: isCombat ? capLook : bookLook, x: x + 10.5, y: y + 5.2, dir: 'down' },
        { kind: 'resident', name: 'Academy Apprentice', look: makeResidentLook(vid + resolved + 'app'), x: x + 6.5, y: y + 9.2, dir: 'right', activity: 'idle', actTimer: 6, diningSpot: { x: x + 6.5, y: y + 9.2 }, playSpot: { x: x + 9.5, y: y + 9.5 } },
      ],
    };
  }
  return specs.market;
}

function buildSpecialUpperFloor(house, baseTitle, inside) {
  const { x, y, w, h } = inside;
  const props = [
    { kind: 'stairsDown', x: x + 2, y: y + 13, w: 1, h: 1, walkable: true },
    { kind: 'stove', x: x + 2, y: y + 2, w: 2, h: 2, fixed: true },
    { kind: 'diningTable', x: x + 5, y: y + 6, w: 2, h: 1, fixed: true },
    { kind: 'storage', x: x + 2, y: y + 6, w: 1, h: 1, fixed: true },
    { kind: 'bed', x: x + 14, y: y + 3, w: 2, h: 2, fixed: true },
    { kind: 'bed', x: x + 17, y: y + 3, w: 2, h: 2, fixed: true },
    { kind: 'wardrobe', x: x + 19, y: y + 7, w: 1, h: 1, fixed: true },
    { kind: 'toilet', x: x + 19, y: y + 12, w: 1, h: 1, fixed: true },
    { kind: 'basin', x: x + 17, y: y + 12, w: 1, h: 1, fixed: true },
    { kind: 'window', x: x + 5, y: y + 1, w: 2, h: 1, walkable: true },
    { kind: 'window', x: x + 14, y: y + 1, w: 2, h: 1, walkable: true },
  ];
  const patrons = makeHouseResidents({ hour: 14 }, house, doorOf(house), { isFamily: false, named: [], villagers: [] }, inside, 1);
  return {
    title: baseTitle + ' (2F · Living Quarters)',
    props,
    patrons,
    paint: () => {
      fillRect(x, y, w, h, TILE.WALL);
      fillRect(x + 1, y + 2, 10, h - 3, TILE.WOOD_FLOOR);
      fillRect(x + 12, y + 2, 9, 7, TILE.RUG); // Distinct carpeted bedroom upstairs!
      fillRect(x + 12, y + 10, 9, h - 11, TILE.FLOOR);
      fillRect(x + 11, y + 2, 1, h - 3, TILE.WALL);
      setTile(x + 11, y + 5, TILE.WOOD_FLOOR);
      fillRect(x + 12, y + 9, 9, 1, TILE.WALL);
      setTile(x + 15, y + 9, TILE.FLOOR);
    },
  };
}

export function buildSpecialHall(house) {
  const inside = insideOf('visitHouse');
  const vName = villageOf(house.village)?.name || 'Town';
  const spec = specialHallSpec(house.role, vName, house.village, inside.x, inside.y);
  const floor0Props = [...spec.props, { kind: 'stairsUp', x: inside.x + 2, y: inside.y + 13, w: 1, h: 1, walkable: true }];
  const visit = finalizeHall(house, inside, spec.floor, floor0Props, spec.patrons, {
    specialRole: house.role,
    sandPit: spec.sandPit,
    title: spec.title,
  });
  const floor1 = buildSpecialUpperFloor(house, spec.title, inside);
  visit.floor = 0;
  visit.floorData = {
    0: {
      title: spec.title,
      props: visit.props,
      patrons: visit.patrons,
      paint: () => {
        fillRect(inside.x, inside.y, inside.w, inside.h, TILE.WALL);
        fillRect(inside.x + 1, inside.y + 2, inside.w - 2, inside.h - 3, spec.floor);
        if (spec.sandPit) fillRect(spec.sandPit.x, spec.sandPit.y, spec.sandPit.w, spec.sandPit.h, TILE.SAND);
      },
    },
    1: floor1,
  };
  return visit;
}
