import { ITEMS } from '../../data/items';
import { KINGDOMS } from '../../data/kingdoms';
import { CURRENCIES, EARTH_ROYALTIES, MARKET_BOOM_DEFS } from '../../data/realism';
import { zoneAt, VILLAGES } from '../../data/zones';
import { ensureRealism, isTierEnabled } from './state';
import { signContractWithComprehension, learnEarthRecipeFromCook } from './englishWorld';
import { computeCasteTier } from './socialAndCodex';
import { addItem, removeItem, countItem, earnLexis, gainXp } from '../player';
import { econVillage } from '../economy/state';
import { addInfamy } from '../society/state';
import { notify, say } from '../messages';
import { cue } from '../cues';
import { pickRandom } from '../../../logic/random';

// Economy, Capital Banking, Loans, Money Weight, Taxes, Currencies, Counterfeits,
// Workshop Investments, Royalties, Market Booms, Crimes with Witnesses & Fines (REALISM.txt Parts 11, 12).

export function coinWeightKg(game) {
  const lexis = Math.max(0, game.player?.lexis || 0);
  if (lexis < 1000) return 0;
  return Math.round((lexis / 1000) * 10) / 10; // 1 kg per 1000 Lexis
}

export function refreshFxRates(game) {
  const r = ensureRealism(game);
  for (const k of KINGDOMS) {
    const base = CURRENCIES[k.id]?.baseRate || 1.0;
    const wave = (((game.day || 1) * 17 + k.id.length * 13) % 19 - 9) * 0.015;
    r.fxRates[k.id] = Math.max(0.78, Math.min(1.35, Math.round((base + wave) * 100) / 100));
  }
}

export function earnRegionalCoin(game, kingdomId, lexisEquivalent) {
  const r = ensureRealism(game);
  const kId = CURRENCIES[kingdomId] ? kingdomId : 'lexia';
  r.currencies[kId] = (r.currencies[kId] || 0) + Math.max(1, Math.round(lexisEquivalent));
}

export function exchangeAllForeignCoins(game) {
  const r = ensureRealism(game);
  let total = 0;
  const spread = countItem(game.player, 'merchantPatent') > 0 || r.social.factions.merchantLeague >= 20 ? 0.98 : 0.94;
  for (const kId of Object.keys(r.currencies)) {
    const held = r.currencies[kId] || 0;
    if (held <= 0) continue;
    const rate = r.fxRates[kId] || 1.0;
    total += Math.max(1, Math.round(held * rate * spread));
    r.currencies[kId] = 0;
  }
  if (total <= 0) {
    notify(game, '💱 No foreign coins to convert.', '#9fd8ff');
    return 0;
  }
  earnLexis(game, total);
  notify(game, `💱 Exchanged Kingdom coins into +${total} Lexis.`, '#ffd23f');
  return total;
}

export function depositBank(game, amount) {
  const r = ensureRealism(game);
  const sum = Math.min(game.player.lexis || 0, Math.max(0, Math.round(amount)));
  if (sum <= 0) {
    notify(game, '🏦 Not enough pocket Lexis to deposit.', '#ffb070');
    return false;
  }
  game.player.lexis -= sum;
  r.bank.balance += sum;
  cue(game, 'coin');
  notify(game, `🏦 Deposited ${sum} Lexis (Vault balance: ${r.bank.balance} Lexis).`, '#7cfc9a');
  return true;
}

export function withdrawBank(game, amount) {
  const r = ensureRealism(game);
  const sum = Math.min(r.bank.balance || 0, Math.max(0, Math.round(amount)));
  if (sum <= 0) {
    notify(game, '🏦 Vault balance is empty.', '#ffb070');
    return false;
  }
  r.bank.balance -= sum;
  earnLexis(game, sum);
  notify(game, `🏦 Withdrew ${sum} Lexis.`, '#ffd23f');
  return true;
}

