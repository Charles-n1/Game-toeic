import { VILLAGES, villageOf, zoneAt } from '../../data/zones';
import { KINGDOMS, areEnemies } from '../../data/kingdoms';
import { ITEMS } from '../../data/items';
import { SKINS, HAIRS, MEN_NAMES } from '../../data/villagers';
import { TILE, tileAt, PORTS, isSolid } from '../../world/map';
import { bestGateOf, stepSmart, landNear } from '../../world/paths';
import { pickRandom } from '../../../logic/random';
import { removeItem, countItem, earnLexis, gainXp } from '../player';
import { notify } from '../messages';
import { floatText } from '../particles';
import { cue } from '../cues';
import { ensureEconomy, econVillage, nextEconId, transferTreasury } from './state';
import { craftWorkshops, missingInputsFor } from './crafting';
import { distance } from '../../world/geometry';

// Real multi-layer world traffic & supply logistics:
// 1. Inter-town shipments hauling paid raw inputs & crafted stock between supplier and buyer towns
// 2. Merchant supply/haulage contracts the player can accept and deliver for paid fees
// 3. Autonomous maritime merchant ships sailing across WATER tiles between PORTS
// 4. Mounted kingdom road patrols protecting routes from bandits & warbands
// 5. Local paid village gatherers physically collecting wood/ore/fish/crops near awake towns

const MAX_SHIPMENTS = 12;
const MAX_SHIPS = 8;
const MAX_CONTRACTS = 8;
const SHIPMENT_SPEED = 2.15; // tiles per sec
const SHIP_SPEED = 2.8;
const PATROL_SPEED = 2.35;
const GATHERER_SPEED = 1.65;

function centerOf(v) {
  return { x: v.x + v.w / 2, y: v.y + v.h / 2 };
}


function nearestVillageTo(x, y) {
  let best = null;
  let bestDist = Infinity;
  for (const v of VILLAGES) {
    const c = centerOf(v);
    const d = Math.hypot(c.x - x, c.y - y);
    if (d < bestDist) {
      best = v;
      bestDist = d;
    }
  }
  return best;
}

function isLandRoute(fromCenter, toCenter) {
  let waterHits = 0;
  for (let i = 1; i <= 7; i++) {
    const t = i / 8;
    const x = fromCenter.x + (toCenter.x - fromCenter.x) * t;
    const y = fromCenter.y + (toCenter.y - fromCenter.y) * t;
    if (tileAt(x, y) === TILE.WATER) waterHits += 1;
  }
  return waterHits <= 2;
}

// ---------- 1. Paid Inter-Town Road Shipments ----------

const BUYERS_PER_TRY = 3; // towns that look for a seller, each time a shipment is tried

