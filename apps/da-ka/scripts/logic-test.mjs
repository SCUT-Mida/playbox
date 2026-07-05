// ============================================================================
// 纯逻辑自测：不依赖浏览器，覆盖 config / calendar / checkin / store 各模块。
// 运行：node scripts/logic-test.mjs
// ============================================================================
import {
  NICKNAME_MIN_LEN, NICKNAME_MAX_LEN, HEARTS_STEP, WEEK_START,
  WEEKDAY_LABELS, MONTH_LABELS, STORE_KEY, ACTIVE_KEY,
} from '../src/config.js';
import {
  toISODate, parseISO, atMidnight, isSameDay, addDays, prevDay, nextDay,
  diffDays, daysInMonth, monthMatrix, isFuture, isToday,
} from '../src/core/calendar.js';
import {
  newProfile, isChecked, isCheckedToday, totalDays, heartsEarned,
  daysToNextHeart, heartProgress, toggleCheckin, currentStreak, longestStreak,
  normalizeKey, isValidNickname, normalizeNickname, nowSec,
} from '../src/core/checkin.js';
import {
  _setStorage, loadAll, ensureProfile, upsertProfile, deleteProfile,
  renameProfile, listProfiles, getActiveKey, setActiveKey, hasAnyProfile,
  getProfile, migrate,
} from '../src/core/store.js';

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.error('  ✗ FAIL:', m); } };

// 固定参考日期：2026-07-05（本地午夜），作为「今天」注入，保证测试稳定。
const TODAY = new Date(2026, 6, 5);
const iso = (d) => toISODate(d);

// ===================== config =====================
ok(NICKNAME_MIN_LEN === 1, '昵称最小长度为 1');
ok(NICKNAME_MAX_LEN === 12, '昵称最大长度为 12');
ok(HEARTS_STEP === 10, '每 10 天一颗爱心');
ok(WEEK_START === 1, '周一为首列');
ok(WEEKDAY_LABELS.length === 7 && WEEKDAY_LABELS[0] === '一' && WEEKDAY_LABELS[6] === '日', '星期表头 周一→周日');
ok(MONTH_LABELS.length === 12, '12 个月份名');
ok(typeof STORE_KEY === 'string' && STORE_KEY.length > 0, '存档 key 非空');
ok(typeof ACTIVE_KEY === 'string' && ACTIVE_KEY.length > 0, '激活 key 非空');

// ===================== calendar =====================
ok(toISODate(new Date(2026, 6, 5)) === '2026-07-05', 'toISODate 月份补零');
ok(toISODate(new Date(2026, 0, 3)) === '2026-01-03', 'toISODate 1 月补零');
ok(parseISO('2026-07-05') instanceof Date, 'parseISO 返回 Date');
ok(parseISO('2026-13-40') === null, 'parseISO 非法月日返回 null');
ok(parseISO('2026-02-30') === null, 'parseISO 2 月 30 日溢出返回 null');
ok(isSameDay(new Date(2026, 6, 5, 23, 59), new Date(2026, 6, 5, 0, 0)), 'isSameDay 忽略时分秒');
ok(toISODate(addDays(TODAY, 1)) === '2026-07-06', 'addDays +1');
ok(toISODate(addDays(TODAY, -5)) === '2026-06-30', 'addDays -5 跨月');
ok(toISODate(prevDay(TODAY)) === '2026-07-04', 'prevDay');
ok(toISODate(nextDay(TODAY)) === '2026-07-06', 'nextDay');
ok(diffDays(new Date(2026, 6, 1), TODAY) === 4, 'diffDays 7/1→7/5 = 4');
ok(diffDays(TODAY, new Date(2026, 6, 1)) === -4, 'diffDays 反向为负');
ok(daysInMonth(2026, 1) === 28, '2026 年 2 月 28 天（平年）');
ok(daysInMonth(2024, 1) === 29, '2024 年 2 月 29 天（闰年）');
ok(daysInMonth(2026, 6) === 31, '7 月 31 天');
ok(daysInMonth(2026, 5) === 30, '6 月 30 天');

