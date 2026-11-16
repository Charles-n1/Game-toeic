import { makeDuel } from '../duels';
import { startFight } from '../fight';
import { addFriendship } from '../village';
import { earnLexis } from '../player';
import { say } from '../messages';
import { emote } from '../emotes';

// The classmates of the hero (data/npcs.js, `classmate`): Lea, summoned by the Queen as "the True Hero", and Hugo,
// born again in this world as a baby. Once, the hero can tell them "I know you". Lea, the rival, also wants a duel
// of words each day: who is the better summoned one?
// game.isekai.recognized: { npcId: true }. game.isekai.rivalDay: the day of the last duel with Lea.

const RECOGNIZE_FRIENDSHIP = 15;
const DUEL = { goodAnswers: 4, speed: 14, friendship: 6, lexis: 60 };

function recognize(game, npc) {
  game.isekai.recognized[npc.id] = true;
  addFriendship(game, npc.id, RECOGNIZE_FRIENDSHIP);
  emote(game, npc.id, '!');
  say(game, npc.id, npc.recognize);
}

// "Wait... I know you!": once, with each classmate.
export function recognizeChoice(game, npc) {
  if (!npc.classmate || game.isekai.recognized[npc.id]) return null;
  return { label: 'Wait... I know you!', icon: 'heart', run: () => recognize(game, npc) };
}

function rivalDuel(game, npc) {
  game.isekai.rivalDay = game.day;
  function win() {
    addFriendship(game, npc.id, DUEL.friendship);
    earnLexis(game, DUEL.lexis);
    emote(game, npc.id, 'sweat');
    say(game, npc.id, ['...You won. Do not look so happy about it. Tomorrow, again.', 'The Queen pays the winner of the heroes: ' + DUEL.lexis + ' Lexis. Do not ask.']);
  }
  function lose() {
    addFriendship(game, npc.id, 2);
    emote(game, npc.id, 'note');
    say(game, npc.id, ['Ha! The True Hero wins again. Study, window-seat. Tomorrow.']);
  }
  const duel = { title: 'Duel of the Summoned', category: game.focus.current, tag: 'hard', health: DUEL.goodAnswers, speed: DUEL.speed, onWin: win, onLose: lose };
  startFight(game, makeDuel(npc, duel));
}

// The daily duel with the summoned classmate (after the hero told her "I know you").
export function rivalChoice(game, npc) {
  if (npc.classmate !== 'summoned' || !game.isekai.recognized[npc.id] || game.isekai.rivalDay === game.day) return null;
  return { label: 'Duel of the Summoned (' + DUEL.goodAnswers + ' sentences)', icon: 'sword', run: () => rivalDuel(game, npc) };
}
