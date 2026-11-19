import { makeGrid, dot, fillRect, fillEllipse, fillBall, toneOf, drawLine, drawPicture, randomOf, addOutline, toCanvas, once, fillTriangle } from './pixels';
import { OUTLINE, WOOD, WOOD_RAMP, STONE_RAMP, ROOF_RAMPS, darker, lighter } from './palette';
import { paintBeam, paintTiledRoof, paintStoneMasonry, paintDoorway, paintArchedWindow, paintSignBoard } from './props';

// The buildings and the things of the new world: the guild, the tents of the bandits, the titanic tower of the
// demon, the old watchtower, the mines, the riddles, the furniture of the home...
// Each one is a sprite { canvas, ax, ay }: (ax, ay) touches the ground (the bottom-left of its tiles for the
// big ones, see scene.js).

function sprite(grid, ax, ay, outline = OUTLINE) {
  return { canvas: toCanvas(addOutline(grid, outline)), ax: ax, ay: ay };
}

// Bricks: rows offset like a real wall, lit on the top.
function paintBricks(grid, x, y, w, h, ramp, salt) {
  for (let row = y; row < y + h; row++) {
    for (let column = x; column < x + w; column++) {
      const offset = Math.floor((row - y) / 4) % 2 ? 4 : 0;
      const isMortar = (row - y) % 4 === 3 || (column - x + offset) % 8 === 7;
      dot(grid, column, row, isMortar ? ramp[0] : toneOf(ramp, 0.6 - ((row - y) % 4) * 0.08 + randomOf(column, row, salt) * 0.12, column, row));
    }
  }
}

// ---------- The guild of adventurers: 13 x 9 tiles (208 x 144 + peak), blue roof and banner ----------

export function guildSprite() {
  return once('guild', () => {
    const W = 208;
    const H = 168;
    const grid = makeGrid(W, H);
    const roof = ROOF_RAMPS.blue;

    paintTiledRoof(grid, 0, 24, W, 62, roof, 0.44);
    // Central wooden gable over the entrance
    fillTriangle(grid, [68, 86], [96, 36], [124, 86], (x, y) => toneOf(WOOD_RAMP, 0.52 - (x - 96) * 0.008, x, y));
    fillTriangle(grid, [73, 86], [96, 42], [119, 86], () => '#e6d3ad');
    paintBeam(grid, 94, 42, 4, 44);
    paintBeam(grid, 73, 66, 46, 3);
    // Waving red guild banner on top
    fillRect(grid, 94, 0, 4, 38, WOOD.dark);
    fillRect(grid, 98, 2, 22, 12, '#d0202a');
    fillTriangle(grid, [116, 2], [124, 8], [116, 14], () => '#d0202a');
    drawLine(grid, 102, 5, 113, 11, '#ffd23f');
    drawLine(grid, 113, 5, 102, 11, '#ffd23f');

    // Stone masonry walls (y = 86..168)
    paintStoneMasonry(grid, 4, 86, W - 8, H - 86, STONE_RAMP, 60);
    paintBeam(grid, 3, 86, W - 6, 4);
    paintBeam(grid, 3, 122, W - 6, 3);
    fillRect(grid, 3, H - 8, W - 6, 8, STONE_RAMP[2]);
    fillRect(grid, 3, H - 8, W - 6, 2, STONE_RAMP[4]);

    for (const wx of [18, 42, 146, 174]) {
      paintArchedWindow(grid, wx, 96, 14, 16, ['#2f5f8f', '#5a9fd6', '#e6f6ff']);
      paintArchedWindow(grid, wx, 134, 14, 16, ['#2f5f8f', '#5a9fd6', '#e6f6ff']);
    }
    for (const bx of [66, 120]) {
      fillRect(grid, bx, 128, 7, 16, '#d0202a');
      fillTriangle(grid, [bx, 144], [bx + 3.5, 149], [bx + 7, 144], () => '#d0202a');
      fillRect(grid, bx + 2, 132, 3, 5, '#ffd23f');
    }

    paintDoorway(grid, 96, H, { doubleDoor: true, style: 'stone' });
    paintSignBoard(grid, 96, 108, 'guild');
    return sprite(grid, 0, H);
  });
}

// ---------- Churches, Windmills, and Royal Palaces ----------

// Church: 11 x 9 tiles (176 x 144 footprint + 32px bell tower = 176 x 176)
export function churchSprite(house) {
  const roofKey = house.roof || 'blue';
  return once('church|' + roofKey, () => {
    const W = 176;
    const H = 176;
    const grid = makeGrid(W, H);
    const roof = ROOF_RAMPS[roofKey] || ROOF_RAMPS.blue;

    // Sloped nave roofs on left and right
    paintTiledRoof(grid, 2, 68, W - 4, 38, roof, 0.35);

    // Tall central bell tower & steeple
    paintStoneMasonry(grid, 64, 34, 42, 72, STONE_RAMP, 61);
    fillTriangle(grid, [58, 36], [85, 6], [112, 36], (x, y) => toneOf(roof, 0.85 - (x - 58) * 0.012, x, y));
    fillRect(grid, 84, 0, 2, 9, '#ffd23f');
    fillRect(grid, 81, 3, 8, 2, '#ffd23f');
    // Belfry arch with golden church bell
    fillRect(grid, 75, 42, 20, 22, '#1c1726');
    fillEllipse(grid, 85, 43, 10, 5, '#1c1726');
    fillTriangle(grid, [79, 58], [85, 46], [91, 58], (x, y) => toneOf(['#8a6a12', '#c9961e', '#ffd23f', '#fff2a8'], 0.85 - (x - 79) * 0.06, x, y));
    fillRect(grid, 78, 57, 14, 3, '#c9961e');
    // Stained-glass rose window
    fillEllipse(grid, 85, 82, 10, 10, STONE_RAMP[0]);
    fillEllipse(grid, 85, 82, 8, 8, '#4aa0ff');
    fillEllipse(grid, 85, 82, 5, 5, '#ff5a7a');
    fillEllipse(grid, 85, 82, 2.5, 2.5, '#ffd23f');
    fillRect(grid, 84, 73, 2, 18, STONE_RAMP[1]);
    fillRect(grid, 76, 81, 18, 2, STONE_RAMP[1]);

    // Stone nave facade & buttresses
    paintStoneMasonry(grid, 4, 106, W - 8, H - 106, STONE_RAMP, 62);
    for (const bx of [4, 52, 114, 166]) fillRect(grid, bx, 104, 6, H - 104, STONE_RAMP[2]);
    fillRect(grid, 3, H - 8, W - 6, 8, STONE_RAMP[2]);
    fillRect(grid, 3, H - 8, W - 6, 2, STONE_RAMP[4]);

    // Stained-glass arched nave windows
    for (const [wx, color] of [[15, '#4aa0ff'], [34, '#ff5a7a'], [126, '#b48cff'], [145, '#ffd23f']]) {
      paintArchedWindow(grid, wx, 122, 13, 26, ['#1c1726', color, '#ffffff']);
    }

    // Grand arched double doors aligned to doorOf tiles 4 & 5 (cx = 80)
    paintDoorway(grid, 82, H, { doubleDoor: true, style: 'stone' });
    return sprite(grid, 0, H);
  });
}

