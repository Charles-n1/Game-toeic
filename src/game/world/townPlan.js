import { BUILDING_SIZES, ROLES } from '../data/buildings';
import { randomOf, pickWith, between } from './seeded';

// The plan of a village of people: its streets, its square, its buildings, its fields and pens, and the things
// standing in its streets. Made from its kind and its name: always the same plan. (world/map.js writes the tiles.)
//
// The plan, in tiles: {
//   roads: [{ x, y, w, h }]            the streets          square: { x, y, w, h }   the main square
//   houses: [{ x, y, w, h, role, size, style, roof, sign }]
//   fields: [{ x, y, w, h, crop }]     where food grows     pens: [{ x, y, w, h, animals }]
//   props: [{ kind, x, y, w, h }]      lamps, wells, dummies, graves...
//   trees: [{ x, y }]                  the trees of the gardens
//   gates: [{ x, y, dx, dy, w }]       where the main streets cross the walls (dx, dy: the way out)
//   center: { x, y }                   the middle of the square
//   downtown: { x, y, w, h } | null    the walled town center of a capital }

const CELL_W = 15; // a lot: a building and its yard
const CELL_H = 12;
const MARGIN = 4; // the free tiles inside the walls (a way all around the village)
const ROAD = 3; // the width of the main streets
const STREET = 2; // the width of the small streets of a capital
const SQUARE_SIZES = { capital: [34, 22], town: [22, 16], village: [16, 12], hamlet: [12, 9], farm: [14, 10] };
const FIELDS_OF = { capital: 0, town: 2, village: 2, hamlet: 1, farm: 0.45 }; // a number, or a part of the lots
const PENS_OF = { capital: 0, town: 1, village: 1, hamlet: 1, farm: 2 };
const ANIMALS_OF = { farm: { pig: 3, chicken: 5, cow: 3, horse: 1 }, other: { pig: 2, chicken: 3, cow: 1, horse: 0 } };

// ---------- The streets and the square ----------

function middleOf(place) {
  return { x: place.x + Math.floor(place.w / 2), y: place.y + Math.floor(place.h / 2) };
}

function squareOf(place) {
  const [w, h] = SQUARE_SIZES[place.kind];
  const middle = middleOf(place);
  return { x: middle.x - Math.floor(w / 2), y: middle.y - Math.floor(h / 2), w: w, h: h };
}

// The palace of a capital stands just north of its square, on the main street.
function palaceOf(place, square) {
  const size = BUILDING_SIZES.palace;
  return { x: square.x + Math.floor((square.w - size.w) / 2), y: square.y - 4 - size.h, w: size.w, h: size.h };
}

// The lines of the streets: the two main streets cross the whole village (they make its 4 gates).
// A capital has 4 more small streets around its town center. [{ x, y, w, h, main }]
function streetsOf(place, palace) {
  const middle = middleOf(place);
  const across = { x: place.x, y: middle.y - 1, w: place.w, h: ROAD, main: true };
  const down = { x: middle.x - 1, y: place.y, w: ROAD, h: place.h, main: true };
  if (place.kind !== 'capital') return [across, down];
  const top = place.y + Math.floor(place.h / 4);
  const bottom = place.y + Math.floor((place.h * 3) / 4);
  const left = place.x + Math.floor(place.w / 4);
  const right = place.x + Math.floor((place.w * 3) / 4);
  const inner = { x: place.x + MARGIN, w: place.w - MARGIN * 2, y: place.y + MARGIN, h: place.h - MARGIN * 2 };
  return [
    across,
    { ...down, h: palace.y - place.y }, // the main street stops at the palace...
    { ...down, y: palace.y + palace.h, h: place.y + place.h - palace.y - palace.h }, // ...and goes on after it
    { x: inner.x, y: top, w: inner.w, h: STREET },
    { x: inner.x, y: bottom, w: inner.w, h: STREET },
    { x: left, y: inner.y, w: STREET, h: inner.h },
    { x: right, y: inner.y, w: STREET, h: inner.h },
  ];
}

// The 4 gates: where the main streets meet the border.
function gatesOf(place) {
  const middle = middleOf(place);
  return [
    { x: place.x, y: middle.y - 1, dx: -1, dy: 0, w: ROAD },
    { x: place.x + place.w - 1, y: middle.y - 1, dx: 1, dy: 0, w: ROAD },
    { x: middle.x - 1, y: place.y, dx: 0, dy: -1, w: ROAD },
    { x: middle.x - 1, y: place.y + place.h - 1, dx: 0, dy: 1, w: ROAD },
  ];
}

