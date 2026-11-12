import { useRef } from 'react';
import AppText from './AppText';
import MovingStripes from './MovingStripes';
import { useTheme } from '../themes';
import { SECTIONS } from '../data/sections';

let TOTAL_MINUTES = 0;
for (const section of SECTIONS) {
  TOTAL_MINUTES += section.minutes;
}

// Which segment is at x pixels from the left of the bar?
function indexAt(x, barWidth) {
  let segmentEnd = 0;
  for (let i = 0; i < SECTIONS.length; i++) {
    segmentEnd += (SECTIONS[i].minutes / TOTAL_MINUTES) * barWidth;
    if (x < segmentEnd) return i;
  }
  return SECTIONS.length - 1;
}

// The scale bar. Tap = select / unselect one. Drag = select a range.
// selected: list of ids, like ['rc10', 'rc8']
export default function SectionBar({ selected, onChange }) {
  const theme = useTheme();
  // useRef = a box that keeps a value between renders, without re-rendering.
  const bar = useRef({ left: 0, width: 0 }); // where the bar is on the screen
  const startIndex = useRef(0); // segment where the finger landed
  const dragged = useRef(false);

  // "Pointer" = finger OR mouse: one code for both.
  function fingerDown(event) {
    event.currentTarget.setPointerCapture(event.pointerId); // keep following the finger, even outside the bar
    const rect = event.currentTarget.getBoundingClientRect();
    bar.current = { left: rect.left, width: rect.width };
    startIndex.current = indexAt(event.clientX - rect.left, rect.width);
    dragged.current = false;
  }

  function fingerMove(event) {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return; // not pressing
    const index = indexAt(event.clientX - bar.current.left, bar.current.width);
    if (index === startIndex.current && !dragged.current) return; // still on the first segment

    dragged.current = true;
    const from = Math.min(startIndex.current, index);
    const to = Math.max(startIndex.current, index);
    onChange(SECTIONS.slice(from, to + 1).map((section) => section.id));
  }

  function fingerUp() {
    if (dragged.current) return;

    // It was a tap: switch this segment on / off.
    const id = SECTIONS[startIndex.current].id;
    if (selected.includes(id)) {
      onChange(selected.filter((other) => other !== id));
    } else {
      onChange([...selected, id]);
    }
  }

  return (
    <div>
      <div
        style={{ ...styles.bar, borderColor: theme.border }}
        onPointerDown={fingerDown}
        onPointerMove={fingerMove}
        onPointerUp={fingerUp}
      >
        {SECTIONS.map((section, index) => (
          <div
            key={section.id}
            style={{
              ...styles.segment,
              flex: section.minutes,
              backgroundColor: theme.card,
              borderColor: theme.border,
              ...(index > 0 && styles.separator),
            }}
          >
            {selected.includes(section.id) && <MovingStripes />}
          </div>
        ))}
      </div>

      <div style={styles.labels}>
        {SECTIONS.map((section) => (
          <AppText key={section.id} style={{ ...styles.label, flex: section.minutes }}>
            {section.label}
          </AppText>
        ))}
      </div>
    </div>
  );
}

const styles = {
  bar: {
    height: 48,
    borderWidth: 2,
    borderRadius: 6,
    overflow: 'hidden',
    flexDirection: 'row',
    touchAction: 'none', // the finger drags the selection, not the page
  },
  labels: {
    flexDirection: 'row',
  },
  segment: {
    overflow: 'hidden',
  },
  separator: {
    borderLeftWidth: 2,
  },
  label: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
  },
};
