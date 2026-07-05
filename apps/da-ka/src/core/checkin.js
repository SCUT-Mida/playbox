// ============================================================================
// 打卡逻辑模块（纯函数）：任务结构维护、打卡切换、连击统计、爱心里程碑。
//
// 两层数据模型：
//   1) 任务（Task）—— 打卡记录的真正归属者，结构同早期的「档案」：
//        {
//          name: string,        // 任务展示名（如「跑步」），保留原始大小写
//          key: string,         // 规范化 key（小写去空格），任务在档案内的主键
//          checkins: string[],  // 已打卡日期 'YYYY-MM-DD'（升序、唯一）
//          maxHearts: number,   // 历史最高爱心数（高水位），防重复庆祝
//          createdAt: number,   // 创建时间（秒）
//        }
//      所有打卡数学（是否打卡 / 累计 / 连击 / 爱心 / 里程碑）都作用在任务上。
//
//   2) 档案（Profile）—— 一个昵称容器，挂载 n 个任务：
//        {
//          nickname: string,    // 展示用昵称（保留原始大小写）
//          key: string,         // 规范化昵称 key，存档主键
//          tasks: { [taskKey]: Task },
//          activeTaskKey: string, // 当前展示的任务
//          createdAt: number,
//          lastSeen: number,
//        }
// ============================================================================
import { HEARTS_STEP, DEFAULT_TASK_NAME, NICKNAME_MAX_LEN, TASK_NAME_MAX_LEN } from '../config.js';
import { toISODate, parseISO, diffDays, prevDay } from './calendar.js';

// 工具：返回「今天」的秒级时间戳；脚本环境禁止 argless new Date() 时回退为 0。
export function nowSec() {
  try { return Math.floor(Date.now() / 1000); } catch (_) { return 0; }
}

// ===================== 任务（打卡记录单元）=====================

// 新建任务。checkins 默认空（是否首启即打卡交由 UI 决定）。
export function newTask(name, key) {
  const ts = nowSec();
  return {
    name: name || DEFAULT_TASK_NAME,
    key: key || normalizeKey(name || DEFAULT_TASK_NAME),
    checkins: [],
    maxHearts: 0,
    createdAt: ts,
  };
}

// 检查某日期是否已打卡。
export function isChecked(task, iso) {
  return !!task && Array.isArray(task.checkins) && task.checkins.includes(iso);
}

// 是否已打卡「今天」。
export function isCheckedToday(task, today) {
  if (!task) return false;
  const t = today instanceof Date ? today : new Date();
  return isChecked(task, toISODate(t));
}

// 累计打卡天数。
export function totalDays(task) {
  return task && Array.isArray(task.checkins) ? task.checkins.length : 0;
}

// 已解锁爱心数（每 HEARTS_STEP 天一颗）。
export function heartsEarned(task) {
  return Math.floor(totalDays(task) / HEARTS_STEP);
}

// 距下一颗爱心还差几天（1..HEARTS_STEP）。
// 恰好整除（如第 20 天）时返回 HEARTS_STEP——即下一颗还要再打 10 天。
export function daysToNextHeart(task) {
  const rem = totalDays(task) % HEARTS_STEP;
  return rem === 0 ? HEARTS_STEP : HEARTS_STEP - rem;
}

// 当前这颗爱心的填充进度（0..1，用于进度条）。
export function heartProgress(task) {
  const rem = totalDays(task) % HEARTS_STEP;
  return rem / HEARTS_STEP;
}

// 切换某日的打卡状态（作用于任务）。
// 仅接受合法的过去或今天日期；未来日直接拒绝（返回 unchanged）。
// 返回 { task, checked, milestone }：
//   checked   —— 切换后该日是否处于打卡态
//   milestone —— 本次切换是否让爱心数突破历史最高（触发庆祝，不重复庆祝已解锁爱心）
export function toggleCheckin(task, iso, today) {
  if (!task) return { task, checked: false, milestone: false };
  const dt = parseISO(iso);
  if (!dt) return { task, checked: false, milestone: false };
  // 拒绝未来日打卡：diffDays(today, dt) > 0 表示该日在今天之后。
  const t = today instanceof Date ? today : new Date();
  if (diffDays(t, dt) > 0) {
    return { task, checked: isChecked(task, iso), milestone: false };
  }

  const set = new Set(task.checkins || []);
  let milestone = false;
  // 历史最高爱心数（高水位）：仅当本次打卡让爱心数突破历史最高才算里程碑，
  // 避免「打卡到 10 → 取消一天 → 补打另一天到 10」对同一颗已解锁爱心重复庆祝。
  let maxHearts = Number.isFinite(task.maxHearts) ? task.maxHearts : 0;
  if (set.has(iso)) {
    set.delete(iso);
  } else {
    set.add(iso);
    const newHearts = Math.floor(set.size / HEARTS_STEP);
    milestone = newHearts > maxHearts; // 突破历史最高才触发庆祝
    if (milestone) maxHearts = newHearts;
  }
  // 升序输出，保证持久化与展示稳定。
  const checkins = [...set].sort();
  const next = { ...task, checkins, maxHearts };
  return { task: next, checked: set.has(iso), milestone };
}

