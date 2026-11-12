import { useState } from 'react';
import AppText from '../components/AppText';
import MainButton from '../components/MainButton';
import ScrollView from '../components/ScrollView';
import { useTheme } from '../themes';
import { SECTION_MAX, TOTAL_MAX, readingNeeded, successRate } from '../goal';

// goal: the current goal { total, oral }. onSave(newGoal): when "Save" is clicked.
export default function GoalPage({ goal, onSave }) {
  const theme = useTheme();
  const [totalText, setTotalText] = useState(String(goal.total));
  const [oral, setOral] = useState(goal.oral);

  const total = Number(totalText);
  const totalOk = Number.isInteger(total) && total >= 10 && total <= TOTAL_MAX;
  const draft = { total: total, oral: oral }; // the goal being edited
  const needed = readingNeeded(draft);
  const impossible = needed > SECTION_MAX;

  function save() {
    onSave(draft);
  }

  function typeTotal(event) {
    setTotalText(event.target.value);
  }

  function slideOral(event) {
    setOral(Number(event.target.value)); // the input gives text: "350" -> 350
  }

  return (
    <ScrollView contentStyle={styles.page}>
      <AppText style={styles.title}>What's up man ! So, what's ur goal ?</AppText>

      <div style={styles.row}>
        <input
          style={{ ...styles.input, color: theme.text, borderColor: theme.border, backgroundColor: theme.card }}
          value={totalText}
          onChange={typeTotal}
          inputMode="numeric"
        />
        <AppText style={styles.max}>/ {TOTAL_MAX}</AppText>
      </div>

      <AppText style={styles.label}>
        Estimated oral (listening): {oral} / {SECTION_MAX}
      </AppText>
      <input
        type="range"
        value={oral}
        min={5}
        max={SECTION_MAX}
        step={5} // TOEIC scores go 5 by 5
        onChange={slideOral}
        style={{ ...styles.slider, accentColor: theme.button }}
      />

      {totalOk && !impossible && (
        <AppText style={styles.blue}>
          You need {needed} / {SECTION_MAX} in reading ({successRate(draft)}%). This is now your success rate in Test
          and Training.
        </AppText>
      )}
      {totalOk && impossible && (
        <AppText style={styles.red}>
          Impossible: you would need {needed} / {SECTION_MAX} in reading. Raise your oral, or lower your goal.
        </AppText>
      )}

      <MainButton label="Save" onPress={save} disabled={!totalOk || impossible} />
    </ScrollView>
  );
}

const styles = {
  page: {
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 10,
    fontSize: 28,
    fontWeight: 'bold',
    width: 110,
    textAlign: 'center',
  },
  max: {
    fontSize: 28,
    marginLeft: 10,
  },
  label: {
    fontSize: 16,
    marginTop: 28,
  },
  blue: {
    color: '#007FFF',
    fontSize: 16,
    marginTop: 20,
  },
  red: {
    color: '#d63031',
    fontSize: 16,
    marginTop: 20,
  },
  slider: {
    width: '100%',
    height: 40,
  },
};
