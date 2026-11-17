import { VILLAGES } from '../../data/zones';
import { biomeAt, PORTS } from '../../world/map';

// Closed-loop economic state per village, merchant contracts, global road shipments,
// maritime shipping vessels between ports, and kingdom road patrols.

const START_TREASURY = { capital: 2400, town: 1200, village: 650, farm: 550, hamlet: 280 };

function baseInputsFor(village, biome) {
  const inputs = {
    ore: biome === 'mountain' ? 12 : biome === 'forest' ? 2 : biome === 'desert' ? 1 : 3,
    firewood: biome === 'forest' ? 12 : biome === 'desert' ? 1 : 6,
    crystal: biome === 'mountain' || biome === 'coast' ? 4 : 1,
    wheat: village.kind === 'farm' || biome === 'meadow' ? 14 : biome === 'desert' ? 2 : 6,
    milk: village.kind === 'farm' || biome === 'meadow' ? 6 : 2,
    egg: village.kind === 'farm' || biome === 'meadow' ? 6 : 2,
    apple: biome === 'meadow' || biome === 'forest' ? 5 : 1,
    wildBerries: biome === 'forest' || biome === 'meadow' ? 6 : 1,
    herb: biome === 'forest' || biome === 'meadow' ? 8 : 2,
    honey: biome === 'meadow' || village.kind === 'farm' ? 5 : 2,
    mushroom: biome === 'forest' ? 8 : 2,
    wool: village.kind === 'farm' || biome === 'meadow' || biome === 'mountain' ? 7 : 2,
    pelt: biome === 'forest' || biome === 'mountain' ? 6 : 2,
    branch: biome === 'forest' ? 10 : 4,
    rawMeat: biome === 'forest' ? 6 : 3,
    rawFish: biome === 'coast' ? 10 : 1,
    coconut: biome === 'coast' || biome === 'desert' ? 5 : 0,
  };
  if (village.id === 'lexia') {
    inputs.ore = Math.max(inputs.ore, 4);
    inputs.firewood = Math.max(inputs.firewood, 6);
    inputs.wheat = Math.max(inputs.wheat, 8);
    inputs.herb = Math.max(inputs.herb, 4);
    inputs.honey = Math.max(inputs.honey, 3);
  }
  return inputs;
}

function baseStockFor(village, biome) {
  const mult = village.kind === 'capital' ? 2 : village.kind === 'town' ? 1.5 : 1;
  const q = (n) => Math.max(1, Math.round(n * mult));
  const stock = {
    ironSword: biome === 'mountain' ? q(3) : q(2),
    steelSword: village.kind === 'capital' || biome === 'mountain' ? 1 : 0,
    mithrilSword: village.kind === 'capital' ? 1 : 0,
    leatherArmor: q(2),
    chainMail: biome === 'mountain' || village.kind === 'capital' ? 1 : 0,
    plateArmor: village.kind === 'capital' ? 1 : 0,
    leatherBoots: q(2),
    windBoots: village.kind === 'capital' ? 1 : 0,
    turretKit: q(2),
    healthPotion: q(4),
    bigPotion: village.kind === 'capital' ? 2 : 1,
    manaPotion: q(2),
    speedPotion: q(2),
    timePotion: q(2),
    hintPotion: q(1),
    bread: q(5),
    berryTart: 0,
    driedMeat: q(4),
    roastedFish: biome === 'coast' ? q(4) : 0,
    cloth: q(4),
    oil: q(3),
    carrotSeed: q(6),
    herbSeed: q(5),
    flowerSeed: q(5),
    wheatSeed: q(6),
    horseFeed: q(4),
    decorBanner: q(2),
    ring: village.kind === 'capital' ? 2 : 1,
    map1: 2,
    map2: 1,
    map3: 1,
    autoHeater: village.kind === 'capital' || village.id === 'lexia' || village.kind === 'town' ? 1 : 0,
  };
  if (village.kind === 'capital') {
    stock.rareSpice = 3;
    stock.silkBolt = 3;
    stock.silverBrooch = 2;
    stock.goldenChalice = 1;
  } else if (biome === 'desert') {
    stock.rareSpice = 3;
  } else if (biome === 'coast') {
    stock.silkBolt = 2;
  }
  return stock;
}

function nearestPortFor(village) {
  const cx = village.x + village.w / 2;
  const cy = village.y + village.h / 2;
  let best = null;
  let bestDist = 85;
  for (const p of PORTS) {
    const d = Math.hypot(p.x - cx, p.y - cy);
    if (d < bestDist) {
      best = p;
      bestDist = d;
    }
  }
  return best;
}

export function seedVillageEconomy(village) {
  const cx = village.x + village.w / 2;
  const cy = village.y + village.h / 2;
  const biome = biomeAt(cx, cy);
  const roles = [...new Set((village.plan?.houses || []).map((h) => h.role))];
  const port = nearestPortFor(village);
  if (port) roles.push('harbor');
  return {
    id: village.id,
    biome: biome,
    kingdom: village.kingdom || 'lexia',
    portId: port ? port.id || port.name : null,
    roles: roles,
    treasury: START_TREASURY[village.kind] || 600,
    inputs: baseInputsFor(village, biome),
    stock: baseStockFor(village, biome),
    wagesPaid: 0,
    taxesEarned: 0,
    craftedCount: 0,
  };
}

export function firstEconomy() {
  const villages = {};
  for (const v of VILLAGES) villages[v.id] = seedVillageEconomy(v);
  return {
    villages: villages,
    contracts: [],
    activeContract: null,
    shipments: [],
    ships: [],
    patrols: [],
    nextSeq: 1,
    lastStepHour: 0,
  };
}

export function ensureEconomy(game) {
  if (!game.economy || typeof game.economy !== 'object') {
    game.economy = firstEconomy();
    return game.economy;
  }
  const e = game.economy;
  if (!e.villages || typeof e.villages !== 'object') e.villages = {};
  for (const v of VILLAGES) {
    if (!e.villages[v.id]) e.villages[v.id] = seedVillageEconomy(v);
  }
  if (!Array.isArray(e.contracts)) e.contracts = [];
  if (!Array.isArray(e.shipments)) e.shipments = [];
  if (!Array.isArray(e.ships)) e.ships = [];
  if (!Array.isArray(e.patrols)) e.patrols = [];
  if (!e.nextSeq) e.nextSeq = 1;
  return e;
}

export function nextEconId(game, prefix) {
  const e = ensureEconomy(game);
  const id = prefix + '-' + e.nextSeq;
  e.nextSeq += 1;
  return id;
}

export function econVillage(game, villageId) {
  const e = ensureEconomy(game);
  return e.villages[villageId] || null;
}

// Pays `amount` Lexis from village A's treasury to village B (or player when payeeVillageId is null).
export function transferTreasury(game, fromVillageId, toVillageId, amount) {
  const val = Math.max(0, Math.round(amount));
  if (val <= 0) return 0;
  const from = fromVillageId ? econVillage(game, fromVillageId) : null;
  const to = toVillageId ? econVillage(game, toVillageId) : null;
  const paid = from ? Math.min(from.treasury, val) : val;
  if (from) from.treasury -= paid;
  if (to) to.treasury += paid;
  return paid;
}
