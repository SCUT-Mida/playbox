/claude-fix 🛠️ **请立即根据以下审查意见修改代码：** \n\n> 以下是第 2 轮审查未通过的意见：\n\n
【Bug 1（必须修）— 取消加载后 playBtn 永久 disabled】
`openGame` 的 `finally` 块中，取消令牌路径（`if (id !== loadSeq) return`）跳过了 `loading = false`、`playBtn.disabled = false`、`playBtn.classList.remove('is-loading')` 的恢复。`closeGame` 虽然恢复了 label 和 overlay，但没有恢复 `playBtn.disabled`。结果：用户在加载中关闭后，按钮仍处于 `disabled` 状态，再次点击完全无响应，功能入口被锁死。

修复方案（二选一）：
1. 在 `finally` 的 `if (id !== loadSeq) return` 之前补上状态恢复：`loading = false; playBtn.disabled = false; playBtn.classList.remove('is-loading')`；
2. 或让 `closeGame` 也负责清理 `playBtn.disabled`/`is-loading` 状态（因为 closeGame 已经在处理其他 UI 恢复）。

推荐方案 1，因为 `finally` 是 openGame 的状态出口，把自身设置的状态在自身收尾更内聚。

【次要问题】
- `typeof window !== 'undefined'` 两处（第 91、115 行）：该代码仅在浏览器 SPA 中运行（Vite + DOM 操作），不存在 Node.js 执行场景，此检查为防御性噪音。建议移除以提升可读性，非阻断。
- `game.destroy(true)` 的布尔形参在 Phaser 3 不同小版本间语义有变（`removeCanvas`），但此处紧跟 `mount.innerHTML=''` 兜底清理，风险极低，仅作为升级提醒记录。
- 竖屏旋转提示（`#orientation-hint`）未在落地页 overlay 中复刻，竖屏手机上游戏尺寸很小。非阻断，可后续补。

本次未触碰 `.github/`，无需改动 CI/CD。以上均为源码层面修复。