// —— 连击（streak）统计 ——
// 把 ISO 日期串去重排序为 Date 数组（非法串忽略）。
function sortedDates(task) {
  if (!task || !Array.isArray(task.checkins)) return [];
  const set = new Set(task.checkins);
  return [...set]
    .map(parseISO)
    .filter((d) => d instanceof Date)
    .sort((a, b) => a.getTime() - b.getTime());
}

// 当前连击：从今天起向前数连续打卡的天数。
// 业界惯例：今天还没打也不算「断」，只要昨天起往前连续即可（避免一天没结束就清零）。
// 即——若今天已打卡，连击含今天；否则从昨天起算。
export function currentStreak(task, today) {
  const dates = sortedDates(task);
  if (!dates.length) return 0;
  const t = today instanceof Date ? today : new Date();
  const todayISO = toISODate(t);
  const set = new Set(task.checkins);
  let cursor = set.has(todayISO) ? t : prevDay(t); // 今天没打则从昨天起算
  let streak = 0;
  while (set.has(toISODate(cursor))) {
    streak++;
    cursor = prevDay(cursor);
  }
  return streak;
}

// 历史最长连击（不依赖「今天」）。
export function longestStreak(task) {
  const dates = sortedDates(task);
  if (!dates.length) return 0;
  let best = 1;
  let run = 1;
  for (let i = 1; i < dates.length; i++) {
    if (diffDays(dates[i - 1], dates[i]) === 1) {
      run++;
    } else {
      best = Math.max(best, run);
      run = 1;
    }
  }
  return Math.max(best, run);
}

// ===================== 档案（昵称容器）与任务管理 =====================

// 新建档案：含一个默认任务，并把它设为当前任务。
export function newProfile(nickname, key) {
  const ts = nowSec();
  const k = key || normalizeKey(nickname || '未命名');
  const task = newTask(DEFAULT_TASK_NAME, normalizeKey(DEFAULT_TASK_NAME));
  return {
    nickname: nickname || '未命名',
    key: k,
    tasks: { [task.key]: task },
    activeTaskKey: task.key,
    createdAt: ts,
    lastSeen: ts,
  };
}

// 列出档案下全部任务（按创建时间升序，回退到 key，保证展示稳定）。
export function listTasks(profile) {
  if (!profile || !profile.tasks) return [];
  return Object.values(profile.tasks).sort((a, b) => {
    const ca = Number.isFinite(a.createdAt) ? a.createdAt : 0;
    const cb = Number.isFinite(b.createdAt) ? b.createdAt : 0;
    if (ca !== cb) return ca - cb;
    return a.key < b.key ? -1 : 1;
  });
}

// 按 key 取任务（不存在返回 null）。
export function getTask(profile, taskKey) {
  if (!profile || !profile.tasks) return null;
  return profile.tasks[normalizeKey(taskKey)] || null;
}

// 当前激活任务。activeTaskKey 失效时回退到第一个任务，再不行返回 null。
export function getActiveTask(profile) {
  if (!profile || !profile.tasks) return null;
  const keys = Object.keys(profile.tasks);
  if (!keys.length) return null;
  if (profile.activeTaskKey && profile.tasks[profile.activeTaskKey]) {
    return profile.tasks[profile.activeTaskKey];
  }
  return profile.tasks[keys[0]];
}

// 设置当前任务（key 不存在则不改动，返回 false）。
export function setActiveTaskKey(profile, taskKey) {
  if (!profile || !profile.tasks) return false;
  const k = normalizeKey(taskKey);
  if (!profile.tasks[k]) return false;
  profile.activeTaskKey = k;
  return true;
}

