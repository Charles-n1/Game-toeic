import { ITEMS } from '../data/items';
import { notify } from './messages';
import { cue } from './cues';

// Equipment durability (0..100%) for weapon, armor, and boots.
// Condition scales effective gear stats smoothly without permanently destroying gear.

export const DURABILITY_SLOTS = ['weapon', 'armor', 'boots'];

export function firstDurability() {
  return { weapon: 100, armor: 100, boots: 100 };
}

export function ensureDurability(game) {
  if (!game.durability || typeof game.durability !== 'object') {
    game.durability = firstDurability();
  }
  for (const slot of DURABILITY_SLOTS) {
    if (typeof game.durability[slot] !== 'number' || Number.isNaN(game.durability[slot])) {
      game.durability[slot] = 100;
    } else {
      game.durability[slot] = Math.max(0, Math.min(100, Math.round(game.durability[slot])));
    }
  }
  return game.durability;
}

export function durabilityOf(game, slot) {
  if (!game || !DURABILITY_SLOTS.includes(slot)) return 100;
  return ensureDurability(game)[slot];
}

export function gearConditionFactor(game, slot) {
  if (!game || !DURABILITY_SLOTS.includes(slot)) return 1;
  const dur = durabilityOf(game, slot);
  if (dur >= 50) return 1.0;
  if (dur >= 25) return 0.75;
  if (dur >= 1) return 0.5;
  return 0.15;
}

export function gearConditionLabel(dur) {
  if (dur >= 50) return 'Good';
  if (dur >= 25) return 'Worn';
  if (dur >= 1) return 'Damaged';
  return 'Broken';
}

export function resetSlotDurability(game, slot) {
  if (!game || !DURABILITY_SLOTS.includes(slot)) return;
  ensureDurability(game)[slot] = 100;
}

export function wearGear(game, slot, amount = 2) {
  if (!game || !DURABILITY_SLOTS.includes(slot) || amount <= 0) return;
  const equipped = game.player?.[slot];
  if (!equipped || !ITEMS[equipped]) return;
  const durMap = ensureDurability(game);
  const before = durMap[slot];
  const after = Math.max(0, Math.round(before - amount));
  durMap[slot] = after;
  const name = ITEMS[equipped].name;
  if (before >= 50 && after < 50 && after >= 25) {
    notify(game, '🛠️ Your ' + name + ' is wearing down (' + after + '%).', '#ffb070');
  } else if (before >= 25 && after < 25 && after > 0) {
    notify(game, '⚠️ Your ' + name + ' is badly damaged (' + after + '% · 50% power)!', '#ff7a7a');
  } else if (before > 0 && after === 0) {
    notify(game, '💥 Your ' + name + ' broke (0% · 15% power)! Repair it at a Forge or use a Whetstone Kit.', '#ff4d5a');
  }
}

export function repairCostOf(game) {
  const dur = ensureDurability(game);
  let totalMissing = 0;
  for (const slot of DURABILITY_SLOTS) totalMissing += 100 - dur[slot];
  if (totalMissing <= 0) return 0;
  return Math.max(4, Math.round(totalMissing * 0.45));
}

export function needsRepair(game) {
  const dur = ensureDurability(game);
  return DURABILITY_SLOTS.some((slot) => dur[slot] < 100);
}

function takeFromBag(bag, id, count) {
  bag[id] = (bag[id] || 0) - count;
  if (bag[id] <= 0) delete bag[id];
}

export function repairAllGear(game, useMaterials = false, onTreasuryGain = null) {
  if (!needsRepair(game)) return false;
  const dur = ensureDurability(game);
  const bag = game.player.bag || {};
  if (useMaterials) {
    const hasOre = (bag.ore || 0) >= 1;
    const hasPelt = (bag.pelt || 0) >= 1;
    if (!hasOre && !hasPelt) return false;
    takeFromBag(bag, hasOre ? 'ore' : 'pelt', 1);
  } else {
    const cost = repairCostOf(game);
    if (game.player.lexis < cost) return false;
    game.player.lexis -= cost;
    if (onTreasuryGain) onTreasuryGain(cost);
  }
  for (const slot of DURABILITY_SLOTS) dur[slot] = 100;
  cue(game, 'coin');
  notify(game, '⚒️ All equipment restored to 100% durability!', '#7cfc9a');
  return true;
}

export function useRepairKit(game) {
  const bag = game.player.bag || {};
  if ((bag.repairKit || 0) <= 0 || !needsRepair(game)) return false;
  const dur = ensureDurability(game);
  const amount = ITEMS.repairKit?.repair || 45;
  takeFromBag(bag, 'repairKit', 1);
  for (const slot of DURABILITY_SLOTS) {
    dur[slot] = Math.min(100, dur[slot] + amount);
  }
  cue(game, 'coin');
  notify(game, '⚒️ Used Whetstone & Patch Kit: +' + amount + '% durability restored!', '#7cfc9a');
  return true;
}
