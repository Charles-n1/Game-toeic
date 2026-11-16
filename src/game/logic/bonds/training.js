import { npcOf } from '../../data/npcs';
import { villageOf, zoneAt } from '../../data/zones';
import { notify } from '../messages';
import { cue } from '../cues';
import { emote } from '../emotes';
import { floatText } from '../particles';

// Companion training in village training corners, learnable attacks (Ranks 1..3),
// special moves (Rank 4), and scaling per-character battle effects (1..4).

const MAX_PARTY = 2;

export const TRAINING_RANKS = [
  { rank: 0, title: 'Recruit', combats: 0, hours: 0, attackBonus: 0 },
  { rank: 1, title: 'Attack I', combats: 3, hours: 4, attackBonus: 8 },
  { rank: 2, title: 'Attack II', combats: 8, hours: 10, attackBonus: 18 },
  { rank: 3, title: 'Attack III', combats: 15, hours: 18, attackBonus: 32 },
  { rank: 4, title: 'Special Move', combats: 25, hours: 30, attackBonus: 55 },
];

// Bespoke attacks, special move, and 4 scaling effects for each character (especially fighters & art/Characters).
export const CHARACTER_MOVES = {
  lyra: {
    attacks: ['Dawn Slash', 'Aegis Bash', 'Radiant Charge'],
    special: { name: 'Solar Judgement', sound: 'specialBurst', color: '#ffd23f', bonusDamage: 26, flavor: 'Lyra calls down a pillar of golden dawnlight!' },
    effects: [
      { id: 'lyra1', name: 'Vanguard Guard', kind: 'defense', value: 3, color: '#ffe066', text: '+3 Defense in combat' },
      { id: 'lyra2', name: 'Dawn Blessing', kind: 'heal', value: 3, color: '#7cfc9a', text: 'Heals +3 HP per good answer' },
      { id: 'lyra3', name: 'Sunlit Strike', kind: 'attack', value: 8, color: '#ffd23f', text: '+8 Light Strike damage' },
      { id: 'lyra4', name: 'Dawn Aegis', kind: 'critical', value: 6, color: '#fff2a8', text: '+6% Critical chance & Solar Judgement' },
    ],
  },
  arthur: {
    attacks: ['Shield Thrust', 'Gatekeeper Cleave', 'Phalanx Rush'],
    special: { name: 'Bastion Breaker', sound: 'companionStrike', color: '#8cc5ee', bonusDamage: 24, flavor: 'Arthur charges with an unyielding shield wall!' },
    effects: [
      { id: 'arthur1', name: 'Iron Shield', kind: 'defense', value: 4, color: '#9aa6b8', text: '+4 Defense in combat' },
      { id: 'arthur2', name: 'Steady Stance', kind: 'speed', value: 2, color: '#8cc5ee', text: '+2 Fight Speed' },
      { id: 'arthur3', name: 'Knightly Valor', kind: 'attack', value: 10, color: '#c9d1e0', text: '+10 Strike damage' },
      { id: 'arthur4', name: 'Unbreakable Wall', kind: 'defense', value: 8, color: '#5fb8ff', text: '+8 extra Defense & Bastion Breaker' },
    ],
  },
  hinata: {
    attacks: ['Petal Cut', 'Flash Draw', 'Gale Iaido'],
    special: { name: 'Sakura Tempest', sound: 'slash', color: '#ff9ec4', bonusDamage: 28, flavor: 'Hinata vanishes in a whirlwind of crimson petals!' },
    effects: [
      { id: 'hinata1', name: 'Swift Step', kind: 'speed', value: 2, color: '#ff9ec4', text: '+2 Speed (more answer time)' },
      { id: 'hinata2', name: 'Keen Edge', kind: 'critical', value: 5, color: '#ff6fa8', text: '+5% Critical chance' },
      { id: 'hinata3', name: 'Blossom Flurry', kind: 'attack', value: 10, color: '#ffb6d9', text: '+10 Katana damage' },
      { id: 'hinata4', name: 'Mirrored Focus', kind: 'speed', value: 4, color: '#ffd23f', text: '+4 extra Speed & Sakura Tempest' },
    ],
  },
  kaelthra: {
    attacks: ['Ember Cut', 'Runic Thrust', 'Blazing Arc'],
    special: { name: 'Inferno Sigil', sound: 'specialBurst', color: '#ff6a2b', bonusDamage: 30, flavor: 'Kaelthra ignites a searing rune across the battlefield!' },
    effects: [
      { id: 'kaelthra1', name: 'Sparking Blade', kind: 'attack', value: 5, color: '#ff8c2b', text: '+5 Fire Attack' },
      { id: 'kaelthra2', name: 'Runic Heat', kind: 'spell', value: 10, color: '#ff6a2b', text: '+10% Spell damage' },
      { id: 'kaelthra3', name: 'Cinder Fury', kind: 'critical', value: 6, color: '#ffd23f', text: '+6% Critical chance' },
      { id: 'kaelthra4', name: 'Ember Resonance', kind: 'spell', value: 15, color: '#ff3b4f', text: '+15% extra Spell damage & Inferno Sigil' },
    ],
  },
  dorian: {
    attacks: ['Twin Feint', 'Shadow Lunge', 'Viper Flurry'],
    special: { name: 'Crimson Gambit', sound: 'companionStrike', color: '#e8423f', bonusDamage: 26, flavor: 'Dorian strikes twice before the enemy blinks!' },
    effects: [
      { id: 'dorian1', name: 'Nimble Footwork', kind: 'speed', value: 2, color: '#9fd8ff', text: '+2 Fight Speed' },
      { id: 'dorian2', name: 'Mercenary Cut', kind: 'lexis', value: 15, color: '#ffd23f', text: '+15% Lexis from victory' },
      { id: 'dorian3', name: 'Backstab Precision', kind: 'critical', value: 8, color: '#ff5a6e', text: '+8% Critical chance' },
      { id: 'dorian4', name: 'Gold & Dagger', kind: 'attack', value: 12, color: '#ff9a2b', text: '+12 Strike damage & Crimson Gambit' },
    ],
  },
  kael: {
    attacks: ['Fang Strike', 'Timber Cleave', 'Pack Ambush'],
    special: { name: 'Alpha Howl', sound: 'companionStrike', color: '#a8d5ff', bonusDamage: 26, flavor: 'Kael and Sombre tear through the enemy together!' },
    effects: [
      { id: 'kael1', name: 'Wolf Watch', kind: 'attack', value: 5, color: '#8fa6c9', text: '+5 Pack Attack' },
      { id: 'kael2', name: 'Wild Stride', kind: 'speed', value: 2, color: '#7cfc9a', text: '+2 Fight Speed' },
      { id: 'kael3', name: 'Feral Instinct', kind: 'critical', value: 6, color: '#ffd23f', text: '+6% Critical chance' },
      { id: 'kael4', name: 'Twin Predators', kind: 'attack', value: 14, color: '#e9e2d0', text: '+14 extra Attack & Alpha Howl' },
    ],
  },
  garrick: {
    attacks: ['Pike Jab', 'Gate Sweep', 'Iron Thrust'],
    special: { name: 'Watchman Stand', sound: 'slash', color: '#c9a227', bonusDamage: 22, flavor: 'Garrick drives his veteran spear straight through!' },
    effects: [
      { id: 'garrick1', name: 'Gate Shield', kind: 'defense', value: 3, color: '#9aa6b8', text: '+3 Defense' },
      { id: 'garrick2', name: 'Veteran Grit', kind: 'attack', value: 7, color: '#c9a227', text: '+7 Spear damage' },
      { id: 'garrick3', name: 'Stone Resolve', kind: 'defense', value: 6, color: '#c9d1e0', text: '+6 extra Defense' },
      { id: 'garrick4', name: 'Oath of Eldermoor', kind: 'heal', value: 4, color: '#7cfc9a', text: '+4 HP per good answer & Watchman Stand' },
    ],
  },
  nyx: {
    attacks: ['Dusk Bolt', 'Horned Dash', 'Eclipse Slash'],
    special: { name: 'Starless Requiem', sound: 'magicCast', color: '#b48cff', bonusDamage: 28, flavor: 'Nyx unleashes dark northern starlight!' },
    effects: [
      { id: 'nyx1', name: 'Night Sight', kind: 'speed', value: 2, color: '#b48cff', text: '+2 Fight Speed' },
      { id: 'nyx2', name: 'Twilight Ward', kind: 'defense', value: 4, color: '#8a5fd0', text: '+4 Defense' },
      { id: 'nyx3', name: 'Shadow Surge', kind: 'spell', value: 15, color: '#d8b4f8', text: '+15% Spell damage' },
      { id: 'nyx4', name: 'Royal Blood', kind: 'critical', value: 8, color: '#ff6fa8', text: '+8% Critical & Starless Requiem' },
    ],
  },
  luna: {
    attacks: ['Spark Bolt', 'Tense Surge', 'Astral Lance'],
    special: { name: 'Starfall Grammar', sound: 'magicCast', color: '#5fb8ff', bonusDamage: 24, flavor: 'Luna rains glowing constellations of verbs!' },
    effects: [
      { id: 'luna1', name: 'Quick Chant', kind: 'spell', value: 8, color: '#5fb8ff', text: '+8% Spell damage' },
      { id: 'luna2', name: 'Mana Spark', kind: 'speed', value: 2, color: '#9fd8ff', text: '+2 Fight Speed' },
      { id: 'luna3', name: 'Academy Focus', kind: 'spell', value: 12, color: '#ffd23f', text: '+12% Spell damage' },
      { id: 'luna4', name: 'Astral Harmony', kind: 'critical', value: 6, color: '#ffffff', text: '+6% Critical & Starfall Grammar' },
    ],
  },
  selene: {
    attacks: ['Arcane Ray', 'Syntax Bind', 'Celestial Pulse'],
    special: { name: 'Grand Conjunction', sound: 'magicCast', color: '#a066ff', bonusDamage: 26, flavor: 'Selene locks every star into an unbreakable clause!' },
    effects: [
      { id: 'selene1', name: 'Astral Ward', kind: 'defense', value: 3, color: '#b48cff', text: '+3 Defense' },
      { id: 'selene2', name: 'Connector Sigil', kind: 'spell', value: 12, color: '#8a6fe0', text: '+12% Spell damage' },
      { id: 'selene3', name: 'Precision Cast', kind: 'speed', value: 2, color: '#d8d4f0', text: '+2 Fight Speed' },
      { id: 'selene4', name: 'Starlight Mastery', kind: 'spell', value: 18, color: '#ffd23f', text: '+18% Spell damage & Grand Conjunction' },
    ],
  },
  elara: {
    attacks: ['Hex Flask', 'Thorn Brew', 'Witchfire'],
    special: { name: 'Elixir Tempest', sound: 'magicCast', color: '#7cfc9a', bonusDamage: 22, flavor: 'Elara shatters a radiant flask of healing starlight!' },
    effects: [
      { id: 'elara1', name: 'Herbal Mist', kind: 'heal', value: 2, color: '#7cfc9a', text: '+2 HP per good answer' },
      { id: 'elara2', name: 'Brewed Edge', kind: 'spell', value: 10, color: '#b48cff', text: '+10% Spell damage' },
      { id: 'elara3', name: 'Vital Tonic', kind: 'heal', value: 4, color: '#4cc35a', text: '+4 extra HP per good answer' },
      { id: 'elara4', name: 'Witch Aura', kind: 'defense', value: 6, color: '#ffd23f', text: '+6 Defense & Elixir Tempest' },
    ],
  },
  darius: {
    attacks: ['Anvil Blow', 'Forge Hammer', 'Molten Smash'],
    special: { name: 'Masterwork Cleave', sound: 'specialBurst', color: '#ff9a2b', bonusDamage: 26, flavor: 'Darius brings down a glowing hammer forged in fire!' },
    effects: [
      { id: 'darius1', name: 'Tempered Steel', kind: 'attack', value: 6, color: '#ff9a2b', text: '+6 Attack' },
      { id: 'darius2', name: 'Iron Plate', kind: 'defense', value: 4, color: '#9aa6b8', text: '+4 Defense' },
      { id: 'darius3', name: 'Hammerfall', kind: 'attack', value: 10, color: '#e8423f', text: '+10 extra Attack' },
      { id: 'darius4', name: 'Guildmaster Pride', kind: 'critical', value: 6, color: '#ffd23f', text: '+6% Critical & Masterwork Cleave' },
    ],
  },
  lucien: {
    attacks: ['Thread Snap', 'Marionette Strike', 'Curtain Call'],
    special: { name: 'Grand Finale', sound: 'companionStrike', color: '#b48cff', bonusDamage: 24, flavor: 'Lucien commands an unseen chorus of dancing blades!' },
    effects: [
      { id: 'lucien1', name: 'Tangled Strings', kind: 'speed', value: 2, color: '#b48cff', text: '+2 Fight Speed' },
      { id: 'lucien2', name: 'Stage Trick', kind: 'critical', value: 5, color: '#ffd23f', text: '+5% Critical chance' },
      { id: 'lucien3', name: 'Shadow Guard', kind: 'defense', value: 5, color: '#8a5fd0', text: '+5 Defense' },
      { id: 'lucien4', name: 'Puppet Master', kind: 'attack', value: 12, color: '#d8b4f8', text: '+12 Attack & Grand Finale' },
    ],
  },
  sylvia: {
    attacks: ['Briar Whip', 'Root Bind', 'Verdant Gale'],
    special: { name: 'Ancient Canopy', sound: 'magicCast', color: '#4cc35a', bonusDamage: 24, flavor: 'Sylvia awakens ancient roots beneath the enemy!' },
    effects: [
      { id: 'sylvia1', name: 'Moss Mend', kind: 'heal', value: 2, color: '#7cfc9a', text: '+2 HP per good answer' },
      { id: 'sylvia2', name: 'Grove Ward', kind: 'defense', value: 4, color: '#4cc35a', text: '+4 Defense' },
      { id: 'sylvia3', name: 'Nature Surge', kind: 'spell', value: 12, color: '#97d65e', text: '+12% Spell damage' },
      { id: 'sylvia4', name: 'Verdant Heart', kind: 'heal', value: 5, color: '#ffd23f', text: '+5 extra HP heal & Ancient Canopy' },
    ],
  },
  vespera: {
    attacks: ['Grave Bolt', 'Bone Spike', 'Soul Harvest'],
    special: { name: 'Obsidian Eclipse', sound: 'magicCast', color: '#8a3fd1', bonusDamage: 28, flavor: 'Vespera summons ghostly echoes from beyond the veil!' },
    effects: [
      { id: 'vespera1', name: 'Chill Touch', kind: 'spell', value: 8, color: '#b48cff', text: '+8% Spell damage' },
      { id: 'vespera2', name: 'Soul Siphon', kind: 'heal', value: 3, color: '#ff6fa8', text: '+3 HP per good answer' },
      { id: 'vespera3', name: 'Cryptic Edge', kind: 'critical', value: 6, color: '#d8b4f8', text: '+6% Critical chance' },
      { id: 'vespera4', name: 'Obsidian Crown', kind: 'spell', value: 16, color: '#ffd23f', text: '+16% extra Spell power & Obsidian Eclipse' },
    ],
  },
  corvin: {
    attacks: ['Lancet Cut', 'Bitter Draught', 'Crow Strike'],
    special: { name: 'Crimson Remedy', sound: 'companionStrike', color: '#d0202a', bonusDamage: 24, flavor: 'Corvin strikes every weak point with surgical precision!' },
    effects: [
      { id: 'corvin1', name: 'Sharp Diagnosis', kind: 'critical', value: 4, color: '#ff5a6e', text: '+4% Critical chance' },
      { id: 'corvin2', name: 'Field Triage', kind: 'heal', value: 3, color: '#7cfc9a', text: '+3 HP per good answer' },
      { id: 'corvin3', name: 'Scholar Eye', kind: 'xp', value: 15, color: '#ffd23f', text: '+15% XP from victory' },
      { id: 'corvin4', name: 'Shadow Cure', kind: 'attack', value: 12, color: '#e8423f', text: '+12 Attack & Crimson Remedy' },
    ],
  },
};

