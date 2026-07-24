// ============================================================================
// 玩家 / AI 共用的命令函数：每个动作校验、扣费、变更状态并返回 { ok, msg, ... }。
// 消耗指令点（cmd）的动作通过 spendCmd 统一计费；任命太守、输送等少数免费。
// ============================================================================
import {
  cityById, heroById, factionById, playerFaction, neighbors, heroesInCity,
  wildHeroesInCity, heroesOfFaction, bestDefender, troopCap, cmdRemaining, maxDefense, lordOf,
} from './state.js';
import { citiesOf, recruitCost } from './economy.js';
import { skillBonus, techMult, techLevel } from './tech.js';
import { createBattle, runBattle, effLead, effWar } from './combat.js';
import { chance, rangeInt } from './rng.js';
import {
  BUILD_MAX, buildCost, TRAINING_BASE, TRAINING_MAX, FORMATIONS, STRATAGEMS,
  TECH_MAX_LEVEL, TECH_COST_GOLD, TECH_COST_TURNS, RECRUIT_LOYALTY_THRESHOLD,
} from '../config.js';

const PLAYER = (state) => state.playerFactionId;

// 消耗一点指令；不足返回 false
function spendCmd(state, fid) {
  if (cmdRemaining(state, fid) <= 0) return false;
  state.cmdUsedByFaction = state.cmdUsedByFaction || {};
  state.cmdUsedByFaction[fid] = (state.cmdUsedByFaction[fid] || 0) + 1;
  return true;
}
function facMoney(state, fid) { return factionById(state, fid).money; }
function facGrain(state, fid) { return factionById(state, fid).grain; }

const isPlayer = (state, fid) => fid === state.playerFactionId;

// —— 内政：开发农田 ——
export function developFarm(state, cityId, fid = PLAYER(state)) {
  const c = cityById(state, cityId);
  if (!c || c.ownerFactionId !== fid) return { ok: false, msg: '该城非你所属' };
  if (c.farmLevel >= BUILD_MAX) return { ok: false, msg: '农田已达满级' };
  if (!spendCmd(state, fid)) return { ok: false, msg: '指令点不足' };
  const cost = buildCost(c.farmLevel);
  if (facMoney(state, fid) < cost) { refundCmd(state, fid); return { ok: false, msg: '金钱不足' }; }
  factionById(state, fid).money -= cost;
  c.farmLevel += 1;
  return { ok: true, msg: `${c.name} 农田升至 ${c.farmLevel} 级（-${cost} 金）` };
}

// —— 内政：发展商业 ——
export function developMarket(state, cityId, fid = PLAYER(state)) {
  const c = cityById(state, cityId);
  if (!c || c.ownerFactionId !== fid) return { ok: false, msg: '该城非你所属' };
  if (c.marketLevel >= BUILD_MAX) return { ok: false, msg: '市集已达满级' };
  if (!spendCmd(state, fid)) return { ok: false, msg: '指令点不足' };
  const cost = buildCost(c.marketLevel);
  if (facMoney(state, fid) < cost) { refundCmd(state, fid); return { ok: false, msg: '金钱不足' }; }
  factionById(state, fid).money -= cost;
  c.marketLevel += 1;
  return { ok: true, msg: `${c.name} 市集升至 ${c.marketLevel} 级（-${cost} 金）` };
}

// —— 内政：城防修筑 ——
export function buildWall(state, cityId, fid = PLAYER(state)) {
  const c = cityById(state, cityId);
  if (!c || c.ownerFactionId !== fid) return { ok: false, msg: '该城非你所属' };
  if (c.wallLevel >= BUILD_MAX) return { ok: false, msg: '城墙已达满级' };
  if (!spendCmd(state, fid)) return { ok: false, msg: '指令点不足' };
  const cost = buildCost(c.wallLevel);
  if (facMoney(state, fid) < cost) { refundCmd(state, fid); return { ok: false, msg: '金钱不足' }; }
  factionById(state, fid).money -= cost;
  c.wallLevel += 1;
  c.defense = maxDefense(state, c);
  return { ok: true, msg: `${c.name} 城墙升至 ${c.wallLevel} 级，城防加固` };
}

