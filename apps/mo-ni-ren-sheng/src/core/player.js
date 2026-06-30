// ============================================================================
// 状态管理模块（State Manager）：角色状态、属性、时间推进、结局评价。
// 所有数值结算集中于此，UI 只负责调用与渲染，不内含业务逻辑。
// ============================================================================
import {
  ATTRS, ATTR_META, STAGES, WEEKS_PER_YEAR,
  MAX_AGE_MIN, MAX_AGE_MAX, ATTR_MIN, ATTR_MAX,
  clampAttr, ageYearsFromWeeks, stageForAge,
} from '../config.js';
import { randInt } from './rng.js';

// 创建一名新角色。
//   opts: { name, gender, weeks?, attrs?, maxAge? }
// 婴儿期起步（weeks=0），属性据性别/出身有轻微随机倾向，皆在 30~60 区间。
export function newPlayer(rng, opts = {}) {
  const r = rng || Math.random;
  const base = (lo, hi) => randInt(r, lo, hi);
  const gender = opts.gender === 'female' ? 'female' : 'male';
  const maxAge = Number.isFinite(opts.maxAge) ? opts.maxAge : randInt(r, MAX_AGE_MIN, MAX_AGE_MAX);
  // 出身倾向：男女略有差异，仅为初始趣味，幅度很小。
  const drift = gender === 'female' ? { social: +6, mood: +4 } : { health: +6, wealth: +4 };
  const attrs = {};
  for (const k of ATTRS) {
    attrs[k] = base(38, 58) + (drift[k] || 0);
  }
  // 允许外部覆盖（创角时若引入「出身选择」可用）。
  if (opts.attrs) for (const k of ATTRS) if (Number.isFinite(opts.attrs[k])) attrs[k] = opts.attrs[k];

  return {
    name: (opts.name || '').toString().slice(0, 8) || '无名氏',
    gender,
    weeks: Math.max(0, Number.isFinite(opts.weeks) ? opts.weeks : 0),
    turn: 0,
    maxAge,
    attrs: normalizeAttrs(attrs),
    career: null,        // 成年后的职业，影响事件
    log: [],             // 人生大事记（精简，仅里程碑 / 结算）
    flags: {},           // 杂项标志位（如是否成家）
    born: 0,             // 创建时间戳（存档展示用）
    lastSeen: 0,
  };
}

export function normalizeAttrs(attrs) {
  const out = {};
  for (const k of ATTRS) out[k] = clampAttr(attrs?.[k] ?? 50);
  return out;
}

export function ageYears(p) { return ageYearsFromWeeks(p.weeks); }
export function stageOf(p) { return stageForAge(ageYears(p)); }

// 应用一组属性增减（{health:+5, wealth:-10}），返回「实际变化量」（已钳制）。
// 顺便把变化的属性键收集返回，供 UI 闪烁动画使用。
export function applyChanges(p, changes = {}) {
  const applied = {};
  for (const k of ATTRS) {
    const delta = Number(changes[k]) || 0;
    if (!delta) continue;
    const before = p.attrs[k];
    const after = clampAttr(before + delta);
    const real = after - before;
    if (real !== 0) {
      p.attrs[k] = after;
      applied[k] = real;
    }
  }
  return applied;
}

// 是否已到生命终点：健康归零，或年龄达大限。
export function isDead(p) {
  return p.attrs.health <= ATTR_MIN || ageYears(p) >= p.maxAge;
}

// 「下一回合」核心结算：推进时间、施加被动漂移、检测阶段跨越，返回回合摘要。
//   返回 { stageChanged, fromStage, toStage, drift（漂移实际变化）, milestone }
// 注意：本函数只推进时间与被动漂移，不结算随机事件（事件由 events 模块单独抽取并结算）。
export function stepTime(p, rng) {
  const r = rng || Math.random;
  const before = stageOf(p);
  const beforeAge = ageYears(p);

  // 推进周数（按当前阶段步长）。若跨越阶段，以跨越前阶段的步长推进，下一回合再用新步长。
  p.weeks += before.weeksPerTurn;
  p.turn += 1;

  const after = stageOf(p);
  const stageChanged = after.key !== before.key;

  // 被动漂移：让世界在抉择之外也「活着」，体现属性间的动态关联与制约。
  const drift = passiveDrift(p, r, before, after);

  // 阶段跨越：写入里程碑式人生大事记。
  if (stageChanged) {
    p.log.push({ turn: p.turn, text: milestoneText(before, after), type: 'milestone' });
  }

  return {
    stageChanged,
    fromStage: before,
    toStage: after,
    drift,
    beforeAge,
  };
}

