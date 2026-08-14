DECISION: REQUEST_CHANGES
COMMENT: 第 2 轮逐行复核：上轮三项问题（array 硬编码垂发、体修武器层级遮挡、剑修悬空手）已通过 hairBack / weaponBack+weapon 双层 / handR 槽位正确修复，R009 短发、SR004 灰白长发、R003 锤盾分层、R007 扛剑握持均验证通过。但本轮新引入/遗留两处缺陷：

1.【必改·默认盾泄漏】SSR001 蚩尤残魂（base: 'body'）覆写了 weapon（巨斧走前层），但漏了覆写 weaponBack——BODIES.body 的默认值 WEAPON_SHIELD（x≈29-51, y≈90-129 的负后圆盾）仍会渲染在其背后。持巨斧的战神残魂背后莫名多出一面默认圆盾，与「牛角盔碎暗金魔甲，持巨斧」设定冲突。修复方明确知悉该槽会泄漏（R005 已注释「石拳套力士不佩盾：显式去掉躯体默认的负后圆盾」并置 weaponBack: ''），却漏掉了同 base 的 SSR001。请在 SSR001 设定中补 `weaponBack: ''`。

2.【必改·缺 CSS 基础规则】`.ca-blade-fire` 只有 is-sil 剪影覆写（style.css:874），没有任何基础 fill/stroke 规则。正常渲染下 SR002 赤霄剑尊的「赤红巨剑」剑身将回退为 SVG 默认黑色填充，直接违背「赤红巨剑（火焰缠绕）」设定。需补一行如 `.char-art .ca-blade-fire { fill: #c23b22; stroke: #8a2a1e; stroke-width: 1; }`。

其余核对通过：15 个 CHAR_SPECS 与 cards.js 的 id/cls 一一对应且 base 与职业一致；JS 中使用的部件类均已交叉核对，除 ca-blade-fire 外全部有基础规则且 is-sil 塌缩覆盖完整（ca-talisman-ice 经子选择器覆盖、ca-rune-d 继承 ca-rune）；charArt.js 模块可正常加载，导出完整（charFigure/charBust/charArtVars）；charFigure(def) 的 def 含 id/cls 字段，spec 查找有效；.art-panel 布局及 560px 断点无问题；不涉及 CI/CD 或 workflows，无需人工介入。

两处均为一两行的小修复，修完即可合入。
