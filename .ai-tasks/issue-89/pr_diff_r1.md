diff --git a/.ai-tasks/issue-89/ai-coder-prompt.md b/.ai-tasks/issue-89/ai-coder-prompt.md
new file mode 100644
index 0000000..5c80b7a
--- /dev/null
+++ b/.ai-tasks/issue-89/ai-coder-prompt.md
@@ -0,0 +1,8 @@
+你是一个资深开发者。请解决以下 GitHub Issue：
+【任务标题】: 新增一个《灵墟·问剑录》游戏
+【详细需求】: 请直接阅读当前目录下的 .ai-tasks/issue-89/context.md 文件获取。
+
+【⚠️ 严格红线规则】：
+请绝对不要修改、重命名或生成 .github/ 目录下的任何文件 (特别是 workflows 等 CI/CD 配置)，这会破坏项目的自动化流程！如果觉得有必要修改，请在回复中用文字建议人类去改，绝不要自己动手改。
+
+请直接分析并修改项目中的代码文件来解决这个问题，不要做过多的文字解释。
diff --git a/.ai-tasks/issue-89/context.md b/.ai-tasks/issue-89/context.md
new file mode 100644
index 0000000..7661f1f
--- /dev/null
+++ b/.ai-tasks/issue-89/context.md
@@ -0,0 +1,290 @@
+
+《灵墟·问剑录》整体设计方案（完整版）
+
+一、核心玩法循环（全局总览）
+
+```
+┌─────────────────────────────────────────────────────────────┐
+│                    每日/每周活跃任务                        │
+│    （签到、扫荡、秘境探索、洞府收菜）                       │
+└──────────────────────┬──────────────────────────────────────┘
+                       ▼
+            ┌─────────────────────┐
+            │   问道（抽卡系统）   │  ← 消耗“问道令”
+            │  R 70% / SR 25% / SSR 5%│
+            └──────────┬──────────┘
+                       ▼
+            ┌─────────────────────┐
+            │   养成（修炼系统）   │  ← 消耗灵石/修为丹/天道本源
+            │ 升级→突破→升星→功法  │
+            └──────────┬──────────┘
+                       ▼
+            ┌─────────────────────┐
+            │   战斗（主线+秘境）  │  ← 五行克制 + 阵型站位
+            │  胜利→掉落资源/碎片  │
+            └──────────┬──────────┘
+                       ▼
+             更高难度关卡解锁 → 更稀有资源 → 培养SSR
+                       │
+                       └──────（循环闭环）─────────────────────┘
+```
+
+二、卡牌预设库（基础15张 + 扩展位）
+
+开服版本共 15张 基础卡牌，保证玩法完整但不臃肿。后续版本可扩展至30+张。
+
+2.1 R卡（9张）—— 逸品·青玉
+
+ID 姓名 五行 职业 攻 防 血 速 主动技1 定位说明
+R001 青竹剑侍 木 剑修 75 40 320 70 竹影三叠（单伤120%） 新手输出
+R002 赤焰灵狐 火 符修 60 35 280 85 狐火灼烧（单伤100%+灼烧2回合） 持续消耗
+R003 玄龟甲士 水 体修 30 85 520 30 龟甲护盾（自盾+嘲讽） 新手坦克
+R004 金戈锐士 金 剑修 85 45 300 65 金戈破阵（单伤140%） 单体爆发
+R005 厚土力士 土 体修 40 80 500 30 撼地践踏（群伤60%+减速） 控制坦克
+R006 柳叶医仙 木 丹修 30 50 350 60 回春术（单奶120%） 基础治疗
+R007 流火散修 火 剑修 70 40 300 75 烈焰斩（单伤110%） 火系输出
+R008 霜月散修 水 符修 55 45 320 70 寒冰咒（单伤90%+冻结1回合） 控制辅助
+R009 飞羽散修 金 阵修 50 40 300 80 聚灵阵（全队攻+10%，2回合） 基础辅助
+
+2.2 SR卡（4张）—— 绝品·紫金
+
+ID 姓名 五行 职业 攻 防 血 速 主动技1 主动技2 被动技
+SR001 白鹤仙子 水 丹修 65 55 450 65 云鹤回春（全奶100%） 甘霖普降（全奶80%+净化） 鹤羽护体（受治疗+15%）
+SR002 赤霄剑尊 火 剑修 110 50 400 72 赤霄九式（单伤180%） 燎原斩（群伤120%） 剑心通明（暴击率+10%）
+SR003 玄冥蛇姬 土 符修 80 60 480 60 毒雾弥漫（群伤80%+中毒） 石化之瞳（单控，沉默2回合） 蛇鳞反噬（受击反伤15%）
+SR004 青莲道尊 木 阵修 55 70 500 55 青莲法阵（全队防+20%） 灵气汇聚（单充能，技能CD-1） 道法自然（自身效果抵抗+20%）
+
+2.3 SSR卡（2张）—— 至品·彩凰
+
+ID 姓名 五行 职业 攻 防 血 速 主动技1 主动技2 被动1 被动2 觉醒技
+SSR001 蚩尤残魂 火 体修 120 100 900 50 九黎战吼（群伤150%+自身无敌1回合） 魔化之躯（自回血20%+攻击+30%，3回合） 兵主威压（开场敌方全属性-5%） 不屈战魂（濒死复活1次，恢复30%血） 兵主降临（血<30%时全属性翻倍，持续2回合）
+SSR002 瑶池圣母 水 丹修 70 90 800 60 天水净世（全奶150%+清除所有debuff） 瑶池仙露（单奶200%+攻击+50%，3回合） 慈航普度（全队受治疗+20%） 水月镜花（受致命伤害时免疫并回血30%，1次/战） 天泽万物（阵亡时全队复活并恢复50%血，1次/战）
+
+开服总计：9张R + 4张SR + 2张SSR = 15张，已覆盖五行全属性、五大职业全定位。
+
+三、关卡地图设计（主线 + 秘境）
+
+3.1 主线剧情·十二卷章
+
+一共 12章，每章7个关卡（5普通 + 1精英 + 1首领），共计 84个战斗节点。
+
+章节 名称 推荐战力 首领Boss 五行倾向 核心掉落
+卷壹 初入灵墟 500 守阵石灵（土） 土 灵石·小、R碎片
+卷贰 青云古道 800 风吼兽（木） 木 修为丹·小、R碎片
+卷叁 赤焰峡谷 1200 熔岩巨蜥（火） 火 灵石·中、SR碎片(低概)
+卷肆 寒潭幽境 1700 冰魄蛟龙（水） 水 突破石·小、R碎片
+卷伍 金戈铁壁 2300 机关战傀（金） 金 功法残页·小
+卷陆 万木回廊 3000 古树妖皇（木） 木 灵石·中、SR碎片
+卷柒 地煞迷宫 3800 地煞魔猿（土） 土 突破石·中
+卷捌 天火熔炉 4700 朱雀残羽（火） 火 功法残页·中
+卷玖 玄水冰窟 5700 玄武虚影（水） 水 天道本源·碎片
+卷拾 太初剑冢 6800 万剑之灵（金） 金 SR碎片、SSR碎片(极低)
+卷拾壹 混沌虚空 8000 虚空吞噬者（暗/无） 无 天道本源·整
+卷拾贰 天道归墟 9500 蚩尤残魂（完全体） 火 SSR碎片、限定称号
+
+关卡难度公式：每关怪物战力 = 推荐战力 × (0.8 ~ 1.2 随机波动)，Boss为推荐战力的 1.5倍。
+
+3.2 秘境探索（Roguelike肉鸽爬塔）
+
+独立于主线的无限挑战模式，每次进入重置，关卡随机生成。
+
+· 层数：每10层为一个“重天”（共九重天，即90层），每重天守关Boss不同。
+· 节点类型（每层随机出现1个）：
+  事件 概率 效果
+  妖物盘踞（战斗） 40% 战胜获得灵石/碎片
+  上古宝箱 20% 免费获得随机资源或低阶卡牌
+  风水奇遇 15% 全队回满血或随机属性+10%
+  秘境商人 10% 用灵石兑换稀有材料
+  天道试炼 10% 高难战斗，胜后必得SSR碎片
+  心魔之劫 5% 镜像挑战（复制我方阵容），胜后全属性+5%永久
+· 爬塔奖励：每5层发放一次“秘境宝箱”，层数越高，开出SR/SSR碎片的概率越高。
+· 单机存档：每10层自动存档，退出游戏后可从当前层继续。
+
+3.3 每日试炼（资源副本）
+
+副本名 开放日 掉落 次数限制
+灵石矿脉 每日 海量灵石 3次/日
+问道仙台 周一/三/五 问道令 3次/日
+功法阁 周二/四/六 功法残页 3次/日
+突破秘境 周日 全属性突破石 3次/日
+
+四、战斗系统详细设计（2.5D回合制）
+
+4.1 战场布局（2.5D等距棋盘）
+
+```
+        后排（3号位·辅助/治疗）
+      前排（1号位·坦克）  前排（2号位·输出）
+          后排（4号位·输出/控制）
+        后排（5号位·辅助/治疗）
+```
+
+· 1号位（主坦）：受击概率 +30%，优先承受单体伤害。
+· 2号位（副坦/输出）：受击概率 +10%。
+· 3/4/5号位：受击概率正常。
+
+4.2 出手顺序
+
+按 速度值 + 随机浮动（±5%） 决定出手顺序，每回合重新计算。
+
+4.3 五行克制（核心策略）
+
+攻击方 \ 防守方 金 木 水 火 土
+金 0% +30% 0% 0% -15%
+木 -15% 0% 0% 0% +30%
+水 0% 0% 0% +30% -15%
+火 0% 0% -15% 0% 0%
+土 0% -15% 0% 0% 0%
+
+克制 +30%伤害，被克制 -15%伤害。同属性无加成。
+
+4.4 伤害计算公式（核心）
+
+```
+最终伤害 = （攻击方攻击力 × 技能倍率 - 防守方防御力 × 0.5）
+          × 五行克制系数（0.85 ~ 1.30）
+          × 暴击系数（暴击时 × 1.5）
+          × 随机波动（0.95 ~ 1.05）
+          + 固定附加伤害
+```
+
+保底伤害：最终伤害不低于 攻击方攻击力 × 5%。
+
+4.5 战斗流程
+
+1. 布阵阶段：玩家调整5张卡牌站位。
+2. 自动回合制：按速度排序→攻击方选择目标（优先前排坦克）→释放技能→结算伤害→判定死亡→下一回合。
+3. 手动干预：玩家可点击“集火”切换目标，或点击技能图标手动释放大招（默认自动施放）。
+
+五、经济系统与资源表
+
+5.1 所有货币/资源清单
+
+资源名 用途 主要获取途径 稀有度
+灵石（铜钱） 修炼升级、升星消耗 主线、秘境、灵石矿脉 基础
+修为丹·小/中/大 提升卡牌经验 主线、每日任务 基础
+突破石（五行） 每10级突破瓶颈 对应五行副本、章节Boss 中级
+功法残页·初/高/稀 提升技能等级 功法阁、秘境宝箱 中级
+天道本源·碎片/整 升星（道果重数） 秘境高层、活动 高级
+问道令 抽卡消耗（1令=1抽） 每日签到、任务、问道仙台 珍贵
+灵契碎片（各卡牌） 合成/升星同名卡 对应章节精英/Boss 视稀有度
+
+5.2 关卡掉落表（主线示例）
+
+关卡类型 必掉 概率掉 极小概率掉
+普通小怪 灵石×20~50 修为丹·小×1（30%） —
+精英怪 灵石×80~150 对应五行突破石×1（50%） R卡碎片×1（15%）
+章节Boss 灵石×200+修为丹·中×2 SR碎片×1（20%） SSR碎片×1（2%）
+
+5.3 抽卡消耗与保底（纯单机良心版）
+
+抽卡方式 消耗 概率 保底机制
+单次问道 问道令×1 R 70% / SR 25% / SSR 5% 累计90抽必出SSR
+十方问道 问道令×10 同上（十连保底1张SR） 每30抽必出SR（跨池）
+
+每日免费：每日首次单抽 免费（刺激每日活跃）。
+
+六、单机特有功能设计
+
+6.1 洞府（挂机收益系统）
+
+· 玩家可将已收集的卡牌“挂入”洞府画卷中。
+· 挂机产出 离线收益：每小时产出 灵石×（挂入卡牌总等级/10）+ 修为丹×（SSR数量）。
+· 离线最多累积 12小时 收益。
+
+6.2 存档管理
+
+· 自动存档：每次战斗结束、抽卡、养成操作后自动保存至 LocalStorage。
+· 手动存档：设置界面提供“导出存档码”（Base64加密的JSON字符串），可复制保存。
+· 导入存档：粘贴存档码即可恢复进度，实现“伪云存档”。
+
+6.3 图鉴卷轴（收集进度）
+
+· 横向长卷轴展示所有卡牌，已收集为彩色水墨立绘，未收集为墨色剪影。
+· 收集进度达 50%/80%/100% 时，分别奖励 问道令×10 / 天道本源×3 / 限定SSR皮肤。
+
+七、UI/UX 2.5D 国风规范
+
+7.1 色彩系统
+
+用途 色值
+背景/宣纸 #F5F0E6
+主文字/墨色 #2C1810
+朱砂红（强调） #C23B22
+描金（装饰/稀有） #D4A04A
+R卡主色 #6A9EC7（青玉色）
+SR卡主色 #9B6BCC（紫金色）
+SSR卡主色 #E8636B（彩凰赤金）
+
+7.2 2.5D 卡牌视觉
+
+· 卡牌角度：绕X轴旋转25°，绕Y轴旋转15°，带投影（等距视角）。
+· 悬停交互：hover时上浮 20px，Y轴旋转增至25°，附带墨迹粒子飘散。
+· 稀有度表现：
+  · R：静止，青玉镶边。
+  · SR：衣摆/发丝 CSS 逐帧微动，紫金扫光。
+  · SSR：全卡水墨粒子循环，七彩流光边框（CSS gradient + animation）。
+
+八、数据文件结构（代码级）
+
+8.1 cards.json（全卡牌数据库）
+
+包含上述15张卡牌全部字段（id/name/rarity/element/class/stats/skills/story/quote）。
+
+8.2 stages.json（关卡数据库）
+
+```json
+{
+  "chapter": 1,
+  "name": "初入灵墟",
+  "stages": [
+    { "stage_id": "1-1", "type": "normal", "enemy": [...], "drop": {...}, "recommend_power": 500 },
+    { "stage_id": "1-6", "type": "elite", "enemy": [...], "drop": {...}, "recommend_power": 650 },
+    { "stage_id": "1-7", "type": "boss", "enemy": {...}, "drop": {...}, "recommend_power": 750 }
+  ]
+}
+```
+
+8.3 shop.json（洞府/商店配置）
+
+包括每日免费抽、兑换比例、挂机收益公式等。
+
+8.4 save.dat（玩家存档——LocalStorage键值）
+
+```json
+{
+  "player_level": 25,
+  "灵石": 15230,
+  "问道令": 18,
+  "cards_owned": ["R001","R002","SR001"],
+  "card_progress": { "R001": { "level": 35, "star": 3, "skill_level": 2, "favor": 80 } },
+  "story_cleared": ["1-1","1-2","1-3"],
+  "secret_floor": 12
+}
+```
+
+九、开发排期与里程碑（14周）
+
+阶段 周次 交付内容 技术重点
+P0 基建 W1 项目脚手架、2.5D CSS框架、全局UI 等距变换、水墨主题样式
+P1 卡牌 W2 15张卡数据JSON + 图鉴卷轴展示 数据驱动渲染
+P2 养成 W3~4 修炼/突破/升星/功法/好感度完整逻辑 数值计算、进度存储
+P3 战斗 W5~6 回合制战斗引擎 + 五行克制 + 2.5D战场 AI逻辑、伤害公式
+P4 主线 W7~8 12章84个关卡配置 + 剧情文字 关卡数据驱动、难度曲线
+P5 秘境 W9 肉鸽爬塔随机生成 + 事件系统 随机算法、层数递进
+P6 抽卡 W10 问道系统 + 保底计数 + 抽卡动画 概率控制、粒子特效
+P7 单机功能 W11 洞府挂机 + 存档导入导出 + 每日任务 LocalStorage高级操作
+P8 打磨 W12~13 数值平衡调试、性能优化、Bug修复 全流程测试
+P9 部署 W14 GitHub Actions配置 + 上线发布 CI/CD自动化
+
+十、总结：为什么这套方案可以直接落地？
+
+1. 卡牌数量可控（15张），涵盖五行+五职业，策略深度足够但开发量适中。
+2. 主线84关 + 秘境爬塔，单机内容量超过10小时，保证可玩性。
+3. 战斗公式明确，伤害/克制/站位均有量化标准，无需拍脑袋平衡。
+4. 纯静态可部署，所有数据写死JSON，无后端依赖。
+5. 单机专属功能（洞府挂机+存档码），补足了“无联网”的体验短板。
+
+---
+
+这套方案已经细到可以直接开写HTML/CSS/JS了。如果你需要，我下一步可以帮你输出 cards.json 的完整模板 或 核心战斗引擎的伪代码，你选定方向，我们继续深挖！
diff --git a/apps/ling-xu-wen-jian-lu/README.md b/apps/ling-xu-wen-jian-lu/README.md
new file mode 100644
index 0000000..fe68397
--- /dev/null
+++ b/apps/ling-xu-wen-jian-lu/README.md
@@ -0,0 +1,59 @@
+# 灵墟·问剑录 · Spirit Ruins: Record of Asking the Sword
+
+一款 **国风 2.5D 卡牌修仙** 单机小品：问道抽卡集齐十五张五行卡牌，修炼突破升星、五行克制布阵，在回合制战场上征战十二卷主线、攀爬九重天秘境；洞府挂机收菜，伪云存档随取随玩。
+
+技术栈：**纯原生 HTML + CSS + JavaScript（无框架）**，移动端竖屏单手操作，LocalStorage 多槽位存档，体积小、加载快。
+
+## 本地运行
+
+```bash
+npm install
+npm run dev      # 开发服务器 http://localhost:5180
+npm run build    # 生产构建到 dist/
+npm run test     # 纯逻辑自测（不依赖浏览器）
+npm run test:dom # jsdom 冒烟测试（需先 npm i jsdom，覆盖 UI 主流程）
+```
+
+也可由主框架（落地页）以 `createGame(parent)` 动态挂载，无需独立部署。
+
+## 核心玩法
+
+- **问道（抽卡）**：R 70% / SR 25% / SSR 5%，累计 90 抽必出 SSR、每 30 抽必出 SR、十连保底 SR，每日首次单抽免费。重复抽到的卡牌转为同名「灵契碎片」用于升星。
+- **十五张卡牌**：9 R + 4 SR + 2 SSR，覆盖金木水火土五行与剑修 / 符修 / 体修 / 丹修 / 阵修五大职业；每张卡有主动技与（SR/SSR）被动，含灼烧、中毒、冰冻、沉默、护盾、嘲讽、复活、致命免疫、低血狂暴等机制。
+- **养成**：喂修为丹升级、每 10 级五行突破石突破、灵契碎片升星、功法残页升技能，全套数值曲线驱动。
+- **五行回合制战斗**：按 速度×±5% 浮动排定出手；五行相克 +30% / 被克 -15%；站位 1 号位（主坦）受击 +30%、2 号位 +10%，嘲讽可强制集火。伤害公式严格遵循设计稿。
+- **主线十二卷**：每章 5 普通 + 1 精英 + 1 首领，共 84 战斗节点，掉落表覆盖灵石 / 修为丹 / 突破石 / 功法残页 / 天道本源 / 灵契碎片。
+- **秘境九重天**：90 层 Roguelike 爬塔，妖物盘踞 / 上古宝箱 / 风水奇遇 / 秘境商人 / 天道试炼 / 心魔之劫六类随机节点，每 10 层存档可中断继续。
+- **洞府挂机**：离线产出灵石（= 卡牌总等级/10 · 小时）与修为丹（= SSR 数量 · 小时），上限 12 小时。
+- **图鉴卷轴 / 成就**：收集进度达 50% / 80% / 100% 解锁奖励；五类成就含问道、主线、秘境、图鉴、养成。
+- **伪云存档**：设置页一键导出 / 导入 base64 存档码，换设备即可恢复进度。
+
+## 项目结构（模块化）
+
+```
+src/
+  config.js          五行克制 / 伤害公式 / 稀有度 / 养成曲线 / 问道保底（纯常量与纯函数）
+  data/
+    cards.js         15 张卡牌数据库（技能 / 被动 DSL）
+    enemies.js       小怪池 + 12 章 Boss + 战力缩放
+  core/
+    rng.js           可注入随机源（种子化/测试）
+    player.js        玩家状态 / 资源 / 收藏 / 阵容
+    card.js          卡牌实例 → 战斗属性派生
+    cultivate.js     升级 / 突破 / 升星 / 技能
+    gacha.js         问道抽卡（保底 + 每日免费）
+    battle.js        5v5 回合制引擎（五行 / 站位 / 技能 / 被动）
+    stage.js         主线十二卷 84 关
+    secret.js        秘境九重天 Roguelike 爬塔
+    cave.js          洞府离线挂机收益
+    achievements.js  成就 / 进度 / 奖励
+    save.js          localStorage 多槽位 + 导入导出
+  ui/
+    dom.js           轻量 DOM 辅助
+    app.js           UI 控制器（八大功能页）
+    style.css        国风 2.5D 样式
+```
+
+## 设计依据
+
+完整设计方案见 `.ai-tasks/issue-89/context.md`：核心玩法循环、卡牌预设库、关卡地图、战斗公式、经济系统、单机功能、UI 色彩规范。
diff --git a/apps/ling-xu-wen-jian-lu/index.html b/apps/ling-xu-wen-jian-lu/index.html
new file mode 100644
index 0000000..4ec9345
--- /dev/null
+++ b/apps/ling-xu-wen-jian-lu/index.html
@@ -0,0 +1,41 @@
+<!doctype html>
+<html lang="zh-CN">
+
+<head>
+  <meta charset="UTF-8" />
+  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
+  <meta name="theme-color" content="#F5F0E6" />
+  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%23F5F0E6'/%3E%3Ctext x='16' y='24' font-size='20' text-anchor='middle' fill='%23C23B22' font-family='serif'%3E%E5%89%91%3C/text%3E%3C/svg%3E" />
+  <title>灵墟·问剑录 · Spirit Ruins</title>
+  <style>
+    html,
+    body {
+      margin: 0;
+      padding: 0;
+      width: 100%;
+      height: 100%;
+      background: #F5F0E6;
+      overflow: hidden;
+      font-family: "PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif;
+      -webkit-user-select: none;
+      user-select: none;
+      -webkit-tap-highlight-color: transparent;
+    }
+
+    #game-container {
+      position: relative;
+      width: 100vw;
+      height: 100vh;
+      display: flex;
+      align-items: stretch;
+      justify-content: center;
+    }
+  </style>
+</head>
+
+<body>
+  <div id="game-container"></div>
+  <script type="module" src="/src/main.js"></script>
+</body>
+
+</html>
diff --git a/apps/ling-xu-wen-jian-lu/package-lock.json b/apps/ling-xu-wen-jian-lu/package-lock.json
new file mode 100644
index 0000000..a3202b3
--- /dev/null
+++ b/apps/ling-xu-wen-jian-lu/package-lock.json
@@ -0,0 +1,1580 @@
+{
+  "name": "ling-xu-wen-jian-lu",
+  "version": "1.0.0",
+  "lockfileVersion": 3,
+  "requires": true,
+  "packages": {
+    "": {
+      "name": "ling-xu-wen-jian-lu",
+      "version": "1.0.0",
+      "devDependencies": {
+        "jsdom": "^29.1.1",
+        "vite": "^5.4.0"
+      }
+    },
+    "node_modules/@asamuzakjp/css-color": {
+      "version": "5.1.11",
+      "resolved": "https://registry.npmjs.org/@asamuzakjp/css-color/-/css-color-5.1.11.tgz",
+      "integrity": "sha512-KVw6qIiCTUQhByfTd78h2yD1/00waTmm9uy/R7Ck/ctUyAPj+AEDLkQIdJW0T8+qGgj3j5bpNKK7Q3G+LedJWg==",
+      "dev": true,
+      "license": "MIT",
+      "dependencies": {
+        "@asamuzakjp/generational-cache": "^1.0.1",
+        "@csstools/css-calc": "^3.2.0",
+        "@csstools/css-color-parser": "^4.1.0",
+        "@csstools/css-parser-algorithms": "^4.0.0",
+        "@csstools/css-tokenizer": "^4.0.0"
+      },
+      "engines": {
+        "node": "^20.19.0 || ^22.12.0 || >=24.0.0"
+      }
+    },
+    "node_modules/@asamuzakjp/dom-selector": {
+      "version": "7.1.1",
+      "resolved": "https://registry.npmjs.org/@asamuzakjp/dom-selector/-/dom-selector-7.1.1.tgz",
+      "integrity": "sha512-67RZDnYRc8H/8MLDgQCDE//zoqVFwajkepHZgmXrbwybzXOEwOWGPYGmALYl9J2DOLfFPPs6kKCqmbzV895hTQ==",
+      "dev": true,
+      "license": "MIT",
+      "dependencies": {
+        "@asamuzakjp/generational-cache": "^1.0.1",
+        "@asamuzakjp/nwsapi": "^2.3.9",
+        "bidi-js": "^1.0.3",
+        "css-tree": "^3.2.1",
+        "is-potential-custom-element-name": "^1.0.1"
+      },
+      "engines": {
+        "node": "^20.19.0 || ^22.12.0 || >=24.0.0"
+      }
+    },
+    "node_modules/@asamuzakjp/generational-cache": {
+      "version": "1.0.1",
+      "resolved": "https://registry.npmjs.org/@asamuzakjp/generational-cache/-/generational-cache-1.0.1.tgz",
+      "integrity": "sha512-wajfB8KqzMCN2KGNFdLkReeHncd0AslUSrvHVvvYWuU8ghncRJoA50kT3zP9MVL0+9g4/67H+cdvBskj9THPzg==",
+      "dev": true,
+      "license": "MIT",
+      "engines": {
+        "node": "^20.19.0 || ^22.12.0 || >=24.0.0"
+      }
+    },
+    "node_modules/@asamuzakjp/nwsapi": {
+      "version": "2.3.9",
+      "resolved": "https://registry.npmjs.org/@asamuzakjp/nwsapi/-/nwsapi-2.3.9.tgz",
+      "integrity": "sha512-n8GuYSrI9bF7FFZ/SjhwevlHc8xaVlb/7HmHelnc/PZXBD2ZR49NnN9sMMuDdEGPeeRQ5d0hqlSlEpgCX3Wl0Q==",
+      "dev": true,
+      "license": "MIT"
+    },
+    "node_modules/@bramus/specificity": {
+      "version": "2.4.2",
+      "resolved": "https://registry.npmjs.org/@bramus/specificity/-/specificity-2.4.2.tgz",
+      "integrity": "sha512-ctxtJ/eA+t+6q2++vj5j7FYX3nRu311q1wfYH3xjlLOsczhlhxAg2FWNUXhpGvAw3BWo1xBcvOV6/YLc2r5FJw==",
+      "dev": true,
+      "license": "MIT",
+      "dependencies": {
+        "css-tree": "^3.0.0"
+      },
+      "bin": {
+        "specificity": "bin/cli.js"
+      }
+    },
+    "node_modules/@csstools/color-helpers": {
+      "version": "6.1.0",
+      "resolved": "https://registry.npmjs.org/@csstools/color-helpers/-/color-helpers-6.1.0.tgz",
+      "integrity": "sha512-064IFJdjTfUqnjpCVpMOdbr8FLQBhinbZj6yRv2An2E41O/pLEXqfFRWqGq/SxlE5PEUYTlvWsG2r8MswAVvkg==",
+      "dev": true,
+      "funding": [
+        {
+          "type": "github",
+          "url": "https://github.com/sponsors/csstools"
+        },
+        {
+          "type": "opencollective",
+          "url": "https://opencollective.com/csstools"
+        }
+      ],
+      "license": "MIT-0",
+      "engines": {
+        "node": ">=20.19.0"
+      }
+    },
+    "node_modules/@csstools/css-calc": {
+      "version": "3.3.0",
+      "resolved": "https://registry.npmjs.org/@csstools/css-calc/-/css-calc-3.3.0.tgz",
+      "integrity": "sha512-c5ihYsPkdG6JCkU2zTMm4+k6r7RXuGxtWYhu5DHMIiF1FHzrfmHL5so11AoFpUv/tu61xfcmT4AmKoFfMPoqdQ==",
+      "dev": true,
+      "funding": [
+        {
+          "type": "github",
+          "url": "https://github.com/sponsors/csstools"
+        },
+        {
+          "type": "opencollective",
+          "url": "https://opencollective.com/csstools"
+        }
+      ],
+      "license": "MIT",
+      "engines": {
+        "node": ">=20.19.0"
+      },
+      "peerDependencies": {
+        "@csstools/css-parser-algorithms": "^4.0.0",
+        "@csstools/css-tokenizer": "^4.0.0"
+      }
+    },
+    "node_modules/@csstools/css-color-parser": {
+      "version": "4.1.10",
+      "resolved": "https://registry.npmjs.org/@csstools/css-color-parser/-/css-color-parser-4.1.10.tgz",
+      "integrity": "sha512-UZhQLIUyJaaMepqehrCODwCg2KW25vFvLWBmqYFaPclYvvxzj/sG8LBOhBFCp11i9uE7t1EyS+RAoV9tztPFyw==",
+      "dev": true,
+      "funding": [
+        {
+          "type": "github",
+          "url": "https://github.com/sponsors/csstools"
+        },
+        {
+          "type": "opencollective",
+          "url": "https://opencollective.com/csstools"
+        }
+      ],
+      "license": "MIT",
+      "dependencies": {
+        "@csstools/color-helpers": "^6.1.0",
+        "@csstools/css-calc": "^3.3.0"
+      },
+      "engines": {
+        "node": ">=20.19.0"
+      },
+      "peerDependencies": {
+        "@csstools/css-parser-algorithms": "^4.0.0",
+        "@csstools/css-tokenizer": "^4.0.0"
+      }
+    },
+    "node_modules/@csstools/css-parser-algorithms": {
+      "version": "4.0.0",
+      "resolved": "https://registry.npmjs.org/@csstools/css-parser-algorithms/-/css-parser-algorithms-4.0.0.tgz",
+      "integrity": "sha512-+B87qS7fIG3L5h3qwJ/IFbjoVoOe/bpOdh9hAjXbvx0o8ImEmUsGXN0inFOnk2ChCFgqkkGFQ+TpM5rbhkKe4w==",
+      "dev": true,
+      "funding": [
+        {
+          "type": "github",
+          "url": "https://github.com/sponsors/csstools"
+        },
+        {
+          "type": "opencollective",
+          "url": "https://opencollective.com/csstools"
+        }
+      ],
+      "license": "MIT",
+      "engines": {
+        "node": ">=20.19.0"
+      },
+      "peerDependencies": {
+        "@csstools/css-tokenizer": "^4.0.0"
+      }
+    },
+    "node_modules/@csstools/css-syntax-patches-for-csstree": {
+      "version": "1.1.7",
+      "resolved": "https://registry.npmjs.org/@csstools/css-syntax-patches-for-csstree/-/css-syntax-patches-for-csstree-1.1.7.tgz",
+      "integrity": "sha512-fQ+05118eQS1cofO3aJpB5efgpBZMvIzwr/sbC8kDLVA5XLG8q1kJV5yzrUAI1f7lvhPnm8fgIjzFB8/O/5Dig==",
+      "dev": true,
+      "funding": [
+        {
+          "type": "github",
+          "url": "https://github.com/sponsors/csstools"
+        },
+        {
+          "type": "opencollective",
+          "url": "https://opencollective.com/csstools"
+        }
+      ],
+      "license": "MIT-0",
+      "peerDependencies": {
+        "css-tree": "^3.2.1"
+      },
+      "peerDependenciesMeta": {
+        "css-tree": {
+          "optional": true
+        }
+      }
+    },
+    "node_modules/@csstools/css-tokenizer": {
+      "version": "4.0.0",
+      "resolved": "https://registry.npmjs.org/@csstools/css-tokenizer/-/css-tokenizer-4.0.0.tgz",
+      "integrity": "sha512-QxULHAm7cNu72w97JUNCBFODFaXpbDg+dP8b/oWFAZ2MTRppA3U00Y2L1HqaS4J6yBqxwa/Y3nMBaxVKbB/NsA==",
+      "dev": true,
+      "funding": [
+        {
+          "type": "github",
+          "url": "https://github.com/sponsors/csstools"
+        },
+        {
+          "type": "opencollective",
+          "url": "https://opencollective.com/csstools"
+        }
+      ],
+      "license": "MIT",
+      "engines": {
+        "node": ">=20.19.0"
+      }
+    },
+    "node_modules/@esbuild/aix-ppc64": {
+      "version": "0.21.5",
+      "resolved": "https://registry.npmjs.org/@esbuild/aix-ppc64/-/aix-ppc64-0.21.5.tgz",
+      "integrity": "sha512-1SDgH6ZSPTlggy1yI6+Dbkiz8xzpHJEVAlF/AM1tHPLsf5STom9rwtjE4hKAF20FfXXNTFqEYXyJNWh1GiZedQ==",
+      "cpu": [
+        "ppc64"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "aix"
+      ],
+      "engines": {
+        "node": ">=12"
+      }
+    },
+    "node_modules/@esbuild/android-arm": {
+      "version": "0.21.5",
+      "resolved": "https://registry.npmjs.org/@esbuild/android-arm/-/android-arm-0.21.5.tgz",
+      "integrity": "sha512-vCPvzSjpPHEi1siZdlvAlsPxXl7WbOVUBBAowWug4rJHb68Ox8KualB+1ocNvT5fjv6wpkX6o/iEpbDrf68zcg==",
+      "cpu": [
+        "arm"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "android"
+      ],
+      "engines": {
+        "node": ">=12"
+      }
+    },
+    "node_modules/@esbuild/android-arm64": {
+      "version": "0.21.5",
+      "resolved": "https://registry.npmjs.org/@esbuild/android-arm64/-/android-arm64-0.21.5.tgz",
+      "integrity": "sha512-c0uX9VAUBQ7dTDCjq+wdyGLowMdtR/GoC2U5IYk/7D1H1JYC0qseD7+11iMP2mRLN9RcCMRcjC4YMclCzGwS/A==",
+      "cpu": [
+        "arm64"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "android"
+      ],
+      "engines": {
+        "node": ">=12"
+      }
+    },
+    "node_modules/@esbuild/android-x64": {
+      "version": "0.21.5",
+      "resolved": "https://registry.npmjs.org/@esbuild/android-x64/-/android-x64-0.21.5.tgz",
+      "integrity": "sha512-D7aPRUUNHRBwHxzxRvp856rjUHRFW1SdQATKXH2hqA0kAZb1hKmi02OpYRacl0TxIGz/ZmXWlbZgjwWYaCakTA==",
+      "cpu": [
+        "x64"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "android"
+      ],
+      "engines": {
+        "node": ">=12"
+      }
+    },
+    "node_modules/@esbuild/darwin-arm64": {
+      "version": "0.21.5",
+      "resolved": "https://registry.npmjs.org/@esbuild/darwin-arm64/-/darwin-arm64-0.21.5.tgz",
+      "integrity": "sha512-DwqXqZyuk5AiWWf3UfLiRDJ5EDd49zg6O9wclZ7kUMv2WRFr4HKjXp/5t8JZ11QbQfUS6/cRCKGwYhtNAY88kQ==",
+      "cpu": [
+        "arm64"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "darwin"
+      ],
+      "engines": {
+        "node": ">=12"
+      }
+    },
+    "node_modules/@esbuild/darwin-x64": {
+      "version": "0.21.5",
+      "resolved": "https://registry.npmjs.org/@esbuild/darwin-x64/-/darwin-x64-0.21.5.tgz",
+      "integrity": "sha512-se/JjF8NlmKVG4kNIuyWMV/22ZaerB+qaSi5MdrXtd6R08kvs2qCN4C09miupktDitvh8jRFflwGFBQcxZRjbw==",
+      "cpu": [
+        "x64"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "darwin"
+      ],
+      "engines": {
+        "node": ">=12"
+      }
+    },
+    "node_modules/@esbuild/freebsd-arm64": {
+      "version": "0.21.5",
+      "resolved": "https://registry.npmjs.org/@esbuild/freebsd-arm64/-/freebsd-arm64-0.21.5.tgz",
+      "integrity": "sha512-5JcRxxRDUJLX8JXp/wcBCy3pENnCgBR9bN6JsY4OmhfUtIHe3ZW0mawA7+RDAcMLrMIZaf03NlQiX9DGyB8h4g==",
+      "cpu": [
+        "arm64"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "freebsd"
+      ],
+      "engines": {
+        "node": ">=12"
+      }
+    },
+    "node_modules/@esbuild/freebsd-x64": {
+      "version": "0.21.5",
+      "resolved": "https://registry.npmjs.org/@esbuild/freebsd-x64/-/freebsd-x64-0.21.5.tgz",
+      "integrity": "sha512-J95kNBj1zkbMXtHVH29bBriQygMXqoVQOQYA+ISs0/2l3T9/kj42ow2mpqerRBxDJnmkUDCaQT/dfNXWX/ZZCQ==",
+      "cpu": [
+        "x64"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "freebsd"
+      ],
+      "engines": {
+        "node": ">=12"
+      }
+    },
+    "node_modules/@esbuild/linux-arm": {
+      "version": "0.21.5",
+      "resolved": "https://registry.npmjs.org/@esbuild/linux-arm/-/linux-arm-0.21.5.tgz",
+      "integrity": "sha512-bPb5AHZtbeNGjCKVZ9UGqGwo8EUu4cLq68E95A53KlxAPRmUyYv2D6F0uUI65XisGOL1hBP5mTronbgo+0bFcA==",
+      "cpu": [
+        "arm"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "linux"
+      ],
+      "engines": {
+        "node": ">=12"
+      }
+    },
+    "node_modules/@esbuild/linux-arm64": {
+      "version": "0.21.5",
+      "resolved": "https://registry.npmjs.org/@esbuild/linux-arm64/-/linux-arm64-0.21.5.tgz",
+      "integrity": "sha512-ibKvmyYzKsBeX8d8I7MH/TMfWDXBF3db4qM6sy+7re0YXya+K1cem3on9XgdT2EQGMu4hQyZhan7TeQ8XkGp4Q==",
+      "cpu": [
+        "arm64"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "linux"
+      ],
+      "engines": {
+        "node": ">=12"
+      }
+    },
+    "node_modules/@esbuild/linux-ia32": {
+      "version": "0.21.5",
+      "resolved": "https://registry.npmjs.org/@esbuild/linux-ia32/-/linux-ia32-0.21.5.tgz",
+      "integrity": "sha512-YvjXDqLRqPDl2dvRODYmmhz4rPeVKYvppfGYKSNGdyZkA01046pLWyRKKI3ax8fbJoK5QbxblURkwK/MWY18Tg==",
+      "cpu": [
+        "ia32"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "linux"
+      ],
+      "engines": {
+        "node": ">=12"
+      }
+    },
+    "node_modules/@esbuild/linux-loong64": {
+      "version": "0.21.5",
+      "resolved": "https://registry.npmjs.org/@esbuild/linux-loong64/-/linux-loong64-0.21.5.tgz",
+      "integrity": "sha512-uHf1BmMG8qEvzdrzAqg2SIG/02+4/DHB6a9Kbya0XDvwDEKCoC8ZRWI5JJvNdUjtciBGFQ5PuBlpEOXQj+JQSg==",
+      "cpu": [
+        "loong64"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "linux"
+      ],
+      "engines": {
+        "node": ">=12"
+      }
+    },
+    "node_modules/@esbuild/linux-mips64el": {
+      "version": "0.21.5",
+      "resolved": "https://registry.npmjs.org/@esbuild/linux-mips64el/-/linux-mips64el-0.21.5.tgz",
+      "integrity": "sha512-IajOmO+KJK23bj52dFSNCMsz1QP1DqM6cwLUv3W1QwyxkyIWecfafnI555fvSGqEKwjMXVLokcV5ygHW5b3Jbg==",
+      "cpu": [
+        "mips64el"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "linux"
+      ],
+      "engines": {
+        "node": ">=12"
+      }
+    },
+    "node_modules/@esbuild/linux-ppc64": {
+      "version": "0.21.5",
+      "resolved": "https://registry.npmjs.org/@esbuild/linux-ppc64/-/linux-ppc64-0.21.5.tgz",
+      "integrity": "sha512-1hHV/Z4OEfMwpLO8rp7CvlhBDnjsC3CttJXIhBi+5Aj5r+MBvy4egg7wCbe//hSsT+RvDAG7s81tAvpL2XAE4w==",
+      "cpu": [
+        "ppc64"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "linux"
+      ],
+      "engines": {
+        "node": ">=12"
+      }
+    },
+    "node_modules/@esbuild/linux-riscv64": {
+      "version": "0.21.5",
+      "resolved": "https://registry.npmjs.org/@esbuild/linux-riscv64/-/linux-riscv64-0.21.5.tgz",
+      "integrity": "sha512-2HdXDMd9GMgTGrPWnJzP2ALSokE/0O5HhTUvWIbD3YdjME8JwvSCnNGBnTThKGEB91OZhzrJ4qIIxk/SBmyDDA==",
+      "cpu": [
+        "riscv64"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "linux"
+      ],
+      "engines": {
+        "node": ">=12"
+      }
+    },
+    "node_modules/@esbuild/linux-s390x": {
+      "version": "0.21.5",
+      "resolved": "https://registry.npmjs.org/@esbuild/linux-s390x/-/linux-s390x-0.21.5.tgz",
+      "integrity": "sha512-zus5sxzqBJD3eXxwvjN1yQkRepANgxE9lgOW2qLnmr8ikMTphkjgXu1HR01K4FJg8h1kEEDAqDcZQtbrRnB41A==",
+      "cpu": [
+        "s390x"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "linux"
+      ],
+      "engines": {
+        "node": ">=12"
+      }
+    },
+    "node_modules/@esbuild/linux-x64": {
+      "version": "0.21.5",
+      "resolved": "https://registry.npmjs.org/@esbuild/linux-x64/-/linux-x64-0.21.5.tgz",
+      "integrity": "sha512-1rYdTpyv03iycF1+BhzrzQJCdOuAOtaqHTWJZCWvijKD2N5Xu0TtVC8/+1faWqcP9iBCWOmjmhoH94dH82BxPQ==",
+      "cpu": [
+        "x64"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "linux"
+      ],
+      "engines": {
+        "node": ">=12"
+      }
+    },
+    "node_modules/@esbuild/netbsd-x64": {
+      "version": "0.21.5",
+      "resolved": "https://registry.npmjs.org/@esbuild/netbsd-x64/-/netbsd-x64-0.21.5.tgz",
+      "integrity": "sha512-Woi2MXzXjMULccIwMnLciyZH4nCIMpWQAs049KEeMvOcNADVxo0UBIQPfSmxB3CWKedngg7sWZdLvLczpe0tLg==",
+      "cpu": [
+        "x64"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "netbsd"
+      ],
+      "engines": {
+        "node": ">=12"
+      }
+    },
+    "node_modules/@esbuild/openbsd-x64": {
+      "version": "0.21.5",
+      "resolved": "https://registry.npmjs.org/@esbuild/openbsd-x64/-/openbsd-x64-0.21.5.tgz",
+      "integrity": "sha512-HLNNw99xsvx12lFBUwoT8EVCsSvRNDVxNpjZ7bPn947b8gJPzeHWyNVhFsaerc0n3TsbOINvRP2byTZ5LKezow==",
+      "cpu": [
+        "x64"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "openbsd"
+      ],
+      "engines": {
+        "node": ">=12"
+      }
+    },
+    "node_modules/@esbuild/sunos-x64": {
+      "version": "0.21.5",
+      "resolved": "https://registry.npmjs.org/@esbuild/sunos-x64/-/sunos-x64-0.21.5.tgz",
+      "integrity": "sha512-6+gjmFpfy0BHU5Tpptkuh8+uw3mnrvgs+dSPQXQOv3ekbordwnzTVEb4qnIvQcYXq6gzkyTnoZ9dZG+D4garKg==",
+      "cpu": [
+        "x64"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "sunos"
+      ],
+      "engines": {
+        "node": ">=12"
+      }
+    },
+    "node_modules/@esbuild/win32-arm64": {
+      "version": "0.21.5",
+      "resolved": "https://registry.npmjs.org/@esbuild/win32-arm64/-/win32-arm64-0.21.5.tgz",
+      "integrity": "sha512-Z0gOTd75VvXqyq7nsl93zwahcTROgqvuAcYDUr+vOv8uHhNSKROyU961kgtCD1e95IqPKSQKH7tBTslnS3tA8A==",
+      "cpu": [
+        "arm64"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "win32"
+      ],
+      "engines": {
+        "node": ">=12"
+      }
+    },
+    "node_modules/@esbuild/win32-ia32": {
+      "version": "0.21.5",
+      "resolved": "https://registry.npmjs.org/@esbuild/win32-ia32/-/win32-ia32-0.21.5.tgz",
+      "integrity": "sha512-SWXFF1CL2RVNMaVs+BBClwtfZSvDgtL//G/smwAc5oVK/UPu2Gu9tIaRgFmYFFKrmg3SyAjSrElf0TiJ1v8fYA==",
+      "cpu": [
+        "ia32"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "win32"
+      ],
+      "engines": {
+        "node": ">=12"
+      }
+    },
+    "node_modules/@esbuild/win32-x64": {
+      "version": "0.21.5",
+      "resolved": "https://registry.npmjs.org/@esbuild/win32-x64/-/win32-x64-0.21.5.tgz",
+      "integrity": "sha512-tQd/1efJuzPC6rCFwEvLtci/xNFcTZknmXs98FYDfGE4wP9ClFV98nyKrzJKVPMhdDnjzLhdUyMX4PsQAPjwIw==",
+      "cpu": [
+        "x64"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "win32"
+      ],
+      "engines": {
+        "node": ">=12"
+      }
+    },
+    "node_modules/@exodus/bytes": {
+      "version": "1.15.1",
+      "resolved": "https://registry.npmjs.org/@exodus/bytes/-/bytes-1.15.1.tgz",
+      "integrity": "sha512-S6mL0yNB/Abt9Ei4tq8gDhcczc4S3+vQ4ra7vxnAf+YHC02srtqxKKZghx2Dq6p0e66THKwR6r8N6P95wEty7Q==",
+      "dev": true,
+      "license": "MIT",
+      "engines": {
+        "node": "^20.19.0 || ^22.12.0 || >=24.0.0"
+      },
+      "peerDependencies": {
+        "@noble/hashes": "^1.8.0 || ^2.0.0"
+      },
+      "peerDependenciesMeta": {
+        "@noble/hashes": {
+          "optional": true
+        }
+      }
+    },
+    "node_modules/@napi-rs/lzma-linux-x64-gnu": {
+      "version": "1.5.1",
+      "resolved": "https://registry.npmjs.org/@napi-rs/lzma-linux-x64-gnu/-/lzma-linux-x64-gnu-1.5.1.tgz",
+      "integrity": "sha512-oTXEIha4SsuXdTA4Iyskj0kpdx2yVXdhd75c2v3xGrHFfVMsbhTPZU/nMPL4sWKo4pBHm3aucLaqGlF696dTyQ==",
+      "cpu": [
+        "x64"
+      ],
+      "dev": true,
+      "libc": [
+        "glibc"
+      ],
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "linux"
+      ],
+      "engines": {
+        "node": "^22.20 || ^24.12 || >=25"
+      }
+    },
+    "node_modules/@rollup/rollup-android-arm-eabi": {
+      "version": "4.62.4",
+      "resolved": "https://registry.npmjs.org/@rollup/rollup-android-arm-eabi/-/rollup-android-arm-eabi-4.62.4.tgz",
+      "integrity": "sha512-RrPokAb7dmbxFoeO3TloqHyOjgye8RkBhSqmp4aJMIex4c9r46ZstPnleDQOq1t46VOVjwIuwNogIqbodV1Vvg==",
+      "cpu": [
+        "arm"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "android"
+      ]
+    },
+    "node_modules/@rollup/rollup-android-arm64": {
+      "version": "4.62.4",
+      "resolved": "https://registry.npmjs.org/@rollup/rollup-android-arm64/-/rollup-android-arm64-4.62.4.tgz",
+      "integrity": "sha512-JKuJc+pnpks2pjy7L/N3v/cAkZxYlnmuZoD840ldbMI5KDbC4iO9NKwPKYdjYFCMAIIlBzYSFHxIJVYzRo2/8A==",
+      "cpu": [
+        "arm64"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "android"
+      ]
+    },
+    "node_modules/@rollup/rollup-darwin-arm64": {
+      "version": "4.62.4",
+      "resolved": "https://registry.npmjs.org/@rollup/rollup-darwin-arm64/-/rollup-darwin-arm64-4.62.4.tgz",
+      "integrity": "sha512-krw5uS2STmvJ02x0uTXHbqQNuz+9eZ1iw+qXk9dmW2gvV4jV7O2hEoOnuhFrpOPiel1mBFtqbxYZZtC46hXLOw==",
+      "cpu": [
+        "arm64"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "darwin"
+      ]
+    },
+    "node_modules/@rollup/rollup-darwin-x64": {
+      "version": "4.62.4",
+      "resolved": "https://registry.npmjs.org/@rollup/rollup-darwin-x64/-/rollup-darwin-x64-4.62.4.tgz",
+      "integrity": "sha512-wsTxtgApb4PrOsNJIm0FZ1h3WvCC+k9uxLJ4ad75hgoS4NiRes2SoJFlDAyMwiUY8IssDqGcHbXuN0sx1tfF1A==",
+      "cpu": [
+        "x64"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "darwin"
+      ]
+    },
+    "node_modules/@rollup/rollup-freebsd-arm64": {
+      "version": "4.62.4",
+      "resolved": "https://registry.npmjs.org/@rollup/rollup-freebsd-arm64/-/rollup-freebsd-arm64-4.62.4.tgz",
+      "integrity": "sha512-GUOnQlyZe3yAXhWOtOMsn5Qkrv5E5mZXa0thbARWi5Ei2szlVXJFQhddZ4HbAzh8q92w5twp+CQvs/eFanz9YQ==",
+      "cpu": [
+        "arm64"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "freebsd"
+      ]
+    },
+    "node_modules/@rollup/rollup-freebsd-x64": {
+      "version": "4.62.4",
+      "resolved": "https://registry.npmjs.org/@rollup/rollup-freebsd-x64/-/rollup-freebsd-x64-4.62.4.tgz",
+      "integrity": "sha512-/Y7f3QuxjzPKsjA/rfEDa3+0vXqyjmJ50Ln8dPpCmWkKTrUoWHG1cWhTqaAMLob2m2nESWuC7yGrREz019Ztqg==",
+      "cpu": [
+        "x64"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "freebsd"
+      ]
+    },
+    "node_modules/@rollup/rollup-linux-arm-gnueabihf": {
+      "version": "4.62.4",
+      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm-gnueabihf/-/rollup-linux-arm-gnueabihf-4.62.4.tgz",
+      "integrity": "sha512-81wiiX3v7aqy+T+bT61TJ78yJjRquqFFTTbAPt08imfQQzkPIW8t6aJbkTagtCCrXMNc9D66+geqlK7ydLPNqA==",
+      "cpu": [
+        "arm"
+      ],
+      "dev": true,
+      "libc": [
+        "glibc"
+      ],
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "linux"
+      ]
+    },
+    "node_modules/@rollup/rollup-linux-arm-musleabihf": {
+      "version": "4.62.4",
+      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm-musleabihf/-/rollup-linux-arm-musleabihf-4.62.4.tgz",
+      "integrity": "sha512-9kmDIvNZqdoHOBZgNtpTBeLWYO/LVipM3H/j62P8848/l/VPEQL6N3uxU9pvP1oZAsXyC2MEnFP3ovRjo7WYNQ==",
+      "cpu": [
+        "arm"
+      ],
+      "dev": true,
+      "libc": [
+        "musl"
+      ],
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "linux"
+      ]
+    },
+    "node_modules/@rollup/rollup-linux-arm64-gnu": {
+      "version": "4.62.4",
+      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm64-gnu/-/rollup-linux-arm64-gnu-4.62.4.tgz",
+      "integrity": "sha512-CcnXHWnXg69g+DX5VWL3FHts3qMRN2uVEHX+BZvGLdd07/gXkn3ePjYtO1LDJvxkGKVHMclKBRa1QUTH+6toYQ==",
+      "cpu": [
+        "arm64"
+      ],
+      "dev": true,
+      "libc": [
+        "glibc"
+      ],
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "linux"
+      ]
+    },
+    "node_modules/@rollup/rollup-linux-arm64-musl": {
+      "version": "4.62.4",
+      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm64-musl/-/rollup-linux-arm64-musl-4.62.4.tgz",
+      "integrity": "sha512-iFOibiHnTRuhrWLlRsOQFdZJJIa7S8OwkneJr4ocALP16u5yk6lWLINFwhHaEqBFMsKDUZofLkGos7+CPzGB3g==",
+      "cpu": [
+        "arm64"
+      ],
+      "dev": true,
+      "libc": [
+        "musl"
+      ],
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "linux"
+      ]
+    },
+    "node_modules/@rollup/rollup-linux-loong64-gnu": {
+      "version": "4.62.4",
+      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-loong64-gnu/-/rollup-linux-loong64-gnu-4.62.4.tgz",
+      "integrity": "sha512-XnWYMI7euHlb5a871xPja+Gm7DRCFU+FGRrtS2sMq9N8FvqtpagUy6gD4YOemC5MRk9xbh8+jYMEJbigFQwsgA==",
+      "cpu": [
+        "loong64"
+      ],
+      "dev": true,
+      "libc": [
+        "glibc"
+      ],
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "linux"
+      ]
+    },
+    "node_modules/@rollup/rollup-linux-loong64-musl": {
+      "version": "4.62.4",
+      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-loong64-musl/-/rollup-linux-loong64-musl-4.62.4.tgz",
+      "integrity": "sha512-qGDAlO0U8xedCcsdRm9oaoQY8DAx/QT7uIxJWhCdx0ceIWX783UC9QSYkdpzAe29wNiVfp24+bZdQmn49o45SQ==",
+      "cpu": [
+        "loong64"
+      ],
+      "dev": true,
+      "libc": [
+        "musl"
+      ],
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "linux"
+      ]
+    },
+    "node_modules/@rollup/rollup-linux-ppc64-gnu": {
+      "version": "4.62.4",
+      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-ppc64-gnu/-/rollup-linux-ppc64-gnu-4.62.4.tgz",
+      "integrity": "sha512-ru4H6ezD7ysA5EiEK6qkkaEb4modH8CTej6kUy/gQi20u3kB3G7Zn8snXXkeJSCOFKG/rbPPtM/+9Wgas1961w==",
+      "cpu": [
+        "ppc64"
+      ],
+      "dev": true,
+      "libc": [
+        "glibc"
+      ],
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "linux"
+      ]
+    },
+    "node_modules/@rollup/rollup-linux-ppc64-musl": {
+      "version": "4.62.4",
+      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-ppc64-musl/-/rollup-linux-ppc64-musl-4.62.4.tgz",
+      "integrity": "sha512-2W4MO5WQVJnbJaZdvDb9rhBDuFU1nKIepPFpJUBsTh2k1YY2g+ODViaWuyOAjQ5cOP7NvrvLzt3wvHOoiAvc7w==",
+      "cpu": [
+        "ppc64"
+      ],
+      "dev": true,
+      "libc": [
+        "musl"
+      ],
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "linux"
+      ]
+    },
+    "node_modules/@rollup/rollup-linux-riscv64-gnu": {
+      "version": "4.62.4",
+      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-riscv64-gnu/-/rollup-linux-riscv64-gnu-4.62.4.tgz",
+      "integrity": "sha512-+fxjfuoAmVMCYV5QyjoIpu0cp5DOiOTeqYFk1AVaxGr+/ravWLX89XfQmptsoWcaVy/TGf2hexzbUOrCQIL1CQ==",
+      "cpu": [
+        "riscv64"
+      ],
+      "dev": true,
+      "libc": [
+        "glibc"
+      ],
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "linux"
+      ]
+    },
+    "node_modules/@rollup/rollup-linux-riscv64-musl": {
+      "version": "4.62.4",
+      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-riscv64-musl/-/rollup-linux-riscv64-musl-4.62.4.tgz",
+      "integrity": "sha512-jTn8JfHGL4djjFxPuM06LmNUJDsst2jeVlsd9OmIH6zc5sC9K6rIuO4YajXatLUpBmBKl6b35ro1QZocLi+tcA==",
+      "cpu": [
+        "riscv64"
+      ],
+      "dev": true,
+      "libc": [
+        "musl"
+      ],
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "linux"
+      ]
+    },
+    "node_modules/@rollup/rollup-linux-s390x-gnu": {
+      "version": "4.62.4",
+      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-s390x-gnu/-/rollup-linux-s390x-gnu-4.62.4.tgz",
+      "integrity": "sha512-oCJCJL4pXsoDcP2QZ+JVlPTIRc6266zsIaeJJsWImmF7HO0W8nb6HuSgZlMWxJwaPf8ehbSw8yo0EUw925hKsA==",
+      "cpu": [
+        "s390x"
+      ],
+      "dev": true,
+      "libc": [
+        "glibc"
+      ],
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "linux"
+      ]
+    },
+    "node_modules/@rollup/rollup-linux-x64-gnu": {
+      "version": "4.62.4",
+      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-x64-gnu/-/rollup-linux-x64-gnu-4.62.4.tgz",
+      "integrity": "sha512-W69hukhZ3KKNRCaMIEzKvcFye42hh0FE1+YoYaf5+Ikacuftoco6yO/xouz0hc5d5W/s3yBro5jRiuEE/Q5vUw==",
+      "cpu": [
+        "x64"
+      ],
+      "dev": true,
+      "libc": [
+        "glibc"
+      ],
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "linux"
+      ]
+    },
+    "node_modules/@rollup/rollup-linux-x64-musl": {
+      "version": "4.62.4",
+      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-x64-musl/-/rollup-linux-x64-musl-4.62.4.tgz",
+      "integrity": "sha512-qiXbGG2jkjXhzXpsFZSR2Xpb8DN/UaxYsbb/STbuR/6fpaDgRmmaq1B/LmtF2wQFOFOSsK2jdE0RZ3a0zHn4QA==",
+      "cpu": [
+        "x64"
+      ],
+      "dev": true,
+      "libc": [
+        "musl"
+      ],
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "linux"
+      ]
+    },
+    "node_modules/@rollup/rollup-openbsd-x64": {
+      "version": "4.62.4",
+      "resolved": "https://registry.npmjs.org/@rollup/rollup-openbsd-x64/-/rollup-openbsd-x64-4.62.4.tgz",
+      "integrity": "sha512-nWeM//hxv8mIo6jD7Hu4o48DVmV9pbV6gsKaWU+4NFyqHoPKwrkRiZGLKUhOBk8qNmDmpwFtPKg80Bo/Tn4xiQ==",
+      "cpu": [
+        "x64"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "openbsd"
+      ]
+    },
+    "node_modules/@rollup/rollup-openharmony-arm64": {
+      "version": "4.62.4",
+      "resolved": "https://registry.npmjs.org/@rollup/rollup-openharmony-arm64/-/rollup-openharmony-arm64-4.62.4.tgz",
+      "integrity": "sha512-s62SQ/vgsRSvMwDkOEfTqfgASF0f26ZNaQuTA6Aok5lrikf89yI2W0gFHvZb2Jpgc6N8JnOKZgCK2iciO3CsxQ==",
+      "cpu": [
+        "arm64"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "openharmony"
+      ]
+    },
+    "node_modules/@rollup/rollup-win32-arm64-msvc": {
+      "version": "4.62.4",
+      "resolved": "https://registry.npmjs.org/@rollup/rollup-win32-arm64-msvc/-/rollup-win32-arm64-msvc-4.62.4.tgz",
+      "integrity": "sha512-J6wGf8TVGbXJq+HH+ttTvrcfNKPbuZecV6KT1B8I18BC5IURUh5kl4Yl5OEP5eFIUoI5BWxCsyYMhFsDx8kekw==",
+      "cpu": [
+        "arm64"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "win32"
+      ]
+    },
+    "node_modules/@rollup/rollup-win32-ia32-msvc": {
+      "version": "4.62.4",
+      "resolved": "https://registry.npmjs.org/@rollup/rollup-win32-ia32-msvc/-/rollup-win32-ia32-msvc-4.62.4.tgz",
+      "integrity": "sha512-zmfrQd/0wu6oJs8Vq8KwY/YtsKSsLtKe/HwAP4Wqy8LhWjeT55fHRAkOhYQ12wI3ayS4Tt12d5CDRD7N96SAYQ==",
+      "cpu": [
+        "ia32"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "win32"
+      ]
+    },
+    "node_modules/@rollup/rollup-win32-x64-gnu": {
+      "version": "4.62.4",
+      "resolved": "https://registry.npmjs.org/@rollup/rollup-win32-x64-gnu/-/rollup-win32-x64-gnu-4.62.4.tgz",
+      "integrity": "sha512-qPzHqdj9rfUD+w79dtE07zi/kFwKyCJqplp5K5ygeLTp7jLpAoc16OAH39HSmRC9UpozaecsleI8uAdEj6v2yw==",
+      "cpu": [
+        "x64"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "win32"
+      ]
+    },
+    "node_modules/@rollup/rollup-win32-x64-msvc": {
+      "version": "4.62.4",
+      "resolved": "https://registry.npmjs.org/@rollup/rollup-win32-x64-msvc/-/rollup-win32-x64-msvc-4.62.4.tgz",
+      "integrity": "sha512-zD6NdeWEByGE9QF9vCrlJ5YQB4oq9q91kPZS37Jwj5hOkvR1lTBSpsKhKDw4IJtbQ35LsTS1HD9DZYGKIshU1Q==",
+      "cpu": [
+        "x64"
+      ],
+      "dev": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "win32"
+      ]
+    },
+    "node_modules/@types/estree": {
+      "version": "1.0.9",
+      "resolved": "https://registry.npmjs.org/@types/estree/-/estree-1.0.9.tgz",
+      "integrity": "sha512-GhdPgy1el4/ImP05X05Uw4cw2/M93BCUmnEvWZNStlCzEKME4Fkk+YpoA5OiHNQmoS7Cafb8Xa3Pya8m1Qrzeg==",
+      "dev": true,
+      "license": "MIT"
+    },
+    "node_modules/bidi-js": {
+      "version": "1.0.3",
+      "resolved": "https://registry.npmjs.org/bidi-js/-/bidi-js-1.0.3.tgz",
+      "integrity": "sha512-RKshQI1R3YQ+n9YJz2QQ147P66ELpa1FQEg20Dk8oW9t2KgLbpDLLp9aGZ7y8WHSshDknG0bknqGw5/tyCs5tw==",
+      "dev": true,
+      "license": "MIT",
+      "dependencies": {
+        "require-from-string": "^2.0.2"
+      }
+    },
+    "node_modules/css-tree": {
+      "version": "3.2.1",
+      "resolved": "https://registry.npmjs.org/css-tree/-/css-tree-3.2.1.tgz",
+      "integrity": "sha512-X7sjQzceUhu1u7Y/ylrRZFU2FS6LRiFVp6rKLPg23y3x3c3DOKAwuXGDp+PAGjh6CSnCjYeAul8pcT8bAl+lSA==",
+      "dev": true,
+      "license": "MIT",
+      "dependencies": {
+        "mdn-data": "2.27.1",
+        "source-map-js": "^1.2.1"
+      },
+      "engines": {
+        "node": "^10 || ^12.20.0 || ^14.13.0 || >=15.0.0"
+      }
+    },
+    "node_modules/data-urls": {
+      "version": "7.0.0",
+      "resolved": "https://registry.npmjs.org/data-urls/-/data-urls-7.0.0.tgz",
+      "integrity": "sha512-23XHcCF+coGYevirZceTVD7NdJOqVn+49IHyxgszm+JIiHLoB2TkmPtsYkNWT1pvRSGkc35L6NHs0yHkN2SumA==",
+      "dev": true,
+      "license": "MIT",
+      "dependencies": {
+        "whatwg-mimetype": "^5.0.0",
+        "whatwg-url": "^16.0.0"
+      },
+      "engines": {
+        "node": "^20.19.0 || ^22.12.0 || >=24.0.0"
+      }
+    },
+    "node_modules/decimal.js": {
+      "version": "10.6.0",
+      "resolved": "https://registry.npmjs.org/decimal.js/-/decimal.js-10.6.0.tgz",
+      "integrity": "sha512-YpgQiITW3JXGntzdUmyUR1V812Hn8T1YVXhCu+wO3OpS4eU9l4YdD3qjyiKdV6mvV29zapkMeD390UVEf2lkUg==",
+      "dev": true,
+      "license": "MIT"
+    },
+    "node_modules/entities": {
+      "version": "8.0.0",
+      "resolved": "https://registry.npmjs.org/entities/-/entities-8.0.0.tgz",
+      "integrity": "sha512-zwfzJecQ/Uej6tusMqwAqU/6KL2XaB2VZ2Jg54Je6ahNBGNH6Ek6g3jjNCF0fG9EWQKGZNddNjU5F1ZQn/sBnA==",
+      "dev": true,
+      "license": "BSD-2-Clause",
+      "engines": {
+        "node": ">=20.19.0"
+      },
+      "funding": {
+        "url": "https://github.com/fb55/entities?sponsor=1"
+      }
+    },
+    "node_modules/esbuild": {
+      "version": "0.21.5",
+      "resolved": "https://registry.npmjs.org/esbuild/-/esbuild-0.21.5.tgz",
+      "integrity": "sha512-mg3OPMV4hXywwpoDxu3Qda5xCKQi+vCTZq8S9J/EpkhB2HzKXq4SNFZE3+NK93JYxc8VMSep+lOUSC/RVKaBqw==",
+      "dev": true,
+      "hasInstallScript": true,
+      "license": "MIT",
+      "bin": {
+        "esbuild": "bin/esbuild"
+      },
+      "engines": {
+        "node": ">=12"
+      },
+      "optionalDependencies": {
+        "@esbuild/aix-ppc64": "0.21.5",
+        "@esbuild/android-arm": "0.21.5",
+        "@esbuild/android-arm64": "0.21.5",
+        "@esbuild/android-x64": "0.21.5",
+        "@esbuild/darwin-arm64": "0.21.5",
+        "@esbuild/darwin-x64": "0.21.5",
+        "@esbuild/freebsd-arm64": "0.21.5",
+        "@esbuild/freebsd-x64": "0.21.5",
+        "@esbuild/linux-arm": "0.21.5",
+        "@esbuild/linux-arm64": "0.21.5",
+        "@esbuild/linux-ia32": "0.21.5",
+        "@esbuild/linux-loong64": "0.21.5",
+        "@esbuild/linux-mips64el": "0.21.5",
+        "@esbuild/linux-ppc64": "0.21.5",
+        "@esbuild/linux-riscv64": "0.21.5",
+        "@esbuild/linux-s390x": "0.21.5",
+        "@esbuild/linux-x64": "0.21.5",
+        "@esbuild/netbsd-x64": "0.21.5",
+        "@esbuild/openbsd-x64": "0.21.5",
+        "@esbuild/sunos-x64": "0.21.5",
+        "@esbuild/win32-arm64": "0.21.5",
+        "@esbuild/win32-ia32": "0.21.5",
+        "@esbuild/win32-x64": "0.21.5"
+      }
+    },
+    "node_modules/fsevents": {
+      "version": "2.3.3",
+      "resolved": "https://registry.npmjs.org/fsevents/-/fsevents-2.3.3.tgz",
+      "integrity": "sha512-5xoDfX+fL7faATnagmWPpbFtwh/R77WmMMqqHGS65C3vvB0YHrgF+B1YmZ3441tMj5n63k0212XNoJwzlhffQw==",
+      "dev": true,
+      "hasInstallScript": true,
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "darwin"
+      ],
+      "engines": {
+        "node": "^8.16.0 || ^10.6.0 || >=11.0.0"
+      }
+    },
+    "node_modules/html-encoding-sniffer": {
+      "version": "6.0.0",
+      "resolved": "https://registry.npmjs.org/html-encoding-sniffer/-/html-encoding-sniffer-6.0.0.tgz",
+      "integrity": "sha512-CV9TW3Y3f8/wT0BRFc1/KAVQ3TUHiXmaAb6VW9vtiMFf7SLoMd1PdAc4W3KFOFETBJUb90KatHqlsZMWV+R9Gg==",
+      "dev": true,
+      "license": "MIT",
+      "dependencies": {
+        "@exodus/bytes": "^1.6.0"
+      },
+      "engines": {
+        "node": "^20.19.0 || ^22.12.0 || >=24.0.0"
+      }
+    },
+    "node_modules/is-potential-custom-element-name": {
+      "version": "1.0.1",
+      "resolved": "https://registry.npmjs.org/is-potential-custom-element-name/-/is-potential-custom-element-name-1.0.1.tgz",
+      "integrity": "sha512-bCYeRA2rVibKZd+s2625gGnGF/t7DSqDs4dP7CrLA1m7jKWz6pps0LpYLJN8Q64HtmPKJ1hrN3nzPNKFEKOUiQ==",
+      "dev": true,
+      "license": "MIT"
+    },
+    "node_modules/jsdom": {
+      "version": "29.1.1",
+      "resolved": "https://registry.npmjs.org/jsdom/-/jsdom-29.1.1.tgz",
+      "integrity": "sha512-ECi4Fi2f7BdJtUKTflYRTiaMxIB0O6zfR1fX0GXpUrf6flp8QIYn1UT20YQqdSOfk2dfkCwS8LAFoJDEppNK5Q==",
+      "dev": true,
+      "license": "MIT",
+      "dependencies": {
+        "@asamuzakjp/css-color": "^5.1.11",
+        "@asamuzakjp/dom-selector": "^7.1.1",
+        "@bramus/specificity": "^2.4.2",
+        "@csstools/css-syntax-patches-for-csstree": "^1.1.3",
+        "@exodus/bytes": "^1.15.0",
+        "css-tree": "^3.2.1",
+        "data-urls": "^7.0.0",
+        "decimal.js": "^10.6.0",
+        "html-encoding-sniffer": "^6.0.0",
+        "is-potential-custom-element-name": "^1.0.1",
+        "lru-cache": "^11.3.5",
+        "parse5": "^8.0.1",
+        "saxes": "^6.0.0",
+        "symbol-tree": "^3.2.4",
+        "tough-cookie": "^6.0.1",
+        "undici": "^7.25.0",
+        "w3c-xmlserializer": "^5.0.0",
+        "webidl-conversions": "^8.0.1",
+        "whatwg-mimetype": "^5.0.0",
+        "whatwg-url": "^16.0.1",
+        "xml-name-validator": "^5.0.0"
+      },
+      "engines": {
+        "node": "^20.19.0 || ^22.13.0 || >=24.0.0"
+      },
+      "peerDependencies": {
+        "canvas": "^3.0.0"
+      },
+      "peerDependenciesMeta": {
+        "canvas": {
+          "optional": true
+        }
+      }
+    },
+    "node_modules/lru-cache": {
+      "version": "11.5.2",
+      "resolved": "https://registry.npmjs.org/lru-cache/-/lru-cache-11.5.2.tgz",
+      "integrity": "sha512-4pfM1Ff0x50o0tQwb5ucw/RzNyD0/YJME6IVcStalZuMWxdt3sR3huStTtxz4PUmvZfRguvDejasvQ2kifR11g==",
+      "dev": true,
+      "license": "BlueOak-1.0.0",
+      "engines": {
+        "node": "20 || >=22"
+      }
+    },
+    "node_modules/mdn-data": {
+      "version": "2.27.1",
+      "resolved": "https://registry.npmjs.org/mdn-data/-/mdn-data-2.27.1.tgz",
+      "integrity": "sha512-9Yubnt3e8A0OKwxYSXyhLymGW4sCufcLG6VdiDdUGVkPhpqLxlvP5vl1983gQjJl3tqbrM731mjaZaP68AgosQ==",
+      "dev": true,
+      "license": "CC0-1.0"
+    },
+    "node_modules/nanoid": {
+      "version": "3.3.18",
+      "resolved": "https://registry.npmjs.org/nanoid/-/nanoid-3.3.18.tgz",
+      "integrity": "sha512-DTg4MJbGMWkfi6VZFdNt2/caMbQy4Ou+Op/hJQvGEWcnVfoA1QA+xzRKAzw9jD6+GVOOeYr/mIcuDSdug6F6+w==",
+      "dev": true,
+      "funding": [
+        {
+          "type": "github",
+          "url": "https://github.com/sponsors/ai"
+        }
+      ],
+      "license": "MIT",
+      "bin": {
+        "nanoid": "bin/nanoid.cjs"
+      },
+      "engines": {
+        "node": "^10 || ^12 || ^13.7 || ^14 || >=15.0.1"
+      }
+    },
+    "node_modules/parse5": {
+      "version": "8.0.1",
+      "resolved": "https://registry.npmjs.org/parse5/-/parse5-8.0.1.tgz",
+      "integrity": "sha512-z1e/HMG90obSGeidlli3hj7cbocou0/wa5HacvI3ASx34PecNjNQeaHNo5WIZpWofN9kgkqV1q5YvXe3F0FoPw==",
+      "dev": true,
+      "license": "MIT",
+      "dependencies": {
+        "entities": "^8.0.0"
+      },
+      "funding": {
+        "url": "https://github.com/inikulin/parse5?sponsor=1"
+      }
+    },
+    "node_modules/picocolors": {
+      "version": "1.1.1",
+      "resolved": "https://registry.npmjs.org/picocolors/-/picocolors-1.1.1.tgz",
+      "integrity": "sha512-xceH2snhtb5M9liqDsmEw56le376mTZkEX/jEb/RxNFyegNul7eNslCXP9FDj/Lcu0X8KEyMceP2ntpaHrDEVA==",
+      "dev": true,
+      "license": "ISC"
+    },
+    "node_modules/postcss": {
+      "version": "8.5.26",
+      "resolved": "https://registry.npmjs.org/postcss/-/postcss-8.5.26.tgz",
+      "integrity": "sha512-u82N74LFzG8ca+dD8puPnplTXoGH4fTPpVGuIbt36G3qvNlkvfD0lEAZSxaly3KX8TS/L1A1gsCEmvKmBcVbkQ==",
+      "dev": true,
+      "funding": [
+        {
+          "type": "opencollective",
+          "url": "https://opencollective.com/postcss/"
+        },
+        {
+          "type": "tidelift",
+          "url": "https://tidelift.com/funding/github/npm/postcss"
+        },
+        {
+          "type": "github",
+          "url": "https://github.com/sponsors/ai"
+        }
+      ],
+      "license": "MIT",
+      "dependencies": {
+        "nanoid": "^3.3.17",
+        "picocolors": "^1.1.1",
+        "source-map-js": "^1.2.1"
+      },
+      "engines": {
+        "node": "^10 || ^12 || >=14"
+      }
+    },
+    "node_modules/punycode": {
+      "version": "2.3.1",
+      "resolved": "https://registry.npmjs.org/punycode/-/punycode-2.3.1.tgz",
+      "integrity": "sha512-vYt7UD1U9Wg6138shLtLOvdAu+8DsC/ilFtEVHcH+wydcSpNE20AfSOduf6MkRFahL5FY7X1oU7nKVZFtfq8Fg==",
+      "dev": true,
+      "license": "MIT",
+      "engines": {
+        "node": ">=6"
+      }
+    },
+    "node_modules/require-from-string": {
+      "version": "2.0.2",
+      "resolved": "https://registry.npmjs.org/require-from-string/-/require-from-string-2.0.2.tgz",
+      "integrity": "sha512-Xf0nWe6RseziFMu+Ap9biiUbmplq6S9/p+7w7YXP/JBHhrUDDUhwa+vANyubuqfZWTveU//DYVGsDG7RKL/vEw==",
+      "dev": true,
+      "license": "MIT",
+      "engines": {
+        "node": ">=0.10.0"
+      }
+    },
+    "node_modules/rollup": {
+      "version": "4.62.4",
+      "resolved": "https://registry.npmjs.org/rollup/-/rollup-4.62.4.tgz",
+      "integrity": "sha512-RXOqwaPsBGjMNMa4sQjDjHieHEZDFoj/Rdr46l2MU5DfEs16wHJPC2RPTPHWhNl+M3aI472LLqFkFKut4SblOg==",
+      "dev": true,
+      "license": "MIT",
+      "dependencies": {
+        "@types/estree": "1.0.9"
+      },
+      "bin": {
+        "rollup": "dist/bin/rollup"
+      },
+      "engines": {
+        "node": ">=18.0.0",
+        "npm": ">=8.0.0"
+      },
+      "optionalDependencies": {
+        "@napi-rs/lzma-linux-x64-gnu": "1.5.1",
+        "@rollup/rollup-android-arm-eabi": "4.62.4",
+        "@rollup/rollup-android-arm64": "4.62.4",
+        "@rollup/rollup-darwin-arm64": "4.62.4",
+        "@rollup/rollup-darwin-x64": "4.62.4",
+        "@rollup/rollup-freebsd-arm64": "4.62.4",
+        "@rollup/rollup-freebsd-x64": "4.62.4",
+        "@rollup/rollup-linux-arm-gnueabihf": "4.62.4",
+        "@rollup/rollup-linux-arm-musleabihf": "4.62.4",
+        "@rollup/rollup-linux-arm64-gnu": "4.62.4",
+        "@rollup/rollup-linux-arm64-musl": "4.62.4",
+        "@rollup/rollup-linux-loong64-gnu": "4.62.4",
+        "@rollup/rollup-linux-loong64-musl": "4.62.4",
+        "@rollup/rollup-linux-ppc64-gnu": "4.62.4",
+        "@rollup/rollup-linux-ppc64-musl": "4.62.4",
+        "@rollup/rollup-linux-riscv64-gnu": "4.62.4",
+        "@rollup/rollup-linux-riscv64-musl": "4.62.4",
+        "@rollup/rollup-linux-s390x-gnu": "4.62.4",
+        "@rollup/rollup-linux-x64-gnu": "4.62.4",
+        "@rollup/rollup-linux-x64-musl": "4.62.4",
+        "@rollup/rollup-openbsd-x64": "4.62.4",
+        "@rollup/rollup-openharmony-arm64": "4.62.4",
+        "@rollup/rollup-win32-arm64-msvc": "4.62.4",
+        "@rollup/rollup-win32-ia32-msvc": "4.62.4",
+        "@rollup/rollup-win32-x64-gnu": "4.62.4",
+        "@rollup/rollup-win32-x64-msvc": "4.62.4",
+        "fsevents": "~2.3.2"
+      }
+    },
+    "node_modules/saxes": {
+      "version": "6.0.0",
+      "resolved": "https://registry.npmjs.org/saxes/-/saxes-6.0.0.tgz",
+      "integrity": "sha512-xAg7SOnEhrm5zI3puOOKyy1OMcMlIJZYNJY7xLBwSze0UjhPLnWfj2GF2EpT0jmzaJKIWKHLsaSSajf35bcYnA==",
+      "dev": true,
+      "license": "ISC",
+      "dependencies": {
+        "xmlchars": "^2.2.0"
+      },
+      "engines": {
+        "node": ">=v12.22.7"
+      }
+    },
+    "node_modules/source-map-js": {
+      "version": "1.2.1",
+      "resolved": "https://registry.npmjs.org/source-map-js/-/source-map-js-1.2.1.tgz",
+      "integrity": "sha512-UXWMKhLOwVKb728IUtQPXxfYU+usdybtUrK/8uGE8CQMvrhOpwvzDBwj0QhSL7MQc7vIsISBG8VQ8+IDQxpfQA==",
+      "dev": true,
+      "license": "BSD-3-Clause",
+      "engines": {
+        "node": ">=0.10.0"
+      }
+    },
+    "node_modules/symbol-tree": {
+      "version": "3.2.4",
+      "resolved": "https://registry.npmjs.org/symbol-tree/-/symbol-tree-3.2.4.tgz",
+      "integrity": "sha512-9QNk5KwDF+Bvz+PyObkmSYjI5ksVUYtjW7AU22r2NKcfLJcXp96hkDWU3+XndOsUb+AQ9QhfzfCT2O+CNWT5Tw==",
+      "dev": true,
+      "license": "MIT"
+    },
+    "node_modules/tldts": {
+      "version": "7.4.10",
+      "resolved": "https://registry.npmjs.org/tldts/-/tldts-7.4.10.tgz",
+      "integrity": "sha512-GgouD1B+sWwvkaEq8vXC15DjQitxbvs12oIXELpconwm+Tg3zfcEv4jgzq3vtKverDXsg3VI8aRgNL2Nra0Iog==",
+      "dev": true,
+      "license": "MIT",
+      "dependencies": {
+        "tldts-core": "^7.4.10"
+      },
+      "bin": {
+        "tldts": "bin/cli.js"
+      }
+    },
+    "node_modules/tldts-core": {
+      "version": "7.4.10",
+      "resolved": "https://registry.npmjs.org/tldts-core/-/tldts-core-7.4.10.tgz",
+      "integrity": "sha512-KnQjp53ZekKgm/r3l+u8kJGGzYgrWdP8+Mql7a4vijh2WE0IrZWspQj/TpTxDho/YxO+AnOZnIjQcCD+q6iJsw==",
+      "dev": true,
+      "license": "MIT"
+    },
+    "node_modules/tough-cookie": {
+      "version": "6.0.2",
+      "resolved": "https://registry.npmjs.org/tough-cookie/-/tough-cookie-6.0.2.tgz",
+      "integrity": "sha512-exgYmnmL/sJpR3upZfXG5PoatXQii55xAiXGXzY+sROLZ/Y+SLcp9PgJNI9Vz37HpQ74WvDcLT8eqm+kV3FzrA==",
+      "dev": true,
+      "license": "BSD-3-Clause",
+      "dependencies": {
+        "tldts": "^7.0.5"
+      },
+      "engines": {
+        "node": ">=16"
+      }
+    },
+    "node_modules/tr46": {
+      "version": "6.0.0",
+      "resolved": "https://registry.npmjs.org/tr46/-/tr46-6.0.0.tgz",
+      "integrity": "sha512-bLVMLPtstlZ4iMQHpFHTR7GAGj2jxi8Dg0s2h2MafAE4uSWF98FC/3MomU51iQAMf8/qDUbKWf5GxuvvVcXEhw==",
+      "dev": true,
+      "license": "MIT",
+      "dependencies": {
+        "punycode": "^2.3.1"
+      },
+      "engines": {
+        "node": ">=20"
+      }
+    },
+    "node_modules/undici": {
+      "version": "7.29.0",
+      "resolved": "https://registry.npmjs.org/undici/-/undici-7.29.0.tgz",
+      "integrity": "sha512-IDxfleLmmbSskfWSUATiN1nfn2rDuvnMOqb5CWR92iIfojA0Ud+ulOAAEQ57LPr9rWmsreUyf5lwyao+7GNNVw==",
+      "dev": true,
+      "license": "MIT",
+      "engines": {
+        "node": ">=20.18.1"
+      }
+    },
+    "node_modules/vite": {
+      "version": "5.4.21",
+      "resolved": "https://registry.npmjs.org/vite/-/vite-5.4.21.tgz",
+      "integrity": "sha512-o5a9xKjbtuhY6Bi5S3+HvbRERmouabWbyUcpXXUA1u+GNUKoROi9byOJ8M0nHbHYHkYICiMlqxkg1KkYmm25Sw==",
+      "dev": true,
+      "license": "MIT",
+      "dependencies": {
+        "esbuild": "^0.21.3",
+        "postcss": "^8.4.43",
+        "rollup": "^4.20.0"
+      },
+      "bin": {
+        "vite": "bin/vite.js"
+      },
+      "engines": {
+        "node": "^18.0.0 || >=20.0.0"
+      },
+      "funding": {
+        "url": "https://github.com/vitejs/vite?sponsor=1"
+      },
+      "optionalDependencies": {
+        "fsevents": "~2.3.3"
+      },
+      "peerDependencies": {
+        "@types/node": "^18.0.0 || >=20.0.0",
+        "less": "*",
+        "lightningcss": "^1.21.0",
+        "sass": "*",
+        "sass-embedded": "*",
+        "stylus": "*",
+        "sugarss": "*",
+        "terser": "^5.4.0"
+      },
+      "peerDependenciesMeta": {
+        "@types/node": {
+          "optional": true
+        },
+        "less": {
+          "optional": true
+        },
+        "lightningcss": {
+          "optional": true
+        },
+        "sass": {
+          "optional": true
+        },
+        "sass-embedded": {
+          "optional": true
+        },
+        "stylus": {
+          "optional": true
+        },
+        "sugarss": {
+          "optional": true
+        },
+        "terser": {
+          "optional": true
+        }
+      }
+    },
+    "node_modules/w3c-xmlserializer": {
+      "version": "5.0.0",
+      "resolved": "https://registry.npmjs.org/w3c-xmlserializer/-/w3c-xmlserializer-5.0.0.tgz",
+      "integrity": "sha512-o8qghlI8NZHU1lLPrpi2+Uq7abh4GGPpYANlalzWxyWteJOCsr/P+oPBA49TOLu5FTZO4d3F9MnWJfiMo4BkmA==",
+      "dev": true,
+      "license": "MIT",
+      "dependencies": {
+        "xml-name-validator": "^5.0.0"
+      },
+      "engines": {
+        "node": ">=18"
+      }
+    },
+    "node_modules/webidl-conversions": {
+      "version": "8.0.1",
+      "resolved": "https://registry.npmjs.org/webidl-conversions/-/webidl-conversions-8.0.1.tgz",
+      "integrity": "sha512-BMhLD/Sw+GbJC21C/UgyaZX41nPt8bUTg+jWyDeg7e7YN4xOM05YPSIXceACnXVtqyEw/LMClUQMtMZ+PGGpqQ==",
+      "dev": true,
+      "license": "BSD-2-Clause",
+      "engines": {
+        "node": ">=20"
+      }
+    },
+    "node_modules/whatwg-mimetype": {
+      "version": "5.0.0",
+      "resolved": "https://registry.npmjs.org/whatwg-mimetype/-/whatwg-mimetype-5.0.0.tgz",
+      "integrity": "sha512-sXcNcHOC51uPGF0P/D4NVtrkjSU2fNsm9iog4ZvZJsL3rjoDAzXZhkm2MWt1y+PUdggKAYVoMAIYcs78wJ51Cw==",
+      "dev": true,
+      "license": "MIT",
+      "engines": {
+        "node": ">=20"
+      }
+    },
+    "node_modules/whatwg-url": {
+      "version": "16.0.1",
+      "resolved": "https://registry.npmjs.org/whatwg-url/-/whatwg-url-16.0.1.tgz",
+      "integrity": "sha512-1to4zXBxmXHV3IiSSEInrreIlu02vUOvrhxJJH5vcxYTBDAx51cqZiKdyTxlecdKNSjj8EcxGBxNf6Vg+945gw==",
+      "dev": true,
+      "license": "MIT",
+      "dependencies": {
+        "@exodus/bytes": "^1.11.0",
+        "tr46": "^6.0.0",
+        "webidl-conversions": "^8.0.1"
+      },
+      "engines": {
+        "node": "^20.19.0 || ^22.12.0 || >=24.0.0"
+      }
+    },
+    "node_modules/xml-name-validator": {
+      "version": "5.0.0",
+      "resolved": "https://registry.npmjs.org/xml-name-validator/-/xml-name-validator-5.0.0.tgz",
+      "integrity": "sha512-EvGK8EJ3DhaHfbRlETOWAS5pO9MZITeauHKJyb8wyajUfQUenkIg2MvLDTZ4T/TgIcm3HU0TFBgWWboAZ30UHg==",
+      "dev": true,
+      "license": "Apache-2.0",
+      "engines": {
+        "node": ">=18"
+      }
+    },
+    "node_modules/xmlchars": {
+      "version": "2.2.0",
+      "resolved": "https://registry.npmjs.org/xmlchars/-/xmlchars-2.2.0.tgz",
+      "integrity": "sha512-JZnDKK8B0RCDw84FNdDAIpZK+JuJw+s7Lz8nksI7SIuU3UXJJslUthsi+uWBUYOwPFwW7W7PRLRfUKpxjtjFCw==",
+      "dev": true,
+      "license": "MIT"
+    }
+  }
+}
diff --git a/apps/ling-xu-wen-jian-lu/package.json b/apps/ling-xu-wen-jian-lu/package.json
new file mode 100644
index 0000000..43e8329
--- /dev/null
+++ b/apps/ling-xu-wen-jian-lu/package.json
@@ -0,0 +1,17 @@
+{
+  "name": "ling-xu-wen-jian-lu",
+  "version": "1.0.0",
+  "description": "《灵墟·问剑录》国风卡牌修仙 - Spirit Ruins: Record of Asking the Sword (card-collect gacha RPG)",
+  "type": "module",
+  "scripts": {
+    "dev": "vite",
+    "build": "vite build",
+    "preview": "vite preview --host",
+    "test": "node scripts/logic-test.mjs",
+    "test:dom": "node scripts/smoke-dom.mjs"
+  },
+  "devDependencies": {
+    "jsdom": "^29.1.1",
+    "vite": "^5.4.0"
+  }
+}
diff --git a/apps/ling-xu-wen-jian-lu/scripts/_css-loader.mjs b/apps/ling-xu-wen-jian-lu/scripts/_css-loader.mjs
new file mode 100644
index 0000000..b10c2fa
--- /dev/null
+++ b/apps/ling-xu-wen-jian-lu/scripts/_css-loader.mjs
@@ -0,0 +1,7 @@
+// 让 Node 的 ESM 加载器把 *.css 视作空模块（仅冒烟测试用）。
+export async function load(url, context, nextLoad) {
+  if (url.endsWith('.css')) {
+    return { format: 'module', source: '', shortCircuit: true };
+  }
+  return nextLoad(url, context);
+}
diff --git a/apps/ling-xu-wen-jian-lu/scripts/logic-test.mjs b/apps/ling-xu-wen-jian-lu/scripts/logic-test.mjs
new file mode 100644
index 0000000..5a30ff8
--- /dev/null
+++ b/apps/ling-xu-wen-jian-lu/scripts/logic-test.mjs
@@ -0,0 +1,423 @@
+// 纯逻辑自测（不依赖浏览器/DOM）。运行：npm test
+import {
+  counterMult, COUNTER_GAIN, COUNTER_LOSS, computeDamage, CRIT_MULT,
+  effectiveStat, cardCap, expForLevel, rarityDef, RARITIES, cardPower,
+  starCost, starTiandao, GACHA, PILL_EXP, BREAK_STONE,
+  clamp, dayKey, initiative, POS_AGGRO, CAVE_CAP_HOURS,
+} from '../src/config.js';
+import { CARDS, CARD_MAP, cardDef } from '../src/data/cards.js';
+import { BOSSES, makeEnemy, makeBoss, makeEnemyFormation, makeBossPower } from '../src/data/enemies.js';
+import {
+  newPlayer, recompute, addRes, countRes, canAfford, spendRes,
+  ownCard, addFrag, countFrag, hasCard, setFormation, activeFormation, formationPower,
+  collectionCount, collectionTotal, collectionProgress, totalStars,
+} from '../src/core/player.js';
+import { newInstance, instanceStats, instancePower, skillMult, isMaxLevel } from '../src/core/card.js';
+import {
+  canLevelUp, levelCeiling, feedPill, addExp, breakCost, canBreakThrough, doBreakThrough,
+  starUpCost, canStarUp, doStarUp, canSkillUp, doSkillUp, MAX_SKILL_LEVEL,
+} from '../src/core/cultivate.js';
+import { drawOne, drawTen, dailyFreeAvailable, pitySSRRemaining, pitySRRemaining } from '../src/core/gacha.js';
+import {
+  buildCombatant, createBattle, stepRound, runBattle, playerSpecsFrom,
+} from '../src/core/battle.js';
+import {
+  CHAPTERS, stagesForChapter, stageDef, canEnterStage, isStageCleared, enterStage,
+} from '../src/core/stage.js';
+import { enterFloor, tianOf, floorPower, TOTAL_FLOORS, resetSecret } from '../src/core/secret.js';
+import { collectCave, previewCave, caveTotalLevel } from '../src/core/cave.js';
+import { ACHIEVEMENTS, ACH_CATS, checkAchievements, achProgress, rewardDesc } from '../src/core/achievements.js';
+import { hasSave, saveGame, loadGame, clearSave, exportSave, importSave, listSlots, _setStorage, _NUM_SLOTS } from '../src/core/save.js';
+import { makeRng, weighted, pick, chance } from '../src/core/rng.js';
+
+let pass = 0; let fail = 0;
+const ok = (cond, msg) => { if (cond) pass++; else { fail++; console.error('  ✗ FAIL:', msg); } };
+const near = (a, b, eps = 0.001) => Math.abs(a - b) <= eps;
+
+// ---------- 配置 / 五行 ----------
+console.log('— config / elements —');
+ok(RARITIES.length === 3, '3 个稀有度');
+ok(rarityDef('SSR').rate === 0.05 && rarityDef('SR').rate === 0.25 && rarityDef('R').rate === 0.70, '稀有度概率 70/25/5');
+ok(counterMult('metal', 'wood') === COUNTER_GAIN, '金克木 ×1.30');
+ok(counterMult('wood', 'metal') === COUNTER_LOSS, '木被金克 ×0.85');
+ok(counterMult('fire', 'fire') === 1, '同五行 ×1');
+ok(counterMult('water', 'fire') === COUNTER_GAIN, '水克火 ×1.30');
+ok(counterMult('earth', 'water') === COUNTER_GAIN, '土克水 ×1.30');
+ok(counterMult('fire', 'metal') === COUNTER_GAIN, '火克金 ×1.30');
+ok(counterMult('wood', 'earth') === COUNTER_GAIN, '木克土 ×1.30');
+ok(counterMult('none', 'fire') === 1, '无属性不克制');
+
+// 伤害公式（设计稿 4.4）
+{
+  // rng=0.5 → variance 1.0；非暴击；金克木 → 1.30
+  const d = computeDamage({ atk: 100, def: 20, mult: 1.0, atkEl: 'metal', defEl: 'wood', crit: false, rng: () => 0.5 });
+  // (100*1 - 20*0.5)*1.30*1*1.0 + 0 = (100-10)*1.30 = 117
+  ok(d === 117, `金克木伤害 117（实际 ${d}）`);
+  // 保底
+  const d2 = computeDamage({ atk: 100, def: 9999, mult: 1, rng: () => 0.5 });
+  ok(d2 >= 5, `伤害保底 ≥ 攻击×5%（实际 ${d2}）`);
+  // 暴击
+  const d3 = computeDamage({ atk: 100, def: 0, mult: 1, crit: true, rng: () => 0.5 });
+  ok(d3 === Math.round(100 * 1 * CRIT_MULT * 1.0), `暴击 ×1.5（实际 ${d3}）`);
+}
+
+// 属性派生
+{
+  const s = effectiveStat(100, 10, 2, 3); // lvl10,br2,star3
+  const expect = 100 * (1 + 0.05 * 9) * (1 + 0.08 * 2) * (1 + 0.12 * 3);
+  ok(near(s, expect), 'effectiveStat 公式');
+  ok(cardCap(rarityDef('R'), 0) === 30 && cardCap(rarityDef('R'), 5) === 80, 'R 等级上限 30→80');
+  ok(cardCap(rarityDef('SSR'), 0) === 50 && cardCap(rarityDef('SSR'), 6) === 110, 'SSR 等级上限 50→110');
+  ok(expForLevel(1) < expForLevel(10) && expForLevel(10) < expForLevel(30), '经验单调递增');
+  ok(typeof PILL_EXP.exp_s === 'number' && PILL_EXP.exp_l > PILL_EXP.exp_s, '修为丹经验梯度');
+}
+
+// ---------- 卡牌数据完整性 ----------
+console.log('— cards integrity —');
+ok(CARDS.length === 15, `共 15 张卡（实际 ${CARDS.length}）`);
+ok(CARDS.filter((c) => c.rarity === 'R').length === 9, '9 张 R 卡');
+ok(CARDS.filter((c) => c.rarity === 'SR').length === 4, '4 张 SR 卡');
+ok(CARDS.filter((c) => c.rarity === 'SSR').length === 2, '2 张 SSR 卡');
+ok(CARDS.every((c) => c.actives && c.actives.length >= 1), '每张卡至少 1 个主动技');
+ok(CARDS.every((c) => ['metal', 'wood', 'water', 'fire', 'earth'].includes(c.element)), '卡牌五行合法');
+ok(CARDS.every((c) => typeof c.story === 'string' && c.story.length > 0), '每张卡有故事');
+// SSR 必有被动
+ok(CARDS.filter((c) => c.rarity === 'SSR').every((c) => c.passives.length >= 2), 'SSR 至少 2 个被动');
+
+// ---------- 玩家 / 资源 ----------
+console.log('— player / resources —');
+let p = newPlayer();
+ok(Object.keys(p.cards).length === 4, '初始 4 张 R 卡');
+ok(p.formation.filter(Boolean).length === 4, '初始阵容 4 人');
+ok(countRes(p, 'wendao') === 10, '初始 10 问道令');
+ok(countRes(p, 'lingshi') === 3000, '初始 3000 灵石');
+ok(collectionCount(p) === 4 && collectionTotal() === 15, '图鉴 4/15');
+addRes(p, 'lingshi', 500);
+ok(countRes(p, 'lingshi') === 3500, 'addRes 累加');
+ok(canAfford(p, { lingshi: 1000 }) === true, '可负担');
+ok(spendRes(p, { lingshi: 1000 }) === true && countRes(p, 'lingshi') === 2500, 'spendRes 扣除');
+ok(canAfford(p, { lingshi: 99999 }) === false, '超额不可负担');
+// 卡牌 / 碎片
+ok(ownCard(p, 'SR001') === true, '获得 SR001（新）');
+ok(hasCard(p, 'SR001') === true, '拥有 SR001');
+addFrag(p, 'R001', 5);
+ok(countFrag(p, 'R001') === 5, '碎片累加');
+// 阵容
+ok(setFormation(p, ['R001', 'SR001', 'R003', 'R006', 'R007']) === true, '设置阵容');
+ok(p.formation[1] === 'SR001', '阵容记录');
+ok(activeFormation(p).length === 5, '5 人有效阵容');
+ok(formationPower(p) > 0, '阵容战力 > 0');
+// 同卡不可重复上阵
+setFormation(p, ['R001', 'R001', 'R003', 'R006', 'R007']);
+ok(p.formation.filter((x) => x === 'R001').length === 1, '同卡不重复上阵');
+ok(p.formation[1] === null && activeFormation(p).length === 4, '重复位被置空（4 人有效）');
+
+// recompute 兜底（损坏档）
+{
+  const q = newPlayer();
+  q.formation = ['NOPE', 'R001', 'R001', null, null];
+  q.res.lingshi = -50;
+  q.cards.R001.level = -3;
+  recompute(q);
+  ok(q.formation[0] === null, 'recompute 清除非法阵容引用');
+  ok(q.res.lingshi === 0, 'recompute 钳制负数资源');
+  ok(q.cards.R001.level === 1, 'recompute 修正非法等级');
+}
+
+// ---------- 养成 ----------
+console.log('— cultivate —');
+{
+  const inst = p.cards.R001;
+  ok(isMaxLevel(inst) === false, '初始未满级');
+  ok(canLevelUp(inst) === true, '可升级');
+  // 喂大丹 → 至少升若干级
+  addRes(p, 'exp_l', 20);
+  const lv0 = inst.level;
+  const r = feedPill(p, inst, 'exp_l', 5);
+  ok(r.ok === true, '喂丹成功');
+  ok(inst.level > lv0, '喂丹后等级提升');
+  ok(countRes(p, 'exp_l') >= 0, '丹药消耗');
+  // 技能升级
+  ok(canSkillUp(p, inst) === true, '可升级技能');
+  const sl0 = inst.skillLv;
+  doSkillUp(p, inst);
+  ok(inst.skillLv === sl0 + 1, '技能等级 +1');
+  ok(skillMult(inst) > skillMult({ ...inst, skillLv: 1 }), '技能倍率随等级提升');
+}
+// 突破：把卡升到 10 级瓶颈
+{
+  const q = newPlayer();
+  q.res.lingshi = 1e9; q.res.exp_l = 1e9;
+  const inst = q.cards.R001;
+  // 把灵石/丹药灌满，升到 10 级
+  while (canLevelUp(inst) && inst.level < levelCeiling(inst)) feedPill(q, inst, 'exp_l', 50);
+  ok(inst.level === 10, `喂满到 10 级瓶颈（实际 ${inst.level}）`);
+  ok(canLevelUp(inst) === false, '瓶颈处不可继续升级');
+  // 给突破石
+  const stone = BREAK_STONE[cardDef(inst.id).element];
+  q.res[stone] = 99;
+  ok(canBreakThrough(q, inst) === true, '可突破');
+  doBreakThrough(q, inst);
+  ok(inst.br === 1, '突破后 br=1');
+  ok(canLevelUp(inst) === true, '突破后可继续升级');
+}
+// 升星
+{
+  const q = newPlayer();
+  addFrag(q, 'R001', 99);
+  q.res.tiandao_f = 99;
+  const inst = q.cards.R001;
+  const s0 = inst.star;
+  ok(canStarUp(q, inst) === true, '可升星');
+  doStarUp(q, inst);
+  ok(inst.star === s0 + 1, '星级 +1');
+  ok(totalStars(q) >= 1, '累计星级统计');
+  // 满星不可再升
+  inst.star = rarityDef('R').maxStar;
+  ok(canStarUp(q, inst) === false, '满星不可再升');
+}
+
+// ---------- 问道（抽卡）----------
+console.log('— gacha —');
+{
+  const q = newPlayer();
+  q.res.wendao = 200;
+  ok(dailyFreeAvailable(q) === true, '每日免费可用');
+  const free = drawOne(q, makeRng(1), { free: true });
+  ok(!free.error && free.results.length === 1, '免费单抽成功');
+  ok(dailyFreeAvailable(q) === false, '免费单抽后当日不可再用');
+  ok(q.res.wendao === 200, '免费单抽不消耗问道令');
+  ok(q.stats.draws === 1, '抽卡计数 +1');
+  // 问道令不足：清零后单抽应被拒
+  q.res.wendao = 0;
+  ok(drawOne(q, makeRng(2)).error, '问道令不足单抽被拒');
+  // 十连：补回令牌后消耗 10 令
+  q.res.wendao = 200;
+  const ten = drawTen(q, makeRng(3));
+  ok(!ten.error && ten.results.length === 10, '十连成功 10 张');
+  ok(q.res.wendao === 190, '十连消耗 10 令');
+  // 十连保底至少 1 张 SR
+  ok(ten.results.some((r) => r.rarity === 'SR' || r.rarity === 'SSR'), '十连保底至少 1 张 SR+');
+  // 重复 → 碎片
+  {
+    const q2 = newPlayer(); q2.res.wendao = 500;
+    // 多次十连直到出现重复
+    let dupSeen = false;
+    for (let i = 0; i < 40 && !dupSeen; i++) {
+      const r = drawTen(q2, makeRng(100 + i));
+      if (r.results.some((x) => x.frag > 0)) dupSeen = true;
+    }
+    ok(dupSeen, '十连会出现重复并产出碎片');
+  }
+  // 保底 SSR：累计 90 抽必出
+  {
+    const q3 = newPlayer(); q3.res.wendao = 9999;
+    let gotSSR = false;
+    for (let i = 0; i < 100 && !gotSSR; i++) { const r = drawOne(q3, makeRng(i)); if (r.results && r.results[0].rarity === 'SSR') gotSSR = true; }
+    ok(gotSSR, '100 抽内必出 SSR（90 抽保底）');
+  }
+}
+
+// ---------- 战斗 ----------
+console.log('— battle —');
+{
+  const q = newPlayer();
+  // 给玩家强力卡（升星升满）
+  ownCard(q, 'SSR001'); ownCard(q, 'SSR002'); ownCard(q, 'SR002');
+  setFormation(q, ['SSR001', 'SR002', 'R003', 'SSR002', 'R006']);
+  const specs = playerSpecsFrom(q);
+  ok(specs.length === 5, '5 人阵容 spec');
+  const enemies = makeEnemyFormation(300, 'fire', 'normal', makeRng(1));
+  ok(enemies.length >= 1, '敌方阵容非空');
+  const run = runBattle(specs, enemies, makeRng(7));
+  ok(['win', 'lose'].includes(run.result), '战斗有结果');
+  ok(run.rounds > 0 && run.rounds <= 60, `战斗回合数合理（${run.rounds}）`);
+}
+// 必胜路径：满星 SSR vs 单只弱怪
+{
+  const q = newPlayer();
+  ownCard(q, 'SSR001');
+  // 拉满
+  const inst = q.cards.SSR001;
+  inst.star = 6; inst.level = 110; inst.br = 11; inst.skillLv = 11;
+  setFormation(q, ['SSR001', null, null, null, null]);
+  const specs = playerSpecsFrom(q);
+  const enemy = [makeEnemy(120, 'wood', makeRng(0))]; // 木系，被 SSR001 火系克制
+  const run = runBattle(specs, enemy, makeRng(2));
+  ok(run.result === 'win', `满星 SSR 应战胜弱怪（${run.result}）`);
+}
+// 必败路径：1 张空 R 卡 vs 高战力 Boss
+{
+  const q = newPlayer();
+  setFormation(q, ['R001', null, null, null, null]);
+  const specs = playerSpecsFrom(q);
+  const boss = [makeBoss(11, makeRng(0))]; // 蚩尤完全体
+  const run = runBattle(specs, boss, makeRng(5));
+  ok(run.result === 'lose', `1 张空 R 卡应败给最终 Boss（${run.result}）`);
+}
+// SSR 被动：蚩尤濒死复活
+{
+  const q = newPlayer();
+  ownCard(q, 'SSR001');
+  setFormation(q, ['SSR001', null, null, null, null]);
+  const specs = playerSpecsFrom(q);
+  // 强敌但能打几回合，让 SSR 触发复活/狂暴
+  const enemy = [makeBoss(6, makeRng(0))];
+  let crashed = false;
+  try { runBattle(specs, enemy, makeRng(9)); } catch (e) { crashed = true; console.error(e); }
+  ok(!crashed, 'SSR 战斗链路不抛异常');
+}
+// 战斗海量随机覆盖不抛错
+{
+  let crashed = false;
+  try {
+    for (let i = 0; i < 60; i++) {
+      const q = newPlayer();
+      ownCard(q, pick(makeRng(i), CARDS).id);
+      setFormation(q, [Object.keys(q.cards)[0], null, null, null, null]);
+      const specs = playerSpecsFrom(q);
+      const enemies = makeEnemyFormation(200 + i * 20, pick(makeRng(i), ['fire', 'water', 'wood', 'metal', 'earth', 'none']), i % 3 === 0 ? 'boss' : 'normal', makeRng(i));
+      runBattle(specs, enemies, makeRng(i));
+    }
+  } catch (e) { crashed = true; console.error(e); }
+  ok(!crashed, '战斗海量随机覆盖全程不抛异常');
+}
+
+// ---------- 主线关卡 ----------
+console.log('— stages —');
+ok(CHAPTERS.length === 12, '12 章');
+ok(stagesForChapter(0).length === 7, '每章 7 关');
+ok(stageDef('1-7').type === 'boss', '1-7 为首领关');
+ok(stageDef('1-6').type === 'elite', '1-6 为精英关');
+ok(stageDef('1-1').type === 'normal', '1-1 为普通关');
+ok(canEnterStage(newPlayer(), '1-1') === true, '1-1 可进入');
+ok(canEnterStage(newPlayer(), '1-2') === false, '1-2 未通关 1-1 前不可进入');
+ok(canEnterStage(newPlayer(), '2-1') === false, '第二章未解锁');
+{
+  const q = newPlayer();
+  ownCard(q, 'SSR001'); ownCard(q, 'SSR002'); ownCard(q, 'SR002'); ownCard(q, 'SR001');
+  // 拉满便于通关测试
+  for (const id of Object.keys(q.cards)) { const inst = q.cards[id]; inst.star = rarityDef(cardDef(id).rarity).maxStar; inst.level = 110; inst.br = 11; inst.skillLv = 11; }
+  setFormation(q, ['SSR001', 'SR002', 'R003', 'SSR002', 'R006']);
+  const r = enterStage(q, '1-1', makeRng(1));
+  ok(r.ok === true, '进入 1-1 成功');
+  ok(r.result === 'win', `满级队应胜 1-1（${r.result}）`);
+  ok(isStageCleared(q, '1-1') === true, '1-1 标记通关');
+  ok(canEnterStage(q, '1-2') === true, '1-1 通关后 1-2 解锁');
+  // 通关首领解锁下一章
+  enterStage(q, '1-6', makeRng(2));
+  const boss = enterStage(q, '1-7', makeRng(3));
+  if (boss.result === 'win') ok(q.story.highestChapter === 2, '通关 1-7 解锁第二章');
+  ok(q.stats.stagesCleared >= 1, '通关计数');
+}
+
+// ---------- 敌人 / Boss ----------
+console.log('— enemies —');
+ok(BOSSES.length === 12, '12 个 Boss');
+ok(BOSSES[0].element === 'earth' && BOSSES[11].name.includes('蚩尤'), '首尾 Boss 正确');
+{
+  const e = makeEnemy(500, 'fire', makeRng(1));
+  ok(e.stats.atk > 0 && e.stats.hp > 0 && e.actives.length >= 1, '小怪属性完整');
+  const b = makeBoss(2, makeRng(1));
+  ok(b.isBoss === true && b.passives.length >= 1, 'Boss 标记 + 有被动');
+  const form = makeEnemyFormation(1000, 'wood', 'boss', makeRng(1));
+  ok(form.length >= 1 && form[0].isBoss, 'boss 阵容含 Boss');
+}
+
+// ---------- 秘境 ----------
+console.log('— secret —');
+ok(TOTAL_FLOORS === 90, '90 层');
+ok(tianOf(1) === 1 && tianOf(10) === 1 && tianOf(11) === 2 && tianOf(90) === 9, '重天划分');
+ok(floorPower(1) < floorPower(50) && floorPower(50) < floorPower(90), '战力随层数递增');
+{
+  const q = newPlayer();
+  ownCard(q, 'SSR001'); ownCard(q, 'SSR002'); ownCard(q, 'SR002');
+  for (const id of Object.keys(q.cards)) { const inst = q.cards[id]; inst.star = rarityDef(cardDef(id).rarity).maxStar; inst.level = 110; inst.br = 11; inst.skillLv = 11; }
+  setFormation(q, ['SSR001', 'SR002', 'R003', 'SSR002', 'R006']);
+  let crashed = false;
+  try {
+    for (let i = 0; i < 30; i++) enterFloor(q, makeRng(i));
+  } catch (e) { crashed = true; console.error(e); }
+  ok(!crashed, '秘境 30 层不抛异常');
+  ok(q.secret.floor >= 1, '秘境层数有效');
+}
+// 秘境战败回存档层
+{
+  const q = newPlayer(); // 空队伍弱卡
+  setFormation(q, ['R001', null, null, null, null]);
+  const before = q.secret.floor;
+  enterFloor(q, makeRng(3)); // 大概率战败
+  ok(q.secret.floor <= before, '秘境战败不前进（回存档层）');
+}
+
+// ---------- 洞府挂机 ----------
+console.log('— cave —');
+{
+  const q = newPlayer();
+  q.cave.lastSeen = Math.floor(Date.now() / 1000) - 7200; // 2 小时前
+  const stones0 = countRes(q, 'lingshi');
+  const off = collectCave(q);
+  ok(off.seconds > 0 && off.lingshi > 0, '离线 2 小时有灵石收益');
+  ok(countRes(q, 'lingshi') === stones0 + off.lingshi, '离线灵石入账');
+  // 上限
+  q.cave.lastSeen = 1;
+  const cap = collectCave(q);
+  ok(cap.capped === true, '超 12 小时被截断');
+  ok(CAVE_CAP_HOURS === 12, '离线上限 12 小时');
+  ok(caveTotalLevel(q) > 0, '卡牌总等级 > 0');
+  // 预览不改状态
+  const v = previewCave(q);
+  ok(typeof v.lingshi === 'number', 'previewCave 返回数值');
+}
+
+// ---------- 成就 ----------
+console.log('— achievements —');
+ok(ACHIEVEMENTS.length >= 12, `成就 >= 12（实际 ${ACHIEVEMENTS.length}）`);
+ok(ACH_CATS.length >= 5, '成就分类 >= 5');
+ok(ACHIEVEMENTS.every((a) => ACH_CATS.some((c) => c.id === a.cat)), '每个成就归属分类');
+ok(ACHIEVEMENTS.every((a) => a.goal.target > 0), '每条成就有目标');
+{
+  const q = newPlayer();
+  ok(checkAchievements(q).length === 0, '新角色不触发成就');
+  q.stats.draws = 1;
+  const g = checkAchievements(q);
+  ok(g.some((a) => a.id === 'ach_first_draw'), '首次问道成就触发');
+  ok(q.achievements.includes('ach_first_draw'), '成就入库');
+  ok(checkAchievements(q).length === 0, '已获成就不重复授予');
+  ok(typeof rewardDesc({ wendao: 5 }) === 'string' && rewardDesc({ wendao: 5 }).includes('问道令'), 'rewardDesc 含名称');
+}
+
+// ---------- 存档 ----------
+console.log('— save —');
+const store = {};
+_setStorage({ getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } });
+ok(hasSave() === false, '初始无存档');
+ok(_NUM_SLOTS() === 3, '3 个存档槽');
+{
+  const q = newPlayer();
+  ownCard(q, 'SR001');
+  saveGame(q);
+  ok(hasSave() === true, '存档后存在');
+  const loaded = loadGame();
+  ok(loaded && hasCard(loaded, 'SR001') === true, '读档往返一致');
+  const str = exportSave(q);
+  ok(typeof str === 'string' && str.length > 10, '导出为字符串');
+  const imp = importSave(str);
+  ok(imp && hasCard(imp, 'SR001'), '导入还原');
+  ok(importSave('!!!not valid!!!') === null, '损坏字符串安全降级');
+}
+// 多槽
+{
+  clearSave();
+  const q1 = newPlayer(); ownCard(q1, 'SR001'); saveSlot2(1, q1);
+  const q2 = newPlayer(); ownCard(q2, 'SSR001'); saveSlot2(2, q2);
+  const list = listSlots();
+  ok(list.length === 3, '列出 3 槽');
+  ok(list[0].empty === false && list[1].empty === false && list[2].empty === true, '槽 1/2 占用、槽 3 空');
+  ok(list[0].cards >= 4, '槽元信息含卡牌数');
+}
+function saveSlot2(n, player) { player.slot = n; saveGame(player); }
+clearSave();
+
+console.log(`\n结果: ${pass} 通过, ${fail} 失败`);
+process.exit(fail ? 1 : 0);
diff --git a/apps/ling-xu-wen-jian-lu/scripts/smoke-dom.mjs b/apps/ling-xu-wen-jian-lu/scripts/smoke-dom.mjs
new file mode 100644
index 0000000..4e3ba67
--- /dev/null
+++ b/apps/ling-xu-wen-jian-lu/scripts/smoke-dom.mjs
@@ -0,0 +1,151 @@
+// DOM 冒烟测试：用 jsdom 驱动真实 UI 流程（存档选择 → 开档 → 各功能页 → 问道 → 主线战斗 → 存档）。
+// 运行：node scripts/smoke-dom.mjs   （需先 npm install jsdom）
+import { JSDOM } from 'jsdom';
+import { register } from 'node:module';
+
+// 把 *.css 当作空模块（app.js 顶部 import 了样式表）
+register('./_css-loader.mjs', import.meta.url);
+
+const dom = new JSDOM('<!DOCTYPE html><div id="game-container"></div>', {
+  url: 'http://localhost/',
+  pretendToBeVisual: true,
+});
+const { window } = dom;
+for (const k of ['document', 'window', 'localStorage', 'navigator', 'HTMLElement', 'Node', 'Element', 'getComputedStyle', 'CustomEvent', 'MouseEvent', 'Event']) {
+  if (window[k] === undefined) continue;
+  try { globalThis[k] = window[k]; } catch (_) { /* Node 部分全局只读，跳过 */ }
+}
+globalThis.requestAnimationFrame = (fn) => setTimeout(fn, 0);
+
+let pass = 0, fail = 0;
+const ok = (c, m) => { if (c) pass++; else { fail++; console.error('  ✗ FAIL:', m); } };
+const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
+
+let lastToastText = '';
+const watchToasts = (ui) => {
+  const wrap = ui.toastWrap;
+  if (!wrap) return;
+  new window.MutationObserver((mutations) => {
+    for (const m of mutations) for (const node of m.addedNodes) {
+      if (node.classList && node.classList.contains('toast')) lastToastText = node.textContent;
+    }
+  }).observe(wrap, { childList: true });
+};
+
+localStorage.clear();
+const { createGame } = await import(new URL('../src/main.js', import.meta.url).href);
+
+// ---------- 1) 首启：存档选择页 ----------
+let ui = window.__LXX;
+ok(!!ui, 'main.js 自动挂载并暴露 __LXX');
+await sleep(10);
+ok(document.querySelectorAll('.slot-card').length === 3, `首启展示 3 个存档槽（实际 ${document.querySelectorAll('.slot-card').length}）`);
+ok(document.querySelector('.launcher') !== null, '渲染存档选择启动器');
+watchToasts(ui);
+
+// ---------- 2) 槽 1 新建 → 进入游戏 ----------
+document.querySelectorAll('.slot-card.empty .btn-primary')[0].click();
+await sleep(10);
+ok(document.querySelector('.topbar') !== null, '开档后渲染顶栏');
+ok(document.querySelector('.tabnav') !== null, '渲染底部 Tab 导航');
+ok(document.querySelector('.content') !== null, '渲染内容区');
+ok(Object.keys(ui.player.cards).length === 4, `初始 4 张卡（实际 ${Object.keys(ui.player.cards).length}）`);
+
+// ---------- 3) 各功能页渲染不报错 ----------
+{
+  let renderErr = null;
+  try {
+    for (const tab of ['lineup', 'ask', 'cultivate', 'stage', 'secret', 'cave', 'codex', 'setting']) {
+      ui.tab = tab; ui.refresh(); await sleep(5);
+    }
+  } catch (e) { renderErr = e; }
+  ok(!renderErr, `八大功能页渲染无异常（${renderErr ? renderErr.message : 'ok'}）`);
+  ui.tab = 'lineup'; ui.refresh();
+}
+
+// ---------- 4) 阵容：一键最强 + 卡牌上阵/移下 ----------
+{
+  ui.tab = 'lineup'; ui.refresh(); await sleep(5);
+  ok(document.querySelectorAll('.mini-card').length >= 4, '阵容页列出我的卡牌');
+  const autoBtn = [...document.querySelectorAll('.content button')].find((b) => /一键最强/.test(b.textContent));
+  ok(!!autoBtn, '有一键最强阵容按钮');
+  autoBtn.click(); await sleep(5);
+  ok(ui.player.formation.filter(Boolean).length === Math.min(5, Object.keys(ui.player.cards).length), '一键最强填满阵容');
+}
+
+// ---------- 5) 问道：每日免费单抽 → 结果弹窗 ----------
+{
+  ui.tab = 'ask'; ui.refresh(); await sleep(5);
+  const freeBtn = [...document.querySelectorAll('.content button')].find((b) => /免费/.test(b.textContent));
+  ok(!!freeBtn && !freeBtn.disabled, '有可用的每日免费单抽按钮');
+  freeBtn.click(); await sleep(10);
+  ok(document.querySelector('.sheet') !== null, '抽卡后弹出结果弹窗');
+  ok(document.querySelectorAll('.gacha-card').length === 1, '单抽展示 1 张卡');
+  ui.closeModal(); await sleep(5);
+  ok(document.querySelector('.sheet') === null, '关闭弹窗');
+  // 再次免费应被禁用
+  ui.refresh(); await sleep(5);
+  const freeBtn2 = [...document.querySelectorAll('.content button')].find((b) => /免费/.test(b.textContent));
+  ok(freeBtn2.disabled, '今日免费已用后按钮禁用');
+}
+
+// ---------- 6) 修炼：喂修为丹升卡 ----------
+{
+  // 给点丹药与灵石
+  ui.player.res.lingshi = 99999; ui.player.res.exp_m = 10; ui.player.res.exp_l = 10;
+  ui.tab = 'cultivate'; ui.refresh(); await sleep(5);
+  ok(document.querySelectorAll('.picker-chip').length >= 4, '修炼页列出卡牌选择器');
+  ok(document.querySelector('.cult-card') !== null, '展示当前卡牌详情');
+  const bigBtn = [...document.querySelectorAll('.content button')].find((b) => /大丹/.test(b.textContent));
+  ok(!!bigBtn, '有大丹喂食按钮');
+  const lv0 = ui.player.cards[ui.cultivateId].level;
+  bigBtn.click(); await sleep(5);
+  ok(ui.player.cards[ui.cultivateId].level > lv0, `喂大丹后等级提升（${lv0} → ${ui.player.cards[ui.cultivateId].level}）`);
+}
+
+// ---------- 7) 主线：进入 1-1 战斗 → 弹窗结算 ----------
+{
+  ui.tab = 'stage'; ui.refresh(); await sleep(5);
+  ok(/初入灵墟/.test(document.querySelector('.content')?.textContent || ''), '主线页展示当前章节');
+  // 给玩家强力卡便于通关
+  const p = ui.player;
+  // 通过导入核心 API 直接拉满一张 SSR
+  const { ownCard } = await import(new URL('../src/core/player.js', import.meta.url).href);
+  const { cardDef } = await import(new URL('../src/data/cards.js', import.meta.url).href);
+  const { rarityDef } = await import(new URL('../src/config.js', import.meta.url).href);
+  ownCard(p, 'SSR001'); ownCard(p, 'SSR002'); ownCard(p, 'SR002');
+  for (const id of Object.keys(p.cards)) {
+    const inst = p.cards[id]; const r = rarityDef(cardDef(id).rarity);
+    inst.star = r.maxStar; inst.level = 110; inst.br = 11; inst.skillLv = 11;
+  }
+  ui.autoFormation(); await sleep(5);
+  const stageBtn = [...document.querySelectorAll('.stage-row')].find((b) => /1-1/.test(b.textContent));
+  ok(!!stageBtn, '1-1 关卡可点');
+  stageBtn.click(); await sleep(10);
+  ok(document.querySelector('.sheet') !== null, '战斗后弹出结算弹窗');
+  ok(/胜/.test(document.querySelector('.battle__result')?.textContent || '') || /败/.test(document.querySelector('.battle__result')?.textContent || ''), '结算弹窗有胜负结果');
+  const confirmBtn = [...document.querySelectorAll('.sheet__foot button')].find((b) => /确定/.test(b.textContent));
+  confirmBtn.click(); await sleep(5);
+  ok(document.querySelector('.sheet') === null, '确定后关闭结算弹窗');
+}
+
+// ---------- 8) 设置：导出存档码 ----------
+{
+  ui.tab = 'setting'; ui.refresh(); await sleep(5);
+  const ta = document.querySelector('.save-code');
+  ok(!!ta && ta.value.length > 10, '设置页展示存档码');
+  ok(document.querySelectorAll('.achv').length > 0, '设置页列出成就');
+}
+
+// ---------- 9) 持久化：重开后槽 1 非空（开档后多次 afterAction 已自动落盘）----------
+ui.destroy(); await sleep(10);
+ui = createGame(document.getElementById('game-container'));
+watchToasts(ui);
+await sleep(10);
+const slots = document.querySelectorAll('.slot-card');
+ok(!slots[0].classList.contains('empty'), '重开后槽 1 已占用');
+ok(/灵石/.test(slots[0].textContent), '槽 1 卡片显示灵石');
+
+ui.destroy();
+console.log(`\n结果: ${pass} 通过, ${fail} 失败`);
+process.exit(fail ? 1 : 0);
diff --git a/apps/ling-xu-wen-jian-lu/src/config.js b/apps/ling-xu-wen-jian-lu/src/config.js
new file mode 100644
index 0000000..60768c8
--- /dev/null
+++ b/apps/ling-xu-wen-jian-lu/src/config.js
@@ -0,0 +1,198 @@
+// ============================================================================
+// 灵墟·问剑录 · 全局配置与数值公式（纯函数，无 DOM 依赖，便于单测）
+// 涵盖：五行克制、伤害公式、稀有度、养成曲线（升级/突破/升星）、问道保底、洞府挂机。
+// ============================================================================
+
+// ── 工具 ────────────────────────────────────────────────────────────────────
+export function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
+export function nowSec() { return Math.floor(Date.now() / 1000); }
+// 本地日期键（YYYY-MM-DD）：用于「自然日」粒度判定（每日免费单抽等）。
+export function dayKey(ts) {
+  const d = new Date(ts != null ? ts : Date.now());
+  const y = d.getFullYear();
+  const m = String(d.getMonth() + 1).padStart(2, '0');
+  const day = String(d.getDate()).padStart(2, '0');
+  return `${y}-${m}-${day}`;
+}
+
+// ── 五行 ────────────────────────────────────────────────────────────────────
+export const ELEMENTS = [
+  { id: 'metal', name: '金', emoji: '⚔️', color: '#c8a951' },
+  { id: 'wood',  name: '木', emoji: '🌿', color: '#5fa85f' },
+  { id: 'water', name: '水', emoji: '💧', color: '#4a90c2' },
+  { id: 'fire',  name: '火', emoji: '🔥', color: '#d4564f' },
+  { id: 'earth', name: '土', emoji: '🪨', color: '#a17b4a' },
+];
+const EL_MAP = Object.fromEntries(ELEMENTS.map((e) => [e.id, e]));
+export function elDef(id) { return EL_MAP[id] || null; }
+export function elName(id) { const e = elDef(id); return e ? e.name : '无'; }
+export function elEmoji(id) { const e = elDef(id); return e ? e.emoji : ''; }
+
+// ── 五行克制（核心策略，见设计稿 4.3）─────────────────────────────────────────
+// 采用标准五行相克循环：金克木、木克土、土克水、水克火、火克金。
+// 克制 +30% 伤害（×1.30），被克制 -15% 伤害（×0.85），同属性 / 无克制 ×1.00。
+// （设计稿表格中的 +30% 项与该循环一致；其余 -15%/0% 项依「克制 +30% / 被克 -15%」规则派生。）
+const OVERCOMES = { metal: 'wood', wood: 'earth', earth: 'water', water: 'fire', fire: 'metal' };
+export const COUNTER_GAIN = 1.30;
+export const COUNTER_LOSS = 0.85;
+export function counterMult(atkEl, defEl) {
+  if (!atkEl || !defEl) return 1;
+  // 「无」属性（虚空吞噬者等）不参与五行相克，永远中性
+  if (atkEl === 'none' || defEl === 'none') return 1;
+  if (atkEl === defEl) return 1;
+  return OVERCOMES[atkEl] === defEl ? COUNTER_GAIN : COUNTER_LOSS;
+}
+
+// ── 稀有度 ──────────────────────────────────────────────────────────────────
+// name：品阶名；color：主题色（设计稿 7.1）；rate：问道基础概率；star：升星上限。
+export const RARITIES = [
+  { id: 'R',   name: '逸品·青玉', short: 'R',   color: '#6A9EC7', rate: 0.70, maxStar: 5, baseCap: 30 },
+  { id: 'SR',  name: '绝品·紫金', short: 'SR',  color: '#9B6BCC', rate: 0.25, maxStar: 5, baseCap: 40 },
+  { id: 'SSR', name: '至品·彩凰', short: 'SSR', color: '#E8636B', rate: 0.05, maxStar: 6, baseCap: 50 },
+];
+const RARITY_MAP = Object.fromEntries(RARITIES.map((r) => [r.id, r]));
+export function rarityDef(id) { return RARITY_MAP[id] || RARITIES[0]; }
+
+// 主题色（设计稿 7.1 色彩系统）
+export const THEME = {
+  paper: '#F5F0E6',   // 背景 / 宣纸
+  ink: '#2C1810',     // 主文字 / 墨色
+  red: '#C23B22',     // 朱砂红（强调）
+  gold: '#D4A04A',    // 描金（装饰 / 稀有）
+};
+
+// ── 问道（抽卡）配置（设计稿 5.3）──────────────────────────────────────────────
+export const GACHA = {
+  pitySSR: 90,        // 累计 90 抽必出 SSR
+  pitySR: 30,         // 每 30 抽必出 SR（跨池）
+  tenGuaranteeSR: true, // 十连保底 1 张 SR
+  dupFrags: { R: 2, SR: 5, SSR: 10 }, // 重复抽到 → 灵契碎片
+  dailyFree: true,    // 每日首次单抽免费
+};
+
+// ── 升星消耗（灵契碎片，索引 = 目标星级，1..maxStar）────────────────────────────
+export function starCost(rarity, targetStar) {
+  const r = rarityDef(rarity);
+  const base = { R: 3, SR: 5, SSR: 8 }[rarity] || 3;
+  // 每级递增，SSR 更贵
+  const grow = rarity === 'SSR' ? 8 : rarity === 'SR' ? 5 : 3;
+  return base + grow * (targetStar - 1);
+}
+// 升星额外消耗天道本源（高星才需，对应设计稿升星=道果重数）
+export function starTiandao(rarity, targetStar) {
+  if (targetStar <= 2) return 0;
+  return rarity === 'SSR' ? (targetStar - 2) : 0;
+}
+
+// ── 卡牌经验曲线（升级所需经验）─────────────────────────────────────────────────
+export function expForLevel(lv) {
+  if (lv <= 1) return 60;
+  return Math.round(80 * Math.pow(1.16, lv - 1));
+}
+// 升级伴随的灵石消耗（随等级递增）
+export function lingshiForLevel(lv) {
+  return Math.round(20 * lv);
+}
+
+// ── 衍生属性（由基础值 + 等级/突破/星级派生）───────────────────────────────────
+// 三种加成：等级（每级 +5%）、突破（每次 +8%）、星级（每星 +12%）。
+export const LEVEL_MULT = 0.05;
+export const BREAK_MULT = 0.08;
+export const STAR_MULT = 0.12;
+export function effectiveStat(base, level, br, star) {
+  const m = (1 + LEVEL_MULT * Math.max(0, level - 1))
+          * (1 + BREAK_MULT * Math.max(0, br))
+          * (1 + STAR_MULT * Math.max(0, star));
+  return base * m;
+}
+
+// ── 突破（每 10 级一次，消耗对应五行突破石）─────────────────────────────────────
+// br = 已完成突破次数；当前可突破的前提是 level 已达 10*(br+1)。
+export function breakGateLevel(br) { return 10 * (br + 1); }
+export function canBreak(instance, card) {
+  const r = rarityDef(card.rarity);
+  const cap = cardCap(r, instance.star);
+  return instance.level >= breakGateLevel(instance.br) && instance.level < cap;
+}
+
+// 当前星级下的等级上限
+export function cardCap(rarityOrDef, star) {
+  const r = typeof rarityOrDef === 'string' ? rarityDef(rarityOrDef) : rarityOrDef;
+  return r.baseCap + 10 * Math.max(0, star);
+}
+
+// ── 战力（用于关卡推荐战力对照 / 阵容总战力）────────────────────────────────────
+export function cardPower(stats) {
+  return Math.round(
+    stats.atk * 1.0 +
+    stats.def * 0.8 +
+    stats.hp * 0.12 +
+    stats.spd * 0.6
+  );
+}
+
+// ── 伤害公式（设计稿 4.4，核心）────────────────────────────────────────────────
+// 最终伤害 =（攻方攻击 × 技能倍率 − 守方防御 × 0.5）× 五行系数 × 暴击系数 × 随机波动 + 固定附加
+// 保底：不低于 攻方攻击 × 5%。
+export const CRIT_MULT = 1.5;
+export function computeDamage(opts) {
+  const { atk = 0, def = 0, mult = 1, fixed = 0, atkEl = null, defEl = null,
+          crit = false, rng = Math.random } = opts;
+  const counter = counterMult(atkEl, defEl);
+  const variance = 0.95 + (rng ? rng() : Math.random()) * 0.10; // 0.95~1.05
+  const critMult = crit ? CRIT_MULT : 1;
+  const raw = (atk * mult - def * 0.5) * counter * critMult * variance + fixed;
+  const floor = atk * 0.05;
+  return Math.max(1, Math.round(Math.max(raw, floor)));
+}
+
+// ── 战场站位受击权重（设计稿 4.1）──────────────────────────────────────────────
+// 1 号位（主坦）受击 +30%，2 号位（副坦/输出）+10%，其余正常。
+export const POS_AGGRO = [1.30, 1.10, 1.00, 1.00, 1.00];
+
+// ── 出手顺序（设计稿 4.2）：速度值 × 随机浮动（±5%）─────────────────────────────
+export function initiative(spd, rng) {
+  const r = (rng || Math.random)();
+  const f = 0.95 + r * 0.10; // 0.95~1.05
+  return spd * f;
+}
+
+// ── 洞府挂机（设计稿 6.1）──────────────────────────────────────────────────────
+export const CAVE_CAP_HOURS = 12;
+export const CAVE_STONE_PER_HOUR_DIV = 10; // 灵石/小时 = 挂入卡牌总等级 / 10
+export const CAVE_PILL_SSR_PER_HOUR = 1;   // 修为丹·小/小时 = SSR 数量
+
+// ── 资源定义（货币 / 材料，见设计稿 5.1）────────────────────────────────────────
+export const RESOURCES = [
+  { id: 'lingshi',     name: '灵石',     emoji: '🪙', desc: '修炼升级、升星通用消耗，主线与秘境产出。' },
+  { id: 'exp_s',       name: '修为丹·小', emoji: '🧪', desc: '提供卡牌经验 50。' },
+  { id: 'exp_m',       name: '修为丹·中', emoji: '⚗️', desc: '提供卡牌经验 200。' },
+  { id: 'exp_l',       name: '修为丹·大', emoji: '🌟', desc: '提供卡牌经验 1000。' },
+  { id: 'break_metal', name: '金·突破石', emoji: '⚔️', desc: '金系卡牌每 10 级突破所需。' },
+  { id: 'break_wood',  name: '木·突破石', emoji: '🌿', desc: '木系卡牌每 10 级突破所需。' },
+  { id: 'break_water', name: '水·突破石', emoji: '💧', desc: '水系卡牌每 10 级突破所需。' },
+  { id: 'break_fire',  name: '火·突破石', emoji: '🔥', desc: '火系卡牌每 10 级突破所需。' },
+  { id: 'break_earth', name: '土·突破石', emoji: '🪨', desc: '土系卡牌每 10 级突破所需。' },
+  { id: 'gongfa',      name: '功法残页',   emoji: '📜', desc: '提升卡牌技能等级。' },
+  { id: 'tiandao_f',   name: '天道本源·碎片', emoji: '🌌', desc: '高阶升星（道果重数）消耗。' },
+  { id: 'tiandao',     name: '天道本源',   emoji: '✨', desc: 'SSR 顶级升星消耗。' },
+  { id: 'wendao',      name: '问道令',     emoji: '🎏', desc: '问道（抽卡）消耗，1 令 = 1 抽。' },
+];
+export const RES_MAP = Object.fromEntries(RESOURCES.map((r) => [r.id, r]));
+export function resName(id) { return (RES_MAP[id] && RES_MAP[id].name) || id; }
+export function resEmoji(id) { return (RES_MAP[id] && RES_MAP[id].emoji) || ''; }
+
+// 修为丹 → 经验
+export const PILL_EXP = { exp_s: 50, exp_m: 200, exp_l: 1000 };
+// 五行 → 突破石 id
+export const BREAK_STONE = { metal: 'break_metal', wood: 'break_wood', water: 'break_water', fire: 'break_fire', earth: 'break_earth' };
+
+// ── 起始资源（新档）─────────────────────────────────────────────────────────────
+export const START_RESOURCES = {
+  lingshi: 3000,
+  exp_s: 8, exp_m: 3, exp_l: 0,
+  break_metal: 2, break_wood: 2, break_water: 2, break_fire: 2, break_earth: 2,
+  gongfa: 5,
+  tiandao_f: 0, tiandao: 0,
+  wendao: 10,
+};
diff --git a/apps/ling-xu-wen-jian-lu/src/core/achievements.js b/apps/ling-xu-wen-jian-lu/src/core/achievements.js
new file mode 100644
index 0000000..edf1b5d
--- /dev/null
+++ b/apps/ling-xu-wen-jian-lu/src/core/achievements.js
@@ -0,0 +1,88 @@
+// ============================================================================
+// 成就系统：达成条件 / 当前进度 / 奖励。纯逻辑。
+// ============================================================================
+import { collectionProgress, totalStars } from './player.js';
+import { addRes } from './player.js';
+import { CHAPTERS } from './stage.js';
+
+export const ACHIEVEMENTS = [
+  { id: 'ach_first_draw', cat: 'gacha', name: '初探问道', desc: '完成首次问道。',
+    goal: { cur: (p) => p.stats.draws || 0, target: 1 }, reward: { wendao: 3 } },
+  { id: 'ach_own_sr', cat: 'gacha', name: '紫金入袖', desc: '获得一张 SR 卡。',
+    goal: { cur: (p) => p.stats.sr > 0 ? 1 : 0, target: 1 }, reward: { wendao: 5 } },
+  { id: 'ach_own_ssr', cat: 'gacha', name: '彩凰降世', desc: '获得一张 SSR 卡。',
+    goal: { cur: (p) => p.stats.ssr > 0 ? 1 : 0, target: 1 }, reward: { tiandao_f: 2 } },
+  { id: 'ach_draw50', cat: 'gacha', name: '问道五十', desc: '累计问道 50 次。',
+    goal: { cur: (p) => p.stats.draws || 0, target: 50 }, reward: { wendao: 10 } },
+
+  { id: 'ach_stage1', cat: 'story', name: '初露锋芒', desc: '通关第一章首领。',
+    goal: { cur: (p) => p.story.clearedStages['1-7'] ? 1 : 0, target: 1 }, reward: { lingshi: 500 } },
+  { id: 'ach_stage3', cat: 'story', name: '峡谷之主', desc: '通关第三章首领。',
+    goal: { cur: (p) => p.story.clearedStages['3-7'] ? 1 : 0, target: 1 }, reward: { lingshi: 1500 } },
+  { id: 'ach_stage6', cat: 'story', name: '回廊深处', desc: '通关第六章首领。',
+    goal: { cur: (p) => p.story.clearedStages['6-7'] ? 1 : 0, target: 1 }, reward: { gongfa: 5 } },
+  { id: 'ach_clear_all', cat: 'story', name: '天道归墟', desc: '通关全部十二章。',
+    goal: { cur: (p) => p.story.clearedStages['12-7'] ? 1 : 0, target: 1 }, reward: { tiandao: 1 } },
+
+  { id: 'ach_secret30', cat: 'secret', name: '秘境初探', desc: '秘境爬塔抵达 30 层。',
+    goal: { cur: (p) => Math.min(30, p.secret.bestFloor || 1), target: 30 }, reward: { wendao: 5 } },
+  { id: 'ach_secret90', cat: 'secret', name: '九重天阙', desc: '秘境爬塔通关 90 层。',
+    goal: { cur: (p) => Math.min(90, p.secret.bestFloor || 1), target: 90 }, reward: { tiandao: 1 } },
+
+  { id: 'ach_codex_half', cat: 'codex', name: '半部天书', desc: '图鉴收集达 50%。',
+    goal: { cur: (p) => Math.min(0.5, collectionProgress(p)), target: 0.5 }, reward: { wendao: 10 } },
+  { id: 'ach_codex_full', cat: 'codex', name: '万剑归宗', desc: '图鉴收集 100%。',
+    goal: { cur: (p) => Math.min(1, collectionProgress(p)), target: 1 }, reward: { tiandao: 2 } },
+
+  { id: 'ach_stars20', cat: 'grow', name: '群星璀璨', desc: '卡牌累计升至 20 星。',
+    goal: { cur: (p) => Math.min(20, totalStars(p)), target: 20 }, reward: { lingshi: 2000 } },
+  { id: 'ach_win50', cat: 'grow', name: '百战之士', desc: '累计胜利 50 场。',
+    goal: { cur: (p) => Math.min(50, p.stats.battlesWon || 0), target: 50 }, reward: { gongfa: 5 } },
+];
+
+export const ACH_CATS = [
+  { id: 'gacha', name: '问道' },
+  { id: 'story', name: '主线' },
+  { id: 'secret', name: '秘境' },
+  { id: 'codex', name: '图鉴' },
+  { id: 'grow', name: '养成' },
+];
+
+export function achProgress(player, ach) {
+  const cur = ach.goal.cur(player);
+  const target = ach.goal.target;
+  return { cur, target, done: cur >= target };
+}
+
+export function rewardDesc(reward) {
+  if (!reward) return '无';
+  const parts = [];
+  for (const [id, q] of Object.entries(reward)) parts.push(`${resNameOf(id)}×${q}`);
+  return parts.join('，') || '无';
+}
+// 轻量查表（避免循环依赖 config）
+function resNameOf(id) {
+  const map = {
+    lingshi: '灵石', wendao: '问道令', exp_s: '修为丹·小', exp_m: '修为丹·中', exp_l: '修为丹·大',
+    gongfa: '功法残页', tiandao_f: '天道本源·碎片', tiandao: '天道本源',
+  };
+  return map[id] || id;
+}
+
+// 检查并授予新达成的成就（发放奖励）。返回本次新授予的成就列表。
+export function checkAchievements(player) {
+  if (!Array.isArray(player.achievements)) player.achievements = [];
+  const granted = [];
+  for (const ach of ACHIEVEMENTS) {
+    if (player.achievements.includes(ach.id)) continue;
+    if (achProgress(player, ach).done) {
+      player.achievements.push(ach.id);
+      if (ach.reward) for (const [id, q] of Object.entries(ach.reward)) addRes(player, id, q);
+      granted.push(ach);
+    }
+  }
+  return granted;
+}
+
+// 兼容：导出 CHAPTERS 计数
+export { CHAPTERS };
diff --git a/apps/ling-xu-wen-jian-lu/src/core/battle.js b/apps/ling-xu-wen-jian-lu/src/core/battle.js
new file mode 100644
index 0000000..4658f31
--- /dev/null
+++ b/apps/ling-xu-wen-jian-lu/src/core/battle.js
@@ -0,0 +1,448 @@
+// ============================================================================
+// 战斗引擎（设计稿第四节：2.5D 回合制）
+//
+// 核心特性：
+//   - 5v5 回合制，按 速度×±5%浮动 决定出手顺序（每回合重算）。
+//   - 五行克制（克制 +30% / 被克 -15%）。
+//   - 站位受击权重（1 号位 +30%、2 号位 +10%），嘲讽可强制集火。
+//   - 通用技能 DSL：单攻 / 群攻 / 治疗 / 增益 / 护盾 / 净化 / 控制 / 持续伤害。
+//   - 被动：暴击 / 反伤 / 吸血 / 抵抗 / 复活 / 致命免疫 / 低血狂暴 / 开场光环。
+//
+// 战斗自动结算（设计稿 4.5：自动回合制，玩家默认观战）。
+// ============================================================================
+import {
+  computeDamage, counterMult, initiative, POS_AGGRO, clamp,
+} from '../config.js';
+import { chance } from './rng.js';
+import { instanceStats, skillMult } from './card.js';
+import { cardDef } from '../data/cards.js';
+
+// ── 构建参战单位 ──────────────────────────────────────────────────────────────
+// spec 形如 { name, element, stats:{atk,def,hp,spd}, actives, passives, skillMult }
+export function buildCombatant(spec, side, pos) {
+  const s = spec.stats || { atk: 0, def: 0, hp: 1, spd: 0 };
+  const c = {
+    ref: spec.ref || null,
+    side, pos,
+    name: spec.name || '无名',
+    element: spec.element || null,
+    role: spec.role || 'dps',
+    baseAtk: s.atk, baseDef: s.def, baseSpd: s.spd,
+    maxHp: Math.max(1, Math.round(s.hp)), hp: Math.max(1, Math.round(s.hp)),
+    baseCrit: 0.05,
+    actives: (spec.actives || []).map((a) => ({ ...a, mult: (a.mult || 0) * (spec.skillMult || 1) })),
+    passives: spec.passives || [],
+    // 运行时状态
+    buffs: [], dots: [], controls: [],
+    shield: 0, invuln: 0, taunt: 0,
+    resist: 0, healBonusIn: 0, lifesteal: 0, thorns: 0,
+    // 被动一次性标记
+    revive: null, reviveUsed: false,
+    deathsave: null, deathsaveUsed: false,
+    teamRevive: null, teamReviveUsed: false,
+    enrage: null, enrageActive: false,
+    skillIdx: 0,
+    alive: true,
+  };
+  // 解析静态被动（属性修饰 + 标记）
+  for (const p of c.passives) {
+    switch (p.kind) {
+      case 'crit': c.baseCrit += p.amount; break;
+      case 'atk': c.baseAtk = Math.round(c.baseAtk * (1 + p.amount)); break;
+      case 'def': c.baseDef = Math.round(c.baseDef * (1 + p.amount)); break;
+      case 'spd': c.baseSpd = Math.round(c.baseSpd * (1 + p.amount)); break;
+      case 'resist': c.resist += p.amount; break;
+      case 'heal_in': c.healBonusIn += p.amount; break;
+      case 'lifesteal': c.lifesteal += p.amount; break;
+      case 'thorns': c.thorns += p.amount; break;
+      case 'revive': c.revive = p; break;
+      case 'deathsave': c.deathsave = p; break;
+      case 'team_revive': c.teamRevive = p; break;
+      case 'enrage': c.enrage = p; break;
+      default: break; // aura_enemy_down / heal_aura 在 createBattle 跨队处理
+    }
+  }
+  return c;
+}
+
+// 由玩家阵容实例列表构造 player 侧 spec
+export function playerSpecsFrom(player) {
+  const out = [];
+  for (let i = 0; i < 5; i++) {
+    const id = player.formation[i];
+    if (!id || !player.cards[id]) continue;
+    const inst = player.cards[id];
+    const def = cardDef(id);
+    if (!def) continue;
+    out.push({
+      ref: id, name: def.name, element: def.element, role: def.role,
+      stats: instanceStats(inst), actives: def.actives, passives: def.passives,
+      skillMult: skillMult(inst),
+    });
+  }
+  return out;
+}
+
+export function createBattle(playerSpecs, enemySpecs, rng) {
+  const players = playerSpecs.map((s, i) => buildCombatant(s, 'player', i + 1));
+  const enemies = enemySpecs.map((s, i) => buildCombatant(s, 'enemy', i + 1));
+  // 开场光环：兵主威压（敌方全属性 -amount）、慈航普度（全队受治疗 +amount）
+  for (const c of players) {
+    for (const p of c.passives) {
+      if (p.kind === 'aura_enemy_down') {
+        for (const e of enemies) {
+          e.baseAtk = Math.round(e.baseAtk * (1 - p.amount));
+          e.baseDef = Math.round(e.baseDef * (1 - p.amount));
+        }
+      }
+      if (p.kind === 'heal_aura') {
+        for (const a of players) a.healBonusIn += p.amount;
+      }
+    }
+  }
+  // 重置受开场影响后的当前气血
+  for (const c of [...players, ...enemies]) c.hp = c.maxHp;
+  return {
+    players, enemies,
+    round: 0, log: [], over: false, result: null,
+    _rng: rng || Math.random,
+  };
+}
+
+// ── 当前属性（含临时增益）──────────────────────────────────────────────────────
+function buffAmount(c, stat) {
+  let sum = 0;
+  for (const b of c.buffs) if (b.stat === stat && b.dur > 0) sum += b.amount;
+  return sum;
+}
+function curAtk(c) { return Math.max(1, Math.round(c.baseAtk * (1 + buffAmount(c, 'atk')))); }
+function curDef(c) { return Math.max(0, Math.round(c.baseDef * (1 + buffAmount(c, 'def')))); }
+function curSpd(c) { return Math.max(1, Math.round(c.baseSpd * (1 + buffAmount(c, 'spd')))); }
+function curCrit(c) { return clamp(c.baseCrit + buffAmount(c, 'crit'), 0, 0.95); }
+
+function isStunned(c) { return c.controls.some((x) => x.kind === 'stun' && x.dur > 0); }
+function isSilenced(c) { return c.controls.some((x) => (x.kind === 'silence' || x.kind === 'freeze') && x.dur > 0); }
+
+// 治疗强度：攻击 + 最大气血的 20%
+function healPower(c) { return curAtk(c) + Math.round(c.maxHp * 0.20); }
+
+// ── 目标选择 ──────────────────────────────────────────────────────────────────
+function enemyTeam(battle, side) { return side === 'player' ? battle.enemies : battle.players; }
+function allyTeam(battle, side) { return side === 'player' ? battle.players : battle.enemies; }
+
+function aliveOf(arr) { return arr.filter((c) => c.alive); }
+
+// 选择一个敌方目标（优先嘲讽，否则按站位权重）
+function pickEnemyTarget(battle, c, rng) {
+  const foes = aliveOf(enemyTeam(battle, c.side));
+  if (!foes.length) return null;
+  const taunts = foes.filter((f) => f.taunt > 0);
+  if (taunts.length) return taunts[Math.floor((rng || Math.random)() * taunts.length)];
+  const weights = foes.map((f) => POS_AGGRO[f.pos - 1] || 1);
+  let total = 0; for (const w of weights) total += w;
+  let r = (rng || Math.random)() * total;
+  for (let i = 0; i < foes.length; i++) { r -= weights[i]; if (r <= 0) return foes[i]; }
+  return foes[foes.length - 1];
+}
+function pickLowestAlly(battle, c) {
+  const allies = aliveOf(allyTeam(battle, c.side));
+  if (!allies.length) return null;
+  return allies.reduce((lo, a) => (a.hp / a.maxHp < lo.hp / lo.maxHp ? a : lo), allies[0]);
+}
+
+// ── 伤害 / 治疗 / 死亡 ─────────────────────────────────────────────────────────
+function pushLog(battle, text) { battle.log.push(text); }
+
+function directHpDamage(battle, target, amount, source) {
+  target.hp -= amount;
+  if (target.hp <= 0) handleDeath(battle, target, source);
+}
+
+function dealDamage(battle, target, source, mult, fixed, rng) {
+  if (!target.alive || target.invuln > 0) {
+    if (target.invuln > 0) pushLog(battle, `${target.name} 身泛金光，免疫了伤害！`);
+    return 0;
+  }
+  const crit = chance(rng, curCrit(source));
+  const dmg = computeDamage({
+    atk: curAtk(source), def: curDef(target), mult, fixed,
+    atkEl: source.element, defEl: target.element, crit, rng,
+  });
+  let remaining = dmg;
+  if (target.shield > 0) {
+    const absorbed = Math.min(target.shield, remaining);
+    target.shield -= absorbed; remaining -= absorbed;
+    if (absorbed > 0) pushLog(battle, `${target.name} 护盾抵挡 ${absorbed} 点。`);
+  }
+  target.hp -= remaining;
+  pushLog(battle, `${source.name} → ${target.name} 造成 ${remaining} 点${crit ? '（暴击！）' : ''}伤害。`);
+  // 反伤
+  if (target.thorns > 0 && remaining > 0 && source !== target && source.alive) {
+    const refl = Math.round(remaining * target.thorns);
+    if (refl > 0) { pushLog(battle, `${target.name} 蛇鳞反噬 ${source.name} ${refl} 点。`); directHpDamage(battle, source, refl, target); }
+  }
+  // 吸血
+  if (source.lifesteal > 0 && remaining > 0 && source.alive) {
+    const hl = Math.round(remaining * source.lifesteal);
+    if (hl > 0) healUnit(battle, source, hl, source, true);
+  }
+  if (target.hp <= 0) handleDeath(battle, target, source);
+  return remaining;
+}
+
+function healUnit(battle, target, amount, source, suppressAura) {
+  if (!target.alive) return;
+  let eff = amount;
+  if (!suppressAura) eff = Math.round(amount * (1 + target.healBonusIn));
+  const before = target.hp;
+  target.hp = Math.min(target.maxHp, target.hp + eff);
+  const real = target.hp - before;
+  if (real > 0) pushLog(battle, `${source.name} 治疗 ${target.name} ${real} 点。`);
+}
+
+function handleDeath(battle, target, source) {
+  if (target.hp > 0) return;
+  // 致命免疫（水月镜花）
+  if (target.deathsave && !target.deathsaveUsed) {
+    target.deathsaveUsed = true;
+    target.hp = Math.round(target.maxHp * (target.deathsave.hpPct || 0.30));
+    pushLog(battle, `${target.name} 水月镜花！免疫致命一击并回复气血。`);
+    return;
+  }
+  // 濒死复活（不屈战魂）
+  if (target.revive && !target.reviveUsed) {
+    target.reviveUsed = true;
+    target.hp = Math.round(target.maxHp * (target.revive.hpPct || 0.30));
+    pushLog(battle, `${target.name} 不屈战魂，浴火复活！`);
+    return;
+  }
+  // 全队复活（天泽万物）
+  if (target.teamRevive && !target.teamReviveUsed) {
+    target.teamReviveUsed = true;
+    const team = allyTeam(battle, target.side);
+    for (const a of team) {
+      a.alive = true;
+      a.hp = Math.max(a.hp, Math.round(a.maxHp * (target.teamRevive.hpPct || 0.50)));
+      a.hp = a.hp <= 0 ? Math.round(a.maxHp * 0.5) : a.hp;
+    }
+    target.hp = Math.round(target.maxHp * (target.teamRevive.hpPct || 0.50));
+    pushLog(battle, `${target.name} 天泽万物！全队死而复生！`);
+    return;
+  }
+  target.hp = 0; target.alive = false;
+  pushLog(battle, `${target.name} 倒下了。`);
+}
+
+// ── 技能效果施加 ──────────────────────────────────────────────────────────────
+function applyEffectTo(battle, c, effect, source, rng) {
+  if (!effect) return;
+  // 抵抗：debuff 类效果可被抵抗
+  const isDebuff = ['burn', 'poison', 'stun', 'silence', 'freeze', 'slow'].includes(effect.kind);
+  if (isDebuff && c.resist > 0 && chance(rng, c.resist)) {
+    pushLog(battle, `${c.name} 抵抗了 ${effect.kind}！`);
+    return;
+  }
+  switch (effect.kind) {
+    case 'burn':
+    case 'poison':
+      c.dots.push({ kind: effect.kind, dps: effect.dps, dur: effect.dur, srcAtk: curAtk(source) });
+      pushLog(battle, `${c.name} 陷入${effect.kind === 'burn' ? '灼烧' : '中毒'}。`);
+      break;
+    case 'stun':
+    case 'silence':
+    case 'freeze':
+      c.controls.push({ kind: effect.kind, dur: effect.dur });
+      pushLog(battle, `${c.name} 陷入${effect.kind === 'stun' ? '眩晕' : effect.kind === 'freeze' ? '冰冻' : '沉默'}。`);
+      break;
+    case 'slow':
+      c.buffs.push({ stat: 'spd', amount: -effect.amount, dur: effect.dur });
+      pushLog(battle, `${c.name} 被减速。`);
+      break;
+    case 'invuln':
+      c.invuln = Math.max(c.invuln, effect.dur);
+      pushLog(battle, `${c.name} 进入无敌状态！`);
+      break;
+    default:
+      if (effect.stat) { // 属性增益
+        c.buffs.push({ stat: effect.stat, amount: effect.amount, dur: effect.dur });
+        pushLog(battle, `${c.name} 获得增益（${effect.stat} +${Math.round(effect.amount * 100)}%）。`);
+      } else if (effect.shieldPct != null) {
+        const sh = Math.round(c.maxHp * effect.shieldPct);
+        c.shield += sh;
+        if (effect.taunt) { c.taunt = Math.max(c.taunt, effect.dur); pushLog(battle, `${c.name} 龟甲护盾加身并嘲讽敌方！`); }
+        else pushLog(battle, `${c.name} 获得护盾 ${sh} 点。`);
+      } else if (effect.dispel === 'debuff') {
+        const n = c.dots.length + c.controls.length;
+        c.dots = []; c.controls = [];
+        if (n) pushLog(battle, `${c.name} 身上 ${n} 项负面状态被净化。`);
+      }
+      break;
+  }
+}
+
+// ── 单位行动 ──────────────────────────────────────────────────────────────────
+function act(battle, c, rng) {
+  // 控制判定
+  if (isStunned(c)) { pushLog(battle, `${c.name} 被震慑，无法行动。`); return; }
+  const silenced = isSilenced(c);
+  // 选择技能：被沉默 → 普攻；否则轮换主动技
+  let skill;
+  if (silenced) {
+    skill = { type: 'dmg', target: 'enemy_one', mult: 1.0, name: '普攻' };
+    pushLog(battle, `${c.name} 被封印，只能普通攻击。`);
+  } else if (c.actives.length) {
+    skill = c.actives[c.skillIdx % c.actives.length];
+    c.skillIdx = (c.skillIdx + 1) % c.actives.length;
+  } else {
+    skill = { type: 'dmg', target: 'enemy_one', mult: 1.0, name: '普攻' };
+  }
+
+  // 低血狂暴触发（兵主降临 / Boss enrage）
+  if (c.enrage && !c.enrageActive && c.hp / c.maxHp < (c.enrage.threshold || 0.30)) {
+    c.enrageActive = true;
+    c.baseAtk = Math.round(c.baseAtk * (1 + c.enrage.amount));
+    c.baseDef = Math.round(c.baseDef * (1 + c.enrage.amount));
+    c.buffs.push({ stat: 'atk', amount: 0, dur: c.enrage.dur }); // 占位记 dur（狂暴持续）
+    c._enrageDur = c.enrage.dur;
+    pushLog(battle, `${c.name} 怒意爆发，全属性暴增！`);
+  }
+
+  const mult = skill.mult || 0;
+  const fixed = skill.fixed || 0;
+
+  switch (skill.type) {
+    case 'dmg': {
+      if (skill.target === 'enemy_all') {
+        for (const t of aliveOf(enemyTeam(battle, c.side))) dealDamage(battle, t, c, mult, fixed, rng);
+        if (skill.effect) for (const t of aliveOf(enemyTeam(battle, c.side))) applyEffectTo(battle, t, skill.effect, c, rng);
+      } else {
+        const t = pickEnemyTarget(battle, c, rng);
+        if (t) {
+          dealDamage(battle, t, c, mult, fixed, rng);
+          if (skill.effect) applyEffectTo(battle, t, skill.effect, c, rng);
+        }
+      }
+      if (skill.selfEffect) applyEffectTo(battle, c, skill.selfEffect, c, rng);
+      break;
+    }
+    case 'ctrl': {
+      const t = pickEnemyTarget(battle, c, rng);
+      if (t) {
+        pushLog(battle, `${c.name} 施展【${skill.name}】！`);
+        if (skill.effect) applyEffectTo(battle, t, skill.effect, c, rng);
+      }
+      break;
+    }
+    case 'heal': {
+      const amount = healPower(c) * mult;
+      if (skill.target === 'ally_all') {
+        for (const t of aliveOf(allyTeam(battle, c.side))) healUnit(battle, t, amount, c);
+      } else if (skill.target === 'self') {
+        healUnit(battle, c, amount, c);
+      } else {
+        const t = pickLowestAlly(battle, c);
+        if (t) healUnit(battle, t, amount, c);
+      }
+      if (skill.effect) {
+        // 增益附在治疗目标上：全队 / 单体
+        const targets = skill.target === 'ally_all' ? aliveOf(allyTeam(battle, c.side))
+          : skill.target === 'self' ? [c]
+          : (pickLowestAlly(battle, c) ? [pickLowestAlly(battle, c)] : []);
+        for (const t of targets) applyEffectTo(battle, t, skill.effect, c, rng);
+      }
+      break;
+    }
+    case 'buff': {
+      const targets = skill.target === 'ally_all' ? aliveOf(allyTeam(battle, c.side))
+        : skill.target === 'self' ? [c]
+        : (pickLowestAlly(battle, c) ? [pickLowestAlly(battle, c)] : []);
+      pushLog(battle, `${c.name} 布下【${skill.name}】。`);
+      for (const t of targets) applyEffectTo(battle, t, skill.effect, c, rng);
+      break;
+    }
+    case 'shield': {
+      applyEffectTo(battle, c, skill.effect, c, rng);
+      break;
+    }
+    case 'cleanse': {
+      const targets = skill.target === 'ally_all' ? aliveOf(allyTeam(battle, c.side)) : [c];
+      for (const t of targets) if (skill.effect) applyEffectTo(battle, t, skill.effect, c, rng);
+      break;
+    }
+    default: break;
+  }
+}
+
+// ── 回合推进 ──────────────────────────────────────────────────────────────────
+function endRound(battle, rng) {
+  for (const c of [...battle.players, ...battle.enemies]) {
+    if (!c.alive) continue;
+    // 持续伤害（灼烧 / 中毒），绕过护盾
+    for (const d of c.dots) {
+      if (d.dur <= 0) continue;
+      const dmg = Math.round(d.srcAtk * d.dps);
+      pushLog(battle, `${c.name} 受${d.kind === 'burn' ? '灼烧' : '中毒'}损失 ${dmg} 点。`);
+      directHpDamage(battle, c, dmg, null);
+      if (!c.alive) break;
+    }
+    // 计时器递减
+    for (const d of c.dots) d.dur -= 1;
+    c.dots = c.dots.filter((d) => d.dur > 0);
+    for (const b of c.buffs) b.dur -= 1;
+    c.buffs = c.buffs.filter((b) => b.dur > 0);
+    for (const k of c.controls) k.dur -= 1;
+    c.controls = c.controls.filter((k) => k.dur > 0);
+    if (c.invuln > 0) c.invuln -= 1;
+    if (c.taunt > 0) c.taunt -= 1;
+    if (c._enrageDur != null) { c._enrageDur -= 1; if (c._enrageDur <= 0) c.enrageActive = false; }
+  }
+}
+
+function checkOver(battle) {
+  const pAlive = aliveOf(battle.players).length;
+  const eAlive = aliveOf(battle.enemies).length;
+  if (eAlive === 0) { battle.over = true; battle.result = 'win'; pushLog(battle, '★ 敌方全军覆没，你获胜了！'); return true; }
+  if (pAlive === 0) { battle.over = true; battle.result = 'lose'; pushLog(battle, '★ 我方全军覆没，败北……'); return true; }
+  return false;
+}
+
+// 推进一回合。返回 { logs, over, result }
+export function stepRound(battle, rng) {
+  const r = rng || battle._rng || Math.random;
+  if (battle.over) return { logs: [], over: true, result: battle.result };
+  battle.round += 1;
+  // 出手顺序：速度 × ±5% 浮动
+  const all = [...battle.players, ...battle.enemies].filter((c) => c.alive);
+  all.sort((a, b) => initiative(curSpd(b), r) - initiative(curSpd(a), r));
+  for (const c of all) {
+    if (!c.alive) continue;
+    act(battle, c, r);
+    if (checkOver(battle)) return { logs: battle.log.slice(), over: true, result: battle.result };
+  }
+  endRound(battle, r);
+  if (checkOver(battle)) return { logs: battle.log.slice(), over: true, result: battle.result };
+  return { logs: battle.log.slice(), over: false, result: null };
+}
+
+// 自动跑完整场战斗（带回合上限保护：超时按剩余气血比例判定）。
+export function runBattle(playerSpecs, enemySpecs, rng, maxRounds = 60) {
+  const battle = createBattle(playerSpecs, enemySpecs, rng);
+  let guard = 0;
+  while (!battle.over && guard++ < maxRounds) stepRound(battle, rng || battle._rng);
+  if (!battle.over) {
+    // 超时判定：按各方剩余气血百分比之和
+    const pHp = aliveOf(battle.players).reduce((s, c) => s + c.hp / c.maxHp, 0);
+    const eHp = aliveOf(battle.enemies).reduce((s, c) => s + c.hp / c.maxHp, 0);
+    battle.result = pHp >= eHp ? 'win' : 'lose';
+    battle.over = true;
+    pushLog(battle, battle.result === 'win' ? '★ 限时已到，你以微弱优势取胜！' : '★ 限时已到，遗憾落败……');
+  }
+  return {
+    result: battle.result,
+    rounds: battle.round,
+    log: battle.log,
+    survivors: aliveOf(battle.players).length,
+    enemySurvivors: aliveOf(battle.enemies).length,
+    battle,
+  };
+}
diff --git a/apps/ling-xu-wen-jian-lu/src/core/card.js b/apps/ling-xu-wen-jian-lu/src/core/card.js
new file mode 100644
index 0000000..f985b39
--- /dev/null
+++ b/apps/ling-xu-wen-jian-lu/src/core/card.js
@@ -0,0 +1,55 @@
+// ============================================================================
+// 卡牌实例：由「卡牌定义 + 养成进度」派生战斗属性。纯函数，无 DOM 依赖。
+//
+// 实例（instance）结构：{ id, level, br, star, skillLv, exp, equipped? }
+//   level  当前等级（1..cap）
+//   br     已完成突破次数（每 10 级一次）
+//   star   星级（0..maxStar）
+//   skillLv 技能等级（影响主动技倍率）
+//   exp    当前经验
+// ============================================================================
+import {
+  rarityDef, effectiveStat, cardCap, expForLevel, cardPower,
+} from '../config.js';
+import { cardDef } from '../data/cards.js';
+
+// 创建一个全新卡牌实例（1 级、0 突破、0 星）
+export function newInstance(cardId) {
+  return { id: cardId, level: 1, br: 0, star: 0, skillLv: 1, exp: 0 };
+}
+
+// 由实例派生「当前战斗属性」（攻击 / 防御 / 气血 / 速度）
+export function instanceStats(instance) {
+  const def = cardDef(instance.id);
+  if (!def) return { atk: 0, def: 0, hp: 0, spd: 0 };
+  const b = def.stats;
+  return {
+    atk: Math.round(effectiveStat(b.atk, instance.level, instance.br, instance.star)),
+    def: Math.round(effectiveStat(b.def, instance.level, instance.br, instance.star)),
+    hp: Math.round(effectiveStat(b.hp, instance.level, instance.br, instance.star)),
+    spd: Math.round(effectiveStat(b.spd, instance.level, instance.br, instance.star)),
+  };
+}
+
+// 卡牌战力
+export function instancePower(instance) {
+  return cardPower(instanceStats(instance));
+}
+
+// 技能倍率：技能等级每 +1，伤害/治疗倍率 +5%（封顶 +50%）
+export function skillMult(instance) {
+  const bonus = Math.max(0, (instance.skillLv || 1) - 1) * 0.05;
+  return 1 + Math.min(0.50, bonus);
+}
+
+// 升级到下一级所需经验
+export function expToNext(instance) {
+  return expForLevel(instance.level);
+}
+// 是否达到等级上限
+export function isMaxLevel(instance) {
+  const def = cardDef(instance.id);
+  if (!def) return true;
+  const r = rarityDef(def.rarity);
+  return instance.level >= cardCap(r, instance.star);
+}
diff --git a/apps/ling-xu-wen-jian-lu/src/core/cave.js b/apps/ling-xu-wen-jian-lu/src/core/cave.js
new file mode 100644
index 0000000..befa8d3
--- /dev/null
+++ b/apps/ling-xu-wen-jian-lu/src/core/cave.js
@@ -0,0 +1,63 @@
+// ============================================================================
+// 洞府（挂机收益，设计稿 6.1）
+//   - 离线产出：每小时灵石 = 挂入卡牌总等级 / 10；每小时修为丹·小 = SSR 拥有数。
+//   - 离线最多累积 12 小时。
+//   - 简化：所有已拥有卡牌均「挂入画卷」参与产出。
+// ============================================================================
+import { CAVE_CAP_HOURS, CAVE_STONE_PER_HOUR_DIV, CAVE_PILL_SSR_PER_HOUR, nowSec } from '../config.js';
+import { CARD_MAP } from '../data/cards.js';
+import { addRes } from './player.js';
+
+// 已拥有卡牌总等级（即「挂入画卷」的卡牌等级之和）
+export function caveTotalLevel(player) {
+  let sum = 0;
+  for (const inst of Object.values(player.cards || {})) sum += (inst.level || 1);
+  return sum;
+}
+
+// 拥有的 SSR 数量
+export function caveSSRCount(player) {
+  let n = 0;
+  for (const id of Object.keys(player.cards || {})) {
+    const def = CARD_MAP[id];
+    if (def && def.rarity === 'SSR') n++;
+  }
+  return n;
+}
+
+// 结算离线收益（自上次 lastSeen 至今，上限 12 小时）。返回 { seconds, lingshi, exp_s, capped }
+export function collectCave(player, nowOverride) {
+  const now = nowOverride != null ? nowOverride : nowSec();
+  const last = player.cave.lastSeen || now;
+  let seconds = Math.max(0, now - last);
+  const cap = CAVE_CAP_HOURS * 3600;
+  const capped = seconds > cap;
+  seconds = Math.min(seconds, cap);
+  if (seconds < 30) return { seconds: 0, lingshi: 0, exp_s: 0, capped: false };
+  const hours = seconds / 3600;
+  const totalLv = caveTotalLevel(player);
+  const ssr = caveSSRCount(player);
+  const lingshi = Math.round((totalLv / CAVE_STONE_PER_HOUR_DIV) * hours);
+  const exp_s = Math.round(CAVE_PILL_SSR_PER_HOUR * ssr * hours);
+  if (lingshi > 0) addRes(player, 'lingshi', lingshi);
+  if (exp_s > 0) addRes(player, 'exp_s', exp_s);
+  player.cave.lastSeen = now;
+  return { seconds, lingshi, exp_s, capped };
+}
+
+// 预览当前可领取的挂机收益（不实际发放、不改 lastSeen）
+export function previewCave(player, nowOverride) {
+  const now = nowOverride != null ? nowOverride : nowSec();
+  const last = player.cave.lastSeen || now;
+  const elapsed = Math.max(0, now - last);
+  const seconds = Math.min(elapsed, CAVE_CAP_HOURS * 3600);
+  const hours = seconds / 3600;
+  const totalLv = caveTotalLevel(player);
+  const ssr = caveSSRCount(player);
+  return {
+    seconds,
+    lingshi: Math.round((totalLv / CAVE_STONE_PER_HOUR_DIV) * hours),
+    exp_s: Math.round(CAVE_PILL_SSR_PER_HOUR * ssr * hours),
+    capped: elapsed > CAVE_CAP_HOURS * 3600,
+  };
+}
diff --git a/apps/ling-xu-wen-jian-lu/src/core/cultivate.js b/apps/ling-xu-wen-jian-lu/src/core/cultivate.js
new file mode 100644
index 0000000..d6b4cdc
--- /dev/null
+++ b/apps/ling-xu-wen-jian-lu/src/core/cultivate.js
@@ -0,0 +1,139 @@
+// ============================================================================
+// 养成系统（设计稿 P2）：升级 / 突破 / 升星 / 技能升级。纯逻辑。
+//   - 升级：喂修为丹获得经验，满经验后升 1 级并消耗灵石；每 10 级遇突破瓶颈。
+//   - 突破：消耗对应五行突破石 + 灵石，解锁更高等级上限（每次 +8% 全属性）。
+//   - 升星：消耗灵契碎片（同名卡）+ 天道本源，提升星级（+12% 全属性 / 星，扩等级上限）。
+//   - 技能：消耗功法残页提升技能等级（+5% 技能倍率 / 级）。
+// ============================================================================
+import {
+  rarityDef, cardCap, breakGateLevel, expForLevel, lingshiForLevel,
+  PILL_EXP, BREAK_STONE, starCost, starTiandao,
+} from '../config.js';
+import { cardDef } from '../data/cards.js';
+import { isMaxLevel, expToNext } from './card.js';
+import { canAfford, spendRes, countRes, countFrag } from './player.js';
+
+// 当前可升到的等级上限 = min(星级上限, 突破瓶颈)
+export function levelCeiling(instance) {
+  const def = cardDef(instance.id);
+  if (!def) return 1;
+  const r = rarityDef(def.rarity);
+  return Math.min(cardCap(r, instance.star), breakGateLevel(instance.br));
+}
+
+// 是否可以继续升级（未达瓶颈 / 未达上限）
+export function canLevelUp(instance) {
+  return instance.level < levelCeiling(instance);
+}
+
+// 喂一颗修为丹：累加经验，自动升级（消耗灵石）。返回结算日志。
+export function feedPill(player, instance, pillId, qty = 1) {
+  const def = cardDef(instance.id);
+  if (!def) return { ok: false, reason: '无此卡牌' };
+  const expEach = PILL_EXP[pillId];
+  if (!expEach) return { ok: false, reason: '非修为丹' };
+  if (countRes(player, pillId) < qty) return { ok: false, reason: '数量不足' };
+  if (isMaxLevel(instance)) return { ok: false, reason: '已达等级上限' };
+  player.res[pillId] -= qty;
+  return addExp(player, instance, expEach * qty);
+}
+
+// 增加经验并尝试连续升级（每级消耗灵石；灵石不足则暂停并保留经验）。
+export function addExp(player, instance, exp) {
+  const logs = [];
+  instance.exp = (instance.exp || 0) + exp;
+  let guard = 0;
+  while (instance.exp >= expToNext(instance) && canLevelUp(instance) && guard++ < 200) {
+    const need = expToNext(instance);
+    const lingshi = lingshiForLevel(instance.level);
+    if (!canAfford(player, { lingshi })) {
+      logs.push({ kind: 'ling', text: `灵石不足，无法升至 ${instance.level + 1} 级（需 ${lingshi} 灵石）` });
+      break;
+    }
+    instance.exp -= need;
+    spendRes(player, { lingshi });
+    instance.level += 1;
+    logs.push({ kind: 'level', text: `${def_name(instance)} 升至 ${instance.level} 级` });
+    // 到达突破瓶颈：停止升级，提示突破
+    if (!canLevelUp(instance) && instance.level >= breakGateLevel(instance.br) && !reachedCap(instance)) {
+      logs.push({ kind: 'break', text: `${instance.level} 级瓶颈已至，需突破方能继续修炼` });
+      break;
+    }
+  }
+  if (instance.exp < 0) instance.exp = 0;
+  return { ok: true, logs };
+}
+function def_name(instance) { const d = cardDef(instance.id); return d ? d.name : instance.id; }
+function reachedCap(instance) {
+  const def = cardDef(instance.id);
+  if (!def) return true;
+  const r = rarityDef(def.rarity);
+  return instance.level >= cardCap(r, instance.star);
+}
+
+// ── 突破 ──────────────────────────────────────────────────────────────────────
+export function breakCost(instance) {
+  const def = cardDef(instance.id);
+  const stone = BREAK_STONE[def.element] || 'break_metal';
+  return { [stone]: 2 + instance.br, lingshi: 150 * (instance.br + 1) };
+}
+export function canBreakThrough(player, instance) {
+  const def = cardDef(instance.id);
+  if (!def) return false;
+  const r = rarityDef(def.rarity);
+  if (instance.level < breakGateLevel(instance.br)) return false; // 未到瓶颈
+  if (instance.level >= cardCap(r, instance.star)) return false;  // 已到星级上限
+  return canAfford(player, breakCost(instance));
+}
+export function doBreakThrough(player, instance) {
+  if (!canBreakThrough(player, instance)) return { ok: false, reason: '不可突破' };
+  spendRes(player, breakCost(instance));
+  instance.br += 1;
+  return { ok: true, text: `突破第 ${instance.br} 重，属性大增！` };
+}
+
+// ── 升星 ──────────────────────────────────────────────────────────────────────
+export function starUpCost(instance) {
+  const def = cardDef(instance.id);
+  const r = rarityDef(def.rarity);
+  const target = instance.star + 1;
+  return {
+    frag: starCost(def.rarity, target),
+    tiandao_f: starTiandao(def.rarity, target),
+  };
+}
+export function canStarUp(player, instance) {
+  const def = cardDef(instance.id);
+  if (!def) return false;
+  const r = rarityDef(def.rarity);
+  if (instance.star >= r.maxStar) return false;
+  const c = starUpCost(instance);
+  if (countFrag(player, def.id) < c.frag) return false;
+  if (countRes(player, 'tiandao_f') < c.tiandao_f) return false;
+  return true;
+}
+export function doStarUp(player, instance) {
+  if (!canStarUp(player, instance)) return { ok: false, reason: '不可升星' };
+  const def = cardDef(instance.id);
+  const c = starUpCost(instance);
+  player.frags[def.id] -= c.frag;
+  spendRes(player, { tiandao_f: c.tiandao_f });
+  instance.star += 1;
+  return { ok: true, text: `${def.name} 升至 ${instance.star}★！` };
+}
+
+// ── 技能升级 ──────────────────────────────────────────────────────────────────
+export const MAX_SKILL_LEVEL = 11;
+export function skillUpCost(instance) {
+  return { gongfa: 1 + (instance.skillLv - 1) * 2 };
+}
+export function canSkillUp(player, instance) {
+  return instance.skillLv < MAX_SKILL_LEVEL && canAfford(player, skillUpCost(instance));
+}
+export function doSkillUp(player, instance) {
+  if (!canSkillUp(player, instance)) return { ok: false, reason: '不可升级技能' };
+  spendRes(player, skillUpCost(instance));
+  instance.skillLv += 1;
+  const def = cardDef(instance.id);
+  return { ok: true, text: `${def.name} 技能升至 ${instance.skillLv} 级` };
+}
diff --git a/apps/ling-xu-wen-jian-lu/src/core/gacha.js b/apps/ling-xu-wen-jian-lu/src/core/gacha.js
new file mode 100644
index 0000000..f3c4663
--- /dev/null
+++ b/apps/ling-xu-wen-jian-lu/src/core/gacha.js
@@ -0,0 +1,110 @@
+// ============================================================================
+// 问道（抽卡）系统（设计稿 5.3）：单抽 / 十连，含保底与每日免费。
+//   - 累计 90 抽必出 SSR（pitySSR）
+//   - 每 30 抽必出 SR（pitySR，跨池计数）
+//   - 十连保底至少 1 张 SR
+//   - 每日首次单抽免费
+// 重复抽到同一卡 → 转为对应灵契碎片（设计稿 dupFrags）。
+// ============================================================================
+import { RARITIES, rarityDef, GACHA, dayKey, clamp } from '../config.js';
+import { CARDS, CARD_MAP } from '../data/cards.js';
+import { ownCard, addFrag, hasCard, countRes } from './player.js';
+import { weighted, pick } from './rng.js';
+
+// 今日是否可领免费单抽
+export function dailyFreeAvailable(player) {
+  return GACHA.dailyFree && player.dailyFreeDate !== dayKey();
+}
+
+// 按基础概率滚动稀有度（SSR 5% / SR 25% / R 70%）
+function baseRollRarity(rng) {
+  const r = (rng || Math.random)();
+  if (r < RARITIES[2].rate) return 'SSR';          // < 0.05
+  if (r < RARITIES[2].rate + RARITIES[1].rate) return 'SR'; // < 0.30
+  return 'R';
+}
+
+// 在指定稀有度内随机选一张卡
+function pickCard(rarity, rng) {
+  const pool = CARDS.filter((c) => c.rarity === rarity);
+  if (!pool.length) return CARDS[0];
+  return pick(rng, pool);
+}
+
+// 执行一次抽卡（内部：已扣资源 / 已记账 pity，由 drawOne / drawTen 调用）
+function doDraw(player, rng) {
+  const pity = player.pity;
+  pity.sinceSSR = (pity.sinceSSR || 0) + 1;
+  pity.sinceSR = (pity.sinceSR || 0) + 1;
+  pity.total = (pity.total || 0) + 1;
+
+  let rarity;
+  if (pity.sinceSSR >= GACHA.pitySSR) {
+    rarity = 'SSR';
+  } else {
+    rarity = baseRollRarity(rng);
+    // 每 30 抽保底 SR：抽到 R 时若已累计达标，则提升为 SR
+    if (rarity === 'R' && pity.sinceSR >= GACHA.pitySR) rarity = 'SR';
+  }
+
+  if (rarity === 'SSR') { pity.sinceSSR = 0; pity.sinceSR = 0; }
+  else if (rarity === 'SR') { pity.sinceSR = 0; }
+
+  const card = pickCard(rarity, rng);
+  const wasNew = !hasCard(player, card.id);
+  ownCard(player, card.id);
+  const frag = wasNew ? 0 : GACHA.dupFrags[rarity];
+  if (frag) addFrag(player, card.id, frag);
+
+  // 统计
+  player.stats.draws = (player.stats.draws || 0) + 1;
+  if (rarity === 'SSR') player.stats.ssr++;
+  else if (rarity === 'SR') player.stats.sr++;
+  else player.stats.r++;
+
+  return { rarity, cardId: card.id, name: card.name, isNew: wasNew, frag };
+}
+
+// 单抽。free=true 时不消耗问道令（每日免费）。
+export function drawOne(player, rng, opts = {}) {
+  if (opts.free) {
+    if (!dailyFreeAvailable(player)) return { error: '今日免费已用' };
+    player.dailyFreeDate = dayKey();
+  } else {
+    if (countRes(player, 'wendao') < 1) return { error: '问道令不足' };
+    player.res.wendao -= 1;
+  }
+  const result = doDraw(player, rng);
+  return { results: [result], free: !!opts.free };
+}
+
+// 十连。消耗 问道令×10；保底至少 1 张 SR。
+export function drawTen(player, rng) {
+  if (countRes(player, 'wendao') < 10) return { error: '问道令不足（需 10）' };
+  player.res.wendao -= 10;
+  const results = [];
+  for (let i = 0; i < 10; i++) results.push(doDraw(player, rng));
+  // 十连保底：若无 SR/SSR，则将末张提升为 SR
+  if (GACHA.tenGuaranteeSR && !results.some((r) => r.rarity === 'SR' || r.rarity === 'SSR')) {
+    const last = results[results.length - 1];
+    const card = pickCard('SR', rng);
+    const wasNew = !hasCard(player, card.id);
+    ownCard(player, card.id);
+    const frag = wasNew ? 0 : GACHA.dupFrags.SR;
+    if (frag) addFrag(player, card.id, frag);
+    // 维持 pity 一致：保底 SR 重置 sinceSR
+    player.pity.sinceSR = 0;
+    player.stats.sr++;
+    player.stats.r = Math.max(0, (player.stats.r || 1) - 1);
+    results[results.length - 1] = { rarity: 'SR', cardId: card.id, name: card.name, isNew: wasNew, frag };
+  }
+  return { results };
+}
+
+// 距下个 SSR 保底还差几抽
+export function pitySSRRemaining(player) {
+  return Math.max(0, GACHA.pitySSR - (player.pity.sinceSSR || 0));
+}
+export function pitySRRemaining(player) {
+  return Math.max(0, GACHA.pitySR - (player.pity.sinceSR || 0));
+}
diff --git a/apps/ling-xu-wen-jian-lu/src/core/player.js b/apps/ling-xu-wen-jian-lu/src/core/player.js
new file mode 100644
index 0000000..8c2cd3e
--- /dev/null
+++ b/apps/ling-xu-wen-jian-lu/src/core/player.js
@@ -0,0 +1,174 @@
+// ============================================================================
+// 玩家状态：资源 / 卡牌收藏 / 阵容 / 统计。纯函数（除 localStorage 由 save.js 处理）。
+// ============================================================================
+import { START_RESOURCES, RESOURCES, clamp } from '../config.js';
+import { CARDS, CARD_MAP } from '../data/cards.js';
+import { newInstance, instancePower } from './card.js';
+
+// 起始赠送 4 张 R 卡，保证开局即可排出一支能打的队伍。
+const STARTER_CARDS = ['R001', 'R003', 'R006', 'R007'];
+
+export function newPlayer() {
+  const cards = {};
+  const frags = {};
+  const codex = {};
+  for (const id of STARTER_CARDS) {
+    cards[id] = newInstance(id);
+    frags[id] = 0;
+    codex[id] = true;
+  }
+  return {
+    res: { ...START_RESOURCES },
+    cards,
+    frags,
+    codex,
+    formation: ['R001', 'R003', 'R006', 'R007', null], // 1 主坦位、2 输出位…
+    pity: { sinceSSR: 0, sinceSR: 0, total: 0 },
+    dailyFreeDate: '',
+    story: { clearedStages: {}, highestChapter: 1 },
+    secret: { floor: 1, bestFloor: 1, saveFloor: 1 },
+    cave: { lastSeen: 0 },
+    stats: {
+      draws: 0, ssr: 0, sr: 0, r: 0,
+      battlesWon: 0, battlesLost: 0, stagesCleared: 0,
+      secretFloors: 0, starsTotal: 0,
+    },
+    achievements: [],
+    createdAt: 0,
+    lastSeen: 0,
+  };
+}
+
+// 幂等重算 / 迁移：补齐缺失字段、钳制数值，保证存档向后兼容。
+export function recompute(player) {
+  if (!player) return player;
+  if (!player.res || typeof player.res !== 'object') player.res = {};
+  for (const r of RESOURCES) {
+    if (!Number.isFinite(player.res[r.id])) player.res[r.id] = START_RESOURCES[r.id] || 0;
+    if (player.res[r.id] < 0) player.res[r.id] = 0;
+  }
+  if (!player.cards || typeof player.cards !== 'object') player.cards = {};
+  if (!player.frags || typeof player.frags !== 'object') player.frags = {};
+  if (!player.codex || typeof player.codex !== 'object') player.codex = {};
+  // 卡牌实例字段兜底
+  for (const id of Object.keys(player.cards)) {
+    const inst = player.cards[id];
+    if (!inst) continue;
+    if (!Number.isFinite(inst.level) || inst.level < 1) inst.level = 1;
+    if (!Number.isFinite(inst.br) || inst.br < 0) inst.br = 0;
+    if (!Number.isFinite(inst.star) || inst.star < 0) inst.star = 0;
+    if (!Number.isFinite(inst.skillLv) || inst.skillLv < 1) inst.skillLv = 1;
+    if (!Number.isFinite(inst.exp) || inst.exp < 0) inst.exp = 0;
+  }
+  if (!Array.isArray(player.formation) || player.formation.length !== 5) {
+    player.formation = ['R001', 'R003', 'R006', 'R007', null];
+  }
+  // 阵容中引用的卡牌必须已拥有，否则置空
+  player.formation = player.formation.map((id) => (id && player.cards[id] ? id : null));
+  if (!player.pity || typeof player.pity !== 'object') player.pity = { sinceSSR: 0, sinceSR: 0, total: 0 };
+  if (!player.dailyFreeDate) player.dailyFreeDate = '';
+  if (!player.story || typeof player.story !== 'object') player.story = { clearedStages: {}, highestChapter: 1 };
+  if (!player.story.clearedStages) player.story.clearedStages = {};
+  if (!Number.isFinite(player.story.highestChapter) || player.story.highestChapter < 1) player.story.highestChapter = 1;
+  if (!player.secret || typeof player.secret !== 'object') player.secret = { floor: 1, bestFloor: 1, saveFloor: 1 };
+  for (const k of ['floor', 'bestFloor', 'saveFloor']) {
+    if (!Number.isFinite(player.secret[k]) || player.secret[k] < 1) player.secret[k] = 1;
+  }
+  if (!player.cave || typeof player.cave !== 'object') player.cave = { lastSeen: 0 };
+  if (!player.stats || typeof player.stats !== 'object') player.stats = {};
+  const dflt = { draws: 0, ssr: 0, sr: 0, r: 0, battlesWon: 0, battlesLost: 0, stagesCleared: 0, secretFloors: 0, starsTotal: 0 };
+  for (const k of Object.keys(dflt)) if (!Number.isFinite(player.stats[k])) player.stats[k] = dflt[k];
+  if (!Array.isArray(player.achievements)) player.achievements = [];
+  if (!Number.isFinite(player.createdAt)) player.createdAt = 0;
+  if (!Number.isFinite(player.lastSeen)) player.lastSeen = 0;
+  // 重算星级总数统计
+  player.stats.starsTotal = totalStars(player);
+  return player;
+}
+
+// ── 资源 ────────────────────────────────────────────────────────────────────
+export function addRes(player, id, qty) {
+  if (!id || !Number.isFinite(qty)) return;
+  player.res[id] = (player.res[id] || 0) + qty;
+  if (player.res[id] < 0) player.res[id] = 0;
+}
+export function countRes(player, id) { return Math.max(0, Math.floor(player.res[id] || 0)); }
+export function canAfford(player, costs) {
+  if (!costs) return true;
+  for (const [id, qty] of Object.entries(costs)) {
+    if (countRes(player, id) < qty) return false;
+  }
+  return true;
+}
+export function spendRes(player, costs) {
+  if (!canAfford(player, costs)) return false;
+  if (!costs) return true;
+  for (const [id, qty] of Object.entries(costs)) player.res[id] -= qty;
+  return true;
+}
+
+// ── 卡牌 / 碎片 ──────────────────────────────────────────────────────────────
+// 拥有一张卡（若未拥有则创建实例并登记图鉴）。返回是否为新获得。
+export function ownCard(player, cardId) {
+  if (!CARD_MAP[cardId]) return false;
+  let isNew = false;
+  if (!player.cards[cardId]) {
+    player.cards[cardId] = newInstance(cardId);
+    isNew = true;
+  }
+  if (!player.codex[cardId]) { player.codex[cardId] = true; isNew = true; }
+  if (player.frags[cardId] == null) player.frags[cardId] = 0;
+  return isNew;
+}
+export function addFrag(player, cardId, qty) {
+  if (!qty) return;
+  player.frags[cardId] = (player.frags[cardId] || 0) + qty;
+}
+export function countFrag(player, cardId) { return Math.max(0, Math.floor(player.frags[cardId] || 0)); }
+export function hasCard(player, cardId) { return !!player.cards[cardId]; }
+
+// ── 阵容 ────────────────────────────────────────────────────────────────────
+export function setFormation(player, slots) {
+  if (!Array.isArray(slots) || slots.length !== 5) return false;
+  // 校验：引用的卡必须已拥有；同一卡不可重复上阵
+  const seen = new Set();
+  const next = slots.map((id) => {
+    if (!id) return null;
+    if (!player.cards[id] || seen.has(id)) return null;
+    seen.add(id);
+    return id;
+  });
+  player.formation = next;
+  return true;
+}
+// 当前阵容的有效实例列表（带 position，1..5），跳过空位
+export function activeFormation(player) {
+  const out = [];
+  for (let i = 0; i < 5; i++) {
+    const id = player.formation[i];
+    if (id && player.cards[id]) out.push({ id, instance: player.cards[id], pos: i + 1 });
+  }
+  return out;
+}
+export function formationPower(player) {
+  return activeFormation(player).reduce((s, c) => s + instancePower(c.instance), 0);
+}
+
+// ── 收集 / 图鉴 ──────────────────────────────────────────────────────────────
+export function collectionCount(player) { return Object.keys(player.codex).length; }
+export function collectionTotal() { return CARDS.length; }
+export function collectionProgress(player) {
+  return collectionTotal() > 0 ? collectionCount(player) / collectionTotal() : 0;
+}
+export function totalStars(player) {
+  let s = 0;
+  for (const inst of Object.values(player.cards)) s += (inst.star || 0);
+  return s;
+}
+
+// 图鉴收集奖励档位（设计稿 6.3）
+export const CODEX_TIERS = [
+  { pct: 0.50, reward: { wendao: 10 }, label: '问道令×10' },
+  { pct: 0.80, reward: { tiandao_f: 3 }, label: '天道本源·碎片×3' },
+  { pct: 1.00, reward: { tiandao: 1 }, label: '天道本源×1（限定彩礼）' },
+];
diff --git a/apps/ling-xu-wen-jian-lu/src/core/rng.js b/apps/ling-xu-wen-jian-lu/src/core/rng.js
new file mode 100644
index 0000000..7c69d65
--- /dev/null
+++ b/apps/ling-xu-wen-jian-lu/src/core/rng.js
@@ -0,0 +1,58 @@
+// ============================================================================
+// 随机工具：所有随机逻辑默认 Math.random，但接受外部注入的 rng（便于单测/种子化）
+// ============================================================================
+
+const DEFAULT = Math.random;
+
+// 线性同余生成器，返回一个确定性的 rng 函数（种子化）
+export function makeRng(seed) {
+  let s = (seed >>> 0) || 1;
+  return function rng() {
+    s = (s * 1664525 + 1013904223) >>> 0;
+    return s / 0x100000000;
+  };
+}
+
+// [min, max) 浮点
+export function range(rng, min, max) {
+  const r = (rng || DEFAULT)();
+  return min + r * (max - min);
+}
+
+// [min, max] 整数（闭区间）
+export function rangeInt(rng, min, max) {
+  return Math.floor(range(rng, min, max + 1));
+}
+
+// 概率判定
+export function chance(rng, p) {
+  return (rng || DEFAULT)() < p;
+}
+
+// 等概率取一项
+export function pick(rng, arr) {
+  return arr[Math.floor((rng || DEFAULT)() * arr.length)];
+}
+
+// 加权抽取：entries=[{item, weight}]，返回 item（总权重不必归一）
+export function weighted(rng, entries) {
+  let total = 0;
+  for (const e of entries) total += e.weight;
+  if (total <= 0) return entries.length ? entries[0].item : undefined;
+  let r = (rng || DEFAULT)() * total;
+  for (const e of entries) {
+    r -= e.weight;
+    if (r <= 0) return e.item;
+  }
+  return entries[entries.length - 1].item;
+}
+
+// Fisher–Yates 洗牌（返回新数组）
+export function shuffle(rng, arr) {
+  const a = arr.slice();
+  for (let i = a.length - 1; i > 0; i--) {
+    const j = Math.floor((rng || DEFAULT)() * (i + 1));
+    [a[i], a[j]] = [a[j], a[i]];
+  }
+  return a;
+}
diff --git a/apps/ling-xu-wen-jian-lu/src/core/save.js b/apps/ling-xu-wen-jian-lu/src/core/save.js
new file mode 100644
index 0000000..10e9265
--- /dev/null
+++ b/apps/ling-xu-wen-jian-lu/src/core/save.js
@@ -0,0 +1,127 @@
+// ============================================================================
+// 存档：localStorage 持久化 + 导入导出（base64）+ 多槽位。
+// 通过 storage 访问器隔离 localStorage，便于在 Node 单测中注入内存版。
+// 槽位 key：lxx_slot_<n>（1..NUM_SLOTS）；当前活跃槽记录于 lxx_activeslot。
+// ============================================================================
+import { recompute } from './player.js';
+import { nowSec } from '../config.js';
+
+const NUM_SLOTS = 3;
+const SLOT_PREFIX = 'lxx_slot_';
+const ACTIVE_KEY = 'lxx_activeslot';
+
+let storage = null;
+try {
+  if (typeof localStorage !== 'undefined') storage = localStorage;
+} catch (_) { /* 某些环境访问 localStorage 会抛错 */ }
+
+// 测试 / 注入用
+export function _setStorage(s) { storage = s; }
+export function _NUM_SLOTS() { return NUM_SLOTS; }
+
+function slotKey(n) { return `${SLOT_PREFIX}${n}`; }
+
+export function getActiveSlot() {
+  const raw = storage ? storage.getItem(ACTIVE_KEY) : null;
+  const n = parseInt(raw, 10);
+  return (n >= 1 && n <= NUM_SLOTS) ? n : 1;
+}
+export function setActiveSlot(n) {
+  try { if (storage) storage.setItem(ACTIVE_KEY, String(n)); } catch (_) {}
+}
+
+export function hasSave(slot) {
+  const n = slot || getActiveSlot();
+  try { return !!(storage && storage.getItem(slotKey(n))); } catch (_) { return false; }
+}
+
+export function saveGame(player) {
+  try {
+    const slot = (player && player.slot) || getActiveSlot();
+    if (player) player.slot = slot;
+    setActiveSlot(slot);
+    player.lastSeen = nowSec();
+    // 洞府挂机基线时间随存档落盘
+    if (player.cave) player.cave.lastSeen = player.cave.lastSeen || player.lastSeen;
+    if (storage) storage.setItem(slotKey(slot), JSON.stringify(player));
+    return true;
+  } catch (_) { return false; }
+}
+
+export function loadGame(slot) {
+  try {
+    const n = slot || getActiveSlot();
+    const raw = storage ? storage.getItem(slotKey(n)) : null;
+    if (!raw) return null;
+    const player = JSON.parse(raw);
+    recompute(player);
+    player.slot = n;
+    return player;
+  } catch (_) { return null; }
+}
+
+export function clearSave(slot) {
+  try {
+    const n = slot || getActiveSlot();
+    if (storage) storage.removeItem(slotKey(n));
+    return true;
+  } catch (_) { return false; }
+}
+
+// 列出所有槽位的元信息（空槽返回 { slot, empty:true }）
+export function listSlots() {
+  const out = [];
+  for (let n = 1; n <= NUM_SLOTS; n++) {
+    let raw = null;
+    try { raw = storage ? storage.getItem(slotKey(n)) : null; } catch (_) {}
+    if (!raw) { out.push({ slot: n, empty: true }); continue; }
+    try {
+      const p = JSON.parse(raw);
+      out.push(slotMeta(p, n));
+    } catch (_) {
+      out.push({ slot: n, empty: false, corrupt: true });
+    }
+  }
+  return out;
+}
+function slotMeta(p, n) {
+  const owned = p.cards ? Object.keys(p.cards).length : 0;
+  return {
+    slot: n,
+    empty: false,
+    lingshi: Math.floor(p.res && p.res.lingshi || 0),
+    wendao: Math.floor(p.res && p.res.wendao || 0),
+    cards: owned,
+    codex: p.codex ? Object.keys(p.codex).length : 0,
+    highestChapter: (p.story && p.story.highestChapter) || 1,
+    secretFloor: (p.secret && p.secret.bestFloor) || 1,
+    createdAt: p.createdAt || 0,
+    lastSeen: p.lastSeen || 0,
+  };
+}
+
+export function loadSlot(n) { setActiveSlot(n); return loadGame(n); }
+export function saveSlot(n, player) { if (player) player.slot = n; setActiveSlot(n); return saveGame(player); }
+export function deleteSlot(n) {
+  try { if (storage) storage.removeItem(slotKey(n)); return true; } catch (_) { return false; }
+}
+
+// 导出为可分享的 base64 字符串（UTF-8 安全）
+export function exportSave(player) { return btoaSafe(JSON.stringify(player)); }
+export function importSave(str) {
+  try {
+    const player = JSON.parse(atobSafe(str));
+    recompute(player);
+    return player;
+  } catch (_) { return null; }
+}
+
+// —— UTF-8 安全的 base64（兼容浏览器与 Node）——
+function btoaSafe(str) {
+  if (typeof btoa === 'function') return btoa(unescape(encodeURIComponent(str)));
+  return Buffer.from(str, 'utf8').toString('base64');
+}
+function atobSafe(str) {
+  if (typeof atob === 'function') return decodeURIComponent(escape(atob(str)));
+  return Buffer.from(str, 'base64').toString('utf8');
+}
diff --git a/apps/ling-xu-wen-jian-lu/src/core/secret.js b/apps/ling-xu-wen-jian-lu/src/core/secret.js
new file mode 100644
index 0000000..fb2e6d3
--- /dev/null
+++ b/apps/ling-xu-wen-jian-lu/src/core/secret.js
@@ -0,0 +1,160 @@
+// ============================================================================
+// 秘境探索（设计稿 3.2：Roguelike 爬塔）
+//   - 9 重天 × 10 层 = 90 层；每层随机一个事件节点。
+//   - 节点：妖物盘踞(战斗) / 上古宝箱 / 风水奇遇 / 秘境商人 / 天道试炼 / 心魔之劫。
+//   - 每 5 层发秘境宝箱；每 10 层自动存档（可中断继续）。
+//   - 单次进入层数递增；离场后从存档层继续。
+// ============================================================================
+import { weighted, pick, chance, rangeInt } from './rng.js';
+import { makeEnemy, makeBossPower } from '../data/enemies.js';
+import { playerSpecsFrom, runBattle } from './battle.js';
+import { addRes, addFrag } from './player.js';
+import { CARDS } from '../data/cards.js';
+import { ELEMENTS } from '../config.js';
+
+export const TOTAL_FLOORS = 90;
+export const FLOORS_PER_TIAN = 10;
+
+// 节点类型权重（设计稿 3.2）
+const NODE_WEIGHTS = [
+  { item: 'battle',  weight: 40 },
+  { item: 'treasure', weight: 20 },
+  { item: 'fengshui', weight: 15 },
+  { item: 'merchant', weight: 10 },
+  { item: 'trial',    weight: 10 },
+  { item: 'mirror',   weight: 5 },
+];
+
+export function rollNode(rng) { return weighted(rng, NODE_WEIGHTS); }
+
+// 当前层数对应的「重天」序号（1..9）
+export function tianOf(floor) { return Math.floor((floor - 1) / FLOORS_PER_TIAN) + 1; }
+
+// 层数 → 敌方战力（随层数递增）
+export function floorPower(floor) { return Math.round(400 * Math.pow(1.075, floor - 1)); }
+
+// 随机五行（混沌虚空之后倾向无属性混合）
+function randomElement(rng) {
+  if (floorPower && false) {} // 占位
+  return pick(rng, ELEMENTS).id;
+}
+
+// 心魔之劫：复制我方阵容为镜像敌人
+function mirrorSpecs(player) {
+  return playerSpecsFrom(player).map((s) => ({ ...s, name: `心魔·${s.name}`, role: s.role }));
+}
+
+// 推进一层：返回该层事件与结算。player.secret.floor 在调用后由 enterFloor 统一递增。
+// 返回 { node, kind, text, rewards, battle?(run), floor, over }
+export function enterFloor(player, rng) {
+  const floor = player.secret.floor;
+  const power = floorPower(floor);
+  const node = rollNode(rng);
+  const out = { floor, node, kind: 'event', text: '', rewards: { res: {}, frags: {} }, battle: null, over: false };
+  const add = (id, q) => { out.rewards.res[id] = (out.rewards.res[id] || 0) + q; };
+  const addFragRarity = (rarity, qty) => {
+    const pool = CARDS.filter((c) => c.rarity === rarity);
+    if (pool.length) { const c = pick(rng, pool); out.rewards.frags[c.id] = (out.rewards.frags[c.id] || 0) + qty; }
+  };
+
+  switch (node) {
+    case 'battle': {
+      const el = randomElement(rng);
+      const enemies = [makeEnemy(power * 0.6, el, rng), makeEnemy(power * 0.6, el, rng), makeEnemy(power * 0.5, el, rng)];
+      const run = runBattle(playerSpecsFrom(player), enemies, rng);
+      out.kind = 'battle'; out.battle = run; out.text = `第 ${floor} 层 · 妖物盘踞`;
+      if (run.result === 'win') {
+        add('lingshi', rangeInt(rng, 40, 90));
+        if (chance(rng, 0.20)) addFragRarity('R', 1);
+        out.win = true;
+      } else out.win = false;
+      break;
+    }
+    case 'treasure': {
+      out.text = `第 ${floor} 层 · 上古宝箱`;
+      add('lingshi', rangeInt(rng, 50, 120));
+      const r = (rng || Math.random)();
+      if (r < 0.5) add('exp_s', 2);
+      else if (r < 0.8) addFragRarity('R', 1);
+      else addFragRarity('SR', 1);
+      out.win = true;
+      break;
+    }
+    case 'fengshui': {
+      out.text = `第 ${floor} 层 · 风水奇遇`;
+      if (chance(rng, 0.5)) add('lingshi', rangeInt(rng, 30, 80));
+      else add('exp_m', 1);
+      out.win = true;
+      break;
+    }
+    case 'merchant': {
+      // 商人：用灵石兑换稀有材料（此处直接给少量天道碎片，扣灵石）
+      const cost = rangeInt(rng, 60, 120);
+      if (player.res.lingshi >= cost) {
+        player.res.lingshi -= cost;
+        add('tiandao_f', 1);
+        out.text = `第 ${floor} 层 · 秘境商人：以 ${cost} 灵石换得天道本源·碎片×1`;
+      } else {
+        out.text = `第 ${floor} 层 · 秘境商人：灵石不足，空手而归`;
+      }
+      out.win = true;
+      break;
+    }
+    case 'trial': {
+      // 天道试炼：高难单体 Boss，胜后必得 SSR 碎片
+      const el = randomElement(rng);
+      const boss = makeBossPower(power, el, rng);
+      const run = runBattle(playerSpecsFrom(player), [boss], rng);
+      out.kind = 'battle'; out.battle = run; out.text = `第 ${floor} 层 · 天道试炼`;
+      if (run.result === 'win') { addFragRarity('SSR', 1); add('wendao', 1); out.win = true; }
+      else out.win = false;
+      break;
+    }
+    case 'mirror': {
+      // 心魔之劫：镜像挑战，胜后全属性永久 +5%（以灵石/天道本源象征）
+      const run = runBattle(playerSpecsFrom(player), mirrorSpecs(player), rng);
+      out.kind = 'battle'; out.battle = run; out.text = `第 ${floor} 层 · 心魔之劫`;
+      if (run.result === 'win') {
+        add('tiandao_f', 1); add('lingshi', 100);
+        out.text += '（战胜心魔，道心更坚！）';
+        out.win = true;
+      } else out.win = false;
+      break;
+    }
+    default: out.win = true; break;
+  }
+
+  // 应用奖励
+  if (out.win) {
+    for (const [id, q] of Object.entries(out.rewards.res)) addRes(player, id, q);
+    for (const [cid, q] of Object.entries(out.rewards.frags)) addFrag(player, cid, q);
+    if (out.kind === 'battle') player.stats.battlesWon = (player.stats.battlesWon || 0) + 1;
+    // 推进层数
+    player.secret.floor = Math.min(TOTAL_FLOORS, floor + 1);
+    player.secret.bestFloor = Math.max(player.secret.bestFloor || 1, player.secret.floor);
+    // 每 5 层秘境宝箱
+    if (player.secret.floor % 5 === 0) {
+      addRes(player, 'wendao', 1);
+      out.boxFloor = player.secret.floor;
+    }
+    // 每 10 层自动存档点
+    if (player.secret.floor % FLOORS_PER_TIAN === 1 && floor % FLOORS_PER_TIAN !== 1) {
+      player.secret.saveFloor = floor + 1;
+      out.savedFloor = player.secret.saveFloor;
+    }
+    player.stats.secretFloors = player.secret.bestFloor;
+    // 通关 90 层
+    if (player.secret.floor >= TOTAL_FLOORS) out.over = true;
+  } else {
+    // 战败：回到最近存档层（不推进）
+    player.secret.floor = player.secret.saveFloor || 1;
+    player.stats.battlesLost = (player.stats.battlesLost || 0) + 1;
+    out.defeated = true;
+  }
+  return out;
+}
+
+// 重置秘境（回到存档层 / 第 1 层）
+export function resetSecret(player, toSave) {
+  player.secret.floor = toSave ? (player.secret.saveFloor || 1) : 1;
+}
diff --git a/apps/ling-xu-wen-jian-lu/src/core/stage.js b/apps/ling-xu-wen-jian-lu/src/core/stage.js
new file mode 100644
index 0000000..780a83a
--- /dev/null
+++ b/apps/ling-xu-wen-jian-lu/src/core/stage.js
@@ -0,0 +1,152 @@
+// ============================================================================
+// 主线关卡（设计稿 3.1：十二卷章 × 每章 7 关 = 84 战斗节点）。
+//   每章：5 普通 + 1 精英 + 1 首领；推荐战力逐章递增；Boss 战力 = 推荐 ×1.5。
+//   通关解锁下一关 / 下一章，并按掉落表（设计稿 5.2）发放资源与碎片。
+// ============================================================================
+import { rangeInt, chance, pick } from './rng.js';
+import { makeEnemyFormation } from '../data/enemies.js';
+import { playerSpecsFrom, runBattle } from './battle.js';
+import { addRes, addFrag } from './player.js';
+import { CARDS } from '../data/cards.js';
+import { BREAK_STONE } from '../config.js';
+
+// 设计稿 3.1 章节表
+export const CHAPTERS = [
+  { chapter: 1,  name: '初入灵墟',   power: 500,  element: 'earth', core: 'lingshi',   rarityDrop: 'R' },
+  { chapter: 2,  name: '青云古道',   power: 800,  element: 'wood',  core: 'exp_s',     rarityDrop: 'R' },
+  { chapter: 3,  name: '赤焰峡谷',   power: 1200, element: 'fire',  core: 'lingshi',   rarityDrop: 'SR' },
+  { chapter: 4,  name: '寒潭幽境',   power: 1700, element: 'water', core: 'break',     rarityDrop: 'R' },
+  { chapter: 5,  name: '金戈铁壁',   power: 2300, element: 'metal', core: 'gongfa',    rarityDrop: 'R' },
+  { chapter: 6,  name: '万木回廊',   power: 3000, element: 'wood',  core: 'lingshi',   rarityDrop: 'SR' },
+  { chapter: 7,  name: '地煞迷宫',   power: 3800, element: 'earth', core: 'break',     rarityDrop: 'SR' },
+  { chapter: 8,  name: '天火熔炉',   power: 4700, element: 'fire',  core: 'gongfa',    rarityDrop: 'SR' },
+  { chapter: 9,  name: '玄水冰窟',   power: 5700, element: 'water', core: 'tiandao_f', rarityDrop: 'SR' },
+  { chapter: 10, name: '太初剑冢',   power: 6800, element: 'metal', core: 'gongfa',    rarityDrop: 'SSR' },
+  { chapter: 11, name: '混沌虚空',   power: 8000, element: 'none',  core: 'tiandao',   rarityDrop: 'SSR' },
+  { chapter: 12, name: '天道归墟',   power: 9500, element: 'fire',  core: 'tiandao',   rarityDrop: 'SSR' },
+];
+
+const NORMAL_FACTORS = [0.70, 0.75, 0.80, 0.85, 0.90];
+
+// 构造某章 7 个关卡（按 stage 序号 1..7）
+export function stagesForChapter(chapterIdx) {
+  const ch = CHAPTERS[Math.max(0, Math.min(CHAPTERS.length - 1, chapterIdx))];
+  const stages = [];
+  for (let i = 0; i < 5; i++) {
+    stages.push({
+      id: `${ch.chapter}-${i + 1}`, chapter: ch.chapter, idx: i + 1,
+      type: 'normal', power: Math.round(ch.power * NORMAL_FACTORS[i]),
+      element: ch.element, name: `${ch.name} · 第${i + 1}阵`,
+    });
+  }
+  stages.push({
+    id: `${ch.chapter}-6`, chapter: ch.chapter, idx: 6,
+    type: 'elite', power: Math.round(ch.power * 1.0),
+    element: ch.element, name: `${ch.name} · 精英`,
+  });
+  stages.push({
+    id: `${ch.chapter}-7`, chapter: ch.chapter, idx: 7,
+    type: 'boss', power: Math.round(ch.power * 1.0),
+    element: ch.element, name: `${ch.name} · 首领`,
+  });
+  return stages;
+}
+
+export function stageDef(stageId) {
+  const [c, s] = String(stageId).split('-').map((x) => parseInt(x, 10));
+  if (!Number.isFinite(c) || !Number.isFinite(s)) return null;
+  const list = stagesForChapter(c - 1);
+  return list.find((st) => st.idx === s) || null;
+}
+
+// 章节是否解锁（最高已解锁章节）
+export function isChapterUnlocked(player, chapter) {
+  return chapter <= (player.story.highestChapter || 1);
+}
+
+// 关卡是否可进入：章节解锁 & 上一关已通关（首关只需章节解锁）
+export function canEnterStage(player, stageId) {
+  const st = stageDef(stageId);
+  if (!st) return false;
+  if (!isChapterUnlocked(player, st.chapter)) return false;
+  if (st.idx === 1) return true;
+  const prev = `${st.chapter}-${st.idx - 1}`;
+  return !!player.story.clearedStages[prev];
+}
+export function isStageCleared(player, stageId) { return !!player.story.clearedStages[stageId]; }
+
+// 掉落表（设计稿 5.2）
+function rollDrops(st, rng) {
+  const ch = CHAPTERS[st.chapter - 1];
+  const rewards = { res: {}, frags: {} }; // frags: {cardId: qty}
+  const add = (id, q) => { rewards.res[id] = (rewards.res[id] || 0) + q; };
+  const addFragRarity = (rarity, qty) => {
+    const pool = CARDS.filter((c) => c.rarity === rarity);
+    if (!pool.length) return;
+    const c = pick(rng, pool);
+    rewards.frags[c.id] = (rewards.frags[c.id] || 0) + qty;
+  };
+
+  if (st.type === 'normal') {
+    add('lingshi', rangeInt(rng, 20, 50));
+    if (chance(rng, 0.30)) add('exp_s', 1);
+  } else if (st.type === 'elite') {
+    add('lingshi', rangeInt(rng, 80, 150));
+    if (ch.element !== 'none') add(BREAK_STONE[st.element], 1);
+    if (chance(rng, 0.15)) addFragRarity('R', 1);
+  } else { // boss
+    add('lingshi', 200 + st.chapter * 20);
+    add('exp_m', 2);
+    // 核心掉落
+    if (ch.core === 'lingshi') add('lingshi', 150);
+    else if (ch.core === 'exp_s') add('exp_s', 3);
+    else if (ch.core === 'exp_m' || ch.core === 'gongfa') add('gongfa', st.chapter >= 8 ? 2 : 1);
+    else if (ch.core === 'break' && st.element !== 'none') add(BREAK_STONE[st.element], 2);
+    else if (ch.core === 'tiandao_f') add('tiandao_f', 1);
+    else if (ch.core === 'tiandao') add('tiandao', 1);
+    // 稀有碎片
+    const r = ch.rarityDrop;
+    if (r === 'R') { if (chance(rng, 0.25)) addFragRarity('R', 1); }
+    else if (r === 'SR') {
+      if (chance(rng, 0.20)) addFragRarity('SR', 1);
+      if (st.chapter >= 10 && chance(rng, 0.02)) addFragRarity('SSR', 1);
+    } else if (r === 'SSR') {
+      if (chance(rng, 0.30)) addFragRarity('SR', 2);
+      if (chance(rng, 0.05)) addFragRarity('SSR', 1);
+    }
+    add('wendao', 1); // 首领必给 1 问道令
+  }
+  return rewards;
+}
+
+// 进入关卡 → 自动战斗 → 结算。返回 { ok, result, rewards, log }
+export function enterStage(player, stageId, rng) {
+  const st = stageDef(stageId);
+  if (!st) return { ok: false, reason: '无此关卡' };
+  if (!canEnterStage(player, stageId)) return { ok: false, reason: '尚未解锁' };
+  const specs = playerSpecsFrom(player);
+  if (!specs.length) return { ok: false, reason: '阵容为空' };
+  const enemies = makeEnemyFormation(st.power, st.element, st.type, rng);
+  const run = runBattle(specs, enemies, rng);
+  const rewards = { res: {}, frags: {} };
+  const logs = run.log.slice();
+  if (run.result === 'win') {
+    const drops = rollDrops(st, rng);
+    rewards.res = drops.res;
+    rewards.frags = drops.frags;
+    for (const [id, q] of Object.entries(drops.res)) addRes(player, id, q);
+    for (const [cid, q] of Object.entries(drops.frags)) addFrag(player, cid, q);
+    // 记录通关 / 解锁
+    player.story.clearedStages[stageId] = true;
+    player.stats.stagesCleared = (player.stats.stagesCleared || 0) + 1;
+    player.stats.battlesWon = (player.stats.battlesWon || 0) + 1;
+    if (st.idx === 7 && st.chapter === (player.story.highestChapter || 1) && st.chapter < CHAPTERS.length) {
+      player.story.highestChapter = st.chapter + 1;
+    }
+    // 通关 12 章首领会额外奖励限定天道本源
+    if (st.chapter === 12 && st.idx === 7) addRes(player, 'tiandao', 1);
+  } else {
+    player.stats.battlesLost = (player.stats.battlesLost || 0) + 1;
+  }
+  return { ok: true, result: run.result, rewards, rounds: run.rounds, log: logs };
+}
diff --git a/apps/ling-xu-wen-jian-lu/src/data/cards.js b/apps/ling-xu-wen-jian-lu/src/data/cards.js
new file mode 100644
index 0000000..1d51fd9
--- /dev/null
+++ b/apps/ling-xu-wen-jian-lu/src/data/cards.js
@@ -0,0 +1,197 @@
+// ============================================================================
+// 灵墟·问剑录 · 卡牌数据库（设计稿 第二节：15 张基础卡）
+//
+// 技能（skill）统一 DSL，供战斗引擎通用解析：
+//   { id, name, type: 'dmg'|'heal'|'buff'|'shield'|'cleanse'|'ctrl',
+//     target: 'enemy_one'|'enemy_all'|'ally_lowest'|'ally_all'|'self',
+//     mult, fixed, effect?, selfEffect? }
+//   effect 可为：
+//     { kind:'burn'|'poison', dps, dur }      — 持续伤害（dps = 施法者攻击的比例/回合）
+//     { kind:'stun'|'silence'|'freeze', dur } — 控制（stun 跳过回合；silence/freeze 仅普攻）
+//     { kind:'slow', amount, dur }            — 减速（速度 -amount）
+//     { kind:'invuln', dur }                  — 无敌
+//     { stat:'atk'|'def'|'spd'|'crit', amount, dur } — 属性增益（amount 为加成比例）
+//     { shieldPct, dur, taunt? }              — 护盾（占最大气血比例）+ 可选嘲讽
+//     { dispel:'debuff'|'buff' }              — 净化 / 驱散
+//
+// 被动（passive）DSL：
+//   { kind:'crit'|'atk'|'def'|'spd'|'resist'|'heal_in'|'lifesteal'|'thorns',
+//     amount }
+//   { kind:'aura_enemy_down', amount }   — 开场敌方全属性 -amount
+//   { kind:'heal_aura', amount }         — 全队受治疗 +amount
+//   { kind:'revive', hpPct }             — 濒死复活一次
+//   { kind:'deathsave', hpPct }          — 致命伤害免疫并回血一次
+//   { kind:'enrage', amount, dur }       — 血量低于阈值时全属性 ×（1+amount）持续 dur 回合
+//   { kind:'team_revive', hpPct }        — 阵亡时全队复活并回血一次
+// ============================================================================
+
+export const CARDS = [
+  // ── R 卡（9）逸品·青玉 ──────────────────────────────────────────────────────
+  {
+    id: 'R001', name: '青竹剑侍', rarity: 'R', element: 'wood', cls: '剑修',
+    stats: { atk: 75, def: 40, hp: 320, spd: 70 }, role: 'dps',
+    actives: [{ id: 'a1', name: '竹影三叠', type: 'dmg', target: 'enemy_one', mult: 1.20 }],
+    passives: [],
+    story: '青云山外门的执剑童子，以竹为剑，招式朴素却暗合剑理。',
+    quote: '一竹一剑，亦可问道。',
+  },
+  {
+    id: 'R002', name: '赤焰灵狐', rarity: 'R', element: 'fire', cls: '符修',
+    stats: { atk: 60, def: 35, hp: 280, spd: 85 }, role: 'dps',
+    actives: [{ id: 'a1', name: '狐火灼烧', type: 'dmg', target: 'enemy_one', mult: 1.0,
+      effect: { kind: 'burn', dps: 0.30, dur: 2 } }],
+    passives: [],
+    story: '生于赤焰峡谷的灵狐，尾火不熄，灼敌于无形。',
+    quote: '可别被我的尾巴燎到了。',
+  },
+  {
+    id: 'R003', name: '玄龟甲士', rarity: 'R', element: 'water', cls: '体修',
+    stats: { atk: 30, def: 85, hp: 520, spd: 30 }, role: 'tank',
+    actives: [{ id: 'a1', name: '龟甲护盾', type: 'shield', target: 'self', mult: 0,
+      effect: { shieldPct: 0.30, dur: 2, taunt: true } }],
+    passives: [],
+    story: '寒潭深处的玄龟一族，背甲坚逾玄铁，世代为阵前盾卫。',
+    quote: '有我在，谁也越不过此阵。',
+  },
+  {
+    id: 'R004', name: '金戈锐士', rarity: 'R', element: 'metal', cls: '剑修',
+    stats: { atk: 85, def: 45, hp: 300, spd: 65 }, role: 'dps',
+    actives: [{ id: 'a1', name: '金戈破阵', type: 'dmg', target: 'enemy_one', mult: 1.40 }],
+    passives: [],
+    story: '金戈铁壁的守关锐士，一柄长戈可破百甲。',
+    quote: '破阵，只在须臾。',
+  },
+  {
+    id: 'R005', name: '厚土力士', rarity: 'R', element: 'earth', cls: '体修',
+    stats: { atk: 40, def: 80, hp: 500, spd: 30 }, role: 'tank',
+    actives: [{ id: 'a1', name: '撼地践踏', type: 'dmg', target: 'enemy_all', mult: 0.60,
+      effect: { kind: 'slow', amount: 0.20, dur: 2 } }],
+    passives: [],
+    story: '地煞迷宫中修土行的大汉，一步撼地，万夫迟滞。',
+    quote: '大地，皆为我臂助。',
+  },
+  {
+    id: 'R006', name: '柳叶医仙', rarity: 'R', element: 'wood', cls: '丹修',
+    stats: { atk: 30, def: 50, hp: 350, spd: 60 }, role: 'healer',
+    actives: [{ id: 'a1', name: '回春术', type: 'heal', target: 'ally_lowest', mult: 1.20 }],
+    passives: [],
+    story: '万木回廊采药的医仙，以柳叶为针，回春续命。',
+    quote: '且安心，伤可愈。',
+  },
+  {
+    id: 'R007', name: '流火散修', rarity: 'R', element: 'fire', cls: '剑修',
+    stats: { atk: 70, def: 40, hp: 300, spd: 75 }, role: 'dps',
+    actives: [{ id: 'a1', name: '烈焰斩', type: 'dmg', target: 'enemy_one', mult: 1.10 }],
+    passives: [],
+    story: '游历四方的散修剑客，剑走偏锋，烈焰裹刃。',
+    quote: '我的剑，烫得很。',
+  },
+  {
+    id: 'R008', name: '霜月散修', rarity: 'R', element: 'water', cls: '符修',
+    stats: { atk: 55, def: 45, hp: 320, spd: 70 }, role: 'ctrl',
+    actives: [{ id: 'a1', name: '寒冰咒', type: 'dmg', target: 'enemy_one', mult: 0.90,
+      effect: { kind: 'freeze', dur: 1 } }],
+    passives: [],
+    story: '寒潭月下修符的散修，一咒凝冰，封敌于瞬。',
+    quote: '且在这霜寒中静一静。',
+  },
+  {
+    id: 'R009', name: '飞羽散修', rarity: 'R', element: 'metal', cls: '阵修',
+    stats: { atk: 50, def: 40, hp: 300, spd: 80 }, role: 'support',
+    actives: [{ id: 'a1', name: '聚灵阵', type: 'buff', target: 'ally_all', mult: 0,
+      effect: { stat: 'atk', amount: 0.10, dur: 2 } }],
+    passives: [],
+    story: '布阵如飞的散修道人，一聚灵，全队锋芒更盛。',
+    quote: '灵气已聚，放手施为。',
+  },
+
+  // ── SR 卡（4）绝品·紫金 ──────────────────────────────────────────────────────
+  {
+    id: 'SR001', name: '白鹤仙子', rarity: 'SR', element: 'water', cls: '丹修',
+    stats: { atk: 65, def: 55, hp: 450, spd: 65 }, role: 'healer',
+    actives: [
+      { id: 'a1', name: '云鹤回春', type: 'heal', target: 'ally_all', mult: 1.0 },
+      { id: 'a2', name: '甘霖普降', type: 'heal', target: 'ally_all', mult: 0.80,
+        effect: { dispel: 'debuff' } },
+    ],
+    passives: [{ kind: 'heal_in', amount: 0.15 }], // 鹤羽护体：受治疗 +15%
+    story: '云鹤化形的仙子，仙羽轻拂，百病皆消。',
+    quote: '愿这甘霖，洗净诸般苦厄。',
+  },
+  {
+    id: 'SR002', name: '赤霄剑尊', rarity: 'SR', element: 'fire', cls: '剑修',
+    stats: { atk: 110, def: 50, hp: 400, spd: 72 }, role: 'dps',
+    actives: [
+      { id: 'a1', name: '赤霄九式', type: 'dmg', target: 'enemy_one', mult: 1.80 },
+      { id: 'a2', name: '燎原斩', type: 'dmg', target: 'enemy_all', mult: 1.20 },
+    ],
+    passives: [{ kind: 'crit', amount: 0.10 }], // 剑心通明：暴击率 +10%
+    story: '执赤霄神剑的剑道尊者，九式连环，星火燎原。',
+    quote: '剑出赤霄，万里燎原。',
+  },
+  {
+    id: 'SR003', name: '玄冥蛇姬', rarity: 'SR', element: 'earth', cls: '符修',
+    stats: { atk: 80, def: 60, hp: 480, spd: 60 }, role: 'ctrl',
+    actives: [
+      { id: 'a1', name: '毒雾弥漫', type: 'dmg', target: 'enemy_all', mult: 0.80,
+        effect: { kind: 'poison', dps: 0.25, dur: 3 } },
+      { id: 'a2', name: '石化之瞳', type: 'ctrl', target: 'enemy_one', mult: 0,
+        effect: { kind: 'silence', dur: 2 } },
+    ],
+    passives: [{ kind: 'thorns', amount: 0.15 }], // 蛇鳞反噬：受击反伤 15%
+    story: '玄冥深处的蛇姬，一瞥石化，毒雾蚀骨。',
+    quote: '与我斗，先问问我的鳞。',
+  },
+  {
+    id: 'SR004', name: '青莲道尊', rarity: 'SR', element: 'wood', cls: '阵修',
+    stats: { atk: 55, def: 70, hp: 500, spd: 55 }, role: 'support',
+    actives: [
+      { id: 'a1', name: '青莲法阵', type: 'buff', target: 'ally_all', mult: 0,
+        effect: { stat: 'def', amount: 0.20, dur: 2 } },
+      { id: 'a2', name: '灵气汇聚', type: 'buff', target: 'ally_all', mult: 0,
+        effect: { stat: 'spd', amount: 0.10, dur: 2 } },
+    ],
+    passives: [{ kind: 'resist', amount: 0.20 }], // 道法自然：效果抵抗 +20%
+    story: '青莲峰上的道尊，一念成阵，万法自然。',
+    quote: '道法自然，何须强求。',
+  },
+
+  // ── SSR 卡（2）至品·彩凰 ─────────────────────────────────────────────────────
+  {
+    id: 'SSR001', name: '蚩尤残魂', rarity: 'SSR', element: 'fire', cls: '体修',
+    stats: { atk: 120, def: 100, hp: 900, spd: 50 }, role: 'tank',
+    actives: [
+      { id: 'a1', name: '九黎战吼', type: 'dmg', target: 'enemy_all', mult: 1.50,
+        selfEffect: { kind: 'invuln', dur: 1 } },
+      { id: 'a2', name: '魔化之躯', type: 'heal', target: 'self', mult: 0.20,
+        effect: { stat: 'atk', amount: 0.30, dur: 3 } },
+    ],
+    passives: [
+      { kind: 'aura_enemy_down', amount: 0.05 }, // 兵主威压：开场敌方全属性 -5%
+      { kind: 'revive', hpPct: 0.30 },           // 不屈战魂：濒死复活
+      { kind: 'enrage', amount: 1.0, dur: 2, threshold: 0.30 }, // 兵主降临
+    ],
+    story: '上古兵主蚩尤的一缕残魂，重聚九黎战意，所向披靡。',
+    quote: '吾乃九黎之主，战魂不灭！',
+  },
+  {
+    id: 'SSR002', name: '瑶池圣母', rarity: 'SSR', element: 'water', cls: '丹修',
+    stats: { atk: 70, def: 90, hp: 800, spd: 60 }, role: 'healer',
+    actives: [
+      { id: 'a1', name: '天水净世', type: 'heal', target: 'ally_all', mult: 1.50,
+        effect: { dispel: 'debuff' } },
+      { id: 'a2', name: '瑶池仙露', type: 'heal', target: 'ally_lowest', mult: 2.0,
+        effect: { stat: 'atk', amount: 0.50, dur: 3 } },
+    ],
+    passives: [
+      { kind: 'heal_aura', amount: 0.20 }, // 慈航普度：全队受治疗 +20%
+      { kind: 'deathsave', hpPct: 0.30 },  // 水月镜花：致命伤害免疫并回血
+      { kind: 'team_revive', hpPct: 0.50 }, // 天泽万物：阵亡时全队复活
+    ],
+    story: '瑶池之主，慈航普度，一滴仙露可活白骨。',
+    quote: '天泽万物，生生不息。',
+  },
+];
+
+export const CARD_MAP = Object.fromEntries(CARDS.map((c) => [c.id, c]));
+export function cardDef(id) { return CARD_MAP[id] || null; }
diff --git a/apps/ling-xu-wen-jian-lu/src/data/enemies.js b/apps/ling-xu-wen-jian-lu/src/data/enemies.js
new file mode 100644
index 0000000..be7d9c1
--- /dev/null
+++ b/apps/ling-xu-wen-jian-lu/src/data/enemies.js
@@ -0,0 +1,193 @@
+// ============================================================================
+// 灵墟·问剑录 · 敌人 / Boss 数据（设计稿第三节：主线十二卷章 + 秘境）
+//
+// 敌人「定义」结构与卡牌一致（stats / actives / passives），战斗引擎统一封装为
+// combatant。makeEnemy / makeBoss 按「推荐战力」缩放属性，保证难度曲线平滑。
+// ============================================================================
+import { cardPower } from '../config.js';
+
+// 按五行划分的小怪模板池（名字 + 属性分布 + 一个主动技）。
+// power 为 0：实际数值由 makeEnemy 按目标战力缩放后填入。
+const MINION_POOL = {
+  earth: [
+    { name: '岩甲傀', role: 'tank', dist: { atk: 0.10, def: 0.45, hp: 0.40, spd: 0.05 },
+      active: { id: 'e1', name: '坚岩冲撞', type: 'dmg', target: 'enemy_one', mult: 1.0 } },
+    { name: '砾石魔', role: 'dps', dist: { atk: 0.35, def: 0.20, hp: 0.30, spd: 0.15 },
+      active: { id: 'e1', name: '飞砾', type: 'dmg', target: 'enemy_one', mult: 1.1,
+        effect: { kind: 'slow', amount: 0.15, dur: 2 } } },
+  ],
+  wood: [
+    { name: '古藤精', role: 'ctrl', dist: { atk: 0.25, def: 0.25, hp: 0.35, spd: 0.15 },
+      active: { id: 'e1', name: '缠绕藤', type: 'dmg', target: 'enemy_one', mult: 0.9,
+        effect: { kind: 'slow', amount: 0.20, dur: 2 } } },
+    { name: '妖树苗', role: 'healer', dist: { atk: 0.15, def: 0.25, hp: 0.40, spd: 0.20 },
+      active: { id: 'e1', name: '汲木', type: 'heal', target: 'ally_lowest', mult: 1.0 } },
+  ],
+  fire: [
+    { name: '焰魔', role: 'dps', dist: { atk: 0.45, def: 0.15, hp: 0.25, spd: 0.15 },
+      active: { id: 'e1', name: '烈焰吐息', type: 'dmg', target: 'enemy_one', mult: 1.0,
+        effect: { kind: 'burn', dps: 0.25, dur: 2 } } },
+    { name: '赤翼鸟', role: 'dps', dist: { atk: 0.40, def: 0.10, hp: 0.20, spd: 0.30 },
+      active: { id: 'e1', name: '灼羽击', type: 'dmg', target: 'enemy_one', mult: 1.2 } },
+  ],
+  water: [
+    { name: '寒霜灵', role: 'ctrl', dist: { atk: 0.30, def: 0.20, hp: 0.30, spd: 0.20 },
+      active: { id: 'e1', name: '霜寒', type: 'dmg', target: 'enemy_one', mult: 0.9,
+        effect: { kind: 'freeze', dur: 1 } } },
+    { name: '玄水魅', role: 'healer', dist: { atk: 0.20, def: 0.25, hp: 0.40, spd: 0.15 },
+      active: { id: 'e1', name: '潮汐愈', type: 'heal', target: 'ally_all', mult: 0.6 } },
+  ],
+  metal: [
+    { name: '锋刃傀', role: 'dps', dist: { atk: 0.50, def: 0.15, hp: 0.20, spd: 0.15 },
+      active: { id: 'e1', name: '利刃斩', type: 'dmg', target: 'enemy_one', mult: 1.3 } },
+    { name: '铁甲卫', role: 'tank', dist: { atk: 0.15, def: 0.40, hp: 0.40, spd: 0.05 },
+      active: { id: 'e1', name: '铁壁', type: 'shield', target: 'self', mult: 0,
+        effect: { shieldPct: 0.25, dur: 2 } } },
+  ],
+  none: [
+    { name: '虚空游魂', role: 'dps', dist: { atk: 0.40, def: 0.20, hp: 0.25, spd: 0.15 },
+      active: { id: 'e1', name: '虚空裂', type: 'dmg', target: 'enemy_all', mult: 0.8 } },
+  ],
+};
+
+// 由分布 + 总战力推导一组基础属性（power 预算按权重分配到四维）。
+function distToStats(dist, power) {
+  // 把 power 换算到与卡牌同量级的四维：攻击 1.0 / 防御 0.8 / 气血 0.12 / 速度 0.6
+  // 反解：给定 power 预算与分布，求各项数值。
+  const atkW = 1.0, defW = 0.8, hpW = 0.12, spdW = 0.6;
+  const wsum = dist.atk * atkW + dist.def * defW + dist.hp * hpW + dist.spd * spdW;
+  const unit = power / wsum;
+  return {
+    atk: Math.max(8, Math.round(dist.atk * unit * atkW / 1.0)),
+    def: Math.max(5, Math.round(dist.def * unit * defW / 0.8)),
+    hp: Math.max(80, Math.round(dist.hp * unit * hpW / 0.12)),
+    spd: Math.max(20, Math.round(dist.spd * unit * spdW / 0.6)),
+  };
+}
+
+// 生成一个小怪定义（按目标战力缩放）。
+export function makeEnemy(power, element, rng, nameOverride) {
+  const pool = MINION_POOL[element] || MINION_POOL.none;
+  const tmpl = pool[Math.floor((rng || Math.random)() * pool.length)];
+  const stats = distToStats(tmpl.dist, Math.max(120, power));
+  return {
+    id: `enemy_${tmpl.name}_${Math.floor((rng || Math.random)() * 100000)}`,
+    name: nameOverride || tmpl.name,
+    element,
+    role: tmpl.role,
+    stats,
+    actives: [tmpl.active],
+    passives: [],
+  };
+}
+
+// ── 12 章 Boss（设计稿 3.1）────────────────────────────────────────────────────
+// 每章一个 Boss，带双主动 + 低血狂暴被动，战力为章节推荐战力的 1.5 倍。
+export const BOSSES = [
+  { chapter: 1,  name: '守阵石灵',       element: 'earth', power: 500 },
+  { chapter: 2,  name: '风吼兽',         element: 'wood',  power: 800 },
+  { chapter: 3,  name: '熔岩巨蜥',       element: 'fire',  power: 1200 },
+  { chapter: 4,  name: '冰魄蛟龙',       element: 'water', power: 1700 },
+  { chapter: 5,  name: '机关战傀',       element: 'metal', power: 2300 },
+  { chapter: 6,  name: '古树妖皇',       element: 'wood',  power: 3000 },
+  { chapter: 7,  name: '地煞魔猿',       element: 'earth', power: 3800 },
+  { chapter: 8,  name: '朱雀残羽',       element: 'fire',  power: 4700 },
+  { chapter: 9,  name: '玄武虚影',       element: 'water', power: 5700 },
+  { chapter: 10, name: '万剑之灵',       element: 'metal', power: 6800 },
+  { chapter: 11, name: '虚空吞噬者',     element: 'none',  power: 8000 },
+  { chapter: 12, name: '蚩尤残魂·完全体', element: 'fire',  power: 9500 },
+];
+
+// Boss 主动技按五行选取，保证有特色。
+function bossActives(element) {
+  switch (element) {
+    case 'fire': return [
+      { id: 'b1', name: '焚天烈焰', type: 'dmg', target: 'enemy_all', mult: 1.0,
+        effect: { kind: 'burn', dps: 0.30, dur: 2 } },
+      { id: 'b2', name: '狱火重击', type: 'dmg', target: 'enemy_one', mult: 1.6 },
+    ];
+    case 'water': return [
+      { id: 'b1', name: '冰封千里', type: 'dmg', target: 'enemy_all', mult: 0.9,
+        effect: { kind: 'freeze', dur: 1 } },
+      { id: 'b2', name: '寒蛟噬', type: 'dmg', target: 'enemy_one', mult: 1.5 },
+    ];
+    case 'wood': return [
+      { id: 'b1', name: '万木绞杀', type: 'dmg', target: 'enemy_all', mult: 0.9 },
+      { id: 'b2', name: '汲生藤', type: 'heal', target: 'self', mult: 0.25 },
+    ];
+    case 'metal': return [
+      { id: 'b1', name: '万剑归宗', type: 'dmg', target: 'enemy_all', mult: 1.0 },
+      { id: 'b2', name: '破甲一击', type: 'dmg', target: 'enemy_one', mult: 1.7 },
+    ];
+    case 'earth': return [
+      { id: 'b1', name: '山崩地裂', type: 'dmg', target: 'enemy_all', mult: 0.95,
+        effect: { kind: 'slow', amount: 0.20, dur: 2 } },
+      { id: 'b2', name: '巨岩碎', type: 'dmg', target: 'enemy_one', mult: 1.5 },
+    ];
+    default: return [
+      { id: 'b1', name: '虚空吞噬', type: 'dmg', target: 'enemy_all', mult: 1.1 },
+      { id: 'b2', name: '湮灭一击', type: 'dmg', target: 'enemy_one', mult: 1.6 },
+    ];
+  }
+}
+
+// 生成一个 Boss 定义（战力 = 章节推荐战力 × 1.5）。
+export function makeBoss(chapterIdx, rng) {
+  const b = BOSSES[Math.max(0, Math.min(BOSSES.length - 1, chapterIdx))];
+  const target = b.power * 1.5;
+  const stats = distToStats({ atk: 0.30, def: 0.25, hp: 0.35, spd: 0.10 }, target);
+  // Boss 体积大、攻防均衡：再补一点气血让它扛得住
+  stats.hp = Math.round(stats.hp * 1.4);
+  return {
+    id: `boss_${b.chapter}_${b.name}`,
+    name: b.name,
+    element: b.element,
+    role: 'boss',
+    stats,
+    actives: bossActives(b.element),
+    passives: [{ kind: 'enrage', amount: 0.6, dur: 99, threshold: 0.40 }],
+    isBoss: true,
+  };
+}
+
+// 为一个推荐战力生成一整支敌方阵容（小怪 / 精英 / Boss）。
+// type: 'normal' | 'elite' | 'boss'；count 决定小怪数量（1~5）。
+export function makeEnemyFormation(power, element, type, rng) {
+  const r = rng || Math.random;
+  if (type === 'boss') {
+    // Boss + 2 只小怪护航
+    const boss = makeBossPower(power, element, r);
+    const minions = [
+      makeEnemy(power * 0.5, element, r),
+      makeEnemy(power * 0.5, element, r),
+    ];
+    return [boss, ...minions];
+  }
+  const count = type === 'elite' ? 3 : Math.max(1, Math.min(5, 2 + Math.floor(r() * 3)));
+  const factor = type === 'elite' ? 0.7 : 0.5;
+  const out = [];
+  for (let i = 0; i < count; i++) out.push(makeEnemy(power * factor, element, r));
+  return out;
+}
+
+// 按「章节推荐战力」生成对应 Boss（chapterIdx → BOSSES 表）。
+export function makeBossPower(power, element, rng) {
+  // 找到战力最接近的 Boss 模板，但沿用其五行（boss 自身五行优先）
+  let tmpl = BOSSES.find((b) => Math.abs(b.power - power) <= power * 0.35);
+  if (!tmpl) tmpl = BOSSES[0];
+  const target = power * 1.5;
+  const stats = distToStats({ atk: 0.30, def: 0.25, hp: 0.35, spd: 0.10 }, target);
+  stats.hp = Math.round(stats.hp * 1.4);
+  return {
+    id: `boss_${tmpl.chapter}_${tmpl.name}`,
+    name: tmpl.name,
+    element: tmpl.element,
+    role: 'boss',
+    stats,
+    actives: bossActives(tmpl.element),
+    passives: [{ kind: 'enrage', amount: 0.6, dur: 99, threshold: 0.40 }],
+    isBoss: true,
+  };
+}
+
+export { distToStats };
diff --git a/apps/ling-xu-wen-jian-lu/src/main.js b/apps/ling-xu-wen-jian-lu/src/main.js
new file mode 100644
index 0000000..e2da470
--- /dev/null
+++ b/apps/ling-xu-wen-jian-lu/src/main.js
@@ -0,0 +1,19 @@
+// ============================================================================
+// 灵墟·问剑录 · 入口
+// 导出 createGame(parent) 工厂，供主框架（落地页）按需挂载到任意容器；
+// 同时保留独立运行（apps/ling-xu-wen-jian-lu/index.html）时的自动挂载行为。
+// ============================================================================
+import { GameUI } from './ui/app.js';
+
+export function createGame(parent) {
+  const ui = new GameUI(parent);
+  ui.mount();
+  return ui;
+}
+
+// 独立运行时自动挂载到 #game-container（仅在元素存在时触发，
+// 避免被主框架动态 import 时误启动游戏）。
+if (typeof document !== 'undefined' && document.getElementById('game-container')) {
+  const ui = createGame(document.getElementById('game-container'));
+  if (typeof window !== 'undefined') window.__LXX = ui; // 暴露实例便于调试 / 冒烟测试
+}
diff --git a/apps/ling-xu-wen-jian-lu/src/ui/app.js b/apps/ling-xu-wen-jian-lu/src/ui/app.js
new file mode 100644
index 0000000..8994c87
--- /dev/null
+++ b/apps/ling-xu-wen-jian-lu/src/ui/app.js
@@ -0,0 +1,759 @@
+// ============================================================================
+// 灵墟·问剑录 · UI 控制器（纯原生 DOM）
+// 国风 2.5D 卡牌修仙：阵容 / 问道 / 修炼 / 主线 / 秘境 / 洞府 / 图鉴 / 设置。
+// 驱动自动存档与离线洞府结算。
+// ============================================================================
+import '../ui/style.css';
+import { attachKeyboardShell } from '../../../_lib/keyboard-shell.js';
+import { h, clear, bar } from './dom.js';
+
+import {
+  RARITIES, rarityDef, ELEMENTS, elDef, elName, elEmoji,
+  RESOURCES, resName, resEmoji, PILL_EXP, BREAK_STONE, THEME,
+  dayKey, cardCap,
+} from '../config.js';
+import { CARDS, cardDef } from '../data/cards.js';
+import { BOSSES } from '../data/enemies.js';
+import {
+  newPlayer, recompute, addRes, countRes, canAfford, spendRes,
+  ownCard, addFrag, countFrag, hasCard, setFormation, activeFormation, formationPower,
+  collectionCount, collectionTotal, collectionProgress, totalStars, CODEX_TIERS,
+} from '../core/player.js';
+import { instanceStats, instancePower, skillMult, isMaxLevel, expToNext } from '../core/card.js';
+import {
+  canLevelUp, levelCeiling, feedPill, breakCost, canBreakThrough, doBreakThrough,
+  starUpCost, canStarUp, doStarUp, canSkillUp, doSkillUp, skillUpCost, MAX_SKILL_LEVEL,
+} from '../core/cultivate.js';
+import { drawOne, drawTen, dailyFreeAvailable, pitySSRRemaining, pitySRRemaining } from '../core/gacha.js';
+import { playerSpecsFrom } from '../core/battle.js';
+import {
+  CHAPTERS, stagesForChapter, stageDef, canEnterStage, isStageCleared, enterStage,
+} from '../core/stage.js';
+import { enterFloor, tianOf, floorPower, TOTAL_FLOORS, resetSecret } from '../core/secret.js';
+import { collectCave, previewCave, caveTotalLevel, caveSSRCount } from '../core/cave.js';
+import { ACHIEVEMENTS, ACH_CATS, checkAchievements, achProgress, rewardDesc } from '../core/achievements.js';
+import {
+  saveGame, loadGame, clearSave, exportSave, importSave,
+  listSlots, loadSlot, saveSlot, deleteSlot, getActiveSlot, setActiveSlot,
+} from '../core/save.js';
+import { makeRng } from '../core/rng.js';
+
+const TABS = [
+  { key: 'lineup', icon: '⚔️', label: '阵容' },
+  { key: 'ask', icon: '🎏', label: '问道' },
+  { key: 'cultivate', icon: '🧘', label: '修炼' },
+  { key: 'stage', icon: '🗺️', label: '主线' },
+  { key: 'secret', icon: '🌀', label: '秘境' },
+  { key: 'cave', icon: '🏘️', label: '洞府' },
+  { key: 'codex', icon: '📖', label: '图鉴' },
+  { key: 'setting', icon: '⚙️', label: '设置' },
+];
+
+export class GameUI {
+  constructor(parent) {
+    this.parent = parent;
+    this.player = null;
+    this.tab = 'lineup';
+    this.screen = 'slots';
+    this.activeSlot = 1;
+    this.cultivateId = null;
+    this.viewChapter = 1;
+    this.lastBattle = null;
+    this._timers = [];
+    this._rngSeed = 0;
+    this._onVis = this._onVis.bind(this);
+  }
+
+  mount() {
+    this.root = h('div', { class: 'lxx' });
+    clear(this.parent);
+    this.parent.appendChild(this.root);
+    this.toastWrap = h('div', { class: 'toast-wrap' });
+    this.stage = h('div', { class: 'lxx-stage' });
+    this.modalRoot = h('div', { class: 'lxx-modals' });
+    this.root.append(this.toastWrap, this.stage, this.modalRoot);
+    this._detachKeyboard = attachKeyboardShell(this.root);
+    this.showSlots();
+    return this;
+  }
+
+  destroy() {
+    this.stopLoop();
+    if (this._detachKeyboard) this._detachKeyboard();
+    try { document.removeEventListener('visibilitychange', this._onVis); } catch (_) {}
+    if (this.root && this.root.parentNode) this.root.parentNode.removeChild(this.root);
+  }
+
+  // ============ 通用 ============
+  rng() { return makeRng(++this._rngSeed); }
+
+  toast(text) {
+    const t = h('div', { class: 'toast' }, text);
+    this.toastWrap.appendChild(t);
+    setTimeout(() => { t.classList.add('fade'); setTimeout(() => t.remove(), 300); }, 2200);
+  }
+
+  openModal(title, body, opts = {}) {
+    clear(this.modalRoot);
+    const foot = h('div', { class: 'sheet__foot' });
+    if (opts.foot) foot.append(...(Array.isArray(opts.foot) ? opts.foot : [opts.foot]));
+    else foot.append(h('button', { class: 'btn btn-ghost', onClick: () => this.closeModal() }, '关闭'));
+    const sheet = h('div', { class: 'sheet' },
+      h('div', { class: 'sheet__head' }, h('span', { class: 't' }, title), h('button', { class: 'sheet__x', onClick: () => this.closeModal() }, '✕')),
+      h('div', { class: 'sheet__body' }, body),
+      foot,
+    );
+    const mask = h('div', { class: 'modal-mask', onClick: () => { if (opts.dismissable !== false) this.closeModal(); } }, sheet);
+    mask.addEventListener('click', (e) => { if (e.target === mask && opts.dismissable !== false) this.closeModal(); });
+    this.modalRoot.appendChild(mask);
+  }
+  closeModal() { clear(this.modalRoot); }
+
+  afterAction() {
+    // 成就检查 + 落盘 + 刷新
+    const granted = checkAchievements(this.player);
+    for (const a of granted) this.toast(`成就达成：${a.name}`);
+    try { saveGame(this.player); } catch (_) {}
+    this.refresh();
+  }
+
+  refresh() {
+    if (this.screen !== 'game') return;
+    this.renderTopbar();
+    this.renderTab();
+  }
+
+  // ============ 存档选择 ============
+  showSlots() {
+    try { if (this.player) saveGame(this.player); } catch (_) {}
+    this.stopLoop();
+    this.player = null;
+    this.screen = 'slots';
+    clear(this.modalRoot);
+    clear(this.stage);
+    const wrap = h('div', { class: 'launcher' },
+      h('div', { class: 'launcher__brand' },
+        h('div', { class: 'emblem' }, '剑'),
+        h('h1', null, '灵墟·问剑录'),
+        h('p', { class: 'sub' }, '问道抽卡 · 五行布阵 · 回合制国风卡牌修仙'),
+      ),
+      h('div', { class: 'slot-list' }),
+      h('p', { class: 'launcher__tip' }, '点击空槽「开辟仙府」开始；新档赠送 4 张 R 卡与 10 枚问道令。'),
+    );
+    const list = wrap.querySelector('.slot-list');
+    for (const s of listSlots()) list.append(this.slotCard(s));
+    this.stage.appendChild(wrap);
+  }
+
+  slotCard(s) {
+    if (s.empty) {
+      return h('div', { class: 'slot-card empty' },
+        h('div', { class: 'slot-head' }, h('span', { class: 'slot-no' }, `第 ${s.slot} 槽`), h('span', { class: 'slot-tag' }, '空')),
+        h('p', { class: 'slot-name' }, '未开辟'),
+        h('button', { class: 'btn btn-primary', onClick: () => this.startNew(s.slot) }, '开辟仙府'),
+      );
+    }
+    if (s.corrupt) {
+      return h('div', { class: 'slot-card corrupt' },
+        h('div', { class: 'slot-head' }, h('span', { class: 'slot-no' }, `第 ${s.slot} 槽`), h('span', { class: 'slot-tag warn' }, '损坏')),
+        h('p', { class: 'slot-name' }, '存档已损坏'),
+        h('button', { class: 'btn btn-danger', onClick: () => { deleteSlot(s.slot); this.showSlots(); } }, '删除'),
+      );
+    }
+    return h('div', { class: 'slot-card' },
+      h('div', { class: 'slot-head' },
+        h('span', { class: 'slot-no' }, `第 ${s.slot} 槽`),
+        h('span', { class: 'slot-tag' }, `${s.highestChapter}/12 章 · 秘境${s.secretFloor}层`),
+      ),
+      h('p', { class: 'slot-name' }, `灵石 ${s.lingshi} · 问道令 ${s.wendao}`),
+      h('p', { class: 'slot-sub' }, `已拥 ${s.cards} 张 · 图鉴 ${s.codex}/15`),
+      h('div', { class: 'slot-btns' },
+        h('button', { class: 'btn btn-primary', onClick: () => this.continueSlot(s.slot) }, '进入'),
+        h('button', { class: 'icon-btn', title: '删除', onClick: () => this.confirmDelete(s.slot) }, '🗑️'),
+      ),
+    );
+  }
+
+  confirmDelete(slot) {
+    this.openModal('删除存档', h('div', { class: 'pad' }, h('p', null, `确定删除第 ${slot} 槽存档？此操作不可撤销。`)), {
+      foot: [
+        h('button', { class: 'btn btn-ghost', onClick: () => this.closeModal() }, '取消'),
+        h('button', { class: 'btn btn-danger', onClick: () => { deleteSlot(slot); this.closeModal(); this.showSlots(); } }, '确认删除'),
+      ],
+    });
+  }
+
+  startNew(slot) {
+    const p = newPlayer();
+    p.slot = slot;
+    p.createdAt = Math.floor(Date.now() / 1000);
+    setActiveSlot(slot);
+    saveSlot(slot, p);
+    this.enterGame(p, true);
+  }
+  continueSlot(slot) {
+    const p = loadSlot(slot);
+    if (!p) { this.toast('读取失败'); this.showSlots(); return; }
+    this.enterGame(p, false);
+  }
+
+  // ============ 进入游戏 ============
+  enterGame(player, isNew) {
+    this.player = player;
+    this.screen = 'game';
+    this.tab = 'lineup';
+    this.viewChapter = player.story.highestChapter || 1;
+    this.cultivateId = Object.keys(player.cards)[0] || null;
+    recompute(this.player);
+    // 离线洞府结算（非新档）
+    if (!isNew) {
+      const off = collectCave(this.player);
+      if (off.seconds >= 60) {
+        const mins = Math.round(off.seconds / 60);
+        setTimeout(() => this.toast(`洞府挂机 ${mins} 分钟：灵石 +${off.lingshi}${off.exp_s ? `，修为丹·小 +${off.exp_s}` : ''}${off.capped ? '（已达 12 小时上限）' : ''}`), 400);
+      }
+    } else {
+      this.player.cave.lastSeen = Math.floor(Date.now() / 1000);
+    }
+    checkAchievements(this.player);
+    try { saveGame(this.player); } catch (_) {}
+    this.renderShell();
+    this.startLoop();
+  }
+
+  renderShell() {
+    clear(this.stage);
+    this.topbarEl = h('div', { class: 'topbar' });
+    this.contentEl = h('div', { class: 'content' });
+    const nav = h('nav', { class: 'tabnav' }, ...TABS.map((t) => h('button', {
+      class: `tabnav__btn ${this.tab === t.key ? 'active' : ''}`,
+      dataset: { tab: t.key },
+      onClick: () => { this.tab = t.key; this.refresh(); },
+    }, h('span', { class: 'tabnav__icon' }, t.icon), h('span', { class: 'tabnav__label' }, t.label))));
+    this.stage.append(this.topbarEl, this.contentEl, nav);
+    this.refresh();
+  }
+
+  renderTopbar() {
+    const p = this.player;
+    clear(this.topbarEl);
+    this.topbarEl.append(
+      h('div', { class: 'topbar__brand' }, h('span', { class: 'seal' }, '剑'), '灵墟'),
+      h('div', { class: 'topbar__res' },
+        resChip('🪙', countRes(p, 'lingshi'), '灵石'),
+        resChip('🎏', countRes(p, 'wendao'), '问道令'),
+        resChip('⚔️', formationPower(p), '战力'),
+        resChip('📖', `${collectionCount(p)}/${collectionTotal()}`, '图鉴'),
+      ),
+      h('button', { class: 'icon-btn topbar__home', title: '返回存档', onClick: () => this.showSlots() }, '⌂'),
+    );
+  }
+
+  renderTab() {
+    clear(this.contentEl);
+    switch (this.tab) {
+      case 'lineup': return this.renderLineup();
+      case 'ask': return this.renderAsk();
+      case 'cultivate': return this.renderCultivate();
+      case 'stage': return this.renderStage();
+      case 'secret': return this.renderSecret();
+      case 'cave': return this.renderCave();
+      case 'codex': return this.renderCodex();
+      case 'setting': return this.renderSetting();
+      default: return this.renderLineup();
+    }
+  }
+
+  // ============ 阵容 ============
+  renderLineup() {
+    const p = this.player;
+    const form = activeFormation(p);
+    const slots = [];
+    for (let i = 0; i < 5; i++) {
+      const id = p.formation[i];
+      const occ = id && p.cards[id] ? { id, instance: p.cards[id] } : null;
+      slots.push(h('div', {
+        class: `slot slot--pos${i + 1} ${occ ? '' : 'empty'}`,
+        onClick: () => { if (occ) { this.removeFromFormation(i); } },
+      },
+        h('span', { class: 'slot__pos' }, `${i + 1}号位`),
+        occ ? this.miniCard(occ.id, occ.instance) : h('span', { class: 'slot__hint' }, '空位'),
+      ));
+    }
+    const owned = Object.keys(p.cards).sort(byRarityThenPower(p));
+    const grid = owned.map((id) => this.miniCard(id, p.cards[id], {
+      onClick: () => this.addToFormation(id),
+    }));
+    this.contentEl.append(
+      h('h3', { class: 'sec-title' }, '布阵 · 站位影响受击（1号位主坦 +30%、2号位 +10%）'),
+      h('div', { class: 'formation' }, slots),
+      h('div', { class: 'row' },
+        h('button', { class: 'btn btn-ghost', onClick: () => this.autoFormation() }, '一键最强阵容'),
+        h('span', { class: 'muted' }, '点卡牌上阵 · 点位移下'),
+      ),
+      h('h3', { class: 'sec-title' }, `我的卡牌（${owned.length}）`),
+      h('div', { class: 'card-grid' }, ...grid),
+    );
+  }
+  addToFormation(id) {
+    const p = this.player;
+    // 已在阵 → 取消
+    const idx = p.formation.indexOf(id);
+    if (idx >= 0) { p.formation[idx] = null; this.afterAction(); return; }
+    const empty = p.formation.indexOf(null);
+    if (empty < 0) { this.toast('阵容已满，先移下一位'); return; }
+    p.formation[empty] = id;
+    this.afterAction();
+  }
+  removeFromFormation(i) { this.player.formation[i] = null; this.afterAction(); }
+  autoFormation() {
+    const p = this.player;
+    const owned = Object.keys(p.cards).sort(byRarityThenPower(p));
+    const next = [null, null, null, null, null];
+    let i = 0;
+    for (const id of owned) { if (i >= 5) break; next[i++] = id; }
+    setFormation(p, next);
+    this.afterAction();
+  }
+
+  // ============ 问道 ============
+  renderAsk() {
+    const p = this.player;
+    const free = dailyFreeAvailable(p);
+    this.contentEl.append(
+      h('div', { class: 'ask-banner' },
+        h('h3', { class: 'sec-title' }, '问道 · 召唤灵契'),
+        h('p', { class: 'muted' }, 'R 70% / SR 25% / SSR 5% · 累计 90 抽必出 SSR · 每 30 抽必出 SR · 十连保底 SR'),
+        h('div', { class: 'ask-pity' },
+          pityChip('距 SSR 保底', `${pitySSRRemaining(p)}/${90}`),
+          pityChip('距 SR 保底', `${pitySRRemaining(p)}/${30}`),
+          pityChip('已抽', p.pity.total || 0),
+        ),
+      ),
+      h('div', { class: 'ask-actions' },
+        h('button', {
+          class: 'btn btn-primary', disabled: !free,
+          onClick: () => this.doDraw(false, true),
+        }, free ? '每日免费单抽' : '今日免费已用'),
+        h('button', {
+          class: 'btn', disabled: countRes(p, 'wendao') < 1,
+          onClick: () => this.doDraw(false, false),
+        }, '单抽（问道令×1）'),
+        h('button', {
+          class: 'btn btn-gold', disabled: countRes(p, 'wendao') < 10,
+          onClick: () => this.doDraw(true, false),
+        }, '十连问道（×10）'),
+      ),
+      h('p', { class: 'muted center' }, `当前问道令：${countRes(p, 'wendao')}`),
+    );
+  }
+  doDraw(ten, free) {
+    const rng = this.rng();
+    const res = ten ? drawTen(this.player, rng) : drawOne(this.player, rng, { free });
+    if (res.error) { this.toast(res.error); return; }
+    this.afterAction();
+    this.showGachaResult(res.results);
+  }
+  showGachaResult(results) {
+    const body = h('div', { class: 'gacha-result' }, ...results.map((r) => {
+      const def = cardDef(r.cardId);
+      const c = rarityDef(r.rarity).color;
+      return h('div', { class: `gacha-card rarity-${r.rarity}`, style: { borderColor: c } },
+        h('div', { class: 'gacha-card__name', style: { color: c } }, def ? def.name : r.cardId),
+        h('div', { class: 'gacha-card__sub' }, `${r.rarity} · ${def ? elName(def.element) : ''}${def ? def.cls : ''}`),
+        r.isNew ? h('span', { class: 'tag tag-new' }, 'NEW') : (r.frag ? h('span', { class: 'tag tag-dup' }, `+${r.frag}碎片`) : null),
+      );
+    }));
+    const ssr = results.filter((r) => r.rarity === 'SSR').length;
+    const sr = results.filter((r) => r.rarity === 'SR').length;
+    const head = results.length > 1 ? `问道 · 十连（SSR×${ssr} SR×${sr}）` : '问道 · 单抽';
+    this.openModal(head, body);
+  }
+
+  // ============ 修炼 ============
+  renderCultivate() {
+    const p = this.player;
+    const owned = Object.keys(p.cards).sort(byRarityThenPower(p));
+    if (!this.cultivateId || !p.cards[this.cultivateId]) this.cultivateId = owned[0] || null;
+    const id = this.cultivateId;
+    const def = cardDef(id);
+    const picker = h('div', { class: 'card-picker' }, ...owned.map((cid) => {
+      const d = cardDef(cid);
+      return h('button', {
+        class: `picker-chip rarity-${d.rarity} ${cid === id ? 'active' : ''}`,
+        style: { borderColor: rarityDef(d.rarity).color },
+        onClick: () => { this.cultivateId = cid; this.refresh(); },
+      }, `${d.name} ${elEmoji(d.element)}`);
+    }));
+    if (!def) { this.contentEl.append(picker, h('p', { class: 'muted' }, '暂无卡牌')); return; }
+    const inst = p.cards[id];
+    const r = rarityDef(def.rarity);
+    const st = instanceStats(inst);
+    this.contentEl.append(
+      picker,
+      h('div', { class: 'cult-card' },
+        h('div', { class: 'cult-card__head' },
+          h('div', { class: `rarity-badge rarity-${def.rarity}`, style: { background: r.color } }, `${def.rarity} ${'★'.repeat(inst.star)}`),
+          h('div', null,
+            h('div', { class: 'cult-card__name' }, `${def.name} ${elEmoji(def.element)}`),
+            h('div', { class: 'muted' }, `${elName(def.element)}系 · ${def.cls} · ${def.role}`),
+          ),
+        ),
+        h('div', { class: 'cult-stats' },
+          statLine('攻击', st.atk), statLine('防御', st.def),
+          statLine('气血', st.hp), statLine('速度', st.spd),
+          statLine('等级', `${inst.level}/${cardCap(r, inst.star)}`, '灵'),
+          statLine('突破', `第${inst.br}重`, '灵'),
+          statLine('技能', `Lv.${inst.skillLv}（×${skillMult(inst).toFixed(2)}）`, '灵'),
+        ),
+        h('div', { class: 'cult-exp' },
+          h('span', { class: 'muted' }, '修为'),
+          bar(inst.exp, expToNext(inst), { label: `${Math.floor(inst.exp)}/${expToNext(inst)}` }),
+        ),
+        h('p', { class: 'quote' }, `「${def.quote}」`),
+        h('p', { class: 'story' }, def.story),
+      ),
+      // 升级
+      h('div', { class: 'panel' },
+        h('div', { class: 'panel__head' }, '修炼升级（喂修为丹）'),
+        h('div', { class: 'panel__body row' },
+          pillBtn(p, this, inst, 'exp_s', '小丹(+50)'),
+          pillBtn(p, this, inst, 'exp_m', '中丹(+200)'),
+          pillBtn(p, this, inst, 'exp_l', '大丹(+1000)'),
+          h('span', { class: 'muted' }, isMaxLevel(inst) ? '已达等级上限（升星可提升）' : (canLevelUp(inst) ? `瓶颈 ${levelCeiling(inst)} 级` : '需突破'),
+          ),
+        ),
+      ),
+      // 突破
+      h('div', { class: 'panel' },
+        h('div', { class: 'panel__head' }, '突破（每 10 级一次，+8% 全属性）'),
+        h('div', { class: 'panel__body row' },
+          (() => {
+            const c = breakCost(inst);
+            const ok2 = canBreakThrough(p, inst);
+            const stoneId = Object.keys(c).find((k) => k.startsWith('break_'));
+            const txt = `突破第 ${inst.br + 1} 重（${resName(stoneId)}×${c[stoneId]} · 灵石×${c.lingshi}）`;
+            return h('button', { class: 'btn', disabled: !ok2, onClick: () => this.doBreak(inst) }, txt);
+          })(),
+        ),
+      ),
+      // 升星
+      h('div', { class: 'panel' },
+        h('div', { class: 'panel__head' }, `升星（${inst.star}/${r.maxStar}★，+12% 全属性 / 星）`),
+        h('div', { class: 'panel__body row' },
+          (() => {
+            if (inst.star >= r.maxStar) return h('span', { class: 'muted' }, '已达星级上限');
+            const c = starUpCost(inst);
+            const tf = c.tiandao_f ? ` · 天道碎片×${c.tiandao_f}` : '';
+            const ok2 = canStarUp(p, inst);
+            return h('button', { class: 'btn btn-gold', disabled: !ok2, onClick: () => this.doStar(inst) },
+              `升至 ${inst.star + 1}★（灵契碎片×${c.frag}${tf} · 已有${countFrag(p, id)}）`);
+          })(),
+        ),
+      ),
+      // 技能
+      h('div', { class: 'panel' },
+        h('div', { class: 'panel__head' }, `技能升级（${inst.skillLv}/${MAX_SKILL_LEVEL}，+5% 倍率/级）`),
+        h('div', { class: 'panel__body row' },
+          (() => {
+            if (inst.skillLv >= MAX_SKILL_LEVEL) return h('span', { class: 'muted' }, '技能已满级');
+            const c = skillUpCost(inst);
+            const ok2 = canSkillUp(p, inst);
+            return h('button', { class: 'btn', disabled: !ok2, onClick: () => this.doSkill(inst) },
+              `升级技能（功法残页×${c.gongfa} · 已有${countRes(p, 'gongfa')}）`);
+          })(),
+        ),
+      ),
+    );
+  }
+  doFeedPill(inst, pillId) {
+    const r = feedPill(this.player, inst, pillId, 1);
+    if (!r.ok) { this.toast(r.reason); return; }
+    for (const l of (r.logs || [])) if (l.kind === 'level') this.toast(l.text);
+    this.afterAction();
+  }
+  doBreak(inst) { const r = doBreakThrough(this.player, inst); if (!r.ok) this.toast(r.reason); else this.toast(r.text); this.afterAction(); }
+  doStar(inst) { const r = doStarUp(this.player, inst); if (!r.ok) this.toast(r.reason); else this.toast(r.text); this.afterAction(); }
+  doSkill(inst) { const r = doSkillUp(this.player, inst); if (!r.ok) this.toast(r.reason); else this.toast(r.text); this.afterAction(); }
+
+  // ============ 主线 ============
+  renderStage() {
+    const p = this.player;
+    const ch = CHAPTERS[Math.max(0, Math.min(CHAPTERS.length - 1, this.viewChapter - 1))];
+    const unlocked = p.story.highestChapter >= ch.chapter;
+    const stages = stagesForChapter(ch.chapter - 1);
+    this.contentEl.append(
+      h('div', { class: 'chapter-bar' },
+        h('button', { class: 'icon-btn', disabled: this.viewChapter <= 1, onClick: () => { this.viewChapter--; this.refresh(); } }, '‹'),
+        h('div', { class: 'chapter-bar__info' },
+          h('div', { class: 'chapter-bar__name' }, `卷${cn(ch.chapter)} ${ch.name}`),
+          h('div', { class: 'muted' }, `推荐战力 ${ch.power} · 五行倾向 ${elName(ch.element)}${elEmoji(ch.element)}`),
+        ),
+        h('button', { class: 'icon-btn', disabled: this.viewChapter >= CHAPTERS.length, onClick: () => { this.viewChapter++; this.refresh(); } }, '›'),
+      ),
+      unlocked ? null : h('p', { class: 'muted center' }, '本章尚未解锁，通关上一章首领即可开启。'),
+      h('div', { class: 'stage-list' }, ...stages.map((st) => {
+        const can = unlocked && canEnterStage(p, st.id);
+        const cleared = isStageCleared(p, st.id);
+        const typeTag = st.type === 'boss' ? '首领' : st.type === 'elite' ? '精英' : '普通';
+        return h('button', {
+          class: `stage-row stage-${st.type} ${can ? '' : 'locked'} ${cleared ? 'cleared' : ''}`,
+          disabled: !can,
+          onClick: () => this.doStage(st.id),
+        },
+          h('div', { class: 'stage-row__main' },
+            h('span', { class: 'stage-row__id' }, st.id),
+            h('span', { class: 'stage-row__name' }, st.name),
+          ),
+          h('div', { class: 'stage-row__meta' },
+            h('span', { class: `tag tag-${st.type}` }, typeTag),
+            cleared ? h('span', { class: 'tag tag-done' }, '已通关') : h('span', { class: 'muted' }, `战力≈${Math.round(st.power * (st.type === 'boss' ? 1.5 : 1))}`),
+          ),
+        );
+      })),
+    );
+  }
+  doStage(stageId) {
+    const res = enterStage(this.player, stageId, this.rng());
+    if (!res.ok) { this.toast(res.reason); return; }
+    this.showBattle(res, () => { this.afterAction(); });
+  }
+
+  // ============ 秘境 ============
+  renderSecret() {
+    const p = this.player;
+    const pv = previewCave(p);
+    const floor = p.secret.floor;
+    this.contentEl.append(
+      h('div', { class: 'secret-head' },
+        h('h3', { class: 'sec-title' }, '秘境 · 九重天爬塔（90 层）'),
+        h('p', { class: 'muted' }, `当前 ${floor} 层 · 第 ${tianOf(floor)} 重天 · 最高 ${p.secret.bestFloor} 层 · 存档点 ${p.secret.saveFloor} 层`),
+        h('p', { class: 'muted' }, `本层战力 ≈ ${floorPower(floor)} · 每 5 层秘境宝箱 · 每 10 层存档`),
+      ),
+      h('div', { class: 'ask-actions' },
+        h('button', { class: 'btn btn-primary', onClick: () => this.doFloor() }, `探索第 ${floor} 层`),
+        h('button', { class: 'btn btn-ghost', onClick: () => { resetSecret(p, true); this.toast(`已退回存档点 ${p.secret.saveFloor} 层`); this.afterAction(); } }, '退回存档点'),
+        h('button', { class: 'btn btn-ghost', onClick: () => { resetSecret(p, false); this.toast('已重置至第 1 层'); this.afterAction(); } }, '从第 1 层重开'),
+      ),
+    );
+  }
+  doFloor() {
+    const res = enterFloor(this.player, this.rng());
+    const title = res.text || `第 ${res.floor} 层`;
+    const result = res.kind === 'battle' ? (res.win ? 'win' : 'lose') : 'event';
+    this.showBattle({ log: res.battle ? res.battle.log : [res.text || '（探索有所得）'], result, rounds: res.battle ? res.battle.rounds : 0, rewards: { res: res.rewards.res, frags: res.rewards.frags } },
+      () => {
+        if (res.boxFloor) this.toast(`秘境宝箱：问道令 +1`);
+        if (res.savedFloor) this.toast(`抵达存档点 ${res.savedFloor} 层`);
+        if (res.over) this.toast('恭喜通关秘境九十层！');
+        this.afterAction();
+      }, title);
+  }
+
+  // ============ 洞府 ============
+  renderCave() {
+    const p = this.player;
+    const pv = previewCave(p);
+    const mins = Math.floor(pv.seconds / 60);
+    this.contentEl.append(
+      h('div', { class: 'cave' },
+        h('h3', { class: 'sec-title' }, '洞府 · 挂机画卷（离线收益，上限 12 小时）'),
+        h('p', { class: 'muted' }, `已挂入 ${Object.keys(p.cards).length} 张卡牌 · 总等级 ${caveTotalLevel(p)} · SSR ${caveSSRCount(p)} 张`),
+        h('div', { class: 'cave__box' },
+          h('div', null, h('span', { class: 'big' }, `灵石 +${pv.lingshi}`), h('span', { class: 'muted' }, `修为丹·小 +${pv.exp_s}`)),
+          h('div', { class: 'muted' }, `已累积 ${mins} 分钟${pv.capped ? '（已满 12 小时）' : ''}`),
+        ),
+        h('div', { class: 'ask-actions' },
+          h('button', { class: 'btn btn-primary', disabled: pv.lingshi <= 0 && pv.exp_s <= 0, onClick: () => { const c = collectCave(p); this.toast(`领取 灵石+${c.lingshi}${c.exp_s ? ` 修为丹·小+${c.exp_s}` : ''}`); this.afterAction(); } }, '收取收益'),
+        ),
+        h('p', { class: 'muted center' }, '每小时产出：灵石 = 总等级/10；修为丹·小 = SSR 数量。'),
+      ),
+    );
+  }
+
+  // ============ 图鉴 ============
+  renderCodex() {
+    const p = this.player;
+    const prog = collectionProgress(p);
+    this.contentEl.append(
+      h('h3', { class: 'sec-title' }, `图鉴卷轴 · 收集 ${collectionCount(p)}/${collectionTotal()}（${Math.round(prog * 100)}%）`),
+      ...CODEX_TIERS.map((t) => {
+        const reached = prog >= t.pct;
+        return h('div', { class: `codex-tier ${reached ? 'done' : ''}` },
+          h('span', null, `${Math.round(t.pct * 100)}% 奖励：${t.label}`),
+          h('span', { class: 'muted' }, reached ? '已达成' : '未达成'),
+        );
+      }),
+      h('div', { class: 'codex-scroll' }, ...CARDS.map((c) => {
+        const got = !!p.codex[c.id];
+        return h('div', { class: `codex-card ${got ? '' : 'locked'}` },
+          h('div', { class: 'codex-card__art', style: { borderColor: rarityDef(c.rarity).color } },
+            got ? elEmoji(c.element) : '？'),
+          h('div', { class: 'codex-card__name' }, got ? c.name : '???'),
+          got ? h('div', { class: 'codex-card__sub', style: { color: rarityDef(c.rarity).color } }, `${c.rarity} · ${elName(c.element)}${c.cls}`) : null,
+        );
+      })),
+    );
+  }
+
+  // ============ 设置 ============
+  renderSetting() {
+    const p = this.player;
+    const expStr = exportSave(p);
+    this.contentEl.append(
+      h('h3', { class: 'sec-title' }, '设置 · 存档管理'),
+      h('div', { class: 'panel' },
+        h('div', { class: 'panel__head' }, '伪云存档（导出 / 导入）'),
+        h('div', { class: 'panel__body' },
+          h('p', { class: 'muted' }, '复制下方存档码妥善保存；换设备时粘贴即可恢复进度。'),
+          h('textarea', { class: 'save-code', readonly: true }, expStr),
+          h('div', { class: 'row' },
+            h('button', { class: 'btn btn-ghost', onClick: () => { copyText(expStr); this.toast('存档码已复制'); } }, '复制存档码'),
+            h('button', { class: 'btn btn-ghost', onClick: () => this.openImport() }, '导入存档码'),
+          ),
+        ),
+      ),
+      h('div', { class: 'panel' },
+        h('div', { class: 'panel__head' }, '成就与称号'),
+        h('div', { class: 'panel__body' },
+          ...ACH_CATS.map((cat) => h('div', { class: 'achv-cat' },
+            h('div', { class: 'achv-cat__head' }, cat.name),
+            h('div', { class: 'achv-list' }, ...ACHIEVEMENTS.filter((a) => a.cat === cat.id).map((a) => {
+              const pr = achProgress(p, a);
+              const done = p.achievements.includes(a.id);
+              return h('div', { class: `achv ${done ? 'done' : ''}` },
+                h('div', { class: 'achv__name' }, `${done ? '✓' : '○'} ${a.name}`),
+                h('div', { class: 'achv__desc muted' }, `${a.desc}（奖励：${rewardDesc(a.reward)}）`),
+                done ? null : bar(pr.cur, pr.target, { label: `${fmtNum(pr.cur)}/${fmtNum(pr.target)}` }),
+              );
+            })),
+          )),
+        ),
+      ),
+      h('button', { class: 'btn btn-ghost', onClick: () => this.showSlots() }, '返回存档列表'),
+    );
+  }
+  openImport() {
+    const ta = h('textarea', { class: 'save-code', placeholder: '在此粘贴存档码…' });
+    this.openModal('导入存档', h('div', { class: 'pad' }, h('p', { class: 'muted' }, '将覆盖当前槽位进度。'), ta), {
+      foot: [
+        h('button', { class: 'btn btn-ghost', onClick: () => this.closeModal() }, '取消'),
+        h('button', { class: 'btn btn-primary', onClick: () => {
+          const imp = importSave(ta.value.trim());
+          if (!imp) { this.toast('存档码无效'); return; }
+          imp.slot = getActiveSlot();
+          this.player = imp;
+          this.closeModal();
+          this.enterGame(imp, true);
+          this.toast('存档导入成功');
+        } }, '确认导入'),
+      ],
+    });
+  }
+
+  // ============ 战斗结果弹窗 ============
+  showBattle(res, after, title) {
+    const logLines = (res.log || []).slice(-120);
+    const body = h('div', { class: 'battle' });
+    const head = h('div', { class: `battle__result battle__result--${res.result}` },
+      res.result === 'win' ? '★ 大胜！' : res.result === 'lose' ? '★ 败北…' : '◆ 事件');
+    body.append(head);
+    if (res.rounds) body.append(h('div', { class: 'muted center' }, `耗时 ${res.rounds} 回合`));
+    const rewards = res.rewards || {};
+    const rw = rewards.res || {};
+    const fr = rewards.frags || {};
+    const fragKeys = Object.keys(fr);
+    const resKeys = Object.keys(rw);
+    if (resKeys.length || fragKeys.length) {
+      const gain = h('div', { class: 'battle__gain' });
+      for (const id of resKeys) gain.append(h('span', { class: 'gain-chip' }, `${resEmoji(id)}${resName(id)} +${rw[id]}`));
+      for (const cid of fragKeys) {
+        const d = cardDef(cid);
+        gain.append(h('span', { class: 'gain-chip' }, `${d ? d.name : cid} 碎片 +${fr[cid]}`));
+      }
+      body.append(h('div', { class: 'muted' }, '战利品'), gain);
+    }
+    body.append(h('div', { class: 'battle__log' }, logLines.map((l) => h('div', { class: 'battle__line' }, l))));
+    this.openModal(title || '战斗', body, {
+      dismissable: false,
+      foot: [h('button', { class: 'btn btn-primary', onClick: () => { this.closeModal(); if (after) after(); } }, '确定')],
+    });
+  }
+
+  // ============ 卡牌迷你卡 ============
+  miniCard(id, instance, opts = {}) {
+    const def = cardDef(id);
+    if (!def) return h('div', { class: 'mini-card' }, id);
+    const r = rarityDef(def.rarity);
+    const st = instanceStats(instance);
+    return h('div', {
+      class: `mini-card rarity-${def.rarity} ${opts.onClick ? 'clickable' : ''}`,
+      style: { borderColor: r.color },
+      onClick: opts.onClick || null,
+    },
+      h('div', { class: 'mini-card__head' },
+        h('span', { class: 'mini-card__el' }, elEmoji(def.element)),
+        h('span', { class: 'mini-card__star', style: { color: r.color } }, `${def.rarity}${'★'.repeat(instance.star)}`),
+      ),
+      h('div', { class: 'mini-card__name' }, def.name),
+      h('div', { class: 'mini-card__sub' }, `Lv.${instance.level} · 战力${instancePower(instance)}`),
+      h('div', { class: 'mini-card__stats' },
+        h('span', null, `攻${st.atk}`), h('span', null, `防${st.def}`),
+        h('span', null, `血${st.hp}`), h('span', null, `速${st.spd}`)),
+    );
+  }
+
+  // ============ 循环 / 自动存档 ============
+  startLoop() {
+    this.stopLoop();
+    this._timers.push(setInterval(() => { try { saveGame(this.player); } catch (_) {} }, 10000));
+    document.addEventListener('visibilitychange', this._onVis);
+  }
+  stopLoop() {
+    for (const t of this._timers) clearInterval(t);
+    this._timers = [];
+  }
+  _onVis() {
+    if (document.visibilityState === 'hidden') { try { saveGame(this.player); } catch (_) {} }
+    else if (this.player) { collectCave(this.player); this.refresh(); }
+  }
+}
+
+// ── 工具函数 ──────────────────────────────────────────────────────────────────
+function resChip(emoji, val, title) {
+  return h('span', { class: 'res-chip', title }, h('span', null, emoji), h('span', { class: 'res-chip__val' }, String(val)));
+}
+function pityChip(label, val) {
+  return h('div', { class: 'pity-chip' }, h('span', { class: 'muted' }, label), h('span', { class: 'pity-chip__val' }, String(val)));
+}
+function statLine(label, val, extra) {
+  return h('div', { class: `stat-line ${extra || ''}` }, h('span', { class: 'stat-line__label' }, label), h('span', { class: 'stat-line__val' }, String(val)));
+}
+function pillBtn(p, ui, inst, pillId, label) {
+  const ok = countRes(p, pillId) > 0;
+  return h('button', { class: 'btn btn-ghost', disabled: !ok, onClick: () => ui.doFeedPill(inst, pillId) },
+    `${label}（${countRes(p, pillId)}）`);
+}
+function byRarityThenPower(p) {
+  const order = { SSR: 0, SR: 1, R: 2 };
+  return (a, b) => {
+    const da = cardDef(a), db = cardDef(b);
+    const oa = order[da.rarity], ob = order[db.rarity];
+    if (oa !== ob) return oa - ob;
+    return instancePower(p.cards[b]) - instancePower(p.cards[a]);
+  };
+}
+function fmtNum(n) {
+  if (typeof n === 'number' && n < 1 && n > 0) return `${Math.round(n * 100)}%`;
+  return String(Math.floor(n));
+}
+function cn(n) { return ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖', '拾', '拾壹', '拾贰'][n] || String(n); }
+function copyText(text) {
+  try {
+    if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(text); return; }
+  } catch (_) {}
+  try {
+    const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select();
+    document.execCommand('copy'); document.body.removeChild(ta);
+  } catch (_) {}
+}
diff --git a/apps/ling-xu-wen-jian-lu/src/ui/dom.js b/apps/ling-xu-wen-jian-lu/src/ui/dom.js
new file mode 100644
index 0000000..8c8ad85
--- /dev/null
+++ b/apps/ling-xu-wen-jian-lu/src/ui/dom.js
@@ -0,0 +1,42 @@
+// ============================================================================
+// 轻量 DOM 辅助：h() 创建元素，clear() 清空，bar() 进度条，避免引入框架。
+// ============================================================================
+export function h(tag, props, ...children) {
+  const el = document.createElement(tag);
+  if (props) {
+    for (const [k, v] of Object.entries(props)) {
+      if (v == null || v === false) continue;
+      if (k === 'class') el.className = v;
+      else if (k === 'dataset') Object.assign(el.dataset, v);
+      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
+      else if (k === 'onClick') el.addEventListener('click', v);
+      else if (k === 'onInput') el.addEventListener('input', v);
+      else if (k === 'html') el.innerHTML = v;
+      else if (k in el) { try { el[k] = v; } catch (_) { el.setAttribute(k, v); } }
+      else el.setAttribute(k, v);
+    }
+  }
+  appendChildren(el, children);
+  return el;
+}
+
+function appendChildren(el, children) {
+  for (const c of children) {
+    if (c == null || c === false || c === true) continue;
+    if (Array.isArray(c)) { appendChildren(el, c); continue; }
+    el.append(c.nodeType ? c : document.createTextNode(String(c)));
+  }
+}
+
+export function clear(el) {
+  while (el.firstChild) el.removeChild(el.firstChild);
+  return el;
+}
+
+export function bar(value, max, opts = {}) {
+  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
+  return h('div', { class: `bar ${opts.class || ''}` },
+    h('div', { class: 'bar__fill', style: { width: `${pct}%`, background: opts.color || '' } }),
+    h('span', { class: 'bar__label' }, opts.label || `${Math.floor(value)}/${Math.round(max)}`),
+  );
+}
diff --git a/apps/ling-xu-wen-jian-lu/src/ui/style.css b/apps/ling-xu-wen-jian-lu/src/ui/style.css
new file mode 100644
index 0000000..f3fc2cc
--- /dev/null
+++ b/apps/ling-xu-wen-jian-lu/src/ui/style.css
@@ -0,0 +1,341 @@
+/* ============================================================================
+   灵墟·问剑录 · 国风 2.5D 样式（设计稿 7.x：宣纸 / 墨色 / 朱砂 / 描金）
+   色彩系统：背景 #F5F0E6 / 墨色 #2C1810 / 朱砂 #C23B22 / 描金 #D4A04A
+   ============================================================================ */
+:root {
+  --paper: #F5F0E6;
+  --paper-2: #efe7d6;
+  --ink: #2C1810;
+  --ink-2: #5a4636;
+  --red: #C23B22;
+  --gold: #D4A04A;
+  --r-R: #6A9EC7;
+  --r-SR: #9B6BCC;
+  --r-SSR: #E8636B;
+  --line: rgba(44, 24, 16, 0.14);
+  --shadow: 0 2px 10px rgba(44, 24, 16, 0.12);
+}
+
+* { box-sizing: border-box; }
+
+.lxx {
+  position: absolute;
+  inset: 0;
+  background: var(--paper);
+  color: var(--ink);
+  font-family: "PingFang SC", "Microsoft YaHei", "Noto Serif SC", serif;
+  overflow: hidden;
+  display: flex;
+  flex-direction: column;
+  /* 宣纸纹理 */
+  background-image:
+    radial-gradient(circle at 20% 10%, rgba(212, 160, 74, 0.06), transparent 40%),
+    radial-gradient(circle at 80% 90%, rgba(194, 59, 34, 0.05), transparent 45%);
+}
+
+.lxx-stage {
+  flex: 1;
+  display: flex;
+  flex-direction: column;
+  min-height: 0;
+  overflow: hidden;
+}
+
+/* —— 启动器 —— */
+.launcher {
+  flex: 1;
+  overflow-y: auto;
+  padding: 18px 16px 24px;
+  display: flex;
+  flex-direction: column;
+  align-items: center;
+  gap: 16px;
+}
+.launcher__brand { text-align: center; margin-top: 8px; }
+.launcher__brand .emblem {
+  width: 64px; height: 64px; margin: 0 auto 10px;
+  border-radius: 50%;
+  background: var(--red); color: var(--paper);
+  display: flex; align-items: center; justify-content: center;
+  font-size: 32px; font-weight: bold;
+  box-shadow: 0 4px 14px rgba(194, 59, 34, 0.4);
+  border: 2px solid var(--gold);
+}
+.launcher__brand h1 { font-size: 26px; margin: 0; letter-spacing: 4px; }
+.launcher__brand .sub { color: var(--ink-2); margin: 6px 0 0; font-size: 13px; }
+.launcher__tip { color: var(--ink-2); font-size: 12px; text-align: center; }
+
+.slot-list { width: 100%; max-width: 480px; display: flex; flex-direction: column; gap: 10px; }
+.slot-card {
+  background: rgba(255, 255, 255, 0.55);
+  border: 1px solid var(--line);
+  border-radius: 12px;
+  padding: 12px 14px;
+  box-shadow: var(--shadow);
+}
+.slot-card.empty { opacity: 0.85; border-style: dashed; }
+.slot-head { display: flex; justify-content: space-between; align-items: center; }
+.slot-no { font-weight: bold; color: var(--red); }
+.slot-tag { font-size: 11px; color: var(--ink-2); }
+.slot-tag.warn { color: var(--red); }
+.slot-name { margin: 8px 0 2px; font-size: 15px; }
+.slot-sub { margin: 0 0 8px; font-size: 12px; color: var(--ink-2); }
+.slot-btns { display: flex; gap: 8px; align-items: center; }
+
+/* —— 顶栏 —— */
+.topbar {
+  display: flex; align-items: center; gap: 8px;
+  padding: 8px 12px;
+  background: linear-gradient(180deg, var(--paper-2), var(--paper));
+  border-bottom: 1px solid var(--line);
+  flex-shrink: 0;
+}
+.topbar__brand { font-weight: bold; font-size: 15px; display: flex; align-items: center; gap: 6px; color: var(--red); }
+.topbar__brand .seal {
+  width: 24px; height: 24px; border-radius: 4px;
+  background: var(--red); color: var(--paper);
+  display: flex; align-items: center; justify-content: center;
+  font-size: 14px; font-weight: bold;
+}
+.topbar__res { flex: 1; display: flex; gap: 6px; flex-wrap: wrap; justify-content: flex-end; }
+.res-chip {
+  display: inline-flex; align-items: center; gap: 3px;
+  background: rgba(255, 255, 255, 0.7);
+  border: 1px solid var(--line);
+  border-radius: 12px; padding: 2px 8px; font-size: 12px;
+}
+.res-chip__val { font-weight: bold; color: var(--ink); }
+.topbar__home { margin-left: 4px; }
+
+/* —— 内容 —— */
+.content {
+  flex: 1;
+  overflow-y: auto;
+  padding: 12px;
+  -webkit-overflow-scrolling: touch;
+}
+.sec-title { font-size: 15px; margin: 4px 0 10px; color: var(--ink); border-left: 3px solid var(--red); padding-left: 8px; }
+.muted { color: var(--ink-2); font-size: 12px; }
+.center { text-align: center; }
+.row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
+.pad { padding: 4px 0; }
+
+/* —— 底部 Tab 导航 —— */
+.tabnav {
+  display: flex; flex-shrink: 0;
+  background: var(--paper-2);
+  border-top: 1px solid var(--line);
+  padding: 4px 2px env(safe-area-inset-bottom, 4px);
+}
+.tabnav__btn {
+  flex: 1; min-width: 0;
+  background: none; border: none;
+  display: flex; flex-direction: column; align-items: center; gap: 2px;
+  padding: 6px 2px; cursor: pointer;
+  color: var(--ink-2); font-size: 11px;
+}
+.tabnav__btn.active { color: var(--red); }
+.tabnav__btn.active::after {
+  content: ''; display: block; width: 18px; height: 2px;
+  background: var(--red); border-radius: 2px; margin-top: 2px;
+}
+.tabnav__icon { font-size: 18px; }
+.tabnav__label { white-space: nowrap; }
+
+/* —— 按钮 —— */
+.btn {
+  border: 1px solid var(--line);
+  background: rgba(255, 255, 255, 0.7);
+  color: var(--ink);
+  border-radius: 10px;
+  padding: 8px 14px;
+  font-size: 14px;
+  cursor: pointer;
+  font-family: inherit;
+}
+.btn:disabled { opacity: 0.4; cursor: not-allowed; }
+.btn-primary { background: var(--red); color: var(--paper); border-color: var(--red); }
+.btn-gold { background: var(--gold); color: var(--ink); border-color: var(--gold); font-weight: bold; }
+.btn-ghost { background: transparent; }
+.btn-danger { background: #8a2b1a; color: var(--paper); border-color: #8a2b1a; }
+.icon-btn {
+  background: rgba(255, 255, 255, 0.6); border: 1px solid var(--line);
+  border-radius: 8px; padding: 6px 8px; cursor: pointer; font-size: 16px;
+}
+
+/* —— 阵容 —— */
+.formation {
+  display: grid;
+  grid-template-columns: repeat(5, 1fr);
+  gap: 6px;
+  margin-bottom: 8px;
+}
+.slot {
+  background: rgba(255, 255, 255, 0.5);
+  border: 1px solid var(--line);
+  border-radius: 10px;
+  padding: 6px 4px;
+  min-height: 96px;
+  display: flex; flex-direction: column; align-items: center; justify-content: center;
+  cursor: pointer; position: relative;
+}
+.slot.empty { border-style: dashed; background: transparent; }
+.slot__pos { position: absolute; top: 2px; left: 4px; font-size: 10px; color: var(--gold); font-weight: bold; }
+.slot--pos1 { border-color: var(--red); } /* 主坦位高亮 */
+.slot__hint { color: var(--ink-2); font-size: 12px; }
+
+.card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(96px, 1fr)); gap: 8px; }
+
+/* —— 迷你卡（2.5D 等距感）—— */
+.mini-card {
+  background: linear-gradient(160deg, rgba(255,255,255,0.9), var(--paper-2));
+  border: 1px solid var(--line);
+  border-left: 3px solid var(--gold);
+  border-radius: 10px;
+  padding: 6px 8px;
+  box-shadow: var(--shadow);
+  transition: transform 0.15s ease;
+}
+.mini-card.clickable { cursor: pointer; }
+.mini-card.clickable:hover { transform: translateY(-3px); }
+.mini-card__head { display: flex; justify-content: space-between; align-items: center; }
+.mini-card__el { font-size: 14px; }
+.mini-card__star { font-size: 10px; font-weight: bold; }
+.mini-card__name { font-size: 13px; font-weight: bold; margin: 2px 0; }
+.mini-card__sub { font-size: 10px; color: var(--ink-2); }
+.mini-card__stats { display: flex; gap: 6px; font-size: 10px; color: var(--ink-2); margin-top: 2px; flex-wrap: wrap; }
+
+/* —— 问道 —— */
+.ask-banner { background: rgba(255,255,255,0.5); border: 1px solid var(--line); border-radius: 12px; padding: 12px; margin-bottom: 12px; }
+.ask-pity { display: flex; gap: 8px; margin-top: 8px; flex-wrap: wrap; }
+.pity-chip { background: var(--paper-2); border-radius: 8px; padding: 4px 10px; text-align: center; }
+.pity-chip__val { display: block; font-weight: bold; color: var(--red); }
+.ask-actions { display: flex; flex-direction: column; gap: 8px; margin: 8px 0; }
+.gacha-result { display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 10px; }
+.gacha-card {
+  background: rgba(255,255,255,0.8); border: 2px solid var(--line);
+  border-radius: 12px; padding: 12px 8px; text-align: center; position: relative;
+}
+.gacha-card.rarity-SSR { box-shadow: 0 0 14px var(--r-SSR); animation: glow 1.6s ease-in-out infinite alternate; }
+.gacha-card.rarity-SR { box-shadow: 0 0 8px var(--r-SR); }
+@keyframes glow { from { filter: brightness(1); } to { filter: brightness(1.12); } }
+.gacha-card__name { font-size: 15px; font-weight: bold; }
+.gacha-card__sub { font-size: 11px; color: var(--ink-2); margin-top: 2px; }
+.tag { font-size: 10px; padding: 1px 6px; border-radius: 8px; display: inline-block; }
+.tag-new { background: var(--red); color: var(--paper); }
+.tag-dup { background: var(--paper-2); color: var(--ink-2); border: 1px solid var(--line); }
+.tag-boss { background: var(--red); color: var(--paper); }
+.tag-elite { background: var(--gold); color: var(--ink); }
+.tag-normal { background: var(--paper-2); color: var(--ink-2); border: 1px solid var(--line); }
+.tag-done { background: #4a8a4a; color: #fff; }
+
+/* —— 修炼 —— */
+.card-picker { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 8px; margin-bottom: 8px; }
+.picker-chip {
+  flex-shrink: 0; border: 1px solid var(--line); background: rgba(255,255,255,0.7);
+  border-radius: 16px; padding: 4px 10px; font-size: 12px; cursor: pointer; white-space: nowrap;
+}
+.picker-chip.active { background: var(--ink); color: var(--paper); }
+.cult-card { background: rgba(255,255,255,0.55); border: 1px solid var(--line); border-radius: 12px; padding: 12px; margin-bottom: 12px; }
+.cult-card__head { display: flex; gap: 10px; align-items: center; margin-bottom: 8px; }
+.rarity-badge { color: #fff; font-size: 11px; padding: 4px 8px; border-radius: 8px; font-weight: bold; }
+.cult-card__name { font-size: 17px; font-weight: bold; }
+.cult-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 12px; margin: 8px 0; }
+.stat-line { display: flex; justify-content: space-between; font-size: 13px; }
+.stat-line__label { color: var(--ink-2); }
+.stat-line__val { font-weight: bold; }
+.stat-line.灵 .stat-line__val { color: var(--red); }
+.cult-exp { margin: 8px 0; }
+.quote { font-style: italic; color: var(--ink-2); margin: 8px 0 4px; font-size: 13px; }
+.story { font-size: 12px; color: var(--ink-2); margin: 0; line-height: 1.5; }
+.panel { background: rgba(255,255,255,0.4); border: 1px solid var(--line); border-radius: 10px; margin-bottom: 10px; overflow: hidden; }
+.panel__head { background: var(--paper-2); padding: 8px 12px; font-size: 13px; font-weight: bold; border-bottom: 1px solid var(--line); }
+.panel__body { padding: 10px 12px; }
+
+/* —— 进度条 —— */
+.bar { position: relative; background: rgba(0,0,0,0.08); border-radius: 6px; height: 14px; overflow: hidden; }
+.bar__fill { position: absolute; left: 0; top: 0; bottom: 0; background: var(--red); transition: width 0.3s; }
+.bar__label { position: relative; text-align: center; font-size: 10px; line-height: 14px; color: var(--ink); }
+
+/* —— 主线 —— */
+.chapter-bar { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
+.chapter-bar__info { flex: 1; }
+.chapter-bar__name { font-size: 16px; font-weight: bold; }
+.stage-list { display: flex; flex-direction: column; gap: 8px; }
+.stage-row {
+  background: rgba(255,255,255,0.6); border: 1px solid var(--line);
+  border-radius: 10px; padding: 10px 12px; text-align: left; cursor: pointer;
+  display: flex; justify-content: space-between; align-items: center; gap: 8px;
+}
+.stage-row.boss { border-left: 4px solid var(--red); }
+.stage-row.elite { border-left: 4px solid var(--gold); }
+.stage-row.normal { border-left: 4px solid var(--line); }
+.stage-row.locked { opacity: 0.45; cursor: not-allowed; }
+.stage-row.cleared { background: rgba(74, 138, 74, 0.12); }
+.stage-row__id { font-weight: bold; color: var(--red); margin-right: 8px; }
+.stage-row__name { font-size: 14px; }
+.stage-row__meta { display: flex; gap: 6px; align-items: center; }
+
+/* —— 秘境 / 洞府 —— */
+.secret-head { background: rgba(255,255,255,0.5); border: 1px solid var(--line); border-radius: 12px; padding: 12px; margin-bottom: 10px; }
+.cave { background: rgba(255,255,255,0.5); border: 1px solid var(--line); border-radius: 12px; padding: 12px; }
+.cave__box { background: var(--paper-2); border-radius: 10px; padding: 12px; margin: 10px 0; text-align: center; }
+.cave__box .big { font-size: 20px; font-weight: bold; color: var(--red); margin-right: 8px; }
+
+/* —— 图鉴 —— */
+.codex-tier { display: flex; justify-content: space-between; padding: 6px 10px; border-radius: 8px; background: var(--paper-2); margin-bottom: 6px; font-size: 13px; }
+.codex-tier.done { background: rgba(74, 138, 74, 0.16); }
+.codex-scroll { display: grid; grid-template-columns: repeat(auto-fill, minmax(90px, 1fr)); gap: 10px; margin-top: 10px; }
+.codex-card { background: rgba(255,255,255,0.6); border: 1px solid var(--line); border-radius: 10px; padding: 10px 6px; text-align: center; }
+.codex-card.locked { filter: grayscale(1); opacity: 0.6; }
+.codex-card__art { width: 48px; height: 48px; margin: 0 auto 6px; border-radius: 50%; border: 2px solid var(--line); display: flex; align-items: center; justify-content: center; font-size: 22px; background: var(--paper-2); }
+.codex-card__name { font-size: 12px; font-weight: bold; }
+.codex-card__sub { font-size: 10px; }
+
+/* —— 设置 —— */
+.save-code { width: 100%; height: 80px; font-size: 11px; border: 1px solid var(--line); border-radius: 8px; padding: 6px; resize: vertical; word-break: break-all; margin: 8px 0; }
+.achv-cat { margin-bottom: 12px; }
+.achv-cat__head { font-weight: bold; color: var(--red); margin-bottom: 6px; font-size: 13px; }
+.achv-list { display: flex; flex-direction: column; gap: 8px; }
+.achv { background: rgba(255,255,255,0.5); border: 1px solid var(--line); border-radius: 8px; padding: 8px 10px; }
+.achv.done { background: rgba(74, 138, 74, 0.12); }
+.achv__name { font-size: 13px; font-weight: bold; }
+.achv__desc { margin: 2px 0 4px; }
+
+/* —— 弹窗 —— */
+.lxx-modals { position: absolute; inset: 0; pointer-events: none; }
+.modal-mask {
+  position: absolute; inset: 0; background: rgba(44, 24, 16, 0.5);
+  display: flex; align-items: center; justify-content: center; padding: 16px;
+  pointer-events: auto; z-index: 50;
+}
+.sheet {
+  background: var(--paper); border: 1px solid var(--line);
+  border-radius: 14px; width: 100%; max-width: 460px; max-height: 86vh;
+  display: flex; flex-direction: column; box-shadow: 0 10px 40px rgba(0,0,0,0.3);
+  border-top: 3px solid var(--gold);
+}
+.sheet__head { display: flex; justify-content: space-between; align-items: center; padding: 12px 14px; border-bottom: 1px solid var(--line); }
+.sheet__head .t { font-size: 16px; font-weight: bold; color: var(--red); }
+.sheet__x { background: none; border: none; font-size: 18px; cursor: pointer; color: var(--ink-2); }
+.sheet__body { padding: 14px; overflow-y: auto; flex: 1; }
+.sheet__foot { padding: 10px 14px; border-top: 1px solid var(--line); display: flex; gap: 8px; justify-content: flex-end; }
+
+/* —— 战斗 —— */
+.battle__result { text-align: center; font-size: 22px; font-weight: bold; padding: 8px; border-radius: 10px; margin-bottom: 8px; }
+.battle__result--win { color: var(--red); background: rgba(194, 59, 34, 0.1); }
+.battle__result--lose { color: var(--ink-2); background: rgba(0,0,0,0.06); }
+.battle__gain { display: flex; gap: 6px; flex-wrap: wrap; margin: 8px 0; }
+.gain-chip { background: var(--paper-2); border: 1px solid var(--line); border-radius: 8px; padding: 3px 8px; font-size: 12px; }
+.battle__log { background: var(--paper-2); border-radius: 8px; padding: 8px; max-height: 220px; overflow-y: auto; margin-top: 8px; }
+.battle__line { font-size: 12px; line-height: 1.6; color: var(--ink); border-bottom: 1px dashed rgba(0,0,0,0.06); padding: 1px 0; }
+
+/* —— Toast —— */
+.toast-wrap { position: absolute; top: 8px; left: 50%; transform: translateX(-50%); z-index: 80; display: flex; flex-direction: column; gap: 6px; align-items: center; pointer-events: none; width: 92%; max-width: 420px; }
+.toast {
+  background: rgba(44, 24, 16, 0.92); color: var(--paper);
+  border-radius: 20px; padding: 8px 16px; font-size: 13px;
+  box-shadow: 0 4px 12px rgba(0,0,0,0.3); transition: opacity 0.3s;
+  border: 1px solid var(--gold);
+}
+.toast.fade { opacity: 0; }
diff --git a/apps/ling-xu-wen-jian-lu/vite.config.js b/apps/ling-xu-wen-jian-lu/vite.config.js
new file mode 100644
index 0000000..435fb33
--- /dev/null
+++ b/apps/ling-xu-wen-jian-lu/vite.config.js
@@ -0,0 +1,16 @@
+import { defineConfig } from 'vite';
+
+// `base: './'` 生成相对路径资源引用，便于部署到 GitHub Pages 子路径或任意静态目录。
+// 本作刻意不依赖任何框架，纯原生 DOM 渲染，构建产物极小。
+export default defineConfig({
+  base: './',
+  server: {
+    host: true,
+    port: 5180,
+  },
+  build: {
+    outDir: 'dist',
+    sourcemap: false,
+    target: 'es2018',
+  },
+});
diff --git a/src/main.js b/src/main.js
index 7f0c8af..29bc628 100644
--- a/src/main.js
+++ b/src/main.js
@@ -77,6 +77,14 @@ const APPS = {
     desc: '自择一城起兵，开发内政、推进科技树、招揽四十余位名将，在十八城中国地图上回合制征战，俘将夺城，一统九州。',
     loader: () => import('../apps/xiong-tu-san-guo/src/main.js'),
   },
+  lxwjl: {
+    key: 'lxwjl',
+    title: '灵墟·问剑录',
+    subtitle: '仙侠 · 卡牌修仙',
+    emblem: '剑',
+    desc: '问道抽卡集齐十五张五行卡牌，修炼突破升星、布阵站位，在五行克制的回合制战场上征战十二卷主线、攀爬九重天秘境；洞府挂机收菜，伪云存档随取随玩。',
+    loader: () => import('../apps/ling-xu-wen-jian-lu/src/main.js'),
+  },
 }
 
 // 大类：先呈现「学习」，再呈现「游戏」。点击大类进入后，才展开其中的具体应用。
@@ -95,7 +103,7 @@ const CATEGORIES = [
     subtitle: '休闲 · 互动娱乐',
     emblem: '玩',
     desc: '消磨时光的互动小品：修仙、人生、三国战场、星骸浮岛、诸侯争霸，挑一个开始吧。',
-    appKeys: ['dzf', 'frxx', 'mnrs', 'xhlz', 'xtsg'],
+    appKeys: ['dzf', 'frxx', 'mnrs', 'xhlz', 'xtsg', 'lxwjl'],
   },
 ]
 
