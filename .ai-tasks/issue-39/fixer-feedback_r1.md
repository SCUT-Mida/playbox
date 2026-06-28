/claude-fix 🛠️ **请立即根据以下审查意见修改代码：** \n\n> 以下是第 1 轮审查未通过的意见：\n\n

【必须修复 — Bug】

1. `reincarnate()` 未重算 `maxVitality`（apps/fan-ren-xiu-xian/src/core/player.js，reincarnate 函数体）
   - 该函数先 `player.talentIds = (...).slice(0, 1)`（只保留 1 项天赋），随后 `recompute(player)`，再 `player.vitality = player.maxVitality`。
   - 但 `recompute()` 并不刷新 `maxVitality`，而 `vitalityMax(player)` 恰恰依赖 `talentIds`（逐项累加 `t.maxVitBonus`）。也就是说，截断天赋后 `maxVitality` 仍是截断前的旧值，`player.vitality` 被赋成了一个与当前天赋集不一致的「陈旧上限」。
   - 后果：轮回后角色 `vitality` 可能高于真实上限、状态栏 `⚡cur/max` 的 max 显示错误，直到下个自然月 `rolloverVitality()`（其中有 `player.maxVitality = vitalityMax(player)`）才自愈。
   - 这与同文件 `newPlayer()`（`player.maxVitality = vitalityMax(player); player.vitality = player.maxVitality;`）和 `restToNextDay()`（同样先 `player.maxVitality = vitalityMax(player)`）的既定写法不一致 —— 属于明确的遗漏，且现有 968 条断言未覆盖该路径（轮回测试未校验 maxVitality）。修复一行即可：在 `recompute(player)` 之后、`player.vitality = ...` 之前补 `player.maxVitality = vitalityMax(player);`（注意需从 config 导入 `vitalityMax`）。

【建议修复 — 健壮性 / 体验】

2. `rolloverVitality()` 在「系统时钟回拨」时会污染 `lastAgeMonth`（src/core/player.js）
   - `monthsBetween` 对逆序正确兜底为 0（不产生负年龄），但分支内无论 `months` 是否 >0 都会执行 `player.lastAgeMonth = cur`。一旦时钟先回拨再前拨，`lastAgeMonth` 已被改写到更早的月份，随后前拨会出现年龄「超算」。正常玩家不会触发，但属于易修正的边界缺陷：建议仅当 `months > 0` 时才更新 `lastAgeMonth`（回拨时保持原值更安全）。

3. 大限横幅在「轮回次数耗尽」时仅提供「🌌 重开新篇」（confirmReset → 清空存档）按钮（src/ui/app.js renderDeathBanner）
   - 此时玩家其实仍可能通过「突破到大境界」延寿续命（凡人挂机被动攒修为不耗活力，总能逐步突破）。横幅却只把玩家导向存档清空，文案亦称「再无轮回之路」，存在误导与误清档风险。虽有二次确认弹窗兜底，但建议在仍可突破时给出「去突破延寿」入口，或将「重开」降级为非唯一选项。

4. （小项）`_cycleAgedYears` 作为本次增长的瞬态值，会被 `saveGame` 持久化进存档（migrate 也未剥离）。读取后被立刻覆写、无实际危害，但语义上属瞬态字段泄漏进持久层，建议在持久化前剔除或在 `migrate` 中 delete。

5. （小项）`checkDayRollover` 在同一轮既 `rolled` 又 `aged > 0` 时会调用两次 `saveGame`，可合并为一次。

【正面确认】
- 灵根三轴 `rollRoot` 的不变量约束（天/异必单系、异必取异属性、伪必四/五系）自洽，300 次随机测试覆盖到位。
- v6 迁移幂等且向后兼容（`SPIRIT_ROOTS=ROOT_GRADES` 别名、`rootDef`、`rootId` 同步、`rootFromLegacy` 确定性映射）。
- 装备契合度非死代码：法宝 `stats.el`（如 fabao_feijian el:'metal'）与功法 `el` 字段均已就位，契合加成测试通过。
- 全量周期切换干净：`dayKey()` 现仅保留定义、全仓库无残留「每日」周期调用，月度迁移一致无遗漏。
- 无安全/注入问题：`importSave` 仅 JSON.parse + migrate 数值校验，无 eval；age/tier 等字段均有 `Number.isFinite` 兜底，`realmLifespan` 对 tier 做了 clamp，`REALMS[p.tier].name` 不会越界崩溃。

【CI/CD 说明】
本 PR 未触碰 `.github/` 及任何 workflows/CI 配置，红线规则已遵守，无需人类手动处理 CI/CD。建议人类在合入前本地再跑一次 `npm run test` 与 `npm run smoke`（DOM 烟雾测试，本审查环境无浏览器故仅跑了纯逻辑自测）。

综上，第 1 项为真实缺陷（虽影响有限且可自愈），按严格标准需修订；修复第 1 项后（2、3 强烈建议一并处理）即可放行。
