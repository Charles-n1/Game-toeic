import { VILLAGES, villageOf, zoneAt } from '../../data/zones';
import { isSolid, tileAt, biomeAt } from '../../world/map';
import { TILE } from '../../world/tileKinds';
import { stepSmart, bestGateOf } from '../../world/paths';
import { isNight } from '../clock';
import { addItem, countItem, removeItem, earnLexis, gainXp } from '../player';
import { addHappiness, addFriendship } from '../village';
import { say, notify } from '../messages';
import { cue } from '../cues';
import { makeDuel } from '../duels';
import { startFight } from '../fight';
import { addParticle } from '../particles';
import { monsterCategory } from '../learning';
import { ensureLife, ensureRunLife, recordGossip, recordAbsenceNote } from './state';

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

const LOOKS = {
  refugee: { skin: '#d8a47f', hair: '#5a3a22', style: 'long', eyes: '#3a2416', outfit: '#6e6052', trim: '#c9b393' },
  messenger: { skin: '#fde0c8', hair: '#2a1d17', style: 'short', eyes: '#3a6fd8', outfit: '#2f50a0', trim: '#ffd23f', scarf: '#e8423f' },
  soldier: { skin: '#e8c49a', hair: '#3a3442', style: 'short', eyes: '#3a6fd8', outfit: '#5a667d', trim: '#d8e0ef' },
  wounded: { skin: '#f1c9a5', hair: '#4a3222', style: 'short', eyes: '#3a2416', outfit: '#7a7e8a', trim: '#ffffff' },
  orphan: { skin: '#fde0c8', hair: '#8a5a30', style: 'short', eyes: '#3a2416', outfit: '#6a5a4e', trim: '#a89a8e' },
  deserter: { skin: '#c99a72', hair: '#24202c', style: 'short', eyes: '#5a2222', outfit: '#44523a', trim: '#8a7a42' },
  pilgrim: { skin: '#f1c9a5', hair: '#d8dce6', style: 'long', eyes: '#3a6fd8', outfit: '#f4f6fc', trim: '#ffd23f' },
  circus: { skin: '#fde0c8', hair: '#c83e6e', style: 'long', eyes: '#3a6fd8', outfit: '#8a2be2', trim: '#ffd23f' },
  royalGuard: { skin: '#f1c9a5', hair: '#3a3442', style: 'short', eyes: '#3a6fd8', outfit: '#b8253f', trim: '#ffd23f' },
  drover: { skin: '#d8a47f', hair: '#6a4626', style: 'short', eyes: '#3a2416', outfit: '#7a5a32', trim: '#d9cbb0' },
  child: { skin: '#fde0c8', hair: '#b8763e', style: 'short', eyes: '#3a6fd8', outfit: '#5a9fd6', trim: '#fff3b0' },
  scout: { skin: '#d8a47f', hair: '#2d3b2d', style: 'short', eyes: '#3a6fd8', outfit: '#3b623c', trim: '#b8d88a' },
  traveler: { skin: '#fde0c8', hair: '#6a4228', style: 'long', eyes: '#3a2416', outfit: '#586c82', trim: '#ffd086' },
  warden: { skin: '#f1c9a5', hair: '#4a3222', style: 'short', eyes: '#3a6fd8', outfit: '#304468', trim: '#ffd23f' },
};

function findOpenWildNear(x, y, minR = 6, maxR = 20) {
  for (let i = 0; i < 20; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = minR + Math.random() * (maxR - minR);
    const tx = Math.round(x + Math.cos(a) * r) + 0.5;
    const ty = Math.round(y + Math.sin(a) * r) + 0.5;
    if (!isSolid(tx, ty) && zoneAt(tx, ty).kind === 'land') return { x: tx, y: ty };
  }
  return null;
}

export function plantTreeSapling(game, kind = 'oak') {
  const life = ensureLife(game);
  const px = Math.floor(game.player.x) + 0.5;
  const py = Math.floor(game.player.y) + 0.5;
  if (zoneAt(px, py).kind !== 'land' || isSolid(px, py)) {
    notify(game, '🌱 Plant tree saplings on open grass or woods.', '#ffd086');
    return false;
  }
  life.plantedTrees.push({ id: 'tree-' + Date.now(), kind, x: px, y: py, plantedDay: game.day || 1, stage: 0 });
  life.stats.treesPlanted = (life.stats.treesPlanted || 0) + 1;
  cue(game, 'coin');
  notify(game, '🌱 Planted a young ' + kind + ' sapling! It will grow over the coming days.', '#7cfc9a');
  return true;
}

