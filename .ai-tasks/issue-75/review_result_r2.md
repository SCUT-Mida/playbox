DECISION: REQUEST_CHANGES

COMMENT: 第 2 轮修复只覆盖了「装备 / 丢弃」两个按钮路径，遗漏了第三条关闭路径——点击遮罩（backdrop）关闭弹窗。该 Bug 属于第 1 轮同类缺陷的残留，我已用 jsdom 脚本稳定复现（退出码 2）。

【主要 Bug：装备宝箱弹窗经「点击遮罩」关闭后，陈旧交互态仍可重放已删除实体】
- 证据链（apps/xing-hai-lv-zhe/src/ui/app.js）：
  - offerGear() 调用 showSheet({ title, body, foot })（1257 行）未传 dismissable，故取默认值 dismissable=true（showSheet 形参 1365 行）。
  - showSheet 生成的遮罩：const overlay = h('div', { class:'sheet-overlay', onClick: () => { if (dismissable) this.closeModal(); } })（1375 行）。
  - closeModal()（1384 行）只 clear(modalRoot) + 置 _sheet=null + 处理战斗计时顺延，并不重置 this._interactMode，也不调用 refreshInteract()。
- 复现结果（确定性 rng=0.4，注入相邻装备宝箱 → 踩上去触发 offerGear → 点击 .sheet-overlay 关闭）：
  - 关闭后 _interactMode 仍为 {"mode":"pickup","ent":{...已 removeEntity 的宝箱...}}；
  - 交互键文案仍为「🎁 拾取宝箱」；
  - 再次点击交互键 → doInteract → resolveEntity(陈旧 ent) → ent.gear 真值 → offerGear 再次弹出，.gear-drop 重现为 true。
- 也就是说：踩到装备宝箱 → 点弹窗外部空白处关闭 → 中央交互键仍停在「拾取宝箱」→ 再点一次，同一件已被移除的装备又被弹一次。正是第 1 轮要求根除的「return true 类实体被重放」问题，只是触发改成了遮罩点击。
- 注：实体已 removeEntity 且已 saveToSlot，所以重放的是同一件装备对象，无法刷出无限不同 loot；危害等级为低-中（陈旧交互态 + 已删实体可重触发），但确属逻辑缺陷，且修复成本极低。

【建议修复，任选其一（均不涉及 CI/CD，无需人类改 workflow）】
1) 最小且贴合既有模式：给 offerGear 的 showSheet 传 dismissable:false，强制玩家在「装备/丢弃」二选一（与 957 行结局抉择 sheet 用 dismissable:false「避免软锁」一致）；这两条路径本轮已正确补了 refreshInteract()，即可彻底封死。
2) 或更彻底（即第 1 轮建议 #2）：在 closeModal() 内，当从非 battle 屏幕关闭 sheet 时统一 this._interactMode=null 并在 game 屏重算交互键，一次覆盖所有「return true 类实体」未来的同类隐患。

【回归测试缺口】
smoke-dom.mjs 第 7b 节只驱动了「装备」「丢弃」两条按钮路径，未覆盖「遮罩点击关闭」路径，故该缺陷未被现有用例拦截。建议补一条用例：弹窗出现后 .sheet-overlay.click()，断言 _interactMode.mode === 'investigate' 且再次点击交互键不重现 .gear-drop。

【第 1 轮遗留的可选项，仍非阻断，供参考】
1) descendFloor() 跨星球分支 this.toast(`跃迁至…`) 与 showGalaxy({travel:true}) 的标题「🛰️ 跃迁完成」/副标题语义重复，可去其一。
2) 新怪 reaver（atk 19）在楼层加成下第 9 层攻击可达 21，高于终 Boss 星骸之核（atk 20），仅平衡提示。
3) planetStatus() 在 maxFloor=10（已击败 Boss）后仍把 core 显示为「探索中」，属通关后边界观感问题。

【肯定项】
- 「装备/丢弃」按钮路径的 refreshInteract() 补丁正确，逻辑测试 123/0、DOM 57/0、flee-timer 18/0 全绿；statForSlot 与 equipGear 数值一致性、planetFor/planetStatus 边界退化、新增 tile/enemy/gear 的 clamp 兜底与存档 migrate 均无问题。
- 唯独遮罩关闭这一条路径未被覆盖，建议合并前补上，故本轮 REQUEST_CHANGES。
