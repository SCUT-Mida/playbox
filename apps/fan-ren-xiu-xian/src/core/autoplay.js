// ============================================================================
// 自动挂机（自动修行）：主角每「周期」按玩家设定的倾向与权重，自动进行一项修行。
//
// 设计要点：
//  - 倾向（tendency）：可同时启用多个，每个带 1~9 的权重；每轮按权重加权抽取一项执行。
//  - 每轮至多执行一次主动行动；抽中的倾向若当下无法执行（活力/材料/条件不满足）则静默跳过，
//    被动修炼（每秒修为）由 UI 的 tick 持续累积，故挂机期间角色始终在成长。
//  - 探索 / 抉择 / 战斗 / 渡劫均由本模块「自动处置」完毕，全程不开弹窗，不与玩家手动操作冲突
//    （UI 侧在任意弹窗打开时会暂停自动挂机）。
//
// 纯逻辑、无 DOM 依赖；所有随机均接受外部注入的 rng，便于种子化单测。
// ============================================================================
import { ACTIVE_CULTIVATE_MP_COST, VITALITY_COSTS } from '../config.js';
import { weighted } from './rng.js';
import {
  recompute, addXp, realmInfo, equippedList, countItem, hasItem, removeItem,
  canAffordVitality, spendVitality, hasAnyEquipped,
} from './player.js';
import { activeCultivate } from './cultivate.js';
import { rollExplore, applyReward } from './explore.js';
import { createBattle, battleStep, battleRewards } from './battle.js';
import {
  nextTarget, canBreakthrough, needsTrial, attemptMinorBreakthrough,
  startMajorTrial, trialRespond, advanceRealm, failMajor,
} from './breakthrough.js';
import { tryAlchemy, tryForge, hasMaterials } from './alchemy.js';
import { rollMarket, buyItem } from './market.js';
import {
  metNpcs, canTeamUp, teamedToday, teamExplore, teamExploreRemaining,
  meetableNpcs, meetNpc,
} from './npc.js';
import { ITEMS } from '../data/items.js';
import { ALCHEMY_RECIPES, FORGE_BLUEPRINTS } from '../data/recipes.js';

export const DEFAULT_INTERVAL = 4;   // 默认周期节奏（秒/轮）
const MIN_INTERVAL = 1;
const MAX_INTERVAL = 30;
const MIN_WEIGHT = 0;                // 0 = 未启用
const MAX_WEIGHT = 9;

// 倾向定义：id / 图标 / 名称 / 默认权重 / 说明。新增倾向只需在此追加并实现对应 handler。
export const AUTO_TENDENCIES = [
  { id: 'cultivate', emoji: '🧘', label: '修炼', defaultWeight: 4, desc: '主动修炼攒修为，小概率顿悟' },
  { id: 'explore', emoji: '🗺️', label: '探索', defaultWeight: 3, desc: '行走江湖，自动处置遭遇与战斗' },
  { id: 'breakthrough', emoji: '🌀', label: '突破', defaultWeight: 3, desc: '修为圆满即突破，自动应对渡劫' },
  { id: 'craft', emoji: '⚗️', label: '炼制', defaultWeight: 2, desc: '材料齐备时自动炼丹 / 炼器' },
  { id: 'market', emoji: '🏪', label: '坊市', defaultWeight: 2, desc: '刷新坊市，自动购入活力丹等补给' },
  { id: 'team', emoji: '🤝', label: '结伴', defaultWeight: 1, desc: '与投缘道友结伴探险' },
  { id: 'meet', emoji: '🍃', label: '寻访', defaultWeight: 1, desc: '寻访结识各路修士' },
];

// 各倾向的默认权重表（深拷贝，避免被外部 mutate 污染）
export function defaultTendencies() {
  const t = {};
  for (const d of AUTO_TENDENCIES) t[d.id] = d.defaultWeight;
  return t;
}

// 一份全新的默认自动挂机配置
export function defaultAutoPlay() {
  return { enabled: false, intervalSec: DEFAULT_INTERVAL, tendencies: defaultTendencies() };
}

