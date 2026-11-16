// Emotes: a small bubble over someone's head for a moment: '!', '?', 'heart', 'note', 'sparkle', 'sweat', 'dots'.
// game.run.emotes: [{ who, icon, until }]
// who: 'hero', the id of a person of the story, or anybody standing on the map (a villager: { x, y, look }).

const EMOTE_TIME = 1600; // milliseconds

export function emote(game, who, icon) {
  game.run.emotes = game.run.emotes.filter((item) => item.who !== who);
  game.run.emotes.push({ who: who, icon: icon, until: Date.now() + EMOTE_TIME });
}

// The emotes still shown (the old ones are forgotten).
export function activeEmotes(game) {
  game.run.emotes = game.run.emotes.filter((item) => item.until > Date.now());
  return game.run.emotes;
}

// Where the one who emotes stands, and how they look (to know how high their head is): { place, look }.
// place is null when they are gone (a person who is not on the map).
export function emoteOwner(game, item, lookOfPerson) {
  if (item.who === 'hero') return { place: game.player, look: null };
  if (typeof item.who === 'object') return { place: item.who, look: item.who.look };
  return { place: game.run.people[item.who] || null, look: lookOfPerson(item.who) };
}
