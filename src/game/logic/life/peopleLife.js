import { villageOf, zoneAt } from '../../data/zones';
import { isNight } from '../clock';
import { isSolid, tileAt } from '../../world/map';
import { TILE } from '../../world/tileKinds';
import { stepSmart } from '../../world/paths';
import { visibleVillagers } from '../villagers';
import { emote } from '../emotes';
import { addParticle } from '../particles';
import { isVillain } from '../society/state';
import { ensureLife, ensureRunLife } from './state';
import { distance } from '../../world/geometry';


function stepSide(v, from, speed, dt) {
  const dx = v.x - from.x;
  const dy = v.y - from.y;
  const len = Math.max(0.1, Math.hypot(dx, dy));
  const nx = v.x + (dx / len) * speed * dt;
  const ny = v.y + (dy / len) * speed * dt;
  if (!isSolid(nx, ny)) {
    v.x = nx;
    v.y = ny;
    v.walking = true;
  }
}

function hashOf(str) {
  return (str || '').split('').reduce((s, ch) => s + ch.charCodeAt(0), 0);
}

function townFeature(town, role) {
  return (town?.plan?.houses || []).find((h) => h.role === role) || null;
}

function doorOf(house) {
  if (!house) return null;
  return { x: house.x + Math.floor(house.w / 2) + 0.5, y: house.y + house.h + 0.6 };
}

function nearestWaterSpot(cx, cy, radius = 14) {
  let best = null;
  let bestD = Infinity;
  for (let dy = -radius; dy <= radius; dy += 2) {
    for (let dx = -radius; dx <= radius; dx += 2) {
      const tx = Math.round(cx + dx);
      const ty = Math.round(cy + dy);
      if (tileAt(tx, ty) === TILE.WATER && !isSolid(tx - 1, ty)) {
        const d = Math.hypot(dx, dy);
        if (d < bestD) {
          bestD = d;
          best = { x: tx - 1 + 0.5, y: ty + 0.5 };
        }
      }
    }
  }
  return best;
}

export function gossipLinesFor(game, villageId) {
  const life = ensureLife(game);
  return (life.gossip || []).filter((g) => g.originId !== villageId && (game.day || 1) >= g.day + 1);
}

export function syncVillagePets(game) {
  const rl = ensureRunLife(game);
  const awake = new Set(game.run?.awake || []);
  rl.roofCats = rl.roofCats.filter((c) => awake.has(c.villageId));
  rl.townDogs = rl.townDogs.filter((d) => awake.has(d.villageId));
  rl.porchBenches = (rl.porchBenches || []).filter((b) => awake.has(b.villageId));

  for (const vid of awake) {
    const v = villageOf(vid);
    if (!v || !v.plan?.houses?.length) continue;
    if (!rl.roofCats.some((c) => c.villageId === vid)) {
      const catHouses = v.plan.houses.filter((h) => h.style !== 'tent').slice(0, 3);
      catHouses.forEach((h, idx) => {
        rl.roofCats.push({
          id: 'cat-' + vid + '-' + idx,
          villageId: vid,
          x: h.x + h.w * 0.5 + (idx % 2 === 0 ? -0.4 : 0.4),
          y: h.y + 0.9,
          phase: idx * 2.1,
          color: ['#e8963e', '#26232e', '#eef0f6'][idx % 3],
        });
      });
    }
    if (!rl.townDogs.some((d) => d.villageId === vid)) {
      const c = v.plan.center || { x: v.x + v.w / 2, y: v.y + v.h / 2 };
      rl.townDogs.push({
        id: 'dog-' + vid + '-1',
        villageId: vid,
        x: c.x + 2,
        y: c.y + 1,
        dir: 'right',
        step: 0,
        walking: false,
        barkUntil: 0,
        shout: null,
      });
    }
  }
}

// The moments of life at a door: the villager goes in, and stays inside this long (seconds), instead of
// waiting in front of the door.
const STAY_INSIDE = { school: [60, 120], lunch: [30, 60], temple: [40, 80], healerVisit: [20, 40], shelter: [40, 80], drunk: [60, 120] };
// Busy with a moment of life, or resting from the last one (see logic/villagers.js): not given a new one now.
function isBusy(v, now) {
  return v.inside || v.lifeUntil > now || now < (v.lifeRestUntil || 0);
}