// ---------- The lots ----------

function overlaps(a, b, gap = 0) {
  return a.x < b.x + b.w + gap && a.x + a.w + gap > b.x && a.y < b.y + b.h + gap && a.y + a.h + gap > b.y;
}

// The free parts of a line from `from` to `to`, between the streets that cut it: [[start, end]].
function freeParts(from, to, cuts) {
  const parts = [];
  let start = from;
  for (const [cutStart, cutEnd] of [...cuts].sort((a, b) => a[0] - b[0])) {
    if (cutStart > start) parts.push([start, Math.min(cutStart, to)]);
    start = Math.max(start, cutEnd);
  }
  if (start < to) parts.push([start, to]);
  return parts.filter(([a, b]) => b - a >= CELL_W - 2 || b - a >= CELL_H);
}

// The lots of the village, the closest to the square first: [{ x, y, w, h }].
function lotsOf(place, streets, blocked) {
  const inner = { x: place.x + MARGIN, y: place.y + MARGIN, w: place.w - MARGIN * 2, h: place.h - MARGIN * 2 };
  const columns = freeParts(inner.x, inner.x + inner.w, streets.filter((s) => s.h > s.w).map((s) => [s.x, s.x + s.w]));
  const rows = freeParts(inner.y, inner.y + inner.h, streets.filter((s) => s.w > s.h).map((s) => [s.y, s.y + s.h]));
  const lots = [];
  for (const [top, bottom] of rows) {
    const rowCount = Math.floor((bottom - top) / CELL_H);
    const rowStart = top + Math.floor((bottom - top - rowCount * CELL_H) / 2);
    for (const [left, right] of columns) {
      const count = Math.floor((right - left + 1) / CELL_W);
      const start = left + Math.floor((right - left + 1 - count * CELL_W) / 2);
      for (let j = 0; j < rowCount; j++) {
        for (let i = 0; i < count; i++) {
          const lot = { x: start + i * CELL_W, y: rowStart + j * CELL_H, w: CELL_W, h: CELL_H };
          if (!blocked.some((rect) => overlaps(lot, rect, 1))) lots.push(lot);
        }
      }
    }
  }
  const middle = middleOf(place);
  return lots.sort((a, b) => Math.hypot(a.x + 7 - middle.x, a.y + 6 - middle.y) - Math.hypot(b.x + 7 - middle.x, b.y + 6 - middle.y));
}

// ---------- The buildings ----------

// How the houses of a village are built: rough huts in a young village, wood in a village, stone in a town.
function styleOf(place, random) {
  const roll = random();
  if (place.kind === 'capital') return roll < 0.75 ? 'stone' : 'timber';
  if (place.kind === 'hamlet' || place.founded < 40) return roll < 0.75 ? 'hut' : 'timber';
  if (place.kind === 'town' || place.founded > 300) return roll < 0.55 ? 'stone' : roll < 0.9 ? 'timber' : 'hut';
  return roll < 0.65 ? 'timber' : roll < 0.85 ? 'hut' : 'stone';
}

function sizeOfHouse(role, style, random) {
  if (ROLES[role].size) return ROLES[role].size;
  if (style === 'hut') return 'hut';
  return random() < 0.55 ? 'cottage' : 'house';
}

// A building in a lot: in the top of the lot, its door at the bottom, the yard below it.
function buildingIn(lot, role, place, random) {
  const style = role === 'palace' || role === 'church' ? 'stone' : styleOf(place, random);
  const size = sizeOfHouse(role, style, random);
  const { w, h } = BUILDING_SIZES[size];
  const x = lot.x + Math.floor((CELL_W - 1 - w) / 2);
  const y = lot.y + CELL_H - 3 - h;
  return { x: x, y: y, w: w, h: h, role: role, size: size, style: style, roof: place.roof, sign: ROLES[role].sign, village: place.id };
}

// ---------- The other lots: fields, pens, a training corner, a graveyard, gardens ----------

