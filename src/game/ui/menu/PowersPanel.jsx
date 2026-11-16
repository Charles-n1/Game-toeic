import PixelIcon from '../PixelIcon';
import { maxMana } from '../../logic/player';
import { knownPowers, isPowerUnlocked, canUsePower, cooldownLeft, usePower, trainObsidianPower, dismissSoldiers, dismissPet, summonSeconds } from '../../logic/powers';

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

// The obsidian soldiers and the cat that walk with the hero: the time they have left, and a button to send them away.
function ObsidianFollowers({ game, refresh }) {
  const player = game.player;
  if (player.soldiers <= 0 && !player.pet) return null;

  function send(dismiss) {
    dismiss(game);
    refresh();
  }

  return (
    <>
      <span className="section">With you</span>
      {player.soldiers > 0 && (
        <div className="line">
          <PixelIcon name="obsidianSoldier" size={28} />
          <span className="grow">
            ♟️ Soldiers ×{player.soldiers} · {player.soldierHp || player.soldiers * 45} shield HP · {Math.ceil(player.soldierTime)} s
          </span>
          <button className="px-button" onClick={() => send(dismissSoldiers)}>
            Dismiss
          </button>
        </div>
      )}
      {player.pet && (
        <div className="line">
          <PixelIcon name="obsidianPet" size={28} />
          <span className="grow">🐈‍⬛ Obsidian cat · {Math.ceil(player.petTime)} s</span>
          <button className="px-button" onClick={() => send(dismissPet)}>
            Dismiss
          </button>
        </div>
      )}
      <span className="small">They stay {summonSeconds(player)} s. Train "Obsidian Control" at a training dummy to keep them longer.</span>
    </>
  );
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
      <ObsidianFollowers game={game} refresh={refresh} />
      {(player.soldiers > 0 || player.pet) && <span className="section">Powers</span>}
      {knownPowers(player).map((power) => {
        const unlocked = isPowerUnlocked(player, power.id);
        const wait = cooldownLeft(game, power.id);
        if (!unlocked) {
          const xp = player.obsidianXp || 0;
          const need = power.train?.xp || 5;
          return (
            <div key={power.id} className="line">
              <PixelIcon name={power.id} size={28} />
              <div className="grow">
                <span>🔒 {power.name} (Needs Training)</span>
                <span className="small">
                  {power.text} · Mastery {Math.min(xp, need)}/{need} XP or pass a Trial
                </span>
              </div>
              <button
                className="px-button px-gold"
                onClick={() => {
                  onClose();
                  trainObsidianPower(game, power.id);
                  refresh();
                }}
              >
                Train
              </button>
            </div>
          );
        }
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
