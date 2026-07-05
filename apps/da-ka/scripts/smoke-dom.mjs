// DOM 冒烟测试：用 jsdom 驱动真实 UI 流程
// （启动器 → 输入昵称 → 主视图 → 任务管理：新建/切换/改名/删除 →
//   日历今日直点 / 过去日二次确认补卡 → 翻月 → 10 天爱心庆祝 →
//   持久化 → 档案管理：切换 / 改名 / 删除），全程不抛错。
// 运行：node scripts/smoke-dom.mjs   （需先 npm install jsdom）
import { JSDOM } from 'jsdom';
import { register } from 'node:module';

// 把 *.css 当作空模块（app.js 顶部 import 了样式表）
register('./_css-loader.mjs', import.meta.url);

const dom = new JSDOM('<!DOCTYPE html><div id="game-container"></div>', {
  url: 'http://localhost/',
  pretendToBeVisual: true,
});
const { window } = dom;
for (const k of ['document', 'window', 'localStorage', 'navigator', 'HTMLElement', 'Node', 'Element', 'getComputedStyle', 'CustomEvent', 'MouseEvent', 'Event', 'KeyboardEvent']) {
  if (window[k] === undefined) continue;
  try { globalThis[k] = window[k]; } catch (_) { /* Node 部分全局只读，跳过 */ }
}
globalThis.requestAnimationFrame = (fn) => setTimeout(fn, 0);

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.error('  ✗ FAIL:', m); } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// 固定「今天」为 2026-07-15，确保当月内有足够过去日可点出 10 连击。
const TODAY = new Date(2026, 6, 15);
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const { createGame } = await import(new URL('../src/main.js', import.meta.url).href);

// ---------- 1) 首启：启动器 ----------
localStorage.clear();
// 复用 main.js 在 #game-container 存在时自动挂载的实例（window.__DAKA），
// 避免重复 createGame 制造两个实例导致 document.querySelector 命中错误的那个。
let ui = window.__DAKA;
// 覆盖「今天」与展示月，保证后续断言稳定（mount 已渲染，需重渲染一次）
ui.today = TODAY;
ui.view = { year: TODAY.getFullYear(), month: TODAY.getMonth() };
ui.render();
await sleep(10);
ok(document.querySelector('.daka-launcher') !== null, '渲染启动器');
ok(document.querySelector('[data-id="nickname"]') !== null, '启动器有昵称输入框');
ok(document.querySelector('[data-act="start"]') !== null, '启动器有开始按钮');

// ---------- 2) 空昵称提交被拒（不进入主视图） ----------
const input = document.querySelector('[data-id="nickname"]');
const setVal = (el, v) => {
  el.value = v;
  el.dispatchEvent(new window.Event('input', { bubbles: true }));
};
const startBtn = document.querySelector('[data-act="start"]');
startBtn.click();
await sleep(5);
ok(document.querySelector('.daka-launcher') !== null, '空昵称不进入主视图');
ok(document.querySelector('.toast') !== null, '空昵称弹出 toast 提示');

// ---------- 3) 输入昵称 → 进入主视图 ----------
setVal(input, '小甜甜');
startBtn.click();
await sleep(10);
ok(document.querySelector('.daka-main') !== null, '输入昵称后进入主视图');
ok(document.querySelector('.calendar') !== null, '主视图渲染日历');
ok(document.querySelector('.cal-grid .day') !== null, '日历有日期格');
ok(/小甜甜/.test(document.querySelector('.daka-nick__name')?.textContent || ''), `记录昵称（${document.querySelector('.daka-nick__name')?.textContent}）`);
ok(ui.profile && ui.profile.nickname === '小甜甜', '当前档案昵称正确');
// 进入后默认带一个任务（每日打卡）
ok(document.querySelector('.task-bar') !== null, '主视图渲染任务切换条');
ok(/每日打卡/.test(document.querySelector('.task-bar__name')?.textContent || ''), `默认任务名展示（${document.querySelector('.task-bar__name')?.textContent}）`);

