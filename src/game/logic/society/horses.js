import { ITEMS } from '../../data/items';
import { villageOf, zoneAt, isInsideWorld } from '../../data/zones';
import { isSolid, ROAD_CELLS } from '../../world/map';
import { CELLS, SCALE } from '../../world/size';
import { gameHours } from '../boosts';
import { countItem, addItem, removeItem } from '../player';
import { addHappiness } from '../village';
import { notify, say } from '../messages';
import { dust, floatText } from '../particles';
import { cue } from '../cues';
import { ensureSociety, addInfamy, changeVillageMood, isVillain, villagePriceMultiplier, ridingSpeedMultiplier, startSocietyFight } from './state';

// Merchant horses in capitals & along roads, buying/feeding/stealing horses, hunger and bolting.

export const HORSE_COLORS = ['bay', 'white', 'chestnut', 'black'];
const COLOR_LABELS = { bay: 'Bay', white: 'White', chestnut: 'Chestnut', black: 'Black' };
const FEED_ITEMS = [
  { id: 'horseFeed', fill: 100 },
  { id: 'hay', fill: 55 },
  { id: 'wheat', fill: 35 },
  { id: 'carrot', fill: 30 },
  { id: 'bread', fill: 25 },
];
const BUY_HORSE_BASE = 120;

function capitalHorseSpots(village) {
  const sq = village.plan.square;
  const cx = sq.x + Math.floor(sq.w / 2);
  const cy = sq.y + Math.floor(sq.h / 2);
  return [
    { id: village.id + '-mh-0', x: sq.x + 2.5, y: sq.y + sq.h - 2.5, color: 'bay' },
    { id: village.id + '-mh-1', x: sq.x + sq.w - 3.5, y: sq.y + sq.h - 2.5, color: 'chestnut' },
    { id: village.id + '-mh-2', x: cx + 5.5, y: cy + 0.5, color: 'white' },
  ];
}

function findRoadSpotNear(player) {
  const pcx = Math.floor(player.x / SCALE);
  const pcy = Math.floor(player.y / SCALE);
  for (let tries = 0; tries < 18; tries++) {
    const cx = pcx + Math.floor((Math.random() - 0.5) * 5);
    const cy = pcy + Math.floor((Math.random() - 0.5) * 5);
    if (cx < 2 || cy < 2 || cx >= CELLS - 2 || cy >= CELLS - 2) continue;
    if (!ROAD_CELLS.has(cy * CELLS + cx)) continue;
    const x = cx * SCALE + 4.5 + (Math.random() - 0.5) * 3;
    const y = cy * SCALE + 4.5 + (Math.random() - 0.5) * 3;
    const far = Math.hypot(x - player.x, y - player.y);
    if (far >= 6 && far <= 22 && !isSolid(x, y) && zoneAt(x, y).kind === 'land') return { x: x, y: y };
  }
  return null;
}

// Spawns merchant horses in awake capitals and along nearby roads (called once per second).
export function syncMerchantHorses(game) {
  const s = ensureSociety(game);
  const awake = game.run.awake || [];
  // Keep only horses from awake capitals or nearby road caravans
  game.run.merchantHorses = game.run.merchantHorses.filter((horse) => {
    if (s.stolenSpots[horse.id] === game.day) return false;
    if (horse.villageId) return awake.includes(horse.villageId);
    return Math.hypot(horse.x - game.player.x, horse.y - game.player.y) < 34;
  });

  // Capitals get merchant horses around their markets
  for (const id of awake) {
    const village = villageOf(id);
    if (!village || village.kind !== 'capital') continue;
    for (const spot of capitalHorseSpots(village)) {
      if (s.stolenSpots[spot.id] === game.day) continue;
      if (game.run.merchantHorses.some((item) => item.id === spot.id)) continue;
      if (!isSolid(spot.x, spot.y)) {
        game.run.merchantHorses.push({
          id: spot.id,
          villageId: id,
          x: spot.x,
          y: spot.y,
          homeX: spot.x,
          homeY: spot.y,
          color: spot.color,
          dir: 'right',
          step: 0,
          walkX: 0,
          walkY: 0,
          walkTime: Math.random() * 2,
        });
      }
    }
  }

  // Outdoor roads get occasional traveling merchant horses
  if (isInsideWorld(game.player.y)) return;
  const roadHorses = game.run.merchantHorses.filter((item) => !item.villageId);
  if (roadHorses.length < 2 && zoneAt(game.player.x, game.player.y).kind === 'land' && Math.random() < 0.35) {
    const spot = findRoadSpotNear(game.player);
    if (spot) {
      const color = HORSE_COLORS[Math.floor(Math.random() * HORSE_COLORS.length)];
      game.run.merchantHorses.push({
        id: 'road-' + Date.now() + '-' + Math.floor(Math.random() * 999),
        villageId: null,
        x: spot.x,
        y: spot.y,
        homeX: spot.x,
        homeY: spot.y,
        color: color,
        dir: Math.random() < 0.5 ? 'left' : 'right',
        step: 0,
        walkX: 0,
        walkY: 0,
        walkTime: 1,
      });
    }
  }
}