// At the door of the place: in. Hidden until the stay is over (logic/villagers.js brings the villager out).
function goInside(v, now) {
  const stay = STAY_INSIDE[v.lifeMode];
  if (!stay || v.inside) return;
  v.inside = true;
  v.walking = false;
  v.lifeUntil = now + (stay[0] + Math.random() * (stay[1] - stay[0])) * 1000;
}

// A moment of life: walk to the target, then stay there durationMs. The time of the walk is added: a moment
// that ended on the way made the villager turn back, and go again, forever.
function setMoveGoal(v, target, mode, speed, durationMs) {
  if (!target) return;
  const walkMs = (distance(v, target) / speed) * 1000 * 1.4;
  v.lifeTarget = { x: target.x, y: target.y };
  v.lifeMode = mode;
  v.lifeSpeed = speed;
  v.lifeUntil = Date.now() + walkMs + durationMs;
}

export function slowPeopleLife(game) {
  const life = ensureLife(game);
  const rl = ensureRunLife(game);
  syncVillagePets(game);

  const hour = game.hour || 12;
  const day = game.day || 1;
  const raining = game.weather?.kind === 'rain' || game.weather?.kind === 'storm';
  const now = Date.now();
  const villain = isVillain(game);
  const around = visibleVillagers(game).filter((v) => distance(v, game.player) < 28);
  const sickEntries = Object.entries(life.sickVillagers || {}).filter(([, info]) => day <= info.untilDay);

  for (const v of around) {
    const isUrgent = (raining && v.home && !v.knight) || rl.houseFires.some((f) => !f.doused && f.villageId === v.village);
    if (isUrgent ? v.inside : isBusy(v, now)) continue; // rain and fire can not wait; the rest can
    v.carry = null;
    const hash = hashOf(v.id);
    if (!v.kid && !v.lifeRole) {
      if (hash % 9 === 0) {
        v.isElder = true;
        v.look = { ...v.look, hair: '#cfd6e6' };
      } else if (hash % 11 === 0 && day >= 2) {
        v.isApprentice = true;
      } else if (hash % 13 === 0) {
        v.hasSpouseStroll = true;
      }
    }
    v.lifeRole = v.isElder ? 'elder' : v.isApprentice ? 'apprentice' : 'citizen';

    const town = villageOf(v.village);
    const activeFire = rl.houseFires.find((f) => !f.doused && f.villageId === v.village);
    const well = (town?.plan?.props || []).find((p) => p.kind === 'well');
    const innDoor = doorOf(townFeature(town, 'inn'));
    const churchDoor = doorOf(townFeature(town, 'church') || townFeature(town, 'temple'));
    const schoolDoor = doorOf(townFeature(town, 'library') || townFeature(town, 'academy'));

    // 1. Storm & Rain Shelter (#2): actually run under inn/home doorways!
    if (raining && v.home && !v.knight) {
      const shelter = innDoor && distance(v, innDoor) < distance(v, v.home) ? innDoor : v.home;
      setMoveGoal(v, shelter, 'shelter', 2.35, 3500);
      v.carry = null;
      if (Math.random() < 0.45) v.lifeBubble = '☔ Running for cover!';
    }
    // 2. Bucket Brigade (#2): villagers run from well to fire with buckets!
    else if (activeFire && !v.kid && !v.knight && hash % 2 === 0) {
      const atFire = distance(v, activeFire) < 2.2;
      if (atFire) {
        activeFire.intensity = Math.max(0, (activeFire.intensity || 100) - 8);
        if (activeFire.intensity <= 0) activeFire.doused = true;
        addParticle(game, { x: activeFire.x + 0.5, y: activeFire.y, vx: 0, vy: -1.1, life: 0.6, color: '#6fd0ff', size: 3 });
        v.firePhase = 'well';
      } else if (well && distance(v, well) < 2.2) {
        v.firePhase = 'fire';
      }
      const goal = v.firePhase === 'well' && well ? { x: well.x + 0.5, y: well.y + 1.2 } : { x: activeFire.x + 0.5, y: activeFire.y + 1 };
      setMoveGoal(v, goal, 'brigade', 2.4, 3000);
      v.carry = 'bucket';
      v.lifeBubble = '💧 Bucket brigade!';
    }
    // 3. Kids Really Playing (#6, #35): walk to school at 8, rush out at noon, play tag & chase chickens!
    else if (v.kid) {
      v.carry = null;
      if (hour >= 7.8 && hour < 11.9 && schoolDoor) {
        setMoveGoal(v, schoolDoor, 'school', 1.75, 4000);
        if (hour < 8.4) v.lifeBubble = '📚 Off to school!';
      } else if (hour >= 11.9 && hour < 12.6 && town?.plan?.square) {
        const sq = town.plan.square;
        setMoveGoal(v, { x: sq.x + (hash % 5) - 2, y: sq.y + ((hash >> 2) % 4) - 1 }, 'recess', 2.35, 3500);
        v.lifeBubble = '🎉 School’s out!';
      } else {
        const otherKid = around.find((k) => k.kid && k.id !== v.id && k.village === v.village && distance(k, v) < 10);
        const chicken = (game.run?.animals || []).find((a) => (a.kind === 'chicken' || a.kind === 'hen') && distance(a, v) < 9);
        if (otherKid && Math.random() < 0.6) {
          setMoveGoal(v, otherKid, 'tag', 2.25, 3000);
          if (distance(v, otherKid) < 1.3) v.lifeBubble = 'Tag, you’re it!';
        } else if (chicken && Math.random() < 0.6) {
          setMoveGoal(v, chicken, 'chaseChicken', 2.1, 2500);
          if (Math.random() < 0.25) v.lifeBubble = 'Haha! Cluck-cluck!';
        }
      }
    }
    // 4. Needs & Routines: Morning Well (#3), Noon Inn Lunch (#31), Temple Morning (#18)
    else if (!v.knight && !v.drunk && hour >= 7.1 && hour < 8.7 && well && hash % 4 === 1) {
      setMoveGoal(v, { x: well.x + ((hash % 3) - 1) * 0.9, y: well.y + 1.3 }, 'wellQueue', 1.5, 4000);
      v.carry = 'bucket';
    } else if (!v.knight && !v.drunk && hour >= 12.0 && hour < 13.3 && innDoor && hash % 3 === 0) {
      setMoveGoal(v, { x: innDoor.x + ((hash % 3) - 1) * 0.7, y: innDoor.y + 0.5 }, 'lunch', 1.65, 4000);
      v.carry = 'bread';
      if (distance(v, innDoor) < 2.5 && Math.random() < 0.2) v.lifeBubble = '🍲 Lunch at the tavern';
    } else if (!v.knight && day % 3 === 0 && hour >= 8.0 && hour < 9.8 && churchDoor && hash % 5 === 0) {
      setMoveGoal(v, churchDoor, 'temple', 1.45, 4000);
      if (Math.random() < 0.2) v.lifeBubble = '🔔 Morning prayers';
    }
    // 5. Elders sit on real Porch Benches outside their homes (#9)
    else if (v.isElder && v.home && !isNight(game) && hour >= 9.5 && hour < 17.5) {
      const benchSpot = { x: v.home.x + 2.6, y: v.home.y - 0.1 }; // beside the house, not in front of the door
      if (!rl.porchBenches.some((b) => b.id === 'bench-' + v.id)) {
        rl.porchBenches.push({ id: 'bench-' + v.id, villageId: v.village, x: benchSpot.x, y: benchSpot.y, elderName: v.name });
      }
      setMoveGoal(v, benchSpot, 'porchBench', 1.0, (60 + Math.random() * 60) * 1000); // a good while on the bench
      if (distance(v, benchSpot) < 0.7 && distance(v, game.player) < 4.5 && Math.random() < 0.2) {
        v.lifeBubble = 'Quiet afternoon on the porch.';
      }
    }
    // 6. Sunset Couples Walking Together (#10)
    else if (!v.knight && hour >= 17.5 && hour <= 19.3 && v.hasSpouseStroll) {
      const partner = around.find((o) => o.village === v.village && o.id !== v.id && !o.kid && !o.knight && hashOf(o.id) % 5 === hash % 5);
      const waterGoal = nearestWaterSpot(town?.plan?.center?.x || v.x, town?.plan?.center?.y || v.y, 16) || town?.plan?.square;
      if (partner && waterGoal) {
        setMoveGoal(v, waterGoal, 'stroll', 1.05, 4500);
        setMoveGoal(partner, { x: v.x + 0.65, y: v.y + 0.15 }, 'stroll', 1.05, 4500);
        if (Math.random() < 0.3) {
          v.lifeBubble = '♥ Evening walk';
          emote(game, v, 'heart');
        }
      }
    }
    // 7. Healer House Call to Sick Villagers (#13)
    else if (sickEntries.length > 0 && (v.job === 'herbalist' || v.job === 'cleric' || hash % 7 === 2) && town) {
      const sickPair = sickEntries.find(([, info]) => info.villageId === v.village);
      const sickTarget = sickPair && (game.run?.villagers || []).find((sv) => sv.id === sickPair[0]);
      if (sickTarget?.home) {
        setMoveGoal(v, sickTarget.home, 'healerVisit', 1.75, 4500);
        v.carry = 'herbs';
        if (Math.random() < 0.25) v.lifeBubble = '🌿 Visiting ' + (sickTarget.name || 'sick neighbor');
      }
    }
    // 8. Apprentice Trailing Master Craftsman (#17)
    else if (v.isApprentice && !isNight(game) && hour >= 7.5 && hour < 17.5) {
      const master = around.find((m) => m.village === v.village && (m.job === 'smith' || m.job === 'foreman' || m.job === 'builder') && !m.kid);
      if (master && distance(v, master) > 1.7) {
        setMoveGoal(v, { x: master.x - 1.1, y: master.y + 0.4 }, 'apprentice', 1.55, 3500);
        v.carry = 'firewood';
      }
    }

    // Carried props by job (#5, #12)
    if (!v.kid && !v.carry) {
      if (v.job === 'woodcutter' && v.working) v.carry = 'firewood';
      else if ((v.job === 'merchant' || v.job === 'baker') && hour >= 6 && hour < 11) v.carry = v.job === 'baker' ? 'bread' : 'flour';
      else if (v.job === 'fisher') v.carry = hour >= 15 ? 'fishBasket' : 'rod';
      else if (v.job === 'farmer' && hour >= 16 && hour < 19) v.carry = 'rod';
    }

    // Neighbors who fought avoid/scowl (#4) & Door Spat ending with walking away down the street (#11)
    const rival = life.rivalryPairs[v.id];
    if (rival && day <= rival.untilDay) {
      const other = around.find((o) => o.id === rival.rivalId && distance(v, o) < 3.8);
      if (other) {
        v.angry = 4;
        v.lifeBubble = 'Hmph!';
      }
    } else if (!v.kid && v.home && hour >= 17 && hour < 19 && Math.random() < 0.015) {
      v.lifeBubble = '😠 I’m going out for fresh air!';
      emote(game, v, '!');
      if (town?.plan?.square) setMoveGoal(v, town.plan.square, 'spatWalk', 2.0, 7500);
    }

    // React to hero (#1) AND neighbor greetings
    if (distance(v, game.player) < 3.4 && !v.ko) {
      const runningArmed = now < (game.run.slashUntil || 0) || (game.run.walking && game.run.running && !villain);
      if (villain && Math.random() < 0.35) {
        v.lifeBubble = '*whispers nervously...*';
      } else if (runningArmed && distance(v, game.player) < 2.2) {
        v.lifeBubble = 'Whoa—easy with that!';
        v.sidestepUntil = now + 1200;
      } else if (!v.namedGreetAt || now - v.namedGreetAt > 45000) {
        v.namedGreetAt = now;
        v.lifeBubble = (v.isElder ? 'Good day, ' : 'Hey, ') + (game.player.name || 'Hero') + '!';
      }
    }

    // Singing drunk wobble (#19)
    if (isNight(game) && hour >= 20 && hour < 23.5 && v.drunk > 0 && v.home) {
      setMoveGoal(v, v.home, 'drunk', 0.85, 5000);
      v.lifeBubble = '♪ Roll me home under silver moons! ♪';
      emote(game, v, 'note');
    }

    // Sick villager stays home (#13)
    if (life.sickVillagers[v.id] && day <= life.sickVillagers[v.id].untilDay) {
      v.task = 'home';
      v.lifeUntil = 0;
      v.lifeBubble = '🤒 Resting indoors...';
    } else if (!v.kid && !v.knight && !life.sickVillagers[v.id] && Math.random() < 0.002) {
      life.sickVillagers[v.id] = { untilDay: day + 2, villageId: v.village };
    }

    // Smith anvil sparks & Baker bread steam (#5, #90)
    if (town && !isNight(game) && (v.working || v.job === 'smith' || v.job === 'baker')) {
      if ((v.job === 'smith' || v.job === 'foreman' || v.job === 'builder') && Math.random() < 0.5) {
        addParticle(game, { x: v.x + 0.3, y: v.y - 0.5, vx: (Math.random() - 0.5) * 2.2, vy: -1.8, life: 0.45, color: '#ffd23f', size: 2 });
      }
      if ((v.job === 'baker' || (hour >= 6 && hour <= 10.5 && v.job === 'merchant')) && Math.random() < 0.45) {
        addParticle(game, { x: v.x, y: v.y - 0.8, vx: 0.2, vy: -1.1, life: 0.9, color: '#fff3e0', size: 3 });
      }
    }
  }

  for (const v of game.run.villagers || []) {
    if (v.lifeBubble && Math.random() < 0.28) v.lifeBubble = null;
  }
  for (const [k, r] of Object.entries(life.rivalryPairs)) {
    if (day > r.untilDay) delete life.rivalryPairs[k];
  }
}

