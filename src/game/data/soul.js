// Narrative data for SOUL.txt: story scenes, grief & memory, personal character arcs,
// moral dilemmas, reactive side stories, silence/threat flavor, and epilogues.
// All prose is clear, evocative English designed to make Lexia feel alive.

export const BOSS_SCENES = {
  lich: {
    before: [
      {
        speaker: 'The Obsidian Lich',
        expr: 'anger',
        song: 'solecis',
        text: 'Dust settles on old crowns here. Why do you carry warm lanterns into a tomb that finally forgot how to speak?',
      },
      {
        speaker: 'hero',
        expr: 'neutral',
        text: 'People above are losing their voices too. I came for the crystal heart you stole from their mines.',
      },
      {
        speaker: 'The Obsidian Lich',
        expr: 'disgust',
        text: 'Then conjugate your final breath, traveler from Earth. Let the silence read your epitaph.',
      },
    ],
    after: [
      {
        speaker: 'The Obsidian Lich',
        expr: 'sadness',
        text: 'Cold cracked through his phylactery. Before turning to ash, he whispered a single half-remembered name.',
      },
      {
        speaker: 'Inner Voice',
        expr: 'neutral',
        text: 'Even the oldest monsters were someone once. You pocket the warm shard and walk back toward daylight.',
      },
    ],
  },
  warden: {
    before: [
      {
        speaker: 'Frostpeak Warden',
        expr: 'anger',
        song: 'solecis',
        text: 'Three winters have frozen my armor to the stone. None who approach the northern seal have passed since the Silence fell.',
      },
      {
        speaker: 'hero',
        expr: 'neutral',
        text: 'Every winter ends when someone breaks the ice. Step aside or test my blade.',
      },
    ],
    after: [
      {
        speaker: 'Inner Voice',
        expr: 'surprise',
        text: 'The Warden kneels into the snow and does not rise. Beyond the shattered seal, wind from the far coast rushes in for the first time in years.',
      },
    ],
  },
  general: {
    before: [
      {
        speaker: 'lyra',
        expr: 'anger',
        song: 'solecis',
        text: 'Wait—that banner! Sandbandit raiders burned half the coast villages under General Barbarism. Stay sharp beside me!',
      },
      {
        speaker: 'General Barbarism',
        expr: 'anger',
        text: 'A shiny Dawn paladin and an ink-stained outsider? Come then! Tell me if your grammar stops steel!',
      },
    ],
    after: [
      {
        speaker: 'lyra',
        expr: 'sadness',
        text: 'He drops to one knee, glaring at his broken axe. Six burned coastal towns flash behind my eyes... yet his men behind the dune are only starving boys.',
      },
    ],
  },
  ravnos: {
    before: [
      {
        speaker: 'Ravnos of the Cinders',
        expr: 'anger',
        song: 'solecis',
        text: 'Welcome to the ashes! Solecis promised nobody here would ever hear another complaint, another prayer, another word.',
      },
      {
        speaker: 'hero',
        expr: 'anger',
        text: 'Silence is not peace, Ravnos. It is only fear pretending nobody is hurt.',
      },
    ],
    after: [
      {
        speaker: 'Ravnos of the Cinders',
        expr: 'sadness',
        text: 'The embers fade from Ravnos’s eyes. "Tell the villagers... I only burned what I could not understand."',
      },
    ],
  },
  thamuz: {
    before: [
      {
        speaker: 'Thamuz of the Deep',
        expr: 'anger',
        song: 'solecis',
        text: 'The sea keeps secrets better than books. Your little ink-marks dissolve the second the tide rises!',
      },
    ],
    after: [
      {
        speaker: 'Inner Voice',
        expr: 'neutral',
        text: 'Salt and thunder settle across the black stones. One fewer chain holds the Silence Gate shut.',
      },
    ],
  },
  velmora: {
    before: [
      {
        speaker: 'Velmora of the Veil',
        expr: 'disgust',
        song: 'solecis',
        text: 'Language made this world fragile. People hurt each other with promises they never keep. We merely take away the knives.',
      },
      {
        speaker: 'nyx',
        expr: 'sadness',
        text: 'Velmora... I know why you chose the Veil. But a world without words cannot say "I forgive you" either.',
      },
    ],
    after: [
      {
        speaker: 'Velmora of the Veil',
        expr: 'sadness',
        text: 'Velmora removes her iron mask at the end. Underneath is only an exhausted scholar who forgot her own village.',
      },
    ],
  },
  queen: {
    before: [
      {
        speaker: 'Lilith, the Demon Queen',
        expr: 'sadness',
        song: 'solecis',
        text: 'So you crossed every sea and every scar to reach this hall. Look closely at my throne: no cheering crowd, no lies—only quiet.',
      },
      {
        speaker: 'Lilith, the Demon Queen',
        expr: 'anger',
        text: 'When our kind lost its homeland, no treaty saved us. Words were just prettier fences. Draw your sword, speaker!',
      },
    ],
    after: [
      {
        speaker: 'Lilith, the Demon Queen',
        expr: 'sadness',
        text: 'She touches the cold silver ring on her finger. "He tried to bear every silent century alone... If you reach Solecis, speak softly. He forgot what mercy sounds like."',
      },
    ],
  },
  king: {
    before: [
      {
        speaker: 'Solecis, the Demon King',
        expr: 'neutral',
        song: 'solecis',
        text: 'Stop. Hear that? Wind against bare granite. No bells, no shouting markets, no false oaths. Perfection.',
      },
      {
        speaker: 'Solecis, the Demon King',
        expr: 'anger',
        text: 'Why bring Earth’s noisy alphabet here? Tell me one sentence worth breaking three centuries of quiet!',
      },
    ],
    after: [
      {
        speaker: 'Solecis, the Demon King',
        expr: 'sadness',
        song: 'solecis',
        text: 'His jagged crown slips onto the marble. For the first time in three hundred years, his voice trembles like a young man’s.',
      },
      {
        speaker: 'Solecis, the Demon King',
        expr: 'sadness',
        text: '"Finish... the sentence... then." Light pours through the cracked obsidian dome, warming the floor you stand on.',
      },
    ],
  },
};

