import PixelIcon from '../PixelIcon';
import Bar from '../Bar';
import { TYPES } from '../../data/types';
import { ITEMS } from '../../data/items';
import { NPCS } from '../../data/npcs';
import { TAGS, TAG_NAMES, TAG_COLORS, tagOf, tagPercent, tagAnswers, skillPower, canEvolve, evolveSkill, nextTag, spellLevel } from '../../logic/skills';
import { maxHealth, speedOf, criticalChance, xpForLevel } from '../../logic/player';
import { attackPower, armorPower } from '../../logic/fight';
import { heroClass, classBonus } from '../../logic/classes';
import { activeBoosts } from '../../logic/boosts';
import { STAT_SLOTS, describeStatSlot, statLinkBonus } from '../../logic/statLinks';
import { customCategoryPercent, setToeicWeight, clearToeicWeights } from '../../logic/learning';
import { isVillain, ensureSociety } from '../../logic/society/state';

// The skill (spell) of a type: learned at which level, or who teaches it.
function skillText(game, type) {
  const level = spellLevel(game, type.id);
  if (level > 0) return 'Skill: ' + type.spell + ' (' + TAG_NAMES[TAGS[level - 1]] + ')';
  const teacher = NPCS.find((npc) => npc.teachesSkills && npc.teachesSkills.includes(type.id));
  return 'Skill not learned' + (teacher ? ': ' + teacher.name + ' teaches it' : '');
}

// One grammar type: its tag (Normal, Hard, Extreme), the % in this tag, its power, and the button to evolve it.
function SkillLine({ game, type, refresh }) {
  const tag = tagOf(game, type.id);
  const isFocus = game.focus.current === type.id;
  const ready = canEvolve(game, type.id);

  function evolve() {
    evolveSkill(game, type.id);
    refresh();
  }

  return (
    <div className="line">
      <PixelIcon name={type.id} size={28} />
      <div className="grow">
        <span style={styles.name}>
          {type.short} {isFocus && <span className="gold">◆</span>}
        </span>
        <span className="small">
          {TAG_NAMES[tag]}: {tagPercent(game, type.id, tag)}% ({tagAnswers(game, type.id, tag)} answers) · Power {skillPower(game, type.id)}
        </span>
        <span className="small">{skillText(game, type)}</span>
      </div>
      {ready ? (
        <button className="px-button px-gold" onClick={evolve}>
          ▲ {TAG_NAMES[nextTag(tag)]}
        </button>
      ) : (
        <span className="badge" style={{ backgroundColor: TAG_COLORS[tag] }}>
          {TAG_NAMES[tag]}
        </span>
      )}
    </div>
  );
}

