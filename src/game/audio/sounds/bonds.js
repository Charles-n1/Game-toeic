import { tone, noise, frequencyOf } from '../synth';

// The sound effects of the characters: voices when they talk, reactions, nights, and training.
// Each one: (to, t) => { ... }  (to: the output, t: the start time). Played with cue(game, name).

function blip(to, t, wave, from, toFreq, duration = 0.045, volume = 0.08) {
  tone(to, { wave: wave, frequency: from, slideTo: toFreq, start: t, duration: duration, volume: volume });
}

export const BONDS_SOUNDS = {
  // ---------- Character voice text-blips (16-bit RPG dialogue voices) ----------
  voiceHigh: (to, t) => {
    blip(to, t, 'triangle', frequencyOf('E5'), frequencyOf('G5'), 0.042, 0.09);
    blip(to, t + 0.015, 'square', frequencyOf('B5'), frequencyOf('C6'), 0.025, 0.03);
  },
  voiceSoft: (to, t) => {
    blip(to, t, 'sine', frequencyOf('C5'), frequencyOf('D5'), 0.05, 0.1);
    blip(to, t + 0.01, 'triangle', frequencyOf('E5'), frequencyOf('E5'), 0.035, 0.04);
  },
  voiceDeep: (to, t) => {
    blip(to, t, 'triangle', frequencyOf('G3'), frequencyOf('A3'), 0.055, 0.12);
    blip(to, t + 0.012, 'sawtooth', frequencyOf('D3'), frequencyOf('E3'), 0.04, 0.035);
  },
  voiceSharp: (to, t) => {
    blip(to, t, 'square', frequencyOf('A4'), frequencyOf('C5'), 0.038, 0.065);
    blip(to, t + 0.018, 'triangle', frequencyOf('E5'), frequencyOf('D5'), 0.028, 0.05);
  },
  voiceMystic: (to, t) => {
    blip(to, t, 'sine', frequencyOf('F#4'), frequencyOf('B4'), 0.055, 0.09);
    blip(to, t + 0.015, 'triangle', frequencyOf('C#5'), frequencyOf('F#5'), 0.045, 0.045);
  },

  // ---------- Character reaction sounds ----------
  laugh: (to, t) => {
    const notes = ['E5', 'G5', 'A5', 'C6'];
    notes.forEach((note, i) => {
      tone(to, { wave: 'triangle', frequency: frequencyOf(note), start: t + i * 0.065, duration: 0.08, volume: 0.12 });
      tone(to, { wave: 'square', frequency: frequencyOf(note) * 2, start: t + i * 0.065 + 0.01, duration: 0.05, volume: 0.035 });
    });
  },
  groan: (to, t) => {
    tone(to, { wave: 'sawtooth', frequency: frequencyOf('D4'), slideTo: frequencyOf('G3'), start: t, duration: 0.22, volume: 0.09 });
    tone(to, { wave: 'triangle', frequency: frequencyOf('A3'), slideTo: frequencyOf('F3'), start: t + 0.08, duration: 0.26, volume: 0.14 });
  },
  heartChime: (to, t) => {
    const notes = ['C5', 'E5', 'G5', 'B5', 'E6'];
    notes.forEach((note, i) => {
      tone(to, { wave: 'sine', frequency: frequencyOf(note), start: t + i * 0.055, duration: 0.24, volume: 0.11 });
      tone(to, { wave: 'triangle', frequency: frequencyOf(note), start: t + i * 0.055, duration: 0.16, volume: 0.06 });
    });
  },
  gasp: (to, t) => {
    noise(to, { start: t, duration: 0.06, volume: 0.08, highpass: 2400 });
    tone(to, { wave: 'triangle', frequency: frequencyOf('G5'), slideTo: frequencyOf('D6'), start: t + 0.01, duration: 0.11, volume: 0.13 });
  },
  angryGrunt: (to, t) => {
    noise(to, { start: t, duration: 0.08, volume: 0.16, lowpass: 800 });
    tone(to, { wave: 'sawtooth', frequency: frequencyOf('F3'), slideTo: frequencyOf('C3'), start: t, duration: 0.16, volume: 0.11 });
    tone(to, { wave: 'square', frequency: frequencyOf('E3'), slideTo: frequencyOf('B2'), start: t + 0.1, duration: 0.14, volume: 0.07 });
  },

  // ---------- Training & Morning ----------
  trainingHit: (to, t) => {
    noise(to, { start: t, duration: 0.07, volume: 0.22, lowpass: 1400 });
    tone(to, { wave: 'triangle', frequency: 190, slideTo: 75, start: t, duration: 0.09, volume: 0.2 });
    tone(to, { wave: 'square', frequency: 520, slideTo: 260, start: t + 0.02, duration: 0.05, volume: 0.06 });
  },
  rankUp: (to, t) => {
    const fanfare = ['G4', 'B4', 'D5', 'G5', 'B5'];
    fanfare.forEach((note, i) => {
      tone(to, { wave: 'square', frequency: frequencyOf(note), start: t + i * 0.065, duration: 0.18, volume: 0.08 });
      tone(to, { wave: 'triangle', frequency: frequencyOf(note), start: t + i * 0.065, duration: 0.22, volume: 0.14 });
    });
  },
  morningChime: (to, t) => {
    ['C5', 'E5', 'G5', 'C6'].forEach((note, i) => {
      tone(to, { wave: 'sine', frequency: frequencyOf(note), start: t + i * 0.09, duration: 0.35, volume: 0.12 });
    });
    tone(to, { wave: 'triangle', frequency: frequencyOf('G5'), start: t + 0.3, duration: 0.45, volume: 0.08 });
  },
};