// Windmill tower body: 8 x 8 tiles (128 x 128 footprint + roof = 128 x 160), drawn separately so sails rotate cleanly.
export function millBodySprite(house) {
  const roofKey = house.roof || 'red';
  return once('millBody|' + roofKey, () => {
    const W = 128;
    const H = 160;
    const grid = makeGrid(W, H);
    const roof = ROOF_RAMPS[roofKey] || ROOF_RAMPS.red;

    // Tapered round stone tower
    for (let y = 54; y < H; y++) {
      const half = Math.round(28 + ((y - 54) / (H - 54)) * 15);
      for (let x = 64 - half; x < 64 + half; x++) {
        const band = Math.floor(y / 6) % 2 ? 5 : 0;
        const mortar = y % 6 === 5 || (x + band) % 10 === 9;
        const shade = 0.78 - Math.abs(x - 54) / (half * 2.2) + randomOf(x, y, 63) * 0.08;
        dot(grid, x, y, mortar ? STONE_RAMP[1] : toneOf(STONE_RAMP, shade, x, y));
      }
    }
    paintBeam(grid, 28, 108, 72, 4);
    fillRect(grid, 20, H - 6, 88, 6, STONE_RAMP[2]);

    // Conical shingled roof
    fillTriangle(grid, [26, 56], [64, 20], [102, 56], (x, y) => toneOf(roof, 0.85 - (x - 26) * 0.008 - ((y % 4) * 0.06), x, y));
    fillRect(grid, 63, 14, 2, 8, '#ffd23f');

    // Upper window & door aligned to doorOf tile 4 (cx = 68)
    paintArchedWindow(grid, 58, 78, 12, 14, ['#2a1c16', '#ffd36b', '#fff6d0']);
    paintDoorway(grid, 68, H, { doubleDoor: false, style: 'stone' });
    fillBall(grid, 38, H - 6, 6, 5, ['#8a6a3a', '#c9a86a', '#e8d49a']);
    fillBall(grid, 48, H - 5, 5, 4, ['#8a6a3a', '#c9a86a', '#e8d49a']);
    fillBall(grid, 64, 58, 4, 4, WOOD_RAMP);
    return sprite(grid, 0, H);
  });
}

// Rotating 4-frame pixel-art windmill sails (centered around hub at 56, 56).
export function millSailsSprite(frame = 0) {
  const f = frame % 4;
  return once('millSails|' + f, () => {
    const grid = makeGrid(112, 112);
    const hub = 56;
    const baseAngle = (f * Math.PI) / 8 + Math.PI / 4; // 45° + 22.5° steps (4 frames cover full 90° cycle cleanly)
    for (let arm = 0; arm < 4; arm++) {
      const a = baseAngle + (arm * Math.PI) / 2;
      const dx = Math.cos(a);
      const dy = Math.sin(a);
      const nx = -dy;
      const ny = dx;
      for (let t = 4; t <= 48; t++) {
        const px = Math.round(hub + dx * t);
        const py = Math.round(hub + dy * t);
        fillRect(grid, px - 1, py - 1, 2, 2, WOOD.dark);
        dot(grid, px, py, WOOD.light);
        if (t >= 12 && t <= 44) {
          for (let w = 2; w <= 9; w++) {
            const cx = Math.round(px + nx * w);
            const cy = Math.round(py + ny * w);
            const isFrame = t === 12 || t === 44 || t % 8 === 0 || w === 2 || w === 9;
            dot(grid, cx, cy, isFrame ? WOOD.base : '#f4ebd6');
          }
        }
      }
    }
    fillBall(grid, hub, hub, 4.5, 4.5, WOOD_RAMP);
    return sprite(grid, hub, hub);
  });
}

// Windmill with default sails (kept for compatibility).
export function millSprite(house) {
  return millBodySprite(house);
}

