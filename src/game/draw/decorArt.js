import { OUTLINE, WOOD, WOOD_RAMP, STONE_RAMP, LEAF_RAMP, LIGHT_LEAF_RAMP, GRASS_RAMP } from './palette';
import { makeGrid, dot, fillRect, fillEllipse, fillBall, drawLine, fillTriangle, toneOf, addOutline, toCanvas, once } from './pixels';

// Rich cached pixel art sprites for sculpted bush shapes, weapon displays, flowers, greenery, and burrows/holes.

function sprite(grid, ax, ay, outline = OUTLINE) {
  return { canvas: toCanvas(addOutline(grid, outline)), ax: ax, ay: ay };
}

function paintPlanterBase(grid, cx, bottomY, halfW) {
  fillRect(grid, cx - halfW, bottomY - 5, halfW * 2, 5, STONE_RAMP[2]);
  fillRect(grid, cx - halfW - 1, bottomY - 6, halfW * 2 + 2, 2, STONE_RAMP[4]);
}

// ---------- 1. Bush Forms & Sculpted Topiaries (10) ----------

function bushHeartSprite() {
  return once('dec|bushHeart', () => {
    const grid = makeGrid(28, 30);
    paintPlanterBase(grid, 14, 29, 6);
    fillRect(grid, 12, 18, 4, 7, WOOD_RAMP[1]);
    fillBall(grid, 9, 11, 6, 5.5, LIGHT_LEAF_RAMP, { ambient: 0.2 });
    fillBall(grid, 19, 11, 6, 5.5, LIGHT_LEAF_RAMP, { ambient: 0.2 });
    fillTriangle(grid, [4, 13], [14, 24], [24, 13], (x, y) => toneOf(LIGHT_LEAF_RAMP, 0.7 - (x - 4) * 0.02, x, y));
    for (const [fx, fy] of [[8, 9], [18, 10], [14, 17]]) dot(grid, fx, fy, '#ff6fa8');
    return sprite(grid, 14, 28);
  });
}

function bushSpiralSprite() {
  return once('dec|bushSpiral', () => {
    const grid = makeGrid(24, 34);
    paintPlanterBase(grid, 12, 33, 6);
    fillRect(grid, 10, 22, 4, 6, WOOD.dark);
    fillEllipse(grid, 12, 21, 8, 4, LEAF_RAMP[3]);
    fillEllipse(grid, 12, 15, 6.5, 3.5, LEAF_RAMP[4]);
    fillEllipse(grid, 12, 10, 4.5, 3, LEAF_RAMP[5]);
    fillEllipse(grid, 12, 6, 2.5, 2.5, LEAF_RAMP[6]);
    drawLine(grid, 6, 21, 17, 15, LEAF_RAMP[1]);
    drawLine(grid, 7, 14, 16, 10, LEAF_RAMP[1]);
    return sprite(grid, 12, 32);
  });
}

function bushSwordSprite() {
  return once('dec|bushSword', () => {
    const grid = makeGrid(24, 36);
    paintPlanterBase(grid, 12, 35, 6);
    fillTriangle(grid, [12, 2], [9, 9], [15, 9], () => LEAF_RAMP[6]);
    fillRect(grid, 9, 9, 6, 14, LEAF_RAMP[4]);
    fillRect(grid, 10, 9, 2, 14, LEAF_RAMP[6]);
    fillRect(grid, 5, 22, 14, 3, LEAF_RAMP[5]); // sculpted crossguard
    fillRect(grid, 10, 25, 4, 5, WOOD_RAMP[2]);
    dot(grid, 12, 23, '#ffd23f');
    return sprite(grid, 12, 34);
  });
}

function bushCrownSprite() {
  return once('dec|bushCrown', () => {
    const grid = makeGrid(28, 28);
    paintPlanterBase(grid, 14, 27, 7);
    fillEllipse(grid, 14, 17, 10, 6, LEAF_RAMP[4]);
    for (const px of [7, 14, 21]) {
      fillTriangle(grid, [px - 3, 14], [px, 6], [px + 3, 14], () => LEAF_RAMP[6]);
      dot(grid, px, 6, '#ffd23f');
    }
    dot(grid, 10, 16, '#ffd23f');
    dot(grid, 18, 16, '#ffd23f');
    return sprite(grid, 14, 26);
  });
}

function bushDragonSprite() {
  return once('dec|bushDragon', () => {
    const grid = makeGrid(34, 32);
    paintPlanterBase(grid, 17, 31, 8);
    fillEllipse(grid, 16, 18, 9, 6, LEAF_RAMP[4]);
    fillTriangle(grid, [13, 15], [7, 5], [16, 12], () => LEAF_RAMP[5]); // sculpted wing
    fillTriangle(grid, [18, 14], [25, 4], [21, 13], () => LEAF_RAMP[6]);
    fillBall(grid, 25, 11, 4.5, 3.5, LEAF_RAMP, { ambient: 0.2 }); // dragon head
    fillRect(grid, 27, 10, 4, 2, LEAF_RAMP[5]);
    dot(grid, 25, 10, '#ffd23f'); // gleaming golden flower eye
    fillTriangle(grid, [8, 21], [2, 16], [7, 23], () => LEAF_RAMP[3]); // tail crest
    return sprite(grid, 17, 30);
  });
}

function bushBerrySprite(color = '#e83b48', key = 'red') {
  return once('dec|bushBerry|' + key, () => {
    const grid = makeGrid(26, 22);
    fillBall(grid, 13, 12, 10, 7.5, LEAF_RAMP, { ambient: 0.2 });
    fillBall(grid, 9, 10, 5, 4, LIGHT_LEAF_RAMP, { ambient: 0.25 });
    for (const [bx, by] of [[7, 10], [11, 7], [15, 11], [18, 9], [10, 14], [16, 14]]) {
      fillRect(grid, bx, by, 2, 2, color);
      dot(grid, bx, by, '#ffffff');
    }
    return sprite(grid, 13, 19);
  });
}

