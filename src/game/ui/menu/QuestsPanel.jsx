import { useState } from 'react';
import Bar from '../Bar';
import Portrait from '../Portrait';
import PixelIcon from '../PixelIcon';
import DiaryTab from './DiaryTab';
import { VILLAGES, VILLAGE_LEVELS, villageOf } from '../../data/zones';
import { NPCS, npcOf } from '../../data/npcs';
import { questOf } from '../../data/quests';
import { ITEMS } from '../../data/items';
import { goalOf, CHAPTERS } from '../../data/story';
import { typeOf } from '../../data/types';
import { currentChapter } from '../../logic/chapters';
import {
  activeQuests,
  availableSideQuests,
  startQuest,
  finishQuest,
  isQuestReady,
  questProgress,
  ensureUrgentQuests,
  acceptUrgentQuest,
  turnInUrgentQuest,
  urgentQuestProgress,
  isUrgentQuestReady,
} from '../../logic/quests';
import { daysBeforeRaid } from '../../logic/raid';
import { partnerOf, childrenOf } from '../../logic/families';
import { bountyProgress } from '../../logic/society/worldLife';
import { isVillageUnderAttack, isNpcKidnapped } from '../../logic/war';
import { ensureGuild, rankInfo, nextRankInfo, guildContractProgress, abandonGuildContract } from '../../logic/guild/ranks';
import { ensureIsekaiTodo } from '../../logic/isekaiTodo/state';
import { canFoundOwnGuild, foundOwnGuild, ownGuildCap, recruitableGuildCandidates, addOwnGuildMember, sendOwnGuildMission, upgradeOwnGuildHall } from '../../logic/isekaiTodo/ownGuild';
import { towerState, enterTowerFloor, SECRET_CLUES, canOpenSecretFloor, trySecretFloorRiddle, raidSquadRoles, startGroupRaid } from '../../logic/isekaiTodo/dungeonsPlus';

function nameOf(id) {
  return id === 'player' ? 'you' : npcOf(id).name;
}

function npcPlaceLabel(npc) {
  if (!npc.at) return 'On the roads';
  if (npc.at[0] === 'wild') return 'Wilderness grove';
  return villageOf(npc.at[0])?.name || 'Eldermoor';
}

function familyText(game, npcId) {
  const partner = partnerOf(game, npcId);
  const children = childrenOf(game, npcId);
  if (!partner) return '';
  return ' · Married to ' + nameOf(partner) + (children.length > 0 ? ' · ' + children.join(', ') : '');
}

function StoryBanner({ game }) {
  const goal = goalOf(game.goal);
  const chapter = currentChapter(game);
  const total = CHAPTERS[game.goal].length;
  const doneCount = Math.min(game.chapter, total);
  return (
    <div className="quest-hero-card">
      <div className="quest-hero-head">
        <span className="gold" style={styles.cardTitle}>
          👑 {goal.title}
        </span>
        <span className="quest-pill quest-pill-gold">
          {chapter ? `Chapter ${game.chapter + 1} / ${total}` : 'Completed'}
        </span>
      </div>
      {chapter ? (
        <>
          <span style={styles.chapterTitle}>{chapter.title}</span>
          <span className="small">{chapter.text}</span>
          <Bar value={(doneCount + 0.5) / total} color="#ffd86b" height={6} />
        </>
      ) : (
        <span className="small">Your main story is complete. Explore, protect the kingdoms, and live freely!</span>
      )}
    </div>
  );
}

