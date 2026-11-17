import { ITEMS } from '../../data/items';
import { NPCS } from '../../data/npcs';
import {
  CASTE_TIERS,
  APPRAISAL_TITLES,
  FACTIONS,
  GODDESS_SHRINES,
  FORMATIONS,
  TAVERN_SPECIALS,
  WORKSTATIONS_DATA,
} from '../../data/realism';
import { CURRENCIES } from '../../data/realism';
import { ensureRealism, isTierEnabled, isTempleDay } from './state';
import { launchDocumentReadingDuel, learnEarthRecipeFromCook } from './englishWorld';
import { addItem, removeItem, countItem, heal, earnLexis, gainXp } from '../player';
import { addFriendship } from '../village';
import { notify, say } from '../messages';
import { cue } from '../cues';

// Social Caste, Appraisal Titles, Political Factions, NPC Memory, Promises, Funerals,
// Jealousy, Shrines, Taverns, Companion Needs, Workstations, Lost Bag Recovery & Codex (Parts 13, 15, 16).

export function currentFormation(game) {
  const id = ensureRealism(game).combatRealism?.formation || 'midguard';
  return FORMATIONS[id] || FORMATIONS.midguard;
}

export function setCombatFormation(game, formationId) {
  if (!FORMATIONS[formationId]) return false;
  ensureRealism(game).combatRealism.formation = formationId;
  notify(game, `${FORMATIONS[formationId].icon} Party stance: ${FORMATIONS[formationId].name} (${FORMATIONS[formationId].desc})`, '#9fd8ff');
  return true;
}

export function addFactionFavor(game, factionId, delta) {
  if (!FACTIONS[factionId]) return 0;
  const r = ensureRealism(game);
  const next = Math.max(-50, Math.min(100, (r.social.factions[factionId] || 0) + delta));
  r.social.factions[factionId] = next;
  return next;
}

export function computeCasteTier(game) {
  const r = ensureRealism(game);
  const rankOrder = ['F', 'E', 'D', 'C', 'B', 'A', 'S'];
  const rankIdx = Math.max(0, rankOrder.indexOf(game.guild?.rank || 'F'));
  const rep = game.kingdoms?.rep?.lexia || 0;
  const wealth = (game.player?.lexis || 0) + (r.bank?.balance || 0);
  let matched = CASTE_TIERS[0];
  for (const tier of CASTE_TIERS) {
    if (rep >= tier.minRep && rankIdx >= tier.minRankIdx && wealth >= tier.minWealth) {
      matched = tier;
    }
  }
  r.social.caste = matched.id;
  return matched;
}

export function checkPalaceCourtEtiquette(game) {
  const r = ensureRealism(game);
  if (!isTierEnabled(game, 'C')) return { ok: true };
  if ((r.health.cleanliness ?? 90) < 40) {
    return {
      ok: false,
      reason: '🧼 Palace Guards: "You reek of swamp mud! Bathe at an Inn or scrub with Botanical Soap before entering court."',
    };
  }
  return { ok: true };
}

export function evaluateUnlockedTitles(game) {
  const r = ensureRealism(game);
  const unlocked = r.social.unlockedTitles;
  const tryUnlock = (id) => {
    if (!unlocked.includes(id)) {
      unlocked.push(id);
      const t = APPRAISAL_TITLES.find((x) => x.id === id);
      if (t) notify(game, `🏅 Earned Appraisal Title: ${t.icon} "${t.name}"!`, '#ffd23f');
    }
  };
  if ((game.counts?.kills || 0) >= 15) tryUnlock('goblinBane');
  if ((r.health?.cleanliness || 0) >= 95 && (r.codex?.bathsTaken || 0) >= 1) tryUnlock('cleanBlade');
  if (Object.keys(r.patents?.royalties || {}).length >= 1) tryUnlock('masterChef');
  if ((game.counts?.correct || 0) >= 100) tryUnlock('sageOfLexis');
  if ((r.bank?.balance || 0) >= 1000) tryUnlock('merchantPrince');
  if ((r.skills?.trapDisarms || 0) + (r.skills?.lockpicks || 0) >= 2) tryUnlock('shadowDisarmer');
  if ((r.manaTrain?.bonusMaxMp || 0) >= 3) tryUnlock('obsidianWhisperer');
  if ((r.health?.scars || []).length >= 1) tryUnlock('ironSkin');
  if ((r.skills?.flayerLevel || 1) >= 2) tryUnlock('beastFlayer');
}

export function equipAppraisalTitle(game, titleId) {
  const r = ensureRealism(game);
  if (!r.social.unlockedTitles.includes(titleId)) return false;
  r.social.activeTitle = titleId;
  const info = APPRAISAL_TITLES.find((t) => t.id === titleId);
  if (info) notify(game, `🎖️ Active Title set: ${info.icon} ${info.name}`, '#ffd23f');
  return true;
}

