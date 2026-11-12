import AppText from './AppText';
import { today, addDays } from '../logic/dates';
import { isDue } from '../logic/retrieve';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MAX_BAR_HEIGHT = 140;

// For one day: how many to retrieve (red) and how many already retrieved (green).
function makeBar(dayNumber, questions, reviewLog) {
  const day = addDays(today(), dayNumber);
  const isToday = dayNumber === 0;

  // Today also counts the late ones. Other days count only that exact day.
  const red = questions.filter((q) =>
    isToday ? isDue(q, day) : q.retrieve && q.retrieve_date.getTime() === day.getTime(),
  ).length;

  return {
    label: isToday ? 'Today' : DAY_NAMES[day.getDay()],
    red: red,
    green: reviewLog[day.toDateString()] || 0,
  };
}

function Bar({ bar, biggest }) {
  return (
    <div style={styles.column}>
      <AppText style={styles.count}>{bar.red + bar.green}</AppText>
      <div style={{ ...styles.red, height: (bar.red / biggest) * MAX_BAR_HEIGHT }} />
      <div style={{ ...styles.green, height: (bar.green / biggest) * MAX_BAR_HEIGHT }} />
      <AppText style={styles.label}>{bar.label}</AppText>
    </div>
  );
}

export default function BarChart({ questions, reviewLog }) {
  const bars = [0, 1, 2, 3, 4, 5, 6].map((dayNumber) => makeBar(dayNumber, questions, reviewLog));
  const biggest = Math.max(1, ...bars.map((bar) => bar.red + bar.green));

  return (
    <div style={styles.chart}>
      {bars.map((bar) => (
        <Bar key={bar.label} bar={bar} biggest={biggest} />
      ))}
    </div>
  );
}

const styles = {
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: MAX_BAR_HEIGHT + 50,
  },
  column: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  count: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  red: {
    width: 26,
    backgroundColor: '#d63031',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  green: {
    width: 26,
    backgroundColor: '#2e9e4f',
  },
  label: {
    marginTop: 6,
    fontSize: 12,
  },
};
