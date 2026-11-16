// Contextual farming and planting texts for workField (see logic/farm.js).
// Same format as data/negotiation.js: answers count in the app's TOEIC stats.
// Unique id range for camp: 940001+.

let nextId = 940001;

function sentence(category, question, answers, correctIndex, justification) {
  return {
    id: nextId++,
    section: 'rc10',
    difficulty: 'normal',
    category: category,
    text: null,
    question: question,
    answers: answers,
    correct_index: correctIndex,
    justification: justification,
  };
}

export const CAMP_SENTENCES = [
  sentence(
    'vocabulary',
    'Before sowing wheat, the farmer loosens the earth with a spade. Rich, moist ___ helps young roots spread quickly.',
    ['soil', 'smoke', 'brick', 'frost'],
    0,
    '"Soil" is the earth in which plants and crops grow.'
  ),
  sentence(
    'prepositions',
    'Early in the morning, Hana walks along the rows of young carrots. She pours cool water gently ___ the roots.',
    ['onto', 'during', 'between', 'without'],
    0,
    '"Pour onto" expresses directing liquid down onto a surface or roots.'
  ),
  sentence(
    'gerunds',
    'Warm sunlight dries the field too fast at noon. Experienced farmers avoid ___ delicate seeds in the middle of the afternoon.',
    ['plant', 'to plant', 'planting', 'planted'],
    2,
    'The verb "avoid" is always followed by a gerund (-ing): avoid planting.'
  ),
  sentence(
    'verbTenses',
    'Rain fell steadily across the valley all night long. By sunrise, the wheat sprouts ___ visibly taller.',
    ['had grown', 'grows', 'will growing', 'have grew'],
    0,
    'An action completed before a past moment ("By sunrise", after "fell") takes the past perfect: had grown.'
  ),
  sentence(
    'subjectVerb',
    'A basket of fresh herbs and newly dug carrots sits beside the fence. Each of the seeds ___ careful tending to sprout.',
    ['need', 'needs', 'needing', 'are needing'],
    1,
    '"Each of + plural noun" takes a singular verb: Each of the seeds needs.'
  ),
  sentence(
    'passive',
    'Once the golden wheat is cut and bundled, it cannot stay outside in the rain. The harvest must ___ in a dry barn.',
    ['store', 'storing', 'be stored', 'be storing'],
    2,
    'The harvest does not store itself; modal passive requires "must be + past participle": must be stored.'
  ),
  sentence(
    'wordForms',
    'Mixing crushed leaves into the earth improves the next harvest. Proper ___ turns poor dirt into a thriving garden.',
    ['fertilize', 'fertile', 'fertilization', 'fertilized'],
    2,
    'After the adjective "Proper" as the subject of "turns", a noun is needed: fertilization.'
  ),
  sentence(
    'comparatives',
    'The southern plot gets twice as much morning sun as the shaded corner. Seeds planted there sprout ___ than those near the wall.',
    ['quick', 'more quickly', 'most quickly', 'quickest'],
    1,
    'Modifying the verb "sprout" in a comparison with "than" requires the comparative adverb: more quickly.'
  ),
  sentence(
    'connectors',
    'The spring frost lingered well into the second week of the season. ___, the farmers waited a few days before planting the herbs.',
    ['Therefore', 'Although', 'Unless', 'Despite'],
    0,
    '"Therefore" introduces a logical result following the lingering frost.'
  ),
  sentence(
    'pronouns',
    'Hana checks the irrigation trench every evening before dusk. When a stone blocks the channel, she clears ___ away by hand.',
    ['they', 'them', 'it', 'its'],
    2,
    '"It" refers back to the singular noun "a stone".'
  ),
  sentence(
    'vocabulary',
    'Wild weeds steal sunlight and water from young crops. You should ___ the bed before dropping any seeds into the furrow.',
    ['weed', 'rust', 'melt', 'freeze'],
    0,
    'To "weed" a garden bed means to remove unwanted wild plants before planting.'
  ),
  sentence(
    'prepositions',
    'After clearing the stones, press the wheat seeds gently into the row. Cover them lightly ___ fine earth so birds do not eat them.',
    ['with', 'for', 'into', 'since'],
    0,
    'The standard collocation is "cover (something) with (something)".'
  ),
  sentence(
    'gerunds',
    'The soil near the river is dark and soft. It is worth ___ extra care to space each flower seed evenly.',
    ['take', 'taking', 'to taking', 'took'],
    1,
    'The expression "It is worth" is followed by a gerund (-ing): worth taking.'
  ),
  sentence(
    'verbTenses',
    'Look at the dark clouds gathering behind the hills. If it rains tonight, we ___ to carry water from the well tomorrow.',
    ['will not need', 'did not needed', 'not needing', 'had not need'],
    0,
    'A real future condition ("If it rains tonight") pairs with "will + base verb": will not need.'
  ),
  sentence(
    'subjectVerb',
    'Both the wheat field and the small herb garden face the morning sun. Neither the wind nor the crows ___ the buried seeds today.',
    ['disturb', 'disturbs', 'disturbing', 'is disturbing'],
    0,
    'With "neither... nor", the verb agrees with the nearer subject "the crows" (plural): disturb.'
  ),
  sentence(
    'passive',
    'Golden wheat ripples across the hills of Eldermoor in late summer. The first loaves of warm bread ___ from this very field.',
    ['will bake', 'will be baked', 'are baking', 'have baked'],
    1,
    'Bread is baked by bakers; future passive is "will be baked".'
  ),
  sentence(
    'wordForms',
    'Bees hum quietly among the bright blossoms along the path. Their steady presence is ___ for pollinating the garden.',
    ['essence', 'essential', 'essentially', 'essentials'],
    1,
    'After the linking verb "is", an adjective is required: essential.'
  ),
  sentence(
    'comparatives',
    'Compost made from autumn leaves holds moisture well. This dark earth is far ___ for growing carrots than dry gravel.',
    ['better', 'good', 'best', 'well'],
    0,
    'Comparing two things with "than" requires the irregular comparative adjective: better.'
  ),
  sentence(
    'connectors',
    'Dry winds can blow light seeds away before they take root. Press the soil down firmly ___ the seeds stay safely underground.',
    ['so that', 'because of', 'even though', 'instead of'],
    0,
    '"So that" introduces a clause of purpose explaining why you press the soil down.'
  ),
  sentence(
    'pronouns',
    'Travelers often pause to admire the neatly tended fields outside the village. Many ask the farmer ___ secret behind such tall wheat.',
    ['her', 'hers', 'she', 'herself'],
    0,
    'A possessive determiner is required before the noun "secret": her secret.'
  ),
  sentence(
    'vocabulary',
    'Healthy crops depend on patient daily care. Once the green shoots ___ through the crust, keep the birds away.',
    ['sprout', 'sink', 'fade', 'shatter'],
    0,
    'To "sprout" means to begin to grow and push shoots up out of the earth.'
  ),
  sentence(
    'prepositions',
    "Planting too close together leaves little room for roots to expand. Keep at least a hand's width ___ each carrot seed.",
    ['between', 'amongst of', 'under', 'across'],
    0,
    '"Between" indicates the spacing separating one seed from the next.'
  ),
  sentence(
    'gerunds',
    'Sharp frost can ruin tender stems overnight. Covering the beds with straw prevents the cold air from ___ the seedlings.',
    ['harm', 'harming', 'to harm', 'harmed'],
    1,
    'After the preposition "from" ("prevent ... from"), use the gerund (-ing): harming.'
  ),
  sentence(
    'verbTenses',
    'For decades, the farmers of Greendale have rotated carrots and wheat every season. They ___ this simple method since the village was founded.',
    ['have used', 'are using', 'will use', 'used to'],
    0,
    '"Since + past starting point" requires the present perfect: have used.'
  ),
];
