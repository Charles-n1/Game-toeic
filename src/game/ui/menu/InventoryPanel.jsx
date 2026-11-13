import PixelIcon from '../PixelIcon';
import { ITEMS } from '../../data/items';
import { npcOf } from '../../data/npcs';
import { usePotion, countItem } from '../../logic/player';
import { sendHome } from '../../logic/people';

// What an item does, in a few words.
export function describe(item) {
  if (item.kind === 'weapon') return 'Attack +' + item.power;
  if (item.kind === 'armor') return 'Armor +' + item.defense;
  if (item.kind === 'boots') return 'Speed +' + item.speed + ' (more time to answer)';
  return item.text || '';
}

function EquipmentSlot({ itemId }) {
  const item = ITEMS[itemId];
  return (
    <div className="line">
      <PixelIcon name={itemId} size={28} />
      <div className="grow">
        <span>{item.name}</span>
        <span className="small">{describe(item)}</span>
      </div>
    </div>
  );
}

// The equipment, the bag, and the friends who fight with the hero.
export default function InventoryPanel({ game, refresh }) {
  const player = game.player;
  const itemIds = Object.keys(player.bag);

  function useItem(itemId) {
    usePotion(game, itemId);
    refresh();
  }

  function dismiss(npcId) {
    sendHome(game, npcId);
    refresh();
  }

  return (
    <>
      <span className="section">Equipment</span>
      <EquipmentSlot itemId={player.weapon} />
      <EquipmentSlot itemId={player.armor} />
      <EquipmentSlot itemId={player.boots} />

      <span className="section">Bag</span>
      {itemIds.length === 0 && <span className="small">Empty.</span>}
      {itemIds.map((itemId) => (
        <div key={itemId} className="line">
          <PixelIcon name={itemId} size={28} />
          <div className="grow">
            <span>
              {ITEMS[itemId].name} <span className="gold">× {countItem(player, itemId)}</span>
            </span>
            {ITEMS[itemId].text && <span className="small">{ITEMS[itemId].text}</span>}
          </div>
          {ITEMS[itemId].kind === 'potion' && (
            <button className="px-button" onClick={() => useItem(itemId)}>
              Use
            </button>
          )}
        </div>
      ))}

      {player.party.length > 0 && <span className="section">Companions</span>}
      {player.party.map((npcId) => (
        <div key={npcId} className="line">
          <PixelIcon name="woodSword" size={28} />
          <span className="grow">{npcOf(npcId).name} · Attack +10</span>
          <button className="px-button" onClick={() => dismiss(npcId)}>
            Send home
          </button>
        </div>
      ))}
    </>
  );
}
