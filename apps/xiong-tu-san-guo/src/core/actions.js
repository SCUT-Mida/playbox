// ============================================================================
// 玩家 / AI 共用的命令函数：每个动作校验、扣费、变更状态并返回 { ok, msg, ... }。
// 消耗指令点（cmd）的动作通过 spendCmd 统一计费；任命太守、输送等少数免费。
// ============================================================================
import {
  cityById, heroById, factionById, neighbors, heroesInCity,
  wildHeroesInCity, heroesOfFaction, bestDefender, troopCap, cmdRemaining, maxDefense, lordOf,
  checkGameOver, clearHeroOffices, officeHolder,
} from './state.js';
import { citiesOf, recruitCost } from './economy.js';
import { skillBonus, techMult, techLevel, techMaxLevel, TECH_KEYS } from './tech.js';
import { createBattle, runBattle, effLead, effWar } from './combat.js';
import { chance, shuffle } from './rng.js';
import {
  buildCapForCity, buildCost, TRAINING_MAX, FORMATIONS, STRATAGEMS,
  TECH_COST_GOLD, TECH_COST_TURNS, RECRUIT_LOYALTY_THRESHOLD,
  CITY_MAX_LEVEL, cityUpgradeGoldCost,
  EXCHANGE_FEE, exchangeRate,
  TRADE_GRAIN_COST, TRADE_SEIZED_CHANCE, tradeGoldYield,
  CITY_OFFICES, OFFICE_MAP, officeField,
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
  const cap = buildCapForCity(c);
  if (c.farmLevel >= cap) return { ok: false, msg: `农田已达本城上限（Lv${cap}，升级城池可提升）` };
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
  const cap = buildCapForCity(c);
  if (c.marketLevel >= cap) return { ok: false, msg: `市集已达本城上限（Lv${cap}，升级城池可提升）` };
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
  const cap = buildCapForCity(c);
  if (c.wallLevel >= cap) return { ok: false, msg: `城墙已达本城上限（Lv${cap}，升级城池可提升）` };
  if (!spendCmd(state, fid)) return { ok: false, msg: '指令点不足' };
  const cost = buildCost(c.wallLevel);
  if (facMoney(state, fid) < cost) { refundCmd(state, fid); return { ok: false, msg: '金钱不足' }; }
  factionById(state, fid).money -= cost;
  c.wallLevel += 1;
  c.defense = maxDefense(state, c);
  return { ok: true, msg: `${c.name} 城墙升至 ${c.wallLevel} 级，城防加固` };
}

// —— 内政：升级城池 ——
// 前置：三项资源（农田 / 市集 / 城墙）均须达到当前资源上限（满级开发后方可升城），
// 并支付 cityUpgradeGoldCost 金钱。升级后城池等级 +1，三项资源上限随之 +5，
// 势力最高城池升级还会抬高科技等级上限。城池等级同时小幅提升本城收入与城防（见 economy.js）。
export function upgradeCity(state, cityId, fid = PLAYER(state)) {
  const c = cityById(state, cityId);
  if (!c || c.ownerFactionId !== fid) return { ok: false, msg: '该城非你所属' };
  c.level = c.level || 1;
  if (c.level >= CITY_MAX_LEVEL) return { ok: false, msg: `${c.name} 已达最高城池等级` };
  const cap = buildCapForCity(c);
  if (c.farmLevel < cap || c.marketLevel < cap || c.wallLevel < cap) {
    return { ok: false, msg: `须先将军田/市集/城墙均升至 Lv${cap} 方可升级城池` };
  }
  if (!spendCmd(state, fid)) return { ok: false, msg: '指令点不足' };
  const cost = cityUpgradeGoldCost(c.level);
  if (facMoney(state, fid) < cost) { refundCmd(state, fid); return { ok: false, msg: '金钱不足' }; }
  factionById(state, fid).money -= cost;
  c.level += 1;
  c.defense = maxDefense(state, c); // 城池等级抬升城防上限，即时回满
  const newCap = buildCapForCity(c);
  return { ok: true, msg: `${c.name} 城池升至 ${c.level} 级！资源上限解锁至 Lv${newCap}（-${cost} 金）` };
}

