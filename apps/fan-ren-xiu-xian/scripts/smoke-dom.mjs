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
  document.querySelector('.reroll-btn')?.click(); // 🎲 重新随机属性
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

// ---------- 5b) 人物档案：宗门归属行 / 装备 / 功法 / 属性构成 ----------
{
  const openProfile = async () => {
    document.querySelector('.avatar-btn').click();
    await sleep(10);
  };
  const subLine = () => document.querySelector('.char-id .muted')?.textContent || '';
  const bodyText = () => document.querySelector('.sheet__body')?.textContent || '';

  // 未入宗门：姓名下方显示「散修」，且装备/功法区有空态
  await openProfile();
  ok(/散修/.test(subLine()), `未入宗门时姓名下方显示散修（实际「${subLine()}」）`);
  ok(/尚未装备任何法宝/.test(bodyText()), '装备区展示空态');
  ok(/尚未习得任何功法/.test(bodyText()), '功法区展示空态');
  document.querySelector('.sheet__foot .btn-ghost').click();
  await sleep(5);

  // 赐一法宝 + 一功法，重算后档案应展示装备/功法名，且属性以「总数（基础+加成）」呈现
  ui.player.bag.fabao_feijian = 1;
  ui.player.equipment = 'fabao_feijian';
  ui.player.techniques = ['gongfa_changchun'];
  ui.afterAction(); // recompute + 落盘 + 刷新
  await sleep(5);
  await openProfile();
  ok(/新手飞剑/.test(bodyText()), '装备区展示已装备法宝');
  ok(/长春功/.test(bodyText()), '功法区展示已习功法');
  ok(/（\d+\+\d+）/.test(bodyText()), '属性以「总数（基础+加成）」形式呈现');
  document.querySelector('.sheet__foot .btn-ghost').click();
  await sleep(5);
}

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

// ---------- 7b) 活力耗尽 → 顶部「进入次月」横幅 → 回满 ----------
ui.player.vitality = 0;
ui.renderPanel();
ok(document.querySelector('.rest-banner') !== null, '活力耗尽时渲染「进入次月」横幅');
ok(document.querySelector('.rest-btn') !== null, '横幅含「进入次月」按钮');
document.querySelector('.rest-btn').click();
await sleep(5);
ok(ui.player.vitality === ui.player.maxVitality, `点击「进入次日」后活力回满（${ui.player.vitality}/${ui.player.maxVitality}）`);
ok(document.querySelector('.rest-banner') === null, '活力回满后横幅消失');

// ---------- 7c) 顶部境界徽章只显示 2 字图标，无冗余境界全名文字 ----------
const badgeText = document.querySelector('.realm-badge .seal')?.textContent || '';
ok(badgeText === '凡人', `凡人境界徽章只显示 2 字图标「凡人」（实际「${badgeText}」）`);
ok(document.querySelector('.realm-badge .realm-name') === null, '境界徽章不再附带冗余境界全名文字');

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
  for (const tab of ['cultivate', 'explore', 'market', 'bag', 'alchemy', 'sect', 'npc']) {
    ui.tab = tab;
    ui.renderPanel();
  }
} catch (e) { renderErr = e; }
ok(!renderErr, `七大功能页渲染无异常（${renderErr ? renderErr.message : 'ok'}）`);

// ---------- 9b1) 坊市商品有介绍 + 可点开详情 ----------
{
  ui.tab = 'market'; ui.market = null; ui.renderPanel();
  await sleep(5);
  const rows = document.querySelectorAll('.shop-row');
  ok(rows.length > 0, '坊市货架有商品');
  const desc = [...document.querySelectorAll('.shop-desc')];
  ok(desc.length > 0 && desc.every((d) => d.textContent.trim().length > 0), '每个商品都有介绍文案');
  const infoBtn = document.querySelector('.shop-row__info');
  ok(!!infoBtn, '商品行可点击查看详情');
  infoBtn.click();
  await sleep(10);
  ok(/商品详情/.test(document.querySelector('.sheet__head .t')?.textContent || ''), '点开商品详情弹窗');
  document.querySelector('.sheet__foot .btn-ghost').click();
  await sleep(5);
}