export const CHAPTER_STORY_SCENES = {
  2: [
    {
      speaker: 'aria',
      expr: 'joy',
      text: 'Look at Eldermoor this morning—lamps lit along the gate, bread warm at Bea’s window. You are no longer a stranger washing ashore.',
    },
    {
      speaker: 'Inner Voice',
      expr: 'neutral',
      text: 'The first days were just survival. Now their names weigh something in your pocket.',
    },
  ],
  3: [
    {
      speaker: 'garrick',
      expr: 'neutral',
      text: 'Scouts saw dark smoke curling past the northern pines. The Silence does not wait while we polish blades.',
    },
  ],
  4: [
    {
      speaker: 'yuki',
      expr: 'surprise',
      text: 'I found torn pages beneath the archive floorboards—the seals were never meant to last forever. Only a living voice can re-tie them.',
    },
  ],
  5: [
    {
      speaker: 'mira',
      expr: 'anger',
      text: 'My bellows burned all night forging better iron. Whatever waits across the water, you walk in with our steel behind you.',
    },
  ],
  6: [
    {
      speaker: 'Goddess Lexa',
      expr: 'sadness',
      song: 'aria',
      text: 'Half a crown of stars now burns above your footsteps. Do not harden your heart just because the road grows steeper.',
    },
  ],
};

export const SOLECIS_WHISPERS = {
  conquest_first: [
    {
      speaker: 'Solecis, the Demon King',
      expr: 'neutral',
      song: 'solecis',
      text: '...Another town lays down its signs. Look at the painted wood going blank. Isn’t the quiet gentler than weeping?',
    },
  ],
  raids_three: [
    {
      speaker: 'Solecis, the Demon King',
      expr: 'disgust',
      song: 'solecis',
      text: 'Three nights of blood and shouting. When you grow tired of counting names carved on stone, lay your pen down.',
    },
  ],
  demon_border: [
    {
      speaker: 'Solecis, the Demon King',
      expr: 'neutral',
      song: 'solecis',
      text: 'Step across my dark ash if you dare. Here, even footsteps apologize to the dust.',
    },
  ],
};

export const LOST_HERO_REFLECTIONS = [
  'Louis’s ink is still neat here—careful, optimistic. He thought six months would be enough to save everyone.',
  'His handwriting tightens on this page. Even an honor student learns that real worlds do not pause between exams.',
  'Salt stains blur the corner. Someone cried while folding this sheet.',
  'He had started forgetting Earth’s subway stations—except the sound of a closing train door.',
  'The margin repeats the name of the Demon King three times, crossed out once, written back gently.',
];

export const LEXA_SCENES = {
  after_orin: [
    {
      speaker: 'Goddess Lexa',
      expr: 'sadness',
      song: 'aria',
      text: 'Silver dust gathers beneath the oak leaves beside you. Goddess Lexa’s projection kneels at eye level.',
    },
    {
      speaker: 'Goddess Lexa',
      expr: 'sadness',
      text: '"Forgive me. When I pulled you across the sky, I promised adventure. I did not tell you how heavy an empty chair feels the morning after."',
    },
    {
      speaker: 'Goddess Lexa',
      expr: 'neutral',
      text: '"Orin kept his promise until his final breath. Carry his sentence forward—do not let the Silence turn grief into nothingness."',
    },
  ],
  before_castle: [
    {
      speaker: 'Goddess Lexa',
      expr: 'fear',
      song: 'aria',
      text: 'At the edge of the obsidian shore, starlight shivers in the puddles. Lexa appears translucent, almost fading.',
    },
    {
      speaker: 'Goddess Lexa',
      expr: 'sadness',
      text: '"Beyond this gate, my voice cannot follow you cleanly. If you see a doorway back to Earth afterward... know that staying or leaving is truly yours."',
    },
  ],
  after_king: [
    {
      speaker: 'Goddess Lexa',
      expr: 'joy',
      song: 'aria',
      text: 'For the first time in generations, morning clouds drift pink above the Silent Isle. Lexa exhales a centuries-long breath.',
    },
    {
      speaker: 'Goddess Lexa',
      expr: 'love',
      text: '"You did what neither crowns nor sermons managed—you answered the Silence with care. Thank you for lending Lexia your voice."',
    },
  ],
  nyx_twist: [
    {
      speaker: 'nyx',
      expr: 'fear',
      song: 'nyx',
      text: 'Wait—stop by the lantern! Before we go further north, there is something I hid behind every late-night smile.',
    },
    {
      speaker: 'nyx',
      expr: 'sadness',
      text: '"I was sent from the Demon Castle two winters ago to watch the southern roads. I was supposed to report who still spoke the Old Words."',
    },
    {
      speaker: 'Goddess Lexa',
      expr: 'sadness',
      text: 'A faint chime rings between you. "And I knew," whispers Lexa softly. "Just as I hid why Louis truly fell before you—because his heart broke first, not his blade."',
    },
    {
      speaker: 'nyx',
      expr: 'sadness',
      text: '"I stayed because of Eldermoor’s bread and your awkward sentences. Decide now what I am to you."',
    },
  ],
};

