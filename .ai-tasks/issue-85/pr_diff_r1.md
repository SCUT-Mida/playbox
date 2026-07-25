diff --git a/.ai-tasks/issue-85/ai-coder-prompt.md b/.ai-tasks/issue-85/ai-coder-prompt.md
new file mode 100644
index 0000000..9d3a2fe
--- /dev/null
+++ b/.ai-tasks/issue-85/ai-coder-prompt.md
@@ -0,0 +1,8 @@
+你是一个资深开发者。请解决以下 GitHub Issue：
+【任务标题】: 雄图三国优化
+【详细需求】: 请直接阅读当前目录下的 .ai-tasks/issue-85/context.md 文件获取。
+
+【⚠️ 严格红线规则】：
+请绝对不要修改、重命名或生成 .github/ 目录下的任何文件 (特别是 workflows 等 CI/CD 配置)，这会破坏项目的自动化流程！如果觉得有必要修改，请在回复中用文字建议人类去改，绝不要自己动手改。
+
+请直接分析并修改项目中的代码文件来解决这个问题，不要做过多的文字解释。
diff --git a/.ai-tasks/issue-85/context.md b/.ai-tasks/issue-85/context.md
new file mode 100644
index 0000000..a93c592
--- /dev/null
+++ b/.ai-tasks/issue-85/context.md
@@ -0,0 +1,5 @@
+- 增加资源对换机制，类似商店
+- 增加跟相邻城池贸易机制
+- 在野武将除了名将，其他随机的没吗？一直探索不到
+- 增加城池等级机制（基础依赖是资源等级+金钱才能升级），升级后资源等级可以继续升级，比如每5级升一次，资源等级上限当前太低了
+- 科技等级上限也一样，类似上面随城池等级解锁上限
diff --git a/apps/xiong-tu-san-guo/README.md b/apps/xiong-tu-san-guo/README.md
index fc6c8b2..228cdce 100644
--- a/apps/xiong-tu-san-guo/README.md
+++ b/apps/xiong-tu-san-guo/README.md
@@ -20,10 +20,12 @@ npm run test:dom   # jsdom 驱动的 DOM 冒烟测试（21+ 断言）
 
 - **立君择都**：开局自定义君主姓名（2~4 汉字），随机生成五项属性（统 / 武 / 智 / 政 / 魅，可重掷 5 次），再在**九州地图**上点选起兵之城（👑 为诸侯旧都），下方即时展示该城资源、特性与在野名将风闻。占据诸侯旧都时，其旧部将就地转为在野名将，可择机登用。
 - **九州地图**：古风地图以河流（黄河 / 长江）、州郡名、城市节点呈现，18 座核心城市按固定路径相邻相连，军队出征只能沿路径推进。城市以**城堡图标**（城体 + 雉堞）呈现而非千篇一律的圆圈，并**按规模分大 / 中 / 小三等**区分图标大小；据点显示驻军规模，金边为己方、灰色为空城、他色为诸侯。
-- **内政经营**：每座城市可发展**农田 / 市集 / 城墙**（各 1~5 级）、征兵、操练。金钱与军粮为势力级共享池，每回合依市集、人口、农田等级结算；军粮不济则士兵逃亡。
+- **内政经营**：每座城市可发展**农田 / 市集 / 城墙**、征兵、操练。金钱与军粮为势力级共享池，每回合依市集、人口、农田等级结算；军粮不济则士兵逃亡。
+- **城池等级**：每座城市有 **1~5 级城池等级**。三项资源（农田 / 市集 / 城墙）均升满当前等级上限后，可花金钱**升级城池**——每升一级，三项资源上限 **+5**（5 → 10 → 15 → 20 → 25），告别「资源早早封顶」；城池升级还小幅提升本城收入与城防。
+- **商贸系统**：城内可**资源对换**（金 ↔ 粮，市集等级与商贸科技越高汇率越优，卖出略折价防套利）；并可向**相邻的非己方城市通商**——中立城市稳赚，他国城市有被劫掠风险，收益随市集等级与目标城规模增长。
 - **城市职官**：每城可设**太守 / 将军 / 军师**各一（免费任命，离城自动卸任）。太守政治加成人口增长与农商业收入；将军统率加成城防与操练效率；军师智力加成探索发现与计略成功率——让高属性武将真正惠及城市。
-- **名将系统**：内置 47 位历史名将（关羽、张飞、诸葛亮、赵云、周瑜、吕布、曹操……），各有五维面板、专属技能（如「威震华夏」「神算」）与忠诚度。此外，每座城开局还散布若干**能力随机的乡野豪杰 / 隐士**（与名将同列在野池，偶有携带弱技能的奇才），弥补「在野只有名将」的单调。用**探索**发现本城在野人物（仍有未发现者必有所获，不至徒劳；已无可寻则不耗指令），**登用**说服加入（成功率受魅力、忠诚、军师智力影响）；战时可俘虏敌将，关押后**招降 / 释放 / 处决**。
-- **科技树**：6 项科技（农艺 / 商贸 / 冶炼 / 筑城 / 谋略 / 统御）各 3 级，研究消耗金钱与回合（君主智力可缩短），完成后势力全城共享加成。
+- **名将系统**：内置 47 位历史名将（关羽、张飞、诸葛亮、赵云、周瑜、吕布、曹操……），各有五维面板、专属技能（如「威震华夏」「神算」）与忠诚度。此外，每座城开局还散布**多名能力随机的乡野豪杰 / 隐士**（与名将同列在野池，偶有携带弱技能的奇才），且每回合还会有新的在野人物流动出现，**几乎每次探索都「有人可寻」**，弥补「在野只有名将、探索落空」的单调。用**探索**发现本城在野人物（仍有未发现者必有所获，不至徒劳；已无可寻则不耗指令），**登用**说服加入（成功率受魅力、忠诚、军师智力影响）；战时可俘虏敌将，关押后**招降 / 释放 / 处决**。
+- **科技树**：6 项科技（农艺 / 商贸 / 冶炼 / 筑城 / 谋略 / 统御），研究消耗金钱与回合（君主智力可缩短），完成后势力全城共享加成。**科技等级上限随势力最高城池等级解锁**（基础 3 级，城池每升一级 +1，最高 7 级）——升级城池方能突破科技天花板。
 - **回合制征战**：出征按路程消耗军粮，进入简化自动战斗——双方依「武力·统率·兵力·科技·训练度·阵型」结算攻防，城防优先承受伤害；武力悬殊时可能触发**单挑**一击定胜负。武将众多时可任命**主帅 + 最多 2 名副将**一同出征：副将按其武力 / 统率折算攻击加成，并可于单挑时替主帅出阵（败者被俘）；胜则占城、俘将、缴获城库，副将随主帅入驻新城。
 - **指令点数**：每回合获得若干指令点（基础 5 点 + 每多一城 +2 点 + 君主政治加成，顶栏显示「令 剩余/总数」），内政、人事、军事、外交计略各耗点执行，每个指令按钮均标注其消耗（令1 / 免费）；可对相邻敌城施**火攻 / 烧粮 / 流言**等计略。
 - **AI 诸侯**：开局随机分布 8 路诸侯，按「内政→招募→研究→侵略→输送→赏赐」优先级消耗指令点，各自施政出兵。
@@ -31,7 +33,7 @@ npm run test:dom   # jsdom 驱动的 DOM 冒烟测试（21+ 断言）
 
 ## 数据结构
 
-全局状态序列化为 JSON 存于 `localStorage`（键 `xtsg_save_v1`）：势力、城市（人口 / 兵力 / 城防 / 建筑等级 / 邻接）、名将（属性 / 技能 / 忠诚 / 状态）、科技等级、当前研究、回合与事件日志。
+全局状态序列化为 JSON 存于 `localStorage`（键 `xtsg_save_v1`）：势力、城市（人口 / 兵力 / 城防 / 城池等级 / 建筑等级 / 邻接）、名将（属性 / 技能 / 忠诚 / 状态）、科技等级、当前研究、回合与事件日志。旧存档读取时自动迁移（补齐城池等级等新字段）。
 
 ## 目录结构
 
diff --git a/apps/xiong-tu-san-guo/scripts/logic-test.mjs b/apps/xiong-tu-san-guo/scripts/logic-test.mjs
index 3fc107c..1b06c66 100644
--- a/apps/xiong-tu-san-guo/scripts/logic-test.mjs
+++ b/apps/xiong-tu-san-guo/scripts/logic-test.mjs
@@ -2,9 +2,13 @@
 import { CITIES, CITY_MAP, adjacencyValid, cityTier } from '../src/data/cities.js';
 import { HEROES, FACTION_SEEDS, makeGenericGeneral, makeWildGeneral } from '../src/data/heroes.js';
 import { makeRng } from '../src/core/rng.js';
