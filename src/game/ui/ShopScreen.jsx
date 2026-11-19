import { useState } from 'react';
import Window from './Window';
import PixelIcon from './PixelIcon';
import Portrait from './Portrait';
import { describe, BottleUpgradeRow } from './menu/InventoryPanel';
import { ITEMS } from '../data/items';
import { npcOf } from '../data/npcs';
import { shopItems, shopStock, priceOf, buy, sellableItems, sell, townEconomyView } from '../logic/shop';
import { acceptContract } from '../logic/economy';
import { villageOf } from '../data/zones';
import { negotiate } from '../logic/duels';
import { countItem } from '../logic/player';
import { upgradeBottle, nextBottleUpgrade } from '../logic/survival';
import { refineLevelOf, refinedItemName, refineBonusForItem, refineRequirements, refineGear } from '../logic/isekaiTodo/progression';
import { ensureRealism } from '../logic/realism/state';
import { sharpenWeaponAtForgeOrHome, temperEquipmentAtForge, isTownDayMarketBonus } from '../logic/realism/foodAndNature';
import { inspectRepairInvoice } from '../logic/realism/englishWorld';
import {
  depositBank,
  withdrawBank,
  issuePromissoryNote,
  redeemPromissoryNote,
  requestGuildLoan,
  repayLoan,
  investInTownWorkshop,
  exchangeAllForeignCoins,
  assayCounterfeitCoins,
  marketBoomSellMultiplier,
} from '../logic/realism/financeAndLaw';
import { notify } from '../logic/messages';

function dealText(game) {
  if (game.deal.day !== game.day) return null;
  return game.deal.factor < 1 ? 'Deal of the day: −30%' : 'The sellers are upset today: +10%';
}

const SHOP_TITLES = {
  forge: 'Forge & Smithy',
  armory: 'Armory',
  potions: 'House of Potions',
  clinic: 'Medical Clinic',
  arcane: 'Arcane Shop',
  bakery: 'Bakery',
  weaver: 'Weaver & Tailor',
  carpenter: 'Carpenter Workshop',
  otherworld: 'Inn & Earth Kitchen',
  market: 'General Market',
};

