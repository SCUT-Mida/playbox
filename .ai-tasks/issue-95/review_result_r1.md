DECISION: REQUEST_CHANGES
COMMENT: 整体思路正确：用内联 SVG 预制人形立绘替换 clip-path 剪影，`h()` 的 `html` 属性确实走 `innerHTML`（dom.js:14），SVG 外来内容在 HTML 解析下可正常生成；眨眼/微笑仍通过 `.portrait__eyes` 类驱动，animationSystem.js 与 portrait3D.js 的 `querySelector` 均能命中 SVG 内的 `<g>`；`classDef` 的 key 回退、gacha 卡的 `def ? ... : null` 空值防护、`charArtVars` 的非十六进制色回退都处理妥当，也未修改 .github/ 下任何文件。但存在一个确定性回归 Bug，必须修复：

1.【Bug·变量作用域回归】silhouetteRenderer.js:16-23 重构后，`--sil / --sil-d / --sil-l` 只设置在内部 `.char-art` span 上（charArt.js figureEl），而旧代码是设在 `.silu` 根元素上。但 style.css:783 的 `.silu__aura { border: 2px solid var(--sil) }` 和 style.css:808 的 `.silu .aura-R { border-color: var(--sil) }` 作用的光环是 `.char-art` 的兄弟节点，无法继承这些变量——`var(--sil)` 无 fallback 时声明在计算值阶段失效，border-color 回退为 currentColor。后果：战场中 R 稀有度角色的底部光环（以及所有稀有度光环的基础描边）丢失五行代表色，变成文字墨色。全库检索确认 `--sil` 在 `.silu` 祖先链上再无任何定义。修复建议：在 renderSilhouette 返回的根元素上同时落地变量，如 `style: charArtVars(card)`，或给 CSS 中的 var() 补 fallback。

2.【次要·一致性】`shade()` 现在三处各存一份（app.js / portrait3D.js / charArt.js），且 charArtVars 的 `--sil-l` 用 `shade(sil, 0.3)`，而 portrait3D.js:79 在卡面上设的是 `0.32`——内层 span 会覆盖卡面取值，同屏出现两档高光色。建议统一常量，顺手把 shade 收敛到共享模块（config.js 或 dom.js，不存在循环依赖风险）。

3.【吹毛求疵】`.blink` 与 `.smile` 同时命中时（满好感角色眨眼），style.css 中 `.smile` 规则在后、同特异性会胜出，眨眼动画对满好感角色不可见。此问题旧实现同样存在，非本次回归，可一并加 `.blink.smile` 提升特异性修掉。

逻辑测试 208 通过 0 失败，无注入风险（SVG 模板为纯静态字符串，卡牌数据未拼入 HTML）。第 1 点为视觉功能回归，修掉即可 approve；第 2、3 点为建议项。