export const ORIN_ARC = {
  eulogy: [
    {
      speaker: null,
      expr: 'sadness',
      song: 'sadness',
      text: 'Dawn arrives wet and gray over Eldermoor Square. Neighbors stand bareheaded in front of Elder Orin’s shut door.',
    },
    {
      speaker: 'aria',
      expr: 'sadness',
      text: '"He told us on his last evening: \'A village lives as long as someone still bothers to finish the sentence we started together.\'"',
    },
    {
      speaker: 'hero',
      expr: 'sadness',
      text: 'You place a smooth field stone beside the fresh earth in Eldermoor and carve three quiet words onto the oak board.',
    },
  ],
  graveText: [
    'Beneath Eldermoor’s oldest oak stands a weathered wooden grave marker.',
    'Carved in steady letters: "Elder Orin — Finish the sentence."',
    'Someone left a warm loaf of bread and three clean quills beside the stone.',
  ],
  successorLine: [
    {
      speaker: 'mira',
      expr: 'neutral',
      text: 'Orin’s house stayed silent for three mornings. Yesterday the bakers and smiths lit the lantern inside again and hung the ledger key on my belt.',
    },
    {
      speaker: 'mira',
      expr: 'sadness',
      text: '"Nobody replaces Orin. I am only keeping the chair warm so Eldermoor does not fall apart while you fight."',
    },
  ],
};

export const TOMO_ARC = {
  silentGreeting: 'Tomo sits on the doorstep with his knees pulled tight, staring at the dirt. He does not look up.',
  askTeach: [
    {
      speaker: 'tomo',
      expr: 'sadness',
      song: 'sadness',
      text: 'Tomo tugs the hem of your coat. His eyes are red, though his jaw is clenched hard.',
    },
    {
      speaker: 'tomo',
      expr: 'anger',
      text: '"Grandpa Orin is gone because monsters hit harder than our words. Teach me the strong English words right now—the ones that break shields!"',
    },
  ],
  helped: [
    {
      speaker: 'tomo',
      expr: 'joy',
      text: 'You kneel on the cobblestones and trace verbs and shield-chants in the dust until Tomo gets every single syllable right.',
    },
    {
      speaker: 'tomo',
      expr: 'joy',
      text: '"Thank you! I am writing every word in my pocket notebook. When I grow up, I will guard Eldermoor beside you!"',
    },
  ],
  ignored: [
    {
      speaker: 'tomo',
      expr: 'anger',
      text: 'Tomo pulls back slowly, nodding once. "Right. Kids just get in the way. I will ask the gate garrison for a wooden spear instead."',
    },
  ],
};

export const ARIA_RESCUES = [
  [
    {
      speaker: 'aria',
      expr: 'sadness',
      song: 'aria',
      text: 'The ceiling planks of your cottage swim into focus. Aria’s sleeves are dark with river mud and pine sap.',
    },
    {
      speaker: 'aria',
      expr: 'anger',
      text: '"You idiot! Do you know how heavy armor is when I have to drag you two miles across the bridge? Never scare the clinic like that again!"',
    },
    {
      speaker: 'aria',
      expr: 'sadness',
      text: '"...I still have two blessings left to pull you back from the dark. Please look after yourself."',
    },
  ],
  [
    {
      speaker: 'aria',
      expr: 'fear',
      song: 'aria',
      text: 'Her hands are trembling as she wraps fresh linen around your ribs. Sweat beads along her forehead.',
    },
    {
      speaker: 'aria',
      expr: 'fear',
      text: '"My lantern went out halfway back. The Silence tried to swallow your breathing before we crossed the gate. Listen to me..."',
    },
    {
      speaker: 'aria',
      expr: 'sadness',
      text: '"That was my second miracle. Only one blessing remains in me now."',
    },
  ],
  [
    {
      speaker: 'aria',
      expr: 'sadness',
      song: 'sadness',
      text: 'Aria is slumped beside your chair when you wake, white-faced, a cracked amulet dangling lifeless around her neck.',
    },
    {
      speaker: 'aria',
      expr: 'sadness',
      text: '"Don’t speak yet. Even a healer’s grace runs dry. I poured everything left into keeping your heart beating until sunrise."',
    },
    {
      speaker: 'aria',
      expr: 'fear',
      text: '"No blessings remain. If you fall out there one more time, I cannot bring you home."',
    },
  ],
];

