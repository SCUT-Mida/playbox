// DOM 冒烟测试：用 jsdom 驱动真实 UI 流程
// （启动器 → 创角 → 地图移动 → 战斗 → 胜利 → 下层 → 背包强化/天赋 → 事件 → 存档往返 → Boss 通关结局）。
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
for (const k of ['document', 'window', 'localStorage', 'navigator', 'HTMLElement', 'Node', 'Element', 'getComputedStyle', 'CustomEvent', 'MouseEvent', 'Event']) {
  if (window[k] === undefined) continue;
  try { globalThis[k] = window[k]; } catch (_) { /* Node 部分全局只读 */ }
}
globalThis.requestAnimationFrame = (fn) => setTimeout(fn, 0);
globalThis.cancelAnimationFrame = (id) => clearTimeout(id);

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.error('  ✗ FAIL:', m); } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const { createGame } = await import(new URL('../src/main.js', import.meta.url).href);
const { isWalkable } = await import(new URL('../src/config.js', import.meta.url).href);
const { entityAt, generateFloor } = await import(new URL('../src/core/world.js', import.meta.url).href);
const { maxHp } = await import(new URL('../src/core/player.js', import.meta.url).href);

const manhattan = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
const GRID = 16;

// ---------- 1) 首启：启动器 ----------
localStorage.clear();
let ui = window.__XHLZ;
await sleep(10);
ok(document.querySelector('.launcher') !== null, '渲染启动器');
ok(/星骸旅者/.test(document.querySelector('.launcher h1')?.textContent || ''), '启动器标题为「星骸旅者」');
ok(document.querySelector('.launcher__actions .btn-primary') !== null, '启动器有主操作按钮');

// ---------- 2) 开启新旅程 → 创角页 ----------
// 用确定性 rng（=0.4）：生成开阔浮岛，战斗时恒识破「突刺」，便于稳定取胜。
ui.rng = () => 0.4;
ui.timerEnabled = false;
document.querySelector('.launcher__actions .btn-primary').click();
await sleep(10);
ok(document.querySelector('.launcher.create') !== null || document.querySelector('.create__head') !== null, '点击开始进入创角页');
ok(document.querySelector('[data-id="name"]') !== null, '创角页有姓名输入');

// ---------- 3) 取名 + 迫降 → 进入地图 ----------
const nameInput = document.querySelector('[data-id="name"]');
if (nameInput) {
  nameInput.value = '星岚';
  nameInput.dispatchEvent(new window.Event('input', { bubbles: true }));
}
document.querySelector('.create__foot .btn-primary').click();
await sleep(15);
// 创角后先呈现星图（星球线路），点击「着陆」进入当前星球的探索
ok(document.querySelector('.galaxy') !== null, '创角后呈现星图（星球线路）');
ok(document.querySelectorAll('.planet-node').length >= 4, '星图列出多颗星球航点');
const landBtn = [...document.querySelectorAll('.galaxy .btn-primary')].find((b) => /着陆/.test(b.textContent || ''));
if (landBtn) landBtn.click();
await sleep(15);
ok(document.querySelector('.xhlz-game') !== null, '着陆后进入游戏界面');
ok(document.querySelector('.status-bar') !== null, '渲染顶部状态栏');
ok(document.querySelector('.map-grid') !== null, '渲染像素地图');
ok(document.querySelectorAll('.cell').length === GRID * GRID, `地图含 ${GRID * GRID} 个地块（实际 ${document.querySelectorAll('.cell').length}）`);
ok(ui.player && ui.player.name === '星岚', `角色姓名记录正确（${ui.player?.name}）`);
ok(ui.player.floor === 1 && ui.player.floorState, '初始第 1 层且生成楼层快照');
ok(document.querySelector('.interact-btn') !== null, '底部有中央交互键');

