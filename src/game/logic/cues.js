// The sounds the rules ask for. The rules never play a sound themselves: they leave a "cue" here,
// and the screen plays it at the next frame (see ui/GameWorld.jsx and audio/effects.js).
// name: 'coin' | 'levelUp' | 'step' | ...

const MAX_CUES = 8; // never more waiting (the tests run the rules without any screen)

export function cue(game, name) {
  if (game.run.cues.length < MAX_CUES) game.run.cues.push(name);
}

// The cues waiting, given once.
export function takeCues(game) {
  const cues = game.run.cues;
  game.run.cues = [];
  return cues;
}
