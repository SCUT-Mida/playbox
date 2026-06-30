我已读完整个 PR 的源码（config / core:player,events,rng,save / ui:app,dom,style / main / vite）。代码整体结构清晰、防御性写得到位（`migrate` 钳制、`clampAttr`、`h()` 转义、按钮 armed 态闭环都对）。但作为严格审查，我发现了几处真实的逻辑错误，集中在「阶段跨越里程碑」这条用户高频可见的反馈链路上，需要修改。

DECISION: REQUEST_CHANGES
COMMENT: 总体工程质量不错（存档迁移钳制、DOM 转义、回合按钮 armed 闭环、空池兜底都正确），但「生命阶段跨越」的里程碑日志存在两处确凿的逻辑错误，且该信息在每一局 4 次阶段切换时都会显著展示给玩家，必须修：

【Bug 1 · 里程碑日志重复写入】
apps/mo-ni-ren-sheng/src/core/player.js 的 stepTime() 在 stageChanged 时已经直接 p.log.push({...milestoneText})；而 apps/mo-ni-ren-sheng/src/ui/app.js 的 nextTurn() 又对同一次阶段切换再次调用 this.pushLog(...)，而 pushLog 内部会再 push 一次到 this.player.log。结果：同一次阶段跨越，player.log 里被写入两条不同的里程碑。由于 this.log（UI 缓冲）只拿到 pushLog 那一条，当前会话只显示一条；但存档落盘后（每次 nextTurn 都 saveGame），「继续游戏」时 enterGame 用 player.log.slice(-60) 重建 this.log，就会把两条都显示出来——表现为里程碑重复闪烁。修法二选一：要么删掉 stepTime 里对 p.log 的写入（把日志产出统一收口到 UI 层的 pushLog），要么删掉 nextTurn 里的里程碑 pushLog 改为从 player.log 同步，避免两处各自写入。

【Bug 2 · milestoneHead 阶段标签错位】
apps/mo-ni-ren-sheng/src/ui/app.js 的 milestoneHead() 以「新阶段 key」查表，但映射整体错位：child（学龄期，6~18 岁）被标成「步入成年」、adult（成年期，18~65 岁）被标成「迈入晚年」。调用处 nextTurn 里 `🎯 ${milestoneHead(step.toStage.key)}：${stageOf(p).desc}` 会生成自相矛盾的文案，例如进入小学阶段时显示「🎯 步入成年：入学读书，性格与天赋初现。」、刚步入社会时显示「🎯 迈入晚年：工作成家，人生的主战场。」。对比同项目 player.js 里的 milestoneText()（child→校园、adult→社会、elder→晚年）映射是正确的，说明 milestoneHead 是漏改/错位。请把 child→「步入校园」、adult→「步入社会/成年」、elder→「迈入晚年」对齐，或直接复用 milestoneText 的措辞。

【次要·一致性】
1) apps/mo-ni-ren-sheng/src/core/save.js 的 migrate() 对 name 只校验类型不截断，而 newPlayer() 会 .slice(0,8)。导入他人/旧档的存档可带入超长姓名撑破 UI（无 XSS 风险，因 h() 走 createTextNode）。建议 migrate 里同样 slice(0,8)。
2) README 宣称完整一生约 130~160 回合，但按 config 步长实际测算约 95~105 回合（婴24+童24+成年47+老年若干）。属文档与实现不符，建议订正数字，非阻断项。

注：以上均为业务/文案逻辑错误，不涉及 .github/ 下的 CI/CD 或 workflows，无需人类手动处理工作流。修完 Bug 1、Bug 2 即可。
