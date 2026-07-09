审查完成。我已通读全部变更、三套既有测试全部通过（51/123/18），并额外编写了针对星图跃迁流程与装备掉落的验证脚本（19/19 通过，含 420 次装备数值预测对照、跨星球下行 3→4 触发跃迁、同星球 4→5 不触发）。在此基础上发现一个可复现的逻辑 Bug。

DECISION: REQUEST_CHANGES
COMMENT: 发现一个可复现的逻辑缺陷（中等偏低危，但确属 Bug，修复极简单），另有几处可选打磨项。本意见不涉及任何 CI/CD 或 .github 改动，无需人类改 workflow。

【主要 Bug：装备宝箱会因陈旧的交互态被“重复开启”】
位置：apps/xing-hai-lv-zhe/src/ui/app.js
- resolveEntity() 的装备宝箱分支在 offerGear 后 return true（约 540-550 行）。由于返回 true，walkPath() 会直接 return，跳过其末尾的 refreshInteract()（见 510-530 行：if(this.resolveEntity(ent)) return;）。
- 而在装备宝箱流程中，walkPath 在调用 resolveEntity 之前已经 refreshInteract() 过一次，把 this._interactMode 设成了 { mode:'pickup', ent:<该宝箱实体> }。
- 随后 takeGear()（1268-1277 行）与“丢弃”按钮的 onClick（1262 行）在 closeModal() 之后都只调用 refreshStatus()，并未调用 refreshInteract()，也未清空 this._interactMode。

后果（我已用脚本复现，sheets 数量 0→1）：玩家踩到装备宝箱→弹窗→点“装备”/“丢弃”关闭后，中央交互键文案仍停留在“🎁 拾取宝箱”，_interactMode 仍指向那个已被 removeEntity 删除的宝箱实体。此时再点一次交互键，doInteract() 会以 pickup 模式对该已删除实体再次调用 resolveEntity()——因为 ent.gear 仍为真值，offerGear() 会再次弹出同一件装备的穿戴弹窗。即一个被移除的实体仍能被反复触发。

为何同类流程只有这里出问题（供定位根因）：
- 普通奖励宝箱 resolveEntity 返回 false，walkPath 会继续走并执行末尾 refreshInteract，状态会刷新，安全。
- 记忆回响同样 return true 且关弹窗后不刷新，但它由 collectMemory 的“已收集即 ok:false”兜底，重复点击是空操作，所以无害。
- 商人/无人机 return true 但实体不移除，重复打开属正常；陷阱 teleport() 末尾自带 refreshInteract。
- 唯独“装备宝箱”=返回 true＋实体被移除＋重放无幂等保护，三者叠加才暴露。

建议修复（任选其一，倾向第 1 种，最小且贴合现有模式）：
1) 在 takeGear() 成功分支末尾，以及“丢弃”按钮 onClick 的 closeModal() 之后，各补一行 this.refreshInteract()（与 teleport() 的做法一致）。
2) 或更彻底：在 closeModal() 内，当从非 battle 屏幕关闭 sheet 时统一 this._interactMode = null 并在 game 屏重算交互键，避免所有“return true 类实体”未来再踩同样的坑。

【可选打磨项，非阻断】
1) descendFloor() 跨星球分支里 this.toast(`跃迁至…`) 与随后 showGalaxy({travel:true}) 的标题/副标题语义重复，可去掉其中一处。
2) 新怪 reaver（atk 19，minFloor 7）在楼层 tier 加成下，第 9 层攻击可达 21，高于终 Boss 星骸之核（atk 20）。属本次 issue 要求的“怪物更多样/更有压力”范畴，仅作平衡提示，非代码缺陷。
3) planetStatus() 在已击败 Boss（maxFloor=10）后仍把 core 显示为“探索中”，属通关后的边界观感问题，仅影响结局画面前的极少数路径，可不处理。

【肯定项】
- 装备数值预测 statForSlot() 与实际 equipGear() 后的 effectiveAtk/Def/MoveRange 完全一致（420 次对照 0 偏差），词缀丢失（+5 keen/guard/swift）已正确纳入比较。
- planetFor/planetStatus 边界（1/3/4/6/7/9/10）正确，退化回退到位。
- 新增 tile/enemy/gear 均为纯加法，加权与下标均经 clampUnit 兜底，无越界风险；存档 migrate 对新字段形状兼容；无安全或性能问题。

综上：主要 Bug（装备宝箱陈旧交互态导致已删除实体被重放）建议在合并前修复，故本轮 REQUEST_CHANGES。
