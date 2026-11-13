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
