import { ITEMS } from '../../data/items';
import { PERISHABLE_ITEMS, QUALITY_TIERS } from '../../data/realism';
import { VILLAGES, zoneAt } from '../../data/zones';
import { ensureRealism, isTierEnabled, weekdayName, isMarketDay } from './state';
import { seasonOf } from '../clock';
import { isOutdoors, isRaining } from '../weather';
import { addItem, removeItem, countItem, earnLexis, gainXp } from '../player';
import { wearGear, resetSlotDurability } from '../durability';
import { notify } from '../messages';
import { cue } from '../cues';
import { burst } from '../particles';

// Food Spoilage, Preservation, Nutrition Variety, Gear Rust/Quality, Exhaustible Nature,
// Animal Ecology, Trail Cairns, Bait Fishing, Shop Hours & Road Terrain (REALISM.txt Parts 6, 7, 9, 10).

export function stampPerishableAdded(game, itemId) {
  const maxDays = PERISHABLE_ITEMS[itemId];
  if (!maxDays) return;
  const r = ensureRealism(game);
  if (!r.spoilage[itemId]) {
    r.spoilage[itemId] = { daysLeft: maxDays, updatedDay: game.day || 1 };
  }
}

export function stepFoodSpoilageDaily(game) {
  if (!isTierEnabled(game, 'A')) return;
  const r = ensureRealism(game);
  const bag = game.player?.bag || {};
  const storage = game.home?.storage || {};
  const iceMult = r.workstations?.iceBox ? 3.0 : 1.0;

  // Step 1: Daily decay rate per item inside bag vs cooler home storage
  for (const [itemId, shelfDays] of Object.entries(PERISHABLE_ITEMS)) {
    const qtyBag = bag[itemId] || 0;
    const qtyHome = storage[itemId] || 0;
    if (qtyBag <= 0 && qtyHome <= 0) {
      delete r.spoilage[itemId];
      continue;
    }
    if (!r.spoilage[itemId]) r.spoilage[itemId] = { daysLeft: shelfDays, updatedDay: game.day || 1 };
    if ((game.day || 1) <= 3) continue; // safety grace period for new starts/tests

    const meta = r.spoilage[itemId];
    const decayRate = qtyBag > 0 ? 1 / iceMult : 1 / (1.5 * iceMult);
    meta.daysLeft = Math.round((meta.daysLeft - decayRate) * 10) / 10;
    if (meta.daysLeft > 0) continue;

    // Expired food turns into Field Compost for crops instead of vanishing silently!
    if (qtyBag > 0) {
      const spoiled = Math.max(1, Math.ceil(qtyBag * 0.5));
      removeItem(game.player, itemId, spoiled);
      addItem(game.player, 'compost', spoiled);
      notify(game, '🍂 Spoiled ' + ITEMS[itemId].name + ' became ' + spoiled + ' Field Compost (use on farm soil).', '#ffb070');
    }
    meta.daysLeft = shelfDays;
  }

  // Overnight Cedar Drying Rack processing at home
  if (r.workstations?.dryingRack && r.workstations.dryingJob) {
    const job = r.workstations.dryingJob;
    if ((game.day || 1) >= job.doneDay) {
      addItem(game.player, 'smokedJerky', job.qty);
      r.workstations.dryingJob = null;
      notify(game, '🥓 Cedar Drying Rack finished curing ×' + job.qty + ' Smoked Jerky!', '#ffd23f');
    }
  }
}

export function freshnessTag(game, itemId) {
  if (!PERISHABLE_ITEMS[itemId]) return null;
  const r = ensureRealism(game);
  const meta = r.spoilage?.[itemId];
  const left = meta ? meta.daysLeft : PERISHABLE_ITEMS[itemId];
  if (left <= 0) return 'Rotting';
  if (left <= 1) return '1d left!';
  if (left >= PERISHABLE_ITEMS[itemId] - 0.5) return 'Fresh';
  return `${Math.ceil(left)}d`;
}

// Preserves rawMeat or rawFish using Crystal Salt -> everlasting Smoked Jerky
export function saltRawFood(game, itemId = 'rawMeat', qty = 1) {
  if (countItem(game.player, itemId) < qty || countItem(game.player, 'salt') < qty) {
    notify(game, '🧂 Need ' + qty + ' Crystal Salt and ' + qty + ' ' + (ITEMS[itemId]?.name || itemId) + '.', '#ffb070');
    return false;
  }
  removeItem(game.player, itemId, qty);
  removeItem(game.player, 'salt', qty);
  addItem(game.player, 'smokedJerky', qty);
  delete ensureRealism(game).spoilage[itemId];
  cue(game, 'coin');
  notify(game, '🧂 Preserved ×' + qty + ' into Smoked Jerky (never spoils)!', '#7cfc9a');
  return true;
}

