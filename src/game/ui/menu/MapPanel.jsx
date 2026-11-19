import { useEffect, useRef, useState } from 'react';
import useCanvas from '../useCanvas';
import Bar from '../Bar';
import Portrait from '../Portrait';
import PixelIcon from '../PixelIcon';
import { npcOf } from '../../data/npcs';
import { drawLandscape } from '../../draw/scene';
import { drawWorldMap, firstView, tilesPerPixel, clampView, screenToTile } from '../../draw/worldmap';
import {
  placeHere,
  placeOf,
  mainQuestMark,
  sideQuestMarks,
  urgentQuestMarks,
  listBeacons,
  addMapBeacon,
  removeMapBeacon,
  togglePlaceBeacon,
  BEACON_COLORS,
} from '../../logic/places';
import { maxHealth, maxMana } from '../../logic/player';
import { zoneAt } from '../../data/zones';

const ZOOMS = [1, 2, 4, 8, 16];
const MAP_NAMES = ['No map: you only know where you went', 'Village Map', 'Region Map', 'Treasure Map'];
const NEXT_HINT = [
  'Rin sells maps in Seabridge: the Village Map shows the villages and the roads.',
  'The Region Map shows the whole land.',
  'The Treasure Map shows every buried treasure.',
  'You own the best map: every treasure is marked.',
];
const LEGEND = [
  ['you', 'You'],
  ['mainQuest', 'Main quest'],
  ['sideQuest', 'Side quest'],
  ['star', 'Balise / Urgent / Academy'],
  ['town', 'Town'],
  ['dungeon', 'Dungeon'],
  ['shop', 'Shop'],
  ['inn', 'Inn'],
  ['treasure', 'Treasure'],
  ['bridge', 'Bridge'],
  ['blocked', 'Blocked path'],
];

// The map itself: drag it to move, tap a name to see the place (or drop a beacon in Beacon Mode).
function MapView({ game, view, selectedId, beaconMode, beaconColor, onSelect, onBeaconChange }) {
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

  // A tap (not a drag): toggle/place a beacon if beaconMode is active, else select tapped place name.
  function release(event) {
    const wasTap = drag.current && !drag.current.moved;
    drag.current = null;
    if (!wasTap) return;
    const box = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - box.left;
    const y = event.clientY - box.top;
    if (beaconMode && size.current > 0) {
      const tile = screenToTile(view.current, size.current, x, y);
      const hit = boxes.current.find((label) => x >= label.x && x <= label.x + label.w && y >= label.y && y <= label.y + label.h);
      const label = hit ? hit.place.name : 'Balise #' + (listBeacons(game).length + 1);
      addMapBeacon(game, tile.x, tile.y, label, beaconColor);
      if (onBeaconChange) onBeaconChange();
      return;
    }
    const hit = boxes.current.find((label) => x >= label.x && x <= label.x + label.w && y >= label.y && y <= label.y + label.h);
    if (hit) onSelect(hit.place);
  }

  return (
    <canvas
      ref={canvasRef}
      style={{ ...styles.map, cursor: beaconMode ? 'crosshair' : 'grab' }}
      onPointerDown={press}
      onPointerMove={move}
      onPointerUp={release}
      onPointerCancel={() => (drag.current = null)}
    />
  );
}

// The small picture of the selected place: the real world, seen from above.
function Thumbnail({ place }) {
  const canvasRef = useCanvas((ctx, width, height, time) => drawLandscape(ctx, width, height, time, place, 1));
  return <canvas ref={canvasRef} style={styles.thumbnail} />;
}

function PlaceInfo({ place, game, onToggleBeacon }) {
  const beacons = listBeacons(game);
  const pinnedHere = place && beacons.some((b) => Math.hypot(b.x - place.x, b.y - place.y) < 12);
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
        {onToggleBeacon && (
          <button
            className="px-button"
            style={{ marginTop: 6, alignSelf: 'flex-start', padding: '4px 10px', fontSize: 12 }}
            onClick={() => onToggleBeacon(place)}
          >
            {pinnedHere ? '📍 Retirer balise' : '📍 Baliser ce lieu'}
          </button>
        )}
      </div>
    </div>
  );
}

// The main quest (gold), urgent alerts (crimson) and side quests (blue). Tap one: the map goes there.
function QuestList({ game, onFocus }) {
  const main = mainQuestMark(game);
  const urgent = urgentQuestMarks(game);
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
      {urgent.map((mark) => (
        <button key={mark.id || mark.title} className="menu-item" onClick={() => onFocus(mark)}>
          <PixelIcon name="star" size={14} />
          <span>{mark.title}</span>
        </button>
      ))}
      {sides.slice(0, 8).map((mark) => (
        <button key={mark.title} className="menu-item" onClick={() => onFocus(mark)}>
          <PixelIcon name="sideQuest" size={14} />
          <span>{mark.title}</span>
        </button>
      ))}
      {!main && sides.length === 0 && urgent.length === 0 && <span className="small">No quest right now.</span>}
    </>
  );
}