export function updateMerchantHorses(game, dt) {
  const horses = game.run.merchantHorses || [];
  for (const horse of horses) {
    horse.walkTime -= dt;
    if (horse.walkTime <= 0) {
      const fromHome = Math.hypot(horse.x - horse.homeX, horse.y - horse.homeY);
      if (fromHome > 4) {
        horse.walkX = (horse.homeX - horse.x) / fromHome;
        horse.walkY = (horse.homeY - horse.y) / fromHome;
      } else if (Math.random() < 0.55) {
        horse.walkX = 0;
        horse.walkY = 0;
      } else {
        const angle = Math.random() * Math.PI * 2;
        horse.walkX = Math.cos(angle);
        horse.walkY = Math.sin(angle);
      }
      horse.walkTime = 1.5 + Math.random() * 3;
    }
    const nx = horse.x + horse.walkX * 0.75 * dt;
    const ny = horse.y + horse.walkY * 0.75 * dt;
    if (!isSolid(nx, ny) && (horse.walkX !== 0 || horse.walkY !== 0)) {
      horse.x = nx;
      horse.y = ny;
      horse.step += dt * 5;
      if (Math.abs(horse.walkX) > 0.1) horse.dir = horse.walkX < 0 ? 'left' : 'right';
    }
  }
}

// Updates horse hunger while riding, warns when hungry, and bolts if completely starved.
export function updateRiding(game, dt) {
  const s = ensureSociety(game);
  const riding = s.riding;
  if (!riding || !riding.active) return;

  const nowHour = gameHours(game);
  const prevHour = typeof riding.lastHour === 'number' ? riding.lastHour : nowHour;
  const deltaHours = Math.max(0, nowHour - prevHour);
  riding.lastHour = nowHour;

  if (isInsideWorld(game.player.y)) return;

  if (game.run.walking) {
    riding.dustAt = (riding.dustAt || 0) + dt;
    if (riding.dustAt >= 0.18) {
      riding.dustAt = 0;
      dust(game, game.player.x, game.player.y + 0.2);
    }
  }

  // Ignore huge jumps (sleep / hospital rest) so resting doesn't starve the horse
  if (deltaHours > 0 && deltaHours < 1.0) {
    const rate = game.run.walking ? 9.5 : 1.5;
    riding.hunger = Math.min(100, (riding.hunger || 0) + deltaHours * rate);
  }

  if (riding.hunger >= 65 && (riding.warned || 0) < 1) {
    riding.warned = 1;
    notify(game, '🐴 Your horse is getting hungry. Feed it wheat, carrots, hay, or horse feed.', '#ffd23f');
  }
  if (riding.hunger >= 92 && (riding.warned || 0) < 2) {
    riding.warned = 2;
    notify(game, '🐴 Your horse is starving and slows to a crawl! Feed it soon or it will bolt!', '#ff8a95');
  }

  if (riding.hunger >= 100 && game.run.walking) {
    riding.starveSec = (riding.starveSec || 0) + dt;
    if (riding.starveSec >= 6) {
      riding.active = false;
      riding.starveSec = 0;
      s.parkedHorse = null;
      cue(game, 'horse');
      notify(game, '🐴 Your starving horse threw you off and bolted away!', '#ff6060');
    }
  } else {
    riding.starveSec = 0;
  }
}

export function merchantHorseNear(game) {
  const horses = game.run.merchantHorses || [];
  return horses.find((horse) => Math.hypot(horse.x - game.player.x, horse.y - game.player.y) < 1.7) || null;
}

export function parkedHorseNear(game) {
  const parked = ensureSociety(game).parkedHorse;
  if (!parked) return false;
  return Math.hypot(parked.x - game.player.x, parked.y - game.player.y) < 1.8;
}