// Personal 4-step arcs (Step 0: Hint -> Step 1: Wish -> Step 2: Fear -> Step 3: Secret + Choice -> Complete)
export const PERSONAL_ARCS = {
  aria: {
    name: 'Aria',
    minFriendships: [15, 35, 55, 75],
    steps: [
      {
        expr: 'neutral',
        text: 'Aria shelves clean bandages twice just to keep her hands busy. "Everyone looks at a healer and assumes she never gets tired."',
        choiceA: { label: '"Sit with me for five minutes."', reply: 'She blinks, then sits on the clinic crate. "Five minutes feels like a vacation."' },
        choiceB: { label: '"Eldermoor relies on your calm."', reply: 'Aria smiles faintly, straightening her collar. "Then I will try to look calmer."' },
      },
      {
        expr: 'joy',
        text: 'Her WISH: "If peace ever lasts a whole year, I want to plant chamomile down every slope outside Eldermoor—so herbs mean tea, not torn skin."',
        choiceA: { label: '"I will help you till the slope."', reply: 'A bright laugh escapes her. "Hold that promise!"' },
        choiceB: { label: '"Chamomile smells far better than iron."', reply: 'She nods warmly, tucked hair catching the clinic lamp.' },
      },
      {
        expr: 'fear',
        text: 'Her FEAR: "My biggest terror isn’t falling in battle. It’s running out of blessings at dawn while someone in this square still cries for help."',
        choiceA: { label: '"You don’t carry Eldermoor alone."', reply: 'Aria squeezes your wrist once, steadier than before.' },
        choiceB: { label: '"Let us gather extra tonics together."', reply: '"Thank you. Sharing the burden makes mornings bearable."' },
      },
      {
        expr: 'sadness',
        song: 'aria',
        text: 'Her SECRET: "My older brother stood at the gate before you washed ashore. He asked me not to waste prayers on corpses... and vanished north the next night."',
        choiceA: { label: '"If he is out there, we will find truth."', reply: 'Tears catch her lashes as she nods. "Having you beside me already lifts half that winter."' },
        choiceB: { label: '"His courage lives in how you heal others."', reply: '"Thank you for hearing his story without pitying me."' },
      },
    ],
  },
  mira: {
    name: 'Mira',
    minFriendships: [15, 35, 55, 75],
    steps: [
      {
        expr: 'neutral',
        text: 'Mira inspects a tiny hairline crack in an anvil hammer. "Steel listens to rhythm. Rush a beat, and it snaps next month."',
        choiceA: { label: '"Teach me to hear good iron."', reply: 'Mira grins proudly and hands you the tuning tongs.' },
        choiceB: { label: '"Take a break—even iron cools."', reply: '"Hmph. Tell that to the bandits outside the wall."' },
      },
      {
        expr: 'joy',
        text: 'Her WISH: "One day I want to forge bells instead of helmets. Huge bronze bells you can hear across three valleys on festival mornings."',
        choiceA: { label: '"A bronze bell in Eldermoor would sound grand."', reply: '"Wait until you hear the first ring—your ears will shake!"' },
        choiceB: { label: '"Weapons first, bells right after."', reply: '"Practical head on your shoulders. Good answer."' },
      },
      {
        expr: 'fear',
        text: 'Her FEAR: "Every sword leaving my forge carries my stamp. What terrifies me is seeing my own mark brought back chipped from a dead friend’s hand."',
        choiceA: { label: '"Your blades brought people home alive."', reply: 'She rubs coal soot off her cheek and nods slowly.' },
        choiceB: { label: '"Then sharpen mine so it never breaks."', reply: '"Deal. And bring yourself back in one piece with it."' },
      },
      {
        expr: 'sadness',
        text: 'Her SECRET: "Darius left Eldermoor for Greendale because I pushed him too hard—blamed him for a cracked blade during a siege. I still polish his old apron every Sunday."',
        choiceA: { label: '"Tell Darius how proud you are of him."', reply: 'Mira exhales slowly. "Maybe it is time an old stubborn smith writes an apology."' },
        choiceB: { label: '"Standards made both of you strong."', reply: '"Maybe. Next time he passes through, leave a cup of ale between us."' },
      },
    ],
  },
  yuki: {
    name: 'Yuki',
    minFriendships: [15, 35, 55, 75],
    steps: [
      {
        expr: 'surprise',
        text: 'Yuki stacks dust-covered primers under the library window. "Some words vanish from spoken memory first; written ink remembers longer."',
        choiceA: { label: '"Why study ancient ink every night?"', reply: 'Yuki lowers her lamp. "Because forgetting is quieter than fire."' },
        choiceB: { label: '"Keep copying—I read every page you shelve."', reply: 'A rare, shy grin breaks across her face.' },
      },
      {
        expr: 'joy',
        text: 'Her WISH: "I want to build a free school beside the harbor where bakers’ kids and beastkin pups read the same shelves without paying silver."',
        choiceA: { label: '"Count on my Lexis when peace comes."', reply: '"A patron of ink! Wait until we hang the wooden sign."' },
        choiceB: { label: '"Good stories belong to everyone."', reply: '"Exactly. Every locked word shrinks a village."' },
      },
      {
        expr: 'fear',
        text: 'Her FEAR: "When the Silence hits a shelf, the ink doesn’t burn—it simply fades off parchment like frost melting. I dread waking up unable to read my mother’s handwriting."',
        choiceA: { label: '"Tell me her words so I remember too."', reply: '"Then two memories will guard one page. Thank you."' },
        choiceB: { label: '"We will silence the Silence first."', reply: 'She clutches the ledger tightly, comforted.' },
      },
      {
        expr: 'sadness',
        text: 'Her SECRET: "That ruined monastery on the island wasn’t raided by bandits—I accidentally carried out its taboo ledger as a girl, thinking I was saving my home."',
        choiceA: { label: '"Saving a book to save your home wasn’t evil."', reply: 'Yuki finally steadies her breathing. "Nobody ever told me that without sneering."' },
        choiceB: { label: '"What did the ledger contain?"', reply: '"Half the grammar seals Solecis broke. Now both of us guard the rest."' },
      },
    ],
  },
  garrick: {
    name: 'Garrick',
    minFriendships: [15, 35, 55, 75],
    steps: [
      {
        expr: 'neutral',
        text: 'Garrick watches the northern cobblestones beneath his boots. "Twenty-four hours feels long when all you guard is a hinge and two lanterns."',
        choiceA: { label: '"Seabridge seems very far from here."', reply: 'His eyes dart east instantly. "Every road back from Seabridge passes under this arch."' },
        choiceB: { label: '"A faithful watch keeps children asleep."', reply: '"Aye. Tell that to my aching knees."' },
      },
      {
        expr: 'love',
        text: 'His WISH: "Give me two years of quiet harbor trade and a cottage garden in Seabridge where Rosa never hears a warning horn again."',
        choiceA: { label: '"Rosa waits for good news from you."', reply: 'Garrick’s stoic shoulders soften. "Make sure you carry my letters carefully."' },
        choiceB: { label: '"Hold out until the king falls."', reply: '"Until the last goblin leaves the coast."' },
      },
      {
        expr: 'fear',
        text: 'His FEAR: "Not dying on watch. Leaving Rosa beside an unlit harbor lantern with only strangers to tell her a guard didn’t come back."',
        choiceA: { label: '"I will always watch your back at the gate."', reply: 'He claps your shoulder hard enough to rattle armor.' },
        choiceB: { label: '"Write her tonight—not just when things break."', reply: '"Smart advice, outsider. Ink is lighter than regret."' },
      },
      {
        expr: 'sadness',
        text: 'His SECRET: "I didn’t take Eldermoor’s north post for coin. Years ago I froze during a bandit torching, and swore I’d never sit at a warm hearth again until no gate burns behind me."',
        choiceA: { label: '"You earned forgiveness ten gates over."', reply: 'Garrick exhales a long winter’s breath. "Maybe... maybe I can visit Seabridge for a feast soon."' },
        choiceB: { label: '"Forgive that younger guard—he stood up later."', reply: 'He salutes stiffly, hiding glistening eyes.' },
      },
    ],
  },
  nyx: {
    name: 'Nyx',
    minFriendships: [15, 35, 55, 75],
    steps: [
      {
        expr: 'neutral',
        text: 'Nyx traces pale rings around a fencepost in the dark. "Humans assume horns mean cruelty, just as demons assume humans lie with every sentence."',
        choiceA: { label: '"What do you see when you watch them?"', reply: '"Too much noise. Too much stubborn tenderness over burnt soup."' },
        choiceB: { label: '"Words only deceive when meant to."', reply: 'She tilts her head curiously. "Strange way to look at ink."' },
      },
      {
        expr: 'joy',
        song: 'nyx',
        text: 'Her WISH: "Walk through a sunny market square at noon—no cloak, no hood, no whispered crossing of streets—just to buy honey-bread like a regular girl."',
        choiceA: { label: '"Walk into Eldermoor beside me tomorrow."', reply: 'She grins, sharper canines glinting gently. "Watch the bakers drop their trays!"' },
        choiceB: { label: '"You deserve daylight too, Nyx."', reply: 'She hides a small smile inside her scarf.' },
      },
      {
        expr: 'fear',
        text: 'Her FEAR: "That one day Solecis rings the Silent Bell inside my blood, and I won’t remember whether Eldermoor’s kindness was real or a dream I invented."',
        choiceA: { label: '"Then I will shout your name louder than his bell."', reply: 'Nyx stares, speechless for a long beat. "...You actually mean that."' },
        choiceB: { label: '"Keep this wildflower pressed—proof of today."', reply: '"Pressed flowers crumble, but... I will keep yours anyway."' },
      },
      {
        expr: 'sadness',
        song: 'nyx',
        text: 'Her SECRET: "My real mother sang demon lullabies in full sentences before Solecis outlawed sound at court. I hum them under my breath every midnight so she isn’t erased."',
        choiceA: { label: '"Sing two bars for me—I’ll learn them."', reply: 'Nyx closes her eyes and hums four low, impossibly gentle notes.' },
        choiceB: { label: '"Your song already defeated part of his curse."', reply: 'She smiles with honest warmth. "Stay near me tonight."' },
      },
    ],
  },
  lea: {
    name: 'Lea',
    minFriendships: [15, 35, 55, 75],
    steps: [
      {
        expr: 'anger',
        text: 'Lea sharpens a royal saber until sparks fly past your boots. "Queen Sera talks about destiny like it’s a timetable on a notice board."',
        choiceA: { label: '"Being summoned here wasn’t fair to either of us."', reply: 'Lea stops grinding and looks at you seriously. "First honest thing I heard all week."' },
        choiceB: { label: '"At least our skills actually save lives here."', reply: '"True. Better than grading essays on dead corporations."' },
      },
      {
        expr: 'joy',
        text: 'Her WISH: "Finish this war cleanly, walk back out of the castle gates once nobody cries for help—and maybe see my little sister graduate back on Earth."',
        choiceA: { label: '"We will open that return gate together."', reply: '"Hold that shield steady, partner. Don’t fall behind me."' },
        choiceB: { label: '"Tell me about your sister."', reply: '"Stubborn as me. Kept drawing terrible comics in my margin notes."' },
      },
      {
        expr: 'fear',
        text: 'Her FEAR: "Becoming the cold golden statue Queen Sera secretly wants—fighting forever without remembering what Earth rain smelled like."',
        choiceA: { label: '"As long as I’m here, I won’t let them turn you to marble."', reply: 'Lea snorts, shoulder relaxing slightly. "Good. Keep reminding me I’m annoying."' },
        choiceB: { label: '"Hugo still cooks Earth curry—let’s visit Riverford."', reply: '"Deal. Curry beats royal banquets ten to one."' },
      },
      {
        expr: 'sadness',
        text: 'Her SECRET: "On Earth I failed my bar exam twice before the white light swallowed the desk. Sometimes I’m terrified Lexia got stuck with a second-place hero."',
        choiceA: { label: '"Paper scores never fought three demon generals."', reply: 'She breathes out sharply and smiles crookedly. "...Okay. Fair point."' },
        choiceB: { label: '"We pass this test together, word by word."', reply: 'She bumps her fist lightly against your arm. "Let’s show them."' },
      },
    ],
  },
  hugo: {
    name: 'Hugo',
    minFriendships: [15, 35, 55, 75],
    steps: [
      {
        expr: 'joy',
        text: 'Hugo polishes copper kettles while whistling an unmistakably modern pop chorus. "Nobody here knows the beat, which leaves me humming solo!"',
        choiceA: { label: '"Hum that train-station tune again."', reply: '"Wait—you actually remember late-night ramen stalls near Shibuya too?!"' },
        choiceB: { label: '"Your inn smells better than any dungeon."', reply: '"Best review since 2019, buddy!"' },
      },
      {
        expr: 'joy',
        text: 'His WISH: "Open one chain of quiet taverns between kingdoms where soldiers from rival houses share fried rice instead of spears."',
        choiceA: { label: '"Good food bridges borders faster than laws."', reply: '"Amen to that! Curry Diplomacy starts at Riverford!"' },
        choiceB: { label: '"Keep innovating recipes—your royalties help both of us."', reply: '"Business partners till dusk!"' },
      },
      {
        expr: 'fear',
        text: 'His FEAR: "Waking up tomorrow with nobody speaking a language I recognize from my past life—forgetting what my parents’ kitchen stove looked like."',
        choiceA: { label: '"As long as we talk, Earth isn’t forgotten."', reply: 'Hugo swipes an apron across his forehead. "Glad you landed in the same pond, friend."' },
        choiceB: { label: '"Write every Earth dish recipe down for Yuki."', reply: '"Archive-certified tonkatsu! Now that is immortality!"' },
      },
      {
        expr: 'sadness',
        text: 'His SECRET: "I didn’t fall into Lexia during an exam like Louis or Lea. My truck skidded on rainy blacktop after my hundredth overtime shift... Maybe Lexia was my second chance."',
        choiceA: { label: '"And look how many people you keep warm here."', reply: 'Hugo grins softly through wet eyes. "Never wasting a morning again, I swear it."' },
        choiceB: { label: '"Make this life count twice, Hugo."', reply: '"On the house tonight—sit down and eat properly!"' },
      },
    ],
  },
};

