发现一个可复现的严重 Bug，以及几处次要问题。

【严重】portrait3D.js：destroy() 与沉浸预览关闭的竞态导致全屏透明遮罩永久残留，页面输入被完全锁死。复现路径：用户长按卡牌 1.5s 打开沉浸预览（backdrop 挂在 document.body）→ 切走浏览器标签页再切回 → visibilitychange 触发 GameUI._onVis() → refresh() → renderTab()（app.js:134/5290 附近）→ this._portrait.destroy()。destroy() 先调用 _immersive.close()，close() 在 portrait3D.js:311-312 把「260ms 后移除 backdrop」的 timer push 进 this._timers；随后 destroy() 的 for (const t of this._timers) clearTimeout(t) 恰好把这个刚 push 的 timer 清掉，backdrop 永远留在 body 里。该元素为 position:fixed; inset:0; z-index:200 且未设置 pointer-events:none（style.css 中 .portrait__immersive 无此项），close() 又已移除自身的 click 监听，结果是一个不可见却拦截全部指针事件的遮罩——整个游戏点不动，只能刷新页面。同理，用户正常点击关闭后的 260ms 过渡窗口内若发生任何重渲染（afterAction/renderTab），也会命中同一问题。修复建议：close() 在被 destroy 调用的场景下同步移除 backdrop（例如 destroy() 里在清理 _timers 之前直接 if (backdrop.parentNode) backdrop.remove()），或给 .portrait__immersive 加 pointer-events:none 并由内层 stage 承接点击；任选其一即可阻断该状态。

【次要】animationSystem.js:2537-2547：眨眼 setInterval 每次触发都把一个 setTimeout 句柄 push 进 timers 且从不清理，数组随会话时长无界增长（约每张 SR/SSR 卡每小时 +600 条）。建议在 setTimeout 回调里自行从数组移除，或改用 eyes.classList 定时操作复用单个句柄。内存量级很小，属代码卫生问题。

【次要】battle-scene.js:5410：战场剪影光环用 playerCard.rarity（卡牌基础稀有度），而卡面用 effectiveRarity(inst)（进化可升档）。进化后的卡在战斗中的稀有度光环会与卡面不一致。如属有意（战斗侧拿不到 instance）可接受，建议加注释说明。

【次要】style.css：SSR 卡的 .portrait__card.dyn-2 .portrait__fx::after（流光）与 .portrait__fx.is-affinity::after（花瓣）选择器冲突，前者特异性更高，SSR 满好感时右侧花瓣效果会被流光覆盖不显示。纯视觉问题。

其余方面：inkParticles 的 rAF/降级/destroy 路径、burstInk 句柄回收、_deferStreamResize 的 ResizeObserver、app.js 对 _portrait 的三处销毁点、battle init 事件扩展（向后兼容，cls/ref 仅新增字段）均无问题；logic-test.mjs 208 项全部通过（含新增 portrait 断言，覆盖了驼峰/蛇形字段回退路径）。修掉第一个问题即可通过。
