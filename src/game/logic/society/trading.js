import { ITEMS } from '../../data/items';
import { JOB_GOODS } from '../../data/villagers';
import { villageOf } from '../../data/zones';
import { SOCIETY_SENTENCES, societySentencesFor } from '../../data/sentences/society';
import { STATS, addBoost, gameHours } from '../boosts';
import { startFight } from '../fight';
import { makeDuel } from '../duels';
import { isNight } from '../clock';
import { passHours } from '../days';
import { countItem, addItem, removeItem, earnLexis, gainXp, heal, healFully } from '../player';
import { addHappiness } from '../village';
import { villageNews } from '../villages';
import { notify, say } from '../messages';
import { burst, floatText } from '../particles';
import { cue } from '../cues';
import { pickRandom } from '../../../logic/random';
import {
  econVillage,
  missingInputsFor,
  refreshContracts,
  acceptContract,
  canDeliverContract,
  deliverContract,
  sellResourceToTown,
  ensureEconomy,
} from '../economy';
import {
  ensureSociety,
  isVillain,
  addInfamy,
  villageState,
  changeVillageMood,
  isFestivalActive,
  villagePriceMultiplier,
  revealCrystalCave,
  startSocietyFight,
} from './state';
import { canShopServeHero } from '../realism/index';
import { ensureRealism } from '../realism/state';
import { healAtClinicRealism } from '../realism/bodyHealth';
import { reportWitnessedCrime, marketBoomSellMultiplier, payOffFinesOrDefend } from '../realism/financeAndLaw';
import { isTownDayMarketBonus } from '../realism/foodAndNature';

// Villager interactions (trading, bargaining, crystal cave tips, attacking, extorting),
// hospital healing (24h check-in), downtown word games, and statue/totem blessings.

const JOB_EXTRA_GOODS = {
  farmer: ['wheatSeed', 'hay'],
  woodcutter: ['decorBanner'],
  stonecutter: ['stone'],
  herder: ['hay', 'horseFeed'],
  builder: ['decorBanner', 'turretKit'],
  merchant: ['horseFeed', 'wheatSeed', 'decorBanner', 'turretKit'],
};
const CAPITAL_RARE_GOODS = ['rareSpice', 'silkBolt', 'silverBrooch', 'goldenChalice'];
const TOWN_RARE_GOODS = ['rareSpice', 'silkBolt'];
const STAT_BLESSINGS = { speed: 2, health: 15, spell: 10, attack: 5, defense: 3 };
const STAT_LABELS = { speed: 'Speed', health: 'Max HP', spell: 'Spell Power', attack: 'Attack', defense: 'Defense' };

function goodsOfVillager(villager, village) {
  const base = [...(JOB_GOODS[villager.job] || []), ...(JOB_EXTRA_GOODS[villager.job] || [])];
  if (villager.job === 'merchant' || villager.isSmith) {
    if (village && village.kind === 'capital') base.push(...CAPITAL_RARE_GOODS);
    else if (village && village.kind === 'town') base.push(...TOWN_RARE_GOODS);
  }
  return [...new Set(base)].filter((id) => ITEMS[id] && (ITEMS[id].price || ITEMS[id].sell));
}

function itemBuyPrice(game, villageId, itemId) {
  const item = ITEMS[itemId];
  const base = item.price || Math.max(4, (item.sell || 3) * 2);
  return Math.max(1, Math.round(base * villagePriceMultiplier(game, villageId)));
}

function buyFromVillager(game, villager, itemId) {
  const price = itemBuyPrice(game, villager.village, itemId);
  if (game.player.lexis < price) {
    notify(game, 'You need ' + price + ' Lexis.', '#ff8a95');
    return;
  }
  game.player.lexis -= price;
  addItem(game.player, itemId);
  changeVillageMood(game, villager.village, 1);
  cue(game, 'trade');
  notify(game, ITEMS[itemId].icon + ' Bought ' + ITEMS[itemId].name + ' for ' + price + ' Lexis.', '#7cfc9a');
}