function bushRoseSprite() {
  return once('dec|bushRose', () => {
    const grid = makeGrid(26, 22);
    fillBall(grid, 13, 12, 10, 7.5, LEAF_RAMP, { ambient: 0.2 });
    for (const [rx, ry, c] of [[8, 9, '#e8324c'], [13, 7, '#fff2f4'], [17, 10, '#ff6fa8'], [9, 14, '#ff6fa8'], [16, 14, '#e8324c']]) {
      fillRect(grid, rx, ry, 3, 2, c);
      dot(grid, rx + 1, ry, '#fff6c8');
    }
    return sprite(grid, 13, 19);
  });
}

function bushHydrangeaSprite() {
  return once('dec|bushHydrangea', () => {
    const grid = makeGrid(26, 22);
    fillBall(grid, 13, 13, 10, 7, LEAF_RAMP, { ambient: 0.2 });
    for (const [cx, cy, c] of [[9, 9, '#5fa8ff'], [15, 8, '#90c8ff'], [17, 13, '#8a7aff'], [11, 14, '#5fa8ff']]) {
      fillEllipse(grid, cx, cy, 3, 2.5, c);
      dot(grid, cx, cy - 1, '#e6f6ff');
    }
    return sprite(grid, 13, 19);
  });
}

function bushBambooSprite(frame = 0) {
  return once('dec|bushBamboo|' + (frame % 2), () => {
    const grid = makeGrid(24, 34);
    for (const [sx, h, col] of [[6, 24, '#3fa043'], [11, 28, '#58c04e'], [16, 22, '#358838']]) {
      const sway = frame && h > 23 ? 1 : 0;
      drawLine(grid, sx, 31, sx + sway, 31 - h, col);
      drawLine(grid, sx + 1, 31, sx + 1 + sway, 31 - h, '#86d668');
      for (let ny = 31 - h + 4; ny < 30; ny += 5) fillRect(grid, sx, ny, 2, 1, '#1f5a2a');
      fillRect(grid, sx - 2 + sway, 31 - h, 5, 2, '#6ed85a');
      fillRect(grid, sx + 1 + sway, 31 - h + 4, 4, 2, '#52a43e');
    }
    return sprite(grid, 12, 31);
  });
}

// ---------- 2. Weapon & Martial Decorations (8) ----------

function crossedHalberdsSprite() {
  return once('dec|halberds', () => {
    const grid = makeGrid(32, 34);
    fillRect(grid, 9, 27, 14, 5, STONE_RAMP[2]);
    drawLine(grid, 6, 30, 25, 5, WOOD_RAMP[2]);
    drawLine(grid, 25, 30, 6, 5, WOOD_RAMP[2]);
    fillTriangle(grid, [22, 4], [28, 2], [26, 9], () => '#dce6f5'); // axe head 1
    fillTriangle(grid, [9, 4], [3, 2], [5, 9], () => '#dce6f5'); // axe head 2
    fillRect(grid, 12, 13, 8, 10, '#c8242a'); // guild banner crest
    fillRect(grid, 15, 15, 2, 5, '#ffd23f');
    return sprite(grid, 16, 32);
  });
}

function knightArmorStandSprite() {
  return once('dec|armorStand', () => {
    const grid = makeGrid(24, 34);
    fillRect(grid, 10, 26, 4, 6, WOOD_RAMP[2]);
    fillRect(grid, 7, 30, 10, 3, STONE_RAMP[2]);
    fillTriangle(grid, [6, 12], [12, 29], [18, 12], () => '#a81c28'); // crimson cape
    fillRect(grid, 8, 11, 8, 12, '#a9b6c8'); // breastplate
    fillRect(grid, 6, 11, 3, 5, '#cfd8e6'); // pauldrons
    fillRect(grid, 15, 11, 3, 5, '#cfd8e6');
    fillBall(grid, 12, 7, 3.5, 4, ['#6d7686', '#9aa6b8', '#e8eef7']); // helmet
    fillRect(grid, 10, 7, 4, 1, OUTLINE); // visor slit
    fillRect(grid, 10, 3, 4, 2, '#ffd23f');
    return sprite(grid, 12, 32);
  });
}

function archeryTargetSprite() {
  return once('dec|target', () => {
    const grid = makeGrid(28, 28);
    drawLine(grid, 10, 16, 6, 26, WOOD_RAMP[2]);
    drawLine(grid, 16, 16, 20, 26, WOOD_RAMP[2]);
    fillEllipse(grid, 13, 12, 8.5, 8.5, '#f2ead8');
    fillEllipse(grid, 13, 12, 6, 6, '#3a7bff');
    fillEllipse(grid, 13, 12, 3.5, 3.5, '#e83b48');
    fillEllipse(grid, 13, 12, 1.5, 1.5, '#ffd23f');
    drawLine(grid, 13, 12, 19, 7, WOOD_RAMP[3]); // embedded arrows
    dot(grid, 19, 7, '#ff5a6e');
    fillRect(grid, 22, 18, 4, 8, '#7a4a24'); // quiver
    dot(grid, 23, 16, '#ffd23f');
    dot(grid, 25, 16, '#ffffff');
    return sprite(grid, 14, 26);
  });
}

function shieldPedestalSprite() {
  return once('dec|shieldPedestal', () => {
    const grid = makeGrid(24, 30);
    fillRect(grid, 6, 20, 12, 7, STONE_RAMP[2]);
    fillRect(grid, 5, 26, 14, 3, STONE_RAMP[1]);
    fillRect(grid, 7, 19, 10, 2, STONE_RAMP[4]);
    fillRect(grid, 6, 6, 12, 10, '#2f5fa0');
    fillTriangle(grid, [6, 16], [12, 23], [18, 16], () => '#2f5fa0');
    fillRect(grid, 6, 6, 12, 2, '#ffd23f');
    fillRect(grid, 11, 8, 2, 11, '#ffd23f');
    fillRect(grid, 8, 11, 8, 2, '#ffd23f');
    return sprite(grid, 12, 28);
  });
}

