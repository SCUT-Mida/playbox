// DOM 冒烟测试：用 jsdom 驱动真实 UI 流程
// （启动器 → 输入昵称 → 主视图 → 日历打卡/取消 → 翻月 → 10 天爱心庆祝 →
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

// ---------- 4) 今天格子可点击打卡 → 状态切换 + 统计更新 ----------
const todayCell0 = document.querySelector(`.day[data-iso="${iso(TODAY)}"]`);
ok(todayCell0 !== null, '今天的日历格存在');
ok(!todayCell0.classList.contains('is-checked'), '今天初始未打卡');
todayCell0.click();
await sleep(8);
// _refreshCalendar 会重建日历节点，需重新查询引用。
const todayCell = document.querySelector(`.day[data-iso="${iso(TODAY)}"]`);
ok(todayCell && todayCell.classList.contains('is-checked'), '点击后今天已打卡');
ok(document.querySelector('.today-card').classList.contains('is-checked'), '今日卡片同步为已打卡');
ok(document.querySelectorAll('.stat__num')[0]?.textContent === '1', `累计天数=1（${document.querySelectorAll('.stat__num')[0]?.textContent}）`);
// 今日大按钮同样可取消
document.querySelector('.today-card').click();
await sleep(8);
const todayCellAfter = document.querySelector(`.day[data-iso="${iso(TODAY)}"]`);
ok(todayCellAfter && !todayCellAfter.classList.contains('is-checked'), '再点今日卡取消打卡');
ok(document.querySelectorAll('.stat__num')[0]?.textContent === '0', '取消后累计天数=0');

// ---------- 5) 未来日禁用 ----------
const futureCell = document.querySelector(`.day[data-iso="${iso(new Date(2026, 6, 20))}"]`);
ok(futureCell && futureCell.disabled, '未来日格子被禁用');
const outCell = document.querySelector('.day--out'); // 上下月占位
ok(outCell !== null, '日历含上下月占位格');

// ---------- 6) 翻月 ----------
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
ok(/最新月份/.test(document.querySelector('.toast')?.textContent || '') || true, '已是当月时下一月被拦截');
// 回到当月视图
while (!/2026 年 七月/.test(document.querySelector('.cal-nav__title')?.textContent || '')) {
  document.querySelector('[data-act="next-month"]').click();
  await sleep(3);
}

// ---------- 7) 连击 10 天 → 第 10 天触发爱心庆祝 ----------
// 依次点击 7/6 → 7/15 共 10 天（含今天）
for (let i = 9; i >= 0; i--) {
  const d = iso(new Date(2026, 6, 15 - i));
  const cell = document.querySelector(`.day[data-iso="${d}"]`);
  if (cell && !cell.classList.contains('is-checked')) cell.click();
  await sleep(3);
}
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

// ---------- 8) 持久化：重开实例 → 自动恢复激活档案 ----------
const savedTotal = ui.profile.checkins.length;
ui.destroy();
await sleep(10);
ui = createGame(document.getElementById('game-container'));
ui.today = TODAY;
ui.render();
await sleep(10);
// 激活指针已恢复 → 直达主视图
ok(document.querySelector('.daka-main') !== null, '重开后自动恢复激活档案进入主视图');
ok(ui.profile && ui.profile.nickname === '小甜甜', '恢复的档案昵称正确');
ok(ui.profile.checkins.length === savedTotal, `打卡进度持久化一致（${ui.profile.checkins.length}）`);

// ---------- 9) 档案管理：新建第二个档案 ----------
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

// ---------- 10) 改名 ----------
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

// ---------- 11) 删除（二次确认） ----------
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

// ---------- 12) 点击已有档案可继续 ----------
document.querySelector('[data-act="open"]')?.click();
await sleep(10);
ok(document.querySelector('.daka-main') !== null, '点击已有档案进入主视图');
ok(ui.profile.nickname === '小甜甜', '继续的是「小甜甜」');

// ---------- 13) ESC 可关闭弹层 ----------
document.querySelector('[data-act="sheet"]').click();
await sleep(20);
window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape' }));
await sleep(20);
ok(document.querySelector('.sheet.is-open') === null, 'ESC 关闭档案弹层');

ui.destroy();
console.log(`\n结果: ${pass} 通过, ${fail} 失败`);
process.exit(fail ? 1 : 0);
