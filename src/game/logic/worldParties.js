import { VILLAGES, zoneAt } from '../data/zones';
import { MEN_NAMES, WOMEN_NAMES, SKINS, HAIRS } from '../data/villagers';
import { WAR_SENTENCES } from '../data/sentences/war';
import { isSolid, ROAD_CELLS } from '../world/map';
import { bestGateOf, stepSmart } from '../world/paths';
import { CELLS, SCALE } from '../world/size';
import { pickRandom } from '../../logic/random';
import { heal, restoreMana, maxMana, earnLexis, gainXp, addItem } from './player';
import { cureCold } from './weather';
import { passHours } from './days';
import { monsterCategory } from './learning';
import { TAG_POWER, TAG_ATTACK, tagOf, higherTag } from './skills';
import { startFight } from './fight';
import { notify, say } from './messages';
import { burst, floatText, dust, bloodSplatter, bloodHit } from './particles';
import { cue } from './cues';
import { addInfamy } from './society/state';
import { spawnWarEffect } from './war/state';

// Living roaming NPC adventurer parties in the open world:
// travel along roads between towns, pitch group camps (tents, cauldron, bedrolls),
// actively hunt and slay nearby monsters (with blood & loot), and interact with the hero.

const MAX_PARTIES = 3;
const PARTY_NAMES = ['Dawnward Scouts', 'Ironhelm Guild', 'Emerald Wayfarers', 'Crimson Vanguard', 'Silver Lanterns'];
const ROLE_OUTFITS = {
  knight: { outfit: '#5a6b8a', trim: '#ffd23f', hp: 85, range: 1.45, dmg: 16, cd: 1.05 },
  archer: { outfit: '#3d7048', trim: '#c48c52', hp: 65, range: 6.2, dmg: 12, cd: 1.35 },
  mage: { outfit: '#543b8c', trim: '#5fd3e8', hp: 60, range: 6.5, dmg: 15, cd: 1.5 },
  cleric: { outfit: '#d8dee8', trim: '#e8b83a', hp: 70, range: 1.6, dmg: 11, cd: 1.25 },
};
const PARTY_CHAT = ['Watch the treeline!', 'Ready for stew soon.', 'Heard goblins prowling nearby.', 'Onward before dusk!', 'Stay sharp, squad.'];

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function makeMember(partyId, idx, role, cx, cy) {
  const woman = idx % 2 === 1;
  const spec = ROLE_OUTFITS[role] || ROLE_OUTFITS.knight;
  const name = pickRandom(woman ? WOMEN_NAMES : MEN_NAMES);
  return {
    id: partyId + '-m' + idx,
    name: name,
    role: role,
    x: cx + (idx - 1) * 1.1,
    y: cy + (idx % 2 === 0 ? 0.5 : -0.5),
    dir: 'down',
    step: Math.random() * 6,
    walking: false,
    hp: spec.hp,
    maxHp: spec.hp,
    attackCd: Math.random() * 0.6,
    attackAnimAt: 0,
    attackDx: 0,
    attackDy: 0,
    look: {
      skin: pickRandom(SKINS),
      hair: pickRandom(HAIRS),
      style: woman ? 'long' : pickRandom(['short', 'spiky']),
      eyes: '#3b3b3b',
      outfit: spec.outfit,
      trim: spec.trim,
      pants: '#3a3448',
      boots: '#4a2e1b',
      beard: !woman && Math.random() < 0.35,
    },
  };
}

function pickPartyDest(fromPos, excludeId = null) {
  const list = VILLAGES.filter((v) => v.id !== excludeId)
    .map((v) => ({ v, far: dist({ x: v.x + v.w / 2, y: v.y + v.h / 2 }, fromPos) }))
    .filter((e) => e.far > 20 && e.far < 420)
    .sort((a, b) => a.far - b.far);
  const picked = list.length > 0 ? pickRandom(list.slice(0, Math.min(5, list.length))).v : VILLAGES[0];
  return { id: picked.id, name: picked.name, x: picked.x + picked.w / 2, y: picked.y + picked.h / 2 };
}