function sellToVillager(game, villager, itemId) {
  const item = ITEMS[itemId];
  const payout = sellResourceToTown(game, villager.village, itemId, 1);
  if (payout > 0) {
    cue(game, 'trade');
    notify(game, '🪙 Supplied ' + item.name + ' to workshop for +' + payout + ' Lexis.', '#ffd23f');
    return;
  }
  const festivalBonus = isFestivalActive(game, villager.village) ? 1.15 : 1;
  const boomMult = game?.realism ? marketBoomSellMultiplier(game, villager.village, itemId) * isTownDayMarketBonus(game) : 1;
  const fallbackPay = Math.max(1, Math.round((item.sell || 1) * festivalBonus * boomMult));
  removeItem(game.player, itemId);
  earnLexis(game, fallbackPay);
  cue(game, 'trade');
  notify(game, '🪙 Sold ' + item.name + ' for ' + fallbackPay + ' Lexis.', '#ffd23f');
}

function openEconomyContractMenu(game, villager) {
  const village = villageOf(villager.village);
  const vEcon = econVillage(game, villager.village);
  const econ = ensureEconomy(game);
  const gaps = missingInputsFor(game, villager.village);
  const contracts = refreshContracts(game).slice(0, 4);
  const choices = [];

  if (canDeliverContract(game, villager.village)) {
    const act = econ.activeContract;
    choices.push({
      label: `Deliver Active Contract (${act.qty}× ${ITEMS[act.itemId]?.name}) → +${act.rewardLexis} Lexis`,
      icon: act.itemId,
      run: () => deliverContract(game, villager.village),
    });
  }
  if (!econ.activeContract) {
    for (const c of contracts) {
      const dest = (villageOf(c.buyerId) || {}).name || c.buyerId;
      choices.push({
        label: `Haul ${c.qty}× ${ITEMS[c.itemId]?.name} → ${dest} (+${c.rewardLexis} Lexis)`,
        icon: c.itemId,
        run: () => acceptContract(game, c.id),
      });
    }
  }
  choices.push({ label: 'Back', run: () => openVillagerTradeMenu(game, villager) });

  const needText = gaps.length > 0
    ? `Workshops need: ${gaps.slice(0, 3).map((g) => ITEMS[g.itemId]?.name).join(', ')}.`
    : 'Our workshops are well stocked right now.';
  say(game, null, [`${villager.name}: "${village.name} treasury holds ${vEcon ? vEcon.treasury : 0} Lexis. ${needText}"`], choices);
}

function negotiateWithVillager(game, villager) {
  const s = ensureSociety(game);
  const village = villageOf(villager.village);
  const npc = { id: null, name: villager.name + ' (' + villager.jobName + ')', look: villager.look };
  const mood = villageState(game, villager.village)?.mood ?? 50;
  const health = mood < 40 || isVillain(game) ? 5 : 4;
  startFight(game, makeDuel(npc, {
    title: 'Price Negotiation',
    category: 'vocabulary',
    tag: 'normal',
    questions: societySentencesFor('trade'),
    health: health,
    speed: 12,
    onWin: () => {
      s.deals[villager.village] = { day: game.day, factor: 0.75 };
      changeVillageMood(game, villager.village, 2);
      say(game, null, [villager.name + ': "Alright, fair tongue! 25% off in ' + village.name + ' for the rest of today!"']);
    },
    onLose: () => {
      s.deals[villager.village] = { day: game.day, factor: 1.15 };
      say(game, null, [villager.name + ': "With grammar like that? My prices just went up 15% today!"']);
    },
  }));
}

function openSellMenu(game, villager) {
  const sellable = Object.keys(game.player.bag).filter((id) => ITEMS[id] && ITEMS[id].sell);
  if (sellable.length === 0) {
    say(game, null, [villager.name + ': "You have nothing I want to buy right now."']);
    return;
  }
  const bonus = isFestivalActive(game, villager.village) ? 1.15 : 1;
  const choices = sellable.slice(0, 8).map((id) => {
    const payout = Math.max(1, Math.round(ITEMS[id].sell * bonus));
    return {
      label: 'Sell ' + ITEMS[id].name + ' (×' + countItem(game.player, id) + ') → +' + payout + ' Lexis',
      icon: id,
      run: () => sellToVillager(game, villager, id),
    };
  });
  choices.push({ label: 'Back', run: () => {} });
  say(game, null, [villager.name + ': "What would you like to sell?"'], choices);
}

