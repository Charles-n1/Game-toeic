import { useState, useEffect } from 'react';

import Footer, { FOOTER_PAGES } from './components/Footer';
import HomePage from './pages/HomePage';
import TrainingPage from './pages/TrainingPage';
import TestPage from './pages/TestPage';
import RecoveryPage from './pages/RecoveryPage';
import StatsPage from './pages/StatsPage';
import SettingsPage from './pages/SettingsPage';
import GoalPage from './pages/GoalPage';
import TutorialPage, { NOTHING_BEHIND } from './pages/TutorialPage';
import FrendCompanion from './components/FrendCompanion';
import { tellFrend } from './logic/frendRadio';
import HistoryPage from './pages/HistoryPage';
import LessonPage from './pages/LessonPage';
import AccountPage from './pages/AccountPage';
import GamePage from './game/GamePage';
import { QUESTIONS } from './data/questions';
import { addAnswer } from './data/categories';
import { today } from './logic/dates';
import { THEMES, ThemeContext } from './themes';
import { MUSICS, startAudio } from './sounds';
import { GoalContext, DEFAULT_GOAL, successRate } from './goal';
import { isSnapshotTime, makeSnapshot } from './logic/history';
import { moveLateToToday, onWrong, onRetrieveSuccess, isDue } from './logic/retrieve';
import { levelExam, newTestSession } from './logic/sessions';
import { CLOUD_READY, startCloud } from './logic/cloud';
import { MAX_APP_WIDTH } from './screen';
import {
  loadTrainingConfig,
  saveTrainingConfig,
  forgetTrainingConfig,
  loadProgress,
  saveProgress,
  applyProgress,
  loadLook,
  saveLook,
  loadGoal,
  saveGoal,
  saveTestSession,
} from './logic/storage';

const DEFAULT_SETTINGS = {
  theme: THEMES[0],
  wallpaper: null, // the photo, as a small JPEG text (null = no wallpaper)
  wallpaperOpacity: 0.3, // 0 = invisible, 1 = fully visible
  frendComes: true, // false = Frend comes 90% less
  noWhy: false, // true = no "Why ?" to write under the answers
  music: MUSICS[0],
  musicVolume: 0.3, // quieter, so we still hear the answer sounds
  soundVolume: 1,
};

// Position of a page in the footer (home = -1, before everything).
function positionOf(pageName) {
  return FOOTER_PAGES.findIndex((page) => page.name === pageName);
}

// Reads every save, ONCE, when the app opens. (On the web, reading is instant.)
function loadEverything() {
  const progress = loadProgress(); // null the very first time
  const look = loadLook();
  const theme = look ? THEMES.find((item) => item.name === look.themeName) || THEMES[0] : THEMES[0];

  return {
    // The questions not retrieved on their day are moved to today.
    questions: progress ? applyProgress(QUESTIONS, progress.progress).map(moveLateToToday) : QUESTIONS,
    reviewLog: progress ? progress.reviewLog : {},
    stats: progress ? progress.stats : {},
    history: progress ? progress.history : [],
    settings: look
      ? {
          ...DEFAULT_SETTINGS,
          theme: theme,
          wallpaper: look.wallpaper,
          wallpaperOpacity: look.wallpaperOpacity,
          frendComes: look.frendComes,
          noWhy: look.noWhy,
        }
      : DEFAULT_SETTINGS,
    trainingConfig: loadTrainingConfig(),
    goal: loadGoal(),
  };
}

