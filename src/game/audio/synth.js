import { audioContext } from '../../sounds';

// A tiny chiptune synthesizer, like the old consoles: simple waves (square, triangle, saw) and noise.
// It uses the sound engine of the app (see sounds.js). Two volume knobs: the music and the effects.

const MUSIC_LEVEL = 0.6; // the loudest the music can be (it must not cover the effects)
const EFFECTS_LEVEL = 0.9;

let knobs = null; // { music: GainNode, effects: GainNode }, made the first time
let volumes = { music: 0.5, effects: 0.7 };

function applyVolumes() {
  if (!knobs) return;
  knobs.music.gain.value = volumes.music * MUSIC_LEVEL;
  knobs.effects.gain.value = volumes.effects * EFFECTS_LEVEL;
}

// The two knobs (null if the sound engine is not started yet).
export function outputs() {
  const context = audioContext();
  if (!context) return null;
  if (!knobs) {
    knobs = { music: context.createGain(), effects: context.createGain() };
    knobs.music.connect(context.destination);
    knobs.effects.connect(context.destination);
    applyVolumes();
  }
  return knobs;
}

// music, effects: from 0 to 1 (the options of the game).
export function setVolumes(music, effects) {
  volumes = { music: music, effects: effects };
  applyVolumes();
}

// Can we play now? (The browser keeps the sound asleep until the first tap.)
export function isAwake() {
  const context = audioContext();
  return context !== null && context.state === 'running' && outputs() !== null;
}

export function now() {
  return audioContext().currentTime;
}

const NOTES = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };

// 'A4' -> 440 Hz. 'C#5' -> 554 Hz.
export function frequencyOf(note) {
  const octave = Number(note.slice(-1));
  const semitones = NOTES[note.slice(0, -1)] + (octave - 4) * 12 - 9; // from A4
  return 440 * Math.pow(2, semitones / 12);
}

// One note: a wave that starts quickly and fades out.
// to: where it goes (a knob). slideTo: the frequency at the end (a "pew"), optional.
export function tone(to, { wave, frequency, start, duration, volume, slideTo }) {
  const context = audioContext();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = wave;
  oscillator.frequency.setValueAtTime(frequency, start);
  if (slideTo) oscillator.frequency.exponentialRampToValueAtTime(slideTo, start + duration);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain);
  gain.connect(to);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

let noiseBuffer = null;

// One second of random sound (made once).
function whiteNoise(context) {
  if (noiseBuffer) return noiseBuffer;
  noiseBuffer = context.createBuffer(1, context.sampleRate, context.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return noiseBuffer;
}

// A short burst of noise: a drum, a hit, a footstep. highpass: only the sharp part (a hi-hat). lowpass: only the dull part.
export function noise(to, { start, duration, volume, highpass = 0, lowpass = 0 }) {
  const context = audioContext();
  const source = context.createBufferSource();
  source.buffer = whiteNoise(context);
  const gain = context.createGain();
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  let last = source;
  for (const [type, frequency] of [
    ['highpass', highpass],
    ['lowpass', lowpass],
  ]) {
    if (!frequency) continue;
    const filter = context.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = frequency;
    last.connect(filter);
    last = filter;
  }
  last.connect(gain);
  gain.connect(to);
  source.start(start);
  source.stop(start + duration + 0.02);
}

// A new knob for one song (so it can fade out alone), connected to the music knob.
export function songKnob() {
  const gain = audioContext().createGain();
  gain.connect(outputs().music);
  return gain;
}