function openVillagerTradeMenu(game, villager) {
  const s = ensureSociety(game);
  const village = villageOf(villager.village);
  const goods = goodsOfVillager(villager, village);
  if (goods.length === 0) {
    say(game, null, [villager.name + ': "I have nothing to trade today."']);
    return;
  }

  const choices = [];
  const deal = s.deals[villager.village];
  if (!deal || deal.day !== game.day) {
    choices.push({ label: 'Negotiate prices (word duel)', icon: 'book', run: () => negotiateWithVillager(game, villager) });
  }
  for (const id of goods.slice(0, 7)) {
    const price = itemBuyPrice(game, villager.village, id);
    const rareTag = ITEMS[id].rare ? ' ★' : '';
    choices.push({
      label: 'Buy ' + ITEMS[id].name + rareTag + ' (' + price + ' Lexis)',
      icon: id,
      run: () => buyFromVillager(game, villager, id),
    });
  }
  choices.push({ label: 'Workshop & Haulage Contracts', icon: 'quests', run: () => openEconomyContractMenu(game, villager) });
  choices.push({ label: 'Sell items from bag', icon: 'lexis', run: () => openSellMenu(game, villager) });
  choices.push({ label: 'Leave', run: () => {} });

  const multPct = Math.round(villagePriceMultiplier(game, villager.village) * 100);
  const line = villager.drunk > 0
    ? villager.name + ': "*Hic!* Best prices in ' + village.name + '! (' + multPct + '% rate)"'
    : villager.name + ': "Here are my goods. (Current rate: ' + multPct + '%)"';
  say(game, null, [line], choices);
}

function tryTrade(game, villager) {
  const s = ensureSociety(game);
  const festival = isFestivalActive(game, villager.village);
  const mood = villageState(game, villager.village)?.mood ?? 50;

  if (game?.realism) {
    const gate = canShopServeHero(game, villager.job === 'merchant' ? 'market' : villager.job, villager.village);
    if (!gate.open && !festival) {
      const fineAmt = ensureRealism(game).fines?.total || 0;
      const choices = fineAmt > 0 ? [{ label: 'Resolve Fines (' + fineAmt + 'L)', icon: 'lexis', run: () => payOffFinesOrDefend(game) }, { label: 'Leave', run: () => {} }] : [];
      say(game, null, [villager.name + ': ' + gate.reason], choices);
      return;
    }
  }
  if (isNight(game) && !festival) {
    say(game, null, [villager.name + ': "My stall is closed for the night! Come back at sunrise — or during a festival."']);
    return;
  }
  if (isVillain(game) && s.bribedToday[villager.id] !== game.day && !festival) {
    const bribe = 20 + Math.floor(s.infamy / 3);
    say(game, null, [villager.name + ': "Stay back, villain! I will not trade with you unless you pay ' + bribe + ' Lexis for my trouble!"'], [
      {
        label: 'Pay bribe (' + bribe + ' Lexis) & Trade',
        icon: 'lexis',
        run: () => {
          if (game.player.lexis < bribe) {
            notify(game, 'Need ' + bribe + ' Lexis.', '#ff8a95');
            return;
          }
          game.player.lexis -= bribe;
          s.bribedToday[villager.id] = game.day;
          cue(game, 'trade');
          openVillagerTradeMenu(game, villager);
        },
      },
      { label: 'Leave', run: () => {} },
    ]);
    return;
  }
  if (mood < 20 && !festival) {
    say(game, null, [villager.name + ': "Nobody here wants to deal with you right now. Help the village first!"']);
    return;
  }
  openVillagerTradeMenu(game, villager);
}

