// The side quests: someone asks for help. Helping gives Lexis, friendship, and happiness to the village.
// giver: who asks. needs: what must be done:
//   { kill: 'slime', count: 5 }           -> defeat monsters of this species (counted from quest start)
//   { item: 'carrot', count: 3 }          -> bring items (taken when quest ends)
//   { items: ['bread','roastMeat'], count: 2 } -> bring any mix of listed foods/supplies
//   { repairWall: 'lexia', count: 2 }     -> renovate/reinforce village wall sections
//   { helped: true, count: 2 }            -> complete other villager side quests
//   { visit: 'port' }                     -> go to a zone
// minDay: the quest is offered from this day.
export const QUESTS = [
  { id: 'herbs', giver: 'aria', title: 'Flowers for the clinic', ask: 'I need flowers for my medicine. Could you bring me 3?', thanks: 'They are perfect. Like you. I mean... thank you!', needs: { item: 'flower', count: 3 }, lexis: 25, minDay: 1 },
  { id: 'clinicFood', giver: 'aria', title: 'Warm food for the clinic', ask: 'Our clinic patients need warm meals. Bring 2 Bread, Roast Meat, or Herb Stew?', thanks: 'You always think of everyone. Dinner is served!', needs: { items: ['bread', 'roastMeat', 'herbStew'], count: 2 }, lexis: 65, gift: 'healthPotion', minDay: 1 },
  { id: 'wallRenovation', giver: 'orin', title: "Renovate Eldermoor's walls", ask: 'Monsters wore down our outer fences. Walk along Eldermoor’s wall and renovate 2 wall sections!', thanks: 'Sturdy timber and dressed stone! The whole town sleeps safer.', needs: { repairWall: 'lexia', count: 2 }, lexis: 75, gift: 'bread', minDay: 1 },
  { id: 'neighborErrands', giver: 'orin', title: 'Help our villagers', ask: 'Every neighbor needs a hand this week. Complete 2 other villager quests around town.', thanks: 'You have become the heart of Eldermoor already.', needs: { helped: true, count: 2 }, lexis: 90, gift: 'herbStew', minDay: 2 },
  { id: 'fenceWood', giver: 'hana', title: 'Branches for farm fences', ask: 'Rabbits keep hopping into my carrot rows! Gather 5 branches from the woods to mend my fence?', thanks: 'These branches will hold them back nicely!', needs: { item: 'branch', count: 5 }, lexis: 45, gift: 'carrot', minDay: 1 },
  { id: 'slimes', giver: 'garrick', title: 'Slimes at the gate', ask: 'Slimes keep coming to the gate. Defeat 6 of them for me.', thanks: 'Good work. The gate is quieter.', needs: { kill: 'slime', count: 6 }, lexis: 40, minDay: 1 },
  { id: 'carrots', giver: 'bea', title: 'Carrot cake', ask: 'A cake without carrots is just bread. Bring me 4 carrots, child.', thanks: 'Here, the first slice is yours.', needs: { item: 'carrot', count: 4 }, lexis: 45, gift: 'bread', minDay: 1 },
  { id: 'bakerMeat', giver: 'bea', title: 'Pies for the watch', ask: 'The gate guards worked double shifts! Bring 3 raw or roasted meat for meat pies?', thanks: 'Mmm, savory pastry coming right out of the oven!', needs: { items: ['rawMeat', 'roastMeat'], count: 3 }, lexis: 60, gift: 'bread', minDay: 2 },
  { id: 'forgeFuel', giver: 'darius', title: 'Firewood for the forge', ask: 'My hearth died before dawn! Bring me 3 Firewood (craft from branches or buy).', thanks: 'Bellows roaring again! Here is a patch kit for your blade.', needs: { item: 'firewood', count: 3 }, lexis: 55, gift: 'repairKit', minDay: 1 },
  { id: 'wolves', giver: 'hana', title: 'Wolves near the field', ask: 'Wolves come out of the forests and scare my carrots. Defeat 4, please!', thanks: 'The carrots say thank you. I say it too!', needs: { kill: 'wolf', count: 4 }, lexis: 70, minDay: 2 },
  { id: 'letter', giver: 'garrick', title: 'A letter to the coast', ask: 'My wife Rosa keeps the inn of Seabridge. Go there... just tell me if the lights are on.', thanks: 'The lights are on. Good. Good.', needs: { visit: 'port' }, lexis: 60, minDay: 2 },
  { id: 'coins', giver: 'yuki', title: 'Old coins, old words', ask: 'Old coins carry words nobody writes anymore. Dig, and bring me 2.', thanks: 'Look: "hope" was spelled with two p. How greedy.', needs: { item: 'oldCoin', count: 2 }, lexis: 90, minDay: 3 },
  { id: 'bats', giver: 'tomo', title: 'Monsters under the bed', ask: 'The bats scream at night and I can not sleep. Beat 5 of them? Pleeease?', thanks: 'You are the best hero. Better than the old one!', needs: { kill: 'bat', count: 5 }, lexis: 50, minDay: 3 },
  { id: 'gem', giver: 'mira', title: 'A stone for the forge', ask: 'I need a gem to finish something. Do not ask what. Bring me 1.', thanks: 'It is NOT a ring. Stop smiling.', needs: { item: 'gem', count: 1 }, lexis: 150, minDay: 4 },
  { id: 'golems', giver: 'lyra', title: 'Stone on the road', ask: 'Stone golems walk among the Old Stones, east of Eldermoor. Break 3 of them and I will respect you.', thanks: 'Respect given. Do not waste it.', needs: { kill: 'stoneGolem', count: 3 }, lexis: 220, minDay: 5 },
  { id: 'imps', giver: 'rin', title: 'Thieves of words', ask: 'Cultists stole my best map. Defeat 3 of them: they hide in the desert and on the Silent Isle.', thanks: 'Nya! ...I said nothing. Here, your pay.', needs: { kill: 'cultist', count: 3 }, lexis: 300, minDay: 6 },
  { id: 'fishbread', giver: 'kai', title: 'Bread for the boat', ask: 'Three days at sea, and no bread. Bring me 3 from Eldermoor?', thanks: 'Old Bea still bakes like a goddess.', needs: { item: 'bread', count: 3 }, lexis: 60, minDay: 2 },
  { id: 'nyxflower', giver: 'nyx', title: 'Something that grows', ask: 'Nothing grows in the north. Bring me 2 flowers. I want to see them die slowly, like normal things.', thanks: 'They smell like... a voice. Thank you.', needs: { item: 'flower', count: 2 }, lexis: 40, minDay: 1 },
];

export function questOf(id) {
  return QUESTS.find((quest) => quest.id === id);
}
