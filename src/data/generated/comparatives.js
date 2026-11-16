// Generated questions: comparatives and superlatives.
import { buildQuestions, pick } from './tools';

// An adjective and its forms. A short one takes -er / -est, a long one more / most.
function short(base, comparative, superlative) {
  return { base, comparative, superlative, isShort: true };
}
function long(base) {
  return { base, comparative: 'more ' + base, superlative: 'most ' + base, isShort: false };
}

const ADJ = {
  fast: short('fast', 'faster', 'fastest'),
  cheap: short('cheap', 'cheaper', 'cheapest'),
  quiet: short('quiet', 'quieter', 'quietest'),
  light: short('light', 'lighter', 'lightest'),
  large: short('large', 'larger', 'largest'),
  small: short('small', 'smaller', 'smallest'),
  busy: short('busy', 'busier', 'busiest'),
  easy: short('easy', 'easier', 'easiest'),
  safe: short('safe', 'safer', 'safest'),
  new: short('new', 'newer', 'newest'),
  good: short('good', 'better', 'best'),
  bad: short('bad', 'worse', 'worst'),
  reliable: long('reliable'),
  efficient: long('efficient'),
  expensive: long('expensive'),
  popular: long('popular'),
  affordable: long('affordable'),
  convenient: long('convenient'),
  modern: long('modern'),
  comfortable: long('comfortable'),
  durable: long('durable'),
  profitable: long('profitable'),
  spacious: long('spacious'),
  successful: long('successful'),
  flexible: long('flexible'),
  attractive: long('attractive'),
};

// The things compared, the noun for "the ___ X in ...", and the adjectives that make sense for them.
const THINGS = [
  { name: 'This printer', other: 'the old one', noun: 'printer', place: 'our catalog', adjectives: ['fast', 'cheap', 'quiet', 'light', 'reliable', 'efficient', 'expensive', 'durable', 'good'] },
  { name: 'The new software', other: 'the previous version', noun: 'software', place: 'the market', adjectives: ['fast', 'easy', 'reliable', 'efficient', 'expensive', 'popular', 'flexible', 'good', 'safe'] },
  { name: 'The downtown office', other: 'the suburban one', noun: 'office', place: 'the company', adjectives: ['large', 'small', 'quiet', 'busy', 'modern', 'spacious', 'convenient', 'expensive', 'comfortable'] },
  { name: 'The express service', other: 'the standard service', noun: 'service', place: 'the region', adjectives: ['fast', 'reliable', 'expensive', 'popular', 'convenient', 'efficient', 'good'] },
  { name: 'The Harbor Hotel', other: 'the Plaza Hotel', noun: 'hotel', place: 'the city', adjectives: ['large', 'quiet', 'busy', 'modern', 'spacious', 'comfortable', 'expensive', 'affordable', 'popular', 'new'] },
  { name: 'Our latest laptop', other: 'its competitors', noun: 'laptop', place: 'the store', adjectives: ['fast', 'light', 'cheap', 'durable', 'powerful', 'attractive', 'expensive', 'affordable', 'good'].filter((id) => ADJ[id]) },
  { name: 'The east branch', other: 'the west branch', noun: 'branch', place: 'the country', adjectives: ['busy', 'large', 'small', 'profitable', 'successful', 'modern', 'new'] },
  { name: 'The second proposal', other: 'the first one', noun: 'proposal', place: 'the competition', adjectives: ['cheap', 'good', 'bad', 'detailed', 'attractive', 'affordable', 'flexible', 'expensive'].filter((id) => ADJ[id]) },
  { name: 'The new delivery van', other: 'the old truck', noun: 'vehicle', place: 'our fleet', adjectives: ['fast', 'safe', 'small', 'efficient', 'reliable', 'comfortable', 'new', 'cheap'] },
  { name: 'This year\'s conference venue', other: 'last year\'s venue', noun: 'venue', place: 'the area', adjectives: ['large', 'spacious', 'modern', 'convenient', 'affordable', 'comfortable', 'expensive', 'popular'] },
];

// A start of sentence, to vary them: "Customers agree that this printer..."
const OPENERS = ['', 'Customers agree that ', 'The report shows that ', 'Most users think ', 'According to the manager, ', 'Our tests confirm that ', 'Everyone noticed that ', 'The survey suggests that '];

// "This printer" with an opener: "Most users think this printer".
function opened(random, name) {
  const opener = pick(random, OPENERS);
  return opener === '' ? name : opener + name.charAt(0).toLowerCase() + name.slice(1);
}