// ---------- 4) 今天格子可点击打卡（直点，无需确认） → 状态切换 + 统计更新 ----------
const todayCell0 = document.querySelector(`.day[data-iso="${iso(TODAY)}"]`);
ok(todayCell0 !== null, '今天的日历格存在');
ok(todayCell0.classList.contains('is-past') === false, '今天格不是过去日');
ok(!todayCell0.classList.contains('is-checked'), '今天初始未打卡');
todayCell0.click();
await sleep(8);
// _refreshCalendar 会重建日历节点，需重新查询引用。
const todayCell = document.querySelector(`.day[data-iso="${iso(TODAY)}"]`);
ok(todayCell && todayCell.classList.contains('is-checked'), '点击后今天已打卡');
ok(document.querySelector('.today-card').classList.contains('is-checked'), '今日卡片同步为已打卡');
ok(document.querySelectorAll('.stat__num')[0]?.textContent === '1', `累计天数=1（${document.querySelectorAll('.stat__num')[0]?.textContent}）`);
// 今日大按钮同样可取消（无需确认）
document.querySelector('.today-card').click();
await sleep(8);
const todayCellAfter = document.querySelector(`.day[data-iso="${iso(TODAY)}"]`);
ok(todayCellAfter && !todayCellAfter.classList.contains('is-checked'), '再点今日卡取消打卡');
ok(document.querySelectorAll('.stat__num')[0]?.textContent === '0', '取消后累计天数=0');

// ---------- 5) 过去日期需二次确认才能补卡 ----------
const pastDate = new Date(2026, 6, 10); // 7/10，今天之前的日期
const pastCell0 = document.querySelector(`.day[data-iso="${iso(pastDate)}"]`);
ok(pastCell0 !== null && pastCell0.classList.contains('is-past'), '过去日带 is-past 标记');
pastCell0.click();
await sleep(8);
ok(document.querySelector('.confirm') !== null, '点击过去日弹出二次确认框');
ok(/补打卡/.test(document.querySelector('.confirm__title')?.textContent || ''), `确认框标题为补卡（${document.querySelector('.confirm__title')?.textContent}）`);
// 先点取消 → 不应打卡
document.querySelector('[data-act="confirm-cancel"]').click();
await sleep(15);
ok(document.querySelector('.confirm.is-open') === null, '取消后确认框关闭');
ok(document.querySelector(`.day[data-iso="${iso(pastDate)}"]`)?.classList.contains('is-checked') === false, '取消后未打卡');
// 再点过去日 → 点确认补卡 → 打卡成功
document.querySelector(`.day[data-iso="${iso(pastDate)}"]`).click();
await sleep(8);
document.querySelector('[data-act="confirm-ok"]').click();
await sleep(10);
const pastCellAfter = document.querySelector(`.day[data-iso="${iso(pastDate)}"]`);
ok(pastCellAfter && pastCellAfter.classList.contains('is-checked'), '确认后过去日已打卡');

// ---------- 6) 未来日禁用 ----------
const futureCell = document.querySelector(`.day[data-iso="${iso(new Date(2026, 6, 20))}"]`);
ok(futureCell && futureCell.disabled, '未来日格子被禁用');
const outCell = document.querySelector('.day--out'); // 上下月占位
ok(outCell !== null, '日历含上下月占位格');

// ---------- 7) 翻月 ----------
const prevBtn = document.querySelector('[data-act="prev-month"]');
const titleBefore = document.querySelector('.cal-nav__title').textContent;
prevBtn.click();
await sleep(5);
const titleAfter = document.querySelector('.cal-nav__title').textContent;
ok(titleBefore !== titleAfter, `上一月后标题变化（${titleBefore} → ${titleAfter}）`);
// 翻回当月
document.querySelector('[data-act="next-month"]').click();
await sleep(5);
// 再往后翻应被拦（已是当月，未来月禁止）
document.querySelector('[data-act="next-month"]').click();
await sleep(5);
ok(/最新月份/.test(document.querySelector('.toast')?.textContent || ''), `已是当月时下一月被拦截并提示（toast: ${document.querySelector('.toast')?.textContent || '∅'}）`);
ok(/2026 年 七月/.test(document.querySelector('.cal-nav__title')?.textContent || ''), '视图未跳到未来月，仍停在当月');
// 回到当月视图
while (!/2026 年 七月/.test(document.querySelector('.cal-nav__title')?.textContent || '')) {
  document.querySelector('[data-act="next-month"]').click();
  await sleep(3);
}

