import { SONGS } from './songs';
import { isAwake, now, songKnob, tone, noise, frequencyOf } from './synth';

// Plays the songs of songs.js in a loop. The notes are prepared a little in advance (LOOKAHEAD),
// so the music never stutters, even when the page is busy.

const LOOKAHEAD = 0.2; // seconds
const TICK = 50; // milliseconds between two preparations

let playing = null; // { id, voices, step, nextTime, knob, timer }

// 'E5 - G5 .' -> ['E5', '-', 'G5', '.']
function tokensOf(voice) {
  return voice.notes.split(' ');
}

// An eighth note, in seconds.
function stepSeconds(song) {
  return 60 / song.bpm / 2;
}

// How many eighth notes a note lasts: 1, + 1 for each '-' after it.
function lengthAt(tokens, index) {
  let length = 1;
  while (tokens[(index + length) % tokens.length] === '-' && length < tokens.length) length++;
  return length;
}

function playDrum(knob, token, time, volume) {
  if (token === 'K') tone(knob, { wave: 'sine', frequency: 150, slideTo: 45, start: time, duration: 0.14, volume: volume });
  if (token === 'H') noise(knob, { start: time, duration: 0.04, volume: volume * 0.25, highpass: 6000 });
}

// What one voice does at one step of the song.
function playStep(voice, tokens, step, time) {
  const index = step % tokens.length;
  const token = tokens[index];
  if (voice.wave === 'drums') {
    playDrum(playing.knob, token, time, voice.volume);
    return;
  }
  if (token === '.' || token === '-') return;
  const duration = lengthAt(tokens, index) * stepSeconds(playing.song) * 0.92;
  tone(playing.knob, { wave: voice.wave, frequency: frequencyOf(token), start: time, duration: duration, volume: voice.volume });
}

// Prepares the notes of the next LOOKAHEAD seconds.
function prepareNotes() {
  if (!playing) return;
  if (!isAwake()) {
    playing.nextTime = null; // the sound is asleep (no tap yet): start again when it wakes up
    return;
  }
  if (playing.nextTime === null) playing.nextTime = now() + 0.05;
  while (playing.nextTime < now() + LOOKAHEAD) {
    playing.voices.forEach(({ voice, tokens }) => playStep(voice, tokens, playing.step, playing.nextTime));
    playing.step += 1;
    playing.nextTime += stepSeconds(playing.song);
  }
}

// The song that plays now fades out.
export function stopSong() {
  if (!playing) return;
  clearInterval(playing.timer);
  if (playing.knob) {
    const knob = playing.knob;
    knob.gain.setTargetAtTime(0, now(), 0.15);
    setTimeout(() => knob.disconnect(), 1000);
  }
  playing = null;
}

// Plays a song of SONGS (nothing changes if it already plays). id: 'village', 'fight'...
export function playSong(id) {
  if (playing && playing.id === id) return;
  if (!isAwake()) return; // try again at the next frame, after the first tap
  stopSong();
  const song = SONGS[id];
  playing = {
    id: id,
    song: song,
    voices: song.voices.map((voice) => ({ voice: voice, tokens: tokensOf(voice) })),
    step: 0,
    nextTime: null,
    knob: songKnob(),
  };
  playing.timer = setInterval(prepareNotes, TICK);
  prepareNotes();
}
