import { VILLAGES } from '../../data/zones';
import { ITEMS } from '../../data/items';
import { econVillage, ensureEconomy } from './state';

// Real artisan crafting recipes mapped to village buildings (data/buildings.js ROLES),
// biome extraction by paid local workers, daily town taxes/consumption, and scarcity pricing.

export const CRAFT_RECIPES = [
  // Forge & Smithy
  { out: 'ironSword', needs: { ore: 2, firewood: 1 }, wage: 14, batch: 1, cap: 3, roles: ['forge', 'smithy'] },
  { out: 'steelSword', needs: { ore: 3, firewood: 2 }, wage: 24, batch: 1, cap: 2, roles: ['forge', 'smithy'] },
  { out: 'mithrilSword', needs: { ore: 3, crystal: 2, firewood: 2 }, wage: 40, batch: 1, cap: 2, roles: ['forge'] },
  { out: 'chainMail', needs: { ore: 3, firewood: 1 }, wage: 22, batch: 1, cap: 2, roles: ['forge', 'smithy'] },
  { out: 'plateArmor', needs: { ore: 4, firewood: 2 }, wage: 35, batch: 1, cap: 2, roles: ['forge'] },
  { out: 'turretKit', needs: { ore: 2, firewood: 2 }, wage: 16, batch: 1, cap: 3, roles: ['forge', 'smithy', 'market'] },

  // Weaver & Armor tailoring
  { out: 'cloth', needs: { wool: 2 }, wage: 4, batch: 2, cap: 8, roles: ['weaver', 'market'] },
  { out: 'leatherArmor', needs: { pelt: 2, cloth: 1 }, wage: 12, batch: 1, cap: 3, roles: ['weaver', 'forge', 'market'] },

  // Bakery, Mill & Stable supplies
  { out: 'bread', needs: { wheat: 2 }, wage: 3, batch: 3, cap: 10, roles: ['bakery', 'mill'] },
  { out: 'berryTart', needs: { wildBerries: 2, wheat: 1, honey: 1 }, wage: 6, batch: 2, cap: 5, roles: ['bakery', 'inn'] },
  { out: 'horseFeed', needs: { wheat: 2, apple: 1 }, wage: 4, batch: 2, cap: 8, roles: ['market', 'stable', 'farm'] },
  { out: 'wheatSeed', needs: { wheat: 1 }, wage: 1, batch: 3, cap: 10, roles: ['bakery', 'farm', 'market'] },

  // Potions, Clinic & Arcane
  { out: 'healthPotion', needs: { herb: 2, honey: 1 }, wage: 6, batch: 2, cap: 8, roles: ['potions', 'clinic'] },
  { out: 'bigPotion', needs: { herb: 3, mushroom: 2, honey: 1 }, wage: 12, batch: 1, cap: 4, roles: ['potions', 'clinic'] },
  { out: 'manaPotion', needs: { crystal: 1, herb: 2 }, wage: 8, batch: 2, cap: 5, roles: ['potions', 'arcane'] },

  // Food preservation & harbor/lodge
  { out: 'driedMeat', needs: { rawMeat: 2 }, wage: 4, batch: 2, cap: 8, roles: ['market', 'lodge', 'inn'] },
  { out: 'roastedFish', needs: { rawFish: 2, firewood: 1 }, wage: 5, batch: 2, cap: 6, roles: ['harbor', 'inn', 'market'] },
];

const BIOME_OUTPUTS = {
  mountain: [['ore', 3, 2], ['crystal', 1, 5], ['pelt', 1, 2], ['firewood', 1, 1]],
  forest: [['firewood', 4, 1], ['herb', 3, 1], ['mushroom', 3, 2], ['pelt', 2, 2], ['rawMeat', 2, 1], ['wildBerries', 2, 1]],
  meadow: [['wheat', 4, 1], ['wool', 3, 1], ['honey', 2, 2], ['apple', 2, 1], ['milk', 2, 1], ['egg', 2, 1], ['herb', 1, 1]],
  desert: [['ore', 1, 2], ['coconut', 1, 1], ['herb', 1, 2]],
  coast: [['rawFish', 4, 1], ['coconut', 2, 1], ['crystal', 1, 4], ['salt' in ITEMS ? 'salt' : 'herb', 1, 1]],
};

export function recipeForProduct(itemId) {
  return CRAFT_RECIPES.find((r) => r.out === itemId) || null;
}

export function canCraftRecipe(econ, recipe) {
  if (!econ || (econ.stock[recipe.out] || 0) >= recipe.cap) return false;
  if (econ.treasury < recipe.wage) return false;
  return Object.entries(recipe.needs).every(([id, q]) => (econ.inputs[id] || 0) >= q);
}