export function dispatchShipment(game) {
  const econ = ensureEconomy(game);
  if (econ.shipments.length >= MAX_SHIPMENTS) return null;

  const peopleTowns = VILLAGES.filter((v) => game.villages[v.id]?.owner === 'people');
  if (peopleTowns.length < 2) return null;

  // A few towns at random look for what they miss (and can pay for, with the transport). It is tried again every
  // second: looking at every town each time (and every seller for each one) was a tenth of the time of the game.
  const shuffledBuyers = [...peopleTowns].sort(() => Math.random() - 0.5).slice(0, BUYERS_PER_TRY);
  for (const buyer of shuffledBuyers) {
    const gaps = missingInputsFor(game, buyer.id);
    if (gaps.length === 0) continue;
    const buyerEcon = econVillage(game, buyer.id);
    const buyerCenter = centerOf(buyer);

    for (const gap of gaps.slice(0, 3)) {
      const candidates = peopleTowns
        .filter((s) => s.id !== buyer.id && !areEnemies(buyer.kingdom, s.kingdom))
        .map((s) => ({
          town: s,
          center: centerOf(s),
          have: econVillage(game, s.id)?.inputs[gap.itemId] || 0,
          far: distance(centerOf(s), buyerCenter),
        }))
        .filter((c) => c.have >= 5 && c.far > 30 && c.far < 720 && isLandRoute(c.center, buyerCenter))
        .sort((a, b) => a.far - b.far);

      if (candidates.length === 0) continue;
      const picked = candidates[0];
      const seller = picked.town;
      const sellerEcon = econVillage(game, seller.id);
      const qty = Math.min(6, picked.have - 3);
      const unitValue = ITEMS[gap.itemId]?.sell || 6;
      const goodsCost = qty * unitValue;
      const feeLexis = 14 + Math.round(picked.far / 12);
      if (buyerEcon.treasury < goodsCost + feeLexis) continue;

      // Escrow goods out of seller warehouse & pay seller for goods now; hauler earns fee on arrival
      sellerEcon.inputs[gap.itemId] -= qty;
      transferTreasury(game, buyer.id, seller.id, goodsCost);
      buyerEcon.treasury = Math.max(0, buyerEcon.treasury - feeLexis);

      const gates = seller.plan?.gates || [];
      const gate = gates.reduce((b, g) => (!b || distance(g, buyerCenter) < distance(b, buyerCenter) ? g : b), null);
      const sx = gate ? gate.x + gate.dx * 3 : picked.center.x;
      const sy = gate ? gate.y + gate.dy * 3 : picked.center.y;

      const shipment = {
        id: nextEconId(game, 'shipmt'),
        kind: 'hauler',
        fromId: seller.id,
        toId: buyer.id,
        kingdom: seller.kingdom || 'lexia',
        merchantName: pickRandom(MEN_NAMES) + ' the Hauler',
        x: sx,
        y: sy,
        targetX: buyerCenter.x,
        targetY: buyerCenter.y,
        itemId: gap.itemId,
        qty: qty,
        feeLexis: feeLexis,
        value: goodsCost + feeLexis,
        hp: 70,
        maxHp: 70,
        alive: true,
        underAttack: false,
        plundered: false,
        wagonColor: pickRandom(['#d9cbb0', '#b8483c', '#3d7a58', '#3c68a0']),
        dir: buyerCenter.x >= sx ? 'right' : 'left',
      };
      econ.shipments.push(shipment);
      return shipment;
    }
  }
  return null;
}

export function completeShipment(game, shipment, success = true) {
  const econ = ensureEconomy(game);
  shipment.alive = false;
  if (success && !shipment.plundered) {
    const buyer = econVillage(game, shipment.toId);
    const seller = econVillage(game, shipment.fromId);
    if (buyer) {
      buyer.inputs[shipment.itemId] = (buyer.inputs[shipment.itemId] || 0) + shipment.qty;
      craftWorkshops(game, shipment.toId, 3);
    }
    if (seller) seller.treasury += shipment.feeLexis;
  }
  econ.shipments = econ.shipments.filter((s) => s !== shipment && s.alive);
}

function patrolNearPoint(econ, x, y, range = 75) {
  return (econ.patrols || []).some((p) => Math.hypot(p.x - x, p.y - y) < range);
}

function stepShipment(game, shipment, dt, isNearPlayer) {
  if (!shipment.alive || shipment.underAttack || shipment.plundered) return;
  if (isNearPlayer) return; // driven live along real roads by war/caravans.js

  const far = Math.hypot(shipment.targetX - shipment.x, shipment.targetY - shipment.y);
  if (far <= 14) {
    completeShipment(game, shipment, true);
    return;
  }
  const step = SHIPMENT_SPEED * dt;
  const dx = ((shipment.targetX - shipment.x) / far) * step;
  const dy = ((shipment.targetY - shipment.y) / far) * step;
  let moved = false;
  if (!isSolid(shipment.x + dx, shipment.y) && tileAt(shipment.x + dx, shipment.y) !== TILE.WATER) {
    shipment.x += dx;
    moved = true;
  }
  if (!isSolid(shipment.x, shipment.y + dy) && tileAt(shipment.x, shipment.y + dy) !== TILE.WATER) {
    shipment.y += dy;
    moved = true;
  }
  if (!moved) {
    // Slide along tangent when an off-screen shipment encounters a town fence or lake edge
    const sign = shipment.id.charCodeAt(shipment.id.length - 1) % 2 === 0 ? 1 : -1;
    const tx = -dy * sign;
    const ty = dx * sign;
    if (!isSolid(shipment.x + tx, shipment.y + ty) && tileAt(shipment.x + tx, shipment.y + ty) !== TILE.WATER) {
      shipment.x += tx;
      shipment.y += ty;
    } else if (!isSolid(shipment.x - tx, shipment.y - ty) && tileAt(shipment.x - tx, shipment.y - ty) !== TILE.WATER) {
      shipment.x -= tx;
      shipment.y -= ty;
    }
  }
  shipment.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : dy < 0 ? 'up' : 'down';
}