function attackVillager(game, villager) {
  const s = ensureSociety(game);
  cue(game, 'punch');
  burst(game, villager.x, villager.y - 0.6, '#ff5a6e', 16);
  game.run.shakeUntil = Date.now() + 200;

  const infamyGain = villager.kid ? 20 : 12;
  addInfamy(game, infamyGain);
  changeVillageMood(game, villager.village, -10);
  addHappiness(game, -3);
  if (game?.realism) reportWitnessedCrime(game, 'Attacked ' + villager.name, 35);

  // Alert nearby knights in the same village
  for (const other of game.run.villagers) {
    if (other.village === villager.village && other.knight && !other.ko && !other.dead) other.angry = 60;
  }

  const escortedMerchant = villager.job === 'merchant' && Math.random() < 0.82;
  const fightsBack = villager.knight || villager.job === 'foreman' || escortedMerchant || (!villager.kid && Math.random() < 0.55);
  if (fightsBack) {
    villager.fighting = true;
    const isGuard = villager.knight || escortedMerchant;
    startSocietyFight(game, {
      name: escortedMerchant ? villager.name + '’s Escort' : villager.name + ' (' + villager.jobName + ')',
      shape: isGuard ? 'knight' : 'imp',
      health: isGuard ? 70 : 40,
      attack: isGuard ? 20 : 12,
      speed: isGuard ? 11 : 9,
      xp: isGuard ? 45 : 20,
      lexis: isGuard ? 25 : 10,
    }, {
      kind: 'townFight',
      role: isGuard ? 'guard' : 'villager',
      villagerId: villager.id,
      villageId: villager.village,
      name: villager.name,
    });
    return;
  }

  villager.ko = { wakeAtHour: gameHours(game) + 3 };
  villager.angry = 0;
  notify(game, '💥 You struck ' + villager.name + '! (+' + infamyGain + ' Infamy, village mood dropped)', '#ff8a95');
  // Small chance a guard intercepts immediately if villain
  if (isVillain(game) && s.infamy >= 45 && Date.now() > game.run.guardCooldownUntil) {
    notify(game, '🚨 Guards saw the assault!', '#ff6060');
  }
}

function extortVillager(game, villager) {
  const s = ensureSociety(game);
  s.extortedToday[villager.id] = game.day;
  addInfamy(game, 6);
  changeVillageMood(game, villager.village, -6);
  addHappiness(game, -2);
  villager.angry = 30;

  const escorted = villager.job === 'merchant' && Math.random() < 0.82;
  if (escorted || Math.random() < 0.3) {
    villager.fighting = true;
    startSocietyFight(game, {
      name: escorted ? villager.name + '’s Escort' : 'Defiant ' + villager.name,
      shape: escorted ? 'knight' : 'imp',
      health: escorted ? 64 : 42,
      attack: escorted ? 18 : 13,
      speed: escorted ? 11 : 9,
      xp: escorted ? 35 : 22,
      lexis: escorted ? 22 : 15,
    }, { kind: 'townFight', role: escorted ? 'guard' : 'villager', villagerId: villager.id, villageId: villager.village, name: villager.name });
    return;
  }

  const loot = 10 + Math.floor(Math.random() * 16);
  earnLexis(game, loot);
  floatText(game, villager.x, villager.y - 0.8, '+' + loot + ' Lexis', '#ffd23f');
  say(game, null, [villager.name + ': "T-take it! Just spare me!" (+' + loot + ' Lexis, +6 Infamy)']);
}

function askAboutCaves(game, villager) {
  const mood = villageState(game, villager.village)?.mood ?? 50;
  if (mood < 35 && !isFestivalActive(game, villager.village)) {
    say(game, null, [villager.name + ': "I do not share mining secrets with strangers we do not trust. Improve our mood first."']);
    return;
  }
  const cave = revealCrystalCave(game, villager.name);
  if (cave) {
    say(game, null, [villager.name + ': "Keep your voice down... I saw blue crystal veins near ' + cave.name + '. I marked the area on your map!"']);
  } else {
    say(game, null, [villager.name + ': "You already know every crystal cave I ever heard of!"']);
  }
}

