import { ITEMS } from '../../data/items';
import { zoneAt } from '../../data/zones';
import { ensureRealism, isTierEnabled } from './state';
import { isOutdoors, isRaining, isCold, cureCold } from '../weather';
import { addItem, removeItem, countItem, heal, maxMana, restoreMana } from '../player';
import { notify } from '../messages';
import { cue } from '../cues';
import { burst, floatText } from '../particles';

// Body, Wounds, Sickness, Hygiene, Morale & Sleep Realism (REALISM.txt Parts 4, 5 & r2).
// Golden Rules enforced:
// - Never interrupts during an active TOEIC fight question.
// - Every condition warns clearly with an attainable cure (clinic, soap, poultice, bed).
// - Respects options.realismLevel ('light' | 'normal' | 'hardcore').

const CLAW_OR_BLADE_SPECIES = new Set([
  'wolf', 'goblin', 'skeleton', 'rat', 'orc', 'drake', 'harpy',
  'demonSoldier', 'abyssHound', 'darkKnight', 'demonKing', 'demonQueen',
]);

export function triggerSprain(game, hours = 12) {
  if (!isTierEnabled(game, 'A')) return false;
  const r = ensureRealism(game);
  if (r.health.sprainHours > 0) return false;
  r.health.sprainHours = hours;
  notify(game, '🩹 Ankle Sprain! Walk -30% speed, no sprint (' + hours + 'h). Use Herbal Poultice or rest in a bed.', '#ff9a7a');
  return true;
}

export function triggerCut(game) {
  if (!isTierEnabled(game, 'A')) return false;
  const r = ensureRealism(game);
  if (r.health.cutHours > 0 || r.health.infectionHours > 0) return false;
  r.health.cutHours = 6;
  notify(game, '🩸 Deep Cut! Clean up or bathe within 6h to stop it turning into an infection.', '#ffb070');
  return true;
}

export function triggerBrokenBone(game, limb = 'leg') {
  if (!isTierEnabled(game, 'B')) return false;
  const r = ensureRealism(game);
  if (limb === 'arm') {
    r.health.brokenArmHours = Math.max(r.health.brokenArmHours || 0, 72);
    notify(game, '🦴 Fractured Arm! Weapon strikes weakened — see Aria at the clinic for a splint!', '#ff5a6e');
  } else {
    r.health.brokenLegHours = Math.max(r.health.brokenLegHours || 0, 72);
    notify(game, '🦴 Fractured Leg! Cannot run for 3 days until splinted by Aria.', '#ff5a6e');
  }
  if (!r.health.scars.includes(limb + ' scar')) r.health.scars.push(limb + ' scar');
  return true;
}

export function onMonsterHitBody(game, monster, damageTaken, isCrit = false) {
  if (damageTaken <= 0 || monster?.duel) return;
  const r = ensureRealism(game);
  const h = r.health;
  // Cleanliness drops after blows (blood / dirt)
  if (isTierEnabled(game, 'C')) h.cleanliness = Math.max(0, h.cleanliness - 3);
  const lowHygiene = isTierEnabled(game, 'C') && h.cleanliness < 35;

  // 25% sprain on critical monster hit
  if (isTierEnabled(game, 'A') && isCrit && Math.random() < 0.25) {
    triggerSprain(game, 12);
  }
  // 15% cut on claw/blade hit (+higher when filthy)
  if (isTierEnabled(game, 'A') && CLAW_OR_BLADE_SPECIES.has(monster?.species || '') && Math.random() < (lowHygiene ? 0.28 : 0.15)) {
    triggerCut(game);
  }
  // Boss hit when HP < 20% can fracture bone (Priority B)
  if (isTierEnabled(game, 'B') && monster?.boss && (game.player.health || 0) < 35 && Math.random() < 0.35) {
    triggerBrokenBone(game, Math.random() < 0.5 ? 'arm' : 'leg');
  }
}

export function registerPotionDose(game) {
  if (!isTierEnabled(game, 'A')) return { ratio: 1, sick: false };
  const r = ensureRealism(game);
  const h = r.health;
  h.potionCount6h = (h.potionCount6h || 0) + 1;
  h.potionCooldownHours = 6;
  if (h.potionCount6h > 3) {
    const foodLoss = Math.min(game.player.hunger || 0, 6);
    game.player.hunger = Math.max(0, (game.player.hunger || 0) - foodLoss);
    notify(game, '🤢 Potion Sickness! Over 3 doses in 6h: -50% healing & nausea. Drink Honey-Lemon Elixir or rest.', '#ff8a95');
    return { ratio: 0.5, sick: true };
  }
  return { ratio: 1, sick: false };
}