export function activeTitleBonus(game) {
  const id = ensureRealism(game).social.activeTitle || 'newcomer';
  return APPRAISAL_TITLES.find((t) => t.id === id)?.bonus || {};
}

// NPC Memory (last 3 events per NPC) + Promise tracking + Jealousy
export function rememberNpcInteraction(game, npcId, note) {
  if (!npcId) return;
  const r = ensureRealism(game);
  if (!r.social.npcMemories[npcId]) r.social.npcMemories[npcId] = [];
  const log = r.social.npcMemories[npcId];
  log.push({ day: game.day || 1, note });
  if (log.length > 3) log.shift();
}

export function recallNpcMemoryLine(game, npcId) {
  const log = ensureRealism(game).social.npcMemories?.[npcId];
  if (!log || log.length === 0) return null;
  return log[log.length - 1].note;
}

export function recordQuestPromise(game, questId, npcId, limitDays = 5) {
  const r = ensureRealism(game);
  r.social.promisedQuests[questId] = { npcId, dueDay: (game.day || 1) + limitDays };
}

export function resolveQuestPromise(game, questId) {
  const r = ensureRealism(game);
  const entry = r.social.promisedQuests[questId];
  if (entry) {
    rememberNpcInteraction(game, entry.npcId, 'Kept your word & delivered quest help.');
    delete r.social.promisedQuests[questId];
  }
}

export function triggerJealousyCheck(game, targetNpcId) {
  if (!isTierEnabled(game, 'C')) return;
  const target = NPCS.find((n) => n.id === targetNpcId);
  if (!target?.at) return;
  const village = target.at[0];
  const others = NPCS.filter((n) => n.id !== targetNpcId && n.at?.[0] === village && game.npcs?.[n.id]?.dating);
  if (others.length > 0) {
    addFriendship(game, others[0].id, -15);
    rememberNpcInteraction(game, others[0].id, 'Saw you flirting across town...');
    notify(game, `💔 ${others[0].name} heard you courted ${target.name} too! (-15 Friendship)`, '#ff8a95');
  }
}

// Permanent Death Funeral Service & Memorial Stone (REALISM.txt Part 13 A)
export function recordNpcFuneral(game, npcName) {
  const r = ensureRealism(game);
  r.social.memorial.push({ name: npcName, day: game.day || 1 });
  r.health.morale = Math.max(0, (r.health.morale ?? 80) - 18);
}

export function holdChurchMemorialEulogy(game) {
  const r = ensureRealism(game);
  if (r.social.memorial.length === 0) {
    say(game, null, ['The village memorial stone stands quiet — all townsfolk endure for now.']);
    return;
  }
  const latest = r.social.memorial[r.social.memorial.length - 1];
  launchDocumentReadingDuel(game, {
    title: `Eulogy for ${latest.name}`,
    speakerName: 'Village Priest',
    customText: `FUNERAL NOTICE — ELDERMOOR CHAPEL\nToday our parish mourns ${latest.name} (fallen Day ${latest.day}). Neighbors have placed lanterns on their doorstep and closed nearby stalls until dusk to honor their courage.`,
    customQuestion: {
      question: 'Why are nearby village stalls closed until dusk?',
      answers: [
        'To honor the fallen parishioner during mourning.',
        'Because flour shipments ran out.',
        'For Tax Day inspections.',
        'Due to flooding on the beach.',
      ],
      correct_index: 0,
      justification: 'Nearby stalls are closed until dusk to honor the fallen parishioner.',
    },
    onPass: () => {
      r.health.morale = Math.min(100, (r.health.morale ?? 80) + 18);
      gainXp(game, 25);
      notify(game, `🕯️ Attended funeral eulogy for ${latest.name} (+18 Morale, +25 XP).`, '#ffe680');
    },
  });
}

// Goddess Shrines (24h blessing; stronger on Temple Day Sun!)
export function prayAtGoddessShrine(game, shrineId) {
  const shrine = GODDESS_SHRINES.find((s) => s.id === shrineId);
  if (!shrine) return false;
  if ((game.player.lexis || 0) < shrine.cost) {
    notify(game, `🛐 ${shrine.name} offering requires ${shrine.cost} Lexis.`, '#ffb070');
    return false;
  }
  game.player.lexis -= shrine.cost;
  const r = ensureRealism(game);
  const bonusDays = isTempleDay(game.day || 1) ? 2 : 1;
  r.world.shrineBlessing = { id: shrine.id, untilDay: (game.day || 1) + bonusDays };
  cue(game, 'levelUp');
  notify(game, `${shrine.icon} ${shrine.name} blessed you (${shrine.desc})!`, '#ffd23f');
  return true;
}

