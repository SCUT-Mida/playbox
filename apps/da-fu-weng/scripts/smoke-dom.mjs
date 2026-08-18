// ============================================================================
// DOM 冒烟测试：用 jsdom 驱动真实 UI 流程
// （启动器 → 选人+选图（锁定/解锁）→ 对局：掷骰/买地弹窗/AI 回合 →
//   格子详情 → 存读档 → 地图解锁链）。
// 运行：node scripts/smoke-dom.mjs   （需先 npm install jsdom）
// ============================================================================
import { JSDOM } from 'jsdom';
import { register } from 'node:module';

// 把 *.css 当作空模块（app.js 顶部 import 了样式表）
register('./_css-loader.mjs', import.meta.url);

const dom = new JSDOM('<!DOCTYPE html><div id="game-container"></div>', {
  url: 'http://localhost/',
  pretendToBeVisual: true,
});
const { window } = dom;
for (const k of ['document', 'window', 'localStorage', 'navigator', 'HTMLElement', 'Node', 'Element', 'getComputedStyle', 'CustomEvent', 'MouseEvent', 'Event', 'PointerEvent']) {
  if (window[k] === undefined) continue;
  try { globalThis[k] = window[k]; } catch (_) { /* Node 部分全局只读，跳过 */ }
}
globalThis.requestAnimationFrame = (fn) => setTimeout(fn, 0);

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.error('  ✗ FAIL:', m); } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function waitFor(fn, timeoutMs = 12000, label = 'condition') {
  const t0 = Date.now();
  while (Date.now() - t0 < timeoutMs) {
    try { if (fn()) return true; } catch (_) { /* 继续等 */ }
    await sleep(120);
  }
  return false;
}

const { createGame } = await import(new URL('../src/main.js', import.meta.url).href);
const { START_CASH, MAPS } = await import(new URL('../src/config.js', import.meta.url).href);
const { loadMeta } = await import(new URL('../src/core/meta.js', import.meta.url).href);

// ---------- 1) 启动器 ----------
localStorage.clear();
let ui = window.__DFW;
await sleep(20);
ok(!!ui, '独立运行自动挂载并暴露 __DFW');
ok(document.querySelector('.dfw.launcher') !== null, '渲染启动器');
ok(/大富翁/.test(document.querySelector('.launcher h1')?.textContent || ''), '标题为「大富翁」');

// ---------- 2) 选人 + 选图 ----------
document.querySelector('.launcher__actions .btn-primary').click();
await sleep(20);
ok(document.querySelector('.dfw.create') !== null, '进入选人页');
ok(document.querySelectorAll('.hero-cell').length === 4, '4 位主角可选');
document.querySelectorAll('.hero-cell')[2].click(); // 剑侠
await sleep(20);
ok(document.querySelectorAll('.ai-toggle button')[1] !== null, 'AI 数量切换渲染');
const mapCells = document.querySelectorAll('.map-cell');
ok(mapCells.length === 6, '6 张地图卡');
ok(document.querySelectorAll('.map-cell.locked').length === 5, '5 张锁定（首图开放）');
ok(/老城市井/.test(mapCells[0].textContent || ''), '首图「老城市井」可读');
ok(mapCells[1].disabled === true, '锁定图不可点');

// ---------- 3) 对局界面（50 格大棋盘 + 平移层） ----------
document.querySelector('.create .btn-primary.btn-block').click();
await sleep(60);
ok(document.querySelector('.dfw.game') !== null, '进入对局');
ok(document.querySelector('.board-view') !== null, '棋盘视口（可拖动）渲染');
ok(document.querySelectorAll('.board .tile').length === 50, '首图 50 格棋盘');
ok(document.querySelector('.board-pan') !== null, '平移层存在');
await sleep(60);
const panStyle = document.querySelector('.board-pan').style.transform || '';
ok(/translate3d/.test(panStyle), '镜头跟随已定位棋盘（transform）');
ok(document.querySelectorAll('.token').length === 3 && document.querySelectorAll('.token svg').length === 3, '3 枚开罗风像素棋子');
ok(document.querySelectorAll('.hud .pcard').length === 3, 'HUD 3 张玩家卡');
ok(/R1\/22/.test(document.querySelector('.center-hint')?.textContent || ''), '中央显示回合进度 R1/22');