function fieldIn(lot, place, random, plan) {
  const crop = place.kind === 'farm' ? pickWith(random, ['wheat', 'wheat', 'carrot']) : pickWith(random, ['wheat', 'carrot']);
  if (plan) {
    plan.props.push({ kind: 'scarecrow', x: lot.x + Math.floor(CELL_W / 2) - 1, y: lot.y + CELL_H - 3, w: 1, h: 1, walkable: true });
    if (random() < 0.7) plan.props.push({ kind: 'wheelbarrow', x: lot.x + 2, y: lot.y + CELL_H - 3, w: 1, h: 1, walkable: true });
  }
  return { x: lot.x + 1, y: lot.y + 1, w: CELL_W - 3, h: CELL_H - 5, crop: crop, village: place.id };
}

function penIn(lot, place) {
  return { x: lot.x + 2, y: lot.y + 2, w: CELL_W - 5, h: CELL_H - 6, animals: { ...(place.kind === 'farm' ? ANIMALS_OF.farm : ANIMALS_OF.other) }, village: place.id };
}

function trainingIn(lot, plan) {
  for (const dx of [2, 6, 10]) plan.props.push({ kind: 'dummy', x: lot.x + dx, y: lot.y + 3, w: 1, h: 1 });
  plan.props.push({ kind: 'weaponRack', x: lot.x + 1, y: lot.y + 7, w: 2, h: 1 });
  plan.props.push({ kind: 'target', x: lot.x + 5, y: lot.y + 7, w: 1, h: 1 });
  plan.props.push({ kind: 'logs', x: lot.x + 9, y: lot.y + 7, w: 2, h: 1 });
  plan.props.push({ kind: 'bench', x: lot.x + 11, y: lot.y + 9, w: 2, h: 1 });
  plan.training = { x: lot.x, y: lot.y, w: lot.w, h: lot.h };
}

function graveyardIn(lot, plan) {
  for (let row = 0; row < 2; row++) {
    for (let column = 0; column < 4; column++) plan.props.push({ kind: 'grave', x: lot.x + 2 + column * 3, y: lot.y + 2 + row * 4, w: 1, h: 1 });
  }
  plan.graveyard = { x: lot.x, y: lot.y, w: lot.w, h: lot.h };
}

function gardenIn(lot, plan, random) {
  plan.trees.push({ x: lot.x + between(random, 3, 10), y: lot.y + between(random, 3, 5) });
  plan.flowers.push({ x: lot.x + 2, y: lot.y + 7, w: CELL_W - 5, h: 2 });
  plan.props.push({ kind: 'flowerArch', x: lot.x + 6, y: lot.y + 6, w: 2, h: 1, walkable: true });
  plan.props.push({ kind: 'flowerBed', variant: between(random, 0, 2), x: lot.x + 2, y: lot.y + 3, w: 2, h: 1, walkable: true });
  plan.props.push({ kind: 'bench', x: lot.x + 5, y: lot.y + 4, w: 2, h: 1 });
  plan.props.push({ kind: 'flowerPot', variant: between(random, 0, 2), x: lot.x + 3, y: lot.y + 5, w: 1, h: 1, walkable: true });
  plan.props.push({ kind: 'flowerPot', variant: between(random, 0, 2), x: lot.x + 8, y: lot.y + 5, w: 1, h: 1, walkable: true });
}