// —— 内政：征兵 ——
export function recruit(state, cityId, count, fid = PLAYER(state)) {
  const c = cityById(state, cityId);
  if (!c || c.ownerFactionId !== fid) return { ok: false, msg: '该城非你所属' };
  count = Math.max(0, Math.floor(count));
  if (count <= 0) return { ok: false, msg: '征兵数量无效' };
  if (!spendCmd(state, fid)) return { ok: false, msg: '指令点不足' };
  const { gold, pop } = recruitCost(c, count);
  const fac = factionById(state, fid);
  if (fac.money < gold) { refundCmd(state, fid); return { ok: false, msg: '金钱不足' }; }
  if (c.population < pop) { refundCmd(state, fid); return { ok: false, msg: '人口不足' }; }
  fac.money -= gold;
  c.population -= Math.round(pop);
  c.soldiers += count;
  // 兵营等级提升新兵训练度起点
  if (c.training < TRAINING_BASE + (c.barracksLevel - 1) * 5) c.training = TRAINING_BASE + (c.barracksLevel - 1) * 5;
  return { ok: true, msg: `${c.name} 征兵 ${count}（-${Math.round(gold)} 金，-${Math.round(pop)} 人口）` };
}

// —— 内政：操练（提升训练度）——
export function train(state, cityId, fid = PLAYER(state)) {
  const c = cityById(state, cityId);
  if (!c || c.ownerFactionId !== fid) return { ok: false, msg: '该城非你所属' };
  if (c.training >= TRAINING_MAX) return { ok: false, msg: '训练度已满' };
  if (!spendCmd(state, fid)) return { ok: false, msg: '指令点不足' };
  const cost = 200;
  if (facMoney(state, fid) < cost) { refundCmd(state, fid); return { ok: false, msg: '金钱不足' }; }
  factionById(state, fid).money -= cost;
  c.training = Math.min(TRAINING_MAX, c.training + 8);
  return { ok: true, msg: `${c.name} 操练部队，训练度 → ${c.training}` };
}

// —— 人事：探索（发现本城在野名将）——
export function explore(state, cityId, fid = PLAYER(state), rng) {
  const r = rng || Math.random;
  const c = cityById(state, cityId);
  if (!c || c.ownerFactionId !== fid) return { ok: false, msg: '该城非你所属' };
  if (!spendCmd(state, fid)) return { ok: false, msg: '指令点不足' };
  const roster = heroesInCity(state, cityId, fid);
  const charm = roster.length ? Math.max(...roster.map((h) => h.stats.c)) : 50;
  const wilds = wildHeroesInCity(state, cityId);
  const newly = [];
  for (const w of wilds) {
    if (w.discovered) continue;
    if (chance(r, 0.4 + charm / 400)) { w.discovered = true; newly.push(w); }
  }
  const discovered = wilds.filter((w) => w.discovered);
  if (!newly.length && !discovered.length) {
    return { ok: true, msg: `${c.name} 四处寻访，未发现可用之才。`, discovered: [] };
  }
  return {
    ok: true,
    msg: newly.length ? `${c.name} 探访得知：${newly.map((w) => w.name).join('、')} 在此隐居！` : `${c.name} 已有名将在野可登用。`,
    discovered,
    newly,
  };
}

