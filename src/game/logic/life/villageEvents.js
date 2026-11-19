import { VILLAGES, villageOf, zoneAt } from '../../data/zones';
import { isSolid, tileAt } from '../../world/map';
import { TILE } from '../../world/tileKinds';
import { stepSmart, bestGateOf } from '../../world/paths';
import { isNight } from '../clock';
import { earnLexis, gainXp } from '../player';
import { addHappiness, addFriendship } from '../village';
import { say, notify } from '../messages';
import { cue } from '../cues';
import { addParticle } from '../particles';
import { ensureLife, ensureRunLife, recordGossip, recordAbsenceNote } from './state';
import { distance } from '../../world/geometry';
import { isDemonGroundNear } from '../war/demonLand';
import { isInSight } from './spots';

const FRONTIER_RANGE = 150; // tiles: a village this close to the demon land is on the frontier (towers, empty houses)


const PERFORMER_LOOKS = {
  juggler: { skin: '#f1c9a5', hair: '#a0324c', style: 'short', eyes: '#2a2234', outfit: '#c83e6e', trim: '#ffd23f' },
  musician: { skin: '#fde0c8', hair: '#5a3a22', style: 'long', eyes: '#3a6fd8', outfit: '#3f7a58', trim: '#ffe680' },
  beggar: { skin: '#d8a47f', hair: '#6a656e', style: 'short', eyes: '#3a2416', outfit: '#5a4e42', trim: '#7c7062' },
  council: { skin: '#f1c9a5', hair: '#d8dce6', style: 'short', eyes: '#3a2416', outfit: '#465878', trim: '#e6c25a' },
  lamplighter: { skin: '#c99a72', hair: '#3a2a20', style: 'short', eyes: '#3a2416', outfit: '#324058', trim: '#ffcf5c' },
  pickpocket: { skin: '#e8c49a', hair: '#1d1b26', style: 'short', eyes: '#5a2222', outfit: '#2b2838', trim: '#8a3030' },
  newcomer: { skin: '#fde0c8', hair: '#8a5a30', style: 'long', eyes: '#3a6fd8', outfit: '#4f7a9a', trim: '#f2c14e' },
  crier: { skin: '#f1c9a5', hair: '#4a3222', style: 'short', eyes: '#3a2416', outfit: '#7a2e46', trim: '#ffd86b' },
  guard: { skin: '#e8c49a', hair: '#3a3442', style: 'short', eyes: '#3a6fd8', outfit: '#5a667d', trim: '#d8e0ef' },
  mourner: { skin: '#d8a47f', hair: '#2a2430', style: 'long', eyes: '#3a2416', outfit: '#24202c', trim: '#7c788a' },
  washer: { skin: '#fde0c8', hair: '#6a4228', style: 'long', eyes: '#3a6fd8', outfit: '#5a7ea8', trim: '#f4f8ff' },
};

function findRiverbankNear(town, maxRadius = 24) {
  const c = town?.plan?.center;
  if (!c) return null;
  for (let r = 4; r <= maxRadius; r += 2) {
    for (let dy = -r; dy <= r; dy += 2) {
      for (let dx = -r; dx <= r; dx += 2) {
        const tx = Math.round(c.x + dx);
        const ty = Math.round(c.y + dy);
        if (tileAt(tx, ty) === TILE.WATER && !isSolid(tx - 1, ty) && tileAt(tx - 1, ty) !== TILE.WATER) {
          return { x: tx - 0.8, y: ty + 0.5 };
        }
      }
    }
  }
  return null;
}

// ---------- The people of the squares: crier, artists, beggar, council, washerwoman, processions ----------
// Each one has its hours. Coming while the hero looks, they come out of a house of the village and walk to their
// place; their hours over, they walk into a house (out of sight, they just come and go).

// About once per second: who should be in the villages near the hero now, and who should leave.
export function syncVillagePerformers(game) {
  const rl = ensureRunLife(game);
  const awake = new Set(game.run?.awake || []);
  const wanted = new Map();
  for (const id of awake) for (const performer of performersOf(game, villageOf(id))) wanted.set(performer.id, performer);
  rl.performers = rl.performers.filter((p) => awake.has(p.villageId) && (wanted.has(p.id) || p.kind === 'guardRelief' || isInSight(game, p)));
  for (const performer of rl.performers) if (!wanted.has(performer.id) && performer.kind !== 'guardRelief') leaveIntoAHouse(performer);
  for (const performer of wanted.values()) if (!rl.performers.some((p) => p.id === performer.id)) rl.performers.push(arrive(game, performer));
}

