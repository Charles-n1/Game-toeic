// The powers used on the map (not the grammar spells of a fight: see data/types.js).
// key: what the player must have awakened or learned to use it ('obsidian', 'lightning', or an element).
// mana: its cost. cooldown: seconds to wait before using it again. Its icon has its id (see draw/icons.js).
export const POWERS = [
  // ---------- Obsidian: the hidden power. It awakens at level 3. ----------
  { id: 'obsidianBarrier', key: 'obsidian', name: 'Obsidian Barrier', mana: 2, cooldown: 8, text: 'A ring of black glass around you for 10 s. Monsters can not pass.' },
  { id: 'obsidianSoldier', key: 'obsidian', name: 'Obsidian Soldier', mana: 4, cooldown: 20, text: 'A soldier of obsidian follows you (3 max). Each one adds +10 damage.' },
  { id: 'obsidianPet', key: 'obsidian', name: 'Obsidian Cat', mana: 3, cooldown: 30, text: 'A small cat of obsidian. It shows the buried treasures near you.' },
  { id: 'obsidianBlade', key: 'obsidian', name: 'Obsidian Blade', mana: 5, cooldown: 40, text: 'Your weapon turns to obsidian: +20 damage for 5 fights.' },

  // ---------- Lightning: the second hidden power. It awakens the Night of Silence. ----------
  { id: 'lightningStrike', key: 'lightning', name: 'Thunder Verdict', mana: 6, cooldown: 25, text: 'Kills the small monsters near you, wounds the big ones. No answer, so no XP.' },
  { id: 'lightningField', key: 'lightning', name: 'Storm Field', mana: 5, cooldown: 45, text: 'A storm zone for 30 s. A fight started inside: +10 damage and +30% time.' },
  { id: 'lightningBall', key: 'lightning', name: 'Lightning Ball', mana: 3, cooldown: 6, text: 'A ball of lightning flies forward and wounds the first monster (40 HP).' },

  // ---------- Elements: taught by friends ----------
  { id: 'water', key: 'water', name: 'Healing Rain', mana: 4, cooldown: 20, text: 'Gives back 60 HP.' },
  { id: 'fire', key: 'fire', name: 'Fireball', mana: 3, cooldown: 8, text: 'A ball of fire flies forward and wounds the first monster (20 HP).' },
  { id: 'wind', key: 'wind', name: 'Wind Dash', mana: 2, cooldown: 15, text: 'You run twice as fast for 8 s.' },
  { id: 'earth', key: 'earth', name: 'Stone Skin', mana: 3, cooldown: 30, text: '+20 armor for your next fight.' },
];

export function powerOf(id) {
  return POWERS.find((power) => power.id === id);
}

// What a friend asks to teach an element.
export const LESSON_PRICE = 100; // Lexis
export const LESSON_FRIENDSHIP = 20;
