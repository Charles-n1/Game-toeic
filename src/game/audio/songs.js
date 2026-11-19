// The music of the game, written like an old tracker: each word is an eighth note.
//   'C5' = a note (name + octave), '.' = silence, '-' = the note before goes on,
//   'K' = a kick drum, 'H' = a hi-hat (only in the 'drums' voices).
// bpm: the speed. Each voice: a wave ('square', 'triangle', 'sawtooth' or 'drums'), a volume, the notes.
// Every voice of a song has 32 eighth notes: they loop together.

export const SONGS = {
  // Calm and warm: the villages.
  village: {
    bpm: 100,
    voices: [
      { wave: 'triangle', volume: 0.2, notes: 'E5 - G5 - C6 - B5 A5 G5 - E5 - D5 - C5 - D5 - E5 - G5 - A5 - G5 - E5 - D5 - - -' },
      { wave: 'square', volume: 0.05, notes: 'C3 . G3 . C3 . G3 . A2 . E3 . A2 . E3 . F2 . C3 . F2 . C3 . G2 . D3 . G2 . D3 .' },
    ],
  },
  // Adventure: the wild lands, by day.
  exploration: {
    bpm: 128,
    voices: [
      { wave: 'square', volume: 0.06, notes: 'G4 . B4 D5 G5 - F#5 E5 D5 - B4 . C5 D5 E5 - D5 . B4 G4 A4 - B4 C5 D5 - - . C5 B4 A4 -' },
      { wave: 'triangle', volume: 0.16, notes: 'G2 . D3 . G2 . D3 . C3 . G3 . C3 . G3 . E3 . B2 . E3 . B2 . D3 . A2 . D3 . F#3 .' },
      { wave: 'drums', volume: 0.5, notes: 'K . . . H . . . K . K . H . . . K . . . H . . . K . K . H . H .' },
    ],
  },
  // Soft and a bit sad: the night.
  night: {
    bpm: 76,
    voices: [
      { wave: 'triangle', volume: 0.16, notes: 'A4 - C5 - E5 - - - D5 - C5 - B4 - - - C5 - E5 - A5 - - - G5 - E5 - D5 - - -' },
      { wave: 'triangle', volume: 0.09, notes: 'A2 - - - E3 - - - F2 - - - G2 - - - A2 - - - E3 - - - F2 - - - E2 - - -' },
    ],
  },
  // Fast: a fight.
  fight: {
    bpm: 152,
    voices: [
      { wave: 'square', volume: 0.06, notes: 'A4 C5 E5 C5 A5 - G5 E5 F5 E5 D5 C5 B4 - G4 B4 A4 C5 E5 C5 A5 - B5 C6 B5 A5 G5 E5 A5 - - -' },
      { wave: 'sawtooth', volume: 0.04, notes: 'A2 A2 A3 A2 A2 A2 A3 A2 F2 F2 F3 F2 G2 G2 G3 G2 A2 A2 A3 A2 A2 A2 A3 A2 F2 F2 G2 G2 E2 E2 E3 E2' },
      { wave: 'drums', volume: 0.6, notes: 'K . H . K K H . K . H . K K H H K . H . K K H . K . H . K K H H' },
    ],
  },
  // Heavy: a boss.
  boss: {
    bpm: 140,
    voices: [
      { wave: 'sawtooth', volume: 0.04, notes: 'D5 - - A4 D5 - F5 - E5 - D5 - C#5 - A4 - D5 - - A4 D5 - F5 - G5 - A5 - G5 F5 E5 C#5' },
      { wave: 'square', volume: 0.06, notes: 'D2 D2 D3 D2 D2 D2 D3 D2 A#1 A#1 A#2 A#1 A1 A1 A2 A1 D2 D2 D3 D2 D2 D2 D3 D2 A#1 A#1 A#2 A#1 A1 A1 A2 A1' },
      { wave: 'drums', volume: 0.7, notes: 'K . H K . K H . K . H K K . H H K . H K . K H . K . H K K . H H' },
    ],
  },
  // Urgent: the village is attacked.
  raid: {
    bpm: 172,
    voices: [
      { wave: 'square', volume: 0.06, notes: 'E5 . E5 . G5 . E5 . F#5 . D5 . E5 - - . E5 . E5 . B5 . A5 . G5 . F#5 . E5 - - .' },
      { wave: 'sawtooth', volume: 0.04, notes: 'E2 E3 E2 E3 E2 E3 E2 E3 C2 C3 C2 C3 D2 D3 D2 D3 E2 E3 E2 E3 E2 E3 E2 E3 C2 C3 C2 C3 D2 D3 D2 D3' },
      { wave: 'drums', volume: 0.6, notes: 'K H K H K H K K K H K H K H K K K H K H K H K K K H K H K H K K' },
    ],
  },
  // Slow and sad: a death, the end of a life.
  sad: {
    bpm: 66,
    voices: [
      { wave: 'triangle', volume: 0.18, notes: 'F5 - E5 - D5 - - - A4 - - - D5 - E5 - F5 - G5 - E5 - - - C5 - D5 - - - - -' },
      { wave: 'triangle', volume: 0.09, notes: 'D3 - - - A2 - - - A#2 - - - F2 - - - G2 - - - A2 - - - D3 - - - - - - -' },
    ],
  },
  // Triumphant: the title screen and the endings.
  ending: {
    bpm: 112,
    voices: [
      { wave: 'square', volume: 0.06, notes: 'C5 - E5 - G5 - C6 - B5 - G5 - A5 - - - F5 - A5 - C6 - D6 - C6 - - - - -' },
      { wave: 'triangle', volume: 0.16, notes: 'C3 . G3 . C3 . G3 . E3 . B2 . E3 . B2 . F3 . C3 . F3 . C3 . G2 . D3 . G2 . G3 .' },
      { wave: 'drums', volume: 0.4, notes: 'K . . . H . . . K . . . H . . . K . . . H . . . K . K . H . H .' },
    ],
  },
  // Character theme — Aria: gentle healing clinic harp.
  aria: {
    bpm: 78,
    voices: [
      { wave: 'triangle', volume: 0.16, notes: 'A4 - C5 - E5 - D5 - C5 - B4 - A4 - - - G4 - B4 - D5 - C5 - B4 - - - A4 - - -' },
      { wave: 'sine', volume: 0.1, notes: 'A2 . E3 . A2 . E3 . G2 . D3 . G2 . D3 . F2 . C3 . F2 . C3 . E2 . B2 . A2 - - -' },
    ],
  },
  // Character theme — Nyx: twilight minor starlight motif.
  nyx: {
    bpm: 84,
    voices: [
      { wave: 'sine', volume: 0.14, notes: 'D5 . F5 . A5 - G5 . F5 . E5 - D5 - - . C5 . E5 . G5 - F5 . E5 . D5 - - .' },
      { wave: 'triangle', volume: 0.1, notes: 'D3 - - - A#2 - - - C3 - - - D3 - - - A#2 - - - C3 - - - D3 - - - - - - -' },
    ],
  },
  // Character & boss motif — Solecis: haunting hollow silence echo.
  solecis: {
    bpm: 58,
    voices: [
      { wave: 'sine', volume: 0.12, notes: 'C4 - - - - - G3 - - - - - D#4 - - - C4 - - - - - - - - - - - - - - -' },
      { wave: 'triangle', volume: 0.08, notes: 'C2 - - - - - - - G2 - - - - - - - C2 - - - - - - - - - - - - - - -' },
    ],
  },
  // Bustling weekly market song.
  market: {
    bpm: 132,
    voices: [
      { wave: 'triangle', volume: 0.18, notes: 'G5 A5 G5 E5 D5 C5 D5 E5 G5 - E5 G5 A5 G5 E5 D5 C5 E5 G5 E5 D5 C5 D5 E5 C5 - - - G5 E5 D5 .' },
      { wave: 'square', volume: 0.05, notes: 'C3 . G3 . C3 . G3 . F3 . C3 . G3 . D3 . C3 . G3 . F3 . G3 . C3 . G3 . C3 - - .' },
    ],
  },
  // Warm cozy tavern & inn hearth tune (#91).
  tavern: {
    bpm: 108,
    voices: [
      { wave: 'triangle', volume: 0.17, notes: 'D5 - F5 E5 D5 A4 C5 - D5 - E5 F5 G5 E5 D5 - F5 G5 A5 F5 E5 D5 C5 - D5 - A4 - D5 - - .' },
      { wave: 'sine', volume: 0.11, notes: 'D3 . A3 . D3 . A3 . C3 . G3 . C3 . G3 . A#2 . F3 . A2 . E3 . D3 . A3 . D3 - - .' },
    ],
  },
};
