// ============================================================================
// 灵墟·问剑录 · 全局配置与数值公式（纯函数，无 DOM 依赖，便于单测）
// 涵盖：五行克制、伤害公式、稀有度、养成曲线（升级/突破/升星）、问道保底、洞府挂机。
// ============================================================================

// ── 工具 ────────────────────────────────────────────────────────────────────
export function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
export function nowSec() { return Math.floor(Date.now() / 1000); }
// 本地日期键（YYYY-MM-DD）：用于「自然日」粒度判定（每日免费单抽等）。
export function dayKey(ts) {
  const d = new Date(ts != null ? ts : Date.now());
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// ── 五行 ────────────────────────────────────────────────────────────────────
export const ELEMENTS = [
  { id: 'metal', name: '金', emoji: '⚔️', color: '#c8a951' },
  { id: 'wood',  name: '木', emoji: '🌿', color: '#5fa85f' },
  { id: 'water', name: '水', emoji: '💧', color: '#4a90c2' },
  { id: 'fire',  name: '火', emoji: '🔥', color: '#d4564f' },
  { id: 'earth', name: '土', emoji: '🪨', color: '#a17b4a' },
];
const EL_MAP = Object.fromEntries(ELEMENTS.map((e) => [e.id, e]));
export function elDef(id) { return EL_MAP[id] || null; }
export function elName(id) { const e = elDef(id); return e ? e.name : '无'; }
export function elEmoji(id) { const e = elDef(id); return e ? e.emoji : ''; }

// ── 五行克制（核心策略，见设计稿 4.3）─────────────────────────────────────────
// 采用标准五行相克循环：金克木、木克土、土克水、水克火、火克金。
// 克制 +30% 伤害（×1.30），被克制 -15% 伤害（×0.85），同属性 / 无克制 ×1.00。
// （设计稿表格中的 +30% 项与该循环一致；其余 -15%/0% 项依「克制 +30% / 被克 -15%」规则派生。）
const OVERCOMES = { metal: 'wood', wood: 'earth', earth: 'water', water: 'fire', fire: 'metal' };
export const COUNTER_GAIN = 1.30;
export const COUNTER_LOSS = 0.85;
export function counterMult(atkEl, defEl) {
  if (!atkEl || !defEl) return 1;
  // 「无」属性（虚空吞噬者等）不参与五行相克，永远中性
  if (atkEl === 'none' || defEl === 'none') return 1;
  if (atkEl === defEl) return 1;
  return OVERCOMES[atkEl] === defEl ? COUNTER_GAIN : COUNTER_LOSS;
}

// ── 稀有度 ──────────────────────────────────────────────────────────────────
// name：品阶名；color：主题色（设计稿 7.1）；rate：问道基础概率；star：升星上限。
export const RARITIES = [
  { id: 'R',   name: '逸品·青玉', short: 'R',   color: '#6A9EC7', rate: 0.70, maxStar: 5, baseCap: 30 },
  { id: 'SR',  name: '绝品·紫金', short: 'SR',  color: '#9B6BCC', rate: 0.25, maxStar: 5, baseCap: 40 },
  { id: 'SSR', name: '至品·彩凰', short: 'SSR', color: '#E8636B', rate: 0.05, maxStar: 6, baseCap: 50 },
];
const RARITY_MAP = Object.fromEntries(RARITIES.map((r) => [r.id, r]));
export function rarityDef(id) { return RARITY_MAP[id] || RARITIES[0]; }

// 主题色（设计稿 7.1 色彩系统）
export const THEME = {
  paper: '#F5F0E6',   // 背景 / 宣纸
  ink: '#2C1810',     // 主文字 / 墨色
  red: '#C23B22',     // 朱砂红（强调）
  gold: '#D4A04A',    // 描金（装饰 / 稀有）
};

// ── 问道（抽卡）配置（设计稿 5.3）──────────────────────────────────────────────
export const GACHA = {
  pitySSR: 90,        // 累计 90 抽必出 SSR
  pitySR: 30,         // 每 30 抽必出 SR（跨池）
  tenGuaranteeSR: true, // 十连保底 1 张 SR
  dupFrags: { R: 2, SR: 5, SSR: 10 }, // 重复抽到 → 灵契碎片
  dailyFree: true,    // 每日首次单抽免费
};

// ── 升星消耗（灵契碎片，索引 = 目标星级，1..maxStar）────────────────────────────
export function starCost(rarity, targetStar) {
  const r = rarityDef(rarity);
  const base = { R: 3, SR: 5, SSR: 8 }[rarity] || 3;
  // 每级递增，SSR 更贵
  const grow = rarity === 'SSR' ? 8 : rarity === 'SR' ? 5 : 3;
  return base + grow * (targetStar - 1);
}
// 升星额外消耗天道本源（高星才需，对应设计稿升星=道果重数）
export function starTiandao(rarity, targetStar) {
  if (targetStar <= 2) return 0;
  return rarity === 'SSR' ? (targetStar - 2) : 0;
}

// ── 卡牌经验曲线（升级所需经验）─────────────────────────────────────────────────
export function expForLevel(lv) {
  if (lv <= 1) return 60;
  return Math.round(80 * Math.pow(1.16, lv - 1));
}
// 升级伴随的灵石消耗（随等级递增）
export function lingshiForLevel(lv) {
  return Math.round(20 * lv);
}

// ── 衍生属性（由基础值 + 等级/突破/星级派生）───────────────────────────────────
// 三种加成：等级（每级 +5%）、突破（每次 +8%）、星级（每星 +12%）。
export const LEVEL_MULT = 0.05;
export const BREAK_MULT = 0.08;
export const STAR_MULT = 0.12;
export function effectiveStat(base, level, br, star) {
  const m = (1 + LEVEL_MULT * Math.max(0, level - 1))
          * (1 + BREAK_MULT * Math.max(0, br))
          * (1 + STAR_MULT * Math.max(0, star));
  return base * m;
}

// ── 突破（每 10 级一次，消耗对应五行突破石）─────────────────────────────────────
// br = 已完成突破次数；当前可突破的前提是 level 已达 10*(br+1)。
export function breakGateLevel(br) { return 10 * (br + 1); }
export function canBreak(instance, card) {
  const r = rarityDef(card.rarity);
  const cap = cardCap(r, instance.star);
  return instance.level >= breakGateLevel(instance.br) && instance.level < cap;
}

// 当前星级下的等级上限
export function cardCap(rarityOrDef, star) {
  const r = typeof rarityOrDef === 'string' ? rarityDef(rarityOrDef) : rarityOrDef;
  return r.baseCap + 10 * Math.max(0, star);
}

// ── 战力（用于关卡推荐战力对照 / 阵容总战力）────────────────────────────────────
export function cardPower(stats) {
  return Math.round(
    stats.atk * 1.0 +
    stats.def * 0.8 +
    stats.hp * 0.12 +
    stats.spd * 0.6
  );
}

// ── 伤害公式（设计稿 4.4，核心）────────────────────────────────────────────────
// 最终伤害 =（攻方攻击 × 技能倍率 − 守方防御 × 0.5）× 五行系数 × 暴击系数 × 随机波动 + 固定附加
// 保底：不低于 攻方攻击 × 5%。
export const CRIT_MULT = 1.5;
export function computeDamage(opts) {
  const { atk = 0, def = 0, mult = 1, fixed = 0, atkEl = null, defEl = null,
          crit = false, rng = Math.random } = opts;
  const counter = counterMult(atkEl, defEl);
  const variance = 0.95 + (rng ? rng() : Math.random()) * 0.10; // 0.95~1.05
  const critMult = crit ? CRIT_MULT : 1;
  const raw = (atk * mult - def * 0.5) * counter * critMult * variance + fixed;
  const floor = atk * 0.05;
  return Math.max(1, Math.round(Math.max(raw, floor)));
}

// ── 战场站位受击权重（设计稿 4.1）──────────────────────────────────────────────
// 1 号位（主坦）受击 +30%，2 号位（副坦/输出）+10%，其余正常。
export const POS_AGGRO = [1.30, 1.10, 1.00, 1.00, 1.00];

// ── 出手顺序（设计稿 4.2）：速度值 × 随机浮动（±5%）─────────────────────────────
export function initiative(spd, rng) {
  const r = (rng || Math.random)();
  const f = 0.95 + r * 0.10; // 0.95~1.05
  return spd * f;
}

// ── 洞府挂机（设计稿 6.1）──────────────────────────────────────────────────────
export const CAVE_CAP_HOURS = 12;
export const CAVE_STONE_PER_HOUR_DIV = 10; // 灵石/小时 = 挂入卡牌总等级 / 10
export const CAVE_PILL_SSR_PER_HOUR = 1;   // 修为丹·小/小时 = SSR 数量

// ── 资源定义（货币 / 材料，见设计稿 5.1）────────────────────────────────────────
export const RESOURCES = [
  { id: 'lingshi',     name: '灵石',     emoji: '🪙', desc: '修炼升级、升星通用消耗，主线与秘境产出。' },
  { id: 'exp_s',       name: '修为丹·小', emoji: '🧪', desc: '提供卡牌经验 50。' },
  { id: 'exp_m',       name: '修为丹·中', emoji: '⚗️', desc: '提供卡牌经验 200。' },
  { id: 'exp_l',       name: '修为丹·大', emoji: '🌟', desc: '提供卡牌经验 1000。' },
  { id: 'break_metal', name: '金·突破石', emoji: '⚔️', desc: '金系卡牌每 10 级突破所需。' },
  { id: 'break_wood',  name: '木·突破石', emoji: '🌿', desc: '木系卡牌每 10 级突破所需。' },
  { id: 'break_water', name: '水·突破石', emoji: '💧', desc: '水系卡牌每 10 级突破所需。' },
  { id: 'break_fire',  name: '火·突破石', emoji: '🔥', desc: '火系卡牌每 10 级突破所需。' },
  { id: 'break_earth', name: '土·突破石', emoji: '🪨', desc: '土系卡牌每 10 级突破所需。' },
  { id: 'gongfa',      name: '功法残页',   emoji: '📜', desc: '提升卡牌技能等级。' },
  { id: 'tiandao_f',   name: '天道本源·碎片', emoji: '🌌', desc: '高阶升星（道果重数）消耗。' },
  { id: 'tiandao',     name: '天道本源',   emoji: '✨', desc: 'SSR 顶级升星消耗。' },
  { id: 'wendao',      name: '问道令',     emoji: '🎏', desc: '问道（抽卡）消耗，1 令 = 1 抽。' },
];
export const RES_MAP = Object.fromEntries(RESOURCES.map((r) => [r.id, r]));
export function resName(id) { return (RES_MAP[id] && RES_MAP[id].name) || id; }
export function resEmoji(id) { return (RES_MAP[id] && RES_MAP[id].emoji) || ''; }

// 修为丹 → 经验
export const PILL_EXP = { exp_s: 50, exp_m: 200, exp_l: 1000 };
// 五行 → 突破石 id
export const BREAK_STONE = { metal: 'break_metal', wood: 'break_wood', water: 'break_water', fire: 'break_fire', earth: 'break_earth' };

// ── 起始资源（新档）─────────────────────────────────────────────────────────────
export const START_RESOURCES = {
  lingshi: 3000,
  exp_s: 8, exp_m: 3, exp_l: 0,
  break_metal: 2, break_wood: 2, break_water: 2, break_fire: 2, break_earth: 2,
  gongfa: 5,
  tiandao_f: 0, tiandao: 0,
  wendao: 10,
};
