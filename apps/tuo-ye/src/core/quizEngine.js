// ============================================================================
// 托业模考 · 自测逻辑模块（纯函数）
//
// 自测模式：选择 Part → 逐题作答 → 即时反馈 → 最终得分。
// 与考试模式不同：自测不计时、即时判对错、可看解析。
//
// 数据结构：
//   QuizSession {
//     part: 'part5' | 'part6' | 'part7',
//     questions: Question[],         // 选出的题目（已扁平化）
//     currentIndex: number,          // 当前题序
//     answers: { [qid]: number },    // 已作答 { 题目id: 选项index }
//     results: { [qid]: boolean },   // 判对错
//     startedAt: number,             // 开始时间戳（秒）
//   }
// ============================================================================
import { sampleQuestions, getQuestionsByPart } from './questionBank.js';

// 开始一次自测：从指定 Part 随机选 count 道题。
// seed 可选，用于可重现的题目序列。
export function startQuiz(part, count = 10, seed) {
  const questions = sampleQuestions(part, count, seed);
  if (!questions.length) return null;
  return {
    part,
    questions,
    currentIndex: 0,
    answers: {},
    results: {},
    startedAt: Math.floor(Date.now() / 1000),
  };
}

// 当前题目。
export function currentQuestion(session) {
  if (!session || !session.questions.length) return null;
  return session.questions[session.currentIndex] || null;
}

// 提交答案（即时判对错）。返回 { correct, isAnswered }。
export function submitAnswer(session, questionId, answerIndex) {
  if (!session) return { correct: false, isAnswered: false };
  const q = session.questions.find((x) => x.id === questionId);
  if (!q) return { correct: false, isAnswered: false };
  session.answers[questionId] = answerIndex;
  const correct = answerIndex === q.answer;
  session.results[questionId] = correct;
  return { correct, isAnswered: true };
}

// 是否已作答当前题。
export function isAnswered(session, questionId) {
  return !!(session && session.answers && questionId in session.answers);
}

// 下一题。返回是否还有下一题。
export function nextQuestion(session) {
  if (!session) return false;
  if (session.currentIndex < session.questions.length - 1) {
    session.currentIndex++;
    return true;
  }
  return false;
}

// 上一题。
export function prevQuestion(session) {
  if (!session) return false;
  if (session.currentIndex > 0) {
    session.currentIndex--;
    return true;
  }
  return false;
}

// 跳转到指定索引。
export function goToQuestion(session, index) {
  if (!session || index < 0 || index >= session.questions.length) return false;
  session.currentIndex = index;
  return true;
}

// 进度信息。
export function getProgress(session) {
  if (!session) return { current: 0, total: 0, answered: 0, correct: 0 };
  const total = session.questions.length;
  const answered = Object.keys(session.answers || {}).length;
  const correct = Object.values(session.results || {}).filter(Boolean).length;
  return {
    current: session.currentIndex + 1,
    total,
    answered,
    correct,
  };
}

// 完成自测，返回总结。
export function finishQuiz(session) {
  if (!session) return null;
  const total = session.questions.length;
  const answered = Object.keys(session.answers || {}).length;
  const correct = Object.values(session.results || {}).filter(Boolean).length;
  const timeSpent = Math.floor(Date.now() / 1000) - (session.startedAt || 0);
  return {
    part: session.part,
    total,
    answered,
    correct,
    accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
    timeSpent,
    questions: session.questions,
    answers: session.answers,
    results: session.results,
  };
}

// 错题列表（用于回顾）。
export function getWrongAnswers(session) {
  if (!session) return [];
  return session.questions.filter((q) => {
    const result = session.results[q.id];
    return result === false;
  });
}
