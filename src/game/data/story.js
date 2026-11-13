// The story of the game. It follows the goal the player chose at the start.

// The four ways to live in this world. icon: its pixel picture (see draw/icons.js).
export const GOALS = [
  { id: 'hero', icon: 'lexiconBlade', title: 'Defeat the Demon King', text: 'Walk north. End the Silence at its source.' },
  { id: 'guardian', icon: 'shield', title: 'Protect the village', text: 'Stop General Barbarism, the enemy at the gate.' },
  { id: 'peaceful', icon: 'carrot', title: 'Live a peaceful life', text: 'A field, friends, a family. Let the heroes be heroes.' },
  { id: 'wanderer', icon: 'wind', title: 'Just be here', text: 'No plan. See what the world does.' },
];

export function goalOf(id) {
  return GOALS.find((goal) => goal.id === id);
}

// The opening, told by the goddess. {score} is replaced by the TOEIC score of the player.
export const INTRO = [
  'You were running to your TOEIC exam. You never saw the truck.',
  '...',
  'Do not be afraid. I am Lexa, goddess of the spoken word.',
  'My world, the kingdom of Lexia, is dying of Silence. A Demon King steals the words from my people, one by one.',
  'Here, words are power. A correct sentence cuts like a blade. A wrong one opens your guard.',
  'I read your soul: a reading score of {score}. Not a hero yet. But you can grow. That is why I chose you.',
  'One more thing. Something sleeps in you, black and bright. Even I can not read it. Be careful with it.',
];

// The last sentence of the goddess: it changes with the goal.
export const GOAL_BLESSING = {
  hero: 'Go north, to the Castle of Silence. Make him speak again... or make him fall.',
  guardian: 'A village found you. Every seven nights the north attacks it. Stand at its gate.',
  peaceful: 'You owe me nothing. Plant, love, grow old. But know this: the Silence does not ask before it comes.',
  wanderer: 'Then simply live. I will watch. Even gods like a good story.',
};

// The chapters of each goal, in order. done(game): true when the chapter is finished.
// place: where to go (a zone or a person), shown on the world map with the gold diamond.
// reward: Lexis given at the end of the chapter.
const MEET_ARIA = { id: 'meet', place: { npc: 'aria' }, title: 'A new world', text: 'Talk to Aria, the girl who found you.', reward: 10, done: (game) => game.npcs.aria.talkedDay > 0 };
const FIRST_WORDS = { id: 'firstWords', place: { zone: 'meadow' }, title: 'First words', text: 'Defeat 5 monsters in Whisper Meadow.', reward: 30, done: (game) => game.counts.kills >= 5 };
const NIGHT_OF_SILENCE = { id: 'night', place: { zone: 'lexia' }, title: 'The Night of Silence', text: 'Survive the first attack on Lexia (night 7).', reward: 100, done: (game) => game.raid.count >= 1 };
const CRYPT = { id: 'crypt', place: { zone: 'crypt' }, title: 'The Crypt of Gerunds', text: 'West, in Verbwood: defeat the Gerund Lich.', reward: 150, done: (game) => game.bosses.lich === true };
const GENERAL = { id: 'general', place: { zone: 'fort' }, title: 'The teacher of war', text: 'East of the mountain road: defeat General Barbarism in Fort Mutter.', reward: 500, done: (game) => game.bosses.general === true };

export const CHAPTERS = {
  hero: [
    MEET_ARIA,
    FIRST_WORDS,
    { id: 'blade', place: { npc: 'mira' }, title: 'A real blade', text: 'Earn Lexis and buy the Iron Sword from Mira.', reward: 40, done: (game) => game.player.weapon !== 'woodSword' },
    CRYPT,
    NIGHT_OF_SILENCE,
    { id: 'tower', place: { zone: 'tower' }, title: 'The Tower of Tenses', text: 'In Frostpeak Pass: defeat the Chrono Warden.', reward: 300, done: (game) => game.bosses.warden === true },
    GENERAL,
    { id: 'king', place: { zone: 'castle' }, title: 'The Hero of Words', text: 'Far north, the Castle of Silence. Solecis is waiting.', reward: 0, done: (game) => game.bosses.king === true },
  ],
  guardian: [
    MEET_ARIA,
    FIRST_WORDS,
    { id: 'ally', place: { npc: 'garrick' }, title: 'Not alone', text: 'Become friends with a fighter and recruit them.', reward: 60, done: (game) => game.player.party.length > 0 },
    NIGHT_OF_SILENCE,
    CRYPT,
    { id: 'wall', place: { zone: 'lexia' }, title: 'The wall of Lexia', text: 'Win 2 raids without losing anyone that night.', reward: 300, done: (game) => game.raid.perfect >= 2 },
    GENERAL,
  ],
  peaceful: [
    MEET_ARIA,
    { id: 'harvest', place: { npc: 'hana' }, title: 'The first harvest', text: 'Plant carrots in the field south of Lexia and harvest 5.', reward: 30, done: (game) => game.counts.harvested >= 5 },
    { id: 'friends', place: { zone: 'lexia' }, title: 'Neighbors', text: 'Become friends with 3 people.', reward: 60, done: (game) => friendCount(game) >= 3 },
    NIGHT_OF_SILENCE,
    { id: 'happy', place: { zone: 'lexia' }, title: 'A happy village', text: 'Help people until the happiness of Lexia reaches 70.', reward: 150, done: (game) => game.happiness >= 70 },
    { id: 'wedding', place: { npc: 'luna' }, title: 'A promise', text: 'Buy a ring in Port Syntax and marry someone you love.', reward: 200, done: (game) => game.player.spouse !== null },
    { id: 'family', place: { zone: 'lexia' }, title: 'A full table', text: 'Live together until a child is born.', reward: 0, done: (game) => game.player.children.length > 0 },
  ],
  wanderer: [
    MEET_ARIA,
    { id: 'lake', place: { zone: 'lake' }, title: 'Still water', text: 'Walk east and see Lake Clause.', reward: 20, done: (game) => game.visited.lake === true },
    { id: 'port', place: { zone: 'port' }, title: 'The smell of salt', text: 'Follow the road to Port Syntax.', reward: 40, done: (game) => game.visited.port === true },
    { id: 'forest', place: { zone: 'forest' }, title: 'Under the leaves', text: 'Walk west into Verbwood. At night, someone waits there.', reward: 40, done: (game) => game.visited.forest === true },
    { id: 'days', place: { zone: 'lexia' }, title: 'Ten sunrises', text: 'Simply live here for 10 days.', reward: 100, done: (game) => game.day >= 10 },
  ],
};

