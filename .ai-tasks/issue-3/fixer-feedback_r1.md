/claude-fix 🛠️ **请立即根据以下审查意见修改代码：** \n\n> 以下是第 1 轮审查未通过的意见：\n\n 经过严格审查，发现以下问题：

**🔴 致命 Bug（会导致运行时崩溃）：**

1. **`GameScene` 缺少 `onLeak` 方法，敌人到达基地时游戏崩溃。** `Enemy.js:206` 中 `scene.onLeak(this)` 调用了一个不存在的方法。当任何敌人走到路径终点时，将抛出 `TypeError: scene.onLeak is not a function`，导致游戏直接崩溃。需要在 `GameScene` 中实现此方法，例如：
```js
onLeak(e) {
    e.leaked = true;
    e.alive = false;
}
```

2. **`Enemy` 对象的 `leaked` 属性从未被赋值。** `GameScene.js:192` 中检查 `e.leaked` 来区分击杀与漏怪，但 `Enemy.js` 从未在任何地方设置 `this.leaked = true`。即使修复了 `onLeak` 方法，如果不设置 `leaked` 标志，漏怪的敌人会被错误地当作击杀处理（返还金币和气势），失去生命值不扣减。

**🟡 逻辑错误：**

3. **`startNextWave()` 对第一波也发放 EARLY_BONUS (+25金)。** `GameScene.js` 中 `startNextWave()` 无条件在波次开始时给予 25 金奖励，但 UI 上"提前迎战 (+25金)"的提示仅在波间（`between` 状态）显示。第一波本应是正常开始，不应获得额外金币。建议在方法中判断当前是否从 `idle` 状态启动，仅对 `between → running` 的提前迎战发放奖励。

4. **`General.upgrade()` 硬编码 `this.level >= 3` 而非使用 `MAX_LEVEL` 常量。** `General.js:228` 中 `if (this.level >= 3)` 应改为 `if (this.level >= MAX_LEVEL)`，以保持与 `generals.js` 中定义的一致性，避免后续调整最大等级时遗漏此处。

**🟢 次要问题（建议改进，不阻塞合并）：**

5. **`Enemy._build()` 中 `_drawShape(body, r)` 被调用了两次，第一次是无效代码。** 第一次调用建立了路径，但随后 `beginPath()` 被第二次调用覆盖，第一次的路径被丢弃。建议删除第一次调用。

6. **`Enemy._uid` 静态计数器在场景重启时不会重置。** 虽然当前不影响功能，但如果游戏支持多次重玩（"再战一局"），UID 会无限增长。建议在 GameScene 的 `create()` 中或 Enemy 类中提供重置机制。

7. **允许在同一局中部署多个同名武将（如两个关羽），`BondManager.byId` 会覆盖导致羁绊判定异常。** 建议在 `tryPlace` 中检查该武将是否已在场上，或在卡牌 UI 上做冷却/唯一限制。