function BeaconList({ game, onFocus, onRemove }) {
  const beacons = listBeacons(game);
  return (
    <>
      <span className="section">Balises ({beacons.length})</span>
      {beacons.length === 0 ? (
        <span className="small">Aucune balise. Activez « Poser balise » et touchez la carte.</span>
      ) : (
        beacons.map((b) => (
          <div key={b.id} className="row" style={{ gap: 6, alignItems: 'center', marginBottom: 4 }}>
            <button className="menu-item grow" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => onFocus(b)}>
              <span style={{ display: 'inline-block', width: 10, height: 10, background: b.color || '#ff4d6d', borderRadius: 2 }} />
              <span>{b.label}</span>
            </button>
            <button className="px-button" style={{ padding: '3px 7px', fontSize: 11 }} onClick={() => onRemove(b.id)} aria-label="Remove beacon">
              ✕
            </button>
          </div>
        ))
      )}
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
      <PartyLine look={player.look} name={player.name + ' · Lv. ' + player.level}>
        <Bar value={player.health / maxHealth(player, game)} color="#e8423f" height={7} />
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
export default function MapPanel({ game, refresh }) {
  const view = useRef(firstView(game)); // what part of the map is shown (changed by dragging, not by React)
  const [selected, setSelected] = useState(() => placeHere(game));
  const [zoomIndex, setZoomIndex] = useState(3);
  const [beaconMode, setBeaconMode] = useState(false);
  const [beaconColor, setBeaconColor] = useState(BEACON_COLORS[0]);
  const [, setTick] = useState(0);
  const bump = () => {
    setTick((t) => t + 1);
    if (refresh) refresh();
  };
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

  // A quest or beacon was tapped: the map goes to it, and shows the place there.
  function focus(mark) {
    view.current = clampView({ ...view.current, cx: mark.x, cy: mark.y });
    const found = placeOf(zoneAt(mark.x, mark.y).id);
    if (found) setSelected(found);
  }

  return (
    <div className="map-layout">
      <div className="map-main">
        <div className="map-frame">
          <MapView
            game={game}
            view={view}
            selectedId={selected.id}
            beaconMode={beaconMode}
            beaconColor={beaconColor}
            onSelect={setSelected}
            onBeaconChange={bump}
          />
          <div style={styles.zoom}>
            <button className="px-button" style={styles.zoomButton} disabled={zoomIndex === ZOOMS.length - 1} onClick={() => zoom(1)} aria-label="zoom in">
              +
            </button>
            <button className="px-button" style={styles.zoomButton} disabled={zoomIndex === 0} onClick={() => zoom(-1)} aria-label="zoom out">
              −
            </button>
          </div>
        </div>
        <div className="row wrap" style={{ gap: 6, marginTop: 8, alignItems: 'center' }}>
          <button
            className={'px-button ' + (beaconMode ? 'px-gold' : '')}
            style={{ padding: '4px 10px', fontSize: 12 }}
            onClick={() => setBeaconMode((v) => !v)}
          >
            {beaconMode ? '📍 Mode Balise ACTIF (cliquez la carte)' : '📍 Poser balise sur la carte'}
          </button>
          {BEACON_COLORS.map((c) => (
            <button
              key={c}
              style={{
                width: 18,
                height: 18,
                borderRadius: 4,
                background: c,
                border: beaconColor === c ? '2px solid #fff' : '2px solid #0e1430',
                padding: 0,
              }}
              onClick={() => setBeaconColor(c)}
              aria-label={'Beacon color ' + c}
            />
          ))}
        </div>
        <div className="row small" style={styles.mapLevel}>
          <PixelIcon name={level > 0 ? 'map' + level : 'map'} size={14} />
          <span>
            {MAP_NAMES[level]}. {NEXT_HINT[level]}
          </span>
        </div>
      </div>
      <div className="map-info">
        <PlaceInfo
          place={selected}
          game={game}
          onToggleBeacon={(pl) => {
            togglePlaceBeacon(game, pl);
            bump();
          }}
        />
        <div>
          <BeaconList
            game={game}
            onFocus={focus}
            onRemove={(id) => {
              removeMapBeacon(game, id);
              bump();
            }}
          />
        </div>
        <div>
          <QuestList game={game} onFocus={focus} />
        </div>
        <span className="small" style={styles.controls}>
          Drag: move · Tap a name: see the place · + / −: zoom
        </span>
      </div>
      <div className="map-side">
        <Party game={game} />
        <Legend />
      </div>
    </div>
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
  legendLine: {
    gap: 8,
    marginBottom: 4,
  },
  controls: {
    textAlign: 'center',
  },
};
