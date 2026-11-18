import { NPCS } from '../../data/npcs';
import { ITEMS } from '../../data/items';
import { SPECIES } from '../../data/monsters';
import { INTELLIGENT_MONSTERS } from '../../data/isekaiTodo';
import { ensureIsekaiTodo } from './state';
import { unlockAchievement } from './progression';
import { ensureGuild, rankIndex } from '../guild/ranks';
import { addItem, earnLexis } from '../player';
import { notify } from '../messages';
import { cue } from '../cues';

// Player-founded Adventurer Guild (Rank D+, 150 Lexis charter, up to Lv 5).
// Supports recruiting NPCs, intelligent monsters & tamed beasts, dispatching missions,
// resolving daily expeditions (with Lexis, loot & minor injuries), and hall upgrades.

const FOUNDING_FEE = 150;
const MIN_FOUND_RANK_IDX = 2; // Rank D
const MAX_GUILD_LEVEL = 5;
const MISSION_LOOT = ['ore', 'pelt', 'herb', 'crystal', 'refineStone', 'gem'];

/** Returns member capacity for the player's own guild (`3 + (level - 1) * 2`). */
export function ownGuildCap(game) {
  const og = ensureIsekaiTodo(game).ownGuild;
  return 3 + ((og.level || 1) - 1) * 2;
}

/** Checks whether the hero can found their own Adventurer Guild (`{ ok, reason }`). */
export function canFoundOwnGuild(game) {
  const st = ensureIsekaiTodo(game);
  const g = ensureGuild(game);
  if (st.ownGuild.founded) {
    return { ok: false, reason: 'You already founded ' + (st.ownGuild.name || 'your guild') + '.' };
  }
  if (rankIndex(g.rank) < MIN_FOUND_RANK_IDX) {
    return { ok: false, reason: 'Requires Guild Rank D or higher (currently Rank ' + g.rank + ').' };
  }
  if ((game.player?.lexis || 0) < FOUNDING_FEE) {
    return { ok: false, reason: 'Need ' + FOUNDING_FEE + ' Lexis for the founding charter.' };
  }
  return { ok: true, reason: '' };
}

/** Founds the player's own Adventurer Guild, charges 150 Lexis, and awards `ownGuild`. */
export function foundOwnGuild(game, name = 'Dawnblade Guild', banner = '#ffd23f') {
  const check = canFoundOwnGuild(game);
  if (!check.ok) return false;
  const st = ensureIsekaiTodo(game);
  game.player.lexis -= FOUNDING_FEE;
  const guildName = String(name || 'Dawnblade Guild').trim() || 'Dawnblade Guild';
  st.ownGuild.founded = true;
  st.ownGuild.name = guildName;
  st.ownGuild.banner = banner || '#ffd23f';
  st.ownGuild.level = 1;
  st.ownGuild.xp = 0;
  st.ownGuild.rooms = 2;
  if (!Array.isArray(st.ownGuild.members)) st.ownGuild.members = [];
  cue(game, 'victory');
  notify(game, '🏰 Founded ' + guildName + '! Recruit allies and dispatch expeditions.', '#ffd23f');
  unlockAchievement(game, 'ownGuild');
  return true;
}

/** Lists intelligent monsters, tamed monsters, and befriended NPCs eligible to join the guild. */
export function recruitableGuildCandidates(game) {
  const st = ensureIsekaiTodo(game);
  const og = st.ownGuild;
  const joined = new Set((og.members || []).map((m) => m.id));
  const candidates = [];

  for (const mId of st.intelligent?.recruited || []) {
    if (joined.has(mId)) continue;
    const spec = INTELLIGENT_MONSTERS.find((m) => m.id === mId);
    if (spec) {
      candidates.push({ id: mId, name: spec.name, kind: 'monster', power: 16 });
    }
  }

  for (const tamed of st.tamed || []) {
    const id = tamed.uid || 'tamed_' + tamed.species + '_' + tamed.name;
    if (joined.has(id)) continue;
    const baseAtk = SPECIES[tamed.species]?.attack || 12;
    const power = Math.max(10, Math.round(baseAtk * 0.6 + (tamed.level || 1) * 3));
    candidates.push({
      id,
      name: tamed.name || SPECIES[tamed.species]?.name || tamed.species,
      kind: 'tamed',
      power,
    });
  }

  for (const npc of NPCS) {
    if (joined.has(npc.id)) continue;
    const state = game.npcs?.[npc.id];
    if (!state || !state.alive || (state.friendship || 0) < 15) continue;
    const power = (npc.fighter ? 18 : 12) + Math.floor((state.friendship || 0) / 25);
    candidates.push({ id: npc.id, name: npc.name, kind: 'npc', power });
  }

  return candidates;
}