// The hero's numbers, stat links, custom TOEIC weights, the class, and the skills: your grammar is your magic.
export default function StatsPanel({ game, refresh }) {
  const player = game.player;
  const current = heroClass(game);
  const boosts = activeBoosts(game);
  const society = ensureSociety(game);
  const villain = isVillain(game);

  function changeWeight(categoryId, value) {
    setToeicWeight(game, categoryId, value === '' ? 0 : Number(value));
    refresh();
  }

  return (
    <>
      <div style={styles.hero}>
        <span>
          Level {player.level} · XP {player.xp} / {xpForLevel(player.level)} · HP {player.health} / {maxHealth(player, game)}
        </span>
        <Bar value={player.xp / xpForLevel(player.level)} color="#7cfc9a" height={8} />
        <span className="small" style={styles.numbers}>
          Attack {attackPower(game)} · Armor {armorPower(game)} · Speed {speedOf(player, game)} · Critical{' '}
          {Math.round(criticalChance(player) * 100 + classBonus(game, 'critical'))}%
        </span>
        <span className="small">
          {ITEMS[player.weapon].name} · {ITEMS[player.armor].name} · {ITEMS[player.boots].name}
          {player.accessory && ITEMS[player.accessory] ? ' · ' + ITEMS[player.accessory].name : ''}
        </span>
        <span className="small">
          Class: {current ? current.title : 'none yet (Menu → Classes)'} · Infamy: {society.infamy}
          {villain ? ' · ☠ Villain' : ''}
          {player.cold?.active ? ' · 🤧 Cold (-2 Spd, -3 Atk)' : ''}
          {player.soldiers > 0 ? ' · ♟️ Soldiers ' + player.soldiers + ' (' + (player.soldierHp || player.soldiers * 45) + ' Shield HP)' : ''}
        </span>
        <span className="small">Aria can still carry you home {player.blessings} time(s). After that, death is the end.</span>
      </div>

      {boosts.length > 0 && (
        <>
          <span className="section">Active Boosts</span>
          <div style={styles.hero}>
            {boosts.map((b) => (
              <span key={b.source + ':' + b.stat} className="small" style={{ color: b.amount >= 0 ? '#7cfc9a' : '#ff8a95' }}>
                {b.source}: {b.stat} {b.amount >= 0 ? '+' : ''}
                {b.amount}
                {b.stat === 'spell' ? '%' : ''}
                {b.untilHour === null ? ' (permanent)' : ''}
              </span>
            ))}
          </div>
        </>
      )}

      <span className="section">English → Combat Stat Links (Priority Order)</span>
      <span className="small" style={styles.hint}>
        Weakest classes bind to the highest priority stats (2 per stat) and stay locked until &gt;90% across 2+ Normal tests.
      </span>
      {STAT_SLOTS.map((slot) => {
        const bonus = statLinkBonus(game, slot.id);
        const bound = describeStatSlot(game, slot.id);
        return (
          <div key={slot.id} className="line">
            <div className="grow">
              <span>
                {slot.rank}. {slot.name}{' '}
                <span className="small" style={{ color: bonus >= 0 ? '#7cfc9a' : '#ff8a95' }}>
                  ({bonus >= 0 ? '+' : ''}
                  {bonus}
                  {slot.id === 'spell' ? '%' : ''})
                </span>
              </span>
              <span className="small">
                {bound
                  .map((c) => c.name + ' ' + c.percent + '% ' + (c.locked ? '🔒' + c.tests + '/' + c.requiredTests : '🔓'))
                  .join(' · ')}
              </span>
            </div>
          </div>
        );
      })}

      <span className="section">Your language skills</span>
      {TYPES.map((type) => (
        <SkillLine key={type.id} game={game} type={type} refresh={refresh} />
      ))}

      <span className="section">Custom TOEIC Monster Focus (%)</span>
      <span className="small">
        Enter custom % per class (e.g. 60 in Verb Tenses) so wild monsters shift toward those classes. Leave blank for auto.
      </span>
      <div style={styles.weightsGrid}>
        {TYPES.map((type) => {
          const val = customCategoryPercent(game, type.id);
          return (
            <label key={type.id} className="row" style={styles.weightRow}>
              <PixelIcon name={type.id} size={20} />
              <span className="small grow">{type.short}</span>
              <input
                type="number"
                min="0"
                max="100"
                value={val > 0 ? val : ''}
                placeholder="Auto"
                onChange={(e) => changeWeight(type.id, e.target.value)}
                style={styles.weightInput}
              />
              <span className="small">%</span>
            </label>
          );
        })}
      </div>
      <button
        className="px-button"
        onClick={() => {
          clearToeicWeights(game);
          refresh();
        }}
      >
        Reset Auto Monster Focus
      </button>

      <span className="small" style={styles.hint}>
        Each tag is the level above the other: 100% in Normal = 20% in Hard. With more than 90% in your tag (on your last
        answers, at least 10), the skill can evolve: its monsters become Hard (5× health), but each good Hard answer hits
        5× harder and gives 5× more.
      </span>
      <span className="small" style={styles.hint}>
        ◆ = trained now. Reach your goal in it: the training moves to your next weakness.
      </span>
    </>
  );
}

const styles = {
  hero: {
    gap: 4,
  },
  numbers: {
    marginTop: 4,
  },
  name: {
    fontSize: 17,
  },
  hint: {
    marginTop: 4,
    marginBottom: 4,
  },
  weightsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))',
    gap: 6,
    marginTop: 6,
    marginBottom: 8,
  },
  weightRow: {
    gap: 6,
    alignItems: 'center',
  },
  weightInput: {
    width: 56,
    padding: '2px 4px',
    background: '#141a33',
    color: '#ffffff',
    border: '1px solid #6b7ab8',
    fontFamily: 'inherit',
  },
};
