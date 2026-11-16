import { tone, noise, frequencyOf } from '../synth';

// The sound effects of the fights: weapon slashes, magic casts, special bursts, companion strikes, and bow shots.
// Each one: (to, t) => { ... }  (to: the output, t: the start time). Played with cue(game, name).
export const FIGHT_SOUNDS = {
  slash: (to, t) => {
    noise(to, { start: t, duration: 0.11, volume: 0.25, highpass: 1800 });
    tone(to, { wave: 'sawtooth', frequency: 620, slideTo: 160, start: t, duration: 0.1, volume: 0.11 });
    tone(to, { wave: 'triangle', frequency: frequencyOf('E5'), slideTo: frequencyOf('A4'), start: t + 0.03, duration: 0.09, volume: 0.14 });
  },
  magicCast: (to, t) => {
    noise(to, { start: t, duration: 0.18, volume: 0.12, highpass: 3200 });
    ['C5', 'E5', 'G#5', 'B5', 'E6'].forEach((note, i) => {
      tone(to, { wave: 'sine', frequency: frequencyOf(note), start: t + i * 0.04, duration: 0.18, volume: 0.1 });
      tone(to, { wave: 'triangle', frequency: frequencyOf(note), start: t + i * 0.04, duration: 0.12, volume: 0.07 });
    });
  },
  specialBurst: (to, t) => {
    tone(to, { wave: 'sine', frequency: 140, slideTo: 42, start: t, duration: 0.26, volume: 0.32 });
    noise(to, { start: t + 0.03, duration: 0.28, volume: 0.28, lowpass: 2600 });
    ['A4', 'C#5', 'E5', 'A5', 'E6'].forEach((note, i) => {
      tone(to, { wave: 'square', frequency: frequencyOf(note), start: t + 0.04 + i * 0.045, duration: 0.22, volume: 0.07 });
      tone(to, { wave: 'triangle', frequency: frequencyOf(note), start: t + 0.04 + i * 0.045, duration: 0.28, volume: 0.12 });
    });
  },
  companionStrike: (to, t) => {
    noise(to, { start: t, duration: 0.08, volume: 0.2, highpass: 1500 });
    tone(to, { wave: 'square', frequency: frequencyOf('D5'), slideTo: frequencyOf('A4'), start: t, duration: 0.08, volume: 0.09 });
    tone(to, { wave: 'triangle', frequency: frequencyOf('F#5'), slideTo: frequencyOf('D5'), start: t + 0.07, duration: 0.1, volume: 0.14 });
  },
  bowShot: (to, t) => {
    tone(to, { wave: 'triangle', frequency: frequencyOf('G4'), slideTo: frequencyOf('C4'), start: t, duration: 0.08, volume: 0.18 });
    noise(to, { start: t + 0.02, duration: 0.12, volume: 0.14, highpass: 2800 });
    tone(to, { wave: 'sine', frequency: 1100, slideTo: 480, start: t + 0.04, duration: 0.07, volume: 0.05 });
  },
};
