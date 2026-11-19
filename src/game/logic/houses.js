import { NPCS } from '../data/npcs';
import { HOME_DOOR, insideOf, houseAtDoor, villageOf, zoneAt } from '../data/zones';
import { TILE } from '../world/tileKinds';
import { setTile, fillRect } from '../world/grid';
import { bumpMapRevision, propsAround } from '../world/map';
import { refreshWorld } from './worldState';
import { say, notify } from './messages';
import { cue } from './cues';
import { cureCold } from './weather';
import { passHours } from './days';
import { healFully } from './player';
import { buildGuildHall, applyGuildFloor } from './guildHall';
import { ensureGuild } from './guild/ranks';
import { talkTo } from './people';
import { frontTile } from './input';
import { academyForRole } from '../data/classes';
import { applySleepQualityRecovery } from './realism/bodyHealth';
import { maybeTriggerEarthDream } from './realism/englishWorld';
import { checkPalaceCourtEtiquette } from './realism/socialAndCodex';
import { buildVisitedHouse } from './houses/homes';
import { SPECIAL_ROLES, SPECIAL_NOTIFY, buildPalaceHall, buildSpecialHall } from './houses/halls';
import { talkToSpecialPatron } from './houses/hallTalk';

export { updateHouseResidents } from './houses/residents'; // the life of the people inside (moved there)

// Entering other villagers' and NPCs' houses: dining room, bathroom/toilets, and 1 or 2 bedrooms depending on family.

export function isInVisitedHouse(game) {
  return zoneAt(game.player.x, game.player.y).id === 'visitHouse';
}

export function applyVisitedFloor(game, visit, floor = 0) {
  if (!visit?.floorData?.[floor]) return false;
  if (visit.guild) {
    applyGuildFloor(visit, floor);
  } else {
    const f = visit.floorData[floor];
    visit.floor = floor;
    visit.title = f.title;
    visit.props = f.props;
    visit.patrons = f.patrons;
    f.paint();
    if (visit.mat) setTile(visit.mat.x, visit.mat.y, floor === 0 ? TILE.STAIRS : TILE.WALL);
  }
  bumpMapRevision();
  refreshWorld(game);
  return true;
}

