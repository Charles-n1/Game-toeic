import AppText from './AppText';
import MainButton from './MainButton';
import SectionBar from './SectionBar';
import Anchor from './Anchor';

// First step of Test and Training: choose the parts of the TOEIC.
// onAnchor: for the tutorial (it points at the bar and the submit button). Optional.
export default function SectionPicker({ title, selected, onChange, onSubmit, onAnchor }) {
  const readingOnly = selected.filter((id) => id !== 'listening');

  function submit() {
    onChange(readingOnly); // no listening (no budget ;-;)
    onSubmit();
  }

  return (
    <div style={styles.page}>
      <AppText style={styles.title}>{title}</AppText>

      <Anchor name="bar" onAnchor={onAnchor}>
        <SectionBar selected={selected} onChange={onChange} />
      </Anchor>

      <div style={styles.underBar}>
        <Anchor name="submit" onAnchor={onAnchor}>
          <MainButton label="submit" onPress={submit} disabled={readingOnly.length === 0} style={styles.submit} />
        </Anchor>
        <AppText style={styles.hint}>click / drag the segment to select</AppText>
      </div>

      {/* What is inside each part (RC 10 and RC 8 are too thin to write it under them) */}
      <AppText style={styles.legend}>{'RC 10 = sentences\nRC 8 = short texts\nRC Text = long texts'}</AppText>

      {selected.includes('listening') && (
        <AppText style={styles.sorry}>sorry, i do not have budget for listening ;-;. Sorry..</AppText>
      )}
    </div>
  );
}

const styles = {
  page: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  underBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  submit: {
    alignSelf: 'auto',
    paddingLeft: 24,
    paddingRight: 24,
  },
  hint: {
    color: '#888',
    fontSize: 12,
    marginTop: 16,
  },
  legend: {
    color: '#888',
    fontSize: 13,
    lineHeight: '20px',
    marginTop: 20,
  },
  sorry: {
    color: '#d63031',
    marginTop: 24,
    textAlign: 'center',
  },
};