-import { parseSkill, techMult } from '../src/core/tech.js';
-import { cityGoldIncome, cityGrainIncome, factionGoldIncome, factionGrainNet, cityDefenseValue, governorEconMult, generalDefMult } from '../src/core/economy.js';
+import { parseSkill, techMult, techMaxLevel, maxCityLevelOfFaction } from '../src/core/tech.js';
+import { cityGoldIncome, cityGrainIncome, factionGoldIncome, factionGrainNet, cityDefenseValue, governorEconMult, generalDefMult, cityLevelMult } from '../src/core/economy.js';
 import { createBattle, runBattle, effWar, attackValue } from '../src/core/combat.js';
+import {
+  buildCapForCity, cityUpgradeGoldCost, CITY_MAX_LEVEL, BUILD_CAP_STEP,
+  exchangeRate, tradeGoldYield, TRADE_GRAIN_COST,
+} from '../src/config.js';
 import {
   newGame, cityById, heroesOfFaction, cmdPoints, cmdRemaining,
   troopCap, resolveTurn, checkGameOver, neighbors, wildHeroesInCity,
@@ -325,6 +329,108 @@ if (campD.won) {
   ok(depB.cityId === 'wan' || depB.status === 'prisoner', '副将 B 胜利后入驻新城或被俘');
 }
 
+console.log('—— 城池等级 / 资源上限 ——');
+const sc = newGame({ lordName: '城建', startCity: 'luoyang', stats, rng: makeRng(61) });
+const lyC = cityById(sc, 'luoyang');
+eq(lyC.level, 1, '新城城池等级 = 1');
+eq(buildCapForCity(lyC), 5, '城池等级 1 时资源上限 = 5');
+// 城池未满级时，农田升满 5 级后应被上限挡住
+for (let i = 0; i < 10; i++) A.developFarm(sc, 'luoyang', 0);
+eq(lyC.farmLevel, 5, '城池等级 1 时农田最高只能升到 5');
+eq(A.developFarm(sc, 'luoyang', 0).ok, false, '农田触顶后不可继续升级');
+// 未满三项资源时不能升城
+lyC.farmLevel = 5; lyC.marketLevel = 5; lyC.wallLevel = 4;
+eq(A.upgradeCity(sc, 'luoyang', 0).ok, false, '城墙未满级时不可升级城池');
+// 满三项资源后升级城池 → 资源上限 +5
+lyC.wallLevel = 5;
+sc.factions[0].money = 99999;
+const upR = A.upgradeCity(sc, 'luoyang', 0);
+ok(upR.ok, '三项满级 + 金钱充足时升级城池成功');
+eq(lyC.level, 2, '城池等级升至 2');
+eq(buildCapForCity(lyC), 10, '城池等级 2 时资源上限 = 10');
+ok(cityUpgradeGoldCost(1) > 0, '城池升级金钱花费为正');
+// 资源上限解锁后可继续升级农田
+eq(A.developFarm(sc, 'luoyang', 0).ok, true, '城池升级后农田可突破 5 级');
+eq(lyC.farmLevel, 6, '农田成功升至 6 级');
+
+console.log('—— 科技上限随城池等级解锁 ——');
+eq(techMaxLevel(sc, 0), 4, '势力最高城池等级 2 → 科技上限 = 4');
+lyC.level = 5;
+eq(maxCityLevelOfFaction(sc, 0), 5, '势力最高城池等级 = 5');
+eq(techMaxLevel(sc, 0), 3 + (5 - 1) * 1, '势力最高城池等级 5 → 科技上限 = 7');
+// 城池等级 1（无升级）时科技上限为基础 3
+eq(techMaxLevel(newGame({ lordName: '基线', startCity: 'luoyang', stats, rng: makeRng(62) }), 0), 3, '无城池升级时科技上限 = 3');
+
+console.log('—— 城池等级收入 / 城防加成 ——');
+const sEco = newGame({ lordName: '经济', startCity: 'luoyang', stats, rng: makeRng(63) });
+const lyE = cityById(sEco, 'luoyang');
+const goldL1 = cityGoldIncome(sEco, lyE);
+lyE.level = 3;
+const goldL3 = cityGoldIncome(sEco, lyE);
+ok(goldL3 > goldL1, `城池升级提升金钱收入 (${goldL1.toFixed(0)} → ${goldL3.toFixed(0)})`);
+ok(cityLevelMult({ level: 1 }) === 1 && cityLevelMult({ level: 3 }) > 1, 'cityLevelMult 等级越高乘数越大');
+
+console.log('—— 资源对换（金↔粮）——');
+const sx = newGame({ lordName: '商铺', startCity: 'luoyang', stats, rng: makeRng(64) });
+const fac0 = sx.factions[0];
+fac0.money = 2000; fac0.grain = 0;
+const rate0 = exchangeRate(sx, cityById(sx, 'luoyang'));
+ok(rate0 >= 2, `基础兑换汇率 >= 2 (实际 ${rate0.toFixed(2)})`);
+// 买入：金→粮
+const buyR = A.exchange(sx, 'luoyang', 'buy', 500, 0);
+ok(buyR.ok && fac0.grain > 0, '买入粮食成功获得军粮');
+ok(fac0.money === 1500, '买入扣除金钱');
+// 卖出：粮→金（七折，不可套利）
+fac0.grain = 2000;
+const sellR = A.exchange(sx, 'luoyang', 'sell', 1000, 0);
+ok(sellR.ok && fac0.money > 1500, '卖出粮食获得金钱');
+// 套利检查：买入再卖出应亏损
+fac0.money = 10000; fac0.grain = 0;
+const before = fac0.money;
+A.exchange(sx, 'luoyang', 'buy', 1000, 0);
+A.exchange(sx, 'luoyang', 'sell', fac0.grain, 0);
+ok(fac0.money < before, '买入再卖出整体亏损（无套利）');
+// 金钱不足 / 粮食不足校验
+eq(A.exchange(sx, 'luoyang', 'buy', 999999, 0).ok, false, '金钱不足买入失败');
+
+console.log('—— 相邻城池贸易 ——');
+const st = newGame({ lordName: '商队', startCity: 'luoyang', stats, rng: makeRng(65) });
+const facT = st.factions[0];
+facT.grain = 99999;
+// 洛阳邻接宛城（初始中立）
+eq(cityById(st, 'wan').ownerFactionId, null, '宛城为中立，可通商');
+const goldBefore = facT.money;
+const trR = A.trade(st, 'luoyang', 'wan', 0, makeRng(1));
+ok(trR.ok && trR.success && facT.money > goldBefore, '与中立城市贸易获利');
+ok(facT.grain < 99999, '贸易消耗军粮');
+// 不可与己方城市通商
+cityById(st, 'wan').ownerFactionId = 0;
+eq(A.trade(st, 'luoyang', 'wan', 0, makeRng(1)).ok, false, '不可与己方城市通商');
+// 不相邻不可通商
+eq(A.trade(st, 'luoyang', 'kuaiji', 0, makeRng(1)).ok, false, '不相邻城市不可通商');
+// 与他国通商：劫掠分支（rng 返回小值 < 0.35）与成功分支（rng 返回大值）
+cityById(st, 'wan').ownerFactionId = 1;
+st.cmdUsedByFaction = {}; facT.grain = 99999; facT.money = 1000;
+const seizedR = A.trade(st, 'luoyang', 'wan', 0, () => 0.1);
+ok(seizedR.ok && seizedR.success === false, '他国通商可被劫掠（success=false）');
+st.cmdUsedByFaction = {}; facT.grain = 99999; facT.money = 1000;
+const profitR = A.trade(st, 'luoyang', 'wan', 0, () => 0.9);
+ok(profitR.ok && profitR.success === true && profitR.gold > 0, '他国通商成功获利（success=true）');
+
+console.log('—— 在野武将回合补充 ——');
+const sw2 = newGame({ lordName: '人才', startCity: 'luoyang', stats, rng: makeRng(71) });
+// 初始每城散布的随机在野人物数量翻倍（>= 2）
+const genericWilds2 = sw2.heroes.filter((h) => h.generic && h.wild);
+ok(genericWilds2.length >= 36, `开局随机在野人物翻倍 (实际 ${genericWilds2.length})`);
+// 多回合结算后，应出现动态补充的在野人物（id 前缀 genwild_dyn_）
+let dynSeen = false;
+for (let seed = 1; seed <= 200 && !dynSeen; seed++) {
+  const s5 = newGame({ lordName: '流动', startCity: 'luoyang', stats, rng: makeRng(80 + seed) });
+  resolveTurn(s5, { aiTurnAll }, makeRng(seed * 13));
+  if (s5.heroes.some((h) => h.wild && typeof h.id === 'string' && h.id.startsWith('genwild_dyn_'))) dynSeen = true;
+}
+ok(dynSeen, '回合结算会动态补充新的在野人物');
+
 console.log(`\n结果：${pass} 通过，${fail} 失败`);
 process.exit(fail ? 1 : 0);
 
diff --git a/apps/xiong-tu-san-guo/scripts/smoke-dom.mjs b/apps/xiong-tu-san-guo/scripts/smoke-dom.mjs
index e12bb3d..25c2f00 100644
--- a/apps/xiong-tu-san-guo/scripts/smoke-dom.mjs
+++ b/apps/xiong-tu-san-guo/scripts/smoke-dom.mjs
@@ -89,6 +89,18 @@ ok(!!farmBtn, '城务含「开发农田」指令');
 farmBtn.click();
 await sleep(5);
 
+// ---------- 4b) 商贸 · 城建面板（升级城池 / 资源对换 / 通商贸易）----------
+ok(document.querySelector('.commerce-block') !== null, '城务含「商贸·城建」面板');
+ok(Array.from(document.querySelectorAll('.cmd-btn')).some((b) => b.textContent.includes('升级城池')), '商贸面板含「升级城池」入口');
+ok(Array.from(document.querySelectorAll('.cmd-btn')).some((b) => b.textContent.includes('资源对换')), '商贸面板含「资源对换」入口');
+// 打开资源对换表单，验证不崩溃
+const exchangeBtn = Array.from(document.querySelectorAll('.cmd-btn')).find((b) => b.textContent.includes('资源对换'));
+exchangeBtn.click();
+await sleep(5);
+ok(document.querySelector('.modal__body select') !== null, '资源对换弹窗含方向选择');
+document.querySelector('.modal__foot button').click(); // 取消
+await sleep(3);
+
 // ---------- 5) 结束回合 ----------
 ui.tab = 'system'; ui.renderContent(); await sleep(3);
 // 直接驱动结算（跳过确认弹窗）
diff --git a/apps/xiong-tu-san-guo/src/config.js b/apps/xiong-tu-san-guo/src/config.js
index ad81d39..4009698 100644
--- a/apps/xiong-tu-san-guo/src/config.js
+++ b/apps/xiong-tu-san-guo/src/config.js
@@ -6,7 +6,24 @@
 export const SAVE_KEY = 'xtsg_save_v1';
 export const GAME_VERSION = 1;
 
-export const BUILD_MAX = 5; // 城市建筑等级上限（农田 / 市集 / 城墙）
+// —— 城池等级 / 资源（建筑）等级上限 ——
+// 资源（农田 / 市集 / 城墙）等级上限随城池等级解锁：城池每升一级，三项资源上限 +5。
+// 城池等级 1→5 时，资源上限依次为 5/10/15/20/25，告别「资源等级太低、早早封顶」的单调。
+export const BUILD_MAX = 5; // 资源等级基础上限（城池等级 1 时的上限；亦即旧版的固定上限）
+export const BUILD_CAP_STEP = 5; // 城池每升一级，资源等级上限提升的步长
+export const CITY_MAX_LEVEL = 5; // 城池等级上限
+
+// 取某城当前资源（农田/市集/城墙）等级上限：基础 BUILD_MAX，每级城池 +BUILD_CAP_STEP。
+export function buildCapForCity(city) {
+  const lvl = city && city.level ? Math.max(1, Math.min(CITY_MAX_LEVEL, city.level)) : 1;
+  return BUILD_MAX + (lvl - 1) * BUILD_CAP_STEP;
+}
+
+// 升级城池所需金钱（从当前 level 升至下一级）
+export function cityUpgradeGoldCost(level) {
+  return 1500 + level * 1500;
+}
+
 export const TRAINING_BASE = 50; // 士兵默认训练度
 export const TRAINING_MAX = 100;
 
@@ -37,9 +54,51 @@ export const CMD_COST = {
   recruitHero: 1, reward: 1, recruitPrisoner: 1,
   appointOffice: 0, moveHero: 0,
   campaign: 1, transport: 1, stratagem: 1, research: 1,
+  upgradeCity: 1, exchange: 1, trade: 1,
 };
 export const cmdCostOf = (key) => (CMD_COST[key] != null ? CMD_COST[key] : 1);
 
+// —— 资源对换（商铺）：金 ↔ 粮 ——
+// 兑换汇率随本城市集等级与商贸科技提升；卖出比买入略亏（30% 手续费），杜绝无脑套利。
+export const EXCHANGE_RATE_BASE = 2; // 基础汇率：1 金 → 2 粮（买入粮食时）
+export const EXCHANGE_FEE = 0.7; // 卖出折价：卖出所得 = 市价 × 0.7
+// 本城兑换汇率（每金可换粮数）：市集等级 / 商贸科技越高越划算。
+export function exchangeRate(state, city) {
+  if (!city) return EXCHANGE_RATE_BASE;
+  const marketMult = 1 + Math.max(0, (city.marketLevel || 1) - 1) * 0.1;
+  const techMultVal = state && city.ownerFactionId != null
+    ? techMultOfCommerce(state, city.ownerFactionId) : 1;
+  return EXCHANGE_RATE_BASE * marketMult * techMultVal;
+}
+
+// —— 相邻城池贸易 ——
+// 向相邻非己方城市（中立 / 他国）派出商队，按本城市集等级与目标城规模结算金钱收益；
+// 目标为他国城市时，商队有一定概率被劫掠（人财两空），中立城市则稳赚。
+export const TRADE_GRAIN_COST = 200; // 每次贸易消耗军粮（商队辎重）
+export const TRADE_SEIZED_CHANCE = 0.35; // 与他国贸易被劫掠的概率
+export function tradeGoldYield(state, fromCity, toCity) {
+  const tier = toCity && toCity.popMax ? cityTierRaw(toCity) : 2;
+  const base = 80 + (fromCity.marketLevel || 1) * 50 + tier * 100;
+  const techMultVal = state && fromCity.ownerFactionId != null
+    ? techMultOfCommerce(state, fromCity.ownerFactionId) : 1;
+  return Math.round(base * techMultVal);
+}
+
+// 城池规模数值（1/2/3）——供贸易结算用，避免与 data/cities 的 cityTier 循环引用。
+function cityTierRaw(city) {
+  const p = city.popMax || city.maxPopulation || 0;
+  if (p >= 85000) return 3;
+  if (p >= 72000) return 2;
+  return 1;
+}
+
+// 商贸科技乘子（供 exchange / trade 复用），就地轻量实现，避免与 tech.js 循环依赖。
+function techMultOfCommerce(state, fid) {
+  const tbl = state && state.techLevelsByFaction && state.techLevelsByFaction[fid];
+  const lv = (tbl && tbl.commerce) || 0;
+  return 1 + lv * 0.05;
+}
+
 // —— 经济（每回合结算）——
 export const GOLD_PER_MARKET = 100; // 市集等级 × 100
 export const GOLD_PER_POP = 0.5; // 人口 × 0.5
@@ -58,7 +117,10 @@ export function buildCost(level) {
 }
 
 // —— 科技 ——
-export const TECH_MAX_LEVEL = 3;
+// 科技等级上限随城池等级解锁：势力最高城池每升一级，科技上限 +TECH_CAP_STEP。
+// 城池等级 1→5 时，科技上限依次为 3/4/5/6/7（详见 tech.js 的 techMaxLevel）。
+export const TECH_MAX_LEVEL = 3; // 科技基础上限（城池等级 1 时；亦即旧版的固定上限）
+export const TECH_CAP_STEP = 1; // 势力最高城池每升一级，科技等级上限提升的步长
 export const TECHS = {
   agri: { name: '农艺', desc: '粮食产量 +10% / 级', icon: '🌾' },
   commerce: { name: '商贸', desc: '金钱收入 +10% / 级', icon: '💰' },
diff --git a/apps/xiong-tu-san-guo/src/core/actions.js b/apps/xiong-tu-san-guo/src/core/actions.js
index dc5c702..6cc0374 100644
--- a/apps/xiong-tu-san-guo/src/core/actions.js
+++ b/apps/xiong-tu-san-guo/src/core/actions.js
@@ -8,12 +8,15 @@ import {
   checkGameOver, clearHeroOffices, officeHolder,
 } from './state.js';
 import { citiesOf, recruitCost } from './economy.js';
-import { skillBonus, techMult, techLevel, TECH_KEYS } from './tech.js';
+import { skillBonus, techMult, techLevel, techMaxLevel, TECH_KEYS } from './tech.js';
 import { createBattle, runBattle, effLead, effWar } from './combat.js';
 import { chance, shuffle } from './rng.js';
 import {
-  BUILD_MAX, buildCost, TRAINING_MAX, FORMATIONS, STRATAGEMS,
-  TECH_MAX_LEVEL, TECH_COST_GOLD, TECH_COST_TURNS, RECRUIT_LOYALTY_THRESHOLD,
+  buildCapForCity, buildCost, TRAINING_MAX, FORMATIONS, STRATAGEMS,
+  TECH_COST_GOLD, TECH_COST_TURNS, RECRUIT_LOYALTY_THRESHOLD,
+  CITY_MAX_LEVEL, cityUpgradeGoldCost,
+  EXCHANGE_FEE, exchangeRate,
+  TRADE_GRAIN_COST, TRADE_SEIZED_CHANCE, tradeGoldYield,
   CITY_OFFICES, OFFICE_MAP, officeField,
 } from '../config.js';
 
@@ -35,7 +38,8 @@ const isPlayer = (state, fid) => fid === state.playerFactionId;
 export function developFarm(state, cityId, fid = PLAYER(state)) {
   const c = cityById(state, cityId);
   if (!c || c.ownerFactionId !== fid) return { ok: false, msg: '该城非你所属' };
-  if (c.farmLevel >= BUILD_MAX) return { ok: false, msg: '农田已达满级' };
+  const cap = buildCapForCity(c);
+  if (c.farmLevel >= cap) return { ok: false, msg: `农田已达本城上限（Lv${cap}，升级城池可提升）` };
   if (!spendCmd(state, fid)) return { ok: false, msg: '指令点不足' };
   const cost = buildCost(c.farmLevel);
   if (facMoney(state, fid) < cost) { refundCmd(state, fid); return { ok: false, msg: '金钱不足' }; }
@@ -48,7 +52,8 @@ export function developFarm(state, cityId, fid = PLAYER(state)) {
 export function developMarket(state, cityId, fid = PLAYER(state)) {
   const c = cityById(state, cityId);
   if (!c || c.ownerFactionId !== fid) return { ok: false, msg: '该城非你所属' };
-  if (c.marketLevel >= BUILD_MAX) return { ok: false, msg: '市集已达满级' };
+  const cap = buildCapForCity(c);
+  if (c.marketLevel >= cap) return { ok: false, msg: `市集已达本城上限（Lv${cap}，升级城池可提升）` };
   if (!spendCmd(state, fid)) return { ok: false, msg: '指令点不足' };
   const cost = buildCost(c.marketLevel);
   if (facMoney(state, fid) < cost) { refundCmd(state, fid); return { ok: false, msg: '金钱不足' }; }
@@ -61,7 +66,8 @@ export function developMarket(state, cityId, fid = PLAYER(state)) {
 export function buildWall(state, cityId, fid = PLAYER(state)) {
   const c = cityById(state, cityId);
   if (!c || c.ownerFactionId !== fid) return { ok: false, msg: '该城非你所属' };
-  if (c.wallLevel >= BUILD_MAX) return { ok: false, msg: '城墙已达满级' };
+  const cap = buildCapForCity(c);
+  if (c.wallLevel >= cap) return { ok: false, msg: `城墙已达本城上限（Lv${cap}，升级城池可提升）` };
   if (!spendCmd(state, fid)) return { ok: false, msg: '指令点不足' };
   const cost = buildCost(c.wallLevel);
   if (facMoney(state, fid) < cost) { refundCmd(state, fid); return { ok: false, msg: '金钱不足' }; }
@@ -71,6 +77,81 @@ export function buildWall(state, cityId, fid = PLAYER(state)) {
   return { ok: true, msg: `${c.name} 城墙升至 ${c.wallLevel} 级，城防加固` };
 }
 
+// —— 内政：升级城池 ——
+// 前置：三项资源（农田 / 市集 / 城墙）均须达到当前资源上限（满级开发后方可升城），
+// 并支付 cityUpgradeGoldCost 金钱。升级后城池等级 +1，三项资源上限随之 +5，
+// 势力最高城池升级还会抬高科技等级上限。城池等级同时小幅提升本城收入与城防（见 economy.js）。
+export function upgradeCity(state, cityId, fid = PLAYER(state)) {
+  const c = cityById(state, cityId);
+  if (!c || c.ownerFactionId !== fid) return { ok: false, msg: '该城非你所属' };
+  c.level = c.level || 1;
+  if (c.level >= CITY_MAX_LEVEL) return { ok: false, msg: `${c.name} 已达最高城池等级` };
+  const cap = buildCapForCity(c);
+  if (c.farmLevel < cap || c.marketLevel < cap || c.wallLevel < cap) {
+    return { ok: false, msg: `须先将军田/市集/城墙均升至 Lv${cap} 方可升级城池` };
+  }
+  if (!spendCmd(state, fid)) return { ok: false, msg: '指令点不足' };
+  const cost = cityUpgradeGoldCost(c.level);
+  if (facMoney(state, fid) < cost) { refundCmd(state, fid); return { ok: false, msg: '金钱不足' }; }
+  factionById(state, fid).money -= cost;
+  c.level += 1;
+  c.defense = maxDefense(state, c); // 城池等级抬升城防上限，即时回满
+  const newCap = buildCapForCity(c);
+  return { ok: true, msg: `${c.name} 城池升至 ${c.level} 级！资源上限解锁至 Lv${newCap}（-${cost} 金）` };
+}
+
+// —— 商业：资源对换（金 ↔ 粮）——
+// kind='buy'：以金换粮；kind='sell'：以粮换金。每次消耗 1 指令。
+// 汇率随本城市集等级与商贸科技提升；卖出按 EXCHANGE_FEE 折价，杜绝无脑套利。
+export function exchange(state, cityId, kind, amount, fid = PLAYER(state)) {
+  const c = cityById(state, cityId);
+  if (!c || c.ownerFactionId !== fid) return { ok: false, msg: '该城非你所属' };
+  if (kind !== 'buy' && kind !== 'sell') return { ok: false, msg: '未知兑换方向' };
+  amount = Math.max(0, Math.floor(amount));
+  if (amount <= 0) return { ok: false, msg: '兑换数量无效' };
+  if (!spendCmd(state, fid)) return { ok: false, msg: '指令点不足' };
+  const fac = factionById(state, fid);
+  const rate = exchangeRate(state, c); // 每金可换粮数
+  if (kind === 'buy') {
+    if (fac.money < amount) { refundCmd(state, fid); return { ok: false, msg: '金钱不足' }; }
+    fac.money -= amount;
+    const grain = Math.floor(amount * rate);
+    fac.grain += grain;
+    return { ok: true, msg: `${c.name} 市集以 ${amount} 金换得 ${grain} 粮（汇率 1金≈${rate.toFixed(2)}粮）` };
+  }
+  // sell：以粮换金，按 EXCHANGE_FEE 折价
+  if (fac.grain < amount) { refundCmd(state, fid); return { ok: false, msg: '军粮不足' }; }
+  fac.grain -= amount;
+  const gold = Math.floor((amount / rate) * EXCHANGE_FEE);
+  fac.money += gold;
+  return { ok: true, msg: `${c.name} 市集以 ${amount} 粮换得 ${gold} 金（折价 ${Math.round(EXCHANGE_FEE * 100)}%）` };
+}
+
+// —— 商业：相邻城池贸易 ——
+// 从己方城市派商队前往相邻的非己方城市（中立 / 他国），换取金钱。
+// 消耗 1 指令 + TRADE_GRAIN_COST 军粮（商队辎重）。目标为他国城市时有 TRADE_SEIZED_CHANCE
+// 概率被劫掠（血本无归）；中立城市稳赚。收益随本城市集等级、目标城规模与商贸科技提升。
+export function trade(state, fromCityId, toCityId, fid = PLAYER(state), rng) {
+  const r = rng || Math.random;
+  const from = cityById(state, fromCityId);
+  const to = cityById(state, toCityId);
+  if (!from || !to) return { ok: false, msg: '城市无效' };
+  if (from.ownerFactionId !== fid) return { ok: false, msg: '出发城非你所属' };
+  if (to.ownerFactionId === fid) return { ok: false, msg: '无需与己方城市通商（金粮本就共享）' };
+  if (!from.adjacent.includes(toCityId)) return { ok: false, msg: '两城不相邻，无法通商' };
+  if (!spendCmd(state, fid)) return { ok: false, msg: '指令点不足' };
+  const fac = factionById(state, fid);
+  if (fac.grain < TRADE_GRAIN_COST) { refundCmd(state, fid); return { ok: false, msg: '军粮不足以筹备商队' }; }
+  fac.grain -= TRADE_GRAIN_COST;
+  // 与他国通商：有被劫掠风险
+  if (to.ownerFactionId != null && chance(r, TRADE_SEIZED_CHANCE)) {
+    return { ok: true, msg: `🚫 商队赴 ${to.name} 途中遭劫，辎重尽失（-${TRADE_GRAIN_COST} 粮）`, success: false };
+  }
+  const gold = tradeGoldYield(state, from, to);
+  fac.money += gold;
+  return { ok: true, msg: `🧧 商队自 ${from.name} 抵 ${to.name} 通商，获利 ${gold} 金（-${TRADE_GRAIN_COST} 粮）`, success: true, gold };
+}
+
 // —— 内政：征兵 ——
 export function recruit(state, cityId, count, fid = PLAYER(state)) {
   const c = cityById(state, cityId);
@@ -209,7 +290,9 @@ export function research(state, techKey, fid = PLAYER(state)) {
   if (!TECH_KEYS.includes(techKey)) return { ok: false, msg: '未知科技' };
   state.researchByFaction = state.researchByFaction || {};
   if (state.researchByFaction[fid]) return { ok: false, msg: '本势力已有研究进行中' };
-  if (techLevel(state, fid, techKey) >= TECH_MAX_LEVEL) return { ok: false, msg: '该科技已满级' };
+  if (techLevel(state, fid, techKey) >= techMaxLevel(state, fid)) {
+    return { ok: false, msg: '该科技已达当前上限（升级城池可解锁更高上限）' };
+  }
   if (!spendCmd(state, fid)) return { ok: false, msg: '指令点不足' };
   if (facMoney(state, fid) < TECH_COST_GOLD) { refundCmd(state, fid); return { ok: false, msg: '金钱不足' }; }
   factionById(state, fid).money -= TECH_COST_GOLD;
diff --git a/apps/xiong-tu-san-guo/src/core/ai.js b/apps/xiong-tu-san-guo/src/core/ai.js
index e7fdbc3..a1ef244 100644
--- a/apps/xiong-tu-san-guo/src/core/ai.js
+++ b/apps/xiong-tu-san-guo/src/core/ai.js
@@ -11,7 +11,7 @@ import {
 import { citiesOf } from './economy.js';
 import { effLead } from './combat.js';
 import { chance } from './rng.js';
-import { TECH_COST_GOLD } from '../config.js';
+import { TECH_COST_GOLD, buildCapForCity, cityUpgradeGoldCost, CITY_MAX_LEVEL } from '../config.js';
 
 // 单个 AI 势力行动
 export function aiTurn(state, fid, rng) {
@@ -24,11 +24,12 @@ export function aiTurn(state, fid, rng) {
   while (cmdRemaining(state, fid) > 0 && guard++ < 30) {
     let acted = false;
 
-    // 1) 内政：国库充盈（金钱 > 600）才升市场——有钱才投资，优于设计文档初稿"金币低于 500 升市场"的被动策略；兵不足人口 20% 则征兵
+    // 1) 内政：国库充盈（金钱 > 600）才升市场——有钱才投资；市场达到当前城池上限后，若三项资源满级则升级城池以解锁更高上限；兵不足人口 20% 则征兵
     for (const c of cities) {
       if (cmdRemaining(state, fid) <= 0) break;
       const fac = state.factions.find((f) => f.id === fid);
-      if (fac.money > 600 && c.marketLevel < 5 && chance(r, 0.5)) {
+      const cap = buildCapForCity(c);
+      if (fac.money > 600 && c.marketLevel < cap && chance(r, 0.5)) {
         if (A.developMarket(state, c.id, fid).ok) { acted = true; break; }
       }
     }
@@ -39,6 +40,20 @@ export function aiTurn(state, fid, rng) {
         if (recruitN > 50 && A.recruit(state, c.id, recruitN, fid).ok) { acted = true; break; }
       }
     }
+    // 城池升级：富余金钱 + 三项资源已满当前上限 + 未到顶 → 升城（解锁更高上限 / 收益）
+    if (!acted) {
+      const fac = state.factions.find((f) => f.id === fid);
+      for (const c of cities) {
+        if (cmdRemaining(state, fid) <= 0) break;
+        c.level = c.level || 1;
+        if (c.level >= CITY_MAX_LEVEL) continue;
+        const cap = buildCapForCity(c);
+        const ready = c.farmLevel >= cap && c.marketLevel >= cap && c.wallLevel >= cap;
+        if (ready && fac.money >= cityUpgradeGoldCost(c.level) + 500 && chance(r, 0.6)) {
+          if (A.upgradeCity(state, c.id, fid).ok) { acted = true; break; }
+        }
+      }
+    }
 
     // 2) 招募在野名将（魅力 > 70 的武将空闲时探索 + 登用）
     if (!acted) {
diff --git a/apps/xiong-tu-san-guo/src/core/economy.js b/apps/xiong-tu-san-guo/src/core/economy.js
index eace8ad..b2202fe 100644
--- a/apps/xiong-tu-san-guo/src/core/economy.js
+++ b/apps/xiong-tu-san-guo/src/core/economy.js
@@ -21,6 +21,13 @@ function traitMult(city, type) {
   return city.trait && city.trait.type === type ? 1 + city.trait.value : 1;
 }
 
+// 城池等级加成：每升一级（自 1 起）使本城金钱 / 粮食收入 +5%、城防 +5%。
+// 让「升级城池」不仅是解锁上限，也带来即时收益，避免升城成为纯开销。
+export function cityLevelMult(city) {
+  const lvl = (city && city.level) || 1;
+  return 1 + Math.max(0, lvl - 1) * 0.05;
+}
+
 // 取本城某职官武将（须在城、非俘虏），用于结算职官加成。
 // 此处不 import state.js（避免与 state↔economy 循环依赖），就地查表。
 function officeHero(state, city, field) {
@@ -47,13 +54,13 @@ export function generalDefMult(state, city) {
 // 商业收入（每回合，单城）
 export function cityGoldIncome(state, city) {
   const base = city.marketLevel * GOLD_PER_MARKET + city.population * GOLD_PER_POP;
-  return base * traitMult(city, 'commerce') * techMult(state, city.ownerFactionId, 'commerce', 0.1) * governorEconMult(state, city);
+  return base * traitMult(city, 'commerce') * techMult(state, city.ownerFactionId, 'commerce', 0.1) * governorEconMult(state, city) * cityLevelMult(city);
 }
 
 // 粮食产量（每回合，单城）
 export function cityGrainIncome(state, city) {
   const base = city.farmLevel * GRAIN_PER_FARM;
-  return base * traitMult(city, 'grain') * techMult(state, city.ownerFactionId, 'agri', 0.1) * governorEconMult(state, city);
+  return base * traitMult(city, 'grain') * techMult(state, city.ownerFactionId, 'agri', 0.1) * governorEconMult(state, city) * cityLevelMult(city);
 }
 
 // 势力每回合金钱总收入（含特性 / 科技）
@@ -75,11 +82,11 @@ export function factionGrainNet(state, factionId) {
   return { prod, upkeep, net: prod - upkeep };
 }
 
-// 城防值（基础 × 城防特性 × 筑城科技 × 城墙等级加成 × 将军统率加成）
+// 城防值（基础 × 城防特性 × 筑城科技 × 城墙等级加成 × 将军统率加成 × 城池等级加成）
 export function cityDefenseValue(state, city) {
   const base = city.defenseBase || 0;
   const wallBoost = 1 + (city.wallLevel - 1) * 0.15;
-  return base * traitMult(city, 'defense') * techMult(state, city.ownerFactionId, 'wall', 0.2) * wallBoost * generalDefMult(state, city);
+  return base * traitMult(city, 'defense') * techMult(state, city.ownerFactionId, 'wall', 0.2) * wallBoost * generalDefMult(state, city) * cityLevelMult(city);
 }
 
 // 单城人口增长（依赖太守或君主政治）
diff --git a/apps/xiong-tu-san-guo/src/core/save.js b/apps/xiong-tu-san-guo/src/core/save.js
index bf8dc41..e525051 100644
--- a/apps/xiong-tu-san-guo/src/core/save.js
+++ b/apps/xiong-tu-san-guo/src/core/save.js
@@ -37,6 +37,8 @@ export function loadGame() {
 //   1) 旧版科技等级为全局 state.techLevels（所有势力共享），现改为按势力独立的
 //      state.techLevelsByFaction。旧存档中已研究的科技视作玩家势力掌握；AI 从 0 起算。
 //   2) 新增城市职官将军 / 军师（generalHeroId / strategistHeroId），旧存档城市缺省 → 补 null。
+//   3) 新增城池等级（c.level）：旧存档城市缺省 → 补 1（资源 / 科技上限按基础值）。
+//   4) 新增在野人物补充序列（state.wildSeq）：旧存档缺省 → 补 0。
 function migrateSave(state) {
   if (!state) return state;
   if (!state.techLevelsByFaction) {
@@ -45,10 +47,12 @@ function migrateSave(state) {
       : {};
     delete state.techLevels;
   }
+  if (state.wildSeq == null) state.wildSeq = 0;
   if (Array.isArray(state.cities)) {
     for (const c of state.cities) {
       if (c.generalHeroId === undefined) c.generalHeroId = null;
       if (c.strategistHeroId === undefined) c.strategistHeroId = null;
+      if (c.level == null) c.level = 1;
     }
   }
   return state;
diff --git a/apps/xiong-tu-san-guo/src/core/state.js b/apps/xiong-tu-san-guo/src/core/state.js
index 306f9be..524c6c5 100644
--- a/apps/xiong-tu-san-guo/src/core/state.js
+++ b/apps/xiong-tu-san-guo/src/core/state.js
@@ -8,16 +8,20 @@ import {
 import { HEROES, HERO_MAP, FACTION_SEEDS, makeGenericGeneral, makeWildGeneral } from '../data/heroes.js';
 import {
   GAME_VERSION, CMD_BASE, CMD_PER_CITY, TRAINING_BASE,
-  FACTION_COLORS, PLAYER_COLOR, GRAIN_UPKEEP_PER_SOLDIER, TECH_COST_TURNS, TECH_MAX_LEVEL,
+  FACTION_COLORS, PLAYER_COLOR, GRAIN_UPKEEP_PER_SOLDIER, TECH_COST_TURNS,
   CITY_OFFICES, officeField,
 } from '../config.js';
-import { skillBonus, techMult, ensureTechLevels } from './tech.js';
+import { skillBonus, techMult, ensureTechLevels, techMaxLevel } from './tech.js';
 import { chance } from './rng.js';
 import {
   citiesOf, cityGoldIncome, cityGrainIncome, cityPopGrowth, cityDefenseValue,
 } from './economy.js';
 import { effLead, effWar } from './combat.js';
 
+// 在野人物补充参数
+const WILD_REPLENISH_CHANCE = 0.45; // 每回合补充一名在野人物的概率
+const WILD_PER_CITY_CAP = 6; // 每座城在野人物上限（含名将），超过不再向该城补充
+
 // —— 查询辅助 ——
 export const cityById = (state, id) => state.cities.find((c) => c.id === id);
 export const heroById = (state, id) => state.heroes.find((h) => h.id === id);
@@ -108,6 +112,7 @@ export function newGame({ lordName, startCity, stats, rng } = {}) {
     techLevelsByFaction: {}, // { [fid]: { key: level } } —— 科技等级按势力独立存储
     researchByFaction: {}, // { [fid]: { key, turnsLeft } } —— 研究进度槽按势力独立
     cmdUsedByFaction: {},
+    wildSeq: 0, // 在野随机人物 id 序列（含回合补充生成时的去重计数）
     log: [],
     turnLog: [],
     over: null,
@@ -139,6 +144,7 @@ export function newGame({ lordName, startCity, stats, rng } = {}) {
       population: c.pop0, maxPopulation: c.popMax,
       soldiers: c.soldiers0, defenseBase: c.defense0, defense: c.defense0,
       gold: c.gold0, grain: c.grain0, // 城库（攻陷时被缴获）
+      level: 1, // 城池等级：升级后解锁更高的资源 / 科技等级上限
       farmLevel: 1, marketLevel: 1, wallLevel: 1,
       governorHeroId: null, generalHeroId: null, strategistHeroId: null,
       adjacent: c.adjacent.slice(),
@@ -235,11 +241,12 @@ export function newGame({ lordName, startCity, stats, rng } = {}) {
     }
   }
 
-  // —— 在野随机人物：每座城散布 1 名（约三成概率再多 1 名）能力随机的乡野豪杰 ——
-  // 与名将并列于在野池，可探索 / 登用，弥补「在野只有名将」的单调，提升可玩度。
+  // —— 在野随机人物：每座城散布 2 名（约六成概率再多 1 名）能力随机的乡野豪杰 ——
+  // 与名将并列于在野池，可探索 / 登用，弥补「在野只有名将、探索不到」的单调，提升可玩度。
+  // 数量较旧版翻倍，确保几乎每次探索都「有人可寻」。
   let wildIdx = 0;
   for (const c of state.cities) {
-    const n = 1 + (chance(r, 0.3) ? 1 : 0);
+    const n = 2 + (chance(r, 0.6) ? 1 : 0);
     for (let i = 0; i < n; i++) {
       const g = makeWildGeneral(r, ++wildIdx);
       g.id = `genwild_${c.id}_${i}`; // 城内唯一
@@ -251,6 +258,7 @@ export function newGame({ lordName, startCity, stats, rng } = {}) {
       state.heroes.push(g);
     }
   }
+  state.wildSeq = wildIdx;
 
   // 初始城防归位
   for (const c of state.cities) c.defense = maxDefense(state, c);
@@ -319,6 +327,7 @@ export function resolveTurn(state, aiModule, rng) {
   }
 
   // —— 科技推进（逐势力独立研究槽、独立等级，互不阻塞、互不共享）——
+  // 上限随该势力最高城池等级提升（见 techMaxLevel），城池升级后可继续突破科技天花板。
   state.researchByFaction = state.researchByFaction || {};
   for (const fac of state.factions) {
     const res = state.researchByFaction[fac.id];
@@ -327,7 +336,7 @@ export function resolveTurn(state, aiModule, rng) {
     if (res.turnsLeft <= 0) {
       // 仅对本势力加级；其他势力（含同时研究同项科技者）的等级不受影响
       const tbl = ensureTechLevels(state, fac.id);
-      tbl[res.key] = Math.min(TECH_MAX_LEVEL, (tbl[res.key] || 0) + 1);
+      tbl[res.key] = Math.min(techMaxLevel(state, fac.id), (tbl[res.key] || 0) + 1);
       if (fac.id === state.playerFactionId) {
         state.turnLog.push(`🔬 科技突破：研究完成（${res.key} 升至 ${tbl[res.key]} 级）。`);
       }
@@ -340,6 +349,30 @@ export function resolveTurn(state, aiModule, rng) {
     aiModule.aiTurnAll(state, r);
   }
 
+  // —— 在野人物补充（人才流动）——
+  // 每回合有一定概率在某座城池新出现一名在野豪杰，避免中后期「无人在野、探索落空」。
+  // 每城在野上限 WILD_PER_CITY_CAP，超过则不再补充到该城。
+  state.wildSeq = state.wildSeq || 0;
+  if (chance(r, WILD_REPLENISH_CHANCE)) {
+    const candidates = state.cities.filter((c) =>
+      state.heroes.filter((h) => h.wild && h.cityId === c.id && h.status !== 'gone').length < WILD_PER_CITY_CAP);
+    if (candidates.length) {
+      const home = candidates[Math.floor(r() * candidates.length)];
+      state.wildSeq += 1;
+      const g = makeWildGeneral(r, state.wildSeq);
+      g.id = `genwild_dyn_${state.wildSeq}`; // 动态补充：全局唯一
+      g.wild = true;
+      g.factionId = null;
+      g.cityId = home.id;
+      g.status = 'free';
+      g.discovered = false;
+      state.heroes.push(g);
+      if (home.ownerFactionId === state.playerFactionId) {
+        state.turnLog.push(`👂 ${home.name} 城外有新的在野人物风闻，可前往探访。`);
+      }
+    }
+  }
+
   // —— 名将忠诚度自然漂移（轻微）——
   for (const h of state.heroes) {
     if (h.status === 'prisoner' || h.wild) continue;
diff --git a/apps/xiong-tu-san-guo/src/core/tech.js b/apps/xiong-tu-san-guo/src/core/tech.js
index d431655..4fa5516 100644
--- a/apps/xiong-tu-san-guo/src/core/tech.js
+++ b/apps/xiong-tu-san-guo/src/core/tech.js
@@ -4,6 +4,7 @@
 //   cap:0.10 / train:0.20 / p_grow:0.10 / c_recruit:0.20
 // 科技等级按势力独立存储（state.techLevelsByFaction[fid][key]），互不共享、互不阻塞。
 // ============================================================================
+import { TECH_MAX_LEVEL, TECH_CAP_STEP } from '../config.js';
 
 const KEYS = ['lead', 'war', 'trick', 'def', 'cap', 'train', 'p_grow', 'c_recruit'];
 
@@ -56,6 +57,23 @@ export function techLevel(state, fid, techKey) {
   return (tbl && tbl[techKey]) || 0;
 }
 
+// 势力所辖城池中的最高城池等级（无城则 1）。用于推导科技 / 资源上限。
+export function maxCityLevelOfFaction(state, fid) {
+  if (!state || !Array.isArray(state.cities)) return 1;
+  let m = 1;
+  for (const c of state.cities) {
+    if (c.ownerFactionId === fid && (c.level || 1) > m) m = c.level;
+  }
+  return m;
+}
+
+// 科技等级上限：基础 TECH_MAX_LEVEL，随势力最高城池等级每升一级 +TECH_CAP_STEP。
+// 例：城池等级 1→5，科技上限 3/4/5/6/7。鼓励玩家升级城池以突破科技天花板。
+export function techMaxLevel(state, fid) {
+  const m = maxCityLevelOfFaction(state, fid);
+  return TECH_MAX_LEVEL + (Math.max(1, m) - 1) * TECH_CAP_STEP;
+}
+
 // 当前正在研究的科技（按势力独立槽）
 export function activeResearch(state, fid) {
   return state && state.researchByFaction ? (state.researchByFaction[fid] || null) : null;
diff --git a/apps/xiong-tu-san-guo/src/ui/app.js b/apps/xiong-tu-san-guo/src/ui/app.js
index 85a16a7..2dc988a 100644
--- a/apps/xiong-tu-san-guo/src/ui/app.js
+++ b/apps/xiong-tu-san-guo/src/ui/app.js
@@ -7,9 +7,11 @@ import './style.css';
 import { attachKeyboardShell } from '../../../_lib/keyboard-shell.js';
 import { h, clear, bar } from './dom.js';
 import {
-  TECHS, FORMATIONS, STRATAGEMS, BUILD_MAX, TECH_MAX_LEVEL, TECH_COST_GOLD,
+  TECHS, FORMATIONS, STRATAGEMS, TECH_COST_GOLD,
   TRAINING_MAX, FACTION_COLORS, NEUTRAL_COLOR, seasonOf, clamp,
   CITY_OFFICES, cmdCostOf,
+  buildCapForCity, cityUpgradeGoldCost, CITY_MAX_LEVEL, exchangeRate,
+  TRADE_GRAIN_COST, tradeGoldYield,
 } from '../config.js';
 import { CITIES, CITY_MAP, MAP_RIVERS, MAP_REGIONS, CAPITAL_IDS, cityTier, TIER_CLASS, TIER_NAME } from '../data/cities.js';
 import { HEROES, HERO_MAP, FACTION_SEEDS } from '../data/heroes.js';
@@ -18,7 +20,7 @@ import { newGame, resolveTurn, cityById, heroById, factionById, playerFaction,
   troopCap, cmdPoints, cmdRemaining, bestDefender, lordOf, maxDefense, officeHolder } from '../core/state.js';
 import { citiesOf, factionGoldIncome, factionGrainNet, governorEconMult, generalDefMult } from '../core/economy.js';
 import { effLead, effWar } from '../core/combat.js';
-import { techLevel } from '../core/tech.js';
+import { techLevel, techMaxLevel } from '../core/tech.js';
 import * as A from '../core/actions.js';
 import { aiTurnAll } from '../core/ai.js';
 import { hasSave, saveGame, loadGame, clearSave } from '../core/save.js';
@@ -429,16 +431,19 @@ export class GameUI {
     const gov = officeHolder(s, c, 'governor');
     const gen = officeHolder(s, c, 'general');
     const strat = officeHolder(s, c, 'strategist');
+    const cap = buildCapForCity(c);
+    const lvl = c.level || 1;
     const r = (k, v) => h('div', null, h('span', { class: 'muted' }, k), ' ', v);
     return h('div', { class: 'panel__rows' },
       r('归属', c.ownerFactionId != null ? (factionById(s, c.ownerFactionId)?.name || '—') : '空城'),
       r('规模', `${TIER_NAME[cityTier(c)]}（人口上限 ${c.maxPopulation.toLocaleString()}）`),
+      r('城池等级', `${lvl} / ${CITY_MAX_LEVEL}（资源上限 Lv${cap}）`),
       r('人口', `${Math.round(c.population)} / ${c.maxPopulation}`),
       r('士兵', Math.round(c.soldiers)),
       r('城防', `${Math.round(c.defense)}`),
-      r('农田', `Lv${c.farmLevel}`),
-      r('市集', `Lv${c.marketLevel}`),
-      r('城墙', `Lv${c.wallLevel}`),
+      r('农田', `Lv${c.farmLevel} / ${cap}`),
+      r('市集', `Lv${c.marketLevel} / ${cap}`),
+      r('城墙', `Lv${c.wallLevel} / ${cap}`),
       r('训练度', c.training),
       r('太守', gov ? `${gov.name}（政${gov.stats.p}）` : '—'),
       r('将军', gen ? `${gen.name}（统${gen.stats.l}）` : '—'),
@@ -472,14 +477,16 @@ export class GameUI {
   openOwnedCity(c) {
     const s = this.state;
     const fid = s.playerFactionId;
-    // refresh=true：动作在弹窗内就地完成后，重绘城务弹窗以刷新兵数/等级/职官/在野列表
+    // refresh=true：动作在弹窗内就地完成后，重绘城务弹窗以刷新兵数/等级/职官/在野列表。
+    // fn 若返回 { ok, msg }（如内政指令）则就地提示并按需刷新；
+    // fn 若自行打开表单（如资源对换 / 贸易）则返回 undefined，仅做后续统一刷新。
     const cmdBtn = (label, fn, { danger, refresh, cost } = {}) => h('button', {
       class: `cmd-btn ${danger ? 'btn-danger' : 'btn-primary'}`,
       onClick: () => {
         const r = fn();
-        if (r.msg) this.toast(r.msg);
+        if (r && r.msg) this.toast(r.msg);
         this.afterAction();
-        if (refresh && r.ok) this.openOwnedCity(c);
+        if (refresh && r && r.ok) this.openOwnedCity(c);
       },
     }, label, costTag(cost));
     // 探索的实际消耗：仍有未发现名将才耗 1 指令，否则免费（动态标注，避免误导）
@@ -497,6 +504,29 @@ export class GameUI {
       h('button', { class: 'btn-jade', onClick: () => this.uiMoveHero(c) }, '调遣武将', costTag(cmdCostOf('moveHero'))),
       h('button', { class: 'btn-primary', onClick: () => this.uiTransport(c) }, '输送资源', costTag(cmdCostOf('transport'))),
     );
+    // 商业行：升级城池 / 资源对换（金↔粮）/ 相邻贸易
+    const cap = buildCapForCity(c);
+    const cLevel = c.level || 1;
+    const cityMaxed = cLevel >= CITY_MAX_LEVEL;
+    const cityReady = c.farmLevel >= cap && c.marketLevel >= cap && c.wallLevel >= cap;
+    const upCost = cityUpgradeGoldCost(cLevel);
+    const tradeTargets = neighbors(s, c.id).filter((n) => n.ownerFactionId !== s.playerFactionId);
+    const commerce = h('div', { class: 'commerce-block' },
+      h('div', { class: 'hint', style: { marginBottom: '0.3rem' } }, '商贸 · 城建'),
+      h('div', { class: 'cmd-grid' },
+        cmdBtn(cityMaxed ? `城池满级 Lv${cLevel}` : `升级城池 Lv${cLevel}→${cLevel + 1}`,
+          () => A.upgradeCity(s, c.id, s.playerFactionId),
+          { refresh: true, cost: cityMaxed ? null : cmdCostOf('upgradeCity') }),
+        cmdBtn('资源对换', () => this.uiExchange(c), { cost: cmdCostOf('exchange') }),
+        cmdBtn(tradeTargets.length ? '通商贸易' : '无邻接商路',
+          () => this.uiTrade(c),
+          { cost: tradeTargets.length ? cmdCostOf('trade') : null }),
+      ),
+      h('div', { class: 'hint', style: { marginTop: '0.25rem' } },
+        cityMaxed ? '城池已达最高等级。'
+          : (cityReady ? `三项资源已满 Lv${cap}，升级需 ${upCost} 金（解锁资源上限至 Lv${cap + 5}）。`
+            : `三项资源均达 Lv${cap} 后方可升级城池（当前 田${c.farmLevel}/市${c.marketLevel}/墙${c.wallLevel}）。`)),
+    );
     // 在野名将登用入口
     const wilds = wildHeroesInCity(s, c.id).filter((w) => w.discovered);
     const wildBlock = wilds.length ? h('div', { style: { marginTop: '0.6rem' } },
@@ -504,10 +534,54 @@ export class GameUI {
       h('div', { class: 'hero-card__foot' }, wilds.map((w) => h('button', { class: 'btn-ghost', onClick: () => { const r = A.recruitHero(s, w.id); this.toast(r.msg); this.afterAction(); if (r.ok) this.openOwnedCity(c); } }, `登用 ${w.name}`, costTag(cmdCostOf('recruitHero'))))),
     ) : null;
 
-    const body = h('div', null, this.cityHeader(c), this.cityRows(c), grid, this.officesBlock(c, true), advBtns, wildBlock);
+    const body = h('div', null, this.cityHeader(c), this.cityRows(c), grid, commerce, this.officesBlock(c, true), advBtns, wildBlock);
     this.openModal({ title: `城务 · ${c.name}`, body, foot: [h('button', { class: 'btn-ghost grow', onClick: () => this.closeModal() }, '关闭')] });
   }
 
+  // —— 资源对换（金 ↔ 粮）——
+  uiExchange(c) {
+    const s = this.state;
+    const fac = playerFaction(s);
+    const rate = exchangeRate(s, c);
+    const dirSel = h('select', null,
+      h('option', { value: 'buy' }, `买粮（金→粮）：1金≈${rate.toFixed(2)}粮`),
+      h('option', { value: 'sell' }, `卖粮（粮→金）：约${(1 / rate * 0.7).toFixed(3)}金/粮（七折）`),
+    );
+    const amtIn = h('input', { type: 'number', value: 500, min: 1, step: 50, style: { width: '5rem' } });
+    const body = h('div', null,
+      h('p', { class: 'hint' }, `金 ${Math.round(fac.money)} · 粮 ${Math.round(fac.grain)}。市集等级与商贸科技越高，汇率越优。`),
+      h('div', { class: 'create__field' }, h('label', null, '兑换方向'), dirSel),
+      h('div', { class: 'create__field' }, h('label', null, '数量（金 或 粮）'), amtIn),
+    );
+    this.openForm('资源对换', body, () => {
+      const r = A.exchange(s, c.id, dirSel.value, parseInt(amtIn.value, 10) || 0, s.playerFactionId);
+      this.toast(r.msg); this.closeModal(); this.afterAction();
+      if (r.ok) this.openOwnedCity(c);
+    }, '兑换');
+  }
+
+  // —— 相邻贸易 ——
+  uiTrade(c) {
+    const s = this.state;
+    const fac = playerFaction(s);
+    const targets = neighbors(s, c.id).filter((n) => n.ownerFactionId !== s.playerFactionId);
+    if (!targets.length) { this.toast('无相邻的非己方城市可通商'); return; }
+    const tSel = h('select', null, targets.map((n) => {
+      const kind = n.ownerFactionId == null ? '中立' : (factionById(s, n.ownerFactionId)?.name || '他国');
+      const yield_ = tradeGoldYield(s, c, n);
+      const risky = n.ownerFactionId != null ? '（他国·有劫掠风险）' : '';
+      return h('option', { value: n.id }, `${n.name}（${kind}）· 预计 +${yield_} 金${risky}`);
+    }));
+    const body = h('div', null,
+      h('p', { class: 'hint' }, `派商队前往相邻非己方城市通商。消耗 ${TRADE_GRAIN_COST} 粮（当前 ${Math.round(fac.grain)}）。中立城市稳赚；他国城市有被劫掠风险。`),
+      h('div', { class: 'create__field' }, h('label', null, '通商目标'), tSel),
+    );
+    this.openForm('通商贸易', body, () => {
+      const r = A.trade(s, c.id, tSel.value, s.playerFactionId, Math.random);
+      this.toast(r.msg); this.closeModal(); this.afterAction();
+    }, '派出商队');
+  }
+
   openEnemyCity(c) {
     const s = this.state;
     const body = h('div', null,
@@ -732,6 +806,7 @@ export class GameUI {
           h('div', { class: 'panel__rows' },
             h('div', null, h('span', { class: 'muted' }, '兵'), ' ', Math.round(c.soldiers)),
             h('div', null, h('span', { class: 'muted' }, '防'), ' ', Math.round(c.defense)),
+            h('div', null, h('span', { class: 'muted' }, '城池'), ` Lv${c.level || 1}`),
             h('div', null, h('span', { class: 'muted' }, '田/市/墙'), ` ${c.farmLevel}/${c.marketLevel}/${c.wallLevel}`),
             h('div', null, h('span', { class: 'muted' }, '守将'), ' ', gov ? gov.name : '—'),
           ),
@@ -807,17 +882,20 @@ export class GameUI {
   // ============ 科技 ============
   renderTech() {
     const s = this.state;
-    const research = s.researchByFaction && s.researchByFaction[s.playerFactionId];
+    const fid = s.playerFactionId;
+    const techMax = techMaxLevel(s, fid);
+    const research = s.researchByFaction && s.researchByFaction[fid];
     this.content.appendChild(h('div', null,
       h('h3', null, '科技树（势力独有）'),
+      h('p', { class: 'hint' }, `当前科技上限 Lv${techMax} —— 升级城池可解锁更高上限（势力最高城池等级越高，科技天花板越高）。`),
       research ? h('div', { class: 'panel', style: { marginBottom: '0.6rem' } },
         h('div', null, h('b', null, `正在研究：${TECHS[research.key].name}`), ` · 剩余 ${research.turnsLeft} 回合`),
       ) : null,
       h('div', { class: 'tech-grid' }, Object.entries(TECHS).map(([k, t]) => {
-        const lv = techLevel(s, s.playerFactionId, k);
-        const maxed = lv >= TECH_MAX_LEVEL;
+        const lv = techLevel(s, fid, k);
+        const maxed = lv >= techMax;
         const ongoing = research && research.key === k;
-        const dots = Array.from({ length: TECH_MAX_LEVEL }, (_, i) => h('i', { class: i < lv ? 'on' : '' }));
+        const dots = Array.from({ length: techMax }, (_, i) => h('i', { class: i < lv ? 'on' : '' }));
         return h('div', { class: 'tech-card' },
           h('div', { class: 'tech-card__head' },
             h('span', { class: 'tech-card__icon' }, t.icon),
@@ -825,7 +903,7 @@ export class GameUI {
             h('span', { class: 'tech-lv' }, dots),
           ),
           h('div', { class: 'hero-card__foot' },
-            h('span', { class: 'hero-card__sub' }, maxed ? '已满级' : `下级 ${TECH_COST_GOLD} 金`),
+            h('span', { class: 'hero-card__sub' }, `${lv}/${techMax}${maxed ? ' · 已满' : ''}`),
             h('span', { class: 'grow' }),
             h('button', {
               class: 'btn-primary', disabled: maxed || !!research,
diff --git a/apps/xiong-tu-san-guo/src/ui/style.css b/apps/xiong-tu-san-guo/src/ui/style.css
index 064cedf..62fbba7 100644
--- a/apps/xiong-tu-san-guo/src/ui/style.css
+++ b/apps/xiong-tu-san-guo/src/ui/style.css
@@ -206,6 +206,13 @@
 .xtsg .cmd-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.4rem; margin-top: 0.6rem; }
 .xtsg .cmd-btn { padding: 0.5rem 0.2rem; font-size: 0.78rem; }
 
+/* —— 商贸 · 城建面板 —— */
+.xtsg .commerce-block {
+  background: var(--bg-2); border: 1px solid var(--line); border-radius: 10px;
+  padding: 0.55rem 0.7rem; margin-top: 0.6rem;
+}
+.xtsg .commerce-block .cmd-grid { margin-top: 0.2rem; }
+
 /* —— 列表卡片 —— */
 .xtsg .card-list { display: flex; flex-direction: column; gap: 0.55rem; }
 .xtsg .hero-card, .xtsg .city-card {
