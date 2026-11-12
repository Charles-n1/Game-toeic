// 125 -> "2:05"
export function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60);
  return minutes + ':' + String(rest).padStart(2, '0');
}

// "2:05" -> 125. Wrong format -> null.
export function parseTime(text) {
  const match = text.match(/^(\d+):([0-5]\d)$/); // mm:ss, seconds from 00 to 59
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}
