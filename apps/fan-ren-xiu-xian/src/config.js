// ============================================================================
// 凡人修仙录 · 全局配置与数值公式（纯函数，无 DOM 依赖，便于单测）
// ============================================================================

// ── 境界体系（大境界，从低到高）───────────────────────────────────────────────
// subs: 小层名称列表；trial: 进入本境界需经历的考验（null 表示无）
//   - 'heart'    心魔（神识判定，多轮，需多数通过）
//   - 'trib'     天劫（多轮雷/火/风，撑过即成）
//   - 'ascend'   飞升天劫（终局）
// reqItem: 进入本境界推荐/所需丹药 id（null 表示无，仅靠自身感悟）
// speedFactor: 本境界被动修炼速度系数
export const REALMS = [
  { name: '凡人', short: '凡', subs: ['凡人'], color: '#9b8c7a', trial: null, reqItem: null, speedFactor: 0.5, desc: '一介凡夫，尚未引气入体。' },
  { name: '炼气期', short: '气', subs: ['一层', '二层', '三层', '四层', '五层', '六层', '七层', '八层', '九层', '十层', '十一层', '十二层', '十三层'], color: '#7fd17f', trial: null, reqItem: null, speedFactor: 1.0, desc: '吐纳天地灵气，洗髓伐毛。' },
  { name: '筑基期', short: '筑', subs: ['初期', '中期', '后期', '圆满'], color: '#5fb8e0', trial: 'heart', reqItem: 'pill_zhuji', speedFactor: 1.7, desc: '筑就大道根基，灵力凝液。' },
  { name: '结丹期', short: '丹', subs: ['初期', '中期', '后期', '圆满'], color: '#b07cf0', trial: 'heart', reqItem: 'pill_jiedan', speedFactor: 2.6, desc: '灵力结丹，寿元大增。' },
  { name: '元婴期', short: '婴', subs: ['初期', '中期', '后期', '圆满'], color: '#f0a04b', trial: 'trib', reqItem: 'pill_yuanying', speedFactor: 3.7, desc: '元婴离体，神通初显。' },
  { name: '化神期', short: '神', subs: ['初期', '中期', '后期', '圆满'], color: '#e05b5b', trial: 'trib', reqItem: 'pill_huashen', speedFactor: 5.0, desc: '元神化形，感悟天地。' },
  { name: '炼虚期', short: '虚', subs: ['初期', '中期', '后期', '圆满'], color: '#4bd0c0', trial: 'trib', reqItem: null, speedFactor: 6.6, desc: '炼虚合道，初窥空间之理。' },
  { name: '合体期', short: '合', subs: ['初期', '中期', '后期'], color: '#d0c04b', trial: 'trib', reqItem: null, speedFactor: 8.4, desc: '元神肉身合一，难如登天。' },
  { name: '大乘期', short: '乘', subs: ['初期', '中期', '后期'], color: '#c8c4dc', trial: 'trib', reqItem: null, speedFactor: 10.4, desc: '大乘圆满，为飞升做准备。' },
  { name: '飞升', short: '仙', subs: ['飞升成仙'], color: '#ffd700', trial: 'ascend', reqItem: null, speedFactor: 13.0, desc: '渡过飞升之劫，得道成仙。' },
];

// 飞升结局占位境界索引
export const ASCEND_INDEX = REALMS.length - 1;

// ── 灵根资质（开局随机生成，影响修炼速度与突破成功率，可后天奇遇改变）─────────
// mult: 修炼速度倍率；breakBonus: 突破成功率加成；weight: 随机权重
export const SPIRIT_ROOTS = [
  { id: 'pseudo', name: '伪灵根', mult: 0.7, breakBonus: -0.10, weight: 35, desc: '灵根驳杂，修行事倍功半。' },
  { id: 'tri', name: '三灵根', mult: 0.9, breakBonus: -0.03, weight: 30, desc: '三系杂灵根，资质平平。' },
  { id: 'dual', name: '双灵根', mult: 1.1, breakBonus: 0.03, weight: 22, desc: '双系真灵根，小有所成。' },
  { id: 'heaven', name: '天灵根', mult: 1.4, breakBonus: 0.10, weight: 10, desc: '单系天灵根，万中无一。' },
  { id: 'mutant', name: '异灵根', mult: 1.8, breakBonus: 0.15, weight: 3, desc: '雷/冰/风等异灵根，天纵之资。' },
];

// ── 全局等级编号 ────────────────────────────────────────────────────────────
// 把 (tier, sub) 映射为线性等级，便于统一计算 xp 阈值与属性。
// 凡人=0；炼气一层..十三层=1..13；筑基=14..17；…… 以此类推。
export function globalLevel(tier, sub) {
  let lv = 0;
  for (let t = 0; t < tier; t++) lv += REALMS[t].subs.length;
  return lv + sub;
}

// 从全局等级反推 (tier, sub)
export function fromGlobalLevel(lv) {
  let remain = lv;
  for (let t = 0; t < REALMS.length; t++) {
    const len = REALMS[t].subs.length;
    if (remain < len) return { tier: t, sub: remain };
    remain -= len;
  }
  return { tier: ASCEND_INDEX, sub: 0 };
}

export const MAX_GLOBAL_LEVEL = globalLevel(ASCEND_INDEX, REALMS[ASCEND_INDEX].subs.length - 1);

