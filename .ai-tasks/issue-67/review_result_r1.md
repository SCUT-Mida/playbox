我已仔细阅读 `pr_diff_r1.md`。下面逐项审查。

DECISION: REQUEST_CHANGES
COMMENT: 整体方向正确：输入框 font-size 提到 1rem（≥16px）以避免 iOS Safari 聚焦时自动放大整页、用 visualViewport 收口容器高度，都是业界标准做法；轻奢主题改造也无功能性问题。但存在 1 处实现与注释意图不符的 Bug，以及若干需要确认的疑点：

1.【Bug · 描述区出现"双线"重影】.description 在保留 border-top/border-bottom: 1px solid var(--line) 的同时，又新增了 ::before/::after（top:0 / bottom:0）的金色渐变线。由于绝对定位伪元素的 top:0 是相对内边距盒（紧贴边框内侧），渲染结果是"灰边 + 金线"两条紧邻细线，产生重影。注释明确写着"上下细金线……替代纯灰描边"，说明意图是用金线替换灰边，但 border 并未移除。对照同一 PR 里的 .footer（正确地删除了 border-top、改用 ::before 渐变）即可确认 .description 属于漏改。建议二选一：删掉 .description 的 border-top/border-bottom；或把伪元素改成 top:-1px / bottom:-1px 覆盖在原边框上。

2.【疑点 · 视觉视口坐标系】_syncShell 中 `vv.offsetTop - pRect.top` 的正确性依赖"两者同坐标系"这一假设，而该假设本身在 iOS/Chrome 间就脆弱（代码注释也承认 Chrome 上 bcr 相对视觉视口、offsetTop≈0）。建议增加保护：当 vv 高度近似等于布局视口高度（即键盘未弹起、桌面端）时，直接走清空 top/height 的回退分支，避免给容器写入多余的固定 top/height——否则一旦写入后窗口 resize 而没有后续 vv resize 事件，容器尺寸会停留在陈旧值。

3.【疑点 · CSS 变量作用域】在 src/style.css 的 :root 新增了 --line、--accent-hi 并把 --text 由 #e8e6e3 调到 #ece9e3。需确认各子应用（da-ka / frxx / mnrs）是否与主菜单共用同一文档的 :root：若共用且子应用未在自身作用域重定义，--text 的亮度变化会渗透到子应用的正文字色。请确认各应用是否在自身根类（.daka-root / .frxx / .mnrs）内重定义了这些变量。

4.【小问题】--border 变量在多处被替换为 --line 后，疑似已无引用，可一并清理。

以上均为代码层修改，未涉及 .github/ 下任何 CI/CD 或 workflows 配置，无需人类手动处理。建议至少修复第 1 项后再合入。
