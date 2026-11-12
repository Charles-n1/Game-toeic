import {
  validTrainingConfig,
  validGoal,
  validLook,
  validProgress,
  validTrainingSession,
  validTestSession,
} from './validate';

// Saved in the browser (localStorage): still there after closing the app.
// localStorage only stores text, so we convert with JSON.
// On the web, reading is instant (no "await"): the app reads everything when it opens.
const CONFIG_KEY = 'trainingConfig';
const PROGRESS_KEY = 'progress';
const LOOK_KEY = 'look';
const GOAL_KEY = 'goal';
const TRAINING_SESSION_KEY = 'trainingSession';
const TEST_SESSION_KEY = 'testSession';
const SYNC_KEY = 'sync';
// What goes in the account (the cloud). Not the sessions in progress, nor the wallpaper: they stay on the phone.
const SYNCED_KEYS = [PROGRESS_KEY, GOAL_KEY, CONFIG_KEY, LOOK_KEY];

// 🔒 All the sites on charles-n1.github.io share ONE localStorage (same "origin").
// So our keys start with the app name: another site can't erase our "progress" by using the same name.
const PREFIX = 'prep-my-toeic:';

// An old save (from before the prefix) is moved ONCE to its new name: nobody loses their progress.
function moveOldSave(key) {
  const old = localStorage.getItem(key);
  if (old !== null && localStorage.getItem(PREFIX + key) === null) {
    localStorage.setItem(PREFIX + key, old);
    localStorage.removeItem(key);
  }
}

// 🔒 Broken text (corrupted, modified...) -> null ("no save") instead of crashing the app.
function readJson(key) {
  try {
    moveOldSave(key);
    const text = localStorage.getItem(PREFIX + key);
    return text ? JSON.parse(text) : null;
  } catch (error) {
    return null;
  }
}

// changed: false = the cloud doesn't need to know (when the save comes FROM the cloud).
function writeJson(key, value, changed = true) {
  try {
    const text = JSON.stringify(value);
    if (localStorage.getItem(PREFIX + key) === text) return; // the same: nothing changed
    localStorage.setItem(PREFIX + key, text);
    if (changed && SYNCED_KEYS.includes(key)) markChanged();
  } catch (error) {
    // Storage full, or blocked (private browsing): the app keeps working, without saving.
  }
}

function removeJson(key, changed = true) {
  try {
    if (localStorage.getItem(PREFIX + key) === null) return;
    localStorage.removeItem(PREFIX + key);
    if (changed && SYNCED_KEYS.includes(key)) markChanged();
  } catch (error) {
    // nothing to do
  }
}

// ---------- Goal ----------

// goal: { total: 750, oral: 350 }
export function saveGoal(goal) {
  writeJson(GOAL_KEY, goal);
}

// null = the player never chose a goal (first launch), or the save was not valid.
export function loadGoal() {
  return validGoal(readJson(GOAL_KEY));
}

// ---------- Look: theme + wallpaper ----------

// The theme is saved by its name ("Sky"): its colors are already in themes.js.
export function saveLook(settings) {
  writeJson(LOOK_KEY, {
    themeName: settings.theme.name,
    wallpaper: settings.wallpaper, // a small JPEG as text, or null
    wallpaperOpacity: settings.wallpaperOpacity,
    frendComes: settings.frendComes, // false = Frend comes 90% less
    noWhy: settings.noWhy, // true = no "Why ?" to write
  });
}

// Returns { themeName, wallpaper, wallpaperOpacity, frendComes, noWhy }, or null (first time, or not valid).
export function loadLook() {
  return validLook(readJson(LOOK_KEY));
}

// ---------- Training config ----------

export function loadTrainingConfig() {
  return validTrainingConfig(readJson(CONFIG_KEY));
}

export function saveTrainingConfig(config) {
  writeJson(CONFIG_KEY, config);
}

export function forgetTrainingConfig() {
  removeJson(CONFIG_KEY);
}

// ---------- Retrieve progress ----------

// A name that finds the same question again, even if we add new questions before it.
function keyOf(question) {
  return question.section + '|' + question.question + '|' + (question.text || '');
}

// Only the questions to retrieve are saved, + the green bars, + the category stats, + the chart history.
// A Date can't go in JSON, so we save it as a number (getTime).
export function saveProgress(questions, reviewLog, stats, history) {
  const progress = {};
  for (const question of questions) {
    if (question.retrieve) {
      progress[keyOf(question)] = {
        retrieve_time: question.retrieve_time,
        retrieve_date: question.retrieve_date.getTime(),
      };
    }
  }
  writeJson(PROGRESS_KEY, { progress, reviewLog, stats, history });
}

// Returns { progress, reviewLog, stats, history }, or null the very first time.
export function loadProgress() {
  return validProgress(readJson(PROGRESS_KEY));
}

// Puts the saved progress back into the questions.
export function applyProgress(questions, progress) {
  return questions.map((question) => {
    const saved = progress[keyOf(question)];
    if (!saved) return question;
    return {
      ...question,
      retrieve: true,
      retrieve_time: saved.retrieve_time,
      retrieve_date: new Date(saved.retrieve_date), // number -> Date again
    };
  });
}

