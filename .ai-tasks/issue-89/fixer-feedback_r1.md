整体质量很高（132 逻辑测试 + 29 DOM 冒烟全过，vite build 干净通过，模块划分与兄弟应用一致），但存在一个核心被动的实现 Bug，按严格标准需修后再合。

【必须修复 · 中等 Bug】狂暴（enrage）被动不会随持续时间复原，且可叠加膨胀。
位置：apps/ling-xu-wen-jian-lu/src/core/battle.js 的 act() 与 endRound()。
act() 触发狂暴时直接永久改写 c.baseAtk / c.baseDef（`c.baseAtk = Math.round(c.baseAtk * (1 + amount))`），仅用 `_enrageDur` 记时长，但 endRound() 里 `c._enrageDur -= 1; if (<=0) c.enrageActive = false` 只把标志位清掉，并未把已提升的 baseAtk/baseDef 还原。后果有二：
1) 设计稿要求「血<30% 时全属性翻倍，持续 2 回合」，实际变成了永久翻倍（直到战斗结束）。
2) 由于只有 enrageActive 过期、属性未还原，当 SSR001（蚩尤残魂，amount=1.0、dur=2）持续滞留在低血线时，每 2 回合会再次满足 `!enrageActive && hp<阈值` 而二次触发，攻击力被反复 ×2，形成指数级膨胀。Boss 用 dur=99 在 60 回合上限内不会暴露，但玩家 SSR 卡会。
建议：触发时记录增量（或在 curAtk/curDef 里用临时 buff 通道乘算），endRound 到期时减回，并保证不重复触发；另外那行 `c.buffs.push({ stat:'atk', amount:0, dur })` 是 0 增益占位、毫无作用，可删。

【建议修复 · 轻微】治疗附带的增益目标不一致。
battle.js 的 act() case 'heal' 中，target='ally_lowest' 时先 healUnit(pickLowestAlly())，随后 effect 又调用 pickLowestAlly() 取目标——但此时最低血盟友因刚被治疗 hp 已上升，可能选中另一位，导致「瑶池仙露（单体大治疗+攻击+50%）」把奶和治疗增益分给了两个不同单位。应缓存同一个 target 引用再奶再上 buff。

【建议 · 轻微】stepRound 的出手排序用了非确定性比较器。
`all.sort((a,b) => initiative(curSpd(b),r) - initiative(curSpd(a),r))` 在比较器内每次都重新抽取随机数，违反 sort 比较器的传递性/一致性要求，理论上可能得到非预期的出手顺序。应先 map 出每个单位的 initiative 值（一次定值），再按值排序。

【可选 · 轻微】十连保底为「累加式」：drawTen 末张升 SR 时保留原 R 卡实例并额外给 SR，仅把 stats.r 减 1、stats.sr 加 1，与「10 抽里至少 1 张 SR」的字面语义有出入且统计口径略有偏差。属设计取舍，可保留，但建议在注释里写清是「额外补偿」而非「替换」。

其余：五行相克（金克木/木克土/土克水/水克火/火克金）自洽且与设计稿一致；伤害/保底/突破/升星/保底 SSR(90)/保底 SR(30) 数值链路均正确；存档导入用 try/catch 安全降级，无 eval/XSS 风险；runBattle 有 60 回合保护、日志有 120 行截断，无性能或死循环隐患。未触及 .github/workflows，无需人工处理 CI/CD。
