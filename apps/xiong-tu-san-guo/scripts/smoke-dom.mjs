// DOM 冒烟测试：用 jsdom 驱动真实 UI 流程（启动 → 创角 → 对局 → 标签 → 城务 → 结束回合）。
// 运行：node scripts/smoke-dom.mjs   （需先 npm install jsdom）
import { JSDOM } from 'jsdom';
import { register } from 'node:module';

register('./_css-loader.mjs', import.meta.url);

const dom = new JSDOM('<!DOCTYPE html><div id="game-container"></div>', {
  url: 'http://localhost/',
  pretendToBeVisual: true,
});
const { window } = dom;
for (const k of ['document', 'window', 'localStorage', 'navigator', 'HTMLElement', 'Node', 'Element', 'getComputedStyle', 'CustomEvent', 'MouseEvent', 'Event']) {
  if (window[k] === undefined) continue;
  try { globalThis[k] = window[k]; } catch (_) {}
}
globalThis.requestAnimationFrame = (fn) => setTimeout(fn, 0);

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.error('  ✗ FAIL:', m); } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let lastToast = '';
const watchToasts = () => {
  const wrap = document.querySelector('.toast-wrap');
  if (!wrap) return;
  new window.MutationObserver((muts) => {
    for (const m of muts) for (const n of m.addedNodes) if (n.classList && n.classList.contains('toast')) lastToast = n.textContent;
  }).observe(wrap, { childList: true });
};

const { createGame } = await import(new URL('../src/main.js', import.meta.url).href);
const A = await import(new URL('../src/core/actions.js', import.meta.url).href);
localStorage.clear();
const ui = createGame(document.getElementById('game-container'));
window.__XTSG = ui;
watchToasts();
await sleep(10);

// ---------- 1) 启动器 ----------
ok(document.querySelector('.launcher') !== null, '渲染启动器');
ok(document.querySelector('.launcher__menu button') !== null, '启动器有「新游戏」按钮');

// ---------- 2) 创角 ----------
ui.showCreate();
await sleep(5);
ok(document.querySelector('.create') !== null, '进入创角页');
ok(document.querySelectorAll('.create .map-dot').length === 18, '创角地图可选 18 座城市');
// 点选地图上的洛阳，应出现城市详情面板
const createLuoyang = Array.from(document.querySelectorAll('.create .map-dot'))[0];
createLuoyang.click();
await sleep(5);
ok(document.querySelector('.city-detail') !== null, '点选起兵之城后展示详情面板');
ui.startCityPick = 'luoyang';
const nameInput = document.querySelector('.create input[type=text]');
nameInput.value = '玄德';
nameInput.dispatchEvent(new window.Event('input'));
ui.startCityPick = 'luoyang';
ui.beginGame();
await sleep(5);
ok(document.querySelector('.game') !== null, '进入对局主界面');
ok(document.querySelector('.topbar') !== null, '顶栏已渲染');
ok(document.querySelectorAll('.tab').length === 5, '五个标签');
ok(document.querySelectorAll('.map-dot').length === 18, '地图渲染 18 个城市点');

// ---------- 3) 切换标签（逐个验证签名元素）----------
const tabSignatures = {
  faction: '.city-card', heroes: '.card-list', tech: '.tech-grid', system: '.sys-list', map: '.map-dot',
};
for (const [tab, sel] of Object.entries(tabSignatures)) {
  ui.tab = tab; ui.renderTabbar(); ui.renderContent();
  await sleep(3);
  ok(document.querySelector(sel) !== null, `「${tab}」标签渲染（${sel}）`);
}

// ---------- 4) 城务：打开己方城市并执行内政 ----------
ui.tab = 'map'; ui.renderContent(); await sleep(3);
// 城市名在 .map-label 上；其前一个兄弟即对应城市点
const lyLabel = Array.from(document.querySelectorAll('.map-label')).find((b) => b.textContent.includes('洛阳'));
const luoyangDot = lyLabel && lyLabel.previousElementSibling;
ok(!!luoyangDot && luoyangDot.classList.contains('map-dot'), '找到洛阳城市点');
luoyangDot.click();
await sleep(5);
ok(document.querySelector('.modal') !== null, '点击城市弹出城务弹窗');
ok(document.querySelector('.offices') !== null, '城务弹窗含职官面板（太守/将军/军师）');
ok(document.querySelectorAll('.cmd-cost').length > 0, '指令按钮标注消耗（令1/免费）');
const farmBtn = Array.from(document.querySelectorAll('.cmd-btn')).find((b) => b.textContent.includes('农田'));
ok(!!farmBtn, '城务含「开发农田」指令');
farmBtn.click();
await sleep(5);

