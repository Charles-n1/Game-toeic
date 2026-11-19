import { NPCS } from '../data/npcs';
import { PLAZAS, FIELDS, zoneAt, insideOf, villageOf } from '../data/zones';
import { propsAround } from '../world/map';
import { bestGateOf, findPath, followPath, stepSmart } from '../world/paths';
import { econVillage } from './economy';
import { isEncountered } from './encounters';
import { guildChoice } from './guild';
import { maxPartySize, dailyWageOf } from './guild/ranks';
import { rulerChoices } from './kingdomLaws';
import { studyLanguageChoices, translateForHero } from './languages';
import { LESSON_PRICE, LESSON_FRIENDSHIP, POWERS } from '../data/powers';
import { ITEMS } from '../data/items';
import { pickRandom } from '../../logic/random';
import { isSolid } from '../world/map';
import { isNight } from './clock';
import { facingOf } from './input';
import { passHours } from './days';
import { addFriendship, addHappiness, shareFeelings } from './village';
import { classChoice } from './classes';
import { schoolChoice, teacherChoice } from './school';
import { sparringChoice } from './sparring';
import { marry, partnerOf, childrenOf } from './families';
import { activeQuestOf, offeredQuest, isQuestReady, questProgress, startQuest, finishQuest } from './quests';
import { workAsScribe, playWordSprint } from './duels';
import { countItem, removeItem } from './player';
import { say, notify } from './messages';
import { emote } from './emotes';
import { cue } from './cues';
import { burst } from './particles';
import { startFight } from './fight';
import { isNpcKidnapped } from './war';
import { revealCrystalCave, isVillain } from './society';
import { addInfamy } from './society/state';
import { isStationedInTraining, setExpression, voiceSoundFor, npcBondChoices } from './bonds';
import { recognizeChoice, rivalChoice } from './isekai/classmates';
import { EARTH_ROYALTIES } from '../data/realism';
import { canShopServeHero } from './realism/index';
import { ensureRealism, isTierEnabled } from './realism/state';
import { reportWitnessedCrime, payOffFinesOrDefend, registerEarthRecipeRoyalty } from './realism/financeAndLaw';
import { rememberNpcInteraction, recallNpcMemoryLine, triggerJealousyCheck } from './realism/socialAndCodex';
import {
  handleTomoSoulTalk,
  personalArcChoice,
  soulDynamicGreeting,
  bondSceneChoice,
  soulStoryQuestChoices,
  triggerWeddingSpeechSoul,
  heroVoiceChoice,
  triggerCorvinMystery,
} from './soul';

// The people on the map: where they are, and everything the player can do with them.

export const FRIEND_STEPS = [0, 20, 50, 80]; // the friendship needed to hear each line of their life
const RECRUIT_FRIENDSHIP = 50;
const DATE_FRIENDSHIP = 50;
const PROPOSE_FRIENDSHIP = 80;
const TALK_RANGE = 1.5; // tiles

// ---------- Where they are ----------

const SLEEP_FROM = 22; // the people of the villages sleep (inside, not on the map) from 22:00...
const SLEEP_UNTIL = 6; // ...to 6:00
const ERRAND_EVERY = [30, 90]; // seconds between two walks of a person (to the square, the well, a neighbor...)

// Where someone lives: their spot in data/npcs.js. Married to the hero: inside the home of the hero.
function homeOf(game, npc) {
  if (game.player.spouse === npc.id) {
    const home = insideOf('home');
    return { x: home.x + 6.5, y: home.y + 5.5 };
  }
  return { x: npc.x, y: npc.y };
}

// Puts everyone at home (when the game opens).
export function placePeople(game) {
  for (const npc of NPCS) {
    const home = homeOf(game, npc);
    game.run.people[npc.id] = { x: home.x, y: home.y, walkX: 0, walkY: 0, walkTime: 0, step: 0, dir: 'down', path: null, errandTime: 10 + Math.random() * 60, away: false };
  }
}

