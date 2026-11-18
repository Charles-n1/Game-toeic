import { npcOf } from '../../data/npcs';
import { SPRING_HOURS, SPRING_FRIENDSHIP } from '../../data/isekai';
import { passHours } from '../days';
import { healFully } from '../player';
import { cureCold } from '../weather';
import { addFriendship } from '../village';
import { say } from '../messages';
import { cue } from '../cues';
import { emote } from '../emotes';
import { structureNear } from './common';
import { cleanseAndWash } from '../realism/bodyHealth';

// The hot springs of the mountains and the forests (world/wildPlaces.js): a bath of two hours heals everything,
// cures a cold, and the friends who travel with the hero bathe too (a bit more friendship).

const SPRING_RANGE = 3.6;

function bathe(game) {
  passHours(game, SPRING_HOURS);
  healFully(game.player, game);
  cureCold(game);
  if (game?.realism) cleanseAndWash(game, 'innBath');
  cue(game, 'coin');
  emote(game, 'hero', 'sparkle');
  const friends = game.player.party.map(npcOf);
  for (const friend of friends) {
    addFriendship(game, friend.id, SPRING_FRIENDSHIP);
    emote(game, friend.id, 'heart');
  }
  const lines = ['The water is hot, almost too hot. The steam hides the trees, the sky, the war.', 'Two hours later, you feel new. (HP and mana are full.)'];
  if (friends.length > 0) lines.push(friends.map((friend) => friend.name).join(' and ') + ' bathe with you. For once, nobody talks about the Demon King.');
  say(game, null, lines);
}

export function actionsOfSprings(game) {
  const spring = structureNear(game, 'hotSpring', SPRING_RANGE);
  return [{ when: () => spring !== null, icon: 'bath', run: () => bathe(game) }];
}
