// Contextual TOEIC fill-in-the-blank sentences for village society:
// trading negotiations, hospital persuasion, freeing slaves, downtown enigmas, and statue/totem trials.
// IDs start at 920001+. Every category matches src/data/categories.js.

let nextId = 920001;

function sentence(topic, difficulty, category, question, answers, correctIndex, justification) {
  return {
    id: nextId++,
    section: 'rc10',
    difficulty: difficulty,
    category: category,
    topic: topic,
    text: null,
    question: question,
    answers: answers,
    correct_index: correctIndex,
    justification: justification,
  };
}

export const SOCIETY_SENTENCES = [
  // ---------- Village Trade & Market Bargaining ('trade') ----------
  sentence('trade', 'normal', 'vocabulary', 'If you buy three sacks of wheat, the merchant will ___ a discount.', ['offer', 'afford', 'refer', 'suffer'], 0, 'You "offer" a discount to a buyer. "Afford" means having enough money to pay.'),
  sentence('trade', 'normal', 'prepositions', 'All fresh fruit from the farm is sold ___ a reasonable price.', ['at', 'on', 'into', 'by'], 0, 'Prices use the preposition "at": sold at a reasonable price.'),
  sentence('trade', 'normal', 'comparatives', 'This silver brooch is much ___ than the wooden ring.', ['valuable', 'more valuable', 'most valuable', 'valuably'], 1, 'Comparing two items requires "more + long adjective + than".'),
  sentence('trade', 'normal', 'gerunds', 'The baker avoided ___ the price until the harvest finished.', ['raise', 'to raise', 'raising', 'raised'], 2, '"Avoid" is always followed by a gerund (-ing): avoided raising.'),
  sentence('trade', 'hard', 'connectors', 'The rare spice costs more; ___, its aroma lasts for months.', ['nevertheless', 'unless', 'because', 'therefore'], 0, '"Nevertheless" introduces a contrast between the high cost and the lasting value.'),
  sentence('trade', 'hard', 'passive', 'Only goods of the highest quality ___ at the capital market.', ['sell', 'are sold', 'have sold', 'selling'], 1, 'Goods do not sell themselves: passive voice "are sold".'),
  sentence('trade', 'hard', 'wordForms', 'Fair trade depends on mutual trust and honest ___.', ['negotiate', 'negotiable', 'negotiation', 'negotiated'], 2, 'After the adjective "honest", a noun is needed: negotiation.'),
  sentence('trade', 'normal', 'subjectVerb', 'Every crate of spices ___ inspected before entering the square.', ['are', 'were', 'is', 'have'], 2, '"Every" + singular noun always takes a singular verb: is inspected.'),
  sentence('trade', 'hard', 'verbTenses', 'By the time the caravan arrives, we ___ all the wool.', ['sell', 'will have sold', 'sold', 'are selling'], 1, '"By the time" + present tense points to completion in the future: will have sold.'),
  sentence('trade', 'normal', 'pronouns', 'The farmers brought ___ finest carrots to sell at the fair.', ['their', 'they', 'theirs', 'them'], 0, 'Before a noun phrase ("finest carrots"), use the possessive determiner "their".'),

  // ---------- Hospital & Clinic Persuasion ('clinic') ----------
  sentence('clinic', 'normal', 'vocabulary', 'The clinic nurse asked me to rest until I ___ my full strength.', ['recover', 'discover', 'uncover', 'cover'], 0, 'To "recover" strength or health means to get better after illness or exhaustion.'),
  sentence('clinic', 'normal', 'prepositions', 'You will feel much better ___ a full day of quiet rest.', ['after', 'between', 'among', 'until'], 0, '"After" indicates following a period of time: after a full day of rest.'),
  sentence('clinic', 'normal', 'gerunds', 'The healer recommended ___ plenty of clean water and broth.', ['drink', 'to drink', 'drinking', 'drank'], 2, '"Recommend" takes a gerund (-ing) when there is no indirect object: recommended drinking.'),
  sentence('clinic', 'normal', 'wordForms', 'Her gentle smile and ___ words put every patient at ease.', ['encourage', 'encouraging', 'encouragement', 'encouragingly'], 1, 'Before the noun "words", we need a participial adjective: encouraging.'),
  sentence('clinic', 'hard', 'verbTenses', 'If you had come to the clinic earlier, the fever ___ already.', ['would fade', 'would have faded', 'will fade', 'faded'], 1, 'Third conditional for an unreal past: "had come... would have faded".'),
  sentence('clinic', 'hard', 'connectors', '___ the clinic is usually expensive, the nurse might waive the fee.', ['Despite', 'Although', 'Because of', 'Unless'], 1, '"Although" introduces a full clause (subject + verb) expressing contrast.'),
  sentence('clinic', 'normal', 'pronouns', 'Please thank the nurse; ___ cared for the whole party all night.', ['she', 'her', 'hers', 'herself'], 0, 'As the subject of the verb "cared", use the subject pronoun "she".'),
  sentence('clinic', 'hard', 'passive', 'Herbal bandages ___ twice a day to prevent infection.', ['must apply', 'must be applied', 'must applying', 'have applied'], 1, 'Bandages receive the action: passive modal "must be applied".'),
  sentence('clinic', 'normal', 'comparatives', 'Warm herb stew is far ___ for recovery than cold dry bread.', ['good', 'better', 'best', 'well'], 1, 'With "than", use the irregular comparative of good: "better".'),
  sentence('clinic', 'hard', 'subjectVerb', 'Neither the potions nor the salve ___ enough without real sleep.', ['is', 'are', 'were', 'be'], 0, 'With "neither... nor", the verb agrees with the nearer subject "the salve" (singular): is.'),

  // ---------- Slave Traders & Freedom ('slaves') ----------
  sentence('slaves', 'normal', 'vocabulary', 'No citizen of a free kingdom should ever be held in ___.', ['captivity', 'capacity', 'activity', 'clarity'], 0, '"Captivity" means being kept as a prisoner or slave.'),
  sentence('slaves', 'hard', 'passive', 'Every captive in the iron cage deserves ___ immediately.', ['to free', 'to be freed', 'freeing to', 'been freed'], 1, 'The captive receives the action of freeing: passive infinitive "to be freed".'),
  sentence('slaves', 'normal', 'prepositions', 'The hero refused to bargain ___ cruelty and unlocked the chains.', ['for', 'with', 'at', 'into'], 1, 'You bargain "with" a person or abstract force ("with cruelty").'),
  sentence('slaves', 'hard', 'connectors', 'You may release the prisoner peacefully; ___, I will break the lock myself.', ['otherwise', 'moreover', 'similarly', 'hence'], 0, '"Otherwise" means "or else", showing the consequence of refusing.'),
  sentence('slaves', 'hard', 'verbTenses', 'The captives ___ inside that narrow cage since dawn.', ['wait', 'have been waiting', 'were wait', 'will waiting'], 1, '"Since dawn" up to the present takes the present perfect continuous: have been waiting.'),
  sentence('slaves', 'normal', 'pronouns', 'Once the door opened, the prisoners gathered ___ belongings and cheered.', ['their', 'its', 'his', 'theirs'], 0, 'Plural subject "the prisoners" takes the plural possessive determiner "their".'),
  sentence('slaves', 'hard', 'wordForms', 'The townspeople praised the hero for his ___ in freeing the captives.', ['brave', 'bravely', 'bravery', 'braver'], 2, 'After "his", a noun is required: bravery.'),
  sentence('slaves', 'hard', 'gerunds', 'Instead of ___ for gold, the trader agreed to a duel of words.', ['fight', 'fighting', 'to fight', 'fought'], 1, 'After the preposition "instead of", use the gerund (-ing): fighting.'),
  sentence('slaves', 'normal', 'subjectVerb', 'Justice and mercy ___ stronger than iron bars.', ['is', 'are', 'was', 'be'], 1, 'Two subjects joined by "and" take a plural verb: are.'),
  sentence('slaves', 'hard', 'comparatives', 'Freedom is ___ precious than any pouch of silver coins.', ['more', 'most', 'much', 'very'], 0, '"Precious" uses "more ... than" in the comparative form.'),

  // ---------- Downtown Word Games & Enigmas ('enigma') ----------
  sentence('enigma', 'normal', 'vocabulary', 'Only a sharp mind can ___ the riddle hidden in these three lines.', ['solve', 'dissolve', 'revolve', 'involve'], 0, 'You "solve" a riddle or puzzle by finding its answer.'),
  sentence('enigma', 'normal', 'prepositions', 'A clever player pays close attention ___ every single clue.', ['for', 'to', 'at', 'on'], 1, '"Pay attention" is always followed by the preposition "to".'),
  sentence('enigma', 'hard', 'wordForms', 'The crowd applauded the ___ of the traveler who answered in two seconds.', ['clever', 'cleverly', 'cleverness', 'cleverer'], 2, 'After "the", a noun is needed: cleverness.'),
  sentence('enigma', 'hard', 'verbTenses', 'Look at the wheel: it ___ faster and faster right before it stops.', ['spins', 'is spinning', 'has spun', 'spun'], 1, '"Look!" signals an action happening right now: present continuous "is spinning".'),
  sentence('enigma', 'normal', 'connectors', 'The first riddle was easy, ___ the final enigma stumped the whole square.', ['whereas', 'therefore', 'so that', 'because'], 0, '"Whereas" contrasts two opposite situations (easy vs. stumped).'),
  sentence('enigma', 'hard', 'gerunds', 'She won the grand prize by ___ the hidden pattern in the rhyme.', ['spot', 'spotted', 'spotting', 'to spot'], 2, 'After the preposition "by", use the -ing form: by spotting.'),
  sentence('enigma', 'normal', 'pronouns', 'Whoever solves this puzzle may keep the silver prize for ___.', ['himself', 'him', 'his', 'he'], 0, 'Reflexive pronoun referring back to the subject "whoever": for himself.'),
  sentence('enigma', 'hard', 'subjectVerb', 'A collection of ancient riddles ___ displayed on the game stall.', ['are', 'is', 'were', 'have'], 1, 'The head noun of the subject is singular ("A collection"), so use singular "is".'),
  sentence('enigma', 'hard', 'comparatives', 'The ___ you think, the clearer the hidden word becomes.', ['careful', 'more carefully', 'most carefully', 'carefully'], 1, 'Double comparative with an adverb modifying "think": "The more carefully you think...".'),
  sentence('enigma', 'hard', 'passive', 'The winning answer ___ aloud so everyone in the square can hear it.', ['must speak', 'must be spoken', 'is speaking', 'must spoke'], 1, 'An answer is spoken by someone: passive "must be spoken".'),

  // ---------- Sacred Statues & Wild Grey Totems ('statue') ----------
  sentence('statue', 'hard', 'vocabulary', 'Carved centuries ago, the grey totem still radiates a quiet ___.', ['serenity', 'severity', 'sincerity', 'scarcity'], 0, '"Serenity" means deep, peaceful calm.'),
  sentence('statue', 'hard', 'verbTenses', 'For hundreds of winters, this stone statue ___ over the village.', ['watches', 'has been watching', 'was watching', 'watch'], 1, '"For hundreds of winters" continuing until now calls for present perfect continuous: has been watching.'),
  sentence('statue', 'extreme', 'connectors', '___ the storm rages around the mountain, the ancient totem stands unmoved.', ['Even though', 'Despite', 'In case', 'Provided'], 0, '"Even though" + full clause ("the storm rages") expresses strong concession.'),
  sentence('statue', 'hard', 'passive', 'Only travelers who speak with true precision ___ by the statue.', ['bless', 'are blessed', 'have blessed', 'blessing'], 1, 'Travelers receive the blessing: passive "are blessed".'),
  sentence('statue', 'hard', 'prepositions', 'Pilgrims kneel ___ respect before the silent stone figure.', ['in', 'on', 'at', 'by'], 0, '"In respect" (or "out of respect") is the idiomatic prepositional phrase.'),
  sentence('statue', 'extreme', 'subjectVerb', 'Neither time nor bitter wind ___ worn away the carved runes.', ['has', 'have', 'were', 'are'], 0, 'With "neither... nor" and two singular nouns ("time", "wind"), use the singular verb "has".'),
  sentence('statue', 'hard', 'wordForms', 'The inscriptions reveal the ___ of the scholars who built this shrine.', ['wise', 'wisely', 'wisdom', 'wiser'], 2, 'After "the", a noun is needed: wisdom.'),
  sentence('statue', 'hard', 'gerunds', 'After ___ a silent prayer, the hero felt new strength flow within.', ['whisper', 'whispered', 'whispering', 'to whisper'], 2, 'After the preposition "after", use the gerund: after whispering.'),
  sentence('statue', 'extreme', 'comparatives', 'Of all the shrines on the island, this wild totem is by far the ___.', ['old', 'older', 'oldest', 'more old'], 2, '"Of all..." + "by far the" always requires the superlative form: the oldest.'),
  sentence('statue', 'hard', 'pronouns', 'The blessing belongs to those ___ words never waver in battle.', ['who', 'whom', 'whose', 'which'], 2, '"Whose" is the possessive relative pronoun before the noun "words".'),
];

// Returns sentences matching a society topic ('trade', 'clinic', 'slaves', 'enigma', 'statue'),
// falling back to all SOCIETY_SENTENCES if needed.
export function societySentencesFor(topic) {
  const subset = SOCIETY_SENTENCES.filter((item) => item.topic === topic);
  return subset.length >= 6 ? subset : SOCIETY_SENTENCES;
}