// monthMatrix：恒为 42 格，首格日期 <= 当月 1 号，且与首列（周一）对齐。
{
  const m = monthMatrix(2026, 6, WEEK_START); // 2026-07，1 号是周三
  ok(m.cells.length === 42, 'monthMatrix 产出 42 格');
  // 2026-07-01 是周三，周一为首列 → 首格应为 6/29（周一）。
  ok(iso(m.cells[0]) === '2026-06-29', `monthMatrix 首格为上月末周一（实际 ${iso(m.cells[0])}）`);
  ok(iso(m.cells[2]) === '2026-07-01', 'monthMatrix 第三格为 7 月 1 日');
  ok(iso(m.cells[41]) === '2026-08-09', `monthMatrix 末格为 8/9（实际 ${iso(m.cells[41])}）`);
  // 每个首列格子都是周一
  ok(m.cells.every((_, i) => i % 7 !== 0 || m.cells[i].getDay() === 1), '每行首列均为周一');
}
ok(isFuture(new Date(2026, 6, 6), TODAY) === true, '明天属于未来');
ok(isFuture(new Date(2026, 6, 5), TODAY) === false, '今天不是未来');
ok(isFuture(new Date(2026, 6, 4), TODAY) === false, '昨天不是未来');
ok(isToday(new Date(2026, 6, 5), TODAY) === true, 'isToday 命中');
ok(isToday(new Date(2026, 6, 6), TODAY) === false, 'isToday 非今天');

// ===================== checkin =====================
{
  const p = newProfile('小甜', '小甜');
  ok(p.nickname === '小甜', 'newProfile 记录昵称');
  ok(p.key === '小甜', 'newProfile 记录 key');
  ok(Array.isArray(p.checkins) && p.checkins.length === 0, '新档案打卡为空数组');
  ok(totalDays(p) === 0, '累计 0 天');
  ok(heartsEarned(p) === 0, '0 颗爱心');
  ok(isChecked(p, '2026-07-05') === false, '未打卡');
  ok(isCheckedToday(p, TODAY) === false, '今日未打卡');

  // 打卡今天
  let r = toggleCheckin(p, '2026-07-05', TODAY);
  ok(r.checked === true, '切换为已打卡');
  ok(r.milestone === false, '第 1 天非里程碑');
  ok(totalDays(r.profile) === 1, '累计 1 天');
  ok(isCheckedToday(r.profile, TODAY) === true, '今日已打卡');

  // 连续打卡 9 天（6/27 → 7/5），第 10 天里程碑
  let cur = r.profile;
  for (let i = 1; i <= 8; i++) {
    const d = addDays(TODAY, -i);
    cur = toggleCheckin(cur, iso(d), TODAY).profile;
  }
  ok(totalDays(cur) === 9, `连续打 9 天（实际 ${totalDays(cur)}）`);
  ok(heartsEarned(cur) === 0, '9 天尚无爱心');
  ok(daysToNextHeart(cur) === 1, '距第一颗爱心还差 1 天');
  ok(Math.abs(heartProgress(cur) - 0.9) < 1e-9, '进度 0.9');
  // 再打一天（第 10 天）→ 触发里程碑
  const r10 = toggleCheckin(cur, iso(addDays(TODAY, -9)), TODAY);
  ok(r10.milestone === true, '第 10 天触发里程碑');
  ok(heartsEarned(r10.profile) === 1, '解锁第 1 颗爱心');
  ok(daysToNextHeart(r10.profile) === HEARTS_STEP, '整除时距下一颗仍为 10 天');
  ok(heartProgress(r10.profile) === 0, '整除时进度归零');

  // 取消打卡今天 → 状态回退、不触发里程碑
  const undo = toggleCheckin(r10.profile, '2026-07-05', TODAY);
  ok(undo.checked === false, '取消后该日为未打卡');
  ok(undo.milestone === false, '取消不触发里程碑');
  ok(isCheckedToday(undo.profile, TODAY) === false, '今日恢复未打卡');
  ok(totalDays(undo.profile) === 9, '取消后累计回到 9 天');

  // 拒绝未来日打卡
  const fut = toggleCheckin(p, '2026-12-31', TODAY);
  ok(fut.checked === false && fut.milestone === false, '未来日打卡被拒绝');
  ok(totalDays(fut.profile) === 0, '未来日打卡不计入');
  // 非法日期串
  ok(toggleCheckin(p, 'not-a-date', TODAY).checked === false, '非法日期串被忽略');
}
ok(typeof nowSec() === 'number' && nowSec() >= 0, 'nowSec 返回非负数');

