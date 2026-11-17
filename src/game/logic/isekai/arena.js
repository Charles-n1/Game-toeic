import { villageOf } from '../../data/zones';
import { ITEMS } from '../../data/items';
import { ARENA_FEE, ARENA_ROUNDS, CHAMPION_GIFT } from '../../data/isekai';
import { makeDuel } from '../duels';
import { startFight } from '../fight';
import { addItem, earnLexis } from '../player';
import { awardGuildPoints, ensureGuild, rankIndex } from '../guild/ranks';
import { say, notify } from '../messages';
import { burst } from '../particles';
import { cue } from '../cues';

// The arenas of the capitals: ranked brackets (Amateur -> Veteran -> Grandmaster) and live arena hall bouts.

function becomeChampion(game, rankBonus = 1) {
  burst(game, game.player.x, game.player.y - 1, '#ffd23f', 36);
  awardGuildPoints(game, 25 * rankBonus, 'Arena Victory');
  if (game.isekai.champion) return;
  game.isekai.champion = true;
  addItem(game.player, CHAMPION_GIFT);
  notify(game, '🏆 Champion of the Arena! A gift of the crowd: ' + ITEMS[CHAMPION_GIFT].name + '.', '#ffd23f');
}

function nextRound(game, index, bracketMult) {
  const round = ARENA_ROUNDS[index];
  const prize = Math.round(round.prize * bracketMult);
  earnLexis(game, prize);
  cue(game, 'victory');
  const next = ARENA_ROUNDS[index + 1];
  if (!next) {
    becomeChampion(game, bracketMult);
    say(game, null, ['The whole arena chants your name! ' + round.name + ' bows to you. +' + prize + ' Lexis.']);
    return;
  }
  say(game, null, ['The crowd roars! ' + round.name + ' falls. +' + prize + ' Lexis.', 'Next: ' + next.name + '.'], [
    { label: 'Fight ' + next.name, icon: 'sword', run: () => fightRound(game, index + 1, bracketMult) },
    { label: 'Stop here (keep your prizes)', run: () => {} },
  ]);
}

function fightRound(game, index, bracketMult = 1) {
  const round = ARENA_ROUNDS[index];
  const tag = bracketMult >= 1.8 ? 'extreme' : bracketMult >= 1.4 ? 'hard' : round.tag;
  const fighter = { id: null, name: round.name, look: round.look };
  const lose = () => say(game, null, [round.name + ' wins. The crowd boos... then cheers you anyway. Come back tomorrow.']);
  startFight(game, makeDuel(fighter, { title: 'Arena · ' + round.name, category: game.focus.current, tag, health: round.health, speed: round.speed + (bracketMult >= 1.4 ? 2 : 0), onWin: () => nextRound(game, index, bracketMult), onLose: lose }));
}

function enter(game, villageId, bracketMult = 1) {
  const fee = Math.round(ARENA_FEE * bracketMult);
  if (game.player.lexis < fee) {
    say(game, null, ['"No Lexis, no glory," says the arena master. Entry is ' + fee + ' Lexis.']);
    return;
  }
  game.player.lexis -= fee;
  game.isekai.arenaDays[villageId] = game.day;
  fightRound(game, 0, bracketMult);
}

export function offerTournament(game, villageId) {
  const village = villageOf(villageId);
  if (game.isekai.arenaDays[villageId] === game.day) {
    say(game, null, ['The Arena of ' + (village?.name || 'the Capital') + ' is closed until tomorrow. Workers rake the sand.']);
    return;
  }
  const rIdx = rankIndex(ensureGuild(game).rank);
  const choices = [{ label: 'Novice Bracket (' + ARENA_FEE + ' Lexis · Standard prizes)', icon: 'sword', run: () => enter(game, villageId, 1) }];
  if (rIdx >= 2) {
    choices.push({ label: 'Veteran Bracket (' + Math.round(ARENA_FEE * 1.4) + ' Lexis · 1.4× prizes)', icon: 'sword', run: () => enter(game, villageId, 1.4) });
  }
  if (rIdx >= 4) {
    choices.push({ label: 'Grandmaster S/B Bracket (' + Math.round(ARENA_FEE * 1.8) + ' Lexis · 1.8× prizes)', icon: 'crown', run: () => enter(game, villageId, 1.8) });
  }
  choices.push({ label: 'Leave', run: () => {} });
  say(game, null, ['The Arena of ' + (village?.name || 'the Capital') + '. Step onto the pit sand for glory, Lexis & Guild Points!'], choices);
}

export function actionsOfArena(game) {
  const visit = game.run.visitHouse;
  if (visit?.specialRole === 'arena' && visit.pit) {
    const { x, y, w, h } = visit.pit;
    const inPit = game.player.x >= x && game.player.x <= x + w && game.player.y >= y && game.player.y <= y + h;
    return [{ when: () => inPit, icon: 'sword', run: () => offerTournament(game, visit.house.village) }];
  }
  return [];
}
