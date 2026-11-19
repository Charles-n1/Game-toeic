import { useEffect, useRef } from 'react';
import { splitDocuments } from '../../logic/groups';

// The text of a question in a fight (RC 8, RC 55).
// Every document is shown, one under the other: an e-mail AND the form it answers. (Before, only the first
// document was on screen, so a question about the second one looked like it had nothing to do with the text.)
// In a text with blanks, the blank the question asks about is lit, and the box scrolls to it.

// "Blank (2)..." -> "___(2)___" (the mark of that blank in the text). Any other question: null.
function askedBlank(question) {
  const found = question.question.match(/^Blank \((\d)\)/);
  return found ? '___(' + found[1] + ')___' : null;
}

// A document cut around the asked blank: [before, blank, after]. No blank in it: [the whole text, null, ''].
function cutAtBlank(document, blank) {
  const at = blank ? document.indexOf(blank) : -1;
  if (at < 0) return [document, null, ''];
  return [document.slice(0, at), blank, document.slice(at + blank.length)];
}

// Scrolls the box so that the lit blank is in its upper third (only the box moves, not the page).
function scrollToBlank(box, mark) {
  if (!box || !mark) return;
  box.scrollTop += mark.getBoundingClientRect().top - box.getBoundingClientRect().top - box.clientHeight / 3;
}

export default function FightPassage({ question }) {
  const boxRef = useRef(null);
  const markRef = useRef(null);
  const blank = askedBlank(question);
  const documents = splitDocuments(question.text);

  useEffect(() => scrollToBlank(boxRef.current, markRef.current), [question.id]);

  return (
    <div ref={boxRef} className="fight-passage">
      {documents.map((document, index) => {
        const [before, mark, after] = cutAtBlank(document, blank);
        return (
          <div key={index} className="fight-document">
            {documents.length > 1 && (
              <span className="fight-document-tag">
                Document {index + 1} / {documents.length}
              </span>
            )}
            <span className="fight-document-text">
              {before}
              {mark && <mark ref={markRef}>{mark}</mark>}
              {after}
            </span>
          </div>
        );
      })}
    </div>
  );
}
