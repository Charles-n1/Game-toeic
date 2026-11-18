import { ITEMS } from '../data/items';
import { ensureSociety } from './society/state';
import { skillTreeBonuses } from './isekaiTodo/progression';

// Encumbrance & carry capacity: items in the bag have physical weight (kg).
// Keeping a light bag preserves 100% normal speed; overloading slows movement and fight focus.

const SPECIFIC_WEIGHTS = {
  ore: 1.5,
  crystal: 1.2,
  stone: 1.8,
  branch: 0.9,
  firewood: 1.2,
  flint: 0.4,
  rope: 0.7,
  oil: 0.8,
  lampOil: 0.8,
  cloth: 0.8,
  wool: 0.8,
  pelt: 1.1,
  antler: 1.4,
  bone: 0.5,
  rawMeat: 0.8,
  roastMeat: 0.6,
  driedMeat: 0.4,
  warRations: 0.6,
  turretKit: 3.5,
  repairKit: 0.9,
  hunterBow: 2.2,
  bisonPlate: 4.5,
  wolfCloak: 1.2,
  travelerPack: 0.5,
  warSatchel: 0.5,
  royalPass: 0.1,
  wheat: 0.5,
  caravanParcel: 2.0,
};

const KIND_WEIGHTS = {
  weapon: 2.8,
  armor: 4.0,
  boots: 1.2,
  accessory: 0.3,
  furniture: 3.5,
  mystery: 2.0,
  seed: 0.05,
  potion: 0.35,
  food: 0.45,
  material: 0.6,
  goods: 0.7,
  tool: 1.2,
  map: 0.1,
  pack: 0.5,
};

export function itemWeight(itemId) {
  if (SPECIFIC_WEIGHTS[itemId] !== undefined) return SPECIFIC_WEIGHTS[itemId];
  const item = ITEMS[itemId];
  if (!item) return 0;
  return KIND_WEIGHTS[item.kind] ?? 0.5;
}

export function packBonus(player) {
  const bag = player?.bag || {};
  if ((bag.warSatchel || 0) > 0) return ITEMS.warSatchel?.capacityBonus || 36;
  if ((bag.travelerPack || 0) > 0) return ITEMS.travelerPack?.capacityBonus || 18;
  return 0;
}

export function horsePackBonus(game) {
  const s = game?.society ? ensureSociety(game) : null;
  if (!s) return 0;
  if (s.riding?.active) return 50;
  if (s.parkedHorse && Math.hypot(s.parkedHorse.x - game.player.x, s.parkedHorse.y - game.player.y) <= 80) return 50;
  return 0;
}

export function carryCapacity(game) {
  const player = game.player;
  const levelBonus = Math.max(0, (player.level || 1) - 1) * 1.5;
  const treeCarry = game ? skillTreeBonuses(game).carry || 0 : 0;
  return Math.round((45 + levelBonus + treeCarry + packBonus(player) + horsePackBonus(game)) * 10) / 10;
}

export function bagWeight(game) {
  const bag = game.player?.bag || {};
  let total = 0;
  for (const [itemId, count] of Object.entries(bag)) {
    if (count > 0) total += itemWeight(itemId) * count;
  }
  return Math.round(total * 10) / 10;
}

export function encumbranceStatus(game) {
  const weight = bagWeight(game);
  const capacity = carryCapacity(game);
  const ratio = capacity > 0 ? weight / capacity : 1;
  if (ratio <= 1.0) {
    return { weight, capacity, ratio, state: 'Normal', speedMult: 1.0, canSprint: true, timeMult: 1.0 };
  }
  if (ratio <= 1.3) {
    return { weight, capacity, ratio, state: 'Heavy', speedMult: 0.78, canSprint: false, timeMult: 0.95 };
  }
  return { weight, capacity, ratio, state: 'Overloaded', speedMult: 0.52, canSprint: false, timeMult: 0.88 };
}