function isSleepTime(game) {
  return game.hour >= SLEEP_FROM || game.hour < SLEEP_UNTIL;
}

// On the map right now? Alive, not inside a building, not following the hero, not carried.
export function isOutside(game, npc) {
  const state = game.npcs[npc.id];
  const place = game.run?.people?.[npc.id];
  if (!state.alive || game.player.party.includes(npc.id) || game.player.carrying?.id === npc.id) return false;
  if (place?.indoors) return false;
  if (isNpcKidnapped(game, npc.id) || isStationedInTraining(game, npc.id)) return false;
  if (state.ko) return true;
  if (game.player.spouse === npc.id) return true;
  if (npc.wanderer) return isEncountered(game, npc.id);
  if (npc.guild) return false;
  if (npc.nightOnly) return isNight(game);
  return !isSleepTime(game);
}

// NPCs walk real schedules around shops, houses (entering & exiting!), economy stalls, and outside gates to explore.
function errandSpots(npc) {
  const zone = zoneAt(npc.x, npc.y);
  if (zone.kind !== 'village') return [];
  const vHouses = (villageOf(zone.id)?.plan?.houses || []).filter((h) => h.role !== 'palace');
  const doors = vHouses.map((h) => ({ x: h.x + Math.floor(h.w / 2) + 0.5, y: h.y + h.h + 0.5, house: h, isDoor: true }));
  const spots = [...PLAZAS, ...FIELDS].filter((item) => zoneAt(item.x, item.y).id === zone.id).map((item) => ({ x: item.x + Math.floor(item.w / 2), y: item.y + item.h }));
  const wells = propsAround(npc.x, npc.y, 60).filter((prop) => prop.kind === 'well' && zoneAt(prop.x, prop.y).id === zone.id).map((prop) => ({ x: prop.x, y: prop.y + 1 }));
  return [...spots, ...wells, ...doors];
}

function npcEconomicExchange(game, npc, house) {
  const vid = house?.village || npc.at?.[0];
  if (!vid) return;
  const vEcon = econVillage(game, vid);
  if (!vEcon) return;
  const keys = Object.keys(vEcon.inputs || {});
  if (keys.length === 0) return;
  const picked = pickRandom(keys);
  if (house?.role === 'market' || house?.role === 'forge' || house?.role === 'potions') {
    vEcon.inputs[picked] = (vEcon.inputs[picked] || 0) + 1;
    vEcon.treasury = (vEcon.treasury || 0) + 4;
  } else if ((vEcon.inputs[picked] || 0) > 1) {
    vEcon.inputs[picked] -= 1;
    vEcon.treasury = Math.max(0, (vEcon.treasury || 0) + 3);
  }
}

function handleExploringNpc(game, npc, place, dt) {
  const nearbyFoe = (game.run.monsters || []).find((m) => !m.boss && m.health > 0 && Math.hypot(m.x - place.x, m.y - place.y) < 4.5);
  if (nearbyFoe) {
    if (npc.fighter) {
      const distFoe = Math.hypot(nearbyFoe.x - place.x, nearbyFoe.y - place.y);
      if (distFoe > 1.3) {
        stepSmart(place, nearbyFoe.x, nearbyFoe.y, 2.0, dt);
      } else {
        place.walking = false;
        place.dir = facingOf(nearbyFoe.x - place.x, nearbyFoe.y - place.y);
        place._atkCd = (place._atkCd || 0) - dt;
        if (place._atkCd <= 0) {
          place._atkCd = 1.05;
          nearbyFoe.health -= 14;
          nearbyFoe.hitAt = Date.now();
          burst(game, nearbyFoe.x, nearbyFoe.y - 0.3, '#ffd23f', 6);
        }
      }
      return;
    }
    // Non-fighters actively evade & flee back through town gate instead of walking into monsters
    const home = homeOf(game, npc);
    stepSmart(place, home.x, home.y, 2.2, dt);
    return;
  }

  const dest = place.exploreTarget;
  if (!dest || Date.now() > (place.exploreUntil || 0) || Math.hypot(dest.x - place.x, dest.y - place.y) < 1.5) {
    place.exploreTarget = null;
    place.returningFromExplore = true;
  }
  if (place.returningFromExplore) {
    const home = homeOf(game, npc);
    if (Math.hypot(home.x - place.x, home.y - place.y) < 2.2 || !stepSmart(place, home.x, home.y, 1.6, dt)) {
      place.exploring = false;
      place.returningFromExplore = false;
      place.errandTime = 15 + Math.random() * 20;
    }
    return;
  }
  stepSmart(place, dest.x, dest.y, 1.5, dt);
}