// —— 人事：登用（说服在野名将加入）——
export function recruitHero(state, heroId, fid = PLAYER(state), rng) {
  const r = rng || Math.random;
  const h = heroById(state, heroId);
  if (!h || !h.wild) return { ok: false, msg: '目标不可登用' };
  const c = cityById(state, h.cityId);
  if (!c || c.ownerFactionId !== fid) return { ok: false, msg: '名将不在己方城市' };
  if (!spendCmd(state, fid)) return { ok: false, msg: '指令点不足' };
  const roster = heroesInCity(state, h.cityId, fid);
  const charm = roster.length ? Math.max(...roster.map((x) => x.stats.c)) : 50;
  const cBonus = roster.length ? Math.max(...roster.map((x) => skillBonus(x).c_recruit)) : 0;
  let p = 0.25 + (charm - h.loyalty) / 200 + cBonus + techMult(state, 'trick', 0.05) - 1;
  p = Math.max(0.05, Math.min(0.95, p));
  if (chance(r, p)) {
    h.wild = false;
    h.factionId = fid;
    h.status = 'free';
    h.discovered = true;
    h.loyalty = Math.max(70, Math.min(95, Math.round(60 + charm / 4)));
    return { ok: true, msg: `${h.name} 愿效犬马之劳，已归入麾下！`, recruited: true };
  }
  return { ok: true, msg: `${h.name} 婉言谢绝（成功率 ${Math.round(p * 100)}%）。`, recruited: false };
}

// —— 人事：赏赐（提升忠诚）——
export function reward(state, heroId, fid = PLAYER(state)) {
  const h = heroById(state, heroId);
  if (!h || h.factionId !== fid) return { ok: false, msg: '非己方武将' };
  if (!spendCmd(state, fid)) return { ok: false, msg: '指令点不足' };
  const cost = 300;
  if (facMoney(state, fid) < cost) { refundCmd(state, fid); return { ok: false, msg: '金钱不足' }; }
  factionById(state, fid).money -= cost;
  h.loyalty = Math.min(100, h.loyalty + 12);
  return { ok: true, msg: `赏赐 ${h.name}，忠诚 → ${h.loyalty}` };
}

// —— 人事：任命太守（免费）——
export function appointGovernor(state, cityId, heroId, fid = PLAYER(state)) {
  const c = cityById(state, cityId);
  const h = heroById(state, heroId);
  if (!c || c.ownerFactionId !== fid) return { ok: false, msg: '该城非你所属' };
  if (!h || h.factionId !== fid || h.status === 'prisoner') return { ok: false, msg: '该武将不可用' };
  if (h.cityId !== cityId) return { ok: false, msg: '武将须在本城方可任命' };
  c.governorHeroId = heroId;
  return { ok: true, msg: `${h.name} 出任 ${c.name} 太守` };
}

// —— 科技：开始研究 ——
export function research(state, techKey, fid = PLAYER(state)) {
  if (!Object.prototype.hasOwnProperty.call(state.techLevels, techKey)) return { ok: false, msg: '未知科技' };
  if (state.research) return { ok: false, msg: '已有研究进行中' };
  if (techLevel(state, techKey) >= TECH_MAX_LEVEL) return { ok: false, msg: '该科技已满级' };
  if (!spendCmd(state, fid)) return { ok: false, msg: '指令点不足' };
  if (facMoney(state, fid) < TECH_COST_GOLD) { refundCmd(state, fid); return { ok: false, msg: '金钱不足' }; }
  factionById(state, fid).money -= TECH_COST_GOLD;
  const lord = lordOf(state, fid);
  const intel = lord ? lord.stats.i : 50;
  const turns = Math.max(1, Math.round(TECH_COST_TURNS - intel / 60));
  state.research = { key: techKey, turnsLeft: turns };
  return { ok: true, msg: `开始研究，预计 ${turns} 回合完成（-${TECH_COST_GOLD} 金）` };
}

