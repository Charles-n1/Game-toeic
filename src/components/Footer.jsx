import Icon from './Icon';
import { useTheme } from '../themes';
import trainingIcon from '../assets/Logos/bras-flex.png';
import testIcon from '../assets/Logos/tete-de-mort.png';
import recoveryIcon from '../assets/Logos/cerveau-recovery.png';
import statsIcon from '../assets/Logos/statistiques.png';
import settingsIcon from '../assets/Logos/engrenage.png';

const ICON_SIZE = 52;
const PADDING = 8; // above and under each icon
const BORDER = 2; // the line on top of the footer
// The height of the whole footer (the tutorial uses it to know where the icons are).
// (The iPhone's home bar adds a bit under it: the tutorial and Frend stay above it.)
export const FOOTER_HEIGHT = BORDER + PADDING + ICON_SIZE + PADDING;

// The 5 buttons, in order (left -> right).
export const FOOTER_PAGES = [
  { name: 'training', icon: trainingIcon },
  { name: 'test', icon: testIcon },
  { name: 'recovery', icon: recoveryIcon },
  { name: 'stats', icon: statsIcon },
  { name: 'settings', icon: settingsIcon },
];

function FooterButton({ page, isActive, onSelect }) {
  const theme = useTheme();

  function press() {
    onSelect(page.name);
  }

  return (
    <button onClick={press} style={styles.button} aria-label={page.name}>
      <Icon src={page.icon} color={theme.text} size={ICON_SIZE} style={isActive ? null : styles.inactive} />
    </button>
  );
}

export default function Footer({ current, onSelect }) {
  const theme = useTheme();

  return (
    <div style={{ ...styles.footer, backgroundColor: theme.background, borderColor: theme.border }}>
      {FOOTER_PAGES.map((page) => (
        <FooterButton key={page.name} page={page} isActive={page.name === current} onSelect={onSelect} />
      ))}
    </div>
  );
}

const styles = {
  footer: {
    flexDirection: 'row',
    borderTopWidth: BORDER,
    paddingBottom: 'env(safe-area-inset-bottom)', // iPhone: above the home bar
  },
  button: {
    flex: 1,
    alignItems: 'center',
    paddingTop: PADDING,
    paddingBottom: PADDING,
  },
  inactive: {
    opacity: 0.35,
  },
};
