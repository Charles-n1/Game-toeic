import Sheet from './Sheet';
import { maxMana } from '../logic/player';
import { knownPowers, canUsePower, cooldownLeft, usePower } from '../logic/powers';

// What the player does not know yet, without spoiling it.
function hints(player) {
  const list = [];
  if (!player.powers.includes('obsidian')) list.push('Something black sleeps in you. It wakes at level 3.');
  if (!player.powers.includes('lightning')) list.push('Something bright sleeps in you. Grief will wake it.');
  if (!['water', 'fire', 'wind', 'earth'].every((element) => player.powers.includes(element))) {
    list.push('Friends can teach you the elements: ask Yuki, Mira, Selene and Hana.');
  }
  return list;
}

// The powers of the map: tap one to use it right where the hero stands.
export default function PowersScreen({ game, refresh, onClose }) {
  const player = game.player;
  const powers = knownPowers(player);

  function cast(power) {
    usePower(game, power.id);
    onClose();
    refresh();
  }

  return (
    <Sheet title="Powers" onClose={onClose}>
      <span style={styles.mana}>
        🔮 Mana {player.mana} / {maxMana(player)}
      </span>
      {powers.map((power) => {
        const wait = cooldownLeft(game, power.id);
        return (
          <button key={power.id} className="line" style={styles.power} disabled={!canUsePower(game, power)} onClick={() => cast(power)}>
            <span className="icon">{power.icon}</span>
            <div className="grow">
              <span style={styles.name}>{power.name}</span>
              <span className="small">{power.text}</span>
            </div>
            <span className="small">{wait > 0 ? wait + ' s' : power.mana + ' 🔮'}</span>
          </button>
        );
      })}
      {hints(player).map((hint) => (
        <span key={hint} className="small" style={styles.hint}>
          ❔ {hint}
        </span>
      ))}
    </Sheet>
  );
}

const styles = {
  mana: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
  },
  power: {
    color: '#f4f0ff',
    textAlign: 'left',
  },
  name: {
    fontWeight: 'bold',
  },
  hint: {
    marginTop: 8,
  },
};