// ---------- 4) 移动：步数推进、迷雾揭开 ----------
const turnBefore = ui.player.turn;
const stepOnce = () => {
  const st = ui.player.floorState;
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const nx = st.pos.x + dx, ny = st.pos.y + dy;
    if (nx < 0 || ny < 0 || nx >= GRID || ny >= GRID) continue;
    const ent = entityAt(st, nx, ny);
    if (ent && ent.type === 'enemy') continue;
    if (!isWalkable(st.grid[ny][nx])) continue;
    ui.tryMoveTo(nx, ny);
    return true;
  }
  return false;
};
let moved = false;
for (let i = 0; i < 6; i++) { if (ui._sheet) ui.closeModal(); if (stepOnce()) moved = true; await sleep(5); }
ok(moved && ui.player.turn > turnBefore, `移动推进步数（turn ${turnBefore}→${ui.player.turn}）`);
ok(Object.keys(ui.player.floorState.explored).length > 1, '移动揭开了迷雾');

// ---------- 5) 战斗：走到敌人旁 → 攻击 → 猜拳取胜 ----------
function nearestEnemy() {
  const st = ui.player.floorState;
  let best = null, bd = Infinity;
  for (const e of st.entities) if (e.type === 'enemy') { const d = manhattan(st.pos, e); if (d < bd) { bd = d; best = e; } }
  return best;
}
// 贪心走向敌人直到相邻（逐格，遇事件弹窗自动关闭）
function walkAdjacent(enemy) {
  const st = ui.player.floorState;
  let guard = 0;
  while (enemy && manhattan(st.pos, enemy) > 1 && guard++ < 80) {
    if (ui._sheet) { ui.closeModal(); continue; }
    let best = null, bestD = Infinity;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = st.pos.x + dx, ny = st.pos.y + dy;
      if (nx < 0 || ny < 0 || nx >= GRID || ny >= GRID) continue;
      const ent = entityAt(st, nx, ny);
      if (ent && ent.type === 'enemy') continue;
      if (!isWalkable(st.grid[ny][nx])) continue;
      const d = Math.abs(nx - enemy.x) + Math.abs(ny - enemy.y);
      if (d < bestD) { bestD = d; best = { x: nx, y: ny }; }
    }
    if (!best) return false;
    ui.tryMoveTo(best.x, best.y);
  }
  return enemy ? manhattan(st.pos, enemy) <= 1 : false;
}

// 通用战斗取胜：读架势 → 点击克制应对，直到战斗结束
// （自动战斗默认开启时按钮会被禁用，此处仅轮询；回合节奏由自动代打推进）
async function winBattle() {
  let guard = 0;
  while (document.querySelector('.battle') && guard++ < 200) {
    const chip = document.querySelector('.stance-chip');
    let act = 'counter';
    if (chip) {
      const t = chip.textContent || '';
      if (t.includes('横斩')) act = 'block';
      else if (t.includes('重击')) act = 'dodge';
      else act = 'counter';
    }
    const btn = document.querySelector(`.battle__actions .act[data-action="${act}"]`);
    if (btn && !btn.disabled) btn.click();
    await sleep(70);
  }
  return !document.querySelector('.battle');
}

let enemy = nearestEnemy();
ok(!!enemy, '第 1 层存在敌人');
let reached = enemy ? walkAdjacent(enemy) : false;
if (!reached && enemy) {
  // 退化：直接对相邻敌人开战（绕过寻路 UI）
  ui.startBattle(enemy);
} else {
  ok(/攻击/.test(document.querySelector('.interact-btn')?.textContent || ''), '靠近敌人后交互键变为「攻击」');
  document.querySelector('.interact-btn').click();
}
await sleep(15);
ok(document.querySelector('.battle') !== null, '进入战斗界面');
ok(document.querySelectorAll('.battle__actions .act').length === 3, '战斗含 3 个应对按钮');
const sdBefore = ui.player.stardust;
const won = await winBattle();
ok(won, '战斗取胜并退出战斗界面');
ok(ui.player.stardust > sdBefore, `战斗获得星骸（${sdBefore}→${ui.player.stardust}）`);

// ---------- 5b) 自动战斗：默认开启，进入战斗后自动结算多回合直至取胜（防死锁） ----------
const enemy2 = nearestEnemy();
if (enemy2) {
  const reached2 = walkAdjacent(enemy2);
  if (reached2) {
    document.querySelector('.interact-btn').click(); // 攻击
    await sleep(15);
    ok(ui.battle && ui.battle.auto === true, '进入战斗默认开启自动战斗（battle.auto=true）');
    const autoBtn = document.querySelector('[title="自动战斗"]');
    ok(!!autoBtn, '战斗界面有自动战斗开关');
    // 轮询等待自动战斗结束（防 5b 死锁回归）
    let guard = 0;
    while (document.querySelector('.battle') && guard++ < 200) { await sleep(70); }
    ok(!document.querySelector('.battle'), `自动战斗能自行取胜并退出（${guard} 轮）`);
  }
}

