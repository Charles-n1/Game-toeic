import { createContext, useContext } from 'react';
import { DEFAULT_OPTIONS } from '../logic/options';

// Every screen of the game can read the options with useGameOptions(): { options, changeOption(key, value) }.
// (Given by GamePage.)
export const GameOptionsContext = createContext({ options: DEFAULT_OPTIONS, changeOption: () => {} });

export function useGameOptions() {
  return useContext(GameOptionsContext);
}
