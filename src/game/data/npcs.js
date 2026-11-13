// The people of the world.
// x, y: where they stand (in tiles). look: how they are drawn (see draw/people.js).
// life: their story. A new line is told each time the friendship grows (see FRIEND_STEPS in logic/people.js).
// shop: what they sell. teaches: the element they can teach. fighter: can be recruited.
// romance: true = the player can date and marry her. likes: the gifts she loves.
// partner: married to this person from the start.
export const NPCS = [
  {
    id: 'aria', name: 'Aria', role: 'Healer of Lexia', x: 55.5, y: 65.5, shop: 'clinic', romance: true, likes: ['flower'],
    look: { skin: '#fde0c8', hair: '#ff9ec4', style: 'long', eyes: '#4fb37a', outfit: '#ffffff', trim: '#ff9ec4' },
    hello: ['You are awake! Take it slowly.', 'Words heal here. Wrong ones hurt.', 'Come back alive. Please.'],
    life: [
      'I found you in the meadow, under the falling star. Nobody falls from the sky, usually.',
      'My mother was the healer before me. The Silence took her voice, then her life.',
      'Every night I count the people of the village. I am afraid of the day the number is smaller.',
      'When you are near, I forget to be afraid. Is that a word in your world too?',
    ],
  },
  {
    id: 'mira', name: 'Mira', role: 'Blacksmith', x: 67.5, y: 65.5, shop: 'forge', romance: true, teaches: 'fire', likes: ['gem', 'oldCoin'],
    look: { skin: '#e9b98f', hair: '#e5482e', style: 'pony', eyes: '#f0a020', outfit: '#5a4636', trim: '#e5482e' },
    hello: ['Prices are prices. Unless you can out-talk me.', 'A blade is a sentence: one wrong part and it breaks.', 'Need steel?'],
    life: [
      'My father forged the sword of the last hero. I forge horseshoes. For now.',
      'He went north with that hero, a hundred years... no. Ten years ago. Time is strange near the Tower.',
      'I keep the forge burning all night. If he comes back, he must see the light.',
      'I made a ring once. I told myself it was only practice.',
    ],
  },
  {
    id: 'yuki', name: 'Yuki', role: 'Librarian', x: 60.5, y: 63.5, job: 'scribe', romance: true, teaches: 'water', likes: ['oldCoin', 'flower'],
    look: { skin: '#f7e6dc', hair: '#cfe6ff', style: 'long', eyes: '#5b7bd6', outfit: '#31406e', trim: '#cfe6ff' },
    hello: ['Shh. The books are sleeping.', 'I pay for clean copies. One Lexis per perfect line.', 'Read. Then read again.'],
    life: [
      'I copy the old books before the Silence eats their ink. Each week, some pages come back white.',
      'The Demon King was not born a demon. The oldest book calls him "the Hero of Words".',
      'I never left this library. I know the whole world, and I have seen none of it.',
      'If you go north, take me with you in your stories. Or... truly take me. One day.',
    ],
  },
  {
    id: 'hana', name: 'Hana', role: 'Farmer', x: 56.5, y: 80.5, romance: true, teaches: 'earth', likes: ['carrot'],
    look: { skin: '#f3c9a0', hair: '#7ac86a', style: 'twin', eyes: '#8a5a2b', outfit: '#e8c15a', trim: '#7ac86a' },
    hello: ['The field is yours too. Plant, water, wait!', 'Carrots do not lie. Feed them, they feed you.', 'Sunny today!'],
    life: [
      'Three brothers, all gone to be soldiers. So I farm for four.',
      'I talk to the carrots. They are bad at grammar, but they listen.',
      'The eldest wrote every week. No letter since the winter.',
      'I would like a full table again. Noisy. Too many chairs.',
    ],
  },
  {
    id: 'bea', name: 'Old Bea', role: 'Baker', x: 55.5, y: 75.5, shop: 'bakery', likes: ['carrot', 'flower'],
    look: { skin: '#eac9a8', hair: '#d9d9d9', style: 'bun', eyes: '#6b4a2b', outfit: '#b5651d', trim: '#ffffff' },
    hello: ['Bread first. Heroes second.', 'You are too thin, child.', 'Fresh from the oven!'],
    life: [
      'Sixty years of bread. I fed three elders and one hero.',
      'The last hero loved my honey loaf. He smiled a lot, back then.',
      'My husband was the first man the Silence took in Lexia.',
      'You eat like him. Do not end like him.',
    ],
  },
  {
    id: 'orin', name: 'Elder Orin', role: 'Elder of Lexia', x: 68.5, y: 75.5, likes: ['bread'],
    look: { skin: '#e2bf9a', hair: '#f2f2f2', style: 'bald', eyes: '#444444', outfit: '#6b3fa0', trim: '#f2d16b', beard: true },
    hello: ['Every seven nights, the north grows louder.', 'A village is a sentence. Everyone is a word in it.', 'Welcome, fallen one.'],
    life: [
      'I was a boy when the last hero was summoned. I carried his bag to the gate.',
      'We asked too much of him. One man, and the grief of a whole kingdom.',
      'When he came back as our enemy, I was the one who closed the gate on him.',
      'If the Silence comes for me, do not avenge me. Finish the sentence.',
    ],
  },
  {
    id: 'tomo', name: 'Tomo', role: 'Kid', x: 62.5, y: 72.5, child: true, game: true, likes: ['bread', 'carrot'],
    look: { skin: '#f3c9a0', hair: '#5a3a1e', style: 'short', eyes: '#2b2b2b', outfit: '#3aa0d8', trim: '#ffffff', small: true },
    hello: ['Wanna play Word Sprint? I always win!', 'Are you REALLY from another world?', 'Elder Orin is my grandpa!'],
    life: [
      'Grandpa says my parents are "traveling". I am not a baby, I know what it means.',
      'When I grow up I will be a hero. Or a baker. Bakers eat more.',
      'I hid a treasure near the big lake. Even I forgot where.',
      'You are my best friend. Do not tell Garrick, he thinks it is him.',
    ],
  },
  {
    id: 'garrick', name: 'Garrick', role: 'Guard of the north gate', x: 66.5, y: 59.5, fighter: true, likes: ['bread'],
    look: { skin: '#c99872', hair: '#3b2a1a', style: 'short', eyes: '#3b3b3b', outfit: '#7d8597', trim: '#c9a227', beard: true },
    hello: ['Do not go north at night.', 'I count what comes down the road. It is always more.', 'Stay sharp.'],
    life: [
      'Twenty years at this gate. I have opened it for friends, and closed it on friends.',
      'I was there when the hero came back with black eyes. I did not raise my spear. I still wonder.',
      'My wife and my daughter left for Port Syntax. Safer. I write, they answer less and less.',
      'Take me north. I am tired of waiting for the war to come to me.',
    ],
  },
  {
    id: 'finn', name: 'Finn', role: 'Carpenter', x: 72.5, y: 67.5, partner: 'lila', likes: ['bread'],
    look: { skin: '#e9b98f', hair: '#c98a3b', style: 'short', eyes: '#2f6f4f', outfit: '#4f7d3a', trim: '#e9d8a6' },
    hello: ['The cradle is almost done!', 'Wood listens better than people.', 'Lila says hello. She says it for me.'],
    life: [
      'I built half the houses here. The other half, my father did.',
      'I am going to be a father. I am terrified. Do not tell Lila.',
      'I started carving a toy sword. Then I stopped. Then a toy plough.',
      'If something happens to me, the roof needs new nails before winter. Promise.',
    ],
  },
  {
    id: 'lila', name: 'Lila', role: 'Weaver', x: 73.5, y: 67.5, partner: 'finn', likes: ['flower'],
    look: { skin: '#fde0c8', hair: '#8a5fd0', style: 'long', eyes: '#d06fa0', outfit: '#d8b4f8', trim: '#8a5fd0' },
    hello: ['Finn talks to the cradle more than to me.', 'Everything is a thread. Pull one, the rest moves.', 'Hello, traveler!'],
    life: [
      'I weave the banners of Lexia. The oldest one has a name we are not allowed to say.',
      'We chose a name for the baby. A word the Silence can not take: a verb.',
      'I dream of the north. In the dream, someone is crying under the castle.',
      'Protect this village. Not for the stones. For the small ones.',
    ],
  },
  {
    id: 'luna', name: 'Luna', role: 'Fox merchant', x: 97.5, y: 89.5, shop: 'market', romance: true, likes: ['gem', 'oldCoin'],
    look: { skin: '#fde0c8', hair: '#ff9a3c', style: 'long', eyes: '#f2c200', outfit: '#2f8f83', trim: '#ffe9c2', ears: true },
    hello: ['Maps, rings, secrets. Two of them are for sale.', 'A good deal has a subject, a verb and a price.', 'Nya... I mean, welcome.'],
    life: [
      'I sell maps of places I ran away from.',
      'My people lived in the Silent Lands, before they were silent. We had forty words for "home".',
      'I remember three of them. I sell maps so I never forget the road back.',
      'If you make the north speak again... I will close the shop. I will go home. Come with me?',
    ],
  },
  {
    id: 'rosa', name: 'Rosa', role: 'Innkeeper', x: 103.5, y: 89.5, likes: ['carrot', 'bread'],
    look: { skin: '#d9a47a', hair: '#7a2f2f', style: 'bun', eyes: '#5a3a1e', outfit: '#a23b5a', trim: '#ffe9c2' },
    hello: ['Sailors pay in stories. You pay in Lexis.', 'Sit. Eat. Talk.', 'The sea is calm. The north is not.'],
    life: [
      'Every traveler who goes north sleeps here first. I keep their names in a book.',
      'Few names are crossed out as "returned".',
      'A guard from Lexia writes to me. I am his wife. I do not know what to answer.',
      'Tell Garrick... no. I will tell him myself. Soon.',
    ],
  },
  {
    id: 'selene', name: 'Selene', role: 'Knight captain', x: 109.5, y: 89.5, fighter: true, romance: true, teaches: 'wind', likes: ['gem'],
    look: { skin: '#fde0c8', hair: '#f4dc7a', style: 'pony', eyes: '#3a7bd5', outfit: '#c9d1e0', trim: '#3a7bd5' },
    hello: ['State your purpose.', 'A sword without discipline is a shout.', 'Hm. You are still alive. Good.'],
    life: [
      'I command twelve knights. I had forty.',
      'General Barbarism was my teacher. He taught me every guard I know.',
      'I must be the one who ends him. I also know I can not do it alone.',
      'When it is over, I want to learn something that is not war. Teach me your world.',
    ],
  },
  {
    id: 'kai', name: 'Kai', role: 'Fisherman', x: 99.5, y: 95.5, likes: ['bread'],
    look: { skin: '#b9825a', hair: '#2b2b3a', style: 'short', eyes: '#2b2b2b', outfit: '#2a6f97', trim: '#ffffff' },
    hello: ['Fish do not care about grammar. Lucky fish.', 'Storm in three days. My knee says so.', 'Ahoy.'],
    life: [
      'I fish where the map ends. The water is quieter there. Too quiet.',
      'Once I pulled up a bottle. Inside, a letter with every word scratched out but one: "sorry".',
      'I kept the letter. I think I know who wrote it.',
      'A king who says sorry is still a man. Remember that, up north.',
    ],
  },
  {
    id: 'nyx', name: 'Nyx', role: 'Girl from the north', x: 20.5, y: 66.5, fighter: true, romance: true, nightOnly: true, likes: ['flower', 'bread'],
    look: { skin: '#e6d5e8', hair: '#6a3fb5', style: 'long', eyes: '#e0304e', outfit: '#1c1c28', trim: '#6a3fb5', horns: true },
    hello: ['Do not scream. I am tired of screams.', 'You smell like another world.', 'The night is the only time I can be here.'],
    life: [
      'Yes, the horns are real. No, I will not eat you.',
      'In the castle, nobody has spoken for years. I ran away to hear voices. Any voices.',
      'The Demon King is my father. He was kind once. He told me stories of a world with "exams".',
      'If you must fight him, take me. He may still listen to one voice. Mine.',
    ],
  },
];

export function npcOf(id) {
  return NPCS.find((npc) => npc.id === id);
}

// The look of the player.
export const HERO_LOOK = { skin: '#f3d2b3', hair: '#8a4b24', style: 'spiky', eyes: '#3a6fd8', outfit: '#2d3a6e', trim: '#d6302f', pants: '#3b3652', boots: '#6b4423', scarf: true, sword: true };

// Names for the babies born in the world.
export const BABY_NAMES = ['Verba', 'Nomen', 'Syl', 'Lexi', 'Clause', 'Rhema', 'Tilde', 'Odea', 'Punct', 'Vowel', 'Ink', 'Quill'];
