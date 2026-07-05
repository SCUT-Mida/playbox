diff --git a/.ai-tasks/issue-65/ai-coder-prompt.md b/.ai-tasks/issue-65/ai-coder-prompt.md
new file mode 100644
index 0000000..835da1f
--- /dev/null
+++ b/.ai-tasks/issue-65/ai-coder-prompt.md
@@ -0,0 +1,8 @@
+你是一个资深开发者。请解决以下 GitHub Issue：
+【任务标题】: 每日打卡优化
+【详细需求】: 请直接阅读当前目录下的 .ai-tasks/issue-65/context.md 文件获取。
+
+【⚠️ 严格红线规则】：
+请绝对不要修改、重命名或生成 .github/ 目录下的任何文件 (特别是 workflows 等 CI/CD 配置)，这会破坏项目的自动化流程！如果觉得有必要修改，请在回复中用文字建议人类去改，绝不要自己动手改。
+
+请直接分析并修改项目中的代码文件来解决这个问题，不要做过多的文字解释。
diff --git a/.ai-tasks/issue-65/context.md b/.ai-tasks/issue-65/context.md
new file mode 100644
index 0000000..bb35f78
--- /dev/null
+++ b/.ai-tasks/issue-65/context.md
@@ -0,0 +1,3 @@
+- 进入不应该叫“开始游戏”吧，需要优化
+- 每日打卡，应该有一个任务的概念，一个昵称下，可以新建n个打卡任务，每个任务都有独自的打卡记录
+- 过去的其实不建议能点击日历就能打卡，建议增加再次确认交互逻辑，再次确认后才能打卡
diff --git a/apps/da-ka/README.md b/apps/da-ka/README.md
index b713a02..8e5c950 100644
--- a/apps/da-ka/README.md
+++ b/apps/da-ka/README.md
@@ -1,6 +1,6 @@
 # 打卡 · Daily Check-in
 
-一款粉色系的每日打卡日历。坚持的每一天都开出一朵小花 🌸，**每累计 10 天** 收获一颗爱心，并触发庆祝动画。可输入昵称、按昵称多档案存档。
+一款粉色系的每日打卡日历。坚持的每一天都开出一朵小花 🌸，**每累计 10 天** 收获一颗爱心，并触发庆祝动画。输入昵称建档，**一个昵称下可新建多个打卡任务**（跑步、读书、早睡……），每个任务都有独立的打卡记录与爱心里程碑。
 
 技术栈：**原生 DOM + Vite**（无框架），移动端优先，纯本地存储。
 
@@ -18,10 +18,11 @@ npm run test:dom   # jsdom DOM 冒烟测试
 ## 核心功能
 
 - **日历**：周一为首列的月历，可前后翻月；今日高亮，未来日禁用，上下月占位淡化。
-- **打卡 / 取消**：点击任意日期格切换打卡；今日另有醒目大按钮。再次点击即取消。
-- **爱心里程碑**：每累计 10 天解锁一颗爱心；第 10 / 20 / 30 … 天触发爱心飞散的庆祝动画。
+- **打卡 / 取消**：今日格与今日大按钮可直接点击切换；**过去日期需二次确认**（点格弹出确认框，确认后才补卡 / 取消），避免误触改动历史记录。未来日不可打卡。
+- **多任务打卡**：一个昵称下可新建任意个打卡任务，每个任务有独立的打卡记录、连击与爱心里程碑；主视图顶部「任务条」可切换 / 新建 / 改名 / 删除任务（删除二次确认，至少保留一个）。
+- **爱心里程碑**：每个任务每累计 10 天解锁一颗爱心；第 10 / 20 / 30 … 天触发爱心飞散的庆祝动画。
 - **统计**：累计天数、连续打卡（今天没打也不算断）、历史最长连击；爱心收藏区可视化已解锁与未解锁占位。
-- **昵称存档**：输入昵称建档，数据按昵称归档于 `localStorage`；支持多档案切换、改名、删除（二次确认）。
+- **昵称存档**：输入昵称建档，数据按昵称归档于 `localStorage`；支持多档案切换、改名、删除（二次确认）。旧版档案（单任务结构）自动迁移为带默认任务的新结构，历史打卡不丢。
 - **粉色色系**：柔和粉渐变 + 圆角卡片 + 心形点缀 + 微动效，尊重 `prefers-reduced-motion`。
 
 ## 项目结构
