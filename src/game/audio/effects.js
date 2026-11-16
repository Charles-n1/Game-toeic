import { isAwake, now, outputs, tone, noise, frequencyOf } from './synth';

// The sound effects of the game, made by the synthesizer (no sound file).

// A few notes, one after the other. notes: ['C5', 'E5'], gap: seconds between two of them.
function arpeggio(to, start, notes, gap, wave, volume) {
  notes.forEach((note, i) => tone(to, { wave: wave, frequency: frequencyOf(note), start: start + i * gap, duration: gap * 1.6, volume: volume }));
}

const EFFECTS = {
  // A good answer: two quick rising notes.
  good: (to, t) => arpeggio(to, t, ['E6', 'A6'], 0.07, 'square', 0.12),
  // A wrong answer: a low buzz going down.
  wrong: (to, t) => tone(to, { wave: 'sawtooth', frequency: 220, slideTo: 90, start: t, duration: 0.3, volume: 0.12 }),
  // A critical hit: a fast climb and a crash.
  critical: (to, t) => {
    arpeggio(to, t, ['C6', 'E6', 'G6', 'C7'], 0.035, 'square', 0.1);
    noise(to, { start: t + 0.12, duration: 0.25, volume: 0.25, lowpass: 3000 });
  },
  // The player is hit.
  hit: (to, t) => {
    noise(to, { start: t, duration: 0.15, volume: 0.35, lowpass: 1200 });
    tone(to, { wave: 'sine', frequency: 120, slideTo: 50, start: t, duration: 0.15, volume: 0.4 });
  },
  levelUp: (to, t) => {
    arpeggio(to, t, ['C5', 'E5', 'G5', 'C6', 'E6', 'G6'], 0.07, 'square', 0.1);
    arpeggio(to, t, ['C4', 'E4', 'G4', 'C5', 'E5', 'G5'], 0.07, 'triangle', 0.18);
  },
  coin: (to, t) => arpeggio(to, t, ['B5', 'E6'], 0.06, 'square', 0.08),
  click: (to, t) => tone(to, { wave: 'square', frequency: 1300, start: t, duration: 0.025, volume: 0.04 }),
  step: (to, t) => noise(to, { start: t, duration: 0.03, volume: 0.06, lowpass: 900 }),
  victory: (to, t) => {
    arpeggio(to, t, ['G5', 'C6', 'E6', 'G6'], 0.1, 'square', 0.1);
    tone(to, { wave: 'triangle', frequency: frequencyOf('C5'), start: t + 0.4, duration: 0.5, volume: 0.2 });
  },
  defeat: (to, t) => arpeggio(to, t, ['E5', 'C5', 'A4', 'E4'], 0.22, 'triangle', 0.2),
  // A lightning strike: a crack, then a long low rumble.
  thunder: (to, t) => {
    noise(to, { start: t, duration: 0.12, volume: 0.45, lowpass: 6000 });
    noise(to, { start: t + 0.08, duration: 1.6, volume: 0.3, lowpass: 300 });
  },
};

// Plays an effect of EFFECTS. Nothing happens while the sound is asleep (before the first tap).
export function playEffect(name) {
  if (!EFFECTS[name] || !isAwake()) return;
  EFFECTS[name](outputs().effects, now());
}
