import { useState } from 'react';
import AppText from './AppText';
import { useTheme } from '../themes';
import { splitDocuments } from '../logic/groups';

// The text to read (memo, email, ad...) above the questions.
// Several documents: one bubble at a time, "<" and ">" to switch.
export default function Passage({ text }) {
  const theme = useTheme();
  const documents = splitDocuments(text);
  const [shown, setShown] = useState(0); // position of the document on screen
  const isFirst = shown === 0;
  const isLast = shown === documents.length - 1;

  function showPrevious() {
    setShown(shown - 1);
  }

  function showNext() {
    setShown(shown + 1);
  }

  return (
    <div style={styles.wrapper}>
      <div style={{ ...styles.box, borderColor: theme.border, backgroundColor: theme.card }}>
        <AppText style={styles.text}>{documents[shown]}</AppText>
      </div>

      {documents.length > 1 && (
        <div style={styles.arrows}>
          <button onClick={showPrevious} disabled={isFirst} style={isFirst ? styles.off : null} aria-label="previous">
            <AppText style={styles.arrow}>{'<'}</AppText>
          </button>
          <AppText style={styles.page}>
            {shown + 1} / {documents.length}
          </AppText>
          <button onClick={showNext} disabled={isLast} style={isLast ? styles.off : null} aria-label="next">
            <AppText style={styles.arrow}>{'>'}</AppText>
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    marginBottom: 16,
  },
  box: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  text: {
    fontSize: 14,
    lineHeight: '20px', // on the web, a number alone would mean "20 times the font size"
  },
  arrows: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  arrow: {
    fontSize: 28,
    fontWeight: 'bold',
    paddingLeft: 24,
    paddingRight: 24,
  },
  page: {
    fontSize: 16,
  },
  off: {
    opacity: 0.25, // greyed out: nothing more on this side
  },
};
