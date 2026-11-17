import PixelIcon from '../PixelIcon';
import { ITEMS } from '../../data/items';
import { npcOf } from '../../data/npcs';
import { usePotion, canUsePotion, countItem, openMysteryItem } from '../../logic/player';
import { wear, isStuck } from '../../logic/isekai/curses';
import { sendHome } from '../../logic/people';
import { drink, eat, canEat, BOTTLE_SIZE } from '../../logic/survival';
import { placeFurniture, isAtHome } from '../../logic/home';
import { refreshWorld } from '../../logic/worldState';
import { hasLight, torchBlocker, torchTimeLeft, toggleTorch } from '../../logic/torch';
import { isNearCamp, canSetCamp, setCampHere, openCampMenu, packCamp, companionFatigue, hasAutoHeater } from '../../logic/camp';
import { companionRank } from '../../logic/bonds/training';
import { dismissSoldiers, dismissPet } from '../../logic/powers';
import { ensureSociety } from '../../logic/society/state';
import { interactMountedHorse, interactParkedHorse } from '../../logic/society/horses';
import { frontTile } from '../../logic/input';
import { durabilityOf, gearConditionLabel, DURABILITY_SLOTS, useRepairKit, needsRepair } from '../../logic/durability';
import { encumbranceStatus, itemWeight } from '../../logic/weight';
import { companionHpOf, companionMaxHp, dailyWageOf } from '../../logic/guild/ranks';

// The torch of the hero: always in hand. One button lights it or puts it out.
function TorchSwitch({ game, refresh }) {
  const blocker = torchBlocker(game);
  const lit = hasLight(game);

  function status() {
    if (lit) return '🔥 Your torch burns: ' + torchTimeLeft(game) + ' left.';
    if (blocker === 'rain') return 'Too wet to light it here. Wait for the rain to stop, or go inside.';
    if (blocker === 'wind') return 'Too much wind to light it here. Wait, or go inside.';
    return 'Your torch is out. Lit, it burns about 5 minutes.';
  }

  function press() {
    toggleTorch(game);
    refresh();
  }

  return (
    <>
      <span className="section">Light for the night</span>
      <div className="line">
        <PixelIcon name="torch" size={28} />
        <span className="grow small">{status()}</span>
        <button className="px-button" disabled={!lit && blocker !== null} onClick={press}>
          {lit ? 'Put out' : 'Light (T)'}
        </button>
      </div>
    </>
  );
}

// What an item does, in a few words.
export function describe(item) {
  if (item.text) return item.text;
  if (item.kind === 'weapon') return 'Attack +' + (item.power || 0);
  if (item.kind === 'armor') return 'Armor +' + (item.defense || 0);
  if (item.kind === 'boots') return 'Speed +' + (item.speed || 0) + ' (more time to answer)';
  return '';
}

// A piece of equipment worn (a cursed one says so: it will not come off).
function EquipmentSlot({ game, label, itemId }) {
  if (!itemId || !ITEMS[itemId]) {
    return (
      <div className="line">
        <PixelIcon name="ring" size={28} />
        <div className="grow">
          <span>{label}: none</span>
          <span className="small">Find or buy {label.toLowerCase()} gear across kingdoms.</span>
        </div>
      </div>
    );
  }
  const item = ITEMS[itemId];
  const hasWear = DURABILITY_SLOTS.includes(item.kind);
  const dur = hasWear ? durabilityOf(game, item.kind) : 100;
  return (
    <div className="line">
      <PixelIcon name={itemId} size={28} />
      <div className="grow">
        <span>
          {item.name}{' '}
          {hasWear && (
            <span className="small" style={{ color: dur < 25 ? '#ff7a7a' : dur < 50 ? '#ffb070' : '#7cfc9a' }}>
              ({dur}% {gearConditionLabel(dur)})
            </span>
          )}
        </span>
        <span className="small">{describe(item)}</span>
        {isStuck(game, itemId) && <span className="small" style={{ color: '#c78bff' }}>💀 Cursed: it drinks your life. Lift it at a goddess shrine or a church.</span>}
      </div>
    </div>
  );
}


// The button of an item of the bag: use a potion, eat food, place a piece of furniture (at home).
function ItemButton({ game, itemId, refresh }) {
  const item = ITEMS[itemId];
  function run(action) {
    action();
    refresh();
  }
  if (item.kind === 'potion') {
    return (
      <button className="px-button" disabled={!canUsePotion(game, itemId)} onClick={() => run(() => usePotion(game, itemId))}>
        Use
      </button>
    );
  }
  if (item.kind === 'food') {
    return (
      <button className="px-button" disabled={!canEat(game, itemId)} onClick={() => run(() => eat(game, itemId))}>
        Eat
      </button>
    );
  }
  if (item.kind === 'furniture') {
    return (
      <button className="px-button" disabled={!isAtHome(game)} onClick={() => run(() => placeFurniture(game, itemId, frontTile(game.player)) && refreshWorld(game))}>
        Place
      </button>
    );
  }
  if (['weapon', 'armor', 'boots', 'accessory'].includes(item.kind)) {
    return (
      <button className="px-button px-gold" onClick={() => run(() => wear(game, itemId))}>
        Equip
      </button>
    );
  }
  if (item.kind === 'mystery') {
    return (
      <button className="px-button px-gold" onClick={() => run(() => openMysteryItem(game, itemId))}>
        Open
      </button>
    );
  }
  if (item.kind === 'repair') {
    return (
      <button className="px-button px-gold" disabled={!needsRepair(game)} onClick={() => run(() => useRepairKit(game))}>
        Repair
      </button>
    );
  }
  return null;
}

