// The words shared by the sentence models: people, companies, actions with all their verb forms, times.

// One person. he: 'she' or 'he' (for the pronouns).
export const WOMEN = ['Ms. Tanaka', 'Ms. Nguyen', 'Ms. Laurent', 'Ms. Kowalski', 'Ms. Okafor', 'Ms. Patel', 'Ms. Rossi', 'Ms. Haddad', 'Ms. Jensen', 'Ms. Moreno', 'Dr. Alvarez', 'Ms. Chen'];
export const MEN = ['Mr. Becker', 'Mr. Sato', 'Mr. Kim', 'Mr. Dubois', 'Mr. Mensah', 'Mr. Silva', 'Mr. Novak', 'Mr. Park', 'Mr. Fischer', 'Mr. Ortiz', 'Dr. Wright', 'Mr. Ahmed'];

// A person told by their job (singular).
export const ROLES = ['the project manager', 'the new intern', 'the head chef', 'our sales director', 'the receptionist', 'the store manager', 'the chief engineer', 'the accountant', 'the HR coordinator', 'our team leader', 'the marketing consultant', 'the branch manager', 'the office administrator', 'the lead designer', 'the event planner'];

// Several people (plural).
export const GROUPS = ['the interns', 'our engineers', 'the board members', 'the new employees', 'the sales representatives', 'the volunteers', 'the technicians', 'the managers', 'the designers', 'the accountants', 'the store clerks', 'the trainees', 'the consultants', 'the nurses', 'the researchers'];

// A company or a place (singular, "its").
export const ORGS = ['the company', 'our firm', 'the hotel', 'the city council', 'the bakery', 'the museum', 'the airline', 'the factory', 'the library', 'the clinic', 'the bank', 'the publisher', 'the software company', 'the supermarket chain', 'the travel agency', 'the shipping company', 'Brightline Motors', 'Norvale Foods', 'Kestrel Media', 'Harbor Logistics'];

// Anyone singular (a name or a job).
export const PEOPLE = [...WOMEN, ...MEN, ...ROLES];

// The actions: a verb with all its forms and its object. They make sense for anyone at work.
// base / third (he ...s) / past / pp (past participle) / ing.
function act(base, third, past, pp, ing, object) {
  return { base, third, past, pp, ing, object };
}

export const ACTIONS = [
  act('submit', 'submits', 'submitted', 'submitted', 'submitting', 'the report'),
  act('review', 'reviews', 'reviewed', 'reviewed', 'reviewing', 'the contract'),
  act('update', 'updates', 'updated', 'updated', 'updating', 'the website'),
  act('contact', 'contacts', 'contacted', 'contacted', 'contacting', 'the supplier'),
  act('organize', 'organizes', 'organized', 'organized', 'organizing', 'the conference'),
  act('prepare', 'prepares', 'prepared', 'prepared', 'preparing', 'the budget'),
  act('repair', 'repairs', 'repaired', 'repaired', 'repairing', 'the printer'),
  act('sign', 'signs', 'signed', 'signed', 'signing', 'the agreement'),
  act('train', 'trains', 'trained', 'trained', 'training', 'the new staff'),
  act('reschedule', 'reschedules', 'rescheduled', 'rescheduled', 'rescheduling', 'the meeting'),
  act('check', 'checks', 'checked', 'checked', 'checking', 'the invoices'),
  act('renew', 'renews', 'renewed', 'renewed', 'renewing', 'the lease'),
  act('book', 'books', 'booked', 'booked', 'booking', 'the venue'),
  act('translate', 'translates', 'translated', 'translated', 'translating', 'the brochure'),
  act('install', 'installs', 'installed', 'installed', 'installing', 'the software'),
  act('cancel', 'cancels', 'canceled', 'canceled', 'canceling', 'the order'),
  act('confirm', 'confirms', 'confirmed', 'confirmed', 'confirming', 'the reservation'),
  act('inspect', 'inspects', 'inspected', 'inspected', 'inspecting', 'the equipment'),
  act('replace', 'replaces', 'replaced', 'replaced', 'replacing', 'the old computers'),
  act('revise', 'revises', 'revised', 'revised', 'revising', 'the proposal'),
  act('deliver', 'delivers', 'delivered', 'delivered', 'delivering', 'the samples'),
  act('announce', 'announces', 'announced', 'announced', 'announcing', 'the results'),
  act('test', 'tests', 'tested', 'tested', 'testing', 'the new system'),
  act('negotiate', 'negotiates', 'negotiated', 'negotiated', 'negotiating', 'the price'),
  act('write', 'writes', 'wrote', 'written', 'writing', 'the summary'),
  act('send', 'sends', 'sent', 'sent', 'sending', 'the invitations'),
  act('choose', 'chooses', 'chose', 'chosen', 'choosing', 'the caterer'),
  act('approve', 'approves', 'approved', 'approved', 'approving', 'the design'),
  act('print', 'prints', 'printed', 'printed', 'printing', 'the schedules'),
  act('order', 'orders', 'ordered', 'ordered', 'ordering', 'new supplies'),
];

