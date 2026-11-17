import { TILE_PX } from './tiles';
import { OUTLINE, WOOD, WOOD_RAMP, STONE_RAMP, GRASS_RAMP, LEAF_RAMP, ROOF_RAMPS } from './palette';
import { makeGrid, dot, fillRect, fillEllipse, fillBall, drawLine, fillTriangle, toneOf, addOutline, toCanvas, once } from './pixels';
import { WILD_STRUCTURES, STRUCTURE_BY_ID } from '../data/zones';

// Handcrafted cached pixel art sprites and ambient visual effects for the 50 world structures.
// Every sprite is built once via once() for silky 60fps performance.

const T = TILE_PX;

function sprite(grid, ax, ay, outline = OUTLINE) {
  return { canvas: toCanvas(addOutline(grid, outline)), ax: ax, ay: ay };
}

function isNear(view, x, y, pad = 6) {
  return x * T < view.x + view.width + pad * T && x * T > view.x - pad * T && y * T < view.y + view.height + (pad + 4) * T && y * T > view.y - pad * T;
}

const PINK_RAMP = ['#8c2448', '#c84b76', '#f280a8', '#ffadd0', '#ffd9eb'];
const GOLD_LEAF_RAMP = ['#7a4c14', '#b57b1c', '#e6ad2a', '#ffd95e', '#fff4a8'];
const ICE_RAMP = ['#2a6da8', '#4fa3d8', '#8ad6f5', '#cff2ff', '#ffffff'];
const SANDSTONE_RAMP = ['#8a5f32', '#ad7942', '#cfa05e', '#ebc582', '#fae0ab'];
const RUBY_ROOF = ROOF_RAMPS.red;
const BLUE_ROOF = ROOF_RAMPS.blue;
const GREEN_ROOF = ROOF_RAMPS.green;
const PURPLE_ROOF = ROOF_RAMPS.purple;

// ---------- Reusable architectural helpers ----------

function paintStonePedestal(grid, cx, y, halfW, h) {
  fillRect(grid, cx - halfW - 1, y + h - 3, halfW * 2 + 2, 3, STONE_RAMP[1]);
  fillRect(grid, cx - halfW, y, halfW * 2, h - 2, STONE_RAMP[2]);
  fillRect(grid, cx - halfW - 1, y, halfW * 2 + 2, 2, STONE_RAMP[4]);
}

function paintHangingLantern(grid, x, y, glowing = true) {
  dot(grid, x, y - 1, OUTLINE);
  fillRect(grid, x - 1, y, 3, 4, glowing ? '#ff9a2b' : '#b85020');
  dot(grid, x, y + 1, glowing ? '#fff6c8' : '#ffd23f');
  fillRect(grid, x - 1, y - 1, 3, 1, OUTLINE);
}

// ---------- 1..10: Sacred, Magical & Isekai Wonders ----------

function manaObeliskSprite(frame = 0) {
  return once('s50|manaObelisk|' + (frame % 2), () => {
    const grid = makeGrid(24, 40);
    paintStonePedestal(grid, 12, 27, 7, 11);
    fillRect(grid, 7, 30, 10, 4, '#2f5fa0'); // glowing rune tablet
    fillRect(grid, 9, 31, 6, 2, frame ? '#9ef6ff' : '#5fd3e8');
    const floatY = frame ? 0 : 1;
    fillTriangle(grid, [12, 3 + floatY], [7, 15 + floatY], [17, 15 + floatY], (x) => toneOf(ICE_RAMP, 0.85 - (x - 7) * 0.06, x, 0));
    fillTriangle(grid, [12, 25 + floatY], [7, 15 + floatY], [17, 15 + floatY], (x) => toneOf(ICE_RAMP, 0.65 - (x - 7) * 0.05, x, 0));
    dot(grid, 11, 12 + floatY, '#ffffff');
    return sprite(grid, 12, 38);
  });
}

function starWellSprite(frame = 0) {
  return once('s50|starWell|' + (frame % 2), () => {
    const grid = makeGrid(34, 30);
    fillEllipse(grid, 17, 21, 15, 7, STONE_RAMP[1]);
    fillEllipse(grid, 17, 20, 14, 6, STONE_RAMP[3]);
    fillEllipse(grid, 17, 20, 11, 4, '#1b4a94');
    fillEllipse(grid, 17, 20, 9, 3, '#3b8fe0');
    dot(grid, 13 + frame * 2, 19, '#fff6c8'); // floating star reflections
    dot(grid, 20 - frame * 2, 21, '#9ef6ff');
    dot(grid, 17, 20, '#ffffff');
    fillRect(grid, 6, 7, 2, 12, STONE_RAMP[2]); // marble pillars & lintel
    fillRect(grid, 26, 7, 2, 12, STONE_RAMP[2]);
    fillRect(grid, 5, 5, 24, 3, STONE_RAMP[4]);
    dot(grid, 17, 3, frame ? '#ffffff' : '#ffd23f');
    return sprite(grid, 17, 28);
  });
}

function worldTreeSaplingSprite(frame = 0) {
  return once('s50|worldTree|' + (frame % 2), () => {
    const grid = makeGrid(48, 52);
    fillEllipse(grid, 24, 46, 18, 4.5, GRASS_RAMP[2]);
    for (const [fx, fy, c] of [[10, 46, '#ff9ec4'], [14, 48, '#ffd23f'], [34, 47, '#5fd3e8'], [38, 45, '#ff9ec4']]) {
      dot(grid, fx, fy, c);
      dot(grid, fx + 1, fy, '#ffffff');
    }
    fillRect(grid, 21, 24, 6, 22, '#cfc8dc'); // silver trunk
    fillRect(grid, 22, 25, 2, 20, '#eef0fa');
    fillBall(grid, 24, 17, 17, 12, GOLD_LEAF_RAMP, { ambient: 0.25 });
    fillBall(grid, 14, 21, 9, 7, GOLD_LEAF_RAMP, { ambient: 0.2 });
    fillBall(grid, 34, 21, 9, 7, GOLD_LEAF_RAMP, { ambient: 0.2 });
    dot(grid, 17 + frame * 3, 14, '#5fd3e8');
    dot(grid, 29 - frame * 2, 11, '#ffffff');
    return sprite(grid, 24, 48);
  });
}

