审查完成。该 PR 提交了一个完整且可用的游戏（构建正常，135 个逻辑断言和 21 个 DOM 冒烟测试断言全部通过，`_lib/keyboard-shell.js` 的导入解析正确，没有 `.github/` 的更改，没有安全问题）。然而，我发现了**两个已确认的核心战斗逻辑 Bug**，我已针对实际代码进行了复现。因此我要求进行修改。

DECISION: REQUEST_CHANGES
COMMENT: 已构建并运行全部自测（135 逻辑断言 + 21 DOM 冒烟断言全过，vite 构建成功，`_lib/keyboard-shell.js` 引入路径正确，无 .github/CI 改动，无 XSS/注入风险），但发现两处确凿的核心逻辑 Bug，已用真实代码复现，需修复：

【Bug 1 · 严重 · 资源凭空消失】src/core/actions.js 的 transport()。金钱/军粮是势力级共享池（见 economy.js 与 resolveTurn，每回合直接 fac.money+=、fac.grain+=），并非城市级。但 transport() 里却执行 `fac.money -= gm; fac.grain -= gr;` 且**从不把 gm/gr 加到任何地方**（from/to 的城市金库 gold/grain 也未变动）。实测：输送 500 金/500 粮后，势力金钱 -500、军粮 -500，而 luoyang.gold/wan.gold 均不变 —— 玩家的资源被直接销毁。UI（src/ui/app.js 的 uiTransport）还专门提供了金/粮输入框诱导玩家误用。修复建议：金/粮本就是全势力共享、无需「输送」，应从 transport() 移除金/粮扣减逻辑、并从 uiTransport 表单去掉金/粮输入框，只保留唯一有意义的城市级资源——士兵（soldiers 部分的 from.soldiers-=s / to.soldiers+=s 是正确的，保留即可）。

【Bug 2 · 严重 · 战斗结果不回写】src/core/actions.js 的 applyCampaignResult()。createBattle() 对 attacker/defender 做了浅拷贝，runBattle() 只削减 `battle.defender.soldiers`，从未改写真实城市 `to.soldiers`。攻方获胜分支用 `to.soldiers = survivors`（攻方残兵）覆写，尚可；但**攻方失利分支只 push 了一条日志，完全没有把守军实际伤亡回写**。实测：守军 600、城防 0，玩家攻城失败时，战斗结算守军被打到仅剩 168（战死 432），而战斗结束后真实城市 garrison 仍为 600 —— 守军凭空满血复活。这意味着「以战消耗敌城」的策略完全失效：只要攻城失败，敌城守军永远无损。修复建议：在失利分支补 `to.soldiers = Math.round(battle.defender.soldiers);` 并 `to.defense = Math.max(0, Math.round(battle.defender.defense));`，使战斗伤亡如实落账。

【次要问题，供一并酌情处理】(a) 胜负判定仅在 resolveTurn() 结尾的 checkGameOver() 触发：玩家在回合中通过出征占领最后一座城不会立即胜利，必须再「结束回合」才结算（afterAction 读取的 state.over 此刻仍为 null）。建议在 campaign 成功占领后调用一次 checkGameOver，或让 afterAction 主动判定。(b) 计略 stratagem() 的施计者用 bestDefender()（按统率最高）挑选，却读取其 stats.i（智力）计算成功率，逻辑上应取智力最高的武将施计，当前会系统性压低计略成功率（属设计瑕疵而非崩溃）。

以上均为 src/ 下业务代码问题，可直接修改；本 PR 未触及 .github/ 及任何 CI/CD 配置，无需人工介入 workflow。