// ── 修为阈值：经验曲线，随等级指数增长 ────────────────────────────────────────
export function xpNeeded(lv) {
  if (lv <= 0) return 30; // 凡人引气入体所需
  return Math.round(45 * Math.pow(1.16, lv - 1));
}

// ── 被动修炼：每秒修为（与灵根、境界挂钩）──────────────────────────────────
export function passiveXpPerSec(tier, rootMult) {
  const realm = REALMS[tier] || REALMS[1];
  if (realm.speedFactor <= 0) return 0; // 凡人不自动修炼
  return 1.0 * realm.speedFactor * rootMult;
}

// ── 主动修炼：消耗灵力，瞬时获得一段被动修为，有顿悟概率 ───────────────────────
export const ACTIVE_CULTIVATE_MP_COST = 8;
export function activeCultivateGain(tier, rootMult) {
  // 约等于 18 秒被动修为
  return Math.max(1, passiveXpPerSec(tier, rootMult) * 18);
}
export const EPIPHANY_CHANCE = 0.08; // 顿悟概率
export const EPIPHANY_MULT = 3; // 顿悟倍率

// ── 灵力 / 气血回复（每秒）─────────────────────────────────────────────────
export function hpRegenPerSec(maxHp) { return Math.max(1, maxHp * 0.02); }
export function mpRegenPerSec(maxMp) { return Math.max(1, maxMp * 0.05); }

// ── 衍生战斗属性（随境界成长，再加装备/功法/称号加成）──────────────────────────
export function baseMaxHp(lv) { return 50 + lv * 16; }
export function baseMaxMp(lv) { return 30 + lv * 9; }
export function baseAtk(lv) { return 6 + lv * 3; }
export function baseDef(lv) { return 3 + lv * 2; }
export function baseSpirit(lv) { return 10 + lv * 4; } // 神识：影响炼丹/心魔判定

// ── 修炼速度总倍率（灵根 × 称号 × 功法 × 混沌事件 buff）────────────────────────
export function cultivateSpeedMult(player) {
  let m = player.rootMult;
  for (const id of player.titles) m *= titleCultivateMult(id);
  for (const id of player.techniques) m *= techniqueDef(id).cultivate || 1;
  if (player.chaos && player.chaos.speedBoostUntil > nowSec()) m *= 2;
  return m;
}

// ── 战斗伤害公式 ────────────────────────────────────────────────────────────
// atk × (0.8~1.2 随机) − def，下限 1；克制倍率（金木水火土循环克制，可选）
export function computeDamage(atk, def, rng, counterMult = 1) {
  // 显式判空：注入的 rng() 合法返回 0 时不能被 || 兜底（否则破坏种子化/确定性）
  const r = rng ? rng() : Math.random();
  const variance = 0.8 + r * 0.4; // 0.8~1.2
  const raw = atk * variance * counterMult - def;
  return Math.max(1, Math.round(raw));
}

// 五行克制倍率：金克木、木克土、土克水、水克火、火克金；同系 1；无属性 1
const COUNTER = { metal: 'wood', wood: 'earth', earth: 'water', water: 'fire', fire: 'metal' };
export function counterMult(atkEl, defEl) {
  if (!atkEl || !defEl) return 1;
  if (atkEl === defEl) return 1;
  return COUNTER[atkEl] === defEl ? 1.3 : 0.85;
}

// ── 突破成功率（基础 + 灵根 + 丹药 + 功法 + 境界难度）────────────────────────
export function breakthroughChance(player, hasBreakPill, targetTier) {
  let base = 0.7;
  base += player.rootBonus; // 灵根加成
  if (hasBreakPill) base += 0.2; // 服用突破丹
  for (const id of player.techniques) base += (techniqueDef(id).breakBonus || 0);
  // 越往后境界越难
  base -= Math.max(0, (targetTier - 2)) * 0.04;
  return clamp(base, 0.15, 0.97);
}

// ── 离线收益 ────────────────────────────────────────────────────────────────
export const OFFLINE_CAP_HOURS = 8;
export const OFFLINE_EFFICIENCY = 0.6; // 离线按被动修炼的 60% 结算

// ── 探索 ────────────────────────────────────────────────────────────────────
export const EXPLORE_MP_COST = 12;
export const EXPLORE_HP_COST = 6;
export const PITTY_THRESHOLD = 10; // 连续 N 次无稀有事件后，下次概率提升
export const PITTY_BOOST = 0.45;

// ── 工具 ────────────────────────────────────────────────────────────────────
export function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
export function nowSec() { return Math.floor(Date.now() / 1000); }

// ============================================================================
// 以下为对 items / techniques 的轻量查表入口（避免循环依赖，data 模块再 import 本文件）。
// 通过懒查表函数，让 config 中的公式可在 items 数据就绪后使用。
// ============================================================================
let _ITEMS = null;
let _TECHNIQUES = null;
export function _registerItems(items) { _ITEMS = items; }
export function _registerTechniques(techs) { _TECHNIQUES = techs; }
export function itemDef(id) { return (_ITEMS && _ITEMS[id]) || null; }
export function techniqueDef(id) { return (_TECHNIQUES && _TECHNIQUES[id]) || { cultivate: 1, breakBonus: 0 }; }
export function titleCultivateMult(id) {
  // 称号提供的修炼加成（多数为 1）
  const map = { title_qidao: 1.05, title_xianyuan: 1.08 };
  return map[id] || 1;
}