// ---------- 9b1b) 境界徽章可点击展开「境界总纲」 ----------
{
  const badge = document.querySelector('button.realm-badge');
  ok(!!badge, '境界徽章为可点击按钮');
  badge.click();
  await sleep(10);
  ok(/境界总纲/.test(document.querySelector('.sheet__head .t')?.textContent || ''), '点击境界徽章展开境界总纲');
  ok(document.querySelectorAll('.realm-node').length === 10, '境界总纲列出全部 10 大境界');
  ok(document.querySelector('.realm-node.current') !== null, '当前境界有明显标注');
  document.querySelector('.sheet__foot .btn-ghost').click();
  await sleep(5);
}

// ---------- 9b1c) 宗门：拜入 → 任务/俸禄页渲染 ----------
{
  ui.tab = 'sect'; ui.renderPanel();
  await sleep(5);
  ok(/拜入宗门/.test(document.querySelector('.content')?.textContent || ''), '未入宗门时展示拜入宗门页');
  const joinBtn = [...document.querySelectorAll('.content button')].find((b) => /拜入/.test(b.textContent));
  ok(!!joinBtn, '有拜入宗门按钮');
  joinBtn.click();
  await sleep(10);
  ok(!!ui.player.sectId, '拜入后已加入宗门');
  // 入宗后人物档案姓名下方应显示宗门名，不再显示「散修」
  document.querySelector('.avatar-btn').click();
  await sleep(10);
  const subAfterJoin = document.querySelector('.char-id .muted')?.textContent || '';
  ok(!/散修/.test(subAfterJoin), `入宗后姓名下方不再显示散修（实际「${subAfterJoin}」）`);
  document.querySelector('.sheet__foot .btn-ghost').click();
  await sleep(5);
  ok(/本月宗门任务/.test(document.querySelector('.content')?.textContent || ''), '入宗后展示本月宗门任务');
  ok(/每月宗门俸禄/.test(document.querySelector('.content')?.textContent || ''), '入宗后展示每月俸禄');
  // 领取记名弟子俸禄
  const rewardBtn = [...document.querySelectorAll('.content button')].find((b) => /领取俸禄/.test(b.textContent));
  ok(rewardBtn && !rewardBtn.disabled, '俸禄按钮可领取');
  rewardBtn.click();
  await sleep(10);
  ok(!!ui.player.sectRewardDate, '领取俸禄后记录当日已领');
}

// ---------- 9b1d) 宗门悬赏挑战：接取 → 渲染 ----------
{
  ui.tab = 'sect'; ui.renderPanel();
  await sleep(5);
  ok(/悬赏挑战/.test(document.querySelector('.content')?.textContent || ''), '宗门页展示悬赏挑战区');
  const acceptBtn = [...document.querySelectorAll('.content button')].find((b) => /接取/.test(b.textContent));
  ok(acceptBtn && !acceptBtn.disabled, '有可用的「接取挑战」按钮');
  acceptBtn.click();
  await sleep(10);
  ok(Array.isArray(ui.player.challengeTasks) && ui.player.challengeTasks.length === 1, '接取后持有一项挑战');
  ok(document.querySelectorAll('.sect-task').length >= 1, '挑战以任务卡片形式渲染');
}

// ---------- 9b1e) 道友（NPC）：寻访结识 → 赠礼 ----------
{
  ui.tab = 'npc'; ui.renderPanel();
  await sleep(5);
  ok(/云游寻访/.test(document.querySelector('.content')?.textContent || ''), '道友页展示云游寻访');
  const meetBtn = [...document.querySelectorAll('.content button')].find((b) => /寻访道友/.test(b.textContent));
  ok(meetBtn && !meetBtn.disabled, '有可用的「寻访道友」按钮');
  const metCount = Object.values(ui.player.npcs || {}).filter((n) => n && n.met).length;
  meetBtn.click();
  await sleep(10);
  const metCount2 = Object.values(ui.player.npcs || {}).filter((n) => n && n.met).length;
  ok(metCount2 === metCount + 1, '寻访后结识一位道友');
  ok(document.querySelector('.npc-card') !== null, '结识后渲染道友卡片');
  // 打开赠礼选择器
  const giftBtn = document.querySelector('.npc-card .btn-ghost');
  ok(!!giftBtn, '道友卡片有赠礼按钮');
  giftBtn.click();
  await sleep(10);
  ok(/赠礼/.test(document.querySelector('.sheet__head .t')?.textContent || ''), '点击赠礼打开选择器');
  document.querySelector('.sheet__foot .btn-ghost')?.click();
  await sleep(5);
}

