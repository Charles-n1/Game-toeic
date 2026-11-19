import { zoneAt } from '../data/zones';
import { isNight } from '../logic/clock';
import { isAwake, now, noise, outputs, tone } from './synth';

let state = null;

function reset(game) {
  state = {
    game: game,
    lastHour: Math.floor(game.hour),
    nextNightSound: 0,
    nextWorkSound: 0,
  };
}

function bell(to, time) {
  tone(to, { wave: 'sine', frequency: 660, start: time, duration: 1.2, volume: 0.12 });
  tone(to, { wave: 'sine', frequency: 440, start: time + 0.15, duration: 1.4, volume: 0.09 });
}

function rooster(to, time) {
  tone(to, { wave: 'sawtooth', frequency: 520, slideTo: 880, start: time, duration: 0.18, volume: 0.06 });
  tone(to, { wave: 'sawtooth', frequency: 650, slideTo: 980, start: time + 0.2, duration: 0.16, volume: 0.05 });
}

function crickets(to, time) {
  for (let i = 0; i < 4; i++) {
    tone(to, { wave: 'square', frequency: 3900 + i * 120, start: time + i * 0.09, duration: 0.035, volume: 0.018 });
  }
}

function frogs(to, time) {
  tone(to, { wave: 'sawtooth', frequency: 190, slideTo: 260, start: time, duration: 0.09, volume: 0.045 });
  tone(to, { wave: 'sawtooth', frequency: 195, slideTo: 270, start: time + 0.14, duration: 0.11, volume: 0.045 });
}

function marketMurmur(to, time) {
  noise(to, { start: time, duration: 0.28, volume: 0.035, highpass: 600, lowpass: 2400 });
  tone(to, { wave: 'triangle', frequency: 520 + Math.random() * 180, start: time + 0.05, duration: 0.08, volume: 0.025 });
}

function windHowl(to, time) {
  noise(to, { start: time, duration: 0.75, volume: 0.045, highpass: 350, lowpass: 1200 });
}

function forge(to, time) {
  noise(to, { start: time, duration: 0.09, volume: 0.1, highpass: 1400, lowpass: 6500 });
  tone(to, { wave: 'sine', frequency: 180, start: time, duration: 0.16, volume: 0.06 });
}

export function updateAmbient(game) {
  if (!isAwake()) return;
  if (!state || state.game !== game) reset(game);

  const time = now();
  const hour = Math.floor(game.hour);
  const zone = zoneAt(game.player.x, game.player.y);
  const inVillage = zone?.kind === 'village';
  const night = isNight(game);
  const rain = game.weather?.kind === 'rain' || game.weather?.kind === 'storm';
  const to = outputs().effects;

  if (hour !== state.lastHour) {
    if (hour === 0 || hour === 6 || hour === 12 || hour === 18) bell(to, time);
    if (hour === 6) rooster(to, time + 0.25);
    state.lastHour = hour;
  }

  if (night && time >= state.nextNightSound) {
    if (rain || (game.life?.puddlesUntil || 0) > Date.now()) frogs(to, time);
    else crickets(to, time);
    state.nextNightSound = time + 8 + Math.random() * 8;
  }

  if (inVillage && !night && game.hour >= 7 && game.hour < 18 && time >= state.nextWorkSound) {
    if (Math.random() < 0.45) marketMurmur(to, time);
    else forge(to, time);
    state.nextWorkSound = time + 7 + Math.random() * 9;
  } else if (game.weather?.windy && time >= state.nextWorkSound) {
    windHowl(to, time);
    state.nextWorkSound = time + 9 + Math.random() * 6;
  }
}