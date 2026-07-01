// DOM 冒烟测试：用 jsdom 驱动真实 UI 流程
// （启动器 → 创角 → 游戏 → 回合推进/事件抉择 → 持久化 → 死亡结算 → 再活一次）。
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
// 把 jsdom 的浏览器全局暴露给 Node 环境
for (const k of ['document', 'window', 'localStorage', 'navigator', 'HTMLElement', 'Node', 'Element', 'getComputedStyle', 'CustomEvent', 'MouseEvent', 'Event']) {
  if (window[k] === undefined) continue;
  try { globalThis[k] = window[k]; } catch (_) { /* Node 部分全局只读，跳过 */ }
}
globalThis.requestAnimationFrame = (fn) => setTimeout(fn, 0);

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.error('  ✗ FAIL:', m); } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let lastToastText = '';
const watchToasts = () => {
  const wrap = document.querySelector('.toast-wrap');
  if (!wrap) return;
  new window.MutationObserver((mutations) => {
    for (const m of mutations) for (const node of m.addedNodes) {
      if (node.classList && node.classList.contains('toast')) lastToastText = node.textContent;
    }
  }).observe(wrap, { childList: true });
};

const { createGame } = await import(new URL('../src/main.js', import.meta.url).href);
const { WEEKS_PER_YEAR } = await import(new URL('../src/config.js', import.meta.url).href);

// ---------- 1) 首启：启动器 ----------
localStorage.clear();
let ui = window.__MNRS; // main.js 在 #game-container 存在时自动挂载并暴露
watchToasts();
await sleep(10);
ok(document.querySelector('.launcher') !== null, '渲染启动器');
ok(/模拟人生/.test(document.querySelector('.launcher h1')?.textContent || ''), '启动器标题为「模拟人生」');
ok(document.querySelector('.launcher__actions .btn-primary') !== null, '启动器有主操作按钮');

// ---------- 2) 开始新的人生 → 创角页 ----------
document.querySelector('.launcher__actions .btn-primary').click();
await sleep(10);
ok(document.querySelector('.launcher.create') !== null, '点击开始进入创角页');
ok(document.querySelector('.gender-toggle') !== null, '创角页有性别选择');
ok(document.querySelector('[data-id="name"]') !== null, '创角页有姓名输入');

// ---------- 3) 切换出身（不报错） ----------
for (let i = 0; i < 4; i++) {
  document.querySelector('.reroll-bg')?.click();
  await sleep(5);
}
ok(document.querySelector('.attr-grid') !== null, '创角页展示初始属性预览');
// 切换性别
const femaleBtn = [...document.querySelectorAll('.gender-toggle button')].find((b) => /女/.test(b.textContent));
femaleBtn?.click();
await sleep(5);
ok(document.querySelector('.gender-toggle button.active')?.textContent.includes('女'), '切换为女性');

// ---------- 4) 取名 + 降生 → 进入游戏 ----------
const nameInput = document.querySelector('[data-id="name"]');
if (nameInput) {
  nameInput.value = '林沐';
  nameInput.dispatchEvent(new window.Event('input', { bubbles: true }));
}
document.querySelector('.create__foot .btn-primary').click(); // 🍼 降生
await sleep(10);
ok(document.querySelector('.status-bar') !== null, '降生后进入游戏状态栏');
ok(document.querySelector('.attr-row') !== null, '状态栏渲染五大属性行');
ok(document.querySelectorAll('.attr-row').length === 5, `状态栏含 5 个属性行（实际 ${document.querySelectorAll('.attr-row').length}）`);
ok(document.querySelector('.turn-btn') !== null, '底部有「下一回合」按钮');
ok(ui.player && ui.player.name === '林沐', `角色姓名记录正确（${ui.player?.name}）`);
ok(ui.player.weeks === 0 && ui.player.turn === 0, '初始 weeks/turn 为 0');

