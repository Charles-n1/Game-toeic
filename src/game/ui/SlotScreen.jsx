import { useRef, useState } from 'react';
import Landscape from './Landscape';
import Window from './Window';
import { SLOTS, slotSummary, exportSave, importSave } from '../logic/save';

// "lexia-save-1.json": the file of a save.
function fileNameOf(slot) {
  return 'lexia-save-' + slot + '.json';
}

// Gives the save of a slot to the player, as a file to keep.
function downloadSave(slot) {
  const text = exportSave(slot);
  if (!text) return;
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileNameOf(slot);
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function dateText(time) {
  return time ? new Date(time).toLocaleDateString() : '';
}

// One slot: what is in it, and what can be done with it.
function SlotCard({ slot, onPlay, onCreate, onImport, isConfirming, onAskConfirm }) {
  const summary = slotSummary(slot);

  function create() {
    if (summary && !isConfirming) onAskConfirm(slot); // a save is there: tap again to erase it
    else onCreate(slot);
  }

  return (
    <Window title={'Slot ' + slot}>
      {summary ? (
        <>
          <span className="gold">
            {summary.name} · Lv. {summary.level}
          </span>
          <span className="small">
            {summary.goal} · {summary.chapter} · Day {summary.day} · saved {dateText(summary.savedAt)}
          </span>
        </>
      ) : (
        <span className="small">Empty</span>
      )}
      <div className="row wrap" style={styles.buttons}>
        {summary && (
          <button className="px-button px-gold" onClick={() => onPlay(slot)}>
            Play
          </button>
        )}
        <button className="px-button" onClick={create}>
          {isConfirming ? 'Tap again: erase and start' : 'New game here'}
        </button>
        {summary && (
          <button className="px-button" onClick={() => downloadSave(slot)}>
            Export
          </button>
        )}
        <button className="px-button" onClick={() => onImport(slot)}>
          Import
        </button>
      </div>
    </Window>
  );
}

// The 3 save slots: play one, start a new game in one, export a save to a file, import a file.
export default function SlotScreen({ onPlay, onCreate, onBack }) {
  const fileInput = useRef(null);
  const importSlot = useRef(1);
  const [confirmSlot, setConfirmSlot] = useState(null);
  const [message, setMessage] = useState('');

  function askImport(slot) {
    importSlot.current = slot;
    fileInput.current.click();
  }

  // The player picked a file: it becomes the save of the slot.
  function readFile(event) {
    const file = event.target.files[0];
    event.target.value = ''; // the same file can be picked again later
    if (!file) return;
    file.text().then((text) => {
      const isDone = importSave(importSlot.current, text);
      setMessage(isDone ? 'Save imported into slot ' + importSlot.current + '.' : 'This file is not a save of Lexia.');
    });
  }

  return (
    <div className="screen">
      <Landscape />
      <div className="start">
        <button className="close" onClick={onBack} aria-label="back">
          ✕
        </button>
        <span className="big-title" style={styles.title}>
          Choose a slot
        </span>
        {message && (
          <div className="toast" style={styles.message}>
            <span>{message}</span>
          </div>
        )}
        {SLOTS.map((slot) => (
          <SlotCard
            key={slot + message}
            slot={slot}
            onPlay={onPlay}
            onCreate={onCreate}
            onImport={askImport}
            isConfirming={confirmSlot === slot}
            onAskConfirm={setConfirmSlot}
          />
        ))}
        <span className="small" style={styles.hint}>
          Export a save to keep it in a file (another browser, another phone). Import puts a file back into a slot.
        </span>
        <input ref={fileInput} type="file" accept=".json,application/json" style={styles.hidden} onChange={readFile} />
      </div>
    </div>
  );
}

const styles = {
  title: {
    fontSize: 30,
    marginTop: 20,
  },
  message: {
    alignSelf: 'center',
  },
  buttons: {
    gap: 8,
    marginTop: 10,
  },
  hint: {
    textAlign: 'center',
    color: '#ffffff',
    textShadow: '1px 1px 0 #0e1430',
  },
  hidden: {
    display: 'none',
  },
};
