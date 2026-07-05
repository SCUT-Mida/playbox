// ============================================================================
// 日历工具模块：纯函数，无副作用，所有「今天」均通过参数注入以便单测。
// 使用本地时区的年/月/日；ISO 日期串统一为 'YYYY-MM-DD'（本地日，非 UTC）。
// ============================================================================

// 把 Date 规范化为本地午夜的日期（去掉时分秒，便于按日比较）。
export function atMidnight(d) {
  const x = d instanceof Date ? new Date(d.getTime()) : new Date(0);
  x.setHours(0, 0, 0, 0);
  return x;
}

// 取「今天」的本地午夜（运行期使用真实时间）。
export function todayDate() {
  try { return atMidnight(new Date()); } catch (_) { return atMidnight(new Date(0)); }
}

// 本地日期 → 'YYYY-MM-DD'（补零）。年月日均用本地分量，避免 UTC 偏移导致串错位一天。
export function toISODate(d) {
  const x = d instanceof Date ? d : new Date(0);
  const y = x.getFullYear();
  const m = String(x.getMonth() + 1).padStart(2, '0');
  const day = String(x.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// 'YYYY-MM-DD' → 本地午夜的 Date；非法串返回 null。
export function parseISO(str) {
  if (typeof str !== 'string') return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(str);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (!Number.isInteger(y) || !Number.isInteger(mo) || !Number.isInteger(d)) return null;
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  const dt = new Date(y, mo - 1, d);
  // 防御：构造时若 day 溢出（如 2 月 30 日）会被 JS 自动进位到下月，
  // 此处回检，溢出则视为非法。
  if (dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
  return atMidnight(dt);
}

// 是否同一天。
export function isSameDay(a, b) {
  if (!(a instanceof Date) || !(b instanceof Date)) return false;
  return toISODate(a) === toISODate(b);
}

// 日期 ± n 天（返回新 Date，本地午夜）。
export function addDays(d, n) {
  if (!(d instanceof Date) || !Number.isFinite(n)) return null;
  const x = atMidnight(d);
  x.setDate(x.getDate() + Math.trunc(n));
  return x;
}

// 前一天 / 后一天，便于连击计算。
export function prevDay(d) { return addDays(d, -1); }
export function nextDay(d) { return addDays(d, 1); }

// 两个本地午夜的 Date 之间的「日历日」差值（b - a，可为负）。
export function diffDays(a, b) {
  if (!(a instanceof Date) || !(b instanceof Date)) return NaN;
  const MS = 24 * 60 * 60 * 1000;
  return Math.round((atMidnight(b).getTime() - atMidnight(a).getTime()) / MS);
}

// 当月天数（28~31）。
export function daysInMonth(year, month /* 0-indexed */) {
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 0 || month > 11) return 0;
  return new Date(year, month + 1, 0).getDate();
}

// 给定某年某月，按 WEEK_START（默认周一）对齐的 6 行 × 7 列日历矩阵。
// 前后补上下月的日期，使格子永远满 42 格（业界日历通用布局，便于稳定排版）。
// 返回 { cells: Date[42], year, month }。
export function monthMatrix(year, month, weekStart = 1) {
  const first = new Date(year, month, 1);
  // 首日相对「首列」的偏移：JS getDay() 0=周日，需换算到 weekStart 起点。
  const firstDow = first.getDay(); // 0..6 (Sun..Sat)
  const offset = (firstDow - weekStart + 7) % 7;
  const start = addDays(first, -offset);
  const cells = [];
  for (let i = 0; i < 42; i++) cells.push(addDays(start, i));
  return { cells, year, month };
}

// 该日期是否严格在今天之后（未来日，不允许打卡）。
// diffDays(today, d) > 0 表示 d 在今天之后。
export function isFuture(d, today) {
  const t = today instanceof Date ? today : todayDate();
  return diffDays(t, d) > 0;
}

// 该日期是否就是今天。
export function isToday(d, today) {
  const t = today instanceof Date ? today : todayDate();
  return isSameDay(d, t);
}

// 把「该月第 N 天」按中文习惯格式化为「X 月 Y 日」展示。
export function monthDayLabel(year, month, day) {
  return `${month + 1} 月 ${day} 日`;
}
