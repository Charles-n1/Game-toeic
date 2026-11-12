import { useEffect } from 'react';
import AppText from './AppText';
import MainButton from './MainButton';
import ScrollView from './ScrollView';
import SpiderChart from './SpiderChart';
import { playSound } from '../sounds';
import { tellFrend } from '../logic/frendRadio';
import { useGoal, successRate, oralRate } from '../goal';
import { SCREEN_WIDTH } from '../screen';

const CHART_WIDTH = SCREEN_WIDTH - 40;

// What to play and say, depending on the % of good answers.
// needed: the success rate from the goal (reading needed, in %). oral: the oral estimate, in %.
function resultFor(percent, needed, oral) {
  if (percent >= needed) {
    return {
      sound: 'victory',
      message: 'GG MATE !! You might have your tepitech if your oral score is better than ' + oral + '%',
    };
  }
  if (percent >= needed - 10) {
    return {
      sound: 'loose1',
      message:
        "Better luck next time.. ;) (or work ?). If you don't have your oral tepitech at " +
        oral +
        "% correct, it's over man..",
    };
  }
  return {
    sound: 'loose3',
    message: "That's, hmh. Better.. Good luck !! For training ! Cause that's.. gonna be hard",
  };
}

// End of a test or a training.
// results: the answers of this session, by category ({ wordForms: { good, bad }, ... }) -> its spider chart.
// title (optional): above the score. note (optional): under it, like "Time's up !".
export default function ScoreScreen({ score, total, results, title, note, onBack }) {
  const goal = useGoal();
  const needed = successRate(goal);
  const percent = total === 0 ? 0 : (score / total) * 100;
  const result = resultFor(percent, needed, oralRate(goal));

  // [] = only once, when the score appears.
  useEffect(playResultSound, []);

  function playResultSound() {
    playSound(result.sound);
    tellFrend({ type: 'score', good: percent >= needed }); // maybe Frend reacts (happy, or AHHH)
  }

  return (
    <ScrollView contentStyle={styles.page}>
      {title && <AppText style={styles.title}>{title}</AppText>}
      <AppText style={{ ...styles.score, ...(percent >= needed && styles.green) }}>
        {score} / {total}
      </AppText>
      <AppText style={styles.percent}>
        {Math.round(percent)}% (goal: {needed}%)
      </AppText>
      {note && <AppText style={styles.note}>{note}</AppText>}

      {/* The categories of this session ("–" = no question of this category) */}
      <div style={styles.chart}>
        <SpiderChart stats={results} width={CHART_WIDTH} showAllNames={true} markUnplayed={true} />
      </div>

      <AppText style={styles.message}>{result.message}</AppText>

      <AppText style={styles.screenshot}>Take a screenshot ! This result won't be saved.</AppText>

      <MainButton label="Back" onPress={onBack} />
    </ScrollView>
  );
}

const styles = {
  page: {
    minHeight: '100%', // short content: centered on the screen. Long: it scrolls.
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  score: {
    fontSize: 64,
    fontWeight: 'bold',
    marginTop: 30, // a bit lower on the screen
  },
  green: {
    color: '#2e9e4f',
  },
  percent: {
    fontSize: 20,
    color: '#888',
  },
  note: {
    fontSize: 16,
    color: '#F57C00',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 8,
  },
  message: {
    color: '#007FFF',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 10,
  },
  // The whole chart (names included) a bit smaller than the screen.
  chart: {
    width: '80%',
    marginTop: 10,
  },
  screenshot: {
    color: '#007FFF',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
};