function greatswordStoneSprite() {
  return once('dec|greatswordStone', () => {
    const grid = makeGrid(24, 34);
    fillBall(grid, 12, 25, 9, 6, STONE_RAMP.slice(0, 4));
    fillRect(grid, 10, 9, 4, 15, '#c9d8eb');
    fillRect(grid, 11, 9, 1, 15, '#ffffff');
    fillRect(grid, 6, 9, 12, 2, '#ffd23f'); // wide guard
    fillRect(grid, 11, 4, 2, 5, '#4b3b6b');
    dot(grid, 12, 3, '#5fd3e8');
    return sprite(grid, 12, 30);
  });
}

function warDrumsSprite() {
  return once('dec|warDrums', () => {
    const grid = makeGrid(32, 30);
    drawLine(grid, 5, 27, 5, 2, WOOD_RAMP[2]); // spears with crimson pennants
    drawLine(grid, 26, 27, 26, 2, WOOD_RAMP[2]);
    fillTriangle(grid, [5, 1], [3, 5], [7, 5], () => '#e8eef7');
    fillTriangle(grid, [26, 1], [24, 5], [28, 5], () => '#e8eef7');
    fillRect(grid, 6, 5, 5, 4, '#c8242a');
    fillRect(grid, 21, 5, 5, 4, '#c8242a');
    fillEllipse(grid, 16, 21, 7, 6.5, WOOD_RAMP[2]); // heavy war drum
    fillEllipse(grid, 16, 16, 6.5, 2.5, '#f2e0b8');
    fillRect(grid, 9, 20, 14, 1, STONE_RAMP[4]);
    return sprite(grid, 16, 28);
  });
}

function anvilHammerSprite() {
  return once('dec|anvilHammer', () => {
    const grid = makeGrid(28, 24);
    fillRect(grid, 6, 15, 16, 7, WOOD_RAMP[1]); // oak stump
    fillRect(grid, 5, 9, 17, 4, '#4a5568'); // anvil horn & face
    fillRect(grid, 9, 13, 9, 3, '#2d3748');
    drawLine(grid, 10, 7, 21, 10, '#e8eef7'); // resting sword
    fillRect(grid, 8, 6, 3, 2, '#ffd23f');
    return sprite(grid, 14, 22);
  });
}

function cannonDisplaySprite() {
  return once('dec|cannon', () => {
    const grid = makeGrid(32, 24);
    fillRect(grid, 6, 11, 18, 6, '#8a6a2a'); // bronze barrel
    fillRect(grid, 6, 11, 18, 2, '#c9961e');
    fillRect(grid, 23, 10, 3, 8, '#c9961e'); // muzzle ring
    fillEllipse(grid, 12, 18, 5, 5, WOOD_RAMP[2]); // wooden carriage wheel
    dot(grid, 12, 18, '#ffd23f');
    for (const [bx, by] of [[25, 20], [28, 20], [26, 18]]) fillEllipse(grid, bx, by, 1.5, 1.5, '#3a3442');
    return sprite(grid, 16, 22);
  });
}

// ---------- 3. Flowers & Marsh Plants (10) ----------

function paintFlowerBedBox(color1, color2, color3, key) {
  return once('dec|' + key, () => {
    const grid = makeGrid(28, 16);
    fillEllipse(grid, 14, 11, 12, 4, GRASS_RAMP[2]);
    for (let i = 0; i < 6; i++) {
      const fx = 5 + i * 3 + (i % 2);
      const fy = 6 + (i % 3) * 2;
      dot(grid, fx, fy + 3, GRASS_RAMP[1]);
      fillRect(grid, fx - 1, fy, 3, 2, i % 3 === 0 ? color1 : i % 3 === 1 ? color2 : color3);
      dot(grid, fx, fy, '#fff6c8');
    }
    return sprite(grid, 14, 13);
  });
}

function sunflowerPatchSprite() {
  return once('dec|sunflowerPatch', () => {
    const grid = makeGrid(28, 26);
    for (const [sx, sy] of [[7, 9], [14, 6], [21, 10]]) {
      fillRect(grid, sx, sy + 2, 2, 22 - sy, LEAF_RAMP[4]);
      fillEllipse(grid, sx + 0.5, sy + 1, 4, 4, '#ffd23f');
      fillEllipse(grid, sx + 0.5, sy + 1, 2, 2, '#6b3e1f');
    }
    return sprite(grid, 14, 24);
  });
}

function moonflowerSprite(frame = 0) {
  return once('dec|moonflower|' + (frame % 2), () => {
    const grid = makeGrid(24, 18);
    fillEllipse(grid, 12, 12, 9, 4, '#1e4a44');
    for (const [fx, fy] of [[7, 10], [13, 8], [17, 12], [10, 13]]) {
      fillRect(grid, fx - 1, fy, 3, 2, frame ? '#9ef6ff' : '#5fd3e8');
      dot(grid, fx, fy, '#ffffff');
    }
    return sprite(grid, 12, 15, '#193548');
  });
}

function cactusFlowerSprite() {
  return once('dec|cactusFlower', () => {
    const grid = makeGrid(20, 26);
    fillRect(grid, 8, 7, 5, 16, '#3b8c3b');
    fillRect(grid, 4, 11, 4, 5, '#3b8c3b');
    fillRect(grid, 13, 9, 4, 6, '#3b8c3b');
    fillRect(grid, 9, 5, 3, 2, '#ff4d88'); // magenta cactus bloom
    fillRect(grid, 4, 9, 2, 2, '#ffd23f');
    dot(grid, 15, 8, '#ff4d88');
    return sprite(grid, 10, 23);
  });
}

