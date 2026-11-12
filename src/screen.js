// The width of the app. (React Native: Dimensions.get('window').width)
// On a computer, the app stays phone-sized (520px max), in the middle of the screen.
export const MAX_APP_WIDTH = 520;
export const SCREEN_WIDTH = Math.min(window.innerWidth, MAX_APP_WIDTH);
