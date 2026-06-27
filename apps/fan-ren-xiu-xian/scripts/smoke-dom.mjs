// DOM 冒烟测试：用 jsdom 驱动真实 UI 流程（存档选择 → 创角 → 游戏 → 人物档案 → 活力门禁 → 持久化）。
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
// 把 jsdom 的浏览器全局暴露给 Node 环境（app.js 直接使用 document/localStorage 等）
// 注意：btoa/atob 用 Node 原生全局（save.js 的 UTF-8 安全模式依赖它），不取 jsdom 版本。
for (const k of ['document', 'window', 'localStorage', 'navigator', 'HTMLElement', 'Node', 'Element', 'getComputedStyle', 'CustomEvent', 'MouseEvent', 'Event']) {
  if (window[k] === undefined) continue;
  try { globalThis[k] = window[k]; } catch (_) { /* Node 24 部分全局只读，跳过 */ }
}
globalThis.requestAnimationFrame = (fn) => setTimeout(fn, 0);

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.error('  ✗ FAIL:', m); } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// 记录最近一条 toast 文案（通过 toastWrap 的子节点变化观察）
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

// ---------- 1) 首启：存档选择页（main.js 自动挂载） ----------
localStorage.clear();
let ui = window.__FRXX; // main.js 在 #game-container 存在时自动挂载并暴露
watchToasts();
await sleep(10);
let cards = document.querySelectorAll('.slot-card');
ok(cards.length === 5, `首启展示 5 个存档槽（实际 ${cards.length}）`);
ok(document.querySelector('.launcher') !== null, '渲染存档选择启动器');
ok(window.__FRXX === ui, '暴露 __FRXX 实例');

// ---------- 2) 槽 1 新建 → 创角页 ----------
const newBtn = document.querySelector('.slot-card.empty .btn-primary');
ok(!!newBtn, '空槽有「新建角色」按钮');
newBtn.click();
await sleep(10);
ok(document.querySelector('.launcher.create') !== null, '点击新建进入创角页');
ok(document.querySelector('.portrait-big') !== null, '创角页展示形象');
ok(document.querySelector('.qiyun-bar') !== null, '气运条渲染');

// ---------- 3) 反复重随（不报错） ----------
for (let i = 0; i < 5; i++) {
  document.querySelector('.create__foot .btn-ghost')?.click(); // 🎲 重新随机
  await sleep(5);
}
ok(document.querySelector('.portrait-big') !== null, '多次重随后创角页仍正常');

// ---------- 4) 取名 + 开始修仙 → 进入游戏 ----------
const nameInput = document.querySelector('[data-id="name"]');
if (nameInput) {
  nameInput.value = '韩立';
  nameInput.dispatchEvent(new window.Event('input', { bubbles: true }));
}
document.querySelector('.create__foot .btn-primary').click(); // ⚡ 开始修仙
await sleep(10);
ok(document.querySelector('.status-bar') !== null, '开始修仙后进入游戏状态栏');
ok(document.querySelector('.avatar-btn') !== null, '状态栏有头像按钮');
ok(document.querySelector('.vit-pill') !== null, '状态栏有活力显示');
ok(ui.player && ui.player.name === '韩立', `角色名字记录正确（${ui.player?.name}）`);
ok(Array.isArray(ui.player.talentIds) && ui.player.talentIds.length >= 1, '角色拥有天赋');
ok(typeof ui.player.qiyun === 'number', '角色拥有气运值');
ok(ui.player.vitality > 0 && ui.player.maxVitality > 0, '角色初始活力已满');

// ---------- 5) 人物档案弹窗 ----------
document.querySelector('.avatar-btn').click();
await sleep(10);
ok(/人物档案/.test(document.querySelector('.sheet__head .t')?.textContent || ''), '头像按钮打开人物档案');
ok(/韩立/.test(document.querySelector('.char-name')?.textContent || ''), '人物档案显示道号');
document.querySelector('.sheet__foot .btn-ghost').click(); // 关闭
await sleep(5);

// ---------- 6) 活力门禁 ----------
const vitCost = 4; // cultivate
ui.player.vitality = 0;
ui.refreshStatus();
const beforeXp = ui.player.xp;
lastToastText = '';
ui.doActiveCultivate();
await sleep(5);
ok(ui.player.xp === beforeXp, '活力为 0 时主动修炼被阻止（修为不变）');
ok(/活力不足/.test(lastToastText), `活力不足时弹出提示（${lastToastText}）`);

// ---------- 7) 活力充足时修炼正常消耗 ----------
ui.player.vitality = 100;
ui.refreshStatus();
ui.doActiveCultivate();
await sleep(5);
ok(ui.player.vitality === 100 - vitCost, `主动修炼消耗活力（剩 ${ui.player.vitality}）`);

// ---------- 8) 持久化：重开实例后槽 1 应已占用 ----------
const slotMeta = JSON.parse(localStorage.getItem('frxx_slot_1'));
ok(slotMeta && slotMeta.name === '韩立', `槽 1 已存档（${slotMeta?.name}）`);
ui.destroy();
await sleep(10);
ui = createGame(document.getElementById('game-container'));
watchToasts();
await sleep(10);
cards = document.querySelectorAll('.slot-card');
const slot1 = cards[0];
ok(!slot1.classList.contains('empty'), '重开后槽 1 不再为空');
ok(/韩立/.test(slot1.querySelector('.slot-name')?.textContent || ''), '槽 1 卡片显示道号');

// ---------- 9) 进入已有存档 ----------
slot1.querySelector('.btn-primary').click(); // 进入
await sleep(10);
ok(ui.player && ui.player.name === '韩立', '进入已有存档加载正确');
ok(document.querySelector('.status-bar') !== null, '进入后渲染游戏界面');

// ---------- 9b) 各功能页渲染不报错 ----------
let renderErr = null;
try {
  for (const tab of ['cultivate', 'explore', 'market', 'bag', 'alchemy']) {
    ui.tab = tab;
    ui.renderPanel();
  }
} catch (e) { renderErr = e; }
ok(!renderErr, `五大功能页渲染无异常（${renderErr ? renderErr.message : 'ok'}）`);

// ---------- 9c) 设置弹窗 → 返回存档列表 ----------
ui.showSettings();
await sleep(10);
ok(/存档管理/.test(document.querySelector('.sheet__body')?.textContent || ''), '设置弹窗含存档管理');
const backBtn = [...document.querySelectorAll('.sheet__body button')].find((b) => /返回存档列表/.test(b.textContent));
ok(!!backBtn, '设置内有「返回存档列表」按钮');
backBtn.click();
await sleep(10);
ok(document.querySelectorAll('.slot-card').length === 5, '返回存档列表后重新展示 5 槽');

// ---------- 10) 删除存档 ----------
ui.destroy();
await sleep(10);
ui = createGame(document.getElementById('game-container'));
watchToasts();
await sleep(10);
const s1 = document.querySelectorAll('.slot-card')[0];
s1.querySelector('.icon-btn').click(); // 🗑️ 删除
await sleep(5);
document.querySelectorAll('.sheet__foot .btn-danger')[0]?.click(); // 确认删除
await sleep(10);
ok(document.querySelectorAll('.slot-card')[0].classList.contains('empty'), '删除后槽 1 变空');

ui.destroy();
console.log(`\n结果: ${pass} 通过, ${fail} 失败`);
process.exit(fail ? 1 : 0);
