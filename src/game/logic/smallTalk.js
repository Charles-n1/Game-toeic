import { NPCS } from '../data/npcs';
import { DAILY_TALK, DEMON_TALK, FIRE_TALK, NIGHT_TALK, HERO_TALK } from '../data/smallTalk';
import { pickRandom } from '../../logic/random';
import { visibleVillagers } from './villagers';
import { isNight } from './clock';
import { demonLandSize } from './war/demonLand';
import { burningTrees } from './war/forestFire';

// The people talk together. Two people who meet (villagers, or the people of the story) stop, turn to each other,
// and say a few lines in turns, written over their heads. Then they go on with their day.
// What they talk about follows the world: the demons, the forest fires, the night, the hero passing by.
// game.run.talks: [{ speakers: [{ ref, name }, { ref, name }], lines, index, nextAt, line: { who, text, until } }]
// (ref: the villager, or game.run.people[id]: its x, y and dir; while it talks, ref.talkUntil stops its walk)

const TALK_RANGE = 2.6; // tiles: two people this close may start a conversation
const LOOK_RANGE = 18; // tiles: only the people near the hero talk (nobody would see the others)
const LINE_SECONDS = 3.2; // how long each line stays over a head
const START_CHANCE = 0.25; // each second, the chance that two free people next to each other start to talk
const REST_SECONDS = [35, 80]; // after a conversation, a person waits this long before the next one
const HERO_CLOSE = 5; // tiles: the hero is this close: they may talk about the hero

// Called about once per second.
export function updateSmallTalk(game) {
  const now = Date.now();
  game.run.talks = (game.run.talks || []).filter((talk) => sayNextLine(talk, now));
  const free = talkersAround(game).filter((talker) => isFree(talker.ref, now));
  for (const first of free) {
    if (!isFree(first.ref, now)) continue; // already took a partner during this loop
    const second = free.find((other) => other !== first && isFree(other.ref, now) && distance(other.ref, first.ref) < TALK_RANGE);
    if (second && Math.random() < START_CHANCE) startTalk(game, first, second, now);
  }
}

// The people who can talk, around the hero: the villagers (not the kids, not the fighters) and the people
// of the story walking in the village (not exploring outside, not talking with the hero).
function talkersAround(game) {
  const villagers = visibleVillagers(game)
    .filter((villager) => !villager.kid && !villager.fighting && distance(villager, game.player) < LOOK_RANGE)
    .map((villager) => ({ ref: villager, name: villager.name }));
  const people = NPCS.filter((npc) => game.run.visible[npc.id] && !game.npcs[npc.id]?.ko)
    .map((npc) => ({ ref: game.run.people[npc.id], name: npc.name }))
    .filter((talker) => talker.ref && !talker.ref.exploring && distance(talker.ref, game.player) < LOOK_RANGE && distance(talker.ref, game.player) > 1.6);
  return [...villagers, ...people];
}

function isFree(ref, now) {
  return !(ref.talkUntil > now) && now >= (ref.talkRestUntil || 0);
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

// The two stop and face each other; the conversation starts at once.
function startTalk(game, first, second, now) {
  const lines = pickRandom(topicOf(game, first.ref));
  const until = now + (lines.length * LINE_SECONDS + 0.6) * 1000;
  for (const [talker, other] of [[first, second], [second, first]]) {
    talker.ref.talkUntil = until;
    talker.ref.walking = false;
    faceTo(talker.ref, other.ref);
  }
  game.run.talks.push({ speakers: [first, second], lines: lines, index: 0, nextAt: now, line: null });
}

// What they talk about: the news of the world first, often just their day.
function topicOf(game, ref) {
  const topics = [DAILY_TALK, DAILY_TALK];
  if (demonLandSize(game) > 0) topics.push(DEMON_TALK);
  if (burningTrees(game).length > 0) topics.push(FIRE_TALK, FIRE_TALK);
  if (isNight(game)) topics.push(NIGHT_TALK);
  if (distance(ref, game.player) < HERO_CLOSE) topics.push(HERO_TALK, HERO_TALK);
  return pickRandom(topics);
}

// The next line of a conversation, in turns. false: the conversation is over (both rest a while).
function sayNextLine(talk, now) {
  if (now < talk.nextAt) return true;
  if (talk.index >= talk.lines.length) {
    for (const talker of talk.speakers) talker.ref.talkRestUntil = now + (REST_SECONDS[0] + Math.random() * (REST_SECONDS[1] - REST_SECONDS[0])) * 1000;
    return false;
  }
  const who = talk.speakers[talk.index % 2];
  talk.line = { who: who, text: talk.lines[talk.index], until: now + LINE_SECONDS * 1000 };
  talk.index += 1;
  talk.nextAt = now + LINE_SECONDS * 1000;
  return true;
}

function faceTo(ref, other) {
  const dx = other.x - ref.x;
  const dy = other.y - ref.y;
  ref.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : dy < 0 ? 'up' : 'down';
}

// The lines said right now (for the drawing): [{ x, y, name, text }].
export function spokenLines(game) {
  const now = Date.now();
  return (game.run.talks || [])
    .filter((talk) => talk.line && now < talk.line.until)
    .map((talk) => ({ x: talk.line.who.ref.x, y: talk.line.who.ref.y, name: talk.line.who.name, text: talk.line.text }));
}