function QuestCard({ game, quest, ready, available, refresh }) {
  const giver = npcOf(quest.giver);
  const progress = available ? { have: 0, need: quest.needs.count || 1 } : questProgress(game, quest);
  const pct = progress.need > 0 ? progress.have / progress.need : 0;
  return (
    <div className={'quest-card' + (ready ? ' quest-card-ready' : '')}>
      <div className="quest-card-top">
        <Portrait look={giver.look} size={36} />
        <div className="grow" style={styles.minCol}>
          <div className="row between wrap" style={styles.headRow}>
            <span style={styles.cardTitle}>{quest.title}</span>
            <span className={'quest-pill' + (ready ? ' quest-pill-ready' : available ? ' quest-pill-gold' : '')}>
              {ready ? '✓ Ready!' : available ? 'New (!)' : `${progress.have}/${progress.need}`}
            </span>
          </div>
          <span className="small">
            {giver.name} · 📍 {npcPlaceLabel(giver)}
          </span>
        </div>
      </div>

      <span className="small" style={styles.quote}>
        “{quest.ask}”
      </span>

      {!available && <Bar value={pct} color={ready ? '#7cfc9a' : '#ffd23f'} height={6} />}

      <div className="row between wrap" style={{ gap: 6, marginTop: 2 }}>
        <div className="quest-card-rewards">
          <span className="quest-reward-chip">
            <PixelIcon name="lexis" size={14} /> +{quest.lexis} Lexis
          </span>
          {quest.gift && ITEMS[quest.gift] && (
            <span className="quest-reward-chip">
              <PixelIcon name={quest.gift} size={14} /> {ITEMS[quest.gift].name}
            </span>
          )}
          <span className="quest-reward-chip">♥ Friendship +10</span>
        </div>
        {available && (
          <button
            className="px-button px-gold"
            onClick={() => {
              startQuest(game, quest);
              if (refresh) refresh();
            }}
          >
            Accept
          </button>
        )}
        {ready && !available && (
          <button
            className="px-button px-green"
            onClick={() => {
              finishQuest(game, quest);
              if (refresh) refresh();
            }}
          >
            Complete!
          </button>
        )}
      </div>
    </div>
  );
}

function BountyCard({ game, bounty }) {
  const have = bountyProgress(game, bounty);
  const ready = have >= bounty.need;
  const vName = villageOf(bounty.villageId)?.name || 'Village';
  return (
    <div className={'quest-card' + (ready ? ' quest-card-ready' : '')}>
      <div className="quest-card-top">
        <PixelIcon name="quests" size={32} />
        <div className="grow" style={styles.minCol}>
          <div className="row between wrap" style={styles.headRow}>
            <span style={styles.cardTitle}>{bounty.title}</span>
            <span className={'quest-pill' + (ready ? ' quest-pill-ready' : ' quest-pill-gold')}>
              {ready ? '✓ Turn in at Board!' : `${have}/${bounty.need}`}
            </span>
          </div>
          <span className="small">📜 Village Bounty · Turn in: {vName}</span>
        </div>
      </div>
      <Bar value={have / Math.max(1, bounty.need)} color={ready ? '#7cfc9a' : '#e89040'} height={6} />
      <div className="quest-card-rewards">
        <span className="quest-reward-chip">
          <PixelIcon name="lexis" size={14} /> +{bounty.reward} Lexis
        </span>
        <span className="quest-reward-chip">★ +{bounty.xp} XP</span>
      </div>
    </div>
  );
}

function PersonLine({ game, npc }) {
  const state = game.npcs[npc.id];
  const kidnapped = isNpcKidnapped(game, npc.id);
  return (
    <div className="quest-card">
      <div className="quest-card-top">
        <Portrait look={npc.look} size={34} />
        <div className="grow" style={styles.minCol}>
          <div className="row between wrap" style={styles.headRow}>
            <span style={state.alive ? styles.cardTitle : styles.dead}>
              {state.alive ? '' : '✝ '}
              {npc.name}
            </span>
            <span className={'quest-pill' + (kidnapped ? ' quest-pill-danger' : '')}>
              {!state.alive ? 'Fallen' : kidnapped ? '🚨 Kidnapped' : `♥ ${state.friendship}`}
            </span>
          </div>
          <span className="small">{npc.role + familyText(game, npc.id)}</span>
        </div>
      </div>
      {state.alive && <Bar value={state.friendship / 100} color="#ff7eb6" height={5} />}
    </div>
  );
}

