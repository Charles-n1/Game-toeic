import { useState } from 'react';
import PixelIcon from '../PixelIcon';
import { ITEMS } from '../../data/items';
import { GODDESS_SHRINES, APPRAISAL_TITLES } from '../../data/realism';
import {
  buildCodexSnapshot,
  setCombatFormation,
  equipAppraisalTitle,
  prayAtGoddessShrine,
  startDryingRackJob,
  studyAtHomeDesk,
} from '../../logic/realism/socialAndCodex';
import { sharpenWeaponAtForgeOrHome, saltRawFood } from '../../logic/realism/foodAndNature';
import { readNoticeBoardQuestion, readInboxLetter } from '../../logic/realism/englishWorld';
import { exchangeAllForeignCoins, depositBank, withdrawBank, payOffFinesOrDefend } from '../../logic/realism/financeAndLaw';
import { countItem } from '../../logic/player';

export default function CodexPanel({ game, refresh, onClose }) {
  const [sub, setSub] = useState('overview');
  const snap = buildCodexSnapshot(game);
  const monsterEntries = Object.entries(snap.monstersCodex || {});
  const ecoEntries = Object.entries(snap.ecosystem || {});

  function run(fn) {
    fn();
    if (refresh) refresh();
  }

  return (
    <>
      <div className="quest-tabs">
        {[
          { id: 'overview', label: 'Hero & Status' },
          { id: 'world', label: 'News, Mail & Lore' },
          { id: 'economy', label: 'Bank, Craft & Bestiary' },
        ].map((t) => (
          <button
            key={t.id}
            className={'quest-tab' + (sub === t.id ? ' quest-tab-active' : '')}
            onClick={() => setSub(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {sub === 'overview' && (
        <>
          <span className="section">
            Realism Mode ({String(snap.mode).toUpperCase()}) · {snap.caste.badge} {snap.caste.name}
          </span>
          <div className="line">
            <PixelIcon name="codex" size={28} />
            <div className="grow">
              <span>
                Active Title: <span className="gold">{snap.activeTitle.icon} {snap.activeTitle.name}</span>
              </span>
              <span className="small">{snap.activeTitle.desc}</span>
            </div>
          </div>

          <span className="section">Body &amp; Condition</span>
          <div className="line">
            <div className="grow">
              <span>
                Cleanliness {Math.round(snap.health.cleanliness ?? 90)}% · Morale {Math.round(snap.health.morale ?? 85)}% · Flayer Lv.{snap.skills.flayerLevel}
              </span>
              <span className="small">
                {snap.health.sprainHours > 0 ? `🩹 Sprained (${Math.ceil(snap.health.sprainHours)}h) · ` : ''}
                {snap.health.cutHours > 0 ? `🩸 Cut (${Math.ceil(snap.health.cutHours)}h) · ` : ''}
                {snap.health.infectionHours > 0 ? `🤒 Infected (${Math.ceil(snap.health.infectionHours)}h) · ` : ''}
                {snap.health.brokenArmHours > 0 ? `🦴 Fractured Arm (${Math.ceil(snap.health.brokenArmHours)}h) · ` : ''}
                {snap.health.brokenLegHours > 0 ? `🦴 Fractured Leg (${Math.ceil(snap.health.brokenLegHours)}h) · ` : ''}
                {snap.health.dysenteryHours > 0 ? `🤢 Dysentery (${Math.ceil(snap.health.dysenteryHours)}h) · ` : ''}
                {snap.health.wellRestedHours > 0 ? `☀️ Well Rested (${Math.ceil(snap.health.wellRestedHours)}h) · ` : ''}
                {snap.health.waterproofHours > 0 ? `🪔 Waterproof (${Math.ceil(snap.health.waterproofHours)}h) · ` : ''}
                Scars: {(snap.health.scars || []).length || 0}
              </span>
            </div>
            {snap.fines > 0 && (
              <button className="px-button" onClick={() => { onClose && onClose(); payOffFinesOrDefend(game); }}>
                Fines ({snap.fines}L)
              </button>
            )}
          </div>

          <span className="section">Combat Formation</span>
          <div className="row wrap" style={{ gap: 6 }}>
            {snap.formations.map((f) => (
              <button
                key={f.id}
                className={'px-button' + (snap.formation.id === f.id ? ' px-gold' : '')}
                onClick={() => run(() => setCombatFormation(game, f.id))}
                title={f.desc}
              >
                {f.icon} {f.name}
              </button>
            ))}
          </div>
          <span className="small">{snap.formation.desc}</span>

          <span className="section">Appraisal Titles ({snap.unlockedTitles.length}/{APPRAISAL_TITLES.length})</span>
          <div className="row wrap" style={{ gap: 6 }}>
            {snap.unlockedTitles.map((t) => (
              <button
                key={t.id}
                className={'px-button' + (snap.activeTitle.id === t.id ? ' px-gold' : '')}
                onClick={() => run(() => equipAppraisalTitle(game, t.id))}
                title={t.desc}
              >
                {t.icon} {t.name}
              </button>
            ))}
          </div>

          <span className="section">Political Factions &amp; Goddess Shrines</span>
          {Object.values(snap.factions).map((f) => (
            <div key={f.id} className="line">
              <div className="grow">
                <span>{f.icon} {f.name} · Standing <strong className="gold">{snap.factionScores[f.id] || 0}</strong></span>
                <span className="small">{f.perk}</span>
              </div>
            </div>
          ))}
          {snap.blessing ? (
            <span className="small" style={{ color: '#7cfc9a' }}>
              🛐 Active Blessing: {snap.blessing.icon} {snap.blessing.name} ({snap.blessing.desc})
            </span>
          ) : (
            <div className="row wrap" style={{ gap: 6, marginTop: 4 }}>
              {GODDESS_SHRINES.map((s) => (
                <button
                  key={s.id}
                  className="px-button"
                  disabled={(game.player?.lexis || 0) < s.cost}
                  onClick={() => run(() => prayAtGoddessShrine(game, s.id))}
                  title={s.desc}
                >
                  {s.icon} {s.name} ({s.cost}L)
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {sub === 'world' && (
        <>
          <span className="section">Town Crier Dispatches &amp; Market Boom</span>
          {snap.marketBoom && (
            <span className="small" style={{ color: '#ffd23f' }}>📈 {snap.marketBoom.label}</span>
          )}
          {(snap.news || []).length === 0 && <span className="small">Fresh dispatches arrive at sunrise.</span>}
          {(snap.news || []).map((line, idx) => (
            <span key={idx} className="small">📣 {line}</span>
          ))}

          <span className="section">Daily Village TOEIC Notices</span>
          <div className="line">
            <PixelIcon name="book" size={24} />
            <span className="grow small">
              {(snap.notices || []).length} notice(s) posted today. Reading carefully avoids surcharges and awards XP/Lexis.
            </span>
            <button
              className="px-button px-gold"
              onClick={() => {
                if (onClose) onClose();
                readNoticeBoardQuestion(game, 'lexia');
              }}
            >
              Read Notice
            </button>
          </div>

          <span className="section">Courier Inbox ({(snap.inbox || []).length})</span>
          {(snap.inbox || []).length === 0 && <span className="small">No courier letters yet.</span>}
          {(snap.inbox || []).map((mail) => (
            <div key={mail.id} className="line">
              <PixelIcon name="postLetter" size={24} />
              <div className="grow">
                <span>{mail.read ? '✓ ' : '✉️ '}{mail.subject}</span>
                <span className="small">From {mail.sender} · Day {mail.day}</span>
              </div>
              <button
                className="px-button px-gold"
                onClick={() => {
                  if (onClose) onClose();
                  readInboxLetter(game, mail.id);
                }}
              >
                {mail.read ? 'Re-read' : 'Read'}
              </button>
            </div>
          ))}

          <span className="section">Exploration Survey ({snap.surveyedPct}% · Cairns: {snap.cairns})</span>
          {ecoEntries.length > 0 && ecoEntries.map(([zid, eco]) => (
            <span key={zid} className="small">
              🌿 {zid}: Wolves {eco.wolves} · Deer {eco.deer}{eco.cropDamage ? ' (crop grazing)' : ''}
            </span>
          ))}
        </>
      )}

      {sub === 'economy' && (
        <>
          <span className="section">Royal Vault &amp; Regional Currencies</span>
          <div className="line">
            <PixelIcon name="creditNote" size={28} />
            <div className="grow">
              <span>Vault: <strong className="gold">{snap.bank.balance || 0} Lexis</strong> (1%/wk)</span>
              <span className="small">
                {snap.debt.owed > 0 ? `⚠️ Loan owed: ${snap.debt.owed}L (due Day ${snap.debt.dueDay})` : 'No active debt'}
              </span>
            </div>
            <button className="px-button" disabled={(game.player?.lexis || 0) < 50} onClick={() => run(() => depositBank(game, 50))}>+50L</button>
            <button className="px-button" disabled={(snap.bank.balance || 0) < 50} onClick={() => run(() => withdrawBank(game, 50))}>-50L</button>
            <button className="px-button px-gold" onClick={() => run(() => exchangeAllForeignCoins(game))}>Convert FX</button>
          </div>
          <div className="row wrap" style={{ gap: 8 }}>
            {Object.entries(snap.wallet || {}).map(([kId, amt]) => (
              <span key={kId} className="small">
                {snap.currencies[kId]?.short || kId}: {amt} (×{(snap.fxRates[kId] || 1).toFixed(2)})
              </span>
            ))}
          </div>

          <span className="section">Gear Quality &amp; Home Workstations</span>
          <div className="line">
            <div className="grow">
              <span>
                {snap.heirloom || ITEMS[game.player?.weapon]?.name || 'Weapon'} ({snap.quality?.weapon || 'standard'}) · Armor ({snap.quality?.armor || 'standard'})
              </span>
              <span className="small">
                Mana Vessel +{snap.manaTrain?.bonusMaxMp || 0} Max MP · Crystal Battery {snap.manaTrain?.crystalCharge || 0}/{snap.manaTrain?.maxCrystalCharge || 12}
              </span>
            </div>
            <button className="px-button" onClick={() => run(() => sharpenWeaponAtForgeOrHome(game))}>Sharpen</button>
          </div>
          <div className="row wrap" style={{ gap: 6 }}>
            {Object.values(snap.workstations).map((ws) => (
              <span key={ws.id} className="small" style={{ color: snap.ownedWorkstations[ws.id] ? '#7cfc9a' : '#9aa6b8' }}>
                {snap.ownedWorkstations[ws.id] ? '✓ ' : '🔒 '}
                {ws.name}
              </span>
            ))}
          </div>
          <div className="row wrap" style={{ gap: 6, marginTop: 4 }}>
            {snap.ownedWorkstations.dryingRack && (
              <button className="px-button" onClick={() => run(() => startDryingRackJob(game))}>Run Drying Rack</button>
            )}
            {snap.ownedWorkstations.studyShelf && (
              <button className="px-button" onClick={() => run(() => studyAtHomeDesk(game))}>Study at Desk (+15% XP)</button>
            )}
            {countItem(game.player, 'salt') > 0 && countItem(game.player, 'rawMeat') > 0 && (
              <button className="px-button" onClick={() => run(() => saltRawFood(game, 'rawMeat', 1))}>Salt Meat → Jerky</button>
            )}
          </div>

          <span className="section">Bestiary ({monsterEntries.length} species) &amp; Recipes ({snap.recipes.length})</span>
          {monsterEntries.length === 0 && <span className="small">Defeat monsters to record weaknesses in your Bestiary.</span>}
          {monsterEntries.map(([sp, info]) => (
            <span key={sp} className="small">• {sp}: slain {info.killed} · Weakness: {info.weakness}</span>
          ))}
        </>
      )}
    </>
  );
}
