/claude-fix 🛠️ **请立即根据以下审查意见修改代码：** \n\n> 以下是第 3 轮审查未通过的意见：\n\n 第 3 轮审查。本 PR 在「按钮点不到」根因（GameOverScene 命中区脱离缩放面板、UIScene 解绑 state 监听、GameScene once('shutdown')、溢出修为结转）上修复得相当到位，新增 20 关/5 槽存档/演武场/仙侠头像的数据校验我也逐一核对无误（enemies.js 中 boss_zhangjiao/lvbu/yuanshu/yuanshao/caofleet/machao/sunquan/simayi/menghuo 全部存在；LEVEL_LIST(20) 与 LEVEL_REWARD(20) 完全对应；h() 支持 html 属性；portraitDef 返回的 pt 带 gender/tag，男女头像可正确区分）。但存在 1 个必现的视觉/资源泄漏 Bug，必须修复：

【必改 · 阻断】apps/ding-zu-san-fen/src/scenes/SlotScene.js `_confirmDelete` / `mkBtn`（约 171-196 行）：
mkBtn 内 `const cont = this.add.container(width/2+lx, height/2+ly).setDepth(92)` 把按钮「视觉容器」直接挂到了场景显示列表，却只 `return z`（命中区）。_closeConfirm 只销毁 overlay、panel(true)、zones，**完全没有销毁这两个 cont**。结果：每次打开→关闭「删除存档」确认框，「取消 / 确认删除」两个按钮的视觉（含底色 graphics + 文字）就作为孤儿残留在屏幕中央、深度 92 浮在存档列表之上；再开一次再叠一对，越积越多。
修复：让 mkBtn 返回 { cont, zone }（或把 cont 也加入一个待清理数组），_closeConfirm 连同 cont 一起 destroy。参照同文件 _buildCard 已有的 { cont, zone, del, delBtn } 回收范式即可。

【建议 · 非阻断】
1. src/main.js prefetch：`try { def.loader() } catch` 无法捕获动态 import 返回的 Promise 的异步 rejection（try/catch 只抓同步异常），预取失败会变成 unhandled rejection。应改为 `def.loader().catch(() => {})`。另外 requestIdleCallback 里对全部 GAMES 预取会一次性拉取所有游戏分片，实质抵消了代码分割；建议只预取「首屏可见 + 已悬停」的，或加个数量上限，避免首屏后带宽/内存峰值。
2. ArenaScene：单次演练内无回合上限，rosterPower 固定、敌军仅按 1.32^round 递增，高战力玩家可在一日内通过 3 次演练刷取远超关卡首通收益的金币（roundGold 随 round 线性增长）。虽受指数增长自限、非死循环，但属于数值平衡隐患，建议给单次演练设回合/金币上限。
3. meta.js deleteSlot：删除「当前活跃槽」时会 saveMeta() 写入一份 defaults，使该槽在 listMetaSlots 中显示为「第 N 槽·主公府（0 金）」而非「空档位」，与「删除」语义不一致；建议删除后让其真正变空（empty）。
4. portrait.js：gid = `pg_${tag}_${gender}_${size}` 作为 <radialGradient>/<clipPath> 的 id，同一 tag/gender/size 的多张头像会在文档内产生重复 id（非法 HTML）。因同 id 渐变定义一致，视觉暂无错乱，但建议在 id 中加入随宿主变化的因子或索引以合规。

未涉及任何 .github/workflows 等 CI/CD 配置，无需人类手动处理。修复上述第 1 项阻断问题后可进入下一轮。
