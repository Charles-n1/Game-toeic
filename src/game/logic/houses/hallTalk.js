import { villageOf } from '../../data/zones';
import { say, notify } from '../messages';
import { cue } from '../cues';
import { emote } from '../emotes';
import { cureCold } from '../weather';
import { healFully, restoreMana } from '../player';
import { academyForRole, classOf } from '../../data/classes';
import { canLearnClass, isSkillTrained, rankOfClass } from '../classes';
import { typeOf } from '../../data/types';
import { offerTournament } from '../isekai/arena';
import { isCursed, offerRite } from '../isekai/curses';
import { repairAllGear, repairCostOf, needsRepair } from '../durability';
import { studyLanguageChoices, gainLanguage } from '../languages';
import { changeKingdomRep } from '../kingdomLaws';
import { addHappiness } from '../village';
import { GODDESS_SHRINES } from '../../data/realism';
import { cleanseAndWash, healAtClinicRealism, applySleepQualityRecovery } from '../realism/bodyHealth';
import { sharpenWeaponAtForgeOrHome, temperEquipmentAtForge } from '../realism/foodAndNature';
import { inspectRepairInvoice, hearBardRumor, listGrimoireChoices } from '../realism/englishWorld';
import { holdChurchMemorialEulogy, prayAtGoddessShrine, orderTavernSpecial } from '../realism/socialAndCodex';
import { readLibraryFolklore, readHeroChronicle, playLouisFlashback } from '../soul';

// Talking to the people of the big buildings (the shopkeepers, the headmasters of the academies, the priests,
// the healers, the smiths...): what each one offers. (The buildings: logic/houses/halls.js.)

function openAcademyMenu(game, patron, visit) {
  const acad = academyForRole(patron.academyRole);
  if (!acad) return;
  const taught = acad.classes.map((id) => classOf(id)).filter(Boolean);
  const choices = taught.map((cls) => {
    const trained = canLearnClass(game, cls);
    const current = game.player.classId === cls.id;
    const req = cls.skills.map((s) => `${typeOf(s).short} (${isSkillTrained(game, s) ? 'Ready' : 'Needs 10+ Normal @ 60%'})`).join(' & ');
    return {
      label: (current ? '✓ ' : trained ? '🎓 Adopt ' : '🔒 ') + cls.name + ' (' + req + ')',
      icon: 'powers',
      run: () => {
        if (current) {
          say(game, null, [`You already walk the path of the ${cls.name} (Rank ${rankOfClass(game, cls)}).`]);
          return;
        }
        if (!trained) {
          say(game, null, [
            `${acad.title}: "To master the ${cls.name}, train both ${cls.skills.map((s) => typeOf(s).short).join(' and ')} to at least 10 Normal answers at 60%+ accuracy!"`,
            'You can practice either skill against our training dummy or in battles.',
          ]);
          return;
        }
        game.player.classId = cls.id;
        emote(game, 'hero', 'sparkle');
        cue(game, 'levelUp');
        notify(game, `🎓 Enlisted at ${acad.title}: You are now a ${cls.name}!`, '#ffd23f');
        say(game, null, [`The Headmaster bows: "Rise, initiate of the ${cls.name}! ${cls.text}"`]);
      },
    };
  });
  choices.push({ label: 'Step back', run: () => {} });
  const vName = villageOf(visit?.house?.village)?.name || 'our academy';
  say(game, null, [`🎓 Welcome to ${vName}'s ${acad.title}!\nChoose a class discipline taught within these halls:`], choices);
}

// The shopkeeper opens the shop.
function talkToShopkeeper(game, patron, visit) {
  game.run.shop = { npcId: patron.npcId || null, kind: patron.shopKind || visit.specialRole || 'market', name: patron.name };
}

// The headmaster of an academy: the classes taught there.
function talkToAcademyMaster(game, patron, visit) {
  openAcademyMenu(game, patron, visit);
}

// Someone at home: a word about what they are doing.
function talkToResident(game, patron, visit) {
  const linesByAct = {
    sleeping: '*Yawns softly under warm blankets in the bedroom...*',
    eating: 'Pull up a chair — the stew from our hearth came out rich today.',
    drinking: 'Cheers! Nothing beats a cool mug at your own dining table.',
    playing: 'Haha! Watch how high we can jump!',
    romantic: '*Blushes and squeezes their partner’s hand warmly* Ah—care to join us for tea downstairs later?',
  };
  const msg = linesByAct[patron.activity] || 'Welcome into our home, traveler! Stairs lead right up to the second floor.';
  say(game, null, [`${patron.name}: "${msg}"`]);
}

// The master of the arena: a tournament.
function talkToArenaMaster(game, patron, visit) {
  const vid = visit?.house?.village;
  offerTournament(game, vid);
}