// ---------- 2. Merchant Contracts (Player or Guild Paid Haulage) ----------

export function refreshContracts(game) {
  const econ = ensureEconomy(game);
  econ.contracts = econ.contracts.filter((c) => c.expiresDay >= game.day);
  if (econ.contracts.length >= MAX_CONTRACTS) return econ.contracts;

  const people = VILLAGES.filter((v) => game.villages[v.id]?.owner === 'people');
  if (people.length < 2) return econ.contracts;

  for (const buyer of people) {
    if (econ.contracts.length >= MAX_CONTRACTS) break;
    if (econ.contracts.some((c) => c.buyerId === buyer.id)) continue;
    const gaps = missingInputsFor(game, buyer.id);
    if (gaps.length === 0) continue;
    const gap = gaps[0];
    const buyerCenter = centerOf(buyer);
    const seller = people
      .filter((s) => s.id !== buyer.id && !areEnemies(buyer.kingdom, s.kingdom) && (econVillage(game, s.id)?.inputs[gap.itemId] || 0) >= 4)
      .sort((a, b) => distance(centerOf(a), buyerCenter) - distance(centerOf(b), buyerCenter))[0];

    const qty = Math.min(4, Math.max(2, gap.deficit));
    const unitPay = Math.max(4, Math.round((ITEMS[gap.itemId]?.sell || 6) * 1.45));
    const travel = seller ? Math.round(distance(centerOf(seller), buyerCenter) / 14) : 25;
    const feeLexis = 18 + travel;
    econ.contracts.push({
      id: nextEconId(game, 'ctr'),
      buyerId: buyer.id,
      sellerId: seller ? seller.id : null,
      itemId: gap.itemId,
      qty: qty,
      unitPay: unitPay,
      feeLexis: feeLexis,
      rewardLexis: qty * unitPay + feeLexis,
      forProduct: gap.forProduct,
      expiresDay: game.day + 4,
    });
  }
  return econ.contracts;
}

export function acceptContract(game, contractId) {
  const econ = ensureEconomy(game);
  const found = econ.contracts.find((c) => c.id === contractId);
  if (!found) return false;
  econ.activeContract = { ...found };
  econ.contracts = econ.contracts.filter((c) => c.id !== contractId);
  const buyerName = (villageOf(found.buyerId) || {}).name || found.buyerId;
  const itemName = ITEMS[found.itemId]?.name || found.itemId;
  notify(game, `📜 Accepted contract: Deliver ${found.qty}× ${itemName} to ${buyerName} (+${found.rewardLexis} Lexis)!`, '#ffd23f');
  return true;
}

export function canDeliverContract(game, villageId) {
  const econ = ensureEconomy(game);
  const c = econ.activeContract;
  if (!c || (villageId && c.buyerId !== villageId)) return false;
  return countItem(game.player, c.itemId) >= c.qty;
}