export function activeShrineBlessing(game) {
  const b = ensureRealism(game).world.shrineBlessing;
  if (!b?.id || (game.day || 1) > (b.untilDay || 0)) return null;
  return GODDESS_SHRINES.find((s) => s.id === b.id) || null;
}

// Regional Tavern Specials
export function orderTavernSpecial(game, kingdomId = 'lexia') {
  const spec = TAVERN_SPECIALS[kingdomId] || TAVERN_SPECIALS.lexia;
  if ((game.player.lexis || 0) < spec.price) {
    notify(game, `🍽️ ${spec.name} costs ${spec.price} Lexis.`, '#ffb070');
    return false;
  }
  game.player.lexis -= spec.price;
  game.player.hunger = Math.min(100, (game.player.hunger || 0) + (spec.food || 50));
  if (spec.water) game.player.thirst = Math.min(100, (game.player.thirst || 0) + spec.water);
  heal(game.player, spec.heal || 35, game);
  const r = ensureRealism(game);
  r.health.morale = Math.min(100, (r.health.morale ?? 80) + (spec.morale || 14));
  if (!r.world.tavernSampled.includes(spec.id)) {
    r.world.tavernSampled.push(spec.id);
    learnEarthRecipeFromCook(game, spec.id);
  }
  cue(game, 'coin');
  notify(game, `🍖 Savored ${spec.name}! (+${spec.morale} Morale, +${spec.food} Food)`, '#ffd23f');
  return true;
}

// Companion Mood & Wedding Gifts to Home Chest
export function deliverWeddingGiftsToChest(game) {
  const r = ensureRealism(game);
  if (!game.player?.spouse || r.social.weddingGiftsClaimed) return false;
  r.social.weddingGiftsClaimed = true;
  if (!game.home) game.home = { furniture: [], wall: 0, bed: 0, storage: {} };
  if (!game.home.storage) game.home.storage = {};
  const presents = { silverBrooch: 1, silkBolt: 1, honey: 2, champagne: 0 };
  for (const [id, qty] of Object.entries(presents)) {
    if (qty > 0 && ITEMS[id]) game.home.storage[id] = (game.home.storage[id] || 0) + qty;
  }
  earnLexis(game, 100);
  notify(game, '💒 Wedding gifts from neighbors placed into your Home Chest (+100 Lexis)!', '#ffd23f');
  return true;
}

export function stepCompanionsAndPromisesDaily(game) {
  const r = ensureRealism(game);
  const day = game.day || 1;
  // Check expired promises
  for (const [qId, p] of Object.entries(r.social.promisedQuests || {})) {
    if (day > p.dueDay) {
      addFriendship(game, p.npcId, -8);
      rememberNpcInteraction(game, p.npcId, 'Missed deadline on promised help.');
      notify(game, `😔 You missed your promise deadline for ${NPCS.find((n) => n.id === p.npcId)?.name || p.npcId} (−8 Friendship).`, '#ffb070');
      delete r.social.promisedQuests[qId];
    }
  }
  // Hardcore unhappy companion attrition
  if (isTierEnabled(game, 'C')) {
    for (const id of [...(game.player?.party || [])]) {
      const mood = r.social.companionMood[id] ?? 75;
      if (mood <= 15) {
        game.player.party = game.player.party.filter((x) => x !== id);
        notify(game, `🚪 ${(NPCS.find((n) => n.id === id)?.name || id)} left the party due to poor treatment.`, '#ff6060');
      }
    }
  }
}

// Home Craft Workstations (Drying Rack, Ice-Box, Study Shelf, Alchemy Still)
export function installHomeWorkstation(game, stationId) {
  if (!WORKSTATIONS_DATA[stationId] || countItem(game.player, stationId) <= 0) return false;
  const r = ensureRealism(game);
  if (r.workstations[stationId]) {
    notify(game, '🏠 Already installed ' + WORKSTATIONS_DATA[stationId].name + ' in your Home.', '#9fd8ff');
    return false;
  }
  removeItem(game.player, stationId, 1);
  r.workstations[stationId] = true;
  cue(game, 'build');
  notify(game, `🛠️ Installed ${WORKSTATIONS_DATA[stationId].name} at home!`, '#7cfc9a');
  return true;
}

export function startDryingRackJob(game) {
  const r = ensureRealism(game);
  if (!r.workstations.dryingRack) return false;
  if (r.workstations.dryingJob) {
    notify(game, '🥓 Drying rack is already curing jerky until tomorrow.', '#ffb070');
    return false;
  }
  const src = countItem(game.player, 'rawMeat') > 0 ? 'rawMeat' : countItem(game.player, 'rawFish') > 0 ? 'rawFish' : null;
  if (!src) {
    notify(game, '🥓 Need Raw Meat or Fresh Fish to hang on the Drying Rack.', '#ffb070');
    return false;
  }
  const qty = Math.min(3, countItem(game.player, src));
  removeItem(game.player, src, qty);
  r.workstations.dryingJob = { qty, doneDay: (game.day || 1) + 1 };
  notify(game, `🪵 Hung ×${qty} ${ITEMS[src].name} on Drying Rack — ready tomorrow!`, '#7cfc9a');
  return true;
}

