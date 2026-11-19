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
const STAY_INSIDE = { school: [60, 120], lunch: [30, 60], temple: [40, 80], healerVisit: [20, 40], shelter: [40, 80], drunk: [60, 120], sick: [240, 480] };
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

const SICK_CHANCE = 0.00005; // each second, the chance that a villager falls sick (a few in a village each day)
const SICK_DAYS = 2;

// About once per second: each villager near the hero who is free gets a moment of life (shelter from the rain,
// the bucket brigade, school, the well, lunch, prayers, the porch bench, a walk, a visit...), and the small things
// of their life (what they carry, a quarrel, a word to the hero, a song, falling sick, the sparks of their work).
export function slowPeopleLife(game) {
  const life = ensureLife(game);
  const rl = ensureRunLife(game);
  syncVillagePets(game);
  const now = Date.now();
  const raining = game.weather?.kind === 'rain' || game.weather?.kind === 'storm';
  const around = visibleVillagers(game).filter((v) => distance(v, game.player) < 28);
  for (const v of around) {
    const isUrgent = (raining && v.home && !v.knight) || rl.houseFires.some((f) => !f.doused && f.villageId === v.village);
    if (isUrgent ? v.inside : isBusy(v, now)) continue; // rain and fire can not wait; the rest can
    v.carry = null;
    giveLifeRole(game, v);
    if (fallSickOrRest(game, life, v)) continue;
    chooseMomentOfLife(game, v, around, raining);
    carryTheTools(game, v);
    quarrelOrAvoid(game, life, v, around);
    greetTheHero(game, v, now);
    singHomeDrunk(game, v);
    showTheWork(game, v);
  }
  for (const v of game.run.villagers || []) if (v.lifeBubble && Math.random() < 0.28) v.lifeBubble = null;
  for (const [id, quarrel] of Object.entries(life.rivalryPairs)) if ((game.day || 1) > quarrel.untilDay) delete life.rivalryPairs[id];
}

// Some villagers are elders (gray hair), apprentices, or have a partner to walk with (always the same ones).
function giveLifeRole(game, v) {
  if (!v.kid && !v.lifeRole) {
    const hash = hashOf(v.id);
    if (hash % 9 === 0) {
      v.isElder = true;
      v.look = { ...v.look, hair: '#cfd6e6' };
    } else if (hash % 11 === 0 && (game.day || 1) >= 2) v.isApprentice = true;
    else if (hash % 13 === 0) v.hasSpouseStroll = true;
  }
  v.lifeRole = v.isElder ? 'elder' : v.isApprentice ? 'apprentice' : 'citizen';
}

// A sick villager walks home and stays inside until better. Now and then, someone falls sick. true: sick.
function fallSickOrRest(game, life, v) {
  const day = game.day || 1;
  const sickness = life.sickVillagers[v.id];
  if (sickness && day <= sickness.untilDay) {
    if (v.home) setMoveGoal(v, v.home, 'sick', 1.1, 0);
    v.lifeBubble = '🤒 Going home to rest...';
    return true;
  }
  if (!v.kid && !v.knight && !sickness && Math.random() < SICK_CHANCE) life.sickVillagers[v.id] = { untilDay: day + SICK_DAYS, villageId: v.village };
  return false;
}

// The moment of life that fits the hour, the weather and the person (the first one that fits).
function chooseMomentOfLife(game, v, around, raining) {
  const town = villageOf(v.village);
  const places = {
    well: (town?.plan?.props || []).find((p) => p.kind === 'well'),
    inn: doorOf(townFeature(town, 'inn')),
    church: doorOf(townFeature(town, 'church') || townFeature(town, 'temple')),
    school: doorOf(townFeature(town, 'library') || townFeature(town, 'academy')),
  };
  const moments = [shelterFromRain, fightTheFire, kidsDay, morningWell, lunchAtTheInn, morningPrayers, elderOnTheBench, eveningWalk, visitTheSick, followTheMaster];
  for (const moment of moments) if (moment(game, v, { town, places, around, raining, hash: hashOf(v.id), hour: game.hour || 12 })) return;
}

function shelterFromRain(game, v, { places, raining }) {
  if (!raining || !v.home || v.knight) return false;
  setMoveGoal(v, places.inn && distance(v, places.inn) < distance(v, v.home) ? places.inn : v.home, 'shelter', 2.35, 3500);
  if (Math.random() < 0.45) v.lifeBubble = '☔ Running for cover!';
  return true;
}