function villagerGreeting(game, villager, village, state) {
  if (villager.drunk > 0) {
    return villager.name + ': "*Hic!* What a night in ' + village.name + '! *Hic!* Come dance by the bonfire!"';
  }
  if (isFestivalActive(game, villager.village)) {
    return villager.name + ': "Happy Festival! Everything in ' + village.name + ' is 25% off today and tonight!"';
  }
  if (isVillain(game)) {
    return villager.name + ': "*Steps back nervously* What do you want, ' + game.player.name + '?"';
  }
  const roleLabel = villager.isSmith ? 'Blacksmith' : villager.jobName;
  const intro = villager.working ? 'Hard at work today. ' : 'Good day, traveler. ';
  const daysLeft = Math.max(0, (state?.feast || game.day) - game.day);
  const feastHint = daysLeft <= 2 ? ' Our next festival is almost here!' : '';
  return villager.name + ' (' + roleLabel + '): "' + intro + villageNews(game, villager.village) + feastHint + '"';
}

// Main villager interaction menu (trading, cave tips, donations, extortion, attacking).
export function interactVillager(game, villager) {
  if (!villager || villager.ko || villager.dead) return;
  const s = ensureSociety(game);
  const village = villageOf(villager.village);
  const state = villageState(game, villager.village);
  if (state?.owner === 'monsters') {
    say(game, null, [villager.name + ': "... (stares quietly at the blank signpost without speaking)"']);
    return;
  }

  if (villager.angry > 0) {
    say(game, null, [villager.name + ': "Stay back! I have nothing to say to you!"'], [
      { label: 'Attack!', icon: 'woodSword', run: () => attackVillager(game, villager) },
      { label: 'Walk away', run: () => {} },
    ]);
    return;
  }

  const choices = [];
  const goods = goodsOfVillager(villager, village);
  if (goods.length > 0) {
    choices.push({ label: 'Trade goods', icon: 'shop', run: () => tryTrade(game, villager) });
  }
  if (villager.isSmith || villager.job === 'stonecutter' || villager.job === 'foreman') {
    choices.push({ label: 'Ask about crystal caves', icon: 'crystal', run: () => askAboutCaves(game, villager) });
  }
  if (game.player.lexis >= 40 && (s.infamy > 0 || (state?.mood ?? 50) < 85)) {
    choices.push({
      label: 'Donate 40 Lexis to ' + village.name + ' (-Infamy, +Mood)',
      icon: 'people',
      run: () => {
        game.player.lexis -= 40;
        changeVillageMood(game, villager.village, 8);
        addHappiness(game, 2);
        addInfamy(game, -8);
        cue(game, 'trade');
        notify(game, '💛 Donated 40 Lexis to ' + village.name + '!', '#7cfc9a');
      },
    });
  }
  if ((isVillain(game) || s.infamy >= 20) && !villager.knight && !villager.kid && s.extortedToday[villager.id] !== game.day) {
    choices.push({ label: 'Extort / Rob (+Lexis, +Infamy)', icon: 'lexis', run: () => extortVillager(game, villager) });
  }
  choices.push({ label: 'Strike / Attack (+Infamy)', icon: 'woodSword', run: () => attackVillager(game, villager) });
  choices.push({ label: 'Leave', run: () => {} });

  say(game, null, [villagerGreeting(game, villager, village, state)], choices);
}

// ---------- Hospital Healing (Clinic) ----------

function clearCompanionFatigue(game) {
  if (game.camp && game.camp.fatigue) game.camp.fatigue = {};
  if (game.bonds && game.bonds.fatigue) game.bonds.fatigue = {};
  for (const id of game.player.party || []) {
    if (game.npcs[id]) game.npcs[id].fatigue = 0;
  }
}

function applyHospitalTreatment(game, village) {
  const s = ensureSociety(game);
  passHours(game, 24);
  healFully(game.player, game);
  game.player.hunger = 100;
  game.player.thirst = 100;
  if (s.riding) s.riding.hunger = 0;
  clearCompanionFatigue(game);
  const cured = game?.realism ? healAtClinicRealism(game) : [];
  s.healedAtHospital += 1;
  changeVillageMood(game, village.id, 2);
  game.run.fadeUntil = Date.now() + 650;
  cue(game, 'heal');
  notify(game, '🏥 Rested 1 full day at ' + village.name + ' Clinic' + (cured.length > 0 ? ' (cured: ' + cured.join(', ') + ')' : '') + '! HP, MP, hunger, thirst & companions restored.', '#7cfc9a');
}