// Converts raw inputs + craftsman wages into finished shop stock inside a village.
export function craftWorkshops(game, villageId, maxBatches = 4) {
  const econ = econVillage(game, villageId);
  if (!econ) return 0;
  let total = 0;
  for (let pass = 0; pass < maxBatches; pass++) {
    let madeOne = false;
    for (const recipe of CRAFT_RECIPES) {
      if (!recipe.roles.some((r) => econ.roles.includes(r))) continue;
      if (!canCraftRecipe(econ, recipe)) continue;
      for (const [id, q] of Object.entries(recipe.needs)) econ.inputs[id] -= q;
      econ.treasury -= recipe.wage;
      econ.wagesPaid += recipe.wage;
      econ.stock[recipe.out] = (econ.stock[recipe.out] || 0) + recipe.batch;
      econ.craftedCount += 1;
      total += 1;
      madeOne = true;
    }
    if (!madeOne) break;
  }
  return total;
}

// Lists raw resources a town urgently lacks so workshops can craft or restock.
export function missingInputsFor(game, villageId) {
  const econ = econVillage(game, villageId);
  if (!econ) return [];
  const gaps = new Map();
  for (const recipe of CRAFT_RECIPES) {
    if (!recipe.roles.some((r) => econ.roles.includes(r))) continue;
    const stockNow = econ.stock[recipe.out] || 0;
    if (stockNow >= Math.ceil(recipe.cap * 0.6)) continue;
    for (const [itemId, needQty] of Object.entries(recipe.needs)) {
      const have = econ.inputs[itemId] || 0;
      const target = Math.max(4, needQty * 2);
      if (have < target) {
        const deficit = target - have;
        const prev = gaps.get(itemId);
        if (!prev || deficit > prev.deficit) {
          gaps.set(itemId, {
            itemId: itemId,
            have: have,
            need: target,
            deficit: deficit,
            forProduct: recipe.out,
            shopRole: recipe.roles[0],
          });
        }
      }
    }
  }
  return [...gaps.values()].sort((a, b) => b.deficit - a.deficit);
}

// Paid local extraction: merchants pay village workers to gather nearby raw resources.
function extractLocalResources(game, village, econ, vState, dayScale) {
  const table = BIOME_OUTPUTS[econ.biome] || BIOME_OUTPUTS.meadow;
  const workforceScale = Math.max(0.4, Math.min(1.8, (vState.adults || 8) / 14)) * dayScale;
  for (const [itemId, perDay, wagePerUnit] of table) {
    if ((econ.inputs[itemId] || 0) >= 24) continue;
    const rawQty = perDay * workforceScale;
    const units = Math.floor(rawQty) + (Math.random() < rawQty - Math.floor(rawQty) ? 1 : 0);
    if (units <= 0) continue;
    const cost = units * wagePerUnit;
    if (econ.treasury < cost) continue;
    econ.treasury -= cost;
    econ.wagesPaid += cost;
    econ.inputs[itemId] = (econ.inputs[itemId] || 0) + units;
  }
  if (village.kind === 'farm' && econ.treasury >= 3) {
    const farmGain = Math.max(1, Math.round(2 * dayScale));
    if ((econ.inputs.wheat || 0) < 28) econ.inputs.wheat = (econ.inputs.wheat || 0) + farmGain;
  }
}

// Periodic world simulation: collects citizen trade taxes, pays extractors, crafts items, consumes food.
export function stepEconomyProduction(game, hours) {
  ensureEconomy(game);
  const dayScale = Math.max(0.02, hours / 24);
  for (const village of VILLAGES) {
    const vState = game.villages[village.id];
    if (!vState || vState.owner !== 'people') continue;
    const econ = econVillage(game, village.id);
    if (!econ) continue;

    // Citizen commerce taxes feed local merchant/city funds
    const tax = Math.max(1, Math.round((vState.adults * 1.1 + (village.kind === 'capital' ? 45 : 8)) * dayScale));
    econ.treasury += tax;
    econ.taxesEarned += tax;

    extractLocalResources(game, village, econ, vState, dayScale);
    craftWorkshops(game, village.id, hours >= 12 ? 3 : 1);

    // Local town consumption drains bread & dried meat softly to keep bakeries & haulers busy
    if (hours >= 6 || Math.random() < dayScale * 3) {
      if ((econ.stock.bread || 0) > 2) econ.stock.bread -= 1;
      if ((econ.stock.driedMeat || 0) > 2 && Math.random() < 0.5) econ.stock.driedMeat -= 1;
    }
  }
}

// Dynamic supply & demand price factor for buying or selling an item in a specific town.
export function economyPriceMultiplier(game, villageId, itemId) {
  const econ = villageId ? econVillage(game, villageId) : null;
  if (!econ) return 1;
  const stockQty = econ.stock[itemId];
  if (stockQty !== undefined) {
    if (stockQty <= 1) return 1.3;
    if (stockQty <= 2) return 1.12;
    if (stockQty >= 8) return 0.78;
    if (stockQty >= 5) return 0.88;
    return 1;
  }
  const inputQty = econ.inputs[itemId];
  if (inputQty !== undefined) {
    if (inputQty <= 1) return 1.45;
    if (inputQty <= 3) return 1.2;
    if (inputQty >= 14) return 0.72;
    return 1;
  }
  return 1;
}
