// ============================================================================
// 凡人修仙录 · 全局配置与数值公式（纯函数，无 DOM 依赖，便于单测）
// ============================================================================
import { TALENTS } from './data/characters.js';

// ── 境界体系（大境界，从低到高）───────────────────────────────────────────────
// subs: 小层名称列表；trial: 进入本境界需经历的考验（null 表示无）
//   - 'heart'    心魔（神识判定，多轮，需多数通过）
//   - 'trib'     天劫（多轮雷/火/风，撑过即成）
//   - 'ascend'   飞升天劫（终局）
// reqItem: 进入本境界推荐/所需丹药 id（null 表示无，仅靠自身感悟）
// speedFactor: 本境界被动修炼速度系数
// lifespan: 本境界的寿元上限（岁）；越高境界寿元越长。null 表示无量寿（飞升）。
//   年龄超过当前境界寿元即「大限将至」，可轮回重修一次（见 player.reincarnate）。
export const REALMS = [
  { name: '凡人', short: '凡', subs: ['凡人'], color: '#9b8c7a', trial: null, reqItem: null, speedFactor: 0.5, lifespan: 90, desc: '一介凡夫，尚未引气入体。' },
  { name: '炼气期', short: '气', subs: ['一层', '二层', '三层', '四层', '五层', '六层', '七层', '八层', '九层', '十层', '十一层', '十二层', '十三层'], color: '#7fd17f', trial: null, reqItem: null, speedFactor: 1.0, lifespan: 140, desc: '吐纳天地灵气，洗髓伐毛。' },
  { name: '筑基期', short: '筑', subs: ['初期', '中期', '后期', '圆满', '巅峰'], color: '#5fb8e0', trial: 'heart', reqItem: 'pill_zhuji', speedFactor: 1.7, lifespan: 240, desc: '筑就大道根基，灵力凝液。' },
  { name: '结丹期', short: '丹', subs: ['初期', '中期', '后期', '圆满', '巅峰'], color: '#b07cf0', trial: 'heart', reqItem: 'pill_jiedan', speedFactor: 2.6, lifespan: 460, desc: '灵力结丹，寿元大增。' },
  { name: '元婴期', short: '婴', subs: ['初期', '中期', '后期', '圆满', '巅峰'], color: '#f0a04b', trial: 'trib', reqItem: 'pill_yuanying', speedFactor: 3.7, lifespan: 880, desc: '元婴离体，神通初显。' },
  { name: '化神期', short: '神', subs: ['初期', '中期', '后期', '圆满', '巅峰'], color: '#e05b5b', trial: 'trib', reqItem: 'pill_huashen', speedFactor: 5.0, lifespan: 1600, desc: '元神化形，感悟天地。' },
  { name: '炼虚期', short: '虚', subs: ['初期', '中期', '后期', '圆满', '巅峰'], color: '#4bd0c0', trial: 'trib', reqItem: null, speedFactor: 6.6, lifespan: 3200, desc: '炼虚合道，初窥空间之理。' },
  { name: '合体期', short: '合', subs: ['初期', '中期', '后期', '巅峰'], color: '#d0c04b', trial: 'trib', reqItem: null, speedFactor: 8.4, lifespan: 6000, desc: '元神肉身合一，难如登天。' },
  { name: '大乘期', short: '乘', subs: ['初期', '中期', '后期', '巅峰'], color: '#c8c4dc', trial: 'trib', reqItem: null, speedFactor: 10.4, lifespan: 12000, desc: '大乘圆满，为飞升做准备。' },
  { name: '飞升', short: '仙', subs: ['飞升成仙'], color: '#ffd700', trial: 'ascend', reqItem: null, speedFactor: 13.0, lifespan: null, desc: '渡过飞升之劫，得道成仙，与天地同寿。' },
];

// 飞升结局占位境界索引
export const ASCEND_INDEX = REALMS.length - 1;