function findSpawnSpotNearPlayer(player) {
  const pcx = Math.floor(player.x / SCALE);
  const pcy = Math.floor(player.y / SCALE);
  for (let tries = 0; tries < 24; tries++) {
    const cx = pcx + Math.floor((Math.random() - 0.5) * 8);
    const cy = pcy + Math.floor((Math.random() - 0.5) * 8);
    if (cx < 4 || cy < 4 || cx >= CELLS - 4 || cy >= CELLS - 4) continue;
    const roadBias = tries < 14 && !ROAD_CELLS.has(cy * CELLS + cx);
    if (roadBias) continue;
    const x = cx * SCALE + 5 + (Math.random() - 0.5) * 3;
    const y = cy * SCALE + 5 + (Math.random() - 0.5) * 3;
    const far = Math.hypot(x - player.x, y - player.y);
    if (far >= 10 && far <= 34 && !isSolid(x, y) && zoneAt(x, y).kind === 'land') return { x, y };
  }
  return null;
}

function spawnParty(game) {
  const spot = findSpawnSpotNearPlayer(game.player);
  if (!spot) return null;
  const id = 'party-' + Date.now() + '-' + Math.floor(Math.random() * 999);
  const dest = pickPartyDest(spot);
  const startCamping = Math.random() < 0.35 && !isSolid(spot.x - 2, spot.y - 2) && !isSolid(spot.x + 2, spot.y + 1);
  const roles = pickRandom([
    ['knight', 'archer', 'mage'],
    ['knight', 'cleric', 'archer', 'mage'],
    ['knight', 'knight', 'archer'],
  ]);
  const members = roles.map((r, i) => makeMember(id, i, r, spot.x, spot.y));
  const party = {
    id: id,
    name: pickRandom(PARTY_NAMES),
    state: startCamping ? 'camping' : 'marching',
    stateTime: startCamping ? 22 + Math.random() * 14 : 24 + Math.random() * 16,
    x: spot.x,
    y: spot.y,
    campX: spot.x,
    campY: spot.y,
    destVillageId: dest.id,
    destName: dest.name,
    destX: dest.x,
    destY: dest.y,
    members: members,
    projectiles: [],
    plundered: false,
    chat: null,
    nextChatAt: Date.now() + 5000 + Math.random() * 8000,
  };
  game.run.parties.push(party);
  return party;
}

function rebuildCampProps(game) {
  const props = [];
  for (const party of game.run.parties || []) {
    if (party.state !== 'camping') continue;
    const cx = party.campX ?? party.x;
    const cy = party.campY ?? party.y;
    props.push({ kind: 'tent', look: 'bandit', x: cx - 3.5, y: cy - 3.6, w: 6, h: 4 });
    props.push({ kind: 'cauldron', x: cx - 0.5, y: cy - 0.5, w: 1, h: 1 });
    props.push({ kind: 'bedroll', x: cx + 1.8, y: cy - 1.2, w: 1, h: 1, walkable: true });
    if (party.members.length >= 4) props.push({ kind: 'weaponRack', x: cx - 3.0, y: cy + 0.8, w: 1, h: 1 });
  }
  game.run.campProps = props;
}

export function syncWorldParties(game) {
  if (!Array.isArray(game.run.parties)) game.run.parties = [];
  game.run.parties = game.run.parties.filter((p) => dist(p, game.player) < 70 && p.members.some((m) => m.hp > 0));
  if (zoneAt(game.player.x, game.player.y).kind === 'inside') {
    game.run.campProps = [];
    return;
  }
  if (game.run.parties.length < MAX_PARTIES && zoneAt(game.player.x, game.player.y).kind === 'land' && Math.random() < 0.55) {
    spawnParty(game);
  }
  rebuildCampProps(game);
}

function stepToward(entity, tx, ty, speed, dt) {
  if (Math.hypot(tx - entity.x, ty - entity.y) < 0.08) {
    entity.walking = false;
    return;
  }
  stepSmart(entity, tx, ty, speed, dt);
}

function closestHostile(game, pos, maxRange) {
  let best = null;
  let bestFar = maxRange;
  for (const m of game.run.monsters || []) {
    if (m.health <= 0 || m.boss || m.warKind === 'caravanEscort') continue;
    const far = dist(m, pos);
    if (far < bestFar) {
      best = m;
      bestFar = far;
    }
  }
  return best;
}

