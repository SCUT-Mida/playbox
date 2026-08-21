// ============================================================================
// DOM 冒烟测试：用 jsdom 驱动真实 UI 流程
// （启动器 → 选人+选图（锁定/解锁/天赋展示）→ 对局：掷双骰/买地弹窗/AI 回合 →
//   商店购物（含钱包条）→ 格子详情 → 存读档 → 地图解锁链 →
//   四人局 HUD 2×2 网格 / 可收缩运行记录 / 道具栏打出均富卡）。
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
const { START_CASH, MAPS, SHOP_ITEMS, tileCountOf } = await import(new URL('../src/config.js', import.meta.url).href);
const { newGame } = await import(new URL('../src/core/game.js', import.meta.url).href);
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
ok(document.querySelectorAll('.hero-perk').length === 4, '4 位主角各带天赋标签');
document.querySelectorAll('.hero-cell')[2].click(); // 剑侠
await sleep(20);
ok(/罚金减半/.test(document.querySelector('.perk-note')?.textContent || ''), '选中主角展示天赋说明');
ok(/天赋/.test(document.querySelector('.create .panel h4')?.textContent || ''), '选人面板提示天赋各异');
ok(document.querySelectorAll('.ai-toggle button')[1] !== null, 'AI 数量切换渲染');
const mapCells = document.querySelectorAll('.map-cell');
ok(mapCells.length === 6, '6 张地图卡');
ok(document.querySelectorAll('.map-cell.locked').length === 5, '5 张锁定（首图开放）');
ok(/老城市井/.test(mapCells[0].textContent || ''), '首图「老城市井」可读');
ok(/淘汰制/.test(mapCells[0].textContent || ''), '地图卡展示淘汰制说明');
ok(mapCells[1].disabled === true, '锁定图不可点');

// ---------- 3) 对局界面（72 格大棋盘 + 内街 + 腹地点缀） ----------
document.querySelector('.create .btn-primary.btn-block').click();
await sleep(60);
ok(document.querySelector('.dfw.game') !== null, '进入对局');
ok(document.querySelector('.board-view') !== null, '棋盘视口（可拖动）渲染');
const TILE_N = tileCountOf(MAPS[0]);
ok(document.querySelectorAll('.board .tile:not(.deco)').length === TILE_N, `首图 ${TILE_N} 格棋盘`);
ok(document.querySelectorAll('.board .tile.t-shop').length > 0, '棋盘上有商店格');
ok(document.querySelectorAll('.board .tile.deco').length > 0, '腹地点缀风景渲染');
ok(document.querySelector('.board-hud') !== null, '浮动信息条存在');
ok(document.querySelector('.board-pan') !== null, '平移层存在');
await sleep(60);
const panStyle = document.querySelector('.board-pan').style.transform || '';
ok(/translate3d/.test(panStyle), '镜头跟随已定位棋盘（transform）');
ok(document.querySelectorAll('.token').length === 3 && document.querySelectorAll('.token svg').length === 3, '3 枚开罗风像素棋子');
ok(document.querySelectorAll('.hud .pcard').length === 3, 'HUD 3 张玩家卡');
ok(/第 1 回合/.test(document.querySelector('.bh-hint')?.textContent || ''), '信息条显示第 1 回合（无回合上限）');

