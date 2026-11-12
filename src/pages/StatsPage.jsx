import { useState } from 'react';
import AppText from '../components/AppText';
import Icon from '../components/Icon';
import Anchor from '../components/Anchor';
import SpiderChart from '../components/SpiderChart';
import { useTheme } from '../themes';
import { SCREEN_WIDTH } from '../screen';
import historyIcon from '../assets/Logos/histoire.png';
import eyeIcon from '../assets/Logos/oeil.png';

const CHART_WIDTH = SCREEN_WIDTH - 24;

// onOpenHistory: opens the history page. onOpenLesson(category id): opens the lesson of a category
// (its name is clicked on the chart, when the eye is on).
// For the tutorial (optional): onAnchor (it points at the eye and the book), focus 'eye' (the eye is "clicked").
export default function StatsPage({ stats, onOpenHistory, onOpenLesson, onAnchor, focus }) {
  const theme = useTheme();
  const [clickedEye, setClickedEye] = useState(false);
  const showAllNames = clickedEye || focus === 'eye';

  function toggleNames() {
    setClickedEye(!clickedEye);
  }

  // Names shown: the eye button is filled.
  const eyeButtonColor = showAllNames ? theme.button : theme.card;
  const eyeColor = showAllNames ? theme.buttonText : theme.text;

  return (
    <div style={styles.page}>
      <AppText style={styles.title}>Statistics</AppText>

      {/* flex: 1 + center = the chart sits in the middle of the free space */}
      <div style={styles.center}>
        <SpiderChart
          stats={stats}
          width={CHART_WIDTH}
          showAllNames={showAllNames}
          onSelectCategory={showAllNames ? onOpenLesson : null}
        />
        {/* Always there (invisible without the names): the eye doesn't move, so Frend points at the right place */}
        <AppText style={{ ...styles.hint, opacity: showAllNames ? 1 : 0 }}>Click on a category to learn it ^O^</AppText>

        {/* Under the chart, on the right: history + eye */}
        <div style={styles.buttons}>
          <Anchor name="book" onAnchor={onAnchor}>
            <button
              onClick={onOpenHistory}
              aria-label="history"
              style={{ ...styles.roundButton, borderColor: theme.border, backgroundColor: theme.card }}
            >
              <Icon src={historyIcon} color={theme.text} size={40} />
            </button>
          </Anchor>
          <Anchor name="eye" onAnchor={onAnchor}>
            <button
              onClick={toggleNames}
              aria-label="show the names"
              style={{ ...styles.roundButton, borderColor: theme.border, backgroundColor: eyeButtonColor }}
            >
              <Icon src={eyeIcon} color={eyeColor} size={40} />
            </button>
          </Anchor>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    flex: 1,
    padding: 12,
  },
  buttons: {
    flexDirection: 'row', // side by side
    alignSelf: 'flex-end', // on the right
    marginRight: 8,
    marginTop: 8,
  },
  roundButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    paddingLeft: 8,
    paddingRight: 8,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
  },
  hint: {
    color: '#888',
    textAlign: 'center',
  },
};