export function studyAtHomeDesk(game) {
  const r = ensureRealism(game);
  if (!r.workstations.studyShelf) return false;
  if (r.workstations.studyBuffDay === (game.day || 1)) {
    notify(game, '📚 You already gained today’s +15% Study Buff.', '#9fd8ff');
    return false;
  }
  r.workstations.studyBuffDay = (game.day || 1);
  gainXp(game, 15);
  cue(game, 'levelUp');
  notify(game, '📚 Reviewed TOEIC notes at your Reference Desk (+15 XP, +15% reading XP today)!', '#d8b4f8');
  return true;
}

// Knocked Out Partial Bag Drop + 3-Day Recovery & Old Death Grave (REALISM.txt Part 16)
export function onHeroKnockOutDropBag(game) {
  const r = ensureRealism(game);
  if (r.social.insuranceUntilDay >= (game.day || 1)) {
    notify(game, '🛡️ Guild Extraction Insurance protected your pockets & bag!', '#7cfc9a');
    return;
  }
  const dropped = {};
  for (const [id, qty] of Object.entries(game.player?.bag || {})) {
    const kind = ITEMS[id]?.kind;
    if (qty > 0 && ['goods', 'material', 'food'].includes(kind)) {
      const dropQty = Math.max(1, Math.floor(qty * 0.5));
      removeItem(game.player, id, dropQty);
      dropped[id] = dropQty;
    }
  }
  if (Object.keys(dropped).length > 0) {
    r.world.lastDeathPos = { x: Math.round(game.player.x), y: Math.round(game.player.y) };
    r.world.lastDeathBag = dropped;
    r.world.lastDeathDay = (game.day || 1);
    notify(game, '🎒 Half of your non-gear supplies fell where you fell! Reclaim within 3 days.', '#ffb070');
  }
}

export function tryRecoverLostBag(game) {
  const r = ensureRealism(game);
  const pos = r.world.lastDeathPos;
  if (!pos || !r.world.lastDeathBag) return false;
  if ((game.day || 1) - (r.world.lastDeathDay || 1) > 3) {
    r.world.lastDeathPos = null;
    r.world.lastDeathBag = null;
    notify(game, '💨 Scavengers carried off your lost pack after 3 days.', '#ff8a95');
    return false;
  }
  for (const [id, qty] of Object.entries(r.world.lastDeathBag)) addItem(game.player, id, qty);
  r.world.lastDeathPos = null;
  r.world.lastDeathBag = null;
  cue(game, 'chest');
  notify(game, '🎒 Recovered all dropped supplies from where you fell!', '#7cfc9a');
  return true;
}

// Codex Snapshot for CodexPanel.jsx (REALISM.txt Part 15)
export function buildCodexSnapshot(game) {
  const r = ensureRealism(game);
  const caste = computeCasteTier(game);
  const titleObj = APPRAISAL_TITLES.find((t) => t.id === (r.social.activeTitle || 'newcomer')) || APPRAISAL_TITLES[0];
  return {
    mode: r.mode || 'normal',
    caste,
    activeTitle: titleObj,
    unlockedTitles: APPRAISAL_TITLES.filter((t) => r.social.unlockedTitles.includes(t.id)),
    factions: FACTIONS,
    factionScores: r.social.factions,
    blessing: activeShrineBlessing(game),
    formation: currentFormation(game),
    formations: Object.values(FORMATIONS),
    heirloom: r.combatRealism.heirloom,
    quality: r.combatRealism.quality,
    workstations: WORKSTATIONS_DATA,
    ownedWorkstations: r.workstations,
    bank: r.bank,
    debt: r.debt,
    currencies: CURRENCIES,
    wallet: r.currencies,
    fxRates: r.fxRates,
    royalties: r.patents.royalties,
    monstersCodex: r.codex.monsters,
    recipes: r.codex.recipes,
    news: r.world.news,
    notices: r.world.boardNotices,
    inbox: r.social.inbox,
    marketBoom: r.world.marketBoom,
    surveyedPct: r.world.surveyedPct || 0,
    ecosystem: r.world.ecosystem,
    cairns: r.world.trailCairns.length,
    health: r.health,
    skills: r.skills,
    manaTrain: r.manaTrain,
    crimes: r.codex.crimes || 0,
    fines: r.fines.total || 0,
  };
}