// The performers a village has now (its spot in x, y; its way, if it walks somewhere, in tx, ty).
function performersOf(game, town) {
  if (!town?.plan?.center) return [];
  const makers = [crier, streetArtists, gateBeggar, council, washerwoman, newcomerCart, funeralProcession, celebration];
  return makers.flatMap((make) => make(game, town, game.hour || 12, game.day || 1) || []);
}

// A new performer: at its place if the hero does not see it, else out of the closest door, walking to its place.
function arrive(game, performer) {
  const goal = { x: performer.tx ?? performer.x, y: performer.ty ?? performer.y };
  if (!isInSight(game, performer)) return { ...performer, tx: goal.x, ty: goal.y };
  const door = closestDoor(performer);
  return { ...performer, x: door.x, y: door.y, tx: goal.x, ty: goal.y, walking: true };
}

// Its hours are over: it walks into the closest house (and is forgotten once there, or out of sight).
function leaveIntoAHouse(performer) {
  if (performer.leaving) return;
  const door = closestDoor(performer);
  performer.leaving = true;
  performer.tx = door.x;
  performer.ty = door.y;
}

function closestDoor(performer) {
  const houses = villageOf(performer.villageId)?.plan?.houses || [];
  let best = { x: performer.x, y: performer.y };
  let bestFar = Infinity;
  for (const house of houses) {
    const door = { x: house.x + Math.floor(house.w / 2) + 0.5, y: house.y + house.h + 0.5 };
    if (distance(door, performer) < bestFar) {
      best = door;
      bestFar = distance(door, performer);
    }
  }
  return best;
}

function marketDay(day) {
  return day % 7 === 3;
}

// The crier reads the news on the square, in the morning.
function crier(game, town, hour, day) {
  if (hour < 7 || hour >= 10.5) return null;
  const gossip = ensureLife(game).gossip;
  const news = marketDay(day) ? 'Hear ye! Grand Market Fair opens on ' + town.name + ' Square today!' : gossip.length > 0 ? 'Hear ye! ' + gossip[gossip.length - 1].text : 'Hear ye! Fair skies along the high roads—watch the forest traps!';
  const c = town.plan.center;
  return { id: 'crier-' + town.id, villageId: town.id, kind: 'crier', name: 'Morning Town Crier', look: PERFORMER_LOOKS.crier, x: c.x, y: c.y - 1.5, dir: 'down', shout: news };
}

// A juggler and a musician on the squares of the capitals (and of every village on market day).
function streetArtists(game, town, hour, day) {
  if (hour < 8 || hour >= 19 || !(town.kind === 'capital' || marketDay(day))) return null;
  const c = town.plan.center;
  const songs = ensureLife(game).heroSongs;
  return [
    { id: 'perf-jug-' + town.id, villageId: town.id, kind: 'juggler', name: marketDay(day) ? 'Market Herald' : 'Street Juggler', look: PERFORMER_LOOKS.juggler, x: c.x - 2, y: c.y + 1, dir: 'down', shout: marketDay(day) ? 'Fresh market wares—best prices today!' : 'Watch three fire-pins fly!' },
    { id: 'perf-mus-' + town.id, villageId: town.id, kind: 'musician', name: 'Lute Player', look: PERFORMER_LOOKS.musician, x: c.x + 2, y: c.y + 1, dir: 'down', shout: songs.length > 0 ? '♪ Ballad of ' + (game.player?.name || 'the Hero') + '! ♪' : '♪ Golden meadows of spring! ♪' },
  ];
}

// A beggar at the gate of the capitals, by day.
function gateBeggar(game, town, hour) {
  if (town.kind !== 'capital' || !town.plan?.gates?.length || hour < 7 || hour >= 20) return null;
  const g = town.plan.gates[0];
  return { id: 'beg-' + town.id, villageId: town.id, kind: 'beggar', name: 'Gate Beggar', look: PERFORMER_LOOKS.beggar, x: g.x + (g.dx === 0 ? 2 : -g.dx * 2), y: g.y + (g.dy === 0 ? 2 : -g.dy * 2), dir: 'down', helped: false, shout: 'Spare a copper coin for bread, traveler?' };
}

