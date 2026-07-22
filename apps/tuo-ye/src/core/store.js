// ============================================================================
// 存档管理模块（Store）：单档案 localStorage 持久化。
//
// TOEIC 为单昵称、单任务模式（区别于 da-ka 的多昵称多任务），
// 所有数据（profile / checkin / examResults / quizStats）集中存放于
// STORE_KEY 一个 JSON 对象。通过 storage 访问器隔离 localStorage，
// 便于 Node 单测注入。
// ============================================================================
import { STORE_KEY, ACTIVE_KEY } from '../config.js';
import { parseISO } from './calendar.js';

let storage = null;
try {
  if (typeof localStorage !== 'undefined') storage = localStorage;
} catch (_) { /* 某些环境访问 localStorage 会抛错 */ }

// 测试 / 注入用
export function _setStorage(s) { storage = s; }

// ============================================================================
// 私有：迁移 / 补全各字段的合法结构
// ============================================================================

/** 钳制到合法昵称长度区间（与 config.clampLen 逻辑一致，避免循环依赖） */
function _clampNickname(s) {
  if (typeof s !== 'string' || !s.trim()) return null;
  const trimmed = s.trim();
  if (trimmed.length < 1) return null;
  if (trimmed.length > 12) return trimmed.slice(0, 12);
  return trimmed;
}

/** 规范化 profile 字段 */
function _migrateProfile(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const nickname = _clampNickname(raw.nickname);
  if (!nickname) return null;
  return {
    nickname,
    createdAt: Number.isFinite(raw.createdAt) ? raw.createdAt : 0,
    lastSeen: Number.isFinite(raw.lastSeen) ? raw.lastSeen : 0,
  };
}

/** 规范化 checkin 字段 */
function _migrateCheckin(raw) {
  const out = { dates: [], totalMinutes: 0 };
  if (!raw || typeof raw !== 'object') return out;
  const seen = new Set();
  if (Array.isArray(raw.dates)) {
    for (const s of raw.dates) {
      if (typeof s === 'string' && !seen.has(s) && parseISO(s)) {
        seen.add(s);
        out.dates.push(s);
      }
    }
  }
  out.dates.sort();
  out.totalMinutes = Number.isFinite(raw.totalMinutes) ? Math.max(0, Math.round(raw.totalMinutes)) : 0;
  return out;
}

/** 规范化 examResults 字段 */
function _migrateExamResults(raw) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  for (const r of raw) {
    if (r && typeof r === 'object') {
      // 基本结构校验：至少要有 id / date / part 等关键字段时保留
      out.push({
        id: typeof r.id === 'string' ? r.id : '',
        date: typeof r.date === 'string' ? r.date : '',
        part: typeof r.part === 'string' ? r.part : '',
        score: Number.isFinite(r.score) ? r.score : 0,
        total: Number.isFinite(r.total) ? r.total : 0,
        correct: Number.isFinite(r.correct) ? r.correct : 0,
        timeUsed: Number.isFinite(r.timeUsed) ? r.timeUsed : 0,
        answers: Array.isArray(r.answers) ? r.answers : [],
      });
    }
  }
  return out;
}

/** 规范化 quizStats 字段 */
function _migrateQuizStats(raw) {
  const out = { totalAnswered: 0, totalCorrect: 0, byPart: {} };
  if (!raw || typeof raw !== 'object') return out;
  out.totalAnswered = Number.isFinite(raw.totalAnswered) ? Math.max(0, Math.round(raw.totalAnswered)) : 0;
  out.totalCorrect = Number.isFinite(raw.totalCorrect) ? Math.max(0, Math.round(raw.totalCorrect)) : 0;
  if (raw.byPart && typeof raw.byPart === 'object') {
    for (const partKey of Object.keys(raw.byPart)) {
      const v = raw.byPart[partKey];
      if (v && typeof v === 'object') {
        out.byPart[partKey] = {
          answered: Number.isFinite(v.answered) ? Math.max(0, Math.round(v.answered)) : 0,
          correct: Number.isFinite(v.correct) ? Math.max(0, Math.round(v.correct)) : 0,
        };
      }
    }
  }
  return out;
}

/** 完整数据迁移入口 */
function _migrate(raw) {
  if (!raw || typeof raw !== 'object') return {};
  return {
    profile: _migrateProfile(raw.profile),
    checkin: _migrateCheckin(raw.checkin),
    examResults: _migrateExamResults(raw.examResults),
    quizStats: _migrateQuizStats(raw.quizStats),
  };
}

// ============================================================================
// 核心读写
// ============================================================================

// 读取全部数据（已规范化）。存储缺失或损坏时返回空对象，绝不抛错。
export function loadData() {
  try {
    if (!storage) return {};
    const raw = storage.getItem(STORE_KEY);
    if (!raw) return {};
    const obj = JSON.parse(raw);
    if (!obj || typeof obj !== 'object') return {};
    return _migrate(obj);
  } catch (_) { return {}; }
}

// 落盘全部数据。
export function saveData(data) {
  try {
    if (!storage) return false;
    storage.setItem(STORE_KEY, JSON.stringify(data || {}));
    return true;
  } catch (_) { return false; }
}

// ============================================================================
// Profile
// ============================================================================

export function getProfile() {
  const data = loadData();
  return data.profile || null;
}

export function saveProfile(profile) {
  const data = loadData();
  data.profile = _migrateProfile(profile);
  return saveData(data);
}

// ============================================================================
// Checkin
// ============================================================================

export function getCheckin() {
  const data = loadData();
  return data.checkin || { dates: [], totalMinutes: 0 };
}

export function saveCheckin(checkinData) {
  const data = loadData();
  data.checkin = _migrateCheckin(checkinData);
  return saveData(data);
}

// ============================================================================
// Exam Results
// ============================================================================

export function getExamResults() {
  const data = loadData();
  return data.examResults || [];
}

/** 新增一条模考结果（prepend，最多保留 50 条）。 */
export function addExamResult(result) {
  const data = loadData();
  const list = data.examResults || [];
  list.unshift(result);
  data.examResults = list.slice(0, 50);
  return saveData(data);
}

// ============================================================================
// Quiz Stats
// ============================================================================

export function getQuizStats() {
  const data = loadData();
  return data.quizStats || { totalAnswered: 0, totalCorrect: 0, byPart: {} };
}

export function saveQuizStats(stats) {
  const data = loadData();
  data.quizStats = _migrateQuizStats(stats);
  return saveData(data);
}

// ============================================================================
// 全局操作
// ============================================================================

/** 清除所有 TOEIC 数据（测试 / 重置用）。 */
export function clearAll() {
  try {
    if (!storage) return false;
    storage.removeItem(STORE_KEY);
    storage.removeItem(ACTIVE_KEY);
    return true;
  } catch (_) { return false; }
}

// ============================================================================
// 激活昵称（ACTIVE_KEY）
// 独立于主数据存放，用于首启直达上次游玩的档案。
// ============================================================================

export function getActiveKey() {
  try {
    if (!storage) return null;
    const k = storage.getItem(ACTIVE_KEY);
    return k || null;
  } catch (_) { return null; }
}

export function setActiveKey(key) {
  try {
    if (!storage) return false;
    if (key == null) storage.removeItem(ACTIVE_KEY);
    else storage.setItem(ACTIVE_KEY, key);
    return true;
  } catch (_) { return false; }
}
