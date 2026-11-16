import PixelIcon from '../PixelIcon';
import { ITEMS } from '../../data/items';
import { npcOf } from '../../data/npcs';
import { usePotion, canUsePotion, countItem } from '../../logic/player';
import { sendHome } from '../../logic/people';
import { drink, eat, canEat, BOTTLE_SIZE } from '../../logic/survival';
import { placeFurniture, isAtHome } from '../../logic/home';
import { refreshWorld } from '../../logic/worldState';
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

const FRONT = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

// The tile in front of the hero (where a piece of furniture goes).
function frontOf(player) {
  const [dx, dy] = FRONT[player.dir];
  return { x: Math.floor(player.x + dx), y: Math.floor(player.y + dy) };
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
      <button className="px-button" disabled={!isAtHome(game)} onClick={() => run(() => placeFurniture(game, itemId, frontOf(game.player)) && refreshWorld(game))}>
        Place
      </button>
    );
  }
  return null;
}

// The equipment, the bag, and the friends who fight with the hero.
export default function InventoryPanel({ game, refresh }) {
  const player = game.player;
  const itemIds = Object.keys(player.bag);

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
      <span className="section">Equipment</span>
      <EquipmentSlot itemId={player.weapon} />
      <EquipmentSlot itemId={player.armor} />
      <EquipmentSlot itemId={player.boots} />

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
            {(ITEMS[itemId].text || ITEMS[itemId].kind === 'furniture') && <span className="small">{ITEMS[itemId].text || 'Furniture: place it in your home, in front of you.'}</span>}
          </div>
          <ItemButton game={game} itemId={itemId} refresh={refresh} />
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
