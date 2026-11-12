import AppText from './AppText';
import { useTheme } from '../themes';

// A square you tick (✓ = yes, empty = no), with its label.
export default function CheckBox({ label, checked, onChange }) {
  const theme = useTheme();

  function toggle() {
    onChange(!checked);
  }

  return (
    <button onClick={toggle} style={styles.row}>
      <div
        style={{
          ...styles.box,
          borderColor: theme.border,
          ...(checked && { backgroundColor: theme.button, borderColor: theme.button }),
        }}
      >
        {checked && <span style={{ ...styles.check, color: theme.buttonText }}>✓</span>}
      </div>
      <AppText style={styles.label}>{label}</AppText>
    </button>
  );
}

const styles = {
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
  },
  box: {
    width: 28,
    height: 28,
    borderWidth: 2,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  check: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  label: {
    flex: 1, // long labels go to the next line
    fontSize: 16,
  },
};
