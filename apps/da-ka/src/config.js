// ============================================================================
// 打卡 · 配置层（纯常量，便于单测）
// 定义昵称约束、爱心步长、星期与月份展示、存档 key 等。
// ============================================================================

// 昵称约束：去空格后 1~NICKNAME_MAX_LEN 个字符，避免空名 / 超长名撑破 UI。
export const NICKNAME_MIN_LEN = 1;
export const NICKNAME_MAX_LEN = 12;

// 打卡任务约束：一个昵称下可新建多个任务（如「跑步」「读书」「早睡」），
// 每个任务有独立的打卡记录与爱心里程碑。
export const TASK_NAME_MIN_LEN = 1;
export const TASK_NAME_MAX_LEN = 12;
// 新建昵称档案时自动创建的默认任务名；旧档（无 tasks 结构）迁移时也用它兜底。
export const DEFAULT_TASK_NAME = '每日打卡';

// 每累计 HEARTS_STEP 天打卡解锁一颗爱心。第 HEARTS_STEP 倍数日触发庆祝动画。
export const HEARTS_STEP = 10;

// 周一为首列（ productivity / 习惯类应用的业界惯例，便于区分工作日与周末）。
// 0=周日, 1=周一 … 6=周六。表头据此顺序排列。
export const WEEK_START = 1; // Monday-first

// 星期表头（周一→周日）。
export const WEEKDAY_LABELS = ['一', '二', '三', '四', '五', '六', '日'];

// 月份名（0-indexed，1 月在数组首位）。
export const MONTH_LABELS = [
  '一月', '二月', '三月', '四月', '五月', '六月',
  '七月', '八月', '九月', '十月', '十一月', '十二月',
];

// 存档：所有昵称档案集中存放于一个 key，避免污染 localStorage 命名空间。
export const STORE_KEY = 'daka_profiles_v1';
// 当前激活昵称的 key（独立存放，便于首启直达上次游玩的档案）。
export const ACTIVE_KEY = 'daka_active_v1';

// 钳制到合法昵称长度区间。
export function clampLen(n) {
  if (!Number.isFinite(n)) return NICKNAME_MIN_LEN;
  return Math.max(NICKNAME_MIN_LEN, Math.min(NICKNAME_MAX_LEN, Math.round(n)));
}
