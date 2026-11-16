// The sentences of the negotiations (the guild, the shops): business English, hard level, like the TOEIC.
// Each one has a hole: the right word makes the deal. They count in the stats of the app like the others.

let nextId = 900001;

function sentence(category, question, answers, correctIndex, justification) {
  return { id: nextId++, section: 'rc10', difficulty: 'hard', category: category, text: null, question: question, answers: answers, correct_index: correctIndex, justification: justification };
}

export const NEGOTIATION = [
  sentence('vocabulary', 'We are prepared to ___ the price by ten percent if you sign the contract today.', ['reduce', 'remove', 'refuse', 'repeat'], 0, 'To "reduce" a price = to make it lower. The other verbs do not fit a price.'),
  sentence('prepositions', 'The fee is negotiable, depending ___ the length of the mission.', ['of', 'on', 'from', 'at'], 1, '"Depending on" is the fixed expression.'),
  sentence('gerunds', 'She insisted on ___ half of the payment in advance.', ['receive', 'to receive', 'receiving', 'received'], 2, 'After a preposition ("on"), use the -ing form: insisted on receiving.'),
  sentence('connectors', 'The offer is generous; ___, we need more time to consider it.', ['therefore', 'however', 'because', 'unless'], 1, '"However" shows a contrast between the generous offer and the need for time.'),
  sentence('verbTenses', 'By the time the contract expires, we ___ for this company for five years.', ['work', 'will have worked', 'worked', 'are working'], 1, '"By the time" + a future moment: future perfect (will have worked).'),
  sentence('comparatives', 'Our terms are ___ than those of our competitors.', ['more flexible', 'most flexible', 'flexibler', 'as flexible'], 0, 'A comparison between two things: "more flexible than".'),
  sentence('passive', 'All payments ___ within thirty days of the invoice date.', ['must make', 'must be made', 'must making', 'must be make'], 1, 'Payments do not make themselves: passive "must be made".'),
  sentence('wordForms', 'Both parties reached an ___ after three hours of discussion.', ['agree', 'agreeable', 'agreement', 'agreeably'], 2, 'After "an", a noun is needed: agreement.'),
  sentence('subjectVerb', 'Neither the merchant nor his assistants ___ willing to lower the price.', ['is', 'are', 'was', 'be'], 1, 'With "neither... nor", the verb agrees with the closer subject: "assistants are".'),
  sentence('pronouns', 'If the terms suit you, please sign the contract and return ___ to us.', ['them', 'it', 'its', 'him'], 1, '"It" replaces "the contract" (singular, a thing).'),
  sentence('vocabulary', 'The guild requires a ___ before any adventurer starts a mission.', ['deposit', 'deposition', 'depositor', 'depot'], 0, 'A "deposit" = money paid first, as a guarantee.'),
  sentence('prepositions', 'We cannot agree ___ your conditions unless the price changes.', ['to', 'with', 'on', 'at'], 0, 'One agrees TO conditions (and WITH a person).'),
  sentence('gerunds', 'He agreed ___ the contract only after a long discussion.', ['signing', 'to sign', 'sign', 'signed'], 1, '"Agree" is followed by the infinitive: agreed to sign.'),
  sentence('connectors', 'You will receive the full payment ___ the mission is completed.', ['as soon as', 'despite', 'whereas', 'in spite'], 0, '"As soon as" introduces the moment when something happens.'),
  sentence('verbTenses', 'If you had accepted our first offer, you ___ less money.', ['would spend', 'would have spent', 'will spend', 'spent'], 1, 'Third conditional (an unreal past): had accepted... would have spent.'),
  sentence('comparatives', 'This is by far the ___ offer we have received this year.', ['good', 'better', 'best', 'well'], 2, '"By far the" + superlative: the best.'),
  sentence('passive', 'The final decision ___ until the guild master returns.', ['has postponed', 'has been postponed', 'postponed', 'is postponing'], 1, 'The decision is postponed by someone: passive "has been postponed".'),
  sentence('wordForms', 'Her ___ during the talks impressed everyone at the table.', ['persuade', 'persuasive', 'persuasiveness', 'persuasively'], 2, 'After "her", a noun: persuasiveness.'),
  sentence('subjectVerb', 'Each of the proposals ___ carefully reviewed by the council.', ['were', 'was', 'are', 'have been'], 1, '"Each of" takes a singular verb: each... was.'),
  sentence('pronouns', 'The adventurers who joined the guild were asked to bring ___ own weapons.', ['their', 'there', 'they', 'theirs'], 0, 'The possessive adjective before a noun: their own weapons.'),
  sentence('vocabulary', 'The two sides finally reached a ___: each one gave up a little.', ['compromise', 'competition', 'complaint', 'complement'], 0, 'A "compromise" = an agreement where each side accepts less.'),
  sentence('prepositions', 'The price includes everything, ___ the cost of the potions.', ['except', 'excepting of', 'apart', 'beside of'], 0, '"Except" = without, but not including.'),
  sentence('gerunds', 'We look forward to ___ with you on future missions.', ['work', 'working', 'have worked', 'be working'], 1, '"Look forward to" ends with the preposition "to": + -ing.'),
  sentence('connectors', '___ the risks of the mission, the fee seems quite reasonable.', ['Given', 'Although', 'Unless', 'So that'], 0, '"Given" + noun = considering this fact.'),
  sentence('verbTenses', 'The merchant ___ his prices since the beginning of the war.', ['raises', 'has been raising', 'raised', 'is raised'], 1, '"Since" + an action that continues until now: present perfect continuous.'),
  sentence('comparatives', 'The longer the mission lasts, the ___ the payment will be.', ['high', 'higher', 'highest', 'more high'], 1, 'The double comparative: "the longer..., the higher...".'),
  sentence('passive', 'A discount will ___ to every member of the guild.', ['offer', 'be offered', 'offering', 'have offer'], 1, 'The discount is given by someone: passive "be offered".'),
  sentence('wordForms', 'The terms of this contract are not ___: they cannot be changed.', ['negotiate', 'negotiation', 'negotiable', 'negotiator'], 2, 'After "are not", an adjective: negotiable.'),
  sentence('subjectVerb', 'The number of adventurers looking for work ___ increased this month.', ['have', 'has', 'are', 'were'], 1, '"The number of" is singular: has increased.'),
  sentence('vocabulary', 'Please let us know if the proposed schedule is ___ for you.', ['convenient', 'convinced', 'conventional', 'convened'], 0, '"Convenient" = suitable, easy for you.'),
];
