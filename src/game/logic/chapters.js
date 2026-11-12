import { CHAPTERS, ENDINGS, SCENES } from '../data/story';
import { earnLexis } from './player';
import { isNight } from './clock';
import { say } from './messages';

// The story moving forward: the chapters of the chosen goal, and the scenes that happen once.

// The chapter the player is in (null = the story of this goal is finished).
export function currentChapter(game) {
  return CHAPTERS[game.goal][game.chapter] || null;
}

function tellEnding(game) {
  game.ended = true;
  say(game, null, ENDINGS[game.goal]);
  say(game, null, ['THE END... of this story. The world stays open: live in it as long as you like.']);
}

function finishChapter(game, chapter) {
  game.chapter += 1;
  earnLexis(game, chapter.reward);
  const reward = chapter.reward > 0 ? ' (+' + chapter.reward + ' Lexis)' : '';
  const next = currentChapter(game);
  if (next) say(game, null, ['✔ ' + chapter.title + reward, 'New chapter: ' + next.title + '\n' + next.text]);
  else tellEnding(game);
}

// Plays a scene only the first time.
function playOnce(game, sceneId) {
  if (game.flags[sceneId]) return;
  game.flags[sceneId] = true;
  say(game, SCENES[sceneId].speaker, SCENES[sceneId].lines);
}

function isNear(game, place, range) {
  return Math.hypot(place.x - game.player.x, place.y - game.player.y) < range;
}

function playScenes(game) {
  const twoDaysBeforeFirstRaid = game.raid.count === 0 && game.day >= game.raid.nextDay - 2;
  if (twoDaysBeforeFirstRaid && game.npcs.orin.alive) playOnce(game, 'omen');
  if (isNight(game) && game.npcs.nyx.alive && isNear(game, game.run.people.nyx, 3)) playOnce(game, 'nyx');
  if (game.visited.castle) playOnce(game, 'kingGate');
}

// Called about once per second.
export function updateStory(game) {
  const chapter = currentChapter(game);
  if (chapter && chapter.done(game)) finishChapter(game, chapter);
  playScenes(game);
}
