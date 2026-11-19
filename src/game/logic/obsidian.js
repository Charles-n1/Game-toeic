import { ITEMS } from '../data/items';
import { typeOf, weaknessOf } from '../data/types';
import { spawnRing, spawnSpikes, burst, floatText } from './particles';
import { notify } from './messages';
import { cue } from './cues';

// Obsidian Sovereign: the hero's unique isekai Gift.
// Evolves across 5 ranks with obsidianXp, unlocks Appraisal (Eye of Obsidian),
// Shard Resonance, Shield Wall Counter-Strikes, and Abyssal Crystal Eruption VFX.

export const OBSIDIAN_RANKS = [
  { level: 1, minXp: 0, title: 'Black Glass Spark', soldierHp: 45, bladeBonus: 20, spikeDmg: 42 },
  { level: 2, minXp: 6, title: 'Shadow Sentinel', soldierHp: 52, bladeBonus: 22, spikeDmg: 52 },
  { level: 3, minXp: 14, title: 'Abyssal Fang', soldierHp: 58, bladeBonus: 25, spikeDmg: 65 },
  { level: 4, minXp: 24, title: 'Glass Sovereign', soldierHp: 65, bladeBonus: 28, spikeDmg: 80 },
  { level: 5, minXp: 38, title: 'Monarch of Black Crystal', soldierHp: 75, bladeBonus: 32, spikeDmg: 98 },
];

export function obsidianRankInfo(player) {
  const xp = player?.obsidianXp || 0;
  let current = OBSIDIAN_RANKS[0];
  for (const r of OBSIDIAN_RANKS) {
    if (xp >= r.minXp) current = r;
  }
  return current;
}

export function soldierUnitMaxHp(player) {
  return obsidianRankInfo(player).soldierHp;
}

export function obsidianBladeBonus(player) {
  if (!player || player.obsidianBlade <= 0) return 0;
  return obsidianRankInfo(player).bladeBonus;
}

// Passive Gift Ability: "Eye of Obsidian" (Appraisal) in combat!
export function appraiseOpponent(game, opponent) {
  if (!game?.player?.powers?.includes('obsidian') || !opponent || opponent.duel) return null;
  const weakId = weaknessOf(opponent.category);
  const weakName = weakId ? typeOf(weakId)?.short : 'None';
  const res = Math.round((opponent.resistance || 0) * 100);
  const magRes = Math.round((opponent.magicResistance || 0) * 100);
  const drops = (opponent.drops || []).map((id) => ITEMS[id]?.name || id).join(', ');
  return {
    atk: Math.round(Math.max(opponent.attack || 0, opponent.magicAttack || 0)),
    spd: opponent.speed || 10,
    res,
    magRes,
    weakName,
    drops: drops || 'Materials / Lexis',
  };
}

export function emitObsidianShockwave(game, x, y, maxRadius = 3.6, color = '#b48cff') {
  if (!game?.run) return;
  spawnRing(game, x, y, maxRadius, color, 2.5, 0.52);
  spawnRing(game, x, y, maxRadius * 0.65, '#f0d8ff', 1.5, 0.4);
  burst(game, x, y, color, 18);
  burst(game, x, y, '#2b1f3a', 12);
}

export function eruptObsidianSpikes(game, onHitMonster, onHitAnimal) {
  const player = game.player;
  const info = obsidianRankInfo(player);
  const radius = 4.6;
  spawnSpikes(game, player.x, player.y, radius, 12, '#b48cff');
  emitObsidianShockwave(game, player.x, player.y, radius, '#c9a8ff');
  game.run.flashUntil = Date.now() + 140;
  game.run.shakeUntil = Date.now() + 300;
  cue(game, 'thunder');

  let hits = 0;
  for (const m of [...(game.run.monsters || [])]) {
    if (Math.hypot(m.x - player.x, m.y - player.y) <= radius) {
      onHitMonster(m, info.spikeDmg);
      m.walkTime = 1.5;
      m.walkX = 0;
      m.walkY = 0;
      hits += 1;
    }
  }
  const prey = [...(game.run.wildAnimals || []), ...(game.run.animals || [])];
  for (const a of prey) {
    if (Math.hypot(a.x - player.x, a.y - player.y) <= radius) {
      onHitAnimal(a, info.spikeDmg);
      hits += 1;
    }
  }
  player.obsidianResonance = true; // empowers next strike crit/damage!
  floatText(game, player.x, player.y - 1.1, '🔮 ABYSSAL SPIKES!', '#d8b4f8');
  notify(game, hits > 0 ? '🔮 Obsidian Eruption impaled ' + hits + ' target(s)!' : '🔮 Obsidian crystals burst around you (next fight strike empowered)!', '#c9a8ff');
  return true;
}
