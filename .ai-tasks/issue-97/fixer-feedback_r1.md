逐行核对了 charArt.js 的 BODIES/CHAR_SPECS 组装逻辑、style.css 的着色与 is-sil 塌缩规则、app.js 的接入点，发现以下问题：

1.【逻辑缺陷·必改】BODIES.array 的躯体开头硬编码了两条侧长发 ca-hair-b（charArt.js 中 `array: (s) => ...` 的前两行 path），没有走 slot() 覆写机制。后果：R009 飞羽散修的设定是「短黑发 + 羽簪」，其 hair 槽覆写只替换了头顶层，但这两条垂至 y=110 的长发仍然渲染在背后，与设计稿「短黑发」直接矛盾，也破坏了注释宣称的「角色设定可逐槽覆写」契约。这两条 path 应当挪入 array 的默认 hair 槽（或包一层 slot(s,'hairBack',...)），使 R009/SR004 能显式控制。请修复。

2.【层级隐患·建议修复】BODIES.body 把 weapon 槽放在袍服（ca-robe）之前绘制（沿袭原盾牌负于身后的画法）。这对默认盾没问题，但 R003 的铁锤、SSR001 的巨斧也走该槽：SSR001 左侧斧刃（x≈88-111，y≈58-80）与 R003 锤头左缘会被躯干/右臂遮挡一部分，SSR「持巨斧」的画面表现打折。建议 body 躯体将 weapon 拆为 back-weapon / front-weapon 两个槽，或把斧/锤类武器移到袍服之后绘制。

3.【小问题】BODIES.sword 无条件绘制右手握剑位的手（cx=105.5 cy=100），R007 流火散修 weapon 覆写为空串（剑扛肩）后，这只手悬空握在原剑柄位置，仅恰好贴近背上的剑尾，属于侥幸对位。建议该手也纳入 weapon 槽或单独成槽。

4.【核对通过的点】slot('') 显式去层的语义一致；CHAR_SPECS 15 个 id（R001-R009/SR001-SR004/SSR001-002）与 issue 设定一一对应无遗漏；charArtVars 对 card 为空的防御（`card && card.id`）正确；is-sil 剪影模式对新部件（ca-ear/ca-horn/ca-tail/ca-eye-red/ca-halo 等）的 fill/stroke 塌缩覆盖完整，未发现漏网部件；ca-fore-bare 的 stroke-width 9 裸臂在 is-sil 下正确转为 stroke 着色；CSS 变量 --hair/--hair-l 缺省回退墨黑，不影响无设定卡。

5. context.md 的改动仅是删减 AI 提示词正文，无代码影响；style.css 的 .art-panel 布局含 560px 移动端断点，无问题。不涉及 CI/CD 或 workflows。

综上：第 1 点是与本次 issue 目标（15 人 15 面、按设定逐人预置）直接冲突的功能性缺陷，必须修复后再合入；第 2、3 点建议一并处理。
