// Particles: the small things that fly when something happens (sparks, coins, numbers...).
// Positions are in tiles, like everything on the map. A particle: { x, y, vx, vy, life, age, color, size, text }
// size: in pixels of the art (a square), or in screen pixels for a text.

const MAX_PARTICLES = 400;
const MAX_BLOOD = 80;
const MAX_TRACKS = 100;

export function addParticle(game, particle) {
  if (game.run.particles.length < MAX_PARTICLES) {
    game.run.particles.push({
      age: 0,
      gravity: 0,
      vx: particle.vx !== undefined ? particle.vx : (particle.dx || 0),
      vy: particle.vy !== undefined ? particle.vy : (particle.dy || 0),
      ...particle,
    });
  }
}

// Persistent blood splatters left on the ground after lethal blows or ambush traps.
export function bloodSplatter(game, x, y, count = 10) {
  if (game.run) {
    if (!Array.isArray(game.run.blood)) game.run.blood = [];
    const pools = 1 + (count >= 12 ? 1 : 0);
    for (let i = 0; i < pools; i++) {
      if (game.run.blood.length >= MAX_BLOOD) game.run.blood.shift();
      game.run.blood.push({
        x: x + (Math.random() - 0.5) * 0.65,
        y: y + (Math.random() - 0.5) * 0.45,
        r: 0.28 + Math.random() * 0.28,
        age: 0,
        life: 24 + Math.random() * 10,
        seed: Math.random() * 100,
      });
    }
  }
  bloodHit(game, x, y, count);
}

// Crimson splash droplets from heavy wounds or traps.
export function bloodHit(game, x, y, count = 7) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.8 + Math.random() * 2.4;
    addParticle(game, {
      x: x + (Math.random() - 0.5) * 0.25,
      y: y + (Math.random() - 0.5) * 0.25,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 0.8,
      gravity: 5.5,
      life: 0.35 + Math.random() * 0.25,
      color: i % 3 === 0 ? '#7a0e16' : i % 2 ? '#b81d2a' : '#e02a3b',
      size: 1 + (i % 2),
    });
  }
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

// Persistent footprints or hoof tracks left briefly on sand, snow, or rain-soaked ground.
export function addTrack(game, x, y, dx = 0, dy = 1, kind = 'foot') {
  if (!game || !game.run) return;
  if (!Array.isArray(game.run.tracks)) game.run.tracks = [];
  if (game.run.tracks.length >= MAX_TRACKS) game.run.tracks.shift();
  const len = Math.hypot(dx, dy) || 1;
  const side = ((game.run.tracks.length % 2) === 0 ? 1 : -1) * 0.1;
  const px = -dy / len;
  const py = dx / len;
  game.run.tracks.push({
    x: x + px * side,
    y: y + py * side,
    kind: kind,
    age: 0,
    life: kind === 'hoof' ? 6.5 : 5.5,
  });
}

// Expanding concentric shockwave ring VFX drawn cleanly in scene.js.
export function spawnRing(game, x, y, maxRadius = 3, color = '#b48cff', width = 2, life = 0.5) {
  if (!game || !game.run) return;
  if (!Array.isArray(game.run.vfxRings)) game.run.vfxRings = [];
  if (game.run.vfxRings.length >= 24) game.run.vfxRings.shift();
  game.run.vfxRings.push({ x, y, maxRadius, color, width, age: 0, life });
}

// Jagged obsidian crystal spikes erupting out of the ground around (x, y).
export function spawnSpikes(game, x, y, radius = 4, count = 12, color = '#b48cff') {
  if (!game || !game.run) return;
  if (!Array.isArray(game.run.spikes)) game.run.spikes = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.2;
    const dist = radius * (0.4 + Math.random() * 0.6);
    if (game.run.spikes.length >= 48) game.run.spikes.shift();
    game.run.spikes.push({
      x: x + Math.cos(angle) * dist,
      y: y + Math.sin(angle) * dist,
      h: 12 + Math.floor(Math.random() * 10),
      color,
      age: 0,
      life: 1.05,
    });
  }
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
  if (Array.isArray(game.run.blood)) {
    for (const pool of game.run.blood) pool.age += dt;
    game.run.blood = game.run.blood.filter((pool) => pool.age < pool.life);
  }
  if (Array.isArray(game.run.tracks)) {
    for (const track of game.run.tracks) track.age += dt;
    game.run.tracks = game.run.tracks.filter((track) => track.age < track.life);
  }
  if (Array.isArray(game.run.vfxRings)) {
    for (const r of game.run.vfxRings) r.age += dt;
    game.run.vfxRings = game.run.vfxRings.filter((r) => r.age < r.life);
  }
  if (Array.isArray(game.run.spikes)) {
    for (const sp of game.run.spikes) sp.age += dt;
    game.run.spikes = game.run.spikes.filter((sp) => sp.age < sp.life);
  }
}
