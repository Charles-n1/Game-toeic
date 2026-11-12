const HEART =
  'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z';

// One heart. filled: 0 = empty, 1 = half, 2 = full.
function Heart({ filled, size }) {
  const clip = filled === 1 ? 'inset(0 50% 0 0)' : 'none'; // half: only the left side is red
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path d={HEART} fill="rgba(255, 255, 255, 0.22)" />
      {filled > 0 && <path d={HEART} fill="#ff4d6d" style={{ clipPath: clip }} />}
    </svg>
  );
}

// A row of hearts. value and max are in HALF hearts (value 5, max 10 = 2 and a half hearts out of 5).
export default function Hearts({ value, max, size = 18 }) {
  const hearts = [];
  for (let i = 0; i < Math.ceil(max / 2); i++) {
    const filled = Math.min(2, Math.max(0, value - i * 2));
    hearts.push(<Heart key={i} filled={filled} size={size} />);
  }
  return <div className="row wrap">{hearts}</div>;
}
