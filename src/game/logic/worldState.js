import { setOverrides, setDynamic } from '../world/map';
import { villageBridges } from './villages';
import { villageWalls } from './walls';
import { puzzleProps } from './puzzles';
import { furnitureProps } from './home';

// The map is built once (world/map.js), but a game changes it: the walls and the bridges of the villages,
// the gates and the boulders of the puzzles, the furniture of the home.
// Called when a game opens, and each time one of these things changes.
export function refreshWorld(game) {
  setOverrides(villageBridges(game));
  const visitProps = game.run && game.run.visitHouse ? game.run.visitHouse.props : [];
  setDynamic([...villageWalls(game), ...puzzleProps(game), ...furnitureProps(game), ...visitProps], []);
}
