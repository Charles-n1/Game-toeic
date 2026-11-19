import { VILLAGES } from '../../data/zones';
import { KINGDOMS } from '../../data/kingdoms';
import { ITEMS } from '../../data/items';
import { WAR_SENTENCES } from '../../data/sentences/war';
import { pickRandom } from '../../../logic/random';
import { monsterCategory } from '../learning';
import { TAG_POWER, TAG_ATTACK, tagOf, higherTag } from '../skills';
import { startFight } from '../fight';
import { makeDuel } from '../duels';
import { earnLexis, gainXp, addItem } from '../player';
import { addHappiness } from '../village';
import { say, notify } from '../messages';
import { cue } from '../cues';
import {
  centerOfPlace,
  villageById,
  ensureRunWar,
  nextWarId,
  placeNearSpot,
  spawnWarEffect,
} from './state';
import { distance } from '../../world/geometry';

const MAX_SKIRMISHES = 1;
const SKIRMISH_INTERVAL = 38;

function kingdomColorOf(village) {
  const k = KINGDOMS.find((item) => item.id === village.kingdom);
  return k ? k.color : '#e8b83a';
}

function fighterLook(color, flip) {
  return {
    skin: flip ? '#e9b98f' : '#f3d2b3',
    hair: flip ? '#2b2b3a' : '#5a3a1e',
    style: 'short',
    eyes: '#3b3b3b',
    outfit: '#7d8597',
    trim: color,
    pants: '#4a435a',
    boots: '#3a2a1d',
    scarf: true,
    sword: true,
  };
}

function makeChampion(game, skirmish, winVillageId, loseVillageId, loseVillageName, color) {
  const category = monsterCategory(game);
  const tag = higherTag('normal', tagOf(game, category));
  return {
    id: nextWarId(game, 'champ'),
    warKind: 'skirmish',
    skirmishId: skirmish.id,
    sideWin: winVillageId,
    sideLose: loseVillageId,
    name: loseVillageName + ' Champion',
    species: 'soldier',
    art: 'darkKnight',
    shape: 'knight',
    tier: 'small',
    category: category,
    tag: tag,
    health: 26 * TAG_POWER[tag],
    maxHealth: 26 * TAG_POWER[tag],
    attack: 16 * TAG_ATTACK[tag],
    magicAttack: 0,
    resistance: 0.15,
    magicResistance: 0.1,
    speed: 11,
    xp: 22 * TAG_POWER[tag],
    lexis: 14 * TAG_POWER[tag],
    drops: ['warRations'],
    x: skirmish.x,
    y: skirmish.y,
    look: fighterLook(color, true),
  };
}

export function spawnRivalSkirmish(game, villageA = null, villageB = null) {
  ensureRunWar(game);
  let vA = villageA;
  let vB = villageB;
  if (!vA || !vB) {
    const candidates = VILLAGES.filter(
      (v) =>
        game.villages[v.id] &&
        game.villages[v.id].owner === 'people' &&
        v.rivals &&
        v.rivals.length > 0 &&
        distance(centerOfPlace(v), game.player) < 180
    );
    if (candidates.length === 0) return null;
    vA = pickRandom(candidates);
    const rivalId = pickRandom(vA.rivals.filter((id) => game.villages[id] && game.villages[id].owner === 'people'));
    if (!rivalId) return null;
    vB = villageById(rivalId);
    if (!vB) return null;
  }

  const cA = centerOfPlace(vA);
  const cB = centerOfPlace(vB);
  const angle = Math.atan2(cB.y - cA.y, cB.x - cA.x);
  const rawX = cA.x + Math.cos(angle) * (vA.w / 2 + 10);
  const rawY = cA.y + Math.sin(angle) * (vA.h / 2 + 10);
  const spot = placeNearSpot(game, rawX, rawY, 0, 6);

  const colorA = kingdomColorOf(vA);
  const colorB = kingdomColorOf(vB);
  const skirmish = {
    id: nextWarId(game, 'skirmish'),
    villageA: vA.id,
    villageB: vB.id,
    nameA: vA.name,
    nameB: vB.name,
    colorA: colorA,
    colorB: colorB,
    x: spot.x,
    y: spot.y,
    state: 'active',
    clashTimer: 0.6,
    until: Date.now() + 180000,
    fightersA: [
      { x: spot.x - 1.2, y: spot.y - 0.5, dir: 'right', look: fighterLook(colorA, false) },
      { x: spot.x - 1.3, y: spot.y + 0.6, dir: 'right', look: fighterLook(colorA, false) },
    ],
    fightersB: [
      { x: spot.x + 1.2, y: spot.y - 0.5, dir: 'left', look: fighterLook(colorB, true) },
      { x: spot.x + 1.3, y: spot.y + 0.6, dir: 'left', look: fighterLook(colorB, true) },
    ],
  };
  game.run.skirmishes.push(skirmish);
  if (distance(skirmish, game.player) < 50) {
    notify(game, '⚔️ Road skirmish between ' + vA.name + ' and ' + vB.name + '!', '#ffd23f');
  }
  return skirmish;
}

