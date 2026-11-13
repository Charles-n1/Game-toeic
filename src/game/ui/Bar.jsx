// A bar filled from 0 to 1 (HP, MP, XP, the time left to answer...), with a dark frame.
export default function Bar({ value, color, height = 10 }) {
  const percent = Math.min(100, Math.max(0, value * 100));
  return (
    <div className="bar" style={{ height: height }}>
      <div className="bar-fill" style={{ width: percent + '%', backgroundColor: color }} />
    </div>
  );
}
