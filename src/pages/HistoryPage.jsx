import AppText from '../components/AppText';
import BackButton from '../components/BackButton';
import ScrollView from '../components/ScrollView';
import SpiderChart from '../components/SpiderChart';
import { useTheme } from '../themes';
import { totalAnswers } from '../data/categories';
import { SNAPSHOT_EVERY } from '../logic/history';
import { SCREEN_WIDTH } from '../screen';

const CHART_WIDTH = SCREEN_WIDTH - 48;

// 1759700000000 -> "05/10/2026"
function formatDate(time) {
  const date = new Date(time);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth: January = 0
  return day + '/' + month + '/' + date.getFullYear();
}

// history: [{ date, stats }, ...] (oldest first). stats: the current stats.
export default function HistoryPage({ history, stats, onBack }) {
  const theme = useTheme();
  const newestFirst = [...history].reverse();
  const left = SNAPSHOT_EVERY - (totalAnswers(stats) % SNAPSHOT_EVERY); // answers before the next chart
  const cardStyle = { ...styles.card, borderColor: theme.border, backgroundColor: theme.card };

  return (
    <div style={styles.screen}>
      <ScrollView contentStyle={styles.page}>
        <AppText style={styles.title}>History</AppText>
        <AppText style={styles.hint}>The next in {left} questions ^O^</AppText>

        {/* No saved chart yet: show the current one, live, until the first save at 200 */}
        {history.length === 0 && (
          <div style={cardStyle}>
            <AppText style={styles.date}>In progress...</AppText>
            <AppText style={styles.count}>
              {totalAnswers(stats)} / {SNAPSHOT_EVERY} questions
            </AppText>
            <SpiderChart stats={stats} width={CHART_WIDTH} showAllNames={true} />
          </div>
        )}

        {newestFirst.map((snapshot) => (
          <div key={snapshot.date} style={cardStyle}>
            <AppText style={styles.date}>{formatDate(snapshot.date)}</AppText>
            <AppText style={styles.count}>{totalAnswers(snapshot.stats)} answers</AppText>
            <SpiderChart stats={snapshot.stats} width={CHART_WIDTH} showAllNames={true} />
          </div>
        ))}
      </ScrollView>

      <BackButton onPress={onBack} />
    </div>
  );
}

const styles = {
  screen: {
    flex: 1,
    minHeight: 0,
  },
  page: {
    padding: 12,
    paddingBottom: 90, // room for the "<" button
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    paddingLeft: 8,
    paddingRight: 8,
  },
  hint: {
    color: '#888',
    paddingLeft: 8,
    paddingRight: 8,
    marginBottom: 12,
  },
  card: {
    borderWidth: 2,
    borderRadius: 16,
    padding: 10,
    marginBottom: 16,
  },
  date: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  count: {
    color: '#888',
  },
};