function runErrands(game, npc, dt) {
  const place = game.run.people[npc.id];
  if (place.exploring) {
    handleExploringNpc(game, npc, place, dt);
    return true;
  }
  if (place.targetPoint) {
    const far = Math.hypot(place.targetPoint.x - place.x, place.targetPoint.y - place.y);
    if (far < 0.9 || !stepSmart(place, place.targetPoint.x, place.targetPoint.y, 1.45, dt, { stayInside: !place.targetOutside })) {
      const doneTarget = place.targetPoint;
      place.targetPoint = null;
      place.targetOutside = false;
      place.walking = false;
      if (doneTarget.isDoor && doneTarget.house && !npc.wanderer) {
        npcEconomicExchange(game, npc, doneTarget.house);
        if (Math.random() < 0.65) {
          place.indoors = {
            village: doneTarget.house.village,
            role: doneTarget.house.role,
            house: doneTarget.house,
            untilTime: Date.now() + 24000,
          };
          return true;
        }
      }
      place.errandTime = place.away ? 8 + Math.random() * 14 : 16 + Math.random() * 28;
      return true;
    }
    return true;
  }
  if (place.path) {
    if (followPath(place, 1.4, dt)) {
      place.path = null;
      place.errandTime = 12 + Math.random() * 16;
    }
    return true;
  }
  place.errandTime -= dt;
  if (place.errandTime > 0) return false;

  const z = zoneAt(place.x, place.y);
  // Adventure/Fighter/Merchant/Gatherer NPCs sometimes exit open gates to explore & interact outside town!
  const canRoamOut = !npc.child && !npc.guild && z.kind === 'village' && (npc.fighter || ['aria', 'hugo', 'mira', 'yuki'].includes(npc.id));
  if (canRoamOut && !place.away && Math.random() < 0.22) {
    const angle = Math.random() * Math.PI * 2;
    const outSpot = { x: place.x + Math.cos(angle) * 28, y: place.y + Math.sin(angle) * 28 };
    const gate = bestGateOf(z, outSpot);
    if (gate && !isSolid(gate.outside.x + Math.cos(angle) * 6, gate.outside.y + Math.sin(angle) * 6)) {
      place.exploring = true;
      place.returningFromExplore = false;
      place.exploreTarget = { x: gate.outside.x + Math.cos(angle) * 10, y: gate.outside.y + Math.sin(angle) * 10 };
      place.exploreUntil = Date.now() + 26000;
      return true;
    }
  }

  const home = homeOf(game, npc);
  const spots = errandSpots(npc);
  if (place.away || spots.length === 0) {
    place.targetPoint = { x: home.x, y: home.y };
    place.away = false;
  } else {
    place.targetPoint = pickRandom(spots);
    place.away = true;
  }
  return true;
}