function thingAndAdjective(random) {
  const thing = pick(random, THINGS);
  return { thing: thing, adj: ADJ[pick(random, thing.adjectives)] };
}

// The wrong forms, written like mistakes learners make: "more cheaper", "reliabler".
function badComparative(adj) {
  return adj.isShort ? 'more ' + adj.comparative : adj.base + 'er';
}

// "This printer is ___ than the old one." -> cheaper
function than(random) {
  const { thing, adj } = thingAndAdjective(random);
  return {
    difficulty: 'normal',
    question: opened(random, thing.name) + ' is ___ than ' + thing.other + '.',
    good: adj.comparative,
    wrong: [adj.superlative, adj.base, badComparative(adj)],
    justification: '"Than" asks for a comparative: ' + adj.comparative + (adj.isShort ? ' (short adjective: -er).' : ' (long adjective: more + adjective).'),
  };
}

// "It is the ___ hotel in the city." -> largest
function superlative(random) {
  const { thing, adj } = thingAndAdjective(random);
  return {
    difficulty: 'normal',
    question: pick(random, ['According to the survey, it', 'Many people say it', 'The magazine says it', 'Without a doubt, it', 'Our customers believe it']) + ' is the ___ ' + thing.noun + ' in ' + thing.place + '.',
    good: adj.superlative,
    wrong: [adj.comparative, adj.base, adj.isShort ? 'most ' + adj.comparative : adj.base + 'est'],
    justification: '"The ... in" + a group asks for a superlative: the ' + adj.superlative + '.',
  };
}

// "The new van is as ___ as the old truck." -> reliable
function asAs(random) {
  const { thing, adj } = thingAndAdjective(random);
  return {
    difficulty: 'normal',
    question: opened(random, thing.name) + ' is just as ___ as ' + thing.other + '.',
    good: adj.base,
    wrong: [adj.comparative, adj.superlative, 'the ' + adj.superlative],
    justification: '"As ... as" takes the simple adjective: as ' + adj.base + ' as.',
  };
}

// "This printer is ___ cheaper than the old one." -> much
function muchBefore(random) {
  const { thing, adj } = thingAndAdjective(random);
  return {
    difficulty: 'hard',
    question: opened(random, thing.name) + ' is ___ ' + adj.comparative + ' than ' + thing.other + '.',
    good: pick(random, ['much', 'far', 'considerably', 'significantly']),
    wrong: ['very', 'most', 'many'],
    justification: 'Before a comparative, use much / far / considerably, never "very".',
  };
}

// "The earlier you register, the ___ the fee." -> lower
function theMoreTheMore(random) {
  const pairs = [
    ['The earlier you book', 'the price', ADJ.cheap],
    ['The more you order', 'the discount', short('big', 'bigger', 'biggest')],
    ['The sooner we start', 'the results', ADJ.good],
    ['The longer you wait', 'the line', short('long', 'longer', 'longest')],
    ['The more you practice', 'the test', ADJ.easy],
    ['The higher the quality', 'the product', ADJ.expensive],
    ['The more customers we have', 'the company', ADJ.profitable],
    ['The more often you train', 'the work', ADJ.easy],
  ];
  const [start, subject, adj] = pick(random, pairs);
  const ending = random() < 0.5 ? ' will be' : ' becomes';
  return {
    difficulty: 'extreme',
    question: start + ', the ___ ' + subject + ending + '.',
    good: adj.comparative,
    wrong: [adj.superlative, adj.base, badComparative(adj)],
    justification: '"The + comparative ..., the + comparative ...": the ' + adj.comparative + '.',
  };
}

// "Of the two offers, this one is the ___." -> cheaper
function ofTheTwo(random) {
  const { thing, adj } = thingAndAdjective(random);
  return {
    difficulty: 'extreme',
    question: 'Of the two options, ' + thing.name.charAt(0).toLowerCase() + thing.name.slice(1) + ' is clearly the ___ one.',
    good: adj.comparative,
    wrong: [adj.base, badComparative(adj), adj.isShort ? 'most ' + adj.base : adj.base + 'est'],
    justification: '"Of the two" compares two things only: the comparative (the ' + adj.comparative + ' one).',
  };
}

export function makeComparatives(count) {
  return buildQuestions('comparatives', count, [than, superlative, asAs, than, muchBefore, superlative, theMoreTheMore, ofTheTwo], 505);
}