export function enterHeroUpperFloor(game, travelFn) {
  const inside = insideOf('visitHouse');
  const home = insideOf('home');
  const { x, y, w, h } = inside;
  const props = [
    { kind: 'stairsDown', x: x + 10, y: y + 13, w: 1, h: 1, walkable: true },
    { kind: 'bed', x: x + 14, y: y + 3, w: 2, h: 2, fixed: true },
    { kind: 'wardrobe', x: x + 19, y: y + 3, w: 1, h: 1, fixed: true },
    { kind: 'diningTable', x: x + 5, y: y + 6, w: 2, h: 1, fixed: true },
    { kind: 'storage', x: x + 2, y: y + 3, w: 1, h: 1, fixed: true },
    { kind: 'banner', color: '#ffd23f', x: x + 5, y: y + 2, w: 1, h: 1, walkable: true },
    { kind: 'banner', color: '#4a7ec8', x: x + 8, y: y + 2, w: 1, h: 1, walkable: true },
    { kind: 'window', x: x + 6, y: y + 1, w: 2, h: 1, walkable: true },
    { kind: 'window', x: x + 15, y: y + 1, w: 2, h: 1, walkable: true },
    { kind: 'toilet', x: x + 19, y: y + 12, w: 1, h: 1, fixed: true },
    { kind: 'basin', x: x + 17, y: y + 12, w: 1, h: 1, fixed: true },
  ];
  const companions = (game.player.party || [])
    .map((id) => NPCS.find((n) => n.id === id))
    .filter(Boolean)
    .slice(0, 2)
    .map((n, idx) => ({
      kind: 'resident',
      npcId: n.id,
      name: n.name,
      look: n.look,
      x: x + 6 + idx * 1.4,
      y: y + 7.4,
      dir: 'down',
      activity: idx === 0 ? 'drinking' : 'idle',
      actTimer: 5,
      diningSpot: { x: x + 5.5 + idx, y: y + 7.4 },
      homeBed: { x: x + 14.2 + idx, y: y + 4.3 },
      playSpot: { x: x + 7.5, y: y + 10 },
    }));
  const visit = {
    heroUpper: true,
    house: { village: 'lexia', role: 'home', x: HOME_DOOR.x - 1, y: HOME_DOOR.y - 2, w: 3, h: 3 },
    floor: 1,
    info: { names: [game.player.name] },
    title: "Hero's House (2F · Trophy Loft & Bedroom)",
    isFamily: false,
    props,
    patrons: companions,
    mat: { x: x + 10, y: y + 13 }, // triggers return to downstairs home
    landing: { x: x + 10.5, y: y + 12.2 },
    exit: { x: home.x + home.w - 2.5, y: home.y + home.h - 2.5 },
  };
  fillRect(x, y, w, h, TILE.WALL);
  fillRect(x + 1, y + 2, 10, h - 3, TILE.WOOD_FLOOR);
  fillRect(x + 12, y + 2, 9, 7, TILE.RUG); // Carpeted bedroom loft
  fillRect(x + 12, y + 10, 9, h - 11, TILE.FLOOR);
  fillRect(x + 11, y + 2, 1, h - 3, TILE.WALL);
  setTile(x + 11, y + 5, TILE.WOOD_FLOOR);
  fillRect(x + 12, y + 9, 9, 1, TILE.WALL);
  setTile(x + 15, y + 9, TILE.FLOOR);

  game.run.visitHouse = visit;
  bumpMapRevision();
  refreshWorld(game);
  travelFn(game, visit.landing.x, visit.landing.y);
  game.run.lastLink = Math.floor(visit.landing.x) + ',' + Math.floor(visit.landing.y);
  cue(game, 'step');
  notify(game, '🏠 Upstairs Loft (2F): bedroom carpet & trophy overlook!', '#ffd86b');
}

export function enterVisitedHouse(game, house, travelFn) {
  const visit =
    house.role === 'guild'
      ? buildGuildHall(game, house)
      : house.role === 'palace'
        ? buildPalaceHall(game, house)
        : SPECIAL_ROLES.has(house.role)
          ? buildSpecialHall(house)
          : buildVisitedHouse(game, house);
  game.run.visitHouse = visit;
  bumpMapRevision();
  refreshWorld(game);
  travelFn(game, visit.landing.x, visit.landing.y);
  game.run.lastLink = visit.mat.x + ',' + (visit.mat.y - 1);
  cue(game, 'step');
  if (visit.guild) {
    notify(game, '🍺 ' + visit.title + ': drinks at the bar, quests on the board, stairs lead upstairs.', '#ffd86b');
    if (!ensureGuild(game).registered) notify(game, '🪪 No Adventurer Card yet? Odile makes them, at the desk by the door.', '#ffd23f');
    return;
  }
  if (visit.palace) {
    notify(game, '👑 ' + visit.title + ': speak with the sovereign on the dais.', '#ffd86b');
    return;
  }
  if (visit.specialRole && SPECIAL_NOTIFY[visit.specialRole]) {
    notify(game, SPECIAL_NOTIFY[visit.specialRole](visit.title), '#ffd86b');
    return;
  }
  const acad = visit.specialRole ? academyForRole(visit.specialRole) : null;
  if (acad) {
    notify(game, '🎓 ' + visit.title + ': speak with the Headmaster or explore upstairs quarters!', '#ffd86b');
    return;
  }
  const layout = visit.isFamily ? 'Dining Room, Washroom, Carpeted Bedrooms & 2F Upstairs' : 'Dining Room, Washroom, Carpeted Bedroom & 2F Upstairs';
  notify(game, '🏠 ' + visit.title + ' (' + layout + ')', '#ffd86b');
}