// The council debates at a table on the square, in the day.
function council(game, town, hour) {
  if (town.kind === 'hamlet' || hour < 9 || hour >= 17) return null;
  const c = town.plan.center;
  return { id: 'coun-' + town.id, villageId: town.id, kind: 'council', name: town.name + ' Councilor', look: PERFORMER_LOOKS.council, x: c.x + 3.2, y: c.y - 1.5, dir: 'left', shout: 'Taxes, palisades, and the northern frontier...' };
}

// The washerwoman at the river, on mornings without a storm.
function washerwoman(game, town, hour) {
  if (isNight(game) || game.weather?.kind === 'storm' || hour < 7.5 || hour >= 15.5) return null;
  const bank = findRiverbankNear(town);
  if (!bank) return null;
  return { id: 'wash-' + town.id, villageId: town.id, kind: 'washer', name: 'River Washerwoman', look: PERFORMER_LOOKS.washer, x: bank.x, y: bank.y, dir: 'right', shout: 'Sun-dried linens smell sweet by noon!' };
}

// Moving day (every 4 days, or when a new cottage is done): a family cart comes in by the gate.
function newcomerCart(game, town, hour, day) {
  const life = ensureLife(game);
  const house = town.plan?.houses?.[0];
  const isMovingDay = day % 4 === 3 || life.absenceLog.some((note) => note.day === day && note.text.includes('cottage'));
  if (!house || !town.plan?.gates?.length || !isMovingDay || hour < 8 || hour >= 18) return null;
  const gate = bestGateOf(town, house)?.outside || { x: town.x, y: town.plan.center.y };
  return { id: 'newcart-' + town.id + '-' + day, villageId: town.id, kind: 'newcomerCart', name: 'Newcomer Family Cart', look: PERFORMER_LOOKS.newcomer, x: gate.x, y: gate.y, tx: house.x + Math.floor(house.w / 2), ty: house.y + house.h + 1.2, dir: 'right', step: 0, shout: '🪑 Just arrived with chests and oak chairs for our new cottage!' };
}

// A funeral procession walks to a new grave (the day of the death and the next).
function funeralProcession(game, town, hour, day) {
  const grave = ensureLife(game).graves.find((g) => g.villageId === town.id && day <= (g.day || 0) + 1);
  if (!grave || hour < 9 || hour >= 17) return null;
  const c = town.plan.center;
  return { id: 'fun-' + town.id + '-' + grave.id, villageId: town.id, kind: 'funeral', name: 'Funeral Procession', look: PERFORMER_LOOKS.mourner, x: c.x, y: c.y, tx: grave.x - 1, ty: grave.y + 0.8, dir: 'right', step: 0, shout: '🕯️ May ' + grave.name + ' rest gently beneath the pines...' };
}

// A wedding in Eldermoor every 9 days; a birth (a neighbor bringing gifts) every 5 days.
function celebration(game, town, hour, day) {
  const c = town.plan.center;
  if (day % 9 === 0 && town.id === 'lexia' && hour >= 10 && hour < 18) {
    return { id: 'wed-' + town.id + '-' + day, villageId: town.id, kind: 'wedding', name: 'Wedding Procession', look: PERFORMER_LOOKS.musician, x: c.x - 1, y: c.y - 2, tx: c.x + 1, ty: c.y + 2, dir: 'down', shout: '💐 Long live the newlyweds!' };
  }
  const house = town.plan?.houses?.[0];
  if (day % 5 !== 0 || !house || hour < 9 || hour >= 17) return null;
  return { id: 'birth-' + town.id + '-' + day, villageId: town.id, kind: 'giftBearer', name: 'Happy Neighbor', look: PERFORMER_LOOKS.newcomer, x: house.x + Math.floor(house.w / 2), y: house.y + house.h + 1.4, dir: 'up', shout: '🎀 A new baby was born today! Bringing gifts!' };
}