// 校验并补全自动挂机配置：缺字段 / 越界值 / 旧档迁移时兜底，返回规范化新对象。
// enabled 默认 false（绝不擅自替玩家开启自动挂机）。
export function normalizeAutoPlay(ap) {
  const tendencies = defaultTendencies();
  if (ap && typeof ap === 'object' && ap.tendencies && typeof ap.tendencies === 'object') {
    for (const d of AUTO_TENDENCIES) {
      const w = Number(ap.tendencies[d.id]);
      if (Number.isFinite(w)) tendencies[d.id] = clampWeight(w);
    }
  }
  let interval = ap ? Number(ap.intervalSec) : NaN;
  if (!Number.isFinite(interval)) interval = DEFAULT_INTERVAL;
  interval = Math.min(MAX_INTERVAL, Math.max(MIN_INTERVAL, Math.round(interval)));
  return { enabled: !!(ap && ap.enabled), intervalSec: interval, tendencies };
}
function clampWeight(w) {
  if (!Number.isFinite(w) || w <= 0) return 0;
  return Math.min(MAX_WEIGHT, Math.round(w));
}

// 按权重在「已启用」倾向中加权抽取一项；全部未启用返回 null。
export function pickTendency(config, rng) {
  const cfg = normalizeAutoPlay(config);
  const entries = AUTO_TENDENCIES
    .map((d) => ({ item: d.id, weight: cfg.tendencies[d.id] || 0 }))
    .filter((e) => e.weight > 0);
  if (!entries.length) return null;
  return weighted(rng, entries);
}

// —— 自动战斗策略辅助 ——
function hasHealPill(player) {
  return countItem(player, 'pill_huitian') > 0 || countItem(player, 'pill_huitian2') > 0;
}
function bestHealPill(player) {
  return countItem(player, 'pill_huitian2') > 0 ? 'pill_huitian2' : 'pill_huitian';
}
function hasTreasureSkill(player) {
  return equippedList(player).some((tr) => tr && tr.stats && tr.stats.skill);
}

function pushLogs(dst, src) {
  for (const l of (src || [])) dst.push(l);
}

// —— 倾向：修炼 ——
function autoCultivate(player, rng) {
  if (player.mp < ACTIVE_CULTIVATE_MP_COST) return { ok: false, logs: [] };
  if (!canAffordVitality(player, VITALITY_COSTS.cultivate)) return { ok: false, logs: [] };
  const res = activeCultivate(player, rng);
  if (!res.ok) return { ok: false, logs: [] };
  spendVitality(player, VITALITY_COSTS.cultivate);
  return {
    ok: true,
    logs: [{
      text: res.epiphany ? `🤖✨ 顿悟！修为 +${res.xp}` : `🤖🧘 主动修炼，修为 +${res.xp}`,
      type: res.epiphany ? 'epic' : 'good',
    }],
  };
}

// —— 倾向：探索（自动处置 battle / choice / instant / world）——
function autoExplore(player, rng) {
  const r = rng || Math.random;
  if (!canAffordVitality(player, VITALITY_COSTS.explore)) return { ok: false, logs: [] };
  const res = rollExplore(player, r);
  if (res.error) return { ok: false, logs: [] };
  spendVitality(player, VITALITY_COSTS.explore); // rollExplore 只扣 mp/hp，活力在此补扣
  const logs = [{ text: `🤖🗺️ 前往${res.sceneName}探索……`, type: 'normal' }];
  resolveAutoEncounter(player, res.encounter, r, logs);
  return { ok: true, logs };
}

