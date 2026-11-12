import { npcOf } from '../data/npcs';
import { SPAWN } from '../data/zones';
import { sleepUntilMorning } from './days';
import { killNpc } from './village';
import { forgetGame } from './save';
import { say } from './messages';

// The player lost a fight.
// The first times, Aria carries them home (her "blessings"). When none is left, or if Aria is dead:
// the player dies, and everything restarts from the beginning.

const FRIEND_DEATH_CHANCE = 0.2; // each friend of the party may die protecting the player
const LEXIS_LOST = 0.2; // the part of the Lexis that falls from the pockets

function loseFriends(game) {
  for (const id of [...game.player.party]) {
    if (Math.random() < FRIEND_DEATH_CHANCE) {
      const name = npcOf(id).name;
      killNpc(game, id, [name + ' stood over your body, alone against them.', name + ' did not come back.']);
    }
  }
}

function carryHome(game) {
  const player = game.player;
  player.blessings -= 1;
  player.lexis -= Math.floor(player.lexis * LEXIS_LOST);
  player.soldiers = 0; // the obsidian soldiers broke
  player.x = SPAWN.x;
  player.y = SPAWN.y;
  player.dir = 'down';
  game.run.monsters = game.run.monsters.filter((monster) => monster.key || monster.raid); // the wild ones are far now
  sleepUntilMorning(game);
  const left = player.blessings === 0 ? 'I have no strength left to carry you again. Next time... there is no next time.' : 'I can still carry you ' + player.blessings + ' time(s). Not more.';
  say(game, 'aria', ['You fell. I carried you home. You are heavy, you know?', left]);
}

export function knockOut(game) {
  const isSaved = game.player.blessings > 0 && game.npcs.aria.alive;
  loseFriends(game);
  if (isSaved) {
    carryHome(game);
  } else {
    forgetGame(); // the save is erased: the next game starts from zero
    game.run.screen = 'over';
  }
}
