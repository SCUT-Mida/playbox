// ============================================================================
// 科技效果 + 技能解析。
// 技能 effect DSL（逗号分隔）：lead:0.10 / war:0.10 / trick:0.20 / def:0.20 /
//   cap:0.10 / train:0.20 / p_grow:0.10 / c_recruit:0.20
// 科技等级按势力独立存储（state.techLevelsByFaction[fid][key]），互不共享、互不阻塞。
// ============================================================================

const KEYS = ['lead', 'war', 'trick', 'def', 'cap', 'train', 'p_grow', 'c_recruit'];

// 六大科技 key
export const TECH_KEYS = ['agri', 'commerce', 'forge', 'wall', 'trick', 'leadership'];

export function emptyBonus() {
  return { lead: 0, war: 0, trick: 0, def: 0, cap: 0, train: 0, p_grow: 0, c_recruit: 0 };
}

export function emptyTechLevels() {
  return TECH_KEYS.reduce((acc, k) => { acc[k] = 0; return acc; }, {});
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

// 确保某势力的科技等级表存在并返回之（按势力独立，写入 state）
export function ensureTechLevels(state, fid) {
  if (!state) return emptyTechLevels();
  if (!state.techLevelsByFaction) state.techLevelsByFaction = {};
  let tbl = state.techLevelsByFaction[fid];
  if (!tbl) { tbl = emptyTechLevels(); state.techLevelsByFaction[fid] = tbl; }
  return tbl;
}

// 科技等级乘数：1 + level × perLevel（按势力读取，不写入 state）
export function techMult(state, fid, techKey, perLevel) {
  return 1 + techLevel(state, fid, techKey) * perLevel;
}

export function techLevel(state, fid, techKey) {
  const tbl = state && state.techLevelsByFaction && state.techLevelsByFaction[fid];
  return (tbl && tbl[techKey]) || 0;
}

// 当前正在研究的科技（按势力独立槽）
export function activeResearch(state, fid) {
  return state && state.researchByFaction ? (state.researchByFaction[fid] || null) : null;
}