function waterReedSprite(frame = 0) {
  return once('dec|waterReed|' + (frame % 2), () => {
    const grid = makeGrid(22, 24);
    for (const [rx, h] of [[5, 14], [10, 18], [15, 13]]) {
      drawLine(grid, rx, 21, rx + frame, 21 - h, '#4f9a3e');
      fillRect(grid, rx - 1 + frame, 21 - h + 1, 3, 4, '#6b3e1f'); // cattail head
    }
    return sprite(grid, 11, 21);
  });
}

// ---------- 4. Greenery (6) ----------

function fernClusterSprite() {
  return once('dec|fern', () => {
    const grid = makeGrid(24, 18);
    for (const [dx, dy, c] of [[-7, -4, LEAF_RAMP[3]], [7, -4, LEAF_RAMP[3]], [-5, -7, LEAF_RAMP[5]], [5, -7, LEAF_RAMP[5]], [0, -9, LEAF_RAMP[6]]]) {
      drawLine(grid, 12, 14, 12 + dx, 14 + dy, c);
      dot(grid, 12 + dx, 14 + dy, LEAF_RAMP[7]);
    }
    return sprite(grid, 12, 15);
  });
}

function mossyLogSprite() {
  return once('dec|mossyLog', () => {
    const grid = makeGrid(30, 16);
    fillRect(grid, 3, 7, 24, 7, WOOD_RAMP[1]);
    fillRect(grid, 4, 7, 22, 2, WOOD_RAMP[2]);
    fillEllipse(grid, 4, 10.5, 2.5, 3.5, WOOD_RAMP[3]);
    fillRect(grid, 8, 6, 8, 3, '#4caf50'); // moss carpet
    fillRect(grid, 18, 7, 5, 2, '#62c44c');
    fillRect(grid, 11, 4, 2, 2, '#ffd23f'); // tiny mushrooms
    dot(grid, 20, 6, '#e8425f');
    return sprite(grid, 15, 14);
  });
}

function cloverPatchSprite() {
  return once('dec|clover', () => {
    const grid = makeGrid(22, 14);
    fillEllipse(grid, 11, 7, 9, 4.5, GRASS_RAMP[2]);
    for (const [cx, cy] of [[6, 6], [10, 8], [14, 6], [12, 4], [16, 8]]) {
      dot(grid, cx, cy, '#66d045');
      dot(grid, cx + 1, cy, '#86e068');
    }
    dot(grid, 8, 5, '#ffffff'); // tiny daisy
    dot(grid, 15, 7, '#ffffff');
    return sprite(grid, 11, 11);
  });
}

function hedgeRowSprite() {
  return once('dec|hedgeRow', () => {
    const grid = makeGrid(32, 20);
    fillRect(grid, 2, 5, 28, 12, LEAF_RAMP[3]);
    fillRect(grid, 2, 5, 28, 4, LEAF_RAMP[5]);
    fillRect(grid, 3, 6, 26, 2, LEAF_RAMP[6]);
    dot(grid, 7, 8, '#ff6fa8');
    dot(grid, 16, 7, '#ffd23f');
    dot(grid, 24, 9, '#ff6fa8');
    return sprite(grid, 16, 17);
  });
}

// ---------- 5. Holes, Burrows & Crevices (6) ----------

function rabbitBurrowSprite(frame = 0) {
  return once('dec|rabbitBurrow|' + (frame % 2), () => {
    const grid = makeGrid(26, 18);
    fillEllipse(grid, 13, 11, 11, 5.5, '#6b4a2c'); // earthen mound
    fillEllipse(grid, 13, 10, 9, 4, '#8a623c');
    fillEllipse(grid, 13, 12, 5.5, 3, '#1a1216'); // dark burrow opening
    fillRect(grid, 4, 8, 5, 3, GRASS_RAMP[3]); // grassy rim
    fillRect(grid, 17, 8, 5, 3, GRASS_RAMP[3]);
    if (frame % 2 === 1) {
      // Cute twitching bunny ears peeking out of the hole!
      fillRect(grid, 11, 7, 1, 4, '#ffffff');
      fillRect(grid, 14, 7, 1, 4, '#ffffff');
      dot(grid, 12, 11, '#ff9ec4');
    }
    return sprite(grid, 13, 14);
  });
}

function foxDenSprite() {
  return once('dec|foxDen', () => {
    const grid = makeGrid(28, 20);
    fillEllipse(grid, 14, 13, 12, 6, '#7a5230');
    fillEllipse(grid, 14, 13, 6, 3.5, '#140f14');
    drawLine(grid, 3, 9, 10, 12, WOOD_RAMP[1]); // mossy roots
    drawLine(grid, 25, 9, 18, 12, WOOD_RAMP[1]);
    fillRect(grid, 5, 8, 6, 2, '#4caf50');
    return sprite(grid, 14, 16);
  });
}

function badgerHoleSprite() {
  return once('dec|badgerHole', () => {
    const grid = makeGrid(26, 18);
    fillEllipse(grid, 13, 11, 11, 5, STONE_RAMP[1]);
    fillEllipse(grid, 13, 11, 5, 3, '#141016');
    dot(grid, 5, 13, STONE_RAMP[4]);
    dot(grid, 20, 12, STONE_RAMP[3]);
    return sprite(grid, 13, 14);
  });
}

function hollowStumpSprite() {
  return once('dec|hollowStump', () => {
    const grid = makeGrid(24, 22);
    fillRect(grid, 5, 7, 14, 12, WOOD_RAMP[1]);
    fillEllipse(grid, 12, 7, 7, 3, WOOD_RAMP[3]);
    fillEllipse(grid, 12, 13, 3.5, 4, '#140e12'); // hollow doorway in trunk
    fillRect(grid, 4, 16, 4, 3, '#4caf50');
    return sprite(grid, 12, 19);
  });
}

function groundPuddleSprite(frame = 0) {
  return once('dec|puddle|' + (frame % 2), () => {
    const grid = makeGrid(26, 16);
    fillEllipse(grid, 13, 8, 10, 5, '#2a66b8');
    fillEllipse(grid, 13, 8, 8, 3.5, '#5aa8ee');
    dot(grid, 10 + frame * 3, 7, '#ffffff');
    dot(grid, 15, 9, '#a4d6fa');
    return sprite(grid, 13, 11, '#224a78');
  });
}

