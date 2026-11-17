import { MORE_TEXT, MORE_RC8 } from '../../../data/moreQuestions';
import { NPCS } from '../../data/npcs';
import { BARD_RUMORS, GRIMOIRES, TAVERN_SPECIALS } from '../../data/realism';
import { ITEMS } from '../../data/items';
import { VILLAGES } from '../../data/zones';
import { pickRandom } from '../../../logic/random';
import { ensureRealism, weekdayName, isMarketDay } from './state';
import { startFight } from '../fight';
import { makeDuel } from '../duels';
import { earnLexis, gainXp, countItem, removeItem } from '../player';
import { addFriendship } from '../village';
import { notify, say } from '../messages';
import { cue } from '../cues';

// English in the World (REALISM.txt Part 14 & r1):
// Every civic document (notices, contracts, labels, letters, ferry timetables, invoices, dreams,
// grimoires, news) turns daily life in Lexia into real TOEIC Part 6/7 reading moments.

let passageUid = 960000;

function flattenPassage(entry, section = 'rc55', category = 'vocabulary') {
  return entry.questions.map((q) => ({
    id: ++passageUid,
    section: section,
    category: q.category || category,
    difficulty: q.difficulty || 'normal',
    text: entry.text,
    question: q.question,
    answers: q.answers,
    correct_index: q.correct_index,
    justification: q.justification,
  }));
}

const LEXIA_NOTICES = [
  {
    id: 'bridge_maintenance',
    kind: 'bridge',
    title: 'East Bridge Maintenance Notice',
    text: `TOWN HALL PUBLIC NOTICE — RIVERGATE WARD\n\nPlease be advised that timber girders on the East Bridge will undergo reinforcement on Market Day (Sat) from 07:00 to 13:00. All supply carts must detour by the South Ford or pay a temporary ferry fee of 10 Lexis.`,
    question: 'Why must supply carts use the South Ford on Saturday morning?',
    answers: [
      'A royal parade is blocking the square.',
      'Timber girders on the bridge are being reinforced.',
      'River water is frozen until noon.',
      'Merchants are refusing cart deliveries.',
    ],
    correct_index: 1,
    justification: 'The notice states timber girders on the East Bridge will undergo reinforcement.',
    effectText: 'Detour noted! You save time & avoid a blocked crossing (+15 XP).',
  },
  {
    id: 'clinic_supply',
    kind: 'clinic',
    title: 'Clinic Winter Remedy Bulletin',
    text: `ELDERMOOR CLINIC BULLETIN\n\nDue to cold nights and muddy roads, cases of foot sprain and seasonal chills have risen by 40%. Patients should bring two bundles of fresh Herb or purchase a Clinic Antiseptic before walking north. Avoid untreated stream water.`,
    question: 'What does the clinic advise travelers heading north to do?',
    answers: [
      'Sleep outdoors near the stream.',
      'Purchase Clinic Antiseptic or bring fresh Herb.',
      'Cancel all winter deliveries.',
      'Double their daily potion intake.',
    ],
    correct_index: 1,
    justification: 'It asks patients to bring fresh Herb or buy Clinic Antiseptic before walking north.',
    effectText: 'Clinic shortage identified: herb prices & clinic prep understood (+15 XP).',
  },
  {
    id: 'market_fair',
    kind: 'market',
    title: 'Weekly Market & Guild Charter',
    text: `MERCHANT LEAGUE DISPATCH\n\nSaturday Market Day opens at 08:00 sharp and closes at 19:00. Licensed stall holders holding a Merchant Patent pay zero booth commission, while unlicensed peddlers pay a 5% civic fee toward village wall repairs.`,
    question: 'What benefit do holders of a Merchant Patent receive?',
    answers: [
      'They may stay open past midnight.',
      'They pay no booth commission.',
      'They receive free iron armor.',
      'They avoid all border inspections.',
    ],
    correct_index: 1,
    justification: 'Licensed holders holding a Merchant Patent pay zero booth commission.',
    effectText: 'Trade charter understood: you spot fair stall terms immediately (+15 XP).',
  },
  {
    id: 'water_rationing',
    kind: 'well',
    title: 'Aqueduct Inspection Advisory',
    text: `MUNICIPAL WATER WORKS\n\nTechnicians will flush sediment from the western fountain between 10:00 and 14:00. Wait until evening or boil water over a campfire to prevent stomach illness.`,
    question: 'What should residents do to prevent stomach illness before evening?',
    answers: [
      'Drink directly from the western fountain.',
      'Boil water over a campfire.',
      'Eat raw meat instead of bread.',
      'Close the bakery windows.',
    ],
    correct_index: 1,
    justification: 'The notice instructs residents to wait until evening or boil water over a campfire.',
    effectText: 'Clean water precaution remembered (+15 XP).',
  },
];

