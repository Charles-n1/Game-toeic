import { startFight } from './fight';
import { skillPercent } from './learning';
import { addFriendship, addHappiness } from './village';
import { earnLexis } from './player';
import { passHours } from './days';
import { say } from './messages';

// A duel = a fight of words against a person. Nobody is hurt: the player wins by giving `health` good answers,
// and loses after 3 mistakes. It is used to negotiate a price, to work, and to play.

function makeDuel(npc, options) {
  return {
    duel: true,
    name: npc.name,
    look: npc.look,
    npcId: npc.id,
    tier: 'small',
    maxHealth: options.health,
    attack: 0,
    magicAttack: 0,
    resistance: 0,
    magicResistance: 0,
    xp: 0,
    ...options,
  };
}

// Negotiating with a seller: won = -30% on everything until tonight. Lost = +10%: they are upset.
// A seller of an unhappy village is harder to convince.
export function negotiate(game, npc) {
  function win() {
    game.deal = { day: game.day, factor: 0.7 };
    say(game, npc.id, ['...Fine. You talk better than you look. 30% off, today only.']);
  }
  function lose() {
    game.deal = { day: game.day, factor: 1.1 };
    say(game, npc.id, ['Ha! With that grammar? Prices just went up. Come back tomorrow.']);
  }
  const tier = game.happiness < 40 ? 'big' : 'small';
  startFight(game, makeDuel(npc, { title: 'Negotiation', category: 'vocabulary', tier: tier, health: 4, speed: 12, onWin: win, onLose: lose }));
}

// Copying books at the library: paid for each good answer, won or lost. The texts are of the player's weakest skill.
export function workAsScribe(game, npc) {
  function pay(fight) {
    const lexis = fight.correct * 4;
    earnLexis(game, lexis);
    passHours(game, 1);
    say(game, npc.id, [fight.correct + ' clean line(s). Here: ' + lexis + ' Lexis. The ink thanks you.']);
  }
  startFight(game, makeDuel(npc, { title: 'Scribe work', category: game.focus.current, health: 5, speed: 9, onWin: pay, onLose: pay }));
}

// Word Sprint, the game of the kids: very fast questions. Playing makes friends, winning makes the village smile.
export function playWordSprint(game, npc) {
  function win() {
    addFriendship(game, npc.id, 5);
    addHappiness(game, 2);
    say(game, npc.id, ['Nooo! You won! Again, again!']);
  }
  function lose() {
    addFriendship(game, npc.id, 2);
    say(game, npc.id, ['I win! I told you, I ALWAYS win!']);
  }
  startFight(game, makeDuel(npc, { title: 'Word Sprint', category: weakestOf(game, ['vocabulary', 'wordForms', 'pronouns']), health: 3, speed: 18, onWin: win, onLose: lose }));
}

function weakestOf(game, categoryIds) {
  return categoryIds.reduce((weakest, id) => (skillPercent(game, id) < skillPercent(game, weakest) ? id : weakest));
}
