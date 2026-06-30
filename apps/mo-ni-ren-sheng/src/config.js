// ============================================================================
// 模拟人生 · 配置层（纯常量与纯函数，无副作用，便于单测）
// 定义生命周期阶段、五大属性、年龄换算与各类阈值。
// ============================================================================
export const WEEKS_PER_YEAR = 52;

// 属性取值范围 0-100；健康归零即生命终结。
export const ATTR_MIN = 0;
export const ATTR_MAX = 100;

// 出生时随机的大限（最大寿命，年）。低于此年龄且健康>0 仍可继续。
export const MAX_AGE_MIN = 70;
export const MAX_AGE_MAX = 100;

// 五大核心基础属性：健康 / 智力 / 财富 / 心情 / 社交。
// 顺序即状态栏与档案中的展示顺序。color 用于进度条，与 style.css 中的 CSS 变量呼应。
export const ATTRS = ['health', 'intelligence', 'wealth', 'mood', 'social'];

export const ATTR_META = {
  health: { key: 'health', name: '健康', emoji: '❤️', color: '#e06b6b', desc: '身体状态，归零即生命终结。' },
  intelligence: { key: 'intelligence', name: '智力', emoji: '🧠', color: '#4a90d9', desc: '学识与才智，影响学业与事业机缘。' },
  wealth: { key: 'wealth', name: '财富', emoji: '💰', color: '#d4a84b', desc: '家产与积蓄，影响生活品质。' },
  mood: { key: 'mood', name: '心情', emoji: '😊', color: '#b07cf0', desc: '幸福与满足感，过低会拖累健康。' },
  social: { key: 'social', name: '社交', emoji: '🤝', color: '#5fd0a0', desc: '人际与声望，影响事件走向。' },
};

// 生命周期四阶段：婴儿期 / 学龄期 / 成年期 / 老年期。
// weeksPerTurn 决定「下一回合」推进的周数——年龄越小步长越短（成长细节更细腻），
// 成年期以年为单位快速推进，使完整一生约 130~160 个回合，节奏舒适。
export const STAGES = [
  { key: 'infant', name: '婴儿期', emoji: '👶', minAge: 0, maxAge: 6, weeksPerTurn: 13, desc: '嗷嗷待哺，世界充满新奇。' },
  { key: 'child', name: '学龄期', emoji: '🧒', minAge: 6, maxAge: 18, weeksPerTurn: 26, desc: '入学读书，性格与天赋初现。' },
  { key: 'adult', name: '成年期', emoji: '🧑', minAge: 18, maxAge: 65, weeksPerTurn: 52, desc: '工作成家，人生的主战场。' },
  { key: 'elder', name: '老年期', emoji: '🧓', minAge: 65, maxAge: Infinity, weeksPerTurn: 26, desc: '颐养天年，回首这一生的得失。' },
];

export const STAGE_BY_KEY = Object.fromEntries(STAGES.map((s) => [s.key, s]));

// 每回合触发随机事件的概率（依阶段微调，使各阶段都有抉择）。
export const EVENT_CHANCE = {
  infant: 0.45,
  child: 0.6,
  adult: 0.7,
  elder: 0.55,
};

// 钳制到合法属性区间。
export function clampAttr(v) {
  if (!Number.isFinite(v)) return 0;
  return Math.max(ATTR_MIN, Math.min(ATTR_MAX, Math.round(v)));
}

// 周数 → 周岁（浮点）。
export function ageYearsFromWeeks(weeks) {
  return (weeks || 0) / WEEKS_PER_YEAR;
}

// 由年龄（周岁）定位所处生命阶段。
export function stageForAge(ageYears) {
  for (let i = 0; i < STAGES.length; i++) {
    const s = STAGES[i];
    const isLast = i === STAGES.length - 1;
    if (isLast ? ageYears >= s.minAge : ageYears < s.maxAge) return s;
  }
  return STAGES[STAGES.length - 1];
}

// 展示用年龄文本：<1 岁显「X 个月」，否则显「X 岁」。
export function ageLabel(weeks) {
  const years = ageYearsFromWeeks(weeks);
  if (years < 1) {
    const months = Math.max(0, Math.round(years * 12));
    return `${months} 个月`;
  }
  return `${Math.floor(years)} 岁`;
}