function celestialSundialSprite(frame = 0) {
  return once('s50|sundial|' + (frame % 2), () => {
    const grid = makeGrid(28, 32);
    fillEllipse(grid, 14, 26, 12, 4.5, STONE_RAMP[2]);
    paintStonePedestal(grid, 14, 16, 4, 10);
    fillEllipse(grid, 14, 13, 8, 3, '#c9961e');
    fillEllipse(grid, 14, 12, 7, 2.5, '#ffd23f');
    drawLine(grid, 14, 12, 19, 4, '#fff2a8');
    dot(grid, 19, 4, frame ? '#ffffff' : '#5fd3e8');
    return sprite(grid, 14, 30);
  });
}

function fairyRingSprite(frame = 0) {
  return once('s50|fairyRing|' + (frame % 2), () => {
    const grid = makeGrid(38, 26);
    fillEllipse(grid, 19, 15, 16, 8, '#286426');
    fillEllipse(grid, 19, 15, 12, 5.5, '#3b8835');
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const mx = Math.round(19 + Math.cos(a) * 14);
      const my = Math.round(15 + Math.sin(a) * 6.5);
      fillRect(grid, mx, my, 2, 2, '#f6efe0');
      const cap = i % 2 === 0 ? '#e8425f' : frame ? '#5fd3e8' : '#b48cff';
      fillRect(grid, mx - 1, my - 2, 4, 2, cap);
      dot(grid, mx, my - 2, '#ffffff');
    }
    return sprite(grid, 19, 22);
  });
}

function crystalGeodeSprite(frame = 0) {
  return once('s50|crystalGeode|' + (frame % 2), () => {
    const grid = makeGrid(32, 30);
    fillBall(grid, 16, 21, 13, 7.5, STONE_RAMP.slice(0, 4));
    fillTriangle(grid, [11, 20], [16, 4], [21, 20], (x) => toneOf(ICE_RAMP, 0.85 - (x - 11) * 0.06, x, 0));
    fillTriangle(grid, [6, 22], [9, 10], [13, 21], () => '#8a4fff');
    fillTriangle(grid, [19, 22], [24, 9], [27, 21], () => '#5fd3e8');
    dot(grid, 16, 6 + frame, '#ffffff');
    dot(grid, 9, 12, '#e8d0ff');
    return sprite(grid, 16, 27);
  });
}

function moonMirrorSprite(frame = 0) {
  return once('s50|moonMirror|' + (frame % 2), () => {
    const grid = makeGrid(36, 30);
    fillEllipse(grid, 18, 22, 16, 6.5, STONE_RAMP[2]);
    fillEllipse(grid, 18, 21, 13, 4.5, '#193578');
    fillEllipse(grid, 18, 21, 10, 3, frame ? '#5fd3e8' : '#7fa2e6');
    fillRect(grid, 15, 20, 4, 2, '#fff6c8'); // crescent reflection
    fillRect(grid, 5, 8, 3, 13, STONE_RAMP[3]);
    fillRect(grid, 28, 8, 3, 13, STONE_RAMP[3]);
    fillRect(grid, 4, 6, 7, 2, STONE_RAMP[4]);
    fillRect(grid, 25, 6, 7, 2, STONE_RAMP[4]);
    return sprite(grid, 18, 28);
  });
}

function dragonShrineSprite(frame = 0) {
  return once('s50|dragonShrine|' + (frame % 2), () => {
    const grid = makeGrid(42, 38);
    fillRect(grid, 8, 12, 4, 24, '#c8242a'); // crimson torii pillars
    fillRect(grid, 30, 12, 4, 24, '#c8242a');
    fillRect(grid, 2, 7, 38, 4, '#241e2e'); // curved dark cap beam
    fillRect(grid, 4, 5, 34, 2, '#3d354e');
    fillRect(grid, 6, 11, 30, 3, '#c8242a'); // lower crossbeam
    fillRect(grid, 19, 8, 4, 5, '#ffd23f'); // gilded plaque
    fillRect(grid, 2, 26, 4, 9, STONE_RAMP[2]); // twin stone lanterns
    fillRect(grid, 36, 26, 4, 9, STONE_RAMP[2]);
    paintHangingLantern(grid, 4, 25, true);
    paintHangingLantern(grid, 38, 25, !frame || true);
    return sprite(grid, 21, 36);
  });
}

// ---------- 11..20: Travel, Trade & Rural Landmarks ----------

function roadsidePavilionSprite(frame = 0) {
  return once('s50|pavilion|' + (frame % 2), () => {
    const grid = makeGrid(44, 38);
    fillTriangle(grid, [2, 16], [22, 3], [42, 16], (x) => toneOf(BLUE_ROOF, 0.78 - (x - 2) * 0.014, x, 0));
    fillRect(grid, 3, 15, 38, 2, '#ffd23f');
    fillRect(grid, 7, 17, 2, 18, WOOD_RAMP[2]);
    fillRect(grid, 35, 17, 2, 18, WOOD_RAMP[2]);
    fillRect(grid, 13, 27, 18, 4, WOOD_RAMP[3]); // resting bench inside
    fillRect(grid, 19, 25, 4, 3, '#e8eef7'); // tea pot
    paintHangingLantern(grid, 11, 18, frame === 0 || true);
    paintHangingLantern(grid, 33, 18, true);
    return sprite(grid, 22, 35);
  });
}

function stoneBridgeShrineSprite(frame = 0) {
  return once('s50|bridgeShrine|' + (frame % 2), () => {
    const grid = makeGrid(24, 30);
    paintStonePedestal(grid, 12, 14, 5, 14);
    fillRect(grid, 9, 6, 6, 8, '#3a3442');
    fillRect(grid, 10, 7, 4, 6, frame ? '#ffe066' : '#ff9a2b');
    fillTriangle(grid, [7, 6], [12, 1], [17, 6], () => STONE_RAMP[3]);
    fillRect(grid, 3, 24, 4, 4, '#4caf50');
    dot(grid, 4, 23, '#ff6fa8');
    dot(grid, 19, 24, '#ffd23f');
    return sprite(grid, 12, 28);
  });
}