function strikeMonsterByParty(game, party, member, target) {
  const spec = ROLE_OUTFITS[member.role] || ROLE_OUTFITS.knight;
  member.attackCd = spec.cd;
  member.attackAnimAt = Date.now();
  member.attackDx = target.x - member.x;
  member.attackDy = target.y - member.y;

  if (member.role === 'archer' || member.role === 'mage') {
    const far = Math.max(0.1, dist(member, target));
    party.projectiles.push({
      kind: member.role === 'mage' ? 'spell' : 'arrow',
      x: member.x,
      y: member.y,
      vx: ((target.x - member.x) / far) * 11,
      vy: ((target.y - member.y) / far) * 11,
      angle: Math.atan2(target.y - member.y, target.x - member.x),
      damage: spec.dmg,
      life: 0.9,
      color: member.role === 'mage' ? '#5fd3e8' : '#ffd23f',
    });
    return;
  }

  target.health -= spec.dmg;
  target.hitAt = Date.now();
  bloodHit(game, target.x, target.y, 4);
  spawnWarEffect(game, 'slash', target.x, target.y, '#ffe066');
  floatText(game, target.x, target.y - 0.3, '-' + spec.dmg, '#ffd23f');
  if (target.health <= 0) finishMonsterKill(game, party, target);
}

function finishMonsterKill(game, party, monster) {
  game.run.monsters = game.run.monsters.filter((m) => m !== monster);
  burst(game, monster.x, monster.y, '#ffd23f', 16);
  bloodSplatter(game, monster.x, monster.y, 13);
  spawnWarEffect(game, 'hit', monster.x, monster.y, '#ff5a6e');
  if (dist(party, game.player) < 12) {
    party.chat = { memberIndex: 0, text: 'Monster down!', until: Date.now() + 2600 };
    if (Math.random() < 0.35) {
      earnLexis(game, 5);
      floatText(game, monster.x, monster.y - 0.5, '+5 Lexis', '#ffd23f');
    }
  }
}

function updateProjectiles(game, party, dt) {
  const next = [];
  for (const proj of party.projectiles || []) {
    proj.life -= dt;
    proj.x += proj.vx * dt;
    proj.y += proj.vy * dt;
    if (proj.life <= 0) continue;
    const hit = (game.run.monsters || []).find((m) => m.health > 0 && !m.boss && dist(m, proj) < 0.75);
    if (hit) {
      hit.health -= proj.damage;
      hit.hitAt = Date.now();
      bloodHit(game, hit.x, hit.y, 4);
      spawnWarEffect(game, 'hit', hit.x, hit.y, proj.color);
      floatText(game, hit.x, hit.y - 0.3, '-' + proj.damage, proj.color);
      if (hit.health <= 0) finishMonsterKill(game, party, hit);
      continue;
    }
    next.push(proj);
  }
  party.projectiles = next;
}