// 自动处置一次探索遭遇（写入 logs、就地结算奖励）
function resolveAutoEncounter(player, enc, rng, logs) {
  if (!enc) return;
  if (enc.kind === 'battle') { autoBattle(player, enc.enemy, rng, logs); return; }
  if (enc.kind === 'choice') {
    // 取首个选项（多偏稳妥），自动抉择
    const opt = enc.options && enc.options[0];
    if (!opt) return;
    logs.push({ text: `🤖 抉择：${opt.emoji || ''} ${opt.label}`, type: 'normal' });
    const outcome = opt.resolve ? opt.resolve(rng) : null;
    if (outcome && outcome.battle) { autoBattle(player, outcome.battle, rng, logs); return; }
    pushLogs(logs, applyReward(player, outcome, rng));
    return;
  }
  // instant / world：直接结算
  pushLogs(logs, applyReward(player, enc.result, rng));
}

// 自动战斗至结束并结算（win/lose/flee）。复用 battleRewards + applyReward 结算战利品，
// 战绩统计与手动 finishBattle 一致（battlesWon / lowHpWins / deaths）。
function autoBattle(player, enemy, rng, logs) {
  const r = rng || Math.random;
  logs.push({ text: `🤖🐉 与${enemy.name}交锋！`, type: 'bad' });
  const battle = createBattle(player, enemy);
  let safety = 0;
  while (!battle.over && safety++ < 200) {
    let action;
    if (player.hp < player.maxHp * 0.3 && hasHealPill(player)) {
      action = { type: 'item', itemId: bestHealPill(player) };
    } else if (hasTreasureSkill(player) && safety % 2 === 0) {
      action = { type: 'skill' };
    } else {
      action = { type: 'attack' };
    }
    battleStep(battle, player, action, r);
  }
  settleBattle(player, enemy, battle.result, r, logs);
}

function settleBattle(player, enemy, result, rng, logs) {
  if (result === 'win') {
    player.stats.battlesWon += 1;
    if (player.hp <= 1) player.stats.lowHpWins += 1;
    const { gain } = battleRewards(player, enemy, rng); // 内含宗门「战胜妖兽」活动上报
    const xp = Math.round(player.xpMax * 0.05);
    logs.push({ text: `🤖🏆 战胜${enemy.name}！`, type: 'epic' });
    pushLogs(logs, applyReward(player, {
      stones: gain.stones, items: gain.items, treasure: gain.treasure,
      recipe: gain.recipe, xp,
    }, rng));
  } else if (result === 'lose') {
    player.stats.deaths += 1;
    const lost = Math.floor(player.stones * 0.1);
    player.stones -= lost;
    player.xp = Math.max(0, player.xp - Math.floor(player.xpMax * 0.05));
    logs.push({ text: `🤖💀 不敌${enemy.name}，败退（损失 ${lost} 灵石与部分修为）。`, type: 'bad' });
  } else {
    logs.push({ text: `🤖🏃 脱离战斗。`, type: 'normal' });
  }
}

// —— 倾向：炼制（自动挑一个材料齐备且已掌握的配方，优先难度更高者）——
function autoCraft(player, rng) {
  const r = rng || Math.random;
  if (!canAffordVitality(player, VITALITY_COSTS.craft)) return { ok: false, logs: [] };
  const candidates = [];
  for (const rc of ALCHEMY_RECIPES) if (player.recipes.includes(rc.id) && hasMaterials(player, rc.inputs)) candidates.push({ rc, forge: false });
  for (const rc of FORGE_BLUEPRINTS) if (player.recipes.includes(rc.id) && hasMaterials(player, rc.inputs)) candidates.push({ rc, forge: true });
  if (!candidates.length) return { ok: false, logs: [] };
  // 多个可炼时取难度最高（产出价值更高）
  const pick = candidates.reduce((a, b) => (b.rc.diff > a.rc.diff ? b : a));
  const res = pick.forge ? tryForge(player, pick.rc.id, r) : tryAlchemy(player, pick.rc.id, r);
  if (!res.ok) return { ok: false, logs: [] };
  spendVitality(player, VITALITY_COSTS.craft);
  return { ok: true, logs: (res.logs || []).map((l) => ({ text: `🤖 ${l.text}`, type: l.type })) };
}

