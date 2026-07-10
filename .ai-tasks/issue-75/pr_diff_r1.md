diff --git a/.ai-tasks/issue-75/ai-coder-prompt.md b/.ai-tasks/issue-75/ai-coder-prompt.md
new file mode 100644
index 0000000..2b0d668
--- /dev/null
+++ b/.ai-tasks/issue-75/ai-coder-prompt.md
@@ -0,0 +1,8 @@
+你是一个资深开发者。请解决以下 GitHub Issue：
+【任务标题】: 星骸旅者优化
+【详细需求】: 请直接阅读当前目录下的 .ai-tasks/issue-75/context.md 文件获取。
+
+【⚠️ 严格红线规则】：
+请绝对不要修改、重命名或生成 .github/ 目录下的任何文件 (特别是 workflows 等 CI/CD 配置)，这会破坏项目的自动化流程！如果觉得有必要修改，请在回复中用文字建议人类去改，绝不要自己动手改。
+
+请直接分析并修改项目中的代码文件来解决这个问题，不要做过多的文字解释。
diff --git a/.ai-tasks/issue-75/context.md b/.ai-tasks/issue-75/context.md
new file mode 100644
index 0000000..8309941
--- /dev/null
+++ b/.ai-tasks/issue-75/context.md
@@ -0,0 +1,2 @@
+- 交互优化，比如可以先呈现一个星球线路，进入一个星球才是当前的探索，一个星球探索完可以去别的星球
+- 武器，怪物，地图等等再多样性一些
diff --git a/apps/xing-hai-lv-zhe/scripts/smoke-dom.mjs b/apps/xing-hai-lv-zhe/scripts/smoke-dom.mjs
index 96cc9c5..36d200f 100644
--- a/apps/xing-hai-lv-zhe/scripts/smoke-dom.mjs
+++ b/apps/xing-hai-lv-zhe/scripts/smoke-dom.mjs
@@ -56,7 +56,13 @@ if (nameInput) {
 }
 document.querySelector('.create__foot .btn-primary').click();
 await sleep(15);
-ok(document.querySelector('.xhlz-game') !== null, '迫降后进入游戏界面');
+// 创角后先呈现星图（星球线路），点击「着陆」进入当前星球的探索
+ok(document.querySelector('.galaxy') !== null, '创角后呈现星图（星球线路）');
+ok(document.querySelectorAll('.planet-node').length >= 4, '星图列出多颗星球航点');
+const landBtn = [...document.querySelectorAll('.galaxy .btn-primary')].find((b) => /着陆/.test(b.textContent || ''));
+if (landBtn) landBtn.click();
+await sleep(15);
+ok(document.querySelector('.xhlz-game') !== null, '着陆后进入游戏界面');
 ok(document.querySelector('.status-bar') !== null, '渲染顶部状态栏');
 ok(document.querySelector('.map-grid') !== null, '渲染像素地图');
 ok(document.querySelectorAll('.cell').length === GRID * GRID, `地图含 ${GRID * GRID} 个地块（实际 ${document.querySelectorAll('.cell').length}）`);
@@ -307,7 +313,11 @@ await sleep(10);
 const newBtn = [...document.querySelectorAll('.launcher__actions button')].find((b) => /新旅程/.test(b.textContent));
 (newBtn || document.querySelector('.launcher__actions .btn-primary')).click();
 await sleep(10);
-document.querySelector('.create__foot .btn-primary').click(); // 迫降进入游戏
+document.querySelector('.create__foot .btn-primary').click(); // 迫降
+await sleep(10);
+// 跳过星图介绍页，着陆进入游戏
+const landBtn2 = [...document.querySelectorAll('.galaxy .btn-primary')].find((b) => /着陆/.test(b.textContent || ''));
+if (landBtn2) landBtn2.click();
 await sleep(15);
 ok(ui.player && ui.screen === 'game', '开启新旅程进入游戏');
 ui.player.hp = 0;
diff --git a/apps/xing-hai-lv-zhe/scripts/verify-flee-timer.mjs b/apps/xing-hai-lv-zhe/scripts/verify-flee-timer.mjs
index ca64a3d..54dd619 100644
--- a/apps/xing-hai-lv-zhe/scripts/verify-flee-timer.mjs
+++ b/apps/xing-hai-lv-zhe/scripts/verify-flee-timer.mjs
@@ -45,6 +45,10 @@ document.querySelector('.launcher__actions .btn-primary').click();
 await sleep(5);
 document.querySelector('.create__foot .btn-primary').click(); // 迫降
 await sleep(10);
+// 跳过创角后呈现的星图（星球线路）介绍页
+const landBtn = [...document.querySelectorAll('.galaxy .btn-primary')].find((b) => /着陆/.test(b.textContent || ''));
+if (landBtn) landBtn.click();
+await sleep(10);
 ok(ui.screen === 'game' && ui.player, '已进入地图界面');
 
 const enemy = ui.player.floorState.entities.find((e) => e.type === 'enemy');