// ---------- 6) 事件：商人 / 无人机 ----------
ui.player.stardust += 50; // 便于测试购买
ui.refreshStatus();
ui.showMerchant();
await sleep(10);
ok(/流浪商人/.test(document.querySelector('.sheet__head .t')?.textContent || ''), '打开商人面板');
const buyBtn = document.querySelector('.sheet__body .slot-row .btn-primary');
ok(!!buyBtn && !buyBtn.disabled, '商人有可购买商品');
if (buyBtn) buyBtn.click();
await sleep(10);
ui.closeModal();
ui.showDrone();
await sleep(10);
ok(/维修无人机/.test(document.querySelector('.sheet__head .t')?.textContent || ''), '打开无人机面板');
const droneBtn = [...document.querySelectorAll('.sheet__foot button')].find((b) => /维修/.test(b.textContent));
ok(!!droneBtn, '无人机有维修按钮');
if (droneBtn) droneBtn.click();
await sleep(10);
ok(ui.player.hp === maxHp(ui.player), '无人机维修回满 HP');

// ---------- 7) 背包：强化 / 天赋 / 剧情 ----------
ui.player.parts = 100;
ui.openInventory();
await sleep(10);
ok(/背包/.test(document.querySelector('.sheet__head .t')?.textContent || ''), '打开背包');
ok(document.querySelectorAll('.tabs .tab').length === 3, '背包含 装备/天赋/剧情 三标签');
const plusBefore = ui.player.equipment.weapon.plus;
const enhBtn = document.querySelector('.equip-card .btn-primary');
ok(!!enhBtn, '装备页有强化按钮');
if (enhBtn) enhBtn.click();
await sleep(10);
ok(ui.player.equipment.weapon.plus === plusBefore + 1, `强化成功 +${plusBefore}→+${ui.player.equipment.weapon.plus}`);
// 天赋
document.querySelectorAll('.tabs .tab')[1].click();
await sleep(10);
ok(document.querySelectorAll('.talent-branch').length === 3, '天赋页含 3 分支');
const talBtn = document.querySelector('.talent-branch .btn-primary');
ok(!!talBtn, '天赋页有点亮按钮');
if (talBtn) talBtn.click();
await sleep(10);
ok(ui.player.talents.combat === 1 || ui.player.talents.survival === 1 || ui.player.talents.luck === 1, '点亮天赋成功');
// 重置
const resetBtn = [...document.querySelectorAll('.sheet__body button')].find((b) => /重置天赋/.test(b.textContent));
if (resetBtn) resetBtn.click();
await sleep(10);
ok(ui.player.talents.combat === 0 && ui.player.talents.survival === 0 && ui.player.talents.luck === 0, '重置天赋后归零');
// 剧情
document.querySelectorAll('.tabs .tab')[2].click();
await sleep(10);
ok(document.querySelectorAll('.chapter').length === 10, '剧情页列出 10 章节');
ui.closeModal();
await sleep(5);

// ---------- 8) 下层 ----------
// 走到阶梯并下行
const findStairs = () => {
  const st = ui.player.floorState;
  for (let y = 0; y < GRID; y++) for (let x = 0; x < GRID; x++) if (st.grid[y][x] === 'stairs') return { x, y };
  return null;
};
const stairs = findStairs();
if (stairs) {
  // 逐格走向阶梯
  let guard = 0;
  while (manhattan(ui.player.floorState.pos, stairs) > 0 && guard++ < 80) {
    if (ui._sheet) { ui.closeModal(); continue; }
    const st = ui.player.floorState;
    let best = null, bestD = Infinity;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = st.pos.x + dx, ny = st.pos.y + dy;
      if (nx < 0 || ny < 0 || nx >= GRID || ny >= GRID) continue;
      const ent = entityAt(st, nx, ny);
      if (ent && ent.type === 'enemy') continue;
      if (!isWalkable(st.grid[ny][nx])) continue;
      const d = manhattan({ x: nx, y: ny }, stairs);
      if (d < bestD) { bestD = d; best = { x: nx, y: ny }; }
    }
    if (!best) break;
    ui.tryMoveTo(best.x, best.y);
  }
  if (ui.player.floorState.pos.x === stairs.x && ui.player.floorState.pos.y === stairs.y) {
    document.querySelector('.interact-btn').click(); // 下行
    await sleep(10);
  }
}
ok(ui.player.floor === 2, `下行至第 2 层（实际 ${ui.player.floor}）`);

