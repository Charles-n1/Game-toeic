export function pickRandom(list) {
  const index = Math.floor(Math.random() * list.length);
  return list[index];
}

// A shuffled copy of the list (the list itself is not changed). Fisher-Yates: every order has the same chance.
export function shuffle(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
