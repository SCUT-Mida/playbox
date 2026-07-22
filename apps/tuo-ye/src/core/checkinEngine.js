// ============================================================================
// 托业模考 · 打卡逻辑模块（纯函数）
//
// 管理每日学习打卡：打卡切换、连续天数统计、里程碑判定、学习时长记录。
// 数据结构（存储于 store.getCheckin()）：
//   {
//     dates: string[],        // 已打卡日期 'YYYY-MM-DD'（升序、唯一）
//     totalMinutes: number,   // 累计学习分钟数
//   }
// ============================================================================
import { toISODate, parseISO, diffDays, prevDay, todayDate } from './calendar.js';
import { MILESTONE_STEP } from '../config.js';

// 初始化打卡数据（缺失字段补默认值）。
export function normalizeCheckin(data) {
  if (!data || typeof data !== 'object') return { dates: [], totalMinutes: 0 };
  const dates = Array.isArray(data.dates)
    ? [...new Set(data.dates)].filter((s) => typeof s === 'string' && parseISO(s)).sort()
    : [];
  const totalMinutes = Number.isFinite(data.totalMinutes) ? Math.max(0, Math.round(data.totalMinutes)) : 0;
  return { dates, totalMinutes };
}

// 某日是否已打卡。
export function isChecked(checkin, iso) {
  return !!checkin && Array.isArray(checkin.dates) && checkin.dates.includes(iso);
}

// 今天是否已打卡。
export function isCheckedToday(checkin, today) {
  if (!checkin) return false;
  const t = today instanceof Date ? today : todayDate();
  return isChecked(checkin, toISODate(t));
}

// 累计打卡天数。
export function totalDays(checkin) {
  return checkin && Array.isArray(checkin.dates) ? checkin.dates.length : 0;
}

// 当前连续打卡天数。
// 与 da-ka 一致的业界惯例：今天没打也不算「断」，从昨天起算连续。
export function currentStreak(checkin, today) {
  if (!checkin || !Array.isArray(checkin.dates) || !checkin.dates.length) return 0;
  const t = today instanceof Date ? today : todayDate();
  const set = new Set(checkin.dates);
  const todayISO = toISODate(t);
  let cursor = set.has(todayISO) ? t : prevDay(t);
  let streak = 0;
  while (set.has(toISODate(cursor))) {
    streak++;
    cursor = prevDay(cursor);
  }
  return streak;
}

// 历史最长连续打卡天数。
export function longestStreak(checkin) {
  if (!checkin || !Array.isArray(checkin.dates) || !checkin.dates.length) return 0;
  const dates = [...new Set(checkin.dates)].sort();
  let best = 1;
  let run = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = parseISO(dates[i - 1]);
    const curr = parseISO(dates[i]);
    if (prev && curr && diffDays(prev, curr) === 1) {
      run++;
    } else {
      best = Math.max(best, run);
      run = 1;
    }
  }
  return Math.max(best, run);
}

// 切换某日打卡状态（仅接受过去或今天；未来日拒绝）。
// 返回 { checkin, checked, milestone }：
//   checked   —— 切换后该日是否处于打卡态
//   milestone —— 本次切换是否达到新的里程碑（每 MILESTONE_STEP 天）
export function toggleCheckin(checkin, iso, today) {
  const data = normalizeCheckin(checkin);
  const dt = parseISO(iso);
  if (!dt) return { checkin: data, checked: false, milestone: false };
  // 拒绝未来日打卡
  const t = today instanceof Date ? today : todayDate();
  if (diffDays(t, dt) > 0) {
    return { checkin: data, checked: isChecked(data, iso), milestone: false };
  }

  const set = new Set(data.dates);
  let milestone = false;
  if (set.has(iso)) {
    set.delete(iso);
  } else {
    set.add(iso);
    // 里程碑判定：打卡后总天数为 MILESTONE_STEP 倍数
    milestone = set.size % MILESTONE_STEP === 0;
  }
  const dates = [...set].sort();
  return { checkin: { ...data, dates }, checked: set.has(iso), milestone };
}

// 添加学习时长（分钟），返回更新后的 checkin 数据。
export function addStudyMinutes(checkin, minutes) {
  const data = normalizeCheckin(checkin);
  const m = Number.isFinite(minutes) ? Math.max(0, Math.round(minutes)) : 0;
  return { ...data, totalMinutes: data.totalMinutes + m };
}

// 距下一个里程碑还差几天。
export function daysToNextMilestone(checkin) {
  const total = totalDays(checkin);
  const rem = total % MILESTONE_STEP;
  return rem === 0 ? MILESTONE_STEP : MILESTONE_STEP - rem;
}

// 当前里程碑周期进度（0..1）。
export function milestoneProgress(checkin) {
  const total = totalDays(checkin);
  return (total % MILESTONE_STEP) / MILESTONE_STEP;
}

// 已解锁里程碑数。
export function milestonesEarned(checkin) {
  return Math.floor(totalDays(checkin) / MILESTONE_STEP);
}

// 打卡统计概要。
export function checkinStats(checkin, today) {
  return {
    totalDays: totalDays(checkin),
    streak: currentStreak(checkin, today),
    longest: longestStreak(checkin),
    milestones: milestonesEarned(checkin),
    totalMinutes: checkin ? (checkin.totalMinutes || 0) : 0,
  };
}