function craterPitSprite() {
  return once('dec|craterPit', () => {
    const grid = makeGrid(28, 18);
    fillEllipse(grid, 14, 10, 11, 5.5, STONE_RAMP[1]);
    fillEllipse(grid, 14, 10, 7.5, 3.5, '#1c1824');
    dot(grid, 5, 8, STONE_RAMP[3]);
    dot(grid, 22, 12, STONE_RAMP[4]);
    return sprite(grid, 14, 14);
  });
}

// ---------- 6. Authentic Real-Life Elements (16) ----------

function hayBaleSprite() {
  return once('dec|hayBale', () => {
    const grid = makeGrid(28, 24);
    fillBall(grid, 14, 15, 10, 6.5, ['#a87a1a', '#d8a832', '#f2cf5c', '#ffea8e']);
    fillRect(grid, 6, 17, 16, 2, '#9a6416');
    for (let x = 7; x < 21; x += 3) dot(grid, x, 13, '#ffeaa8');
    drawLine(grid, 19, 13, 24, 3, WOOD_RAMP[2]); // pitchfork handle
    drawLine(grid, 18, 14, 20, 11, '#a8b4c8');
    return sprite(grid, 14, 21);
  });
}

function woodPileSprite() {
  return once('dec|woodPile', () => {
    const grid = makeGrid(28, 24);
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 4 - r; c++) {
        const lx = 5 + r * 2 + c * 4;
        const ly = 18 - r * 3;
        fillRect(grid, lx, ly, 4, 3, WOOD_RAMP[1]);
        fillRect(grid, lx + 1, ly + 1, 2, 1, '#e8c488'); // sawn log end
      }
    }
    fillRect(grid, 20, 16, 5, 5, WOOD_RAMP[2]); // chopping block
    drawLine(grid, 22, 15, 25, 9, WOOD_RAMP[3]); // axe handle
    fillRect(grid, 21, 14, 2, 2, '#c8d4e6'); // axe blade
    return sprite(grid, 14, 21);
  });
}

function laundryLineSprite(frame) {
  return once('dec|laundry|' + frame, () => {
    const grid = makeGrid(36, 26);
    fillRect(grid, 3, 6, 2, 19, WOOD_RAMP[1]); // wooden posts
    fillRect(grid, 31, 6, 2, 19, WOOD_RAMP[1]);
    drawLine(grid, 4, 8, 31, 8, '#d8d0be'); // clothesline
    const sway = frame ? 1 : 0;
    fillRect(grid, 8 + sway, 9, 6, 8, '#ffffff'); // linen shirt
    fillRect(grid, 16 - sway, 9, 5, 9, '#6aa8ee'); // blue tunic
    fillRect(grid, 23 + sway, 9, 6, 7, '#f26a78'); // red cloth
    return sprite(grid, 18, 24);
  });
}

function beehiveSprite(frame) {
  return once('dec|beehive|' + frame, () => {
    const grid = makeGrid(26, 26);
    fillRect(grid, 9, 17, 6, 7, WOOD_RAMP[1]);
    fillBall(grid, 12, 13, 6, 5.5, ['#b87e1c', '#e0a630', '#f5c852']); // straw skep rings
    for (let y = 10; y <= 16; y += 2) fillRect(grid, 7, y, 10, 1, '#8c5a14');
    fillRect(grid, 11, 15, 2, 3, '#26180c'); // hive doorway
    dot(grid, 5 + frame * 2, 7 - frame, '#ffd23f'); // buzzing bees
    dot(grid, 19 - frame, 9 + frame, '#ffd23f');
    dot(grid, 20, 13 - frame, '#ffe888');
    return sprite(grid, 13, 24);
  });
}

function fishingGearSprite() {
  return once('dec|fishingGear', () => {
    const grid = makeGrid(26, 26);
    fillRect(grid, 11, 16, 6, 7, WOOD_RAMP[2]); // bait bucket
    fillRect(grid, 12, 16, 4, 1, '#5aa8ee'); // water rim
    drawLine(grid, 4, 22, 19, 4, '#c48a3a'); // bamboo rod 1
    drawLine(grid, 8, 22, 22, 7, '#a87028'); // bamboo rod 2
    drawLine(grid, 19, 4, 21, 15, '#e8eef7'); // fishing line
    dot(grid, 21, 16, '#e83b48'); // red bobber float
    fillRect(grid, 4, 19, 6, 4, '#b89460'); // tackle basket
    return sprite(grid, 13, 23);
  });
}

function doghouseSprite() {
  return once('dec|doghouse', () => {
    const grid = makeGrid(26, 24);
    fillRect(grid, 5, 11, 14, 10, WOOD_RAMP[2]); // timber walls
    fillTriangle(grid, [3, 11], [12, 3], [21, 11], () => '#8a3228'); // shingled roof
    fillRect(grid, 9, 13, 6, 8, '#1c1726'); // arched doorway
    fillRect(grid, 10, 12, 4, 2, '#1c1726');
    fillRect(grid, 20, 18, 4, 2, '#e83b48'); // water bowl
    fillRect(grid, 21, 17, 2, 1, '#5aa8ee');
    return sprite(grid, 12, 21);
  });
}

function birdhouseSprite(frame) {
  return once('dec|birdhouse|' + frame, () => {
    const grid = makeGrid(20, 30);
    fillRect(grid, 9, 13, 2, 15, WOOD_RAMP[1]);
    fillRect(grid, 5, 7, 10, 8, '#c89a64'); // timber house
    fillTriangle(grid, [4, 7], [10, 2], [16, 7], () => '#8a3228'); // red gable roof
    fillRect(grid, 9, 10, 2, 2, '#1c1726'); // entrance hole
    fillRect(grid, 8, 13, 4, 1, WOOD_RAMP[3]); // perch
    dot(grid, 12, 12 - frame, '#6b4a2b'); // tiny perching sparrow
    dot(grid, 13, 12 - frame, '#e8a030');
    return sprite(grid, 10, 28);
  });
}