// ---------- 9b1f) 音效开关位于设置弹窗内且可切换 ----------
{
  // 状态栏不再有音效按钮（已按要求移入「设置」弹窗）
  ok(document.querySelector('.status-row .icon-btn[title="音效开关"]') === null, '状态栏不再有音效按钮（已移入设置）');
  ui.showSettings();
  await sleep(10);
  const sfxBtn = [...document.querySelectorAll('.sheet__body button')].find((b) => /音效[:：]/.test(b.textContent));
  ok(!!sfxBtn, '设置弹窗内有音效开关按钮');
  const before = sfxBtn.textContent;
  sfxBtn.click();
  await sleep(5);
  ok(sfxBtn.textContent !== before, '点击音效按钮切换文案（开/关）');
  ui.closeModal();
  await sleep(5);
}

// ---------- 9b1f2) 自动挂机：设置入口 / 倾向权重 / 立即一轮 / 状态栏徽丸 ----------
{
  // 默认关闭：状态栏无自动挂机徽丸
  ok(document.querySelector('.auto-badge')?.style.display === 'none', '默认关闭时状态栏不显示自动挂机徽丸');
  ui.showSettings();
  await sleep(10);
  const bodyTxt = () => document.querySelector('.sheet__body')?.textContent || '';
  ok(/自动挂机/.test(bodyTxt()), '设置弹窗含「自动挂机」入口卡片');
  ok(/周期节奏/.test(bodyTxt()), '自动挂机卡片含周期节奏设置');
  // 每个倾向都渲染为一行配置
  ok(document.querySelectorAll('.auto-cfg-row.tendency').length >= 4, '自动挂机列出多个可配置倾向');
  // 开启总开关
  const toggleBtn = [...document.querySelectorAll('.sheet__body button')].find((b) => /自动挂机[:：]/.test(b.textContent));
  ok(!!toggleBtn, '有自动挂机总开关按钮');
  toggleBtn.click();
  await sleep(5);
  ok(ui.player.autoPlay.enabled === true, '点击总开关后 autoPlay.enabled = true');
  // 权重步进器：找到首个启用倾向的「+」按钮，权重 +1 后回填
  const plusBtns = [...document.querySelectorAll('.auto-cfg-row.tendency .stepper button')];
  ok(plusBtns.length > 0, '启用倾向展示权重步进器');
  const beforeW = Object.values(ui.player.autoPlay.tendencies).reduce((s, w) => s + w, 0);
  plusBtns[plusBtns.length - 1].click(); // 末项「+」
  await sleep(5);
  const afterW = Object.values(ui.player.autoPlay.tendencies).reduce((s, w) => s + w, 0);
  ok(afterW === beforeW + 1, `权重步进器 +1 生效（${beforeW} → ${afterW}）`);
  // 关闭某倾向：点击其启用开关圆钮 → 该行变为 off 且无步进器
  const onToggle = document.querySelector('.auto-toggle.on');
  ok(!!onToggle, '启用倾向有开关圆钮');
  onToggle.click();
  await sleep(5);
  ok(document.querySelectorAll('.auto-cfg-row.tendency.off').length >= 1, '点击开关后该倾向变为已停用');
  // 重新全部启用，便于后续「立即一轮」有倾向可执行
  ui.player.autoPlay = { enabled: true, intervalSec: 2, tendencies: { cultivate: 4, explore: 3, breakthrough: 3, craft: 2, team: 1, meet: 1 } };
  ui._saveAuto(); ui._fillAutoCard();
  await sleep(5);
  // 「立即挂机一轮」预览按钮：执行一次（凡人会修炼/探索，不抛错）
  const onceBtn = [...document.querySelectorAll('.sheet__body button')].find((b) => /立即挂机一轮/.test(b.textContent));
  ok(!!onceBtn, '自动挂机卡片含「立即挂机一轮」按钮');
  let onceErr = null;
  try { onceBtn.click(); } catch (e) { onceErr = e; }
  await sleep(5);
  ok(!onceErr, `立即挂机一轮不抛异常（${onceErr ? onceErr.message : 'ok'}）`);
  ui.closeModal();
  await sleep(5);
  // 开启后状态栏出现脉动的自动挂机徽丸
  ok(document.querySelector('.auto-badge')?.style.display !== 'none', '开启后状态栏显示自动挂机徽丸');
  // 关闭后徽丸消失
  ui.player.autoPlay.enabled = false; ui._saveAuto(); ui.refreshStatus();
  await sleep(5);
  ok(document.querySelector('.auto-badge')?.style.display === 'none', '关闭后状态栏徽丸消失');
}

