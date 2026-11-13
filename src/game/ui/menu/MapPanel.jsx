import { useEffect, useRef, useState } from 'react';
import useCanvas from '../useCanvas';
import Bar from '../Bar';
import Portrait from '../Portrait';
import PixelIcon from '../PixelIcon';
import { HERO_LOOK, npcOf } from '../../data/npcs';
import { drawLandscape } from '../../draw/scene';
import { drawWorldMap, firstView, tilesPerPixel, clampView } from '../../draw/worldmap';
import { placeHere, placeOf, mainQuestMark, sideQuestMarks } from '../../logic/places';
import { maxHealth, maxMana } from '../../logic/player';
import { zoneAt } from '../../data/zones';

const ZOOMS = [1, 2, 4];
const MAP_NAMES = ['No map: you only know where you went', 'Village Map', 'Region Map', 'Treasure Map'];
const NEXT_HINT = [
  'Luna sells maps in Port Syntax: the Village Map shows the villages and the roads.',
  'The Region Map shows the whole land.',
  'The Treasure Map shows every buried treasure.',
  'You own the best map: every treasure is marked.',
];
const LEGEND = [
  ['you', 'You'],
  ['mainQuest', 'Main quest'],
  ['sideQuest', 'Side quest'],
  ['town', 'Town'],
  ['dungeon', 'Dungeon'],
  ['shop', 'Shop'],
  ['inn', 'Inn'],
  ['treasure', 'Treasure'],
  ['bridge', 'Bridge'],
  ['blocked', 'Blocked path'],
];

// The map itself: drag it to move, tap a name to see the place, + and − to zoom.
function MapView({ game, view, selectedId, onSelect }) {
  const boxes = useRef([]); // the names drawn on the map, to know which one is tapped
  const size = useRef(0);
  const drag = useRef(null); // { x, y, moved } while a finger is on the map
  const canvasRef = useCanvas((ctx, width, height, time) => {
    size.current = width;
    boxes.current = drawWorldMap(ctx, game, view.current, width, time, selectedId);
  });

  function press(event) {
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { x: event.clientX, y: event.clientY, moved: false };
  }

  function move(event) {
    if (!drag.current) return;
    const dx = event.clientX - drag.current.x;
    const dy = event.clientY - drag.current.y;
    if (Math.hypot(dx, dy) > 3) drag.current.moved = true;
    const k = tilesPerPixel(view.current, size.current);
    view.current = clampView({ ...view.current, cx: view.current.cx - dx * k, cy: view.current.cy - dy * k });
    drag.current.x = event.clientX;
    drag.current.y = event.clientY;
  }

  // A tap (not a drag): the name under the finger, if any.
  function release(event) {
    const wasTap = drag.current && !drag.current.moved;
    drag.current = null;
    if (!wasTap) return;
    const box = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - box.left;
    const y = event.clientY - box.top;
    const hit = boxes.current.find((label) => x >= label.x && x <= label.x + label.w && y >= label.y && y <= label.y + label.h);
    if (hit) onSelect(hit.place);
  }

  return (
    <canvas ref={canvasRef} style={styles.map} onPointerDown={press} onPointerMove={move} onPointerUp={release} onPointerCancel={() => (drag.current = null)} />
  );
}

// The small picture of the selected place: the real world, seen from above.
function Thumbnail({ place }) {
  const canvasRef = useCanvas((ctx, width, height, time) => drawLandscape(ctx, width, height, time, place, 1));
  return <canvas ref={canvasRef} style={styles.thumbnail} />;
}

function PlaceInfo({ place }) {
  return (
    <div className="row" style={styles.place}>
      <div className="portrait-box" style={styles.thumbnailBox}>
        <Thumbnail place={place} />
      </div>
      <div className="grow">
        <span className="gold" style={styles.placeName}>
          {place.name}
        </span>
        <span style={styles.placeText}>{place.text}</span>
      </div>
    </div>
  );
}

// The main quest (gold) and the side quests (blue). Tap one: the map goes there.
function QuestList({ game, onFocus }) {
  const main = mainQuestMark(game);
  const sides = sideQuestMarks(game);
  return (
    <>
      <span className="section">Quests</span>
      {main && (
        <button className="menu-item" onClick={() => onFocus(main)}>
          <PixelIcon name="mainQuest" size={14} />
          <span>{main.title}</span>
        </button>
      )}
      {sides.map((mark) => (
        <button key={mark.title} className="menu-item" onClick={() => onFocus(mark)}>
          <PixelIcon name="sideQuest" size={14} />
          <span>{mark.title}</span>
        </button>
      ))}
      {!main && sides.length === 0 && <span className="small">No quest right now.</span>}
    </>
  );
}

function PartyLine({ look, name, children }) {
  return (
    <div className="line">
      <Portrait look={look} size={32} />
      <div className="grow">
        <span>{name}</span>
        {children}
      </div>
    </div>
  );
}

