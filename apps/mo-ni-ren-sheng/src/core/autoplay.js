// ============================================================================
// 自动挂机（Auto Play）：每「周期」自动推进一周目（一个月），并按玩家设定的
// 策略自动处置随机抉择——无需手动连点，让岁月自行流淌（致敬《凡人修仙传》挂机修仙）。
//
// 设计要点：
//  - 策略（policy）：稳妥 / 均衡 / 进取 三档，决定如何在多个选项间抉择。
//  - 抉择择优采用「克隆采样」：复制角色对各选项各试算一次，比较结算后的属性收益，
//    再回到真实角色上执行被选中的选项。全程不开弹窗，不与玩家手动操作冲突
//    （UI 侧在任意弹窗打开 / 角色死亡时会暂停自动挂机）。
//
// 纯逻辑、无 DOM 依赖；所有随机均接受外部注入的 rng，便于种子化单测。
// ============================================================================
import { ATTRS } from '../config.js';
import { clonePlayer, applyChanges } from './player.js';

// 默认周期节奏（毫秒/轮）：每月推进一次，可由玩家在 400~3000ms 间调节。
export const DEFAULT_INTERVAL_MS = 1200;
export const MIN_INTERVAL_MS = 400;
export const MAX_INTERVAL_MS = 3000;

// 属性效用权重：用于把五大属性折算成单一「分数」便于比较。
// 健康 / 心情权重最高（活着且开心最要紧），财富次之，智力社交再次。
const SCORE_W = { health: 1.0, mood: 0.85, wealth: 0.6, intelligence: 0.5, social: 0.5 };

// 挂机策略定义。新增策略只需在此追加，并在 pickOption 中实现对应排序逻辑。
export const AUTO_POLICIES = [
  { id: 'cautious', emoji: '🛡️', label: '稳妥', desc: '优先规避健康损失，求稳为先' },
  { id: 'balanced', emoji: '⚖️', label: '均衡', desc: '综合权衡，倾向整体收益更高的选项' },
  { id: 'ambitious', emoji: '🔥', label: '进取', desc: '偏爱高风险高回报、单项暴涨的选项' },
];
export const POLICY_IDS = AUTO_POLICIES.map((p) => p.id);

// 一份全新的默认挂机配置（默认关闭——绝不擅自替玩家开启）。
export function defaultAutoPlay() {
  return { enabled: false, intervalMs: DEFAULT_INTERVAL_MS, policy: 'balanced' };
}

// 校验并补全挂机配置：缺字段 / 越界值 / 旧档迁移时兜底，返回规范化新对象。
export function normalizeAutoPlay(ap) {
  let interval = ap ? Number(ap.intervalMs) : NaN;
  if (!Number.isFinite(interval)) interval = DEFAULT_INTERVAL_MS;
  interval = Math.min(MAX_INTERVAL_MS, Math.max(MIN_INTERVAL_MS, Math.round(interval)));
  let policy = ap && POLICY_IDS.includes(ap.policy) ? ap.policy : 'balanced';
  // enabled 须为严格布尔 true 才算开启（防止 1 / "true" 等真值误开启挂机）。
  return { enabled: !!(ap && ap.enabled === true), intervalMs: interval, policy };
}

// 折算角色当前属性为单一分数。
function scoreOf(p) {
  const a = p.attrs;
  let s = 0;
  for (const k of ATTRS) s += (a[k] || 0) * (SCORE_W[k] || 0);
  return s;
}

// 在事件选项中按策略挑选一个（纯逻辑，不修改真实角色）。
// 返回被选中的 option 对象；事件无选项时返回 null。
export function pickOption(p, ev, policy, rng) {
  const r = rng || Math.random;
  const opts = (ev && ev.options) || [];
  if (!opts.length) return null;
  if (opts.length === 1) return opts[0];

  const baseScore = scoreOf(p);
  const baseHealth = p.attrs.health;
  // 对每个选项各克隆试算一次（消耗 rng），评估其「采样收益」。
  const evaluated = opts.map((opt) => {
    const c = clonePlayer(p);
    let res = {};
    try { res = opt.apply(c, r) || {}; } catch (_) { res = {}; }
    // 复刻 events.applyOption 的结算口径（职业 / 职级 / 标志 / 属性），保证采样贴近真实结算。
    if (res.career) c.career = res.career;
    if (Number.isFinite(res.careerLevel)) c.careerLevel = Math.max(1, Math.round(res.careerLevel));
    if (res.flags) c.flags = { ...(c.flags || {}), ...res.flags };
    if (res.changes) applyChanges(c, res.changes);
    const after = scoreOf(c);
    return {
      opt,
      delta: after - baseScore,
      healthDelta: c.attrs.health - baseHealth,
      maxGain: maxSingleGain(p.attrs, c.attrs),
    };
  });

  if (policy === 'cautious') {
    // 稳妥：先按「健康损失最小」排，再按整体收益排。
    evaluated.sort((x, y) => (x.healthDelta - y.healthDelta) || (y.delta - x.delta));
  } else if (policy === 'ambitious') {
    // 进取：先按「单项最大涨幅」排，再按整体收益排。
    evaluated.sort((x, y) => (y.maxGain - x.maxGain) || (y.delta - x.delta));
  } else {
    // 均衡：直接按整体收益排。
    evaluated.sort((x, y) => y.delta - x.delta);
  }
  return evaluated[0].opt;
}

// 计算结算后相比结算前，单项属性的最大涨幅（用于「进取」策略衡量爆发潜力）。
function maxSingleGain(before, after) {
  let g = 0;
  for (const k of ATTRS) {
    const d = (after[k] || 0) - (before[k] || 0);
    if (d > g) g = d;
  }
  return g;
}