// Royal Palace: 26 x 16 tiles (416 x 256 footprint + 24px spires = 416 x 280)
export function palaceSprite(house) {
  const roofKey = house.roof || 'red';
  return once('palace|' + roofKey, () => {
    const W = 416;
    const H = 280;
    const grid = makeGrid(W, H);
    const roof = ROOF_RAMPS[roofKey] || ROOF_RAMPS.red;
    const bannerColor = roof[3];

    // Wing roofs behind battlements
    paintTiledRoof(grid, 36, 62, 112, 42, roof, 0.35);
    paintTiledRoof(grid, 268, 62, 112, 42, roof, 0.35);

    // 4 flanking towers (outer left/right, inner left/right)
    const towers = [
      [8, 52, 46, 228, 18],
      [130, 42, 38, 238, 12],
      [248, 42, 38, 238, 12],
      [362, 52, 46, 228, 18],
    ];
    for (const [tx, ty, tw, th, peakH] of towers) {
      paintStoneMasonry(grid, tx, ty, tw, th, STONE_RAMP, 64);
      fillTriangle(grid, [tx - 4, ty + 4], [tx + Math.floor(tw / 2), ty - peakH], [tx + tw + 4, ty + 4], (x, y) => toneOf(roof, 0.86 - (x - tx) * 0.015, x, y));
      fillRect(grid, tx + Math.floor(tw / 2) - 1, ty - peakH - 12, 2, 12, '#ffd23f');
      fillRect(grid, tx + Math.floor(tw / 2) + 1, ty - peakH - 11, 10, 6, bannerColor);
      paintArchedWindow(grid, tx + Math.floor(tw / 2) - 6, ty + 32, 12, 18, ['#2f5f8f', '#8cc5ee', '#ffffff']);
      paintArchedWindow(grid, tx + Math.floor(tw / 2) - 6, ty + 90, 12, 18, ['#2f5f8f', '#8cc5ee', '#ffffff']);
    }

    // Side wing walls & battlements
    for (const [wx, ww] of [[54, 78], [284, 78]]) {
      paintStoneMasonry(grid, wx, 96, ww, H - 96, STONE_RAMP, 65);
      for (let x = wx; x < wx + ww; x += 10) fillRect(grid, x, 88, 6, 8, STONE_RAMP[4]);
      for (const ox of [14, 48]) {
        paintArchedWindow(grid, wx + ox, 118, 13, 20, ['#2f5f8f', '#8cc5ee', '#ffffff']);
        paintArchedWindow(grid, wx + ox, 162, 13, 20, ['#2f5f8f', '#8cc5ee', '#ffffff']);
      }
    }

    // Grand central throne hall
    paintTiledRoof(grid, 144, 24, 128, 64, roof, 0.45);
    paintStoneMasonry(grid, 152, 88, 112, H - 88, STONE_RAMP, 66);
    fillRect(grid, 198, 92, 20, 12, '#ffd23f'); // royal crest
    fillRect(grid, 202, 95, 12, 6, bannerColor);
    for (const wx of [164, 200, 236]) paintArchedWindow(grid, wx, 120, 16, 28, ['#2f5f8f', '#8cc5ee', '#ffffff']);

    // Lower colonnade & arched portico
    fillRect(grid, 44, 204, 328, 72, STONE_RAMP[3]);
    fillRect(grid, 44, 202, 328, 4, STONE_RAMP[5]);
    for (let cx = 54; cx <= 354; cx += 24) {
      if (Math.abs(cx - 208) < 28) continue;
      fillRect(grid, cx + 8, 214, 12, 54, '#1c1726');
      fillEllipse(grid, cx + 14, 215, 6, 4, '#1c1726');
      fillRect(grid, cx, 206, 6, 66, STONE_RAMP[4]);
      fillRect(grid, cx + 4, 206, 2, 66, STONE_RAMP[2]);
    }
    // Royal banners beside entrance
    for (const bx of [166, 240]) {
      fillRect(grid, bx, 208, 10, 34, bannerColor);
      fillTriangle(grid, [bx, 242], [bx + 5, 250], [bx + 10, 242], () => bannerColor);
      fillRect(grid, bx + 3, 214, 4, 16, '#ffd23f');
    }

    // Wide marble staircase & grand gilded double doors (centered on 208)
    for (let step = 0; step < 3; step++) fillRect(grid, 174 - step * 4, H - 10 + step * 3, 68 + step * 8, 4, STONE_RAMP[4 - step]);
    paintDoorway(grid, 208, H - 10, { doubleDoor: true, style: 'stone' });

    return sprite(grid, 0, H);
  });
}

// ---------- The camps of the bandits and the villages of the monsters ----------

export function tent(isBig, look = 'bandit', w = null, h = null) {
  const key = ['tent', Boolean(isBig), look, w || '', h || ''].join('|');
  return once(key, () => {
    const width = w ? (w <= 2 ? 48 : w * 16) : (isBig ? 160 : 96);
    const height = h ? (h <= 2 ? 34 : h * 16) : (isBig ? 96 : 64);
    const ax = w && w <= 2 ? Math.floor(width / 2) : 0;
    const ay = w && w <= 2 ? height - 1 : height;
    const grid = makeGrid(width, height);
    const isMonster = look === 'monster';
    const cloth = isMonster
      ? ['#241918', '#382724', '#4e3732', '#664a42']
      : isBig
        ? ['#4e1218', '#701c24', '#942830', '#b83c42']
        : ['#5e3e22', '#825832', '#a67242', '#c88e54'];

    const topY = isBig ? 12 : 8;
    const cx = Math.floor(width / 2);
    // Main tent body
    fillTriangle(grid, [2, height - 3], [cx, topY], [width - 3, height - 3], (x, y) => {
      const stripe = !isMonster && !isBig && Math.abs(x - cx) < Math.max(4, Math.round(width * 0.08));
      const shade = (x < cx ? 0.78 : 0.36) - ((y - topY) / height) * 0.14;
      return stripe ? '#942830' : toneOf(cloth, shade, x, y);
    });
    if (isBig) {
      fillTriangle(grid, [0, height - 3], [Math.round(width * 0.25), topY + 12], [Math.round(width * 0.4), height - 3], (x) => toneOf(cloth, 0.7, x, 0));
      fillTriangle(grid, [width - 1, height - 3], [Math.round(width * 0.75), topY + 12], [Math.round(width * 0.6), height - 3], (x) => toneOf(cloth, 0.3, x, 0));
    }

    // Wooden ridge pole & corner stakes
    fillRect(grid, cx - 1, 0, 2, topY + 4, WOOD.dark);
    if (isMonster) {
      for (const sx of [Math.round(width * 0.22), Math.round(width * 0.78)]) drawLine(grid, sx, topY + 16, sx + (sx < cx ? -8 : 8), topY + 4, '#d8d0c0');
      fillEllipse(grid, cx, Math.round(height * 0.45), 4, 3, '#ece5d6'); // bone skull trophy
      dot(grid, cx - 2, Math.round(height * 0.45), '#d0202a');
      dot(grid, cx + 2, Math.round(height * 0.45), '#d0202a');
    } else if (isBig) {
      fillRect(grid, cx + 1, 0, 14, 7, '#d0202a');
      fillRect(grid, cx + 3, 2, 8, 2, '#ffd23f');
    }

    const doorHalf = Math.max(6, Math.round(width * 0.12));
    fillTriangle(grid, [cx - doorHalf, height - 1], [cx, Math.round(height * 0.46)], [cx + doorHalf, height - 1], () => '#161018');
    fillRect(grid, 2, height - 4, 3, 4, WOOD.dark);
    fillRect(grid, width - 5, height - 4, 3, 4, WOOD.dark);
    return sprite(grid, ax, ay);
  });
}