export function updatePeopleLife(game, dt) {
  if (zoneAt(game.player.x, game.player.y).kind === 'inside') return;
  const rl = ensureRunLife(game);
  const now = Date.now();
  const around = visibleVillagers(game);

  for (const v of around) {
    if (v.sidestepUntil && now < v.sidestepUntil) {
      stepSide(v, game.player, 2.2, dt);
    }
    // Actually walk toward assigned real lifeTarget (#2, #3, #6, #9, #10, #11, #13, #17, #18, #19, #31, #35)
    if (v.lifeUntil && now < v.lifeUntil && v.lifeTarget) {
      const tx = v.lifeMode === 'drunk' ? v.lifeTarget.x + Math.sin(now * 0.005 + hashOf(v.id)) * 1.4 : v.lifeTarget.x;
      const ty = v.lifeTarget.y;
      if (Math.hypot(tx - v.x, ty - v.y) > 0.65) {
        if (!stepSmart(v, tx, ty, v.lifeSpeed || 1.5, dt, { stopAtGate: false })) v.lifeUntil = 0; // no way there: back to the day
      } else {
        v.walking = false;
        goInside(v, now);
      }
    }
    // Kids skipping pebbles on pond shores (#6)
    if (v.kid && !v.walking && Math.random() < dt * 0.18) {
      const nearbyWater = [
        [v.x + 2, v.y],
        [v.x - 2, v.y],
        [v.x, v.y + 2],
        [v.x, v.y - 2],
      ].find(([wx, wy]) => tileAt(wx, wy) === TILE.WATER);
      if (nearbyWater) {
        v.lifeBubble = '*skips a pebble!*';
        addParticle(game, { x: nearbyWater[0], y: nearbyWater[1], vx: 0, vy: -0.3, life: 0.6, color: '#bfe8ff', size: 3 });
      }
    }
  }

  // Friendly town dogs (#7): trail villager & bark at threats or sneaking night foxes!
  for (const dog of rl.townDogs) {
    const owner = around.find((v) => v.village === dog.villageId && !v.knight) || null;
    const fox = (rl.nightFoxes || []).find((f) => f.villageId === dog.villageId && distance(f, dog) < 9);
    const threat =
      fox ||
      (game.run.monsters || []).find((m) => m.health > 0 && distance(m, dog) < 7) ||
      rl.pickpockets.find((p) => p.villageId === dog.villageId && distance(p, dog) < 7);
    if (threat) {
      if (fox) fox.fleeing = true;
      stepSmart(dog, threat.x, threat.y, 2.7, dt, { stopAtGate: false });
      dog.barkUntil = now + 1800;
      dog.shout = fox ? 'Woof! Shoo fox!' : 'Woof! Woof!';
    } else {
      if (now > (dog.barkUntil || 0)) dog.shout = null;
      if (owner && distance(dog, owner) > 2.0) {
        stepSmart(dog, owner.x + 0.8, owner.y + 0.6, 1.9, dt);
      } else {
        dog.walking = false;
      }
    }
  }
}