export function updatePeople(game, dt) {
  const player = game.player;
  const now = Date.now();
  for (const npc of NPCS) {
    const place = game.run.people[npc.id];
    if (place?.indoors && now >= place.indoors.untilTime) {
      place.indoors = null; // exits house back onto street cleanly
    }
    const isVisible = isOutside(game, npc);
    game.run.visible[npc.id] = isVisible;
    if (!isVisible || game.npcs[npc.id].ko) continue;
    const isListening = Math.hypot(place.x - player.x, place.y - player.y) < TALK_RANGE;
    if (isListening && !place.exploring) {
      place.walking = false;
      place.dir = facingOf(player.x - place.x, player.y - place.y);
    } else {
      runErrands(game, npc, dt);
    }
  }
}

// The closest person the player can talk to (undefined = nobody near).
export function personNear(game) {
  let closest;
  let best = TALK_RANGE;
  for (const npc of NPCS.filter((item) => isOutside(game, item) && !game.npcs[item.id].ko)) {
    const place = game.run.people[npc.id];
    const far = Math.hypot(place.x - game.player.x, place.y - game.player.y);
    if (far < best) {
      closest = npc;
      best = far;
    }
  }
  return closest;
}

// ---------- Talking ----------

// The next line of their life the player has earned (null = nothing new for now).
function nextLifeLine(game, npc) {
  const state = game.npcs[npc.id];
  if (state.told >= npc.life.length || state.friendship < FRIEND_STEPS[state.told]) return null;
  state.told += 1;
  return npc.life[state.told - 1];
}

function chat(game, npc) {
  if (npc.id === 'tomo' && handleTomoSoulTalk(game)) return;
  if (npc.id === 'corvin' && Math.random() < 0.35) {
    triggerCorvinMystery(game);
    return;
  }
  const state = game.npcs[npc.id];
  if (state.talkedDay !== game.day) addFriendship(game, npc.id, 3); // the first talk of the day counts
  state.talkedDay = game.day;
  const mem = game?.realism ? recallNpcMemoryLine(game, npc.id) : null;
  const lines = [nextLifeLine(game, npc) || pickRandom(npc.hello)];
  if (mem && Math.random() < 0.6) lines.push(npc.name + ' recalls: "' + mem + '"');
  say(game, npc.id, lines);
}

function greeting(game, npc) {
  const children = childrenOf(game, npc.id);
  if (game.player.spouse === npc.id) return children.length > 0 ? 'Welcome home. ' + children[children.length - 1] + ' finally sleeps.' : 'Welcome home, my love.';
  if (children.length > 0 && Math.random() < 0.4) return 'Little ' + children[children.length - 1] + ' said a first word today!';
  const soulLine = soulDynamicGreeting(game, npc);
  if (soulLine) return soulLine;
  const scars = game?.realism ? ensureRealism(game).health.scars : [];
  if (scars?.length > 0 && Math.random() < 0.22) {
    return npc.romance
      ? 'That scar looks serious... You really should be more careful out there.'
      : 'Those battle scars tell everyone you have faced real beasts.';
  }
  return pickRandom(npc.hello);
}

// ---------- The choices of the talk menu. Each function returns a choice, or null if it does not apply. ----------

function talkChoice(game, npc) {
  return { label: 'Talk', run: () => chat(game, npc) };
}

function giftChoice(game, npc) {
  const itemId = npc.likes.find((id) => countItem(game.player, id) > 0);
  if (!itemId) return null;
  function give() {
    removeItem(game.player, itemId);
    addFriendship(game, npc.id, 6);
    if (game?.realism) rememberNpcInteraction(game, npc.id, 'Gave you a cherished ' + ITEMS[itemId].name + '.');
    shareFeelings(game, npc.id); // their friends are happy for them, their rivals a bit jealous
    emote(game, npc.id, 'heart');
    say(game, npc.id, ['A ' + ITEMS[itemId].name.toLowerCase() + '? For me? Thank you!']);
  }
  return { label: 'Give: ' + ITEMS[itemId].name, icon: itemId, run: give };
}