function merchantOutpostSprite(frame = 0) {
  return once('s50|outpost|' + (frame % 2), () => {
    const grid = makeGrid(46, 36);
    for (let x = 3; x < 43; x += 5) fillRect(grid, x, 6, 5, 9, ((x - 3) / 5) % 2 === 0 ? '#c8242a' : '#fff2d8');
    fillRect(grid, 4, 15, 2, 18, WOOD.dark);
    fillRect(grid, 40, 15, 2, 18, WOOD.dark);
    fillRect(grid, 3, 23, 40, 10, WOOD_RAMP[2]);
    fillRect(grid, 3, 23, 40, 2, WOOD_RAMP[4]);
    for (const [gx, col] of [[9, '#ff9a2b'], [15, '#5fd3e8'], [22, '#ffd23f'], [29, '#62c44c'], [35, '#e8423f']]) {
      fillEllipse(grid, gx, 21, 3, 2.5, col);
    }
    paintHangingLantern(grid, 23, 16, frame || true);
    return sprite(grid, 23, 33);
  });
}

function beekeeperGroveSprite() {
  return once('s50|apiary', () => {
    const grid = makeGrid(34, 28);
    fillRect(grid, 3, 18, 28, 3, WOOD_RAMP[2]);
    fillRect(grid, 5, 21, 2, 5, WOOD.dark);
    fillRect(grid, 27, 21, 2, 5, WOOD.dark);
    for (const hx of [8, 17, 25]) {
      fillEllipse(grid, hx, 14, 4.5, 5, '#e8b83a');
      fillRect(grid, hx - 3, 13, 6, 1, '#c9961e');
      fillRect(grid, hx - 1, 16, 2, 2, OUTLINE);
    }
    for (const [fx, fy, c] of [[4, 24, '#ffd23f'], [12, 25, '#ff6fa8'], [21, 25, '#5fd3e8'], [30, 24, '#ffd23f']]) {
      dot(grid, fx, fy, '#4caf50');
      dot(grid, fx, fy - 1, c);
    }
    return sprite(grid, 17, 26);
  });
}

function lumberCampSprite() {
  return once('s50|lumberCamp', () => {
    const grid = makeGrid(42, 34);
    fillTriangle(grid, [4, 15], [16, 6], [28, 15], (x) => toneOf(WOOD_RAMP, 0.7 - (x - 4) * 0.015, x, 0));
    fillRect(grid, 6, 15, 20, 16, WOOD_RAMP[2]);
    fillRect(grid, 13, 21, 6, 10, '#4a2e1a');
    for (let i = 0; i < 3; i++) {
      fillEllipse(grid, 32 + i * 3, 27, 3, 2.5, WOOD_RAMP[3]);
      fillEllipse(grid, 33 + i * 2, 23, 3, 2.5, WOOD_RAMP[4]);
    }
    fillRect(grid, 10, 26, 2, 5, STONE_RAMP[3]); // chopping stump & axe
    fillRect(grid, 11, 22, 3, 2, '#c9d1e0');
    return sprite(grid, 21, 32);
  });
}

function windTurbineTowerSprite(frame = 0) {
  return once('s50|windMill|' + (frame % 4), () => {
    const grid = makeGrid(48, 54);
    fillTriangle(grid, [16, 20], [24, 8], [32, 20], (x) => toneOf(RUBY_ROOF, 0.8 - (x - 16) * 0.025, x, 0));
    fillRect(grid, 16, 20, 16, 28, STONE_RAMP[2]);
    fillRect(grid, 17, 20, 5, 28, STONE_RAMP[3]);
    fillRect(grid, 21, 38, 6, 10, WOOD.dark);
    fillRect(grid, 22, 25, 4, 4, '#ffd23f');
    // Rotating 4-blade canvas sails centered at (24, 22)
    const angleOffset = (frame * Math.PI) / 8;
    for (let b = 0; b < 4; b++) {
      const ang = angleOffset + (b * Math.PI) / 2;
      const ex = Math.round(24 + Math.cos(ang) * 18);
      const ey = Math.round(22 + Math.sin(ang) * 18);
      drawLine(grid, 24, 22, ex, ey, WOOD_RAMP[3]);
      const px = Math.round(-Math.sin(ang) * 3);
      const py = Math.round(Math.cos(ang) * 3);
      const mx = Math.round(24 + Math.cos(ang) * 12);
      const my = Math.round(22 + Math.sin(ang) * 12);
      drawLine(grid, mx, my, mx + px, my + py, '#f6efe0');
      drawLine(grid, ex, ey, ex + px, ey + py, '#f6efe0');
    }
    dot(grid, 24, 22, '#ffd23f');
    return sprite(grid, 24, 49);
  });
}

function shepherdShelterSprite() {
  return once('s50|shepherd', () => {
    const grid = makeGrid(38, 32);
    fillTriangle(grid, [3, 16], [16, 4], [29, 16], () => '#cfa760');
    fillRect(grid, 6, 16, 20, 13, '#e6dcc4');
    fillRect(grid, 13, 21, 5, 8, WOOD.dark);
    fillRect(grid, 28, 22, 8, 6, '#e2c27c'); // hay bale
    fillRect(grid, 28, 24, 8, 1, '#b08b47');
    return sprite(grid, 19, 29);
  });
}

function alchemyGardenSprite(frame = 0) {
  return once('s50|alchemy|' + (frame % 2), () => {
    const grid = makeGrid(42, 34);
    fillEllipse(grid, 21, 18, 16, 12, '#7fd6ff66');
    fillRect(grid, 6, 18, 30, 2, STONE_RAMP[3]);
    fillRect(grid, 6, 20, 30, 10, STONE_RAMP[2]);
    for (let x = 9; x <= 33; x += 6) drawLine(grid, x, 8, x, 19, '#a9c8d8');
    fillRect(grid, 11, 21, 4, 4, '#5fd3e8');
    fillRect(grid, 18, 20, 5, 5, frame ? '#7cfc9a' : '#ffd23f');
    fillRect(grid, 26, 21, 4, 4, '#ff6fa8');
    dot(grid, 20, 20, '#ffffff');
    return sprite(grid, 21, 31);
  });
}