// —— 军事：出征 ——
export function campaign(state, fromCityId, toCityId, generalId, troops, formation, fid = PLAYER(state), rng) {
  const r = rng || Math.random;
  const from = cityById(state, fromCityId);
  const to = cityById(state, toCityId);
  if (!from || !to) return { ok: false, msg: '城市无效' };
  if (from.ownerFactionId !== fid) return { ok: false, msg: '出发城非你所属' };
  if (to.ownerFactionId === fid) return { ok: false, msg: '不可攻打己方城市' };
  if (!from.adjacent.includes(toCityId)) return { ok: false, msg: '目标城市不相邻' };
  const g = heroById(state, generalId);
  if (!g || g.factionId !== fid || g.status === 'prisoner' || g.cityId !== fromCityId) {
    return { ok: false, msg: '主将不可用' };
  }
  troops = Math.max(0, Math.floor(troops));
  if (troops <= 0) return { ok: false, msg: '出兵数量无效' };
  if (troops > from.soldiers) return { ok: false, msg: '城中兵力不足' };
  if (troops > troopCap(state, g)) return { ok: false, msg: `超出 ${g.name} 带兵上限（${troopCap(state, g)}）` };
  if (!spendCmd(state, fid)) return { ok: false, msg: '指令点不足' };
  const grainCost = Math.round(troops * 0.05);
  if (facGrain(state, fid) < grainCost) { refundCmd(state, fid); return { ok: false, msg: '军粮不足以出征' }; }
  factionById(state, fid).grain -= grainCost;

  from.soldiers -= troops;

  const attacker = { factionId: fid, general: g, soldiers: troops, training: from.training, formation: formation || 'normal' };
  const defGeneral = bestDefender(state, toCityId) || { id: '__militia__', name: '守城民兵', stats: { l: 50, w: 50, i: 40, p: 40, c: 40 }, skill: null };
  const defender = {
    factionId: to.ownerFactionId, general: defGeneral, soldiers: to.soldiers,
    defense: to.defense || 0, isCity: true, training: to.training || TRAINING_BASE, formation: 'normal',
  };

  const battle = createBattle({ attacker, defender });
  runBattle(battle, state, r);

  let won = battle.result === 'attacker';
  applyCampaignResult(state, battle, from, to, g, fid, r);

  const msgs = battle.log.slice(-3);
  return { ok: true, won, battle, msg: won ? `攻克 ${to.name}！` : `攻打 ${to.name} 失利。`, log: msgs };
}

// 结算出征结果（占领 / 溃败 / 俘虏）
function applyCampaignResult(state, battle, from, to, attackerGen, fid, rng) {
  const won = battle.result === 'attacker';
  const captorFid = won ? fid : to.ownerFactionId;

  if (won) {
    // 占领：幸存兵力转为新守军，主将入驻
    const survivors = Math.round(battle.attacker.soldiers);
    to.ownerFactionId = fid;
    to.soldiers = survivors;
    to.training = from.training;
    attackerGen.cityId = to.id;
    if (!to.governorHeroId || !heroById(state, to.governorHeroId)) to.governorHeroId = attackerGen.id;
    // 缴获城库
    const lootGold = to.gold || 0;
    const lootGrain = to.grain || 0;
    factionById(state, fid).money += lootGold;
    factionById(state, fid).grain += lootGrain;
    to.gold = 0; to.grain = 0;
    state.turnLog.push(`🏰 攻陷 ${to.name}！缴获 ${lootGold} 金、${lootGrain} 粮，余兵 ${survivors} 驻守。`);
  } else {
    // 失利：出征兵力覆灭（已从 from 扣除），主将若未被俘则退回
    if (attackerGen.id !== '__militia__' && attackerGen.status !== 'prisoner') {
      // 仍在 from 城
    }
    state.turnLog.push(`💔 攻打 ${to.name} 失利，出征军覆灭。`);
  }

  // 俘虏处理
  if (battle.prisoner && battle.prisoner !== '__militia__') {
    const ph = heroById(state, battle.prisoner);
    if (ph && captorFid != null) {
      ph.status = 'prisoner';
      ph.prisonerOf = captorFid;
      const capCity = citiesOf(state, captorFid)[0];
      if (capCity) ph.cityId = capCity.id;
      if (ph.id === to.governorHeroId) to.governorHeroId = null;
      state.turnLog.push(`⛓️ ${ph.name} 被俘。`);
    } else if (ph) {
      // 中立势力俘获 → 释放为在野
      ph.status = 'free';
      ph.wild = true;
      ph.discovered = false;
    }
  }
}