function feedHorseState(game, target, feed) {
  removeItem(game.player, feed.id);
  target.hunger = Math.max(0, (target.hunger || 0) - feed.fill);
  target.warned = target.hunger >= 65 ? 1 : 0;
  target.starveSec = 0;
  cue(game, 'horse');
  floatText(game, game.player.x, game.player.y - 0.8, '🐴 Fed!', '#7cfc9a');
  notify(game, '🐴 Fed your horse ' + ITEMS[feed.id].name + ' (hunger: ' + Math.round(target.hunger) + '%).', '#7cfc9a');
}

function feedChoices(game, target) {
  return FEED_ITEMS.filter((feed) => countItem(game.player, feed.id) > 0).map((feed) => ({
    label: 'Feed ' + ITEMS[feed.id].name + ' (×' + countItem(game.player, feed.id) + ')',
    icon: feed.id,
    run: () => feedHorseState(game, target, feed),
  }));
}

function stealHorse(game, horse) {
  const s = ensureSociety(game);
  s.stolenSpots[horse.id] = game.day;
  game.run.merchantHorses = game.run.merchantHorses.filter((item) => item.id !== horse.id);
  s.parkedHorse = null;
  s.riding = { active: true, hunger: 12, color: horse.color, warned: 0, starveSec: 0, lastHour: gameHours(game) };
  addInfamy(game, 15);
  addHappiness(game, -2);
  cue(game, 'horse');
  cue(game, 'alarm');

  if (horse.villageId) {
    changeVillageMood(game, horse.villageId, -12);
    for (const villager of game.run.villagers) {
      if (villager.village === horse.villageId && villager.knight && !villager.ko && !villager.dead) villager.angry = 60;
    }
    notify(game, '🐴 You stole a merchant horse! Guards are alerted! (+15 Infamy)', '#ff8a95');
  } else if (Math.random() < 0.55) {
    say(game, null, ['A caravan guard catches up! "Hey! That is a merchant horse — stop, thief!"'], [
      {
        label: 'Fight the Caravan Guard!',
        icon: 'woodSword',
        run: () => startSocietyFight(game, { name: 'Caravan Guard', shape: 'knight', health: 50, attack: 16, speed: 10, xp: 30, lexis: 20 }, { kind: 'townFight', role: 'guard', villagerId: null, villageId: null }),
      },
      {
        label: 'Gallop away (+5 Infamy)',
        icon: 'horseFeed',
        run: () => {
          addInfamy(game, 5);
          notify(game, '🐴 You spurred the stolen horse down the road!', '#ffd23f');
        },
      },
    ]);
  } else {
    notify(game, '🐴 You stole a merchant horse! (+15 Infamy)', '#ffb070');
  }
}

export function interactMerchantHorse(game, horse) {
  const choices = [
    { label: 'Steal this horse (+Infamy, alerts guards)', icon: 'woodSword', run: () => stealHorse(game, horse) },
  ];
  const treat = FEED_ITEMS.find((feed) => countItem(game.player, feed.id) > 0);
  if (treat) {
    choices.push({
      label: 'Give it a ' + ITEMS[treat.id].name,
      icon: treat.id,
      run: () => {
        removeItem(game.player, treat.id);
        cue(game, 'horse');
        addInfamy(game, -1);
        notify(game, '🐴 The merchant horse munches happily.', '#7cfc9a');
      },
    });
  }
  choices.push({ label: 'Leave it', run: () => {} });
  say(game, null, ['A ' + COLOR_LABELS[horse.color].toLowerCase() + ' merchant horse loaded with trade packs. Its saddle looks sturdy.'], choices);
}

export function interactMountedHorse(game) {
  const s = ensureSociety(game);
  const riding = s.riding;
  const hunger = Math.round(riding.hunger || 0);
  const speed = ridingSpeedMultiplier(game);
  const choices = [
    ...feedChoices(game, riding),
    {
      label: 'Dismount horse',
      icon: 'step',
      run: () => {
        riding.active = false;
        s.parkedHorse = { x: game.player.x, y: game.player.y, color: riding.color, hunger: riding.hunger };
        cue(game, 'step');
      },
    },
    { label: 'Keep riding', run: () => {} },
  ];
  const warning = hunger >= 92 ? ' It is starving and barely trotting!' : hunger >= 65 ? ' It looks hungry.' : ' It feels strong and fast.';
  say(game, null, ['Your ' + (COLOR_LABELS[riding.color] || 'Bay') + ' horse (Hunger ' + hunger + '/100 · Speed ' + speed + '×).' + warning], choices);
}