export function triggerHeroVictoryLife(game, deedTitle, villageId = 'lexia') {
  const life = ensureLife(game);
  const v = villageOf(villageId) || VILLAGES[0];
  if (!v) return;
  const c = v.plan?.center || { x: v.x + v.w / 2, y: v.y + v.h / 2 };
  if (!life.statues.some((s) => s.title === deedTitle)) {
    life.statues.push({
      id: 'stat-' + Date.now(),
      villageId: v.id,
      x: Math.round(c.x - 3),
      y: Math.round(c.y - 2),
      title: deedTitle,
      day: game.day || 1,
    });
  }
  const songTitle = 'Ballad of ' + deedTitle;
  if (!life.heroSongs.some((s) => s.title === songTitle)) {
    life.heroSongs.push({
      title: songTitle,
      line: '"Raise your mugs to ' + (game.player?.name || 'the Hero') + ', who conquered ' + deedTitle + '!"',
      day: game.day || 1,
    });
  }
  recordGossip(game, 'Bards in ' + v.name + ' sing of ' + (game.player?.name || 'the Hero') + ' (' + deedTitle + ')!', v.id);
}

export function newDayVillagesLife(game) {
  const life = ensureLife(game);
  const day = game.day || 1;
  life.weeklyMarketDay = day % 7 === 3;

  // 1. Advance construction & post-raid roof/wall scaffolding (#25, #32)
  for (const site of life.constructions) {
    if (site.stage < site.maxStage) {
      site.stage += 1;
      if (site.stage >= site.maxStage) {
        const v = villageOf(site.villageId);
        if (v && site.kind === 'house') {
          if (game.villages?.[v.id]) game.villages[v.id].adults += 2;
          recordAbsenceNote(game, 'A newly built cottage finished in ' + v.name + ' and newcomers moved in.');
          recordGossip(game, 'A brand-new cottage opened in ' + v.name + '!', v.id);
        } else if (v) {
          recordAbsenceNote(game, 'Builders finished repairing damaged roofs in ' + v.name + '.');
        }
      }
    }
  }
  life.constructions = life.constructions.filter((c) => c.stage < c.maxStage || day - (c.builtDay || day) < 1);

  if (life.constructions.length === 0 && day % 4 === 2) {
    const v = VILLAGES[day % Math.min(6, VILLAGES.length)];
    const spot = v?.plan?.square ? { x: v.plan.square.x - 4, y: v.plan.square.y + 3 } : null;
    if (v && spot && !isSolid(spot.x, spot.y)) {
      life.constructions.push({ id: 'con-' + day, villageId: v.id, x: spot.x, y: spot.y, stage: 1, maxStage: 3, kind: 'house', builtDay: day });
    }
  }

  // 2. Border Exodus & Abandoned Homes near northern Demon frontier (#16) + Frontier Watchtowers (#62)
  for (const v of VILLAGES) {
    const center = { x: v.x + v.w / 2, y: v.y + v.h / 2 };
    const isFrontier = isDemonGroundNear(game, center.x, center.y, FRONTIER_RANGE) || Boolean(game.war?.warbands?.some((b) => b.targetId === v.id));
    if (isFrontier && (v.plan?.gates?.length || 0) > 0 && !life.borderTowers.some((t) => t.villageId === v.id)) {
      const g = bestGateOf(v, { x: v.x + v.w / 2, y: 0 }) || v.plan.gates[0];
      life.borderTowers.push({ id: 'twr-' + v.id, villageId: v.id, x: g.x - (g.dx || 0) * 3, y: g.y - (g.dy || 0) * 3, builtDay: day });
    }
    if (isFrontier && day >= 3 && (v.plan?.houses?.length || 0) >= 3) {
      const already = life.abandonedHouses.some((a) => a.villageId === v.id);
      const occupied = game.villages?.[v.id]?.owner === 'monsters';
      if (!already && (occupied || day % 6 === 0)) {
        const targetHouse = v.plan.houses[v.plan.houses.length - 1];
        life.abandonedHouses.push({ villageId: v.id, x: targetHouse.x, y: targetHouse.y, w: targetHouse.w, h: targetHouse.h, day });
        recordAbsenceNote(game, 'Families on the edge of ' + v.name + ' boarded up an abandoned cottage ahead of demon scouts.');
      }
    }
  }

  // 3. Elder aging & natural funeral -> gravestone & mourning banner (#14, #23, #72, #96)
  for (const [id, eld] of Object.entries(life.elderLedger || {})) {
    if (!eld.alive) continue;
    eld.ageDays = (eld.ageDays || 40) + 1;
    if (eld.ageDays >= 75) {
      eld.alive = false;
      const v = villageOf(eld.villageId) || VILLAGES[0];
      const base = v?.plan?.houses?.[0];
      const gx = base ? base.x - 2 : v.x + 6;
      const gy = base ? base.y + base.h : v.y + 6;
      life.graves.push({ id: 'grv-' + id, villageId: v.id, name: eld.name, x: gx, y: gy, day, mourningUntil: day + 2 });
      recordAbsenceNote(game, eld.name + ' of ' + v.name + ' passed peacefully; the village held a quiet funeral.');
      recordGossip(game, 'Townsfolk in ' + v.name + ' laid ' + eld.name + ' to rest beneath the pines.', v.id);
    }
  }

  // 4. Absence tracking (#100)
  const zone = zoneAt(game.player.x, game.player.y);
  const inHomeTown = zone.id === 'lexia' || zone.id === 'home' || (zone.id === 'visitHouse' && game.run.visitHouse?.house?.village === 'lexia');
  if (inHomeTown) {
    if (day - (life.lastHomeDay || day) >= 2 && life.absenceLog.length > 0) {
      const latest = life.absenceLog[life.absenceLog.length - 1];
      notify(game, '🏡 Back in Eldermoor while you were away: ' + latest.text, '#ffd86b');
      life.absenceLog = [];
    }
    life.lastHomeDay = day;
  }
}