// ── 灵根体系（三轴：等级 × 组合 × 属性）──────────────────────────────────────
// 灵根由三个相互独立的维度共同决定，开局随机生成，影响修炼速度、突破成功率、
// 以及与功法/法宝的契合度；可后天奇遇（洗髓丹）提升「等级」档次。
//
// ① 等级（资质档次，root grade）：从低到高 mult / breakBonus 递增。
//    special=true 表示异灵根（可得风/雷/冰等异属性）。
export const ROOT_GRADES = [
  { id: 'pseudo', name: '伪灵根', mult: 0.70, breakBonus: -0.10, weight: 32, desc: '灵根驳杂，修行事倍功半。' },
  { id: 'ren',    name: '人灵根', mult: 0.85, breakBonus: -0.03, weight: 28, desc: '凡品灵根，资质平平。' },
  { id: 'di',     name: '地灵根', mult: 1.05, breakBonus: 0.03,  weight: 22, desc: '良品灵根，小有所成。' },
  { id: 'tian',   name: '天灵根', mult: 1.30, breakBonus: 0.09,  weight: 12, desc: '单系天灵根，万中无一。' },
  { id: 'yi',     name: '异灵根', mult: 1.65, breakBonus: 0.14,  weight: 6, special: true, desc: '雷/冰/风等异灵根，天纵之资。' },
];
// ② 组合（所含属性数量，root count）：属性越少越精纯，修炼越专注；
//    focusMult 叠乘到 rootMult 上。单灵根仅天/异灵根可得（精纯至极）。
export const ROOT_COUNTS = [
  { id: 'five',   name: '五灵根', count: 5, weight: 26, focusMult: 0.82, desc: '五行俱全，驳杂难精。' },
  { id: 'four',   name: '四灵根', count: 4, weight: 24, focusMult: 0.90, desc: '四系并存，资质尚浅。' },
  { id: 'tri',    name: '三灵根', count: 3, weight: 22, focusMult: 1.00, desc: '三系杂灵根。' },
  { id: 'dual',   name: '双灵根', count: 2, weight: 18, focusMult: 1.12, desc: '双系真灵根，小有所成。' },
  { id: 'single', name: '单灵根', count: 1, weight: 10, focusMult: 1.25, desc: '单系精纯，专心一志。' },
];
// ③ 属性（五行 / 异属性）。异属性仅异灵根可得；不参与五行相克（中性）。
export const FIVE_ELEMENTS = [
  { id: 'metal', name: '金', emoji: '⚔️' },
  { id: 'wood',  name: '木', emoji: '🌿' },
  { id: 'water', name: '水', emoji: '💧' },
  { id: 'fire',  name: '火', emoji: '🔥' },
  { id: 'earth', name: '土', emoji: '🪨' },
];
export const MUTANT_ELEMENTS = [
  { id: 'wind',    name: '风', emoji: '🌪️' },
  { id: 'thunder', name: '雷', emoji: '⚡' },
  { id: 'ice',     name: '冰', emoji: '❄️' },
];
export const ELEMENTS = (() => {
  const m = {};
  for (const e of FIVE_ELEMENTS) m[e.id] = e;
  for (const e of MUTANT_ELEMENTS) m[e.id] = e;
  return m;
})();
export function elDef(id) { return ELEMENTS[id] || null; }
export function elName(id) { const e = elDef(id); return e ? e.name : ''; }

// 灵根与功法/法宝的契合度：根含此属性 → 契合加成；否则中性（不惩罚）。
export const ROOT_AFFINITY_MATCH = 1.12;     // 契合：修炼/攻防额外 +12%
export const ROOT_AFFINITY_BREAK_BONUS = 0.03; // 契合功法额外突破成功率
export function rootAffinity(root, el) {
  if (!el) return 1;
  const els = (root && root.els) || [];
  return els.includes(el) ? ROOT_AFFINITY_MATCH : 1;
}

export function rootGradeDef(id) { return ROOT_GRADES.find((g) => g.id === id) || ROOT_GRADES[0]; }
export function rootCountDef(id) { return ROOT_COUNTS.find((c) => c.id === id) || ROOT_COUNTS[2]; }

