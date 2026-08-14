DECISION: REQUEST_CHANGES
COMMENT: 审查完毕（已通读全部 diff，并在仓库中核对了 battle.js / app.js / style.css 上下文，运行 scripts/logic-test.mjs 结果 206 通过 0 失败）。存在 1 个功能性 Bug 和若干次要问题：

【Bug 1（主要，必须修复）】SSR 水墨粒子背景实际不可见。portrait3D.js 的 mount() 在 canvas 尚未插入 DOM 时调用 createInkStream()（buildCardStage 返回 wrap 之后才由 renderCultivate append 到 contentEl）。此时 inkParticles.js 的 resize() 中 getBoundingClientRect() 为 0，attribute/clientWidth 回退也均为 0，于是 canvas.width/height 被设为 1，粒子全部绘制在 1×1 的 backing store 上（坐标 0~120 全部落在画布外）。而 resize() 方法在整个代码库中没有任何外部调用者（无 ResizeObserver、无插入后二次 resize），因此 SSR 的常驻粒子流（设计稿 2.3 核心卖点）以及 celebrate() 对 SSR 卡的 burst() 冲天墨粒在真实浏览器中永远渲染不出来——测试全绿只是因为 jsdom 里本来就降级。建议：mount() 返回后在 requestAnimationFrame 中补一次 resize，或接入 ResizeObserver，或延迟到 isConnected 时再初始化。

【Bug 2（次要）】长按 1.5s 打开沉浸预览后，pointerup 仍会派发 click；此时 moved === 0，通过 `if (this._dead || moved > 6) return` 守卫，导致 _strike() + _showPoem() 在全屏遮罩背后额外触发 toast 和诗词弹层。建议在 _openImmersive 后置标志（如 suppressClick）或在 end() 中消费掉。

【Bug 3（次要）】_openImmersive 的 cloneNode(true) 复制了 SSR 粒子 canvas，但 clone 的画布是空白的（绘制内容不会随 clone 复制，也没有为新 canvas 重建 ink stream），沉浸预览模式下“全动态”效果丢失，只剩静态分层。

【次要 4】destroy() 先清空 this._timers 再调用 this._immersive.close()，close 内部 push 进 _timers 的 260ms 收尾 timer 不再受管；虽然能自行移除 backdrop，但时序上脆弱，建议 close 改为同步移除或先 close 再清 timer。

【次要 5】portrait-shake 关键帧硬编码 rotateY(16deg)，若用户拖拽到其他角度后触发 celebrate，会先跳回 16 度再震动，视觉跳变。

【次要 6】_bursts 数组只增不减（burstInk 自毁后对象仍留在数组里），长时间会话下轻微累积，无实质泄漏但建议在 destroy 时或 burst 结束后清理。

其余方面：config.js 的 CLASSES/RARITY_PORTRAIT/portraitLayers 纯数据无逻辑问题；battle.js 的 init 事件正确透传 cls/ref（buildCombatant 原本已有 ref 字段，已核实）；cards.js 15 张卡均补齐 poem/voiceQuote/silhouetteColor 且测试覆盖；战斗剪影 renderSilhouette 的降级路径安全；CSS 变量（--paper/--r-SR/--gold 等）均已存在；删除 app.js 的 shade() 后无残留引用。未发现安全问题；无 CI/workflows 改动需求。修复 Bug 1（及最好一并 Bug 2）后可通过。