export const NPC_BOND_SCENES = {
  aria_corvin_argue: {
    title: 'Clinic vs Plague Doctrine',
    location: 'lexia',
    npcA: 'aria',
    npcB: 'corvin',
    lines: [
      { speaker: 'aria', expr: 'anger', text: 'Your tinctures reek of swamp soot, Corvin! Patients need steady hands, not riddle-bottles dropped by crows!' },
      { speaker: 'corvin', expr: 'disgust', text: 'Prayer-bandages rot when poison moves fast, dear Aria. Sentiment cures zero fevers.' },
      { speaker: 'aria', expr: 'sadness', text: 'Tell me honestly—would you treat a shivering child like an equation?!' },
    ],
    choices: [
      { label: 'Side with Aria: bedside warmth saves wills', rewards: { aria: 8, corvin: -3 }, reply: 'Aria lifts her chin firmly while Corvin tips his beaked hat and retreats into the dusk.' },
      { label: 'Side with Corvin: fast bitter medicine saves lives', rewards: { corvin: 8, aria: -3 }, reply: 'Corvin nods once in dark satisfaction; Aria turns back to her shelves in wounded silence.' },
      { label: 'Bridge both: combine clinic cleanliness with Corvin’s doses', rewards: { aria: 5, corvin: 5, lexis: 25 }, reply: 'Both freeze mid-glare... then grudgingly swap two vials. "Acceptable," mutters Corvin.' },
    ],
  },
  mira_darius_forge: {
    title: 'Hammer & Pride',
    location: 'greendale',
    npcA: 'mira',
    npcB: 'darius',
    lines: [
      { speaker: 'darius', expr: 'neutral', text: 'Look at this bevel, Master Mira. Three winters at the Guild anvil finally straightened my fold-lines.' },
      { speaker: 'mira', expr: 'surprise', text: '...Two millimeters thick along the fuller. Not sloppy at all. Why didn’t you send word from Greendale?' },
      { speaker: 'darius', expr: 'sadness', text: 'Because last time I held tongs near you, neither of us could admit we were scared of failing Eldermoor.' },
    ],
    choices: [
      { label: 'Ask Mira to praise her student openly', rewards: { mira: 6, darius: 8 }, reply: 'Mira snorts softly, then taps Darius’s blade with a proud chime. "Better temper than mine at twenty."' },
      { label: 'Remind both that rival forges sharpen the whole kingdom', rewards: { mira: 5, darius: 5, happiness: 3 }, reply: 'Father-style pride softens into two grins over glowing coals.' },
    ],
  },
  elara_aria_tea: {
    title: 'Mint & Bitterwort Tea',
    location: 'lexia',
    npcA: 'elara',
    npcB: 'aria',
    lines: [
      { speaker: 'elara', expr: 'joy', text: 'Two dried mint leaves, zero tears—stop hovering over my kettle, Aria. Even healers deserve sweet steam!' },
      { speaker: 'aria', expr: 'joy', text: 'Whenever you pour potions, half Eldermoor wakes up sprouting daisies or glowing faintly blue, Elara!' },
      { speaker: 'elara', expr: 'love', text: 'And yet you always bring the extra honey jars over after midnight shifts. Sit down before I brew you awake!' },
    ],
    choices: [
      { label: 'Join them for warm mint tea (+HP & Morale)', rewards: { aria: 6, elara: 6, heal: true }, reply: 'Three chipped mugs clink warmly while rain patters harmlessly against the clinic shutters.' },
      { label: 'Ask them to blend a travel salve (+Herbal Poultice)', rewards: { aria: 4, elara: 4, item: 'herbalPoultice' }, reply: 'Both laugh and wrap a fresh linen Herbal Poultice right into your belt.' },
    ],
  },
};

