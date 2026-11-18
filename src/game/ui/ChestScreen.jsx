import { useState } from 'react';
import Window from './Window';
import PixelIcon from './PixelIcon';
import { ITEMS } from '../data/items';
import {
  chestSlotsOf,
  takeFromChest,
  storeInChest,
  takeAllFromChest,
  storeResourcesInChest,
  closeChest,
  bagSummaryForChest,
} from '../logic/chest';
import { ensureRealism } from '../logic/realism/state';
import { pickSealedLockWithLockpick } from '../logic/realism/magicPhysics';

const GRID_SLOTS = 27;

/** Minecraft-style interactive Chest + Backpack split grid screen. */
export default function ChestScreen({ game, refresh }) {
  const chest = game.run.chest;
  const [selected, setSelected] = useState(null); // { source: 'chest'|'bag', itemId }
  if (!chest) return null;

  const chestGrid = chestSlotsOf(chest);
  const bagEntries = Object.entries(game.player.bag || {})
    .filter(([id, count]) => ITEMS[id] && count > 0)
    .map(([id, count]) => ({ id, count }));
  const bagGrid = [...bagEntries];
  while (bagGrid.length < GRID_SLOTS) bagGrid.push(null);

  const selectedItem = selected && ITEMS[selected.itemId] ? ITEMS[selected.itemId] : null;
  const selectedCount =
    selected?.source === 'chest'
      ? chest.items?.[selected.itemId] || 0
      : selected?.source === 'bag'
        ? game.player.bag?.[selected.itemId] || 0
        : 0;
  const bagStats = bagSummaryForChest(game);

  function clickSlot(source, entry, event) {
    if (!entry) {
      setSelected(null);
      return;
    }
    if (event.shiftKey) {
      if (source === 'chest') takeFromChest(game, entry.id, Infinity);
      else if (chest.allowDeposit) storeInChest(game, entry.id, Infinity);
      setSelected(null);
      refresh();
      return;
    }
    if (selected?.source === source && selected?.itemId === entry.id) {
      if (source === 'chest') takeFromChest(game, entry.id, 1);
      else if (chest.allowDeposit) storeInChest(game, entry.id, 1);
      refresh();
      return;
    }
    setSelected({ source, itemId: entry.id });
  }

  function handleClose() {
    closeChest(game);
    refresh();
  }

  return (
    <div className="overlay center" onClick={handleClose}>
      <div onClick={(e) => e.stopPropagation()}>
        <Window title={chest.title || 'Chest'} onClose={handleClose} style={styles.win}>
        <span className="small">
          Tap a slot to inspect (tap twice to move 1, or Shift+Click to move full stack).
        </span>

        <div className="row between" style={styles.headRow}>
          <span className="gold" style={styles.secLabel}>
            Chest ({Object.keys(chest.items || {}).length}/{chest.maxSlots || 27} slots)
          </span>
          <div className="row" style={styles.actions}>
            {chest.kind === 'treasure' &&
              (game.player.bag?.lockpick || 0) > 0 &&
              !ensureRealism(game).combatRealism?.pickedLocks?.[chest.key] && (
                <button
                  className="px-button"
                  onClick={() => {
                    const k = chest.key;
                    closeChest(game);
                    pickSealedLockWithLockpick(game, k);
                    refresh();
                  }}
                >
                  🗝️ Pick Sealed Vault
                </button>
              )}
            {chest.allowDeposit && (
              <button
                className="px-button"
                onClick={() => {
                  storeResourcesInChest(game);
                  refresh();
                }}
              >
                Store Materials
              </button>
            )}
            <button
              className="px-button px-gold"
              onClick={() => {
                takeAllFromChest(game);
                refresh();
              }}
            >
              Take All
            </button>
          </div>
        </div>

        <div style={styles.grid}>
          {chestGrid.map((entry, idx) => {
            const isSel = selected?.source === 'chest' && entry && selected.itemId === entry.id;
            return (
              <button
                key={'c-' + idx}
                type="button"
                onClick={(e) => clickSlot('chest', entry, e)}
                title={entry ? ITEMS[entry.id].name : 'Empty slot'}
                style={{ ...styles.slot, ...(isSel ? styles.slotSelected : null) }}
              >
                {entry && (
                  <>
                    <PixelIcon name={entry.id} size={22} />
                    <span style={styles.qty}>{entry.count}</span>
                  </>
                )}
              </button>
            );
          })}
        </div>

        <div style={styles.inspector}>
          {selectedItem && selectedCount > 0 ? (
            <div className="row between wrap" style={styles.inspectRow}>
              <div className="row" style={styles.inspectInfo}>
                <PixelIcon name={selected.itemId} size={22} />
                <div>
                  <span style={styles.itemTitle}>{selectedItem.name}</span>
                  <span className="small">{selectedItem.text}</span>
                </div>
              </div>
              <div className="row" style={styles.actions}>
                {selected.source === 'chest' ? (
                  <>
                    <button
                      className="px-button px-gold"
                      onClick={() => {
                        takeFromChest(game, selected.itemId, 1);
                        refresh();
                      }}
                    >
                      Take 1
                    </button>
                    <button
                      className="px-button"
                      onClick={() => {
                        takeFromChest(game, selected.itemId, Infinity);
                        setSelected(null);
                        refresh();
                      }}
                    >
                      Take All ({selectedCount})
                    </button>
                  </>
                ) : (
                  chest.allowDeposit && (
                    <>
                      <button
                        className="px-button px-gold"
                        onClick={() => {
                          storeInChest(game, selected.itemId, 1);
                          refresh();
                        }}
                      >
                        Store 1
                      </button>
                      <button
                        className="px-button"
                        onClick={() => {
                          storeInChest(game, selected.itemId, Infinity);
                          setSelected(null);
                          refresh();
                        }}
                      >
                        Store All ({selectedCount})
                      </button>
                    </>
                  )
                )}
              </div>
            </div>
          ) : (
            <span className="small">Select any item in the chest or your backpack to transfer it.</span>
          )}
        </div>

        <div className="row between" style={styles.headRow}>
          <span className="gold" style={styles.secLabel}>
            Your Backpack
          </span>
          <span className="small">
            Weight: {bagStats.weight} / {bagStats.capacity} kg
          </span>
        </div>

        <div style={styles.grid}>
          {bagGrid.slice(0, Math.max(GRID_SLOTS, Math.ceil(bagEntries.length / 9) * 9)).map((entry, idx) => {
            const isSel = selected?.source === 'bag' && entry && selected.itemId === entry.id;
            return (
              <button
                key={'b-' + idx}
                type="button"
                onClick={(e) => clickSlot('bag', entry, e)}
                title={entry ? ITEMS[entry.id].name : 'Empty slot'}
                style={{ ...styles.slot, ...(isSel ? styles.slotSelected : null) }}
              >
                {entry && (
                  <>
                    <PixelIcon name={entry.id} size={22} />
                    <span style={styles.qty}>{entry.count}</span>
                  </>
                )}
              </button>
            );
          })}
        </div>

        <div className="row between" style={styles.footer}>
          <span className="small">Esc to close</span>
          <button className="px-button" onClick={handleClose}>
            Close
          </button>
        </div>
      </Window>
      </div>
    </div>
  );
}