// ---------- 9b1g) 成就面板：进度条 + 奖励 + 可伸缩分类 ----------
{
  ui.showAchievements();
  await sleep(10);
  ok(/成就与称号/.test(document.querySelector('.sheet__head .t')?.textContent || ''), '打开成就与称号面板');
  const txt = document.querySelector('.sheet__body')?.textContent || '';
  ok(/奖励：/.test(txt), '成就条目展示奖励说明');
  // 未达成项渲染「当前进度 / 目标」进度条
  ok(document.querySelectorAll('.achv .bar').length > 0, '未达成成就渲染当前进度条');
  // 分类头部为可点击按钮（伸缩入口），且带伸缩指示符
  const heads = document.querySelectorAll('.achv-cat__head');
  ok(heads.length >= 5 && [...heads].every((b) => b.tagName === 'BUTTON'), '各分类头部为可点击按钮');
  ok(document.querySelectorAll('.achv-cat__caret').length === heads.length, '每个分类头部有伸缩指示符');
  // 默认全展开
  ok(document.querySelectorAll('.achv-cat:not(.collapsed)').length === heads.length, '默认所有分类展开');
  // 点击首个分类头部 → 折叠（collapsed 类 + caret 变 ▶）
  const firstHead = heads[0];
  firstHead.click();
  await sleep(5);
  const firstCat = firstHead.parentElement;
  ok(firstCat.classList.contains('collapsed'), '点击分类头部后该分类折叠');
  ok(firstCat.querySelector('.achv-cat__caret').textContent === '▶', '折叠后 caret 显示 ▶');
  // 再次点击 → 重新展开
  firstHead.click();
  await sleep(5);
  ok(!firstCat.classList.contains('collapsed'), '再次点击分类头部后重新展开');
  // 让一项成就达成后重开面板：应显示「已达成」且不再渲染该条进度条
  ui.player.stats.battlesWon = 1;
  ui.checkAchvAndToast();
  ui.showAchievements();
  await sleep(10);
  const doneRow = [...document.querySelectorAll('.achv.done')].find((r) => /初露锋芒/.test(r.textContent));
  ok(!!doneRow && /已达成/.test(doneRow.textContent), '达成后的成就标注「已达成」');
  ok(!doneRow.querySelector('.bar'), '已达成成就不再渲染进度条');
  ui.closeModal();
  await sleep(5);
}

// ---------- 9b2) 损坏境界档不闪退（「点修炼偶发闪退」UI 回归）----------
// 模拟 tier/sub 非法（损坏档/导入串/旧版缺字段）：点修炼 + 刷新状态栏 + 渲染修炼页
// 这条热路径必须全程不抛错，否则整页白屏即「闪退」。
{
  ui.tab = 'cultivate';
  ui.player.tier = 999; ui.player.sub = 999;
  ui.player.mp = ui.player.maxMp; ui.player.vitality = ui.player.maxVitality;
  let bad = null;
  try {
    ui.doActiveCultivate();      // 修炼 → afterAction → recompute(钳制) → refreshStatus → realmInfo
    ui.refreshStatus();
    ui.renderPanel();
  } catch (e) { bad = e; }
  ok(!bad, `损坏境界档点修炼不闪退（${bad ? bad.message : 'ok'}）`);
  ok(ui.player.tier <= 9, `越界 tier 经修炼后被钳制到合法区间（tier=${ui.player.tier}）`);
}

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

