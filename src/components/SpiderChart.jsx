import { useTheme } from '../themes';
import { CATEGORIES, successPercent, colorOf } from '../data/categories';

const GRID_LEVELS = [0.25, 0.5, 0.75, 1]; // the 4 grey polygons
const LABEL_GAP = 12; // space between the chart and a label
const LINE_HEIGHT = 17;
const LABEL_SPACE = 52; // room above and below the chart for the labels
const HALF_STEP = Math.PI / CATEGORIES.length; // half the angle between two axes
const CHAR_WIDTH = 8.5; // about the width of one letter of a label (to make its clickable zone)

// ---------- Geometry ----------

// Angle of axis number i: the first one points up, then clockwise.
function angleOf(index) {
  return -Math.PI / 2 + (index * 2 * Math.PI) / CATEGORIES.length;
}

// The point at `distance` pixels from the center, in the direction `angle`.
function pointAtAngle(center, angle, distance) {
  return { x: center.x + distance * Math.cos(angle), y: center.y + distance * Math.sin(angle) };
}

// Same, on axis number i.
function pointAt(center, index, distance) {
  return pointAtAngle(center, angleOf(index), distance);
}

// [{x, y}, ...] -> "x1,y1 x2,y2 ..." : the format <polygon points> wants.
function toPoints(list) {
  return list.map((point) => point.x + ',' + point.y).join(' ');
}

// "#00B8D4" -> the same color, but darker: red, green and blue x 0.7.
function darker(hex) {
  const parts = [hex.slice(1, 3), hex.slice(3, 5), hex.slice(5, 7)]; // "00", "B8", "D4"
  const darkParts = parts.map((part) => Math.round(parseInt(part, 16) * 0.7)); // hex -> number, x 0.7
  return 'rgb(' + darkParts.join(',') + ')';
}

// ---------- Pieces of the chart ----------

// Colored area: center -> halfway to the previous axis -> the point -> halfway to the next axis.
// The 2 side corners are on the "halfway" lines, at the average of the 2 distances:
// even if a neighbor is at 0%, the petal keeps a real shape (it never becomes a flat line).
function Petal({ item, items, center }) {
  const count = items.length;
  const previous = items[(item.index - 1 + count) % count];
  const next = items[(item.index + 1) % count];
  const angle = angleOf(item.index);
  const shape = [
    center,
    pointAtAngle(center, angle - HALF_STEP, ((item.distance + previous.distance) / 2) * Math.cos(HALF_STEP)),
    item.point,
    pointAtAngle(center, angle + HALF_STEP, ((item.distance + next.distance) / 2) * Math.cos(HALF_STEP)),
  ];

  return <polygon points={toPoints(shape)} fill={item.color} fillOpacity={0.35} />;
}

// "Name" on line 1, "XX%" on line 2, outside the chart.
// onSelect (optional): the label can be clicked -> onSelect(category id).
function Label({ item, center, radius, onSelect }) {
  const angle = angleOf(item.index);
  const spot = pointAt(center, item.index, radius + LABEL_GAP);
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  // Horizontal: centered at the top / bottom, left or right aligned on the sides.
  let anchor = 'middle';
  if (cos > 0.2) anchor = 'start';
  if (cos < -0.2) anchor = 'end';

  // Vertical: above the spot at the top, under it at the bottom, centered on the sides.
  let top = spot.y - LINE_HEIGHT;
  if (sin < -0.7) top = spot.y - 2 * LINE_HEIGHT;
  if (sin > 0.7) top = spot.y;

  // Not asked in this session: "–" instead of "0%", and the name a bit faded.
  const textStyle = {
    x: spot.x,
    textAnchor: anchor,
    fontSize: 14,
    fontWeight: '500',
    fill: item.color,
    fillOpacity: item.unplayed ? 0.45 : 1,
  };
  const texts = (
    <>
      <text {...textStyle} y={top + 13}>
        {item.short}
      </text>
      {/* ONE string ("0%"), not {percent}% : 2 pieces would be aligned separately and overlap */}
      <text {...textStyle} y={top + 13 + LINE_HEIGHT}>
        {item.unplayed ? '–' : item.percent + '%'}
      </text>
    </>
  );
  if (!onSelect) return texts;

  // Clickable: an invisible box around the 2 lines, a bit bigger (easier to hit with a finger).
  const width = Math.max(item.short.length, 4) * CHAR_WIDTH + 12;
  let left = spot.x - width / 2;
  if (anchor === 'start') left = spot.x - 6;
  if (anchor === 'end') left = spot.x - width + 6;
  return (
    <g onClick={() => onSelect(item.id)} role="button" aria-label={'learn ' + item.name} style={styles.clickable}>
      <rect x={left} y={top - 4} width={width} height={2 * LINE_HEIGHT + 10} fill="transparent" />
      {texts}
    </g>
  );
}

// ---------- The chart ----------

// stats: { wordForms: { good: 4, bad: 1 }, ... }
// markUnplayed: a category without any answer shows "–" (not "0%"): for the chart of one session.
// onSelectCategory (optional): the names can be clicked -> onSelectCategory(category id).
export default function SpiderChart({ stats, width, showAllNames, markUnplayed, onSelectCategory }) {
  const theme = useTheme();
  const radius = width * 0.32;
  const center = { x: width / 2, y: radius + LABEL_SPACE };
  const height = 2 * radius + 2 * LABEL_SPACE;

  // Everything we need to draw each category.
  const items = CATEGORIES.map((category, index) => {
    const percent = successPercent(stats, category.id);
    const distance = (radius * percent) / 100;
    const counts = stats[category.id];
    return {
      ...category,
      index: index,
      percent: percent,
      unplayed: !!markUnplayed && (!counts || counts.good + counts.bad === 0),
      color: colorOf(category, theme),
      distance: distance,
      point: pointAt(center, index, distance),
    };
  });

  // Drawn in this order: the last ones are on top. (Normal web <svg>: no library needed.)
  return (
    // viewBox: we draw on a "width x height" sheet, and the browser resizes it to fit the screen.
    <svg
      viewBox={'0 0 ' + width + ' ' + height}
      style={{ width: '100%', maxWidth: width, height: 'auto', alignSelf: 'center' }}
    >
      {GRID_LEVELS.map((level) => (
        <polygon
          key={level}
          points={toPoints(CATEGORIES.map((category, index) => pointAt(center, index, radius * level)))}
          fill="none"
          stroke="#D9D9D9"
          strokeWidth={1}
        />
      ))}

      {items.map((item) => (
        <Petal key={item.id} item={item} items={items} center={center} />
      ))}

      {items.map((item) => {
        const edge = pointAt(center, item.index, radius);
        return (
          <line
            key={item.id}
            x1={center.x}
            y1={center.y}
            x2={edge.x}
            y2={edge.y}
            stroke={item.color}
            strokeOpacity={0.6} // see-through, but less than the petals (0.35)
            strokeWidth={2.5}
            strokeLinecap="round"
          />
        );
      })}

      {/* The dots: one color, a darker version of the category color. Not at 0%: else they pile up in the center */}
      {items
        .filter((item) => item.percent > 0)
        .map((item) => (
          <circle key={item.id} cx={item.point.x} cy={item.point.y} r={4.5} fill={darker(item.color)} />
        ))}

      {/* The names: only when the eye is on */}
      {showAllNames &&
        items.map((item) => (
          <Label key={item.id} item={item} center={center} radius={radius} onSelect={onSelectCategory} />
        ))}
    </svg>
  );
}

const styles = {
  clickable: {
    cursor: 'pointer',
  },
};
