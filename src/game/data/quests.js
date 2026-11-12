// The side quests: someone asks for help. Helping gives Lexis, friendship, and happiness to the village.
// giver: who asks. needs: what must be done:
//   { kill: 'slime', count: 5 }   -> defeat monsters of this species (counted from the moment the quest starts)
//   { item: 'carrot', count: 3 }  -> bring items (they are taken when the quest ends)
//   { visit: 'port' }             -> go to a zone
// minDay: the quest is offered from this day.
export const QUESTS = [
  { id: 'herbs', giver: 'aria', title: 'Flowers for the clinic', ask: 'I need flowers for my medicine. Could you bring me 3?', thanks: 'They are perfect. Like you. I mean... thank you!', needs: { item: 'flower', count: 3 }, lexis: 25, minDay: 1 },
  { id: 'slimes', giver: 'garrick', title: 'Slimes at the gate', ask: 'Slimes keep coming to the gate. Defeat 6 of them for me.', thanks: 'Good work. The gate is quieter.', needs: { kill: 'slime', count: 6 }, lexis: 40, minDay: 1 },
  { id: 'carrots', giver: 'bea', title: 'Carrot cake', ask: 'A cake without carrots is just bread. Bring me 4 carrots, child.', thanks: 'Here, the first slice is yours.', needs: { item: 'carrot', count: 4 }, lexis: 45, gift: 'bread', minDay: 1 },
  { id: 'wolves', giver: 'hana', title: 'Wolves near the field', ask: 'Wolves come out of Verbwood and scare my carrots. Defeat 4, please!', thanks: 'The carrots say thank you. I say it too!', needs: { kill: 'wolf', count: 4 }, lexis: 70, minDay: 2 },
  { id: 'letter', giver: 'garrick', title: 'A letter to the coast', ask: 'My wife Rosa keeps the inn of Port Syntax. Go there... just tell me if the lights are on.', thanks: 'The lights are on. Good. Good.', needs: { visit: 'port' }, lexis: 60, minDay: 2 },
  { id: 'coins', giver: 'yuki', title: 'Old coins, old words', ask: 'Old coins carry words nobody writes anymore. Dig, and bring me 2.', thanks: 'Look: "hope" was spelled with two p. How greedy.', needs: { item: 'oldCoin', count: 2 }, lexis: 90, minDay: 3 },
  { id: 'bats', giver: 'tomo', title: 'Monsters under the bed', ask: 'The bats scream at night and I can not sleep. Beat 5 of them? Pleeease?', thanks: 'You are the best hero. Better than the old one!', needs: { kill: 'bat', count: 5 }, lexis: 50, minDay: 3 },
  { id: 'gem', giver: 'mira', title: 'A stone for the forge', ask: 'I need a gem to finish something. Do not ask what. Bring me 1.', thanks: 'It is NOT a ring. Stop smiling.', needs: { item: 'gem', count: 1 }, lexis: 150, minDay: 4 },
  { id: 'golems', giver: 'selene', title: 'Stone on the road', ask: 'Golems block the mountain road. Break 3 of them and I will respect you.', thanks: 'Respect given. Do not waste it.', needs: { kill: 'golem', count: 3 }, lexis: 220, minDay: 5 },
  { id: 'imps', giver: 'luna', title: 'Thieves of words', ask: 'Imps stole my best map. Defeat 3 of them in the Silent Lands.', thanks: 'Nya! ...I said nothing. Here, your pay.', needs: { kill: 'imp', count: 3 }, lexis: 300, minDay: 6 },
  { id: 'fishbread', giver: 'kai', title: 'Bread for the boat', ask: 'Three days at sea, and no bread. Bring me 3 from Lexia?', thanks: 'Old Bea still bakes like a goddess.', needs: { item: 'bread', count: 3 }, lexis: 60, minDay: 2 },
  { id: 'nyxflower', giver: 'nyx', title: 'Something that grows', ask: 'Nothing grows in the north. Bring me 2 flowers. I want to see them die slowly, like normal things.', thanks: 'They smell like... a voice. Thank you.', needs: { item: 'flower', count: 2 }, lexis: 40, minDay: 1 },
];

export function questOf(id) {
  return QUESTS.find((quest) => quest.id === id);
}
