import Sheet from './Sheet';
import useCanvas from './useCanvas';
import { drawWorldMap } from '../draw/minimap';

const MAP_NAMES = ['No map: you only guess the shape of the land', 'Village Map', 'Region Map', 'Treasure Map'];
const NEXT_HINT = [
  'Luna sells maps in Port Syntax (follow the road east, then south).',
  'The Region Map shows the dungeons.',
  'The Treasure Map shows every buried treasure.',
  'You own the best map. Yellow dots = treasures to dig.',
];

// The big map of the world. Its precision depends on the map the player bought.
export default function MapScreen({ game, onClose }) {
  const level = game.player.mapLevel;
  const canvasRef = useCanvas((ctx, width, height, time) => drawWorldMap(ctx, game, width, time));

  return (
    <Sheet title="Map" onClose={onClose}>
      <canvas ref={canvasRef} style={styles.map} />
      <span style={styles.name}>🗺️ {MAP_NAMES[level]}</span>
      <span className="small">{NEXT_HINT[level]}</span>
      <span className="small" style={styles.legend}>
        🔴 you · 🟡 village · 🔴 (big) dungeon · 🟡 (small) treasure
      </span>
    </Sheet>
  );
}

const styles = {
  map: {
    width: '100%',
    aspectRatio: '1',
    borderRadius: 12,
    border: '2px solid #f2d16b',
    marginTop: 12,
  },
  name: {
    fontWeight: 'bold',
    marginTop: 10,
  },
  legend: {
    marginTop: 6,
  },
};