// ---------- 21..30: Knightly, Ruin & Heritage Monuments ----------

function watchBeaconSprite(frame = 0) {
  return once('s50|beacon|' + (frame % 3), () => {
    const grid = makeGrid(30, 48);
    fillRect(grid, 8, 14, 14, 31, STONE_RAMP[2]);
    fillRect(grid, 6, 11, 18, 5, STONE_RAMP[3]);
    for (let x = 6; x <= 21; x += 4) fillRect(grid, x, 9, 3, 2, STONE_RAMP[4]);
    fillRect(grid, 11, 36, 6, 9, WOOD.dark);
    fillRect(grid, 13, 20, 4, 5, '#1c1726');
    fillEllipse(grid, 15, 7, 5, 4, '#ff6a2b'); // roaring top brazier fire
    fillEllipse(grid, 15, 6 - (frame % 2), 3, 3, '#ffe066');
    dot(grid, 15 + (frame % 2), 3, '#fff6c8');
    return sprite(grid, 15, 46);
  });
}

function ruinedAqueductSprite() {
  return once('s50|aqueduct', () => {
    const grid = makeGrid(52, 34);
    fillRect(grid, 3, 4, 46, 5, SANDSTONE_RAMP[3]);
    for (const px of [5, 22, 41]) fillRect(grid, px, 9, 6, 22, SANDSTONE_RAMP[2]);
    fillEllipse(grid, 16, 13, 5, 4, SANDSTONE_RAMP[1]);
    fillEllipse(grid, 34, 13, 5, 4, SANDSTONE_RAMP[1]);
    fillRect(grid, 12, 13, 8, 18, null); // cut transparent open arches
    fillRect(grid, 30, 13, 8, 18, null);
    for (const [vx, vy] of [[7, 10], [8, 14], [25, 9], [43, 16], [42, 11]]) {
      fillRect(grid, vx, vy, 3, 4, '#4caf50');
    }
    return sprite(grid, 26, 31);
  });
}

function knightCenotaphSprite(frame = 0) {
  return once('s50|cenotaph|' + (frame % 2), () => {
    const grid = makeGrid(34, 38);
    paintStonePedestal(grid, 17, 25, 10, 11);
    fillRect(grid, 13, 12, 8, 13, STONE_RAMP[4]);
    fillBall(grid, 17, 9, 3.5, 3.5, STONE_RAMP.slice(2));
    drawLine(grid, 17, 4, 17, 24, '#e8eef7'); // vertical broadsword
    fillRect(grid, 3, 16, 3, 19, WOOD.dark);
    fillRect(grid, 4, 16, 5, 8, '#2f5fa0');
    fillRect(grid, 28, 16, 3, 19, WOOD.dark);
    fillRect(grid, 25, 16, 5, 8, '#2f5fa0');
    dot(grid, 17, 5, frame ? '#ffffff' : '#ffd23f');
    return sprite(grid, 17, 36);
  });
}

function ancientAmphitheaterSprite() {
  return once('s50|forum', () => {
    const grid = makeGrid(48, 32);
    fillEllipse(grid, 24, 24, 21, 6.5, SANDSTONE_RAMP[2]);
    fillEllipse(grid, 24, 24, 15, 4, '#d9cbb0');
    for (const px of [6, 13, 33, 40]) fillRect(grid, px, 6, 4, 16, SANDSTONE_RAMP[3]);
    fillRect(grid, 5, 5, 13, 3, SANDSTONE_RAMP[4]);
    fillRect(grid, 32, 5, 13, 3, SANDSTONE_RAMP[4]);
    fillRect(grid, 21, 18, 6, 5, '#4caf50');
    dot(grid, 22, 18, '#ff6fa8');
    return sprite(grid, 24, 29);
  });
}

function duelistRingSprite() {
  return once('s50|duelRing', () => {
    const grid = makeGrid(48, 32);
    fillEllipse(grid, 24, 21, 21, 8, '#d9b47a');
    fillEllipse(grid, 24, 21, 17, 6, '#e6cca0');
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const px = Math.round(24 + Math.cos(a) * 20);
      const py = Math.round(21 + Math.sin(a) * 8);
      fillRect(grid, px - 1, py - 7, 2, 8, WOOD_RAMP[2]);
    }
    fillRect(grid, 14, 15, 2, 7, WOOD_RAMP[3]); // dummy post
    fillRect(grid, 12, 14, 6, 3, '#cfa760');
    fillRect(grid, 33, 15, 2, 7, WOOD_RAMP[3]);
    fillRect(grid, 31, 14, 6, 3, '#cfa760');
    return sprite(grid, 24, 28);
  });
}

function bellSanctuarySprite(frame = 0) {
  return once('s50|belfry|' + (frame % 2), () => {
    const grid = makeGrid(32, 36);
    fillRect(grid, 5, 8, 5, 26, STONE_RAMP[2]);
    fillRect(grid, 22, 8, 5, 26, STONE_RAMP[2]);
    fillTriangle(grid, [3, 9], [16, 2], [29, 9], (x) => toneOf(GREEN_ROOF, 0.7 - (x - 3) * 0.02, x, 0));
    const bx = frame ? 17 : 15;
    fillTriangle(grid, [bx - 4, 20], [bx, 11], [bx + 4, 20], () => '#ffd23f');
    fillRect(grid, bx - 4, 19, 8, 2, '#c9961e');
    return sprite(grid, 16, 34);
  });
}

function dwarvenForgeRuinsSprite(frame = 0) {
  return once('s50|dwarfForge|' + (frame % 2), () => {
    const grid = makeGrid(36, 32);
    fillRect(grid, 4, 10, 14, 19, STONE_RAMP[1]);
    fillRect(grid, 7, 19, 8, 8, '#1c1726');
    fillRect(grid, 8, 22, 6, 4, frame ? '#ff9a2b' : '#ff5a1c'); // glowing coals
    fillRect(grid, 21, 21, 9, 3, '#4a5568'); // iron rune anvil
    fillRect(grid, 23, 24, 5, 4, '#2c3442');
    dot(grid, 24, 22, '#5fd3e8');
    return sprite(grid, 18, 29);
  });
}

