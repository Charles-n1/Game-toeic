import { ITEMS } from '../data/items';
import { propsAround, TILE, tileAt } from '../world/map';
import { insideOf } from '../data/zones';
import { countItem, addItem, removeItem, heal } from './player';
import { applyDishBoosts } from './camp/recipes';
import { cureCold } from './weather';
import { notify, say } from './messages';
import { cue } from './cues';
import { floatText } from './particles';

// Eating, drinking and sleep fatigue. The hero gets hungry, thirsty and tired.
// Water from rivers is untreated until boiled at a campfire; wells & fountains provide clean water.

export const BOTTLE_SIZE = 3;
const HUNGER_PER_HOUR = 2; // a full belly lasts about 2 days of the game (16 real minutes)
const THIRST_PER_HOUR = 3; // a drink (+40) lasts about 13 hours of the game
const FATIGUE_PER_HOUR = 2.2;
const STARVING_HP_PER_HOUR = 4;
const FIRE_KINDS = ['campfire', 'torch', 'stove'];

function clamp(value) {
  return Math.min(100, Math.max(0, value));
}

// Time passes: the bars go down. Empty hunger/thirst can eventually drop HP to 0 outside sleep.
export function updateSurvival(game, hours, allowLethal = true) {
  const player = game.player;
  const before = { hunger: player.hunger, thirst: player.thirst, fatigue: player.fatigue || 0 };
  player.hunger = clamp(player.hunger - HUNGER_PER_HOUR * hours);
  player.thirst = clamp(player.thirst - THIRST_PER_HOUR * hours);
  player.fatigue = clamp((player.fatigue || 0) + FATIGUE_PER_HOUR * hours);
  if (player.hunger === 0 || player.thirst === 0) {
    game.run.starveLoss = (game.run.starveLoss || 0) + STARVING_HP_PER_HOUR * hours;
    const drop = Math.floor(game.run.starveLoss);
    if (drop >= 1) {
      game.run.starveLoss -= drop;
      const minHp = allowLethal ? 0 : 1;
      player.health = Math.max(minHp, Math.round(player.health) - drop);
    }
  }
  if (before.hunger >= 25 && player.hunger < 25) notify(game, '🍖 You are hungry. Eat something (Menu → Inventory).', '#ffb070');
  if (before.thirst >= 25 && player.thirst < 25) notify(game, '💧 You are thirsty. Drink from your bottle.', '#9fd8ff');
  if (before.fatigue < 85 && player.fatigue >= 85) notify(game, '🥱 Exhausted (-2 Speed)! Rest at camp, home, or an inn.', '#ffb070');
}

// ---------- Drinking ----------

export function drink(game) {
  const player = game.player;
  if (player.bottle <= 0) {
    notify(game, 'Your bottle is empty. Fill it at a river, a well or a fountain.');
    return false;
  }
  player.bottle -= 1;
  player.thirst = clamp(player.thirst + 40);
  if (player.bottleUntreated && Math.random() < 0.25) {
    player.health = Math.max(0, Math.round(player.health) - 5);
    notify(game, '🤢 Unboiled river water upset your stomach (−5 HP). Boil it over a fire or use a village well!', '#ff8a95');
  }
  if (player.bottle === 0) player.bottleUntreated = false;
  floatText(game, player.x, player.y - 1, '+40 💧', '#9fd8ff');
  return true;
}

// Is there water to fill the bottle near the hero? (The tile in front, or a well, a fountain within reach.)
export function canRefill(game, front) {
  if (game.player.bottle >= BOTTLE_SIZE) return false;
  if (tileAt(front.x, front.y) === TILE.WATER) return true;
  return propsAround(game.player.x, game.player.y, 2).some((prop) => prop.kind === 'well' || prop.kind === 'fountain' || prop.kind === 'waterPump');
}

export function refill(game) {
  const nearCleanFixture = propsAround(game.player.x, game.player.y, 2).some((prop) => prop.kind === 'well' || prop.kind === 'fountain' || prop.kind === 'waterPump');
  game.player.bottle = BOTTLE_SIZE;
  game.player.bottleUntreated = !nearCleanFixture;
  game.player.thirst = clamp(game.player.thirst + 15); // a sip while filling it
  cue(game, 'coin');
  notify(
    game,
    nearCleanFixture ? '💧 Bottle filled with clean well water (' + BOTTLE_SIZE + ' drinks).' : '💧 Bottle filled with river water (' + BOTTLE_SIZE + ' drinks — boil over fire to purify!).',
    '#9fd8ff'
  );
}

