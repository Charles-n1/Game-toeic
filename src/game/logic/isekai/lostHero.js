import { LOST_HERO_PAGES, GRAVE_WORDS, KING_NAME_WEAKENS, KING_TRUTH_ENDING } from '../../data/isekai';
import { gainXp } from '../player';
import { say, notify } from '../messages';
import { burst, floatText } from '../particles';
import { cue } from '../cues';
import { structureNear } from './common';
import { onLostHeroPageRead } from '../soul';

// The Lost Hero: the first one the goddess summoned, long ago. He beat the Demon King of his time... then lost
// the one he loved, and became the next Demon King: Solecis. The graves of his friends (world/wildPlaces.js)
// hide the pages of his diary, read in order wherever they are found. With all of them, the hero knows his
// true name: Louis. In the last fight, the name makes him hesitate, and the ending tells more.
// game.isekai: pagesFound, gravesRead { id: true }, knowsKingName.

const GRAVE_RANGE = 2.2;
const PAGE_XP = 40;

function readGrave(game, grave) {
  const state = game.isekai;
  const words = GRAVE_WORDS[grave.grave % GRAVE_WORDS.length];
  if (state.gravesRead[grave.id] || state.pagesFound >= LOST_HERO_PAGES.length) {
    say(game, null, [words, 'Fresh flowers, and nothing more.']);
    return;
  }
  state.gravesRead[grave.id] = true;
  const pageIndex = state.pagesFound;
  const page = LOST_HERO_PAGES[pageIndex];
  state.pagesFound += 1;
  const lines = [words, 'Under the stone, wrapped in leather: a page of a diary, written in the language of your old world.', ...page];
  if (state.pagesFound === LOST_HERO_PAGES.length) {
    state.knowsKingName = true;
    lines.push('You close the diary. You know the true name of the Demon King now: Louis.');
  }
  say(game, null, lines);
  onLostHeroPageRead(game, pageIndex);
  cue(game, 'coin');
  burst(game, grave.x + 0.5, grave.y, '#cfe3ff', 16);
  floatText(game, grave.x + 0.5, grave.y - 1, 'Diary page ' + state.pagesFound + '/' + LOST_HERO_PAGES.length, '#cfe3ff');
  gainXp(game, PAGE_XP); // after the page: a level up tells its news once the page is read
}

export function actionsOfLostHero(game) {
  const grave = structureNear(game, 'heroGrave', GRAVE_RANGE);
  return [{ when: () => grave !== null, icon: 'book', run: () => readGrave(game, grave) }];
}

// The pages read so far (the menu shows them again): [[line, line...], ...].
export function pagesRead(game) {
  return LOST_HERO_PAGES.slice(0, game.isekai.pagesFound);
}

export const PAGES_TOTAL = LOST_HERO_PAGES.length;

// The fight against the Demon King starts: if the hero knows his name, he hesitates (less health).
export function callTheKingByName(game, monster) {
  if (monster.species !== 'king' || !game.isekai.knowsKingName) return;
  monster.health = Math.round(monster.health * KING_NAME_WEAKENS);
  notify(game, '"Louis." The Demon King freezes for a heartbeat. His guard breaks (−' + Math.round((1 - KING_NAME_WEAKENS) * 100) + '% HP).', '#cfe3ff');
}

// The last lines of the story: the ending of the goal, with the truth about the king when the hero knows it.
export function endingLines(game, ending) {
  if (game.goal !== 'hero' || !game.isekai.knowsKingName) return ending;
  return [...ending.slice(0, 3), ...KING_TRUTH_ENDING, ...ending.slice(3)];
}