function milkChurnsSprite() {
  return once('dec|milkChurns', () => {
    const grid = makeGrid(24, 22);
    fillRect(grid, 5, 8, 5, 11, '#9eaaba'); // tall metal milk churn
    fillRect(grid, 6, 6, 3, 2, '#cfd8e6');
    fillRect(grid, 11, 10, 5, 9, '#8894a8');
    fillRect(grid, 12, 8, 3, 2, '#b6c2d4');
    fillRect(grid, 17, 14, 4, 5, WOOD_RAMP[2]); // wooden milk pail
    fillRect(grid, 18, 14, 2, 1, '#ffffff'); // fresh milk top
    return sprite(grid, 12, 20);
  });
}

function picnicBlanketSprite() {
  return once('dec|picnicBlanket', () => {
    const grid = makeGrid(32, 22);
    for (let y = 4; y < 18; y++) {
      for (let x = 3; x < 29; x++) {
        const checker = ((Math.floor(x / 3) + Math.floor(y / 3)) % 2) === 0;
        dot(grid, x, y, checker ? '#e84848' : '#fff8ee');
      }
    }
    fillRect(grid, 18, 6, 6, 5, '#c48642'); // wicker picnic basket
    fillRect(grid, 19, 5, 4, 1, '#945e28');
    fillRect(grid, 9, 10, 5, 3, '#d89a48'); // loaf of bread
    dot(grid, 8, 8, '#e83232'); // apples
    dot(grid, 11, 14, '#e83232');
    return sprite(grid, 16, 16, '#8a3232');
  });
}

function stoneBenchSprite() {
  return once('dec|stoneBench', () => {
    const grid = makeGrid(32, 20);
    fillRect(grid, 5, 13, 3, 5, STONE_RAMP[2]);
    fillRect(grid, 24, 13, 3, 5, STONE_RAMP[2]);
    fillRect(grid, 4, 10, 24, 3, WOOD_RAMP[2]); // oak seat
    fillRect(grid, 5, 6, 22, 3, WOOD_RAMP[1]); // backrest
    fillRect(grid, 6, 9, 2, 4, WOOD_RAMP[0]);
    fillRect(grid, 24, 9, 2, 4, WOOD_RAMP[0]);
    return sprite(grid, 16, 18);
  });
}

function waterPumpSprite() {
  return once('dec|waterPump', () => {
    const grid = makeGrid(28, 28);
    fillRect(grid, 5, 17, 13, 7, STONE_RAMP[2]); // stone trough
    fillRect(grid, 7, 18, 9, 3, '#4fa6e8'); // cool water inside
    fillRect(grid, 20, 9, 3, 15, '#525c6e'); // cast-iron pump column
    fillRect(grid, 16, 12, 4, 2, '#6d788a'); // spout
    fillRect(grid, 16, 14, 1, 4, '#7fd6ff'); // trickling water stream
    drawLine(grid, 22, 10, 26, 6, '#3a4252'); // pump handle
    return sprite(grid, 15, 25);
  });
}

function mailboxSprite() {
  return once('dec|mailbox', () => {
    const grid = makeGrid(16, 24);
    fillRect(grid, 7, 12, 2, 10, WOOD_RAMP[1]);
    fillBall(grid, 8, 9, 4.5, 3, ['#305a8e', '#467ac0', '#6ea4e8']);
    fillRect(grid, 5, 9, 6, 3, '#467ac0');
    dot(grid, 11, 7, '#e83b48'); // little red flag
    dot(grid, 11, 8, '#e83b48');
    fillRect(grid, 7, 10, 2, 1, '#ffffff');
    return sprite(grid, 8, 22);
  });
}

function mushroomRingSprite() {
  return once('dec|mushroomRing', () => {
    const grid = makeGrid(24, 18);
    for (const [mx, my, col] of [[6, 11, '#a86428'], [12, 9, '#d89a28'], [17, 12, '#8c4c1c'], [9, 13, '#e8b83a']]) {
      fillRect(grid, mx, my + 2, 2, 3, '#f2ead8');
      fillEllipse(grid, mx + 1, my + 1, 2.5, 1.5, col);
    }
    return sprite(grid, 12, 15);
  });
}

function fallenLeafPileSprite() {
  return once('dec|fallenLeafPile', () => {
    const grid = makeGrid(26, 16);
    fillEllipse(grid, 13, 9, 10, 4.5, '#b85a1c');
    fillEllipse(grid, 13, 8, 7, 3, '#e07a24');
    for (const [lx, ly, c] of [[8, 8, '#ffd23f'], [14, 7, '#c83228'], [17, 9, '#ffd23f'], [11, 10, '#e89628']]) {
      fillRect(grid, lx, ly, 2, 1, c);
    }
    return sprite(grid, 13, 12, '#6b3214');
  });
}

function reedNestSprite() {
  return once('dec|reedNest', () => {
    const grid = makeGrid(24, 18);
    fillEllipse(grid, 12, 12, 8.5, 4, '#a6823c');
    fillEllipse(grid, 12, 11, 6, 2.5, '#6b4e1e');
    dot(grid, 10, 11, '#f4f8ff'); // speckled bird eggs
    dot(grid, 13, 10, '#dce8f6');
    dot(grid, 14, 12, '#f4f8ff');
    drawLine(grid, 5, 13, 4, 4, LEAF_RAMP[2]); // flanking reeds
    drawLine(grid, 19, 13, 20, 5, LEAF_RAMP[2]);
    return sprite(grid, 12, 15);
  });
}

