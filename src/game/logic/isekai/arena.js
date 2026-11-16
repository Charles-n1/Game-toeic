import { houseAtDoor, villageOf } from '../../data/zones';
import { ITEMS } from '../../data/items';
import { ARENA_FEE, ARENA_ROUNDS, CHAMPION_GIFT } from '../../data/isekai';
import { makeDuel } from '../duels';
import { startFight } from '../fight';
import { addItem, earnLexis } from '../player';
import { frontTile } from '../input';
import { say, notify } from '../messages';
import { burst } from '../particles';
import { cue } from '../cues';

// The arenas of the capitals: a tournament of words, three duels in a row (ARENA_ROUNDS in data/isekai.js),
// each one harder. Each won duel pays its prize; a lost one ends the tournament. Once a day in each arena.
// game.isekai.arenaDays: { villageId: the day of the last tournament there }. game.isekai.champion: won once.

function becomeChampion(game) {
  burst(game, game.player.x, game.player.y - 1, '#ffd23f', 36);
  if (game.isekai.champion) return;
  game.isekai.champion = true;
  addItem(game.player, CHAMPION_GIFT);
  notify(game, '🏆 Champion of the Arena! A gift of the crowd: ' + ITEMS[CHAMPION_GIFT].name + '.', '#ffd23f');
}

// After a won duel: the next one, or the end of the tournament.
function nextRound(game, index) {
  const round = ARENA_ROUNDS[index];
  earnLexis(game, round.prize);
  cue(game, 'victory');
  const next = ARENA_ROUNDS[index + 1];
  if (!next) {
    becomeChampion(game);
    say(game, null, ['The whole arena chants your name! ' + round.name + ' bows to you. +' + round.prize + ' Lexis.']);
    return;
  }
  say(game, null, ['The crowd roars! ' + round.name + ' falls. +' + round.prize + ' Lexis.', 'Next: ' + next.name + '.'], [
    { label: 'Fight ' + next.name, icon: 'sword', run: () => fightRound(game, index + 1) },
    { label: 'Stop here (keep your prizes)', run: () => {} },
  ]);
}

function fightRound(game, index) {
  const round = ARENA_ROUNDS[index];
  const fighter = { id: null, name: round.name, look: round.look };
  const lose = () => say(game, null, [round.name + ' wins. The crowd boos... then cheers you anyway. Come back tomorrow.']);
  startFight(game, makeDuel(fighter, { title: 'Arena · ' + round.name, category: game.focus.current, tag: round.tag, health: round.health, speed: round.speed, onWin: () => nextRound(game, index), onLose: lose }));
}

function enter(game, villageId) {
  if (game.player.lexis < ARENA_FEE) {
    say(game, null, ['"No Lexis, no glory," says the man at the gate. The entry is ' + ARENA_FEE + ' Lexis.']);
    return;
  }
  game.player.lexis -= ARENA_FEE;
  game.isekai.arenaDays[villageId] = game.day;
  fightRound(game, 0);
}

function offerTournament(game, arena) {
  const village = villageOf(arena.village);
  if (game.isekai.arenaDays[arena.village] === game.day) {
    say(game, null, ['The Arena of ' + village.name + ' is closed until tomorrow. Workers rake the sand.']);
    return;
  }
  say(game, null, ['The Arena of ' + village.name + '. Three duels of words, each harder than the last. The crowd is already shouting.'], [
    { label: 'Enter the tournament (' + ARENA_FEE + ' Lexis)', icon: 'sword', run: () => enter(game, arena.village) },
    { label: 'Leave', run: () => {} },
  ]);
}

export function actionsOfArena(game) {
  const front = frontTile(game.player);
  const house = houseAtDoor(front.x, front.y);
  const arena = house && house.role === 'arena' ? house : null;
  return [{ when: () => arena !== null, icon: 'sword', run: () => offerTournament(game, arena) }];
}