export function issuePromissoryNote(game) {
  const r = ensureRealism(game);
  if ((game.player.lexis || 0) < 500 && (r.bank.balance || 0) < 500) {
    notify(game, '🏦 Need 500 Lexis in pocket or Vault for a Bank Promissory Note.', '#ffb070');
    return false;
  }
  if ((game.player.lexis || 0) >= 500) game.player.lexis -= 500;
  else r.bank.balance -= 500;
  addItem(game.player, 'creditNote', 1);
  cue(game, 'coin');
  notify(game, '📜 Issued 500 Lexis Bank Promissory Note (0 kg weight)!', '#7cfc9a');
  return true;
}

export function redeemPromissoryNote(game) {
  if (countItem(game.player, 'creditNote') <= 0) return false;
  removeItem(game.player, 'creditNote', 1);
  earnLexis(game, 500);
  notify(game, '🏦 Redeemed Bank Promissory Note for 500 Lexis!', '#7cfc9a');
  return true;
}

export function requestGuildLoan(game, amount = 250) {
  const r = ensureRealism(game);
  if (r.debt.owed > 0) {
    say(game, null, [`Banker: "Clear your existing ${r.debt.owed} Lexis loan first."`]);
    return;
  }
  signContractWithComprehension(
    game,
    `Loan Agreement (${amount} Lexis due in 14 days)`,
    `Principal: ${amount} Lexis. Standard weekly interest: 5%.`,
    () => {
      earnLexis(game, amount);
      r.debt = { owed: Math.round(amount * 1.05), dueDay: (game.day || 1) + 14, defaulted: false };
      notify(game, `📜 Loan approved at fair 5% rate: +${amount} Lexis (due Day ${r.debt.dueDay}).`, '#7cfc9a');
    },
    () => {
      earnLexis(game, amount);
      r.debt = { owed: Math.round(amount * 1.2), dueDay: (game.day || 1) + 7, defaulted: false };
      notify(game, `📜 Loan issued (+${amount} Lexis).`, '#ffd23f');
    }
  );
}

export function repayLoan(game, amount = null) {
  const r = ensureRealism(game);
  if (r.debt.owed <= 0) return false;
  const pay = Math.min(r.debt.owed, game.player.lexis || 0, amount ?? r.debt.owed);
  if (pay <= 0) {
    notify(game, '🏦 Carry enough Lexis to repay part of your loan.', '#ffb070');
    return false;
  }
  game.player.lexis -= pay;
  r.debt.owed -= pay;
  if (r.debt.owed === 0) {
    r.debt.defaulted = false;
    notify(game, '✅ Guild Loan paid in full!', '#7cfc9a');
  } else {
    notify(game, `🪙 Repaid ${pay} Lexis (${r.debt.owed} Lexis remaining).`, '#ffd23f');
  }
  return true;
}

export function investInTownWorkshop(game, villageId = 'lexia', kind = 'forge', amount = 120) {
  if (game.player.lexis < amount) {
    notify(game, `⚒️ Investing in the ${kind} costs ${amount} Lexis.`, '#ffb070');
    return false;
  }
  game.player.lexis -= amount;
  const r = ensureRealism(game);
  const key = `${villageId}:${kind}`;
  const prev = r.investments[key]?.principal || 0;
  r.investments[key] = { villageId, kind, principal: prev + amount };
  const econ = econVillage(game, villageId);
  if (econ) econ.treasury += Math.round(amount * 0.5);
  cue(game, 'coin');
  notify(game, `📈 Invested ${amount} Lexis in ${villageId} ${kind} (+6% daily dividends)!`, '#7cfc9a');
  return true;
}

export function registerEarthRecipeRoyalty(game, dishId) {
  const rate = EARTH_ROYALTIES[dishId];
  if (!rate || countItem(game.player, dishId) <= 0) return false;
  const r = ensureRealism(game);
  if (r.patents.royalties[dishId]?.active) {
    notify(game, '📜 You already receive daily royalties for ' + (ITEMS[dishId]?.name || dishId) + '.', '#9fd8ff');
    return false;
  }
  removeItem(game.player, dishId, 1);
  r.patents.royalties[dishId] = { rate, active: true };
  learnEarthRecipeFromCook(game, dishId);
  earnLexis(game, rate * 2);
  cue(game, 'levelUp');
  notify(game, `🍽️ Hugo licensed ${ITEMS[dishId].name}! +${rate} Lexis/day perpetual royalties!`, '#ffd23f');
  return true;
}

