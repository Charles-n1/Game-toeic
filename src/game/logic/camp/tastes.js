import { ITEMS } from '../../data/items';
import { npcOf } from '../../data/npcs';

// Character food tastes for all 14 sprite-sheet characters + Aria, Nyx (and Garrick).
export const TASTES = {
  luna: {
    favorite: ['scholarTea', 'honeyPorridge'],
    likes: ['bread', 'heartySoup', 'herbStew'],
    dislikes: ['rawMeat', 'driedMeat'],
  },
  selene: {
    favorite: ['scholarTea', 'herbStew'],
    likes: ['broth', 'heartySoup', 'honeyPorridge'],
    dislikes: ['rawMeat', 'hunterSkewer'],
  },
  elara: {
    favorite: ['herbStew', 'scholarTea'],
    likes: ['carrot', 'heartySoup', 'broth', 'honeyPorridge'],
    dislikes: ['rawMeat', 'driedMeat'],
  },
  darius: {
    favorite: ['spicedStew', 'roastMeat'],
    likes: ['travelersFeast', 'hunterSkewer', 'heartySoup', 'driedMeat'],
    dislikes: ['scholarTea', 'carrot'],
  },
  dorian: {
    favorite: ['hunterSkewer', 'driedMeat'],
    likes: ['roastMeat', 'spicedStew', 'bread', 'travelersFeast'],
    dislikes: ['broth', 'scholarTea'],
  },
  arthur: {
    favorite: ['heartySoup', 'travelersFeast'],
    likes: ['bread', 'roastMeat', 'spicedStew', 'hunterSkewer'],
    dislikes: ['rawMeat', 'herbStew'],
  },
  lyra: {
    favorite: ['travelersFeast', 'honeyPorridge'],
    likes: ['heartySoup', 'roastMeat', 'spicedStew'],
    dislikes: ['driedMeat', 'rawMeat'],
  },
  hinata: {
    favorite: ['scholarTea', 'hunterSkewer'],
    likes: ['broth', 'herbStew', 'honeyPorridge'],
    dislikes: ['spicedStew', 'rawMeat'],
  },
  kaelthra: {
    favorite: ['spicedStew', 'hunterSkewer'],
    likes: ['roastMeat', 'travelersFeast', 'driedMeat'],
    dislikes: ['honeyPorridge', 'broth'],
  },
  lucien: {
    favorite: ['honeyPorridge', 'scholarTea'],
    likes: ['travelersFeast', 'bread', 'spicedStew'],
    dislikes: ['broth', 'rawMeat'],
  },
  sylvia: {
    favorite: ['herbStew', 'honeyPorridge'],
    likes: ['carrot', 'scholarTea', 'heartySoup', 'bread'],
    dislikes: ['roastMeat', 'driedMeat', 'hunterSkewer'],
  },
  vespera: {
    favorite: ['broth', 'spicedStew'],
    likes: ['scholarTea', 'herbStew', 'travelersFeast'],
    dislikes: ['honeyPorridge', 'carrot'],
  },
  corvin: {
    favorite: ['broth', 'scholarTea'],
    likes: ['herbStew', 'driedMeat', 'heartySoup'],
    dislikes: ['honeyPorridge', 'roastMeat'],
  },
  kael: {
    favorite: ['roastMeat', 'hunterSkewer'],
    likes: ['driedMeat', 'spicedStew', 'travelersFeast', 'bread'],
    dislikes: ['scholarTea', 'honeyPorridge'],
  },
  aria: {
    favorite: ['heartySoup', 'honeyPorridge'],
    likes: ['herbStew', 'scholarTea', 'broth', 'bread'],
    dislikes: ['rawMeat', 'driedMeat'],
  },
  nyx: {
    favorite: ['honeyPorridge', 'travelersFeast'],
    likes: ['bread', 'spicedStew', 'roastMeat'],
    dislikes: ['broth', 'rawMeat'],
  },
  garrick: {
    favorite: ['heartySoup', 'roastMeat'],
    likes: ['bread', 'spicedStew', 'driedMeat'],
    dislikes: ['scholarTea', 'rawMeat'],
  },
};

const TIER_EFFECTS = {
  favorite: { fatigueDelta: -65, friendshipDelta: 6, emote: 'heart', expression: 'love' },
  like: { fatigueDelta: -45, friendshipDelta: 4, emote: 'note', expression: 'joy' },
  neutral: { fatigueDelta: -40, friendshipDelta: 3, emote: 'sparkle', expression: 'joy' },
  dislike: { fatigueDelta: -25, friendshipDelta: 2, emote: 'sweat', expression: 'disgust' },
};

const PERSONAL_NOTES = {
  favorite: {
    luna: 'It tastes just like late-night study breaks at the Academy!',
    selene: 'Warm, balanced, and deeply restorative. Well prepared.',
    elara: 'Oh! The aroma alone feels like a blessing.',
    darius: 'Now THAT puts steel back in your arms!',
    dorian: 'Better than anything I ever stole from a tavern.',
    arthur: 'Makes me feel ready to guard the dawn gate all week!',
    lyra: 'A meal fit for a knightly march. Thank you.',
    hinata: 'Quiet perfection. My spirit feels sharp again.',
    kaelthra: 'Ha! Fire and flavor — just how I like it!',
    lucien: 'Even my puppet is clapping under the cloak!',
    sylvia: 'The forest itself seems to smile at this dish.',
    vespera: 'So warm... for a moment I forgot the chill of the crypt.',
    corvin: 'Remarkably invigorating. A proper tonic for the road.',
    kael: 'Sombre is eyeing my plate already. Best camp meal yet.',
    aria: 'I wish everyone in Eldermoor could taste something this comforting.',
    nyx: 'Wait... humans can make food THIS good?!',
  },
  dislike: {
    sylvia: 'I walk gently with the creatures of the woods... this is hard to swallow.',
    kaelthra: 'Too mild for my taste, though I appreciate the fire.',
    vespera: 'Far too sweet for someone used to winter ashes...',
    dorian: 'A bit plain for my palate, partner, but food is food.',
  },
};

function opinionTier(taste, dishId) {
  if (!taste) return 'neutral';
  if (taste.favorite.includes(dishId)) return 'favorite';
  if (taste.likes.includes(dishId)) return 'like';
  if (taste.dislikes.includes(dishId)) return 'dislike';
  return 'neutral';
}

function reactionText(npcId, dishName, tier) {
  const custom = PERSONAL_NOTES[tier] && PERSONAL_NOTES[tier][npcId];
  if (custom) return custom;
  if (tier === 'favorite') return 'My absolute favorite! Nothing beats ' + dishName + ' by the campfire!';
  if (tier === 'like') return 'Mmm, ' + dishName + ' hits the spot. Thank you!';
  if (tier === 'dislike') return 'Not really to my taste, honestly... still, thanks for sharing ' + dishName + '.';
  return 'A warm portion of ' + dishName + ' helps us keep going.';
}

// Evaluates how a character feels about a dish: { tier, fatigueDelta, friendshipDelta, emote, expression, reaction }.
export function characterDishOpinion(npcId, dishId) {
  const taste = TASTES[npcId] || null;
  const tier = opinionTier(taste, dishId);
  const effect = TIER_EFFECTS[tier];
  const dishName = ITEMS[dishId] ? ITEMS[dishId].name : dishId;
  const npc = npcOf(npcId);
  const reaction = reactionText(npc ? npc.id : npcId, dishName, tier);
  return { tier: tier, ...effect, reaction: reaction };
}