const DEFAULT_MOVES = {
  attacks: ['Quick Strike', 'Guard Break', 'Heroic Slash'],
  special: { name: 'United Finisher', sound: 'specialBurst', color: '#ffd23f', bonusDamage: 22, flavor: 'Your companion unleashes a decisive strike!' },
  effects: [
    { id: 'default1', name: 'Battle Focus', kind: 'attack', value: 4, color: '#c9d1e0', text: '+4 Attack' },
    { id: 'default2', name: 'Side Guard', kind: 'defense', value: 3, color: '#9aa6b8', text: '+3 Defense' },
    { id: 'default3', name: 'Swift Rhythm', kind: 'speed', value: 2, color: '#9fd8ff', text: '+2 Fight Speed' },
    { id: 'default4', name: 'United Spirit', kind: 'critical', value: 6, color: '#ffd23f', text: '+6% Critical & United Finisher' },
  ],
};

export function movesFor(npcId) {
  return CHARACTER_MOVES[npcId] || DEFAULT_MOVES;
}

export function firstBonds() {
  return {
    couples: {},
    romance: {},
    jokedDay: {},
    flirtedDay: {},
    chattedDay: {},
    training: {},
    dates: 0,
    nightCount: 0,
    dayHoursGained: 0,
    lastDay: 1,
    lastHour: 9,
  };
}

