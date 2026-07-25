第 3 轮审查仍发现一处明确的逻辑错误（科技系统）及若干缺陷，需修订后再合入。所有问题均不涉及 CI/CD 与 .github/workflows，无需人工改流水线。

【1｜逻辑错误·严重｜科技等级被全局共享】state.techLevels 是单一全局对象（newGame 初始化、resolveTurn 递增、techMult/techLevel 读取），而研究进度槽 researchByFaction 却按势力独立。由此产生三重问题：
(a) 跨势力泄漏——任一方（含 AI）完成研究，所有势力（含玩家与其余 AI）同时获得该科技加成；
(b) 单回合重复结算——当两个势力同时研究同一科技并在同一回合完成时，state.js:285-296 的 for 循环会对每个势力各 +1 一次，使 state.techLevels[key] 一回合跳两级（一次研究完成≠一级）；
(c) 全局锁死——一旦某科技被任一方升至 TECH_MAX_LEVEL，actions.js research() 的 techLevel>=MAX 判定会阻止所有势力再研究该科技。
这与"逐势力独立研究槽、互不阻塞"的设计、以及 AI 花 800 金 + 指令点研究（ai.js:60-68）的意图直接矛盾：全局共享下，AI 出资研究等于白送玩家科技，玩家最优策略是永不研究、坐享其成，科技层的战略意义被彻底掏空。修复方向：将 techLevels 改为按势力存储（如 state.techLevelsByFaction[fid][key]），techMult/techLevel 增加 fid 入参，resolveTurn 仅对当前结算势力加级；UI 文案 app.js:616"科技树（势力共享）"与 641 行说明需同步改为"势力独有/本势力全城共享"。

【2｜逻辑缺陷·中等｜城陷后败方武将处置缺失】applyCampaignResult（actions.js:242-265）攻方获胜时仅转移 ownerFactionId、设太守、缴获城库；守方主将若未被俘（君主 isLord 免俘，或 runBattle 0.5 概率未中），其 factionId 仍属旧主、cityId 仍指向已被占领的城。该武将既非己方、非俘虏、非在野，滞留于敌占城，仍被 heroesOfFaction 计入旧主麾下却永不被 AI 调用（AI 仅在自有城中寻将），随占领累积会污染势力名册。建议：城陷时把未俘获的败方武将迁至其势力最近友城，无友城则转为在野。

【3｜死代码/未完成功能｜兵营·工坊永不升级】已核实：不存在 developBarracks/developWorkshop，UI 指令网格（app.js:344-351）也无对应入口；barracksLevel 恒为 1，故 actions.js:88 中"兵营等级提升新兵训练度起点"实际恒为 TRAINING_BASE+0，属死代码，cityRows 仍展示"兵营 Lv1"会误导；workshopLevel 仅在 state.js:122 初始化、全代码无任何读取或升级。请要么补全升级链路，要么删除字段与展示。

【4｜次要｜政治加成形同虚设】cmdPoints（state.js:54）用 Math.floor(pol/100)，在 pol∈[50,100] 时几乎恒为 0，与注释"君主政治加成"不符。若要体现政治价值，建议改为 Math.floor(pol/10) 之类。

【5｜次要｜胜利条件偏苛但自洽】checkGameOver 要求 18 城全归玩家方判胜（中立城也须攻占），与"一统九州"一致，仅提示确认这是预期阈值而非占比制。