export function exitVisitedHouseIfStairs(game, travelFn) {
  const visit = game.run.visitHouse;
  const tx = Math.floor(game.player.x);
  const ty = Math.floor(game.player.y);
  const hereKey = tx + ',' + ty;

  // Climb from Hero's Home Ground Floor (insideOf('home')) to 2F Loft
  if (!visit && zoneAt(game.player.x, game.player.y).id === 'home') {
    const upStair = propsAround(game.player.x, game.player.y, 1.1).find((p) => p.kind === 'stairsUp' && tx === p.x && ty === p.y);
    if (upStair && game.run.lastLink !== hereKey) {
      enterHeroUpperFloor(game, travelFn);
      return true;
    }
    return false;
  }

  if (!visit) return false;
  if (game.run.lastLink === hereKey) return false;

  // Toggle Floor 0 <-> Floor 1 on interior stair props
  const stairProp = (visit.props || []).find((p) => (p.kind === 'stairsUp' || p.kind === 'stairsDown') && tx === p.x && ty === p.y);
  if (stairProp && !visit.heroUpper && visit.floorData) {
    const nextFloor = stairProp.kind === 'stairsUp' ? 1 : 0;
    applyVisitedFloor(game, visit, nextFloor);
    game.run.lastLink = hereKey;
    cue(game, 'step');
    notify(game, nextFloor === 1 ? '⬆️ ' + visit.title : '⬇️ ' + visit.title, '#ffd86b');
    return true;
  }

  if (tx !== visit.mat.x || ty !== visit.mat.y) return false;
  const exit = visit.exit;
  game.run.visitHouse = null;
  bumpMapRevision();
  refreshWorld(game);
  travelFn(game, exit.x, exit.y);
  game.run.lastLink = Math.floor(exit.x) + ',' + Math.floor(exit.y);
  cue(game, 'step');
  return true;
}