// 被动漂移：各属性随时间自然变化，彼此联动（例：心情过低拖累健康；老年健康下滑）。
// 返回实际发生的变化（已钳制），供 UI 闪烁。
function passiveDrift(p, r, fromStage, toStage) {
  const changes = {};
  const a = p.attrs;
  const stage = toStage.key;
  const age = ageYears(p);

  // 心情向中性基线缓慢回归（喜怒哀乐终归平淡）。
  const moodBase = 55;
  if (a.mood !== moodBase) changes.mood = Math.sign(moodBase - a.mood) * Math.min(3, Math.abs(moodBase - a.mood));

  // 社交向中性基线缓慢回归。
  const socialBase = 50;
  if (a.social !== socialBase) changes.social = Math.sign(socialBase - a.social) * Math.min(2, Math.abs(socialBase - a.social));

  if (stage === 'infant') {
    // 婴幼儿健康成长、心情上扬。
    changes.health = 1;
    changes.mood = (changes.mood || 0) + 1;
  } else if (stage === 'child') {
    // 求学阶段智力稳步提升。
    changes.intelligence = 1;
  } else if (stage === 'adult') {
    // 成年：少量被动收入；心情或健康过低会反噬（过度劳累的隐喻）。
    changes.wealth = 1;
    if (a.mood < 25) changes.health = -1;   // 郁郁寡欢伤身
    if (a.health < 25) changes.mood = (changes.mood || 0) - 1;
  } else if (stage === 'elder') {
    // 老年：健康不可逆地缓慢衰退，财富缓慢消耗。
    const frail = age > 80 ? 2 : 1;
    changes.health = -frail;
    changes.wealth = -1;
  }

  return applyChanges(p, changes);
}

function milestoneText(from, to) {
  // 按进入的新阶段（to.key）描述这一人生节点。
  const map = {
    child: '背上书包踏入校园，学龄时光开始了。',
    adult: '告别校园，步入社会，开启独立人生。',
    elder: '告别职场，鬓角染霜，步入晚年。',
  };
  return map[to.key] || '人生翻开了新的一页。';
}

// —— 结局评价：据最终属性与里程碑生成评价标签与人生总结 ——
export function evaluateLife(p) {
  const a = p.attrs;
  const age = Math.floor(ageYears(p));
  const diedOfAge = age >= p.maxAge;
  const cause = diedOfAge ? `${age} 岁寿终正寝` : `${age} 岁因健康枯竭早逝`;

  // 单项评价标签（取最高契合档）。
  const tags = [];
  tags.push(wealthTag(a.wealth));
  tags.push(intelligenceTag(a.intelligence));
  tags.push(moodTag(a.mood));
  tags.push(socialTag(a.social));
  if (age >= 85) tags.push('⏳ 长命百岁');
  else if (age < 45) tags.push('🕯️ 英年早逝');

  // 综合评分（年龄 + 五项加权），据此给出总评。
  const score = Math.round(
    age * 0.6 +
    a.health * 0.5 + a.intelligence * 0.7 + a.wealth * 0.7 +
    a.mood * 0.8 + a.social * 0.6,
  );
  const grade = overallGrade(score);

  return {
    name: p.name,
    age,
    cause,
    tags: dedupe(tags),
    score,
    grade,
    summary: summaryText(p, a, age, diedOfAge),
    attrs: { ...a },
  };
}

function wealthTag(v) {
  if (v >= 85) return '💰 富甲一方';
  if (v >= 60) return '🏦 小康之家';
  if (v >= 30) return '💸 勉强度日';
  return '🪙 家徒四壁';
}
function intelligenceTag(v) {
  if (v >= 85) return '🎓 学富五车';
  if (v >= 60) return '📚 颇有见地';
  if (v >= 30) return '📖 才疏学浅';
  return '🧩 平庸之辈';
}
function moodTag(v) {
  if (v >= 80) return '🌈 幸福美满';
  if (v >= 55) return '🙂 平和知足';
  if (v >= 30) return '😞 时有烦忧';
  return '🌧️ 郁郁寡欢';
}
function socialTag(v) {
  if (v >= 80) return '🥂 高朋满座';
  if (v >= 55) return '🤝 三两知己';
  if (v >= 30) return '👤 乏人问津';
  return '🪧 孤家寡人';
}

function overallGrade(score) {
  if (score >= 230) return { label: '传奇人生', emoji: '🌟', tone: 'epic' };
  if (score >= 190) return { label: '精彩一生', emoji: '✨', tone: 'good' };
  if (score >= 150) return { label: '平凡安稳', emoji: '🌼', tone: 'normal' };
  if (score >= 110) return { label: '跌宕起伏', emoji: '🌊', tone: 'normal' };
  return { label: '黯然收场', emoji: '🍂', tone: 'bad' };
}

function summaryText(p, a, age, diedOfAge) {
  const parts = [];
  parts.push(`${p.name} 活到了 ${age} 岁。`);
  if (a.wealth >= 80 && a.mood >= 70) parts.push('一生富足且乐天知命，堪为旁人艳羡。');
  else if (a.wealth >= 80) parts.push('虽积攒下可观的财富，却也在奔波中错过了许多风景。');
  else if (a.mood >= 80) parts.push('虽谈不上大富大贵，却始终心怀热忱，活得尽兴。');
  else if (a.social >= 80) parts.push('广结善缘，朋友遍天下，回首皆是温情。');
  else if (a.intelligence >= 80) parts.push('以学识与智慧立身，在某一领域留下了自己的印记。');
  else if (!diedOfAge) parts.push('健康早早亮起红灯，未及尽享天年便匆匆谢幕。');
  else parts.push('一生波澜不惊，如寻常人家般走完了属于自己的路。');
  return parts.join('');
}

function dedupe(arr) {
  return [...new Set(arr)];
}

// 属性可读文本（档案 / 结算用）。
export function attrLine(p, key) {
  const meta = ATTR_META[key];
  return `${meta.emoji} ${meta.name} ${p.attrs[key]}`;
}

export { ATTRS, ATTR_META, STAGES, WEEKS_PER_YEAR, ATTR_MIN, ATTR_MAX };