function activeQuestChoice(game, npc) {
  const quest = activeQuestOf(game, npc.id);
  if (!quest) return null;
  const progress = questProgress(game, quest);
  function report() {
    if (!isQuestReady(game, quest)) {
      say(game, npc.id, [quest.ask]);
      return;
    }
    finishQuest(game, quest);
    emote(game, npc.id, 'note');
    say(game, npc.id, [quest.thanks]);
  }
  return { label: 'Quest: ' + quest.title + ' (' + progress.have + '/' + progress.need + ')', icon: 'quests', run: report };
}

function newQuestChoice(game, npc) {
  const quest = offeredQuest(game, npc.id);
  if (!quest) return null;
  function ask() {
    say(game, npc.id, [quest.ask], [
      { label: 'I will help', run: () => startQuest(game, quest) },
      { label: 'Not now', run: () => {} },
    ]);
  }
  return { label: 'Need help?', icon: 'quests', run: ask };
}

function shopChoice(game, npc) {
  if (!npc.shop) return null;
  function open() {
    const vid = npc.at?.[0] || 'lexia';
    if (game?.realism) {
      const gate = canShopServeHero(game, npc.shop, vid);
      if (!gate.open) {
        const fineAmt = ensureRealism(game).fines?.total || 0;
        const choices = fineAmt > 0 ? [{ label: 'Resolve Municipal Fines (' + fineAmt + 'L)', icon: 'lexis', run: () => payOffFinesOrDefend(game) }, { label: 'Leave', run: () => {} }] : [];
        say(game, npc.id, [gate.reason], choices);
        return;
      }
    }
    game.run.shop = { npcId: npc.id, kind: npc.shop };
    game.run.screen = 'shop';
  }
  return { label: npc.shop === 'forge' ? 'Forge: upgrade my gear' : 'Shop', icon: npc.shop === 'forge' ? 'ironSword' : 'lexis', run: open };
}

function earthRoyaltyChoice(game, npc) {
  if (npc.shop !== 'otherworld' || !game?.realism) return null;
  const r = ensureRealism(game);
  const candidate = Object.keys(EARTH_ROYALTIES).find((id) => countItem(game.player, id) > 0 && !r.patents.royalties[id]?.active);
  if (!candidate) return null;
  return {
    label: 'License ' + (ITEMS[candidate]?.name || candidate) + ' Royalty',
    icon: candidate,
    run: () => registerEarthRecipeRoyalty(game, candidate),
  };
}

function workChoice(game, npc) {
  if (npc.job !== 'scribe') return null;
  return { label: 'Work as a scribe (4 Lexis a line)', icon: 'book', run: () => workAsScribe(game, npc) };
}

function playChoice(game, npc) {
  if (!npc.game) return null;
  return { label: 'Play Word Sprint', icon: 'powers', run: () => playWordSprint(game, npc) };
}

function lessonChoice(game, npc) {
  if (!npc.teaches || game.player.powers.includes(npc.teaches)) return null;
  const power = POWERS.find((item) => item.key === npc.teaches);
  function learn() {
    if (game.npcs[npc.id].friendship < LESSON_FRIENDSHIP) {
      say(game, npc.id, ['I only teach my friends. Talk to me more, help me... then we will see.']);
    } else if (game.player.lexis < LESSON_PRICE) {
      say(game, npc.id, ['A lesson costs ' + LESSON_PRICE + ' Lexis. Come back when you have them.']);
    } else {
      game.player.lexis -= LESSON_PRICE;
      game.player.powers.push(npc.teaches);
      say(game, npc.id, ['Close your eyes. Say the word, and mean it.', 'You learned ' + power.name + '! Open the menu: Powers.']);
    }
  }
  return { label: 'Teach me ' + power.name + ' (' + LESSON_PRICE + ' Lexis)', icon: power.id, run: learn };
}