export function actionsOfHouses(game, travelFn) {
  const front = frontTile(game.player);
  const doorHouse = zoneAt(game.player.x, game.player.y).kind !== 'inside' ? houseAtDoor(front.x, front.y) : null;
  const inVisit = isInVisitedHouse(game);
  const near = inVisit ? propsAround(game.player.x, game.player.y, 1.8) : [];
  const visit = game.run.visitHouse;

  return [
    {
      when: () => inVisit && Array.isArray(visit?.patrons) && !visit.guild && visit.patrons.some((p) => Math.hypot(p.x - game.player.x, p.y - game.player.y) < 1.8),
      icon: 'talk',
      run: () => {
        const p = visit.patrons.find((pat) => Math.hypot(pat.x - game.player.x, pat.y - game.player.y) < 1.8);
        if (visit?.palace && game?.realism) {
          const court = checkPalaceCourtEtiquette(game);
          if (!court.ok) return say(game, null, [court.reason]);
        }
        if (p?.npcId) talkTo(game, NPCS.find((n) => n.id === p.npcId));
        else if (p && (visit.specialRole || p.kind === 'resident' || p.kind === 'shopkeeper' || p.kind === 'academyMaster')) talkToSpecialPatron(game, p, visit);
        else if (p) say(game, null, [p.name + ': "Stand tall before the throne, traveler."']);
      },
    },
    {
      when: () => inVisit && near.some((p) => p.kind === 'stairsUp' || p.kind === 'stairsDown'),
      icon: 'step',
      run: () => {
        const stair = near.find((p) => p.kind === 'stairsUp' || p.kind === 'stairsDown');
        if (!stair) return;
        if (visit.heroUpper && stair.kind === 'stairsDown') {
          const exit = visit.exit;
          game.run.visitHouse = null;
          bumpMapRevision();
          refreshWorld(game);
          travelFn(game, exit.x, exit.y);
          game.run.lastLink = Math.floor(exit.x) + ',' + Math.floor(exit.y);
          cue(game, 'step');
          return;
        }
        if (visit?.floorData) {
          const nextFloor = stair.kind === 'stairsUp' ? 1 : 0;
          applyVisitedFloor(game, visit, nextFloor);
          travelFn(game, stair.x + 0.5, stair.y + 0.5);
          game.run.lastLink = stair.x + ',' + stair.y;
          cue(game, 'step');
          notify(game, nextFloor === 1 ? '⬆️ ' + visit.title : '⬇️ ' + visit.title, '#ffd86b');
        }
      },
    },
    {
      when: () => zoneAt(game.player.x, game.player.y).id === 'home' && propsAround(game.player.x, game.player.y, 1.8).some((p) => p.kind === 'stairsUp'),
      icon: 'step',
      run: () => enterHeroUpperFloor(game, travelFn),
    },
    {
      when: () => inVisit && near.some((p) => p.kind === 'throne'),
      icon: 'crown',
      run: () => {
        const vName = villageOf(visit?.house?.village)?.name || 'the realm';
        say(game, null, ['A gilded royal throne overlooking the banner hall of ' + vName + '.']);
      },
    },
    {
      when: () => Boolean(doorHouse),
      icon: 'quit',
      run: () => enterVisitedHouse(game, doorHouse, travelFn),
    },
    {
      when: () => inVisit && near.some((p) => p.kind === 'toilet'),
      icon: 'water',
      run: () => {
        cue(game, 'coin');
        notify(game, '🚽 Clean village washroom. Fresh water!', '#9fd8ff');
      },
    },
    {
      when: () => inVisit && near.some((p) => p.kind === 'basin'),
      icon: 'water',
      run: () => {
        game.player.thirst = Math.min(100, game.player.thirst + 25);
        cue(game, 'coin');
        notify(game, '🚰 Splashed cool water from the basin (+25 Thirst)!', '#9fd8ff');
      },
    },
    {
      when: () => inVisit && near.some((p) => p.kind === 'diningTable'),
      icon: 'talk',
      run: () => {
        const who = visit?.info?.names?.length > 0 ? visit.info.names.join(', ') : 'the household';
        say(game, null, [
          'A cozy dining table set for ' + (visit?.isFamily ? 'a whole family (' + who + ')' : who) + '.',
          'Bread crusts and warm bowls rest beside carved wooden chairs.',
        ]);
      },
    },
    {
      when: () => inVisit && near.some((p) => p.kind === 'stove'),
      icon: 'fire',
      run: () => {
        if (!cureCold(game, '🔥 The warm hearth chased away your cold!')) {
          notify(game, '🔥 A cheerful kitchen stove keeps the house warm.', '#ffd086');
        }
      },
    },
    {
      when: () => inVisit && near.some((p) => p.kind === 'bed' || p.kind === 'smallBed'),
      icon: 'sleep',
      run: () => {
        const vid = visit?.house?.village;
        const mood = vid && game.villages?.[vid]?.mood !== undefined ? game.villages[vid].mood : 50;
        const isInn = visit?.house?.role === 'inn';
        if (mood < 35 && !isInn && !visit.heroUpper) {
          say(game, null, ['The owners do not trust you enough to let you nap in their bedroom.']);
          return;
        }
        const fee = isInn || (mood < 55 && vid !== 'lexia' && !visit.heroUpper) ? 10 : 0;
        say(game, null, [visit?.isFamily ? 'One of the family bedrooms.' : 'A tidy bedroom.'], [
          {
            label: fee > 0 ? 'Rent bed & nap (4h, ' + fee + ' Lexis)' : 'Take a short nap (4h, +HP/MP)',
            icon: 'sleep',
            run: () => {
              if (fee > 0 && game.player.lexis < fee) {
                say(game, null, ['A warm bed costs ' + fee + ' Lexis here.']);
                return;
              }
              if (fee > 0) game.player.lexis -= fee;
              passHours(game, 4);
              game.player.fatigue = Math.max(0, (game.player.fatigue || 0) - 55);
              healFully(game.player, game);
              if (game?.realism) {
                applySleepQualityRecovery(game, isInn ? 'inn' : 'home');
                if (isInn) maybeTriggerEarthDream(game);
              }
              cureCold(game, '😴 Resting inside a warm bedroom cured your cold!');
              notify(game, '💤 Rested indoors: HP, MP & fatigue restored!', '#9fd8ff');
            },
          },
          { label: 'Leave it', run: () => {} },
        ]);
      },
    },
  ];
}
