import { CATEGORIES, successPercent } from '../../data/categories';
import { typeOf } from '../data/types';
import { tagOf, tagPercent, tagAnswers, TAGS } from './skills';
import { notify } from './messages';

// Links the 10 English grammar categories to the hero's 5 combat stats (2 categories per stat).
// Priority order (from most critical to least):
//   1. speed    (fight speed: more time to answer, strikes first)
//   2. health   (max HP)
//   3. spell    (skill / grammar spell damage %)
//   4. attack   (physical strike & special attack damage)
//   5. defense  (armor / damage blocked)
//
// The 2 weakest categories bind to speed, the next 2 to health, then spell, then attack, and the 2 strongest to defense.
// Lock rule: a bound category stays locked to its stat until the player passes > 90% in Normal mode across
// multiple tests (at least 2 passing Normal tests and >= 10 Normal answers > 90%, or already evolved past Normal).

export const STAT_SLOTS = [
  { id: 'speed', name: 'Speed', rank: 1 },
  { id: 'health', name: 'Health', rank: 2 },
  { id: 'spell', name: 'Skill Damage', rank: 3 },
  { id: 'attack', name: 'Attack & Special', rank: 4 },
  { id: 'defense', name: 'Defense', rank: 5 },
];

const PASS_PERCENT = 90; // must exceed 90% in Normal mode
const REQUIRED_TESTS = 2; // across multiple tests (>= 2 tests)
const MIN_NORMAL_ANSWERS = 8;

// Effective proficiency score of a category (Normal 0..100, Hard 100..200, Extreme 200..300) for sorting weakest first.
function categoryProficiency(game, categoryId) {
  const tag = tagOf(game, categoryId);
  const tagIndex = TAGS.indexOf(tag);
  if (tagIndex === 0) {
    const normalCount = tagAnswers(game, categoryId, 'normal');
    return normalCount > 0 ? tagPercent(game, categoryId, 'normal') : successPercent(game.mastery, categoryId);
  }
  return tagIndex * 100 + tagPercent(game, categoryId, tag);
}

// Has the player mastered this category past >90% across multiple tests in Normal mode (or evolved)?
export function isLinkUnlocked(game, categoryId) {
  if (tagOf(game, categoryId) !== 'normal') return true;
  const tests = game.statLinks?.passingTests?.[categoryId] || 0;
  const answers = tagAnswers(game, categoryId, 'normal');
  const pct = tagPercent(game, categoryId, 'normal');
  return tests >= REQUIRED_TESTS && answers >= MIN_NORMAL_ANSWERS && pct > PASS_PERCENT;
}

// Builds initial statLinks by sorting all 10 categories from weakest to strongest.
export function firstStatLinks(mastery) {
  const ranked = CATEGORIES.map((c) => c.id).sort((a, b) => successPercent(mastery, a) - successPercent(mastery, b));
  const slots = {};
  STAT_SLOTS.forEach((slot, i) => {
    slots[slot.id] = [ranked[i * 2], ranked[i * 2 + 1]];
  });
  return { slots: slots, passingTests: {}, sessionNormal: {} };
}

export function ensureStatLinks(game) {
  if (!game.statLinks || !game.statLinks.slots) {
    game.statLinks = firstStatLinks(game.mastery || {});
  }
  if (!game.statLinks.passingTests) game.statLinks.passingTests = {};
  if (!game.statLinks.sessionNormal) game.statLinks.sessionNormal = {};
  return game.statLinks;
}

// Which combat stat ('speed' | 'health' | 'spell' | 'attack' | 'defense') a category is currently bound to.
export function linkedStatOf(game, categoryId) {
  const links = ensureStatLinks(game);
  for (const slot of STAT_SLOTS) {
    if (links.slots[slot.id].includes(categoryId)) return slot.id;
  }
  return 'defense';
}

// Called on each Normal answer in a fight/test to accumulate per-test Normal accuracy.
export function recordLinkTestAnswer(game, question, isCorrect) {
  if (question.difficulty !== 'normal') return;
  const links = ensureStatLinks(game);
  const cat = question.category;
  const entry = links.sessionNormal[cat] || { good: 0, total: 0 };
  entry.good += isCorrect ? 1 : 0;
  entry.total += 1;
  links.sessionNormal[cat] = entry;
}

// Called when a fight/test/duel finishes: evaluates each category tested in Normal mode during that fight,
// updates passingTests count, and rebalances ONLY when unlocked categories allow better ordering.
export function finalizeLinkTests(game) {
  const links = ensureStatLinks(game);
  const entries = Object.entries(links.sessionNormal);
  if (entries.length === 0) return;

  for (const [catId, tally] of entries) {
    if (tally.total >= 2) {
      const pct = (tally.good / tally.total) * 100;
      if (pct > PASS_PERCENT) {
        links.passingTests[catId] = (links.passingTests[catId] || 0) + 1;
      } else {
        // Failed a Normal test (< 90%): reset streak back by 1 so it truly takes multiple >90% tests
        links.passingTests[catId] = Math.max(0, (links.passingTests[catId] || 0) - 1);
      }
    }
  }
  links.sessionNormal = {};
  rebalanceStatLinks(game);
}