export function ensureBonds(game) {
  if (!game.bonds || typeof game.bonds !== 'object') game.bonds = firstBonds();
  if (!game.bonds.couples) game.bonds.couples = {};
  if (!game.bonds.romance) game.bonds.romance = {};
  if (!game.bonds.jokedDay) game.bonds.jokedDay = {};
  if (!game.bonds.flirtedDay) game.bonds.flirtedDay = {};
  if (!game.bonds.chattedDay) game.bonds.chattedDay = {};
  if (!game.bonds.training) game.bonds.training = {};
  if (typeof game.bonds.dates !== 'number') game.bonds.dates = 0;
  if (typeof game.bonds.nightCount !== 'number') game.bonds.nightCount = 0;
  if (typeof game.bonds.dayHoursGained !== 'number') game.bonds.dayHoursGained = 0;
  if (typeof game.bonds.lastDay !== 'number') game.bonds.lastDay = game.day || 1;
  if (typeof game.bonds.lastHour !== 'number') game.bonds.lastHour = game.hour || 9;
  return game.bonds;
}

// Trainable characters: fighters + the art/Characters roster (sheet characters).
export function isTrainable(npc) {
  return Boolean(npc && !npc.child && (npc.fighter || npc.look?.sheet));
}

export function trainingOf(game, npcId) {
  const bonds = ensureBonds(game);
  if (!bonds.training[npcId]) {
    bonds.training[npcId] = { combats: 0, hours: 0, stationedAt: null, rank: 0 };
  }
  return bonds.training[npcId];
}

