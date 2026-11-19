import { NPCS } from '../../data/npcs';
import { villageOf } from '../../data/zones';
import { isSolid } from '../../world/map';
import { randomOf } from '../../world/seeded';
import { facingOf } from '../input';
import { isInVisitedHouse } from '../houses';

// The people living in the houses the hero visits: who they are, how they look, and their life inside
// (they eat, drink, play, sleep, love). (Entering the houses: logic/houses.js.)

const RESIDENT_FIRST = ['Clara', 'Bram', 'Nora', 'Toren', 'Lina', 'Ewan', 'Mila', 'Kael', 'Sora', 'Garrick'];

const RESIDENT_KID_NAMES = ['Pip', 'Milo', 'Tilly', 'Bryn', 'Lia', 'Ned'];

const RESIDENT_OUTFITS = ['#4f6d9a', '#8c4b3a', '#4a7a5c', '#6e4e8c', '#9c6e38', '#3e737a'];

const RESIDENT_HAIRS = ['#3a2416', '#8a5a30', '#d6b45a', '#24202c', '#9c422c'];

const RESIDENT_SKINS = ['#fde0c8', '#f1c9a5', '#d8a47f', '#c99a72'];

export function makeResidentLook(seedKey, isKid = false) {
  const r = randomOf('houseLook:' + seedKey);
  return {
    skin: RESIDENT_SKINS[Math.floor(r() * RESIDENT_SKINS.length)],
    hair: RESIDENT_HAIRS[Math.floor(r() * RESIDENT_HAIRS.length)],
    style: isKid || r() < 0.5 ? 'short' : 'long',
    eyes: '#3a3240',
    outfit: RESIDENT_OUTFITS[Math.floor(r() * RESIDENT_OUTFITS.length)],
    trim: isKid ? '#ffd87a' : '#e6d3ad',
  };
}

