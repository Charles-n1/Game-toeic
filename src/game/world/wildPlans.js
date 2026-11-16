import { randomOf, between } from './seeded';

// The plans of the places of the monsters and of the bandits (the same shape as a plan of world/townPlan.js).
//   A village of monsters: tents and huts in a ring around a fire and a war totem, a fence of spikes.
//   A camp of bandits: a palisade, tents, the big tent of the chief, a cage for the prisoners.

function middleOf(place) {
  return { x: place.x + Math.floor(place.w / 2), y: place.y + Math.floor(place.h / 2) };
}

function emptyPlan(place) {
  const middle = middleOf(place);
  return { roads: [], square: null, houses: [], fields: [], pens: [], props: [], trees: [], flowers: [], gates: [], center: middle, training: null, graveyard: null, downtown: null };
}

// A fence of pieces all around a place (a prop per tile), with a hole of 3 tiles in the middle of each side
// that has a gate. kind: 'spikes' | 'palisade'. gateSides: the sides with a gate ('top', 'bottom', 'left', 'right').
function fenceAround(place, kind, gateSides, plan) {
  const middle = middleOf(place);
  const isHole = (side, along) => gateSides.includes(side) && Math.abs(along - (side === 'top' || side === 'bottom' ? middle.x : middle.y)) <= 1;
  for (let x = place.x; x < place.x + place.w; x++) {
    if (!isHole('top', x)) plan.props.push({ kind: kind, x: x, y: place.y, w: 1, h: 1, side: 'row' });
    if (!isHole('bottom', x)) plan.props.push({ kind: kind, x: x, y: place.y + place.h - 1, w: 1, h: 1, side: 'row' });
  }
  for (let y = place.y + 1; y < place.y + place.h - 1; y++) {
    if (!isHole('left', y)) plan.props.push({ kind: kind, x: place.x, y: y, w: 1, h: 1, side: 'column' });
    if (!isHole('right', y)) plan.props.push({ kind: kind, x: place.x + place.w - 1, y: y, w: 1, h: 1, side: 'column' });
  }
  const sides = { top: [middle.x - 1, place.y, 0, -1], bottom: [middle.x - 1, place.y + place.h - 1, 0, 1], left: [place.x, middle.y - 1, -1, 0], right: [place.x + place.w - 1, middle.y - 1, 1, 0] };
  plan.gates = gateSides.map((side) => ({ x: sides[side][0], y: sides[side][1], dx: sides[side][2], dy: sides[side][3], w: 3 }));
}

function tent(x, y, w, h, place, role) {
  return { x: x, y: y, w: w, h: h, role: role, size: 'tent', style: 'tent', roof: place.clan ? 'bandit' : 'monster', sign: null, village: place.id };
}

// A village of monsters: their tents in a ring around the fire, the war totem, bones everywhere.
export function planMonsterTown(place) {
  const random = randomOf(place.id);
  const plan = emptyPlan(place);
  const middle = plan.center;
  plan.square = { x: middle.x - 9, y: middle.y - 7, w: 18, h: 14 };
  plan.props.push({ kind: 'campfire', x: middle.x, y: middle.y, w: 1, h: 1 });
  plan.props.push({ kind: 'warTotem', x: middle.x - 4, y: middle.y - 3, w: 1, h: 1 });
  const count = between(random, 8, 11);
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + random() * 0.3;
    const x = Math.round(middle.x + Math.cos(angle) * (place.w / 2 - 13) - 3);
    const y = Math.round(middle.y + Math.sin(angle) * (place.h / 2 - 10) - 2);
    plan.houses.push(tent(x, y, 6, 4, place, 'tent'));
  }
  for (let i = 0; i < 6; i++) plan.props.push({ kind: 'bones', x: place.x + between(random, 4, place.w - 5), y: place.y + between(random, 4, place.h - 5), w: 1, h: 1, walkable: true });
  fenceAround(place, 'spikes', ['top', 'bottom', 'left', 'right'], plan);
  return plan;
}

// A camp of bandits: one gate at the bottom, the tent of the chief at the top, a cage beside it.
export function planCamp(place) {
  const plan = emptyPlan(place);
  const middle = plan.center;
  plan.square = { x: middle.x - 8, y: middle.y - 2, w: 16, h: 10 };
  plan.houses.push(tent(middle.x - 5, place.y + 4, 10, 6, place, 'chief'));
  for (const [dx, dy] of [[4, 4], [place.w - 10, 4], [4, place.h - 10], [place.w - 10, place.h - 10]]) plan.houses.push(tent(place.x + dx, place.y + dy, 6, 4, place, 'tent'));
  plan.props.push({ kind: 'cage', x: middle.x + 7, y: place.y + 6, w: 3, h: 2 });
  plan.props.push({ kind: 'campfire', x: middle.x - 4, y: middle.y + 2, w: 1, h: 1 });
  plan.props.push({ kind: 'campfire', x: middle.x + 4, y: middle.y + 2, w: 1, h: 1 });
  plan.props.push({ kind: 'crates', x: place.x + 3, y: middle.y, w: 1, h: 1 });
  plan.props.push({ kind: 'barrels', x: place.x + place.w - 4, y: middle.y, w: 1, h: 1 });
  plan.props.push({ kind: 'board', x: middle.x - 2, y: place.y + place.h - 4, w: 1, h: 1 });
  fenceAround(place, 'palisade', ['bottom'], plan);
  return plan;
}
