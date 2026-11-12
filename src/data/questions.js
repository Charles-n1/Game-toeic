// Our "database" (hardcoded for now).
import { MORE_RC10, MORE_RC8, MORE_TEXT } from './moreQuestions';

let nextId = 1;

// The "mold" every question is made from.
// section: 'rc10' | 'rc8' | 'text'   (see sections.js)
// difficulty: 'normal' | 'hard' | 'extreme'
// category: the grammar point (see categories.js), like 'prepositions'
// text: the passage to read (only for 'rc8' and 'text', null otherwise)
function createQuestion({ section, difficulty, category, text = null, question, answers, correct_index, justification }) {
  return {
    id: nextId++,
    section: section,
    difficulty: difficulty,
    category: category,
    text: text,
    question: question,
    answers: answers,             // always 4 answers
    correct_index: correct_index, // position of the good answer (0 to 3)
    justification: justification,
    retrieve: false,              // true = the user failed it, must review it
    retrieve_time: 0,             // how many times it was reviewed successfully
    retrieve_date: null,          // the day it must be reviewed
  };
}

// ---------- RC 10: incomplete sentences ----------

const RC10 = [
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'gerunds',
    question: "The manager asked all employees to ___ the report before Friday.",
    answers: ["submit", "submitting", "submitted", "submits"],
    correct_index: 0,
    justification: "After \"to\" (asked someone to...), use the base form of the verb: submit.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'prepositions',
    question: "Ms. Tanaka has worked at the company ___ 2015.",
    answers: ["for", "since", "during", "from"],
    correct_index: 1,
    justification: "\"Since\" + a starting point (2015). \"For\" + a duration (for 10 years).",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'comparatives',
    question: "The new software is ___ easier to use than the old one.",
    answers: ["very", "most", "much", "more"],
    correct_index: 2,
    justification: "Before a comparative (easier), use \"much\" or \"far\", never \"very\".",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'prepositions',
    question: "Please send the signed documents ___ email.",
    answers: ["with", "on", "in", "by"],
    correct_index: 3,
    justification: "To say how something is sent, use \"by\": by email, by phone, by mail.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'connectors',
    question: "Neither the director ___ the assistant attended the meeting.",
    answers: ["nor", "or", "and", "but"],
    correct_index: 0,
    justification: "\"Neither\" always goes with \"nor\". \"Either\" goes with \"or\".",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'verbTenses',
    question: "If the shipment ___ late, we will contact the customer.",
    answers: ["will arrive", "arrives", "arrived", "arriving"],
    correct_index: 1,
    justification: "First conditional: if + present simple, then will + verb.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'passive',
    question: "The conference room is ___ for the whole afternoon.",
    answers: ["book", "books", "booked", "booking"],
    correct_index: 2,
    justification: "Passive voice: be + past participle. The room does not book itself, someone booked it.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'comparatives',
    question: "Applicants must submit their resumes no later ___ May 1.",
    answers: ["then", "that", "to", "than"],
    correct_index: 3,
    justification: "\"No later than\" is a fixed expression meaning \"on or before this date\".",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'wordForms',
    question: "Our sales increased ___ in the last quarter.",
    answers: ["significantly", "significant", "significance", "signify"],
    correct_index: 0,
    justification: "We describe a verb (increased), so we need an adverb: significantly.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'connectors',
    question: "The meeting was postponed ___ the CEO was sick.",
    answers: ["because of", "because", "due", "despite"],
    correct_index: 1,
    justification: "\"Because\" + subject + verb (the CEO was sick). \"Because of\" + a noun (because of the illness).",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'subjectVerb',
    question: "Each of the employees ___ a parking badge.",
    answers: ["receive", "have received", "receives", "receiving"],
    correct_index: 2,
    justification: "\"Each\" is singular, so the verb is singular: receives.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'gerunds',
    question: "We look forward to ___ from you soon.",
    answers: ["hear", "heard", "be hearing", "hearing"],
    correct_index: 3,
    justification: "In \"look forward to\", \"to\" is a preposition, so it is followed by -ing: hearing.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'extreme',
    category: 'verbTenses',
    question: "Had the board ___ the proposal earlier, the project would have been finished on time.",
    answers: ["approved", "approve", "approving", "been approved"],
    correct_index: 0,
    justification: "\"Had + subject + past participle\" = \"If the board had approved\". It is a third conditional without \"if\".",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'extreme',
    category: 'vocabulary',
    question: "The new policy applies to all staff, ___ of their position.",
    answers: ["regarding", "regardless", "regard", "regarded"],
    correct_index: 1,
    justification: "\"Regardless of\" = no matter what. \"Regarding\" means \"about\", which makes no sense here.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'extreme',
    category: 'connectors',
    question: "Not only ___ the deadline, but they also went over the budget.",
    answers: ["they missed", "they did miss", "did they miss", "missed they"],
    correct_index: 2,
    justification: "After \"Not only\" at the start of a sentence, invert like a question: did they miss.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'pronouns',
    question: "Ms. Lee asked the interns to introduce ___ at the start of the meeting.",
    answers: ["them", "themselves", "their", "theirs"],
    correct_index: 1,
    justification: "The interns introduce the interns: same people -> reflexive pronoun \"themselves\".",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'pronouns',
    question: "These documents are not mine, they are ___.",
    answers: ["her", "she", "herself", "hers"],
    correct_index: 3,
    justification: "\"Hers\" = \"her documents\". A possessive pronoun replaces the noun, like \"mine\".",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'vocabulary',
    question: "Please ___ the attached form and return it by Friday.",
    answers: ["complete", "achieve", "perform", "succeed"],
    correct_index: 0,
    justification: "We say \"complete a form\" (= fill it in). \"Achieve\" is for a goal, \"perform\" for a task.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'passive',
    question: "The new branch ___ next month by the CEO.",
    answers: ["will open", "will be opened", "opens", "is opening"],
    correct_index: 1,
    justification: "\"By the CEO\" = someone does the action to the branch -> passive: will be + past participle.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'subjectVerb',
    question: "The number of applicants ___ increased this year.",
    answers: ["have", "are", "has", "were"],
    correct_index: 2,
    justification: "\"The number of\" is singular -> \"has\". But \"A number of applicants\" is plural -> \"have\".",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'wordForms',
    question: "The results will be announced at the ___ quarterly review.",
    answers: ["final", "finalize", "finally", "finality"],
    correct_index: 0,
    justification: "Between \"the\" and a noun (review) we need an adjective: the final review.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'pronouns',
    question: "Please return ___ library books before the end of the month.",
    answers: ["your", "you", "yours", "yourself"],
    correct_index: 0,
    justification: "Before a noun (library books) we need a possessive adjective: your. \"Yours\" replaces the noun, it can't come before it.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'vocabulary',
    question: "Ms. Okafor ___ a copy of the updated floor plan from the architect.",
    answers: ["informed", "told", "requested", "notified"],
    correct_index: 2,
    justification: "\"Request something\" = ask for it. Inform / tell / notify need a person as object (inform someone).",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'vocabulary',
    question: "The manager asked everyone to set ___ an hour on Friday for the training.",
    answers: ["along", "aside", "ahead", "among"],
    correct_index: 1,
    justification: "\"Set aside time\" = keep it free for a special purpose.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'vocabulary',
    question: "The city council ___ a new director for the public library on Monday.",
    answers: ["admitted", "appointed", "achieved", "attended"],
    correct_index: 1,
    justification: "Appoint someone = choose them officially for a job.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'wordForms',
    question: "All visitors must show a valid form of ___ at the entrance.",
    answers: ["identify", "identification", "identifying", "identified"],
    correct_index: 1,
    justification: "After \"a form of\" we need a noun: identification.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'connectors',
    question: "Bring an umbrella ___ it rains during the outdoor ceremony.",
    answers: ["in case", "as long as", "so as", "in order"],
    correct_index: 0,
    justification: "\"In case\" + clause = as a precaution, if that happens.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'wordForms',
    question: "The finance team prepared a ___ budget for next year.",
    answers: ["detailed", "details", "detail", "detailing"],
    correct_index: 0,
    justification: "Before a noun (budget) we need an adjective: a detailed budget.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'vocabulary',
    question: "Managers should give employees ___ deadlines that they can actually meet.",
    answers: ["generous", "wealthy", "curious", "achievable"],
    correct_index: 3,
    justification: "Achievable = possible to reach. That's what \"they can actually meet\" means.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'wordForms',
    question: "Mr. Dubois was pleased to receive ___ of his promotion by e-mail.",
    answers: ["confirmation", "confirm", "confirming", "confirms"],
    correct_index: 0,
    justification: "\"Receive\" needs a noun as object: receive confirmation.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'prepositions',
    question: "Employees with more than two years of service are entitled ___ an extra day of vacation.",
    answers: ["to", "over", "in", "at"],
    correct_index: 0,
    justification: "Fixed expression: be entitled to something (= have the right to it).",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'wordForms',
    question: "Please handle the glass display cases ___ when moving them.",
    answers: ["carefully", "careful", "care", "carefulness"],
    correct_index: 0,
    justification: "We describe a verb (handle), so we need an adverb: carefully.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'connectors',
    question: "The new software will be installed ___ the old system has been backed up.",
    answers: ["that", "once", "then", "as well"],
    correct_index: 1,
    justification: "\"Once\" + clause = as soon as / after.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'wordForms',
    question: "The ___ schedule will be posted on the staff bulletin board.",
    answers: ["revise", "revised", "revision", "revises"],
    correct_index: 1,
    justification: "Past participle used as an adjective: the revised schedule (= the schedule that someone changed).",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'vocabulary',
    question: "The elevator in Building C is ___ out of service while a technician replaces a cable.",
    answers: ["temporarily", "yearly", "whenever", "anytime"],
    correct_index: 0,
    justification: "Only for a short time (while the cable is replaced): temporarily.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'pronouns',
    question: "Ms. Kato and Mr. Ruiz applied for the manager position, and ___ were invited to an interview.",
    answers: ["either", "both", "each other", "everyone"],
    correct_index: 1,
    justification: "Exactly two people + a plural verb (were): both. \"Either\" takes a singular verb.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'vocabulary',
    question: "Good ___ between departments helps projects finish on time.",
    answers: ["duration", "decoration", "donation", "coordination"],
    correct_index: 3,
    justification: "Coordination = organizing people so they work well together.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'passive',
    question: "All of the conference rooms were ___ last weekend.",
    answers: ["clean", "cleaned", "cleaning", "cleans"],
    correct_index: 1,
    justification: "Passive voice: were + past participle. Rooms don't clean themselves, someone cleaned them.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'connectors',
    question: "___ the heavy rain, the outdoor concert started on time.",
    answers: ["Unless", "Although", "Because", "Despite"],
    correct_index: 3,
    justification: "Contrast + noun (the heavy rain): despite. \"Although\" needs a full clause.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'wordForms',
    question: "The receptionist answered every question ___.",
    answers: ["polite", "politeness", "politely", "politer"],
    correct_index: 2,
    justification: "We describe how she answered (a verb), so we need an adverb: politely.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'extreme',
    category: 'vocabulary',
    question: "The contract will be ___ for another year if neither side objects.",
    answers: ["renewed", "refreshed", "restored", "recovered"],
    correct_index: 0,
    justification: "Renew a contract = make it continue for a new period.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'passive',
    question: "The answers to common questions ___ in the FAQ section of our Web site.",
    answers: ["may read", "can be read", "have read", "have to read"],
    correct_index: 1,
    justification: "Answers can't read anything: passive voice. They can be read (by visitors).",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'vocabulary',
    question: "The new scale measures the weight of each package ___.",
    answers: ["widely", "eagerly", "loosely", "accurately"],
    correct_index: 3,
    justification: "A scale measures accurately (= exactly).",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'vocabulary',
    question: "A bachelor's degree or ___ experience is required for this position.",
    answers: ["same", "equal", "equivalent", "identical"],
    correct_index: 2,
    justification: "Fixed expression in job ads: \"or equivalent experience\" (= experience that is worth the same).",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'gerunds',
    question: "The store increased its sales by ___ its opening hours.",
    answers: ["extend", "extended", "extending", "extension"],
    correct_index: 2,
    justification: "After a preposition (by), the verb takes -ing: by extending.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'vocabulary',
    question: "___ the best way to learn new software is to practice with real projects.",
    answers: ["Within", "Perhaps", "Every", "Whereas"],
    correct_index: 1,
    justification: "The sentence is already complete: we only need an adverb at the start. Perhaps = maybe.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'vocabulary',
    question: "The factory must meet strict safety ___ set by the government.",
    answers: ["features", "regulations", "risks", "institutions"],
    correct_index: 1,
    justification: "Safety regulations = official safety rules.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'wordForms',
    question: "Ms. Tran's new engine is more ___ than the previous model and uses half as much fuel.",
    answers: ["efficiency", "efficiently", "efficient", "effect"],
    correct_index: 2,
    justification: "After \"be more\" we need an adjective: more efficient.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'connectors',
    question: "___ answering phone calls, the assistant manages the office calendar.",
    answers: ["Besides", "Moreover", "Furthermore", "Also"],
    correct_index: 0,
    justification: "\"Besides\" + -ing = in addition to doing. Moreover / furthermore / also can't be followed by -ing like this.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'extreme',
    category: 'verbTenses',
    question: "By the time the guests arrived, the caterers ___ all the tables.",
    answers: ["had set", "have been set", "will set", "were set"],
    correct_index: 0,
    justification: "An action finished before another past action: past perfect (had set). \"Were set\" is passive, it can't have an object.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'pronouns',
    question: "The volunteers were proud of ___ work at the charity event.",
    answers: ["them", "they", "theirs", "their"],
    correct_index: 3,
    justification: "Before a noun (work) we need a possessive adjective: their.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'vocabulary',
    question: "Many participants said the cooking demonstration was very ___.",
    answers: ["useful", "wealthy", "eager", "financial"],
    correct_index: 0,
    justification: "A demonstration can be useful. People are eager, not demonstrations.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'wordForms',
    question: "The trainer described the ___ of regular exercise to the new members.",
    answers: ["advantageous", "advantaged", "advantages", "advantaging"],
    correct_index: 2,
    justification: "After \"the\" we need a noun: the advantages.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'prepositions',
    question: "There were several accidents ___ the highway this morning.",
    answers: ["until", "out", "on", "from"],
    correct_index: 2,
    justification: "On a road / highway: \"on\" for a surface.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'verbTenses',
    question: "If you have already ___ your registration fee, you do not need to pay again.",
    answers: ["pay", "paying", "paid", "to pay"],
    correct_index: 2,
    justification: "Present perfect: have + past participle (paid).",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'vocabulary',
    question: "The ___ of the old train station will add new shops and a waiting area.",
    answers: ["expansion", "performance", "deadline", "supplement"],
    correct_index: 0,
    justification: "Adding shops and a waiting area = an expansion (making it bigger).",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'comparatives',
    question: "This year's sales grew ___ than last year's.",
    answers: ["quickly", "quick", "quickness", "more quickly"],
    correct_index: 3,
    justification: "\"Than\" needs a comparative, and we describe a verb (grew): more quickly.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'vocabulary',
    question: "Applicants must ___ two letters of recommendation with their application.",
    answers: ["include", "donate", "confess", "decline"],
    correct_index: 0,
    justification: "Include something with an application = add it.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'wordForms',
    question: "Registered members enjoy ___ access to the online library.",
    answers: ["limit", "limits", "limiting", "unlimited"],
    correct_index: 3,
    justification: "Before a noun (access) we need an adjective: unlimited access.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'prepositions',
    question: "___ two weeks of negotiations, the companies signed the contract.",
    answers: ["After", "Besides", "Still", "Even"],
    correct_index: 0,
    justification: "After + period of time: after two weeks of negotiations.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'pronouns',
    question: "Of the two printers in the office, ___ is broken and the other works well.",
    answers: ["either", "some", "one", "others"],
    correct_index: 2,
    justification: "For two things: one ... the other.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'vocabulary',
    question: "The editor made several ___ to the article before it was published.",
    answers: ["drawings", "standards", "changes", "duplications"],
    correct_index: 2,
    justification: "Make changes to something = modify it.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'connectors',
    question: "Please note ___ the office will be closed on Friday.",
    answers: ["about", "that", "what", "which"],
    correct_index: 1,
    justification: "\"Note that\" + clause: a common way to give information.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'vocabulary',
    question: "The company ___ that its new phone has the longest battery life on the market.",
    answers: ["states", "obtains", "competes", "inquires"],
    correct_index: 0,
    justification: "State that + clause = say officially that something is true.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'wordForms',
    question: "The two firms reached an ___ after several meetings.",
    answers: ["agreement", "agreeable", "agree", "agreed"],
    correct_index: 0,
    justification: "After \"an\" we need a noun: reach an agreement.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'connectors',
    question: "___ the training session is optional, most employees attend it.",
    answers: ["Despite", "Although", "In spite", "Regardless"],
    correct_index: 1,
    justification: "There is a full clause (the session IS optional): \"although\" + clause. \"Despite\" needs only a noun.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'wordForms',
    question: "Customers can easily ___ their orders online.",
    answers: ["tracking", "tracked", "track", "tracks"],
    correct_index: 2,
    justification: "After a modal (can) we use the base form: can track.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'vocabulary',
    question: "The store sells a wide ___ of outdoor equipment.",
    answers: ["variety", "center", "surplus", "kind"],
    correct_index: 0,
    justification: "Fixed expression: a wide variety of (= many different kinds of).",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'wordForms',
    question: "The new parking lot will be ___ to all employees starting next week.",
    answers: ["availability", "available", "availably", "avail"],
    correct_index: 1,
    justification: "After \"be\" we need an adjective: available to everyone.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'vocabulary',
    question: "The company wants its products to be sold ___, from big cities to small towns.",
    answers: ["everywhere", "somehow", "otherwise", "anyway"],
    correct_index: 0,
    justification: "\"From big cities to small towns\" explains \"everywhere\".",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'wordForms',
    question: "Office ___ such as paper, pens, and ink are stored in the closet.",
    answers: ["supply", "supplied", "supplying", "supplies"],
    correct_index: 3,
    justification: "We need a noun, plural because of \"are\": office supplies.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'connectors',
    question: "The new furniture will be delivered ___ the painting work is finished.",
    answers: ["with", "those", "just", "once"],
    correct_index: 3,
    justification: "A clause follows (the painting work is finished): we need a conjunction. Once = as soon as / after.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'vocabulary',
    question: "All twelve members voted in favor, so the proposal was approved ___.",
    answers: ["partially", "regularly", "unanimously", "briefly"],
    correct_index: 2,
    justification: "Unanimously = everyone agreed.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'extreme',
    category: 'passive',
    question: "When ___ about the new schedule, most employees said they preferred it.",
    answers: ["ask", "asked", "asking", "asks"],
    correct_index: 1,
    justification: "Short form of \"when (they were) asked\": the employees were asked, so passive -> past participle.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'connectors',
    question: "Mr. Lee left early ___ he could catch the last train.",
    answers: ["wherever", "as if", "so that", "considering"],
    correct_index: 2,
    justification: "\"So that\" + clause = in order that (a purpose).",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'prepositions',
    question: "Visitors should check in at the reception desk ___ entering the building.",
    answers: ["among", "during", "before", "through"],
    correct_index: 2,
    justification: "Before + -ing: you check in first, then you enter.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'extreme',
    category: 'prepositions',
    question: "Any expenses ___ the approved budget must be explained to the finance manager.",
    answers: ["toward", "beyond", "along", "upon"],
    correct_index: 1,
    justification: "Beyond = more than / outside of. Expenses beyond the budget.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'wordForms',
    question: "The orchestra is made up of highly ___ musicians.",
    answers: ["talent", "talenting", "talented", "talents"],
    correct_index: 2,
    justification: "After \"highly\" + before a noun: an adjective. Highly talented.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'vocabulary',
    question: "The assistant is responsible for ___ new employees about company policies.",
    answers: ["informing", "discussing", "resuming", "narrating"],
    correct_index: 0,
    justification: "\"Inform someone about something\". Discuss doesn't take a person as object.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'wordForms',
    question: "The museum has an ___ collection of modern art.",
    answers: ["extend", "extensive", "extension", "extensively"],
    correct_index: 1,
    justification: "Before a noun (collection) we need an adjective: an extensive (= very large) collection.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'vocabulary',
    question: "The chef checks the refrigerator before he ___ more vegetables.",
    answers: ["contains", "buys", "copies", "writes"],
    correct_index: 1,
    justification: "You check what you have before you buy more.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'wordForms',
    question: "The manager thanked the team for their ___ during the busy season.",
    answers: ["cooperate", "cooperation", "cooperative", "cooperated"],
    correct_index: 1,
    justification: "After a possessive (their) we need a noun: their cooperation.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'extreme',
    category: 'comparatives',
    question: "This is ___ the most popular dish on the restaurant's menu.",
    answers: ["as far", "far from", "so far", "by far"],
    correct_index: 3,
    justification: "\"By far\" + superlative = clearly, with a big difference.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'vocabulary',
    question: "You can exchange ___ item bought in our store within 30 days.",
    answers: ["several", "few", "many", "any"],
    correct_index: 3,
    justification: "\"Any\" + singular noun = no matter which one. Few / many / several need a plural noun.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'wordForms',
    question: "The company hired a new ___ to lead its sales team.",
    answers: ["direct", "directly", "director", "direction"],
    correct_index: 2,
    justification: "After \"a new\" we need a noun for a person: a director.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'wordForms',
    question: "It was one of the most ___ presentations of the conference.",
    answers: ["inform", "informative", "information", "informatively"],
    correct_index: 1,
    justification: "\"The most\" + adjective + noun: the most informative presentations.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'vocabulary',
    question: "The new menu received many ___ reviews from food critics.",
    answers: ["eventual", "probable", "favorable", "close"],
    correct_index: 2,
    justification: "Favorable reviews = positive reviews.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'prepositions',
    question: "Please wash your hands ___ each meal.",
    answers: ["before", "where", "whenever", "inside"],
    correct_index: 0,
    justification: "Preposition + noun (each meal): before. \"Whenever\" needs a clause.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'wordForms',
    question: "The noise from the construction site ___ disturbs the residents.",
    answers: ["constant", "constantly", "constancy", "constants"],
    correct_index: 1,
    justification: "Before a verb (disturbs) we need an adverb: constantly.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'vocabulary',
    question: "Although the furniture is designed in Sweden, its ___ takes place in Poland.",
    answers: ["production", "vision", "meeting", "approach"],
    correct_index: 0,
    justification: "Designed in one country, made in another: its production.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'gerunds',
    question: "Many employees ride bicycles to work ___ money on fuel.",
    answers: ["save", "saved", "to save", "is saved"],
    correct_index: 2,
    justification: "Purpose: to + base verb. They ride bicycles to save money.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'connectors',
    question: "___ the new manager is hired, Ms. Ito will lead the team.",
    answers: ["Finally", "During", "Despite", "Until"],
    correct_index: 3,
    justification: "A clause follows (the new manager is hired): \"until\" + clause. During / despite need a noun.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'wordForms',
    question: "The store will issue ___ to customers who return damaged items.",
    answers: ["refunding", "refunded", "refunds", "refundable"],
    correct_index: 2,
    justification: "\"Issue\" needs a noun as object: issue refunds.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'vocabulary',
    question: "All documents must be filed ___ so they can be found quickly.",
    answers: ["correctly", "restfully", "truly", "finely"],
    correct_index: 0,
    justification: "Filed correctly = in the right place.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'pronouns',
    question: "Employees ___ want to attend the workshop should sign up by Friday.",
    answers: ["which", "whose", "who", "whom"],
    correct_index: 2,
    justification: "Relative pronoun for people, as subject of \"want\": who.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'wordForms',
    question: "The committee chose the proposal best ___ to the company's needs.",
    answers: ["suit", "suitable", "suiting", "suited"],
    correct_index: 3,
    justification: "Fixed expression: best suited to (= the most adapted to).",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'connectors',
    question: "The hotel offers free Wi-Fi ___ a daily breakfast.",
    answers: ["whereas", "so", "unless", "as well as"],
    correct_index: 3,
    justification: "\"As well as\" links two nouns: Wi-Fi as well as breakfast.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'connectors',
    question: "Ms. Ford will answer the phones ___ the receptionist is at lunch.",
    answers: ["besides", "during", "along", "while"],
    correct_index: 3,
    justification: "\"While\" + clause = during the time that. \"During\" needs only a noun.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'vocabulary',
    question: "The travel agency offers tours to popular ___ such as Japan and Brazil.",
    answers: ["ambitions", "destinations", "decisions", "conditions"],
    correct_index: 1,
    justification: "Japan and Brazil are destinations (= places you travel to).",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'connectors',
    question: "The customer asked ___ the store delivers on weekends.",
    answers: ["about", "so", "whether", "of"],
    correct_index: 2,
    justification: "Indirect yes / no question: ask whether (= if) + clause.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'vocabulary',
    question: "The government ___ new guidelines for food safety last month.",
    answers: ["regarded", "published", "performed", "constructed"],
    correct_index: 1,
    justification: "Publish guidelines = make them public.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'extreme',
    category: 'pronouns',
    question: "Our offices are on the third floor, and ___ are on the fifth.",
    answers: ["their", "theirs", "them", "they're"],
    correct_index: 1,
    justification: "We need a subject that replaces a noun: theirs = their offices.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'vocabulary',
    question: "The company ___ a new advertising campaign last week.",
    answers: ["landed", "raised", "launched", "reached"],
    correct_index: 2,
    justification: "Launch a campaign = start it.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'extreme',
    category: 'prepositions',
    question: "The bridge has been closed for ___ a month.",
    answers: ["across", "above", "upon", "over"],
    correct_index: 3,
    justification: "Over + amount = more than. For over a month.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'verbTenses',
    question: "As soon as the shipment ___, we will contact you.",
    answers: ["arriving", "will arrive", "arrived", "arrives"],
    correct_index: 3,
    justification: "After a time word (as soon as, when, after), use the present simple, even for the future.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'vocabulary',
    question: "The new movie will be released ___ in theaters and online.",
    answers: ["instinctively", "mutually", "simultaneously", "cautiously"],
    correct_index: 2,
    justification: "Simultaneously = at the same time.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'verbTenses',
    question: "If the team had prepared better, they ___ the contract.",
    answers: ["will win", "would have won", "win", "had won"],
    correct_index: 1,
    justification: "Third conditional (past, not real): if + had + past participle, would have + past participle.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'wordForms',
    question: "The museum's new lighting system is very ___ and uses half the electricity of the old one.",
    answers: ["efficient", "efficiency", "efficiently", "efficiencies"],
    correct_index: 0,
    justification: "After \"very\" and before \"and\", we need an adjective: efficient.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'wordForms',
    question: "Ms. Okafor spoke ___ about the benefits of the new scheduling software.",
    answers: ["enthusiastic", "enthusiastically", "enthusiasm", "enthusiast"],
    correct_index: 1,
    justification: "The word describes the verb \"spoke\": we need an adverb (-ly).",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'wordForms',
    question: "The ___ of the two bakeries will create the largest bread supplier in the region.",
    answers: ["merge", "merged", "merging", "merger"],
    correct_index: 3,
    justification: "After \"The\" and before \"of\", we need a noun: merger.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'wordForms',
    question: "Visitors must show a valid ___ at the front desk before entering the laboratory.",
    answers: ["identified", "identifiable", "identification", "identify"],
    correct_index: 2,
    justification: "After the adjective \"valid\", we need a noun: identification.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'wordForms',
    question: "The cooking class was ___ popular, so the school added two more sessions.",
    answers: ["surprisingly", "surprised", "surprising", "surprise"],
    correct_index: 0,
    justification: "Before the adjective \"popular\", we need an adverb: surprisingly.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'wordForms',
    question: "Please read the safety instructions ___ before using the climbing wall.",
    answers: ["careful", "care", "cared", "carefully"],
    correct_index: 3,
    justification: "The word describes the verb \"read\": adverb carefully.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'extreme',
    category: 'wordForms',
    question: "Because of its ___ design, the folding bicycle fits easily in a small car.",
    answers: ["compactly", "compact", "compactness", "compacted"],
    correct_index: 1,
    justification: "Between \"its\" and the noun \"design\", we need an adjective: compact.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'wordForms',
    question: "The hotel offers free ___ to all guests who stay more than three nights.",
    answers: ["parks", "parked", "parking", "park"],
    correct_index: 2,
    justification: "After \"free\", we need a noun: parking (a place to leave your car).",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'wordForms',
    question: "The new manager is known for her ___ to answer every customer e-mail within a day.",
    answers: ["committed", "commit", "commitment", "commits"],
    correct_index: 2,
    justification: "After \"her\", we need a noun: commitment.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'wordForms',
    question: "Staff badges must be ___ at all times inside the building.",
    answers: ["visibly", "visible", "visibility", "visualize"],
    correct_index: 1,
    justification: "After \"be\", we need an adjective: visible.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'extreme',
    category: 'wordForms',
    question: "Mr. Ito's report gives a ___ account of how the factory reduced its waste by forty percent.",
    answers: ["detail", "detailing", "details", "detailed"],
    correct_index: 3,
    justification: "Between \"a\" and the noun \"account\", we need an adjective: detailed (with many details).",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'vocabulary',
    question: "The airline will ___ passengers whose flights are delayed by more than three hours.",
    answers: ["compensate", "complete", "compose", "compete"],
    correct_index: 0,
    justification: "\"Compensate\" = give something (money, a voucher) after a problem.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'vocabulary',
    question: "The community garden is looking for ___ to help water the plants during the summer.",
    answers: ["venues", "volunteers", "vehicles", "versions"],
    correct_index: 1,
    justification: "People who help for free = volunteers.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'vocabulary',
    question: "The architect made several ___ to the plans after meeting with the city council.",
    answers: ["receipts", "reservations", "revisions", "reunions"],
    correct_index: 2,
    justification: "Changes made to plans = revisions.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'vocabulary',
    question: "Guests can ___ a table online or by phone.",
    answers: ["resume", "reverse", "resolve", "reserve"],
    correct_index: 3,
    justification: "\"Reserve a table\" = book it in advance.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'vocabulary',
    question: "The software update is ___ with all phones sold after 2020.",
    answers: ["compatible", "comfortable", "capable", "considerable"],
    correct_index: 0,
    justification: "\"Compatible with\" = it works with.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'vocabulary',
    question: "The bookstore will ___ its opening hours during the holiday season.",
    answers: ["extend", "exceed", "explain", "expect"],
    correct_index: 0,
    justification: "\"Extend the hours\" = stay open longer.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'extreme',
    category: 'vocabulary',
    question: "Applicants with ___ experience in event planning will be given priority.",
    answers: ["expensive", "extensive", "excessive", "exclusive"],
    correct_index: 1,
    justification: "\"Extensive\" = a lot of (experience). \"Expensive\" = it costs a lot.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'vocabulary',
    question: "The repair team will ___ the broken window by Thursday afternoon.",
    answers: ["refer", "remind", "replace", "retire"],
    correct_index: 2,
    justification: "\"Replace\" = put a new one instead of the broken one.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'vocabulary',
    question: "Our customer service ___ are available by phone from 8 A.M. to 6 P.M.",
    answers: ["resolutions", "reputations", "recommendations", "representatives"],
    correct_index: 3,
    justification: "The people who help customers = representatives.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'vocabulary',
    question: "The city plans to ___ a new bridge across the river next year.",
    answers: ["contain", "construct", "consult", "conclude"],
    correct_index: 1,
    justification: "\"Construct\" = build.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'vocabulary',
    question: "The marketing team's ___ for the product launch includes ads on social media and radio.",
    answers: ["strategy", "structure", "statement", "stability"],
    correct_index: 0,
    justification: "A plan to reach a goal = a strategy.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'extreme',
    category: 'vocabulary',
    question: "The festival organizers were ___ about the weather, so they rented large tents just in case.",
    answers: ["conscious", "courteous", "cautious", "curious"],
    correct_index: 2,
    justification: "They prepared \"just in case\": they were careful = cautious.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'vocabulary',
    question: "You can ___ your order online by entering your tracking number.",
    answers: ["trade", "train", "treat", "track"],
    correct_index: 3,
    justification: "\"Track an order\" = follow where it is.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'vocabulary',
    question: "The two companies reached an ___ after several weeks of discussion.",
    answers: ["appointment", "announcement", "agreement", "advertisement"],
    correct_index: 2,
    justification: "\"Reach an agreement\" = finally agree.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'prepositions',
    question: "The science fair will take place ___ the school gymnasium.",
    answers: ["into", "toward", "onto", "in"],
    correct_index: 3,
    justification: "\"Take place in\" a room or a building.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'prepositions',
    question: "The gallery has been closed for repairs ___ early March.",
    answers: ["by", "since", "ago", "for"],
    correct_index: 1,
    justification: "\"Since\" + a starting point (early March). \"For\" + a duration.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'prepositions',
    question: "Tickets can be exchanged ___ a small fee.",
    answers: ["for", "off", "by", "on"],
    correct_index: 0,
    justification: "\"For a fee\" = in return for some money.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'prepositions',
    question: "The keys to the storage room are kept ___ the front desk.",
    answers: ["behind", "across", "between", "among"],
    correct_index: 0,
    justification: "\"Behind the desk\" = at the back of it. \"Between\" and \"among\" need several things.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'prepositions',
    question: "Hikers should stay ___ the marked trails at all times.",
    answers: ["of", "into", "over", "on"],
    correct_index: 3,
    justification: "You walk \"on\" a trail: \"stay on the trail\".",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'extreme',
    category: 'prepositions',
    question: "The proposal was approved ___ the objections of two board members.",
    answers: ["although", "despite", "whether", "unless"],
    correct_index: 1,
    justification: "\"Despite\" + a noun (the objections). \"Although\" needs a full clause.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'connectors',
    question: "___ it was raining, the outdoor market stayed open all day.",
    answers: ["Therefore", "Because", "Although", "Unless"],
    correct_index: 2,
    justification: "Contrast between the rain and staying open: although.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'connectors',
    question: "The printer is out of ink; ___, the reports will be printed tomorrow.",
    answers: ["otherwise", "meanwhile", "therefore", "however"],
    correct_index: 2,
    justification: "No ink → printed tomorrow: a consequence = therefore.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'connectors',
    question: "You can pay by credit card ___ in cash at the reception desk.",
    answers: ["so", "or", "nor", "but"],
    correct_index: 1,
    justification: "A choice between two ways to pay: or.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'connectors',
    question: "Please keep your receipt ___ you need to return the item.",
    answers: ["as if", "even though", "so that", "in case"],
    correct_index: 3,
    justification: "\"In case\" = for the possible situation where you need it.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'extreme',
    category: 'connectors',
    question: "___ the new system was installed, orders have been processed twice as fast.",
    answers: ["Since", "Unless", "While", "Until"],
    correct_index: 0,
    justification: "\"Since\" + a past event, with the present perfect (have been processed).",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'pronouns',
    question: "Mr. Diallo designed the poster ___, without any help from the agency.",
    answers: ["him", "his", "he", "himself"],
    correct_index: 3,
    justification: "\"Without any help\": a reflexive pronoun for emphasis = himself.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'pronouns',
    question: "The volunteers received a thank-you note for ___ hard work.",
    answers: ["themselves", "their", "they", "them"],
    correct_index: 1,
    justification: "Before the noun \"hard work\": the possessive adjective their.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'pronouns',
    question: "Of all the designs that were sent, ___ was the most original.",
    answers: ["hers", "she", "herself", "her"],
    correct_index: 0,
    justification: "Alone, in place of \"her design\": the possessive pronoun hers.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'extreme',
    category: 'pronouns',
    question: "The two managers met to compare the results of ___ teams.",
    answers: ["theirs", "them", "their", "there"],
    correct_index: 2,
    justification: "Before the noun \"teams\": their. \"There\" is a place, not a possessive.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'verbTenses',
    question: "The shop ___ its tenth anniversary next month.",
    answers: ["will celebrate", "has celebrated", "celebrating", "celebrated"],
    correct_index: 0,
    justification: "\"Next month\" = the future: will celebrate.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'verbTenses',
    question: "By the time the guests arrived, the chef ___ the main course.",
    answers: ["prepares", "will prepare", "had prepared", "has been preparing"],
    correct_index: 2,
    justification: "An action finished before another past action: the past perfect (had prepared).",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'verbTenses',
    question: "Ms. Garcia ___ in the accounting department since she joined the company.",
    answers: ["works", "worked", "is working", "has worked"],
    correct_index: 3,
    justification: "\"Since\" + a past point, still true now: the present perfect (has worked).",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'passive',
    question: "The new parking rules ___ to all employees last week.",
    answers: ["explaining", "were explained", "have explained", "explained"],
    correct_index: 1,
    justification: "The rules don't explain: someone explained them. Passive + past (last week).",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'passive',
    question: "All packages must ___ before 4 P.M. to arrive the next day.",
    answers: ["sending", "send", "be sent", "sent"],
    correct_index: 2,
    justification: "After \"must\": the base form. Packages are sent by someone: passive \"be sent\".",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'extreme',
    category: 'passive',
    question: "The conference room cannot be used today because it ___.",
    answers: ["has painted", "is painting", "paints", "is being painted"],
    correct_index: 3,
    justification: "The room doesn't paint: someone is painting it right now = is being painted.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'subjectVerb',
    question: "Each of the rooms ___ a view of the lake.",
    answers: ["have", "has", "having", "are having"],
    correct_index: 1,
    justification: "\"Each of ...\" is singular: has.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'subjectVerb',
    question: "The list of new suppliers ___ on the shared drive.",
    answers: ["is", "have been", "were", "are"],
    correct_index: 0,
    justification: "The subject is \"the list\" (singular), not \"suppliers\": is.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'comparatives',
    question: "This year's sales were ___ than last year's.",
    answers: ["more high", "higher", "highest", "high"],
    correct_index: 1,
    justification: "\"Than\" needs a comparative: higher.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'comparatives',
    question: "The Lotus Café is the ___ restaurant in the neighborhood.",
    answers: ["busiest", "busy", "busier", "most busy"],
    correct_index: 0,
    justification: "\"The ... in the neighborhood\" = a superlative: busiest.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'gerunds',
    question: "Ms. Novak is interested in ___ the London office next year.",
    answers: ["managed", "manage", "to manage", "managing"],
    correct_index: 3,
    justification: "After a preposition (in), we use the -ing form: managing.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'wordForms',
    question: "The festival attracted a ___ number of visitors this year.",
    answers: ["consideration", "considerably", "considerable", "consider"],
    correct_index: 2,
    justification: "Between \"a\" and the noun \"number\", we need an adjective: considerable.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'wordForms',
    question: "The technician explained the problem ___ so that everyone could understand it.",
    answers: ["clearly", "clarity", "clearness", "clear"],
    correct_index: 0,
    justification: "The word describes the verb \"explained\": adverb clearly.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'wordForms',
    question: "Mr. Hassan's ___ to the project was praised by the whole team.",
    answers: ["contribute", "contributed", "contributes", "contribution"],
    correct_index: 3,
    justification: "After \"Mr. Hassan's\", we need a noun: contribution.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'wordForms',
    question: "The new chairs are much more ___ than the old wooden ones.",
    answers: ["comfort", "comfortable", "comforted", "comfortably"],
    correct_index: 1,
    justification: "After \"more\" and before \"than\": an adjective (comfortable).",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'extreme',
    category: 'wordForms',
    question: "The training program is designed to help new employees work more ___.",
    answers: ["independent", "independents", "independently", "independence"],
    correct_index: 2,
    justification: "The word describes the verb \"work\": adverb independently.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'wordForms',
    question: "There has been a sharp ___ in the price of coffee beans this year.",
    answers: ["increase", "increasing", "increasingly", "increased"],
    correct_index: 0,
    justification: "After the adjective \"sharp\", we need a noun: increase.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'wordForms',
    question: "The company's ___ to customer complaints has improved since last year.",
    answers: ["respond", "response", "responsive", "responded"],
    correct_index: 1,
    justification: "After \"The company's\", we need a noun: response.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'wordForms',
    question: "Please submit your expense reports ___ to avoid payment delays.",
    answers: ["prompting", "prompt", "promptly", "prompted"],
    correct_index: 2,
    justification: "The word describes the verb \"submit\": adverb promptly (quickly).",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'wordForms',
    question: "The museum is ___ located near the central train station.",
    answers: ["convenience", "convenient", "conveniences", "conveniently"],
    correct_index: 3,
    justification: "Before the participle \"located\", we need an adverb: conveniently.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'extreme',
    category: 'wordForms',
    question: "The talks were long, but the final contract was ___ to both companies.",
    answers: ["beneficially", "benefited", "benefit", "beneficial"],
    correct_index: 3,
    justification: "After \"was\", we need an adjective: beneficial (good for).",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'wordForms',
    question: "The ___ of the photography contest will be announced on Friday.",
    answers: ["winners", "winning", "win", "won"],
    correct_index: 0,
    justification: "After \"The\" and before \"of\", we need a noun: winners.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'vocabulary',
    question: "The bank will ___ a small fee for each international transfer.",
    answers: ["check", "change", "charge", "choose"],
    correct_index: 2,
    justification: "\"Charge a fee\" = ask for money.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'vocabulary',
    question: "The new library building was designed to be ___ to people in wheelchairs.",
    answers: ["accurate", "accessible", "additional", "acceptable"],
    correct_index: 1,
    justification: "\"Accessible to\" = easy to enter and use.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'vocabulary',
    question: "Please ___ from using your phone during the performance.",
    answers: ["remain", "refrain", "refuse", "retain"],
    correct_index: 1,
    justification: "\"Refrain from\" + -ing = do not do something.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'vocabulary',
    question: "Because of the storm, all ferry ___ have been canceled for the day.",
    answers: ["departures", "deposits", "departments", "descriptions"],
    correct_index: 0,
    justification: "Boats leaving = departures.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'vocabulary',
    question: "The hotel staff will be happy to ___ your luggage until check-in time.",
    answers: ["stop", "stay", "store", "stare"],
    correct_index: 2,
    justification: "\"Store your luggage\" = keep it safely for you.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'extreme',
    category: 'vocabulary',
    question: "The CEO gave a ___ speech that convinced the investors to support the plan.",
    answers: ["pervasive", "permissive", "perishable", "persuasive"],
    correct_index: 3,
    justification: "A speech that convinces people = persuasive.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'vocabulary',
    question: "All new employees must ___ a two-day training session.",
    answers: ["attempt", "attract", "attend", "attach"],
    correct_index: 2,
    justification: "\"Attend a session\" = go to it.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'vocabulary',
    question: "The price of the tour ___ meals, transportation, and a local guide.",
    answers: ["includes", "involves", "inquires", "invites"],
    correct_index: 0,
    justification: "\"Includes\" = these things are part of the price.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'vocabulary',
    question: "The restaurant received excellent ___ from food critics after its opening.",
    answers: ["renewals", "reviews", "rehearsals", "refunds"],
    correct_index: 1,
    justification: "What critics write about a restaurant = reviews.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'vocabulary',
    question: "Workers must wear protective ___ when they enter the building site.",
    answers: ["gain", "grade", "guest", "gear"],
    correct_index: 3,
    justification: "\"Protective gear\" = clothes and objects that keep you safe (helmet, gloves).",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'extreme',
    category: 'vocabulary',
    question: "The board decided to ___ the launch of the product until the safety tests are finished.",
    answers: ["position", "possess", "postulate", "postpone"],
    correct_index: 3,
    justification: "\"Postpone\" = move to a later date.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'vocabulary',
    question: "Ms. Lindqvist will ___ the meeting while the director is on vacation.",
    answers: ["lead", "lean", "leave", "lend"],
    correct_index: 0,
    justification: "\"Lead a meeting\" = be in charge of it.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'vocabulary',
    question: "Online orders are usually ___ within two business days.",
    answers: ["dismissed", "dispatched", "displayed", "disputed"],
    correct_index: 1,
    justification: "\"Dispatched\" = sent to the customer.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'vocabulary',
    question: "The museum asks visitors not to ___ the paintings.",
    answers: ["toss", "teach", "touch", "taste"],
    correct_index: 2,
    justification: "You must not put your hands on paintings: touch.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'prepositions',
    question: "The concert starts ___ 8 P.M., so please arrive a little earlier.",
    answers: ["at", "in", "on", "by"],
    correct_index: 0,
    justification: "\"At\" + a clock time (at 8 P.M.).",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'prepositions',
    question: "Our office is located ___ the third floor of the Pine Tower.",
    answers: ["through", "on", "onto", "into"],
    correct_index: 1,
    justification: "\"On\" + a floor (on the third floor).",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'prepositions',
    question: "The workshop is open to everyone ___ experience level.",
    answers: ["because", "in spite", "instead", "regardless of"],
    correct_index: 3,
    justification: "\"Regardless of\" + a noun = it does not matter what the level is.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'prepositions',
    question: "The package should arrive ___ Tuesday and Thursday.",
    answers: ["among", "from", "between", "during"],
    correct_index: 2,
    justification: "\"Between A and B\" (two days).",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'extreme',
    category: 'prepositions',
    question: "___ the success of the trial program, the company will open three more centers.",
    answers: ["Without", "Despite", "Following", "Unlike"],
    correct_index: 2,
    justification: "\"Following\" = after, and because of. \"Despite\" would be a contradiction.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'connectors',
    question: "The café is small, ___ it serves more than three hundred customers a day.",
    answers: ["or", "so", "because", "but"],
    correct_index: 3,
    justification: "Small, yet many customers: a contrast = but.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'connectors',
    question: "___ you have registered, you will receive a confirmation e-mail.",
    answers: ["Once", "Whereas", "Although", "Unless"],
    correct_index: 0,
    justification: "\"Once\" = as soon as (after you register).",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'connectors',
    question: "Bring a jacket, ___ you might feel cold on the boat.",
    answers: ["so", "or", "and", "but"],
    correct_index: 1,
    justification: "\"Or\" here means \"if you don't\" (otherwise).",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'connectors',
    question: "The hotel has a pool; ___, it lends free bicycles to its guests.",
    answers: ["in addition", "on the contrary", "instead", "nevertheless"],
    correct_index: 0,
    justification: "One more advantage is added: in addition.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'extreme',
    category: 'connectors',
    question: "___ the train was delayed, Mr. Chen arrived at the conference on time.",
    answers: ["Because", "So that", "Even though", "As long as"],
    correct_index: 2,
    justification: "Delay, yet on time: a contrast = even though.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'pronouns',
    question: "Please give ___ your feedback by the end of the week.",
    answers: ["ours", "us", "we", "our"],
    correct_index: 1,
    justification: "After the verb \"give\", an object pronoun: us.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'pronouns',
    question: "The designers presented ___ new collection at the fashion show.",
    answers: ["themselves", "they", "them", "their"],
    correct_index: 3,
    justification: "Before the noun \"collection\": the possessive adjective their.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'pronouns',
    question: "If you have any questions, please contact Mr. Park or ___ assistant.",
    answers: ["his", "him", "himself", "he"],
    correct_index: 0,
    justification: "Before the noun \"assistant\": the possessive adjective his.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'extreme',
    category: 'pronouns',
    question: "Employees who wish to change ___ work schedule must ask a manager first.",
    answers: ["they're", "their", "theirs", "there"],
    correct_index: 1,
    justification: "Before the noun \"work schedule\": their. (they're = they are).",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'verbTenses',
    question: "The team ___ the new product yesterday afternoon.",
    answers: ["has tested", "will test", "tested", "tests"],
    correct_index: 2,
    justification: "\"Yesterday\" = a finished past moment: the simple past (tested).",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'verbTenses',
    question: "If the weather is good tomorrow, the picnic ___ in Riverside Park.",
    answers: ["would have taken place", "has taken place", "took place", "will take place"],
    correct_index: 3,
    justification: "\"If\" + present, then the future: will take place.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'verbTenses',
    question: "Mr. Adebayo is not at his desk because he ___ with a client right now.",
    answers: ["meets", "has met", "is meeting", "met"],
    correct_index: 2,
    justification: "\"Right now\" = an action in progress: the present continuous.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'extreme',
    category: 'verbTenses',
    question: "When the manager called, the staff ___ the shelves for two hours.",
    answers: ["will stock", "had been stocking", "stock", "are stocking"],
    correct_index: 1,
    justification: "An action that lasted until a past moment: the past perfect continuous.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'passive',
    question: "The winners ___ by e-mail next Monday.",
    answers: ["will inform", "informed", "are informing", "will be informed"],
    correct_index: 3,
    justification: "The winners don't inform: someone informs them. Future passive.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'passive',
    question: "This bridge ___ more than one hundred years ago.",
    answers: ["was built", "is building", "built", "has built"],
    correct_index: 0,
    justification: "A bridge doesn't build: it was built (past passive, \"ago\").",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'extreme',
    category: 'passive',
    question: "Most of the furniture in the lobby ___ by local artists.",
    answers: ["made", "has made", "was made", "making"],
    correct_index: 2,
    justification: "\"By local artists\" shows who did it: the passive (was made).",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'subjectVerb',
    question: "The new employees ___ their training next week.",
    answers: ["has started", "is starting", "starts", "start"],
    correct_index: 3,
    justification: "Plural subject (employees) + present for a planned event: start.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'subjectVerb',
    question: "Neither the manager nor the assistants ___ available on Friday.",
    answers: ["has been", "are", "was", "is"],
    correct_index: 1,
    justification: "With \"neither... nor\", the verb agrees with the closest subject (the assistants): are.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'comparatives',
    question: "The new phone is ___ than the old model.",
    answers: ["lighter", "lightest", "more light", "light"],
    correct_index: 0,
    justification: "\"Than\" needs a comparative: lighter (short adjective + -er).",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'comparatives',
    question: "This is the ___ interesting exhibition the museum has ever organized.",
    answers: ["more", "very", "most", "much"],
    correct_index: 2,
    justification: "\"The ... ever\" = a superlative: the most interesting.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'gerunds',
    question: "The manager suggested ___ the meeting to Thursday.",
    answers: ["move", "to move", "moved", "moving"],
    correct_index: 3,
    justification: "\"Suggest\" + -ing: suggested moving.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'wordForms',
    question: "The city council approved the ___ of a new bike lane on Main Street.",
    answers: ["creation", "create", "creative", "creatively"],
    correct_index: 0,
    justification: "After \"the\" and before \"of\", we need a noun: creation.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'wordForms',
    question: "The tour guide answered every question ___ and with a smile.",
    answers: ["patience", "patiently", "patients", "patient"],
    correct_index: 1,
    justification: "The word describes the verb \"answered\": adverb patiently.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'wordForms',
    question: "The store manager was ___ with the results of the holiday sale.",
    answers: ["satisfied", "satisfying", "satisfaction", "satisfy"],
    correct_index: 0,
    justification: "\"Be satisfied with\" = be happy with.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'extreme',
    category: 'wordForms',
    question: "The company's growth has been ___ slow this year because of high costs.",
    answers: ["unusual", "unusualness", "usual", "unusually"],
    correct_index: 3,
    justification: "Before the adjective \"slow\", we need an adverb: unusually.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'wordForms',
    question: "Ms. Petrova is ___ for organizing the annual conference.",
    answers: ["responsibly", "responsibility", "responsible", "respond"],
    correct_index: 2,
    justification: "\"Be responsible for\" = be in charge of.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'wordForms',
    question: "Thanks to the new software, the ___ of our deliveries has improved.",
    answers: ["rely", "reliability", "reliably", "reliable"],
    correct_index: 1,
    justification: "After \"the\" and before \"of\", we need a noun: reliability.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'wordForms',
    question: "The online course is free and ___ to anyone with an e-mail address.",
    answers: ["availed", "available", "availability", "avail"],
    correct_index: 1,
    justification: "After \"is free and\", another adjective: available.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'wordForms',
    question: "The workshop gave participants a ___ understanding of basic accounting.",
    answers: ["through", "thoroughly", "thoroughness", "thorough"],
    correct_index: 3,
    justification: "Between \"a\" and the noun \"understanding\": the adjective thorough (complete).",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'extreme',
    category: 'wordForms',
    question: "Customers have responded ___ to the store's new loyalty program.",
    answers: ["positivity", "positives", "positively", "positive"],
    correct_index: 2,
    justification: "The word describes the verb \"responded\": adverb positively.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'wordForms',
    question: "The ___ of the new sports center is scheduled for June 3.",
    answers: ["opening", "opened", "open", "openly"],
    correct_index: 0,
    justification: "After \"The\" and before \"of\", we need a noun: opening.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'vocabulary',
    question: "If you need a parking permit, please ___ the receptionist.",
    answers: ["contract", "consume", "contain", "contact"],
    correct_index: 3,
    justification: "\"Contact\" someone = call or write to them.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'vocabulary',
    question: "The factory has ___ its production to meet the growing demand.",
    answers: ["included", "increased", "invited", "insisted"],
    correct_index: 1,
    justification: "More demand → it produces more: increased.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'vocabulary',
    question: "Our ___ hours are from 9 A.M. to 5 P.M., Monday to Friday.",
    answers: ["business", "busy", "budget", "building"],
    correct_index: 0,
    justification: "\"Business hours\" = the hours when a company is open.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'extreme',
    category: 'vocabulary',
    question: "The new manager has a reputation for being fair and ___.",
    answers: ["approximate", "applicable", "approachable", "appreciable"],
    correct_index: 2,
    justification: "\"Approachable\" = easy to talk to.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'vocabulary',
    question: "The train to Brighton will ___ from platform 4.",
    answers: ["depart", "deliver", "delay", "defend"],
    correct_index: 0,
    justification: "\"Depart\" = leave.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'vocabulary',
    question: "The company offers a generous ___ package, including health insurance.",
    answers: ["boundaries", "bargains", "balances", "benefits"],
    correct_index: 3,
    justification: "Health insurance, vacation... = a benefits package.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'vocabulary',
    question: "Please ___ your seat belt during the entire flight.",
    answers: ["frighten", "flatten", "fasten", "fashion"],
    correct_index: 2,
    justification: "\"Fasten a seat belt\" = close it.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'vocabulary',
    question: "The report ___ that sales will continue to rise next year.",
    answers: ["provides", "predicts", "prevents", "protects"],
    correct_index: 1,
    justification: "Saying what will happen in the future = predicts.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'extreme',
    category: 'vocabulary',
    question: "The two artists decided to ___ on a large painting for the train station.",
    answers: ["calculate", "collaborate", "celebrate", "compensate"],
    correct_index: 1,
    justification: "\"Collaborate on\" = work together on.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'vocabulary',
    question: "The museum gift shop sells postcards and other ___.",
    answers: ["surgeons", "suggestions", "souvenirs", "surveys"],
    correct_index: 2,
    justification: "Things you buy to remember a visit = souvenirs.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'vocabulary',
    question: "Please read the terms carefully before you ___ the contract.",
    answers: ["sign", "signal", "sing", "sigh"],
    correct_index: 0,
    justification: "\"Sign a contract\" = write your name on it.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'vocabulary',
    question: "The weather forecast ___ heavy rain for the weekend.",
    answers: ["calls on", "calls back", "calls off", "calls for"],
    correct_index: 3,
    justification: "\"Call for rain\" = say that it will rain. (\"call off\" = cancel)",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'vocabulary',
    question: "The new law will ___ effect on January 1.",
    answers: ["make", "give", "do", "take"],
    correct_index: 3,
    justification: "\"Take effect\" = start to apply.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'extreme',
    category: 'vocabulary',
    question: "Because the budget is limited, we must ___ which projects to fund first.",
    answers: ["publicize", "patronize", "prioritize", "privatize"],
    correct_index: 2,
    justification: "\"Prioritize\" = decide what is most important.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'prepositions',
    question: "The meeting has been moved ___ Room 204.",
    answers: ["at", "to", "on", "of"],
    correct_index: 1,
    justification: "\"Move to\" a place (the new place).",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'prepositions',
    question: "The parade will pass ___ the city center at noon.",
    answers: ["through", "between", "among", "throughout"],
    correct_index: 0,
    justification: "\"Pass through\" = go from one side to the other.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'prepositions',
    question: "Applications must be received ___ March 31.",
    answers: ["by", "since", "until", "at"],
    correct_index: 0,
    justification: "\"By\" = no later than (a deadline). \"Until\" = continuing up to that day.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'extreme',
    category: 'prepositions',
    question: "The hotel is ___ walking distance of the beach.",
    answers: ["beside", "within", "among", "inside"],
    correct_index: 1,
    justification: "Fixed expression: \"within walking distance of\".",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'prepositions',
    question: "Ms. Kowalczyk will speak ___ behalf of the director.",
    answers: ["at", "to", "on", "by"],
    correct_index: 2,
    justification: "Fixed expression: \"on behalf of\" = instead of / representing.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'connectors',
    question: "The store was closed, ___ we went to the one across the street.",
    answers: ["because", "although", "but", "so"],
    correct_index: 3,
    justification: "Closed → we went elsewhere: a consequence = so.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'connectors',
    question: "You may leave early today ___ you finish your report.",
    answers: ["provided that", "even if", "so that", "rather than"],
    correct_index: 0,
    justification: "\"Provided that\" = only if (a condition).",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'connectors',
    question: "The tour includes lunch, ___ dinner is not included.",
    answers: ["and", "because", "but", "so"],
    correct_index: 2,
    justification: "Lunch yes, dinner no: a contrast = but.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'extreme',
    category: 'connectors',
    question: "The plan is expensive; ___, it will save money in the long term.",
    answers: ["likewise", "consequently", "furthermore", "nonetheless"],
    correct_index: 3,
    justification: "Expensive, yet it saves money: a contrast = nonetheless.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'pronouns',
    question: "The children made the decorations for the party ___.",
    answers: ["their", "themselves", "them", "theirs"],
    correct_index: 1,
    justification: "Without help = by themselves: a reflexive pronoun.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'pronouns',
    question: "Ms. Larsen asked ___ assistant to book a meeting room.",
    answers: ["her", "she", "hers", "herself"],
    correct_index: 0,
    justification: "Before the noun \"assistant\": the possessive adjective her.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'pronouns',
    question: "This umbrella isn't mine. Is it ___?",
    answers: ["yourself", "your", "you", "yours"],
    correct_index: 3,
    justification: "Alone, in place of \"your umbrella\": the possessive pronoun yours.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'verbTenses',
    question: "Every morning, Mr. Tembo ___ the shop at 7 A.M.",
    answers: ["is opening", "opens", "opened", "has opened"],
    correct_index: 1,
    justification: "\"Every morning\" = a habit: the simple present (opens).",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'verbTenses',
    question: "The company ___ more than two hundred people by the end of next year.",
    answers: ["hires", "hired", "will have hired", "has hired"],
    correct_index: 2,
    justification: "\"By\" + a future moment: the future perfect (will have hired).",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'extreme',
    category: 'verbTenses',
    question: "We ___ for the bus for twenty minutes when it finally arrived.",
    answers: ["will wait", "are waiting", "had been waiting", "have waited"],
    correct_index: 2,
    justification: "An action that lasted until a past moment: the past perfect continuous.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'passive',
    question: "Breakfast ___ in the hotel restaurant from 6 to 10 A.M.",
    answers: ["serving", "is serving", "serves", "is served"],
    correct_index: 3,
    justification: "Breakfast doesn't serve: it is served (passive).",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'passive',
    question: "The results of the survey ___ at next week's meeting.",
    answers: ["will present", "will be presented", "presented", "are presenting"],
    correct_index: 1,
    justification: "Results are presented by someone, next week: future passive.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'subjectVerb',
    question: "Everyone in the office ___ invited to the end-of-year party.",
    answers: ["is", "are", "have been", "were"],
    correct_index: 0,
    justification: "\"Everyone\" is singular: is.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'subjectVerb',
    question: "The number of visitors ___ grown every year since 2019.",
    answers: ["were", "has", "have", "are"],
    correct_index: 1,
    justification: "\"The number of\" is singular: has grown.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'extreme',
    category: 'subjectVerb',
    question: "The manager, along with her two assistants, ___ the trade fair every year.",
    answers: ["are attending", "have attended", "attends", "attend"],
    correct_index: 2,
    justification: "The subject is \"the manager\" (singular); \"along with...\" doesn't change it: attends.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'comparatives',
    question: "The second hotel is ___ expensive than the first one.",
    answers: ["less", "fewer", "little", "least"],
    correct_index: 0,
    justification: "\"... than\" + a long adjective: less expensive. (\"fewer\" is for nouns you can count)",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'comparatives',
    question: "Our new office is twice as ___ as the old one.",
    answers: ["largely", "larger", "largest", "large"],
    correct_index: 3,
    justification: "\"As + adjective + as\": the simple adjective (large).",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'extreme',
    category: 'comparatives',
    question: "The ___ you book your tickets, the cheaper they are.",
    answers: ["early", "earliest", "earlier", "more early"],
    correct_index: 2,
    justification: "\"The + comparative..., the + comparative\": the earlier..., the cheaper.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'gerunds',
    question: "Thank you for ___ our survey.",
    answers: ["to complete", "completing", "completed", "complete"],
    correct_index: 1,
    justification: "After the preposition \"for\": the -ing form.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'hard',
    category: 'gerunds',
    question: "The company plans ___ a new branch in Lyon next spring.",
    answers: ["to open", "opening", "opened", "open"],
    correct_index: 0,
    justification: "\"Plan\" + to + verb: plans to open.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'normal',
    category: 'gerunds',
    question: "Ms. Ahmed enjoys ___ with customers from different countries.",
    answers: ["work", "worked", "to work", "working"],
    correct_index: 3,
    justification: "\"Enjoy\" + -ing: enjoys working.",
  }),
  createQuestion({
    section: 'rc10',
    difficulty: 'extreme',
    category: 'gerunds',
    question: "The new machine is capable of ___ two thousand bottles an hour.",
    answers: ["fill", "filled", "to fill", "filling"],
    correct_index: 3,
    justification: "After the preposition \"of\": the -ing form (filling).",
  }),
];

// ---------- RC 8: text completion ----------

const MEMO = `To: All staff
From: Facilities Department
Subject: Elevator maintenance

The main elevator will be out of service from Monday to Wednesday next week. During this period, please use the stairs or the freight elevator ___(1)___ the east wing. We apologize for any ___(2)___ this may cause. ___(3)___`;

const BANK_EMAIL = `Dear Mr. Lopez,

Thank you for ___(1)___ an account with Greenline Bank. Your debit card will arrive by mail within five business days. Once you receive it, you can activate it online or by phone. If you have any questions, ___(2)___ hesitate to contact our customer service team.`;

const COWORKING_KITCHEN_NOTICE = `Hive Desk Coworking — Kitchen Notice

Starting Monday, the shared kitchen on the second floor will have new opening hours. It will be open from 7 A.M. to 7 P.M. on weekdays and ___(1)___ on weekends. Members are welcome to store food in the refrigerator, but please write your name and the date on every container. Any item left for more than five days ___(2)___ by our cleaning staff on Friday evenings. ___(3)___ We also ask members to wash and dry their own cups ___(4)___ leaving the kitchen.

Thank you for helping us keep this space pleasant for everyone.
The Hive Desk Team`;

const SCIENCE_MUSEUM_MEMBERSHIP_EMAIL = `To: Priya Nandakumar
From: Members' Office, Halden Science Museum
Subject: Your membership
Date: 3 September

Dear Ms. Nandakumar,

Your annual membership will ___(1)___ on 30 September. To continue enjoying free entry and early access to our special exhibitions, please renew before that date. ___(2)___, members who renew this month will receive a free guest pass. ___(3)___

Renewing is easy. You can do it online, by phone, or in person at the main desk. If you have changed your address, please let us know so that we can ___(4)___ our records.

Kind regards,
Members' Office`;

const BAKERY_LOYALTY_CARD_AD = `Crumb & Kettle Bakery

Do you stop by for coffee every morning? Then our new loyalty card is for you! Each time you buy a hot drink, we will ___(1)___ your card. After nine stamps, your tenth drink is free. The card can also be used at our ___(2)___ opened shop on Vane Street. ___(3)___

Cards are available at the counter. Simply ask one of our staff members, and they will be happy to give you one. Please note that only one free drink ___(4)___ per visit.

Crumb & Kettle — Fresh bread since 1998`;

const LIBRARY_WIFI_NOTICE = `Notice to Library Users

The wireless internet service at Fernhill Public Library ___(1)___ on Tuesday, 14 May, from 8 A.M. to noon while our provider installs new equipment. During this time, the computers in the study room will still be available. ___(2)___ Users who need to print documents should do so before Tuesday, ___(3)___ the printers are connected to the same network.

The new system will offer faster and more ___(4)___ connections throughout the building. Sorry for the trouble, and thanks for your patience.`;

const FOOD_CONFERENCE_SPEAKER_LETTER = `Dear Mr. Varga,

On behalf of the Northern Food Producers Association, I am pleased to confirm your participation as a speaker at our annual conference in Tampere. Your talk, "Packaging Without Plastic," is ___(1)___ for Thursday at 10:30 A.M. in Hall B.

We will cover the cost of your hotel for two nights. ___(2)___ Please send us your travel receipts after the event, and we will ___(3)___ you within thirty days.

We are confident that our members will find your talk very ___(4)___.

Sincerely,
Elina Saarinen, Event Coordinator`;

const CAR_SHARING_PRICE_EMAIL = `To: RideLoop members
From: support@rideloop.com
Subject: Changes to our prices
Date: 1 February

Dear member,

From 1 March, the price of our hourly rentals will rise ___(1)___ €8 to €9. This is the first price change in four years, and it will help us ___(2)___ more electric cars to our fleet. ___(3)___

Members who pay for a yearly plan will not be affected ___(4)___ their plan ends. As always, you can see all of our prices in the app.

Thank you for driving with RideLoop.`;

const TOWN_PHOTO_CONTEST_ARTICLE = `Article

The town of Marlow Bridge is inviting residents to take part in its first photography contest. Photos must show a place in the town and must ___(1)___ by 15 June. A team of three local artists will choose the winners. ___(2)___

The best photos will be printed and ___(3)___ in the town hall during the summer. "We want people to see their town in a new way," said Mayor Ruth Ambler, ___(4)___ came up with the idea.`;

const HOTEL_POOL_LETTER = `Dear Guest,

Thank you for choosing the Harbour Lantern Hotel. We would like to inform you that our swimming pool will be closed ___(1)___ 10 to 24 October for cleaning and repairs. ___(2)___ Guests may use the pool at the Waterfront Sports Club, just five minutes away, free of charge. Simply show your room key at the ___(3)___.

We are sorry for this temporary change and hope that it will not affect your stay. If you have any questions, our front desk staff will be pleased to ___(4)___ you.

Best regards,
Harbour Lantern Hotel Management`;

const RECYCLING_BINS_MEMO = `MEMO
To: All staff
From: Office Services
Date: 8 April
Re: New recycling bins

Next week, new recycling bins ___(1)___ on every floor. There will be separate bins for paper, plastic, and glass. ___(2)___ Please do not put food waste in any of these bins, ___(3)___ it makes the other materials impossible to recycle.

The old bins will be collected on Friday. We thank you in advance for your ___(4)___ with this change.`;

const GARDEN_CENTER_JOBS_NOTICE = `Greenleaf Garden Center — Now Hiring

Greenleaf Garden Center is looking for friendly, ___(1)___ people to join our team for the busy spring season. Positions are available in our plant section and at the checkout. No experience is necessary, ___(2)___ a love of plants is a plus.

Successful applicants will work at least twenty hours per week, including some weekends. ___(3)___ To apply, please fill out the form on our Web site and ___(4)___ it to jobs@greenleafgc.com.

We look forward to hearing from you!`;

const PHONE_UPGRADE_EMAIL = `To: Marcus Webb
From: Telvoy Mobile
Subject: Your phone upgrade
Date: 12 November

Dear Mr. Webb,

According to our records, you are now ___(1)___ for a free phone upgrade. You can choose any phone from our Silver range without paying anything extra. ___(2)___

To place your order, simply log in to your account and click on "Upgrade." Your new phone will be delivered within three working days. Please remember ___(3)___ your old phone in the envelope ___(4)___ with your new one.

Best wishes,
Telvoy Mobile Customer Care`;

const MARATHON_ROAD_CLOSURE_NOTICE = `Notice: City Marathon Road Closures

On Sunday, 22 September, the annual Kelso City Marathon will take place. Several streets in the city center will be closed to cars from 6 A.M. ___(1)___ 2 P.M. Buses on routes 4 and 9 will follow a ___(2)___ route on that day. ___(3)___

Residents are advised to plan their trips in advance. Spectators are welcome to cheer on the runners, but they are asked to stay ___(4)___ the barriers at all times.

For more information, visit www.kelsomarathon.org.`;

const BIKE_SERVICE_REMINDER_EMAIL = `To: Tomás Herrera
From: Spoke & Chain Cycle Repairs
Subject: Time for your bike's check-up
Date: 2 April

Dear Mr. Herrera,

It has been twelve months since your last bike service with us. To keep your bike safe and ___(1)___ to ride, we recommend a check-up once a year. ___(2)___

You can ___(3)___ an appointment online or simply drop by the shop. A standard service takes about two hours, and we ___(4)___ you by text message when your bike is ready.

See you soon,
The Spoke & Chain Team`;

const COMMUNITY_RADIO_ANNIVERSARY = `Wave 98.4 Community Radio

Wave 98.4 is celebrating ten years on the air! To mark the occasion, we are inviting listeners to ___(1)___ their favorite memories of the station. Short messages ___(2)___ during a special program on Saturday, 5 October. ___(3)___

You can leave a voice message on 555-0198 or write to us at hello@wave984.org. We are also looking for volunteers to help us ___(4)___ the anniversary party at the community center.

Thank you for listening!`;

const RAIL_APP_ARTICLE = `Article

Starting next month, passengers on the Coastline Rail network will be able to ___(1)___ their tickets on a new smartphone app. The app will also show live information about delays and platform changes. ___(2)___

"Many of our passengers have asked for this," said Coastline's director, Femi Adeyemi. "It will make traveling much ___(3)___." Paper tickets will still be sold at stations, ___(4)___ the company hopes that most travelers will switch to the app within two years.`;

const OFFICE_MOVE_MEMO = `MEMO
To: Marketing Department
From: Lucía Ferrer, Office Manager
Date: 19 June
Subject: Office move

As you know, our department ___(1)___ to the fifth floor next week. Movers will arrive on Thursday at 6 P.M. ___(2)___, please pack your personal items in the boxes provided before you leave work that day.

Each box should be ___(3)___ with your name and new desk number. ___(4)___ Your computers will be moved by the IT team, so please do not pack them.

Thank you for your help.`;

const FARMERS_MARKET_WEB_PAGE = `www.ashgrovefarmersmarket.org

The Ash Grove Farmers' Market is open every Saturday from 8 A.M. to 1 P.M. in the parking lot of Ash Grove Elementary School. All of our sellers grow or make their products ___(1)___ fifty kilometers of the market. ___(2)___

This season, we are also introducing cooking ___(3)___ by local chefs. Each demonstration lasts about thirty minutes and shows how to prepare a simple meal using fresh market products. Visitors who ___(4)___ a demonstration will receive a recipe card to take home.`;

const DATABASE_TRAINING_EMAIL = `To: All sales staff
From: Daniel Osei, IT Department
Subject: Training on the new customer database
Date: 10 January

Hello everyone,

Our new customer database will go live on 1 February. To make the change as smooth as possible, we ___(1)___ two training sessions next week. Each session will last ninety minutes and ___(2)___ the main features of the system. ___(3)___

Please reply to this e-mail by Friday to let me know which session you prefer. Sessions are limited to fifteen people, so places will be given on a first-come, first-served ___(4)___.

Best,
Daniel`;

const CHARITY_RUN_THANK_YOU_LETTER = `Dear Ms. Moreau,

Thank you for taking part in this year's River Run for Children. ___(1)___ to runners like you, we raised more than €40,000 for the children's ward at St. Agnes Hospital. ___(2)___

The money will be used to buy new games and books, and to ___(3)___ the waiting room. We will send all participants a short report in December showing how the funds ___(4)___.

We hope to see you again next year!

With gratitude,
Hugo Lambert, Event Director`;

const FIRE_ALARM_TEST_NOTICE = `Notice to Residents of Birchwood Court

Please be aware that the fire alarm system in our building will be tested on Wednesday, 6 March. ___(1)___ the test, the alarms will ring several times between 9 A.M. and 1 P.M. ___(2)___

The test is required every year and helps us find small problems before they become ___(3)___ ones. If you notice anything ___(4)___ with the alarm in your apartment after Wednesday, please call the building manager immediately.

Thank you for your understanding.`;

const PAPER_ORDER_DELAY_EMAIL = `To: Ingrid Holm
From: Orders, Bellweather Paper Supplies
Subject: Order #4471
Date: 15 May

Dear Ms. Holm,

Thank you for your recent order of printer paper and envelopes. Unfortunately, the envelopes you ___(1)___ are currently out of stock. We expect to receive more on 22 May. ___(2)___

If you prefer, we can send the paper now and the envelopes ___(3)___. There will be no extra delivery charge. Please let us know which option you prefer by ___(4)___ to this e-mail.

We apologize for the delay.
Bellweather Paper Supplies`;

const SCULPTURE_OPENING_INVITATION = `You are invited!

The Quayside Gallery is pleased to invite you to the opening of "Salt and Stone," an exhibition of ___(1)___ by the artist Amara Diop. The opening will take place on Friday, 8 November, at 6 P.M. ___(2)___

Ms. Diop will give a short talk about her work at 7 P.M. Light refreshments ___(3)___. Admission is free, but we ask that you reply by 1 November ___(4)___ we can prepare enough food and drinks.

Quayside Gallery, 14 Dock Road`;

const THEATER_LOST_PROPERTY_NOTICE = `Lost Property at the Orbit Theater

Items found in the theater after a performance are taken to the box office, where they are kept for thirty days. ___(1)___ this period, items that have not been claimed are given to charity. ___(2)___

To claim an item, please visit the box office during opening hours and ___(3)___ a description of what you lost. For valuable items such as phones or wallets, you may be asked to show ___(4)___ identification.`;

const INTERNSHIP_OFFER_EMAIL = `To: Kenji Watanabe
From: Human Resources, Altamira Engineering
Subject: Summer internship
Date: 28 March

Dear Mr. Watanabe,

We are delighted to offer you a place in our summer internship program. The internship ___(1)___ for ten weeks, from 2 June to 8 August, and you will be part of our water systems team. ___(2)___

Please confirm your ___(3)___ of this offer by 10 April. Once we receive your reply, we will send you more information about your first day, including ___(4)___ to our office.

Congratulations again,
Sofia Mendes, HR Assistant`;

const YOGA_SCHEDULE_EMAIL = `To: Members, Lotus Point Yoga
From: studio@lotuspointyoga.com
Subject: New class schedule
Date: 30 August

Dear members,

Our autumn schedule ___(1)___ on Monday, 9 September. We have added two early morning classes for members who prefer to exercise ___(2)___ they go to work. ___(3)___

Please note that the Wednesday evening class will now start at 7:30 P.M. instead of 7 P.M. As always, you can reserve your place in ___(4)___ through our app.

See you on the mat!
The Lotus Point Team`;

const PRINTER_SAFETY_NOTICE = `Important Safety Notice

Brightline Electronics has found a problem with some of its HomePrint 200 printers sold between March and May. In rare cases, the power cable can become very hot. ___(1)___ no injuries have been reported, we are asking customers to stop using these printers immediately. ___(2)___

To find out whether your printer is ___(3)___, check the serial number on the back. If it begins with "HP2-03," "HP2-04," or "HP2-05," please contact us. We will send you a new cable free of charge. We ___(4)___ for any inconvenience.`;

const CITY_TREES_ARTICLE = `Article

The city of Varenholt will plant 2,000 new trees this autumn as part of its plan to fight the ___(1)___ heat of recent summers. Most of the trees will be planted along busy streets and in school playgrounds. ___(2)___

Residents can also ask for a free tree to be planted in front of their home. Requests must be sent to the city's parks department by 30 September, and they will be handled in the order they are ___(3)___. "Trees give shade, clean the air, and make neighborhoods nicer to live in," said councilor Ines Duarte. "We hope residents will help us ___(4)___ care of them."`;

const FURNITURE_SURVEY_EMAIL = `To: Valued customer
From: Northline Home Furnishings
Subject: Tell us what you think
Date: 6 July

Dear customer,

Thank you for your recent purchase at Northline Home Furnishings. We are always looking for ways to improve, so we would be grateful if you could ___(1)___ a short online survey about your experience. It should take no more than five minutes. ___(2)___

As a thank-you, everyone who completes the survey ___(3)___ a voucher for 10 percent off their next purchase. The survey will be available until 31 July. We look forward to ___(4)___ your opinion.`;

const AIRPORT_PARKING_WEB_PAGE = `Fairhaven Airport — Parking Information

Fairhaven Airport offers three parking areas for travelers. The Short Stay car park is located ___(1)___ next to the terminal and is ideal for drop-offs and short visits. The Long Stay car park is a five-minute bus ride away. ___(2)___

Spaces can be ___(3)___ online up to twelve months before your trip. Booking ahead is not required, but drivers who book online pay up to 40 percent less ___(4)___ those who pay at the gate.`;

const EMPLOYEE_AWARD_MEMO = `To: All employees
From: Grace Okonkwo, Managing Director
Subject: Employee of the Year
Date: 12 December

I am delighted to announce that this year's Employee of the Year award goes to Mateo Salazar from our customer support team. Mateo was ___(1)___ from more than forty nominations sent in by his colleagues. ___(2)___

Under his leadership, the average time needed to answer a customer call fell by half. Mateo will receive his award at the end-of-year dinner on 19 December. Please join me in ___(3)___ him on this well-___(4)___ success.`;

const COOKING_CLASS_CANCELED_EMAIL = `To: Hannah Fischer
From: Saffron Table Cooking School
Subject: Your class on 18 October
Date: 14 October

Dear Ms. Fischer,

We regret to inform you that the Thai cooking class you ___(1)___ for 18 October has been canceled because our instructor is ill. ___(2)___

You can choose to join the same class on 25 October or receive a full refund. If you would like a refund, the money ___(3)___ to your card within five working days. Please let us know your choice by ___(4)___ this e-mail.

We are very sorry for the inconvenience.
Saffron Table Cooking School`;

const PARK_CLEANUP_FLYER = `Join the Elm Park Clean-Up Day!

On Saturday, 20 April, volunteers will meet at the Elm Park fountain at 9 A.M. to pick up litter and plant flowers. Gloves, bags, and tools will be ___(1)___ by the city. ___(2)___

The event usually ___(3)___ about three hours. Afterwards, all volunteers are invited to a free lunch at the Elm Park Café. Children are welcome, ___(4)___ they must be accompanied by an adult.

Questions? Call Leo Brandt at 555-0172.`;

const BOOKSTORE_AUTHOR_EVENING = `Pageturner Books — Author Evening

On Thursday, 3 April, at 7 P.M., Pageturner Books will welcome the novelist Ewa Kowal, ___(1)___ new book, The Lighthouse Keeper's Daughter, was published last month. Ms. Kowal will read from the book and answer questions from the audience. ___(2)___

Entry is free, but there are only sixty chairs, so we recommend that you ___(3)___ a seat in advance by calling the store. Copies of the book will be available for ___(4)___ on the night.`;

const LANGUAGE_CAFE_NOTICE = `Language Café at the Corner Hub

Would you like to practice a foreign language in a ___(1)___ setting? Every Tuesday evening, the Corner Hub hosts a Language Café where people meet to talk in English, Spanish, French, and Japanese. ___(2)___

Each table has a host who ___(3)___ the conversation and helps beginners when they get stuck. There is no fee to participate, ___(4)___ guests are encouraged to buy a drink from the café.

Doors open at 6:30 P.M.`;

const HELP_DESK_TICKET_EMAIL = `To: Rosa Lindgren
From: Help Desk
Subject: Ticket #2291 — Laptop screen
Date: 4 March

Dear Ms. Lindgren,

Thank you for contacting the Help Desk about the ___(1)___ on your laptop screen. Our technician examined the laptop this morning and found that the screen ___(2)___ to be replaced. ___(3)___

A new screen has been ordered and should arrive on Thursday. In the meantime, you may borrow a laptop from the Help Desk. Please bring your ID card when you come to ___(4)___ it up.

Regards,
Help Desk Team`;

const FESTIVAL_VOLUNTEERS_EMAIL = `To: Festival volunteers
From: Nadia Rahimi, Volunteer Coordinator
Subject: Your schedule
Date: 20 July

Dear volunteers,

Thank you again for offering to help at the Riverbank Music Festival. Your ___(1)___ schedules are attached to this e-mail. Please check them carefully and contact me if there are any problems. ___(2)___

All volunteers must attend a short meeting on Friday at 5 P.M. at the main entrance, ___(3)___ you will receive your T-shirt and badge. During the festival, volunteers can eat for free at the staff tent. Please remember that you ___(4)___ wear your badge at all times.

Best regards,
Nadia`;

const RC8 = [
  createQuestion({
    section: 'rc8',
    difficulty: 'normal',
    category: 'prepositions',
    text: MEMO,
    question: "Blank (1)",
    answers: ["in", "at", "on", "to"],
    correct_index: 0,
    justification: "We use \"in\" for a zone inside a building: in the east wing.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'hard',
    category: 'wordForms',
    text: MEMO,
    question: "Blank (2)",
    answers: ["inconvenient", "inconvenience", "inconveniently", "inconvenienced"],
    correct_index: 1,
    justification: "After \"any\" we need a noun. \"We apologize for any inconvenience\" is a fixed expression.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: MEMO,
    question: "Blank (3): which sentence fits best?",
    answers: ["The elevator was installed in 1998.", "Please submit your expense reports by Friday.", "Thank you for your patience and understanding.", "The cafeteria will serve pizza on Tuesday."],
    correct_index: 2,
    justification: "A notice about a problem usually ends by thanking the readers. The other sentences are off-topic.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'normal',
    category: 'verbTenses',
    text: BANK_EMAIL,
    question: "Blank (2)",
    answers: ["not", "no", "does not", "do not"],
    correct_index: 3,
    justification: "\"Do not hesitate to contact us\" is an imperative: do not + verb.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'hard',
    category: 'gerunds',
    text: BANK_EMAIL,
    question: "Blank (1)",
    answers: ["opening", "open", "to open", "opened"],
    correct_index: 0,
    justification: "\"Thank you for\" + -ing. \"For\" is a preposition, so the verb takes -ing.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: BANK_EMAIL,
    question: "Where does this sentence fit best? \"Your PIN code will be sent separately for security reasons.\"",
    answers: ["Right after \"Dear Mr. Lopez,\"", "Right after \"...within five business days.\"", "Right before \"Thank you for...\"", "At the very end of the email"],
    correct_index: 1,
    justification: "It talks about something sent by mail, so it goes right after the sentence about the card arriving by mail.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'normal',
    category: 'vocabulary',
    text: COWORKING_KITCHEN_NOTICE,
    question: "Blank (1)",
    answers: ["empty", "finished", "absent", "closed"],
    correct_index: 3,
    justification: "Open on weekdays, closed on weekends.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'hard',
    category: 'passive',
    text: COWORKING_KITCHEN_NOTICE,
    question: "Blank (2)",
    answers: ["will be thrown away", "will throw away", "is throwing away", "has thrown away"],
    correct_index: 0,
    justification: "The item doesn't throw: it is thrown away by the staff (passive, future).",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: COWORKING_KITCHEN_NOTICE,
    question: "Blank (3): which sentence fits best?",
    answers: ["Our cleaning staff are hired through a local agency.", "Membership fees will not change this year.", "If you need to keep something longer, please ask at the front desk.", "The second floor also has two quiet phone booths."],
    correct_index: 2,
    justification: "It follows the five-day rule: what to do if you need more time.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'normal',
    category: 'prepositions',
    text: COWORKING_KITCHEN_NOTICE,
    question: "Blank (4)",
    answers: ["since", "before", "during", "until"],
    correct_index: 1,
    justification: "Wash your cup first, then leave: before leaving.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'normal',
    category: 'vocabulary',
    text: SCIENCE_MUSEUM_MEMBERSHIP_EMAIL,
    question: "Blank (1)",
    answers: ["exchange", "expand", "expire", "explore"],
    correct_index: 2,
    justification: "A membership that ends on a date = it expires.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'hard',
    category: 'connectors',
    text: SCIENCE_MUSEUM_MEMBERSHIP_EMAIL,
    question: "Blank (2)",
    answers: ["Instead", "In addition", "However", "Otherwise"],
    correct_index: 1,
    justification: "One more advantage is added (a free pass): in addition.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: SCIENCE_MUSEUM_MEMBERSHIP_EMAIL,
    question: "Blank (3): which sentence fits best?",
    answers: ["It can be used for any exhibition until the end of the year.", "The museum will be closed to the public all next year.", "Thank you for visiting our Web site.", "Our new café serves lunch every day."],
    correct_index: 0,
    justification: "\"It\" = the free guest pass mentioned just before.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'normal',
    category: 'vocabulary',
    text: SCIENCE_MUSEUM_MEMBERSHIP_EMAIL,
    question: "Blank (4)",
    answers: ["upgrade", "upset", "uphold", "update"],
    correct_index: 3,
    justification: "A new address → we change our records: update.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'normal',
    category: 'vocabulary',
    text: BAKERY_LOYALTY_CARD_AD,
    question: "Blank (1)",
    answers: ["stack", "stamp", "stare", "stuff"],
    correct_index: 1,
    justification: "\"After nine stamps\": each drink, they stamp the card.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'hard',
    category: 'wordForms',
    text: BAKERY_LOYALTY_CARD_AD,
    question: "Blank (2)",
    answers: ["recently", "recent", "more recent", "recency"],
    correct_index: 0,
    justification: "Before the participle \"opened\", we need an adverb: recently.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: BAKERY_LOYALTY_CARD_AD,
    question: "Blank (3): which sentence fits best?",
    answers: ["Vane Street is closed to cars on Sundays.", "We are looking for an experienced pastry chef.", "Please return the form with your payment.", "Stamps from both shops can be added to the same card."],
    correct_index: 3,
    justification: "It continues the idea of using the card in both shops.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'hard',
    category: 'passive',
    text: BAKERY_LOYALTY_CARD_AD,
    question: "Blank (4)",
    answers: ["claiming", "has claimed", "can be claimed", "can claim"],
    correct_index: 2,
    justification: "A drink doesn't claim: it can be claimed (passive).",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'normal',
    category: 'verbTenses',
    text: LIBRARY_WIFI_NOTICE,
    question: "Blank (1)",
    answers: ["was unavailable", "had been unavailable", "has been unavailable", "will be unavailable"],
    correct_index: 3,
    justification: "Tuesday 14 May is in the future (\"will offer\", \"before Tuesday\"): will be.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: LIBRARY_WIFI_NOTICE,
    question: "Blank (2): which sentence fits best?",
    answers: ["Please return borrowed laptops on time.", "Several new books arrived last week.", "However, they will not be connected to the internet.", "The library is open seven days a week."],
    correct_index: 2,
    justification: "The computers work, but without internet: \"However\" shows this limit.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'normal',
    category: 'connectors',
    text: LIBRARY_WIFI_NOTICE,
    question: "Blank (3)",
    answers: ["because", "although", "whereas", "unless"],
    correct_index: 0,
    justification: "Print before Tuesday → the reason: the printers use the same network.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'normal',
    category: 'wordForms',
    text: LIBRARY_WIFI_NOTICE,
    question: "Blank (4)",
    answers: ["rely", "reliable", "reliably", "reliability"],
    correct_index: 1,
    justification: "After \"more\" and before the noun \"connections\": an adjective (reliable).",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'normal',
    category: 'vocabulary',
    text: FOOD_CONFERENCE_SPEAKER_LETTER,
    question: "Blank (1)",
    answers: ["scattered", "schemed", "scheduled", "screened"],
    correct_index: 2,
    justification: "A talk planned for a day and time = scheduled.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: FOOD_CONFERENCE_SPEAKER_LETTER,
    question: "Blank (2): which sentence fits best?",
    answers: ["Your train ticket will also be paid for by the association.", "The conference was first held in 1996.", "Our members include small farms and large factories.", "Tampere is known for its many lakes."],
    correct_index: 0,
    justification: "It continues the costs (hotel, then train), and prepares \"send us your travel receipts\".",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'hard',
    category: 'vocabulary',
    text: FOOD_CONFERENCE_SPEAKER_LETTER,
    question: "Blank (3)",
    answers: ["reinforce", "reimburse", "reject", "recruit"],
    correct_index: 1,
    justification: "Receipts → they pay the money back: reimburse.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'normal',
    category: 'wordForms',
    text: FOOD_CONFERENCE_SPEAKER_LETTER,
    question: "Blank (4)",
    answers: ["inform", "information", "informatively", "informative"],
    correct_index: 3,
    justification: "\"Find something + adjective\": informative.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'normal',
    category: 'prepositions',
    text: CAR_SHARING_PRICE_EMAIL,
    question: "Blank (1)",
    answers: ["of", "since", "between", "from"],
    correct_index: 3,
    justification: "\"Rise from A to B.\"",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'hard',
    category: 'vocabulary',
    text: CAR_SHARING_PRICE_EMAIL,
    question: "Blank (2)",
    answers: ["add", "adapt", "adopt", "admit"],
    correct_index: 0,
    justification: "\"Add something to the fleet\" = put more cars in it.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: CAR_SHARING_PRICE_EMAIL,
    question: "Blank (3): which sentence fits best?",
    answers: ["You can return the car to any of our parking spots.", "By next year, half of our cars will be electric.", "Our office is closed on public holidays.", "We are sorry that your last trip was delayed."],
    correct_index: 1,
    justification: "It continues the idea of more electric cars.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'hard',
    category: 'connectors',
    text: CAR_SHARING_PRICE_EMAIL,
    question: "Blank (4)",
    answers: ["since", "although", "until", "so"],
    correct_index: 2,
    justification: "Not affected up to the end of their plan: until.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'hard',
    category: 'passive',
    text: TOWN_PHOTO_CONTEST_ARTICLE,
    question: "Blank (1)",
    answers: ["sent", "sending", "be sent", "send"],
    correct_index: 2,
    justification: "After \"must\": the base form. Photos are sent by people: be sent.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: TOWN_PHOTO_CONTEST_ARTICLE,
    question: "Blank (2): which sentence fits best?",
    answers: ["Each winner will receive a gift card from a local bookshop.", "The town hall was built more than two centuries ago.", "Residents can vote online for the best bakery.", "Please bring your own camera to the class."],
    correct_index: 0,
    justification: "After \"choose the winners\": what the winners get.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'normal',
    category: 'vocabulary',
    text: TOWN_PHOTO_CONTEST_ARTICLE,
    question: "Blank (3)",
    answers: ["disposed", "displayed", "deployed", "delayed"],
    correct_index: 1,
    justification: "Photos shown to the public = displayed.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'hard',
    category: 'pronouns',
    text: TOWN_PHOTO_CONTEST_ARTICLE,
    question: "Blank (4)",
    answers: ["which", "whose", "whom", "who"],
    correct_index: 3,
    justification: "A person (the mayor) who is the subject of \"came up with\": who.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'normal',
    category: 'prepositions',
    text: HOTEL_POOL_LETTER,
    question: "Blank (1)",
    answers: ["since", "during", "between", "from"],
    correct_index: 3,
    justification: "\"From 10 to 24 October\" (\"between\" would need \"and\").",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: HOTEL_POOL_LETTER,
    question: "Blank (2): which sentence fits best?",
    answers: ["We hope you enjoyed your stay with us.", "During this period, we have made other arrangements for our guests.", "The hotel restaurant serves breakfast until 10 A.M.", "Our rooms have recently been redecorated."],
    correct_index: 1,
    justification: "It introduces the solution that follows (the other pool).",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'normal',
    category: 'vocabulary',
    text: HOTEL_POOL_LETTER,
    question: "Blank (3)",
    answers: ["entrant", "enterprise", "entrance", "entertainer"],
    correct_index: 2,
    justification: "You show your key at the door of the club: the entrance.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'normal',
    category: 'vocabulary',
    text: HOTEL_POOL_LETTER,
    question: "Blank (4)",
    answers: ["assist", "consist", "insist", "resist"],
    correct_index: 0,
    justification: "\"Assist\" = help.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'hard',
    category: 'passive',
    text: RECYCLING_BINS_MEMO,
    question: "Blank (1)",
    answers: ["are placing", "will be placed", "placed", "will place"],
    correct_index: 1,
    justification: "The bins don't place: they will be placed (future passive).",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: RECYCLING_BINS_MEMO,
    question: "Blank (2): which sentence fits best?",
    answers: ["Our new manager will start next month.", "The cafeteria will close early on Friday.", "The printers on the third floor have been repaired.", "Each bin will have a different color to help you choose the right one."],
    correct_index: 3,
    justification: "It continues the description of the three bins.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'normal',
    category: 'connectors',
    text: RECYCLING_BINS_MEMO,
    question: "Blank (3)",
    answers: ["although", "unless", "because", "so"],
    correct_index: 2,
    justification: "It gives the reason: food makes recycling impossible.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'hard',
    category: 'vocabulary',
    text: RECYCLING_BINS_MEMO,
    question: "Blank (4)",
    answers: ["cooperation", "competition", "corporation", "conversation"],
    correct_index: 0,
    justification: "\"Thank you for your cooperation\" = for your help.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'normal',
    category: 'wordForms',
    text: GARDEN_CENTER_JOBS_NOTICE,
    question: "Blank (1)",
    answers: ["energetically", "energize", "energy", "energetic"],
    correct_index: 3,
    justification: "Before the noun \"people\", like \"friendly\": an adjective (energetic).",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'normal',
    category: 'connectors',
    text: GARDEN_CENTER_JOBS_NOTICE,
    question: "Blank (2)",
    answers: ["but", "or", "so", "because"],
    correct_index: 0,
    justification: "Not necessary, yet it helps: a contrast = but.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: GARDEN_CENTER_JOBS_NOTICE,
    question: "Blank (3): which sentence fits best?",
    answers: ["Please bring your receipt if you wish to return a plant.", "Our café serves homemade soup every day.", "All new staff will receive two days of paid training.", "Our prices are the lowest in the region."],
    correct_index: 2,
    justification: "It continues the information for new employees.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'normal',
    category: 'vocabulary',
    text: GARDEN_CENTER_JOBS_NOTICE,
    question: "Blank (4)",
    answers: ["spend", "send", "bend", "lend"],
    correct_index: 1,
    justification: "\"Send it to\" an e-mail address.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'hard',
    category: 'vocabulary',
    text: PHONE_UPGRADE_EMAIL,
    question: "Blank (1)",
    answers: ["eligible", "edible", "legible", "elegant"],
    correct_index: 0,
    justification: "\"Eligible for\" = you have the right to get it.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: PHONE_UPGRADE_EMAIL,
    question: "Blank (2): which sentence fits best?",
    answers: ["Your last bill was paid on time.", "We are sorry to hear that you want to cancel your contract.", "Our stores are open until 9 P.M. on Thursdays.", "Phones from our Gold range are also available for a small extra fee."],
    correct_index: 3,
    justification: "It continues the choice of phones: Silver free, Gold with a fee.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'hard',
    category: 'gerunds',
    text: PHONE_UPGRADE_EMAIL,
    question: "Blank (3)",
    answers: ["returning", "returned", "to return", "return"],
    correct_index: 2,
    justification: "\"Remember to do\" = don't forget a future action. (\"remember doing\" = a memory)",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'hard',
    category: 'wordForms',
    text: PHONE_UPGRADE_EMAIL,
    question: "Blank (4)",
    answers: ["including", "included", "inclusion", "includes"],
    correct_index: 1,
    justification: "\"The envelope (that is) included with your phone\": the past participle.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'normal',
    category: 'prepositions',
    text: MARATHON_ROAD_CLOSURE_NOTICE,
    question: "Blank (1)",
    answers: ["by", "for", "until", "since"],
    correct_index: 2,
    justification: "\"From 6 A.M. until 2 P.M.\"",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'hard',
    category: 'vocabulary',
    text: MARATHON_ROAD_CLOSURE_NOTICE,
    question: "Blank (2)",
    answers: ["contemporary", "temporary", "tempting", "temperate"],
    correct_index: 1,
    justification: "A route for one day only = temporary.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: MARATHON_ROAD_CLOSURE_NOTICE,
    question: "Blank (3): which sentence fits best?",
    answers: ["A map of the new bus stops can be found on the city's Web site.", "The race was won by a local runner last year.", "Our bus drivers have all completed a safety course.", "Parking downtown is free on public holidays."],
    correct_index: 0,
    justification: "It continues the information about the buses.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'normal',
    category: 'prepositions',
    text: MARATHON_ROAD_CLOSURE_NOTICE,
    question: "Blank (4)",
    answers: ["besides", "beyond", "beneath", "behind"],
    correct_index: 3,
    justification: "Spectators stay on their side of the barriers: behind.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'normal',
    category: 'wordForms',
    text: BIKE_SERVICE_REMINDER_EMAIL,
    question: "Blank (1)",
    answers: ["enjoyment", "enjoyably", "enjoyable", "enjoy"],
    correct_index: 2,
    justification: "\"Safe and ___ to ride\": two adjectives (safe, enjoyable).",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: BIKE_SERVICE_REMINDER_EMAIL,
    question: "Blank (2): which sentence fits best?",
    answers: ["Your new helmet has been shipped.", "The city plans to build more bike lanes next year.", "Please pay the remaining amount before Friday.", "During spring, we also offer a free tire check with every service."],
    correct_index: 3,
    justification: "It continues the idea of the yearly check-up (an extra offer).",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'normal',
    category: 'vocabulary',
    text: BIKE_SERVICE_REMINDER_EMAIL,
    question: "Blank (3)",
    answers: ["bake", "book", "boost", "bound"],
    correct_index: 1,
    justification: "\"Book an appointment\" = reserve it.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'normal',
    category: 'verbTenses',
    text: BIKE_SERVICE_REMINDER_EMAIL,
    question: "Blank (4)",
    answers: ["will notify", "were notifying", "notified", "had notified"],
    correct_index: 0,
    justification: "When the bike is ready (in the future): will notify.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'normal',
    category: 'vocabulary',
    text: COMMUNITY_RADIO_ANNIVERSARY,
    question: "Blank (1)",
    answers: ["shade", "shave", "share", "shape"],
    correct_index: 2,
    justification: "\"Share memories\" = tell them to others.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'hard',
    category: 'passive',
    text: COMMUNITY_RADIO_ANNIVERSARY,
    question: "Blank (2)",
    answers: ["reading", "will be read", "have read", "will read"],
    correct_index: 1,
    justification: "Messages don't read: they will be read on air (future passive).",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: COMMUNITY_RADIO_ANNIVERSARY,
    question: "Blank (3): which sentence fits best?",
    answers: ["Our new studio was built by a local company.", "Tickets for the concert are now sold out.", "Please renew your subscription before it expires.", "The program will start at 10 A.M. and last for three hours."],
    correct_index: 3,
    justification: "It gives details about the special program mentioned just before.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'normal',
    category: 'vocabulary',
    text: COMMUNITY_RADIO_ANNIVERSARY,
    question: "Blank (4)",
    answers: ["organize", "originate", "orient", "ornament"],
    correct_index: 0,
    justification: "\"Organize a party\" = prepare it.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'normal',
    category: 'vocabulary',
    text: RAIL_APP_ARTICLE,
    question: "Blank (1)",
    answers: ["publish", "purchase", "purify", "pursue"],
    correct_index: 1,
    justification: "\"Purchase tickets\" = buy them.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: RAIL_APP_ARTICLE,
    question: "Blank (2): which sentence fits best?",
    answers: ["Users will also receive a message if their train is canceled.", "Coastline Rail is hiring new drivers.", "The company was founded more than a century ago.", "The new station will open in May."],
    correct_index: 0,
    justification: "It continues the list of what the app does (live information).",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'hard',
    category: 'comparatives',
    text: RAIL_APP_ARTICLE,
    question: "Blank (3)",
    answers: ["easily", "easy", "ease", "easier"],
    correct_index: 3,
    justification: "\"Much\" + a comparative: much easier.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'normal',
    category: 'connectors',
    text: RAIL_APP_ARTICLE,
    question: "Blank (4)",
    answers: ["because", "or", "but", "so"],
    correct_index: 2,
    justification: "Paper tickets stay, yet the company wants people to use the app: but.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'hard',
    category: 'verbTenses',
    text: OFFICE_MOVE_MEMO,
    question: "Blank (1)",
    answers: ["moved", "is moving", "has moved", "had moved"],
    correct_index: 1,
    justification: "A planned future action (\"next week\"): the present continuous.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'hard',
    category: 'connectors',
    text: OFFICE_MOVE_MEMO,
    question: "Blank (2)",
    answers: ["Instead", "Nevertheless", "Therefore", "Otherwise"],
    correct_index: 2,
    justification: "The movers come that evening → so you must pack before: therefore.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'normal',
    category: 'vocabulary',
    text: OFFICE_MOVE_MEMO,
    question: "Blank (3)",
    answers: ["lifted", "listed", "leveled", "labeled"],
    correct_index: 3,
    justification: "Write your name on the box = it is labeled.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: OFFICE_MOVE_MEMO,
    question: "Blank (4): which sentence fits best?",
    answers: ["Extra boxes can be picked up from my office.", "Our sales grew by ten percent last year.", "Please submit your vacation requests by Friday.", "The new marketing campaign starts in July."],
    correct_index: 0,
    justification: "It continues the packing instructions (the boxes).",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'hard',
    category: 'prepositions',
    text: FARMERS_MARKET_WEB_PAGE,
    question: "Blank (1)",
    answers: ["inside", "within", "across", "among"],
    correct_index: 1,
    justification: "\"Within fifty kilometers of\" = not farther than.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: FARMERS_MARKET_WEB_PAGE,
    question: "Blank (2): which sentence fits best?",
    answers: ["Parking in the city center costs €2 per hour.", "The school will be closed in August.", "This means that the food you buy is always fresh and local.", "Our sellers must pay their fees by credit card."],
    correct_index: 2,
    justification: "It explains what \"within fifty kilometers\" means for the buyer.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'normal',
    category: 'vocabulary',
    text: FARMERS_MARKET_WEB_PAGE,
    question: "Blank (3)",
    answers: ["demonstrations", "demands", "directions", "deposits"],
    correct_index: 0,
    justification: "The next sentence says \"Each demonstration\".",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'hard',
    category: 'subjectVerb',
    text: FARMERS_MARKET_WEB_PAGE,
    question: "Blank (4)",
    answers: ["to attend", "attending", "attends", "attend"],
    correct_index: 3,
    justification: "\"Visitors who...\": plural, so attend (no -s).",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'normal',
    category: 'verbTenses',
    text: DATABASE_TRAINING_EMAIL,
    question: "Blank (1)",
    answers: ["have held", "will hold", "held", "were holding"],
    correct_index: 1,
    justification: "\"Next week\" = the future: will hold.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'hard',
    category: 'vocabulary',
    text: DATABASE_TRAINING_EMAIL,
    question: "Blank (2)",
    answers: ["cover", "recover", "uncover", "discover"],
    correct_index: 0,
    justification: "A session that \"covers\" features = talks about them.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: DATABASE_TRAINING_EMAIL,
    question: "Blank (3): which sentence fits best?",
    answers: ["Our sales team won an award last year.", "The old database was installed in 2012.", "The first one is on Tuesday morning, and the second on Thursday afternoon.", "Please print the attached invoice."],
    correct_index: 2,
    justification: "It gives the dates of the two sessions, and prepares \"which session you prefer\".",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'hard',
    category: 'vocabulary',
    text: DATABASE_TRAINING_EMAIL,
    question: "Blank (4)",
    answers: ["basin", "bias", "base", "basis"],
    correct_index: 3,
    justification: "Fixed expression: \"on a first-come, first-served basis\".",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'hard',
    category: 'connectors',
    text: CHARITY_RUN_THANK_YOU_LETTER,
    question: "Blank (1)",
    answers: ["Because", "Since", "Thanks", "As"],
    correct_index: 2,
    justification: "Fixed expression: \"Thanks to\" + a noun = because of (positive).",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: CHARITY_RUN_THANK_YOU_LETTER,
    question: "Blank (2): which sentence fits best?",
    answers: ["Please choose the size of your race T-shirt.", "The hospital is looking for new nurses.", "Registration for the race closes on Friday.", "This is twice the amount we collected last year."],
    correct_index: 3,
    justification: "It comments on the amount just given (€40,000). The race is over, so registration makes no sense.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'normal',
    category: 'vocabulary',
    text: CHARITY_RUN_THANK_YOU_LETTER,
    question: "Blank (3)",
    answers: ["redecorate", "repeat", "resign", "replace"],
    correct_index: 0,
    justification: "Make a room nicer (paint, furniture) = redecorate.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'hard',
    category: 'passive',
    text: CHARITY_RUN_THANK_YOU_LETTER,
    question: "Blank (4)",
    answers: ["were spending", "were spent", "spent", "have spent"],
    correct_index: 1,
    justification: "Funds don't spend: they were spent (passive).",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'normal',
    category: 'connectors',
    text: FIRE_ALARM_TEST_NOTICE,
    question: "Blank (1)",
    answers: ["During", "Whereas", "While", "Meanwhile"],
    correct_index: 0,
    justification: "\"During\" + a noun (the test). \"While\" needs a clause.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: FIRE_ALARM_TEST_NOTICE,
    question: "Blank (2): which sentence fits best?",
    answers: ["Rent payments are due on the first of each month.", "New residents are welcome to join our garden club.", "The building's elevator was repaired last month.", "There is no need to leave the building when you hear them."],
    correct_index: 3,
    justification: "The alarms will ring, but it is only a test: practical information for residents.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'normal',
    category: 'comparatives',
    text: FIRE_ALARM_TEST_NOTICE,
    question: "Blank (3)",
    answers: ["bigness", "bigger", "biggest", "big"],
    correct_index: 1,
    justification: "Small problems → bigger ones: a comparison.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'hard',
    category: 'wordForms',
    text: FIRE_ALARM_TEST_NOTICE,
    question: "Blank (4)",
    answers: ["unusually", "unusualness", "unusual", "unused"],
    correct_index: 2,
    justification: "After \"anything\": an adjective (anything unusual).",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'normal',
    category: 'verbTenses',
    text: PAPER_ORDER_DELAY_EMAIL,
    question: "Blank (1)",
    answers: ["order", "ordered", "will order", "are ordering"],
    correct_index: 1,
    justification: "The order was made in the past (\"your recent order\"): ordered.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: PAPER_ORDER_DELAY_EMAIL,
    question: "Blank (2): which sentence fits best?",
    answers: ["Your complete order would then be delivered on 24 May.", "Your payment has been refunded in full.", "Please find our new catalog attached.", "Our paper is made from recycled materials."],
    correct_index: 0,
    justification: "Option 1: wait for the envelopes, then everything arrives together.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'hard',
    category: 'vocabulary',
    text: PAPER_ORDER_DELAY_EMAIL,
    question: "Blank (3)",
    answers: ["sincerely", "severely", "separately", "seriously"],
    correct_index: 2,
    justification: "Paper now, envelopes later = sent separately.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'normal',
    category: 'gerunds',
    text: PAPER_ORDER_DELAY_EMAIL,
    question: "Blank (4)",
    answers: ["reply", "replied", "to reply", "replying"],
    correct_index: 3,
    justification: "After the preposition \"by\": the -ing form.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'normal',
    category: 'vocabulary',
    text: SCULPTURE_OPENING_INVITATION,
    question: "Blank (1)",
    answers: ["signatures", "sceneries", "scriptures", "sculptures"],
    correct_index: 3,
    justification: "Works of art made of stone = sculptures.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: SCULPTURE_OPENING_INVITATION,
    question: "Blank (2): which sentence fits best?",
    answers: ["Our café is closed on Mondays.", "The exhibition will then remain open to the public until the end of January.", "Please pay for your tickets at the door.", "The gallery is looking for part-time staff."],
    correct_index: 1,
    justification: "After the opening: how long the exhibition stays. (Admission is free, so no tickets.)",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'hard',
    category: 'passive',
    text: SCULPTURE_OPENING_INVITATION,
    question: "Blank (3)",
    answers: ["will be served", "serving", "have served", "will serve"],
    correct_index: 0,
    justification: "Refreshments don't serve: they will be served.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'normal',
    category: 'connectors',
    text: SCULPTURE_OPENING_INVITATION,
    question: "Blank (4)",
    answers: ["as if", "even though", "so that", "unless"],
    correct_index: 2,
    justification: "The goal of replying: so that they can prepare enough food.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'normal',
    category: 'prepositions',
    text: THEATER_LOST_PROPERTY_NOTICE,
    question: "Blank (1)",
    answers: ["After", "Since", "Until", "Before"],
    correct_index: 0,
    justification: "The thirty days are over → then items go to charity: after.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'hard',
    category: 'vocabulary',
    text: THEATER_LOST_PROPERTY_NOTICE,
    question: "Blank (2): which sentence fits best?",
    answers: ["Please switch off your phone during the show.", "The theater was renovated in 2015.", "Tickets for next season go on sale in March.", "Unfortunately, we are not able to send lost items by mail."],
    correct_index: 3,
    justification: "It stays on the topic of lost items, and leads to \"visit the box office\".",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'normal',
    category: 'vocabulary',
    text: THEATER_LOST_PROPERTY_NOTICE,
    question: "Blank (3)",
    answers: ["pretend", "provide", "prevent", "prove"],
    correct_index: 1,
    justification: "\"Provide a description\" = give it.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'normal',
    category: 'pronouns',
    text: THEATER_LOST_PROPERTY_NOTICE,
    question: "Blank (4)",
    answers: ["yours", "yourself", "your", "you"],
    correct_index: 2,
    justification: "Before the noun \"identification\": the possessive adjective your.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'normal',
    category: 'verbTenses',
    text: INTERNSHIP_OFFER_EMAIL,
    question: "Blank (1)",
    answers: ["had lasted", "has lasted", "will last", "lasted"],
    correct_index: 2,
    justification: "June to August is in the future: will last.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: INTERNSHIP_OFFER_EMAIL,
    question: "Blank (2): which sentence fits best?",
    answers: ["Our offices are closed on national holidays.", "Your supervisor will be Dr. Alan Brooks, one of our senior engineers.", "Please send us your final invoice.", "We regret that we cannot offer you a place this year."],
    correct_index: 1,
    justification: "It continues the description of the internship (the team, then the supervisor).",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'hard',
    category: 'wordForms',
    text: INTERNSHIP_OFFER_EMAIL,
    question: "Blank (3)",
    answers: ["accept", "accepting", "acceptable", "acceptance"],
    correct_index: 3,
    justification: "After \"your\", we need a noun: acceptance.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'normal',
    category: 'vocabulary',
    text: INTERNSHIP_OFFER_EMAIL,
    question: "Blank (4)",
    answers: ["directions", "definitions", "decisions", "deductions"],
    correct_index: 0,
    justification: "How to get to a place = directions.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'normal',
    category: 'verbTenses',
    text: YOGA_SCHEDULE_EMAIL,
    question: "Blank (1)",
    answers: ["begins", "began", "had begun", "has begun"],
    correct_index: 0,
    justification: "A schedule for a future date: the simple present (begins) is used for timetables.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'normal',
    category: 'connectors',
    text: YOGA_SCHEDULE_EMAIL,
    question: "Blank (2)",
    answers: ["whereas", "unless", "although", "before"],
    correct_index: 3,
    justification: "Early classes → people exercise first, then go to work: before.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: YOGA_SCHEDULE_EMAIL,
    question: "Blank (3): which sentence fits best?",
    answers: ["Our studio was opened by two former dancers.", "Please bring your own towel to the swimming pool.", "These classes will start at 6:30 A.M. on Tuesdays and Thursdays.", "The price of our yearly membership has been reduced."],
    correct_index: 2,
    justification: "\"These classes\" = the two early morning classes just mentioned.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'normal',
    category: 'vocabulary',
    text: YOGA_SCHEDULE_EMAIL,
    question: "Blank (4)",
    answers: ["address", "advance", "advice", "advantage"],
    correct_index: 1,
    justification: "Fixed expression: \"in advance\" = before.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'hard',
    category: 'connectors',
    text: PRINTER_SAFETY_NOTICE,
    question: "Blank (1)",
    answers: ["Because", "Since", "Unless", "Although"],
    correct_index: 3,
    justification: "No injuries, yet they ask people to stop: a contrast = although.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: PRINTER_SAFETY_NOTICE,
    question: "Blank (2): which sentence fits best?",
    answers: ["The printers are popular because of their low price.", "Customers who own a different model do not need to take any action.", "Please recycle your old ink cartridges.", "Our new laptops will be available in the fall."],
    correct_index: 1,
    justification: "It tells who is concerned by the warning, just before explaining how to check.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'hard',
    category: 'vocabulary',
    text: PRINTER_SAFETY_NOTICE,
    question: "Blank (3)",
    answers: ["afforded", "effective", "affected", "affectionate"],
    correct_index: 2,
    justification: "\"Affected\" = concerned by the problem.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'normal',
    category: 'vocabulary',
    text: PRINTER_SAFETY_NOTICE,
    question: "Blank (4)",
    answers: ["apologize", "appear", "appeal", "apply"],
    correct_index: 0,
    justification: "\"We apologize for any inconvenience\" = we are sorry.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'normal',
    category: 'wordForms',
    text: CITY_TREES_ARTICLE,
    question: "Blank (1)",
    answers: ["extreme", "extremity", "extremely", "extremes"],
    correct_index: 0,
    justification: "Before the noun \"heat\": an adjective (extreme).",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: CITY_TREES_ARTICLE,
    question: "Blank (2): which sentence fits best?",
    answers: ["The museum will offer free entry next month.", "Areas with very few trees today will be given priority.", "Many residents have complained about parking fees.", "The city's new bus station opened in June."],
    correct_index: 1,
    justification: "It continues the question of WHERE the trees will be planted.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'hard',
    category: 'wordForms',
    text: CITY_TREES_ARTICLE,
    question: "Blank (3)",
    answers: ["receipt", "receiving", "received", "receive"],
    correct_index: 2,
    justification: "\"They (the requests) are received\": a passive, so the past participle.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'normal',
    category: 'vocabulary',
    text: CITY_TREES_ARTICLE,
    question: "Blank (4)",
    answers: ["keep", "give", "make", "take"],
    correct_index: 3,
    justification: "Fixed expression: \"take care of\".",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'normal',
    category: 'vocabulary',
    text: FURNITURE_SURVEY_EMAIL,
    question: "Blank (1)",
    answers: ["take", "hold", "make", "pass"],
    correct_index: 0,
    justification: "\"Take a survey\" = answer it.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: FURNITURE_SURVEY_EMAIL,
    question: "Blank (2): which sentence fits best?",
    answers: ["Please check that your sofa was delivered on time.", "Our stores are closed on public holidays.", "Delivery is free for orders over $500.", "Your answers will only be used to improve our service."],
    correct_index: 3,
    justification: "It stays on the survey and reassures the customer about the answers.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'normal',
    category: 'verbTenses',
    text: FURNITURE_SURVEY_EMAIL,
    question: "Blank (3)",
    answers: ["received", "will receive", "has received", "receiving"],
    correct_index: 1,
    justification: "After finishing the survey (in the future): will receive.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'hard',
    category: 'gerunds',
    text: FURNITURE_SURVEY_EMAIL,
    question: "Blank (4)",
    answers: ["heard", "hear", "hearing", "to hear"],
    correct_index: 2,
    justification: "\"Look forward to\" + -ing: here \"to\" is a preposition.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'hard',
    category: 'wordForms',
    text: AIRPORT_PARKING_WEB_PAGE,
    question: "Blank (1)",
    answers: ["direct", "direction", "directly", "directed"],
    correct_index: 2,
    justification: "\"Located directly next to\": an adverb (directly).",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: AIRPORT_PARKING_WEB_PAGE,
    question: "Blank (2): which sentence fits best?",
    answers: ["Flights to Lisbon are delayed this morning.", "Free shuttle buses run between this car park and the terminal every ten minutes.", "Our duty-free shops sell perfume and chocolate.", "Please keep your boarding pass until you land."],
    correct_index: 1,
    justification: "It explains the \"bus ride\" to the Long Stay car park.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'normal',
    category: 'vocabulary',
    text: AIRPORT_PARKING_WEB_PAGE,
    question: "Blank (3)",
    answers: ["reserved", "referred", "reversed", "resolved"],
    correct_index: 0,
    justification: "\"Spaces can be reserved\" = booked.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'normal',
    category: 'comparatives',
    text: AIRPORT_PARKING_WEB_PAGE,
    question: "Blank (4)",
    answers: ["then", "as", "that", "than"],
    correct_index: 3,
    justification: "\"Less ... than\": a comparison.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'normal',
    category: 'vocabulary',
    text: EMPLOYEE_AWARD_MEMO,
    question: "Blank (1)",
    answers: ["sealed", "settled", "served", "selected"],
    correct_index: 3,
    justification: "Chosen among many = selected.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: EMPLOYEE_AWARD_MEMO,
    question: "Blank (2): which sentence fits best?",
    answers: ["Many of them praised his patience and his ideas for improving our service.", "The support team is located on the fourth floor.", "Our new office in Dublin will open in March.", "Please submit your expense reports by Friday."],
    correct_index: 0,
    justification: "\"Them\" = his colleagues who nominated him.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'hard',
    category: 'gerunds',
    text: EMPLOYEE_AWARD_MEMO,
    question: "Blank (3)",
    answers: ["to congratulate", "congratulating", "congratulated", "congratulate"],
    correct_index: 1,
    justification: "After the preposition \"in\": the -ing form.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'hard',
    category: 'wordForms',
    text: EMPLOYEE_AWARD_MEMO,
    question: "Blank (4)",
    answers: ["deserve", "deserving", "deserved", "deserves"],
    correct_index: 2,
    justification: "Fixed expression: \"well-deserved\" (a past participle).",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'normal',
    category: 'verbTenses',
    text: COOKING_CLASS_CANCELED_EMAIL,
    question: "Blank (1)",
    answers: ["are booking", "will book", "book", "booked"],
    correct_index: 3,
    justification: "The booking was made before: the simple past (booked).",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: COOKING_CLASS_CANCELED_EMAIL,
    question: "Blank (2): which sentence fits best?",
    answers: ["Please arrive fifteen minutes before your class.", "Our Italian class is the most popular one.", "Unfortunately, we were unable to find another chef in time.", "Aprons and knives are provided for all students."],
    correct_index: 2,
    justification: "It explains why the class could not happen with someone else.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'hard',
    category: 'passive',
    text: COOKING_CLASS_CANCELED_EMAIL,
    question: "Blank (3)",
    answers: ["will be returned", "will return", "returning", "has returned"],
    correct_index: 0,
    justification: "Money doesn't return by itself: it will be returned (passive).",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'normal',
    category: 'gerunds',
    text: COOKING_CLASS_CANCELED_EMAIL,
    question: "Blank (4)",
    answers: ["to answer", "answering", "answered", "answer"],
    correct_index: 1,
    justification: "After the preposition \"by\": the -ing form.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'normal',
    category: 'vocabulary',
    text: PARK_CLEANUP_FLYER,
    question: "Blank (1)",
    answers: ["promoted", "provided", "proved", "produced"],
    correct_index: 1,
    justification: "The city gives the tools = they are provided.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: PARK_CLEANUP_FLYER,
    question: "Blank (2): which sentence fits best?",
    answers: ["Parking tickets can be paid online.", "The fountain was built in 1910 by a famous architect.", "Please wear old clothes and comfortable shoes.", "The café is closed for renovations this month."],
    correct_index: 2,
    justification: "Practical advice for the volunteers. (The café can't be closed: there is a lunch there.)",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'normal',
    category: 'verbTenses',
    text: PARK_CLEANUP_FLYER,
    question: "Blank (3)",
    answers: ["is lasting", "lasted", "has lasted", "lasts"],
    correct_index: 3,
    justification: "\"Usually\" = a habit: the simple present.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'normal',
    category: 'connectors',
    text: PARK_CLEANUP_FLYER,
    question: "Blank (4)",
    answers: ["but", "so", "or", "because"],
    correct_index: 0,
    justification: "Welcome, yet with a condition: but.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'hard',
    category: 'pronouns',
    text: BOOKSTORE_AUTHOR_EVENING,
    question: "Blank (1)",
    answers: ["who", "whose", "whom", "which"],
    correct_index: 1,
    justification: "\"Her new book\" → a possessive relative pronoun: whose.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: BOOKSTORE_AUTHOR_EVENING,
    question: "Blank (2): which sentence fits best?",
    answers: ["Our children's section is on the second floor.", "Please return your library books on time.", "She will also sign copies of her book after the reading.", "The store has been closed since last year."],
    correct_index: 2,
    justification: "It continues what the author will do during the evening.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'normal',
    category: 'vocabulary',
    text: BOOKSTORE_AUTHOR_EVENING,
    question: "Blank (3)",
    answers: ["reserve", "reverse", "reveal", "revise"],
    correct_index: 0,
    justification: "\"Reserve a seat\" = book it.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'hard',
    category: 'vocabulary',
    text: BOOKSTORE_AUTHOR_EVENING,
    question: "Blank (4)",
    answers: ["pursuit", "purity", "purpose", "purchase"],
    correct_index: 3,
    justification: "\"Available for purchase\" = you can buy it.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'normal',
    category: 'wordForms',
    text: LANGUAGE_CAFE_NOTICE,
    question: "Blank (1)",
    answers: ["relax", "relaxed", "relaxation", "relaxingly"],
    correct_index: 1,
    justification: "Between \"a\" and the noun \"setting\": an adjective (relaxed).",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: LANGUAGE_CAFE_NOTICE,
    question: "Blank (2): which sentence fits best?",
    answers: ["Tables are organized by language and by level.", "Registration for the exam ends on Friday.", "The Corner Hub is closed on Tuesdays.", "Our coffee beans are roasted in Colombia."],
    correct_index: 0,
    justification: "It explains how the café works, and prepares \"Each table\".",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'hard',
    category: 'vocabulary',
    text: LANGUAGE_CAFE_NOTICE,
    question: "Blank (3)",
    answers: ["grants", "grades", "guards", "guides"],
    correct_index: 3,
    justification: "The host leads the conversation = guides it.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'hard',
    category: 'connectors',
    text: LANGUAGE_CAFE_NOTICE,
    question: "Blank (4)",
    answers: ["unless", "so that", "although", "because"],
    correct_index: 2,
    justification: "Free, yet people should buy a drink: although.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'normal',
    category: 'vocabulary',
    text: HELP_DESK_TICKET_EMAIL,
    question: "Blank (1)",
    answers: ["crack", "craft", "crate", "cramp"],
    correct_index: 0,
    justification: "A broken line in the glass of a screen = a crack.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'hard',
    category: 'subjectVerb',
    text: HELP_DESK_TICKET_EMAIL,
    question: "Blank (2)",
    answers: ["needing", "needs", "need", "to need"],
    correct_index: 1,
    justification: "\"The screen\" is singular: needs.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'hard',
    category: 'vocabulary',
    text: HELP_DESK_TICKET_EMAIL,
    question: "Blank (3): which sentence fits best?",
    answers: ["Thank you for attending our software training.", "The printer on the second floor is out of paper.", "Your new password will expire in ninety days.", "Unfortunately, it cannot be repaired in our office."],
    correct_index: 3,
    justification: "It explains why a new screen has to be ordered.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'normal',
    category: 'vocabulary',
    text: HELP_DESK_TICKET_EMAIL,
    question: "Blank (4)",
    answers: ["fill", "bring", "pick", "take"],
    correct_index: 2,
    justification: "\"Pick it up\" = come and get it.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'hard',
    category: 'wordForms',
    text: FESTIVAL_VOLUNTEERS_EMAIL,
    question: "Blank (1)",
    answers: ["individual", "individuality", "individualize", "individually"],
    correct_index: 0,
    justification: "Before the noun \"schedules\": an adjective (individual = for each person).",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: FESTIVAL_VOLUNTEERS_EMAIL,
    question: "Blank (2): which sentence fits best?",
    answers: ["Our main stage was designed by a famous architect.", "Tickets for the festival are now sold out.", "The weather was perfect at last year's festival.", "Changes can still be made until Wednesday."],
    correct_index: 3,
    justification: "It continues the idea of checking the schedules and reporting problems.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'hard',
    category: 'connectors',
    text: FESTIVAL_VOLUNTEERS_EMAIL,
    question: "Blank (3)",
    answers: ["which", "what", "where", "when"],
    correct_index: 2,
    justification: "A place (the main entrance) + what happens there: where.",
  }),
  createQuestion({
    section: 'rc8',
    difficulty: 'normal',
    category: 'vocabulary',
    text: FESTIVAL_VOLUNTEERS_EMAIL,
    question: "Blank (4)",
    answers: ["would", "must", "could", "might"],
    correct_index: 1,
    justification: "A rule (\"at all times\") = an obligation: must.",
  }),
];

// ---------- RC Text reading: reading comprehension ----------

const AD = `SUMMER SALE at Brightway Electronics!

From July 1 to July 15, all laptops are 20% off. Members of our Brightway Club get an extra 5% discount on every purchase. Free delivery for orders over $300. Visit our downtown store or shop online at brightway.com. The store is closed on Sundays.`;

const TRIP_EMAIL = `From: Sarah Kim
To: Daniel Moore
Subject: Conference trip

Hi Daniel,
I booked your flight to Chicago for the marketing conference on March 12. The hotel next to the convention center was full, so I reserved a room at the Lakeside Inn, about 15 minutes away by taxi. The company will pay for your taxis, so keep the receipts. Also, Mr. Patel asked if you could present the sales results on the second day instead of the first.
Best,
Sarah`;

const PARKING_PERMIT_TEXTS = `Jonas Berg (9:12 A.M.)
Hi Maya, I'm at the front gate, but my parking permit isn't working. The barrier won't open.

Maya Lindholm (9:14 A.M.)
That happens sometimes when a permit is new. Did you get it this week?

Jonas Berg (9:15 A.M.)
Yes, on Monday.

Maya Lindholm (9:16 A.M.)
OK. Press the help button next to the barrier and give the guard your employee number. He can open it for you, and I'll ask security to activate your permit today.

Jonas Berg (9:17 A.M.)
Will do. Thanks!`;

const COFFEE_MACHINE_NOTICE = `Notice — Third-Floor Coffee Machine

The coffee machine in the third-floor break room is being replaced. From Monday, 4 November, a new machine will offer hot chocolate and soup in addition to coffee and tea. Drinks will remain free for all staff.

The new machine uses only reusable cups. Please take a cup from the shelf above the machine and place it in the dishwasher after use. Paper cups will no longer be available.`;

const SHOE_REPAIR_AD = `Heel & Sole Express

Don't throw away your favorite shoes! At Heel & Sole Express, our skilled team can replace heels, fix broken straps, and make worn soles look like new. Most repairs are ready in under an hour, so you can shop at Millbrook Mall while you wait.

This month only: bring this ad and get a free bottle of leather cleaner with any repair over $20.

Heel & Sole Express — Millbrook Mall, ground floor, next to the food court.`;

const LIBRARY_CARD_EXPIRY_EMAIL = `To: Oliver Strand
From: Kestrel Valley Library
Subject: Your library card
Date: 8 January

Dear Mr. Strand,

Your library card will expire on 31 January. You can renew it for free at any of our branches; just bring a document showing your current address, such as a recent electricity bill.

Please note that from 1 February, cards that have expired will no longer give access to our online magazines and e-books.

Kestrel Valley Library`;

const RAIL_TRACK_WORK_UPDATE = `Service Update — Northbridge Line

Because of track work, there will be no trains between Ostley and Carrow Junction on Saturday, 12 October, and Sunday, 13 October. Replacement buses will run every twenty minutes and stop outside each station. Journeys will take about thirty minutes longer than usual.

Tickets for these dates are valid on the replacement buses. Bicycles cannot be carried on the buses, except folding bicycles.`;

const MEAL_KIT_REVIEW = `Review of FreshCrate meal kits ★★★★☆
Posted by Lena T.

I've been using FreshCrate for three months. Each box contains all the ingredients for four dinners, with easy step-by-step recipe cards. The food is fresh and the portions are generous. My only complaint is the packaging: there is a lot of plastic, and it can't all be recycled where I live. If FreshCrate fixes this, I'll give them five stars.`;

const LOGISTICS_FORUM_WIFI_CARD = `Welcome to the Global Logistics Forum!

Wi-Fi network: GLF-Guest
Password: cargo2025

The network is available in all meeting rooms and in the exhibition hall. If you have trouble connecting, please visit the information desk near the main entrance. Presentation slides will be uploaded to the forum app within 24 hours after each session.`;

const CAR_WASH_COUPON = `SPARKLE AUTO WASH
Coupon — Deluxe Wash for $12 (regular price: $18)

Includes exterior wash, wheel cleaning, and interior vacuuming.
Valid Monday to Thursday only, until 30 June.
One coupon per car. Cannot be combined with other offers.
Show this coupon to the attendant before your wash.`;

const MUSEUM_AUDIO_GUIDE_SIGN = `Audio Guides

Discover the stories behind our collection! Audio guides are available at the ticket desk in English, German, Spanish, and Korean. The guide includes more than sixty short recordings, each lasting about two minutes.

Price: $4 (free for members and children under 12)
A photo ID must be left at the desk while you use the guide.`;

const TEAM_LUNCH_CHAT = `Priscilla Okoro [11:02 A.M.]
Hi Tariq, are we still on for the team lunch on Friday? I need to tell the restaurant how many people are coming.

Tariq Benali [11:05 A.M.]
Yes! Everyone confirmed except Hiro. He's at a client site all week.

Priscilla Okoro [11:06 A.M.]
OK, so that's nine of us. I'll book a table for 12:30.

Tariq Benali [11:07 A.M.]
Perfect. Could you ask for a table near the window? It's Joanna's last week, so let's make it special.`;

const APARTMENT_RENTAL_AD = `For Rent — Two-Bedroom Apartment, Calder Street

Bright two-bedroom apartment on the fourth floor of a quiet building, five minutes' walk from Calder Station. Recently renovated kitchen and bathroom. Rent: €1,150 per month, heating included. Available from 1 September.

No pets, please. To arrange a viewing, call Marta at 555-0140 between 9 A.M. and 6 P.M.`;

const COURSE_CERTIFICATE_EMAIL = `To: Amelia Kwan
From: SkillPath Online Learning
Subject: Congratulations!
Date: 22 May

Dear Ms. Kwan,

Congratulations on completing "Project Management Basics"! Your certificate is now available in the "My Achievements" section of your account. You can download it as a PDF or share it directly on professional networking sites.

Ready for the next step? Learners who completed this course often continue with "Leading Remote Teams." Use the code NEXT15 for 15 percent off before 5 June.`;

const HOTEL_CHECKOUT_CARD = `Thank you for staying at the Aurelia Hotel!

Check-out time is 11 A.M. If you need a little more time, a late check-out until 2 P.M. can be arranged for €20, depending on availability. Please ask at reception before 9 A.M. on the day of your departure.

Luggage can be stored free of charge at reception after check-out.`;

const BIKE_RACKS_NEWSLETTER = `Staff Newsletter — Short News

Good news for cyclists: twenty new bike racks have been installed in the underground garage, next to the elevators. The racks are covered by security cameras. Showers and lockers are also available on the ground floor for staff who ride to work.

So far, about thirty employees cycle to the office regularly. Facilities manager Corinne Lefèvre hopes the new racks will encourage more people to join them.`;

const THEATER_E_TICKET = `E-TICKET — Moonlight Players

Show: "The Clockmaker's Secret"
Date: Saturday, 15 March — 7:30 P.M. (doors open at 7:00 P.M.)
Seat: Row F, Seat 12
Venue: Riverside Arts Theatre, Hall 2

Latecomers will be admitted only during the intermission. Please show this ticket on your phone or printed on paper at the entrance.`;

const SCAN_TO_EMAIL_GUIDE = `Quick Guide — Scanning to E-mail

1. Place your document face down on the glass, or face up in the top tray.
2. Touch "Scan" on the screen, then "Send to E-mail."
3. Enter your work e-mail address and touch "Start."

Documents longer than 50 pages should be scanned in several parts. If the screen shows an error, contact the IT desk on extension 4400.`;

const READING_BUDDY_AD = `Become a Reading Buddy!

The Fernway Community Center is looking for volunteers to read with children aged 6 to 9. Sessions take place on Wednesday afternoons from 3:30 to 4:30 P.M. No teaching experience is required: all volunteers attend a one-hour introduction before they start.

Interested? Write to reading@fernwaycc.org and tell us a little about yourself.`;

const EXPENSES_APP_MEMO = `MEMO
To: All staff
From: Finance Department
Date: 3 March

Starting 1 April, all travel expenses must be submitted through the ExpensePro app instead of on paper forms. Receipts can be photographed with your phone and attached directly to each expense. Paper forms received after 31 March will be returned to the sender.

A short video showing how to use the app is available on the intranet.`;

const GATE_CHANGE_TEXT_MESSAGE = `Skyhaven Air: Flight SH418 to Copenhagen, 14 June.
Your departure gate has changed from B12 to C4. Boarding will start at 15:40, twenty minutes later than planned. The new departure time is 16:15. We apologize for the inconvenience. Reply STOP to stop receiving flight alerts.`;

const BOOKCASE_ASSEMBLY_INSTRUCTIONS = `Assembly Instructions — Hartwell Bookcase (Model HB-5)

Before you begin, check that all the parts listed on page 2 are in the box. You will need a screwdriver, which is not included. Assembly takes about 45 minutes and should be done by two people.

Important: To prevent the bookcase from falling, attach it to the wall using the metal bracket provided.`;

const OUTDOOR_MOVIE_FLYER = `Outdoor Movie Night — Harlow Square

Bring a blanket and join your neighbors for a free outdoor screening of the family comedy "Pancake Planet" on Friday, 9 August. The film starts at sunset (around 8:45 P.M.).

Popcorn and drinks will be sold by the Harlow Scouts, with all money going to their summer camp. In case of rain, the screening will move to the Harlow Community Hall.`;

const BARISTA_JOB_AD = `Barista Wanted — Copper Kettle Café

The Copper Kettle Café in Dunmore is looking for a part-time barista to work weekend mornings (7 A.M. to 1 P.M.). Experience with espresso machines is preferred but not required, as full training will be given. The successful applicant will be friendly, reliable, and able to work quickly during busy periods.

To apply, send your CV to Tomasz at jobs@copperkettle.ie by 15 May.`;

const ENERGY_BILL_MARCH = `Halvorsen Energy — Your Bill for March

Account number: 30-118-552
Amount due: €84.20
Due date: 18 April

Your usage this month was 12 percent lower than in March last year. Well done!

Pay online at halvorsen-energy.com, through our app, or by bank transfer. Customers who choose paperless billing receive a €2 discount every month.`;

const FOOD_TRUCK_WEEK_SCHEDULE = `Taco Tide — Where to find us this week

Monday: closed
Tuesday & Wednesday: Ashcombe Business Park, 11 A.M.–2 P.M.
Thursday: Seafront Promenade, 12 P.M.–8 P.M.
Friday & Saturday: Kingsgate Market, 10 A.M.–4 P.M.
Sunday: private events only

Follow us online for daily specials!`;

const CONTRACTS_SCAN_TEXTS = `Rania Fares (2:41 P.M.)
Ethan, are you still in the office? I left the client contracts on the printer.

Ethan Moreno (2:43 P.M.)
I'm just leaving. Do you need them today?

Rania Fares (2:44 P.M.)
Yes, the client wants signed copies by 5. Could you scan them and send them to me?

Ethan Moreno (2:46 P.M.)
No problem. Give me ten minutes.`;

const BOOK_CLUB_EMAIL = `To: Members of the Thursday Book Club
From: Agnes Kirby
Subject: Next meeting
Date: 2 October

Hello everyone,

Our next meeting will be on Thursday, 17 October, at 6:30 P.M. Because the library's meeting room is being painted, we will meet at the Pine Cone Café on Albert Road instead. We'll be discussing "The Silent Orchard," so please finish the book before then.

See you soon,
Agnes`;

const HIKING_MAGAZINE_OFFER = `Subscribe to Trail & Summit Magazine

Get 12 issues of Trail & Summit — the magazine for hikers and climbers — for only $36. That's 40 percent less than the price in stores! New subscribers will also receive a free waterproof map case.

Subscribe at trailsummit.com/offer before 30 November. Offer valid for addresses in the United States and Canada only.`;

const BIKE_SHARE_SIGN = `Velo City Bike Share — How It Works

1. Download the Velo City app and create an account.
2. Scan the code on any available bike to unlock it.
3. Ride! The first 30 minutes of each trip are included in your membership.
4. Return the bike to any Velo City station and push it firmly into the dock until you hear a beep.

Trips longer than 30 minutes cost €1 for each additional 15 minutes.`;

const SALON_REMINDER_TEXT = `Reminder from Studio Lume: You have an appointment with Clémence for a haircut on Tuesday, 3 June, at 4:15 P.M. Please reply C to confirm or R to reschedule. Appointments canceled with less than 24 hours' notice will be charged 50 percent of the service price.`;

const PLAYGROUND_NEWS_BRIEF = `City News in Brief

The new playground at Willowmere Park will open on Saturday, 26 April, after six months of construction. The playground includes a climbing tower, water fountains, and equipment designed for children who use wheelchairs. The project was paid for partly by local businesses, whose names appear on a sign at the park entrance.`;

const TERRACE_RESERVATION_EMAIL = `To: Benedikt Auer
From: reservations@olivarestaurant.com
Subject: Reservation confirmed
Date: 11 September

Dear Mr. Auer,

Your table for six at Oliva is confirmed for Saturday, 14 September, at 8 P.M. As requested, we have reserved a table on our garden terrace. If the weather is cold, heaters will be provided.

Please let us know if any of your guests have food allergies. We look forward to welcoming you.`;

const TOOL_RENTAL_PRICES = `Rent-a-Tool — Prices per Day

Electric drill .......... $12
Pressure washer ....... $35
Ladder (3 m) ........... $15
Floor sander ........... $48

Weekend special: rent any tool on Friday afternoon and return it by Monday at 9 A.M. for the price of one day. A refundable deposit of $50 is required for all rentals.`;

const COLLEGE_OPEN_DAY = `Open Day at Elmsford College

Thinking about studying design, engineering, or business? Visit Elmsford College on Saturday, 8 March, from 10 A.M. to 3 P.M. Meet our teachers, tour the campus, and attend free sample classes. Current students will be available to answer your questions about student life.

No registration is needed. Free parking is available in the north car park.`;

const STAFF_SURVEY_KITCHEN_MEMO = `MEMO
To: All employees
From: Human Resources
Date: 20 November

Thank you to the 412 employees who completed our annual staff survey. The results show that most of you are happy with your work schedules, but many feel that the office kitchen is too small. We have therefore decided to extend the kitchen into the unused storage room next to it. Work will begin in January.`;

const INTERNET_SUPPORT_CHAT = `Live Chat — Brightwave Internet

Agent (Nikhil) [3:02 P.M.]: Hello, how can I help you today?
Ms. Delacroix [3:03 P.M.]: My internet has been very slow since yesterday.
Agent (Nikhil) [3:05 P.M.]: I'm sorry to hear that. I can see that there is work on the network in your area. It should be finished by 6 P.M. today.
Ms. Delacroix [3:06 P.M.]: I work from home, so this is a real problem.
Agent (Nikhil) [3:08 P.M.]: I understand. I've added a credit of $10 to your account for the inconvenience.`;

const FLORIST_MOVING_CARD = `We're moving!

After fifteen years on Fenwick Street, Petal & Stem Florist is moving to a larger shop at 22 Market Lane, just two streets away. Our last day at the old address will be Saturday, 31 May, and we will open at Market Lane on Tuesday, 3 June.

The new shop has space for workshops, so watch for our flower-arranging classes starting this summer!`;

const WINDOW_CLEANING_NOTICE = `Notice to All Tenants — Dunmore Tower

The outside windows of the building will be cleaned from Monday, 7 April, to Wednesday, 9 April. Cleaners will work from the roof down, one side of the building at a time, between 8 A.M. and 5 P.M.

For safety reasons, please keep all windows closed during these hours and remove any objects from your window ledges. Balconies on the side being cleaned must not be used.

A schedule showing which side will be cleaned each day is posted in the main lobby.`;

const LIBRARY_MAKERSPACE_ARTICLE = `Library Opens Makerspace

KESTON — The Keston Central Library has opened a new "makerspace" on its second floor. The room contains 3D printers, sewing machines, a laser cutter, and computers with design software. Library card holders can use the equipment for free after completing a short safety lesson.

"Libraries are not only about books anymore," said head librarian Wendell Osgood. "We want to give people a place to create things." Lessons are held every Saturday morning and must be booked online. Materials such as fabric and plastic for the printers are sold at cost price.`;

const SELF_CHECKOUT_LETTER = `To the Manager, FreshWay Supermarket (Orchard Road)

I have shopped at your store every week for years, and I have always been happy with the friendly service. However, since the number of staffed checkouts was reduced last month, I have had to use the self-service machines. They often stop working when I scan fruit, and there is rarely an employee nearby to help.

I understand that the machines save time for many customers, but please consider keeping at least two staffed checkouts open at all times, especially in the mornings, when many older customers shop.

Yours sincerely,
Gerald Pinto`;

const ONLINE_SALES_WEBINAR_AD = `Free Webinar: Getting Started with Online Sales

Are you a small business owner who wants to sell online? Join our free webinar on Wednesday, 16 October, at 12:30 P.M. In just 45 minutes, e-commerce expert Dana Whitlock will explain the basics of setting up an online store, taking payments, and shipping orders.

Participants will receive a checklist they can follow after the session. Places are limited to 300, so register today at shopstart.net/webinar. A recording will be sent to everyone who registers, even if they cannot attend live.`;

const SUMMER_PICNIC_REPLY_FORM = `Fairmont Logistics Summer Picnic — Reply Form

Name: Ingrid Solberg
Department: Accounts
Will you attend?  ☑ Yes  ☐ No
Number of guests (family members): 2
Meal choices: ☑ Grilled chicken (2)  ☑ Vegetable curry (1)
Will you take the company shuttle bus from the office?  ☐ Yes  ☑ No

Please return this form to Paolo in Human Resources by Friday, 13 June. The picnic will be held on Saturday, 28 June, at Clearwater Lake Park.`;

const PROJECTOR_GROUP_CHAT = `Ines Pereira [10:14 A.M.]
The projector in Meeting Room 3 isn't turning on. The clients arrive at 10:30!

Bruno Keller [10:15 A.M.]
Did you check the cable behind the cabinet? The cleaners often unplug it.

Ines Pereira [10:17 A.M.]
Just did. Still nothing.

Yuki Sato [10:18 A.M.]
Room 5 is free all morning, and its projector works fine. I used it yesterday.

Ines Pereira [10:19 A.M.]
Great, I'll move the meeting there. Bruno, could you put a sign on the door of Room 3?

Bruno Keller [10:19 A.M.]
On it.`;

const RECIPE_CONTEST_RULES = `Harvest Kitchen Recipe Contest — Rules

1. The contest is open to amateur cooks aged 16 and over.
2. Each person may enter one recipe only. Recipes must use at least one vegetable grown in the region.
3. Entries must include a list of ingredients, step-by-step instructions, and a photo of the finished dish.
4. Entries must be received by 31 August. Late entries will not be accepted.
5. Five finalists will be invited to cook their dish in front of the judges at the Harvest Festival on 21 September.`;

const CABIN_BAGGAGE_WEB_PAGE = `Skyhaven Air — Cabin Baggage

Each passenger may bring one small bag into the cabin, such as a handbag or a laptop bag, which must fit under the seat in front. Passengers with a Flex or Business ticket may also bring a larger bag of up to 10 kg, which must be placed in the overhead locker.

Bags that are too large for the cabin will be taken at the gate and placed in the hold. A fee of €45 is charged for this, except for strollers and wheelchairs, which are carried free of charge.`;

const STATION_LOCKERS_SIGN = `Luggage Lockers — Platform Level

Small locker: €4 for up to 6 hours
Large locker: €7 for up to 6 hours
Each extra hour: €1

Lockers accept card payments only. Your receipt shows a code that you will need to open the locker, so keep it safe. Items left for more than 48 hours will be removed and taken to the station's lost property office.`;

const SPANISH_COURSES_PAGE = `Lingua Bridge School — Spanish Courses (Autumn Term)

Beginner (A1): No previous knowledge needed. Mondays and Wednesdays, 6–7:30 P.M.
Elementary (A2): For students who can talk about daily life. Tuesdays, 6–8 P.M.
Intermediate (B1): For students who can discuss familiar topics. Thursdays, 6–8 P.M.

Not sure which level is right for you? Take our free 20-minute online test, and a teacher will contact you with a recommendation. All courses begin the week of 23 September and last twelve weeks.`;

const CONSTRUCTION_NEIGHBOR_LETTER = `Dear Neighbor,

Construction of the new Alder Court apartment building on Quarry Road will begin on Monday, 2 June. We expect the work to last about fourteen months.

We know that construction can be disruptive. To reduce noise, the loudest work will take place only between 9 A.M. and 4 P.M. on weekdays, and there will be no work on Sundays. Trucks will enter the site from Mill Lane, not Quarry Road, to keep traffic away from the school.

If you have any concerns, please contact our community officer, Ruth Mbeki, at 555-0161.

Hollis Builders`;

const HOUSEKEEPING_HEAD_EMAIL = `To: All staff, Ridgeway Hotel
From: Lorraine Atwood, General Manager
Subject: Welcome, Anton!
Date: 5 May

I am pleased to announce that Anton Kessler will join us as Head of Housekeeping on 19 May.

Anton brings fifteen years of experience in large hotels in Vienna and Zurich. He will replace Gloria Benítez, who is retiring after twenty-two years with us. Please join us for a small farewell party for Gloria in the staff room on Friday, 16 May, at 4 P.M.`;

const RUNNING_SHOES_REVIEW = `Customer Review — Stride Pro 3 Running Shoes ★★★☆☆
Reviewer: Mauricio L.

I bought these shoes for my first half marathon. They are very light and the cushioning is excellent, so my feet felt fine even after 20 kilometers. However, the sizes are smaller than normal. I usually wear a 43, but I had to exchange them for a 44. The store was very helpful, but I wish the Web site had warned me.

Also, at $160, they are not cheap. I'd recommend them to serious runners, but beginners can find good shoes for less.`;

const VOLUNTEER_DAY_MEMO = `MEMO
To: All employees
From: Community Relations Team
Date: 1 September

This year, every employee will be given one paid day off to volunteer for a charity of their choice. The day can be taken at any time before 31 December, but it must be approved by your manager at least two weeks in advance.

To help you choose, we have prepared a list of local organizations that welcome volunteers, including food banks, animal shelters, and environmental groups. The list is available on the intranet. After your volunteer day, we would love to hear about your experience for our company newsletter.`;

const COPIER_CONTRACT_EMAIL = `To: Office Managers
From: ClearPrint Services
Subject: Your service contract
Date: 2 December

Dear customer,

Your service contract for the ClearPrint X40 copier will end on 31 December. Under the contract, our technicians visit your office every three months to clean the machine, and repairs are free of charge.

If you renew before 20 December, you will pay the same price as last year. After that date, the new price of $420 per year will apply. To renew, simply reply to this e-mail with your account number.`;

const CHAMBER_MUSIC_PROGRAM = `Brightwater Chamber Music Festival — Weekend Program

Friday, 6 July
7:30 P.M. — Opening concert: String Quartet No. 2 (Elm Hall)

Saturday, 7 July
11:00 A.M. — Family concert: "Meet the Instruments" (Garden Tent, free entry)
4:00 P.M. — Piano trio (Elm Hall)
8:00 P.M. — Festival orchestra (Elm Hall)

Sunday, 8 July
3:00 P.M. — Closing concert with guest violinist Ilka Morrow (Elm Hall)

Tickets for Elm Hall concerts: $25 each, or $80 for all four.`;

const RECYCLING_CENTER_HOURS = `Westmoor Recycling Center — New Opening Hours

From 1 November, the recycling center will open from 9 A.M. to 5 P.M., Tuesday to Sunday. The center will be closed on Mondays so that staff can carry out maintenance work. The current opening hours (8 A.M. to 6 P.M., seven days a week) will remain in place until 31 October.

Residents can still drop off garden waste, glass, paper, and small electrical items free of charge. Large items such as sofas and mattresses can be collected from your home for a fee; book a collection at westmoor.gov/collections.`;

const SOIL_SENSOR_PRIZE_ARTICLE = `Local Start-Up Wins Innovation Prize

HALBRIDGE — Two former university classmates have won this year's Halbridge Innovation Prize for a device that helps farmers save water. The device, called SoilSense, measures the moisture in the ground and sends a message to the farmer's phone when crops need watering.

Founders Amaya Celik and Josef Novák started the company in a garage two years ago. The prize includes €50,000 and a year of free office space in the Halbridge Technology Park. "This will allow us to hire our first employees," said Ms. Celik.`;

const MOVING_COMPANY_QUOTE = `Quote — SwiftMove Removals

Customer: Hélène Dufort
Moving from: 14 Rue des Lilas, Annecy
Moving to: 7 Chemin du Port, Évian
Moving date: Thursday, 10 July

Service                                   Price
Packing (kitchen and books only)           €180
Transport (truck + 3 movers, 1 day)        €650
Furniture assembly at new address          €120
Total                                      €950

This quote is valid for 30 days. A deposit of 20 percent is required to confirm the booking. Moves on weekends cost 15 percent more.`;

const CATERING_GROUP_CHAT = `Wen Zhao [4:02 P.M.]
The caterer just called. They can't deliver the sandwiches for tomorrow's training before 12:30.

Felix Arnaud [4:03 P.M.]
But lunch starts at 12:00. Can we push it back?

Wen Zhao [4:04 P.M.]
The trainer has a train at 3:00, so the afternoon session can't run late.

Daria Popescu [4:06 P.M.]
There's a bakery across the street that does platters. I can pick some up at 11:45.

Felix Arnaud [4:07 P.M.]
That works. Wen, can you cancel the sandwiches?

Wen Zhao [4:07 P.M.]
I'll call them now.`;

const TRANSPORT_MUSEUM_JOB_POSTING = `Job Posting — Visitor Services Assistant
Calloway Museum of Transport

We are seeking an enthusiastic person to welcome visitors, sell tickets, and answer questions about our collection of historic trains and buses. The position is full-time and includes work on weekends and public holidays.

Candidates should have experience in customer service and be comfortable using a computer. Knowledge of a second language is an advantage. To apply, send a cover letter and CV to careers@callowaymuseum.org by 28 February.`;

const ROOM_BOOKING_POLICY = `Meeting Room Booking Policy

Meeting rooms can be booked through the company calendar up to four weeks in advance. Bookings are limited to three hours per meeting, except for the Board Room, which can be booked for a full day.

If you no longer need a room, please cancel your booking as soon as possible so that colleagues can use it. Rooms that are not used within fifteen minutes of the start of a booking will automatically become available to others.`;

const GROCERY_DELIVERY_EMAIL = `To: Kwame Asante
From: GreenBasket Groceries
Subject: Your delivery
Date: 21 March

Hello Kwame,

Your order #88412 will be delivered tomorrow, Saturday, between 10 and 11 A.M. Our driver will call you about fifteen minutes before arrival.

Unfortunately, the oat milk you ordered is out of stock. We have replaced it with a similar product of the same brand at no extra cost. If you do not want the replacement, simply hand it back to the driver, and you will receive a refund within 48 hours.`;

const WATERCOLOR_COURSE_FLYER = `Watercolor for Everyone!

Six-week course at the Linden Art Studio
Tuesdays, 7–9 P.M., starting 4 March
Teacher: Agathe Morel, landscape painter

Learn the basics of watercolor painting in a small, friendly group (maximum eight students). All paints and brushes are provided; students only need to bring a sketchbook. The course fee is $150. Students who sign up with a friend each receive $20 off.`;

const TOWN_CENTER_PLAN_NOTICE = `Have Your Say: Hartfield Town Center Plan

Hartfield Council is preparing a plan to improve the town center over the next ten years. Ideas include wider sidewalks, more trees, a weekly market, and fewer parking spaces on High Street.

Before any decisions are made, we want to hear from you. Complete the online survey at hartfield.gov/plan or pick up a paper copy at the library or the town hall. The survey closes on 15 May. A public meeting to discuss the results will take place in June.`;

const PHONE_REPAIR_RECEIPT = `FixIt Phone Repair — Receipt

Date: 9 August
Customer: Pavel Horák
Device: SmartOne 12

Screen replacement ................... $129.00
Protective case ...................... $19.00
Screen protector (free with repair) ...... $0.00
Total paid (card) .................... $148.00

All repairs come with a six-month warranty. If the same problem happens again within that time, we will fix it free of charge. Please keep this receipt as proof of purchase.`;

const FOGGY_FLIGHT_TEXTS = `Marisol Ortega (6:52 A.M.)
Hi Viktor, my flight to Oslo has been canceled because of fog. I'm rebooked on the 11:20 flight.

Viktor Dahl (6:55 A.M.)
Oh no. So you'll miss the 10 o'clock meeting with Nordlys Foods.

Marisol Ortega (6:56 A.M.)
Yes. Could you start without me? The slides are in our shared folder.

Viktor Dahl (6:58 A.M.)
Sure. I'll ask them if we can do the price discussion after lunch, when you're here.`;

const POTTERY_STUDIO_ARTICLE = `Clay and Kiln Studio Celebrates Ten Years

FENWICK BAY (14 May) — When Odile Marchand opened Clay and Kiln in a former fish market ten years ago, few people in Fenwick Bay had ever tried making pottery. — [1] — Today, the studio offers more than twenty classes a week and employs six teachers.

Students range from children to retired professionals. — [2] — "Working with clay helps people slow down," Ms. Marchand said. "Many students tell me it's the most relaxing part of their week."

To celebrate its anniversary, the studio will hold an open house on Saturday, 24 May. — [3] — Visitors can watch demonstrations, try the pottery wheel, and buy pieces made by students. All money from the sales will go to the town's youth center. — [4] —`;

const SECURITY_UPDATE_MEMO = `MEMO
To: All employees
From: IT Department
Date: 7 November
Subject: Computer updates this weekend

On Saturday, 9 November, all office computers will receive an important security update. The update will be installed automatically between 10 P.M. and 2 A.M. To allow this, please leave your computer switched on and connected to the network when you go home on Friday.

Please save your work and close all programs before leaving. Any documents that are left open may be lost when the computer restarts.

If your computer is not working properly on Monday morning, contact the help desk at extension 2200. Laptops that are taken home for the weekend will be updated the next time they are connected to the office network.`;

const GUESTHOUSE_ABOUT_PAGE = `Mariner's Rest Guesthouse — About Us

Mariner's Rest is a family-run guesthouse in the old harbor of Port Ellery, just steps from the beach. — [1] — Each of our nine rooms is decorated in a different style, and most have a view of the sea.

Breakfast is served in our garden room from 7:30 to 10 A.M. and includes homemade bread, local cheese, and fresh fruit. — [2] — Guests with special diets should let us know when they book.

We do not have a parking lot, but guests can park for free on Harbor Road, a three-minute walk away. — [3] — Bicycles are available to borrow at no cost, and our staff will be happy to suggest routes along the coast. — [4] —`;

const PROPOSAL_TEAM_CHAT = `Sofía Marín [9:30 A.M.]
Good morning, team. The Brandt Hotels proposal is due to the client on Thursday. Where are we?

Aleksander Nowak [9:32 A.M.]
The budget section is finished. I'm checking the numbers one last time this morning.

Hyejin Park [9:33 A.M.]
I still need the photos from the Lisbon project for the design section. Does anyone know where they are?

Aleksander Nowak [9:35 A.M.]
Tomás took them, but he's on vacation until Monday.

Sofía Marín [9:36 A.M.]
I have copies on my laptop. I'll send them to you right after this.

Hyejin Park [9:37 A.M.]
That's a relief. I'll have the design section ready by Wednesday noon, then.`;

const ROOFTOP_GARDENS_ARTICLE = `Rooftop Gardens Take Root in Calderon City

CALDERON CITY — More and more office buildings in the city center are turning their flat roofs into gardens. — [1] — According to the city's planning department, forty-two buildings now have rooftop gardens, compared with only eight five years ago.

The gardens help keep buildings cool in summer and reduce the amount of rainwater flowing into the streets. — [2] — They also give employees a place to relax. At the offices of Verity Insurance, staff grow tomatoes and herbs that are used in the company cafeteria. — [3] —

The city now offers grants of up to €20,000 to help building owners pay for the work. — [4] — Applications for this year's grants are open until 30 September.`;

const TOURISM_FORUM_SPEAKERS_CALL = `Call for Speakers — Coastal Tourism Forum

The Coastal Tourism Forum will take place in Harbourne on 12–13 March. We are now inviting proposals for 20-minute presentations on topics such as sustainable travel, digital marketing for small hotels, and new ideas for the off-season.

Proposals should include a title, a short summary (no more than 200 words), and information about the speaker. They must be submitted through our online form by 15 November.

Speakers will be informed of the committee's decision by 10 December. Selected speakers will receive free entry to the forum and two nights at a partner hotel. Travel costs are not covered.`;

const QUIET_DISHWASHER_PRESS_RELEASE = `FOR IMMEDIATE RELEASE

Northwind Kitchens Launches Quiet Dishwasher

BERGEN, 2 October — Northwind Kitchens today introduced the Stillwater 500, which the company says is the quietest dishwasher it has ever made. At just 38 decibels, the machine is quieter than a normal conversation. — [1] —

The Stillwater 500 also uses 20 percent less water than Northwind's previous model. — [2] — It will be available in stores across Norway, Sweden, and Denmark from 1 November, with a recommended price of 7,990 kroner.

"Many of our customers live in apartments with open kitchens," said product manager Eirik Solheim. — [3] — "For them, noise is a real problem." — [4] —`;

const WORK_FROM_HOME_HANDBOOK = `Employee Handbook — Section 4.2: Working from Home

Employees may work from home up to two days per week, with the approval of their manager. Working from home is not available during the first three months of employment.

When working from home, employees must be available by phone and e-mail during core hours (10 A.M. to 3 P.M.). Company laptops must be used for all work, and they must be connected through the company's secure network.

Human Resources will review requests to work from home more than two days per week, for example for health or family reasons.`;

const DAMAGED_SWEATER_REPLY = `To: Dorothea Lang
From: Customer Care, Velvet Thread Clothing
Subject: Your order #55902
Date: 18 February

Dear Ms. Lang,

Thank you for contacting us about the wool sweater you ordered on our Web site. We are sorry that it arrived with a hole in the sleeve. — [1] —

We have sent you a replacement sweater by express delivery, and it should reach you by Wednesday. — [2] — You do not need to send the damaged sweater back; please keep it or donate it.

As an apology, we have also added a credit of €15 to your customer account. — [3] — It can be used on any purchase until the end of the year. — [4] —

Kind regards,
Jana Hoffmann, Customer Care`;

const SILK_EXHIBITION_REVIEW = `Review: "Threads of Silk" at the Ostrava City Museum

The Ostrava City Museum's new exhibition, "Threads of Silk," tells the story of the silk trade between Asia and Europe over two thousand years. The exhibition fills four rooms and includes more than three hundred objects, from ancient coins to beautifully embroidered robes.

The highlight is a twelve-meter-long painted scroll, shown in Europe for the first time. Visitors can also try weaving on a working wooden loom.

My only criticism is that the information signs are small and hard to read in the dark rooms. The free audio guide, however, is excellent. "Threads of Silk" runs until 30 June.
— Review by Pieter Claes`;

const WINTER_FERRY_TIMETABLE = `Island Link Ferries — Winter Timetable

From 1 November to 31 March, Island Link Ferries will operate a reduced winter timetable between Harbourne and Gull Island. — [1] — Ferries will leave Harbourne at 8:00 A.M., 12:00 P.M., and 5:00 P.M., and return from Gull Island one hour later.

The café on board will be closed during the winter months. — [2] — Passengers are welcome to bring their own food and drinks.

Please note that ferries may be canceled in bad weather. — [3] — Cancellations will be announced on our Web site and by text message to passengers who have booked online. — [4] —`;

const DATA_ANALYST_INTERVIEW_EMAIL = `To: Lucía Bermúdez
From: Talent Team, Orbis Analytics
Subject: Interview invitation
Date: 3 June

Dear Ms. Bermúdez,

Thank you for applying for the position of Data Analyst. We were impressed by your application and would like to invite you to an interview at our office on 12 June at 2 P.M.

The interview will last about one hour and will be held in two parts. First, you will meet Dr. Karim Haddou, the head of the analytics team. Then you will complete a short practical exercise on a computer, so there is no need to bring your own laptop.

Please let us know if this time is convenient for you by replying to this e-mail. Our office is at 40 Canal Street, on the sixth floor.

Best regards,
Ana Lucero, Talent Team`;

const TRAIN_DEPOT_FOOD_HALL_ARTICLE = `Food Hall Opens in Former Train Depot

DARNLEY — The old train depot on Station Street, empty for more than a decade, reopened last Friday as the Depot Food Hall. — [1] — The hall houses fourteen food stalls, two bars, and a bakery, all run by local businesses.

Developer Ramona Ellery said the project took three years to complete. "We kept the original brick walls and the iron roof," she said. — [2] — "We wanted people to feel the history of the building."

The food hall is open daily from 11 A.M. to 11 P.M. — [3] — On weekends, live music is performed on a small stage in the center of the hall. — [4] —`;

const WEB_DESIGN_INVOICE = `Invoice #2024-118 — Bluefin Web Design

Client: Corbel Architecture Ltd.
Date: 30 April
Due: 30 May

Description                                  Hours   Amount
Homepage redesign                              20     $1,600
Online portfolio (12 project pages)            15     $1,200
Contact form and map                            3       $240
Total                                                 $3,040

Note: As agreed, the photography for the portfolio pages was provided by the client and is not included in this invoice. A 5 percent discount applies if payment is received before 15 May.`;

const AIRPORT_TRAM_ARTICLE = `New Tram Line to Connect Airport

RIVERTON — The city of Riverton has approved plans for a new tram line between the central station and Riverton Airport. — [1] — Construction is expected to begin next spring and take about three years.

The 11-kilometer line will have nine stops, including one at the university campus. — [2] — Trams will run every ten minutes during the day, and the journey from the station to the airport will take 22 minutes.

Today, most travelers reach the airport by car or taxi, which often means long delays during rush hour. — [3] — City officials expect the tram to reduce traffic on the airport road by about 30 percent. — [4] —`;

const FARM_TEAM_DAY_EMAIL = `To: Sales Team
From: Hannah Lowe
Subject: Team day on 14 June
Date: 28 May

Hi all,

As promised, our team day will take place on Friday, 14 June. We will spend the morning at Greenhill Farm, where we will take part in a cooking class using vegetables from the farm's gardens. Lunch will be the food we prepare ourselves!

A bus will leave from the office at 8:30 A.M. and bring us back by 4 P.M. Please wear comfortable shoes, as we will also go on a short walk around the farm.

If you have any food allergies, please tell me by 7 June so that I can let the farm know.

Hannah`;

const LIBRARY_BOOK_SALE_NOTICE = `Annual Book Sale — Friends of the Wexford Library

The Friends of the Wexford Library will hold their annual book sale on 5 and 6 April in the library's main hall. — [1] — More than 8,000 used books, DVDs, and music CDs will be on sale, with most items priced at just €1.

On Sunday afternoon, from 2 to 4 P.M., all remaining items will be sold for €5 per bag. — [2] — Bags will be provided.

All money raised will be used to buy new books for the children's section. — [3] — Donations of used books are welcome until 28 March at the library's front desk. — [4] —`;

const TV_DELIVERY_TEXTS = `Dev Malhotra (1:05 P.M.)
Hi Joyce, it's Dev from Malhotra Electronics. Our driver is outside your building with the TV you ordered, but nobody is answering the intercom.

Joyce Ferreira (1:07 P.M.)
Oh no, I'm still at work! I thought the delivery was between 3 and 5.

Dev Malhotra (1:08 P.M.)
The driver finished his earlier deliveries faster than expected. He can come back at 4:30 if that's better for you.

Joyce Ferreira (1:09 P.M.)
That would be perfect. I'll be home by 4.

Dev Malhotra (1:10 P.M.)
Great. He'll also take away your old TV, as you requested.`;

const LUMEN_LIGHTING_PROFILE = `Small Firm, Big Ideas: Lumen Lighting

When Greta Lindahl started Lumen Lighting in 2016, she sold handmade lamps at weekend markets. — [1] — Today, her company designs lighting for restaurants, hotels, and offices across Scandinavia.

Lumen Lighting's lamps are made from recycled glass and metal. — [2] — Each lamp is assembled by hand in the company's workshop in Aarhus, where twelve people are now employed.

Ms. Lindahl believes good lighting changes how people feel in a room. "Bad lighting can make a beautiful space feel cold," she says. — [3] — The company's next project is a line of lamps for homes, which will be sold online from next year. — [4] —`;

const PARKING_GARAGE_CLOSURE_MEMO = `MEMO
To: All staff
From: Building Management
Date: 15 January

The staff parking garage will be closed from 3 to 14 February while the floor is repainted and new lights are installed. During this period, staff may park at the Corwin Street public garage, two blocks away.

The company will cover the cost of parking at Corwin Street. To use this service, collect a parking card from the reception desk before 31 January. Each card is valid for the full closure period.

Staff who usually cycle or take public transport are not affected by this change.`;

const ESCAPE_ROOM_WEB_PAGE = `Puzzle Vault Escape Rooms — Book Your Adventure

Can your team escape in 60 minutes? At Puzzle Vault, groups of two to six players are locked in a themed room and must solve puzzles to find the key. — [1] — We currently offer three rooms: "The Lost Pharaoh," "Space Station Zero," and "The Detective's Office."

Our rooms are popular with families, friends, and companies looking for a team-building activity. — [2] — Players must be at least 12 years old, and children under 16 must be accompanied by an adult.

Prices start at €20 per person. Please arrive fifteen minutes before your booking so that our staff can explain the rules. — [3] — Late arrivals may have less time to play. — [4] —`;

const RENT_INCREASE_LETTER = `Dear Mr. Achterberg,

I am writing to let you know that the rent for your apartment at 18 Linden Court will increase from €980 to €1,010 per month from 1 July. This is the first increase in three years and reflects higher maintenance and insurance costs.

As part of this year's improvements, new energy-efficient windows will be installed in all apartments in May. You will receive a letter with the exact date at least two weeks in advance.

If you have any questions, please call me at 555-0127 on weekdays between 9 A.M. and 5 P.M.

Sincerely,
Monique Vasseur, Property Manager`;

const QUIET_CARRIAGE_ARTICLE = `Quiet Carriages Coming to Westway Trains

Westway Trains will add a "quiet carriage" to all of its intercity services from 1 September. — [1] — In these carriages, passengers will be asked not to make phone calls, play music without headphones, or have loud conversations.

The idea came from a survey of 5,000 passengers. — [2] — Nearly two-thirds of them said they would like a calmer place to work or read during their journey.

Quiet carriages will be marked with blue signs on the doors and windows. — [3] — Train staff will politely remind passengers of the rules if necessary. — [4] —`;

const CINEMA_REWARDS_EMAIL = `To: Starlight Cinemas members
From: members@starlightcinemas.com
Subject: Changes to Starlight Rewards
Date: 1 March

Dear member,

From 1 April, Starlight Rewards will change to make it simpler to use. — [1] — Instead of collecting points, members will receive a free ticket after every eight tickets bought.

Members will also get 20 percent off snacks and drinks on Tuesdays. — [2] — Points you have already collected will not be lost: they will be turned into free tickets automatically at the end of March. — [3] —

Thank you for being a Starlight member. — [4] —

The Starlight Cinemas Team`;

const EMAIL_WORKSHOP_FEEDBACK_FORM = `Workshop Feedback Form — "Writing Clear Business E-mails"

Participant: Oskar Brandt
Date of workshop: 22 October
Trainer: Celia Montes

Please rate the following (1 = poor, 5 = excellent):
Content of the workshop: 5
Trainer's explanations: 5
Workshop materials: 3
Room and equipment: 2

Comments: The exercises were very useful, and I've already changed the way I write to clients. However, the handouts had several printing errors, and the projector stopped working twice. I would like to take the advanced course if it is offered next year.`;

const SCHOOL_LUNCH_FARMS_ARTICLE = `Local Farms Supply School Lunches

GRANTHAM VALLEY — Since January, five schools in Grantham Valley have been serving lunches made with fruit and vegetables from nearby farms. The program, run by the district's education office, now provides about 2,400 meals a day. — [1] —

Farmers deliver their produce to a central kitchen twice a week. — [2] — There, cooks prepare the meals, which are then delivered to each school in heated containers.

Parents have welcomed the change. "My son never ate carrots before," said parent Lorna Fitch. "Now he asks for them at home!" — [3] — The education office plans to add three more schools to the program next year. — [4] —`;

const VISITOR_SIGN_IN_NOTICE = `Notice to All Visitors and Staff — Corbridge Medical Research Center

From Monday, 3 March, all visitors must sign in using the new touch screens at the main entrance. Visitors will be asked to enter their name, company, and the name of the person they are visiting. A visitor badge will then be printed automatically.

Staff must accompany their visitors throughout the visit, starting in the lobby. Visitor badges must be worn at all times and returned to reception when leaving the building.

The paper sign-in book will no longer be used.`;

const SUMMIT_HOTEL_RATES_MULTI = `DOCUMENT 1 — Web page: Hotel Solenne, Lyon
Special rates for participants of the European Packaging Summit (17–19 September)

Standard room ................ €120 per night
Superior room (city view) .... €145 per night
Suite ........................ €210 per night

Rates include breakfast and a free shuttle service to the Lyon Convention Center. To receive these rates, enter the code EPS25 when booking. Rooms are limited and must be booked by 15 August. After this date, regular prices will apply.

DOCUMENT 2 — E-mail
To: reservations@hotelsolenne.fr
From: Takumi Hayashi
Date: 20 August
Subject: Booking for the Packaging Summit

Hello,

I would like to book a room with a view of the city for the nights of 16, 17, and 18 September. I tried to use the code EPS25 on your Web site, but it was not accepted. Could you please tell me why?

I will also be traveling with a colleague, Ms. Ines Fabre, who needs a standard room for the same nights.

Best regards,
Takumi Hayashi`;

const STORE_SUPERVISOR_JOB_MULTI = `DOCUMENT 1 — Job advertisement
Ferrow Outdoor Gear — Store Supervisor (Glenmore branch)

We are looking for an experienced supervisor to manage a team of eight at our Glenmore store. Responsibilities include creating staff schedules, training new employees, and managing stock. Applicants must have at least two years of supervisory experience in retail. An interest in hiking or camping is a plus. Send your CV and a cover letter to hr@ferrowgear.com by 10 March.

DOCUMENT 2 — E-mail
To: hr@ferrowgear.com
From: Callum Reid
Date: 6 March
Subject: Store Supervisor application

Dear Hiring Manager,

Please find attached my CV and cover letter for the Store Supervisor position. For the past three years, I have been assistant manager at Penwick Sports, where I supervise a team of six. I have also led hiking trips for my local walking club for many years.

I would be happy to come for an interview at any time.

Yours sincerely,
Callum Reid

DOCUMENT 3 — E-mail
To: Callum Reid
From: Orla Keane, Ferrow Outdoor Gear
Date: 12 March
Subject: RE: Store Supervisor application

Dear Mr. Reid,

Thank you for your application. We would like to invite you to an interview at our Glenmore store on 18 March at 10 A.M. You will meet the store manager, Declan Shaw, and the regional manager. Please bring a copy of your driver's license, as the position sometimes involves driving the company van.

Kind regards,
Orla Keane, Human Resources`;

const OFFICE_CATERING_MULTI = `DOCUMENT 1 — Menu: Tilda's Kitchen Office Catering

Sandwich platter (serves 10) .... $65
Salad bowl (serves 8) ........... $40
Fruit platter (serves 10) ....... $35
Pastry box (12 pieces) .......... $28

Free delivery for orders over $150 within the city. Orders must be placed at least 48 hours in advance. Vegetarian and gluten-free options are available on request at no extra cost.

DOCUMENT 2 — E-mail
To: orders@tildaskitchen.com
From: Beatriz Coelho, Arden Legal Services
Date: Monday, 4 November
Subject: Order for Thursday

Hello,

We are holding a training day for 20 employees on Thursday, 7 November, and would like to order lunch: two sandwich platters, two salad bowls, and one fruit platter. Two of our employees are vegetarian, so please make sure some of the sandwiches are suitable for them.

Could you deliver everything by 12:15 P.M. to our office at 9 Gresham Street? Please send the invoice to accounts@ardenlegal.com.

Thank you,
Beatriz Coelho`;

const SKILLS_WEEK_SCHEDULE_MULTI = `DOCUMENT 1 — Schedule
Fernhill Business Skills Week — Workshop Schedule (Room 2B)

Monday 9:00–11:00 — Negotiation Basics (Ruth Adair)
Tuesday 9:00–11:00 — Presenting with Confidence (Tobias Wren)
Wednesday 14:00–16:00 — Managing Your Time (Ruth Adair)
Thursday 9:00–11:00 — Writing Effective Reports (Lina Sørensen)
Friday 14:00–16:00 — Leading Meetings (Tobias Wren)

All workshops are free for employees. Places are limited to 25 people.

DOCUMENT 2 — E-mail
To: All employees
From: Training Department
Date: 2 May
Subject: Change to Business Skills Week

Dear colleagues,

Because Ms. Sørensen has to attend a client meeting on Thursday, her workshop will be moved to Friday at 9:00. The workshop that was planned for Friday afternoon will take place as scheduled. Also, Room 2B will be used for job interviews on Thursday, so there will be no workshop that day.

If you have already registered for Ms. Sørensen's workshop, you do not need to register again.`;

const COFFEE_MAKER_REVIEW_MULTI = `DOCUMENT 1 — Product page
Brewmaster Duo Coffee Maker — $149

Make coffee and espresso with one machine! The Brewmaster Duo has a 1.5-liter water tank, a built-in milk frother, and a timer that lets you wake up to fresh coffee. Available in black, silver, and red. Two-year warranty.

DOCUMENT 2 — Customer review ★★☆☆☆
Posted by Ulla K., 3 March

The coffee from this machine tastes great, and the frother works well. Unfortunately, the timer stopped working after only five weeks. Also, the silver color I ordered looked more gray than silver in real life. I expected better for this price.

DOCUMENT 3 — Response from Brewmaster
Posted 4 March

Dear Ulla, thank you for your feedback, and we're sorry about the timer. Please contact our support team at help@brewmaster.com with your order number, and we will send you a replacement machine free of charge. We will also pass your comment about the color on to our design team.`;

const GLASSHOUSE_VENUE_MULTI = `DOCUMENT 1 — Advertisement
The Glasshouse at Ardley Gardens

Host your next event surrounded by plants and natural light! The Glasshouse can hold up to 120 guests for dinners or 200 for standing receptions. Our in-house team can provide food, drinks, music, and decorations.

Weekday rental (Monday–Thursday): €1,800
Weekend rental (Friday–Sunday): €2,600
Prices include tables, chairs, and cleaning. Visits can be arranged on Tuesday and Thursday afternoons.

DOCUMENT 2 — E-mail
To: events@ardleygardens.com
From: Pieter Vos, Halden Pharmaceuticals
Date: 9 January
Subject: Company dinner

Hello,

We are planning a dinner for about 140 employees to celebrate our company's fiftieth anniversary in late May. We are looking at Friday, 30 May. Is the Glasshouse available that evening, and would it be large enough for us? I would also like to visit the venue before making a decision.

Best regards,
Pieter Vos

DOCUMENT 3 — E-mail
To: Pieter Vos
From: Imogen Hart, Ardley Gardens
Date: 10 January
Subject: RE: Company dinner

Dear Mr. Vos,

Thank you for your interest. The Glasshouse is free on 30 May. However, for a seated dinner of 140 people, I would recommend our Orangery Hall, which seats up to 180 and is located right next to the Glasshouse. It is available on the same date for the same price. I would be happy to show you both rooms on Tuesday, 14 January, at 3 P.M., if that suits you.

Best wishes,
Imogen Hart`;

const HIGHLAND_TOURS_MULTI = `DOCUMENT 1 — Brochure
Highland Day Tours from Inverlochy

Tour A — Lakes and Castles: daily, 8:30 A.M.–6 P.M. — £65
Tour B — Whisky and Wildlife: Tuesdays and Saturdays, 9 A.M.–5 P.M. — £75 (includes two distillery visits)
Tour C — Island Ferry Adventure: Wednesdays and Sundays, 7:30 A.M.–8 P.M. — £95 (includes ferry tickets and lunch)

All tours leave from the Inverlochy Visitor Center. Children under 12 travel for half price. Please book at least two days before your tour.

DOCUMENT 2 — E-mail
To: bookings@highlanddaytours.co.uk
From: Margaux Leclerc
Date: Sunday, 14 July
Subject: Tour booking

Hello,

I would like to book a tour for my family (two adults and one child aged 9) for this Wednesday. We are interested in the tour that includes lunch. Could you also tell me where we should park our car on the day?

Thank you,
Margaux Leclerc`;

const OFFICE_SUPPLIES_ORDER_MULTI = `DOCUMENT 1 — Order confirmation
Penmark Office Supplies — Order #PO-7731
Customer: Thornfield Accountants
Date: 2 September

Item                        Quantity   Unit price   Total
Printer paper (box of 5)       10          $24        $240
Blue pens (pack of 50)          4          $12         $48
Desk organizers                 6          $18        $108
Total                                                 $396

Estimated delivery: 5 September

DOCUMENT 2 — E-mail
To: support@penmark.com
From: Gilles Moreau, Thornfield Accountants
Date: 6 September
Subject: Order #PO-7731

Hello,

Our order arrived yesterday, but there was a problem. We received black pens instead of blue ones, and only four of the six desk organizers were in the box. The paper was correct.

Please send us the missing items and the correct pens as soon as possible. Your driver can collect the black pens when he delivers the new items.

Regards,
Gilles Moreau`;

const COMMUNITY_GARDEN_PLOTS_MULTI = `DOCUMENT 1 — Notice
Millbrook Community Garden — Plots Available

Millbrook Community Garden has six plots available for the new growing season, which begins on 1 March. Small plots (2 × 4 meters) cost $40 per year, and large plots (4 × 4 meters) cost $70 per year. Gardeners have access to tools, water, and a shared compost area.

Applications must be received by 15 February. If there are more applications than plots, they will be chosen by lottery.

DOCUMENT 2 — Application form
Name: Esther Mwangi
Address: 22 Oak Lane, Millbrook
Plot size requested: ☐ Small ☑ Large
Gardening experience: I have grown vegetables on my balcony for three years.
Date: 10 February

DOCUMENT 3 — E-mail
To: Esther Mwangi
From: Millbrook Community Garden
Date: 20 February
Subject: Your application

Dear Ms. Mwangi,

We received fourteen applications for the six available plots. We are happy to tell you that you were selected in our lottery! Please pay your annual fee by 1 March at the garden office, which is open on Saturdays from 10 A.M. to noon.

Welcome to the garden!`;

const CAR_RENTAL_FUEL_MULTI = `DOCUMENT 1 — Rental summary
Swiftway Car Rental — Rental Agreement #SW-20451
Customer: Rafael Mendonça
Vehicle: Compact (Renault Clio or similar)
Pick-up: Faro Airport, 3 August, 10:00
Return: Faro Airport, 10 August, 10:00
Price: €294 (7 days × €42)

Fuel policy: The car is provided with a full tank and must be returned full. If it is not, a refueling charge of €2.50 per liter will apply.
Extra driver: not included (add for €8 per day).

DOCUMENT 2 — E-mail
To: help@swiftway.com
From: Rafael Mendonça
Date: 14 August
Subject: Charge on my card

Hello,

I returned my rental car at Faro Airport on 10 August. Today I noticed an extra charge of €25 on my credit card. I believe this is a refueling charge, but I filled the tank at a station near the airport just before returning the car. I have kept the receipt from the gas station, which shows the time and the amount.

Could you please check this and refund the charge?

Regards,
Rafael Mendonça`;

const CORVALE_BIKE_LANES_MULTI = `DOCUMENT 1 — Article
Bike Lanes Planned for Corvale Avenue
(12 March) — The Corvale city council has approved a plan to add protected bike lanes along Corvale Avenue, the city's main shopping street. The project will remove 60 of the street's 140 parking spaces. Work will begin in June and is expected to be completed before the end of September.

Councilor Abel Fontaine said the lanes would make cycling safer and bring more customers to local shops. "People on bicycles stop more often than people in cars," he said.

DOCUMENT 2 — Letter to the editor
(19 March)
I read with interest your article about the Corvale Avenue bike lanes. As the owner of a bakery on the avenue, I support safer streets, but I am worried about losing so many parking spaces. Many of my customers are older people who cannot easily walk long distances.

Could the city open the parking garage on Hale Street to shoppers for free on weekends? This would help businesses like mine during the busiest days of the week.

— Odette Lambrecht, Corvale`;

const ENERGY_INTERNSHIP_MULTI = `DOCUMENT 1 — Web page
Verdant Energy Summer Internship Program

Each summer, Verdant Energy offers paid internships to university students in engineering, finance, and communications. Internships last ten weeks, from mid-June to late August, and take place at our offices in Rotterdam and Hamburg.

Interns receive a monthly payment of €1,400, and those who come from outside the city receive help finding accommodation. Applications open on 1 February and close on 15 March.

DOCUMENT 2 — E-mail
To: internships@verdantenergy.com
From: Nadia Elkassem
Date: 18 March
Subject: Internship question

Hello,

I am a third-year finance student at Utrecht University, and I am very interested in your summer internship program. Unfortunately, I only found out about it today. Is it still possible to apply? I would prefer to work in your Rotterdam office.

Thank you,
Nadia Elkassem

DOCUMENT 3 — E-mail
To: Nadia Elkassem
From: Joost van Leeuwen, Verdant Energy
Date: 19 March
Subject: RE: Internship question

Dear Ms. Elkassem,

Thank you for your interest. Applications for this year are closed, but our communications team in Hamburg still has one place available because a student withdrew. If you are interested, please send your CV by 25 March. Otherwise, I encourage you to apply for next year's program.`;

const FURNITURE_SALE_DELIVERY_MULTI = `DOCUMENT 1 — Advertisement
Oakhaven Furniture — Spring Sale, 1–15 April

Sofas ............. 30% off
Dining tables ..... 20% off
Office chairs ..... 15% off
Rugs .............. 10% off

Free delivery on orders over $500. Orders under $500 can be delivered for $45. Delivery takes place on weekdays only.

DOCUMENT 2 — E-mail
To: Oakhaven Furniture Customer Service
From: Ji-ho Ahn
Date: 9 April
Subject: My order #OF-3392

Hello,

On 3 April, I bought a dining table in your Westfield store. The regular price was $600. When I paid, I was told the delivery would be free. However, my receipt shows a delivery charge of $45.

Also, I work during the week. Would it be possible to have the table delivered on Saturday morning instead?

Thank you,
Ji-ho Ahn`;

const RESIDENT_PARKING_PERMIT_MULTI = `DOCUMENT 1 — Notice
Resident Parking Permits — Elmstead District

From 1 June, parking on streets in the Elmstead District will be limited to two hours for non-residents between 8 A.M. and 6 P.M., Monday to Saturday. Residents can apply for a permit that allows unlimited parking near their home.

Permit fees: first car €30 per year; second car €60 per year. Applicants must show proof of address and the vehicle's registration document.

DOCUMENT 2 — Application form
Applicant: Henrik Aalto
Address: 7 Birchway Road, Elmstead
Number of vehicles: 2
Documents attached: ☑ Proof of address ☑ Registration (vehicle 1) ☐ Registration (vehicle 2)
Date: 20 May

DOCUMENT 3 — E-mail
To: Henrik Aalto
From: Elmstead Parking Office
Date: 23 May
Subject: Your permit application

Dear Mr. Aalto,

Thank you for your application. Your permit for your first vehicle has been approved and will be mailed to you this week. For your second vehicle, we need one more document before we can process your request. Please upload it on our Web site or bring it to our office.`;

const RETAIL_CONFERENCE_UPDATE_MULTI = `DOCUMENT 1 — Program excerpt
Future of Retail Conference — Day 2 (Thursday, 23 October)

9:00 A.M. — Keynote: "Shopping in 2035" — Priyanka Sood, CEO, Cartwheel Commerce (Main Hall)
10:30 A.M. — Panel: Small Stores, Big Data (Room A)
12:00 P.M. — Lunch (Main Hall)
1:30 P.M. — Workshop: Designing Better Store Layouts (Room C) — limited to 30 participants; registration required
3:00 P.M. — Closing remarks (Main Hall)

DOCUMENT 2 — E-mail
To: Conference participants
From: Organizing Committee
Date: 20 October
Subject: Program update

Dear participants,

Please note that Ms. Sood's flight has been delayed, so she will now give her keynote speech at 3:00 P.M., just before the closing remarks. The panel discussion will start at 9:00 A.M. instead, in the same room as planned. All other events will remain unchanged.

The 1:30 P.M. workshop is now fully booked. Participants who did not register can join the waiting list at the information desk.`;

const DRY_CLEANING_PICKUP_MULTI = `DOCUMENT 1 — Price list
Crisp & Clean Dry Cleaners

Shirt ............... $4
Trousers ............ $7
Suit (2 pieces) ..... $16
Winter coat ......... $22
Wedding dress ....... from $90

Standard service: ready in 3 days. Express service (ready the next day): add 50 percent.
Free pick-up and delivery for orders over $40.

DOCUMENT 2 — E-mail
To: info@crispandclean.com
From: Tomasz Wierzbicki
Date: Monday, 10 February
Subject: Pick-up request

Hello,

I would like to arrange a pick-up from my apartment at 31 Lark Street. I have two suits and three shirts that need cleaning. I need one of the suits for a job interview on Thursday morning, so could that suit be cleaned with your express service? The rest can be done with the standard service.

Thank you,
Tomasz Wierzbicki`;

const ART_MUSEUM_MEMBERSHIP_MULTI = `DOCUMENT 1 — Membership options
Holloway Museum of Modern Art

Individual — $60 per year: free entry for one person, 10% off in the museum shop
Dual — $95 per year: free entry for two adults at the same address, 10% off in the shop
Family — $120 per year: free entry for two adults and up to four children, 15% off in the shop, invitations to family workshops
Patron — $300 per year: all Family benefits, plus private tours and invitations to exhibition openings

DOCUMENT 2 — E-mail
To: members@hollowaymoma.org
From: Dalia Ferreira-Grant
Date: 2 April
Subject: Membership upgrade

Hello,

My husband and I have had a Dual membership for two years. Now that our daughter is old enough to enjoy the museum, we would like to change to a membership that includes her. She is especially interested in the family workshops she has seen advertised.

Our current membership ends in June. Is it possible to upgrade now and pay only the difference?

Best regards,
Dalia Ferreira-Grant`;

const SEAFOOD_GRILL_REVIEW_MULTI = `DOCUMENT 1 — Online review ★★★☆☆
The Saltmarsh Grill, Port Wenham — reviewed by Gareth P., 16 June

We had dinner at the Saltmarsh Grill last Saturday to celebrate my mother's birthday. The seafood was excellent, especially the grilled sea bass, and the view of the harbor was beautiful. However, we waited almost forty minutes for our main courses, and nobody explained the delay. When I mentioned the birthday while booking, I was told that a small cake could be prepared, but it never arrived.

DOCUMENT 2 — Response from the owner
17 June

Dear Gareth, thank you for your honest review, and please accept our apologies. Last Saturday, two of our kitchen staff were ill, and we should have informed our guests about the longer waiting times. I am also sorry that the birthday cake was forgotten; the message was not passed on to the kitchen. We would like to invite you and your mother back for dinner as our guests. Please call me directly at 555-0182.

Maren Holt, Owner`;

const FIRST_AID_COURSE_MULTI = `DOCUMENT 1 — Course information
Red Harbor First Aid Training

One-day First Aid at Work course
Dates: 6 May, 20 May, 3 June
Time: 9:00 A.M.–4:30 P.M.
Location: Red Harbor Training Center, 15 Quay Street
Price: £120 per person; groups of five or more from the same company pay £100 per person.
Participants receive a certificate valid for three years.

DOCUMENT 2 — E-mail
To: bookings@redharbortraining.co.uk
From: Selin Arslan, Office Manager, Brightfold Packaging
Date: 22 April
Subject: Booking for 20 May

Hello,

I would like to book places for six of our employees on the First Aid at Work course on 20 May. Their names are listed in the attached file. Two of them completed the course three years ago, so this will be a renewal for them.

Please send the invoice to our accounts department.

Kind regards,
Selin Arslan`;

const RADIATOR_REPAIR_MULTI = `DOCUMENT 1 — Maintenance request form
Westbrook Apartments
Name: Yusuf Demir    Apartment: 4C
Problem: The heating in the bedroom does not work. The radiator stays cold even when it is turned on.
When can we enter your apartment?  ☑ Weekday mornings  ☐ Weekday afternoons  ☐ Saturdays
Date submitted: Monday, 18 November

DOCUMENT 2 — E-mail
To: Yusuf Demir
From: Westbrook Apartments Management
Date: 18 November
Subject: Your request

Dear Mr. Demir,

Thank you for your request. A technician will visit your apartment on Wednesday, 20 November. If the radiator needs a new part, it may take up to a week to arrive. In the meantime, we can lend you an electric heater, which you can pick up from the management office.

DOCUMENT 3 — Text message
From: Leon (Technician) — Wednesday, 20 November, 8:05 A.M.
Hi Mr. Demir, this is Leon from Westbrook maintenance. I'm running about thirty minutes late because of another job. I should be at your door around 9:30. Sorry for the inconvenience!`;

const COWORKING_PLANS_MULTI = `DOCUMENT 1 — Price list
Nest Coworking — Membership Plans

Flex — €150/month: access 10 days per month, any free desk
Resident — €280/month: unlimited access, any free desk
Dedicated — €380/month: unlimited access, your own desk with a lockable drawer

All plans include high-speed internet, coffee and tea, and 4 hours per month of meeting room use. Extra meeting room hours: €15 per hour.

DOCUMENT 2 — E-mail
To: hello@nestcoworking.com
From: Bram Visser
Date: 3 September
Subject: Membership

Hello,

My new job means that I will need to work from your space every weekday from October. I have been a Flex member since March. I also carry a lot of documents with me, so I would like to have a place to store them safely.

I will need a meeting room for about six hours each month to meet clients. Could you tell me which plan is best for me and how much I would pay?

Thanks,
Bram Visser`;

const DOCUMENTARY_FESTIVAL_MULTI = `DOCUMENT 1 — Festival program (Saturday)
Northlight Documentary Festival — Saturday, 12 October

Cinema 1
14:00 — "Ice Roads" (95 min), followed by a Q&A with the director
17:00 — "The Last Lighthouse Keepers" (80 min)
20:00 — "Salt of the Desert" (110 min)

Cinema 2
15:00 — "Paper Cities" (70 min)
18:30 — "Night Bakers" (65 min), followed by a Q&A with the director

Single ticket: €9. Day pass (all Saturday films): €30.

DOCUMENT 2 — E-mail
To: tickets@northlightfest.org
From: Amelie Strand
Date: 2 October
Subject: Saturday tickets

Hello,

I would like to see four films on Saturday, including both films with a question-and-answer session. Could you tell me if a day pass would save me money? Also, is it possible to change a ticket to another film if I change my mind?

Thanks,
Amelie Strand`;

const HOTEL_BREAKFAST_FEEDBACK_MULTI = `DOCUMENT 1 — Guest survey
Larkspur Hotel — Guest Feedback
Guest: Mr. Oduya, Room 512
Dates of stay: 8–11 May

Please rate (1 = poor, 5 = excellent):
Check-in: 5    Room cleanliness: 4    Breakfast: 2    Staff friendliness: 5

Comments: The staff at reception were wonderful. The room was quiet and comfortable. However, breakfast was disappointing: by 8:30 A.M., many items had run out and were not replaced. As I travel to this city every month for work, I hope this improves.

DOCUMENT 2 — E-mail
To: Mr. Oduya
From: Caroline Fenn, Guest Relations Manager, Larkspur Hotel
Date: 14 May
Subject: Your feedback

Dear Mr. Oduya,

Thank you for completing our survey. I have shared your comments about breakfast with our restaurant manager. From 1 June, we will add a second buffet table and refill dishes more often during busy times.

As a regular guest, you are welcome to join our free Larkspur Club, which offers late check-out and a 10 percent discount on all stays. I have attached a registration form.`;

const MUSEUM_TRANSLATORS_MULTI = `DOCUMENT 1 — Notice
Volunteers Needed: Museum Guide Translations

The Arnsberg Maritime Museum is producing a new visitor guide in six languages: English, French, Spanish, Japanese, Chinese, and Arabic. We are looking for volunteer translators who are native speakers of one of these languages and who also read German well. Translators will work from home and should be able to complete about twenty pages by 31 January.

All volunteers will receive a one-year museum pass, and their names will be printed in the guide. Please send a short message describing your experience to guide@arnsbergmaritime.de.

DOCUMENT 2 — E-mail
To: guide@arnsbergmaritime.de
From: Haruto Kimura
Date: 4 December
Subject: Translation volunteer

Hello,

I saw your notice in the museum lobby last weekend. I am a native Japanese speaker and have lived in Germany for twelve years, where I work as a technical translator for an engineering company. I would be happy to translate the guide into Japanese.

I will be traveling in Japan from 20 December to 6 January, but I can work on the translation during my trip.

Best regards,
Haruto Kimura`;

const BEDDING_RETURN_MULTI = `DOCUMENT 1 — Return policy
Tallow & Pine Home Goods — Returns

Most items can be returned within 30 days of delivery for a full refund. Items must be unused and in their original packaging. Candles and bedding cannot be returned unless they are damaged. Returns are free if you use the prepaid label included in your package; otherwise, you must pay for shipping yourself. Refunds are made to the original payment method within ten days of receiving the item.

DOCUMENT 2 — E-mail
To: support@tallowandpine.com
From: Corinne Abara
Date: 12 March
Subject: Return

Hello,

I received my order on 2 March. I would like to return the linen sheets because the color is very different from the photo on your Web site. The sheets have not been used, and they are still in the original bag. Unfortunately, I threw away the prepaid label by mistake.

Regards,
Corinne Abara

DOCUMENT 3 — E-mail
To: Corinne Abara
From: Tallow & Pine Support
Date: 13 March
Subject: RE: Return

Dear Ms. Abara,

We are sorry the sheets were not what you expected. Although we do not usually accept returns of bedding, we will make an exception because the color in our photo was not accurate. We have e-mailed you a new prepaid label. Please print it and attach it to the package.`;

const MILAN_BUYER_TRIP_MULTI = `DOCUMENT 1 — Travel itinerary
Prepared for: Naledi Khumalo, Senior Buyer, Umoya Textiles
Trip: Johannesburg – Milan – Johannesburg

Mon 3 Nov: Depart Johannesburg 20:15 (overnight flight)
Tue 4 Nov: Arrive Milan 07:05. Hotel: Albergo Centrale (3 nights)
Tue 4 Nov: 14:00 Meeting with Filati Rossi (fabric supplier)
Wed 5 Nov: All day — Milan Textile Fair, Hall 3
Thu 6 Nov: 10:00 Factory visit, Como (car service provided)
Fri 7 Nov: Depart Milan 09:40; arrive Johannesburg 21:30

DOCUMENT 2 — E-mail
To: Naledi Khumalo
From: Giulia Benedetti, Filati Rossi
Date: 28 October
Subject: Our meeting

Dear Ms. Khumalo,

We are looking forward to your visit. Unfortunately, our office will be closed on the afternoon of your arrival because of a local holiday. Would it be possible to meet on Thursday afternoon instead, after your visit to Como? Our office is on the road from Como to Milan, so our driver could bring you directly to us.

Best regards,
Giulia Benedetti`;

const BAKERY_WHOLESALE_MULTI = `DOCUMENT 1 — Letter
Hearthstone Bakery — Wholesale Customers

Dear valued customer,

Starting 1 September, Hearthstone Bakery will deliver to wholesale customers six days a week instead of five. Saturday deliveries will be available for orders placed by Thursday at 3 P.M. In addition, customers who order more than 200 items per week will receive a 5 percent discount.

We are also introducing two new breads: a rye loaf and an olive focaccia. Free samples will be included with all deliveries during the first week of September.

Sincerely,
Rowan Pike, Sales Manager

DOCUMENT 2 — E-mail
To: Rowan Pike
From: Mirela Popa, Owner, Corner Plate Café
Date: 25 August
Subject: Saturday deliveries

Dear Mr. Pike,

Thank you for your letter. Saturday is our busiest day, so we are very pleased about the new delivery schedule. We would like to receive 40 croissants and 20 baguettes every Saturday, in addition to our usual weekday order of 150 items per week.

Could you also tell me whether the olive focaccia contains nuts? Several of our customers have allergies.

Kind regards,
Mirela Popa`;

const EVENT_PHOTOGRAPHY_MULTI = `DOCUMENT 1 — Price list
Lumi Studio Photography — Event Packages

Basic: 3 hours of photography, 150 edited photos — $450
Standard: 5 hours, 300 edited photos, online gallery — $700
Premium: 8 hours, 500 edited photos, online gallery, printed photo book — $1,100

Travel outside the city: $1 per kilometer. Photos are delivered within two weeks of the event.

DOCUMENT 2 — E-mail
To: bookings@lumistudio.com
From: Valentina Ferri, Corlake Marketing
Date: 3 April
Subject: Company event on 17 May

Hello,

We are organizing a five-hour product launch on 17 May at the Corlake Hotel, about 40 km outside the city. We would like about 250 edited photos and an online gallery so that our staff can download the images. We don't need a printed book.

Could you confirm that you are available? We will need the photos by 31 May at the latest for our newsletter.

Best regards,
Valentina Ferri`;

const LIBRARY_EBOOK_APP_MULTI = `DOCUMENT 1 — Web page
Borrow e-books with the Lindale Library app!

Library members can borrow up to five e-books at a time for 21 days. Books return automatically at the end of the loan period, so there are never any late fees. Popular titles may have a waiting list; you will receive a notification when a book becomes available. To log in, use your library card number and PIN.

DOCUMENT 2 — E-mail
To: help@lindalelibrary.org
From: Karim Sayed
Date: 9 October
Subject: Can't log in

Hello,

I've been a library member for years, but I have never used the app before. When I try to log in, I am asked for a PIN, but I don't remember ever receiving one. Also, I'd like to borrow "The Glass Harbor," but the app says there are twelve people waiting. Is there a way to get it sooner?

Thanks,
Karim Sayed

DOCUMENT 3 — E-mail
To: Karim Sayed
From: Lindale Library Help Desk
Date: 10 October
Subject: RE: Can't log in

Dear Mr. Sayed,

Members who joined before 2019 were not given a PIN automatically. You can create one at any of our branches by showing your library card. As for "The Glass Harbor," the e-book is very popular, but we also have four printed copies. One of them is currently available at the Riverside branch.`;

const CAFETERIA_SURVEY_MULTI = `DOCUMENT 1 — Memo
To: All staff
From: Workplace Committee
Date: 2 February
Subject: Lunch survey results

Thank you to everyone who answered our survey about the company cafeteria. Here are the main results:
• 68% would like more vegetarian dishes
• 54% think lunch prices are too high
• 41% would like the cafeteria to open earlier for breakfast
• 22% are happy with the menu as it is

Based on these results, we have asked our caterer to add two vegetarian dishes every day starting 1 March. We will discuss the other results with management at our next meeting.

DOCUMENT 2 — E-mail
To: Workplace Committee
From: Livia Marchetti
Date: 5 February
Subject: Survey results

Hello,

Thank you for sharing the results. I'm glad about the vegetarian dishes. However, I'm surprised that the results don't mention coffee. Many people in my department complained in the survey's comment section that the coffee machine on the second floor is often broken. Will this be discussed too?

Best,
Livia Marchetti, Design Department`;

const PLACEMENT_TEST_MULTI = `DOCUMENT 1 — Test results
Kensal Language Institute — Placement Test Results
Student: Mei-Ling Tsai
Test date: 2 September

Reading: 78/100
Listening: 64/100
Writing: 71/100
Speaking: 58/100
Overall level: B1 (Intermediate)

Students whose speaking score is under 60 are advised to join our weekly Conversation Club (free for enrolled students) in addition to their main course.

DOCUMENT 2 — E-mail
To: Mei-Ling Tsai
From: Kensal Language Institute
Date: 4 September
Subject: Your course

Dear Ms. Tsai,

Based on your test, you have been placed in our B1 evening course, which meets on Mondays and Thursdays from 6:30 to 8:30 P.M., starting 15 September. The course fee of £390 must be paid by 10 September.

Please note that the B1 morning course is already full. If you would prefer a morning course, places are still available in our B2 class, but we would not recommend it based on your results.`;

const BUSINESS_AWARDS_NOMINATION_MULTI = `DOCUMENT 1 — Announcement
Pinehurst Business Awards — Call for Nominations

Do you know a local business that deserves recognition? The Pinehurst Chamber of Commerce is accepting nominations in four categories: Best New Business (open less than two years), Best Customer Service, Green Business of the Year, and Community Partner. Nominations close on 30 April. Winners will be announced at a dinner at the Pinehurst Grand Hotel on 6 June.

DOCUMENT 2 — Nomination form
Nominated business: Fennel & Fig (vegetarian restaurant)
Opened: March, two years ago
Category: ☐ Best New Business  ☐ Best Customer Service  ☑ Green Business of the Year  ☐ Community Partner
Reason: Fennel & Fig grows many of its own vegetables on its rooftop, composts all its food waste, and delivers meals by electric bicycle.
Nominated by: Joaquín Ibarra, regular customer
Date: 12 April`;

const COMMUTER_PASS_MULTI = `DOCUMENT 1 — Web page
Lakeland Rail Commuter Passes

Monthly pass: unlimited travel between two chosen stations (price depends on distance)
Flex 10 pass: 10 single journeys between two chosen stations, valid for 60 days, 15% cheaper than buying 10 single tickets
Weekend add-on: travel anywhere on the Lakeland network on Saturdays and Sundays, £20 per month (monthly pass holders only)

Passes can be loaded onto a Lakeland smartcard or the Lakeland app.

DOCUMENT 2 — E-mail
To: passes@lakelandrail.co.uk
From: Owen Pryce
Date: 28 February
Subject: Which pass?

Hello,

From March, I will work in Kendrick two days a week and from home the other days. I live in Ambleside Park. Which pass would be best for me? I also like to go hiking in the hills near Fellside Halt on weekends with my family.

Thanks,
Owen Pryce

DOCUMENT 3 — E-mail
To: Owen Pryce
From: Lakeland Rail Customer Service
Date: 1 March
Subject: RE: Which pass?

Dear Mr. Pryce,

For two days a week, the Flex 10 pass is the best value. Please note, however, that the weekend add-on can only be combined with a monthly pass. For your weekend trips, we recommend our Family Day Ticket, which allows two adults and up to three children to travel anywhere on the network for one day for £32.`;

const CONCERT_HALL_RENOVATION_MULTI = `DOCUMENT 1 — Article
Hartwell Concert Hall to Close for Renovation
(5 February) — The Hartwell Concert Hall will close from 1 July for an eighteen-month renovation. The work will improve the hall's sound quality, add an elevator, and replace all 1,200 seats. During the closure, the Hartwell Symphony Orchestra will perform at the Grange Theatre, which has 800 seats.

Season ticket holders will be offered seats at the Grange Theatre first. "We know some regular concertgoers will be disappointed, but the renovated hall will be worth the wait," said director Emil Rasmussen.

DOCUMENT 2 — E-mail
To: tickets@hartwellsymphony.org
From: Beatrice Lowell
Date: 20 February
Subject: Next season

Hello,

I have had season tickets for the Hartwell Symphony for over fifteen years, always in Row C. I read about the renovation in the newspaper. Will I still be able to sit near the front at the Grange Theatre? Also, as I use a wheelchair, could you tell me whether the theatre is accessible?

Kind regards,
Beatrice Lowell`;

const IT_INVOICE_CORRECTION_MULTI = `DOCUMENT 1 — Invoice
Brightline IT Services — Invoice #4420
Client: Marlow & Finch Law Office
Date: 31 October

Service                                         Hours   Amount
Laptop setup for new employees (3 laptops)        6      $480
Network repair (visit on 14 October)              2      $160
Monthly support plan (October)                    —      $250
Total                                                   $890

Payment due within 30 days.

DOCUMENT 2 — E-mail
To: billing@brightline-it.com
From: Patrick Ebbs, Office Manager, Marlow & Finch
Date: 4 November
Subject: Invoice #4420

Hello,

I have a question about invoice #4420. Our monthly support plan includes up to two hours of repairs per month at no extra cost, and we did not use any other repair hours in October. So I believe we should not have been charged for the network repair on 14 October.

Could you please check this and send a corrected invoice?

Regards,
Patrick Ebbs

DOCUMENT 3 — E-mail
To: Patrick Ebbs
From: Brightline Billing
Date: 5 November
Subject: RE: Invoice #4420

Dear Mr. Ebbs,

You are right, and we apologize for the error. A corrected invoice is attached. As a thank-you for your patience, we have also given you a 10 percent discount on the laptop setup.`;

const OLD_TOWN_TOURS_MULTI = `DOCUMENT 1 — Flyer
Old Town Walking Tours — Valdora

Join our friendly local guides for a 2-hour walk through Valdora's historic Old Town!
• Morning tour (in English): daily at 10:00
• Afternoon tour (in Spanish): daily at 15:00
• Evening food tour (in English, with tastings): Fridays and Saturdays at 19:00

Meeting point: in front of the Cathedral. Morning and afternoon tours: €15. Food tour: €45. Children under 10 are free on all tours. Book online at valdoratours.es.

DOCUMENT 2 — E-mail
To: info@valdoratours.es
From: Gabriel Lefort
Date: 14 May
Subject: Food tour

Hello,

My wife and I will be in Valdora from Thursday, 22 May, to Sunday, 25 May. We would love to join the food tour, but my wife is allergic to shellfish. Would she still be able to enjoy the tastings?

Best regards,
Gabriel Lefort`;

const SCIENCE_CENTER_SCHOOL_VISIT_MULTI = `DOCUMENT 1 — Information for schools
Brackenridge Science Center — School Visits

School groups are welcome from Tuesday to Friday. Each visit includes a guided tour of our exhibitions and one 45-minute workshop. Workshops: "Electricity Explorers" (ages 8–11), "The Human Body" (ages 10–14), "Robots and Code" (ages 12–16).
Price: €6 per student. Teachers and assistants are free (one adult for every ten students).
Lunch can be eaten in our picnic room, which must be booked in advance.

DOCUMENT 2 — E-mail
To: schools@brackenridgescience.org
From: Ewa Nowicka, Ravenhill Primary School
Date: 10 January
Subject: Visit in March

Hello,

I would like to book a visit for 28 students aged 9 and 10, together with three teachers, on Monday, 16 March. We would like to do a workshop about electricity, and we will bring packed lunches.

Kind regards,
Ewa Nowicka

DOCUMENT 3 — E-mail
To: Ewa Nowicka
From: Brackenridge Science Center
Date: 11 January
Subject: RE: Visit in March

Dear Ms. Nowicka,

Thank you for your interest. Unfortunately, we do not accept school groups on the day you requested. We could offer you Tuesday, 17 March, instead. I have also reserved the picnic room for you from 12:00 to 12:45 on that day. Please confirm by 20 January.`;

const FLOWER_SUBSCRIPTION_MULTI = `DOCUMENT 1 — FAQ
Petalbox Flower Subscription — Frequently Asked Questions

How often will I receive flowers? You can choose weekly, every two weeks, or monthly deliveries.
Can I pause my subscription? Yes, you can pause for up to eight weeks, for example while you are on vacation, at no cost.
How do I cancel? Cancellations must be made at least five days before your next delivery. Cancellations made later will take effect after that delivery.
Can I send flowers as a gift? Yes! Gift subscriptions of three, six, or twelve months are available.

DOCUMENT 2 — E-mail
To: help@petalbox.com
From: Sunniva Berg
Date: Monday, 2 June
Subject: My subscription

Hello,

I have been receiving flowers every week for a year, and I have enjoyed them very much. However, I am moving abroad for work at the end of the month and will be away for at least a year, so I would like to cancel my subscription. My next delivery is on Thursday, 5 June. Will it still arrive?

Also, I would like to give my sister a six-month gift subscription for her birthday.

Thanks,
Sunniva Berg`;

const PARCEL_PICKUP_MULTI = `DOCUMENT 1 — E-mail
To: Lukas Brenner
From: ParcelGo Notifications
Date: 15 April
Subject: Your package is on its way

Your package from Harbourline Books (order #HB-55018) has been shipped. Expected delivery: Thursday, 17 April, between 1 P.M. and 5 P.M. A signature will be required on delivery. If you will not be home, you can choose a different delivery day or have the package left at a ParcelGo pick-up point in our app.

DOCUMENT 2 — Text messages
Lukas Brenner (Thursday, 17 April, 12:10 P.M.)
Hi Maja, are you home this afternoon? I have a package arriving between 1 and 5, but I'm stuck at the office.

Maja Brenner (12:14 P.M.)
I'll be back at 3. Before that, I'm at the dentist.

Lukas Brenner (12:15 P.M.)
Hmm, that's risky. I'll have it sent to the pick-up point next to the train station instead. I can collect it on my way home.

Maja Brenner (12:16 P.M.)
Good idea.`;

const HOTEL_MEETING_ROOMS_MULTI = `DOCUMENT 1 — Meeting room rates
Quayside Business Hotel

Room         Capacity   Half day   Full day
Harbor          20        €220       €380
Lighthouse      45        €340       €600
Admiral         90        €520       €900

All rates include a projector, flip charts, and water. Coffee breaks: €6 per person per break. Lunch buffet: €22 per person. Full-day events of more than 40 people receive a free coffee break in the afternoon.

DOCUMENT 2 — E-mail
To: events@quaysidehotel.com
From: Sana Qureshi, Norbridge Finance
Date: 7 February
Subject: Training day

Hello,

We are planning a full-day training session for 42 employees on 14 March. We will need a room with a projector, one coffee break in the morning and one in the afternoon, and lunch for everyone. Could you send me a quote?

Best regards,
Sana Qureshi`;

const CAREER_FAIR_MULTI = `DOCUMENT 1 — Announcement
Westvale Career Fair — Saturday, 9 November, 10 A.M.–4 P.M., Westvale Exhibition Center

More than 60 employers from healthcare, technology, hospitality, and construction will be looking for staff. Free CV-checking sessions will be offered by career advisers throughout the day; sign up at the information desk when you arrive, as places are limited. Entry is free, but visitors are asked to register online in advance at westvalecareers.org.

DOCUMENT 2 — E-mail
To: info@westvalecareers.org
From: Darius Navabi
Date: 4 November
Subject: Career fair

Hello,

I am a nurse and recently moved to Westvale. I plan to attend the career fair on Saturday. I would like to know whether the hospital groups attending will hold interviews at the fair or only collect CVs. I also registered online last week but never received a confirmation e-mail. Should I register again?

Thank you,
Darius Navabi`;

const TENNIS_COURT_BOOKING_MULTI = `DOCUMENT 1 — Notice
Riverside Tennis Club — Court Bookings

From 1 May, members can book courts up to seven days in advance using the club app (previously three days). Each member may book a maximum of two hours per day. Courts 1 and 2 have lights and can be booked until 10 P.M.; Courts 3 to 5 close at sunset. Lessons with our coaches can also be booked in the app.

DOCUMENT 2 — E-mail
To: office@riversidetennis.org
From: Felipe Ortiz
Date: 5 May
Subject: Evening games

Hello,

My friends and I usually play after work, between 8 and 10 P.M., on Tuesdays and Thursdays. Last week, all the courts we could use were already taken when we tried to book on Monday. Is there a way to reserve the same court every week for the whole summer?

Thanks,
Felipe Ortiz`;

const DAIRY_PRICE_AGREEMENT_MULTI = `DOCUMENT 1 — Letter
Greenmeadow Dairy — Notice to Customers
1 August

Dear customer,

Because of the rising cost of animal feed, the price of our milk and cream will increase by 8 percent from 1 September. The price of our cheese and butter will not change. We continue to deliver every Monday, Wednesday, and Friday before 7 A.M.

Customers who sign a twelve-month supply agreement before 31 August will keep their current prices until the end of the year.

Sincerely,
Agnes Thorvald, Sales Director

DOCUMENT 2 — E-mail
To: Agnes Thorvald
From: Ruben Castellanos, Owner, Casa Ruben
Date: 20 August
Subject: Supply agreement

Dear Ms. Thorvald,

Thank you for your letter. We buy about 60 liters of milk and 10 liters of cream from you each week, so the increase would make a real difference to us. I would like to sign the twelve-month agreement. Could you send me the contract?

Also, would it be possible to receive deliveries on Saturdays too? Our weekend brunch has become very popular.

Regards,
Ruben Castellanos

DOCUMENT 3 — E-mail
To: Ruben Castellanos
From: Agnes Thorvald
Date: 21 August
Subject: RE: Supply agreement

Dear Mr. Castellanos,

I have attached the agreement. Please sign and return it by 31 August. Unfortunately, we do not deliver on weekends, but we can deliver larger quantities on Fridays so that you have enough for Saturday and Sunday.`;

const DELAYED_SUITCASE_MULTI = `DOCUMENT 1 — Delayed baggage report
Nordhavn Airways — Property Irregularity Report
Passenger: Isabella Conti
Flight: NH207 from Rome to Copenhagen, 12 July
Bag description: large blue suitcase with a red ribbon on the handle
Contents: clothes, shoes, and a laptop charger
Delivery address: Hotel Kastellet, Copenhagen (until 16 July), then home address in Rome

Passengers may claim up to €50 per day for necessary items (such as toiletries and clothing) while their bag is delayed. Receipts are required.

DOCUMENT 2 — E-mail
To: Isabella Conti
From: Nordhavn Airways Baggage Services
Date: 14 July
Subject: Your bag

Dear Ms. Conti,

We are pleased to inform you that your suitcase has been found. It was sent to Oslo by mistake and will arrive in Copenhagen on tomorrow's first flight. A courier will deliver it to your hotel by 3 P.M. on 15 July. We apologize for the inconvenience. Please keep your receipts for any items you have bought.`;

const SPRING_GALA_MULTI = `DOCUMENT 1 — Invitation
The Clearwater Foundation invites you to its annual Spring Gala
Saturday, 26 April, 7 P.M., The Atrium, 40 Riverside Drive

Dinner, live music, and a silent auction. All money raised will support reading programs in local schools.
Tickets: $150 per person, or $1,200 for a table of ten.
Please reply by 11 April.

DOCUMENT 2 — Reply card
Name: Dr. Samuel Achebe
☑ I will attend    Number of guests (including myself): 4
☐ I cannot attend, but I would like to make a donation
Dietary requirements: one vegetarian meal

DOCUMENT 3 — E-mail
To: Dr. Samuel Achebe
From: Clearwater Foundation Events
Date: 14 April
Subject: Spring Gala

Dear Dr. Achebe,

Thank you for your reply, which we received after the deadline. We are happy to confirm your four places, but please note that the vegetarian menu is now full, so we will prepare a fish dish instead unless we hear from you. We look forward to seeing you.`;

const TEXT = [
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: AD,
    question: "What is the purpose of the advertisement?",
    answers: ["To hire new staff", "To announce a sale", "To open a new store", "To recall a product"],
    correct_index: 1,
    justification: "The text talks about discounts and dates: it announces a sale.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: AD,
    question: "What total discount can a Brightway Club member get on a laptop?",
    answers: ["5%", "15%", "20%", "25%"],
    correct_index: 3,
    justification: "20% sale + 5% extra for members = 25%. You must combine two pieces of information.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: AD,
    question: "What is NOT mentioned in the advertisement?",
    answers: ["The store opening hours", "The dates of the sale", "A delivery offer", "The website address"],
    correct_index: 0,
    justification: "Only \"closed on Sundays\" is said, never the hours. For NOT questions, check each answer in the text.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: TRIP_EMAIL,
    question: "Why is Sarah writing to Daniel?",
    answers: ["To invite him to a party", "To ask for a day off", "To give details about a business trip", "To complain about a hotel"],
    correct_index: 2,
    justification: "Flight, hotel, conference: she gives the details of his business trip.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: TRIP_EMAIL,
    question: "Why did Sarah choose the Lakeside Inn?",
    answers: ["It is cheaper", "The closer hotel had no rooms", "Daniel asked for it", "It is next to the convention center"],
    correct_index: 1,
    justification: "\"Was full\" = had no rooms. Trap: the Lakeside Inn is NOT next to the center, it is 15 minutes away.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: TRIP_EMAIL,
    question: "What is suggested about Daniel's presentation?",
    answers: ["It was canceled", "Sarah will give it", "It is about marketing strategy", "It may happen on a different day"],
    correct_index: 3,
    justification: "\"On the second day instead of the first\" = a different day. \"Suggested\" questions use other words than the text.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: PARKING_PERMIT_TEXTS,
    question: "What problem does Mr. Berg have?",
    answers: ["His car will not start.", "He cannot enter the parking area.", "He is late for a meeting with Ms. Lindholm.", "He has lost his employee number."],
    correct_index: 1,
    justification: "\"The barrier won't open\" with his new permit.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: PARKING_PERMIT_TEXTS,
    question: "At 9:17 A.M., what does Mr. Berg most likely mean when he writes, \"Will do\"?",
    answers: ["He will park on the street instead.", "He will buy a new permit.", "He will call security himself.", "He will follow Ms. Lindholm's advice."],
    correct_index: 3,
    justification: "He accepts her instructions: press the help button and give his number.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: COFFEE_MACHINE_NOTICE,
    question: "What is the purpose of the notice?",
    answers: ["To announce a change in the break room", "To invite staff to a tasting event", "To report a broken dishwasher", "To ask staff to pay for drinks"],
    correct_index: 0,
    justification: "A new coffee machine replaces the old one.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: COFFEE_MACHINE_NOTICE,
    question: "What are staff asked to do?",
    answers: ["Clean the machine every evening", "Choose a new type of soup", "Put used cups in the dishwasher", "Bring their own paper cups"],
    correct_index: 2,
    justification: "\"Place it in the dishwasher after use.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: SHOE_REPAIR_AD,
    question: "What is indicated about most repairs?",
    answers: ["They must be booked online.", "They cost more than $20.", "They are done by a single worker.", "They are finished quickly."],
    correct_index: 3,
    justification: "\"Most repairs are ready in under an hour.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: SHOE_REPAIR_AD,
    question: "How can customers get a free product?",
    answers: ["By buying a pair of new shoes", "By writing an online review", "By showing the advertisement", "By spending $20 in the food court"],
    correct_index: 2,
    justification: "\"Bring this ad\" and get a free leather cleaner (with a repair over $20).",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: LIBRARY_CARD_EXPIRY_EMAIL,
    question: "Why was the e-mail sent?",
    answers: ["To remind Mr. Strand to renew his card", "To announce a new branch", "To request payment of a fee", "To ask Mr. Strand to return a book"],
    correct_index: 0,
    justification: "The card expires soon, and renewing is explained.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: LIBRARY_CARD_EXPIRY_EMAIL,
    question: "What will happen to expired cards from 1 February?",
    answers: ["They will be replaced automatically.", "They will not work for online reading.", "They will be charged a small fee.", "They will be sent to a new address."],
    correct_index: 1,
    justification: "No more access to online magazines and e-books.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: RAIL_TRACK_WORK_UPDATE,
    question: "What is the purpose of the notice?",
    answers: ["To explain a change in ticket prices", "To advertise bicycle rentals", "To announce a new train line", "To inform passengers about a temporary change"],
    correct_index: 3,
    justification: "No trains for two days, buses instead.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: RAIL_TRACK_WORK_UPDATE,
    question: "What is suggested about passengers with regular bicycles?",
    answers: ["They can leave them at the stations for free.", "They will need another way to travel with them.", "They can use the buses at no extra cost.", "They must buy a special ticket."],
    correct_index: 1,
    justification: "Only folding bicycles are allowed on the buses.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: MEAL_KIT_REVIEW,
    question: "What does Lena T. like about FreshCrate?",
    answers: ["The size of the meals", "The delivery times", "The price of the boxes", "The packaging"],
    correct_index: 0,
    justification: "\"The portions are generous\" = big meals.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: MEAL_KIT_REVIEW,
    question: "What would make Lena T. give a higher rating?",
    answers: ["Cheaper ingredients", "More dinners in each box", "Less plastic in the boxes", "Faster delivery"],
    correct_index: 2,
    justification: "Her only complaint is the plastic packaging.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: LOGISTICS_FORUM_WIFI_CARD,
    question: "Where would this information most likely be found?",
    answers: ["In a job advertisement", "In a hotel restaurant menu", "In a shipping invoice", "In a conference welcome pack"],
    correct_index: 3,
    justification: "\"Welcome to the Global Logistics Forum\", sessions, exhibition hall.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: LOGISTICS_FORUM_WIFI_CARD,
    question: "According to the information, what will participants be able to do?",
    answers: ["Visit a shipping company", "Book a meeting room online", "Download presentation slides", "Get a free phone charger"],
    correct_index: 2,
    justification: "Slides will be uploaded to the forum app.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: CAR_WASH_COUPON,
    question: "How much can customers save with the coupon?",
    answers: ["$6", "$18", "$30", "$12"],
    correct_index: 0,
    justification: "$18 − $12 = $6.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: CAR_WASH_COUPON,
    question: "What is a condition of the coupon?",
    answers: ["It includes a free oil change.", "It cannot be used on weekends.", "It is valid only for new customers.", "It must be used before 30 May."],
    correct_index: 1,
    justification: "\"Valid Monday to Thursday only.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: MUSEUM_AUDIO_GUIDE_SIGN,
    question: "Who can use an audio guide without paying?",
    answers: ["Visitors who speak Korean", "Groups of more than twelve people", "Visitors with a photo ID", "Museum members"],
    correct_index: 3,
    justification: "\"Free for members and children under 12.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: MUSEUM_AUDIO_GUIDE_SIGN,
    question: "What are visitors required to do to borrow a guide?",
    answers: ["Book the guide in advance", "Return it within two minutes", "Leave an identity document", "Pay a $12 deposit"],
    correct_index: 2,
    justification: "\"A photo ID must be left at the desk.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: TEAM_LUNCH_CHAT,
    question: "Why is Ms. Okoro writing to Mr. Benali?",
    answers: ["To ask him to visit a client", "To find out how many people will attend a lunch", "To invite him to a farewell party", "To change the time of a meeting"],
    correct_index: 1,
    justification: "She needs the number of people for the restaurant.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: TEAM_LUNCH_CHAT,
    question: "What is suggested about Joanna?",
    answers: ["She will soon leave the team.", "She will book the restaurant.", "She cannot come to the lunch.", "She works at a client site."],
    correct_index: 0,
    justification: "\"It's Joanna's last week.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: APARTMENT_RENTAL_AD,
    question: "What is included in the rent?",
    answers: ["A parking space", "Electricity", "Internet access", "Heating"],
    correct_index: 3,
    justification: "\"Heating included.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: APARTMENT_RENTAL_AD,
    question: "What is NOT mentioned about the apartment?",
    answers: ["It has a balcony.", "It is on the fourth floor.", "Its kitchen was renovated.", "It is near a train station."],
    correct_index: 0,
    justification: "The station, the kitchen and the floor are mentioned; a balcony is not.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: COURSE_CERTIFICATE_EMAIL,
    question: "Why did Ms. Kwan receive the e-mail?",
    answers: ["She forgot her password.", "She finished an online course.", "She registered for a new course.", "She asked for a refund."],
    correct_index: 1,
    justification: "\"Congratulations on completing...\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: COURSE_CERTIFICATE_EMAIL,
    question: "What is offered to Ms. Kwan?",
    answers: ["A free printed certificate", "A meeting with a teacher", "A discount on another course", "A job at SkillPath"],
    correct_index: 2,
    justification: "The code NEXT15 gives 15 percent off the next course.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: HOTEL_CHECKOUT_CARD,
    question: "At what time must guests normally check out?",
    answers: ["11 A.M.", "9 A.M.", "2 P.M.", "Noon"],
    correct_index: 0,
    justification: "\"Check-out time is 11 A.M.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: HOTEL_CHECKOUT_CARD,
    question: "What should a guest who wants to leave at 1 P.M. do?",
    answers: ["Store their luggage before 9 A.M.", "Call the hotel the day before arriving", "Pay €20 when booking the room", "Make a request at reception early in the morning"],
    correct_index: 3,
    justification: "Late check-out (until 2 P.M.) must be asked for at reception before 9 A.M.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: BIKE_RACKS_NEWSLETTER,
    question: "What is the news item mainly about?",
    answers: ["Changes to the garage opening hours", "New equipment for staff who cycle", "A new security company", "A cycling race organized by staff"],
    correct_index: 1,
    justification: "New bike racks in the garage.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: BIKE_RACKS_NEWSLETTER,
    question: "What does Ms. Lefèvre hope will happen?",
    answers: ["More cameras will be installed.", "Fewer people will use the elevators.", "More employees will cycle to work.", "The showers will be renovated."],
    correct_index: 2,
    justification: "She hopes the racks will \"encourage more people to join them\".",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: THEATER_E_TICKET,
    question: "What time does the performance begin?",
    answers: ["7:00 P.M.", "7:30 P.M.", "2:00 P.M.", "12:00 P.M."],
    correct_index: 1,
    justification: "\"7:30 P.M.\" (7:00 is when the doors open).",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: THEATER_E_TICKET,
    question: "What will happen if a ticket holder arrives after the show starts?",
    answers: ["They will not be allowed in at all.", "They will be given a new seat.", "They will receive a refund.", "They will have to wait for the break."],
    correct_index: 3,
    justification: "Latecomers enter \"only during the intermission\" (the break).",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: SCAN_TO_EMAIL_GUIDE,
    question: "Where would this guide most likely be found?",
    answers: ["On a delivery box", "In a hotel room", "Next to an office copier", "In a car repair shop"],
    correct_index: 2,
    justification: "Instructions to scan documents at work.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: SCAN_TO_EMAIL_GUIDE,
    question: "What should users do with a 70-page document?",
    answers: ["Scan it in more than one part", "Place it in the top tray only", "Send it by regular mail", "Call extension 4400 first"],
    correct_index: 0,
    justification: "More than 50 pages → \"scanned in several parts\".",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: READING_BUDDY_AD,
    question: "What is being advertised?",
    answers: ["A volunteer opportunity", "A summer camp", "A children's bookstore", "A job as a teacher"],
    correct_index: 0,
    justification: "\"Looking for volunteers.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: READING_BUDDY_AD,
    question: "What will all new volunteers do?",
    answers: ["Pay a membership fee", "Work every afternoon", "Bring their own books", "Attend an introductory session"],
    correct_index: 3,
    justification: "\"All volunteers attend a one-hour introduction.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: EXPENSES_APP_MEMO,
    question: "What is the main purpose of the memo?",
    answers: ["To ask staff to travel less", "To announce a new way to submit expenses", "To explain a change in travel destinations", "To introduce a new finance manager"],
    correct_index: 1,
    justification: "Expenses will go through an app instead of paper.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: EXPENSES_APP_MEMO,
    question: "What will happen to a paper form sent on 5 April?",
    answers: ["It will be processed normally.", "It will be paid later than usual.", "It will be sent back.", "It will be photographed by the finance team."],
    correct_index: 2,
    justification: "Paper forms received after 31 March \"will be returned to the sender\".",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: GATE_CHANGE_TEXT_MESSAGE,
    question: "What is the purpose of the message?",
    answers: ["To confirm a hotel booking", "To announce a canceled flight", "To offer a seat upgrade", "To inform a passenger about changes to a flight"],
    correct_index: 3,
    justification: "New gate, new boarding time, new departure time.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: GATE_CHANGE_TEXT_MESSAGE,
    question: "At what time was boarding originally supposed to begin?",
    answers: ["16:15", "15:20", "15:40", "16:35"],
    correct_index: 1,
    justification: "15:40 is \"twenty minutes later than planned\": the plan was 15:20.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: BOOKCASE_ASSEMBLY_INSTRUCTIONS,
    question: "What is NOT included in the box?",
    answers: ["A list of parts", "The parts of the bookcase", "A screwdriver", "A metal bracket"],
    correct_index: 2,
    justification: "\"You will need a screwdriver, which is not included.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: BOOKCASE_ASSEMBLY_INSTRUCTIONS,
    question: "Why should the bookcase be attached to the wall?",
    answers: ["So that it does not fall over", "So that it takes less time to assemble", "So that it can hold more books", "So that it can be moved easily"],
    correct_index: 0,
    justification: "\"To prevent the bookcase from falling.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: OUTDOOR_MOVIE_FLYER,
    question: "What is indicated about the event?",
    answers: ["It is only for children.", "It begins at 8:00 P.M.", "It takes place every Friday.", "It does not cost anything to attend."],
    correct_index: 3,
    justification: "\"A free outdoor screening.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: OUTDOOR_MOVIE_FLYER,
    question: "What will happen if the weather is bad?",
    answers: ["The film will be shown indoors.", "Blankets will be provided.", "The event will be canceled.", "The film will start later."],
    correct_index: 0,
    justification: "\"In case of rain, the screening will move to the Community Hall.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: BARISTA_JOB_AD,
    question: "What is indicated about the position?",
    answers: ["It requires a university degree.", "It is a part-time job.", "It involves evening work.", "It starts on 15 May."],
    correct_index: 1,
    justification: "\"Looking for a part-time barista.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: BARISTA_JOB_AD,
    question: "What is suggested about applicants with no barista experience?",
    answers: ["They must pay for their training.", "They will work only on weekdays.", "They may still apply.", "They should call Tomasz first."],
    correct_index: 2,
    justification: "Experience is \"preferred but not required\" and training is given.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: ENERGY_BILL_MARCH,
    question: "What is the purpose of the document?",
    answers: ["To announce a price increase", "To request payment for energy used", "To advertise a new app", "To confirm a bank transfer"],
    correct_index: 1,
    justification: "It is a bill: amount due and due date.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: ENERGY_BILL_MARCH,
    question: "How could the customer reduce the cost of future bills?",
    answers: ["By paying before 18 April", "By changing the account number", "By receiving bills electronically", "By using the app to pay"],
    correct_index: 2,
    justification: "\"Paperless billing\" = electronic bills → €2 discount every month.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: FOOD_TRUCK_WEEK_SCHEDULE,
    question: "On which day is the food truck open the latest?",
    answers: ["Saturday", "Sunday", "Tuesday", "Thursday"],
    correct_index: 3,
    justification: "Thursday: until 8 P.M.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: FOOD_TRUCK_WEEK_SCHEDULE,
    question: "What is indicated about Sundays?",
    answers: ["The truck is not open to the general public.", "Daily specials are not available.", "The truck parks at the market.", "The truck closes at 2 P.M."],
    correct_index: 0,
    justification: "\"Private events only.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: CONTRACTS_SCAN_TEXTS,
    question: "What does Ms. Fares ask Mr. Moreno to do?",
    answers: ["Send her electronic copies of some documents", "Meet a client at 5 P.M.", "Fix the printer", "Sign some contracts"],
    correct_index: 0,
    justification: "\"Could you scan them and send them to me?\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: CONTRACTS_SCAN_TEXTS,
    question: "At 2:46 P.M., what does Mr. Moreno mean when he writes, \"Give me ten minutes\"?",
    answers: ["He will call the client soon.", "He wants to leave in ten minutes.", "He will do the task shortly.", "He needs time to sign the contracts."],
    correct_index: 2,
    justification: "He agrees (\"No problem\") and says the scan will be done soon.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: BOOK_CLUB_EMAIL,
    question: "Why will the meeting take place in a café?",
    answers: ["The café is closer to the members' homes.", "The members want to have dinner.", "The library is closing.", "The usual room is not available."],
    correct_index: 3,
    justification: "The library's room \"is being painted\".",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: BOOK_CLUB_EMAIL,
    question: "What are members asked to do?",
    answers: ["Paint the meeting room", "Read a book before the meeting", "Bring food for the group", "Choose the next book"],
    correct_index: 1,
    justification: "\"Please finish the book before then.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: HIKING_MAGAZINE_OFFER,
    question: "Who is the magazine mainly for?",
    answers: ["People who enjoy outdoor activities", "People who own small shops", "Travel agents", "Map designers"],
    correct_index: 0,
    justification: "\"The magazine for hikers and climbers.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: HIKING_MAGAZINE_OFFER,
    question: "What is a condition of the offer?",
    answers: ["Subscribers must buy 24 issues.", "Subscribers must visit a store.", "Subscribers must live in certain countries.", "Subscribers must already own a map case."],
    correct_index: 2,
    justification: "\"Valid for addresses in the United States and Canada only.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: BIKE_SHARE_SIGN,
    question: "What must users do before their first ride?",
    answers: ["Pay a €1 deposit", "Register through an app", "Buy a ticket at the station", "Call customer service"],
    correct_index: 1,
    justification: "Step 1: download the app and create an account.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: BIKE_SHARE_SIGN,
    question: "How much extra would a member pay for a 60-minute trip?",
    answers: ["€1", "€3", "€4", "€2"],
    correct_index: 3,
    justification: "30 minutes are included; the other 30 minutes = 2 × 15 minutes = €2.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: SALON_REMINDER_TEXT,
    question: "What is the purpose of the message?",
    answers: ["To request a payment", "To advertise a discount", "To remind a client about an appointment", "To announce a new hairdresser"],
    correct_index: 2,
    justification: "\"Reminder... You have an appointment.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: SALON_REMINDER_TEXT,
    question: "What will happen if the client cancels on the morning of 3 June?",
    answers: ["The appointment will be moved automatically.", "The client will pay part of the price.", "The client will receive a reminder.", "Clémence will call the client."],
    correct_index: 1,
    justification: "Less than 24 hours' notice → 50 percent of the price is charged.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: PLAYGROUND_NEWS_BRIEF,
    question: "What is the news item about?",
    answers: ["A new business in the park", "A plan to close a park", "A sports competition for children", "The opening of a play area"],
    correct_index: 3,
    justification: "\"The new playground... will open.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: PLAYGROUND_NEWS_BRIEF,
    question: "What is mentioned about the project?",
    answers: ["Companies helped to pay for it.", "It replaced a parking area.", "It was designed by children.", "It took one year to complete."],
    correct_index: 0,
    justification: "\"Paid for partly by local businesses.\" (six months, not one year)",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: TERRACE_RESERVATION_EMAIL,
    question: "How many people will be at the table?",
    answers: ["Eight", "Fourteen", "Six", "Four"],
    correct_index: 2,
    justification: "\"Your table for six.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: TERRACE_RESERVATION_EMAIL,
    question: "What is indicated about Mr. Auer?",
    answers: ["He changed the date of his booking.", "He is a regular customer.", "He has a food allergy.", "He asked to sit outdoors."],
    correct_index: 3,
    justification: "\"As requested, we have reserved a table on our garden terrace.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: TOOL_RENTAL_PRICES,
    question: "What is the most expensive item to rent for one day?",
    answers: ["The floor sander", "The pressure washer", "The ladder", "The electric drill"],
    correct_index: 0,
    justification: "$48 is the highest price.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: TOOL_RENTAL_PRICES,
    question: "How much would a customer pay to rent a ladder from Friday afternoon to Monday morning, not counting the deposit?",
    answers: ["$65", "$15", "$30", "$45"],
    correct_index: 1,
    justification: "The weekend special = the price of one day: $15.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: COLLEGE_OPEN_DAY,
    question: "What is the purpose of the announcement?",
    answers: ["To recruit new teachers", "To advertise student apartments", "To announce a new course in design", "To invite people to visit a school"],
    correct_index: 3,
    justification: "\"Visit Elmsford College\" on its open day.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: COLLEGE_OPEN_DAY,
    question: "What is true about the event?",
    answers: ["Classes cost $10 each.", "Parking is only available on the street.", "Visitors do not need to sign up.", "It lasts for two days."],
    correct_index: 2,
    justification: "\"No registration is needed.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: STAFF_SURVEY_KITCHEN_MEMO,
    question: "What did many employees complain about?",
    answers: ["The size of a room", "The price of food", "The length of the survey", "Their work schedules"],
    correct_index: 0,
    justification: "\"Many feel that the office kitchen is too small.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: STAFF_SURVEY_KITCHEN_MEMO,
    question: "What will happen in January?",
    answers: ["Work schedules will change.", "Construction work will start.", "Employees will move to a new office.", "A new survey will be sent."],
    correct_index: 1,
    justification: "The kitchen will be extended: \"Work will begin in January.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: INTERNET_SUPPORT_CHAT,
    question: "Why did Ms. Delacroix contact Brightwave Internet?",
    answers: ["She is moving to a new area.", "She was charged twice.", "Her connection is not working well.", "She wants to cancel her contract."],
    correct_index: 2,
    justification: "\"My internet has been very slow.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: INTERNET_SUPPORT_CHAT,
    question: "What does the agent do for Ms. Delacroix?",
    answers: ["He changes her work schedule.", "He sends a technician to her home.", "He gives her a faster connection.", "He reduces her next bill."],
    correct_index: 3,
    justification: "A $10 credit on her account = she will pay less.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: FLORIST_MOVING_CARD,
    question: "What is being announced?",
    answers: ["The relocation of a business", "A new flower delivery service", "A sale on wedding flowers", "The closing of a business"],
    correct_index: 0,
    justification: "The shop is moving to a new address.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: FLORIST_MOVING_CARD,
    question: "What is suggested about the new shop?",
    answers: ["It is smaller than the old one.", "It will allow the business to offer classes.", "It is on Fenwick Street.", "It will open on 31 May."],
    correct_index: 1,
    justification: "\"The new shop has space for workshops\" → flower-arranging classes.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: WINDOW_CLEANING_NOTICE,
    question: "What is the notice mainly about?",
    answers: ["A new security system", "A change in rent", "Repairs to the elevators", "Planned work on the building"],
    correct_index: 3,
    justification: "The windows of the building will be cleaned.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: WINDOW_CLEANING_NOTICE,
    question: "What are tenants asked to do?",
    answers: ["Leave the building at 8 A.M.", "Stay on their balconies", "Keep their windows shut", "Clean their own windows"],
    correct_index: 2,
    justification: "\"Please keep all windows closed during these hours.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: WINDOW_CLEANING_NOTICE,
    question: "Where can tenants find more details about the work?",
    answers: ["In their mailboxes", "In the lobby", "On the roof", "On the building's Web site"],
    correct_index: 1,
    justification: "\"A schedule... is posted in the main lobby.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: LIBRARY_MAKERSPACE_ARTICLE,
    question: "What is the article mainly about?",
    answers: ["A new area in a library", "The retirement of a librarian", "A design competition", "A sale of old library books"],
    correct_index: 0,
    justification: "The library \"has opened a new makerspace\".",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: LIBRARY_MAKERSPACE_ARTICLE,
    question: "What must people do before using the equipment?",
    answers: ["Show a design to a librarian", "Pay a monthly fee", "Take a safety lesson", "Bring their own computer"],
    correct_index: 2,
    justification: "Free \"after completing a short safety lesson\".",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: LIBRARY_MAKERSPACE_ARTICLE,
    question: "What is suggested about the materials?",
    answers: ["The library does not make a profit on them.", "They are free for card holders.", "They must be ordered online.", "They are only available on Saturdays."],
    correct_index: 0,
    justification: "\"Sold at cost price\" = for the price the library paid.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: SELF_CHECKOUT_LETTER,
    question: "Why did Mr. Pinto write the letter?",
    answers: ["To thank an employee for her help", "To ask for a refund for some fruit", "To apply for a job at the store", "To make a suggestion about the store"],
    correct_index: 3,
    justification: "\"Please consider keeping at least two staffed checkouts open.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: SELF_CHECKOUT_LETTER,
    question: "What problem does Mr. Pinto mention?",
    answers: ["The store opens too late in the morning.", "The self-service machines do not always work well.", "The prices have increased.", "The store has stopped selling fruit."],
    correct_index: 1,
    justification: "\"They often stop working when I scan fruit.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: SELF_CHECKOUT_LETTER,
    question: "What is suggested about Mr. Pinto?",
    answers: ["He recently moved to Orchard Road.", "He has never used a self-service machine.", "He works at the store in the mornings.", "He is a regular customer of the store."],
    correct_index: 3,
    justification: "\"I have shopped at your store every week for years.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: ONLINE_SALES_WEBINAR_AD,
    question: "Who is the webinar intended for?",
    answers: ["Owners of small companies", "Professional shippers", "Web designers", "University students"],
    correct_index: 0,
    justification: "\"Are you a small business owner...?\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: ONLINE_SALES_WEBINAR_AD,
    question: "In the advertisement, the word \"receive\" in paragraph 2, line 1, is closest in meaning to",
    answers: ["approve", "get", "welcome", "collect"],
    correct_index: 1,
    justification: "\"Receive a checklist\" = get a checklist.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: ONLINE_SALES_WEBINAR_AD,
    question: "What will people who register but miss the webinar receive?",
    answers: ["A call from Ms. Whitlock", "A place at the next webinar", "A recording of the session", "A refund"],
    correct_index: 2,
    justification: "\"A recording will be sent to everyone who registers, even if they cannot attend live.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: SUMMER_PICNIC_REPLY_FORM,
    question: "What is the purpose of the form?",
    answers: ["To order food for a meeting", "To collect information about an event", "To request a vacation day", "To book a bus trip for clients"],
    correct_index: 1,
    justification: "Employees say if they come to the picnic, with how many guests and what meal.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: SUMMER_PICNIC_REPLY_FORM,
    question: "How many people will Ms. Solberg's group include?",
    answers: ["Four", "Two", "One", "Three"],
    correct_index: 3,
    justification: "Herself + 2 guests = 3 (and 3 meals are chosen).",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: SUMMER_PICNIC_REPLY_FORM,
    question: "What is indicated about Ms. Solberg?",
    answers: ["She will not use the shuttle bus.", "She will return the form late.", "She works in Human Resources.", "She does not eat meat."],
    correct_index: 0,
    justification: "Shuttle bus: \"No\" is ticked. (She works in Accounts.)",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: PROJECTOR_GROUP_CHAT,
    question: "What problem does Ms. Pereira report?",
    answers: ["Some clients are late.", "A cable is missing.", "Some equipment is not working.", "A meeting room is too small."],
    correct_index: 2,
    justification: "\"The projector... isn't turning on.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: PROJECTOR_GROUP_CHAT,
    question: "What does Ms. Sato suggest?",
    answers: ["Postponing the meeting", "Calling the cleaners", "Using a different room", "Buying a new projector"],
    correct_index: 2,
    justification: "\"Room 5 is free all morning, and its projector works fine.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: PROJECTOR_GROUP_CHAT,
    question: "At 10:19 A.M., what does Mr. Keller mean when he writes, \"On it\"?",
    answers: ["He is already in Room 5.", "He will put up the sign right away.", "He is standing on a chair.", "He has found the problem."],
    correct_index: 1,
    justification: "\"On it\" = I'm doing it now (the sign she asked for).",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: RECIPE_CONTEST_RULES,
    question: "Who can enter the contest?",
    answers: ["Restaurant owners", "Professional chefs", "Farmers in the region", "Amateur cooks who are at least 16"],
    correct_index: 3,
    justification: "Rule 1: \"amateur cooks aged 16 and over\".",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: RECIPE_CONTEST_RULES,
    question: "What is NOT required for an entry?",
    answers: ["A video of the cooking", "A list of ingredients", "A photo of the dish", "Cooking instructions"],
    correct_index: 0,
    justification: "Rule 3 lists ingredients, instructions and a photo, not a video.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: RECIPE_CONTEST_RULES,
    question: "What will happen on 21 September?",
    answers: ["Recipes will be published in a book.", "The deadline for entries will pass.", "Some participants will cook for the judges.", "The contest rules will change."],
    correct_index: 2,
    justification: "Rule 5: five finalists cook in front of the judges.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: CABIN_BAGGAGE_WEB_PAGE,
    question: "Where must the small bag be placed during the flight?",
    answers: ["In the overhead locker", "Under the seat in front", "In the hold", "At the gate"],
    correct_index: 1,
    justification: "\"Must fit under the seat in front.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: CABIN_BAGGAGE_WEB_PAGE,
    question: "Who may bring a 10 kg bag into the cabin?",
    answers: ["Passengers who pay €45", "All passengers on short flights", "Passengers traveling with children", "Passengers with certain types of tickets"],
    correct_index: 3,
    justification: "Only \"Passengers with a Flex or Business ticket\".",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: CABIN_BAGGAGE_WEB_PAGE,
    question: "What is true about strollers?",
    answers: ["They can go in the hold at no cost.", "They are not allowed on the plane.", "They must fit under the seat.", "They cost €45 to carry."],
    correct_index: 0,
    justification: "\"Except for strollers and wheelchairs, which are carried free of charge.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: STATION_LOCKERS_SIGN,
    question: "How can customers pay for a locker?",
    answers: ["By phone call", "With a train ticket", "In cash", "By card"],
    correct_index: 3,
    justification: "\"Lockers accept card payments only.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: STATION_LOCKERS_SIGN,
    question: "Why should customers keep their receipt?",
    answers: ["It is needed to enter the platform.", "It contains the code to open the locker.", "It gives a discount on the next use.", "It can be used as a train ticket."],
    correct_index: 1,
    justification: "\"Your receipt shows a code that you will need to open the locker.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: STATION_LOCKERS_SIGN,
    question: "How much would it cost to use a large locker for 8 hours?",
    answers: ["€7", "€8", "€9", "€11"],
    correct_index: 2,
    justification: "€7 for 6 hours + 2 extra hours × €1 = €9.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: SPANISH_COURSES_PAGE,
    question: "What is the purpose of the information?",
    answers: ["To describe language classes", "To advertise a trip to Spain", "To announce test results", "To recruit Spanish teachers"],
    correct_index: 0,
    justification: "Three levels of Spanish courses with their days and times.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: SPANISH_COURSES_PAGE,
    question: "Which course meets twice a week?",
    answers: ["Beginner", "None of them", "Intermediate", "Elementary"],
    correct_index: 0,
    justification: "Beginner: Mondays AND Wednesdays.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: SPANISH_COURSES_PAGE,
    question: "What happens after someone takes the online test?",
    answers: ["The person receives a certificate.", "The person must pay for the course.", "A teacher suggests a level.", "A class is chosen automatically."],
    correct_index: 2,
    justification: "\"A teacher will contact you with a recommendation.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: CONSTRUCTION_NEIGHBOR_LETTER,
    question: "Why was the letter sent?",
    answers: ["To announce a new school", "To sell apartments in a new building", "To ask residents to move their cars", "To inform residents about a building project"],
    correct_index: 3,
    justification: "It explains the construction of a new building nearby.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: CONSTRUCTION_NEIGHBOR_LETTER,
    question: "What is indicated about the noisiest work?",
    answers: ["It will happen only on Sundays.", "It will happen during limited hours.", "It will last fourteen months.", "It will happen on Mill Lane."],
    correct_index: 1,
    justification: "Only between 9 A.M. and 4 P.M. on weekdays.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: CONSTRUCTION_NEIGHBOR_LETTER,
    question: "Why will trucks use Mill Lane?",
    answers: ["Because Quarry Road is being repaired", "Because it is shorter", "To deliver materials to the school", "To avoid an area near a school"],
    correct_index: 3,
    justification: "\"To keep traffic away from the school.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: HOUSEKEEPING_HEAD_EMAIL,
    question: "What is the main purpose of the e-mail?",
    answers: ["To advertise a job", "To announce a hotel opening", "To introduce a new employee", "To change a work schedule"],
    correct_index: 2,
    justification: "Anton Kessler will join the hotel.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: HOUSEKEEPING_HEAD_EMAIL,
    question: "In the e-mail, the word \"brings\" in paragraph 2, line 1, is closest in meaning to",
    answers: ["carries", "has", "fetches", "sends"],
    correct_index: 1,
    justification: "\"Brings fifteen years of experience\" = has this experience.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: HOUSEKEEPING_HEAD_EMAIL,
    question: "What will happen on 16 May?",
    answers: ["An employee's retirement will be celebrated.", "Mr. Kessler will start his new job.", "A staff meeting will be held in Vienna.", "The hotel will close early."],
    correct_index: 0,
    justification: "The farewell party for Gloria, who is retiring. (Anton starts on 19 May.)",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: RUNNING_SHOES_REVIEW,
    question: "What does the reviewer like about the shoes?",
    answers: ["They are easy to clean.", "They are available in many colors.", "They are comfortable over long distances.", "They are inexpensive."],
    correct_index: 2,
    justification: "\"My feet felt fine even after 20 kilometers.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: RUNNING_SHOES_REVIEW,
    question: "Why did the reviewer exchange the shoes?",
    answers: ["They were the wrong color.", "They were too heavy.", "They were damaged.", "They were too small."],
    correct_index: 3,
    justification: "The sizes are smaller than normal: he needed a 44 instead of a 43.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: RUNNING_SHOES_REVIEW,
    question: "What does the reviewer suggest about the shoes?",
    answers: ["They are only suitable for short runs.", "They may be too expensive for people new to running.", "They are the best shoes he has ever owned.", "They are sold only online."],
    correct_index: 1,
    justification: "\"Beginners can find good shoes for less.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: VOLUNTEER_DAY_MEMO,
    question: "What is the memo mainly about?",
    answers: ["A new benefit for employees", "A new company newsletter", "A charity that needs money", "A change in vacation rules"],
    correct_index: 0,
    justification: "One paid day off to volunteer.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: VOLUNTEER_DAY_MEMO,
    question: "What must employees do before taking the day off?",
    answers: ["Choose an organization from the list", "Write an article for the newsletter", "Work an extra day", "Get their manager's approval"],
    correct_index: 3,
    justification: "\"It must be approved by your manager at least two weeks in advance.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: VOLUNTEER_DAY_MEMO,
    question: "What is suggested about the list on the intranet?",
    answers: ["It will be updated every week.", "Employees do not have to choose from it.", "It includes only food banks.", "It was prepared by managers."],
    correct_index: 1,
    justification: "The charity is \"of their choice\"; the list is only \"to help you choose\".",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: COPIER_CONTRACT_EMAIL,
    question: "What is the purpose of the e-mail?",
    answers: ["To encourage a customer to renew a contract", "To introduce a new copier", "To schedule a repair", "To announce the end of a product"],
    correct_index: 0,
    justification: "The contract ends soon, and renewing early keeps the old price.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: COPIER_CONTRACT_EMAIL,
    question: "How often do technicians visit the office?",
    answers: ["Once a month", "Every week", "Four times a year", "Twice a year"],
    correct_index: 2,
    justification: "Every three months = four times a year.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: COPIER_CONTRACT_EMAIL,
    question: "What is suggested about customers who renew in January?",
    answers: ["They will need a new account number.", "They cannot renew their contract.", "They will receive a free repair.", "They will pay more than last year."],
    correct_index: 3,
    justification: "After 20 December, \"the new price of $420 per year will apply\".",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: CHAMBER_MUSIC_PROGRAM,
    question: "How many events take place on Saturday?",
    answers: ["Four", "Three", "One", "Two"],
    correct_index: 1,
    justification: "11:00 A.M., 4:00 P.M. and 8:00 P.M.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: CHAMBER_MUSIC_PROGRAM,
    question: "Which event does not require a ticket?",
    answers: ["The piano trio", "The closing concert", "The family concert", "The opening concert"],
    correct_index: 2,
    justification: "\"Garden Tent, free entry.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: CHAMBER_MUSIC_PROGRAM,
    question: "How much would a person save by buying the ticket for all four Elm Hall concerts?",
    answers: ["$20", "$80", "$25", "$5"],
    correct_index: 0,
    justification: "4 × $25 = $100, instead of $80: a saving of $20.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: RECYCLING_CENTER_HOURS,
    question: "What will change on 1 November?",
    answers: ["The price of collections", "The center's location", "The types of waste accepted", "The center's opening hours"],
    correct_index: 3,
    justification: "\"New Opening Hours\" from 1 November.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: RECYCLING_CENTER_HOURS,
    question: "Why will the center be closed on Mondays?",
    answers: ["So that maintenance can be done", "Because of a public holiday", "Because few people visit on Mondays", "To save money on staff"],
    correct_index: 0,
    justification: "\"So that staff can carry out maintenance work.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: RECYCLING_CENTER_HOURS,
    question: "What can residents do with an old mattress?",
    answers: ["Drop it off on Mondays", "Leave it outside on Sunday", "Pay to have it picked up", "Leave it at the center for free"],
    correct_index: 2,
    justification: "Large items \"can be collected from your home for a fee\".",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: SOIL_SENSOR_PRIZE_ARTICLE,
    question: "What is the article mainly about?",
    answers: ["A farm that is for sale", "An award given to a young company", "The opening of a technology park", "A new university program"],
    correct_index: 1,
    justification: "Two founders \"have won this year's Halbridge Innovation Prize\".",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: SOIL_SENSOR_PRIZE_ARTICLE,
    question: "What does SoilSense do?",
    answers: ["It predicts the weather.", "It waters crops automatically.", "It measures the size of fields.", "It tells farmers when to water their plants."],
    correct_index: 3,
    justification: "It sends a message \"when crops need watering\".",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: SOIL_SENSOR_PRIZE_ARTICLE,
    question: "What will the founders most likely do with the prize?",
    answers: ["Recruit staff", "Buy a garage", "Open a farm", "Return to university"],
    correct_index: 0,
    justification: "\"This will allow us to hire our first employees.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: MOVING_COMPANY_QUOTE,
    question: "What service is NOT included in the quote?",
    answers: ["Packing of some items", "Furniture assembly", "Cleaning of the old apartment", "Transport"],
    correct_index: 2,
    justification: "Packing, transport and assembly are listed; cleaning is not.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: MOVING_COMPANY_QUOTE,
    question: "How much must Ms. Dufort pay to confirm the booking?",
    answers: ["€95", "€190", "€950", "€180"],
    correct_index: 1,
    justification: "20 percent of €950 = €190.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: MOVING_COMPANY_QUOTE,
    question: "What would most likely happen if Ms. Dufort moved on a Saturday instead?",
    answers: ["The deposit would be returned.", "The quote would no longer be valid.", "Fewer movers would be available.", "The price would increase."],
    correct_index: 3,
    justification: "\"Moves on weekends cost 15 percent more.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: CATERING_GROUP_CHAT,
    question: "What problem are the writers discussing?",
    answers: ["A trainer has canceled a session.", "Food will arrive later than planned.", "A train ticket was not booked.", "A bakery is closed."],
    correct_index: 1,
    justification: "The caterer cannot deliver before 12:30, but lunch starts at 12:00.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: CATERING_GROUP_CHAT,
    question: "Why can't the lunch be moved later?",
    answers: ["The trainer must leave at a certain time.", "The bakery closes at noon.", "The room is booked in the afternoon.", "The participants have another meeting."],
    correct_index: 0,
    justification: "\"The trainer has a train at 3:00.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: CATERING_GROUP_CHAT,
    question: "At 4:07 P.M., what does Mr. Arnaud mean when he writes, \"That works\"?",
    answers: ["He has fixed a problem with a machine.", "He confirms that the room is ready.", "He agrees with Ms. Popescu's plan.", "He thinks the caterer is working hard."],
    correct_index: 2,
    justification: "He accepts the idea of the bakery platters, then asks to cancel the sandwiches.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: TRANSPORT_MUSEUM_JOB_POSTING,
    question: "What is one task of the position?",
    answers: ["Designing exhibitions", "Driving buses", "Repairing historic trains", "Selling tickets"],
    correct_index: 3,
    justification: "\"Welcome visitors, sell tickets, and answer questions.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: TRANSPORT_MUSEUM_JOB_POSTING,
    question: "In the job posting, the word \"seeking\" in paragraph 1, line 1, is closest in meaning to",
    answers: ["training", "looking for", "paying", "hiding from"],
    correct_index: 1,
    justification: "\"We are seeking a person\" = we are looking for a person.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: TRANSPORT_MUSEUM_JOB_POSTING,
    question: "What is NOT a requirement for the position?",
    answers: ["Working on weekends", "Experience with customers", "Speaking a second language", "Computer skills"],
    correct_index: 2,
    justification: "A second language is only \"an advantage\".",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: ROOM_BOOKING_POLICY,
    question: "What is the purpose of the information?",
    answers: ["To explain rules for reserving rooms", "To announce a new meeting room", "To describe a new calendar program", "To invite staff to a board meeting"],
    correct_index: 0,
    justification: "\"Meeting Room Booking Policy.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: ROOM_BOOKING_POLICY,
    question: "Which room can be reserved for more than three hours?",
    answers: ["Any room booked four weeks ahead", "The Board Room", "The largest meeting room", "None of the rooms"],
    correct_index: 1,
    justification: "\"Except for the Board Room, which can be booked for a full day.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: ROOM_BOOKING_POLICY,
    question: "What will most likely happen if a team arrives twenty minutes late for its booking?",
    answers: ["The room may have been given to someone else.", "The team will be charged a fee.", "The team must book another day.", "The booking will be extended."],
    correct_index: 0,
    justification: "After fifteen minutes, the room \"will automatically become available to others\".",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: GROCERY_DELIVERY_EMAIL,
    question: "When will the order be delivered?",
    answers: ["On Sunday morning", "On Saturday evening", "On Friday morning", "On Saturday morning"],
    correct_index: 3,
    justification: "\"Tomorrow, Saturday, between 10 and 11 A.M.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: GROCERY_DELIVERY_EMAIL,
    question: "What does GreenBasket say about the oat milk?",
    answers: ["It was removed from the bill.", "It will be delivered next week.", "It has been replaced with another product.", "It is now cheaper."],
    correct_index: 2,
    justification: "\"We have replaced it with a similar product.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: GROCERY_DELIVERY_EMAIL,
    question: "What can Mr. Asante do if he does not want the replacement product?",
    answers: ["Keep it and pay half price", "Call the store within 15 minutes", "Give it back to the driver", "Order it again on Monday"],
    correct_index: 2,
    justification: "\"Simply hand it back to the driver.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: WATERCOLOR_COURSE_FLYER,
    question: "What is being advertised?",
    answers: ["A trip to the countryside", "A painting course", "An art exhibition", "A shop selling art supplies"],
    correct_index: 1,
    justification: "A six-week watercolor course.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: WATERCOLOR_COURSE_FLYER,
    question: "What must students bring?",
    answers: ["A sketchbook", "A friend", "Brushes", "Their own paints"],
    correct_index: 0,
    justification: "\"Students only need to bring a sketchbook.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: WATERCOLOR_COURSE_FLYER,
    question: "How much would two friends who sign up together pay in total?",
    answers: ["$130", "$280", "$300", "$260"],
    correct_index: 3,
    justification: "Each pays $150 − $20 = $130, so $260 for both.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: TOWN_CENTER_PLAN_NOTICE,
    question: "What is the purpose of the notice?",
    answers: ["To explain a parking fine", "To announce a new market", "To ask for residents' opinions", "To advertise a library event"],
    correct_index: 2,
    justification: "\"We want to hear from you\": a survey.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: TOWN_CENTER_PLAN_NOTICE,
    question: "What is NOT mentioned as a possible change?",
    answers: ["Wider sidewalks", "Fewer parking spaces", "More trees", "A new bus station"],
    correct_index: 3,
    justification: "The bus station is not in the list of ideas.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: TOWN_CENTER_PLAN_NOTICE,
    question: "What will happen in June?",
    answers: ["A meeting about the survey results", "The opening of a market", "The closing of High Street", "The start of construction"],
    correct_index: 0,
    justification: "\"A public meeting to discuss the results will take place in June.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: PHONE_REPAIR_RECEIPT,
    question: "What was repaired?",
    answers: ["A protective case", "A phone screen", "A laptop", "A phone battery"],
    correct_index: 1,
    justification: "\"Screen replacement.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: PHONE_REPAIR_RECEIPT,
    question: "What did Mr. Horák receive at no cost?",
    answers: ["A protective case", "A charger", "A screen protector", "A new phone"],
    correct_index: 2,
    justification: "\"Screen protector (free with repair).\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: PHONE_REPAIR_RECEIPT,
    question: "What is suggested about the warranty?",
    answers: ["It covers all future problems with the phone.", "It costs $19.", "It is valid only with cash payments.", "It covers the repair until February."],
    correct_index: 3,
    justification: "Six months from 9 August = until 9 February, and only for the same problem.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: FOGGY_FLIGHT_TEXTS,
    question: "Why did Ms. Ortega send the first message?",
    answers: ["Her travel plans have changed.", "She forgot her slides.", "She is looking for a hotel.", "She wants to cancel a meeting."],
    correct_index: 0,
    justification: "Her flight was canceled; she is on a later flight.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: FOGGY_FLIGHT_TEXTS,
    question: "What does Ms. Ortega ask Mr. Dahl to do?",
    answers: ["Book her a new flight", "Begin a meeting without her", "Call Nordlys Foods to cancel", "Send her the slides"],
    correct_index: 1,
    justification: "\"Could you start without me?\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: FOGGY_FLIGHT_TEXTS,
    question: "What will Mr. Dahl most likely do?",
    answers: ["Ask to move part of the meeting to the afternoon", "Prepare new slides", "Pick Ms. Ortega up at the airport", "Fly to Oslo at 11:20"],
    correct_index: 0,
    justification: "\"I'll ask them if we can do the price discussion after lunch.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: POTTERY_STUDIO_ARTICLE,
    question: "What is the article mainly about?",
    answers: ["A new fish market", "The opening of a youth center", "The history of a local business", "A pottery competition"],
    correct_index: 2,
    justification: "Ten years of the Clay and Kiln studio.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: POTTERY_STUDIO_ARTICLE,
    question: "What is indicated about the studio?",
    answers: ["It will close after its anniversary.", "It only offers classes for children.", "It has six classrooms.", "It is in a building that was once a market."],
    correct_index: 3,
    justification: "It opened \"in a former fish market\".",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: POTTERY_STUDIO_ARTICLE,
    question: "What will happen to the money from the sales on 24 May?",
    answers: ["It will be used to repair the studio.", "It will be given to a local organization.", "It will pay for new pottery wheels.", "It will be shared by the teachers."],
    correct_index: 1,
    justification: "\"All money from the sales will go to the town's youth center.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: POTTERY_STUDIO_ARTICLE,
    question: "In which of the positions marked [1], [2], [3], and [4] does the following sentence best belong? \"A few of these students have attended classes every week since the studio opened.\"",
    answers: ["[1]", "[2]", "[3]", "[4]"],
    correct_index: 1,
    justification: "\"These students\" needs the sentence about the students just before: position [2].",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: SECURITY_UPDATE_MEMO,
    question: "What is the purpose of the memo?",
    answers: ["To ask staff to work on Saturday", "To announce new office hours", "To give instructions about a computer update", "To introduce a new help desk"],
    correct_index: 2,
    justification: "It explains the update and what to do before it.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: SECURITY_UPDATE_MEMO,
    question: "What are employees asked to do on Friday?",
    answers: ["Leave their computers turned on", "Install a program", "Call the help desk", "Take their laptops home"],
    correct_index: 0,
    justification: "\"Please leave your computer switched on.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: SECURITY_UPDATE_MEMO,
    question: "In the memo, the word \"properly\" in paragraph 3, line 1, is closest in meaning to",
    answers: ["quickly", "correctly", "privately", "politely"],
    correct_index: 1,
    justification: "\"Not working properly\" = not working correctly.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: SECURITY_UPDATE_MEMO,
    question: "What is indicated about laptops taken home?",
    answers: ["They will not need the update.", "They must be returned on Saturday.", "They will be replaced.", "They will be updated later."],
    correct_index: 3,
    justification: "They \"will be updated the next time they are connected\".",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: GUESTHOUSE_ABOUT_PAGE,
    question: "What is indicated about the rooms?",
    answers: ["They are all decorated differently.", "They include a kitchen.", "They all have a sea view.", "There are more than ten of them."],
    correct_index: 0,
    justification: "\"Each of our nine rooms is decorated in a different style\" (MOST have a sea view).",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: GUESTHOUSE_ABOUT_PAGE,
    question: "What should guests with food restrictions do?",
    answers: ["Bring their own breakfast", "Inform the guesthouse when booking", "Eat in the garden room after 10 A.M.", "Ask for a room with a kitchen"],
    correct_index: 1,
    justification: "\"Guests with special diets should let us know when they book.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: GUESTHOUSE_ABOUT_PAGE,
    question: "What is offered to guests for free?",
    answers: ["Printed coastal maps", "Boat trips", "The use of bicycles", "Parking in a private lot"],
    correct_index: 2,
    justification: "\"Bicycles are available to borrow at no cost.\" (There is no parking lot.)",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: GUESTHOUSE_ABOUT_PAGE,
    question: "In which of the positions marked [1], [2], [3], and [4] does the following sentence best belong? \"If you are arriving by car, we suggest dropping off your bags at our door first.\"",
    answers: ["[1]", "[2]", "[3]", "[4]"],
    correct_index: 2,
    justification: "It is about arriving by car, right after the parking information: position [3].",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: PROPOSAL_TEAM_CHAT,
    question: "What are the writers mainly discussing?",
    answers: ["The cost of a photographer", "A vacation schedule", "A hotel booking in Lisbon", "The progress of a document for a client"],
    correct_index: 3,
    justification: "\"The Brandt Hotels proposal... Where are we?\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: PROPOSAL_TEAM_CHAT,
    question: "What is Mr. Nowak doing this morning?",
    answers: ["Writing the design section", "Reviewing a budget", "Traveling to Lisbon", "Taking photos"],
    correct_index: 1,
    justification: "\"I'm checking the numbers one last time.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: PROPOSAL_TEAM_CHAT,
    question: "Why can't Tomás help?",
    answers: ["He is busy with another client.", "He works in a different office.", "He is away from work.", "He has deleted the photos."],
    correct_index: 2,
    justification: "\"He's on vacation until Monday.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: PROPOSAL_TEAM_CHAT,
    question: "At 9:37 A.M., why does Ms. Park write, \"That's a relief\"?",
    answers: ["She can now finish her work on time.", "She is happy that Tomás is on vacation.", "She does not need to go to Lisbon.", "She has finished the budget."],
    correct_index: 0,
    justification: "She gets the photos, so she can finish the design section by Wednesday.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: ROOFTOP_GARDENS_ARTICLE,
    question: "What is the article mainly about?",
    answers: ["A problem with rainwater", "A farm outside the city", "A new city park", "A growing trend in the city"],
    correct_index: 3,
    justification: "More and more buildings have rooftop gardens.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: ROOFTOP_GARDENS_ARTICLE,
    question: "What is mentioned as a benefit of the gardens?",
    answers: ["They attract tourists.", "They produce income for the city.", "They reduce the cost of insurance.", "They lower temperatures in buildings."],
    correct_index: 3,
    justification: "\"The gardens help keep buildings cool in summer.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: ROOFTOP_GARDENS_ARTICLE,
    question: "What do employees at Verity Insurance do?",
    answers: ["Design gardens for other companies", "Give gardening classes", "Grow food for their cafeteria", "Sell vegetables to customers"],
    correct_index: 2,
    justification: "Tomatoes and herbs \"used in the company cafeteria\".",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: ROOFTOP_GARDENS_ARTICLE,
    question: "In which of the positions marked [1], [2], [3], and [4] does the following sentence best belong? \"The money can be used for design, materials, and safety checks.\"",
    answers: ["[1]", "[2]", "[3]", "[4]"],
    correct_index: 3,
    justification: "\"The money\" = the grants mentioned just before: position [4].",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: TOURISM_FORUM_SPEAKERS_CALL,
    question: "What is the purpose of the announcement?",
    answers: ["To advertise hotel rooms", "To invite people to give talks", "To announce the winners of a prize", "To recruit tourism students"],
    correct_index: 1,
    justification: "\"Call for Speakers... inviting proposals for presentations.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: TOURISM_FORUM_SPEAKERS_CALL,
    question: "What is NOT required in a proposal?",
    answers: ["A video of the speaker", "A title", "A summary", "Information about the speaker"],
    correct_index: 0,
    justification: "Title, summary and speaker information are listed; a video is not.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: TOURISM_FORUM_SPEAKERS_CALL,
    question: "In the announcement, the word \"informed\" in paragraph 3, line 1, is closest in meaning to",
    answers: ["chosen", "paid", "trained", "told"],
    correct_index: 3,
    justification: "\"Speakers will be informed of the decision\" = they will be told.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: TOURISM_FORUM_SPEAKERS_CALL,
    question: "What will selected speakers have to pay for?",
    answers: ["Their travel", "Their hotel room", "Their entry to the forum", "The online form"],
    correct_index: 0,
    justification: "\"Travel costs are not covered.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: QUIET_DISHWASHER_PRESS_RELEASE,
    question: "What is the press release mainly about?",
    answers: ["A company's move to Bergen", "A new household appliance", "A new kitchen design store", "A change in prices"],
    correct_index: 1,
    justification: "The company \"introduced the Stillwater 500\", a dishwasher.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: QUIET_DISHWASHER_PRESS_RELEASE,
    question: "What is indicated about the Stillwater 500?",
    answers: ["It is the cheapest dishwasher on the market.", "It is sold only online.", "It uses less water than an older model.", "It was designed in Denmark."],
    correct_index: 2,
    justification: "\"20 percent less water than Northwind's previous model.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: QUIET_DISHWASHER_PRESS_RELEASE,
    question: "When will customers be able to buy the product?",
    answers: ["Only in December", "Starting 2 October", "Next year", "Starting 1 November"],
    correct_index: 3,
    justification: "\"Available in stores... from 1 November.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: QUIET_DISHWASHER_PRESS_RELEASE,
    question: "In which of the positions marked [1], [2], [3], and [4] does the following sentence best belong? \"This means it can run at night without waking anyone up.\"",
    answers: ["[1]", "[2]", "[3]", "[4]"],
    correct_index: 0,
    justification: "\"This\" = it is quieter than a conversation: position [1].",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: WORK_FROM_HOME_HANDBOOK,
    question: "What is the purpose of the text?",
    answers: ["To advertise a job", "To explain a company policy", "To announce a new laptop", "To describe a health program"],
    correct_index: 1,
    justification: "A section of the employee handbook about working from home.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: WORK_FROM_HOME_HANDBOOK,
    question: "Who is NOT allowed to work from home?",
    answers: ["Employees in their first three months", "Managers", "Employees who use a company laptop", "Employees who work part-time"],
    correct_index: 0,
    justification: "\"Not available during the first three months of employment.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: WORK_FROM_HOME_HANDBOOK,
    question: "What must employees do between 10 A.M. and 3 P.M. when working from home?",
    answers: ["Attend online training", "Send a report to their manager", "Be reachable by colleagues", "Use their own computer"],
    correct_index: 2,
    justification: "\"Must be available by phone and e-mail during core hours.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: WORK_FROM_HOME_HANDBOOK,
    question: "In the handbook, the word \"review\" in paragraph 3, line 1, is closest in meaning to",
    answers: ["examine", "publish", "repeat", "describe"],
    correct_index: 0,
    justification: "\"Review requests\" = examine them before deciding.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: DAMAGED_SWEATER_REPLY,
    question: "Why did Ms. Lang contact Velvet Thread Clothing?",
    answers: ["Her order did not arrive.", "She received a damaged item.", "She was sent the wrong size.", "She was charged twice."],
    correct_index: 1,
    justification: "The sweater \"arrived with a hole in the sleeve\".",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: DAMAGED_SWEATER_REPLY,
    question: "What is indicated about the damaged sweater?",
    answers: ["It must be taken to a store.", "It must be sent back by Wednesday.", "It will be repaired for free.", "It does not need to be returned."],
    correct_index: 3,
    justification: "\"You do not need to send the damaged sweater back.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: DAMAGED_SWEATER_REPLY,
    question: "What has Velvet Thread Clothing given Ms. Lang?",
    answers: ["A discount on express delivery", "A cash refund", "A credit for future purchases", "A free scarf"],
    correct_index: 2,
    justification: "\"A credit of €15 to your customer account.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: DAMAGED_SWEATER_REPLY,
    question: "In which of the positions marked [1], [2], [3], and [4] does the following sentence best belong? \"Our team has looked at the photo you sent, and the damage is clearly visible.\"",
    answers: ["[1]", "[2]", "[3]", "[4]"],
    correct_index: 0,
    justification: "It talks about the damage just after the hole is mentioned: position [1].",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: SILK_EXHIBITION_REVIEW,
    question: "What is the exhibition about?",
    answers: ["The history of a trade", "The construction of a museum", "Modern fashion design", "The life of a painter"],
    correct_index: 0,
    justification: "\"The story of the silk trade between Asia and Europe.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: SILK_EXHIBITION_REVIEW,
    question: "What is said about the painted scroll?",
    answers: ["It can be touched by visitors.", "It is three hundred years old.", "It was made in Ostrava.", "It has never been shown in Europe before."],
    correct_index: 3,
    justification: "\"Shown in Europe for the first time.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: SILK_EXHIBITION_REVIEW,
    question: "What does the reviewer criticize?",
    answers: ["The length of the exhibition", "The size of the signs", "The number of objects", "The price of the audio guide"],
    correct_index: 1,
    justification: "\"The information signs are small and hard to read.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: SILK_EXHIBITION_REVIEW,
    question: "What is suggested about the audio guide?",
    answers: ["It describes only the scroll.", "It is only available in Czech.", "It can help visitors who cannot read the signs well.", "It costs extra."],
    correct_index: 2,
    justification: "The signs are hard to read, \"however\" the free audio guide is excellent.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: WINTER_FERRY_TIMETABLE,
    question: "What is the notice mainly about?",
    answers: ["A new ferry route", "The opening of a café", "Ticket prices for the summer", "A change in a ferry schedule"],
    correct_index: 3,
    justification: "\"A reduced winter timetable.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: WINTER_FERRY_TIMETABLE,
    question: "At what time does the last ferry leave Gull Island in winter?",
    answers: ["1:00 P.M.", "6:00 P.M.", "9:00 A.M.", "5:00 P.M."],
    correct_index: 1,
    justification: "Last ferry from Harbourne at 5:00 P.M. + one hour = 6:00 P.M.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: WINTER_FERRY_TIMETABLE,
    question: "What are passengers allowed to do?",
    answers: ["Buy snacks on board", "Travel with bicycles for free", "Bring their own food", "Book tickets by text message"],
    correct_index: 2,
    justification: "\"Passengers are welcome to bring their own food and drinks.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: WINTER_FERRY_TIMETABLE,
    question: "In which of the positions marked [1], [2], [3], and [4] does the following sentence best belong? \"The usual summer schedule, with seven crossings a day, will return in April.\"",
    answers: ["[1]", "[2]", "[3]", "[4]"],
    correct_index: 0,
    justification: "It contrasts the reduced winter timetable with the summer one: position [1].",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: DATA_ANALYST_INTERVIEW_EMAIL,
    question: "Why was the e-mail sent?",
    answers: ["To invite a candidate to an interview", "To change an office address", "To offer a job", "To reject an application"],
    correct_index: 0,
    justification: "\"We would like to invite you to an interview.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: DATA_ANALYST_INTERVIEW_EMAIL,
    question: "What will happen during the second part of the interview?",
    answers: ["Ms. Bermúdez will meet the team.", "Ms. Bermúdez will give a presentation.", "Ms. Bermúdez will sign a contract.", "Ms. Bermúdez will do a task on a computer."],
    correct_index: 3,
    justification: "\"Then you will complete a short practical exercise on a computer.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: DATA_ANALYST_INTERVIEW_EMAIL,
    question: "What is Ms. Bermúdez asked to do?",
    answers: ["Send her CV again", "Confirm the appointment", "Bring a laptop", "Call Dr. Haddou"],
    correct_index: 1,
    justification: "\"Please let us know if this time is convenient... by replying.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: DATA_ANALYST_INTERVIEW_EMAIL,
    question: "In the e-mail, the word \"convenient\" in paragraph 3, line 1, is closest in meaning to",
    answers: ["nearby", "inexpensive", "suitable", "comfortable"],
    correct_index: 2,
    justification: "\"A convenient time\" = a time that suits you.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: TRAIN_DEPOT_FOOD_HALL_ARTICLE,
    question: "What is the article mainly about?",
    answers: ["A historic building's new use", "A music festival", "A developer's retirement", "A new train line in Darnley"],
    correct_index: 0,
    justification: "The old depot became a food hall.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: TRAIN_DEPOT_FOOD_HALL_ARTICLE,
    question: "How long was the depot unused?",
    answers: ["Three years", "One year", "Exactly fourteen years", "More than ten years"],
    correct_index: 3,
    justification: "\"Empty for more than a decade\" (a decade = ten years).",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: TRAIN_DEPOT_FOOD_HALL_ARTICLE,
    question: "What is indicated about the food stalls?",
    answers: ["They are operated by local companies.", "They are open until midnight.", "They sell only bakery products.", "They are located on a stage."],
    correct_index: 0,
    justification: "\"All run by local businesses.\" (open until 11 P.M.)",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: TRAIN_DEPOT_FOOD_HALL_ARTICLE,
    question: "In which of the positions marked [1], [2], [3], and [4] does the following sentence best belong? \"Even the old ticket windows have been turned into a coffee counter.\"",
    answers: ["[1]", "[2]", "[3]", "[4]"],
    correct_index: 1,
    justification: "\"Even\" adds one more thing that was kept, after the walls and the roof: position [2].",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: WEB_DESIGN_INVOICE,
    question: "What kind of service is described in the invoice?",
    answers: ["Map printing", "Photography", "Web site work", "Architectural design"],
    correct_index: 2,
    justification: "Homepage, portfolio pages, contact form: a Web site.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: WEB_DESIGN_INVOICE,
    question: "What is the hourly rate charged by Bluefin Web Design?",
    answers: ["$100", "$80", "$60", "$120"],
    correct_index: 1,
    justification: "$1,600 ÷ 20 hours = $80 (same for the other lines).",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: WEB_DESIGN_INVOICE,
    question: "What is indicated about the portfolio photographs?",
    answers: ["Corbel Architecture supplied them.", "They cost $1,200.", "They were taken by Bluefin.", "They will be taken in May."],
    correct_index: 0,
    justification: "\"The photography... was provided by the client.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: WEB_DESIGN_INVOICE,
    question: "How much would the client pay if the invoice were paid on 10 May?",
    answers: ["$2,736", "$3,040", "$2,888", "$3,192"],
    correct_index: 2,
    justification: "Before 15 May: 5 percent off $3,040 = $2,888.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: AIRPORT_TRAM_ARTICLE,
    question: "What is the article mainly about?",
    answers: ["The opening of a new airport", "A change in taxi prices", "A university's new campus", "A planned transportation project"],
    correct_index: 3,
    justification: "A new tram line has been approved.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: AIRPORT_TRAM_ARTICLE,
    question: "How long will the tram journey to the airport take?",
    answers: ["10 minutes", "22 minutes", "3 years", "11 minutes"],
    correct_index: 1,
    justification: "\"The journey from the station to the airport will take 22 minutes.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: AIRPORT_TRAM_ARTICLE,
    question: "What do city officials expect the tram to do?",
    answers: ["Replace all city buses", "Lower ticket prices at the airport", "Increase the number of flights", "Reduce road traffic"],
    correct_index: 3,
    justification: "\"Reduce traffic on the airport road by about 30 percent.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: AIRPORT_TRAM_ARTICLE,
    question: "In which of the positions marked [1], [2], [3], and [4] does the following sentence best belong? \"Students and staff have been asking for a better connection for years.\"",
    answers: ["[1]", "[2]", "[3]", "[4]"],
    correct_index: 1,
    justification: "Students and staff = the university, mentioned just before: position [2].",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: FARM_TEAM_DAY_EMAIL,
    question: "What is the purpose of the e-mail?",
    answers: ["To give details about a team event", "To invite clients to a farm", "To announce new sales targets", "To change a meeting time"],
    correct_index: 0,
    justification: "Details of the team day: place, bus, lunch.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: FARM_TEAM_DAY_EMAIL,
    question: "What will the participants eat for lunch?",
    answers: ["A meal prepared by the farmer", "Sandwiches from the office", "Dishes they have cooked", "Food from a restaurant"],
    correct_index: 2,
    justification: "\"Lunch will be the food we prepare ourselves!\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: FARM_TEAM_DAY_EMAIL,
    question: "What are participants advised to do?",
    answers: ["Bring their own vegetables", "Wear suitable footwear", "Drive to the farm", "Arrive at 4 P.M."],
    correct_index: 1,
    justification: "\"Please wear comfortable shoes.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: FARM_TEAM_DAY_EMAIL,
    question: "Why does Ms. Lowe ask about food allergies?",
    answers: ["So that she can order a different bus", "So that she can pass the information to the farm", "So that she can choose a restaurant", "So that she can change the date"],
    correct_index: 1,
    justification: "\"So that I can let the farm know.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: LIBRARY_BOOK_SALE_NOTICE,
    question: "What is the notice about?",
    answers: ["A new music shop", "A reading club for children", "The opening of a new library", "A sale of secondhand items"],
    correct_index: 3,
    justification: "A sale of used books, DVDs and CDs.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: LIBRARY_BOOK_SALE_NOTICE,
    question: "What will happen on Sunday afternoon?",
    answers: ["The sale will close early.", "New books will arrive.", "Customers can fill a bag for a fixed price.", "Children's books will be given away."],
    correct_index: 2,
    justification: "\"All remaining items will be sold for €5 per bag.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: LIBRARY_BOOK_SALE_NOTICE,
    question: "How will the money from the sale be used?",
    answers: ["To purchase books for young readers", "To buy new DVDs", "To repair the main hall", "To pay library staff"],
    correct_index: 0,
    justification: "\"To buy new books for the children's section.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: LIBRARY_BOOK_SALE_NOTICE,
    question: "In which of the positions marked [1], [2], [3], and [4] does the following sentence best belong? \"Last year, this paid for more than six hundred picture books.\"",
    answers: ["[1]", "[2]", "[3]", "[4]"],
    correct_index: 2,
    justification: "\"This\" = the money raised, just before: position [3].",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: TV_DELIVERY_TEXTS,
    question: "Why did Mr. Malhotra contact Ms. Ferreira?",
    answers: ["Her TV is out of stock.", "A delivery person could not reach her.", "She forgot to pay.", "Her order was canceled."],
    correct_index: 1,
    justification: "The driver is outside, \"but nobody is answering the intercom\".",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: TV_DELIVERY_TEXTS,
    question: "Why did the driver arrive early?",
    answers: ["There was no traffic on the roads.", "Ms. Ferreira asked him to come early.", "The store changed the delivery date.", "His other deliveries took less time than planned."],
    correct_index: 3,
    justification: "\"The driver finished his earlier deliveries faster than expected.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: TV_DELIVERY_TEXTS,
    question: "At 1:09 P.M., what does Ms. Ferreira mean when she writes, \"That would be perfect\"?",
    answers: ["She is happy with her new TV.", "She thinks the driver is very fast.", "She accepts the new delivery time.", "She wants to keep her old TV."],
    correct_index: 2,
    justification: "She agrees to 4:30, because she will be home by 4.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: TV_DELIVERY_TEXTS,
    question: "What will the driver do at 4:30 P.M.?",
    answers: ["Take an old television away", "Repair a TV", "Install an antenna", "Collect a payment"],
    correct_index: 0,
    justification: "\"He'll also take away your old TV.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: LUMEN_LIGHTING_PROFILE,
    question: "What is the article mainly about?",
    answers: ["The growth of a small business", "A new hotel in Aarhus", "A market for secondhand goods", "A course on lamp making"],
    correct_index: 0,
    justification: "From markets to clients across Scandinavia.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: LUMEN_LIGHTING_PROFILE,
    question: "What is indicated about Lumen Lighting's products?",
    answers: ["They are produced in a large factory.", "They are sold only at markets.", "They are designed for outdoor use.", "They are made from reused materials."],
    correct_index: 3,
    justification: "\"Made from recycled glass and metal.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: LUMEN_LIGHTING_PROFILE,
    question: "What will the company do next year?",
    answers: ["Move to a new workshop", "Open a restaurant", "Sell products for homes online", "Hire one hundred employees"],
    correct_index: 2,
    justification: "\"A line of lamps for homes, which will be sold online from next year.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: LUMEN_LIGHTING_PROFILE,
    question: "In which of the positions marked [1], [2], [3], and [4] does the following sentence best belong? \"Some of the glass comes from bottles collected at local bars.\"",
    answers: ["[1]", "[2]", "[3]", "[4]"],
    correct_index: 1,
    justification: "It gives a detail about the recycled glass: position [2].",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: PARKING_GARAGE_CLOSURE_MEMO,
    question: "What is the main purpose of the memo?",
    answers: ["To advertise a public garage", "To announce a temporary closure", "To encourage staff to cycle", "To introduce a new parking fee"],
    correct_index: 1,
    justification: "The garage will be closed from 3 to 14 February.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: PARKING_GARAGE_CLOSURE_MEMO,
    question: "Why will the garage be closed?",
    answers: ["A public event will be held there.", "It is being sold.", "It is too small.", "Improvements are being made."],
    correct_index: 3,
    justification: "The floor is repainted and new lights are installed.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: PARKING_GARAGE_CLOSURE_MEMO,
    question: "In the memo, the word \"cover\" in paragraph 2, line 1, is closest in meaning to",
    answers: ["pay for", "hide", "report on", "protect"],
    correct_index: 0,
    justification: "\"Cover the cost\" = pay for it.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: PARKING_GARAGE_CLOSURE_MEMO,
    question: "What should staff who drive to work do before 31 January?",
    answers: ["Register their bicycle", "Pay for their parking", "Pick up a card at reception", "Paint their parking space"],
    correct_index: 2,
    justification: "\"Collect a parking card from the reception desk before 31 January.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: ESCAPE_ROOM_WEB_PAGE,
    question: "What is the Web page mainly about?",
    answers: ["A detective training course", "A group entertainment activity", "A space exhibition", "A history museum"],
    correct_index: 1,
    justification: "Escape rooms for groups.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: ESCAPE_ROOM_WEB_PAGE,
    question: "What is a requirement for players?",
    answers: ["They must book three rooms.", "They must work for the same company.", "They must be at least 12 years old.", "They must play in groups of six."],
    correct_index: 2,
    justification: "\"Players must be at least 12 years old.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: ESCAPE_ROOM_WEB_PAGE,
    question: "Why should players arrive early?",
    answers: ["To choose their room", "To listen to an explanation of the rules", "To pay a deposit", "To meet the other teams"],
    correct_index: 1,
    justification: "\"So that our staff can explain the rules.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: ESCAPE_ROOM_WEB_PAGE,
    question: "In which of the positions marked [1], [2], [3], and [4] does the following sentence best belong? \"Special prices are available for groups from the same company.\"",
    answers: ["[1]", "[2]", "[3]", "[4]"],
    correct_index: 1,
    justification: "It follows the mention of companies and team-building: position [2].",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: RENT_INCREASE_LETTER,
    question: "What is the main purpose of the letter?",
    answers: ["To inform a tenant about a rent increase", "To advertise an apartment for rent", "To ask a tenant to leave the apartment", "To request a late payment"],
    correct_index: 0,
    justification: "The rent \"will increase from €980 to €1,010\".",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: RENT_INCREASE_LETTER,
    question: "By how much will the monthly rent increase?",
    answers: ["€10", "€1,010", "€98", "€30"],
    correct_index: 3,
    justification: "€1,010 − €980 = €30.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: RENT_INCREASE_LETTER,
    question: "What will happen in May?",
    answers: ["New windows will be put in.", "The insurance company will visit.", "The tenant will receive a refund.", "The rent will increase."],
    correct_index: 0,
    justification: "\"New energy-efficient windows will be installed... in May.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: RENT_INCREASE_LETTER,
    question: "What is suggested about the rent?",
    answers: ["It includes the cost of electricity.", "It is lower than in other buildings.", "It will increase again in May.", "It has not changed for three years."],
    correct_index: 3,
    justification: "\"This is the first increase in three years.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: QUIET_CARRIAGE_ARTICLE,
    question: "What is the article mainly about?",
    answers: ["A survey about ticket prices", "A new service on trains", "A change in train schedules", "A new train route"],
    correct_index: 1,
    justification: "A \"quiet carriage\" on intercity trains.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: QUIET_CARRIAGE_ARTICLE,
    question: "What will passengers in quiet carriages NOT be allowed to do?",
    answers: ["Use laptops", "Sleep", "Make phone calls", "Read books"],
    correct_index: 2,
    justification: "\"Passengers will be asked not to make phone calls.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: QUIET_CARRIAGE_ARTICLE,
    question: "How can passengers recognize a quiet carriage?",
    answers: ["By an announcement", "By the blue signs", "By its location near the café", "By the color of the seats"],
    correct_index: 1,
    justification: "\"Marked with blue signs on the doors and windows.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: QUIET_CARRIAGE_ARTICLE,
    question: "In which of the positions marked [1], [2], [3], and [4] does the following sentence best belong? \"Most of them were people who travel for business several times a month.\"",
    answers: ["[1]", "[2]", "[3]", "[4]"],
    correct_index: 1,
    justification: "\"Most of them\" = the 5,000 passengers of the survey: position [2].",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: CINEMA_REWARDS_EMAIL,
    question: "What is the purpose of the e-mail?",
    answers: ["To explain changes to a membership program", "To advertise a film festival", "To ask members to pay a fee", "To announce a new cinema"],
    correct_index: 0,
    justification: "\"Changes to Starlight Rewards.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: CINEMA_REWARDS_EMAIL,
    question: "How will members receive a free ticket after 1 April?",
    answers: ["By buying snacks", "By collecting points", "By buying eight tickets", "By visiting on Tuesdays"],
    correct_index: 2,
    justification: "\"A free ticket after every eight tickets bought.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: CINEMA_REWARDS_EMAIL,
    question: "What will happen to the points members already have?",
    answers: ["They will be doubled.", "They will expire on 1 April.", "They can be used for snacks.", "They will be converted into tickets."],
    correct_index: 3,
    justification: "\"They will be turned into free tickets automatically.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: CINEMA_REWARDS_EMAIL,
    question: "In which of the positions marked [1], [2], [3], and [4] does the following sentence best belong? \"This offer is not valid on public holidays.\"",
    answers: ["[1]", "[2]", "[3]", "[4]"],
    correct_index: 1,
    justification: "\"This offer\" = the 20 percent off on Tuesdays: position [2].",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: EMAIL_WORKSHOP_FEEDBACK_FORM,
    question: "What was the topic of the workshop?",
    answers: ["Customer service by phone", "Printing documents", "Using a projector", "Business writing"],
    correct_index: 3,
    justification: "\"Writing Clear Business E-mails.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: EMAIL_WORKSHOP_FEEDBACK_FORM,
    question: "What did Mr. Brandt give the lowest rating?",
    answers: ["The room and equipment", "The materials", "The trainer's explanations", "The content"],
    correct_index: 0,
    justification: "Room and equipment: 2.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: EMAIL_WORKSHOP_FEEDBACK_FORM,
    question: "What problem does Mr. Brandt mention?",
    answers: ["The exercises were too easy.", "The handouts contained mistakes.", "The workshop was too long.", "The trainer arrived late."],
    correct_index: 1,
    justification: "\"The handouts had several printing errors.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: EMAIL_WORKSHOP_FEEDBACK_FORM,
    question: "What is suggested about Mr. Brandt?",
    answers: ["He did not complete the exercises.", "He prepared the handouts.", "He is interested in further training.", "He works as a trainer."],
    correct_index: 2,
    justification: "\"I would like to take the advanced course.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: SCHOOL_LUNCH_FARMS_ARTICLE,
    question: "What is the article mainly about?",
    answers: ["A cooking competition", "A school meal program", "A new farm in the valley", "A parents' meeting"],
    correct_index: 1,
    justification: "School lunches made with local produce.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: SCHOOL_LUNCH_FARMS_ARTICLE,
    question: "Where are the meals prepared?",
    answers: ["At the education office", "On the farms", "In each school's kitchen", "In a central kitchen"],
    correct_index: 3,
    justification: "\"There [the central kitchen], cooks prepare the meals.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: SCHOOL_LUNCH_FARMS_ARTICLE,
    question: "What does Ms. Fitch say about her son?",
    answers: ["He brings his lunch from home.", "He helps the cooks at school.", "He now likes a vegetable he used to refuse.", "He works on a farm."],
    correct_index: 2,
    justification: "He never ate carrots; now he asks for them.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: SCHOOL_LUNCH_FARMS_ARTICLE,
    question: "In which of the positions marked [1], [2], [3], and [4] does the following sentence best belong? \"Remarkably, these meals cost no more than the ones the schools served before.\"",
    answers: ["[1]", "[2]", "[3]", "[4]"],
    correct_index: 0,
    justification: "\"These meals\" = the 2,400 meals a day just mentioned: position [1].",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: VISITOR_SIGN_IN_NOTICE,
    question: "What is the notice mainly about?",
    answers: ["A new way to register visitors", "A change in the center's address", "A new reception employee", "A research project"],
    correct_index: 0,
    justification: "Visitors must sign in on touch screens.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: VISITOR_SIGN_IN_NOTICE,
    question: "What will visitors receive after signing in?",
    answers: ["A paper form", "A printed badge", "A map of the building", "A parking ticket"],
    correct_index: 1,
    justification: "\"A visitor badge will then be printed automatically.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: VISITOR_SIGN_IN_NOTICE,
    question: "In the notice, the word \"accompany\" in paragraph 2, line 1, is closest in meaning to",
    answers: ["introduce", "pay for", "stay with", "photograph"],
    correct_index: 2,
    justification: "\"Accompany their visitors\" = stay with them.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: VISITOR_SIGN_IN_NOTICE,
    question: "What will happen to the paper sign-in book?",
    answers: ["It will stop being used.", "It will be replaced every month.", "It will be used only by staff.", "It will be kept at the entrance."],
    correct_index: 0,
    justification: "\"The paper sign-in book will no longer be used.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: SUMMIT_HOTEL_RATES_MULTI,
    question: "What is included in the special rates?",
    answers: ["Entry to the summit", "Parking", "Dinner at the hotel", "Transportation to the conference venue"],
    correct_index: 3,
    justification: "\"A free shuttle service to the Lyon Convention Center.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: SUMMIT_HOTEL_RATES_MULTI,
    question: "What type of room does Mr. Hayashi want?",
    answers: ["A room with two beds", "A suite", "A standard room", "A superior room"],
    correct_index: 3,
    justification: "\"A room with a view of the city\" = the superior room (city view).",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: SUMMIT_HOTEL_RATES_MULTI,
    question: "Why was Mr. Hayashi's code most likely not accepted?",
    answers: ["The hotel is full.", "He typed the code incorrectly.", "He tried to book after the deadline.", "The code is only for suites."],
    correct_index: 2,
    justification: "Rooms had to be booked by 15 August; his e-mail is from 20 August.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: SUMMIT_HOTEL_RATES_MULTI,
    question: "How many nights does Mr. Hayashi want to stay?",
    answers: ["Three", "Four", "One", "Two"],
    correct_index: 0,
    justification: "The nights of 16, 17 and 18 September.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: SUMMIT_HOTEL_RATES_MULTI,
    question: "What does Mr. Hayashi say about Ms. Fabre?",
    answers: ["She has already booked a suite.", "She will need a room too.", "She lives in Lyon.", "She is speaking at the summit."],
    correct_index: 1,
    justification: "She \"needs a standard room for the same nights\".",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: STORE_SUPERVISOR_JOB_MULTI,
    question: "What is NOT listed as a responsibility of the position?",
    answers: ["Taking customers on hiking trips", "Creating schedules", "Managing stock", "Training new staff"],
    correct_index: 0,
    justification: "Schedules, training and stock are listed; hiking trips are not a task.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: STORE_SUPERVISOR_JOB_MULTI,
    question: "What is suggested about Mr. Reid?",
    answers: ["He has never worked in a store.", "He already works at Ferrow Outdoor Gear.", "He meets the experience requirement.", "He sent his application late."],
    correct_index: 2,
    justification: "Two years required; he has supervised a team for three years.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: STORE_SUPERVISOR_JOB_MULTI,
    question: "Which of Mr. Reid's activities would the company see as an advantage?",
    answers: ["Writing cover letters", "Leading hikes", "Managing a team of eight", "Driving a van"],
    correct_index: 1,
    justification: "The ad says \"An interest in hiking or camping is a plus\"; he leads hiking trips.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: STORE_SUPERVISOR_JOB_MULTI,
    question: "Why was the third document sent?",
    answers: ["To request a new CV", "To offer Mr. Reid the job", "To reject Mr. Reid's application", "To arrange an interview"],
    correct_index: 3,
    justification: "\"We would like to invite you to an interview.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: STORE_SUPERVISOR_JOB_MULTI,
    question: "What is Mr. Reid asked to bring?",
    answers: ["A letter from his manager", "A copy of his CV", "A document that proves he can drive", "Hiking equipment"],
    correct_index: 2,
    justification: "\"Please bring a copy of your driver's license.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: OFFICE_CATERING_MULTI,
    question: "What is the purpose of the e-mail?",
    answers: ["To place a food order", "To complain about a delivery", "To cancel a training day", "To ask for a menu"],
    correct_index: 0,
    justification: "She orders lunch for a training day.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: OFFICE_CATERING_MULTI,
    question: "What is the total cost of Ms. Coelho's order?",
    answers: ["$185", "$245", "$280", "$210"],
    correct_index: 1,
    justification: "2 × $65 + 2 × $40 + $35 = $245.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: OFFICE_CATERING_MULTI,
    question: "What is suggested about the delivery of Ms. Coelho's order?",
    answers: ["It will arrive on Monday.", "It will cost extra.", "It will be made to a restaurant.", "It will be free."],
    correct_index: 3,
    justification: "The order is over $150 → free delivery.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: OFFICE_CATERING_MULTI,
    question: "What does Ms. Coelho request?",
    answers: ["A discount for 20 people", "Food suitable for vegetarians", "Gluten-free pastries", "A pastry box"],
    correct_index: 1,
    justification: "\"Make sure some of the sandwiches are suitable\" for vegetarians.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: OFFICE_CATERING_MULTI,
    question: "Where should the invoice be sent?",
    answers: ["To 9 Gresham Street", "With the delivery driver", "To Tilda's Kitchen", "To an e-mail address"],
    correct_index: 3,
    justification: "\"Please send the invoice to accounts@ardenlegal.com.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: SKILLS_WEEK_SCHEDULE_MULTI,
    question: "How many workshops does Ms. Adair lead?",
    answers: ["Two", "Four", "Three", "One"],
    correct_index: 0,
    justification: "Monday and Wednesday.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: SKILLS_WEEK_SCHEDULE_MULTI,
    question: "Why was the e-mail sent?",
    answers: ["To ask employees to register", "To introduce a new trainer", "To announce a change in the schedule", "To cancel all workshops"],
    correct_index: 2,
    justification: "A workshop is moved to another day.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: SKILLS_WEEK_SCHEDULE_MULTI,
    question: "Which workshop will now take place on Friday morning?",
    answers: ["Negotiation Basics", "Writing Effective Reports", "Managing Your Time", "Leading Meetings"],
    correct_index: 1,
    justification: "Ms. Sørensen's workshop (Writing Effective Reports) moves to Friday at 9:00.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: SKILLS_WEEK_SCHEDULE_MULTI,
    question: "What is indicated about Room 2B?",
    answers: ["It can hold 50 people.", "It is being renovated.", "It will not be available for training on Thursday.", "It is used only by managers."],
    correct_index: 2,
    justification: "\"Room 2B will be used for job interviews on Thursday.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: SKILLS_WEEK_SCHEDULE_MULTI,
    question: "What is true about employees who registered for Ms. Sørensen's workshop?",
    answers: ["They do not have to sign up again.", "They will receive a refund.", "They must attend on Thursday.", "They must choose a new workshop."],
    correct_index: 0,
    justification: "\"You do not need to register again.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: COFFEE_MAKER_REVIEW_MULTI,
    question: "What feature of the Brewmaster Duo is mentioned on the product page?",
    answers: ["A five-year warranty", "A 3-liter water tank", "A coffee grinder", "A built-in milk frother"],
    correct_index: 3,
    justification: "\"A built-in milk frother.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: COFFEE_MAKER_REVIEW_MULTI,
    question: "What problem did Ulla K. have?",
    answers: ["The frother broke.", "Part of the machine stopped working.", "The coffee tasted bad.", "The machine arrived late."],
    correct_index: 1,
    justification: "\"The timer stopped working after only five weeks.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: COFFEE_MAKER_REVIEW_MULTI,
    question: "Which of the available colors did Ulla K. choose?",
    answers: ["Black", "Red", "Gray", "Silver"],
    correct_index: 3,
    justification: "\"The silver color I ordered...\" (gray is not one of the colors).",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: COFFEE_MAKER_REVIEW_MULTI,
    question: "Why does Brewmaster most likely replace the machine for free?",
    answers: ["The problem happened during the warranty period.", "The machine was the wrong color.", "Ulla K. bought the machine in a store.", "Ulla K. paid extra for fast delivery."],
    correct_index: 0,
    justification: "Five weeks is well within the two-year warranty.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: COFFEE_MAKER_REVIEW_MULTI,
    question: "What does Brewmaster offer to do?",
    answers: ["Repair the timer in a store", "Change the color of the machine", "Send a new machine", "Refund $149"],
    correct_index: 2,
    justification: "\"We will send you a replacement machine free of charge.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: GLASSHOUSE_VENUE_MULTI,
    question: "What is the purpose of Mr. Vos's e-mail?",
    answers: ["To complain about a past event", "To book a table at a restaurant", "To invite Ms. Hart to a dinner", "To ask about renting a space"],
    correct_index: 3,
    justification: "He asks if the Glasshouse is available and big enough.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: GLASSHOUSE_VENUE_MULTI,
    question: "Why does Ms. Hart suggest the Orangery Hall?",
    answers: ["The Glasshouse cannot seat 140 people for dinner.", "The Orangery Hall has better lighting.", "The Glasshouse is not available on 30 May.", "The Orangery Hall is cheaper."],
    correct_index: 0,
    justification: "The Glasshouse holds only 120 guests for dinners.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: GLASSHOUSE_VENUE_MULTI,
    question: "How much will Halden Pharmaceuticals most likely pay to rent the hall?",
    answers: ["€4,400", "€2,600", "€3,000", "€1,800"],
    correct_index: 1,
    justification: "30 May is a Friday → weekend price (€2,600), and the Orangery costs \"the same price\".",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: GLASSHOUSE_VENUE_MULTI,
    question: "What is indicated about the visit Ms. Hart proposes?",
    answers: ["It will be at Halden Pharmaceuticals.", "It is on a weekend.", "It is on one of the usual visiting days.", "It will take place in the evening."],
    correct_index: 2,
    justification: "Tuesday afternoon: visits are arranged on Tuesday and Thursday afternoons.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: GLASSHOUSE_VENUE_MULTI,
    question: "What is Halden Pharmaceuticals celebrating?",
    answers: ["A new product", "The opening of an office", "Its fiftieth anniversary", "An employee's retirement"],
    correct_index: 2,
    justification: "\"To celebrate our company's fiftieth anniversary.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: HIGHLAND_TOURS_MULTI,
    question: "Which tour runs every day?",
    answers: ["Tour A", "Tour C", "Tour B", "None of the tours"],
    correct_index: 0,
    justification: "Tour A: \"daily\".",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: HIGHLAND_TOURS_MULTI,
    question: "Which tour does Ms. Leclerc want to book?",
    answers: ["Tour A", "Tour C", "Tour B", "A private tour"],
    correct_index: 1,
    justification: "On Wednesday, with lunch included: Tour C.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: HIGHLAND_TOURS_MULTI,
    question: "How much will the tour cost Ms. Leclerc's family?",
    answers: ["£190", "£285", "£142.50", "£237.50"],
    correct_index: 3,
    justification: "Two adults: 2 × £95 = £190, plus the child at half price: £47.50 → £237.50.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: HIGHLAND_TOURS_MULTI,
    question: "What is suggested about Ms. Leclerc's booking?",
    answers: ["It is for a weekend tour.", "It must be paid in cash.", "It is too late for the tour she wants.", "It meets the booking requirement."],
    correct_index: 3,
    justification: "Sunday for Wednesday = more than two days before the tour.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: HIGHLAND_TOURS_MULTI,
    question: "What information does Ms. Leclerc ask for?",
    answers: ["Whether children can join", "Where to leave her car", "What time lunch is served", "How to pay"],
    correct_index: 1,
    justification: "\"Where we should park our car on the day.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: OFFICE_SUPPLIES_ORDER_MULTI,
    question: "When did the order arrive?",
    answers: ["On 5 September", "On 6 September", "On 7 September", "On 2 September"],
    correct_index: 0,
    justification: "The e-mail of 6 September says it \"arrived yesterday\": 5 September (as estimated).",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: OFFICE_SUPPLIES_ORDER_MULTI,
    question: "What was wrong with the delivery?",
    answers: ["It was delivered late.", "It arrived at the wrong office.", "Some items were the wrong color.", "The paper was damaged."],
    correct_index: 2,
    justification: "Black pens instead of blue ones (and missing organizers).",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: OFFICE_SUPPLIES_ORDER_MULTI,
    question: "How many desk organizers does Penmark still need to send?",
    answers: ["Six", "One", "Four", "Two"],
    correct_index: 3,
    justification: "Six were ordered, four arrived: two are missing.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: OFFICE_SUPPLIES_ORDER_MULTI,
    question: "What does Mr. Moreau suggest?",
    answers: ["Returning some items to the driver", "Paying only for the paper", "Picking up the items himself", "Canceling the order"],
    correct_index: 0,
    justification: "\"Your driver can collect the black pens.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: OFFICE_SUPPLIES_ORDER_MULTI,
    question: "Which part of the order cost the most?",
    answers: ["The pens", "The printer paper", "The desk organizers", "The delivery"],
    correct_index: 1,
    justification: "Printer paper: $240.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: COMMUNITY_GARDEN_PLOTS_MULTI,
    question: "What is provided to all gardeners?",
    answers: ["Seeds", "A small greenhouse", "Tools and water", "Free plants"],
    correct_index: 2,
    justification: "\"Gardeners have access to tools, water, and a shared compost area.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: COMMUNITY_GARDEN_PLOTS_MULTI,
    question: "What is indicated about Ms. Mwangi's application?",
    answers: ["It was rejected.", "It was received late.", "It was sent before the deadline.", "It was for a small plot."],
    correct_index: 2,
    justification: "Dated 10 February; the deadline was 15 February.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: COMMUNITY_GARDEN_PLOTS_MULTI,
    question: "How much will Ms. Mwangi most likely pay?",
    answers: ["$70", "$40", "$14", "$110"],
    correct_index: 0,
    justification: "She asked for a large plot: $70 per year.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: COMMUNITY_GARDEN_PLOTS_MULTI,
    question: "Why was a lottery held?",
    answers: ["The garden had too many plots.", "More people applied than there were plots.", "The fees had increased.", "Ms. Mwangi asked for one."],
    correct_index: 1,
    justification: "Fourteen applications for six plots.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: COMMUNITY_GARDEN_PLOTS_MULTI,
    question: "When can Ms. Mwangi pay her fee?",
    answers: ["Only on 1 March at noon", "Online at any time", "On any weekday", "On a Saturday morning"],
    correct_index: 3,
    justification: "The office \"is open on Saturdays from 10 A.M. to noon\".",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: CAR_RENTAL_FUEL_MULTI,
    question: "How long was Mr. Mendonça's rental?",
    answers: ["Ten days", "One week", "One month", "Three days"],
    correct_index: 1,
    justification: "From 3 to 10 August: 7 days.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: CAR_RENTAL_FUEL_MULTI,
    question: "What does the rental summary indicate?",
    answers: ["The car had to be returned to a different airport.", "The car was rented in Lisbon.", "Only one driver was included.", "Fuel is included in the price."],
    correct_index: 2,
    justification: "\"Extra driver: not included.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: CAR_RENTAL_FUEL_MULTI,
    question: "According to Swiftway's rules, how much fuel was Mr. Mendonça charged for?",
    answers: ["25 liters", "2.5 liters", "8 liters", "10 liters"],
    correct_index: 3,
    justification: "€25 ÷ €2.50 per liter = 10 liters.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: CAR_RENTAL_FUEL_MULTI,
    question: "Why does Mr. Mendonça believe the charge is a mistake?",
    answers: ["He refueled the car before returning it.", "He rented a smaller car.", "He paid in cash.", "He returned the car early."],
    correct_index: 0,
    justification: "\"I filled the tank... just before returning the car.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: CAR_RENTAL_FUEL_MULTI,
    question: "What does Mr. Mendonça have as evidence?",
    answers: ["A receipt from a gas station", "A letter from the airport", "A photo of the car", "A copy of his credit card"],
    correct_index: 0,
    justification: "\"I have kept the receipt from the gas station.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: CORVALE_BIKE_LANES_MULTI,
    question: "What is the article mainly about?",
    answers: ["A new parking garage", "A bicycle race", "A plan for a city street", "The opening of a new bakery"],
    correct_index: 2,
    justification: "Bike lanes will be added on Corvale Avenue.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: CORVALE_BIKE_LANES_MULTI,
    question: "How many parking spaces will remain on Corvale Avenue?",
    answers: ["200", "140", "60", "80"],
    correct_index: 3,
    justification: "140 − 60 = 80.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: CORVALE_BIKE_LANES_MULTI,
    question: "What does Mr. Fontaine say about cyclists?",
    answers: ["They should pay to use the lanes.", "They stop at shops more often than drivers.", "They rarely shop on Corvale Avenue.", "They cause traffic problems."],
    correct_index: 1,
    justification: "\"People on bicycles stop more often than people in cars.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: CORVALE_BIKE_LANES_MULTI,
    question: "What is Ms. Lambrecht concerned about?",
    answers: ["Her customers may find it harder to reach her shop.", "Her bakery will have to move.", "The work will take too long.", "The bike lanes will not be safe."],
    correct_index: 0,
    justification: "Fewer parking spaces, and her older customers can't walk far.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: CORVALE_BIKE_LANES_MULTI,
    question: "What does Ms. Lambrecht suggest?",
    answers: ["Delaying the project until September", "Removing the bike lanes", "Free parking in a garage on weekends", "Building a new bakery"],
    correct_index: 2,
    justification: "\"Open the parking garage on Hale Street to shoppers for free on weekends.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: ENERGY_INTERNSHIP_MULTI,
    question: "What is indicated about the internships?",
    answers: ["They take place in Utrecht.", "They are paid.", "They are only for engineering students.", "They last six months."],
    correct_index: 1,
    justification: "\"Verdant Energy offers paid internships.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: ENERGY_INTERNSHIP_MULTI,
    question: "Why can't Ms. Elkassem apply in the usual way?",
    answers: ["She studies the wrong subject.", "She lives too far away.", "She is not a university student.", "The application period has ended."],
    correct_index: 3,
    justification: "Applications closed on 15 March; she writes on 18 March.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: ENERGY_INTERNSHIP_MULTI,
    question: "What is suggested about the place that Mr. van Leeuwen mentions?",
    answers: ["It is unpaid.", "It is not in the office Ms. Elkassem prefers.", "It will start in September.", "It is in the finance team."],
    correct_index: 1,
    justification: "The place is in Hamburg; she prefers Rotterdam.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: ENERGY_INTERNSHIP_MULTI,
    question: "Why is a place still available?",
    answers: ["A new office opened.", "Few students applied.", "A student decided not to take part.", "The program was extended."],
    correct_index: 2,
    justification: "\"Because a student withdrew.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: ENERGY_INTERNSHIP_MULTI,
    question: "What does Mr. van Leeuwen ask Ms. Elkassem to do if she is interested?",
    answers: ["Send her CV by a certain date", "Apply online next February", "Visit the Hamburg office", "Call him on 25 March"],
    correct_index: 0,
    justification: "\"Please send your CV by 25 March.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: FURNITURE_SALE_DELIVERY_MULTI,
    question: "What is the advertisement for?",
    answers: ["A home design course", "A delivery company", "The opening of a new store", "A sale at a furniture store"],
    correct_index: 3,
    justification: "\"Spring Sale\" with discounts.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: FURNITURE_SALE_DELIVERY_MULTI,
    question: "How much did Mr. Ahn most likely pay for the table, without delivery?",
    answers: ["$510", "$600", "$480", "$420"],
    correct_index: 2,
    justification: "Dining tables: 20% off $600 = $480.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: FURNITURE_SALE_DELIVERY_MULTI,
    question: "Why was Mr. Ahn charged for delivery?",
    answers: ["He bought the table online.", "He asked for a weekend delivery.", "The sale had ended.", "The discounted price was under $500."],
    correct_index: 3,
    justification: "$480 is under $500, so delivery costs $45.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: FURNITURE_SALE_DELIVERY_MULTI,
    question: "What does Mr. Ahn ask for?",
    answers: ["A delivery on a day that is not normally offered", "A refund of $600", "A receipt by e-mail", "A different table"],
    correct_index: 0,
    justification: "Saturday, but \"delivery takes place on weekdays only\".",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: FURNITURE_SALE_DELIVERY_MULTI,
    question: "When did Mr. Ahn buy the table?",
    answers: ["On 15 April", "During the sale", "Before the sale began", "After the sale ended"],
    correct_index: 1,
    justification: "3 April is between 1 and 15 April.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: RESIDENT_PARKING_PERMIT_MULTI,
    question: "What will change on 1 June?",
    answers: ["The parking rules in a district", "The price of public transport", "The opening hours of an office", "The location of a parking garage"],
    correct_index: 0,
    justification: "Parking for non-residents will be limited.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: RESIDENT_PARKING_PERMIT_MULTI,
    question: "When can non-residents park for as long as they want?",
    answers: ["Between 8 A.M. and 6 P.M.", "On Saturdays", "On Sundays", "On weekdays"],
    correct_index: 2,
    justification: "The limit applies Monday to Saturday only.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: RESIDENT_PARKING_PERMIT_MULTI,
    question: "What document is Mr. Aalto still missing?",
    answers: ["A photo of his car", "His driver's license", "Proof of his address", "The registration document for his second car"],
    correct_index: 3,
    justification: "On the form, \"Registration (vehicle 2)\" is not ticked.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: RESIDENT_PARKING_PERMIT_MULTI,
    question: "How much will Mr. Aalto pay in total for both permits?",
    answers: ["€30", "€90", "€120", "€60"],
    correct_index: 1,
    justification: "€30 (first car) + €60 (second car) = €90.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: RESIDENT_PARKING_PERMIT_MULTI,
    question: "What is Mr. Aalto told about his first permit?",
    answers: ["It was rejected.", "It will be sent by mail.", "It must be picked up.", "It costs €60."],
    correct_index: 1,
    justification: "\"Approved and will be mailed to you this week.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: RETAIL_CONFERENCE_UPDATE_MULTI,
    question: "Who is Ms. Sood?",
    answers: ["The head of a company", "A pilot", "A store designer", "A conference organizer"],
    correct_index: 0,
    justification: "\"CEO, Cartwheel Commerce.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: RETAIL_CONFERENCE_UPDATE_MULTI,
    question: "Why was the e-mail sent?",
    answers: ["To cancel the conference", "To invite participants to lunch", "To announce changes to the program", "To introduce a new speaker"],
    correct_index: 2,
    justification: "\"Program update.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: RETAIL_CONFERENCE_UPDATE_MULTI,
    question: "Where will the first event of 23 October take place?",
    answers: ["In the Main Hall", "At the airport", "In Room C", "In Room A"],
    correct_index: 3,
    justification: "The panel now starts at 9:00 \"in the same room as planned\": Room A.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: RETAIL_CONFERENCE_UPDATE_MULTI,
    question: "What is indicated about the workshop?",
    answers: ["No more places are available.", "It will be held in Room A.", "It has moved to 3:00 P.M.", "It is open to everyone without registration."],
    correct_index: 0,
    justification: "\"The 1:30 P.M. workshop is now fully booked.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: RETAIL_CONFERENCE_UPDATE_MULTI,
    question: "What can participants who have not registered for the workshop do?",
    answers: ["Attend it at 3:00 P.M.", "Put their names on a waiting list", "Join it in Room A", "Register online"],
    correct_index: 1,
    justification: "\"Join the waiting list at the information desk.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: DRY_CLEANING_PICKUP_MULTI,
    question: "How much does it cost to clean a winter coat?",
    answers: ["$16", "$7", "$4", "$22"],
    correct_index: 3,
    justification: "Winter coat: $22.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: DRY_CLEANING_PICKUP_MULTI,
    question: "Why does Mr. Wierzbicki need one suit quickly?",
    answers: ["He is getting married.", "He is going on vacation.", "He has an important appointment.", "He is moving to a new apartment."],
    correct_index: 2,
    justification: "\"For a job interview on Thursday morning.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: DRY_CLEANING_PICKUP_MULTI,
    question: "How much will Mr. Wierzbicki pay for the cleaning?",
    answers: ["$36", "$44", "$52", "$60"],
    correct_index: 2,
    justification: "Express suit $24 ($16 + 50%) + standard suit $16 + 3 shirts $12 = $52.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: DRY_CLEANING_PICKUP_MULTI,
    question: "What is suggested about Mr. Wierzbicki's order?",
    answers: ["It qualifies for free pick-up.", "It includes a wedding dress.", "It will be ready on Monday.", "It must be dropped off at the store."],
    correct_index: 0,
    justification: "$52 is over $40 → free pick-up and delivery.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: DRY_CLEANING_PICKUP_MULTI,
    question: "Where does Mr. Wierzbicki want the clothes to be collected?",
    answers: ["From his office", "From his home", "From the store", "From a hotel"],
    correct_index: 1,
    justification: "\"A pick-up from my apartment.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: ART_MUSEUM_MEMBERSHIP_MULTI,
    question: "What do all memberships include?",
    answers: ["Private tours", "15% off in the shop", "Invitations to exhibition openings", "Free entry to the museum"],
    correct_index: 3,
    justification: "Every option includes free entry.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: ART_MUSEUM_MEMBERSHIP_MULTI,
    question: "Which membership will Ms. Ferreira-Grant most likely choose?",
    answers: ["Individual", "Patron", "Dual", "Family"],
    correct_index: 3,
    justification: "She needs a membership for two adults + a child, with family workshops.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: ART_MUSEUM_MEMBERSHIP_MULTI,
    question: "If an upgrade is possible, how much more will Ms. Ferreira-Grant most likely pay?",
    answers: ["$120", "$25", "$95", "$60"],
    correct_index: 1,
    justification: "Family $120 − Dual $95 = $25.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: ART_MUSEUM_MEMBERSHIP_MULTI,
    question: "What is indicated about Ms. Ferreira-Grant's daughter?",
    answers: ["She already has a membership.", "She works at the museum.", "She wants to attend workshops.", "She is an artist."],
    correct_index: 2,
    justification: "\"She is especially interested in the family workshops.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: ART_MUSEUM_MEMBERSHIP_MULTI,
    question: "In the e-mail, the word \"current\" in paragraph 2, line 1, is closest in meaning to",
    answers: ["present", "popular", "fast", "electric"],
    correct_index: 0,
    justification: "\"Our current membership\" = the one we have now.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: SEAFOOD_GRILL_REVIEW_MULTI,
    question: "Why did Gareth P. go to the restaurant?",
    answers: ["To meet a business client", "To review the restaurant for a newspaper", "To celebrate a family member's birthday", "To apply for a job"],
    correct_index: 2,
    justification: "\"To celebrate my mother's birthday.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: SEAFOOD_GRILL_REVIEW_MULTI,
    question: "What did Gareth P. like about the restaurant?",
    answers: ["The speed of the service", "The food and the view", "The low prices", "The birthday cake"],
    correct_index: 1,
    justification: "Excellent seafood and a beautiful view.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: SEAFOOD_GRILL_REVIEW_MULTI,
    question: "According to the owner, why was the service slow?",
    answers: ["Some employees were absent.", "The kitchen equipment was broken.", "A new chef had just started.", "The restaurant was fully booked."],
    correct_index: 0,
    justification: "\"Two of our kitchen staff were ill.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: SEAFOOD_GRILL_REVIEW_MULTI,
    question: "What is suggested about the birthday cake?",
    answers: ["It was made by Gareth P.'s mother.", "It cost extra.", "It was served late.", "Gareth P. asked about it when he made the reservation."],
    correct_index: 3,
    justification: "\"When I mentioned the birthday while booking...\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: SEAFOOD_GRILL_REVIEW_MULTI,
    question: "What does Ms. Holt offer Gareth P.?",
    answers: ["A tour of the kitchen", "A discount on his next booking", "A refund for the cake", "A free meal"],
    correct_index: 3,
    justification: "\"Back for dinner as our guests\" = they will not pay.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: FIRST_AID_COURSE_MULTI,
    question: "How long does the course last?",
    answers: ["Three years", "One day", "Three days", "Half a day"],
    correct_index: 1,
    justification: "\"One-day First Aid at Work course.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: FIRST_AID_COURSE_MULTI,
    question: "How much will Brightfold Packaging most likely pay in total?",
    answers: ["£600", "£720", "£120", "£500"],
    correct_index: 0,
    justification: "Six people from one company = group price: 6 × £100 = £600.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: FIRST_AID_COURSE_MULTI,
    question: "What is suggested about two of the employees?",
    answers: ["They work in the accounts department.", "They will teach the course.", "Their certificates are expiring.", "They cannot attend on 20 May."],
    correct_index: 2,
    justification: "They did the course three years ago, and certificates are valid for three years.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: FIRST_AID_COURSE_MULTI,
    question: "What is attached to Ms. Arslan's e-mail?",
    answers: ["A list of participants", "An invoice", "A course schedule", "A certificate"],
    correct_index: 0,
    justification: "\"Their names are listed in the attached file.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: FIRST_AID_COURSE_MULTI,
    question: "Where will the course take place?",
    answers: ["At Brightfold Packaging", "Online", "At a training center", "At a hospital"],
    correct_index: 2,
    justification: "\"Red Harbor Training Center, 15 Quay Street.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: RADIATOR_REPAIR_MULTI,
    question: "What problem does Mr. Demir report?",
    answers: ["There is a water leak.", "A heater is not working.", "A door does not lock.", "A window is broken."],
    correct_index: 1,
    justification: "\"The radiator stays cold.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: RADIATOR_REPAIR_MULTI,
    question: "What does the management offer Mr. Demir?",
    answers: ["A free parking space", "A new apartment", "A rent reduction", "A temporary heater"],
    correct_index: 3,
    justification: "\"We can lend you an electric heater.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: RADIATOR_REPAIR_MULTI,
    question: "What is suggested about the technician's visit?",
    answers: ["It will take place at a time Mr. Demir chose.", "It was canceled.", "It will be in the afternoon.", "It will happen on a Saturday."],
    correct_index: 0,
    justification: "Wednesday at about 9:30 A.M. = a weekday morning, which he ticked.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: RADIATOR_REPAIR_MULTI,
    question: "Why will Leon arrive later than planned?",
    answers: ["He went to the wrong building.", "He is finishing another task.", "His car broke down.", "He is waiting for a part."],
    correct_index: 1,
    justification: "\"Because of another job.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: RADIATOR_REPAIR_MULTI,
    question: "What might delay the repair further?",
    answers: ["The weather", "Mr. Demir's work schedule", "Waiting for a replacement part", "The management office's hours"],
    correct_index: 2,
    justification: "\"If the radiator needs a new part, it may take up to a week.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: COWORKING_PLANS_MULTI,
    question: "What do all membership plans include?",
    answers: ["A private office", "Lunch", "Unlimited meeting room use", "Internet access"],
    correct_index: 3,
    justification: "\"All plans include high-speed internet...\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: COWORKING_PLANS_MULTI,
    question: "Why does Mr. Visser want to change his plan?",
    answers: ["He wants to save money.", "He is moving to another city.", "He will need to come more often.", "He no longer needs a desk."],
    correct_index: 2,
    justification: "Every weekday instead of 10 days per month.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: COWORKING_PLANS_MULTI,
    question: "Which plan is most suitable for Mr. Visser?",
    answers: ["Dedicated", "His current plan", "Flex", "Resident"],
    correct_index: 0,
    justification: "Unlimited access + a safe place for documents = the lockable drawer of Dedicated.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: COWORKING_PLANS_MULTI,
    question: "How much would Mr. Visser most likely pay per month, including meeting rooms?",
    answers: ["€440", "€410", "€295", "€380"],
    correct_index: 1,
    justification: "€380 + 2 extra hours (6 − 4) × €15 = €410.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: COWORKING_PLANS_MULTI,
    question: "In the e-mail, the word \"means\" in paragraph 1, line 1, is closest in meaning to",
    answers: ["plans", "describes", "costs", "results in"],
    correct_index: 3,
    justification: "\"My new job means that I will need...\" = it has this result.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: DOCUMENTARY_FESTIVAL_MULTI,
    question: "Which film is the longest?",
    answers: ["Ice Roads", "Salt of the Desert", "Night Bakers", "Paper Cities"],
    correct_index: 1,
    justification: "110 minutes.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: DOCUMENTARY_FESTIVAL_MULTI,
    question: "Which films include a discussion with the director?",
    answers: ["Ice Roads and Night Bakers", "The Last Lighthouse Keepers and Paper Cities", "Salt of the Desert and Night Bakers", "Paper Cities and Ice Roads"],
    correct_index: 0,
    justification: "Both are \"followed by a Q&A with the director\".",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: DOCUMENTARY_FESTIVAL_MULTI,
    question: "How much would Ms. Strand pay for four single tickets?",
    answers: ["€27", "€45", "€36", "€30"],
    correct_index: 2,
    justification: "4 × €9 = €36.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: DOCUMENTARY_FESTIVAL_MULTI,
    question: "What is suggested about the day pass for Ms. Strand?",
    answers: ["It costs more than four single tickets.", "It is not available on Saturday.", "It does not include films in Cinema 2.", "It would cost less than four single tickets."],
    correct_index: 3,
    justification: "€30 < €36.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: DOCUMENTARY_FESTIVAL_MULTI,
    question: "What else does Ms. Strand want to know?",
    answers: ["How long the Q&A sessions last", "Whether food is sold", "Where the cinema is", "Whether she can exchange a ticket"],
    correct_index: 3,
    justification: "\"Is it possible to change a ticket to another film?\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: HOTEL_BREAKFAST_FEEDBACK_MULTI,
    question: "What did Mr. Oduya rate the lowest?",
    answers: ["Room cleanliness", "Breakfast", "Staff friendliness", "Check-in"],
    correct_index: 1,
    justification: "Breakfast: 2.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: HOTEL_BREAKFAST_FEEDBACK_MULTI,
    question: "What problem does Mr. Oduya mention?",
    answers: ["Some food was not available.", "The staff were unhelpful.", "His room was noisy.", "Check-in took a long time."],
    correct_index: 0,
    justification: "\"Many items had run out and were not replaced.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: HOTEL_BREAKFAST_FEEDBACK_MULTI,
    question: "What will the hotel do from 1 June?",
    answers: ["Offer breakfast in rooms", "Hire a new restaurant manager", "Add another buffet table", "Start breakfast earlier"],
    correct_index: 2,
    justification: "\"We will add a second buffet table.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: HOTEL_BREAKFAST_FEEDBACK_MULTI,
    question: "Why does Ms. Fenn mention the Larkspur Club?",
    answers: ["Mr. Oduya is a new guest.", "Mr. Oduya stays at the hotel often.", "Mr. Oduya asked for a late check-out.", "Mr. Oduya complained about the price."],
    correct_index: 1,
    justification: "He travels to the city every month: a regular guest.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: HOTEL_BREAKFAST_FEEDBACK_MULTI,
    question: "What is attached to the e-mail?",
    answers: ["A receipt", "A breakfast menu", "A registration form", "A survey"],
    correct_index: 2,
    justification: "\"I have attached a registration form.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: MUSEUM_TRANSLATORS_MULTI,
    question: "What is the purpose of the notice?",
    answers: ["To advertise a language course", "To hire tour guides", "To announce a new exhibition", "To find people to translate a document"],
    correct_index: 3,
    justification: "\"We are looking for volunteer translators.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: MUSEUM_TRANSLATORS_MULTI,
    question: "What will volunteers receive?",
    answers: ["Free entry to the museum for a year", "A trip to Japan", "A payment for each page", "A printed dictionary"],
    correct_index: 0,
    justification: "\"A one-year museum pass.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: MUSEUM_TRANSLATORS_MULTI,
    question: "What is suggested about Mr. Kimura?",
    answers: ["He works for the museum.", "He cannot finish before 31 January.", "He meets the language requirements.", "He has never translated before."],
    correct_index: 2,
    justification: "Native Japanese speaker + translator in Germany for years (he reads German well).",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: MUSEUM_TRANSLATORS_MULTI,
    question: "Where did Mr. Kimura learn about the opportunity?",
    answers: ["On a Web site", "At the museum", "In a newspaper", "From a colleague"],
    correct_index: 1,
    justification: "\"I saw your notice in the museum lobby.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: MUSEUM_TRANSLATORS_MULTI,
    question: "Why does Mr. Kimura mention his trip?",
    answers: ["To show that it will not stop him from working", "To ask for a later deadline", "To request a museum pass for Japan", "To explain why he cannot help"],
    correct_index: 0,
    justification: "\"I can work on the translation during my trip.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: BEDDING_RETURN_MULTI,
    question: "What is the purpose of Ms. Abara's e-mail?",
    answers: ["To complain about a late delivery", "To ask for a catalog", "To order new sheets", "To ask to send back an item"],
    correct_index: 3,
    justification: "\"I would like to return the linen sheets.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: BEDDING_RETURN_MULTI,
    question: "What problem does Ms. Abara mention?",
    answers: ["The sheets were damaged.", "The product looks different from the picture.", "She was charged twice.", "The package arrived late."],
    correct_index: 1,
    justification: "\"The color is very different from the photo.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: BEDDING_RETURN_MULTI,
    question: "Why would the return normally not be accepted?",
    answers: ["The item is bedding.", "The sheets were used.", "It is more than 30 days after delivery.", "The packaging is missing."],
    correct_index: 0,
    justification: "\"Candles and bedding cannot be returned unless they are damaged.\" (10 days only, unused, in the bag)",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: BEDDING_RETURN_MULTI,
    question: "What has Tallow & Pine done for Ms. Abara?",
    answers: ["Changed the photo on the Web site", "Sent her new sheets", "Refunded her immediately", "Sent her a new shipping label"],
    correct_index: 3,
    justification: "\"We have e-mailed you a new prepaid label.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: BEDDING_RETURN_MULTI,
    question: "How will Ms. Abara most likely receive her money back?",
    answers: ["By check", "As a gift card", "Through her original method of payment", "In cash at a store"],
    correct_index: 2,
    justification: "\"Refunds are made to the original payment method.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: MILAN_BUYER_TRIP_MULTI,
    question: "What is the main purpose of Ms. Khumalo's trip?",
    answers: ["To attend a wedding", "To do business with suppliers", "To open a new store", "To take a vacation"],
    correct_index: 1,
    justification: "Meetings with a fabric supplier, a textile fair, a factory visit.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: MILAN_BUYER_TRIP_MULTI,
    question: "Where will Ms. Khumalo be on Wednesday?",
    answers: ["At Filati Rossi's office", "In Como", "On a plane", "At a trade fair"],
    correct_index: 3,
    justification: "\"Wed 5 Nov: All day — Milan Textile Fair.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: MILAN_BUYER_TRIP_MULTI,
    question: "Why does Ms. Benedetti want to change the meeting?",
    answers: ["She will be at the textile fair.", "Ms. Khumalo's flight is late.", "Her office will be closed on Tuesday afternoon.", "Her driver is not available."],
    correct_index: 2,
    justification: "The day of arrival is Tuesday 4 November, a local holiday.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: MILAN_BUYER_TRIP_MULTI,
    question: "What does Ms. Benedetti offer?",
    answers: ["Transportation to her office", "A tour of Milan", "A meeting at the airport", "A hotel room in Como"],
    correct_index: 0,
    justification: "\"Our driver could bring you directly to us.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: MILAN_BUYER_TRIP_MULTI,
    question: "How many nights will Ms. Khumalo stay at the Albergo Centrale?",
    answers: ["Three", "Two", "Five", "Four"],
    correct_index: 0,
    justification: "\"Hotel: Albergo Centrale (3 nights).\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: BAKERY_WHOLESALE_MULTI,
    question: "What change does the letter announce?",
    answers: ["A new bakery location", "Higher prices", "A new sales manager", "An extra delivery day"],
    correct_index: 3,
    justification: "Six days a week instead of five.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: BAKERY_WHOLESALE_MULTI,
    question: "By when must orders for Saturday delivery be placed?",
    answers: ["Friday at noon", "Saturday morning", "Thursday at 3 P.M.", "Wednesday at 3 P.M."],
    correct_index: 2,
    justification: "\"Orders placed by Thursday at 3 P.M.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: BAKERY_WHOLESALE_MULTI,
    question: "What is suggested about Corner Plate Café's new weekly order?",
    answers: ["It will be smaller than before.", "It will qualify for a discount.", "It will be delivered on Thursdays.", "It includes rye bread."],
    correct_index: 1,
    justification: "150 + 40 + 20 = 210 items, more than 200 → 5 percent discount.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: BAKERY_WHOLESALE_MULTI,
    question: "Why is Ms. Popa happy about the change?",
    answers: ["She prefers olive focaccia.", "Her café is busiest on Saturdays.", "She wants free samples.", "She wants to close on weekdays."],
    correct_index: 1,
    justification: "\"Saturday is our busiest day.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: BAKERY_WHOLESALE_MULTI,
    question: "What does Ms. Popa ask about?",
    answers: ["The ingredients of a product", "The delivery time on Saturdays", "The size of the discount", "The price of croissants"],
    correct_index: 0,
    justification: "Whether the focaccia contains nuts.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: EVENT_PHOTOGRAPHY_MULTI,
    question: "What is included in all packages?",
    answers: ["An online gallery", "A printed book", "Travel costs", "Edited photos"],
    correct_index: 3,
    justification: "Each package gives a number of edited photos.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: EVENT_PHOTOGRAPHY_MULTI,
    question: "Which package best fits Ms. Ferri's needs?",
    answers: ["Basic", "Premium", "Standard", "None of them"],
    correct_index: 2,
    justification: "5 hours, at least 250 photos, an online gallery, no book.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: EVENT_PHOTOGRAPHY_MULTI,
    question: "How much would Ms. Ferri most likely pay in total?",
    answers: ["$740", "$700", "$450", "$1,140"],
    correct_index: 0,
    justification: "Standard $700 + 40 km × $1 = $740.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: EVENT_PHOTOGRAPHY_MULTI,
    question: "What is suggested about Ms. Ferri's deadline?",
    answers: ["It is before the event.", "The studio's usual delivery time would meet it.", "It requires an extra fee.", "It is too early for the studio."],
    correct_index: 1,
    justification: "17 May + two weeks = 31 May.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: EVENT_PHOTOGRAPHY_MULTI,
    question: "What event is Ms. Ferri organizing?",
    answers: ["A staff training", "A hotel opening", "A wedding", "A product launch"],
    correct_index: 3,
    justification: "\"A five-hour product launch.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: LIBRARY_EBOOK_APP_MULTI,
    question: "How long can members keep an e-book?",
    answers: ["One month", "5 days", "21 days", "12 days"],
    correct_index: 2,
    justification: "\"For 21 days.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: LIBRARY_EBOOK_APP_MULTI,
    question: "What is indicated about late fees for e-books?",
    answers: ["They are added to the PIN.", "They are charged daily.", "There are none.", "They depend on the title."],
    correct_index: 2,
    justification: "\"There are never any late fees.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: LIBRARY_EBOOK_APP_MULTI,
    question: "What is suggested about Mr. Sayed?",
    answers: ["He lost his library card.", "He became a member before 2019.", "He works at the Riverside branch.", "He has borrowed five e-books."],
    correct_index: 1,
    justification: "He has no PIN, and only members who joined before 2019 did not get one.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: LIBRARY_EBOOK_APP_MULTI,
    question: "What does the library suggest so that Mr. Sayed can read \"The Glass Harbor\" sooner?",
    answers: ["Buying the e-book", "Waiting for a notification", "Joining a book club", "Borrowing a paper copy"],
    correct_index: 3,
    justification: "\"We also have four printed copies. One of them is currently available.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: LIBRARY_EBOOK_APP_MULTI,
    question: "What must Mr. Sayed do to get a PIN?",
    answers: ["Visit a library branch", "Pay a small fee", "Download a new app", "Call the help desk"],
    correct_index: 0,
    justification: "\"You can create one at any of our branches.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: CAFETERIA_SURVEY_MULTI,
    question: "What was the survey about?",
    answers: ["Working hours", "A new office", "The company cafeteria", "Training courses"],
    correct_index: 2,
    justification: "\"Our survey about the company cafeteria.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: CAFETERIA_SURVEY_MULTI,
    question: "What did the largest number of employees ask for?",
    answers: ["More vegetarian food", "Lower prices", "Breakfast", "A new caterer"],
    correct_index: 0,
    justification: "68%: more vegetarian dishes.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: CAFETERIA_SURVEY_MULTI,
    question: "What will happen on 1 March?",
    answers: ["A new survey will be sent.", "New dishes will be offered.", "Prices will go down.", "The cafeteria will open earlier."],
    correct_index: 1,
    justification: "Two vegetarian dishes every day from 1 March.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: CAFETERIA_SURVEY_MULTI,
    question: "What is suggested about the coffee machine?",
    answers: ["It is on the first floor.", "Most employees are happy with it.", "It was replaced in February.", "It was not included in the main results."],
    correct_index: 3,
    justification: "\"The results don't mention coffee\", even though people complained.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: CAFETERIA_SURVEY_MULTI,
    question: "In the e-mail, the word \"sharing\" in paragraph 1, line 1, is closest in meaning to",
    answers: ["hiding", "selling", "communicating", "dividing"],
    correct_index: 2,
    justification: "\"Thank you for sharing the results\" = for telling us.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: PLACEMENT_TEST_MULTI,
    question: "In which skill did Ms. Tsai score highest?",
    answers: ["Listening", "Reading", "Speaking", "Writing"],
    correct_index: 1,
    justification: "Reading: 78/100.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: PLACEMENT_TEST_MULTI,
    question: "What is suggested about Ms. Tsai?",
    answers: ["She will study in the morning.", "She will pay extra for the Conversation Club.", "She has already paid her course fee.", "She is advised to join an extra activity."],
    correct_index: 3,
    justification: "Speaking 58 < 60 → the free Conversation Club is advised.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: PLACEMENT_TEST_MULTI,
    question: "How often does Ms. Tsai's course meet?",
    answers: ["Twice a week", "Three times a week", "Every weekday", "Once a week"],
    correct_index: 0,
    justification: "Mondays and Thursdays.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: PLACEMENT_TEST_MULTI,
    question: "By when must the course fee be paid?",
    answers: ["2 September", "15 September", "10 September", "4 September"],
    correct_index: 2,
    justification: "\"Must be paid by 10 September.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: PLACEMENT_TEST_MULTI,
    question: "Why does the institute not recommend the B2 class for Ms. Tsai?",
    answers: ["It is more expensive.", "It meets in the evening.", "It is already full.", "Its level is too high for her."],
    correct_index: 3,
    justification: "Her level is B1; B2 is higher.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: BUSINESS_AWARDS_NOMINATION_MULTI,
    question: "Who organizes the awards?",
    answers: ["A restaurant", "A business association", "A newspaper", "A hotel"],
    correct_index: 1,
    justification: "The Pinehurst Chamber of Commerce.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: BUSINESS_AWARDS_NOMINATION_MULTI,
    question: "When will the winners be announced?",
    answers: ["On 6 June", "In March", "On 12 April", "On 30 April"],
    correct_index: 0,
    justification: "\"At a dinner... on 6 June.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: BUSINESS_AWARDS_NOMINATION_MULTI,
    question: "Why was Fennel & Fig most likely NOT nominated for Best New Business?",
    answers: ["It was nominated too late.", "It is a restaurant.", "It already won that award.", "It has been open for more than two years."],
    correct_index: 3,
    justification: "It opened in March two years ago; the form is from April → more than two years.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: BUSINESS_AWARDS_NOMINATION_MULTI,
    question: "What is NOT mentioned as a reason for the nomination?",
    answers: ["Its use of solar panels", "Its deliveries by bicycle", "Its rooftop vegetables", "Its composting"],
    correct_index: 0,
    justification: "Solar panels are not mentioned.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: BUSINESS_AWARDS_NOMINATION_MULTI,
    question: "Who is Mr. Ibarra?",
    answers: ["The restaurant owner", "A customer of the restaurant", "A chamber of commerce employee", "A hotel manager"],
    correct_index: 1,
    justification: "\"Regular customer.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: COMMUTER_PASS_MULTI,
    question: "What is true about the Flex 10 pass?",
    answers: ["It allows unlimited travel.", "It is valid for one year.", "It is cheaper than ten single tickets.", "It includes weekend travel."],
    correct_index: 2,
    justification: "\"15% cheaper than buying 10 single tickets.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: COMMUTER_PASS_MULTI,
    question: "Why will Mr. Pryce travel less often from March?",
    answers: ["He will work from home part of the week.", "He is retiring.", "He will start driving to work.", "He is moving to Kendrick."],
    correct_index: 0,
    justification: "Two days in Kendrick, \"from home the other days\".",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: COMMUTER_PASS_MULTI,
    question: "Why can't Mr. Pryce add weekend travel to the pass he is advised to buy?",
    answers: ["The add-on costs more than £32.", "The add-on is not valid near Fellside Halt.", "The add-on is only sold in the app.", "The add-on is only for monthly pass holders."],
    correct_index: 3,
    justification: "He is advised to get the Flex 10, but the add-on needs a monthly pass.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: COMMUTER_PASS_MULTI,
    question: "What does Lakeland Rail suggest for Mr. Pryce's weekend trips?",
    answers: ["A monthly pass", "Driving to the hills", "A ticket for his whole family", "A smartcard"],
    correct_index: 2,
    justification: "The Family Day Ticket.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: COMMUTER_PASS_MULTI,
    question: "Where does Mr. Pryce live?",
    answers: ["In the city center", "In Ambleside Park", "In Kendrick", "Near Fellside Halt"],
    correct_index: 1,
    justification: "\"I live in Ambleside Park.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: CONCERT_HALL_RENOVATION_MULTI,
    question: "What is the article mainly about?",
    answers: ["The opening of a theatre", "A new orchestra director", "Planned work on a building", "A concert by a famous musician"],
    correct_index: 2,
    justification: "The concert hall will close for a renovation.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: CONCERT_HALL_RENOVATION_MULTI,
    question: "What is NOT mentioned as part of the renovation?",
    answers: ["A larger stage", "An elevator", "Better sound", "New seats"],
    correct_index: 0,
    justification: "Sound, elevator and seats are mentioned; not the stage.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: CONCERT_HALL_RENOVATION_MULTI,
    question: "What is suggested about the Grange Theatre?",
    answers: ["It is the home of another orchestra.", "It has fewer seats than the Hartwell Concert Hall.", "It opened eighteen months ago.", "It will also be renovated."],
    correct_index: 1,
    justification: "800 seats, compared with 1,200.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: CONCERT_HALL_RENOVATION_MULTI,
    question: "What is indicated about Ms. Lowell?",
    answers: ["She plays in the orchestra.", "She works at the concert hall.", "She has never attended a concert.", "She will be offered seats before other buyers."],
    correct_index: 3,
    justification: "She is a season ticket holder, and they are offered seats first.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: CONCERT_HALL_RENOVATION_MULTI,
    question: "What does Ms. Lowell want to know?",
    answers: ["How much tickets will cost", "When the renovation will end", "Whether a venue is accessible to wheelchair users", "Who the new director is"],
    correct_index: 2,
    justification: "\"Could you tell me whether the theatre is accessible?\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: IT_INVOICE_CORRECTION_MULTI,
    question: "What kind of company is Brightline?",
    answers: ["A laptop manufacturer", "A technology service provider", "A law office", "An accounting firm"],
    correct_index: 1,
    justification: "\"Brightline IT Services.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: IT_INVOICE_CORRECTION_MULTI,
    question: "Why does Mr. Ebbs think the invoice is wrong?",
    answers: ["A repair should have been covered by a plan.", "The laptops were never delivered.", "The invoice was sent late.", "The hourly rate was too high."],
    correct_index: 0,
    justification: "The plan includes up to two hours of repairs; the repair took 2 hours.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: IT_INVOICE_CORRECTION_MULTI,
    question: "What is the total amount on the corrected invoice?",
    answers: ["$890", "$642", "$730", "$682"],
    correct_index: 3,
    justification: "$890 − $160 (repair) = $730, then − $48 (10% of $480) = $682.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: IT_INVOICE_CORRECTION_MULTI,
    question: "What is the hourly rate for Brightline's work?",
    answers: ["$250", "$160", "$80", "$100"],
    correct_index: 2,
    justification: "$480 ÷ 6 hours = $80.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: IT_INVOICE_CORRECTION_MULTI,
    question: "What is attached to the e-mail of 5 November?",
    answers: ["A new invoice", "A receipt", "A support plan", "A laptop"],
    correct_index: 0,
    justification: "\"A corrected invoice is attached.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: OLD_TOWN_TOURS_MULTI,
    question: "Where do the tours begin?",
    answers: ["At the train station", "At a restaurant", "At the tourist office", "Outside the Cathedral"],
    correct_index: 3,
    justification: "\"Meeting point: in front of the Cathedral.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: OLD_TOWN_TOURS_MULTI,
    question: "Which tour is NOT given in English?",
    answers: ["The morning tour", "The afternoon tour", "The evening food tour", "The children's tour"],
    correct_index: 1,
    justification: "The afternoon tour is in Spanish.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: OLD_TOWN_TOURS_MULTI,
    question: "On which days could Mr. Lefort and his wife join the food tour?",
    answers: ["Friday or Saturday", "Only Sunday", "Any day of their stay", "Thursday or Sunday"],
    correct_index: 0,
    justification: "Food tours run on Fridays and Saturdays, which are during their stay.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: OLD_TOWN_TOURS_MULTI,
    question: "How much would the food tour cost for Mr. Lefort and his wife?",
    answers: ["€45", "€90", "€60", "€30"],
    correct_index: 1,
    justification: "2 × €45 = €90.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: OLD_TOWN_TOURS_MULTI,
    question: "What is Mr. Lefort concerned about?",
    answers: ["The meeting point", "The length of the tour", "His wife's food allergy", "The language of the tour"],
    correct_index: 2,
    justification: "\"My wife is allergic to shellfish.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: SCIENCE_CENTER_SCHOOL_VISIT_MULTI,
    question: "What does every school visit include?",
    answers: ["A free lunch", "A visit to a laboratory", "A film", "A guided tour and a workshop"],
    correct_index: 3,
    justification: "\"Each visit includes a guided tour... and one 45-minute workshop.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: SCIENCE_CENTER_SCHOOL_VISIT_MULTI,
    question: "Which workshop will Ms. Nowicka's group most likely attend?",
    answers: ["Electricity Explorers", "The Human Body", "Space Science", "Robots and Code"],
    correct_index: 0,
    justification: "Electricity, for ages 8–11 (her students are 9 and 10).",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: SCIENCE_CENTER_SCHOOL_VISIT_MULTI,
    question: "How much will Ms. Nowicka's school most likely pay?",
    answers: ["€204", "€186", "€168", "€150"],
    correct_index: 2,
    justification: "28 students × €6 = €168; the three teachers are free.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: SCIENCE_CENTER_SCHOOL_VISIT_MULTI,
    question: "Why was a different date suggested?",
    answers: ["The center is closed in March.", "The center does not receive school groups on Mondays.", "The workshop is full.", "The picnic room is closed."],
    correct_index: 1,
    justification: "Groups are welcome from Tuesday to Friday; she asked for a Monday.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: SCIENCE_CENTER_SCHOOL_VISIT_MULTI,
    question: "What has the center done for Ms. Nowicka?",
    answers: ["Sent an invoice", "Changed the workshop", "Added a fourth teacher", "Reserved a room for lunch"],
    correct_index: 3,
    justification: "\"I have also reserved the picnic room for you.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: FLOWER_SUBSCRIPTION_MULTI,
    question: "What is the FAQ about?",
    answers: ["A travel agency", "A garden center", "A flower delivery service", "A gift shop"],
    correct_index: 2,
    justification: "\"Petalbox Flower Subscription.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: FLOWER_SUBSCRIPTION_MULTI,
    question: "Why does Ms. Berg want to cancel?",
    answers: ["She wants monthly deliveries.", "She is going to live in another country.", "She is unhappy with the flowers.", "The price has increased."],
    correct_index: 1,
    justification: "\"I am moving abroad for work.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: FLOWER_SUBSCRIPTION_MULTI,
    question: "What will most likely happen on 5 June?",
    answers: ["Ms. Berg will receive a delivery.", "The subscription will be paused.", "Ms. Berg's sister will receive flowers.", "Ms. Berg will receive a refund."],
    correct_index: 0,
    justification: "She cancels only three days before; cancellations under five days take effect after the next delivery.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: FLOWER_SUBSCRIPTION_MULTI,
    question: "Why does Ms. Berg most likely not pause her subscription instead?",
    answers: ["Her delivery is on Thursday.", "Pausing costs extra.", "She wants a gift subscription.", "She will be away for longer than eight weeks."],
    correct_index: 3,
    justification: "A pause lasts up to eight weeks; she will be away at least a year.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: FLOWER_SUBSCRIPTION_MULTI,
    question: "What does Ms. Berg want to buy?",
    answers: ["A twelve-month subscription for herself", "A gift for a family member", "A vase", "A larger bouquet"],
    correct_index: 1,
    justification: "A six-month gift subscription for her sister.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: PARCEL_PICKUP_MULTI,
    question: "What does the e-mail say about the delivery?",
    answers: ["It will arrive in the morning.", "It has been delayed.", "It contains a book about trains.", "Someone must sign for the package."],
    correct_index: 3,
    justification: "\"A signature will be required on delivery.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: PARCEL_PICKUP_MULTI,
    question: "Why does Mr. Brenner contact Maja?",
    answers: ["To ask her to order a book", "To remind her about the dentist", "To find out if someone can receive the package", "To ask her to pick him up"],
    correct_index: 2,
    justification: "\"Are you home this afternoon? I have a package arriving.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: PARCEL_PICKUP_MULTI,
    question: "At 12:15 P.M., why does Mr. Brenner write, \"Hmm, that's risky\"?",
    answers: ["The package might arrive before Maja is home.", "The dentist appointment might be canceled.", "The train station might be closed.", "The package might be damaged."],
    correct_index: 0,
    justification: "Delivery from 1 P.M., but Maja is back only at 3.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: PARCEL_PICKUP_MULTI,
    question: "What does Mr. Brenner decide to do?",
    answers: ["Change where the package will be delivered", "Change the delivery day", "Cancel the order", "Leave work early"],
    correct_index: 0,
    justification: "He sends it to a pick-up point.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: PARCEL_PICKUP_MULTI,
    question: "Where is the pick-up point Mr. Brenner chooses?",
    answers: ["At Harbourline Books", "At his office", "Near the train station", "At the dentist"],
    correct_index: 2,
    justification: "\"The pick-up point next to the train station.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: HOTEL_MEETING_ROOMS_MULTI,
    question: "What is included in all room rates?",
    answers: ["A video camera", "A projector", "Lunch", "Coffee breaks"],
    correct_index: 1,
    justification: "\"All rates include a projector, flip charts, and water.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: HOTEL_MEETING_ROOMS_MULTI,
    question: "Which room will Ms. Qureshi most likely book?",
    answers: ["Admiral", "Harbor", "A room at another hotel", "Lighthouse"],
    correct_index: 3,
    justification: "42 people: Lighthouse holds 45 (Harbor only 20).",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: HOTEL_MEETING_ROOMS_MULTI,
    question: "How much will Norbridge Finance most likely pay for coffee breaks?",
    answers: ["€504", "€126", "€0", "€252"],
    correct_index: 3,
    justification: "Morning: 42 × €6 = €252; the afternoon break is free (full day, more than 40 people).",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: HOTEL_MEETING_ROOMS_MULTI,
    question: "What is the total cost of lunch for Ms. Qureshi's group?",
    answers: ["€1,100", "€924", "€22", "€880"],
    correct_index: 1,
    justification: "42 × €22 = €924.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: HOTEL_MEETING_ROOMS_MULTI,
    question: "What does Ms. Qureshi ask the hotel to send?",
    answers: ["A list of employees", "A training program", "A price estimate", "A lunch menu"],
    correct_index: 2,
    justification: "\"Could you send me a quote?\" (a quote = a price estimate)",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: CAREER_FAIR_MULTI,
    question: "What is the announcement about?",
    answers: ["An event for job seekers", "A construction project", "The opening of a hospital", "A technology conference"],
    correct_index: 0,
    justification: "Employers \"will be looking for staff\".",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: CAREER_FAIR_MULTI,
    question: "What should visitors do to get their CV checked?",
    answers: ["Book online in advance", "Pay a small fee", "Sign up when they arrive", "Send their CV by e-mail"],
    correct_index: 2,
    justification: "\"Sign up at the information desk when you arrive.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: CAREER_FAIR_MULTI,
    question: "Which employers is Mr. Navabi most interested in?",
    answers: ["Hotels", "Construction firms", "Technology companies", "Healthcare employers"],
    correct_index: 3,
    justification: "He is a nurse and asks about the hospital groups.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: CAREER_FAIR_MULTI,
    question: "What problem does Mr. Navabi mention?",
    answers: ["He cannot attend on Saturday.", "He did not get a confirmation message.", "He lost his CV.", "The fair is too far away."],
    correct_index: 1,
    justification: "\"I... never received a confirmation e-mail.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: CAREER_FAIR_MULTI,
    question: "What is indicated about entry to the fair?",
    answers: ["It is free.", "It requires an invitation.", "It is only for nurses.", "It costs €5."],
    correct_index: 0,
    justification: "\"Entry is free.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: TENNIS_COURT_BOOKING_MULTI,
    question: "What change is announced in the notice?",
    answers: ["Courts will close at 8 P.M.", "The club will open new courts.", "Members can book courts further in advance.", "Lessons will be canceled."],
    correct_index: 2,
    justification: "Seven days in advance instead of three.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: TENNIS_COURT_BOOKING_MULTI,
    question: "For how long can a member book courts in one day?",
    answers: ["Up to three hours", "Up to two hours", "Up to seven hours", "All evening"],
    correct_index: 1,
    justification: "\"A maximum of two hours per day.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: TENNIS_COURT_BOOKING_MULTI,
    question: "Which courts can Mr. Ortiz and his friends use for their usual games?",
    answers: ["Courts 1 and 2", "Courts 3 to 5", "Only Court 5", "Any court"],
    correct_index: 0,
    justification: "They play from 8 to 10 P.M.: only the courts with lights.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: TENNIS_COURT_BOOKING_MULTI,
    question: "What does Mr. Ortiz want to do?",
    answers: ["Become a member", "Play on weekends", "Take lessons with a coach", "Book a court on a regular basis"],
    correct_index: 3,
    justification: "\"Reserve the same court every week.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: TENNIS_COURT_BOOKING_MULTI,
    question: "Why was Mr. Ortiz most likely unable to book a court last week?",
    answers: ["He was not a member.", "The app was not working.", "The courts were closed for repairs.", "Other members had already reserved the courts."],
    correct_index: 3,
    justification: "\"All the courts we could use were already taken.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: DAIRY_PRICE_AGREEMENT_MULTI,
    question: "Why are prices increasing?",
    answers: ["Demand for cheese has increased.", "Feeding animals has become more expensive.", "Delivery costs have risen.", "The company is moving."],
    correct_index: 1,
    justification: "\"Because of the rising cost of animal feed.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: DAIRY_PRICE_AGREEMENT_MULTI,
    question: "Which products will NOT become more expensive?",
    answers: ["Milk and cream", "Milk only", "Cheese and butter", "All products"],
    correct_index: 2,
    justification: "\"The price of our cheese and butter will not change.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: DAIRY_PRICE_AGREEMENT_MULTI,
    question: "What is suggested about Casa Ruben?",
    answers: ["It can keep its current milk price if it signs in time.", "It will pay 8 percent more from 1 September.", "It buys cheese from Greenmeadow Dairy.", "It is closed on weekends."],
    correct_index: 0,
    justification: "Signing the agreement before 31 August keeps the current prices.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: DAIRY_PRICE_AGREEMENT_MULTI,
    question: "What does Ms. Thorvald suggest instead of a Saturday delivery?",
    answers: ["A different supplier", "Picking up products at the dairy", "Deliveries on Sundays", "Bigger deliveries on Fridays"],
    correct_index: 3,
    justification: "\"We can deliver larger quantities on Fridays.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: DAIRY_PRICE_AGREEMENT_MULTI,
    question: "What is attached to the third document?",
    answers: ["An invoice", "A contract", "A delivery schedule", "A price list"],
    correct_index: 1,
    justification: "\"I have attached the agreement.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: DELAYED_SUITCASE_MULTI,
    question: "What is the purpose of the first document?",
    answers: ["To report a missing bag", "To book a hotel", "To change a flight", "To buy a suitcase"],
    correct_index: 0,
    justification: "A \"delayed baggage report\".",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: DELAYED_SUITCASE_MULTI,
    question: "How can Ms. Conti's suitcase be recognized?",
    answers: ["It is very small.", "It has her name on it.", "It has a ribbon on the handle.", "It is red."],
    correct_index: 2,
    justification: "\"Large blue suitcase with a red ribbon on the handle.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: DELAYED_SUITCASE_MULTI,
    question: "Where was the suitcase sent by mistake?",
    answers: ["To Oslo", "To Rome", "To Copenhagen", "To a hotel"],
    correct_index: 0,
    justification: "\"It was sent to Oslo by mistake.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: DELAYED_SUITCASE_MULTI,
    question: "What is the most Ms. Conti can most likely claim for necessary items?",
    answers: ["€100", "€50", "€200", "€150"],
    correct_index: 3,
    justification: "Delayed 12, 13 and 14 July (it arrives on the 15th): 3 days × €50.",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: DELAYED_SUITCASE_MULTI,
    question: "Where will the suitcase be delivered?",
    answers: ["To her home in Rome", "To Ms. Conti's hotel", "To Oslo", "To the airport"],
    correct_index: 1,
    justification: "\"A courier will deliver it to your hotel.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'normal',
    category: 'vocabulary',
    text: SPRING_GALA_MULTI,
    question: "What will the money raised at the gala be used for?",
    answers: ["A new hospital", "Music lessons", "Programs that help children read", "Repairs to the Atrium"],
    correct_index: 2,
    justification: "\"Reading programs in local schools.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: SPRING_GALA_MULTI,
    question: "How much will Dr. Achebe's group most likely pay for tickets?",
    answers: ["$1,200", "$450", "$600", "$150"],
    correct_index: 2,
    justification: "4 × $150 = $600 (a table of ten is $1,200).",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'extreme',
    category: 'vocabulary',
    text: SPRING_GALA_MULTI,
    question: "What is indicated about Dr. Achebe's reply card?",
    answers: ["It was lost.", "It requested a table of ten.", "It included a donation.", "It arrived late."],
    correct_index: 3,
    justification: "\"Received after the deadline.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: SPRING_GALA_MULTI,
    question: "What problem does the e-mail mention?",
    answers: ["The gala has been moved.", "A meal option is no longer available.", "The Atrium is closed.", "The tickets are sold out."],
    correct_index: 1,
    justification: "\"The vegetarian menu is now full.\"",
  }),
  createQuestion({
    section: 'text',
    difficulty: 'hard',
    category: 'vocabulary',
    text: SPRING_GALA_MULTI,
    question: "What is NOT mentioned as part of the gala?",
    answers: ["A dance competition", "Dinner", "An auction", "Live music"],
    correct_index: 0,
    justification: "Dinner, live music and a silent auction are mentioned.",
  }),
];

// ---------- The added questions (src/data/moreQuestions/) ----------
// A passage is written once, with its questions: each question gets the passage as its "text".
// A long-text question is 'vocabulary' unless it says otherwise.
const MORE = [
  ...MORE_RC10.map((item) => createQuestion({ ...item, section: 'rc10' })),
  ...MORE_RC8.flatMap((passage) =>
    passage.questions.map((item) => createQuestion({ ...item, section: 'rc8', text: passage.text })),
  ),
  ...MORE_TEXT.flatMap((passage) =>
    passage.questions.map((item) =>
      createQuestion({ category: 'vocabulary', ...item, section: 'text', text: passage.text }),
    ),
  ),
];

export const QUESTIONS = [...RC10, ...RC8, ...TEXT, ...MORE];
