// What the war leaves: weapons of the warbands, rewards of the caravans, bandit bounties.
// Same format as data/items.js (they are merged into ITEMS there).
export const WAR_ITEMS = {
  warTrophy: {
    name: 'War Trophy',
    icon: '🏆',
    kind: 'goods',
    sell: 45,
    text: 'A battered standard seized from a monster warband. Shops pay well for it.',
  },
  merchantKeepsake: {
    name: 'Merchant Keepsake',
    icon: '📿',
    kind: 'goods',
    sell: 30,
    text: 'A silver locket carried by a road trader.',
  },
  banditBadge: {
    name: 'Bandit Badge',
    icon: '🎖️',
    kind: 'goods',
    sell: 35,
    text: 'An iron clan clasp taken from defeated road bandits.',
  },
  sturdyPitchfork: {
    name: 'Sturdy Pitchfork',
    icon: '🔱',
    kind: 'tool',
    sell: 28,
    text: 'A steel-pronged pitchfork used by village defenders.',
  },
  warShield: {
    name: 'War Shield',
    icon: '🛡️',
    kind: 'tool',
    sell: 40,
    text: 'An oak-and-iron buckler etched with frontier runes.',
  },
  warRations: {
    name: 'War Rations',
    icon: '🥫',
    kind: 'food',
    food: 45,
    water: 15,
    heal: 25,
    sell: 14,
    text: 'Food +45, water +15, +25 HP',
  },
  caravanParcel: {
    name: 'Caravan Parcel',
    icon: '📦',
    kind: 'goods',
    sell: 55,
    text: 'Sealed merchant spices and cloth. High trade value.',
  },
  warHorn: {
    name: 'War Horn',
    icon: '📯',
    kind: 'tool',
    sell: 50,
    text: 'A brass frontier horn carried by militia commanders.',
  },
};