function updatePartyBehavior(game, party, dt) {
  const now = Date.now();
  const hostile = closestHostile(game, party, 9.5);
  party.stateTime -= dt;

  // Periodic banter / mood bubble
  if (now > party.nextChatAt && party.members.length > 0) {
    party.nextChatAt = now + 7000 + Math.random() * 7000;
    const idx = Math.floor(Math.random() * party.members.length);
    party.chat = {
      memberIndex: idx,
      text: party.state === 'camping' ? pickRandom(['Mmm, hot stew!', 'Take five around the fire.', 'Good hunt today.']) : pickRandom(PARTY_CHAT),
      until: now + 2800,
    };
  }
  if (party.chat && now > party.chat.until) party.chat = null;

  // Combat overrides marching/camping while nearby monsters threaten the group
  if (hostile) {
    party.state = 'fighting';
    for (const m of party.members) {
      if (m.hp <= 0) continue;
      m.attackCd = Math.max(0, (m.attackCd || 0) - dt);
      const spec = ROLE_OUTFITS[m.role] || ROLE_OUTFITS.knight;
      const far = dist(m, hostile);
      if (far > spec.range) {
        stepToward(m, hostile.x, hostile.y, 2.35, dt);
      } else {
        m.walking = false;
        const ux = hostile.x - m.x;
        const uy = hostile.y - m.y;
        m.dir = Math.abs(ux) > Math.abs(uy) ? (ux < 0 ? 'left' : 'right') : uy < 0 ? 'up' : 'down';
        if (m.attackCd <= 0) strikeMonsterByParty(game, party, m, hostile);
      }
    }
    // Slight reciprocal monster retaliation so group battles feel tactile
    hostile._partyHitCd = Math.max(0, (hostile._partyHitCd || 0) - dt);
    const closestMember = party.members.find((m) => m.hp > 0 && dist(m, hostile) < 1.35);
    if (closestMember && hostile._partyHitCd <= 0) {
      hostile._partyHitCd = 1.4;
      const dmg = Math.max(4, Math.round((hostile.attack || 12) * 0.28));
      closestMember.hp = Math.max(1, closestMember.hp - dmg);
      bloodHit(game, closestMember.x, closestMember.y, 3);
    }
    const alive = party.members.filter((m) => m.hp > 0);
    if (alive.length > 0) {
      party.x = alive.reduce((s, m) => s + m.x, 0) / alive.length;
      party.y = alive.reduce((s, m) => s + m.y, 0) / alive.length;
    }
    return;
  }

  // Resume marching/camping state if previously fighting
  if (party.state === 'fighting') {
    party.state = 'marching';
    party.stateTime = 16 + Math.random() * 14;
  }

  // Transition between marching & camping
  if (party.stateTime <= 0) {
    if (party.state === 'marching' && zoneAt(party.x, party.y).kind === 'land' && !isSolid(party.x - 1, party.y - 1) && !isSolid(party.x + 1, party.y + 1)) {
      party.state = 'camping';
      party.stateTime = 24 + Math.random() * 14;
      party.campX = party.x;
      party.campY = party.y;
      rebuildCampProps(game);
    } else {
      party.state = 'marching';
      party.stateTime = 24 + Math.random() * 18;
      rebuildCampProps(game);
    }
  }

  if (party.state === 'camping') {
    const cx = party.campX ?? party.x;
    const cy = party.campY ?? party.y;
    const seats = [
      [-1.3, 0.2, 'right'],
      [1.2, 0.3, 'left'],
      [0.0, 1.3, 'up'],
      [0.5, -1.3, 'down'],
    ];
    party.members.forEach((m, i) => {
      if (m.hp <= 0) return;
      m.hp = Math.min(m.maxHp, m.hp + dt * 2.5);
      const seat = seats[i % seats.length];
      const tx = cx + seat[0];
      const ty = cy + seat[1];
      if (Math.hypot(tx - m.x, ty - m.y) > 0.25) {
        stepToward(m, tx, ty, 1.8, dt);
      } else {
        m.walking = false;
        m.dir = seat[2];
      }
    });
    return;
  }

  // Marching cleanly along outside town gates from town to town
  const destZone = zoneAt(party.destX, party.destY);
  const destGate = destZone.kind === 'village' ? bestGateOf(destZone, party)?.outside : null;
  if (dist(party, { x: party.destX, y: party.destY }) < 10 || (destGate && dist(party, destGate) < 4.5)) {
    const next = pickPartyDest(party, party.destVillageId);
    party.destVillageId = next.id;
    party.destName = next.name;
    party.destX = next.x;
    party.destY = next.y;
  }
  stepSmart(party, party.destX, party.destY, 1.45, dt, { stopAtGate: true });

  party.members.forEach((m, i) => {
    const ox = (i - 1) * 1.05;
    const oy = i % 2 === 0 ? 0.55 : -0.55;
    stepToward(m, party.x + ox, party.y + oy, 1.65, dt);
  });
}

export function updateWorldParties(game, dt) {
  if (!Array.isArray(game.run.parties)) game.run.parties = [];
  for (const party of game.run.parties) {
    updatePartyBehavior(game, party, dt);
    updateProjectiles(game, party, dt);
  }
}

// ---------- Player Interactions ----------

export function partyNear(game, range = 2.6) {
  const parties = game.run && Array.isArray(game.run.parties) ? game.run.parties : [];
  let best = null;
  let bestFar = range;
  for (const party of parties) {
    for (const m of party.members) {
      if (m.hp <= 0) continue;
      const far = dist(m, game.player);
      if (far < bestFar) {
        best = party;
        bestFar = far;
      }
    }
  }
  return best;
}

function makeSparChampion(game, party, hostile = false) {
  const leader = party.members[0];
  const category = monsterCategory(game);
  const tag = higherTag('normal', tagOf(game, category));
  return {
    id: party.id + '-spar',
    name: hostile ? leader.name + ' (' + party.name + ')' : leader.name + ' (Spar)',
    duel: !hostile,
    training: !hostile,
    sections: ['rc10'],
    questions: WAR_SENTENCES,
    mistakesAllowed: 3,
    species: 'soldier',
    art: 'darkKnight',
    shape: 'knight',
    tier: 'small',
    category: category,
    tag: tag,
    health: hostile ? 28 * TAG_POWER[tag] : 3,
    maxHealth: hostile ? 28 * TAG_POWER[tag] : 3,
    attack: 15 * TAG_ATTACK[tag],
    magicAttack: 0,
    resistance: 0.15,
    magicResistance: 0.1,
    speed: 11,
    xp: 25 * TAG_POWER[tag],
    lexis: 20 * TAG_POWER[tag],
    drops: [],
    x: leader.x,
    y: leader.y,
    look: leader.look,
    onWin: !hostile
      ? () => {
          gainXp(game, 25);
          earnLexis(game, 15);
          cue(game, 'victory');
          notify(game, '⚔ Splendid spar with ' + party.name + '! +25 XP, +15 Lexis!', '#7cfc9a');
        }
      : undefined,
    onLose: !hostile ? () => notify(game, '💬 ' + leader.name + ': "Good effort — drill those short sentences and spar us anytime!"', '#9fd8ff') : undefined,
    societyMeta: hostile ? { kind: 'raidParty', partyId: party.id } : undefined,
  };
}

