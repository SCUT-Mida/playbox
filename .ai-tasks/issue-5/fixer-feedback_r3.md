/claude-fix 🛠️ **请立即根据以下审查意见修改代码：** \n\n> 以下是第 3 轮审查未通过的意见：\n\n r1 的「孤儿游戏竞态」与 r2 的「playBtn 永久 disabled」两个死锁均已正确修复：我逐一追踪了 取消/失败/重试 三条路径，状态机已无死锁；`COLORS` 从 `main.js` 导入中移除是正确的（`backgroundColor` 为硬编码、`COLORS` 仅被各 scene 使用）；落地页无 `#game-container`，游戏模块的自动挂载守卫不会误触发；`npm run build` 通过，《鼎足三分》被正确拆为独立 chunk（~1.5MB）按需懒加载，落地页主包仅 4.5KB。方向与执行都对。但还有一个与 r2 同源、必须修的真实问题：

【Bug 1（必须修）— closeGame 没有恢复 playBtn 自身状态：取消加载后按钮仍 disabled，且在网络挂起时会演变为真死锁】
`openGame` 在 `await import(...)` 之前同步设置了 `loading=true`、`playBtn.disabled=true`、`playBtn.classList.add('is-loading')`（src/main.js:77-79）。而 `closeGame`（src/main.js:113-126）只递增了 `loadSeq` 并重置了 overlay/label/mount，**完全没有恢复 `playBtn.disabled` / `loading` / `is-loading`**。按钮的恢复完全依赖 `openGame` 自己的 `finally` 块——而 `finally` 只有在那次飞行中的 `import()` **真正 settle（resolve/reject）之后**才会执行。
后果分两档：
  - 常见情况（慢网）：用户在加载中点 ✕/ESC 取消，overlay 已隐藏、label 已变回「开始游戏」，但 `playBtn` 依然 `disabled` 且半透明（is-loading）。由于被取消的那个网络请求仍在传输，按钮要等到它传完（可能还有数秒）才能重新可点。用户看到灰按钮会以为坏了。这与 r2「让取消后按钮可恢复」的意图只完成了一半。
  - 极端但真实的情况：若该动态 import 的 chunk 请求挂起（连接保活但无数据，浏览器未必对 import Promise 超时），`finally` 永不执行，`playBtn` 将**永久 disabled**——即 r2 想消灭的死锁在「网络挂起」条件下复现，只能刷新页面。
修复（一行级，安全）：让 `closeGame` 成为按钮状态的唯一收口，因为取消发生后应立即释放入口。在 `closeGame` 开头（`loadSeq++` 之后）补：
```js
loading = false
playBtn.disabled = false
playBtn.classList.remove('is-loading')
```
这是安全的：`loadSeq` 仍会使飞行中的 `openGame` 在 `await` 之后走 `if (id !== loadSeq) return` 丢弃结果，用户立即重开只会触发一次新的 `++loadSeq`，不会双开游戏。补上后取消即「即时生效」，不再依赖被取消请求何时 settle，r2 类死锁被彻底堵死。

【次要问题（非阻断，建议顺带处理）】
1. `openGame` 顶部的恢复分支 `if (game) { overlay.hidden=false; return }`（src/main.js:70-73）实际不可达：`closeGame` 总会把 `game=null`，catch 路径里 `game` 也始终为 null（createGame 抛错），全代码不存在「game 非空且 overlay 隐藏」的状态。属防御性死代码，可删可留，但若保留请在注释里标明「防御性」以免误导。
2. 竖屏体验：落地页 overlay 未复刻独立版 `apps/ding-zu-san-fen/index.html` 的 `#orientation-hint`。竖屏手机上 `.game-stage` 受 `aspect-ratio:1334/750` 约束会渲染成很小的横屏条，体验差。r1/r2 已记录，仍建议后续补一个竖屏提示遮罩。
3. `apps/ding-zu-san-fen/src/main.js:38` 的 `if (typeof window !== 'undefined')` 与 `:35` 的 `typeof document !== 'undefined'`：该模块只在浏览器侧运行（独立站或落地页动态 import），不存在 Node 执行场景，属防御性噪音；其中 `document.getElementById('game-container')` 这一处判断本身有业务意义需保留，外层 `typeof` 包装可考虑移除以提升可读性。非阻断。

【CI/CD】本次 PR 未触碰 `.github/`，`vite.config.js` 仅抬高 `chunkSizeWarningLimit` 属源码级构建配置，无需改动 workflows；以上全部为源码修复，请人类无需手动处理 CI/CD。