// —— 连击统计 ——
{
  // 今天已打卡 + 连续往前 4 天 → 连击 5；最长 5
  let p = newProfile('连击', '连击');
  for (let i = 0; i < 5; i++) p = toggleCheckin(p, iso(addDays(TODAY, -i)), TODAY).profile;
  ok(currentStreak(p, TODAY) === 5, `当前连击 5（实际 ${currentStreak(p, TODAY)}）`);
  ok(longestStreak(p) === 5, '最长连击 5');

  // 今天没打、但昨天起连续 3 天 → 连击 3（不算断）
  let p2 = newProfile('连击2', '连击2');
  for (let i = 1; i <= 3; i++) p2 = toggleCheckin(p2, iso(addDays(TODAY, -i)), TODAY).profile;
  ok(currentStreak(p2, TODAY) === 3, '今天没打也保留昨日连击 3');

  // 历史最长：早年有一段 7 连击
  let p3 = newProfile('连击3', '连击3');
  const base = new Date(2020, 0, 10);
  for (let i = 0; i < 7; i++) p3 = toggleCheckin(p3, iso(addDays(base, i)), TODAY).profile;
  // 再补今天单独 1 天
  p3 = toggleCheckin(p3, iso(TODAY), TODAY).profile;
  ok(longestStreak(p3) === 7, `历史最长连击 7（实际 ${longestStreak(p3)}）`);
  ok(currentStreak(p3, TODAY) === 1, '当前连击仅 1（今天）');

  // 乱序写入不影响连击（toggleCheckin 内部排序）
  let p4 = newProfile('乱序', '乱序');
  const days = [iso(addDays(TODAY, -2)), iso(TODAY), iso(addDays(TODAY, -1))];
  for (const d of days) p4 = toggleCheckin(p4, d, TODAY).profile;
  ok(currentStreak(p4, TODAY) === 3, '乱序写入后连击仍为 3');
  ok(p4.checkins.join() === [iso(addDays(TODAY, -2)), iso(addDays(TODAY, -1)), iso(TODAY)].join(), 'checkins 升序去重');
}

// —— 昵称工具 ——
ok(normalizeKey('小 甜') === '小_甜', 'normalizeKey 内部空白转下划线');
ok(normalizeKey('  AbC  ') === 'abc', 'normalizeKey 去首尾空白并小写');
ok(normalizeKey('小　甜　甜') === '小_甜_甜', 'normalizeKey 全角空白也归一'); // 全角空格属 \s
ok(isValidNickname('小甜甜', 1, 12) === true, '合法昵称通过');
ok(isValidNickname('   ', 1, 12) === false, '纯空白昵称非法');
ok(isValidNickname('', 1, 12) === false, '空昵称非法');
ok(isValidNickname('a'.repeat(13), 1, 12) === false, '超长昵称非法');
ok(isValidNickname('a'.repeat(12), 1, 12) === true, '12 字昵称刚好合法');
ok(normalizeNickname('  小   甜  ', 12) === '小 甜', 'normalizeNickname 压缩空白');
ok([...normalizeNickname('甜'.repeat(20), 12)].length === 12, 'normalizeNickname 按码点截断到 12');

// ===================== store（多档案）=====================
function memStorage() {
  const m = {};
  return {
    getItem: (k) => (k in m ? m[k] : null),
    setItem: (k, v) => { m[k] = String(v); },
    removeItem: (k) => { delete m[k]; },
  };
}
_setStorage(memStorage());
ok(Object.keys(loadAll()).length === 0, '空存储无档案');
ok(hasAnyProfile() === false, '空存储 hasAnyProfile=false');

