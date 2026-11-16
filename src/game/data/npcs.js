// The people of the world.
// x, y: where they stand (in tiles). look: how they are drawn (see draw/people.js).
//   look.sheet: drawn from a sprite sheet of art/Characters (see draw/characterArt.js); the colors are only
//   used until the pictures are loaded.
// life: their story. A new line is told each time the friendship grows (see FRIEND_STEPS in logic/people.js).
// shop: what they sell. teaches: the element they can teach. fighter: can be recruited.
// romance: true = the player can date and marry them. likes: the gifts they love.
// partner: married to this person from the start. nightOnly: only outside at night.
// school: true = gives lessons at the Arcane School (see logic/school.js). The masters of the classes: data/classes.js.
// bonds: what the others are to them: { otherId: 'love' | 'family' | 'friend' | 'rival' | 'mentor' | 'student' }
//   (luna: { selene: 'mentor' } = Selene teaches Luna).
//   A gift makes their friends, family and love happy too, and their rivals a bit jealous (see logic/village.js).
export const NPCS = [
  {
    id: 'aria', name: 'Aria', role: 'Healer of Lexia', x: 55.5, y: 65.5, shop: 'clinic', romance: true, likes: ['flower'], bonds: { elara: 'friend', corvin: 'rival' },
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
    id: 'mira', name: 'Mira', role: 'Blacksmith', x: 67.5, y: 65.5, shop: 'forge', romance: true, teaches: 'fire', likes: ['gem', 'oldCoin'], bonds: { darius: 'student' },
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
    id: 'hana', name: 'Hana', role: 'Farmer', x: 56.5, y: 80.5, romance: true, teaches: 'earth', likes: ['carrot'], bonds: { sylvia: 'friend' },
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
    id: 'orin', name: 'Elder Orin', role: 'Elder of Lexia', x: 68.5, y: 75.5, likes: ['bread'], bonds: { tomo: 'family' },
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
    id: 'tomo', name: 'Tomo', role: 'Kid', x: 62.5, y: 72.5, child: true, game: true, likes: ['bread', 'carrot'], bonds: { orin: 'family', lucien: 'friend' },
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
    id: 'garrick', name: 'Garrick', role: 'Guard of the north gate', x: 66.5, y: 59.5, fighter: true, likes: ['bread'], bonds: { rosa: 'love', arthur: 'friend' },
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
    id: 'finn', name: 'Finn', role: 'Carpenter', x: 72.5, y: 67.5, partner: 'lila', likes: ['bread'], bonds: { lila: 'love' },
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
    id: 'lila', name: 'Lila', role: 'Weaver', x: 73.5, y: 67.5, partner: 'finn', shop: 'weaver', likes: ['flower'], bonds: { finn: 'love' },
    look: { skin: '#fde0c8', hair: '#8a5fd0', style: 'long', eyes: '#d06fa0', outfit: '#d8b4f8', trim: '#8a5fd0' },
    hello: ['Finn talks to the cradle more than to me.', 'Everything is a thread. Pull one, the rest moves.', 'Cloth for a torch? Wrap it tight, it burns longer.'],
    life: [
      'I weave the banners of Lexia. The oldest one has a name we are not allowed to say.',
      'We chose a name for the baby. A word the Silence can not take: a verb.',
      'I dream of the north. In the dream, someone is crying under the castle.',
      'Protect this village. Not for the stones. For the small ones.',
    ],
  },
  {
    id: 'rin', name: 'Rin', role: 'Fox merchant', x: 97.5, y: 89.5, shop: 'market', romance: true, likes: ['gem', 'oldCoin'], bonds: { dorian: 'friend' },
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
    id: 'rosa', name: 'Rosa', role: 'Innkeeper', x: 103.5, y: 89.5, likes: ['carrot', 'bread'], bonds: { garrick: 'love' },
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
    id: 'lyra', name: 'Lyra', role: 'Paladin, captain of the Dawn', x: 109.5, y: 89.5, fighter: true, romance: true, teaches: 'wind', likes: ['gem'],
    bonds: { arthur: 'student', hinata: 'friend', dorian: 'rival' },
    look: { sheet: 'lyra', skin: '#fde0c8', hair: '#f4dc7a', style: 'long', eyes: '#3a7bd5', outfit: '#e8e4f2', trim: '#e8b83a' },
    hello: ['State your purpose.', 'A sword without discipline is a shout. A shield without faith is a door.', 'Hm. You are still alive. Good.'],
    life: [
      'I command twelve knights of the Order of the Dawn. I had forty.',
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
    id: 'nyx', name: 'Nyx', role: 'Girl from the north', x: 20.5, y: 66.5, fighter: true, romance: true, nightOnly: true, likes: ['flower', 'bread'], bonds: { vespera: 'friend' },
    look: { skin: '#e6d5e8', hair: '#6a3fb5', style: 'long', eyes: '#e0304e', outfit: '#1c1c28', trim: '#6a3fb5', horns: true },
    hello: ['Do not scream. I am tired of screams.', 'You smell like another world.', 'The night is the only time I can be here.'],
    life: [
      'Yes, the horns are real. No, I will not eat you.',
      'In the castle, nobody has spoken for years. I ran away to hear voices. Any voices.',
      'The Demon King is my father. He was kind once. He told me stories of a world with "exams".',
      'If you must fight him, take me. He may still listen to one voice. Mine.',
    ],
  },

  // ---------- The people of the sprite sheets (art/Characters) ----------

  // Lexia: the Arcane House and the Arcane School
  {
    id: 'luna', name: 'Luna', role: 'Mage of the Royal Academy', x: 73.5, y: 75.5, romance: true, likes: ['gem', 'flower'],
    bonds: { selene: 'mentor', elara: 'friend' },
    look: { sheet: 'luna', skin: '#fde0c8', hair: '#8a4b24', style: 'long', eyes: '#3a6fd8', outfit: '#2d3a8e', trim: '#e8b83a' },
    hello: ['Oh! A visitor in the Arcane House! Mind the books, they bite.', 'Magic is grammar that glows.', 'The tenses are a river. I swim in it every morning.'],
    life: [
      'The Royal Academy sent me here to study the Silence. I stayed for the bread of Old Bea.',
      'Selene says I cast too fast. She is right. I am always afraid the words will run away.',
      'My first spell was a gerund: "flying". I fell. But for one second, I was flying.',
      'Stay for tea after your lessons? Not for the tea. For you. ...Forget I said that.',
    ],
  },
  {
    id: 'selene', name: 'Selene', role: 'Arcanist, head of the Arcane School', x: 72.5, y: 82.5, school: true, romance: true, likes: ['gem', 'oldCoin'],
    bonds: { luna: 'student', elara: 'friend', vespera: 'rival' },
    look: { sheet: 'selene', skin: '#fde0c8', hair: '#d8d4f0', style: 'long', eyes: '#8a6fe0', outfit: '#2a2a6e', trim: '#e8b83a' },
    hello: ['Welcome to the Arcane School. Here, we train the words before we throw them.', 'A connector holds a spell together. Without it, it falls apart.', 'Lessons cost a little. Ignorance costs a lot.'],
    life: [
      'The Astral Circle reads the stars. The stars, they say, are the commas of the sky.',
      'I opened this school the day the Silence took the voice of my sister.',
      'Vespera was my best student. Then she asked the dead for answers. I asked the living.',
      'When you train here at night, I stay late too. I tell myself it is for the school.',
    ],
  },
  {
    id: 'elara', name: 'Elara', role: 'Witch and healer', x: 75.5, y: 82.5, romance: true, likes: ['flower', 'carrot'],
    bonds: { aria: 'friend', luna: 'friend', selene: 'friend' },
    look: { sheet: 'elara', skin: '#fde0c8', hair: '#5a3a8a', style: 'long', eyes: '#b48cff', outfit: '#2c2342', trim: '#e8b83a' },
    hello: ['A potion for every pain. A word for every potion.', 'Do not drink the green one. Unless you want to.', 'The Arcane Circle says hello. I say hello too.'],
    life: [
      'Aria heals with hands. I heal with brews. We argue, then we drink tea.',
      'A witch must know each form of a word: heal, healer, healing, healthy. Each one cures something else.',
      'I tried to brew a potion against the Silence. It made the cat sing for a week.',
      'If you ever fall in the north, I will brew you back. I promise. Do not make me.',
    ],
  },
  {
    id: 'darius', name: 'Darius', role: 'Smith of the Guild', x: 69.5, y: 65.5, romance: true, likes: ['gem', 'oldCoin'],
    bonds: { mira: 'mentor', dorian: 'family', kaelthra: 'friend' },
    look: { sheet: 'darius', skin: '#e9b98f', hair: '#2b2b3a', style: 'short', eyes: '#c98a3b', outfit: '#3a2a22', trim: '#a8202a' },
    hello: ['Mira lets me use the small anvil. Someday, the big one.', 'A hammer hits where you look, not where you want.', 'Need something forged? Ask Mira. Then ask me again.'],
    life: [
      'The Blacksmith Guild sent me to learn from Mira. She is younger than me. She is better than me.',
      'I forged the runeblade of Kaelthra. It still glows when she is angry. Which is often.',
      'My twin, Dorian, left the Guild for the road. We had the same face. Not the same heart.',
      'Words are like steel: heat them, fold them, and they become strong. You taught me that.',
    ],
  },
  {
    id: 'arthur', name: 'Arthur', role: 'Knight of the Dawn', x: 62.5, y: 57.5, fighter: true, romance: true, likes: ['bread'],
    bonds: { lyra: 'mentor', garrick: 'friend' },
    look: { sheet: 'arthur', skin: '#f3d2b3', hair: '#2b2b3a', style: 'short', eyes: '#3a6fd8', outfit: '#c9d1e0', trim: '#2f50a0' },
    hello: ['Captain Lyra sent me to guard this gate with Garrick.', 'Prepositions are like a formation: in, on, at. Each one in its place.', 'Halt! ...Ah, it is you.'],
    life: [
      'I am the youngest knight of the Dawn. They gave me the gate nobody wanted.',
      'Garrick tells me stories all night. Half are true. I do not know which half.',
      'The passive voice is a knight\'s voice: "the gate was held". Nobody asks by whom.',
      'If the walls fall one night, I will be the last stone. Unless you are next to me.',
    ],
  },

  // Port Syntax
  {
    id: 'hinata', name: 'Hinata', role: 'Samurai of the Sakura Legion', x: 106.5, y: 95.5, fighter: true, romance: true, likes: ['flower'],
    bonds: { kaelthra: 'rival', lyra: 'friend' },
    look: { sheet: 'hinata', skin: '#fde0c8', hair: '#2b1f3a', style: 'pony', eyes: '#a8202a', outfit: '#8a1f2f', trim: '#ff9ec4' },
    hello: ['A blade is drawn once. A word, too.', 'Faster than... no. As fast as. Comparatives are a duel.', 'The cherry trees of my land are far.'],
    life: [
      'The Sakura Legion sent me over the sea to fight the Silence. The sea was the hard part.',
      'Kaelthra and I fought eleven times. Eleven draws. The twelfth will decide.',
      'Time is a blade too: had I come one day sooner, my master would still live.',
      'I do not say this often: you are faster than me. With words. Only with words.',
    ],
  },
  {
    id: 'kaelthra', name: 'Kaelthra', role: 'Runeblade of the Ember Order', x: 110.5, y: 95.5, fighter: true, romance: true, likes: ['gem'],
    bonds: { hinata: 'rival', darius: 'friend' },
    look: { sheet: 'kaelthra', skin: '#fde0c8', hair: '#d0202a', style: 'pony', eyes: '#ffb020', outfit: '#2a1a24', trim: '#d0202a' },
    hello: ['Runes are just words that refuse to be quiet.', 'Hinata? Still alive? Good. I will beat her myself.', 'Burn bright. Burn correctly.'],
    life: [
      'The Ember Order writes runes on blades. One wrong letter, and the blade explodes.',
      'Darius forged my sword. He said it was too heavy. I said he was too slow.',
      'Each form of a word is a different fire: burn, burning, burnt. I learned them all the hard way.',
      'You are the first one who made me laugh in a year. That rune was not planned.',
    ],
  },
  {
    id: 'lucien', name: 'Lucien', role: 'Puppeteer of the Umbral Troupe', x: 94.5, y: 93.5, romance: true, likes: ['oldCoin', 'flower'],
    bonds: { vespera: 'friend', tomo: 'friend' },
    look: { sheet: 'lucien', skin: '#f3e6e0', hair: '#2b1f3a', style: 'short', eyes: '#b48cff', outfit: '#2c2342', trim: '#e8b83a' },
    hello: ['Every puppet needs a subject and a verb. And strings.', 'The show starts at sunset. It never ends.', 'Do not look at the mask. It looks back.'],
    life: [
      'The Umbral Troupe travels from town to town. We play the stories that the Silence ate.',
      'My puppets speak when I can not. Since the Silence, they speak more than me.',
      'The mask belonged to my father. "He plays, they play, we play." He taught me with it.',
      'You pull my strings too, you know. Gently. I do not mind.',
    ],
  },
  {
    id: 'dorian', name: 'Dorian', role: 'Brigand of the Free Mercenaries', x: 100.5, y: 96.5, fighter: true, romance: true, likes: ['oldCoin', 'bread'],
    bonds: { darius: 'family', rin: 'friend', lyra: 'rival' },
    look: { sheet: 'dorian', skin: '#e9b98f', hair: '#5a3a1e', style: 'spiky', eyes: '#5a3a1e', outfit: '#2a2a3a', trim: '#d0202a' },
    hello: ['Free Mercenaries. Free for those who pay.', 'Quicker, sharper, richer. The comparatives of my life.', 'Lyra is watching? Then I am a fisherman.'],
    life: [
      'My twin Darius chose the anvil. I chose the road. Our mother still cries for one of us.',
      'I steal only from those who stole first. Mostly.',
      'Rin buys what I find. She never asks where. That is friendship.',
      'With you, I would almost become honest. Almost. Do not tell my brother.',
    ],
  },

  // In the wild
  {
    id: 'kael', name: 'Kael', role: 'Beastmaster of the Forest Wardens', x: 31.5, y: 72.5, fighter: true, romance: true, likes: ['bread', 'carrot'],
    bonds: { sylvia: 'friend' },
    look: { sheet: 'kael', skin: '#e9d8c8', hair: '#2b2b3a', style: 'spiky', eyes: '#8fa6c9', outfit: '#2c2a36', trim: '#e9e2d0' },
    hello: ['The wolf likes you. That is rare. I do not.', 'He, she, they: the pack knows who is who.', 'Sit by the fire. The forest is loud tonight.'],
    life: [
      'The Forest Wardens watch Verbwood. Since the Silence, the wolves are angry. I talk to them.',
      'This wolf is Sombre. I found him in the snow, alone. We were both alone.',
      'Sylvia says the trees remember every word said under them. I try to say good ones.',
      'Sombre sleeps next to you now. He chose. I agree with him.',
    ],
  },
  {
    id: 'sylvia', name: 'Sylvia', role: 'Druid of the Verdant Circle', x: 16.5, y: 72.5, romance: true, likes: ['flower', 'carrot'],
    bonds: { kael: 'friend', hana: 'friend' },
    look: { sheet: 'sylvia', skin: '#fde0c8', hair: '#5a9a3a', style: 'long', eyes: '#3f9a3c', outfit: '#2f5a2a', trim: '#e8b83a' },
    hello: ['Shh. The moss is speaking.', 'Under, over, between: the roots know every preposition.', 'Few people find this grove. You did.'],
    life: [
      'The Verdant Circle has only three druids left. I am the youngest. I am also the oldest.',
      'I grew this grove from one seed. It took one hundred years. Do not ask my age.',
      'Hana sends me carrots. I send her rain. It is a good trade.',
      'When the Silence ends, I will plant a tree for you. It will remember your name.',
    ],
  },
  {
    id: 'vespera', name: 'Vespera', role: 'Necromancer of the Obsidian Order', x: 11.5, y: 63.5, nightOnly: true, romance: true, likes: ['flower', 'gem'],
    bonds: { selene: 'rival', lucien: 'friend', nyx: 'friend', corvin: 'mentor' },
    look: { sheet: 'vespera', skin: '#e8dcec', hair: '#2b1f3a', style: 'long', eyes: '#b48cff', outfit: '#1c1a3a', trim: '#e8b83a' },
    hello: ['The dead speak better English than the living. They had time to practice.', 'The crypt is quiet tonight. Too quiet.', 'Do not be afraid. I only bite verbs.'],
    life: [
      'The Obsidian Order keeps the voices of the dead. The Silence can not take what is already gone.',
      'Selene was my teacher. She thinks I went too far. Maybe. But I came back.',
      'The Lich in the crypt was a teacher too, once. He loved gerunds. Then he loved them too much.',
      'You are warm. I forgot what warm was. Stay a little.',
    ],
  },
  {
    id: 'corvin', name: '???', role: 'Plague Doctor', x: 89.5, y: 72.5, nightOnly: true, likes: ['gem', 'oldCoin'],
    bonds: { vespera: 'student', aria: 'rival' },
    look: { sheet: 'corvin', skin: '#e9d8c8', hair: '#1c1726', style: 'short', eyes: '#d0202a', outfit: '#2a1c22', trim: '#a8202a' },
    hello: ['The Silence is a sickness. I study it.', 'Do not come closer. Or do. Science needs volunteers.', 'My name? Later. Names are contagious.'],
    life: [
      'The Cercle des Ombres sent me to find the cure. The cure is not a potion. It is a voice.',
      'Each wrong form of a word is a symptom. "He go." Fever. "He goes." Healthy.',
      'Aria thinks I am a crow with bad manners. She is half right.',
      'My name is Corvin. You are the first to hear it in ten years. Keep it warm.',
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
