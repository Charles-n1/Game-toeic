// Non-human peoples & cultural traits across the realms of Lexia.

export const RACES = {
  human: { id: 'human', name: 'Human', dialect: 'common', desc: 'Adaptable builders and scholars across the central kingdoms.' },
  elf: { id: 'elf', name: 'Sylvan Elf', dialect: 'elvish', desc: 'Long-lived forest archers and lorekeepers of Verdania and the outer woods.' },
  dwarf: { id: 'dwarf', name: 'Mountain Dwarf', dialect: 'dwarvish', desc: 'Master smiths and delve-miners of Frosthold’s peaks.' },
  beastkin: { id: 'beastkin', name: 'Beastkin', dialect: 'beast', desc: 'Keen-eared caravan scouts and sailors of Kharsa and the Free Isles.' },
  demon: { id: 'demon', name: 'Highborn Demon', dialect: 'archaic', desc: 'Horned heirs of ancient Silence magic, feared yet formidable.' },
};

export function raceMixForVillage(village, biome = null) {
  const k = village?.kingdom;
  if (k === 'verdania') return ['elf', 'elf', 'human'];
  if (k === 'frosthold') return ['dwarf', 'dwarf', 'human'];
  if (k === 'kharsa') return ['beastkin', 'beastkin', 'human'];
  if (k === 'isles') return ['beastkin', 'elf', 'human'];
  if (biome === 'forest') return ['human', 'elf'];
  if (biome === 'mountain') return ['human', 'dwarf'];
  return ['human'];
}

export function applyRaceToLook(look, raceId) {
  const out = { ...look, race: raceId || 'human' };
  if (raceId === 'elf') {
    out.elfEars = true;
    out.beard = false;
  } else if (raceId === 'dwarf') {
    out.burly = true;
    out.beard = look.sex === 'woman' ? false : true;
    out.dwarfBrow = true;
  } else if (raceId === 'beastkin') {
    out.ears = true;
    out.tail = true;
  } else if (raceId === 'demon') {
    out.horns = true;
  }
  return out;
}