// The equipment, camp/horse controls, the bag, and the friends who fight with the hero.
export default function InventoryPanel({ game, refresh }) {
  const player = game.player;
  const itemIds = Object.keys(player.bag);
  const society = ensureSociety(game);
  const nearCamp = isNearCamp(game);
  const campReady = canSetCamp(game);
  const enc = encumbranceStatus(game);

  function useItem(action) {
    action();
    refresh();
  }

  function dismiss(npcId) {
    sendHome(game, npcId);
    refresh();
  }

  return (
    <>
      <div className="line">
        <PixelIcon name="lexis" size={28} />
        <span className="grow">
          Lexis <span className="gold">{player.lexis}</span>
        </span>
      </div>

      <span className="section">Equipment</span>
      <EquipmentSlot game={game} label="Weapon" itemId={player.weapon} />
      <EquipmentSlot game={game} label="Armor" itemId={player.armor} />
      <EquipmentSlot game={game} label="Boots" itemId={player.boots} />
      <EquipmentSlot game={game} label="Accessory" itemId={player.accessory} />

      <span className="section">Camp &amp; Travel</span>
      <div className="line">
        <PixelIcon name="fire" size={28} />
        <div className="grow">
          <span>Field Camp {hasAutoHeater(game) ? '· Auto-Heater Active' : ''}</span>
          <span className="small">
            {nearCamp ? 'Camp pitched nearby: cook meals, warm up, or sleep.' : campReady ? 'Pitch a camp in the wild to cook and rest.' : 'Move outside a town square to pitch a camp.'}
          </span>
        </div>
        {nearCamp ? (
          <>
            <button className="px-button px-gold" onClick={() => useItem(() => openCampMenu(game))}>
              Open Camp
            </button>
            <button className="px-button" onClick={() => useItem(() => packCamp(game))}>
              Pack
            </button>
          </>
        ) : (
          <button className="px-button" disabled={!campReady} onClick={() => useItem(() => setCampHere(game))}>
            Set Camp
          </button>
        )}
      </div>

      {(society.riding?.active || society.parkedHorse) && (
        <div className="line">
          <PixelIcon name="horseFeed" size={28} />
          <div className="grow">
            <span>{society.riding?.active ? 'Mounted Horse' : 'Waiting Horse'}</span>
            <span className="small">
              Hunger {Math.round((society.riding?.active ? society.riding.hunger : society.parkedHorse?.hunger) || 0)} / 100
            </span>
          </div>
          <button
            className="px-button"
            onClick={() => useItem(() => (society.riding?.active ? interactMountedHorse(game) : interactParkedHorse(game)))}
          >
            Horse Menu
          </button>
        </div>
      )}

      <span className="section">Water</span>
      <div className="line">
        <PixelIcon name="water" size={28} />
        <div className="grow">
          <span>
            Water bottle <span className="gold">{player.bottle} / {BOTTLE_SIZE}</span>
          </span>
          <span className="small">Thirst {Math.round(player.thirst)} / 100 · Food {Math.round(player.hunger)} / 100. Fill it at a river, a well, a fountain.</span>
        </div>
        <button className="px-button" disabled={player.bottle === 0} onClick={() => useItem(() => drink(game))}>
          Drink
        </button>
      </div>

      <TorchSwitch game={game} refresh={refresh} />

      <span className="section">
        Bag ·{' '}
        <span style={{ color: enc.state === 'Overloaded' ? '#ff7a7a' : enc.state === 'Heavy' ? '#ffb070' : '#7cfc9a' }}>
          {enc.weight} / {enc.capacity} kg ({enc.state})
        </span>
      </span>
      {itemIds.length === 0 && <span className="small">Empty.</span>}
      {itemIds.map((itemId) => (
        <div key={itemId} className="line">
          <PixelIcon name={itemId} size={28} />
          <div className="grow">
            <span>
              {ITEMS[itemId].name} <span className="gold">× {countItem(player, itemId)}</span>{' '}
              <span className="small">({Math.round(itemWeight(itemId) * countItem(player, itemId) * 10) / 10} kg)</span>
            </span>
            {(ITEMS[itemId].text || ITEMS[itemId].kind === 'furniture') && <span className="small">{ITEMS[itemId].text || 'Furniture: place it in your home, in front of you.'}</span>}
          </div>
          <ItemButton game={game} itemId={itemId} refresh={refresh} />
        </div>
      ))}

      {(player.party.length > 0 || player.soldiers > 0 || player.pet) && <span className="section">Companions</span>}
      {player.soldiers > 0 && (
        <div className="line">
          <PixelIcon name="obsidianSoldier" size={28} />
          <span className="grow">
            Obsidian soldiers ×{player.soldiers} <span className="small">· {Math.ceil(player.soldierTime)} s left</span>
          </span>
          <button className="px-button" onClick={() => useItem(() => dismissSoldiers(game))}>
            Dismiss
          </button>
        </div>
      )}
      {player.pet && (
        <div className="line">
          <PixelIcon name="obsidianPet" size={28} />
          <span className="grow">
            Obsidian cat <span className="small">· {Math.ceil(player.petTime)} s left</span>
          </span>
          <button className="px-button" onClick={() => useItem(() => dismissPet(game))}>
            Dismiss
          </button>
        </div>
      )}
      {player.party.map((npcId) => (
        <div key={npcId} className="line">
          <PixelIcon name="woodSword" size={28} />
          <div className="grow">
            <span>{npcOf(npcId).name}</span>
            <span className="small">
              HP {companionHpOf(game, npcId)}/{companionMaxHp(game, npcId)} · Rank {companionRank(game, npcId)}/4 · Fatigue {Math.round(companionFatigue(game, npcId))}% · {dailyWageOf(game, npcId)} Lexis/day
            </span>
          </div>
          <button className="px-button" onClick={() => dismiss(npcId)}>
            Send home
          </button>
        </div>
      ))}
    </>
  );
}