export function boilBottle(game) {
  const player = game.player;
  if (player.bottle <= 0 || !player.bottleUntreated) return false;
  player.bottleUntreated = false;
  cue(game, 'coin');
  notify(game, '🔥 Boiled your bottle water clean and safe!', '#7cfc9a');
  return true;
}

// ---------- Eating ----------

export function canEat(game, itemId) {
  return countItem(game.player, itemId) > 0 && ITEMS[itemId].food !== undefined;
}

// Raw meat feeds less, and can make you sick (it hurts a little).
export function eat(game, itemId) {
  if (!canEat(game, itemId)) return false;
  const item = ITEMS[itemId];
  const player = game.player;
  removeItem(player, itemId);
  player.hunger = clamp(player.hunger + item.food);
  if (item.water) player.thirst = clamp(player.thirst + item.water);
  if (item.heal) heal(player, item.heal);
  applyDishBoosts(game, itemId);
  if (['broth', 'herbStew', 'spicedStew', 'heartySoup', 'scholarTea', 'honeyPorridge', 'travelersFeast', 'ramen', 'curryRice', 'roastedFish', 'mushroomSoup'].includes(itemId)) {
    cureCold(game, '🍲 That hot dish warmed you up — your cold is cured!');
  }
  if (item.raw && Math.random() < 0.35) {
    player.health = Math.max(1, player.health - 10);
    notify(game, '🤢 The raw meat did not agree with you. −10 HP. Cook it next time!', '#ff8a95');
  }
  floatText(game, player.x, player.y - 1, '+' + item.food + ' 🍖', '#ffd086');
  return true;
}

// ---------- Cooking ----------

// The recipes: what goes in, what comes out. The broth needs water from the bottle.
export const RECIPES = [
  { id: 'roastMeat', needs: { rawMeat: 1 }, water: 0 },
  { id: 'broth', needs: { bone: 2 }, water: 1 },
  { id: 'herbStew', needs: { rawMeat: 1, herb: 1 }, water: 1 },
];

// Is there a fire to cook on near the hero? (A campfire, a torch on its stake, the stove of the home.)
export function fireToCookNear(game) {
  return propsAround(game.player.x, game.player.y, 2.2).some((prop) => FIRE_KINDS.includes(prop.kind));
}

export function canCook(game, recipe) {
  const enoughFood = Object.entries(recipe.needs).every(([itemId, amount]) => countItem(game.player, itemId) >= amount);
  return enoughFood && game.player.bottle >= recipe.water;
}

export function cook(game, recipe) {
  if (!canCook(game, recipe)) return;
  Object.entries(recipe.needs).forEach(([itemId, amount]) => removeItem(game.player, itemId, amount));
  game.player.bottle -= recipe.water;
  addItem(game.player, recipe.id);
  notify(game, '🔥 You cooked: ' + ITEMS[recipe.id].name + '.', '#ffd086');
}

// The cooking menu: every recipe the hero can make now (plus boiling raw river water).
export function offerCooking(game) {
  const ready = RECIPES.filter((recipe) => canCook(game, recipe));
  const choices = ready.map((recipe) => ({ label: 'Cook: ' + ITEMS[recipe.id].name, icon: recipe.id, run: () => cook(game, recipe) }));
  if (game.player.bottle > 0 && game.player.bottleUntreated) {
    choices.unshift({ label: 'Boil River Water Clean', icon: 'water', run: () => boilBottle(game) });
  }
  if (choices.length === 0) {
    say(game, null, ['The fire crackles. Nothing to cook: bring raw meat (2 bones and water make a broth, meat and an herb a stew).']);
    return;
  }
  say(game, null, ['The fire is warm. What do you prepare?'], [...choices, { label: 'Nothing', run: () => {} }]);
}

// The stove of the home (it is a prop of the home, see world/insides.js).
export function isNearStove(game) {
  const home = insideOf('home');
  return Math.hypot(home.x + home.w - 2 - game.player.x, home.y + 2 - game.player.y) < 2.4;
}
