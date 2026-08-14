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
// name：品阶名；color：主题色（设计稿 7.1）；rate：问道基础概率；star：升星上限（道果九重天）。
// 增量设计后所有稀有度统一可升至 9 重（设计稿增量 2.1），R/SR 满星后还可「化凡入圣」进化。
export const STAR_TIERS = 9;
export const RARITIES = [
  { id: 'R',   name: '逸品·青玉', short: 'R',   color: '#6A9EC7', rate: 0.70, maxStar: STAR_TIERS, baseCap: 30 },
  { id: 'SR',  name: '绝品·紫金', short: 'SR',  color: '#9B6BCC', rate: 0.25, maxStar: STAR_TIERS, baseCap: 40 },
  { id: 'SSR', name: '至品·彩凰', short: 'SSR', color: '#E8636B', rate: 0.05, maxStar: STAR_TIERS, baseCap: 50 },
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

// ── 升星·道果九重天（设计稿增量 2.1）──────────────────────────────────────────
// 所有稀有度统一 1~9 重；每重消耗「天道本源·碎片」+ 同名「灵契碎片」。
// 数值表（目标星级 → 消耗）严格对应设计稿增量 2.1：
//   ★1→2 需本源 2、★2→3 需 4、… ★8→9 需 30；同名碎片 0/0/1/2/3/4/6/8/10。
const STAR_TIANDAO_F = [0, 1, 2, 4, 6, 8, 10, 15, 20, 30]; // 索引 = 目标星级（1..9）
const STAR_FRAG       = [0, 0, 0, 1, 2, 3, 4, 6, 8, 10];
export function starTiandaoFCost(targetStar) { return STAR_TIANDAO_F[Math.max(0, Math.min(STAR_TIERS, targetStar))] || 0; }
export function starFragCost(targetStar) { return STAR_FRAG[Math.max(0, Math.min(STAR_TIERS, targetStar))] || 0; }
// 该星级解锁的特殊内容（设计稿增量 2.1「特殊解锁」列）
export const STAR_UNLOCKS = {
  3: '解锁被动技·壹',
  6: '解锁被动技·贰 / 觉醒技（SSR 专属）',
  7: '立绘流光特效',
  9: '化凡入圣·进化资格',
};
export function starUnlock(star) { return STAR_UNLOCKS[star] || null; }

// ── 化凡入圣·品质进化（设计稿增量 2.2）────────────────────────────────────────
// R→SR、SR→SSR：9 重满星且等级达上限后可进化，提升稀有度面板 / 等级上限 / 立绘边框。
// SSR 已是至品，不可再进化。
export const EVOLUTION = {
  R:  { to: 'SR',  tiandao: 50,  essence: 30, scroll: 0, label: '逸品 → 绝品（紫金边框）' },
  SR: { to: 'SSR', tiandao: 100, essence: 0,  scroll: 1, label: '绝品 → 至品（彩凰流光）' },
};
// 进化阶段（相对原稀有度的进化步数）→ 基础属性放大倍率，使面板贴近目标稀有度。
export const EVO_STAT_MULT = { 0: 1, 1: 1.35, 2: 1.80 };
export function evoTargetRarity(rarity) { return (EVOLUTION[rarity] && EVOLUTION[rarity].to) || null; }

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
// 三种加成：等级（每级 +5%）、突破（每次 +8%）、星级（道果九重天分档累计）。
export const LEVEL_MULT = 0.05;
export const BREAK_MULT = 0.08;
export const STAR_MULT = 0.12; // 旧版每星固定加成（保留作参考；道果九重天后改用分档累计）
// 道果九重天·每星分档边际加成（设计稿增量 2.1：8/8/10/10/12/12/12/15/15%）
const STAR_BONUS_STEP = [0, 0.08, 0.08, 0.10, 0.10, 0.12, 0.12, 0.12, 0.15, 0.15];
// 累计星级全属性加成（0..1）：star=0 返回 0，star=9 返回约 1.02。
export function starBonusPct(star) {
  let s = 0;
  const n = Math.max(0, Math.min(STAR_TIERS, star));
  for (let i = 1; i <= n; i++) s += STAR_BONUS_STEP[i] || 0;
  return s;
}
export function effectiveStat(base, level, br, star) {
  const m = (1 + LEVEL_MULT * Math.max(0, level - 1))
          * (1 + BREAK_MULT * Math.max(0, br))
          * (1 + starBonusPct(Math.max(0, star)));
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
export const CAVE_TICKET_PER_HOUR_MIN = 2; // 神行符/小时下限（设计稿增量 4.4：2~4 张/小时）
export const CAVE_TICKET_PER_HOUR_MAX = 4;

// ── 一键扫荡·云游挂机（设计稿增量 第四节）──────────────────────────────────────
export const STAMINA_MAX = 120;        // 灵气上限（设计稿 4.2）
export const STAMINA_REGEN_SEC = 300;  // 每 5 分钟恢复 1 点灵气
export const STAMINA_PER_SWEEP = 10;   // 每次扫荡消耗 10 点灵气
export const SWEEP_BATCH = [1, 5, 10]; // 批量扫荡档位（设计稿 4.3）
// 3 星通关判定（设计稿增量 4.1：胜利 + 我方无阵亡 + 剩余血量 > 70%）
export const SWEEP_3STAR_HP_RATIO = 0.70;
export const SWEEP_UNLOCK_STARS = 3;   // 累计获得 3 颗关卡星数即解锁扫荡（替代「玩家 20 级」软门槛）

// ── 知音·好感度（设计稿增量 1.2 知音页签）──────────────────────────────────────
export const AFFINITY_MAX = 100;
export const AFFINITY_GIFT_VALUE = 10;   // 每件「灵犀佩」+10 好感
export function affinityLevel(affinity) {
  // 知音境界：泛泛 / 相识 / 契友 / 莫逆 / 知己
  const a = Math.max(0, Math.min(AFFINITY_MAX, affinity));
  if (a >= 80) return { tier: 5, name: '知己' };
  if (a >= 60) return { tier: 4, name: '莫逆之交' };
  if (a >= 40) return { tier: 3, name: '契友' };
  if (a >= 20) return { tier: 2, name: '相识' };
  return { tier: 1, name: '泛泛之交' };
}
// 好感度带来的全属性加成（每 20 点 +2%，满好感 +10%）
export function affinityBonusPct(affinity) {
  return Math.floor(Math.max(0, Math.min(AFFINITY_MAX, affinity)) / 20) * 0.02;
}

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
  { id: 'tiandao_f',   name: '天道本源·碎片', emoji: '🌌', desc: '道果九重天升星消耗（设计稿增量 2.1）。' },
  { id: 'tiandao',     name: '天道本源',   emoji: '✨', desc: '化凡入圣·品质进化消耗（设计稿增量 2.2）。' },
  { id: 'wendao',      name: '问道令',     emoji: '🎏', desc: '问道（抽卡）消耗，1 令 = 1 抽。' },
  { id: 'sweep_ticket', name: '神行符',    emoji: '🏃', desc: '一键扫荡消耗；洞府挂机 / 日常产出（设计稿增量 4.x）。' },
  { id: 'essence_metal', name: '金·五行精华', emoji: '💎', desc: 'R→SR 化凡入圣进化所需（金系）。' },
  { id: 'essence_wood',  name: '木·五行精华', emoji: '💎', desc: 'R→SR 化凡入圣进化所需（木系）。' },
  { id: 'essence_water', name: '水·五行精华', emoji: '💎', desc: 'R→SR 化凡入圣进化所需（水系）。' },
  { id: 'essence_fire',  name: '火·五行精华', emoji: '💎', desc: 'R→SR 化凡入圣进化所需（火系）。' },
  { id: 'essence_earth', name: '土·五行精华', emoji: '💎', desc: 'R→SR 化凡入圣进化所需（土系）。' },
  { id: 'dao_scroll',  name: '天道卷轴',   emoji: '🔖', desc: 'SR→SSR 化凡入圣进化所需（主线卷拾获取）。' },
  { id: 'gift',        name: '灵犀佩',     emoji: '💝', desc: '赠予卡牌提升知音好感度（设计稿增量 1.2）。' },
];
export const RES_MAP = Object.fromEntries(RESOURCES.map((r) => [r.id, r]));
export function resName(id) { return (RES_MAP[id] && RES_MAP[id].name) || id; }
export function resEmoji(id) { return (RES_MAP[id] && RES_MAP[id].emoji) || ''; }

// 修为丹 → 经验
export const PILL_EXP = { exp_s: 50, exp_m: 200, exp_l: 1000 };
// 五行 → 突破石 id
export const BREAK_STONE = { metal: 'break_metal', wood: 'break_wood', water: 'break_water', fire: 'break_fire', earth: 'break_earth' };
// 五行 → 五行精华 id（化凡入圣用）
export const ESSENCE_STONE = { metal: 'essence_metal', wood: 'essence_wood', water: 'essence_water', fire: 'essence_fire', earth: 'essence_earth' };

// ── 五大职业剪影（设计稿增量 第三节）──────────────────────────────────────────
// 仅凭「姿态 + 武器 + 服饰轮廓」即可判断职业，缩略图也能一眼识别。
// key：拉丁标识（用于 CSS 选择器）；weapon：核心武器 emoji；sway：可飘动部件。
export const CLASSES = [
  { id: '剑修', key: 'sword',    name: '剑修', weapon: '⚔️', pose: '侧身执剑', garment: '窄袖劲装·披风', color: '#c8a951', sway: ['hair', 'ribbon'] },
  { id: '体修', key: 'body',     name: '体修', weapon: '🛡️', pose: '正面双臂微张', garment: '短打·护心镜', color: '#a17b4a', sway: ['arm_R'] },
  { id: '丹修', key: 'alchemy',  name: '丹修', weapon: '⚗️', pose: '单手托炉', garment: '宽袍大袖·飘带', color: '#5fa85f', sway: ['ribbon', 'arm_L'] },
  { id: '阵修', key: 'array',    name: '阵修', weapon: '🌀', pose: '双手结印', garment: '道冠·法衣', color: '#9B6BCC', sway: ['hair', 'ribbon'] },
  { id: '符修', key: 'talisman', name: '符修', weapon: '📜', pose: '持符点指', garment: '鹤氅·符袋', color: '#C23B22', sway: ['ribbon', 'arm_R'] },
];
const CLASS_MAP = Object.fromEntries(CLASSES.map((c) => [c.id, c]));
export function classDef(cls) { return CLASS_MAP[cls] || CLASSES[0]; }

// 颜色加深 / 变亮：amt 负数加深、正数变亮。卡面（portrait3D）与立绘（charArt）
// 共用同一实现与常量，避免同屏出现两档深 / 亮色（曾分别在两处各存一份）。
export function shade(hex, amt) {
  if (!hex || hex[0] !== '#') return hex || '#333';
  const n = hex.length === 4
    ? hex.slice(1).split('').map((c) => parseInt(c + c, 16))
    : [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
  const f = (v) => Math.max(0, Math.min(255, Math.round(v + 255 * amt)));
  return `rgb(${f(n[0])}, ${f(n[1])}, ${f(n[2])})`;
}

// 战场剪影用色（五行代表色），可被卡牌自定义色覆盖（设计稿增量 第六节；兼容蛇形/驼峰两种字段名）。
export function silhouetteColor(card) {
  if (card) {
    const custom = card.silhouette_color || card.silhouetteColor;
    if (custom) return custom;
  }
  const e = elDef(card && card.element);
  return e ? e.color : '#9a8a72';
}

// 点击浮现的专属诗词（设计稿增量 第四节·点击选中）：缺省回退到角色 quote。
export function poemOf(card) {
  if (!card) return '';
  return card.poem || card.quote || '';
}

// ── 稀有度人物美术规格（设计稿增量 第二节）──────────────────────────────────────
// dynamic：动态层级（0 静态呼吸 / 1 局部飘动 / 2 全动态粒子）；
// seal：左下角朱砂印章名；particles：是否启用 SSR 水墨粒子背景；breakFrame：破框特效。
export const RARITY_PORTRAIT = {
  R:   { dynamic: 0, seal: '逸品·青玉', inkline: true,  particles: false, breakFrame: false },
  SR:  { dynamic: 1, seal: '绝品·紫金', inkline: false, particles: false, breakFrame: false },
  SSR: { dynamic: 2, seal: '至品·彩凰', inkline: false, particles: true,  breakFrame: true },
};
export function rarityPortrait(rarity) { return RARITY_PORTRAIT[rarity] || RARITY_PORTRAIT.R; }

// PSD 分层命名（body/head/hair/arm_L/arm_R/weapon/accessory）按卡牌 id 约定导出，
// 供 CSS 分体动画逐层操控（设计稿增量 第五节）。无实图时由 portrait3D.js 程序化绘制。
export function portraitLayers(card) {
  const id = (card && card.id) || '';
  const base = `assets/portraits/${id}`;
  return {
    bg: `${base}_bg.webp`,
    body: `${base}_body.png`,
    head: `${base}_head.png`,
    hair: `${base}_hair.png`,
    arm_L: `${base}_armL.png`,
    arm_R: `${base}_armR.png`,
    weapon: `${base}_weapon.png`,
    accessory: `${base}_accessory.png`,
  };
}
// 角色立绘动画配置：飘动部件取自职业，眨眼间隔随稀有度递减（越稀有越灵动）。
export function portraitConfig(card, rarity) {
  const cls = classDef(card && card.cls);
  const rp = rarityPortrait(rarity || (card && card.rarity));
  return {
    layers: portraitLayers(card),
    animations: {
      sway_parts: cls.sway.slice(),
      blink_interval: rp.dynamic >= 2 ? 5000 : rp.dynamic >= 1 ? 6000 : 0,
      dynamic: rp.dynamic,
    },
  };
}

// ── 起始资源（新档）─────────────────────────────────────────────────────────────
export const START_RESOURCES = {
  lingshi: 3000,
  exp_s: 8, exp_m: 3, exp_l: 0,
  break_metal: 2, break_wood: 2, break_water: 2, break_fire: 2, break_earth: 2,
  gongfa: 5,
  tiandao_f: 0, tiandao: 0,
  wendao: 10,
  sweep_ticket: 5,
  essence_metal: 0, essence_wood: 0, essence_water: 0, essence_fire: 0, essence_earth: 0,
  dao_scroll: 0,
  gift: 3,
};
