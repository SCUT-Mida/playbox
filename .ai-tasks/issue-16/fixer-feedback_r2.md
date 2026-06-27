/claude-fix 🛠️ **请立即根据以下审查意见修改代码：** \n\n> 以下是第 2 轮审查未通过的意见：\n\n 第 2 轮审查结论：第 1 轮提出的 7 项缺陷已**全部正确修复**（visibilitychange 的 `this` 绑定、`computeDamage` 的 `rng()===0` 显式判空、坊市重复购买退款、装备卸下/换装防销毁、探索先校验事件池再扣消耗、渡劫/战斗期间停止气血回复、`pill_fuhun` emoji 笔误、finishBattle 负修为、保底机制真实断言），126 条纯逻辑单测全绿，结构清晰、可注入 rng 设计到位，未触碰 `.github/`。但作为严格审查，仍发现**同一类「背包满时 `addItem` 返回值被忽略 → 静默丢物」的真实缺陷尚未根治**（第 1 轮 #4 只修了 equip/unequip，其它获取路径漏网），建议修复后再合入：

【1｜必修·炼丹/炼器背包满时产物凭空消失】
`src/core/alchemy.js:49`（tryAlchemy）与 `:76`（tryForge）：
```js
const added = addItem(player, recipe.out, qty);  // 背包满且为新种类时返回 0
... logs.push({ text: `成功炼制 ${added} × ${name}`, ... });
```
材料已 `consumeMaterials` 扣除，若此时背包满且产物是新种类，`addItem` 返回 0，产物直接丢失，日志却提示「成功炼制 / 神兵出炉」。这与 `core/explore.js` 的 `applyReward` 检测 `added>0` 否则提示「背包已满…被丢弃」的处理**自相矛盾**。中后期玩家材料/草药种类多，15 格背包极易撑满，属可达、玩家可感知的丢物 Bug。修法：参照 applyReward，`added===0` 时给出「背包已满，产物遗失」提示（或先 `bagFull` 预检拒绝炼制并保留材料）。

【2｜必修·战斗奖励背包满时掉落静默丢失】
`src/ui/app.js:483-484`（finishBattle）：
```js
for (const it of rw.gain.items) addItem(p, it.id, it.qty);
if (rw.gain.treasure) addItem(p, rw.gain.treasure, 1);
```
未检查返回值；而 `battleRewards`（battle.js:131-138）的日志已宣称「获得 N × 物品 / 意外掉落一件法宝」，背包满时实际入袋为 0，玩家看到「获得」却什么都没拿到。修法：复用 `applyReward` 结算，或对 `added===0` 单独 push 一条「背包已满，X 遗失」日志。

【3｜必修·坊市购买背包满时货架库存泄漏】
`src/core/market.js:70`（buyItem）：
```js
entry.stock -= qty;                 // 已在第 59 行扣减
...
if (bagFull(player) && !countItem(player, entry.id)) { addStones(player, cost); return { ok: false, reason: '背包已满' }; }
```
配方/功法两条失败分支都做了 `entry.stock += qty` 回滚库存，**唯独背包满这条只退款、不回库存**，导致货架该商品库存被永久扣减（库存为 1 时直接从货架消失，扩容后再想买也买不到，须等刷新）。修法：补 `entry.stock += qty;`，与另两条分支保持一致。附带建议：将「背包满」检测上移到 `spendStones`/扣库存之前（与 explore「先校验再扣消耗」原则一致），可同时消除此泄漏。

【4｜建议·获取物品路径统一走 applyReward 规约】
1–3 同源：除 `applyReward` 外，`addItem` 的调用方普遍未处理「背包满返回 0」。建议把「奖励/产出入袋」统一收敛到 `applyReward`（或一个共享的 `addItemOrLog` 辅助），从根上消除此类静默丢物，而非逐点补丁。

【5｜轻微·离线收益可能被重复发放（边界）】
`src/ui/app.js:loadOrCreate` 调 `computeOffline` 发放离线修为后，`player.lastSeen` 直到下一次 `saveGame`（10 秒定时器或任意 afterAction）才更新；若玩家开档后 10 秒内、未做任何操作即关闭页面，下次开档会按旧 `lastSeen` 再次发放同一时段收益。影响小，但可在发放后立即 `saveGame(p)` 落盘以杜绝重复。

说明：以上均不涉及 `.github/` 与 workflows，无需人工改 CI/CD。1–3 为玩家可感知的丢物/漏库缺陷（与第 1 轮 #4 同类，应一并根治），故本轮 REQUEST_CHANGES；修复后可予 APPROVE。
