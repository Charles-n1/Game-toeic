// Generated questions: vocabulary (the word that fits the meaning, business English).
import { buildQuestions, pick, capital, fill } from './tools';
import { PEOPLE, GROUPS, ORGS, PAST_TIMES, FUTURE_TIMES } from './words';

// One model: the sentence ({P} a person, {G} people, {O} a company, {F} a future time, {D} a past time),
// the good word, 3 wrong words of the same kind, and what the good word means here.
function word(sentence, good, wrong, meaning) {
  return { sentence, good, wrong, meaning };
}

const MODELS = [
  // ---------- Verbs ----------
  word('{O} will ___ its new product line {F}.', 'launch', ['resign', 'commute', 'attend'], '"launch a product" = put it on the market'),
  word('{P} was asked to ___ the quarterly sales figures.', 'compile', ['commute', 'resign', 'expire'], '"compile figures" = collect and put them together'),
  word('Please ___ the attached form and return it by Friday.', 'complete', ['resign', 'expire', 'commute'], '"complete a form" = fill it in'),
  word('{P} will ___ the training session {F}.', 'conduct', ['expire', 'reside', 'consist'], '"conduct a session" = lead it'),
  word('{O} decided to ___ its contract with the supplier.', 'terminate', ['commute', 'reside', 'graduate'], '"terminate a contract" = end it'),
  word('{G} must ___ the safety guidelines at all times.', 'follow', ['expire', 'resign', 'graduate'], '"follow guidelines" = obey them'),
  word('{P} will ___ the client at the airport {F}.', 'meet', ['expire', 'consist', 'reside'], '"meet someone" = go to see them'),
  word('{O} plans to ___ fifty new employees {F}.', 'hire', ['resign', 'expire', 'retire'], '"hire" = give someone a job'),
  word('{P} had to ___ the meeting because of a family emergency.', 'postpone', ['attend', 'invent', 'deposit'], '"postpone" = move to a later time'),
  word('{G} were asked to ___ their expense reports by the end of the month.', 'submit', ['reside', 'expire', 'commute'], '"submit a report" = hand it in'),
  word('{O} hopes to ___ its market share in Asia.', 'expand', ['resign', 'deposit', 'persuade'], '"expand market share" = make it bigger'),
  word('{P} will ___ the company at the trade fair {F}.', 'represent', ['resign', 'consist', 'expire'], '"represent a company" = speak and act for it'),
  word('Customers can ___ their tickets online at no extra cost.', 'purchase', ['resign', 'commute', 'retire'], '"purchase" = buy'),
  word('{P} asked the bank to ___ the loan for another year.', 'extend', ['resign', 'arrive', 'consist'], '"extend a loan" = make it last longer'),
  word('{O} will ___ all damaged items free of charge.', 'replace', ['resign', 'commute', 'reside'], '"replace" = give a new one instead'),
  word('{P} managed to ___ a better price with the supplier.', 'negotiate', ['commute', 'reside', 'expire'], '"negotiate a price" = discuss to agree on it'),
  word('{G} will ___ the results of the survey {F}.', 'analyze', ['commute', 'resign', 'reside'], '"analyze results" = study them in detail'),
  word('Please ___ from smoking inside the building.', 'refrain', ['prevent', 'avoid', 'stop'], '"refrain from" = not do something (only "refrain" takes "from" alone here)'),
  word('{P} was promoted after she ___ all her sales targets.', 'exceeded', ['resigned', 'commuted', 'expired'], '"exceed a target" = do more than it'),
  word('{O} has ___ a new policy on remote work.', 'implemented', ['resided', 'commuted', 'graduated'], '"implement a policy" = put it into action'),
  word('{P} will ___ the new employees to the rest of the team {F}.', 'introduce', ['resign', 'expire', 'consist'], '"introduce someone to" = present them'),
  word('{O} ___ a 10% discount to all its loyal customers.', 'offers', ['resigns', 'commutes', 'expires'], '"offer a discount" = give one'),
  word('Our membership cards ___ at the end of each year.', 'expire', ['resign', 'commute', 'graduate'], '"expire" = stop being valid'),
  word('{P} ___ from the company after twenty years of service.', 'retired', ['expired', 'commuted', 'deposited'], '"retire" = stop working at the end of a career'),
  word('{G} ___ to work by train every day.', 'commute', ['resign', 'expire', 'deposit'], '"commute" = travel between home and work'),
  word('{P} will ___ the money into the company account {F}.', 'deposit', ['resign', 'commute', 'expire'], '"deposit money" = put it in a bank account'),
  word('{O} was able to ___ its costs by 15% this year.', 'reduce', ['resign', 'commute', 'reside'], '"reduce costs" = make them lower'),
  word('{P} could not ___ the conference because of a delayed flight.', 'attend', ['resign', 'expire', 'consist'], '"attend a conference" = go to it'),
  word('The new rules will ___ effect {F}.', 'take', ['make', 'do', 'give'], '"take effect" = start to apply'),
  word('{P} is responsible for ___ customer complaints.', 'handling', ['resigning', 'commuting', 'expiring'], '"handle complaints" = deal with them'),

  // ---------- Nouns ----------
  word('{P} sent the ___ for the new office furniture to the finance team.', 'invoice', ['resume', 'agenda', 'itinerary'], 'an "invoice" = a bill asking to be paid for goods'),
  word('Please check the ___ before the meeting: there are five topics to discuss.', 'agenda', ['invoice', 'receipt', 'warranty'], 'an "agenda" = the list of topics of a meeting'),
  word('{P} attached a detailed ___ to the job application.', 'résumé', ['receipt', 'invoice', 'refund'], 'a "résumé" = a summary of one\'s studies and work'),
  word('Keep your ___ in case you need to return the item.', 'receipt', ['agenda', 'résumé', 'itinerary'], 'a "receipt" = the paper that proves you paid'),
  word('The printer is still under ___, so the repair is free.', 'warranty', ['agenda', 'invoice', 'itinerary'], 'a "warranty" = the promise to repair for free during a time'),
  word('{P} received a full ___ for the canceled flight.', 'refund', ['agenda', 'warranty', 'résumé'], 'a "refund" = money given back'),
  word('The travel agent sent {P} a copy of the ___ for the business trip.', 'itinerary', ['invoice', 'refund', 'warranty'], 'an "itinerary" = the plan of a journey'),
  word('{O} is looking for a supplier with a good ___ for quality.', 'reputation', ['itinerary', 'receipt', 'agenda'], 'a "reputation" = what people think of you'),
  word('The ___ for applications is next Friday at 5 p.m.', 'deadline', ['warranty', 'receipt', 'refund'], 'a "deadline" = the last moment to do something'),
  word('{P} has ten years of ___ in international sales.', 'experience', ['receipt', 'invoice', 'deadline'], '"experience" = what you learned by working'),
  word('{O} offers a generous benefits ___ to all its employees.', 'package', ['agenda', 'receipt', 'deadline'], 'a "benefits package" = all the advantages of a job'),
  word('All employees must wear their identification ___ at all times.', 'badges', ['receipts', 'invoices', 'agendas'], 'a "badge" = a card worn to show who you are'),
  word('{P} was given a ___ for her excellent work this year.', 'bonus', ['receipt', 'deadline', 'warranty'], 'a "bonus" = extra money for good work'),
  word('The ___ of the new manager will be announced {F}.', 'appointment', ['itinerary', 'receipt', 'refund'], 'the "appointment" of someone = choosing them for a job'),
  word('{O} reported a large ___ in the last quarter.', 'profit', ['itinerary', 'agenda', 'receipt'], 'a "profit" = money earned after costs'),
  word('Please make a ___ at least two days in advance.', 'reservation', ['receipt', 'résumé', 'profit'], 'a "reservation" = a booking'),
  word('{P} asked for a ___ to discuss the new project with the director.', 'meeting', ['receipt', 'warranty', 'refund'], 'a "meeting" = people coming together to talk'),
  word('The ___ will be held in the main conference room {F}.', 'seminar', ['receipt', 'refund', 'invoice'], 'a "seminar" = a meeting to learn about a subject'),
  word('{O} has a strict ___ about the use of company phones.', 'policy', ['receipt', 'itinerary', 'refund'], 'a "policy" = a set of rules of a company'),
  word('{P} filled out a ___ form to ask for new office supplies.', 'request', ['receipt', 'résumé', 'profit'], 'a "request" = asking for something'),
  word('A ___ of the contract was sent to both parties.', 'copy', ['refund', 'profit', 'deadline'], 'a "copy" = the same document again'),
  word('{O} is offering a 20% ___ on all winter clothes.', 'discount', ['deadline', 'résumé', 'agenda'], 'a "discount" = a lower price'),
  word('The ___ of the shipment is expected {F}.', 'arrival', ['résumé', 'profit', 'agenda'], 'the "arrival" = the moment it comes'),
  word('{P} will give a short ___ on the sales results {F}.', 'presentation', ['receipt', 'refund', 'warranty'], 'a "presentation" = a talk showing information'),
  word('All ___ must be approved by the department head.', 'expenses', ['itineraries', 'résumés', 'agendas'], '"expenses" = money spent for work'),

  // ---------- Adjectives ----------
  word('Only ___ candidates will be invited for an interview.', 'qualified', ['delicious', 'punctual', 'spacious'], '"qualified" = with the right skills or diplomas'),
  word('The new office is very ___: there is room for forty desks.', 'spacious', ['punctual', 'delicious', 'qualified'], '"spacious" = with a lot of room'),
  word('{P} is always ___: she has never been late to a meeting.', 'punctual', ['spacious', 'delicious', 'durable'], '"punctual" = always on time'),
  word('These boots are very ___: they will last for years.', 'durable', ['punctual', 'qualified', 'eligible'], '"durable" = lasting a long time'),
  word('Employees with three years of service are ___ for the bonus.', 'eligible', ['durable', 'spacious', 'delicious'], '"eligible for" = allowed to receive'),
  word('The hotel is ___ located near the train station.', 'conveniently', ['punctually', 'deliciously', 'durably'], '"conveniently located" = in a practical place'),
  word('{O} offers ___ prices to students and seniors.', 'reduced', ['punctual', 'spacious', 'qualified'], '"reduced prices" = lower prices'),
  word('Please keep this information ___: do not share it outside the team.', 'confidential', ['punctual', 'spacious', 'durable'], '"confidential" = secret'),
  word('{P} gave a very ___ answer to the difficult question.', 'thoughtful', ['spacious', 'durable', 'punctual'], '"thoughtful" = showing careful thinking'),
  word('The museum is ___ to the public from 9 a.m. to 6 p.m.', 'open', ['durable', 'eligible', 'spacious'], '"open to the public" = anyone can enter'),
  word('{O} is the ___ supplier of office furniture in the region.', 'leading', ['punctual', 'eligible', 'delicious'], '"leading" = the most important'),
  word('This offer is only ___ until the end of the month.', 'valid', ['punctual', 'spacious', 'delicious'], '"valid" = that can be used'),
  word('The instructions are ___ in English, French and Spanish.', 'available', ['punctual', 'durable', 'delicious'], '"available" = that you can get'),
  word('The ___ meeting will be held on the first Monday of each month.', 'monthly', ['punctual', 'spacious', 'durable'], '"monthly" = every month'),
  word('{P} found the new software ___ to use.', 'easy', ['punctual', 'spacious', 'eligible'], '"easy to use" = not difficult'),
  word('The restaurant is famous for its ___ desserts.', 'delicious', ['punctual', 'eligible', 'qualified'], '"delicious" = very good to eat'),
  word('All ___ staff must attend the safety training.', 'new', ['delicious', 'spacious', 'durable'], '"new staff" = people who just started'),
  word('{O} is ___ to announce the opening of its new branch.', 'pleased', ['durable', 'spacious', 'eligible'], '"pleased to announce" = happy to say'),
  word('The director was ___ with the results of the survey.', 'satisfied', ['durable', 'spacious', 'punctual'], '"satisfied with" = happy with'),
  word('Visitors must show a ___ ID at the entrance.', 'valid', ['delicious', 'spacious', 'punctual'], '"a valid ID" = an identity card that is not expired'),

  // ---------- Adverbs ----------
  word('The package arrived ___ two days after the order.', 'only', ['very', 'quite', 'such'], '"only two days" = no more than two days'),
  word('{P} ___ answers e-mails within an hour.', 'usually', ['recently', 'lately', 'yet'], '"usually" = most of the time (present simple)'),
  word('{O} has ___ opened a new branch downtown.', 'recently', ['soon', 'usually', 'tomorrow'], '"recently" = not long ago (present perfect)'),
  word('The new manager will start work ___.', 'shortly', ['recently', 'lately', 'ago'], '"shortly" = soon'),
  word('Sales have increased ___ since the new campaign.', 'steadily', ['punctually', 'recently', 'shortly'], '"increase steadily" = grow regularly'),
  word('Please read the contract ___ before signing it.', 'carefully', ['recently', 'shortly', 'lately'], '"carefully" = with attention'),
  word('{P} was ___ surprised by the good results.', 'pleasantly', ['punctually', 'shortly', 'lately'], '"pleasantly surprised" = happily surprised'),
  word('The tickets sold out ___ after the concert was announced.', 'immediately', ['lately', 'recently', 'yet'], '"immediately" = at once'),

  // ---------- Expressions ----------
  word('{P} is in ___ of the marketing department.', 'charge', ['order', 'turn', 'case'], '"in charge of" = responsible for'),
  word('Please call us if you have ___ questions about the order.', 'any', ['much', 'every', 'little'], '"any questions" = questions, if there are some'),
  word('{G} are ___ to attend the welcome dinner {F}.', 'invited', ['punctual', 'spacious', 'durable'], '"invited to" = asked to come'),
  word('{O} will ___ a press conference {F}.', 'hold', ['make', 'do', 'take'], '"hold a conference" = organize it'),
  word('{P} will ___ a speech at the opening ceremony.', 'give', ['say', 'tell', 'speak'], '"give a speech"'),
  word('We need to ___ a decision before the end of the week.', 'make', ['do', 'take place', 'give up'], '"make a decision"'),
  word('{P} ___ a mistake in the sales report {D}.', 'made', ['did', 'took', 'held'], '"make a mistake"'),
  word('The store is ___ renovation and will reopen {F}.', 'under', ['on', 'over', 'in'], '"under renovation" = being renovated'),
  word('{P} is ___ vacation until Monday.', 'on', ['in', 'at', 'under'], '"on vacation" = on holiday'),
  word('{O} has been ___ business for more than fifty years.', 'in', ['on', 'at', 'under'], '"in business" = working as a company'),
  word('Payment is ___ within thirty days of the invoice date.', 'due', ['late', 'owed', 'early'], '"due" = must be paid'),
  word('Parking is free ___ charge for all hotel guests.', 'of', ['for', 'from', 'with'], '"free of charge" = it costs nothing'),
  word('{P} ___ part in the annual charity run {D}.', 'took', ['made', 'did', 'held'], '"take part in" = participate'),
  word('The meeting will ___ place in room 204 {F}.', 'take', ['make', 'have', 'hold'], '"take place" = happen'),
  word('{G} worked hard to ___ the deadline.', 'meet', ['reach out', 'join', 'arrive'], '"meet a deadline" = finish in time'),
  word('{P} ___ a call from an important client {D}.', 'received', ['resigned', 'commuted', 'expired'], '"receive a call"'),
];