export function triggerDysentery(game, hours = 24) {
  if (!isTierEnabled(game, 'B')) return false;
  const r = ensureRealism(game);
  r.health.dysenteryHours = Math.max(r.health.dysenteryHours || 0, hours);
  notify(game, '🤢 Food Poisoning / Dysentery (24h)! Thirst drains 2× faster. Drink Honey-Lemon Elixir!', '#ff8a95');
  return true;
}

export function cleanseAndWash(game, source = 'soap') {
  const r = ensureRealism(game);
  r.health.cleanliness = 100;
  if (r.health.cutHours > 0) {
    r.health.cutHours = 0;
    notify(game, '🧼 Cleaned fresh cuts in time — no infection!', '#7cfc9a');
  }
  if (source === 'soap') {
    r.health.morale = Math.min(100, (r.health.morale || 80) + 8);
    cue(game, 'coin');
    notify(game, '🧼 Washed clean with Botanical Soap (+100% Cleanliness, +8 Morale).', '#9fd8ff');
  } else if (source === 'innBath') {
    r.codex.bathsTaken = (r.codex.bathsTaken || 0) + 1;
    r.health.morale = Math.min(100, (r.health.morale || 80) + 15);
    heal(game.player, 18, game);
    notify(game, '🛁 Hot Inn Bath! 100% Cleanliness, +15 Morale, +18 HP.', '#9fd8ff');
  }
}

export function useSoapItem(game) {
  if (countItem(game.player, 'soap') <= 0) return false;
  removeItem(game.player, 'soap', 1);
  cleanseAndWash(game, 'soap');
  return true;
}

export function useOilWaxItem(game) {
  if (countItem(game.player, 'oilWax') <= 0) return false;
  removeItem(game.player, 'oilWax', 1);
  const r = ensureRealism(game);
  r.health.waterproofHours = 48;
  cue(game, 'coin');
  notify(game, '🪔 Gear coated with Waterproof Oil-Wax! Shields from rain & iron rust for 48h.', '#ffd23f');
  return true;
}

export function treatWithMedicalItem(game, itemId) {
  const r = ensureRealism(game);
  const h = r.health;
  const item = ITEMS[itemId];
  if (!item || countItem(game.player, itemId) <= 0) return false;

  if (item.curesSprain && h.sprainHours > 0) {
    removeItem(game.player, itemId, 1);
    h.sprainHours = 0;
    heal(game.player, item.heal || 25, game);
    cue(game, 'levelUp');
    notify(game, '🌿 Herbal Poultice healed your sprained ankle (+25 HP)!', '#7cfc9a');
    return true;
  }
  if (item.curesInfection && (h.infectionHours > 0 || h.cutHours > 0)) {
    removeItem(game.player, itemId, 1);
    h.infectionHours = 0;
    h.cutHours = 0;
    heal(game.player, item.heal || 20, game);
    cue(game, 'levelUp');
    notify(game, '🧪 Clinic Antiseptic sterilized the wound — infection cured!', '#7cfc9a');
    return true;
  }
  if (item.curesDysentery || item.curesSickness) {
    removeItem(game.player, itemId, 1);
    h.dysenteryHours = 0;
    h.potionCount6h = 0;
    h.potionCooldownHours = 0;
    game.player.thirst = Math.min(100, (game.player.thirst || 0) + (item.water || 40));
    heal(game.player, item.heal || 20, game);
    cue(game, 'levelUp');
    notify(game, '🍋 Honey-Lemon Elixir soothed your stomach & reset potion tolerance!', '#7cfc9a');
    return true;
  }
  return false;
}

export function healAtClinicRealism(game) {
  const r = ensureRealism(game);
  const h = r.health;
  const cured = [];
  if (h.cutHours > 0 || h.infectionHours > 0) cured.push('wound infection');
  if (h.sprainHours > 0) cured.push('sprain');
  if (h.dysenteryHours > 0) cured.push('dysentery');
  if (h.brokenArmHours > 0 || h.brokenLegHours > 0) {
    const hasSage = (game.player.classes || []).includes('sage') || game.player.level >= 8;
    if (hasSage) {
      h.brokenArmHours = 0;
      h.brokenLegHours = 0;
    } else {
      h.brokenArmHours = Math.min(h.brokenArmHours || 0, 24);
      h.brokenLegHours = Math.min(h.brokenLegHours || 0, 24);
    }
    cured.push('bone splint set');
  }
  h.cutHours = 0;
  h.infectionHours = 0;
  h.sprainHours = 0;
  h.dysenteryHours = 0;
  h.potionCount6h = 0;
  h.potionCooldownHours = 0;
  h.hypothermia = false;
  h.heatstroke = false;
  return cured;
}

