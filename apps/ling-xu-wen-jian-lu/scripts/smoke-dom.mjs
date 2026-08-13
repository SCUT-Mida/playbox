// DOM 冒烟测试：用 jsdom 驱动真实 UI 流程（存档选择 → 开档 → 各功能页 → 问道 → 主线战斗 → 存档）。
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
  try { globalThis[k] = window[k]; } catch (_) { /* Node 部分全局只读，跳过 */ }
}
globalThis.requestAnimationFrame = (fn) => setTimeout(fn, 0);

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.error('  ✗ FAIL:', m); } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let lastToastText = '';
const watchToasts = (ui) => {
  const wrap = ui.toastWrap;
  if (!wrap) return;
  new window.MutationObserver((mutations) => {
    for (const m of mutations) for (const node of m.addedNodes) {
      if (node.classList && node.classList.contains('toast')) lastToastText = node.textContent;
    }
  }).observe(wrap, { childList: true });
};

localStorage.clear();
const { createGame } = await import(new URL('../src/main.js', import.meta.url).href);

// ---------- 1) 首启：存档选择页 ----------
let ui = window.__LXX;
ok(!!ui, 'main.js 自动挂载并暴露 __LXX');
await sleep(10);
ok(document.querySelectorAll('.slot-card').length === 3, `首启展示 3 个存档槽（实际 ${document.querySelectorAll('.slot-card').length}）`);
ok(document.querySelector('.launcher') !== null, '渲染存档选择启动器');
watchToasts(ui);

// ---------- 2) 槽 1 新建 → 进入游戏 ----------
document.querySelectorAll('.slot-card.empty .btn-primary')[0].click();
await sleep(10);
ok(document.querySelector('.topbar') !== null, '开档后渲染顶栏');
ok(document.querySelector('.tabnav') !== null, '渲染底部 Tab 导航');
ok(document.querySelector('.content') !== null, '渲染内容区');
ok(Object.keys(ui.player.cards).length === 4, `初始 4 张卡（实际 ${Object.keys(ui.player.cards).length}）`);

// ---------- 3) 各功能页渲染不报错 ----------
{
  let renderErr = null;
  try {
    for (const tab of ['lineup', 'ask', 'cultivate', 'stage', 'secret', 'cave', 'codex', 'setting']) {
      ui.tab = tab; ui.refresh(); await sleep(5);
    }
  } catch (e) { renderErr = e; }
  ok(!renderErr, `八大功能页渲染无异常（${renderErr ? renderErr.message : 'ok'}）`);
  ui.tab = 'lineup'; ui.refresh();
}

// ---------- 4) 阵容：一键最强 + 卡牌上阵/移下 ----------
{
  ui.tab = 'lineup'; ui.refresh(); await sleep(5);
  ok(document.querySelectorAll('.mini-card').length >= 4, '阵容页列出我的卡牌');
  const autoBtn = [...document.querySelectorAll('.content button')].find((b) => /一键最强/.test(b.textContent));
  ok(!!autoBtn, '有一键最强阵容按钮');
  autoBtn.click(); await sleep(5);
  ok(ui.player.formation.filter(Boolean).length === Math.min(5, Object.keys(ui.player.cards).length), '一键最强填满阵容');
}

// ---------- 5) 问道：每日免费单抽 → 结果弹窗 ----------
{
  ui.tab = 'ask'; ui.refresh(); await sleep(5);
  const freeBtn = [...document.querySelectorAll('.content button')].find((b) => /免费/.test(b.textContent));
  ok(!!freeBtn && !freeBtn.disabled, '有可用的每日免费单抽按钮');
  freeBtn.click(); await sleep(10);
  ok(document.querySelector('.sheet') !== null, '抽卡后弹出结果弹窗');
  ok(document.querySelectorAll('.gacha-card').length === 1, '单抽展示 1 张卡');
  ui.closeModal(); await sleep(5);
  ok(document.querySelector('.sheet') === null, '关闭弹窗');
  // 再次免费应被禁用
  ui.refresh(); await sleep(5);
  const freeBtn2 = [...document.querySelectorAll('.content button')].find((b) => /免费/.test(b.textContent));
  ok(freeBtn2.disabled, '今日免费已用后按钮禁用');
}

// ---------- 6) 修炼：喂修为丹升卡 ----------
{
  // 给点丹药与灵石
  ui.player.res.lingshi = 99999; ui.player.res.exp_m = 10; ui.player.res.exp_l = 10;
  ui.tab = 'cultivate'; ui.refresh(); await sleep(5);
  ok(document.querySelectorAll('.picker-chip').length >= 4, '修炼页列出卡牌选择器');
  ok(document.querySelector('.cult-card') !== null, '展示当前卡牌详情');
  const bigBtn = [...document.querySelectorAll('.content button')].find((b) => /大丹/.test(b.textContent));
  ok(!!bigBtn, '有大丹喂食按钮');
  const lv0 = ui.player.cards[ui.cultivateId].level;
  bigBtn.click(); await sleep(5);
  ok(ui.player.cards[ui.cultivateId].level > lv0, `喂大丹后等级提升（${lv0} → ${ui.player.cards[ui.cultivateId].level}）`);
  // 灵犀阁四个子页签（修炼/升星/功法/知音）都能渲染
  ok(document.querySelector('.cult-3d') !== null, '2.5D 卡牌展示区渲染');
  let detailErr = null;
  try {
    for (const sub of ['star', 'skill', 'affinity', 'cultivate']) { ui.detailTab = sub; ui.refresh(); await sleep(5); }
  } catch (e) { detailErr = e; }
  ok(!detailErr, `灵犀阁子页签渲染无异常（${detailErr ? detailErr.message : 'ok'}）`);
  ui.detailTab = 'cultivate'; ui.refresh();
}