// Rich exterior decorations around every building (never blocking its front door).
function decorate(house, plan, random) {
  const doorX = house.x + Math.floor(house.w / 2);
  const leftX = house.x + 1;
  const rightX = house.x + house.w - 2;
  if (house.role === 'church') {
    plan.props.push({ kind: 'statue', x: house.x + 1, y: house.y + house.h, w: 2, h: 2 });
    if (rightX > doorX) plan.props.push({ kind: 'topiary', x: rightX, y: house.y + house.h, w: 1, h: 1, walkable: true });
    plan.props.push({ kind: 'flowerPot', variant: 1, x: house.x, y: house.y + house.h, w: 1, h: 1, walkable: true });
    plan.props.push({ kind: 'flowerBed', variant: 1, x: house.x + house.w - 3, y: house.y + house.h + 1, w: 2, h: 1, walkable: true });
    return;
  }
  if (leftX < doorX) {
    plan.props.push({ kind: 'flowerPot', variant: between(random, 0, 2), x: leftX, y: house.y + house.h, w: 1, h: 1, walkable: true });
  }
  if (rightX > doorX && (house.role === 'inn' || house.role === 'clinic' || house.role === 'school' || random() < 0.75)) {
    plan.props.push({ kind: house.role === 'inn' || house.size === 'palace' ? 'topiary' : 'flowerPot', variant: between(random, 0, 2), x: rightX, y: house.y + house.h, w: 1, h: 1, walkable: true });
  }
  if (house.w >= 8 && (house.role === 'inn' || house.role === 'school' || house.role === 'house' || random() < 0.45)) {
    plan.props.push({ kind: 'flowerBed', variant: between(random, 0, 2), x: house.x, y: house.y + house.h + 1, w: 2, h: 1, walkable: true });
  }
  if (house.role === 'barracks' || house.role === 'guild') {
    plan.props.push({ kind: 'weaponRack', x: house.x + house.w, y: house.y + house.h - 1, w: 2, h: 1, walkable: true });
    return;
  }
  if (house.role === 'harbor') {
    plan.props.push({ kind: 'harborGear', x: house.x + house.w, y: house.y + house.h - 1, w: 1, h: 1, walkable: true });
    return;
  }
  if ((house.role === 'farm' || house.role === 'mill' || house.role === 'forge') && random() < 0.8) {
    plan.props.push({ kind: 'wheelbarrow', x: house.x + house.w, y: house.y + house.h, w: 1, h: 1, walkable: true });
  }
  const kind = house.role === 'farm' || house.role === 'mill' ? 'hay' : house.style === 'hut' ? 'logs' : pickWith(random, ['barrels', 'crates', 'barrels', null]);
  if (!kind || house.size === 'palace') return;
  plan.props.push({ kind: kind, x: house.x + house.w, y: house.y + house.h - 1, w: kind === 'logs' ? 2 : 1, h: 1 });
}

// The hero garden next to home: soil to plant in, plus a welcoming flower pot.
function heroGarden(house, plan) {
  plan.fields.push({ x: house.x + house.w + 1, y: house.y + 1, w: 3, h: house.h - 2, crop: null, village: house.village, garden: true });
}

// ---------- The square ----------

function squareProps(place, square, plan, random) {
  const middle = { x: square.x + Math.floor(square.w / 2), y: square.y + Math.floor(square.h / 2) };
  const isBig = place.kind === 'town' || place.kind === 'capital';
  if (isBig) plan.props.push({ kind: 'fountain', x: middle.x - 1, y: middle.y - 3, w: 2, h: 2 });
  else plan.props.push({ kind: 'well', x: middle.x + 3, y: middle.y - 3, w: 1, h: 1 });
  plan.props.push({ kind: 'campfire', x: middle.x + 4, y: middle.y + 3, w: 1, h: 1 }); // the fire of the feasts
  plan.props.push({ kind: 'board', x: square.x + 1, y: square.y + 1, w: 1, h: 1 }); // the notice board (bounties)
  plan.props.push({ kind: 'flowerPot', variant: 0, x: square.x + 2, y: square.y + 1, w: 1, h: 1, walkable: true });
  plan.props.push({ kind: 'flowerPot', variant: 2, x: square.x + square.w - 2, y: square.y + 1, w: 1, h: 1, walkable: true });
  plan.props.push({ kind: 'signpost', x: square.x + 1, y: square.y + square.h - 2, w: 1, h: 1 });
  if (place.kind !== 'hamlet') {
    for (const [x, y] of [[square.x, square.y], [square.x + square.w - 1, square.y], [square.x, square.y + square.h - 1], [square.x + square.w - 1, square.y + square.h - 1]]) plan.props.push({ kind: 'lamp', x: x, y: y, w: 1, h: 1 });
    plan.props.push({ kind: 'bench', x: middle.x - 4, y: middle.y - 1, w: 2, h: 1 });
  }
  if (isBig) {
    plan.props.push({ kind: 'stall', x: square.x + 3, y: square.y + square.h - 4, w: 2, h: 2 });
    plan.props.push({ kind: 'stall', x: square.x + square.w - 6, y: square.y + square.h - 4, w: 2, h: 2 });
    plan.props.push({ kind: 'bench', x: middle.x + 2, y: middle.y - 1, w: 2, h: 1 });
    plan.props.push({ kind: 'flowerBed', variant: 0, x: middle.x - 4, y: square.y + 2, w: 2, h: 1, walkable: true });
    plan.props.push({ kind: 'flowerBed', variant: 2, x: middle.x + 2, y: square.y + 2, w: 2, h: 1, walkable: true });
    plan.props.push({ kind: 'flowerArch', x: middle.x - 1, y: square.y + 1, w: 2, h: 1, walkable: true });
    plan.props.push({ kind: 'flowerArch', x: middle.x - 1, y: square.y + square.h - 2, w: 2, h: 1, walkable: true });
    plan.props.push({ kind: 'topiary', x: square.x + 2, y: square.y + 2, w: 1, h: 1, walkable: true });
    plan.props.push({ kind: 'topiary', x: square.x + square.w - 3, y: square.y + 2, w: 1, h: 1, walkable: true });
    const flagColors = ['#d6302f', '#3b7be0', '#2e9e54', '#c9961e', '#8b5ad6'];
    const bannerColor = flagColors[Math.floor(random() * flagColors.length)];
    plan.props.push({ kind: 'banner', color: bannerColor, x: middle.x - 5, y: square.y + 1, w: 1, h: 1, walkable: true });
    plan.props.push({ kind: 'banner', color: bannerColor, x: middle.x + 4, y: square.y + 1, w: 1, h: 1, walkable: true });
  }
  if (place.kind === 'capital') {
    plan.props.push({ kind: 'statue', x: middle.x - 9, y: middle.y - 3, w: 2, h: 2 });
    plan.props.push({ kind: 'cage', x: square.x + square.w - 5, y: square.y + 2, w: 3, h: 2 }); // the slave traders
    plan.props.push({ kind: 'gameStall', x: square.x + 4, y: square.y + 2, w: 2, h: 2 }); // word games for Lexis
  }
  return middle;
}

