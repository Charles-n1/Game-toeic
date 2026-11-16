import { villageOf } from '../data/zones';

// The animals of the pens (pigs, cows, chickens, horses), on screen in the villages close to the hero.
// How many each village has: game.villages[id].animals (they breed and are eaten: logic/villages.js).

const ANIMAL_SPEED = { pig: 0.6, cow: 0.4, chicken: 0.9, horse: 0.8 };
const KINDS = ['cow', 'pig', 'horse', 'chicken'];
const MAX_SHOWN = 6; // per kind and per pen

// The animals of a village, shared between its pens.
function animalsOfVillage(game, village) {
  const animals = [];
  const pens = village.plan.pens;
  const counts = game.villages[village.id].animals;
  if (pens.length === 0) return animals;
  for (const kind of KINDS) {
    for (let i = 0; i < Math.min(counts[kind] || 0, MAX_SHOWN * pens.length); i++) {
      const pen = pens[i % pens.length];
      animals.push({ kind: kind, pen: pen, village: village.id, x: pen.x + 0.5 + Math.random() * (pen.w - 1), y: pen.y + 0.5 + Math.random() * (pen.h - 1), walkX: 0, walkY: 0, walkTime: 0, step: Math.random() * 4, dir: 'right' });
    }
  }
  return animals;
}

// The animals of the villages on screen (see game.run.awake, logic/villagers.js).
export function placeAnimals(game) {
  game.run.animals = (game.run.awake || []).flatMap((id) => animalsOfVillage(game, villageOf(id)));
}

// When the villages on screen change, their animals follow.
export function wakeAnimals(game) {
  const shown = new Set(game.run.animals.map((animal) => animal.village));
  const awake = game.run.awake || [];
  if (awake.length === shown.size && awake.every((id) => shown.has(id))) return;
  placeAnimals(game);
}

export function updateAnimals(game, dt) {
  for (const animal of game.run.animals) {
    animal.walkTime -= dt;
    if (animal.walkTime <= 0) {
      const angle = Math.random() * Math.PI * 2;
      const isResting = Math.random() < 0.5;
      animal.walkX = isResting ? 0 : Math.cos(angle);
      animal.walkY = isResting ? 0 : Math.sin(angle);
      animal.walkTime = 1 + Math.random() * 3;
    }
    const pen = animal.pen;
    const x = animal.x + animal.walkX * ANIMAL_SPEED[animal.kind] * dt;
    const y = animal.y + animal.walkY * ANIMAL_SPEED[animal.kind] * dt;
    if (x > pen.x + 0.3 && x < pen.x + pen.w - 0.3) animal.x = x;
    if (y > pen.y + 0.3 && y < pen.y + pen.h - 0.3) animal.y = y;
    if (animal.walkX !== 0) animal.dir = animal.walkX < 0 ? 'left' : 'right';
    if (animal.walkX !== 0 || animal.walkY !== 0) animal.step += dt * 5;
  }
}
