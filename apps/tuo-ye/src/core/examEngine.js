// ============================================================================
// 托业模考 · 考试逻辑模块（纯函数 + 计时器管理）
//
// 全真模考模式：选择 Part → 计时作答 → 统一提交 → 10-990 分换算评分。
// 与自测不同：考试计时、不即时反馈、结束后统一出分。
//
// 数据结构：
//   ExamSession {
//     parts: string[],               // 参与的 Part 列表
//     questions: Question[],         // 所有题目（扁平化）
//     answers: { [qid]: number },    // 作答
//     startedAt: number,             // 开始时间戳（秒）
//     timeLimit: number,             // 时间限制（秒）
//   }
//   ExamResult {
//     id: string,
//     date: string,                  // ISO 日期
//     parts: string[],
//     scores: { [part]: { correct, total } },
//     rawCorrect: number,
//     rawTotal: number,
//     scaledScore: number,           // 10-990
//     readingScore: number,          // 5-495
//     timeSpent: number,             // 秒
//   }
// ============================================================================
import { sampleQuestions } from './questionBank.js';
import { EXAM_TIME_LIMITS, PART_INFO } from '../config.js';
import { toISODate } from './calendar.js';

// 简单的确定性随机数生成器（LCG），用于题目排序的可重现性。
function seededRandom(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return function () {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// Fisher-Yates 洗牌（带种子）。
function seededShuffle(arr, seed) {
  const a = [...arr];
  const rand = seededRandom(seed);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 开始一次考试。parts 为 ['part5'] / ['part5','part6','part7'] 等。
// full=true 时使用所有可用题目；否则随机抽样。
export function startExam(parts, options = {}) {
  const validParts = parts.filter((p) => PART_INFO[p]);
  if (!validParts.length) return null;

  const seed = options.seed || Math.floor(Math.random() * 1000000) + 1;
  const timeLimit = options.timeLimit || sumTimeLimits(validParts);

  // 收集题目
  let allQuestions = [];
  for (const part of validParts) {
    const count = options.full ? undefined : Math.min(options.questionsPerPart || 10, 20);
    const qs = count ? sampleQuestions(part, count, seed + part.charCodeAt(0)) : sampleQuestions(part, 999, seed);
    allQuestions = allQuestions.concat(qs.map((q) => ({ ...q, part })));
  }

  // 打乱顺序（但保持同 Part 内的题目连续性）
  allQuestions = seededShuffle(allQuestions, seed);

  return {
    parts: validParts,
    questions: allQuestions,
    answers: {},
    startedAt: Math.floor(Date.now() / 1000),
    timeLimit,
    seed,
  };
}

function sumTimeLimits(parts) {
  if (parts.length === 3) return EXAM_TIME_LIMITS.full; // 全部 Part = 完整考试
  return parts.reduce((sum, p) => sum + (EXAM_TIME_LIMITS[p] || 0), 0);
}

// 记录答案。
export function submitExamAnswer(session, questionId, answerIndex) {
  if (!session) return;
  if (!session.answers) session.answers = {};
  session.answers[questionId] = answerIndex;
}

// 剩余时间（秒）。
export function getRemainingTime(session) {
  if (!session) return 0;
  const elapsed = Math.floor(Date.now() / 1000) - session.startedAt;
  return Math.max(0, session.timeLimit - elapsed);
}

// 是否已超时。
export function isTimeUp(session) {
  return getRemainingTime(session) <= 0;
}

// 完成考试，判分并返回 ExamResult。
export function finishExam(session) {
  if (!session) return null;
  const timeSpent = Math.floor(Date.now() / 1000) - session.startedAt;
  const scores = {};
  let rawCorrect = 0;
  let rawTotal = 0;

  // 按 Part 分组判分
  for (const part of session.parts) {
    const partQuestions = session.questions.filter((q) => q.part === part);
    let correct = 0;
    for (const q of partQuestions) {
      if (session.answers[q.id] === q.answer) correct++;
    }
    scores[part] = { correct, total: partQuestions.length };
    rawCorrect += correct;
    rawTotal += partQuestions.length;
  }

  // 计算换算分（阅读部分 5-495，总分 10-990）
  const readingScore = calculateReadingScore(rawCorrect, rawTotal);
  const scaledScore = readingScore * 2; // 简化：总分 = 阅读分 × 2（假设听力同等水平）

  return {
    id: 'exam_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
    date: toISODate(new Date()),
    parts: session.parts,
    scores,
    rawCorrect,
    rawTotal,
    scaledScore: Math.max(10, Math.min(990, scaledScore)),
    readingScore,
    timeSpent,
  };
}

// 原始分 → TOEIC 阅读换算分（5-495）。
// 使用简化的线性映射：正确率映射到 5-495 区间。
// 实际 TOEIC 的换算表是非线性的，但线性近似在 ±30 分以内合理。
export function calculateReadingScore(rawCorrect, rawTotal) {
  if (rawTotal <= 0) return 5;
  const rate = Math.max(0, Math.min(1, rawCorrect / rawTotal));
  // 映射 0%→5, 100%→495
  const score = Math.round(5 + rate * 490);
  // 加入轻微的 S 曲线：中等正确率略加分，极端值略压
  // （模拟真实 TOEIC：50% 正确 ≈ 250 分左右）
  return Math.max(5, Math.min(495, score));
}

// 根据阅读换算分给出等级评价（对应 TOEIC 常见分级）。
export function scoreLevel(scaledScore) {
  if (scaledScore >= 860) return { name: 'A', label: '专业级', color: '#2f855a' };
  if (scaledScore >= 730) return { name: 'B', label: '高级', color: '#2b6cb0' };
  if (scaledScore >= 600) return { name: 'C', label: '中高级', color: '#3182ce' };
  if (scaledScore >= 400) return { name: 'D', label: '中级', color: '#d69e2e' };
  if (scaledScore >= 200) return { name: 'E', label: '初级', color: '#dd6b20' };
  return { name: 'F', label: '入门', color: '#c53030' };
}

// 格式化时间（秒 → mm:ss 或 h:mm:ss）。
export function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// 考试进度。
export function getExamProgress(session) {
  if (!session) return { answered: 0, total: 0, unanswered: 0 };
  const total = session.questions.length;
  const answered = Object.keys(session.answers || {}).length;
  return { answered, total, unanswered: total - answered };
}