// 由结构化灵根 { grade, count, els } 派生展示与数值描述（纯函数）。
// 返回 { grade, count, els, mult, breakBonus, name, desc, elNames, displayEls }。
export function rootDescriptor(root) {
  const r = root || {};
  const grade = rootGradeDef(r.grade);
  const count = rootCountDef(r.count);
  const els = (r.els || []).map(elDef).filter(Boolean);
  const mult = grade.mult * count.focusMult;
  const breakBonus = grade.breakBonus;
  const elNames = els.map((e) => e.name).join('');
  const displayEls = els.map((e) => `${e.emoji}${e.name}`).join(' ');
  // 显示名：组合(n灵根) · 等级(灵根等级) · 属性(五行属性)，
  // 如「单灵根·天灵根·金」「单灵根·异灵根·雷」「双灵根·地灵根·木火」
  const name = elNames ? `${count.name}·${grade.name}·${elNames}` : `${count.name}·${grade.name}`;
  return { grade, count, els, mult, breakBonus, elNames, displayEls, name, desc: grade.desc };
}

// 兼容旧引用：SPIRIT_ROOTS 仍可按「等级档次」数组访问（部分历史代码/单测沿用）。
export const SPIRIT_ROOTS = ROOT_GRADES;

// 旧版存档的 rootId（pseudo/tri/dual/heaven/mutant，混轴）→ 新版三轴灵根的确定性映射。
// 供存档迁移与 recompute 兜底使用（无随机，保证幂等）。
export function rootFromLegacy(rootId) {
  const map = {
    pseudo: { grade: 'pseudo', count: 'five',   els: ['metal', 'wood', 'water', 'fire', 'earth'] },
    tri:    { grade: 'ren',    count: 'tri',    els: ['metal', 'wood', 'water'] },
    dual:   { grade: 'di',     count: 'dual',   els: ['metal', 'wood'] },
    heaven: { grade: 'tian',   count: 'single', els: ['metal'] },
    mutant: { grade: 'yi',     count: 'single', els: ['thunder'] },
  };
  return map[rootId] || { grade: 'pseudo', count: 'tri', els: ['metal', 'wood', 'water'] };
}

