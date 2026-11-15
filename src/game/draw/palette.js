// The colors of the game: a warm 16-bit palette (bright greens, warm browns, deep navy for the night).

export const OUTLINE = '#1c1726'; // the dark edge around every sprite

export const GRASS = { base: '#5db84b', dark: '#46a043', deep: '#2f7d3a', light: '#8ad35a', edge: '#3a8f3e' };
export const DIRT = { base: '#c99f66', dark: '#a9814f', light: '#ddbd88', pebble: '#8f6a43' };
export const COBBLE = { mortar: '#7a7066', stone: '#b5ac9e', light: '#d4ccbf', dark: '#948a7c' };
export const SAND = { base: '#ead49a', dark: '#d6bb7a', light: '#f6e6b8' };
export const WATER = { base: '#3b8fe0', dark: '#2f78c8', light: '#7cc4f5', foam: '#e2f4ff', deep: '#2a66b3' };
export const SNOW = { base: '#eef3fa', shade: '#d3deee', dark: '#b4c6e0', light: '#ffffff' };
export const ASH = { base: '#55424f', dark: '#433440', light: '#6b5664', crack: '#2e2330' };
export const LAVA = { base: '#e8541c', light: '#ffa62b', bright: '#ffe066', crust: '#8a2c14' };
export const FLOOR = { base: '#6c6580', dark: '#575069', light: '#7f7894' };
export const WALL = { top: '#4b4466', rim: '#6d6690', face: '#3e3756', brick: '#4a4366', mortar: '#2f2944' };
export const SOIL = { base: '#7a4f2c', furrow: '#5f3b1f', light: '#94643a' };
export const WOOD = { base: '#a0683a', dark: '#784824', light: '#c48c52', deep: '#4f2e17' };

// ---------- Tone ramps: the same material from its darkest shade to its lightest (for the shading) ----------
export const GRASS_RAMP = ['#2c6826', '#37812e', '#449634', '#52a73a', '#66ba45', '#86d058'];
export const DIRT_RAMP = ['#7c5634', '#94673d', '#ab7c4b', '#c19460', '#d4ab78', '#e2c393'];
export const STONE_RAMP = ['#47434d', '#5f5a66', '#78737f', '#94909b', '#b3aeb8', '#d4d0d8'];
export const WATER_RAMP = ['#1b4a94', '#225db0', '#2b72c8', '#3f8bdb', '#64aaec', '#a4d6fa'];
export const SNOW_RAMP = ['#9fb4d6', '#bccbe3', '#d6e1f0', '#e9eff8', '#ffffff'];
export const SAND_RAMP = ['#b58f4c', '#c9a35e', '#d9b671', '#e7c98a', '#f3dda6'];
export const ASH_RAMP = ['#251b23', '#342731', '#44363f', '#56464f', '#6a5964'];
export const LEAF_RAMP = ['#0f2418', '#163a20', '#1e5026', '#29682d', '#388434', '#4fa03c', '#70bc4c', '#97d65e'];
export const LIGHT_LEAF_RAMP = ['#16391f', '#205227', '#2c6b2e', '#3b8835', '#52a43e', '#74c04d', '#9cd95f', '#c2ec7c'];
export const PINE_RAMP = ['#0c2620', '#123a2c', '#1a5038', '#246745', '#337f52', '#47995f'];
export const WOOD_RAMP = ['#3b2414', '#55331b', '#704423', '#8c582d', '#a86e3b', '#c28a52'];
export const ROOF_RAMPS = {
  red: ['#5e1a12', '#80271b', '#a33524', '#c2472e', '#d9613f', '#ea8259'],
  blue: ['#1a2c5e', '#233d80', '#2f50a0', '#3f66bd', '#5a82d4', '#7fa2e6'],
};

// The color of a type, in the night of a raid... and everything else: mix two colors.
// amount: 0 = color, 1 = other.
export function mix(color, other, amount) {
  const a = parseInt(color.slice(1, 7), 16);
  const b = parseInt(other.slice(1, 7), 16);
  const channel = (shift) => Math.round(((a >> shift) & 255) * (1 - amount) + ((b >> shift) & 255) * amount);
  const value = (channel(16) << 16) | (channel(8) << 8) | channel(0);
  return '#' + value.toString(16).padStart(6, '0');
}

export function darker(color, amount = 0.28) {
  return mix(color, '#14101e', amount);
}

export function lighter(color, amount = 0.35) {
  return mix(color, '#ffffff', amount);
}

// A color, from its darkest shade to its lightest (6 tones).
export function rampOf(color) {
  return [darker(color, 0.55), darker(color, 0.36), darker(color, 0.16), color, lighter(color, 0.25), lighter(color, 0.5)];
}
