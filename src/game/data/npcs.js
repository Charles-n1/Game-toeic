// The people of the world.
// at: where they live: [village, building (see data/buildings.js), a step to the right], ['lexia', 'gate'] (the
//   north gate), ['wild', id] (a lonely home of world/wildPlaces.js), null (a wanderer, met on the roads).
//   x, y (where they stand, in tiles) are found from it, at the end of this file. look: how they are drawn.
//   look.sheet: drawn from a sprite sheet of art/Characters (see draw/characterArt.js); the colors are only
//   used until the pictures are loaded.
// life: their story. A new line is told each time the friendship grows (see FRIEND_STEPS in logic/people.js).
// shop: what they sell. teaches: the element they can teach. fighter: can be recruited.
// romance: true = the player can date and marry them. likes: the gifts they love.
// partner: married to this person from the start. nightOnly: only outside at night.
// school: true = gives lessons at the Arcane School (see logic/school.js). The masters of the classes: data/classes.js.
// teachesSkills: the skills (spells) this researcher teaches (see logic/skills.js).
// guildMaster: runs the Guild of Adventurers. guild: a member of the guild (inside it: hired there, not met outside).
// wanderer: met only on the roads, from time to time (see logic/encounters.js); lands: where; meet: the first words.
// fee: what a fighter asks to follow the hero (see logic/guild.js).
// bonds: what the others are to them: { otherId: 'love' | 'family' | 'friend' | 'rival' | 'mentor' | 'student' }
//   (luna: { selene: 'mentor' } = Selene teaches Luna).
//   A gift makes their friends, family and love happy too, and their rivals a bit jealous (see logic/village.js).
import { spotOf } from './zones';