// Recomputes rank from combats & hours; notifies when a new attack or special move unlocks.
export function recomputeRank(game, npcId) {
  const entry = trainingOf(game, npcId);
  let targetRank = 0;
  for (const step of TRAINING_RANKS) {
    if (entry.combats >= step.combats && entry.hours >= step.hours) targetRank = step.rank;
  }
  if (targetRank > entry.rank) {
    const oldRank = entry.rank;
    entry.rank = targetRank;
    const npc = npcOf(npcId);
    const moves = movesFor(npcId);
    const unlockedLabel = targetRank === 4 ? 'Special Move: ' + moves.special.name : moves.attacks[targetRank - 1];
    if (npc) {
      notify(game, '⚔️ ' + npc.name + ' mastered ' + unlockedLabel + ' (Rank ' + targetRank + '/4)!', '#ffd23f');
      cue(game, 'rankUp');
      const spot = stationedSpot(game, npcId) || game.run?.people?.[npcId];
      if (spot && game.run?.particles) floatText(game, spot.x, spot.y - 1.5, unlockedLabel + '!', '#ffd23f');
      if (oldRank < targetRank) emote(game, npcId, 'sparkle');
    }
  }
  return entry.rank;
}

export function companionRank(game, npcId) {
  if (!game || !npcId) return 0;
  return recomputeRank(game, npcId);
}