export function banner(color) {
  return once('banner' + color, () => {
    const grid = makeGrid(10, 30);
    fillRect(grid, 4, 0, 2, 30, WOOD.dark);
    fillRect(grid, 0, 2, 10, 16, color);
    fillTriangle(grid, [0, 18], [5, 23], [10, 18], () => color);
    fillRect(grid, 2, 6, 6, 1, lighter(color));
    fillRect(grid, 4, 9, 2, 5, darker(color));
    return sprite(grid, 5, 29);
  });
}

// ---------- The titanic tower of the Demon King, standing on his keep ----------

export function demonSpire(frame) {
  return once('spire' + frame, () => {
    const grid = makeGrid(128, 210);
    const stone = ['#140a0e', '#24121a', '#341a24', '#46222e', '#58303c'];
    const body = (y) => 34 - Math.round(y * 0.07);
    for (let y = 30; y < 210; y++) {
      const half = body(y - 30);
      for (let x = 64 - half; x < 64 + half; x++) dot(grid, x, y, toneOf(stone, 0.65 - (x - 64 + half) / (half * 3) + randomOf(x, y, 61) * 0.1, x, y));
    }
    for (let y = 40; y < 200; y += 22) fillRect(grid, 64 - body(y - 30), y, body(y - 30) * 2, 2, stone[0]); // the floors
    fillTriangle(grid, [30, 34], [64, 0], [98, 34], (x, y) => toneOf(stone, 0.8 - x / 200, x, y)); // the pointed roof
    for (const [x, y] of [[50, 70], [74, 70], [56, 120], [68, 120], [62, 165]]) {
      fillRect(grid, x, y, 6, 10, frame ? '#ff6a2b' : '#ffb040'); // windows of fire
      fillRect(grid, x + 2, y, 2, 10, '#ffe066');
    }
    fillBall(grid, 64, 18, 4, 4, ['#7a0010', '#d0202a', '#ff6a6a']); // the red eye on the top
    for (const side of [-1, 1]) {
      for (let i = 0; i < 4; i++) {
        const x = 64 + side * (24 + i * 8);
        fillTriangle(grid, [x - 4, 120 + i * 18], [x, 96 + i * 18], [x + 4, 120 + i * 18], () => stone[2]); // spikes
      }
    }
    return sprite(grid, 0, 210, '#000000');
  });
}

// ---------- The old watchtower ----------

export function watchtower() {
  return once('watchtower', () => {
    const grid = makeGrid(112, 176);
    for (let y = 40; y < 176; y++) {
      const half = 40 - Math.round((176 - y) * 0.06);
      for (let x = 56 - half; x < 56 + half; x++) {
        const offset = Math.floor(y / 5) % 2 ? 5 : 0;
        const isMortar = y % 5 === 4 || (x + offset) % 10 === 9;
        const light = 0.75 - Math.abs(x - 46) / (half * 2.2);
        dot(grid, x, y, isMortar ? STONE_RAMP[1] : toneOf(STONE_RAMP, light + randomOf(x, y, 62) * 0.08, x, y));
      }
    }
    for (let x = 14; x < 98; x += 10) fillRect(grid, x, 32, 6, 8, STONE_RAMP[3]); // the battlements
    fillRect(grid, 12, 38, 88, 4, STONE_RAMP[2]);
    fillTriangle(grid, [16, 32], [56, 0], [96, 32], (x, y) => toneOf(ROOF_RAMPS.red, 0.8 - x / 160, x, y));
    for (const y of [70, 110]) {
      fillRect(grid, 50, y, 12, 16, '#1c1726');
      fillRect(grid, 52, y + 2, 8, 12, '#ffcf6a');
    }
    fillRect(grid, 46, 150, 20, 26, WOOD_RAMP[1]);
    fillEllipse(grid, 56, 151, 10, 4, WOOD_RAMP[1]);
    return sprite(grid, 0, 176);
  });
}

// ---------- Mines ----------

export function mineFrame() {
  return once('mineFrame', () => {
    const grid = makeGrid(48, 30);
    fillRect(grid, 6, 4, 36, 26, '#0d0b14');
    fillRect(grid, 4, 2, 4, 28, WOOD.dark);
    fillRect(grid, 40, 2, 4, 28, WOOD.dark);
    fillRect(grid, 2, 0, 44, 5, WOOD.base);
    fillRect(grid, 2, 0, 44, 1, WOOD.light);
    for (let x = 12; x < 38; x += 6) fillRect(grid, x, 26, 4, 2, WOOD.dark); // the rails
    fillRect(grid, 10, 25, 28, 1, '#9aa6b8');
    fillRect(grid, 10, 28, 28, 1, '#9aa6b8');
    fillRect(grid, 18, 6, 12, 4, WOOD.light); // the sign
    fillRect(grid, 20, 7, 8, 1, WOOD.deep);
    return sprite(grid, 0, 30);
  });
}

export function minecart() {
  return once('minecart', () => {
    const grid = makeGrid(16, 14);
    fillRect(grid, 1, 2, 14, 8, '#5a5266');
    fillRect(grid, 1, 2, 14, 2, '#7a7286');
    fillBall(grid, 5, 4, 2.5, 2, ['#4a4a4a', '#9aa6b8', '#e8eef7']); // ore in it
    fillBall(grid, 10, 3.5, 2.5, 2, ['#2a4a8a', '#3a7bff', '#bfe6ff']);
    fillBall(grid, 4, 11, 2, 2, ['#1c1726', '#3a3442', '#5a5266']);
    fillBall(grid, 12, 11, 2, 2, ['#1c1726', '#3a3442', '#5a5266']);
    return sprite(grid, 8, 13);
  });
}

// ---------- Ruins and riddles ----------

export function ruinPillar() {
  return once('pillar', () => {
    const grid = makeGrid(14, 34);
    for (let y = 4; y < 31; y++) for (let x = 2; x < 12; x++) dot(grid, x, y, toneOf(STONE_RAMP, 0.75 - x * 0.04 + randomOf(x, y, 63) * 0.1, x, y));
    fillRect(grid, 0, 30, 14, 4, STONE_RAMP[2]);
    fillRect(grid, 1, 2, 12, 3, STONE_RAMP[4]);
    fillRect(grid, 3, 0, 6, 2, STONE_RAMP[3]); // broken top
    for (let y = 8; y < 28; y += 7) fillRect(grid, 4, y, 6, 1, '#5f9a3e'); // moss
    return sprite(grid, 7, 33);
  });
}

