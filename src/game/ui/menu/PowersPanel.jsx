import PixelIcon from '../PixelIcon';
import { maxMana } from '../../logic/player';
import { knownPowers, canUsePower, cooldownLeft, usePower } from '../../logic/powers';

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
export default function PowersPanel({ game, refresh, onClose }) {
  const player = game.player;

  function cast(power) {
    usePower(game, power.id);
    onClose();
    refresh();
  }

  return (
    <>
      <span style={styles.mana}>
        MP {player.mana} / {maxMana(player)}
      </span>
      {knownPowers(player).map((power) => {
        const wait = cooldownLeft(game, power.id);
        return (
          <button key={power.id} className="menu-item" disabled={!canUsePower(game, power)} onClick={() => cast(power)}>
            <PixelIcon name={power.id} size={28} />
            <div className="grow">
              <span>{power.name}</span>
              <span className="small">{power.text}</span>
            </div>
            <span className="small">{wait > 0 ? wait + ' s' : power.mana + ' MP'}</span>
          </button>
        );
      })}
      {hints(player).map((hint) => (
        <span key={hint} className="small" style={styles.hint}>
          ? {hint}
        </span>
      ))}
    </>
  );
}

const styles = {
  mana: {
    color: '#8fb8ff',
    marginBottom: 6,
  },
  hint: {
    marginTop: 8,
  },
};
