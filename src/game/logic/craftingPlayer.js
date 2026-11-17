import { ITEMS } from '../data/items';
import { addItem, countItem, removeItem, equip } from './player';
import { resetSlotDurability } from './durability';
import { econVillage } from './economy/state';
import { isStuck } from './isekai/curses';
import { notify } from './messages';
import { cue } from './cues';

// Player-initiated crafting recipes across village Forges, Markets/Tanners, Potions/Clinics, and Field Camps.
export const PLAYER_RECIPES = [
  // Forging weapons & armor from mined/hunted materials
  { id: 'ironSword', needs: { ore: 3, firewood: 1, branch: 1 }, fee: 10, stations: ['forge'], desc: 'Forged iron blade from ore & charcoal.' },
  { id: 'hunterBow', needs: { branch: 4, feather: 4, antler: 1 }, fee: 8, stations: ['forge', 'camp'], desc: 'Ash & antler hunting bow (inflicts Bleed).' },
  { id: 'steelSword', needs: { ore: 5, firewood: 2, pelt: 1 }, fee: 20, stations: ['forge'], desc: 'Tempered steel sword.' },
  { id: 'mithrilSword', needs: { ore: 5, crystal: 3, firewood: 2 }, fee: 35, stations: ['forge'], desc: 'Crystal-infused mithril blade.' },
  { id: 'chainMail', needs: { ore: 4, firewood: 2 }, fee: 15, stations: ['forge'], desc: 'Riveted iron chain armor.' },
  { id: 'bisonPlate', needs: { pelt: 3, antler: 2, ore: 3 }, fee: 18, stations: ['forge'], desc: 'Heavy horned frontier armor (+25 HP).' },
  { id: 'plateArmor', needs: { ore: 6, crystal: 2, firewood: 3 }, fee: 30, stations: ['forge'], desc: 'Full knightly plate armor.' },
  { id: 'turretKit', needs: { ore: 3, firewood: 2, rope: 1 }, fee: 10, stations: ['forge', 'market'], desc: 'Buildable village defense turret kit.' },

  // Tanning, tailoring, packs & repair gear
  { id: 'leatherArmor', needs: { pelt: 3, cloth: 1 }, fee: 6, stations: ['forge', 'market', 'weaver'], desc: 'Supple stitched hide armor.' },
  { id: 'leatherBoots', needs: { pelt: 2, rope: 1 }, fee: 5, stations: ['forge', 'market', 'weaver'], desc: 'Light stitched trail boots (+2 Spd).' },
  { id: 'wolfCloak', needs: { pelt: 4, wool: 2 }, fee: 8, stations: ['forge', 'market', 'weaver', 'camp'], desc: 'Insulated fur cloak (+4 Def, Cold resist).' },
  { id: 'travelerPack', needs: { pelt: 3, cloth: 2, rope: 1 }, fee: 8, stations: ['market', 'weaver', 'forge', 'camp'], desc: 'Leather rucksack (+18 kg capacity).' },
  { id: 'warSatchel', needs: { pelt: 3, crystal: 2, cloth: 2 }, fee: 18, stations: ['forge', 'market'], desc: 'Enchanted satchel (+36 kg capacity).' },
  { id: 'repairKit', needs: { flint: 2, ore: 1, cloth: 1 }, fee: 0, stations: ['forge', 'market', 'camp'], desc: 'Field whetstone & patches (+45% durability).' },

  // Alchemy & potions
  { id: 'healthPotion', needs: { herb: 2, honey: 1 }, fee: 0, stations: ['potions', 'clinic', 'camp'], desc: 'Brew a restorative vial (+60 HP).' },
  { id: 'bigPotion', needs: { herb: 3, mushroom: 2, crystal: 1 }, fee: 5, stations: ['potions', 'clinic'], desc: 'Concentrated elixir (+150 HP).' },
  { id: 'manaPotion', needs: { crystal: 1, herb: 2 }, fee: 0, stations: ['potions', 'clinic', 'camp'], desc: 'Arcane tonic (+5 MP).' },
  { id: 'speedPotion', needs: { feather: 3, herb: 2 }, fee: 0, stations: ['potions', 'clinic', 'camp'], desc: 'Swift draught (+50% battle time).' },
  { id: 'antidote', needs: { herb: 2, mushroom: 1 }, fee: 0, stations: ['potions', 'clinic', 'camp'], desc: 'Purges poison, burn & bleed (+20 HP).' },
];

export function recipesForStation(station) {
  return PLAYER_RECIPES.filter((r) => r.stations.includes(station));
}

export function canPlayerCraft(game, recipe) {
  if (!recipe || !ITEMS[recipe.id]) return false;
  if ((game.player.lexis || 0) < (recipe.fee || 0)) return false;
  return Object.entries(recipe.needs).every(([itemId, qty]) => countItem(game.player, itemId) >= qty);
}

export function craftPlayerItem(game, recipeId, villageId = null) {
  const recipe = PLAYER_RECIPES.find((r) => r.id === recipeId);
  if (!canPlayerCraft(game, recipe)) return false;

  for (const [itemId, qty] of Object.entries(recipe.needs)) {
    removeItem(game.player, itemId, qty);
  }
  const fee = recipe.fee || 0;
  if (fee > 0) {
    game.player.lexis -= fee;
    const econ = villageId ? econVillage(game, villageId) : null;
    if (econ) econ.treasury += fee;
  }

  const item = ITEMS[recipe.id];
  const equipKinds = ['weapon', 'armor', 'boots', 'accessory'];
  const currentPower = (id) => (id && ITEMS[id] ? (ITEMS[id].power || 0) + (ITEMS[id].defense || 0) + (ITEMS[id].speed || 0) : 0);
  if (equipKinds.includes(item.kind) && !isStuck(game, game.player[item.kind]) && currentPower(recipe.id) > currentPower(game.player[item.kind])) {
    const prev = game.player[item.kind];
    if (prev && prev !== recipe.id && !['woodSword', 'clothes', 'sandals'].includes(prev)) {
      addItem(game.player, prev, 1);
    }
    equip(game.player, recipe.id);
    resetSlotDurability(game, item.kind);
    notify(game, '⚒️ Forged & equipped ' + item.name + '!', '#7cfc9a');
  } else {
    addItem(game.player, recipe.id, 1);
    notify(game, '⚒️ Crafted ' + item.name + '!', '#7cfc9a');
  }
  if (!game.counts) game.counts = { kills: 0, answers: 0, correct: 0, harvested: 0, helped: 0 };
  game.counts.crafted = (game.counts.crafted || 0) + 1;
  cue(game, 'victory');
  return true;
}