// An obelisk with glowing letters: touch it, complete its sentence, it gives a reward. solved: the letters fade.
export function obelisk(solved, frame) {
  return once('obelisk' + solved + frame, () => {
    const grid = makeGrid(14, 36);
    fillTriangle(grid, [2, 8], [7, 0], [12, 8], (x, y) => toneOf(STONE_RAMP, 0.7 - x * 0.03, x, y));
    for (let y = 8; y < 32; y++) for (let x = 2; x < 12; x++) dot(grid, x, y, toneOf(['#2a2838', '#3a3650', '#4c4868', '#5e5a80'], 0.7 - x * 0.04, x, y));
    fillRect(grid, 0, 31, 14, 5, STONE_RAMP[2]);
    const glow = solved ? '#6a6680' : frame ? '#8fd6ff' : '#bfe6ff';
    for (let y = 11; y < 29; y += 4) {
      fillRect(grid, 4, y, 2, 2, glow);
      fillRect(grid, 7, y + 1, 3, 1, glow);
    }
    return sprite(grid, 7, 35);
  });
}

// A small hut of wood in the wild (a hermit lives there).
export function hut() {
  return once('hut', () => {
    const grid = makeGrid(36, 36);
    fillTriangle(grid, [0, 16], [18, 0], [35, 16], (x, y) => toneOf(['#5a4a2a', '#7a6434', '#9a7e44', '#b89a58'], 0.8 - x / 60, x, y));
    for (let y = 16; y < 36; y++) for (let x = 3; x < 33; x++) dot(grid, x, y, toneOf(WOOD_RAMP, 0.6 - ((x - 3) % 6 === 5 ? 0.3 : 0), x, y));
    fillRect(grid, 14, 23, 8, 13, WOOD_RAMP[0]);
    fillRect(grid, 25, 21, 5, 5, '#ffcf6a');
    return sprite(grid, 0, 36);
  });
}

// ---------- The village things ----------

export function well() {
  return once('well', () => {
    const grid = makeGrid(18, 24);
    fillEllipse(grid, 9, 18, 8, 5, STONE_RAMP[2]);
    fillEllipse(grid, 9, 17, 6, 3, '#1b3a6a');
    for (let x = 1; x < 17; x += 4) fillRect(grid, x, 17, 3, 6, STONE_RAMP[3]);
    fillRect(grid, 2, 4, 2, 13, WOOD.dark);
    fillRect(grid, 14, 4, 2, 13, WOOD.dark);
    fillTriangle(grid, [0, 6], [9, 0], [18, 6], () => ROOF_RAMPS.red[3]);
    fillRect(grid, 8, 6, 2, 8, '#9aa6b8'); // the rope and the bucket
    fillRect(grid, 7, 13, 4, 3, WOOD.base);
    return sprite(grid, 9, 23);
  });
}

// A training dummy of straw on a post: the hero can practice a skill there.
export function dummy() {
  return once('dummy', () => {
    const grid = makeGrid(16, 28);
    fillRect(grid, 7, 10, 2, 18, WOOD.dark);
    fillRect(grid, 1, 11, 14, 3, WOOD.base); // the arms
    fillEllipse(grid, 8, 16, 5, 6, '#d6b45a');
    fillBall(grid, 8, 6, 4.5, 4.5, ['#a88a3a', '#d6b45a', '#f2d88a']);
    fillRect(grid, 6, 5, 1, 1, '#1c1726');
    fillRect(grid, 9, 5, 1, 1, '#1c1726');
    drawLine(grid, 4, 14, 12, 18, '#e8423f'); // the target
    fillBall(grid, 8, 16, 2, 2, ['#8a1a1a', '#e8423f', '#ff8a8a']);
    return sprite(grid, 8, 27);
  });
}

export function logs() {
  return once('logs', () => {
    const grid = makeGrid(32, 14);
    for (const [x, y] of [[0, 6], [10, 6], [5, 1], [20, 6]]) {
      fillRect(grid, x, y, 12, 7, WOOD.base);
      fillRect(grid, x, y, 12, 2, WOOD.light);
      fillEllipse(grid, x + 11, y + 3.5, 2, 3.5, '#d6a46a');
    }
    return sprite(grid, 16, 13);
  });
}

// A torch on a wall (inside): only a flame and its iron holder.
export function wallTorch(frame) {
  return once('wallTorch' + frame, () => {
    const grid = makeGrid(8, 14);
    fillRect(grid, 3, 7, 2, 7, '#3a3442');
    const flames = [['..R.', '.ROR', '.OYO', '..Y.'], ['.R..', 'RORO', 'OYO.', '.Y..'], ['..R.', '.ORR', 'ROYO', '.YY.']];
    drawPicture(grid, flames[frame].map((row) => row.padEnd(8, '.').slice(0, 8)), { R: '#e8421c', O: '#ff9a2b', Y: '#ffe066' }, 2, 2);
    return sprite(grid, 4, 13);
  });
}

// The boat between Seabridge and Skyreach Island. frame: it rocks on the waves.
export function boat(frame) {
  return once('boat' + frame, () => {
    const grid = makeGrid(44, 46);
    const lift = frame;
    fillTriangle(grid, [2, 30 + lift], [42, 30 + lift], [36, 42 + lift], (x, y) => toneOf(WOOD_RAMP, 0.6 - (y - 30) * 0.04, x, y));
    fillTriangle(grid, [2, 30 + lift], [36, 42 + lift], [8, 42 + lift], (x, y) => toneOf(WOOD_RAMP, 0.4, x, y));
    fillRect(grid, 20, 2 + lift, 2, 29, WOOD.dark);
    fillTriangle(grid, [22, 4 + lift], [40, 24 + lift], [22, 26 + lift], () => '#f6efe0');
    fillTriangle(grid, [19, 6 + lift], [6, 24 + lift], [19, 26 + lift], () => '#e6dcc8');
    fillRect(grid, 22, 2 + lift, 8, 3, '#e8423f');
    return sprite(grid, 22, 44);
  });
}