diff --git a/apps/xing-hai-lv-zhe/src/config.js b/apps/xing-hai-lv-zhe/src/config.js
index ffe2f32..dd1e387 100644
--- a/apps/xing-hai-lv-zhe/src/config.js
+++ b/apps/xing-hai-lv-zhe/src/config.js
@@ -36,19 +36,21 @@ export const TILES = {
   moss:     { id: 'moss',     name: '苔石', walkable: true,  color: '#7fae6b' }, // 装饰性地砖（通行同地砖）
   crystal:  { id: 'crystal',  name: '晶簇', walkable: true,  color: '#7fd6e0' }, // 装饰性地砖
   rune:     { id: 'rune',     name: '符文', walkable: true,  color: '#b08fd6' }, // 装饰性地砖
+  ice:      { id: 'ice',      name: '冰面', walkable: true,  color: '#bfe9ff' }, // 装饰性地砖（晶穴/虚空风味）
+  ash:      { id: 'ash',      name: '灰烬', walkable: true,  color: '#c9b89a' }, // 装饰性地砖（遗迹风味）
   water:    { id: 'water',    name: '水域', walkable: false, color: PALETTE.water },
   wall:     { id: 'wall',     name: '石墙', walkable: false, color: PALETTE.stone },
   wallDark: { id: 'wallDark', name: '深墙', walkable: false, color: PALETTE.stoneDark },
   stairs:   { id: 'stairs',   name: '下行阶梯', walkable: true, color: PALETTE.gold },
 };
 // 随机生成时的全部「可行走」地块候选（无重复）；具体楼层用 floorTilesFor 按生态筛选子集。
