diff --git a/.ai-tasks/issue-102/ai-coder-prompt.md b/.ai-tasks/issue-102/ai-coder-prompt.md
new file mode 100644
index 0000000..e6c342e
--- /dev/null
+++ b/.ai-tasks/issue-102/ai-coder-prompt.md
@@ -0,0 +1,8 @@
+你是一个资深开发者。请解决以下 GitHub Issue：
+【任务标题】: 大富翁优化
+【详细需求】: 请直接阅读当前目录下的 .ai-tasks/issue-102/context.md 文件获取。
+
+【⚠️ 严格红线规则】：
+请绝对不要修改、重命名或生成 .github/ 目录下的任何文件 (特别是 workflows 等 CI/CD 配置)，这会破坏项目的自动化流程！如果觉得有必要修改，请在回复中用文字建议人类去改，绝不要自己动手改。
+
+请直接分析并修改项目中的代码文件来解决这个问题，不要做过多的文字解释。
diff --git a/.ai-tasks/issue-102/context.md b/.ai-tasks/issue-102/context.md
new file mode 100644
index 0000000..e4c267d
--- /dev/null
+++ b/.ai-tasks/issue-102/context.md
@@ -0,0 +1,5 @@
+- 角色人物要有不同属性才有选的意义呀，当前都一模一样，就名字不一样…比如有个人初始成本多一些，运气好一些等等
+- 22回合太少了，一圈才刚走完就差不多结束了，不建议设定回合数，可以考虑按照资金作为结束标志…比如综合资金低于0就淘汰
+-  地图中可以增加商店，比如可以花钱买骰子（就走的快些，当然要设置上限）等等
+- 中间的地图太空了，不要全部都围成一个圈在最外围，可以走一些内部弯曲的路
+- 也可以参考业界优秀实践增加一些丰富的玩法
diff --git a/apps/da-fu-weng/scripts/logic-test.mjs b/apps/da-fu-weng/scripts/logic-test.mjs
index bf5e353..e72100c 100644
--- a/apps/da-fu-weng/scripts/logic-test.mjs
+++ b/apps/da-fu-weng/scripts/logic-test.mjs
@@ -1,22 +1,25 @@
 // ============================================================================
 // 大富翁 · 核心逻辑自测（纯 Node，无浏览器依赖）。
-// 覆盖：地图生成（6 图尺寸/四角/街区/确定性）、经济数值、移动与起点工资、
-//       购地升级租金垄断、特殊格、机会命运卡全效果、支付与自动变卖、破产终局、
-//       回合轮转与按图上限、AI 决策阈值、随机种子确定性、地图解锁、存档往返。
+// 覆盖：地图生成（6 图尺寸/内街闭环/四角/街区/确定性）、经济数值、角色天赋、
+//       移动与起点工资、购地升级租金垄断（含购地折扣）、特殊格（含罚金减免）、
+//       机会命运卡全效果、双骰对子/连三对入狱/顺风骰、商店道具与上限/均富卡/护身符、
+//       支付与自动变卖、破产终局（淘汰制无回合上限）、回合轮转与对子加掷、
+//       AI 决策与 AI 采购、随机种子确定性、地图解锁、存档往返。
 // 运行：node scripts/logic-test.mjs
 // ============================================================================
 import {
-  MAPS, mapDefOf, buildBoard, boardOf, perimeterOf, tileGrid, PALETTE,
-  CHANCE_CARDS, FATE_CARDS, START_CASH, SALARY, SALARY_LAND_BONUS,
-  JAIL_FINE, HOSPITAL_FEE, TAX_MIN, TAX_MAX,
+  MAPS, mapDefOf, buildBoard, boardOf, pathOf, tileCountOf, decoCells, PALETTE,
+  CHANCE_CARDS, FATE_CARDS, SHOP_ITEMS, START_CASH, SALARY, SALARY_LAND_BONUS,
+  JAIL_FINE, HOSPITAL_FEE, TAX_MIN, TAX_MAX, boomMult,
   baseRent, rentOf, upgradeCost, taxOf,
 } from '../src/config.js';
 import {
   newGame, rollAndMove, resolveTile, buyTile, upgradeTile, declineDecision,
   endTurn, aiDecide, ranking, ownedTilesOf, ownedInDistrict,
   hasMonopoly, movePlayer, payTo, mapOf,
+  buyItem, leaveShop, applyEqualize, aiShopBuy, buyPriceOf, fineOf,
 } from '../src/core/game.js';
-import { rollDice } from '../src/core/rng.js';
+import { rollDice, rollTwoDice } from '../src/core/rng.js';
 import { saveToSlot, loadFromSlot, deleteSlot, exportSave, importSave, _setStorage } from '../src/core/save.js';
 import { loadMeta, saveMeta, isUnlocked, unlockNext, _setStorage as metaStorage } from '../src/core/meta.js';
 