function recruitChoice(game, npc) {
  if (!npc.fighter) return null;
  const isCloseFriend = game.player.spouse === npc.id || (game.npcs[npc.id]?.friendship || 0) >= 85;
  const retainer = isCloseFriend ? 0 : Math.round((npc.fee || 150) * 0.25);
  const wage = dailyWageOf(game, npc.id);
  function recruit() {
    const cap = maxPartySize(game);
    if (game.npcs[npc.id].friendship < RECRUIT_FRIENDSHIP) {
      say(game, npc.id, ['I do not follow strangers into battle. Earn my trust first (Friendship 50) or hire through the Guild.']);
    } else if (game.player.party.length >= cap) {
      say(game, npc.id, ['You already have ' + cap + ' companions for your Guild Rank. Raise your Guild Rank or send someone home.']);
    } else if (game.player.lexis < retainer) {
      say(game, npc.id, ['Even among friends, supplies cost coin. I need ' + retainer + ' Lexis up front.']);
    } else {
      game.player.lexis -= retainer;
      game.player.party.push(npc.id);
      notify(game, '⚔️ ' + npc.name + ' joins you!' + (retainer > 0 ? ' (-' + retainer + ' Lexis retainer)' : '') + (wage > 0 ? ' · ' + wage + ' Lexis/day' : ''), '#7CFC9A');
    }
  }
  return {
    label: retainer > 0 ? 'Recruit ally (' + retainer + ' Lexis, ' + wage + '/day)' : 'Fight by my side (' + (wage > 0 ? wage + '/day' : 'Free') + ')',
    icon: 'woodSword',
    run: recruit,
  };
}

// She is free if she has no family, or if her family is the player.
function isFreeFor(game, npc) {
  const partner = partnerOf(game, npc.id);
  return partner === null || partner === 'player';
}

function dateChoice(game, npc) {
  if (!npc.romance || !isFreeFor(game, npc)) return null;
  const state = game.npcs[npc.id];
  function date() {
    if (state.friendship < DATE_FRIENDSHIP) {
      say(game, npc.id, ['A walk, with you? Maybe when we know each other better.']);
    } else if (state.datedDay === game.day) {
      say(game, npc.id, ['We already spent today together. Tomorrow?']);
    } else {
      const real = game?.realism ? ensureRealism(game) : null;
      if (real && isTierEnabled(game, 'C') && (real.health.cleanliness ?? 90) < 35) {
        addFriendship(game, npc.id, -1);
        say(game, npc.id, ['Phew... You smell like swamp mud and goblin blood! Wash with soap or take a bath first!']);
        return;
      }
      state.datedDay = game.day;
      addFriendship(game, npc.id, 8);
      if (real) {
        rememberNpcInteraction(game, npc.id, 'Went for a pleasant walk together.');
        triggerJealousyCheck(game, npc.id);
      }
      addHappiness(game, 1);
      passHours(game, 2);
      say(game, null, ['You walk together until the light changes. ' + npc.name + ' talks, and you listen to every word.']);
    }
  }
  return { label: 'Spend time together', icon: 'flower', run: date };
}

function proposeChoice(game, npc) {
  const state = game.npcs[npc.id];
  const canAsk = npc.romance && game.player.spouse === null && partnerOf(game, npc.id) === null && state.friendship >= DATE_FRIENDSHIP;
  if (!canAsk) return null;
  function propose() {
    if (state.friendship < PROPOSE_FRIENDSHIP) {
      say(game, npc.id, ['...Not yet. Ask me again when you are sure. When I am sure.']);
    } else if (countItem(game.player, 'ring') === 0) {
      say(game, npc.id, ['You are asking without a ring? Rin sells one, in Seabridge. Go. I will wait.']);
    } else {
      removeItem(game.player, 'ring');
      game.player.spouse = npc.id;
      marry(game, 'player', npc.id, 6);
      addHappiness(game, 5);
      say(game, npc.id, ['Yes. In every tense: I did, I do, I will.', 'The whole village comes to the wedding. ' + npc.name + ' moves into your home.']);
      triggerWeddingSpeechSoul(game, npc.name);
    }
  }
  return { label: 'Will you marry me?', icon: 'ring', run: propose };
}

