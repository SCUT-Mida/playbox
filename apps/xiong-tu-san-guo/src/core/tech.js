// ============================================================================
// 科技效果 + 技能解析。
// 技能 effect DSL（逗号分隔）：lead:0.10 / war:0.10 / trick:0.20 / def:0.20 /
//   cap:0.10 / train:0.20 / p_grow:0.10 / c_recruit:0.20
// ============================================================================

const KEYS = ['lead', 'war', 'trick', 'def', 'cap', 'train', 'p_grow', 'c_recruit'];

export function emptyBonus() {
  return { lead: 0, war: 0, trick: 0, def: 0, cap: 0, train: 0, p_grow: 0, c_recruit: 0 };
}

// 解析技能 effect 字符串为加成对象
export function parseSkill(effect) {
  const b = emptyBonus();
  if (!effect || typeof effect !== 'string') return b;
  for (const part of effect.split(',')) {
    const [k, v] = part.split(':');
    const key = k && k.trim();
    if (KEYS.includes(key)) {
      const num = parseFloat(v);
      if (Number.isFinite(num)) b[key] += num;
    }
  }
  return b;
}

export function skillBonus(hero) {
  return parseSkill(hero && hero.skill ? hero.skill.effect : '');
}

// 科技等级乘数：1 + level × perLevel
export function techMult(state, techKey, perLevel) {
  const lv = (state && state.techLevels && state.techLevels[techKey]) || 0;
  return 1 + lv * perLevel;
}

export function techLevel(state, techKey) {
  return (state && state.techLevels && state.techLevels[techKey]) || 0;
}

// 当前正在研究的科技（按势力独立槽）
export function activeResearch(state, fid) {
  return state && state.researchByFaction ? (state.researchByFaction[fid] || null) : null;
}