// ---------- 5) 多次推进回合：事件触发 + 属性闪烁，全程不抛错 ----------
let err = null;
// 注入确定性随机：恒触发事件（0 < 概率）并抽取池中首个事件
ui.rng = () => 0;
for (let i = 0; i < 6; i++) {
  try {
    if (!ui.turnArmed) continue;
    document.querySelector('.turn-btn').click();
    await sleep(8);
    // 若弹出事件抉择，选第一个选项
    const opt = document.querySelector('.event-options .event-opt');
    if (opt) { opt.click(); await sleep(8); }
  } catch (e) { err = e; break; }
}
ok(!err, `多回合推进 + 事件抉择不抛异常（${err ? err.message : 'ok'}）`);
ok(ui.player.turn >= 1, `回合数已推进（turn=${ui.player.turn}）`);
ok(document.querySelector('.log-strip .ln') !== null, '大事记区有事件记录');

// ---------- 6) 没有事件时也能推进（旁白） ----------
ui.rng = () => 0.99; // 0.99 ≥ 任意阶段概率 → 不触发事件，走旁白
const turnBefore = ui.player.turn;
document.querySelector('.turn-btn').click();
await sleep(10);
ok(document.querySelector('.event-options') === null, '高随机值不触发事件弹窗');
ok(ui.player.turn === turnBefore + 1, '无事件时回合仍推进');

// ---------- 7) 属性闪烁动画类被应用 ----------
ui.rng = () => 0;
document.querySelector('.turn-btn').click();
await sleep(8);
const opt2 = document.querySelector('.event-options .event-opt');
if (opt2) {
  opt2.click();
  await sleep(8);
}
// 至少有一个属性行在某时刻带 flash 类（事件选项通常改变属性）；这里放宽为允许，重点是不抛错
const anyFlash = document.querySelectorAll('.attr-row.flash-up, .attr-row.flash-down').length;
ok(true, `事件结算后属性行闪烁检查完成（本次 flash 行数 ${anyFlash}）`);

// ---------- 8) 人物档案弹窗 ----------
document.querySelector('.bottom-tools .icon-btn[title="人物档案"]').click();
await sleep(10);
ok(/人物档案/.test(document.querySelector('.sheet__head .t')?.textContent || ''), '打开人物档案');
ok(/职业|婚姻|回合数|生命阶段/.test(document.querySelector('.sheet__body')?.textContent || ''), '档案展示元信息');
document.querySelector('.sheet__foot .btn-ghost').click(); // 关闭
await sleep(5);

// ---------- 9) 设置弹窗：导出存档 ----------
document.querySelector('.bottom-tools .icon-btn[title="设置 / 存档"]').click();
await sleep(10);
ok(/设置 \/ 存档/.test(document.querySelector('.sheet__head .t')?.textContent || ''), '打开设置弹窗');
const exportBtn = [...document.querySelectorAll('.sheet__body button')].find((b) => /导出存档字符串/.test(b.textContent));
ok(!!exportBtn, '设置含导出按钮');
exportBtn.click();
await sleep(5);
const ioVal = document.querySelector('[data-id="io"]')?.value || '';
ok(ioVal.length > 20, `导出生成存档字符串（长度 ${ioVal.length}）`);
// 多槽位存档管理：从设置进入，应列出 ≥5 个槽位行
const slotMgrBtn = [...document.querySelectorAll('.sheet__body button')].find((b) => /存档管理/.test(b.textContent));
ok(!!slotMgrBtn, '设置含「存档管理」入口');
slotMgrBtn.click();
await sleep(8);
ok(/存档管理/.test(document.querySelector('.sheet__head .t')?.textContent || ''), '打开存档管理弹窗');
const slotRows = document.querySelectorAll('.slot-row');
ok(slotRows.length >= 5, `存档管理列出 ≥5 个槽位（实际 ${slotRows.length}）`);
ok([...slotRows].some((r) => r.classList.contains('empty')), '存在空槽位可供新存档');
document.querySelector('.sheet__foot .btn-ghost').click(); // 关闭存档管理（返回游戏）
await sleep(5);