function kingPillarSprite() {
  return once('s50|kingPillar', () => {
    const grid = makeGrid(26, 38);
    paintStonePedestal(grid, 13, 26, 8, 10);
    fillRect(grid, 10, 9, 6, 17, STONE_RAMP[3]);
    fillRect(grid, 9, 5, 8, 5, '#ffd23f'); // golden crown
    dot(grid, 10, 4, '#ffffff');
    dot(grid, 13, 3, '#5fd3e8');
    dot(grid, 16, 4, '#ffffff');
    fillRect(grid, 11, 14, 4, 8, '#2f5fa0');
    return sprite(grid, 13, 36);
  });
}

function libraryRotundaSprite(frame = 0) {
  return once('s50|athenaeum|' + (frame % 2), () => {
    const grid = makeGrid(38, 36);
    fillEllipse(grid, 19, 28, 16, 5, STONE_RAMP[2]);
    for (const px of [6, 12, 25, 31]) fillRect(grid, px, 11, 2, 16, STONE_RAMP[4]);
    fillTriangle(grid, [4, 11], [19, 3], [34, 11], (x) => toneOf(PURPLE_ROOF, 0.75 - (x - 4) * 0.02, x, 0));
    fillRect(grid, 16, 20, 6, 7, WOOD_RAMP[2]); // open tome lectern
    fillRect(grid, 14, 17 - frame, 10, 4, '#fff6e0');
    dot(grid, 19, 14 - frame, '#5fd3e8');
    return sprite(grid, 19, 32);
  });
}

// ---------- 31..40: Danger, Banditry & Monster Strongholds ----------

function banditTollgateSprite() {
  return once('s50|tollgate', () => {
    const grid = makeGrid(42, 30);
    for (let x = 4; x <= 36; x += 6) {
      drawLine(grid, x, 26, x + 5, 13, WOOD_RAMP[2]);
      drawLine(grid, x + 5, 26, x, 13, WOOD_RAMP[3]);
    }
    fillRect(grid, 20, 3, 2, 24, WOOD.dark);
    fillRect(grid, 22, 4, 10, 8, '#241c2c');
    fillRect(grid, 25, 6, 4, 4, '#eef3fa'); // pirate/bandit skull
    return sprite(grid, 21, 27);
  });
}

function cursedTotemSprite(frame = 0) {
  return once('s50|cursedTotem|' + (frame % 2), () => {
    const grid = makeGrid(24, 38);
    paintStonePedestal(grid, 12, 29, 7, 7);
    fillTriangle(grid, [6, 29], [12, 3], [18, 29], () => '#231c30');
    fillRect(grid, 10, 12, 4, 4, frame ? '#ff3b5c' : '#b44cff');
    dot(grid, 11, 13, '#ffffff');
    fillRect(grid, 9, 21, 6, 2, '#9a4dff');
    return sprite(grid, 12, 36);
  });
}

function gallowsRuinsSprite(frame = 0) {
  return once('s50|ravenCage|' + (frame % 2), () => {
    const grid = makeGrid(26, 36);
    fillRect(grid, 6, 4, 3, 30, WOOD.dark);
    fillRect(grid, 6, 4, 14, 3, WOOD.dark);
    fillRect(grid, 17, 7, 1, 5, '#9aa6b8');
    fillRect(grid, 13, 12, 9, 11, '#3a3442');
    fillRect(grid, 14, 13, 7, 9, '#1c1726');
    fillRect(grid, 16, 13, 1, 9, '#7a8296');
    dot(grid, 17, 17, frame ? '#5fd3e8' : '#b48cff');
    dot(grid, 12, 3, '#1c1726'); // perched raven
    return sprite(grid, 13, 34);
  });
}

function boneCairnSprite() {
  return once('s50|boneCairn', () => {
    const grid = makeGrid(34, 30);
    fillBall(grid, 17, 22, 12, 6.5, STONE_RAMP.slice(0, 3));
    fillEllipse(grid, 17, 12, 6, 5, '#f2ead8'); // wyvern skull
    drawLine(grid, 12, 10, 5, 3, '#e2d8c0'); // curved horns
    drawLine(grid, 22, 10, 29, 3, '#e2d8c0');
    fillRect(grid, 14, 11, 2, 2, OUTLINE);
    fillRect(grid, 18, 11, 2, 2, OUTLINE);
    fillRect(grid, 6, 24, 5, 2, '#c8242a'); // red war paint
    return sprite(grid, 17, 28);
  });
}

function goblinTotemSprite(frame = 0) {
  return once('s50|goblinTotem|' + (frame % 2), () => {
    const grid = makeGrid(26, 36);
    fillRect(grid, 9, 6, 8, 28, WOOD_RAMP[2]);
    fillRect(grid, 7, 9, 12, 6, '#3f9b2f'); // carved mask 1
    fillRect(grid, 7, 18, 12, 6, '#c8242a'); // carved mask 2
    dot(grid, 10, 11, frame ? '#ffd23f' : '#ff5a6e');
    dot(grid, 15, 11, frame ? '#ffd23f' : '#ff5a6e');
    dot(grid, 10, 20, '#ffffff');
    dot(grid, 15, 20, '#ffffff');
    fillRect(grid, 5, 5, 3, 4, '#ffd23f');
    fillRect(grid, 18, 5, 3, 4, '#5fd3e8');
    return sprite(grid, 13, 34);
  });
}

function poacherBlindSprite() {
  return once('s50|poacherBlind', () => {
    const grid = makeGrid(34, 28);
    fillTriangle(grid, [4, 24], [17, 8], [30, 24], (x) => toneOf(LEAF_RAMP, 0.45 + (x % 3) * 0.1, x, 0));
    fillRect(grid, 6, 22, 22, 4, WOOD.dark);
    fillRect(grid, 24, 13, 2, 13, WOOD_RAMP[2]); // drying fur rack
    fillRect(grid, 27, 13, 2, 13, WOOD_RAMP[2]);
    fillRect(grid, 25, 15, 4, 6, '#8a5a30');
    return sprite(grid, 17, 26);
  });
}

