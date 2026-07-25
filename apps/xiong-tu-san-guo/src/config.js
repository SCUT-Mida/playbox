// ============================================================================
// 雄图·三国志文明 · 全局常量与公式
// 所有数值与战斗 / 经济公式集中于此，便于单测（scripts/logic-test.mjs）与平衡调整。
// ============================================================================

export const SAVE_KEY = 'xtsg_save_v1';
export const GAME_VERSION = 1;

// —— 城池等级 / 资源（建筑）等级上限 ——
// 资源（农田 / 市集 / 城墙）等级上限随城池等级解锁：城池每升一级，三项资源上限 +5。
// 城池等级 1→5 时，资源上限依次为 5/10/15/20/25，告别「资源等级太低、早早封顶」的单调。
export const BUILD_MAX = 5; // 资源等级基础上限（城池等级 1 时的上限；亦即旧版的固定上限）
export const BUILD_CAP_STEP = 5; // 城池每升一级，资源等级上限提升的步长
export const CITY_MAX_LEVEL = 5; // 城池等级上限

// 取某城当前资源（农田/市集/城墙）等级上限：基础 BUILD_MAX，每级城池 +BUILD_CAP_STEP。
export function buildCapForCity(city) {
  const lvl = city && city.level ? Math.max(1, Math.min(CITY_MAX_LEVEL, city.level)) : 1;
  return BUILD_MAX + (lvl - 1) * BUILD_CAP_STEP;
}

// 升级城池所需金钱（从当前 level 升至下一级）
export function cityUpgradeGoldCost(level) {
  return 1500 + level * 1500;
}

export const TRAINING_BASE = 50; // 士兵默认训练度
export const TRAINING_MAX = 100;

// —— 城市职官 ——
// 每城可设太守 / 将军 / 军师各一，免费任命，须在城内就任；
// 离城（调遣 / 被俘 / 城陷）自动卸任，保证「职官必在本城」不变量。
// stat 为该职官发挥加成的主属性，statName 为中文名。
export const CITY_OFFICES = [
  { key: 'governor', field: 'governorHeroId', name: '太守', stat: 'p', statName: '政治',
    effect: '政治加成人口增长与农、商收入', icon: '📜' },
  { key: 'general', field: 'generalHeroId', name: '将军', stat: 'l', statName: '统率',
    effect: '统率加成城防与操练效率', icon: '⚔️' },
  { key: 'strategist', field: 'strategistHeroId', name: '军师', stat: 'i', statName: '智力',
    effect: '智力加成探索发现与计略成功', icon: '🪶' },
];
export const OFFICE_MAP = Object.fromEntries(CITY_OFFICES.map((o) => [o.key, o]));
export const officeField = (key) => (OFFICE_MAP[key] || {}).field;

// —— 指令点数 ——
export const CMD_BASE = 5;
export const CMD_PER_CITY = 2;

// 各动作消耗的指令点（0 = 免费）。用于 UI 标注与一致展示。
// 注意：探索在「无人在野 / 已全发现」时不耗指令（见 actions.explore）。
export const CMD_COST = {
  developFarm: 1, developMarket: 1, buildWall: 1,
  recruit: 1, train: 1, explore: 1,
  recruitHero: 1, reward: 1, recruitPrisoner: 1,
  appointOffice: 0, moveHero: 0,
  campaign: 1, transport: 1, stratagem: 1, research: 1,
  upgradeCity: 1, exchange: 1, trade: 1,
};
export const cmdCostOf = (key) => (CMD_COST[key] != null ? CMD_COST[key] : 1);

// —— 资源对换（商铺）：金 ↔ 粮 ——
// 兑换汇率随本城市集等级与商贸科技提升；卖出比买入略亏（30% 手续费），杜绝无脑套利。
export const EXCHANGE_RATE_BASE = 2; // 基础汇率：1 金 → 2 粮（买入粮食时）
export const EXCHANGE_FEE = 0.7; // 卖出折价：卖出所得 = 市价 × 0.7
// 本城兑换汇率（每金可换粮数）：市集等级 / 商贸科技越高越划算。
export function exchangeRate(state, city) {
  if (!city) return EXCHANGE_RATE_BASE;
  const marketMult = 1 + Math.max(0, (city.marketLevel || 1) - 1) * 0.1;
  const techMultVal = state && city.ownerFactionId != null
    ? techMultOfCommerce(state, city.ownerFactionId) : 1;
  return EXCHANGE_RATE_BASE * marketMult * techMultVal;
}

// —— 相邻城池贸易 ——
// 向相邻非己方城市（中立 / 他国）派出商队，按本城市集等级与目标城规模结算金钱收益；
// 目标为他国城市时，商队有一定概率被劫掠（人财两空），中立城市则稳赚。
export const TRADE_GRAIN_COST = 200; // 每次贸易消耗军粮（商队辎重）
export const TRADE_SEIZED_CHANCE = 0.35; // 与他国贸易被劫掠的概率
export function tradeGoldYield(state, fromCity, toCity) {
  const tier = toCity && toCity.popMax ? cityTierRaw(toCity) : 2;
  const base = 80 + (fromCity.marketLevel || 1) * 50 + tier * 100;
  const techMultVal = state && fromCity.ownerFactionId != null
    ? techMultOfCommerce(state, fromCity.ownerFactionId) : 1;
  return Math.round(base * techMultVal);
}