// ---------- 9) 存档往返：重开实例后可「继续旅程」 ----------
const savedName = ui.player.name;
const savedFloor = ui.player.floor;
ui.destroy();
await sleep(10);
ui = createGame(document.getElementById('game-container'));
ui.rng = () => 0.4;
ui.timerEnabled = false;
window.__XHLZ = ui;
await sleep(10);
ok(/继续旅程/.test(document.querySelector('.launcher__actions .btn-primary')?.textContent || ''), '有存档时启动器主按钮为「继续旅程」');
document.querySelector('.launcher__actions .btn-primary').click();
await sleep(15);
ok(ui.player && ui.player.name === savedName && ui.player.floor === savedFloor, `继续旅程载入正确（${ui.player?.name}·第 ${ui.player?.floor} 层）`);
ok(document.querySelector('.xhlz-game') !== null, '继续后渲染游戏界面');

// ---------- 10) Boss 层：通关 → 双结局抉择 ----------
ui.player.floor = 10;
ui.player.floorState = generateFloor(ui.rng, 10, ui.player);
ui.renderMap();
ui.refreshInteract();
await sleep(10);
const boss = ui.player.floorState.entities.find((e) => e.type === 'enemy' && e.boss);
ok(!!boss, 'Boss 层存在 Boss 敌人');
if (boss) {
  walkAdjacent(boss);
  if (ui._sheet) ui.closeModal();
  if (manhattan(ui.player.floorState.pos, boss) <= 1) {
    document.querySelector('.interact-btn').click();
    await sleep(15);
    const bossWon = await winBattle();
    ok(bossWon, '击败 Boss');
    await sleep(10);
    const peaceBtn = [...document.querySelectorAll('.sheet__foot button, .ending__choice button')].find((b) => /重建文明/.test(b.textContent));
    ok(!!peaceBtn, '击败 Boss 后出现结局抉择');
    if (peaceBtn) peaceBtn.click();
    await sleep(15);
  }
}
ok(document.querySelector('.ending') !== null, '通关后渲染结局画面');
ok(ui.player.ending === 'peace' || ui.player.ending === 'dark', `结局已记录（${ui.player.ending}）`);

// ---------- 11) 死亡结算画面（开启新旅程后驱动 gameOver） ----------
ui.destroy();
await sleep(10);
ui = createGame(document.getElementById('game-container'));
ui.rng = () => 0.4;
window.__XHLZ = ui;
await sleep(10);
const newBtn = [...document.querySelectorAll('.launcher__actions button')].find((b) => /新旅程/.test(b.textContent));
(newBtn || document.querySelector('.launcher__actions .btn-primary')).click();
await sleep(10);
document.querySelector('.create__foot .btn-primary').click(); // 迫降
await sleep(10);
// 跳过星图介绍页，着陆进入游戏
const landBtn2 = [...document.querySelectorAll('.galaxy .btn-primary')].find((b) => /着陆/.test(b.textContent || ''));
if (landBtn2) landBtn2.click();
await sleep(15);
ok(ui.player && ui.screen === 'game', '开启新旅程进入游戏');
ui.player.hp = 0;
ui.gameOver();
await sleep(10);
ok(document.querySelector('.ending.dark') !== null, '生命归零渲染死亡结算画面');
ok(/旅程终结/.test(document.querySelector('.ending h2')?.textContent || ''), '死亡结算标题正确');

ui.destroy();
console.log(`\n结果: ${pass} 通过, ${fail} 失败`);
process.exit(fail ? 1 : 0);