export function deliverContract(game, villageId) {
  const econ = ensureEconomy(game);
  const c = econ.activeContract;
  if (!c || (villageId && c.buyerId !== villageId)) return false;
  if (countItem(game.player, c.itemId) < c.qty) return false;

  removeItem(game.player, c.itemId, c.qty);
  const buyer = econVillage(game, c.buyerId);
  if (buyer) {
    buyer.inputs[c.itemId] = (buyer.inputs[c.itemId] || 0) + c.qty;
    buyer.treasury = Math.max(0, buyer.treasury - Math.min(buyer.treasury, c.rewardLexis));
  }
  earnLexis(game, c.rewardLexis);
  gainXp(game, 25);
  craftWorkshops(game, c.buyerId, 4);
  cue(game, 'victory');
  floatText(game, game.player.x, game.player.y - 0.8, `+${c.rewardLexis} Lexis`, '#7cfc9a');
  const buyerName = (villageOf(c.buyerId) || {}).name || c.buyerId;
  notify(game, `📦 Contract delivered to ${buyerName}! +${c.rewardLexis} Lexis, +25 XP — workshop crafting resumed!`, '#7cfc9a');
  econ.activeContract = null;
  refreshContracts(game);
  return true;
}

// Player sells raw resources directly to a village warehouse, funding & fueling its local crafts.
export function sellResourceToTown(game, villageId, itemId, qty = 1) {
  const econ = econVillage(game, villageId);
  if (!econ || countItem(game.player, itemId) < qty) return 0;
  const scarcity = (econ.inputs[itemId] || 0) <= 2 ? 1.4 : (econ.inputs[itemId] || 0) >= 12 ? 0.8 : 1;
  const base = ITEMS[itemId]?.sell || 3;
  const unitPay = Math.max(1, Math.round(base * scarcity));
  const totalPay = unitPay * qty;
  removeItem(game.player, itemId, qty);
  econ.inputs[itemId] = (econ.inputs[itemId] || 0) + qty;
  econ.treasury = Math.max(0, econ.treasury - Math.min(econ.treasury, totalPay));
  earnLexis(game, totalPay);
  craftWorkshops(game, villageId, 2);
  return totalPay;
}

// ---------- 3. Autonomous Maritime Port Shipping (PORTS across WATER) ----------

function waterSpawnNearPort(port) {
  for (let r = 1; r <= 4; r++) {
    for (const [dx, dy] of [[0, r], [0, -r], [r, 0], [-r, 0], [r, r], [-r, r], [r, -r], [-r, -r]]) {
      const tx = port.x + 0.5 + dx;
      const ty = port.y + 0.5 + dy;
      if (tileAt(tx, ty) === TILE.WATER) return { x: tx, y: ty };
    }
  }
  return { x: port.x + 0.5, y: port.y + 0.5 };
}

function spawnShip(game) {
  const econ = ensureEconomy(game);
  if (PORTS.length < 2 || econ.ships.length >= MAX_SHIPS) return null;
  const fromIdx = Math.floor(Math.random() * PORTS.length);
  const fromPort = PORTS[fromIdx];
  const others = PORTS.filter((p) => p !== fromPort);
  const toPort = pickRandom(others);
  const origin = waterSpawnNearPort(fromPort);
  const destWater = waterSpawnNearPort(toPort);
  const homeVillage = nearestVillageTo(fromPort.x, fromPort.y);
  const cargoPool = ['rawFish', 'coconut', 'ore', 'crystal', 'herb', 'wool'];
  const itemId = pickRandom(cargoPool);

  const ship = {
    id: nextEconId(game, 'vessel'),
    name: pickRandom(['Sea Swallow', 'Golden Hull', 'Tradewind', 'Aurelian Cog', 'Wavecrest', 'Harbor Star']),
    fromName: fromPort.name,
    toName: toPort.name,
    fromX: origin.x,
    fromY: origin.y,
    targetX: destWater.x,
    targetY: destWater.y,
    x: origin.x,
    y: origin.y,
    dir: destWater.x >= origin.x ? 'right' : 'left',
    kingdom: homeVillage?.kingdom || 'aurelia',
    itemId: itemId,
    qty: 3 + Math.floor(Math.random() * 4),
    feeLexis: 28,
    dockUntil: 0,
    stuckTicks: 0,
  };
  econ.ships.push(ship);
  return ship;
}