// ---------- 7) 主线：进入 1-1 战斗 → 弹窗结算 ----------
{
  ui.tab = 'stage'; ui.refresh(); await sleep(5);
  ok(/初入灵墟/.test(document.querySelector('.content')?.textContent || ''), '主线页展示当前章节');
  // 给玩家强力卡便于通关
  const p = ui.player;
  // 通过导入核心 API 直接拉满一张 SSR
  const { ownCard } = await import(new URL('../src/core/player.js', import.meta.url).href);
  const { cardDef } = await import(new URL('../src/data/cards.js', import.meta.url).href);
  const { rarityDef } = await import(new URL('../src/config.js', import.meta.url).href);
  ownCard(p, 'SSR001'); ownCard(p, 'SSR002'); ownCard(p, 'SR002');
  for (const id of Object.keys(p.cards)) {
    const inst = p.cards[id]; const r = rarityDef(cardDef(id).rarity);
    inst.star = r.maxStar; inst.level = 110; inst.br = 11; inst.skillLv = 11;
  }
  ui.autoFormation(); await sleep(5);
  const stageBtn = [...document.querySelectorAll('.stage-row')].find((b) => /1-1/.test(b.textContent));
  ok(!!stageBtn, '1-1 关卡可点');
  stageBtn.click(); await sleep(10);
  // 2.5D 战斗场景（设计稿增量 第三节）
  ok(document.querySelector('.bs') !== null, '战斗后弹出 2.5D 战斗场景');
  const skipBtn = document.querySelector('.bs__skip');
  ok(!!skipBtn, '战斗场景有跳过按钮');
  skipBtn.click(); await sleep(5); // 跳过动画直达结算
  const titleEl = document.querySelector('.bs__result-title');
  ok(titleEl && /胜|败/.test(titleEl.textContent || ''), `战斗结算有胜负结果（${titleEl ? titleEl.textContent : '无'}）`);
  const confirmBtn = [...document.querySelectorAll('.bs__result-foot button')].find((b) => /确定/.test(b.textContent));
  ok(!!confirmBtn, '结算层有确定按钮');
  confirmBtn.click(); await sleep(5);
  ok(document.querySelector('.bs') === null, '确定后关闭战斗场景');
}

// ---------- 7b) 一键扫荡：1-1 应已 3 星 → 扫荡×1 ----------
{
  const p = ui.player;
  const { sweepUnlocked } = await import(new URL('../src/core/sweep.js', import.meta.url).href);
  ok(sweepUnlocked(p) === true, '累计 3 星解锁扫荡');
  ok((p.story.stars['1-1'] || 0) === 3, `1-1 为 3 星通关（实际 ${p.story.stars['1-1'] || 0}）`);
  p.res.sweep_ticket = 50; // 保证神行符充足
  ui.refresh(); await sleep(5);
  const row11 = [...document.querySelectorAll('.stage-row')].find((r) => /1-1/.test(r.textContent));
  const sweepBtn = row11 && row11.querySelector('.sweep-btn');
  ok(!!sweepBtn, '3 星通关的 1-1 出现扫荡按钮');
  sweepBtn.click(); await sleep(5); // 打开扫荡档位弹窗
  const x1 = [...document.querySelectorAll('.sweep-batch-btns button')].find((b) => /×1/.test(b.textContent));
  ok(!!x1, '扫荡弹窗提供 ×1 / ×5 / ×10 档位');
  const stam0 = p.stamina.value;
  x1.click(); await sleep(10); // 执行扫荡 → 结算弹窗
  ok(document.querySelector('.sheet') !== null, '扫荡后弹出结算弹窗');
  ok(/完成 1 次扫荡/.test(document.querySelector('.sheet')?.textContent || ''), '扫荡结算展示完成次数');
  ok(p.stamina.value === stam0 - 10, `扫荡消耗 10 灵气（${stam0} → ${p.stamina.value}）`);
  ui.closeModal(); await sleep(5);
}

// ---------- 8) 设置：导出存档码 ----------
{
  ui.tab = 'setting'; ui.refresh(); await sleep(5);
  const ta = document.querySelector('.save-code');
  ok(!!ta && ta.value.length > 10, '设置页展示存档码');
  ok(document.querySelectorAll('.achv').length > 0, '设置页列出成就');
}

// ---------- 9) 持久化：重开后槽 1 非空（开档后多次 afterAction 已自动落盘）----------
ui.destroy(); await sleep(10);
ui = createGame(document.getElementById('game-container'));
watchToasts(ui);
await sleep(10);
const slots = document.querySelectorAll('.slot-card');
ok(!slots[0].classList.contains('empty'), '重开后槽 1 已占用');
ok(/灵石/.test(slots[0].textContent), '槽 1 卡片显示灵石');

ui.destroy();
console.log(`\n结果: ${pass} 通过, ${fail} 失败`);
process.exit(fail ? 1 : 0);