const EARTH_DREAM_MEMORIES = [
  {
    text: `MEMORY FRAGMENT — TOKYO COMMUTER LINE\n\nNotice to Passengers: Express Train #412 to Shinjuku is delayed by ten minutes because of heavy rain near Ikebukuro. Students sitting for the TOEIC examination at Hall B should transfer to Platform 3 immediately.`,
    question: 'Why should students transfer to Platform 3?',
    answers: [
      'Express Train #412 is delayed due to heavy rain.',
      'Hall B has been moved to Ikebukuro.',
      'Platform 3 offers free breakfast pastries.',
      'The TOEIC exam was postponed until Monday.',
    ],
    correct_index: 0,
    justification: 'Express Train #412 is delayed ten minutes because of heavy rain.',
  },
  {
    text: `MEMORY FRAGMENT — OFFICE INTERNAL MEMO\n\nTo: Junior Analysts\nReminder: Please submit quarterly travel expense forms before 5:00 P.M. on Friday so accounting can reimburse taxi and rail receipts on time.`,
    question: 'When is the deadline to submit expense forms?',
    answers: [
      'Before Friday at 5:00 P.M.',
      'Monday morning after tax audit.',
      'At the start of next quarter.',
      'Only after accounting asks for receipts.',
    ],
    correct_index: 0,
    justification: 'Submit quarterly travel expense forms before 5:00 P.M. on Friday.',
  },
  {
    text: `MEMORY FRAGMENT — UNIVERSITY CRAM SCHOOL\n\nFinal Study Tip: When reading two linked documents, check dates and price exceptions first. A 10% early-bird discount rarely applies after registration closes.`,
    question: 'What does the study tip advise checking first in linked texts?',
    answers: [
      'Dates and price exceptions.',
      'The author’s home address.',
      'Grammar mistakes in the signature.',
      'Font styles on page two.',
    ],
    correct_index: 0,
    justification: 'It advises checking dates and price exceptions first.',
  },
];

export function itemLabelText(game, itemId) {
  const item = ITEMS[itemId];
  if (!item) return '';
  if (item.kind === 'potion') return 'Label: "Do not take more than three doses within six hours."';
  if (item.kind === 'seed') return 'Seed guide: "Plant in soil (best Spring–Autumn). Avoid winter frost."';
  const r = ensureRealism(game);
  const meta = r.spoilage?.[itemId];
  if (meta && typeof meta.daysLeft === 'number') {
    if (meta.daysLeft <= 0) return 'Best-before date PASSED — compost at farm!';
    return `Best before: Day ${(game.day || 1) + Math.ceil(meta.daysLeft)} (${Math.ceil(meta.daysLeft)}d left)`;
  }
  return '';
}

// Daily civic notices per village + real TOEIC question challenge.
export function refreshDailyNotices(game) {
  const r = ensureRealism(game);
  const day = game.day || 1;
  if (r.world.lastNoticeDay === day && r.world.boardNotices.length > 0) return r.world.boardNotices;
  r.world.lastNoticeDay = day;
  const picks = [];
  for (let i = 0; i < 2; i++) {
    const notice = LEXIA_NOTICES[(day + i) % LEXIA_NOTICES.length];
    picks.push({ ...notice, uid: day + '-' + notice.id });
  }
  if (isMarketDay(day) && !picks.some((p) => p.id === 'market_fair')) {
    picks.push({ ...LEXIA_NOTICES[2], uid: day + '-market_fair' });
  }
  r.world.boardNotices = picks;
  return picks;
}

export function readNoticeBoardQuestion(game, villageId = 'lexia') {
  const notices = refreshDailyNotices(game);
  const r = ensureRealism(game);
  const unread = notices.find((n) => !r.world.noticesRead[n.uid]) || notices[0];
  if (!unread) return false;
  const studyBoost = r.workstations.studyBuffDay === (game.day || 1) ? 1.15 : 1;

  const q = {
    id: ++passageUid,
    section: 'rc55',
    category: 'vocabulary',
    difficulty: 'normal',
    text: unread.text,
    question: unread.question,
    answers: unread.answers,
    correct_index: unread.correct_index,
    justification: unread.justification,
  };
  startFight(
    game,
    makeDuel(
      { id: null, name: (villageId || 'Town') + ' Notice Board', shape: 'book' },
      {
        title: unread.title,
        category: 'vocabulary',
        questions: [q],
        health: 1,
        mistakesAllowed: 1,
        speed: 8,
        onWin: () => {
          r.world.noticesRead[unread.uid] = true;
          const xp = Math.round(18 * studyBoost);
          gainXp(game, xp);
          earnLexis(game, 8);
          cue(game, 'coin');
          notify(game, '📋 ' + unread.effectText + ' (+8 Lexis)', '#7cfc9a');
        },
        onLose: () => {
          notify(game, '📋 You skimmed too fast and missed the key clause. Check the board again later.', '#ffb070');
        },
      }
    )
  );
  return true;
}