// Track nutritional diversity: 3 identical meals in a row -30%; Meat+Veg+Bread in same day = +5 Max HP!
export function evaluateMealNutrition(game, itemId) {
  const r = ensureRealism(game);
  const h = r.health;
  const day = game.day || 1;
  if (h.dietToday.day !== day) {
    h.dietToday = { meat: false, veg: false, bread: false, day: day, goodDiet: false };
  }
  if (['rawMeat', 'roastMeat', 'driedMeat', 'smokedJerky', 'hunterSkewer', 'spicedStew', 'curryRice', 'curryStew', 'karagePlate'].includes(itemId)) {
    h.dietToday.meat = true;
  }
  if (['carrot', 'pumpkin', 'apple', 'pear', 'mushroom', 'herbStew', 'pickledRadish', 'mushroomSoup', 'heartySoup'].includes(itemId)) {
    h.dietToday.veg = true;
  }
  if (['bread', 'honeyPorridge', 'honeyToast', 'ramen', 'omeletteRice', 'travelersFeast'].includes(itemId)) {
    h.dietToday.bread = true;
  }
  if (!h.dietToday.goodDiet && h.dietToday.meat && h.dietToday.veg && h.dietToday.bread) {
    h.dietToday.goodDiet = true;
    notify(game, '🥗 Balanced Diet today! (+5 Max HP bonus)', '#7cfc9a');
  }

  let repeatMult = 1.0;
  if (isTierEnabled(game, 'B')) {
    h.dietRecent = [...(h.dietRecent || []), itemId].slice(-3);
    if (h.dietRecent.length === 3 && h.dietRecent.every((x) => x === itemId)) {
      repeatMult = 0.7;
      notify(game, '😑 You are tired of eating ' + ITEMS[itemId].name + ' three times in a row (−30% fullness).', '#ffb070');
    }
  }
  return repeatMult;
}

// Season farming check (Winter frost requires Greenhouse or blocks outdoor planting unless fertilized)
export function canGrowInSeason(game, fertilized = false) {
  if (!isTierEnabled(game, 'B')) return { ok: true };
  if (seasonOf(game) === 'Winter' && !fertilized) {
    return { ok: false, reason: '❄️ Winter frost freezes unfertilized soil! Mix Field Compost or wait for Spring.' };
  }
  return { ok: true };
}

// Gear Quality, Rain Rust, Sharpen Stone, Boot Step Wear & Heirloom Naming
export function qualityFactorOf(game, slot) {
  const tierId = ensureRealism(game).combatRealism?.quality?.[slot] || 'standard';
  return QUALITY_TIERS[tierId]?.mult || 1.0;
}

export function sharpenWeaponAtForgeOrHome(game) {
  const r = ensureRealism(game);
  r.health.sharpenedDay = game.day || 1;
  cue(game, 'victory');
  notify(game, '🗡️ Honed edge on whetstone (+5% Strike Power all day)!', '#ffd23f');
}

export function temperEquipmentAtForge(game, slot = 'weapon') {
  const r = ensureRealism(game);
  const qMap = r.combatRealism.quality;
  const cur = qMap[slot] || 'standard';
  if (cur === 'masterwork') {
    notify(game, '⚒️ This ' + slot + ' is already Masterwork quality!', '#ffd23f');
    return false;
  }
  const next = cur === 'worn' ? 'standard' : cur === 'standard' ? 'fine' : 'masterwork';
  const needsCore = next === 'masterwork';
  if (needsCore && countItem(game.player, 'elderCore') <= 0 && countItem(game.player, 'crystal') < 2) {
    notify(game, '⚒️ Masterwork tempering requires 1 Elder Core (or 2 Crystals) + 1 Ore + 30 Lexis.', '#ffb070');
    return false;
  }
  if (countItem(game.player, 'ore') < 1 || game.player.lexis < (needsCore ? 30 : 15)) {
    notify(game, '⚒️ Need 1 Ore and ' + (needsCore ? 30 : 15) + ' Lexis to forge-temper.', '#ffb070');
    return false;
  }
  removeItem(game.player, 'ore', 1);
  if (needsCore) {
    if (countItem(game.player, 'elderCore') > 0) removeItem(game.player, 'elderCore', 1);
    else removeItem(game.player, 'crystal', 2);
  }
  game.player.lexis -= needsCore ? 30 : 15;
  qMap[slot] = next;
  resetSlotDurability(game, slot);
  cue(game, 'levelUp');
  notify(game, `⚒️ Re-tempered ${slot} to ${QUALITY_TIERS[next].label} (${Math.round(QUALITY_TIERS[next].mult * 100)}%)!`, '#ffd23f');
  return true;
}