export function changeMorale(game, delta, reason = null) {
  if (!isTierEnabled(game, 'C')) return 80;
  const r = ensureRealism(game);
  r.health.morale = Math.max(0, Math.min(100, Math.round((r.health.morale ?? 80) + delta)));
  if (reason) notify(game, (delta >= 0 ? '☀️ ' : '🌧️ ') + reason + ` (${delta >= 0 ? '+' : ''}${delta} Morale)`, delta >= 0 ? '#7cfc9a' : '#ffb070');
  return r.health.morale;
}

export function singCampfireSong(game) {
  const r = ensureRealism(game);
  r.health.morale = Math.min(100, (r.health.morale ?? 80) + 20);
  for (const id of game.player?.party || []) {
    r.social.companionMood[id] = Math.min(100, (r.social.companionMood[id] ?? 75) + 15);
  }
  restoreMana(game.player, 2);
  burst(game, game.player.x, game.player.y - 0.5, '#ffd23f', 12);
  cue(game, 'coin');
  notify(game, '🎵 Shared a song around the campfire! (+20 Morale, +2 MP)', '#ffd23f');
}

// Sleep Quality by Shelter Type (REALISM.txt Part 5 A & B)
export function applySleepQualityRecovery(game, shelterType = 'ground') {
  const r = ensureRealism(game);
  const h = r.health;
  const wetOutdoor = isOutdoors(game) && isRaining(game) && countItem(game.player, 'tentKit') === 0;
  let comfort = 0.5;
  let restedHours = 0;
  if (shelterType === 'home') {
    comfort = 1.0;
    restedHours = 8;
  } else if (shelterType === 'inn') {
    comfort = 0.9;
    restedHours = 6;
  } else if (shelterType === 'tent' || countItem(game.player, 'tentKit') > 0) {
    comfort = 0.8;
    restedHours = 4;
  } else if (wetOutdoor) {
    comfort = 0.2;
  }

  if (h.sprainHours > 0 && (shelterType === 'home' || shelterType === 'inn')) {
    h.sprainHours = Math.max(0, Math.floor(h.sprainHours * 0.5));
  }
  if (restedHours > 0) {
    h.wellRestedHours = Math.max(h.wellRestedHours || 0, restedHours);
  }
  if (shelterType === 'ground' && isTierEnabled(game, 'C')) changeMorale(game, -4);
  if (shelterType === 'home' || shelterType === 'inn') {
    if (isTierEnabled(game, 'C')) h.morale = Math.min(100, (h.morale ?? 80) + 8);
  }
  if (wetOutdoor) notify(game, '🌧️ Sleeping in rain without a Tent drenched you! Carry a Waxed Field Tent.', '#ff8a95');
  return { comfort, restedHours };
}