// ---------- 8) 任务管理：新建第二个任务 ----------
document.querySelector('[data-act="task-sheet"]').click();
await sleep(20);
ok(document.querySelector('.sheet.is-open') !== null, '打开任务管理弹层');
ok(document.querySelectorAll('.sheet-row').length >= 1, `任务弹层列出任务（${document.querySelectorAll('.sheet-row').length}）`);
// 建一个「跑步」任务
const newTaskInput = document.querySelector('[data-id="task-new-input"]');
ok(newTaskInput !== null, '任务弹层有新建输入框');
setVal(newTaskInput, '跑步');
document.querySelector('[data-act="task-new"]').click();
await sleep(15);
ok(/跑步/.test(document.querySelector('.task-bar__name')?.textContent || ''), `新建后切到「跑步」任务（${document.querySelector('.task-bar__name')?.textContent}）`);
ok(ui.profile.tasks['跑步'] !== undefined, '档案内已写入「跑步」任务');
ok(ui.profile.activeTaskKey === '跑步', '当前任务为跑步');
// 跑步任务独立，过去日的打卡应只在默认任务上（跑步累计应为 0）
ok(document.querySelectorAll('.stat__num')[0]?.textContent === '0', '新任务累计天数=0');

// ---------- 9) 切回默认任务，记录互不干扰 ----------
document.querySelector('[data-act="task-sheet"]').click();
await sleep(20);
document.querySelector('[data-act="task-open"][data-key="每日打卡"]').click();
await sleep(15);
ok(/每日打卡/.test(document.querySelector('.task-bar__name')?.textContent || ''), '切回默认任务');
// 默认任务此前过去日已补卡 → 累计 ≥1
const defTotal = document.querySelectorAll('.stat__num')[0]?.textContent;
ok(Number(defTotal) >= 1, `默认任务累计天数>=1（${defTotal}）`);

// ---------- 10) 任务改名 ----------
document.querySelector('[data-act="task-sheet"]').click();
await sleep(20);
document.querySelector('[data-act="task-rename"][data-key="跑步"]').click();
await sleep(10);
const tRenameInput = document.querySelector('[data-id="task-rename-input"]');
ok(tRenameInput !== null, '点击任务改名展开输入框');
setVal(tRenameInput, '晨跑');
document.querySelector('[data-act="task-rename-ok"]').click();
await sleep(15);
// 改名后切到该任务，确认名称生效
document.querySelector('[data-act="task-sheet"]').click();
await sleep(20);
document.querySelector('[data-act="task-open"][data-key="晨跑"]').click();
await sleep(15);
ok(/晨跑/.test(document.querySelector('.task-bar__name')?.textContent || ''), '任务改名生效为「晨跑」');

// ---------- 10.5) IME 合成期不截断（保护中文拼音输入） ----------
// 回归：拼音长度超过 12 的中文任务名（如「每天读书打卡」→拼音 meitiandushudaka=16），
// 合成期 _onInput 若改写 el.value 会强制提交/取消合成段，候选窗关闭，用户看到乱码拉丁字母。
document.querySelector('[data-act="task-sheet"]').click();
await sleep(20);
const imeInput = document.querySelector('[data-id="task-new-input"]');
ok(imeInput !== null, 'IME 测试：任务新建输入框存在');
// 合成态：超长原始拉丁字符不应被截断
imeInput.value = 'meitiandushudaka'; // 16 字符 > TASK_NAME_MAX_LEN(12)
imeInput.dispatchEvent(new window.InputEvent('input', { bubbles: true, isComposing: true }));
ok(imeInput.value === 'meitiandushudaka', `合成期(isComposing=true)不截断输入（实际: ${imeInput.value}）`);
// 非合成态：同样超长值应被实时截断到 12
imeInput.value = 'meitiandushudaka';
imeInput.dispatchEvent(new window.InputEvent('input', { bubbles: true, isComposing: false }));
ok(imeInput.value === 'meitiandushu', `非合成期超长值被截断到 12（实际: ${imeInput.value}）`);
document.querySelector('[data-act="close-task-sheet"]').click();
// _closeTaskSheet 的 DOM 移除有 200ms 动画延时；等足 210ms 确保旧 sheet 节点彻底离场，
// 否则后续 section 11 重开 sheet 时旧节点仍在 DOM，querySelector 会命中旧按钮导致断言错乱。
await sleep(210);