// ---------- 11) 年龄徽丸 + 大限将至 → 轮回重修 ----------
// 重新建号，验证状态栏年龄徽丸、大限横幅、轮回重修全流程
ui.destroy();
await sleep(10);
ui = createGame(document.getElementById('game-container'));
watchToasts();
await sleep(10);
document.querySelectorAll('.slot-card')[0].querySelector('.btn-primary').click(); // 空槽 → 创角
await sleep(10);
ui.charName = '轮回人';
document.querySelector('[data-id="name"]')?.dispatchEvent(new window.Event('input'));
ui.confirmCreate();
await sleep(10);
// 状态栏不再单列年龄徽丸，改由头像「寿元环」按年龄占比呈现：环上 --age-pct 已写入、title 含年龄与寿元
const _avatarBtn = document.querySelector('.avatar-btn');
ok(_avatarBtn?.style.getPropertyValue('--age-pct') !== '' && /岁/.test(_avatarBtn?.title || ''), `头像寿元环按年龄占比渲染（title=${_avatarBtn?.title}）`);
ui.tab = 'cultivate'; ui.renderPanel();
ok(/年龄/.test(document.querySelector('.content')?.textContent || ''), '修炼页展示年龄');
ok(/灵根属性|属性：/.test(document.querySelector('.content')?.textContent || '') || /灵根 · /.test(document.querySelector('.content')?.textContent || ''), '修炼页展示灵根（含属性）');
// 模拟大限将至：寿元耗尽 → 顶部出现轮回横幅
ui.player.age = 9999; ui.player.tier = 0; ui.afterAction();
await sleep(5);
ok(document.querySelector('.death-banner') !== null, '大限将至时渲染轮回横幅');
const lunhuiBtn = [...document.querySelectorAll('.death-banner button')].find((b) => /轮回重修/.test(b.textContent));
ok(!!lunhuiBtn, '横幅含「轮回重修」按钮');
lunhuiBtn.click();
await sleep(10);
// 确认弹窗 → 转世重修
const confirmBtn = [...document.querySelectorAll('.sheet__foot button')].find((b) => /转世重修/.test(b.textContent));
ok(!!confirmBtn, '弹出轮回确认弹窗');
confirmBtn.click();
await sleep(10);
ok(ui.player.tier === 0 && ui.player.reincarnations === 1, `轮回后境界归零、轮回次数=1（tier=${ui.player.tier}）`);
ok(/（轮回）/.test(document.querySelector('.avatar-btn')?.title || ''), `头像寿元环标注（轮回）（${document.querySelector('.avatar-btn')?.title}）`);
ok(document.querySelector('.death-banner') === null, '轮回后大限横幅消失（已重置年龄）');

// ---------- 12) 已飞升结局：点「再入轮回」切实转世重修（回归 #59）----------
// 旧实现把该按钮接到了 confirmReset（全清重开），且 reincarnate 拒绝飞升者 → 玩家感觉「没反应」。
{
  const p = ui.player;
  const reincBefore = p.reincarnations || 0; // 本用例前「轮回人」已在大限路径轮回过一次
  p.tier = 9; p.ascended = true;            // 大乘之上、飞升成仙
  p.qiyun = 80; p.talentIds = ['tal_wuxing', 'tal_wanshou'];
  p.autoPlay = { enabled: false };
  ui.afterAction();                          // 落盘 + renderPanel → renderAscended
  await sleep(10);
  ok(document.querySelector('.ascend-screen') !== null, '飞升后渲染飞升结局屏');
  const ascendBtn = [...document.querySelectorAll('.ascend-screen button')].find((b) => /再入轮回/.test(b.textContent));
  ok(!!ascendBtn, '飞升屏含「再入轮回」按钮');
  ascendBtn.click();
  await sleep(10);
  ok(/再入轮回/.test(document.querySelector('.sheet__head .t')?.textContent || ''), '点击「再入轮回」弹出确认弹窗（不再是静默重开）');
  const goBtn = [...document.querySelectorAll('.sheet__foot button')].find((b) => /再入轮回/.test(b.textContent));
  ok(!!goBtn, '弹窗含确认「再入轮回」按钮');
  goBtn.click();
  await sleep(10);
  ok(p.ascended === false && p.tier === 0, `确认后脱离飞升、境界归零（ascended=${p.ascended}, tier=${p.tier}）`);
  ok(p.reincarnations === reincBefore + 1, `轮回次数 +1（${reincBefore} → ${p.reincarnations}）`);
  ok(p.qiyun === 80, '携带前世气运');
  ok(document.querySelector('.ascend-screen') === null && document.querySelector('.status-bar') !== null, '再入轮回后回到正常游戏界面');
  ok(/（轮回）/.test(document.querySelector('.avatar-btn')?.title || ''), '头像寿元环标注（轮回）');
}

ui.destroy();
console.log(`\n结果: ${pass} 通过, ${fail} 失败`);
process.exit(fail ? 1 : 0);