function updateShip(game, ship, dt) {
  const now = Date.now();
  if (ship.dockUntil && now < ship.dockUntil) return;
  if (ship.dockUntil && now >= ship.dockUntil) {
    // Off to another port
    ship.dockUntil = 0;
    const nextPort = pickRandom(PORTS.filter((p) => p.name !== ship.toName));
    if (nextPort) {
      const destWater = waterSpawnNearPort(nextPort);
      ship.fromName = ship.toName;
      ship.toName = nextPort.name;
      ship.targetX = destWater.x;
      ship.targetY = destWater.y;
      ship.itemId = pickRandom(['rawFish', 'coconut', 'ore', 'crystal', 'herb', 'wool']);
      ship.qty = 3 + Math.floor(Math.random() * 4);
    }
    return;
  }

  const far = Math.hypot(ship.targetX - ship.x, ship.targetY - ship.y);
  if (far <= 3.5) {
    ship.dockUntil = now + 4500;
    const harborVillage = nearestVillageTo(ship.targetX, ship.targetY);
    if (harborVillage) {
      const vEcon = econVillage(game, harborVillage.id);
      if (vEcon) {
        vEcon.inputs[ship.itemId] = (vEcon.inputs[ship.itemId] || 0) + ship.qty;
        vEcon.treasury += ship.feeLexis;
        craftWorkshops(game, harborVillage.id, 2);
      }
    }
    return;
  }

  const baseAngle = Math.atan2(ship.targetY - ship.y, ship.targetX - ship.x);
  let moved = false;
  for (const offset of [0, 0.55, -0.55, 1.1, -1.1, 1.7, -1.7]) {
    const a = baseAngle + offset;
    const nx = ship.x + Math.cos(a) * SHIP_SPEED * dt;
    const ny = ship.y + Math.sin(a) * SHIP_SPEED * dt;
    if (tileAt(nx, ny) === TILE.WATER) {
      ship.x = nx;
      ship.y = ny;
      ship.dir = Math.cos(a) < 0 ? 'left' : 'right';
      ship.stuckTicks = 0;
      moved = true;
      break;
    }
  }
  if (!moved) {
    ship.stuckTicks = (ship.stuckTicks || 0) + 1;
    // Open-water interpolation fallback if a narrow peninsula blocks straight angle off-screen
    ship.x += ((ship.targetX - ship.x) / far) * SHIP_SPEED * dt;
    ship.y += ((ship.targetY - ship.y) / far) * SHIP_SPEED * dt;
    ship.dir = ship.targetX < ship.x ? 'left' : 'right';
  }
}

// ---------- 4. Kingdom Road Patrols ----------

function syncPatrols(game) {
  const econ = ensureEconomy(game);
  if (econ.patrols.length >= KINGDOMS.length) return;
  for (const k of KINGDOMS) {
    if (econ.patrols.some((p) => p.kingdom === k.id)) continue;
    const towns = VILLAGES.filter((v) => v.kingdom === k.id && game.villages[v.id]?.owner === 'people');
    if (towns.length < 2) continue;
    const a = towns[0];
    const b = towns[1];
    const ca = centerOf(a);
    const cb = centerOf(b);
    const startGate = bestGateOf(a, cb)?.outside || ca;
    const endGate = bestGateOf(b, startGate)?.outside || cb;
    econ.patrols.push({
      id: nextEconId(game, 'patrol'),
      kingdom: k.id,
      color: k.color,
      fromId: a.id,
      toId: b.id,
      x: startGate.x,
      y: startGate.y,
      targetX: endGate.x,
      targetY: endGate.y,
      dir: cb.x >= ca.x ? 'right' : 'left',
      step: 0,
    });
  }
}