export function computeNearbyMilestones(game) {
  const px = game.player.x;
  const py = game.player.y;
  return VILLAGES.slice(0, 12)
    .map((v) => {
      const gate = bestGateOf(v, game.player)?.outside || { x: v.x + v.w / 2, y: v.y + v.h + 2 };
      return {
        x: gate.x + (gate.dx || 0) * 3,
        y: gate.y + (gate.dy || 0) * 3,
        name: v.name,
        paces: Math.round(Math.hypot(gate.x - px, gate.y - py)),
      };
    })
    .filter((m) => m.paces < 36)
    .slice(0, 4);
}

export function newDayNatureAndRoads(game) {
  const life = ensureLife(game);
  const day = game.day || 1;

  for (const t of life.plantedTrees) {
    const age = day - (t.plantedDay || day);
    const nextStage = age >= 6 ? 3 : age >= 3 ? 2 : age >= 1 ? 1 : 0;
    if (nextStage > (t.stage || 0)) {
      t.stage = nextStage;
      if (nextStage === 3) recordAbsenceNote(game, 'Your planted ' + t.kind + ' sapling grew into a tall shaded tree.');
    }
  }

  for (const b of life.brokenBridges) {
    if (day >= b.doneDay) {
      b.repaired = true;
      recordAbsenceNote(game, 'Workers completed repairs on the timber road bridge near ' + (villageOf(b.villageId)?.name || 'the river') + '.');
    }
  }
  life.brokenBridges = life.brokenBridges.filter((b) => !b.repaired);
  life.rainMushrooms = (life.rainMushrooms || []).filter((m) => day <= (m.untilDay || day));
  life.brokenFences = (life.brokenFences || []).filter((f) => !f.repaired);

  if (!life.whiteStag.rumoredDay && day >= 2) {
    life.whiteStag.rumoredDay = day;
    recordGossip(game, 'Hunters whisper of a gleaming White Stag seen in deep mist north of Eldermoor!', 'lexia');
  }
}

