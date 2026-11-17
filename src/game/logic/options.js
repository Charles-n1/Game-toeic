import { saveGameOptions, loadGameOptions } from '../../logic/storage';

// The options of the game: the same for the 3 save slots.
// musicVolume, effectsVolume: from 0 to 1. textSpeed: see TEXT_SPEEDS. relaxed: +50% time to answer.
// realismLevel: 'light' | 'normal' | 'hardcore'.

export const TEXT_SPEEDS = [
  { id: 'slow', name: 'Slow', lettersPerSecond: 25 },
  { id: 'normal', name: 'Normal', lettersPerSecond: 50 },
  { id: 'fast', name: 'Fast', lettersPerSecond: 110 },
  { id: 'instant', name: 'Instant', lettersPerSecond: Infinity },
];

export const REALISM_LEVELS = [
  { id: 'light', name: 'Light', desc: 'Hunger, thirst & English reading only. Wounds heal fast, no spoilage.' },
  { id: 'normal', name: 'Normal', desc: 'Wounds, spoilage, shop hours, banks, crimes, NPC memory & world life.' },
  { id: 'hardcore', name: 'Hardcore', desc: 'Full climate exposure, hygiene, morale, mimics, theft risk (+20% XP).' },
];

export const DEFAULT_OPTIONS = {
  musicVolume: 0.5,
  effectsVolume: 0.7,
  textSpeed: 'normal',
  relaxed: false,
  realismLevel: 'normal',
};

function isVolume(value) {
  return typeof value === 'number' && value >= 0 && value <= 1;
}

// 🔒 A broken save of the options gives the default ones.
export function loadOptions() {
  const saved = loadGameOptions();
  if (saved === null || typeof saved !== 'object') return DEFAULT_OPTIONS;
  return {
    musicVolume: isVolume(saved.musicVolume) ? saved.musicVolume : DEFAULT_OPTIONS.musicVolume,
    effectsVolume: isVolume(saved.effectsVolume) ? saved.effectsVolume : DEFAULT_OPTIONS.effectsVolume,
    textSpeed: TEXT_SPEEDS.some((speed) => speed.id === saved.textSpeed) ? saved.textSpeed : DEFAULT_OPTIONS.textSpeed,
    relaxed: saved.relaxed === true,
    realismLevel: REALISM_LEVELS.some((r) => r.id === saved.realismLevel) ? saved.realismLevel : DEFAULT_OPTIONS.realismLevel,
  };
}

export function saveOptions(options) {
  saveGameOptions(options);
}

export function lettersPerSecond(textSpeed) {
  return TEXT_SPEEDS.find((speed) => speed.id === textSpeed).lettersPerSecond;
}