export const PLAYSTYLE_REACTIONS = {
  fast: [
    'People whisper you answer curses faster than lightning—barely pausing to blink!',
    'You read runes at full gallop. No demon catches a tongue that fast!',
  ],
  mistakes: [
    'Still fumbling a few endings? Even bruised knuckles learn the grip eventually.',
    'Do not shame yourself for missed words—every scar teaches one clearer lesson.',
  ],
  absent: [
    'Long time gone on the roads! Half the square checked the bridge every dusk waiting for your lantern.',
    'Three weeks without your footsteps on these cobbles—we saved bread beside the hearth anyway.',
  ],
  kind: [
    'Kids copy how patiently you tie bundles for travelers. Eldermoor feels softer since you came.',
    'Even stray hounds follow your coat now. Mercy leaves footprints too.',
  ],
  cruel: [
    'Doors click locked twice when shadows cross the porch lately... Be careful who hears you bargain.',
    'Coin weighs heavy when neighbors flinch as you walk past.',
  ],
};

export const DILEMMAS = {
  raidVsCaravan: {
    id: 'raidVsCaravan',
    title: 'Two Fires in One Night',
    lines: [
      { speaker: 'garrick', expr: 'fear', text: 'Bell-runners just fell exhausted by the bridge! Timber-bandits are ambushing a food caravan at Westford—while goblins probe our own granary!' },
      { speaker: 'aria', expr: 'sadness', text: 'We do not have legs to stand in two valleys tonight. Choose fast—both sides wait for your sword!' },
    ],
    choices: [
      { id: 'save_village', label: 'Defend Eldermoor’s granaries and families first', icon: 'shield' },
      { id: 'save_caravan', label: 'Ride out to rescue the Westford merchant caravan', icon: 'coin' },
    ],
  },
  spareGeneral: {
    id: 'spareGeneral',
    title: 'Mercy Above the Sand',
    lines: [
      { speaker: 'lyra', expr: 'anger', text: 'Wait before lowering the final cut! General Barbarism is disarmed and kneeling!' },
      { speaker: 'General Barbarism', expr: 'sadness', text: 'Strike then... My boys behind the rocks only joined for salted grain when Kharsa taxed them dry.' },
      { speaker: 'lyra', expr: 'sadness', text: 'If you spare him, Eldermoor’s council may mutter... yet executing a beaten prisoner rots our oath.' },
    ],
    choices: [
      { id: 'spared', label: 'Spare Barbarism—bind his oath to defend coastal caravans', icon: 'flower' },
      { id: 'slain', label: 'Deliver final justice for the burned coastal towns', icon: 'sword' },
    ],
  },
  hideNyx: {
    id: 'hideNyx',
    title: 'Lanterns at the Bridge',
    lines: [
      { speaker: 'garrick', expr: 'anger', text: 'Torchlight strikes two horned silhouettes near the square! Royal scouts spotted Nyx crossing out of Demon timber!' },
      { speaker: 'nyx', expr: 'fear', song: 'nyx', text: 'I won’t run if you tell them to cuff me... Just say what I actually am to this town.' },
    ],
    choices: [
      { id: 'hid', label: 'Vouch for Nyx publicly and shelter her at your hearth', icon: 'heart' },
      { id: 'turned_in', label: 'Hand Nyx over to Royal custody under temporary parole', icon: 'key' },
    ],
  },
  leaBlow: {
    id: 'leaBlow',
    title: 'Lea’s Final Cut',
    lines: [
      { speaker: 'lea', expr: 'anger', text: 'Wait—let ME land the closing strike! For every sleepless night Queen Sera locked me in prayer chambers, let me settle one score myself!' },
    ],
    choices: [
      { id: 'lea_struck', label: 'Step aside and let Lea deliver the decisive strike', icon: 'sword' },
      { id: 'hero_struck', label: 'Hold her shoulder—"Don’t let hatred guide your last blow"', icon: 'shield' },
    ],
  },
};