function updatePatrols(game, dt) {
  const econ = ensureEconomy(game);
  for (const p of econ.patrols) {
    const far = Math.hypot(p.targetX - p.x, p.targetY - p.y);
    if (far <= 6) {
      p.walking = false; // at the gate: it stands (a kingdom of islands may have no road to another town)
      const towns = patrolTowns(game, p).filter((v) => v.id !== p.toId);
      const nextTown = towns.length > 0 ? pickRandom(towns) : villageOf(p.fromId);
      if (nextTown) {
        const destGate = bestGateOf(nextTown, p)?.outside || centerOf(nextTown);
        p.fromId = p.toId;
        p.toId = nextTown.id;
        p.targetX = destGate.x;
        p.targetY = destGate.y;
        p._navPath = null;
      }
      continue;
    }
    if (Math.hypot(p.x - game.player.x, p.y - game.player.y) > SEEN_RANGE) {
      moveUnseenPatrol(p, dt);
      continue;
    }
    if (!patrolCanWalk(p.x, p.y)) Object.assign(p, landNear(p.x, p.y, patrolCanWalk) || {}); // back on the road
    const moved = stepSmart(p, p.targetX, p.targetY, PATROL_SPEED, dt, { stopAtGate: true, canWalk: patrolCanWalk });
    if (moved) {
      p._stuck = 0;
    } else {
      p._stuck = (p._stuck || 0) + dt;
      if (p._stuck > 6) {
        p._stuck = 0;
        changePatrolRoute(game, p);
      }
    }
  }
}

const SEEN_RANGE = 140; // tiles: a patrol farther than this from the hero lives "in numbers" (nobody sees it)

function patrolCanWalk(x, y) {
  return !isSolid(x, y) && tileAt(x, y) !== TILE.WATER;
}

// Far from the hero: the patrol goes straight on toward its town, without looking for a way (it costs nothing).
// When the hero comes close, it is put back on the land and walks for real.
function moveUnseenPatrol(p, dt) {
  const far = Math.hypot(p.targetX - p.x, p.targetY - p.y);
  const step = Math.min(far, PATROL_SPEED * dt);
  p.x += ((p.targetX - p.x) / far) * step;
  p.y += ((p.targetY - p.y) / far) * step;
  p.walking = false;
  p._navPath = null;
}

// The towns a patrol of the kingdom can go to (not the ones it found no road to).
function patrolTowns(game, p) {
  return VILLAGES.filter((v) => v.kingdom === p.kingdom && game.villages[v.id]?.owner === 'people' && !(p.noRoad || []).includes(v.id));
}

// No road to its town (across the sea...): the patrol remembers it and goes to another town of the kingdom.
// (Before, it turned back and forth forever between two towns.)
function changePatrolRoute(game, p) {
  p.noRoad = [...(p.noRoad || []), p.toId];
  const towns = patrolTowns(game, p).filter((v) => v.id !== p.fromId);
  const next = towns.length > 0 ? pickRandom(towns) : villageOf(p.fromId);
  if (!next) return;
  const destGate = bestGateOf(next, p)?.outside || centerOf(next);
  p.toId = next.id;
  p.targetX = destGate.x;
  p.targetY = destGate.y;
  p._navPath = null;
  p._planAgainAt = 0;
}

// ---------- 5. Visible Paid Local Gatherers near Hero ----------

const GATHERER_ROLES = [
  { job: 'miner', itemId: 'ore', wage: 2, dx: 7, dy: -4, outfit: '#5a6270' },
  { job: 'woodcutter', itemId: 'firewood', wage: 1, dx: -7, dy: 5, outfit: '#7a4a24' },
  { job: 'forager', itemId: 'herb', wage: 1, dx: 6, dy: 6, outfit: '#3d7048' },
];

function findWalkableOutsideGate(village, spec) {
  const gate = bestGateOf(village, { x: village.x + village.w / 2 + spec.dx * 15, y: village.y + village.h / 2 + spec.dy * 15 });
  if (!gate) return { home: centerOf(village), node: centerOf(village) };
  const baseX = gate.outside.x;
  const baseY = gate.outside.y;
  for (let r = 4; r <= 12; r += 2) {
    for (const [ox, oy] of [[spec.dx, spec.dy], [r, 0], [-r, 0], [0, r], [0, -r], [r, r], [-r, r]]) {
      const cx = baseX + Math.sign(ox || gate.gate.dx) * r;
      const cy = baseY + Math.sign(oy || gate.gate.dy) * r;
      if (!isSolid(cx, cy) && zoneAt(cx, cy).kind === 'land') {
        return { home: gate.inside, node: { x: cx, y: cy } };
      }
    }
  }
  return { home: gate.inside, node: gate.outside };
}

