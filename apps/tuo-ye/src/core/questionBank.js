// ============================================================================
// 题库加载模块（Question Bank）：通过 Vite JSON import 直接载入题目数据，
// 提供纯函数式的查询、采样与统计接口。所有函数均为同步。
// ============================================================================
import questionData from '../../data/questions.json' with { type: 'json' };
import studyData from '../../data/study-materials.json' with { type: 'json' };

// ============================================================================
// 内部帮助函数：展平 Passage 为单题列表
// ============================================================================

/**
 * 把 Part 5 的 questions 数组原样返回（已是扁平结构）。
 * @param {Array} questions
 * @returns {Array}
 */
function _flatPart5(questions) {
  return Array.isArray(questions) ? questions : [];
}

/**
 * 把 Part 6 / Part 7 的 passages 展平为单个题目项，每项附加 passage 上下文。
 * @param {Array} passages
 * @param {string} partKey - 'part6' | 'part7'
 * @returns {Array}
 */
function _flattenPassages(passages, partKey) {
  if (!Array.isArray(passages)) return [];
  const out = [];
  for (const passage of passages) {
    if (!passage || typeof passage !== 'object') continue;
    if (!Array.isArray(passage.items)) continue;
    for (const item of passage.items) {
      if (!item || typeof item !== 'object') continue;
      out.push({
        ...item,
        part: partKey,
        passageTitle: passage.title || '',
        passageText: passage.text || '',
        passageId: passage.id || '',
      });
    }
  }
  return out;
}

// ============================================================================
// 私有：从 questionData 提取各部分的扁平题目列表（缓存复用）
// ============================================================================

function _getPart5Q() {
  return _flatPart5(questionData?.parts?.part5?.questions);
}

function _getPart6Items() {
  return _flattenPassages(questionData?.parts?.part6?.passages, 'part6');
}

function _getPart7Items() {
  return _flattenPassages(questionData?.parts?.part7?.passages, 'part7');
}

// ============================================================================
// 题库元信息
// ============================================================================

export function getBankInfo() {
  const p5 = _getPart5Q();
  const p6 = _getPart6Items();
  const p7 = _getPart7Items();
  return {
    version: questionData?.version || '',
    lastUpdated: questionData?.lastUpdated || '',
    totalQuestions: p5.length + p6.length + p7.length,
    partCounts: {
      part5: p5.length,
      part6: p6.length,
      part7: p7.length,
    },
  };
}

// ============================================================================
// 各部分快捷访问
// ============================================================================

/** Part 5 · Incomplete Sentences（语法填空）—— 原生扁平数组。 */
export function getPart5Questions() {
  return _getPart5Q();
}

/** Part 6 · Text Completion（完形填空）—— 展平为单题列表，每题附 passage 上下文。 */
export function getPart6Passages() {
  return _getPart6Items();
}

/** Part 7 · Reading Comprehension（阅读理解）—— 展平为单题列表，每题附 passage 上下文。 */
export function getPart7Passages() {
  return _getPart7Items();
}

// ============================================================================
// 统一按部分查询
// ============================================================================

/**
 * 按题型返回扁平题目列表。
 * @param {'part5'|'part6'|'part7'} part
 * @returns {Array}
 */
export function getQuestionsByPart(part) {
  switch (part) {
    case 'part5': return _getPart5Q();
    case 'part6': return _getPart6Items();
    case 'part7': return _getPart7Items();
    default: return [];
  }
}

// ============================================================================
// 全量题目（每项附加 part 字段）
// ============================================================================

/**
 * 返回所有题目作为扁平数组，每项额外带有 `part` 字段标识所属部分。
 * @returns {Array}
 */
export function getAllQuestions() {
  const out = [];
  for (const q of _getPart5Q()) {
    out.push({ ...q, part: 'part5' });
  }
  for (const item of _getPart6Items()) {
    out.push({ ...item, part: 'part6' });
  }
  for (const item of _getPart7Items()) {
    out.push({ ...item, part: 'part7' });
  }
  return out;
}

// ============================================================================
// 确定性随机采样（seeded Fisher-Yates + LCG）
// 用于模考抽题：相同的 seed 永远产生相同的题目序列，确保公平。
// ============================================================================

/**
 * 简单的 LCG 伪随机数生成器（32 位）。
 * 用于 seeded shuffle，不适用于加密场景。
 */
function _lcg(seed) {
  let s = typeof seed === 'number' ? Math.trunc(seed) : 0;
  return function next() {
    s = (s * 1664525 + 1013904223) | 0;
    return (s >>> 0) / 4294967296;
  };
}

/**
 * Fisher-Yates shuffle，使用 LCG 提供确定性随机。
 * @param {Array} arr - 需洗牌的数组（不会被修改）
 * @param {number} seed - 随机种子
 * @returns {Array} 新数组
 */
function _seededShuffle(arr, seed) {
  const result = [...arr];
  const rand = _lcg(seed);
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = result[i];
    result[i] = result[j];
    result[j] = tmp;
  }
  return result;
}

/**
 * 从指定部分采样 count 道题目（确定性随机，相同 seed → 相同结果）。
 * 若 count >= 题库总量，则返回全部题目（洗牌后）。
 *
 * @param {'part5'|'part6'|'part7'} part
 * @param {number} count - 期望题数
 * @param {number} [seed] - 随机种子（默认基于当前日期，确保每日模考不同）
 * @returns {Array}
 */
export function sampleQuestions(part, count, seed) {
  const all = getQuestionsByPart(part);
  if (!all.length) return [];
  const n = Number.isFinite(count) ? Math.max(1, Math.round(count)) : all.length;
  const s = Number.isFinite(seed) ? seed : Date.now();
  const shuffled = _seededShuffle(all, s);
  return shuffled.slice(0, Math.min(n, shuffled.length));
}

// ============================================================================
// 学习资料
// ============================================================================

/** 返回完整的学习资料数据。 */
export function getStudyMaterials() {
  return studyData;
}

/**
 * 按分类获取学习资料。
 * @param {'vocab'|'grammar'|'business'} category
 * @returns {Object|null}
 */
export function getStudyCategory(category) {
  if (!category || typeof category !== 'string') return null;
  return studyData?.categories?.[category] || null;
}