function smugglerCacheSprite() {
  return once('s50|smugglerCache', () => {
    const grid = makeGrid(30, 26);
    fillRect(grid, 5, 13, 14, 10, WOOD_RAMP[1]);
    fillRect(grid, 5, 13, 14, 2, '#9aa6b8');
    fillRect(grid, 10, 16, 4, 3, '#ffd23f');
    drawLine(grid, 23, 6, 23, 21, '#6d7686'); // heavy iron ship anchor
    fillRect(grid, 20, 8, 6, 2, '#6d7686');
    drawLine(grid, 19, 19, 23, 22, '#9aa6b8');
    drawLine(grid, 27, 19, 23, 22, '#9aa6b8');
    return sprite(grid, 15, 24);
  });
}

function abyssRiftSprite(frame = 0) {
  return once('s50|abyssRift|' + (frame % 3), () => {
    const grid = makeGrid(38, 24);
    fillEllipse(grid, 19, 14, 16, 7.5, '#1c141e');
    fillEllipse(grid, 19, 14, 12, 5, '#4b162a');
    drawLine(grid, 8, 13, 19, 15, '#e8541c');
    drawLine(grid, 19, 15, 30, 12, '#e8541c');
    drawLine(grid, 13, 10, 22, 17, '#ff9a2b');
    dot(grid, 15 + (frame % 3) * 3, 12 - (frame % 2), '#ffe066');
    dot(grid, 21 - (frame % 2), 9, '#b48cff');
    return sprite(grid, 19, 20);
  });
}

// ---------- 41..50: Biome Wonders (Coast, Desert, Frost, Blossom Gardens) ----------

function coralTidepoolSprite(frame = 0) {
  return once('s50|coralPool|' + (frame % 2), () => {
    const grid = makeGrid(36, 26);
    fillEllipse(grid, 18, 15, 16, 8, SANDSTONE_RAMP[2]);
    fillEllipse(grid, 18, 15, 13, 6, '#1fa6c4');
    fillEllipse(grid, 18, 14, 10, 4.5, '#4fd8eb');
    fillRect(grid, 8, 11, 3, 4, '#ff6fa8'); // coral clusters
    fillRect(grid, 25, 12, 3, 4, '#ff9a2b');
    dot(grid, 15 + frame * 2, 14, '#ffffff');
    dot(grid, 20, 17, '#ffd23f');
    return sprite(grid, 18, 22);
  });
}

function sunkenAnchorSprite() {
  return once('s50|anchor', () => {
    const grid = makeGrid(32, 32);
    fillEllipse(grid, 10, 23, 8, 4, '#d6bb7a');
    drawLine(grid, 15, 4, 15, 25, '#5f6674');
    fillRect(grid, 10, 8, 10, 2, '#7b8291');
    drawLine(grid, 8, 20, 15, 26, '#474c58');
    drawLine(grid, 22, 20, 15, 26, '#474c58');
    fillEllipse(grid, 24, 19, 5, 5, WOOD_RAMP[2]); // ship helm wheel
    dot(grid, 24, 19, '#ffd23f');
    return sprite(grid, 16, 29);
  });
}

function lighthouseBeaconSprite(frame = 0) {
  return once('s50|lighthouse|' + (frame % 2), () => {
    const grid = makeGrid(30, 54);
    fillRect(grid, 9, 44, 12, 7, STONE_RAMP[2]);
    for (let y = 16; y < 44; y += 7) {
      const col = ((y - 16) / 7) % 2 === 0 ? '#f6efe0' : '#d6302f';
      fillRect(grid, 10, y, 10, 7, col);
    }
    fillRect(grid, 8, 14, 14, 3, '#3a3442');
    fillRect(grid, 11, 8, 8, 6, frame ? '#fff6c8' : '#ffd23f');
    fillTriangle(grid, [8, 8], [15, 2], [22, 8], () => '#d6302f');
    return sprite(grid, 15, 51);
  });
}

function desertOasisSprite(frame = 0) {
  return once('s50|oasis|' + (frame % 2), () => {
    const grid = makeGrid(52, 42);
    fillEllipse(grid, 26, 29, 21, 8, '#e3c98c');
    fillEllipse(grid, 26, 29, 17, 6.5, '#1ca39e');
    fillEllipse(grid, 25, 28, 12, 4.5, '#4ee0cf');
    dot(grid, 22 + frame * 3, 28, '#ffffff');
    // Left palm tree
    drawLine(grid, 10, 29, 7, 13, WOOD_RAMP[2]);
    fillEllipse(grid, 7, 11, 8, 3, LEAF_RAMP[5]);
    fillTriangle(grid, [7, 10], [1, 16], [5, 12], () => LEAF_RAMP[6]);
    fillTriangle(grid, [7, 10], [13, 15], [9, 12], () => LEAF_RAMP[6]);
    // Right palm tree
    drawLine(grid, 42, 30, 44, 14, WOOD_RAMP[2]);
    fillEllipse(grid, 44, 12, 8, 3, LEAF_RAMP[5]);
    fillTriangle(grid, [44, 11], [38, 16], [42, 13], () => LEAF_RAMP[6]);
    fillTriangle(grid, [44, 11], [50, 16], [46, 13], () => LEAF_RAMP[6]);
    return sprite(grid, 26, 37);
  });
}

function sandObeliskSprite(frame = 0) {
  return once('s50|sandObelisk|' + (frame % 2), () => {
    const grid = makeGrid(24, 40);
    paintStonePedestal(grid, 12, 29, 7, 8);
    fillTriangle(grid, [7, 29], [12, 3], [17, 29], (x) => toneOf(SANDSTONE_RAMP, 0.8 - (x - 7) * 0.06, x, 0));
    fillTriangle(grid, [9, 11], [12, 3], [15, 11], () => '#ffd23f');
    dot(grid, 12, 16, frame ? '#fff6c8' : '#5fd3e8');
    return sprite(grid, 12, 38);
  });
}

function canyonTotemSprite(frame = 0) {
  return once('s50|canyon|' + (frame % 2), () => {
    const grid = makeGrid(34, 34);
    fillRect(grid, 6, 9, 5, 22, SANDSTONE_RAMP[2]);
    fillRect(grid, 23, 9, 5, 22, SANDSTONE_RAMP[2]);
    fillRect(grid, 4, 6, 26, 4, SANDSTONE_RAMP[3]);
    for (const cx of [13 + frame, 17, 21 - frame]) {
      fillRect(grid, cx, 10, 2, 7, '#ffd23f');
    }
    return sprite(grid, 17, 31);
  });
}

