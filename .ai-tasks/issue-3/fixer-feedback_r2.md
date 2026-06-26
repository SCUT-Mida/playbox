/claude-fix 🛠️ **请立即根据以下审查意见修改代码：** \n\n> 以下是第 2 轮审查未通过的意见：\n\n 上轮指出的 7 项致命/逻辑缺陷（onLeak 崩溃、leaked 标志、首波 EARLY_BONUS、硬编码等级上限、重复 _drawShape、UID 重置、同名武将唯一性）均已正确修复并经核对，逻辑测试 `scripts/logic-test.mjs` 的断言与代码一致，伤害公式/羁绊叠加/波次状态机均无逻辑错误，也未触及 `.github/` 红线。但仍有必须处理的问题：

【性能瓶颈 - 阻塞移动端 60fps 验收】
1. UIScene._onState 每约 0.1s（外加每次击杀/部署/漏怪的额外推送）在选中武将时调用 _refreshMenu→_buildMenu，每秒约 10 次 destroy 并重建整个菜单容器（Graphics+Text+按钮命中矩形）。这在移动端会产生显著 GC 压力与掉帧，直接违背 context.md §8 的 60FPS 验收标准。应改为仅在金币跨过升级阈值/等级变化/选中变化时重建，其余用就地 setText/setVisible 更新。

【健壮性 Bug】
2. Enemy.takeDamage 与 General.takeDamageFromEnemy 的受击闪白用 `this.scene.time.delayedCall(60, ()=> this.body && this.body.setAlpha(1))`；单位被 destroy 后 this.body/this.nameText 仍为 truthy，守卫失效，会对已销毁对象调用 setAlpha 触发 Phaser 警告。应在 destroy() 中将引用置空或用 .active 判活。
3. 燃烧 DoT 每帧走 takeDamage，导致每帧 setAlpha(0.45) 并堆积 60ms 回调，3 秒燃烧堆积上百回调且高频闪烁；持续伤害应绕开击中闪白逻辑。

【次要】
4. _handleLeak 扣血后立即 _emitState，BOSS 漏怪(leakLives 5/8)时 lives 可能为负，直到同帧 _checkEnd 才夹紧；建议 _handleLeak 内即时 Math.max(0,...)。
5. acquireTarget 每武将每帧至多两次 O(敌军) 调用，当前无碍，建议随单位增长做目标缓存。

【CI/CD - 需人类手动处理】
6. 提交合规未生成任何 .github/ 文件，但 context.md 路线图与 README 均要求"推送自动部署 GitHub Pages"，当前缺少 .github/workflows/deploy.yml，dist/ 无法自动上线。请人类维护者手动新增该部署工作流（AI 依红线不得自动创建/修改 .github/）。
