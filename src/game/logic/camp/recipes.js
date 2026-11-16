import { ITEMS } from '../../data/items';
import { addBoost } from '../boosts';
import { countItem, removeItem } from '../player';

// Timed stat boosts granted by cooked camp dishes (via logic/boosts.js with source 'meal').
export const DISH_BOOSTS = {
  roastMeat: [{ stat: 'attack', amount: 2, hours: 8 }],
  broth: [{ stat: 'defense', amount: 2, hours: 8 }],
  herbStew: [
    { stat: 'health', amount: 10, hours: 8 },
    { stat: 'spell', amount: 5, hours: 8 },
  ],
  spicedStew: [
    { stat: 'attack', amount: 6, hours: 12 },
    { stat: 'speed', amount: 2, hours: 12 },
  ],
  hunterSkewer: [
    { stat: 'speed', amount: 4, hours: 12 },
    { stat: 'attack', amount: 4, hours: 12 },
  ],
  heartySoup: [
    { stat: 'health', amount: 25, hours: 12 },
    { stat: 'defense', amount: 4, hours: 12 },
  ],
  scholarTea: [
    { stat: 'spell', amount: 20, hours: 12 },
    { stat: 'speed', amount: 2, hours: 12 },
  ],
  honeyPorridge: [
    { stat: 'defense', amount: 5, hours: 12 },
    { stat: 'health', amount: 20, hours: 12 },
  ],
  travelersFeast: [
    { stat: 'speed', amount: 3, hours: 16 },
    { stat: 'health', amount: 20, hours: 16 },
    { stat: 'attack', amount: 5, hours: 16 },
    { stat: 'spell', amount: 15, hours: 16 },
    { stat: 'defense', amount: 3, hours: 16 },
  ],
};

// Camp cooking recipes. pot: true requires the cooking pot (hero has it by default).
export const CAMP_RECIPES = [
  { id: 'roastMeat', needs: { rawMeat: 1 }, water: 0, pot: false },
  { id: 'broth', needs: { bone: 2 }, water: 1, pot: true },
  { id: 'herbStew', needs: { rawMeat: 1, herb: 1 }, water: 1, pot: true },
  { id: 'hunterSkewer', needs: { rawMeat: 1, carrot: 1 }, water: 0, pot: false },
  { id: 'spicedStew', needs: { rawMeat: 1, herb: 1, carrot: 1 }, water: 1, pot: true },
  { id: 'heartySoup', needs: { bone: 1, carrot: 1, wheat: 1 }, water: 1, pot: true },
  { id: 'scholarTea', needs: { herb: 1, flower: 1 }, water: 1, pot: true },
  { id: 'honeyPorridge', needs: { wheat: 2, flower: 1 }, water: 1, pot: true },
  { id: 'travelersFeast', needs: { rawMeat: 1, carrot: 1, wheat: 1, herb: 1 }, water: 1, pot: true },
];

export function recipeOf(dishId) {
  return CAMP_RECIPES.find((recipe) => recipe.id === dishId) || null;
}

export function canCookCampRecipe(game, recipe) {
  if (!recipe) return false;
  if (recipe.pot && !game.camp?.hasPot) return false;
  const hasIngredients = Object.entries(recipe.needs).every(([itemId, amount]) => countItem(game.player, itemId) >= amount);
  return hasIngredients && game.player.bottle >= recipe.water;
}

export function consumeRecipeIngredients(game, recipe) {
  Object.entries(recipe.needs).forEach(([itemId, amount]) => removeItem(game.player, itemId, amount));
  game.player.bottle = Math.max(0, game.player.bottle - recipe.water);
}

export function describeRecipeNeeds(recipe) {
  const parts = Object.entries(recipe.needs).map(([id, n]) => ITEMS[id].name + '×' + n);
  if (recipe.water > 0) parts.push('Water×' + recipe.water);
  return parts.join(', ');
}

export function applyDishBoosts(game, dishId) {
  const boosts = DISH_BOOSTS[dishId];
  if (!boosts) return [];
  boosts.forEach((boost) => addBoost(game, boost.stat, boost.amount, boost.hours, 'meal'));
  return boosts;
}

export function describeBoosts(dishId) {
  const boosts = DISH_BOOSTS[dishId];
  if (!boosts || boosts.length === 0) return '';
  return boosts.map((b) => b.stat + ' +' + b.amount).join(', ') + ' (' + boosts[0].hours + 'h)';
}
