DECISION: REQUEST_CHANGES
COMMENT: 第 2 轮审查完毕（已通读全部 diff，并在仓库中核对 config.js / cards.js / portrait3D.js / inkParticles.js / style.css，运行 scripts/logic-test.mjs 结果 206 通过 0 失败）。第 1 轮提出的 6 个问题均已核实修复到位：Bug 1 由 _deferStreamResize（ResizeObserver 优先、isConnected 轮询兜底，且 resize 加了尺寸相等守卫避免 RO 自激）解决；Bug 2 由 _suppressClick 标志消费；Bug 3 为克隆画布重建了 ink stream；次要 4~6（destroy 先 close 再清 timer、--rot-y 变量替代硬编码 16deg、_bursts 按 done 回收）也均已处理，修复质量良好。

但本轮发现 1 个必须修复的逻辑错误：

【Bug（主要）】卡牌剪影色字段名不匹配，per-card 覆盖功能实际失效，且对应测试是假阳性。config.js:267-268 的 silhouetteColor(card) 读取的是 card.silhouette_color（蛇形命名，沿袭设计文档第七节的 JSON 示例），而 cards.js 中 15 张卡实际写入的字段全部是 silhouetteColor（驼峰命名）。也就是说卡牌上的这个字段从未被读取过——15 条数据全是死数据，任何自定义颜色都不会生效，永远回退到五行色。logic-test.mjs 中 `silhouetteColor(CARD_MAP.SR001) === CARD_MAP.SR001.silhouetteColor` 之所以通过，纯属巧合：目前每张卡的 silhouetteColor 恰好都等于其五行代表色（如 SR001 water → #4a90c2）。该测试名为「silhouetteColor 读卡牌字段」，实际验证的却是回退路径，是误导性的假阳性。修复很简单：函数改为 `card.silhouette_color || card.silhouetteColor` 二者兼收（或统一数据字段名），并建议把测试改为用一张自定义颜色（非该卡五行色）的卡来断言，确保真正覆盖 override 路径。

【次要 1】_openImmersive 中克隆画布的 createInkStream 在 backdrop 刚插入、stage 仍处于 scale(.6) 过渡初值时立即 resize，getBoundingClientRect 返回的是缩放后尺寸（约 120×168），且克隆画布未接 ResizeObserver，后续放大到 1.15 时不会重设 backing store，沉浸预览的 SSR 粒子会略糊。建议对 cloneStream 也走 _deferStreamResize 或在 show 过渡结束后（约 300ms）补一次 resize。

【次要 2】_suppressClick 在 pointercancel 替代 pointerup 触发时（如触屏长按被系统手势打断）不会有 click 事件来消费，标志会残留并吞掉用户下一次对卡牌的正常点击。建议在 end()（含 pointercancel 分支）中一并重置该标志。

【次要 3】克隆体未挂 attachAnimations，沉浸预览中 SR/SSR 不会眨眼（纯 CSS 飘动仍在）。视觉小瑕疵，可接受。

其余方面：inkParticles 的 done 句柄与降级路径安全；animationSystem 的 timer 清理（clearTimeout/clearInterval 双清）正确；battle.js 的 cls/ref 透传与剪影渲染链路正确；CSS 变量（--paper/--r-SR/--gold/--ink/--red）均已存在；未发现安全问题与性能瓶颈（粒子总量有 density*3 上限，RO 有防循环守卫）；无 CI/workflows 改动需求。修复主要 Bug（一行改动 + 测试修正）后即可通过，三个次要问题建议顺手一并处理。
