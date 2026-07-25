整体质量高：构建通过、135 逻辑断言 + 21 DOM 冒烟全绿、纯函数分层清晰、localStorage 与随机数均可注入测试、文案经 textNode 转义无 XSS 风险、无死循环（战斗封顶 30 回合）。但存在一个可复现的逻辑缺陷，建议修正后再合入。

【需修改·逻辑缺陷：太守引用悬挂（违反代码自身不变量）】
- src/core/actions.js:400 `moveHero()` 在把武将调离原城时，只设置 `h.cityId = toCityId`，未清理原城的 `from.governorHeroId`。而同文件 appointGovernor 明确要求"武将须在本城方可任命"，即"太守必在本城"这一不变量被 moveHero 打破。我已实测复现：将洛阳太守调往宛城后，`luoyang.governorHeroId` 仍指向该武将，但武将 `cityId` 已是 wan。后果：原城太守显示错误（界面层）、resolveTurn 中 cityPopGrowth 仍按已调离武将的政治值结算人口增长（平衡偏差），且若该悬挂引用的武将后续被俘/处决，`heroById` 返回 undefined（已做 null 防护不致崩溃，但属隐患）。修复一行即可：`if (from.governorHeroId === heroId) from.governorHeroId = null;`
- 同类缺口在 src/core/actions.js:256 `applyCampaignResult` 的【出征失利】分支：当攻方主将恰为出发城太守、且战败被俘时，仅清理了 `to.governorHeroId`（守城），却未清理 `from.governorHeroId`（攻方出发城），同样留下悬挂引用。注意第 270 行的【胜利】分支已正确处理（`if (from.governorHeroId === attackerGen.id) from.governorHeroId = null;`），失败分支应保持对称。

【次要·建议一并处理】
1. 城务弹窗数据陈旧：openOwnedCity 中的内政按钮（农田/市集/城墙/操练/探索）执行后，afterAction 因检测到 modal 仍打开而跳过 renderContent，导致弹窗内兵数/等级不刷新，仅靠 toast 提示。建议执行成功后重绘当前城务弹窗。
2. src/core/economy.js:69 `recruitCost` 把 `count * 1.5` 与人口系数硬编码，未复用 config.js 的 RECRUIT_GOLD_PER_SOLDIER / RECRUIT_POP_PER_SOLDIER（后者完全未使用，沦为死常量），改常数将无法生效。
3. 未使用的导入（不影响运行，属整洁度）：actions.js 的 playerFaction、rangeInt；ai.js 的 heroById。
4. AI 行为与设计文档语义相反（非 bug，确认是否有意）：context.md/文档约定"金币低于 500 升市场"，ai.js 实现为 `fac.money > 600` 才升市场。当前写法（有钱才投资）其实更合理，但与文档不符，建议更新文档或加注释说明。

以上无任何 CI/CD、workflow、部署相关改动需求，无需人工介入流水线。其余模块（科技按势力独立、存档 migrateSave 向后兼容、邻接双向自检、胜负与 AI 消亡处理）均正确，无需改动。