// ---------- The puzzles ----------

export function boulder() {
  return once('boulder', () => {
    const grid = makeGrid(16, 16);
    fillBall(grid, 8, 8.5, 7.5, 7, STONE_RAMP, { ambient: 0.2 });
    drawLine(grid, 5, 6, 8, 9, STONE_RAMP[1]);
    return sprite(grid, 8, 15);
  });
}

// A stone plate on the floor (pressed: a boulder is on it).
export function plate(isPressed) {
  return once('plate' + isPressed, () => {
    const grid = makeGrid(14, 14);
    fillRect(grid, 1, 1, 12, 12, isPressed ? '#4a8a4a' : '#6a6685');
    fillRect(grid, 3, 3, 8, 8, isPressed ? '#7cfc9a' : '#8f8ab0');
    drawPicture(grid, ['..W..', '.W.W.', 'W...W', '.W.W.', '..W..'], { W: isPressed ? '#e8ffe8' : '#c8c4e0' }, 5, 5);
    return { canvas: toCanvas(grid), ax: 7, ay: 13 };
  });
}

// A gate of iron bars (closed) across a corridor.
export function bars() {
  return once('bars', () => {
    const grid = makeGrid(16, 22);
    fillRect(grid, 0, 0, 16, 3, '#3a3442');
    for (let x = 1; x < 16; x += 3) fillRect(grid, x, 3, 2, 19, '#7a7286');
    fillRect(grid, 0, 10, 16, 2, '#5a5266');
    return sprite(grid, 8, 21);
  });
}

// A door of stone with runes of light: it opens to a good sentence.
export function wordDoor(frame) {
  return once('wordDoor' + frame, () => {
    const grid = makeGrid(16, 24);
    for (let y = 0; y < 24; y++) for (let x = 0; x < 16; x++) dot(grid, x, y, toneOf(['#2a2840', '#36345a', '#424070', '#4e4c84'], 0.6 - x * 0.02, x, y));
    const glow = frame ? '#ffd23f' : '#ffe98a';
    drawPicture(grid, ['G.G.G', '.GGG.', 'G.G.G', '.....', 'GGGGG', '.....', 'G...G', '.G.G.', '..G..'], { G: glow }, 5, 6);
    return sprite(grid, 8, 23);
  });
}

// ---------- The furniture of the home ----------

export function bed(color = '#d6302f') {
  return once('bed' + color, () => {
    const grid = makeGrid(32, 30);
    fillRect(grid, 1, 2, 30, 26, WOOD.base);
    fillRect(grid, 3, 4, 26, 6, '#f6efe0'); // the pillow
    fillRect(grid, 3, 10, 26, 16, color);
    fillRect(grid, 3, 10, 26, 2, lighter(color));
    fillRect(grid, 1, 0, 30, 3, WOOD.dark);
    return sprite(grid, 0, 30);
  });
}

export function stove(frame) {
  return once('stove' + frame, () => {
    const grid = makeGrid(32, 30);
    paintBricks(grid, 1, 6, 30, 24, STONE_RAMP, 64);
    fillRect(grid, 8, 16, 16, 10, '#1c1418');
    drawPicture(grid, frame ? ['.R.R.', 'ROROR', 'OYOYO'] : ['R.R.R', 'OROR.', 'YOYOY'], { R: '#e8421c', O: '#ff9a2b', Y: '#ffe066' }, 13, 21);
    fillRect(grid, 4, 2, 6, 6, '#3a3442'); // the pot
    fillRect(grid, 20, 0, 4, 8, STONE_RAMP[2]); // the chimney
    return sprite(grid, 0, 30);
  });
}

export function storage() {
  return once('storage', () => {
    const grid = makeGrid(16, 14);
    fillRect(grid, 1, 2, 14, 12, WOOD.base);
    fillRect(grid, 1, 2, 14, 4, WOOD.light);
    fillRect(grid, 1, 6, 14, 1, WOOD.deep);
    fillRect(grid, 7, 5, 2, 3, '#e8b83a');
    return sprite(grid, 8, 13);
  });
}

export function windowOnWall() {
  return once('homeWindow', () => {
    const grid = makeGrid(30, 14);
    fillRect(grid, 0, 0, 30, 14, WOOD.dark);
    fillRect(grid, 2, 2, 12, 10, '#8cc5ee');
    fillRect(grid, 16, 2, 12, 10, '#8cc5ee');
    fillRect(grid, 3, 3, 4, 3, '#e6f6ff');
    return { canvas: toCanvas(grid), ax: 15, ay: 13 };
  });
}

// The furniture the hero can buy and place in the home (see data/furniture.js). color: its main color.
export function furniture(kind, color) {
  return once('furniture' + kind + color, () => {
    const grid = makeGrid(16, 24);
    if (kind === 'table') {
      fillRect(grid, 0, 10, 16, 5, color);
      fillRect(grid, 0, 10, 16, 1, lighter(color));
      fillRect(grid, 1, 15, 2, 8, darker(color));
      fillRect(grid, 13, 15, 2, 8, darker(color));
    } else if (kind === 'chair') {
      fillRect(grid, 3, 6, 10, 3, color);
      fillRect(grid, 3, 14, 10, 3, color);
      fillRect(grid, 3, 6, 2, 17, darker(color));
      fillRect(grid, 11, 14, 2, 9, darker(color));
    } else if (kind === 'plant') {
      fillRect(grid, 4, 17, 8, 7, '#b0603a');
      fillBall(grid, 8, 11, 6, 6, ['#1e5026', '#388434', '#70bc4c', '#97d65e']);
      fillBall(grid, 8, 5, 2, 2, [darker(color), color, lighter(color)]);
    } else if (kind === 'shelf') {
      fillRect(grid, 0, 0, 16, 24, darker(color));
      for (const y of [2, 9, 16]) {
        fillRect(grid, 1, y, 14, 6, '#2a1c16');
        for (let x = 2; x < 14; x += 3) fillRect(grid, x, y + 1, 2, 5, ['#e8423f', '#3a7bff', '#4cc35a', '#ffd23f'][(x + y) % 4]);
      }
    } else if (kind === 'lamp') {
      fillRect(grid, 7, 8, 2, 14, '#3a3442');
      fillRect(grid, 4, 22, 8, 2, '#3a3442');
      fillTriangle(grid, [2, 9], [8, 1], [14, 9], () => color);
      fillRect(grid, 6, 9, 4, 2, '#fff6d0');
    } else if (kind === 'painting') {
      fillRect(grid, 0, 2, 16, 12, WOOD.dark);
      fillRect(grid, 2, 4, 12, 8, '#8cc5ee');
      fillTriangle(grid, [2, 12], [7, 6], [12, 12], () => color);
      fillBall(grid, 11, 6, 1.5, 1.5, ['#ffd23f', '#ffe98a', '#ffffff']);
    } else {
      fillRect(grid, 0, 12, 16, 12, color); // a rug
      fillRect(grid, 2, 14, 12, 8, lighter(color));
      fillRect(grid, 4, 16, 8, 4, color);
    }
    return { canvas: toCanvas(kind === 'rug' ? grid : addOutline(grid, OUTLINE)), ax: 8, ay: 23 };
  });
}