// ---------- 11) 任务删除（二次确认，最后一个拒绝删） ----------
document.querySelector('[data-act="task-sheet"]').click();
await sleep(20);
const tDelBtn = document.querySelector('[data-act="task-delete"][data-key="每日打卡"]');
tDelBtn.click(); // 第一次：进入确认态
await sleep(5);
ok(tDelBtn.classList.contains('is-armed'), '首次点删除进入确认态');
const tDelBtn2 = document.querySelector('[data-act="task-delete"][data-key="每日打卡"]');
tDelBtn2.click(); // 第二次：真删
await sleep(15);
ok(ui.profile.tasks['每日打卡'] === undefined, '二次确认后默认任务被删除');
ok(Object.keys(ui.profile.tasks).length === 1, '仅剩 1 个任务');
// 最后一个任务的删除按钮应被禁用
document.querySelector('[data-act="task-sheet"]').click();
await sleep(20);
const lastDelBtn = document.querySelector('[data-act="task-delete"][data-key="晨跑"]');
ok(lastDelBtn && lastDelBtn.disabled, '最后一个任务的删除按钮被禁用');
document.querySelector('[data-act="close-task-sheet"]').click();
await sleep(15);

// ---------- 12) 在当前任务上连击 10 天 → 第 10 天触发爱心庆祝 ----------
// 切到「晨跑」并补满 7/6→7/15（过去日需确认）
document.querySelector('[data-act="task-sheet"]').click();
await sleep(20);
document.querySelector('[data-act="task-open"][data-key="晨跑"]').click();
await sleep(15);
for (let i = 9; i >= 0; i--) {
  const d = iso(new Date(2026, 6, 15 - i));
  const cell = document.querySelector(`.day[data-iso="${d}"]`);
  if (cell && !cell.classList.contains('is-checked')) {
    cell.click(); // 过去日 → 弹确认
    await sleep(4);
    const okBtn = document.querySelector('[data-act="confirm-ok"]');
    if (okBtn) okBtn.click();
    await sleep(4);
  }
}
await sleep(5);
ok(document.querySelectorAll('.stat__num')[0]?.textContent === '10', `累计 10 天（${document.querySelectorAll('.stat__num')[0]?.textContent}）`);
ok(document.querySelector('.daka-nick__badge')?.textContent === '♡ 1', `爱心徽章=1（${document.querySelector('.daka-nick__badge')?.textContent}）`);
ok(document.querySelector('[data-id="celebrate"]') !== null, '第 10 天触发庆祝动画');
ok(/第 10 天/.test(document.querySelector('.celebrate__title')?.textContent || ''), '庆祝文案含「第 10 天」');
// 关闭庆祝（_endCelebrate 有 300ms 移除动画，需等待足够久）
document.querySelector('[data-act="celebrate-ok"]')?.click();
await sleep(330);
ok(document.querySelector('[data-id="celebrate"]') === null, '关闭后庆祝层移除');
// 爱心收藏区有 1 颗已解锁
const heartsOn = document.querySelectorAll('.heart-slot.is-on').length;
ok(heartsOn === 1, `爱心收藏区已解锁 1 颗（实际 ${heartsOn}）`);

// ---------- 13) 持久化：重开实例 → 自动恢复激活档案与任务 ----------
const savedTaskKey = ui.profile.activeTaskKey;
ui.destroy();
await sleep(10);
ui = createGame(document.getElementById('game-container'));
ui.today = TODAY;
ui.render();
await sleep(10);
// 激活指针已恢复 → 直达主视图
ok(document.querySelector('.daka-main') !== null, '重开后自动恢复激活档案进入主视图');
ok(ui.profile && ui.profile.nickname === '小甜甜', '恢复的档案昵称正确');
ok(ui.profile.activeTaskKey === savedTaskKey, '恢复到上次的任务');
ok(getActiveCheckins(ui) === 10, `任务打卡进度持久化一致（${getActiveCheckins(ui)}）`);