// —— 倾向：结伴（取好感最高、可组队且本月未同游的道友）——
function autoTeam(player, rng) {
  const r = rng || Math.random;
  if (teamExploreRemaining(player) <= 0) return { ok: false, logs: [] };
  const candidates = metNpcs(player).filter((n) => canTeamUp(player, n.id) && !teamedToday(player, n.id));
  if (!candidates.length) return { ok: false, logs: [] };
  candidates.sort((a, b) => (npcAffinity(player, b) - npcAffinity(player, a)));
  const npc = candidates[0];
  const res = teamExplore(player, npc.id, r); // 内部扣 mp/hp/活力并上报宗门探索活动
  if (res.error) return { ok: false, logs: [] };
  const logs = [{ text: `🤖🤝 与${npc.name}结伴探险……`, type: 'epic' }];
  pushLogs(logs, applyReward(player, res.encounter.result, r));
  return { ok: true, logs };
}
// 取道友好感（npc.js 未导出 getter 名一致，这里按状态直读，避免增加导出面）
function npcAffinity(player, npc) {
  const st = player.npcs && player.npcs[npc.id];
  return st ? (st.aff || 0) : 0;
}

// —— 倾向：寻访 ——
function autoMeet(player, rng) {
  if (!meetableNpcs(player).length) return { ok: false, logs: [] };
  const res = meetNpc(player, rng); // 内部校验并扣除活力
  if (!res.ok) return { ok: false, logs: [] };
  return { ok: true, logs: res.logs || [] };
}

// —— 倾向：坊市 ——
// 每次光顾即刷新一次货架（视作「云游坊市，看看今日有何好货」），把有用的补给买入：
// 活力丹（挂机核心补给）/ 突破丹·清心丹（自动突破·渡心魔备用）/ 回血·补灵丹（自动战斗·渡劫续命）。
// 材料法宝功法配方及境界专用丹不自动采购（价格高、需按需手动），避免无谓消耗灵石。
// 买到的活力丹若当下活力有缺口则就地服一颗回补，让挂机得以持续，而非只囤在背包里。
function autoMarket(player, rng) {
  const r = rng || Math.random;
  const logs = [];
  const market = rollMarket(player, r); // 刷新货架（不收「刷新费」，自然随时光顾）
  let bought = false;
  for (const entry of market.entries) {
    if (entry.stock <= 0) continue;
    if (!wantBuy(player, entry)) continue;
    if (player.stones < entry.price) continue;
    const res = buyItem(player, entry, 1); // 内部校验背包容量 / 灵石并扣费扣库存
    if (!res.ok) continue;
    bought = true;
    logs.push({ text: `🤖🏪 购入${entry.name}（${res.cost} 灵石）`, type: 'good' });
  }
  const used = autoUseVitalityPill(player, logs);
  return { ok: bought || used, logs };
}

// 是否值得购入：仅补常用补给，并控制每种囤货上限，避免灵石被无意义地花光。
function wantBuy(player, entry) {
  const def = ITEMS[entry.id];
  if (!def) return false;
  if (def.effect && def.effect.kind === 'restore_vitality') return countItem(player, entry.id) < 3; // 活力丹留 3 颗
  if (def.role === 'break_boost' || def.role === 'heart_pass') return countItem(player, entry.id) < 3; // 突破 / 清心丹各 3 颗
  if (def.effect && (def.effect.kind === 'heal_hp' || def.effect.kind === 'heal_mp')) return countItem(player, entry.id) < 5; // 回血 / 补灵丹各 5 颗
  return false;
}