export function syncGatherers(game) {
  if (!Array.isArray(game.run.gatherers)) game.run.gatherers = [];
  if (zoneAt(game.player.x, game.player.y).kind === 'inside') return;
  game.run.gatherers = game.run.gatherers.filter((g) => Math.hypot(g.x - game.player.x, g.y - game.player.y) < 110);

  for (const id of game.run.awake || []) {
    const v = villageOf(id);
    if (!v || game.villages[id]?.owner !== 'people') continue;
    if (distance(centerOf(v), game.player) > 85) continue;
    const existing = game.run.gatherers.filter((g) => g.villageId === id);
    if (existing.length >= 2) continue;
    const spec = GATHERER_ROLES[(existing.length + v.w) % GATHERER_ROLES.length];
    const spots = findWalkableOutsideGate(v, spec);
    game.run.gatherers.push({
      id: 'gth-' + id + '-' + existing.length,
      villageId: id,
      job: spec.job,
      itemId: spec.itemId,
      wage: spec.wage,
      homeX: spots.home.x,
      homeY: spots.home.y,
      nodeX: spots.node.x,
      nodeY: spots.node.y,
      x: spots.home.x,
      y: spots.home.y,
      state: 'toNode',
      wait: 0.6,
      carrying: false,
      dir: 'right',
      step: 0,
      look: {
        skin: pickRandom(SKINS),
        hair: pickRandom(HAIRS),
        style: 'short',
        eyes: '#3b3b3b',
        outfit: spec.outfit,
        trim: '#e9d8a6',
        pants: '#3a3448',
        boots: '#4a2e1b',
      },
    });
  }
}

function updateGatherers(game, dt) {
  for (const g of game.run.gatherers || []) {
    if (g.wait > 0) {
      g.wait -= dt;
      continue;
    }
    const tx = g.state === 'toNode' ? g.nodeX : g.homeX;
    const ty = g.state === 'toNode' ? g.nodeY : g.homeY;
    const far = Math.hypot(tx - g.x, ty - g.y);
    if (far <= 1.2) {
      if (g.state === 'toNode') {
        g.carrying = true;
        g.state = 'returning';
        g.wait = 1.4;
      } else {
        g.carrying = false;
        g.state = 'toNode';
        g.wait = 1.6;
        const econ = econVillage(game, g.villageId);
        if (econ && econ.treasury >= g.wage && (econ.inputs[g.itemId] || 0) < 24) {
          econ.treasury -= g.wage;
          econ.wagesPaid += g.wage;
          econ.inputs[g.itemId] = (econ.inputs[g.itemId] || 0) + 1;
          craftWorkshops(game, g.villageId, 1);
        }
      }
      g._navPath = null;
      continue;
    }
    stepSmart(g, tx, ty, GATHERER_SPEED, dt);
  }
}

// ---------- Main Update Loops ----------

export function updateTraffic(game, dt) {
  const econ = ensureEconomy(game);
  for (const s of [...econ.shipments]) {
    const near = distance(s, game.player) < 180;
    stepShipment(game, s, dt, near);
  }
  for (const ship of econ.ships) updateShip(game, ship, dt);
  updatePatrols(game, dt);
  updateGatherers(game, dt);
}

export function slowTraffic(game) {
  const econ = ensureEconomy(game);
  syncPatrols(game);
  while (econ.ships.length < MAX_SHIPS && PORTS.length >= 2) {
    if (!spawnShip(game)) break;
  }
  if (econ.shipments.length < MAX_SHIPMENTS) dispatchShipment(game);
  if (econ.contracts.length < 4) refreshContracts(game);
  syncGatherers(game);

  // Off-screen bandit/war risk for unpatrolled shipments
  for (const s of [...econ.shipments]) {
    if (distance(s, game.player) < 160 || !s.alive || s.plundered) continue;
    const guarded = patrolNearPoint(econ, s.x, s.y, 75);
    if (!guarded && Math.random() < 0.008) {
      s.hp = Math.max(0, s.hp - 18);
      if (s.hp <= 0) completeShipment(game, s, false); // convoy lost en route: goods never delivered
    }
  }
}