// Reassigns ONLY unlocked slots/categories: locked categories stay pinned where they are until they pass >90%
// across multiple Normal tests. Once unlocked, freed positions and unlocked categories re-sort by weakness.
export function rebalanceStatLinks(game, force = false) {
  const links = ensureStatLinks(game);
  if (force) {
    const ranked = CATEGORIES.map((c) => c.id).sort((a, b) => categoryProficiency(game, a) - categoryProficiency(game, b));
    STAT_SLOTS.forEach((slot, i) => {
      links.slots[slot.id] = [ranked[i * 2], ranked[i * 2 + 1]];
    });
    return;
  }

  const before = JSON.stringify(links.slots);

  // Any unlocked category (>90% across 2+ Normal tests, or Hard/Extreme) vacates its high-priority slot
  // when a weaker category sits in a lower-priority slot, bubbling down so the next weakest steps up.
  let moved = true;
  while (moved) {
    moved = false;
    for (let sIdx = 0; sIdx < STAT_SLOTS.length - 1; sIdx++) {
      const slot = links.slots[STAT_SLOTS[sIdx].id];
      for (let i = 0; i < 2; i++) {
        const catId = slot[i];
        if (!isLinkUnlocked(game, catId)) continue;
        const myProf = categoryProficiency(game, catId);
        // Find weakest resident among all lower-priority slots (s2 > sIdx)
        let bestTarget = null;
        for (let s2 = sIdx + 1; s2 < STAT_SLOTS.length; s2++) {
          const slot2 = links.slots[STAT_SLOTS[s2].id];
          for (let j = 0; j < 2; j++) {
            const otherId = slot2[j];
            const otherProf = categoryProficiency(game, otherId);
            if (otherProf < myProf && (!bestTarget || otherProf < bestTarget.prof)) {
              bestTarget = { sIdx: s2, idx: j, prof: otherProf };
            }
          }
        }
        if (bestTarget) {
          const targetSlot = links.slots[STAT_SLOTS[bestTarget.sIdx].id];
          slot[i] = targetSlot[bestTarget.idx];
          targetSlot[bestTarget.idx] = catId;
          moved = true;
        }
      }
    }
  }

  // Also keep multiple unlocked categories sorted relative to each other.
  const unlockedPositions = [];
  const unlockedCats = [];
  STAT_SLOTS.forEach((slot) => {
    links.slots[slot.id].forEach((catId, idx) => {
      if (isLinkUnlocked(game, catId)) {
        unlockedPositions.push({ slotId: slot.id, idx: idx });
        unlockedCats.push(catId);
      }
    });
  });
  if (unlockedCats.length >= 2) {
    unlockedCats.sort((a, b) => categoryProficiency(game, a) - categoryProficiency(game, b));
    unlockedPositions.forEach((pos, k) => {
      links.slots[pos.slotId][pos.idx] = unlockedCats[k];
    });
  }

  if (JSON.stringify(links.slots) !== before) {
    notify(game, '🔗 English stat links updated! Your mastered skills freed priority slots.', '#7cfc9a');
  }
}

// Combat bonus computed from the 2 English categories linked to `statId`.
// Low proficiency (<40%) gives a small penalty or 0; high proficiency & Normal>90% / Hard / Extreme give strong bonuses.
export function statLinkBonus(game, statId) {
  const links = ensureStatLinks(game);
  const pair = links.slots[statId] || [];
  if (pair.length === 0) return 0;
  const avg = pair.reduce((sum, catId) => sum + categoryProficiency(game, catId), 0) / pair.length;
  // Normalize relative to 50% baseline: <50% drags down slightly, >50% boosts, Hard/Extreme boosts higher.
  const delta = (avg - 50) / 50; // -1.0 at 0%, 0 at 50%, +1.0 at 100%, +3.0 at Hard 100%
  if (statId === 'speed') return Math.round(delta * 4); // -4 to +4 in Normal, up to +12
  if (statId === 'health') return Math.round(delta * 25); // -25 to +25 HP in Normal, up to +75 HP
  if (statId === 'spell') return Math.round(delta * 25); // -25% to +25% skill damage
  if (statId === 'attack') return Math.round(delta * 10); // -10 to +10 attack/special damage
  if (statId === 'defense') return Math.max(-2, Math.round(delta * 6)); // -2 to +6 defense
  return 0;
}

// Human-readable summary of one slot for StatsPanel.
export function describeStatSlot(game, statId) {
  const links = ensureStatLinks(game);
  const pair = links.slots[statId] || [];
  return pair.map((catId) => ({
    id: catId,
    name: typeOf(catId).short,
    percent: Math.round(categoryProficiency(game, catId)),
    locked: !isLinkUnlocked(game, catId),
    tests: links.passingTests[catId] || 0,
    requiredTests: REQUIRED_TESTS,
  }));
}