// 活力有缺口时服一颗库存活力丹回补，支撑长时间挂机。
// 选「能一次补满」的最小档（不浪费高阶丹）；都不够则取最高档尽量回血。
// 缺口 <10 时不服（接近满值不值得磕药），避免频繁消耗。
function autoUseVitalityPill(player, logs) {
  const need = (player.maxVitality || 0) - (player.vitality || 0);
  if (need < 10) return false;
  const owned = VITALITY_PILLS
    .filter((id) => countItem(player, id) > 0)
    .map((id) => ({ id, amt: ITEMS[id].effect.amount }))
    .sort((a, b) => a.amt - b.amt);
  if (!owned.length) return false;
  const pick = owned.find((o) => o.amt >= need) || owned[owned.length - 1];
  if (!removeItem(player, pick.id, 1)) return false;
  const before = player.vitality || 0;
  player.vitality = Math.min(player.maxVitality, before + pick.amt);
  logs.push({ text: `🤖🟢 服${ITEMS[pick.id].name}，活力 +${Math.round(player.vitality - before)}。`, type: 'good' });
  return true;
}
// 活力恢复类丹药（按回复量升序），供自动坊市购入与服用挑选
const VITALITY_PILLS = ['pill_peiyuan', 'pill_lingjiu', 'pill_xiancha'];

// —— 倾向：突破（小境界直接掷骰；大境界自动渡劫）——
function autoBreakthrough(player, rng) {
  const r = rng || Math.random;
  if (!canBreakthrough(player)) return { ok: false, logs: [] };
  const logs = [];
  if (needsTrial(player)) {
    const trial = startMajorTrial(player, r);
    if (!trial) return { ok: false, logs: [] };
    logs.push({
      text: trial.kind === 'heart' ? '🤖👁️‍🗨️ 自动渡心魔……'
        : (trial.kind === 'ascend' ? '🤖⚡ 自动渡飞升天劫……' : '🤖⚡ 自动渡天劫……'),
      type: 'epic',
    });
    let safety = 0;
    while (!trial.over && safety++ < 100) trialRespond(trial, player, pickTrialAction(player, trial), r);
    if (trial.success) {
      const adv = advanceRealm(player, trial.target);
      logs.push({ text: `🤖🌟 渡劫功成，迈入${realmInfo(player).majorName}${realmInfo(player).subName}！（+${adv.stones} 灵石）`, type: 'epic' });
    } else {
      failMajor(player, trial.kind);
      logs.push({ text: '🤖💥 渡劫失败，修为折损，下轮再战。', type: 'bad' });
    }
    return { ok: true, logs };
  }
  // 小境界：持有突破丹则服之
  const useTupo = hasItem(player, 'pill_tupo');
  const res = attemptMinorBreakthrough(player, useTupo, r);
  if (!res.ok) return { ok: false, logs: [] };
  pushLogs(logs, (res.log || []).map((t) => ({ text: `🤖 ${t}`, type: res.success ? 'epic' : 'bad' })));
  return { ok: true, logs };
}

// 自动渡劫每轮动作：心魔优先清心丹；天劫/飞升低血服丹、否则祭法宝硬抗
function pickTrialAction(player, trial) {
  if (trial.kind === 'heart') {
    return hasItem(player, 'pill_qingxin') ? { type: 'pill' } : { type: 'stand' };
  }
  if (player.hp < player.maxHp * 0.5 && hasHealPill(player)) return { type: 'pill' };
  if (hasAnyEquipped(player)) return { type: 'treasure' };
  return { type: 'endure' };
}

const HANDLERS = {
  cultivate: autoCultivate,
  explore: autoExplore,
  breakthrough: autoBreakthrough,
  craft: autoCraft,
  market: autoMarket,
  team: autoTeam,
  meet: autoMeet,
};

// 执行一轮自动挂机：按权重抽一个倾向并尝试执行。
// 返回 { ok, tendency, logs }：ok=false 表示本轮无可执行行动（静默跳过）。
export function autoStep(player, config, rng) {
  if (!player || player.ascended) return { ok: false, tendency: null, logs: [] };
  const r = rng || Math.random;
  const tid = pickTendency(config, r);
  if (!tid) return { ok: false, tendency: null, logs: [] };
  const handler = HANDLERS[tid];
  if (!handler) return { ok: false, tendency: null, logs: [] };
  const res = handler(player, r);
  return { ok: !!res.ok, tendency: tid, logs: res.logs || [] };
}