// Things that can receive an action (for the passive): the object, if it is plural, and the actions that fit it.
export const THINGS = [
  { noun: 'report', plural: false, verbs: ['submit', 'review', 'revise', 'write', 'print', 'approve'] },
  { noun: 'contract', plural: false, verbs: ['sign', 'review', 'renew', 'revise', 'approve'] },
  { noun: 'invoices', plural: true, verbs: ['check', 'send', 'print', 'approve'] },
  { noun: 'website', plural: false, verbs: ['update', 'test', 'translate'] },
  { noun: 'printer', plural: false, verbs: ['repair', 'install', 'replace', 'inspect'] },
  { noun: 'conference', plural: false, verbs: ['organize', 'reschedule', 'cancel', 'announce'] },
  { noun: 'samples', plural: true, verbs: ['deliver', 'send', 'test', 'inspect'] },
  { noun: 'new employees', plural: true, verbs: ['train', 'contact', 'choose'] },
  { noun: 'brochures', plural: true, verbs: ['translate', 'print', 'deliver', 'revise'] },
  { noun: 'budget', plural: false, verbs: ['prepare', 'review', 'approve', 'revise'] },
  { noun: 'reservation', plural: false, verbs: ['confirm', 'cancel', 'book'] },
  { noun: 'machines', plural: true, verbs: ['inspect', 'repair', 'replace', 'test', 'install'] },
  { noun: 'meeting', plural: false, verbs: ['reschedule', 'cancel', 'organize', 'announce'] },
  { noun: 'results', plural: true, verbs: ['announce', 'review', 'check', 'send'] },
  { noun: 'proposal', plural: false, verbs: ['revise', 'review', 'submit', 'approve', 'write'] },
  { noun: 'orders', plural: true, verbs: ['deliver', 'cancel', 'check', 'confirm'] },
  { noun: 'software', plural: false, verbs: ['install', 'update', 'test'] },
  { noun: 'menus', plural: true, verbs: ['print', 'translate', 'update', 'revise'] },
];

export function actionOf(base) {
  return ACTIONS.find((action) => action.base === base);
}

export const PAST_TIMES = ['yesterday', 'last week', 'last Monday', 'two days ago', 'last month', 'earlier this morning', 'in 2023', 'last Friday', 'three weeks ago'];
export const FUTURE_TIMES = ['tomorrow', 'next week', 'next Monday', 'later this afternoon', 'next month', 'in two days', 'next Friday', 'early next year'];
export const HABIT_TIMES = ['every Friday', 'every month', 'once a week', 'every morning', 'twice a year', 'every quarter', 'on Mondays'];
export const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const YEARS = ['2015', '2017', '2018', '2019', '2020', '2021'];
export const DURATIONS = ['six years', 'three months', 'two weeks', 'a decade', 'nearly five years', 'several months', 'almost a year'];
