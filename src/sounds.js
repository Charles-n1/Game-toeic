import answerSuccessUrl from './assets/Sound/answer_success.mp3';
import answerWrongUrl from './assets/Sound/answer_wrong.mp3';
import victoryUrl from './assets/Sound/victory.mp3';
import loose1Url from './assets/Sound/loose_1.mp3';
import loose3Url from './assets/Sound/loose_3.mp3';
import backgroundMusicUrl from './assets/Music/background_music.mp3';
import backgroundMusic2Url from './assets/Music/background_music2.mp3';
import backgroundMusic3Url from './assets/Music/background_music3.mp3';

export const MUSICS = [
  { name: 'Background music', file: backgroundMusicUrl },
  { name: 'Background music 2', file: backgroundMusic2Url },
  { name: 'Background music 3', file: backgroundMusic3Url },
  { name: 'Off', file: null },
];

const SOUND_FILES = {
  success: answerSuccessUrl,
  wrong: answerWrongUrl,
  victory: victoryUrl,
  loose1: loose1Url,
  loose3: loose3Url,
};

// The browser's sound mixer (Web Audio). Each volume is a "gain" knob.
// Why not audio.volume? The iPhone ignores it: the volume would always be 100%.
let context = null;
let soundGain = null;
let musicGain = null;
const soundBuffers = {}; // the sounds, already decoded: they play instantly
const musicElement = new Audio();
musicElement.loop = true; // restart at the end
let musicUrl = null; // the music file currently assigned to musicElement
let wanted = { music: MUSICS[0], musicVolume: 0.3, soundVolume: 1 };
let appMusicMuted = false; // true while the game is open: the game plays its own music

// Events browsers accept as a valid user activation to start Web Audio & HTMLAudioElement playback.
const TAP_EVENTS = ['pointerdown', 'pointerup', 'mousedown', 'touchend', 'click', 'keydown'];

// Called once, when the app opens.
// Browsers block sound until a first tap. So: assign the music URL synchronously,
// try to play immediately, and resume/start on the very first tap or keystroke.
export function startAudio(settings) {
  wanted = { music: settings.music, musicVolume: settings.musicVolume, soundVolume: settings.soundVolume };
  // iPhone: play even when the silent switch is on 🔕
  if (navigator.audioSession) navigator.audioSession.type = 'playback';

  context = new AudioContext(); // "asleep" (suspended) until the first tap on most browsers
  soundGain = context.createGain();
  soundGain.gain.value = wanted.soundVolume;
  soundGain.connect(context.destination);
  musicGain = context.createGain();
  musicGain.gain.value = wanted.musicVolume;
  musicGain.connect(context.destination);
  context.createMediaElementSource(musicElement).connect(musicGain);

  for (const [name, url] of Object.entries(SOUND_FILES)) {
    loadSound(name, url);
  }
  playMusic(wanted.music);

  for (const name of TAP_EVENTS) {
    window.addEventListener(name, wakeUpAudio);
  }
  document.addEventListener('visibilitychange', pauseWhenHidden);
}

// On each tap: wake AudioContext and start the TOEIC music if it is still paused.
function wakeUpAudio() {
  if (!context) return;
  const tryPlay = () => {
    if (!appMusicMuted && wanted.music.file && musicElement.src && musicElement.paused) {
      musicElement.play().catch(() => {});
    }
  };
  if (context.state === 'suspended') {
    context.resume().then(tryPlay).catch(() => {});
  }
  tryPlay();
}

async function loadSound(name, url) {
  const response = await fetch(url);
  const data = await response.arrayBuffer();
  soundBuffers[name] = await context.decodeAudioData(data);
}

// Like the Expo app: the music stops when you leave the app, and comes back.
function pauseWhenHidden() {
  if (document.hidden) {
    musicElement.pause();
  } else if (wanted.music.file && !appMusicMuted) {
    musicElement.play().catch(() => {});
  }
}

// The sound engine of the app, for the game (it makes its own music and effects with it). null = not started.
export function audioContext() {
  return context;
}

// The game opens (true): the music of the app stops. The game closes (false): it comes back.
export function muteAppMusic(muted) {
  appMusicMuted = muted;
  if (muted) musicElement.pause();
  else wakeUpAudio();
}

// volume: from 0 (mute) to 1 (max)
export function setMusicVolume(volume) {
  wanted.musicVolume = volume;
  if (musicGain) musicGain.gain.value = volume;
}

export function setSoundVolume(volume) {
  wanted.soundVolume = volume;
  if (soundGain) soundGain.gain.value = volume;
}

export function playMusic(music) {
  wanted.music = music;
  if (!context) return; // startAudio() not called yet

  if (music.file === null) {
    musicUrl = null;
    musicElement.pause();
    return;
  }
  if (musicUrl !== music.file) {
    musicUrl = music.file;
    musicElement.src = music.file;
  }
  if (appMusicMuted) return;
  wakeUpAudio();
}

// name: 'success' | 'wrong' | 'victory' | 'loose1' | 'loose3'
export function playSound(name) {
  if (!context || !soundBuffers[name]) return;
  const source = context.createBufferSource(); // a one-shot player
  source.buffer = soundBuffers[name];
  source.connect(soundGain);
  source.start();
}