// ---------- The keeps of the castles: their front wall, and turrets on their corners ----------

const KEEP_LOOKS = {
  demon: { stone: ['#140a0e', '#24121a', '#341a24', '#46222e', '#58303c'], window: ['#ff6a2b', '#ffe066'], roof: ['#140a0e', '#24121a', '#341a24', '#46222e'], flag: '#d0202a' },
  ice: { stone: ['#4a6a98', '#5a7aa8', '#6c8cba', '#7f9fcb', '#9dbbe0'], window: ['#8fd6ff', '#e6f6ff'], roof: ['#2a4a78', '#3a5a88', '#4f72a2', '#688ec0'], flag: '#ffd23f' },
  wood: { stone: WOOD_RAMP, window: ['#ffd36b', '#fff6d0'], roof: ROOF_RAMPS.red, flag: '#3a7bff' },
  stone: { stone: STONE_RAMP, window: ['#ffd36b', '#fff6d0'], roof: ROOF_RAMPS.blue, flag: '#ffd23f' },
};

// The front of a keep, `tiles` wide and 8 tiles high: bricks, buttresses, windows that glow, a big arched gate
// in the middle (above the stairs), battlements on the top.
export function keepFacade(look, tiles, frame) {
  return once('keep' + look + tiles + frame, () => {
    const style = KEEP_LOOKS[look] || KEEP_LOOKS.demon;
    const w = tiles * 16;
    const h = 128;
    const grid = makeGrid(w, h);
    paintBricks(grid, 0, 10, w, h - 10, style.stone, 66);
    for (let x = 0; x < w; x += 12) fillRect(grid, x, 2, 7, 9, style.stone[3]); // the battlements
    fillRect(grid, 0, 10, w, 2, style.stone[4]);
    for (let x = 0; x < w; x += 48) fillRect(grid, x, 12, 6, h - 12, style.stone[1]); // the buttresses
    const middle = Math.floor(w / 2);
    for (let x = 18; x < w - 18; x += 32) {
      if (Math.abs(x + 4 - middle) < 30) continue;
      for (const y of [28, 64]) {
        fillRect(grid, x, y, 8, 14, '#0d0b14');
        fillEllipse(grid, x + 4, y, 4, 3, '#0d0b14');
        fillRect(grid, x + 2, y + 2, 4, 10, style.window[frame % 2]);
      }
    }
    fillRect(grid, middle - 18, h - 52, 36, 52, style.stone[0]); // the gate
    fillEllipse(grid, middle, h - 52, 18, 12, style.stone[0]);
    fillRect(grid, middle - 14, h - 48, 28, 48, '#0a0608');
    fillEllipse(grid, middle, h - 48, 14, 9, '#0a0608');
    for (let x = middle - 12; x < middle + 12; x += 5) fillRect(grid, x, h - 52, 2, 40, '#3a3442'); // the raised portcullis
    return sprite(grid, 0, h, '#000000');
  });
}

// A round turret with a pointed roof and a flag.
export function turret(look) {
  return once('turret|' + look, () => {
    const style = KEEP_LOOKS[look] || KEEP_LOOKS.demon;
    const grid = makeGrid(36, 76);
    for (let y = 22; y < 76; y++) for (let x = 3; x < 33; x++) dot(grid, x, y, toneOf(style.stone, 0.75 - Math.abs(x - 14) / 30 + randomOf(x, y, 67) * 0.08, x, y));
    if (look === 'wood' || look === 'stone') {
      for (let x = 2; x < 34; x += 6) fillRect(grid, x, 20, 4, 4, style.stone[4]); // battlements
      fillRect(grid, 2, 24, 32, 2, style.stone[1]);
    }
    fillTriangle(grid, [0, 24], [18, 0], [36, 24], (x, y) => toneOf(style.roof, 0.85 - x / 60, x, y));
    fillRect(grid, 17, 0, 2, 6, '#2a1f2e');
    fillRect(grid, 19, 0, 8, 4, style.flag);
    fillRect(grid, 14, 36, 6, 10, '#0d0b14');
    fillRect(grid, 15, 38, 4, 7, style.window[0]);
    const outlineColor = look === 'wood' || look === 'stone' ? OUTLINE : '#000000';
    return sprite(grid, 0, 76, outlineColor);
  });
}

// ---------- Visited Village House Interiors (dining room, bathroom/toilets, bedrooms) ----------

export function toilet() {
  return once('toilet', () => {
    const grid = makeGrid(16, 18);
    fillRect(grid, 3, 2, 10, 6, '#e8eef7'); // ceramic tank
    fillRect(grid, 4, 2, 8, 2, '#ffffff');
    fillRect(grid, 2, 8, 12, 8, '#dce4f0'); // bowl outer rim
    fillRect(grid, 4, 9, 8, 5, '#ffffff');
    fillEllipse(grid, 8, 12, 3, 2, '#6fa0d8'); // water
    fillRect(grid, 5, 16, 6, 2, '#b8c4d8'); // porcelain pedestal
    return sprite(grid, 8, 17);
  });
}