export const NPCS = [
  {
    id: 'aria', name: 'Aria', role: 'Healer of Eldermoor', at: ['lexia', 'clinic'], shop: 'clinic', romance: true, likes: ['flower'], bonds: { elara: 'friend', corvin: 'rival' },
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
    id: 'mira', name: 'Mira', role: 'Blacksmith', at: ['lexia', 'forge'], shop: 'forge', romance: true, teaches: 'fire', likes: ['gem', 'oldCoin'], bonds: { darius: 'student' },
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
    id: 'yuki', name: 'Yuki', role: 'Librarian', at: ['lexia', 'library'], teachesSkills: ['vocabulary', 'wordForms'], job: 'scribe', romance: true, teaches: 'water', likes: ['oldCoin', 'flower'],
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
    id: 'hana', name: 'Hana', role: 'Farmer', at: ['lexia', 'farm'], romance: true, teaches: 'earth', likes: ['carrot'], bonds: { sylvia: 'friend' },
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
    id: 'bea', name: 'Old Bea', role: 'Baker', at: ['lexia', 'bakery'], shop: 'bakery', likes: ['carrot', 'flower'],
    look: { skin: '#eac9a8', hair: '#d9d9d9', style: 'bun', eyes: '#6b4a2b', outfit: '#b5651d', trim: '#ffffff' },
    hello: ['Bread first. Heroes second.', 'You are too thin, child.', 'Fresh from the oven!'],
    life: [
      'Sixty years of bread. I fed three elders and one hero.',
      'The last hero loved my honey loaf. He smiled a lot, back then.',
      'My husband was the first man the Silence took in Eldermoor.',
      'You eat like him. Do not end like him.',
    ],
  },
  {
    id: 'orin', name: 'Elder Orin', role: 'Elder of Eldermoor', at: ['lexia', 'elder'], likes: ['bread'], bonds: { tomo: 'family' },
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
    id: 'tomo', name: 'Tomo', role: 'Kid', at: ['lexia', 'elder', 2], child: true, game: true, likes: ['bread', 'carrot'], bonds: { orin: 'family', lucien: 'friend' },
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
    id: 'garrick', name: 'Garrick', role: 'Guard of the north gate', at: ['lexia', 'gate'], fighter: true, likes: ['bread'], bonds: { rosa: 'love', arthur: 'friend' },
    look: { skin: '#c99872', hair: '#3b2a1a', style: 'short', eyes: '#3b3b3b', outfit: '#7d8597', trim: '#c9a227', beard: true },
    hello: ['Do not go north at night.', 'I count what comes down the road. It is always more.', 'Stay sharp.'],
    life: [
      'Twenty years at this gate. I have opened it for friends, and closed it on friends.',
      'I was there when the hero came back with black eyes. I did not raise my spear. I still wonder.',
      'My wife and my daughter left for Seabridge. Safer. I write, they answer less and less.',
      'Take me north. I am tired of waiting for the war to come to me.',
    ],
  },
  {
    id: 'finn', name: 'Finn', role: 'Carpenter', at: ['lexia', 'carpenter'], shop: 'carpenter', partner: 'lila', likes: ['bread'], bonds: { lila: 'love' },
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
    id: 'lila', name: 'Lila', role: 'Weaver', at: ['lexia', 'weaver'], partner: 'finn', shop: 'weaver', likes: ['flower'], bonds: { finn: 'love' },
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
    id: 'brann', name: 'Brann', role: 'Master of the Guild', at: ['lexia', 'guild'], guildMaster: true, likes: ['oldCoin', 'bread'],
    bonds: { arthur: 'friend', garrick: 'friend' },
    look: { skin: '#c99872', hair: '#8a8a8a', style: 'short', eyes: '#3b3b3b', outfit: '#3a5a8a', trim: '#e8b83a', beard: true },
    hello: ['The Guild of Adventurers. Swords for hire, if you can pay. Or talk.', 'Every adventurer has a price. Every price has a sentence.', 'Need hands for a dungeon?'],
    life: [
      'I led twenty adventurers, once. Now I lead a desk.',
      'The best ones do not come for the money. But they always ask for it.',
      'I sent the last hero north with five of my best. None came back. I still pay their rooms.',
      'You remind me of him. In the good way. Mostly.',
    ],
  },
  {
    id: 'rin', name: 'Rin', role: 'Fox merchant', race: 'beastkin', at: ['port', 'market'], shop: 'market', romance: true, likes: ['gem', 'oldCoin'], bonds: { dorian: 'friend' },
    look: { skin: '#fde0c8', hair: '#ff9a3c', style: 'long', eyes: '#f2c200', outfit: '#2f8f83', trim: '#ffe9c2', ears: true },
    hello: ['Maps, rings, secrets. Two of them are for sale.', 'A good deal has a subject, a verb and a price.', 'Nya... I mean, welcome.'],
    life: [
      'I sell maps of places I ran away from.',
      'My people lived on the Silent Isle, before they were silent. We had forty words for "home".',
      'I remember three of them. I sell maps so I never forget the road back.',
      'If you make the north speak again... I will close the shop. I will go home. Come with me?',
    ],
  },
  {
    id: 'rosa', name: 'Rosa', role: 'Innkeeper', at: ['port', 'inn'], likes: ['carrot', 'bread'], bonds: { garrick: 'love' },
    look: { skin: '#d9a47a', hair: '#7a2f2f', style: 'bun', eyes: '#5a3a1e', outfit: '#a23b5a', trim: '#ffe9c2' },
    hello: ['Sailors pay in stories. You pay in Lexis.', 'Sit. Eat. Talk.', 'The sea is calm. The north is not.'],
    life: [
      'Every traveler who goes north sleeps here first. I keep their names in a book.',
      'Few names are crossed out as "returned".',
      'A guard from Eldermoor writes to me. I am his wife. I do not know what to answer.',
      'Tell Garrick... no. I will tell him myself. Soon.',
    ],
  },
  {
    id: 'lyra', name: 'Lyra', role: 'Paladin, captain of the Dawn', at: ['port', 'barracks'], fee: 260, fighter: true, romance: true, teaches: 'wind', likes: ['gem'],
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
    id: 'kai', name: 'Kai', role: 'Fisherman', at: ['port', 'harbor'], likes: ['bread'],
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
    id: 'nyx', name: 'Nyx', role: 'Girl from the north', race: 'demon', at: ['wild', 'nyx'], fighter: true, romance: true, nightOnly: true, likes: ['flower', 'bread'], bonds: { vespera: 'friend' },
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

  // Eldermoor: the Arcane House and the Arcane School
  {
    id: 'luna', name: 'Luna', role: 'Mage of the Royal Academy', at: ['lexia', 'arcane'], teachesSkills: ['verbTenses', 'gerunds'], romance: true, likes: ['gem', 'flower'],
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
    id: 'selene', name: 'Selene', role: 'Arcanist, head of the Arcane School', at: ['lexia', 'school'], teachesSkills: ['connectors', 'subjectVerb'], school: true, romance: true, likes: ['gem', 'oldCoin'],
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
    id: 'elara', name: 'Elara', role: 'Witch and healer', at: ['lexia', 'potions'], shop: 'potions', romance: true, likes: ['flower', 'carrot'],
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
    id: 'darius', name: 'Darius', role: 'Smith of the Guild', at: ['greendale', 'smithy'], shop: 'forge', romance: true, likes: ['gem', 'oldCoin'],
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
    id: 'arthur', name: 'Arthur', role: 'Knight of the Dawn', at: ['lexia', 'guild', 2], guild: true, fee: 180, fighter: true, romance: true, likes: ['bread'],
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

  // Seabridge
  {
    id: 'hinata', name: 'Hinata', role: 'Samurai of the Sakura Legion', at: null, wanderer: true, fee: 240, lands: ['woods', 'watch', 'coast', 'meadow', 'lake'], meet: 'A samurai blocks the road, a hand on her katana. "You walk well. Do you fight as well?"', fighter: true, romance: true, likes: ['flower'],
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
    id: 'kaelthra', name: 'Kaelthra', role: 'Runeblade of the Ember Order', at: null, wanderer: true, fee: 260, lands: ['mountain', 'crystal', 'heartwood', 'oldwood'], meet: 'A red-haired swordswoman with a glowing blade. "Out of my way... no, wait. You are the one from the sky."', fighter: true, romance: true, likes: ['gem'],
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
    id: 'lucien', name: 'Lucien', role: 'Puppeteer of the Umbral Troupe', at: null, wanderer: true, lands: ['meadow', 'lake', 'coast', 'woods', 'forest'], meet: 'A masked puppeteer bows. His puppet bows too, a moment later. "A show, traveler? It is free for the lost."', romance: true, likes: ['oldCoin', 'flower'],
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
    id: 'dorian', name: 'Dorian', role: 'Brigand of the Free Mercenaries', at: null, wanderer: true, fee: 200, lands: ['desert', 'teeth', 'forest', 'meadow'], meet: 'A man with a red scarf and two daggers. He looks exactly like Darius the smith. "Wrong twin. I am Dorian."', fighter: true, romance: true, likes: ['oldCoin', 'bread'],
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
    id: 'kael', name: 'Kael', role: 'Beastmaster of the Forest Wardens', at: null, wanderer: true, fee: 220, lands: ['forest', 'heartwood', 'woods', 'mountain'], meet: 'A wolf steps out of the bushes. Then a man, wrapped in furs. "Sombre smelled you an hour ago."', fighter: true, romance: true, likes: ['bread', 'carrot'],
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
    id: 'sylvia', name: 'Sylvia', role: 'Druid of the Verdant Circle', at: ['wild', 'sylvia'], teachesSkills: ['prepositions', 'comparatives'], romance: true, likes: ['flower', 'carrot'],
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
    id: 'vespera', name: 'Vespera', role: 'Necromancer of the Obsidian Order', at: null, wanderer: true, lands: ['forest', 'oldwood', 'demon', 'heartwood', 'watch'], meet: 'A girl in a black hood, a skull on her shoulder. "Oh. A living one. How refreshing."', nightOnly: true, romance: true, likes: ['flower', 'gem'],
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
    id: 'corvin', name: '???', role: 'Plague Doctor', at: ['wild', 'corvin'], teachesSkills: ['passive', 'pronouns'], nightOnly: true, likes: ['gem', 'oldCoin'],
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

  // ---------- The classmates: two people of the exam room, who left our world the same day as the hero ----------
  // classmate: 'summoned' (called by a kingdom, like the hero) or 'reborn' (born again here, as a baby).
  // recognize: what they say the first time the hero tells them "I know you" (see logic/isekai/classmates.js).
  {
    id: 'lea', name: 'Lea', role: 'Hero summoned by Queen Sera', at: ['capital-lexia', 'palace'], classmate: 'summoned', fighter: true, fee: 300, romance: true, likes: ['gem', 'starShard'],
    bonds: { hugo: 'friend', lyra: 'rival' },
    look: { skin: '#fbe0cc', hair: '#e8d27a', style: 'pony', eyes: '#3a7bd8', outfit: '#e8ecf5', trim: '#e8b83a' },
    hello: ['The Queen calls me "the True Hero". I call myself late for my exam.', 'Do you also see a little window with your stats? No? Only me, then.', 'Train. The Demon King will not wait for us.'],
    recognize: [
      'You...! The one who always sat by the window!',
      'So the truck took you too. I woke up in a circle of candles, in this palace. I thought I was alone.',
      'Do not tell the Queen we know each other. She thinks the goddess sent me as a gift.',
    ],
    life: [
      'I was in the bus behind you. The same truck... and then a voice, and a light.',
      'They gave me a "cheat skill": Holy Sword. It only works when my sentences are perfect. So, not often.',
      'At school I never talked to you. Here, you are the only one who knows my real name.',
      'If we go home one day... we go together. Promise me.',
    ],
  },
  {
    id: 'hugo', name: 'Hugo', role: 'Innkeeper of Riverford, reborn', at: ['riverford', 'inn'], classmate: 'reborn', shop: 'otherworld', likes: ['carrot', 'bread'],
    bonds: { lea: 'friend' },
    look: { skin: '#e9b98f', hair: '#4a3a2a', style: 'short', eyes: '#3b8a4a', outfit: '#7a5a3a', trim: '#f0d080' },
    hello: ['Try the curry. Nobody here knew what a curry was. Now there is a queue.', 'Mayonnaise made me rich. Do not tell anybody it is only eggs and oil.', 'Seventeen years in this world, and I still dream in my old language.'],
    recognize: [
      '...That face. The exam room. Room 204!',
      'I lent you a pencil that morning. Seventeen years ago... for me. I was born here, a baby who remembered everything.',
      'Sit down. The first curry is free, classmate.',
    ],
    life: [
      'Being a baby with the mind of a student is the worst. I could not even complain properly.',
      'You sat two rows in front of me. You fell asleep on your desk before the listening part.',
      'My mother here is a fisherwoman. She does not know. I love her. Is that strange?',
      'I do not want to go back. Here, my life has a taste. Do not tell Lea.',
    ],
  },

  // ---------- The Kingdom Rulers: real heads of state at their capital palaces ----------
  {
    id: 'queenSera', name: 'Queen Sera', role: 'Queen of Lexia', at: ['capital-lexia', 'palace', 3], rulerOf: 'lexia', likes: ['gem', 'flower', 'starShard'],
    bonds: { lea: 'mentor', lyra: 'friend' },
    look: { skin: '#fde0c8', hair: '#f2d27a', style: 'long', eyes: '#3a7bd5', outfit: '#8a1c34', trim: '#ffd23f' },
    hello: ['The crown grows heavier each week the Silence spreads.', 'Lexhaven still remembers every word ever spoken beneath its banners.', 'Speak plainly, adventurer. Actions weigh as much as grammar.'],
    life: [
      'I summoned Lea when the border forts stopped answering our dispatches.',
      'My father swore never to seal the library doors, even if winter starved us.',
      'Kharsa raids our southern roads, yet Solecis is the shadow behind us all.',
      'Bring peace to the roads and Lexia will open every vault to you.',
    ],
  },
  {
    id: 'kingAldric', name: 'King Aldric', role: 'King of Verdania', at: ['capital-verdania', 'palace', 3], rulerOf: 'verdania', likes: ['honey', 'antler', 'herbStew'],
    bonds: { sylvia: 'friend' },
    look: { skin: '#e8c49a', hair: '#5a3a1e', style: 'short', eyes: '#3f9b2f', outfit: '#2f6b32', trim: '#e8b83a', beard: true },
    hello: ['Verdania feeds on timber and ancient roots, not empty boasts.', 'Watch Thornvale spears if you cross south without papers.', 'Good steel needs seasoned woodmiths and steady hands.'],
    life: [
      'My woodcutters respect the old oaks only when hunger is kept at bay.',
      'Thornvale wants our western logging valleys. Tell Lord Edmund I will not budge.',
      'Sylvia warned me that the Silent Isle wakes old monsters beneath the canopy.',
      'A hunter who keeps the packs thin earns Verdania’s seal.',
    ],
  },
  {
    id: 'jarlIngrid', name: 'Jarl Ingrid', role: 'Jarl of Frosthold', at: ['capital-frosthold', 'palace', 3], rulerOf: 'frosthold', likes: ['roastMeat', 'pelt', 'ore'],
    bonds: { arthur: 'friend' },
    look: { skin: '#f9e4d4', hair: '#f0e2a8', style: 'pony', eyes: '#5fb8ff', outfit: '#3b6a9a', trim: '#e8eef7' },
    hello: ['Frosthold measures courage by who stands outside in a gale.', 'Aurelia sends ships to raid our harbors while the north freezes.', 'Warm yourself by our hearth, traveler, if your purse is honest.'],
    life: [
      'Here we lose sheep to wolves and ships to Aurelian privateers.',
      'Wear fur in winter, or the storm will claim you before the monsters do.',
      'The Chrono Warden locks the high pass and stalls our iron caravans.',
      'Break that frozen watchtower and every clan of Frosthold will hail you.',
    ],
  },
  {
    id: 'sultanRashid', name: 'Sultan Rashid', role: 'Sultan of Kharsa', at: ['capital-kharsa', 'palace', 3], rulerOf: 'kharsa', likes: ['rareSpice', 'silkBolt', 'gem'],
    bonds: { dorian: 'rival' },
    look: { skin: '#c98e62', hair: '#1c1726', style: 'short', eyes: '#d9a030', outfit: '#c46a18', trim: '#ffd23f', beard: true },
    hello: ['Coins cross the dunes faster than armies, traveler.', 'Do not mistake hospitality for weakness at our oasis gates.', 'Our caravans bled for years because General Barbarism armed the sandclans.'],
    life: [
      'Lexia accuses Kharsa of hoarding grain while closing its own border posts.',
      'Crush the Dune Jackals on the southern road and trade will flow again.',
      'No border stays shut to a courier carrying stamped papers—or deep pockets.',
      'Gold keeps cities alive when speeches fail.',
    ],
  },
  {
    id: 'dukeCassian', name: 'Duke Cassian', role: 'Duke of Aurelia', at: ['capital-aurelia', 'palace', 3], rulerOf: 'aurelia', likes: ['crystal', 'silverBrooch', 'roastedFish'],
    bonds: { rin: 'friend' },
    look: { skin: '#f2d4bc', hair: '#6e3a8a', style: 'short', eyes: '#e05a8a', outfit: '#5a2f7a', trim: '#d8dee8' },
    hello: ['Harbors, blue crystal, and salted wind—that is Aurelia’s wealth.', 'Smugglers pay fines or wear irons in Port Aurel.', 'Every ship in our docks tracks the price of ore and herbs.'],
    life: [
      'Our cliff mines feed half the mages and smiths on the eastern coast.',
      'Frosthold calls our fleets pirates; we call theirs stubborn.',
      'Keep sea lanes busy and crystal prices steady, and you are always welcome.',
      'The eastern coves hide ruins older than any kingdom banner.',
    ],
  },
  {
    id: 'lordEdmund', name: 'Lord Edmund', role: 'Lord of Thornvale', at: ['capital-thornvale', 'palace', 3], rulerOf: 'thornvale', likes: ['warTrophy', 'warShield', 'apple'],
    bonds: { hinata: 'friend' },
    look: { skin: '#e5c09e', hair: '#3a3442', style: 'short', eyes: '#8a5ad6', outfit: '#4e2f68', trim: '#e8b83a', beard: true },
    hello: ['Discipline separates a knight from an armed bandit.', 'Thornvale borders stay guarded day and night.', 'Show me a warrior with a high guild rank and I will show you trust.'],
    life: [
      'My knights hold the southern forest trails against bandits and Verdania alike.',
      'We do not trust unvetted strangers wandering near our granaries.',
      'Clear local monster towns and Thornvale will stamp any pass you ask.',
      'A weak border invites disaster before winter even begins.',
    ],
  },
  {
    id: 'captainMaren', name: 'Captain Maren', role: 'Captain of Skyreach', at: ['capital-isles', 'palace', 3], rulerOf: 'isles', likes: ['rawFish', 'goldenChalice', 'gem'],
    bonds: { kai: 'friend' },
    look: { skin: '#d8a278', hair: '#8a2a24', style: 'long', eyes: '#3fc6c0', outfit: '#1c5468', trim: '#ffd23f' },
    hello: ['Out here the sea makes the laws, not inland crowns.', 'No war between us and the mainland—unless you cheat my sailors.', 'Wind, salt, and sharp steel keep Skyreach free.'],
    life: [
      'Every merchant vessel crossing the strait pays a fair harbor due.',
      'Harpies nest near the cliffs when storms blow north from the Silent Isle.',
      'Even isolated islands feel the Silence when supply galleons arrive empty.',
      'Sailors respect someone who carries supplies when storms roll in.',
    ],
  },

  // ---------- Non-Human Peoples: Elves, Dwarves & Beastkin sages ----------
  {
    id: 'thalindra', name: 'Thalindra', role: 'Sylvan Elf Lorekeeper', race: 'elf', at: ['capital-verdania', 'library', 2], teachesLanguage: 'elvish', teachesSkills: ['prepositions'], fighter: true, fee: 220, romance: true, likes: ['flower', 'honey', 'herb'],
    bonds: { sylvia: 'friend', kingAldric: 'friend' },
    look: { skin: '#f6e4d0', hair: '#9ee898', style: 'long', eyes: '#3fa036', outfit: '#2d6e3a', trim: '#e8d27a', elfEars: true },
    hello: ['Mae govannen—ah, you do not speak Sylvan Elvish yet. Let us fix that.', 'Humans rush their verbs like axes. Forests speak patiently.', 'Our fletchers only trade their finest bows to those who learn our tongue.'],
    life: [
      'Sylvan elves remember the world before the seven human crowns existed.',
      'When Silence crept into Verbwood, ancient oak rings stopped humming.',
      'Speak Sylvan Elvish well and our markets will halve their suspicion.',
      'I walk beside those who protect roots as fiercely as towns.',
    ],
  },
  {
    id: 'thorin', name: 'Thorin', role: 'Mountain Dwarf Forgemaster', race: 'dwarf', at: ['capital-frosthold', 'forge', 2], shop: 'forge', teachesLanguage: 'dwarvish', likes: ['ore', 'crystal', 'roastMeat'],
    bonds: { darius: 'friend', jarlIngrid: 'friend' },
    look: { skin: '#e6bfa0', hair: '#b85028', style: 'short', eyes: '#3a3442', outfit: '#5a4a3a', trim: '#c9883a', beard: true, burly: true, dwarfBrow: true },
    hello: ['Iron remembers every hammer blow! Speak Khazad or bring decent ore.', 'Elves sing to trees; dwarves argue with steel until it obeys.', 'Learn Dwarvish and I’ll shave the price off any forge work.'],
    life: [
      'The deep mountain veins under Frosthold used to supply every forge on the continent.',
      'A dwarf’s hammer sings even when the sky tries to freeze your hands off.',
      'Bring me blue crystal and pure iron, and I will teach you proper smithwork.',
      'If Solecis falls, we will dig the eastern pass open again!',
    ],
  },
  {
    id: 'khalid', name: 'Khalid', role: 'Beastkin Sand-Blade', race: 'beastkin', at: ['capital-kharsa', 'arena', 2], fighter: true, fee: 185, teachesLanguage: 'beast', likes: ['rawMeat', 'roastMeat', 'rareSpice'],
    bonds: { sultanRashid: 'friend', dorian: 'friend' },
    look: { skin: '#d8a274', hair: '#c87a2a', style: 'spiky', eyes: '#f2c200', outfit: '#b85828', trim: '#ffd23f', ears: true },
    hello: ['Hmph. Sharp eyes for a flat-ear! Ready to earn sand-blood in the pit?', 'Beastkin hear a caravan bell three dunes before humans spot dust.', 'Learn Beastkin Cant and the dune traders will share their shortcuts.'],
    life: [
      'Our clans ran the desert mail long before Kharsa raised sandstone towers.',
      'Rin left the dunes for the coast, yet she still smells salt like a fox.',
      'In the Qadira pit, excuses bleed faster than flesh.',
      'Watch my flank and nothing leaps out of the dark unnoticed.',
    ],
  },

];

// Where each person stands: in front of the door of their house, at the gate, at their lonely home.
NPCS.forEach((npc) => Object.assign(npc, spotOf(npc.at)));

export function npcOf(id) {
  return NPCS.find((npc) => npc.id === id);
}

// The look of the player.
export const HERO_LOOK = { skin: '#f3d2b3', hair: '#8a4b24', style: 'spiky', eyes: '#3a6fd8', outfit: '#2d3a6e', trim: '#d6302f', pants: '#3b3652', boots: '#6b4423', scarf: true, sword: true };

// Names for the babies born in the world.
export const BABY_NAMES = ['Verba', 'Nomen', 'Syl', 'Lexi', 'Clause', 'Rhema', 'Tilde', 'Odea', 'Punct', 'Vowel', 'Ink', 'Quill'];
