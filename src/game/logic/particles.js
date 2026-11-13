// Particles: the small things that fly when something happens (sparks, coins, numbers...).
// Positions are in tiles, like everything on the map. A particle: { x, y, vx, vy, life, age, color, size, text }
// size: in pixels of the art (a square), or in screen pixels for a text.

const MAX_PARTICLES = 400;

function addParticle(game, particle) {
  if (game.run.particles.length < MAX_PARTICLES) game.run.particles.push({ age: 0, gravity: 0, ...particle });
}

// An explosion of small squares, in every direction.
export function burst(game, x, y, color, count = 14) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1 + Math.random() * 3;
    addParticle(game, {
      x: x,
      y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1,
      gravity: 4,
      life: 0.5 + Math.random() * 0.4,
      color: color,
      size: 1 + Math.floor(Math.random() * 2),
    });
  }
}

// A text that floats up and fades ("+12 XP", "-1", "CRITICAL!").
export function floatText(game, x, y, text, color = '#ffffff') {
  addParticle(game, { x: x, y: y - 0.6, vx: 0, vy: -0.9, life: 1.2, color: color, size: 14, text: text });
}

// A little cloud of dust (footsteps, digging).
export function dust(game, x, y, color = '#d8c9a8') {
  for (let i = 0; i < 4; i++) {
    addParticle(game, {
      x: x + (Math.random() - 0.5) * 0.4,
      y: y + 0.3,
      vx: (Math.random() - 0.5) * 0.8,
      vy: -Math.random() * 0.6,
      life: 0.4,
      color: color,
      size: 1,
    });
  }
}

// A bolt of lightning from the sky to (x, y): a line of bright sparks.
export function bolt(game, x, y) {
  for (let i = 0; i < 12; i++) {
    addParticle(game, {
      x: x + (Math.random() - 0.5) * 0.5,
      y: y - i * 0.5,
      vx: 0,
      vy: 0,
      life: 0.25 + i * 0.01,
      color: i % 2 ? '#ffffff' : '#9fd8ff',
      size: 2,
    });
  }
  burst(game, x, y, '#fff7a8', 16);
}

// Moves the particles and removes the dead ones. dt: seconds since the last frame.
export function updateParticles(game, dt) {
  for (const particle of game.run.particles) {
    particle.age += dt;
    particle.vy += particle.gravity * dt;
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
  }
  game.run.particles = game.run.particles.filter((particle) => particle.age < particle.life);
}