export function makeHouseResidents(game, house, door, info, inside, floor = 0) {
  const { x, y } = inside;
  const seed = door.x + ',' + door.y + ',' + floor;
  const rng = randomOf('res:' + seed);
  const night = (game.hour || 12) >= 21 || (game.hour || 12) < 6;
  const residents = [];

  // Prefer named villagers or NPCs from this house first on Floor 0
  const worldAdults = (info.villagers || []).filter((v) => !v.kid);
  const worldKids = (info.villagers || []).filter((v) => v.kid);
  const primaryNamed = info.named?.[0];

  if (floor === 0) {
    const firstAdult = primaryNamed
      ? { npcId: primaryNamed.id, name: primaryNamed.name, look: primaryNamed.look }
      : worldAdults[0]
        ? { name: worldAdults[0].name, look: worldAdults[0].look }
        : { name: RESIDENT_FIRST[Math.floor(rng() * RESIDENT_FIRST.length)], look: makeResidentLook(seed + 'a1') };
    residents.push({
      kind: 'resident',
      npcId: firstAdult.npcId || null,
      name: firstAdult.name,
      look: firstAdult.look,
      x: x + 4.8,
      y: y + 7.4,
      dir: 'right',
      step: 0,
      walking: false,
      activity: night ? 'sleeping' : rng() < 0.5 ? 'eating' : 'drinking',
      actTimer: 4 + rng() * 5,
      homeBed: { x: x + 13.8, y: y + 9.2 },
      diningSpot: { x: x + 4.8, y: y + 7.5 },
      playSpot: { x: x + 6.5, y: y + 10.5 },
    });

    if (info.isFamily || worldAdults.length >= 2 || rng() < 0.55) {
      const partnerSource = worldAdults[1] || info.named?.[1];
      const partner = partnerSource
        ? { npcId: partnerSource.id || null, name: partnerSource.name, look: partnerSource.look }
        : { name: RESIDENT_FIRST[Math.floor(rng() * RESIDENT_FIRST.length)], look: makeResidentLook(seed + 'a2') };
      if (partner.name === firstAdult.name) partner.name += ' II';
      residents.push({
        kind: 'resident',
        npcId: partner.npcId || null,
        name: partner.name,
        look: partner.look,
        partner: true,
        x: x + 15.2,
        y: y + 10.2,
        dir: 'left',
        step: 0,
        walking: false,
        activity: night ? 'romantic' : rng() < 0.45 ? 'eating' : 'idle',
        actTimer: 5 + rng() * 5,
        homeBed: { x: x + (info.isFamily ? 14.3 : 17.5), y: y + 9.2 },
        diningSpot: { x: x + 5.8, y: y + 7.5 },
        playSpot: { x: x + 8.5, y: y + 5.5 },
      });
    }

    if (info.isFamily) {
      const kidSrc = worldKids[0];
      residents.push({
        kind: 'resident',
        kid: true,
        name: kidSrc ? kidSrc.name : RESIDENT_KID_NAMES[Math.floor(rng() * RESIDENT_KID_NAMES.length)],
        look: kidSrc ? kidSrc.look : makeResidentLook(seed + 'k1', true),
        x: x + 18.2,
        y: y + 11.4,
        dir: 'down',
        step: 0,
        walking: false,
        activity: night ? 'sleeping' : 'playing',
        actTimer: 4 + rng() * 4,
        homeBed: { x: x + 17.5, y: y + 9.4 },
        diningSpot: { x: x + 4.4, y: y + 5.2 },
        playSpot: { x: x + 18.4, y: y + 12.2 },
      });
    }
  } else {
    // Floor 1 (Upstairs 2e étage): couple resting/cuddling/reading in upper bedroom + playing kid in loft
    const upA = {
      kind: 'resident',
      partner: true,
      name: RESIDENT_FIRST[Math.floor(rng() * RESIDENT_FIRST.length)],
      look: makeResidentLook(seed + 'u1'),
      x: x + 14.2,
      y: y + 5.2,
      dir: 'right',
      step: 0,
      walking: false,
      activity: rng() < 0.45 ? 'sleeping' : rng() < 0.8 ? 'romantic' : 'idle',
      actTimer: 5 + rng() * 5,
      homeBed: { x: x + 13.8, y: y + 4.3 },
      diningSpot: { x: x + 5.2, y: y + 6.5 },
      playSpot: { x: x + 15.0, y: y + 7.5 },
    };
    const upB = {
      kind: 'resident',
      partner: true,
      name: RESIDENT_FIRST[Math.floor(rng() * RESIDENT_FIRST.length)],
      look: makeResidentLook(seed + 'u2'),
      x: x + 15.1,
      y: y + 5.2,
      dir: 'left',
      step: 0,
      walking: false,
      activity: upA.activity === 'romantic' ? 'romantic' : 'eating',
      actTimer: 5 + rng() * 5,
      homeBed: { x: x + 14.7, y: y + 4.3 },
      diningSpot: { x: x + 6.2, y: y + 6.5 },
      playSpot: { x: x + 15.8, y: y + 7.5 },
    };
    if (upB.name === upA.name) upB.name += ' Lyn';
    residents.push(upA, upB);
    if (info.isFamily) {
      residents.push({
        kind: 'resident',
        kid: true,
        name: RESIDENT_KID_NAMES[Math.floor(rng() * RESIDENT_KID_NAMES.length)],
        look: makeResidentLook(seed + 'uk1', true),
        x: x + 18.2,
        y: y + 10.6,
        dir: 'down',
        step: 0,
        walking: false,
        activity: night ? 'sleeping' : 'playing',
        actTimer: 4 + rng() * 4,
        homeBed: { x: x + 17.5, y: y + 10.2 },
        diningSpot: { x: x + 4.4, y: y + 6.5 },
        playSpot: { x: x + 18.4, y: y + 11.4 },
      });
    }
  }
  return residents;
}