// ---------- 14) 档案管理（昵称级）：新建第二个档案 ----------
document.querySelector('[data-act="sheet"]').click();
await sleep(20);
ok(document.querySelector('.sheet.is-open') !== null, '打开档案管理弹层');
ok(document.querySelectorAll('.sheet-row').length >= 1, `弹层列出档案（${document.querySelectorAll('.sheet-row').length}）`);
document.querySelector('[data-act="sheet-new"]').click();
await sleep(20);
ok(document.querySelector('.daka-launcher') !== null, '点新建档案回到启动器');
const input2 = document.querySelector('[data-id="nickname"]');
setVal(input2, '阿喵');
document.querySelector('[data-act="start"]').click();
await sleep(10);
ok(document.querySelector('.daka-nick__name')?.textContent === '阿喵', '切换到新档案「阿喵」');
ok(ui.profile.nickname === '阿喵', '当前档案为阿喵');

// ---------- 15) 改名 ----------
document.querySelector('[data-act="sheet"]').click();
await sleep(20);
const renameBtn = document.querySelector('[data-act="sheet-rename"][data-key="阿喵"]');
ok(renameBtn !== null, '弹层有改名按钮');
renameBtn.click();
await sleep(10);
const renameInput = document.querySelector('[data-id="sheet-rename-input"]');
ok(renameInput !== null, '点击改名展开输入框');
setVal(renameInput, '喵喵');
document.querySelector('[data-act="sheet-rename-ok"]').click();
await sleep(15);
ok(document.querySelector('.daka-nick__name')?.textContent === '喵喵', '改名生效为「喵喵」');
ok(ui.profile.nickname === '喵喵', '当前档案昵称同步更新');

// ---------- 16) 删除（二次确认） ----------
document.querySelector('[data-act="sheet"]').click();
await sleep(20);
const delBtn = document.querySelector('[data-act="sheet-delete"][data-key="喵喵"]');
delBtn.click();
await sleep(5);
ok(delBtn.classList.contains('is-armed'), '首次点击删除进入确认态');
await sleep(20); // 超时后应自动撤销 armed（这里仍处于待确认）
// 再次进入弹层并连续点两次完成删除
document.querySelector('[data-act="close-sheet"]').click();
await sleep(20);
document.querySelector('[data-act="sheet"]').click();
await sleep(20);
const delBtn2 = document.querySelector('[data-act="sheet-delete"][data-key="喵喵"]');
delBtn2.click();
await sleep(5);
const delBtn2b = document.querySelector('[data-act="sheet-delete"][data-key="喵喵"]');
delBtn2b.click();
await sleep(15);
ok(document.querySelector('.daka-launcher') !== null, '删除当前档案后回到启动器');
// 剩余档案「小甜甜」仍在列表
ok([...document.querySelectorAll('.profile-item__name')].some((n) => /小甜甜/.test(n.textContent)), '删除后其它档案仍保留');

// ---------- 17) 点击已有档案可继续 ----------
document.querySelector('[data-act="open"]')?.click();
await sleep(10);
ok(document.querySelector('.daka-main') !== null, '点击已有档案进入主视图');
ok(ui.profile.nickname === '小甜甜', '继续的是「小甜甜」');

// ---------- 18) ESC 可关闭弹层 ----------
document.querySelector('[data-act="sheet"]').click();
await sleep(20);
window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape' }));
await sleep(20);
ok(document.querySelector('.sheet.is-open') === null, 'ESC 关闭档案弹层');
// ESC 也能关二次确认框
const pastCell2 = document.querySelector(`.day[data-iso="${iso(new Date(2026, 6, 7))}"]`);
pastCell2.click();
await sleep(8);
ok(document.querySelector('.confirm.is-open') !== null, '点击过去日再次弹确认框');
window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape' }));
await sleep(20);
ok(document.querySelector('.confirm.is-open') === null, 'ESC 关闭确认框');

ui.destroy();
console.log(`\n结果: ${pass} 通过, ${fail} 失败`);
process.exit(fail ? 1 : 0);

// —— 工具：取当前任务打卡数（来自内存实例）——
function getActiveCheckins(instance) {
  const t = instance._activeTask ? instance._activeTask() : null;
  return t && Array.isArray(t.checkins) ? t.checkins.length : 0;
}