export function interactHospital(game, village) {
  const mult = villagePriceMultiplier(game, village.id);
  const lateMod = game?.realism ? canShopServeHero(game, 'clinic', village.id).clinicSurcharge || 1 : 1;
  const fullCost = Math.max(60, Math.round(120 * mult * lateMod));
  const discountCost = Math.max(45, Math.round(90 * mult * lateMod));
  const nurse = {
    id: null,
    name: 'Clinic Nurse',
    look: { skin: '#fde0c8', hair: '#c98a3b', style: 'bun', eyes: '#3a7bd5', outfit: '#ffffff', trim: '#e8423f' },
  };

  say(game, null, ['Clinic Nurse: "Welcome to the ' + village.name + ' Clinic. A full inpatient stay takes 1 full day (24 hours) and restores HP, MP, food, water, and companion fatigue."'], [
    {
      label: 'Check in for 1 day (' + fullCost + ' Lexis)',
      icon: 'healthPotion',
      run: () => {
        if (game.player.lexis < fullCost) {
          say(game, null, ['Clinic Nurse: "I am sorry, full care costs ' + fullCost + ' Lexis. Or try persuading me with fine words!"']);
          return;
        }
        game.player.lexis -= fullCost;
        applyHospitalTreatment(game, village);
      },
    },
    {
      label: 'Persuade / Flirt with the nurse for free care (word duel)',
      icon: 'people',
      run: () => {
        startFight(game, makeDuel(nurse, {
          title: 'Clinic Persuasion',
          category: 'vocabulary',
          tag: 'normal',
          questions: societySentencesFor('clinic'),
          health: 4,
          speed: 12,
          onWin: () => {
            applyHospitalTreatment(game, village);
            say(game, null, ['Clinic Nurse: "*Blushes* Oh, alright! With charm like yours, consider the room on the house! Have a peaceful rest."']);
          },
          onLose: () => {
            say(game, null, ['Clinic Nurse: "Sweet talk will not heal broken ribs! Still, I can offer a bed for ' + discountCost + ' Lexis."'], [
              {
                label: 'Pay discounted fee (' + discountCost + ' Lexis)',
                icon: 'healthPotion',
                run: () => {
                  if (game.player.lexis < discountCost) {
                    notify(game, 'Need ' + discountCost + ' Lexis.', '#ff8a95');
                    return;
                  }
                  game.player.lexis -= discountCost;
                  applyHospitalTreatment(game, village);
                },
              },
              { label: 'Maybe later', run: () => {} },
            ]);
          },
        }));
      },
    },
    { label: 'Leave', run: () => {} },
  ]);
}

// ---------- Downtown Word Games & Enigmas (gameStall) ----------

