import PixelIcon from '../PixelIcon';
import { ITEMS } from '../../data/items';
import { npcOf } from '../../data/npcs';
import { usePotion, canUsePotion, countItem } from '../../logic/player';
import { sendHome } from '../../logic/people';
import { TORCH_RECIPE, TORCH_HOURS, canCraftTorch, craftTorch, canLightTorch, lightAtFire, lightWithFlint, hasLight } from '../../logic/torch';

// The torch: what it needs, and the buttons to make it and to light it.
function TorchCraft({ game, refresh }) {
  const player = game.player;

  function run(action) {
    action(game);
    refresh();
  }

  return (
    <>
      <span className="section">Light for the night</span>
      <span className="small">
        {hasLight(game) ? '🔥 Your torch burns: ' + Math.ceil(player.torchHours) + ' hour(s) left.' : 'No light. At night, you see almost nothing.'}
      </span>
      <div className="line">
        <PixelIcon name="torch" size={28} />
        <div className="grow">
          <span>Torch</span>
          <span className="small">
            {TORCH_RECIPE.map((id) => ITEMS[id].name + ' ' + countItem(player, id) + '/1').join(' · ')}
          </span>
        </div>
        <button className="px-button" disabled={!canCraftTorch(player)} onClick={() => run(craftTorch)}>
          Make
        </button>
      </div>
      {countItem(player, 'torch') > 0 && (
        <div className="line">
          <PixelIcon name="fire" size={28} />
          <span className="grow small">Light a torch ({TORCH_HOURS} hours): at a lamp, a torch, a campfire... or with 2 flint stones.</span>
          <button className="px-button" disabled={!canLightTorch(game, false)} onClick={() => run(lightAtFire)}>
            At the fire
          </button>
          <button className="px-button" disabled={!canLightTorch(game, true)} onClick={() => run(lightWithFlint)}>
            Flint
          </button>
        </div>
      )}
    </>
  );
}

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

      <TorchCraft game={game} refresh={refresh} />

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
            <button className="px-button" disabled={!canUsePotion(game, itemId)} onClick={() => useItem(itemId)}>
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
