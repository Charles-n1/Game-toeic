// Reading the time and season of the world. game.hour goes from 0 to 24.

export const DAY_SECONDS = 720; // a whole day of the game lasts 12 real minutes (the world is huge)
export const SUNRISE = 6;
export const NIGHTFALL = 20;
export const SEASONS = ['Spring', 'Summer', 'Autumn', 'Winter'];
export const DAYS_PER_SEASON = 15;

export function seasonOf(game) {
  const day = game?.day || 1;
  return SEASONS[Math.floor((day - 1) / DAYS_PER_SEASON) % SEASONS.length];
}

export function sunriseHour(game) {
  const s = seasonOf(game);
  return s === 'Winter' ? 7 : s === 'Summer' ? 5 : 6;
}

export function nightfallHour(game) {
  const s = seasonOf(game);
  return s === 'Winter' ? 18.5 : s === 'Summer' ? 21 : 20;
}

export function isNight(game) {
  return game.hour >= nightfallHour(game) || game.hour < sunriseHour(game);
}

// How dark it is, from 0 (day) to 1 (deep night). The evening and the morning change slowly.
export function darkness(game) {
  const hour = game.hour;
  const fall = nightfallHour(game);
  const rise = sunriseHour(game);
  if (hour >= fall - 2 && hour < fall + 1) return (hour - (fall - 2)) / 3;
  if (hour >= fall + 1 || hour < rise - 2) return 1;
  if (hour >= rise - 2 && hour < rise + 1) return 1 - (hour - (rise - 2)) / 3;
  return 0;
}

// "Day 3 · 14:20 · Spring"
export function clockText(game) {
  const hours = Math.floor(game.hour);
  const minutes = Math.floor((game.hour - hours) * 60);
  return 'Day ' + game.day + ' · ' + String(hours).padStart(2, '0') + ':' + String(minutes).padStart(2, '0') + ' · ' + seasonOf(game);
}