// ---------- Everything ----------

// What fills the lots: first the buildings the village needs, then houses, fields, pens...
function fillLots(place, lots, plan, random) {
  const roles = [...place.roles.filter((role) => role !== 'palace')];
  const outer = [...lots].reverse(); // the lots far from the square: fields, pens, the graveyard
  const fieldCount = FIELDS_OF[place.kind] < 1 ? Math.floor(lots.length * FIELDS_OF[place.kind]) : FIELDS_OF[place.kind];
  const used = new Set();
  const take = (list) => list.find((lot) => !used.has(lot));
  for (let i = 0; i < fieldCount + PENS_OF[place.kind]; i++) {
    const lot = take(outer);
    if (!lot) break;
    used.add(lot);
    if (i < fieldCount) plan.fields.push(fieldIn(lot, place, random, plan));
    else plan.pens.push(penIn(lot, place));
  }
  const graveLot = place.kind !== 'hamlet' ? take(outer) : null;
  if (graveLot) {
    used.add(graveLot);
    graveyardIn(graveLot, plan);
  }
  for (const lot of lots) {
    if (used.has(lot)) continue;
    used.add(lot);
    if (roles.length > 0) {
      const house = buildingIn(lot, roles.shift(), place, random);
      plan.houses.push(house);
      decorate(house, plan, random);
      if (house.role === 'home') heroGarden(house, plan);
    } else if (!plan.training) trainingIn(lot, plan);
    else if (random() < 0.82) {
      const house = buildingIn(lot, 'house', place, random);
      plan.houses.push(house);
      decorate(house, plan, random);
    } else gardenIn(lot, plan, random);
  }
}

export function planTown(place) {
  const random = randomOf(place.id);
  const square = squareOf(place);
  const palace = place.kind === 'capital' ? palaceOf(place, square) : null;
  const streets = streetsOf(place, palace);
  const plan = { roads: streets, square: square, houses: [], fields: [], pens: [], props: [], trees: [], flowers: [], gates: gatesOf(place), training: null, graveyard: null, downtown: null };
  if (palace) {
    plan.houses.push({ ...palace, role: 'palace', size: 'palace', style: 'stone', roof: place.roof, sign: null, village: place.id });
    plan.downtown = { x: place.x + Math.floor(place.w / 4), y: place.y + Math.floor(place.h / 4), w: Math.floor(place.w / 2) + STREET, h: Math.floor(place.h / 2) + STREET };
  }
  plan.center = squareProps(place, square, plan, random);
  const lots = lotsOf(place, streets, [square, ...(palace ? [palace] : [])]);
  fillLots(place, lots, plan, random);
  return plan;
}