// —— 军事：输送（己方相邻城市间调运）——
export function transport(state, fromCityId, toCityId, payload, fid = PLAYER(state)) {
  const from = cityById(state, fromCityId);
  const to = cityById(state, toCityId);
  if (!from || !to) return { ok: false, msg: '城市无效' };
  if (from.ownerFactionId !== fid || to.ownerFactionId !== fid) return { ok: false, msg: '须为己方城市' };
  if (!from.adjacent.includes(toCityId)) return { ok: false, msg: '两城不相邻' };
  if (!spendCmd(state, fid)) return { ok: false, msg: '指令点不足' };
  const fac = factionById(state, fid);
  const s = Math.max(0, Math.floor(payload.soldiers || 0));
  const gm = Math.max(0, Math.floor(payload.gold || 0));
  const gr = Math.max(0, Math.floor(payload.grain || 0));
  if (s > from.soldiers) { refundCmd(state, fid); return { ok: false, msg: '兵力不足' }; }
  if (gm > fac.money) { refundCmd(state, fid); return { ok: false, msg: '金钱不足' }; }
  if (gr > fac.grain) { refundCmd(state, fid); return { ok: false, msg: '军粮不足' }; }
  from.soldiers -= s;
  to.soldiers += s;
  fac.money -= gm;
  fac.grain -= gr;
  // 同步迁移随军武将（可选）：把 from 城中指定的空闲武将调往 to（此处只调资源）
  return { ok: true, msg: `自 ${from.name} 向 ${to.name} 输送：兵 ${s}、金 ${gm}、粮 ${gr}` };
}

// —— 外交 / 计略 ——
export function stratagem(state, fromCityId, toCityId, type, fid = PLAYER(state), rng) {
  const r = rng || Math.random;
  const def = STRATAGEMS[type];
  if (!def) return { ok: false, msg: '未知计略' };
  const from = cityById(state, fromCityId);
  const to = cityById(state, toCityId);
  if (!from || !to) return { ok: false, msg: '城市无效' };
  if (from.ownerFactionId !== fid) return { ok: false, msg: '出发城非你所属' };
  if (to.ownerFactionId === fid) return { ok: false, msg: '不可对己方城市用计' };
  if (!from.adjacent.includes(toCityId)) return { ok: false, msg: '目标城市不相邻' };
  if (!spendCmd(state, fid)) return { ok: false, msg: '指令点不足' };
  const cost = 150;
  if (facMoney(state, fid) < cost) { refundCmd(state, fid); return { ok: false, msg: '金钱不足' }; }
  factionById(state, fid).money -= cost;

  const caster = bestDefender(state, fromCityId) || { stats: { i: 50 } };
  const intel = caster.stats ? caster.stats.i : 50;
  const targetGen = bestDefender(state, toCityId);
  const tIntel = targetGen && targetGen.stats ? targetGen.stats.i : 45;
  let p = 0.35 + (intel - tIntel) / 200 + techMult(state, 'trick', 0.05) - 1;
  p = Math.max(0.05, Math.min(0.9, p));

  if (!chance(r, p)) {
    return { ok: true, msg: `${def.name} 被 ${to.name} 识破（成功率 ${Math.round(p * 100)}%）`, success: false };
  }
  if (type === 'fire') {
    to.defense = Math.max(0, Math.round((to.defense || 0) * (1 - def.range)));
    return { ok: true, msg: `火攻成功！${to.name} 城防降至 ${Math.round(to.defense)}`, success: true };
  }
  if (type === 'burn') {
    const foeFid = to.ownerFactionId;
    if (foeFid != null) {
      const foe = factionById(state, foeFid);
      const burned = Math.round(foe.grain * def.range);
      foe.grain -= burned;
      return { ok: true, msg: `烧粮成功！${foe.name} 损失 ${burned} 军粮`, success: true };
    }
    to.grain = Math.round((to.grain || 0) * (1 - def.range));
    return { ok: true, msg: `烧粮成功！${to.name} 城库粮草被焚`, success: true };
  }
  if (type === 'rumor') {
    if (targetGen) {
      targetGen.loyalty = Math.max(0, targetGen.loyalty - def.range);
      return { ok: true, msg: `流言成功！${targetGen.name} 忠诚降至 ${targetGen.loyalty}`, success: true };
    }
    return { ok: true, msg: `流言散布，但城中无名将可撼动`, success: true };
  }
  return { ok: true, msg: '计略执行完毕', success: true };
}

