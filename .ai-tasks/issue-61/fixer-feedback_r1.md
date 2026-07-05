整体实现扎实（分层、转义、容错、测试都到位），但存在以下需要处理的问题，按严重度排序：

【1·真实 Bug｜中】apps/da-ka/src/ui/app.js — `cssEscape()` 是个空操作（直接 `return String(s || '')`），但其注释「attribute selector 需引号包裹，无需额外转义」是错的。`_onSheetRename`/`_onSheetDelete` 用模板字符串拼出 `[data-key="${cssEscape(key)}"]`，而 `normalizeKey` 只做 trim/空白转下划线/小写，并不剔除 `"`、`\`、`]` 等字符。当用户昵称含这些字符（例如 `"明星"`、`a\b`、`[已退役]`）时，读回的 `dataset.key` 再拼进选择器会得到非法 CSS 选择器，`querySelector` 直接抛 `SyntaxError`，且外层无 try/catch → 改名/删除按钮静默失效（用户点了毫无反应，仅控制台报错）。修复：要么对 key 调用 `CSS.escape`（现代浏览器均支持），要么改用 `data-key` 遍历 + `el.dataset.key === key` 比对，不要把用户态字符串拼进选择器。

【2·可访问性｜中】apps/da-ka/index.html — `<meta name="viewport" ... maximum-scale=1, user-scalable=no>`。禁用用户缩放违反 WCAG（视障/老花用户无法放大阅读），是业界明确不推荐的做法。建议改为 `width=device-width, initial-scale=1, viewport-fit=cover`。

【3·健壮性｜低】destroy() 只清理了 `_toastTimer`，未清理 `_celebrateTimer`；`_closeSheet`（200ms）、`_endCelebrate`（300ms）、`_toast`（250ms）内部的匿名 setTimeout 也未跟踪。落地页若在庆祝/动画进行中切走游戏而调用 destroy，定时器仍会回调到已销毁实例。虽然各处有 `el.parentNode` / `this._toastHost` 判空兜底不致崩溃，但属资源/状态清理缺口，建议 destroy 中显式 `this._endCelebrate(true)` 并关闭 sheet。

【4·测试质量｜低】apps/da-ka/scripts/smoke-dom.mjs 第 6 节「翻月」断言写作 `ok(/最新月份/.test(...) || true, ...)`，`|| true` 使该断言恒为真，等于没测——给了虚假的覆盖信心。应去掉 `|| true` 并真正校验 toast 文案/视图未跳到未来月。

【5·UX/逻辑｜低】`toggleCheckin` 中 `milestone = set.size % HEARTS_STEP === 0` 仅看「加到 10 的倍数」。当用户在第 10 天后取消某日（→9）又补打另一过去日（→10），会再次触发庆祝并提示「收获第 1 颗爱心」——对已解锁的爱心重复庆祝。建议仅当 `heartsEarned` 真正递增（新旧爱心数差 > 0）时才庆祝。

【6·健壮性｜低】`_applyToggle` 先 `this.profile = profile` 再 `upsertProfile(profile)`；若写入因配额/隐私模式失败（`saveAll` 捕获异常返回 false），内存态已切换但持久化未落盘，重载即回退，且用户无任何提示。建议检查 `upsertProfile` 返回值，失败时 toast 提示「存储写入失败」。

其余方面（XSS：nickname/key/avatar/改 名输入均经 `esc`；表单 submit 与 click 的 preventDefault 防止跳转；DST 用 Math.round 处理 diffDays；日期溢出回检 parseISO；migrate 兜底损坏存档）均无问题。以上均为应用内代码缺陷，无需改动 .github 下的 CI/CD 配置，请人类开发者直接在本 PR 内修复。
