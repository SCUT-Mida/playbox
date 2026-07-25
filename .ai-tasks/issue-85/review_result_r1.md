我已完成审查。所有 220 个逻辑测试均通过，并且我深入探究了三个怀疑区域，通过运行代码确认了每一个。以下是我的审查意见。

DECISION: REQUEST_CHANGES
COMMENT: 整体实现方向正确、测试覆盖也较全（220 项全过），但跑代码验证后确认存在 3 处真实缺陷，需要修改后再合入。

【1. 严重度：中｜科技等级会被"倒退"——进度被静默回滚】
位置：src/core/state.js resolveTurn 中研究完成结算
代码：tbl[res.key] = Math.min(techMaxLevel(state, fac.id), (tbl[res.key] || 0) + 1);
问题：科技上限 techMaxLevel 依赖"势力最高城池等级"。若势力最高等级的城池被攻陷（所有权易手），maxCityLevelOfFaction 重新计算后 techMaxLevel 会下降。此时若该项科技恰有"进行中"的研究，研究完成时 Math.min(cap, cur+1) 的 cap 已小于 cur，就会把已取得的科技等级反向降低。我用真实存档复现：城池 Lv5→科技上限 7，把 agri 升到 Lv4 并挂 1 回合研究，再把城池等级降回 Lv1（上限回落到 3），结算后 agri 从 Lv4 被降到 Lv3。
建议改为永不倒退：tbl[res.key] = Math.max(tbl[res.key] || 0, Math.min(techMaxLevel(state, fac.id), (tbl[res.key] || 0) + 1)); 即取"当前值"与"上限内+1"的较大者。

【2. 严重度：中低｜贸易收益的"目标城规模"加成是死代码，永远按中城结算】
位置：src/config.js tradeGoldYield
代码：const tier = toCity && toCity.popMax ? cityTierRaw(toCity) : 2;
问题：guard 取的是 toCity.popMax，但运行时由 newGame/cityById 产生的城市对象用的是 maxPopulation（见 state.js：maxPopulation: c.popMax），并不存在 popMax 字段。于是 toCity.popMax 恒为 undefined → tier 恒为 2。我实测宛（中城，72000）与建业（大城，90000）贸易收益完全相同（均为 330）。README/issue 宣称的"收益随目标城规模增长"实际并未生效。注意：预览（uiTrade）与实际（trade）用的是同一函数，所以数值自洽、不会出现 UI 欺骗，但功能缺失。
建议：直接 const tier = cityTierRaw(toCity);（该函数内部已兼容 popMax 与 maxPopulation），删掉错误的三元 guard。

【3. 严重度：中低｜AI 实际永远不会升级城池——新机制对 AI 完全失效】
位置：src/core/ai.js 内政段
问题：AI 内政只调用 developMarket，从不调用 developFarm / buildWall，因此 AI 城池的 farmLevel / wallLevel 长期为 1，而升级前置 ready = farmLevel>=cap && marketLevel>=cap && wallLevel>=cap 中 cap 至少为 5，所以 ready 永远为 false，upgradeCity 分支是死代码。后果：AI 既享受不到城池等级的收入/城防加成，其科技上限也永远停在基础 3 级（techMaxLevel 不再上涨），等于本次 issue 新增的"城池等级解锁科技上限"与"城池升级加成"两条线对 AI 完全不存在，玩家获得非预期的巨大优势。
建议：让 AI 在内政段也轮换升级 farm/wall（达到当前 cap 后再升城），或放宽 AI 升城前置（例如只要求 market 满级即可），使 AI 能进入城池升级与科技上限提升的循环。

补充（非阻塞，供参考）：
- exchange 的防套利正确（卖出 0.7 折，买入再卖出整体亏损，已验证）。
- UI 中"资源对换/通商"按钮 onClick 流程正确：openForm 会清并替换城务弹窗，随后 afterAction() 因 modalRoot 仍有弹窗而只刷顶栏，不会关掉刚开的表单。
- 存档迁移（wildSeq、c.level）逻辑无误；动态在野人物 id 前缀 genwild_dyn_ 与初始 genwild_{city}_{i} 不冲突。
- 上述 3 条均为源码逻辑问题，无需改动 .github/ 下的 CI/CD 或 workflows；如你认可修复方案，我可只改 src 下对应文件。

注：1 与 3 影响实际玩法与平衡（一条静默回滚玩家进度，一条让新机制对 AI 失效），故本轮不予 APPROVE，建议先修 1、3（2 顺手修）。