// —— 商业：资源对换（金 ↔ 粮）——
// kind='buy'：以金换粮；kind='sell'：以粮换金。每次消耗 1 指令。
// 汇率随本城市集等级与商贸科技提升；卖出按 EXCHANGE_FEE 折价，杜绝无脑套利。
export function exchange(state, cityId, kind, amount, fid = PLAYER(state)) {
  const c = cityById(state, cityId);
  if (!c || c.ownerFactionId !== fid) return { ok: false, msg: '该城非你所属' };
  if (kind !== 'buy' && kind !== 'sell') return { ok: false, msg: '未知兑换方向' };
  amount = Math.max(0, Math.floor(amount));
  if (amount <= 0) return { ok: false, msg: '兑换数量无效' };
  if (!spendCmd(state, fid)) return { ok: false, msg: '指令点不足' };
  const fac = factionById(state, fid);
  const rate = exchangeRate(state, c); // 每金可换粮数
  if (kind === 'buy') {
    if (fac.money < amount) { refundCmd(state, fid); return { ok: false, msg: '金钱不足' }; }
    fac.money -= amount;
    const grain = Math.floor(amount * rate);
    fac.grain += grain;
    return { ok: true, msg: `${c.name} 市集以 ${amount} 金换得 ${grain} 粮（汇率 1金≈${rate.toFixed(2)}粮）` };
  }
  // sell：以粮换金，按 EXCHANGE_FEE 折价
  if (fac.grain < amount) { refundCmd(state, fid); return { ok: false, msg: '军粮不足' }; }
  fac.grain -= amount;
  const gold = Math.floor((amount / rate) * EXCHANGE_FEE);
  fac.money += gold;
  return { ok: true, msg: `${c.name} 市集以 ${amount} 粮换得 ${gold} 金（折价 ${Math.round(EXCHANGE_FEE * 100)}%）` };
}

// —— 商业：相邻城池贸易 ——
// 从己方城市派商队前往相邻的非己方城市（中立 / 他国），换取金钱。
// 消耗 1 指令 + TRADE_GRAIN_COST 军粮（商队辎重）。目标为他国城市时有 TRADE_SEIZED_CHANCE
// 概率被劫掠（血本无归）；中立城市稳赚。收益随本城市集等级、目标城规模与商贸科技提升。
export function trade(state, fromCityId, toCityId, fid = PLAYER(state), rng) {
  const r = rng || Math.random;
  const from = cityById(state, fromCityId);
  const to = cityById(state, toCityId);
  if (!from || !to) return { ok: false, msg: '城市无效' };
  if (from.ownerFactionId !== fid) return { ok: false, msg: '出发城非你所属' };
  if (to.ownerFactionId === fid) return { ok: false, msg: '无需与己方城市通商（金粮本就共享）' };
  if (!from.adjacent.includes(toCityId)) return { ok: false, msg: '两城不相邻，无法通商' };
  if (!spendCmd(state, fid)) return { ok: false, msg: '指令点不足' };
  const fac = factionById(state, fid);
  if (fac.grain < TRADE_GRAIN_COST) { refundCmd(state, fid); return { ok: false, msg: '军粮不足以筹备商队' }; }
  fac.grain -= TRADE_GRAIN_COST;
  // 与他国通商：有被劫掠风险
  if (to.ownerFactionId != null && chance(r, TRADE_SEIZED_CHANCE)) {
    return { ok: true, msg: `🚫 商队赴 ${to.name} 途中遭劫，辎重尽失（-${TRADE_GRAIN_COST} 粮）`, success: false };
  }
  const gold = tradeGoldYield(state, from, to);
  fac.money += gold;
  return { ok: true, msg: `🧧 商队自 ${from.name} 抵 ${to.name} 通商，获利 ${gold} 金（-${TRADE_GRAIN_COST} 粮）`, success: true, gold };
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
  return { ok: true, msg: `${c.name} 征兵 ${count}（-${Math.round(gold)} 金，-${Math.round(pop)} 人口）` };
}

