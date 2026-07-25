// ============================================================================
// 雄图·三国志文明 · 全局常量与公式
// 所有数值与战斗 / 经济公式集中于此，便于单测（scripts/logic-test.mjs）与平衡调整。
// ============================================================================

export const SAVE_KEY = 'xtsg_save_v1';
export const GAME_VERSION = 1;

export const BUILD_MAX = 5; // 城市建筑等级上限（农田 / 市集 / 城墙）
export const TRAINING_BASE = 50; // 士兵默认训练度
export const TRAINING_MAX = 100;

// —— 指令点数 ——
export const CMD_BASE = 5;
export const CMD_PER_CITY = 2;

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
export const TECH_MAX_LEVEL = 3;
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