// The priest: blessings, prayers, the curses taken away, the memorial.
function talkToPriest(game, patron, visit) {
  const vid = visit?.house?.village;
  const kId = villageOf(vid)?.kingdom;
  const choices = [
    {
      label: 'Receive Sanctum Blessing (Free · +15 MP & Cure Cold)',
      icon: 'star',
      run: () => {
        restoreMana(game.player, 15);
        cureCold(game, '✨ Sacred warmth melts away your chill.');
        cue(game, 'levelUp');
        notify(game, '✨ Sanctuary Blessing: +15 Mana restored!', '#ffe680');
      },
    },
    {
      label: 'Donate 20 Lexis (+2 Kingdom Rep, +1 Happiness)',
      icon: 'heart',
      run: () => {
        if (game.player.lexis < 20) return say(game, null, ['"Charity begins when your purse holds 20 Lexis."']);
        game.player.lexis -= 20;
        if (kId) changeKingdomRep(game, kId, 2);
        addHappiness(game, 1);
        cue(game, 'coin');
        notify(game, '⛪ Donated 20 Lexis to the sanctuary.', '#ffe680');
      },
    },
  ];
  if (isCursed(game)) {
    choices.unshift({ label: 'Purify Cursed Equipment', icon: 'book', run: () => offerRite(game, 'The altar of the church') });
  }
  choices.push({ label: '🕯️ Attend Memorial Service (Eulogy)', icon: 'book', run: () => holdChurchMemorialEulogy(game) });
  choices.push({
    label: '🛐 Pray at Goddess Altar (24h Blessing)',
    icon: 'star',
    run: () =>
      say(
        game,
        null,
        ['Which Goddess Altar will you pray before?'],
        [
          ...GODDESS_SHRINES.map((s) => ({
            label: `${s.icon} ${s.name} (${s.cost}L · ${s.desc})`,
            icon: 'star',
            run: () => prayAtGoddessShrine(game, s.id),
          })),
          { label: 'Step back', run: () => {} },
        ]
      ),
  });
  choices.push({ label: 'Step back', run: () => {} });
  say(game, null, ['"May the light guard your steps across every border."'], choices);
}

// The healer: care for the wounds and the sickness.
function talkToHealer(game, patron, visit) {
  say(game, null, ['"Sit still — herbs and clean bandages fix most adventurer mistakes."'], [
    {
      label: 'Full Medical Treatment (12 Lexis · Cure Wounds, Infection & Cold)',
      icon: 'healthPotion',
      run: () => {
        if (game.player.lexis < 12) return say(game, null, ['"12 Lexis covers the herbs, traveler."']);
        game.player.lexis -= 12;
        healFully(game.player, game);
        game.player.fatigue = Math.max(0, (game.player.fatigue || 0) - 35);
        cureCold(game, '🩺 Herbal poultices cured your cold!');
        const cured = game?.realism ? healAtClinicRealism(game) : [];
        cue(game, 'levelUp');
        notify(game, '🩺 Treated at clinic' + (cured.length > 0 ? ' (cured: ' + cured.join(', ') + ')' : '') + ': Full HP restored!', '#8affb3');
      },
    },
    { label: 'Leave', run: () => {} },
  ]);
}

// The smith: repairs and the care of the weapons.
function talkToSmith(game, patron, visit) {
  const cost = repairCostOf(game);
  const choices = [];
  if (needsRepair(game)) {
    choices.push({
      label: 'Repair All Equipped Gear (' + cost + ' Lexis)',
      icon: 'ironSword',
      run: () => {
        if (game.player.lexis < cost) return say(game, null, ['"Coal and whetstones cost ' + cost + ' Lexis today."']);
        game.player.lexis -= cost;
        repairAllGear(game, false);
      },
    });
    choices.push({
      label: '🧾 Review Itemized Invoice (Check for Billing Errors)',
      icon: 'book',
      run: () => inspectRepairInvoice(game, cost, (finalCost) => {
        if (game.player.lexis < finalCost) return notify(game, 'Need ' + finalCost + ' Lexis.', '#ffb070');
        game.player.lexis -= finalCost;
        repairAllGear(game, false);
      }),
    });
  }
  choices.push({ label: '🗡️ Sharpen Blade on Whetstone (+5% ATK today)', icon: 'ironSword', run: () => sharpenWeaponAtForgeOrHome(game) });
  choices.push({ label: '⚒️ Temper Weapon Quality (+Ore, 15/30L)', icon: 'ore', run: () => temperEquipmentAtForge(game, 'weapon') });
  choices.push({ label: '🛡️ Temper Armor Quality (+Ore, 15/30L)', icon: 'ironSword', run: () => temperEquipmentAtForge(game, 'armor') });
  choices.push({ label: 'Just admiring the steel', run: () => {} });
  say(game, null, [needsRepair(game) ? '"Dented edges lose fights! Let me re-temper your kit."' : '"Your steel rings sharp and true today."'], choices);
}

