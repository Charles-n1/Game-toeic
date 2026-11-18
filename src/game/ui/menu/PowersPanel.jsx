import { useState } from 'react';
import PixelIcon from '../PixelIcon';
import { maxMana } from '../../logic/player';
import { knownPowers, isPowerUnlocked, canUsePower, cooldownLeft, usePower, trainObsidianPower, dismissSoldiers, dismissPet, summonSeconds } from '../../logic/powers';
import { obsidianRankInfo } from '../../logic/obsidian';
import { SKILL_BRANCHES, SKILL_TREE, WRITTEN_INCANTATIONS, ELEMENTAL_SPIRITS } from '../../data/isekaiTodo';
import { ensureIsekaiTodo } from '../../logic/isekaiTodo/state';
import { isSkillUnlocked, canUnlockSkillNode, unlockSkillNode } from '../../logic/isekaiTodo/progression';
import {
  hasSilentCasting,
  offerIncantationDialog,
  hasTimeMagic,
  castTimeDilate,
  castTimeFreezeWorld,
  hasGravityMagic,
  castGravityCrush,
  castLevitate,
  startSpiritTrial,
  setActiveSpirit,
  talkToSpirit,
} from '../../logic/isekaiTodo/magicPlus';

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
            ♟️ Soldiers ×{player.soldiers} · {Math.round(player.soldierHp || player.soldiers * 45)} shield HP · {Math.ceil(player.soldierTime)} s
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