// Starts of sentences, to vary them ("As announced, the hotel will...").
// Only for the sentences that start with someone or "The" (not with "Please...").
const OPENERS = ['', '', 'As you may know, ', 'According to the memo, ', 'As announced, ', 'As expected, ', 'Last time we checked, ', 'In short, '];

function canOpen(sentence) {
  return sentence.startsWith('{') || sentence.startsWith('The ');
}

// Fills the slots of a model: a person, people, a company, a time.
function filled(random, model) {
  const words = { P: pick(random, PEOPLE), G: pick(random, GROUPS), O: pick(random, ORGS), F: pick(random, FUTURE_TIMES), D: pick(random, PAST_TIMES) };
  const sentence = fill(model.sentence.replace(/^The /, 'the '), words);
  const opener = canOpen(model.sentence) ? pick(random, OPENERS) : '';
  return opener === '' ? capital(sentence) : opener + sentence;
}

// One model with new names in it.
function vocabularyQuestion(random) {
  const model = pick(random, MODELS);
  const isNeutral = !model.sentence.includes('she') && !model.sentence.includes('her ');
  const question = filled(random, model);
  if (!isNeutral && /Mr\.|Dr\. Wright/.test(question)) return null; // "she" in the sentence: not a man's name
  return {
    difficulty: model.wrong.some((other) => other.length > 9) ? 'hard' : 'normal',
    question: question,
    good: model.good,
    wrong: model.wrong,
    justification: capital(model.meaning) + '.',
  };
}

export function makeVocabulary(count) {
  return buildQuestions('vocabulary', count, [vocabularyQuestion], 1010);
}
