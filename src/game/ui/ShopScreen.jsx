import Window from './Window';
import PixelIcon from './PixelIcon';
import Portrait from './Portrait';
import { describe } from './menu/InventoryPanel';
import { ITEMS } from '../data/items';
import { npcOf } from '../data/npcs';
import { shopItems, priceOf, buy, sellableItems, sell } from '../logic/shop';
import { negotiate } from '../logic/duels';
import { countItem } from '../logic/player';
import { notify } from '../logic/messages';

function dealText(game) {
  if (game.deal.day !== game.day) return null;
  return game.deal.factor < 1 ? 'Deal of the day: −30%' : 'The sellers are upset today: +10%';
}

// A shop: buy, sell, and negotiate the prices with a duel of words (once a day).
export default function ShopScreen({ game, refresh, onClose }) {
  const shop = game.run.shop;
  const seller = npcOf(shop.npcId);
  const player = game.player;
  const deal = dealText(game);
  const offers = shopItems(game, shop.kind);
  const sellable = sellableItems(player);

  function buyItem(itemId) {
    if (buy(game, itemId)) notify(game, ITEMS[itemId].name + ' is yours!', '#8dffb0');
    refresh();
  }

  function sellItem(itemId) {
    sell(game, itemId);
    refresh();
  }

  function startNegotiation() {
    onClose();
    negotiate(game, seller);
    refresh();
  }

  return (
    <div className="overlay">
      <Window title={shop.kind === 'forge' ? 'Forge' : 'Shop'} gold onClose={onClose}>
        <div className="row" style={styles.top}>
          <Portrait look={seller.look} size={64} />
          <div className="grow">
            <span className="gold">{seller.name}</span>
            <span className="small">{seller.role}</span>
            <div className="row" style={styles.lexis}>
              <PixelIcon name="lexis" size={14} />
              <span>{player.lexis} Lexis</span>
            </div>
          </div>
        </div>
        {deal ? (
          <span className="small">{deal}</span>
        ) : (
          <button className="px-button" onClick={startNegotiation}>
            Negotiate the prices (a duel of words)
          </button>
        )}

        <span className="section">{shop.kind === 'forge' ? 'Upgrades' : 'To buy'}</span>
        {offers.map((itemId) => (
          <div key={itemId} className="line">
            <PixelIcon name={itemId} size={28} />
            <div className="grow">
              <span>{ITEMS[itemId].name}</span>
              <span className="small">{describe(ITEMS[itemId])}</span>
            </div>
            <button className="px-button px-gold" disabled={player.lexis < priceOf(game, itemId)} onClick={() => buyItem(itemId)}>
              {priceOf(game, itemId)}
            </button>
          </div>
        ))}
        {offers.length === 0 && <span className="small">Nothing more to sell: you have the best of everything.</span>}

        <span className="section">To sell</span>
        {sellable.map((itemId) => (
          <div key={itemId} className="line">
            <PixelIcon name={itemId} size={28} />
            <span className="grow">
              {ITEMS[itemId].name} <span className="gold">× {countItem(player, itemId)}</span>
            </span>
            <button className="px-button" onClick={() => sellItem(itemId)}>
              +{ITEMS[itemId].sell}
            </button>
          </div>
        ))}
        {sellable.length === 0 && <span className="small">Nothing to sell. Grow carrots, dig treasures, take flowers from the monsters.</span>}
      </Window>
    </div>
  );
}

const styles = {
  top: {
    gap: 12,
    marginBottom: 10,
  },
  lexis: {
    gap: 6,
    marginTop: 4,
  },
};