// The powers of the map: tap one to use it right where the hero stands, plus Skill Tree, Arcane Magic & Spirits.
export default function PowersPanel({ game, refresh, onClose }) {
  const [tab, setTab] = useState('powers'); // 'powers' | 'tree' | 'arcane' | 'spirits'
  const player = game.player;
  const todo = ensureIsekaiTodo(game);
  const maxMp = maxMana(player, game);

  function cast(power) {
    usePower(game, power.id);
    onClose();
    refresh();
  }

  return (
    <>
      <span style={styles.mana}>
        MP {Math.round(player.mana)} / {Math.round(maxMp)} · Skill Points: <strong className="gold">{todo.skillPoints}</strong>
        {player.powers.includes('obsidian') && ' · 🔮 Gift Lv.' + obsidianRankInfo(player).level + ': ' + obsidianRankInfo(player).title}
      </span>
      <div className="row wrap" style={{ gap: 6, marginBottom: 8 }}>
        {[
          { id: 'powers', label: 'World Powers' },
          { id: 'tree', label: `Skill Tree (${todo.skillPoints})` },
          { id: 'arcane', label: 'Incant & Time/Gravity' },
          { id: 'spirits', label: 'Spirits (4)' },
        ].map((t) => (
          <button key={t.id} className={'village-filter' + (tab === t.id ? ' village-filter-active' : '')} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'powers' && (
        <>
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
      {tab === 'powers' && hints(player).map((hint) => (
        <span key={hint} className="small" style={styles.hint}>
          ? {hint}
        </span>
      ))}
      {tab === 'powers' && null}
      </>
      )}

      {tab === 'tree' && (
        <>
          {SKILL_BRANCHES.map((branch) => (
            <div key={branch.id} style={{ marginBottom: 8 }}>
              <span className="section" style={{ color: branch.color }}>
                {branch.name}
              </span>
              {SKILL_TREE.filter((n) => n.branch === branch.id).map((node) => {
                const open = isSkillUnlocked(game, node.id);
                const check = canUnlockSkillNode(game, node.id);
                return (
                  <div key={node.id} className="line">
                    <div className="grow">
                      <span>
                        <strong className={open ? 'gold' : ''}>{node.name}</strong>{' '}
                        <span className="small">({node.cost} pt)</span>
                      </span>
                      <span className="small">{node.desc}</span>
                      {!open && !check.ok && <span className="small" style={{ color: '#ffb070' }}>🔒 {check.reason}</span>}
                    </div>
                    {open ? (
                      <span className="badge" style={{ backgroundColor: '#3f9b2f' }}>Active</span>
                    ) : (
                      <button
                        className="px-button px-gold"
                        disabled={!check.ok}
                        onClick={() => {
                          unlockSkillNode(game, node.id);
                          refresh();
                        }}
                      >
                        Unlock
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </>
      )}

      {tab === 'arcane' && (
        <>
          <span className="section">
            Written Incantations {hasSilentCasting(game) ? '· Silent Casting Active ✨' : ''}
          </span>
          {WRITTEN_INCANTATIONS.map((inc) => (
            <div key={inc.id} className="line">
              <PixelIcon name="quests" size={24} />
              <div className="grow">
                <span>
                  {inc.name} <span className="small">({inc.mpCost} MP)</span>
                </span>
                <span className="small">“{inc.prompt}”</span>
              </div>
              <button
                className="px-button px-gold"
                disabled={player.mana < inc.mpCost}
                onClick={() => {
                  onClose();
                  offerIncantationDialog(game, inc.id);
                  refresh();
                }}
              >
                Chant
              </button>
            </div>
          ))}

          <span className="section">Time &amp; Gravity Magic</span>
          <div className="line">
            <div className="grow">
              <span>⏳ Time Magic {hasTimeMagic(game) ? '' : '(Unlock via Skill Tree or Lv.6)'}</span>
              <span className="small">Freeze patrolling world monsters for 6s, or slow fight timers.</span>
            </div>
            <button
              className="px-button"
              disabled={!hasTimeMagic(game) || player.mana < 3}
              onClick={() => {
                castTimeFreezeWorld(game);
                onClose();
                refresh();
              }}
            >
              Freeze (3MP)
            </button>
            <button
              className="px-button"
              disabled={!hasTimeMagic(game) || player.mana < 2}
              onClick={() => {
                castTimeDilate(game, null);
                refresh();
              }}
            >
              Haste (2MP)
            </button>
          </div>
          <div className="line">
            <div className="grow">
              <span>🪶 Gravity Magic {hasGravityMagic(game) ? '' : '(Unlock via Skill Tree or Lv.7)'}</span>
              <span className="small">Levitate over water/lava for 30s, or crush nearby foes.</span>
            </div>
            <button
              className="px-button"
              disabled={!hasGravityMagic(game) || player.mana < 2}
              onClick={() => {
                castLevitate(game);
                onClose();
                refresh();
              }}
            >
              Levitate (2MP)
            </button>
            <button
              className="px-button"
              disabled={!hasGravityMagic(game) || player.mana < 2}
              onClick={() => {
                castGravityCrush(game, null);
                refresh();
              }}
            >
              Crush (2MP)
            </button>
          </div>
        </>
      )}

      {tab === 'spirits' && (
        <>
          <span className="section">Elemental Spirit Contracts</span>
          {ELEMENTAL_SPIRITS.map((sp) => {
            const bound = todo.spirits?.contracted?.[sp.id];
            const isActive = todo.spirits?.active === sp.id;
            return (
              <div key={sp.id} className="line">
                <span style={{ fontSize: 22, width: 28, textAlign: 'center' }}>{sp.icon}</span>
                <div className="grow">
                  <span>
                    <strong style={{ color: sp.color }}>{sp.name}</strong>{' '}
                    {bound && <span className="small gold">· Lv.{bound.level}</span>}
                    {isActive && <span className="small"> (Active)</span>}
                  </span>
                  <span className="small">{bound ? sp.bonusText : `${sp.bonusText} · Location: ${sp.placeHint}`}</span>
                </div>
                {bound ? (
                  <>
                    <button
                      className={'px-button' + (isActive ? ' px-gold' : '')}
                      disabled={isActive}
                      onClick={() => {
                        setActiveSpirit(game, sp.id);
                        refresh();
                      }}
                    >
                      {isActive ? 'Partner' : 'Call'}
                    </button>
                    <button
                      className="px-button"
                      onClick={() => {
                        onClose();
                        talkToSpirit(game, sp.id);
                        refresh();
                      }}
                    >
                      Talk
                    </button>
                  </>
                ) : (
                  <button
                    className="px-button px-gold"
                    onClick={() => {
                      onClose();
                      startSpiritTrial(game, sp.id);
                      refresh();
                    }}
                  >
                    Contract Trial
                  </button>
                )}
              </div>
            );
          })}
        </>
      )}
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
