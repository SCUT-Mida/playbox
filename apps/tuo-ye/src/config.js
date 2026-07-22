// ============================================================================
// 托业模考 · 配置层（纯常量，便于单测）
// 定义昵称约束、里程碑步长、星期与月份展示、存档 key 等。
// ============================================================================

// 存档：所有数据集中存放于一个 key（TOEIC 为单档案，不须多昵称结构）。
export const STORE_KEY = 'tuoye_data_v1';
// 当前激活昵称的 key（独立存放，便于首启直达上次游玩的档案）。
export const ACTIVE_KEY = 'tuoye_active_v1';

// 昵称约束：去空格后 1~NICKNAME_MAX_LEN 个字符，避免空名 / 超长名撑破 UI。
export const NICKNAME_MIN_LEN = 1;
export const NICKNAME_MAX_LEN = 12;

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

// 各题型时限（秒）—— TOEIC Reading section = 75 分钟。
export const EXAM_TIME_LIMITS = {
  full: 75 * 60,      // 全真阅读模考（Parts 5+6+7）
  part5: 10 * 60,     // Part 5 专项
  part6: 10 * 60,     // Part 6 专项
  part7: 55 * 60,     // Part 7 专项
};

// ============================================================================
// 各题型基本信息：中文简称、英文全名、题量。
// 基于 TOEIC 官方 Reading 部分三个 section 的实际分布：
//   Part 5 · Incomplete Sentences（语法填空）        30 题
//   Part 6 · Text Completion（完形填空）              16 题
//   Part 7 · Reading Comprehension（阅读理解）        54 题
// ============================================================================
export const PART_INFO = {
  part5: { name: 'Part 5 · Incomplete Sentences', shortName: '语法填空', total: 30 },
  part6: { name: 'Part 6 · Text Completion', shortName: '完形填空', total: 16 },
  part7: { name: 'Part 7 · Reading Comprehension', shortName: '阅读理解', total: 54 },
};

// 学习里程碑步长：每累计 MILESTONE_STEP 天学习解锁一个里程碑。
export const MILESTONE_STEP = 5; // Every 5 days of study = a milestone

// ============================================================================
// 学习资料分类：词汇 / 语法 / 商务短语。
// ============================================================================
export const STUDY_CATEGORIES = {
  vocab: { name: '核心词汇', icon: '📖' },
  grammar: { name: '语法要点', icon: '✏️' },
  business: { name: '商务短语', icon: '💼' },
};

// 钳制到合法昵称长度区间。
export function clampLen(n) {
  if (!Number.isFinite(n)) return NICKNAME_MIN_LEN;
  return Math.max(NICKNAME_MIN_LEN, Math.min(NICKNAME_MAX_LEN, Math.round(n)));
}