// Generic TOEIC contract / invoice / form / grimoire reader using real RC55 passages or custom text.
export function launchDocumentReadingDuel(game, { title, speakerName = 'Clerk', customText = null, customQuestion = null, count = 1, onPass, onFail }) {
  const questions = customQuestion
    ? [{ id: ++passageUid, section: 'rc55', category: 'vocabulary', difficulty: 'normal', text: customText, ...customQuestion }]
    : flattenPassage(pickRandom(Math.random() < 0.7 ? MORE_TEXT : MORE_RC8)).slice(0, Math.max(1, count));

  const target = Math.min(questions.length, Math.max(1, count));
  startFight(
    game,
    makeDuel(
      { id: null, name: speakerName, shape: 'scroll' },
      {
        title: title,
        category: questions[0]?.category || 'vocabulary',
        questions: questions,
        health: target,
        mistakesAllowed: 2,
        speed: 7,
        onWin: () => onPass && onPass(),
        onLose: () => onFail && onFail(),
      }
    )
  );
}

// Contractual reading (Part 14 A): bad comprehension signs harsher loan/rent interest without immediate warning.
export function signContractWithComprehension(game, title, termsSummary, onFairTerms, onUnfairTerms) {
  const contractDoc = {
    text: `OFFICIAL CONTRACT — KINGDOM LEDGER\n${title}\n\n${termsSummary}\nNotice: Standard fee applies only if signed prior to closing bell; late or unsigned riders carry an automatic surcharge clause of +15% compounded weekly.`,
    question: 'Under what condition does the +15% weekly surcharge clause apply?',
    answers: [
      'When riders remain late or unsigned after closing.',
      'Whenever the signee pays cash upfront.',
      'During Spring and Summer harvest festivals.',
      'To guild members above Rank C.',
    ],
    correct_index: 0,
    justification: 'Late or unsigned riders carry an automatic +15% weekly surcharge clause.',
  };
  launchDocumentReadingDuel(game, {
    title: 'Contract Review: ' + title,
    speakerName: 'Guild Notary',
    customText: contractDoc.text,
    customQuestion: contractDoc,
    count: 1,
    onPass: () => {
      gainXp(game, 15);
      onFairTerms && onFairTerms();
    },
    onFail: () => {
      notify(game, '✒️ Signed without catching the fine print! Watch your Ledger later.', '#ffb070');
      onUnfairTerms && onUnfairTerms();
    },
  });
}

// Smith Repair Invoice Verification (Part 14 B): spot overbilling to save 25% Lexis.
export function inspectRepairInvoice(game, rawCost, onConfirm) {
  const billed = rawCost + 8;
  const doc = {
    text: `MIRA'S FORGE — ITEMIZED INVOICE\nService: Edge grinding, rivet replacement & oil temper\nBase Labor: ${Math.max(1, rawCost - 4)} Lexis\nCharcoal & Whetstone: 4 Lexis\nMistaken Duplicate Torch Fee: 8 Lexis\nTOTAL BILLED: ${billed} Lexis`,
    question: 'Which line item on this invoice is an error that should be removed?',
    answers: [
      'Base Labor',
      'Charcoal & Whetstone',
      'Duplicate Torch Fee (8 Lexis)',
      'Edge grinding',
    ],
    correct_index: 2,
    justification: 'The invoice mistakenly adds a Duplicate Torch Fee of 8 Lexis.',
  };
  launchDocumentReadingDuel(game, {
    title: 'Check Repair Invoice',
    speakerName: 'Mira the Smith',
    customText: doc.text,
    customQuestion: doc,
    onPass: () => {
      const fair = Math.max(1, Math.round(rawCost * 0.85));
      notify(game, '🧾 Good eye! Caught the 8 Lexis billing mistake (discounted to ' + fair + ' Lexis).', '#7cfc9a');
      onConfirm && onConfirm(fair);
    },
    onFail: () => {
      notify(game, '🧾 Paid the invoice without spotting the duplicate charge (' + billed + ' Lexis).', '#ffb070');
      onConfirm && onConfirm(billed);
    },
  });
}

