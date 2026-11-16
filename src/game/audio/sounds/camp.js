import { tone, noise, frequencyOf } from '../synth';

// The sound effects of the camp: pitching the tent, lighting the fire, cooking, eating, planting seeds.
// Each one: (to, t) => { ... }  (to: the output, t: the start time). Played with cue(game, name) (logic/cues.js).
export const CAMP_SOUNDS = {
  // Tent stakes tapping into the soil and canvas snapping taut.
  campPitch: (to, t) => {
    noise(to, { start: t, duration: 0.08, volume: 0.14, lowpass: 700 });
    tone(to, { wave: 'triangle', frequency: 190, slideTo: 120, start: t, duration: 0.09, volume: 0.14 });
    tone(to, { wave: 'triangle', frequency: 240, slideTo: 320, start: t + 0.11, duration: 0.08, volume: 0.12 });
    noise(to, { start: t + 0.12, duration: 0.06, volume: 0.1, highpass: 1400 });
  },

  // Kindling catching flame and rising warmth.
  campFire: (to, t) => {
    noise(to, { start: t, duration: 0.18, volume: 0.16, highpass: 900 });
    noise(to, { start: t + 0.06, duration: 0.28, volume: 0.14, lowpass: 1100 });
    tone(to, { wave: 'triangle', frequency: frequencyOf('C5'), slideTo: frequencyOf('G5'), start: t + 0.05, duration: 0.22, volume: 0.12 });
  },

  // Simmering pot / searing meat over hot embers.
  sizzle: (to, t) => {
    noise(to, { start: t, duration: 0.35, volume: 0.12, highpass: 2400 });
    tone(to, { wave: 'sine', frequency: 520, slideTo: 780, start: t + 0.08, duration: 0.06, volume: 0.08 });
    tone(to, { wave: 'sine', frequency: 640, slideTo: 920, start: t + 0.2, duration: 0.06, volume: 0.08 });
  },

  // Warm, happy chord chime after sharing a hot meal.
  eatMeal: (to, t) => {
    ['C5', 'E5', 'G5', 'C6'].forEach((note, i) => {
      tone(to, { wave: 'triangle', frequency: frequencyOf(note), start: t + i * 0.08, duration: 0.16, volume: 0.15 });
    });
  },

  // Patting soil over a freshly planted seed, followed by a green sprout chime.
  plantSeed: (to, t) => {
    noise(to, { start: t, duration: 0.07, volume: 0.1, lowpass: 800 });
    tone(to, { wave: 'triangle', frequency: frequencyOf('E5'), start: t + 0.06, duration: 0.1, volume: 0.12 });
    tone(to, { wave: 'triangle', frequency: frequencyOf('A5'), start: t + 0.14, duration: 0.14, volume: 0.13 });
  },
};