export function basin() {
  return once('basin', () => {
    const grid = makeGrid(16, 20);
    fillRect(grid, 4, 0, 8, 6, '#c8d6eb'); // wall mirror
    fillRect(grid, 5, 1, 6, 4, '#8cc5ee');
    fillRect(grid, 2, 7, 12, 8, '#e8eef7'); // porcelain sink counter
    fillRect(grid, 4, 9, 8, 4, '#4aa0ff'); // water basin
    fillRect(grid, 7, 7, 2, 3, '#9aa6b8'); // chrome tap
    fillRect(grid, 6, 15, 4, 5, '#c9d1e0'); // pedestal
    return sprite(grid, 8, 19);
  });
}

export function diningTable() {
  return once('diningTable', () => {
    const grid = makeGrid(32, 22);
    fillRect(grid, 1, 5, 30, 10, WOOD.base); // wooden table top
    fillRect(grid, 1, 5, 30, 2, WOOD.light);
    fillRect(grid, 9, 6, 14, 8, '#f6efe0'); // linen cloth runner
    fillEllipse(grid, 6, 10, 2, 1.5, '#e8eef7'); // plate left
    fillEllipse(grid, 25, 10, 2, 1.5, '#e8eef7'); // plate right
    fillRect(grid, 14, 8, 4, 3, '#d9a05a'); // loaf of bread
    fillRect(grid, 3, 15, 3, 7, WOOD.dark); // legs
    fillRect(grid, 26, 15, 3, 7, WOOD.dark);
    return sprite(grid, 0, 22);
  });
}

// The bar of the Guild of Adventurers: a long wooden counter with mugs of ale on it. tiles: its width.
export function barCounter(tiles) {
  return once('barCounter' + tiles, () => {
    const width = tiles * 16;
    const grid = makeGrid(width, 26);
    fillRect(grid, 0, 8, width, 4, WOOD.light); // the top
    fillRect(grid, 0, 12, width, 14, WOOD.dark); // the front
    for (let x = 3; x < width; x += 8) fillRect(grid, x, 13, 1, 12, WOOD.base); // the planks
    fillRect(grid, 0, 24, width, 2, '#3a2416');
    for (let x = 6; x < width - 4; x += 13) {
      fillRect(grid, x, 3, 4, 5, '#e0a22a'); // a mug of ale...
      fillRect(grid, x, 2, 4, 2, '#fff8ea'); // ...and its foam
      fillRect(grid, x + 4, 4, 1, 3, '#b07a2a'); // the handle
    }
    return sprite(grid, 0, 25);
  });
}

// A round table of the tavern, with two mugs.
export function tavernTable() {
  return once('tavernTable', () => {
    const grid = makeGrid(28, 22);
    fillEllipse(grid, 14, 8, 13, 5, WOOD.base);
    fillEllipse(grid, 14, 7, 12, 4, WOOD.light);
    fillRect(grid, 12, 12, 4, 10, WOOD.dark); // the foot
    fillRect(grid, 8, 19, 12, 2, WOOD.dark);
    for (const x of [7, 18]) {
      fillRect(grid, x, 3, 4, 5, '#e0a22a');
      fillRect(grid, x, 2, 4, 2, '#fff8ea');
    }
    return sprite(grid, 0, 21);
  });
}

export function wardrobe() {
  return once('wardrobe', () => {
    const grid = makeGrid(16, 24);
    fillRect(grid, 1, 1, 14, 22, WOOD.base);
    fillRect(grid, 1, 1, 14, 3, WOOD.light);
    fillRect(grid, 7, 4, 2, 17, WOOD.deep); // double doors seam
    fillRect(grid, 5, 12, 1, 2, '#ffd23f'); // knobs
    fillRect(grid, 10, 12, 1, 2, '#ffd23f');
    return sprite(grid, 8, 23);
  });
}

export function smallBed(color = '#5a9fd6') {
  return once('smallBed' + color, () => {
    const grid = makeGrid(20, 26);
    fillRect(grid, 2, 2, 16, 22, WOOD.base);
    fillRect(grid, 3, 4, 14, 5, '#f6efe0'); // pillow
    fillRect(grid, 3, 9, 14, 14, color);
    fillRect(grid, 3, 9, 14, 2, lighter(color));
    fillRect(grid, 2, 0, 16, 3, WOOD.dark);
    return sprite(grid, 0, 26);
  });
}

export function throne() {
  return once('royalThrone', () => {
    const grid = makeGrid(32, 28);
    fillRect(grid, 6, 2, 20, 16, '#ffd23f');
    fillRect(grid, 8, 4, 16, 12, '#8a1c34');
    fillRect(grid, 11, 2, 10, 3, '#fff3b0');
    fillRect(grid, 5, 14, 22, 8, WOOD.dark);
    fillRect(grid, 7, 15, 18, 5, '#b8253f');
    fillRect(grid, 4, 18, 24, 9, WOOD.base);
    fillRect(grid, 8, 20, 16, 4, '#ffd23f');
    return sprite(grid, 0, 27);
  });
}

// Wooden indoor staircase ascending to the 2nd floor (étags / upstairs).
export function stairsUp() {
  return once('stairsUp', () => {
    const grid = makeGrid(16, 16);
    fillRect(grid, 1, 1, 14, 14, WOOD.dark);
    for (let step = 0; step < 4; step++) {
      const y = 11 - step * 3;
      fillRect(grid, 2, y, 12, 2, WOOD.light);
      fillRect(grid, 2, y + 2, 12, 1, WOOD.deep);
    }
    fillRect(grid, 1, 0, 2, 16, '#c9a050'); // banister rail
    fillRect(grid, 13, 0, 2, 16, '#c9a050');
    return sprite(grid, 0, 15);
  });
}

// Indoor staircase descending back down to the ground floor.
export function stairsDown() {
  return once('stairsDown', () => {
    const grid = makeGrid(16, 16);
    fillRect(grid, 1, 1, 14, 14, '#181322');
    for (let step = 0; step < 4; step++) {
      const y = 2 + step * 3;
      fillRect(grid, 2 + step, y, 12 - step * 2, 2, WOOD.base);
      fillRect(grid, 2 + step, y + 2, 12 - step * 2, 1, WOOD.dark);
    }
    fillRect(grid, 1, 0, 2, 16, '#c9a050');
    fillRect(grid, 13, 0, 2, 16, '#c9a050');
    return sprite(grid, 0, 15);
  });
}