export function interactGameStall(game, village) {
  const s = ensureSociety(game);
  const key = village.id + ':' + game.day;
  const host = { id: null, name: 'Enigma Master', look: { skin: '#e9b98f', hair: '#5a3a8a', style: 'short', eyes: '#ffd23f', outfit: '#31406e', trim: '#ffd23f' } };

  const choices = [
    {
      label: 'Rapid Word Blitz (Free · Win 30 Lexis)',
      icon: 'powers',
      run: () => {
        startFight(game, makeDuel(host, {
          title: 'Downtown Word Blitz',
          category: 'vocabulary',
          tag: 'normal',
          questions: societySentencesFor('enigma'),
          health: 3,
          speed: 16,
          onWin: () => {
            earnLexis(game, 30);
            gainXp(game, 18);
            cue(game, 'trade');
            say(game, null, ['Enigma Master: "Lightning fast! Here is your 30 Lexis prize and +18 XP!"']);
          },
          onLose: () => say(game, null, ['Enigma Master: "Out of rhythm! Catch your breath and try again!"']),
        }));
      },
    },
    {
      label: 'Grand Enigma Challenge (20 Lexis · Win 80 Lexis)',
      icon: 'lexis',
      run: () => {
        if (game.player.lexis < 20) {
          notify(game, 'Need 20 Lexis to enter.', '#ff8a95');
          return;
        }
        game.player.lexis -= 20;
        startFight(game, makeDuel(host, {
          title: 'Grand Enigma',
          category: 'wordForms',
          tag: 'hard',
          questions: SOCIETY_SENTENCES,
          health: 5,
          speed: 14,
          onWin: () => {
            earnLexis(game, 80);
            gainXp(game, 35);
            cue(game, 'blessing');
            say(game, null, ['Enigma Master: "Astounding! The crowd cheers! You win 80 Lexis and +35 XP!"']);
          },
          onLose: () => say(game, null, ['Enigma Master: "Ooh, the enigma claims your wager! Better luck next round."']),
        }));
      },
    },
  ];

  if (!s.enigmaDone[key]) {
    choices.push({
      label: 'Daily Capital Riddle (Free · Win 45 Lexis + Prize)',
      icon: 'star',
      run: () => {
        startFight(game, makeDuel(host, {
          title: 'Capital Riddle',
          category: 'connectors',
          tag: 'hard',
          questions: societySentencesFor('enigma'),
          health: 4,
          speed: 13,
          onWin: () => {
            s.enigmaDone[key] = true;
            const prize = pickRandom(['decorBanner', 'horseFeed', 'rareSpice', 'oldCoin']);
            earnLexis(game, 45);
            addItem(game.player, prize);
            gainXp(game, 25);
            cue(game, 'blessing');
            say(game, null, ['Enigma Master: "Solved! Take 45 Lexis, +25 XP, and a ' + ITEMS[prize].name + '!"']);
          },
          onLose: () => say(game, null, ['Enigma Master: "Not quite! The daily riddle awaits whenever you are ready."']),
        }));
      },
    });
  }
  choices.push({ label: 'Leave', run: () => {} });

  say(game, null, ['Downtown Game Stall (' + village.name + '): "Step right up! Test your English in word games & enigmas for big Lexis prizes!"'], choices);
}

// ---------- Church Statues & Grey Wild Totems ----------

export function interactStatueOrTotem(game, statueId, isTotem, x, y) {
  const s = ensureSociety(game);
  if (s.statuesUsed.includes(statueId)) {
    say(game, null, [isTotem ? 'The grey wild totem stands quiet. Its ancient blessing already flows within you.' : 'The sacred statue gleams peacefully. You have already received its blessing.']);
    return;
  }

  const statIndex = s.statuesUsed.length % STATS.length;
  const stat = STATS[statIndex];
  const amount = STAT_BLESSINGS[stat];
  const keeper = { id: null, name: isTotem ? 'Grey Wild Totem' : 'Sacred Statue', look: null, shape: isTotem ? 'golem' : 'wisp' };

  say(game, null, [isTotem ? 'An ancient grey totem hums with forgotten power. Solve its grammar trial to earn a permanent blessing!' : 'A marble church statue radiates calm. Offer a prayer of true words for a permanent blessing!'], [
    {
      label: isTotem ? 'Answer the Totem Trial (4 sentences)' : 'Offer Prayer of Words (3 sentences)',
      icon: 'star',
      run: () => {
        startFight(game, makeDuel(keeper, {
          title: isTotem ? 'Totem Trial' : 'Sacred Prayer',
          category: game.focus.current,
          tag: 'hard',
          questions: societySentencesFor('statue'),
          health: isTotem ? 4 : 3,
          speed: 12,
          onWin: () => {
            s.statuesUsed.push(statueId);
            addBoost(game, stat, amount, null, 'statue-' + statueId);
            if (stat === 'health') heal(game.player, amount);
            gainXp(game, isTotem ? 60 : 40);
            if (!isTotem && s.infamy > 0) addInfamy(game, -6);
            cue(game, 'blessing');
            burst(game, x, y, isTotem ? '#8fd6ff' : '#ffd23f', 32);
            floatText(game, game.player.x, game.player.y - 1, '+' + amount + ' ' + STAT_LABELS[stat], '#ffd23f');
            say(game, null, ['Light wraps around your shoulders!', 'Permanent blessing granted: +' + amount + ' ' + STAT_LABELS[stat] + ' (and +' + (isTotem ? 60 : 40) + ' XP)!']);
          },
          onLose: () => say(game, null, ['The runes dim silently. Return when your words are sharper.']),
        }));
      },
    },
    { label: 'Leave', run: () => {} },
  ]);
}
