
【先对账：第 1 轮问题均已正确修复，无需返工】
1) transport() 资源凭空消失——已移除金/粮扣减，仅保留士兵调运（from.soldiers-=s / to.soldiers+=s），uiTransport 表单也去掉了金/粮输入框，正确。
2) applyCampaignResult() 失利分支不回写——已补 to.soldiers=Math.round(battle.defender.soldiers) 与 to.defense=Math.max(0,Math.round(battle.defender.defense))，「以战消耗敌城」恢复有效，正确。
3) 占领后即时胜负判定——campaign() 在 won 时调用 checkGameOver(state)，afterAction() 据此即时弹结算，正确。
4) stratagem() 施计者——改为 casterRoster.reduce 取智力最高者计算成功率，正确。
另核验：dom.js 的 h() 全程 createTextNode，君主姓名经 /^[一-龥]{2,4}$/ 校验、无 innerHTML 注入用户输入，无 XSS；邻接关系 adjacencyValid() 双向自洽；_lib/keyboard-shell.js 引入路径与其它 app 一致（apps/_lib/...）；未触及 .github/CI。

【阻断项 · 核心机制失效：科技研究槽为「全局单槽」，非按势力独立】
state.research 与 research()/resolveTurn() 共用同一个全局研究槽。科技树是设计文档 2.6 的核心玩法，但当前实现里：玩家在自己回合点「研究」时，若上一回合结算阶段任一 AI 抢占了该全局槽（aiTurn→A.research），research() 会直接返回「已有研究进行中」，玩家被锁出、无法推进自己想要的科技。该现象会间歇性反复发生，玩家体感即「研究按钮长期灰掉/不可用」。同时 7 个 AI 也只能共享这一个槽，多数 AI 永远研究不了。
说明：state.techLevels 位于全局，与设计文档 3.1 的数据结构一致，可保留为全局共享；问题在「研究进度槽」必须按势力独立。
修复建议（最小改动、不碰 .github）：把 state.research 改为按势力存储（如 faction.research 或 state.researchByFaction[fid]），并相应调整 research() 的占用判定、resolveTurn() 中逐势力推进研究回合、以及 UI 科技页对「研究中」状态的读取。改完后玩家与每个 AI 各持独立研究队列、互不阻塞。

【次要 · 非阻断，建议顺带处理】
- campaign() 占领分支把 attackerGen.cityId 改为 to.id 并可能令其出任 to 太守，但未清理 from.governorHeroId；若该将原为 from 太守，会出现同一武将被两城同时引用为太守的脏数据（界面展示/appointGovernor 判定易混淆）。建议占领后若 attackerGen.id===from.governorHeroId 则置空 from.governorHeroId。
- 玩家若选 AI 都城开局，该势力君主（如 caocao）会转为在野且仍带 lord:true；若被玩家登用入队，isLord() 恒真导致其永不被俘，属轻微数据一致性瑕疵，不致死。

以上均在 src/ 业务代码内，无需改动 CI/CD 或 workflows；如修复涉及构建脚本/package.json，请人类手动确认。