// Attack damage bonus for a specific companion or the whole active party.
export function companionAttackBonus(game, npcId = null) {
  if (!game) return 0;
  if (npcId) {
    const rank = companionRank(game, npcId);
    return (TRAINING_RANKS[rank] || TRAINING_RANKS[0]).attackBonus;
  }
  return (game.player?.party || []).reduce((sum, id) => sum + companionAttackBonus(game, id), 0);
}

// Active special move info for a specific companion (Rank 4) or combined active party specials.
export function companionSpecialMove(game, npcId = null) {
  if (!game) return null;
  if (npcId) {
    if (companionRank(game, npcId) < 4) return null;
    const npc = npcOf(npcId);
    const special = movesFor(npcId).special;
    return { npcId: npcId, npcName: npc ? npc.name : npcId, ...special, unlocked: true };
  }
  const active = (game.player?.party || []).map((id) => companionSpecialMove(game, id)).filter(Boolean);
  if (active.length === 0) return null;
  const lead = active[0];
  return {
    ...lead,
    bonusDamage: active.reduce((sum, item) => sum + item.bonusDamage, 0),
    names: active.map((item) => item.name),
    moves: active,
  };
}

// Per-character scaling effects: 1 effect at Rank 0-1, 2 at Rank 2, 3 at Rank 3, 4 at Rank 4.
export function companionEffectsList(game, npcId = null) {
  if (!game) return [];
  if (npcId) {
    const rank = companionRank(game, npcId);
    const count = Math.max(1, Math.min(4, rank));
    const npc = npcOf(npcId);
    return movesFor(npcId).effects.slice(0, count).map((effect) => ({
      ...effect,
      npcId: npcId,
      npcName: npc ? npc.name : npcId,
      rank: rank,
    }));
  }
  return (game.player?.party || []).flatMap((id) => companionEffectsList(game, id));
}

