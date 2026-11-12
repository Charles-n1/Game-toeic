import AppText from './AppText';
import { useTheme } from '../themes';

const BLUE = '#007FFF';

// A speech bubble with a blue outline, and a little "tail" pointing to who is talking.
// tail: 'right' (default), 'left', 'bottom' (he's under it), or 'none' (a plain bubble).
// small: a smaller bubble (for short words).
// Reusable anywhere: <SpeechBubble text="Hello !" tail="left" />
export default function SpeechBubble({ text, tail = 'right', small = false }) {
  const theme = useTheme();
  const tailColor = { backgroundColor: theme.card };

  return (
    <div style={{ ...styles.bubble, ...(small && styles.smallBubble), backgroundColor: theme.card }}>
      <AppText style={{ ...styles.text, ...(small && styles.smallText) }}>{text}</AppText>
      {/* A small square turned 45°, with only 2 borders drawn: it looks like an arrow ">" (or "<") */}
      {tail === 'right' && <div style={{ ...styles.tail, ...styles.tailRight, ...tailColor }} />}
      {tail === 'left' && <div style={{ ...styles.tail, ...styles.tailLeft, ...tailColor }} />}
      {tail === 'bottom' && <div style={{ ...styles.tailBottom, ...tailColor }} />}
    </div>
  );
}

const styles = {
  bubble: {
    borderWidth: 2,
    borderColor: BLUE,
    borderRadius: 16,
    padding: 14,
    minHeight: 90,
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    lineHeight: '22px',
  },
  smallBubble: {
    padding: 8,
    minHeight: 0,
    borderRadius: 12,
  },
  smallText: {
    fontSize: 14,
    lineHeight: '18px',
    textAlign: 'center',
  },
  tail: {
    position: 'absolute',
    top: '50%',
    marginTop: -8,
    width: 16,
    height: 16,
    borderColor: BLUE,
    transform: 'rotate(45deg)',
  },
  tailRight: {
    right: -9,
    borderTopWidth: 2, // top + right borders of the turned square = ">"
    borderRightWidth: 2,
  },
  tailLeft: {
    left: -9,
    borderBottomWidth: 2, // bottom + left borders of the turned square = "<"
    borderLeftWidth: 2,
  },
  tailBottom: {
    position: 'absolute',
    bottom: -9,
    left: '50%',
    marginLeft: -8,
    width: 16,
    height: 16,
    borderColor: BLUE,
    borderBottomWidth: 2, // bottom + right borders of the turned square = "v"
    borderRightWidth: 2,
    transform: 'rotate(45deg)',
  },
};
