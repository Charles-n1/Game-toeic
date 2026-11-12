// A thin bar filled from 0 to 1 (mana, XP, the time left to answer...).
export default function Bar({ value, color, height = 8 }) {
  const percent = Math.min(100, Math.max(0, value * 100));
  return (
    <div className="bar" style={{ height: height }}>
      <div className="bar-fill" style={{ width: percent + '%', backgroundColor: color }} />
    </div>
  );
}