// Aggregated stat bonuses from all active party companion effects.
export function companionStatBonuses(game) {
  const totals = { attack: 0, defense: 0, speed: 0, spell: 0, heal: 0, critical: 0, xp: 0, lexis: 0 };
  for (const effect of companionEffectsList(game)) {
    if (totals[effect.kind] !== undefined) totals[effect.kind] += effect.value;
  }
  return totals;
}

export function isStationedInTraining(game, npcId) {
  return Boolean(game?.bonds?.training?.[npcId]?.stationedAt);
}

export function stationedInVillage(game, villageId) {
  const bonds = ensureBonds(game);
  return Object.entries(bonds.training)
    .filter(([, entry]) => entry && entry.stationedAt === villageId)
    .map(([npcId]) => npcId);
}

// Training corner spots (relative to village.plan.training): beside the 3 dummies and the logs.
export function stationedSpot(game, npcId) {
  const entry = game?.bonds?.training?.[npcId];
  if (!entry || !entry.stationedAt) return null;
  const village = villageOf(entry.stationedAt);
  const corner = village?.plan?.training;
  if (!corner) return null;
  const peers = stationedInVillage(game, entry.stationedAt);
  const slot = Math.max(0, peers.indexOf(npcId)) % 4;
  const slots = [
    { x: corner.x + 5.25, y: corner.y + 4.1, targetX: corner.x + 6.5, targetY: corner.y + 3.5, propKind: 'dummy' },
    { x: corner.x + 1.25, y: corner.y + 4.1, targetX: corner.x + 2.5, targetY: corner.y + 3.5, propKind: 'dummy' },
    { x: corner.x + 9.25, y: corner.y + 4.1, targetX: corner.x + 10.5, targetY: corner.y + 3.5, propKind: 'dummy' },
    { x: corner.x + 8.3, y: corner.y + 8.1, targetX: corner.x + 9.8, targetY: corner.y + 7.5, propKind: 'logs' },
  ];
  return { ...slots[slot], villageId: entry.stationedAt, villageName: village.name, slot: slot };
}