export function slowNatureAndRoads(game) {
  const life = ensureLife(game);
  const rl = ensureRunLife(game);
  const now = Date.now();
  const day = game.day || 1;
  const px = game.player.x;
  const py = game.player.y;
  const pZone = zoneAt(px, py);
  const weatherKind = game.weather?.kind || 'clear';
  const isRain = weatherKind === 'rain' || weatherKind === 'storm';

  // Rain puddles, Overflow rivers (#44), Post-rain Rainbow (#99), Harvestable Mushrooms (#54) & Storm Fallen Branches / Broken Fences (#51)
  rl.riverFlooded = weatherKind === 'storm' || now < (life.puddlesUntil || 0);
  if (weatherKind === 'storm' && pZone.kind === 'village' && life.brokenFences.length < 3 && Math.random() < 0.08) {
    const fSpot = findOpenWildNear(px, py, 4, 10) || { x: pZone.x + 2, y: pZone.y + 3 };
    life.brokenFences.push({ id: 'fnc-' + now, villageId: pZone.id, x: fSpot.x, y: fSpot.y, repaired: false });
  }
  if (isRain) {
    rl.wasRaining = true;
    life.puddlesUntil = Math.max(life.puddlesUntil || 0, now + 90000);
  } else if (rl.wasRaining) {
    rl.wasRaining = false;
    life.rainbowUntil = now + 75000;
    life.puddlesUntil = now + 120000;
    notify(game, '🌈 Sunlight breaks through the clouds — a rainbow shimmers over the wet fields!', '#ffd86b');
    if (pZone.kind === 'land' && life.fallenBranches.length < 4 && Math.random() < 0.65) {
      const spot = findOpenWildNear(px, py, 5, 16);
      if (spot) life.fallenBranches.push({ id: 'br-' + now, x: spot.x, y: spot.y });
    }
    if (pZone.kind !== 'inside' && life.rainMushrooms.length < 6) {
      for (let m = 0; m < 2; m++) {
        const ms = findOpenWildNear(px, py, 3, 12);
        if (ms) life.rainMushrooms.push({ id: 'msh-' + now + '-' + m, x: ms.x, y: ms.y, untilDay: day + 2, kind: 'mushroom' });
      }
    }
  }

  // Live Food Chain (#42): wolves chase deer; night foxes sneak near village pens; rabbits nibble farm crops
  const wilds = game.run.wildAnimals || [];
  const wolves = wilds.filter((w) => w.kind === 'wolf');
  const deerList = wilds.filter((d) => d.kind === 'deer' || d.kind === 'doe');
  for (const w of wolves) {
    const prey = deerList.find((d) => dist(w, d) < 12);
    if (prey) {
      w.fleeUntil = 0;
      const dx = prey.x - w.x;
      const dy = prey.y - w.y;
      const far = Math.max(0.1, Math.hypot(dx, dy));
      w.x += (dx / far) * 0.4;
      w.y += (dy / far) * 0.4;
      prey.fleeX = dx / far;
      prey.fleeY = dy / far;
      prey.fleeUntil = Math.max(prey.fleeUntil || 0, 2.5);
    }
  }

  rl.nightFoxes = (rl.nightFoxes || []).filter((f) => dist(f, game.player) < 35 && isNight(game));
  if (isNight(game) && pZone.kind === 'village' && rl.nightFoxes.length === 0 && Math.random() < 0.08) {
    const pen = pZone.plan?.pen || pZone.plan?.center;
    if (pen) {
      rl.nightFoxes.push({
        id: 'fox-' + now,
        villageId: pZone.id,
        x: pZone.x + 2,
        y: pZone.y + 3,
        tx: pen.x,
        ty: pen.y,
        dir: 'right',
        step: 0,
        fleeing: false,
      });
    }
  }

  rl.fieldRabbits = (rl.fieldRabbits || []).filter((r) => dist(r, game.player) < 35);
  if (!isNight(game) && pZone.kind === 'village' && pZone.plan?.field && rl.fieldRabbits.length < 2 && Math.random() < 0.14) {
    const fld = pZone.plan.field;
    rl.fieldRabbits.push({
      id: 'rab-' + now + '-' + rl.fieldRabbits.length,
      villageId: pZone.id,
      x: fld.x + Math.random() * 3,
      y: fld.y + Math.random() * 3,
      tx: fld.x + 1,
      ty: fld.y + 1,
      dir: 'right',
      step: 0,
    });
  }

  // Ground birds pecking open grass that burst into flight on hero approach (#41)
  rl.groundBirds = (rl.groundBirds || []).filter((b) => dist(b, game.player) < 30 && b.age < 2.2);
  if (!isNight(game) && pZone.kind !== 'inside' && biomeAt(px, py) !== 'desert' && rl.groundBirds.length < 4 && Math.random() < 0.28) {
    const bSpot = findOpenWildNear(px, py, 5, 13);
    if (bSpot) {
      rl.groundBirds.push({
        id: 'bird-' + now + '-' + rl.groundBirds.length,
        x: bSpot.x,
        y: bSpot.y,
        flying: false,
        age: 0,
        vx: Math.random() < 0.5 ? 2.4 : -2.4,
        vy: -1.9,
        color: ['#8c7a6b', '#d9a441', '#6b8cae'][Math.floor(Math.random() * 3)],
      });
    }
  }

  // Forest bird nests (#43) & fresh hunter camp carcass (#59)
  rl.birdNests = (rl.birdNests || []).filter((n) => dist(n, game.player) < 35);
  rl.hunterCarcasses = (rl.hunterCarcasses || []).filter((c) => now < c.expiresAt && dist(c, game.player) < 40);
  if (pZone.kind === 'land' && biomeAt(px, py) === 'forest') {
    if (rl.birdNests.length < 2 && Math.random() < 0.16) {
      const ns = findOpenWildNear(px, py, 4, 14);
      if (ns) rl.birdNests.push({ id: 'nst-' + now, x: ns.x, y: ns.y, eggs: 2 });
    }
    if (rl.hunterCarcasses.length === 0 && Math.random() < 0.08) {
      const cs = findOpenWildNear(px, py, 6, 15);
      if (cs) rl.hunterCarcasses.push({ id: 'crc-' + now, x: cs.x, y: cs.y, gathered: false, expiresAt: now + 90000 });
    }
  }

  // Jumping fish (#41) & pond frogs after rain (#48)
  rl.jumpingFish = rl.jumpingFish.filter((f) => f.age < f.life);
  if (rl.jumpingFish.length < 2 && pZone.kind !== 'inside' && Math.random() < 0.45) {
    for (let i = 0; i < 8; i++) {
      const wx = px + (Math.random() - 0.5) * 18;
      const wy = py + (Math.random() - 0.5) * 14;
      if (tileAt(wx, wy) === TILE.WATER) {
        rl.jumpingFish.push({ x: wx, y: wy, age: 0, life: 1.1 });
        break;
      }
    }
  }
  rl.pondFrogs = rl.pondFrogs.filter((f) => dist(f, game.player) < 22);
  if ((isRain || now < (life.puddlesUntil || 0)) && rl.pondFrogs.length < 3 && pZone.kind !== 'inside') {
    for (let i = 0; i < 8; i++) {
      const fx = px + (Math.random() - 0.5) * 16;
      const fy = py + (Math.random() - 0.5) * 14;
      if (!isSolid(fx, fy) && (tileAt(fx + 1, fy) === TILE.WATER || tileAt(fx - 1, fy) === TILE.WATER || tileAt(fx, fy + 1) === TILE.WATER)) {
        rl.pondFrogs.push({ x: fx, y: fy, croakUntil: now + 2200, phase: Math.random() * 6 });
        break;
      }
    }
  }

  // Rare White Stag in forests (#60)
  if (pZone.kind === 'land' && biomeAt(px, py) === 'forest' && !rl.whiteStagEntity && (life.whiteStag.lastBlessedDay || 0) < day && Math.random() < 0.08) {
    const spot = findOpenWildNear(px, py, 8, 16);
    if (spot) {
      rl.whiteStagEntity = { x: spot.x, y: spot.y, dir: 'right', step: 0, blessed: false, expiresAt: now + 90000 };
      notify(game, '🦌 A shimmering White Stag steps out between the ancient oaks...', '#e8f6ff');
    }
  }
  if (rl.whiteStagEntity && (now > rl.whiteStagEntity.expiresAt || dist(rl.whiteStagEntity, game.player) > 36)) {
    rl.whiteStagEntity = null;
  }

  // Forest Hunter Trap (#59)
  rl.forestTraps = rl.forestTraps.filter((t) => dist(t, game.player) < 40);
  if (pZone.kind === 'land' && biomeAt(px, py) === 'forest' && rl.forestTraps.length === 0 && Math.random() < 0.12) {
    const spot = findOpenWildNear(px, py, 6, 14);
    if (spot) rl.forestTraps.push({ id: 'trp-' + now, x: spot.x, y: spot.y, sprung: Math.random() < 0.5 });
  }

  // War Entities: Refugees (#61), Messengers (#63), Marchers (#66), Clinic Wounded (#67), Orphans (#68), Deserters (#70), Hilltop Frontier Scouts (#73)
  rl.warEntities = rl.warEntities.filter((w) => now < w.expiresAt && dist(w, game.player) < 55);
  const conqueredExists = VILLAGES.some((v) => game.villages?.[v.id]?.owner === 'monsters');
  if (pZone.kind === 'village') {
    const v = pZone;
    const clinic = (v.plan?.houses || []).find((h) => h.role === 'clinic');
    if (clinic && !rl.warEntities.some((w) => w.kind === 'wounded' && w.villageId === v.id)) {
      rl.warEntities.push({
        id: 'wnd-' + v.id,
        kind: 'wounded',
        name: 'Bandaged Soldier',
        look: LOOKS.wounded,
        villageId: v.id,
        x: clinic.x + clinic.w + 0.8,
        y: clinic.y + clinic.h,
        dir: 'left',
        shout: 'Took a demon pike near the frontier... clinic herbs saved me.',
        expiresAt: now + 90000,
      });
    }
    if (v.kind === 'capital' && !rl.warEntities.some((w) => w.kind === 'orphan' && w.villageId === v.id)) {
      const c = v.plan?.center || { x: v.x + 12, y: v.y + 12 };
      rl.warEntities.push({
        id: 'orp-' + v.id,
        villageId: v.id,
        kind: 'orphan',
        name: 'War Orphan',
        look: LOOKS.orphan,
        x: c.x - 3,
        y: c.y + 2,
        dir: 'right',
        shout: 'Our village burned last autumn... we fled to the capital.',
        expiresAt: now + 90000,
      });
    }
  } else if (pZone.kind === 'land' && rl.warEntities.length < 2) {
    const spot = findOpenWildNear(px, py, 9, 18);
    if (spot) {
      const dest = VILLAGES[0].plan?.center || { x: 1120, y: 910 };
      const roll = Math.random();
      if (roll < 0.22 && (py < 680 || biomeAt(spot.x, spot.y) === 'rock')) {
        rl.warEntities.push({
          id: 'sct-' + now,
          kind: 'scout',
          name: 'Frontier Border Scout',
          look: LOOKS.scout,
          x: spot.x,
          y: spot.y,
          tx: spot.x,
          ty: spot.y,
          dir: 'up',
          step: 0,
          shout: 'Peering north through brass glass—demon banners on the ridge!',
          expiresAt: now + 80000,
        });
      } else if (roll < 0.35 || conqueredExists) {
        rl.warEntities.push({
          id: 'ref-' + now,
          kind: 'refugee',
          name: 'Refugee Family Cart',
          look: LOOKS.refugee,
          x: spot.x,
          y: spot.y,
          tx: dest.x,
          ty: dest.y,
          dir: 'left',
          step: 0,
          shout: 'We left our homes ahead of the demon warbands!',
          expiresAt: now + 75000,
        });
      } else if (roll < 0.6) {
        rl.warEntities.push({
          id: 'msg-' + now,
          kind: 'messenger',
          name: 'Royal Rider Messenger',
          look: LOOKS.messenger,
          x: spot.x,
          y: spot.y,
          tx: dest.x,
          ty: dest.y,
          dir: 'right',
          step: 0,
          shout: 'URGENT DISPATCH! Warbands sighted on the northern roads!',
          expiresAt: now + 60000,
        });
      } else if (roll < 0.82) {
        rl.warEntities.push({
          id: 'mar-' + now,
          kind: 'marcher',
          name: 'Marching Capital Column',
          look: LOOKS.soldier,
          x: spot.x,
          y: spot.y,
          tx: dest.x + 120,
          ty: dest.y,
          dir: 'right',
          step: 0,
          shout: '🎵 March with steel and steady hearts to the border! 🎵',
          expiresAt: now + 65000,
        });
      } else if (biomeAt(spot.x, spot.y) === 'forest') {
        rl.warEntities.push({
          id: 'des-' + now,
          kind: 'deserter',
          name: 'Nervous Deserter',
          look: LOOKS.deserter,
          x: spot.x,
          y: spot.y,
          tx: spot.x,
          ty: spot.y,
          dir: 'down',
          step: 0,
          shout: 'Keep back! I’m not dying in the ash fields!',
          expiresAt: now + 70000,
        });
      }
    }
  }

  // Rich Road Encounters (#76-#88): Cart, Pilgrim, Duel, Circus, Lost Child, Royal Carriage, Drover, Bandit, Rival, Bridge Fix, Night Campfire (#78), Kingdom Toll Gate (#88)
  rl.roadEvents = rl.roadEvents.filter((e) => !e.solved && now < e.expiresAt && dist(e, game.player) < 55);
  if (pZone.kind === 'land' && rl.roadEvents.length === 0 && Math.random() < 0.35) {
    const spot = findOpenWildNear(px, py, 7, 16);
    if (spot) {
      const kinds = isNight(game)
        ? ['campfire', 'roadBandit', 'pilgrim', 'campfire']
        : ['cart', 'pilgrim', 'duel', 'circus', 'lostChild', 'royalCarriage', 'drover', 'roadBandit', 'rivalAdv', 'bridgeFix', 'tollGate'];
      const picked = kinds[Math.floor(day * 7 + now / 1000) % kinds.length];
      const lookByKind = {
        cart: LOOKS.drover,
        pilgrim: LOOKS.pilgrim,
        duel: LOOKS.soldier,
        circus: LOOKS.circus,
        lostChild: LOOKS.child,
        royalCarriage: LOOKS.royalGuard,
        drover: LOOKS.drover,
        roadBandit: LOOKS.deserter,
        rivalAdv: LOOKS.messenger,
        bridgeFix: LOOKS.soldier,
        campfire: LOOKS.traveler,
        tollGate: LOOKS.warden,
      };
      const namesByKind = {
        cart: 'Overturned Merchant Cart',
        pilgrim: 'White-Robed Pilgrim',
        duel: 'Two Dueling Adventurers',
        circus: 'Traveling Circus Troupe',
        lostChild: 'Lost Village Child',
        royalCarriage: 'Royal Capital Carriage',
        drover: 'Livestock Drover & Flock',
        roadBandit: 'Highway Roadblock',
        rivalAdv: 'Rival Adventurer',
        bridgeFix: 'Road Bridge Crew',
        campfire: 'Night Road Campfire',
        tollGate: 'Kingdom Border Toll Gate',
      };
      rl.roadEvents.push({
        id: 'rd-' + picked + '-' + now,
        kind: picked,
        name: namesByKind[picked],
        look: lookByKind[picked],
        x: spot.x,
        y: spot.y,
        tx: spot.x + 25,
        ty: spot.y + 4,
        dir: 'down',
        step: 0,
        solved: false,
        expiresAt: now + 90000,
      });
    }
  }

  rl.milestones = computeNearbyMilestones(game);
}