// The hero and the friends who fight with them.
function Party({ game }) {
  const player = game.player;
  const extras = [player.soldiers > 0 && player.soldiers + ' obsidian soldier(s)', player.pet && 'the obsidian cat'].filter(Boolean);
  return (
    <div className="grow">
      <span className="section">Party</span>
      <PartyLine look={HERO_LOOK} name={'You · Lv. ' + player.level}>
        <Bar value={player.health / maxHealth(player)} color="#e8423f" height={7} />
        <Bar value={player.mana / maxMana(player)} color="#3a7bff" height={7} />
      </PartyLine>
      {player.party.map((id) => (
        <PartyLine key={id} look={npcOf(id).look} name={npcOf(id).name}>
          <span className="small">{npcOf(id).role} · Attack +10</span>
        </PartyLine>
      ))}
      {extras.length > 0 && <span className="small">With you: {extras.join(', ')}.</span>}
    </div>
  );
}

function Legend() {
  return (
    <div className="grow">
      <span className="section">Legend</span>
      {LEGEND.map(([icon, label]) => (
        <div key={icon} className="row" style={styles.legendLine}>
          <PixelIcon name={icon} size={14} />
          <span className="small">{label}</span>
        </div>
      ))}
    </div>
  );
}

// The world map window: the map, the selected place, the quests, the party and the legend.
export default function MapPanel({ game }) {
  const view = useRef(firstView(game)); // what part of the map is shown (changed by dragging, not by React)
  const [selected, setSelected] = useState(() => placeHere(game));
  const [zoomIndex, setZoomIndex] = useState(1);
  const level = game.player.mapLevel;

  useEffect(listenToKeys, []);

  // Keyboard: arrows move the map, + and − zoom.
  function listenToKeys() {
    function press(event) {
      const step = 24 / view.current.zoom; // tiles
      const moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
      if (moves[event.key]) {
        view.current = clampView({ ...view.current, cx: view.current.cx + moves[event.key][0], cy: view.current.cy + moves[event.key][1] });
      }
      if (event.key === '+' || event.key === '=') zoom(1);
      if (event.key === '-') zoom(-1);
    }
    window.addEventListener('keydown', press);
    return () => window.removeEventListener('keydown', press);
  }

  function zoom(direction) {
    setZoomIndex((index) => {
      const next = Math.min(ZOOMS.length - 1, Math.max(0, index + direction));
      view.current = clampView({ ...view.current, zoom: ZOOMS[next] });
      return next;
    });
  }

  // A quest was tapped: the map goes to it, and shows the place there.
  function focus(mark) {
    view.current = clampView({ ...view.current, cx: mark.x, cy: mark.y });
    setSelected(placeOf(zoneAt(mark.x, mark.y).id));
  }

  return (
    <>
      <div className="map-frame">
        <MapView game={game} view={view} selectedId={selected.id} onSelect={setSelected} />
        <div style={styles.zoom}>
          <button className="px-button" style={styles.zoomButton} disabled={zoomIndex === ZOOMS.length - 1} onClick={() => zoom(1)} aria-label="zoom in">
            +
          </button>
          <button className="px-button" style={styles.zoomButton} disabled={zoomIndex === 0} onClick={() => zoom(-1)} aria-label="zoom out">
            −
          </button>
        </div>
      </div>
      <div className="row small" style={styles.mapLevel}>
        <PixelIcon name={level > 0 ? 'map' + level : 'map'} size={14} />
        <span>
          {MAP_NAMES[level]}. {NEXT_HINT[level]}
        </span>
      </div>
      <PlaceInfo place={selected} />
      <QuestList game={game} onFocus={focus} />
      <div className="row" style={styles.columns}>
        <Party game={game} />
        <Legend />
      </div>
      <span className="small" style={styles.controls}>
        Drag: move · Tap a name: see the place · + / −: zoom
      </span>
    </>
  );
}

const styles = {
  map: {
    width: '100%',
    aspectRatio: '1',
    touchAction: 'none',
    cursor: 'grab',
  },
  zoom: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    gap: 6,
  },
  zoomButton: {
    width: 36,
    height: 36,
    padding: 0,
    fontSize: 22,
  },
  mapLevel: {
    gap: 6,
    marginTop: 8,
  },
  place: {
    gap: 12,
    marginTop: 12,
    alignItems: 'flex-start',
  },
  thumbnailBox: {
    width: 104,
    height: 104,
  },
  thumbnail: {
    width: 100,
    height: 100,
  },
  placeName: {
    fontSize: 20,
  },
  placeText: {
    marginTop: 4,
    lineHeight: '20px',
  },
  columns: {
    alignItems: 'flex-start',
    gap: 12,
  },
  legendLine: {
    gap: 8,
    marginBottom: 4,
  },
  controls: {
    marginTop: 12,
    textAlign: 'center',
  },
};