export function stepBodyAndClimateHourly(game, hours, allowLethal = true) {
  const r = ensureRealism(game);
  const h = r.health;
  const player = game.player;

  if (h.potionCooldownHours > 0) {
    h.potionCooldownHours = Math.max(0, h.potionCooldownHours - hours);
    if (h.potionCooldownHours === 0) h.potionCount6h = 0;
  }
  if (h.waterproofHours > 0) h.waterproofHours = Math.max(0, h.waterproofHours - hours);
  if (h.repellentHours > 0) h.repellentHours = Math.max(0, h.repellentHours - hours);
  if (h.wellRestedHours > 0) h.wellRestedHours = Math.max(0, h.wellRestedHours - hours);
  if (h.sprainHours > 0) h.sprainHours = Math.max(0, h.sprainHours - hours);
  if (h.brokenArmHours > 0) h.brokenArmHours = Math.max(0, h.brokenArmHours - hours);
  if (h.brokenLegHours > 0) h.brokenLegHours = Math.max(0, h.brokenLegHours - hours);
  if (h.dysenteryHours > 0) {
    h.dysenteryHours = Math.max(0, h.dysenteryHours - hours);
    if (isTierEnabled(game, 'B')) {
      player.thirst = Math.max(0, (player.thirst || 0) - 2.5 * hours);
      player.fatigue = Math.min(100, (player.fatigue || 0) + 1.0 * hours);
    }
  }

  // Light mode: auto-heals wounds without ticking down infection/exposure
  if (!isTierEnabled(game, 'A')) {
    h.cutHours = 0;
    h.infectionHours = 0;
    h.hypothermia = false;
    h.heatstroke = false;
    return;
  }

  // Untreated cut turns into Infection after 6 hours
  if (h.cutHours > 0) {
    h.cutHours = Math.max(0, h.cutHours - hours);
    if (h.cutHours === 0 && h.infectionHours === 0) {
      h.infectionHours = 24;
      notify(game, '🤒 Your untreated cut became INFECTED! -1 HP/h, -20% Max HP. See Aria or use Antiseptic.', '#ff5a6e');
    }
  }
  if (h.infectionHours > 0) {
    h.infectionHours = Math.max(0, h.infectionHours - hours);
    const dmg = Math.floor(hours);
    if (dmg >= 1) {
      const floorHp = allowLethal ? 1 : 5;
      player.health = Math.max(floorHp, Math.round((player.health || 10) - dmg));
    }
  }

  // Cleanliness drifts slowly outdoors in Hardcore mode
  if (isTierEnabled(game, 'C') && isOutdoors(game)) {
    h.cleanliness = Math.max(0, h.cleanliness - 0.25 * hours);
  }

  // Climate extremes in Hardcore mode outside starting Eldermoor sanctuary
  const zone = zoneAt(player.x, player.y);
  const inStarterVillage = zone.id === 'lexia' || zone.kind === 'inside';
  if (isTierEnabled(game, 'C') && !inStarterVillage && isOutdoors(game)) {
    const hasWarmth = player.accessory === 'wolfCloak' || h.waterproofHours > 0;
    if ((zone.kingdom === 'frosthold' || zone.biome === 'mountain') && isCold(game) && !hasWarmth) {
      if (!h.hypothermia) notify(game, '🥶 Freezing hypothermia! Wear a Fur Cloak or coat gear with Oil-Wax.', '#9fd8ff');
      h.hypothermia = true;
    } else {
      h.hypothermia = false;
    }

    const daytime = (game.hour || 12) >= 11 && (game.hour || 12) <= 16;
    const hasHood = player.accessory === 'hoodedCloak' || player.boots === 'windBoots';
    if ((zone.kingdom === 'kharsa' || zone.biome === 'desert') && daytime && (player.thirst || 0) < 45 && !hasHood) {
      if (!h.heatstroke) notify(game, '🥵 Desert heatstroke! Drink water or equip a Disguise Hood.', '#ffb070');
      h.heatstroke = true;
      player.thirst = Math.max(0, (player.thirst || 0) - 1.5 * hours);
    } else {
      h.heatstroke = false;
    }
  } else {
    h.hypothermia = false;
    h.heatstroke = false;
  }
}

export function bodySpeedMultiplier(game) {
  const r = ensureRealism(game);
  const h = r.health;
  let mult = 1.0;
  if (isTierEnabled(game, 'A') && h.sprainHours > 0) mult *= 0.7;
  if (isTierEnabled(game, 'C') && (h.hypothermia || h.heatstroke)) mult *= 0.85;
  return mult;
}

export function bodyMaxHpMultiplier(game) {
  const r = ensureRealism(game);
  const bonus = r.health.dietToday?.goodDiet ? 5 : 0;
  const infPenalty = isTierEnabled(game, 'A') && r.health.infectionHours > 0 ? 0.8 : 1.0;
  return { scale: infPenalty, flatBonus: bonus };
}

export function canSprintBody(game) {
  if (!isTierEnabled(game, 'A')) return true;
  const h = ensureRealism(game).health;
  return h.sprainHours <= 0 && h.brokenLegHours <= 0;
}

export function moraleStatBonuses(game) {
  const r = ensureRealism(game);
  const xpMult = r.health.wellRestedHours > 0 ? 1.1 : 1.0;
  const hardcoreBonus = r.mode === 'hardcore' ? 1.2 : 1.0;
  let moraleXp = 1.0;
  let critAdd = 0;
  if (isTierEnabled(game, 'C')) {
    if ((r.health.morale ?? 80) < 40) moraleXp = 0.9;
    if ((r.health.morale ?? 80) >= 85) critAdd = 0.05;
  }
  const wellRestedSec = r.health.wellRestedHours > 0 ? 1 : 0;
  return { xpMult: xpMult * hardcoreBonus * moraleXp, critAdd, wellRestedSec };
}

export function cureEnvironmentalCold(game) {
  cureCold(game);
}

// Suppress unused warning on maxMana if unused externally — wait let's export a small rest-mana helper using it!
export function fullMedicalRest(game) {
  const p = game.player;
  p.mana = Math.min(maxMana(p), p.mana + 2);
  floatText(game, p.x, p.y - 1, '+Rest', '#9fd8ff');
}
