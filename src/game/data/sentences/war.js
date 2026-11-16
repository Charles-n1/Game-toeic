// Fill-in-the-blank war, truce, and frontier diplomacy sentences (ids 960001+).
// Used for mediating rival village skirmishes and tactical word encounters.

let nextId = 960001;

function sentence(category, question, answers, correctIndex, justification, difficulty = 'hard') {
  return {
    id: nextId++,
    section: 'rc10',
    difficulty: difficulty,
    category: category,
    text: null,
    question: question,
    answers: answers,
    correct_index: correctIndex,
    justification: justification,
  };
}

export const WAR_SENTENCES = [
  sentence(
    'connectors',
    'Both villages want peace; ___, neither elder wants to speak first.',
    ['therefore', 'nevertheless', 'because', 'moreover'],
    1,
    '"Nevertheless" introduces a contrast between wanting peace and refusing to speak first.'
  ),
  sentence(
    'vocabulary',
    'The two captains signed a ___ to halt fighting until winter ends.',
    ['truce', 'rumor', 'fence', 'cargo'],
    0,
    'A "truce" is a temporary agreement to stop fighting.'
  ),
  sentence(
    'prepositions',
    'The northern watchtower must be defended ___ all costs.',
    ['by', 'at', 'with', 'for'],
    1,
    '"At all costs" is the fixed expression meaning regardless of the difficulty.'
  ),
  sentence(
    'passive',
    'The broken palisade ___ by the village carpenters before nightfall.',
    ['will rebuild', 'will be rebuilt', 'rebuilding', 'has rebuilt'],
    1,
    'A palisade cannot rebuild itself; use the passive "will be rebuilt".'
  ),
  sentence(
    'verbTenses',
    'By the time reinforcements arrive, the guards ___ the gate for six hours.',
    ['defend', 'will have defended', 'defended', 'are defending'],
    1,
    '"By the time" + present tense points to an action completed before a future moment: future perfect.'
  ),
  sentence(
    'subjectVerb',
    'Neither the commander nor the scouts ___ aware of the ambush ahead.',
    ['was', 'were', 'is', 'has been'],
    1,
    'With "neither... nor", the verb agrees with the closer subject ("scouts" is plural -> "were").'
  ),
  sentence(
    'gerunds',
    'The merchant insisted on ___ an escort before crossing the valley.',
    ['hire', 'to hire', 'hiring', 'hired'],
    2,
    'After the preposition "on", use the -ing gerund form: "insisted on hiring".'
  ),
  sentence(
    'wordForms',
    'Thanks to the ___ of the mediator, the rival clans laid down their spears.',
    ['diplomacy', 'diplomatic', 'diplomat', 'diplomatically'],
    0,
    'After "the" and before "of", a noun referring to the skill/act is required: "diplomacy".'
  ),
  sentence(
    'comparatives',
    'Stone walls are far ___ than wooden stakes against orc battering rams.',
    ['durable', 'more durable', 'most durable', 'durably'],
    1,
    '"Than" signals a comparative form: "more durable".'
  ),
  sentence(
    'pronouns',
    'The villagers repaired the gate ___ before the warband returned.',
    ['them', 'theirs', 'themselves', 'their'],
    2,
    'Use the reflexive pronoun "themselves" for emphasis on who did the work.'
  ),
  sentence(
    'connectors',
    '___ the heavy storm, the caravan continued along the mountain road.',
    ['Although', 'Despite', 'Unless', 'Because'],
    1,
    '"Despite" is followed by a noun phrase ("the heavy storm"); "although" needs a clause.'
  ),
  sentence(
    'vocabulary',
    'Watchmen blew the brass horn to ___ the garrison at the southern gate.',
    ['alert', 'abandon', 'scatter', 'forget'],
    0,
    '"Alert" means to warn someone of danger.'
  ),
  sentence(
    'prepositions',
    'The border dispute resulted ___ years of mistrust between the two towns.',
    ['to', 'from', 'in', 'into'],
    2,
    '"Result in" introduces the consequence; "result from" introduces the cause.'
  ),
  sentence(
    'passive',
    'Peace talks ___ in the town hall as soon as both leaders arrive.',
    ['will hold', 'will be held', 'are holding', 'have held'],
    1,
    'Talks are organized by people, so the passive "will be held" is correct.'
  ),
  sentence(
    'verbTenses',
    'If the scouts had checked the ridge earlier, they ___ the bandits.',
    ['would spot', 'will spot', 'would have spotted', 'spotted'],
    2,
    'Third conditional (unreal past): "had checked" pairs with "would have spotted".'
  ),
  sentence(
    'subjectVerb',
    'Every captain and militia leader ___ ordered to inspect the turrets.',
    ['are', 'were', 'was', 'have been'],
    2,
    '"Every" makes the compound subject singular: "was ordered".'
  ),
  sentence(
    'gerunds',
    'The rival farmers finally agreed ___ the river water equally.',
    ['sharing', 'to share', 'share', 'shared'],
    1,
    'The verb "agree" takes a to-infinitive: "agreed to share".'
  ),
  sentence(
    'wordForms',
    'A ___ defense requires steady supplies as well as brave knights.',
    ['success', 'succeed', 'successful', 'successfully'],
    2,
    'Before the noun "defense", use the adjective "successful".'
  ),
  sentence(
    'comparatives',
    'The closer the warband came, the ___ the villagers fought to hold the breach.',
    ['fierce', 'fiercer', 'fiercest', 'more fiercely'],
    1,
    'Double comparative structure ("The + comparative..., the + comparative..."): "the fiercer".'
  ),
  sentence(
    'pronouns',
    'Anyone ___ wishes to cross the bridge must declare their cargo.',
    ['which', 'whom', 'who', 'whose'],
    2,
    '"Who" is the subject relative pronoun for people ("Anyone who wishes").'
  ),
  sentence(
    'vocabulary',
    'We must ___ our forces if we hope to liberate the fallen hamlet.',
    ['consolidate', 'hesitate', 'evaporate', 'imitate'],
    0,
    '"Consolidate" means to combine and strengthen forces.'
  ),
  sentence(
    'connectors',
    'Keep the torches lit ___ the sentries can spot raiders in the fog.',
    ['so that', 'in case of', 'despite', 'even though'],
    0,
    '"So that" expresses purpose before a clause ("so that the sentries can spot").'
  ),
  sentence(
    'prepositions',
    'The bandits were accused ___ robbing merchant wagons along the coast road.',
    ['for', 'with', 'of', 'about'],
    2,
    'The standard collocation is "accused of + -ing".'
  ),
  sentence(
    'wordForms',
    'The envoy spoke ___ enough to calm both angry crowds.',
    ['persuade', 'persuasive', 'persuasively', 'persuasion'],
    2,
    'Modify the verb "spoke" with the adverb "persuasively".'
  ),
  sentence(
    'verbTenses',
    'Since last autumn, goblin warbands ___ from the eastern marsh every week.',
    ['raid', 'raided', 'have been raiding', 'are raided'],
    2,
    '"Since last autumn" indicates an ongoing action up to the present: present perfect continuous.'
  ),
  sentence(
    'vocabulary',
    'After the chief fell, the surviving bandits lost morale and began to ___.',
    ['retreat', 'construct', 'harvest', 'celebrate'],
    0,
    '"Retreat" means to withdraw from battle.'
  ),
];