export function slowVillageEvents(game) {
  const rl = ensureRunLife(game);
  syncVillagePerformers(game);

  const now = Date.now();
  const hour = game.hour || 12;
  const pZone = zoneAt(game.player.x, game.player.y);
  const currentV = pZone.kind === 'village' ? pZone : null;

  // Guard Shift Change announcement + physically marching guard relief (#27)
  const hrInt = Math.floor(hour);
  if ((hrInt === 6 || hrInt === 18) && rl.shiftCheckHour !== hrInt && currentV) {
    rl.shiftCheckHour = hrInt;
    notify(game, '🛡️ ' + currentV.name + ': Gate watch changing shifts along the walls.', '#9fd8ff');
    const gate = currentV.plan?.gates?.[0];
    const sq = currentV.plan?.center;
    if (gate && sq) {
      rl.performers.push({
        id: 'rel-' + currentV.id + '-' + hrInt,
        villageId: currentV.id,
        kind: 'guardRelief',
        name: 'Gate Relief Squad',
        look: PERFORMER_LOOKS.guard,
        x: sq.x,
        y: sq.y,
        tx: gate.x,
        ty: gate.y,
        dir: 'right',
        step: 0,
        walking: true,
        shout: 'Changing the gate watch—stay alert on the parapet!',
      });
    }
  }

  // Evening Lamplighter routine 17:30 - 19:30 (#26)
  if (hour >= 17.5 && hour < 19.5 && currentV) {
    const lamps = (currentV.plan?.props || []).filter((p) => p.kind === 'lamp');
    if (lamps.length > 0 && (!rl.lamplighter || rl.lamplighter.villageId !== currentV.id)) {
      const door = closestDoor({ villageId: currentV.id, x: currentV.plan.center.x, y: currentV.plan.center.y }); // comes out of a house
      rl.lamplighter = {
        villageId: currentV.id,
        name: 'Evening Lamplighter',
        look: PERFORMER_LOOKS.lamplighter,
        x: door.x,
        y: door.y,
        dir: 'down',
        step: 0,
        walking: false,
        lampIdx: 0,
        litSet: {},
      };
    }
  } else if (hour < 17 || hour >= 20) {
    rl.lamplighter = null;
  }

  rl.pickpockets = rl.pickpockets.filter((p) => !p.caught && now < p.expiresAt);
  rl.houseFires = rl.houseFires.filter((f) => !f.doused && now < f.expiresAt);

  // Live Pickpocket crime event (#28)
  if (currentV && !isNight(game) && rl.pickpockets.length === 0 && Math.random() < 0.012) {
    const c = currentV.plan.center;
    const g = bestGateOf(currentV, { x: c.x + 20, y: c.y })?.outside || { x: currentV.x + currentV.w + 3, y: c.y };
    rl.pickpockets.push({
      id: 'pk-' + now,
      villageId: currentV.id,
      name: 'Street Pickpocket',
      look: PERFORMER_LOOKS.pickpocket,
      x: c.x + (Math.random() - 0.5) * 3,
      y: c.y + (Math.random() - 0.5) * 3,
      tx: g.x,
      ty: g.y,
      dir: 'right',
      step: 0,
      walking: true,
      stolenLexis: 18 + Math.floor(Math.random() * 18),
      shout: 'THIEF! Stop that pickpocket!',
      expiresAt: now + 40000,
    });
    notify(game, '🗣️ "THIEF! A pickpocket snatched a purse near ' + currentV.name + ' square!"', '#ff8a95');
  }

  // Chimney Fire event (#37)
  if (currentV && rl.houseFires.length === 0 && Math.random() < (game.weather?.kind === 'storm' ? 0.015 : 0.004)) {
    const h = (currentV.plan?.houses || []).find((item) => item.style !== 'tent');
    if (h) {
      rl.houseFires.push({
        id: 'fire-' + now,
        villageId: currentV.id,
        x: h.x + Math.floor(h.w / 2),
        y: h.y + h.h - 1,
        intensity: 100,
        doused: false,
        expiresAt: now + 45000,
      });
      notify(game, '🔥 A chimney fire broke out in ' + currentV.name + '! Villagers are forming a bucket brigade!', '#ff7043');
    }
  }
}