// ── 全局等级编号 ────────────────────────────────────────────────────────────
// 把 (tier, sub) 映射为线性等级，便于统一计算 xp 阈值与属性。
// 凡人=0；炼气一层..十三层=1..13；筑基=14..17；…… 以此类推。
export function globalLevel(tier, sub) {
  let lv = 0;
  const t = Math.min(Math.max(0, Math.floor(tier) || 0), ASCEND_INDEX);
  for (let i = 0; i < t; i++) lv += REALMS[i].subs.length;
  return lv + (Math.floor(sub) || 0);
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

// —— 境界越界防御 ——
// REALMS[player.tier] / realm.subs[player.sub] 在 tier/sub 非法（损坏档 / 导入串 /
// 旧版缺字段）时会读到 undefined，进而抛 TypeError 导致整页闪退（修炼→刷新状态栏
// → realmInfo 这条热路径尤为常见，表现为「点修炼偶发闪退」）。这里集中兜底：
// 把 tier/sub 钳制到合法区间，杜绝越界访问。
// 就地修正玩家境界到合法区间（mutate）。供 recompute 等可写场景使用。
export function sanitizeRealm(player) {
  if (!player) return player;
  player.tier = clamp(Math.floor(Number.isFinite(player.tier) ? player.tier : 0), 0, ASCEND_INDEX);
  const subs = REALMS[player.tier].subs;
  player.sub = clamp(Math.floor(Number.isFinite(player.sub) ? player.sub : 0), 0, subs.length - 1);
  return player;
}

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

// ── 修炼速度总倍率（灵根 × 天赋 × 称号 × 功法 × 契合 × 轮回 × 宗门 × 道友 × 混沌）──
export function cultivateSpeedMult(player) {
  let m = player.rootMult;
  for (const id of (player.talentIds || [])) m *= (TALENTS[id] && TALENTS[id].cultMult) || 1;
  for (const id of player.titles) m *= titleCultivateMult(id);
  for (const id of player.techniques) {
    const td = techniqueDef(id);
    m *= td.cultivate || 1;
    // 功法属性与灵根契合 → 额外加成（不同属性灵根，效果不完全一致）
    if (td.el) m *= rootAffinity(player.root, td.el);
  }
  if (player.reincarnationBonus) m *= player.reincarnationBonus; // 前世记忆（轮回重修）
  if (_SECT_BONUS_FN) m *= _SECT_BONUS_FN(player) || 1; // 宗门 + 宗门称号加成
  if (_COMPANION_BONUS_FN) m *= _COMPANION_BONUS_FN(player) || 1; // 道友（高好感）加成
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

// ── 突破成功率（基础 + 灵根 + 天赋 + 丹药 + 功法 + 契合 + 境界难度）──────────────
export function breakthroughChance(player, hasBreakPill, targetTier) {
  let base = 0.7;
  base += player.rootBonus; // 灵根加成
  for (const id of (player.talentIds || [])) base += (TALENTS[id] && TALENTS[id].breakBonus) || 0; // 天赋加成
  if (hasBreakPill) base += 0.2; // 服用突破丹
  for (const id of player.techniques) {
    const td = techniqueDef(id);
    base += td.breakBonus || 0;
    // 功法属性与灵根契合 → 额外突破成功率
    if (td.el && rootAffinity(player.root, td.el) > 1) base += ROOT_AFFINITY_BREAK_BONUS;
  }
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

// ── 活力（每日周期：消耗型行动力，次日恢复）──────────────────────────────────
export const MAX_VITALITY = 100;
export const VITALITY_COSTS = { explore: 10, cultivate: 4, craft: 6 };
// 活力上限：基础 + 天赋加成
export function vitalityMax(player) {
  let m = MAX_VITALITY;
  for (const id of (player && player.talentIds) || []) {
    const t = TALENTS[id];
    if (t && t.maxVitBonus) m += t.maxVitBonus;
  }
  return m;
}

// ── 气运 → 奇遇辅助：气运越高，保底阈值越低、稀有事件权重越高 ──────────────────
export function pityThresholdForQiyun(qiyun) {
  return Math.max(3, PITTY_THRESHOLD - Math.floor((qiyun || 50) / 20));
}
export function rareBoostForQiyun(qiyun) {
  return 1 + Math.min(0.15, (qiyun || 50) * 0.0015);
}

// ── 工具 ────────────────────────────────────────────────────────────────────
export function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
export function nowSec() { return Math.floor(Date.now() / 1000); }
// 本地日期键（YYYY-MM-DD）：保留用于「自然日」粒度的判定（如离线天数展示）。
export function dayKey(ts) {
  const d = new Date(ts != null ? ts : Date.now());
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
// 本地月份键（YYYY-MM）：游戏「周期」粒度。之前的每日周期已改为每月——
// 活力回满、宗门任务/俸禄刷新、道友组队次数、年龄增长，均以自然月为周期。
export function monthKey(ts) {
  const d = new Date(ts != null ? ts : Date.now());
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}
// 周期键：当前即「自然月」。集中于此，便于将来调整周期粒度。
export function cycleKey(ts) { return monthKey(ts); }
// 两个月份键之间跨越的自然月数（a 早于 b 时为正；同月为 0；非法/乱序兜底为 0）。
export function monthsBetween(a, b) {
  const pa = String(a || '').split('-').map((x) => parseInt(x, 10));
  const pb = String(b || '').split('-').map((x) => parseInt(x, 10));
  if (!Number.isFinite(pa[0]) || !Number.isFinite(pa[1]) || !Number.isFinite(pb[0]) || !Number.isFinite(pb[1])) return 0;
  return Math.max(0, (pb[0] - pa[0]) * 12 + (pb[1] - pa[1]));
}

// ── 年龄 / 寿元 / 轮回 ──────────────────────────────────────────────────────
// 创角起始年龄（岁）：凡人修仙多自幼年起，随机 8~16 岁。
export const START_AGE_MIN = 8;
export const START_AGE_MAX = 16;
// 每个自然月周期推进的「修仙月」数。取 25（≈ 2 岁 + 1 月/月）：
// 12 个月进位 1 岁，使「X岁X月」展示里的月份会逐月变化（而非永远卡在同一月），
// 整体寿元节奏与原先（2 岁/月）几乎一致。
export const MONTHS_PER_CYCLE = 25;
// 历史导出：每周期推进的「岁」数（≈ MONTHS_PER_CYCLE / 12），仅供旧引用 / 单测沿用。
export const YEARS_PER_CYCLE = 2;
// 轮回重修最多一次（大限将至时可携部分资质重来）。
export const MAX_REINCARNATIONS = 1;
// 轮回携带的「前世记忆」修炼加成（乘算，叠加在 cultivateSpeedMult 上）。
export const REINCARNATION_CULT_BONUS = 1.15;

// 某境界的寿元上限（岁）；飞升为 null → 无量寿（Infinity）。
export function realmLifespan(tier) {
  const r = REALMS[clamp(Math.floor(Number.isFinite(tier) ? tier : 0), 0, ASCEND_INDEX)];
  return r && r.lifespan != null ? r.lifespan : Infinity;
}
// 大限将至：未飞升且当前境界寿元耗尽（年龄 ≥ 寿元）。此时可轮回重修一次。
export function isDying(player) {
  if (!player || player.ascended) return false;
  return (player.age || 0) >= realmLifespan(player.tier);
}
// 可否轮回重修：大限将至且仍有轮回次数。
export function canReincarnate(player) {
  return !!(player && isDying(player) && (player.reincarnations || 0) < MAX_REINCARNATIONS);
}
// 年龄展示（简化）：只显示岁。轮回过的修士年龄前标注「（轮回）」。
export function ageLabel(player) {
  const prefix = player && player.reincarnations ? '（轮回）' : '';
  return `${prefix}${Math.floor((player && player.age) || 0)}岁`;
}
// 年龄展示（详细）：xx岁xx月。月份取自 player.ageMonth（0~11，随周期推进）。
export function ageDetailLabel(player) {
  const prefix = player && player.reincarnations ? '（轮回）' : '';
  const years = Math.floor((player && player.age) || 0);
  const raw = (player && player.ageMonth) || 0;
  const month = clamp(((raw % 12) + 12) % 12, 0, 11) + 1;
  return `${prefix}${years}岁${month}月`;
}
// 由月份键（YYYY-MM）取 0~11 的月序，用于初始化「年龄·月」
export function ageMonthFromKey(key) {
  const m = parseInt(String(key || '').slice(5, 7), 10);
  return Number.isFinite(m) ? clamp(m - 1, 0, 11) : 0;
}

// ============================================================================
// 以下为对 items / techniques 的轻量查表入口（避免循环依赖，data 模块再 import 本文件）。
// 通过懒查表函数，让 config 中的公式可在 items 数据就绪后使用。
// ============================================================================
let _ITEMS = null;
let _TECHNIQUES = null;
export function _registerItems(items) { _ITEMS = items; }
export function _registerTechniques(techs) { _TECHNIQUES = techs; }
// 宗门修炼加成懒注册：宗门自身加成 + 当前宗门称号加成。
// 由 core/sect.js 注入，避免此处直接 import 宗门模块造成 config↔sect 循环依赖
// （沿用 items/techniques 的懒注册模式）。未注册时默认 1（无加成）。
let _SECT_BONUS_FN = null;
export function _registerSectBonus(fn) { _SECT_BONUS_FN = fn; }
// 道友（NPC 高好感）修炼加成懒注册：由 core/npc.js 注入，避免 config↔npc 循环依赖。
// 未注册时默认 1（无加成）。
let _COMPANION_BONUS_FN = null;
export function _registerCompanionBonus(fn) { _COMPANION_BONUS_FN = fn; }
export function itemDef(id) { return (_ITEMS && _ITEMS[id]) || null; }
export function techniqueDef(id) { return (_TECHNIQUES && _TECHNIQUES[id]) || { cultivate: 1, breakBonus: 0 }; }
export function titleCultivateMult(id) {
  // 称号提供的修炼加成（多数为 1）
  const map = { title_qidao: 1.05, title_xianyuan: 1.08 };
  return map[id] || 1;
}