export default function App() {
  // useState(function): the function runs only the first time -> we read the saves only once.
  const [saved] = useState(loadEverything);
  const [page, setPage] = useState('home');
  const [slide, setSlide] = useState(''); // swipe direction: 'from-right' | 'from-left'
  const [questions, setQuestions] = useState(saved.questions);
  const [reviewLog, setReviewLog] = useState(saved.reviewLog); // { "Mon Oct 05 2026": 3, ... }
  const [stats, setStats] = useState(saved.stats); // { wordForms: { good: 4, bad: 1 }, ... }
  const [history, setHistory] = useState(saved.history); // [{ date, stats }, ...]: a chart every 200 answers
  const [settings, setSettings] = useState(saved.settings);
  const [trainingConfig, setTrainingConfig] = useState(saved.trainingConfig); // null = never configured
  const [goal, setGoal] = useState(saved.goal); // { total: 750, oral: 350 }. null = not chosen yet
  // First launch (no goal yet = new player): the tutorial (it asks the goal too).
  const [tutorialOn, setTutorialOn] = useState(saved.goal === null); // true = the tutorial is drawn on top of the app
  const [tutorialView, setTutorialView] = useState(NOTHING_BEHIND); // the page the tutorial shows behind it
  const [anchors, setAnchors] = useState({}); // where the buttons the tutorial points at are: { eye: {...}, ... }
  const [lessonCategory, setLessonCategory] = useState(null); // the category of the lesson page ('passive'...)
  const [account, setAccount] = useState(null); // the email of the logged-in account (null = none)
  const [gameOpen, setGameOpen] = useState(false); // true = the isekai game covers the app
  // First launch: the account page comes first (log in = the progress comes back), then the tutorial.
  const [welcome, setWelcome] = useState(saved.goal === null && CLOUD_READY);
  const showWelcome = welcome && account === null; // already logged in (remembered by Firebase): no need
  const theme = settings.theme;

  // [] = run only once, when the app opens.
  useEffect(startApp, []);

  function startApp() {
    startAudio(DEFAULT_SETTINGS);
    startCloud(setAccount); // automatic login (if the player logged in once), then the cloud save
    // The player is back: maybe Frend says hello (1 s later: the app has finished opening).
    if (saved.goal) setTimeout(() => tellFrend({ type: 'open' }), 1000);
  }

  // Each time the progress changes: save it.
  useEffect(progressChanged, [questions, reviewLog, stats, history]);

  function progressChanged() {
    saveProgress(questions, reviewLog, stats, history);
  }

  // Each time the theme, the wallpaper or the Frend setting changes: save it.
  useEffect(lookChanged, [
    settings.theme,
    settings.wallpaper,
    settings.wallpaperOpacity,
    settings.frendComes,
    settings.noWhy,
  ]);

  function lookChanged() {
    saveLook(settings);
    // The color of the iPhone's top bar follows the theme.
    document.querySelector('meta[name=theme-color]').setAttribute('content', theme.background);
  }

  function chooseGoal(newGoal) {
    setGoal(newGoal);
    saveGoal(newGoal);
  }

  // Called when "Save" is clicked on the goal page.
  function finishGoal(newGoal) {
    const firstTime = goal === null;
    chooseGoal(newGoal);
    goTo(firstTime ? 'home' : 'settings');
  }

  function openGoal() {
    goTo('goal');
  }

  function openLogin() {
    goTo('login');
  }

  function openSubscribe() {
    goTo('subscribe');
  }

  function backToSettings() {
    goTo('settings');
  }

  // First launch: logged in, or "Continue without account" -> the tutorial.
  function finishWelcome() {
    setWelcome(false);
  }

  function openTutorial() {
    setTutorialView(NOTHING_BEHIND);
    setTutorialOn(true);
  }

  // End of the tutorial: let's go !
  // levelTest: 'normal' | 'accurate' if the player wants to test their level first, else null.
  function finishTutorial(levelTest) {
    setTutorialOn(false);
    if (levelTest) {
      // Saved like a test in progress: the Test page opens directly on it.
      saveTestSession(newTestSession(levelExam(questions, levelTest), questions));
      goTo('test');
    } else {
      goTo('home');
    }
  }

  // Called when the user clicks "Let's GOOO !!!".
  function changeTrainingConfig(config, save) {
    setTrainingConfig(config);
    if (save) {
      saveTrainingConfig(config);
    } else {
      forgetTrainingConfig();
    }
  }

  function goTo(newPage) {
    if (newPage === 'game') {
      setGameOpen(true); // not a page: the game opens on top of the app
      return;
    }
    if (newPage === page) return;

    // Going right in the footer -> new page comes from the right. Else from the left.
    setSlide(positionOf(newPage) > positionOf(page) ? 'from-right' : 'from-left');
    setPage(newPage);
    tellFrend({ type: 'page' }); // maybe Frend passes by
  }

  // Change one setting, keep the others: changeSetting('theme', THEMES[1])
  function changeSetting(key, value) {
    setSettings((old) => ({ ...old, [key]: value }));
  }

  // Replace one question in the list by its new version.
  function updateQuestion(updated) {
    setQuestions((list) => list.map((q) => (q.id === updated.id ? updated : q)));
  }

  // answers: [{ question, isCorrect }, ...] (all the questions of a text, at once)
  // Every 200 answers: the chart of these 200 goes in the history,
  // and the current chart starts again from zero (a new block of 200).
  function recordAnswers(answers) {
    let newStats = stats;
    let newHistory = history;
    for (const answer of answers) {
      newStats = addAnswer(newStats, answer.question.category, answer.isCorrect);
      if (isSnapshotTime(newStats)) {
        newHistory = [...newHistory, makeSnapshot(newStats)];
        newStats = {}; // reset: the next 200 answers start on an empty chart
      }
    }
    setStats(newStats);
    setHistory(newHistory);
  }

  function closeGame() {
    setGameOpen(false);
  }

  // The game needs the level of the player: the level test of the tutorial, then back to the game by the footer.
  function takeLevelTestForGame() {
    setGameOpen(false);
    finishTutorial('normal');
  }

  // An answer given in a fight of the game counts like an answer of a training:
  // the stats, and the recovery (failed = to review tomorrow, reviewed with success = wait longer).
  function recordGameAnswer(question, isCorrect) {
    recordAnswers([{ question: question, isCorrect: isCorrect }]);
    if (!isCorrect) {
      updateQuestion(onWrong(question));
    } else if (isDue(question, today())) {
      updateQuestion(onRetrieveSuccess(question));
      logReview();
    }
  }

  // A button tells where it is on the screen (see Anchor): keep it for the tutorial.
  function rememberAnchor(name, place) {
    setAnchors((old) => ({ ...old, [name]: place }));
  }
  const onAnchor = tutorialOn ? rememberAnchor : null; // only during the tutorial

  function openHistory() {
    goTo('history');
  }

  // "<" of the history or of a lesson.
  function backToStats() {
    goTo('stats');
  }

  // A category name was clicked on the chart: its lesson.
  function openLesson(categoryId) {
    setLessonCategory(categoryId);
    goTo('lesson');
  }

  // +1 "retrieved" for today (the green part of the bar).
  function logReview() {
    const key = today().toDateString();
    setReviewLog((log) => ({ ...log, [key]: (log[key] || 0) + 1 }));
  }

  // The page on screen. During the tutorial, it's the tutorial that chooses it (null = nothing).
  const shownPage = tutorialOn ? tutorialView.page : page;

  function renderPage() {
    if (shownPage === null) return null;
    if (shownPage === 'training')
      return (
        <TrainingPage
          questions={questions}
          askWhy={!settings.noWhy}
          updateQuestion={updateQuestion}
          recordAnswers={recordAnswers}
          config={trainingConfig}
          onConfigDone={changeTrainingConfig}
          tutorialStep={tutorialOn ? tutorialView.focus : null}
          onAnchor={onAnchor}
        />
      );
    if (shownPage === 'test')
      return <TestPage questions={questions} recordAnswers={recordAnswers} preview={tutorialOn} />;
    if (shownPage === 'recovery')
      return (
        <RecoveryPage
          questions={questions}
          askWhy={!settings.noWhy}
          reviewLog={reviewLog}
          updateQuestion={updateQuestion}
          recordAnswers={recordAnswers}
          logReview={logReview}
        />
      );
    if (shownPage === 'stats')
      return (
        <StatsPage
          stats={stats}
          onOpenHistory={openHistory}
          onOpenLesson={openLesson}
          onAnchor={onAnchor}
          focus={tutorialOn ? tutorialView.focus : null}
        />
      );
    if (shownPage === 'history') return <HistoryPage history={history} stats={stats} onBack={backToStats} />;
    if (shownPage === 'lesson') return <LessonPage categoryId={lessonCategory} onBack={backToStats} />;
    if (shownPage === 'settings')
      return (
        <SettingsPage
          settings={settings}
          changeSetting={changeSetting}
          onOpenGoal={openGoal}
          onOpenTutorial={openTutorial}
          account={account}
          onOpenLogin={openLogin}
          onOpenSubscribe={openSubscribe}
          focus={tutorialOn ? tutorialView.focus : null}
        />
      );
    if (shownPage === 'goal') return <GoalPage goal={goal || DEFAULT_GOAL} onSave={finishGoal} />;
    if (shownPage === 'login' || shownPage === 'subscribe')
      return <AccountPage mode={shownPage} onDone={backToSettings} onBack={backToSettings} />;
    return <HomePage />;
  }

  return (
    // Every component inside can read the theme with useTheme(), and the goal with useGoal()
    <ThemeContext value={theme}>
      <GoalContext value={goal || DEFAULT_GOAL}>
        <div style={{ ...styles.app, backgroundColor: theme.background }}>
          {/* The wallpaper is drawn see-through, on top of the theme color */}
          {settings.wallpaper && (
            <div
              style={{
                ...styles.wallpaper,
                backgroundImage: 'url(' + settings.wallpaper + ')',
                opacity: settings.wallpaperOpacity,
              }}
            />
          )}

          <div style={styles.content}>
            {/* key={shownPage}: a new page = a new div -> the swipe animation plays again.
                (Not during the tutorial: the pages must stay still, so Frend can point at their buttons.) */}
            <div key={shownPage} className={'page ' + (tutorialOn ? '' : slide)}>
              {renderPage()}
            </div>
          </div>

          <Footer current={shownPage} onSelect={goTo} />

          {/* Frend, alive: he walks on the footer sometimes (hidden during the tutorial) */}
          <FrendCompanion paused={tutorialOn} rare={!settings.frendComes} />

          {/* The isekai game: its own window, on top of the pages and the footer. */}
          {gameOpen && (
            <GamePage
              questions={questions}
              stats={stats}
              history={history}
              goalRate={successRate(goal || DEFAULT_GOAL)}
              onAnswer={recordGameAnswer}
              onTakeTest={takeLevelTestForGame}
              onClose={closeGame}
            />
          )}

          {/* First launch: the account page, on top of everything. The tutorial comes after. */}
          {showWelcome && (
            <div style={{ ...styles.cover, backgroundColor: theme.background }}>
              <AccountPage mode="welcome" onDone={finishWelcome} />
            </div>
          )}

          {/* The tutorial (when it runs) is drawn ON TOP of the pages and the footer. */}
          {tutorialOn && !showWelcome && (
            <TutorialPage
              goal={goal}
              onGoalChosen={chooseGoal}
              onShowPage={setTutorialView}
              anchors={anchors}
              onFinish={finishTutorial}
            />
          )}
        </div>
      </GoalContext>
    </ThemeContext>
  );
}

const styles = {
  app: {
    width: '100%', // without it, "margin: auto" would shrink the app to the size of its content
    height: '100%',
    maxWidth: MAX_APP_WIDTH, // on a computer: phone-sized, in the middle
    margin: '0 auto',
    paddingTop: 'env(safe-area-inset-top)', // iPhone: under the notch
    overflow: 'hidden',
  },
  wallpaper: {
    position: 'absolute',
    inset: 0,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  content: {
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
  },
  // On top of the pages AND the footer (but not under the iPhone's notch and home bar).
  cover: {
    position: 'absolute',
    top: 'env(safe-area-inset-top)',
    left: 0,
    right: 0,
    bottom: 'env(safe-area-inset-bottom)',
  },
};
