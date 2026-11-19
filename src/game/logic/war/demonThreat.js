import { VILLAGES } from '../../data/zones';
import { wallStrength, hitSection } from '../walls';
import { addHappiness } from '../village';
import { notify } from '../messages';
import { ensureWar } from './state';
import { awardGuildPoints } from '../guild/ranks';
import { pushBackDemonLand } from './demonLand';

// The Demon King's advancing Silence threat: progresses every day unless halted by boss victories
// and Solecis's eventual defeat, applying strategic pressure even when the hero travels far away.

export function ensureDoom(game) {
  const war = ensureWar(game);
  if (typeof war.silenceDoom !== 'number') war.silenceDoom = 10;
  return war;
}

export function pushBackDoom(game, amount, reason = null) {
  const war = ensureDoom(game);
  const before = war.silenceDoom;
  war.silenceDoom = Math.max(0, Math.round(war.silenceDoom - amount));
  if (war.silenceDoom < before && reason) {
    notify(game, '✨ Silence Threat dropped to ' + war.silenceDoom + '% (' + reason + ')!', '#7cfc9a');
  }
}

export function onBossDefeated(game, bossKey) {
  pushBackDemonLand(game, bossKey); // the demon land goes back toward the isle
  if (bossKey === 'lich') {
    pushBackDoom(game, 20, 'Gerund Lich slain');
    awardGuildPoints(game, 60, 'Gerund Lich');
  } else if (bossKey === 'warden') {
    pushBackDoom(game, 20, 'Chrono Warden slain');
    awardGuildPoints(game, 75, 'Chrono Warden');
  } else if (bossKey === 'general') {
    pushBackDoom(game, 25, 'General Barbarism fallen');
    awardGuildPoints(game, 95, 'General Barbarism');
  } else if (bossKey === 'king') {
    const war = ensureDoom(game);
    war.silenceDoom = 0;
    awardGuildPoints(game, 180, 'Demon King Solecis');
  }
}

function advanceEldermoorRemoteRaid(game, war) {
  const raid = game.raid;
  if (!raid || game.day < 10 || game.day < (raid.nextDay || 7) + 2) return;
  const eldermoor = VILLAGES.find((v) => v.id === 'lexia');
  const vState = game.villages?.lexia;
  if (!eldermoor || !vState) return;
  // Hero abandoned Eldermoor for 2+ days past raid night: simulate garrison skirmish
  raid.nextDay = game.day + 7;
  raid.count += 1;
  const dmg = 35 + raid.count * 10 - Math.round(wallStrength(vState) / 30 + (vState.turrets?.length || 0) * 12);
  if (dmg > 0) {
    const idx = (vState.walls || []).findIndex((w) => w > 0);
    if (idx >= 0) hitSection(vState, idx, dmg);
    vState.adults = Math.max(2, (vState.adults || 8) - 1);
    if ((vState.knights || 0) > 0 && dmg > 25) vState.knights -= 1;
    addHappiness(game, -4);
    notify(game, '🔥 Northern raiders struck Eldermoor while you were away! Its walls took damage.', '#ff6060');
  } else {
    notify(game, '🛡️ Eldermoor’s walls and turrets held back a raid in your absence!', '#7cfc9a');
  }
  if (typeof war.silenceDoom === 'number') war.silenceDoom = Math.min(100, war.silenceDoom + 2);
}

export function advanceDemonThreat(game) {
  const war = ensureDoom(game);
  if (game.bosses && game.bosses.king) {
    war.silenceDoom = 0;
    return;
  }
  const conquered = Object.values(game.villages || {}).filter((v) => v.owner === 'monsters').length;
  const baseRise = game.bosses?.general ? 1 : 2;
  const totalRise = baseRise + Math.floor(conquered / 2);
  const prev = war.silenceDoom;
  war.silenceDoom = Math.min(100, war.silenceDoom + totalRise);

  if (prev < 40 && war.silenceDoom >= 40) {
    notify(game, '🌑 The Silence grows heavy across the roads (Threat 40%). Strike the north’s generals!', '#ffb070');
  } else if (prev < 70 && war.silenceDoom >= 70) {
    notify(game, '💀 Demon King Threat reached 70%! Monster towns swell faster and patrols grow bold.', '#ff6060');
  } else if (prev < 95 && war.silenceDoom >= 95) {
    notify(game, '🔥 CRITICAL: Silence Threat at ' + war.silenceDoom + '%! Solecis must be stopped on the Silent Isle!', '#ff4d5a');
  }

  advanceEldermoorRemoteRaid(game, war);
}