// —— 内政：操练（提升训练度；将军统率加成操练效率）——
export function train(state, cityId, fid = PLAYER(state)) {
  const c = cityById(state, cityId);
  if (!c || c.ownerFactionId !== fid) return { ok: false, msg: '该城非你所属' };
  if (c.training >= TRAINING_MAX) return { ok: false, msg: '训练度已满' };
  if (!spendCmd(state, fid)) return { ok: false, msg: '指令点不足' };
  const cost = 200;
  if (facMoney(state, fid) < cost) { refundCmd(state, fid); return { ok: false, msg: '金钱不足' }; }
  factionById(state, fid).money -= cost;
  const general = officeHolder(state, c, 'general');
  const gain = 8 + (general ? Math.max(0, (general.stats.l || 50) - 50) / 10 : 0); // 将军统率每点+0.1，满100约+5
  c.training = Math.min(TRAINING_MAX, c.training + gain);
  return { ok: true, msg: `${c.name} 操练部队，训练度 → ${c.training}${general ? `（${general.name} 督操）` : ''}` };
}

// —— 人事：探索（发现本城在野名将）——
// 设计：避免「徒劳无功」——
//   · 城中无任何在野名将 → 不耗指令，告知无可寻访；
//   · 在野名将已全部发现 → 不耗指令，提示可登用；
//   · 仍有未发现名将 → 耗 1 指令，且保证至少发现一位（魅力 / 军师智力越高，越可能多发现几位）。
export function explore(state, cityId, fid = PLAYER(state), rng) {
  const r = rng || Math.random;
  const c = cityById(state, cityId);
  if (!c || c.ownerFactionId !== fid) return { ok: false, msg: '该城非你所属' };
  const wilds = wildHeroesInCity(state, cityId);
  if (!wilds.length) {
    return { ok: true, noCost: true, msg: `${c.name} 四处寻访，并无名士风闻（可往他城探访）。`, discovered: [] };
  }
  const hidden = wilds.filter((w) => !w.discovered);
  if (!hidden.length) {
    return { ok: true, noCost: true, msg: `${c.name} 在野名将均已知晓，可择机登用。`, discovered: wilds };
  }
  if (!spendCmd(state, fid)) return { ok: false, msg: '指令点不足' };
  const roster = heroesInCity(state, cityId, fid);
  let charm = roster.length ? Math.max(...roster.map((h) => h.stats.c)) : 50;
  const strat = officeHolder(state, c, 'strategist'); // 军师智力辅助寻访
  if (strat) charm += (strat.stats.i || 50) * 0.2;
  // 保底发现一位（随机排序的首位），魅力 / 军师越高越可能顺带发现更多。
  const order = shuffle(r, hidden);
  const newly = [];
  order[0].discovered = true; newly.push(order[0]);
  for (let i = 1; i < order.length; i++) {
    if (chance(r, 0.3 + charm / 600)) { order[i].discovered = true; newly.push(order[i]); }
    else break;
  }
  return {
    ok: true,
    msg: `${c.name} 探访得知：${newly.map((w) => w.name).join('、')} 在此隐居！`,
    discovered: wilds.filter((w) => w.discovered),
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
  let charm = roster.length ? Math.max(...roster.map((x) => x.stats.c)) : 50;
  const strat = officeHolder(state, c, 'strategist'); // 军师智力辅助游说
  if (strat) charm += (strat.stats.i || 50) * 0.2;
  const cBonus = roster.length ? Math.max(...roster.map((x) => skillBonus(x).c_recruit)) : 0;
  let p = 0.25 + (charm - h.loyalty) / 200 + cBonus + techMult(state, fid, 'trick', 0.05) - 1;
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

// —— 人事：任命城市职官（太守 / 将军 / 军师，免费）——
// 同一武将不可兼多职：就任前先卸除其旧职；将军就任后即时重算城防以体现统率加成。
export function appointOffice(state, cityId, heroId, officeKey, fid = PLAYER(state)) {
  const c = cityById(state, cityId);
  const h = heroById(state, heroId);
  const office = OFFICE_MAP[officeKey];
  if (!office) return { ok: false, msg: '未知职官' };
  if (!c || c.ownerFactionId !== fid) return { ok: false, msg: '该城非你所属' };
  if (!h || h.factionId !== fid || h.status === 'prisoner') return { ok: false, msg: '该武将不可用' };
  if (h.cityId !== cityId) return { ok: false, msg: '武将须在本城方可任命' };
  clearHeroOffices(state, heroId); // 卸除旧职，避免一人身兼数职
  c[office.field] = heroId;
  if (officeKey === 'general') c.defense = maxDefense(state, c); // 将军统率即时抬升城防上限
  return { ok: true, msg: `${h.name} 出任 ${c.name}${office.name}` };
}
export function appointGovernor(state, cityId, heroId, fid = PLAYER(state)) {
  return appointOffice(state, cityId, heroId, 'governor', fid);
}
export function appointGeneral(state, cityId, heroId, fid = PLAYER(state)) {
  return appointOffice(state, cityId, heroId, 'general', fid);
}
export function appointStrategist(state, cityId, heroId, fid = PLAYER(state)) {
  return appointOffice(state, cityId, heroId, 'strategist', fid);
}

// —— 科技：开始研究 ——
export function research(state, techKey, fid = PLAYER(state)) {
  if (!TECH_KEYS.includes(techKey)) return { ok: false, msg: '未知科技' };
  state.researchByFaction = state.researchByFaction || {};
  if (state.researchByFaction[fid]) return { ok: false, msg: '本势力已有研究进行中' };
  if (techLevel(state, fid, techKey) >= techMaxLevel(state, fid)) {
    return { ok: false, msg: '该科技已达当前上限（升级城池可解锁更高上限）' };
  }
  if (!spendCmd(state, fid)) return { ok: false, msg: '指令点不足' };
  if (facMoney(state, fid) < TECH_COST_GOLD) { refundCmd(state, fid); return { ok: false, msg: '金钱不足' }; }
  factionById(state, fid).money -= TECH_COST_GOLD;
  const lord = lordOf(state, fid);
  const intel = lord ? lord.stats.i : 50;
  const turns = Math.max(1, Math.round(TECH_COST_TURNS - intel / 60));
  state.researchByFaction[fid] = { key: techKey, turnsLeft: turns };
  return { ok: true, msg: `开始研究，预计 ${turns} 回合完成（-${TECH_COST_GOLD} 金）` };
}

// —— 军事：出征（主帅 + 最多 2 名副将）——
// deputyIds（可选）：随主帅出征的副将 id 列表，须为己方、在出发城、非主将、非俘虏；超出 2 名取前 2 名。
// 副将提供攻击加成，并可于单挑时替主帅出阵（见 combat.js）。
export function campaign(state, fromCityId, toCityId, generalId, troops, formation, fid = PLAYER(state), rng, deputyIds = []) {
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
  // 副将校验：己方、在出发城、非俘虏、非主将，去重并限 2 名
  const deputies = [];
  const seen = new Set([generalId]);
  for (const id of (Array.isArray(deputyIds) ? deputyIds : [])) {
    if (deputies.length >= 2) break;
    if (!id || seen.has(id)) continue;
    const d = heroById(state, id);
    if (!d || d.factionId !== fid || d.status === 'prisoner' || d.cityId !== fromCityId) continue;
    seen.add(id);
    deputies.push(d);
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

  const attacker = { factionId: fid, general: g, deputies, soldiers: troops, training: from.training, formation: formation || 'normal' };
  const defGeneral = bestDefender(state, toCityId) || { id: '__militia__', name: '守城民兵', stats: { l: 50, w: 50, i: 40, p: 40, c: 40 }, skill: null };
  const defender = {
    factionId: to.ownerFactionId, general: defGeneral, soldiers: to.soldiers,
    defense: to.defense || 0, isCity: true, training: to.training || TRAINING_BASE, formation: 'normal',
  };

  const battle = createBattle({ attacker, defender });
  runBattle(battle, state, r);

  let won = battle.result === 'attacker';
  applyCampaignResult(state, battle, from, to, g, fid, r, deputies);
  // 占领后立即判定胜负（不必等到回合结束），让 UI 的 afterAction 即时弹出结算
  if (won) checkGameOver(state);

  const msgs = battle.log.slice(-3);
  return { ok: true, won, battle, msg: won ? `攻克 ${to.name}！` : `攻打 ${to.name} 失利。`, log: msgs };
}

// BFS 查找距 fromCityId 最近且归属 fid 的城市（按邻接跳数）；无则返回 null
function nearestFriendlyCity(state, fromCityId, fid) {
  if (!cityById(state, fromCityId)) return null;
  const seen = new Set([fromCityId]);
  const queue = [fromCityId];
  while (queue.length) {
    const cur = cityById(state, queue.shift());
    if (!cur) continue;
    for (const adj of cur.adjacent) {
      if (seen.has(adj)) continue;
      seen.add(adj);
      const c = cityById(state, adj);
      if (!c) continue;
      if (c.ownerFactionId === fid) return c;
      queue.push(adj);
    }
  }
  return null;
}

// 结算出征结果（占领 / 溃败 / 俘虏）
function applyCampaignResult(state, battle, from, to, attackerGen, fid, rng, deputies = []) {
  const won = battle.result === 'attacker';
  const captorFid = won ? fid : to.ownerFactionId;
  const oldOwnerFid = battle.defender ? battle.defender.factionId : null; // 城陷前归属（败方）
  const prisonerId = battle.prisoner;

  if (won) {
    // 占领：幸存兵力转为新守军，主将入驻
    const survivors = Math.round(battle.attacker.soldiers);
    to.ownerFactionId = fid;
    to.soldiers = survivors;
    to.training = from.training;
    attackerGen.cityId = to.id;
    // 主将原在出发城身兼职官 → 卸除旧职，避免同一武将被两城同时引用为职官
    clearHeroOffices(state, attackerGen.id);
    // 城已易主：由攻方主将入驻出任太守（败方职官随城陷卸任，见下方散兵处理）
    to.governorHeroId = attackerGen.id;
    // 缴获城库
    const lootGold = to.gold || 0;
    const lootGrain = to.grain || 0;
    factionById(state, fid).money += lootGold;
    factionById(state, fid).grain += lootGrain;
    to.gold = 0; to.grain = 0;
    state.turnLog.push(`🏰 攻陷 ${to.name}！缴获 ${lootGold} 金、${lootGrain} 粮，余兵 ${survivors} 驻守。`);
  } else {
    // 失利：出征兵力覆灭（已从 from 扣除）；守军实际伤亡如实回写到真实城市
    // （createBattle 做了浅拷贝，runBattle 只削减 battle.defender，需手动落账）
    to.soldiers = Math.round(battle.defender.soldiers);
    to.defense = Math.max(0, Math.round(battle.defender.defense));
    state.turnLog.push(`💔 攻打 ${to.name} 失利，出征军覆灭；守军余 ${to.soldiers}、城防余 ${to.defense}。`);
  }

  // 俘虏处理
  if (battle.prisoner && battle.prisoner !== '__militia__') {
    const ph = heroById(state, battle.prisoner);
    if (ph && captorFid != null) {
      ph.status = 'prisoner';
      ph.prisonerOf = captorFid;
      const capCity = citiesOf(state, captorFid)[0];
      if (capCity) ph.cityId = capCity.id;
      // 被俘者卸除一切职官（无论原属 to 或 from），杜绝悬挂引用
      clearHeroOffices(state, ph.id);
      state.turnLog.push(`⛓️ ${ph.name} 被俘。`);
    } else if (ph) {
      // 中立势力俘获 → 释放为在野
      ph.status = 'free';
      ph.wild = true;
      ph.discovered = false;
      clearHeroOffices(state, ph.id);
    }
  }

  // 城陷善后：未俘获的败方武将不可滞留于已被占领的城——
  // 迁至其势力最近的友城；若势力已无城可守，则转为在野（可被他方登用）。
  // 离城者一并卸除在陷城的职官（太守 / 将军 / 军师），维持「职官必在本城」不变量。
  if (won && oldOwnerFid != null) {
    const stragglers = state.heroes.filter((h) =>
      h.factionId === oldOwnerFid && h.cityId === to.id
      && h.status !== 'prisoner' && h.id !== prisonerId);
    const dest = stragglers.length ? nearestFriendlyCity(state, to.id, oldOwnerFid) : null;
    for (const sh of stragglers) {
      clearHeroOffices(state, sh.id);
      if (dest) {
        sh.cityId = dest.id;
      } else {
        sh.wild = true;
        sh.factionId = null;
        sh.status = 'free';
        sh.discovered = true; // 名义上原驻此城，可见
      }
    }
  }

  // 副将随主帅入驻新占之城（被俘者除外）；失利则副将留驻出发城，无需迁移。
  if (won && deputies && deputies.length) {
    for (const d of deputies) {
      if (d.status === 'prisoner') continue;
      clearHeroOffices(state, d.id); // 离开发起城，卸除其在出发城可能担任的职官
      d.cityId = to.id;
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
  // 金 / 粮为势力级共享池（见 economy.js），无需在城市间输送；
  // 唯一需要调运的城市级资源是士兵。
  const s = Math.max(0, Math.floor(payload.soldiers || 0));
  if (s <= 0) { refundCmd(state, fid); return { ok: false, msg: '输送数量无效' }; }
  if (s > from.soldiers) { refundCmd(state, fid); return { ok: false, msg: '兵力不足' }; }
  from.soldiers -= s;
  to.soldiers += s;
  return { ok: true, msg: `自 ${from.name} 向 ${to.name} 输送士兵 ${s}` };
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

  // 施计者取智力最高者（计略成功率取决于智力，而非统率）
  const casterRoster = heroesInCity(state, fromCityId, fid);
  const caster = casterRoster.length
    ? casterRoster.reduce((a, b) => ((a.stats.i || 0) >= (b.stats.i || 0) ? a : b))
    : { stats: { i: 50 } };
  const intel = caster.stats ? caster.stats.i : 50;
  const strat = officeHolder(state, from, 'strategist'); // 军师坐镇，计略更易奏效
  const stratBonus = strat ? Math.max(0, (strat.stats.i || 50) - 50) / 400 : 0;
  const targetGen = bestDefender(state, toCityId);
  const tIntel = targetGen && targetGen.stats ? targetGen.stats.i : 45;
  let p = 0.35 + (intel - tIntel) / 200 + techMult(state, fid, 'trick', 0.05) + stratBonus - 1;
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
  // 武将调离后卸除其在出发城的一切职官（太守 / 将军 / 军师），
  // 否则职官引用会指向已不在本城的武将（违反「职官必在本城」不变量）
  clearHeroOffices(state, heroId);
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

export { spendCmd, isPlayer, RECRUIT_LOYALTY_THRESHOLD, effLead, effWar, FORMATIONS, CITY_OFFICES };