export const EPILOGUE_NOTES = {
  aria: {
    alive: 'Aria planted pale chamomile along every hill outside Eldermoor, though her clinic lantern still burns late for every traveler.',
    spouse: 'Aria sleeps beside your open grammar notebooks now; on quiet rain-nights she checks your pulse out of gentle habit.',
    dead: 'Someone still leaves clean white linen beside Eldermoor’s clinic door, where Aria taught children to bind scraped knees.',
  },
  mira: {
    alive: 'Mira cast three enormous bronze bells whose first peal echoed clean down to Seabridge Bay.',
    dead: 'Mira’s cold forge holds one unfinished sword—its balance already spotless.',
  },
  yuki: {
    alive: 'Yuki opened the free harbor school beside Seabridge’s pier, teaching beastkin pups and fisherfolk alike.',
    dead: 'Yuki’s inked translations fill four oak shelves in Eldermoor’s square.',
  },
  garrick: {
    alive: 'Garrick finally hung up his north-gate halberd and walked east until Seabridge’s warm inn lights matched Rosa’s smile.',
    dead: 'An iron lantern still stays oiled beside the north gate in Garrick’s place.',
  },
  nyx: {
    spared: 'Nyx walked across Eldermoor market at high noon without a hood—and bought two loaves of warm honey-bread.',
    turned_in: 'Nyx watched sunrise alone from the northern ridge, singing four low demon notes toward silent trees.',
    dead: 'Pressed wildflowers mark the fencepost north of town where dusk falls earliest.',
  },
  lea: {
    leaStruck: 'Lea dropped Queen Sera’s royal cloak on the throne steps and chose a quieter dawn sword for herself.',
    heroStruck: 'Lea finally smiled without grinding her teeth—ready to answer whatever road awaits after victory.',
    dead: 'Lea’s crimson ribbon remains tied to the Dawn Barracks flagstaff.',
  },
  hugo: {
    alive: 'Hugo’s "Bridge & Ladle" inns span three borders now, famous for golden curry that tastes strangely like rain-soaked Earth nights.',
  },
  orin: {
    dead: 'Children in Eldermoor still finish each other’s hard sentences beside the oak stone marked "Elder Orin."',
    alive: 'Elder Orin still chuckles beside his doorstep, counting days by fresh loaves rather than warhorns.',
  },
  tomo: {
    proud: 'Young Tomo already reads whole royal dispatches aloud to travelers at the north gate.',
    bitter: 'Tomo wears plain garrison leather in the frontier—rarely smiling, never dropping his spear.',
    normal: 'Tomo runs across Eldermoor square every dusk, forever inventing grander English titles for himself.',
  },
  general: {
    spared: 'General Barbarism leads ex-bandits guarding grain wagons along the Kharsa coast, paying back every burned barn in salt and wheat.',
    slain: 'Sandbandit banners rotted into dunes where Barbarism fell, remembered only by quiet gulls.',
  },
};

