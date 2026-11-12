// Reading the time of the world. game.hour goes from 0 to 24 (6 = sunrise, 20 = night).

export const DAY_SECONDS = 480; // a whole day of the game lasts 8 real minutes
export const SUNRISE = 6;
export const NIGHTFALL = 20;

export function isNight(game) {
  return game.hour >= NIGHTFALL || game.hour < SUNRISE;
}

// How dark it is, from 0 (day) to 1 (deep night). The evening and the morning change slowly.
export function darkness(game) {
  const hour = game.hour;
  if (hour >= 18 && hour < 21) return (hour - 18) / 3;
  if (hour >= 21 || hour < 4) return 1;
  if (hour >= 4 && hour < 7) return 1 - (hour - 4) / 3;
  return 0;
}

// "Day 3 · 14:20"
export function clockText(game) {
  const hours = Math.floor(game.hour);
  const minutes = Math.floor((game.hour - hours) * 60);
  return 'Day ' + game.day + ' · ' + String(hours).padStart(2, '0') + ':' + String(minutes).padStart(2, '0');
}