// A house on fire: one villager in two runs between the well and the fire with a bucket.
function fightTheFire(game, v, { places, hash }) {
  const fire = ensureRunLife(game).houseFires.find((f) => !f.doused && f.villageId === v.village);
  if (!fire || v.kid || v.knight || hash % 2 !== 0) return false;
  if (distance(v, fire) < 2.2) {
    fire.intensity = Math.max(0, (fire.intensity || 100) - 8);
    if (fire.intensity <= 0) fire.doused = true;
    addParticle(game, { x: fire.x + 0.5, y: fire.y, vx: 0, vy: -1.1, life: 0.6, color: '#6fd0ff', size: 3 });
    v.firePhase = 'well';
  } else if (places.well && distance(v, places.well) < 2.2) v.firePhase = 'fire';
  const goal = v.firePhase === 'well' && places.well ? { x: places.well.x + 0.5, y: places.well.y + 1.2 } : { x: fire.x + 0.5, y: fire.y + 1 };
  setMoveGoal(v, goal, 'brigade', 2.4, 3000);
  v.carry = 'bucket';
  v.lifeBubble = '💧 Bucket brigade!';
  return true;
}

// The kids: school in the morning, out at noon, then tag and chasing the chickens.
function kidsDay(game, v, { town, places, around, hash, hour }) {
  if (!v.kid) return false;
  if (hour >= 7.8 && hour < 11.9 && places.school) {
    setMoveGoal(v, places.school, 'school', 1.75, 4000);
    if (hour < 8.4) v.lifeBubble = '📚 Off to school!';
  } else if (hour >= 11.9 && hour < 12.6 && town?.plan?.square) {
    const square = town.plan.square;
    setMoveGoal(v, { x: square.x + (hash % 5) - 2, y: square.y + ((hash >> 2) % 4) - 1 }, 'recess', 2.35, 3500);
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
  return true;
}

function morningWell(game, v, { places, hash, hour }) {
  if (v.knight || v.drunk || hour < 7.1 || hour >= 8.7 || !places.well || hash % 4 !== 1) return false;
  setMoveGoal(v, { x: places.well.x + ((hash % 3) - 1) * 0.9, y: places.well.y + 1.3 }, 'wellQueue', 1.5, 4000);
  v.carry = 'bucket';
  return true;
}

function lunchAtTheInn(game, v, { places, hash, hour }) {
  if (v.knight || v.drunk || hour < 12 || hour >= 13.3 || !places.inn || hash % 3 !== 0) return false;
  setMoveGoal(v, { x: places.inn.x + ((hash % 3) - 1) * 0.7, y: places.inn.y + 0.5 }, 'lunch', 1.65, 4000);
  v.carry = 'bread';
  if (distance(v, places.inn) < 2.5 && Math.random() < 0.2) v.lifeBubble = '🍲 Lunch at the tavern';
  return true;
}

// Every third day, the morning prayers at the church.
function morningPrayers(game, v, { places, hash, hour }) {
  if (v.knight || (game.day || 1) % 3 !== 0 || hour < 8 || hour >= 9.8 || !places.church || hash % 5 !== 0) return false;
  setMoveGoal(v, places.church, 'temple', 1.45, 4000);
  if (Math.random() < 0.2) v.lifeBubble = '🔔 Morning prayers';
  return true;
}

// The elders sit on the bench beside their house, a good while (drawn sitting: see draw/scene.js).
function elderOnTheBench(game, v, { hour }) {
  if (!v.isElder || !v.home || isNight(game) || hour < 9.5 || hour >= 17.5) return false;
  const rl = ensureRunLife(game);
  const bench = { x: v.home.x + 2.6, y: v.home.y - 0.1 }; // beside the house, not in front of the door
  if (!rl.porchBenches.some((b) => b.id === 'bench-' + v.id)) rl.porchBenches.push({ id: 'bench-' + v.id, villageId: v.village, x: bench.x, y: bench.y, elderName: v.name });
  setMoveGoal(v, bench, 'porchBench', 1.0, (60 + Math.random() * 60) * 1000);
  if (distance(v, bench) < 0.7 && distance(v, game.player) < 4.5 && Math.random() < 0.2) v.lifeBubble = 'Quiet afternoon on the porch.';
  return true;
}

// At sunset, couples walk together to the water.
function eveningWalk(game, v, { town, around, hash, hour }) {
  if (v.knight || hour < 17.5 || hour > 19.3 || !v.hasSpouseStroll) return false;
  const partner = around.find((o) => o.village === v.village && o.id !== v.id && !o.kid && !o.knight && hashOf(o.id) % 5 === hash % 5);
  const water = nearestWaterSpot(town?.plan?.center?.x || v.x, town?.plan?.center?.y || v.y, 16) || town?.plan?.square;
  if (!partner || !water) return false;
  setMoveGoal(v, water, 'stroll', 1.05, 4500);
  setMoveGoal(partner, { x: v.x + 0.65, y: v.y + 0.15 }, 'stroll', 1.05, 4500);
  if (Math.random() < 0.3) {
    v.lifeBubble = '♥ Evening walk';
    emote(game, v, 'heart');
  }
  return true;
}

// A healer brings herbs to a sick neighbor.
function visitTheSick(game, v, { town, hash }) {
  if (!town || !(v.job === 'herbalist' || v.job === 'cleric' || hash % 7 === 2)) return false;
  const day = game.day || 1;
  const sick = Object.entries(ensureLife(game).sickVillagers).find(([, info]) => info.villageId === v.village && day <= info.untilDay);
  const target = sick && (game.run?.villagers || []).find((other) => other.id === sick[0]);
  if (!target?.home) return false;
  setMoveGoal(v, target.home, 'healerVisit', 1.75, 4500);
  v.carry = 'herbs';
  if (Math.random() < 0.25) v.lifeBubble = '🌿 Visiting ' + (target.name || 'sick neighbor');
  return true;
}

// An apprentice follows the smith or the builder all day.
function followTheMaster(game, v, { around, hour }) {
  if (!v.isApprentice || isNight(game) || hour < 7.5 || hour >= 17.5) return false;
  const master = around.find((m) => m.village === v.village && (m.job === 'smith' || m.job === 'foreman' || m.job === 'builder') && !m.kid);
  if (!master || distance(v, master) <= 1.7) return false;
  setMoveGoal(v, { x: master.x - 1.1, y: master.y + 0.4 }, 'apprentice', 1.55, 3500);
  v.carry = 'firewood';
  return true;
}

// What each job carries in the hands.
function carryTheTools(game, v) {
  if (v.kid || v.carry) return;
  const hour = game.hour || 12;
  if (v.job === 'woodcutter' && v.working) v.carry = 'firewood';
  else if ((v.job === 'merchant' || v.job === 'baker') && hour >= 6 && hour < 11) v.carry = v.job === 'baker' ? 'bread' : 'flour';
  else if (v.job === 'fisher') v.carry = hour >= 15 ? 'fishBasket' : 'rod';
  else if (v.job === 'farmer' && hour >= 16 && hour < 19) v.carry = 'rod';
}

// Two neighbors who quarrelled frown at each other; now and then, someone storms out after a row at home.
function quarrelOrAvoid(game, life, v, around) {
  const hour = game.hour || 12;
  const quarrel = life.rivalryPairs[v.id];
  if (quarrel && (game.day || 1) <= quarrel.untilDay) {
    if (around.some((o) => o.id === quarrel.rivalId && distance(v, o) < 3.8)) {
      v.angry = 4;
      v.lifeBubble = 'Hmph!';
    }
    return;
  }
  if (v.kid || !v.home || hour < 17 || hour >= 19 || Math.random() >= 0.015) return;
  v.lifeBubble = '😠 I’m going out for fresh air!';
  emote(game, v, '!');
  const town = villageOf(v.village);
  if (town?.plan?.square) setMoveGoal(v, town.plan.square, 'spatWalk', 2.0, 7500);
}

// A word to the hero passing by: a greeting by name, a whisper (a villain), or a jump aside (running, armed).
function greetTheHero(game, v, now) {
  if (distance(v, game.player) >= 3.4 || v.ko) return;
  const villain = isVillain(game);
  const runningArmed = now < (game.run.slashUntil || 0) || (game.run.walking && game.run.running && !villain);
  if (villain && Math.random() < 0.35) v.lifeBubble = '*whispers nervously...*';
  else if (runningArmed && distance(v, game.player) < 2.2) {
    v.lifeBubble = 'Whoa—easy with that!';
    v.sidestepUntil = now + 1200;
  } else if (!v.namedGreetAt || now - v.namedGreetAt > 45000) {
    v.namedGreetAt = now;
    v.lifeBubble = (v.isElder ? 'Good day, ' : 'Hey, ') + (game.player.name || 'Hero') + '!';
  }
}

// A drunk villager sings on the way home at night.
function singHomeDrunk(game, v) {
  const hour = game.hour || 12;
  if (!isNight(game) || hour < 20 || hour >= 23.5 || !(v.drunk > 0) || !v.home) return;
  setMoveGoal(v, v.home, 'drunk', 0.85, 5000);
  v.lifeBubble = '♪ Roll me home under silver moons! ♪';
  emote(game, v, 'note');
}

// The sparks of the smith, the steam of the bread.
function showTheWork(game, v) {
  const hour = game.hour || 12;
  if (isNight(game) || !(v.working || v.job === 'smith' || v.job === 'baker')) return;
  if ((v.job === 'smith' || v.job === 'foreman' || v.job === 'builder') && Math.random() < 0.5) {
    addParticle(game, { x: v.x + 0.3, y: v.y - 0.5, vx: (Math.random() - 0.5) * 2.2, vy: -1.8, life: 0.45, color: '#ffd23f', size: 2 });
  }
  if ((v.job === 'baker' || (hour >= 6 && hour <= 10.5 && v.job === 'merchant')) && Math.random() < 0.45) {
    addParticle(game, { x: v.x, y: v.y - 0.8, vx: 0.2, vy: -1.1, life: 0.9, color: '#fff3e0', size: 3 });
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