export const EARTH_DREAMS_DEEP = [
  {
    title: 'Fluorescent Office 9:42 PM',
    lines: [
      { speaker: 'Inner Voice', expr: 'sadness', text: 'White fluorescent tubes buzz overhead. Everyone else went home an hour ago; only your open TOEIC prep tab glows on the cold desk.' },
      { speaker: 'Inner Voice', expr: 'neutral', text: 'A message flashes on an empty phone screen: "Mom: Did you eat dinner?" Tomorrow arrives differently here—because people wait for you awake.' },
    ],
  },
  {
    title: 'Missed Last Train',
    lines: [
      { speaker: 'Inner Voice', expr: 'sadness', text: 'Rain streaks the overpass glass back home. The 23:18 express slides past without slowing, carrying warm yellow windows into dark brick.' },
      { speaker: 'Inner Voice', expr: 'joy', text: 'You wake instead to woodsmoke and baked apples floating through Eldermoor shutters. Nobody left you at the platform tonight.' },
    ],
  },
  {
    title: 'The Quiet Friend',
    lines: [
      { speaker: 'Inner Voice', expr: 'sadness', text: 'In your coat pocket sits an unsent birthday card from years ago—never posted because the right words always seemed safer tomorrow.' },
      { speaker: 'Inner Voice', expr: 'neutral', text: 'Maybe that is why every small conversation in Lexia feels sacred. Tomorrow isn’t guaranteed to speak.' },
    ],
  },
];

export const CAMPFIRE_TALKS = [
  [
    { speaker: 'aria', expr: 'joy', text: 'Do you think Eldermoor’s bakers miss our awful singing when we camp in the woods?' },
    { speaker: 'mira', expr: 'joy', text: 'Only the sourdough misses Aria. Bea specifically told me my lullabies cracked three plates!' },
  ],
  [
    { speaker: 'nyx', expr: 'neutral', song: 'nyx', text: 'Look above the pines—seven stars in this constellation never move, no matter which kingdom claims the forest beneath.' },
    { speaker: 'lea', expr: 'sadness', text: 'Back home they’d charge admission to see skies this clear. Pass another roast carrot, partner.' },
  ],
  [
    { speaker: 'garrick', expr: 'neutral', text: 'First watch is mine. Nobody sneaks up on this stew pot while I still smell thyme!' },
    { speaker: 'yuki', expr: 'joy', text: 'Make sure you wake the second shift before dawn, Garrick—heroic pride doesn’t warm cold boots.' },
  ],
];

export const WORLD_STORY_QUESTS = {
  underBed: {
    id: 'under_bed',
    title: 'Monsters Under the Bed',
    offerLines: [
      { speaker: null, expr: 'fear', text: 'A barefoot child tugs your cloak near Eldermoor cottages, holding a splintered candleholder.' },
      { speaker: null, expr: 'fear', text: '"Please... check under our cot! Since the last Silence tremor, Papa whispers in his sleep and stops mid-word like his voice is leaking out!"' },
    ],
    resolveLines: [
      { speaker: null, expr: 'sadness', text: 'Behind the bedframe lies only a damp cellar gust and a father too terrified of losing his family’s tongue to sleep deeply.' },
      { speaker: null, expr: 'joy', text: 'You nail shut the draft board and recite a warm English lullaby clearly until both breathe evenly.' },
    ],
  },
  wordThieves: {
    id: 'word_thieves',
    title: 'Thieves of Words',
    offerLines: [
      { speaker: 'yuki', expr: 'anger', text: 'Half my town notice sheets vanished off the board overnight! Wait—tiny muddy bootprints lead behind the mill barrels!' },
      { speaker: null, expr: 'fear', text: 'Behind the mill hide two shivering refugee orphans gripping stolen parchment strips to trade at black stalls for soup.' },
    ],
    punishReply: 'You march the sheets back to Yuki’s desk strictly. Law stays upright—though the thinner kid glances backward once with hollow ribs.',
    feedReply: 'You buy two hot loaves from Bea, write easy words onto scrap wood for them instead, and introduce them to Yuki’s school bench.',
  },
  lostDog: {
    title: 'Small Bark in the Ash',
    lines: [
      { speaker: null, expr: 'sadness', text: 'After the raid smoke cleared, a limping terrier whines beside a shattered barrel, guarding a faded red collar.' },
      { speaker: null, expr: 'joy', text: 'Carrying warm water and calm words earns one wet nose nudging your hand—Wait, isn’t that the Miller family’s pup?!' },
    ],
  },
};

export const RETURN_FAREWELLS = {
  aria: [
    { speaker: 'aria', expr: 'sadness', song: 'aria', text: 'Aria presses a small folded linen packet of chamomile seeds into your palm. "Plant these somewhere gray on Earth, okay?"' },
    { speaker: 'aria', expr: 'love', text: '"Go home cleanly—or stay by my clinic bench. Either way, thank you for teaching a quiet healer to hope again."' },
  ],
  mira: [
    { speaker: 'mira', expr: 'joy', text: 'Mira hands you a dull iron horseshoe nail—not a weapon, just good steel. "If any Earth boss acts heavier than a troll, tap this on their desk."' },
  ],
  yuki: [
    { speaker: 'yuki', expr: 'sadness', text: 'Yuki tucks a pressed silver leaf between your grammar notes. "Say \'Eldermoor\' once under your quiet sky so Earth winds remember us."' },
  ],
  garrick: [
    { speaker: 'garrick', expr: 'joy', text: 'Garrick snaps a crisp northern salute. "Every watchtower along this coast stays lit for your name, comrade!"' },
  ],
  nyx: [
    { speaker: 'nyx', expr: 'love', song: 'nyx', text: 'Nyx stands right under full daylight for you. "I won’t ask for promises. If you come back—or if you keep me here—we walk together."' },
  ],
  lea: [
    { speaker: 'lea', expr: 'joy', text: 'Lea nudges her shoulder against yours like waiting at an airport gate. "See you at the terminal? Or better yet—breakfast at Hugo’s first."' },
  ],
  hugo: [
    { speaker: 'hugo', expr: 'joy', text: 'Hugo slaps a packed bamboo bento box into your bag. "Two rice balls and fried cutlet—real Earth road food. Proud of you, friend."' },
  ],
};
