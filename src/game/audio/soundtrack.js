import { zoneAt } from '../data/zones';
import { isNight } from '../logic/clock';

// Which song fits what happens on screen (see songs.js).
export function songFor(game) {
  const fight = game.run.fight;
  if (game.run.screen === 'over') return 'sad';
  if (fight && fight.opponent.boss) return 'boss';
  if (fight && !fight.opponent.duel) return 'fight';
  if (game.raid.active) return 'raid';
  if (game.ended) return 'ending';
  if (isNight(game)) return 'night';
  return zoneAt(game.player.x, game.player.y).kind === 'village' ? 'village' : 'exploration';
}
