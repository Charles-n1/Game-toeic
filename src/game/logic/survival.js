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

export const BOTTLE_SIZE = 3; // base capacity for backward compatibility; prefer bottleSize(player)
export const BOTTLE_TIERS = [
  { level: 1, name: 'Leather Waterskin', cap: 3, restore: 40, heal: 0, purify: false, needs: null, fee: 0, desc: 'Basic travel skin: 3 sips (+40 thirst).' },
  { level: 2, name: 'Reinforced Canteen', cap: 5, restore: 50, heal: 0, purify: false, needs: { pelt: 2, rope: 1 }, fee: 25, desc: '5 sips, +50 thirst per sip.' },
  { level: 3, name: 'Silver Alchemist Flask', cap: 8, restore: 60, heal: 0, purify: true, needs: { ore: 3, pelt: 2, crystal: 1 }, fee: 60, desc: '8 sips, +60 thirst, purifies river water automatically.' },
  { level: 4, name: 'Aether Crystal Vessel', cap: 12, restore: 75, heal: 10, purify: true, needs: { ore: 3, crystal: 3, honey: 2 }, fee: 120, desc: '12 sips, +75 thirst, +10 HP, pure water always.' },
];

const HUNGER_PER_HOUR = 2; // a full belly lasts about 2 days of the game (16 real minutes)
const THIRST_PER_HOUR = 3; // a drink (+40) lasts about 13 hours of the game
const FATIGUE_PER_HOUR = 2.2;
const LOW_VITAL_HP_PER_HOUR = 2.5;
const EMPTY_VITAL_HP_PER_HOUR = 7;
const FIRE_KINDS = ['campfire', 'torch', 'stove'];

function clamp(value) {
  return Math.min(100, Math.max(0, value));
}

function vitalDrainRate(value) {
  if (value <= 0) return EMPTY_VITAL_HP_PER_HOUR;
  if (value <= 15) return LOW_VITAL_HP_PER_HOUR;
  return 0;
}

export function bottleTierOf(player) {
  const lv = Math.max(1, Math.min(BOTTLE_TIERS.length, player?.bottleLevel || 1));
  return BOTTLE_TIERS[lv - 1];
}

export function bottleSize(player) {
  return bottleTierOf(player).cap;
}

export function nextBottleUpgrade(player) {
  const cur = bottleTierOf(player).level;
  return BOTTLE_TIERS.find((t) => t.level === cur + 1) || null;
}

export function canUpgradeBottle(game) {
  const next = nextBottleUpgrade(game?.player);
  if (!next) return false;
  if ((game.player.lexis || 0) < next.fee) return false;
  return Object.entries(next.needs || {}).every(([id, qty]) => countItem(game.player, id) >= qty);
}

export function upgradeBottle(game) {
  if (!canUpgradeBottle(game)) return false;
  const player = game.player;
  const next = nextBottleUpgrade(player);
  Object.entries(next.needs || {}).forEach(([id, qty]) => removeItem(player, id, qty));
  player.lexis -= next.fee;
  player.bottleLevel = next.level;
  player.bottle = next.cap;
  if (next.purify) player.bottleUntreated = false;
  cue(game, 'coin');
  notify(game, '💧 Upgraded to ' + next.name + ' (' + next.cap + ' drinks)!', '#9fd8ff');
  return true;
}

export function bottleUpgradeView(game) {
  const player = game?.player;
  const tier = bottleTierOf(player);
  const next = nextBottleUpgrade(player);
  const matsText = next
    ? Object.entries(next.needs || {})
        .map(([id, qty]) => `${ITEMS[id]?.name || id} ${countItem(player, id)}/${qty}`)
        .join(' · ')
    : '';
  return {
    tier,
    cap: tier.cap,
    next,
    ready: canUpgradeBottle(game),
    matsText,
  };
}

