import { tone, noise, frequencyOf } from '../synth';

// The sound effects of the war: clashes, walls breaking, turrets, war horns.
// Each one: (to, t) => { ... }  (to: the output, t: the start time). Played with cue(game, name) (logic/cues.js).
export const WAR_SOUNDS = {
  warHorn: (to, t) => {
    tone(to, { wave: 'sawtooth', frequency: frequencyOf('G3'), start: t, duration: 0.24, volume: 0.14 });
    tone(to, { wave: 'sawtooth', frequency: frequencyOf('D4'), start: t + 0.18, duration: 0.28, volume: 0.15 });
    tone(to, { wave: 'triangle', frequency: frequencyOf('G4'), start: t + 0.36, duration: 0.55, volume: 0.2 });
  },
  wallHit: (to, t) => {
    noise(to, { start: t, duration: 0.14, volume: 0.28, lowpass: 700 });
    tone(to, { wave: 'sine', frequency: 130, slideTo: 55, start: t, duration: 0.14, volume: 0.32 });
  },
  wallBreak: (to, t) => {
    noise(to, { start: t, duration: 0.45, volume: 0.36, lowpass: 1400 });
    tone(to, { wave: 'sawtooth', frequency: 160, slideTo: 48, start: t, duration: 0.36, volume: 0.22 });
    noise(to, { start: t + 0.12, duration: 0.28, volume: 0.22, highpass: 1800 });
  },
  turretShot: (to, t) => {
    tone(to, { wave: 'triangle', frequency: 680, slideTo: 230, start: t, duration: 0.11, volume: 0.16 });
    noise(to, { start: t, duration: 0.04, volume: 0.12, highpass: 2400 });
  },
  pitchforkThrow: (to, t) => {
    noise(to, { start: t, duration: 0.08, volume: 0.12, highpass: 1600 });
    tone(to, { wave: 'triangle', frequency: 420, slideTo: 280, start: t, duration: 0.09, volume: 0.11 });
  },
  bury: (to, t) => {
    noise(to, { start: t, duration: 0.14, volume: 0.16, lowpass: 500 });
    noise(to, { start: t + 0.18, duration: 0.14, volume: 0.14, lowpass: 450 });
    tone(to, { wave: 'triangle', frequency: frequencyOf('E4'), start: t + 0.3, duration: 0.35, volume: 0.12 });
    tone(to, { wave: 'triangle', frequency: frequencyOf('B4'), start: t + 0.45, duration: 0.45, volume: 0.11 });
  },
  ambush: (to, t) => {
    noise(to, { start: t, duration: 0.12, volume: 0.24, highpass: 1200 });
    tone(to, { wave: 'square', frequency: frequencyOf('D#5'), start: t, duration: 0.11, volume: 0.12 });
    tone(to, { wave: 'square', frequency: frequencyOf('A4'), start: t + 0.09, duration: 0.14, volume: 0.12 });
    tone(to, { wave: 'sawtooth', frequency: frequencyOf('F4'), start: t + 0.2, duration: 0.28, volume: 0.14 });
  },
};