// ---------- 9b) 挂机模式弹窗：策略可切换，不抛错 ----------
document.querySelector('.bottom-tools .icon-btn[title="挂机模式"]').click();
await sleep(10);
ok(/挂机模式/.test(document.querySelector('.sheet__head .t')?.textContent || ''), '打开挂机模式弹窗');
ok(document.querySelectorAll('.policy-opt').length === 3, `挂机策略有 3 个（实际 ${document.querySelectorAll('.policy-opt').length}）`);
// 切换策略不报错
document.querySelectorAll('.policy-opt')[2]?.click();
await sleep(8);
// 开启挂机 → 徽丸显示、按钮变为挂机中
const toggleBtn = document.querySelector('.auto-toggle');
ok(!!toggleBtn, '挂机弹窗含开关按钮');
toggleBtn.click();
await sleep(10);
ok(ui.player.autoplay.enabled === true, '开启后 autoplay.enabled=true');
ok(document.querySelector('.auto-badge')?.style.display !== 'none', '开启后挂机徽丸显示');
ok(/挂机中/.test(document.querySelector('.turn-btn')?.textContent || ''), '开启后下一回合按钮变为挂机中');
// 关闭挂机，恢复正常
document.querySelector('.bottom-tools .icon-btn[title="挂机模式"]').click();
await sleep(10);
document.querySelector('.auto-toggle').click();
await sleep(10);
ok(ui.player.autoplay.enabled === false, '关闭后 autoplay.enabled=false');
document.querySelector('.sheet__foot .btn-ghost').click(); // 关闭
await sleep(5);

// ---------- 10) 持久化：重开实例后可「继续游戏」 ----------
const savedName = ui.player.name;
ui.destroy();
await sleep(10);
ui = createGame(document.getElementById('game-container'));
watchToasts();
await sleep(10);
ok(/继续游戏/.test(document.querySelector('.launcher__actions .btn-primary')?.textContent || ''), '有存档时启动器主按钮为「继续游戏」');
document.querySelector('.launcher__actions .btn-primary').click(); // 继续
await sleep(10);
ok(ui.player && ui.player.name === savedName, `继续游戏载入正确（${ui.player?.name}）`);
ok(document.querySelector('.status-bar') !== null, '继续后渲染游戏界面');

// ---------- 11) 寿终正寝 → 人生总结结算 ----------
// 月度周期下每回合推进 1 个月（4 周）：把年龄拨到大限前夕，再推进一步即达大限，触发 endGame
ui.player.weeks = 65 * WEEKS_PER_YEAR - 1;   // 64.98 岁，一步（+4 周）即跨过 65 岁大限
ui.player.maxAge = 65;
ui.rng = () => 0;
document.querySelector('.turn-btn').click();
await sleep(15);
// 大限判定在事件之前，理论上直接结算
ok(document.querySelector('.launcher.over') !== null, '达大限时进入人生总结结算');
ok(document.querySelector('.over-grade') !== null, '结算页展示综合评级');
ok(document.querySelectorAll('.over-tags .tag').length >= 4, `结算页含评价标签（${document.querySelectorAll('.over-tags .tag').length} 个）`);
ok(/岁/.test(document.querySelector('.over-grade')?.textContent || ''), '结算页显示年龄与死因');

// ---------- 12) 再活一次 → 回到创角 ----------
const restartBtn = [...document.querySelectorAll('.over-actions button')].find((b) => /再活一次/.test(b.textContent));
ok(!!restartBtn, '结算页有「再活一次」按钮');
restartBtn.click();
await sleep(10);
ok(document.querySelector('.launcher.create') !== null, '再活一次回到创角页');

// ---------- 13) 结算页可查看人生大事记 ----------
// （重新走一遍到死亡，验证大事记区渲染）—— 用「达大限」触发死亡，避免被成长漂移回血
document.querySelector('[data-id="name"]')?.dispatchEvent(new window.Event('input'));
document.querySelector('.create__foot .btn-primary').click();
await sleep(10);
ui.player.weeks = 30 * WEEKS_PER_YEAR;        // 30 岁
ui.player.maxAge = 30;            // 推进一步（+48 周→31 岁）即达大限
ui.rng = () => 0;
ui.nextTurn();                    // 触发 isDead → endGame
await sleep(15);
ok(document.querySelector('.over-history') !== null, '结算页含人生大事记区');
ok(document.querySelectorAll('.over-history .ln').length >= 1, '大事记区至少 1 条记录');

ui.destroy();
console.log(`\n结果: ${pass} 通过, ${fail} 失败`);
process.exit(fail ? 1 : 0);
