// ============================================================================
// 针对性回归验证：限时战斗中「打开撤退确认弹窗 → 取消」不得因 timerEnd 陈旧
// 而被瞬间判失手（第 2 轮阻断级 Bug 的兄弟分支修复）。
// 用 jsdom + 可控时钟（Date.now 注入）+ 关闭 rAF 自动循环，手动驱动 onTick，
// 保证时序完全确定。运行：node scripts/verify-flee-timer.mjs
// ============================================================================
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
  try { globalThis[k] = window[k]; } catch (_) { /* Node 部分全局只读 */ }
}

// —— 可控时钟 ——
let CLOCK = 10000;
Date.now = () => CLOCK; // nowMs() 内部调用 Date.now()
// —— 关闭 rAF 自动循环：onTick 只在我们手动调用时执行，时序完全确定 ——
globalThis.requestAnimationFrame = () => 0;
globalThis.cancelAnimationFrame = () => {};

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.error('  ✗ FAIL:', m); } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const { createGame } = await import(new URL('../src/main.js', import.meta.url).href);
void createGame; // 仅取自动挂载副作用（挂载到 #game-container 并赋值 window.__XHLZ）

localStorage.clear();
// 注意：main.js 在 import 时已对 #game-container 自动挂载并赋值 window.__XHLZ；
// 切勿再手动 createGame（会产生第二个实例并使 DOM 与 window.__XHLZ 错位）。
const ui = window.__XHLZ;
ui.rng = () => 0.4; // 确定性：识破「突刺」，便于稳定

// —— 进入游戏（空槽位 → 无覆盖确认，直接 finalizeCreate）——
// 仅靠 import main.js 的自动挂载副作用生成实例（见上）。
document.querySelector('.launcher__actions .btn-primary').click();
await sleep(5);
document.querySelector('.create__foot .btn-primary').click(); // 迫降
await sleep(10);
ok(ui.screen === 'game' && ui.player, '已进入地图界面');

const enemy = ui.player.floorState.entities.find((e) => e.type === 'enemy');
ok(!!enemy, '楼层存在敌人实体可用于开战');

// ============================================================================
// 场景 A：开弹窗瞬间剩余=完整窗口（复现审查员的最小复现）
//   nextRound 后 timerEnd=13000、CLOCK=10000 → 开撤退弹窗 → 推进到 15000 → 取消
//   修复前：timerEnd 仍=13000 → onTick(15000) remain=0 → 瞬间失手（BUG）
//   修复后：timerEnd 顺延为 18000 → remain=3000，正常继续
// ============================================================================
CLOCK = 10000;
ui.timerEnabled = true;
ui.startBattle(enemy);
await sleep(5);
ok(ui.screen === 'battle' && ui.battle && ui.battle.round === 1, 'startBattle 进入第 1 回合');
ok(ui.battle.timerEnd === 13000, `回合开始 timerEnd=now+3000（实际 ${ui.battle.timerEnd}）`);

ui.confirmFlee(); // 打开撤退确认弹窗
ok(!!ui._sheet, '撤退弹窗已打开（_sheet 已置）');
ok(ui._battlePauseRemain === 3000, `开弹窗瞬间记录剩余=3000（实际 ${ui._battlePauseRemain}）`);

CLOCK = 15000; // 玩家在弹窗里犹豫 5 秒
ui.closeModal(); // 点「继续战斗」
ok(ui.screen === 'battle', '取消后仍处于战斗屏');
ok(ui._battlePauseRemain == null, '关弹窗后 _battlePauseRemain 已清空');
ok(ui.battle.timerEnd === 18000, `timerEnd 按剩余顺延为 18000 而非陈旧的 13000（实际 ${ui.battle.timerEnd}）`);

const remainA = Math.max(0, ui.battle.timerEnd - CLOCK);
ok(remainA === 3000, `关弹窗后 onTick 的 remain=3000（实际 ${remainA}）—— 不会瞬间失手`);
const busyBefore = ui.battle.busy;
ui.onTick(CLOCK); // 手动驱动一帧
ok(ui.battle && ui.battle.busy === busyBefore, '未触发 hesitate（busy 未变）—— 取消弹窗不再误判失手');
ok(/来不及反应/.test(document.querySelector('.battle__log')?.textContent || '') === false, '战报未出现「来不及反应」失手记录');

// ============================================================================
// 场景 B：开弹窗时仅剩少量时间 → 关弹窗只顺延该少量时间（非「全量重置」漏洞）
//   即玩家不能靠反复开关撤退弹窗把计时条刷满。
// ============================================================================
CLOCK = 17500; // 距 timerEnd(18000) 仅剩 500ms
ui.confirmFlee();
ok(ui._battlePauseRemain === 500, `开弹窗瞬间记录剩余=500（实际 ${ui._battlePauseRemain}）`);
CLOCK = 20000;
ui.closeModal();
ok(ui.battle.timerEnd === 20500, `timerEnd=20000+500=20500（非全量重置 23000，实际 ${ui.battle.timerEnd}）—— 无刷计时漏洞`);
const remainB = Math.max(0, ui.battle.timerEnd - CLOCK);
ok(remainB === 500, `关弹窗后 remain=500（实际 ${remainB}）—— 仅顺延真实剩余`);

// ============================================================================
// 场景 C：合法超时仍能正常判失手（证明修复未破坏正常限时机制）
// ============================================================================
CLOCK = 21000; // 已超过 timerEnd(20500)
ui.onTick(CLOCK);
ok(ui.battle && ui.battle.busy === true, '真正超时仍触发 hesitate（busy=true）—— 正常限时未失效');

// ============================================================================
// 场景 D：自动战斗 / busy 期间关弹窗不顺延 timerEnd（守卫不被误触）
// ============================================================================
CLOCK = 30000;
ui.battle.auto = true;
ui.battle.timerEnd = 99999; // 标记值
ui.confirmFlee();
ok(ui._battlePauseRemain == null, 'auto 期间开弹窗不记录剩余（守卫生效）');
ui.closeModal();
ok(ui.battle.timerEnd === 99999, 'auto 期间关弹窗未改写 timerEnd（实际未误触）');

console.log(`\n结果: ${pass} 通过, ${fail} 失败`);
process.exit(fail ? 1 : 0);