// The innkeeper: a bed, a meal, a song, the rumors.
function talkToInnkeeper(game, patron, visit) {
  const vid = visit?.house?.village;
  const kId = villageOf(vid)?.kingdom;
  say(game, null, ['"Welcome in out of the weather! Stew is bubbling and beds are fresh."'], [
    {
      label: 'Warm Stew & Rest (15 Lexis · Hunger, Thirst, HP/MP)',
      icon: 'bread',
      run: () => {
        if (game.player.lexis < 15) return say(game, null, ['"15 Lexis for supper and board, friend."']);
        game.player.lexis -= 15;
        game.player.hunger = Math.min(100, (game.player.hunger || 0) + 55);
        game.player.thirst = Math.min(100, (game.player.thirst || 0) + 55);
        game.player.fatigue = Math.max(0, (game.player.fatigue || 0) - 60);
        healFully(game.player, game);
        cureCold(game, '🍲 Hot stew chased the chill from your bones!');
        if (game?.realism) applySleepQualityRecovery(game, 'inn');
        notify(game, '🍺 Inn supper & rest restored health and stamina!', '#ffd086');
      },
    },
    {
      label: '🛁 Hot Bath & Scrub (15 Lexis · 100% Clean, +Morale, Cleans Cuts)',
      icon: 'bath',
      run: () => {
        if (game.player.lexis < 15) return say(game, null, ['"Hot water and botanical soap cost 15 Lexis."']);
        game.player.lexis -= 15;
        cleanseAndWash(game, 'innBath');
      },
    },
    {
      label: '🍖 Order Regional Tavern Special (+Morale & Codex Recipe)',
      icon: 'curryStew',
      run: () => orderTavernSpecial(game, kId || 'lexia'),
    },
    { label: 'Just warming up', run: () => {} },
  ]);
}

// The archivist of the library: legends, languages, grimoires.
function talkToArchivist(game, patron, visit) {
  const runesLesson = studyLanguageChoices(game, { name: patron.name, job: 'scribe' }); // one lesson, or null (all learned)
  const langChoices = runesLesson ? [runesLesson] : [];
  const grimoires = game?.realism ? listGrimoireChoices(game) : [];
  const loreChoices = [
    { label: '📜 Creation Myth & Realm Customs', icon: 'book', run: () => readLibraryFolklore(game) },
    { label: '📖 Read Hero Legend Chronicle', icon: 'book', run: () => readHeroChronicle(game) },
  ];
  if (game.isekai?.pagesFound >= 3 || game.chapter >= 4) {
    loreChoices.push({ label: '🕳️ Witness Louis’s Memory Flashback', icon: 'crystal', run: () => playLouisFlashback(game) });
  }
  say(game, null, ['"Every border speaks in its own tongue — runes, elvish, dwarvish, beastkin..."'], [
    ...loreChoices,
    ...langChoices,
    ...grimoires,
    {
      label: 'Study Ancient Runes Tome (Free · +2 Runes)',
      icon: 'book',
      run: () => gainLanguage(game, 'runes', 2),
    },
    { label: 'Step back', run: () => {} },
  ]);
}

// A traveler resting here: news from the road.
function talkToTraveler(game, patron, visit) {
  say(game, null, [patron.name + ': "Care for a fresh ballad or trading rumor from the roads?"'], [
    { label: '🎵 Hear Bard Rumor (15 Lexis)', icon: 'powers', run: () => hearBardRumor(game) },
    { label: 'Not now', run: () => {} },
  ]);
}

// Who does what, by kind of person (one function each, above).
const TALKS = {
  shopkeeper: talkToShopkeeper,
  academyMaster: talkToAcademyMaster,
  resident: talkToResident,
  arenaMaster: talkToArenaMaster,
  priest: talkToPriest,
  healer: talkToHealer,
  smith: talkToSmith,
  innkeeper: talkToInnkeeper,
  archivist: talkToArchivist,
  traveler: talkToTraveler,
};

// Talking to someone inside a big building: what this kind of person offers. Anyone else: a few words.
export function talkToSpecialPatron(game, patron, visit) {
  const talk = TALKS[patron.kind];
  if (talk) {
    talk(game, patron, visit);
    return;
  }
  const lines = {
    spectator: '"Put Obsidian Power behind your strikes when you enter the pit!"',
    captain: '"Keep a Kingdom Pass in your pack and your Guild rank rising."',
    watchman: '"We drill at the dummies every morning so roads stay safe."',
  };
  say(game, null, [patron.name + ': ' + (lines[patron.kind] || '"Safe travels, hero."')]);
}