// Beautiful tabbed Quests & Journal menu, crafted to feel crisp on both mobile and desktop.
export default function QuestsPanel({ game, refresh, onClose }) {
  const [tab, setTab] = useState('quests');
  const [villageFilter, setVillageFilter] = useState('all');
  const [showCompleted, setShowCompleted] = useState(false);
  const [guildName, setGuildName] = useState('Dawnblade Guild');
  const [guildBanner, setGuildBanner] = useState('#ffd23f');
  const BANNER_COLORS = ['#ffd23f', '#e8423f', '#3a7bff', '#4cc35a', '#b48cff', '#ff6fa8'];
  const todo = ensureIsekaiTodo(game);
  const og = todo.ownGuild;
  const tower = towerState(game);
  const raidRoles = raidSquadRoles(game);
  const foundCheck = canFoundOwnGuild(game);
  const candidates = recruitableGuildCandidates(game);

  const focus = typeOf(game.focus.current);
  const quests = activeQuests(game);
  const readyQuests = quests.filter((q) => isQuestReady(game, q));
  const urgentList = ensureUrgentQuests(game);
  const guild = ensureGuild(game);
  const gInfo = rankInfo(guild.rank);
  const gNext = nextRankInfo(guild.rank);
  const guildContracts = guild.activeContracts || [];
  const bounties = Object.values(game.society?.bounties || {}).filter((b) => b.active && !b.done);
  const available = availableSideQuests(game);
  const completed = Object.keys(game.quests || {}).filter((id) => game.quests[id]?.done);
  const met = NPCS.filter((npc) => game.npcs[npc.id].talkedDay > 0 || game.npcs[npc.id].met || !game.npcs[npc.id].alive);
  const filteredVillages = VILLAGES.filter((village) => {
    const st = game.villages[village.id];
    if (villageFilter === 'threat') return st.owner === 'monsters' || isVillageUnderAttack(game, village.id);
    if (villageFilter === 'people') return st.owner === 'people';
    return true;
  });

  const tabs = [
    { id: 'quests', icon: '📜', label: 'Quests', count: quests.length + bounties.length + guildContracts.length + urgentList.filter((u) => u.accepted).length },
    { id: 'expeditions', icon: '🏰', label: 'Guild & Spire' },
    { id: 'focus', icon: '🎯', label: 'Focus' },
    { id: 'villages', icon: '🧭', label: 'Towns', count: VILLAGES.length },
    { id: 'people', icon: '♥', label: 'Bonds', count: met.length },
    { id: 'diary', icon: '📖', label: 'Diary' },
  ];

  return (
    <>
      <div className="quest-tabs">
        {tabs.map((item) => (
          <button
            key={item.id}
            className={'quest-tab' + (tab === item.id ? ' quest-tab-active' : '')}
            onClick={() => setTab(item.id)}
          >
            <span>{item.icon}</span>
            <span>
              {item.label}
              {item.count !== undefined ? ` (${item.count})` : ''}
            </span>
          </button>
        ))}
      </div>

      {tab === 'quests' && (
        <>
          <StoryBanner game={game} />

          <div className="quest-card" style={{ marginTop: 8 }}>
            <div className="quest-card-top">
              <PixelIcon name="crown" size={28} />
              <div className="grow">
                <span>Adventurer Guild · {gInfo.title}</span>
                <span className="small">
                  Points: {guild.points} {gNext ? `/ ${gNext.minPts} for Rank ${gNext.id}` : '(MAX)'} · Party cap {gInfo.partyCap} · Completed {guild.completed}
                </span>
              </div>
            </div>
            {gNext && <Bar value={guild.points / gNext.minPts} color="#ffd23f" height={5} />}
          </div>

          {guildContracts.length > 0 && (
            <>
              <span className="section">Active Guild Contracts ({guildContracts.length}/2)</span>
              {guildContracts.map((c) => {
                const have = guildContractProgress(game, c);
                const ready = have >= c.need;
                return (
                  <div key={c.id} className={'quest-card' + (ready ? ' quest-card-ready' : '')}>
                    <div className="quest-card-top">
                      <PixelIcon name="quests" size={28} />
                      <div className="grow">
                        <span>{c.title}</span>
                        <span className="small">
                          {c.desc} ({have}/{c.need}) · +{c.lexis} Lexis · +{c.points} pts
                        </span>
                      </div>
                      <button className="px-button" onClick={() => { abandonGuildContract(game, c.id); if (refresh) refresh(); }}>
                        Drop
                      </button>
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {urgentList.length > 0 && (
            <>
              <span className="section">🚨 Urgent Town Crier Quests ({urgentList.length})</span>
              <div className="quest-board-2x">
                {urgentList.map((uq) => {
                  const prog = urgentQuestProgress(game, uq);
                  const ready = uq.accepted && isUrgentQuestReady(game, uq);
                  return (
                    <div key={uq.id} className={'quest-card quest-card-urgent' + (ready ? ' quest-card-ready' : '')}>
                      <div className="quest-card-top">
                        <PixelIcon name="quests" size={28} />
                        <div className="grow" style={styles.minCol}>
                          <div className="row between wrap" style={styles.headRow}>
                            <span style={styles.cardTitle}>{uq.title}</span>
                            <span className={'quest-pill ' + (ready ? 'quest-pill-ready' : 'quest-pill-danger')}>
                              {ready ? '✓ Ready!' : uq.accepted ? `${prog.have}/${prog.need}` : 'URGENT'}
                            </span>
                          </div>
                          <span className="small">📢 Shouted by Town Criers across villages</span>
                        </div>
                      </div>
                      <span className="small" style={styles.quote}>“{uq.ask}”</span>
                      <div className="row between wrap" style={{ gap: 6, marginTop: 2 }}>
                        <div className="quest-card-rewards">
                          <span className="quest-reward-chip">+{uq.lexis} Lexis</span>
                          <span className="quest-reward-chip">♥ +{uq.rep} Town Mood</span>
                        </div>
                        {!uq.accepted ? (
                          <button
                            className="px-button px-gold"
                            onClick={() => {
                              acceptUrgentQuest(game, uq.id);
                              if (refresh) refresh();
                            }}
                          >
                            Accept Urgent
                          </button>
                        ) : ready ? (
                          <button
                            className="px-button px-green"
                            onClick={() => {
                              turnInUrgentQuest(game, uq.id);
                              if (refresh) refresh();
                            }}
                          >
                            Turn In!
                          </button>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          <span className="section">
            Active Quests {readyQuests.length > 0 ? `· ${readyQuests.length} Ready!` : ''}
          </span>
          {quests.length === 0 && bounties.length === 0 ? (
            <div className="quest-empty">
              <PixelIcon name="quests" size={28} />
              <span>No active quest yet</span>
              <span className="small">Talk to townsfolk marked with ! or check any Guild / Town Quest Board.</span>
            </div>
          ) : (
            <div className="quest-board-2x">
              {quests.map((quest) => (
                <QuestCard key={quest.id} game={game} quest={quest} ready={isQuestReady(game, quest)} refresh={refresh} />
              ))}
              {bounties.map((bounty) => (
                <BountyCard key={bounty.id} game={game} bounty={bounty} />
              ))}
            </div>
          )}

          {available.length > 0 && (
            <>
              <span className="section">📜 Side Quests Board ({available.length})</span>
              <div className="quest-board-2x">
                {available.map((quest) => (
                  <QuestCard key={quest.id} game={game} quest={quest} available refresh={refresh} />
                ))}
              </div>
            </>
          )}

          {completed.length > 0 && (
            <div style={styles.completedWrap}>
              <button className="village-filter" onClick={() => setShowCompleted((v) => !v)}>
                {showCompleted ? '▾' : '▸'} Completed Quests ({completed.length})
              </button>
              {showCompleted && (
                <div style={styles.completedList}>
                  {completed.map((id) => {
                    const item = questOf(id);
                    return (
                      <span key={id} className="small">
                        ✔ {item ? item.title : id}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {tab === 'focus' && (
        <>
          <div className="quest-hero-card">
            <div className="quest-hero-head">
              <div className="row" style={styles.focusRow}>
                <PixelIcon name={focus.id} size={24} />
                <span className="gold" style={styles.cardTitle}>
                  {focus.name}
                </span>
              </div>
              <span className="quest-pill quest-pill-gold">
                {game.targetScore ? `Target ${game.targetScore} · ` : ''}Goal {game.run.goalRate}%
              </span>
            </div>
            <span className="small">
              Current streak: {game.focus.tally.good} right / {game.focus.tally.bad} wrong (minimum 8 answers to master).
            </span>
            <Bar value={Math.min(1, game.focus.tally.good / 8)} color="#7cfc9a" height={7} />
          </div>

          <span className="section">Eldermoor &amp; Raids</span>
          <div className="quest-card">
            <div className="row between">
              <span>Village Happiness</span>
              <span className="gold">{game.happiness} / 100</span>
            </div>
            <Bar value={game.happiness / 100} color="#ffd23f" height={7} />
            <span className="small">Quests &amp; feasts lift village happiness (better shop prices and faster friendships).</span>
            <span className="small" style={styles.raid}>
              {game.bosses.king ? '☀ The North speaks again — no raids remain.' : `⚔ Next raid in ${daysBeforeRaid(game)} day(s) · Raids survived: ${game.raid.count}`}
            </span>
          </div>
        </>
      )}

      {tab === 'expeditions' && (
        <>
          <span className="section">Own Adventurer Guild</span>
          {!og.founded ? (
            <div className="quest-card">
              <span>Found Your Own Guild Charter</span>
              <span className="small">Recruit companions &amp; friendly monsters, build dorm rooms, and dispatch idle missions.</span>
              <input
                type="text"
                value={guildName}
                maxLength={26}
                onChange={(e) => setGuildName(e.target.value)}
                style={{ padding: '4px 6px', background: '#141a33', color: '#fff', border: '1px solid #6b7ab8', fontFamily: 'inherit' }}
              />
              <div className="row" style={{ gap: 6, alignItems: 'center' }}>
                <span className="small">Banner Crest:</span>
                {BANNER_COLORS.map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setGuildBanner(col)}
                    title={col}
                    style={{
                      width: 18,
                      height: 18,
                      backgroundColor: col,
                      border: guildBanner === col ? '2px solid #ffffff' : '1px solid #141a33',
                      borderRadius: 3,
                      cursor: 'pointer',
                    }}
                  />
                ))}
              </div>
              {!foundCheck.ok && <span className="small" style={{ color: '#ffb070' }}>🔒 {foundCheck.reason}</span>}
              <button
                className="px-button px-gold"
                disabled={!foundCheck.ok}
                onClick={() => {
                  foundOwnGuild(game, guildName.trim() || 'Dawnblade Guild', guildBanner);
                  if (refresh) refresh();
                }}
              >
                Found Guild (150 Lexis)
              </button>
            </div>
          ) : (
            <div className="quest-card" style={{ borderLeft: `4px solid ${og.banner || '#ffd23f'}` }}>
              <div className="row between">
                <span className="gold" style={styles.cardTitle}>
                  <span style={{ display: 'inline-block', width: 10, height: 10, backgroundColor: og.banner || '#ffd23f', marginRight: 6, border: '1px solid #0e1430' }} />
                  {og.name} (Lv.{og.level}/5)
                </span>
                <span className="small">Members {og.members.length}/{ownGuildCap(game)} · Dorm Rooms {og.rooms}</span>
              </div>
              {og.level < 5 && (
                <button
                  className="px-button"
                  disabled={game.player.lexis < 120 * og.level}
                  onClick={() => { upgradeOwnGuildHall(game); if (refresh) refresh(); }}
                >
                  Expand Guild Hall ({120 * og.level} Lexis)
                </button>
              )}
              {og.members.map((m) => (
                <div key={m.id} className="line">
                  <div className="grow">
                    <span>{m.name} <span className="small">({m.kind})</span></span>
                    <span className="small">
                      {m.status === 'mission' ? `On expedition (returns Day ${m.returnDay})` : m.injuredUntilDay > game.day ? `Resting injury until Day ${m.injuredUntilDay}` : `Idle · Power ${m.power}`}
                    </span>
                  </div>
                  <button
                    className="px-button px-gold"
                    disabled={m.status !== 'idle' || m.injuredUntilDay > game.day}
                    onClick={() => { sendOwnGuildMission(game, m.id); if (refresh) refresh(); }}
                  >
                    Dispatch
                  </button>
                </div>
              ))}
              {candidates.length > 0 && og.members.length < ownGuildCap(game) && (
                <>
                  <span className="small">Recruit available allies:</span>
                  <div className="row wrap" style={{ gap: 4 }}>
                    {candidates.slice(0, 6).map((c) => (
                      <button
                        key={c.id}
                        className="px-button"
                        onClick={() => { addOwnGuildMember(game, c); if (refresh) refresh(); }}
                      >
                        + {c.name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          <span className="section">Spire of Babel · 10-Floor Dungeon Tower</span>
          <div className="quest-card">
            <span>Unlocked Floor: <strong className="gold">{tower.maxFloor} / 10</strong> · Checkpoint: Floor {tower.checkpoint}</span>
            <span className="small">Bosses wait on Floors 5 &amp; 10. Beating Floor 5 unlocks a permanent Floor 6 Checkpoint!</span>
            <div className="row wrap" style={{ gap: 6 }}>
              <button
                className="px-button px-gold"
                onClick={() => {
                  if (onClose) onClose();
                  enterTowerFloor(game, tower.maxFloor);
                  if (refresh) refresh();
                }}
              >
                Enter Floor {tower.maxFloor}
              </button>
              {tower.checkpoint > 1 && (
                <button
                  className="px-button"
                  onClick={() => {
                    if (onClose) onClose();
                    enterTowerFloor(game, tower.checkpoint);
                    if (refresh) refresh();
                  }}
                >
                  Warp Floor {tower.checkpoint}
                </button>
              )}
              <button
                className="px-button"
                onClick={() => {
                  if (onClose) onClose();
                  enterTowerFloor(game, 1);
                  if (refresh) refresh();
                }}
              >
                Climb From F1
              </button>
            </div>
          </div>

          <span className="section">Group Raid · 3-Role Squad</span>
          <div className="quest-card">
            <span>Roles: {raidRoles.map((r) => `${r.name} (${r.role})`).join(' · ')}</span>
            <span className="small">Answer fast to issue All-Out Raid Volley; answer steady for Phalanx &amp; Heal!</span>
            <button
              className="px-button px-gold"
              onClick={() => {
                if (onClose) onClose();
                startGroupRaid(game);
                if (refresh) refresh();
              }}
            >
              Launch Group Raid
            </button>
          </div>

          <span className="section">Secret Dungeon Floors (English Clues)</span>
          {Object.values(SECRET_CLUES).map((clue) => {
            const unlocked = Boolean(todo.tower?.secretUnlocked?.[clue.dungeonId]);
            const cleared = Boolean(todo.tower?.secretCleared?.[clue.dungeonId]);
            const avail = canOpenSecretFloor(game, clue.dungeonId);
            return (
              <div key={clue.dungeonId} className="line">
                <div className="grow">
                  <span>{clue.chamberName} <span className="small">({clue.dungeonName})</span></span>
                  <span className="small">
                    {cleared ? '✓ Secret Treasure Claimed' : unlocked ? 'Opened — Defeat Hidden Boss!' : 'Decipher the ancient wall riddle to unlock.'}
                  </span>
                </div>
                <button
                  className="px-button"
                  disabled={!avail}
                  onClick={() => {
                    if (onClose) onClose();
                    trySecretFloorRiddle(game, clue.dungeonId);
                    if (refresh) refresh();
                  }}
                >
                  {cleared ? 'Done' : unlocked ? 'Fight Boss' : 'Solve Clue'}
                </button>
              </div>
            );
          })}
        </>
      )}

      {tab === 'villages' && (
        <>
          <div className="village-filters">
            {[
              { id: 'all', label: `All (${VILLAGES.length})` },
              { id: 'threat', label: '⚔ Under Threat' },
              { id: 'people', label: '🛡 Free' },
            ].map((f) => (
              <button
                key={f.id}
                className={'village-filter' + (villageFilter === f.id ? ' village-filter-active' : '')}
                onClick={() => setVillageFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="village-grid">
            {filteredVillages.map((village) => {
              const st = game.villages[village.id];
              const attacked = isVillageUnderAttack(game, village.id);
              const fallen = st.owner === 'monsters';
              return (
                <div key={village.id} className={'village-card' + (fallen || attacked ? ' village-card-danger' : '')}>
                  <div className="row between wrap" style={styles.headRow}>
                    <span className="gold" style={styles.cardTitle}>
                      {village.name}
                    </span>
                    <span className={'quest-pill' + (fallen || attacked ? ' quest-pill-danger' : '')}>
                      {fallen ? '👹 Occupied' : attacked ? '🔥 Under Siege' : VILLAGE_LEVELS[st.level].name}
                    </span>
                  </div>
                  <span className="small">
                    🪵 {st.wood} · 🪨 {st.stone} · 🌾 {st.food}
                    {st.bridge ? ' · 🌉 Bridge' : ''}
                    {(st.turrets || []).length > 0 ? ` · 🏹 ${st.turrets.length}` : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}

      {tab === 'diary' && <DiaryTab game={game} />}

      {tab === 'people' && (
        <>
          {met.length === 0 ? (
            <div className="quest-empty">
              <PixelIcon name="people" size={28} />
              <span>No companions met yet</span>
              <span className="small">Explore Eldermoor and talk to townsfolk!</span>
            </div>
          ) : (
            met.map((npc) => <PersonLine key={npc.id} game={game} npc={npc} />)
          )}
        </>
      )}
    </>
  );
}

const styles = {
  minCol: {
    minWidth: 0,
    gap: 2,
  },
  headRow: {
    gap: 6,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  chapterTitle: {
    fontSize: 15,
    color: '#ffffff',
  },
  quote: {
    color: '#d6dcf5',
    fontStyle: 'italic',
  },
  focusRow: {
    gap: 8,
  },
  raid: {
    marginTop: 4,
    color: '#ff9aa6',
  },
  dead: {
    color: '#8a8da8',
    textDecoration: 'line-through',
  },
  completedWrap: {
    marginTop: 8,
    gap: 6,
  },
  completedList: {
    padding: '4px 8px',
    gap: 3,
  },
};