const styles = {
  win: {
    width: 'min(94vw, 500px)',
    maxHeight: '90vh',
    overflowY: 'auto',
    gap: 8,
  },
  headRow: {
    marginTop: 4,
    gap: 8,
    alignItems: 'center',
  },
  secLabel: {
    fontSize: 14,
  },
  actions: {
    gap: 6,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(9, minmax(0, 1fr))',
    gap: 4,
    padding: 6,
    background: '#171324',
    border: '2px solid #0b0816',
    borderRadius: 6,
  },
  slot: {
    position: 'relative',
    aspectRatio: '1 / 1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    background: '#2a243d',
    border: '2px solid #484064',
    boxShadow: 'inset 2px 2px 0 #151123, inset -1px -1px 0 #5b527a',
    borderRadius: 3,
    cursor: 'pointer',
    minHeight: 36,
  },
  slotSelected: {
    borderColor: '#ffd86b',
    background: '#3d335c',
    boxShadow: '0 0 0 1px #ffd86b',
  },
  qty: {
    position: 'absolute',
    right: 2,
    bottom: 0,
    fontSize: 10,
    lineHeight: '11px',
    color: '#ffffff',
    textShadow: '1px 1px 0 #000',
    fontWeight: 'bold',
    pointerEvents: 'none',
  },
  inspector: {
    padding: '6px 8px',
    background: '#1c182c',
    border: '1px solid #433b62',
    borderRadius: 5,
    minHeight: 42,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  inspectRow: {
    gap: 8,
    alignItems: 'center',
  },
  inspectInfo: {
    gap: 8,
    alignItems: 'center',
    flex: 1,
    minWidth: 160,
  },
  itemTitle: {
    fontSize: 13,
    color: '#ffe694',
  },
  footer: {
    marginTop: 4,
  },
};