// 城池规模数值（1/2/3）——供贸易结算用，避免与 data/cities 的 cityTier 循环引用。
function cityTierRaw(city) {
  const p = city.popMax || city.maxPopulation || 0;
  if (p >= 85000) return 3;
  if (p >= 72000) return 2;
  return 1;
}

// 商贸科技乘子（供 exchange / trade 复用），就地轻量实现，避免与 tech.js 循环依赖。
function techMultOfCommerce(state, fid) {
  const tbl = state && state.techLevelsByFaction && state.techLevelsByFaction[fid];
  const lv = (tbl && tbl.commerce) || 0;
  return 1 + lv * 0.05;
}

// —— 经济（每回合结算）——
export const GOLD_PER_MARKET = 100; // 市集等级 × 100
export const GOLD_PER_POP = 0.5; // 人口 × 0.5
export const GRAIN_PER_FARM = 200; // 农田等级 × 200
export const GRAIN_UPKEEP_PER_SOLDIER = 0.5; // 士兵每回合吃粮
export const POP_GROWTH_RATE = 0.02; // 自然增长率基础
export const POP_GROWTH_POL_DIVISOR = 100; // 政治 / 100 作为系数

// —— 征兵 ——
export const RECRUIT_GOLD_PER_SOLDIER = 1.5; // 每名士兵花费金钱
export const RECRUIT_POP_PER_SOLDIER = 1; // 征兵消耗人口

// 升级建筑花费：从当前 level 升到下一级
export function buildCost(level) {
  return 300 + level * 200;
}

// —— 科技 ——
// 科技等级上限随城池等级解锁：势力最高城池每升一级，科技上限 +TECH_CAP_STEP。
// 城池等级 1→5 时，科技上限依次为 3/4/5/6/7（详见 tech.js 的 techMaxLevel）。
export const TECH_MAX_LEVEL = 3; // 科技基础上限（城池等级 1 时；亦即旧版的固定上限）
export const TECH_CAP_STEP = 1; // 势力最高城池每升一级，科技等级上限提升的步长
export const TECHS = {
  agri: { name: '农艺', desc: '粮食产量 +10% / 级', icon: '🌾' },
  commerce: { name: '商贸', desc: '金钱收入 +10% / 级', icon: '💰' },
  forge: { name: '冶炼', desc: '士兵攻击 +5% / 级', icon: '⚒️' },
  wall: { name: '筑城', desc: '城防值 +20% / 级', icon: '🧱' },
  trick: { name: '谋略', desc: '计谋成功率 +5% / 级', icon: '📜' },
  leadership: { name: '统御', desc: '带兵上限 +10% / 级', icon: '⚓' },
};
export const TECH_COST_GOLD = 800; // 每级基础金钱花费
export const TECH_COST_TURNS = 3; // 每级基础研究回合（智力可缩短）

// —— 战斗 ——
export const FORMATIONS = {
  normal: { name: '普通', atk: 1.0, def: 1.0, desc: '攻守均衡' },
  assault: { name: '攻击', atk: 1.2, def: 0.85, desc: '攻击 +20% / 防御 -15%' },
  defend: { name: '防御', atk: 0.85, def: 1.2, desc: '攻击 -15% / 防御 +20%' },
};
export const DUEL_THRESHOLD = 20; // 武力差 > 20 可触发单挑
export const DUEL_CHANCE = 0.22; // 每回合触发单挑的概率
export const DUEL_ROUT_RATIO = 0.35; // 单挑败方溃散的兵力比例

// —— 计略 ——
export const STRATAGEMS = {
  fire: { name: '火攻', desc: '降低目标城防 30%', icon: '🔥', range: 0.3 },
  burn: { name: '烧粮', desc: '烧毁目标军粮 30%', icon: '🔥', range: 0.3 },
  rumor: { name: '流言', desc: '降低目标守将忠诚 25', icon: '🗯️', range: 25 },
};

// —— 势力颜色 ——
export const FACTION_COLORS = [
  '#c0392b', '#27ae60', '#2980b9', '#8e44ad',
  '#d35400', '#16a085', '#ad1457', '#f39c12', '#5d6d7e',
];
export const PLAYER_COLOR = '#c0392b';
export const NEUTRAL_COLOR = '#7f8c8d';

// —— 探索 / 登用 ——
export const EXPLORE_DISCOVERY_BASE = 0.5; // 每位在野名将的发现概率基础（× 魅力修正）
export const RECRUIT_LOYALTY_THRESHOLD = 30; // 忠诚低于此值的敌将易被策反

export function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

// 季节名（每回合 = 三个月）
export const SEASONS = ['春', '夏', '秋', '冬'];
export function seasonOf(turn) {
  return SEASONS[(turn - 1) % SEASONS.length];
}