// A performer walks to its place (or to the door it leaves by), then stands there.
function walkPerformer(perf, dt) {
  if (perf.tx === undefined || Math.hypot(perf.tx - perf.x, perf.ty - perf.y) <= 0.6) {
    perf.walking = false;
    return;
  }
  const speed = perf.kind === 'funeral' ? 0.7 : perf.kind === 'guardRelief' ? 1.85 : 1.1;
  if (!stepSmart(perf, perf.tx, perf.ty, speed, dt, { stopAtGate: false })) perf.walking = false;
}

// The juggled pins, the soap of the washerwoman, the petals of the wedding.
function performerEffects(game, perf, dt) {
  if (perf.walking) return;
  if (perf.kind === 'juggler' && Math.random() < dt * 3.5) {
    addParticle(game, { x: perf.x, y: perf.y - 1.1, vx: (Math.random() - 0.5) * 0.9, vy: -1.8, life: 0.5, color: ['#ffd23f', '#ff5c94', '#7cfc9a'][Math.floor(Math.random() * 3)], size: 2 });
  } else if (perf.kind === 'washer' && Math.random() < dt * 2.2) {
    addParticle(game, { x: perf.x + 0.6, y: perf.y, vx: 0.3, vy: -0.4, life: 0.6, color: '#eef8ff', size: 2 });
  } else if (perf.kind === 'wedding' && Math.random() < dt * 2.5) {
    addParticle(game, { x: perf.x + (Math.random() - 0.5), y: perf.y - 0.8, vx: 0.3, vy: 0.5, life: 0.8, color: '#ff8ca8', size: 2 });
  }
}

export function updateVillageEvents(game, dt) {
  const rl = ensureRunLife(game);
  const now = Date.now();

  if (rl.lamplighter) {
    const ll = rl.lamplighter;
    const v = villageOf(ll.villageId);
    const lamps = (v?.plan?.props || []).filter((p) => p.kind === 'lamp');
    const target = lamps[ll.lampIdx];
    if (target) {
      if (distance(ll, target) > 1.0) {
        stepSmart(ll, target.x + 0.5, target.y + 0.8, 1.9, dt);
      } else {
        ll.walking = false;
        ll.litSet[target.x + ',' + target.y] = true;
        if (!game.run.litLamps) game.run.litLamps = {};
        game.run.litLamps[target.x + ',' + target.y] = true;
        addParticle(game, { x: target.x + 0.5, y: target.y + 0.2, vx: 0, vy: -0.9, life: 0.6, color: '#ffd86b', size: 3 });
        ll.lampIdx = (ll.lampIdx + 1) % lamps.length;
      }
    }
  }

  for (const p of rl.pickpockets) {
    stepSmart(p, p.tx, p.ty, 2.55, dt, { stopAtGate: false });
    if (distance(p, { x: p.tx, y: p.ty }) < 1.5) p.expiresAt = now;
  }

  for (const f of rl.houseFires) {
    if (!f.doused && Math.random() < dt * 6) {
      addParticle(game, { x: f.x + Math.random(), y: f.y - 0.5, vx: (Math.random() - 0.5) * 0.8, vy: -1.4, life: 0.7, color: Math.random() < 0.5 ? '#ff6a2b' : '#ffd23f', size: 3 });
    }
  }

  for (const perf of rl.performers) {
    walkPerformer(perf, dt);
    performerEffects(game, perf, dt);
  }
  rl.performers = rl.performers.filter((p) => !(p.leaving && !p.walking)); // in the house: gone
  rl.performers = rl.performers.filter((p) => !(p.kind === 'guardRelief' && !p.walking && !isInSight(game, p))); // on the wall
}