export function assayCounterfeitCoins(game) {
  const r = ensureRealism(game);
  if ((r.counterfeitBatch || 0) <= 0) return 0;
  const batch = r.counterfeitBatch;
  r.counterfeitBatch = 0;
  const genuine = game.player.accessory === 'monocle' ? batch : Math.round(batch * 0.65);
  earnLexis(game, genuine);
  notify(game, `🧐 Assayed coin batch: recovered ${genuine} genuine Lexis (${batch - genuine} lead slugs purged).`, '#9fd8ff');
  return genuine;
}

export function rollDailyMarketBoom(game) {
  const r = ensureRealism(game);
  r.world.marketBoom = pickRandom(MARKET_BOOM_DEFS);
}

export function marketBoomSellMultiplier(game, villageId, itemId) {
  const r = ensureRealism(game);
  const boom = r.world.marketBoom;
  let mult = 1.0;
  if (boom && boom.itemId === itemId) mult *= boom.mult;
  if (countItem(game.player, 'merchantPatent') > 0) mult *= 1.06;
  if (r.health.cleanliness < 35 && isTierEnabled(game, 'C')) mult *= 0.9;
  return mult;
}

// Crimes Require a Living Witness & Issue Wanted Fines / Trial Defense (REALISM.txt Part 12 A)
export function reportWitnessedCrime(game, reason, fineAmount = 30) {
  const r = ensureRealism(game);
  const hasWitness = (game.run?.villagers || []).some((v) => Math.hypot(v.x - game.player.x, v.y - game.player.y) < 9);
  if (!hasWitness && isTierEnabled(game, 'A')) {
    notify(game, '🥷 Nobody saw your act — no crime reported.', '#9fd8ff');
    return false;
  }
  r.codex.crimes = (r.codex.crimes || 0) + 1;
  r.fines.total = (r.fines.total || 0) + fineAmount;
  r.world.wantedUntilDay = (game.day || 1) + 3;
  r.world.wantedReason = reason;
  addInfamy(game, 5);
  const z = zoneAt(game.player.x, game.player.y);
  if (z.kind === 'village') r.fines.bannedUntil[z.id] = (game.day || 1) + 2;
  notify(game, `⚖️ Witness reported: "${reason}"! Fine ${fineAmount}L · Wanted for 3 days.`, '#ff6060');
  return true;
}

export function isShopRefusingCriminal(game, villageId) {
  const r = ensureRealism(game);
  if (!isTierEnabled(game, 'A') || r.fines.total <= 0) return false;
  const bannedUntil = r.fines.bannedUntil?.[villageId] || 0;
  return (game.day || 1) <= bannedUntil;
}

export function payOffFinesOrDefend(game) {
  const r = ensureRealism(game);
  if (r.fines.total <= 0) return;
  const fine = r.fines.total;
  say(game, null, [`Magistrate Notice: Outstanding fines total ${fine} Lexis (${r.world.wantedReason || 'Civic Offense'}).`], [
    {
      label: `Pay Full Fine (${fine} Lexis)`,
      icon: 'lexis',
      run: () => {
        if (game.player.lexis < fine) return notify(game, `Need ${fine} Lexis to settle fines.`, '#ffb070');
        game.player.lexis -= fine;
        r.fines.total = 0;
        r.fines.bannedUntil = {};
        r.world.wantedUntilDay = 0;
        notify(game, '⚖️ Fines settled cleanly! Village ban lifted.', '#7cfc9a');
      },
    },
    {
      label: 'Argue Case in English (TOEIC Court Appeal)',
      icon: 'book',
      run: () => {
        signContractWithComprehension(
          game,
          'Municipal Appeals Brief',
          'Under Statute 4-B, any traveler showing proof of public service reduces civic restitution by 50%.',
          () => {
            r.fines.total = Math.floor(fine * 0.5);
            r.fines.bannedUntil = {};
            notify(game, `⚖️ Appeal upheld! Fine halved to ${r.fines.total} Lexis & shop ban lifted.`, '#7cfc9a');
          },
          () => {
            notify(game, '⚖️ Appeal rejected — fine remains ' + fine + ' Lexis.', '#ff8a95');
          }
        );
      },
    },
    { label: 'Step back', run: () => {} },
  ]);
}

