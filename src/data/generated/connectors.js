// Generated questions: connectors (because, although, despite, however, therefore...).
import { buildQuestions, pick, capital, fill } from './tools';
import { ORGS } from './words';

// A situation: a cause, its normal effect, and the opposite (a surprise). causeNoun: the cause as a noun.
// {O} = the company ("the hotel"), always singular ("its").
const SITUATIONS = [
  { cause: '{O} lowered its prices', causeNoun: 'the lower prices', effect: 'sales at {O} rose sharply', surprise: 'sales at {O} did not increase' },
  { cause: 'the shipment arrived late', causeNoun: 'the late shipment', effect: '{O} could not open on time', surprise: '{O} opened on time' },
  { cause: 'the weather was terrible', causeNoun: 'the terrible weather', effect: '{O} canceled the outdoor event', surprise: '{O} held the outdoor event' },
  { cause: '{O} hired ten new engineers', causeNoun: 'the new engineers', effect: 'the project was finished early', surprise: 'the project was still finished late' },
  { cause: 'the director was ill', causeNoun: 'the illness of the director', effect: '{O} postponed the meeting', surprise: '{O} did not postpone the meeting' },
  { cause: 'demand was very high', causeNoun: 'the high demand', effect: '{O} ran out of stock', surprise: '{O} still had plenty of stock' },
  { cause: 'the main road was closed', causeNoun: 'the road closure', effect: 'many employees arrived late', surprise: 'most employees arrived on time' },
  { cause: 'the budget was cut', causeNoun: 'the budget cut', effect: '{O} delayed its expansion', surprise: '{O} continued its expansion' },
  { cause: '{O} received many complaints', causeNoun: 'the many complaints', effect: '{O} changed its delivery service', surprise: '{O} did not change its delivery service' },
  { cause: 'the new software was easy to use', causeNoun: 'the easy new software', effect: 'the staff learned it in one day', surprise: 'the staff needed weeks to learn it' },
  { cause: 'the costs of materials went up', causeNoun: 'the higher cost of materials', effect: '{O} raised its prices', surprise: '{O} kept its prices low' },
  { cause: 'the advertising campaign was successful', causeNoun: 'the successful campaign', effect: '{O} gained many new customers', surprise: '{O} gained very few customers' },
  { cause: 'the printer broke down', causeNoun: 'the broken printer', effect: 'the brochures were not ready', surprise: 'the brochures were ready on time' },
  { cause: 'the venue was too small', causeNoun: 'the small size of the venue', effect: '{O} moved the event to a hotel', surprise: '{O} kept the event at the same place' },
  { cause: 'the flight was canceled', causeNoun: 'the canceled flight', effect: 'the speaker missed the conference', surprise: 'the speaker reached the conference in time' },
  { cause: 'the staff worked overtime', causeNoun: 'the extra hours of the staff', effect: 'all the orders were shipped', surprise: 'some orders were still not shipped' },
  { cause: 'the new manager was very experienced', causeNoun: 'the experience of the new manager', effect: 'the team improved quickly', surprise: 'the team did not improve' },
  { cause: 'the internet connection was slow', causeNoun: 'the slow connection', effect: 'the video call was interrupted', surprise: 'the video call went smoothly' },
  { cause: 'the factory was very old', causeNoun: 'the age of the factory', effect: '{O} decided to build a new one', surprise: '{O} decided to keep using it' },
  { cause: 'the reviews were excellent', causeNoun: 'the excellent reviews', effect: 'all the tickets were sold in a day', surprise: 'many tickets were left unsold' },
  { cause: 'the contract was unclear', causeNoun: 'the unclear contract', effect: 'the lawyers asked for changes', surprise: 'the lawyers accepted it' },
  { cause: 'the elevator was out of order', causeNoun: 'the broken elevator', effect: 'the visitors used the stairs', surprise: 'the visitors reached the top floor quickly' },
  { cause: 'heavy snow fell all night', causeNoun: 'the heavy snow', effect: '{O} closed for the day', surprise: '{O} stayed open all day' },
  { cause: '{O} moved to a bigger building', causeNoun: 'the move to a bigger building', effect: '{O} could welcome more clients', surprise: '{O} still lacked space' },
  { cause: '{O} updated its website', causeNoun: 'the new website', effect: 'online orders at {O} doubled', surprise: 'online orders at {O} stayed the same' },
  { cause: 'the suppliers raised their prices', causeNoun: 'the higher supplier prices', effect: '{O} looked for new suppliers', surprise: '{O} kept the same suppliers' },
  { cause: '{O} won an important award', causeNoun: 'the important award', effect: 'many journalists wrote about {O}', surprise: 'few people heard about {O}' },
  { cause: 'the inspection found several problems', causeNoun: 'the problems found during the inspection', effect: '{O} had to close for a week', surprise: '{O} was allowed to stay open' },
  { cause: 'the training was very practical', causeNoun: 'the practical training', effect: 'the new staff felt ready', surprise: 'the new staff still felt unprepared' },
];

