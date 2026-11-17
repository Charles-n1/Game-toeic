// Unified Dark-Fantasy HD-2D 16-bit palette:
// Deep violet-obsidian ink outlines, hue-shifted cool indigo shadows, rich natural midtones,
// and warm champagne-gold sun highlights (inspired by Octopath / Ronan & Luna reference styling).

export const OUTLINE = '#140f1e';

export const GRASS = { base: '#358034', dark: '#27632d', deep: '#1d4628', light: '#6cbd4b', edge: '#2d7231' };
export const DIRT = { base: '#8b5c3b', dark: '#6e472d', light: '#aa764d', pebble: '#523522' };
export const COBBLE = { mortar: '#342e3b', stone: '#6e6c82', light: '#9190a6', dark: '#525064' };
export const SAND = { base: '#cc9b5a', dark: '#af7e45', light: '#e3b975' };
export const WATER = { base: '#22589c', dark: '#183d78', light: '#52a3d8', foam: '#d9f4ff', deep: '#112858' };
export const SNOW = { base: '#dde8f5', shade: '#b8cce6', dark: '#91a8cf', light: '#f7fbff' };
export const ASH = { base: '#332734', dark: '#241b26', light: '#453643', crack: '#18121b' };
export const LAVA = { base: '#e84818', light: '#ff9c28', bright: '#ffe670', crust: '#782214' };
export const FLOOR = { base: '#4b4662', dark: '#36314a', light: '#625c7c' };
export const WALL = { top: '#35304c', rim: '#746e98', face: '#2c2740', brick: '#3c3654', mortar: '#1c182c' };
export const SOIL = { base: '#5f3b22', furrow: '#452815', light: '#7a4d2e' };
export const WOOD = { base: '#7c4e2a', dark: '#543219', light: '#a67042', deep: '#341e0f' };

// ---------- Hue-Shifted Multi-Tone Ramps (Cool Deep Shadow -> Warm Rim Highlight) ----------
export const GRASS_RAMP = ['#1d4628', '#27632d', '#358034', '#499c3c', '#6cbd4b', '#98da66'];
export const DIRT_RAMP = ['#523522', '#6e472d', '#8b5c3b', '#aa764d', '#c69265', '#dfb384'];
export const STONE_RAMP = ['#2b2938', '#3c3a4c', '#525064', '#6e6c82', '#9190a6', '#babbc9'];
export const WATER_RAMP = ['#112858', '#183d78', '#22589c', '#2f78be', '#52a3d8', '#9de2fa'];
export const SNOW_RAMP = ['#6d84ae', '#91a8cf', '#b8cce6', '#dde8f5', '#f7fbff'];
export const SAND_RAMP = ['#8f6232', '#af7e45', '#cc9b5a', '#e3b975', '#f4d599'];
export const ASH_RAMP = ['#18121b', '#241b26', '#332734', '#453643', '#5a4957'];
export const LEAF_RAMP = ['#101f22', '#173328', '#204a2c', '#2b6632', '#3c8339', '#56a143', '#78be52', '#a8db6a'];
export const LIGHT_LEAF_RAMP = ['#142824', '#1d4029', '#295b30', '#397938', '#4f9942', '#70ba4f', '#98d661', '#c6ed84'];
export const PINE_RAMP = ['#0e1e26', '#143030', '#1c463c', '#266047', '#357b55', '#4c9967'];
export const WOOD_RAMP = ['#2b1910', '#442818', '#5e3920', '#7c4e2a', '#9c683c', '#bc8756'];
export const THATCH_RAMP = ['#432f18', '#5f4523', '#7d5f31', '#9c7b42', '#bc9a59', '#dab976'];
export const GOLD_RAMP = ['#5c3410', '#8c5414', '#bf801c', '#e6b234', '#ffe478'];
export const STEEL_RAMP = ['#242636', '#3c4054', '#5c647c', '#8892ac', '#c8d2e6'];

export const ROOF_RAMPS = {
  red: ['#4a1418', '#681e22', '#8a2a2c', '#aa3a38', '#c65448', '#de7864'],
  blue: ['#152048', '#1e3068', '#2a458a', '#3b5dac', '#557ac6', '#7ba0dc'],
  purple: ['#21153e', '#311f58', '#442c78', '#5a3d98', '#7557b8', '#987ad6'],
  green: ['#143420', '#1d4d2c', '#286838', '#398648', '#54a65e', '#7ac47e'],
  sand: ['#57371a', '#764d25', '#966634', '#b68347', '#d2a262', '#e8c186'],
  grey: ['#292c38', '#3a3e4d', '#4e5466', '#666d82', '#848ca2', '#a6aebf'],
  dark: ['#120f1c', '#1c1728', '#29223a', '#3a3050', '#4d4168', '#645784'],
};

export function mix(color, other, amount) {
  const a = parseInt(color.slice(1, 7), 16);
  const b = parseInt(other.slice(1, 7), 16);
  const channel = (shift) => Math.round(((a >> shift) & 255) * (1 - amount) + ((b >> shift) & 255) * amount);
  const value = (channel(16) << 16) | (channel(8) << 8) | channel(0);
  return '#' + value.toString(16).padStart(6, '0');
}

export function darker(color, amount = 0.28) {
  return mix(color, '#140f1e', amount);
}

export function lighter(color, amount = 0.35) {
  return mix(color, '#fff6df', amount);
}

export function rampOf(color) {
  return [darker(color, 0.56), darker(color, 0.35), darker(color, 0.16), color, lighter(color, 0.24), lighter(color, 0.48)];
}