export function residentsForHouse(game, house, door) {
  const named = NPCS.filter((npc) => npc.at && npc.at[0] === house.village && npc.at[1] === house.role);
  const fam = (game.families || []).find((f) => named.some((n) => f.parents.includes(n.id)));
  const doorMatchX = house.x + Math.floor(house.w / 2) + 0.5;
  const doorMatchY = house.y + house.h + 0.5;
  const villagers = (game.run.villagers || []).filter(
    (v) => v.home && Math.abs(v.home.x - doorMatchX) < 2 && Math.abs(v.home.y - doorMatchY) < 2
  );
  const hasKids = Boolean((fam && fam.children.length > 0) || villagers.some((v) => v.kid));
  const adultCount = Math.max(named.length + (fam && fam.parents.length >= 2 ? 1 : 0), villagers.filter((v) => !v.kid).length);
  const civicOrBig = ['house', 'farm', 'elder', 'inn', 'palace', 'mayor'].includes(house.role) || house.size === 'house' || house.size === 'palace';
  const fallbackFamily = civicOrBig && randomOf('familyHouse:' + door.x + ',' + door.y)() < 0.65;
  const isFamily = hasKids || adultCount >= 2 || (villagers.length === 0 && named.length === 0 && fallbackFamily);

  const label = named.length > 0
    ? named.map((n) => n.name).join(' & ') + "'s House"
    : villagers.length > 0
      ? villagers[0].name + (isFamily ? "'s Family Home" : "'s House")
      : (villageOf(house.village)?.name || 'Village') + ' ' + (house.role === 'inn' ? 'Inn' : house.role === 'clinic' ? 'Clinic' : isFamily ? 'Family House' : 'Cottage');

  return {
    title: label,
    isFamily: isFamily,
    named: named,
    villagers: villagers,
    names: [...named.map((n) => n.name), ...villagers.slice(0, 4).map((v) => v.name)],
    hasKids: hasKids || isFamily,
  };
}

function stepResidentInside(p, tx, ty, speed, dt) {
  const far = Math.hypot(tx - p.x, ty - p.y);
  if (far < 0.25) {
    p.walking = false;
    return true;
  }
  p.dir = facingOf(tx - p.x, ty - p.y);
  const step = Math.min(far, speed * dt);
  const nx = p.x + ((tx - p.x) / far) * step;
  const ny = p.y + ((ty - p.y) / far) * step;
  if (!isSolid(nx, p.y)) p.x = nx;
  if (!isSolid(p.x, ny)) p.y = ny;
  p.step = (p.step || 0) + dt * 5;
  p.walking = true;
  return false;
}

// Animates residents living inside any visited house (eating, drinking, playing, sleeping, loving moments).
export function updateHouseResidents(game, dt) {
  const visit = game.run.visitHouse;
  if (!visit || !Array.isArray(visit.patrons) || !isInVisitedHouse(game)) return;
  const night = (game.hour || 12) >= 21 || (game.hour || 12) < 6;
  const residents = visit.patrons.filter((p) => p.kind === 'resident');
  if (residents.length === 0) return;

  for (const r of residents) {
    r.actTimer = (r.actTimer || 0) - dt;
    if (r.actTimer <= 0) {
      r.actTimer = 5 + Math.random() * 6;
      const roll = Math.random();
      if (r.kid) {
        r.activity = night ? 'sleeping' : roll < 0.55 ? 'playing' : roll < 0.8 ? 'eating' : 'drinking';
      } else if (night) {
        r.activity = r.partner && roll < 0.42 ? 'romantic' : roll < 0.82 ? 'sleeping' : 'drinking';
      } else {
        r.activity = roll < 0.28 ? 'eating' : roll < 0.48 ? 'drinking' : roll < 0.68 ? 'idle' : roll < 0.86 ? 'sleeping' : r.partner ? 'romantic' : 'idle';
      }
      r.drinking = r.activity === 'drinking' || r.activity === 'eating';
    }
    const spot =
      r.activity === 'sleeping' || r.activity === 'romantic'
        ? r.homeBed
        : r.activity === 'playing'
          ? r.playSpot
          : r.diningSpot;
    if (spot) {
      stepResidentInside(r, spot.x, spot.y, r.kid ? 1.7 : 1.15, dt);
    }
  }
}
