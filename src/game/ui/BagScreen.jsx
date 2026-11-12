import Sheet from './Sheet';
import Hearts from './Hearts';
import Bar from './Bar';
import { ITEMS } from '../data/items';
import { TYPES } from '../data/types';
import { npcOf } from '../data/npcs';
import { maxHealth, maxMana, speedOf, strikePower, armorOf, criticalChance, xpForLevel, usePotion, countItem } from '../logic/player';
import { skillPercent, spellRank } from '../logic/learning';
import { sendHome } from '../logic/people';
import { allyCount } from '../logic/fight';

// One skill = one grammar category: its level (the % of good answers) and the rank of its spell.
function SkillLine({ game, type }) {
  const percent = skillPercent(game, type.id);
  const rank = spellRank(game, type.id);
  const isFocus = game.focus.current === type.id;
  return (
    <div style={styles.skill}>
      <div className="row between">
        <span style={styles.skillName}>
          {type.icon} {type.name} {isFocus ? '🎯' : ''}
        </span>
        <span className="small">
          {percent}% · {rank > 0 ? type.spell + ' ' + rank : 'spell locked'}
        </span>
      </div>
      <Bar value={percent / 100} color={type.color} />
    </div>
  );
}

// The hero: stats, equipment, skills, companions, and the bag.
export default function BagScreen({ game, refresh, onClose }) {
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
    <Sheet title={'Hero · Level ' + player.level} onClose={onClose}>
      <div style={styles.block}>
        <Hearts value={player.health} max={maxHealth(player)} />
        <span className="small">
          🔮 Mana {player.mana}/{maxMana(player)} · XP {player.xp}/{xpForLevel(player.level)} · 🪙 {player.lexis} Lexis
        </span>
        <span className="small">
          ⚔️ Damage {(strikePower(player) + allyCount(player)) / 2} ❤ · 🛡️ Armor {armorOf(player)} · 💨 Speed {speedOf(player)} · 💥 Critical {Math.round(criticalChance(player) * 100)}%
        </span>
        <span className="small">
          {ITEMS[player.weapon].icon} {ITEMS[player.weapon].name} · {ITEMS[player.armor].icon} {ITEMS[player.armor].name} · {ITEMS[player.boots].icon} {ITEMS[player.boots].name}
        </span>
        <span className="small">🕊️ Aria can still save you {player.blessings} time(s). After that, death is the end.</span>
      </div>

      <span className="subtitle">Bag</span>
      {itemIds.length === 0 && <span className="small">Empty.</span>}
      {itemIds.map((itemId) => (
        <div key={itemId} className="line">
          <span className="icon">{ITEMS[itemId].icon}</span>
          <div className="grow">
            <span>
              {ITEMS[itemId].name} × {countItem(player, itemId)}
            </span>
            {ITEMS[itemId].text && <span className="small">{ITEMS[itemId].text}</span>}
          </div>
          {ITEMS[itemId].kind === 'potion' && (
            <button className="btn" onClick={() => useItem(itemId)}>
              Use
            </button>
          )}
        </div>
      ))}

      {player.party.length > 0 && <span className="subtitle">Companions</span>}
      {player.party.map((npcId) => (
        <div key={npcId} className="line">
          <span className="icon">⚔️</span>
          <span className="grow">{npcOf(npcId).name} · +1 damage</span>
          <button className="btn" onClick={() => dismiss(npcId)}>
            Send home
          </button>
        </div>
      ))}

      <span className="subtitle">Skills (your grammar = your magic)</span>
      {TYPES.map((type) => (
        <SkillLine key={type.id} game={game} type={type} />
      ))}
    </Sheet>
  );
}

const styles = {
  block: {
    marginTop: 10,
  },
  skill: {
    marginBottom: 10,
  },
  skillName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 3,
  },
};