export function stepGearAndStepsHourly(game, hours) {
  if (!isTierEnabled(game, 'B')) return;
  const r = ensureRealism(game);
  // Rain/sea iron rust: armor/weapon loses 2 extra durability over stormy hours unless Oil-Waxed
  if (isOutdoors(game) && isRaining(game) && r.health.waterproofHours <= 0 && hours >= 1) {
    wearGear(game, 'armor', 1);
  }
}

export function trackFootstepsRealism(game, tilesWalked) {
  if (!isTierEnabled(game, 'B') || tilesWalked <= 0) return;
  const r = ensureRealism(game);
  r.health.bootWear = (r.health.bootWear || 0) + tilesWalked;
  if (r.health.bootWear >= 1000) {
    r.health.bootWear -= 1000;
    wearGear(game, 'boots', 1);
  }
}

export function recordWeaponVictory(game) {
  const c = ensureRealism(game).combatRealism;
  c.weaponFights = (c.weaponFights || 0) + 1;
  if (c.weaponFights >= 20 && !c.heirloom) {
    const base = ITEMS[game.player?.weapon]?.name || 'Blade';
    c.heirloom = 'Oathkeeper ' + base;
    notify(game, '🌟 Your weapon reached veteran bonding and became an Heirloom: "' + c.heirloom + '" (+5% DMG)!', '#ffd23f');
  }
}

// Exhaustible world harvest spots (trees 7d, rocks 5d, bushes 3d, fish 2d)
export function spotRecoveryDays(kind) {
  if (['appleTree', 'pearTree', 'cherryTree', 'orangeTree', 'peachTree', 'plumTree', 'lemonTree', 'figTree', 'oliveTree', 'hollowStump', 'mossyLog'].includes(kind)) return 7;
  if (['fishingGear'].includes(kind)) return 2;
  if (['ore', 'crystal', 'flint'].includes(kind)) return 5;
  return 3;
}

export function isResourceDepleted(game, key) {
  if (!isTierEnabled(game, 'A')) return false;
  const untilDay = ensureRealism(game).world.depletedSpots[key];
  return typeof untilDay === 'number' && (game.day || 1) < untilDay;
}

export function markResourceExhausted(game, key, kind) {
  const r = ensureRealism(game);
  const recovery = spotRecoveryDays(kind);
  r.world.depletedSpots[key] = (game.day || 1) + recovery;
  const z = zoneAt(game.player.x, game.player.y);
  if (recovery === 7 && z?.id) {
    r.world.forestCutCount[z.id] = (r.world.forestCutCount[z.id] || 0) + 1;
  }
}

// Ecosystem balance per zone (deer vs wolves tracked in Codex)
export function trackEcosystemKill(game, speciesId) {
  if (!isTierEnabled(game, 'B')) return;
  const z = zoneAt(game.player.x, game.player.y);
  const zid = z?.id || 'wild';
  const r = ensureRealism(game);
  if (!r.world.ecosystem[zid]) r.world.ecosystem[zid] = { wolves: 10, deer: 10, cropDamage: false };
  const eco = r.world.ecosystem[zid];
  if (speciesId === 'wolf') eco.wolves = Math.max(0, eco.wolves - 1);
  if (speciesId === 'deer' || speciesId === 'rabbit') eco.deer = Math.max(0, eco.deer - 1);
  if (eco.wolves <= 3 && !eco.cropDamage) {
    eco.cropDamage = true;
    notify(game, '🦌 Wolves are scarce around ' + (z.name || zid) + ' — hungry deer are browsing village crops!', '#ffb070');
  }
}

// Trail Cairns (+12% walk speed near cairn & map marker)
export function placeTrailCairn(game) {
  if (countItem(game.player, 'stone') < 3) {
    notify(game, '🪨 You need 3 Cut Stones to stack a Trail Cairn.', '#ffb070');
    return false;
  }
  removeItem(game.player, 'stone', 3);
  const r = ensureRealism(game);
  const zone = zoneAt(game.player.x, game.player.y);
  r.world.trailCairns.push({
    x: Math.round(game.player.x),
    y: Math.round(game.player.y),
    label: zone?.name || 'Wild Trail',
    day: game.day || 1,
  });
  cue(game, 'build');
  burst(game, game.player.x, game.player.y, '#c9d1e0', 12);
  notify(game, '🪨 Built a Trail Cairn marker (+12% path speed within 30 tiles)!', '#7cfc9a');
  return true;
}