// 武将调任：在己方相邻城市间移动一名武将（免费）
export function moveHero(state, heroId, toCityId, fid = PLAYER(state)) {
  const h = heroById(state, heroId);
  const to = cityById(state, toCityId);
  if (!h || h.factionId !== fid || h.status === 'prisoner') return { ok: false, msg: '武将不可用' };
  if (!to || to.ownerFactionId !== fid) return { ok: false, msg: '目标非己方城市' };
  const from = cityById(state, h.cityId);
  if (!from || !from.adjacent.includes(toCityId)) return { ok: false, msg: '两城不相邻' };
  h.cityId = toCityId;
  return { ok: true, msg: `${h.name} 调往 ${to.name}` };
}

// —— 俘虏管理 ——
// 招降俘虏（成功率随俘虏忠诚降低而提高）
export function recruitPrisoner(state, heroId, fid = PLAYER(state), rng) {
  const r = rng || Math.random;
  const h = heroById(state, heroId);
  if (!h || h.prisonerOf !== fid) return { ok: false, msg: '该武将非你俘虏' };
  if (!spendCmd(state, fid)) return { ok: false, msg: '指令点不足' };
  const cost = 500;
  if (facMoney(state, fid) < cost) { refundCmd(state, fid); return { ok: false, msg: '金钱不足' }; }
  factionById(state, fid).money -= cost;
  const lord = lordOf(state, fid);
  const charm = lord ? lord.stats.c : 50;
  let p = 0.15 + (100 - h.loyalty) / 200 + (charm - 70) / 100;
  p = Math.max(0.05, Math.min(0.85, p));
  if (chance(r, p)) {
    h.factionId = fid;
    h.prisonerOf = null;
    h.status = 'free';
    h.loyalty = Math.max(55, Math.min(80, h.loyalty));
    return { ok: true, msg: `${h.name} 归降！`, recruited: true };
  }
  return { ok: true, msg: `${h.name} 拒不投降（成功率 ${Math.round(p * 100)}%）`, recruited: false };
}

// 释放俘虏 → 转为某中立城在野
export function releasePrisoner(state, heroId, fid = PLAYER(state)) {
  const h = heroById(state, heroId);
  if (!h || h.prisonerOf !== fid) return { ok: false, msg: '该武将非你俘虏' };
  const neutrals = state.cities.filter((c) => c.ownerFactionId == null);
  const dest = (neutrals.length ? neutrals : state.cities)[0];
  h.prisonerOf = null;
  h.status = 'free';
  h.factionId = null;
  h.wild = true;
  h.discovered = false;
  h.cityId = dest.id;
  return { ok: true, msg: `释放 ${h.name}` };
}

// 处决俘虏
export function executePrisoner(state, heroId, fid = PLAYER(state)) {
  const h = heroById(state, heroId);
  if (!h || h.prisonerOf !== fid) return { ok: false, msg: '该武将非你俘虏' };
  const name = h.name;
  state.heroes = state.heroes.filter((x) => x.id !== heroId);
  return { ok: true, msg: `处决 ${name}，其旧部离心。` };
}

function refundCmd(state, fid) {
  if (state.cmdUsedByFaction && state.cmdUsedByFaction[fid] > 0) {
    state.cmdUsedByFaction[fid] -= 1;
  }
}

export { spendCmd, isPlayer, RECRUIT_LOYALTY_THRESHOLD, effLead, effWar, FORMATIONS };
