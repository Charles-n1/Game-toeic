import { tone, noise, frequencyOf } from '../synth';

// The sound effects of village life: trade, punches, horses, feasts, fireworks, disasters, blessings.
// Each one: (to, t) => { ... }  (to: the output, t: the start time). Played with cue(game, name) (logic/cues.js).
export const SOCIETY_SOUNDS = {
  trade: (to, t) => {
    tone(to, { wave: 'triangle', frequency: frequencyOf('E5'), start: t, duration: 0.08, volume: 0.14 });
    tone(to, { wave: 'triangle', frequency: frequencyOf('B5'), start: t + 0.06, duration: 0.14, volume: 0.14 });
  },
  punch: (to, t) => {
    noise(to, { start: t, duration: 0.12, volume: 0.32, lowpass: 950 });
    tone(to, { wave: 'sine', frequency: 140, slideTo: 48, start: t, duration: 0.14, volume: 0.34 });
  },
  horse: (to, t) => {
    noise(to, { start: t, duration: 0.04, volume: 0.14, lowpass: 700 });
    noise(to, { start: t + 0.08, duration: 0.04, volume: 0.12, lowpass: 700 });
    tone(to, { wave: 'sawtooth', frequency: 340, slideTo: 560, start: t + 0.06, duration: 0.16, volume: 0.08 });
    tone(to, { wave: 'sawtooth', frequency: 560, slideTo: 290, start: t + 0.22, duration: 0.2, volume: 0.07 });
  },
  firework: (to, t) => {
    tone(to, { wave: 'sine', frequency: 240, slideTo: 920, start: t, duration: 0.22, volume: 0.08 });
    noise(to, { start: t + 0.24, duration: 0.28, volume: 0.22, highpass: 1400 });
    tone(to, { wave: 'triangle', frequency: frequencyOf('G6'), slideTo: 420, start: t + 0.25, duration: 0.18, volume: 0.08 });
  },
  tornado: (to, t) => {
    noise(to, { start: t, duration: 1.6, volume: 0.26, lowpass: 520 });
    tone(to, { wave: 'sine', frequency: 130, slideTo: 210, start: t, duration: 0.8, volume: 0.07 });
    tone(to, { wave: 'sine', frequency: 210, slideTo: 115, start: t + 0.8, duration: 0.8, volume: 0.07 });
  },
  tsunami: (to, t) => {
    noise(to, { start: t, duration: 1.8, volume: 0.34, lowpass: 380 });
    noise(to, { start: t + 0.35, duration: 1.2, volume: 0.18, highpass: 900 });
    tone(to, { wave: 'triangle', frequency: 95, slideTo: 55, start: t, duration: 1.4, volume: 0.16 });
  },
  blessing: (to, t) => {
    ['C5', 'E5', 'G5', 'B5', 'E6'].forEach((note, i) => {
      tone(to, { wave: 'triangle', frequency: frequencyOf(note), start: t + i * 0.07, duration: 0.35, volume: 0.13 });
    });
  },
  heal: (to, t) => {
    ['F5', 'A5', 'C6'].forEach((note, i) => {
      tone(to, { wave: 'sine', frequency: frequencyOf(note), start: t + i * 0.09, duration: 0.3, volume: 0.15 });
    });
  },
  build: (to, t) => {
    noise(to, { start: t, duration: 0.06, volume: 0.2, lowpass: 1200 });
    tone(to, { wave: 'square', frequency: 210, slideTo: 120, start: t, duration: 0.07, volume: 0.1 });
    noise(to, { start: t + 0.14, duration: 0.06, volume: 0.2, lowpass: 1400 });
    tone(to, { wave: 'square', frequency: 250, slideTo: 140, start: t + 0.14, duration: 0.07, volume: 0.1 });
  },
  cageBreak: (to, t) => {
    noise(to, { start: t, duration: 0.18, volume: 0.28, highpass: 800 });
    tone(to, { wave: 'square', frequency: 520, slideTo: 190, start: t, duration: 0.18, volume: 0.12 });
  },
  alarm: (to, t) => {
    tone(to, { wave: 'sawtooth', frequency: frequencyOf('A4'), start: t, duration: 0.16, volume: 0.12 });
    tone(to, { wave: 'sawtooth', frequency: frequencyOf('E5'), start: t + 0.18, duration: 0.22, volume: 0.12 });
  },
};
