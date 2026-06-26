/claude-fix 🛠️ **请立即根据以下审查意见修改代码：** \n\n> 以下是第 1 轮审查未通过的意见：\n\n
本次 PR 把《鼎足三分》从「独立 Phaser 应用」改造成落地页按需懒加载的展品，整体方向正确：工厂函数 `createGame(parent)`、动态 import、`chunkSizeWarningLimit` 抬高、Scale.FIT + `aspect-ratio: 1334/750` 的舞台比例与画布逻辑分辨率一致（无 letterboxing）、PreloadScene 全部素材程序化绘制（无外部资源路径问题）、落地页无 `#game-container` 故不会触发模块底部的自动挂载（无双开）、`parent` 传 DOM 元素 Phaser 也支持。这些都 OK。但存在一个真实的逻辑 Bug，必须修：

【Bug 1（必须修）— 异步状态机竞态：加载过程中关闭会"孤儿化"游戏并把按钮卡死】
`openGame` 中 `await import(...)` 需要拉取约 1.5MB 的 Phaser chunk，弱网下可能持续数秒。若用户在此期间按 ESC 或点 ✕（`closeBtn`/keydown 都会调用 `closeGame`），此时 `game===null && loading===true`：
- `closeGame` 走 `if(game)` 为假，跳过 destroy，仅 `mount.innerHTML=''`、`overlay.hidden=true`、label='开始游戏'；
- 但 `import` 仍在飞行中，resolve 后照样执行 `game = createGame(mount)`，于是一个隐藏的 Phaser 实例被创建并挂在隐藏的 `#game-mount` 上，`finally` 又把 label 改成 '继续游戏'；
- 此后状态为：overlay 隐藏 + game 已存在 + 按钮='继续游戏'。用户再点按钮 → `openGame` 首行 `if (game || loading) return` 命中，直接返回，**既不显示 overlay 也不做任何事**；closeBtn 在隐藏的 overlay 内点不到，ESC 因 `!overlay.hidden` 失效。**整个入口被卡死，只能刷新页面**。
修复建议（二选一或并用）：
  1) 引入取消令牌：`let loadSeq=0`，`openGame` 开头 `const id=++loadSeq`，`await` 之后判断 `if(id!==loadSeq) return`；`closeGame` 开头 `loadSeq++` 使飞行中的加载作废；
  2) 让 `openGame` 在 `game` 已存在时不要 early-return，而是重新 `overlay.hidden=false`（恢复显示即可，不要重复 createGame）。
两者都做最稳。顺带：`closeGame` 也应在 `loading` 期间被调用时把 overlay 留在可恢复状态。

【次要问题】
- 死 CSS：`src/style.css` 中 `.card-placeholder / .card-icon / .card-text`（约 116-134 行）在 HTML 改用 `.card--exhibit` 后已无任何元素引用，建议删除。
- UX：弱网下 `overlay.hidden=false` 后到 `createGame` 完成前，用户只看到空黑遮罩 + 一个 ✕，建议在 `.game-stage` 内放一个 loading 指示并在 `game` 就绪后隐藏。
- 一致性：独立版 `apps/ding-zu-san-fen/index.html` 有竖屏旋转提示（`#orientation-hint`），落地页 overlay 内未复刻；竖屏手机上游戏会以很小尺寸渲染。非阻断，可后续补。
- 低置信度提醒：`game.destroy(true)` 在 Phaser 3.90 的 `removeGame` 形参语义请确认（不同小版本有变动）；不过此处紧接着 `mount.innerHTML=''` 兜底清理，即便形参被忽略也不会残留 canvas，影响可忽略。

【CI/CD】本次未触碰 `.github/`，无需改动 workflows；以上均为源码层面修复，请人类无需手动处理 CI/CD。