// Stations a companion at a village's training corner (leaving party temporarily).
export function stationAtTraining(game, npcId, villageId = null) {
  const npc = npcOf(npcId);
  if (!isTrainable(npc)) return false;
  const state = game.npcs?.[npcId];
  if (state && !state.alive) return false;
  const here = zoneAt(game.player.x, game.player.y);
  const targetId = villageId || (here.kind === 'village' ? here.id : 'lexia');
  const village = villageOf(targetId);
  if (!village || !village.plan?.training) return false;

  const entry = trainingOf(game, npcId);
  const wasInParty = (game.player.party || []).includes(npcId);
  if (wasInParty) game.player.party = game.player.party.filter((id) => id !== npcId);
  entry.wasInParty = wasInParty;
  entry.stationedAt = targetId;
  emote(game, npcId, 'sparkle');
  cue(game, 'trainingHit');
  notify(game, '🥋 ' + npc.name + ' is now training at ' + village.name + '\'s training corner!', '#ffd23f');
  return true;
}

// Recalls a stationed companion from training (rejoining party if there is room and they came from party).
export function recallFromTraining(game, npcId) {
  const entry = trainingOf(game, npcId);
  if (!entry.stationedAt) return false;
  const npc = npcOf(npcId);
  entry.stationedAt = null;
  if (npc && entry.wasInParty && !game.player.party.includes(npcId) && game.player.party.length < MAX_PARTY) {
    game.player.party.push(npcId);
    notify(game, '⚔️ ' + npc.name + ' rejoined your party! (Rank ' + entry.rank + '/4)', '#7cfc9a');
  } else if (npc) {
    notify(game, '🥋 ' + npc.name + ' finished training at the corner.', '#9fd8ff');
  }
  entry.wasInParty = false;
  return true;
}

// Increments combat count for every companion currently fighting in the party.
export function recordCompanionCombat(game) {
  if (!game?.player?.party) return;
  for (const npcId of game.player.party) {
    const entry = trainingOf(game, npcId);
    entry.combats += 1;
    recomputeRank(game, npcId);
  }
}

export function addTrainingHours(game, npcId, hours) {
  if (hours <= 0) return;
  const entry = trainingOf(game, npcId);
  entry.hours = Math.round((entry.hours + hours) * 100) / 100;
  recomputeRank(game, npcId);
}

export function trainingStatusLines(game, npc) {
  const entry = trainingOf(game, npc.id);
  const rank = recomputeRank(game, npc.id);
  const moves = movesFor(npc.id);
  const next = TRAINING_RANKS[rank + 1];
  const unlockedMoves = [
    ...moves.attacks.slice(0, Math.min(3, rank)),
    ...(rank >= 4 ? ['★ ' + moves.special.name] : []),
  ];
  const lines = [
    npc.name + ' — Rank ' + rank + '/4 (' + TRAINING_RANKS[rank].title + ')',
    'Combats: ' + entry.combats + ' · Training hours: ' + entry.hours.toFixed(1) + 'h' + (entry.stationedAt ? ' · Stationed at ' + (villageOf(entry.stationedAt)?.name || entry.stationedAt) : ''),
    'Bonus damage: +' + companionAttackBonus(game, npc.id) + (unlockedMoves.length > 0 ? ' · Moves: ' + unlockedMoves.join(', ') : ' · No advanced moves yet'),
    'Active effects (' + Math.max(1, rank) + '/4): ' + companionEffectsList(game, npc.id).map((e) => e.name + ' (' + e.text + ')').join(' · '),
  ];
  if (next) lines.push('Next rank (' + next.title + '): needs ' + next.combats + ' combats & ' + next.hours + 'h training.');
  else lines.push('Maximum mastery reached! ' + moves.special.flavor);
  return lines;
}
