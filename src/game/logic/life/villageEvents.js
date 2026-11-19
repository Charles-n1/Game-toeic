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

export function syncVillagePerformers(game) {
  const life = ensureLife(game);
  const rl = ensureRunLife(game);
  const awake = new Set(game.run?.awake || []);
  rl.performers = rl.performers.filter((p) => awake.has(p.villageId));

  const day = game.day || 1;
  const hour = game.hour || 12;
  const marketDay = day % 7 === 3;

  for (const vid of awake) {
    const v = villageOf(vid);
    if (!v || !v.plan?.center) continue;
    const c = v.plan.center;
    if (rl.performers.some((p) => p.villageId === vid)) continue;

    // Morning Town Square Crier reading dawn news (#29)
    if (hour >= 7 && hour < 10.5) {
      const headline =
        marketDay
          ? 'Hear ye! Grand Market Fair opens on ' + v.name + ' Square today!'
          : life.gossip.length > 0
            ? 'Hear ye! ' + life.gossip[life.gossip.length - 1].text
            : 'Hear ye! Fair skies along the high roads—watch the forest traps!';
      rl.performers.push({
        id: 'crier-' + vid,
        villageId: vid,
        kind: 'crier',
        name: 'Morning Town Crier',
        look: PERFORMER_LOOKS.crier,
        x: c.x,
        y: c.y - 1.5,
        dir: 'down',
        shout: headline,
      });
    }

    // Street juggler & musician on Capitals (#39) + Weekly Market vendors (#21)
    if (v.kind === 'capital' || marketDay) {
      rl.performers.push({
        id: 'perf-jug-' + vid,
        villageId: vid,
        kind: 'juggler',
        name: marketDay ? 'Market Herald' : 'Street Juggler',
        look: PERFORMER_LOOKS.juggler,
        x: c.x - 2,
        y: c.y + 1,
        dir: 'down',
        shout: marketDay ? 'Fresh market wares—best prices today!' : 'Watch three fire-pins fly!',
      });
      rl.performers.push({
        id: 'perf-mus-' + vid,
        villageId: vid,
        kind: 'musician',
        name: 'Lute Player',
        look: PERFORMER_LOOKS.musician,
        x: c.x + 2,
        y: c.y + 1,
        dir: 'down',
        shout: life.heroSongs.length > 0 ? '♪ Ballad of ' + (game.player?.name || 'the Hero') + '! ♪' : '♪ Golden meadows of spring! ♪',
      });
    }

    // Capital Gate Beggar (#38)
    if (v.kind === 'capital' && v.plan?.gates?.length > 0) {
      const g = v.plan.gates[0];
      rl.performers.push({
        id: 'beg-' + vid,
        villageId: vid,
        kind: 'beggar',
        name: 'Gate Beggar',
        look: PERFORMER_LOOKS.beggar,
        x: g.x + (g.dx === 0 ? 2 : -g.dx * 2),
        y: g.y + (g.dy === 0 ? 2 : -g.dy * 2),
        dir: 'down',
        helped: false,
        shout: 'Spare a copper coin for bread, traveler?',
      });
    }

    // Village Council (#40): elder & citizens debating at square table
    if (v.kind !== 'hamlet' && hour >= 9 && hour < 17) {
      rl.performers.push({
        id: 'coun-' + vid,
        villageId: vid,
        kind: 'council',
        name: v.name + ' Councilor',
        look: PERFORMER_LOOKS.council,
        x: c.x + 3.2,
        y: c.y - 1.5,
        dir: 'left',
        shout: 'Taxes, palisades, and the northern frontier...',
      });
    }

    // Riverbank Washerwoman during sunny mornings (#30)
    if (!isNight(game) && game.weather?.kind !== 'storm' && hour >= 7.5 && hour < 15.5) {
      const bank = findRiverbankNear(v);
      if (bank) {
        rl.performers.push({
          id: 'wash-' + vid,
          villageId: vid,
          kind: 'washer',
          name: 'River Washerwoman',
          look: PERFORMER_LOOKS.washer,
          x: bank.x,
          y: bank.y,
          dir: 'right',
          shout: 'Sun-dried linens smell sweet by noon!',
        });
      }
    }

    // Newcomer Cart full of furniture moving in after cottage completion or moving-day (#15)
    const builtHouse = (v.plan?.houses || [])[0];
    if (builtHouse && (day % 4 === 3 || life.absenceLog.some((n) => n.day === day && n.text.includes('cottage'))) && v.plan?.gates?.length) {
      const g = v.plan.gates[0].outside || { x: v.x, y: c.y };
      rl.performers.push({
        id: 'newcart-' + vid + '-' + day,
        villageId: vid,
        kind: 'newcomerCart',
        name: 'Newcomer Family Cart',
        look: PERFORMER_LOOKS.newcomer,
        x: g.x,
        y: g.y,
        tx: builtHouse.x + Math.floor(builtHouse.w / 2),
        ty: builtHouse.y + builtHouse.h + 1.2,
        dir: 'right',
        step: 0,
        walking: true,
        shout: '🪑 Just arrived with chests and oak chairs for our new cottage!',
      });
    }

    // Funeral Procession slowly walking toward newly dug grave (#23)
    const freshGrave = life.graves.find((g) => g.villageId === vid && day <= (g.day || 0) + 1);
    if (freshGrave) {
      rl.performers.push({
        id: 'fun-' + vid + '-' + freshGrave.id,
        villageId: vid,
        kind: 'funeral',
        name: 'Funeral Procession',
        look: PERFORMER_LOOKS.mourner,
        x: c.x,
        y: c.y,
        tx: freshGrave.x - 1,
        ty: freshGrave.y + 0.8,
        dir: 'right',
        step: 0,
        walking: true,
        shout: '🕯️ May ' + freshGrave.name + ' rest gently beneath the pines...',
      });
    }

    // Periodic Wedding (#22) or Birth Gift Bearer (#24) celebration
    if (day % 9 === 0 && v.id === 'lexia') {
      rl.performers.push({
        id: 'wed-' + vid + '-' + day,
        villageId: vid,
        kind: 'wedding',
        name: 'Wedding Procession',
        look: PERFORMER_LOOKS.musician,
        x: c.x - 1,
        y: c.y - 2,
        tx: c.x + 1,
        ty: c.y + 2,
        dir: 'down',
        shout: '💐 Long live the newlyweds!',
      });
    } else if (day % 5 === 0 && v.plan?.houses?.length > 0) {
      const h = v.plan.houses[0];
      rl.performers.push({
        id: 'birth-' + vid + '-' + day,
        villageId: vid,
        kind: 'giftBearer',
        name: 'Happy Neighbor',
        look: PERFORMER_LOOKS.newcomer,
        x: h.x + Math.floor(h.w / 2),
        y: h.y + h.h + 1.4,
        dir: 'up',
        shout: '🎀 A new baby was born today! Bringing gifts!',
      });
    }
  }
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
    const isFrontier = v.y < 680 || Boolean(game.war?.warbands?.some((b) => b.targetId === v.id));
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
      rl.lamplighter = {
        villageId: currentV.id,
        name: 'Evening Lamplighter',
        look: PERFORMER_LOOKS.lamplighter,
        x: currentV.plan.center.x,
        y: currentV.plan.center.y,
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
    if (perf.kind === 'juggler' && Math.random() < dt * 3.5) {
      addParticle(game, { x: perf.x, y: perf.y - 1.1, vx: (Math.random() - 0.5) * 0.9, vy: -1.8, life: 0.5, color: ['#ffd23f', '#ff5c94', '#7cfc9a'][Math.floor(Math.random() * 3)], size: 2 });
    } else if (perf.kind === 'washer' && Math.random() < dt * 2.2) {
      addParticle(game, { x: perf.x + 0.6, y: perf.y, vx: 0.3, vy: -0.4, life: 0.6, color: '#eef8ff', size: 2 });
    } else if (perf.kind === 'wedding' || perf.kind === 'newcomerCart' || perf.kind === 'funeral' || perf.kind === 'guardRelief') {
      const spd = perf.kind === 'funeral' ? 0.7 : perf.kind === 'guardRelief' ? 1.85 : 1.1;
      if (Math.hypot((perf.tx || perf.x) - perf.x, (perf.ty || perf.y) - perf.y) > 0.6) {
        stepSmart(perf, perf.tx, perf.ty, spd, dt, { stopAtGate: false });
      } else {
        perf.walking = false;
      }
      if (perf.kind === 'wedding' && Math.random() < dt * 2.5) {
        addParticle(game, { x: perf.x + (Math.random() - 0.5), y: perf.y - 0.8, vx: 0.3, vy: 0.5, life: 0.8, color: '#ff8ca8', size: 2 });
      }
    }
  }
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
