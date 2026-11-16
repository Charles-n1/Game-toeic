// The isekai side of the world: the heroes summoned before the player, the curses, the hot springs,
// the arenas and the events of the sky. (The logic: logic/isekai/.)

// ---------- The Lost Hero ----------
// The diary of the first summoned hero. One page is found at each Hero's Grave (see world/wildPlaces.js),
// in this order. The last page tells who the Demon King really is.
export const LOST_HERO_PAGES = [
  ['Day 1.', 'I failed my English exam this morning. Then a truck. Then a goddess.', 'She says that words are power here. Funny. Words were never my thing.'],
  ['Day 40.', 'The villagers call me "the Hero". Maelle, the healer, corrects my grammar every evening.', 'She laughs when I say "I have 17 years old". I am learning faster than I ever did at school.'],
  ['Day 300.', 'We beat the Demon King today. Yes: there was one before.', 'Before he fell, he said: "You will sit on this chair too, summoned one." I laughed.'],
  ['Day 1,204.', 'Maelle is dead. A fever. No monster, no curse: just a fever.', 'I begged the goddess. I used every word I knew. Words heal here, they said. Not this time.'],
  ['I do not count the days anymore.', 'If words could not save her, then words are lies. I will take them back. All of them.', 'Let the world be as silent as her room.'],
  ['To the next one the goddess sends: I am sorry.', 'My name was Louis. They call me Solecis now.', 'When you reach my throne, do not talk to Solecis. Talk to Louis. He always answered when Maelle said his name.'],
];

// What is written on the graves: the friends of the Lost Hero, who walked with him.
export const GRAVE_WORDS = [
  'Here lies Maelle, healer. "She corrected everyone, gently."',
  'Here lies Borin, the shield of the party.',
  'Here lies Ysolde, who sang the maps.',
  'Here lies Tam, the youngest. He carried the bags.',
  'Here lies a knight of the first war. The name is worn away.',
  'A stone without a name. Someone left fresh flowers.',
];

// The hero knows the name of the Demon King: the fight starts differently.
export const KING_NAME_WEAKENS = 0.75; // his health is multiplied by this: he hesitates when he hears "Louis"
export const KING_TRUTH_ENDING = [
  '"Louis." You say it once more. The crown falls and rolls on the stone.',
  '"Maelle used to say it like that," he whispers. "With a smile in the middle."',
];

// ---------- The curses ----------
// A cursed thing looks like a treasure. Once worn, it can not be taken off, and it eats the health of the hero
// (CURSE_HP_PER_HOUR). A rite of words lifts the curse, at a shrine of the goddess or at a church.
export const CURSE_HP_PER_HOUR = 2;
export const CURSED_DROP_CHANCE = 0.12; // when one of the monsters of CURSED_DROPPERS dies
export const CURSED_DROPPERS = ['mimic', 'wraith', 'banshee', 'cultist', 'demonLich', 'demonPriest', 'succubus', 'velmora'];
export const CURSED_ITEMS = ['whisperRing', 'hungryAmulet', 'crownOfThorns'];
export const RITE_GOOD_ANSWERS = 5; // the rite of purification: this many good answers before 3 mistakes

// ---------- The hot springs ----------
export const SPRING_HOURS = 2; // a bath takes this long
export const SPRING_FRIENDSHIP = 4; // each friend who bathes with the hero likes them a bit more

// ---------- The arenas ----------
// A tournament = 3 duels of words in a row, harder and harder. Once a day in each arena.
// look: how the fighter is drawn (like the people, see draw/people.js).
export const ARENA_FEE = 30; // Lexis to enter
export const ARENA_ROUNDS = [
  { name: 'Tobin the Rookie', tag: 'normal', health: 3, speed: 9, prize: 40, look: { skin: '#f3d2b3', hair: '#c48c52', style: 'short', eyes: '#3b3b3b', outfit: '#6b8a3a', trim: '#e9d8a6', sword: true } },
  { name: 'Greta the Veteran', tag: 'hard', health: 4, speed: 12, prize: 90, look: { skin: '#e9b98f', hair: '#9aa6b8', style: 'bun', eyes: '#3b3b3b', outfit: '#7a4a24', trim: '#c9d1e0', sword: true, scarf: true } },
  { name: 'Valdric the Champion', tag: 'hard', health: 5, speed: 15, prize: 200, look: { skin: '#c98c5a', hair: '#1c1726', style: 'spiky', eyes: '#a8202a', outfit: '#9aa6b8', trim: '#ffd23f', helmet: true, sword: true } },
];
export const CHAMPION_GIFT = 'gem'; // given the first time the hero wins a whole tournament

// ---------- The events of the world ----------
// One may start at the beginning of a day (see logic/isekai/events.js). It lasts until the next morning.
export const EVENT_CHANCE = 0.3; // each morning (never two days in a row)
export const FIRST_EVENT_DAY = 3; // the first days are calm: the hero is still learning
export const EVENTS = {
  bloodMoon: {
    name: 'Blood Moon', icon: '🌕', starts: '🌕 Tonight the moon will rise red. The monsters will be many... and worth twice the Lexis.',
    text: 'A red moon: more monsters at night, double Lexis for each one.',
  },
  stampede: {
    name: 'Monster Stampede', icon: '🐗', starts: '🔔 EMERGENCY QUEST from the Guild: a stampede of monsters! Defeat {goal} today for a reward of {reward} Lexis.',
    text: 'The Guild pays for every monster stopped today.',
  },
  starNight: {
    name: 'Night of Falling Stars', icon: '🌠', starts: '🌠 The old people say the stars will fall tonight. Be outside when they do.',
    text: 'Stars fall all night. One of them may fall near you.',
  },
};
export const STAMPEDE_GOAL = 6;
export const STAMPEDE_REWARD = 150;
export const BLOOD_MOON_MONSTERS = 2; // the wild monsters are this many times more, at night
export const BLOOD_MOON_LEXIS = 2;