function glacierCrystalSprite(frame = 0) {
  return once('s50|glacier|' + (frame % 2), () => {
    const grid = makeGrid(36, 36);
    fillEllipse(grid, 18, 29, 15, 5, ICE_RAMP[4]);
    fillTriangle(grid, [12, 29], [18, 3], [24, 29], (x) => toneOf(ICE_RAMP, 0.85 - (x - 12) * 0.05, x, 0));
    fillTriangle(grid, [6, 29], [10, 11], [15, 29], () => ICE_RAMP[2]);
    fillTriangle(grid, [21, 29], [27, 13], [30, 29], () => ICE_RAMP[3]);
    dot(grid, 18, 8 + frame, '#ffffff');
    return sprite(grid, 18, 33);
  });
}

function nordicRunestoneSprite(frame = 0) {
  return once('s50|runestone|' + (frame % 2), () => {
    const grid = makeGrid(34, 34);
    fillEllipse(grid, 17, 27, 13, 5, '#eef3fa');
    fillRect(grid, 11, 8, 12, 20, STONE_RAMP[1]);
    fillTriangle(grid, [11, 8], [17, 3], [23, 8], () => STONE_RAMP[2]);
    drawLine(grid, 15, 11, 19, 23, '#5fd3e8');
    drawLine(grid, 19, 11, 15, 23, '#5fd3e8');
    fillRect(grid, 4, 21, 6, 5, '#3a3442'); // brazier flame
    fillEllipse(grid, 7, 19, 3, 2, frame ? '#ffd23f' : '#ff6a2b');
    return sprite(grid, 17, 31);
  });
}

function cherryGroveSprite(frame = 0) {
  return once('s50|cherryGrove|' + (frame % 2), () => {
    const grid = makeGrid(56, 54);
    fillEllipse(grid, 28, 47, 19, 4.5, '#4b9b3a');
    for (let i = 0; i < 6; i++) dot(grid, 12 + i * 6 + frame, 47 - (i % 2), '#ffadd0');
    fillRect(grid, 24, 25, 8, 22, '#5a3328');
    fillRect(grid, 26, 27, 3, 18, '#7a4a3a');
    fillBall(grid, 28, 17, 18, 12, PINK_RAMP, { ambient: 0.25 });
    fillBall(grid, 16, 20, 10, 8, PINK_RAMP, { ambient: 0.2 });
    fillBall(grid, 40, 20, 10, 8, PINK_RAMP, { ambient: 0.2 });
    // Mossy stone toro lantern right beside trunk
    fillRect(grid, 40, 35, 5, 11, STONE_RAMP[2]);
    fillRect(grid, 39, 32, 7, 3, STONE_RAMP[3]);
    fillRect(grid, 41, 36, 3, 3, '#ffd23f');
    return sprite(grid, 28, 49);
  });
}

function sunflowerMazeSprite(frame = 0) {
  return once('s50|sunflowerMaze|' + (frame % 2), () => {
    const grid = makeGrid(46, 34);
    fillEllipse(grid, 23, 22, 19, 9, '#2e7d32');
    fillEllipse(grid, 23, 21, 15, 6, '#d9cbb0');
    fillRect(grid, 17, 14, 12, 2, LEAF_RAMP[6]); // floral trellis arch
    fillRect(grid, 16, 15, 2, 11, LEAF_RAMP[4]);
    fillRect(grid, 28, 15, 2, 11, LEAF_RAMP[4]);
    for (const sx of [8, 12, 34, 38]) {
      fillRect(grid, sx, 22, 1, 5, LEAF_RAMP[5]);
      fillEllipse(grid, sx, 21, 2.5, 2.5, '#ffd23f');
      dot(grid, sx, 21, '#6b3e1f');
    }
    fillEllipse(grid, 23, 23, 4, 2.5, STONE_RAMP[4]);
    dot(grid, 23 + frame, 22, '#5fd3e8');
    return sprite(grid, 23, 30);
  });
}

// Ornate freestanding roadside stone lantern for enchanting road and square ambience.
export function stoneLanternSprite(glowing = true) {
  return once('s50|stoneLantern|' + (glowing ? 1 : 0), () => {
    const grid = makeGrid(14, 22);
    fillRect(grid, 5, 11, 4, 9, STONE_RAMP[2]);
    fillRect(grid, 3, 18, 8, 3, STONE_RAMP[1]);
    fillRect(grid, 4, 7, 6, 4, STONE_RAMP[3]);
    fillRect(grid, 5, 8, 4, 3, glowing ? '#ffe066' : '#8a8275');
    fillTriangle(grid, [2, 7], [7, 2], [12, 7], () => STONE_RAMP[3]);
    return sprite(grid, 7, 20);
  });
}

