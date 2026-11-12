import greeting2Image from '../assets/Images/Frend/Tutorial/greeting2.png';
import greetingImage from '../assets/Images/Frend/Tutorial/greeting.png';
import talking1Image from '../assets/Images/Frend/Tutorial/talking1.png';
import talking2Image from '../assets/Images/Frend/Tutorial/talking2.png';
import ahhhImage from '../assets/Images/Frend/Tutorial/AHHH.png';
import ahhh2Image from '../assets/Images/Frend/Tutorial/AHHH2.png';
import chillImage from '../assets/Images/Frend/Tutorial/chill.png';
import chill2Image from '../assets/Images/Frend/Tutorial/chill2.png';
import montre_deboutImage from '../assets/Images/Frend/Tutorial/montre_debout.png';
import montre_debout2Image from '../assets/Images/Frend/Tutorial/montre_debout2.png';
import montre_assisImage from '../assets/Images/Frend/Tutorial/montre_assis.png';
import montre_assis2Image from '../assets/Images/Frend/Tutorial/montre_assis2.png';
import montre_coucheImage from '../assets/Images/Frend/Tutorial/montre_couche.png';
import montre_couche2Image from '../assets/Images/Frend/Tutorial/montre_couche2.png';
import sadfImage from '../assets/Images/Frend/Tutorial/sadf.png';
import chockedImage from '../assets/Images/Frend/Tutorial/chocked.png';
import cheeseImage from '../assets/Images/Frend/Tutorial/cheese.png';

// Everything about Frend (the friend in the tutorial, who also walks around the app).

// His animations. Frend/Tutorial: the drawings, all on the same canvas (603 x 908),
// head on the same line and feet on the same ground (else he "teleports" between poses).
// second: how long it moves (no second = 2 s, the default of FrameAnimation).
export const ANIMATIONS = {
  greeting: {
    frames: [
      greeting2Image, // greeting2 first
      greetingImage,
    ],
  },
  talking: {
    frames: [talking1Image, talking2Image],
    second: 10,
  },
  AHHH: {
    frames: [ahhhImage, ahhh2Image],
  },
  chill: {
    frames: [chillImage, chill2Image],
  },
  montre_debout: {
    frames: [montre_deboutImage, montre_debout2Image],
  },
  montre_assis: {
    frames: [montre_assisImage, montre_assis2Image],
  },
  montre_couche: {
    frames: [montre_coucheImage, montre_couche2Image],
  },
  // One drawing only: they don't move by themselves (when he walks, it's his whole body that moves).
  sadf: { frames: [sadfImage] },
  chocked: { frames: [chockedImage] },
  cheese: { frames: [cheeseImage] },
};
export const ANIMATION_NAMES = Object.keys(ANIMATIONS); // ['greeting', 'talking', 'AHHH', ...]

// ---------- When he walks around the app ----------

// "Sometimes": the chance that he comes (0.5 = 1 time out of 2).
export const CHANCES = {
  hello: 0.5, // he's there when you open the app
  page: 0.2, // he comes when you change page
  score: 0.33, // he reacts to your score (result screens)
  sad: 0.15, // when he passes: he's sad (sadf)
  jump: 0.3, // when he passes: he jumps
  stay: 0.25, // at the end of a visit: he stays a while (chill) instead of leaving
  random: 0.3, // when he passes: he says a random thing (RANDOM_LINES) instead of an encouragement
  conversation: 0.3, // when you tap him: a little conversation (CONVERSATIONS) instead of one line
};

// When you open the app. ('' = he just waves, without a bubble.)
export const HELLO_LINES = [
  'Hello man !',
  "What's up !!!",
  "You're back buddy !",
  'Hi !',
  '',
  'Hola !',
  'Bonjour !',
  'Konnichiwa !',
];

// When he passes by.
export const PASSING_LINES = [
  'Gambatte !',
  'Do your best mate !',
  'Chill !',
  'Good luck !',
  "I hope you're gonna keep it up !",
  "You're gonna do better !",
  "Don't lose hope !",
  'Do ur best buddy !',
  "Let's achieve our goals !",
  'GG for what you did !',
  "I think that's a courageous move to enter here..",
  ':D !',
  ':D',
  'XD',
  '67',
  'Damnnn !!',
  'hmh',
];

// Random things he says sometimes, when he passes by or chills (gibberish included).
export const RANDOM_LINES = [
  'oiezhidzpizedezpaij',
  'ijespjôdkezo^dekzêd',
  'pij',
  'jfezizejpiezjfepzj',
  'epezojfepojfpozejpf',
  'mhhhhh..',
  '...',
  "I hope I'll be reincarnated into an app..",
  "I wonder how Charlie's doing..",
  'Hmh.',
  '67777777777777777',
  '67',
  ':D',
  'XD',
];

// When you tap him (20 reactions).
export const TAP_LINES = [
  "Hey ! Don't poke me XD",
  'Yes ? ^^',
  'Ouch !',
  'Hehe, that tickles !',
  "I'm not a button ! >.<",
  'You again ? XD',
  'Stop clicking me and go train !! XD',
  'Did you do your recall today ?',
  'Psst.. train your flaws !',
  'One more question ? :D',
  'I believe in you !',
  "Hmm ? What's up ?",
  '*yawn*..',
  "Don't forget to retrieve your mistakes !",
  'GG for coming today !',
  "I'm just walking around, chill !",
  'Need help ? The tutorial is in the params !',
  'Your goal is waiting for you !',
  'Wanna know a secret ? ... I love the TOEIC XD',
  'AFK.. no wait, I am here !',
];

// When you tap him, sometimes: a little conversation (he says the lines one after the other).
export const CONVERSATIONS = [
  ['Hey !', "Do you know why I'm called Frend ?", '...', 'Me neither XD'],
  ['Psst..', 'The Recovery part is the most important.', "Don't tell anyone ;)"],
  ['You poked me.', '...', 'Rude. XD'],
  ['A question..', 'Do you sleep enough ?', 'Your brain stores what you learned while you sleep !'],
  ['I was thinking..', 'If I learn English with you..', 'do I get a TOEIC score too ?'],
];

// When he passes by, sad.
export const SAD_LINES = ['hmh', ''];

// After a test / a training: goal reached, or not.
export const GOOD_SCORE_LINES = ['GG for what you did !', 'Damnnn !!', ':D !', "Let's achieve our goals !"];
export const BAD_SCORE_LINES = ["Don't lose hope !", "You're gonna do better !", 'hmh', 'Do ur best buddy !'];
