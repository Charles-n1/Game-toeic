import Landscape from './Landscape';
import Window from './Window';

const CREDITS = [
  ['Idea and game design', 'Charles-n1'],
  ['Code and pixel art', 'Made with Claude Code, drawn pixel by pixel in the code'],
  ['Music and sound effects', 'Played live by the game (Web Audio), no sound file'],
  ['Font', 'Pixelify Sans, by the Pixelify Sans Project Authors (SIL Open Font License)'],
  ['Questions', 'The TOEIC questions of Prep my TOEIC'],
];

// Who made the game.
export default function CreditsScreen({ onBack }) {
  return (
    <div className="screen">
      <Landscape />
      <div className="start">
        <Window title="Credits" gold onClose={onBack}>
          {CREDITS.map(([role, who]) => (
            <div key={role} style={styles.line}>
              <span className="gold">{role}</span>
              <span>{who}</span>
            </div>
          ))}
          <span className="small" style={styles.thanks}>
            Thank you for playing. Every answer you give here makes you better at the TOEIC.
          </span>
        </Window>
      </div>
    </div>
  );
}

const styles = {
  line: {
    marginBottom: 12,
  },
  thanks: {
    marginTop: 6,
  },
};