export function slowSkirmishes(game) {
  const now = Date.now();
  game.run.skirmishes = game.run.skirmishes.filter((s) => now < s.until && distance(s, game.player) < 220);
}

export function updateSkirmishes(game, dt) {
  const runWar = ensureRunWar(game);
  runWar.skirmishTimer -= dt;
  if (runWar.skirmishTimer <= 0) {
    runWar.skirmishTimer = SKIRMISH_INTERVAL;
    if (game.run.skirmishes.length < MAX_SKIRMISHES && Math.random() < 0.45) spawnRivalSkirmish(game);
  }

  for (const s of game.run.skirmishes) {
    if (s.state !== 'active') continue;
    s.clashTimer -= dt;
    if (s.clashTimer <= 0) {
      s.clashTimer = 1.25;
      spawnWarEffect(game, 'slash', s.x, s.y - 0.2, '#ffd23f', { life: 0.28 });
    }
  }
}

export function skirmishNear(game, range = 3.2) {
  return (game.run?.skirmishes || []).find((s) => s.state === 'active' && distance(s, game.player) <= range) || null;
}

export function interactSkirmish(game, skirmish) {
  if (!skirmish || skirmish.state !== 'active') return;
  const runWar = ensureRunWar(game);

  const launchChampion = (winId, loseId, loseName, color) => {
    const champ = makeChampion(game, skirmish, winId, loseId, loseName, color);
    startFight(game, champ);
    runWar.trackedFight = game.run.fight;
  };

  say(
    game,
    null,
    ['Militia of ' + skirmish.nameA + ' and ' + skirmish.nameB + ' clash on the road, steel clattering against pitchforks!'],
    [
      {
        label: 'Mediate a truce (Diplomacy: WAR_SENTENCES)',
        icon: 'talk',
        run: () => {
          const duel = makeDuel(
            { id: 'mediation', name: skirmish.nameA + ' & ' + skirmish.nameB, look: skirmish.fightersA[0].look },
            {
              title: 'Peace Mediation',
              category: 'connectors',
              tag: 'hard',
              questions: WAR_SENTENCES,
              health: 3,
              speed: 11,
              onWin: () => {
                skirmish.state = 'mediated';
                const vA = game.villages[skirmish.villageA];
                const vB = game.villages[skirmish.villageB];
                if (vA) vA.mood = Math.min(100, (vA.mood || 50) + 10);
                if (vB) vB.mood = Math.min(100, (vB.mood || 50) + 10);
                earnLexis(game, 50);
                gainXp(game, 30);
                addHappiness(game, 5);
                cue(game, 'warHorn');
                say(game, null, ['Both commanders lower their banners! A truce is sworn between ' + skirmish.nameA + ' and ' + skirmish.nameB + '. (+50 Lexis, +30 XP, +5 happiness)']);
              },
              onLose: () => {
                say(game, null, ['Your clumsy words anger both sides! ' + skirmish.nameB + "'s champion steps forward!"], [
                  { label: 'Defend yourself!', icon: 'woodSword', run: () => launchChampion(skirmish.villageA, skirmish.villageB, skirmish.nameB, skirmish.colorB) },
                ]);
              },
            }
          );
          startFight(game, duel);
          runWar.trackedFight = game.run.fight;
        },
      },
      {
        label: 'Side with ' + skirmish.nameA + ' (fight ' + skirmish.nameB + ')',
        icon: 'woodSword',
        run: () => launchChampion(skirmish.villageA, skirmish.villageB, skirmish.nameB, skirmish.colorB),
      },
      {
        label: 'Side with ' + skirmish.nameB + ' (fight ' + skirmish.nameA + ')',
        icon: 'woodSword',
        run: () => launchChampion(skirmish.villageB, skirmish.villageA, skirmish.nameA, skirmish.colorA),
      },
      { label: 'Leave them to settle it', run: () => {} },
    ]
  );
}

export function handleSkirmishFightEnd(game, fight) {
  const op = fight.opponent;
  if (!op || op.warKind !== 'skirmish') return false;
  if (fight.phase !== 'won') return true;

  const s = game.run.skirmishes.find((item) => item.id === op.skirmishId);
  if (s) s.state = 'resolved';
  const vWin = game.villages[op.sideWin];
  const vLose = game.villages[op.sideLose];
  if (vWin) vWin.mood = Math.min(100, (vWin.mood || 50) + 12);
  if (vLose) vLose.mood = Math.max(0, (vLose.mood || 50) - 8);
  earnLexis(game, 40);
  const prize = pickRandom(['warShield', 'sturdyPitchfork', 'warTrophy']);
  addItem(game.player, prize);
  const winVillage = villageById(op.sideWin);
  notify(game, '⚔️ Victory for ' + (winVillage ? winVillage.name : 'your allies') + '! +40 Lexis & ' + ITEMS[prize].name, '#7CFC9A');
  return true;
}