const PICTURE_BUILDERS = {
  manaObelisk: (blink) => manaObeliskSprite(blink),
  starWell: (blink) => starWellSprite(blink),
  worldTreeSapling: (blink) => worldTreeSaplingSprite(blink),
  celestialSundial: (blink) => celestialSundialSprite(blink),
  fairyRing: (blink) => fairyRingSprite(blink),
  crystalGeode: (blink) => crystalGeodeSprite(blink),
  moonMirror: (blink) => moonMirrorSprite(blink),
  dragonShrine: (blink) => dragonShrineSprite(blink),
  roadsidePavilion: (blink) => roadsidePavilionSprite(blink),
  stoneBridgeShrine: (blink) => stoneBridgeShrineSprite(blink),
  merchantOutpost: (blink) => merchantOutpostSprite(blink),
  beekeeperGrove: () => beekeeperGroveSprite(),
  lumberCamp: () => lumberCampSprite(),
  windTurbineTower: (_, sail) => windTurbineTowerSprite(sail),
  shepherdShelter: () => shepherdShelterSprite(),
  alchemyGarden: (blink) => alchemyGardenSprite(blink),
  watchBeacon: (_, __, flame) => watchBeaconSprite(flame),
  ruinedAqueduct: () => ruinedAqueductSprite(),
  knightCenotaph: (blink) => knightCenotaphSprite(blink),
  ancientAmphitheater: () => ancientAmphitheaterSprite(),
  duelistRing: () => duelistRingSprite(),
  bellSanctuary: (blink) => bellSanctuarySprite(blink),
  dwarvenForgeRuins: (blink) => dwarvenForgeRuinsSprite(blink),
  kingPillar: () => kingPillarSprite(),
  libraryRotunda: (blink) => libraryRotundaSprite(blink),
  banditTollgate: () => banditTollgateSprite(),
  cursedTotem: (blink) => cursedTotemSprite(blink),
  gallowsRuins: (blink) => gallowsRuinsSprite(blink),
  boneCairn: () => boneCairnSprite(),
  goblinTotem: (blink) => goblinTotemSprite(blink),
  poacherBlind: () => poacherBlindSprite(),
  smugglerCache: () => smugglerCacheSprite(),
  abyssRift: (_, __, flame) => abyssRiftSprite(flame),
  coralTidepool: (blink) => coralTidepoolSprite(blink),
  sunkenAnchor: () => sunkenAnchorSprite(),
  lighthouseBeacon: (blink) => lighthouseBeaconSprite(blink),
  desertOasis: (blink) => desertOasisSprite(blink),
  sandObelisk: (blink) => sandObeliskSprite(blink),
  canyonTotem: (blink) => canyonTotemSprite(blink),
  glacierCrystal: (blink) => glacierCrystalSprite(blink),
  nordicRunestone: (blink) => nordicRunestoneSprite(blink),
  cherryGrove: (blink) => cherryGroveSprite(blink),
  sunflowerMaze: (blink) => sunflowerMazeSprite(blink),
  stoneLantern: (_, __, ___, glowing) => stoneLanternSprite(glowing),
};

// Returns a cached pixel sprite for any structure ornament kind, or null if handled in props.js / buildings.js.
export function structureSprite(kind, time, glowing = true) {
  const fn = PICTURE_BUILDERS[kind];
  if (!fn) return null;
  const blink = Math.floor(time * 2) % 2;
  const sail = Math.floor(time * 5) % 4;
  const flame = Math.floor(time * 8) % 3;
  return fn(blink, sail, flame, glowing);
}

// ---------- Animated ambient beauty effects around structures (petals, runes, bees, beacon beams) ----------

export function drawStructureAmbience(ctx, game, view, time) {
  const isNightHour = game && (game.hour >= 18 || game.hour < 6);
  for (const s of WILD_STRUCTURES) {
    if (!isNear(view, s.x, s.y, 7)) continue;
    const def = STRUCTURE_BY_ID[s.kind];
    const effect = def ? def.effect : null;
    if (!effect) continue;
    const cx = Math.round(s.x * T - view.x);
    const cy = Math.round(s.y * T - view.y);

    if (effect === 'petals') {
      for (let i = 0; i < 6; i++) {
        const life = (time * 0.28 + i / 6 + (s.x % 5) * 0.13) % 1;
        const px = Math.round(cx - 18 + Math.sin(time * 1.8 + i * 2) * 14 + life * 16);
        const py = Math.round(cy - 36 + life * 36);
        ctx.fillStyle = i % 2 ? '#ffadd0' : '#ff6fa8';
        ctx.fillRect(px, py, 2, 2);
      }
    } else if (effect === 'azureSpark' || effect === 'goldSpark' || effect === 'portalWisp' || effect === 'feySpore' || effect === 'violetMist' || effect === 'emberFloat') {
      const palette =
        effect === 'azureSpark' ? ['#5fd3e8', '#ffffff']
          : effect === 'goldSpark' ? ['#ffd23f', '#fff6c8']
          : effect === 'portalWisp' ? ['#5fd3e8', '#b48cff']
          : effect === 'feySpore' ? ['#7cfc9a', '#5fd3e8']
          : effect === 'violetMist' ? ['#b44cff', '#ff5a8a']
          : ['#ff9a2b', '#ffe066'];
      for (let i = 0; i < 5; i++) {
        const life = (time * 0.45 + i / 5) % 1;
        const px = Math.round(cx + Math.cos(time * 1.6 + i * 1.3) * 12);
        const py = Math.round(cy - 6 - life * 24);
        ctx.fillStyle = palette[i % 2];
        ctx.globalAlpha = 0.85 * (1 - life);
        ctx.fillRect(px, py, 2, 2);
      }
      ctx.globalAlpha = 1;
    } else if (effect === 'beeBuzz') {
      for (let i = 0; i < 3; i++) {
        const ang = time * 4 + i * 2.1;
        const bx = Math.round(cx + Math.cos(ang) * 10);
        const by = Math.round(cy - 10 + Math.sin(ang * 1.5) * 4);
        ctx.fillStyle = '#ffd23f';
        ctx.fillRect(bx, by, 2, 1);
      }
    } else if (effect === 'beaconBeam' && isNightHour) {
      const ang = time * 0.85;
      const tipX = Math.round(cx + Math.cos(ang) * 76);
      const tipY = Math.round(cy - 34 + Math.sin(ang) * 38);
      ctx.fillStyle = 'rgba(255, 240, 150, 0.22)';
      ctx.beginPath();
      ctx.moveTo(cx, cy - 34);
      ctx.lineTo(tipX - 8, tipY - 8);
      ctx.lineTo(tipX + 8, tipY + 8);
      ctx.closePath();
      ctx.fill();
    } else if (effect === 'smokeCurl' || effect === 'beaconFlame') {
      for (let i = 0; i < 3; i++) {
        const life = (time * 0.35 + i / 3) % 1;
        const sx = Math.round(cx + Math.sin(time * 2 + i) * 4);
        const sy = Math.round(cy - 22 - life * 24);
        ctx.fillStyle = 'rgba(220, 226, 238, ' + (0.4 * (1 - life)).toFixed(2) + ')';
        ctx.fillRect(sx, sy, 3, 3);
      }
    }
  }
}

export function structureLightSpec(kind) {
  if (kind === 'stoneLantern') return { radius: 46, cold: false };
  const def = STRUCTURE_BY_ID[kind];
  if (!def || !def.light) return null;
  return { radius: def.light, cold: Boolean(def.coldLight) };
}
