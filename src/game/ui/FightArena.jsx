import useCanvas from './useCanvas';
import { HERO_LOOK, npcOf } from '../data/npcs';
import { zoneAt } from '../data/zones';
import { drawPerson, drawSoldier, drawCat } from '../draw/people';
import { drawMonster } from '../draw/monsters';
import { drawParticles } from '../draw/scene';
import { rect, ellipse } from '../draw/shapes';
import { updateParticles } from '../logic/particles';
import { darkness } from '../logic/clock';

export const ARENA_UNIT = 24; // the particles of the arena are placed in units of 24 pixels
const LUNGE_TIME = 350; // milliseconds of a jump forward
const SKY = { forest: '#2f6b4a', mountain: '#8a7f8f', demon: '#3a1f33', dungeon: '#2c2740', coast: '#5fb3e6' };

// How far a fighter has jumped forward, `age` milliseconds after the start of their strike.
function lunge(age) {
  if (age < 0 || age > LUNGE_TIME) return 0;
  return Math.sin((age / LUNGE_TIME) * Math.PI) * 46;
}

// Who is jumping right now: { player, monster } in pixels. The slower one strikes after the faster one.
function lungesOf(last) {
  if (!last) return { player: 0, monster: 0 };
  const age = Date.now() - last.at;
  const playerWaits = last.taken > 0 ? LUNGE_TIME : 0;
  return {
    player: last.damage > 0 ? lunge(age - playerWaits) : 0,
    monster: last.taken > 0 ? lunge(age) : 0,
  };
}

function drawBackground(ctx, game, width, height) {
  const biome = zoneAt(game.player.x, game.player.y).biome;
  const sky = ctx.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, SKY[biome] || '#6fc3f0');
  sky.addColorStop(1, '#16132b');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);
  rect(ctx, 0, 0, width, height, 'rgba(8, 8, 40, ' + 0.5 * darkness(game) + ')');
  ellipse(ctx, width / 2, height + 26, width * 0.7, 60, 'rgba(0, 0, 0, 0.35)'); // the ground
}

// The friends stand behind the hero.
function drawFriends(ctx, game, x, y, time) {
  game.run.followers.forEach((follower, i) => {
    const friendX = x - 30 - i * 22;
    if (follower.kind === 'soldier') drawSoldier(ctx, friendX, y, time * 2 + i);
    else if (follower.kind === 'pet') drawCat(ctx, friendX, y, time * 2);
    else drawPerson(ctx, npcOf(follower.id).look, friendX, y, 'right', 0, 1.3);
  });
}

// The stage of a fight: the hero on the left, the opponent on the right, and the sparks.
// effects: { run: { particles: [] } }, filled by FightScreen.
export default function FightArena({ game, fight, effects }) {
  const canvasRef = useCanvas(draw);

  function draw(ctx, width, height, time, dt) {
    const opponent = fight.opponent;
    const lunges = lungesOf(fight.last);
    const ground = height - 16;
    updateParticles(effects, dt);
    drawBackground(ctx, game, width, height);
    drawFriends(ctx, game, width * 0.26, ground, time);
    drawPerson(ctx, HERO_LOOK, width * 0.26 + lunges.player, ground, 'right', lunges.player / 8, 2.2);
    if (opponent.duel) drawPerson(ctx, opponent.look, width * 0.74 - lunges.monster, ground, 'left', 0, 2.2);
    else drawMonster(ctx, opponent, width * 0.74 - lunges.monster, ground, 2.2, time);
    drawParticles(ctx, effects.run.particles, ARENA_UNIT);
  }

  return <canvas ref={canvasRef} className="arena" />;
}
