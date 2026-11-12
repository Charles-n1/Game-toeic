import { createContext, useContext } from 'react';

// Every theme has the same keys, only the colors change.
export const THEMES = [
  {
    name: 'Light',
    background: '#ffffff', // page
    card: '#ffffff', // answers, inputs
    text: '#000000',
    border: '#000000',
    button: '#000000',
    buttonText: '#ffffff',
    statusBar: 'dark',
    dark: false, // dark background?
  },
  {
    name: 'Dark',
    background: '#121212',
    card: '#1e1e1e',
    text: '#ffffff',
    border: '#ffffff',
    button: '#ffffff',
    buttonText: '#000000',
    statusBar: 'light',
    dark: true,
  },
  {
    name: 'Neon',
    background: '#0d0221',
    card: '#1a0b3d',
    text: '#f5f5f5',
    border: '#ff2a6d',
    button: '#05d9e8',
    buttonText: '#0d0221',
    statusBar: 'light',
    dark: true,
  },
  {
    name: 'Sakura',
    background: '#fff0f5',
    card: '#ffffff',
    text: '#4a2040',
    border: '#ff8fb8',
    button: '#ff6fa3',
    buttonText: '#ffffff',
    statusBar: 'dark',
    dark: false,
  },
  {
    name: 'Sky', // like Sakura, but blue
    background: '#eaf4ff',
    card: '#ffffff',
    text: '#0a2a4a',
    border: '#7fbfff',
    button: '#007FFF',
    buttonText: '#ffffff',
    statusBar: 'dark',
    dark: false,
  },
  {
    name: 'PS5', // black console, white text, PlayStation blue
    background: '#000000',
    card: '#141414',
    text: '#ffffff',
    border: '#ffffff',
    button: '#0070D1',
    buttonText: '#ffffff',
    statusBar: 'light',
    dark: true,
  },
  {
    name: 'Game Boy', // the old green screen
    background: '#9bbc0f',
    card: '#8bac0f',
    text: '#0f380f',
    border: '#0f380f',
    button: '#306230',
    buttonText: '#9bbc0f',
    statusBar: 'dark',
    dark: false,
  },
  {
    name: 'Switch', // the Joy-Con colors: neon red + neon blue
    background: '#f2f2f2',
    card: '#ffffff',
    text: '#2d2d2d',
    border: '#00C3E3',
    button: '#FF4554',
    buttonText: '#ffffff',
    statusBar: 'dark',
    dark: false,
  },
];

// A "global variable" every component can read, without passing it as a prop.
export const ThemeContext = createContext(THEMES[0]);

export function useTheme() {
  return useContext(ThemeContext);
}