// Earth Dream sequence when sleeping in a real bed (Part 5 B).
export function maybeTriggerEarthDream(game) {
  const r = ensureRealism(game);
  if ((game.day || 1) < 2 || Math.random() > 0.35 || game.run?.fight) return false;
  const dream = pickRandom(EARTH_DREAM_MEMORIES);
  launchDocumentReadingDuel(game, {
    title: 'Dream of Earth',
    speakerName: 'Memory Echo',
    customText: dream.text,
    customQuestion: dream,
    onPass: () => {
      r.health.wellRestedHours = Math.max(r.health.wellRestedHours || 0, 14);
      r.codex.dreamsDone = (r.codex.dreamsDone || 0) + 1;
      gainXp(game, 20);
      notify(game, '💭 Lucid Earth memory! Extended "Well Rested" to 14h (+20 XP).', '#d8b4f8');
    },
    onFail: () => {
      notify(game, '💭 The dream slipped away as dawn broke.', '#9fd8ff');
    },
  });
  return true;
}

// Deliver & read courier letters / inbox mail (Part 14 B).
export function generateDailyLetter(game) {
  const r = ensureRealism(game);
  const day = game.day || 1;
  if (r.social.inbox.some((m) => m.day === day)) return;
  const templates = [
    {
      sender: 'Lea (Classmate)',
      subject: 'Royal Archive Strategy Note',
      text: `From: Lea\nTo: ${game.player?.name || 'Hero'}\nSubject: Reading fast under pressure\n\nI noticed the Demon Queen uses twin-document decrees on Floor 4. Always read the closing disclaimer before attacking, or you waste a whole turn.`,
      question: 'According to Lea, what should you read carefully before attacking on Floor 4?',
      answers: [
        'The closing disclaimer.',
        'Only the monster portrait.',
        'The shop menu prices.',
        'Yesterday’s town crier.',
      ],
      correct_index: 0,
      justification: 'She warns to always read the closing disclaimer before attacking.',
    },
    {
      sender: 'Hugo (Innkeeper)',
      subject: 'Kitchen Supply Request',
      text: `From: Hugo — Riverford Inn\nIf you craft or carry any dish from Earth (Curry Stew, Omurice, or Honey Toast), bring a sample to the Inn. Guests pay top silver and you will receive daily kitchen royalties!`,
      question: 'What does Hugo offer in exchange for Earth dishes?',
      answers: [
        'A free steel sword.',
        'Daily kitchen royalties.',
        'A royal border passport.',
        'An obsidian pet.',
      ],
      correct_index: 1,
      justification: 'Bringing an Earth dish earns daily kitchen royalties.',
    },
  ];
  const pick = templates[day % templates.length];
  r.social.inbox.push({ id: 'mail-' + day, day: day, read: false, ...pick });
  if (r.social.inbox.length > 6) r.social.inbox.shift();
}

export function readInboxLetter(game, mailId) {
  const r = ensureRealism(game);
  const mail = r.social.inbox.find((m) => m.id === mailId);
  if (!mail) return false;
  launchDocumentReadingDuel(game, {
    title: mail.subject,
    speakerName: mail.sender,
    customText: mail.text,
    customQuestion: mail,
    onPass: () => {
      mail.read = true;
      gainXp(game, 16);
      earnLexis(game, 10);
      notify(game, '✉️ Read letter from ' + mail.sender + ' (+16 XP, +10 Lexis)!', '#7cfc9a');
    },
  });
  return true;
}

export function sendCourierLetter(game, npcId, giftItemId = null) {
  const r = ensureRealism(game);
  if (countItem(game.player, 'postLetter') <= 0) {
    notify(game, '✉️ You need a Courier Seal in your bag to dispatch a letter.', '#ffb070');
    return false;
  }
  const npc = NPCS.find((n) => n.id === npcId) || NPCS[0];
  removeItem(game.player, 'postLetter', 1);
  if (giftItemId && countItem(game.player, giftItemId) > 0) removeItem(game.player, giftItemId, 1);
  r.social.courierSent = (r.social.courierSent || 0) + 1;
  addFriendship(game, npc.id, giftItemId ? 18 : 10);
  cue(game, 'coin');
  notify(game, '🕊️ Carrier pigeon delivered your letter to ' + npc.name + '!', '#9fd8ff');
  return true;
}