export function updateNatureAndRoads(game, dt) {
  const rl = ensureRunLife(game);
  for (const f of rl.jumpingFish) f.age += dt;

  // Flushing birds burst up into flight when player nears (#41)
  for (const b of rl.groundBirds || []) {
    if (!b.flying && dist(b, game.player) < 4.5) {
      b.flying = true;
    }
    if (b.flying) {
      b.age += dt;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
    }
  }

  // Foxes sneak toward village pens, flee when barked at by dogs (#42)
  for (const fox of rl.nightFoxes || []) {
    if (fox.fleeing) {
      stepSmart(fox, fox.x - 10, fox.y - 6, 3.0, dt, { stopAtGate: false });
    } else if (Math.hypot(fox.tx - fox.x, fox.ty - fox.y) > 1.2) {
      stepSmart(fox, fox.tx, fox.ty, 1.35, dt, { stopAtGate: false });
    }
  }

  // Farm rabbits hop away when player approaches (#42)
  for (const r of rl.fieldRabbits || []) {
    if (dist(r, game.player) < 3.5) {
      stepSmart(r, r.x + (r.x - game.player.x) * 2, r.y + (r.y - game.player.y) * 2, 2.4, dt, { stopAtGate: false });
    }
  }

  for (const w of rl.warEntities) {
    if (w.kind === 'refugee' || w.kind === 'messenger' || w.kind === 'marcher') {
      const spd = w.kind === 'messenger' ? 3.1 : 1.35;
      if (Math.hypot(w.tx - w.x, w.ty - w.y) > 2) stepSmart(w, w.tx, w.ty, spd, dt);
    }
  }
  for (const ev of rl.roadEvents) {
    if (ev.kind === 'circus' || ev.kind === 'royalCarriage' || ev.kind === 'drover' || ev.kind === 'pilgrim') {
      if (Math.hypot(ev.tx - ev.x, ev.ty - ev.y) > 2) stepSmart(ev, ev.tx, ev.ty, ev.kind === 'royalCarriage' ? 2.2 : 1.15, dt);
    }
    if (ev.kind === 'campfire' && Math.random() < dt * 4) {
      addParticle(game, { x: ev.x + 0.8, y: ev.y, vx: (Math.random() - 0.5) * 0.4, vy: -1.1, life: 0.65, color: Math.random() < 0.5 ? '#ff7043' : '#ffd23f', size: 2 });
    }
  }
  if (rl.whiteStagEntity && !rl.whiteStagEntity.blessed) {
    const ws = rl.whiteStagEntity;
    if (dist(ws, game.player) < 6 && game.run.running) {
      const dx = ws.x - game.player.x;
      const dy = ws.y - game.player.y;
      const len = Math.max(0.1, Math.hypot(dx, dy));
      stepSmart(ws, ws.x + (dx / len) * 6, ws.y + (dy / len) * 6, 3.2, dt);
    }
  }
}