/** Recruits a candidate into the player's guild roster up to `ownGuildCap(game)`. */
export function addOwnGuildMember(game, { id, name, kind = 'npc', power = 12 }) {
  const st = ensureIsekaiTodo(game);
  const og = st.ownGuild;
  if (!og.founded || !id) return false;
  if (og.members.some((m) => m.id === id)) return false;
  const cap = ownGuildCap(game);
  if (og.members.length >= cap) {
    notify(game, '🏰 Guild roster full (' + og.members.length + '/' + cap + '). Upgrade your Guild Hall!', '#ffb070');
    return false;
  }
  og.members.push({
    id,
    name: name || id,
    kind,
    power,
    status: 'idle',
    returnDay: 0,
    reward: null,
    injuredUntilDay: 0,
  });
  cue(game, 'coin');
  notify(game, '🏰 ' + (name || id) + ' joined ' + (og.name || 'your guild') + '!', '#7cfc9a');
  return true;
}

/** Dispatches an idle, uninjured guild member on a 1-day expedition. */
export function sendOwnGuildMission(game, memberId) {
  const og = ensureIsekaiTodo(game).ownGuild;
  if (!og.founded) return false;
  const member = og.members.find((m) => m.id === memberId);
  if (!member) return false;

  const today = game.day || 1;
  if (member.injuredUntilDay && today >= member.injuredUntilDay) {
    member.injuredUntilDay = 0;
  }
  if (member.status !== 'idle') return false;
  if (member.injuredUntilDay && today < member.injuredUntilDay) {
    notify(game, '🩹 ' + member.name + ' is still recovering until Day ' + member.injuredUntilDay + '.', '#ffb070');
    return false;
  }

  member.status = 'mission';
  member.returnDay = today + 1;
  member.reward = null;
  cue(game, 'coin');
  notify(game, '📜 Dispatched ' + member.name + ' on a guild mission (returns Day ' + member.returnDay + ').', '#9fd8ff');
  return true;
}

/** Adds XP to the player's own guild, leveling Lv 1..5 and expanding rooms. */
export function gainOwnGuildXp(game, amount) {
  const og = ensureIsekaiTodo(game).ownGuild;
  if (!og.founded) return og.level || 1;
  og.xp = (og.xp || 0) + Math.max(0, Math.round(amount));
  while ((og.level || 1) < MAX_GUILD_LEVEL && og.xp >= (og.level || 1) * 60) {
    og.xp -= (og.level || 1) * 60;
    og.level = (og.level || 1) + 1;
    og.rooms = (og.rooms || 2) + 2;
    cue(game, 'levelUp');
    notify(game, '🏰 ' + (og.name || 'Your Guild') + ' reached Lv. ' + og.level + '! Rooms & roster cap expanded!', '#ffd23f');
  }
  return og.level || 1;
}

/** Resolves all due guild expeditions, granting Lexis, items, guild XP, and occasional injuries. */
export function resolveOwnGuildMissions(game) {
  const og = ensureIsekaiTodo(game).ownGuild;
  if (!og.founded || !Array.isArray(og.members)) return [];
  const today = game.day || 1;
  const resolved = [];

  for (const member of og.members) {
    if (member.injuredUntilDay && today >= member.injuredUntilDay) {
      member.injuredUntilDay = 0;
    }
    if (member.status !== 'mission' || today < (member.returnDay || 0)) continue;

    const lv = og.level || 1;
    const lexis = Math.round((35 + Math.random() * 55) * lv);
    const itemId = MISSION_LOOT[Math.floor(Math.random() * MISSION_LOOT.length)];
    const injured = Math.random() < 0.18;

    if (typeof game.player.lexis !== 'number') game.player.lexis = 0;
    earnLexis(game, lexis);
    addItem(game.player, itemId, 1);

    member.status = 'idle';
    member.returnDay = 0;
    member.injuredUntilDay = injured ? today + 1 : 0;
    member.reward = { lexis, itemId, injured };

    gainOwnGuildXp(game, 25 + Math.floor((member.power || 12) / 2));
    notify(
      game,
      '🏰 ' + member.name + ' returned: +' + lexis + ' Lexis & ' + (ITEMS[itemId]?.name || itemId) + (injured ? ' (minor injury: rests 1d)' : '') + '!',
      '#7cfc9a'
    );
    resolved.push({ memberId: member.id, name: member.name, lexis, itemId, injured });
  }

  return resolved;
}

/** Upgrades the player's own guild hall (Lv 1 -> 5) for `120 * level` Lexis, adding +2 rooms. */
export function upgradeOwnGuildHall(game) {
  const og = ensureIsekaiTodo(game).ownGuild;
  if (!og.founded) return false;
  const lv = og.level || 1;
  if (lv >= MAX_GUILD_LEVEL) return false;
  const cost = 120 * lv;
  if ((game.player?.lexis || 0) < cost) return false;
  game.player.lexis -= cost;
  og.level = lv + 1;
  og.rooms = (og.rooms || 2) + 2;
  cue(game, 'levelUp');
  notify(
    game,
    '🏰 Upgraded ' + (og.name || 'Guild Hall') + ' to Lv. ' + og.level + ' (' + og.rooms + ' rooms, cap ' + ownGuildCap(game) + ')!',
    '#ffd23f'
  );
  return true;
}