// 新建 / 复用任务。同名（同 key）任务已存在则直接返回它（created=false）。
// 返回 { task, created }。name 不合法时返回 { task: null, created: false }。
export function ensureTask(profile, name) {
  if (!profile) return { task: null, created: false };
  if (!isValidTaskName(name)) return { task: null, created: false };
  const norm = normalizeTaskName(name);
  const k = normalizeKey(norm);
  if (profile.tasks && profile.tasks[k]) {
    return { task: profile.tasks[k], created: false };
  }
  if (!profile.tasks) profile.tasks = {};
  const task = newTask(norm, k);
  profile.tasks[k] = task;
  profile.activeTaskKey = k; // 新建后自动切到它
  return { task, created: true };
}

// 改任务名。同名冲突（key 变化且已被其他任务占用）或不存在时失败。
// 返回 { ok, error }，成功时已就地迁移到新 key 并保持激活态。
export function renameTask(profile, taskKey, newName) {
  if (!profile || !profile.tasks) return { ok: false, error: 'no-task' };
  const k = normalizeKey(taskKey);
  const task = profile.tasks[k];
  if (!task) return { ok: false, error: 'no-task' };
  if (!isValidTaskName(newName)) return { ok: false, error: 'invalid' };
  const norm = normalizeTaskName(newName);
  const newKey = normalizeKey(norm);
  // 先完成全部校验再开始写，保证「失败即不改」——否则改名冲突返回 {ok:false}
  // 时 task.name 已被改写，会在内存里留下两个同名任务，被后续 upsert 落盘。
  if (newKey !== k) {
    if (profile.tasks[newKey]) return { ok: false, error: 'dup' };
    task.name = norm;
    task.key = newKey;
    delete profile.tasks[k];
    profile.tasks[newKey] = task;
    if (profile.activeTaskKey === k) profile.activeTaskKey = newKey;
  } else {
    // key 未变（仅大小写/空白差异），只更新展示名。
    task.name = norm;
  }
  return { ok: true, error: null };
}

// 删除任务。拒绝删除档案内的最后一个任务（保证至少有一个可打卡任务）。
// 返回 { ok, error, profile }。成功后会自动选一个剩余任务为当前。
export function deleteTask(profile, taskKey) {
  if (!profile || !profile.tasks) return { ok: false, error: 'no-task' };
  const k = normalizeKey(taskKey);
  if (!profile.tasks[k]) return { ok: false, error: 'no-task' };
  if (Object.keys(profile.tasks).length <= 1) return { ok: false, error: 'last' };
  delete profile.tasks[k];
  if (profile.activeTaskKey === k) {
    profile.activeTaskKey = Object.keys(profile.tasks)[0];
  }
  return { ok: true, error: null };
}

// 档案级聚合统计（启动器展示用）：全部任务的累计天数与爱心总数。
export function profileTotals(profile) {
  if (!profile || !profile.tasks) return { total: 0, hearts: 0, taskCount: 0 };
  let total = 0;
  let hearts = 0;
  const taskCount = Object.keys(profile.tasks).length;
  for (const t of Object.values(profile.tasks)) {
    total += totalDays(t);
    hearts += heartsEarned(t);
  }
  return { total, hearts, taskCount };
}

// ===================== 名称规范化工具 =====================

// 把名称规范化为存档主键：去首尾空白、内部连续空白压成单个下划线、转小写。
// 昵称与任务名共用同一规范化逻辑（各自命名空间独立，互不冲突）。
export function normalizeKey(name) {
  return String(name || '')
    .trim()
    .replace(/\s+/g, '_')
    .toLowerCase();
}

// 校验昵称是否合法（去空白后长度在 [min, max] 内）。
export function isValidNickname(nickname, min, max) {
  const trimmed = String(nickname || '').replace(/\s+/g, ' ').trim();
  const len = [...trimmed].length; // 按码点计数，中文一字算一
  return len >= min && len <= max;
}

// 规范化展示用昵称：去首尾空白、内部连续空白压成单空格、按最大长度截断。
export function normalizeNickname(nickname, max) {
  const trimmed = String(nickname || '').replace(/\s+/g, ' ').trim();
  const chars = [...trimmed];
  return chars.slice(0, max).join('');
}

// 任务名校验（与昵称同等约束，默认上下限取 config 常量）。
export function isValidTaskName(name, min = 1, max = TASK_NAME_MAX_LEN) {
  return isValidNickname(name, min, max);
}

// 任务名规范化展示（与昵称同等规则）。
export function normalizeTaskName(name, max = TASK_NAME_MAX_LEN) {
  return normalizeNickname(name, max);
}

// 保留导出：部分老调用方（单测 / 调试）可能按昵称上限规范化，避免回归。
export { NICKNAME_MAX_LEN };