// The situation with a company in it: every {O} becomes "the hotel".
function situation(random) {
  const item = pick(random, SITUATIONS);
  const words = { O: pick(random, ORGS) };
  return { org: words.O, cause: fill(item.cause, words), causeNoun: item.causeNoun, effect: fill(item.effect, words), surprise: fill(item.surprise, words) };
}

// The second part of a sentence says "it" instead of the company named just before.
// ("...about the hotel because the hotel won" -> "...about the hotel because it won")
function second(it, first, clause) {
  return first.includes(it.org) && clause.startsWith(it.org) ? 'it' + clause.slice(it.org.length) : clause;
}

// "The hotel could not open on time ___ the shipment arrived late." -> because
function because(random) {
  const it = situation(random);
  return {
    difficulty: 'normal',
    question: capital(it.effect) + ' ___ ' + second(it, it.effect, it.cause) + '.',
    good: pick(random, ['because', 'since']),
    wrong: ['although', 'despite', 'however'],
    justification: 'The second part gives the reason: because / since + a clause (subject + verb).',
  };
}

// "___ the shipment arrived late, the hotel opened on time." -> Although
function although(random) {
  const it = situation(random);
  return {
    difficulty: 'normal',
    question: '___ ' + it.cause + ', ' + second(it, it.cause, it.surprise) + '.',
    good: pick(random, ['Although', 'Even though']),
    wrong: ['Because', 'Despite', 'Therefore'],
    justification: 'The two parts are in contrast (a surprise), and a clause follows: although / even though.',
  };
}

// "___ the late shipment, the hotel could not open on time." -> Due to
function dueTo(random) {
  const it = situation(random);
  return {
    difficulty: 'hard',
    question: '___ ' + it.causeNoun + ', ' + it.effect + '.',
    good: pick(random, ['Due to', 'Because of', 'Owing to']),
    wrong: ['Because', 'Despite', 'Although'],
    justification: 'A reason followed by a NOUN (not a clause): due to / because of.',
  };
}

// "___ the late shipment, the hotel opened on time." -> Despite
function despite(random) {
  const it = situation(random);
  return {
    difficulty: 'hard',
    question: '___ ' + it.causeNoun + ', ' + it.surprise + '.',
    good: pick(random, ['Despite', 'In spite of']),
    wrong: ['Although', 'Due to', 'Because of'],
    justification: 'A contrast followed by a NOUN (not a clause): despite / in spite of.',
  };
}

// "The shipment arrived late. ___, the hotel could not open on time." -> As a result
function asAResult(random) {
  const it = situation(random);
  return {
    difficulty: 'hard',
    question: capital(it.cause) + '. ___, ' + second(it, it.cause, it.effect) + '.',
    good: pick(random, ['As a result', 'Therefore', 'Consequently']),
    wrong: ['However', 'Although', 'Because of'],
    justification: 'A new sentence that gives the consequence: as a result / therefore / consequently.',
  };
}

// "The shipment arrived late. ___, the hotel opened on time." -> However
function however(random) {
  const it = situation(random);
  return {
    difficulty: 'hard',
    question: capital(it.cause) + '. ___, ' + second(it, it.cause, it.surprise) + '.',
    good: pick(random, ['However', 'Nevertheless', 'Even so']),
    wrong: ['Therefore', 'Although', 'Because'],
    justification: 'A new sentence in contrast with the one before: however / nevertheless.',
  };
}

// "The hotel will lose customers ___ it improves its service." -> unless
function unless(random) {
  const org = pick(random, ORGS);
  const pairs = [
    ['will lose customers', 'it improves its service'],
    ['will miss the deadline', 'it hires more staff'],
    ['can not open the new branch', 'the bank approves the loan'],
    ['will not reach its sales target', 'it lowers its prices'],
    ['will have to close the store', 'sales improve soon'],
    ['can not sign the contract', 'the lawyers approve it'],
  ];
  const [result, condition] = pick(random, pairs);
  return {
    difficulty: 'extreme',
    question: capital(org) + ' ' + result + ' ___ ' + condition + '.',
    good: 'unless',
    wrong: ['because', 'although', 'despite'],
    justification: '"Unless" = if ... not: it will happen if this condition is NOT met.',
  };
}

// "Please arrive early ___ we can start on time." -> so that
function soThat(random) {
  const pairs = [
    ['Please arrive ten minutes early', 'we can start on time'],
    ['We printed extra copies', 'everyone could read the report'],
    ['The manager spoke slowly', 'the new staff could follow'],
    ['Please send your answer by Friday', 'we can book the hotel'],
    ['The store opens earlier on Saturdays', 'more customers can shop'],
    ['We moved the meeting to the big room', 'all the guests could sit down'],
  ];
  const [action, goal] = pick(random, pairs);
  return {
    difficulty: 'extreme',
    question: action + ' ___ ' + goal + '.',
    good: 'so that',
    wrong: ['in order to', 'because of', 'even if'],
    justification: '"So that" + a clause (subject + can/could) gives the goal. "In order to" is followed by a verb only.',
  };
}

export function makeConnectors(count) {
  return buildQuestions('connectors', count, [because, although, dueTo, despite, asAResult, however, because, although, unless, soThat], 909);
}