function anthillSprite() {
  return once('dec|anthill', () => {
    const grid = makeGrid(26, 20);
    fillTriangle(grid, [4, 16], [13, 5], [22, 16], () => '#8c5628');
    fillTriangle(grid, [7, 16], [13, 7], [19, 16], () => '#a86c36');
    dot(grid, 13, 6, '#3a2210');
    dot(grid, 10, 12, '#1c1726'); // foraging ants
    dot(grid, 15, 13, '#1c1726');
    dot(grid, 12, 15, '#1c1726');
    return sprite(grid, 13, 17);
  });
}

// ---------- 7. Harvestable Fruit Trees, Vineyards & Patches (14) ----------

const FRUIT_POINTS = [[10, 14], [22, 12], [16, 18], [8, 22], [25, 21], [15, 8], [19, 25], [12, 24]];

function fruitTreeSprite(key, fruitCol, hiCol, ramp, harvested = false) {
  return once(`dec|fruitTree|${key}|${harvested ? 1 : 0}`, () => {
    const grid = makeGrid(34, 44);
    fillRect(grid, 15, 25, 4, 17, WOOD_RAMP[1]); // trunk
    fillRect(grid, 16, 26, 1, 15, WOOD_RAMP[2]);
    fillRect(grid, 13, 40, 8, 2, WOOD_RAMP[0]); // exposed roots
    fillBall(grid, 17, 17, 13, 12, ramp, { ambient: 0.28 }); // main leafy canopy
    fillBall(grid, 11, 20, 7, 7, ramp, { ambient: 0.25 });
    fillBall(grid, 23, 20, 7, 7, ramp, { ambient: 0.25 });
    if (!harvested) {
      for (const [fx, fy] of FRUIT_POINTS) {
        fillRect(grid, fx, fy, 3, 3, fruitCol);
        dot(grid, fx, fy, hiCol);
      }
    }
    return sprite(grid, 17, 42);
  });
}

function coconutPalmSprite(harvested = false) {
  return once(`dec|palm|${harvested ? 1 : 0}`, () => {
    const grid = makeGrid(34, 46);
    drawLine(grid, 14, 42, 18, 28, WOOD_RAMP[1]); // curved palm trunk
    drawLine(grid, 15, 42, 19, 28, WOOD_RAMP[2]);
    drawLine(grid, 18, 28, 20, 14, WOOD_RAMP[2]);
    drawLine(grid, 19, 28, 21, 14, WOOD_RAMP[3]);
    for (const [tx, ty] of [[4, 15], [7, 8], [18, 5], [30, 9], [31, 17], [10, 21], [27, 22]]) {
      drawLine(grid, 20, 13, tx, ty, LIGHT_LEAF_RAMP[2]);
      drawLine(grid, 20, 14, tx, ty + 1, LEAF_RAMP[2]);
    }
    if (!harvested) {
      for (const [cx, cy] of [[18, 15], [21, 16], [19, 17]]) {
        fillRect(grid, cx, cy, 3, 3, '#6b4228');
        dot(grid, cx, cy, '#9c6844');
      }
    }
    return sprite(grid, 16, 43);
  });
}

function grapeVineSprite(harvested = false) {
  return once(`dec|vine|${harvested ? 1 : 0}`, () => {
    const grid = makeGrid(32, 30);
    fillRect(grid, 4, 8, 2, 19, WOOD_RAMP[1]); // wooden trellis posts
    fillRect(grid, 26, 8, 2, 19, WOOD_RAMP[1]);
    fillRect(grid, 4, 10, 24, 2, WOOD_RAMP[2]);
    fillRect(grid, 4, 17, 24, 2, WOOD_RAMP[2]);
    fillBall(grid, 16, 12, 11, 5, LEAF_RAMP, { ambient: 0.3 });
    if (!harvested) {
      for (const gx of [9, 15, 21]) {
        fillRect(grid, gx, 14, 3, 4, '#6e2898');
        dot(grid, gx + 1, 18, '#541c78');
        dot(grid, gx, 15, '#a864e0');
      }
    }
    return sprite(grid, 16, 27);
  });
}

function pumpkinPatchSprite(harvested = false) {
  return once(`dec|pumpkins|${harvested ? 1 : 0}`, () => {
    const grid = makeGrid(30, 20);
    fillEllipse(grid, 15, 11, 11, 6, '#385826');
    drawLine(grid, 6, 11, 24, 9, '#4c9436');
    if (!harvested) {
      for (const [px, py] of [[9, 11], [17, 9], [22, 13]]) {
        fillBall(grid, px, py, 3.5, 3, ['#b84a14', '#e87020', '#ffb040']);
        dot(grid, px, py - 3, '#387628');
      }
    }
    return sprite(grid, 15, 16);
  });
}

function melonPatchSprite(harvested = false) {
  return once(`dec|melons|${harvested ? 1 : 0}`, () => {
    const grid = makeGrid(30, 20);
    fillEllipse(grid, 15, 11, 11, 6, '#385826');
    drawLine(grid, 7, 9, 23, 13, '#4c9436');
    if (!harvested) {
      for (const [mx, my] of [[10, 12], [19, 10]]) {
        fillBall(grid, mx, my, 4, 3, ['#1e5a24', '#388e36', '#6ed85a']);
        fillRect(grid, mx - 1, my - 2, 1, 4, '#143c18');
        fillRect(grid, mx + 2, my - 2, 1, 4, '#143c18');
      }
    }
    return sprite(grid, 15, 16);
  });
}

function strawberryPatchSprite(harvested = false) {
  return once(`dec|strawberries|${harvested ? 1 : 0}`, () => {
    const grid = makeGrid(28, 18);
    fillEllipse(grid, 14, 10, 10, 5.5, '#3b7c34');
    fillEllipse(grid, 14, 9, 8, 4, '#56a844');
    if (!harvested) {
      for (const [sx, sy] of [[8, 9], [13, 8], [18, 10], [11, 12], [20, 8]]) {
        fillRect(grid, sx, sy, 2, 2, '#e82442');
        dot(grid, sx, sy, '#ffd8e0');
      }
    }
    return sprite(grid, 14, 14);
  });
}