// ---------- 4) 掷骰 + 买地弹窗 ----------
function rngSeq(seed, k) {
  const out = [];
  let t = seed | 0;
  for (let i = 0; i < k; i++) {
    t = (t + 0x6d2b79f5) | 0;
    let x = Math.imul(t ^ (t >>> 15), t | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    out.push(((x ^ (x >>> 14)) >>> 0) / 4294967296);
  }
  return out;
}
// 找种子：首两掷为 1+2（非对子，共 3 步 → 落 3 号空地触发买地）
let seedRoll = 1;
for (let s = 1; s < 999999; s++) {
  const [a, b] = rngSeq(s, 2);
  if (Math.floor(a * 6) + 1 === 1 && Math.floor(b * 6) + 1 === 2) { seedRoll = s; break; }
}
ui.state.rng = seedRoll;
const rollBtn = document.querySelector('.turn-btn');
ok(rollBtn && !rollBtn.disabled, '掷骰按钮可用');
rollBtn.click();
const sheetShown = await waitFor(() => document.querySelector('.sheet') && /购买/.test(document.querySelector('.sheet__head')?.textContent || ''), 5000);
ok(sheetShown, '落到空地弹出买地弹窗');
ok(/现金/.test(document.querySelector('.wallet-row')?.textContent || ''), '买地弹窗内嵌钱包条（可见现金）');
const buyBtn = [...document.querySelectorAll('.sheet__foot button')].find((b) => /买下/.test(b.textContent));
ok(!!buyBtn, '弹窗含「买下」按钮');
buyBtn.click();
await sleep(200);
ok(document.querySelector('.sheet') === null, '买地弹窗关闭');
ok(ui.state.tiles[3].owner === 0, '3 号地已购入');
ok(ui.state.players[0].cash === START_CASH - ui.state.tiles[3].spent, '买地扣款一致');

// ---------- 5) AI 自动回合 → 回到人类回合 ----------
const humanTurn = await waitFor(() => {
  const btn = document.querySelector('.turn-btn');
  return btn && !btn.disabled;
}, 20000);
ok(humanTurn, 'AI 回合后回到人类回合（按钮恢复）');
ok(document.querySelectorAll('.log-strip .ln').length > 0, '日志有内容');

// ---------- 6) 格子详情 ----------
document.querySelector('.board .tile[data-tile="3"]').click();
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
ok(/第 \d+ 回合/.test(document.querySelector('.slots .slot-row.used')?.textContent || ''), '存档槽显示回合（无上限）');
document.querySelector('.slots .slot-row.used .btn-primary').click();
await sleep(80);
ok(document.querySelector('.dfw.game') !== null, '读档回到对局');
ok(document.querySelectorAll('.board .tile:not(.deco)').length === TILE_N, '读档棋盘完整');
ok(ui.state.tiles[3].owner === 0, '读档保留地产归属');

// ---------- 8) 商店购物 ----------
const shopTileEl = document.querySelector('.board .tile.t-shop');
ok(!!shopTileEl, '存在商店格可交互');
const shopIdx = Number(shopTileEl.dataset.tile);
ui.state.players[0].pos = shopIdx;
ui.state.phase = 'resolve';
const shopDone = ui.resolveLoop(0); // 不 await：先等弹窗出现
const shopSheetOk = await waitFor(() => document.querySelector('.sheet') && /商店/.test(document.querySelector('.sheet__head')?.textContent || ''), 5000);
ok(shopSheetOk, '落地商店弹出购物弹窗');
ok(/现金/.test(document.querySelector('.wallet-row')?.textContent || ''), '商店弹窗内嵌钱包条（购物时看得到家底）');
ok(document.querySelectorAll('.shop-item').length === SHOP_ITEMS.length, `商店陈列 ${SHOP_ITEMS.length} 件道具`);
const cashBefore = ui.state.players[0].cash;
const itemBtn = [...document.querySelectorAll('.shop-item button')].find((b) => /购买/.test(b.textContent));
itemBtn.click();
await sleep(80);
ok(ui.state.players[0].items.swift === 3, '购买顺风骰生效 3 次');
ok(ui.state.players[0].cash === cashBefore - SHOP_ITEMS[0].price, '购买道具扣款一致');
const leaveBtn = [...document.querySelectorAll('.sheet__foot button')].find((b) => /离开/.test(b.textContent));
leaveBtn.click();
await shopDone;
await sleep(50);
ok(ui.state.phase === 'end', '离开商店进入收尾');
ok(document.querySelector('.sheet') === null, '商店弹窗关闭');

// ---------- 8b) 商店弹窗点遮罩 = 离开商店（软锁回归） ----------
// 修复前：遮罩走默认 closeSheet，showShopSheet 的 Promise 永不 resolve，
// playTurn 挂起、busy 永久为 true，对局死锁。
ui.state.players[0].pos = shopIdx;
ui.state.phase = 'resolve';
const shopDone2 = ui.resolveLoop(0);
ok(await waitFor(() => document.querySelector('.sheet') && /商店/.test(document.querySelector('.sheet__head')?.textContent || ''), 5000), '再次落地商店弹出购物弹窗');
document.querySelector('.sheet-mask').click();
const shopMaskResolved = await Promise.race([shopDone2.then(() => true), sleep(2000).then(() => false)]);
ok(shopMaskResolved, '点遮罩后商店 Promise 正常 resolve（不软锁）');
ok(ui.state.phase === 'end', '点遮罩等价离开商店进入收尾');
ok(document.querySelector('.sheet') === null, '点遮罩后弹窗关闭');

// ---------- 8c) 买地弹窗点遮罩 = 放弃（同款软锁回归） ----------
const freePropIdx = ui.state.tiles.map((t, i) => (t && t.owner === -1 ? i : -1)).filter((i) => i >= 0)[0];
ui.state.players[0].pos = freePropIdx;
ui.state.phase = 'resolve';
const decDone = ui.resolveLoop(0);
ok(await waitFor(() => document.querySelector('.sheet') && /购买/.test(document.querySelector('.sheet__head')?.textContent || ''), 5000), '落到无主地弹出买地弹窗');
document.querySelector('.sheet-mask').click();
const decResolved = await Promise.race([decDone.then(() => true), sleep(2000).then(() => false)]);
ok(decResolved, '点遮罩后买地 Promise 正常 resolve（不软锁）');
ok(ui.state.phase === 'end', '点遮罩等价放弃进入收尾');
ok(document.querySelector('.sheet') === null, '点遮罩后弹窗关闭');

// ---------- 9) 地图解锁链（meta 持久化） ----------
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

// ---------- 9b) 第二张地图（及之后每张）棋盘正常渲染 ----------
// 回归：buildBoard 曾把整个 state 传给 mapDefOf，导致静默回退到第一张图的
// 72 格路径，而第二张图有 82 格 → path[i] 越界抛异常，棋盘完全渲染不出来。
for (const m of MAPS.slice(1)) {
  ui.startGame(newGame({ heroKey: 'boy', aiCount: 2, mapKey: m.key, seed: 7 }), false);
  await sleep(60);
  const tiles = document.querySelectorAll('.board .tile:not(.deco)');
  const want = tileCountOf(m);
  ok(document.querySelector('.board-view') !== null, `${m.name}：棋盘视口渲染`);
  ok(tiles.length === want, `${m.name}：棋盘 ${want} 格齐全（实际 ${tiles.length}）`);
  ok(document.querySelector('.board').style.gridTemplateColumns === `repeat(${m.cols}, 56px)`,
    `${m.name}：网格列数按本图 ${m.cols} 列生成`);
  ok(document.querySelectorAll('.token').length === 3, `${m.name}：3 枚棋子渲染`);
  ok(document.querySelector('.board-hud') !== null, `${m.name}：浮动信息条渲染`);
}

// ---------- 10) 四人局布局：HUD 2×2 网格 + 可收缩运行记录 ----------
ui.startGame(newGame({ heroKey: 'lady', aiCount: 3, mapKey: 'oldtown', seed: 31 }), false);
await sleep(80);
ok(document.querySelectorAll('.hud .pcard').length === 4, '四人局 HUD 4 张玩家卡');
ok(document.querySelector('.hud.hud--grid') !== null, '四人局 HUD 切 2×2 网格（名字/金币不再重叠）');
ok(document.querySelectorAll('.token').length === 4, '四人局 4 枚棋子');
const logStrip = document.querySelector('.log-strip');
ok(logStrip !== null && logStrip.classList.contains('collapsed'), '运行记录默认收缩');
ok(document.querySelectorAll('.log-strip .ln').length > 0, '收缩时历史日志仍全量渲染（展开可滚动翻看）');
ok(/读档继续对局/.test(document.querySelector('.log-strip__peek')?.textContent || ''), '收缩态预览最新一条日志');
logStrip.querySelector('.log-strip__head').click();
await sleep(20);
ok(!document.querySelector('.log-strip').classList.contains('collapsed'), '点击头部展开运行记录');
document.querySelector('.log-strip__head').click();
await sleep(20);
ok(document.querySelector('.log-strip').classList.contains('collapsed'), '再次点击收缩运行记录');
// 日志封顶滚动（长度恒为上限）后仍能刷新显示
const lastLn = () => document.querySelector('.log-strip .ln:last-child')?.textContent || '';
ui.state.log = Array.from({ length: 80 }, (_, k) => `L${k}`);
ui.refresh();
ok(/L79/.test(lastLn()), '日志全量渲染（末条可见）');
ui.state.log.push('L80new');
ui.state.log.splice(0, 1); // 模拟封顶：新增即截断，长度不变
ui.refresh();
ok(/L80new/.test(lastLn()), '封顶滚动后日志仍刷新（不滞留旧内容）');

// ---------- 11) 道具栏：均富卡持有 + 打出 ----------
ui.state.players[0].cash = 1000;
ui.state.players[1].cash = 3000; // 最富对手
ui.state.players[0].items.equal = 1;
ui.state.players[0].equalBought = 1;
ui.state.turnIdx = 0; ui.state.phase = 'roll'; ui.state.finished = null;
ui.refresh();
await sleep(20);
ok(/🎴1/.test(document.querySelector('.hud .pcard .pcard__items')?.textContent || ''), 'HUD 徽章显示持有的均富卡');
const itemBagBtn = document.querySelector('.bottom-bar .item-btn');
ok(!!itemBagBtn, '底栏存在道具按钮');
itemBagBtn.click();
await sleep(30);
ok(/道具栏/.test(document.querySelector('.sheet__head')?.textContent || ''), '道具栏弹窗打开');
ok(/现金/.test(document.querySelector('.wallet-row')?.textContent || ''), '道具栏显示玩家现金');
const playCardBtn = [...document.querySelectorAll('.sheet button')].find((b) => /打出/.test(b.textContent));
ok(!!playCardBtn && !playCardBtn.disabled, '均富卡「打出」按钮可用');
playCardBtn.click();
await sleep(60);
ok(ui.state.players[0].items.equal === 0, '打出后消耗均富卡');
ok(ui.state.players[0].cash === 2000 && ui.state.players[1].cash === 2000, '打出后与最富对手现金拉平');
ok(/道具栏/.test(document.querySelector('.sheet__head')?.textContent || ''), '打出后道具栏刷新（余量可见）');
[...document.querySelectorAll('.sheet__foot button')].find((b) => /关闭/.test(b.textContent))?.click();
await sleep(20);
ok(document.querySelector('.sheet') === null, '道具栏关闭');

console.log(`\nDOM 冒烟结果: ${pass} 通过, ${fail} 失败`);
process.exit(fail ? 1 : 0);