diff --git a/apps/da-ka/scripts/logic-test.mjs b/apps/da-ka/scripts/logic-test.mjs
index 05ad2d9..57b3c29 100644
--- a/apps/da-ka/scripts/logic-test.mjs
+++ b/apps/da-ka/scripts/logic-test.mjs
@@ -3,7 +3,10 @@
 // 运行：node scripts/logic-test.mjs
 // ============================================================================
 import {
-  NICKNAME_MIN_LEN, NICKNAME_MAX_LEN, HEARTS_STEP, WEEK_START,
+  NICKNAME_MIN_LEN, NICKNAME_MAX_LEN,
+  TASK_NAME_MIN_LEN, TASK_NAME_MAX_LEN,
+  DEFAULT_TASK_NAME,
+  HEARTS_STEP, WEEK_START,
   WEEKDAY_LABELS, MONTH_LABELS, STORE_KEY, ACTIVE_KEY,
 } from '../src/config.js';
 import {
@@ -11,14 +14,17 @@ import {
   diffDays, daysInMonth, monthMatrix, isFuture, isToday,
 } from '../src/core/calendar.js';
 import {
-  newProfile, isChecked, isCheckedToday, totalDays, heartsEarned,
+  newProfile, newTask, isChecked, isCheckedToday, totalDays, heartsEarned,
   daysToNextHeart, heartProgress, toggleCheckin, currentStreak, longestStreak,
-  normalizeKey, isValidNickname, normalizeNickname, nowSec,
+  normalizeKey, isValidNickname, normalizeNickname,
+  isValidTaskName, normalizeTaskName, nowSec,
+  listTasks, getTask, getActiveTask, setActiveTaskKey, ensureTask, renameTask, deleteTask,
+  profileTotals,
 } from '../src/core/checkin.js';
 import {
   _setStorage, loadAll, ensureProfile, upsertProfile, deleteProfile,
   renameProfile, listProfiles, getActiveKey, setActiveKey, hasAnyProfile,
-  getProfile, migrate,
+  getProfile, migrate, migrateTask,
 } from '../src/core/store.js';
 
 let pass = 0, fail = 0;
@@ -31,6 +37,9 @@ const iso = (d) => toISODate(d);
 // ===================== config =====================
 ok(NICKNAME_MIN_LEN === 1, '昵称最小长度为 1');
 ok(NICKNAME_MAX_LEN === 12, '昵称最大长度为 12');
+ok(TASK_NAME_MIN_LEN === 1, '任务名最小长度为 1');
+ok(TASK_NAME_MAX_LEN === 12, '任务名最大长度为 12');
+ok(DEFAULT_TASK_NAME === '每日打卡', '默认任务名为「每日打卡」');
 ok(HEARTS_STEP === 10, '每 10 天一颗爱心');
 ok(WEEK_START === 1, '周一为首列');
 ok(WEEKDAY_LABELS.length === 7 && WEEKDAY_LABELS[0] === '一' && WEEKDAY_LABELS[6] === '日', '星期表头 周一→周日');
@@ -73,29 +82,30 @@ ok(isFuture(new Date(2026, 6, 4), TODAY) === false, '昨天不是未来');
 ok(isToday(new Date(2026, 6, 5), TODAY) === true, 'isToday 命中');
 ok(isToday(new Date(2026, 6, 6), TODAY) === false, 'isToday 非今天');
 
-// ===================== checkin =====================
+// ===================== checkin（任务级打卡数学）=====================
 {
-  const p = newProfile('小甜', '小甜');
-  ok(p.nickname === '小甜', 'newProfile 记录昵称');
-  ok(p.key === '小甜', 'newProfile 记录 key');
-  ok(Array.isArray(p.checkins) && p.checkins.length === 0, '新档案打卡为空数组');
-  ok(totalDays(p) === 0, '累计 0 天');
-  ok(heartsEarned(p) === 0, '0 颗爱心');
-  ok(isChecked(p, '2026-07-05') === false, '未打卡');
-  ok(isCheckedToday(p, TODAY) === false, '今日未打卡');
+  const t = newTask('跑步', '跑步');
+  ok(t.nickname === undefined, '任务不带昵称字段');
+  ok(t.name === '跑步', 'newTask 记录任务名');
+  ok(t.key === '跑步', 'newTask 记录 key');
+  ok(Array.isArray(t.checkins) && t.checkins.length === 0, '新任务打卡为空数组');
+  ok(totalDays(t) === 0, '累计 0 天');
+  ok(heartsEarned(t) === 0, '0 颗爱心');
+  ok(isChecked(t, '2026-07-05') === false, '未打卡');
+  ok(isCheckedToday(t, TODAY) === false, '今日未打卡');
 
   // 打卡今天
-  let r = toggleCheckin(p, '2026-07-05', TODAY);
+  let r = toggleCheckin(t, '2026-07-05', TODAY);
   ok(r.checked === true, '切换为已打卡');
   ok(r.milestone === false, '第 1 天非里程碑');
-  ok(totalDays(r.profile) === 1, '累计 1 天');
-  ok(isCheckedToday(r.profile, TODAY) === true, '今日已打卡');
+  ok(totalDays(r.task) === 1, '累计 1 天');
+  ok(isCheckedToday(r.task, TODAY) === true, '今日已打卡');
 
   // 连续打卡 9 天（6/27 → 7/5），第 10 天里程碑
-  let cur = r.profile;
+  let cur = r.task;
   for (let i = 1; i <= 8; i++) {
     const d = addDays(TODAY, -i);
-    cur = toggleCheckin(cur, iso(d), TODAY).profile;
+    cur = toggleCheckin(cur, iso(d), TODAY).task;
   }
   ok(totalDays(cur) === 9, `连续打 9 天（实际 ${totalDays(cur)}）`);
   ok(heartsEarned(cur) === 0, '9 天尚无爱心');
@@ -104,57 +114,57 @@ ok(isToday(new Date(2026, 6, 6), TODAY) === false, 'isToday 非今天');
   // 再打一天（第 10 天）→ 触发里程碑
   const r10 = toggleCheckin(cur, iso(addDays(TODAY, -9)), TODAY);
   ok(r10.milestone === true, '第 10 天触发里程碑');
-  ok(heartsEarned(r10.profile) === 1, '解锁第 1 颗爱心');
-  ok(daysToNextHeart(r10.profile) === HEARTS_STEP, '整除时距下一颗仍为 10 天');
-  ok(heartProgress(r10.profile) === 0, '整除时进度归零');
+  ok(heartsEarned(r10.task) === 1, '解锁第 1 颗爱心');
+  ok(daysToNextHeart(r10.task) === HEARTS_STEP, '整除时距下一颗仍为 10 天');
+  ok(heartProgress(r10.task) === 0, '整除时进度归零');
 
   // 取消打卡今天 → 状态回退、不触发里程碑
-  const undo = toggleCheckin(r10.profile, '2026-07-05', TODAY);
+  const undo = toggleCheckin(r10.task, '2026-07-05', TODAY);
   ok(undo.checked === false, '取消后该日为未打卡');
   ok(undo.milestone === false, '取消不触发里程碑');
-  ok(isCheckedToday(undo.profile, TODAY) === false, '今日恢复未打卡');
-  ok(totalDays(undo.profile) === 9, '取消后累计回到 9 天');
+  ok(isCheckedToday(undo.task, TODAY) === false, '今日恢复未打卡');
+  ok(totalDays(undo.task) === 9, '取消后累计回到 9 天');
 
   // 拒绝未来日打卡
-  const fut = toggleCheckin(p, '2026-12-31', TODAY);
+  const fut = toggleCheckin(t, '2026-12-31', TODAY);
   ok(fut.checked === false && fut.milestone === false, '未来日打卡被拒绝');
-  ok(totalDays(fut.profile) === 0, '未来日打卡不计入');
+  ok(totalDays(fut.task) === 0, '未来日打卡不计入');
   // 非法日期串
-  ok(toggleCheckin(p, 'not-a-date', TODAY).checked === false, '非法日期串被忽略');
+  ok(toggleCheckin(t, 'not-a-date', TODAY).checked === false, '非法日期串被忽略');
 }
 ok(typeof nowSec() === 'number' && nowSec() >= 0, 'nowSec 返回非负数');
 
 // —— 连击统计 ——
 {
   // 今天已打卡 + 连续往前 4 天 → 连击 5；最长 5
-  let p = newProfile('连击', '连击');
-  for (let i = 0; i < 5; i++) p = toggleCheckin(p, iso(addDays(TODAY, -i)), TODAY).profile;
-  ok(currentStreak(p, TODAY) === 5, `当前连击 5（实际 ${currentStreak(p, TODAY)}）`);
-  ok(longestStreak(p) === 5, '最长连击 5');
+  let t = newTask('连击', '连击');
+  for (let i = 0; i < 5; i++) t = toggleCheckin(t, iso(addDays(TODAY, -i)), TODAY).task;
+  ok(currentStreak(t, TODAY) === 5, `当前连击 5（实际 ${currentStreak(t, TODAY)}）`);
+  ok(longestStreak(t) === 5, '最长连击 5');
 
   // 今天没打、但昨天起连续 3 天 → 连击 3（不算断）
-  let p2 = newProfile('连击2', '连击2');
-  for (let i = 1; i <= 3; i++) p2 = toggleCheckin(p2, iso(addDays(TODAY, -i)), TODAY).profile;
-  ok(currentStreak(p2, TODAY) === 3, '今天没打也保留昨日连击 3');
+  let t2 = newTask('连击2', '连击2');
+  for (let i = 1; i <= 3; i++) t2 = toggleCheckin(t2, iso(addDays(TODAY, -i)), TODAY).task;
+  ok(currentStreak(t2, TODAY) === 3, '今天没打也保留昨日连击 3');
 
   // 历史最长：早年有一段 7 连击
-  let p3 = newProfile('连击3', '连击3');
+  let t3 = newTask('连击3', '连击3');
   const base = new Date(2020, 0, 10);
-  for (let i = 0; i < 7; i++) p3 = toggleCheckin(p3, iso(addDays(base, i)), TODAY).profile;
+  for (let i = 0; i < 7; i++) t3 = toggleCheckin(t3, iso(addDays(base, i)), TODAY).task;
   // 再补今天单独 1 天
-  p3 = toggleCheckin(p3, iso(TODAY), TODAY).profile;
-  ok(longestStreak(p3) === 7, `历史最长连击 7（实际 ${longestStreak(p3)}）`);
-  ok(currentStreak(p3, TODAY) === 1, '当前连击仅 1（今天）');
+  t3 = toggleCheckin(t3, iso(TODAY), TODAY).task;
+  ok(longestStreak(t3) === 7, `历史最长连击 7（实际 ${longestStreak(t3)}）`);
+  ok(currentStreak(t3, TODAY) === 1, '当前连击仅 1（今天）');
 
   // 乱序写入不影响连击（toggleCheckin 内部排序）
-  let p4 = newProfile('乱序', '乱序');
+  let t4 = newTask('乱序', '乱序');
   const days = [iso(addDays(TODAY, -2)), iso(TODAY), iso(addDays(TODAY, -1))];
-  for (const d of days) p4 = toggleCheckin(p4, d, TODAY).profile;
-  ok(currentStreak(p4, TODAY) === 3, '乱序写入后连击仍为 3');
-  ok(p4.checkins.join() === [iso(addDays(TODAY, -2)), iso(addDays(TODAY, -1)), iso(TODAY)].join(), 'checkins 升序去重');
+  for (const d of days) t4 = toggleCheckin(t4, d, TODAY).task;
+  ok(currentStreak(t4, TODAY) === 3, '乱序写入后连击仍为 3');
+  ok(t4.checkins.join() === [iso(addDays(TODAY, -2)), iso(addDays(TODAY, -1)), iso(TODAY)].join(), 'checkins 升序去重');
 }
 
-// —— 昵称工具 ——
+// —— 名称工具（昵称 / 任务名共用规范化）——
 ok(normalizeKey('小 甜') === '小_甜', 'normalizeKey 内部空白转下划线');
 ok(normalizeKey('  AbC  ') === 'abc', 'normalizeKey 去首尾空白并小写');
 ok(normalizeKey('小　甜　甜') === '小_甜_甜', 'normalizeKey 全角空白也归一'); // 全角空格属 \s
@@ -165,8 +175,77 @@ ok(isValidNickname('a'.repeat(13), 1, 12) === false, '超长昵称非法');
 ok(isValidNickname('a'.repeat(12), 1, 12) === true, '12 字昵称刚好合法');
 ok(normalizeNickname('  小   甜  ', 12) === '小 甜', 'normalizeNickname 压缩空白');
 ok([...normalizeNickname('甜'.repeat(20), 12)].length === 12, 'normalizeNickname 按码点截断到 12');
+ok(isValidTaskName('跑步') === true, '合法任务名通过');
+ok(isValidTaskName('   ') === false, '纯空白任务名非法');
+ok(normalizeTaskName('  跑  步  ') === '跑 步', 'normalizeTaskName 压缩空白');
+
+// ===================== 任务管理（档案内多任务）=====================
+{
+  const p = newProfile('小甜', '小甜');
+  ok(p.nickname === '小甜', 'newProfile 记录昵称');
+  ok(p.key === '小甜', 'newProfile 记录 key');
+  ok(p.tasks && typeof p.tasks === 'object', '档案含 tasks 容器');
+  ok(Object.keys(p.tasks).length === 1, '新建档案自带 1 个默认任务');
+  ok(p.activeTaskKey === normalizeKey(DEFAULT_TASK_NAME), '默认任务为当前任务');
+  ok(getActiveTask(p) === p.tasks[p.activeTaskKey], 'getActiveTask 返回当前任务');
+
+  // 默认任务初始无打卡
+  ok(totalDays(getActiveTask(p)) === 0, '默认任务累计 0 天');
+
+  // 新建第二个任务
+  const r1 = ensureTask(p, '跑步');
+  ok(r1.created === true && r1.task.name === '跑步', 'ensureTask 新建任务');
+  ok(Object.keys(p.tasks).length === 2, '档案现有 2 个任务');
+  ok(p.activeTaskKey === '跑步', '新建后自动切到新任务');
+  // 同名任务不重复创建
+  const r1b = ensureTask(p, '跑步');
+  ok(r1b.created === false, '同名任务不重复创建');
+  ok(Object.keys(p.tasks).length === 2, '任务数仍为 2');
+  // 非法名拒绝
+  ok(ensureTask(p, '   ').task === null, '空白任务名被拒');
+
+  // 切换当前任务
+  ok(setActiveTaskKey(p, normalizeKey(DEFAULT_TASK_NAME)) === true, '切回默认任务');
+  ok(p.activeTaskKey === normalizeKey(DEFAULT_TASK_NAME), '当前任务已切换');
+  ok(setActiveTaskKey(p, '不存在') === false, '切到不存在任务返回 false');
 
-// ===================== store（多档案）=====================
+  // 每个任务打卡记录独立
+  let runTask = getTask(p, '跑步');
+  runTask = toggleCheckin(runTask, '2026-07-05', TODAY).task;
+  p.tasks[runTask.key] = runTask;
+  let defTask = getTask(p, normalizeKey(DEFAULT_TASK_NAME));
+  defTask = toggleCheckin(defTask, '2026-07-04', TODAY).task;
+  p.tasks[defTask.key] = defTask;
+  ok(totalDays(getTask(p, '跑步')) === 1, '跑步任务独立记录 1 天');
+  ok(totalDays(getTask(p, normalizeKey(DEFAULT_TASK_NAME))) === 1, '默认任务独立记录 1 天');
+  ok(totalDays(getTask(p, '跑步')) === 1 && isChecked(getTask(p, '跑步'), '2026-07-04') === false, '两任务记录互不干扰');
+
+  // listTasks 按创建顺序
+  const listed = listTasks(p);
+  ok(listed.length === 2, 'listTasks 列出全部任务');
+  ok(listed[0].createdAt <= listed[1].createdAt, 'listTasks 按创建时间升序');
+
+  // 改任务名
+  ok(renameTask(p, '跑步', '晨跑').ok === true, 'renameTask 成功');
+  ok(getTask(p, '跑步') === null && getTask(p, '晨跑') !== null, '改名后旧 key 消失、新 key 可取');
+  // 改成已存在的任务名失败
+  ok(renameTask(p, '晨跑', normalizeKey(DEFAULT_TASK_NAME)).ok === false, '改成已占用任务名失败');
+  // 空名失败
+  ok(renameTask(p, '晨跑', '   ').ok === false, '改成空任务名失败');
+
+  // 删除任务：拒绝删最后一个
+  let d1 = deleteTask(p, normalizeKey(DEFAULT_TASK_NAME));
+  ok(d1.ok === true, '删除非最后任务成功');
+  ok(Object.keys(p.tasks).length === 1, '删除后剩 1 个任务');
+  let d2 = deleteTask(p, '晨跑');
+  ok(d2.ok === false && d2.error === 'last', '拒绝删除最后一个任务');
+
+  // 档案级聚合统计
+  const t = profileTotals(p);
+  ok(t.taskCount === 1, 'profileTotals 任务数=1');
+}
+
+// ===================== store（多档案 + 多任务）=====================
 function memStorage() {
   const m = {};
   return {
@@ -179,9 +258,10 @@ _setStorage(memStorage());
 ok(Object.keys(loadAll()).length === 0, '空存储无档案');
 ok(hasAnyProfile() === false, '空存储 hasAnyProfile=false');
 
-// ensureProfile：新建并写入
+// ensureProfile：新建并写入（自带一个默认任务）
 const p1 = ensureProfile('小甜甜', null);
 ok(p1.nickname === '小甜甜' && p1.key === '小甜甜', 'ensureProfile 新建档案');
+ok(p1.tasks && Object.keys(p1.tasks).length === 1, '新档案自带默认任务');
 ok(getProfile('小甜甜') !== null, '新建后可按 key 取回');
 ok(hasAnyProfile() === true, '有档案后 hasAnyProfile=true');
 // 同 key 再次 ensure 不重复创建，仅刷新 lastSeen
@@ -189,18 +269,21 @@ const p1Again = ensureProfile('小甜甜改名了', '小甜甜'); // 显式 key
 ok(p1Again.key === '小甜甜', '相同 key 不重复创建（沿用原档案）');
 ok(p1Again.nickname === '小甜甜', '已存在时忽略传入的 nickname');
 
-// upsertProfile：保存打卡进度
-p1Again.checkins = ['2026-07-01', '2026-07-05'];
+// upsertProfile：在默认任务上保存打卡进度
+const p1Task = getActiveTask(p1Again);
+p1Again.tasks[p1Task.key] = toggleCheckin(p1Task, '2026-07-01', TODAY).task;
+p1Again.tasks[p1Task.key] = toggleCheckin(p1Again.tasks[p1Task.key], '2026-07-05', TODAY).task;
 ok(upsertProfile(p1Again) === true, 'upsertProfile 写入成功');
-ok(getProfile('小甜甜').checkins.length === 2, 'upsertProfile 后进度持久化');
+ok(getActiveTask(getProfile('小甜甜')).checkins.length === 2, 'upsertProfile 后进度持久化');
 // 「小 甜」与「小甜」应归到同一 key（空白归一）
 const dup = ensureProfile('小 甜', null);
 ok(dup.key === '小_甜', '昵称含空白派生带下划线 key');
-// listProfiles 按最近活跃倒序
+// listProfiles 按最近活跃倒序，聚合任务统计
 ensureProfile('阿喵', null);
 const list = listProfiles();
 ok(list.length >= 3, `listProfiles 列出全部档案（${list.length}）`);
 ok(list.every((it, i) => i === 0 || list[i - 1].lastSeen >= it.lastSeen), 'listProfiles 按 lastSeen 倒序');
+ok(typeof list[0].taskCount === 'number' && list[0].taskCount >= 1, 'listProfiles 含 taskCount 聚合');
 
 // renameProfile：仅改名
 ok(renameProfile('小甜甜', '甜甜') === true, 'renameProfile 成功');
@@ -221,11 +304,29 @@ ok(getActiveKey() === '甜甜', 'setActiveKey/getActiveKey 往返');
 setActiveKey(null);
 ok(getActiveKey() === null, 'setActiveKey(null) 清除激活');
 
+// migrate：旧档（顶层 checkins）迁移进默认任务
+{
+  _setStorage(memStorage());
+  const legacy = {
+    nickname: '老用户', key: '老用户',
+    checkins: ['2026-07-01', '2026-07-01', '2026-13-40', '2026-07-03'],
+    maxHearts: 0, createdAt: 100, lastSeen: 200,
+  };
+  upsertProfile(legacy);
+  const fixed = getProfile('老用户');
+  ok(fixed !== null, '旧档迁移成功');
+  ok(fixed.tasks && Object.keys(fixed.tasks).length === 1, '旧档迁入 1 个默认任务');
+  ok(fixed.checkins === undefined, '旧档顶层 checkins 已清理');
+  const t = getActiveTask(fixed);
+  ok(t.name === DEFAULT_TASK_NAME, '迁移任务名为默认任务名');
+  ok(Array.isArray(t.checkins) && t.checkins.length === 2 && t.checkins[0] === '2026-07-01', '迁移保留合法 / 去重日期');
+  ok(typeof fixed.createdAt === 'number' && typeof fixed.lastSeen === 'number', '时间戳兜底为数字');
+}
 // migrate：损坏档案被规范化
 {
   _setStorage(memStorage());
   const bad = {
-    nickname: '   ', key: '', checkins: ['bad', '2026-07-01', '2026-07-01', '2026-13-40', 123],
+    nickname: '   ', key: '', tasks: null,
     createdAt: 'x', lastSeen: NaN,
   };
   upsertProfile(bad);
@@ -233,25 +334,34 @@ ok(getActiveKey() === null, 'setActiveKey(null) 清除激活');
   ok(fixed !== null, 'migrate 兜底空昵称为「未命名」');
   ok(fixed.nickname === '未命名', 'migrate 规范化昵称');
   ok(fixed.key === '未命名', 'migrate 补齐 key');
-  ok(Array.isArray(fixed.checkins) && fixed.checkins.length === 1 && fixed.checkins[0] === '2026-07-01', 'migrate 过滤非法/重复日期');
-  ok(typeof fixed.createdAt === 'number' && typeof fixed.lastSeen === 'number', 'migrate 时间戳兜底为数字');
+  ok(fixed.tasks && Object.keys(fixed.tasks).length === 1, 'migrate 兜底至少一个任务');
+  ok(getActiveTask(fixed).checkins.length === 0, '兜底任务打卡为空');
   // 非 Date 对象 / null 兜底
   ok(migrate(null) === null, 'migrate(null) 返回 null');
   ok(migrate('string') === null, 'migrate 非对象返回 null');
+  // migrateTask 单元兜底
+  ok(migrateTask(null) === null, 'migrateTask(null) 返回 null');
+  ok(migrateTask({ checkins: ['bad', '2026-07-01', 123] }).checkins.length === 1, 'migrateTask 过滤非法日期');
 }
 
-// 全流程：建档 → 打卡到 10 天 → 爱心数持久化 → 重读一致
+// 全流程：建档 → 多任务各自打卡 → 爱心数持久化 → 重读一致
 {
   _setStorage(memStorage());
   let p = ensureProfile('坚持者', null);
-  for (let i = 0; i < 10; i++) {
-    p = toggleCheckin(p, iso(addDays(TODAY, -i)), TODAY).profile;
-  }
-  ok(heartsEarned(p) === 1, '打满 10 天解锁 1 颗爱心');
+  // 在默认任务上打满 10 天
+  let t = getActiveTask(p);
+  for (let i = 0; i < 10; i++) t = toggleCheckin(t, iso(addDays(TODAY, -i)), TODAY).task;
+  p.tasks[t.key] = t;
+  // 新建「跑步」任务并打 1 天
+  const r = ensureTask(p, '跑步');
+  p.tasks[r.task.key] = toggleCheckin(r.task, '2026-07-05', TODAY).task;
   upsertProfile(p);
   const reloaded = getProfile('坚持者');
-  ok(reloaded.checkins.length === 10, '重读存档打卡数一致');
-  ok(heartsEarned(reloaded) === 1, '重读存档爱心数一致');
+  const defTask = getTask(reloaded, normalizeKey(DEFAULT_TASK_NAME));
+  ok(defTask && heartsEarned(defTask) === 1, '默认任务 10 天解锁 1 颗爱心');
+  ok(getTask(reloaded, '跑步').checkins.length === 1, '跑步任务独立记录 1 天');
+  const totals = profileTotals(reloaded);
+  ok(totals.total === 11 && totals.hearts === 1 && totals.taskCount === 2, `聚合统计：11 天 / 1 心 / 2 任务（实际 ${totals.total}/${totals.hearts}/${totals.taskCount}）`);
 }
 
 console.log(`\n结果: ${pass} 通过, ${fail} 失败`);
diff --git a/apps/da-ka/scripts/smoke-dom.mjs b/apps/da-ka/scripts/smoke-dom.mjs
index 170303f..a16a54a 100644
--- a/apps/da-ka/scripts/smoke-dom.mjs
+++ b/apps/da-ka/scripts/smoke-dom.mjs
@@ -1,5 +1,6 @@
 // DOM 冒烟测试：用 jsdom 驱动真实 UI 流程
-// （启动器 → 输入昵称 → 主视图 → 日历打卡/取消 → 翻月 → 10 天爱心庆祝 →
+// （启动器 → 输入昵称 → 主视图 → 任务管理：新建/切换/改名/删除 →
+//   日历今日直点 / 过去日二次确认补卡 → 翻月 → 10 天爱心庆祝 →
 //   持久化 → 档案管理：切换 / 改名 / 删除），全程不抛错。
 // 运行：node scripts/smoke-dom.mjs   （需先 npm install jsdom）
 import { JSDOM } from 'jsdom';
@@ -64,10 +65,14 @@ ok(document.querySelector('.calendar') !== null, '主视图渲染日历');
 ok(document.querySelector('.cal-grid .day') !== null, '日历有日期格');
 ok(/小甜甜/.test(document.querySelector('.daka-nick__name')?.textContent || ''), `记录昵称（${document.querySelector('.daka-nick__name')?.textContent}）`);
 ok(ui.profile && ui.profile.nickname === '小甜甜', '当前档案昵称正确');
+// 进入后默认带一个任务（每日打卡）
+ok(document.querySelector('.task-bar') !== null, '主视图渲染任务切换条');
+ok(/每日打卡/.test(document.querySelector('.task-bar__name')?.textContent || ''), `默认任务名展示（${document.querySelector('.task-bar__name')?.textContent}）`);
 
-// ---------- 4) 今天格子可点击打卡 → 状态切换 + 统计更新 ----------
+// ---------- 4) 今天格子可点击打卡（直点，无需确认） → 状态切换 + 统计更新 ----------
 const todayCell0 = document.querySelector(`.day[data-iso="${iso(TODAY)}"]`);
 ok(todayCell0 !== null, '今天的日历格存在');
+ok(todayCell0.classList.contains('is-past') === false, '今天格不是过去日');
 ok(!todayCell0.classList.contains('is-checked'), '今天初始未打卡');
 todayCell0.click();
 await sleep(8);
@@ -76,20 +81,41 @@ const todayCell = document.querySelector(`.day[data-iso="${iso(TODAY)}"]`);
 ok(todayCell && todayCell.classList.contains('is-checked'), '点击后今天已打卡');
 ok(document.querySelector('.today-card').classList.contains('is-checked'), '今日卡片同步为已打卡');
 ok(document.querySelectorAll('.stat__num')[0]?.textContent === '1', `累计天数=1（${document.querySelectorAll('.stat__num')[0]?.textContent}）`);
-// 今日大按钮同样可取消
+// 今日大按钮同样可取消（无需确认）
 document.querySelector('.today-card').click();
 await sleep(8);
 const todayCellAfter = document.querySelector(`.day[data-iso="${iso(TODAY)}"]`);
 ok(todayCellAfter && !todayCellAfter.classList.contains('is-checked'), '再点今日卡取消打卡');
 ok(document.querySelectorAll('.stat__num')[0]?.textContent === '0', '取消后累计天数=0');
 
-// ---------- 5) 未来日禁用 ----------
+// ---------- 5) 过去日期需二次确认才能补卡 ----------
+const pastDate = new Date(2026, 6, 10); // 7/10，今天之前的日期
+const pastCell0 = document.querySelector(`.day[data-iso="${iso(pastDate)}"]`);
+ok(pastCell0 !== null && pastCell0.classList.contains('is-past'), '过去日带 is-past 标记');
+pastCell0.click();
+await sleep(8);
+ok(document.querySelector('.confirm') !== null, '点击过去日弹出二次确认框');
+ok(/补打卡/.test(document.querySelector('.confirm__title')?.textContent || ''), `确认框标题为补卡（${document.querySelector('.confirm__title')?.textContent}）`);
+// 先点取消 → 不应打卡
+document.querySelector('[data-act="confirm-cancel"]').click();
+await sleep(15);
+ok(document.querySelector('.confirm.is-open') === null, '取消后确认框关闭');
+ok(document.querySelector(`.day[data-iso="${iso(pastDate)}"]`)?.classList.contains('is-checked') === false, '取消后未打卡');
+// 再点过去日 → 点确认补卡 → 打卡成功
+document.querySelector(`.day[data-iso="${iso(pastDate)}"]`).click();
+await sleep(8);
+document.querySelector('[data-act="confirm-ok"]').click();
+await sleep(10);
+const pastCellAfter = document.querySelector(`.day[data-iso="${iso(pastDate)}"]`);
+ok(pastCellAfter && pastCellAfter.classList.contains('is-checked'), '确认后过去日已打卡');
+
+// ---------- 6) 未来日禁用 ----------
 const futureCell = document.querySelector(`.day[data-iso="${iso(new Date(2026, 6, 20))}"]`);
 ok(futureCell && futureCell.disabled, '未来日格子被禁用');
 const outCell = document.querySelector('.day--out'); // 上下月占位
 ok(outCell !== null, '日历含上下月占位格');
 
-// ---------- 6) 翻月 ----------
+// ---------- 7) 翻月 ----------
 const prevBtn = document.querySelector('[data-act="prev-month"]');
 const titleBefore = document.querySelector('.cal-nav__title').textContent;
 prevBtn.click();
@@ -110,14 +136,88 @@ while (!/2026 年 七月/.test(document.querySelector('.cal-nav__title')?.textCo
   await sleep(3);
 }
 
-// ---------- 7) 连击 10 天 → 第 10 天触发爱心庆祝 ----------
-// 依次点击 7/6 → 7/15 共 10 天（含今天）
+// ---------- 8) 任务管理：新建第二个任务 ----------
+document.querySelector('[data-act="task-sheet"]').click();
+await sleep(20);
+ok(document.querySelector('.sheet.is-open') !== null, '打开任务管理弹层');
+ok(document.querySelectorAll('.sheet-row').length >= 1, `任务弹层列出任务（${document.querySelectorAll('.sheet-row').length}）`);
+// 建一个「跑步」任务
+const newTaskInput = document.querySelector('[data-id="task-new-input"]');
+ok(newTaskInput !== null, '任务弹层有新建输入框');
+setVal(newTaskInput, '跑步');
+document.querySelector('[data-act="task-new"]').click();
+await sleep(15);
+ok(/跑步/.test(document.querySelector('.task-bar__name')?.textContent || ''), `新建后切到「跑步」任务（${document.querySelector('.task-bar__name')?.textContent}）`);
+ok(ui.profile.tasks['跑步'] !== undefined, '档案内已写入「跑步」任务');
+ok(ui.profile.activeTaskKey === '跑步', '当前任务为跑步');
+// 跑步任务独立，过去日的打卡应只在默认任务上（跑步累计应为 0）
+ok(document.querySelectorAll('.stat__num')[0]?.textContent === '0', '新任务累计天数=0');
+
+// ---------- 9) 切回默认任务，记录互不干扰 ----------
+document.querySelector('[data-act="task-sheet"]').click();
+await sleep(20);
+document.querySelector('[data-act="task-open"][data-key="每日打卡"]').click();
+await sleep(15);
+ok(/每日打卡/.test(document.querySelector('.task-bar__name')?.textContent || ''), '切回默认任务');
+// 默认任务此前过去日已补卡 → 累计 ≥1
+const defTotal = document.querySelectorAll('.stat__num')[0]?.textContent;
+ok(Number(defTotal) >= 1, `默认任务累计天数>=1（${defTotal}）`);
+
+// ---------- 10) 任务改名 ----------
+document.querySelector('[data-act="task-sheet"]').click();
+await sleep(20);
+document.querySelector('[data-act="task-rename"][data-key="跑步"]').click();
+await sleep(10);
+const tRenameInput = document.querySelector('[data-id="task-rename-input"]');
+ok(tRenameInput !== null, '点击任务改名展开输入框');
+setVal(tRenameInput, '晨跑');
+document.querySelector('[data-act="task-rename-ok"]').click();
+await sleep(15);
+// 改名后切到该任务，确认名称生效
+document.querySelector('[data-act="task-sheet"]').click();
+await sleep(20);
+document.querySelector('[data-act="task-open"][data-key="晨跑"]').click();
+await sleep(15);
+ok(/晨跑/.test(document.querySelector('.task-bar__name')?.textContent || ''), '任务改名生效为「晨跑」');
+
+// ---------- 11) 任务删除（二次确认，最后一个拒绝删） ----------
+document.querySelector('[data-act="task-sheet"]').click();
+await sleep(20);
+const tDelBtn = document.querySelector('[data-act="task-delete"][data-key="每日打卡"]');
+tDelBtn.click(); // 第一次：进入确认态
+await sleep(5);
+ok(tDelBtn.classList.contains('is-armed'), '首次点删除进入确认态');
+const tDelBtn2 = document.querySelector('[data-act="task-delete"][data-key="每日打卡"]');
+tDelBtn2.click(); // 第二次：真删
+await sleep(15);
+ok(ui.profile.tasks['每日打卡'] === undefined, '二次确认后默认任务被删除');
+ok(Object.keys(ui.profile.tasks).length === 1, '仅剩 1 个任务');
+// 最后一个任务的删除按钮应被禁用
+document.querySelector('[data-act="task-sheet"]').click();
+await sleep(20);
+const lastDelBtn = document.querySelector('[data-act="task-delete"][data-key="晨跑"]');
+ok(lastDelBtn && lastDelBtn.disabled, '最后一个任务的删除按钮被禁用');
+document.querySelector('[data-act="close-task-sheet"]').click();
+await sleep(15);
+
+// ---------- 12) 在当前任务上连击 10 天 → 第 10 天触发爱心庆祝 ----------
+// 切到「晨跑」并补满 7/6→7/15（过去日需确认）
+document.querySelector('[data-act="task-sheet"]').click();
+await sleep(20);
+document.querySelector('[data-act="task-open"][data-key="晨跑"]').click();
+await sleep(15);
 for (let i = 9; i >= 0; i--) {
   const d = iso(new Date(2026, 6, 15 - i));
   const cell = document.querySelector(`.day[data-iso="${d}"]`);
-  if (cell && !cell.classList.contains('is-checked')) cell.click();
-  await sleep(3);
+  if (cell && !cell.classList.contains('is-checked')) {
+    cell.click(); // 过去日 → 弹确认
+    await sleep(4);
+    const okBtn = document.querySelector('[data-act="confirm-ok"]');
+    if (okBtn) okBtn.click();
+    await sleep(4);
+  }
 }
+await sleep(5);
 ok(document.querySelectorAll('.stat__num')[0]?.textContent === '10', `累计 10 天（${document.querySelectorAll('.stat__num')[0]?.textContent}）`);
 ok(document.querySelector('.daka-nick__badge')?.textContent === '♡ 1', `爱心徽章=1（${document.querySelector('.daka-nick__badge')?.textContent}）`);
 ok(document.querySelector('[data-id="celebrate"]') !== null, '第 10 天触发庆祝动画');
@@ -130,8 +230,8 @@ ok(document.querySelector('[data-id="celebrate"]') === null, '关闭后庆祝层
 const heartsOn = document.querySelectorAll('.heart-slot.is-on').length;
 ok(heartsOn === 1, `爱心收藏区已解锁 1 颗（实际 ${heartsOn}）`);
 
-// ---------- 8) 持久化：重开实例 → 自动恢复激活档案 ----------
-const savedTotal = ui.profile.checkins.length;
+// ---------- 13) 持久化：重开实例 → 自动恢复激活档案与任务 ----------
+const savedTaskKey = ui.profile.activeTaskKey;
 ui.destroy();
 await sleep(10);
 ui = createGame(document.getElementById('game-container'));
@@ -141,9 +241,10 @@ await sleep(10);
 // 激活指针已恢复 → 直达主视图
 ok(document.querySelector('.daka-main') !== null, '重开后自动恢复激活档案进入主视图');
 ok(ui.profile && ui.profile.nickname === '小甜甜', '恢复的档案昵称正确');
-ok(ui.profile.checkins.length === savedTotal, `打卡进度持久化一致（${ui.profile.checkins.length}）`);
+ok(ui.profile.activeTaskKey === savedTaskKey, '恢复到上次的任务');
+ok(getActiveCheckins(ui) === 10, `任务打卡进度持久化一致（${getActiveCheckins(ui)}）`);
 
-// ---------- 9) 档案管理：新建第二个档案 ----------
+// ---------- 14) 档案管理（昵称级）：新建第二个档案 ----------
 document.querySelector('[data-act="sheet"]').click();
 await sleep(20);
 ok(document.querySelector('.sheet.is-open') !== null, '打开档案管理弹层');
@@ -158,7 +259,7 @@ await sleep(10);
 ok(document.querySelector('.daka-nick__name')?.textContent === '阿喵', '切换到新档案「阿喵」');
 ok(ui.profile.nickname === '阿喵', '当前档案为阿喵');
 
-// ---------- 10) 改名 ----------
+// ---------- 15) 改名 ----------
 document.querySelector('[data-act="sheet"]').click();
 await sleep(20);
 const renameBtn = document.querySelector('[data-act="sheet-rename"][data-key="阿喵"]');
@@ -173,7 +274,7 @@ await sleep(15);
 ok(document.querySelector('.daka-nick__name')?.textContent === '喵喵', '改名生效为「喵喵」');
 ok(ui.profile.nickname === '喵喵', '当前档案昵称同步更新');
 
-// ---------- 11) 删除（二次确认） ----------
+// ---------- 16) 删除（二次确认） ----------
 document.querySelector('[data-act="sheet"]').click();
 await sleep(20);
 const delBtn = document.querySelector('[data-act="sheet-delete"][data-key="喵喵"]');
@@ -196,19 +297,33 @@ ok(document.querySelector('.daka-launcher') !== null, '删除当前档案后回
 // 剩余档案「小甜甜」仍在列表
 ok([...document.querySelectorAll('.profile-item__name')].some((n) => /小甜甜/.test(n.textContent)), '删除后其它档案仍保留');
 
-// ---------- 12) 点击已有档案可继续 ----------
+// ---------- 17) 点击已有档案可继续 ----------
 document.querySelector('[data-act="open"]')?.click();
 await sleep(10);
 ok(document.querySelector('.daka-main') !== null, '点击已有档案进入主视图');
 ok(ui.profile.nickname === '小甜甜', '继续的是「小甜甜」');
 
-// ---------- 13) ESC 可关闭弹层 ----------
+// ---------- 18) ESC 可关闭弹层 ----------
 document.querySelector('[data-act="sheet"]').click();
 await sleep(20);
 window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape' }));
 await sleep(20);
 ok(document.querySelector('.sheet.is-open') === null, 'ESC 关闭档案弹层');
+// ESC 也能关二次确认框
+const pastCell2 = document.querySelector(`.day[data-iso="${iso(new Date(2026, 6, 7))}"]`);
+pastCell2.click();
+await sleep(8);
+ok(document.querySelector('.confirm.is-open') !== null, '点击过去日再次弹确认框');
+window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape' }));
+await sleep(20);
+ok(document.querySelector('.confirm.is-open') === null, 'ESC 关闭确认框');
 
 ui.destroy();
 console.log(`\n结果: ${pass} 通过, ${fail} 失败`);
 process.exit(fail ? 1 : 0);
+
+// —— 工具：取当前任务打卡数（来自内存实例）——
+function getActiveCheckins(instance) {
+  const t = instance._activeTask ? instance._activeTask() : null;
+  return t && Array.isArray(t.checkins) ? t.checkins.length : 0;
+}
diff --git a/apps/da-ka/src/config.js b/apps/da-ka/src/config.js
index 7a7033f..b44a7ca 100644
--- a/apps/da-ka/src/config.js
+++ b/apps/da-ka/src/config.js
@@ -7,6 +7,13 @@
 export const NICKNAME_MIN_LEN = 1;
 export const NICKNAME_MAX_LEN = 12;
 
+// 打卡任务约束：一个昵称下可新建多个任务（如「跑步」「读书」「早睡」），
+// 每个任务有独立的打卡记录与爱心里程碑。
+export const TASK_NAME_MIN_LEN = 1;
+export const TASK_NAME_MAX_LEN = 12;
+// 新建昵称档案时自动创建的默认任务名；旧档（无 tasks 结构）迁移时也用它兜底。
+export const DEFAULT_TASK_NAME = '每日打卡';
+
 // 每累计 HEARTS_STEP 天打卡解锁一颗爱心。第 HEARTS_STEP 倍数日触发庆祝动画。
 export const HEARTS_STEP = 10;
 
diff --git a/apps/da-ka/src/core/checkin.js b/apps/da-ka/src/core/checkin.js
index 43c77e5..e7c45d8 100644
--- a/apps/da-ka/src/core/checkin.js
+++ b/apps/da-ka/src/core/checkin.js
@@ -1,17 +1,28 @@
 // ============================================================================
-// 打卡逻辑模块（纯函数）：档案结构维护、打卡切换、连击统计、爱心里程碑。
+// 打卡逻辑模块（纯函数）：任务结构维护、打卡切换、连击统计、爱心里程碑。
 //
-// 档案结构（持久化在 store.js）：
-//   {
-//     nickname: string,          // 展示用昵称（保留原始大小写）
-//     key: string,               // 规范化 key（小写去空格），存档主键
-//     checkins: string[],        // 已打卡日期 'YYYY-MM-DD'（升序、唯一）
-//     maxHearts: number,         // 历史最高爱心数（高水位），用于防止重复庆祝
-//     createdAt: number,         // 创建时间（秒）
-//     lastSeen: number,          // 最近活跃时间（秒）
-//   }
+// 两层数据模型：
+//   1) 任务（Task）—— 打卡记录的真正归属者，结构同早期的「档案」：
+//        {
+//          name: string,        // 任务展示名（如「跑步」），保留原始大小写
+//          key: string,         // 规范化 key（小写去空格），任务在档案内的主键
+//          checkins: string[],  // 已打卡日期 'YYYY-MM-DD'（升序、唯一）
+//          maxHearts: number,   // 历史最高爱心数（高水位），防重复庆祝
+//          createdAt: number,   // 创建时间（秒）
+//        }
+//      所有打卡数学（是否打卡 / 累计 / 连击 / 爱心 / 里程碑）都作用在任务上。
+//
+//   2) 档案（Profile）—— 一个昵称容器，挂载 n 个任务：
+//        {
+//          nickname: string,    // 展示用昵称（保留原始大小写）
+//          key: string,         // 规范化昵称 key，存档主键
+//          tasks: { [taskKey]: Task },
+//          activeTaskKey: string, // 当前展示的任务
+//          createdAt: number,
+//          lastSeen: number,
+//        }
 // ============================================================================
-import { HEARTS_STEP } from '../config.js';
+import { HEARTS_STEP, DEFAULT_TASK_NAME, NICKNAME_MAX_LEN, TASK_NAME_MAX_LEN } from '../config.js';
 import { toISODate, parseISO, diffDays, prevDay } from './calendar.js';
 
 // 工具：返回「今天」的秒级时间戳；脚本环境禁止 argless new Date() 时回退为 0。
@@ -19,74 +30,75 @@ export function nowSec() {
   try { return Math.floor(Date.now() / 1000); } catch (_) { return 0; }
 }
 
-// 新建档案。checkins 默认空（不含「今天」——是否首启即打卡交由 UI 决定）。
-export function newProfile(nickname, key) {
+// ===================== 任务（打卡记录单元）=====================
+
+// 新建任务。checkins 默认空（是否首启即打卡交由 UI 决定）。
+export function newTask(name, key) {
   const ts = nowSec();
   return {
-    nickname: nickname || '未命名',
-    key: key || normalizeKey(nickname || '未命名'),
+    name: name || DEFAULT_TASK_NAME,
+    key: key || normalizeKey(name || DEFAULT_TASK_NAME),
     checkins: [],
     maxHearts: 0,
     createdAt: ts,
-    lastSeen: ts,
   };
 }
 
 // 检查某日期是否已打卡。
-export function isChecked(profile, iso) {
-  return !!profile && Array.isArray(profile.checkins) && profile.checkins.includes(iso);
+export function isChecked(task, iso) {
+  return !!task && Array.isArray(task.checkins) && task.checkins.includes(iso);
 }
 
 // 是否已打卡「今天」。
-export function isCheckedToday(profile, today) {
-  if (!profile) return false;
+export function isCheckedToday(task, today) {
+  if (!task) return false;
   const t = today instanceof Date ? today : new Date();
-  return isChecked(profile, toISODate(t));
+  return isChecked(task, toISODate(t));
 }
 
 // 累计打卡天数。
-export function totalDays(profile) {
-  return profile && Array.isArray(profile.checkins) ? profile.checkins.length : 0;
+export function totalDays(task) {
+  return task && Array.isArray(task.checkins) ? task.checkins.length : 0;
 }
 
 // 已解锁爱心数（每 HEARTS_STEP 天一颗）。
-export function heartsEarned(profile) {
-  return Math.floor(totalDays(profile) / HEARTS_STEP);
+export function heartsEarned(task) {
+  return Math.floor(totalDays(task) / HEARTS_STEP);
 }
 
 // 距下一颗爱心还差几天（1..HEARTS_STEP）。
 // 恰好整除（如第 20 天）时返回 HEARTS_STEP——即下一颗还要再打 10 天。
-export function daysToNextHeart(profile) {
-  const rem = totalDays(profile) % HEARTS_STEP;
+export function daysToNextHeart(task) {
+  const rem = totalDays(task) % HEARTS_STEP;
   return rem === 0 ? HEARTS_STEP : HEARTS_STEP - rem;
 }
 
 // 当前这颗爱心的填充进度（0..1，用于进度条）。
-export function heartProgress(profile) {
-  const rem = totalDays(profile) % HEARTS_STEP;
+export function heartProgress(task) {
+  const rem = totalDays(task) % HEARTS_STEP;
   return rem / HEARTS_STEP;
 }
 
-// 切换某日的打卡状态。
+// 切换某日的打卡状态（作用于任务）。
 // 仅接受合法的过去或今天日期；未来日直接拒绝（返回 unchanged）。
-// 返回 { profile, checked, milestone }：
-//   checked  —— 切换后该日是否处于打卡态
-//   milestone—— 本次切换是否让爱心数突破历史最高（触发庆祝，不重复庆祝已解锁爱心）
-export function toggleCheckin(profile, iso, today) {
-  if (!profile) return { profile, checked: false, milestone: false };
+// 返回 { task, checked, milestone }：
+//   checked   —— 切换后该日是否处于打卡态
+//   milestone —— 本次切换是否让爱心数突破历史最高（触发庆祝，不重复庆祝已解锁爱心）
+export function toggleCheckin(task, iso, today) {
+  if (!task) return { task, checked: false, milestone: false };
   const dt = parseISO(iso);
-  if (!dt) return { profile, checked: false, milestone: false };
+  if (!dt) return { task, checked: false, milestone: false };
   // 拒绝未来日打卡：diffDays(today, dt) > 0 表示该日在今天之后。
   const t = today instanceof Date ? today : new Date();
   if (diffDays(t, dt) > 0) {
-    return { profile, checked: isChecked(profile, iso), milestone: false };
+    return { task, checked: isChecked(task, iso), milestone: false };
   }
 
-  const set = new Set(profile.checkins || []);
+  const set = new Set(task.checkins || []);
   let milestone = false;
   // 历史最高爱心数（高水位）：仅当本次打卡让爱心数突破历史最高才算里程碑，
   // 避免「打卡到 10 → 取消一天 → 补打另一天到 10」对同一颗已解锁爱心重复庆祝。
-  let maxHearts = Number.isFinite(profile.maxHearts) ? profile.maxHearts : 0;
+  let maxHearts = Number.isFinite(task.maxHearts) ? task.maxHearts : 0;
   if (set.has(iso)) {
     set.delete(iso);
   } else {
@@ -97,15 +109,15 @@ export function toggleCheckin(profile, iso, today) {
   }
   // 升序输出，保证持久化与展示稳定。
   const checkins = [...set].sort();
-  const next = { ...profile, checkins, maxHearts, lastSeen: nowSec() };
-  return { profile: next, checked: set.has(iso), milestone };
+  const next = { ...task, checkins, maxHearts };
+  return { task: next, checked: set.has(iso), milestone };
 }
 
 // —— 连击（streak）统计 ——
 // 把 ISO 日期串去重排序为 Date 数组（非法串忽略）。
-function sortedDates(profile) {
-  if (!profile || !Array.isArray(profile.checkins)) return [];
-  const set = new Set(profile.checkins);
+function sortedDates(task) {
+  if (!task || !Array.isArray(task.checkins)) return [];
+  const set = new Set(task.checkins);
   return [...set]
     .map(parseISO)
     .filter((d) => d instanceof Date)
@@ -115,12 +127,12 @@ function sortedDates(profile) {
 // 当前连击：从今天起向前数连续打卡的天数。
 // 业界惯例：今天还没打也不算「断」，只要昨天起往前连续即可（避免一天没结束就清零）。
 // 即——若今天已打卡，连击含今天；否则从昨天起算。
-export function currentStreak(profile, today) {
-  const dates = sortedDates(profile);
+export function currentStreak(task, today) {
+  const dates = sortedDates(task);
   if (!dates.length) return 0;
   const t = today instanceof Date ? today : new Date();
   const todayISO = toISODate(t);
-  const set = new Set(profile.checkins);
+  const set = new Set(task.checkins);
   let cursor = set.has(todayISO) ? t : prevDay(t); // 今天没打则从昨天起算
   let streak = 0;
   while (set.has(toISODate(cursor))) {
@@ -131,8 +143,8 @@ export function currentStreak(profile, today) {
 }
 
 // 历史最长连击（不依赖「今天」）。
-export function longestStreak(profile) {
-  const dates = sortedDates(profile);
+export function longestStreak(task) {
+  const dates = sortedDates(task);
   if (!dates.length) return 0;
   let best = 1;
   let run = 1;
@@ -147,10 +159,131 @@ export function longestStreak(profile) {
   return Math.max(best, run);
 }
 
-// 把昵称规范化为存档主键：去首尾空白、内部连续空白压成单个下划线、转小写。
-// 这样「小 甜」「小甜」「小 甜」都归到同一档案，且保留展示用的原始字符串。
-export function normalizeKey(nickname) {
-  return String(nickname || '')
+// ===================== 档案（昵称容器）与任务管理 =====================
+
+// 新建档案：含一个默认任务，并把它设为当前任务。
+export function newProfile(nickname, key) {
+  const ts = nowSec();
+  const k = key || normalizeKey(nickname || '未命名');
+  const task = newTask(DEFAULT_TASK_NAME, normalizeKey(DEFAULT_TASK_NAME));
+  return {
+    nickname: nickname || '未命名',
+    key: k,
+    tasks: { [task.key]: task },
+    activeTaskKey: task.key,
+    createdAt: ts,
+    lastSeen: ts,
+  };
+}
+
+// 列出档案下全部任务（按创建时间升序，回退到 key，保证展示稳定）。
+export function listTasks(profile) {
+  if (!profile || !profile.tasks) return [];
+  return Object.values(profile.tasks).sort((a, b) => {
+    const ca = Number.isFinite(a.createdAt) ? a.createdAt : 0;
+    const cb = Number.isFinite(b.createdAt) ? b.createdAt : 0;
+    if (ca !== cb) return ca - cb;
+    return a.key < b.key ? -1 : 1;
+  });
+}
+
+// 按 key 取任务（不存在返回 null）。
+export function getTask(profile, taskKey) {
+  if (!profile || !profile.tasks) return null;
+  return profile.tasks[normalizeKey(taskKey)] || null;
+}
+
+// 当前激活任务。activeTaskKey 失效时回退到第一个任务，再不行返回 null。
+export function getActiveTask(profile) {
+  if (!profile || !profile.tasks) return null;
+  const keys = Object.keys(profile.tasks);
+  if (!keys.length) return null;
+  if (profile.activeTaskKey && profile.tasks[profile.activeTaskKey]) {
+    return profile.tasks[profile.activeTaskKey];
+  }
+  return profile.tasks[keys[0]];
+}
+
+// 设置当前任务（key 不存在则不改动，返回 false）。
+export function setActiveTaskKey(profile, taskKey) {
+  if (!profile || !profile.tasks) return false;
+  const k = normalizeKey(taskKey);
+  if (!profile.tasks[k]) return false;
+  profile.activeTaskKey = k;
+  return true;
+}
+
+// 新建 / 复用任务。同名（同 key）任务已存在则直接返回它（created=false）。
+// 返回 { task, created }。name 不合法时返回 { task: null, created: false }。
+export function ensureTask(profile, name) {
+  if (!profile) return { task: null, created: false };
+  if (!isValidTaskName(name)) return { task: null, created: false };
+  const norm = normalizeTaskName(name);
+  const k = normalizeKey(norm);
+  if (profile.tasks && profile.tasks[k]) {
+    return { task: profile.tasks[k], created: false };
+  }
+  if (!profile.tasks) profile.tasks = {};
+  const task = newTask(norm, k);
+  profile.tasks[k] = task;
+  profile.activeTaskKey = k; // 新建后自动切到它
+  return { task, created: true };
+}
+
+// 改任务名。同名冲突（key 变化且已被其他任务占用）或不存在时失败。
+// 返回 { ok, error }，成功时已就地迁移到新 key 并保持激活态。
+export function renameTask(profile, taskKey, newName) {
+  if (!profile || !profile.tasks) return { ok: false, error: 'no-task' };
+  const k = normalizeKey(taskKey);
+  const task = profile.tasks[k];
+  if (!task) return { ok: false, error: 'no-task' };
+  if (!isValidTaskName(newName)) return { ok: false, error: 'invalid' };
+  const norm = normalizeTaskName(newName);
+  const newKey = normalizeKey(norm);
+  task.name = norm;
+  if (newKey !== k) {
+    if (profile.tasks[newKey]) return { ok: false, error: 'dup' };
+    task.key = newKey;
+    delete profile.tasks[k];
+    profile.tasks[newKey] = task;
+    if (profile.activeTaskKey === k) profile.activeTaskKey = newKey;
+  }
+  return { ok: true, error: null };
+}
+
+// 删除任务。拒绝删除档案内的最后一个任务（保证至少有一个可打卡任务）。
+// 返回 { ok, error, profile }。成功后会自动选一个剩余任务为当前。
+export function deleteTask(profile, taskKey) {
+  if (!profile || !profile.tasks) return { ok: false, error: 'no-task' };
+  const k = normalizeKey(taskKey);
+  if (!profile.tasks[k]) return { ok: false, error: 'no-task' };
+  if (Object.keys(profile.tasks).length <= 1) return { ok: false, error: 'last' };
+  delete profile.tasks[k];
+  if (profile.activeTaskKey === k) {
+    profile.activeTaskKey = Object.keys(profile.tasks)[0];
+  }
+  return { ok: true, error: null };
+}
+
+// 档案级聚合统计（启动器展示用）：全部任务的累计天数与爱心总数。
+export function profileTotals(profile) {
+  if (!profile || !profile.tasks) return { total: 0, hearts: 0, taskCount: 0 };
+  let total = 0;
+  let hearts = 0;
+  const taskCount = Object.keys(profile.tasks).length;
+  for (const t of Object.values(profile.tasks)) {
+    total += totalDays(t);
+    hearts += heartsEarned(t);
+  }
+  return { total, hearts, taskCount };
+}
+
+// ===================== 名称规范化工具 =====================
+
+// 把名称规范化为存档主键：去首尾空白、内部连续空白压成单个下划线、转小写。
+// 昵称与任务名共用同一规范化逻辑（各自命名空间独立，互不冲突）。
+export function normalizeKey(name) {
+  return String(name || '')
     .trim()
     .replace(/\s+/g, '_')
     .toLowerCase();
@@ -169,3 +302,16 @@ export function normalizeNickname(nickname, max) {
   const chars = [...trimmed];
   return chars.slice(0, max).join('');
 }
+
+// 任务名校验（与昵称同等约束，默认上下限取 config 常量）。
+export function isValidTaskName(name, min = 1, max = TASK_NAME_MAX_LEN) {
+  return isValidNickname(name, min, max);
+}
+
+// 任务名规范化展示（与昵称同等规则）。
+export function normalizeTaskName(name, max = TASK_NAME_MAX_LEN) {
+  return normalizeNickname(name, max);
+}
+
+// 保留导出：部分老调用方（单测 / 调试）可能按昵称上限规范化，避免回归。
+export { NICKNAME_MAX_LEN };
diff --git a/apps/da-ka/src/core/store.js b/apps/da-ka/src/core/store.js
index 8ad9792..e5ad663 100644
--- a/apps/da-ka/src/core/store.js
+++ b/apps/da-ka/src/core/store.js
@@ -4,10 +4,10 @@
 // 所有档案集中存于 STORE_KEY 一个 JSON（{ [key]: profile }），
 // 当前激活昵称单独存于 ACTIVE_KEY，首启即可直达上次游玩的档案。
 // 通过 storage 访问器隔离 localStorage，便于 Node 单测注入。
-// 档案结构的规范化由 checkin.js 的 migrate 负责，本模块只做读写搬运。
+// 档案结构的规范化由本模块的 migrate 负责（含旧档→tasks 结构迁移），checkin.js 只管业务逻辑。
 // ============================================================================
-import { STORE_KEY, ACTIVE_KEY, NICKNAME_MAX_LEN } from '../config.js';
-import { normalizeKey, normalizeNickname, newProfile, nowSec } from './checkin.js';
+import { STORE_KEY, ACTIVE_KEY, NICKNAME_MAX_LEN, HEARTS_STEP, DEFAULT_TASK_NAME } from '../config.js';
+import { normalizeKey, normalizeNickname, newProfile, newTask, nowSec, profileTotals } from './checkin.js';
 import { parseISO } from './calendar.js';
 
 let storage = null;
@@ -64,16 +64,21 @@ export function setActiveKey(key) {
 }
 
 // 列举所有档案的概要（按最近活跃倒序），供启动器展示。
+// total / hearts 为该昵称下全部任务的聚合（见 checkin.profileTotals）。
 export function listProfiles() {
   const map = loadAll();
   return Object.values(map)
-    .map((p) => ({
-      key: p.key,
-      nickname: p.nickname,
-      total: p.checkins.length,
-      hearts: Math.floor(p.checkins.length / 10),
-      lastSeen: p.lastSeen || 0,
-    }))
+    .map((p) => {
+      const t = profileTotals(p);
+      return {
+        key: p.key,
+        nickname: p.nickname,
+        total: t.total,
+        hearts: t.hearts,
+        taskCount: t.taskCount,
+        lastSeen: p.lastSeen || 0,
+      };
+    })
     .sort((a, b) => (b.lastSeen || 0) - (a.lastSeen || 0));
 }
 
@@ -148,29 +153,75 @@ export function renameProfile(key, newNickname) {
   return true;
 }
 
-// 存档结构向后兼容：补齐 / 钳制字段，防止旧档或损坏档导致整页闪退。
-function migrate(p) {
-  if (!p || typeof p !== 'object') return null;
-  if (typeof p.nickname !== 'string' || !p.nickname.trim()) p.nickname = '未命名';
-  p.nickname = normalizeNickname(p.nickname, NICKNAME_MAX_LEN) || '未命名';
-  if (typeof p.key !== 'string' || !p.key) p.key = normalizeKey(p.nickname);
-  if (!Array.isArray(p.checkins)) p.checkins = [];
+// 任务结构向后兼容：补齐 / 钳制字段，过滤非法 / 重复日期。
+function migrateTask(t) {
+  if (!t || typeof t !== 'object') return null;
+  if (typeof t.name !== 'string' || !t.name.trim()) t.name = DEFAULT_TASK_NAME;
+  t.name = normalizeNickname(t.name, NICKNAME_MAX_LEN) || DEFAULT_TASK_NAME;
+  if (typeof t.key !== 'string' || !t.key) t.key = normalizeKey(t.name);
+  if (!Array.isArray(t.checkins)) t.checkins = [];
   // 仅保留合法（真实日历日）且唯一的 ISO 日期串。
   const seen = new Set();
   const clean = [];
-  for (const s of p.checkins) {
+  for (const s of t.checkins) {
     if (typeof s === 'string' && !seen.has(s) && parseISO(s)) {
       seen.add(s);
       clean.push(s);
     }
   }
-  p.checkins = clean.sort();
-  // 历史最高爱心数（高水位）：旧档无该字段时按当前进度回填，
-  // 避免升级后对已解锁爱心重复庆祝。已写入的高水位不会被这里的进度回退覆盖。
-  if (!Number.isFinite(p.maxHearts)) p.maxHearts = Math.floor(p.checkins.length / 10);
+  t.checkins = clean.sort();
+  // 历史最高爱心数（高水位）：旧任务无该字段时按当前进度回填，
+  // 避免升级后对已解锁爱心重复庆祝。已写入的高水位不会被进度回退覆盖。
+  if (!Number.isFinite(t.maxHearts)) t.maxHearts = Math.floor(t.checkins.length / HEARTS_STEP);
+  if (!Number.isFinite(t.createdAt)) t.createdAt = 0;
+  return t;
+}
+
+// 存档结构向后兼容：补齐 / 钳制字段，并把旧档（顶层 checkins）迁移进 tasks。
+// 旧档形如 { nickname, key, checkins, maxHearts } —— 把它整体收进一个默认任务，
+// 保证升级后历史打卡不丢，且统一按「昵称 → 多任务」结构处理。
+function migrate(p) {
+  if (!p || typeof p !== 'object') return null;
+  if (typeof p.nickname !== 'string' || !p.nickname.trim()) p.nickname = '未命名';
+  p.nickname = normalizeNickname(p.nickname, NICKNAME_MAX_LEN) || '未命名';
+  if (typeof p.key !== 'string' || !p.key) p.key = normalizeKey(p.nickname);
+
+  if (!p.tasks || typeof p.tasks !== 'object') {
+    // 旧档：把顶层 checkins / maxHearts 收进默认任务。
+    const tkey = normalizeKey(DEFAULT_TASK_NAME);
+    p.tasks = {};
+    p.tasks[tkey] = migrateTask({
+      name: DEFAULT_TASK_NAME,
+      key: tkey,
+      checkins: Array.isArray(p.checkins) ? p.checkins : [],
+      maxHearts: Number.isFinite(p.maxHearts) ? p.maxHearts : undefined,
+      createdAt: Number.isFinite(p.createdAt) ? p.createdAt : 0,
+    });
+    p.activeTaskKey = tkey;
+  } else {
+    // 新档：逐个规范化任务。
+    const out = {};
+    for (const k of Object.keys(p.tasks)) {
+      const t = migrateTask(p.tasks[k]);
+      if (t && t.key) out[t.key] = t;
+    }
+    // 任务全损时兜底一个默认任务，确保档案永远有可打卡单元。
+    if (Object.keys(out).length === 0) {
+      const tkey = normalizeKey(DEFAULT_TASK_NAME);
+      out[tkey] = migrateTask({ name: DEFAULT_TASK_NAME, key: tkey, checkins: [], maxHearts: 0, createdAt: 0 });
+    }
+    p.tasks = out;
+    if (!p.activeTaskKey || !out[p.activeTaskKey]) {
+      p.activeTaskKey = Object.keys(out)[0];
+    }
+  }
+  // 清理已迁入任务的旧顶层字段，避免双写造成歧义。
+  delete p.checkins;
+  delete p.maxHearts;
+
   if (!Number.isFinite(p.createdAt)) p.createdAt = 0;
   if (!Number.isFinite(p.lastSeen)) p.lastSeen = 0;
   return p;
 }
 
-export { migrate };
+export { migrate, migrateTask };
diff --git a/apps/da-ka/src/ui/app.js b/apps/da-ka/src/ui/app.js
index d9d80f5..bcc46f0 100644
--- a/apps/da-ka/src/ui/app.js
+++ b/apps/da-ka/src/ui/app.js
@@ -2,24 +2,32 @@
 // 打卡 · UI 层（纯原生 DOM，无框架）
 //
 // CheckInUI：挂在任意容器，自管理「启动器（输入昵称）/ 主视图（日历打卡）」两态。
+// 数据模型（见 core/checkin.js）：昵称档案 → 多个打卡任务 → 每任务独立打卡记录。
 // 设计要点：
 //  - 所有数据落 localStorage（store.js，按昵称归档）；UI 仅做渲染与事件分发。
-//  - 日期格子可点击打卡 / 取消（未来日禁用）；今日另有醒目大按钮。
+//  - 主视图始终展示「当前任务」的打卡数据；点任务条可切换 / 新建 / 改名 / 删除任务。
+//  - 今日另有醒目大按钮；日历今日格可直点；【过去日期】点击需二次确认才能补卡 / 取消。
 //  - 每累计 10 天触发爱心庆祝动画；爱心集陈列已解锁与未解锁占位。
 // ============================================================================
 import './style.css';
-import { NICKNAME_MIN_LEN, NICKNAME_MAX_LEN, HEARTS_STEP, WEEK_START, WEEKDAY_LABELS, MONTH_LABELS } from '../config.js';
 import {
-  newProfile, isValidNickname, normalizeNickname, normalizeKey,
-  toggleCheckin, isChecked, isCheckedToday, totalDays, heartsEarned,
+  NICKNAME_MIN_LEN, NICKNAME_MAX_LEN,
+  TASK_NAME_MIN_LEN, TASK_NAME_MAX_LEN,
+  HEARTS_STEP, WEEK_START, WEEKDAY_LABELS, MONTH_LABELS,
+} from '../config.js';
+import {
+  isValidNickname, normalizeNickname, normalizeKey,
+  toggleCheckin, isChecked, totalDays, heartsEarned,
   daysToNextHeart, heartProgress, currentStreak, longestStreak,
+  listTasks, getActiveTask, setActiveTaskKey, ensureTask, renameTask, deleteTask,
+  isValidTaskName, nowSec,
 } from '../core/checkin.js';
 import {
   _setStorage, loadAll, ensureProfile, upsertProfile, deleteProfile,
   renameProfile, listProfiles, getActiveKey, setActiveKey,
 } from '../core/store.js';
 import {
-  todayDate, toISODate, monthMatrix, isToday, isFuture, diffDays,
+  todayDate, toISODate, parseISO, monthMatrix, isToday, isFuture, diffDays,
 } from '../core/calendar.js';
 
 export class CheckInUI {
@@ -30,13 +38,17 @@ export class CheckInUI {
     const t = todayDate();
     this.view = { year: t.getFullYear(), month: t.getMonth() };
     this.today = t; // 固定为构造时的「今天」，单测可构造后改写
-    this.profile = null; // 当前激活档案
+    this.profile = null; // 当前激活档案（昵称容器）
     this._sheetOpen = false; // 档案管理弹层是否展开
+    this._taskSheetOpen = false; // 任务管理弹层是否展开
+    this._confirmOpen = false; // 二次确认弹层是否展开
     this._celebrating = false;
     // 各类延时句柄（toast / 弹层移除 / 庆祝自动收场），destroy 时统一清理。
     this._toastTimer = null;
     this._toastRemoveTimer = null;
     this._sheetTimer = null;
+    this._taskSheetTimer = null;
+    this._confirmTimer = null;
     this._celebrateTimer = null;
     this._celebrateRemoveTimer = null;
     // 暴露存档注入器，便于单测 / 调试
@@ -55,12 +67,14 @@ export class CheckInUI {
   destroy() {
     // 先停下进行中的动画 / 弹层（会各自重置状态），再统一清理所有未触发的定时器，
     // 避免回调在实例销毁后命中已移除的 DOM / 旧引用。
+    if (this._confirmOpen) this._closeConfirm(true);
+    if (this._taskSheetOpen) this._closeTaskSheet(true);
     if (this._sheetOpen) this._closeSheet(true);
     if (this._celebrating) this._endCelebrate(true);
-    for (const id of [this._toastTimer, this._toastRemoveTimer, this._sheetTimer, this._celebrateTimer, this._celebrateRemoveTimer]) {
+    for (const id of [this._toastTimer, this._toastRemoveTimer, this._sheetTimer, this._taskSheetTimer, this._confirmTimer, this._celebrateTimer, this._celebrateRemoveTimer]) {
       if (id) clearTimeout(id);
     }
-    this._toastTimer = this._toastRemoveTimer = this._sheetTimer = this._celebrateTimer = this._celebrateRemoveTimer = null;
+    this._toastTimer = this._toastRemoveTimer = this._sheetTimer = this._taskSheetTimer = this._confirmTimer = this._celebrateTimer = this._celebrateRemoveTimer = null;
     if (this._keyHandler) {
       window.removeEventListener('keydown', this._keyHandler);
       this._keyHandler = null;
@@ -69,6 +83,11 @@ export class CheckInUI {
     this.root = null;
   }
 
+  // 当前展示的任务（主视图所有打卡数据都取自它）。
+  _activeTask() {
+    return this.profile ? getActiveTask(this.profile) : null;
+  }
+
   // —— 启动时恢复上次激活的档案 ——
   _restoreActive() {
     const key = getActiveKey();
@@ -79,10 +98,11 @@ export class CheckInUI {
 
   _bindGlobal() {
     this._keyHandler = (e) => {
-      if (e.key === 'Escape') {
-        if (this._celebrating) this._endCelebrate();
-        else if (this._sheetOpen) this._closeSheet();
-      }
+      if (e.key !== 'Escape') return;
+      if (this._celebrating) this._endCelebrate();
+      else if (this._confirmOpen) this._closeConfirm();
+      else if (this._taskSheetOpen) this._closeTaskSheet();
+      else if (this._sheetOpen) this._closeSheet();
     };
     window.addEventListener('keydown', this._keyHandler);
     // 事件委托：所有点击统一在此分发，避免每次 render 重建监听。
@@ -117,7 +137,7 @@ export class CheckInUI {
         <span class="profile-item__avatar" aria-hidden="true">${esc(firstChar(p.nickname))}</span>
         <span class="profile-item__meta">
           <span class="profile-item__name">${esc(p.nickname)}</span>
-          <span class="profile-item__sub">累计 ${p.total} 天 · ${'♡'.repeat(Math.min(p.hearts, 8))}${p.hearts > 8 ? '…' : ''}</span>
+          <span class="profile-item__sub">${p.taskCount} 个任务 · 累计 ${p.total} 天 · ${'♡'.repeat(Math.min(p.hearts, 8))}${p.hearts > 8 ? '…' : ''}</span>
         </span>
         <span class="profile-item__go" aria-hidden="true">›</span>
       </button>
@@ -128,7 +148,7 @@ export class CheckInUI {
         <div class="launcher-hero">
           <div class="launcher-emoji" aria-hidden="true">♡</div>
           <h1 class="launcher-title">每日打卡</h1>
-          <p class="launcher-sub">坚持的每一天，都开出一朵小花 🌸<br/>每累计 10 天，收获一颗爱心。</p>
+          <p class="launcher-sub">坚持的每一天，都开出一朵小花 🌸<br/>一个昵称下，可建多个打卡任务。</p>
         </div>
         <form class="launcher-form" data-id="form">
           <input
@@ -154,14 +174,16 @@ export class CheckInUI {
   // ===================== 主视图 =====================
   _renderMain() {
     const p = this.profile;
+    const task = this._activeTask();
+    if (!task) return; // migrate 已保证至少一个任务，此处仅防御
     const todayISO = toISODate(this.today);
-    const checkedToday = isChecked(p, todayISO);
-    const total = totalDays(p);
-    const hearts = heartsEarned(p);
-    const streak = currentStreak(p, this.today);
-    const best = longestStreak(p);
-    const toNext = daysToNextHeart(p);
-    const progress = heartProgress(p);
+    const checkedToday = isChecked(task, todayISO);
+    const total = totalDays(task);
+    const hearts = heartsEarned(task);
+    const streak = currentStreak(task, this.today);
+    const best = longestStreak(task);
+    const toNext = daysToNextHeart(task);
+    const progress = heartProgress(task);
     const dateLabel = `${this.today.getMonth() + 1} 月 ${this.today.getDate()} 日`;
 
     this.root.insertAdjacentHTML('beforeend', `
@@ -174,6 +196,13 @@ export class CheckInUI {
           <button class="daka-switch" data-act="sheet" type="button" title="切换 / 管理档案">档案</button>
         </header>
 
+        <button class="task-bar" data-act="task-sheet" type="button" title="切换 / 管理打卡任务">
+          <span class="task-bar__icon" aria-hidden="true">✓</span>
+          <span class="task-bar__name">${esc(task.name)}</span>
+          <span class="task-bar__hint">切换任务</span>
+          <span class="task-bar__chev" aria-hidden="true">›</span>
+        </button>
+
         <div class="stats">
           <div class="stat">
             <span class="stat__num">${total}</span>
@@ -222,20 +251,22 @@ export class CheckInUI {
   _renderCalendarInner() {
     const { year, month } = this.view;
     const { cells } = monthMatrix(year, month, WEEK_START);
-    const p = this.profile;
+    const task = this._activeTask();
     const head = WEEKDAY_LABELS.map((w) => `<span class="cal-dow">${w}</span>`).join('');
     const grid = cells.map((d) => {
       const iso = toISODate(d);
       const inMonth = d.getMonth() === month;
-      const checked = isChecked(p, iso);
+      const checked = isChecked(task, iso);
       const today = isToday(d, this.today);
       const future = isFuture(d, this.today);
+      const past = diffDays(this.today, d) < 0; // 过去日：点击需二次确认
       const cls = [
         'day',
         inMonth ? '' : 'day--out',
         checked ? 'is-checked' : '',
         today ? 'is-today' : '',
         future ? 'is-future' : '',
+        past ? 'is-past' : '',
       ].filter(Boolean).join(' ');
       return `<button class="${cls}" data-act="day" data-iso="${iso}" type="button"${future ? ' disabled' : ''}>
         <span class="day__num">${d.getDate()}</span>
@@ -291,15 +322,26 @@ export class CheckInUI {
       case 'sheet-new': this._onNewFromSheet(); break;
       case 'sheet-rename': this._onSheetRename(btn.dataset.key); break;
       case 'sheet-delete': this._onSheetDelete(btn.dataset.key); break;
+      case 'task-sheet': this._openTaskSheet(); break;
+      case 'close-task-sheet': this._closeTaskSheet(); break;
+      case 'task-open': this._onTaskOpen(btn.dataset.key); break;
+      case 'task-rename': this._onTaskRename(btn.dataset.key); break;
+      case 'task-delete': this._onTaskDelete(btn.dataset.key); break;
+      case 'task-new': this._onTaskNew(); break;
+      case 'confirm-ok': this._onConfirmOk(); break;
+      case 'confirm-cancel': this._closeConfirm(); break;
       default: break;
     }
   }
 
   _onInput(e) {
     const el = e.target;
-    if (el.dataset.id === 'rename-input' || el.dataset.id === 'sheet-rename-input') {
+    if (el.dataset.id === 'rename-input'
+        || el.dataset.id === 'sheet-rename-input'
+        || el.dataset.id === 'task-rename-input'
+        || el.dataset.id === 'task-new-input') {
       // 实时截断长度，防止超长
-      const max = NICKNAME_MAX_LEN;
+      const max = el.dataset.id === 'task-rename-input' || el.dataset.id === 'task-new-input' ? TASK_NAME_MAX_LEN : NICKNAME_MAX_LEN;
       const chars = [...el.value];
       if (chars.length > max) el.value = chars.slice(0, max).join('');
     }
@@ -345,50 +387,75 @@ export class CheckInUI {
     this.render();
   }
 
-  // —— 今日大按钮：切换今日打卡 ——
+  // —— 今日大按钮：切换今日打卡（无需二次确认）——
   _onToggleToday() {
     const iso = toISODate(this.today);
     this._applyToggle(iso);
   }
 
   _onToggleDay(iso) {
-    this._applyToggle(iso);
+    if (!this.profile) return;
+    // 今日格可直点；【过去日期】需二次确认才能补卡 / 取消，避免误触改历史。
+    const dt = parseISO(iso);
+    const isPast = dt && diffDays(this.today, dt) < 0;
+    if (!isPast) {
+      this._applyToggle(iso);
+      return;
+    }
+    const task = this._activeTask();
+    const willCheck = !isChecked(task, iso);
+    const label = this._fmtISO(iso);
+    this._confirm({
+      title: willCheck ? '补打卡' : '取消打卡',
+      message: willCheck ? `确定为 ${label} 补打卡吗？` : `确定取消 ${label} 的打卡吗？`,
+      confirmText: willCheck ? '确认补卡' : '确认取消',
+      danger: !willCheck,
+      onConfirm: () => this._applyToggle(iso),
+    });
   }
 
   _applyToggle(iso) {
     if (!this.profile) return;
-    const before = isChecked(this.profile, iso);
-    const { profile, checked, milestone } = toggleCheckin(this.profile, iso, this.today);
-    this.profile = profile;
-    const saved = upsertProfile(profile);
+    const task = this._activeTask();
+    if (!task) return;
+    const before = isChecked(task, iso);
+    const { task: nextTask, checked, milestone } = toggleCheckin(task, iso, this.today);
+    // 写回档案内对应任务槽位，并刷新活跃指针 / 最近活跃时间。
+    this.profile.tasks[nextTask.key] = nextTask;
+    this.profile.activeTaskKey = nextTask.key;
+    this.profile.lastSeen = nowSec();
+    const saved = upsertProfile(this.profile);
     // 仅刷新日历格子 + 今日卡 + 统计 + 爱心 + 进度（局部刷新，体验顺滑）。
     this._refreshInteractive();
     if (milestone && checked) {
-      this._celebrate(heartsEarned(profile));
+      this._celebrate(heartsEarned(nextTask));
     } else if (checked) {
       this._toast(before ? '' : '打卡成功 ♡');
     } else {
-      this._toast('已取消今日打卡');
+      this._toast('已取消打卡');
     }
     // 持久化失败（配额满 / 隐私模式）：内存态已切换但落盘失败，提示用户避免虚假成功。
     if (!saved) this._toast('存储写入失败，请检查浏览器存储空间');
   }
 
-  // 局部刷新：日历 + 今日卡 + 统计 + 进度 + 爱心。比整页重渲染更稳。
+  // 局部刷新：任务条 + 日历 + 今日卡 + 统计 + 进度 + 爱心。比整页重渲染更稳。
   _refreshInteractive() {
-    const p = this.profile;
-    if (!p) return;
+    const task = this._activeTask();
+    if (!task) return;
     const todayISO = toISODate(this.today);
-    const checkedToday = isChecked(p, todayISO);
-    const total = totalDays(p);
-    const hearts = heartsEarned(p);
-    const streak = currentStreak(p, this.today);
-    const best = longestStreak(p);
-    const toNext = daysToNextHeart(p);
-    const progress = heartProgress(p);
+    const checkedToday = isChecked(task, todayISO);
+    const total = totalDays(task);
+    const hearts = heartsEarned(task);
+    const streak = currentStreak(task, this.today);
+    const best = longestStreak(task);
+    const toNext = daysToNextHeart(task);
+    const progress = heartProgress(task);
 
     this._refreshCalendar();
 
+    const taskName = this.root.querySelector('.task-bar__name');
+    if (taskName) taskName.textContent = task.name;
+
     const todayCard = this.root.querySelector('.today-card');
     if (todayCard) {
       todayCard.classList.toggle('is-checked', checkedToday);
@@ -442,7 +509,26 @@ export class CheckInUI {
     this._openSheet({ focusRename: this.profile.key });
   }
 
-  // ===================== 档案管理弹层 =====================
+  // 把 'YYYY-MM-DD' 格式化为「X 月 Y 日」展示。
+  _fmtISO(iso) {
+    const d = parseISO(iso);
+    if (!d) return iso;
+    return `${d.getMonth() + 1} 月 ${d.getDate()} 日`;
+  }
+
+  // 在指定弹层容器内按 act + 精确 key 查找按钮。
+  // 不把用户态 key 拼进 CSS 选择器——key 含 " \ ] 等字符会让
+  // querySelector('[data-key="…"]') 抛 SyntaxError，导致改名/删除静默失效。
+  _findBtn(container, act, key) {
+    if (!container) return null;
+    const btns = container.querySelectorAll(`[data-act="${act}"]`);
+    for (const b of btns) {
+      if (b.dataset.key === key) return b;
+    }
+    return null;
+  }
+
+  // ===================== 档案管理弹层（昵称级）=====================
   _openSheet(opts = {}) {
     this._closeSheet(true);
     const profiles = listProfiles();
@@ -454,7 +540,7 @@ export class CheckInUI {
             <span class="sheet-row__avatar" aria-hidden="true">${esc(firstChar(p.nickname))}</span>
             <span class="sheet-row__meta">
               <span class="sheet-row__name">${esc(p.nickname)}${active ? ' <em>当前</em>' : ''}</span>
-              <span class="sheet-row__sub">累计 ${p.total} 天 · ${p.hearts} 颗爱心</span>
+              <span class="sheet-row__sub">${p.taskCount} 个任务 · 累计 ${p.total} 天 · ${p.hearts} 颗爱心</span>
             </span>
           </button>
           <button class="sheet-row__icon" data-act="sheet-rename" data-key="${esc(p.key)}" type="button" title="改名" aria-label="改名">✎</button>
@@ -502,20 +588,8 @@ export class CheckInUI {
     void silent;
   }
 
-  // 在档案弹层内按 act + 精确 key 查找按钮。
-  // 不把用户态 key 拼进 CSS 选择器——key 含 " \ ] 等字符会让
-  // querySelector('[data-key="…"]') 抛 SyntaxError，导致改名/删除静默失效。
-  _findSheetBtn(act, key) {
-    if (!this._sheetEl) return null;
-    const btns = this._sheetEl.querySelectorAll(`[data-act="${act}"]`);
-    for (const b of btns) {
-      if (b.dataset.key === key) return b;
-    }
-    return null;
-  }
-
   _onSheetRename(key) {
-    const btn = this._findSheetBtn('sheet-rename', key);
+    const btn = this._findBtn(this._sheetEl, 'sheet-rename', key);
     const row = btn && btn.closest('.sheet-row');
     if (!row) return;
     if (row.querySelector('.sheet-rename')) return; // 已展开
@@ -560,7 +634,7 @@ export class CheckInUI {
     const p = map[normalizeKey(key)];
     if (!p) return;
     // 二次确认：点一次变红「确认删除」，再点一次才真删。
-    const delBtn = this._findSheetBtn('sheet-delete', key);
+    const delBtn = this._findBtn(this._sheetEl, 'sheet-delete', key);
     if (delBtn && !delBtn.classList.contains('is-armed')) {
       delBtn.classList.add('is-armed');
       delBtn.textContent = '确认?';
@@ -581,6 +655,212 @@ export class CheckInUI {
     this.render();
   }
 
+  // ===================== 任务管理弹层（任务级，挂在当前昵称下）=====================
+  _openTaskSheet() {
+    if (!this.profile) return;
+    this._closeTaskSheet(true);
+    this._renderTaskSheet();
+  }
+
+  _renderTaskSheet() {
+    const profile = this.profile;
+    const tasks = listTasks(profile);
+    const items = tasks.map((t) => {
+      const active = t.key === profile.activeTaskKey;
+      const hearts = heartsEarned(t);
+      const total = totalDays(t);
+      const last = tasks.length <= 1;
+      return `
+        <div class="sheet-row ${active ? 'is-active' : ''}">
+          <button class="sheet-row__main" data-act="task-open" data-key="${esc(t.key)}" type="button">
+            <span class="sheet-row__avatar sheet-row__avatar--task" aria-hidden="true">✓</span>
+            <span class="sheet-row__meta">
+              <span class="sheet-row__name">${esc(t.name)}${active ? ' <em>当前</em>' : ''}</span>
+              <span class="sheet-row__sub">累计 ${total} 天 · ${hearts} 颗爱心</span>
+            </span>
+          </button>
+          <button class="sheet-row__icon" data-act="task-rename" data-key="${esc(t.key)}" type="button" title="改名" aria-label="改名">✎</button>
+          <button class="sheet-row__icon sheet-row__icon--danger" data-act="task-delete" data-key="${esc(t.key)}" type="button" title="${last ? '至少保留一个任务' : '删除'}" aria-label="删除" ${last ? 'disabled' : ''}>✕</button>
+        </div>
+      `;
+    }).join('');
+    const el = document.createElement('div');
+    el.className = 'sheet';
+    el.innerHTML = `
+      <div class="sheet__backdrop" data-act="close-task-sheet"></div>
+      <div class="sheet__panel" role="dialog" aria-label="打卡任务管理">
+        <div class="sheet__head">
+          <span class="sheet__title">打卡任务</span>
+          <button class="sheet__close" data-act="close-task-sheet" type="button" aria-label="关闭">✕</button>
+        </div>
+        <div class="sheet__body">
+          ${items || '<p class="sheet__empty">还没有任务</p>'}
+        </div>
+        <div class="sheet__foot sheet__foot--form">
+          <input class="sheet__input" data-id="task-new-input" type="text" maxlength="${TASK_NAME_MAX_LEN * 2}" placeholder="新任务名（如 跑步 / 读书）" aria-label="新任务名" />
+          <button class="sheet__new" data-act="task-new" type="button">＋ 新建</button>
+        </div>
+      </div>
+    `;
+    this.root.appendChild(el);
+    this._taskSheetEl = el;
+    this._taskSheetOpen = true;
+    requestFrame(() => el.classList.add('is-open'));
+    const input = el.querySelector('[data-id="task-new-input"]');
+    if (input && !('ontouchstart' in window)) input.focus();
+  }
+
+  _closeTaskSheet(silent = false) {
+    if (!this._taskSheetEl) return;
+    const el = this._taskSheetEl;
+    this._taskSheetEl = null;
+    this._taskSheetOpen = false;
+    el.classList.remove('is-open');
+    if (this._taskSheetTimer) clearTimeout(this._taskSheetTimer);
+    this._taskSheetTimer = setTimeout(() => {
+      this._taskSheetTimer = null;
+      if (el.parentNode) el.parentNode.removeChild(el);
+    }, 200);
+    void silent;
+  }
+
+  // 切换任务后整页重渲染（数据全变了，局部刷新不如重画稳妥）。
+  _onTaskOpen(key) {
+    if (!setActiveTaskKey(this.profile, key)) { this._toast('任务不见了'); return; }
+    this.profile.lastSeen = nowSec();
+    upsertProfile(this.profile);
+    this._closeTaskSheet();
+    this.render();
+  }
+
+  _onTaskRename(key) {
+    const btn = this._findBtn(this._taskSheetEl, 'task-rename', key);
+    const row = btn && btn.closest('.sheet-row');
+    if (!row) return;
+    if (row.querySelector('.sheet-rename')) return; // 已展开
+    const nameEl = row.querySelector('.sheet-row__name');
+    const current = nameEl ? nameEl.textContent.replace(/\s*当前.*$/, '').trim() : '';
+    const wrap = document.createElement('div');
+    wrap.className = 'sheet-rename';
+    wrap.innerHTML = `
+      <input class="sheet-rename__input" data-id="task-rename-input" type="text" maxlength="${TASK_NAME_MAX_LEN * 2}" value="${esc(current)}" aria-label="新任务名" />
+      <button class="sheet-rename__ok" data-act="task-rename-ok" data-key="${esc(key)}" type="button">保存</button>
+    `;
+    row.appendChild(wrap);
+    const input = wrap.querySelector('input');
+    if (input) { input.focus(); input.select(); }
+    wrap.querySelector('.sheet-rename__ok').addEventListener('click', (e) => {
+      e.stopPropagation();
+      this._doTaskRename(key, input.value);
+    });
+  }
+
+  _doTaskRename(key, value) {
+    if (!isValidTaskName(value, TASK_NAME_MIN_LEN, TASK_NAME_MAX_LEN)) {
+      this._toast(`任务名需 ${TASK_NAME_MIN_LEN}~${TASK_NAME_MAX_LEN} 个字`);
+      return;
+    }
+    const r = renameTask(this.profile, key, value);
+    if (!r.ok) {
+      this._toast(r.error === 'dup' ? '该任务名已存在' : '改名失败');
+      return;
+    }
+    this.profile.lastSeen = nowSec();
+    upsertProfile(this.profile);
+    this._toast('已改名 ♡');
+    this._closeTaskSheet();
+    this.render();
+  }
+
+  _onTaskDelete(key) {
+    // 二次确认：点一次变红「确认删除」，再点一次才真删。
+    const delBtn = this._findBtn(this._taskSheetEl, 'task-delete', key);
+    if (delBtn && delBtn.disabled) return; // 仅剩一个任务时不允许删
+    if (delBtn && !delBtn.classList.contains('is-armed')) {
+      delBtn.classList.add('is-armed');
+      delBtn.textContent = '确认?';
+      setTimeout(() => {
+        if (delBtn.classList.contains('is-armed')) {
+          delBtn.classList.remove('is-armed');
+          delBtn.textContent = '✕';
+        }
+      }, 2200);
+      return;
+    }
+    const r = deleteTask(this.profile, key);
+    if (!r.ok) {
+      this._toast(r.error === 'last' ? '至少保留一个任务' : '删除失败');
+      return;
+    }
+    this.profile.lastSeen = nowSec();
+    upsertProfile(this.profile);
+    this._toast('已删除任务');
+    this._closeTaskSheet();
+    this.render();
+  }
+
+  _onTaskNew() {
+    const input = this._taskSheetEl && this._taskSheetEl.querySelector('[data-id="task-new-input"]');
+    const raw = input ? input.value : '';
+    if (!isValidTaskName(raw, TASK_NAME_MIN_LEN, TASK_NAME_MAX_LEN)) {
+      this._toast(`任务名需 ${TASK_NAME_MIN_LEN}~${TASK_NAME_MAX_LEN} 个字`);
+      if (input) input.focus();
+      return;
+    }
+    const { task, created } = ensureTask(this.profile, raw);
+    if (!task) { this._toast('新建失败'); return; }
+    if (!created) { this._toast('该任务已存在'); }
+    this.profile.lastSeen = nowSec();
+    upsertProfile(this.profile);
+    this._closeTaskSheet();
+    this.render();
+    if (created) this._toast(`已新建任务「${task.name}」♡`);
+  }
+
+  // ===================== 二次确认弹层（过去日期补卡 / 取消）=====================
+  _confirm({ title, message, confirmText = '确认', cancelText = '取消', danger = false, onConfirm }) {
+    this._closeConfirm(true);
+    const el = document.createElement('div');
+    el.className = 'confirm';
+    el.innerHTML = `
+      <div class="confirm__backdrop" data-act="confirm-cancel"></div>
+      <div class="confirm__panel ${danger ? 'is-danger' : ''}" role="alertdialog" aria-label="${esc(title)}">
+        <div class="confirm__title">${esc(title)}</div>
+        <div class="confirm__msg">${esc(message)}</div>
+        <div class="confirm__actions">
+          <button class="confirm__btn confirm__btn--cancel" data-act="confirm-cancel" type="button">${esc(cancelText)}</button>
+          <button class="confirm__btn confirm__btn--ok ${danger ? 'is-danger' : ''}" data-act="confirm-ok" type="button">${esc(confirmText)}</button>
+        </div>
+      </div>
+    `;
+    this.root.appendChild(el);
+    this._confirmEl = el;
+    this._confirmOpen = true;
+    this._confirmOnOk = onConfirm;
+    requestFrame(() => el.classList.add('is-open'));
+  }
+
+  _onConfirmOk() {
+    const cb = this._confirmOnOk;
+    this._closeConfirm();
+    if (typeof cb === 'function') cb();
+  }
+
+  _closeConfirm(silent = false) {
+    if (!this._confirmEl) return;
+    const el = this._confirmEl;
+    this._confirmEl = null;
+    this._confirmOpen = false;
+    this._confirmOnOk = null;
+    el.classList.remove('is-open');
+    if (this._confirmTimer) clearTimeout(this._confirmTimer);
+    this._confirmTimer = setTimeout(() => {
+      this._confirmTimer = null;
+      if (el.parentNode) el.parentNode.removeChild(el);
+    }, 200);
+    void silent;
+  }
+
   // ===================== 庆祝动画（每 10 天） =====================
   _celebrate(heartCount) {
     if (!this.root) return;
@@ -659,7 +939,7 @@ export class CheckInUI {
 }
 
 // ===================== 小工具 =====================
-// 转义 HTML，防止昵称含 < > & " 撑破 DOM / XSS。
+// 转义 HTML，防止昵称 / 任务名含 < > & " 撑破 DOM / XSS。
 function esc(s) {
   return String(s == null ? '' : s)
     .replace(/&/g, '&amp;')
diff --git a/apps/da-ka/src/ui/style.css b/apps/da-ka/src/ui/style.css
index fb53de5..c14b885 100644
--- a/apps/da-ka/src/ui/style.css
+++ b/apps/da-ka/src/ui/style.css
@@ -220,6 +220,46 @@
 }
 .daka-root .daka-switch:active { background: var(--pink-100); }
 
+/* —— 任务切换条（当前任务名 + 入口） —— */
+.daka-root .task-bar {
+  display: flex;
+  align-items: center;
+  gap: 0.55rem;
+  width: 100%;
+  padding: 0.7rem 0.9rem;
+  border: 1.5px solid var(--pink-200);
+  border-radius: 14px;
+  background: var(--white);
+  cursor: pointer;
+  box-shadow: var(--shadow);
+  transition: border-color 0.18s ease, transform 0.12s ease;
+}
+.daka-root .task-bar:active { transform: scale(0.99); }
+.daka-root .task-bar:hover { border-color: var(--pink-300); }
+.daka-root .task-bar__icon {
+  flex: none;
+  width: 28px; height: 28px;
+  border-radius: 50%;
+  background: linear-gradient(135deg, var(--pink-300), var(--pink-500));
+  color: #fff;
+  font-size: 0.85rem;
+  font-weight: 800;
+  display: flex; align-items: center; justify-content: center;
+}
+.daka-root .task-bar__name {
+  flex: 1;
+  min-width: 0;
+  font-size: 1.02rem;
+  font-weight: 700;
+  color: var(--rose);
+  white-space: nowrap;
+  overflow: hidden;
+  text-overflow: ellipsis;
+  text-align: left;
+}
+.daka-root .task-bar__hint { font-size: 0.72rem; color: var(--ink-soft); }
+.daka-root .task-bar__chev { color: var(--pink-300); font-size: 1.3rem; line-height: 1; }
+
 /* —— 统计三宫格 —— */
 .daka-root .stats {
   display: grid;
@@ -367,6 +407,8 @@
 .daka-root .day:active { transform: scale(0.93); }
 .daka-root .day--out { color: #d8b8c4; background: transparent; }
 .daka-root .day.is-future { color: #e0c3cf; background: transparent; cursor: not-allowed; }
+/* 过去日：可点但需二次确认，用虚线描边轻提示「点击会询问」。 */
+.daka-root .day.is-past:not(.is-checked) { box-shadow: inset 0 0 0 1px #f3c8d6; }
 .daka-root .day.is-today {
   box-shadow: inset 0 0 0 2px var(--pink-400);
   font-weight: 800;
@@ -522,6 +564,31 @@
   font-weight: 700; cursor: pointer;
 }
 .daka-root .sheet__foot { padding-top: 0.7rem; }
+/* 任务新建表单：输入框 + 按钮并排。 */
+.daka-root .sheet__foot--form {
+  display: flex;
+  gap: 0.5rem;
+  align-items: center;
+}
+.daka-root .sheet__input {
+  flex: 1;
+  min-width: 0;
+  padding: 0.65rem 0.8rem;
+  border: 1.5px solid var(--pink-200);
+  border-radius: 12px;
+  font-size: 0.92rem;
+  color: var(--ink);
+  outline: none;
+  background: var(--white);
+  user-select: text; -webkit-user-select: text;
+  transition: border-color 0.18s ease, box-shadow 0.18s ease;
+}
+.daka-root .sheet__input::placeholder { color: #c9a8b4; }
+.daka-root .sheet__input:focus {
+  border-color: var(--pink-400);
+  box-shadow: 0 0 0 3px rgba(255, 125, 163, 0.16);
+}
+.daka-root .sheet__foot--form .sheet__new { width: auto; flex: none; }
 .daka-root .sheet__new {
   width: 100%;
   padding: 0.7rem;
@@ -532,6 +599,10 @@
   font-weight: 700;
   cursor: pointer;
 }
+.daka-root .sheet__new:disabled { opacity: 0.5; cursor: not-allowed; }
+/* 任务行头像：勾选风的小圆，区别于昵称的首字头像。 */
+.daka-root .sheet-row__avatar--task { background: linear-gradient(135deg, var(--pink-400), var(--pink-600)); }
+.daka-root .sheet-row__icon:disabled { opacity: 0.4; cursor: not-allowed; }
 
 /* ============================================================ 庆祝动画 === */
 .daka-root .celebrate {
@@ -600,6 +671,75 @@
 }
 .daka-root .celebrate__btn:active { transform: scale(0.96); }
 
+/* ============================================================ 二次确认弹窗（过去日期补卡/取消） === */
+.daka-root .confirm {
+  position: absolute;
+  inset: 0;
+  z-index: 70;
+  display: flex;
+  align-items: center;
+  justify-content: center;
+  padding: 1.2rem;
+  background: rgba(90, 58, 68, 0);
+  pointer-events: none;
+  transition: background 0.2s ease;
+}
+.daka-root .confirm.is-open {
+  background: rgba(90, 58, 68, 0.34);
+  pointer-events: auto;
+}
+.daka-root .confirm__backdrop { position: absolute; inset: 0; }
+.daka-root .confirm__panel {
+  position: relative;
+  width: 100%;
+  max-width: 320px;
+  padding: 1.2rem 1.3rem 1.1rem;
+  background: var(--white);
+  border-radius: 22px;
+  box-shadow: var(--shadow-lg);
+  text-align: center;
+  transform: scale(0.85);
+  opacity: 0;
+  transition: transform 0.24s cubic-bezier(0.22, 1.4, 0.4, 1), opacity 0.2s ease;
+}
+.daka-root .confirm.is-open .confirm__panel { transform: scale(1); opacity: 1; }
+.daka-root .confirm__title { font-size: 1.08rem; font-weight: 800; color: var(--rose); }
+.daka-root .confirm__panel.is-danger .confirm__title { color: #e05a5a; }
+.daka-root .confirm__msg {
+  margin-top: 0.45rem;
+  font-size: 0.9rem;
+  line-height: 1.6;
+  color: var(--ink-soft);
+}
+.daka-root .confirm__actions {
+  margin-top: 1.1rem;
+  display: flex;
+  gap: 0.6rem;
+}
+.daka-root .confirm__btn {
+  flex: 1;
+  padding: 0.65rem 0.8rem;
+  border: none;
+  border-radius: 999px;
+  font-size: 0.92rem;
+  font-weight: 700;
+  cursor: pointer;
+  transition: transform 0.12s ease, filter 0.18s ease;
+}
+.daka-root .confirm__btn:active { transform: scale(0.97); }
+.daka-root .confirm__btn--cancel {
+  background: var(--pink-100);
+  color: var(--pink-600);
+}
+.daka-root .confirm__btn--ok {
+  background: linear-gradient(135deg, var(--pink-500), var(--pink-600));
+  color: #fff;
+  box-shadow: var(--shadow);
+}
+.daka-root .confirm__btn--ok.is-danger {
+  background: linear-gradient(135deg, #f08090, #e05a5a);
+}
+
 /* ============================================================ Toast === */
 .daka-root .toast-host {
   position: absolute;
diff --git a/src/main.js b/src/main.js
index 82091a7..ed2a00c 100644
--- a/src/main.js
+++ b/src/main.js
@@ -5,13 +5,17 @@ import './style.css'
 // 应用按需懒加载（动态 import），不游玩不拉取，保持落地页轻量。
 
 // 展品定义：每个应用一份，按需懒加载（动态 import），不游玩不拉取，保持落地页轻量。
+// enterLabel：展品卡片「进入」按钮的文案。游戏类用「开始游戏」，
+// 工具类（如打卡）不是游戏，沿用「开始游戏」会误导，故按展品自定义。
+// continueLabel 由 enterLabel 派生（把「开始」换成「继续」），保证文案一致。
 const APPS = {
   daka: {
     key: 'daka',
     title: '每日打卡',
     subtitle: '习惯 · 粉色日历',
     emblem: '♡',
-    desc: '粉色系打卡日历：点一点记录坚持的每一天，每累计 10 天收获一颗爱心并触发庆祝。输入昵称即可多档案存档，看你的连续打卡与爱心收藏。',
+    enterLabel: '开始打卡',
+    desc: '粉色系打卡日历：点一点记录坚持的每一天，每累计 10 天收获一颗爱心并触发庆祝。一个昵称下可建多个打卡任务，看你的连续打卡与爱心收藏。',
     loader: () => import('../apps/da-ka/src/main.js'),
   },
   dzf: {
@@ -62,6 +66,15 @@ const CATEGORIES = [
 
 const app = document.getElementById('app')
 
+// 进入按钮文案：优先取展品自定义，缺省回退「开始游戏」（游戏类）。
+function enterLabelOf(def) {
+  return (def && def.enterLabel) || '开始游戏'
+}
+// 加载完成后的「继续」文案：把「开始」替换为「继续」，与进入文案风格统一。
+function continueLabelOf(def) {
+  return enterLabelOf(def).replace('开始', '继续')
+}
+
 app.innerHTML = `
   <main class="container">
     <header>
@@ -172,9 +185,9 @@ function renderCategory(catKey) {
         </div>
       </div>
       <p class="card-desc">${g.desc}</p>
-      <button class="play-btn" data-game="${g.key}" type="button">
+      <button class="play-btn" data-game="${g.key}" data-enter-label="${enterLabelOf(g)}" type="button">
         <span class="play-btn__icon" aria-hidden="true">▶</span>
-        <span class="play-btn__label">开始游戏</span>
+        <span class="play-btn__label">${enterLabelOf(g)}</span>
       </button>
     `
     // 悬停 / 聚焦 / 触摸开始时预取，缩短点击后的等待
@@ -247,7 +260,7 @@ async function openGame(def, btn) {
     loading = false
     btn.disabled = false
     btn.classList.remove('is-loading')
-    if (game) playLabel.textContent = '继续游戏'
+    if (game) playLabel.textContent = continueLabelOf(def)
   }
 }
 
@@ -260,7 +273,8 @@ function closeGame() {
     b.disabled = false
     b.classList.remove('is-loading')
     const label = b.querySelector('.play-btn__label')
-    if (label) label.textContent = '开始游戏'
+    // 回退到按钮上记录的进入文案（每个展品可能不同），而非统一的「开始游戏」。
+    if (label) label.textContent = b.dataset.enterLabel || '开始游戏'
   })
 
   if (game) {
@@ -305,7 +319,7 @@ function handleCloseClick() {
   }
 }
 
-// 展品交互统一委托：点应用卡片上的「开始游戏」直接开玩；点大类卡片进入该大类。
+// 展品交互统一委托：点应用卡片上的「进入」按钮（文案随展品而定）直接开玩；点大类卡片进入该大类。
 exhibitList.addEventListener('click', (e) => {
   const playBtn = e.target.closest('.play-btn')
   if (playBtn) {