export function actionsOfVillageLife(game) {
  const rl = ensureRunLife(game);
  const life = ensureLife(game);
  const list = [];

  const nearThief = rl.pickpockets.find((p) => !p.caught && distance(p, game.player) < 2.2);
  if (nearThief) {
    list.push({
      when: () => true,
      icon: 'sword',
      run: () => {
        nearThief.caught = true;
        life.stats.thievesCaught = (life.stats.thievesCaught || 0) + 1;
        const reward = Math.max(10, Math.round(nearThief.stolenLexis * 0.75));
        earnLexis(game, reward);
        gainXp(game, 25);
        addHappiness(game, 3);
        cue(game, 'victory');
        recordGossip(game, (game.player?.name || 'The hero') + ' tackled a street pickpocket in ' + (villageOf(nearThief.villageId)?.name || 'town') + '!', nearThief.villageId);
        notify(game, '🛑 Caught the pickpocket! Returned the purse (+' + reward + ' Lexis, +25 XP, +3 Happiness)', '#7cfc9a');
      },
    });
  }

  const nearFire = rl.houseFires.find((f) => !f.doused && distance(f, game.player) < 2.4);
  if (nearFire) {
    list.push({
      when: () => true,
      icon: 'water',
      run: () => {
        if ((game.player.bottle || 0) > 0) game.player.bottle -= 1;
        nearFire.doused = true;
        life.stats.firesDoused = (life.stats.firesDoused || 0) + 1;
        earnLexis(game, 25);
        gainXp(game, 30);
        addHappiness(game, 4);
        cue(game, 'heal');
        notify(game, '💧 Doused the house fire! Townsfolk cheer (+25 Lexis, +30 XP, +4 Happiness)', '#7cfc9a');
      },
    });
  }

  const nearPerf = rl.performers.find((p) => distance(p, game.player) < 1.8) || (rl.lamplighter && distance(rl.lamplighter, game.player) < 1.8 ? rl.lamplighter : null);
  if (nearPerf) {
    list.push({
      when: () => true,
      icon: 'talk',
      run: () => {
        if (nearPerf.kind === 'beggar') {
          say(game, null, ['Gate Beggar: "Could a kind soul spare 5 Lexis for warm bread?"'], [
            {
              label: 'Give 5 Lexis (+Happiness, +Karma)',
              icon: 'lexis',
              run: () => {
                if ((game.player.lexis || 0) < 5) return say(game, null, ['You do not have 5 Lexis right now.']);
                game.player.lexis -= 5;
                nearPerf.helped = true;
                life.stats.beggarsHelped = (life.stats.beggarsHelped || 0) + 1;
                addHappiness(game, 2);
                addFriendship(game, 'aria', 2);
                cue(game, 'coin');
                notify(game, '💛 "May roads stay gentle under your boots!" (+2 Happiness)', '#ffd23f');
              },
            },
            { label: 'Pass by', run: () => {} },
          ]);
          return;
        }
        if (nearPerf.kind === 'musician' && life.heroSongs.length > 0) {
          const song = life.heroSongs[life.heroSongs.length - 1];
          say(game, null, ['🎵 ' + nearPerf.name + ' strums a lively tune:', song.line]);
          return;
        }
        say(game, null, [nearPerf.name + ': "' + nearPerf.shout + '"']);
      },
    });
  }

  return list;
}