function friendCount(game) {
  return Object.values(game.npcs).filter((npc) => npc.friendship >= 20).length;
}

// Told when the last chapter of a goal is finished.
export const ENDINGS = {
  hero: [
    'Solecis falls to his knees. The black leaves his eyes.',
    '"I was summoned like you. I failed one exam, in the old world. Here, I failed everyone."',
    '"She died, and no word could bring her back. So I took all the words away."',
    'He looks at you, and for the first time in a hundred years, he speaks softly: "Thank you."',
    'In the whole kingdom, at the same moment, the people find their voices. The Silence is over.',
    'The world goes on. So can you.',
  ],
  guardian: [
    'General Barbarism drops his sword. He smiles like a teacher.',
    '"Good guard. Tell Selene... her stance was always better than mine."',
    'Without him, the raids of the north lose their shape. Lexia will stand.',
    'The Demon King is still up there. But tonight, the village sleeps.',
  ],
  peaceful: [
    'A small hand closes around your finger.',
    'You came from a world of exams and trucks. You stay for a field, a house, a voice that calls your name.',
    'The north is still dark. But here, the table is full, and noisy, and there are too many chairs.',
  ],
  wanderer: [
    'Ten sunrises. You counted them all.',
    'No prophecy. No crown. Just a world, and you in it.',
    'The story has no more chapters. That was the point.',
  ],
};

// ---------- The scenes: moments that happen once ----------

export const SCENES = {
  wakeUp: {
    speaker: 'aria',
    lines: [
      'Oh! You are awake! I am Aria. I found you in the meadow, under a falling star.',
      'This is Lexia. The house behind you is empty: it is yours now.',
      'Outside the village, the monsters fight with words. Answer right, and fast, to strike first.',
      'Their color is their type. Pink loves gerunds, yellow loves tenses... You will learn.',
      'If you fall, I will carry you home. But I can only do it three times. After that... please do not fall.',
    ],
  },
  obsidian: {
    speaker: null,
    lines: [
      'Your hand is cold. You look down: black glass covers your fingers, then melts back into your skin.',
      'OBSIDIAN has awakened. You can shape it: a wall, a soldier, a blade.',
      'Open the menu: Powers, to use it.',
    ],
  },
  omen: {
    speaker: 'orin',
    lines: [
      'The crows flew south this morning. All of them.',
      'In two nights, the north will come down the road. It always does, every seventh night.',
      'Buy potions. Sharpen something. And if you pray, pray in full sentences.',
    ],
  },
  nightOfSilence: {
    speaker: 'orin',
    lines: [
      'They are here. Everyone inside! Tomo, behind me!',
      '...',
      'The old man steps between the child and the monster. He does not have a weapon. He has never needed one.',
      '"Finish the sentence, fallen one."',
      'Elder Orin is dead.',
      'Something breaks in you. The sky answers. LIGHTNING has awakened.',
    ],
  },
  nyx: {
    speaker: 'nyx',
    lines: [
      'Do not scream. I am tired of screams.',
      'I am Nyx. I come from the castle you all fear. I ran away.',
      'I only walk at night. Come back and talk to me, if you dare.',
    ],
  },
  kingGate: {
    speaker: null,
    lines: [
      'The Castle of Silence. Your steps make no sound here.',
      'The questions of the north are not sentences. They are whole texts. Read well.',
    ],
  },
};