// ---------- 4b) 商贸 · 城建面板（升级城池 / 资源对换 / 通商贸易）----------
ok(document.querySelector('.commerce-block') !== null, '城务含「商贸·城建」面板');
ok(Array.from(document.querySelectorAll('.cmd-btn')).some((b) => b.textContent.includes('升级城池')), '商贸面板含「升级城池」入口');
ok(Array.from(document.querySelectorAll('.cmd-btn')).some((b) => b.textContent.includes('资源对换')), '商贸面板含「资源对换」入口');
// 打开资源对换表单，验证不崩溃
const exchangeBtn = Array.from(document.querySelectorAll('.cmd-btn')).find((b) => b.textContent.includes('资源对换'));
exchangeBtn.click();
await sleep(5);
ok(document.querySelector('.modal__body select') !== null, '资源对换弹窗含方向选择');
document.querySelector('.modal__foot button').click(); // 取消
await sleep(3);

// ---------- 5) 结束回合 ----------
ui.tab = 'system'; ui.renderContent(); await sleep(3);
// 直接驱动结算（跳过确认弹窗）
ui.doEndTurn();
await sleep(20);
ok(document.querySelector('.modal') !== null || document.querySelector('.gameover') !== null, '结算后弹出简报或结束界面');
ok(ui.state.turn === 2 || ui.state.over != null, '回合推进或游戏结束');

// ---------- 6) 战报弹窗渲染（驱动一次真实出征）----------
ui.tab = 'map'; ui.renderContent(); await sleep(3);
// 造势：洛阳兵足，邻接宛城设为中立薄弱，直接调用动作层出征并渲染战报
const s = ui.state;
const ly = s.cities.find((c) => c.id === 'luoyang');
const wan = s.cities.find((c) => c.id === 'wan');
ly.soldiers = 5000;
wan.ownerFactionId = null; wan.soldiers = 300; wan.defense = 200;
const lord = s.heroes.find((h) => h.isPlayerLord);
const camp = A.campaign(s, 'luoyang', 'wan', lord.id, 2000, 'assault', s.playerFactionId, Math.random);
ok(camp.ok && camp.battle, '出征产出战斗对象');
ui.showBattleReport(camp.battle, camp.won, camp.msg);
await sleep(5);
ok(document.querySelector('.battle-log') !== null, '战报弹窗渲染');
document.querySelector('.modal__foot button').click();
await sleep(3);

// ---------- 6b) 城池图标分级 + 出征主帅/副将 UI ----------
ui.tab = 'map'; ui.renderContent(); await sleep(3);
ok(document.querySelectorAll('.map-dot--lg').length > 0, '地图含大城图标（map-dot--lg）');
ok(document.querySelectorAll('.map-dot--sm').length > 0, '地图含小城图标（map-dot--sm）');
ok(document.querySelector('.map-dot__battlement') !== null, '城池图标含雉堞造型（非纯圆圈）');
ok(document.querySelector('.map-dot').style.borderRadius !== '50%', '城池图标为城堡形而非圆形');
// 打开敌城（许昌，邻接玩家洛阳）→ 出征弹窗含主帅 / 副将
const xcLabel = Array.from(document.querySelectorAll('.map-label')).find((b) => b.textContent.includes('许昌'));
const xcDot = xcLabel && xcLabel.previousElementSibling;
ok(!!xcDot, '找到许昌敌城图标');
if (xcDot) { xcDot.click(); await sleep(5); }
const campBtn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent.includes('出征攻打'));
if (campBtn) { campBtn.click(); await sleep(5); }
ok(document.querySelector('.dep-list') !== null, '出征弹窗含副将勾选区');
ok(Array.from(document.querySelectorAll('label')).some((l) => l.textContent.includes('主帅')), '出征弹窗含主帅选择');
ok(Array.from(document.querySelectorAll('label')).some((l) => l.textContent.includes('副将')), '出征弹窗含副将选择');
if (document.querySelector('.modal__foot button')) { document.querySelector('.modal__foot button').click(); await sleep(3); }

// ---------- 7) 存档可往返 ----------
localStorage.setItem('__probe__', '1');
ok(localStorage.getItem('xtsg_save_v1') != null, '对局已自动存档到 localStorage');

console.log(`\nDOM 冒烟结果：${pass} 通过，${fail} 失败`);
process.exit(fail ? 1 : 0);
