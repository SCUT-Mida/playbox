我已完成第 3 轮审查。我核对了工作树中的全部源码（app.js / battle.js / world.js / player.js / save.js / rng.js / config.js），用 `git show 5a3b2db` 确认了本轮实际改动范围，并追踪了战斗计时/弹窗生命周期的所有分支。

DECISION: REQUEST_CHANGES
COMMENT: 第 2 轮的 1 项阻断（撤退弹窗 timerEnd 陈旧→瞬间失手）与 2 项次要（重力陷阱触发后未 removeEntity、满槽覆盖无二次确认）均已正确修复，verify-flee-timer.mjs 的 A/B/C/D 四场景也确实覆盖了「开弹窗记录剩余→关弹窗按剩余顺延、不可刷计时、正常超时仍判失手、auto/busy 守卫不误触」；本次未触碰 .github/，无需人类改 CI/CD。但在同一「战斗计时 / 弹窗生命周期」子系统里仍残留一个同源的弹窗状态未清理 Bug，建议修复后再合入。

【Bug · 自动战斗中打开撤退弹窗期间，若敌人被自动回合击杀，会留下陈旧的 _sheet，导致回到地图后无法移动（软卡死，可恢复）】apps/xing-hai-lv-zhe/src/ui/app.js
复现：开启自动战斗 → 点 🏥「撤退」打开确认弹窗（confirmFlee→showSheet 置 this._sheet；因 `!this.battle.auto` 为假，_battlePauseRemain 不记录——这部分正确）→ 但 nextRound 此前排定的 `setTimeout(… chooseAction, 320)` 仍会触发：chooseAction 只守卫 `!this.battle || this.battle.busy`，未守卫 `this._sheet`，于是自动回合照常结算 → 若该回合（非 Boss）击杀敌人，winBattle→exitBattle(true)→buildGame 执行 `clear(this.modalRoot)` 把撤退弹窗从 DOM 移除，可 exitBattle / buildGame 均未把 this._sheet 置空 → _sheet 成为指向已脱离 DOM 节点的陈旧引用。后果：回到地图后 onMapTap 与 dpadMove 均以 `this.screen!=='game' || this._sheet` 提前 return，玩家点击地块 / 方向键完全无响应（无法移动）；renderMap 因 _sheet 真值而不计算 reachableTiles（无可达高亮）；onTick 的闲置回精分支被跳过。该陈旧 _sheet 还会经 restart→showCreate→enterGame 带入新一局（这些路径都不重置 _sheet），直到玩家手动开关一次背包 / 设置弹窗（closeModal 才置空 _sheet）才恢复。玩家方在「自动 + 弹窗」期间被击杀的 loseBattle→gameOver 分支同理（gameOver 也不清 _sheet）。Boss 被击杀时因 offerEnding→showSheet 会覆盖 _sheet 而侥幸不触发，故主要命中非 Boss 自动击杀与玩家死亡两条路径。
根因：弹窗被「非 closeModal 路径」（winBattle/loseBattle 经 exitBattle→buildGame 的 clear）移除时，_sheet（及 _battlePauseRemain）未同步清理——这与已修复的 toggleAuto / nextRound / closeModal 属同一类「绝对状态未随生命周期顺延或重置」漏洞的又一兄弟分支；本轮补的是 closeModal 这条路径，却漏了 exitBattle 这条。
建议修复（最小改动，与现有防御风格一致）：在 exitBattle() 开头补 `this._sheet = null; this._battlePauseRemain = null;`（buildGame 已 clear modalRoot，此处仅需同步清引用，即可消除软卡死）。更彻底的做法二选一：给 chooseAction 增加 `!this._sheet` 守卫，或在 showSheet 打开弹窗时一并挂起自动战斗的排程，使「弹窗打开 = 战斗真正暂停」对自动战斗也成立（目前仅暂停了手动倒计时分支）。

补做第 1 项（exitBattle 清理 _sheet / _battlePauseRemain）后即可合入；第 2 项为可选加固。