// ---------- Session in progress (training / test) ----------
// Saved at each change: changing page, or closing the app, doesn't lose the questions on screen and the score.
// The questions are saved by their key (see keyOf), and found again in the questions when loading.

// { questionId: value } -> [value of the 1st question of the group, of the 2nd...] (null = nothing yet)
function inGroupOrder(group, byId) {
  return group.map((question) => (byId[question.id] === undefined ? null : byId[question.id]));
}

// The opposite: [value, ...] -> { questionId: value } (the nulls are left out).
function byQuestionId(group, list) {
  const byId = {};
  group.forEach((question, index) => {
    if (list[index] !== null) byId[question.id] = list[index];
  });
  return byId;
}

// [key, ...] -> [question, ...]. null if one of them doesn't exist anymore (the app changed since).
function findQuestions(questions, keys) {
  const byKey = new Map(questions.map((question) => [keyOf(question), question]));
  const found = keys.map((key) => byKey.get(key));
  return found.includes(undefined) ? null : found;
}

// session: see newTrainingSession (sessions.js). null = the session is over: forget it.
export function saveTrainingSession(session) {
  if (session === null) {
    removeJson(TRAINING_SESSION_KEY);
    return;
  }
  const { group, card } = session;
  writeJson(TRAINING_SESSION_KEY, {
    ...session,
    group: group.map(keyOf),
    card: { choices: inGroupOrder(group, card.choices), whys: inGroupOrder(group, card.whys), submitted: card.submitted },
  });
}

// The training left in progress, or null (none, or not valid anymore).
export function loadTrainingSession(questions) {
  const saved = validTrainingSession(readJson(TRAINING_SESSION_KEY));
  if (!saved) return null;
  const group = findQuestions(questions, saved.group);
  if (!group) return null;
  const card = saved.card;
  return {
    ...saved,
    group: group,
    card: {
      choices: byQuestionId(group, card.choices),
      whys: byQuestionId(group, card.whys),
      submitted: card.submitted,
    },
  };
}

// session: see newTestSession (sessions.js). null = the test is over: forget it.
export function saveTestSession(session) {
  if (session === null) {
    removeJson(TEST_SESSION_KEY);
    return;
  }
  const { exam, group, choices } = session;
  writeJson(TEST_SESSION_KEY, {
    ...session,
    exam: exam.kind === 'level' ? { ...exam, list: exam.list.map(keyOf) } : exam,
    group: group.map(keyOf),
    choices: inGroupOrder(group, choices),
  });
}

// The test left in progress, or null (none, or not valid anymore).
export function loadTestSession(questions) {
  const saved = validTestSession(readJson(TEST_SESSION_KEY));
  if (!saved) return null;
  const group = findQuestions(questions, saved.group);
  let exam = saved.exam;
  if (exam.kind === 'level') {
    const list = findQuestions(questions, exam.list);
    exam = list ? { ...exam, list: list } : null;
  }
  if (!group || !exam) return null;
  return { ...saved, exam: exam, group: group, choices: byQuestionId(group, saved.choices) };
}

// ---------- Account (cloud save) ----------
// sync: { syncedAt, dirty }. syncedAt = the version of the cloud save this phone has (null = none).
// dirty = something changed here since, the cloud doesn't have it yet.

let changeListener = null; // who wants to know about the changes (the cloud, see cloud.js)

function markChanged() {
  writeJson(SYNC_KEY, { ...loadSync(), dirty: true });
  if (changeListener) changeListener();
}

// callback(): called each time something that goes in the account changes.
export function onSaveChanged(callback) {
  changeListener = callback;
}

export function loadSync() {
  const sync = readJson(SYNC_KEY);
  const ok = sync !== null && typeof sync === 'object' && typeof sync.dirty === 'boolean';
  return ok && (sync.syncedAt === null || Number.isFinite(sync.syncedAt)) ? sync : { syncedAt: null, dirty: false };
}

export function saveSync(sync) {
  writeJson(SYNC_KEY, sync);
}

// Everything that goes in the account: { progress, goal, trainingConfig, look } (as saved, null = nothing).
export function exportSave() {
  const save = {};
  for (const key of SYNCED_KEYS) {
    save[key] = readJson(key);
  }
  if (save[LOOK_KEY]) save[LOOK_KEY] = { ...save[LOOK_KEY], wallpaper: null }; // the photo stays on the phone
  return save;
}

// The save of the account replaces the one of the phone (the app must then reload: it reads the saves at start).
// 🔒 Nothing is trusted here: the app checks everything when it reads it (validate.js).
export function importSave(save) {
  const wallpaper = (readJson(LOOK_KEY) || {}).wallpaper || null; // keep this phone's photo
  for (const key of SYNCED_KEYS) {
    let value = save !== null && typeof save === 'object' ? save[key] : null;
    if (key === LOOK_KEY && value !== null && typeof value === 'object') value = { ...value, wallpaper: wallpaper };
    if (value === null || value === undefined) removeJson(key, false);
    else writeJson(key, value, false);
  }
}
