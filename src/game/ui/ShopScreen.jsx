import Window from './Window';
import PixelIcon from './PixelIcon';
import Portrait from './Portrait';
import { describe } from './menu/InventoryPanel';
import { ITEMS } from '../data/items';
import { npcOf } from '../data/npcs';
import { shopItems, shopStock, priceOf, buy, sellableItems, sell, townEconomyView } from '../logic/shop';
import { acceptContract } from '../logic/economy';
import { villageOf } from '../data/zones';
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
  const econ = townEconomyView(game);
  const recipes = econ.stationRecipes(shop.kind);

  function buyItem(itemId) {
    if (buy(game, itemId)) notify(game, ITEMS[itemId].name + ' is yours!', '#8dffb0');
    refresh();
  }

  function repairGear(useMats = false) {
    econ.repair(useMats);
    refresh();
  }

  function craftItem(recipeId) {
    recipes.find((r) => r.id === recipeId)?.craft();
    refresh();
  }

  function sellItem(itemId) {
    sell(game, itemId);
    refresh();
  }

  function takeContract(contractId) {
    acceptContract(game, contractId);
    refresh();
  }

  function finishContract() {
    econ.deliver();
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
            <span className="small">{seller.role} · {econ.villageName}</span>
            <div className="row" style={styles.lexis}>
              <PixelIcon name="lexis" size={14} />
              <span>{player.lexis} Lexis · Town Treasury: {econ.treasury}</span>
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

        <span className="section">{shop.kind === 'forge' ? 'Upgrades & Crafted Gear' : 'To buy'}</span>
        {offers.map((itemId) => {
          const stock = shopStock(game, itemId);
          const outOfStock = stock !== null && stock <= 0;
          const cost = priceOf(game, itemId);
          return (
            <div key={itemId} className="line">
              <PixelIcon name={itemId} size={28} />
              <div className="grow">
                <span>
                  {ITEMS[itemId].name}{' '}
                  {stock !== null && <span className={outOfStock ? 'small' : 'gold'}>({outOfStock ? 'Out of stock' : '×' + stock})</span>}
                </span>
                <span className="small">{describe(ITEMS[itemId])}</span>
              </div>
              <button className="px-button px-gold" disabled={outOfStock || player.lexis < cost} onClick={() => buyItem(itemId)}>
                {outOfStock ? 'Empty' : cost}
              </button>
            </div>
          );
        })}
        {offers.length === 0 && <span className="small">Nothing more to sell: you have the best of everything.</span>}

        {shop.kind === 'forge' && econ.needsRepair && (
          <>
            <span className="section">Forge Repair</span>
            <div className="line">
              <PixelIcon name="repairKit" size={28} />
              <div className="grow">
                <span>Restore Worn Weapon, Armor &amp; Boots to 100%</span>
                <span className="small">Pay {econ.repairCost} Lexis or supply 1 Iron Ore / Soft Pelt</span>
              </div>
              <button className="px-button px-gold" disabled={player.lexis < econ.repairCost} onClick={() => repairGear(false)}>
                {econ.repairCost} Lexis
              </button>
              <button className="px-button" disabled={!player.bag.ore && !player.bag.pelt} onClick={() => repairGear(true)}>
                1 Ore/Pelt
              </button>
            </div>
          </>
        )}

        {recipes.length > 0 && (
          <>
            <span className="section">Craft From Your Materials</span>
            {recipes.map((r) => {
              const mats = Object.entries(r.needs)
                .map(([id, qty]) => `${ITEMS[id]?.name || id} ${countItem(player, id)}/${qty}`)
                .join(' · ');
              return (
                <div key={r.id} className="line">
                  <PixelIcon name={r.id} size={28} />
                  <div className="grow">
                    <span>{ITEMS[r.id]?.name || r.id}</span>
                    <span className="small">
                      {r.desc} ({mats}
                      {r.fee > 0 ? ` · ${r.fee} Lexis fee` : ''})
                    </span>
                  </div>
                  <button className="px-button px-gold" disabled={!r.canCraft} onClick={() => craftItem(r.id)}>
                    Craft
                  </button>
                </div>
              );
            })}
          </>
        )}

        {(econ.shortages.length > 0 || econ.activeContract || econ.contracts.length > 0) && (
          <>
            <span className="section">Workshops & Haulage Contracts</span>
            {econ.shortages.length > 0 && (
              <span className="small">
                Workshops need: {econ.shortages.map((s) => `${ITEMS[s.itemId]?.name || s.itemId} (${s.have}/${s.need} for ${ITEMS[s.forProduct]?.name || s.forProduct})`).join(', ')}
              </span>
            )}
            {econ.activeContract && (
              <div className="line">
                <PixelIcon name={econ.activeContract.itemId} size={24} />
                <div className="grow">
                  <span>
                    Active: Deliver {econ.activeContract.qty}× {ITEMS[econ.activeContract.itemId]?.name} →{' '}
                    {(villageOf(econ.activeContract.buyerId) || {}).name || econ.activeContract.buyerId}
                  </span>
                  <span className="small">Reward: +{econ.activeContract.rewardLexis} Lexis</span>
                </div>
                {econ.canDeliver && (
                  <button className="px-button px-gold" onClick={finishContract}>
                    Deliver
                  </button>
                )}
              </div>
            )}
            {!econ.activeContract && econ.contracts.map((c) => (
              <div key={c.id} className="line">
                <PixelIcon name={c.itemId} size={24} />
                <div className="grow">
                  <span>
                    Supply {c.qty}× {ITEMS[c.itemId]?.name} to {(villageOf(c.buyerId) || {}).name || c.buyerId}
                  </span>
                  <span className="small">
                    Pay: +{c.rewardLexis} Lexis {c.sellerId ? `· Available at ${(villageOf(c.sellerId) || {}).name}` : ''}
                  </span>
                </div>
                <button className="px-button" onClick={() => takeContract(c.id)}>
                  Accept
                </button>
              </div>
            ))}
          </>
        )}

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