export function interactParty(game, party) {
  if (!party || party.members.length === 0) return;
  const leader = party.members[0];
  const campText =
    party.state === 'camping'
      ? leader.name + ' waves you over to the campfire of ' + party.name + ': "Pull up a log, traveler! Stew is warm and the night is long."'
      : leader.name + ' leads ' + party.name + ' (' + party.members.length + ' adventurers) heading toward ' + party.destName + '.';

  const choices = [
    {
      label: 'Swap Road News & Monster Rumors',
      icon: 'talk',
      run: () => {
        cue(game, 'talk');
        say(game, null, [
          leader.name + ': "We have been clearing monsters prowling around the nearby camps on our way to ' + party.destName + '. Stay sharp out here!"',
        ]);
      },
    },
  ];

  if (party.state === 'camping') {
    choices.push({
      label: 'Sit by Campfire & Share Stew (+35 HP, Cure Cold)',
      icon: 'herbStew',
      run: () => {
        passHours(game, 2);
        heal(game.player, 35, game);
        game.player.hunger = Math.min(100, game.player.hunger + 25);
        game.player.thirst = Math.min(100, game.player.thirst + 20);
        restoreMana(game.player, Math.min(3, maxMana(game.player)));
        cureCold(game);
        cue(game, 'heal');
        dust(game, party.x, party.y, '#ffd23f');
        notify(game, '🍲 Warmed up and ate stew with ' + party.name + '! (+35 HP, Food +25)', '#7cfc9a');
      },
    });
  }

  choices.push({
    label: 'Buy Road Rations (War Rations · 15 Lexis)',
    icon: 'warRations',
    run: () => {
      if (game.player.lexis < 15) {
        notify(game, 'Need 15 Lexis.', '#ff8a95');
        return;
      }
      game.player.lexis -= 15;
      addItem(game.player, 'warRations', 1);
      cue(game, 'trade');
      notify(game, '🎒 Bought War Rations from ' + party.name + '.', '#7cfc9a');
    },
  });

  choices.push({
    label: 'Train Short Sentences (Friendly Spar with ' + leader.name + ')',
    icon: 'woodSword',
    run: () => {
      const champ = makeSparChampion(game, party, false);
      startFight(game, champ);
    },
  });

  if (!party.plundered) {
    choices.push({
      label: '☠ Raid Adventurer Party! (Loot Mystery Crate, +25 Infamy)',
      icon: 'sword',
      run: () => {
        const foe = makeSparChampion(game, party, true);
        startFight(game, foe);
        game.run.partyRaid = { partyId: party.id, fight: game.run.fight };
      },
    });
  }

  choices.push({ label: 'Farewell', run: () => {} });
  say(game, null, [campText], choices);
}

export function onFightEndParties(game, fight) {
  if (!fight || !game.run.partyRaid || fight !== game.run.partyRaid.fight) return;
  const { partyId } = game.run.partyRaid;
  game.run.partyRaid = null;
  if (fight.phase !== 'won') return;
  const party = (game.run.parties || []).find((p) => p.id === partyId);
  if (party) {
    party.plundered = true;
    bloodSplatter(game, party.x, party.y, 14);
  }
  addItem(game.player, 'mysteryCrate', 1);
  earnLexis(game, 45);
  addInfamy(game, 25);
  cue(game, 'victory');
  burst(game, game.player.x, game.player.y, '#ffd23f', 20);
  notify(game, '🏴‍☠️ Defeated ' + (party ? party.name : 'the party') + '! Looted Mystery Supply Crate & +45 Lexis! (+25 Infamy)', '#ff8a3d');
}

export function actionsOfParties(game) {
  return [
    {
      when: () => partyNear(game) !== null,
      icon: 'talk',
      run: () => interactParty(game, partyNear(game)),
    },
  ];
}