function crystalChoice(game, npc) {
  if (npc.shop !== 'forge') return null;
  return { label: 'Ask about magic crystal caves', icon: 'crystal', run: () => revealCrystalCave(game, npc.name) };
}

function strikeNpcChoice(game, npc) {
  return {
    label: 'Strike ' + npc.name + ' (Villain)',
    icon: 'sword',
    run: () => {
      cue(game, 'punch');
      setExpression(game, npc.id, 'anger');
      addFriendship(game, npc.id, -20);
      addInfamy(game, 15);
      addHappiness(game, -3);
      if (game?.realism) reportWitnessedCrime(game, 'Assaulted ' + npc.name, 40);
      const place = game.run.people[npc.id];
      if (place) burst(game, place.x, place.y - 0.6, '#ff5a6e', 16);
      if (game.run.villagers) {
        const zone = zoneAt(game.player.x, game.player.y);
        for (const v of game.run.villagers) {
          if (v.village === zone.id && v.knight && !v.ko && !v.dead) v.angry = 60;
        }
      }
      if (npc.fighter && !game.npcs[npc.id].ko) {
        startFight(game, {
          name: npc.name,
          category: 'connectors',
          tier: 'small',
          tag: 'normal',
          shape: 'knight',
          health: 85,
          maxHealth: 85,
          attack: 22,
          magicAttack: 0,
          speed: 11,
          resistance: 0.1,
          magicResistance: 0.1,
          xp: 55,
          lexis: 30,
          onWin: () => {
            game.npcs[npc.id].ko = true;
            notify(game, '💥 You defeated ' + npc.name + '! (+15 Infamy)', '#ff8a95');
          },
          onLose: () => notify(game, npc.name + ' bested you and walked away.', '#ff8a95'),
        });
        return;
      }
      game.npcs[npc.id].ko = true;
      notify(game, '💥 You knocked down ' + npc.name + '! (+15 Infamy)', '#ff8a95');
    },
  };
}

const CHOICE_MAKERS = [
  recognizeChoice,
  talkChoice,
  heroVoiceChoice,
  personalArcChoice,
  bondSceneChoice,
  rivalChoice,
  sparringChoice,
  activeQuestChoice,
  newQuestChoice,
  shopChoice,
  earthRoyaltyChoice,
  crystalChoice,
  guildChoice,
  teacherChoice,
  schoolChoice,
  classChoice,
  workChoice,
  playChoice,
  giftChoice,
  lessonChoice,
  recruitChoice,
  dateChoice,
  proposeChoice,
];

// The player talks to someone: a hello, then everything they can do together.
export function talkTo(game, npc) {
  const state = game.npcs[npc.id];
  state.met = true; // shown in the Relations of the menu
  const mood = isVillain(game) || state.friendship < 0 ? 'anger' : game.player.spouse === npc.id ? 'love' : 'joy';
  setExpression(game, npc.id, mood);
  cue(game, voiceSoundFor(npc.id));
  const greetingLine = npc.teachesLanguage ? translateForHero(game, npc.teachesLanguage, greeting(game, npc)) : greeting(game, npc);
  const studyChoice = studyLanguageChoices(game, npc);
  const choices = [
    ...rulerChoices(game, npc),
    ...(studyChoice ? [studyChoice] : []),
    ...soulStoryQuestChoices(game, npc),
    ...CHOICE_MAKERS.map((make) => make(game, npc)).filter((choice) => choice !== null),
    ...npcBondChoices(game, npc),
    strikeNpcChoice(game, npc),
  ];
  choices.push({ label: 'Leave', run: () => {} });
  say(game, npc.id, [greetingLine], choices);
}

// A companion goes back home.
export function sendHome(game, npcId) {
  game.player.party = game.player.party.filter((id) => id !== npcId);
  placePeople(game);
}
