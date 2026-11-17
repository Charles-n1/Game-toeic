import { say, notify } from './messages';
import { cue } from './cues';
import { startFight } from './fight';
import { makeDuel } from './duels';

// World languages & rune deciphering: an isekai hero learns the tongues and ancient scripts of Lexia.

export const WORLD_LANGUAGES = [
  { id: 'runes', name: 'Ancient Runes', hint: 'Dungeon obelisks, seals & Solecis tablets' },
  { id: 'elvish', name: 'Sylvan Elvish', hint: 'Verdania bowyers, groves & forest elders' },
  { id: 'dwarvish', name: 'Khazad Dwarvish', hint: 'Frosthold master smiths & deep forges' },
  { id: 'beast', name: 'Beastkin Cant', hint: 'Kharsa dunes, caravans & sea ports' },
  { id: 'archaic', name: 'Abyssal Archaic', hint: 'Demon Strongholds & Lost Hero scripts' },
];

const GLYPHS = ['ᚱ', 'ᚦ', 'ᚨ', 'ᛟ', 'ᛉ', 'ᚲ', 'ᛗ', 'ᛞ'];

export function firstLanguages() {
  return { runes: 15, elvish: 10, dwarvish: 10, beast: 10, archaic: 5 };
}

export function ensureLanguages(game) {
  if (!game.languages || typeof game.languages !== 'object') game.languages = firstLanguages();
  for (const lang of WORLD_LANGUAGES) {
    if (typeof game.languages[lang.id] !== 'number') game.languages[lang.id] = lang.id === 'runes' ? 15 : 10;
    game.languages[lang.id] = Math.max(0, Math.min(100, Math.round(game.languages[lang.id])));
  }
  return game.languages;
}

export function languageLevel(game, langId) {
  return ensureLanguages(game)[langId] || 0;
}

export function gainLanguage(game, langId, amount = 5, silent = false) {
  const langs = ensureLanguages(game);
  if (langs[langId] === undefined) return 0;
  const before = langs[langId];
  langs[langId] = Math.min(100, before + Math.round(amount));
  const label = WORLD_LANGUAGES.find((l) => l.id === langId)?.name || langId;
  if (!silent && langs[langId] > before) {
    if (before < 40 && langs[langId] >= 40) notify(game, '🗣️ Partial fluency in ' + label + ' (' + langs[langId] + '%)!', '#9fd8ff');
    else if (before < 75 && langs[langId] >= 75) notify(game, '📖 Mastered ' + label + ' (' + langs[langId] + '%)! Cultural trade & secrets unlocked.', '#7cfc9a');
  }
  return langs[langId];
}

// Scrambles unreadable portions of a non-human/ancient phrase proportionally to hero fluency.
export function translateForHero(game, langId, plainText) {
  const pct = languageLevel(game, langId);
  if (pct >= 75) return plainText;
  const words = String(plainText).split(' ');
  const revealed = words.map((w, i) => {
    const hash = ((w.length * 13 + i * 7) % 100);
    if (hash < pct + 18) return w;
    return GLYPHS[(i + w.length) % GLYPHS.length].repeat(Math.min(4, Math.max(2, Math.floor(w.length / 2))));
  });
  return revealed.join(' ') + ' [' + Math.round(pct) + '% ' + (WORLD_LANGUAGES.find((l) => l.id === langId)?.name || langId) + ']';
}

export function culturalPriceDiscount(game, raceId) {
  if (raceId === 'elf' && languageLevel(game, 'elvish') >= 60) return 0.9;
  if (raceId === 'dwarf' && languageLevel(game, 'dwarvish') >= 55) return 0.85;
  if (raceId === 'beastkin' && languageLevel(game, 'beast') >= 60) return 0.9;
  return 1;
}

export function studyLanguageChoices(game, npc) {
  const teachesLang = npc.teachesLanguage || (npc.race === 'elf' ? 'elvish' : npc.race === 'dwarf' ? 'dwarvish' : npc.race === 'beastkin' ? 'beast' : npc.job === 'scribe' ? 'runes' : null);
  if (!teachesLang) return null;
  const lang = WORLD_LANGUAGES.find((l) => l.id === teachesLang);
  if (!lang) return null;
  const cur = languageLevel(game, lang.id);
  if (cur >= 100) return null;
  return {
    label: 'Study ' + lang.name + ' (' + cur + '% -> +15%)',
    icon: 'book',
    run: () => {
      startFight(
        game,
        makeDuel(
          { id: npc.id, name: npc.name + ' (' + lang.name + ')' },
          {
            title: 'Language Lesson: ' + lang.name,
            category: 'vocabulary',
            tag: cur >= 60 ? 'hard' : 'normal',
            health: 4,
            speed: 11,
            onWin: () => {
              const after = gainLanguage(game, lang.id, 15, true);
              cue(game, 'levelUp');
              say(game, npc.id, ['Your ear for ' + lang.name + ' grows sharper! (' + cur + '% -> ' + after + '%).']);
            },
            onLose: () => say(game, npc.id, ['Listen closely to the roots of each word and try again tomorrow.']),
          }
        )
      );
    },
  };
}