// Time passes: the bars go down. Severe hunger or thirst drains HP (stacking independently) and can reach 0 outside sleep.
export function updateSurvival(game, hours, allowLethal = true) {
  const player = game.player;
  const before = { hunger: player.hunger, thirst: player.thirst, fatigue: player.fatigue || 0 };
  player.hunger = clamp(player.hunger - HUNGER_PER_HOUR * hours);
  player.thirst = clamp(player.thirst - THIRST_PER_HOUR * hours);
  player.fatigue = clamp((player.fatigue || 0) + FATIGUE_PER_HOUR * hours);
  const hungerLow = player.hunger <= 15;
  const thirstLow = player.thirst <= 15;
  const drainRate = vitalDrainRate(player.hunger) + vitalDrainRate(player.thirst);
  if (drainRate > 0) {
    game.run.starveLoss = (game.run.starveLoss || 0) + drainRate * hours;
    const drop = Math.floor(game.run.starveLoss);
    if (drop >= 1) {
      game.run.starveLoss -= drop;
      const minHp = allowLethal ? 0 : 1;
      const prevHp = Math.round(player.health);
      player.health = Math.max(minHp, prevHp - drop);
      const lost = prevHp - player.health;
      if (lost > 0 && allowLethal) {
        floatText(game, player.x, player.y - 1.2, '-' + lost + ' HP', '#ff5a6e');
        const now = Date.now();
        if (!game.run.lastStarveWarnAt || now - game.run.lastStarveWarnAt >= 10000) {
          game.run.lastStarveWarnAt = now;
          const msg = hungerLow && thirstLow
            ? '⚠️ Starving and dehydrated (−' + lost + ' HP)! Eat and drink soon!'
            : hungerLow
              ? '🍖 Starving! You are losing HP (−' + lost + ' HP). Eat food soon!'
              : '💧 Dehydrated! You are losing HP (−' + lost + ' HP). Drink water soon!';
          notify(game, msg, '#ff6a78');
        }
      }
    }
  } else {
    game.run.starveLoss = 0;
  }
  if (before.hunger >= 25 && player.hunger < 25) notify(game, '🍖 You are hungry. Eat something (Menu → Inventory).', '#ffb070');
  if (before.hunger > 15 && player.hunger <= 15) notify(game, '⚠️ Critically hungry — you are losing HP!', '#ff6a78');
  if (before.thirst >= 25 && player.thirst < 25) notify(game, '💧 You are thirsty. Drink from your bottle.', '#9fd8ff');
  if (before.thirst > 15 && player.thirst <= 15) notify(game, '⚠️ Critically thirsty — you are losing HP!', '#ff6a78');
  if (before.fatigue < 85 && player.fatigue >= 85) notify(game, '🥱 Exhausted (-2 Speed)! Rest at camp, home, or an inn.', '#ffb070');
}

// ---------- Drinking ----------

export function drink(game) {
  const player = game.player;
  const tier = bottleTierOf(player);
  if (player.bottle <= 0) {
    notify(game, 'Your bottle is empty. Fill it at a river, a well or a fountain.');
    return false;
  }
  player.bottle -= 1;
  player.thirst = clamp(player.thirst + tier.restore);
  if (tier.heal > 0) heal(player, tier.heal);
  if (!tier.purify && player.bottleUntreated && Math.random() < 0.25) {
    player.health = Math.max(0, Math.round(player.health) - 5);
    notify(game, '🤢 Unboiled river water upset your stomach (−5 HP). Boil it over a fire or use a village well!', '#ff8a95');
  }
  if (player.bottle === 0 || tier.purify) player.bottleUntreated = false;
  const badge = tier.heal > 0 ? `+${tier.restore} 💧 +${tier.heal} HP` : `+${tier.restore} 💧`;
  floatText(game, player.x, player.y - 1, badge, '#9fd8ff');
  return true;
}

// Is there water to fill the bottle near the hero? (The tile in front, or a well, a fountain within reach.)
export function canRefill(game, front) {
  if (game.player.bottle >= bottleSize(game.player)) return false;
  if (tileAt(front.x, front.y) === TILE.WATER) return true;
  return propsAround(game.player.x, game.player.y, 2).some((prop) => prop.kind === 'well' || prop.kind === 'fountain' || prop.kind === 'waterPump');
}

export function refill(game) {
  const player = game.player;
  const tier = bottleTierOf(player);
  const cap = tier.cap;
  const nearCleanFixture = propsAround(player.x, player.y, 2).some((prop) => prop.kind === 'well' || prop.kind === 'fountain' || prop.kind === 'waterPump');
  player.bottle = cap;
  player.bottleUntreated = !nearCleanFixture && !tier.purify;
  player.thirst = clamp(player.thirst + 15); // a sip while filling it
  cue(game, 'coin');
  const msg = nearCleanFixture
    ? `💧 ${tier.name} filled with clean well water (${cap} drinks).`
    : tier.purify
      ? `💧 ${tier.name} filtered river water clean (${cap} drinks).`
      : `💧 ${tier.name} filled with river water (${cap} drinks — boil over fire to purify!).`;
  notify(game, msg, '#9fd8ff');
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
  if (['broth', 'herbStew', 'spicedStew', 'heartySoup', 'scholarTea', 'honeyPorridge', 'travelersFeast', 'ramen', 'curryRice', 'roastedFish', 'mushroomSoup', 'spicedBroth'].includes(itemId)) {
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