// ensureProfile：新建并写入
const p1 = ensureProfile('小甜甜', null);
ok(p1.nickname === '小甜甜' && p1.key === '小甜甜', 'ensureProfile 新建档案');
ok(getProfile('小甜甜') !== null, '新建后可按 key 取回');
ok(hasAnyProfile() === true, '有档案后 hasAnyProfile=true');
// 同 key 再次 ensure 不重复创建，仅刷新 lastSeen
const p1Again = ensureProfile('小甜甜改名了', '小甜甜'); // 显式 key 命中已有档案
ok(p1Again.key === '小甜甜', '相同 key 不重复创建（沿用原档案）');
ok(p1Again.nickname === '小甜甜', '已存在时忽略传入的 nickname');

// upsertProfile：保存打卡进度
p1Again.checkins = ['2026-07-01', '2026-07-05'];
ok(upsertProfile(p1Again) === true, 'upsertProfile 写入成功');
ok(getProfile('小甜甜').checkins.length === 2, 'upsertProfile 后进度持久化');
// 「小 甜」与「小甜」应归到同一 key（空白归一）
const dup = ensureProfile('小 甜', null);
ok(dup.key === '小_甜', '昵称含空白派生带下划线 key');
// listProfiles 按最近活跃倒序
ensureProfile('阿喵', null);
const list = listProfiles();
ok(list.length >= 3, `listProfiles 列出全部档案（${list.length}）`);
ok(list.every((it, i) => i === 0 || list[i - 1].lastSeen >= it.lastSeen), 'listProfiles 按 lastSeen 倒序');

// renameProfile：仅改名
ok(renameProfile('小甜甜', '甜甜') === true, 'renameProfile 成功');
ok(getProfile('甜甜') !== null && getProfile('小甜甜') === null, '改名后旧 key 消失、新 key 可取');
// 改成已存在的 key 应失败
ok(renameProfile('甜甜', '阿喵') === false, '改成已占用 key 失败');
// 空名改名失败
ok(renameProfile('甜甜', '   ') === false, '改成空名失败');

// deleteProfile
ok(deleteProfile('阿喵') === true, 'deleteProfile 成功');
ok(getProfile('阿喵') === null, '删除后取不到');
ok(deleteProfile('不存在') === false, '删除不存在的档案返回 false');

// 激活指针
setActiveKey('甜甜');
ok(getActiveKey() === '甜甜', 'setActiveKey/getActiveKey 往返');
setActiveKey(null);
ok(getActiveKey() === null, 'setActiveKey(null) 清除激活');

// migrate：损坏档案被规范化
{
  _setStorage(memStorage());
  const bad = {
    nickname: '   ', key: '', checkins: ['bad', '2026-07-01', '2026-07-01', '2026-13-40', 123],
    createdAt: 'x', lastSeen: NaN,
  };
  upsertProfile(bad);
  const fixed = getProfile('未命名');
  ok(fixed !== null, 'migrate 兜底空昵称为「未命名」');
  ok(fixed.nickname === '未命名', 'migrate 规范化昵称');
  ok(fixed.key === '未命名', 'migrate 补齐 key');
  ok(Array.isArray(fixed.checkins) && fixed.checkins.length === 1 && fixed.checkins[0] === '2026-07-01', 'migrate 过滤非法/重复日期');
  ok(typeof fixed.createdAt === 'number' && typeof fixed.lastSeen === 'number', 'migrate 时间戳兜底为数字');
  // 非 Date 对象 / null 兜底
  ok(migrate(null) === null, 'migrate(null) 返回 null');
  ok(migrate('string') === null, 'migrate 非对象返回 null');
}

// 全流程：建档 → 打卡到 10 天 → 爱心数持久化 → 重读一致
{
  _setStorage(memStorage());
  let p = ensureProfile('坚持者', null);
  for (let i = 0; i < 10; i++) {
    p = toggleCheckin(p, iso(addDays(TODAY, -i)), TODAY).profile;
  }
  ok(heartsEarned(p) === 1, '打满 10 天解锁 1 颗爱心');
  upsertProfile(p);
  const reloaded = getProfile('坚持者');
  ok(reloaded.checkins.length === 10, '重读存档打卡数一致');
  ok(heartsEarned(reloaded) === 1, '重读存档爱心数一致');
}

console.log(`\n结果: ${pass} 通过, ${fail} 失败`);
process.exit(fail ? 1 : 0);