// ---------- 4) 掷骰 + 买地弹窗 ----------
function rngFirst(seed) {
  let t = (seed + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
let seedDice1 = 1;
for (let s = 1; s < 99999; s++) { if (Math.floor(rngFirst(s) * 6) + 1 === 1) { seedDice1 = s; break; } }
ui.state.rng = seedDice1;
const rollBtn = document.querySelector('.turn-btn');
ok(rollBtn && !rollBtn.disabled, '掷骰按钮可用');
rollBtn.click();
const sheetShown = await waitFor(() => document.querySelector('.sheet') && /购买/.test(document.querySelector('.sheet__head')?.textContent || ''), 5000);
ok(sheetShown, '落到空地弹出买地弹窗');
const buyBtn = [...document.querySelectorAll('.sheet__foot button')].find((b) => /买下/.test(b.textContent));
ok(!!buyBtn, '弹窗含「买下」按钮');
buyBtn.click();
await sleep(200);
ok(document.querySelector('.sheet') === null, '买地弹窗关闭');
ok(ui.state.tiles[1].owner === 0, '1 号地已购入');
ok(ui.state.players[0].cash === START_CASH - ui.state.tiles[1].spent, '买地扣款一致');

// ---------- 5) AI 自动回合 → 回到人类回合 ----------
const humanTurn = await waitFor(() => {
  const btn = document.querySelector('.turn-btn');
  return btn && !btn.disabled;
}, 15000);
ok(humanTurn, 'AI 回合后回到人类回合（按钮恢复）');
ok(document.querySelectorAll('.log-strip .ln').length > 0, '日志有内容');

// ---------- 6) 格子详情 ----------
document.querySelector('.board .tile[data-tile="1"]').click();
await sleep(50);
const tileSheet = document.querySelector('.sheet');
ok(tileSheet && /业主/.test(tileSheet.textContent || ''), '格子详情弹窗含业主信息');
[...tileSheet.querySelectorAll('button')].find((b) => /关闭/.test(b.textContent))?.click();
await sleep(50);

// ---------- 7) 存档 / 读档 ----------
document.querySelector('.bottom-bar .icon-btn').click();
await sleep(50);
const saveBtn = [...document.querySelectorAll('.sheet button')].find((b) => b.textContent === '保存');
ok(!!saveBtn, '菜单含保存按钮');
saveBtn.click();
await sleep(50);
ok(localStorage.getItem('dfw_save_0') !== null, '自动存档写入 0 号槽');
document.querySelector('.bottom-bar .icon-btn').click();
await sleep(50);
const quitBtn = [...document.querySelectorAll('.sheet button')].find((b) => /退出对局/.test(b.textContent));
ok(!!quitBtn, '菜单含退出按钮');
quitBtn.click();
await sleep(30);
ok(document.querySelector('.dfw.launcher') !== null, '回到启动器');
ok(/剑侠/.test(document.querySelector('.slots .slot-row.used')?.textContent || ''), '存档槽显示进度');
document.querySelector('.slots .slot-row.used .btn-primary').click();
await sleep(80);
ok(document.querySelector('.dfw.game') !== null, '读档回到对局');
ok(document.querySelectorAll('.board .tile').length === 50, '读档棋盘完整');
ok(ui.state.tiles[1].owner === 0, '读档保留地产归属');

// ---------- 8) 地图解锁链（meta 持久化） ----------
// 模拟主角夺冠：直接调用解锁逻辑验证 UI 状态联动
const { unlockNext } = await import(new URL('../src/core/meta.js', import.meta.url).href);
ok(unlockNext('oldtown') === 'port', '老城夺冠解锁港都');
ok(loadMeta().unlocked.includes('port'), '解锁状态已持久化');
// 选图页应展示新解锁
document.querySelector('.bottom-bar .icon-btn').click();
await sleep(30);
[...document.querySelectorAll('.sheet button')].find((b) => /退出对局/.test(b.textContent))?.click();
await sleep(30);
document.querySelector('.launcher__actions .btn-primary').click();
await sleep(30);
ok(document.querySelectorAll('.map-cell.locked').length === 4, '选图页锁定数降为 4');
ok(/港都商埠/.test(document.querySelectorAll('.map-cell')[1].textContent || ''), '港都商埠已可读');

console.log(`\nDOM 冒烟结果: ${pass} 通过, ${fail} 失败`);
process.exit(fail ? 1 : 0);