@@ -28,34 +31,39 @@ const firstOf = (st, type) => boardOf(st.mapKey).findIndex((t) => t.type === typ
 const propTilesOf = (st) => boardOf(st.mapKey).map((t, i) => (t.type === 'prop' ? i : -1)).filter((i) => i >= 0);
 
 // —— 地图生成 ——
-section('地图生成');
+section('地图生成（外环 + 内街）');
 ok(MAPS.length === 6, '6 张可选地图');
-const expectSize = [50, 56, 60, 66, 72, 80];
+const expectSize = [72, 82, 90, 96, 108, 118];
 MAPS.forEach((m, i) => {
-  const n = perimeterOf(m);
+  const n = tileCountOf(m);
   const tiles = buildBoard(m);
   ok(n === expectSize[i] && tiles.length === n, `${m.name} ${n} 格`);
-  ok(tiles[0].type === 'start' && tiles[m.cols - 1].type === 'jail'
-    && tiles[m.cols + m.rows - 2].type === 'hospital' && tiles[2 * m.cols + m.rows - 3].type === 'park',
-    `${m.name} 四角特殊格正确`);
+  const path = pathOf(m);
+  const idxOf = (t) => tiles.findIndex((x) => x.type === t);
+  ok(tiles[0].type === 'start' && path[0].row === m.rows && path[0].col === 1, `${m.name} 起点在左下`);
+  const j = idxOf('jail');
+  ok(path[j].row === m.rows && path[j].col === m.cols, `${m.name} 监狱在右下`);
+  const hi = idxOf('hospital');
+  ok(path[hi].row === 1 && path[hi].col === m.cols, `${m.name} 医院在右上`);
+  const pk = idxOf('park');
+  ok(path[pk].row === 1 && path[pk].col === 1, `${m.name} 御园在左上`);
+  // 路径唯一 + 闭环 + 格格正交相邻
+  const set = new Set(path.map((g) => `${g.row}:${g.col}`));
+  let adj = true;
+  for (let k = 0; k < n; k++) {
+    const a = path[k], b = path[(k + 1) % n];
+    if (Math.abs(a.row - b.row) + Math.abs(a.col - b.col) !== 1) adj = false;
+  }
+  ok(set.size === n && adj, `${m.name} 路径闭环且格格相邻`);
+  // 内街确实穿行腹地（不在最外圈上的路径格）
+  const inner = path.filter((g) => g.row >= 2 && g.row <= m.rows - 1 && g.col >= 2 && g.col <= m.cols - 1);
+  ok(inner.length >= 10, `${m.name} 内街深入腹地（${inner.length} 格）`);
+  ok(tiles.some((t) => t.type === 'shop'), `${m.name} 有商店`);
   const dists = new Set(tiles.filter((t) => t.type === 'prop').map((t) => t.district));
   ok(dists.size === m.districts.length, `${m.name} 覆盖全部 ${m.districts.length} 街区`);
   ok(JSON.stringify(buildBoard(m)) === JSON.stringify(tiles), `${m.name} 棋盘生成确定性`);
 });
-// 网格坐标覆盖（以最大图验证）
-{
-  const m = MAPS[5];
-  const n = perimeterOf(m);
-  const seen = new Set();
-  let all = true;
-  for (let i = 0; i < n; i++) {
-    const g = tileGrid(i, m.cols, m.rows);
-    const key = g.row + ',' + g.col;
-    if (seen.has(key) || g.row < 1 || g.row > m.rows || g.col < 1 || g.col > m.cols) all = false;
-    seen.add(key);
-  }
-  ok(all && seen.size === n, '网格坐标唯一且在界内（80 格）');
-}
+ok(decoCells(MAPS[0]).length > 0 && decoCells(MAPS[5]).length > 0, '腹地点缀风景存在');
 // 解锁链
 ok(MAPS[0].unlock === null && MAPS.slice(1).every((m, i) => m.unlock === MAPS[i].key), '地图解锁链完整');
 
@@ -69,12 +77,17 @@ ok(rentOf(t80, 3, true) === Math.round(Math.round(Math.round(t80.price * 0.3) *
 ok(upgradeCost(t80, 1) === Math.round(t80.price * 0.6), '升级花费比例');
 ok(taxOf(100) === TAX_MIN && taxOf(999999) === TAX_MAX && taxOf(2400) === 240, '税款下限/上限/一成');
 
-// —— 建档 ——
-section('建档');
-st = newGame({ heroKey: 'girl', aiCount: 2, mapKey: 'port', seed: 42 });
-ok(st.mapKey === 'port' && st.tiles.length === 56, '港都商埠 56 格');
-ok(st.players.length === 3 && st.players[0].name === '小蛮' && !st.players[0].isAI, '主角小蛮 + 2 AI');
-ok(st.players.every((p) => p.cash === START_CASH && p.pos === 0), '初始现金与起点');
+// —— 建档（含角色天赋）——
+section('建档与天赋');
+st = newGame({ heroKey: 'lady', aiCount: 2, mapKey: 'port', seed: 42 });
+ok(st.mapKey === 'port' && st.tiles.length === 82, '港都商埠 82 格');
+ok(st.players.length === 3 && st.players[0].name === '千金' && !st.players[0].isAI, '主角千金 + 2 AI');
+ok(st.players.every((p) => p.pos === 0 && p.items && p.items.swift === 0 && p.items.charms === 0 && p.equalBought === 0), '初始位置与道具栏');
+ok(st.players[0].cash === START_CASH + 600, '千金天赋：本金 +600');
+ok(st.players[1].cash === START_CASH + 500 && st.players[1].perk.trade === 0.10, '钱老板天赋：本金 +500 / 九折');
+ok(st.players[2].perk.tough === 0.6 && st.players[2].perk.luck === 0.10, '夜行客天赋：罚金减免 + 骰运');
+ok(buyPriceOf(t80, { perk: { trade: 0.15 } }) === Math.round(t80.price * 0.85), '购地折扣计算');
+ok(fineOf(120, { perk: { tough: 0.5 } }) === 60, '罚金减免计算');
 ok(newGame({ heroKey: 'nobody', aiCount: 9, mapKey: 'nope' }).mapKey === 'oldtown', '非法参数回退默认图');
 
 // —— 移动与起点工资 ——
@@ -129,6 +142,17 @@ ok(res.amount === Math.round(Math.round(Math.round(price * 0.3) * 1.9) * 1.5), '
 st.tiles[pA].level = 3; st.players[0].pos = pA; st.turnIdx = 0; st.phase = 'resolve';
 res = resolveTile(st);
 ok(res.kind === 'info' && st.phase === 'end', '满级自家地仅提示');
+// 小蛮购地八五折
+{
+  const st2 = newGame({ heroKey: 'girl', aiCount: 1, mapKey: 'oldtown', seed: 3 });
+  const pg = propTilesOf(st2)[0];
+  st2.players[0].pos = pg; st2.phase = 'resolve';
+  const r2 = resolveTile(st2);
+  const cost = Math.round(boardOf('oldtown')[pg].price * 0.85);
+  ok(r2.kind === 'buy' && r2.price === cost && r2.listPrice === boardOf('oldtown')[pg].price, '小蛮天赋：购地八五折报价');
+  buyTile(st2, pg);
+  ok(st2.players[0].cash === START_CASH - cost && st2.tiles[pg].spent === cost, '按折扣价购入');
+}
 
 // —— 特殊格 ——
 section('特殊格');
@@ -140,7 +164,7 @@ ok(res.kind === 'tax' && res.amount === Math.max(TAX_MIN, taxOf(START_CASH)), '
 const jailIdx = firstOf(st, 'jail');
 st.players[0].pos = jailIdx; st.phase = 'resolve';
 res = resolveTile(st);
-ok(res.kind === 'jail' && st.players[0].skipTurns === 1 && st.players[0].cash < START_CASH, '监狱罚款+停掷');
+ok(res.kind === 'jail' && res.players !== null && st.players[0].skipTurns === 1 && st.players[0].cash < START_CASH, '监狱罚款+停掷');
 const hospIdx = firstOf(st, 'hospital');
 st.players[0].pos = hospIdx; st.phase = 'resolve';
 res = resolveTile(st);
@@ -149,6 +173,16 @@ const parkIdx = firstOf(st, 'park');
 st.players[0].pos = parkIdx; st.phase = 'resolve';
 res = resolveTile(st);
 ok(res.kind === 'info', '御园无事');
+// 剑侠：罚款/医药费减半
+{
+  const stS = newGame({ heroKey: 'sword', aiCount: 1, mapKey: 'oldtown', seed: 5 });
+  stS.players[0].pos = firstOf(stS, 'jail'); stS.phase = 'resolve';
+  const rS = resolveTile(stS);
+  ok(rS.kind === 'jail' && rS.fine === Math.round(JAIL_FINE * 0.5) && stS.players[0].cash === START_CASH - Math.round(JAIL_FINE * 0.5), '剑侠天赋：监狱罚金减半');
+  stS.players[0].pos = firstOf(stS, 'hospital'); stS.phase = 'resolve';
+  const rH = resolveTile(stS);
+  ok(rH.kind === 'hospital' && rH.fee === Math.round(HOSPITAL_FEE * 0.5), '剑侠天赋：医药费减半');
+}
 
 // —— 卡牌效果（定向种子命中目标卡）——
 section('机会/命运卡');
@@ -198,6 +232,118 @@ st.tiles[pA].level = 1;
 resolveTile(st);
 ok(st.tiles[pA].level === 2, '机会卡：免费升级');
 
+// —— 双骰：对子加掷 / 连三对入狱 / 顺风骰 ——
+section('双骰机制');
+function rngSeq(seed, k) {
+  const out = [];
+  let t = seed | 0;
+  for (let i = 0; i < k; i++) {
+    t = (t + 0x6d2b79f5) | 0;
+    let x = Math.imul(t ^ (t >>> 15), t | 1);
+    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
+    out.push(((x ^ (x >>> 14)) >>> 0) / 4294967296);
+  }
+  return out;
+}
+function seedForDice(want1, want2) {
+  for (let s = 1; s < 999999; s++) {
+    const [a, b] = rngSeq(s, 2);
+    if (Math.floor(a * 6) + 1 === want1 && Math.floor(b * 6) + 1 === want2) return s;
+  }
+  return 1;
+}
+st = newGame({ heroKey: 'boy', aiCount: 1, mapKey: 'oldtown', seed: 1 });
+st.rng = seedForDice(2, 5);
+let rr = rollAndMove(st);
+ok(rr.ok && rr.d1 === 2 && rr.d2 === 5 && st.players[0].pos === 7 && rr.doubles === false, '双骰合计前进（2+5=7）');
+ok(st.extra === false && st.doubles === 0 && st.lastRoll[0] === 2 && st.lastRoll[1] === 5, '非对子不加掷，记录双骰');
+st.phase = 'roll';
+st.rng = seedForDice(3, 3);
+rr = rollAndMove(st);
+ok(rr.doubles === true && st.extra === true && st.doubles === 1, '对子标记加掷');
+st.phase = 'end';
+let et2 = endTurn(st);
+ok(et2.again === true && st.turnIdx === 0 && st.phase === 'roll', '对子后同一玩家加掷');
+st.phase = 'end';
+et2 = endTurn(st);
+ok(!et2.again && st.turnIdx === 1 && st.doubles === 0 && st.round === 1, '加掷后正常交棒');
+// 连掷三对 → 入狱
+{
+  const st3 = newGame({ heroKey: 'boy', aiCount: 1, mapKey: 'oldtown', seed: 2 });
+  let r3 = null;
+  for (let k = 0; k < 3; k++) {
+    st3.rng = seedForDice(4, 4);
+    st3.phase = 'roll';
+    r3 = rollAndMove(st3);
+  }
+  ok(r3.jailed === true && st3.players[0].pos === firstOf(st3, 'jail') && st3.players[0].skipTurns === 1, '连掷三对押入监狱');
+  ok(st3.players[0].cash === START_CASH - JAIL_FINE && st3.phase === 'end' && st3.extra === false, '入狱罚款并收尾');
+}
+// 顺风骰
+st = newGame({ heroKey: 'boy', aiCount: 1, mapKey: 'oldtown', seed: 4 });
+st.players[0].items.swift = 3;
+st.rng = seedForDice(1, 3);
+st.phase = 'roll';
+const rw = rollAndMove(st);
+ok(rw.dice === 6 && st.players[0].pos === 6 && st.players[0].items.swift === 2, '顺风骰 +2 步并消耗次数');
+// 骰运重掷（luck=1 必重掷低点）
+{
+  const lk = rollTwoDice({ rng: 77 }, 1);
+  ok(lk.d1 >= 1 && lk.d1 <= 6 && lk.d2 >= 1 && lk.d2 <= 6, '骰运重掷结果合法');
+}
+
+// —— 商店：道具 / 上限 / 均富卡 / 护身符 ——
+section('商店与道具');
+st = newGame({ heroKey: 'boy', aiCount: 1, mapKey: 'oldtown', seed: 6 });
+const shopIdx = firstOf(st, 'shop');
+ok(shopIdx > 0, '地图上存在商店格');
+st.players[0].pos = shopIdx; st.phase = 'resolve';
+const rsh = resolveTile(st);
+ok(rsh.kind === 'shop' && st.phase === 'shop', '落地商店进入购物阶段');
+st.players[0].cash = 50;
+ok(buyItem(st, 'swift').ok === false, '现金不足不能购买');
+st.players[0].cash = 1000;
+ok(buyItem(st, 'swift').ok === true && st.players[0].cash === 1000 - 140 && st.players[0].items.swift === 3, '购顺风骰（140，生效 3 次）');
+buyItem(st, 'swift');
+ok(st.players[0].items.swift === 6, '顺风骰叠加至 6');
+ok(buyItem(st, 'swift').ok === false, '顺风骰达 6 次上限');
+ok(buyItem(st, 'charm').ok === true && st.players[0].items.charms === 1, '购护身符');
+buyItem(st, 'charm');
+ok(buyItem(st, 'charm').ok === false && st.players[0].items.charms === 2, '护身符 2 枚上限');
+st.players[1].cash = 3000;
+const mine0 = st.players[0].cash;
+ok(buyItem(st, 'equal').ok === true, '购均富卡');
+const totalEq = mine0 - 260 + 3000; // 购卡先扣 260，再与最富对手平分
+ok(st.players[0].cash === Math.round(totalEq / 2) && st.players[1].cash === totalEq - Math.round(totalEq / 2), '均富卡与最富对手拉平现金');
+ok(st.players[0].equalBought === 1, '均富卡限购计数');
+st.players[0].cash = 5000;
+buyItem(st, 'equal');
+ok(buyItem(st, 'equal').ok === false, '均富卡每局限 2 张');
+leaveShop(st);
+ok(st.phase === 'end', '离开商店回到收尾');
+// 护身符自动抵租
+{
+  const stC = newGame({ heroKey: 'boy', aiCount: 1, mapKey: 'oldtown', seed: 8 });
+  const pB = propTilesOf(stC)[1];
+  stC.tiles[pB].owner = 1; stC.tiles[pB].level = 1; stC.tiles[pB].spent = 100;
+  stC.players[0].items.charms = 1;
+  stC.players[0].pos = pB; stC.phase = 'resolve';
+  const rc = resolveTile(stC);
+  ok(rc.kind === 'charm' && stC.players[0].items.charms === 0 && stC.players[0].cash === START_CASH, '护身符自动抵消租金');
+}
+// AI 采购
+{
+  const stA = newGame({ heroKey: 'boy', aiCount: 1, mapKey: 'oldtown', seed: 10 });
+  stA.turnIdx = 1; stA.phase = 'shop';
+  stA.players[1].cash = 2000;
+  stA.players[0].cash = 5000; // 拉开差距 → 触发均富卡
+  stA.players[1].items.swift = 6;   // 其余道具已满，隔离均富卡行为
+  stA.players[1].items.charms = 2;
+  const bought = aiShopBuy(stA);
+  ok(bought.length === 1 && bought.includes('equal'), 'AI 落后时买均富卡');
+  ok(stA.players[0].cash + stA.players[1].cash === 2000 + 5000 - 260 && stA.players[0].cash === stA.players[1].cash, '均富卡拉平双方现金');
+}
+
 // —— 支付：自动变卖与破产 ——
 section('支付与破产');
 st = newGame({ heroKey: 'boy', aiCount: 1, mapKey: 'oldtown', seed: 11 });
@@ -207,13 +353,21 @@ let paid = payTo(st, 0, 1, 100);
 ok(paid.sold.length === 1 && st.tiles[pA].owner === -1 && !paid.bankrupt, '现金不足自动变卖且未破产');
 st = newGame({ heroKey: 'boy', aiCount: 1, mapKey: 'oldtown', seed: 13 });
 st.players[0].cash = 30;
+const aiStart = st.players[1].cash; // AI 钱老板自带天赋本金
 paid = payTo(st, 0, 1, 900);
 ok(paid.bankrupt && st.players[0].bankrupt, '无力偿付破产');
-ok(st.players[1].cash === START_CASH + 30, '债权人拿到剩余现金');
+ok(st.players[1].cash === aiStart + 30, '债权人拿到剩余现金');
 ok(ownedTilesOf(st, 0).length === 0 && st.finished && st.finished.reason === 'last', '地产释放 + 仅剩一家终局');
+// 主角破产（还有 AI 存活）→ 直接终局
+{
+  const stD = newGame({ heroKey: 'boy', aiCount: 2, mapKey: 'oldtown', seed: 13 });
+  stD.players[0].cash = 30;
+  payTo(stD, 0, 1, 900);
+  ok(stD.finished && stD.finished.reason === 'dead', '主角破产即终局结算');
+}
 
-// —— 回合轮转 / 停掷 / 按图上限 ——
-section('回合轮转');
+// —— 回合轮转 / 停掷 / 无回合上限 ——
+section('回合轮转（淘汰制）');
 st = newGame({ heroKey: 'boy', aiCount: 2, mapKey: 'oldtown', seed: 15 });
 st.phase = 'end';
 endTurn(st);
@@ -224,12 +378,12 @@ st.players[1].skipTurns = 1;
 st.turnIdx = 1; st.phase = 'roll';
 const r = rollAndMove(st);
 ok(r.skipped === true && st.players[1].skipTurns === 0 && st.phase === 'end', '停掷回合被消化');
-st.round = mapOf(st).rounds; st.turnIdx = 2; st.phase = 'end';
+// 不设回合上限：哪怕打到第 999 回合也不因此终局
+st.round = 999; st.turnIdx = 2; st.phase = 'end';
 const et = endTurn(st);
-ok(et.finished && st.finished.reason === 'rounds', '达到地图回合上限结算');
-ok(st.finished.ranking.length === 3 && st.finished.ranking[0].assets >= st.finished.ranking[2].assets, '排名按资产');
+ok(!st.finished && et.finished === undefined && st.round === 1000 && st.turnIdx === 0 && st.phase === 'roll', '无回合上限，只按破产终局');
 st = newGame({ heroKey: 'boy', aiCount: 2, mapKey: 'jiuzhou', seed: 16 });
-ok(mapOf(st).rounds === 32 && st.tiles.length === 80, '九州环游 80 格 / 32 回合');
+ok(st.tiles.length === 118, '九州环游 118 格');
 st.players[1].bankrupt = true; st.turnIdx = 0; st.phase = 'end';
 endTurn(st);
 ok(st.turnIdx === 2, '破产玩家跳过');
@@ -246,6 +400,25 @@ ok(aiDecide(st, { kind: 'upgrade', cost: 150 }) === false, '升级保留现金')
 st.players[0].cash = 600;
 ok(aiDecide(st, { kind: 'upgrade', cost: 150 }) === true, '现金充裕升级');
 
+// —— 城市繁荣（租金普涨，促使淘汰制收敛）——
+section('城市繁荣');
+ok(boomMult(1) === 1 && boomMult(12) === 1 && boomMult(13) === 1.25 && boomMult(24) === 1.25 && boomMult(25) === 1.5, '繁荣档位随回合提升');
+ok(boomMult(133) === 3.5 && boomMult(9999) === 3.5, '繁荣档位封顶 ×3.5');
+{
+  const stB = newGame({ heroKey: 'boy', aiCount: 1, mapKey: 'oldtown', seed: 3 });
+  const pB2 = propTilesOf(stB)[0];
+  stB.tiles[pB2].owner = 0; stB.tiles[pB2].level = 1; stB.tiles[pB2].spent = 100;
+  stB.round = 1; stB.players[1].pos = pB2; stB.turnIdx = 1; stB.phase = 'resolve';
+  const r1 = resolveTile(stB);
+  stB.round = 13; stB.phase = 'resolve';
+  const r13 = resolveTile(stB);
+  ok(r1.kind === 'rent' && r13.kind === 'rent' && r13.rent === Math.round(r1.rent * 1.25), '繁荣期租金 ×1.25');
+  const stL = newGame({ heroKey: 'boy', aiCount: 2, mapKey: 'oldtown', seed: 1 });
+  stL.phase = 'end'; stL.round = 12; stL.turnIdx = 2;
+  endTurn(stL); // 回合推进到 13
+  ok(stL.round === 13 && stL.log.some((l) => /繁荣/.test(l)), '繁荣档位提升时播报');
+}
+
 // —— 随机确定性 ——
 section('随机确定性');
 const s1 = newGame({ heroKey: 'boy', aiCount: 1, mapKey: 'oldtown', seed: 777 });
@@ -254,6 +427,11 @@ const seq1 = [rollDice(s1), rollDice(s1), rollDice(s1)];
 const seq2 = [rollDice(s2), rollDice(s2), rollDice(s2)];
 ok(seq1.join() === seq2.join(), '同种子骰序一致');
 ok(seq1.join() !== [rollDice(newGame({ seed: 778 })), 0, 0].slice(0, 1).join(), '异种子骰序不同');
+{
+  const d1 = rollTwoDice(newGame({ seed: 123 }), 0);
+  const d2 = rollTwoDice(newGame({ seed: 123 }), 0);
+  ok(d1.d1 === d2.d1 && d1.d2 === d2.d2, '双骰同种子一致');
+}
 
 // —— 地图解锁 ——
 section('地图解锁');
@@ -272,14 +450,18 @@ ok(unlockNext('jiuzhou') === null, '最终图无后续');
 section('存档');
 _setStorage(memStore);
 st = newGame({ heroKey: 'sword', aiCount: 3, mapKey: 'academy', seed: 21 });
-st.tiles[pA].owner = 0; st.tiles[pA].level = 2; st.tiles[pA].spent = 128;
+const pAcad = propTilesOf(st)[0];
+st.tiles[pAcad].owner = 0; st.tiles[pAcad].level = 2; st.tiles[pAcad].spent = 128;
 ok(saveToSlot(0, st), '写入 0 号槽');
 const back = loadFromSlot(0);
-ok(back && back.mapKey === 'academy' && back.tiles.length === 60 && back.rng === 21, '读档含地图与 60 格');
-ok(back.tiles[pA].level === 2, '地产状态完整');
+ok(back && back.mapKey === 'academy' && back.tiles.length === 90 && back.rng === 21, '读档含地图与 90 格');
+ok(back.tiles[pAcad].level === 2, '地产状态完整');
+ok(back.players[0].perk && back.players[0].perk.tough === 0.5, '天赋随存档保留');
 ok(loadFromSlot(1) === null && saveToSlot(-1, st) === false, '空槽/非法槽处理');
 const code = exportSave(st);
 ok(importSave(code) !== null && importSave('not-a-save') === null, '导出导入往返');
+// 旧版存档（棋盘长度不符）被拒收
+ok(importSave(exportSave({ ...st, tiles: new Array(50).fill(null) })) === null, '旧棋盘长度存档拒收');
 deleteSlot(0);
 ok(loadFromSlot(0) === null, '删除槽位');
 
diff --git a/apps/da-fu-weng/scripts/smoke-dom.mjs b/apps/da-fu-weng/scripts/smoke-dom.mjs
index 9925cf9..b07f762 100644
--- a/apps/da-fu-weng/scripts/smoke-dom.mjs
+++ b/apps/da-fu-weng/scripts/smoke-dom.mjs
@@ -1,7 +1,7 @@
 // ============================================================================
 // DOM 冒烟测试：用 jsdom 驱动真实 UI 流程
-// （启动器 → 选人+选图（锁定/解锁）→ 对局：掷骰/买地弹窗/AI 回合 →
-//   格子详情 → 存读档 → 地图解锁链）。
+// （启动器 → 选人+选图（锁定/解锁/天赋展示）→ 对局：掷双骰/买地弹窗/AI 回合 →
+//   商店购物 → 格子详情 → 存读档 → 地图解锁链）。
 // 运行：node scripts/smoke-dom.mjs   （需先 npm install jsdom）
 // ============================================================================
 import { JSDOM } from 'jsdom';
@@ -34,7 +34,7 @@ async function waitFor(fn, timeoutMs = 12000, label = 'condition') {
 }
 
 const { createGame } = await import(new URL('../src/main.js', import.meta.url).href);
-const { START_CASH, MAPS } = await import(new URL('../src/config.js', import.meta.url).href);
+const { START_CASH, MAPS, SHOP_ITEMS, tileCountOf } = await import(new URL('../src/config.js', import.meta.url).href);
 const { loadMeta } = await import(new URL('../src/core/meta.js', import.meta.url).href);
 
 // ---------- 1) 启动器 ----------
@@ -50,39 +50,56 @@ document.querySelector('.launcher__actions .btn-primary').click();
 await sleep(20);
 ok(document.querySelector('.dfw.create') !== null, '进入选人页');
 ok(document.querySelectorAll('.hero-cell').length === 4, '4 位主角可选');
+ok(document.querySelectorAll('.hero-perk').length === 4, '4 位主角各带天赋标签');
 document.querySelectorAll('.hero-cell')[2].click(); // 剑侠
 await sleep(20);
+ok(/罚金减半/.test(document.querySelector('.perk-note')?.textContent || ''), '选中主角展示天赋说明');
+ok(/天赋/.test(document.querySelector('.create .panel h4')?.textContent || ''), '选人面板提示天赋各异');
 ok(document.querySelectorAll('.ai-toggle button')[1] !== null, 'AI 数量切换渲染');
 const mapCells = document.querySelectorAll('.map-cell');
 ok(mapCells.length === 6, '6 张地图卡');
 ok(document.querySelectorAll('.map-cell.locked').length === 5, '5 张锁定（首图开放）');
 ok(/老城市井/.test(mapCells[0].textContent || ''), '首图「老城市井」可读');
+ok(/淘汰制/.test(mapCells[0].textContent || ''), '地图卡展示淘汰制说明');
 ok(mapCells[1].disabled === true, '锁定图不可点');
 
-// ---------- 3) 对局界面（50 格大棋盘 + 平移层） ----------
+// ---------- 3) 对局界面（72 格大棋盘 + 内街 + 腹地点缀） ----------
 document.querySelector('.create .btn-primary.btn-block').click();
 await sleep(60);
 ok(document.querySelector('.dfw.game') !== null, '进入对局');
 ok(document.querySelector('.board-view') !== null, '棋盘视口（可拖动）渲染');
-ok(document.querySelectorAll('.board .tile').length === 50, '首图 50 格棋盘');
+const TILE_N = tileCountOf(MAPS[0]);
+ok(document.querySelectorAll('.board .tile:not(.deco)').length === TILE_N, `首图 ${TILE_N} 格棋盘`);
+ok(document.querySelectorAll('.board .tile.t-shop').length > 0, '棋盘上有商店格');
+ok(document.querySelectorAll('.board .tile.deco').length > 0, '腹地点缀风景渲染');
+ok(document.querySelector('.board-hud') !== null, '浮动信息条存在');
 ok(document.querySelector('.board-pan') !== null, '平移层存在');
 await sleep(60);
 const panStyle = document.querySelector('.board-pan').style.transform || '';
 ok(/translate3d/.test(panStyle), '镜头跟随已定位棋盘（transform）');
 ok(document.querySelectorAll('.token').length === 3 && document.querySelectorAll('.token svg').length === 3, '3 枚开罗风像素棋子');
 ok(document.querySelectorAll('.hud .pcard').length === 3, 'HUD 3 张玩家卡');
-ok(/R1\/22/.test(document.querySelector('.center-hint')?.textContent || ''), '中央显示回合进度 R1/22');
+ok(/第 1 回合/.test(document.querySelector('.bh-hint')?.textContent || ''), '信息条显示第 1 回合（无回合上限）');
 
 // ---------- 4) 掷骰 + 买地弹窗 ----------
-function rngFirst(seed) {
-  let t = (seed + 0x6d2b79f5) | 0;
-  t = Math.imul(t ^ (t >>> 15), t | 1);
-  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
-  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
+function rngSeq(seed, k) {
+  const out = [];
+  let t = seed | 0;
+  for (let i = 0; i < k; i++) {
+    t = (t + 0x6d2b79f5) | 0;
+    let x = Math.imul(t ^ (t >>> 15), t | 1);
+    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
+    out.push(((x ^ (x >>> 14)) >>> 0) / 4294967296);
+  }
+  return out;
+}
+// 找种子：首两掷为 1+2（非对子，共 3 步 → 落 3 号空地触发买地）
+let seedRoll = 1;
+for (let s = 1; s < 999999; s++) {
+  const [a, b] = rngSeq(s, 2);
+  if (Math.floor(a * 6) + 1 === 1 && Math.floor(b * 6) + 1 === 2) { seedRoll = s; break; }
 }
-let seedDice1 = 1;
-for (let s = 1; s < 99999; s++) { if (Math.floor(rngFirst(s) * 6) + 1 === 1) { seedDice1 = s; break; } }
-ui.state.rng = seedDice1;
+ui.state.rng = seedRoll;
 const rollBtn = document.querySelector('.turn-btn');
 ok(rollBtn && !rollBtn.disabled, '掷骰按钮可用');
 rollBtn.click();
@@ -93,19 +110,19 @@ ok(!!buyBtn, '弹窗含「买下」按钮');
 buyBtn.click();
 await sleep(200);
 ok(document.querySelector('.sheet') === null, '买地弹窗关闭');
-ok(ui.state.tiles[1].owner === 0, '1 号地已购入');
-ok(ui.state.players[0].cash === START_CASH - ui.state.tiles[1].spent, '买地扣款一致');
+ok(ui.state.tiles[3].owner === 0, '3 号地已购入');
+ok(ui.state.players[0].cash === START_CASH - ui.state.tiles[3].spent, '买地扣款一致');
 
 // ---------- 5) AI 自动回合 → 回到人类回合 ----------
 const humanTurn = await waitFor(() => {
   const btn = document.querySelector('.turn-btn');
   return btn && !btn.disabled;
-}, 15000);
+}, 20000);
 ok(humanTurn, 'AI 回合后回到人类回合（按钮恢复）');
 ok(document.querySelectorAll('.log-strip .ln').length > 0, '日志有内容');
 
 // ---------- 6) 格子详情 ----------
-document.querySelector('.board .tile[data-tile="1"]').click();
+document.querySelector('.board .tile[data-tile="3"]').click();
 await sleep(50);
 const tileSheet = document.querySelector('.sheet');
 ok(tileSheet && /业主/.test(tileSheet.textContent || ''), '格子详情弹窗含业主信息');
@@ -128,13 +145,37 @@ quitBtn.click();
 await sleep(30);
 ok(document.querySelector('.dfw.launcher') !== null, '回到启动器');
 ok(/剑侠/.test(document.querySelector('.slots .slot-row.used')?.textContent || ''), '存档槽显示进度');
+ok(/第 \d+ 回合/.test(document.querySelector('.slots .slot-row.used')?.textContent || ''), '存档槽显示回合（无上限）');
 document.querySelector('.slots .slot-row.used .btn-primary').click();
 await sleep(80);
 ok(document.querySelector('.dfw.game') !== null, '读档回到对局');
-ok(document.querySelectorAll('.board .tile').length === 50, '读档棋盘完整');
-ok(ui.state.tiles[1].owner === 0, '读档保留地产归属');
+ok(document.querySelectorAll('.board .tile:not(.deco)').length === TILE_N, '读档棋盘完整');
+ok(ui.state.tiles[3].owner === 0, '读档保留地产归属');
+
+// ---------- 8) 商店购物 ----------
+const shopTileEl = document.querySelector('.board .tile.t-shop');
+ok(!!shopTileEl, '存在商店格可交互');
+const shopIdx = Number(shopTileEl.dataset.tile);
+ui.state.players[0].pos = shopIdx;
+ui.state.phase = 'resolve';
+const shopDone = ui.resolveLoop(0); // 不 await：先等弹窗出现
+const shopSheetOk = await waitFor(() => document.querySelector('.sheet') && /商店/.test(document.querySelector('.sheet__head')?.textContent || ''), 5000);
+ok(shopSheetOk, '落地商店弹出购物弹窗');
+ok(document.querySelectorAll('.shop-item').length === SHOP_ITEMS.length, `商店陈列 ${SHOP_ITEMS.length} 件道具`);
+const cashBefore = ui.state.players[0].cash;
+const itemBtn = [...document.querySelectorAll('.shop-item button')].find((b) => /购买/.test(b.textContent));
+itemBtn.click();
+await sleep(80);
+ok(ui.state.players[0].items.swift === 3, '购买顺风骰生效 3 次');
+ok(ui.state.players[0].cash === cashBefore - SHOP_ITEMS[0].price, '购买道具扣款一致');
+const leaveBtn = [...document.querySelectorAll('.sheet__foot button')].find((b) => /离开/.test(b.textContent));
+leaveBtn.click();
+await shopDone;
+await sleep(50);
+ok(ui.state.phase === 'end', '离开商店进入收尾');
+ok(document.querySelector('.sheet') === null, '商店弹窗关闭');
 
-// ---------- 8) 地图解锁链（meta 持久化） ----------
+// ---------- 9) 地图解锁链（meta 持久化） ----------
 // 模拟主角夺冠：直接调用解锁逻辑验证 UI 状态联动
 const { unlockNext } = await import(new URL('../src/core/meta.js', import.meta.url).href);
 ok(unlockNext('oldtown') === 'port', '老城夺冠解锁港都');
diff --git a/apps/da-fu-weng/src/config.js b/apps/da-fu-weng/src/config.js
index 9345590..27d0b63 100644
--- a/apps/da-fu-weng/src/config.js
+++ b/apps/da-fu-weng/src/config.js
@@ -1,16 +1,19 @@
 // ============================================================================
 // 大富翁 · 环游之城 · 全局配置与多地图棋盘数据（纯数据/纯函数，无 DOM 依赖）。
 //
-// 棋盘：6 张地图，外环 50~80 格（列×行网格的周长），顺时针从左下角「起点」出发。
+// 棋盘：6 张地图，72~118 格。路径不再是单纯的外环方圈：每张图在外环基础上
+// 向城市腹地开辟若干「内街」（矩形绕行），棋子会拐进中路再绕回，地图中央不再空旷。
 // 地图逐步解锁：在上一张地图夺冠（主角排名第一）后解锁下一张。
+// 玩法：双骰前进（对子加掷、连掷三对入狱）→ 购地/升级/交租/垄断加成 →
+//       机会命运事件 → 商店购物（顺风骰 / 护身符 / 均富卡）→
+//       不设回合上限，破产淘汰，一家独大者胜。
 // 棋盘由 buildBoard() 从地图定义确定性生成（无随机），存档只需记 mapKey。
-// 玩法：掷骰前进 → 购地/升级/交租 → 机会命运事件 → 破产淘汰或回合上限结算首富。
 // ============================================================================
 
 // —— 经济常量 ——
-export const START_CASH = 2400;      // 初始现金
-export const SALARY = 260;           // 经过起点（工资）
-export const SALARY_LAND_BONUS = 120; // 恰好落在起点额外奖励
+export const START_CASH = 2400;      // 初始现金（角色天赋 cash 在此基础上增减）
+export const SALARY = 220;           // 经过起点（工资）
+export const SALARY_LAND_BONUS = 110; // 恰好落在起点额外奖励
 export const JAIL_FINE = 120;        // 落入/被送监狱罚款
 export const JAIL_SKIP_TURNS = 1;    // 监狱停掷回合数
 export const HOSPITAL_FEE = 140;     // 医药费
@@ -20,6 +23,14 @@ export const TAX_MAX = 500;
 export const MAX_LEVEL = 3;          // 地产等级（1 购入 / 2 / 3）
 export const RENT_MULT = [0, 1, 1.9, 3.0];   // 等级 → 租金倍率
 export const MONOPOLY_MULT = 1.5;    // 垄断整街区加成
+// —— 城市繁荣（时间压力，非回合上限）：每隔数回合租金普涨一档，
+//    保证淘汰制对局能自然收敛（工资不变、租金上涨，坐吃山空者终被淘汰）。
+export const BOOM_EVERY = 12;   // 每 12 回合繁荣一档
+export const BOOM_RATE = 0.25;  // 每档租金 +25%
+export const BOOM_MAX = 10;     // 最多 10 档（封顶 ×3.5，确保残局收敛）
+export function boomMult(round) {
+  return 1 + BOOM_RATE * Math.min(BOOM_MAX, Math.floor(((round || 1) - 1) / BOOM_EVERY));
+}
 export const UPGRADE_RATE = [0, 0.6, 0.8];   // 升到 2/3 级的花费（占地价比例）
 export const SELL_RATE = 0.5;        // 抵债变卖回收比例（相对累计投入）
 export const AI_SAFE_CASH = 180;     // AI 买地后需保留的现金
@@ -27,127 +38,261 @@ export const AI_UPGRADE_CASH = 360;  // AI 升级后需保留的现金
 
 // —— 通用街区配色（各地图街区引用这里的色板，保持全图视觉统一）——
 export const PALETTE = {
-  gray: '#8a9aa5', teal: '#4fa3a8', green: '#5fa85f', blue: '#4a90d9',
-  purple: '#9b78c4', red: '#c85a4a', brown: '#a1785a', gold: '#d4a84b',
+  gray: '#8a9aa5', teal: '#4fa3a8', green: '#5fa85f',
+  blue: '#4a90d9', purple: '#9b78c4', red: '#c85a4a', brown: '#a1785a', gold: '#d4a84b',
   pink: '#c47ba0', indigo: '#6a7ac0',
 };
 
 // ============================================================================
-// 地图定义：cols×rows 网格外环 = 2*(cols+rows)-4 格。
-// rounds：回合上限；districts：街区（color 引用 PALETTE，price 为基准地价，
-// names 为地块名池，不够时回退「街区名·N号铺」）。
+// 地图定义：cols×rows 网格。streets：内街绕行（edge = 所在外边，按行进方向；
+// at = 沿边已走过的格数（含出发角），depth = 向内深入格数，width = 内街跨度）。
+// 每条内街让路径多走 2×depth 格，并在外边上「让出」一段形成凹口。
+// districts：街区（color 引用 PALETTE，price 为基准地价，names 为地块名池，
+// 不够时回退「街区名·N号铺」）。deco：腹地空格的点缀风景。
 // ============================================================================
 export const MAPS = [
   {
-    key: 'oldtown', name: '老城市井', subtitle: '五十格 · 初出茅庐',
-    cols: 16, rows: 11, rounds: 22, unlock: null,
+    key: 'oldtown', name: '老城市井', subtitle: '七十二格 · 初出茅庐',
+    cols: 16, rows: 11, unlock: null, deco: ['🌳', '🏡', '⛲'],
+    streets: [
+      { edge: 'bottom', at: 4, depth: 3, width: 6 },
+      { edge: 'right', at: 5, depth: 3, width: 5 },
+      { edge: 'top', at: 6, depth: 3, width: 5 },
+      { edge: 'left', at: 5, depth: 2, width: 4 },
+    ],
     districts: [
-      { key: 'a', name: '市井坊', color: 'gray', price: 80, names: ['小吃街', '布庄', '茶馆', '钱庄', '当铺', '杂货巷'] },
-      { key: 'b', name: '工匠里', color: 'brown', price: 130, names: ['铁匠铺', '木器行', '染坊', '瓷窑', '灯笼铺', '纸扎店'] },
-      { key: 'c', name: '文墨巷', color: 'green', price: 190, names: ['书肆', '笔墨斋', '画舫', '碑林', '琴社'] },
-      { key: 'd', name: '城心坊', color: 'gold', price: 270, names: ['钟楼街', '城隍庙', '府衙前街', '鼓楼夜市'] },
-      { key: 'e', name: '贵人坊', color: 'pink', price: 350, names: ['绸缎庄', '金玉阁', '大宅门', '戏楼'] },
+      { key: 'a', name: '市井坊', color: 'gray', price: 80, names: ['小吃街', '布庄', '茶馆', '钱庄', '当铺', '杂货巷', '脚店', '香烛铺'] },
+      { key: 'b', name: '工匠里', color: 'brown', price: 130, names: ['铁匠铺', '木器行', '染坊', '瓷窑', '灯笼铺', '纸扎店', '铜锡铺', '皮作坊'] },
+      { key: 'c', name: '文墨巷', color: 'green', price: 190, names: ['书肆', '笔墨斋', '画舫', '碑林', '琴社', '扇庄', '裱画铺'] },
+      { key: 'd', name: '城心坊', color: 'gold', price: 270, names: ['钟楼街', '城隍庙', '府衙前街', '鼓楼夜市', '旗牌坊', '官井胡同'] },
+      { key: 'e', name: '贵人坊', color: 'pink', price: 350, names: ['绸缎庄', '金玉阁', '大宅门', '戏楼', '脂粉铺', '绸机坊'] },
     ],
   },
   {
-    key: 'port', name: '港都商埠', subtitle: '五十六格 · 通衢四海',
-    cols: 18, rows: 12, rounds: 24, unlock: 'oldtown',
+    key: 'port', name: '港都商埠', subtitle: '八十二格 · 通衢四海',
+    cols: 18, rows: 12, unlock: 'oldtown', deco: ['⚓', '🌊', '🐟'],
+    streets: [
+      { edge: 'bottom', at: 5, depth: 3, width: 7 },
+      { edge: 'right', at: 6, depth: 4, width: 5 },
+      { edge: 'top', at: 7, depth: 3, width: 8 },
+      { edge: 'left', at: 5, depth: 3, width: 6 },
+    ],
     districts: [
-      { key: 'a', name: '渔火湾', color: 'teal', price: 90, names: ['渔市', '灯塔下', '晒网滩', '蚝田', '船具铺'] },
-      { key: 'b', name: '码头仓', color: 'brown', price: 150, names: ['一号栈桥', '货栈', '关税房', '吊塔场', '麻绳行'] },
-      { key: 'c', name: '商馆街', color: 'blue', price: 210, names: ['商会大楼', '洋行', '银行', '保险行', '拍卖所'] },
-      { key: 'd', name: '船坞区', color: 'indigo', price: 280, names: ['龙骨厂', '帆具坊', '船渠', '锚链铺'] },
-      { key: 'e', name: '珍珠坊', color: 'pink', price: 360, names: ['珠贝行', '香料铺', '丝绸仓', '茶库'] },
-      { key: 'f', name: '总督府', color: 'gold', price: 440, names: ['总督官邸', '海关大楼', '凯旋门'] },
+      { key: 'a', name: '渔火湾', color: 'teal', price: 90, names: ['渔市', '灯塔下', '晒网滩', '蚝田', '船具铺', '咸鱼栈', '网匠屋'] },
+      { key: 'b', name: '码头仓', color: 'brown', price: 150, names: ['一号栈桥', '货栈', '关税房', '吊塔场', '麻绳行', '驳船坞', '苦力棚'] },
+      { key: 'c', name: '商馆街', color: 'blue', price: 210, names: ['商会大楼', '洋行', '银行', '保险行', '拍卖所', '电报局', '邮船公司'] },
+      { key: 'd', name: '船坞区', color: 'indigo', price: 280, names: ['龙骨厂', '帆具坊', '船渠', '锚链铺', '桅杆场', '沥青工坊'] },
+      { key: 'e', name: '珍珠坊', color: 'pink', price: 360, names: ['珠贝行', '香料铺', '丝绸仓', '茶库', '珊瑚阁', '蚌壳市'] },
+      { key: 'f', name: '总督府', color: 'gold', price: 440, names: ['总督官邸', '海关大楼', '凯旋门', '炮台军营', '领事馆'] },
     ],
   },
   {
-    key: 'academy', name: '学府文华', subtitle: '六十格 · 书香满城',
-    cols: 19, rows: 13, rounds: 26, unlock: 'port',
+    key: 'academy', name: '学府文华', subtitle: '九十格 · 书香满城',
+    cols: 19, rows: 13, unlock: 'port', deco: ['🌲', '📜', '⛩️'],
+    streets: [
+      { edge: 'bottom', at: 5, depth: 4, width: 8 },
+      { edge: 'right', at: 7, depth: 4, width: 5 },
+      { edge: 'top', at: 8, depth: 4, width: 8 },
+      { edge: 'left', at: 6, depth: 3, width: 6 },
+    ],
     districts: [
-      { key: 'a', name: '蒙学巷', color: 'green', price: 100, names: ['村塾', '字铺', '幼学馆', '笔庄'] },
-      { key: 'b', name: '书院区', color: 'teal', price: 170, names: ['明伦堂', '藏书楼', '碑廊', '讲经台', '号舍'] },
-      { key: 'c', name: '百工坊', color: 'brown', price: 230, names: ['格物院', '算学馆', '观星台', '医馆', '药圃'] },
-      { key: 'd', name: '翰林街', color: 'purple', price: 300, names: ['翰林院', '文渊阁', '贡院', '状元坊'] },
-      { key: 'e', name: '雅集苑', color: 'pink', price: 380, names: ['曲水亭', '诗社', '棋院', '画舫'] },
-      { key: 'f', name: '辟雍环', color: 'gold', price: 470, names: ['辟雍大殿', '祭酒府', '琉璃门'] },
+      { key: 'a', name: '蒙学巷', color: 'green', price: 100, names: ['村塾', '字铺', '幼学馆', '笔庄', '蒙童舍', '算盘行', '书童巷'] },
+      { key: 'b', name: '书院区', color: 'teal', price: 170, names: ['明伦堂', '藏书楼', '碑廊', '讲经台', '号舍', '山长宅', '射圃场'] },
+      { key: 'c', name: '百工坊', color: 'brown', price: 230, names: ['格物院', '算学馆', '观星台', '医馆', '药圃', '水力工坊', '浑天房'] },
+      { key: 'd', name: '翰林街', color: 'purple', price: 300, names: ['翰林院', '文渊阁', '贡院', '状元坊', '侍讲宅', '兰台库'] },
+      { key: 'e', name: '雅集苑', color: 'pink', price: 380, names: ['曲水亭', '诗社', '棋院', '画舫', '乐坊', '花斛斋'] },
+      { key: 'f', name: '辟雍环', color: 'gold', price: 470, names: ['辟雍大殿', '祭酒府', '琉璃门', '石经林', '圜桥'] },
     ],
   },
   {
-    key: 'snow', name: '北境雪原', subtitle: '六十六格 · 冰天商路',
-    cols: 21, rows: 14, rounds: 28, unlock: 'academy',
+    key: 'snow', name: '北境雪原', subtitle: '九十六格 · 冰天商路',
+    cols: 21, rows: 14, unlock: 'academy', deco: ['🏔️', '🌲', '❄️'],
+    streets: [
+      { edge: 'bottom', at: 6, depth: 4, width: 9 },
+      { edge: 'right', at: 7, depth: 4, width: 6 },
+      { edge: 'top', at: 8, depth: 4, width: 9 },
+      { edge: 'left', at: 7, depth: 3, width: 6 },
+    ],
     districts: [
-      { key: 'a', name: '边哨集', color: 'gray', price: 110, names: ['皮货摊', '雪橇行', '哨站', '暖酒铺'] },
-      { key: 'b', name: '松林猎场', color: 'green', price: 180, names: ['猎屋', '熏肉坊', '兽皮庄', '弓匠铺', '陷阱场'] },
-      { key: 'c', name: '冰湖渡', color: 'blue', price: 250, names: ['冰渡口', '凿冰营', '鱼仓', '雪橇驿', '暖炉驿'] },
-      { key: 'd', name: '矿脉镇', color: 'brown', price: 320, names: ['铁矿场', '熔炉堡', '工匠营', '煤市'] },
-      { key: 'e', name: '温泉邑', color: 'pink', price: 400, names: ['汤泉馆', '疗养院', '雪月楼'] },
-      { key: 'f', name: '风雪关', color: 'indigo', price: 480, names: ['关城', '烽火台', '戍堡', '雪桥'] },
-      { key: 'g', name: '极光台', color: 'purple', price: 560, names: ['极光祭坛', '观象台', '冰晶宫'] },
+      { key: 'a', name: '边哨集', color: 'gray', price: 110, names: ['皮货摊', '雪橇行', '哨站', '暖酒铺', '驿站马厩', '冰砖窖'] },
+      { key: 'b', name: '松林猎场', color: 'green', price: 180, names: ['猎屋', '熏肉坊', '兽皮庄', '弓匠铺', '陷阱场', '驯鹿圈'] },
+      { key: 'c', name: '冰湖渡', color: 'blue', price: 250, names: ['冰渡口', '凿冰营', '鱼仓', '雪橇驿', '暖炉驿', '冰灯集市'] },
+      { key: 'd', name: '矿脉镇', color: 'brown', price: 320, names: ['铁矿场', '熔炉堡', '工匠营', '煤市', '矿工澡堂', '卷扬机房'] },
+      { key: 'e', name: '温泉邑', color: 'pink', price: 400, names: ['汤泉馆', '疗养院', '雪月楼', '雾凇阁', '药浴堂'] },
+      { key: 'f', name: '风雪关', color: 'indigo', price: 480, names: ['关城', '烽火台', '戍堡', '雪桥', '马面楼', '角楼哨所'] },
+      { key: 'g', name: '极光台', color: 'purple', price: 560, names: ['极光祭坛', '观象台', '冰晶宫', '霜语塔'] },
     ],
   },
   {
-    key: 'royal', name: '王城中枢', subtitle: '七十二格 · 帝辇之下',
-    cols: 22, rows: 16, rounds: 30, unlock: 'snow',
+    key: 'royal', name: '王城中枢', subtitle: '一百零八格 · 帝辇之下',
+    cols: 22, rows: 16, unlock: 'snow', deco: ['🏮', '🏯', '🌳'],
+    streets: [
+      { edge: 'bottom', at: 6, depth: 5, width: 10 },
+      { edge: 'right', at: 9, depth: 4, width: 6 },
+      { edge: 'top', at: 9, depth: 5, width: 10 },
+      { edge: 'left', at: 8, depth: 4, width: 7 },
+    ],
     districts: [
-      { key: 'a', name: '外郭市', color: 'gray', price: 130, names: ['柴市', '米市', '菜市口', '骡马巷'] },
-      { key: 'b', name: '皇商坊', color: 'teal', price: 200, names: ['官盐号', '皇店', '织造局', '贡品行'] },
-      { key: 'c', name: '军营卫', color: 'indigo', price: 270, names: ['演武场', '兵械库', '点将台', '箭楼'] },
-      { key: 'd', name: '寺塔街', color: 'purple', price: 340, names: ['大相国寺', '浮屠塔', '香市', '经坊'] },
-      { key: 'e', name: '御沟沿', color: 'green', price: 410, names: ['金水桥', '御沟柳岸', '琼岛春荫'] },
-      { key: 'f', name: '朱雀街', color: 'red', price: 490, names: ['朱雀大街', '御街千步廊', '州桥夜市', '曲苑'] },
-      { key: 'g', name: '宫城根', color: 'gold', price: 580, names: ['东华门', '角楼', '秘阁', '御苑'] },
+      { key: 'a', name: '外郭市', color: 'gray', price: 130, names: ['柴市', '米市', '菜市口', '骡马巷', '瓦子棚', '夜市摊'] },
+      { key: 'b', name: '皇商坊', color: 'teal', price: 200, names: ['官盐号', '皇店', '织造局', '贡品行', '铜场监', '漕运司'] },
+      { key: 'c', name: '军营卫', color: 'indigo', price: 270, names: ['演武场', '兵械库', '点将台', '箭楼', '马军营', '辎重营'] },
+      { key: 'd', name: '寺塔街', color: 'purple', price: 340, names: ['大相国寺', '浮屠塔', '香市', '经坊', '戒坛院', '罗汉堂'] },
+      { key: 'e', name: '御沟沿', color: 'green', price: 410, names: ['金水桥', '御沟柳岸', '琼岛春荫', '芳林苑', '假山园'] },
+      { key: 'f', name: '朱雀街', color: 'red', price: 490, names: ['朱雀大街', '御街千步廊', '州桥夜市', '曲苑', '酒旗楼', '相国寺桥'] },
+      { key: 'g', name: '宫城根', color: 'gold', price: 580, names: ['东华门', '角楼', '秘阁', '御苑', '漏泽园', '叩阙亭'] },
     ],
   },
   {
-    key: 'jiuzhou', name: '九州环游', subtitle: '八十格 · 天下为棋',
-    cols: 24, rows: 18, rounds: 32, unlock: 'royal',
+    key: 'jiuzhou', name: '九州环游', subtitle: '一百一十八格 · 天下为棋',
+    cols: 24, rows: 18, unlock: 'royal', deco: ['⛰️', '⛵', '🌾'],
+    streets: [
+      { edge: 'bottom', at: 7, depth: 5, width: 11 },
+      { edge: 'right', at: 10, depth: 5, width: 7 },
+      { edge: 'top', at: 10, depth: 5, width: 11 },
+      { edge: 'left', at: 9, depth: 4, width: 8 },
+    ],
     districts: [
-      { key: 'a', name: '中原道', color: 'gold', price: 150, names: ['洛阳花市', '汴河堰', '嵩阳书院', '官渡栈'] },
-      { key: 'b', name: '江南道', color: 'green', price: 220, names: ['苏杭绸庄', '金陵渡', '扬州茶社', '会稽兰亭', '钱塘潮肆'] },
-      { key: 'c', name: '蜀栈道', color: 'brown', price: 290, names: ['剑门关', '锦官坊', '蜀锦局', '栈桥驿'] },
-      { key: 'd', name: '岭南道', color: 'teal', price: 360, names: ['广州蕃坊', '珠市', '荔枝庄', '香料坞'] },
-      { key: 'e', name: '朔方道', color: 'gray', price: 430, names: ['阴山牧场', '受降城', '马市', '皮毛栈'] },
-      { key: 'f', name: '西域道', color: 'purple', price: 500, names: ['玉门关', '敦煌石窟', '丝路驼铃', '楼兰墟'] },
-      { key: 'g', name: '沧海事', color: 'blue', price: 570, names: ['蓬莱渡', '市舶司', '妈祖庙', '鲸波台'] },
-      { key: 'h', name: '蓬莱境', color: 'pink', price: 650, names: ['瀛洲阁', '方丈山', '瑶池圃'] },
+      { key: 'a', name: '中原道', color: 'gold', price: 150, names: ['洛阳花市', '汴河堰', '嵩阳书院', '官渡栈', '河阳仓', '孟津渡'] },
+      { key: 'b', name: '江南道', color: 'green', price: 220, names: ['苏杭绸庄', '金陵渡', '扬州茶社', '会稽兰亭', '钱塘潮肆', '震泽渔村', '京口烽火'] },
+      { key: 'c', name: '蜀栈道', color: 'brown', price: 290, names: ['剑门关', '锦官坊', '蜀锦局', '栈桥驿', '青城观', '嘉陵渡'] },
+      { key: 'd', name: '岭南道', color: 'teal', price: 360, names: ['广州蕃坊', '珠市', '荔枝庄', '香料坞', '番船澳', '椰风墟'] },
+      { key: 'e', name: '朔方道', color: 'gray', price: 430, names: ['阴山牧场', '受降城', '马市', '皮毛栈', '盐池寨', '烽燧线'] },
+      { key: 'f', name: '西域道', color: 'purple', price: 500, names: ['玉门关', '敦煌石窟', '丝路驼铃', '楼兰墟', '阳关邸', '蒲桃园'] },
+      { key: 'g', name: '沧海事', color: 'blue', price: 570, names: ['蓬莱渡', '市舶司', '妈祖庙', '鲸波台', '盐场栅', '望海楼'] },
+      { key: 'h', name: '蓬莱境', color: 'pink', price: 650, names: ['瀛洲阁', '方丈山', '瑶池圃', '紫芝田'] },
     ],
   },
 ];
 
 const MAP_MAP = Object.fromEntries(MAPS.map((m) => [m.key, m]));
 export function mapDefOf(key) { return MAP_MAP[key] || MAPS[0]; }
-export const perimeterOf = (m) => 2 * (m.cols + m.rows) - 4;
-
-// 棋盘索引 → 网格坐标（顺时针：下排左→右、右列下→上、上排右→左、左列上→下）
-export function tileGrid(i, cols = MAPS[0].cols, rows = MAPS[0].rows) {
-  const perim = 2 * (cols + rows) - 4;
-  const k = ((i % perim) + perim) % perim;
-  if (k < cols) return { row: rows, col: k + 1 };                          // 下排（左→右）
-  if (k < cols + rows - 2) return { row: rows - (k - cols) - 1, col: cols }; // 右列（下→上）
-  if (k < 2 * cols + rows - 2) return { row: 1, col: 2 * cols + rows - 2 - k }; // 上排（右→左）
-  return { row: k - (2 * cols + rows - 2) + 2, col: 1 };                   // 左列（上→下）
+
+// ============================================================================
+// 路径生成：外环 + 内街绕行 → 闭环格子序列（顺时针，起点在左下角）。
+// 行进：下边左→右，右边下→上，上边右→左，左边上→下，首尾相接。
+// 每条内街 = 「拐入腹地 → 沿内街走 → 拐回外边」，多走 2×depth 格。
+// ============================================================================
+const PATH_CACHE = new Map();
+
+export function buildPath(map) {
+  const m = map || MAPS[0];
+  const C = m.cols, R = m.rows;
+  const cells = [];
+  const used = new Set();
+  const push = (row, col) => {
+    if (row < 1 || row > R || col < 1 || col > C) throw new Error(`越界 ${row},${col}`);
+    const k = `${row}:${col}`;
+    if (used.has(k)) throw new Error(`路径冲突 ${k}`);
+    used.add(k);
+    cells.push({ row, col });
+  };
+  const detourAt = (edge, at) => (m.streets || []).find((s) => s.edge === edge && s.at === at);
+  const walk = () => {
+    // 下边（左→右）：入口 (R, at)，上拐 depth 格 → 内街 → 下拐回 (R, at+width-1)
+    for (let c = 1; c <= C; c++) {
+      push(R, c);
+      const d = detourAt('bottom', c);
+      if (!d) continue;
+      if (d.at < 2 || d.at + d.width > C || d.depth > R - 2) throw new Error('bottom 参数越界');
+      for (let r = R - 1; r >= R - d.depth; r--) push(r, c);
+      for (let cc = c + 1; cc <= c + d.width - 1; cc++) push(R - d.depth, cc);
+      for (let r = R - d.depth + 1; r <= R; r++) push(r, c + d.width - 1);
+      c = c + d.width - 1;
+    }
+    // 右边（下→上）：入口 (R-at, C)，左拐 depth 格 → 内街上行 → 右拐回 (R-at-width+1, C)
+    for (let r = R - 1; r >= 1; r--) {
+      push(r, C);
+      const d = detourAt('right', R - r);
+      if (!d) continue;
+      if (d.at < 1 || d.at + d.width > R - 1 || d.depth > C - 2) throw new Error('right 参数越界');
+      for (let c = C - 1; c >= C - d.depth; c--) push(r, c);
+      for (let rr = r - 1; rr >= r - d.width + 1; rr--) push(rr, C - d.depth);
+      for (let c = C - d.depth + 1; c <= C; c++) push(r - d.width + 1, c);
+      r = r - d.width + 1;
+    }
+    // 上边（右→左）：入口 (1, C-at)，下拐 depth 格 → 内街左行 → 上拐回 (1, C-at-width+1)
+    for (let c = C - 1; c >= 1; c--) {
+      push(1, c);
+      const d = detourAt('top', C - c);
+      if (!d) continue;
+      if (d.at < 1 || d.at + d.width > C - 1 || d.depth > R - 2) throw new Error('top 参数越界');
+      for (let r = 2; r <= 1 + d.depth; r++) push(r, c);
+      for (let cc = c - 1; cc >= c - d.width + 1; cc--) push(1 + d.depth, cc);
+      for (let r = d.depth; r >= 1; r--) push(r, c - d.width + 1);
+      c = c - d.width + 1;
+    }
+    // 左边（上→下，止于起点前一格）：入口 (1+at, 1)，右拐 depth 格 → 内街下行 → 左拐回
+    for (let r = 2; r <= R - 1; r++) {
+      push(r, 1);
+      const d = detourAt('left', r - 1);
+      if (!d) continue;
+      if (d.at < 1 || d.at + d.width > R - 1 || d.depth > C - 2) throw new Error('left 参数越界');
+      for (let c = 2; c <= 1 + d.depth; c++) push(r, c);
+      for (let rr = r + 1; rr <= r + d.width - 1; rr++) push(rr, 1 + d.depth);
+      for (let c = d.depth; c >= 1; c--) push(r + d.width - 1, c);
+      r = r + d.width - 1;
+    }
+  };
+  try {
+    walk();
+  } catch (_) {
+    // 兜底：内街参数异常时退回纯外环（防御性，正常数据不会触发）
+    return buildPath({ ...m, streets: [] });
+  }
+  return cells;
+}
+
+export function pathOf(map) {
+  const m = map || MAPS[0];
+  if (!PATH_CACHE.has(m.key)) PATH_CACHE.set(m.key, buildPath(m));
+  return PATH_CACHE.get(m.key);
+}
+export const tileCountOf = (map) => pathOf(map).length;
+export const tileGrid = (i, map) => {
+  const path = pathOf(map);
+  return path[((i % path.length) + path.length) % path.length];
+};
+
+// 腹地空格点缀（不参与行进，纯风景）：确定性散布，让地图中央不空
+export function decoCells(map) {
+  const m = map || MAPS[0];
+  const path = pathOf(m);
+  const used = new Set(path.map((g) => (g.row - 1) * m.cols + (g.col - 1)));
+  const theme = m.deco && m.deco.length ? m.deco : ['🌳', '🏡', '⛲'];
+  const out = [];
+  for (let r = 2; r <= m.rows - 1; r++) {
+    for (let c = 2; c <= m.cols - 1; c++) {
+      if (used.has((r - 1) * m.cols + (c - 1))) continue;
+      if ((r * 7 + c * 13) % 5 !== 0) continue;
+      out.push({ row: r, col: c, icon: theme[(r + c) % theme.length] });
+    }
+  }
+  return out;
 }
 
-// —— 棋盘生成（确定性，无随机）：四角特殊格，其余按固定节奏布机会/命运/税，
+// —— 棋盘生成（确定性，无随机）：四角特殊格，其余按固定节奏布商店/机会/命运/税，
 //    剩下全是地产，按街区顺序分段、段内地价递增。——
-const SPECIALS = { start: '🚩', jail: '⛓️', hospital: '🏥', park: '🌸', chance: '❓', fate: '🔮', tax: '💰' };
-const SPECIAL_NAMES = { start: '起点', jail: '监狱', hospital: '医院', park: '御园', chance: '机会', fate: '命运', tax: '税务司' };
+const SPECIALS = { start: '🚩', jail: '⛓️', hospital: '🏥', park: '🌸', chance: '❓', fate: '🔮', tax: '💰', shop: '🛒' };
+const SPECIAL_NAMES = { start: '起点', jail: '监狱', hospital: '医院', park: '御园', chance: '机会', fate: '命运', tax: '税务司', shop: '商店' };
 
 export function buildBoard(mapDef) {
   const m = mapDef || MAPS[0];
-  const n = perimeterOf(m);
+  const path = pathOf(m);
+  const n = path.length;
+  // 四角：起点=左下（索引 0），监狱=右下，医院=右上，御园=左上（按路径坐标定位）
+  const at = (row, col) => path.findIndex((g) => g.row === row && g.col === col);
   const corners = {
-    0: 'start',                                  // 左下角：起点
-    [m.cols - 1]: 'jail',                        // 右下角：监狱
-    [m.cols + m.rows - 2]: 'hospital',           // 右上角：医院
-    [2 * m.cols + m.rows - 3]: 'park',           // 左上角：御园
+    0: 'start',
+    [at(m.rows, m.cols)]: 'jail',
+    [at(1, m.cols)]: 'hospital',
+    [at(1, 1)]: 'park',
   };
   const types = new Array(n).fill('prop');
   for (const [k, t] of Object.entries(corners)) types[Number(k)] = t;
   for (let i = 0; i < n; i++) {
     if (types[i] !== 'prop') continue;
-    if (i % 9 === 4) types[i] = 'chance';
+    if (i % 13 === 6) types[i] = 'shop';
+    else if (i % 9 === 4) types[i] = 'chance';
     else if (i % 9 === 7) types[i] = 'fate';
     else if (i % 17 === 9) types[i] = 'tax';
   }
@@ -183,8 +328,6 @@ export function buildBoard(mapDef) {
 // 预生成全部棋盘（模块级缓存，确定性：同 key 恒同棋盘）
 const BOARD_CACHE = new Map(MAPS.map((m) => [m.key, buildBoard(m)]));
 export function boardOf(mapKey) { return BOARD_CACHE.get(mapKey) || BOARD_CACHE.get(MAPS[0].key); }
-export const TILES = BOARD_CACHE.get(MAPS[0].key); // 兼容旧引用（默认地图）
-export const TILE_COUNT = TILES.length;
 
 export function tilesOf(state) { return boardOf(state && state.mapKey); }
 export const PROP_TILES = (mapKey) => boardOf(mapKey).map((t, i) => (t.type === 'prop' ? i : -1)).filter((i) => i >= 0);
@@ -194,6 +337,18 @@ export function findTile(state, type) {
   return -1;
 }
 
+// —— 商店道具（落地商店格可购；均设上限，防止无脑堆叠）——
+export const SWIFT_BONUS = 2;   // 顺风骰：每次掷骰额外步数
+export const SWIFT_TURNS = 3;   // 每购一次生效的掷骰次数
+export const SWIFT_CAP = 6;     // 顺风骰效果叠加上限（次数）
+export const CHARM_CAP = 2;     // 护身符持有上限（枚）
+export const EQUAL_CAP = 2;     // 均富卡每局限购（张）
+export const SHOP_ITEMS = [
+  { id: 'swift', name: '顺风骰', icon: '🌬️', price: 140, desc: `接下来 ${SWIFT_TURNS} 次掷骰各多走 ${SWIFT_BONUS} 步（最多叠加 ${SWIFT_CAP} 次）` },
+  { id: 'charm', name: '护身符', icon: '🧿', price: 120, desc: `自动抵消一次落地租金（最多持有 ${CHARM_CAP} 枚）` },
+  { id: 'equal', name: '均富卡', icon: '🎴', price: 260, desc: `立即与最富的对手平分双方现金（每局限购 ${EQUAL_CAP} 张）` },
+];
+
 // —— 机会卡 / 命运卡（goto 目标为象征名，运行期按地图解析）——
 export const CHANCE_CARDS = [
   { id: 'c_gain', text: '路遇钱袋，拾金不昧得了谢礼', effect: { kind: 'cash', amount: 160 } },
@@ -218,19 +373,38 @@ export const FATE_CARDS = [
 ];
 
 // —— 可选主角（开罗风形象引用共享素材库 _lib/kairo.js 的 preset）——
+// perk 天赋（每位角色不同，选人有意义）：
+//   cash  开局额外本金；luck  骰运（低点 1~2 有概率重掷一次）；
+//   trade 购地折扣；tough 罚款类开支（监狱/医院）减免比例。
 export const CHARACTERS = [
-  { key: 'boy', name: '阿诚', title: '热血少年', look: { preset: 'boy', name: '阿诚' } },
-  { key: 'girl', name: '小蛮', title: '机灵少女', look: { preset: 'girl', name: '小蛮' } },
-  { key: 'sword', name: '剑侠', title: '行侠仗义', look: { preset: 'swordsman', body: '#3a6ea5', name: '剑侠' } },
-  { key: 'lady', name: '千金', title: '商贾世家', look: { preset: 'woman', name: '千金' } },
+  {
+    key: 'boy', name: '阿诚', title: '热血少年', tag: '骰运亨通',
+    desc: '掷骰时点数 1~2 有 30% 概率重掷一次，天生脚程顺遂。',
+    perk: { luck: 0.30 }, look: { preset: 'boy', name: '阿诚' },
+  },
+  {
+    key: 'girl', name: '小蛮', title: '机灵少女', tag: '购地八五折',
+    desc: '买地永久享受 85 折优惠，精明会过日子。',
+    perk: { trade: 0.15 }, look: { preset: 'girl', name: '小蛮' },
+  },
+  {
+    key: 'sword', name: '剑侠', title: '行侠仗义', tag: '罚金减半',
+    desc: '监狱罚款与医药费一律减半，皮糙肉厚不怕事。',
+    perk: { tough: 0.5 }, look: { preset: 'swordsman', body: '#3a6ea5', name: '剑侠' },
+  },
+  {
+    key: 'lady', name: '千金', title: '商贾世家', tag: '本金 +600',
+    desc: '家里有矿，开局额外携带 600 现金，家底就是底气。',
+    perk: { cash: 600 }, look: { preset: 'woman', name: '千金' },
+  },
 ];
 
-// —— AI 对手池 ——
+// —— AI 对手池（同样各怀天赋，对局风味各异）——
 export const AI_CHARACTERS = [
-  { key: 'tycoon', name: '钱老板', look: { preset: 'king', body: '#6a4a9a', name: '钱老板' } },
-  { key: 'ninja', name: '夜行客', look: { preset: 'ninja', name: '夜行客' } },
-  { key: 'fox', name: '胡三姨', look: { preset: 'foxSpirit', name: '胡三姨' } },
-  { key: 'sage', name: '白先生', look: { preset: 'sage', body: '#5a6a8a', name: '白先生' } },
+  { key: 'tycoon', name: '钱老板', tag: '家底殷实', perk: { cash: 500, trade: 0.10 }, look: { preset: 'king', body: '#6a4a9a', name: '钱老板' } },
+  { key: 'ninja', name: '夜行客', tag: '身手矫健', perk: { tough: 0.6, luck: 0.10 }, look: { preset: 'ninja', name: '夜行客' } },
+  { key: 'fox', name: '胡三姨', tag: '福星高照', perk: { luck: 0.35, cash: -200 }, look: { preset: 'foxSpirit', name: '胡三姨' } },
+  { key: 'sage', name: '白先生', tag: '精于算计', perk: { trade: 0.15, cash: 200 }, look: { preset: 'sage', body: '#5a6a8a', name: '白先生' } },
 ];
 
 // 玩家棋子底色（区分度优先，色相环取色）
diff --git a/apps/da-fu-weng/src/core/game.js b/apps/da-fu-weng/src/core/game.js
index 013ed0b..dc8b23f 100644
--- a/apps/da-fu-weng/src/core/game.js
+++ b/apps/da-fu-weng/src/core/game.js
@@ -5,9 +5,13 @@
 //   roll     → 等待当前玩家掷骰（人类点按钮 / AI 自动）
 //   resolve  → 已落格，待结算格子效果
 //   decision → 落在可买/可升的自家产业，等待买地/升级抉择
-//   end      → 本回合行动完毕，等待 endTurn 交给下一位
-//   over     → 终局（仅剩一家 / 达到回合上限）
+//   shop     → 落在商店，等待选购道具
+//   end      → 本回合行动完毕，等待 endTurn 交给下一位（对子加掷则再来）
+//   over     → 终局（仅剩一家 / 主角破产出局）
 //
+// 掷双骰：对子（两骰同点）加掷一回合（state.extra），连掷三次对子直接入狱；
+// 顺风骰 buff 在掷骰时自动多走 SWIFT_BONUS 步。
+// 不设回合上限：破产淘汰，一家独大者胜；主角破产即终局结算。
 // 所有随机（骰子/抽卡）走 core/rng.js 的确定性种子，存档可完整复现。
 // ============================================================================
 
@@ -19,11 +23,18 @@ import {
   TAX_MIN, MAX_LEVEL, SELL_RATE,
   AI_SAFE_CASH, AI_UPGRADE_CASH,
   CHANCE_CARDS, FATE_CARDS,
-  rentOf, upgradeCost, taxOf,
+  SHOP_ITEMS, SWIFT_BONUS, SWIFT_TURNS, SWIFT_CAP, CHARM_CAP, EQUAL_CAP,
+  rentOf, upgradeCost, taxOf, boomMult, BOOM_RATE,
 } from '../config.js';
-import { rngNext, rollDice } from './rng.js';
+import { rngNext, rollTwoDice } from './rng.js';
 
-const GAME_VERSION = 2;
+const GAME_VERSION = 3;
+
+// —— 天赋数值：购地价 / 罚款减免 ——
+export const buyPriceOf = (tile, player) =>
+  Math.round(tile.price * (1 - ((player && player.perk && player.perk.trade) || 0)));
+export const fineOf = (base, player) =>
+  Math.round(base * (1 - ((player && player.perk && player.perk.tough) || 0)));
 
 // —— 建档：heroKey 选主角，aiCount 补 1~3 位 AI 对手，mapKey 选地图 ——
 export function newGame({ heroKey, aiCount = 2, mapKey = MAPS[0].key, seed } = {}) {
@@ -31,14 +42,16 @@ export function newGame({ heroKey, aiCount = 2, mapKey = MAPS[0].key, seed } = {
   const ai = AI_CHARACTERS.slice(0, Math.max(1, Math.min(3, aiCount | 0)));
   const map = mapDefOf(mapKey);
   const board = boardOf(map.key);
-  const players = [hero, ...ai].map((c) => ({
-    key: c.key, name: c.name, look: c.look,
-    isAI: false, // hero 恒为 0 号
-    cash: START_CASH, pos: 0, laps: 0,
+  const mkPlayer = (c, isAI) => ({
+    key: c.key, name: c.name, look: c.look, isAI,
+    perk: { ...(c.perk || {}) },                       // 角色天赋（存档随行）
+    cash: START_CASH + ((c.perk && c.perk.cash) || 0), // 天赋本金
+    pos: 0, laps: 0,
     skipTurns: 0, bankrupt: false,
-  }));
-  players[0].isAI = false;
-  for (let i = 1; i < players.length; i++) players[i].isAI = true;
+    items: { swift: 0, charms: 0 },                    // 道具：顺风骰次数 / 护身符枚数
+    equalBought: 0,                                    // 均富卡本局已购数
+  });
+  const players = [mkPlayer(hero, false), ...ai.map((c) => mkPlayer(c, true))];
   return {
     ver: GAME_VERSION,
     mapKey: map.key,
@@ -47,6 +60,9 @@ export function newGame({ heroKey, aiCount = 2, mapKey = MAPS[0].key, seed } = {
     phase: 'roll',
     rng: seed | 0,
     lastDice: 0,
+    lastRoll: [0, 0],
+    doubles: 0,   // 当前玩家连续对子数
+    extra: false, // 对子加掷标记（endTurn 消化）
     players,
     tiles: board.map((t) => (t.type === 'prop' ? { owner: -1, level: 0, spent: 0 } : null)),
     log: [],
@@ -92,6 +108,16 @@ export function ranking(st) {
     .sort((a, b) => (a.bankrupt === b.bankrupt ? b.assets - a.assets : a.bankrupt ? 1 : -1));
 }
 
+// 现金最富的存活对手（均富卡 / AI 判断用）
+export function richestOther(st, pIdx) {
+  let rich = -1;
+  for (let i = 0; i < st.players.length; i++) {
+    if (i === pIdx || st.players[i].bankrupt) continue;
+    if (rich < 0 || st.players[i].cash > st.players[rich].cash) rich = i;
+  }
+  return rich;
+}
+
 // —— 日志 ——
 export function log(st, text) {
   st.log.push(`[R${st.round}] ${text}`);
@@ -159,11 +185,13 @@ export function payTo(st, fromIdx, toIdx, amount) {
   return paid;
 }
 
-// 仅剩一家 → 终局
+// 终局判定：仅剩一家 → 一家独大；主角破产 → 直接结算（观战无意义）。
 export function checkGameOver(st) {
   if (st.finished) return;
   if (alivePlayers(st).length <= 1) {
     finishGame(st, 'last');
+  } else if (st.players[0].bankrupt) {
+    finishGame(st, 'dead');
   }
 }
 
@@ -178,13 +206,14 @@ export function buyTile(st, tileIdx) {
   const t = tilesOf(st)[tileIdx];
   const ts = st.tiles[tileIdx];
   if (st.phase !== 'decision' || !ts || ts.owner !== -1) return { ok: false };
-  if (p.cash < t.price) return { ok: false };
-  p.cash -= t.price;
+  const cost = buyPriceOf(t, p);
+  if (p.cash < cost) return { ok: false };
+  p.cash -= cost;
   ts.owner = st.turnIdx;
   ts.level = 1;
-  ts.spent = t.price;
+  ts.spent = cost;
   st.phase = 'end';
-  log(st, `${p.name} 以 ${t.price} 买下「${t.name}」`);
+  log(st, `${p.name} 以 ${cost} 买下「${t.name}」${cost < t.price ? `（原价 ${t.price}）` : ''}`);
   return { ok: true };
 }
 
@@ -208,6 +237,67 @@ export function declineDecision(st) {
   st.phase = 'end';
 }
 
+// —— 商店（shop 阶段）——
+export function buyItem(st, itemId) {
+  const p = cur(st);
+  if (st.phase !== 'shop' || st.finished) return { ok: false, reason: 'phase' };
+  const item = SHOP_ITEMS.find((s) => s.id === itemId);
+  if (!item) return { ok: false, reason: 'item' };
+  if (p.cash < item.price) return { ok: false, reason: 'cash' };
+  if (itemId === 'swift' && p.items.swift >= SWIFT_CAP) return { ok: false, reason: 'cap' };
+  if (itemId === 'charm' && p.items.charms >= CHARM_CAP) return { ok: false, reason: 'cap' };
+  if (itemId === 'equal' && p.equalBought >= EQUAL_CAP) return { ok: false, reason: 'cap' };
+  p.cash -= item.price;
+  if (itemId === 'swift') {
+    p.items.swift = Math.min(SWIFT_CAP, p.items.swift + SWIFT_TURNS);
+    log(st, `${p.name} 购入顺风骰（生效 ${p.items.swift} 次掷骰）`);
+  } else if (itemId === 'charm') {
+    p.items.charms += 1;
+    log(st, `${p.name} 购入护身符（持有 ${p.items.charms} 枚）`);
+  } else if (itemId === 'equal') {
+    p.equalBought += 1;
+    applyEqualize(st, st.turnIdx);
+  }
+  return { ok: true };
+}
+
+export function leaveShop(st) {
+  if (st.phase !== 'shop') return;
+  st.phase = 'end';
+}
+
+// 均富卡：与现金最多的存活对手平分双方现金
+export function applyEqualize(st, pIdx) {
+  const p = st.players[pIdx];
+  const richIdx = richestOther(st, pIdx);
+  if (richIdx < 0) return false;
+  const rich = st.players[richIdx];
+  const total = p.cash + rich.cash;
+  p.cash = Math.round(total / 2);
+  rich.cash = total - p.cash;
+  log(st, `均富卡生效：${p.name} 与 ${rich.name} 现金拉平（${p.cash} / ${rich.cash}）`);
+  return true;
+}
+
+// AI 进店采购：均富卡（明显落后时翻盘）＞ 顺风骰 ＞ 护身符，一次至多买两件
+export function aiShopBuy(st) {
+  const p = cur(st);
+  const bought = [];
+  for (let round = 0; round < 2; round++) {
+    const richIdx = richestOther(st, st.turnIdx);
+    const gap = richIdx >= 0 ? st.players[richIdx].cash - p.cash : 0;
+    let want = null;
+    if (p.equalBought < EQUAL_CAP && gap >= 600 && p.cash - 260 >= AI_SAFE_CASH) want = 'equal';
+    else if (p.items.swift < SWIFT_CAP && p.cash - 140 >= AI_SAFE_CASH) want = 'swift';
+    else if (p.items.charms < CHARM_CAP && p.cash - 120 >= AI_SAFE_CASH) want = 'charm';
+    if (!want) break;
+    const r = buyItem(st, want);
+    if (!r.ok) break;
+    bought.push(want);
+  }
+  return bought;
+}
+
 // —— 抽卡结算 ——
 function applyCard(st, pIdx, card) {
   const p = st.players[pIdx];
@@ -254,11 +344,7 @@ function applyCard(st, pIdx, card) {
       break;
     }
     case 'give_rich': {
-      let rich = -1;
-      for (let i = 0; i < st.players.length; i++) {
-        if (i === pIdx || st.players[i].bankrupt) continue;
-        if (rich < 0 || st.players[i].cash > st.players[rich].cash) rich = i;
-      }
+      const rich = richestOther(st, pIdx);
       if (rich >= 0) { payTo(st, pIdx, rich, eff.amount); log(st, `${p.name} ${card.text}，付 ${eff.amount}`); }
       break;
     }
@@ -290,12 +376,14 @@ function applyLandingInstant(st, pIdx) {
   const p = st.players[pIdx];
   const t = tilesOf(st)[p.pos];
   if (t.type === 'jail') {
-    payTo(st, pIdx, null, JAIL_FINE);
+    const fine = fineOf(JAIL_FINE, p);
+    payTo(st, pIdx, null, fine);
     p.skipTurns = Math.max(p.skipTurns, JAIL_SKIP_TURNS);
-    log(st, `${p.name} 被押入监狱，罚款 ${JAIL_FINE} 并停 ${JAIL_SKIP_TURNS} 回合`);
+    log(st, `${p.name} 被押入监狱，罚款 ${fine} 并停 ${JAIL_SKIP_TURNS} 回合`);
   } else if (t.type === 'hospital') {
-    payTo(st, pIdx, null, HOSPITAL_FEE);
-    log(st, `${p.name} 住进医院，医药费 ${HOSPITAL_FEE}`);
+    const fee = fineOf(HOSPITAL_FEE, p);
+    payTo(st, pIdx, null, fee);
+    log(st, `${p.name} 住进医院，医药费 ${fee}`);
   }
 }
 
@@ -314,12 +402,36 @@ export function rollAndMove(st) {
     log(st, `${p.name} 停掷一回合（剩余 ${p.skipTurns}）`);
     return { ok: true, skipped: true };
   }
-  const dice = rollDice(st);
-  st.lastDice = dice;
-  const mv = movePlayer(st, st.turnIdx, dice);
-  log(st, `${p.name} 掷出 ${dice} 点，前进到「${tilesOf(st)[mv.dest].name}」`);
+  const luck = (p.perk && p.perk.luck) || 0;
+  const { d1, d2 } = rollTwoDice(st, luck);
+  st.lastRoll = [d1, d2];
+  const doubles = d1 === d2;
+  st.doubles = doubles ? (st.doubles || 0) + 1 : 0;
+  // 连掷三次对子：疑为出千，直接押入大牢（不发工资）
+  if (doubles && st.doubles >= 3) {
+    st.extra = false;
+    st.lastDice = 0;
+    const jailIdx = findTile(st, 'jail');
+    if (jailIdx >= 0) p.pos = jailIdx;
+    const fine = fineOf(JAIL_FINE, p);
+    payTo(st, st.turnIdx, null, fine);
+    p.skipTurns = Math.max(p.skipTurns, JAIL_SKIP_TURNS);
+    st.phase = 'end';
+    log(st, `${p.name} 连掷三次对子被疑出千，押入大牢（罚款 ${fine}，停 ${JAIL_SKIP_TURNS} 回合）`);
+    return { ok: true, jailed: true, d1, d2 };
+  }
+  st.extra = doubles;
+  let steps = d1 + d2;
+  if (p.items.swift > 0) {
+    p.items.swift -= 1;
+    steps += SWIFT_BONUS;
+    log(st, `${p.name} 的顺风骰助推 +${SWIFT_BONUS} 步`);
+  }
+  st.lastDice = steps;
+  const mv = movePlayer(st, st.turnIdx, steps);
+  log(st, `${p.name} 掷出 ${d1}+${d2}${doubles ? '（对子！）' : ''}，前进到「${tilesOf(st)[mv.dest].name}」`);
   st.phase = 'resolve';
-  return { ok: true, dice, dest: mv.dest };
+  return { ok: true, dice: steps, d1, d2, doubles, dest: mv.dest };
 }
 
 // —— 结算当前落格（resolve 阶段）——
@@ -333,7 +445,7 @@ export function resolveTile(st) {
     case 'prop': {
       if (ts.owner === -1) {
         st.phase = 'decision';
-        return { kind: 'buy', tile: i, price: t.price };
+        return { kind: 'buy', tile: i, price: buyPriceOf(t, p), listPrice: t.price };
       }
       if (ts.owner === st.turnIdx) {
         if (ts.level < MAX_LEVEL) {
@@ -343,14 +455,23 @@ export function resolveTile(st) {
         st.phase = 'end';
         return { kind: 'info', text: `「${t.name}」已是满级产业，安心收租` };
       }
-      // 交租
+      // 交租（护身符可自动抵消一次）
+      if (p.items.charms > 0) {
+        p.items.charms -= 1;
+        st.phase = 'end';
+        log(st, `${p.name} 的护身符碎裂，免除了一笔租金`);
+        return { kind: 'charm', tile: i };
+      }
       const owner = ts.owner;
       const mono = hasMonopoly(st, t.district, owner);
-      const rent = rentOf(t, ts.level, mono);
+      const rent = Math.round(rentOf(t, ts.level, mono) * boomMult(st.round));
       const paid = payTo(st, st.turnIdx, owner, rent);
       st.phase = 'end';
       return { kind: 'rent', tile: i, rent, owner, mono, ...paid };
     }
+    case 'shop':
+      st.phase = 'shop';
+      return { kind: 'shop', tile: i };
     case 'chance':
     case 'fate': {
       const card = drawCard(st, t.type);
@@ -366,17 +487,21 @@ export function resolveTile(st) {
       st.phase = 'end';
       return { kind: 'tax', amount };
     }
-    case 'jail':
-      payTo(st, st.turnIdx, null, JAIL_FINE);
+    case 'jail': {
+      const fine = fineOf(JAIL_FINE, p);
+      payTo(st, st.turnIdx, null, fine);
       p.skipTurns = Math.max(p.skipTurns, JAIL_SKIP_TURNS);
       st.phase = 'end';
-      log(st, `${p.name} 误入监狱，罚款 ${JAIL_FINE} 并停 ${JAIL_SKIP_TURNS} 回合`);
-      return { kind: 'jail' };
-    case 'hospital':
-      payTo(st, st.turnIdx, null, HOSPITAL_FEE);
+      log(st, `${p.name} 误入监狱，罚款 ${fine} 并停 ${JAIL_SKIP_TURNS} 回合`);
+      return { kind: 'jail', fine };
+    }
+    case 'hospital': {
+      const fee = fineOf(HOSPITAL_FEE, p);
+      payTo(st, st.turnIdx, null, fee);
       st.phase = 'end';
-      log(st, `${p.name} 就医，医药费 ${HOSPITAL_FEE}`);
-      return { kind: 'hospital' };
+      log(st, `${p.name} 就医，医药费 ${fee}`);
+      return { kind: 'hospital', fee };
+    }
     case 'park':
       st.phase = 'end';
       log(st, `${p.name} 在御园赏花，安然无恙`);
@@ -387,18 +512,27 @@ export function resolveTile(st) {
   }
 }
 
-// —— 交棒（end 阶段）——
+// —— 交棒（end 阶段）：对子加掷优先；随后轮到下一位存活玩家。
+//    不设回合上限——对局只以破产淘汰收场。
 export function endTurn(st) {
   if (st.phase !== 'end' || st.finished) return { ok: false };
+  const p = st.players[st.turnIdx];
+  if (st.extra && !p.bankrupt) {
+    st.extra = false;
+    st.phase = 'roll';
+    log(st, `${p.name} 掷出对子，再加掷一次`);
+    return { ok: true, again: true };
+  }
+  st.extra = false;
+  st.doubles = 0;
   const n = st.players.length;
-  const maxRound = mapOf(st).rounds;
   do {
     st.turnIdx = (st.turnIdx + 1) % n;
     if (st.turnIdx === 0) {
       st.round += 1;
-      if (st.round > maxRound) {
-        finishGame(st, 'rounds');
-        return { ok: true, finished: true };
+      // 城市繁荣：租金档位提升时播报（时间压力，促使对局收敛）
+      if (boomMult(st.round) > boomMult(st.round - 1)) {
+        log(st, `城市繁荣，百业兴旺——全城租金普涨 ${Math.round(BOOM_RATE * 100)}%（当前 ×${boomMult(st.round).toFixed(2)}）`);
       }
     }
   } while (st.players[st.turnIdx].bankrupt);
diff --git a/apps/da-fu-weng/src/core/rng.js b/apps/da-fu-weng/src/core/rng.js
index 11af93f..34b32c5 100644
--- a/apps/da-fu-weng/src/core/rng.js
+++ b/apps/da-fu-weng/src/core/rng.js
@@ -16,11 +16,22 @@ export function randInt(state, lo, hi) {
   return lo + Math.floor(rngNext(state) * (hi - lo + 1));
 }
 
-// 掷骰子：1~6。
+// 掷骰子：1~6（单骰，保留作通用工具）。
 export function rollDice(state) {
   return randInt(state, 1, 6);
 }
 
+// 掷双骰：luck > 0 时，点数 1~2 的骰子有 luck 概率重掷一次（角色天赋「骰运」）。
+export function rollTwoDice(state, luck = 0) {
+  let d1 = randInt(state, 1, 6);
+  let d2 = randInt(state, 1, 6);
+  if (luck > 0) {
+    if (d1 <= 2 && rngNext(state) < luck) d1 = randInt(state, 1, 6);
+    if (d2 <= 2 && rngNext(state) < luck) d2 = randInt(state, 1, 6);
+  }
+  return { d1, d2 };
+}
+
 // 非零整数随机种子（UI 开新档用；测试直接传固定值）。
 export function makeSeed() {
   try { return (Date.now() ^ (Math.random() * 0xffffffff)) | 0; }
diff --git a/apps/da-fu-weng/src/core/save.js b/apps/da-fu-weng/src/core/save.js
index c9a2733..0e1fcf4 100644
--- a/apps/da-fu-weng/src/core/save.js
+++ b/apps/da-fu-weng/src/core/save.js
@@ -3,7 +3,7 @@
 // 通过 storage 访问器隔离 localStorage，便于 Node 单测注入。
 // ============================================================================
 
-import { MAPS, mapDefOf, perimeterOf } from '../config.js';
+import { MAPS, mapDefOf, tileCountOf } from '../config.js';
 
 export const SAVE_SLOTS = 4;
 const SLOT_PREFIX = 'dfw_save_';
@@ -29,7 +29,7 @@ function reviveState(raw) {
   if (!st || typeof st !== 'object') return null;
   if (!Array.isArray(st.players) || !Array.isArray(st.tiles)) return null;
   const map = mapDefOf(st.mapKey);
-  if (st.tiles.length !== perimeterOf(map)) return null;
+  if (st.tiles.length !== tileCountOf(map)) return null;
   if (typeof st.rng !== 'number' || typeof st.turnIdx !== 'number') return null;
   return st;
 }
@@ -66,7 +66,6 @@ export function slotInfo(slot) {
   const map = MAPS.find((m) => m.key === st.mapKey) || MAPS[0];
   return {
     round: st.round || 1,
-    maxRound: map.rounds,
     mapName: map.name,
     heroName: (hero && hero.name) || '?',
     players: (st.players || []).length,
@@ -92,6 +91,6 @@ export function importSave(code) {
     const st = JSON.parse(decodeURIComponent(escape(atob(String(code).trim()))));
     if (!st || !Array.isArray(st.players) || !Array.isArray(st.tiles)) return null;
     const map = mapDefOf(st.mapKey);
-    return st.tiles.length === perimeterOf(map) ? st : null;
+    return st.tiles.length === tileCountOf(map) ? st : null;
   } catch (_) { return null; }
 }
diff --git a/apps/da-fu-weng/src/ui/app.js b/apps/da-fu-weng/src/ui/app.js
index 026fc62..15f4c06 100644
--- a/apps/da-fu-weng/src/ui/app.js
+++ b/apps/da-fu-weng/src/ui/app.js
@@ -1,7 +1,8 @@
 // ============================================================================
 // 大富翁 · 环游之城 · UI 渲染与回合驱动（纯原生 DOM，竖屏优先）。
-// 界面：启动器 → 选人+选图（6 张地图逐步解锁）→ 对局
-//   （大棋盘可拖动平移 + 镜头跟随、骰子、玩家 HUD、日志、买地/抽卡/结算弹窗）
+// 界面：启动器 → 选人（天赋各异）+选图（6 张地图逐步解锁）→ 对局
+//   （外环+内街的大棋盘可拖动平移 + 镜头跟随、腹地点缀风景、浮动双骰信息条、
+//    玩家 HUD（含道具徽章）、日志、买地/抽卡/商店/结算弹窗）
 //   → 终局排名（夺冠解锁下一张地图）。
 // 角色形象全部来自共享素材库 _lib/kairo.js（预置 · 开罗风 · 可复用）。
 // ============================================================================
@@ -10,13 +11,15 @@ import { attachKeyboardShell } from '../../../_lib/keyboard-shell.js';
 import { kairoSVG } from '../../../_lib/kairo.js';
 import { h, clear } from './dom.js';
 import {
-  MAPS, mapDefOf, boardOf, perimeterOf, tileGrid, PALETTE,
-  CHARACTERS, AI_CHARACTERS, CHIP_COLORS,
+  MAPS, mapDefOf, boardOf, tileCountOf, pathOf, decoCells, tileGrid, PALETTE,
+  CHARACTERS, AI_CHARACTERS, CHIP_COLORS, SHOP_ITEMS,
+  SWIFT_CAP, CHARM_CAP, EQUAL_CAP, boomMult,
   rentOf,
 } from '../config.js';
 import {
   newGame, rollAndMove, resolveTile, buyTile, upgradeTile, declineDecision,
   endTurn, aiDecide, ranking, ownedTilesOf, hasMonopoly, log as logSt, mapOf,
+  buyItem, leaveShop, aiShopBuy,
 } from '../core/game.js';
 import { makeSeed } from '../core/rng.js';
 import { loadMeta, isUnlocked, unlockNext } from '../core/meta.js';
@@ -35,18 +38,18 @@ function districtOf(st, i) {
   return t && t.district != null ? dists[t.district] : null;
 }
 
-// 地图迷你缩略图：外环小方点按类型/街区着色
+// 地图迷你缩略图：按路径（外环+内街）落子，路径格按类型/街区着色，腹地为浅色
 function miniBoard(map) {
   const tiles = boardOf(map.key);
+  const path = pathOf(map);
   const wrap = h('span', { class: 'map-mini' });
   wrap.style.gridTemplateColumns = `repeat(${map.cols}, 1fr)`;
-  for (let r = 1; r <= map.rows; r++) {
-    for (let c = 1; c <= map.cols; c++) wrap.appendChild(h('i', { class: 'map-mini__cell inner' }));
+  for (let i = 0; i < map.cols * map.rows; i++) {
+    wrap.appendChild(h('i', { class: 'map-mini__cell inner' }));
   }
   tiles.forEach((t, i) => {
-    const { row, col } = tileGrid(i, map.cols, map.rows);
-    const idx = (row - 1) * map.cols + (col - 1);
-    const cell = wrap.children[idx];
+    const g = path[i];
+    const cell = wrap.children[(g.row - 1) * map.cols + (g.col - 1)];
     cell.className = 'map-mini__cell';
     if (t.type === 'prop') cell.style.background = PALETTE[map.districts[t.district].color];
     else cell.dataset.t = t.type;
@@ -82,7 +85,7 @@ export class GameUI {
         info
           ? h('div', null,
             h('b', null, `${info.heroName} · ${info.mapName}`),
-            h('span', { class: 'muted' }, `R${info.round}/${info.maxRound} · ${info.players} 人${info.finished ? ' · 已终局' : ''}`))
+            h('span', { class: 'muted' }, `第 ${info.round} 回合 · ${info.players} 人${info.finished ? ' · 已终局' : ''}`))
           : h('span', { class: 'muted' }, '空档位'),
       ),
       info
@@ -131,8 +134,10 @@ export class GameUI {
         h('span', { class: 'hero-cell__ava', html: kairoSVG(c.look, 56) }),
         h('b', null, c.name),
         h('span', { class: 'muted' }, c.title),
+        h('span', { class: 'hero-perk' }, c.tag),
       ));
     }
+    const hero = CHARACTERS.find((c) => c.key === t.heroKey) || CHARACTERS[0];
     const aiRow = h('div', { class: 'ai-toggle' });
     for (const n of [1, 2, 3]) {
       aiRow.appendChild(h('button', {
@@ -153,7 +158,7 @@ export class GameUI {
         miniBoard(m),
         h('b', null, unlocked ? m.name : '🔒 未解锁'),
         h('span', { class: 'muted' }, unlocked
-          ? `${perimeterOf(m)} 格 · ${m.rounds} 回合`
+          ? `${tileCountOf(m)} 格 · 淘汰制`
           : `在「${prev ? prev.name : ''}」夺冠解锁`),
       ));
     });
@@ -162,12 +167,16 @@ export class GameUI {
         h('button', { class: 'btn-ghost', onClick: () => this.showLauncher() }, '← 返回'),
         h('h1', null, '组建商队'),
       ),
-      h('div', { class: 'panel' }, h('h4', null, '选择主角'), heroRow),
+      h('div', { class: 'panel' },
+        h('h4', null, '选择主角（天赋各异）'),
+        heroRow,
+        h('p', { class: 'perk-note' }, h('b', null, `${hero.name} · ${hero.tag}`), ` — ${hero.desc}`),
+      ),
       h('div', { class: 'panel' },
         h('h4', null, 'AI 对手'),
         aiRow,
         h('p', { class: 'muted', style: { marginTop: '0.4rem' } },
-          `对手依次为：${AI_CHARACTERS.slice(0, t.aiCount).map((a) => a.name).join('、')}`),
+          `对手依次为：${AI_CHARACTERS.slice(0, t.aiCount).map((a) => `${a.name}（${a.tag}）`).join('、')}`),
       ),
       h('div', { class: 'panel' },
         h('h4', null, '选择地图（夺冠逐步解锁）'),
@@ -209,6 +218,7 @@ export class GameUI {
     const st = this.state;
     const map = mapDefOf(st);
     const tiles = boardOf(st.mapKey);
+    const path = pathOf(map);
     // 棋盘视口（可拖动平移）→ 平移层 → 固定像素网格棋盘 + 棋子层
     this.boardView = h('div', { class: 'board-view' });
     this.boardPan = h('div', { class: 'board-pan' });
@@ -217,25 +227,33 @@ export class GameUI {
     this.boardEl.style.gridTemplateRows = `repeat(${map.rows}, ${CELL}px)`;
     this.tileEls = [];
     tiles.forEach((t, i) => {
-      const { row, col } = tileGrid(i, map.cols, map.rows);
+      const g = path[i];
       const el = h('button', { class: `tile t-${t.type}`, dataset: { tile: String(i) }, onClick: () => this.showTileSheet(i) });
-      el.style.gridRow = String(row);
-      el.style.gridColumn = String(col);
+      el.style.gridRow = String(g.row);
+      el.style.gridColumn = String(g.col);
       this.tileEls.push(el);
       this.boardEl.appendChild(el);
     });
-    this.centerEl = h('div', { class: 'board-center' });
-    this.centerEl.style.gridRow = `2 / ${map.rows}`;
-    this.centerEl.style.gridColumn = `2 / ${map.cols}`;
-    this.diceEl = h('div', { class: 'dice' }, '🎲');
-    this.centerName = h('div', { class: 'center-name' }, '—');
-    this.centerHint = h('div', { class: 'center-hint muted' }, '掷骰开始');
-    this.centerEl.append(this.diceEl, this.centerName, this.centerHint);
-    this.boardEl.appendChild(this.centerEl);
+    // 腹地点缀风景（不挡路、不可点），让地图中央有烟火气
+    for (const d of decoCells(map)) {
+      const el = h('div', { class: 'tile deco' }, d.icon);
+      el.style.gridRow = String(d.row);
+      el.style.gridColumn = String(d.col);
+      this.boardEl.appendChild(el);
+    }
     this.tokenLayer = h('div', { class: 'token-layer' });
     this.tokenEls = [];
     this.boardPan.append(this.boardEl, this.tokenLayer);
     this.boardView.appendChild(this.boardPan);
+    // 浮动信息条（悬浮于棋盘上方，不挡拖动）：双骰 + 当前回合 + 提示
+    this.diceEl = h('span', { class: 'bh-dice' }, '🎲🎲');
+    this.centerName = h('b', { class: 'bh-name' }, '—');
+    this.centerHint = h('span', { class: 'bh-hint muted' }, '掷骰开始');
+    this.boardHud = h('div', { class: 'board-hud' },
+      this.diceEl,
+      h('div', { class: 'bh-main' }, this.centerName, this.centerHint),
+    );
+    this.boardView.appendChild(this.boardHud);
     this.stage.appendChild(this.boardView);
     this.wirePan();
     this.measureBoard();
@@ -338,7 +356,7 @@ export class GameUI {
     if (!p.follow || !p.bw) return;
     const st = this.state;
     const map = mapOf(st);
-    const { row, col } = tileGrid(st.players[pIdx].pos, map.cols, map.rows);
+    const { row, col } = tileGrid(st.players[pIdx].pos, map);
     const tx = (col - 0.5) * CELL;
     const ty = (row - 0.5) * CELL;
     p.x = p.w / 2 - tx;
@@ -350,7 +368,7 @@ export class GameUI {
   // —— 棋子定位：格中心 + 同格多人微错位（相对棋盘像素）——
   tokenXY(pIdx, tileIdx) {
     const map = mapOf(this.state);
-    const { row, col } = tileGrid(tileIdx, map.cols, map.rows);
+    const { row, col } = tileGrid(tileIdx, map);
     const cx = (col - 0.5) * CELL;
     const cy = (row - 0.5) * CELL;
     const players = this.state.players;
@@ -421,6 +439,9 @@ export class GameUI {
     // HUD
     clear(this.hudEl);
     st.players.forEach((p, i) => {
+      const badges = [];
+      if (!p.bankrupt && p.items && p.items.swift > 0) badges.push(`🌬️${p.items.swift}`);
+      if (!p.bankrupt && p.items && p.items.charms > 0) badges.push(`🧿${p.items.charms}`);
       this.hudEl.appendChild(h('div', {
         class: `pcard ${i === st.turnIdx ? 'active' : ''} ${p.bankrupt ? 'dead' : ''}`,
         style: { '--chip': CHIP_COLORS[i % CHIP_COLORS.length] },
@@ -430,17 +451,25 @@ export class GameUI {
           h('div', { class: 'pcard__name' }, `${p.name}${p.isAI ? '' : '（你）'}`),
           h('div', { class: 'pcard__cash' }, p.bankrupt ? '破产' : `$${p.cash}`),
         ),
-        h('span', { class: 'pcard__prop' }, `${ownedTilesOf(st, i).length} 处`),
-        p.skipTurns > 0 && !p.bankrupt ? h('span', { class: 'pcard__skip' }, '停') : null,
+        h('div', { class: 'pcard__side' },
+          h('span', { class: 'pcard__prop' }, `${ownedTilesOf(st, i).length} 处`),
+          h('span', { class: 'pcard__items' }, badges.join(' ')),
+          p.skipTurns > 0 && !p.bankrupt ? h('span', { class: 'pcard__skip' }, '停') : null,
+        ),
       ));
     });
-    // 中央信息
+    // 浮动信息条
     const cp = st.players[st.turnIdx];
+    const boom = boomMult(st.round);
+    const boomTxt = boom > 1 ? ` · 繁荣×${Number(boom.toFixed(2))}` : '';
     this.centerName.textContent = st.finished ? '对局结束' : `${cp.name} 的回合`;
     this.centerHint.textContent = st.finished
       ? '查看结算'
-      : `R${st.round}/${map.rounds} · ${st.phase === 'roll' ? (cp.isAI ? '思考中…' : '掷骰前进') : '结算中…'}`;
-    if (!st.finished) this.diceEl.textContent = st.lastDice > 0 ? `🎲 ${st.lastDice}` : '🎲';
+      : `第 ${st.round} 回合${boomTxt} · ${st.phase === 'roll' ? (cp.isAI ? '思考中…' : '掷骰前进') : '结算中…'}`;
+    if (!st.finished) {
+      const [rd1, rd2] = st.lastRoll || [0, 0];
+      this.diceEl.textContent = rd1 + rd2 > 0 ? `🎲${rd1}+${rd2}` : '🎲🎲';
+    }
     // 按钮
     const canRoll = !this.busy && !st.finished && st.phase === 'roll' && !cp.isAI;
     this.rollBtn.disabled = !canRoll;
@@ -480,15 +509,21 @@ export class GameUI {
       this._pan.follow = true; // 新回合恢复镜头跟随
       const from = st.players[pIdx].pos;
       for (let i = 0; i < 6; i++) {
-        this.diceEl.textContent = `🎲 ${1 + ((i * 5 + pIdx) % 6)}`;
+        this.diceEl.textContent = `🎲${1 + ((i * 5 + pIdx) % 6)}+${1 + ((i * 3 + pIdx + 2) % 6)}`;
         await sleep(60);
       }
       const r = rollAndMove(st);
       if (r.skipped) {
         this.refresh();
         this.toast(`${st.players[pIdx].name} 停掷一回合`);
+      } else if (r.jailed) {
+        this.diceEl.textContent = `🎲${r.d1}+${r.d2}`;
+        this.refresh();
+        this.centerOnToken(pIdx, true);
+        this.toast(`${st.players[pIdx].name} 连掷三次对子，被疑出千押入大牢！`, 'bad');
+        await sleep(900);
       } else {
-        this.diceEl.textContent = `🎲 ${r.dice}`;
+        this.diceEl.textContent = `🎲${r.d1}+${r.d2}`;
         await this.animateMove(pIdx, from, r.dest);
         await this.resolveLoop(pIdx);
       }
@@ -554,10 +589,31 @@ export class GameUI {
         break;
       }
       case 'rent': {
-        this.toast(`${p.name} 付给 ${st.players[res.owner].name} 租金 $${res.amount}${res.mono ? '（垄断×1.5）' : ''}`);
+        const boom = boomMult(st.round);
+        this.toast(`${p.name} 付给 ${st.players[res.owner].name} 租金 $${res.amount}`
+          + `${res.mono ? '（垄断×1.5）' : ''}${boom > 1 ? `（繁荣×${Number(boom.toFixed(2))}）` : ''}`);
         await sleep(isAI ? 600 : 800);
         break;
       }
+      case 'charm': {
+        this.toast(`🧿 ${p.name} 的护身符碎裂，免除了这笔租金`);
+        await sleep(700);
+        break;
+      }
+      case 'shop': {
+        this.centerOnToken(pIdx, true);
+        if (isAI) {
+          const bought = aiShopBuy(st);
+          leaveShop(st);
+          this.toast(bought.length
+            ? `${p.name} 采购了：${bought.map((id) => SHOP_ITEMS.find((s) => s.id === id).name).join('、')}`
+            : `${p.name} 逛了逛商店，什么也没买`);
+          await sleep(900);
+        } else {
+          await this.showShopSheet();
+        }
+        break;
+      }
       case 'card': {
         await this.showCardSheet(res.card, isAI);
         break;
@@ -607,7 +663,9 @@ export class GameUI {
           h('div', { class: 'row', style: { alignItems: 'center', gap: '0.6rem' } },
             h('span', { class: 'buy-ava', html: kairoSVG(p.look, 44) }),
             h('div', { class: 'grow' },
-              h('div', null, `${d.name} · ${isBuy ? `地价 $${res.price}` : `当前 ${ts.level} 级 → ${ts.level + 1} 级`}`),
+              h('div', null, `${d.name} · ${isBuy
+                ? (res.listPrice && res.listPrice !== res.price ? `地价 $${res.price}（天赋折扣，原价 $${res.listPrice}）` : `地价 $${res.price}`)
+                : `当前 ${ts.level} 级 → ${ts.level + 1} 级`}`),
               h('div', { class: 'muted' }, `现金 $${p.cash}${afford ? '' : '（不足）'}`),
             ),
           ),
@@ -649,6 +707,55 @@ export class GameUI {
     });
   }
 
+  // 商店：道具列表 + 已持有量 + 上限，可连续购买，离开后回到回合流程
+  showShopSheet() {
+    return new Promise((resolve) => {
+      const finish = () => { this.closeSheet(); resolve(); };
+      const render = () => {
+        const st = this.state;
+        const p = st.players[st.turnIdx];
+        const list = SHOP_ITEMS.map((item) => {
+          const held = item.id === 'swift'
+            ? `生效剩 ${p.items.swift}/${SWIFT_CAP} 次`
+            : item.id === 'charm'
+              ? `持有 ${p.items.charms}/${CHARM_CAP} 枚`
+              : `本局已购 ${p.equalBought}/${EQUAL_CAP} 张`;
+          const capped = (item.id === 'swift' && p.items.swift >= SWIFT_CAP)
+            || (item.id === 'charm' && p.items.charms >= CHARM_CAP)
+            || (item.id === 'equal' && p.equalBought >= EQUAL_CAP);
+          const afford = p.cash >= item.price && !capped;
+          return h('div', { class: 'shop-item' },
+            h('span', { class: 'shop-item__icon' }, item.icon),
+            h('div', { class: 'grow' },
+              h('div', null, h('b', null, item.name), ' ', h('span', { class: 'shop-item__price' }, `$${item.price}`)),
+              h('div', { class: 'muted' }, item.desc),
+              h('div', { class: 'muted shop-item__held' }, held),
+            ),
+            h('button', {
+              class: 'btn-ghost',
+              disabled: !afford,
+              onClick: () => {
+                const r = buyItem(st, item.id);
+                this.refresh();
+                if (!r.ok) this.toast(r.reason === 'cap' ? '已达上限' : '现金不足', 'bad');
+                render();
+              },
+            }, capped ? '已满' : '购买'),
+          );
+        });
+        this.showSheet({
+          title: '🛒 商店',
+          body: h('div', { class: 'shop-sheet' },
+            h('p', { class: 'muted' }, '掌柜笑眯眯：客官，来点什么？'),
+            ...list,
+          ),
+          foot: [h('button', { class: 'btn-primary', onClick: () => { leaveShop(st); this.refresh(); finish(); } }, '离开商店')],
+        });
+      };
+      render();
+    });
+  }
+
   showTileSheet(i) {
     if (this._pan && this._pan.moved) { this._pan.moved = false; return; } // 拖动尾随点击不弹详情
     const st = this.state;
@@ -678,6 +785,7 @@ export class GameUI {
         hospital: '落入者支付医药费。',
         park: '御园赏花，平安无事。',
         tax: '按现金一成缴税（50~500）。',
+        shop: '商店：可购顺风骰（多走几步）、护身符（免一次租金）、均富卡（与最富对手平分现金）。',
       }[t.type] || '';
       body.push(h('p', { class: 'muted' }, desc));
     }
@@ -754,7 +862,10 @@ export class GameUI {
       }
     }
     const map = mapOf(st);
-    const reasonText = st.finished.reason === 'last' ? '对手全部破产，一家独大！' : `${map.rounds} 回合期满，清点资产。`;
+    const reasonText = {
+      last: '对手全部破产，一家独大！',
+      dead: '你已破产出局，商途折戟。',
+    }[st.finished.reason] || '对局结束，清点资产。';
     const body = h('div', { class: 'over-sheet' },
       h('p', { class: 'muted' }, `${map.name} · ${reasonText}`),
       unlockLine,
diff --git a/apps/da-fu-weng/src/ui/style.css b/apps/da-fu-weng/src/ui/style.css
index 0ba2560..242c780 100644
--- a/apps/da-fu-weng/src/ui/style.css
+++ b/apps/da-fu-weng/src/ui/style.css
@@ -77,6 +77,13 @@
 .dfw .hero-cell.active { border-color: var(--gold); box-shadow: 0 0 0 2px rgba(212,168,75,0.5); }
 .dfw .hero-cell b { font-size: 0.82rem; }
 .dfw .hero-cell__ava svg { display: block; margin: 0 auto; }
+.dfw .hero-perk {
+  font-size: 0.6rem; color: var(--gold); background: rgba(212, 168, 75, 0.12);
+  border: 1px solid rgba(212, 168, 75, 0.4); border-radius: 999px; padding: 1px 6px;
+  white-space: nowrap;
+}
+.dfw .perk-note { margin: 0.55rem 0 0; font-size: 0.72rem; color: var(--muted); line-height: 1.5; }
+.dfw .perk-note b { color: var(--gold); }
 .dfw .ai-toggle { display: flex; gap: 0.5rem; }
 .dfw .ai-toggle button { flex: 1; padding: 0.55rem; }
 .dfw .ai-toggle button.active { background: linear-gradient(180deg, #5aa9e6, #2f6fae); border: none; color: #fff; font-weight: 700; }
@@ -128,16 +135,28 @@
 .dfw .tile.t-hospital { background: linear-gradient(180deg, #e0d0d8, var(--paper)); }
 .dfw .tile.t-chance, .dfw .tile.t-fate { background: linear-gradient(180deg, #f0e0b8, var(--paper)); }
 .dfw .tile.t-tax { background: linear-gradient(180deg, #e8d8b0, var(--paper)); }
+.dfw .tile.t-shop { background: linear-gradient(180deg, #d8e8f8, var(--paper)); }
 
-/* 中央信息区（棋盘网格中间空档） */
-.dfw .board-center {
-  display: flex; flex-direction: column; align-items: center; justify-content: center;
-  background: radial-gradient(circle at 50% 40%, #f7f1e2, var(--paper-2));
-  border-radius: 8px; color: #4a3a28; gap: 2px; min-width: 0; padding: 2px;
+/* 腹地点缀风景（非路径格，不可交互） */
+.dfw .tile.deco {
+  background: #cbb88c; border-radius: 50% 40% 55% 45%;
+  display: flex; align-items: center; justify-content: center;
+  font-size: 1rem; opacity: 0.85; pointer-events: none;
+  box-shadow: inset 0 0 0 2px rgba(138, 122, 82, 0.25);
+}
+
+/* 浮动信息条（悬浮于棋盘上方：双骰 + 回合 + 提示；不挡拖动手势） */
+.dfw .board-hud {
+  position: absolute; top: 6px; left: 50%; transform: translateX(-50%);
+  display: flex; align-items: center; gap: 0.55rem;
+  background: rgba(20, 26, 34, 0.86); border: 1px solid var(--line); border-radius: 999px;
+  padding: 0.3rem 0.85rem; z-index: 20; pointer-events: none;
+  max-width: 92%; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
 }
-.dfw .dice { font-size: 1.3rem; font-weight: 900; line-height: 1.1; }
-.dfw .center-name { font-size: 0.74rem; font-weight: 700; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
-.dfw .center-hint { font-size: 0.6rem; }
+.dfw .bh-dice { font-size: 1rem; font-weight: 900; color: var(--gold); white-space: nowrap; line-height: 1.1; }
+.dfw .bh-main { min-width: 0; }
+.dfw .bh-name { display: block; font-size: 0.76rem; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
+.dfw .bh-hint { display: block; font-size: 0.6rem; }
 
 /* 棋子层（随平移层移动，像素定位） */
 .dfw .token-layer { position: absolute; left: 0; top: 0; pointer-events: none; }
@@ -189,12 +208,25 @@
 .dfw .pcard__body { flex: 1; min-width: 0; }
 .dfw .pcard__name { font-size: 0.68rem; font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
 .dfw .pcard__cash { font-size: 0.72rem; color: var(--gold); font-variant-numeric: tabular-nums; }
-.dfw .pcard__prop { font-size: 0.58rem; color: var(--muted); flex: none; }
+.dfw .pcard__side { flex: none; display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
+.dfw .pcard__prop { font-size: 0.58rem; color: var(--muted); }
+.dfw .pcard__items { font-size: 0.58rem; line-height: 1; white-space: nowrap; }
 .dfw .pcard__skip {
   flex: none; font-size: 0.55rem; background: var(--bad); color: #fff;
   border-radius: 4px; padding: 1px 4px;
 }
 
+/* 商店弹窗 */
+.dfw .shop-sheet .shop-item {
+  display: flex; align-items: center; gap: 0.6rem;
+  background: var(--bg-2); border: 1px solid var(--line); border-radius: 10px;
+  padding: 0.5rem 0.6rem; margin: 0.4rem 0;
+}
+.dfw .shop-item__icon { flex: none; font-size: 1.5rem; }
+.dfw .shop-item__price { color: var(--gold); font-weight: 700; }
+.dfw .shop-item__held { font-size: 0.62rem; }
+.dfw .shop-item button { flex: none; min-width: 3.6em; padding: 0.4rem 0.6rem; }
+
 /* 日志条 */
 .dfw .log-strip {
   flex: 1; min-height: 3em;
diff --git a/src/main.js b/src/main.js
index cf66783..8321fdf 100644
--- a/src/main.js
+++ b/src/main.js
@@ -90,7 +90,7 @@ const APPS = {
     title: '大富翁',
     subtitle: '棋盘 · 环游之城',
     emblem: '富',
-    desc: '掷骰环游大城：6 张 50~80 格地图逐步解锁，购地收租、升级产业、垄断街区翻倍，机会命运祸福难料；棋盘可拖动、镜头自动跟随，带上开罗风小队与 AI 富豪斗智，破产淘汰或回合期满结算首富。',
+    desc: '掷双骰环游六座大城：主角天赋各异（骰运/折扣/本金），购地收租、垄断街区翻倍；内街纵横的棋盘可拖动漫游，路过商店还能置办顺风骰、护身符与均富卡；不设回合上限，城市繁荣租金渐涨，破产淘汰、一家独大者胜。',
     loader: () => import('../apps/da-fu-weng/src/main.js'),
   },
 }