export function interactParkedHorse(game) {
  const s = ensureSociety(game);
  const parked = s.parkedHorse;
  if (!parked) return;
  const choices = [
    {
      label: 'Mount horse',
      icon: 'powers',
      run: () => {
        s.riding = { active: true, hunger: parked.hunger || 0, color: parked.color || 'bay', warned: (parked.hunger || 0) >= 65 ? 1 : 0, starveSec: 0, lastHour: gameHours(game) };
        s.parkedHorse = null;
        cue(game, 'horse');
      },
    },
    ...feedChoices(game, parked),
    { label: 'Leave it here', run: () => {} },
  ];
  say(game, null, ['Your waiting ' + (COLOR_LABELS[parked.color] || 'Bay') + ' horse (Hunger ' + Math.round(parked.hunger || 0) + '/100).'], choices);
}

function buyHorseWithColor(game, villageId, price, color) {
  const s = ensureSociety(game);
  if (game.player.lexis < price) {
    notify(game, 'You need ' + price + ' Lexis for a horse.', '#ff8a95');
    return;
  }
  game.player.lexis -= price;
  s.parkedHorse = null;
  s.riding = { active: true, hunger: 0, color: color, warned: 0, starveSec: 0, lastHour: gameHours(game) };
  s.horsesOwned += 1;
  changeVillageMood(game, villageId, 4);
  cue(game, 'horse');
  notify(game, '🐴 Bought a ' + COLOR_LABELS[color] + ' horse! Ride fast and keep it fed.', '#7cfc9a');
}

export function interactStable(game, village) {
  const s = ensureSociety(game);
  const mult = villagePriceMultiplier(game, village.id);
  const horsePrice = Math.max(60, Math.round(BUY_HORSE_BASE * mult));
  const feedPrice = Math.max(6, Math.round(ITEMS.horseFeed.price * mult));
  const hayPrice = Math.max(4, Math.round(ITEMS.hay.price * mult));

  if (isVillain(game) && (game.villages[village.id]?.mood ?? 50) < 25) {
    say(game, null, ['Stable Master: "We do not sell our horses to known villains! Clear your name first."']);
    return;
  }

  const choices = [
    {
      label: 'Buy a Horse (' + horsePrice + ' Lexis)',
      icon: 'lexis',
      run: () => {
        if (game.player.lexis < horsePrice) {
          say(game, null, ['Stable Master: "A fine horse costs ' + horsePrice + ' Lexis. Come back with full pockets!"']);
          return;
        }
        say(game, null, ['Stable Master: "Which coat do you prefer?"'], [
          ...HORSE_COLORS.map((color) => ({ label: COLOR_LABELS[color] + ' Horse (' + horsePrice + ' Lexis)', run: () => buyHorseWithColor(game, village.id, horsePrice, color) })),
          { label: 'Never mind', run: () => {} },
        ]);
      },
    },
    {
      label: 'Buy Horse Feed (' + feedPrice + ' Lexis)',
      icon: 'horseFeed',
      run: () => {
        if (game.player.lexis < feedPrice) {
          notify(game, 'Need ' + feedPrice + ' Lexis.', '#ff8a95');
          return;
        }
        game.player.lexis -= feedPrice;
        addItem(game.player, 'horseFeed');
        cue(game, 'trade');
        notify(game, '🐴 Bought Horse Feed.', '#7cfc9a');
      },
    },
    {
      label: 'Buy Hay Bale (' + hayPrice + ' Lexis)',
      icon: 'hay',
      run: () => {
        if (game.player.lexis < hayPrice) {
          notify(game, 'Need ' + hayPrice + ' Lexis.', '#ff8a95');
          return;
        }
        game.player.lexis -= hayPrice;
        addItem(game.player, 'hay');
        cue(game, 'trade');
        notify(game, '🌾 Bought Hay Bale.', '#7cfc9a');
      },
    },
  ];

  const activeOrParked = s.riding.active ? s.riding : s.parkedHorse;
  if (activeOrParked && (activeOrParked.hunger || 0) > 0) {
    const careCost = Math.max(5, Math.round(10 * mult));
    choices.push({
      label: 'Stable groom & feed horse (' + careCost + ' Lexis)',
      icon: 'bread',
      run: () => {
        if (game.player.lexis < careCost) {
          notify(game, 'Need ' + careCost + ' Lexis.', '#ff8a95');
          return;
        }
        game.player.lexis -= careCost;
        activeOrParked.hunger = 0;
        activeOrParked.warned = 0;
        cue(game, 'horse');
        notify(game, '🐴 Your horse is rested and full!', '#7cfc9a');
      },
    });
  }
  choices.push({ label: 'Leave', run: () => {} });

  say(game, null, ['Village Stable: the smell of fresh hay and oiled saddles fills the air.'], choices);
}
