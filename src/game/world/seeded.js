// Random numbers that are always the same for the same name: the world is built the same way every time
// (it is never saved), but it looks random.

// A function that gives a new number between 0 and 1 at each call, always the same series for a name.
export function randomOf(name) {
  let seed = 0;
  for (const letter of String(name)) seed = (seed * 31 + letter.charCodeAt(0)) >>> 0;
  return () => {
    seed = (seed + 0x6d2b79f5) >>> 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// One thing of a list, with a series of random numbers.
export function pickWith(random, list) {
  return list[Math.floor(random() * list.length)];
}

// A whole number from min to max (both included).
export function between(random, min, max) {
  return min + Math.floor(random() * (max - min + 1));
}

// The list in a random order (a copy).
export function shuffledWith(random, list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
