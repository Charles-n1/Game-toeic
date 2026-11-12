import { shuffle } from '../logic/random';

// The lesson of each category (opened from the Statistics page, by clicking a category name).
// The player must click the word of the category in a sentence, 3 times, then explain what they understood.
//   find:        what to click, short: "the gerund" (shown above the sentence: "Click on the gerund :").
//   sentences:   the word(s) to click are in [brackets]: "She enjoys [reading] reports."
//                A sentence can also be { text, find }: its own "find" ("the infinitive", "the adverb"...).
//   explanation: shown at the very end.
export const SENTENCES_PER_LESSON = 3;

export const LESSONS = {
  gerunds: {
    find: 'the gerund',
    sentences: [
      'Ms. Park enjoys [reading] the weekly reports.',
      { text: 'The manager decided [to postpone] the launch.', find: 'the infinitive' },
      'We look forward to [meeting] you next week.',
      { text: 'Mr. Lee agreed [to sign] the contract.', find: 'the infinitive' },
      'Please avoid [using] your phone in the theater.',
      { text: 'The company plans [to open] a new office in Osaka.', find: 'the infinitive' },
      'She finished [writing] the proposal on Friday.',
      { text: 'They hope [to hire] two new engineers this year.', find: 'the infinitive' },
      'Would you mind [closing] the door?',
      { text: 'The director refused [to approve] the budget.', find: 'the infinitive' },
      'Our team suggested [moving] the event online.',
      { text: 'All employees need [to submit] their timesheets by Monday.', find: 'the infinitive' },
    ],
    explanation:
      'A gerund is a verb + -ing used like a noun (reading, using). An infinitive is to + a verb (to sign, to open).\n\n' +
      '• After enjoy, avoid, finish, mind, suggest, consider -> gerund: "She enjoys reading."\n' +
      '• After decide, agree, plan, hope, refuse, need, want -> infinitive: "He agreed to sign."\n' +
      '• After a preposition (in, of, for, about...) -> gerund. Careful: "look forward TO" is a preposition: "We look forward to meeting you."\n\n' +
      'TOEIC trick: look at the verb BEFORE the blank. It decides the form.',
  },
  prepositions: {
    find: 'the preposition',
    sentences: [
      'The meeting starts [at] 9 a.m.',
      'Ms. Tanaka has worked here [since] 2015.',
      'Please send the documents [by] email.',
      'The report is [on] your desk.',
      'The store is closed [during] the holidays.',
      'We will finish the project [before] Friday.',
      'The keys are [in] the top drawer.',
      'He has been our client [for] ten years.',
      'The office is [next to] the bank.',
      'The package arrived [after] lunch.',
      'The printer is [between] the two desks.',
      'Ms. Rossi walked [into] the conference room.',
    ],
    explanation:
      'A preposition is a small word that links a noun to the rest of the sentence: it tells the time, the place, the way...\n\n' +
      '• Time: at 9 a.m., on Monday, in March, during the holidays, before / after lunch.\n' +
      '• since + a starting point (since 2015). for + a duration (for ten years).\n' +
      '• Place: in the drawer, on the desk, at the office, next to the bank, between two desks, into the room.\n' +
      '• The way: by email, by train, by card.\n\n' +
      'TOEIC trick: at + an hour, on + a day, in + a month / a year. Since = a starting point, for = a duration.',
  },
  vocabulary: {
    find: 'the word',
    sentences: [
      { text: 'The meeting was [postponed] until next week.', find: 'the word that means "moved to a later time"' },
      { text: 'All employees must [attend] the training.', find: 'the word that means "be present at"' },
      { text: 'The company will [hire] three new designers.', find: 'the word that means "give a job to"' },
      { text: 'Please [confirm] your reservation by phone.', find: 'the word that means "say it is sure / correct"' },
      { text: 'The new policy is [mandatory] for all staff.', find: 'the word that means "required"' },
      { text: 'Our sales [increased] last quarter.', find: 'the word that means "went up"' },
      { text: 'The hotel offers a [complimentary] breakfast.', find: 'the word that means "free"' },
      { text: 'The manager [approved] the budget yesterday.', find: 'the word that means "officially said yes to"' },
      { text: 'Customers can get a [refund] within 30 days.', find: 'the word that means "money given back"' },
      { text: 'The flight was [canceled] because of the storm.', find: 'the word that means "will not happen anymore"' },
      { text: 'Ms. Ortiz is [responsible] for the sales team.', find: 'the word that means "in charge"' },
      { text: 'The store sells a wide [range] of products.', find: 'the word that means "variety"' },
    ],
    explanation:
      'Vocabulary questions test the MEANING of words. The 4 answers are often the same kind of word (4 verbs, 4 adjectives...): grammar can not help, only the meaning can.\n\n' +
      '• Read the whole sentence and find the clue words: "because of the storm" -> canceled.\n' +
      '• Learn words in context, with their business meaning: postpone = delay, complimentary = free, mandatory = required, range = variety.\n' +
      '• Watch out for words that look alike: complimentary (free) ≠ complementary (that goes well with).\n\n' +
      'TOEIC trick: if you hesitate, put each answer in the sentence and read it again. Only one really makes sense.',
  },
  passive: {
    find: 'the passive verb',
    sentences: [
      'The report [was written] by Ms. Lee.',
      'The new office [will be opened] in May.',
      'All orders [are shipped] within two days.',
      'The meeting [has been canceled].',
      'The packages [were delivered] this morning.',
      'English [is spoken] in many countries.',
      'The winner [will be announced] tomorrow.',
      'The documents [must be signed] by Friday.',
      'This bridge [was built] in 1920.',
      'Visitors [are asked] to wear a badge.',
      'The contract [is being reviewed] by our lawyers.',
      'Your password [should be changed] every month.',
    ],
    explanation:
      'Active: the subject DOES the action ("Ms. Lee wrote the report").\n' +
      'Passive: the subject RECEIVES the action ("The report was written by Ms. Lee").\n\n' +
      '• Passive = be (in any tense) + past participle: is spoken, was built, will be announced, has been canceled, is being reviewed, must be signed.\n' +
      '• "by + someone" often shows a passive.\n\n' +
      'TOEIC trick: ask yourself "does the subject do the action, or is it done to it?". A report can not write itself -> passive.',
  },
  pronouns: {
    find: 'the pronoun',
    sentences: [
      'Ms. Chen sent [her] report to the manager.',
      'The manager thanked [them] for the hard work.',
      'Mr. Brown prepared the slides [himself].',
      'The laptop on the desk is [mine].',
      'Please give [us] the final figures.',
      'The candidate [who] called yesterday is very qualified.',
      '[They] will arrive at the airport at noon.',
      'The company updated [its] website last week.',
      'Ms. Diaz asked [me] for the keys.',
      'The black umbrella is not [yours].',
      'The employees organized the party [themselves].',
      'The engineers finished [their] tests early.',
    ],
    explanation:
      'A pronoun replaces a noun, so we do not repeat it.\n\n' +
      '• Subject (before the verb): I, you, he, she, it, we, they -> "They will arrive."\n' +
      '• Object (after the verb or a preposition): me, you, him, her, it, us, them -> "Give us the figures."\n' +
      '• Possessive + a noun: my, your, his, her, its, our, their -> "its website".\n' +
      '• Possessive alone: mine, yours, his, hers, ours, theirs -> "The laptop is mine."\n' +
      '• Reflexive (the same person): myself, himself, themselves -> "He prepared it himself."\n' +
      '• Relative: who (people), which (things), that -> "The candidate who called..."\n\n' +
      'TOEIC trick: find the job of the blank: subject? object? before a noun? alone?',
  },
  comparatives: {
    find: 'the comparative',
    sentences: [
      'This printer is [faster than] the old one.',
      'The new model is [more expensive than] the previous one.',
      { text: 'This is [the cheapest] hotel in the city.', find: 'the superlative' },
      'Our sales were [better than] last year.',
      { text: 'Ms. Ito is [the most experienced] member of the team.', find: 'the superlative' },
      'The second test was [easier than] the first one.',
      { text: 'This is [the worst] storm of the year.', find: 'the superlative' },
      'The train is [less crowded than] the bus.',
      'Please arrive [earlier than] usual tomorrow.',
      { text: 'Tokyo is [the largest] city in Japan.', find: 'the superlative' },
      'The new software is [much easier] to use.',
      'Our office is [bigger than] the old one.',
    ],
    explanation:
      'A comparative compares 2 things. A superlative picks the top one of a group.\n\n' +
      '• Short adjective: fast -> faster than -> the fastest.\n' +
      '• Long adjective: expensive -> more expensive than -> the most expensive.\n' +
      '• Irregular: good -> better -> the best. bad -> worse -> the worst.\n' +
      '• Less: less crowded than.\n' +
      '• To make a comparative stronger: much / far easier (never "very easier").\n\n' +
      'TOEIC trick: "than" -> comparative. "the" + "of / in the group" -> superlative.',
  },
  subjectVerb: {
    find: 'the verb',
    sentences: [
      'The list of products [is] on the desk.',
      'Each employee [has] a parking space.',
      'The managers [want] a new schedule.',
      'Everyone [needs] a badge.',
      'The box of files [was] very heavy.',
      'Neither the director nor the assistants [are] available.',
      'The number of visitors [increases] every summer.',
      'A number of clients [have complained].',
      'Mathematics [is] my favorite subject.',
      'The team members [work] on Saturdays.',
      'Ms. Garcia, with her two assistants, [is] in Paris.',
      'The news about the merger [was] surprising.',
    ],
    explanation:
      'The verb must agree with its REAL subject: a singular subject -> a singular verb (is, has, needs), a plural subject -> a plural verb (are, have, need).\n\n' +
      '• Find the real subject: "The list of products IS..." (the list, not the products).\n' +
      '• Each, every, everyone, the number of -> singular. A number of (= many) -> plural.\n' +
      '• Neither... nor / either... or -> the verb agrees with the closest subject.\n' +
      '• Words between commas ("with her two assistants") do not change the subject.\n' +
      '• Some words end in -s but are singular: news, mathematics.\n\n' +
      'TOEIC trick: cross out everything between the subject and the verb.',
  },
  wordForms: {
    find: 'the word',
    sentences: [
      { text: 'Sales increased [significantly] last quarter.', find: 'the adverb' },
      { text: 'Ms. Ford gave a [clear] answer.', find: 'the adjective' },
      { text: 'The [success] of the project surprised everyone.', find: 'the noun made from "succeed"' },
      { text: 'Please read the instructions [carefully].', find: 'the adverb' },
      { text: 'The staff were very [helpful].', find: 'the adjective' },
      { text: 'We need your [approval] before Monday.', find: 'the noun made from "approve"' },
      { text: 'The team worked [quickly].', find: 'the adverb' },
      { text: 'This is an [attractive] offer.', find: 'the adjective' },
      { text: 'The [decision] was made yesterday.', find: 'the noun made from "decide"' },
      { text: 'Our profits grew [steadily].', find: 'the adverb' },
      { text: 'The instructions were [confusing].', find: 'the adjective' },
      { text: 'Mr. Shah will [finalize] the plan.', find: 'the verb made from "final"' },
    ],
    explanation:
      'The same root has several forms: decide (verb), decision (noun), decisive (adjective), decisively (adverb).\n\n' +
      '• Noun: after the / a / your / an adjective -> "the success", "your approval".\n' +
      '• Adjective: before a noun, or after be / seem / become -> "a clear answer", "the staff were helpful".\n' +
      '• Adverb (often -ly): describes a verb, an adjective or another adverb -> "increased significantly".\n' +
      '• Verb: after a subject, or after will / can / must -> "will finalize".\n' +
      '• Endings help: -tion, -ment, -ness, -al = noun. -ful, -ive, -ous, -able = adjective. -ize, -ify = verb.\n\n' +
      'TOEIC trick: do not translate. Look at the word just before and just after the blank.',
  },
  verbTenses: {
    find: 'the verb',
    sentences: [
      { text: 'Ms. Wong [has worked] here since 2019.', find: 'the verb in the present perfect' },
      { text: 'We [shipped] your order yesterday.', find: 'the verb in the past simple' },
      { text: 'The team [is preparing] the slides right now.', find: 'the verb in the present continuous' },
      { text: 'The train [leaves] at 8 a.m. every day.', find: 'the verb in the present simple' },
      { text: 'By next year, we [will have opened] ten stores.', find: 'the verb in the future perfect' },
      { text: 'She [was talking] on the phone when I arrived.', find: 'the verb in the past continuous' },
      { text: 'The client [will call] you tomorrow.', find: 'the verb in the future' },
      { text: 'The meeting [had started] before Mr. Lin arrived.', find: 'the verb in the past perfect' },
      { text: 'If it rains, we [will cancel] the picnic.', find: 'the verb in the future' },
      { text: 'Prices [have risen] a lot this year.', find: 'the verb in the present perfect' },
      { text: 'Mr. Adams [visited] our factory last month.', find: 'the verb in the past simple' },
      {
        text: 'Our department [is moving] to the fifth floor next week.',
        find: 'the verb in the present continuous',
      },
    ],
    explanation:
      'The tense tells WHEN the action happens. The time words are your best friends!\n\n' +
      '• Present simple: habits, timetables (every day, at 8 a.m.) -> leaves.\n' +
      '• Present continuous: right now, or a planned future (next week) -> is preparing.\n' +
      '• Past simple: a finished time (yesterday, last month, in 2019) -> shipped.\n' +
      '• Present perfect: since, for, already, this year -> has worked.\n' +
      '• Past perfect: before another past action -> had started.\n' +
      '• Future: will + verb. Future perfect: by + a future date -> will have opened.\n' +
      '• If + present simple, then will: "If it rains, we will cancel."\n\n' +
      'TOEIC trick: underline the time words first. They tell you the tense.',
  },
  connectors: {
    find: 'the connector',
    sentences: [
      'The meeting was postponed [because] the CEO was sick.',
      '[However], the budget was not approved.',
      'We will start the project [as soon as] we receive the funds.',
      '[Although] it was raining, the event continued.',
      'Sales dropped; [therefore], we reduced costs.',
      'You can pay by card [or] in cash.',
      '[Despite] the rain, the event was a success.',
      'The hotel is small [but] very comfortable.',
      '[In addition], the room has free Wi-Fi.',
      'Please call us [if] you have any questions.',
      'The store will close early [so that] the staff can attend the party.',
      '[Unless] we hire more staff, the project will be late.',
    ],
    explanation:
      'A connector links 2 ideas and shows the logic between them.\n\n' +
      '• Cause: because (+ subject + verb), because of / due to (+ a noun).\n' +
      '• Contrast: but, however, although (+ subject + verb), despite (+ a noun).\n' +
      '• Addition: and, in addition, moreover.\n' +
      '• Consequence: so, therefore.\n' +
      '• Condition: if, unless (= if not).\n' +
      '• Time: as soon as, when, before. Goal: so that.\n\n' +
      'TOEIC trick: 1) find the logic between the 2 parts (cause? contrast?). 2) look at what comes after the blank: a noun, or a full sentence?',
  },
};

// A sentence of a lesson -> { text, find } (a plain text takes the "find" of its lesson).
export function sentenceOf(lesson, item) {
  if (typeof item === 'string') return { text: item, find: lesson.find };
  return item;
}

// SENTENCES_PER_LESSON sentences at random, not among `seen` (the ones of the previous round).
export function pickSentences(lesson, seen = []) {
  const fresh = lesson.sentences.filter((item) => !seen.includes(item));
  return shuffle(fresh).slice(0, SENTENCES_PER_LESSON);
}

// "She enjoys [reading] reports." -> the words, and if they are the one(s) to click:
// [{ word: 'She', target: false }, { word: 'enjoys', target: false }, { word: 'reading', target: true }, ...]
export function wordsOf(text) {
  const words = [];
  let inside = false; // between [ and ]
  for (const piece of text.split(' ')) {
    if (piece.startsWith('[')) inside = true;
    words.push({ word: piece.replace('[', '').replace(']', ''), target: inside });
    if (piece.includes(']')) inside = false;
  }
  return words;
}
