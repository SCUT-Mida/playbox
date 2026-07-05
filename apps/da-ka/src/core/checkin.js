// ============================================================================
// 打卡逻辑模块（纯函数）：档案结构维护、打卡切换、连击统计、爱心里程碑。
//
// 档案结构（持久化在 store.js）：
//   {
//     nickname: string,          // 展示用昵称（保留原始大小写）
//     key: string,               // 规范化 key（小写去空格），存档主键
//     checkins: string[],        // 已打卡日期 'YYYY-MM-DD'（升序、唯一）
//     createdAt: number,         // 创建时间（秒）
//     lastSeen: number,          // 最近活跃时间（秒）
//   }
// ============================================================================
import { HEARTS_STEP } from '../config.js';
import { toISODate, parseISO, diffDays, prevDay } from './calendar.js';

// 工具：返回「今天」的秒级时间戳；脚本环境禁止 argless new Date() 时回退为 0。
export function nowSec() {
  try { return Math.floor(Date.now() / 1000); } catch (_) { return 0; }
}

// 新建档案。checkins 默认空（不含「今天」——是否首启即打卡交由 UI 决定）。
export function newProfile(nickname, key) {
  const ts = nowSec();
  return {
    nickname: nickname || '未命名',
    key: key || normalizeKey(nickname || '未命名'),
    checkins: [],
    createdAt: ts,
    lastSeen: ts,
  };
}

// 检查某日期是否已打卡。
export function isChecked(profile, iso) {
  return !!profile && Array.isArray(profile.checkins) && profile.checkins.includes(iso);
}

// 是否已打卡「今天」。
export function isCheckedToday(profile, today) {
  if (!profile) return false;
  const t = today instanceof Date ? today : new Date();
  return isChecked(profile, toISODate(t));
}

// 累计打卡天数。
export function totalDays(profile) {
  return profile && Array.isArray(profile.checkins) ? profile.checkins.length : 0;
}

// 已解锁爱心数（每 HEARTS_STEP 天一颗）。
export function heartsEarned(profile) {
  return Math.floor(totalDays(profile) / HEARTS_STEP);
}

// 距下一颗爱心还差几天（1..HEARTS_STEP）。
// 恰好整除（如第 20 天）时返回 HEARTS_STEP——即下一颗还要再打 10 天。
export function daysToNextHeart(profile) {
  const rem = totalDays(profile) % HEARTS_STEP;
  return rem === 0 ? HEARTS_STEP : HEARTS_STEP - rem;
}

// 当前这颗爱心的填充进度（0..1，用于进度条）。
export function heartProgress(profile) {
  const rem = totalDays(profile) % HEARTS_STEP;
  return rem / HEARTS_STEP;
}

// 切换某日的打卡状态。
// 仅接受合法的过去或今天日期；未来日直接拒绝（返回 unchanged）。
// 返回 { profile, checked, milestone }：
//   checked  —— 切换后该日是否处于打卡态
//   milestone—— 本次切换是否正好达成「第 N*HEARTS_STEP 天」（触发庆祝）
export function toggleCheckin(profile, iso, today) {
  if (!profile) return { profile, checked: false, milestone: false };
  const dt = parseISO(iso);
  if (!dt) return { profile, checked: false, milestone: false };
  // 拒绝未来日打卡：diffDays(today, dt) > 0 表示该日在今天之后。
  const t = today instanceof Date ? today : new Date();
  if (diffDays(t, dt) > 0) {
    return { profile, checked: isChecked(profile, iso), milestone: false };
  }

  const set = new Set(profile.checkins || []);
  let milestone = false;
  if (set.has(iso)) {
    set.delete(iso);
  } else {
    set.add(iso);
    milestone = set.size % HEARTS_STEP === 0; // 达到 10/20/30… 天
  }
  // 升序输出，保证持久化与展示稳定。
  const checkins = [...set].sort();
  const next = { ...profile, checkins, lastSeen: nowSec() };
  return { profile: next, checked: set.has(iso), milestone };
}

// —— 连击（streak）统计 ——
// 把 ISO 日期串去重排序为 Date 数组（非法串忽略）。
function sortedDates(profile) {
  if (!profile || !Array.isArray(profile.checkins)) return [];
  const set = new Set(profile.checkins);
  return [...set]
    .map(parseISO)
    .filter((d) => d instanceof Date)
    .sort((a, b) => a.getTime() - b.getTime());
}

// 当前连击：从今天起向前数连续打卡的天数。
// 业界惯例：今天还没打也不算「断」，只要昨天起往前连续即可（避免一天没结束就清零）。
// 即——若今天已打卡，连击含今天；否则从昨天起算。
export function currentStreak(profile, today) {
  const dates = sortedDates(profile);
  if (!dates.length) return 0;
  const t = today instanceof Date ? today : new Date();
  const todayISO = toISODate(t);
  const set = new Set(profile.checkins);
  let cursor = set.has(todayISO) ? t : prevDay(t); // 今天没打则从昨天起算
  let streak = 0;
  while (set.has(toISODate(cursor))) {
    streak++;
    cursor = prevDay(cursor);
  }
  return streak;
}

// 历史最长连击（不依赖「今天」）。
export function longestStreak(profile) {
  const dates = sortedDates(profile);
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

// 把昵称规范化为存档主键：去首尾空白、内部连续空白压成单个下划线、转小写。
// 这样「小 甜」「小甜」「小 甜」都归到同一档案，且保留展示用的原始字符串。
export function normalizeKey(nickname) {
  return String(nickname || '')
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