export function terrainSpeedMultiplier(game) {
  const player = game.player;
  const r = ensureRealism(game);
  const nearCairn = r.world.trailCairns.some((c) => Math.hypot(c.x - player.x, c.y - player.y) <= 30);
  const z = zoneAt(player.x, player.y);
  let mod = nearCairn ? 1.12 : 1.0;
  if (isTierEnabled(game, 'B') && z.kind !== 'village' && z.kind !== 'inside') {
    if (z.id === 'swamp' || z.biome === 'mountain') mod *= 0.82;
  }
  return mod;
}

// Shop Hours & Calendar Check (REALISM.txt Part 10 A)
export function checkShopOpenHours(game, role, villageId) {
  const r = ensureRealism(game);
  if (r.world.closedShops?.[villageId + ':' + role] === (game.day || 1)) {
    return { open: false, reason: '🤒 "Closed today — the shopkeeper fell ill with winter fever."' };
  }
  if (!isTierEnabled(game, 'A')) return { open: true, clinicSurcharge: 1.0 };
  const h = game.hour ?? 12;
  if (role === 'clinic') {
    return { open: true, clinicSurcharge: h >= 22 || h < 6 ? 1.2 : 1.0 };
  }
  if (role === 'inn' || role === 'tavern') {
    if (h >= 11 || h < 2) return { open: true, clinicSurcharge: 1.0 };
    return { open: false, reason: '🍺 "Opening hours: 11:00 A.M. – 2:00 A.M. Come back before noon!"' };
  }
  if (h >= 8 && h < 19) return { open: true, clinicSurcharge: 1.0 };
  return { open: false, reason: `🪧 "Opening hours: ${weekdayName(game.day)} 8:00 A.M. – 7:00 P.M." Come back at sunrise.` };
}

export function isTownDayMarketBonus(game) {
  return isMarketDay(game.day || 1) ? 1.15 : 1.0;
}

// Fishing with River Worm Bait -> Pearls & Double Fish
export function rollBaitFishingBonus(game) {
  const r = ensureRealism(game);
  if (countItem(game.player, 'bait') <= 0) return false;
  removeItem(game.player, 'bait', 1);
  if (Math.random() < 0.35) {
    addItem(game.player, 'pearl', 1);
    r.codex.pearlsFound = (r.codex.pearlsFound || 0) + 1;
    cue(game, 'levelUp');
    notify(game, '🦪 Bait hooked a shimmering Sea Pearl!', '#ffd23f');
  } else {
    addItem(game.player, 'rawFish', 1);
    stampPerishableAdded(game, 'rawFish');
    earnLexis(game, 10);
    notify(game, '🪱 Bait landed an extra Fresh Fish + 10 Lexis!', '#7cfc9a');
  }
  return true;
}

// Daily Sick Merchant roll in winter + lair growth + cartel survey
export function stepLivingNatureDaily(game) {
  const r = ensureRealism(game);
  const season = seasonOf(game);
  if (isTierEnabled(game, 'B') && season === 'Winter' && VILLAGES.length > 0 && Math.random() < 0.25) {
    const v = VILLAGES[(game.day || 1) % VILLAGES.length];
    r.world.closedShops[v.id + ':bakery'] = (game.day || 1);
  }
  if (isTierEnabled(game, 'C')) {
    const keys = Object.keys(r.world.lairDays || {});
    for (const id of keys) r.world.lairDays[id] = (r.world.lairDays[id] || 0) + 1;
  }
  if ((game.player.level || 1) >= 2 && gainXp) {
    // keep explored survey percentage current
    if (typeof game.explored === 'string' && game.explored.length > 0) {
      let seen = 0;
      for (let i = 0; i < game.explored.length; i++) if (game.explored[i] === '1') seen++;
      const pct = Math.round((seen / game.explored.length) * 100);
      r.world.surveyedPct = pct;
      for (const milestone of [25, 50, 75, 100]) {
        if (pct >= milestone && !r.world.surveyRewardsClaimed.includes(milestone)) {
          r.world.surveyRewardsClaimed.push(milestone);
          earnLexis(game, milestone * 4);
          gainXp(game, milestone * 2);
          notify(game, `🗺️ Cartographer Grant! ${milestone}% of world mapped (+${milestone * 4}L, +${milestone * 2} XP)!`, '#ffd23f');
        }
      }
    }
  }
}