// A shop: buy, sell, and negotiate the prices with a duel of words (once a day).
export default function ShopScreen({ game, refresh, onClose }) {
  const [useProt, setUseProt] = useState(false);
  const [useStone, setUseStone] = useState(false);
  const shop = game.run.shop;
  const seller = npcOf(shop.npcId) || {
    id: shop.npcId || 'merchant',
    name: shop.sellerName || 'Shopkeeper',
    role: shop.sellerRole || SHOP_TITLES[shop.kind] || 'Specialist Merchant',
    look: shop.sellerLook || { skin: '#fde0c8', hair: '#5a3a1e', style: 'short', eyes: '#3a6fd8', outfit: '#4a3a5a', trim: '#ffd23f' },
  };
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
      <Window title={SHOP_TITLES[shop.kind] || 'Shop'} gold onClose={onClose}>
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
              <button
                className="px-button"
                onClick={() => {
                  onClose();
                  inspectRepairInvoice(game, econ.repairCost, (finalCost) => {
                    if (game.player.lexis < finalCost) return notify(game, 'Need ' + finalCost + ' Lexis.', '#ffb070');
                    game.player.lexis -= finalCost;
                    econ.repair(false);
                  });
                }}
              >
                Check Invoice
              </button>
              <button className="px-button" disabled={!player.bag.ore && !player.bag.pelt} onClick={() => repairGear(true)}>
                1 Ore/Pelt
              </button>
            </div>
          </>
        )}

        {shop.kind === 'forge' && game?.realism && (
          <>
            <span className="section">Hone Edge &amp; Quality Tempering</span>
            <div className="row wrap" style={{ gap: 6, marginBottom: 4 }}>
              <button className="px-button" onClick={() => { sharpenWeaponAtForgeOrHome(game); refresh(); }}>
                🗡️ Sharpen Blade (+5% ATK)
              </button>
              <button className="px-button" onClick={() => { temperEquipmentAtForge(game, 'weapon'); refresh(); }}>
                ⚒️ Temper Weapon ({ensureRealism(game).combatRealism?.quality?.weapon || 'standard'})
              </button>
              <button className="px-button" onClick={() => { temperEquipmentAtForge(game, 'armor'); refresh(); }}>
                🛡️ Temper Armor ({ensureRealism(game).combatRealism?.quality?.armor || 'standard'})
              </button>
            </div>
          </>
        )}

        {shop.kind === 'forge' && (
          <>
            <span className="section">Blacksmith Refining (+1 to +10)</span>
            <div className="row wrap" style={{ gap: 8, marginBottom: 4 }}>
              <label className="small row" style={{ gap: 4 }}>
                <input type="checkbox" checked={useProt && countItem(player, 'protectionScroll') > 0} disabled={countItem(player, 'protectionScroll') <= 0} onChange={(e) => setUseProt(e.target.checked)} />
                Protection Scroll ({countItem(player, 'protectionScroll')})
              </label>
              <label className="small row" style={{ gap: 4 }}>
                <input type="checkbox" checked={useStone && countItem(player, 'refineStone') > 0} disabled={countItem(player, 'refineStone') <= 0} onChange={(e) => setUseStone(e.target.checked)} />
                Whetstone +15% ({countItem(player, 'refineStone')})
              </label>
            </div>
            {['weapon', 'armor'].map((slot) => {
              const id = player[slot];
              if (!id || !ITEMS[id]) return null;
              const lv = refineLevelOf(game, id);
              const req = refineRequirements(lv);
              const bonus = refineBonusForItem(game, id);
              const rate = useStone && countItem(player, 'refineStone') > 0 ? Math.min(98, req.ratePct + 15) : req.ratePct;
              const canTry =
                lv < 10 &&
                player.lexis >= req.lexis &&
                countItem(player, 'ore') >= req.ore &&
                countItem(player, 'crystal') >= req.crystal;
              return (
                <div key={slot} className="line">
                  <PixelIcon name={id} size={28} />
                  <div className="grow">
                    <span>
                      {refinedItemName(game, id)} <span className="gold">(+{bonus} {slot === 'weapon' ? 'Atk' : 'Def'})</span>
                    </span>
                    <span className="small">
                      {lv >= 10
                        ? 'Maximum refine level reached (+10).'
                        : `Rate ${rate}% · ${req.lexis}L · ${req.ore} Ore${req.crystal > 0 ? ` · ${req.crystal} Crystal` : ''}${lv >= 3 ? ' (Fail drops −1 unless protected)' : ''}`}
                    </span>
                  </div>
                  <button
                    className="px-button px-gold"
                    disabled={!canTry}
                    onClick={() => {
                      refineGear(game, slot, {
                        useProtection: useProt && countItem(player, 'protectionScroll') > 0,
                        useStone: useStone && countItem(player, 'refineStone') > 0,
                      });
                      refresh();
                    }}
                  >
                    {lv >= 10 ? 'MAX' : `Refine +${lv + 1}`}
                  </button>
                </div>
              );
            })}
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

        {(shop.kind === 'forge' || shop.kind === 'market') && nextBottleUpgrade(player) && (
          <>
            <span className="section">Water Bottle Upgrade</span>
            <BottleUpgradeRow game={game} onUpgrade={() => { upgradeBottle(game); refresh(); }} />
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

        {shop.kind === 'market' && game?.realism && (() => {
          const r = ensureRealism(game);
          return (
            <>
              <span className="section">Royal Bank, Exchange &amp; Town Shares</span>
              {r.world?.marketBoom && <span className="small" style={{ color: '#ffd23f' }}>📈 {r.world.marketBoom.label}</span>}
              <div className="line">
                <PixelIcon name="creditNote" size={28} />
                <div className="grow">
                  <span>Vault: <strong className="gold">{r.bank.balance || 0}L</strong> (1%/wk)</span>
                  <span className="small">
                    {r.debt.owed > 0 ? `Loan owed: ${r.debt.owed}L (due Day ${r.debt.dueDay})` : 'Exchange foreign coins or invest (+6%/day)'}
                  </span>
                </div>
              </div>
              <div className="row wrap" style={{ gap: 6, marginBottom: 6 }}>
                <button className="px-button" disabled={player.lexis < 100} onClick={() => { depositBank(game, 100); refresh(); }}>Deposit 100L</button>
                <button className="px-button" disabled={(r.bank.balance || 0) < 100} onClick={() => { withdrawBank(game, 100); refresh(); }}>Withdraw 100L</button>
                <button className="px-button px-gold" onClick={() => { exchangeAllForeignCoins(game); refresh(); }}>Convert Coins</button>
                <button className="px-button" disabled={player.lexis < 500 && (r.bank.balance || 0) < 500} onClick={() => { issuePromissoryNote(game); refresh(); }}>500L Draft</button>
                {countItem(player, 'creditNote') > 0 && (
                  <button className="px-button px-gold" onClick={() => { redeemPromissoryNote(game); refresh(); }}>Redeem Draft</button>
                )}
                {r.counterfeitBatch > 0 && (
                  <button className="px-button" onClick={() => { assayCounterfeitCoins(game); refresh(); }}>Assay Coins</button>
                )}
                {r.debt.owed <= 0 ? (
                  <button className="px-button" onClick={() => { onClose(); requestGuildLoan(game, 250); }}>Guild Loan (250L)</button>
                ) : (
                  <button className="px-button px-gold" disabled={player.lexis <= 0} onClick={() => { repayLoan(game); refresh(); }}>Repay Loan</button>
                )}
                <button className="px-button" disabled={player.lexis < 120} onClick={() => { investInTownWorkshop(game, econ.villageId, shop.kind, 120); refresh(); }}>Invest 120L</button>
              </div>
            </>
          );
        })()}

        <span className="section">To sell</span>
        {sellable.map((itemId) => {
          const sellVal = Math.max(1, Math.round(ITEMS[itemId].sell * (game?.realism ? marketBoomSellMultiplier(game, econ.villageId, itemId) * isTownDayMarketBonus(game) : 1)));
          return (
            <div key={itemId} className="line">
              <PixelIcon name={itemId} size={28} />
              <span className="grow">
                {ITEMS[itemId].name} <span className="gold">× {countItem(player, itemId)}</span>
              </span>
              <button className="px-button" onClick={() => sellItem(itemId)}>
                +{sellVal}
              </button>
            </div>
          );
        })}
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