export function checkDungeonSalvageFee(game, dungeonId) {
  const r = ensureRealism(game);
  if (!isTierEnabled(game, 'C')) return true;
  if (r.world.permits[dungeonId] || countItem(game.player, 'delveCharter') > 0 || r.social.factions.crownLexia >= 30) {
    return true;
  }
  const tax = Math.min(game.player.lexis || 0, 15);
  if (tax > 0) {
    game.player.lexis -= tax;
    notify(game, `📜 No Crown Delve Charter — paid ${tax} Lexis salvage tariff at exit.`, '#ffb070');
  }
  return false;
}

export function stepFinanceDaily(game) {
  const r = ensureRealism(game);
  const day = game.day || 1;
  refreshFxRates(game);
  rollDailyMarketBoom(game);

  // Weekly 1% bank interest (REALISM.txt Part 18)
  if ((r.bank.balance || 0) >= 100 && day - (r.bank.lastInterestDay || 1) >= 7) {
    r.bank.lastInterestDay = day;
    const interest = Math.max(1, Math.round(r.bank.balance * 0.01));
    r.bank.balance += interest;
    notify(game, `🏦 Weekly Bank Interest credited: +${interest} Lexis!`, '#7cfc9a');
  }

  // Weekly House Property Tax paid directly to village treasury
  if (isTierEnabled(game, 'B') && day >= (r.world.taxesDueDay || 7)) {
    r.world.taxesDueDay = day + 7;
    const caste = computeCasteTier(game);
    const grossTax = 25;
    const tax = Math.max(5, Math.round(grossTax * (1 - (caste.taxDiscount || 0))));
    if ((game.player.lexis || 0) >= tax) {
      game.player.lexis -= tax;
      const econ = econVillage(game, 'lexia');
      if (econ) econ.treasury += tax;
      notify(game, `🏠 Paid weekly Eldermoor property tax: ${tax} Lexis (${caste.name} tier).`, '#ffd086');
    }
  }

  // Loan overdue check
  if (isTierEnabled(game, 'B') && r.debt.owed > 0) {
    if (day > r.debt.dueDay) {
      r.debt.defaulted = true;
      r.debt.owed = Math.round(r.debt.owed * 1.05);
      notify(game, `⚠️ Loan OVERDUE (${r.debt.owed} Lexis owed)! Repay at the Market/Bank.`, '#ff6060');
    }
  }

  // Workshop dividends & Earth Royalties
  let dividends = 0;
  for (const inv of Object.values(r.investments || {})) {
    dividends += Math.max(2, Math.round((inv.principal || 0) * 0.06));
  }
  for (const roy of Object.values(r.patents.royalties || {})) {
    if (roy?.active) dividends += roy.rate || 0;
  }
  if (dividends > 0) {
    earnLexis(game, dividends);
    notify(game, `📈 Collected +${dividends} Lexis from workshop shares & Earth recipe royalties!`, '#7cfc9a');
  }

  // Reputation delayed travel (takes 2 days to reach neighbor villages)
  if (r.world.repQueue.length > 0) {
    const due = r.world.repQueue.filter((item) => day >= item.arriveDay);
    r.world.repQueue = r.world.repQueue.filter((item) => day < item.arriveDay);
    if (due.length > 0 && VILLAGES.length > 0 && gainXp) {
      notify(game, '📰 Caravans carried your reputation to neighboring towns.', '#9fd8ff');
    }
  }
}