export function actionsOfNatureAndRoads(game) {
  const life = ensureLife(game);
  const rl = ensureRunLife(game);
  const list = [];

  // Harvest Post-Rain Mushrooms (#54)
  const nearMush = (life.rainMushrooms || []).find((m) => dist(m, game.player) < 1.8);
  if (nearMush) {
    list.push({
      when: () => true,
      icon: 'mushroom',
      run: () => {
        life.rainMushrooms = life.rainMushrooms.filter((m) => m.id !== nearMush.id);
        addItem(game.player, 'mushroom', 1);
        gainXp(game, 8);
        cue(game, 'coin');
        notify(game, '🍄 Gathered a fresh post-rain Forest Mushroom (+1 Mushroom, +8 XP)!', '#7cfc9a');
      },
    });
  }

  // Mend Storm-Broken Timber Fence (#51)
  const nearFence = (life.brokenFences || []).find((f) => !f.repaired && dist(f, game.player) < 2.0);
  if (nearFence) {
    list.push({
      when: () => true,
      icon: 'logs',
      run: () => {
        if (countItem(game.player, 'branch') > 0) removeItem(game.player, 'branch', 1);
        nearFence.repaired = true;
        earnLexis(game, 15);
        gainXp(game, 12);
        addHappiness(game, 2);
        cue(game, 'trade');
        notify(game, '🔨 Mended storm-broken village fence (+15 Lexis, +2 Happiness)!', '#7cfc9a');
      },
    });
  }

  // Inspect Forest Carcass (#59)
  const nearCarcass = (rl.hunterCarcasses || []).find((c) => !c.gathered && dist(c, game.player) < 1.9);
  if (nearCarcass) {
    list.push({
      when: () => true,
      icon: 'meat',
      run: () => {
        nearCarcass.gathered = true;
        addItem(game.player, 'pelt', 1);
        gainXp(game, 10);
        cue(game, 'coin');
        notify(game, '🐺 A pack left fresh hides near the hunter trail (+1 Soft Pelt)!', '#ffd86b');
      },
    });
  }

  // Clear Storm Fallen Branch (#51)
  const nearBranch = life.fallenBranches.find((b) => dist(b, game.player) < 1.8);
  if (nearBranch) {
    list.push({
      when: () => true,
      icon: 'logs',
      run: () => {
        life.fallenBranches = life.fallenBranches.filter((b) => b.id !== nearBranch.id);
        addItem(game.player, 'branch', 2);
        gainXp(game, 10);
        cue(game, 'hit');
        notify(game, '🪵 Cleared storm-fallen timber from the road (+2 Branches, +10 XP)!', '#7cfc9a');
      },
    });
  }

  // Interact with White Stag (#60)
  if (rl.whiteStagEntity && dist(rl.whiteStagEntity, game.player) < 2.3 && !rl.whiteStagEntity.blessed) {
    list.push({
      when: () => true,
      icon: 'star',
      run: () => {
        const ws = rl.whiteStagEntity;
        ws.blessed = true;
        life.whiteStag.lastBlessedDay = game.day || 1;
        game.player.mana += 3;
        addItem(game.player, 'herb', 2);
        gainXp(game, 40);
        cue(game, 'levelUp');
        addParticle(game, { x: ws.x, y: ws.y - 0.6, vx: 0, vy: -1, life: 1.2, color: '#e8f6ff', size: 4 });
        recordGossip(game, (game.player?.name || 'The hero') + ' encountered the sacred White Stag and received its blessing!', 'lexia');
        say(game, null, ['🦌 The White Stag bows its luminous antlers silently, filling the air with starlight.\n✨ (+3 Mana, +2 Herbs, +40 XP)']);
      },
    });
  }

  // Interact with Road Events (#76-#88)
  const nearRoad = rl.roadEvents.find((e) => !e.solved && dist(e, game.player) < 2.2);
  if (nearRoad) {
    list.push({
      when: () => true,
      icon: 'talk',
      run: () => {
        if (nearRoad.kind === 'campfire') {
          nearRoad.solved = true;
          game.player.health = Math.min(game.player.maxHealth, game.player.health + 15);
          cue(game, 'heal');
          say(game, null, ['🔥 Warm travelers make space by the embers and hand you a mug of hot broth.\n(+15 HP Restored)']);
        } else if (nearRoad.kind === 'tollGate') {
          say(game, null, ['🛂 Border Gate Warden inspects your guild seal: "Kingdom travel papers verified! Safe travels beyond the ridge, Adventurer."']);
        } else if (nearRoad.kind === 'cart') {
          say(game, null, ['An overturned supply cart lies tilted in the ruts! Help heave it upright?'], [
            {
              label: 'Heave cart upright (+25 Lexis, +Apple)',
              icon: 'lexis',
              run: () => {
                nearRoad.solved = true;
                earnLexis(game, 25);
                addItem(game.player, 'apple', 2);
                gainXp(game, 20);
                cue(game, 'coin');
                notify(game, '🛒 Helped the carter right the wagon (+25 Lexis, +2 Apples)!', '#7cfc9a');
              },
            },
            { label: 'Leave', run: () => {} },
          ]);
        } else if (nearRoad.kind === 'pilgrim') {
          say(game, null, ['White-Robed Pilgrim: "Traveler! Can you guide me in clear English toward the nearest sanctuary?"'], [
            {
              label: 'Answer Pilgrim’s English Direction Question (TOEIC)',
              icon: 'book',
              run: () => {
                startFight(
                  game,
                  makeDuel({ id: null, name: 'White Pilgrim', look: nearRoad.look, shape: 'mage' }, {
                    title: 'Guiding a Lost Pilgrim',
                    category: monsterCategory(game),
                    tag: 'normal',
                    health: 2,
                    speed: 14,
                    onWin: () => {
                      nearRoad.solved = true;
                      earnLexis(game, 35);
                      gainXp(game, 30);
                      addHappiness(game, 2);
                      notify(game, '🕊️ Pilgrim safely guided! (+35 Lexis, +30 XP, +2 Happiness)', '#7cfc9a');
                    },
                    onLose: () => say(game, null, ['Pilgrim: "Hmm, let us check the milestone sign down the road!"']),
                  })
                );
              },
            },
            { label: 'Pass', run: () => {} },
          ]);
        } else if (nearRoad.kind === 'lostChild') {
          nearRoad.solved = true;
          life.stats.lostKidsRescued = (life.stats.lostKidsRescued || 0) + 1;
          earnLexis(game, 30);
          addItem(game.player, 'honey', 1);
          addHappiness(game, 4);
          addFriendship(game, 'hana', 5);
          cue(game, 'levelUp');
          say(game, null, ['👧 "Thank you for walking me back toward the road lanterns!"\nThe family presses Golden Honey and 30 Lexis into your hand.']);
        } else if (nearRoad.kind === 'roadBandit') {
          say(game, null, ['Bandit Tollman blocks the road: "15 Lexis to pass, or draw your blade!"'], [
            {
              label: '⚔️ Clear the Highwaymen! (+Bounty Reward)',
              icon: 'sword',
              run: () => {
                startFight(game, {
                  name: 'Highwayman Captain',
                  category: monsterCategory(game),
                  tier: 'small',
                  tag: 'normal',
                  shape: 'bandit',
                  health: 85,
                  maxHealth: 85,
                  attack: 12,
                  magicAttack: 0,
                  speed: 10,
                  resistance: 0.1,
                  magicResistance: 0,
                  xp: 45,
                  lexis: 45,
                  onWin: () => {
                    nearRoad.solved = true;
                    addHappiness(game, 3);
                    recordGossip(game, (game.player?.name || 'The hero') + ' reopened a blocked trade highway!', 'lexia');
                    notify(game, '🛣️ Road reopened! +45 Lexis Bounty & +3 Happiness!', '#7cfc9a');
                  },
                });
              },
            },
            { label: 'Step back', run: () => {} },
          ]);
        } else if (nearRoad.kind === 'bridgeFix') {
          say(game, null, ['Bridge Carpenter: "A flood loosened two span beams. Help haul timber to finish today?"'], [
            {
              label: 'Help Repair Bridge (+35 Lexis, +3 Happiness)',
              icon: 'logs',
              run: () => {
                nearRoad.solved = true;
                life.stats.bridgesHelped = (life.stats.bridgesHelped || 0) + 1;
                earnLexis(game, 35);
                addHappiness(game, 3);
                cue(game, 'trade');
                notify(game, '🌉 Road bridge reinforced ahead of schedule!', '#7cfc9a');
              },
            },
            { label: 'Leave them working', run: () => {} },
          ]);
        } else if (nearRoad.kind === 'circus') {
          addHappiness(game, 1);
          cue(game, 'coin');
          say(game, null, ['🎪 Circus Master tips a feathered hat: "Step right up! Tomorrow night we perform on the square!" (+1 Happiness)']);
        } else if (nearRoad.kind === 'royalCarriage') {
          say(game, null, ['👑 Royal Escort Captain: "Clear the king’s road—envoys bearing treasury dispatches between capitals!"']);
        } else if (nearRoad.kind === 'drover') {
          say(game, null, ['🐄 Livestock Drover whistles to the herd: "Driving cattle and wool sheep down to market!"']);
        } else {
          say(game, null, [nearRoad.name + ': "Rival hunters keep clearing the easiest caves—stay sharp out there!"']);
        }
      },
    });
  }

  // Interact with War Entities (#61-#73)
  const nearWar = rl.warEntities.find((w) => dist(w, game.player) < 2.2);
  if (nearWar) {
    list.push({
      when: () => true,
      icon: 'talk',
      run: () => {
        if (nearWar.kind === 'orphan') {
          say(game, null, ['War Orphan: "' + nearWar.shout + '"'], [
            {
              label: 'Give 10 Lexis & Comfort (+3 Happiness)',
              icon: 'heart',
              run: () => {
                if ((game.player.lexis || 0) < 10) return say(game, null, ['Need 10 Lexis.']);
                game.player.lexis -= 10;
                addHappiness(game, 3);
                cue(game, 'coin');
                notify(game, '💛 The orphan smiles warmly. (+3 Happiness)', '#ffd23f');
              },
            },
            { label: 'Pass', run: () => {} },
          ]);
          return;
        }
        if (nearWar.kind === 'deserter') {
          say(game, null, ['Forest Deserter grips a rusty spear: "Why go back?! You try rallying troops with English orders!"'], [
            {
              label: 'Rally Deserter Back to Duty (TOEIC Test)',
              icon: 'book',
              run: () => {
                startFight(
                  game,
                  makeDuel({ id: null, name: 'Forest Deserter', look: nearWar.look, shape: 'knight' }, {
                    title: 'Rallying a Deserter',
                    category: monsterCategory(game),
                    tag: 'normal',
                    health: 2,
                    speed: 13,
                    onWin: () => {
                      nearWar.expiresAt = 0;
                      earnLexis(game, 30);
                      addHappiness(game, 2);
                      notify(game, '🛡️ Convinced the soldier to return to garrison (+30 Lexis, +2 Happiness)!', '#7cfc9a');
                    },
                  })
                );
              },
            },
            { label: 'Leave them in peace', run: () => {} },
          ]);
          return;
        }
        say(game, null, [nearWar.name + ': "' + nearWar.shout + '"']);
      },
    });
  }

  return list;
}
