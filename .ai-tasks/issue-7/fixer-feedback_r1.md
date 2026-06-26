/claude-fix 🛠️ **请立即根据以下审查意见修改代码：** \n\n> 以下是第 1 轮审查未通过的意见：\n\n
本次 PR 的核心改动（横屏→竖屏 + Q版开罗风格小人）质量较高，逻辑正确：两条关卡路径均在新的 9×14 网格内且全部轴对齐（合法蛇形），`_renderBoard` 基地/入口箭头随 `MAP_Y` 重新定位正确，`Enemy`/`General` 中对已删除的 `_drawShape`/`HP_BAR_W` 无残留引用（grep 确认），延迟回调对 `body` 的空值守卫到位，HUD/武将卡两行布局数学验算均落在 720×1280 画布内（卡栏 1084..1244、HUD 8..160 不压地图），纯逻辑自测 56/56 通过，全部改动 JS 文件 `node --check` 通过。

但存在一个必须处理的问题，以及若干次要项：

【必须修改】
1. 仓库根目录新增的 `render-tmp.mjs` 是一份临时调试/截图脚本，不应进入本 PR：
   - 文件名自带 `tmp`，且全仓库 grep 无任何引用（孤儿文件）；
   - 依赖 `puppeteer-core` 与硬编码的 `/usr/bin/chromium`，二者均不是项目依赖（package.json 中无 puppeteer），他人 clone 后既无法运行也会造成误解；
   - 硬编码 `http://localhost:4173/`，属于一次性本地产物；
   - 它已在 `0a832ba` 提交中被误提交。
   请直接删除该文件（它是普通源码文件，不涉及 .github/CI/CD，可直接处理，无需人工改 workflow）。

【次要 / 建议（不阻塞，但建议顺手清理）】
2. `src/data/enemies.js` 中每个敌人的 `shape: 'tri'/'diamond'/...` 字段，在 `_drawShape()` 被整体删除后已成为死数据（grep 确认无消费方）。建议删除该字段以免误导后续维护者以为还有形状渲染分支。
3. `.ai-tasks/issue-7/` 下的 prompt/context 等任务脚手架文件一并提交进仓库，属轻微仓库噪声；若该自动化流程本就要求保留可忽略，否则建议纳入 .gitignore。

【需人工处理（若你认同）】
以上均为普通源码/数据文件改动，不涉及 `.github/` 或任何 CI/CD 配置，无需人工手动改 workflow。

修掉第 1 项（删除 `render-tmp.mjs`）后即可 APPROVE；第 2、3 项为锦上添花。