const DECOR_BUILDERS = {
  // Bushes (10)
  bushHeart: () => bushHeartSprite(),
  bushSpiral: () => bushSpiralSprite(),
  bushSword: () => bushSwordSprite(),
  bushCrown: () => bushCrownSprite(),
  bushDragon: () => bushDragonSprite(),
  bushBerry: () => bushBerrySprite('#e83b48', 'red'),
  bushBerryBlue: () => bushBerrySprite('#4a7cff', 'blue'),
  bushRose: () => bushRoseSprite(),
  bushHydrangea: () => bushHydrangeaSprite(),
  bushBamboo: (blink) => bushBambooSprite(blink),
  // Weapons (8)
  crossedHalberds: () => crossedHalberdsSprite(),
  knightArmorStand: () => knightArmorStandSprite(),
  archeryTarget: () => archeryTargetSprite(),
  shieldPedestal: () => shieldPedestalSprite(),
  greatswordStone: () => greatswordStoneSprite(),
  warDrums: () => warDrumsSprite(),
  anvilHammer: () => anvilHammerSprite(),
  cannonDisplay: () => cannonDisplaySprite(),
  // Flowers (10)
  roseBush: () => paintFlowerBedBox('#e8324c', '#ffffff', '#ff6fa8', 'roseBed'),
  lavenderRow: () => paintFlowerBedBox('#8a5ad6', '#b48cff', '#a066ff', 'lavender'),
  sunflowerPatch: () => sunflowerPatchSprite(),
  tulipBed: () => paintFlowerBedBox('#e83b48', '#ffd23f', '#ff8c2b', 'tulips'),
  bluebells: () => paintFlowerBedBox('#4a90ff', '#7fd6ff', '#2f5fa0', 'bluebells'),
  poppies: () => paintFlowerBedBox('#e83232', '#ff5a4a', '#c82020', 'poppies'),
  moonflower: (blink) => moonflowerSprite(blink),
  cactusFlower: () => cactusFlowerSprite(),
  hibiscusBush: () => paintFlowerBedBox('#ff5a78', '#ff9a62', '#ffd23f', 'hibiscus'),
  waterReed: (blink) => waterReedSprite(blink),
  // Greenery (6)
  fernCluster: () => fernClusterSprite(),
  mossyLog: () => mossyLogSprite(),
  reedTuft: (blink) => waterReedSprite(blink),
  cloverPatch: () => cloverPatchSprite(),
  bambooShoot: (blink) => bushBambooSprite(blink),
  hedgeRow: () => hedgeRowSprite(),
  // Holes & Burrows (6)
  rabbitBurrow: (blink) => rabbitBurrowSprite(blink),
  foxDen: () => foxDenSprite(),
  badgerHole: () => badgerHoleSprite(),
  hollowStump: () => hollowStumpSprite(),
  groundPuddle: (blink) => groundPuddleSprite(blink),
  craterPit: () => craterPitSprite(),
  // Authentic Real-Life Elements (16)
  hayBale: () => hayBaleSprite(),
  woodPile: () => woodPileSprite(),
  laundryLine: (blink) => laundryLineSprite(blink),
  beehive: (blink) => beehiveSprite(blink),
  fishingGear: () => fishingGearSprite(),
  doghouse: () => doghouseSprite(),
  birdhouse: (blink) => birdhouseSprite(blink),
  milkChurns: () => milkChurnsSprite(),
  picnicBlanket: () => picnicBlanketSprite(),
  stoneBench: () => stoneBenchSprite(),
  waterPump: () => waterPumpSprite(),
  mailbox: () => mailboxSprite(),
  mushroomRing: () => mushroomRingSprite(),
  fallenLeafPile: () => fallenLeafPileSprite(),
  reedNest: () => reedNestSprite(),
  anthill: () => anthillSprite(),
  // Harvestable Fruit Trees, Vineyards & Patches (14)
  appleTree: (_b, h) => fruitTreeSprite('apple', '#e82828', '#ff9a9a', LEAF_RAMP, h),
  pearTree: (_b, h) => fruitTreeSprite('pear', '#c8d640', '#fff498', LIGHT_LEAF_RAMP, h),
  cherryTree: (_b, h) => fruitTreeSprite('cherry', '#c81c36', '#ff8aa8', ['#8e2c4a', '#c85076', '#f282a4', '#ffb8ce'], h),
  orangeTree: (_b, h) => fruitTreeSprite('orange', '#ff8c20', '#ffd85a', LEAF_RAMP, h),
  peachTree: (_b, h) => fruitTreeSprite('peach', '#ff7a6a', '#ffd2a8', LIGHT_LEAF_RAMP, h),
  plumTree: (_b, h) => fruitTreeSprite('plum', '#682ca8', '#b88cff', LEAF_RAMP, h),
  lemonTree: (_b, h) => fruitTreeSprite('lemon', '#ffd23f', '#ffffff', LIGHT_LEAF_RAMP, h),
  figTree: (_b, h) => fruitTreeSprite('fig', '#582864', '#9e68ac', LEAF_RAMP, h),
  oliveTree: (_b, h) => fruitTreeSprite('olive', '#5e8836', '#a8d078', ['#465e3a', '#648254', '#86a874', '#a8c898'], h),
  coconutPalm: (_b, h) => coconutPalmSprite(h),
  grapeVine: (_b, h) => grapeVineSprite(h),
  pumpkinPatch: (_b, h) => pumpkinPatchSprite(h),
  melonPatch: (_b, h) => melonPatchSprite(h),
  strawberryPatch: (_b, h) => strawberryPatchSprite(h),
};

export function decorSprite(kind, time = 0, harvested = false) {
  const fn = DECOR_BUILDERS[kind];
  if (!fn) return null;
  const blink = Math.floor(time * 2) % 2;
  return fn(blink, harvested);
}

export function decorLightSpec(kind) {
  if (kind === 'moonflower') return { radius: 28, cold: true };
  return null;
}
