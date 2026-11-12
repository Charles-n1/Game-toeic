import Sheet from './Sheet';
import { ITEMS } from '../data/items';
import { npcOf } from '../data/npcs';
import { shopItems, priceOf, buy, sellableItems, sell } from '../logic/shop';
import { negotiate } from '../logic/duels';
import { countItem } from '../logic/player';
import { notify } from '../logic/messages';

// What an item does, in a few words.
function describe(item) {
  if (item.kind === 'weapon') return 'Damage ' + item.power / 2 + ' ❤ per good answer';
  if (item.kind === 'armor') return 'Armor +' + item.defense + ' (each hit hurts less)';
  if (item.kind === 'boots') return 'Speed +' + item.speed + ' (more time to answer)';
  return item.text || '';
}

function dealText(game) {
  if (game.deal.day !== game.day) return null;
  return game.deal.factor < 1 ? '🤝 Deal of the day: −30%' : '😤 The sellers are upset today: +10%';
}

// A shop: buy, sell, and negotiate the prices with a duel of words (once a day).
export default function ShopScreen({ game, refresh, onClose }) {
  const shop = game.run.shop;
  const seller = npcOf(shop.npcId);
  const player = game.player;
  const deal = dealText(game);

  function buyItem(itemId) {
    if (buy(game, itemId)) notify(game, ITEMS[itemId].icon + ' ' + ITEMS[itemId].name + ' is yours!', '#7CFC9A');
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
    <Sheet title={seller.name + ' · ' + seller.role} onClose={onClose}>
      <span style={styles.lexis}>🪙 {player.lexis} Lexis</span>
      {deal ? (
        <span className="small">{deal}</span>
      ) : (
        <button className="btn" style={styles.negotiate} onClick={startNegotiation}>
          🗣️ Negotiate the prices (a duel of words)
        </button>
      )}

      <span className="subtitle">{shop.kind === 'forge' ? 'Upgrades' : 'To buy'}</span>
      {shopItems(game, shop.kind).map((itemId) => (
        <div key={itemId} className="line">
          <span className="icon">{ITEMS[itemId].icon}</span>
          <div className="grow">
            <span>{ITEMS[itemId].name}</span>
            <span className="small">{describe(ITEMS[itemId])}</span>
          </div>
          <button className="btn btn-gold" disabled={player.lexis < priceOf(game, itemId)} onClick={() => buyItem(itemId)}>
            {priceOf(game, itemId)} 🪙
          </button>
        </div>
      ))}
      {shopItems(game, shop.kind).length === 0 && <span className="small">Nothing more to sell: you have the best of everything.</span>}

      <span className="subtitle">To sell</span>
      {sellableItems(player).map((itemId) => (
        <div key={itemId} className="line">
          <span className="icon">{ITEMS[itemId].icon}</span>
          <span className="grow">
            {ITEMS[itemId].name} × {countItem(player, itemId)}
          </span>
          <button className="btn" onClick={() => sellItem(itemId)}>
            +{ITEMS[itemId].sell} 🪙
          </button>
        </div>
      ))}
      {sellableItems(player).length === 0 && <span className="small">Nothing to sell. Grow carrots, dig treasures, pick flowers from monsters.</span>}
    </Sheet>
  );
}

const styles = {
  lexis: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 6,
  },
  negotiate: {
    marginTop: 4,
  },
};
