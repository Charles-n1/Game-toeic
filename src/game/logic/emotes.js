// Emotes: a small bubble over someone's head for a moment: '!', '?', 'heart', 'note', 'sparkle', 'sweat', 'dots'.
// game.run.emotes: [{ who: 'hero' or the id of a person, icon, until }]

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