-export const FLOOR_TILES = ['floor', 'floor2', 'sand', 'grass', 'moss', 'crystal', 'rune'];
+export const FLOOR_TILES = ['floor', 'floor2', 'sand', 'grass', 'moss', 'crystal', 'rune', 'ice', 'ash'];
 
 // 楼层生态（按楼层分段）：仅影响地图配色、地块分布与点缀风味，不影响任何战斗/通行逻辑。
 export const BIOMES = [
-  { from: 1, to: 3, key: 'ruins',  name: '遗迹地表', accent: '#c9a36a', tint: 'rgba(201,163,106,0.10)', tiles: ['floor', 'floor2', 'sand', 'grass', 'moss'],     decor: ['plant', 'rubble', 'spark'] },
-  { from: 4, to: 6, key: 'cavern', name: '晶簇洞穴', accent: '#5fb0d8', tint: 'rgba(95,176,216,0.12)', tiles: ['floor', 'floor2', 'moss', 'crystal'],              decor: ['crystal', 'spark', 'rubble'] },
-  { from: 7, to: 9, key: 'void',   name: '虚空裂隙', accent: '#9d6edb', tint: 'rgba(157,110,219,0.12)', tiles: ['floor', 'floor2', 'crystal', 'rune'],             decor: ['rune', 'crystal', 'spark'] },
+  { from: 1, to: 3, key: 'ruins',  name: '遗迹地表', accent: '#c9a36a', tint: 'rgba(201,163,106,0.10)', tiles: ['floor', 'floor2', 'sand', 'grass', 'moss', 'ash'], decor: ['plant', 'rubble', 'spark', 'flower', 'bone'] },
+  { from: 4, to: 6, key: 'cavern', name: '晶簇洞穴', accent: '#5fb0d8', tint: 'rgba(95,176,216,0.12)', tiles: ['floor', 'floor2', 'moss', 'crystal', 'ice'],         decor: ['crystal', 'spark', 'rubble', 'mushroom'] },
+  { from: 7, to: 9, key: 'void',   name: '虚空裂隙', accent: '#9d6edb', tint: 'rgba(157,110,219,0.12)', tiles: ['floor', 'floor2', 'crystal', 'rune', 'ice'],        decor: ['rune', 'crystal', 'spark', 'bone'] },
   { from: 10, to: 10, key: 'core', name: '星骸之核', accent: '#ffd93d', tint: 'rgba(255,217,61,0.14)', tiles: ['floor2', 'crystal', 'rune'],                       decor: ['rune', 'crystal', 'spark'] },
 ];
 export function biomeFor(floor) {
@@ -61,6 +63,24 @@ export function floorTilesFor(floor) {
   return list && list.length ? list : FLOOR_TILES;
 }
 
+// —— 星球（星球线路）：每颗星球对应一段楼层区间与一种生态，构成星图上的航点 ——
+// 仅决定星图的呈现与文案风味；战斗/通行/掉落仍由楼层与生态驱动，避免影响既有逻辑。
+export const PLANETS = [
+  { key: 'ruins',  name: '碎星遗迹带',   emoji: '🗿', from: 1, to: 3,  biomeKey: 'ruins',
+    desc: '上古文明崩解后漂浮的废墟。藤蔓与锈迹之间，低语般的回响时隐时现。' },
+  { key: 'cavern', name: '晶簇星穴',     emoji: '💠', from: 4, to: 6,  biomeKey: 'cavern',
+    desc: '洞穴深处，星骸晶簇自发脉动，照亮了古老矿道里潜伏的硬壳生物。' },
+  { key: 'void',   name: '虚空裂带',     emoji: '🌌', from: 7, to: 9,  biomeKey: 'void',
+    desc: '星球的裂口向虚空敞开，时间在此变得粘稠——这里栖息着最危险的掠食者。' },
+  { key: 'core',   name: '墨比乌斯之核', emoji: '🌟', from: 10, to: 10, biomeKey: 'core',
+    desc: '所有星骸的源头。文明的情感在此凝结为一颗缓慢搏动的心核。' },
+];
+// 按楼层返回所在星球（退化回退到首颗星球，保证总有归属）。
+export function planetFor(floor) {
+  const f = Math.max(1, floor || 1);
+  return PLANETS.find((p) => f >= p.from && f <= p.to) || PLANETS[0];
+}
+
 // 地图点缀（纯装饰，不占实体、不阻挡）：key -> emoji。
 export const DECOR = {
   plant:   { emoji: '🌿' },
@@ -68,6 +88,9 @@ export const DECOR = {
   crystal: { emoji: '💠' },
   spark:   { emoji: '✨' },
   rune:    { emoji: '🔮' },
+  mushroom:{ emoji: '🍄' },
+  flower:  { emoji: '🌸' },
+  bone:    { emoji: '🦴' },
 };
 
 export function tileOf(id) { return TILES[id] || TILES.floor; }
@@ -114,6 +137,43 @@ export function starterEquipment() {
   };
 }
 
+// —— 装备掉落池（武器 / 护甲 / 推进器多样性）：宝箱可掉落命名装备 ——
+// stat 为该部位的基础数值（推进器 stat 不直接生效，步数由 plus 驱动，但保留字段形状一致）。
+// minFloor 用于按楼层过滤可得品质，越深的星球越能拾到强力装备。
+export const WEAPONS = [
+  { name: '生锈砍刀', stat: 8,  minFloor: 1 },
+  { name: '合金短刀', stat: 11, minFloor: 1 },
+  { name: '晶簇长矛', stat: 14, minFloor: 4 },
+  { name: '电磁战锤', stat: 18, minFloor: 4 },
+  { name: '虚空裂刃', stat: 23, minFloor: 7 },
+  { name: '星骸圣剑', stat: 30, minFloor: 10 },
+];
+export const ARMORS = [
+  { name: '破布外衣', stat: 5,  minFloor: 1 },
+  { name: '皮甲外套', stat: 8,  minFloor: 1 },
+  { name: '晶鳞护胸', stat: 12, minFloor: 4 },
+  { name: '斥候轻甲', stat: 16, minFloor: 7 },
+  { name: '星骸战铠', stat: 22, minFloor: 10 },
+];
+export const BOOSTERS = [
+  { name: '滑轨推进器', stat: 0, minFloor: 1 },
+  { name: '弹射靴',     stat: 0, minFloor: 4 },
+  { name: '虚空滑翔翼', stat: 0, minFloor: 7 },
+];
+// 部位元信息：emoji / 中文名 / 数值名，供掉落与背包 UI 复用。
+export const GEAR_SLOT_META = {
+  weapon:  { emoji: '🗡️', label: '武器',   statName: '攻击' },
+  armor:   { emoji: '🛡️', label: '护甲',   statName: '防御' },
+  booster: { emoji: '🥾', label: '推进器', statName: '步数' },
+};
+// 按楼层返回某部位的可得装备候选（退化回退到全集，保证不空）。
+export function gearPoolFor(slot, floor) {
+  const all = slot === 'armor' ? ARMORS : slot === 'booster' ? BOOSTERS : WEAPONS;
+  const f = Math.max(1, floor || 1);
+  const pool = all.filter((g) => g.minFloor <= f);
+  return pool.length ? pool : all;
+}
+
 // —— 天赋树：三条分支（生存 / 战斗 / 幸运），消耗星骸点亮，可免费重置 ——
 export const TALENTS = [
   {
@@ -140,10 +200,14 @@ export function talentCost(branch, rank) { return (TALENT_BY_BRANCH[branch] || {
 export const ENEMIES = [
   { id: 'puppet',  name: '弃械傀儡', emoji: '🤖', minFloor: 1, hp: 26, atk: 7,  stances: { thrust: 4, slash: 3, smash: 2 }, stardust: 4,  parts: 2, exp: 6 },
   { id: 'wraith',  name: '游荡幽影', emoji: '👻', minFloor: 1, hp: 20, atk: 9,  stances: { thrust: 3, slash: 2, smash: 4 }, stardust: 5,  parts: 1, exp: 7 },
+  { id: 'spore',   name: '孢子蛛',   emoji: '🕷️', minFloor: 1, hp: 16, atk: 6,  stances: { thrust: 3, slash: 4, smash: 2 }, stardust: 3,  parts: 1, exp: 5 },
   { id: 'bat',     name: '锈翼蝠',   emoji: '🦇', minFloor: 4, hp: 34, atk: 11, stances: { thrust: 5, slash: 2, smash: 1 }, stardust: 7,  parts: 3, exp: 10 },
   { id: 'crab',    name: '晶甲蟹',   emoji: '🦀', minFloor: 4, hp: 46, atk: 10, stances: { thrust: 2, slash: 5, smash: 3 }, stardust: 8,  parts: 4, exp: 12 },
+  { id: 'shard',   name: '晶屑虫',   emoji: '🐛', minFloor: 4, hp: 30, atk: 13, stances: { thrust: 4, slash: 3, smash: 2 }, stardust: 6,  parts: 3, exp: 9 },
   { id: 'knight',  name: '残响骑士', emoji: '🛡️', minFloor: 7, hp: 60, atk: 14, stances: { thrust: 3, slash: 4, smash: 4 }, stardust: 11, parts: 5, exp: 16 },
   { id: 'stalker', name: '虚空潜行者', emoji: '👹', minFloor: 7, hp: 52, atk: 17, stances: { thrust: 4, slash: 3, smash: 3 }, stardust: 12, parts: 4, exp: 18 },
+  { id: 'warden',  name: '虚空典狱', emoji: '👁️', minFloor: 7, hp: 58, atk: 15, stances: { thrust: 3, slash: 5, smash: 2 }, stardust: 13, parts: 5, exp: 17 },
+  { id: 'reaver',  name: '星骸劫夺者', emoji: '💀', minFloor: 7, hp: 48, atk: 19, stances: { thrust: 5, slash: 2, smash: 4 }, stardust: 14, parts: 4, exp: 19 },
   { id: 'core',    name: '星骸之核', emoji: '🌟', minFloor: 10, hp: 160, atk: 20, stances: { thrust: 3, slash: 3, smash: 3 }, stardust: 60, parts: 30, exp: 100, boss: true },
 ];
 
diff --git a/apps/xing-hai-lv-zhe/src/core/player.js b/apps/xing-hai-lv-zhe/src/core/player.js
index e61f675..478a05a 100644
--- a/apps/xing-hai-lv-zhe/src/core/player.js
+++ b/apps/xing-hai-lv-zhe/src/core/player.js
@@ -7,6 +7,7 @@ import {
   MAX_PLUS, AFFIX_AT, AFFIXES, starterEquipment, enhanceCost,
   TALENTS, TALENT_BY_BRANCH, talentCost,
   expToNext, clamp, clampStat, MAX_FLOOR, MEMORY_CHAPTERS, GRID,
+  GEAR_SLOT_META,
 } from '../config.js';
 import { randInt, pick } from './rng.js';
 
@@ -166,6 +167,23 @@ export function enhanceEquipment(p, slot, rng) {
   return { ok: true, plus: e.plus, affixed, slot };
 }
 
+// 穿戴拾得的装备：整体替换对应槽位（保留 plus / 不继承旧词缀）。
+//   gear: { slot, name, stat, plus, affix } —— 来自 world.rollGearDrop。
+//   返回 { ok, slot, old, gear }，old 为被替换下的旧装备（供 UI 展示对比）。
+export function equipGear(p, gear) {
+  if (!p || !p.equipment) return { ok: false, reason: 'no-player' };
+  if (!gear || !GEAR_SLOT_META[gear.slot]) return { ok: false, reason: 'bad-gear' };
+  const slot = gear.slot;
+  const old = { ...p.equipment[slot] };
+  p.equipment[slot] = {
+    name: typeof gear.name === 'string' && gear.name ? gear.name : old.name,
+    stat: Number.isFinite(gear.stat) ? gear.stat : old.stat,
+    plus: clamp(gear.plus || 0, 0, MAX_PLUS),
+    affix: null, // 拾得装备为白板；词缀仍靠强化至 +5 触发
+  };
+  return { ok: true, slot, old, gear: p.equipment[slot] };
+}
+
 // 点亮天赋：消耗星骸。返回结果。
 export function buyTalent(p, branch) {
   const def = TALENT_BY_BRANCH[branch];
diff --git a/apps/xing-hai-lv-zhe/src/core/world.js b/apps/xing-hai-lv-zhe/src/core/world.js
index 0944dab..7f55194 100644
--- a/apps/xing-hai-lv-zhe/src/core/world.js
+++ b/apps/xing-hai-lv-zhe/src/core/world.js
@@ -5,7 +5,7 @@
 import {
   GRID, VISION_RADIUS, TILES, FLOOR_TILES, tileOf, isWalkable,
   floorConfig, enemyPoolFor, EVENT_TYPES, EVENT_META, MAX_FLOOR, MEMORY_CHAPTERS,
-  biomeFor, floorTilesFor, DECOR,
+  biomeFor, floorTilesFor, DECOR, gearPoolFor, MAX_PLUS,
 } from '../config.js';
 import { randInt, weightedPick, pick } from './rng.js';
 
@@ -67,7 +67,7 @@ export function generateFloor(rng, floor, player) {
     for (let i = 0; i < cfg.enemyCount; i++) {
       place('enemy', () => spawnEnemy(r, pool, f));
     }
-    for (let i = 0; i < cfg.chestCount; i++) place('chest', () => ({ reward: chestReward(r, f) }));
+    for (let i = 0; i < cfg.chestCount; i++) place('chest', () => chestContents(r, f));
     if (cfg.eventCount) place(pick(r, EVENT_TYPES));
   }
   // 每层 1 枚记忆回响（章节 = 楼层 - 1，对应 1..10 章）。
@@ -186,6 +186,25 @@ function chestReward(r, floor) {
   return { parts: randInt(r, 1, 3), stardust: randInt(r, 2, 4) };
 }
 
+// 宝箱内容：约 22% 概率掉落命名装备（武器/护甲/推进器），其余为资源奖励。
+// 返回 { gear } 或 { reward }，由 UI 的 resolveEntity 分别处理。
+function chestContents(r, floor) {
+  if (r() < 0.22) return { gear: rollGearDrop(r, floor) };
+  return { reward: chestReward(r, floor) };
+}
+
+// 随机生成一件掉落装备：按楼层过滤可得品质，武器权重最高；plus 随楼层缓升（不超上限）。
+export function rollGearDrop(rng, floor) {
+  const r = rng || Math.random;
+  const f = Math.max(1, floor || 1);
+  const slot = weightedPick(r, { weapon: 5, armor: 4, booster: 2 }) || 'weapon';
+  const pool = gearPoolFor(slot, f);
+  const def = pick(r, pool) || pool[0];
+  const plusMax = Math.min(MAX_PLUS, 1 + Math.floor(f / 3));
+  const plus = randInt(r, 0, plusMax);
+  return { slot, name: def.name, stat: def.stat, plus, affix: null };
+}
+
 // —— 视野（迷雾）：以 (x,y) 为中心的 5×5 切比雪夫窗口 ——
 export function visibleKeys(grid, x, y) {
   const out = [];
diff --git a/apps/xing-hai-lv-zhe/src/ui/app.js b/apps/xing-hai-lv-zhe/src/ui/app.js
index c725388..2dc21c0 100644
--- a/apps/xing-hai-lv-zhe/src/ui/app.js
+++ b/apps/xing-hai-lv-zhe/src/ui/app.js
@@ -13,12 +13,12 @@ import {
   TALENTS, TALENT_BY_BRANCH, talentCost,
   STAMINA_COST_PER_ROUND, STAMINA_REGEN_PER_STEP, STAMINA_REGEN_INTERVAL_MS, STAMINA_TIRED,
   SHOP_ITEMS, DRONE_COST, EVENT_META, MEMORY_CHAPTERS, STORY, ENDINGS, MAX_FLOOR, expToNext,
-  biomeFor, DECOR,
+  biomeFor, DECOR, PLANETS, planetFor, GEAR_SLOT_META,
 } from '../config.js';
 import {
   newPlayer, migrate, maxHp, maxStamina, effectiveAtk, effectiveDef, effectiveMoveRange,
   enhanceEquipment, buyTalent, resetTalents, gainReward, healFull, regenStamina, spendStamina,
-  isDead, collectMemory, collectedMemoryCount,
+  isDead, collectMemory, collectedMemoryCount, equipGear,
 } from '../core/player.js';
 import {
   generateFloor, findPath, reachableTiles, entityAt, removeEntity, tileAt, descend,
@@ -114,10 +114,15 @@ export class GameUI {
 
   showAbout() {
     const body = [
+      h('div', { class: 'card' },
+        h('h4', null, '🪐 星图 · 星球线路'),
+        h('div', { class: 'muted', style: { lineHeight: 1.7 } },
+          '四颗星球残骸连成一条航路。先着陆一颗进行浮岛探索；找到下行航点、越过边界，即可跃迁到下一颗星球。不同星球有不同的生物、地形与装备。点击顶部 🪐 可随时查看星图。'),
+      ),
       h('div', { class: 'card' },
         h('h4', null, '🎮 核心循环'),
         h('div', { class: 'muted', style: { lineHeight: 1.7 } },
-          '浮岛探索（点击移动）→ 触发战斗 / 宝箱 / 陷阱 → 回到背包消耗零件强化装备、用星骸点亮天赋 → 挑战更深层浮岛。'),
+          '浮岛探索（点击移动）→ 触发战斗 / 宝箱 / 陷阱 → 回到背包消耗零件强化装备、用星骸点亮天赋 → 挑战更深层浮岛。宝箱偶尔会掉落命名装备，可在弹窗中选择穿戴或丢弃。'),
       ),
       h('div', { class: 'card' },
         h('h4', null, '⚔️ 战斗：猜拳克制'),
@@ -135,6 +140,68 @@ export class GameUI {
     this.showSheet({ title: '📖 关于 / 玩法', body, foot: [h('button', { class: 'btn-primary', onClick: () => this.closeModal() }, '明白')] });
   }
 
+  // ===================== 星图（星球线路）=====================
+  // 三种模式：intro（创角后首现）、travel（跨星球跃迁）、overview（游戏中随时查看）。
+  // 星图是顶层导航：先呈现一条星球航路，进入某颗星球才是当前的浮岛探索；
+  // 探险完一颗（下行越过边界）即跃迁到下一颗。星球状态由最远到达楼层推导，无需额外存档字段。
+  showGalaxy(opts = {}) {
+    const mode = opts.intro ? 'intro' : opts.travel ? 'travel' : 'overview';
+    if (mode === 'overview' && this.screen !== 'game') return;
+    this.screen = 'galaxy';
+    this.stopLoop();
+    clear(this.modalRoot);
+    this._sheet = null;
+    this._battlePauseRemain = null;
+    clear(this.stage);
+    const p = this.player;
+    const cur = planetFor(p ? p.floor : 1);
+    const headTitle = mode === 'travel' ? '🛰️ 跃迁完成' : '🪐 星图 · 星球线路';
+    let sub;
+    if (mode === 'intro') sub = '破碎星球「墨比乌斯」的四片残骸连成一条航路。先着陆最近的一颗，再逐颗探索。';
+    else if (mode === 'travel') sub = `你穿越了裂隙，抵达「${cur.name}」。这里的生态与生物已截然不同。`;
+    else sub = `当前位于「${cur.name}」（第 ${p ? p.floor : 1} 层）。已寻回 ${p ? collectedMemoryCount(p) : 0}/10 枚星骸回响。`;
+
+    const route = h('div', { class: 'galaxy__route' }, PLANETS.map((pl) => {
+      const status = this.planetStatus(pl);
+      const tag = status === 'cleared' ? '✓ 已探索' : status === 'current' ? '● 探索中' : '🔒 未解锁';
+      return h('div', { class: `planet-node ${status}` },
+        h('div', { class: 'pn-emoji' }, pl.emoji),
+        h('div', { class: 'pn-info' },
+          h('div', { class: 'pn-name' }, pl.name),
+          h('div', { class: 'pn-floors muted' }, `第 ${pl.from}${pl.to > pl.from ? `–${pl.to}` : ''} 层`),
+          h('div', { class: 'pn-desc' }, pl.desc),
+        ),
+        h('div', { class: 'pn-tag' }, tag),
+      );
+    }));
+
+    const enter = () => this.enterGame(this.player, this.activeSlot);
+    const btnLabel = mode === 'intro' ? `🚀 着陆「${cur.name}」`
+      : mode === 'travel' ? `继续探索「${cur.name}」` : '返回探索';
+
+    const wrap = h('div', { class: 'launcher galaxy' },
+      h('div', { class: 'galaxy__head' },
+        h('h1', null, headTitle),
+        h('p', { class: 'sub' }, sub),
+      ),
+      route,
+      h('div', { class: 'create__foot' },
+        h('button', { class: 'btn-primary big-btn', onClick: enter }, btnLabel),
+      ),
+      h('p', { class: 'launcher__hint muted' }, '找到下行航点并跃迁，即可前往下一颗星球。不同星球栖息着不同的生物，也埋藏着不同的装备。'),
+    );
+    this.stage.appendChild(wrap);
+  }
+
+  // 星球在星图上的状态：已探索 / 探索中 / 未解锁。
+  planetStatus(pl) {
+    const p = this.player;
+    if (!p || !Number.isFinite(p.maxFloor)) return pl.from === 1 ? 'current' : 'locked';
+    if (p.maxFloor > pl.to) return 'cleared';
+    if (p.maxFloor >= pl.from) return 'current';
+    return 'locked';
+  }
+
   // ===================== 存档管理（多槽位）=====================
   showSlots(fromLauncher) {
     const list = listSaves();
@@ -236,11 +303,13 @@ export class GameUI {
 
   finalizeCreate(p, slot) {
     this.activeSlot = slot;
+    this.player = p;
     p.floorState = generateFloor(this.rng, p.floor, p);
-    this.enterGame(p, slot);
     this.pushLog(STORY.prologue, 'milestone');
     saveToSlot(this.activeSlot, this.player); // 序章写入后补存，避免重载前首条故事丢失
     this.toast(`已保存到 #${slot + 1} 号槽位`, 'good');
+    // 先呈现星图（星球线路），玩家「着陆」后再进入当前星球的探索。
+    this.showGalaxy({ intro: true });
   }
 
   confirmOverwriteSlot(slot, onConfirm) {
@@ -314,6 +383,8 @@ export class GameUI {
         h('span', { class: 'status-name' }, p.name),
         h('span', { class: 'status-lv' }, `Lv${p.level}`),
         h('span', { class: 'status-floor' }, '第 ', h('b', null, String(p.floor)), ` / ${MAX_FLOOR} 层`),
+        h('span', { class: 'grow' }),
+        h('button', { class: 'galaxy-btn', title: '星图 · 星球线路', onClick: () => this.showGalaxy({ overview: true }) }, '🪐'),
         h('span', { class: 'status-res' },
           h('span', { class: 'r' }, h('span', null, '✨'), this.sdEl = h('span', null, String(p.stardust))),
           h('span', { class: 'r' }, h('span', null, '🔩'), this.ptEl = h('span', null, String(p.parts))),
@@ -467,6 +538,16 @@ export class GameUI {
   resolveEntity(ent) {
     const st = this.state();
     if (ent.type === 'chest') {
+      // 装备宝箱：弹窗选择装备 / 丢弃（中止移动）。
+      if (ent.gear) {
+        const gear = ent.gear;
+        removeEntity(st, ent.id);
+        // 立即落盘「宝箱已开启」：装备/丢弃均在此后于弹窗内决定，
+        // 避免丢弃后重载又让该宝箱复现。
+        saveToSlot(this.activeSlot, this.player);
+        this.offerGear(gear);
+        return true;
+      }
       const r = ent.reward || {};
       // 用 gainReward 的实发量（含幸运加成）展示，避免飘字与状态栏不一致。
       const g = gainReward(this.player, r, this.rng);
@@ -595,14 +676,22 @@ export class GameUI {
   descendFloor() {
     const st = this.state();
     if (tileAt(st, st.pos.x, st.pos.y) !== 'stairs') { this.toast('需站在下行阶梯上', 'normal'); return; }
+    const fromPlanet = planetFor(this.player.floor);
     descend(this.player);
+    const toPlanet = planetFor(this.player.floor);
     this.player.floorState = generateFloor(this.rng, this.player.floor, this.player);
     this.pushLog(`⬇️ 降至第 ${this.player.floor} 层浮岛。`, 'milestone');
     if (this.player.floor === 3) this.pushLog(STORY.midpoint, 'milestone');
+    saveToSlot(this.activeSlot, this.player);
+    // 跨越星球边界：呈现星图跃迁（一个星球探索完，前往下一个星球）。
+    if (fromPlanet.key !== toPlanet.key) {
+      this.toast(`跃迁至「${toPlanet.name}」`, 'good');
+      this.showGalaxy({ travel: true });
+      return;
+    }
     this.refreshStatus();
     this.renderMap();
     this.refreshInteract();
-    saveToSlot(this.activeSlot, this.player);
     this.toast(`进入第 ${this.player.floor} 层`, 'good');
   }
 
@@ -1144,6 +1233,49 @@ export class GameUI {
     saveToSlot(this.activeSlot, this.player);
   }
 
+  // —— 装备宝箱：对比当前装备，选择穿戴或丢弃 ——
+  offerGear(gear) {
+    const p = this.player;
+    const meta = GEAR_SLOT_META[gear.slot];
+    if (!meta) { this.toast('未知装备', 'bad'); return; }
+    const curStat = statForSlot(p, gear.slot);
+    const newStat = statForSlot(p, gear.slot, gear);
+    const better = newStat >= curStat;
+    const plusTxt = gear.plus > 0 ? ` +${gear.plus}` : '';
+    const body = [
+      h('div', { class: 'gear-drop' },
+        h('div', { class: 'gd-emoji' }, meta.emoji),
+        h('div', { class: 'gd-name' }, gear.name, h('span', { class: 'plus' }, plusTxt)),
+        h('div', { class: 'muted', style: { fontSize: '0.8rem', marginTop: '0.15rem' } },
+          `${meta.label} · ${better ? '比当前更强' : '不及当前装备'}`),
+        h('div', { class: 'gd-compare' },
+          h('div', { class: 'gd-stat cur' }, `当前 ${meta.statName} ${curStat}`),
+          h('div', { class: 'gd-stat new' }, `新 ${meta.statName} ${newStat}`),
+        ),
+      ),
+    ];
+    this.showSheet({
+      title: `拾得${meta.label}`,
+      body,
+      foot: [
+        h('button', { class: 'btn-primary', onClick: () => this.takeGear(gear) }, '装备'),
+        h('button', { class: 'btn-ghost', onClick: () => { this.closeModal(); this.pushLog(`丢弃 ${gear.name}${plusTxt}`, 'normal'); } }, '丢弃'),
+      ],
+    });
+    this.toast(`拾得${meta.label}！`, 'good');
+  }
+
+  takeGear(gear) {
+    const res = equipGear(this.player, gear);
+    this.closeModal();
+    if (!res.ok) { this.toast('无法装备', 'bad'); return; }
+    saveToSlot(this.activeSlot, this.player);
+    this.refreshStatus();
+    const plusTxt = gear.plus > 0 ? ` +${gear.plus}` : '';
+    this.pushLog(`🛡️ 装备「${gear.name}${plusTxt}」`, 'good');
+    this.toast(`已装备 ${gear.name}`, 'good');
+  }
+
   // ===================== 设置 / 存档 =====================
   showSettings(fromLauncher) {
     const p = this.player;
@@ -1401,6 +1533,18 @@ function spentStardust(p) {
   }
   return s;
 }
+// 计算某部位在（可选）装备覆盖下的当前数值，用于装备掉落的前后对比。
+function statForSlot(p, slot, override) {
+  const eq = {
+    weapon: slot === 'weapon' && override ? override : p.equipment.weapon,
+    armor: slot === 'armor' && override ? override : p.equipment.armor,
+    booster: slot === 'booster' && override ? override : p.equipment.booster,
+  };
+  const mock = { ...p, equipment: eq };
+  if (slot === 'weapon') return effectiveAtk(mock);
+  if (slot === 'armor') return effectiveDef(mock);
+  return effectiveMoveRange(mock);
+}
 function nowMs() {
   try { return Date.now(); } catch (_) { return 0; }
 }
diff --git a/apps/xing-hai-lv-zhe/src/ui/style.css b/apps/xing-hai-lv-zhe/src/ui/style.css
index c37452c..ad9d74c 100644
--- a/apps/xing-hai-lv-zhe/src/ui/style.css
+++ b/apps/xing-hai-lv-zhe/src/ui/style.css
@@ -219,6 +219,8 @@
 .xhlz .cell.t-wall     { background-color: #5d5376; background-image: linear-gradient(rgba(0,0,0,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.18) 1px, transparent 1px); background-size: 50% 50%, 50% 50%; }
 .xhlz .cell.t-wallDark { background-color: #3a3a4a; background-image: linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px); background-size: 50% 50%, 50% 50%; }
 .xhlz .cell.t-stairs   { background-color: #ffd93d; background-image: repeating-linear-gradient(0deg, rgba(120,80,0,0.32) 0 2px, transparent 2px 5px); }
+.xhlz .cell.t-ice      { background-color: #bfe9ff; background-image: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.7), transparent 50%), radial-gradient(circle at 70% 70%, rgba(120,170,220,0.32), transparent 55%); }
+.xhlz .cell.t-ash      { background-color: #c9b89a; background-image: radial-gradient(circle at 40% 40%, rgba(255,255,255,0.22), transparent 45%), radial-gradient(circle at 75% 65%, rgba(90,70,40,0.20), transparent 55%); }
 @keyframes xhlz-water { from { background-position: 0 0; } to { background-position: 0 6px; } }
 @keyframes xhlz-bob { 0%,100% { transform: scale(1); } 50% { transform: scale(0.86); } }
 @keyframes xhlz-glow { 0%,100% { filter: drop-shadow(0 0 0 #ffd93d); } 50% { filter: drop-shadow(0 0 4px #ffd93d); } }
@@ -382,3 +384,55 @@
 .xhlz .toast.hide { animation: xhlz-toast-out 0.3s ease forwards; }
 @keyframes xhlz-toast-in { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: none; } }
 @keyframes xhlz-toast-out { to { opacity: 0; transform: translateY(-8px); } }
+
+/* —— 顶部星图按钮 —— */
+.xhlz .galaxy-btn {
+  flex: none; padding: 0.2rem 0.5rem; font-size: 0.95rem; line-height: 1;
+  background: var(--card); border: 1px solid var(--line); box-shadow: 0 2px 0 var(--line-2);
+  border-radius: 9px;
+}
+.xhlz .galaxy-btn:active { transform: translateY(2px); box-shadow: none; }
+
+/* —— 星图（星球线路）—— */
+.xhlz .galaxy { justify-content: flex-start; }
+.xhlz .galaxy__head { text-align: center; margin-bottom: 0.7rem; }
+.xhlz .galaxy__head h1 { margin: 0; font-size: 1.25rem; }
+.xhlz .galaxy__head .sub { margin: 0.25rem 0 0; color: var(--ink-soft); font-size: 0.82rem; line-height: 1.55; }
+.xhlz .galaxy__route { display: flex; flex-direction: column; gap: 0.55rem; margin-bottom: 0.7rem; }
+.xhlz .planet-node {
+  position: relative; display: flex; align-items: center; gap: 0.6rem;
+  padding: 0.6rem 0.7rem; border-radius: 14px; border: 2px solid var(--line);
+  background: linear-gradient(180deg, var(--card), var(--card-2));
+  transition: transform 0.12s ease;
+}
+.xhlz .planet-node:not(:last-child)::after {
+  content: ''; position: absolute; left: 1.55rem; bottom: -0.55rem; width: 3px; height: 0.55rem;
+  background: var(--line-2); border-radius: 2px;
+}
+.xhlz .planet-node .pn-emoji {
+  flex: none; width: 2.6rem; height: 2.6rem; display: flex; align-items: center; justify-content: center;
+  font-size: 1.7rem; border-radius: 50%; background: radial-gradient(circle at 35% 30%, #fffdf6, var(--bg-2));
+  border: 1px solid var(--line);
+}
+.xhlz .planet-node .pn-info { flex: 1; min-width: 0; }
+.xhlz .planet-node .pn-name { font-weight: 800; font-size: 0.98rem; }
+.xhlz .planet-node .pn-floors { font-size: 0.72rem; margin-top: 0.05rem; }
+.xhlz .planet-node .pn-desc { font-size: 0.78rem; color: var(--ink-soft); margin-top: 0.15rem; line-height: 1.45; }
+.xhlz .planet-node .pn-tag { flex: none; font-size: 0.7rem; font-weight: 800; padding: 0.18rem 0.5rem; border-radius: 999px; white-space: nowrap; }
+.xhlz .planet-node.cleared { border-color: var(--good); }
+.xhlz .planet-node.cleared .pn-tag { background: rgba(87,199,133,0.18); color: #2f9a72; }
+.xhlz .planet-node.current { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(255,217,61,0.30); }
+.xhlz .planet-node.current .pn-tag { background: rgba(255,217,61,0.22); color: #7a5a00; }
+.xhlz .planet-node.current .pn-emoji { animation: xhlz-bob 1.3s ease-in-out infinite; }
+.xhlz .planet-node.locked { opacity: 0.55; filter: saturate(0.6); }
+.xhlz .planet-node.locked .pn-tag { background: rgba(58,58,74,0.1); color: var(--muted); }
+
+/* —— 装备掉落弹窗 —— */
+.xhlz .gear-drop { text-align: center; }
+.xhlz .gear-drop .gd-emoji { font-size: 2.4rem; }
+.xhlz .gear-drop .gd-name { font-weight: 800; font-size: 1.05rem; margin-top: 0.2rem; }
+.xhlz .gear-drop .gd-name .plus { color: var(--gold); }
+.xhlz .gear-drop .gd-compare { margin-top: 0.55rem; display: flex; justify-content: center; gap: 0.6rem; }
+.xhlz .gear-drop .gd-stat { padding: 0.4rem 0.65rem; border-radius: 10px; background: var(--card-2); border: 1px solid var(--line); font-size: 0.85rem; font-weight: 700; }
+.xhlz .gear-drop .gd-stat.cur { color: var(--ink-soft); }
+.xhlz .gear-drop .gd-stat.new { color: #2f9a72; border-color: var(--good); }