// Ferry timetable check (Part 14 B): departures run cleanly between 06:00 and 20:00 (or any time with Royal Pass).
export function isFerryOnSchedule(game) {
  const h = game.hour ?? 12;
  if (countItem(game.player, 'royalPass') > 0) return { ok: true, msg: 'Royal Diplomatic Pass boards on priority skiff.' };
  if (h >= 6 && h <= 20) return { ok: true, msg: 'Daily Harbor Ferry departs hourly 06:00–20:00.' };
  return { ok: false, msg: 'Last Harbor Ferry sailed at 20:00! Wait until 06:00 dawn or rest at the Inn.' };
}

// Town Crier Daily News & Bard Rumors (Part 14 B).
export function publishTownCrier(game) {
  const r = ensureRealism(game);
  const day = game.day || 1;
  if (r.world.lastNewsDay === day && r.world.news.length > 0) return r.world.news;
  r.world.lastNewsDay = day;
  const headlines = [];
  headlines.push(`${weekdayName(day)} · Day ${day}: Guild contracts refreshed across all ${VILLAGES.length} settlements.`);
  if (r.world.marketBoom) headlines.push(`Market Dispatch: ${r.world.marketBoom.label}`);
  if (Object.keys(r.world.nemesis || {}).length > 0) {
    const first = Object.values(r.world.nemesis)[0];
    headlines.push(`Warning: "${first.name}" has been spotted near wilderness roads!`);
  }
  if (r.social.memorial.length > 0) {
    const last = r.social.memorial[r.social.memorial.length - 1];
    headlines.push(`In Memoriam: Tribute bell tolls at church for ${last.name}.`);
  }
  r.world.news = headlines.slice(0, 4);
  return r.world.news;
}

export function hearBardRumor(game) {
  if (game.player.lexis < 15) {
    say(game, null, ['Bard: "Slip 15 Lexis in my lute case and I will sing you the realm’s freshest secret!"']);
    return false;
  }
  game.player.lexis -= 15;
  const r = ensureRealism(game);
  const tip = r.world.marketBoom ? 'Bard Sings: "' + r.world.marketBoom.label + '!"' : 'Bard Whispers: "' + pickRandom(BARD_RUMORS) + '"';
  cue(game, 'coin');
  say(game, null, [tip]);
  return true;
}

// Learn an arcane Grimoire via TOEIC reading challenge in Libraries (Part 14 C).
export function studyGrimoireAtLibrary(game, grimoireId) {
  const r = ensureRealism(game);
  const g = GRIMOIRES.find((item) => item.id === grimoireId);
  if (!g) return false;
  if (r.manaTrain.studiedGrimoires.includes(g.id)) {
    notify(game, '📘 You have already mastered ' + g.name + '.', '#9fd8ff');
    return false;
  }
  if (game.player.lexis < g.cost) {
    notify(game, '📘 Studying ' + g.name + ' costs ' + g.cost + ' Lexis.', '#ffb070');
    return false;
  }
  const passage = flattenPassage(pickRandom(MORE_TEXT))[0];
  launchDocumentReadingDuel(game, {
    title: 'Grimoire: ' + g.name,
    speakerName: 'Archivist',
    customText: passage.text,
    customQuestion: passage,
    onPass: () => {
      game.player.lexis -= g.cost;
      r.manaTrain.studiedGrimoires.push(g.id);
      const studyXp = r.workstations.studyBuffDay === (game.day || 1) ? 29 : 25;
      gainXp(game, studyXp);
      cue(game, 'levelUp');
      notify(game, '📘 Mastered ' + g.name + '! (' + g.desc + ' +' + studyXp + ' XP)', '#d8b4f8');
    },
    onFail: () => {
      notify(game, '📘 The archaic phrasing slipped past you. Try studying again later.', '#ffb070');
    },
  });
  return true;
}

export function listGrimoireChoices(game) {
  const r = ensureRealism(game);
  return GRIMOIRES.filter((g) => !r.manaTrain.studiedGrimoires.includes(g.id)).map((g) => ({
    label: `Read ${g.name} (${g.cost}L)`,
    icon: 'book',
    run: () => studyGrimoireAtLibrary(game, g.id),
  }));
}

export function learnEarthRecipeFromCook(game, dishId) {
  const r = ensureRealism(game);
  if (r.codex.recipes.includes(dishId)) return;
  r.codex.recipes.push(dishId);
  if (!addItem) return;
  notify(game, '📖 Recorded ' + (ITEMS[dishId]?.name || TAVERN_SPECIALS[dishId]?.name || dishId) + ' in your Codex!', '#ffd23f');
}
