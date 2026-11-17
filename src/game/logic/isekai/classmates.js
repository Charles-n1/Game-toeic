import { makeDuel } from '../duels';
import { startFight } from '../fight';
import { addFriendship } from '../village';
import { earnLexis } from '../player';
import { say, notify } from '../messages';
import { emote } from '../emotes';

// The classmates of the hero: Lea ("the True Hero" with Holy Sword) and Hugo (reborn innkeeper).
// Lea progresses through guild ranks and dungeons in parallel and reacts to the Demon King's defeat.

const RECOGNIZE_FRIENDSHIP = 15;
const DUEL = { goodAnswers: 4, speed: 14, friendship: 6, lexis: 60 };
const LEA_RANKS = ['F', 'E', 'D', 'C', 'B', 'A', 'S'];

export function ensureRivals(game) {
  if (!game.isekai) game.isekai = {};
  if (!game.isekai.rivals) game.isekai.rivals = { leaRankIdx: 0, leaClears: 0, postKingLea: false, postKingHugo: false };
  return game.isekai.rivals;
}

export function advanceClassmatesDay(game) {
  if (!game.npcs?.lea?.alive || game.player?.party?.includes('lea')) return;
  const r = ensureRivals(game);
  if (game.day % 4 === 0 && r.leaRankIdx < LEA_RANKS.length - 1 && !game.bosses?.king) {
    r.leaRankIdx += 1;
    r.leaClears += 1;
    notify(game, '⚔️ Word from Lexhaven: summoned rival Lea reached Guild Rank ' + LEA_RANKS[r.leaRankIdx] + '!', '#ffd23f');
  }
}

function recognize(game, npc) {
  game.isekai.recognized[npc.id] = true;
  addFriendship(game, npc.id, RECOGNIZE_FRIENDSHIP);
  emote(game, npc.id, '!');
  say(game, npc.id, npc.recognize);
}

export function recognizeChoice(game, npc) {
  if (!npc.classmate || game.isekai.recognized[npc.id]) return null;
  return { label: 'Wait... I know you!', icon: 'heart', run: () => recognize(game, npc) };
}

function rivalDuel(game, npc) {
  const r = ensureRivals(game);
  game.isekai.rivalDay = game.day;
  const tag = r.leaRankIdx >= 4 ? 'extreme' : 'hard';
  const prize = DUEL.lexis + r.leaRankIdx * 18;
  function win() {
    addFriendship(game, npc.id, DUEL.friendship);
    earnLexis(game, prize);
    emote(game, npc.id, 'sweat');
    say(game, npc.id, ['...You beat my Holy Sword stance again. Do not grin like that! Tomorrow, rematch.', 'The Queen pays the winner of the heroes: ' + prize + ' Lexis.']);
  }
  function lose() {
    addFriendship(game, npc.id, 2);
    emote(game, npc.id, 'note');
    say(game, npc.id, ['Ha! Rank ' + LEA_RANKS[r.leaRankIdx] + ' Lea wins again. Study harder, window-seat.']);
  }
  const duel = { title: 'Duel of the Summoned (Lea · ' + LEA_RANKS[r.leaRankIdx] + '-Rank)', category: game.focus.current, tag, health: DUEL.goodAnswers + (r.leaRankIdx >= 3 ? 1 : 0), speed: DUEL.speed + Math.floor(r.leaRankIdx / 2), onWin: win, onLose: lose };
  startFight(game, makeDuel(npc, duel));
}

export function rivalChoice(game, npc) {
  if (!npc.classmate) return null;
  const r = ensureRivals(game);
  if (game.bosses?.king && game.isekai.recognized[npc.id]) {
    if (npc.id === 'lea' && !r.postKingLea) {
      return {
        label: 'Talk about Solecis & going home',
        icon: 'star',
        run: () => {
          r.postKingLea = true;
          addFriendship(game, 'lea', 15);
          say(game, 'lea', [
            'You actually did it... you brought down the Castle of Silence.',
            'I spent months swinging a "cheat sword", and you won with steady words and friends. Respect, classmate.',
            'If you wake the Summon Gate to go back to our exam room... or stay here... tell me first. Either way, we survived an isekai together.',
          ]);
        },
      };
    }
    if (npc.id === 'hugo' && !r.postKingHugo) {
      return {
        label: 'Toast to peace across Lexia',
        icon: 'heart',
        run: () => {
          r.postKingHugo = true;
          addFriendship(game, 'hugo', 15);
          earnLexis(game, 50);
          say(game, 'hugo', [
            'No more monster armies marching past the river! My inn stayed standing thanks to you.',
            'Have 50 Lexis and all the curry you can eat, classmate. Tell Lea I am staying right here for good.',
          ]);
        },
      };
    }
  }
  if (npc.classmate !== 'summoned' || !game.isekai.recognized[npc.id] || game.isekai.rivalDay === game.day) return null;
  return { label: 'Duel of the Summoned (vs ' + LEA_RANKS[r.leaRankIdx] + '-Rank Lea)', icon: 'sword', run: () => rivalDuel(game, npc) };
}
