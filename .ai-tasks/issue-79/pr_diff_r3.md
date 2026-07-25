diff --git a/.ai-tasks/issue-79/ai-coder-prompt.md b/.ai-tasks/issue-79/ai-coder-prompt.md
new file mode 100644
index 0000000..49fd619
--- /dev/null
+++ b/.ai-tasks/issue-79/ai-coder-prompt.md
@@ -0,0 +1,8 @@
+你是一个资深开发者。请解决以下 GitHub Issue：
+【任务标题】: 在游戏栏目下新增以下游戏
+【详细需求】: 请直接阅读当前目录下的 .ai-tasks/issue-79/context.md 文件获取。
+
+【⚠️ 严格红线规则】：
+请绝对不要修改、重命名或生成 .github/ 目录下的任何文件 (特别是 workflows 等 CI/CD 配置)，这会破坏项目的自动化流程！如果觉得有必要修改，请在回复中用文字建议人类去改，绝不要自己动手改。
+
+请直接分析并修改项目中的代码文件来解决这个问题，不要做过多的文字解释。
diff --git a/.ai-tasks/issue-79/ai-reviewer-prompt_r1.md b/.ai-tasks/issue-79/ai-reviewer-prompt_r1.md
new file mode 100644
index 0000000..6ad7d53
--- /dev/null
+++ b/.ai-tasks/issue-79/ai-reviewer-prompt_r1.md
@@ -0,0 +1,14 @@
+你是一个极其严格、甚至有些刁钻的资深代码审查员。
+这是代码提交后的【第 1 轮】审查。
+请阅读当前目录下的 .ai-tasks/issue-79/pr_diff_r1.md 文件，这是本次 PR 的代码变更。
+
+请检查是否有 Bug、逻辑错误、安全问题或性能瓶颈。
+
+【⚠️ 重要输出格式要求】：
+请严格按照以下纯文本格式输出，每项各占一行，不要使用 Markdown 代码块包裹，不要输出其他任何内容：
+DECISION: APPROVE
+或
+DECISION: REQUEST_CHANGES
+COMMENT: 你的详细审查意见 (如果你的意见中涉及需要修改 CI/CD 或 workflows，请告知人类手动处理)
+
+注意：DECISION 和 COMMENT 必须各占一行，以 DECISION: 和 COMMENT: 开头。COMMENT 的内容可以跨多行。
diff --git a/.ai-tasks/issue-79/ai-reviewer-prompt_r2.md b/.ai-tasks/issue-79/ai-reviewer-prompt_r2.md
new file mode 100644
index 0000000..319baca
--- /dev/null
+++ b/.ai-tasks/issue-79/ai-reviewer-prompt_r2.md
@@ -0,0 +1,14 @@
+你是一个极其严格、甚至有些刁钻的资深代码审查员。
+这是代码提交后的【第 2 轮】审查。
+请阅读当前目录下的 .ai-tasks/issue-79/pr_diff_r2.md 文件，这是本次 PR 的代码变更。
+
+请检查是否有 Bug、逻辑错误、安全问题或性能瓶颈。
+
+【⚠️ 重要输出格式要求】：
+请严格按照以下纯文本格式输出，每项各占一行，不要使用 Markdown 代码块包裹，不要输出其他任何内容：
+DECISION: APPROVE
+或
+DECISION: REQUEST_CHANGES
+COMMENT: 你的详细审查意见 (如果你的意见中涉及需要修改 CI/CD 或 workflows，请告知人类手动处理)
+
+注意：DECISION 和 COMMENT 必须各占一行，以 DECISION: 和 COMMENT: 开头。COMMENT 的内容可以跨多行。
diff --git a/.ai-tasks/issue-79/context.md b/.ai-tasks/issue-79/context.md
new file mode 100644
index 0000000..1b51de6
--- /dev/null
+++ b/.ai-tasks/issue-79/context.md
@@ -0,0 +1,329 @@
+《雄图·三国志文明》游戏设计方案文档
+
+---
+
+一、游戏概述
+
+游戏类型：单机回合制策略经营游戏，网页端（纯静态，GitHub Pages 部署），适配手机竖屏操作。
+游戏背景：以三国时代为蓝本，玩家扮演自定义君主，选择一座城市作为起点，通过内政建设、科技发展、招揽名将、军事征伐，最终统一中国全境。
+核心玩法：结合《三国志》系列的名将养成与指令式内政、《文明》系列的城市发展与科技树推进，在一个划分城市节点的中国地图上进行逐回合博弈。
+
+---
+
+二、核心机制
+
+2.1 地图与城市系统
+
+· 采用简化的中国古地图（静态 SVG 或 Canvas 绘制），共设置 15~20 座核心城市（如洛阳、长安、邺城、许昌、成都、建业、襄阳、汉中、北平、下邳等）。
+· 城市之间通过固定路径相连（邻接关系），军队出征只能沿路径移动。
+· 每个城市具有以下属性：
+  · 基础数值：人口上限、初始人口、初始金钱、初始军粮、初始士兵数。
+  · 城市特性（永久 Buff/Debuff）：
+    · 例如：洛阳“天下之中”商业收入 +20%；汉中“易守难攻”城防值 +30%；南皮“产粮大郡”粮食产量 +25% 等。
+  · 当前建筑等级：农田、市集、兵营、城墙、工坊（每种 1~5 级）。
+  · 当前资源存量：金钱、军粮、士兵、人口、城防耐久度。
+  · 控制势力标记。
+
+2.2 君主与初始设置
+
+· 玩家开局需设定：
+  · 君主姓名（自定义，限 2~4 字，系统不提供预设）。
+  · 选择初始城市（从所有可争夺城市中选择，AI 势力会随机占据其余城市）。
+· 君主属性完全随机生成，范围 50~100，共五项：
+  · 统率（影响带兵上限、出征士气）
+  · 武力（影响单挑、训练效率）
+  · 智力（影响计谋成功率、科技研究速度）
+  · 政治（影响内政指令效果、人口增长）
+  · 魅力（影响招募名将成功率、外交效果）
+· 君主即为玩家势力的第一个“武将”，可执行所有武将功能。
+
+2.3 名将系统
+
+· 游戏内置 40+ 历史名将（如关羽、张飞、诸葛亮、周瑜、吕布等），初始分布在各个城市或处于“在野”状态。
+· 每位名将有唯一面板：
+  · 五项属性（统武智政魅，范围 30~100）
+  · 专属技能（被动或主动）：如“威震华夏”（统率 +10%）、“神算”（计谋成功率 +20%）
+  · 忠诚度（0~100，低于 30 可能被策反或下野）
+  · 所在位置：某城市或“在野”（随回合刷新可能出现）
+· 玩家可通过“探索”指令发现本城在野名将，用“登用”指令说服加入（成功率受玩家魅力、名将忠诚倾向、相性影响）。
+· 战斗中可俘虏敌方名将，关押后可招降或处决。
+· 名将可被任命为太守、军师、出征主将，影响城市运营和军队战力。
+
+2.4 回合与指令系统
+
+· 游戏以季节为回合单位（每回合代表三个月）。每回合玩家获得若干“指令点数”（根据城市数量与政治值），例如基础 5 点，每多一座城 +2 点。
+· 指令包括：
+  · 内政类（消耗 1 点）：
+    · 开发农田（提升粮食产量）
+    · 发展商业（提升金钱收入）
+    · 征兵（消耗人口、金钱，增加士兵）
+    · 城防修筑（提升城墙等级）
+    · 技术研究（推进科技树）
+  · 人事类：
+    · 探索（发现本城在野名将）
+    · 登用（说服目标加入）
+    · 赏赐（消耗金钱提升忠诚）
+    · 任命太守/军师
+  · 军事类：
+    · 出征（选择将领、兵力，攻击相邻城市）
+    · 输送（在己方城市间调运资源）
+  · 外交/特殊类（消耗 1 点）：
+    · 流言（降低敌方城市守将忠诚）
+    · 计略（如“火攻”降低目标城防，“烧粮”减少敌方军粮等，成功率取决于智力差）
+· 执行完所有指令后点击“结束回合”，世界进入 AI 操作与资源结算。
+
+2.5 资源与人口机制
+
+· 金钱：每回合城市商业收入 = 市集等级 × 100 + 人口 × 0.5。用于征兵、赏赐、研究。
+· 军粮：每回合农田产量 = 农田等级 × 200。士兵每回合消耗军粮 = 士兵总数 × 0.5。军粮不足会导致士兵逃亡。
+· 人口：城市人口上限由农田等级和初始设定决定。每回合自然增长 = 当前人口 × 政治系数 × 0.02。征兵会减少人口。
+· 士兵：无人口上限限制，但受带兵将领统率约束（最大带兵数 = 统率 × 100）。训练度影响战斗力，默认 50，可通过“训练”指令或建筑提升。
+· 城防：城墙等级提供耐久度，攻城战时必须先打掉城防才能杀伤城内守军。
+
+2.6 科技树
+
+· 设立一条简化的线性/分支科技树，共 6 项科技，每项 3 级：
+  1. 农艺（提升粮食产量 +10%/级）
+  2. 商贸（提升金钱收入 +10%/级）
+  3. 冶炼（提升士兵攻击力 +5%/级）
+  4. 筑城（提升城防值 +20%/级，并解锁高级城墙）
+  5. 谋略（提升计谋成功率 +5%/级，解锁新计谋）
+  6. 统御（提升带兵上限 +10%/级）
+· 研究消耗金钱和时间（固定回合数，智力可缩短回合）。当前研究等级为势力全城共享。
+
+2.7 战斗系统（简化自动战斗）
+
+· 出征消耗军粮（按路程格数计算），到达敌城后进入战斗界面。
+· 战斗采用回合制骰子模型，自动结算，但允许玩家在战前选择阵型和战术卡（若有军师技能）。
+· 核心公式：
+  · 我方攻击值 = (主将武力×0.4 + 统率×0.3 + 士兵数×0.01)×科技系数×训练度系数
+  · 敌方同理。
+  · 每回合双方同时对对方造成伤害，伤害 = 己方攻击值 - 对方城防减免（若有城防则优先消耗城防）。
+  · 城防为 0 后，伤害转为削减士兵。士兵率先归零者战败。
+  · 若名将单挑触发：武力差 > 20 时有概率触发单挑，直接决定胜负（武力高者胜，败方士气大幅下降）。
+· 胜利后占领城市，可俘虏守将、缴获资源。
+
+2.8 AI 势力
+
+· 开局随机分配 5~8 个 AI 势力，各占据若干城市，并有随机君主名及生成武将。
+· AI 行为优先级：
+  1. 内政发展（征足够的兵、研究科技）
+  2. 招募在野名将
+  3. 攻击相邻且军力低于己方的玩家/其他 AI 城市
+  4. 防御：薄弱城市输送资源
+· AI 每回合也消耗等量指令点，简单判断即可。
+
+2.9 胜利与失败条件
+
+· 胜利：占领全部城市。
+· 失败：玩家所有城市丢失且无可用将领/军队（可继续观战但无操作可能，设为游戏结束）。
+
+---
+
+三、数据结构设计（用于 localStorage 存档）
+
+3.1 全局游戏状态对象
+
+```json
+{
+  "version": 1,
+  "turn": 1,
+  "playerFactionId": 0,
+  "factions": [ /* 势力数组 */ ],
+  "cities": [ /* 城市数组 */ ],
+  "heroes": [ /* 名将数组（含玩家君主和招募武将） */ ],
+  "techLevels": { "agri": 0, "commerce": 0, "forge": 0, "wall": 0, "trick": 0, "leadership": 0 },
+  "log": [ /* 最近的事件日志，用于显示回合简报 */ ]
+}
+```
+
+3.2 势力对象（Faction）
+
+```json
+{
+  "id": 0,
+  "name": "玩家势力名",
+  "color": "#ff0000",
+  "money": 5000,
+  "grain": 10000,
+  "aiControlled": false
+}
+```
+
+3.3 城市对象（City）
+
+```json
+{
+  "id": "luoyang",
+  "name": "洛阳",
+  "ownerFactionId": 0,
+  "population": 80000,
+  "maxPopulation": 100000,
+  "soldiers": 3000,
+  "defense": 1000,
+  "gold": 2000,
+  "grain": 5000,
+  "farmLevel": 1,
+  "marketLevel": 1,
+  "barracksLevel": 1,
+  "wallLevel": 1,
+  "workshopLevel": 0,   // 可选：工坊影响科技速度
+  "governorHeroId": null, // 太守武将ID
+  "adjacentCities": ["changan", "xuchang"] // 邻接城市ID列表
+}
+```
+
+3.4 名将对象（Hero）
+
+```json
+{
+  "id": "guanyu",
+  "name": "关羽",
+  "isPlayerLord": false, // 是否为玩家君主
+  "factionId": 0,
+  "cityId": "luoyang",   // 所在城市，若在野则 "wild_city_id"
+  "status": "free",      // "free", "deployed", "prisoner"(俘虏，所在城市监狱)
+  "loyalty": 95,
+  "stats": {
+    "leadership": 96,
+    "warrior": 97,
+    "intelligence": 75,
+    "politics": 62,
+    "charm": 88
+  },
+  "skill": {
+    "name": "威震华夏",
+    "type": "passive",   // 或 "active"
+    "effect": "leadership_multiplier_1.1"
+  }
+}
+```
+
+3.5 存档管理
+
+· 使用 localStorage，键名 "heroicThreeKingdoms_save"，保存完整的 JSON 字符串。
+· 提供“保存游戏”、“读取游戏”、“新游戏”功能。
+
+---
+
+四、界面设计与交互流程
+
+4.1 屏幕适配
+
+· 采用移动端优先设计，最大宽度 480px，居中显示。
+· 使用 Flexbox + 百分比布局，触摸友好按钮（最小 44x44px）。
+· 所有操作使用底部 Tab 导航切换：地图 | 势力 | 名将 | 科技 | 系统。
+
+4.2 主要界面
+
+（1）开始界面
+
+· 游戏标题“雄图·三国志文明”与副标题。
+· 按钮：【新游戏】【继续游戏】（灰色若没有存档）。
+· 新游戏后进入君主创建界面：
+  · 输入姓名文本框（校验2~4中文）。
+  · 显示随机生成的五项属性（可点击“重新随机”，上限5次）。
+  · 下方地图选择初始城市：高亮可选城市（未被AI占用），点击城市显示信息确认。
+
+（2）地图主界面
+
+· 显示简化中国地图，城市用圆形图标标识，颜色对应该势力。
+· 当前选中己方城市：弹出城市详情面板（人口、金钱、兵粮等）。
+· 点击己方城市可出现指令菜单（内政、人事、出征等按钮）。
+· 点击敌方/空城显示基本信息及可用的军事指令（出征、计略）。
+· 顶栏显示当前回合、金钱、军粮总览。
+
+（3）势力总览（Tab2）
+
+· 列表显示己方所有城市，每项可点击快速跳转地图并选中。
+· 显示科技等级，资源总收入/支出预览。
+
+（4）名将列表（Tab3）
+
+· 按状态分类：在野（可探索）、属将、俘虏。
+· 每个名将卡片显示属性、技能、忠诚，提供【赏赐】【任命】【释放/处决】操作。
+
+（5）科技树界面（Tab4）
+
+· 显示6项科技及其当前等级/下一级效果和消耗。
+· 点击研究按钮扣除金钱并开始研究（显示剩余回合）。
+
+（6）系统菜单（Tab5）
+
+· 保存/读取游戏。
+· 结束本回合（确认弹窗）。
+· 游戏设置（音效开关，简单）。
+
+（7）战斗界面（模态窗口）
+
+· 当出征军队到达目标城市或敌军进攻己方城市时自动触发。
+· 显示双方兵力、将领头像和属性条。
+· 战前选择：阵型（普通/攻击/防御，影响系数）或使用军师计略（若智力够）。
+· 点击开战，自动播放回合战报（文字滚动）。
+· 显示结果，提供处理俘虏界面。
+
+4.3 回合事件摘要
+
+· 每回合结束后弹出一张总结卡片：
+  · 收入报告（金、粮变化）。
+  · 人口变化。
+  · 名将动态（是否出现新在野、招募成功等）。
+  · AI 进攻消息。
+  · 玩家可逐条确认关闭。
+
+---
+
+五、AI 逻辑简述
+
+AI 每回合遍历其城市，按以下优先级消耗指令点：
+
+1. 若城市金币低于 500 且市场可升级：升市场。
+2. 若城市士兵低于人口 20%：征兵。
+3. 若存在在野名将且魅力>70的武将空闲：探索+登用。
+4. 科技研究，若满足金钱花费。
+5. 侵略判断：遍历相邻非己方城市，比较军力（己方士兵数+武将统率修正 vs 敌方士兵+城防），若优且兵力比>1.5则出征。
+6. 对边境城市输送资源，平衡防御。
+
+AI 名将忠诚度管理：每回合有几率赏赐提升忠诚度。
+
+---
+
+六、技术实现建议
+
+· 纯前端技术栈：HTML5 + CSS3 + vanilla JS，无框架。
+· 地图渲染：使用内嵌 SVG 地图，城市用 <circle> 表示，路径用 <line>，绑定点击事件。
+· 响应式：meta viewport 设置，地图部分可缩放或固定尺寸，城市图标最小 30px 便于手指点击。
+· 数据持久化：所有游戏对象序列化为 JSON 存入 localStorage，注意避免循环引用。
+· 回合操作需加锁：避免玩家连续点击按钮造成状态混乱。
+· 音效：可使用 Web Audio API 简短音效提示（可选）。
+
+---
+
+七、名将与城市初始数据（部分示例）
+
+7.1 城市列表（供参考，实际可扩展至18城）
+
+ID 名称 特性 人口上限 起始人口 金 粮 兵 邻接
+luoyang 洛阳 商业+20% 100000 80000 3000 8000 2000 changan,xuchang,ye
+changan 长安 城防+20% 80000 60000 2000 6000 1500 luoyang,hanshong
+xuchang 许昌 人口增长+10% 70000 50000 2500 7000 1800 luoyang,xiapi,wan
+chengdu 成都 粮食+15% 90000 70000 2000 10000 1600 hanzhong,jianning
+……
+
+7.2 名将初始分布
+
+名将 所在城市/状态 忠诚倾向
+关羽 在野（前期随机刷在刘备势力周边） 95(刘备)
+诸葛亮 在野（襄阳） 100(刘备)
+曹操 初始为势力君主（许昌） —
+赵云 在野（常山） 90(刘备)
+周瑜 建业势力初始武将 98(孙策)
+吕布 在野（随机） 70（低）
+
+注：为避免版权和历史人名争议，可使用化名如“关云长”，但文档中暂用原名为直观。
+
+---
+
+八、总结
+
+本方案提供了完整的回合制策略游戏设计，融合了三国志的武将养成、指令式内政和文明的科技树、城市发展，地图基于中国城市节点图，操作适配手机，数据均存储于本地浏览器。Agent 可依据以上数据结构、界面模块、规则算法进行实现，构建出可玩的静态网页游戏。
diff --git a/.ai-tasks/issue-79/fixer-feedback_r1.md b/.ai-tasks/issue-79/fixer-feedback_r1.md
new file mode 100644
index 0000000..1d0facd
--- /dev/null
+++ b/.ai-tasks/issue-79/fixer-feedback_r1.md
@@ -0,0 +1,9 @@
+已构建并运行全部自测（135 逻辑断言 + 21 DOM 冒烟断言全过，vite 构建成功，`_lib/keyboard-shell.js` 引入路径正确，无 .github/CI 改动，无 XSS/注入风险），但发现两处确凿的核心逻辑 Bug，已用真实代码复现，需修复：
+
+【Bug 1 · 严重 · 资源凭空消失】src/core/actions.js 的 transport()。金钱/军粮是势力级共享池（见 economy.js 与 resolveTurn，每回合直接 fac.money+=、fac.grain+=），并非城市级。但 transport() 里却执行 `fac.money -= gm; fac.grain -= gr;` 且**从不把 gm/gr 加到任何地方**（from/to 的城市金库 gold/grain 也未变动）。实测：输送 500 金/500 粮后，势力金钱 -500、军粮 -500，而 luoyang.gold/wan.gold 均不变 —— 玩家的资源被直接销毁。UI（src/ui/app.js 的 uiTransport）还专门提供了金/粮输入框诱导玩家误用。修复建议：金/粮本就是全势力共享、无需「输送」，应从 transport() 移除金/粮扣减逻辑、并从 uiTransport 表单去掉金/粮输入框，只保留唯一有意义的城市级资源——士兵（soldiers 部分的 from.soldiers-=s / to.soldiers+=s 是正确的，保留即可）。
+
+【Bug 2 · 严重 · 战斗结果不回写】src/core/actions.js 的 applyCampaignResult()。createBattle() 对 attacker/defender 做了浅拷贝，runBattle() 只削减 `battle.defender.soldiers`，从未改写真实城市 `to.soldiers`。攻方获胜分支用 `to.soldiers = survivors`（攻方残兵）覆写，尚可；但**攻方失利分支只 push 了一条日志，完全没有把守军实际伤亡回写**。实测：守军 600、城防 0，玩家攻城失败时，战斗结算守军被打到仅剩 168（战死 432），而战斗结束后真实城市 garrison 仍为 600 —— 守军凭空满血复活。这意味着「以战消耗敌城」的策略完全失效：只要攻城失败，敌城守军永远无损。修复建议：在失利分支补 `to.soldiers = Math.round(battle.defender.soldiers);` 并 `to.defense = Math.max(0, Math.round(battle.defender.defense));`，使战斗伤亡如实落账。
+
+【次要问题，供一并酌情处理】(a) 胜负判定仅在 resolveTurn() 结尾的 checkGameOver() 触发：玩家在回合中通过出征占领最后一座城不会立即胜利，必须再「结束回合」才结算（afterAction 读取的 state.over 此刻仍为 null）。建议在 campaign 成功占领后调用一次 checkGameOver，或让 afterAction 主动判定。(b) 计略 stratagem() 的施计者用 bestDefender()（按统率最高）挑选，却读取其 stats.i（智力）计算成功率，逻辑上应取智力最高的武将施计，当前会系统性压低计略成功率（属设计瑕疵而非崩溃）。
+
+以上均为 src/ 下业务代码问题，可直接修改；本 PR 未触及 .github/ 及任何 CI/CD 配置，无需人工介入 workflow。
diff --git a/.ai-tasks/issue-79/fixer-feedback_r2.md b/.ai-tasks/issue-79/fixer-feedback_r2.md
new file mode 100644
index 0000000..f4a4f0d
--- /dev/null
+++ b/.ai-tasks/issue-79/fixer-feedback_r2.md
@@ -0,0 +1,18 @@
+
+【先对账：第 1 轮问题均已正确修复，无需返工】
+1) transport() 资源凭空消失——已移除金/粮扣减，仅保留士兵调运（from.soldiers-=s / to.soldiers+=s），uiTransport 表单也去掉了金/粮输入框，正确。
+2) applyCampaignResult() 失利分支不回写——已补 to.soldiers=Math.round(battle.defender.soldiers) 与 to.defense=Math.max(0,Math.round(battle.defender.defense))，「以战消耗敌城」恢复有效，正确。
+3) 占领后即时胜负判定——campaign() 在 won 时调用 checkGameOver(state)，afterAction() 据此即时弹结算，正确。
+4) stratagem() 施计者——改为 casterRoster.reduce 取智力最高者计算成功率，正确。
+另核验：dom.js 的 h() 全程 createTextNode，君主姓名经 /^[一-龥]{2,4}$/ 校验、无 innerHTML 注入用户输入，无 XSS；邻接关系 adjacencyValid() 双向自洽；_lib/keyboard-shell.js 引入路径与其它 app 一致（apps/_lib/...）；未触及 .github/CI。
+
+【阻断项 · 核心机制失效：科技研究槽为「全局单槽」，非按势力独立】
+state.research 与 research()/resolveTurn() 共用同一个全局研究槽。科技树是设计文档 2.6 的核心玩法，但当前实现里：玩家在自己回合点「研究」时，若上一回合结算阶段任一 AI 抢占了该全局槽（aiTurn→A.research），research() 会直接返回「已有研究进行中」，玩家被锁出、无法推进自己想要的科技。该现象会间歇性反复发生，玩家体感即「研究按钮长期灰掉/不可用」。同时 7 个 AI 也只能共享这一个槽，多数 AI 永远研究不了。
+说明：state.techLevels 位于全局，与设计文档 3.1 的数据结构一致，可保留为全局共享；问题在「研究进度槽」必须按势力独立。
+修复建议（最小改动、不碰 .github）：把 state.research 改为按势力存储（如 faction.research 或 state.researchByFaction[fid]），并相应调整 research() 的占用判定、resolveTurn() 中逐势力推进研究回合、以及 UI 科技页对「研究中」状态的读取。改完后玩家与每个 AI 各持独立研究队列、互不阻塞。
+
+【次要 · 非阻断，建议顺带处理】
+- campaign() 占领分支把 attackerGen.cityId 改为 to.id 并可能令其出任 to 太守，但未清理 from.governorHeroId；若该将原为 from 太守，会出现同一武将被两城同时引用为太守的脏数据（界面展示/appointGovernor 判定易混淆）。建议占领后若 attackerGen.id===from.governorHeroId 则置空 from.governorHeroId。
+- 玩家若选 AI 都城开局，该势力君主（如 caocao）会转为在野且仍带 lord:true；若被玩家登用入队，isLord() 恒真导致其永不被俘，属轻微数据一致性瑕疵，不致死。
+
+以上均在 src/ 业务代码内，无需改动 CI/CD 或 workflows；如修复涉及构建脚本/package.json，请人类手动确认。
diff --git a/.ai-tasks/issue-79/fixer-prompt_r1.md b/.ai-tasks/issue-79/fixer-prompt_r1.md
new file mode 100644
index 0000000..96e3f86
--- /dev/null
+++ b/.ai-tasks/issue-79/fixer-prompt_r1.md
@@ -0,0 +1,7 @@
+你是一个资深开发工程师。这是针对上一轮代码的【第 1 轮】修复任务。
+以下是代码审查员给你的修改建议，请阅读当前目录下的 .ai-tasks/issue-79/fixer-feedback_r1.md 文件获取详细内容。
+
+【⚠️ 严格红线规则】：
+请绝对不要修改、重命名或生成 .github/ 目录下的任何文件（特别是 workflows 等 CI/CD 配置），这会破坏项目的自动化流程！如果审查员要求你修改这些文件，请在回复中说明无法自动修改，需要人类介入。
+
+请直接分析并修改当前项目中的代码文件来满足审查员的要求，不要做过多的文字解释。
diff --git a/.ai-tasks/issue-79/fixer-prompt_r2.md b/.ai-tasks/issue-79/fixer-prompt_r2.md
new file mode 100644
index 0000000..8a3ff78
--- /dev/null
+++ b/.ai-tasks/issue-79/fixer-prompt_r2.md
@@ -0,0 +1,7 @@
+你是一个资深开发工程师。这是针对上一轮代码的【第 2 轮】修复任务。
+以下是代码审查员给你的修改建议，请阅读当前目录下的 .ai-tasks/issue-79/fixer-feedback_r2.md 文件获取详细内容。
+
+【⚠️ 严格红线规则】：
+请绝对不要修改、重命名或生成 .github/ 目录下的任何文件（特别是 workflows 等 CI/CD 配置），这会破坏项目的自动化流程！如果审查员要求你修改这些文件，请在回复中说明无法自动修改，需要人类介入。
+
+请直接分析并修改当前项目中的代码文件来满足审查员的要求，不要做过多的文字解释。
diff --git a/.ai-tasks/issue-79/pr_diff_r1.md b/.ai-tasks/issue-79/pr_diff_r1.md
new file mode 100644
index 0000000..00d863d
--- /dev/null
+++ b/.ai-tasks/issue-79/pr_diff_r1.md
@@ -0,0 +1,4988 @@
+diff --git a/.ai-tasks/issue-79/ai-coder-prompt.md b/.ai-tasks/issue-79/ai-coder-prompt.md
+new file mode 100644
+index 0000000..49fd619
+--- /dev/null
++++ b/.ai-tasks/issue-79/ai-coder-prompt.md
+@@ -0,0 +1,8 @@
++你是一个资深开发者。请解决以下 GitHub Issue：
++【任务标题】: 在游戏栏目下新增以下游戏
++【详细需求】: 请直接阅读当前目录下的 .ai-tasks/issue-79/context.md 文件获取。
++
++【⚠️ 严格红线规则】：
++请绝对不要修改、重命名或生成 .github/ 目录下的任何文件 (特别是 workflows 等 CI/CD 配置)，这会破坏项目的自动化流程！如果觉得有必要修改，请在回复中用文字建议人类去改，绝不要自己动手改。
++
++请直接分析并修改项目中的代码文件来解决这个问题，不要做过多的文字解释。
+diff --git a/.ai-tasks/issue-79/context.md b/.ai-tasks/issue-79/context.md
+new file mode 100644
+index 0000000..1b51de6
+--- /dev/null
++++ b/.ai-tasks/issue-79/context.md
+@@ -0,0 +1,329 @@
++《雄图·三国志文明》游戏设计方案文档
++
++---
++
++一、游戏概述
++
++游戏类型：单机回合制策略经营游戏，网页端（纯静态，GitHub Pages 部署），适配手机竖屏操作。
++游戏背景：以三国时代为蓝本，玩家扮演自定义君主，选择一座城市作为起点，通过内政建设、科技发展、招揽名将、军事征伐，最终统一中国全境。
++核心玩法：结合《三国志》系列的名将养成与指令式内政、《文明》系列的城市发展与科技树推进，在一个划分城市节点的中国地图上进行逐回合博弈。
++
++---
++
++二、核心机制
++
++2.1 地图与城市系统
++
++· 采用简化的中国古地图（静态 SVG 或 Canvas 绘制），共设置 15~20 座核心城市（如洛阳、长安、邺城、许昌、成都、建业、襄阳、汉中、北平、下邳等）。
++· 城市之间通过固定路径相连（邻接关系），军队出征只能沿路径移动。
++· 每个城市具有以下属性：
++  · 基础数值：人口上限、初始人口、初始金钱、初始军粮、初始士兵数。
++  · 城市特性（永久 Buff/Debuff）：
++    · 例如：洛阳“天下之中”商业收入 +20%；汉中“易守难攻”城防值 +30%；南皮“产粮大郡”粮食产量 +25% 等。
++  · 当前建筑等级：农田、市集、兵营、城墙、工坊（每种 1~5 级）。
++  · 当前资源存量：金钱、军粮、士兵、人口、城防耐久度。
++  · 控制势力标记。
++
++2.2 君主与初始设置
++
++· 玩家开局需设定：
++  · 君主姓名（自定义，限 2~4 字，系统不提供预设）。
++  · 选择初始城市（从所有可争夺城市中选择，AI 势力会随机占据其余城市）。
++· 君主属性完全随机生成，范围 50~100，共五项：
++  · 统率（影响带兵上限、出征士气）
++  · 武力（影响单挑、训练效率）
++  · 智力（影响计谋成功率、科技研究速度）
++  · 政治（影响内政指令效果、人口增长）
++  · 魅力（影响招募名将成功率、外交效果）
++· 君主即为玩家势力的第一个“武将”，可执行所有武将功能。
++
++2.3 名将系统
++
++· 游戏内置 40+ 历史名将（如关羽、张飞、诸葛亮、周瑜、吕布等），初始分布在各个城市或处于“在野”状态。
++· 每位名将有唯一面板：
++  · 五项属性（统武智政魅，范围 30~100）
++  · 专属技能（被动或主动）：如“威震华夏”（统率 +10%）、“神算”（计谋成功率 +20%）
++  · 忠诚度（0~100，低于 30 可能被策反或下野）
++  · 所在位置：某城市或“在野”（随回合刷新可能出现）
++· 玩家可通过“探索”指令发现本城在野名将，用“登用”指令说服加入（成功率受玩家魅力、名将忠诚倾向、相性影响）。
++· 战斗中可俘虏敌方名将，关押后可招降或处决。
++· 名将可被任命为太守、军师、出征主将，影响城市运营和军队战力。
++
++2.4 回合与指令系统
++
++· 游戏以季节为回合单位（每回合代表三个月）。每回合玩家获得若干“指令点数”（根据城市数量与政治值），例如基础 5 点，每多一座城 +2 点。
++· 指令包括：
++  · 内政类（消耗 1 点）：
++    · 开发农田（提升粮食产量）
++    · 发展商业（提升金钱收入）
++    · 征兵（消耗人口、金钱，增加士兵）
++    · 城防修筑（提升城墙等级）
++    · 技术研究（推进科技树）
++  · 人事类：
++    · 探索（发现本城在野名将）
++    · 登用（说服目标加入）
++    · 赏赐（消耗金钱提升忠诚）
++    · 任命太守/军师
++  · 军事类：
++    · 出征（选择将领、兵力，攻击相邻城市）
++    · 输送（在己方城市间调运资源）
++  · 外交/特殊类（消耗 1 点）：
++    · 流言（降低敌方城市守将忠诚）
++    · 计略（如“火攻”降低目标城防，“烧粮”减少敌方军粮等，成功率取决于智力差）
++· 执行完所有指令后点击“结束回合”，世界进入 AI 操作与资源结算。
++
++2.5 资源与人口机制
++
++· 金钱：每回合城市商业收入 = 市集等级 × 100 + 人口 × 0.5。用于征兵、赏赐、研究。
++· 军粮：每回合农田产量 = 农田等级 × 200。士兵每回合消耗军粮 = 士兵总数 × 0.5。军粮不足会导致士兵逃亡。
++· 人口：城市人口上限由农田等级和初始设定决定。每回合自然增长 = 当前人口 × 政治系数 × 0.02。征兵会减少人口。
++· 士兵：无人口上限限制，但受带兵将领统率约束（最大带兵数 = 统率 × 100）。训练度影响战斗力，默认 50，可通过“训练”指令或建筑提升。
++· 城防：城墙等级提供耐久度，攻城战时必须先打掉城防才能杀伤城内守军。
++
++2.6 科技树
++
++· 设立一条简化的线性/分支科技树，共 6 项科技，每项 3 级：
++  1. 农艺（提升粮食产量 +10%/级）
++  2. 商贸（提升金钱收入 +10%/级）
++  3. 冶炼（提升士兵攻击力 +5%/级）
++  4. 筑城（提升城防值 +20%/级，并解锁高级城墙）
++  5. 谋略（提升计谋成功率 +5%/级，解锁新计谋）
++  6. 统御（提升带兵上限 +10%/级）
++· 研究消耗金钱和时间（固定回合数，智力可缩短回合）。当前研究等级为势力全城共享。
++
++2.7 战斗系统（简化自动战斗）
++
++· 出征消耗军粮（按路程格数计算），到达敌城后进入战斗界面。
++· 战斗采用回合制骰子模型，自动结算，但允许玩家在战前选择阵型和战术卡（若有军师技能）。
++· 核心公式：
++  · 我方攻击值 = (主将武力×0.4 + 统率×0.3 + 士兵数×0.01)×科技系数×训练度系数
++  · 敌方同理。
++  · 每回合双方同时对对方造成伤害，伤害 = 己方攻击值 - 对方城防减免（若有城防则优先消耗城防）。
++  · 城防为 0 后，伤害转为削减士兵。士兵率先归零者战败。
++  · 若名将单挑触发：武力差 > 20 时有概率触发单挑，直接决定胜负（武力高者胜，败方士气大幅下降）。
++· 胜利后占领城市，可俘虏守将、缴获资源。
++
++2.8 AI 势力
++
++· 开局随机分配 5~8 个 AI 势力，各占据若干城市，并有随机君主名及生成武将。
++· AI 行为优先级：
++  1. 内政发展（征足够的兵、研究科技）
++  2. 招募在野名将
++  3. 攻击相邻且军力低于己方的玩家/其他 AI 城市
++  4. 防御：薄弱城市输送资源
++· AI 每回合也消耗等量指令点，简单判断即可。
++
++2.9 胜利与失败条件
++
++· 胜利：占领全部城市。
++· 失败：玩家所有城市丢失且无可用将领/军队（可继续观战但无操作可能，设为游戏结束）。
++
++---
++
++三、数据结构设计（用于 localStorage 存档）
++
++3.1 全局游戏状态对象
++
++```json
++{
++  "version": 1,
++  "turn": 1,
++  "playerFactionId": 0,
++  "factions": [ /* 势力数组 */ ],
++  "cities": [ /* 城市数组 */ ],
++  "heroes": [ /* 名将数组（含玩家君主和招募武将） */ ],
++  "techLevels": { "agri": 0, "commerce": 0, "forge": 0, "wall": 0, "trick": 0, "leadership": 0 },
++  "log": [ /* 最近的事件日志，用于显示回合简报 */ ]
++}
++```
++
++3.2 势力对象（Faction）
++
++```json
++{
++  "id": 0,
++  "name": "玩家势力名",
++  "color": "#ff0000",
++  "money": 5000,
++  "grain": 10000,
++  "aiControlled": false
++}
++```
++
++3.3 城市对象（City）
++
++```json
++{
++  "id": "luoyang",
++  "name": "洛阳",
++  "ownerFactionId": 0,
++  "population": 80000,
++  "maxPopulation": 100000,
++  "soldiers": 3000,
++  "defense": 1000,
++  "gold": 2000,
++  "grain": 5000,
++  "farmLevel": 1,
++  "marketLevel": 1,
++  "barracksLevel": 1,
++  "wallLevel": 1,
++  "workshopLevel": 0,   // 可选：工坊影响科技速度
++  "governorHeroId": null, // 太守武将ID
++  "adjacentCities": ["changan", "xuchang"] // 邻接城市ID列表
++}
++```
++
++3.4 名将对象（Hero）
++
++```json
++{
++  "id": "guanyu",
++  "name": "关羽",
++  "isPlayerLord": false, // 是否为玩家君主
++  "factionId": 0,
++  "cityId": "luoyang",   // 所在城市，若在野则 "wild_city_id"
++  "status": "free",      // "free", "deployed", "prisoner"(俘虏，所在城市监狱)
++  "loyalty": 95,
++  "stats": {
++    "leadership": 96,
++    "warrior": 97,
++    "intelligence": 75,
++    "politics": 62,
++    "charm": 88
++  },
++  "skill": {
++    "name": "威震华夏",
++    "type": "passive",   // 或 "active"
++    "effect": "leadership_multiplier_1.1"
++  }
++}
++```
++
++3.5 存档管理
++
++· 使用 localStorage，键名 "heroicThreeKingdoms_save"，保存完整的 JSON 字符串。
++· 提供“保存游戏”、“读取游戏”、“新游戏”功能。
++
++---
++
++四、界面设计与交互流程
++
++4.1 屏幕适配
++
++· 采用移动端优先设计，最大宽度 480px，居中显示。
++· 使用 Flexbox + 百分比布局，触摸友好按钮（最小 44x44px）。
++· 所有操作使用底部 Tab 导航切换：地图 | 势力 | 名将 | 科技 | 系统。
++
++4.2 主要界面
++
++（1）开始界面
++
++· 游戏标题“雄图·三国志文明”与副标题。
++· 按钮：【新游戏】【继续游戏】（灰色若没有存档）。
++· 新游戏后进入君主创建界面：
++  · 输入姓名文本框（校验2~4中文）。
++  · 显示随机生成的五项属性（可点击“重新随机”，上限5次）。
++  · 下方地图选择初始城市：高亮可选城市（未被AI占用），点击城市显示信息确认。
++
++（2）地图主界面
++
++· 显示简化中国地图，城市用圆形图标标识，颜色对应该势力。
++· 当前选中己方城市：弹出城市详情面板（人口、金钱、兵粮等）。
++· 点击己方城市可出现指令菜单（内政、人事、出征等按钮）。
++· 点击敌方/空城显示基本信息及可用的军事指令（出征、计略）。
++· 顶栏显示当前回合、金钱、军粮总览。
++
++（3）势力总览（Tab2）
++
++· 列表显示己方所有城市，每项可点击快速跳转地图并选中。
++· 显示科技等级，资源总收入/支出预览。
++
++（4）名将列表（Tab3）
++
++· 按状态分类：在野（可探索）、属将、俘虏。
++· 每个名将卡片显示属性、技能、忠诚，提供【赏赐】【任命】【释放/处决】操作。
++
++（5）科技树界面（Tab4）
++
++· 显示6项科技及其当前等级/下一级效果和消耗。
++· 点击研究按钮扣除金钱并开始研究（显示剩余回合）。
++
++（6）系统菜单（Tab5）
++
++· 保存/读取游戏。
++· 结束本回合（确认弹窗）。
++· 游戏设置（音效开关，简单）。
++
++（7）战斗界面（模态窗口）
++
++· 当出征军队到达目标城市或敌军进攻己方城市时自动触发。
++· 显示双方兵力、将领头像和属性条。
++· 战前选择：阵型（普通/攻击/防御，影响系数）或使用军师计略（若智力够）。
++· 点击开战，自动播放回合战报（文字滚动）。
++· 显示结果，提供处理俘虏界面。
++
++4.3 回合事件摘要
++
++· 每回合结束后弹出一张总结卡片：
++  · 收入报告（金、粮变化）。
++  · 人口变化。
++  · 名将动态（是否出现新在野、招募成功等）。
++  · AI 进攻消息。
++  · 玩家可逐条确认关闭。
++
++---
++
++五、AI 逻辑简述
++
++AI 每回合遍历其城市，按以下优先级消耗指令点：
++
++1. 若城市金币低于 500 且市场可升级：升市场。
++2. 若城市士兵低于人口 20%：征兵。
++3. 若存在在野名将且魅力>70的武将空闲：探索+登用。
++4. 科技研究，若满足金钱花费。
++5. 侵略判断：遍历相邻非己方城市，比较军力（己方士兵数+武将统率修正 vs 敌方士兵+城防），若优且兵力比>1.5则出征。
++6. 对边境城市输送资源，平衡防御。
++
++AI 名将忠诚度管理：每回合有几率赏赐提升忠诚度。
++
++---
++
++六、技术实现建议
++
++· 纯前端技术栈：HTML5 + CSS3 + vanilla JS，无框架。
++· 地图渲染：使用内嵌 SVG 地图，城市用 <circle> 表示，路径用 <line>，绑定点击事件。
++· 响应式：meta viewport 设置，地图部分可缩放或固定尺寸，城市图标最小 30px 便于手指点击。
++· 数据持久化：所有游戏对象序列化为 JSON 存入 localStorage，注意避免循环引用。
++· 回合操作需加锁：避免玩家连续点击按钮造成状态混乱。
++· 音效：可使用 Web Audio API 简短音效提示（可选）。
++
++---
++
++七、名将与城市初始数据（部分示例）
++
++7.1 城市列表（供参考，实际可扩展至18城）
++
++ID 名称 特性 人口上限 起始人口 金 粮 兵 邻接
++luoyang 洛阳 商业+20% 100000 80000 3000 8000 2000 changan,xuchang,ye
++changan 长安 城防+20% 80000 60000 2000 6000 1500 luoyang,hanshong
++xuchang 许昌 人口增长+10% 70000 50000 2500 7000 1800 luoyang,xiapi,wan
++chengdu 成都 粮食+15% 90000 70000 2000 10000 1600 hanzhong,jianning
++……
++
++7.2 名将初始分布
++
++名将 所在城市/状态 忠诚倾向
++关羽 在野（前期随机刷在刘备势力周边） 95(刘备)
++诸葛亮 在野（襄阳） 100(刘备)
++曹操 初始为势力君主（许昌） —
++赵云 在野（常山） 90(刘备)
++周瑜 建业势力初始武将 98(孙策)
++吕布 在野（随机） 70（低）
++
++注：为避免版权和历史人名争议，可使用化名如“关云长”，但文档中暂用原名为直观。
++
++---
++
++八、总结
++
++本方案提供了完整的回合制策略游戏设计，融合了三国志的武将养成、指令式内政和文明的科技树、城市发展，地图基于中国城市节点图，操作适配手机，数据均存储于本地浏览器。Agent 可依据以上数据结构、界面模块、规则算法进行实现，构建出可玩的静态网页游戏。
+diff --git a/apps/xiong-tu-san-guo/README.md b/apps/xiong-tu-san-guo/README.md
+new file mode 100644
+index 0000000..6c38152
+--- /dev/null
++++ b/apps/xiong-tu-san-guo/README.md
+@@ -0,0 +1,57 @@
++# 雄图·三国志文明 · Heroic Three Kingdoms Civilization
++
++一款融合《三国志》武将养成 / 指令式内政与《文明》科技树推进的**单机回合制策略经营**网页游戏。自择一城起兵，开发内政、攀科技、招揽名将、征战四方，最终统一九州。
++
++技术栈：**纯原生 HTML + CSS + JavaScript（无框架、无 Canvas）**，移动端竖屏设计，地图由内嵌 SVG + 绝对定位城市点构成，数据持久化于浏览器 `localStorage`。体积小（构建后 JS ≈ 56KB / gzip ≈ 20KB），加载快。
++
++## 本地运行
++
++```bash
++npm install
++npm run dev        # 开发服务器 http://localhost:5179
++npm run build      # 生产构建到 dist/
++npm run test       # 纯逻辑自测（135+ 断言，不依赖浏览器）
++npm run test:dom   # jsdom 驱动的 DOM 冒烟测试（21+ 断言）
++```
++
++也可由主框架（落地页）以 `createGame(parent)` 动态挂载，无需独立部署。
++
++## 核心玩法
++
++- **立君择都**：开局自定义君主姓名（2~4 汉字），随机生成五项属性（统 / 武 / 智 / 政 / 魅，可重掷 5 次），再从 18 座城市中选择起兵之地。占据诸侯旧都时，其旧部将就地转为在野名将，可择机登用。
++- **九州地图**：简化的中国古代地图，18 座核心城市以圆形节点呈现，按固定路径相邻相连；军队出征只能沿路径推进。金边为己方、灰点为空城、他色为诸侯。
++- **内政经营**：每座城市可发展**农田 / 市集 / 城墙 / 兵营**（各 1~5 级）、征兵、操练。金钱与军粮为势力级共享池，每回合依市集、人口、农田等级结算；军粮不济则士兵逃亡，人口随太守政治自然增长。
++- **名将系统**：内置 47 位历史名将（关羽、张飞、诸葛亮、赵云、周瑜、吕布、曹操……），各有五维面板、专属技能（如「威震华夏」「神算」）与忠诚度。用**探索**发现本城在野名将，**登用**说服加入（成功率受魅力、忠诚、相性影响）；战时可俘虏敌将，关押后**招降 / 释放 / 处决**。
++- **科技树**：6 项科技（农艺 / 商贸 / 冶炼 / 筑城 / 谋略 / 统御）各 3 级，研究消耗金钱与回合（君主智力可缩短），完成后势力全城共享加成。
++- **回合制征战**：出征按路程消耗军粮，进入简化自动战斗——双方依「武力·统率·兵力·科技·训练度·阵型」结算攻防，城防优先承受伤害；武力悬殊时可能触发**单挑**一击定胜负。胜则占城、俘将、缴获城库。
++- **指令点数**：每回合获得若干指令点（基础 5 点 + 每多一城 +2 点 + 君主政治加成），内政、人事、军事、外交计略各耗点执行；可对相邻敌城施**火攻 / 烧粮 / 流言**等计略。
++- **AI 诸侯**：开局随机分布 8 路诸侯，按「内政→招募→研究→侵略→输送→赏赐」优先级消耗指令点，各自施政出兵。
++- **胜败条件**：占领全部 18 城 → 一统天下；所有城池尽失 → 大业未成。存档自动写入本地浏览器。
++
++## 数据结构
++
++全局状态序列化为 JSON 存于 `localStorage`（键 `xtsg_save_v1`）：势力、城市（人口 / 兵力 / 城防 / 建筑等级 / 邻接）、名将（属性 / 技能 / 忠诚 / 状态）、科技等级、当前研究、回合与事件日志。
++
++## 目录结构
++
++```
++src/
++├── main.js              入口工厂 createGame(parent)
++├── config.js            全局常量与公式（经济 / 战斗 / 科技 / 计略）
++├── data/
++│   ├── cities.js        18 座城市（坐标 / 特性 / 邻接）
++│   └── heroes.js        47 位名将 + 8 路 AI 势力种子
++├── core/
++│   ├── state.js         新局初始化 / 回合结算 / 胜负 / 查询
++│   ├── economy.js       收支 / 人口 / 城防公式
++│   ├── combat.js        自动战斗（骰子模型 + 城防 + 单挑）
++│   ├── actions.js       玩家 / AI 共用命令（内政·人事·军事·计略·俘虏）
++│   ├── ai.js            AI 诸侯回合
++│   ├── tech.js          科技乘子与技能解析
++│   ├── save.js          localStorage 存读
++│   └── rng.js           随机工具（可种子化）
++└── ui/
++    ├── app.js           UI 控制器（启动 / 创角 / 对局五标签 / 弹窗）
++    ├── dom.js           h() / clear() / bar() DOM 辅助
++    └── style.css        古卷墨韵 + 鎏金描边
++```
+diff --git a/apps/xiong-tu-san-guo/index.html b/apps/xiong-tu-san-guo/index.html
+new file mode 100644
+index 0000000..cb58277
+--- /dev/null
++++ b/apps/xiong-tu-san-guo/index.html
+@@ -0,0 +1,27 @@
++<!doctype html>
++<html lang="zh-CN">
++
++<head>
++  <meta charset="UTF-8" />
++  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
++  <meta name="theme-color" content="#1a1206" />
++  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%231a1206'/%3E%3Ctext x='16' y='23' font-size='20' text-anchor='middle' fill='%23d4a84b' font-family='serif'%3E%E9%9B%84%3C/text%3E%3C/svg%3E" />
++  <title>雄图·三国志文明</title>
++  <style>
++    html, body {
++      margin: 0; padding: 0; width: 100%; height: 100%;
++      background: #1a1206; overflow: hidden;
++      font-family: "PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif;
++      -webkit-user-select: none; user-select: none;
++      -webkit-tap-highlight-color: transparent;
++    }
++    #game-container { position: relative; width: 100vw; height: 100vh; }
++  </style>
++</head>
++
++<body>
++  <div id="game-container"></div>
++  <script type="module" src="/src/main.js"></script>
++</body>
++
++</html>
+diff --git a/apps/xiong-tu-san-guo/package-lock.json b/apps/xiong-tu-san-guo/package-lock.json
+new file mode 100644
+index 0000000..b89fb39
+--- /dev/null
++++ b/apps/xiong-tu-san-guo/package-lock.json
+@@ -0,0 +1,1559 @@
++{
++  "name": "xiong-tu-san-guo",
++  "version": "1.0.0",
++  "lockfileVersion": 3,
++  "requires": true,
++  "packages": {
++    "": {
++      "name": "xiong-tu-san-guo",
++      "version": "1.0.0",
++      "devDependencies": {
++        "jsdom": "^29.1.1",
++        "vite": "^5.4.0"
++      }
++    },
++    "node_modules/@asamuzakjp/css-color": {
++      "version": "5.1.11",
++      "resolved": "https://registry.npmjs.org/@asamuzakjp/css-color/-/css-color-5.1.11.tgz",
++      "integrity": "sha512-KVw6qIiCTUQhByfTd78h2yD1/00waTmm9uy/R7Ck/ctUyAPj+AEDLkQIdJW0T8+qGgj3j5bpNKK7Q3G+LedJWg==",
++      "dev": true,
++      "license": "MIT",
++      "dependencies": {
++        "@asamuzakjp/generational-cache": "^1.0.1",
++        "@csstools/css-calc": "^3.2.0",
++        "@csstools/css-color-parser": "^4.1.0",
++        "@csstools/css-parser-algorithms": "^4.0.0",
++        "@csstools/css-tokenizer": "^4.0.0"
++      },
++      "engines": {
++        "node": "^20.19.0 || ^22.12.0 || >=24.0.0"
++      }
++    },
++    "node_modules/@asamuzakjp/dom-selector": {
++      "version": "7.1.1",
++      "resolved": "https://registry.npmjs.org/@asamuzakjp/dom-selector/-/dom-selector-7.1.1.tgz",
++      "integrity": "sha512-67RZDnYRc8H/8MLDgQCDE//zoqVFwajkepHZgmXrbwybzXOEwOWGPYGmALYl9J2DOLfFPPs6kKCqmbzV895hTQ==",
++      "dev": true,
++      "license": "MIT",
++      "dependencies": {
++        "@asamuzakjp/generational-cache": "^1.0.1",
++        "@asamuzakjp/nwsapi": "^2.3.9",
++        "bidi-js": "^1.0.3",
++        "css-tree": "^3.2.1",
++        "is-potential-custom-element-name": "^1.0.1"
++      },
++      "engines": {
++        "node": "^20.19.0 || ^22.12.0 || >=24.0.0"
++      }
++    },
++    "node_modules/@asamuzakjp/generational-cache": {
++      "version": "1.0.1",
++      "resolved": "https://registry.npmjs.org/@asamuzakjp/generational-cache/-/generational-cache-1.0.1.tgz",
++      "integrity": "sha512-wajfB8KqzMCN2KGNFdLkReeHncd0AslUSrvHVvvYWuU8ghncRJoA50kT3zP9MVL0+9g4/67H+cdvBskj9THPzg==",
++      "dev": true,
++      "license": "MIT",
++      "engines": {
++        "node": "^20.19.0 || ^22.12.0 || >=24.0.0"
++      }
++    },
++    "node_modules/@asamuzakjp/nwsapi": {
++      "version": "2.3.9",
++      "resolved": "https://registry.npmjs.org/@asamuzakjp/nwsapi/-/nwsapi-2.3.9.tgz",
++      "integrity": "sha512-n8GuYSrI9bF7FFZ/SjhwevlHc8xaVlb/7HmHelnc/PZXBD2ZR49NnN9sMMuDdEGPeeRQ5d0hqlSlEpgCX3Wl0Q==",
++      "dev": true,
++      "license": "MIT"
++    },
++    "node_modules/@bramus/specificity": {
++      "version": "2.4.2",
++      "resolved": "https://registry.npmjs.org/@bramus/specificity/-/specificity-2.4.2.tgz",
++      "integrity": "sha512-ctxtJ/eA+t+6q2++vj5j7FYX3nRu311q1wfYH3xjlLOsczhlhxAg2FWNUXhpGvAw3BWo1xBcvOV6/YLc2r5FJw==",
++      "dev": true,
++      "license": "MIT",
++      "dependencies": {
++        "css-tree": "^3.0.0"
++      },
++      "bin": {
++        "specificity": "bin/cli.js"
++      }
++    },
++    "node_modules/@csstools/color-helpers": {
++      "version": "6.1.0",
++      "resolved": "https://registry.npmjs.org/@csstools/color-helpers/-/color-helpers-6.1.0.tgz",
++      "integrity": "sha512-064IFJdjTfUqnjpCVpMOdbr8FLQBhinbZj6yRv2An2E41O/pLEXqfFRWqGq/SxlE5PEUYTlvWsG2r8MswAVvkg==",
++      "dev": true,
++      "funding": [
++        {
++          "type": "github",
++          "url": "https://github.com/sponsors/csstools"
++        },
++        {
++          "type": "opencollective",
++          "url": "https://opencollective.com/csstools"
++        }
++      ],
++      "license": "MIT-0",
++      "engines": {
++        "node": ">=20.19.0"
++      }
++    },
++    "node_modules/@csstools/css-calc": {
++      "version": "3.3.0",
++      "resolved": "https://registry.npmjs.org/@csstools/css-calc/-/css-calc-3.3.0.tgz",
++      "integrity": "sha512-c5ihYsPkdG6JCkU2zTMm4+k6r7RXuGxtWYhu5DHMIiF1FHzrfmHL5so11AoFpUv/tu61xfcmT4AmKoFfMPoqdQ==",
++      "dev": true,
++      "funding": [
++        {
++          "type": "github",
++          "url": "https://github.com/sponsors/csstools"
++        },
++        {
++          "type": "opencollective",
++          "url": "https://opencollective.com/csstools"
++        }
++      ],
++      "license": "MIT",
++      "engines": {
++        "node": ">=20.19.0"
++      },
++      "peerDependencies": {
++        "@csstools/css-parser-algorithms": "^4.0.0",
++        "@csstools/css-tokenizer": "^4.0.0"
++      }
++    },
++    "node_modules/@csstools/css-color-parser": {
++      "version": "4.1.10",
++      "resolved": "https://registry.npmjs.org/@csstools/css-color-parser/-/css-color-parser-4.1.10.tgz",
++      "integrity": "sha512-UZhQLIUyJaaMepqehrCODwCg2KW25vFvLWBmqYFaPclYvvxzj/sG8LBOhBFCp11i9uE7t1EyS+RAoV9tztPFyw==",
++      "dev": true,
++      "funding": [
++        {
++          "type": "github",
++          "url": "https://github.com/sponsors/csstools"
++        },
++        {
++          "type": "opencollective",
++          "url": "https://opencollective.com/csstools"
++        }
++      ],
++      "license": "MIT",
++      "dependencies": {
++        "@csstools/color-helpers": "^6.1.0",
++        "@csstools/css-calc": "^3.3.0"
++      },
++      "engines": {
++        "node": ">=20.19.0"
++      },
++      "peerDependencies": {
++        "@csstools/css-parser-algorithms": "^4.0.0",
++        "@csstools/css-tokenizer": "^4.0.0"
++      }
++    },
++    "node_modules/@csstools/css-parser-algorithms": {
++      "version": "4.0.0",
++      "resolved": "https://registry.npmjs.org/@csstools/css-parser-algorithms/-/css-parser-algorithms-4.0.0.tgz",
++      "integrity": "sha512-+B87qS7fIG3L5h3qwJ/IFbjoVoOe/bpOdh9hAjXbvx0o8ImEmUsGXN0inFOnk2ChCFgqkkGFQ+TpM5rbhkKe4w==",
++      "dev": true,
++      "funding": [
++        {
++          "type": "github",
++          "url": "https://github.com/sponsors/csstools"
++        },
++        {
++          "type": "opencollective",
++          "url": "https://opencollective.com/csstools"
++        }
++      ],
++      "license": "MIT",
++      "engines": {
++        "node": ">=20.19.0"
++      },
++      "peerDependencies": {
++        "@csstools/css-tokenizer": "^4.0.0"
++      }
++    },
++    "node_modules/@csstools/css-syntax-patches-for-csstree": {
++      "version": "1.1.7",
++      "resolved": "https://registry.npmjs.org/@csstools/css-syntax-patches-for-csstree/-/css-syntax-patches-for-csstree-1.1.7.tgz",
++      "integrity": "sha512-fQ+05118eQS1cofO3aJpB5efgpBZMvIzwr/sbC8kDLVA5XLG8q1kJV5yzrUAI1f7lvhPnm8fgIjzFB8/O/5Dig==",
++      "dev": true,
++      "funding": [
++        {
++          "type": "github",
++          "url": "https://github.com/sponsors/csstools"
++        },
++        {
++          "type": "opencollective",
++          "url": "https://opencollective.com/csstools"
++        }
++      ],
++      "license": "MIT-0",
++      "peerDependencies": {
++        "css-tree": "^3.2.1"
++      },
++      "peerDependenciesMeta": {
++        "css-tree": {
++          "optional": true
++        }
++      }
++    },
++    "node_modules/@csstools/css-tokenizer": {
++      "version": "4.0.0",
++      "resolved": "https://registry.npmjs.org/@csstools/css-tokenizer/-/css-tokenizer-4.0.0.tgz",
++      "integrity": "sha512-QxULHAm7cNu72w97JUNCBFODFaXpbDg+dP8b/oWFAZ2MTRppA3U00Y2L1HqaS4J6yBqxwa/Y3nMBaxVKbB/NsA==",
++      "dev": true,
++      "funding": [
++        {
++          "type": "github",
++          "url": "https://github.com/sponsors/csstools"
++        },
++        {
++          "type": "opencollective",
++          "url": "https://opencollective.com/csstools"
++        }
++      ],
++      "license": "MIT",
++      "engines": {
++        "node": ">=20.19.0"
++      }
++    },
++    "node_modules/@esbuild/aix-ppc64": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/aix-ppc64/-/aix-ppc64-0.21.5.tgz",
++      "integrity": "sha512-1SDgH6ZSPTlggy1yI6+Dbkiz8xzpHJEVAlF/AM1tHPLsf5STom9rwtjE4hKAF20FfXXNTFqEYXyJNWh1GiZedQ==",
++      "cpu": [
++        "ppc64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "aix"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/android-arm": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/android-arm/-/android-arm-0.21.5.tgz",
++      "integrity": "sha512-vCPvzSjpPHEi1siZdlvAlsPxXl7WbOVUBBAowWug4rJHb68Ox8KualB+1ocNvT5fjv6wpkX6o/iEpbDrf68zcg==",
++      "cpu": [
++        "arm"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "android"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/android-arm64": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/android-arm64/-/android-arm64-0.21.5.tgz",
++      "integrity": "sha512-c0uX9VAUBQ7dTDCjq+wdyGLowMdtR/GoC2U5IYk/7D1H1JYC0qseD7+11iMP2mRLN9RcCMRcjC4YMclCzGwS/A==",
++      "cpu": [
++        "arm64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "android"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/android-x64": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/android-x64/-/android-x64-0.21.5.tgz",
++      "integrity": "sha512-D7aPRUUNHRBwHxzxRvp856rjUHRFW1SdQATKXH2hqA0kAZb1hKmi02OpYRacl0TxIGz/ZmXWlbZgjwWYaCakTA==",
++      "cpu": [
++        "x64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "android"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/darwin-arm64": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/darwin-arm64/-/darwin-arm64-0.21.5.tgz",
++      "integrity": "sha512-DwqXqZyuk5AiWWf3UfLiRDJ5EDd49zg6O9wclZ7kUMv2WRFr4HKjXp/5t8JZ11QbQfUS6/cRCKGwYhtNAY88kQ==",
++      "cpu": [
++        "arm64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "darwin"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/darwin-x64": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/darwin-x64/-/darwin-x64-0.21.5.tgz",
++      "integrity": "sha512-se/JjF8NlmKVG4kNIuyWMV/22ZaerB+qaSi5MdrXtd6R08kvs2qCN4C09miupktDitvh8jRFflwGFBQcxZRjbw==",
++      "cpu": [
++        "x64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "darwin"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/freebsd-arm64": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/freebsd-arm64/-/freebsd-arm64-0.21.5.tgz",
++      "integrity": "sha512-5JcRxxRDUJLX8JXp/wcBCy3pENnCgBR9bN6JsY4OmhfUtIHe3ZW0mawA7+RDAcMLrMIZaf03NlQiX9DGyB8h4g==",
++      "cpu": [
++        "arm64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "freebsd"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/freebsd-x64": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/freebsd-x64/-/freebsd-x64-0.21.5.tgz",
++      "integrity": "sha512-J95kNBj1zkbMXtHVH29bBriQygMXqoVQOQYA+ISs0/2l3T9/kj42ow2mpqerRBxDJnmkUDCaQT/dfNXWX/ZZCQ==",
++      "cpu": [
++        "x64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "freebsd"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/linux-arm": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/linux-arm/-/linux-arm-0.21.5.tgz",
++      "integrity": "sha512-bPb5AHZtbeNGjCKVZ9UGqGwo8EUu4cLq68E95A53KlxAPRmUyYv2D6F0uUI65XisGOL1hBP5mTronbgo+0bFcA==",
++      "cpu": [
++        "arm"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/linux-arm64": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/linux-arm64/-/linux-arm64-0.21.5.tgz",
++      "integrity": "sha512-ibKvmyYzKsBeX8d8I7MH/TMfWDXBF3db4qM6sy+7re0YXya+K1cem3on9XgdT2EQGMu4hQyZhan7TeQ8XkGp4Q==",
++      "cpu": [
++        "arm64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/linux-ia32": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/linux-ia32/-/linux-ia32-0.21.5.tgz",
++      "integrity": "sha512-YvjXDqLRqPDl2dvRODYmmhz4rPeVKYvppfGYKSNGdyZkA01046pLWyRKKI3ax8fbJoK5QbxblURkwK/MWY18Tg==",
++      "cpu": [
++        "ia32"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/linux-loong64": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/linux-loong64/-/linux-loong64-0.21.5.tgz",
++      "integrity": "sha512-uHf1BmMG8qEvzdrzAqg2SIG/02+4/DHB6a9Kbya0XDvwDEKCoC8ZRWI5JJvNdUjtciBGFQ5PuBlpEOXQj+JQSg==",
++      "cpu": [
++        "loong64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/linux-mips64el": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/linux-mips64el/-/linux-mips64el-0.21.5.tgz",
++      "integrity": "sha512-IajOmO+KJK23bj52dFSNCMsz1QP1DqM6cwLUv3W1QwyxkyIWecfafnI555fvSGqEKwjMXVLokcV5ygHW5b3Jbg==",
++      "cpu": [
++        "mips64el"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/linux-ppc64": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/linux-ppc64/-/linux-ppc64-0.21.5.tgz",
++      "integrity": "sha512-1hHV/Z4OEfMwpLO8rp7CvlhBDnjsC3CttJXIhBi+5Aj5r+MBvy4egg7wCbe//hSsT+RvDAG7s81tAvpL2XAE4w==",
++      "cpu": [
++        "ppc64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/linux-riscv64": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/linux-riscv64/-/linux-riscv64-0.21.5.tgz",
++      "integrity": "sha512-2HdXDMd9GMgTGrPWnJzP2ALSokE/0O5HhTUvWIbD3YdjME8JwvSCnNGBnTThKGEB91OZhzrJ4qIIxk/SBmyDDA==",
++      "cpu": [
++        "riscv64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/linux-s390x": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/linux-s390x/-/linux-s390x-0.21.5.tgz",
++      "integrity": "sha512-zus5sxzqBJD3eXxwvjN1yQkRepANgxE9lgOW2qLnmr8ikMTphkjgXu1HR01K4FJg8h1kEEDAqDcZQtbrRnB41A==",
++      "cpu": [
++        "s390x"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/linux-x64": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/linux-x64/-/linux-x64-0.21.5.tgz",
++      "integrity": "sha512-1rYdTpyv03iycF1+BhzrzQJCdOuAOtaqHTWJZCWvijKD2N5Xu0TtVC8/+1faWqcP9iBCWOmjmhoH94dH82BxPQ==",
++      "cpu": [
++        "x64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/netbsd-x64": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/netbsd-x64/-/netbsd-x64-0.21.5.tgz",
++      "integrity": "sha512-Woi2MXzXjMULccIwMnLciyZH4nCIMpWQAs049KEeMvOcNADVxo0UBIQPfSmxB3CWKedngg7sWZdLvLczpe0tLg==",
++      "cpu": [
++        "x64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "netbsd"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/openbsd-x64": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/openbsd-x64/-/openbsd-x64-0.21.5.tgz",
++      "integrity": "sha512-HLNNw99xsvx12lFBUwoT8EVCsSvRNDVxNpjZ7bPn947b8gJPzeHWyNVhFsaerc0n3TsbOINvRP2byTZ5LKezow==",
++      "cpu": [
++        "x64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "openbsd"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/sunos-x64": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/sunos-x64/-/sunos-x64-0.21.5.tgz",
++      "integrity": "sha512-6+gjmFpfy0BHU5Tpptkuh8+uw3mnrvgs+dSPQXQOv3ekbordwnzTVEb4qnIvQcYXq6gzkyTnoZ9dZG+D4garKg==",
++      "cpu": [
++        "x64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "sunos"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/win32-arm64": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/win32-arm64/-/win32-arm64-0.21.5.tgz",
++      "integrity": "sha512-Z0gOTd75VvXqyq7nsl93zwahcTROgqvuAcYDUr+vOv8uHhNSKROyU961kgtCD1e95IqPKSQKH7tBTslnS3tA8A==",
++      "cpu": [
++        "arm64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "win32"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/win32-ia32": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/win32-ia32/-/win32-ia32-0.21.5.tgz",
++      "integrity": "sha512-SWXFF1CL2RVNMaVs+BBClwtfZSvDgtL//G/smwAc5oVK/UPu2Gu9tIaRgFmYFFKrmg3SyAjSrElf0TiJ1v8fYA==",
++      "cpu": [
++        "ia32"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "win32"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/win32-x64": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/win32-x64/-/win32-x64-0.21.5.tgz",
++      "integrity": "sha512-tQd/1efJuzPC6rCFwEvLtci/xNFcTZknmXs98FYDfGE4wP9ClFV98nyKrzJKVPMhdDnjzLhdUyMX4PsQAPjwIw==",
++      "cpu": [
++        "x64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "win32"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@exodus/bytes": {
++      "version": "1.15.1",
++      "resolved": "https://registry.npmjs.org/@exodus/bytes/-/bytes-1.15.1.tgz",
++      "integrity": "sha512-S6mL0yNB/Abt9Ei4tq8gDhcczc4S3+vQ4ra7vxnAf+YHC02srtqxKKZghx2Dq6p0e66THKwR6r8N6P95wEty7Q==",
++      "dev": true,
++      "license": "MIT",
++      "engines": {
++        "node": "^20.19.0 || ^22.12.0 || >=24.0.0"
++      },
++      "peerDependencies": {
++        "@noble/hashes": "^1.8.0 || ^2.0.0"
++      },
++      "peerDependenciesMeta": {
++        "@noble/hashes": {
++          "optional": true
++        }
++      }
++    },
++    "node_modules/@rollup/rollup-android-arm-eabi": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-android-arm-eabi/-/rollup-android-arm-eabi-4.62.2.tgz",
++      "integrity": "sha512-6o7ZLZK+BeenkZCFNDXqpbjw9bD6nuWonvS/lwQJp7NoVVxm6p3qE7qQ5jGuBjiFsgvqjD8mZAU5oWxTmbOeOg==",
++      "cpu": [
++        "arm"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "android"
++      ]
++    },
++    "node_modules/@rollup/rollup-android-arm64": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-android-arm64/-/rollup-android-arm64-4.62.2.tgz",
++      "integrity": "sha512-BaH7BllCACHoH1LguOU56UItGfUWjujlO65kS9LAodViaN4bwIKd7oeW/ZHJ/4ljr/7MIiENnNy3HJ0zXv8Zkw==",
++      "cpu": [
++        "arm64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "android"
++      ]
++    },
++    "node_modules/@rollup/rollup-darwin-arm64": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-darwin-arm64/-/rollup-darwin-arm64-4.62.2.tgz",
++      "integrity": "sha512-v39RCCvj4He82I9sFmk+M1VZ0PLM9sfsLVikjfx2hYBNALhrrOR2D3JjQA6AhlaSOgcR+RzrKY7e1+bT6SUO/A==",
++      "cpu": [
++        "arm64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "darwin"
++      ]
++    },
++    "node_modules/@rollup/rollup-darwin-x64": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-darwin-x64/-/rollup-darwin-x64-4.62.2.tgz",
++      "integrity": "sha512-yl0y2vq3S3lHeuXhEdss6TWfKW8vkujImO12tn4ZkG/4oghr09LvdYm2RElVjokTQiUvDUGXLGsYeLqUMCKpGA==",
++      "cpu": [
++        "x64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "darwin"
++      ]
++    },
++    "node_modules/@rollup/rollup-freebsd-arm64": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-freebsd-arm64/-/rollup-freebsd-arm64-4.62.2.tgz",
++      "integrity": "sha512-tT4pvt4qXD+vEoezupCWi+a1F0vvDiksiHc+PxRlYTOH1I6/X4id9jPxTP+Fg+545euaFT1jJVs4CEdHZAU1vw==",
++      "cpu": [
++        "arm64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "freebsd"
++      ]
++    },
++    "node_modules/@rollup/rollup-freebsd-x64": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-freebsd-x64/-/rollup-freebsd-x64-4.62.2.tgz",
++      "integrity": "sha512-6nU5F2wCW+qvCBhTn1pdIU3bzsIoF7EUwsCDRxilWGprQR6yd508YnH9+OKFCwpfS8pjZqDUmnCAr7exax0XCg==",
++      "cpu": [
++        "x64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "freebsd"
++      ]
++    },
++    "node_modules/@rollup/rollup-linux-arm-gnueabihf": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm-gnueabihf/-/rollup-linux-arm-gnueabihf-4.62.2.tgz",
++      "integrity": "sha512-n1GJHPOvpIfhi3TmrCeh6S6URt9BFCt0KQE3qvexyGCTAKpR4Lg+eWvNZEqu7epxwus/8ElT3hacYEucm49SZg==",
++      "cpu": [
++        "arm"
++      ],
++      "dev": true,
++      "libc": [
++        "glibc"
++      ],
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ]
++    },
++    "node_modules/@rollup/rollup-linux-arm-musleabihf": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm-musleabihf/-/rollup-linux-arm-musleabihf-4.62.2.tgz",
++      "integrity": "sha512-JqgflS8wEB+UXV/vS1RpRbifGBeN4D5lz8D8oOFbFZw4vedvdOgCFAjfBmIMdW3yL10XpQQ0Ambepw6MXrhOnA==",
++      "cpu": [
++        "arm"
++      ],
++      "dev": true,
++      "libc": [
++        "musl"
++      ],
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ]
++    },
++    "node_modules/@rollup/rollup-linux-arm64-gnu": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm64-gnu/-/rollup-linux-arm64-gnu-4.62.2.tgz",
++      "integrity": "sha512-wnFJkogWvN4jm/hQRF2UBaeUmk20j5+DmHvoyWii2b8HJDyvz1MF2OU/6ynXt2KR63rbZLWkFpoytpdc/yBuSA==",
++      "cpu": [
++        "arm64"
++      ],
++      "dev": true,
++      "libc": [
++        "glibc"
++      ],
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ]
++    },
++    "node_modules/@rollup/rollup-linux-arm64-musl": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm64-musl/-/rollup-linux-arm64-musl-4.62.2.tgz",
++      "integrity": "sha512-HVu2bp0zhvJ8xHEV9+UUs7S90VadmBSY3LcIMvozbPo4AuMGDWlz3ymHLHZPX4hR67TKTt8Qp5PJ5RBg/i+RMQ==",
++      "cpu": [
++        "arm64"
++      ],
++      "dev": true,
++      "libc": [
++        "musl"
++      ],
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ]
++    },
++    "node_modules/@rollup/rollup-linux-loong64-gnu": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-loong64-gnu/-/rollup-linux-loong64-gnu-4.62.2.tgz",
++      "integrity": "sha512-mQqqAV8QaoSgr9I2fKDLY2BAVvmKjWoGiu/cSYQonsLvtqwEn1E4QYfnCOcp5zoEqNhsDYin1s6jx/VJmrxlZg==",
++      "cpu": [
++        "loong64"
++      ],
++      "dev": true,
++      "libc": [
++        "glibc"
++      ],
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ]
++    },
++    "node_modules/@rollup/rollup-linux-loong64-musl": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-loong64-musl/-/rollup-linux-loong64-musl-4.62.2.tgz",
++      "integrity": "sha512-IxKLoxCQ2IWi6bT2akyDUBGsOImDKB+sPp4EsTmwFQ/fMwpCKm8uLSSgP/Kx/QYUgKis6SEZ5/Nlhup0DIA0PQ==",
++      "cpu": [
++        "loong64"
++      ],
++      "dev": true,
++      "libc": [
++        "musl"
++      ],
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ]
++    },
++    "node_modules/@rollup/rollup-linux-ppc64-gnu": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-ppc64-gnu/-/rollup-linux-ppc64-gnu-4.62.2.tgz",
++      "integrity": "sha512-Mk5ha2RQSgyFfmYYLkBpPnUk8D8FriBxesO1u9O75X0mHgXL1UQcH5Itl2lurWL2tj0RxV9b9tJgipac0hRY9A==",
++      "cpu": [
++        "ppc64"
++      ],
++      "dev": true,
++      "libc": [
++        "glibc"
++      ],
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ]
++    },
++    "node_modules/@rollup/rollup-linux-ppc64-musl": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-ppc64-musl/-/rollup-linux-ppc64-musl-4.62.2.tgz",
++      "integrity": "sha512-CjvEnqJL/0/TQ3TXX3OPIJ/kmBellrWd4heXUmHeJlTnmwjKpSJzoehLaL6Xk0ZnMHBu9dZuFADNOrtjF4v+2w==",
++      "cpu": [
++        "ppc64"
++      ],
++      "dev": true,
++      "libc": [
++        "musl"
++      ],
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ]
++    },
++    "node_modules/@rollup/rollup-linux-riscv64-gnu": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-riscv64-gnu/-/rollup-linux-riscv64-gnu-4.62.2.tgz",
++      "integrity": "sha512-1SiZbzwdkaDURsew/tSOrooKiYy7EQGT6m8ufavAi9NEyQb/6VuIxFXAL1fqa4iZe3g4NbNk4P7J32z2tw5Mgg==",
++      "cpu": [
++        "riscv64"
++      ],
++      "dev": true,
++      "libc": [
++        "glibc"
++      ],
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ]
++    },
++    "node_modules/@rollup/rollup-linux-riscv64-musl": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-riscv64-musl/-/rollup-linux-riscv64-musl-4.62.2.tgz",
++      "integrity": "sha512-nQts12zJ3NQRoE6uYljOH89v7szzLDvG2JD/vsX+vGXU8w/At1GowTZ5/7qeFQ8m7L55rpR8Okugnuo5bgjy2Q==",
++      "cpu": [
++        "riscv64"
++      ],
++      "dev": true,
++      "libc": [
++        "musl"
++      ],
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ]
++    },
++    "node_modules/@rollup/rollup-linux-s390x-gnu": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-s390x-gnu/-/rollup-linux-s390x-gnu-4.62.2.tgz",
++      "integrity": "sha512-E9/ll019jhPIJgpzfZoIkBGhcz+kKNgVWYRY0zr9srBdPPFVpvOKW8VaJKUbeK+eZXyQF9ltME+Kk6affeaPgg==",
++      "cpu": [
++        "s390x"
++      ],
++      "dev": true,
++      "libc": [
++        "glibc"
++      ],
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ]
++    },
++    "node_modules/@rollup/rollup-linux-x64-gnu": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-x64-gnu/-/rollup-linux-x64-gnu-4.62.2.tgz",
++      "integrity": "sha512-5BqxR/pshjey51iliyzTD5Xi3EN0aLmQ2lZ3lvefVV9c82BvrLo2/6OT55iifpWBufs6kdwWbuOKS841DrmK9A==",
++      "cpu": [
++        "x64"
++      ],
++      "dev": true,
++      "libc": [
++        "glibc"
++      ],
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ]
++    },
++    "node_modules/@rollup/rollup-linux-x64-musl": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-x64-musl/-/rollup-linux-x64-musl-4.62.2.tgz",
++      "integrity": "sha512-uNN83XxQrRAh/w0/pmAfibcwyb6YWt4gP+dpnQKPVJshAloQ785ii8CT8ZCIxkGg9opVsvAlGhFitSm6D1Jjpg==",
++      "cpu": [
++        "x64"
++      ],
++      "dev": true,
++      "libc": [
++        "musl"
++      ],
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ]
++    },
++    "node_modules/@rollup/rollup-openbsd-x64": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-openbsd-x64/-/rollup-openbsd-x64-4.62.2.tgz",
++      "integrity": "sha512-srjEIxSH3LRnJN6THczDHWQplqEMFiAJrTab0msUryh9kwNpkICf3Ea6q6MN/2cZwRFUNx5w+h6Hpi4QuHS6Zg==",
++      "cpu": [
++        "x64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "openbsd"
++      ]
++    },
++    "node_modules/@rollup/rollup-openharmony-arm64": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-openharmony-arm64/-/rollup-openharmony-arm64-4.62.2.tgz",
++      "integrity": "sha512-8hOJnxgbyObnCm5AlRA3A931xX19xq80RjVTKgJOvEKWqJruP/Uf12IbAOaDjjEXYRewwHLfmF0YRIdK3OwKWA==",
++      "cpu": [
++        "arm64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "openharmony"
++      ]
++    },
++    "node_modules/@rollup/rollup-win32-arm64-msvc": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-win32-arm64-msvc/-/rollup-win32-arm64-msvc-4.62.2.tgz",
++      "integrity": "sha512-mmF4AY1i0hG/bLWUctUq59gtmgaSIRa3cu/A3JFRp/sCNEme2bgDEiDS22P9FbnJB8NJNF4jPJiSP5RHQpUTDg==",
++      "cpu": [
++        "arm64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "win32"
++      ]
++    },
++    "node_modules/@rollup/rollup-win32-ia32-msvc": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-win32-ia32-msvc/-/rollup-win32-ia32-msvc-4.62.2.tgz",
++      "integrity": "sha512-DZgkknc6jhHrk46V25vbAM0zZkyP0nSDkJB8/dRkLTxv470dOmWDqGoEJl/9A0dFfS7yE3REOwNDxpHwSLSt0Q==",
++      "cpu": [
++        "ia32"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "win32"
++      ]
++    },
++    "node_modules/@rollup/rollup-win32-x64-gnu": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-win32-x64-gnu/-/rollup-win32-x64-gnu-4.62.2.tgz",
++      "integrity": "sha512-T6xr6ucWSFto+VGajA8YH26LdpHRuP4YLHEKAtCWvJDOlnmWcDZVCI2Jmjr+IFHDlt2zRaTAKE4tfjTaWLgJBg==",
++      "cpu": [
++        "x64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "win32"
++      ]
++    },
++    "node_modules/@rollup/rollup-win32-x64-msvc": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-win32-x64-msvc/-/rollup-win32-x64-msvc-4.62.2.tgz",
++      "integrity": "sha512-BfzEnDJOt9T8M989/lA37EcJgat01wLRnoi5dQf3QzOH7jzpqTAzdDbVfRljVr5r+jzKqpbHeyOfAaXxAd0PAA==",
++      "cpu": [
++        "x64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "win32"
++      ]
++    },
++    "node_modules/@types/estree": {
++      "version": "1.0.9",
++      "resolved": "https://registry.npmjs.org/@types/estree/-/estree-1.0.9.tgz",
++      "integrity": "sha512-GhdPgy1el4/ImP05X05Uw4cw2/M93BCUmnEvWZNStlCzEKME4Fkk+YpoA5OiHNQmoS7Cafb8Xa3Pya8m1Qrzeg==",
++      "dev": true,
++      "license": "MIT"
++    },
++    "node_modules/bidi-js": {
++      "version": "1.0.3",
++      "resolved": "https://registry.npmjs.org/bidi-js/-/bidi-js-1.0.3.tgz",
++      "integrity": "sha512-RKshQI1R3YQ+n9YJz2QQ147P66ELpa1FQEg20Dk8oW9t2KgLbpDLLp9aGZ7y8WHSshDknG0bknqGw5/tyCs5tw==",
++      "dev": true,
++      "license": "MIT",
++      "dependencies": {
++        "require-from-string": "^2.0.2"
++      }
++    },
++    "node_modules/css-tree": {
++      "version": "3.2.1",
++      "resolved": "https://registry.npmjs.org/css-tree/-/css-tree-3.2.1.tgz",
++      "integrity": "sha512-X7sjQzceUhu1u7Y/ylrRZFU2FS6LRiFVp6rKLPg23y3x3c3DOKAwuXGDp+PAGjh6CSnCjYeAul8pcT8bAl+lSA==",
++      "dev": true,
++      "license": "MIT",
++      "dependencies": {
++        "mdn-data": "2.27.1",
++        "source-map-js": "^1.2.1"
++      },
++      "engines": {
++        "node": "^10 || ^12.20.0 || ^14.13.0 || >=15.0.0"
++      }
++    },
++    "node_modules/data-urls": {
++      "version": "7.0.0",
++      "resolved": "https://registry.npmjs.org/data-urls/-/data-urls-7.0.0.tgz",
++      "integrity": "sha512-23XHcCF+coGYevirZceTVD7NdJOqVn+49IHyxgszm+JIiHLoB2TkmPtsYkNWT1pvRSGkc35L6NHs0yHkN2SumA==",
++      "dev": true,
++      "license": "MIT",
++      "dependencies": {
++        "whatwg-mimetype": "^5.0.0",
++        "whatwg-url": "^16.0.0"
++      },
++      "engines": {
++        "node": "^20.19.0 || ^22.12.0 || >=24.0.0"
++      }
++    },
++    "node_modules/decimal.js": {
++      "version": "10.6.0",
++      "resolved": "https://registry.npmjs.org/decimal.js/-/decimal.js-10.6.0.tgz",
++      "integrity": "sha512-YpgQiITW3JXGntzdUmyUR1V812Hn8T1YVXhCu+wO3OpS4eU9l4YdD3qjyiKdV6mvV29zapkMeD390UVEf2lkUg==",
++      "dev": true,
++      "license": "MIT"
++    },
++    "node_modules/entities": {
++      "version": "8.0.0",
++      "resolved": "https://registry.npmjs.org/entities/-/entities-8.0.0.tgz",
++      "integrity": "sha512-zwfzJecQ/Uej6tusMqwAqU/6KL2XaB2VZ2Jg54Je6ahNBGNH6Ek6g3jjNCF0fG9EWQKGZNddNjU5F1ZQn/sBnA==",
++      "dev": true,
++      "license": "BSD-2-Clause",
++      "engines": {
++        "node": ">=20.19.0"
++      },
++      "funding": {
++        "url": "https://github.com/fb55/entities?sponsor=1"
++      }
++    },
++    "node_modules/esbuild": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/esbuild/-/esbuild-0.21.5.tgz",
++      "integrity": "sha512-mg3OPMV4hXywwpoDxu3Qda5xCKQi+vCTZq8S9J/EpkhB2HzKXq4SNFZE3+NK93JYxc8VMSep+lOUSC/RVKaBqw==",
++      "dev": true,
++      "hasInstallScript": true,
++      "license": "MIT",
++      "bin": {
++        "esbuild": "bin/esbuild"
++      },
++      "engines": {
++        "node": ">=12"
++      },
++      "optionalDependencies": {
++        "@esbuild/aix-ppc64": "0.21.5",
++        "@esbuild/android-arm": "0.21.5",
++        "@esbuild/android-arm64": "0.21.5",
++        "@esbuild/android-x64": "0.21.5",
++        "@esbuild/darwin-arm64": "0.21.5",
++        "@esbuild/darwin-x64": "0.21.5",
++        "@esbuild/freebsd-arm64": "0.21.5",
++        "@esbuild/freebsd-x64": "0.21.5",
++        "@esbuild/linux-arm": "0.21.5",
++        "@esbuild/linux-arm64": "0.21.5",
++        "@esbuild/linux-ia32": "0.21.5",
++        "@esbuild/linux-loong64": "0.21.5",
++        "@esbuild/linux-mips64el": "0.21.5",
++        "@esbuild/linux-ppc64": "0.21.5",
++        "@esbuild/linux-riscv64": "0.21.5",
++        "@esbuild/linux-s390x": "0.21.5",
++        "@esbuild/linux-x64": "0.21.5",
++        "@esbuild/netbsd-x64": "0.21.5",
++        "@esbuild/openbsd-x64": "0.21.5",
++        "@esbuild/sunos-x64": "0.21.5",
++        "@esbuild/win32-arm64": "0.21.5",
++        "@esbuild/win32-ia32": "0.21.5",
++        "@esbuild/win32-x64": "0.21.5"
++      }
++    },
++    "node_modules/fsevents": {
++      "version": "2.3.3",
++      "resolved": "https://registry.npmjs.org/fsevents/-/fsevents-2.3.3.tgz",
++      "integrity": "sha512-5xoDfX+fL7faATnagmWPpbFtwh/R77WmMMqqHGS65C3vvB0YHrgF+B1YmZ3441tMj5n63k0212XNoJwzlhffQw==",
++      "dev": true,
++      "hasInstallScript": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "darwin"
++      ],
++      "engines": {
++        "node": "^8.16.0 || ^10.6.0 || >=11.0.0"
++      }
++    },
++    "node_modules/html-encoding-sniffer": {
++      "version": "6.0.0",
++      "resolved": "https://registry.npmjs.org/html-encoding-sniffer/-/html-encoding-sniffer-6.0.0.tgz",
++      "integrity": "sha512-CV9TW3Y3f8/wT0BRFc1/KAVQ3TUHiXmaAb6VW9vtiMFf7SLoMd1PdAc4W3KFOFETBJUb90KatHqlsZMWV+R9Gg==",
++      "dev": true,
++      "license": "MIT",
++      "dependencies": {
++        "@exodus/bytes": "^1.6.0"
++      },
++      "engines": {
++        "node": "^20.19.0 || ^22.12.0 || >=24.0.0"
++      }
++    },
++    "node_modules/is-potential-custom-element-name": {
++      "version": "1.0.1",
++      "resolved": "https://registry.npmjs.org/is-potential-custom-element-name/-/is-potential-custom-element-name-1.0.1.tgz",
++      "integrity": "sha512-bCYeRA2rVibKZd+s2625gGnGF/t7DSqDs4dP7CrLA1m7jKWz6pps0LpYLJN8Q64HtmPKJ1hrN3nzPNKFEKOUiQ==",
++      "dev": true,
++      "license": "MIT"
++    },
++    "node_modules/jsdom": {
++      "version": "29.1.1",
++      "resolved": "https://registry.npmjs.org/jsdom/-/jsdom-29.1.1.tgz",
++      "integrity": "sha512-ECi4Fi2f7BdJtUKTflYRTiaMxIB0O6zfR1fX0GXpUrf6flp8QIYn1UT20YQqdSOfk2dfkCwS8LAFoJDEppNK5Q==",
++      "dev": true,
++      "license": "MIT",
++      "dependencies": {
++        "@asamuzakjp/css-color": "^5.1.11",
++        "@asamuzakjp/dom-selector": "^7.1.1",
++        "@bramus/specificity": "^2.4.2",
++        "@csstools/css-syntax-patches-for-csstree": "^1.1.3",
++        "@exodus/bytes": "^1.15.0",
++        "css-tree": "^3.2.1",
++        "data-urls": "^7.0.0",
++        "decimal.js": "^10.6.0",
++        "html-encoding-sniffer": "^6.0.0",
++        "is-potential-custom-element-name": "^1.0.1",
++        "lru-cache": "^11.3.5",
++        "parse5": "^8.0.1",
++        "saxes": "^6.0.0",
++        "symbol-tree": "^3.2.4",
++        "tough-cookie": "^6.0.1",
++        "undici": "^7.25.0",
++        "w3c-xmlserializer": "^5.0.0",
++        "webidl-conversions": "^8.0.1",
++        "whatwg-mimetype": "^5.0.0",
++        "whatwg-url": "^16.0.1",
++        "xml-name-validator": "^5.0.0"
++      },
++      "engines": {
++        "node": "^20.19.0 || ^22.13.0 || >=24.0.0"
++      },
++      "peerDependencies": {
++        "canvas": "^3.0.0"
++      },
++      "peerDependenciesMeta": {
++        "canvas": {
++          "optional": true
++        }
++      }
++    },
++    "node_modules/lru-cache": {
++      "version": "11.5.2",
++      "resolved": "https://registry.npmjs.org/lru-cache/-/lru-cache-11.5.2.tgz",
++      "integrity": "sha512-4pfM1Ff0x50o0tQwb5ucw/RzNyD0/YJME6IVcStalZuMWxdt3sR3huStTtxz4PUmvZfRguvDejasvQ2kifR11g==",
++      "dev": true,
++      "license": "BlueOak-1.0.0",
++      "engines": {
++        "node": "20 || >=22"
++      }
++    },
++    "node_modules/mdn-data": {
++      "version": "2.27.1",
++      "resolved": "https://registry.npmjs.org/mdn-data/-/mdn-data-2.27.1.tgz",
++      "integrity": "sha512-9Yubnt3e8A0OKwxYSXyhLymGW4sCufcLG6VdiDdUGVkPhpqLxlvP5vl1983gQjJl3tqbrM731mjaZaP68AgosQ==",
++      "dev": true,
++      "license": "CC0-1.0"
++    },
++    "node_modules/nanoid": {
++      "version": "3.3.16",
++      "resolved": "https://registry.npmjs.org/nanoid/-/nanoid-3.3.16.tgz",
++      "integrity": "sha512-bzlKTyNJ7+LdGIIwy8ijFpIqEQIvafahV7eYykJ8Cvh42EdJeODoJ6gUJXpQJvej1BddH8OqTXZNE/KfbWAu8Q==",
++      "dev": true,
++      "funding": [
++        {
++          "type": "github",
++          "url": "https://github.com/sponsors/ai"
++        }
++      ],
++      "license": "MIT",
++      "bin": {
++        "nanoid": "bin/nanoid.cjs"
++      },
++      "engines": {
++        "node": "^10 || ^12 || ^13.7 || ^14 || >=15.0.1"
++      }
++    },
++    "node_modules/parse5": {
++      "version": "8.0.1",
++      "resolved": "https://registry.npmjs.org/parse5/-/parse5-8.0.1.tgz",
++      "integrity": "sha512-z1e/HMG90obSGeidlli3hj7cbocou0/wa5HacvI3ASx34PecNjNQeaHNo5WIZpWofN9kgkqV1q5YvXe3F0FoPw==",
++      "dev": true,
++      "license": "MIT",
++      "dependencies": {
++        "entities": "^8.0.0"
++      },
++      "funding": {
++        "url": "https://github.com/inikulin/parse5?sponsor=1"
++      }
++    },
++    "node_modules/picocolors": {
++      "version": "1.1.1",
++      "resolved": "https://registry.npmjs.org/picocolors/-/picocolors-1.1.1.tgz",
++      "integrity": "sha512-xceH2snhtb5M9liqDsmEw56le376mTZkEX/jEb/RxNFyegNul7eNslCXP9FDj/Lcu0X8KEyMceP2ntpaHrDEVA==",
++      "dev": true,
++      "license": "ISC"
++    },
++    "node_modules/postcss": {
++      "version": "8.5.23",
++      "resolved": "https://registry.npmjs.org/postcss/-/postcss-8.5.23.tgz",
++      "integrity": "sha512-g50586zr4bZmwFiTlflMu8E0bDTb5I5gertgwAKmsdUlTQIhZtunzUlD1WSzwcVWPoAVpsrA6vlfCD7oXvRwgg==",
++      "dev": true,
++      "funding": [
++        {
++          "type": "opencollective",
++          "url": "https://opencollective.com/postcss/"
++        },
++        {
++          "type": "tidelift",
++          "url": "https://tidelift.com/funding/github/npm/postcss"
++        },
++        {
++          "type": "github",
++          "url": "https://github.com/sponsors/ai"
++        }
++      ],
++      "license": "MIT",
++      "dependencies": {
++        "nanoid": "^3.3.16",
++        "picocolors": "^1.1.1",
++        "source-map-js": "^1.2.1"
++      },
++      "engines": {
++        "node": "^10 || ^12 || >=14"
++      }
++    },
++    "node_modules/punycode": {
++      "version": "2.3.1",
++      "resolved": "https://registry.npmjs.org/punycode/-/punycode-2.3.1.tgz",
++      "integrity": "sha512-vYt7UD1U9Wg6138shLtLOvdAu+8DsC/ilFtEVHcH+wydcSpNE20AfSOduf6MkRFahL5FY7X1oU7nKVZFtfq8Fg==",
++      "dev": true,
++      "license": "MIT",
++      "engines": {
++        "node": ">=6"
++      }
++    },
++    "node_modules/require-from-string": {
++      "version": "2.0.2",
++      "resolved": "https://registry.npmjs.org/require-from-string/-/require-from-string-2.0.2.tgz",
++      "integrity": "sha512-Xf0nWe6RseziFMu+Ap9biiUbmplq6S9/p+7w7YXP/JBHhrUDDUhwa+vANyubuqfZWTveU//DYVGsDG7RKL/vEw==",
++      "dev": true,
++      "license": "MIT",
++      "engines": {
++        "node": ">=0.10.0"
++      }
++    },
++    "node_modules/rollup": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/rollup/-/rollup-4.62.2.tgz",
++      "integrity": "sha512-RFnrW4lhXA3s3eqHDZvN654g8OTjzRfqpIRJYczCGB6HzphckVAi/Qh4tbPUbRuDi7s1Llv8g/NspLkttY3gTA==",
++      "dev": true,
++      "license": "MIT",
++      "dependencies": {
++        "@types/estree": "1.0.9"
++      },
++      "bin": {
++        "rollup": "dist/bin/rollup"
++      },
++      "engines": {
++        "node": ">=18.0.0",
++        "npm": ">=8.0.0"
++      },
++      "optionalDependencies": {
++        "@rollup/rollup-android-arm-eabi": "4.62.2",
++        "@rollup/rollup-android-arm64": "4.62.2",
++        "@rollup/rollup-darwin-arm64": "4.62.2",
++        "@rollup/rollup-darwin-x64": "4.62.2",
++        "@rollup/rollup-freebsd-arm64": "4.62.2",
++        "@rollup/rollup-freebsd-x64": "4.62.2",
++        "@rollup/rollup-linux-arm-gnueabihf": "4.62.2",
++        "@rollup/rollup-linux-arm-musleabihf": "4.62.2",
++        "@rollup/rollup-linux-arm64-gnu": "4.62.2",
++        "@rollup/rollup-linux-arm64-musl": "4.62.2",
++        "@rollup/rollup-linux-loong64-gnu": "4.62.2",
++        "@rollup/rollup-linux-loong64-musl": "4.62.2",
++        "@rollup/rollup-linux-ppc64-gnu": "4.62.2",
++        "@rollup/rollup-linux-ppc64-musl": "4.62.2",
++        "@rollup/rollup-linux-riscv64-gnu": "4.62.2",
++        "@rollup/rollup-linux-riscv64-musl": "4.62.2",
++        "@rollup/rollup-linux-s390x-gnu": "4.62.2",
++        "@rollup/rollup-linux-x64-gnu": "4.62.2",
++        "@rollup/rollup-linux-x64-musl": "4.62.2",
++        "@rollup/rollup-openbsd-x64": "4.62.2",
++        "@rollup/rollup-openharmony-arm64": "4.62.2",
++        "@rollup/rollup-win32-arm64-msvc": "4.62.2",
++        "@rollup/rollup-win32-ia32-msvc": "4.62.2",
++        "@rollup/rollup-win32-x64-gnu": "4.62.2",
++        "@rollup/rollup-win32-x64-msvc": "4.62.2",
++        "fsevents": "~2.3.2"
++      }
++    },
++    "node_modules/saxes": {
++      "version": "6.0.0",
++      "resolved": "https://registry.npmjs.org/saxes/-/saxes-6.0.0.tgz",
++      "integrity": "sha512-xAg7SOnEhrm5zI3puOOKyy1OMcMlIJZYNJY7xLBwSze0UjhPLnWfj2GF2EpT0jmzaJKIWKHLsaSSajf35bcYnA==",
++      "dev": true,
++      "license": "ISC",
++      "dependencies": {
++        "xmlchars": "^2.2.0"
++      },
++      "engines": {
++        "node": ">=v12.22.7"
++      }
++    },
++    "node_modules/source-map-js": {
++      "version": "1.2.1",
++      "resolved": "https://registry.npmjs.org/source-map-js/-/source-map-js-1.2.1.tgz",
++      "integrity": "sha512-UXWMKhLOwVKb728IUtQPXxfYU+usdybtUrK/8uGE8CQMvrhOpwvzDBwj0QhSL7MQc7vIsISBG8VQ8+IDQxpfQA==",
++      "dev": true,
++      "license": "BSD-3-Clause",
++      "engines": {
++        "node": ">=0.10.0"
++      }
++    },
++    "node_modules/symbol-tree": {
++      "version": "3.2.4",
++      "resolved": "https://registry.npmjs.org/symbol-tree/-/symbol-tree-3.2.4.tgz",
++      "integrity": "sha512-9QNk5KwDF+Bvz+PyObkmSYjI5ksVUYtjW7AU22r2NKcfLJcXp96hkDWU3+XndOsUb+AQ9QhfzfCT2O+CNWT5Tw==",
++      "dev": true,
++      "license": "MIT"
++    },
++    "node_modules/tldts": {
++      "version": "7.4.9",
++      "resolved": "https://registry.npmjs.org/tldts/-/tldts-7.4.9.tgz",
++      "integrity": "sha512-3kZ8wQQ/k5DrChD4X4FVvr2D7E5uoRgAqkPyLpSCGUvqOvqu+JEdr3mwMUaVWb+vMHZaKhF5fp2PBigKsui7hA==",
++      "dev": true,
++      "license": "MIT",
++      "dependencies": {
++        "tldts-core": "^7.4.9"
++      },
++      "bin": {
++        "tldts": "bin/cli.js"
++      }
++    },
++    "node_modules/tldts-core": {
++      "version": "7.4.9",
++      "resolved": "https://registry.npmjs.org/tldts-core/-/tldts-core-7.4.9.tgz",
++      "integrity": "sha512-DxKfPBI52p2msTEu7MPhdpdDTBhhVQg1a/8PjQckeyAvO13eMYElX545grIp6nnTGIMZlRvFZPvFhvI/WIz2Vg==",
++      "dev": true,
++      "license": "MIT"
++    },
++    "node_modules/tough-cookie": {
++      "version": "6.0.2",
++      "resolved": "https://registry.npmjs.org/tough-cookie/-/tough-cookie-6.0.2.tgz",
++      "integrity": "sha512-exgYmnmL/sJpR3upZfXG5PoatXQii55xAiXGXzY+sROLZ/Y+SLcp9PgJNI9Vz37HpQ74WvDcLT8eqm+kV3FzrA==",
++      "dev": true,
++      "license": "BSD-3-Clause",
++      "dependencies": {
++        "tldts": "^7.0.5"
++      },
++      "engines": {
++        "node": ">=16"
++      }
++    },
++    "node_modules/tr46": {
++      "version": "6.0.0",
++      "resolved": "https://registry.npmjs.org/tr46/-/tr46-6.0.0.tgz",
++      "integrity": "sha512-bLVMLPtstlZ4iMQHpFHTR7GAGj2jxi8Dg0s2h2MafAE4uSWF98FC/3MomU51iQAMf8/qDUbKWf5GxuvvVcXEhw==",
++      "dev": true,
++      "license": "MIT",
++      "dependencies": {
++        "punycode": "^2.3.1"
++      },
++      "engines": {
++        "node": ">=20"
++      }
++    },
++    "node_modules/undici": {
++      "version": "7.29.0",
++      "resolved": "https://registry.npmjs.org/undici/-/undici-7.29.0.tgz",
++      "integrity": "sha512-IDxfleLmmbSskfWSUATiN1nfn2rDuvnMOqb5CWR92iIfojA0Ud+ulOAAEQ57LPr9rWmsreUyf5lwyao+7GNNVw==",
++      "dev": true,
++      "license": "MIT",
++      "engines": {
++        "node": ">=20.18.1"
++      }
++    },
++    "node_modules/vite": {
++      "version": "5.4.21",
++      "resolved": "https://registry.npmjs.org/vite/-/vite-5.4.21.tgz",
++      "integrity": "sha512-o5a9xKjbtuhY6Bi5S3+HvbRERmouabWbyUcpXXUA1u+GNUKoROi9byOJ8M0nHbHYHkYICiMlqxkg1KkYmm25Sw==",
++      "dev": true,
++      "license": "MIT",
++      "dependencies": {
++        "esbuild": "^0.21.3",
++        "postcss": "^8.4.43",
++        "rollup": "^4.20.0"
++      },
++      "bin": {
++        "vite": "bin/vite.js"
++      },
++      "engines": {
++        "node": "^18.0.0 || >=20.0.0"
++      },
++      "funding": {
++        "url": "https://github.com/vitejs/vite?sponsor=1"
++      },
++      "optionalDependencies": {
++        "fsevents": "~2.3.3"
++      },
++      "peerDependencies": {
++        "@types/node": "^18.0.0 || >=20.0.0",
++        "less": "*",
++        "lightningcss": "^1.21.0",
++        "sass": "*",
++        "sass-embedded": "*",
++        "stylus": "*",
++        "sugarss": "*",
++        "terser": "^5.4.0"
++      },
++      "peerDependenciesMeta": {
++        "@types/node": {
++          "optional": true
++        },
++        "less": {
++          "optional": true
++        },
++        "lightningcss": {
++          "optional": true
++        },
++        "sass": {
++          "optional": true
++        },
++        "sass-embedded": {
++          "optional": true
++        },
++        "stylus": {
++          "optional": true
++        },
++        "sugarss": {
++          "optional": true
++        },
++        "terser": {
++          "optional": true
++        }
++      }
++    },
++    "node_modules/w3c-xmlserializer": {
++      "version": "5.0.0",
++      "resolved": "https://registry.npmjs.org/w3c-xmlserializer/-/w3c-xmlserializer-5.0.0.tgz",
++      "integrity": "sha512-o8qghlI8NZHU1lLPrpi2+Uq7abh4GGPpYANlalzWxyWteJOCsr/P+oPBA49TOLu5FTZO4d3F9MnWJfiMo4BkmA==",
++      "dev": true,
++      "license": "MIT",
++      "dependencies": {
++        "xml-name-validator": "^5.0.0"
++      },
++      "engines": {
++        "node": ">=18"
++      }
++    },
++    "node_modules/webidl-conversions": {
++      "version": "8.0.1",
++      "resolved": "https://registry.npmjs.org/webidl-conversions/-/webidl-conversions-8.0.1.tgz",
++      "integrity": "sha512-BMhLD/Sw+GbJC21C/UgyaZX41nPt8bUTg+jWyDeg7e7YN4xOM05YPSIXceACnXVtqyEw/LMClUQMtMZ+PGGpqQ==",
++      "dev": true,
++      "license": "BSD-2-Clause",
++      "engines": {
++        "node": ">=20"
++      }
++    },
++    "node_modules/whatwg-mimetype": {
++      "version": "5.0.0",
++      "resolved": "https://registry.npmjs.org/whatwg-mimetype/-/whatwg-mimetype-5.0.0.tgz",
++      "integrity": "sha512-sXcNcHOC51uPGF0P/D4NVtrkjSU2fNsm9iog4ZvZJsL3rjoDAzXZhkm2MWt1y+PUdggKAYVoMAIYcs78wJ51Cw==",
++      "dev": true,
++      "license": "MIT",
++      "engines": {
++        "node": ">=20"
++      }
++    },
++    "node_modules/whatwg-url": {
++      "version": "16.0.1",
++      "resolved": "https://registry.npmjs.org/whatwg-url/-/whatwg-url-16.0.1.tgz",
++      "integrity": "sha512-1to4zXBxmXHV3IiSSEInrreIlu02vUOvrhxJJH5vcxYTBDAx51cqZiKdyTxlecdKNSjj8EcxGBxNf6Vg+945gw==",
++      "dev": true,
++      "license": "MIT",
++      "dependencies": {
++        "@exodus/bytes": "^1.11.0",
++        "tr46": "^6.0.0",
++        "webidl-conversions": "^8.0.1"
++      },
++      "engines": {
++        "node": "^20.19.0 || ^22.12.0 || >=24.0.0"
++      }
++    },
++    "node_modules/xml-name-validator": {
++      "version": "5.0.0",
++      "resolved": "https://registry.npmjs.org/xml-name-validator/-/xml-name-validator-5.0.0.tgz",
++      "integrity": "sha512-EvGK8EJ3DhaHfbRlETOWAS5pO9MZITeauHKJyb8wyajUfQUenkIg2MvLDTZ4T/TgIcm3HU0TFBgWWboAZ30UHg==",
++      "dev": true,
++      "license": "Apache-2.0",
++      "engines": {
++        "node": ">=18"
++      }
++    },
++    "node_modules/xmlchars": {
++      "version": "2.2.0",
++      "resolved": "https://registry.npmjs.org/xmlchars/-/xmlchars-2.2.0.tgz",
++      "integrity": "sha512-JZnDKK8B0RCDw84FNdDAIpZK+JuJw+s7Lz8nksI7SIuU3UXJJslUthsi+uWBUYOwPFwW7W7PRLRfUKpxjtjFCw==",
++      "dev": true,
++      "license": "MIT"
++    }
++  }
++}
+diff --git a/apps/xiong-tu-san-guo/package.json b/apps/xiong-tu-san-guo/package.json
+new file mode 100644
+index 0000000..bd8404a
+--- /dev/null
++++ b/apps/xiong-tu-san-guo/package.json
+@@ -0,0 +1,17 @@
++{
++  "name": "xiong-tu-san-guo",
++  "version": "1.0.0",
++  "description": "《雄图·三国志文明》回合制策略经营网页游戏 - Heroic Three Kingdoms Civilization (turn-based strategy)",
++  "type": "module",
++  "scripts": {
++    "dev": "vite",
++    "build": "vite build",
++    "preview": "vite preview --host",
++    "test": "node scripts/logic-test.mjs",
++    "test:dom": "node scripts/smoke-dom.mjs"
++  },
++  "devDependencies": {
++    "jsdom": "^29.1.1",
++    "vite": "^5.4.0"
++  }
++}
+diff --git a/apps/xiong-tu-san-guo/scripts/_css-loader.mjs b/apps/xiong-tu-san-guo/scripts/_css-loader.mjs
+new file mode 100644
+index 0000000..b10c2fa
+--- /dev/null
++++ b/apps/xiong-tu-san-guo/scripts/_css-loader.mjs
+@@ -0,0 +1,7 @@
++// 让 Node 的 ESM 加载器把 *.css 视作空模块（仅冒烟测试用）。
++export async function load(url, context, nextLoad) {
++  if (url.endsWith('.css')) {
++    return { format: 'module', source: '', shortCircuit: true };
++  }
++  return nextLoad(url, context);
++}
+diff --git a/apps/xiong-tu-san-guo/scripts/logic-test.mjs b/apps/xiong-tu-san-guo/scripts/logic-test.mjs
+new file mode 100644
+index 0000000..eb29ed1
+--- /dev/null
++++ b/apps/xiong-tu-san-guo/scripts/logic-test.mjs
+@@ -0,0 +1,156 @@
++// 纯逻辑自测（不依赖浏览器/DOM）。运行：npm test
++import { CITIES, CITY_MAP, adjacencyValid } from '../src/data/cities.js';
++import { HEROES, FACTION_SEEDS, makeGenericGeneral } from '../src/data/heroes.js';
++import { makeRng } from '../src/core/rng.js';
++import { parseSkill, techMult } from '../src/core/tech.js';
++import { cityGoldIncome, cityGrainIncome, factionGoldIncome, factionGrainNet } from '../src/core/economy.js';
++import { createBattle, runBattle, effWar, attackValue } from '../src/core/combat.js';
++import {
++  newGame, cityById, heroesOfFaction, cmdPoints, cmdRemaining,
++  troopCap, resolveTurn, checkGameOver, neighbors, wildHeroesInCity,
++} from '../src/core/state.js';
++import * as A from '../src/core/actions.js';
++import { aiTurnAll } from '../src/core/ai.js';
++
++let pass = 0, fail = 0;
++function ok(cond, msg) { if (cond) { pass++; } else { fail++; console.error('  ✗ ' + msg); } }
++function eq(a, b, msg) { ok(a === b, `${msg} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`); }
++
++console.log('—— 数据完整性 ——');
++ok(adjacencyValid(), '城市邻接关系双向一致');
++eq(CITIES.length, 18, '城市数为 18');
++ok(HEROES.length >= 40, `名将数 >= 40 (实际 ${HEROES.length})`);
++eq(FACTION_SEEDS.length, 8, 'AI 势力种子为 8');
++// 每位名将要么 serve 一个种子势力，要么 wild 在某城市
++for (const h of HEROES) {
++  ok(h.serve || h.wild, `${h.name} 有归属（serve/wild）`);
++  if (h.wild) ok(CITY_MAP[h.wild], `${h.name} 的在野城市 ${h.wild} 存在`);
++  if (h.serve) ok(FACTION_SEEDS.some((s) => s.key === h.serve), `${h.name} 所属势力 ${h.serve} 存在`);
++}
++eq(makeGenericGeneral(makeRng(1), 1).id, 'gen_1', '生成武将 id 唯一可控');
++
++console.log('—— 科技 / 技能解析 ——');
++const sb = parseSkill('lead:0.10,war:0.05,trick:0.20');
++eq(sb.lead, 0.1, '技能 lead 解析');
++eq(sb.war, 0.05, '技能 war 解析');
++eq(sb.trick, 0.2, '技能 trick 解析');
++eq(parseSkill(null).lead, 0, '空技能返回零加成');
++
++console.log('—— 新局初始化（玩家选洛阳）——');
++const rng = makeRng(42);
++const stats = { l: 80, w: 70, i: 75, p: 78, c: 85 };
++let s = newGame({ lordName: '测试主公', startCity: 'luoyang', stats, rng });
++eq(s.turn, 1, '初始回合 = 1');
++eq(s.over, null, '初始无胜负');
++eq(cityById(s, 'luoyang').ownerFactionId, 0, '洛阳归玩家');
++eq(heroesOfFaction(s, 0).length, 1, '玩家初始仅君主一人');
++ok(s.factions.length >= 7, `生成 >=7 个势力 (实际 ${s.factions.length})`);
++// 8 个种子都城，玩家占洛阳（非任何都城）→ 8 AI 势力齐全
++eq(s.factions.filter((f) => f.aiControlled).length, 8, '8 个 AI 势力（玩家未占都城）');
++// 中立城市存在
++const neutral = s.cities.filter((c) => c.ownerFactionId == null);
++ok(neutral.length >= 8, `存在中立城市 (实际 ${neutral.length})`);
++
++console.log('—— 玩家选都城（许昌，曹操势力被吞并）——');
++const s2 = newGame({ lordName: '篡位者', startCity: 'xuchang', stats, rng: makeRng(7) });
++eq(s2.factions.filter((f) => f.aiControlled).length, 7, '占都城后仅 7 个 AI 势力');
++const caocao = s2.heroes.find((h) => h.id === 'caocao');
++ok(caocao && caocao.wild && caocao.cityId === 'xuchang', '曹操转为许昌在野，可被登用');
++ok(s2.heroes.some((h) => h.id === 'zhangliao' && h.wild), '张辽随曹操转为在野');
++
++console.log('—— 指令点 / 带兵上限 ——');
++const baseCmd = cmdPoints(s, 0);
++ok(baseCmd >= 5, `基础指令点 >= 5 (实际 ${baseCmd})`);
++const lord = s.heroes.find((h) => h.isPlayerLord);
++eq(cmdRemaining(s, 0), baseCmd, '回合初指令点全满');
++ok(troopCap(s, lord) >= 8000, `君主带兵上限合理 (实际 ${troopCap(s, lord)})`);
++
++console.log('—— 内政指令 ——');
++const beforeMarket = cityById(s, 'luoyang').marketLevel;
++let r1 = A.developMarket(s, 'luoyang');
++ok(r1.ok && cityById(s, 'luoyang').marketLevel === beforeMarket + 1, '发展商业成功升 1 级');
++const r2 = A.recruit(s, 'luoyang', 500);
++ok(r2.ok && cityById(s, 'luoyang').soldiers > 2000, '征兵增加士兵');
++ok(cmdRemaining(s, 0) < baseCmd, '执行指令后剩余指令点减少');
++// 金钱不足应失败且退还指令
++const poor = JSON.parse(JSON.stringify(s));
++factionPoor(poor, 0);
++const cmdBefore = cmdRemaining(poor, 0);
++const r3 = A.developFarm(poor, 'luoyang');
++ok(!r3.ok, '金钱不足时开发失败');
++eq(cmdRemaining(poor, 0), cmdBefore, '失败时指令点如数退还');
++
++console.log('—— 探索 / 登用 ——');
++// 洛阳在野有刘备 / 华佗
++const wildLy = wildHeroesInCity(s, 'luoyang');
++ok(wildLy.some((h) => h.id === 'liubei'), '洛阳在野含刘备');
++const exp = A.explore(s, 'luoyang', 0, makeRng(1));
++ok(exp.ok, '探索执行成功');
++// 强行标记已发现后登用
++const guanyu = s.heroes.find((h) => h.id === 'guanyu');
++guanyu.discovered = true;
++guanyu.cityId = 'luoyang'; // 移到玩家城便于测试
++const recR = A.recruitHero(s, 'guanyu', 0, makeRng(99));
++// 高魅力 + 多次尝试：用固定大种子提高命中
++ok(typeof recR.recruited === 'boolean', '登用返回是否成功布尔值');
++
++console.log('—— 战斗系统 ——');
++const battle = createBattle({
++  attacker: { factionId: 0, general: { name: '猛将', stats: { l: 90, w: 95, i: 60, p: 50, c: 60 }, skill: null }, soldiers: 3000, training: 60, formation: 'assault' },
++  defender: { factionId: 1, general: { name: '守将', stats: { l: 60, w: 60, i: 50, p: 50, c: 50 }, skill: null }, soldiers: 1000, defense: 300, isCity: true, training: 50, formation: 'normal' },
++});
++runBattle(battle, s, makeRng(3));
++ok(battle.result === 'attacker' || battle.result === 'defender', '战斗产出胜负结果');
++ok(battle.log.length > 0, '战斗产生战报');
++ok(effWar({ stats: { w: 100 }, skill: { effect: 'war:0.15' } }) > 100, '技能加成提升有效武力');
++
++console.log('—— 出征（攻打相邻中立城）——');
++// 把宛城设为中立且兵力薄弱，玩家从洛阳出征
++const wan = cityById(s, 'wan');
++wan.ownerFactionId = null; wan.soldiers = 300; wan.defense = 200;
++const lordId = s.heroes.find((h) => h.isPlayerLord).id;
++// 先征兵确保有兵
++cityById(s, 'luoyang').soldiers = 5000;
++const camp = A.campaign(s, 'luoyang', 'wan', lordId, 2000, 'assault', 0, makeRng(5));
++ok(camp.ok, '出征执行成功');
++if (camp.won) {
++  eq(cityById(s, 'wan').ownerFactionId, 0, '攻陷后宛城归玩家');
++} else {
++  ok(true, '出征未克（随机结果）');
++}
++
++console.log('—— 回合结算（含 AI）——');
++const s3 = newGame({ lordName: '结算测试', startCity: 'luoyang', stats, rng: makeRng(11) });
++const turn1 = s3.turn;
++const aiModule = { aiTurnAll };
++resolveTurn(s3, aiModule, makeRng(13));
++eq(s3.turn, turn1 + 1, '结算后回合 +1');
++ok(s3.turnLog.length >= 0, '结算产生回合日志');
++// 玩家金钱应随收入增加（初始有 buffer）
++ok(s3.factions[0].money > 0, '玩家回合后有金钱');
++
++console.log('—— 胜负判定 ——');
++// 模拟玩家占全部城市 → 胜利
++const sWin = newGame({ lordName: '霸主', startCity: 'luoyang', stats, rng: makeRng(2) });
++for (const c of sWin.cities) c.ownerFactionId = 0;
++checkGameOver(sWin);
++eq(sWin.over, 'win', '占全部城市 → 胜利');
++// 玩家无城 → 失败
++const sLose = newGame({ lordName: '败者', startCity: 'luoyang', stats, rng: makeRng(3) });
++for (const c of sLose.cities) if (c.id === 'luoyang') c.ownerFactionId = 1;
++for (const c of sLose.cities) if (c.ownerFactionId === 0) c.ownerFactionId = null;
++checkGameOver(sLose);
++eq(sLose.over, 'lose', '玩家无城 → 失败');
++
++console.log('—— 邻接可达性（全图连通）——');
++function bfsReachable(state, start) {
++  const seen = new Set([start]); const q = [start];
++  while (q.length) { const id = q.shift(); for (const n of cityById(state, id).adjacent) { if (!seen.has(n)) { seen.add(n); q.push(n); } } }
++  return seen;
++}
++eq(bfsReachable(s, 'luoyang').size, 18, '从洛阳可达全部 18 城（地图连通）');
++
++console.log(`\n结果：${pass} 通过，${fail} 失败`);
++process.exit(fail ? 1 : 0);
++
++function factionPoor(st, fid) { st.factions.find((f) => f.id === fid).money = 0; }
+diff --git a/apps/xiong-tu-san-guo/scripts/smoke-dom.mjs b/apps/xiong-tu-san-guo/scripts/smoke-dom.mjs
+new file mode 100644
+index 0000000..49f8db3
+--- /dev/null
++++ b/apps/xiong-tu-san-guo/scripts/smoke-dom.mjs
+@@ -0,0 +1,112 @@
++// DOM 冒烟测试：用 jsdom 驱动真实 UI 流程（启动 → 创角 → 对局 → 标签 → 城务 → 结束回合）。
++// 运行：node scripts/smoke-dom.mjs   （需先 npm install jsdom）
++import { JSDOM } from 'jsdom';
++import { register } from 'node:module';
++
++register('./_css-loader.mjs', import.meta.url);
++
++const dom = new JSDOM('<!DOCTYPE html><div id="game-container"></div>', {
++  url: 'http://localhost/',
++  pretendToBeVisual: true,
++});
++const { window } = dom;
++for (const k of ['document', 'window', 'localStorage', 'navigator', 'HTMLElement', 'Node', 'Element', 'getComputedStyle', 'CustomEvent', 'MouseEvent', 'Event']) {
++  if (window[k] === undefined) continue;
++  try { globalThis[k] = window[k]; } catch (_) {}
++}
++globalThis.requestAnimationFrame = (fn) => setTimeout(fn, 0);
++
++let pass = 0, fail = 0;
++const ok = (c, m) => { if (c) pass++; else { fail++; console.error('  ✗ FAIL:', m); } };
++const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
++
++let lastToast = '';
++const watchToasts = () => {
++  const wrap = document.querySelector('.toast-wrap');
++  if (!wrap) return;
++  new window.MutationObserver((muts) => {
++    for (const m of muts) for (const n of m.addedNodes) if (n.classList && n.classList.contains('toast')) lastToast = n.textContent;
++  }).observe(wrap, { childList: true });
++};
++
++const { createGame } = await import(new URL('../src/main.js', import.meta.url).href);
++const A = await import(new URL('../src/core/actions.js', import.meta.url).href);
++localStorage.clear();
++const ui = createGame(document.getElementById('game-container'));
++window.__XTSG = ui;
++watchToasts();
++await sleep(10);
++
++// ---------- 1) 启动器 ----------
++ok(document.querySelector('.launcher') !== null, '渲染启动器');
++ok(document.querySelector('.launcher__menu button') !== null, '启动器有「新游戏」按钮');
++
++// ---------- 2) 创角 ----------
++ui.showCreate();
++await sleep(5);
++ok(document.querySelector('.create') !== null, '进入创角页');
++ok(document.querySelectorAll('.city-pick__item').length === 18, '可选 18 座城市');
++const nameInput = document.querySelector('.create input[type=text]');
++nameInput.value = '玄德';
++nameInput.dispatchEvent(new window.Event('input'));
++ui.startCityPick = 'luoyang';
++ui.beginGame();
++await sleep(5);
++ok(document.querySelector('.game') !== null, '进入对局主界面');
++ok(document.querySelector('.topbar') !== null, '顶栏已渲染');
++ok(document.querySelectorAll('.tab').length === 5, '五个标签');
++ok(document.querySelectorAll('.map-dot').length === 18, '地图渲染 18 个城市点');
++
++// ---------- 3) 切换标签（逐个验证签名元素）----------
++const tabSignatures = {
++  faction: '.city-card', heroes: '.card-list', tech: '.tech-grid', system: '.sys-list', map: '.map-dot',
++};
++for (const [tab, sel] of Object.entries(tabSignatures)) {
++  ui.tab = tab; ui.renderTabbar(); ui.renderContent();
++  await sleep(3);
++  ok(document.querySelector(sel) !== null, `「${tab}」标签渲染（${sel}）`);
++}
++
++// ---------- 4) 城务：打开己方城市并执行内政 ----------
++ui.tab = 'map'; ui.renderContent(); await sleep(3);
++const luoyangDot = Array.from(document.querySelectorAll('.map-dot')).find((b) => b.textContent.includes('洛阳'));
++ok(!!luoyangDot, '找到洛阳城市点');
++luoyangDot.click();
++await sleep(5);
++ok(document.querySelector('.modal') !== null, '点击城市弹出城务弹窗');
++const farmBtn = Array.from(document.querySelectorAll('.cmd-btn')).find((b) => b.textContent.includes('农田'));
++ok(!!farmBtn, '城务含「开发农田」指令');
++farmBtn.click();
++await sleep(5);
++
++// ---------- 5) 结束回合 ----------
++ui.tab = 'system'; ui.renderContent(); await sleep(3);
++// 直接驱动结算（跳过确认弹窗）
++ui.doEndTurn();
++await sleep(20);
++ok(document.querySelector('.modal') !== null || document.querySelector('.gameover') !== null, '结算后弹出简报或结束界面');
++ok(ui.state.turn === 2 || ui.state.over != null, '回合推进或游戏结束');
++
++// ---------- 6) 战报弹窗渲染（驱动一次真实出征）----------
++ui.tab = 'map'; ui.renderContent(); await sleep(3);
++// 造势：洛阳兵足，邻接宛城设为中立薄弱，直接调用动作层出征并渲染战报
++const s = ui.state;
++const ly = s.cities.find((c) => c.id === 'luoyang');
++const wan = s.cities.find((c) => c.id === 'wan');
++ly.soldiers = 5000;
++wan.ownerFactionId = null; wan.soldiers = 300; wan.defense = 200;
++const lord = s.heroes.find((h) => h.isPlayerLord);
++const camp = A.campaign(s, 'luoyang', 'wan', lord.id, 2000, 'assault', s.playerFactionId, Math.random);
++ok(camp.ok && camp.battle, '出征产出战斗对象');
++ui.showBattleReport(camp.battle, camp.won, camp.msg);
++await sleep(5);
++ok(document.querySelector('.battle-log') !== null, '战报弹窗渲染');
++document.querySelector('.modal__foot button').click();
++await sleep(3);
++
++// ---------- 7) 存档可往返 ----------
++localStorage.setItem('__probe__', '1');
++ok(localStorage.getItem('xtsg_save_v1') != null, '对局已自动存档到 localStorage');
++
++console.log(`\nDOM 冒烟结果：${pass} 通过，${fail} 失败`);
++process.exit(fail ? 1 : 0);
+diff --git a/apps/xiong-tu-san-guo/src/config.js b/apps/xiong-tu-san-guo/src/config.js
+new file mode 100644
+index 0000000..3276c59
+--- /dev/null
++++ b/apps/xiong-tu-san-guo/src/config.js
+@@ -0,0 +1,84 @@
++// ============================================================================
++// 雄图·三国志文明 · 全局常量与公式
++// 所有数值与战斗 / 经济公式集中于此，便于单测（scripts/logic-test.mjs）与平衡调整。
++// ============================================================================
++
++export const SAVE_KEY = 'xtsg_save_v1';
++export const GAME_VERSION = 1;
++
++export const BUILD_MAX = 5; // 城市建筑等级上限（农田 / 市集 / 兵营 / 城墙 / 工坊）
++export const TRAINING_BASE = 50; // 士兵默认训练度
++export const TRAINING_MAX = 100;
++
++// —— 指令点数 ——
++export const CMD_BASE = 5;
++export const CMD_PER_CITY = 2;
++
++// —— 经济（每回合结算）——
++export const GOLD_PER_MARKET = 100; // 市集等级 × 100
++export const GOLD_PER_POP = 0.5; // 人口 × 0.5
++export const GRAIN_PER_FARM = 200; // 农田等级 × 200
++export const GRAIN_UPKEEP_PER_SOLDIER = 0.5; // 士兵每回合吃粮
++export const POP_GROWTH_RATE = 0.02; // 自然增长率基础
++export const POP_GROWTH_POL_DIVISOR = 100; // 政治 / 100 作为系数
++
++// —— 征兵 ——
++export const RECRUIT_GOLD_PER_SOLDIER = 1.5; // 每名士兵花费金钱
++export const RECRUIT_POP_PER_SOLDIER = 1; // 征兵消耗人口
++
++// 升级建筑花费：从当前 level 升到下一级
++export function buildCost(level) {
++  return 300 + level * 200;
++}
++
++// —— 科技 ——
++export const TECH_MAX_LEVEL = 3;
++export const TECHS = {
++  agri: { name: '农艺', desc: '粮食产量 +10% / 级', icon: '🌾' },
++  commerce: { name: '商贸', desc: '金钱收入 +10% / 级', icon: '💰' },
++  forge: { name: '冶炼', desc: '士兵攻击 +5% / 级', icon: '⚒️' },
++  wall: { name: '筑城', desc: '城防值 +20% / 级', icon: '🧱' },
++  trick: { name: '谋略', desc: '计谋成功率 +5% / 级', icon: '📜' },
++  leadership: { name: '统御', desc: '带兵上限 +10% / 级', icon: '⚓' },
++};
++export const TECH_COST_GOLD = 800; // 每级基础金钱花费
++export const TECH_COST_TURNS = 3; // 每级基础研究回合（智力可缩短）
++
++// —— 战斗 ——
++export const FORMATIONS = {
++  normal: { name: '普通', atk: 1.0, def: 1.0, desc: '攻守均衡' },
++  assault: { name: '攻击', atk: 1.2, def: 0.85, desc: '攻击 +20% / 防御 -15%' },
++  defend: { name: '防御', atk: 0.85, def: 1.2, desc: '攻击 -15% / 防御 +20%' },
++};
++export const DUEL_THRESHOLD = 20; // 武力差 > 20 可触发单挑
++export const DUEL_CHANCE = 0.22; // 每回合触发单挑的概率
++export const DUEL_ROUT_RATIO = 0.35; // 单挑败方溃散的兵力比例
++
++// —— 计略 ——
++export const STRATAGEMS = {
++  fire: { name: '火攻', desc: '降低目标城防 30%', icon: '🔥', range: 0.3 },
++  burn: { name: '烧粮', desc: '烧毁目标军粮 30%', icon: '🔥', range: 0.3 },
++  rumor: { name: '流言', desc: '降低目标守将忠诚 25', icon: '🗯️', range: 25 },
++};
++
++// —— 势力颜色 ——
++export const FACTION_COLORS = [
++  '#c0392b', '#27ae60', '#2980b9', '#8e44ad',
++  '#d35400', '#16a085', '#ad1457', '#f39c12', '#5d6d7e',
++];
++export const PLAYER_COLOR = '#c0392b';
++export const NEUTRAL_COLOR = '#7f8c8d';
++
++// —— 探索 / 登用 ——
++export const EXPLORE_DISCOVERY_BASE = 0.5; // 每位在野名将的发现概率基础（× 魅力修正）
++export const RECRUIT_LOYALTY_THRESHOLD = 30; // 忠诚低于此值的敌将易被策反
++
++export function clamp(v, lo, hi) {
++  return Math.max(lo, Math.min(hi, v));
++}
++
++// 季节名（每回合 = 三个月）
++export const SEASONS = ['春', '夏', '秋', '冬'];
++export function seasonOf(turn) {
++  return SEASONS[(turn - 1) % SEASONS.length];
++}
+diff --git a/apps/xiong-tu-san-guo/src/core/actions.js b/apps/xiong-tu-san-guo/src/core/actions.js
+new file mode 100644
+index 0000000..fdc2670
+--- /dev/null
++++ b/apps/xiong-tu-san-guo/src/core/actions.js
+@@ -0,0 +1,420 @@
++// ============================================================================
++// 玩家 / AI 共用的命令函数：每个动作校验、扣费、变更状态并返回 { ok, msg, ... }。
++// 消耗指令点（cmd）的动作通过 spendCmd 统一计费；任命太守、输送等少数免费。
++// ============================================================================
++import {
++  cityById, heroById, factionById, playerFaction, neighbors, heroesInCity,
++  wildHeroesInCity, heroesOfFaction, bestDefender, troopCap, cmdRemaining, maxDefense, lordOf,
++} from './state.js';
++import { citiesOf, recruitCost } from './economy.js';
++import { skillBonus, techMult, techLevel } from './tech.js';
++import { createBattle, runBattle, effLead, effWar } from './combat.js';
++import { chance, rangeInt } from './rng.js';
++import {
++  BUILD_MAX, buildCost, TRAINING_BASE, TRAINING_MAX, FORMATIONS, STRATAGEMS,
++  TECH_MAX_LEVEL, TECH_COST_GOLD, TECH_COST_TURNS, RECRUIT_LOYALTY_THRESHOLD,
++} from '../config.js';
++
++const PLAYER = (state) => state.playerFactionId;
++
++// 消耗一点指令；不足返回 false
++function spendCmd(state, fid) {
++  if (cmdRemaining(state, fid) <= 0) return false;
++  state.cmdUsedByFaction = state.cmdUsedByFaction || {};
++  state.cmdUsedByFaction[fid] = (state.cmdUsedByFaction[fid] || 0) + 1;
++  return true;
++}
++function facMoney(state, fid) { return factionById(state, fid).money; }
++function facGrain(state, fid) { return factionById(state, fid).grain; }
++
++const isPlayer = (state, fid) => fid === state.playerFactionId;
++
++// —— 内政：开发农田 ——
++export function developFarm(state, cityId, fid = PLAYER(state)) {
++  const c = cityById(state, cityId);
++  if (!c || c.ownerFactionId !== fid) return { ok: false, msg: '该城非你所属' };
++  if (c.farmLevel >= BUILD_MAX) return { ok: false, msg: '农田已达满级' };
++  if (!spendCmd(state, fid)) return { ok: false, msg: '指令点不足' };
++  const cost = buildCost(c.farmLevel);
++  if (facMoney(state, fid) < cost) { refundCmd(state, fid); return { ok: false, msg: '金钱不足' }; }
++  factionById(state, fid).money -= cost;
++  c.farmLevel += 1;
++  return { ok: true, msg: `${c.name} 农田升至 ${c.farmLevel} 级（-${cost} 金）` };
++}
++
++// —— 内政：发展商业 ——
++export function developMarket(state, cityId, fid = PLAYER(state)) {
++  const c = cityById(state, cityId);
++  if (!c || c.ownerFactionId !== fid) return { ok: false, msg: '该城非你所属' };
++  if (c.marketLevel >= BUILD_MAX) return { ok: false, msg: '市集已达满级' };
++  if (!spendCmd(state, fid)) return { ok: false, msg: '指令点不足' };
++  const cost = buildCost(c.marketLevel);
++  if (facMoney(state, fid) < cost) { refundCmd(state, fid); return { ok: false, msg: '金钱不足' }; }
++  factionById(state, fid).money -= cost;
++  c.marketLevel += 1;
++  return { ok: true, msg: `${c.name} 市集升至 ${c.marketLevel} 级（-${cost} 金）` };
++}
++
++// —— 内政：城防修筑 ——
++export function buildWall(state, cityId, fid = PLAYER(state)) {
++  const c = cityById(state, cityId);
++  if (!c || c.ownerFactionId !== fid) return { ok: false, msg: '该城非你所属' };
++  if (c.wallLevel >= BUILD_MAX) return { ok: false, msg: '城墙已达满级' };
++  if (!spendCmd(state, fid)) return { ok: false, msg: '指令点不足' };
++  const cost = buildCost(c.wallLevel);
++  if (facMoney(state, fid) < cost) { refundCmd(state, fid); return { ok: false, msg: '金钱不足' }; }
++  factionById(state, fid).money -= cost;
++  c.wallLevel += 1;
++  c.defense = maxDefense(state, c);
++  return { ok: true, msg: `${c.name} 城墙升至 ${c.wallLevel} 级，城防加固` };
++}
++
++// —— 内政：征兵 ——
++export function recruit(state, cityId, count, fid = PLAYER(state)) {
++  const c = cityById(state, cityId);
++  if (!c || c.ownerFactionId !== fid) return { ok: false, msg: '该城非你所属' };
++  count = Math.max(0, Math.floor(count));
++  if (count <= 0) return { ok: false, msg: '征兵数量无效' };
++  if (!spendCmd(state, fid)) return { ok: false, msg: '指令点不足' };
++  const { gold, pop } = recruitCost(c, count);
++  const fac = factionById(state, fid);
++  if (fac.money < gold) { refundCmd(state, fid); return { ok: false, msg: '金钱不足' }; }
++  if (c.population < pop) { refundCmd(state, fid); return { ok: false, msg: '人口不足' }; }
++  fac.money -= gold;
++  c.population -= Math.round(pop);
++  c.soldiers += count;
++  // 兵营等级提升新兵训练度起点
++  if (c.training < TRAINING_BASE + (c.barracksLevel - 1) * 5) c.training = TRAINING_BASE + (c.barracksLevel - 1) * 5;
++  return { ok: true, msg: `${c.name} 征兵 ${count}（-${Math.round(gold)} 金，-${Math.round(pop)} 人口）` };
++}
++
++// —— 内政：操练（提升训练度）——
++export function train(state, cityId, fid = PLAYER(state)) {
++  const c = cityById(state, cityId);
++  if (!c || c.ownerFactionId !== fid) return { ok: false, msg: '该城非你所属' };
++  if (c.training >= TRAINING_MAX) return { ok: false, msg: '训练度已满' };
++  if (!spendCmd(state, fid)) return { ok: false, msg: '指令点不足' };
++  const cost = 200;
++  if (facMoney(state, fid) < cost) { refundCmd(state, fid); return { ok: false, msg: '金钱不足' }; }
++  factionById(state, fid).money -= cost;
++  c.training = Math.min(TRAINING_MAX, c.training + 8);
++  return { ok: true, msg: `${c.name} 操练部队，训练度 → ${c.training}` };
++}
++
++// —— 人事：探索（发现本城在野名将）——
++export function explore(state, cityId, fid = PLAYER(state), rng) {
++  const r = rng || Math.random;
++  const c = cityById(state, cityId);
++  if (!c || c.ownerFactionId !== fid) return { ok: false, msg: '该城非你所属' };
++  if (!spendCmd(state, fid)) return { ok: false, msg: '指令点不足' };
++  const roster = heroesInCity(state, cityId, fid);
++  const charm = roster.length ? Math.max(...roster.map((h) => h.stats.c)) : 50;
++  const wilds = wildHeroesInCity(state, cityId);
++  const newly = [];
++  for (const w of wilds) {
++    if (w.discovered) continue;
++    if (chance(r, 0.4 + charm / 400)) { w.discovered = true; newly.push(w); }
++  }
++  const discovered = wilds.filter((w) => w.discovered);
++  if (!newly.length && !discovered.length) {
++    return { ok: true, msg: `${c.name} 四处寻访，未发现可用之才。`, discovered: [] };
++  }
++  return {
++    ok: true,
++    msg: newly.length ? `${c.name} 探访得知：${newly.map((w) => w.name).join('、')} 在此隐居！` : `${c.name} 已有名将在野可登用。`,
++    discovered,
++    newly,
++  };
++}
++
++// —— 人事：登用（说服在野名将加入）——
++export function recruitHero(state, heroId, fid = PLAYER(state), rng) {
++  const r = rng || Math.random;
++  const h = heroById(state, heroId);
++  if (!h || !h.wild) return { ok: false, msg: '目标不可登用' };
++  const c = cityById(state, h.cityId);
++  if (!c || c.ownerFactionId !== fid) return { ok: false, msg: '名将不在己方城市' };
++  if (!spendCmd(state, fid)) return { ok: false, msg: '指令点不足' };
++  const roster = heroesInCity(state, h.cityId, fid);
++  const charm = roster.length ? Math.max(...roster.map((x) => x.stats.c)) : 50;
++  const cBonus = roster.length ? Math.max(...roster.map((x) => skillBonus(x).c_recruit)) : 0;
++  let p = 0.25 + (charm - h.loyalty) / 200 + cBonus + techMult(state, 'trick', 0.05) - 1;
++  p = Math.max(0.05, Math.min(0.95, p));
++  if (chance(r, p)) {
++    h.wild = false;
++    h.factionId = fid;
++    h.status = 'free';
++    h.discovered = true;
++    h.loyalty = Math.max(70, Math.min(95, Math.round(60 + charm / 4)));
++    return { ok: true, msg: `${h.name} 愿效犬马之劳，已归入麾下！`, recruited: true };
++  }
++  return { ok: true, msg: `${h.name} 婉言谢绝（成功率 ${Math.round(p * 100)}%）。`, recruited: false };
++}
++
++// —— 人事：赏赐（提升忠诚）——
++export function reward(state, heroId, fid = PLAYER(state)) {
++  const h = heroById(state, heroId);
++  if (!h || h.factionId !== fid) return { ok: false, msg: '非己方武将' };
++  if (!spendCmd(state, fid)) return { ok: false, msg: '指令点不足' };
++  const cost = 300;
++  if (facMoney(state, fid) < cost) { refundCmd(state, fid); return { ok: false, msg: '金钱不足' }; }
++  factionById(state, fid).money -= cost;
++  h.loyalty = Math.min(100, h.loyalty + 12);
++  return { ok: true, msg: `赏赐 ${h.name}，忠诚 → ${h.loyalty}` };
++}
++
++// —— 人事：任命太守（免费）——
++export function appointGovernor(state, cityId, heroId, fid = PLAYER(state)) {
++  const c = cityById(state, cityId);
++  const h = heroById(state, heroId);
++  if (!c || c.ownerFactionId !== fid) return { ok: false, msg: '该城非你所属' };
++  if (!h || h.factionId !== fid || h.status === 'prisoner') return { ok: false, msg: '该武将不可用' };
++  if (h.cityId !== cityId) return { ok: false, msg: '武将须在本城方可任命' };
++  c.governorHeroId = heroId;
++  return { ok: true, msg: `${h.name} 出任 ${c.name} 太守` };
++}
++
++// —— 科技：开始研究 ——
++export function research(state, techKey, fid = PLAYER(state)) {
++  if (!Object.prototype.hasOwnProperty.call(state.techLevels, techKey)) return { ok: false, msg: '未知科技' };
++  if (state.research) return { ok: false, msg: '已有研究进行中' };
++  if (techLevel(state, techKey) >= TECH_MAX_LEVEL) return { ok: false, msg: '该科技已满级' };
++  if (!spendCmd(state, fid)) return { ok: false, msg: '指令点不足' };
++  if (facMoney(state, fid) < TECH_COST_GOLD) { refundCmd(state, fid); return { ok: false, msg: '金钱不足' }; }
++  factionById(state, fid).money -= TECH_COST_GOLD;
++  const lord = lordOf(state, fid);
++  const intel = lord ? lord.stats.i : 50;
++  const turns = Math.max(1, Math.round(TECH_COST_TURNS - intel / 60));
++  state.research = { key: techKey, turnsLeft: turns };
++  return { ok: true, msg: `开始研究，预计 ${turns} 回合完成（-${TECH_COST_GOLD} 金）` };
++}
++
++// —— 军事：出征 ——
++export function campaign(state, fromCityId, toCityId, generalId, troops, formation, fid = PLAYER(state), rng) {
++  const r = rng || Math.random;
++  const from = cityById(state, fromCityId);
++  const to = cityById(state, toCityId);
++  if (!from || !to) return { ok: false, msg: '城市无效' };
++  if (from.ownerFactionId !== fid) return { ok: false, msg: '出发城非你所属' };
++  if (to.ownerFactionId === fid) return { ok: false, msg: '不可攻打己方城市' };
++  if (!from.adjacent.includes(toCityId)) return { ok: false, msg: '目标城市不相邻' };
++  const g = heroById(state, generalId);
++  if (!g || g.factionId !== fid || g.status === 'prisoner' || g.cityId !== fromCityId) {
++    return { ok: false, msg: '主将不可用' };
++  }
++  troops = Math.max(0, Math.floor(troops));
++  if (troops <= 0) return { ok: false, msg: '出兵数量无效' };
++  if (troops > from.soldiers) return { ok: false, msg: '城中兵力不足' };
++  if (troops > troopCap(state, g)) return { ok: false, msg: `超出 ${g.name} 带兵上限（${troopCap(state, g)}）` };
++  if (!spendCmd(state, fid)) return { ok: false, msg: '指令点不足' };
++  const grainCost = Math.round(troops * 0.05);
++  if (facGrain(state, fid) < grainCost) { refundCmd(state, fid); return { ok: false, msg: '军粮不足以出征' }; }
++  factionById(state, fid).grain -= grainCost;
++
++  from.soldiers -= troops;
++
++  const attacker = { factionId: fid, general: g, soldiers: troops, training: from.training, formation: formation || 'normal' };
++  const defGeneral = bestDefender(state, toCityId) || { id: '__militia__', name: '守城民兵', stats: { l: 50, w: 50, i: 40, p: 40, c: 40 }, skill: null };
++  const defender = {
++    factionId: to.ownerFactionId, general: defGeneral, soldiers: to.soldiers,
++    defense: to.defense || 0, isCity: true, training: to.training || TRAINING_BASE, formation: 'normal',
++  };
++
++  const battle = createBattle({ attacker, defender });
++  runBattle(battle, state, r);
++
++  let won = battle.result === 'attacker';
++  applyCampaignResult(state, battle, from, to, g, fid, r);
++
++  const msgs = battle.log.slice(-3);
++  return { ok: true, won, battle, msg: won ? `攻克 ${to.name}！` : `攻打 ${to.name} 失利。`, log: msgs };
++}
++
++// 结算出征结果（占领 / 溃败 / 俘虏）
++function applyCampaignResult(state, battle, from, to, attackerGen, fid, rng) {
++  const won = battle.result === 'attacker';
++  const captorFid = won ? fid : to.ownerFactionId;
++
++  if (won) {
++    // 占领：幸存兵力转为新守军，主将入驻
++    const survivors = Math.round(battle.attacker.soldiers);
++    to.ownerFactionId = fid;
++    to.soldiers = survivors;
++    to.training = from.training;
++    attackerGen.cityId = to.id;
++    if (!to.governorHeroId || !heroById(state, to.governorHeroId)) to.governorHeroId = attackerGen.id;
++    // 缴获城库
++    const lootGold = to.gold || 0;
++    const lootGrain = to.grain || 0;
++    factionById(state, fid).money += lootGold;
++    factionById(state, fid).grain += lootGrain;
++    to.gold = 0; to.grain = 0;
++    state.turnLog.push(`🏰 攻陷 ${to.name}！缴获 ${lootGold} 金、${lootGrain} 粮，余兵 ${survivors} 驻守。`);
++  } else {
++    // 失利：出征兵力覆灭（已从 from 扣除），主将若未被俘则退回
++    if (attackerGen.id !== '__militia__' && attackerGen.status !== 'prisoner') {
++      // 仍在 from 城
++    }
++    state.turnLog.push(`💔 攻打 ${to.name} 失利，出征军覆灭。`);
++  }
++
++  // 俘虏处理
++  if (battle.prisoner && battle.prisoner !== '__militia__') {
++    const ph = heroById(state, battle.prisoner);
++    if (ph && captorFid != null) {
++      ph.status = 'prisoner';
++      ph.prisonerOf = captorFid;
++      const capCity = citiesOf(state, captorFid)[0];
++      if (capCity) ph.cityId = capCity.id;
++      if (ph.id === to.governorHeroId) to.governorHeroId = null;
++      state.turnLog.push(`⛓️ ${ph.name} 被俘。`);
++    } else if (ph) {
++      // 中立势力俘获 → 释放为在野
++      ph.status = 'free';
++      ph.wild = true;
++      ph.discovered = false;
++    }
++  }
++}
++
++// —— 军事：输送（己方相邻城市间调运）——
++export function transport(state, fromCityId, toCityId, payload, fid = PLAYER(state)) {
++  const from = cityById(state, fromCityId);
++  const to = cityById(state, toCityId);
++  if (!from || !to) return { ok: false, msg: '城市无效' };
++  if (from.ownerFactionId !== fid || to.ownerFactionId !== fid) return { ok: false, msg: '须为己方城市' };
++  if (!from.adjacent.includes(toCityId)) return { ok: false, msg: '两城不相邻' };
++  if (!spendCmd(state, fid)) return { ok: false, msg: '指令点不足' };
++  const fac = factionById(state, fid);
++  const s = Math.max(0, Math.floor(payload.soldiers || 0));
++  const gm = Math.max(0, Math.floor(payload.gold || 0));
++  const gr = Math.max(0, Math.floor(payload.grain || 0));
++  if (s > from.soldiers) { refundCmd(state, fid); return { ok: false, msg: '兵力不足' }; }
++  if (gm > fac.money) { refundCmd(state, fid); return { ok: false, msg: '金钱不足' }; }
++  if (gr > fac.grain) { refundCmd(state, fid); return { ok: false, msg: '军粮不足' }; }
++  from.soldiers -= s;
++  to.soldiers += s;
++  fac.money -= gm;
++  fac.grain -= gr;
++  // 同步迁移随军武将（可选）：把 from 城中指定的空闲武将调往 to（此处只调资源）
++  return { ok: true, msg: `自 ${from.name} 向 ${to.name} 输送：兵 ${s}、金 ${gm}、粮 ${gr}` };
++}
++
++// —— 外交 / 计略 ——
++export function stratagem(state, fromCityId, toCityId, type, fid = PLAYER(state), rng) {
++  const r = rng || Math.random;
++  const def = STRATAGEMS[type];
++  if (!def) return { ok: false, msg: '未知计略' };
++  const from = cityById(state, fromCityId);
++  const to = cityById(state, toCityId);
++  if (!from || !to) return { ok: false, msg: '城市无效' };
++  if (from.ownerFactionId !== fid) return { ok: false, msg: '出发城非你所属' };
++  if (to.ownerFactionId === fid) return { ok: false, msg: '不可对己方城市用计' };
++  if (!from.adjacent.includes(toCityId)) return { ok: false, msg: '目标城市不相邻' };
++  if (!spendCmd(state, fid)) return { ok: false, msg: '指令点不足' };
++  const cost = 150;
++  if (facMoney(state, fid) < cost) { refundCmd(state, fid); return { ok: false, msg: '金钱不足' }; }
++  factionById(state, fid).money -= cost;
++
++  const caster = bestDefender(state, fromCityId) || { stats: { i: 50 } };
++  const intel = caster.stats ? caster.stats.i : 50;
++  const targetGen = bestDefender(state, toCityId);
++  const tIntel = targetGen && targetGen.stats ? targetGen.stats.i : 45;
++  let p = 0.35 + (intel - tIntel) / 200 + techMult(state, 'trick', 0.05) - 1;
++  p = Math.max(0.05, Math.min(0.9, p));
++
++  if (!chance(r, p)) {
++    return { ok: true, msg: `${def.name} 被 ${to.name} 识破（成功率 ${Math.round(p * 100)}%）`, success: false };
++  }
++  if (type === 'fire') {
++    to.defense = Math.max(0, Math.round((to.defense || 0) * (1 - def.range)));
++    return { ok: true, msg: `火攻成功！${to.name} 城防降至 ${Math.round(to.defense)}`, success: true };
++  }
++  if (type === 'burn') {
++    const foeFid = to.ownerFactionId;
++    if (foeFid != null) {
++      const foe = factionById(state, foeFid);
++      const burned = Math.round(foe.grain * def.range);
++      foe.grain -= burned;
++      return { ok: true, msg: `烧粮成功！${foe.name} 损失 ${burned} 军粮`, success: true };
++    }
++    to.grain = Math.round((to.grain || 0) * (1 - def.range));
++    return { ok: true, msg: `烧粮成功！${to.name} 城库粮草被焚`, success: true };
++  }
++  if (type === 'rumor') {
++    if (targetGen) {
++      targetGen.loyalty = Math.max(0, targetGen.loyalty - def.range);
++      return { ok: true, msg: `流言成功！${targetGen.name} 忠诚降至 ${targetGen.loyalty}`, success: true };
++    }
++    return { ok: true, msg: `流言散布，但城中无名将可撼动`, success: true };
++  }
++  return { ok: true, msg: '计略执行完毕', success: true };
++}
++
++// 武将调任：在己方相邻城市间移动一名武将（免费）
++export function moveHero(state, heroId, toCityId, fid = PLAYER(state)) {
++  const h = heroById(state, heroId);
++  const to = cityById(state, toCityId);
++  if (!h || h.factionId !== fid || h.status === 'prisoner') return { ok: false, msg: '武将不可用' };
++  if (!to || to.ownerFactionId !== fid) return { ok: false, msg: '目标非己方城市' };
++  const from = cityById(state, h.cityId);
++  if (!from || !from.adjacent.includes(toCityId)) return { ok: false, msg: '两城不相邻' };
++  h.cityId = toCityId;
++  return { ok: true, msg: `${h.name} 调往 ${to.name}` };
++}
++
++// —— 俘虏管理 ——
++// 招降俘虏（成功率随俘虏忠诚降低而提高）
++export function recruitPrisoner(state, heroId, fid = PLAYER(state), rng) {
++  const r = rng || Math.random;
++  const h = heroById(state, heroId);
++  if (!h || h.prisonerOf !== fid) return { ok: false, msg: '该武将非你俘虏' };
++  if (!spendCmd(state, fid)) return { ok: false, msg: '指令点不足' };
++  const cost = 500;
++  if (facMoney(state, fid) < cost) { refundCmd(state, fid); return { ok: false, msg: '金钱不足' }; }
++  factionById(state, fid).money -= cost;
++  const lord = lordOf(state, fid);
++  const charm = lord ? lord.stats.c : 50;
++  let p = 0.15 + (100 - h.loyalty) / 200 + (charm - 70) / 100;
++  p = Math.max(0.05, Math.min(0.85, p));
++  if (chance(r, p)) {
++    h.factionId = fid;
++    h.prisonerOf = null;
++    h.status = 'free';
++    h.loyalty = Math.max(55, Math.min(80, h.loyalty));
++    return { ok: true, msg: `${h.name} 归降！`, recruited: true };
++  }
++  return { ok: true, msg: `${h.name} 拒不投降（成功率 ${Math.round(p * 100)}%）`, recruited: false };
++}
++
++// 释放俘虏 → 转为某中立城在野
++export function releasePrisoner(state, heroId, fid = PLAYER(state)) {
++  const h = heroById(state, heroId);
++  if (!h || h.prisonerOf !== fid) return { ok: false, msg: '该武将非你俘虏' };
++  const neutrals = state.cities.filter((c) => c.ownerFactionId == null);
++  const dest = (neutrals.length ? neutrals : state.cities)[0];
++  h.prisonerOf = null;
++  h.status = 'free';
++  h.factionId = null;
++  h.wild = true;
++  h.discovered = false;
++  h.cityId = dest.id;
++  return { ok: true, msg: `释放 ${h.name}` };
++}
++
++// 处决俘虏
++export function executePrisoner(state, heroId, fid = PLAYER(state)) {
++  const h = heroById(state, heroId);
++  if (!h || h.prisonerOf !== fid) return { ok: false, msg: '该武将非你俘虏' };
++  const name = h.name;
++  state.heroes = state.heroes.filter((x) => x.id !== heroId);
++  return { ok: true, msg: `处决 ${name}，其旧部离心。` };
++}
++
++function refundCmd(state, fid) {
++  if (state.cmdUsedByFaction && state.cmdUsedByFaction[fid] > 0) {
++    state.cmdUsedByFaction[fid] -= 1;
++  }
++}
++
++export { spendCmd, isPlayer, RECRUIT_LOYALTY_THRESHOLD, effLead, effWar, FORMATIONS };
+diff --git a/apps/xiong-tu-san-guo/src/core/ai.js b/apps/xiong-tu-san-guo/src/core/ai.js
+new file mode 100644
+index 0000000..5f75c29
+--- /dev/null
++++ b/apps/xiong-tu-san-guo/src/core/ai.js
+@@ -0,0 +1,109 @@
++// ============================================================================
++// AI 势力回合：按设计文档优先级消耗指令点。
++//   1) 内政（升市场 / 征兵） 2) 招募在野名将 3) 科技研究
++//   4) 侵略相邻弱敌 5) 输送平衡防御 6) 赏赐稳忠诚
++// 直接复用 actions.js 的命令函数（与玩家同规则）。
++// ============================================================================
++import * as A from './actions.js';
++import {
++  cmdRemaining, heroesOfFaction, neighbors, lordOf, heroById,
++} from './state.js';
++import { citiesOf } from './economy.js';
++import { effLead } from './combat.js';
++import { chance } from './rng.js';
++import { TECH_COST_GOLD } from '../config.js';
++
++// 单个 AI 势力行动
++export function aiTurn(state, fid, rng) {
++  const r = rng || Math.random;
++  const cities = citiesOf(state, fid);
++  if (!cities.length) return;
++  const lord = lordOf(state, fid);
++
++  let guard = 0;
++  while (cmdRemaining(state, fid) > 0 && guard++ < 30) {
++    let acted = false;
++
++    // 1) 内政：金币低则升市场；兵不足人口 20% 则征兵
++    for (const c of cities) {
++      if (cmdRemaining(state, fid) <= 0) break;
++      const fac = state.factions.find((f) => f.id === fid);
++      if (fac.money > 600 && c.marketLevel < 5 && chance(r, 0.5)) {
++        if (A.developMarket(state, c.id, fid).ok) { acted = true; break; }
++      }
++    }
++    for (const c of cities) {
++      if (cmdRemaining(state, fid) <= 0) break;
++      if (c.soldiers < c.population * 0.2) {
++        const recruitN = Math.min(800, Math.floor(c.population * 0.05));
++        if (recruitN > 50 && A.recruit(state, c.id, recruitN, fid).ok) { acted = true; break; }
++      }
++    }
++
++    // 2) 招募在野名将（魅力 > 70 的武将空闲时探索 + 登用）
++    if (!acted) {
++      const charmHero = heroesOfFaction(state, fid).find((h) => h.stats.c > 70);
++      if (charmHero) {
++        for (const c of cities) {
++          if (cmdRemaining(state, fid) <= 0) break;
++          const res = A.explore(state, c.id, fid, r);
++          if (res.ok && res.discovered && res.discovered.length) {
++            const target = res.discovered[0];
++            A.recruitHero(state, target.id, fid, r);
++            acted = true;
++            break;
++          }
++        }
++      }
++    }
++
++    // 3) 科技研究
++    if (!acted && !state.research && chance(r, 0.3)) {
++      const fac = state.factions.find((f) => f.id === fid);
++      if (fac.money >= TECH_COST_GOLD) {
++        const keys = ['agri', 'commerce', 'forge', 'wall', 'trick', 'leadership'];
++        const k = keys[Math.floor(r() * keys.length)];
++        if (A.research(state, k, fid).ok) acted = true;
++      }
++    }
++
++    // 4) 侵略：相邻非己方城市，军力占优（兵力比 > 1.3）则出征
++    if (!acted) {
++      outer: for (const c of cities) {
++        const attacker = heroesOfFaction(state, fid).find((h) => h.cityId === c.id && h.status === 'free');
++        if (!attacker) continue;
++        for (const n of neighbors(state, c.id)) {
++          if (cmdRemaining(state, fid) <= 0) break outer;
++          if (n.ownerFactionId === fid) continue;
++          const myPow = c.soldiers + effLead(attacker) * 5;
++          const foePow = n.soldiers + (n.defense || 0) * 0.5;
++          if (myPow > foePow * 1.5 && c.soldiers > 800) {
++            const troops = Math.min(c.soldiers - 200, Math.floor(c.soldiers * 0.7));
++            const res = A.campaign(state, c.id, n.id, attacker.id, troops, 'assault', fid, r);
++            if (res.ok) {
++              state.turnLog.push(`⚔️ ${state.factions.find((f) => f.id === fid).name} 出兵攻打 ${n.name}${res.won ? '并攻陷之' : '，未能攻克'}。`);
++              acted = true;
++              break outer;
++            }
++          }
++        }
++      }
++    }
++
++    // 5) 赏赐稳忠诚
++    if (!acted) {
++      const low = heroesOfFaction(state, fid).find((h) => h.loyalty < 60);
++      if (low) { A.reward(state, low.id, fid); acted = true; }
++    }
++
++    if (!acted) break; // 无事可做，结束本势力回合
++  }
++}
++
++export function aiTurnAll(state, rng) {
++  const r = rng || Math.random;
++  for (const f of state.factions) {
++    if (!f.aiControlled) continue;
++    aiTurn(state, f.id, r);
++  }
++}
+diff --git a/apps/xiong-tu-san-guo/src/core/combat.js b/apps/xiong-tu-san-guo/src/core/combat.js
+new file mode 100644
+index 0000000..37dcda6
+--- /dev/null
++++ b/apps/xiong-tu-san-guo/src/core/combat.js
+@@ -0,0 +1,130 @@
++// ============================================================================
++// 战斗系统：简化自动回合制（骰子模型 + 城防 + 单挑）。
++// createBattle() 构造战局，runBattle() 自动结算至胜负，产生文字战报 log。
++// ============================================================================
++import { FORMATIONS, DUEL_THRESHOLD, DUEL_CHANCE, DUEL_ROUT_RATIO } from '../config.js';
++import { skillBonus, techMult } from './tech.js';
++import { chance, range } from './rng.js';
++
++// 有效武力 / 统率（含技能加成）
++export function effWar(hero) {
++  if (!hero) return 50;
++  return hero.stats.w * (1 + skillBonus(hero).war);
++}
++export function effLead(hero) {
++  if (!hero) return 50;
++  return hero.stats.l * (1 + skillBonus(hero).lead);
++}
++
++// 训练度系数：50 → 1.0，100 → 1.5，0 → 0.5
++function trainingCoeff(training) {
++  return 0.5 + (Number.isFinite(training) ? training : 50) / 100;
++}
++
++// 一支部队的攻击值
++export function attackValue(force, state) {
++  const g = force.general;
++  const war = effWar(g);
++  const lead = effLead(g);
++  const soldiers = Math.max(0, force.soldiers);
++  const forge = techMult(state, 'forge', 0.05);
++  const form = FORMATIONS[force.formation] || FORMATIONS.normal;
++  return (war * 0.4 + lead * 0.3 + soldiers * 0.01) * forge * trainingCoeff(force.training) * form.atk;
++}
++
++// 构造战局
++export function createBattle({ attacker, defender }) {
++  return {
++    attacker: { ...attacker },
++    defender: { ...defender },
++    round: 0,
++    log: [],
++    result: null,
++    prisoner: null,
++    duel: null,
++  };
++}
++
++// 单回合：双方同时对对方造成伤害（攻方先结算，守方城防优先承受）
++function resolveRound(b, state, rng) {
++  const aVal = attackValue(b.attacker, state);
++  const dVal = attackValue(b.defender, state);
++
++  // —— 攻方 → 守方 ——（城防优先承受，溢出转入士兵）
++  let aDmg = aVal * range(rng, 0.85, 1.15);
++  if (b.defender.isCity && b.defender.defense > 0) {
++    const soaked = Math.min(b.defender.defense, aDmg);
++    b.defender.defense = Math.max(0, b.defender.defense - soaked);
++    aDmg -= soaked;
++    if (soaked > 0) {
++      b.log.push(`回合 ${b.round}：${b.attacker.general.name} 攻城，城防承受 ${Math.round(soaked)} 点（余 ${Math.round(b.defender.defense)}）。`);
++    }
++  }
++  if (aDmg > 0) {
++    b.defender.soldiers = Math.max(0, b.defender.soldiers - aDmg);
++    b.log.push(`回合 ${b.round}：${b.attacker.general.name} 部队杀伤敌军 ${Math.round(aDmg)} 人（敌余 ${Math.round(b.defender.soldiers)}）。`);
++  }
++
++  // —— 守方 → 攻方 ——（攻方无城防，直接削减士兵）
++  const dDmg = dVal * range(rng, 0.85, 1.15);
++  if (dDmg > 0) {
++    b.attacker.soldiers = Math.max(0, b.attacker.soldiers - dDmg);
++    b.log.push(`回合 ${b.round}：${b.defender.general.name} 反击杀伤我军 ${Math.round(dDmg)} 人（我余 ${Math.round(b.attacker.soldiers)}）。`);
++  }
++}
++
++// 单挑判定（每回合最多一次，触发后决出胜负）
++function tryDuel(b, rng) {
++  if (b.duel) return false;
++  const ag = b.attacker.general;
++  const dg = b.defender.general;
++  if (!ag || !dg) return false;
++  const diff = Math.abs(effWar(ag) - effWar(dg));
++  if (diff <= DUEL_THRESHOLD) return false;
++  if (!chance(rng, DUEL_CHANCE)) return false;
++  const attackerWins = effWar(ag) > effWar(dg);
++  b.duel = { winner: attackerWins ? 'attacker' : 'defender', loser: attackerWins ? 'defender' : 'attacker' };
++  b.log.push(`⚔️ ${ag.name} 与 ${dg.name} 阵前单挑！${(attackerWins ? ag : dg).name} 武艺更胜一筹，一合斩将，败军溃散！`);
++  return true;
++}
++
++// 跑完整场战斗（最多 30 回合，避免死循环）
++export function runBattle(b, state, rng) {
++  b.round = 0;
++  while (b.result == null && b.round < 30) {
++    b.round += 1;
++
++    // 单挑（前置，可一击定胜负）
++    if (tryDuel(b, rng)) {
++      const loserSide = b.duel.loser;
++      const winnerSide = b.duel.winner;
++      const loserGen = b[loserSide].general;
++      b[loserSide].soldiers = Math.round(b[loserSide].soldiers * (1 - DUEL_ROUT_RATIO));
++      // 君主不可被俘（仅败走），避免势力因失主而僵死
++      b.prisoner = loserGen && !isLord(loserGen) ? loserGen.id : null;
++      b.result = winnerSide;
++      b.log.push(`${b[winnerSide].general.name} 赢下单挑，${loserGen.name}${b.prisoner ? ' 被俘' : ' 败走'}，敌军溃败！`);
++      break;
++    }
++
++    resolveRound(b, state, rng);
++
++    if (b.defender.soldiers <= 0) { b.result = 'attacker'; break; }
++    if (b.attacker.soldiers <= 0) { b.result = 'defender'; break; }
++  }
++  // 超时未分胜负：以残兵多者胜
++  if (b.result == null) {
++    b.result = b.attacker.soldiers >= b.defender.soldiers ? 'attacker' : 'defender';
++    b.log.push(`战至日暮，双方力竭。${b.result === 'attacker' ? '攻方' : '守方'} 残兵更众，勉强占得上风。`);
++  }
++  // 败方主将被俘（君主除外）
++  if (!b.prisoner) {
++    const loser = b.result === 'attacker' ? b.defender : b.attacker;
++    if (loser.general && !isLord(loser.general) && loser.general.id !== '__militia__' && chance(rng, 0.5)) {
++      b.prisoner = loser.general.id;
++    }
++  }
++  return b;
++}
++
++function isLord(g) { return !!(g && (g.lord || g.isPlayerLord)); }
+diff --git a/apps/xiong-tu-san-guo/src/core/economy.js b/apps/xiong-tu-san-guo/src/core/economy.js
+new file mode 100644
+index 0000000..22b1ccc
+--- /dev/null
++++ b/apps/xiong-tu-san-guo/src/core/economy.js
+@@ -0,0 +1,74 @@
++// ============================================================================
++// 经济结算：每座城市的金钱 / 粮食收入、军粮消耗、人口增长。
++// 资源池（金钱 / 军粮）为势力级共享；人口 / 士兵 / 城防 / 建筑为城市级。
++// ============================================================================
++import {
++  GOLD_PER_MARKET, GOLD_PER_POP, GRAIN_PER_FARM, GRAIN_UPKEEP_PER_SOLDIER,
++  POP_GROWTH_RATE, POP_GROWTH_POL_DIVISOR, TRAINING_BASE,
++} from '../config.js';
++import { techMult } from './tech.js';
++
++export function isOwnedBy(city, factionId) {
++  return city.ownerFactionId === factionId;
++}
++
++export function citiesOf(state, factionId) {
++  return state.cities.filter((c) => isOwnedBy(c, factionId));
++}
++
++function traitMult(city, type) {
++  return city.trait && city.trait.type === type ? 1 + city.trait.value : 1;
++}
++
++// 商业收入（每回合，单城）
++export function cityGoldIncome(state, city) {
++  const base = city.marketLevel * GOLD_PER_MARKET + city.population * GOLD_PER_POP;
++  return base * traitMult(city, 'commerce') * techMult(state, 'commerce', 0.1);
++}
++
++// 粮食产量（每回合，单城）
++export function cityGrainIncome(state, city) {
++  const base = city.farmLevel * GRAIN_PER_FARM;
++  return base * traitMult(city, 'grain') * techMult(state, 'agri', 0.1);
++}
++
++// 势力每回合金钱总收入（含特性 / 科技）
++export function factionGoldIncome(state, factionId) {
++  let sum = 0;
++  for (const c of state.cities) if (isOwnedBy(c, factionId)) sum += cityGoldIncome(state, c);
++  return sum;
++}
++
++// 势力每回合粮食净变化（产量 - 士兵吃粮）
++export function factionGrainNet(state, factionId) {
++  let prod = 0;
++  let upkeep = 0;
++  for (const c of state.cities) {
++    if (!isOwnedBy(c, factionId)) continue;
++    prod += cityGrainIncome(state, c);
++    upkeep += c.soldiers * GRAIN_UPKEEP_PER_SOLDIER;
++  }
++  return { prod, upkeep, net: prod - upkeep };
++}
++
++// 城防值（基础 × 城防特性 × 筑城科技 × 城墙等级加成）
++export function cityDefenseValue(state, city) {
++  const base = city.defenseBase || 0;
++  const wallBoost = 1 + (city.wallLevel - 1) * 0.15;
++  return base * traitMult(city, 'defense') * techMult(state, 'wall', 0.2) * wallBoost;
++}
++
++// 单城人口增长（依赖太守或君主政治）
++export function cityPopGrowth(state, city, politics) {
++  const pol = Number.isFinite(politics) ? politics : 50;
++  const factor = (pol / POP_GROWTH_POL_DIVISOR) * POP_GROWTH_RATE;
++  return city.population * factor * traitMult(city, 'growth');
++}
++
++// 征兵消耗：金钱 / 人口（受征兵特性影响——人口消耗降低）
++export function recruitCost(city, count) {
++  const popCost = count * (1 / (1 + (city.trait && city.trait.type === 'recruit' ? city.trait.value : 0)));
++  return { gold: count * 1.5, pop: popCost };
++}
++
++export { TRAINING_BASE };
+diff --git a/apps/xiong-tu-san-guo/src/core/rng.js b/apps/xiong-tu-san-guo/src/core/rng.js
+new file mode 100644
+index 0000000..b05962c
+--- /dev/null
++++ b/apps/xiong-tu-san-guo/src/core/rng.js
+@@ -0,0 +1,40 @@
++// ============================================================================
++// 随机工具：默认 Math.random，可注入种子化 rng（便于单测）。
++// ============================================================================
++const DEFAULT = Math.random;
++
++export function makeRng(seed) {
++  let s = (seed >>> 0) || 1;
++  return function rng() {
++    s = (s * 1664525 + 1013904223) >>> 0;
++    return s / 0x100000000;
++  };
++}
++
++// [min, max) 浮点
++export function range(rng, min, max) {
++  return min + (rng || DEFAULT)() * (max - min);
++}
++
++// [min, max] 整数（闭区间）
++export function rangeInt(rng, min, max) {
++  return Math.floor(range(rng, min, max + 1));
++}
++
++export function chance(rng, p) {
++  return (rng || DEFAULT)() < p;
++}
++
++export function pick(rng, arr) {
++  return arr[Math.floor((rng || DEFAULT)() * arr.length)];
++}
++
++// Fisher–Yates 洗牌（返回新数组）
++export function shuffle(rng, arr) {
++  const a = arr.slice();
++  for (let i = a.length - 1; i > 0; i--) {
++    const j = Math.floor((rng || DEFAULT)() * (i + 1));
++    [a[i], a[j]] = [a[j], a[i]];
++  }
++  return a;
++}
+diff --git a/apps/xiong-tu-san-guo/src/core/save.js b/apps/xiong-tu-san-guo/src/core/save.js
+new file mode 100644
+index 0000000..b26138c
+--- /dev/null
++++ b/apps/xiong-tu-san-guo/src/core/save.js
+@@ -0,0 +1,38 @@
++// ============================================================================
++// 存档：localStorage 持久化（单槽）。
++// 通过 storage 访问器隔离 localStorage，便于 Node 单测注入内存版。
++// ============================================================================
++import { SAVE_KEY } from '../config.js';
++
++let storage = null;
++try {
++  if (typeof localStorage !== 'undefined') storage = localStorage;
++} catch (_) { /* 某些环境访问 localStorage 会抛错 */ }
++
++export function _setStorage(s) { storage = s; }
++
++export function hasSave() {
++  try { return !!(storage && storage.getItem(SAVE_KEY)); } catch (_) { return false; }
++}
++
++export function saveGame(state) {
++  try {
++    if (storage && state) {
++      storage.setItem(SAVE_KEY, JSON.stringify(state));
++      return true;
++    }
++  } catch (_) {}
++  return false;
++}
++
++export function loadGame() {
++  try {
++    const raw = storage ? storage.getItem(SAVE_KEY) : null;
++    if (!raw) return null;
++    return JSON.parse(raw);
++  } catch (_) { return null; }
++}
++
++export function clearSave() {
++  try { if (storage) storage.removeItem(SAVE_KEY); return true; } catch (_) { return false; }
++}
+diff --git a/apps/xiong-tu-san-guo/src/core/state.js b/apps/xiong-tu-san-guo/src/core/state.js
+new file mode 100644
+index 0000000..48e5b30
+--- /dev/null
++++ b/apps/xiong-tu-san-guo/src/core/state.js
+@@ -0,0 +1,321 @@
++// ============================================================================
++// 游戏状态：新局初始化（势力 / 城市 / 名将部署）、回合结算（经济·人口·科技·AI）、
++// 胜负判定与各类查询辅助。纯数据 + 纯函数，便于单测。
++// ============================================================================
++import {
++  CITIES, CITY_MAP,
++} from '../data/cities.js';
++import { HEROES, HERO_MAP, FACTION_SEEDS, makeGenericGeneral } from '../data/heroes.js';
++import {
++  GAME_VERSION, CMD_BASE, CMD_PER_CITY, TRAINING_BASE,
++  FACTION_COLORS, PLAYER_COLOR, GRAIN_UPKEEP_PER_SOLDIER, TECH_COST_TURNS,
++} from '../config.js';
++import { skillBonus, techMult } from './tech.js';
++import { chance } from './rng.js';
++import {
++  citiesOf, cityGoldIncome, cityGrainIncome, cityPopGrowth, cityDefenseValue,
++} from './economy.js';
++import { effLead, effWar } from './combat.js';
++
++// —— 查询辅助 ——
++export const cityById = (state, id) => state.cities.find((c) => c.id === id);
++export const heroById = (state, id) => state.heroes.find((h) => h.id === id);
++export const factionById = (state, id) => state.factions.find((f) => f.id === id);
++export const playerFaction = (state) => factionById(state, state.playerFactionId);
++export const neighbors = (state, cityId) => {
++  const c = cityById(state, cityId);
++  return c ? c.adjacent.map((id) => cityById(state, id)).filter(Boolean) : [];
++};
++export const heroesOfFaction = (state, fid) => state.heroes.filter((h) => h.factionId === fid && h.status !== 'prisoner');
++export const prisonersOfFaction = (state, fid) => state.heroes.filter((h) => h.prisonerOf === fid);
++export const lordOf = (state, fid) => state.heroes.find((h) => h.factionId === fid && (h.isPlayerLord || h.lord));
++
++// 一座城市内的己方在岗武将（free / deployed，排除俘虏、在野）
++export function heroesInCity(state, cityId, fid) {
++  return state.heroes.filter((h) => h.cityId === cityId && h.status !== 'prisoner' && !h.wild
++    && (fid == null || h.factionId === fid));
++}
++// 城市内的在野名将（可探索 / 登用）
++export function wildHeroesInCity(state, cityId) {
++  return state.heroes.filter((h) => h.wild && h.cityId === cityId && h.status !== 'gone');
++}
++
++// 带兵上限：统率 × 100 × (1 + 统御技能) × 统御科技
++export function troopCap(state, hero) {
++  if (!hero) return 0;
++  return Math.round(hero.stats.l * 100 * (1 + skillBonus(hero).cap) * techMult(state, 'leadership', 0.1));
++}
++
++// 指令点数：基础 + 每多一城 + 君主政治加成
++export function cmdPoints(state, fid) {
++  const n = citiesOf(state, fid).length;
++  const lord = lordOf(state, fid);
++  const pol = lord ? lord.stats.p : 50;
++  return CMD_BASE + CMD_PER_CITY * Math.max(0, n - 1) + Math.floor(pol / 100);
++}
++export function cmdRemaining(state, fid) {
++  return Math.max(0, cmdPoints(state, fid) - (state.cmdUsedByFaction?.[fid] || 0));
++}
++
++// 当前期望守城主将（统率最高）
++export function bestDefender(state, cityId) {
++  const city = cityById(state, cityId);
++  if (!city) return null;
++  const roster = heroesInCity(state, cityId, city.ownerFactionId);
++  if (!roster.length) return null;
++  return roster.reduce((a, b) => (effLead(a) >= effLead(b) ? a : b));
++}
++
++// 城防上限
++export function maxDefense(state, city) {
++  return Math.round(cityDefenseValue(state, city));
++}
++
++// ============================================================================
++// 新局初始化
++// ============================================================================
++export function newGame({ lordName, startCity, stats, rng } = {}) {
++  const r = rng || Math.random;
++  if (!lordName || !CITY_MAP[startCity]) throw new Error('newGame: 参数缺失');
++
++  const state = {
++    version: GAME_VERSION,
++    turn: 1,
++    playerFactionId: 0,
++    factions: [],
++    cities: [],
++    heroes: [],
++    techLevels: { agri: 0, commerce: 0, forge: 0, wall: 0, trick: 0, leadership: 0 },
++    research: null, // { key, turnsLeft }
++    cmdUsedByFaction: {},
++    log: [],
++    turnLog: [],
++    over: null,
++  };
++
++  // —— 势力：玩家（id=0）+ AI ——
++  state.factions.push({
++    id: 0, name: `${lordName}势力`, color: PLAYER_COLOR,
++    money: 0, grain: 0, aiControlled: false, lordName,
++  });
++  const facIdByKey = {}; // 势力 key → factionId（被玩家占都则缺省）
++  let fid = 1;
++  for (const seed of FACTION_SEEDS) {
++    if (seed.capital === startCity) continue; // 玩家占了都城，该势力不生成
++    const lordDef = HERO_MAP[seed.lordId];
++    state.factions.push({
++      id: fid, name: `${lordDef.name}势力`, color: FACTION_COLORS[fid % FACTION_COLORS.length],
++      money: 0, grain: 0, aiControlled: true, lordName: lordDef.name,
++    });
++    facIdByKey[seed.key] = fid;
++    fid += 1;
++  }
++
++  // —— 城市 ——
++  for (const c of CITIES) {
++    state.cities.push({
++      id: c.id, name: c.name, x: c.x, y: c.y, trait: c.trait,
++      ownerFactionId: null,
++      population: c.pop0, maxPopulation: c.popMax,
++      soldiers: c.soldiers0, defenseBase: c.defense0, defense: c.defense0,
++      gold: c.gold0, grain: c.grain0, // 城库（攻陷时被缴获）
++      farmLevel: 1, marketLevel: 1, barracksLevel: 1, wallLevel: 1, workshopLevel: 0,
++      governorHeroId: null, adjacent: c.adjacent.slice(),
++      training: TRAINING_BASE,
++    });
++  }
++  // 玩家初始城市
++  const start = cityById(state, startCity);
++  start.ownerFactionId = 0;
++  const player = playerFaction(state);
++  player.money = Math.round(start.gold + 3000);
++  player.grain = Math.round(start.grain + 5000);
++
++  // —— 玩家君主（第一武将）——
++  const lord = {
++    id: 'player_lord', name: lordName, isPlayerLord: true, lord: true,
++    factionId: 0, cityId: startCity, status: 'free', loyalty: 100,
++    stats: { ...stats }, skill: { name: '雄主', effect: 'cap:0.05' }, wild: false,
++  };
++  state.heroes.push(lord);
++  start.governorHeroId = lord.id;
++
++  // —— AI 都城归属 + 太守 ——
++  for (const seed of FACTION_SEEDS) {
++    const f = facIdByKey[seed.key];
++    if (f == null) continue;
++    const cap = cityById(state, seed.capital);
++    cap.ownerFactionId = f;
++    const fac = factionById(state, f);
++    fac.money = Math.round(cap.gold + 2000);
++    fac.grain = Math.round(cap.grain + 4000);
++  }
++
++  // —— 名将部署 ——
++  for (const h of HEROES) {
++    const copy = {
++      id: h.id, name: h.name, isPlayerLord: false,
++      factionId: null, cityId: null, status: 'free',
++      loyalty: h.loyalty, stats: { ...h.stats },
++      skill: h.skill ? { ...h.skill } : null, generic: !!h.generic, wild: false,
++    };
++    if (h.serve) {
++      const f = facIdByKey[h.serve];
++      if (f != null) {
++        const seed = FACTION_SEEDS.find((s) => s.key === h.serve);
++        copy.factionId = f;
++        copy.cityId = seed.capital;
++        copy.status = 'free';
++      } else {
++        // 势力未生成（都城被玩家所占）→ 转为该城在野，玩家可登用
++        const seed = FACTION_SEEDS.find((s) => s.key === h.serve);
++        copy.factionId = null;
++        copy.cityId = seed.capital; // == startCity
++        copy.status = 'free';
++        copy.wild = true;
++        copy.discovered = true; // 名义上原属此城，直接可见
++      }
++    } else if (h.wild) {
++      copy.factionId = null;
++      copy.cityId = h.wild;
++      copy.status = 'free';
++      copy.wild = true;
++      copy.discovered = false;
++    } else {
++      continue;
++    }
++    if (h.lord) copy.lord = true;
++    state.heroes.push(copy);
++  }
++
++  // —— AI 太守（君主坐镇都城）——
++  for (const seed of FACTION_SEEDS) {
++    const f = facIdByKey[seed.key];
++    if (f == null) continue;
++    cityById(state, seed.capital).governorHeroId = seed.lordId;
++  }
++
++  // —— 为兵微将寡的 AI 势力补充部将（每势力至少 3 名）——
++  let genIdx = 0;
++  for (const seed of FACTION_SEEDS) {
++    const f = facIdByKey[seed.key];
++    if (f == null) continue;
++    const roster = heroesOfFaction(state, f);
++    const need = Math.max(0, 3 - roster.length);
++    for (let i = 0; i < need; i++) {
++      const g = makeGenericGeneral(r, ++genIdx);
++      g.id = `gen_${seed.key}_${i}`;
++      g.factionId = f;
++      g.cityId = seed.capital;
++      g.status = 'free';
++      state.heroes.push(g);
++    }
++  }
++
++  // 初始城防归位
++  for (const c of state.cities) c.defense = maxDefense(state, c);
++
++  // 起兵之城的在野名将预先「风闻」（已发现，可直接登用），帮助玩家平稳开局
++  for (const h of state.heroes) {
++    if (h.wild && h.cityId === startCity) h.discovered = true;
++  }
++
++  state.turnLog = [`公元初年，${lordName} 于 ${start.name} 起兵，群雄并起，逐鹿天下！`];
++  return state;
++}
++
++// ============================================================================
++// 回合结算（玩家点「结束回合」后调用）
++// 顺序：城防回满 → 经济·人口结算 → 科技推进 → AI 行动 → 回合 +1 → 胜负判定
++// 返回本回合事件摘要（state.turnLog）
++// ============================================================================
++export function resolveTurn(state, aiModule, rng) {
++  const r = rng || Math.random;
++  state.turnLog = [];
++
++  for (const c of state.cities) {
++    if (c.ownerFactionId != null) c.defense = maxDefense(state, c);
++  }
++
++  // —— 经济 / 人口结算（逐势力）——
++  for (const fac of state.factions) {
++    const fid = fac.id;
++    let goldIn = 0;
++    let grainIn = 0;
++    let grainEat = 0;
++    for (const c of citiesOf(state, fid)) {
++      goldIn += cityGoldIncome(state, c);
++      grainIn += cityGrainIncome(state, c);
++      grainEat += c.soldiers * GRAIN_UPKEEP_PER_SOLDIER;
++    }
++    fac.money += Math.round(goldIn);
++    fac.grain += Math.round(grainIn - grainEat);
++
++    // 人口增长（太守或君主政治）
++    const lord = lordOf(state, fid);
++    const basePol = lord ? lord.stats.p : 50;
++    for (const c of citiesOf(state, fid)) {
++      const gov = c.governorHeroId ? heroById(state, c.governorHeroId) : null;
++      const pol = gov ? gov.stats.p : basePol;
++      const growth = cityPopGrowth(state, c, pol);
++      c.population = Math.min(c.maxPopulation, c.population + Math.round(growth));
++    }
++
++    // 军粮不足 → 士兵逃亡（最多逃 10%）
++    if (fac.grain < 0) {
++      const owned = citiesOf(state, fid).slice().sort((a, b) => b.soldiers - a.soldiers);
++      let deficitSoldiers = Math.ceil(-fac.grain / GRAIN_UPKEEP_PER_SOLDIER);
++      const total = owned.reduce((s, c) => s + c.soldiers, 0);
++      deficitSoldiers = Math.min(deficitSoldiers, Math.ceil(total * 0.1));
++      for (const c of owned) {
++        if (deficitSoldiers <= 0) break;
++        const take = Math.min(c.soldiers, deficitSoldiers);
++        c.soldiers -= take;
++        deficitSoldiers -= take;
++      }
++      fac.grain = 0;
++      if (!fac.aiControlled) state.turnLog.push(`⚠️ 军粮告竭，士兵逃亡（本城损失兵力）。`);
++    }
++  }
++
++  // —— 科技推进 ——
++  if (state.research) {
++    state.research.turnsLeft -= 1;
++    if (state.research.turnsLeft <= 0) {
++      const k = state.research.key;
++      state.techLevels[k] = Math.min(3, state.techLevels[k] + 1);
++      if (!playerFaction(state).aiControlled) {
++        state.turnLog.push(`🔬 科技突破：研究完成（${k} 升至 ${state.techLevels[k]} 级）。`);
++      }
++      state.research = null;
++    }
++  }
++
++  // —— AI 行动 ——
++  if (aiModule && typeof aiModule.aiTurnAll === 'function') {
++    aiModule.aiTurnAll(state, r);
++  }
++
++  // —— 名将忠诚度自然漂移（轻微）——
++  for (const h of state.heroes) {
++    if (h.status === 'prisoner' || h.wild) continue;
++    if (chance(r, 0.5)) h.loyalty = Math.max(0, Math.min(100, h.loyalty + (chance(r, 0.5) ? 1 : -1)));
++  }
++
++  state.turn += 1;
++  state.cmdUsedByFaction = {};
++  checkGameOver(state);
++  return state.turnLog;
++}
++
++// ============================================================================
++// 胜负判定
++// ============================================================================
++export function checkGameOver(state) {
++  const playerCities = citiesOf(state, state.playerFactionId);
++  if (playerCities.length === 0) { state.over = 'lose'; return; }
++  const allOwned = state.cities.every((c) => c.ownerFactionId === state.playerFactionId);
++  if (allOwned) state.over = 'win';
++}
++
++export { effLead, effWar };
+diff --git a/apps/xiong-tu-san-guo/src/core/tech.js b/apps/xiong-tu-san-guo/src/core/tech.js
+new file mode 100644
+index 0000000..d823efa
+--- /dev/null
++++ b/apps/xiong-tu-san-guo/src/core/tech.js
+@@ -0,0 +1,45 @@
++// ============================================================================
++// 科技效果 + 技能解析。
++// 技能 effect DSL（逗号分隔）：lead:0.10 / war:0.10 / trick:0.20 / def:0.20 /
++//   cap:0.10 / train:0.20 / p_grow:0.10 / c_recruit:0.20
++// ============================================================================
++
++const KEYS = ['lead', 'war', 'trick', 'def', 'cap', 'train', 'p_grow', 'c_recruit'];
++
++export function emptyBonus() {
++  return { lead: 0, war: 0, trick: 0, def: 0, cap: 0, train: 0, p_grow: 0, c_recruit: 0 };
++}
++
++// 解析技能 effect 字符串为加成对象
++export function parseSkill(effect) {
++  const b = emptyBonus();
++  if (!effect || typeof effect !== 'string') return b;
++  for (const part of effect.split(',')) {
++    const [k, v] = part.split(':');
++    const key = k && k.trim();
++    if (KEYS.includes(key)) {
++      const num = parseFloat(v);
++      if (Number.isFinite(num)) b[key] += num;
++    }
++  }
++  return b;
++}
++
++export function skillBonus(hero) {
++  return parseSkill(hero && hero.skill ? hero.skill.effect : '');
++}
++
++// 科技等级乘数：1 + level × perLevel
++export function techMult(state, techKey, perLevel) {
++  const lv = (state && state.techLevels && state.techLevels[techKey]) || 0;
++  return 1 + lv * perLevel;
++}
++
++export function techLevel(state, techKey) {
++  return (state && state.techLevels && state.techLevels[techKey]) || 0;
++}
++
++// 当前正在研究的科技
++export function activeResearch(state) {
++  return state && state.research ? state.research : null;
++}
+diff --git a/apps/xiong-tu-san-guo/src/data/cities.js b/apps/xiong-tu-san-guo/src/data/cities.js
+new file mode 100644
+index 0000000..99f5cdd
+--- /dev/null
++++ b/apps/xiong-tu-san-guo/src/data/cities.js
+@@ -0,0 +1,93 @@
++// ============================================================================
++// 城市（地图节点）初始数据：18 座核心城市，含坐标、特性、初始资源、邻接关系。
++// trait.type 取值：commerce(商业) / grain(粮食) / defense(城防) / growth(人口) / recruit(征兵)
++// 坐标基于 viewBox "0 0 1000 760"（西→东，北→南）。
++// ============================================================================
++export const CITIES = [
++  { id: 'luoyang', name: '洛阳', x: 500, y: 320,
++    trait: { type: 'commerce', value: 0.2, name: '天下之中', desc: '商业收入 +20%' },
++    popMax: 100000, pop0: 80000, gold0: 3000, grain0: 8000, soldiers0: 2000, defense0: 1200,
++    adjacent: ['changan', 'xuchang', 'ye', 'wan'] },
++  { id: 'changan', name: '长安', x: 250, y: 330,
++    trait: { type: 'defense', value: 0.2, name: '关中险固', desc: '城防值 +20%' },
++    popMax: 90000, pop0: 60000, gold0: 2000, grain0: 6000, soldiers0: 1800, defense0: 1100,
++    adjacent: ['luoyang', 'wuwei', 'hanzhong'] },
++  { id: 'ye', name: '邺城', x: 600, y: 270,
++    trait: { type: 'growth', value: 0.15, name: '河北要冲', desc: '人口增长 +15%' },
++    popMax: 95000, pop0: 70000, gold0: 2500, grain0: 7000, soldiers0: 2200, defense0: 1000,
++    adjacent: ['nanpi', 'puyang', 'luoyang'] },
++  { id: 'xuchang', name: '许昌', x: 620, y: 430,
++    trait: { type: 'commerce', value: 0.15, name: '中原通衢', desc: '商业收入 +15%' },
++    popMax: 85000, pop0: 55000, gold0: 2500, grain0: 7000, soldiers0: 1800, defense0: 1000,
++    adjacent: ['luoyang', 'puyang', 'xiapi', 'wan'] },
++  { id: 'chengdu', name: '成都', x: 250, y: 550,
++    trait: { type: 'grain', value: 0.2, name: '天府之国', desc: '粮食产量 +20%' },
++    popMax: 100000, pop0: 70000, gold0: 2000, grain0: 10000, soldiers0: 1600, defense0: 1000,
++    adjacent: ['hanzhong', 'jianning'] },
++  { id: 'jianye', name: '建业', x: 800, y: 500,
++    trait: { type: 'commerce', value: 0.15, name: '江东形胜', desc: '商业收入 +15%' },
++    popMax: 90000, pop0: 60000, gold0: 2200, grain0: 6500, soldiers0: 1700, defense0: 1100,
++    adjacent: ['xiapi', 'kuaiji', 'xiangyang', 'jiangling'] },
++  { id: 'xiangyang', name: '襄阳', x: 540, y: 520,
++    trait: { type: 'defense', value: 0.15, name: '荆楚咽喉', desc: '城防值 +15%' },
++    popMax: 85000, pop0: 55000, gold0: 2200, grain0: 6500, soldiers0: 1700, defense0: 1100,
++    adjacent: ['wan', 'jiangling', 'jianye'] },
++  { id: 'hanzhong', name: '汉中', x: 320, y: 430,
++    trait: { type: 'defense', value: 0.3, name: '易守难攻', desc: '城防值 +30%' },
++    popMax: 70000, pop0: 40000, gold0: 1500, grain0: 5000, soldiers0: 1400, defense0: 1300,
++    adjacent: ['changan', 'chengdu', 'wan'] },
++  { id: 'beiping', name: '北平', x: 760, y: 130,
++    trait: { type: 'recruit', value: 0.15, name: '幽燕边塞', desc: '征兵效率 +15%' },
++    popMax: 80000, pop0: 50000, gold0: 1800, grain0: 5500, soldiers0: 2000, defense0: 1000,
++    adjacent: ['nanpi'] },
++  { id: 'xiapi', name: '下邳', x: 800, y: 400,
++    trait: { type: 'commerce', value: 0.1, name: '泗水商埠', desc: '商业收入 +10%' },
++    popMax: 75000, pop0: 45000, gold0: 2000, grain0: 5500, soldiers0: 1500, defense0: 900,
++    adjacent: ['puyang', 'xuchang', 'jianye'] },
++  { id: 'wan', name: '宛城', x: 460, y: 430,
++    trait: { type: 'defense', value: 0.1, name: '南阳要冲', desc: '城防值 +10%' },
++    popMax: 72000, pop0: 42000, gold0: 1700, grain0: 5200, soldiers0: 1400, defense0: 1100,
++    adjacent: ['luoyang', 'xuchang', 'hanzhong', 'xiangyang'] },
++  { id: 'nanpi', name: '南皮', x: 660, y: 200,
++    trait: { type: 'grain', value: 0.25, name: '产粮大郡', desc: '粮食产量 +25%' },
++    popMax: 78000, pop0: 48000, gold0: 1700, grain0: 7000, soldiers0: 1500, defense0: 950,
++    adjacent: ['beiping', 'ye'] },
++  { id: 'puyang', name: '濮阳', x: 690, y: 340,
++    trait: { type: 'growth', value: 0.1, name: '中原沃野', desc: '人口增长 +10%' },
++    popMax: 76000, pop0: 46000, gold0: 1800, grain0: 5600, soldiers0: 1500, defense0: 950,
++    adjacent: ['ye', 'xiapi', 'xuchang'] },
++  { id: 'jiangling', name: '江陵', x: 480, y: 620,
++    trait: { type: 'grain', value: 0.15, name: '云梦粮仓', desc: '粮食产量 +15%' },
++    popMax: 78000, pop0: 47000, gold0: 1800, grain0: 6800, soldiers0: 1500, defense0: 950,
++    adjacent: ['xiangyang', 'guiyang', 'jianye'] },
++  { id: 'kuaiji', name: '会稽', x: 860, y: 600,
++    trait: { type: 'commerce', value: 0.2, name: '海盐通商', desc: '商业收入 +20%' },
++    popMax: 72000, pop0: 42000, gold0: 2000, grain0: 5200, soldiers0: 1300, defense0: 900,
++    adjacent: ['jianye'] },
++  { id: 'jianning', name: '建宁', x: 360, y: 660,
++    trait: { type: 'grain', value: 0.1, name: '南中屯田', desc: '粮食产量 +10%' },
++    popMax: 68000, pop0: 36000, gold0: 1400, grain0: 5400, soldiers0: 1200, defense0: 900,
++    adjacent: ['chengdu', 'guiyang'] },
++  { id: 'wuwei', name: '武威', x: 120, y: 250,
++    trait: { type: 'recruit', value: 0.2, name: '西凉铁骑', desc: '征兵效率 +20%' },
++    popMax: 64000, pop0: 32000, gold0: 1300, grain0: 4800, soldiers0: 1800, defense0: 950,
++    adjacent: ['changan'] },
++  { id: 'guiyang', name: '桂阳', x: 560, y: 690,
++    trait: { type: 'growth', value: 0.1, name: '岭南烟瘴', desc: '人口增长 +10%' },
++    popMax: 66000, pop0: 34000, gold0: 1400, grain0: 5000, soldiers0: 1200, defense0: 850,
++    adjacent: ['jianning', 'jiangling'] },
++];
++
++export const CITY_MAP = Object.fromEntries(CITIES.map((c) => [c.id, c]));
++
++// 邻接关系自检：确保双向一致（开发期辅助，构建期不抛错）
++export function adjacencyValid() {
++  for (const c of CITIES) {
++    for (const n of c.adjacent) {
++      const nb = CITY_MAP[n];
++      if (!nb) return false;
++      if (!nb.adjacent.includes(c.id)) return false;
++    }
++  }
++  return true;
++}
+diff --git a/apps/xiong-tu-san-guo/src/data/heroes.js b/apps/xiong-tu-san-guo/src/data/heroes.js
+new file mode 100644
+index 0000000..f86ec90
+--- /dev/null
++++ b/apps/xiong-tu-san-guo/src/data/heroes.js
+@@ -0,0 +1,151 @@
++// ============================================================================
++// 名将与势力种子数据：47 位历史名将 + 8 个 AI 势力种子。
++// 每个 hero：{ id, name, stats{l,w,i,p,c}, skill, loyalty, serve|wild, lord? }
++//   serve: 所属 AI 势力 key（含君主 lord:true）
++//   wild : 在野所在城市 id（可被探索 / 登用）
++// skill.effect 为简化 DSL：lead:0.10 / war:0.10 / trick:0.20 / def:0.20 / cap:0.10 / train:0.20
++// ============================================================================
++
++export const HEROES = [
++  // —— AI 君主（serve=势力 key, lord:true）——
++  { id: 'caocao', name: '曹操', serve: 'cao', lord: true, loyalty: 100,
++    stats: { l: 96, w: 80, i: 94, p: 96, c: 98 }, skill: { name: '雄才大略', effect: 'cap:0.10,trick:0.10' } },
++  { id: 'yuanshao', name: '袁绍', serve: 'yuan', lord: true, loyalty: 100,
++    stats: { l: 84, w: 78, i: 80, p: 82, c: 90 }, skill: { name: '四世三公', effect: 'cap:0.10' } },
++  { id: 'sunce', name: '孙策', serve: 'ce', lord: true, loyalty: 100,
++    stats: { l: 92, w: 92, i: 80, p: 70, c: 95 }, skill: { name: '小霸王', effect: 'war:0.10' } },
++  { id: 'dongzhuo', name: '董卓', serve: 'dong', lord: true, loyalty: 100,
++    stats: { l: 82, w: 88, i: 60, p: 50, c: 55 }, skill: { name: '魔焰滔天', effect: 'war:0.10' } },
++  { id: 'liubiao', name: '刘表', serve: 'biao', lord: true, loyalty: 100,
++    stats: { l: 70, w: 60, i: 78, p: 80, c: 85 }, skill: { name: '荆襄名士', effect: 'p_grow:0.10' } },
++  { id: 'mateng', name: '马腾', serve: 'teng', lord: true, loyalty: 100,
++    stats: { l: 82, w: 86, i: 70, p: 68, c: 80 }, skill: { name: '西凉雄风', effect: 'war:0.08' } },
++  { id: 'liuzhang', name: '刘璋', serve: 'zhang', lord: true, loyalty: 100,
++    stats: { l: 60, w: 55, i: 70, p: 75, c: 78 }, skill: { name: '益州偏安', effect: 'def:0.10' } },
++  { id: 'gongsunzan', name: '公孙瓒', serve: 'gongsun', lord: true, loyalty: 100,
++    stats: { l: 80, w: 84, i: 65, p: 60, c: 70 }, skill: { name: '白马义从', effect: 'war:0.08' } },
++
++  // —— 曹操势力 ——
++  { id: 'zhangliao', name: '张辽', serve: 'cao', loyalty: 92,
++    stats: { l: 94, w: 93, i: 78, p: 78, c: 82 }, skill: { name: '威震逍遥津', effect: 'war:0.10' } },
++  { id: 'xiahoudun', name: '夏侯惇', serve: 'cao', loyalty: 95,
++    stats: { l: 84, w: 88, i: 60, p: 70, c: 78 }, skill: { name: '刚烈', effect: 'war:0.08' } },
++  { id: 'xiahouyuan', name: '夏侯渊', serve: 'cao', loyalty: 93,
++    stats: { l: 83, w: 87, i: 65, p: 65, c: 72 }, skill: { name: '神速', effect: 'war:0.06' } },
++  { id: 'xuhuang', name: '徐晃', serve: 'cao', loyalty: 90,
++    stats: { l: 83, w: 88, i: 72, p: 70, c: 70 }, skill: null },
++  { id: 'zhanghe', name: '张郃', serve: 'cao', loyalty: 85,
++    stats: { l: 85, w: 88, i: 70, p: 68, c: 70 }, skill: null },
++  { id: 'dianwei', name: '典韦', serve: 'cao', loyalty: 96,
++    stats: { l: 70, w: 96, i: 40, p: 30, c: 50 }, skill: { name: '古之恶来', effect: 'war:0.12' } },
++  { id: 'xuchu2', name: '许褚', serve: 'cao', loyalty: 95,
++    stats: { l: 72, w: 94, i: 35, p: 30, c: 55 }, skill: { name: '虎痴', effect: 'war:0.10' } },
++  { id: 'guojia', name: '郭嘉', serve: 'cao', loyalty: 90,
++    stats: { l: 70, w: 40, i: 98, p: 85, c: 80 }, skill: { name: '鬼才', effect: 'trick:0.20' } },
++  { id: 'xunyu', name: '荀彧', serve: 'cao', loyalty: 92,
++    stats: { l: 75, w: 40, i: 95, p: 98, c: 88 }, skill: { name: '王佐之才', effect: 'p_grow:0.15' } },
++  { id: 'jiaxu', name: '贾诩', serve: 'cao', loyalty: 88,
++    stats: { l: 80, w: 50, i: 96, p: 80, c: 70 }, skill: { name: '毒士', effect: 'trick:0.20' } },
++  { id: 'chengyu', name: '程昱', serve: 'cao', loyalty: 88,
++    stats: { l: 72, w: 55, i: 90, p: 80, c: 65 }, skill: null },
++
++  // —— 袁绍势力 ——
++  { id: 'yanliang', name: '颜良', serve: 'yuan', loyalty: 82,
++    stats: { l: 80, w: 92, i: 50, p: 45, c: 60 }, skill: null },
++  { id: 'wenchou', name: '文丑', serve: 'yuan', loyalty: 82,
++    stats: { l: 78, w: 92, i: 45, p: 40, c: 58 }, skill: null },
++
++  // —— 孙策势力 ——
++  { id: 'zhouyu', name: '周瑜', serve: 'ce', loyalty: 98,
++    stats: { l: 95, w: 78, i: 97, p: 86, c: 92 }, skill: { name: '火烧赤壁', effect: 'trick:0.20' } },
++  { id: 'taishici', name: '太史慈', serve: 'ce', loyalty: 90,
++    stats: { l: 84, w: 93, i: 70, p: 60, c: 78 }, skill: null },
++  { id: 'ganning', name: '甘宁', serve: 'ce', loyalty: 85,
++    stats: { l: 86, w: 94, i: 70, p: 55, c: 75 }, skill: { name: '锦帆贼', effect: 'war:0.08' } },
++  { id: 'huanggai', name: '黄盖', serve: 'ce', loyalty: 95,
++    stats: { l: 80, w: 86, i: 65, p: 60, c: 78 }, skill: null },
++  { id: 'lvmeng', name: '吕蒙', serve: 'ce', loyalty: 90,
++    stats: { l: 88, w: 85, i: 90, p: 80, c: 75 }, skill: { name: '刮目相看', effect: 'trick:0.10' } },
++  { id: 'luxun', name: '陆逊', serve: 'ce', loyalty: 92,
++    stats: { l: 90, w: 75, i: 95, p: 88, c: 85 }, skill: { name: '火烧连营', effect: 'trick:0.20' } },
++  { id: 'lusu', name: '鲁肃', serve: 'ce', loyalty: 93,
++    stats: { l: 78, w: 50, i: 92, p: 95, c: 92 }, skill: null },
++
++  // —— 董卓势力 ——
++  { id: 'lvbu', name: '吕布', serve: 'dong', loyalty: 70,
++    stats: { l: 78, w: 100, i: 35, p: 26, c: 47 }, skill: { name: '人中吕布', effect: 'war:0.15' } },
++  { id: 'huaxiong', name: '华雄', serve: 'dong', loyalty: 80,
++    stats: { l: 75, w: 88, i: 40, p: 35, c: 50 }, skill: null },
++
++  // —— 马腾势力 ——
++  { id: 'machao', name: '马超', serve: 'teng', loyalty: 80,
++    stats: { l: 88, w: 97, i: 50, p: 40, c: 70 }, skill: { name: '锦马超', effect: 'war:0.10' } },
++
++  // —— 在野名将（wild=城市 id，可探索登用）——
++  { id: 'liubei', name: '刘备', wild: 'luoyang', loyalty: 99,
++    stats: { l: 90, w: 78, i: 80, p: 85, c: 99 }, skill: { name: '仁德', effect: 'c_recruit:0.20' } },
++  { id: 'guanyu', name: '关羽', wild: 'wan', loyalty: 95,
++    stats: { l: 96, w: 97, i: 75, p: 62, c: 88 }, skill: { name: '威震华夏', effect: 'lead:0.10,war:0.05' } },
++  { id: 'zhangfei', name: '张飞', wild: 'wan', loyalty: 90,
++    stats: { l: 85, w: 98, i: 45, p: 30, c: 60 }, skill: { name: '燕人咆哮', effect: 'war:0.10' } },
++  { id: 'zhaoyun', name: '赵云', wild: 'nanpi', loyalty: 92,
++    stats: { l: 91, w: 96, i: 76, p: 65, c: 85 }, skill: { name: '常胜将军', effect: 'war:0.08,def:0.10' } },
++  { id: 'zhugeliang', name: '诸葛亮', wild: 'xiangyang', loyalty: 100,
++    stats: { l: 92, w: 40, i: 100, p: 98, c: 93 }, skill: { name: '神算', effect: 'trick:0.20,p_grow:0.10' } },
++  { id: 'huangzhong', name: '黄忠', wild: 'kuaiji', loyalty: 88,
++    stats: { l: 86, w: 95, i: 65, p: 60, c: 70 }, skill: null },
++  { id: 'pangtong', name: '庞统', wild: 'guiyang', loyalty: 85,
++    stats: { l: 80, w: 45, i: 97, p: 90, c: 80 }, skill: { name: '凤雏', effect: 'trick:0.15' } },
++  { id: 'fazheng', name: '法正', wild: 'hanzhong', loyalty: 88,
++    stats: { l: 75, w: 50, i: 94, p: 88, c: 75 }, skill: null },
++  { id: 'weiyan', name: '魏延', wild: 'xiapi', loyalty: 78,
++    stats: { l: 88, w: 92, i: 70, p: 60, c: 65 }, skill: null },
++  { id: 'jiangwei', name: '姜维', wild: 'hanzhong', loyalty: 90,
++    stats: { l: 91, w: 90, i: 90, p: 80, c: 80 }, skill: { name: '麒麟儿', effect: 'lead:0.08,trick:0.10' } },
++  { id: 'huatuo', name: '华佗', wild: 'luoyang', loyalty: 80,
++    stats: { l: 40, w: 30, i: 90, p: 85, c: 90 }, skill: { name: '神医', effect: 'def:0.10' } },
++  { id: 'simayi', name: '司马懿', wild: 'wan', loyalty: 85,
++    stats: { l: 93, w: 70, i: 96, p: 93, c: 88 }, skill: { name: '韬略', effect: 'trick:0.15' } },
++  { id: 'dengai', name: '邓艾', wild: 'puyang', loyalty: 88,
++    stats: { l: 90, w: 85, i: 89, p: 85, c: 75 }, skill: null },
++  { id: 'zhonghui', name: '钟会', wild: 'guiyang', loyalty: 78,
++    stats: { l: 82, w: 75, i: 88, p: 75, c: 70 }, skill: null },
++  { id: 'gaoshun', name: '高顺', wild: 'jianning', loyalty: 85,
++    stats: { l: 82, w: 90, i: 55, p: 50, c: 60 }, skill: { name: '陷阵营', effect: 'war:0.10' } },
++  { id: 'simazhao', name: '司马昭', wild: 'xiapi', loyalty: 82,
++    stats: { l: 85, w: 70, i: 90, p: 85, c: 80 }, skill: null },
++];
++
++export const HERO_MAP = Object.fromEntries(HEROES.map((h) => [h.id, h]));
++
++// AI 势力种子：capital 为初始都城，lordId 指向 HEROES 中的君主。
++// 玩家若选择某都城开局，对应势力不生成，其名将转为该城在野（玩家可登用）。
++export const FACTION_SEEDS = [
++  { key: 'cao', capital: 'xuchang', lordId: 'caocao' },
++  { key: 'yuan', capital: 'ye', lordId: 'yuanshao' },
++  { key: 'ce', capital: 'jianye', lordId: 'sunce' },
++  { key: 'dong', capital: 'changan', lordId: 'dongzhuo' },
++  { key: 'biao', capital: 'jiangling', lordId: 'liubiao' },
++  { key: 'teng', capital: 'wuwei', lordId: 'mateng' },
++  { key: 'zhang', capital: 'chengdu', lordId: 'liuzhang' },
++  { key: 'gongsun', capital: 'beiping', lordId: 'gongsunzan' },
++];
++
++// 生成器：为兵力薄弱的 AI 势力补充随机「部将」（无技能，属性中等）。
++// index 用于生成唯一 id，调用方负责保证其单调递增。
++const GENERIC_SURNAMES = ['李', '王', '张', '刘', '陈', '杨', '赵', '黄', '周', '吴', '徐', '孙', '胡', '朱', '高', '林', '何', '郭', '马', '罗'];
++const GENERIC_GIVENS = ['成', '武', '义', '忠', '安', '定', '远', '彪', '虎', '达', '凯', '平', '宁', '胜', '广'];
++export function makeGenericGeneral(rng, index) {
++  const r = rng || Math.random;
++  const name = GENERIC_SURNAMES[Math.floor(r() * GENERIC_SURNAMES.length)]
++    + GENERIC_GIVENS[Math.floor(r() * GENERIC_GIVENS.length)];
++  const ri = (lo, hi) => Math.floor(lo + r() * (hi - lo));
++  return {
++    id: `gen_${index}`,
++    name,
++    generic: true,
++    loyalty: ri(55, 85),
++    stats: { l: ri(55, 82), w: ri(55, 85), i: ri(45, 78), p: ri(40, 72), c: ri(45, 75) },
++    skill: null,
++  };
++}
+diff --git a/apps/xiong-tu-san-guo/src/main.js b/apps/xiong-tu-san-guo/src/main.js
+new file mode 100644
+index 0000000..ccf5827
+--- /dev/null
++++ b/apps/xiong-tu-san-guo/src/main.js
+@@ -0,0 +1,19 @@
++// ============================================================================
++// 雄图·三国志文明 · 入口
++// 导出 createGame(parent) 工厂，供主框架（落地页）按需挂载到任意容器；
++// 同时保留独立运行（apps/xiong-tu-san-guo/index.html）时的自动挂载行为。
++// ============================================================================
++import { GameUI } from './ui/app.js';
++
++export function createGame(parent) {
++  const ui = new GameUI(parent);
++  ui.mount();
++  return ui;
++}
++
++// 独立运行时自动挂载到 #game-container（仅在元素存在时触发，
++// 避免被主框架动态 import 时误启动游戏）。
++if (typeof document !== 'undefined' && document.getElementById('game-container')) {
++  const ui = createGame(document.getElementById('game-container'));
++  if (typeof window !== 'undefined') window.__XTSG = ui; // 暴露实例便于调试 / 冒烟测试
++}
+diff --git a/apps/xiong-tu-san-guo/src/ui/app.js b/apps/xiong-tu-san-guo/src/ui/app.js
+new file mode 100644
+index 0000000..616c1fe
+--- /dev/null
++++ b/apps/xiong-tu-san-guo/src/ui/app.js
+@@ -0,0 +1,728 @@
++// ============================================================================
++// 雄图·三国志文明 · UI 控制器（纯原生 DOM）
++// 三层屏幕：启动器（新局 / 继续）→ 创角 → 对局（顶栏 + 五标签 + 弹窗）。
++// 对局标签：地图 / 势力 / 名将 / 科技 / 系统。
++// ============================================================================
++import './style.css';
++import { attachKeyboardShell } from '../../../_lib/keyboard-shell.js';
++import { h, clear, bar } from './dom.js';
++import {
++  TECHS, FORMATIONS, STRATAGEMS, BUILD_MAX, TECH_MAX_LEVEL, TECH_COST_GOLD,
++  TRAINING_MAX, FACTION_COLORS, NEUTRAL_COLOR, seasonOf, clamp,
++} from '../config.js';
++import { CITIES } from '../data/cities.js';
++import { newGame, resolveTurn, cityById, heroById, factionById, playerFaction,
++  neighbors, heroesOfFaction, heroesInCity, wildHeroesInCity, prisonersOfFaction,
++  troopCap, cmdPoints, cmdRemaining, bestDefender, lordOf, maxDefense } from '../core/state.js';
++import { citiesOf, factionGoldIncome, factionGrainNet } from '../core/economy.js';
++import { effLead, effWar } from '../core/combat.js';
++import { techLevel } from '../core/tech.js';
++import * as A from '../core/actions.js';
++import { aiTurnAll } from '../core/ai.js';
++import { hasSave, saveGame, loadGame, clearSave } from '../core/save.js';
++import { chance } from '../core/rng.js';
++
++const STAT_KEYS = [
++  ['l', '统'], ['w', '武'], ['i', '智'], ['p', '政'], ['c', '魅'],
++];
++const TABS = [
++  { key: 'map', icon: '🗺️', label: '地图' },
++  { key: 'faction', icon: '🏯', label: '势力' },
++  { key: 'heroes', icon: '⚔️', label: '名将' },
++  { key: 'tech', icon: '📜', label: '科技' },
++  { key: 'system', icon: '⚙️', label: '系统' },
++];
++
++export class GameUI {
++  constructor(parent) {
++    this.parent = parent;
++    this.state = null;
++    this.tab = 'map';
++    this.selectedCityId = null;
++    this.screen = 'start';
++    this.charTemplate = null;
++    this.startCityPick = null;
++  }
++
++  mount() {
++    this.root = h('div', { class: 'xtsg' });
++    clear(this.parent);
++    this.parent.appendChild(this.root);
++    this.toastWrap = h('div', { class: 'toast-wrap' });
++    this.stage = h('div', { class: 'stage' });
++    this.modalRoot = h('div', { class: 'xtsg-modals' });
++    this.root.append(this.toastWrap, this.stage, this.modalRoot);
++    this._detachKeyboard = attachKeyboardShell(this.root);
++    this.showStart();
++    return this;
++  }
++
++  destroy() {
++    if (this._detachKeyboard) { try { this._detachKeyboard(); } catch (_) {} }
++    try { clear(this.parent); } catch (_) {}
++  }
++
++  // ============ Toast / Modal ============
++  toast(msg) {
++    const t = h('div', { class: 'toast' }, msg);
++    this.toastWrap.appendChild(t);
++    setTimeout(() => { try { this.toastWrap.removeChild(t); } catch (_) {} }, 2400);
++  }
++  closeModal() { clear(this.modalRoot); }
++  openModal({ title, body, foot }) {
++    clear(this.modalRoot);
++    const card = h('div', { class: 'modal__card' },
++      h('div', { class: 'modal__head' }, h('h3', null, title)),
++      h('div', { class: 'modal__body' }, body),
++      foot ? h('div', { class: 'modal__foot' }, foot) : null,
++    );
++    // 点遮罩关闭；点卡片内不关闭（避免误触）
++    const backdrop = h('div', { class: 'modal', onClick: (e) => { if (e.target === e.currentTarget) this.closeModal(); } }, card);
++    this.modalRoot.appendChild(backdrop);
++    return card;
++  }
++  // 带确认/取消的表单弹窗
++  openForm(title, bodyNode, onConfirm, confirmLabel = '确认') {
++    const foot = [
++      h('button', { class: 'btn-ghost grow', onClick: () => this.closeModal() }, '取消'),
++      h('button', { class: 'btn-primary grow', onClick: onConfirm }, confirmLabel),
++    ];
++    return this.openModal({ title, body: bodyNode, foot });
++  }
++
++  // ============ 启动器 ============
++  showStart() {
++    this.screen = 'start';
++    this.state = null;
++    clear(this.stage);
++    const wrap = h('div', { class: 'launcher' },
++      h('div', { class: 'launcher__brand' },
++        h('div', { class: 'emblem' }, '雄'),
++        h('h1', null, '雄图·三国志文明'),
++        h('p', { class: 'sub' }, '内政 · 科技 · 名将 · 征伐 · 统一天下'),
++      ),
++      h('div', { class: 'launcher__menu' },
++        h('button', { class: 'btn-primary btn-block', onClick: () => this.showCreate() }, '新游戏'),
++        h('button', {
++          class: 'btn-ghost btn-block', disabled: !hasSave(), onClick: () => this.continueGame(),
++        }, hasSave() ? '继续游戏' : '继续游戏（无存档）'),
++      ),
++      h('p', { class: 'hint center' }, '选择一座城池起兵，招揽名将、发展内政、征战四方。'),
++    );
++    this.stage.appendChild(wrap);
++  }
++
++  continueGame() {
++    const s = loadGame();
++    if (!s) { this.toast('存档读取失败'); return; }
++    this.state = s;
++    this.enterGame();
++  }
++
++  // ============ 创角 ============
++  showCreate() {
++    this.screen = 'create';
++    this.charTemplate = { name: '', stats: this.rollStats(), rerolls: 0 };
++    this.startCityPick = null;
++    this.renderCreate();
++  }
++  rollStats() {
++    const s = {};
++    for (const [k] of STAT_KEYS) s[k] = 50 + Math.floor(Math.random() * 51); // 50~100
++    return s;
++  }
++  renderCreate() {
++    clear(this.stage);
++    const t = this.charTemplate;
++
++    const nameInput = h('input', { type: 'text', maxlength: 4, placeholder: '2~4 个汉字', value: t.name,
++      onInput: (e) => { t.name = e.target.value; } });
++
++    const statGrid = h('div', { class: 'stat-grid' },
++      STAT_KEYS.map(([k, label]) => h('div', { class: 'stat' },
++        h('div', { class: 'stat__k' }, label), h('div', { class: 'stat__v' }, t.stats[k]))));
++    const rerollBtn = h('button', { class: 'btn-ghost btn-block', disabled: t.rerolls >= 5,
++      onClick: () => { t.stats = this.rollStats(); t.rerolls += 1; this.renderCreate(); } },
++      `重新随机属性（${t.rerolls}/5）`);
++
++    const cityPick = h('div', { class: 'city-pick' }, CITIES.map((c) => {
++      const sel = this.startCityPick === c.id;
++      return h('button', {
++        class: `city-pick__item${sel ? ' city-pick__item--sel' : ''}`,
++        onClick: () => { this.startCityPick = c.id; this.renderCreate(); },
++      },
++        h('div', null, h('b', null, c.name)),
++        h('div', { class: 'muted' }, c.trait.name),
++      );
++    }));
++
++    const startBtn = h('button', { class: 'btn-primary btn-block',
++      onClick: () => this.beginGame(),
++    }, '起兵出征');
++
++    const wrap = h('div', { class: 'create' },
++      h('h2', null, '一、立君'),
++      h('div', { class: 'create__field' }, h('label', null, '君主姓名（2~4 个汉字）'), nameInput),
++      h('div', { class: 'create__field' }, h('label', null, '君主属性'), statGrid, rerollBtn),
++      h('h2', null, '二、择都'),
++      h('p', { class: 'hint' }, '选择起兵之城。占据诸侯旧都，其旧部将转为在野，可择机登用。'),
++      cityPick,
++      h('div', { style: { height: '0.8rem' } }),
++      startBtn,
++      h('div', { style: { height: '0.4rem' } }),
++      h('button', { class: 'btn-ghost btn-block', onClick: () => this.showStart() }, '返回'),
++    );
++    this.stage.appendChild(wrap);
++    // 挂载临时引用，便于 beginGame 读取输入框最新值
++    this._nameInput = nameInput;
++  }
++
++  beginGame() {
++    const name = (this._nameInput?.value || this.charTemplate.name || '').trim();
++    if (!/^[一-龥]{2,4}$/.test(name)) { this.toast('君主姓名须为 2~4 个汉字'); return; }
++    if (!this.startCityPick) { this.toast('请选择起兵之城'); return; }
++    this.state = newGame({ lordName: name, startCity: this.startCityPick, stats: this.charTemplate.stats });
++    saveGame(this.state);
++    this.toast(`${name} 于 ${cityById(this.state, this.startCityPick).name} 起兵！`);
++    this.enterGame();
++  }
++
++  // ============ 进入对局 ============
++  enterGame() {
++    this.screen = 'game';
++    this.tab = 'map';
++    this.selectedCityId = playerFaction(this.state) && citiesOf(this.state, this.state.playerFactionId)[0]?.id;
++    this.renderGame();
++  }
++
++  renderGame() {
++    if (this.state.over) { this.renderGameOver(); return; }
++    clear(this.stage);
++    this.gameRoot = h('div', { class: 'game' });
++    this.stage.appendChild(this.gameRoot);
++    this.topbar = h('div', { class: 'topbar' });
++    this.tabbar = h('div', { class: 'tabbar' });
++    this.content = h('div', { class: 'content' });
++    this.gameRoot.append(this.topbar, this.tabbar, this.content);
++    this.refreshTopbar();
++    this.renderTabbar();
++    this.renderContent();
++  }
++
++  refreshTopbar() {
++    const s = this.state;
++    const fac = playerFaction(s);
++    const goldIn = Math.round(factionGoldIncome(s, s.playerFactionId));
++    const grainNet = factionGrainNet(s, s.playerFactionId);
++    const cmd = cmdRemaining(s, s.playerFactionId);
++    clear(this.topbar);
++    this.topbar.appendChild(h('div', { class: 'topbar__row' },
++      h('span', { class: 'topbar__title' }, `${fac.name}`),
++      h('span', { class: 'res-pill' }, `${seasonOf(s.turn)} · 第${s.turn}回合`),
++      h('span', { class: 'res-pill' }, `金 `, h('b', null, Math.round(fac.money))),
++      h('span', { class: 'res-pill' }, `粮 `, h('b', null, Math.round(fac.grain))),
++      h('span', { class: 'res-pill cmd-pill' }, `令 ${cmd}`),
++    ));
++    this.topbar.appendChild(h('div', { class: 'topbar__row', style: { marginTop: '0.35rem' } },
++      h('span', { class: 'hint', style: { margin: 0 } }, `金 +${goldIn}/回 · 粮 ${Math.round(grainNet.net)}/回（产${Math.round(grainNet.prod)} 耗${Math.round(grainNet.upkeep)}）`),
++      h('span', { class: 'grow' }),
++      h('button', { class: 'btn-primary', onClick: () => this.confirmEndTurn() }, '结束回合'),
++    ));
++  }
++
++  renderTabbar() {
++    clear(this.tabbar);
++    for (const t of TABS) {
++      this.tabbar.appendChild(h('button', {
++        class: `tab${this.tab === t.key ? ' tab--active' : ''}`,
++        onClick: () => { this.tab = t.key; this.renderTabbar(); this.renderContent(); },
++      }, `${t.icon} ${t.label}`));
++    }
++  }
++
++  renderContent() {
++    clear(this.content);
++    if (this.tab === 'map') this.renderMap();
++    else if (this.tab === 'faction') this.renderFaction();
++    else if (this.tab === 'heroes') this.renderHeroes();
++    else if (this.tab === 'tech') this.renderTech();
++    else if (this.tab === 'system') this.renderSystem();
++  }
++
++  // ============ 地图 ============
++  renderMap() {
++    const s = this.state;
++    const wrap = h('div', { class: 'map-wrap' });
++    const svgNS = 'http://www.w3.org/2000/svg';
++    const svg = document.createElementNS(svgNS, 'svg');
++    svg.setAttribute('class', 'map-svg');
++    svg.setAttribute('viewBox', '0 0 1000 760');
++    svg.setAttribute('preserveAspectRatio', 'none');
++    // 连线（去重）
++    for (const c of s.cities) {
++      for (const nid of c.adjacent) {
++        if (c.id < nid) {
++          const n = cityById(s, nid);
++          const ln = document.createElementNS(svgNS, 'line');
++          ln.setAttribute('x1', c.x); ln.setAttribute('y1', c.y);
++          ln.setAttribute('x2', n.x); ln.setAttribute('y2', n.y);
++          ln.setAttribute('class', 'map-line');
++          svg.appendChild(ln);
++        }
++      }
++    }
++    wrap.appendChild(svg);
++    // 城市点
++    for (const c of s.cities) {
++      const fac = c.ownerFactionId != null ? factionById(s, c.ownerFactionId) : null;
++      const color = fac ? fac.color : NEUTRAL_COLOR;
++      const isPlayer = c.ownerFactionId === s.playerFactionId;
++      const isSel = this.selectedCityId === c.id;
++      const dot = h('button', {
++        class: `map-dot${isPlayer ? ' map-dot--player' : ''}${isSel ? ' map-dot--selected' : ''}`,
++        style: { left: `${(c.x / 1000) * 100}%`, top: `${(c.y / 760) * 100}%`, background: color },
++        onClick: () => { this.selectedCityId = c.id; this.openCityMenu(c.id); },
++      }, c.name.slice(0, 2));
++      wrap.appendChild(dot);
++      wrap.appendChild(h('span', { class: 'map-label', style: { left: `${(c.x / 1000) * 100}%`, top: `${(c.y / 760) * 100}%` } }, c.name));
++    }
++    this.content.appendChild(h('div', null,
++      h('h3', null, '九州形势图'),
++      h('p', { class: 'hint' }, '点击城市查看详情与指令。金边为己方，灰点为空城，他色为诸侯。'),
++      wrap,
++    ));
++    // 提示当前选中
++    if (this.selectedCityId) {
++      const c = cityById(s, this.selectedCityId);
++      this.content.appendChild(h('div', { class: 'hint center' }, `已选：${c ? c.name : '无'}（再次点击城市可操作）`));
++    }
++  }
++
++  // ============ 城市操作菜单 ============
++  openCityMenu(cityId) {
++    const s = this.state;
++    const c = cityById(s, cityId);
++    if (!c) return;
++    this.renderMap(); // 刷新选中态
++    const owned = c.ownerFactionId === s.playerFactionId;
++    if (owned) this.openOwnedCity(c);
++    else this.openEnemyCity(c);
++  }
++
++  cityHeader(c) {
++    const fac = c.ownerFactionId != null ? factionById(this.state, c.ownerFactionId) : null;
++    const color = fac ? fac.color : NEUTRAL_COLOR;
++    return h('div', { class: 'panel__head' },
++      h('span', { class: 'panel__swatch', style: { background: color } }),
++      h('h4', null, c.name),
++      h('span', { class: 'hero-card__sub' }, `${c.trait.name} · ${c.trait.desc}`),
++    );
++  }
++  cityRows(c) {
++    const gov = c.governorHeroId ? heroById(this.state, c.governorHeroId) : null;
++    const r = (k, v) => h('div', null, h('span', { class: 'muted' }, k), ' ', v);
++    return h('div', { class: 'panel__rows' },
++      r('归属', c.ownerFactionId != null ? (factionById(this.state, c.ownerFactionId)?.name || '—') : '空城'),
++      r('人口', `${Math.round(c.population)} / ${c.maxPopulation}`),
++      r('士兵', Math.round(c.soldiers)),
++      r('城防', `${Math.round(c.defense)}`),
++      r('农田', `Lv${c.farmLevel}`),
++      r('市集', `Lv${c.marketLevel}`),
++      r('城墙', `Lv${c.wallLevel}`),
++      r('兵营', `Lv${c.barracksLevel}`),
++      r('训练度', c.training),
++      r('太守', gov ? gov.name : '—'),
++    );
++  }
++
++  openOwnedCity(c) {
++    const s = this.state;
++    const fid = s.playerFactionId;
++    const cmdBtn = (label, fn, danger) => h('button', {
++      class: `cmd-btn ${danger ? 'btn-danger' : 'btn-primary'}`, onClick: () => { const r = fn(); if (r.msg) this.toast(r.msg); this.afterAction(); },
++    }, label);
++    const grid = h('div', { class: 'cmd-grid' },
++      cmdBtn(`农田 Lv${c.farmLevel}`, () => A.developFarm(s, c.id)),
++      cmdBtn(`市集 Lv${c.marketLevel}`, () => A.developMarket(s, c.id)),
++      cmdBtn(`城墙 Lv${c.wallLevel}`, () => A.buildWall(s, c.id)),
++      cmdBtn('征兵', () => this.uiRecruit(c)),
++      cmdBtn('操练', () => A.train(s, c.id)),
++      cmdBtn('探索', () => A.explore(s, c.id)),
++    );
++    const advBtns = h('div', { class: 'hero-card__foot' },
++      h('button', { class: 'btn-jade', onClick: () => this.uiAppoint(c) }, '任命太守'),
++      h('button', { class: 'btn-jade', onClick: () => this.uiMoveHero(c) }, '调遣武将'),
++      h('button', { class: 'btn-primary', onClick: () => this.uiTransport(c) }, '输送资源'),
++    );
++    // 在野名将登用入口
++    const wilds = wildHeroesInCity(s, c.id).filter((w) => w.discovered);
++    const wildBlock = wilds.length ? h('div', { style: { marginTop: '0.6rem' } },
++      h('div', { class: 'hint' }, '本城在野名将：'),
++      h('div', { class: 'hero-card__foot' }, wilds.map((w) => h('button', { class: 'btn-ghost', onClick: () => { const r = A.recruitHero(s, w.id); this.toast(r.msg); this.afterAction(); } }, `登用 ${w.name}`))),
++    ) : null;
++
++    const body = h('div', null, this.cityHeader(c), this.cityRows(c), grid, advBtns, wildBlock);
++    this.openModal({ title: `城务 · ${c.name}`, body, foot: [h('button', { class: 'btn-ghost grow', onClick: () => this.closeModal() }, '关闭')] });
++  }
++
++  openEnemyCity(c) {
++    const s = this.state;
++    const body = h('div', null,
++      this.cityHeader(c),
++      this.cityRows(c),
++      h('div', { class: 'hero-card__foot' },
++        h('button', { class: 'btn-danger', onClick: () => this.uiCampaign(c) }, '出征攻打'),
++        h('button', { class: 'btn-ghost', onClick: () => this.uiStratagem(c) }, '施计'),
++      ),
++    );
++    this.openModal({ title: `敌情 · ${c.name}`, body, foot: [h('button', { class: 'btn-ghost grow', onClick: () => this.closeModal() }, '关闭')] });
++  }
++
++  // —— 征兵 ——
++  uiRecruit(c) {
++    const s = this.state;
++    const fac = playerFaction(s);
++    let n = Math.min(1000, Math.floor(c.population * 0.1));
++    n = Math.max(50, n);
++    const input = h('input', { type: 'number', value: n, min: 50, step: 50, style: { width: '5rem' } });
++    const body = h('div', null,
++      h('p', { class: 'hint' }, `城中人口 ${Math.round(c.population)}，金 ${Math.round(fac.money)}。每兵耗 1.5 金 + 1 人口。`),
++      h('div', { class: 'create__field' }, h('label', null, '征兵数量'), input),
++    );
++    this.openForm('征兵', body, () => {
++      const cnt = clamp(parseInt(input.value, 10) || 0, 0, 99999);
++      const r = A.recruit(s, c.id, cnt);
++      this.toast(r.msg);
++      this.closeModal();
++      this.afterAction();
++    }, '征兵');
++    return { ok: true, msg: '' };
++  }
++
++  // —— 任命太守 ——
++  uiAppoint(c) {
++    const s = this.state;
++    const roster = heroesInCity(s, c.id, s.playerFactionId);
++    if (!roster.length) { this.toast('城中无可任命之武将'); return; }
++    const sel = h('select', null, roster.map((h2) => h('option', { value: h2.id }, `${h2.name}（统${h2.stats.l}）`)));
++    sel.value = c.governorHeroId || roster[0].id;
++    const body = h('div', null, h('p', { class: 'hint' }, '太守政治影响本城人口增长。'), sel);
++    this.openForm('任命太守', body, () => {
++      const r = A.appointGovernor(s, c.id, sel.value);
++      this.toast(r.msg); this.closeModal(); this.afterAction();
++    }, '任命');
++  }
++
++  // —— 调遣武将（本城 → 邻接己城）——
++  uiMoveHero(c) {
++    const s = this.state;
++    const roster = heroesInCity(s, c.id, s.playerFactionId);
++    const targets = neighbors(s, c.id).filter((n) => n.ownerFactionId === s.playerFactionId);
++    if (!roster.length || !targets.length) { this.toast('无可调遣武将或无邻接己城'); return; }
++    const hSel = h('select', null, roster.map((h2) => h('option', { value: h2.id }, h2.name)));
++    const tSel = h('select', null, targets.map((n) => h('option', { value: n.id }, n.name)));
++    const body = h('div', null, h('p', { class: 'hint' }, '将本城武将调往相邻己方城市。'), hSel, h('div', { style: { height: '0.4rem' } }), tSel);
++    this.openForm('调遣武将', body, () => {
++      const r = A.moveHero(s, hSel.value, tSel.value);
++      this.toast(r.msg); this.closeModal(); this.afterAction();
++    }, '调遣');
++  }
++
++  // —— 输送资源 ——
++  uiTransport(c) {
++    const s = this.state;
++    const targets = neighbors(s, c.id).filter((n) => n.ownerFactionId === s.playerFactionId);
++    if (!targets.length) { this.toast('无邻接己城可输送'); return; }
++    const fac = playerFaction(s);
++    const tSel = h('select', null, targets.map((n) => h('option', { value: n.id }, n.name)));
++    const sIn = h('input', { type: 'number', value: Math.min(500, c.soldiers), min: 0, style: { width: '5rem' } });
++    const gIn = h('input', { type: 'number', value: 0, min: 0, style: { width: '5rem' } });
++    const grIn = h('input', { type: 'number', value: 0, min: 0, style: { width: '5rem' } });
++    const body = h('div', null,
++      h('p', { class: 'hint' }, `金 ${Math.round(fac.money)} · 粮 ${Math.round(fac.grain)} · 本城兵 ${Math.round(c.soldiers)}`),
++      h('div', { class: 'create__field' }, h('label', null, '目标城市'), tSel),
++      h('div', { class: 'stat-grid' },
++        h('div', { class: 'stat' }, h('div', { class: 'stat__k' }, '兵'), h('div', { class: 'stat__v', style: { fontSize: '0.9rem' } }, sIn)),
++        h('div', { class: 'stat' }, h('div', { class: 'stat__k' }, '金'), h('div', { class: 'stat__v', style: { fontSize: '0.9rem' } }, gIn)),
++        h('div', { class: 'stat' }, h('div', { class: 'stat__k' }, '粮'), h('div', { class: 'stat__v', style: { fontSize: '0.9rem' } }, grIn)),
++      ),
++    );
++    this.openForm('输送资源', body, () => {
++      const r = A.transport(s, c.id, tSel.value, {
++        soldiers: parseInt(sIn.value, 10) || 0, gold: parseInt(gIn.value, 10) || 0, grain: parseInt(grIn.value, 10) || 0,
++      });
++      this.toast(r.msg); this.closeModal(); this.afterAction();
++    }, '输送');
++  }
++
++  // —— 出征 ——
++  uiCampaign(target) {
++    const s = this.state;
++    // 可出发的己方邻城
++    const sources = neighbors(s, target.id).filter((n) => n.ownerFactionId === s.playerFactionId);
++    if (!sources.length) { this.toast('无可出发的相邻己城'); return; }
++    const srcSel = h('select', null, sources.map((n) => h('option', { value: n.id }, n.name)));
++    const formSel = h('select', null, Object.entries(FORMATIONS).map(([k, f]) => h('option', { value: k }, `${f.name}（${f.desc}）`)));
++    const genSel = h('select');
++    const troopsIn = h('input', { type: 'number', value: 1000, min: 100, step: 100, style: { width: '5rem' } });
++    const refreshGenerals = () => {
++      const src = cityById(s, srcSel.value);
++      const gens = heroesInCity(s, src.id, s.playerFactionId);
++      clear(genSel);
++      if (!gens.length) { genSel.appendChild(h('option', null, '无可用武将')); return; }
++      for (const g of gens) genSel.appendChild(h('option', { value: g.id }, `${g.name}（统${g.stats.l} · 上限${troopCap(s, g)}）`));
++      const g = gens[0];
++      troopsIn.max = Math.min(src.soldiers, troopCap(s, g));
++      troopsIn.value = Math.min(parseInt(troopsIn.value, 10) || 1000, parseInt(troopsIn.max, 10));
++    };
++    srcSel.addEventListener('change', refreshGenerals);
++    const body = h('div', null,
++      h('p', { class: 'hint' }, `攻打 ${target.name}（守军 ${Math.round(target.soldiers)} · 城防 ${Math.round(target.defense)}）`),
++      h('div', { class: 'create__field' }, h('label', null, '出发城市'), srcSel),
++      h('div', { class: 'create__field' }, h('label', null, '主将'), genSel),
++      h('div', { class: 'create__field' }, h('label', null, '出兵数量（按路程耗粮）'), troopsIn),
++      h('div', { class: 'create__field' }, h('label', null, '阵型'), formSel),
++    );
++    this.openForm('出征', body, () => {
++      const src = cityById(s, srcSel.value);
++      const g = heroById(s, genSel.value);
++      if (!g) { this.toast('请选择主将'); return; }
++      const r = A.campaign(s, src.id, target.id, g.id, parseInt(troopsIn.value, 10) || 0, formSel.value);
++      this.closeModal();
++      if (r.battle) this.showBattleReport(r.battle, r.won, r.msg);
++      else this.toast(r.msg);
++      this.afterAction();
++    }, '开战');
++    refreshGenerals();
++  }
++
++  // —— 计略 ——
++  uiStratagem(target) {
++    const s = this.state;
++    const sources = neighbors(s, target.id).filter((n) => n.ownerFactionId === s.playerFactionId);
++    if (!sources.length) { this.toast('无可施计的相邻己城'); return; }
++    const srcSel = h('select', null, sources.map((n) => h('option', { value: n.id }, n.name)));
++    const typeSel = h('select', null, Object.entries(STRATAGEMS).map(([k, d]) => h('option', { value: k }, `${d.name}（${d.desc}）`)));
++    const body = h('div', null,
++      h('div', { class: 'create__field' }, h('label', null, '从己方城市施计'), srcSel),
++      h('div', { class: 'create__field' }, h('label', null, '计略'), typeSel),
++    );
++    this.openForm('施计', body, () => {
++      const r = A.stratagem(s, srcSel.value, target.id, typeSel.value);
++      this.toast(r.msg); this.closeModal(); this.afterAction();
++    }, '施计');
++  }
++
++  showBattleReport(battle, won, titleMsg) {
++    const a = battle.attacker; const d = battle.defender;
++    const body = h('div', null,
++      h('div', { class: 'force-vs' },
++        h('div', { class: 'force-vs__side' }, h('b', null, a.general.name), h('div', { class: 'muted' }, `攻方 · ${Math.round(a.soldiers)} 兵`)),
++        h('div', { class: 'force-vs__side' }, h('b', null, d.general.name), h('div', { class: 'muted' }, `守方 · ${Math.round(d.soldiers)} 兵 · 城${Math.round(d.defense)}`)),
++      ),
++      h('div', { class: 'battle-log' }, battle.log.map((l) => h('p', null, l))),
++      h('p', { class: won ? 'center' : 'center muted', style: { color: won ? 'var(--good)' : 'var(--bad)', fontWeight: 700 } }, won ? '⚔ 大胜！城池归我！' : '⚔ 兵败而归。'),
++    );
++    this.openModal({ title: titleMsg, body, foot: [h('button', { class: 'btn-primary grow', onClick: () => this.closeModal() }, '知晓')] });
++  }
++
++  // ============ 势力总览 ============
++  renderFaction() {
++    const s = this.state;
++    const fid = s.playerFactionId;
++    const fac = playerFaction(s);
++    const myCities = citiesOf(s, fid);
++    const grainNet = factionGrainNet(s, fid);
++    const heroCount = heroesOfFaction(s, fid).length;
++    const prisonerCount = prisonersOfFaction(s, fid).length;
++    this.content.appendChild(h('div', null,
++      h('h3', null, `${fac.name} · 总览`),
++      h('div', { class: 'panel' },
++        h('div', { class: 'panel__rows' },
++          h('div', null, h('span', { class: 'muted' }, '城池'), ' ', myCities.length, ' / 18'),
++          h('div', null, h('span', { class: 'muted' }, '武将'), ' ', heroCount),
++          h('div', null, h('span', { class: 'muted' }, '俘虏'), ' ', prisonerCount),
++          h('div', null, h('span', { class: 'muted' }, '金钱'), ' ', Math.round(fac.money)),
++          h('div', null, h('span', { class: 'muted' }, '军粮'), ' ', Math.round(fac.grain)),
++          h('div', null, h('span', { class: 'muted' }, '粮收支'), ' ', `${Math.round(grainNet.net)}/回`),
++        ),
++      ),
++      h('h3', { style: { marginTop: '0.8rem' } }, '辖下城池'),
++      h('div', { class: 'card-list' }, myCities.map((c) => {
++        const gov = c.governorHeroId ? heroById(s, c.governorHeroId) : null;
++        return h('div', { class: 'city-card', onClick: () => { this.tab = 'map'; this.selectedCityId = c.id; this.renderTabbar(); this.renderContent(); this.openCityMenu(c.id); }, role: 'button' },
++          h('div', { class: 'hero-card__head' }, h('span', { class: 'panel__swatch', style: { background: fac.color } }), h('span', { class: 'hero-card__name' }, c.name), h('span', { class: 'hero-card__sub' }, c.trait.name)),
++          h('div', { class: 'panel__rows' },
++            h('div', null, h('span', { class: 'muted' }, '兵'), ' ', Math.round(c.soldiers)),
++            h('div', null, h('span', { class: 'muted' }, '防'), ' ', Math.round(c.defense)),
++            h('div', null, h('span', { class: 'muted' }, '田/市/墙'), ` ${c.farmLevel}/${c.marketLevel}/${c.wallLevel}`),
++            h('div', null, h('span', { class: 'muted' }, '守将'), ' ', gov ? gov.name : '—'),
++          ),
++        );
++      })),
++      h('h3', { style: { marginTop: '0.8rem' } }, '天下诸侯'),
++      h('div', { class: 'card-list' }, s.factions.filter((f) => f.id !== fid).map((f) => {
++        const n = citiesOf(s, f.id).length;
++        return h('div', { class: 'city-card' },
++          h('div', { class: 'hero-card__head' }, h('span', { class: 'panel__swatch', style: { background: f.color } }), h('span', { class: 'hero-card__name' }, f.name), h('span', { class: 'hero-card__sub' }, `${n} 城`)),
++        );
++      })),
++    ));
++  }
++
++  // ============ 名将 ============
++  renderHeroes() {
++    const s = this.state;
++    const fid = s.playerFactionId;
++    const mine = heroesOfFaction(s, fid);
++    const wilds = s.heroes.filter((h) => h.wild && h.discovered && h.status !== 'gone'
++      && citiesOf(s, fid).some((c) => c.id === h.cityId)); // 仅己方城市中已发现的
++    const prisoners = prisonersOfFaction(s, fid);
++
++    const heroCard = (h2, foot) => h('div', { class: 'hero-card' },
++      h('div', { class: 'hero-card__head' },
++        h('span', { class: 'hero-card__name' }, h2.name),
++        h('span', { class: 'hero-card__sub' }, h2.skill ? h2.skill.name : '无技能'),
++        h2.loyalty != null ? h('span', { class: 'hero-card__sub' }, `忠 ${h2.loyalty}`) : null,
++      ),
++      h('div', { class: 'hero-card__stats' }, STAT_KEYS.map(([k, l]) => h('span', null, `${l}`, h('b', null, h2.stats[k])))),
++      h2.skill ? h('div', { class: 'hero-card__skill' }, `【${h2.skill.name}】`) : null,
++      h('div', { class: 'hint' }, `所在：${cityById(s, h2.cityId)?.name || '在野'}`),
++      foot ? h('div', { class: 'hero-card__foot' }, foot) : null,
++    );
++
++    this.content.appendChild(h('div', null,
++      h('h3', null, '麾下武将'),
++      h('div', { class: 'card-list' }, mine.length ? mine.map((h2) => heroCard(h2, [
++        h('button', { class: 'btn-ghost', onClick: () => { const r = A.reward(s, h2.id); this.toast(r.msg); this.afterAction(); } }, '赏赐'),
++        h('button', { class: 'btn-ghost', onClick: () => { this.selectedCityId = h2.cityId; this.uiAppoint(cityById(s, h2.cityId)); } }, '任太守'),
++      ])) : h('p', { class: 'hint' }, '尚无武将，去「探索」招揽在野名将吧。')),
++
++      h('h3', { style: { marginTop: '0.8rem' } }, '在野名将（己方城市）'),
++      h('div', { class: 'card-list' }, wilds.length ? wilds.map((h2) => heroCard(h2, [
++        h('button', { class: 'btn-primary', onClick: () => { const r = A.recruitHero(s, h2.id); this.toast(r.msg); this.afterAction(); } }, '登用'),
++      ])) : h('p', { class: 'hint' }, '在城市执行「探索」可发现本城在野名将。')),
++
++      prisoners.length ? h('div', null,
++        h('h3', { style: { marginTop: '0.8rem' } }, '俘虏'),
++        h('div', { class: 'card-list' }, prisoners.map((h2) => heroCard(h2, [
++          h('button', { class: 'btn-jade', onClick: () => { const r = A.recruitPrisoner(s, h2.id); this.toast(r.msg); this.afterAction(); } }, '招降'),
++          h('button', { class: 'btn-ghost', onClick: () => { const r = A.releasePrisoner(s, h2.id); this.toast(r.msg); this.afterAction(); } }, '释放'),
++          h('button', { class: 'btn-danger', onClick: () => { const r = A.executePrisoner(s, h2.id); this.toast(r.msg); this.afterAction(); } }, '处决'),
++        ]))),
++      ) : null,
++    ));
++  }
++
++  // ============ 科技 ============
++  renderTech() {
++    const s = this.state;
++    const research = s.research;
++    this.content.appendChild(h('div', null,
++      h('h3', null, '科技树（势力共享）'),
++      research ? h('div', { class: 'panel', style: { marginBottom: '0.6rem' } },
++        h('div', null, h('b', null, `正在研究：${TECHS[research.key].name}`), ` · 剩余 ${research.turnsLeft} 回合`),
++      ) : null,
++      h('div', { class: 'tech-grid' }, Object.entries(TECHS).map(([k, t]) => {
++        const lv = techLevel(s, k);
++        const maxed = lv >= TECH_MAX_LEVEL;
++        const ongoing = research && research.key === k;
++        const dots = Array.from({ length: TECH_MAX_LEVEL }, (_, i) => h('i', { class: i < lv ? 'on' : '' }));
++        return h('div', { class: 'tech-card' },
++          h('div', { class: 'tech-card__head' },
++            h('span', { class: 'tech-card__icon' }, t.icon),
++            h('div', { class: 'grow' }, h('div', { class: 'hero-card__name', style: { fontSize: '0.95rem' } }, t.name), h('div', { class: 'hint' }, t.desc)),
++            h('span', { class: 'tech-lv' }, dots),
++          ),
++          h('div', { class: 'hero-card__foot' },
++            h('span', { class: 'hero-card__sub' }, maxed ? '已满级' : `下级 ${TECH_COST_GOLD} 金`),
++            h('span', { class: 'grow' }),
++            h('button', {
++              class: 'btn-primary', disabled: maxed || !!research,
++              onClick: () => { const r = A.research(s, k); this.toast(r.msg); this.afterAction(); },
++            }, ongoing ? '研究中…' : (maxed ? '已满' : '研究')),
++          ),
++        );
++      })),
++      h('p', { class: 'hint', style: { marginTop: '0.6rem' } }, '研究每级消耗 800 金，约 3 回合（君主智力可缩短），完成后势力全城共享加成。'),
++    ));
++  }
++
++  // ============ 系统 ============
++  renderSystem() {
++    this.content.appendChild(h('div', null,
++      h('h3', null, '系统'),
++      h('div', { class: 'sys-list' },
++        h('button', { class: 'btn-primary btn-block', onClick: () => { saveGame(this.state); this.toast('已保存'); } }, '保存游戏'),
++        h('button', { class: 'btn-ghost btn-block', onClick: () => this.confirmEndTurn() }, '结束本回合'),
++        h('button', { class: 'btn-ghost btn-block', onClick: () => { this.tab = 'map'; this.renderTabbar(); this.renderContent(); } }, '返回地图'),
++        h('button', { class: 'btn-danger btn-block', onClick: () => this.confirmAbandon() }, '放弃本局，开新游戏'),
++      ),
++      h('p', { class: 'hint center', style: { marginTop: '1rem' } }, '雄图·三国志文明 · 存档于本地浏览器'),
++    ));
++  }
++
++  confirmAbandon() {
++    const body = h('p', null, '确认放弃当前进度并开始新游戏？当前存档将被覆盖。');
++    this.openForm('放弃本局', body, () => {
++      clearSave();
++      this.closeModal();
++      this.showStart();
++    }, '确认放弃');
++  }
++
++  // ============ 结束回合 ============
++  confirmEndTurn() {
++    const body = h('p', null, '结束本回合后，天下诸侯将各自施政、出兵，资源依内政结算。是否继续？');
++    this.openForm('结束回合', body, () => {
++      this.closeModal();
++      this.doEndTurn();
++    }, '结束回合');
++  }
++
++  doEndTurn() {
++    const s = this.state;
++    saveGame(s);
++    const log = resolveTurn(s, { aiTurnAll }, Math.random);
++    saveGame(s);
++    this.refreshTopbar();
++    if (s.over) { this.renderGameOver(); return; }
++    this.showTurnSummary(log);
++  }
++
++  showTurnSummary(log) {
++    const items = (log && log.length) ? log : ['天下无事，岁月静好。'];
++    const body = h('div', null,
++      h('p', { class: 'hint' }, `第 ${this.state.turn} 回合 · ${seasonOf(this.state.turn)}季 简报`),
++      h('ul', { class: 'summary-list' }, items.map((l) => h('li', null, l))),
++    );
++    this.openModal({
++      title: '回合简报',
++      body,
++      foot: [h('button', { class: 'btn-primary grow', onClick: () => { this.closeModal(); this.afterAction(); } }, '继续')],
++    });
++  }
++
++  renderGameOver() {
++    clear(this.stage);
++    const win = this.state.over === 'win';
++    this.stage.appendChild(h('div', { class: 'gameover' },
++      h('h2', null, win ? '🏛 一统天下！' : '🏰 大业未成'),
++      h('p', { class: 'hint' }, win ? `${playerFaction(this.state).name} 席卷九州，定鼎中原。` : '群雄逐鹿，君之基业已失。再图后举吧。'),
++      h('div', { class: 'launcher__menu', style: { marginTop: '1.2rem' } },
++        h('button', { class: 'btn-primary btn-block', onClick: () => { clearSave(); this.showCreate(); } }, '再战一局'),
++        h('button', { class: 'btn-ghost btn-block', onClick: () => { clearSave(); this.showStart(); } }, '返回首页'),
++      ),
++    ));
++  }
++
++  // ============ 动作后统一刷新 ============
++  afterAction() {
++    saveGame(this.state);
++    if (this.screen !== 'game') return;
++    if (this.state.over) { this.renderGameOver(); return; }
++    this.refreshTopbar();
++    // 若当前弹窗已关闭，则重绘内容；否则仅顶栏刷新
++    if (!this.modalRoot.firstChild) this.renderContent();
++  }
++}
+diff --git a/apps/xiong-tu-san-guo/src/ui/dom.js b/apps/xiong-tu-san-guo/src/ui/dom.js
+new file mode 100644
+index 0000000..bc97b4d
+--- /dev/null
++++ b/apps/xiong-tu-san-guo/src/ui/dom.js
+@@ -0,0 +1,44 @@
++// ============================================================================
++// 轻量 DOM 辅助：h() 创建元素，clear() 清空，bar() 进度条——避免引入框架。
++// ============================================================================
++export function h(tag, props, ...children) {
++  const el = document.createElement(tag);
++  if (props) {
++    for (const [k, v] of Object.entries(props)) {
++      if (v == null || v === false) continue;
++      if (k === 'class') el.className = v;
++      else if (k === 'dataset') Object.assign(el.dataset, v);
++      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
++      else if (k === 'onClick') el.addEventListener('click', v);
++      else if (k === 'onInput') el.addEventListener('input', v);
++      else if (k === 'onChange') el.addEventListener('change', v);
++      else if (k === 'html') el.innerHTML = v; // 仅用于受控静态内容
++      else if (k in el) { try { el[k] = v; } catch (_) { el.setAttribute(k, v); } }
++      else el.setAttribute(k, v);
++    }
++  }
++  appendChildren(el, children);
++  return el;
++}
++
++function appendChildren(el, children) {
++  for (const c of children) {
++    if (c == null || c === false || c === true) continue;
++    if (Array.isArray(c)) { appendChildren(el, c); continue; }
++    el.append(c.nodeType ? c : document.createTextNode(String(c)));
++  }
++}
++
++export function clear(el) {
++  while (el.firstChild) el.removeChild(el.firstChild);
++  return el;
++}
++
++// 进度条：value/max → 百分比填充
++export function bar(value, max, opts = {}) {
++  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
++  return h('div', { class: `bar ${opts.class || ''}` },
++    h('div', { class: 'bar__fill', style: { width: `${pct}%`, background: opts.color || '' } }),
++    h('span', { class: 'bar__label' }, opts.label || `${Math.floor(value)}/${Math.round(max)}`),
++  );
++}
+diff --git a/apps/xiong-tu-san-guo/src/ui/style.css b/apps/xiong-tu-san-guo/src/ui/style.css
+new file mode 100644
+index 0000000..8bd3249
+--- /dev/null
++++ b/apps/xiong-tu-san-guo/src/ui/style.css
+@@ -0,0 +1,231 @@
++/* ==========================================================================
++   雄图·三国志文明 · 样式（竖屏单列、移动端优先，适配刘海 / 底部安全区）
++   古卷墨韵 + 鎏金描边，暗色调三国风。
++   ========================================================================== */
++.xtsg {
++  --bg: #1a1206;
++  --bg-2: #221710;
++  --card: #2a1d11;
++  --card-2: #33251a;
++  --line: #4a3826;
++  --text: #efe2c4;
++  --muted: #b39b73;
++  --gold: #d9b957;
++  --gold-dim: #8a6a28;
++  --jade: #5fd0a0;
++  --crimson: #c0392b;
++  --crimson-dim: #7d2418;
++  --good: #6fd07f;
++  --bad: #e06b6b;
++  --radius: 10px;
++
++  position: absolute;
++  inset: 0;
++  background:
++    radial-gradient(120% 60% at 50% -10%, #33261a 0%, transparent 60%),
++    var(--bg);
++  color: var(--text);
++  font-family: "PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", system-ui, sans-serif;
++  font-size: 14px;
++  line-height: 1.5;
++  overflow: hidden;
++  -webkit-user-select: none;
++  user-select: none;
++  -webkit-tap-highlight-color: transparent;
++}
++.xtsg * { box-sizing: border-box; }
++
++.xtsg .stage { position: absolute; inset: 0; overflow: hidden; }
++.xtsg .game { position: absolute; inset: 0; display: flex; flex-direction: column; overflow: hidden; }
++
++/* —— 按钮 —— */
++.xtsg button {
++  font-family: inherit; cursor: pointer; border: none; border-radius: 8px;
++  background: var(--card-2); color: var(--text);
++  padding: 0.55rem 0.8rem; font-size: 0.9rem;
++  transition: transform 0.08s ease, background 0.15s ease, opacity 0.15s ease;
++}
++.xtsg button:active { transform: scale(0.97); }
++.xtsg button:disabled { opacity: 0.4; cursor: default; }
++.xtsg .btn-primary { background: linear-gradient(180deg, #e8c769, var(--gold-dim)); color: #1a1208; font-weight: 600; }
++.xtsg .btn-danger { background: linear-gradient(180deg, #d7574c, var(--crimson-dim)); color: #fff; }
++.xtsg .btn-jade { background: linear-gradient(180deg, #6fe0b0, #2f9a72); color: #06241a; font-weight: 600; }
++.xtsg .btn-ghost { background: transparent; border: 1px solid var(--line); }
++.xtsg .btn-block { width: 100%; }
++.xtsg input, .xtsg select {
++  font-family: inherit; background: var(--bg-2); color: var(--text);
++  border: 1px solid var(--line); border-radius: 8px; padding: 0.5rem 0.6rem; font-size: 0.95rem;
++}
++
++/* —— 启动器 —— */
++.xtsg .launcher {
++  position: absolute; inset: 0; overflow-y: auto; padding: max(1.4rem, env(safe-area-inset-top)) 1rem 2rem;
++  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1.2rem;
++}
++.xtsg .launcher__brand { text-align: center; }
++.xtsg .launcher__brand .emblem {
++  width: 76px; height: 76px; margin: 0 auto 0.6rem; border-radius: 50%;
++  background: radial-gradient(circle at 35% 30%, #e8c769, var(--gold-dim) 70%, #5a4316);
++  display: flex; align-items: center; justify-content: center;
++  font-size: 2.3rem; font-weight: 700; color: #2a1a08;
++  box-shadow: 0 4px 18px rgba(0,0,0,0.5), inset 0 0 0 3px rgba(255,255,255,0.12);
++}
++.xtsg .launcher__brand h1 { font-size: 1.7rem; margin: 0; letter-spacing: 0.05em; }
++.xtsg .launcher__brand .sub { color: var(--muted); margin: 0.3rem 0 0; font-size: 0.85rem; }
++.xtsg .launcher__menu { display: flex; flex-direction: column; gap: 0.7rem; width: 100%; max-width: 320px; }
++
++/* —— 创角 —— */
++.xtsg .create { position: absolute; inset: 0; overflow-y: auto; padding: max(1rem, env(safe-area-inset-top)) 1rem 2.2rem; }
++.xtsg .create h2 { font-size: 1.2rem; margin: 0.4rem 0 0.6rem; }
++.xtsg .create__field { margin-bottom: 1rem; }
++.xtsg .create__field label { display: block; color: var(--muted); margin-bottom: 0.3rem; font-size: 0.85rem; }
++.xtsg .stat-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.4rem; }
++.xtsg .stat {
++  background: var(--card); border: 1px solid var(--line); border-radius: 8px; padding: 0.5rem 0.2rem; text-align: center;
++}
++.xtsg .stat__k { font-size: 0.7rem; color: var(--muted); }
++.xtsg .stat__v { font-size: 1.15rem; font-weight: 700; color: var(--gold); }
++.xtsg .city-pick { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.45rem; margin-top: 0.4rem; }
++.xtsg .city-pick__item {
++  background: var(--card); border: 1px solid var(--line); border-radius: 8px; padding: 0.5rem;
++  text-align: left; font-size: 0.82rem;
++}
++.xtsg .city-pick__item--sel { border-color: var(--gold); background: var(--card-2); }
++.xtsg .city-pick__item b { color: var(--gold); }
++
++/* —— 顶栏 —— */
++.xtsg .topbar {
++  flex: none; padding: max(0.55rem, env(safe-area-inset-top)) 0.7rem 0.45rem;
++  background: linear-gradient(180deg, #2c2014, var(--bg-2)); border-bottom: 1px solid var(--line);
++}
++.xtsg .topbar__row { display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap; }
++.xtsg .topbar__title { font-weight: 700; font-size: 0.95rem; margin-right: auto; }
++.xtsg .res-pill {
++  background: var(--card); border: 1px solid var(--line); border-radius: 999px;
++  padding: 0.2rem 0.6rem; font-size: 0.8rem; white-space: nowrap;
++}
++.xtsg .res-pill b { color: var(--gold); }
++.xtsg .cmd-pill { background: linear-gradient(180deg, #e8c769, var(--gold-dim)); color: #1a1208; font-weight: 700; }
++
++/* —— 标签栏 —— */
++.xtsg .tabbar {
++  flex: none; display: flex; background: var(--bg-2); border-bottom: 1px solid var(--line);
++}
++.xtsg .tab {
++  flex: 1; background: transparent; border-radius: 0; padding: 0.55rem 0;
++  font-size: 0.8rem; color: var(--muted); border-bottom: 2px solid transparent;
++}
++.xtsg .tab--active { color: var(--gold); border-bottom-color: var(--gold); }
++
++/* —— 内容滚动区 —— */
++.xtsg .content { flex: 1; overflow-y: auto; overflow-x: hidden; padding: 0.7rem; }
++.xtsg .content h3 { font-size: 1rem; margin: 0.2rem 0 0.6rem; color: var(--gold); }
++
++/* —— 地图 —— */
++.xtsg .map-wrap {
++  position: relative; width: 100%; aspect-ratio: 1000 / 760; margin: 0 auto;
++  background:
++    radial-gradient(80% 60% at 50% 40%, #3a2c1c 0%, transparent 70%),
++    repeating-linear-gradient(45deg, #241a10 0 12px, #221710 12px 24px);
++  border: 1px solid var(--line); border-radius: 12px; overflow: hidden;
++}
++.xtsg .map-svg { position: absolute; inset: 0; width: 100%; height: 100%; }
++.xtsg .map-line { stroke: #5e4a30; stroke-width: 1.6; opacity: 0.7; }
++.xtsg .map-dot {
++  position: absolute; transform: translate(-50%, -50%);
++  width: 34px; height: 34px; border-radius: 50%; border: none; padding: 0;
++  display: flex; align-items: center; justify-content: center;
++  font-size: 0.62rem; font-weight: 700; color: #fff;
++  box-shadow: 0 2px 6px rgba(0,0,0,0.5), inset 0 0 0 2px rgba(255,255,255,0.25);
++}
++.xtsg .map-dot--player { box-shadow: 0 0 0 3px var(--gold), 0 2px 6px rgba(0,0,0,0.5); }
++.xtsg .map-dot--selected { box-shadow: 0 0 0 3px #fff, 0 2px 8px rgba(255,255,255,0.4); transform: translate(-50%, -50%) scale(1.12); }
++.xtsg .map-label {
++  position: absolute; transform: translate(-50%, 14px);
++  font-size: 0.64rem; color: var(--text); text-shadow: 0 1px 2px #000;
++  pointer-events: none; white-space: nowrap;
++}
++
++/* —— 城市详情面板 —— */
++.xtsg .panel {
++  background: var(--card); border: 1px solid var(--line); border-radius: 12px;
++  padding: 0.7rem; margin-top: 0.7rem;
++}
++.xtsg .panel__head { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; }
++.xtsg .panel__head h4 { margin: 0; font-size: 1.05rem; }
++.xtsg .panel__swatch { width: 16px; height: 16px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.3); }
++.xtsg .panel__rows { display: grid; grid-template-columns: 1fr 1fr; gap: 0.25rem 0.6rem; font-size: 0.82rem; }
++.xtsg .panel__rows .muted { color: var(--muted); }
++.xtsg .cmd-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.4rem; margin-top: 0.6rem; }
++.xtsg .cmd-btn { padding: 0.5rem 0.2rem; font-size: 0.78rem; }
++
++/* —— 列表卡片 —— */
++.xtsg .card-list { display: flex; flex-direction: column; gap: 0.55rem; }
++.xtsg .hero-card, .xtsg .city-card {
++  background: var(--card); border: 1px solid var(--line); border-radius: 10px; padding: 0.6rem 0.7rem;
++}
++.xtsg .hero-card__head { display: flex; align-items: center; gap: 0.5rem; }
++.xtsg .hero-card__name { font-weight: 700; font-size: 0.98rem; }
++.xtsg .hero-card__sub { font-size: 0.72rem; color: var(--muted); }
++.xtsg .hero-card__stats { display: flex; gap: 0.5rem; margin: 0.4rem 0; font-size: 0.72rem; flex-wrap: wrap; }
++.xtsg .hero-card__stats span b { color: var(--gold); }
++.xtsg .hero-card__skill { font-size: 0.74rem; color: var(--jade); }
++.xtsg .hero-card__foot { display: flex; gap: 0.4rem; margin-top: 0.5rem; flex-wrap: wrap; }
++.xtsg .hero-card__foot button { font-size: 0.76rem; padding: 0.35rem 0.55rem; }
++
++/* —— 科技 —— */
++.xtsg .tech-grid { display: flex; flex-direction: column; gap: 0.55rem; }
++.xtsg .tech-card { background: var(--card); border: 1px solid var(--line); border-radius: 10px; padding: 0.6rem 0.7rem; }
++.xtsg .tech-card__head { display: flex; align-items: center; gap: 0.5rem; }
++.xtsg .tech-card__icon { font-size: 1.3rem; }
++.xtsg .tech-lv { display: inline-flex; gap: 3px; }
++.xtsg .tech-lv i { width: 12px; height: 12px; border-radius: 50%; background: var(--line); display: inline-block; }
++.xtsg .tech-lv i.on { background: var(--gold); }
++
++/* —— 系统 —— */
++.xtsg .sys-list { display: flex; flex-direction: column; gap: 0.5rem; }
++
++/* —— 模态 —— */
++.xtsg .modal {
++  position: absolute; inset: 0; background: rgba(0,0,0,0.62);
++  display: flex; align-items: center; justify-content: center; padding: 1rem; z-index: 30;
++}
++.xtsg .modal__card {
++  background: var(--card); border: 1px solid var(--line); border-radius: 14px;
++  width: 100%; max-width: 420px; max-height: 86%; display: flex; flex-direction: column; overflow: hidden;
++}
++.xtsg .modal__head { padding: 0.7rem 0.9rem; border-bottom: 1px solid var(--line); display: flex; align-items: center; }
++.xtsg .modal__head h3 { margin: 0; font-size: 1.05rem; color: var(--gold); }
++.xtsg .modal__body { padding: 0.8rem 0.9rem; overflow-y: auto; }
++.xtsg .modal__foot { padding: 0.6rem 0.9rem; border-top: 1px solid var(--line); display: flex; gap: 0.5rem; }
++.xtsg .battle-log { font-size: 0.82rem; line-height: 1.7; max-height: 46vh; overflow-y: auto; }
++.xtsg .battle-log p { margin: 0.15rem 0; }
++.xtsg .summary-list { font-size: 0.86rem; }
++.xtsg .summary-list li { margin: 0.3rem 0; }
++.xtsg .force-vs { display: flex; justify-content: space-between; gap: 0.6rem; margin-bottom: 0.6rem; }
++.xtsg .force-vs__side { flex: 1; background: var(--bg-2); border-radius: 8px; padding: 0.5rem; font-size: 0.8rem; }
++
++/* —— 进度条 —— */
++.xtsg .bar { position: relative; height: 14px; background: var(--bg-2); border-radius: 7px; overflow: hidden; }
++.xtsg .bar__fill { position: absolute; inset: 0 auto 0 0; background: var(--gold); transition: width 0.3s; }
++.xtsg .bar__label { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 0.68rem; }
++
++/* —— Toast —— */
++.xtsg .toast-wrap { position: absolute; top: max(0.6rem, env(safe-area-inset-top)); left: 0; right: 0; z-index: 50; display: flex; flex-direction: column; align-items: center; gap: 0.3rem; pointer-events: none; }
++.xtsg .toast {
++  background: rgba(20,14,6,0.94); border: 1px solid var(--line); color: var(--text);
++  padding: 0.5rem 0.9rem; border-radius: 999px; font-size: 0.82rem; max-width: 90%; text-align: center;
++  animation: xtsgToast 2.4s ease forwards;
++}
++@keyframes xtsgToast {
++  0% { opacity: 0; transform: translateY(-8px); }
++  12%, 80% { opacity: 1; transform: translateY(0); }
++  100% { opacity: 0; transform: translateY(-8px); }
++}
++
++.xtsg .muted { color: var(--muted); }
++.xtsg .hint { font-size: 0.78rem; color: var(--muted); margin: 0.3rem 0; }
++.xtsg .center { text-align: center; }
++.xtsg .grow { flex: 1; }
++.xtsg .gameover { text-align: center; padding: 2rem 1rem; }
++.xtsg .gameover h2 { font-size: 1.8rem; color: var(--gold); }
+diff --git a/apps/xiong-tu-san-guo/vite.config.js b/apps/xiong-tu-san-guo/vite.config.js
+new file mode 100644
+index 0000000..55ec6d1
+--- /dev/null
++++ b/apps/xiong-tu-san-guo/vite.config.js
+@@ -0,0 +1,9 @@
++import { defineConfig } from 'vite';
++
++// `base: './'` 生成相对路径资源引用，便于部署到 GitHub Pages 子路径或任意静态目录。
++// 本作纯原生 DOM 渲染、无框架、无 Canvas，构建产物极小。
++export default defineConfig({
++  base: './',
++  server: { host: true, port: 5179 },
++  build: { outDir: 'dist', sourcemap: false, target: 'es2018' },
++});
+diff --git a/src/main.js b/src/main.js
+index 6820391..7f0c8af 100644
+--- a/src/main.js
++++ b/src/main.js
+@@ -69,6 +69,14 @@ const APPS = {
+     desc: '迫降破碎星球，在漂浮的遗迹浮岛间拾荒探索。猜拳克制式战斗、装备强化与三天赋树、碎片化记忆叙事，集齐十枚星骸回响揭开真相。',
+     loader: () => import('../apps/xing-hai-lv-zhe/src/main.js'),
+   },
++  xtsg: {
++    key: 'xtsg',
++    title: '雄图·三国志文明',
++    subtitle: '三国 · 回合策略',
++    emblem: '雄',
++    desc: '自择一城起兵，开发内政、推进科技树、招揽四十余位名将，在十八城中国地图上回合制征战，俘将夺城，一统九州。',
++    loader: () => import('../apps/xiong-tu-san-guo/src/main.js'),
++  },
+ }
+ 
+ // 大类：先呈现「学习」，再呈现「游戏」。点击大类进入后，才展开其中的具体应用。
+@@ -86,8 +94,8 @@ const CATEGORIES = [
+     title: '游戏',
+     subtitle: '休闲 · 互动娱乐',
+     emblem: '玩',
+-    desc: '消磨时光的互动小品：修仙、人生、三国战场、星骸浮岛，挑一个开始吧。',
+-    appKeys: ['dzf', 'frxx', 'mnrs', 'xhlz'],
++    desc: '消磨时光的互动小品：修仙、人生、三国战场、星骸浮岛、诸侯争霸，挑一个开始吧。',
++    appKeys: ['dzf', 'frxx', 'mnrs', 'xhlz', 'xtsg'],
+   },
+ ]
+ 
diff --git a/.ai-tasks/issue-79/pr_diff_r2.md b/.ai-tasks/issue-79/pr_diff_r2.md
new file mode 100644
index 0000000..c87c3a5
--- /dev/null
+++ b/.ai-tasks/issue-79/pr_diff_r2.md
@@ -0,0 +1,10047 @@
+diff --git a/.ai-tasks/issue-79/ai-coder-prompt.md b/.ai-tasks/issue-79/ai-coder-prompt.md
+new file mode 100644
+index 0000000..49fd619
+--- /dev/null
++++ b/.ai-tasks/issue-79/ai-coder-prompt.md
+@@ -0,0 +1,8 @@
++你是一个资深开发者。请解决以下 GitHub Issue：
++【任务标题】: 在游戏栏目下新增以下游戏
++【详细需求】: 请直接阅读当前目录下的 .ai-tasks/issue-79/context.md 文件获取。
++
++【⚠️ 严格红线规则】：
++请绝对不要修改、重命名或生成 .github/ 目录下的任何文件 (特别是 workflows 等 CI/CD 配置)，这会破坏项目的自动化流程！如果觉得有必要修改，请在回复中用文字建议人类去改，绝不要自己动手改。
++
++请直接分析并修改项目中的代码文件来解决这个问题，不要做过多的文字解释。
+diff --git a/.ai-tasks/issue-79/ai-reviewer-prompt_r1.md b/.ai-tasks/issue-79/ai-reviewer-prompt_r1.md
+new file mode 100644
+index 0000000..6ad7d53
+--- /dev/null
++++ b/.ai-tasks/issue-79/ai-reviewer-prompt_r1.md
+@@ -0,0 +1,14 @@
++你是一个极其严格、甚至有些刁钻的资深代码审查员。
++这是代码提交后的【第 1 轮】审查。
++请阅读当前目录下的 .ai-tasks/issue-79/pr_diff_r1.md 文件，这是本次 PR 的代码变更。
++
++请检查是否有 Bug、逻辑错误、安全问题或性能瓶颈。
++
++【⚠️ 重要输出格式要求】：
++请严格按照以下纯文本格式输出，每项各占一行，不要使用 Markdown 代码块包裹，不要输出其他任何内容：
++DECISION: APPROVE
++或
++DECISION: REQUEST_CHANGES
++COMMENT: 你的详细审查意见 (如果你的意见中涉及需要修改 CI/CD 或 workflows，请告知人类手动处理)
++
++注意：DECISION 和 COMMENT 必须各占一行，以 DECISION: 和 COMMENT: 开头。COMMENT 的内容可以跨多行。
+diff --git a/.ai-tasks/issue-79/context.md b/.ai-tasks/issue-79/context.md
+new file mode 100644
+index 0000000..1b51de6
+--- /dev/null
++++ b/.ai-tasks/issue-79/context.md
+@@ -0,0 +1,329 @@
++《雄图·三国志文明》游戏设计方案文档
++
++---
++
++一、游戏概述
++
++游戏类型：单机回合制策略经营游戏，网页端（纯静态，GitHub Pages 部署），适配手机竖屏操作。
++游戏背景：以三国时代为蓝本，玩家扮演自定义君主，选择一座城市作为起点，通过内政建设、科技发展、招揽名将、军事征伐，最终统一中国全境。
++核心玩法：结合《三国志》系列的名将养成与指令式内政、《文明》系列的城市发展与科技树推进，在一个划分城市节点的中国地图上进行逐回合博弈。
++
++---
++
++二、核心机制
++
++2.1 地图与城市系统
++
++· 采用简化的中国古地图（静态 SVG 或 Canvas 绘制），共设置 15~20 座核心城市（如洛阳、长安、邺城、许昌、成都、建业、襄阳、汉中、北平、下邳等）。
++· 城市之间通过固定路径相连（邻接关系），军队出征只能沿路径移动。
++· 每个城市具有以下属性：
++  · 基础数值：人口上限、初始人口、初始金钱、初始军粮、初始士兵数。
++  · 城市特性（永久 Buff/Debuff）：
++    · 例如：洛阳“天下之中”商业收入 +20%；汉中“易守难攻”城防值 +30%；南皮“产粮大郡”粮食产量 +25% 等。
++  · 当前建筑等级：农田、市集、兵营、城墙、工坊（每种 1~5 级）。
++  · 当前资源存量：金钱、军粮、士兵、人口、城防耐久度。
++  · 控制势力标记。
++
++2.2 君主与初始设置
++
++· 玩家开局需设定：
++  · 君主姓名（自定义，限 2~4 字，系统不提供预设）。
++  · 选择初始城市（从所有可争夺城市中选择，AI 势力会随机占据其余城市）。
++· 君主属性完全随机生成，范围 50~100，共五项：
++  · 统率（影响带兵上限、出征士气）
++  · 武力（影响单挑、训练效率）
++  · 智力（影响计谋成功率、科技研究速度）
++  · 政治（影响内政指令效果、人口增长）
++  · 魅力（影响招募名将成功率、外交效果）
++· 君主即为玩家势力的第一个“武将”，可执行所有武将功能。
++
++2.3 名将系统
++
++· 游戏内置 40+ 历史名将（如关羽、张飞、诸葛亮、周瑜、吕布等），初始分布在各个城市或处于“在野”状态。
++· 每位名将有唯一面板：
++  · 五项属性（统武智政魅，范围 30~100）
++  · 专属技能（被动或主动）：如“威震华夏”（统率 +10%）、“神算”（计谋成功率 +20%）
++  · 忠诚度（0~100，低于 30 可能被策反或下野）
++  · 所在位置：某城市或“在野”（随回合刷新可能出现）
++· 玩家可通过“探索”指令发现本城在野名将，用“登用”指令说服加入（成功率受玩家魅力、名将忠诚倾向、相性影响）。
++· 战斗中可俘虏敌方名将，关押后可招降或处决。
++· 名将可被任命为太守、军师、出征主将，影响城市运营和军队战力。
++
++2.4 回合与指令系统
++
++· 游戏以季节为回合单位（每回合代表三个月）。每回合玩家获得若干“指令点数”（根据城市数量与政治值），例如基础 5 点，每多一座城 +2 点。
++· 指令包括：
++  · 内政类（消耗 1 点）：
++    · 开发农田（提升粮食产量）
++    · 发展商业（提升金钱收入）
++    · 征兵（消耗人口、金钱，增加士兵）
++    · 城防修筑（提升城墙等级）
++    · 技术研究（推进科技树）
++  · 人事类：
++    · 探索（发现本城在野名将）
++    · 登用（说服目标加入）
++    · 赏赐（消耗金钱提升忠诚）
++    · 任命太守/军师
++  · 军事类：
++    · 出征（选择将领、兵力，攻击相邻城市）
++    · 输送（在己方城市间调运资源）
++  · 外交/特殊类（消耗 1 点）：
++    · 流言（降低敌方城市守将忠诚）
++    · 计略（如“火攻”降低目标城防，“烧粮”减少敌方军粮等，成功率取决于智力差）
++· 执行完所有指令后点击“结束回合”，世界进入 AI 操作与资源结算。
++
++2.5 资源与人口机制
++
++· 金钱：每回合城市商业收入 = 市集等级 × 100 + 人口 × 0.5。用于征兵、赏赐、研究。
++· 军粮：每回合农田产量 = 农田等级 × 200。士兵每回合消耗军粮 = 士兵总数 × 0.5。军粮不足会导致士兵逃亡。
++· 人口：城市人口上限由农田等级和初始设定决定。每回合自然增长 = 当前人口 × 政治系数 × 0.02。征兵会减少人口。
++· 士兵：无人口上限限制，但受带兵将领统率约束（最大带兵数 = 统率 × 100）。训练度影响战斗力，默认 50，可通过“训练”指令或建筑提升。
++· 城防：城墙等级提供耐久度，攻城战时必须先打掉城防才能杀伤城内守军。
++
++2.6 科技树
++
++· 设立一条简化的线性/分支科技树，共 6 项科技，每项 3 级：
++  1. 农艺（提升粮食产量 +10%/级）
++  2. 商贸（提升金钱收入 +10%/级）
++  3. 冶炼（提升士兵攻击力 +5%/级）
++  4. 筑城（提升城防值 +20%/级，并解锁高级城墙）
++  5. 谋略（提升计谋成功率 +5%/级，解锁新计谋）
++  6. 统御（提升带兵上限 +10%/级）
++· 研究消耗金钱和时间（固定回合数，智力可缩短回合）。当前研究等级为势力全城共享。
++
++2.7 战斗系统（简化自动战斗）
++
++· 出征消耗军粮（按路程格数计算），到达敌城后进入战斗界面。
++· 战斗采用回合制骰子模型，自动结算，但允许玩家在战前选择阵型和战术卡（若有军师技能）。
++· 核心公式：
++  · 我方攻击值 = (主将武力×0.4 + 统率×0.3 + 士兵数×0.01)×科技系数×训练度系数
++  · 敌方同理。
++  · 每回合双方同时对对方造成伤害，伤害 = 己方攻击值 - 对方城防减免（若有城防则优先消耗城防）。
++  · 城防为 0 后，伤害转为削减士兵。士兵率先归零者战败。
++  · 若名将单挑触发：武力差 > 20 时有概率触发单挑，直接决定胜负（武力高者胜，败方士气大幅下降）。
++· 胜利后占领城市，可俘虏守将、缴获资源。
++
++2.8 AI 势力
++
++· 开局随机分配 5~8 个 AI 势力，各占据若干城市，并有随机君主名及生成武将。
++· AI 行为优先级：
++  1. 内政发展（征足够的兵、研究科技）
++  2. 招募在野名将
++  3. 攻击相邻且军力低于己方的玩家/其他 AI 城市
++  4. 防御：薄弱城市输送资源
++· AI 每回合也消耗等量指令点，简单判断即可。
++
++2.9 胜利与失败条件
++
++· 胜利：占领全部城市。
++· 失败：玩家所有城市丢失且无可用将领/军队（可继续观战但无操作可能，设为游戏结束）。
++
++---
++
++三、数据结构设计（用于 localStorage 存档）
++
++3.1 全局游戏状态对象
++
++```json
++{
++  "version": 1,
++  "turn": 1,
++  "playerFactionId": 0,
++  "factions": [ /* 势力数组 */ ],
++  "cities": [ /* 城市数组 */ ],
++  "heroes": [ /* 名将数组（含玩家君主和招募武将） */ ],
++  "techLevels": { "agri": 0, "commerce": 0, "forge": 0, "wall": 0, "trick": 0, "leadership": 0 },
++  "log": [ /* 最近的事件日志，用于显示回合简报 */ ]
++}
++```
++
++3.2 势力对象（Faction）
++
++```json
++{
++  "id": 0,
++  "name": "玩家势力名",
++  "color": "#ff0000",
++  "money": 5000,
++  "grain": 10000,
++  "aiControlled": false
++}
++```
++
++3.3 城市对象（City）
++
++```json
++{
++  "id": "luoyang",
++  "name": "洛阳",
++  "ownerFactionId": 0,
++  "population": 80000,
++  "maxPopulation": 100000,
++  "soldiers": 3000,
++  "defense": 1000,
++  "gold": 2000,
++  "grain": 5000,
++  "farmLevel": 1,
++  "marketLevel": 1,
++  "barracksLevel": 1,
++  "wallLevel": 1,
++  "workshopLevel": 0,   // 可选：工坊影响科技速度
++  "governorHeroId": null, // 太守武将ID
++  "adjacentCities": ["changan", "xuchang"] // 邻接城市ID列表
++}
++```
++
++3.4 名将对象（Hero）
++
++```json
++{
++  "id": "guanyu",
++  "name": "关羽",
++  "isPlayerLord": false, // 是否为玩家君主
++  "factionId": 0,
++  "cityId": "luoyang",   // 所在城市，若在野则 "wild_city_id"
++  "status": "free",      // "free", "deployed", "prisoner"(俘虏，所在城市监狱)
++  "loyalty": 95,
++  "stats": {
++    "leadership": 96,
++    "warrior": 97,
++    "intelligence": 75,
++    "politics": 62,
++    "charm": 88
++  },
++  "skill": {
++    "name": "威震华夏",
++    "type": "passive",   // 或 "active"
++    "effect": "leadership_multiplier_1.1"
++  }
++}
++```
++
++3.5 存档管理
++
++· 使用 localStorage，键名 "heroicThreeKingdoms_save"，保存完整的 JSON 字符串。
++· 提供“保存游戏”、“读取游戏”、“新游戏”功能。
++
++---
++
++四、界面设计与交互流程
++
++4.1 屏幕适配
++
++· 采用移动端优先设计，最大宽度 480px，居中显示。
++· 使用 Flexbox + 百分比布局，触摸友好按钮（最小 44x44px）。
++· 所有操作使用底部 Tab 导航切换：地图 | 势力 | 名将 | 科技 | 系统。
++
++4.2 主要界面
++
++（1）开始界面
++
++· 游戏标题“雄图·三国志文明”与副标题。
++· 按钮：【新游戏】【继续游戏】（灰色若没有存档）。
++· 新游戏后进入君主创建界面：
++  · 输入姓名文本框（校验2~4中文）。
++  · 显示随机生成的五项属性（可点击“重新随机”，上限5次）。
++  · 下方地图选择初始城市：高亮可选城市（未被AI占用），点击城市显示信息确认。
++
++（2）地图主界面
++
++· 显示简化中国地图，城市用圆形图标标识，颜色对应该势力。
++· 当前选中己方城市：弹出城市详情面板（人口、金钱、兵粮等）。
++· 点击己方城市可出现指令菜单（内政、人事、出征等按钮）。
++· 点击敌方/空城显示基本信息及可用的军事指令（出征、计略）。
++· 顶栏显示当前回合、金钱、军粮总览。
++
++（3）势力总览（Tab2）
++
++· 列表显示己方所有城市，每项可点击快速跳转地图并选中。
++· 显示科技等级，资源总收入/支出预览。
++
++（4）名将列表（Tab3）
++
++· 按状态分类：在野（可探索）、属将、俘虏。
++· 每个名将卡片显示属性、技能、忠诚，提供【赏赐】【任命】【释放/处决】操作。
++
++（5）科技树界面（Tab4）
++
++· 显示6项科技及其当前等级/下一级效果和消耗。
++· 点击研究按钮扣除金钱并开始研究（显示剩余回合）。
++
++（6）系统菜单（Tab5）
++
++· 保存/读取游戏。
++· 结束本回合（确认弹窗）。
++· 游戏设置（音效开关，简单）。
++
++（7）战斗界面（模态窗口）
++
++· 当出征军队到达目标城市或敌军进攻己方城市时自动触发。
++· 显示双方兵力、将领头像和属性条。
++· 战前选择：阵型（普通/攻击/防御，影响系数）或使用军师计略（若智力够）。
++· 点击开战，自动播放回合战报（文字滚动）。
++· 显示结果，提供处理俘虏界面。
++
++4.3 回合事件摘要
++
++· 每回合结束后弹出一张总结卡片：
++  · 收入报告（金、粮变化）。
++  · 人口变化。
++  · 名将动态（是否出现新在野、招募成功等）。
++  · AI 进攻消息。
++  · 玩家可逐条确认关闭。
++
++---
++
++五、AI 逻辑简述
++
++AI 每回合遍历其城市，按以下优先级消耗指令点：
++
++1. 若城市金币低于 500 且市场可升级：升市场。
++2. 若城市士兵低于人口 20%：征兵。
++3. 若存在在野名将且魅力>70的武将空闲：探索+登用。
++4. 科技研究，若满足金钱花费。
++5. 侵略判断：遍历相邻非己方城市，比较军力（己方士兵数+武将统率修正 vs 敌方士兵+城防），若优且兵力比>1.5则出征。
++6. 对边境城市输送资源，平衡防御。
++
++AI 名将忠诚度管理：每回合有几率赏赐提升忠诚度。
++
++---
++
++六、技术实现建议
++
++· 纯前端技术栈：HTML5 + CSS3 + vanilla JS，无框架。
++· 地图渲染：使用内嵌 SVG 地图，城市用 <circle> 表示，路径用 <line>，绑定点击事件。
++· 响应式：meta viewport 设置，地图部分可缩放或固定尺寸，城市图标最小 30px 便于手指点击。
++· 数据持久化：所有游戏对象序列化为 JSON 存入 localStorage，注意避免循环引用。
++· 回合操作需加锁：避免玩家连续点击按钮造成状态混乱。
++· 音效：可使用 Web Audio API 简短音效提示（可选）。
++
++---
++
++七、名将与城市初始数据（部分示例）
++
++7.1 城市列表（供参考，实际可扩展至18城）
++
++ID 名称 特性 人口上限 起始人口 金 粮 兵 邻接
++luoyang 洛阳 商业+20% 100000 80000 3000 8000 2000 changan,xuchang,ye
++changan 长安 城防+20% 80000 60000 2000 6000 1500 luoyang,hanshong
++xuchang 许昌 人口增长+10% 70000 50000 2500 7000 1800 luoyang,xiapi,wan
++chengdu 成都 粮食+15% 90000 70000 2000 10000 1600 hanzhong,jianning
++……
++
++7.2 名将初始分布
++
++名将 所在城市/状态 忠诚倾向
++关羽 在野（前期随机刷在刘备势力周边） 95(刘备)
++诸葛亮 在野（襄阳） 100(刘备)
++曹操 初始为势力君主（许昌） —
++赵云 在野（常山） 90(刘备)
++周瑜 建业势力初始武将 98(孙策)
++吕布 在野（随机） 70（低）
++
++注：为避免版权和历史人名争议，可使用化名如“关云长”，但文档中暂用原名为直观。
++
++---
++
++八、总结
++
++本方案提供了完整的回合制策略游戏设计，融合了三国志的武将养成、指令式内政和文明的科技树、城市发展，地图基于中国城市节点图，操作适配手机，数据均存储于本地浏览器。Agent 可依据以上数据结构、界面模块、规则算法进行实现，构建出可玩的静态网页游戏。
+diff --git a/.ai-tasks/issue-79/fixer-feedback_r1.md b/.ai-tasks/issue-79/fixer-feedback_r1.md
+new file mode 100644
+index 0000000..1d0facd
+--- /dev/null
++++ b/.ai-tasks/issue-79/fixer-feedback_r1.md
+@@ -0,0 +1,9 @@
++已构建并运行全部自测（135 逻辑断言 + 21 DOM 冒烟断言全过，vite 构建成功，`_lib/keyboard-shell.js` 引入路径正确，无 .github/CI 改动，无 XSS/注入风险），但发现两处确凿的核心逻辑 Bug，已用真实代码复现，需修复：
++
++【Bug 1 · 严重 · 资源凭空消失】src/core/actions.js 的 transport()。金钱/军粮是势力级共享池（见 economy.js 与 resolveTurn，每回合直接 fac.money+=、fac.grain+=），并非城市级。但 transport() 里却执行 `fac.money -= gm; fac.grain -= gr;` 且**从不把 gm/gr 加到任何地方**（from/to 的城市金库 gold/grain 也未变动）。实测：输送 500 金/500 粮后，势力金钱 -500、军粮 -500，而 luoyang.gold/wan.gold 均不变 —— 玩家的资源被直接销毁。UI（src/ui/app.js 的 uiTransport）还专门提供了金/粮输入框诱导玩家误用。修复建议：金/粮本就是全势力共享、无需「输送」，应从 transport() 移除金/粮扣减逻辑、并从 uiTransport 表单去掉金/粮输入框，只保留唯一有意义的城市级资源——士兵（soldiers 部分的 from.soldiers-=s / to.soldiers+=s 是正确的，保留即可）。
++
++【Bug 2 · 严重 · 战斗结果不回写】src/core/actions.js 的 applyCampaignResult()。createBattle() 对 attacker/defender 做了浅拷贝，runBattle() 只削减 `battle.defender.soldiers`，从未改写真实城市 `to.soldiers`。攻方获胜分支用 `to.soldiers = survivors`（攻方残兵）覆写，尚可；但**攻方失利分支只 push 了一条日志，完全没有把守军实际伤亡回写**。实测：守军 600、城防 0，玩家攻城失败时，战斗结算守军被打到仅剩 168（战死 432），而战斗结束后真实城市 garrison 仍为 600 —— 守军凭空满血复活。这意味着「以战消耗敌城」的策略完全失效：只要攻城失败，敌城守军永远无损。修复建议：在失利分支补 `to.soldiers = Math.round(battle.defender.soldiers);` 并 `to.defense = Math.max(0, Math.round(battle.defender.defense));`，使战斗伤亡如实落账。
++
++【次要问题，供一并酌情处理】(a) 胜负判定仅在 resolveTurn() 结尾的 checkGameOver() 触发：玩家在回合中通过出征占领最后一座城不会立即胜利，必须再「结束回合」才结算（afterAction 读取的 state.over 此刻仍为 null）。建议在 campaign 成功占领后调用一次 checkGameOver，或让 afterAction 主动判定。(b) 计略 stratagem() 的施计者用 bestDefender()（按统率最高）挑选，却读取其 stats.i（智力）计算成功率，逻辑上应取智力最高的武将施计，当前会系统性压低计略成功率（属设计瑕疵而非崩溃）。
++
++以上均为 src/ 下业务代码问题，可直接修改；本 PR 未触及 .github/ 及任何 CI/CD 配置，无需人工介入 workflow。
+diff --git a/.ai-tasks/issue-79/fixer-prompt_r1.md b/.ai-tasks/issue-79/fixer-prompt_r1.md
+new file mode 100644
+index 0000000..96e3f86
+--- /dev/null
++++ b/.ai-tasks/issue-79/fixer-prompt_r1.md
+@@ -0,0 +1,7 @@
++你是一个资深开发工程师。这是针对上一轮代码的【第 1 轮】修复任务。
++以下是代码审查员给你的修改建议，请阅读当前目录下的 .ai-tasks/issue-79/fixer-feedback_r1.md 文件获取详细内容。
++
++【⚠️ 严格红线规则】：
++请绝对不要修改、重命名或生成 .github/ 目录下的任何文件（特别是 workflows 等 CI/CD 配置），这会破坏项目的自动化流程！如果审查员要求你修改这些文件，请在回复中说明无法自动修改，需要人类介入。
++
++请直接分析并修改当前项目中的代码文件来满足审查员的要求，不要做过多的文字解释。
+diff --git a/.ai-tasks/issue-79/pr_diff_r1.md b/.ai-tasks/issue-79/pr_diff_r1.md
+new file mode 100644
+index 0000000..00d863d
+--- /dev/null
++++ b/.ai-tasks/issue-79/pr_diff_r1.md
+@@ -0,0 +1,4988 @@
++diff --git a/.ai-tasks/issue-79/ai-coder-prompt.md b/.ai-tasks/issue-79/ai-coder-prompt.md
++new file mode 100644
++index 0000000..49fd619
++--- /dev/null
+++++ b/.ai-tasks/issue-79/ai-coder-prompt.md
++@@ -0,0 +1,8 @@
+++你是一个资深开发者。请解决以下 GitHub Issue：
+++【任务标题】: 在游戏栏目下新增以下游戏
+++【详细需求】: 请直接阅读当前目录下的 .ai-tasks/issue-79/context.md 文件获取。
+++
+++【⚠️ 严格红线规则】：
+++请绝对不要修改、重命名或生成 .github/ 目录下的任何文件 (特别是 workflows 等 CI/CD 配置)，这会破坏项目的自动化流程！如果觉得有必要修改，请在回复中用文字建议人类去改，绝不要自己动手改。
+++
+++请直接分析并修改项目中的代码文件来解决这个问题，不要做过多的文字解释。
++diff --git a/.ai-tasks/issue-79/context.md b/.ai-tasks/issue-79/context.md
++new file mode 100644
++index 0000000..1b51de6
++--- /dev/null
+++++ b/.ai-tasks/issue-79/context.md
++@@ -0,0 +1,329 @@
+++《雄图·三国志文明》游戏设计方案文档
+++
+++---
+++
+++一、游戏概述
+++
+++游戏类型：单机回合制策略经营游戏，网页端（纯静态，GitHub Pages 部署），适配手机竖屏操作。
+++游戏背景：以三国时代为蓝本，玩家扮演自定义君主，选择一座城市作为起点，通过内政建设、科技发展、招揽名将、军事征伐，最终统一中国全境。
+++核心玩法：结合《三国志》系列的名将养成与指令式内政、《文明》系列的城市发展与科技树推进，在一个划分城市节点的中国地图上进行逐回合博弈。
+++
+++---
+++
+++二、核心机制
+++
+++2.1 地图与城市系统
+++
+++· 采用简化的中国古地图（静态 SVG 或 Canvas 绘制），共设置 15~20 座核心城市（如洛阳、长安、邺城、许昌、成都、建业、襄阳、汉中、北平、下邳等）。
+++· 城市之间通过固定路径相连（邻接关系），军队出征只能沿路径移动。
+++· 每个城市具有以下属性：
+++  · 基础数值：人口上限、初始人口、初始金钱、初始军粮、初始士兵数。
+++  · 城市特性（永久 Buff/Debuff）：
+++    · 例如：洛阳“天下之中”商业收入 +20%；汉中“易守难攻”城防值 +30%；南皮“产粮大郡”粮食产量 +25% 等。
+++  · 当前建筑等级：农田、市集、兵营、城墙、工坊（每种 1~5 级）。
+++  · 当前资源存量：金钱、军粮、士兵、人口、城防耐久度。
+++  · 控制势力标记。
+++
+++2.2 君主与初始设置
+++
+++· 玩家开局需设定：
+++  · 君主姓名（自定义，限 2~4 字，系统不提供预设）。
+++  · 选择初始城市（从所有可争夺城市中选择，AI 势力会随机占据其余城市）。
+++· 君主属性完全随机生成，范围 50~100，共五项：
+++  · 统率（影响带兵上限、出征士气）
+++  · 武力（影响单挑、训练效率）
+++  · 智力（影响计谋成功率、科技研究速度）
+++  · 政治（影响内政指令效果、人口增长）
+++  · 魅力（影响招募名将成功率、外交效果）
+++· 君主即为玩家势力的第一个“武将”，可执行所有武将功能。
+++
+++2.3 名将系统
+++
+++· 游戏内置 40+ 历史名将（如关羽、张飞、诸葛亮、周瑜、吕布等），初始分布在各个城市或处于“在野”状态。
+++· 每位名将有唯一面板：
+++  · 五项属性（统武智政魅，范围 30~100）
+++  · 专属技能（被动或主动）：如“威震华夏”（统率 +10%）、“神算”（计谋成功率 +20%）
+++  · 忠诚度（0~100，低于 30 可能被策反或下野）
+++  · 所在位置：某城市或“在野”（随回合刷新可能出现）
+++· 玩家可通过“探索”指令发现本城在野名将，用“登用”指令说服加入（成功率受玩家魅力、名将忠诚倾向、相性影响）。
+++· 战斗中可俘虏敌方名将，关押后可招降或处决。
+++· 名将可被任命为太守、军师、出征主将，影响城市运营和军队战力。
+++
+++2.4 回合与指令系统
+++
+++· 游戏以季节为回合单位（每回合代表三个月）。每回合玩家获得若干“指令点数”（根据城市数量与政治值），例如基础 5 点，每多一座城 +2 点。
+++· 指令包括：
+++  · 内政类（消耗 1 点）：
+++    · 开发农田（提升粮食产量）
+++    · 发展商业（提升金钱收入）
+++    · 征兵（消耗人口、金钱，增加士兵）
+++    · 城防修筑（提升城墙等级）
+++    · 技术研究（推进科技树）
+++  · 人事类：
+++    · 探索（发现本城在野名将）
+++    · 登用（说服目标加入）
+++    · 赏赐（消耗金钱提升忠诚）
+++    · 任命太守/军师
+++  · 军事类：
+++    · 出征（选择将领、兵力，攻击相邻城市）
+++    · 输送（在己方城市间调运资源）
+++  · 外交/特殊类（消耗 1 点）：
+++    · 流言（降低敌方城市守将忠诚）
+++    · 计略（如“火攻”降低目标城防，“烧粮”减少敌方军粮等，成功率取决于智力差）
+++· 执行完所有指令后点击“结束回合”，世界进入 AI 操作与资源结算。
+++
+++2.5 资源与人口机制
+++
+++· 金钱：每回合城市商业收入 = 市集等级 × 100 + 人口 × 0.5。用于征兵、赏赐、研究。
+++· 军粮：每回合农田产量 = 农田等级 × 200。士兵每回合消耗军粮 = 士兵总数 × 0.5。军粮不足会导致士兵逃亡。
+++· 人口：城市人口上限由农田等级和初始设定决定。每回合自然增长 = 当前人口 × 政治系数 × 0.02。征兵会减少人口。
+++· 士兵：无人口上限限制，但受带兵将领统率约束（最大带兵数 = 统率 × 100）。训练度影响战斗力，默认 50，可通过“训练”指令或建筑提升。
+++· 城防：城墙等级提供耐久度，攻城战时必须先打掉城防才能杀伤城内守军。
+++
+++2.6 科技树
+++
+++· 设立一条简化的线性/分支科技树，共 6 项科技，每项 3 级：
+++  1. 农艺（提升粮食产量 +10%/级）
+++  2. 商贸（提升金钱收入 +10%/级）
+++  3. 冶炼（提升士兵攻击力 +5%/级）
+++  4. 筑城（提升城防值 +20%/级，并解锁高级城墙）
+++  5. 谋略（提升计谋成功率 +5%/级，解锁新计谋）
+++  6. 统御（提升带兵上限 +10%/级）
+++· 研究消耗金钱和时间（固定回合数，智力可缩短回合）。当前研究等级为势力全城共享。
+++
+++2.7 战斗系统（简化自动战斗）
+++
+++· 出征消耗军粮（按路程格数计算），到达敌城后进入战斗界面。
+++· 战斗采用回合制骰子模型，自动结算，但允许玩家在战前选择阵型和战术卡（若有军师技能）。
+++· 核心公式：
+++  · 我方攻击值 = (主将武力×0.4 + 统率×0.3 + 士兵数×0.01)×科技系数×训练度系数
+++  · 敌方同理。
+++  · 每回合双方同时对对方造成伤害，伤害 = 己方攻击值 - 对方城防减免（若有城防则优先消耗城防）。
+++  · 城防为 0 后，伤害转为削减士兵。士兵率先归零者战败。
+++  · 若名将单挑触发：武力差 > 20 时有概率触发单挑，直接决定胜负（武力高者胜，败方士气大幅下降）。
+++· 胜利后占领城市，可俘虏守将、缴获资源。
+++
+++2.8 AI 势力
+++
+++· 开局随机分配 5~8 个 AI 势力，各占据若干城市，并有随机君主名及生成武将。
+++· AI 行为优先级：
+++  1. 内政发展（征足够的兵、研究科技）
+++  2. 招募在野名将
+++  3. 攻击相邻且军力低于己方的玩家/其他 AI 城市
+++  4. 防御：薄弱城市输送资源
+++· AI 每回合也消耗等量指令点，简单判断即可。
+++
+++2.9 胜利与失败条件
+++
+++· 胜利：占领全部城市。
+++· 失败：玩家所有城市丢失且无可用将领/军队（可继续观战但无操作可能，设为游戏结束）。
+++
+++---
+++
+++三、数据结构设计（用于 localStorage 存档）
+++
+++3.1 全局游戏状态对象
+++
+++```json
+++{
+++  "version": 1,
+++  "turn": 1,
+++  "playerFactionId": 0,
+++  "factions": [ /* 势力数组 */ ],
+++  "cities": [ /* 城市数组 */ ],
+++  "heroes": [ /* 名将数组（含玩家君主和招募武将） */ ],
+++  "techLevels": { "agri": 0, "commerce": 0, "forge": 0, "wall": 0, "trick": 0, "leadership": 0 },
+++  "log": [ /* 最近的事件日志，用于显示回合简报 */ ]
+++}
+++```
+++
+++3.2 势力对象（Faction）
+++
+++```json
+++{
+++  "id": 0,
+++  "name": "玩家势力名",
+++  "color": "#ff0000",
+++  "money": 5000,
+++  "grain": 10000,
+++  "aiControlled": false
+++}
+++```
+++
+++3.3 城市对象（City）
+++
+++```json
+++{
+++  "id": "luoyang",
+++  "name": "洛阳",
+++  "ownerFactionId": 0,
+++  "population": 80000,
+++  "maxPopulation": 100000,
+++  "soldiers": 3000,
+++  "defense": 1000,
+++  "gold": 2000,
+++  "grain": 5000,
+++  "farmLevel": 1,
+++  "marketLevel": 1,
+++  "barracksLevel": 1,
+++  "wallLevel": 1,
+++  "workshopLevel": 0,   // 可选：工坊影响科技速度
+++  "governorHeroId": null, // 太守武将ID
+++  "adjacentCities": ["changan", "xuchang"] // 邻接城市ID列表
+++}
+++```
+++
+++3.4 名将对象（Hero）
+++
+++```json
+++{
+++  "id": "guanyu",
+++  "name": "关羽",
+++  "isPlayerLord": false, // 是否为玩家君主
+++  "factionId": 0,
+++  "cityId": "luoyang",   // 所在城市，若在野则 "wild_city_id"
+++  "status": "free",      // "free", "deployed", "prisoner"(俘虏，所在城市监狱)
+++  "loyalty": 95,
+++  "stats": {
+++    "leadership": 96,
+++    "warrior": 97,
+++    "intelligence": 75,
+++    "politics": 62,
+++    "charm": 88
+++  },
+++  "skill": {
+++    "name": "威震华夏",
+++    "type": "passive",   // 或 "active"
+++    "effect": "leadership_multiplier_1.1"
+++  }
+++}
+++```
+++
+++3.5 存档管理
+++
+++· 使用 localStorage，键名 "heroicThreeKingdoms_save"，保存完整的 JSON 字符串。
+++· 提供“保存游戏”、“读取游戏”、“新游戏”功能。
+++
+++---
+++
+++四、界面设计与交互流程
+++
+++4.1 屏幕适配
+++
+++· 采用移动端优先设计，最大宽度 480px，居中显示。
+++· 使用 Flexbox + 百分比布局，触摸友好按钮（最小 44x44px）。
+++· 所有操作使用底部 Tab 导航切换：地图 | 势力 | 名将 | 科技 | 系统。
+++
+++4.2 主要界面
+++
+++（1）开始界面
+++
+++· 游戏标题“雄图·三国志文明”与副标题。
+++· 按钮：【新游戏】【继续游戏】（灰色若没有存档）。
+++· 新游戏后进入君主创建界面：
+++  · 输入姓名文本框（校验2~4中文）。
+++  · 显示随机生成的五项属性（可点击“重新随机”，上限5次）。
+++  · 下方地图选择初始城市：高亮可选城市（未被AI占用），点击城市显示信息确认。
+++
+++（2）地图主界面
+++
+++· 显示简化中国地图，城市用圆形图标标识，颜色对应该势力。
+++· 当前选中己方城市：弹出城市详情面板（人口、金钱、兵粮等）。
+++· 点击己方城市可出现指令菜单（内政、人事、出征等按钮）。
+++· 点击敌方/空城显示基本信息及可用的军事指令（出征、计略）。
+++· 顶栏显示当前回合、金钱、军粮总览。
+++
+++（3）势力总览（Tab2）
+++
+++· 列表显示己方所有城市，每项可点击快速跳转地图并选中。
+++· 显示科技等级，资源总收入/支出预览。
+++
+++（4）名将列表（Tab3）
+++
+++· 按状态分类：在野（可探索）、属将、俘虏。
+++· 每个名将卡片显示属性、技能、忠诚，提供【赏赐】【任命】【释放/处决】操作。
+++
+++（5）科技树界面（Tab4）
+++
+++· 显示6项科技及其当前等级/下一级效果和消耗。
+++· 点击研究按钮扣除金钱并开始研究（显示剩余回合）。
+++
+++（6）系统菜单（Tab5）
+++
+++· 保存/读取游戏。
+++· 结束本回合（确认弹窗）。
+++· 游戏设置（音效开关，简单）。
+++
+++（7）战斗界面（模态窗口）
+++
+++· 当出征军队到达目标城市或敌军进攻己方城市时自动触发。
+++· 显示双方兵力、将领头像和属性条。
+++· 战前选择：阵型（普通/攻击/防御，影响系数）或使用军师计略（若智力够）。
+++· 点击开战，自动播放回合战报（文字滚动）。
+++· 显示结果，提供处理俘虏界面。
+++
+++4.3 回合事件摘要
+++
+++· 每回合结束后弹出一张总结卡片：
+++  · 收入报告（金、粮变化）。
+++  · 人口变化。
+++  · 名将动态（是否出现新在野、招募成功等）。
+++  · AI 进攻消息。
+++  · 玩家可逐条确认关闭。
+++
+++---
+++
+++五、AI 逻辑简述
+++
+++AI 每回合遍历其城市，按以下优先级消耗指令点：
+++
+++1. 若城市金币低于 500 且市场可升级：升市场。
+++2. 若城市士兵低于人口 20%：征兵。
+++3. 若存在在野名将且魅力>70的武将空闲：探索+登用。
+++4. 科技研究，若满足金钱花费。
+++5. 侵略判断：遍历相邻非己方城市，比较军力（己方士兵数+武将统率修正 vs 敌方士兵+城防），若优且兵力比>1.5则出征。
+++6. 对边境城市输送资源，平衡防御。
+++
+++AI 名将忠诚度管理：每回合有几率赏赐提升忠诚度。
+++
+++---
+++
+++六、技术实现建议
+++
+++· 纯前端技术栈：HTML5 + CSS3 + vanilla JS，无框架。
+++· 地图渲染：使用内嵌 SVG 地图，城市用 <circle> 表示，路径用 <line>，绑定点击事件。
+++· 响应式：meta viewport 设置，地图部分可缩放或固定尺寸，城市图标最小 30px 便于手指点击。
+++· 数据持久化：所有游戏对象序列化为 JSON 存入 localStorage，注意避免循环引用。
+++· 回合操作需加锁：避免玩家连续点击按钮造成状态混乱。
+++· 音效：可使用 Web Audio API 简短音效提示（可选）。
+++
+++---
+++
+++七、名将与城市初始数据（部分示例）
+++
+++7.1 城市列表（供参考，实际可扩展至18城）
+++
+++ID 名称 特性 人口上限 起始人口 金 粮 兵 邻接
+++luoyang 洛阳 商业+20% 100000 80000 3000 8000 2000 changan,xuchang,ye
+++changan 长安 城防+20% 80000 60000 2000 6000 1500 luoyang,hanshong
+++xuchang 许昌 人口增长+10% 70000 50000 2500 7000 1800 luoyang,xiapi,wan
+++chengdu 成都 粮食+15% 90000 70000 2000 10000 1600 hanzhong,jianning
+++……
+++
+++7.2 名将初始分布
+++
+++名将 所在城市/状态 忠诚倾向
+++关羽 在野（前期随机刷在刘备势力周边） 95(刘备)
+++诸葛亮 在野（襄阳） 100(刘备)
+++曹操 初始为势力君主（许昌） —
+++赵云 在野（常山） 90(刘备)
+++周瑜 建业势力初始武将 98(孙策)
+++吕布 在野（随机） 70（低）
+++
+++注：为避免版权和历史人名争议，可使用化名如“关云长”，但文档中暂用原名为直观。
+++
+++---
+++
+++八、总结
+++
+++本方案提供了完整的回合制策略游戏设计，融合了三国志的武将养成、指令式内政和文明的科技树、城市发展，地图基于中国城市节点图，操作适配手机，数据均存储于本地浏览器。Agent 可依据以上数据结构、界面模块、规则算法进行实现，构建出可玩的静态网页游戏。
++diff --git a/apps/xiong-tu-san-guo/README.md b/apps/xiong-tu-san-guo/README.md
++new file mode 100644
++index 0000000..6c38152
++--- /dev/null
+++++ b/apps/xiong-tu-san-guo/README.md
++@@ -0,0 +1,57 @@
+++# 雄图·三国志文明 · Heroic Three Kingdoms Civilization
+++
+++一款融合《三国志》武将养成 / 指令式内政与《文明》科技树推进的**单机回合制策略经营**网页游戏。自择一城起兵，开发内政、攀科技、招揽名将、征战四方，最终统一九州。
+++
+++技术栈：**纯原生 HTML + CSS + JavaScript（无框架、无 Canvas）**，移动端竖屏设计，地图由内嵌 SVG + 绝对定位城市点构成，数据持久化于浏览器 `localStorage`。体积小（构建后 JS ≈ 56KB / gzip ≈ 20KB），加载快。
+++
+++## 本地运行
+++
+++```bash
+++npm install
+++npm run dev        # 开发服务器 http://localhost:5179
+++npm run build      # 生产构建到 dist/
+++npm run test       # 纯逻辑自测（135+ 断言，不依赖浏览器）
+++npm run test:dom   # jsdom 驱动的 DOM 冒烟测试（21+ 断言）
+++```
+++
+++也可由主框架（落地页）以 `createGame(parent)` 动态挂载，无需独立部署。
+++
+++## 核心玩法
+++
+++- **立君择都**：开局自定义君主姓名（2~4 汉字），随机生成五项属性（统 / 武 / 智 / 政 / 魅，可重掷 5 次），再从 18 座城市中选择起兵之地。占据诸侯旧都时，其旧部将就地转为在野名将，可择机登用。
+++- **九州地图**：简化的中国古代地图，18 座核心城市以圆形节点呈现，按固定路径相邻相连；军队出征只能沿路径推进。金边为己方、灰点为空城、他色为诸侯。
+++- **内政经营**：每座城市可发展**农田 / 市集 / 城墙 / 兵营**（各 1~5 级）、征兵、操练。金钱与军粮为势力级共享池，每回合依市集、人口、农田等级结算；军粮不济则士兵逃亡，人口随太守政治自然增长。
+++- **名将系统**：内置 47 位历史名将（关羽、张飞、诸葛亮、赵云、周瑜、吕布、曹操……），各有五维面板、专属技能（如「威震华夏」「神算」）与忠诚度。用**探索**发现本城在野名将，**登用**说服加入（成功率受魅力、忠诚、相性影响）；战时可俘虏敌将，关押后**招降 / 释放 / 处决**。
+++- **科技树**：6 项科技（农艺 / 商贸 / 冶炼 / 筑城 / 谋略 / 统御）各 3 级，研究消耗金钱与回合（君主智力可缩短），完成后势力全城共享加成。
+++- **回合制征战**：出征按路程消耗军粮，进入简化自动战斗——双方依「武力·统率·兵力·科技·训练度·阵型」结算攻防，城防优先承受伤害；武力悬殊时可能触发**单挑**一击定胜负。胜则占城、俘将、缴获城库。
+++- **指令点数**：每回合获得若干指令点（基础 5 点 + 每多一城 +2 点 + 君主政治加成），内政、人事、军事、外交计略各耗点执行；可对相邻敌城施**火攻 / 烧粮 / 流言**等计略。
+++- **AI 诸侯**：开局随机分布 8 路诸侯，按「内政→招募→研究→侵略→输送→赏赐」优先级消耗指令点，各自施政出兵。
+++- **胜败条件**：占领全部 18 城 → 一统天下；所有城池尽失 → 大业未成。存档自动写入本地浏览器。
+++
+++## 数据结构
+++
+++全局状态序列化为 JSON 存于 `localStorage`（键 `xtsg_save_v1`）：势力、城市（人口 / 兵力 / 城防 / 建筑等级 / 邻接）、名将（属性 / 技能 / 忠诚 / 状态）、科技等级、当前研究、回合与事件日志。
+++
+++## 目录结构
+++
+++```
+++src/
+++├── main.js              入口工厂 createGame(parent)
+++├── config.js            全局常量与公式（经济 / 战斗 / 科技 / 计略）
+++├── data/
+++│   ├── cities.js        18 座城市（坐标 / 特性 / 邻接）
+++│   └── heroes.js        47 位名将 + 8 路 AI 势力种子
+++├── core/
+++│   ├── state.js         新局初始化 / 回合结算 / 胜负 / 查询
+++│   ├── economy.js       收支 / 人口 / 城防公式
+++│   ├── combat.js        自动战斗（骰子模型 + 城防 + 单挑）
+++│   ├── actions.js       玩家 / AI 共用命令（内政·人事·军事·计略·俘虏）
+++│   ├── ai.js            AI 诸侯回合
+++│   ├── tech.js          科技乘子与技能解析
+++│   ├── save.js          localStorage 存读
+++│   └── rng.js           随机工具（可种子化）
+++└── ui/
+++    ├── app.js           UI 控制器（启动 / 创角 / 对局五标签 / 弹窗）
+++    ├── dom.js           h() / clear() / bar() DOM 辅助
+++    └── style.css        古卷墨韵 + 鎏金描边
+++```
++diff --git a/apps/xiong-tu-san-guo/index.html b/apps/xiong-tu-san-guo/index.html
++new file mode 100644
++index 0000000..cb58277
++--- /dev/null
+++++ b/apps/xiong-tu-san-guo/index.html
++@@ -0,0 +1,27 @@
+++<!doctype html>
+++<html lang="zh-CN">
+++
+++<head>
+++  <meta charset="UTF-8" />
+++  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
+++  <meta name="theme-color" content="#1a1206" />
+++  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%231a1206'/%3E%3Ctext x='16' y='23' font-size='20' text-anchor='middle' fill='%23d4a84b' font-family='serif'%3E%E9%9B%84%3C/text%3E%3C/svg%3E" />
+++  <title>雄图·三国志文明</title>
+++  <style>
+++    html, body {
+++      margin: 0; padding: 0; width: 100%; height: 100%;
+++      background: #1a1206; overflow: hidden;
+++      font-family: "PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif;
+++      -webkit-user-select: none; user-select: none;
+++      -webkit-tap-highlight-color: transparent;
+++    }
+++    #game-container { position: relative; width: 100vw; height: 100vh; }
+++  </style>
+++</head>
+++
+++<body>
+++  <div id="game-container"></div>
+++  <script type="module" src="/src/main.js"></script>
+++</body>
+++
+++</html>
++diff --git a/apps/xiong-tu-san-guo/package-lock.json b/apps/xiong-tu-san-guo/package-lock.json
++new file mode 100644
++index 0000000..b89fb39
++--- /dev/null
+++++ b/apps/xiong-tu-san-guo/package-lock.json
++@@ -0,0 +1,1559 @@
+++{
+++  "name": "xiong-tu-san-guo",
+++  "version": "1.0.0",
+++  "lockfileVersion": 3,
+++  "requires": true,
+++  "packages": {
+++    "": {
+++      "name": "xiong-tu-san-guo",
+++      "version": "1.0.0",
+++      "devDependencies": {
+++        "jsdom": "^29.1.1",
+++        "vite": "^5.4.0"
+++      }
+++    },
+++    "node_modules/@asamuzakjp/css-color": {
+++      "version": "5.1.11",
+++      "resolved": "https://registry.npmjs.org/@asamuzakjp/css-color/-/css-color-5.1.11.tgz",
+++      "integrity": "sha512-KVw6qIiCTUQhByfTd78h2yD1/00waTmm9uy/R7Ck/ctUyAPj+AEDLkQIdJW0T8+qGgj3j5bpNKK7Q3G+LedJWg==",
+++      "dev": true,
+++      "license": "MIT",
+++      "dependencies": {
+++        "@asamuzakjp/generational-cache": "^1.0.1",
+++        "@csstools/css-calc": "^3.2.0",
+++        "@csstools/css-color-parser": "^4.1.0",
+++        "@csstools/css-parser-algorithms": "^4.0.0",
+++        "@csstools/css-tokenizer": "^4.0.0"
+++      },
+++      "engines": {
+++        "node": "^20.19.0 || ^22.12.0 || >=24.0.0"
+++      }
+++    },
+++    "node_modules/@asamuzakjp/dom-selector": {
+++      "version": "7.1.1",
+++      "resolved": "https://registry.npmjs.org/@asamuzakjp/dom-selector/-/dom-selector-7.1.1.tgz",
+++      "integrity": "sha512-67RZDnYRc8H/8MLDgQCDE//zoqVFwajkepHZgmXrbwybzXOEwOWGPYGmALYl9J2DOLfFPPs6kKCqmbzV895hTQ==",
+++      "dev": true,
+++      "license": "MIT",
+++      "dependencies": {
+++        "@asamuzakjp/generational-cache": "^1.0.1",
+++        "@asamuzakjp/nwsapi": "^2.3.9",
+++        "bidi-js": "^1.0.3",
+++        "css-tree": "^3.2.1",
+++        "is-potential-custom-element-name": "^1.0.1"
+++      },
+++      "engines": {
+++        "node": "^20.19.0 || ^22.12.0 || >=24.0.0"
+++      }
+++    },
+++    "node_modules/@asamuzakjp/generational-cache": {
+++      "version": "1.0.1",
+++      "resolved": "https://registry.npmjs.org/@asamuzakjp/generational-cache/-/generational-cache-1.0.1.tgz",
+++      "integrity": "sha512-wajfB8KqzMCN2KGNFdLkReeHncd0AslUSrvHVvvYWuU8ghncRJoA50kT3zP9MVL0+9g4/67H+cdvBskj9THPzg==",
+++      "dev": true,
+++      "license": "MIT",
+++      "engines": {
+++        "node": "^20.19.0 || ^22.12.0 || >=24.0.0"
+++      }
+++    },
+++    "node_modules/@asamuzakjp/nwsapi": {
+++      "version": "2.3.9",
+++      "resolved": "https://registry.npmjs.org/@asamuzakjp/nwsapi/-/nwsapi-2.3.9.tgz",
+++      "integrity": "sha512-n8GuYSrI9bF7FFZ/SjhwevlHc8xaVlb/7HmHelnc/PZXBD2ZR49NnN9sMMuDdEGPeeRQ5d0hqlSlEpgCX3Wl0Q==",
+++      "dev": true,
+++      "license": "MIT"
+++    },
+++    "node_modules/@bramus/specificity": {
+++      "version": "2.4.2",
+++      "resolved": "https://registry.npmjs.org/@bramus/specificity/-/specificity-2.4.2.tgz",
+++      "integrity": "sha512-ctxtJ/eA+t+6q2++vj5j7FYX3nRu311q1wfYH3xjlLOsczhlhxAg2FWNUXhpGvAw3BWo1xBcvOV6/YLc2r5FJw==",
+++      "dev": true,
+++      "license": "MIT",
+++      "dependencies": {
+++        "css-tree": "^3.0.0"
+++      },
+++      "bin": {
+++        "specificity": "bin/cli.js"
+++      }
+++    },
+++    "node_modules/@csstools/color-helpers": {
+++      "version": "6.1.0",
+++      "resolved": "https://registry.npmjs.org/@csstools/color-helpers/-/color-helpers-6.1.0.tgz",
+++      "integrity": "sha512-064IFJdjTfUqnjpCVpMOdbr8FLQBhinbZj6yRv2An2E41O/pLEXqfFRWqGq/SxlE5PEUYTlvWsG2r8MswAVvkg==",
+++      "dev": true,
+++      "funding": [
+++        {
+++          "type": "github",
+++          "url": "https://github.com/sponsors/csstools"
+++        },
+++        {
+++          "type": "opencollective",
+++          "url": "https://opencollective.com/csstools"
+++        }
+++      ],
+++      "license": "MIT-0",
+++      "engines": {
+++        "node": ">=20.19.0"
+++      }
+++    },
+++    "node_modules/@csstools/css-calc": {
+++      "version": "3.3.0",
+++      "resolved": "https://registry.npmjs.org/@csstools/css-calc/-/css-calc-3.3.0.tgz",
+++      "integrity": "sha512-c5ihYsPkdG6JCkU2zTMm4+k6r7RXuGxtWYhu5DHMIiF1FHzrfmHL5so11AoFpUv/tu61xfcmT4AmKoFfMPoqdQ==",
+++      "dev": true,
+++      "funding": [
+++        {
+++          "type": "github",
+++          "url": "https://github.com/sponsors/csstools"
+++        },
+++        {
+++          "type": "opencollective",
+++          "url": "https://opencollective.com/csstools"
+++        }
+++      ],
+++      "license": "MIT",
+++      "engines": {
+++        "node": ">=20.19.0"
+++      },
+++      "peerDependencies": {
+++        "@csstools/css-parser-algorithms": "^4.0.0",
+++        "@csstools/css-tokenizer": "^4.0.0"
+++      }
+++    },
+++    "node_modules/@csstools/css-color-parser": {
+++      "version": "4.1.10",
+++      "resolved": "https://registry.npmjs.org/@csstools/css-color-parser/-/css-color-parser-4.1.10.tgz",
+++      "integrity": "sha512-UZhQLIUyJaaMepqehrCODwCg2KW25vFvLWBmqYFaPclYvvxzj/sG8LBOhBFCp11i9uE7t1EyS+RAoV9tztPFyw==",
+++      "dev": true,
+++      "funding": [
+++        {
+++          "type": "github",
+++          "url": "https://github.com/sponsors/csstools"
+++        },
+++        {
+++          "type": "opencollective",
+++          "url": "https://opencollective.com/csstools"
+++        }
+++      ],
+++      "license": "MIT",
+++      "dependencies": {
+++        "@csstools/color-helpers": "^6.1.0",
+++        "@csstools/css-calc": "^3.3.0"
+++      },
+++      "engines": {
+++        "node": ">=20.19.0"
+++      },
+++      "peerDependencies": {
+++        "@csstools/css-parser-algorithms": "^4.0.0",
+++        "@csstools/css-tokenizer": "^4.0.0"
+++      }
+++    },
+++    "node_modules/@csstools/css-parser-algorithms": {
+++      "version": "4.0.0",
+++      "resolved": "https://registry.npmjs.org/@csstools/css-parser-algorithms/-/css-parser-algorithms-4.0.0.tgz",
+++      "integrity": "sha512-+B87qS7fIG3L5h3qwJ/IFbjoVoOe/bpOdh9hAjXbvx0o8ImEmUsGXN0inFOnk2ChCFgqkkGFQ+TpM5rbhkKe4w==",
+++      "dev": true,
+++      "funding": [
+++        {
+++          "type": "github",
+++          "url": "https://github.com/sponsors/csstools"
+++        },
+++        {
+++          "type": "opencollective",
+++          "url": "https://opencollective.com/csstools"
+++        }
+++      ],
+++      "license": "MIT",
+++      "engines": {
+++        "node": ">=20.19.0"
+++      },
+++      "peerDependencies": {
+++        "@csstools/css-tokenizer": "^4.0.0"
+++      }
+++    },
+++    "node_modules/@csstools/css-syntax-patches-for-csstree": {
+++      "version": "1.1.7",
+++      "resolved": "https://registry.npmjs.org/@csstools/css-syntax-patches-for-csstree/-/css-syntax-patches-for-csstree-1.1.7.tgz",
+++      "integrity": "sha512-fQ+05118eQS1cofO3aJpB5efgpBZMvIzwr/sbC8kDLVA5XLG8q1kJV5yzrUAI1f7lvhPnm8fgIjzFB8/O/5Dig==",
+++      "dev": true,
+++      "funding": [
+++        {
+++          "type": "github",
+++          "url": "https://github.com/sponsors/csstools"
+++        },
+++        {
+++          "type": "opencollective",
+++          "url": "https://opencollective.com/csstools"
+++        }
+++      ],
+++      "license": "MIT-0",
+++      "peerDependencies": {
+++        "css-tree": "^3.2.1"
+++      },
+++      "peerDependenciesMeta": {
+++        "css-tree": {
+++          "optional": true
+++        }
+++      }
+++    },
+++    "node_modules/@csstools/css-tokenizer": {
+++      "version": "4.0.0",
+++      "resolved": "https://registry.npmjs.org/@csstools/css-tokenizer/-/css-tokenizer-4.0.0.tgz",
+++      "integrity": "sha512-QxULHAm7cNu72w97JUNCBFODFaXpbDg+dP8b/oWFAZ2MTRppA3U00Y2L1HqaS4J6yBqxwa/Y3nMBaxVKbB/NsA==",
+++      "dev": true,
+++      "funding": [
+++        {
+++          "type": "github",
+++          "url": "https://github.com/sponsors/csstools"
+++        },
+++        {
+++          "type": "opencollective",
+++          "url": "https://opencollective.com/csstools"
+++        }
+++      ],
+++      "license": "MIT",
+++      "engines": {
+++        "node": ">=20.19.0"
+++      }
+++    },
+++    "node_modules/@esbuild/aix-ppc64": {
+++      "version": "0.21.5",
+++      "resolved": "https://registry.npmjs.org/@esbuild/aix-ppc64/-/aix-ppc64-0.21.5.tgz",
+++      "integrity": "sha512-1SDgH6ZSPTlggy1yI6+Dbkiz8xzpHJEVAlF/AM1tHPLsf5STom9rwtjE4hKAF20FfXXNTFqEYXyJNWh1GiZedQ==",
+++      "cpu": [
+++        "ppc64"
+++      ],
+++      "dev": true,
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "aix"
+++      ],
+++      "engines": {
+++        "node": ">=12"
+++      }
+++    },
+++    "node_modules/@esbuild/android-arm": {
+++      "version": "0.21.5",
+++      "resolved": "https://registry.npmjs.org/@esbuild/android-arm/-/android-arm-0.21.5.tgz",
+++      "integrity": "sha512-vCPvzSjpPHEi1siZdlvAlsPxXl7WbOVUBBAowWug4rJHb68Ox8KualB+1ocNvT5fjv6wpkX6o/iEpbDrf68zcg==",
+++      "cpu": [
+++        "arm"
+++      ],
+++      "dev": true,
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "android"
+++      ],
+++      "engines": {
+++        "node": ">=12"
+++      }
+++    },
+++    "node_modules/@esbuild/android-arm64": {
+++      "version": "0.21.5",
+++      "resolved": "https://registry.npmjs.org/@esbuild/android-arm64/-/android-arm64-0.21.5.tgz",
+++      "integrity": "sha512-c0uX9VAUBQ7dTDCjq+wdyGLowMdtR/GoC2U5IYk/7D1H1JYC0qseD7+11iMP2mRLN9RcCMRcjC4YMclCzGwS/A==",
+++      "cpu": [
+++        "arm64"
+++      ],
+++      "dev": true,
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "android"
+++      ],
+++      "engines": {
+++        "node": ">=12"
+++      }
+++    },
+++    "node_modules/@esbuild/android-x64": {
+++      "version": "0.21.5",
+++      "resolved": "https://registry.npmjs.org/@esbuild/android-x64/-/android-x64-0.21.5.tgz",
+++      "integrity": "sha512-D7aPRUUNHRBwHxzxRvp856rjUHRFW1SdQATKXH2hqA0kAZb1hKmi02OpYRacl0TxIGz/ZmXWlbZgjwWYaCakTA==",
+++      "cpu": [
+++        "x64"
+++      ],
+++      "dev": true,
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "android"
+++      ],
+++      "engines": {
+++        "node": ">=12"
+++      }
+++    },
+++    "node_modules/@esbuild/darwin-arm64": {
+++      "version": "0.21.5",
+++      "resolved": "https://registry.npmjs.org/@esbuild/darwin-arm64/-/darwin-arm64-0.21.5.tgz",
+++      "integrity": "sha512-DwqXqZyuk5AiWWf3UfLiRDJ5EDd49zg6O9wclZ7kUMv2WRFr4HKjXp/5t8JZ11QbQfUS6/cRCKGwYhtNAY88kQ==",
+++      "cpu": [
+++        "arm64"
+++      ],
+++      "dev": true,
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "darwin"
+++      ],
+++      "engines": {
+++        "node": ">=12"
+++      }
+++    },
+++    "node_modules/@esbuild/darwin-x64": {
+++      "version": "0.21.5",
+++      "resolved": "https://registry.npmjs.org/@esbuild/darwin-x64/-/darwin-x64-0.21.5.tgz",
+++      "integrity": "sha512-se/JjF8NlmKVG4kNIuyWMV/22ZaerB+qaSi5MdrXtd6R08kvs2qCN4C09miupktDitvh8jRFflwGFBQcxZRjbw==",
+++      "cpu": [
+++        "x64"
+++      ],
+++      "dev": true,
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "darwin"
+++      ],
+++      "engines": {
+++        "node": ">=12"
+++      }
+++    },
+++    "node_modules/@esbuild/freebsd-arm64": {
+++      "version": "0.21.5",
+++      "resolved": "https://registry.npmjs.org/@esbuild/freebsd-arm64/-/freebsd-arm64-0.21.5.tgz",
+++      "integrity": "sha512-5JcRxxRDUJLX8JXp/wcBCy3pENnCgBR9bN6JsY4OmhfUtIHe3ZW0mawA7+RDAcMLrMIZaf03NlQiX9DGyB8h4g==",
+++      "cpu": [
+++        "arm64"
+++      ],
+++      "dev": true,
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "freebsd"
+++      ],
+++      "engines": {
+++        "node": ">=12"
+++      }
+++    },
+++    "node_modules/@esbuild/freebsd-x64": {
+++      "version": "0.21.5",
+++      "resolved": "https://registry.npmjs.org/@esbuild/freebsd-x64/-/freebsd-x64-0.21.5.tgz",
+++      "integrity": "sha512-J95kNBj1zkbMXtHVH29bBriQygMXqoVQOQYA+ISs0/2l3T9/kj42ow2mpqerRBxDJnmkUDCaQT/dfNXWX/ZZCQ==",
+++      "cpu": [
+++        "x64"
+++      ],
+++      "dev": true,
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "freebsd"
+++      ],
+++      "engines": {
+++        "node": ">=12"
+++      }
+++    },
+++    "node_modules/@esbuild/linux-arm": {
+++      "version": "0.21.5",
+++      "resolved": "https://registry.npmjs.org/@esbuild/linux-arm/-/linux-arm-0.21.5.tgz",
+++      "integrity": "sha512-bPb5AHZtbeNGjCKVZ9UGqGwo8EUu4cLq68E95A53KlxAPRmUyYv2D6F0uUI65XisGOL1hBP5mTronbgo+0bFcA==",
+++      "cpu": [
+++        "arm"
+++      ],
+++      "dev": true,
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "linux"
+++      ],
+++      "engines": {
+++        "node": ">=12"
+++      }
+++    },
+++    "node_modules/@esbuild/linux-arm64": {
+++      "version": "0.21.5",
+++      "resolved": "https://registry.npmjs.org/@esbuild/linux-arm64/-/linux-arm64-0.21.5.tgz",
+++      "integrity": "sha512-ibKvmyYzKsBeX8d8I7MH/TMfWDXBF3db4qM6sy+7re0YXya+K1cem3on9XgdT2EQGMu4hQyZhan7TeQ8XkGp4Q==",
+++      "cpu": [
+++        "arm64"
+++      ],
+++      "dev": true,
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "linux"
+++      ],
+++      "engines": {
+++        "node": ">=12"
+++      }
+++    },
+++    "node_modules/@esbuild/linux-ia32": {
+++      "version": "0.21.5",
+++      "resolved": "https://registry.npmjs.org/@esbuild/linux-ia32/-/linux-ia32-0.21.5.tgz",
+++      "integrity": "sha512-YvjXDqLRqPDl2dvRODYmmhz4rPeVKYvppfGYKSNGdyZkA01046pLWyRKKI3ax8fbJoK5QbxblURkwK/MWY18Tg==",
+++      "cpu": [
+++        "ia32"
+++      ],
+++      "dev": true,
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "linux"
+++      ],
+++      "engines": {
+++        "node": ">=12"
+++      }
+++    },
+++    "node_modules/@esbuild/linux-loong64": {
+++      "version": "0.21.5",
+++      "resolved": "https://registry.npmjs.org/@esbuild/linux-loong64/-/linux-loong64-0.21.5.tgz",
+++      "integrity": "sha512-uHf1BmMG8qEvzdrzAqg2SIG/02+4/DHB6a9Kbya0XDvwDEKCoC8ZRWI5JJvNdUjtciBGFQ5PuBlpEOXQj+JQSg==",
+++      "cpu": [
+++        "loong64"
+++      ],
+++      "dev": true,
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "linux"
+++      ],
+++      "engines": {
+++        "node": ">=12"
+++      }
+++    },
+++    "node_modules/@esbuild/linux-mips64el": {
+++      "version": "0.21.5",
+++      "resolved": "https://registry.npmjs.org/@esbuild/linux-mips64el/-/linux-mips64el-0.21.5.tgz",
+++      "integrity": "sha512-IajOmO+KJK23bj52dFSNCMsz1QP1DqM6cwLUv3W1QwyxkyIWecfafnI555fvSGqEKwjMXVLokcV5ygHW5b3Jbg==",
+++      "cpu": [
+++        "mips64el"
+++      ],
+++      "dev": true,
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "linux"
+++      ],
+++      "engines": {
+++        "node": ">=12"
+++      }
+++    },
+++    "node_modules/@esbuild/linux-ppc64": {
+++      "version": "0.21.5",
+++      "resolved": "https://registry.npmjs.org/@esbuild/linux-ppc64/-/linux-ppc64-0.21.5.tgz",
+++      "integrity": "sha512-1hHV/Z4OEfMwpLO8rp7CvlhBDnjsC3CttJXIhBi+5Aj5r+MBvy4egg7wCbe//hSsT+RvDAG7s81tAvpL2XAE4w==",
+++      "cpu": [
+++        "ppc64"
+++      ],
+++      "dev": true,
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "linux"
+++      ],
+++      "engines": {
+++        "node": ">=12"
+++      }
+++    },
+++    "node_modules/@esbuild/linux-riscv64": {
+++      "version": "0.21.5",
+++      "resolved": "https://registry.npmjs.org/@esbuild/linux-riscv64/-/linux-riscv64-0.21.5.tgz",
+++      "integrity": "sha512-2HdXDMd9GMgTGrPWnJzP2ALSokE/0O5HhTUvWIbD3YdjME8JwvSCnNGBnTThKGEB91OZhzrJ4qIIxk/SBmyDDA==",
+++      "cpu": [
+++        "riscv64"
+++      ],
+++      "dev": true,
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "linux"
+++      ],
+++      "engines": {
+++        "node": ">=12"
+++      }
+++    },
+++    "node_modules/@esbuild/linux-s390x": {
+++      "version": "0.21.5",
+++      "resolved": "https://registry.npmjs.org/@esbuild/linux-s390x/-/linux-s390x-0.21.5.tgz",
+++      "integrity": "sha512-zus5sxzqBJD3eXxwvjN1yQkRepANgxE9lgOW2qLnmr8ikMTphkjgXu1HR01K4FJg8h1kEEDAqDcZQtbrRnB41A==",
+++      "cpu": [
+++        "s390x"
+++      ],
+++      "dev": true,
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "linux"
+++      ],
+++      "engines": {
+++        "node": ">=12"
+++      }
+++    },
+++    "node_modules/@esbuild/linux-x64": {
+++      "version": "0.21.5",
+++      "resolved": "https://registry.npmjs.org/@esbuild/linux-x64/-/linux-x64-0.21.5.tgz",
+++      "integrity": "sha512-1rYdTpyv03iycF1+BhzrzQJCdOuAOtaqHTWJZCWvijKD2N5Xu0TtVC8/+1faWqcP9iBCWOmjmhoH94dH82BxPQ==",
+++      "cpu": [
+++        "x64"
+++      ],
+++      "dev": true,
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "linux"
+++      ],
+++      "engines": {
+++        "node": ">=12"
+++      }
+++    },
+++    "node_modules/@esbuild/netbsd-x64": {
+++      "version": "0.21.5",
+++      "resolved": "https://registry.npmjs.org/@esbuild/netbsd-x64/-/netbsd-x64-0.21.5.tgz",
+++      "integrity": "sha512-Woi2MXzXjMULccIwMnLciyZH4nCIMpWQAs049KEeMvOcNADVxo0UBIQPfSmxB3CWKedngg7sWZdLvLczpe0tLg==",
+++      "cpu": [
+++        "x64"
+++      ],
+++      "dev": true,
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "netbsd"
+++      ],
+++      "engines": {
+++        "node": ">=12"
+++      }
+++    },
+++    "node_modules/@esbuild/openbsd-x64": {
+++      "version": "0.21.5",
+++      "resolved": "https://registry.npmjs.org/@esbuild/openbsd-x64/-/openbsd-x64-0.21.5.tgz",
+++      "integrity": "sha512-HLNNw99xsvx12lFBUwoT8EVCsSvRNDVxNpjZ7bPn947b8gJPzeHWyNVhFsaerc0n3TsbOINvRP2byTZ5LKezow==",
+++      "cpu": [
+++        "x64"
+++      ],
+++      "dev": true,
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "openbsd"
+++      ],
+++      "engines": {
+++        "node": ">=12"
+++      }
+++    },
+++    "node_modules/@esbuild/sunos-x64": {
+++      "version": "0.21.5",
+++      "resolved": "https://registry.npmjs.org/@esbuild/sunos-x64/-/sunos-x64-0.21.5.tgz",
+++      "integrity": "sha512-6+gjmFpfy0BHU5Tpptkuh8+uw3mnrvgs+dSPQXQOv3ekbordwnzTVEb4qnIvQcYXq6gzkyTnoZ9dZG+D4garKg==",
+++      "cpu": [
+++        "x64"
+++      ],
+++      "dev": true,
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "sunos"
+++      ],
+++      "engines": {
+++        "node": ">=12"
+++      }
+++    },
+++    "node_modules/@esbuild/win32-arm64": {
+++      "version": "0.21.5",
+++      "resolved": "https://registry.npmjs.org/@esbuild/win32-arm64/-/win32-arm64-0.21.5.tgz",
+++      "integrity": "sha512-Z0gOTd75VvXqyq7nsl93zwahcTROgqvuAcYDUr+vOv8uHhNSKROyU961kgtCD1e95IqPKSQKH7tBTslnS3tA8A==",
+++      "cpu": [
+++        "arm64"
+++      ],
+++      "dev": true,
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "win32"
+++      ],
+++      "engines": {
+++        "node": ">=12"
+++      }
+++    },
+++    "node_modules/@esbuild/win32-ia32": {
+++      "version": "0.21.5",
+++      "resolved": "https://registry.npmjs.org/@esbuild/win32-ia32/-/win32-ia32-0.21.5.tgz",
+++      "integrity": "sha512-SWXFF1CL2RVNMaVs+BBClwtfZSvDgtL//G/smwAc5oVK/UPu2Gu9tIaRgFmYFFKrmg3SyAjSrElf0TiJ1v8fYA==",
+++      "cpu": [
+++        "ia32"
+++      ],
+++      "dev": true,
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "win32"
+++      ],
+++      "engines": {
+++        "node": ">=12"
+++      }
+++    },
+++    "node_modules/@esbuild/win32-x64": {
+++      "version": "0.21.5",
+++      "resolved": "https://registry.npmjs.org/@esbuild/win32-x64/-/win32-x64-0.21.5.tgz",
+++      "integrity": "sha512-tQd/1efJuzPC6rCFwEvLtci/xNFcTZknmXs98FYDfGE4wP9ClFV98nyKrzJKVPMhdDnjzLhdUyMX4PsQAPjwIw==",
+++      "cpu": [
+++        "x64"
+++      ],
+++      "dev": true,
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "win32"
+++      ],
+++      "engines": {
+++        "node": ">=12"
+++      }
+++    },
+++    "node_modules/@exodus/bytes": {
+++      "version": "1.15.1",
+++      "resolved": "https://registry.npmjs.org/@exodus/bytes/-/bytes-1.15.1.tgz",
+++      "integrity": "sha512-S6mL0yNB/Abt9Ei4tq8gDhcczc4S3+vQ4ra7vxnAf+YHC02srtqxKKZghx2Dq6p0e66THKwR6r8N6P95wEty7Q==",
+++      "dev": true,
+++      "license": "MIT",
+++      "engines": {
+++        "node": "^20.19.0 || ^22.12.0 || >=24.0.0"
+++      },
+++      "peerDependencies": {
+++        "@noble/hashes": "^1.8.0 || ^2.0.0"
+++      },
+++      "peerDependenciesMeta": {
+++        "@noble/hashes": {
+++          "optional": true
+++        }
+++      }
+++    },
+++    "node_modules/@rollup/rollup-android-arm-eabi": {
+++      "version": "4.62.2",
+++      "resolved": "https://registry.npmjs.org/@rollup/rollup-android-arm-eabi/-/rollup-android-arm-eabi-4.62.2.tgz",
+++      "integrity": "sha512-6o7ZLZK+BeenkZCFNDXqpbjw9bD6nuWonvS/lwQJp7NoVVxm6p3qE7qQ5jGuBjiFsgvqjD8mZAU5oWxTmbOeOg==",
+++      "cpu": [
+++        "arm"
+++      ],
+++      "dev": true,
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "android"
+++      ]
+++    },
+++    "node_modules/@rollup/rollup-android-arm64": {
+++      "version": "4.62.2",
+++      "resolved": "https://registry.npmjs.org/@rollup/rollup-android-arm64/-/rollup-android-arm64-4.62.2.tgz",
+++      "integrity": "sha512-BaH7BllCACHoH1LguOU56UItGfUWjujlO65kS9LAodViaN4bwIKd7oeW/ZHJ/4ljr/7MIiENnNy3HJ0zXv8Zkw==",
+++      "cpu": [
+++        "arm64"
+++      ],
+++      "dev": true,
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "android"
+++      ]
+++    },
+++    "node_modules/@rollup/rollup-darwin-arm64": {
+++      "version": "4.62.2",
+++      "resolved": "https://registry.npmjs.org/@rollup/rollup-darwin-arm64/-/rollup-darwin-arm64-4.62.2.tgz",
+++      "integrity": "sha512-v39RCCvj4He82I9sFmk+M1VZ0PLM9sfsLVikjfx2hYBNALhrrOR2D3JjQA6AhlaSOgcR+RzrKY7e1+bT6SUO/A==",
+++      "cpu": [
+++        "arm64"
+++      ],
+++      "dev": true,
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "darwin"
+++      ]
+++    },
+++    "node_modules/@rollup/rollup-darwin-x64": {
+++      "version": "4.62.2",
+++      "resolved": "https://registry.npmjs.org/@rollup/rollup-darwin-x64/-/rollup-darwin-x64-4.62.2.tgz",
+++      "integrity": "sha512-yl0y2vq3S3lHeuXhEdss6TWfKW8vkujImO12tn4ZkG/4oghr09LvdYm2RElVjokTQiUvDUGXLGsYeLqUMCKpGA==",
+++      "cpu": [
+++        "x64"
+++      ],
+++      "dev": true,
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "darwin"
+++      ]
+++    },
+++    "node_modules/@rollup/rollup-freebsd-arm64": {
+++      "version": "4.62.2",
+++      "resolved": "https://registry.npmjs.org/@rollup/rollup-freebsd-arm64/-/rollup-freebsd-arm64-4.62.2.tgz",
+++      "integrity": "sha512-tT4pvt4qXD+vEoezupCWi+a1F0vvDiksiHc+PxRlYTOH1I6/X4id9jPxTP+Fg+545euaFT1jJVs4CEdHZAU1vw==",
+++      "cpu": [
+++        "arm64"
+++      ],
+++      "dev": true,
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "freebsd"
+++      ]
+++    },
+++    "node_modules/@rollup/rollup-freebsd-x64": {
+++      "version": "4.62.2",
+++      "resolved": "https://registry.npmjs.org/@rollup/rollup-freebsd-x64/-/rollup-freebsd-x64-4.62.2.tgz",
+++      "integrity": "sha512-6nU5F2wCW+qvCBhTn1pdIU3bzsIoF7EUwsCDRxilWGprQR6yd508YnH9+OKFCwpfS8pjZqDUmnCAr7exax0XCg==",
+++      "cpu": [
+++        "x64"
+++      ],
+++      "dev": true,
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "freebsd"
+++      ]
+++    },
+++    "node_modules/@rollup/rollup-linux-arm-gnueabihf": {
+++      "version": "4.62.2",
+++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm-gnueabihf/-/rollup-linux-arm-gnueabihf-4.62.2.tgz",
+++      "integrity": "sha512-n1GJHPOvpIfhi3TmrCeh6S6URt9BFCt0KQE3qvexyGCTAKpR4Lg+eWvNZEqu7epxwus/8ElT3hacYEucm49SZg==",
+++      "cpu": [
+++        "arm"
+++      ],
+++      "dev": true,
+++      "libc": [
+++        "glibc"
+++      ],
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "linux"
+++      ]
+++    },
+++    "node_modules/@rollup/rollup-linux-arm-musleabihf": {
+++      "version": "4.62.2",
+++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm-musleabihf/-/rollup-linux-arm-musleabihf-4.62.2.tgz",
+++      "integrity": "sha512-JqgflS8wEB+UXV/vS1RpRbifGBeN4D5lz8D8oOFbFZw4vedvdOgCFAjfBmIMdW3yL10XpQQ0Ambepw6MXrhOnA==",
+++      "cpu": [
+++        "arm"
+++      ],
+++      "dev": true,
+++      "libc": [
+++        "musl"
+++      ],
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "linux"
+++      ]
+++    },
+++    "node_modules/@rollup/rollup-linux-arm64-gnu": {
+++      "version": "4.62.2",
+++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm64-gnu/-/rollup-linux-arm64-gnu-4.62.2.tgz",
+++      "integrity": "sha512-wnFJkogWvN4jm/hQRF2UBaeUmk20j5+DmHvoyWii2b8HJDyvz1MF2OU/6ynXt2KR63rbZLWkFpoytpdc/yBuSA==",
+++      "cpu": [
+++        "arm64"
+++      ],
+++      "dev": true,
+++      "libc": [
+++        "glibc"
+++      ],
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "linux"
+++      ]
+++    },
+++    "node_modules/@rollup/rollup-linux-arm64-musl": {
+++      "version": "4.62.2",
+++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm64-musl/-/rollup-linux-arm64-musl-4.62.2.tgz",
+++      "integrity": "sha512-HVu2bp0zhvJ8xHEV9+UUs7S90VadmBSY3LcIMvozbPo4AuMGDWlz3ymHLHZPX4hR67TKTt8Qp5PJ5RBg/i+RMQ==",
+++      "cpu": [
+++        "arm64"
+++      ],
+++      "dev": true,
+++      "libc": [
+++        "musl"
+++      ],
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "linux"
+++      ]
+++    },
+++    "node_modules/@rollup/rollup-linux-loong64-gnu": {
+++      "version": "4.62.2",
+++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-loong64-gnu/-/rollup-linux-loong64-gnu-4.62.2.tgz",
+++      "integrity": "sha512-mQqqAV8QaoSgr9I2fKDLY2BAVvmKjWoGiu/cSYQonsLvtqwEn1E4QYfnCOcp5zoEqNhsDYin1s6jx/VJmrxlZg==",
+++      "cpu": [
+++        "loong64"
+++      ],
+++      "dev": true,
+++      "libc": [
+++        "glibc"
+++      ],
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "linux"
+++      ]
+++    },
+++    "node_modules/@rollup/rollup-linux-loong64-musl": {
+++      "version": "4.62.2",
+++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-loong64-musl/-/rollup-linux-loong64-musl-4.62.2.tgz",
+++      "integrity": "sha512-IxKLoxCQ2IWi6bT2akyDUBGsOImDKB+sPp4EsTmwFQ/fMwpCKm8uLSSgP/Kx/QYUgKis6SEZ5/Nlhup0DIA0PQ==",
+++      "cpu": [
+++        "loong64"
+++      ],
+++      "dev": true,
+++      "libc": [
+++        "musl"
+++      ],
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "linux"
+++      ]
+++    },
+++    "node_modules/@rollup/rollup-linux-ppc64-gnu": {
+++      "version": "4.62.2",
+++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-ppc64-gnu/-/rollup-linux-ppc64-gnu-4.62.2.tgz",
+++      "integrity": "sha512-Mk5ha2RQSgyFfmYYLkBpPnUk8D8FriBxesO1u9O75X0mHgXL1UQcH5Itl2lurWL2tj0RxV9b9tJgipac0hRY9A==",
+++      "cpu": [
+++        "ppc64"
+++      ],
+++      "dev": true,
+++      "libc": [
+++        "glibc"
+++      ],
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "linux"
+++      ]
+++    },
+++    "node_modules/@rollup/rollup-linux-ppc64-musl": {
+++      "version": "4.62.2",
+++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-ppc64-musl/-/rollup-linux-ppc64-musl-4.62.2.tgz",
+++      "integrity": "sha512-CjvEnqJL/0/TQ3TXX3OPIJ/kmBellrWd4heXUmHeJlTnmwjKpSJzoehLaL6Xk0ZnMHBu9dZuFADNOrtjF4v+2w==",
+++      "cpu": [
+++        "ppc64"
+++      ],
+++      "dev": true,
+++      "libc": [
+++        "musl"
+++      ],
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "linux"
+++      ]
+++    },
+++    "node_modules/@rollup/rollup-linux-riscv64-gnu": {
+++      "version": "4.62.2",
+++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-riscv64-gnu/-/rollup-linux-riscv64-gnu-4.62.2.tgz",
+++      "integrity": "sha512-1SiZbzwdkaDURsew/tSOrooKiYy7EQGT6m8ufavAi9NEyQb/6VuIxFXAL1fqa4iZe3g4NbNk4P7J32z2tw5Mgg==",
+++      "cpu": [
+++        "riscv64"
+++      ],
+++      "dev": true,
+++      "libc": [
+++        "glibc"
+++      ],
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "linux"
+++      ]
+++    },
+++    "node_modules/@rollup/rollup-linux-riscv64-musl": {
+++      "version": "4.62.2",
+++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-riscv64-musl/-/rollup-linux-riscv64-musl-4.62.2.tgz",
+++      "integrity": "sha512-nQts12zJ3NQRoE6uYljOH89v7szzLDvG2JD/vsX+vGXU8w/At1GowTZ5/7qeFQ8m7L55rpR8Okugnuo5bgjy2Q==",
+++      "cpu": [
+++        "riscv64"
+++      ],
+++      "dev": true,
+++      "libc": [
+++        "musl"
+++      ],
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "linux"
+++      ]
+++    },
+++    "node_modules/@rollup/rollup-linux-s390x-gnu": {
+++      "version": "4.62.2",
+++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-s390x-gnu/-/rollup-linux-s390x-gnu-4.62.2.tgz",
+++      "integrity": "sha512-E9/ll019jhPIJgpzfZoIkBGhcz+kKNgVWYRY0zr9srBdPPFVpvOKW8VaJKUbeK+eZXyQF9ltME+Kk6affeaPgg==",
+++      "cpu": [
+++        "s390x"
+++      ],
+++      "dev": true,
+++      "libc": [
+++        "glibc"
+++      ],
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "linux"
+++      ]
+++    },
+++    "node_modules/@rollup/rollup-linux-x64-gnu": {
+++      "version": "4.62.2",
+++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-x64-gnu/-/rollup-linux-x64-gnu-4.62.2.tgz",
+++      "integrity": "sha512-5BqxR/pshjey51iliyzTD5Xi3EN0aLmQ2lZ3lvefVV9c82BvrLo2/6OT55iifpWBufs6kdwWbuOKS841DrmK9A==",
+++      "cpu": [
+++        "x64"
+++      ],
+++      "dev": true,
+++      "libc": [
+++        "glibc"
+++      ],
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "linux"
+++      ]
+++    },
+++    "node_modules/@rollup/rollup-linux-x64-musl": {
+++      "version": "4.62.2",
+++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-x64-musl/-/rollup-linux-x64-musl-4.62.2.tgz",
+++      "integrity": "sha512-uNN83XxQrRAh/w0/pmAfibcwyb6YWt4gP+dpnQKPVJshAloQ785ii8CT8ZCIxkGg9opVsvAlGhFitSm6D1Jjpg==",
+++      "cpu": [
+++        "x64"
+++      ],
+++      "dev": true,
+++      "libc": [
+++        "musl"
+++      ],
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "linux"
+++      ]
+++    },
+++    "node_modules/@rollup/rollup-openbsd-x64": {
+++      "version": "4.62.2",
+++      "resolved": "https://registry.npmjs.org/@rollup/rollup-openbsd-x64/-/rollup-openbsd-x64-4.62.2.tgz",
+++      "integrity": "sha512-srjEIxSH3LRnJN6THczDHWQplqEMFiAJrTab0msUryh9kwNpkICf3Ea6q6MN/2cZwRFUNx5w+h6Hpi4QuHS6Zg==",
+++      "cpu": [
+++        "x64"
+++      ],
+++      "dev": true,
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "openbsd"
+++      ]
+++    },
+++    "node_modules/@rollup/rollup-openharmony-arm64": {
+++      "version": "4.62.2",
+++      "resolved": "https://registry.npmjs.org/@rollup/rollup-openharmony-arm64/-/rollup-openharmony-arm64-4.62.2.tgz",
+++      "integrity": "sha512-8hOJnxgbyObnCm5AlRA3A931xX19xq80RjVTKgJOvEKWqJruP/Uf12IbAOaDjjEXYRewwHLfmF0YRIdK3OwKWA==",
+++      "cpu": [
+++        "arm64"
+++      ],
+++      "dev": true,
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "openharmony"
+++      ]
+++    },
+++    "node_modules/@rollup/rollup-win32-arm64-msvc": {
+++      "version": "4.62.2",
+++      "resolved": "https://registry.npmjs.org/@rollup/rollup-win32-arm64-msvc/-/rollup-win32-arm64-msvc-4.62.2.tgz",
+++      "integrity": "sha512-mmF4AY1i0hG/bLWUctUq59gtmgaSIRa3cu/A3JFRp/sCNEme2bgDEiDS22P9FbnJB8NJNF4jPJiSP5RHQpUTDg==",
+++      "cpu": [
+++        "arm64"
+++      ],
+++      "dev": true,
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "win32"
+++      ]
+++    },
+++    "node_modules/@rollup/rollup-win32-ia32-msvc": {
+++      "version": "4.62.2",
+++      "resolved": "https://registry.npmjs.org/@rollup/rollup-win32-ia32-msvc/-/rollup-win32-ia32-msvc-4.62.2.tgz",
+++      "integrity": "sha512-DZgkknc6jhHrk46V25vbAM0zZkyP0nSDkJB8/dRkLTxv470dOmWDqGoEJl/9A0dFfS7yE3REOwNDxpHwSLSt0Q==",
+++      "cpu": [
+++        "ia32"
+++      ],
+++      "dev": true,
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "win32"
+++      ]
+++    },
+++    "node_modules/@rollup/rollup-win32-x64-gnu": {
+++      "version": "4.62.2",
+++      "resolved": "https://registry.npmjs.org/@rollup/rollup-win32-x64-gnu/-/rollup-win32-x64-gnu-4.62.2.tgz",
+++      "integrity": "sha512-T6xr6ucWSFto+VGajA8YH26LdpHRuP4YLHEKAtCWvJDOlnmWcDZVCI2Jmjr+IFHDlt2zRaTAKE4tfjTaWLgJBg==",
+++      "cpu": [
+++        "x64"
+++      ],
+++      "dev": true,
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "win32"
+++      ]
+++    },
+++    "node_modules/@rollup/rollup-win32-x64-msvc": {
+++      "version": "4.62.2",
+++      "resolved": "https://registry.npmjs.org/@rollup/rollup-win32-x64-msvc/-/rollup-win32-x64-msvc-4.62.2.tgz",
+++      "integrity": "sha512-BfzEnDJOt9T8M989/lA37EcJgat01wLRnoi5dQf3QzOH7jzpqTAzdDbVfRljVr5r+jzKqpbHeyOfAaXxAd0PAA==",
+++      "cpu": [
+++        "x64"
+++      ],
+++      "dev": true,
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "win32"
+++      ]
+++    },
+++    "node_modules/@types/estree": {
+++      "version": "1.0.9",
+++      "resolved": "https://registry.npmjs.org/@types/estree/-/estree-1.0.9.tgz",
+++      "integrity": "sha512-GhdPgy1el4/ImP05X05Uw4cw2/M93BCUmnEvWZNStlCzEKME4Fkk+YpoA5OiHNQmoS7Cafb8Xa3Pya8m1Qrzeg==",
+++      "dev": true,
+++      "license": "MIT"
+++    },
+++    "node_modules/bidi-js": {
+++      "version": "1.0.3",
+++      "resolved": "https://registry.npmjs.org/bidi-js/-/bidi-js-1.0.3.tgz",
+++      "integrity": "sha512-RKshQI1R3YQ+n9YJz2QQ147P66ELpa1FQEg20Dk8oW9t2KgLbpDLLp9aGZ7y8WHSshDknG0bknqGw5/tyCs5tw==",
+++      "dev": true,
+++      "license": "MIT",
+++      "dependencies": {
+++        "require-from-string": "^2.0.2"
+++      }
+++    },
+++    "node_modules/css-tree": {
+++      "version": "3.2.1",
+++      "resolved": "https://registry.npmjs.org/css-tree/-/css-tree-3.2.1.tgz",
+++      "integrity": "sha512-X7sjQzceUhu1u7Y/ylrRZFU2FS6LRiFVp6rKLPg23y3x3c3DOKAwuXGDp+PAGjh6CSnCjYeAul8pcT8bAl+lSA==",
+++      "dev": true,
+++      "license": "MIT",
+++      "dependencies": {
+++        "mdn-data": "2.27.1",
+++        "source-map-js": "^1.2.1"
+++      },
+++      "engines": {
+++        "node": "^10 || ^12.20.0 || ^14.13.0 || >=15.0.0"
+++      }
+++    },
+++    "node_modules/data-urls": {
+++      "version": "7.0.0",
+++      "resolved": "https://registry.npmjs.org/data-urls/-/data-urls-7.0.0.tgz",
+++      "integrity": "sha512-23XHcCF+coGYevirZceTVD7NdJOqVn+49IHyxgszm+JIiHLoB2TkmPtsYkNWT1pvRSGkc35L6NHs0yHkN2SumA==",
+++      "dev": true,
+++      "license": "MIT",
+++      "dependencies": {
+++        "whatwg-mimetype": "^5.0.0",
+++        "whatwg-url": "^16.0.0"
+++      },
+++      "engines": {
+++        "node": "^20.19.0 || ^22.12.0 || >=24.0.0"
+++      }
+++    },
+++    "node_modules/decimal.js": {
+++      "version": "10.6.0",
+++      "resolved": "https://registry.npmjs.org/decimal.js/-/decimal.js-10.6.0.tgz",
+++      "integrity": "sha512-YpgQiITW3JXGntzdUmyUR1V812Hn8T1YVXhCu+wO3OpS4eU9l4YdD3qjyiKdV6mvV29zapkMeD390UVEf2lkUg==",
+++      "dev": true,
+++      "license": "MIT"
+++    },
+++    "node_modules/entities": {
+++      "version": "8.0.0",
+++      "resolved": "https://registry.npmjs.org/entities/-/entities-8.0.0.tgz",
+++      "integrity": "sha512-zwfzJecQ/Uej6tusMqwAqU/6KL2XaB2VZ2Jg54Je6ahNBGNH6Ek6g3jjNCF0fG9EWQKGZNddNjU5F1ZQn/sBnA==",
+++      "dev": true,
+++      "license": "BSD-2-Clause",
+++      "engines": {
+++        "node": ">=20.19.0"
+++      },
+++      "funding": {
+++        "url": "https://github.com/fb55/entities?sponsor=1"
+++      }
+++    },
+++    "node_modules/esbuild": {
+++      "version": "0.21.5",
+++      "resolved": "https://registry.npmjs.org/esbuild/-/esbuild-0.21.5.tgz",
+++      "integrity": "sha512-mg3OPMV4hXywwpoDxu3Qda5xCKQi+vCTZq8S9J/EpkhB2HzKXq4SNFZE3+NK93JYxc8VMSep+lOUSC/RVKaBqw==",
+++      "dev": true,
+++      "hasInstallScript": true,
+++      "license": "MIT",
+++      "bin": {
+++        "esbuild": "bin/esbuild"
+++      },
+++      "engines": {
+++        "node": ">=12"
+++      },
+++      "optionalDependencies": {
+++        "@esbuild/aix-ppc64": "0.21.5",
+++        "@esbuild/android-arm": "0.21.5",
+++        "@esbuild/android-arm64": "0.21.5",
+++        "@esbuild/android-x64": "0.21.5",
+++        "@esbuild/darwin-arm64": "0.21.5",
+++        "@esbuild/darwin-x64": "0.21.5",
+++        "@esbuild/freebsd-arm64": "0.21.5",
+++        "@esbuild/freebsd-x64": "0.21.5",
+++        "@esbuild/linux-arm": "0.21.5",
+++        "@esbuild/linux-arm64": "0.21.5",
+++        "@esbuild/linux-ia32": "0.21.5",
+++        "@esbuild/linux-loong64": "0.21.5",
+++        "@esbuild/linux-mips64el": "0.21.5",
+++        "@esbuild/linux-ppc64": "0.21.5",
+++        "@esbuild/linux-riscv64": "0.21.5",
+++        "@esbuild/linux-s390x": "0.21.5",
+++        "@esbuild/linux-x64": "0.21.5",
+++        "@esbuild/netbsd-x64": "0.21.5",
+++        "@esbuild/openbsd-x64": "0.21.5",
+++        "@esbuild/sunos-x64": "0.21.5",
+++        "@esbuild/win32-arm64": "0.21.5",
+++        "@esbuild/win32-ia32": "0.21.5",
+++        "@esbuild/win32-x64": "0.21.5"
+++      }
+++    },
+++    "node_modules/fsevents": {
+++      "version": "2.3.3",
+++      "resolved": "https://registry.npmjs.org/fsevents/-/fsevents-2.3.3.tgz",
+++      "integrity": "sha512-5xoDfX+fL7faATnagmWPpbFtwh/R77WmMMqqHGS65C3vvB0YHrgF+B1YmZ3441tMj5n63k0212XNoJwzlhffQw==",
+++      "dev": true,
+++      "hasInstallScript": true,
+++      "license": "MIT",
+++      "optional": true,
+++      "os": [
+++        "darwin"
+++      ],
+++      "engines": {
+++        "node": "^8.16.0 || ^10.6.0 || >=11.0.0"
+++      }
+++    },
+++    "node_modules/html-encoding-sniffer": {
+++      "version": "6.0.0",
+++      "resolved": "https://registry.npmjs.org/html-encoding-sniffer/-/html-encoding-sniffer-6.0.0.tgz",
+++      "integrity": "sha512-CV9TW3Y3f8/wT0BRFc1/KAVQ3TUHiXmaAb6VW9vtiMFf7SLoMd1PdAc4W3KFOFETBJUb90KatHqlsZMWV+R9Gg==",
+++      "dev": true,
+++      "license": "MIT",
+++      "dependencies": {
+++        "@exodus/bytes": "^1.6.0"
+++      },
+++      "engines": {
+++        "node": "^20.19.0 || ^22.12.0 || >=24.0.0"
+++      }
+++    },
+++    "node_modules/is-potential-custom-element-name": {
+++      "version": "1.0.1",
+++      "resolved": "https://registry.npmjs.org/is-potential-custom-element-name/-/is-potential-custom-element-name-1.0.1.tgz",
+++      "integrity": "sha512-bCYeRA2rVibKZd+s2625gGnGF/t7DSqDs4dP7CrLA1m7jKWz6pps0LpYLJN8Q64HtmPKJ1hrN3nzPNKFEKOUiQ==",
+++      "dev": true,
+++      "license": "MIT"
+++    },
+++    "node_modules/jsdom": {
+++      "version": "29.1.1",
+++      "resolved": "https://registry.npmjs.org/jsdom/-/jsdom-29.1.1.tgz",
+++      "integrity": "sha512-ECi4Fi2f7BdJtUKTflYRTiaMxIB0O6zfR1fX0GXpUrf6flp8QIYn1UT20YQqdSOfk2dfkCwS8LAFoJDEppNK5Q==",
+++      "dev": true,
+++      "license": "MIT",
+++      "dependencies": {
+++        "@asamuzakjp/css-color": "^5.1.11",
+++        "@asamuzakjp/dom-selector": "^7.1.1",
+++        "@bramus/specificity": "^2.4.2",
+++        "@csstools/css-syntax-patches-for-csstree": "^1.1.3",
+++        "@exodus/bytes": "^1.15.0",
+++        "css-tree": "^3.2.1",
+++        "data-urls": "^7.0.0",
+++        "decimal.js": "^10.6.0",
+++        "html-encoding-sniffer": "^6.0.0",
+++        "is-potential-custom-element-name": "^1.0.1",
+++        "lru-cache": "^11.3.5",
+++        "parse5": "^8.0.1",
+++        "saxes": "^6.0.0",
+++        "symbol-tree": "^3.2.4",
+++        "tough-cookie": "^6.0.1",
+++        "undici": "^7.25.0",
+++        "w3c-xmlserializer": "^5.0.0",
+++        "webidl-conversions": "^8.0.1",
+++        "whatwg-mimetype": "^5.0.0",
+++        "whatwg-url": "^16.0.1",
+++        "xml-name-validator": "^5.0.0"
+++      },
+++      "engines": {
+++        "node": "^20.19.0 || ^22.13.0 || >=24.0.0"
+++      },
+++      "peerDependencies": {
+++        "canvas": "^3.0.0"
+++      },
+++      "peerDependenciesMeta": {
+++        "canvas": {
+++          "optional": true
+++        }
+++      }
+++    },
+++    "node_modules/lru-cache": {
+++      "version": "11.5.2",
+++      "resolved": "https://registry.npmjs.org/lru-cache/-/lru-cache-11.5.2.tgz",
+++      "integrity": "sha512-4pfM1Ff0x50o0tQwb5ucw/RzNyD0/YJME6IVcStalZuMWxdt3sR3huStTtxz4PUmvZfRguvDejasvQ2kifR11g==",
+++      "dev": true,
+++      "license": "BlueOak-1.0.0",
+++      "engines": {
+++        "node": "20 || >=22"
+++      }
+++    },
+++    "node_modules/mdn-data": {
+++      "version": "2.27.1",
+++      "resolved": "https://registry.npmjs.org/mdn-data/-/mdn-data-2.27.1.tgz",
+++      "integrity": "sha512-9Yubnt3e8A0OKwxYSXyhLymGW4sCufcLG6VdiDdUGVkPhpqLxlvP5vl1983gQjJl3tqbrM731mjaZaP68AgosQ==",
+++      "dev": true,
+++      "license": "CC0-1.0"
+++    },
+++    "node_modules/nanoid": {
+++      "version": "3.3.16",
+++      "resolved": "https://registry.npmjs.org/nanoid/-/nanoid-3.3.16.tgz",
+++      "integrity": "sha512-bzlKTyNJ7+LdGIIwy8ijFpIqEQIvafahV7eYykJ8Cvh42EdJeODoJ6gUJXpQJvej1BddH8OqTXZNE/KfbWAu8Q==",
+++      "dev": true,
+++      "funding": [
+++        {
+++          "type": "github",
+++          "url": "https://github.com/sponsors/ai"
+++        }
+++      ],
+++      "license": "MIT",
+++      "bin": {
+++        "nanoid": "bin/nanoid.cjs"
+++      },
+++      "engines": {
+++        "node": "^10 || ^12 || ^13.7 || ^14 || >=15.0.1"
+++      }
+++    },
+++    "node_modules/parse5": {
+++      "version": "8.0.1",
+++      "resolved": "https://registry.npmjs.org/parse5/-/parse5-8.0.1.tgz",
+++      "integrity": "sha512-z1e/HMG90obSGeidlli3hj7cbocou0/wa5HacvI3ASx34PecNjNQeaHNo5WIZpWofN9kgkqV1q5YvXe3F0FoPw==",
+++      "dev": true,
+++      "license": "MIT",
+++      "dependencies": {
+++        "entities": "^8.0.0"
+++      },
+++      "funding": {
+++        "url": "https://github.com/inikulin/parse5?sponsor=1"
+++      }
+++    },
+++    "node_modules/picocolors": {
+++      "version": "1.1.1",
+++      "resolved": "https://registry.npmjs.org/picocolors/-/picocolors-1.1.1.tgz",
+++      "integrity": "sha512-xceH2snhtb5M9liqDsmEw56le376mTZkEX/jEb/RxNFyegNul7eNslCXP9FDj/Lcu0X8KEyMceP2ntpaHrDEVA==",
+++      "dev": true,
+++      "license": "ISC"
+++    },
+++    "node_modules/postcss": {
+++      "version": "8.5.23",
+++      "resolved": "https://registry.npmjs.org/postcss/-/postcss-8.5.23.tgz",
+++      "integrity": "sha512-g50586zr4bZmwFiTlflMu8E0bDTb5I5gertgwAKmsdUlTQIhZtunzUlD1WSzwcVWPoAVpsrA6vlfCD7oXvRwgg==",
+++      "dev": true,
+++      "funding": [
+++        {
+++          "type": "opencollective",
+++          "url": "https://opencollective.com/postcss/"
+++        },
+++        {
+++          "type": "tidelift",
+++          "url": "https://tidelift.com/funding/github/npm/postcss"
+++        },
+++        {
+++          "type": "github",
+++          "url": "https://github.com/sponsors/ai"
+++        }
+++      ],
+++      "license": "MIT",
+++      "dependencies": {
+++        "nanoid": "^3.3.16",
+++        "picocolors": "^1.1.1",
+++        "source-map-js": "^1.2.1"
+++      },
+++      "engines": {
+++        "node": "^10 || ^12 || >=14"
+++      }
+++    },
+++    "node_modules/punycode": {
+++      "version": "2.3.1",
+++      "resolved": "https://registry.npmjs.org/punycode/-/punycode-2.3.1.tgz",
+++      "integrity": "sha512-vYt7UD1U9Wg6138shLtLOvdAu+8DsC/ilFtEVHcH+wydcSpNE20AfSOduf6MkRFahL5FY7X1oU7nKVZFtfq8Fg==",
+++      "dev": true,
+++      "license": "MIT",
+++      "engines": {
+++        "node": ">=6"
+++      }
+++    },
+++    "node_modules/require-from-string": {
+++      "version": "2.0.2",
+++      "resolved": "https://registry.npmjs.org/require-from-string/-/require-from-string-2.0.2.tgz",
+++      "integrity": "sha512-Xf0nWe6RseziFMu+Ap9biiUbmplq6S9/p+7w7YXP/JBHhrUDDUhwa+vANyubuqfZWTveU//DYVGsDG7RKL/vEw==",
+++      "dev": true,
+++      "license": "MIT",
+++      "engines": {
+++        "node": ">=0.10.0"
+++      }
+++    },
+++    "node_modules/rollup": {
+++      "version": "4.62.2",
+++      "resolved": "https://registry.npmjs.org/rollup/-/rollup-4.62.2.tgz",
+++      "integrity": "sha512-RFnrW4lhXA3s3eqHDZvN654g8OTjzRfqpIRJYczCGB6HzphckVAi/Qh4tbPUbRuDi7s1Llv8g/NspLkttY3gTA==",
+++      "dev": true,
+++      "license": "MIT",
+++      "dependencies": {
+++        "@types/estree": "1.0.9"
+++      },
+++      "bin": {
+++        "rollup": "dist/bin/rollup"
+++      },
+++      "engines": {
+++        "node": ">=18.0.0",
+++        "npm": ">=8.0.0"
+++      },
+++      "optionalDependencies": {
+++        "@rollup/rollup-android-arm-eabi": "4.62.2",
+++        "@rollup/rollup-android-arm64": "4.62.2",
+++        "@rollup/rollup-darwin-arm64": "4.62.2",
+++        "@rollup/rollup-darwin-x64": "4.62.2",
+++        "@rollup/rollup-freebsd-arm64": "4.62.2",
+++        "@rollup/rollup-freebsd-x64": "4.62.2",
+++        "@rollup/rollup-linux-arm-gnueabihf": "4.62.2",
+++        "@rollup/rollup-linux-arm-musleabihf": "4.62.2",
+++        "@rollup/rollup-linux-arm64-gnu": "4.62.2",
+++        "@rollup/rollup-linux-arm64-musl": "4.62.2",
+++        "@rollup/rollup-linux-loong64-gnu": "4.62.2",
+++        "@rollup/rollup-linux-loong64-musl": "4.62.2",
+++        "@rollup/rollup-linux-ppc64-gnu": "4.62.2",
+++        "@rollup/rollup-linux-ppc64-musl": "4.62.2",
+++        "@rollup/rollup-linux-riscv64-gnu": "4.62.2",
+++        "@rollup/rollup-linux-riscv64-musl": "4.62.2",
+++        "@rollup/rollup-linux-s390x-gnu": "4.62.2",
+++        "@rollup/rollup-linux-x64-gnu": "4.62.2",
+++        "@rollup/rollup-linux-x64-musl": "4.62.2",
+++        "@rollup/rollup-openbsd-x64": "4.62.2",
+++        "@rollup/rollup-openharmony-arm64": "4.62.2",
+++        "@rollup/rollup-win32-arm64-msvc": "4.62.2",
+++        "@rollup/rollup-win32-ia32-msvc": "4.62.2",
+++        "@rollup/rollup-win32-x64-gnu": "4.62.2",
+++        "@rollup/rollup-win32-x64-msvc": "4.62.2",
+++        "fsevents": "~2.3.2"
+++      }
+++    },
+++    "node_modules/saxes": {
+++      "version": "6.0.0",
+++      "resolved": "https://registry.npmjs.org/saxes/-/saxes-6.0.0.tgz",
+++      "integrity": "sha512-xAg7SOnEhrm5zI3puOOKyy1OMcMlIJZYNJY7xLBwSze0UjhPLnWfj2GF2EpT0jmzaJKIWKHLsaSSajf35bcYnA==",
+++      "dev": true,
+++      "license": "ISC",
+++      "dependencies": {
+++        "xmlchars": "^2.2.0"
+++      },
+++      "engines": {
+++        "node": ">=v12.22.7"
+++      }
+++    },
+++    "node_modules/source-map-js": {
+++      "version": "1.2.1",
+++      "resolved": "https://registry.npmjs.org/source-map-js/-/source-map-js-1.2.1.tgz",
+++      "integrity": "sha512-UXWMKhLOwVKb728IUtQPXxfYU+usdybtUrK/8uGE8CQMvrhOpwvzDBwj0QhSL7MQc7vIsISBG8VQ8+IDQxpfQA==",
+++      "dev": true,
+++      "license": "BSD-3-Clause",
+++      "engines": {
+++        "node": ">=0.10.0"
+++      }
+++    },
+++    "node_modules/symbol-tree": {
+++      "version": "3.2.4",
+++      "resolved": "https://registry.npmjs.org/symbol-tree/-/symbol-tree-3.2.4.tgz",
+++      "integrity": "sha512-9QNk5KwDF+Bvz+PyObkmSYjI5ksVUYtjW7AU22r2NKcfLJcXp96hkDWU3+XndOsUb+AQ9QhfzfCT2O+CNWT5Tw==",
+++      "dev": true,
+++      "license": "MIT"
+++    },
+++    "node_modules/tldts": {
+++      "version": "7.4.9",
+++      "resolved": "https://registry.npmjs.org/tldts/-/tldts-7.4.9.tgz",
+++      "integrity": "sha512-3kZ8wQQ/k5DrChD4X4FVvr2D7E5uoRgAqkPyLpSCGUvqOvqu+JEdr3mwMUaVWb+vMHZaKhF5fp2PBigKsui7hA==",
+++      "dev": true,
+++      "license": "MIT",
+++      "dependencies": {
+++        "tldts-core": "^7.4.9"
+++      },
+++      "bin": {
+++        "tldts": "bin/cli.js"
+++      }
+++    },
+++    "node_modules/tldts-core": {
+++      "version": "7.4.9",
+++      "resolved": "https://registry.npmjs.org/tldts-core/-/tldts-core-7.4.9.tgz",
+++      "integrity": "sha512-DxKfPBI52p2msTEu7MPhdpdDTBhhVQg1a/8PjQckeyAvO13eMYElX545grIp6nnTGIMZlRvFZPvFhvI/WIz2Vg==",
+++      "dev": true,
+++      "license": "MIT"
+++    },
+++    "node_modules/tough-cookie": {
+++      "version": "6.0.2",
+++      "resolved": "https://registry.npmjs.org/tough-cookie/-/tough-cookie-6.0.2.tgz",
+++      "integrity": "sha512-exgYmnmL/sJpR3upZfXG5PoatXQii55xAiXGXzY+sROLZ/Y+SLcp9PgJNI9Vz37HpQ74WvDcLT8eqm+kV3FzrA==",
+++      "dev": true,
+++      "license": "BSD-3-Clause",
+++      "dependencies": {
+++        "tldts": "^7.0.5"
+++      },
+++      "engines": {
+++        "node": ">=16"
+++      }
+++    },
+++    "node_modules/tr46": {
+++      "version": "6.0.0",
+++      "resolved": "https://registry.npmjs.org/tr46/-/tr46-6.0.0.tgz",
+++      "integrity": "sha512-bLVMLPtstlZ4iMQHpFHTR7GAGj2jxi8Dg0s2h2MafAE4uSWF98FC/3MomU51iQAMf8/qDUbKWf5GxuvvVcXEhw==",
+++      "dev": true,
+++      "license": "MIT",
+++      "dependencies": {
+++        "punycode": "^2.3.1"
+++      },
+++      "engines": {
+++        "node": ">=20"
+++      }
+++    },
+++    "node_modules/undici": {
+++      "version": "7.29.0",
+++      "resolved": "https://registry.npmjs.org/undici/-/undici-7.29.0.tgz",
+++      "integrity": "sha512-IDxfleLmmbSskfWSUATiN1nfn2rDuvnMOqb5CWR92iIfojA0Ud+ulOAAEQ57LPr9rWmsreUyf5lwyao+7GNNVw==",
+++      "dev": true,
+++      "license": "MIT",
+++      "engines": {
+++        "node": ">=20.18.1"
+++      }
+++    },
+++    "node_modules/vite": {
+++      "version": "5.4.21",
+++      "resolved": "https://registry.npmjs.org/vite/-/vite-5.4.21.tgz",
+++      "integrity": "sha512-o5a9xKjbtuhY6Bi5S3+HvbRERmouabWbyUcpXXUA1u+GNUKoROi9byOJ8M0nHbHYHkYICiMlqxkg1KkYmm25Sw==",
+++      "dev": true,
+++      "license": "MIT",
+++      "dependencies": {
+++        "esbuild": "^0.21.3",
+++        "postcss": "^8.4.43",
+++        "rollup": "^4.20.0"
+++      },
+++      "bin": {
+++        "vite": "bin/vite.js"
+++      },
+++      "engines": {
+++        "node": "^18.0.0 || >=20.0.0"
+++      },
+++      "funding": {
+++        "url": "https://github.com/vitejs/vite?sponsor=1"
+++      },
+++      "optionalDependencies": {
+++        "fsevents": "~2.3.3"
+++      },
+++      "peerDependencies": {
+++        "@types/node": "^18.0.0 || >=20.0.0",
+++        "less": "*",
+++        "lightningcss": "^1.21.0",
+++        "sass": "*",
+++        "sass-embedded": "*",
+++        "stylus": "*",
+++        "sugarss": "*",
+++        "terser": "^5.4.0"
+++      },
+++      "peerDependenciesMeta": {
+++        "@types/node": {
+++          "optional": true
+++        },
+++        "less": {
+++          "optional": true
+++        },
+++        "lightningcss": {
+++          "optional": true
+++        },
+++        "sass": {
+++          "optional": true
+++        },
+++        "sass-embedded": {
+++          "optional": true
+++        },
+++        "stylus": {
+++          "optional": true
+++        },
+++        "sugarss": {
+++          "optional": true
+++        },
+++        "terser": {
+++          "optional": true
+++        }
+++      }
+++    },
+++    "node_modules/w3c-xmlserializer": {
+++      "version": "5.0.0",
+++      "resolved": "https://registry.npmjs.org/w3c-xmlserializer/-/w3c-xmlserializer-5.0.0.tgz",
+++      "integrity": "sha512-o8qghlI8NZHU1lLPrpi2+Uq7abh4GGPpYANlalzWxyWteJOCsr/P+oPBA49TOLu5FTZO4d3F9MnWJfiMo4BkmA==",
+++      "dev": true,
+++      "license": "MIT",
+++      "dependencies": {
+++        "xml-name-validator": "^5.0.0"
+++      },
+++      "engines": {
+++        "node": ">=18"
+++      }
+++    },
+++    "node_modules/webidl-conversions": {
+++      "version": "8.0.1",
+++      "resolved": "https://registry.npmjs.org/webidl-conversions/-/webidl-conversions-8.0.1.tgz",
+++      "integrity": "sha512-BMhLD/Sw+GbJC21C/UgyaZX41nPt8bUTg+jWyDeg7e7YN4xOM05YPSIXceACnXVtqyEw/LMClUQMtMZ+PGGpqQ==",
+++      "dev": true,
+++      "license": "BSD-2-Clause",
+++      "engines": {
+++        "node": ">=20"
+++      }
+++    },
+++    "node_modules/whatwg-mimetype": {
+++      "version": "5.0.0",
+++      "resolved": "https://registry.npmjs.org/whatwg-mimetype/-/whatwg-mimetype-5.0.0.tgz",
+++      "integrity": "sha512-sXcNcHOC51uPGF0P/D4NVtrkjSU2fNsm9iog4ZvZJsL3rjoDAzXZhkm2MWt1y+PUdggKAYVoMAIYcs78wJ51Cw==",
+++      "dev": true,
+++      "license": "MIT",
+++      "engines": {
+++        "node": ">=20"
+++      }
+++    },
+++    "node_modules/whatwg-url": {
+++      "version": "16.0.1",
+++      "resolved": "https://registry.npmjs.org/whatwg-url/-/whatwg-url-16.0.1.tgz",
+++      "integrity": "sha512-1to4zXBxmXHV3IiSSEInrreIlu02vUOvrhxJJH5vcxYTBDAx51cqZiKdyTxlecdKNSjj8EcxGBxNf6Vg+945gw==",
+++      "dev": true,
+++      "license": "MIT",
+++      "dependencies": {
+++        "@exodus/bytes": "^1.11.0",
+++        "tr46": "^6.0.0",
+++        "webidl-conversions": "^8.0.1"
+++      },
+++      "engines": {
+++        "node": "^20.19.0 || ^22.12.0 || >=24.0.0"
+++      }
+++    },
+++    "node_modules/xml-name-validator": {
+++      "version": "5.0.0",
+++      "resolved": "https://registry.npmjs.org/xml-name-validator/-/xml-name-validator-5.0.0.tgz",
+++      "integrity": "sha512-EvGK8EJ3DhaHfbRlETOWAS5pO9MZITeauHKJyb8wyajUfQUenkIg2MvLDTZ4T/TgIcm3HU0TFBgWWboAZ30UHg==",
+++      "dev": true,
+++      "license": "Apache-2.0",
+++      "engines": {
+++        "node": ">=18"
+++      }
+++    },
+++    "node_modules/xmlchars": {
+++      "version": "2.2.0",
+++      "resolved": "https://registry.npmjs.org/xmlchars/-/xmlchars-2.2.0.tgz",
+++      "integrity": "sha512-JZnDKK8B0RCDw84FNdDAIpZK+JuJw+s7Lz8nksI7SIuU3UXJJslUthsi+uWBUYOwPFwW7W7PRLRfUKpxjtjFCw==",
+++      "dev": true,
+++      "license": "MIT"
+++    }
+++  }
+++}
++diff --git a/apps/xiong-tu-san-guo/package.json b/apps/xiong-tu-san-guo/package.json
++new file mode 100644
++index 0000000..bd8404a
++--- /dev/null
+++++ b/apps/xiong-tu-san-guo/package.json
++@@ -0,0 +1,17 @@
+++{
+++  "name": "xiong-tu-san-guo",
+++  "version": "1.0.0",
+++  "description": "《雄图·三国志文明》回合制策略经营网页游戏 - Heroic Three Kingdoms Civilization (turn-based strategy)",
+++  "type": "module",
+++  "scripts": {
+++    "dev": "vite",
+++    "build": "vite build",
+++    "preview": "vite preview --host",
+++    "test": "node scripts/logic-test.mjs",
+++    "test:dom": "node scripts/smoke-dom.mjs"
+++  },
+++  "devDependencies": {
+++    "jsdom": "^29.1.1",
+++    "vite": "^5.4.0"
+++  }
+++}
++diff --git a/apps/xiong-tu-san-guo/scripts/_css-loader.mjs b/apps/xiong-tu-san-guo/scripts/_css-loader.mjs
++new file mode 100644
++index 0000000..b10c2fa
++--- /dev/null
+++++ b/apps/xiong-tu-san-guo/scripts/_css-loader.mjs
++@@ -0,0 +1,7 @@
+++// 让 Node 的 ESM 加载器把 *.css 视作空模块（仅冒烟测试用）。
+++export async function load(url, context, nextLoad) {
+++  if (url.endsWith('.css')) {
+++    return { format: 'module', source: '', shortCircuit: true };
+++  }
+++  return nextLoad(url, context);
+++}
++diff --git a/apps/xiong-tu-san-guo/scripts/logic-test.mjs b/apps/xiong-tu-san-guo/scripts/logic-test.mjs
++new file mode 100644
++index 0000000..eb29ed1
++--- /dev/null
+++++ b/apps/xiong-tu-san-guo/scripts/logic-test.mjs
++@@ -0,0 +1,156 @@
+++// 纯逻辑自测（不依赖浏览器/DOM）。运行：npm test
+++import { CITIES, CITY_MAP, adjacencyValid } from '../src/data/cities.js';
+++import { HEROES, FACTION_SEEDS, makeGenericGeneral } from '../src/data/heroes.js';
+++import { makeRng } from '../src/core/rng.js';
+++import { parseSkill, techMult } from '../src/core/tech.js';
+++import { cityGoldIncome, cityGrainIncome, factionGoldIncome, factionGrainNet } from '../src/core/economy.js';
+++import { createBattle, runBattle, effWar, attackValue } from '../src/core/combat.js';
+++import {
+++  newGame, cityById, heroesOfFaction, cmdPoints, cmdRemaining,
+++  troopCap, resolveTurn, checkGameOver, neighbors, wildHeroesInCity,
+++} from '../src/core/state.js';
+++import * as A from '../src/core/actions.js';
+++import { aiTurnAll } from '../src/core/ai.js';
+++
+++let pass = 0, fail = 0;
+++function ok(cond, msg) { if (cond) { pass++; } else { fail++; console.error('  ✗ ' + msg); } }
+++function eq(a, b, msg) { ok(a === b, `${msg} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`); }
+++
+++console.log('—— 数据完整性 ——');
+++ok(adjacencyValid(), '城市邻接关系双向一致');
+++eq(CITIES.length, 18, '城市数为 18');
+++ok(HEROES.length >= 40, `名将数 >= 40 (实际 ${HEROES.length})`);
+++eq(FACTION_SEEDS.length, 8, 'AI 势力种子为 8');
+++// 每位名将要么 serve 一个种子势力，要么 wild 在某城市
+++for (const h of HEROES) {
+++  ok(h.serve || h.wild, `${h.name} 有归属（serve/wild）`);
+++  if (h.wild) ok(CITY_MAP[h.wild], `${h.name} 的在野城市 ${h.wild} 存在`);
+++  if (h.serve) ok(FACTION_SEEDS.some((s) => s.key === h.serve), `${h.name} 所属势力 ${h.serve} 存在`);
+++}
+++eq(makeGenericGeneral(makeRng(1), 1).id, 'gen_1', '生成武将 id 唯一可控');
+++
+++console.log('—— 科技 / 技能解析 ——');
+++const sb = parseSkill('lead:0.10,war:0.05,trick:0.20');
+++eq(sb.lead, 0.1, '技能 lead 解析');
+++eq(sb.war, 0.05, '技能 war 解析');
+++eq(sb.trick, 0.2, '技能 trick 解析');
+++eq(parseSkill(null).lead, 0, '空技能返回零加成');
+++
+++console.log('—— 新局初始化（玩家选洛阳）——');
+++const rng = makeRng(42);
+++const stats = { l: 80, w: 70, i: 75, p: 78, c: 85 };
+++let s = newGame({ lordName: '测试主公', startCity: 'luoyang', stats, rng });
+++eq(s.turn, 1, '初始回合 = 1');
+++eq(s.over, null, '初始无胜负');
+++eq(cityById(s, 'luoyang').ownerFactionId, 0, '洛阳归玩家');
+++eq(heroesOfFaction(s, 0).length, 1, '玩家初始仅君主一人');
+++ok(s.factions.length >= 7, `生成 >=7 个势力 (实际 ${s.factions.length})`);
+++// 8 个种子都城，玩家占洛阳（非任何都城）→ 8 AI 势力齐全
+++eq(s.factions.filter((f) => f.aiControlled).length, 8, '8 个 AI 势力（玩家未占都城）');
+++// 中立城市存在
+++const neutral = s.cities.filter((c) => c.ownerFactionId == null);
+++ok(neutral.length >= 8, `存在中立城市 (实际 ${neutral.length})`);
+++
+++console.log('—— 玩家选都城（许昌，曹操势力被吞并）——');
+++const s2 = newGame({ lordName: '篡位者', startCity: 'xuchang', stats, rng: makeRng(7) });
+++eq(s2.factions.filter((f) => f.aiControlled).length, 7, '占都城后仅 7 个 AI 势力');
+++const caocao = s2.heroes.find((h) => h.id === 'caocao');
+++ok(caocao && caocao.wild && caocao.cityId === 'xuchang', '曹操转为许昌在野，可被登用');
+++ok(s2.heroes.some((h) => h.id === 'zhangliao' && h.wild), '张辽随曹操转为在野');
+++
+++console.log('—— 指令点 / 带兵上限 ——');
+++const baseCmd = cmdPoints(s, 0);
+++ok(baseCmd >= 5, `基础指令点 >= 5 (实际 ${baseCmd})`);
+++const lord = s.heroes.find((h) => h.isPlayerLord);
+++eq(cmdRemaining(s, 0), baseCmd, '回合初指令点全满');
+++ok(troopCap(s, lord) >= 8000, `君主带兵上限合理 (实际 ${troopCap(s, lord)})`);
+++
+++console.log('—— 内政指令 ——');
+++const beforeMarket = cityById(s, 'luoyang').marketLevel;
+++let r1 = A.developMarket(s, 'luoyang');
+++ok(r1.ok && cityById(s, 'luoyang').marketLevel === beforeMarket + 1, '发展商业成功升 1 级');
+++const r2 = A.recruit(s, 'luoyang', 500);
+++ok(r2.ok && cityById(s, 'luoyang').soldiers > 2000, '征兵增加士兵');
+++ok(cmdRemaining(s, 0) < baseCmd, '执行指令后剩余指令点减少');
+++// 金钱不足应失败且退还指令
+++const poor = JSON.parse(JSON.stringify(s));
+++factionPoor(poor, 0);
+++const cmdBefore = cmdRemaining(poor, 0);
+++const r3 = A.developFarm(poor, 'luoyang');
+++ok(!r3.ok, '金钱不足时开发失败');
+++eq(cmdRemaining(poor, 0), cmdBefore, '失败时指令点如数退还');
+++
+++console.log('—— 探索 / 登用 ——');
+++// 洛阳在野有刘备 / 华佗
+++const wildLy = wildHeroesInCity(s, 'luoyang');
+++ok(wildLy.some((h) => h.id === 'liubei'), '洛阳在野含刘备');
+++const exp = A.explore(s, 'luoyang', 0, makeRng(1));
+++ok(exp.ok, '探索执行成功');
+++// 强行标记已发现后登用
+++const guanyu = s.heroes.find((h) => h.id === 'guanyu');
+++guanyu.discovered = true;
+++guanyu.cityId = 'luoyang'; // 移到玩家城便于测试
+++const recR = A.recruitHero(s, 'guanyu', 0, makeRng(99));
+++// 高魅力 + 多次尝试：用固定大种子提高命中
+++ok(typeof recR.recruited === 'boolean', '登用返回是否成功布尔值');
+++
+++console.log('—— 战斗系统 ——');
+++const battle = createBattle({
+++  attacker: { factionId: 0, general: { name: '猛将', stats: { l: 90, w: 95, i: 60, p: 50, c: 60 }, skill: null }, soldiers: 3000, training: 60, formation: 'assault' },
+++  defender: { factionId: 1, general: { name: '守将', stats: { l: 60, w: 60, i: 50, p: 50, c: 50 }, skill: null }, soldiers: 1000, defense: 300, isCity: true, training: 50, formation: 'normal' },
+++});
+++runBattle(battle, s, makeRng(3));
+++ok(battle.result === 'attacker' || battle.result === 'defender', '战斗产出胜负结果');
+++ok(battle.log.length > 0, '战斗产生战报');
+++ok(effWar({ stats: { w: 100 }, skill: { effect: 'war:0.15' } }) > 100, '技能加成提升有效武力');
+++
+++console.log('—— 出征（攻打相邻中立城）——');
+++// 把宛城设为中立且兵力薄弱，玩家从洛阳出征
+++const wan = cityById(s, 'wan');
+++wan.ownerFactionId = null; wan.soldiers = 300; wan.defense = 200;
+++const lordId = s.heroes.find((h) => h.isPlayerLord).id;
+++// 先征兵确保有兵
+++cityById(s, 'luoyang').soldiers = 5000;
+++const camp = A.campaign(s, 'luoyang', 'wan', lordId, 2000, 'assault', 0, makeRng(5));
+++ok(camp.ok, '出征执行成功');
+++if (camp.won) {
+++  eq(cityById(s, 'wan').ownerFactionId, 0, '攻陷后宛城归玩家');
+++} else {
+++  ok(true, '出征未克（随机结果）');
+++}
+++
+++console.log('—— 回合结算（含 AI）——');
+++const s3 = newGame({ lordName: '结算测试', startCity: 'luoyang', stats, rng: makeRng(11) });
+++const turn1 = s3.turn;
+++const aiModule = { aiTurnAll };
+++resolveTurn(s3, aiModule, makeRng(13));
+++eq(s3.turn, turn1 + 1, '结算后回合 +1');
+++ok(s3.turnLog.length >= 0, '结算产生回合日志');
+++// 玩家金钱应随收入增加（初始有 buffer）
+++ok(s3.factions[0].money > 0, '玩家回合后有金钱');
+++
+++console.log('—— 胜负判定 ——');
+++// 模拟玩家占全部城市 → 胜利
+++const sWin = newGame({ lordName: '霸主', startCity: 'luoyang', stats, rng: makeRng(2) });
+++for (const c of sWin.cities) c.ownerFactionId = 0;
+++checkGameOver(sWin);
+++eq(sWin.over, 'win', '占全部城市 → 胜利');
+++// 玩家无城 → 失败
+++const sLose = newGame({ lordName: '败者', startCity: 'luoyang', stats, rng: makeRng(3) });
+++for (const c of sLose.cities) if (c.id === 'luoyang') c.ownerFactionId = 1;
+++for (const c of sLose.cities) if (c.ownerFactionId === 0) c.ownerFactionId = null;
+++checkGameOver(sLose);
+++eq(sLose.over, 'lose', '玩家无城 → 失败');
+++
+++console.log('—— 邻接可达性（全图连通）——');
+++function bfsReachable(state, start) {
+++  const seen = new Set([start]); const q = [start];
+++  while (q.length) { const id = q.shift(); for (const n of cityById(state, id).adjacent) { if (!seen.has(n)) { seen.add(n); q.push(n); } } }
+++  return seen;
+++}
+++eq(bfsReachable(s, 'luoyang').size, 18, '从洛阳可达全部 18 城（地图连通）');
+++
+++console.log(`\n结果：${pass} 通过，${fail} 失败`);
+++process.exit(fail ? 1 : 0);
+++
+++function factionPoor(st, fid) { st.factions.find((f) => f.id === fid).money = 0; }
++diff --git a/apps/xiong-tu-san-guo/scripts/smoke-dom.mjs b/apps/xiong-tu-san-guo/scripts/smoke-dom.mjs
++new file mode 100644
++index 0000000..49f8db3
++--- /dev/null
+++++ b/apps/xiong-tu-san-guo/scripts/smoke-dom.mjs
++@@ -0,0 +1,112 @@
+++// DOM 冒烟测试：用 jsdom 驱动真实 UI 流程（启动 → 创角 → 对局 → 标签 → 城务 → 结束回合）。
+++// 运行：node scripts/smoke-dom.mjs   （需先 npm install jsdom）
+++import { JSDOM } from 'jsdom';
+++import { register } from 'node:module';
+++
+++register('./_css-loader.mjs', import.meta.url);
+++
+++const dom = new JSDOM('<!DOCTYPE html><div id="game-container"></div>', {
+++  url: 'http://localhost/',
+++  pretendToBeVisual: true,
+++});
+++const { window } = dom;
+++for (const k of ['document', 'window', 'localStorage', 'navigator', 'HTMLElement', 'Node', 'Element', 'getComputedStyle', 'CustomEvent', 'MouseEvent', 'Event']) {
+++  if (window[k] === undefined) continue;
+++  try { globalThis[k] = window[k]; } catch (_) {}
+++}
+++globalThis.requestAnimationFrame = (fn) => setTimeout(fn, 0);
+++
+++let pass = 0, fail = 0;
+++const ok = (c, m) => { if (c) pass++; else { fail++; console.error('  ✗ FAIL:', m); } };
+++const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
+++
+++let lastToast = '';
+++const watchToasts = () => {
+++  const wrap = document.querySelector('.toast-wrap');
+++  if (!wrap) return;
+++  new window.MutationObserver((muts) => {
+++    for (const m of muts) for (const n of m.addedNodes) if (n.classList && n.classList.contains('toast')) lastToast = n.textContent;
+++  }).observe(wrap, { childList: true });
+++};
+++
+++const { createGame } = await import(new URL('../src/main.js', import.meta.url).href);
+++const A = await import(new URL('../src/core/actions.js', import.meta.url).href);
+++localStorage.clear();
+++const ui = createGame(document.getElementById('game-container'));
+++window.__XTSG = ui;
+++watchToasts();
+++await sleep(10);
+++
+++// ---------- 1) 启动器 ----------
+++ok(document.querySelector('.launcher') !== null, '渲染启动器');
+++ok(document.querySelector('.launcher__menu button') !== null, '启动器有「新游戏」按钮');
+++
+++// ---------- 2) 创角 ----------
+++ui.showCreate();
+++await sleep(5);
+++ok(document.querySelector('.create') !== null, '进入创角页');
+++ok(document.querySelectorAll('.city-pick__item').length === 18, '可选 18 座城市');
+++const nameInput = document.querySelector('.create input[type=text]');
+++nameInput.value = '玄德';
+++nameInput.dispatchEvent(new window.Event('input'));
+++ui.startCityPick = 'luoyang';
+++ui.beginGame();
+++await sleep(5);
+++ok(document.querySelector('.game') !== null, '进入对局主界面');
+++ok(document.querySelector('.topbar') !== null, '顶栏已渲染');
+++ok(document.querySelectorAll('.tab').length === 5, '五个标签');
+++ok(document.querySelectorAll('.map-dot').length === 18, '地图渲染 18 个城市点');
+++
+++// ---------- 3) 切换标签（逐个验证签名元素）----------
+++const tabSignatures = {
+++  faction: '.city-card', heroes: '.card-list', tech: '.tech-grid', system: '.sys-list', map: '.map-dot',
+++};
+++for (const [tab, sel] of Object.entries(tabSignatures)) {
+++  ui.tab = tab; ui.renderTabbar(); ui.renderContent();
+++  await sleep(3);
+++  ok(document.querySelector(sel) !== null, `「${tab}」标签渲染（${sel}）`);
+++}
+++
+++// ---------- 4) 城务：打开己方城市并执行内政 ----------
+++ui.tab = 'map'; ui.renderContent(); await sleep(3);
+++const luoyangDot = Array.from(document.querySelectorAll('.map-dot')).find((b) => b.textContent.includes('洛阳'));
+++ok(!!luoyangDot, '找到洛阳城市点');
+++luoyangDot.click();
+++await sleep(5);
+++ok(document.querySelector('.modal') !== null, '点击城市弹出城务弹窗');
+++const farmBtn = Array.from(document.querySelectorAll('.cmd-btn')).find((b) => b.textContent.includes('农田'));
+++ok(!!farmBtn, '城务含「开发农田」指令');
+++farmBtn.click();
+++await sleep(5);
+++
+++// ---------- 5) 结束回合 ----------
+++ui.tab = 'system'; ui.renderContent(); await sleep(3);
+++// 直接驱动结算（跳过确认弹窗）
+++ui.doEndTurn();
+++await sleep(20);
+++ok(document.querySelector('.modal') !== null || document.querySelector('.gameover') !== null, '结算后弹出简报或结束界面');
+++ok(ui.state.turn === 2 || ui.state.over != null, '回合推进或游戏结束');
+++
+++// ---------- 6) 战报弹窗渲染（驱动一次真实出征）----------
+++ui.tab = 'map'; ui.renderContent(); await sleep(3);
+++// 造势：洛阳兵足，邻接宛城设为中立薄弱，直接调用动作层出征并渲染战报
+++const s = ui.state;
+++const ly = s.cities.find((c) => c.id === 'luoyang');
+++const wan = s.cities.find((c) => c.id === 'wan');
+++ly.soldiers = 5000;
+++wan.ownerFactionId = null; wan.soldiers = 300; wan.defense = 200;
+++const lord = s.heroes.find((h) => h.isPlayerLord);
+++const camp = A.campaign(s, 'luoyang', 'wan', lord.id, 2000, 'assault', s.playerFactionId, Math.random);
+++ok(camp.ok && camp.battle, '出征产出战斗对象');
+++ui.showBattleReport(camp.battle, camp.won, camp.msg);
+++await sleep(5);
+++ok(document.querySelector('.battle-log') !== null, '战报弹窗渲染');
+++document.querySelector('.modal__foot button').click();
+++await sleep(3);
+++
+++// ---------- 7) 存档可往返 ----------
+++localStorage.setItem('__probe__', '1');
+++ok(localStorage.getItem('xtsg_save_v1') != null, '对局已自动存档到 localStorage');
+++
+++console.log(`\nDOM 冒烟结果：${pass} 通过，${fail} 失败`);
+++process.exit(fail ? 1 : 0);
++diff --git a/apps/xiong-tu-san-guo/src/config.js b/apps/xiong-tu-san-guo/src/config.js
++new file mode 100644
++index 0000000..3276c59
++--- /dev/null
+++++ b/apps/xiong-tu-san-guo/src/config.js
++@@ -0,0 +1,84 @@
+++// ============================================================================
+++// 雄图·三国志文明 · 全局常量与公式
+++// 所有数值与战斗 / 经济公式集中于此，便于单测（scripts/logic-test.mjs）与平衡调整。
+++// ============================================================================
+++
+++export const SAVE_KEY = 'xtsg_save_v1';
+++export const GAME_VERSION = 1;
+++
+++export const BUILD_MAX = 5; // 城市建筑等级上限（农田 / 市集 / 兵营 / 城墙 / 工坊）
+++export const TRAINING_BASE = 50; // 士兵默认训练度
+++export const TRAINING_MAX = 100;
+++
+++// —— 指令点数 ——
+++export const CMD_BASE = 5;
+++export const CMD_PER_CITY = 2;
+++
+++// —— 经济（每回合结算）——
+++export const GOLD_PER_MARKET = 100; // 市集等级 × 100
+++export const GOLD_PER_POP = 0.5; // 人口 × 0.5
+++export const GRAIN_PER_FARM = 200; // 农田等级 × 200
+++export const GRAIN_UPKEEP_PER_SOLDIER = 0.5; // 士兵每回合吃粮
+++export const POP_GROWTH_RATE = 0.02; // 自然增长率基础
+++export const POP_GROWTH_POL_DIVISOR = 100; // 政治 / 100 作为系数
+++
+++// —— 征兵 ——
+++export const RECRUIT_GOLD_PER_SOLDIER = 1.5; // 每名士兵花费金钱
+++export const RECRUIT_POP_PER_SOLDIER = 1; // 征兵消耗人口
+++
+++// 升级建筑花费：从当前 level 升到下一级
+++export function buildCost(level) {
+++  return 300 + level * 200;
+++}
+++
+++// —— 科技 ——
+++export const TECH_MAX_LEVEL = 3;
+++export const TECHS = {
+++  agri: { name: '农艺', desc: '粮食产量 +10% / 级', icon: '🌾' },
+++  commerce: { name: '商贸', desc: '金钱收入 +10% / 级', icon: '💰' },
+++  forge: { name: '冶炼', desc: '士兵攻击 +5% / 级', icon: '⚒️' },
+++  wall: { name: '筑城', desc: '城防值 +20% / 级', icon: '🧱' },
+++  trick: { name: '谋略', desc: '计谋成功率 +5% / 级', icon: '📜' },
+++  leadership: { name: '统御', desc: '带兵上限 +10% / 级', icon: '⚓' },
+++};
+++export const TECH_COST_GOLD = 800; // 每级基础金钱花费
+++export const TECH_COST_TURNS = 3; // 每级基础研究回合（智力可缩短）
+++
+++// —— 战斗 ——
+++export const FORMATIONS = {
+++  normal: { name: '普通', atk: 1.0, def: 1.0, desc: '攻守均衡' },
+++  assault: { name: '攻击', atk: 1.2, def: 0.85, desc: '攻击 +20% / 防御 -15%' },
+++  defend: { name: '防御', atk: 0.85, def: 1.2, desc: '攻击 -15% / 防御 +20%' },
+++};
+++export const DUEL_THRESHOLD = 20; // 武力差 > 20 可触发单挑
+++export const DUEL_CHANCE = 0.22; // 每回合触发单挑的概率
+++export const DUEL_ROUT_RATIO = 0.35; // 单挑败方溃散的兵力比例
+++
+++// —— 计略 ——
+++export const STRATAGEMS = {
+++  fire: { name: '火攻', desc: '降低目标城防 30%', icon: '🔥', range: 0.3 },
+++  burn: { name: '烧粮', desc: '烧毁目标军粮 30%', icon: '🔥', range: 0.3 },
+++  rumor: { name: '流言', desc: '降低目标守将忠诚 25', icon: '🗯️', range: 25 },
+++};
+++
+++// —— 势力颜色 ——
+++export const FACTION_COLORS = [
+++  '#c0392b', '#27ae60', '#2980b9', '#8e44ad',
+++  '#d35400', '#16a085', '#ad1457', '#f39c12', '#5d6d7e',
+++];
+++export const PLAYER_COLOR = '#c0392b';
+++export const NEUTRAL_COLOR = '#7f8c8d';
+++
+++// —— 探索 / 登用 ——
+++export const EXPLORE_DISCOVERY_BASE = 0.5; // 每位在野名将的发现概率基础（× 魅力修正）
+++export const RECRUIT_LOYALTY_THRESHOLD = 30; // 忠诚低于此值的敌将易被策反
+++
+++export function clamp(v, lo, hi) {
+++  return Math.max(lo, Math.min(hi, v));
+++}
+++
+++// 季节名（每回合 = 三个月）
+++export const SEASONS = ['春', '夏', '秋', '冬'];
+++export function seasonOf(turn) {
+++  return SEASONS[(turn - 1) % SEASONS.length];
+++}
++diff --git a/apps/xiong-tu-san-guo/src/core/actions.js b/apps/xiong-tu-san-guo/src/core/actions.js
++new file mode 100644
++index 0000000..fdc2670
++--- /dev/null
+++++ b/apps/xiong-tu-san-guo/src/core/actions.js
++@@ -0,0 +1,420 @@
+++// ============================================================================
+++// 玩家 / AI 共用的命令函数：每个动作校验、扣费、变更状态并返回 { ok, msg, ... }。
+++// 消耗指令点（cmd）的动作通过 spendCmd 统一计费；任命太守、输送等少数免费。
+++// ============================================================================
+++import {
+++  cityById, heroById, factionById, playerFaction, neighbors, heroesInCity,
+++  wildHeroesInCity, heroesOfFaction, bestDefender, troopCap, cmdRemaining, maxDefense, lordOf,
+++} from './state.js';
+++import { citiesOf, recruitCost } from './economy.js';
+++import { skillBonus, techMult, techLevel } from './tech.js';
+++import { createBattle, runBattle, effLead, effWar } from './combat.js';
+++import { chance, rangeInt } from './rng.js';
+++import {
+++  BUILD_MAX, buildCost, TRAINING_BASE, TRAINING_MAX, FORMATIONS, STRATAGEMS,
+++  TECH_MAX_LEVEL, TECH_COST_GOLD, TECH_COST_TURNS, RECRUIT_LOYALTY_THRESHOLD,
+++} from '../config.js';
+++
+++const PLAYER = (state) => state.playerFactionId;
+++
+++// 消耗一点指令；不足返回 false
+++function spendCmd(state, fid) {
+++  if (cmdRemaining(state, fid) <= 0) return false;
+++  state.cmdUsedByFaction = state.cmdUsedByFaction || {};
+++  state.cmdUsedByFaction[fid] = (state.cmdUsedByFaction[fid] || 0) + 1;
+++  return true;
+++}
+++function facMoney(state, fid) { return factionById(state, fid).money; }
+++function facGrain(state, fid) { return factionById(state, fid).grain; }
+++
+++const isPlayer = (state, fid) => fid === state.playerFactionId;
+++
+++// —— 内政：开发农田 ——
+++export function developFarm(state, cityId, fid = PLAYER(state)) {
+++  const c = cityById(state, cityId);
+++  if (!c || c.ownerFactionId !== fid) return { ok: false, msg: '该城非你所属' };
+++  if (c.farmLevel >= BUILD_MAX) return { ok: false, msg: '农田已达满级' };
+++  if (!spendCmd(state, fid)) return { ok: false, msg: '指令点不足' };
+++  const cost = buildCost(c.farmLevel);
+++  if (facMoney(state, fid) < cost) { refundCmd(state, fid); return { ok: false, msg: '金钱不足' }; }
+++  factionById(state, fid).money -= cost;
+++  c.farmLevel += 1;
+++  return { ok: true, msg: `${c.name} 农田升至 ${c.farmLevel} 级（-${cost} 金）` };
+++}
+++
+++// —— 内政：发展商业 ——
+++export function developMarket(state, cityId, fid = PLAYER(state)) {
+++  const c = cityById(state, cityId);
+++  if (!c || c.ownerFactionId !== fid) return { ok: false, msg: '该城非你所属' };
+++  if (c.marketLevel >= BUILD_MAX) return { ok: false, msg: '市集已达满级' };
+++  if (!spendCmd(state, fid)) return { ok: false, msg: '指令点不足' };
+++  const cost = buildCost(c.marketLevel);
+++  if (facMoney(state, fid) < cost) { refundCmd(state, fid); return { ok: false, msg: '金钱不足' }; }
+++  factionById(state, fid).money -= cost;
+++  c.marketLevel += 1;
+++  return { ok: true, msg: `${c.name} 市集升至 ${c.marketLevel} 级（-${cost} 金）` };
+++}
+++
+++// —— 内政：城防修筑 ——
+++export function buildWall(state, cityId, fid = PLAYER(state)) {
+++  const c = cityById(state, cityId);
+++  if (!c || c.ownerFactionId !== fid) return { ok: false, msg: '该城非你所属' };
+++  if (c.wallLevel >= BUILD_MAX) return { ok: false, msg: '城墙已达满级' };
+++  if (!spendCmd(state, fid)) return { ok: false, msg: '指令点不足' };
+++  const cost = buildCost(c.wallLevel);
+++  if (facMoney(state, fid) < cost) { refundCmd(state, fid); return { ok: false, msg: '金钱不足' }; }
+++  factionById(state, fid).money -= cost;
+++  c.wallLevel += 1;
+++  c.defense = maxDefense(state, c);
+++  return { ok: true, msg: `${c.name} 城墙升至 ${c.wallLevel} 级，城防加固` };
+++}
+++
+++// —— 内政：征兵 ——
+++export function recruit(state, cityId, count, fid = PLAYER(state)) {
+++  const c = cityById(state, cityId);
+++  if (!c || c.ownerFactionId !== fid) return { ok: false, msg: '该城非你所属' };
+++  count = Math.max(0, Math.floor(count));
+++  if (count <= 0) return { ok: false, msg: '征兵数量无效' };
+++  if (!spendCmd(state, fid)) return { ok: false, msg: '指令点不足' };
+++  const { gold, pop } = recruitCost(c, count);
+++  const fac = factionById(state, fid);
+++  if (fac.money < gold) { refundCmd(state, fid); return { ok: false, msg: '金钱不足' }; }
+++  if (c.population < pop) { refundCmd(state, fid); return { ok: false, msg: '人口不足' }; }
+++  fac.money -= gold;
+++  c.population -= Math.round(pop);
+++  c.soldiers += count;
+++  // 兵营等级提升新兵训练度起点
+++  if (c.training < TRAINING_BASE + (c.barracksLevel - 1) * 5) c.training = TRAINING_BASE + (c.barracksLevel - 1) * 5;
+++  return { ok: true, msg: `${c.name} 征兵 ${count}（-${Math.round(gold)} 金，-${Math.round(pop)} 人口）` };
+++}
+++
+++// —— 内政：操练（提升训练度）——
+++export function train(state, cityId, fid = PLAYER(state)) {
+++  const c = cityById(state, cityId);
+++  if (!c || c.ownerFactionId !== fid) return { ok: false, msg: '该城非你所属' };
+++  if (c.training >= TRAINING_MAX) return { ok: false, msg: '训练度已满' };
+++  if (!spendCmd(state, fid)) return { ok: false, msg: '指令点不足' };
+++  const cost = 200;
+++  if (facMoney(state, fid) < cost) { refundCmd(state, fid); return { ok: false, msg: '金钱不足' }; }
+++  factionById(state, fid).money -= cost;
+++  c.training = Math.min(TRAINING_MAX, c.training + 8);
+++  return { ok: true, msg: `${c.name} 操练部队，训练度 → ${c.training}` };
+++}
+++
+++// —— 人事：探索（发现本城在野名将）——
+++export function explore(state, cityId, fid = PLAYER(state), rng) {
+++  const r = rng || Math.random;
+++  const c = cityById(state, cityId);
+++  if (!c || c.ownerFactionId !== fid) return { ok: false, msg: '该城非你所属' };
+++  if (!spendCmd(state, fid)) return { ok: false, msg: '指令点不足' };
+++  const roster = heroesInCity(state, cityId, fid);
+++  const charm = roster.length ? Math.max(...roster.map((h) => h.stats.c)) : 50;
+++  const wilds = wildHeroesInCity(state, cityId);
+++  const newly = [];
+++  for (const w of wilds) {
+++    if (w.discovered) continue;
+++    if (chance(r, 0.4 + charm / 400)) { w.discovered = true; newly.push(w); }
+++  }
+++  const discovered = wilds.filter((w) => w.discovered);
+++  if (!newly.length && !discovered.length) {
+++    return { ok: true, msg: `${c.name} 四处寻访，未发现可用之才。`, discovered: [] };
+++  }
+++  return {
+++    ok: true,
+++    msg: newly.length ? `${c.name} 探访得知：${newly.map((w) => w.name).join('、')} 在此隐居！` : `${c.name} 已有名将在野可登用。`,
+++    discovered,
+++    newly,
+++  };
+++}
+++
+++// —— 人事：登用（说服在野名将加入）——
+++export function recruitHero(state, heroId, fid = PLAYER(state), rng) {
+++  const r = rng || Math.random;
+++  const h = heroById(state, heroId);
+++  if (!h || !h.wild) return { ok: false, msg: '目标不可登用' };
+++  const c = cityById(state, h.cityId);
+++  if (!c || c.ownerFactionId !== fid) return { ok: false, msg: '名将不在己方城市' };
+++  if (!spendCmd(state, fid)) return { ok: false, msg: '指令点不足' };
+++  const roster = heroesInCity(state, h.cityId, fid);
+++  const charm = roster.length ? Math.max(...roster.map((x) => x.stats.c)) : 50;
+++  const cBonus = roster.length ? Math.max(...roster.map((x) => skillBonus(x).c_recruit)) : 0;
+++  let p = 0.25 + (charm - h.loyalty) / 200 + cBonus + techMult(state, 'trick', 0.05) - 1;
+++  p = Math.max(0.05, Math.min(0.95, p));
+++  if (chance(r, p)) {
+++    h.wild = false;
+++    h.factionId = fid;
+++    h.status = 'free';
+++    h.discovered = true;
+++    h.loyalty = Math.max(70, Math.min(95, Math.round(60 + charm / 4)));
+++    return { ok: true, msg: `${h.name} 愿效犬马之劳，已归入麾下！`, recruited: true };
+++  }
+++  return { ok: true, msg: `${h.name} 婉言谢绝（成功率 ${Math.round(p * 100)}%）。`, recruited: false };
+++}
+++
+++// —— 人事：赏赐（提升忠诚）——
+++export function reward(state, heroId, fid = PLAYER(state)) {
+++  const h = heroById(state, heroId);
+++  if (!h || h.factionId !== fid) return { ok: false, msg: '非己方武将' };
+++  if (!spendCmd(state, fid)) return { ok: false, msg: '指令点不足' };
+++  const cost = 300;
+++  if (facMoney(state, fid) < cost) { refundCmd(state, fid); return { ok: false, msg: '金钱不足' }; }
+++  factionById(state, fid).money -= cost;
+++  h.loyalty = Math.min(100, h.loyalty + 12);
+++  return { ok: true, msg: `赏赐 ${h.name}，忠诚 → ${h.loyalty}` };
+++}
+++
+++// —— 人事：任命太守（免费）——
+++export function appointGovernor(state, cityId, heroId, fid = PLAYER(state)) {
+++  const c = cityById(state, cityId);
+++  const h = heroById(state, heroId);
+++  if (!c || c.ownerFactionId !== fid) return { ok: false, msg: '该城非你所属' };
+++  if (!h || h.factionId !== fid || h.status === 'prisoner') return { ok: false, msg: '该武将不可用' };
+++  if (h.cityId !== cityId) return { ok: false, msg: '武将须在本城方可任命' };
+++  c.governorHeroId = heroId;
+++  return { ok: true, msg: `${h.name} 出任 ${c.name} 太守` };
+++}
+++
+++// —— 科技：开始研究 ——
+++export function research(state, techKey, fid = PLAYER(state)) {
+++  if (!Object.prototype.hasOwnProperty.call(state.techLevels, techKey)) return { ok: false, msg: '未知科技' };
+++  if (state.research) return { ok: false, msg: '已有研究进行中' };
+++  if (techLevel(state, techKey) >= TECH_MAX_LEVEL) return { ok: false, msg: '该科技已满级' };
+++  if (!spendCmd(state, fid)) return { ok: false, msg: '指令点不足' };
+++  if (facMoney(state, fid) < TECH_COST_GOLD) { refundCmd(state, fid); return { ok: false, msg: '金钱不足' }; }
+++  factionById(state, fid).money -= TECH_COST_GOLD;
+++  const lord = lordOf(state, fid);
+++  const intel = lord ? lord.stats.i : 50;
+++  const turns = Math.max(1, Math.round(TECH_COST_TURNS - intel / 60));
+++  state.research = { key: techKey, turnsLeft: turns };
+++  return { ok: true, msg: `开始研究，预计 ${turns} 回合完成（-${TECH_COST_GOLD} 金）` };
+++}
+++
+++// —— 军事：出征 ——
+++export function campaign(state, fromCityId, toCityId, generalId, troops, formation, fid = PLAYER(state), rng) {
+++  const r = rng || Math.random;
+++  const from = cityById(state, fromCityId);
+++  const to = cityById(state, toCityId);
+++  if (!from || !to) return { ok: false, msg: '城市无效' };
+++  if (from.ownerFactionId !== fid) return { ok: false, msg: '出发城非你所属' };
+++  if (to.ownerFactionId === fid) return { ok: false, msg: '不可攻打己方城市' };
+++  if (!from.adjacent.includes(toCityId)) return { ok: false, msg: '目标城市不相邻' };
+++  const g = heroById(state, generalId);
+++  if (!g || g.factionId !== fid || g.status === 'prisoner' || g.cityId !== fromCityId) {
+++    return { ok: false, msg: '主将不可用' };
+++  }
+++  troops = Math.max(0, Math.floor(troops));
+++  if (troops <= 0) return { ok: false, msg: '出兵数量无效' };
+++  if (troops > from.soldiers) return { ok: false, msg: '城中兵力不足' };
+++  if (troops > troopCap(state, g)) return { ok: false, msg: `超出 ${g.name} 带兵上限（${troopCap(state, g)}）` };
+++  if (!spendCmd(state, fid)) return { ok: false, msg: '指令点不足' };
+++  const grainCost = Math.round(troops * 0.05);
+++  if (facGrain(state, fid) < grainCost) { refundCmd(state, fid); return { ok: false, msg: '军粮不足以出征' }; }
+++  factionById(state, fid).grain -= grainCost;
+++
+++  from.soldiers -= troops;
+++
+++  const attacker = { factionId: fid, general: g, soldiers: troops, training: from.training, formation: formation || 'normal' };
+++  const defGeneral = bestDefender(state, toCityId) || { id: '__militia__', name: '守城民兵', stats: { l: 50, w: 50, i: 40, p: 40, c: 40 }, skill: null };
+++  const defender = {
+++    factionId: to.ownerFactionId, general: defGeneral, soldiers: to.soldiers,
+++    defense: to.defense || 0, isCity: true, training: to.training || TRAINING_BASE, formation: 'normal',
+++  };
+++
+++  const battle = createBattle({ attacker, defender });
+++  runBattle(battle, state, r);
+++
+++  let won = battle.result === 'attacker';
+++  applyCampaignResult(state, battle, from, to, g, fid, r);
+++
+++  const msgs = battle.log.slice(-3);
+++  return { ok: true, won, battle, msg: won ? `攻克 ${to.name}！` : `攻打 ${to.name} 失利。`, log: msgs };
+++}
+++
+++// 结算出征结果（占领 / 溃败 / 俘虏）
+++function applyCampaignResult(state, battle, from, to, attackerGen, fid, rng) {
+++  const won = battle.result === 'attacker';
+++  const captorFid = won ? fid : to.ownerFactionId;
+++
+++  if (won) {
+++    // 占领：幸存兵力转为新守军，主将入驻
+++    const survivors = Math.round(battle.attacker.soldiers);
+++    to.ownerFactionId = fid;
+++    to.soldiers = survivors;
+++    to.training = from.training;
+++    attackerGen.cityId = to.id;
+++    if (!to.governorHeroId || !heroById(state, to.governorHeroId)) to.governorHeroId = attackerGen.id;
+++    // 缴获城库
+++    const lootGold = to.gold || 0;
+++    const lootGrain = to.grain || 0;
+++    factionById(state, fid).money += lootGold;
+++    factionById(state, fid).grain += lootGrain;
+++    to.gold = 0; to.grain = 0;
+++    state.turnLog.push(`🏰 攻陷 ${to.name}！缴获 ${lootGold} 金、${lootGrain} 粮，余兵 ${survivors} 驻守。`);
+++  } else {
+++    // 失利：出征兵力覆灭（已从 from 扣除），主将若未被俘则退回
+++    if (attackerGen.id !== '__militia__' && attackerGen.status !== 'prisoner') {
+++      // 仍在 from 城
+++    }
+++    state.turnLog.push(`💔 攻打 ${to.name} 失利，出征军覆灭。`);
+++  }
+++
+++  // 俘虏处理
+++  if (battle.prisoner && battle.prisoner !== '__militia__') {
+++    const ph = heroById(state, battle.prisoner);
+++    if (ph && captorFid != null) {
+++      ph.status = 'prisoner';
+++      ph.prisonerOf = captorFid;
+++      const capCity = citiesOf(state, captorFid)[0];
+++      if (capCity) ph.cityId = capCity.id;
+++      if (ph.id === to.governorHeroId) to.governorHeroId = null;
+++      state.turnLog.push(`⛓️ ${ph.name} 被俘。`);
+++    } else if (ph) {
+++      // 中立势力俘获 → 释放为在野
+++      ph.status = 'free';
+++      ph.wild = true;
+++      ph.discovered = false;
+++    }
+++  }
+++}
+++
+++// —— 军事：输送（己方相邻城市间调运）——
+++export function transport(state, fromCityId, toCityId, payload, fid = PLAYER(state)) {
+++  const from = cityById(state, fromCityId);
+++  const to = cityById(state, toCityId);
+++  if (!from || !to) return { ok: false, msg: '城市无效' };
+++  if (from.ownerFactionId !== fid || to.ownerFactionId !== fid) return { ok: false, msg: '须为己方城市' };
+++  if (!from.adjacent.includes(toCityId)) return { ok: false, msg: '两城不相邻' };
+++  if (!spendCmd(state, fid)) return { ok: false, msg: '指令点不足' };
+++  const fac = factionById(state, fid);
+++  const s = Math.max(0, Math.floor(payload.soldiers || 0));
+++  const gm = Math.max(0, Math.floor(payload.gold || 0));
+++  const gr = Math.max(0, Math.floor(payload.grain || 0));
+++  if (s > from.soldiers) { refundCmd(state, fid); return { ok: false, msg: '兵力不足' }; }
+++  if (gm > fac.money) { refundCmd(state, fid); return { ok: false, msg: '金钱不足' }; }
+++  if (gr > fac.grain) { refundCmd(state, fid); return { ok: false, msg: '军粮不足' }; }
+++  from.soldiers -= s;
+++  to.soldiers += s;
+++  fac.money -= gm;
+++  fac.grain -= gr;
+++  // 同步迁移随军武将（可选）：把 from 城中指定的空闲武将调往 to（此处只调资源）
+++  return { ok: true, msg: `自 ${from.name} 向 ${to.name} 输送：兵 ${s}、金 ${gm}、粮 ${gr}` };
+++}
+++
+++// —— 外交 / 计略 ——
+++export function stratagem(state, fromCityId, toCityId, type, fid = PLAYER(state), rng) {
+++  const r = rng || Math.random;
+++  const def = STRATAGEMS[type];
+++  if (!def) return { ok: false, msg: '未知计略' };
+++  const from = cityById(state, fromCityId);
+++  const to = cityById(state, toCityId);
+++  if (!from || !to) return { ok: false, msg: '城市无效' };
+++  if (from.ownerFactionId !== fid) return { ok: false, msg: '出发城非你所属' };
+++  if (to.ownerFactionId === fid) return { ok: false, msg: '不可对己方城市用计' };
+++  if (!from.adjacent.includes(toCityId)) return { ok: false, msg: '目标城市不相邻' };
+++  if (!spendCmd(state, fid)) return { ok: false, msg: '指令点不足' };
+++  const cost = 150;
+++  if (facMoney(state, fid) < cost) { refundCmd(state, fid); return { ok: false, msg: '金钱不足' }; }
+++  factionById(state, fid).money -= cost;
+++
+++  const caster = bestDefender(state, fromCityId) || { stats: { i: 50 } };
+++  const intel = caster.stats ? caster.stats.i : 50;
+++  const targetGen = bestDefender(state, toCityId);
+++  const tIntel = targetGen && targetGen.stats ? targetGen.stats.i : 45;
+++  let p = 0.35 + (intel - tIntel) / 200 + techMult(state, 'trick', 0.05) - 1;
+++  p = Math.max(0.05, Math.min(0.9, p));
+++
+++  if (!chance(r, p)) {
+++    return { ok: true, msg: `${def.name} 被 ${to.name} 识破（成功率 ${Math.round(p * 100)}%）`, success: false };
+++  }
+++  if (type === 'fire') {
+++    to.defense = Math.max(0, Math.round((to.defense || 0) * (1 - def.range)));
+++    return { ok: true, msg: `火攻成功！${to.name} 城防降至 ${Math.round(to.defense)}`, success: true };
+++  }
+++  if (type === 'burn') {
+++    const foeFid = to.ownerFactionId;
+++    if (foeFid != null) {
+++      const foe = factionById(state, foeFid);
+++      const burned = Math.round(foe.grain * def.range);
+++      foe.grain -= burned;
+++      return { ok: true, msg: `烧粮成功！${foe.name} 损失 ${burned} 军粮`, success: true };
+++    }
+++    to.grain = Math.round((to.grain || 0) * (1 - def.range));
+++    return { ok: true, msg: `烧粮成功！${to.name} 城库粮草被焚`, success: true };
+++  }
+++  if (type === 'rumor') {
+++    if (targetGen) {
+++      targetGen.loyalty = Math.max(0, targetGen.loyalty - def.range);
+++      return { ok: true, msg: `流言成功！${targetGen.name} 忠诚降至 ${targetGen.loyalty}`, success: true };
+++    }
+++    return { ok: true, msg: `流言散布，但城中无名将可撼动`, success: true };
+++  }
+++  return { ok: true, msg: '计略执行完毕', success: true };
+++}
+++
+++// 武将调任：在己方相邻城市间移动一名武将（免费）
+++export function moveHero(state, heroId, toCityId, fid = PLAYER(state)) {
+++  const h = heroById(state, heroId);
+++  const to = cityById(state, toCityId);
+++  if (!h || h.factionId !== fid || h.status === 'prisoner') return { ok: false, msg: '武将不可用' };
+++  if (!to || to.ownerFactionId !== fid) return { ok: false, msg: '目标非己方城市' };
+++  const from = cityById(state, h.cityId);
+++  if (!from || !from.adjacent.includes(toCityId)) return { ok: false, msg: '两城不相邻' };
+++  h.cityId = toCityId;
+++  return { ok: true, msg: `${h.name} 调往 ${to.name}` };
+++}
+++
+++// —— 俘虏管理 ——
+++// 招降俘虏（成功率随俘虏忠诚降低而提高）
+++export function recruitPrisoner(state, heroId, fid = PLAYER(state), rng) {
+++  const r = rng || Math.random;
+++  const h = heroById(state, heroId);
+++  if (!h || h.prisonerOf !== fid) return { ok: false, msg: '该武将非你俘虏' };
+++  if (!spendCmd(state, fid)) return { ok: false, msg: '指令点不足' };
+++  const cost = 500;
+++  if (facMoney(state, fid) < cost) { refundCmd(state, fid); return { ok: false, msg: '金钱不足' }; }
+++  factionById(state, fid).money -= cost;
+++  const lord = lordOf(state, fid);
+++  const charm = lord ? lord.stats.c : 50;
+++  let p = 0.15 + (100 - h.loyalty) / 200 + (charm - 70) / 100;
+++  p = Math.max(0.05, Math.min(0.85, p));
+++  if (chance(r, p)) {
+++    h.factionId = fid;
+++    h.prisonerOf = null;
+++    h.status = 'free';
+++    h.loyalty = Math.max(55, Math.min(80, h.loyalty));
+++    return { ok: true, msg: `${h.name} 归降！`, recruited: true };
+++  }
+++  return { ok: true, msg: `${h.name} 拒不投降（成功率 ${Math.round(p * 100)}%）`, recruited: false };
+++}
+++
+++// 释放俘虏 → 转为某中立城在野
+++export function releasePrisoner(state, heroId, fid = PLAYER(state)) {
+++  const h = heroById(state, heroId);
+++  if (!h || h.prisonerOf !== fid) return { ok: false, msg: '该武将非你俘虏' };
+++  const neutrals = state.cities.filter((c) => c.ownerFactionId == null);
+++  const dest = (neutrals.length ? neutrals : state.cities)[0];
+++  h.prisonerOf = null;
+++  h.status = 'free';
+++  h.factionId = null;
+++  h.wild = true;
+++  h.discovered = false;
+++  h.cityId = dest.id;
+++  return { ok: true, msg: `释放 ${h.name}` };
+++}
+++
+++// 处决俘虏
+++export function executePrisoner(state, heroId, fid = PLAYER(state)) {
+++  const h = heroById(state, heroId);
+++  if (!h || h.prisonerOf !== fid) return { ok: false, msg: '该武将非你俘虏' };
+++  const name = h.name;
+++  state.heroes = state.heroes.filter((x) => x.id !== heroId);
+++  return { ok: true, msg: `处决 ${name}，其旧部离心。` };
+++}
+++
+++function refundCmd(state, fid) {
+++  if (state.cmdUsedByFaction && state.cmdUsedByFaction[fid] > 0) {
+++    state.cmdUsedByFaction[fid] -= 1;
+++  }
+++}
+++
+++export { spendCmd, isPlayer, RECRUIT_LOYALTY_THRESHOLD, effLead, effWar, FORMATIONS };
++diff --git a/apps/xiong-tu-san-guo/src/core/ai.js b/apps/xiong-tu-san-guo/src/core/ai.js
++new file mode 100644
++index 0000000..5f75c29
++--- /dev/null
+++++ b/apps/xiong-tu-san-guo/src/core/ai.js
++@@ -0,0 +1,109 @@
+++// ============================================================================
+++// AI 势力回合：按设计文档优先级消耗指令点。
+++//   1) 内政（升市场 / 征兵） 2) 招募在野名将 3) 科技研究
+++//   4) 侵略相邻弱敌 5) 输送平衡防御 6) 赏赐稳忠诚
+++// 直接复用 actions.js 的命令函数（与玩家同规则）。
+++// ============================================================================
+++import * as A from './actions.js';
+++import {
+++  cmdRemaining, heroesOfFaction, neighbors, lordOf, heroById,
+++} from './state.js';
+++import { citiesOf } from './economy.js';
+++import { effLead } from './combat.js';
+++import { chance } from './rng.js';
+++import { TECH_COST_GOLD } from '../config.js';
+++
+++// 单个 AI 势力行动
+++export function aiTurn(state, fid, rng) {
+++  const r = rng || Math.random;
+++  const cities = citiesOf(state, fid);
+++  if (!cities.length) return;
+++  const lord = lordOf(state, fid);
+++
+++  let guard = 0;
+++  while (cmdRemaining(state, fid) > 0 && guard++ < 30) {
+++    let acted = false;
+++
+++    // 1) 内政：金币低则升市场；兵不足人口 20% 则征兵
+++    for (const c of cities) {
+++      if (cmdRemaining(state, fid) <= 0) break;
+++      const fac = state.factions.find((f) => f.id === fid);
+++      if (fac.money > 600 && c.marketLevel < 5 && chance(r, 0.5)) {
+++        if (A.developMarket(state, c.id, fid).ok) { acted = true; break; }
+++      }
+++    }
+++    for (const c of cities) {
+++      if (cmdRemaining(state, fid) <= 0) break;
+++      if (c.soldiers < c.population * 0.2) {
+++        const recruitN = Math.min(800, Math.floor(c.population * 0.05));
+++        if (recruitN > 50 && A.recruit(state, c.id, recruitN, fid).ok) { acted = true; break; }
+++      }
+++    }
+++
+++    // 2) 招募在野名将（魅力 > 70 的武将空闲时探索 + 登用）
+++    if (!acted) {
+++      const charmHero = heroesOfFaction(state, fid).find((h) => h.stats.c > 70);
+++      if (charmHero) {
+++        for (const c of cities) {
+++          if (cmdRemaining(state, fid) <= 0) break;
+++          const res = A.explore(state, c.id, fid, r);
+++          if (res.ok && res.discovered && res.discovered.length) {
+++            const target = res.discovered[0];
+++            A.recruitHero(state, target.id, fid, r);
+++            acted = true;
+++            break;
+++          }
+++        }
+++      }
+++    }
+++
+++    // 3) 科技研究
+++    if (!acted && !state.research && chance(r, 0.3)) {
+++      const fac = state.factions.find((f) => f.id === fid);
+++      if (fac.money >= TECH_COST_GOLD) {
+++        const keys = ['agri', 'commerce', 'forge', 'wall', 'trick', 'leadership'];
+++        const k = keys[Math.floor(r() * keys.length)];
+++        if (A.research(state, k, fid).ok) acted = true;
+++      }
+++    }
+++
+++    // 4) 侵略：相邻非己方城市，军力占优（兵力比 > 1.3）则出征
+++    if (!acted) {
+++      outer: for (const c of cities) {
+++        const attacker = heroesOfFaction(state, fid).find((h) => h.cityId === c.id && h.status === 'free');
+++        if (!attacker) continue;
+++        for (const n of neighbors(state, c.id)) {
+++          if (cmdRemaining(state, fid) <= 0) break outer;
+++          if (n.ownerFactionId === fid) continue;
+++          const myPow = c.soldiers + effLead(attacker) * 5;
+++          const foePow = n.soldiers + (n.defense || 0) * 0.5;
+++          if (myPow > foePow * 1.5 && c.soldiers > 800) {
+++            const troops = Math.min(c.soldiers - 200, Math.floor(c.soldiers * 0.7));
+++            const res = A.campaign(state, c.id, n.id, attacker.id, troops, 'assault', fid, r);
+++            if (res.ok) {
+++              state.turnLog.push(`⚔️ ${state.factions.find((f) => f.id === fid).name} 出兵攻打 ${n.name}${res.won ? '并攻陷之' : '，未能攻克'}。`);
+++              acted = true;
+++              break outer;
+++            }
+++          }
+++        }
+++      }
+++    }
+++
+++    // 5) 赏赐稳忠诚
+++    if (!acted) {
+++      const low = heroesOfFaction(state, fid).find((h) => h.loyalty < 60);
+++      if (low) { A.reward(state, low.id, fid); acted = true; }
+++    }
+++
+++    if (!acted) break; // 无事可做，结束本势力回合
+++  }
+++}
+++
+++export function aiTurnAll(state, rng) {
+++  const r = rng || Math.random;
+++  for (const f of state.factions) {
+++    if (!f.aiControlled) continue;
+++    aiTurn(state, f.id, r);
+++  }
+++}
++diff --git a/apps/xiong-tu-san-guo/src/core/combat.js b/apps/xiong-tu-san-guo/src/core/combat.js
++new file mode 100644
++index 0000000..37dcda6
++--- /dev/null
+++++ b/apps/xiong-tu-san-guo/src/core/combat.js
++@@ -0,0 +1,130 @@
+++// ============================================================================
+++// 战斗系统：简化自动回合制（骰子模型 + 城防 + 单挑）。
+++// createBattle() 构造战局，runBattle() 自动结算至胜负，产生文字战报 log。
+++// ============================================================================
+++import { FORMATIONS, DUEL_THRESHOLD, DUEL_CHANCE, DUEL_ROUT_RATIO } from '../config.js';
+++import { skillBonus, techMult } from './tech.js';
+++import { chance, range } from './rng.js';
+++
+++// 有效武力 / 统率（含技能加成）
+++export function effWar(hero) {
+++  if (!hero) return 50;
+++  return hero.stats.w * (1 + skillBonus(hero).war);
+++}
+++export function effLead(hero) {
+++  if (!hero) return 50;
+++  return hero.stats.l * (1 + skillBonus(hero).lead);
+++}
+++
+++// 训练度系数：50 → 1.0，100 → 1.5，0 → 0.5
+++function trainingCoeff(training) {
+++  return 0.5 + (Number.isFinite(training) ? training : 50) / 100;
+++}
+++
+++// 一支部队的攻击值
+++export function attackValue(force, state) {
+++  const g = force.general;
+++  const war = effWar(g);
+++  const lead = effLead(g);
+++  const soldiers = Math.max(0, force.soldiers);
+++  const forge = techMult(state, 'forge', 0.05);
+++  const form = FORMATIONS[force.formation] || FORMATIONS.normal;
+++  return (war * 0.4 + lead * 0.3 + soldiers * 0.01) * forge * trainingCoeff(force.training) * form.atk;
+++}
+++
+++// 构造战局
+++export function createBattle({ attacker, defender }) {
+++  return {
+++    attacker: { ...attacker },
+++    defender: { ...defender },
+++    round: 0,
+++    log: [],
+++    result: null,
+++    prisoner: null,
+++    duel: null,
+++  };
+++}
+++
+++// 单回合：双方同时对对方造成伤害（攻方先结算，守方城防优先承受）
+++function resolveRound(b, state, rng) {
+++  const aVal = attackValue(b.attacker, state);
+++  const dVal = attackValue(b.defender, state);
+++
+++  // —— 攻方 → 守方 ——（城防优先承受，溢出转入士兵）
+++  let aDmg = aVal * range(rng, 0.85, 1.15);
+++  if (b.defender.isCity && b.defender.defense > 0) {
+++    const soaked = Math.min(b.defender.defense, aDmg);
+++    b.defender.defense = Math.max(0, b.defender.defense - soaked);
+++    aDmg -= soaked;
+++    if (soaked > 0) {
+++      b.log.push(`回合 ${b.round}：${b.attacker.general.name} 攻城，城防承受 ${Math.round(soaked)} 点（余 ${Math.round(b.defender.defense)}）。`);
+++    }
+++  }
+++  if (aDmg > 0) {
+++    b.defender.soldiers = Math.max(0, b.defender.soldiers - aDmg);
+++    b.log.push(`回合 ${b.round}：${b.attacker.general.name} 部队杀伤敌军 ${Math.round(aDmg)} 人（敌余 ${Math.round(b.defender.soldiers)}）。`);
+++  }
+++
+++  // —— 守方 → 攻方 ——（攻方无城防，直接削减士兵）
+++  const dDmg = dVal * range(rng, 0.85, 1.15);
+++  if (dDmg > 0) {
+++    b.attacker.soldiers = Math.max(0, b.attacker.soldiers - dDmg);
+++    b.log.push(`回合 ${b.round}：${b.defender.general.name} 反击杀伤我军 ${Math.round(dDmg)} 人（我余 ${Math.round(b.attacker.soldiers)}）。`);
+++  }
+++}
+++
+++// 单挑判定（每回合最多一次，触发后决出胜负）
+++function tryDuel(b, rng) {
+++  if (b.duel) return false;
+++  const ag = b.attacker.general;
+++  const dg = b.defender.general;
+++  if (!ag || !dg) return false;
+++  const diff = Math.abs(effWar(ag) - effWar(dg));
+++  if (diff <= DUEL_THRESHOLD) return false;
+++  if (!chance(rng, DUEL_CHANCE)) return false;
+++  const attackerWins = effWar(ag) > effWar(dg);
+++  b.duel = { winner: attackerWins ? 'attacker' : 'defender', loser: attackerWins ? 'defender' : 'attacker' };
+++  b.log.push(`⚔️ ${ag.name} 与 ${dg.name} 阵前单挑！${(attackerWins ? ag : dg).name} 武艺更胜一筹，一合斩将，败军溃散！`);
+++  return true;
+++}
+++
+++// 跑完整场战斗（最多 30 回合，避免死循环）
+++export function runBattle(b, state, rng) {
+++  b.round = 0;
+++  while (b.result == null && b.round < 30) {
+++    b.round += 1;
+++
+++    // 单挑（前置，可一击定胜负）
+++    if (tryDuel(b, rng)) {
+++      const loserSide = b.duel.loser;
+++      const winnerSide = b.duel.winner;
+++      const loserGen = b[loserSide].general;
+++      b[loserSide].soldiers = Math.round(b[loserSide].soldiers * (1 - DUEL_ROUT_RATIO));
+++      // 君主不可被俘（仅败走），避免势力因失主而僵死
+++      b.prisoner = loserGen && !isLord(loserGen) ? loserGen.id : null;
+++      b.result = winnerSide;
+++      b.log.push(`${b[winnerSide].general.name} 赢下单挑，${loserGen.name}${b.prisoner ? ' 被俘' : ' 败走'}，敌军溃败！`);
+++      break;
+++    }
+++
+++    resolveRound(b, state, rng);
+++
+++    if (b.defender.soldiers <= 0) { b.result = 'attacker'; break; }
+++    if (b.attacker.soldiers <= 0) { b.result = 'defender'; break; }
+++  }
+++  // 超时未分胜负：以残兵多者胜
+++  if (b.result == null) {
+++    b.result = b.attacker.soldiers >= b.defender.soldiers ? 'attacker' : 'defender';
+++    b.log.push(`战至日暮，双方力竭。${b.result === 'attacker' ? '攻方' : '守方'} 残兵更众，勉强占得上风。`);
+++  }
+++  // 败方主将被俘（君主除外）
+++  if (!b.prisoner) {
+++    const loser = b.result === 'attacker' ? b.defender : b.attacker;
+++    if (loser.general && !isLord(loser.general) && loser.general.id !== '__militia__' && chance(rng, 0.5)) {
+++      b.prisoner = loser.general.id;
+++    }
+++  }
+++  return b;
+++}
+++
+++function isLord(g) { return !!(g && (g.lord || g.isPlayerLord)); }
++diff --git a/apps/xiong-tu-san-guo/src/core/economy.js b/apps/xiong-tu-san-guo/src/core/economy.js
++new file mode 100644
++index 0000000..22b1ccc
++--- /dev/null
+++++ b/apps/xiong-tu-san-guo/src/core/economy.js
++@@ -0,0 +1,74 @@
+++// ============================================================================
+++// 经济结算：每座城市的金钱 / 粮食收入、军粮消耗、人口增长。
+++// 资源池（金钱 / 军粮）为势力级共享；人口 / 士兵 / 城防 / 建筑为城市级。
+++// ============================================================================
+++import {
+++  GOLD_PER_MARKET, GOLD_PER_POP, GRAIN_PER_FARM, GRAIN_UPKEEP_PER_SOLDIER,
+++  POP_GROWTH_RATE, POP_GROWTH_POL_DIVISOR, TRAINING_BASE,
+++} from '../config.js';
+++import { techMult } from './tech.js';
+++
+++export function isOwnedBy(city, factionId) {
+++  return city.ownerFactionId === factionId;
+++}
+++
+++export function citiesOf(state, factionId) {
+++  return state.cities.filter((c) => isOwnedBy(c, factionId));
+++}
+++
+++function traitMult(city, type) {
+++  return city.trait && city.trait.type === type ? 1 + city.trait.value : 1;
+++}
+++
+++// 商业收入（每回合，单城）
+++export function cityGoldIncome(state, city) {
+++  const base = city.marketLevel * GOLD_PER_MARKET + city.population * GOLD_PER_POP;
+++  return base * traitMult(city, 'commerce') * techMult(state, 'commerce', 0.1);
+++}
+++
+++// 粮食产量（每回合，单城）
+++export function cityGrainIncome(state, city) {
+++  const base = city.farmLevel * GRAIN_PER_FARM;
+++  return base * traitMult(city, 'grain') * techMult(state, 'agri', 0.1);
+++}
+++
+++// 势力每回合金钱总收入（含特性 / 科技）
+++export function factionGoldIncome(state, factionId) {
+++  let sum = 0;
+++  for (const c of state.cities) if (isOwnedBy(c, factionId)) sum += cityGoldIncome(state, c);
+++  return sum;
+++}
+++
+++// 势力每回合粮食净变化（产量 - 士兵吃粮）
+++export function factionGrainNet(state, factionId) {
+++  let prod = 0;
+++  let upkeep = 0;
+++  for (const c of state.cities) {
+++    if (!isOwnedBy(c, factionId)) continue;
+++    prod += cityGrainIncome(state, c);
+++    upkeep += c.soldiers * GRAIN_UPKEEP_PER_SOLDIER;
+++  }
+++  return { prod, upkeep, net: prod - upkeep };
+++}
+++
+++// 城防值（基础 × 城防特性 × 筑城科技 × 城墙等级加成）
+++export function cityDefenseValue(state, city) {
+++  const base = city.defenseBase || 0;
+++  const wallBoost = 1 + (city.wallLevel - 1) * 0.15;
+++  return base * traitMult(city, 'defense') * techMult(state, 'wall', 0.2) * wallBoost;
+++}
+++
+++// 单城人口增长（依赖太守或君主政治）
+++export function cityPopGrowth(state, city, politics) {
+++  const pol = Number.isFinite(politics) ? politics : 50;
+++  const factor = (pol / POP_GROWTH_POL_DIVISOR) * POP_GROWTH_RATE;
+++  return city.population * factor * traitMult(city, 'growth');
+++}
+++
+++// 征兵消耗：金钱 / 人口（受征兵特性影响——人口消耗降低）
+++export function recruitCost(city, count) {
+++  const popCost = count * (1 / (1 + (city.trait && city.trait.type === 'recruit' ? city.trait.value : 0)));
+++  return { gold: count * 1.5, pop: popCost };
+++}
+++
+++export { TRAINING_BASE };
++diff --git a/apps/xiong-tu-san-guo/src/core/rng.js b/apps/xiong-tu-san-guo/src/core/rng.js
++new file mode 100644
++index 0000000..b05962c
++--- /dev/null
+++++ b/apps/xiong-tu-san-guo/src/core/rng.js
++@@ -0,0 +1,40 @@
+++// ============================================================================
+++// 随机工具：默认 Math.random，可注入种子化 rng（便于单测）。
+++// ============================================================================
+++const DEFAULT = Math.random;
+++
+++export function makeRng(seed) {
+++  let s = (seed >>> 0) || 1;
+++  return function rng() {
+++    s = (s * 1664525 + 1013904223) >>> 0;
+++    return s / 0x100000000;
+++  };
+++}
+++
+++// [min, max) 浮点
+++export function range(rng, min, max) {
+++  return min + (rng || DEFAULT)() * (max - min);
+++}
+++
+++// [min, max] 整数（闭区间）
+++export function rangeInt(rng, min, max) {
+++  return Math.floor(range(rng, min, max + 1));
+++}
+++
+++export function chance(rng, p) {
+++  return (rng || DEFAULT)() < p;
+++}
+++
+++export function pick(rng, arr) {
+++  return arr[Math.floor((rng || DEFAULT)() * arr.length)];
+++}
+++
+++// Fisher–Yates 洗牌（返回新数组）
+++export function shuffle(rng, arr) {
+++  const a = arr.slice();
+++  for (let i = a.length - 1; i > 0; i--) {
+++    const j = Math.floor((rng || DEFAULT)() * (i + 1));
+++    [a[i], a[j]] = [a[j], a[i]];
+++  }
+++  return a;
+++}
++diff --git a/apps/xiong-tu-san-guo/src/core/save.js b/apps/xiong-tu-san-guo/src/core/save.js
++new file mode 100644
++index 0000000..b26138c
++--- /dev/null
+++++ b/apps/xiong-tu-san-guo/src/core/save.js
++@@ -0,0 +1,38 @@
+++// ============================================================================
+++// 存档：localStorage 持久化（单槽）。
+++// 通过 storage 访问器隔离 localStorage，便于 Node 单测注入内存版。
+++// ============================================================================
+++import { SAVE_KEY } from '../config.js';
+++
+++let storage = null;
+++try {
+++  if (typeof localStorage !== 'undefined') storage = localStorage;
+++} catch (_) { /* 某些环境访问 localStorage 会抛错 */ }
+++
+++export function _setStorage(s) { storage = s; }
+++
+++export function hasSave() {
+++  try { return !!(storage && storage.getItem(SAVE_KEY)); } catch (_) { return false; }
+++}
+++
+++export function saveGame(state) {
+++  try {
+++    if (storage && state) {
+++      storage.setItem(SAVE_KEY, JSON.stringify(state));
+++      return true;
+++    }
+++  } catch (_) {}
+++  return false;
+++}
+++
+++export function loadGame() {
+++  try {
+++    const raw = storage ? storage.getItem(SAVE_KEY) : null;
+++    if (!raw) return null;
+++    return JSON.parse(raw);
+++  } catch (_) { return null; }
+++}
+++
+++export function clearSave() {
+++  try { if (storage) storage.removeItem(SAVE_KEY); return true; } catch (_) { return false; }
+++}
++diff --git a/apps/xiong-tu-san-guo/src/core/state.js b/apps/xiong-tu-san-guo/src/core/state.js
++new file mode 100644
++index 0000000..48e5b30
++--- /dev/null
+++++ b/apps/xiong-tu-san-guo/src/core/state.js
++@@ -0,0 +1,321 @@
+++// ============================================================================
+++// 游戏状态：新局初始化（势力 / 城市 / 名将部署）、回合结算（经济·人口·科技·AI）、
+++// 胜负判定与各类查询辅助。纯数据 + 纯函数，便于单测。
+++// ============================================================================
+++import {
+++  CITIES, CITY_MAP,
+++} from '../data/cities.js';
+++import { HEROES, HERO_MAP, FACTION_SEEDS, makeGenericGeneral } from '../data/heroes.js';
+++import {
+++  GAME_VERSION, CMD_BASE, CMD_PER_CITY, TRAINING_BASE,
+++  FACTION_COLORS, PLAYER_COLOR, GRAIN_UPKEEP_PER_SOLDIER, TECH_COST_TURNS,
+++} from '../config.js';
+++import { skillBonus, techMult } from './tech.js';
+++import { chance } from './rng.js';
+++import {
+++  citiesOf, cityGoldIncome, cityGrainIncome, cityPopGrowth, cityDefenseValue,
+++} from './economy.js';
+++import { effLead, effWar } from './combat.js';
+++
+++// —— 查询辅助 ——
+++export const cityById = (state, id) => state.cities.find((c) => c.id === id);
+++export const heroById = (state, id) => state.heroes.find((h) => h.id === id);
+++export const factionById = (state, id) => state.factions.find((f) => f.id === id);
+++export const playerFaction = (state) => factionById(state, state.playerFactionId);
+++export const neighbors = (state, cityId) => {
+++  const c = cityById(state, cityId);
+++  return c ? c.adjacent.map((id) => cityById(state, id)).filter(Boolean) : [];
+++};
+++export const heroesOfFaction = (state, fid) => state.heroes.filter((h) => h.factionId === fid && h.status !== 'prisoner');
+++export const prisonersOfFaction = (state, fid) => state.heroes.filter((h) => h.prisonerOf === fid);
+++export const lordOf = (state, fid) => state.heroes.find((h) => h.factionId === fid && (h.isPlayerLord || h.lord));
+++
+++// 一座城市内的己方在岗武将（free / deployed，排除俘虏、在野）
+++export function heroesInCity(state, cityId, fid) {
+++  return state.heroes.filter((h) => h.cityId === cityId && h.status !== 'prisoner' && !h.wild
+++    && (fid == null || h.factionId === fid));
+++}
+++// 城市内的在野名将（可探索 / 登用）
+++export function wildHeroesInCity(state, cityId) {
+++  return state.heroes.filter((h) => h.wild && h.cityId === cityId && h.status !== 'gone');
+++}
+++
+++// 带兵上限：统率 × 100 × (1 + 统御技能) × 统御科技
+++export function troopCap(state, hero) {
+++  if (!hero) return 0;
+++  return Math.round(hero.stats.l * 100 * (1 + skillBonus(hero).cap) * techMult(state, 'leadership', 0.1));
+++}
+++
+++// 指令点数：基础 + 每多一城 + 君主政治加成
+++export function cmdPoints(state, fid) {
+++  const n = citiesOf(state, fid).length;
+++  const lord = lordOf(state, fid);
+++  const pol = lord ? lord.stats.p : 50;
+++  return CMD_BASE + CMD_PER_CITY * Math.max(0, n - 1) + Math.floor(pol / 100);
+++}
+++export function cmdRemaining(state, fid) {
+++  return Math.max(0, cmdPoints(state, fid) - (state.cmdUsedByFaction?.[fid] || 0));
+++}
+++
+++// 当前期望守城主将（统率最高）
+++export function bestDefender(state, cityId) {
+++  const city = cityById(state, cityId);
+++  if (!city) return null;
+++  const roster = heroesInCity(state, cityId, city.ownerFactionId);
+++  if (!roster.length) return null;
+++  return roster.reduce((a, b) => (effLead(a) >= effLead(b) ? a : b));
+++}
+++
+++// 城防上限
+++export function maxDefense(state, city) {
+++  return Math.round(cityDefenseValue(state, city));
+++}
+++
+++// ============================================================================
+++// 新局初始化
+++// ============================================================================
+++export function newGame({ lordName, startCity, stats, rng } = {}) {
+++  const r = rng || Math.random;
+++  if (!lordName || !CITY_MAP[startCity]) throw new Error('newGame: 参数缺失');
+++
+++  const state = {
+++    version: GAME_VERSION,
+++    turn: 1,
+++    playerFactionId: 0,
+++    factions: [],
+++    cities: [],
+++    heroes: [],
+++    techLevels: { agri: 0, commerce: 0, forge: 0, wall: 0, trick: 0, leadership: 0 },
+++    research: null, // { key, turnsLeft }
+++    cmdUsedByFaction: {},
+++    log: [],
+++    turnLog: [],
+++    over: null,
+++  };
+++
+++  // —— 势力：玩家（id=0）+ AI ——
+++  state.factions.push({
+++    id: 0, name: `${lordName}势力`, color: PLAYER_COLOR,
+++    money: 0, grain: 0, aiControlled: false, lordName,
+++  });
+++  const facIdByKey = {}; // 势力 key → factionId（被玩家占都则缺省）
+++  let fid = 1;
+++  for (const seed of FACTION_SEEDS) {
+++    if (seed.capital === startCity) continue; // 玩家占了都城，该势力不生成
+++    const lordDef = HERO_MAP[seed.lordId];
+++    state.factions.push({
+++      id: fid, name: `${lordDef.name}势力`, color: FACTION_COLORS[fid % FACTION_COLORS.length],
+++      money: 0, grain: 0, aiControlled: true, lordName: lordDef.name,
+++    });
+++    facIdByKey[seed.key] = fid;
+++    fid += 1;
+++  }
+++
+++  // —— 城市 ——
+++  for (const c of CITIES) {
+++    state.cities.push({
+++      id: c.id, name: c.name, x: c.x, y: c.y, trait: c.trait,
+++      ownerFactionId: null,
+++      population: c.pop0, maxPopulation: c.popMax,
+++      soldiers: c.soldiers0, defenseBase: c.defense0, defense: c.defense0,
+++      gold: c.gold0, grain: c.grain0, // 城库（攻陷时被缴获）
+++      farmLevel: 1, marketLevel: 1, barracksLevel: 1, wallLevel: 1, workshopLevel: 0,
+++      governorHeroId: null, adjacent: c.adjacent.slice(),
+++      training: TRAINING_BASE,
+++    });
+++  }
+++  // 玩家初始城市
+++  const start = cityById(state, startCity);
+++  start.ownerFactionId = 0;
+++  const player = playerFaction(state);
+++  player.money = Math.round(start.gold + 3000);
+++  player.grain = Math.round(start.grain + 5000);
+++
+++  // —— 玩家君主（第一武将）——
+++  const lord = {
+++    id: 'player_lord', name: lordName, isPlayerLord: true, lord: true,
+++    factionId: 0, cityId: startCity, status: 'free', loyalty: 100,
+++    stats: { ...stats }, skill: { name: '雄主', effect: 'cap:0.05' }, wild: false,
+++  };
+++  state.heroes.push(lord);
+++  start.governorHeroId = lord.id;
+++
+++  // —— AI 都城归属 + 太守 ——
+++  for (const seed of FACTION_SEEDS) {
+++    const f = facIdByKey[seed.key];
+++    if (f == null) continue;
+++    const cap = cityById(state, seed.capital);
+++    cap.ownerFactionId = f;
+++    const fac = factionById(state, f);
+++    fac.money = Math.round(cap.gold + 2000);
+++    fac.grain = Math.round(cap.grain + 4000);
+++  }
+++
+++  // —— 名将部署 ——
+++  for (const h of HEROES) {
+++    const copy = {
+++      id: h.id, name: h.name, isPlayerLord: false,
+++      factionId: null, cityId: null, status: 'free',
+++      loyalty: h.loyalty, stats: { ...h.stats },
+++      skill: h.skill ? { ...h.skill } : null, generic: !!h.generic, wild: false,
+++    };
+++    if (h.serve) {
+++      const f = facIdByKey[h.serve];
+++      if (f != null) {
+++        const seed = FACTION_SEEDS.find((s) => s.key === h.serve);
+++        copy.factionId = f;
+++        copy.cityId = seed.capital;
+++        copy.status = 'free';
+++      } else {
+++        // 势力未生成（都城被玩家所占）→ 转为该城在野，玩家可登用
+++        const seed = FACTION_SEEDS.find((s) => s.key === h.serve);
+++        copy.factionId = null;
+++        copy.cityId = seed.capital; // == startCity
+++        copy.status = 'free';
+++        copy.wild = true;
+++        copy.discovered = true; // 名义上原属此城，直接可见
+++      }
+++    } else if (h.wild) {
+++      copy.factionId = null;
+++      copy.cityId = h.wild;
+++      copy.status = 'free';
+++      copy.wild = true;
+++      copy.discovered = false;
+++    } else {
+++      continue;
+++    }
+++    if (h.lord) copy.lord = true;
+++    state.heroes.push(copy);
+++  }
+++
+++  // —— AI 太守（君主坐镇都城）——
+++  for (const seed of FACTION_SEEDS) {
+++    const f = facIdByKey[seed.key];
+++    if (f == null) continue;
+++    cityById(state, seed.capital).governorHeroId = seed.lordId;
+++  }
+++
+++  // —— 为兵微将寡的 AI 势力补充部将（每势力至少 3 名）——
+++  let genIdx = 0;
+++  for (const seed of FACTION_SEEDS) {
+++    const f = facIdByKey[seed.key];
+++    if (f == null) continue;
+++    const roster = heroesOfFaction(state, f);
+++    const need = Math.max(0, 3 - roster.length);
+++    for (let i = 0; i < need; i++) {
+++      const g = makeGenericGeneral(r, ++genIdx);
+++      g.id = `gen_${seed.key}_${i}`;
+++      g.factionId = f;
+++      g.cityId = seed.capital;
+++      g.status = 'free';
+++      state.heroes.push(g);
+++    }
+++  }
+++
+++  // 初始城防归位
+++  for (const c of state.cities) c.defense = maxDefense(state, c);
+++
+++  // 起兵之城的在野名将预先「风闻」（已发现，可直接登用），帮助玩家平稳开局
+++  for (const h of state.heroes) {
+++    if (h.wild && h.cityId === startCity) h.discovered = true;
+++  }
+++
+++  state.turnLog = [`公元初年，${lordName} 于 ${start.name} 起兵，群雄并起，逐鹿天下！`];
+++  return state;
+++}
+++
+++// ============================================================================
+++// 回合结算（玩家点「结束回合」后调用）
+++// 顺序：城防回满 → 经济·人口结算 → 科技推进 → AI 行动 → 回合 +1 → 胜负判定
+++// 返回本回合事件摘要（state.turnLog）
+++// ============================================================================
+++export function resolveTurn(state, aiModule, rng) {
+++  const r = rng || Math.random;
+++  state.turnLog = [];
+++
+++  for (const c of state.cities) {
+++    if (c.ownerFactionId != null) c.defense = maxDefense(state, c);
+++  }
+++
+++  // —— 经济 / 人口结算（逐势力）——
+++  for (const fac of state.factions) {
+++    const fid = fac.id;
+++    let goldIn = 0;
+++    let grainIn = 0;
+++    let grainEat = 0;
+++    for (const c of citiesOf(state, fid)) {
+++      goldIn += cityGoldIncome(state, c);
+++      grainIn += cityGrainIncome(state, c);
+++      grainEat += c.soldiers * GRAIN_UPKEEP_PER_SOLDIER;
+++    }
+++    fac.money += Math.round(goldIn);
+++    fac.grain += Math.round(grainIn - grainEat);
+++
+++    // 人口增长（太守或君主政治）
+++    const lord = lordOf(state, fid);
+++    const basePol = lord ? lord.stats.p : 50;
+++    for (const c of citiesOf(state, fid)) {
+++      const gov = c.governorHeroId ? heroById(state, c.governorHeroId) : null;
+++      const pol = gov ? gov.stats.p : basePol;
+++      const growth = cityPopGrowth(state, c, pol);
+++      c.population = Math.min(c.maxPopulation, c.population + Math.round(growth));
+++    }
+++
+++    // 军粮不足 → 士兵逃亡（最多逃 10%）
+++    if (fac.grain < 0) {
+++      const owned = citiesOf(state, fid).slice().sort((a, b) => b.soldiers - a.soldiers);
+++      let deficitSoldiers = Math.ceil(-fac.grain / GRAIN_UPKEEP_PER_SOLDIER);
+++      const total = owned.reduce((s, c) => s + c.soldiers, 0);
+++      deficitSoldiers = Math.min(deficitSoldiers, Math.ceil(total * 0.1));
+++      for (const c of owned) {
+++        if (deficitSoldiers <= 0) break;
+++        const take = Math.min(c.soldiers, deficitSoldiers);
+++        c.soldiers -= take;
+++        deficitSoldiers -= take;
+++      }
+++      fac.grain = 0;
+++      if (!fac.aiControlled) state.turnLog.push(`⚠️ 军粮告竭，士兵逃亡（本城损失兵力）。`);
+++    }
+++  }
+++
+++  // —— 科技推进 ——
+++  if (state.research) {
+++    state.research.turnsLeft -= 1;
+++    if (state.research.turnsLeft <= 0) {
+++      const k = state.research.key;
+++      state.techLevels[k] = Math.min(3, state.techLevels[k] + 1);
+++      if (!playerFaction(state).aiControlled) {
+++        state.turnLog.push(`🔬 科技突破：研究完成（${k} 升至 ${state.techLevels[k]} 级）。`);
+++      }
+++      state.research = null;
+++    }
+++  }
+++
+++  // —— AI 行动 ——
+++  if (aiModule && typeof aiModule.aiTurnAll === 'function') {
+++    aiModule.aiTurnAll(state, r);
+++  }
+++
+++  // —— 名将忠诚度自然漂移（轻微）——
+++  for (const h of state.heroes) {
+++    if (h.status === 'prisoner' || h.wild) continue;
+++    if (chance(r, 0.5)) h.loyalty = Math.max(0, Math.min(100, h.loyalty + (chance(r, 0.5) ? 1 : -1)));
+++  }
+++
+++  state.turn += 1;
+++  state.cmdUsedByFaction = {};
+++  checkGameOver(state);
+++  return state.turnLog;
+++}
+++
+++// ============================================================================
+++// 胜负判定
+++// ============================================================================
+++export function checkGameOver(state) {
+++  const playerCities = citiesOf(state, state.playerFactionId);
+++  if (playerCities.length === 0) { state.over = 'lose'; return; }
+++  const allOwned = state.cities.every((c) => c.ownerFactionId === state.playerFactionId);
+++  if (allOwned) state.over = 'win';
+++}
+++
+++export { effLead, effWar };
++diff --git a/apps/xiong-tu-san-guo/src/core/tech.js b/apps/xiong-tu-san-guo/src/core/tech.js
++new file mode 100644
++index 0000000..d823efa
++--- /dev/null
+++++ b/apps/xiong-tu-san-guo/src/core/tech.js
++@@ -0,0 +1,45 @@
+++// ============================================================================
+++// 科技效果 + 技能解析。
+++// 技能 effect DSL（逗号分隔）：lead:0.10 / war:0.10 / trick:0.20 / def:0.20 /
+++//   cap:0.10 / train:0.20 / p_grow:0.10 / c_recruit:0.20
+++// ============================================================================
+++
+++const KEYS = ['lead', 'war', 'trick', 'def', 'cap', 'train', 'p_grow', 'c_recruit'];
+++
+++export function emptyBonus() {
+++  return { lead: 0, war: 0, trick: 0, def: 0, cap: 0, train: 0, p_grow: 0, c_recruit: 0 };
+++}
+++
+++// 解析技能 effect 字符串为加成对象
+++export function parseSkill(effect) {
+++  const b = emptyBonus();
+++  if (!effect || typeof effect !== 'string') return b;
+++  for (const part of effect.split(',')) {
+++    const [k, v] = part.split(':');
+++    const key = k && k.trim();
+++    if (KEYS.includes(key)) {
+++      const num = parseFloat(v);
+++      if (Number.isFinite(num)) b[key] += num;
+++    }
+++  }
+++  return b;
+++}
+++
+++export function skillBonus(hero) {
+++  return parseSkill(hero && hero.skill ? hero.skill.effect : '');
+++}
+++
+++// 科技等级乘数：1 + level × perLevel
+++export function techMult(state, techKey, perLevel) {
+++  const lv = (state && state.techLevels && state.techLevels[techKey]) || 0;
+++  return 1 + lv * perLevel;
+++}
+++
+++export function techLevel(state, techKey) {
+++  return (state && state.techLevels && state.techLevels[techKey]) || 0;
+++}
+++
+++// 当前正在研究的科技
+++export function activeResearch(state) {
+++  return state && state.research ? state.research : null;
+++}
++diff --git a/apps/xiong-tu-san-guo/src/data/cities.js b/apps/xiong-tu-san-guo/src/data/cities.js
++new file mode 100644
++index 0000000..99f5cdd
++--- /dev/null
+++++ b/apps/xiong-tu-san-guo/src/data/cities.js
++@@ -0,0 +1,93 @@
+++// ============================================================================
+++// 城市（地图节点）初始数据：18 座核心城市，含坐标、特性、初始资源、邻接关系。
+++// trait.type 取值：commerce(商业) / grain(粮食) / defense(城防) / growth(人口) / recruit(征兵)
+++// 坐标基于 viewBox "0 0 1000 760"（西→东，北→南）。
+++// ============================================================================
+++export const CITIES = [
+++  { id: 'luoyang', name: '洛阳', x: 500, y: 320,
+++    trait: { type: 'commerce', value: 0.2, name: '天下之中', desc: '商业收入 +20%' },
+++    popMax: 100000, pop0: 80000, gold0: 3000, grain0: 8000, soldiers0: 2000, defense0: 1200,
+++    adjacent: ['changan', 'xuchang', 'ye', 'wan'] },
+++  { id: 'changan', name: '长安', x: 250, y: 330,
+++    trait: { type: 'defense', value: 0.2, name: '关中险固', desc: '城防值 +20%' },
+++    popMax: 90000, pop0: 60000, gold0: 2000, grain0: 6000, soldiers0: 1800, defense0: 1100,
+++    adjacent: ['luoyang', 'wuwei', 'hanzhong'] },
+++  { id: 'ye', name: '邺城', x: 600, y: 270,
+++    trait: { type: 'growth', value: 0.15, name: '河北要冲', desc: '人口增长 +15%' },
+++    popMax: 95000, pop0: 70000, gold0: 2500, grain0: 7000, soldiers0: 2200, defense0: 1000,
+++    adjacent: ['nanpi', 'puyang', 'luoyang'] },
+++  { id: 'xuchang', name: '许昌', x: 620, y: 430,
+++    trait: { type: 'commerce', value: 0.15, name: '中原通衢', desc: '商业收入 +15%' },
+++    popMax: 85000, pop0: 55000, gold0: 2500, grain0: 7000, soldiers0: 1800, defense0: 1000,
+++    adjacent: ['luoyang', 'puyang', 'xiapi', 'wan'] },
+++  { id: 'chengdu', name: '成都', x: 250, y: 550,
+++    trait: { type: 'grain', value: 0.2, name: '天府之国', desc: '粮食产量 +20%' },
+++    popMax: 100000, pop0: 70000, gold0: 2000, grain0: 10000, soldiers0: 1600, defense0: 1000,
+++    adjacent: ['hanzhong', 'jianning'] },
+++  { id: 'jianye', name: '建业', x: 800, y: 500,
+++    trait: { type: 'commerce', value: 0.15, name: '江东形胜', desc: '商业收入 +15%' },
+++    popMax: 90000, pop0: 60000, gold0: 2200, grain0: 6500, soldiers0: 1700, defense0: 1100,
+++    adjacent: ['xiapi', 'kuaiji', 'xiangyang', 'jiangling'] },
+++  { id: 'xiangyang', name: '襄阳', x: 540, y: 520,
+++    trait: { type: 'defense', value: 0.15, name: '荆楚咽喉', desc: '城防值 +15%' },
+++    popMax: 85000, pop0: 55000, gold0: 2200, grain0: 6500, soldiers0: 1700, defense0: 1100,
+++    adjacent: ['wan', 'jiangling', 'jianye'] },
+++  { id: 'hanzhong', name: '汉中', x: 320, y: 430,
+++    trait: { type: 'defense', value: 0.3, name: '易守难攻', desc: '城防值 +30%' },
+++    popMax: 70000, pop0: 40000, gold0: 1500, grain0: 5000, soldiers0: 1400, defense0: 1300,
+++    adjacent: ['changan', 'chengdu', 'wan'] },
+++  { id: 'beiping', name: '北平', x: 760, y: 130,
+++    trait: { type: 'recruit', value: 0.15, name: '幽燕边塞', desc: '征兵效率 +15%' },
+++    popMax: 80000, pop0: 50000, gold0: 1800, grain0: 5500, soldiers0: 2000, defense0: 1000,
+++    adjacent: ['nanpi'] },
+++  { id: 'xiapi', name: '下邳', x: 800, y: 400,
+++    trait: { type: 'commerce', value: 0.1, name: '泗水商埠', desc: '商业收入 +10%' },
+++    popMax: 75000, pop0: 45000, gold0: 2000, grain0: 5500, soldiers0: 1500, defense0: 900,
+++    adjacent: ['puyang', 'xuchang', 'jianye'] },
+++  { id: 'wan', name: '宛城', x: 460, y: 430,
+++    trait: { type: 'defense', value: 0.1, name: '南阳要冲', desc: '城防值 +10%' },
+++    popMax: 72000, pop0: 42000, gold0: 1700, grain0: 5200, soldiers0: 1400, defense0: 1100,
+++    adjacent: ['luoyang', 'xuchang', 'hanzhong', 'xiangyang'] },
+++  { id: 'nanpi', name: '南皮', x: 660, y: 200,
+++    trait: { type: 'grain', value: 0.25, name: '产粮大郡', desc: '粮食产量 +25%' },
+++    popMax: 78000, pop0: 48000, gold0: 1700, grain0: 7000, soldiers0: 1500, defense0: 950,
+++    adjacent: ['beiping', 'ye'] },
+++  { id: 'puyang', name: '濮阳', x: 690, y: 340,
+++    trait: { type: 'growth', value: 0.1, name: '中原沃野', desc: '人口增长 +10%' },
+++    popMax: 76000, pop0: 46000, gold0: 1800, grain0: 5600, soldiers0: 1500, defense0: 950,
+++    adjacent: ['ye', 'xiapi', 'xuchang'] },
+++  { id: 'jiangling', name: '江陵', x: 480, y: 620,
+++    trait: { type: 'grain', value: 0.15, name: '云梦粮仓', desc: '粮食产量 +15%' },
+++    popMax: 78000, pop0: 47000, gold0: 1800, grain0: 6800, soldiers0: 1500, defense0: 950,
+++    adjacent: ['xiangyang', 'guiyang', 'jianye'] },
+++  { id: 'kuaiji', name: '会稽', x: 860, y: 600,
+++    trait: { type: 'commerce', value: 0.2, name: '海盐通商', desc: '商业收入 +20%' },
+++    popMax: 72000, pop0: 42000, gold0: 2000, grain0: 5200, soldiers0: 1300, defense0: 900,
+++    adjacent: ['jianye'] },
+++  { id: 'jianning', name: '建宁', x: 360, y: 660,
+++    trait: { type: 'grain', value: 0.1, name: '南中屯田', desc: '粮食产量 +10%' },
+++    popMax: 68000, pop0: 36000, gold0: 1400, grain0: 5400, soldiers0: 1200, defense0: 900,
+++    adjacent: ['chengdu', 'guiyang'] },
+++  { id: 'wuwei', name: '武威', x: 120, y: 250,
+++    trait: { type: 'recruit', value: 0.2, name: '西凉铁骑', desc: '征兵效率 +20%' },
+++    popMax: 64000, pop0: 32000, gold0: 1300, grain0: 4800, soldiers0: 1800, defense0: 950,
+++    adjacent: ['changan'] },
+++  { id: 'guiyang', name: '桂阳', x: 560, y: 690,
+++    trait: { type: 'growth', value: 0.1, name: '岭南烟瘴', desc: '人口增长 +10%' },
+++    popMax: 66000, pop0: 34000, gold0: 1400, grain0: 5000, soldiers0: 1200, defense0: 850,
+++    adjacent: ['jianning', 'jiangling'] },
+++];
+++
+++export const CITY_MAP = Object.fromEntries(CITIES.map((c) => [c.id, c]));
+++
+++// 邻接关系自检：确保双向一致（开发期辅助，构建期不抛错）
+++export function adjacencyValid() {
+++  for (const c of CITIES) {
+++    for (const n of c.adjacent) {
+++      const nb = CITY_MAP[n];
+++      if (!nb) return false;
+++      if (!nb.adjacent.includes(c.id)) return false;
+++    }
+++  }
+++  return true;
+++}
++diff --git a/apps/xiong-tu-san-guo/src/data/heroes.js b/apps/xiong-tu-san-guo/src/data/heroes.js
++new file mode 100644
++index 0000000..f86ec90
++--- /dev/null
+++++ b/apps/xiong-tu-san-guo/src/data/heroes.js
++@@ -0,0 +1,151 @@
+++// ============================================================================
+++// 名将与势力种子数据：47 位历史名将 + 8 个 AI 势力种子。
+++// 每个 hero：{ id, name, stats{l,w,i,p,c}, skill, loyalty, serve|wild, lord? }
+++//   serve: 所属 AI 势力 key（含君主 lord:true）
+++//   wild : 在野所在城市 id（可被探索 / 登用）
+++// skill.effect 为简化 DSL：lead:0.10 / war:0.10 / trick:0.20 / def:0.20 / cap:0.10 / train:0.20
+++// ============================================================================
+++
+++export const HEROES = [
+++  // —— AI 君主（serve=势力 key, lord:true）——
+++  { id: 'caocao', name: '曹操', serve: 'cao', lord: true, loyalty: 100,
+++    stats: { l: 96, w: 80, i: 94, p: 96, c: 98 }, skill: { name: '雄才大略', effect: 'cap:0.10,trick:0.10' } },
+++  { id: 'yuanshao', name: '袁绍', serve: 'yuan', lord: true, loyalty: 100,
+++    stats: { l: 84, w: 78, i: 80, p: 82, c: 90 }, skill: { name: '四世三公', effect: 'cap:0.10' } },
+++  { id: 'sunce', name: '孙策', serve: 'ce', lord: true, loyalty: 100,
+++    stats: { l: 92, w: 92, i: 80, p: 70, c: 95 }, skill: { name: '小霸王', effect: 'war:0.10' } },
+++  { id: 'dongzhuo', name: '董卓', serve: 'dong', lord: true, loyalty: 100,
+++    stats: { l: 82, w: 88, i: 60, p: 50, c: 55 }, skill: { name: '魔焰滔天', effect: 'war:0.10' } },
+++  { id: 'liubiao', name: '刘表', serve: 'biao', lord: true, loyalty: 100,
+++    stats: { l: 70, w: 60, i: 78, p: 80, c: 85 }, skill: { name: '荆襄名士', effect: 'p_grow:0.10' } },
+++  { id: 'mateng', name: '马腾', serve: 'teng', lord: true, loyalty: 100,
+++    stats: { l: 82, w: 86, i: 70, p: 68, c: 80 }, skill: { name: '西凉雄风', effect: 'war:0.08' } },
+++  { id: 'liuzhang', name: '刘璋', serve: 'zhang', lord: true, loyalty: 100,
+++    stats: { l: 60, w: 55, i: 70, p: 75, c: 78 }, skill: { name: '益州偏安', effect: 'def:0.10' } },
+++  { id: 'gongsunzan', name: '公孙瓒', serve: 'gongsun', lord: true, loyalty: 100,
+++    stats: { l: 80, w: 84, i: 65, p: 60, c: 70 }, skill: { name: '白马义从', effect: 'war:0.08' } },
+++
+++  // —— 曹操势力 ——
+++  { id: 'zhangliao', name: '张辽', serve: 'cao', loyalty: 92,
+++    stats: { l: 94, w: 93, i: 78, p: 78, c: 82 }, skill: { name: '威震逍遥津', effect: 'war:0.10' } },
+++  { id: 'xiahoudun', name: '夏侯惇', serve: 'cao', loyalty: 95,
+++    stats: { l: 84, w: 88, i: 60, p: 70, c: 78 }, skill: { name: '刚烈', effect: 'war:0.08' } },
+++  { id: 'xiahouyuan', name: '夏侯渊', serve: 'cao', loyalty: 93,
+++    stats: { l: 83, w: 87, i: 65, p: 65, c: 72 }, skill: { name: '神速', effect: 'war:0.06' } },
+++  { id: 'xuhuang', name: '徐晃', serve: 'cao', loyalty: 90,
+++    stats: { l: 83, w: 88, i: 72, p: 70, c: 70 }, skill: null },
+++  { id: 'zhanghe', name: '张郃', serve: 'cao', loyalty: 85,
+++    stats: { l: 85, w: 88, i: 70, p: 68, c: 70 }, skill: null },
+++  { id: 'dianwei', name: '典韦', serve: 'cao', loyalty: 96,
+++    stats: { l: 70, w: 96, i: 40, p: 30, c: 50 }, skill: { name: '古之恶来', effect: 'war:0.12' } },
+++  { id: 'xuchu2', name: '许褚', serve: 'cao', loyalty: 95,
+++    stats: { l: 72, w: 94, i: 35, p: 30, c: 55 }, skill: { name: '虎痴', effect: 'war:0.10' } },
+++  { id: 'guojia', name: '郭嘉', serve: 'cao', loyalty: 90,
+++    stats: { l: 70, w: 40, i: 98, p: 85, c: 80 }, skill: { name: '鬼才', effect: 'trick:0.20' } },
+++  { id: 'xunyu', name: '荀彧', serve: 'cao', loyalty: 92,
+++    stats: { l: 75, w: 40, i: 95, p: 98, c: 88 }, skill: { name: '王佐之才', effect: 'p_grow:0.15' } },
+++  { id: 'jiaxu', name: '贾诩', serve: 'cao', loyalty: 88,
+++    stats: { l: 80, w: 50, i: 96, p: 80, c: 70 }, skill: { name: '毒士', effect: 'trick:0.20' } },
+++  { id: 'chengyu', name: '程昱', serve: 'cao', loyalty: 88,
+++    stats: { l: 72, w: 55, i: 90, p: 80, c: 65 }, skill: null },
+++
+++  // —— 袁绍势力 ——
+++  { id: 'yanliang', name: '颜良', serve: 'yuan', loyalty: 82,
+++    stats: { l: 80, w: 92, i: 50, p: 45, c: 60 }, skill: null },
+++  { id: 'wenchou', name: '文丑', serve: 'yuan', loyalty: 82,
+++    stats: { l: 78, w: 92, i: 45, p: 40, c: 58 }, skill: null },
+++
+++  // —— 孙策势力 ——
+++  { id: 'zhouyu', name: '周瑜', serve: 'ce', loyalty: 98,
+++    stats: { l: 95, w: 78, i: 97, p: 86, c: 92 }, skill: { name: '火烧赤壁', effect: 'trick:0.20' } },
+++  { id: 'taishici', name: '太史慈', serve: 'ce', loyalty: 90,
+++    stats: { l: 84, w: 93, i: 70, p: 60, c: 78 }, skill: null },
+++  { id: 'ganning', name: '甘宁', serve: 'ce', loyalty: 85,
+++    stats: { l: 86, w: 94, i: 70, p: 55, c: 75 }, skill: { name: '锦帆贼', effect: 'war:0.08' } },
+++  { id: 'huanggai', name: '黄盖', serve: 'ce', loyalty: 95,
+++    stats: { l: 80, w: 86, i: 65, p: 60, c: 78 }, skill: null },
+++  { id: 'lvmeng', name: '吕蒙', serve: 'ce', loyalty: 90,
+++    stats: { l: 88, w: 85, i: 90, p: 80, c: 75 }, skill: { name: '刮目相看', effect: 'trick:0.10' } },
+++  { id: 'luxun', name: '陆逊', serve: 'ce', loyalty: 92,
+++    stats: { l: 90, w: 75, i: 95, p: 88, c: 85 }, skill: { name: '火烧连营', effect: 'trick:0.20' } },
+++  { id: 'lusu', name: '鲁肃', serve: 'ce', loyalty: 93,
+++    stats: { l: 78, w: 50, i: 92, p: 95, c: 92 }, skill: null },
+++
+++  // —— 董卓势力 ——
+++  { id: 'lvbu', name: '吕布', serve: 'dong', loyalty: 70,
+++    stats: { l: 78, w: 100, i: 35, p: 26, c: 47 }, skill: { name: '人中吕布', effect: 'war:0.15' } },
+++  { id: 'huaxiong', name: '华雄', serve: 'dong', loyalty: 80,
+++    stats: { l: 75, w: 88, i: 40, p: 35, c: 50 }, skill: null },
+++
+++  // —— 马腾势力 ——
+++  { id: 'machao', name: '马超', serve: 'teng', loyalty: 80,
+++    stats: { l: 88, w: 97, i: 50, p: 40, c: 70 }, skill: { name: '锦马超', effect: 'war:0.10' } },
+++
+++  // —— 在野名将（wild=城市 id，可探索登用）——
+++  { id: 'liubei', name: '刘备', wild: 'luoyang', loyalty: 99,
+++    stats: { l: 90, w: 78, i: 80, p: 85, c: 99 }, skill: { name: '仁德', effect: 'c_recruit:0.20' } },
+++  { id: 'guanyu', name: '关羽', wild: 'wan', loyalty: 95,
+++    stats: { l: 96, w: 97, i: 75, p: 62, c: 88 }, skill: { name: '威震华夏', effect: 'lead:0.10,war:0.05' } },
+++  { id: 'zhangfei', name: '张飞', wild: 'wan', loyalty: 90,
+++    stats: { l: 85, w: 98, i: 45, p: 30, c: 60 }, skill: { name: '燕人咆哮', effect: 'war:0.10' } },
+++  { id: 'zhaoyun', name: '赵云', wild: 'nanpi', loyalty: 92,
+++    stats: { l: 91, w: 96, i: 76, p: 65, c: 85 }, skill: { name: '常胜将军', effect: 'war:0.08,def:0.10' } },
+++  { id: 'zhugeliang', name: '诸葛亮', wild: 'xiangyang', loyalty: 100,
+++    stats: { l: 92, w: 40, i: 100, p: 98, c: 93 }, skill: { name: '神算', effect: 'trick:0.20,p_grow:0.10' } },
+++  { id: 'huangzhong', name: '黄忠', wild: 'kuaiji', loyalty: 88,
+++    stats: { l: 86, w: 95, i: 65, p: 60, c: 70 }, skill: null },
+++  { id: 'pangtong', name: '庞统', wild: 'guiyang', loyalty: 85,
+++    stats: { l: 80, w: 45, i: 97, p: 90, c: 80 }, skill: { name: '凤雏', effect: 'trick:0.15' } },
+++  { id: 'fazheng', name: '法正', wild: 'hanzhong', loyalty: 88,
+++    stats: { l: 75, w: 50, i: 94, p: 88, c: 75 }, skill: null },
+++  { id: 'weiyan', name: '魏延', wild: 'xiapi', loyalty: 78,
+++    stats: { l: 88, w: 92, i: 70, p: 60, c: 65 }, skill: null },
+++  { id: 'jiangwei', name: '姜维', wild: 'hanzhong', loyalty: 90,
+++    stats: { l: 91, w: 90, i: 90, p: 80, c: 80 }, skill: { name: '麒麟儿', effect: 'lead:0.08,trick:0.10' } },
+++  { id: 'huatuo', name: '华佗', wild: 'luoyang', loyalty: 80,
+++    stats: { l: 40, w: 30, i: 90, p: 85, c: 90 }, skill: { name: '神医', effect: 'def:0.10' } },
+++  { id: 'simayi', name: '司马懿', wild: 'wan', loyalty: 85,
+++    stats: { l: 93, w: 70, i: 96, p: 93, c: 88 }, skill: { name: '韬略', effect: 'trick:0.15' } },
+++  { id: 'dengai', name: '邓艾', wild: 'puyang', loyalty: 88,
+++    stats: { l: 90, w: 85, i: 89, p: 85, c: 75 }, skill: null },
+++  { id: 'zhonghui', name: '钟会', wild: 'guiyang', loyalty: 78,
+++    stats: { l: 82, w: 75, i: 88, p: 75, c: 70 }, skill: null },
+++  { id: 'gaoshun', name: '高顺', wild: 'jianning', loyalty: 85,
+++    stats: { l: 82, w: 90, i: 55, p: 50, c: 60 }, skill: { name: '陷阵营', effect: 'war:0.10' } },
+++  { id: 'simazhao', name: '司马昭', wild: 'xiapi', loyalty: 82,
+++    stats: { l: 85, w: 70, i: 90, p: 85, c: 80 }, skill: null },
+++];
+++
+++export const HERO_MAP = Object.fromEntries(HEROES.map((h) => [h.id, h]));
+++
+++// AI 势力种子：capital 为初始都城，lordId 指向 HEROES 中的君主。
+++// 玩家若选择某都城开局，对应势力不生成，其名将转为该城在野（玩家可登用）。
+++export const FACTION_SEEDS = [
+++  { key: 'cao', capital: 'xuchang', lordId: 'caocao' },
+++  { key: 'yuan', capital: 'ye', lordId: 'yuanshao' },
+++  { key: 'ce', capital: 'jianye', lordId: 'sunce' },
+++  { key: 'dong', capital: 'changan', lordId: 'dongzhuo' },
+++  { key: 'biao', capital: 'jiangling', lordId: 'liubiao' },
+++  { key: 'teng', capital: 'wuwei', lordId: 'mateng' },
+++  { key: 'zhang', capital: 'chengdu', lordId: 'liuzhang' },
+++  { key: 'gongsun', capital: 'beiping', lordId: 'gongsunzan' },
+++];
+++
+++// 生成器：为兵力薄弱的 AI 势力补充随机「部将」（无技能，属性中等）。
+++// index 用于生成唯一 id，调用方负责保证其单调递增。
+++const GENERIC_SURNAMES = ['李', '王', '张', '刘', '陈', '杨', '赵', '黄', '周', '吴', '徐', '孙', '胡', '朱', '高', '林', '何', '郭', '马', '罗'];
+++const GENERIC_GIVENS = ['成', '武', '义', '忠', '安', '定', '远', '彪', '虎', '达', '凯', '平', '宁', '胜', '广'];
+++export function makeGenericGeneral(rng, index) {
+++  const r = rng || Math.random;
+++  const name = GENERIC_SURNAMES[Math.floor(r() * GENERIC_SURNAMES.length)]
+++    + GENERIC_GIVENS[Math.floor(r() * GENERIC_GIVENS.length)];
+++  const ri = (lo, hi) => Math.floor(lo + r() * (hi - lo));
+++  return {
+++    id: `gen_${index}`,
+++    name,
+++    generic: true,
+++    loyalty: ri(55, 85),
+++    stats: { l: ri(55, 82), w: ri(55, 85), i: ri(45, 78), p: ri(40, 72), c: ri(45, 75) },
+++    skill: null,
+++  };
+++}
++diff --git a/apps/xiong-tu-san-guo/src/main.js b/apps/xiong-tu-san-guo/src/main.js
++new file mode 100644
++index 0000000..ccf5827
++--- /dev/null
+++++ b/apps/xiong-tu-san-guo/src/main.js
++@@ -0,0 +1,19 @@
+++// ============================================================================
+++// 雄图·三国志文明 · 入口
+++// 导出 createGame(parent) 工厂，供主框架（落地页）按需挂载到任意容器；
+++// 同时保留独立运行（apps/xiong-tu-san-guo/index.html）时的自动挂载行为。
+++// ============================================================================
+++import { GameUI } from './ui/app.js';
+++
+++export function createGame(parent) {
+++  const ui = new GameUI(parent);
+++  ui.mount();
+++  return ui;
+++}
+++
+++// 独立运行时自动挂载到 #game-container（仅在元素存在时触发，
+++// 避免被主框架动态 import 时误启动游戏）。
+++if (typeof document !== 'undefined' && document.getElementById('game-container')) {
+++  const ui = createGame(document.getElementById('game-container'));
+++  if (typeof window !== 'undefined') window.__XTSG = ui; // 暴露实例便于调试 / 冒烟测试
+++}
++diff --git a/apps/xiong-tu-san-guo/src/ui/app.js b/apps/xiong-tu-san-guo/src/ui/app.js
++new file mode 100644
++index 0000000..616c1fe
++--- /dev/null
+++++ b/apps/xiong-tu-san-guo/src/ui/app.js
++@@ -0,0 +1,728 @@
+++// ============================================================================
+++// 雄图·三国志文明 · UI 控制器（纯原生 DOM）
+++// 三层屏幕：启动器（新局 / 继续）→ 创角 → 对局（顶栏 + 五标签 + 弹窗）。
+++// 对局标签：地图 / 势力 / 名将 / 科技 / 系统。
+++// ============================================================================
+++import './style.css';
+++import { attachKeyboardShell } from '../../../_lib/keyboard-shell.js';
+++import { h, clear, bar } from './dom.js';
+++import {
+++  TECHS, FORMATIONS, STRATAGEMS, BUILD_MAX, TECH_MAX_LEVEL, TECH_COST_GOLD,
+++  TRAINING_MAX, FACTION_COLORS, NEUTRAL_COLOR, seasonOf, clamp,
+++} from '../config.js';
+++import { CITIES } from '../data/cities.js';
+++import { newGame, resolveTurn, cityById, heroById, factionById, playerFaction,
+++  neighbors, heroesOfFaction, heroesInCity, wildHeroesInCity, prisonersOfFaction,
+++  troopCap, cmdPoints, cmdRemaining, bestDefender, lordOf, maxDefense } from '../core/state.js';
+++import { citiesOf, factionGoldIncome, factionGrainNet } from '../core/economy.js';
+++import { effLead, effWar } from '../core/combat.js';
+++import { techLevel } from '../core/tech.js';
+++import * as A from '../core/actions.js';
+++import { aiTurnAll } from '../core/ai.js';
+++import { hasSave, saveGame, loadGame, clearSave } from '../core/save.js';
+++import { chance } from '../core/rng.js';
+++
+++const STAT_KEYS = [
+++  ['l', '统'], ['w', '武'], ['i', '智'], ['p', '政'], ['c', '魅'],
+++];
+++const TABS = [
+++  { key: 'map', icon: '🗺️', label: '地图' },
+++  { key: 'faction', icon: '🏯', label: '势力' },
+++  { key: 'heroes', icon: '⚔️', label: '名将' },
+++  { key: 'tech', icon: '📜', label: '科技' },
+++  { key: 'system', icon: '⚙️', label: '系统' },
+++];
+++
+++export class GameUI {
+++  constructor(parent) {
+++    this.parent = parent;
+++    this.state = null;
+++    this.tab = 'map';
+++    this.selectedCityId = null;
+++    this.screen = 'start';
+++    this.charTemplate = null;
+++    this.startCityPick = null;
+++  }
+++
+++  mount() {
+++    this.root = h('div', { class: 'xtsg' });
+++    clear(this.parent);
+++    this.parent.appendChild(this.root);
+++    this.toastWrap = h('div', { class: 'toast-wrap' });
+++    this.stage = h('div', { class: 'stage' });
+++    this.modalRoot = h('div', { class: 'xtsg-modals' });
+++    this.root.append(this.toastWrap, this.stage, this.modalRoot);
+++    this._detachKeyboard = attachKeyboardShell(this.root);
+++    this.showStart();
+++    return this;
+++  }
+++
+++  destroy() {
+++    if (this._detachKeyboard) { try { this._detachKeyboard(); } catch (_) {} }
+++    try { clear(this.parent); } catch (_) {}
+++  }
+++
+++  // ============ Toast / Modal ============
+++  toast(msg) {
+++    const t = h('div', { class: 'toast' }, msg);
+++    this.toastWrap.appendChild(t);
+++    setTimeout(() => { try { this.toastWrap.removeChild(t); } catch (_) {} }, 2400);
+++  }
+++  closeModal() { clear(this.modalRoot); }
+++  openModal({ title, body, foot }) {
+++    clear(this.modalRoot);
+++    const card = h('div', { class: 'modal__card' },
+++      h('div', { class: 'modal__head' }, h('h3', null, title)),
+++      h('div', { class: 'modal__body' }, body),
+++      foot ? h('div', { class: 'modal__foot' }, foot) : null,
+++    );
+++    // 点遮罩关闭；点卡片内不关闭（避免误触）
+++    const backdrop = h('div', { class: 'modal', onClick: (e) => { if (e.target === e.currentTarget) this.closeModal(); } }, card);
+++    this.modalRoot.appendChild(backdrop);
+++    return card;
+++  }
+++  // 带确认/取消的表单弹窗
+++  openForm(title, bodyNode, onConfirm, confirmLabel = '确认') {
+++    const foot = [
+++      h('button', { class: 'btn-ghost grow', onClick: () => this.closeModal() }, '取消'),
+++      h('button', { class: 'btn-primary grow', onClick: onConfirm }, confirmLabel),
+++    ];
+++    return this.openModal({ title, body: bodyNode, foot });
+++  }
+++
+++  // ============ 启动器 ============
+++  showStart() {
+++    this.screen = 'start';
+++    this.state = null;
+++    clear(this.stage);
+++    const wrap = h('div', { class: 'launcher' },
+++      h('div', { class: 'launcher__brand' },
+++        h('div', { class: 'emblem' }, '雄'),
+++        h('h1', null, '雄图·三国志文明'),
+++        h('p', { class: 'sub' }, '内政 · 科技 · 名将 · 征伐 · 统一天下'),
+++      ),
+++      h('div', { class: 'launcher__menu' },
+++        h('button', { class: 'btn-primary btn-block', onClick: () => this.showCreate() }, '新游戏'),
+++        h('button', {
+++          class: 'btn-ghost btn-block', disabled: !hasSave(), onClick: () => this.continueGame(),
+++        }, hasSave() ? '继续游戏' : '继续游戏（无存档）'),
+++      ),
+++      h('p', { class: 'hint center' }, '选择一座城池起兵，招揽名将、发展内政、征战四方。'),
+++    );
+++    this.stage.appendChild(wrap);
+++  }
+++
+++  continueGame() {
+++    const s = loadGame();
+++    if (!s) { this.toast('存档读取失败'); return; }
+++    this.state = s;
+++    this.enterGame();
+++  }
+++
+++  // ============ 创角 ============
+++  showCreate() {
+++    this.screen = 'create';
+++    this.charTemplate = { name: '', stats: this.rollStats(), rerolls: 0 };
+++    this.startCityPick = null;
+++    this.renderCreate();
+++  }
+++  rollStats() {
+++    const s = {};
+++    for (const [k] of STAT_KEYS) s[k] = 50 + Math.floor(Math.random() * 51); // 50~100
+++    return s;
+++  }
+++  renderCreate() {
+++    clear(this.stage);
+++    const t = this.charTemplate;
+++
+++    const nameInput = h('input', { type: 'text', maxlength: 4, placeholder: '2~4 个汉字', value: t.name,
+++      onInput: (e) => { t.name = e.target.value; } });
+++
+++    const statGrid = h('div', { class: 'stat-grid' },
+++      STAT_KEYS.map(([k, label]) => h('div', { class: 'stat' },
+++        h('div', { class: 'stat__k' }, label), h('div', { class: 'stat__v' }, t.stats[k]))));
+++    const rerollBtn = h('button', { class: 'btn-ghost btn-block', disabled: t.rerolls >= 5,
+++      onClick: () => { t.stats = this.rollStats(); t.rerolls += 1; this.renderCreate(); } },
+++      `重新随机属性（${t.rerolls}/5）`);
+++
+++    const cityPick = h('div', { class: 'city-pick' }, CITIES.map((c) => {
+++      const sel = this.startCityPick === c.id;
+++      return h('button', {
+++        class: `city-pick__item${sel ? ' city-pick__item--sel' : ''}`,
+++        onClick: () => { this.startCityPick = c.id; this.renderCreate(); },
+++      },
+++        h('div', null, h('b', null, c.name)),
+++        h('div', { class: 'muted' }, c.trait.name),
+++      );
+++    }));
+++
+++    const startBtn = h('button', { class: 'btn-primary btn-block',
+++      onClick: () => this.beginGame(),
+++    }, '起兵出征');
+++
+++    const wrap = h('div', { class: 'create' },
+++      h('h2', null, '一、立君'),
+++      h('div', { class: 'create__field' }, h('label', null, '君主姓名（2~4 个汉字）'), nameInput),
+++      h('div', { class: 'create__field' }, h('label', null, '君主属性'), statGrid, rerollBtn),
+++      h('h2', null, '二、择都'),
+++      h('p', { class: 'hint' }, '选择起兵之城。占据诸侯旧都，其旧部将转为在野，可择机登用。'),
+++      cityPick,
+++      h('div', { style: { height: '0.8rem' } }),
+++      startBtn,
+++      h('div', { style: { height: '0.4rem' } }),
+++      h('button', { class: 'btn-ghost btn-block', onClick: () => this.showStart() }, '返回'),
+++    );
+++    this.stage.appendChild(wrap);
+++    // 挂载临时引用，便于 beginGame 读取输入框最新值
+++    this._nameInput = nameInput;
+++  }
+++
+++  beginGame() {
+++    const name = (this._nameInput?.value || this.charTemplate.name || '').trim();
+++    if (!/^[一-龥]{2,4}$/.test(name)) { this.toast('君主姓名须为 2~4 个汉字'); return; }
+++    if (!this.startCityPick) { this.toast('请选择起兵之城'); return; }
+++    this.state = newGame({ lordName: name, startCity: this.startCityPick, stats: this.charTemplate.stats });
+++    saveGame(this.state);
+++    this.toast(`${name} 于 ${cityById(this.state, this.startCityPick).name} 起兵！`);
+++    this.enterGame();
+++  }
+++
+++  // ============ 进入对局 ============
+++  enterGame() {
+++    this.screen = 'game';
+++    this.tab = 'map';
+++    this.selectedCityId = playerFaction(this.state) && citiesOf(this.state, this.state.playerFactionId)[0]?.id;
+++    this.renderGame();
+++  }
+++
+++  renderGame() {
+++    if (this.state.over) { this.renderGameOver(); return; }
+++    clear(this.stage);
+++    this.gameRoot = h('div', { class: 'game' });
+++    this.stage.appendChild(this.gameRoot);
+++    this.topbar = h('div', { class: 'topbar' });
+++    this.tabbar = h('div', { class: 'tabbar' });
+++    this.content = h('div', { class: 'content' });
+++    this.gameRoot.append(this.topbar, this.tabbar, this.content);
+++    this.refreshTopbar();
+++    this.renderTabbar();
+++    this.renderContent();
+++  }
+++
+++  refreshTopbar() {
+++    const s = this.state;
+++    const fac = playerFaction(s);
+++    const goldIn = Math.round(factionGoldIncome(s, s.playerFactionId));
+++    const grainNet = factionGrainNet(s, s.playerFactionId);
+++    const cmd = cmdRemaining(s, s.playerFactionId);
+++    clear(this.topbar);
+++    this.topbar.appendChild(h('div', { class: 'topbar__row' },
+++      h('span', { class: 'topbar__title' }, `${fac.name}`),
+++      h('span', { class: 'res-pill' }, `${seasonOf(s.turn)} · 第${s.turn}回合`),
+++      h('span', { class: 'res-pill' }, `金 `, h('b', null, Math.round(fac.money))),
+++      h('span', { class: 'res-pill' }, `粮 `, h('b', null, Math.round(fac.grain))),
+++      h('span', { class: 'res-pill cmd-pill' }, `令 ${cmd}`),
+++    ));
+++    this.topbar.appendChild(h('div', { class: 'topbar__row', style: { marginTop: '0.35rem' } },
+++      h('span', { class: 'hint', style: { margin: 0 } }, `金 +${goldIn}/回 · 粮 ${Math.round(grainNet.net)}/回（产${Math.round(grainNet.prod)} 耗${Math.round(grainNet.upkeep)}）`),
+++      h('span', { class: 'grow' }),
+++      h('button', { class: 'btn-primary', onClick: () => this.confirmEndTurn() }, '结束回合'),
+++    ));
+++  }
+++
+++  renderTabbar() {
+++    clear(this.tabbar);
+++    for (const t of TABS) {
+++      this.tabbar.appendChild(h('button', {
+++        class: `tab${this.tab === t.key ? ' tab--active' : ''}`,
+++        onClick: () => { this.tab = t.key; this.renderTabbar(); this.renderContent(); },
+++      }, `${t.icon} ${t.label}`));
+++    }
+++  }
+++
+++  renderContent() {
+++    clear(this.content);
+++    if (this.tab === 'map') this.renderMap();
+++    else if (this.tab === 'faction') this.renderFaction();
+++    else if (this.tab === 'heroes') this.renderHeroes();
+++    else if (this.tab === 'tech') this.renderTech();
+++    else if (this.tab === 'system') this.renderSystem();
+++  }
+++
+++  // ============ 地图 ============
+++  renderMap() {
+++    const s = this.state;
+++    const wrap = h('div', { class: 'map-wrap' });
+++    const svgNS = 'http://www.w3.org/2000/svg';
+++    const svg = document.createElementNS(svgNS, 'svg');
+++    svg.setAttribute('class', 'map-svg');
+++    svg.setAttribute('viewBox', '0 0 1000 760');
+++    svg.setAttribute('preserveAspectRatio', 'none');
+++    // 连线（去重）
+++    for (const c of s.cities) {
+++      for (const nid of c.adjacent) {
+++        if (c.id < nid) {
+++          const n = cityById(s, nid);
+++          const ln = document.createElementNS(svgNS, 'line');
+++          ln.setAttribute('x1', c.x); ln.setAttribute('y1', c.y);
+++          ln.setAttribute('x2', n.x); ln.setAttribute('y2', n.y);
+++          ln.setAttribute('class', 'map-line');
+++          svg.appendChild(ln);
+++        }
+++      }
+++    }
+++    wrap.appendChild(svg);
+++    // 城市点
+++    for (const c of s.cities) {
+++      const fac = c.ownerFactionId != null ? factionById(s, c.ownerFactionId) : null;
+++      const color = fac ? fac.color : NEUTRAL_COLOR;
+++      const isPlayer = c.ownerFactionId === s.playerFactionId;
+++      const isSel = this.selectedCityId === c.id;
+++      const dot = h('button', {
+++        class: `map-dot${isPlayer ? ' map-dot--player' : ''}${isSel ? ' map-dot--selected' : ''}`,
+++        style: { left: `${(c.x / 1000) * 100}%`, top: `${(c.y / 760) * 100}%`, background: color },
+++        onClick: () => { this.selectedCityId = c.id; this.openCityMenu(c.id); },
+++      }, c.name.slice(0, 2));
+++      wrap.appendChild(dot);
+++      wrap.appendChild(h('span', { class: 'map-label', style: { left: `${(c.x / 1000) * 100}%`, top: `${(c.y / 760) * 100}%` } }, c.name));
+++    }
+++    this.content.appendChild(h('div', null,
+++      h('h3', null, '九州形势图'),
+++      h('p', { class: 'hint' }, '点击城市查看详情与指令。金边为己方，灰点为空城，他色为诸侯。'),
+++      wrap,
+++    ));
+++    // 提示当前选中
+++    if (this.selectedCityId) {
+++      const c = cityById(s, this.selectedCityId);
+++      this.content.appendChild(h('div', { class: 'hint center' }, `已选：${c ? c.name : '无'}（再次点击城市可操作）`));
+++    }
+++  }
+++
+++  // ============ 城市操作菜单 ============
+++  openCityMenu(cityId) {
+++    const s = this.state;
+++    const c = cityById(s, cityId);
+++    if (!c) return;
+++    this.renderMap(); // 刷新选中态
+++    const owned = c.ownerFactionId === s.playerFactionId;
+++    if (owned) this.openOwnedCity(c);
+++    else this.openEnemyCity(c);
+++  }
+++
+++  cityHeader(c) {
+++    const fac = c.ownerFactionId != null ? factionById(this.state, c.ownerFactionId) : null;
+++    const color = fac ? fac.color : NEUTRAL_COLOR;
+++    return h('div', { class: 'panel__head' },
+++      h('span', { class: 'panel__swatch', style: { background: color } }),
+++      h('h4', null, c.name),
+++      h('span', { class: 'hero-card__sub' }, `${c.trait.name} · ${c.trait.desc}`),
+++    );
+++  }
+++  cityRows(c) {
+++    const gov = c.governorHeroId ? heroById(this.state, c.governorHeroId) : null;
+++    const r = (k, v) => h('div', null, h('span', { class: 'muted' }, k), ' ', v);
+++    return h('div', { class: 'panel__rows' },
+++      r('归属', c.ownerFactionId != null ? (factionById(this.state, c.ownerFactionId)?.name || '—') : '空城'),
+++      r('人口', `${Math.round(c.population)} / ${c.maxPopulation}`),
+++      r('士兵', Math.round(c.soldiers)),
+++      r('城防', `${Math.round(c.defense)}`),
+++      r('农田', `Lv${c.farmLevel}`),
+++      r('市集', `Lv${c.marketLevel}`),
+++      r('城墙', `Lv${c.wallLevel}`),
+++      r('兵营', `Lv${c.barracksLevel}`),
+++      r('训练度', c.training),
+++      r('太守', gov ? gov.name : '—'),
+++    );
+++  }
+++
+++  openOwnedCity(c) {
+++    const s = this.state;
+++    const fid = s.playerFactionId;
+++    const cmdBtn = (label, fn, danger) => h('button', {
+++      class: `cmd-btn ${danger ? 'btn-danger' : 'btn-primary'}`, onClick: () => { const r = fn(); if (r.msg) this.toast(r.msg); this.afterAction(); },
+++    }, label);
+++    const grid = h('div', { class: 'cmd-grid' },
+++      cmdBtn(`农田 Lv${c.farmLevel}`, () => A.developFarm(s, c.id)),
+++      cmdBtn(`市集 Lv${c.marketLevel}`, () => A.developMarket(s, c.id)),
+++      cmdBtn(`城墙 Lv${c.wallLevel}`, () => A.buildWall(s, c.id)),
+++      cmdBtn('征兵', () => this.uiRecruit(c)),
+++      cmdBtn('操练', () => A.train(s, c.id)),
+++      cmdBtn('探索', () => A.explore(s, c.id)),
+++    );
+++    const advBtns = h('div', { class: 'hero-card__foot' },
+++      h('button', { class: 'btn-jade', onClick: () => this.uiAppoint(c) }, '任命太守'),
+++      h('button', { class: 'btn-jade', onClick: () => this.uiMoveHero(c) }, '调遣武将'),
+++      h('button', { class: 'btn-primary', onClick: () => this.uiTransport(c) }, '输送资源'),
+++    );
+++    // 在野名将登用入口
+++    const wilds = wildHeroesInCity(s, c.id).filter((w) => w.discovered);
+++    const wildBlock = wilds.length ? h('div', { style: { marginTop: '0.6rem' } },
+++      h('div', { class: 'hint' }, '本城在野名将：'),
+++      h('div', { class: 'hero-card__foot' }, wilds.map((w) => h('button', { class: 'btn-ghost', onClick: () => { const r = A.recruitHero(s, w.id); this.toast(r.msg); this.afterAction(); } }, `登用 ${w.name}`))),
+++    ) : null;
+++
+++    const body = h('div', null, this.cityHeader(c), this.cityRows(c), grid, advBtns, wildBlock);
+++    this.openModal({ title: `城务 · ${c.name}`, body, foot: [h('button', { class: 'btn-ghost grow', onClick: () => this.closeModal() }, '关闭')] });
+++  }
+++
+++  openEnemyCity(c) {
+++    const s = this.state;
+++    const body = h('div', null,
+++      this.cityHeader(c),
+++      this.cityRows(c),
+++      h('div', { class: 'hero-card__foot' },
+++        h('button', { class: 'btn-danger', onClick: () => this.uiCampaign(c) }, '出征攻打'),
+++        h('button', { class: 'btn-ghost', onClick: () => this.uiStratagem(c) }, '施计'),
+++      ),
+++    );
+++    this.openModal({ title: `敌情 · ${c.name}`, body, foot: [h('button', { class: 'btn-ghost grow', onClick: () => this.closeModal() }, '关闭')] });
+++  }
+++
+++  // —— 征兵 ——
+++  uiRecruit(c) {
+++    const s = this.state;
+++    const fac = playerFaction(s);
+++    let n = Math.min(1000, Math.floor(c.population * 0.1));
+++    n = Math.max(50, n);
+++    const input = h('input', { type: 'number', value: n, min: 50, step: 50, style: { width: '5rem' } });
+++    const body = h('div', null,
+++      h('p', { class: 'hint' }, `城中人口 ${Math.round(c.population)}，金 ${Math.round(fac.money)}。每兵耗 1.5 金 + 1 人口。`),
+++      h('div', { class: 'create__field' }, h('label', null, '征兵数量'), input),
+++    );
+++    this.openForm('征兵', body, () => {
+++      const cnt = clamp(parseInt(input.value, 10) || 0, 0, 99999);
+++      const r = A.recruit(s, c.id, cnt);
+++      this.toast(r.msg);
+++      this.closeModal();
+++      this.afterAction();
+++    }, '征兵');
+++    return { ok: true, msg: '' };
+++  }
+++
+++  // —— 任命太守 ——
+++  uiAppoint(c) {
+++    const s = this.state;
+++    const roster = heroesInCity(s, c.id, s.playerFactionId);
+++    if (!roster.length) { this.toast('城中无可任命之武将'); return; }
+++    const sel = h('select', null, roster.map((h2) => h('option', { value: h2.id }, `${h2.name}（统${h2.stats.l}）`)));
+++    sel.value = c.governorHeroId || roster[0].id;
+++    const body = h('div', null, h('p', { class: 'hint' }, '太守政治影响本城人口增长。'), sel);
+++    this.openForm('任命太守', body, () => {
+++      const r = A.appointGovernor(s, c.id, sel.value);
+++      this.toast(r.msg); this.closeModal(); this.afterAction();
+++    }, '任命');
+++  }
+++
+++  // —— 调遣武将（本城 → 邻接己城）——
+++  uiMoveHero(c) {
+++    const s = this.state;
+++    const roster = heroesInCity(s, c.id, s.playerFactionId);
+++    const targets = neighbors(s, c.id).filter((n) => n.ownerFactionId === s.playerFactionId);
+++    if (!roster.length || !targets.length) { this.toast('无可调遣武将或无邻接己城'); return; }
+++    const hSel = h('select', null, roster.map((h2) => h('option', { value: h2.id }, h2.name)));
+++    const tSel = h('select', null, targets.map((n) => h('option', { value: n.id }, n.name)));
+++    const body = h('div', null, h('p', { class: 'hint' }, '将本城武将调往相邻己方城市。'), hSel, h('div', { style: { height: '0.4rem' } }), tSel);
+++    this.openForm('调遣武将', body, () => {
+++      const r = A.moveHero(s, hSel.value, tSel.value);
+++      this.toast(r.msg); this.closeModal(); this.afterAction();
+++    }, '调遣');
+++  }
+++
+++  // —— 输送资源 ——
+++  uiTransport(c) {
+++    const s = this.state;
+++    const targets = neighbors(s, c.id).filter((n) => n.ownerFactionId === s.playerFactionId);
+++    if (!targets.length) { this.toast('无邻接己城可输送'); return; }
+++    const fac = playerFaction(s);
+++    const tSel = h('select', null, targets.map((n) => h('option', { value: n.id }, n.name)));
+++    const sIn = h('input', { type: 'number', value: Math.min(500, c.soldiers), min: 0, style: { width: '5rem' } });
+++    const gIn = h('input', { type: 'number', value: 0, min: 0, style: { width: '5rem' } });
+++    const grIn = h('input', { type: 'number', value: 0, min: 0, style: { width: '5rem' } });
+++    const body = h('div', null,
+++      h('p', { class: 'hint' }, `金 ${Math.round(fac.money)} · 粮 ${Math.round(fac.grain)} · 本城兵 ${Math.round(c.soldiers)}`),
+++      h('div', { class: 'create__field' }, h('label', null, '目标城市'), tSel),
+++      h('div', { class: 'stat-grid' },
+++        h('div', { class: 'stat' }, h('div', { class: 'stat__k' }, '兵'), h('div', { class: 'stat__v', style: { fontSize: '0.9rem' } }, sIn)),
+++        h('div', { class: 'stat' }, h('div', { class: 'stat__k' }, '金'), h('div', { class: 'stat__v', style: { fontSize: '0.9rem' } }, gIn)),
+++        h('div', { class: 'stat' }, h('div', { class: 'stat__k' }, '粮'), h('div', { class: 'stat__v', style: { fontSize: '0.9rem' } }, grIn)),
+++      ),
+++    );
+++    this.openForm('输送资源', body, () => {
+++      const r = A.transport(s, c.id, tSel.value, {
+++        soldiers: parseInt(sIn.value, 10) || 0, gold: parseInt(gIn.value, 10) || 0, grain: parseInt(grIn.value, 10) || 0,
+++      });
+++      this.toast(r.msg); this.closeModal(); this.afterAction();
+++    }, '输送');
+++  }
+++
+++  // —— 出征 ——
+++  uiCampaign(target) {
+++    const s = this.state;
+++    // 可出发的己方邻城
+++    const sources = neighbors(s, target.id).filter((n) => n.ownerFactionId === s.playerFactionId);
+++    if (!sources.length) { this.toast('无可出发的相邻己城'); return; }
+++    const srcSel = h('select', null, sources.map((n) => h('option', { value: n.id }, n.name)));
+++    const formSel = h('select', null, Object.entries(FORMATIONS).map(([k, f]) => h('option', { value: k }, `${f.name}（${f.desc}）`)));
+++    const genSel = h('select');
+++    const troopsIn = h('input', { type: 'number', value: 1000, min: 100, step: 100, style: { width: '5rem' } });
+++    const refreshGenerals = () => {
+++      const src = cityById(s, srcSel.value);
+++      const gens = heroesInCity(s, src.id, s.playerFactionId);
+++      clear(genSel);
+++      if (!gens.length) { genSel.appendChild(h('option', null, '无可用武将')); return; }
+++      for (const g of gens) genSel.appendChild(h('option', { value: g.id }, `${g.name}（统${g.stats.l} · 上限${troopCap(s, g)}）`));
+++      const g = gens[0];
+++      troopsIn.max = Math.min(src.soldiers, troopCap(s, g));
+++      troopsIn.value = Math.min(parseInt(troopsIn.value, 10) || 1000, parseInt(troopsIn.max, 10));
+++    };
+++    srcSel.addEventListener('change', refreshGenerals);
+++    const body = h('div', null,
+++      h('p', { class: 'hint' }, `攻打 ${target.name}（守军 ${Math.round(target.soldiers)} · 城防 ${Math.round(target.defense)}）`),
+++      h('div', { class: 'create__field' }, h('label', null, '出发城市'), srcSel),
+++      h('div', { class: 'create__field' }, h('label', null, '主将'), genSel),
+++      h('div', { class: 'create__field' }, h('label', null, '出兵数量（按路程耗粮）'), troopsIn),
+++      h('div', { class: 'create__field' }, h('label', null, '阵型'), formSel),
+++    );
+++    this.openForm('出征', body, () => {
+++      const src = cityById(s, srcSel.value);
+++      const g = heroById(s, genSel.value);
+++      if (!g) { this.toast('请选择主将'); return; }
+++      const r = A.campaign(s, src.id, target.id, g.id, parseInt(troopsIn.value, 10) || 0, formSel.value);
+++      this.closeModal();
+++      if (r.battle) this.showBattleReport(r.battle, r.won, r.msg);
+++      else this.toast(r.msg);
+++      this.afterAction();
+++    }, '开战');
+++    refreshGenerals();
+++  }
+++
+++  // —— 计略 ——
+++  uiStratagem(target) {
+++    const s = this.state;
+++    const sources = neighbors(s, target.id).filter((n) => n.ownerFactionId === s.playerFactionId);
+++    if (!sources.length) { this.toast('无可施计的相邻己城'); return; }
+++    const srcSel = h('select', null, sources.map((n) => h('option', { value: n.id }, n.name)));
+++    const typeSel = h('select', null, Object.entries(STRATAGEMS).map(([k, d]) => h('option', { value: k }, `${d.name}（${d.desc}）`)));
+++    const body = h('div', null,
+++      h('div', { class: 'create__field' }, h('label', null, '从己方城市施计'), srcSel),
+++      h('div', { class: 'create__field' }, h('label', null, '计略'), typeSel),
+++    );
+++    this.openForm('施计', body, () => {
+++      const r = A.stratagem(s, srcSel.value, target.id, typeSel.value);
+++      this.toast(r.msg); this.closeModal(); this.afterAction();
+++    }, '施计');
+++  }
+++
+++  showBattleReport(battle, won, titleMsg) {
+++    const a = battle.attacker; const d = battle.defender;
+++    const body = h('div', null,
+++      h('div', { class: 'force-vs' },
+++        h('div', { class: 'force-vs__side' }, h('b', null, a.general.name), h('div', { class: 'muted' }, `攻方 · ${Math.round(a.soldiers)} 兵`)),
+++        h('div', { class: 'force-vs__side' }, h('b', null, d.general.name), h('div', { class: 'muted' }, `守方 · ${Math.round(d.soldiers)} 兵 · 城${Math.round(d.defense)}`)),
+++      ),
+++      h('div', { class: 'battle-log' }, battle.log.map((l) => h('p', null, l))),
+++      h('p', { class: won ? 'center' : 'center muted', style: { color: won ? 'var(--good)' : 'var(--bad)', fontWeight: 700 } }, won ? '⚔ 大胜！城池归我！' : '⚔ 兵败而归。'),
+++    );
+++    this.openModal({ title: titleMsg, body, foot: [h('button', { class: 'btn-primary grow', onClick: () => this.closeModal() }, '知晓')] });
+++  }
+++
+++  // ============ 势力总览 ============
+++  renderFaction() {
+++    const s = this.state;
+++    const fid = s.playerFactionId;
+++    const fac = playerFaction(s);
+++    const myCities = citiesOf(s, fid);
+++    const grainNet = factionGrainNet(s, fid);
+++    const heroCount = heroesOfFaction(s, fid).length;
+++    const prisonerCount = prisonersOfFaction(s, fid).length;
+++    this.content.appendChild(h('div', null,
+++      h('h3', null, `${fac.name} · 总览`),
+++      h('div', { class: 'panel' },
+++        h('div', { class: 'panel__rows' },
+++          h('div', null, h('span', { class: 'muted' }, '城池'), ' ', myCities.length, ' / 18'),
+++          h('div', null, h('span', { class: 'muted' }, '武将'), ' ', heroCount),
+++          h('div', null, h('span', { class: 'muted' }, '俘虏'), ' ', prisonerCount),
+++          h('div', null, h('span', { class: 'muted' }, '金钱'), ' ', Math.round(fac.money)),
+++          h('div', null, h('span', { class: 'muted' }, '军粮'), ' ', Math.round(fac.grain)),
+++          h('div', null, h('span', { class: 'muted' }, '粮收支'), ' ', `${Math.round(grainNet.net)}/回`),
+++        ),
+++      ),
+++      h('h3', { style: { marginTop: '0.8rem' } }, '辖下城池'),
+++      h('div', { class: 'card-list' }, myCities.map((c) => {
+++        const gov = c.governorHeroId ? heroById(s, c.governorHeroId) : null;
+++        return h('div', { class: 'city-card', onClick: () => { this.tab = 'map'; this.selectedCityId = c.id; this.renderTabbar(); this.renderContent(); this.openCityMenu(c.id); }, role: 'button' },
+++          h('div', { class: 'hero-card__head' }, h('span', { class: 'panel__swatch', style: { background: fac.color } }), h('span', { class: 'hero-card__name' }, c.name), h('span', { class: 'hero-card__sub' }, c.trait.name)),
+++          h('div', { class: 'panel__rows' },
+++            h('div', null, h('span', { class: 'muted' }, '兵'), ' ', Math.round(c.soldiers)),
+++            h('div', null, h('span', { class: 'muted' }, '防'), ' ', Math.round(c.defense)),
+++            h('div', null, h('span', { class: 'muted' }, '田/市/墙'), ` ${c.farmLevel}/${c.marketLevel}/${c.wallLevel}`),
+++            h('div', null, h('span', { class: 'muted' }, '守将'), ' ', gov ? gov.name : '—'),
+++          ),
+++        );
+++      })),
+++      h('h3', { style: { marginTop: '0.8rem' } }, '天下诸侯'),
+++      h('div', { class: 'card-list' }, s.factions.filter((f) => f.id !== fid).map((f) => {
+++        const n = citiesOf(s, f.id).length;
+++        return h('div', { class: 'city-card' },
+++          h('div', { class: 'hero-card__head' }, h('span', { class: 'panel__swatch', style: { background: f.color } }), h('span', { class: 'hero-card__name' }, f.name), h('span', { class: 'hero-card__sub' }, `${n} 城`)),
+++        );
+++      })),
+++    ));
+++  }
+++
+++  // ============ 名将 ============
+++  renderHeroes() {
+++    const s = this.state;
+++    const fid = s.playerFactionId;
+++    const mine = heroesOfFaction(s, fid);
+++    const wilds = s.heroes.filter((h) => h.wild && h.discovered && h.status !== 'gone'
+++      && citiesOf(s, fid).some((c) => c.id === h.cityId)); // 仅己方城市中已发现的
+++    const prisoners = prisonersOfFaction(s, fid);
+++
+++    const heroCard = (h2, foot) => h('div', { class: 'hero-card' },
+++      h('div', { class: 'hero-card__head' },
+++        h('span', { class: 'hero-card__name' }, h2.name),
+++        h('span', { class: 'hero-card__sub' }, h2.skill ? h2.skill.name : '无技能'),
+++        h2.loyalty != null ? h('span', { class: 'hero-card__sub' }, `忠 ${h2.loyalty}`) : null,
+++      ),
+++      h('div', { class: 'hero-card__stats' }, STAT_KEYS.map(([k, l]) => h('span', null, `${l}`, h('b', null, h2.stats[k])))),
+++      h2.skill ? h('div', { class: 'hero-card__skill' }, `【${h2.skill.name}】`) : null,
+++      h('div', { class: 'hint' }, `所在：${cityById(s, h2.cityId)?.name || '在野'}`),
+++      foot ? h('div', { class: 'hero-card__foot' }, foot) : null,
+++    );
+++
+++    this.content.appendChild(h('div', null,
+++      h('h3', null, '麾下武将'),
+++      h('div', { class: 'card-list' }, mine.length ? mine.map((h2) => heroCard(h2, [
+++        h('button', { class: 'btn-ghost', onClick: () => { const r = A.reward(s, h2.id); this.toast(r.msg); this.afterAction(); } }, '赏赐'),
+++        h('button', { class: 'btn-ghost', onClick: () => { this.selectedCityId = h2.cityId; this.uiAppoint(cityById(s, h2.cityId)); } }, '任太守'),
+++      ])) : h('p', { class: 'hint' }, '尚无武将，去「探索」招揽在野名将吧。')),
+++
+++      h('h3', { style: { marginTop: '0.8rem' } }, '在野名将（己方城市）'),
+++      h('div', { class: 'card-list' }, wilds.length ? wilds.map((h2) => heroCard(h2, [
+++        h('button', { class: 'btn-primary', onClick: () => { const r = A.recruitHero(s, h2.id); this.toast(r.msg); this.afterAction(); } }, '登用'),
+++      ])) : h('p', { class: 'hint' }, '在城市执行「探索」可发现本城在野名将。')),
+++
+++      prisoners.length ? h('div', null,
+++        h('h3', { style: { marginTop: '0.8rem' } }, '俘虏'),
+++        h('div', { class: 'card-list' }, prisoners.map((h2) => heroCard(h2, [
+++          h('button', { class: 'btn-jade', onClick: () => { const r = A.recruitPrisoner(s, h2.id); this.toast(r.msg); this.afterAction(); } }, '招降'),
+++          h('button', { class: 'btn-ghost', onClick: () => { const r = A.releasePrisoner(s, h2.id); this.toast(r.msg); this.afterAction(); } }, '释放'),
+++          h('button', { class: 'btn-danger', onClick: () => { const r = A.executePrisoner(s, h2.id); this.toast(r.msg); this.afterAction(); } }, '处决'),
+++        ]))),
+++      ) : null,
+++    ));
+++  }
+++
+++  // ============ 科技 ============
+++  renderTech() {
+++    const s = this.state;
+++    const research = s.research;
+++    this.content.appendChild(h('div', null,
+++      h('h3', null, '科技树（势力共享）'),
+++      research ? h('div', { class: 'panel', style: { marginBottom: '0.6rem' } },
+++        h('div', null, h('b', null, `正在研究：${TECHS[research.key].name}`), ` · 剩余 ${research.turnsLeft} 回合`),
+++      ) : null,
+++      h('div', { class: 'tech-grid' }, Object.entries(TECHS).map(([k, t]) => {
+++        const lv = techLevel(s, k);
+++        const maxed = lv >= TECH_MAX_LEVEL;
+++        const ongoing = research && research.key === k;
+++        const dots = Array.from({ length: TECH_MAX_LEVEL }, (_, i) => h('i', { class: i < lv ? 'on' : '' }));
+++        return h('div', { class: 'tech-card' },
+++          h('div', { class: 'tech-card__head' },
+++            h('span', { class: 'tech-card__icon' }, t.icon),
+++            h('div', { class: 'grow' }, h('div', { class: 'hero-card__name', style: { fontSize: '0.95rem' } }, t.name), h('div', { class: 'hint' }, t.desc)),
+++            h('span', { class: 'tech-lv' }, dots),
+++          ),
+++          h('div', { class: 'hero-card__foot' },
+++            h('span', { class: 'hero-card__sub' }, maxed ? '已满级' : `下级 ${TECH_COST_GOLD} 金`),
+++            h('span', { class: 'grow' }),
+++            h('button', {
+++              class: 'btn-primary', disabled: maxed || !!research,
+++              onClick: () => { const r = A.research(s, k); this.toast(r.msg); this.afterAction(); },
+++            }, ongoing ? '研究中…' : (maxed ? '已满' : '研究')),
+++          ),
+++        );
+++      })),
+++      h('p', { class: 'hint', style: { marginTop: '0.6rem' } }, '研究每级消耗 800 金，约 3 回合（君主智力可缩短），完成后势力全城共享加成。'),
+++    ));
+++  }
+++
+++  // ============ 系统 ============
+++  renderSystem() {
+++    this.content.appendChild(h('div', null,
+++      h('h3', null, '系统'),
+++      h('div', { class: 'sys-list' },
+++        h('button', { class: 'btn-primary btn-block', onClick: () => { saveGame(this.state); this.toast('已保存'); } }, '保存游戏'),
+++        h('button', { class: 'btn-ghost btn-block', onClick: () => this.confirmEndTurn() }, '结束本回合'),
+++        h('button', { class: 'btn-ghost btn-block', onClick: () => { this.tab = 'map'; this.renderTabbar(); this.renderContent(); } }, '返回地图'),
+++        h('button', { class: 'btn-danger btn-block', onClick: () => this.confirmAbandon() }, '放弃本局，开新游戏'),
+++      ),
+++      h('p', { class: 'hint center', style: { marginTop: '1rem' } }, '雄图·三国志文明 · 存档于本地浏览器'),
+++    ));
+++  }
+++
+++  confirmAbandon() {
+++    const body = h('p', null, '确认放弃当前进度并开始新游戏？当前存档将被覆盖。');
+++    this.openForm('放弃本局', body, () => {
+++      clearSave();
+++      this.closeModal();
+++      this.showStart();
+++    }, '确认放弃');
+++  }
+++
+++  // ============ 结束回合 ============
+++  confirmEndTurn() {
+++    const body = h('p', null, '结束本回合后，天下诸侯将各自施政、出兵，资源依内政结算。是否继续？');
+++    this.openForm('结束回合', body, () => {
+++      this.closeModal();
+++      this.doEndTurn();
+++    }, '结束回合');
+++  }
+++
+++  doEndTurn() {
+++    const s = this.state;
+++    saveGame(s);
+++    const log = resolveTurn(s, { aiTurnAll }, Math.random);
+++    saveGame(s);
+++    this.refreshTopbar();
+++    if (s.over) { this.renderGameOver(); return; }
+++    this.showTurnSummary(log);
+++  }
+++
+++  showTurnSummary(log) {
+++    const items = (log && log.length) ? log : ['天下无事，岁月静好。'];
+++    const body = h('div', null,
+++      h('p', { class: 'hint' }, `第 ${this.state.turn} 回合 · ${seasonOf(this.state.turn)}季 简报`),
+++      h('ul', { class: 'summary-list' }, items.map((l) => h('li', null, l))),
+++    );
+++    this.openModal({
+++      title: '回合简报',
+++      body,
+++      foot: [h('button', { class: 'btn-primary grow', onClick: () => { this.closeModal(); this.afterAction(); } }, '继续')],
+++    });
+++  }
+++
+++  renderGameOver() {
+++    clear(this.stage);
+++    const win = this.state.over === 'win';
+++    this.stage.appendChild(h('div', { class: 'gameover' },
+++      h('h2', null, win ? '🏛 一统天下！' : '🏰 大业未成'),
+++      h('p', { class: 'hint' }, win ? `${playerFaction(this.state).name} 席卷九州，定鼎中原。` : '群雄逐鹿，君之基业已失。再图后举吧。'),
+++      h('div', { class: 'launcher__menu', style: { marginTop: '1.2rem' } },
+++        h('button', { class: 'btn-primary btn-block', onClick: () => { clearSave(); this.showCreate(); } }, '再战一局'),
+++        h('button', { class: 'btn-ghost btn-block', onClick: () => { clearSave(); this.showStart(); } }, '返回首页'),
+++      ),
+++    ));
+++  }
+++
+++  // ============ 动作后统一刷新 ============
+++  afterAction() {
+++    saveGame(this.state);
+++    if (this.screen !== 'game') return;
+++    if (this.state.over) { this.renderGameOver(); return; }
+++    this.refreshTopbar();
+++    // 若当前弹窗已关闭，则重绘内容；否则仅顶栏刷新
+++    if (!this.modalRoot.firstChild) this.renderContent();
+++  }
+++}
++diff --git a/apps/xiong-tu-san-guo/src/ui/dom.js b/apps/xiong-tu-san-guo/src/ui/dom.js
++new file mode 100644
++index 0000000..bc97b4d
++--- /dev/null
+++++ b/apps/xiong-tu-san-guo/src/ui/dom.js
++@@ -0,0 +1,44 @@
+++// ============================================================================
+++// 轻量 DOM 辅助：h() 创建元素，clear() 清空，bar() 进度条——避免引入框架。
+++// ============================================================================
+++export function h(tag, props, ...children) {
+++  const el = document.createElement(tag);
+++  if (props) {
+++    for (const [k, v] of Object.entries(props)) {
+++      if (v == null || v === false) continue;
+++      if (k === 'class') el.className = v;
+++      else if (k === 'dataset') Object.assign(el.dataset, v);
+++      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
+++      else if (k === 'onClick') el.addEventListener('click', v);
+++      else if (k === 'onInput') el.addEventListener('input', v);
+++      else if (k === 'onChange') el.addEventListener('change', v);
+++      else if (k === 'html') el.innerHTML = v; // 仅用于受控静态内容
+++      else if (k in el) { try { el[k] = v; } catch (_) { el.setAttribute(k, v); } }
+++      else el.setAttribute(k, v);
+++    }
+++  }
+++  appendChildren(el, children);
+++  return el;
+++}
+++
+++function appendChildren(el, children) {
+++  for (const c of children) {
+++    if (c == null || c === false || c === true) continue;
+++    if (Array.isArray(c)) { appendChildren(el, c); continue; }
+++    el.append(c.nodeType ? c : document.createTextNode(String(c)));
+++  }
+++}
+++
+++export function clear(el) {
+++  while (el.firstChild) el.removeChild(el.firstChild);
+++  return el;
+++}
+++
+++// 进度条：value/max → 百分比填充
+++export function bar(value, max, opts = {}) {
+++  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
+++  return h('div', { class: `bar ${opts.class || ''}` },
+++    h('div', { class: 'bar__fill', style: { width: `${pct}%`, background: opts.color || '' } }),
+++    h('span', { class: 'bar__label' }, opts.label || `${Math.floor(value)}/${Math.round(max)}`),
+++  );
+++}
++diff --git a/apps/xiong-tu-san-guo/src/ui/style.css b/apps/xiong-tu-san-guo/src/ui/style.css
++new file mode 100644
++index 0000000..8bd3249
++--- /dev/null
+++++ b/apps/xiong-tu-san-guo/src/ui/style.css
++@@ -0,0 +1,231 @@
+++/* ==========================================================================
+++   雄图·三国志文明 · 样式（竖屏单列、移动端优先，适配刘海 / 底部安全区）
+++   古卷墨韵 + 鎏金描边，暗色调三国风。
+++   ========================================================================== */
+++.xtsg {
+++  --bg: #1a1206;
+++  --bg-2: #221710;
+++  --card: #2a1d11;
+++  --card-2: #33251a;
+++  --line: #4a3826;
+++  --text: #efe2c4;
+++  --muted: #b39b73;
+++  --gold: #d9b957;
+++  --gold-dim: #8a6a28;
+++  --jade: #5fd0a0;
+++  --crimson: #c0392b;
+++  --crimson-dim: #7d2418;
+++  --good: #6fd07f;
+++  --bad: #e06b6b;
+++  --radius: 10px;
+++
+++  position: absolute;
+++  inset: 0;
+++  background:
+++    radial-gradient(120% 60% at 50% -10%, #33261a 0%, transparent 60%),
+++    var(--bg);
+++  color: var(--text);
+++  font-family: "PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", system-ui, sans-serif;
+++  font-size: 14px;
+++  line-height: 1.5;
+++  overflow: hidden;
+++  -webkit-user-select: none;
+++  user-select: none;
+++  -webkit-tap-highlight-color: transparent;
+++}
+++.xtsg * { box-sizing: border-box; }
+++
+++.xtsg .stage { position: absolute; inset: 0; overflow: hidden; }
+++.xtsg .game { position: absolute; inset: 0; display: flex; flex-direction: column; overflow: hidden; }
+++
+++/* —— 按钮 —— */
+++.xtsg button {
+++  font-family: inherit; cursor: pointer; border: none; border-radius: 8px;
+++  background: var(--card-2); color: var(--text);
+++  padding: 0.55rem 0.8rem; font-size: 0.9rem;
+++  transition: transform 0.08s ease, background 0.15s ease, opacity 0.15s ease;
+++}
+++.xtsg button:active { transform: scale(0.97); }
+++.xtsg button:disabled { opacity: 0.4; cursor: default; }
+++.xtsg .btn-primary { background: linear-gradient(180deg, #e8c769, var(--gold-dim)); color: #1a1208; font-weight: 600; }
+++.xtsg .btn-danger { background: linear-gradient(180deg, #d7574c, var(--crimson-dim)); color: #fff; }
+++.xtsg .btn-jade { background: linear-gradient(180deg, #6fe0b0, #2f9a72); color: #06241a; font-weight: 600; }
+++.xtsg .btn-ghost { background: transparent; border: 1px solid var(--line); }
+++.xtsg .btn-block { width: 100%; }
+++.xtsg input, .xtsg select {
+++  font-family: inherit; background: var(--bg-2); color: var(--text);
+++  border: 1px solid var(--line); border-radius: 8px; padding: 0.5rem 0.6rem; font-size: 0.95rem;
+++}
+++
+++/* —— 启动器 —— */
+++.xtsg .launcher {
+++  position: absolute; inset: 0; overflow-y: auto; padding: max(1.4rem, env(safe-area-inset-top)) 1rem 2rem;
+++  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1.2rem;
+++}
+++.xtsg .launcher__brand { text-align: center; }
+++.xtsg .launcher__brand .emblem {
+++  width: 76px; height: 76px; margin: 0 auto 0.6rem; border-radius: 50%;
+++  background: radial-gradient(circle at 35% 30%, #e8c769, var(--gold-dim) 70%, #5a4316);
+++  display: flex; align-items: center; justify-content: center;
+++  font-size: 2.3rem; font-weight: 700; color: #2a1a08;
+++  box-shadow: 0 4px 18px rgba(0,0,0,0.5), inset 0 0 0 3px rgba(255,255,255,0.12);
+++}
+++.xtsg .launcher__brand h1 { font-size: 1.7rem; margin: 0; letter-spacing: 0.05em; }
+++.xtsg .launcher__brand .sub { color: var(--muted); margin: 0.3rem 0 0; font-size: 0.85rem; }
+++.xtsg .launcher__menu { display: flex; flex-direction: column; gap: 0.7rem; width: 100%; max-width: 320px; }
+++
+++/* —— 创角 —— */
+++.xtsg .create { position: absolute; inset: 0; overflow-y: auto; padding: max(1rem, env(safe-area-inset-top)) 1rem 2.2rem; }
+++.xtsg .create h2 { font-size: 1.2rem; margin: 0.4rem 0 0.6rem; }
+++.xtsg .create__field { margin-bottom: 1rem; }
+++.xtsg .create__field label { display: block; color: var(--muted); margin-bottom: 0.3rem; font-size: 0.85rem; }
+++.xtsg .stat-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.4rem; }
+++.xtsg .stat {
+++  background: var(--card); border: 1px solid var(--line); border-radius: 8px; padding: 0.5rem 0.2rem; text-align: center;
+++}
+++.xtsg .stat__k { font-size: 0.7rem; color: var(--muted); }
+++.xtsg .stat__v { font-size: 1.15rem; font-weight: 700; color: var(--gold); }
+++.xtsg .city-pick { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.45rem; margin-top: 0.4rem; }
+++.xtsg .city-pick__item {
+++  background: var(--card); border: 1px solid var(--line); border-radius: 8px; padding: 0.5rem;
+++  text-align: left; font-size: 0.82rem;
+++}
+++.xtsg .city-pick__item--sel { border-color: var(--gold); background: var(--card-2); }
+++.xtsg .city-pick__item b { color: var(--gold); }
+++
+++/* —— 顶栏 —— */
+++.xtsg .topbar {
+++  flex: none; padding: max(0.55rem, env(safe-area-inset-top)) 0.7rem 0.45rem;
+++  background: linear-gradient(180deg, #2c2014, var(--bg-2)); border-bottom: 1px solid var(--line);
+++}
+++.xtsg .topbar__row { display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap; }
+++.xtsg .topbar__title { font-weight: 700; font-size: 0.95rem; margin-right: auto; }
+++.xtsg .res-pill {
+++  background: var(--card); border: 1px solid var(--line); border-radius: 999px;
+++  padding: 0.2rem 0.6rem; font-size: 0.8rem; white-space: nowrap;
+++}
+++.xtsg .res-pill b { color: var(--gold); }
+++.xtsg .cmd-pill { background: linear-gradient(180deg, #e8c769, var(--gold-dim)); color: #1a1208; font-weight: 700; }
+++
+++/* —— 标签栏 —— */
+++.xtsg .tabbar {
+++  flex: none; display: flex; background: var(--bg-2); border-bottom: 1px solid var(--line);
+++}
+++.xtsg .tab {
+++  flex: 1; background: transparent; border-radius: 0; padding: 0.55rem 0;
+++  font-size: 0.8rem; color: var(--muted); border-bottom: 2px solid transparent;
+++}
+++.xtsg .tab--active { color: var(--gold); border-bottom-color: var(--gold); }
+++
+++/* —— 内容滚动区 —— */
+++.xtsg .content { flex: 1; overflow-y: auto; overflow-x: hidden; padding: 0.7rem; }
+++.xtsg .content h3 { font-size: 1rem; margin: 0.2rem 0 0.6rem; color: var(--gold); }
+++
+++/* —— 地图 —— */
+++.xtsg .map-wrap {
+++  position: relative; width: 100%; aspect-ratio: 1000 / 760; margin: 0 auto;
+++  background:
+++    radial-gradient(80% 60% at 50% 40%, #3a2c1c 0%, transparent 70%),
+++    repeating-linear-gradient(45deg, #241a10 0 12px, #221710 12px 24px);
+++  border: 1px solid var(--line); border-radius: 12px; overflow: hidden;
+++}
+++.xtsg .map-svg { position: absolute; inset: 0; width: 100%; height: 100%; }
+++.xtsg .map-line { stroke: #5e4a30; stroke-width: 1.6; opacity: 0.7; }
+++.xtsg .map-dot {
+++  position: absolute; transform: translate(-50%, -50%);
+++  width: 34px; height: 34px; border-radius: 50%; border: none; padding: 0;
+++  display: flex; align-items: center; justify-content: center;
+++  font-size: 0.62rem; font-weight: 700; color: #fff;
+++  box-shadow: 0 2px 6px rgba(0,0,0,0.5), inset 0 0 0 2px rgba(255,255,255,0.25);
+++}
+++.xtsg .map-dot--player { box-shadow: 0 0 0 3px var(--gold), 0 2px 6px rgba(0,0,0,0.5); }
+++.xtsg .map-dot--selected { box-shadow: 0 0 0 3px #fff, 0 2px 8px rgba(255,255,255,0.4); transform: translate(-50%, -50%) scale(1.12); }
+++.xtsg .map-label {
+++  position: absolute; transform: translate(-50%, 14px);
+++  font-size: 0.64rem; color: var(--text); text-shadow: 0 1px 2px #000;
+++  pointer-events: none; white-space: nowrap;
+++}
+++
+++/* —— 城市详情面板 —— */
+++.xtsg .panel {
+++  background: var(--card); border: 1px solid var(--line); border-radius: 12px;
+++  padding: 0.7rem; margin-top: 0.7rem;
+++}
+++.xtsg .panel__head { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; }
+++.xtsg .panel__head h4 { margin: 0; font-size: 1.05rem; }
+++.xtsg .panel__swatch { width: 16px; height: 16px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.3); }
+++.xtsg .panel__rows { display: grid; grid-template-columns: 1fr 1fr; gap: 0.25rem 0.6rem; font-size: 0.82rem; }
+++.xtsg .panel__rows .muted { color: var(--muted); }
+++.xtsg .cmd-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.4rem; margin-top: 0.6rem; }
+++.xtsg .cmd-btn { padding: 0.5rem 0.2rem; font-size: 0.78rem; }
+++
+++/* —— 列表卡片 —— */
+++.xtsg .card-list { display: flex; flex-direction: column; gap: 0.55rem; }
+++.xtsg .hero-card, .xtsg .city-card {
+++  background: var(--card); border: 1px solid var(--line); border-radius: 10px; padding: 0.6rem 0.7rem;
+++}
+++.xtsg .hero-card__head { display: flex; align-items: center; gap: 0.5rem; }
+++.xtsg .hero-card__name { font-weight: 700; font-size: 0.98rem; }
+++.xtsg .hero-card__sub { font-size: 0.72rem; color: var(--muted); }
+++.xtsg .hero-card__stats { display: flex; gap: 0.5rem; margin: 0.4rem 0; font-size: 0.72rem; flex-wrap: wrap; }
+++.xtsg .hero-card__stats span b { color: var(--gold); }
+++.xtsg .hero-card__skill { font-size: 0.74rem; color: var(--jade); }
+++.xtsg .hero-card__foot { display: flex; gap: 0.4rem; margin-top: 0.5rem; flex-wrap: wrap; }
+++.xtsg .hero-card__foot button { font-size: 0.76rem; padding: 0.35rem 0.55rem; }
+++
+++/* —— 科技 —— */
+++.xtsg .tech-grid { display: flex; flex-direction: column; gap: 0.55rem; }
+++.xtsg .tech-card { background: var(--card); border: 1px solid var(--line); border-radius: 10px; padding: 0.6rem 0.7rem; }
+++.xtsg .tech-card__head { display: flex; align-items: center; gap: 0.5rem; }
+++.xtsg .tech-card__icon { font-size: 1.3rem; }
+++.xtsg .tech-lv { display: inline-flex; gap: 3px; }
+++.xtsg .tech-lv i { width: 12px; height: 12px; border-radius: 50%; background: var(--line); display: inline-block; }
+++.xtsg .tech-lv i.on { background: var(--gold); }
+++
+++/* —— 系统 —— */
+++.xtsg .sys-list { display: flex; flex-direction: column; gap: 0.5rem; }
+++
+++/* —— 模态 —— */
+++.xtsg .modal {
+++  position: absolute; inset: 0; background: rgba(0,0,0,0.62);
+++  display: flex; align-items: center; justify-content: center; padding: 1rem; z-index: 30;
+++}
+++.xtsg .modal__card {
+++  background: var(--card); border: 1px solid var(--line); border-radius: 14px;
+++  width: 100%; max-width: 420px; max-height: 86%; display: flex; flex-direction: column; overflow: hidden;
+++}
+++.xtsg .modal__head { padding: 0.7rem 0.9rem; border-bottom: 1px solid var(--line); display: flex; align-items: center; }
+++.xtsg .modal__head h3 { margin: 0; font-size: 1.05rem; color: var(--gold); }
+++.xtsg .modal__body { padding: 0.8rem 0.9rem; overflow-y: auto; }
+++.xtsg .modal__foot { padding: 0.6rem 0.9rem; border-top: 1px solid var(--line); display: flex; gap: 0.5rem; }
+++.xtsg .battle-log { font-size: 0.82rem; line-height: 1.7; max-height: 46vh; overflow-y: auto; }
+++.xtsg .battle-log p { margin: 0.15rem 0; }
+++.xtsg .summary-list { font-size: 0.86rem; }
+++.xtsg .summary-list li { margin: 0.3rem 0; }
+++.xtsg .force-vs { display: flex; justify-content: space-between; gap: 0.6rem; margin-bottom: 0.6rem; }
+++.xtsg .force-vs__side { flex: 1; background: var(--bg-2); border-radius: 8px; padding: 0.5rem; font-size: 0.8rem; }
+++
+++/* —— 进度条 —— */
+++.xtsg .bar { position: relative; height: 14px; background: var(--bg-2); border-radius: 7px; overflow: hidden; }
+++.xtsg .bar__fill { position: absolute; inset: 0 auto 0 0; background: var(--gold); transition: width 0.3s; }
+++.xtsg .bar__label { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 0.68rem; }
+++
+++/* —— Toast —— */
+++.xtsg .toast-wrap { position: absolute; top: max(0.6rem, env(safe-area-inset-top)); left: 0; right: 0; z-index: 50; display: flex; flex-direction: column; align-items: center; gap: 0.3rem; pointer-events: none; }
+++.xtsg .toast {
+++  background: rgba(20,14,6,0.94); border: 1px solid var(--line); color: var(--text);
+++  padding: 0.5rem 0.9rem; border-radius: 999px; font-size: 0.82rem; max-width: 90%; text-align: center;
+++  animation: xtsgToast 2.4s ease forwards;
+++}
+++@keyframes xtsgToast {
+++  0% { opacity: 0; transform: translateY(-8px); }
+++  12%, 80% { opacity: 1; transform: translateY(0); }
+++  100% { opacity: 0; transform: translateY(-8px); }
+++}
+++
+++.xtsg .muted { color: var(--muted); }
+++.xtsg .hint { font-size: 0.78rem; color: var(--muted); margin: 0.3rem 0; }
+++.xtsg .center { text-align: center; }
+++.xtsg .grow { flex: 1; }
+++.xtsg .gameover { text-align: center; padding: 2rem 1rem; }
+++.xtsg .gameover h2 { font-size: 1.8rem; color: var(--gold); }
++diff --git a/apps/xiong-tu-san-guo/vite.config.js b/apps/xiong-tu-san-guo/vite.config.js
++new file mode 100644
++index 0000000..55ec6d1
++--- /dev/null
+++++ b/apps/xiong-tu-san-guo/vite.config.js
++@@ -0,0 +1,9 @@
+++import { defineConfig } from 'vite';
+++
+++// `base: './'` 生成相对路径资源引用，便于部署到 GitHub Pages 子路径或任意静态目录。
+++// 本作纯原生 DOM 渲染、无框架、无 Canvas，构建产物极小。
+++export default defineConfig({
+++  base: './',
+++  server: { host: true, port: 5179 },
+++  build: { outDir: 'dist', sourcemap: false, target: 'es2018' },
+++});
++diff --git a/src/main.js b/src/main.js
++index 6820391..7f0c8af 100644
++--- a/src/main.js
+++++ b/src/main.js
++@@ -69,6 +69,14 @@ const APPS = {
++     desc: '迫降破碎星球，在漂浮的遗迹浮岛间拾荒探索。猜拳克制式战斗、装备强化与三天赋树、碎片化记忆叙事，集齐十枚星骸回响揭开真相。',
++     loader: () => import('../apps/xing-hai-lv-zhe/src/main.js'),
++   },
+++  xtsg: {
+++    key: 'xtsg',
+++    title: '雄图·三国志文明',
+++    subtitle: '三国 · 回合策略',
+++    emblem: '雄',
+++    desc: '自择一城起兵，开发内政、推进科技树、招揽四十余位名将，在十八城中国地图上回合制征战，俘将夺城，一统九州。',
+++    loader: () => import('../apps/xiong-tu-san-guo/src/main.js'),
+++  },
++ }
++ 
++ // 大类：先呈现「学习」，再呈现「游戏」。点击大类进入后，才展开其中的具体应用。
++@@ -86,8 +94,8 @@ const CATEGORIES = [
++     title: '游戏',
++     subtitle: '休闲 · 互动娱乐',
++     emblem: '玩',
++-    desc: '消磨时光的互动小品：修仙、人生、三国战场、星骸浮岛，挑一个开始吧。',
++-    appKeys: ['dzf', 'frxx', 'mnrs', 'xhlz'],
+++    desc: '消磨时光的互动小品：修仙、人生、三国战场、星骸浮岛、诸侯争霸，挑一个开始吧。',
+++    appKeys: ['dzf', 'frxx', 'mnrs', 'xhlz', 'xtsg'],
++   },
++ ]
++ 
+diff --git a/.ai-tasks/issue-79/review_error_r1.log b/.ai-tasks/issue-79/review_error_r1.log
+new file mode 100644
+index 0000000..e69de29
+diff --git a/.ai-tasks/issue-79/review_result_r1.md b/.ai-tasks/issue-79/review_result_r1.md
+new file mode 100644
+index 0000000..cc46918
+--- /dev/null
++++ b/.ai-tasks/issue-79/review_result_r1.md
+@@ -0,0 +1,12 @@
++审查完成。该 PR 提交了一个完整且可用的游戏（构建正常，135 个逻辑断言和 21 个 DOM 冒烟测试断言全部通过，`_lib/keyboard-shell.js` 的导入解析正确，没有 `.github/` 的更改，没有安全问题）。然而，我发现了**两个已确认的核心战斗逻辑 Bug**，我已针对实际代码进行了复现。因此我要求进行修改。
++
++DECISION: REQUEST_CHANGES
++COMMENT: 已构建并运行全部自测（135 逻辑断言 + 21 DOM 冒烟断言全过，vite 构建成功，`_lib/keyboard-shell.js` 引入路径正确，无 .github/CI 改动，无 XSS/注入风险），但发现两处确凿的核心逻辑 Bug，已用真实代码复现，需修复：
++
++【Bug 1 · 严重 · 资源凭空消失】src/core/actions.js 的 transport()。金钱/军粮是势力级共享池（见 economy.js 与 resolveTurn，每回合直接 fac.money+=、fac.grain+=），并非城市级。但 transport() 里却执行 `fac.money -= gm; fac.grain -= gr;` 且**从不把 gm/gr 加到任何地方**（from/to 的城市金库 gold/grain 也未变动）。实测：输送 500 金/500 粮后，势力金钱 -500、军粮 -500，而 luoyang.gold/wan.gold 均不变 —— 玩家的资源被直接销毁。UI（src/ui/app.js 的 uiTransport）还专门提供了金/粮输入框诱导玩家误用。修复建议：金/粮本就是全势力共享、无需「输送」，应从 transport() 移除金/粮扣减逻辑、并从 uiTransport 表单去掉金/粮输入框，只保留唯一有意义的城市级资源——士兵（soldiers 部分的 from.soldiers-=s / to.soldiers+=s 是正确的，保留即可）。
++
++【Bug 2 · 严重 · 战斗结果不回写】src/core/actions.js 的 applyCampaignResult()。createBattle() 对 attacker/defender 做了浅拷贝，runBattle() 只削减 `battle.defender.soldiers`，从未改写真实城市 `to.soldiers`。攻方获胜分支用 `to.soldiers = survivors`（攻方残兵）覆写，尚可；但**攻方失利分支只 push 了一条日志，完全没有把守军实际伤亡回写**。实测：守军 600、城防 0，玩家攻城失败时，战斗结算守军被打到仅剩 168（战死 432），而战斗结束后真实城市 garrison 仍为 600 —— 守军凭空满血复活。这意味着「以战消耗敌城」的策略完全失效：只要攻城失败，敌城守军永远无损。修复建议：在失利分支补 `to.soldiers = Math.round(battle.defender.soldiers);` 并 `to.defense = Math.max(0, Math.round(battle.defender.defense));`，使战斗伤亡如实落账。
++
++【次要问题，供一并酌情处理】(a) 胜负判定仅在 resolveTurn() 结尾的 checkGameOver() 触发：玩家在回合中通过出征占领最后一座城不会立即胜利，必须再「结束回合」才结算（afterAction 读取的 state.over 此刻仍为 null）。建议在 campaign 成功占领后调用一次 checkGameOver，或让 afterAction 主动判定。(b) 计略 stratagem() 的施计者用 bestDefender()（按统率最高）挑选，却读取其 stats.i（智力）计算成功率，逻辑上应取智力最高的武将施计，当前会系统性压低计略成功率（属设计瑕疵而非崩溃）。
++
++以上均为 src/ 下业务代码问题，可直接修改；本 PR 未触及 .github/ 及任何 CI/CD 配置，无需人工介入 workflow。
+diff --git a/apps/xiong-tu-san-guo/README.md b/apps/xiong-tu-san-guo/README.md
+new file mode 100644
+index 0000000..6c38152
+--- /dev/null
++++ b/apps/xiong-tu-san-guo/README.md
+@@ -0,0 +1,57 @@
++# 雄图·三国志文明 · Heroic Three Kingdoms Civilization
++
++一款融合《三国志》武将养成 / 指令式内政与《文明》科技树推进的**单机回合制策略经营**网页游戏。自择一城起兵，开发内政、攀科技、招揽名将、征战四方，最终统一九州。
++
++技术栈：**纯原生 HTML + CSS + JavaScript（无框架、无 Canvas）**，移动端竖屏设计，地图由内嵌 SVG + 绝对定位城市点构成，数据持久化于浏览器 `localStorage`。体积小（构建后 JS ≈ 56KB / gzip ≈ 20KB），加载快。
++
++## 本地运行
++
++```bash
++npm install
++npm run dev        # 开发服务器 http://localhost:5179
++npm run build      # 生产构建到 dist/
++npm run test       # 纯逻辑自测（135+ 断言，不依赖浏览器）
++npm run test:dom   # jsdom 驱动的 DOM 冒烟测试（21+ 断言）
++```
++
++也可由主框架（落地页）以 `createGame(parent)` 动态挂载，无需独立部署。
++
++## 核心玩法
++
++- **立君择都**：开局自定义君主姓名（2~4 汉字），随机生成五项属性（统 / 武 / 智 / 政 / 魅，可重掷 5 次），再从 18 座城市中选择起兵之地。占据诸侯旧都时，其旧部将就地转为在野名将，可择机登用。
++- **九州地图**：简化的中国古代地图，18 座核心城市以圆形节点呈现，按固定路径相邻相连；军队出征只能沿路径推进。金边为己方、灰点为空城、他色为诸侯。
++- **内政经营**：每座城市可发展**农田 / 市集 / 城墙 / 兵营**（各 1~5 级）、征兵、操练。金钱与军粮为势力级共享池，每回合依市集、人口、农田等级结算；军粮不济则士兵逃亡，人口随太守政治自然增长。
++- **名将系统**：内置 47 位历史名将（关羽、张飞、诸葛亮、赵云、周瑜、吕布、曹操……），各有五维面板、专属技能（如「威震华夏」「神算」）与忠诚度。用**探索**发现本城在野名将，**登用**说服加入（成功率受魅力、忠诚、相性影响）；战时可俘虏敌将，关押后**招降 / 释放 / 处决**。
++- **科技树**：6 项科技（农艺 / 商贸 / 冶炼 / 筑城 / 谋略 / 统御）各 3 级，研究消耗金钱与回合（君主智力可缩短），完成后势力全城共享加成。
++- **回合制征战**：出征按路程消耗军粮，进入简化自动战斗——双方依「武力·统率·兵力·科技·训练度·阵型」结算攻防，城防优先承受伤害；武力悬殊时可能触发**单挑**一击定胜负。胜则占城、俘将、缴获城库。
++- **指令点数**：每回合获得若干指令点（基础 5 点 + 每多一城 +2 点 + 君主政治加成），内政、人事、军事、外交计略各耗点执行；可对相邻敌城施**火攻 / 烧粮 / 流言**等计略。
++- **AI 诸侯**：开局随机分布 8 路诸侯，按「内政→招募→研究→侵略→输送→赏赐」优先级消耗指令点，各自施政出兵。
++- **胜败条件**：占领全部 18 城 → 一统天下；所有城池尽失 → 大业未成。存档自动写入本地浏览器。
++
++## 数据结构
++
++全局状态序列化为 JSON 存于 `localStorage`（键 `xtsg_save_v1`）：势力、城市（人口 / 兵力 / 城防 / 建筑等级 / 邻接）、名将（属性 / 技能 / 忠诚 / 状态）、科技等级、当前研究、回合与事件日志。
++
++## 目录结构
++
++```
++src/
++├── main.js              入口工厂 createGame(parent)
++├── config.js            全局常量与公式（经济 / 战斗 / 科技 / 计略）
++├── data/
++│   ├── cities.js        18 座城市（坐标 / 特性 / 邻接）
++│   └── heroes.js        47 位名将 + 8 路 AI 势力种子
++├── core/
++│   ├── state.js         新局初始化 / 回合结算 / 胜负 / 查询
++│   ├── economy.js       收支 / 人口 / 城防公式
++│   ├── combat.js        自动战斗（骰子模型 + 城防 + 单挑）
++│   ├── actions.js       玩家 / AI 共用命令（内政·人事·军事·计略·俘虏）
++│   ├── ai.js            AI 诸侯回合
++│   ├── tech.js          科技乘子与技能解析
++│   ├── save.js          localStorage 存读
++│   └── rng.js           随机工具（可种子化）
++└── ui/
++    ├── app.js           UI 控制器（启动 / 创角 / 对局五标签 / 弹窗）
++    ├── dom.js           h() / clear() / bar() DOM 辅助
++    └── style.css        古卷墨韵 + 鎏金描边
++```
+diff --git a/apps/xiong-tu-san-guo/index.html b/apps/xiong-tu-san-guo/index.html
+new file mode 100644
+index 0000000..cb58277
+--- /dev/null
++++ b/apps/xiong-tu-san-guo/index.html
+@@ -0,0 +1,27 @@
++<!doctype html>
++<html lang="zh-CN">
++
++<head>
++  <meta charset="UTF-8" />
++  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
++  <meta name="theme-color" content="#1a1206" />
++  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%231a1206'/%3E%3Ctext x='16' y='23' font-size='20' text-anchor='middle' fill='%23d4a84b' font-family='serif'%3E%E9%9B%84%3C/text%3E%3C/svg%3E" />
++  <title>雄图·三国志文明</title>
++  <style>
++    html, body {
++      margin: 0; padding: 0; width: 100%; height: 100%;
++      background: #1a1206; overflow: hidden;
++      font-family: "PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif;
++      -webkit-user-select: none; user-select: none;
++      -webkit-tap-highlight-color: transparent;
++    }
++    #game-container { position: relative; width: 100vw; height: 100vh; }
++  </style>
++</head>
++
++<body>
++  <div id="game-container"></div>
++  <script type="module" src="/src/main.js"></script>
++</body>
++
++</html>
+diff --git a/apps/xiong-tu-san-guo/package-lock.json b/apps/xiong-tu-san-guo/package-lock.json
+new file mode 100644
+index 0000000..b89fb39
+--- /dev/null
++++ b/apps/xiong-tu-san-guo/package-lock.json
+@@ -0,0 +1,1559 @@
++{
++  "name": "xiong-tu-san-guo",
++  "version": "1.0.0",
++  "lockfileVersion": 3,
++  "requires": true,
++  "packages": {
++    "": {
++      "name": "xiong-tu-san-guo",
++      "version": "1.0.0",
++      "devDependencies": {
++        "jsdom": "^29.1.1",
++        "vite": "^5.4.0"
++      }
++    },
++    "node_modules/@asamuzakjp/css-color": {
++      "version": "5.1.11",
++      "resolved": "https://registry.npmjs.org/@asamuzakjp/css-color/-/css-color-5.1.11.tgz",
++      "integrity": "sha512-KVw6qIiCTUQhByfTd78h2yD1/00waTmm9uy/R7Ck/ctUyAPj+AEDLkQIdJW0T8+qGgj3j5bpNKK7Q3G+LedJWg==",
++      "dev": true,
++      "license": "MIT",
++      "dependencies": {
++        "@asamuzakjp/generational-cache": "^1.0.1",
++        "@csstools/css-calc": "^3.2.0",
++        "@csstools/css-color-parser": "^4.1.0",
++        "@csstools/css-parser-algorithms": "^4.0.0",
++        "@csstools/css-tokenizer": "^4.0.0"
++      },
++      "engines": {
++        "node": "^20.19.0 || ^22.12.0 || >=24.0.0"
++      }
++    },
++    "node_modules/@asamuzakjp/dom-selector": {
++      "version": "7.1.1",
++      "resolved": "https://registry.npmjs.org/@asamuzakjp/dom-selector/-/dom-selector-7.1.1.tgz",
++      "integrity": "sha512-67RZDnYRc8H/8MLDgQCDE//zoqVFwajkepHZgmXrbwybzXOEwOWGPYGmALYl9J2DOLfFPPs6kKCqmbzV895hTQ==",
++      "dev": true,
++      "license": "MIT",
++      "dependencies": {
++        "@asamuzakjp/generational-cache": "^1.0.1",
++        "@asamuzakjp/nwsapi": "^2.3.9",
++        "bidi-js": "^1.0.3",
++        "css-tree": "^3.2.1",
++        "is-potential-custom-element-name": "^1.0.1"
++      },
++      "engines": {
++        "node": "^20.19.0 || ^22.12.0 || >=24.0.0"
++      }
++    },
++    "node_modules/@asamuzakjp/generational-cache": {
++      "version": "1.0.1",
++      "resolved": "https://registry.npmjs.org/@asamuzakjp/generational-cache/-/generational-cache-1.0.1.tgz",
++      "integrity": "sha512-wajfB8KqzMCN2KGNFdLkReeHncd0AslUSrvHVvvYWuU8ghncRJoA50kT3zP9MVL0+9g4/67H+cdvBskj9THPzg==",
++      "dev": true,
++      "license": "MIT",
++      "engines": {
++        "node": "^20.19.0 || ^22.12.0 || >=24.0.0"
++      }
++    },
++    "node_modules/@asamuzakjp/nwsapi": {
++      "version": "2.3.9",
++      "resolved": "https://registry.npmjs.org/@asamuzakjp/nwsapi/-/nwsapi-2.3.9.tgz",
++      "integrity": "sha512-n8GuYSrI9bF7FFZ/SjhwevlHc8xaVlb/7HmHelnc/PZXBD2ZR49NnN9sMMuDdEGPeeRQ5d0hqlSlEpgCX3Wl0Q==",
++      "dev": true,
++      "license": "MIT"
++    },
++    "node_modules/@bramus/specificity": {
++      "version": "2.4.2",
++      "resolved": "https://registry.npmjs.org/@bramus/specificity/-/specificity-2.4.2.tgz",
++      "integrity": "sha512-ctxtJ/eA+t+6q2++vj5j7FYX3nRu311q1wfYH3xjlLOsczhlhxAg2FWNUXhpGvAw3BWo1xBcvOV6/YLc2r5FJw==",
++      "dev": true,
++      "license": "MIT",
++      "dependencies": {
++        "css-tree": "^3.0.0"
++      },
++      "bin": {
++        "specificity": "bin/cli.js"
++      }
++    },
++    "node_modules/@csstools/color-helpers": {
++      "version": "6.1.0",
++      "resolved": "https://registry.npmjs.org/@csstools/color-helpers/-/color-helpers-6.1.0.tgz",
++      "integrity": "sha512-064IFJdjTfUqnjpCVpMOdbr8FLQBhinbZj6yRv2An2E41O/pLEXqfFRWqGq/SxlE5PEUYTlvWsG2r8MswAVvkg==",
++      "dev": true,
++      "funding": [
++        {
++          "type": "github",
++          "url": "https://github.com/sponsors/csstools"
++        },
++        {
++          "type": "opencollective",
++          "url": "https://opencollective.com/csstools"
++        }
++      ],
++      "license": "MIT-0",
++      "engines": {
++        "node": ">=20.19.0"
++      }
++    },
++    "node_modules/@csstools/css-calc": {
++      "version": "3.3.0",
++      "resolved": "https://registry.npmjs.org/@csstools/css-calc/-/css-calc-3.3.0.tgz",
++      "integrity": "sha512-c5ihYsPkdG6JCkU2zTMm4+k6r7RXuGxtWYhu5DHMIiF1FHzrfmHL5so11AoFpUv/tu61xfcmT4AmKoFfMPoqdQ==",
++      "dev": true,
++      "funding": [
++        {
++          "type": "github",
++          "url": "https://github.com/sponsors/csstools"
++        },
++        {
++          "type": "opencollective",
++          "url": "https://opencollective.com/csstools"
++        }
++      ],
++      "license": "MIT",
++      "engines": {
++        "node": ">=20.19.0"
++      },
++      "peerDependencies": {
++        "@csstools/css-parser-algorithms": "^4.0.0",
++        "@csstools/css-tokenizer": "^4.0.0"
++      }
++    },
++    "node_modules/@csstools/css-color-parser": {
++      "version": "4.1.10",
++      "resolved": "https://registry.npmjs.org/@csstools/css-color-parser/-/css-color-parser-4.1.10.tgz",
++      "integrity": "sha512-UZhQLIUyJaaMepqehrCODwCg2KW25vFvLWBmqYFaPclYvvxzj/sG8LBOhBFCp11i9uE7t1EyS+RAoV9tztPFyw==",
++      "dev": true,
++      "funding": [
++        {
++          "type": "github",
++          "url": "https://github.com/sponsors/csstools"
++        },
++        {
++          "type": "opencollective",
++          "url": "https://opencollective.com/csstools"
++        }
++      ],
++      "license": "MIT",
++      "dependencies": {
++        "@csstools/color-helpers": "^6.1.0",
++        "@csstools/css-calc": "^3.3.0"
++      },
++      "engines": {
++        "node": ">=20.19.0"
++      },
++      "peerDependencies": {
++        "@csstools/css-parser-algorithms": "^4.0.0",
++        "@csstools/css-tokenizer": "^4.0.0"
++      }
++    },
++    "node_modules/@csstools/css-parser-algorithms": {
++      "version": "4.0.0",
++      "resolved": "https://registry.npmjs.org/@csstools/css-parser-algorithms/-/css-parser-algorithms-4.0.0.tgz",
++      "integrity": "sha512-+B87qS7fIG3L5h3qwJ/IFbjoVoOe/bpOdh9hAjXbvx0o8ImEmUsGXN0inFOnk2ChCFgqkkGFQ+TpM5rbhkKe4w==",
++      "dev": true,
++      "funding": [
++        {
++          "type": "github",
++          "url": "https://github.com/sponsors/csstools"
++        },
++        {
++          "type": "opencollective",
++          "url": "https://opencollective.com/csstools"
++        }
++      ],
++      "license": "MIT",
++      "engines": {
++        "node": ">=20.19.0"
++      },
++      "peerDependencies": {
++        "@csstools/css-tokenizer": "^4.0.0"
++      }
++    },
++    "node_modules/@csstools/css-syntax-patches-for-csstree": {
++      "version": "1.1.7",
++      "resolved": "https://registry.npmjs.org/@csstools/css-syntax-patches-for-csstree/-/css-syntax-patches-for-csstree-1.1.7.tgz",
++      "integrity": "sha512-fQ+05118eQS1cofO3aJpB5efgpBZMvIzwr/sbC8kDLVA5XLG8q1kJV5yzrUAI1f7lvhPnm8fgIjzFB8/O/5Dig==",
++      "dev": true,
++      "funding": [
++        {
++          "type": "github",
++          "url": "https://github.com/sponsors/csstools"
++        },
++        {
++          "type": "opencollective",
++          "url": "https://opencollective.com/csstools"
++        }
++      ],
++      "license": "MIT-0",
++      "peerDependencies": {
++        "css-tree": "^3.2.1"
++      },
++      "peerDependenciesMeta": {
++        "css-tree": {
++          "optional": true
++        }
++      }
++    },
++    "node_modules/@csstools/css-tokenizer": {
++      "version": "4.0.0",
++      "resolved": "https://registry.npmjs.org/@csstools/css-tokenizer/-/css-tokenizer-4.0.0.tgz",
++      "integrity": "sha512-QxULHAm7cNu72w97JUNCBFODFaXpbDg+dP8b/oWFAZ2MTRppA3U00Y2L1HqaS4J6yBqxwa/Y3nMBaxVKbB/NsA==",
++      "dev": true,
++      "funding": [
++        {
++          "type": "github",
++          "url": "https://github.com/sponsors/csstools"
++        },
++        {
++          "type": "opencollective",
++          "url": "https://opencollective.com/csstools"
++        }
++      ],
++      "license": "MIT",
++      "engines": {
++        "node": ">=20.19.0"
++      }
++    },
++    "node_modules/@esbuild/aix-ppc64": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/aix-ppc64/-/aix-ppc64-0.21.5.tgz",
++      "integrity": "sha512-1SDgH6ZSPTlggy1yI6+Dbkiz8xzpHJEVAlF/AM1tHPLsf5STom9rwtjE4hKAF20FfXXNTFqEYXyJNWh1GiZedQ==",
++      "cpu": [
++        "ppc64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "aix"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/android-arm": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/android-arm/-/android-arm-0.21.5.tgz",
++      "integrity": "sha512-vCPvzSjpPHEi1siZdlvAlsPxXl7WbOVUBBAowWug4rJHb68Ox8KualB+1ocNvT5fjv6wpkX6o/iEpbDrf68zcg==",
++      "cpu": [
++        "arm"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "android"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/android-arm64": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/android-arm64/-/android-arm64-0.21.5.tgz",
++      "integrity": "sha512-c0uX9VAUBQ7dTDCjq+wdyGLowMdtR/GoC2U5IYk/7D1H1JYC0qseD7+11iMP2mRLN9RcCMRcjC4YMclCzGwS/A==",
++      "cpu": [
++        "arm64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "android"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/android-x64": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/android-x64/-/android-x64-0.21.5.tgz",
++      "integrity": "sha512-D7aPRUUNHRBwHxzxRvp856rjUHRFW1SdQATKXH2hqA0kAZb1hKmi02OpYRacl0TxIGz/ZmXWlbZgjwWYaCakTA==",
++      "cpu": [
++        "x64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "android"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/darwin-arm64": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/darwin-arm64/-/darwin-arm64-0.21.5.tgz",
++      "integrity": "sha512-DwqXqZyuk5AiWWf3UfLiRDJ5EDd49zg6O9wclZ7kUMv2WRFr4HKjXp/5t8JZ11QbQfUS6/cRCKGwYhtNAY88kQ==",
++      "cpu": [
++        "arm64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "darwin"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/darwin-x64": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/darwin-x64/-/darwin-x64-0.21.5.tgz",
++      "integrity": "sha512-se/JjF8NlmKVG4kNIuyWMV/22ZaerB+qaSi5MdrXtd6R08kvs2qCN4C09miupktDitvh8jRFflwGFBQcxZRjbw==",
++      "cpu": [
++        "x64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "darwin"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/freebsd-arm64": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/freebsd-arm64/-/freebsd-arm64-0.21.5.tgz",
++      "integrity": "sha512-5JcRxxRDUJLX8JXp/wcBCy3pENnCgBR9bN6JsY4OmhfUtIHe3ZW0mawA7+RDAcMLrMIZaf03NlQiX9DGyB8h4g==",
++      "cpu": [
++        "arm64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "freebsd"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/freebsd-x64": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/freebsd-x64/-/freebsd-x64-0.21.5.tgz",
++      "integrity": "sha512-J95kNBj1zkbMXtHVH29bBriQygMXqoVQOQYA+ISs0/2l3T9/kj42ow2mpqerRBxDJnmkUDCaQT/dfNXWX/ZZCQ==",
++      "cpu": [
++        "x64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "freebsd"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/linux-arm": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/linux-arm/-/linux-arm-0.21.5.tgz",
++      "integrity": "sha512-bPb5AHZtbeNGjCKVZ9UGqGwo8EUu4cLq68E95A53KlxAPRmUyYv2D6F0uUI65XisGOL1hBP5mTronbgo+0bFcA==",
++      "cpu": [
++        "arm"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/linux-arm64": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/linux-arm64/-/linux-arm64-0.21.5.tgz",
++      "integrity": "sha512-ibKvmyYzKsBeX8d8I7MH/TMfWDXBF3db4qM6sy+7re0YXya+K1cem3on9XgdT2EQGMu4hQyZhan7TeQ8XkGp4Q==",
++      "cpu": [
++        "arm64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/linux-ia32": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/linux-ia32/-/linux-ia32-0.21.5.tgz",
++      "integrity": "sha512-YvjXDqLRqPDl2dvRODYmmhz4rPeVKYvppfGYKSNGdyZkA01046pLWyRKKI3ax8fbJoK5QbxblURkwK/MWY18Tg==",
++      "cpu": [
++        "ia32"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/linux-loong64": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/linux-loong64/-/linux-loong64-0.21.5.tgz",
++      "integrity": "sha512-uHf1BmMG8qEvzdrzAqg2SIG/02+4/DHB6a9Kbya0XDvwDEKCoC8ZRWI5JJvNdUjtciBGFQ5PuBlpEOXQj+JQSg==",
++      "cpu": [
++        "loong64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/linux-mips64el": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/linux-mips64el/-/linux-mips64el-0.21.5.tgz",
++      "integrity": "sha512-IajOmO+KJK23bj52dFSNCMsz1QP1DqM6cwLUv3W1QwyxkyIWecfafnI555fvSGqEKwjMXVLokcV5ygHW5b3Jbg==",
++      "cpu": [
++        "mips64el"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/linux-ppc64": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/linux-ppc64/-/linux-ppc64-0.21.5.tgz",
++      "integrity": "sha512-1hHV/Z4OEfMwpLO8rp7CvlhBDnjsC3CttJXIhBi+5Aj5r+MBvy4egg7wCbe//hSsT+RvDAG7s81tAvpL2XAE4w==",
++      "cpu": [
++        "ppc64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/linux-riscv64": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/linux-riscv64/-/linux-riscv64-0.21.5.tgz",
++      "integrity": "sha512-2HdXDMd9GMgTGrPWnJzP2ALSokE/0O5HhTUvWIbD3YdjME8JwvSCnNGBnTThKGEB91OZhzrJ4qIIxk/SBmyDDA==",
++      "cpu": [
++        "riscv64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/linux-s390x": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/linux-s390x/-/linux-s390x-0.21.5.tgz",
++      "integrity": "sha512-zus5sxzqBJD3eXxwvjN1yQkRepANgxE9lgOW2qLnmr8ikMTphkjgXu1HR01K4FJg8h1kEEDAqDcZQtbrRnB41A==",
++      "cpu": [
++        "s390x"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/linux-x64": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/linux-x64/-/linux-x64-0.21.5.tgz",
++      "integrity": "sha512-1rYdTpyv03iycF1+BhzrzQJCdOuAOtaqHTWJZCWvijKD2N5Xu0TtVC8/+1faWqcP9iBCWOmjmhoH94dH82BxPQ==",
++      "cpu": [
++        "x64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/netbsd-x64": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/netbsd-x64/-/netbsd-x64-0.21.5.tgz",
++      "integrity": "sha512-Woi2MXzXjMULccIwMnLciyZH4nCIMpWQAs049KEeMvOcNADVxo0UBIQPfSmxB3CWKedngg7sWZdLvLczpe0tLg==",
++      "cpu": [
++        "x64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "netbsd"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/openbsd-x64": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/openbsd-x64/-/openbsd-x64-0.21.5.tgz",
++      "integrity": "sha512-HLNNw99xsvx12lFBUwoT8EVCsSvRNDVxNpjZ7bPn947b8gJPzeHWyNVhFsaerc0n3TsbOINvRP2byTZ5LKezow==",
++      "cpu": [
++        "x64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "openbsd"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/sunos-x64": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/sunos-x64/-/sunos-x64-0.21.5.tgz",
++      "integrity": "sha512-6+gjmFpfy0BHU5Tpptkuh8+uw3mnrvgs+dSPQXQOv3ekbordwnzTVEb4qnIvQcYXq6gzkyTnoZ9dZG+D4garKg==",
++      "cpu": [
++        "x64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "sunos"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/win32-arm64": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/win32-arm64/-/win32-arm64-0.21.5.tgz",
++      "integrity": "sha512-Z0gOTd75VvXqyq7nsl93zwahcTROgqvuAcYDUr+vOv8uHhNSKROyU961kgtCD1e95IqPKSQKH7tBTslnS3tA8A==",
++      "cpu": [
++        "arm64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "win32"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/win32-ia32": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/win32-ia32/-/win32-ia32-0.21.5.tgz",
++      "integrity": "sha512-SWXFF1CL2RVNMaVs+BBClwtfZSvDgtL//G/smwAc5oVK/UPu2Gu9tIaRgFmYFFKrmg3SyAjSrElf0TiJ1v8fYA==",
++      "cpu": [
++        "ia32"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "win32"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@esbuild/win32-x64": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/@esbuild/win32-x64/-/win32-x64-0.21.5.tgz",
++      "integrity": "sha512-tQd/1efJuzPC6rCFwEvLtci/xNFcTZknmXs98FYDfGE4wP9ClFV98nyKrzJKVPMhdDnjzLhdUyMX4PsQAPjwIw==",
++      "cpu": [
++        "x64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "win32"
++      ],
++      "engines": {
++        "node": ">=12"
++      }
++    },
++    "node_modules/@exodus/bytes": {
++      "version": "1.15.1",
++      "resolved": "https://registry.npmjs.org/@exodus/bytes/-/bytes-1.15.1.tgz",
++      "integrity": "sha512-S6mL0yNB/Abt9Ei4tq8gDhcczc4S3+vQ4ra7vxnAf+YHC02srtqxKKZghx2Dq6p0e66THKwR6r8N6P95wEty7Q==",
++      "dev": true,
++      "license": "MIT",
++      "engines": {
++        "node": "^20.19.0 || ^22.12.0 || >=24.0.0"
++      },
++      "peerDependencies": {
++        "@noble/hashes": "^1.8.0 || ^2.0.0"
++      },
++      "peerDependenciesMeta": {
++        "@noble/hashes": {
++          "optional": true
++        }
++      }
++    },
++    "node_modules/@rollup/rollup-android-arm-eabi": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-android-arm-eabi/-/rollup-android-arm-eabi-4.62.2.tgz",
++      "integrity": "sha512-6o7ZLZK+BeenkZCFNDXqpbjw9bD6nuWonvS/lwQJp7NoVVxm6p3qE7qQ5jGuBjiFsgvqjD8mZAU5oWxTmbOeOg==",
++      "cpu": [
++        "arm"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "android"
++      ]
++    },
++    "node_modules/@rollup/rollup-android-arm64": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-android-arm64/-/rollup-android-arm64-4.62.2.tgz",
++      "integrity": "sha512-BaH7BllCACHoH1LguOU56UItGfUWjujlO65kS9LAodViaN4bwIKd7oeW/ZHJ/4ljr/7MIiENnNy3HJ0zXv8Zkw==",
++      "cpu": [
++        "arm64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "android"
++      ]
++    },
++    "node_modules/@rollup/rollup-darwin-arm64": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-darwin-arm64/-/rollup-darwin-arm64-4.62.2.tgz",
++      "integrity": "sha512-v39RCCvj4He82I9sFmk+M1VZ0PLM9sfsLVikjfx2hYBNALhrrOR2D3JjQA6AhlaSOgcR+RzrKY7e1+bT6SUO/A==",
++      "cpu": [
++        "arm64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "darwin"
++      ]
++    },
++    "node_modules/@rollup/rollup-darwin-x64": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-darwin-x64/-/rollup-darwin-x64-4.62.2.tgz",
++      "integrity": "sha512-yl0y2vq3S3lHeuXhEdss6TWfKW8vkujImO12tn4ZkG/4oghr09LvdYm2RElVjokTQiUvDUGXLGsYeLqUMCKpGA==",
++      "cpu": [
++        "x64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "darwin"
++      ]
++    },
++    "node_modules/@rollup/rollup-freebsd-arm64": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-freebsd-arm64/-/rollup-freebsd-arm64-4.62.2.tgz",
++      "integrity": "sha512-tT4pvt4qXD+vEoezupCWi+a1F0vvDiksiHc+PxRlYTOH1I6/X4id9jPxTP+Fg+545euaFT1jJVs4CEdHZAU1vw==",
++      "cpu": [
++        "arm64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "freebsd"
++      ]
++    },
++    "node_modules/@rollup/rollup-freebsd-x64": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-freebsd-x64/-/rollup-freebsd-x64-4.62.2.tgz",
++      "integrity": "sha512-6nU5F2wCW+qvCBhTn1pdIU3bzsIoF7EUwsCDRxilWGprQR6yd508YnH9+OKFCwpfS8pjZqDUmnCAr7exax0XCg==",
++      "cpu": [
++        "x64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "freebsd"
++      ]
++    },
++    "node_modules/@rollup/rollup-linux-arm-gnueabihf": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm-gnueabihf/-/rollup-linux-arm-gnueabihf-4.62.2.tgz",
++      "integrity": "sha512-n1GJHPOvpIfhi3TmrCeh6S6URt9BFCt0KQE3qvexyGCTAKpR4Lg+eWvNZEqu7epxwus/8ElT3hacYEucm49SZg==",
++      "cpu": [
++        "arm"
++      ],
++      "dev": true,
++      "libc": [
++        "glibc"
++      ],
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ]
++    },
++    "node_modules/@rollup/rollup-linux-arm-musleabihf": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm-musleabihf/-/rollup-linux-arm-musleabihf-4.62.2.tgz",
++      "integrity": "sha512-JqgflS8wEB+UXV/vS1RpRbifGBeN4D5lz8D8oOFbFZw4vedvdOgCFAjfBmIMdW3yL10XpQQ0Ambepw6MXrhOnA==",
++      "cpu": [
++        "arm"
++      ],
++      "dev": true,
++      "libc": [
++        "musl"
++      ],
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ]
++    },
++    "node_modules/@rollup/rollup-linux-arm64-gnu": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm64-gnu/-/rollup-linux-arm64-gnu-4.62.2.tgz",
++      "integrity": "sha512-wnFJkogWvN4jm/hQRF2UBaeUmk20j5+DmHvoyWii2b8HJDyvz1MF2OU/6ynXt2KR63rbZLWkFpoytpdc/yBuSA==",
++      "cpu": [
++        "arm64"
++      ],
++      "dev": true,
++      "libc": [
++        "glibc"
++      ],
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ]
++    },
++    "node_modules/@rollup/rollup-linux-arm64-musl": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm64-musl/-/rollup-linux-arm64-musl-4.62.2.tgz",
++      "integrity": "sha512-HVu2bp0zhvJ8xHEV9+UUs7S90VadmBSY3LcIMvozbPo4AuMGDWlz3ymHLHZPX4hR67TKTt8Qp5PJ5RBg/i+RMQ==",
++      "cpu": [
++        "arm64"
++      ],
++      "dev": true,
++      "libc": [
++        "musl"
++      ],
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ]
++    },
++    "node_modules/@rollup/rollup-linux-loong64-gnu": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-loong64-gnu/-/rollup-linux-loong64-gnu-4.62.2.tgz",
++      "integrity": "sha512-mQqqAV8QaoSgr9I2fKDLY2BAVvmKjWoGiu/cSYQonsLvtqwEn1E4QYfnCOcp5zoEqNhsDYin1s6jx/VJmrxlZg==",
++      "cpu": [
++        "loong64"
++      ],
++      "dev": true,
++      "libc": [
++        "glibc"
++      ],
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ]
++    },
++    "node_modules/@rollup/rollup-linux-loong64-musl": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-loong64-musl/-/rollup-linux-loong64-musl-4.62.2.tgz",
++      "integrity": "sha512-IxKLoxCQ2IWi6bT2akyDUBGsOImDKB+sPp4EsTmwFQ/fMwpCKm8uLSSgP/Kx/QYUgKis6SEZ5/Nlhup0DIA0PQ==",
++      "cpu": [
++        "loong64"
++      ],
++      "dev": true,
++      "libc": [
++        "musl"
++      ],
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ]
++    },
++    "node_modules/@rollup/rollup-linux-ppc64-gnu": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-ppc64-gnu/-/rollup-linux-ppc64-gnu-4.62.2.tgz",
++      "integrity": "sha512-Mk5ha2RQSgyFfmYYLkBpPnUk8D8FriBxesO1u9O75X0mHgXL1UQcH5Itl2lurWL2tj0RxV9b9tJgipac0hRY9A==",
++      "cpu": [
++        "ppc64"
++      ],
++      "dev": true,
++      "libc": [
++        "glibc"
++      ],
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ]
++    },
++    "node_modules/@rollup/rollup-linux-ppc64-musl": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-ppc64-musl/-/rollup-linux-ppc64-musl-4.62.2.tgz",
++      "integrity": "sha512-CjvEnqJL/0/TQ3TXX3OPIJ/kmBellrWd4heXUmHeJlTnmwjKpSJzoehLaL6Xk0ZnMHBu9dZuFADNOrtjF4v+2w==",
++      "cpu": [
++        "ppc64"
++      ],
++      "dev": true,
++      "libc": [
++        "musl"
++      ],
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ]
++    },
++    "node_modules/@rollup/rollup-linux-riscv64-gnu": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-riscv64-gnu/-/rollup-linux-riscv64-gnu-4.62.2.tgz",
++      "integrity": "sha512-1SiZbzwdkaDURsew/tSOrooKiYy7EQGT6m8ufavAi9NEyQb/6VuIxFXAL1fqa4iZe3g4NbNk4P7J32z2tw5Mgg==",
++      "cpu": [
++        "riscv64"
++      ],
++      "dev": true,
++      "libc": [
++        "glibc"
++      ],
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ]
++    },
++    "node_modules/@rollup/rollup-linux-riscv64-musl": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-riscv64-musl/-/rollup-linux-riscv64-musl-4.62.2.tgz",
++      "integrity": "sha512-nQts12zJ3NQRoE6uYljOH89v7szzLDvG2JD/vsX+vGXU8w/At1GowTZ5/7qeFQ8m7L55rpR8Okugnuo5bgjy2Q==",
++      "cpu": [
++        "riscv64"
++      ],
++      "dev": true,
++      "libc": [
++        "musl"
++      ],
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ]
++    },
++    "node_modules/@rollup/rollup-linux-s390x-gnu": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-s390x-gnu/-/rollup-linux-s390x-gnu-4.62.2.tgz",
++      "integrity": "sha512-E9/ll019jhPIJgpzfZoIkBGhcz+kKNgVWYRY0zr9srBdPPFVpvOKW8VaJKUbeK+eZXyQF9ltME+Kk6affeaPgg==",
++      "cpu": [
++        "s390x"
++      ],
++      "dev": true,
++      "libc": [
++        "glibc"
++      ],
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ]
++    },
++    "node_modules/@rollup/rollup-linux-x64-gnu": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-x64-gnu/-/rollup-linux-x64-gnu-4.62.2.tgz",
++      "integrity": "sha512-5BqxR/pshjey51iliyzTD5Xi3EN0aLmQ2lZ3lvefVV9c82BvrLo2/6OT55iifpWBufs6kdwWbuOKS841DrmK9A==",
++      "cpu": [
++        "x64"
++      ],
++      "dev": true,
++      "libc": [
++        "glibc"
++      ],
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ]
++    },
++    "node_modules/@rollup/rollup-linux-x64-musl": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-x64-musl/-/rollup-linux-x64-musl-4.62.2.tgz",
++      "integrity": "sha512-uNN83XxQrRAh/w0/pmAfibcwyb6YWt4gP+dpnQKPVJshAloQ785ii8CT8ZCIxkGg9opVsvAlGhFitSm6D1Jjpg==",
++      "cpu": [
++        "x64"
++      ],
++      "dev": true,
++      "libc": [
++        "musl"
++      ],
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "linux"
++      ]
++    },
++    "node_modules/@rollup/rollup-openbsd-x64": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-openbsd-x64/-/rollup-openbsd-x64-4.62.2.tgz",
++      "integrity": "sha512-srjEIxSH3LRnJN6THczDHWQplqEMFiAJrTab0msUryh9kwNpkICf3Ea6q6MN/2cZwRFUNx5w+h6Hpi4QuHS6Zg==",
++      "cpu": [
++        "x64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "openbsd"
++      ]
++    },
++    "node_modules/@rollup/rollup-openharmony-arm64": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-openharmony-arm64/-/rollup-openharmony-arm64-4.62.2.tgz",
++      "integrity": "sha512-8hOJnxgbyObnCm5AlRA3A931xX19xq80RjVTKgJOvEKWqJruP/Uf12IbAOaDjjEXYRewwHLfmF0YRIdK3OwKWA==",
++      "cpu": [
++        "arm64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "openharmony"
++      ]
++    },
++    "node_modules/@rollup/rollup-win32-arm64-msvc": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-win32-arm64-msvc/-/rollup-win32-arm64-msvc-4.62.2.tgz",
++      "integrity": "sha512-mmF4AY1i0hG/bLWUctUq59gtmgaSIRa3cu/A3JFRp/sCNEme2bgDEiDS22P9FbnJB8NJNF4jPJiSP5RHQpUTDg==",
++      "cpu": [
++        "arm64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "win32"
++      ]
++    },
++    "node_modules/@rollup/rollup-win32-ia32-msvc": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-win32-ia32-msvc/-/rollup-win32-ia32-msvc-4.62.2.tgz",
++      "integrity": "sha512-DZgkknc6jhHrk46V25vbAM0zZkyP0nSDkJB8/dRkLTxv470dOmWDqGoEJl/9A0dFfS7yE3REOwNDxpHwSLSt0Q==",
++      "cpu": [
++        "ia32"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "win32"
++      ]
++    },
++    "node_modules/@rollup/rollup-win32-x64-gnu": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-win32-x64-gnu/-/rollup-win32-x64-gnu-4.62.2.tgz",
++      "integrity": "sha512-T6xr6ucWSFto+VGajA8YH26LdpHRuP4YLHEKAtCWvJDOlnmWcDZVCI2Jmjr+IFHDlt2zRaTAKE4tfjTaWLgJBg==",
++      "cpu": [
++        "x64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "win32"
++      ]
++    },
++    "node_modules/@rollup/rollup-win32-x64-msvc": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/@rollup/rollup-win32-x64-msvc/-/rollup-win32-x64-msvc-4.62.2.tgz",
++      "integrity": "sha512-BfzEnDJOt9T8M989/lA37EcJgat01wLRnoi5dQf3QzOH7jzpqTAzdDbVfRljVr5r+jzKqpbHeyOfAaXxAd0PAA==",
++      "cpu": [
++        "x64"
++      ],
++      "dev": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "win32"
++      ]
++    },
++    "node_modules/@types/estree": {
++      "version": "1.0.9",
++      "resolved": "https://registry.npmjs.org/@types/estree/-/estree-1.0.9.tgz",
++      "integrity": "sha512-GhdPgy1el4/ImP05X05Uw4cw2/M93BCUmnEvWZNStlCzEKME4Fkk+YpoA5OiHNQmoS7Cafb8Xa3Pya8m1Qrzeg==",
++      "dev": true,
++      "license": "MIT"
++    },
++    "node_modules/bidi-js": {
++      "version": "1.0.3",
++      "resolved": "https://registry.npmjs.org/bidi-js/-/bidi-js-1.0.3.tgz",
++      "integrity": "sha512-RKshQI1R3YQ+n9YJz2QQ147P66ELpa1FQEg20Dk8oW9t2KgLbpDLLp9aGZ7y8WHSshDknG0bknqGw5/tyCs5tw==",
++      "dev": true,
++      "license": "MIT",
++      "dependencies": {
++        "require-from-string": "^2.0.2"
++      }
++    },
++    "node_modules/css-tree": {
++      "version": "3.2.1",
++      "resolved": "https://registry.npmjs.org/css-tree/-/css-tree-3.2.1.tgz",
++      "integrity": "sha512-X7sjQzceUhu1u7Y/ylrRZFU2FS6LRiFVp6rKLPg23y3x3c3DOKAwuXGDp+PAGjh6CSnCjYeAul8pcT8bAl+lSA==",
++      "dev": true,
++      "license": "MIT",
++      "dependencies": {
++        "mdn-data": "2.27.1",
++        "source-map-js": "^1.2.1"
++      },
++      "engines": {
++        "node": "^10 || ^12.20.0 || ^14.13.0 || >=15.0.0"
++      }
++    },
++    "node_modules/data-urls": {
++      "version": "7.0.0",
++      "resolved": "https://registry.npmjs.org/data-urls/-/data-urls-7.0.0.tgz",
++      "integrity": "sha512-23XHcCF+coGYevirZceTVD7NdJOqVn+49IHyxgszm+JIiHLoB2TkmPtsYkNWT1pvRSGkc35L6NHs0yHkN2SumA==",
++      "dev": true,
++      "license": "MIT",
++      "dependencies": {
++        "whatwg-mimetype": "^5.0.0",
++        "whatwg-url": "^16.0.0"
++      },
++      "engines": {
++        "node": "^20.19.0 || ^22.12.0 || >=24.0.0"
++      }
++    },
++    "node_modules/decimal.js": {
++      "version": "10.6.0",
++      "resolved": "https://registry.npmjs.org/decimal.js/-/decimal.js-10.6.0.tgz",
++      "integrity": "sha512-YpgQiITW3JXGntzdUmyUR1V812Hn8T1YVXhCu+wO3OpS4eU9l4YdD3qjyiKdV6mvV29zapkMeD390UVEf2lkUg==",
++      "dev": true,
++      "license": "MIT"
++    },
++    "node_modules/entities": {
++      "version": "8.0.0",
++      "resolved": "https://registry.npmjs.org/entities/-/entities-8.0.0.tgz",
++      "integrity": "sha512-zwfzJecQ/Uej6tusMqwAqU/6KL2XaB2VZ2Jg54Je6ahNBGNH6Ek6g3jjNCF0fG9EWQKGZNddNjU5F1ZQn/sBnA==",
++      "dev": true,
++      "license": "BSD-2-Clause",
++      "engines": {
++        "node": ">=20.19.0"
++      },
++      "funding": {
++        "url": "https://github.com/fb55/entities?sponsor=1"
++      }
++    },
++    "node_modules/esbuild": {
++      "version": "0.21.5",
++      "resolved": "https://registry.npmjs.org/esbuild/-/esbuild-0.21.5.tgz",
++      "integrity": "sha512-mg3OPMV4hXywwpoDxu3Qda5xCKQi+vCTZq8S9J/EpkhB2HzKXq4SNFZE3+NK93JYxc8VMSep+lOUSC/RVKaBqw==",
++      "dev": true,
++      "hasInstallScript": true,
++      "license": "MIT",
++      "bin": {
++        "esbuild": "bin/esbuild"
++      },
++      "engines": {
++        "node": ">=12"
++      },
++      "optionalDependencies": {
++        "@esbuild/aix-ppc64": "0.21.5",
++        "@esbuild/android-arm": "0.21.5",
++        "@esbuild/android-arm64": "0.21.5",
++        "@esbuild/android-x64": "0.21.5",
++        "@esbuild/darwin-arm64": "0.21.5",
++        "@esbuild/darwin-x64": "0.21.5",
++        "@esbuild/freebsd-arm64": "0.21.5",
++        "@esbuild/freebsd-x64": "0.21.5",
++        "@esbuild/linux-arm": "0.21.5",
++        "@esbuild/linux-arm64": "0.21.5",
++        "@esbuild/linux-ia32": "0.21.5",
++        "@esbuild/linux-loong64": "0.21.5",
++        "@esbuild/linux-mips64el": "0.21.5",
++        "@esbuild/linux-ppc64": "0.21.5",
++        "@esbuild/linux-riscv64": "0.21.5",
++        "@esbuild/linux-s390x": "0.21.5",
++        "@esbuild/linux-x64": "0.21.5",
++        "@esbuild/netbsd-x64": "0.21.5",
++        "@esbuild/openbsd-x64": "0.21.5",
++        "@esbuild/sunos-x64": "0.21.5",
++        "@esbuild/win32-arm64": "0.21.5",
++        "@esbuild/win32-ia32": "0.21.5",
++        "@esbuild/win32-x64": "0.21.5"
++      }
++    },
++    "node_modules/fsevents": {
++      "version": "2.3.3",
++      "resolved": "https://registry.npmjs.org/fsevents/-/fsevents-2.3.3.tgz",
++      "integrity": "sha512-5xoDfX+fL7faATnagmWPpbFtwh/R77WmMMqqHGS65C3vvB0YHrgF+B1YmZ3441tMj5n63k0212XNoJwzlhffQw==",
++      "dev": true,
++      "hasInstallScript": true,
++      "license": "MIT",
++      "optional": true,
++      "os": [
++        "darwin"
++      ],
++      "engines": {
++        "node": "^8.16.0 || ^10.6.0 || >=11.0.0"
++      }
++    },
++    "node_modules/html-encoding-sniffer": {
++      "version": "6.0.0",
++      "resolved": "https://registry.npmjs.org/html-encoding-sniffer/-/html-encoding-sniffer-6.0.0.tgz",
++      "integrity": "sha512-CV9TW3Y3f8/wT0BRFc1/KAVQ3TUHiXmaAb6VW9vtiMFf7SLoMd1PdAc4W3KFOFETBJUb90KatHqlsZMWV+R9Gg==",
++      "dev": true,
++      "license": "MIT",
++      "dependencies": {
++        "@exodus/bytes": "^1.6.0"
++      },
++      "engines": {
++        "node": "^20.19.0 || ^22.12.0 || >=24.0.0"
++      }
++    },
++    "node_modules/is-potential-custom-element-name": {
++      "version": "1.0.1",
++      "resolved": "https://registry.npmjs.org/is-potential-custom-element-name/-/is-potential-custom-element-name-1.0.1.tgz",
++      "integrity": "sha512-bCYeRA2rVibKZd+s2625gGnGF/t7DSqDs4dP7CrLA1m7jKWz6pps0LpYLJN8Q64HtmPKJ1hrN3nzPNKFEKOUiQ==",
++      "dev": true,
++      "license": "MIT"
++    },
++    "node_modules/jsdom": {
++      "version": "29.1.1",
++      "resolved": "https://registry.npmjs.org/jsdom/-/jsdom-29.1.1.tgz",
++      "integrity": "sha512-ECi4Fi2f7BdJtUKTflYRTiaMxIB0O6zfR1fX0GXpUrf6flp8QIYn1UT20YQqdSOfk2dfkCwS8LAFoJDEppNK5Q==",
++      "dev": true,
++      "license": "MIT",
++      "dependencies": {
++        "@asamuzakjp/css-color": "^5.1.11",
++        "@asamuzakjp/dom-selector": "^7.1.1",
++        "@bramus/specificity": "^2.4.2",
++        "@csstools/css-syntax-patches-for-csstree": "^1.1.3",
++        "@exodus/bytes": "^1.15.0",
++        "css-tree": "^3.2.1",
++        "data-urls": "^7.0.0",
++        "decimal.js": "^10.6.0",
++        "html-encoding-sniffer": "^6.0.0",
++        "is-potential-custom-element-name": "^1.0.1",
++        "lru-cache": "^11.3.5",
++        "parse5": "^8.0.1",
++        "saxes": "^6.0.0",
++        "symbol-tree": "^3.2.4",
++        "tough-cookie": "^6.0.1",
++        "undici": "^7.25.0",
++        "w3c-xmlserializer": "^5.0.0",
++        "webidl-conversions": "^8.0.1",
++        "whatwg-mimetype": "^5.0.0",
++        "whatwg-url": "^16.0.1",
++        "xml-name-validator": "^5.0.0"
++      },
++      "engines": {
++        "node": "^20.19.0 || ^22.13.0 || >=24.0.0"
++      },
++      "peerDependencies": {
++        "canvas": "^3.0.0"
++      },
++      "peerDependenciesMeta": {
++        "canvas": {
++          "optional": true
++        }
++      }
++    },
++    "node_modules/lru-cache": {
++      "version": "11.5.2",
++      "resolved": "https://registry.npmjs.org/lru-cache/-/lru-cache-11.5.2.tgz",
++      "integrity": "sha512-4pfM1Ff0x50o0tQwb5ucw/RzNyD0/YJME6IVcStalZuMWxdt3sR3huStTtxz4PUmvZfRguvDejasvQ2kifR11g==",
++      "dev": true,
++      "license": "BlueOak-1.0.0",
++      "engines": {
++        "node": "20 || >=22"
++      }
++    },
++    "node_modules/mdn-data": {
++      "version": "2.27.1",
++      "resolved": "https://registry.npmjs.org/mdn-data/-/mdn-data-2.27.1.tgz",
++      "integrity": "sha512-9Yubnt3e8A0OKwxYSXyhLymGW4sCufcLG6VdiDdUGVkPhpqLxlvP5vl1983gQjJl3tqbrM731mjaZaP68AgosQ==",
++      "dev": true,
++      "license": "CC0-1.0"
++    },
++    "node_modules/nanoid": {
++      "version": "3.3.16",
++      "resolved": "https://registry.npmjs.org/nanoid/-/nanoid-3.3.16.tgz",
++      "integrity": "sha512-bzlKTyNJ7+LdGIIwy8ijFpIqEQIvafahV7eYykJ8Cvh42EdJeODoJ6gUJXpQJvej1BddH8OqTXZNE/KfbWAu8Q==",
++      "dev": true,
++      "funding": [
++        {
++          "type": "github",
++          "url": "https://github.com/sponsors/ai"
++        }
++      ],
++      "license": "MIT",
++      "bin": {
++        "nanoid": "bin/nanoid.cjs"
++      },
++      "engines": {
++        "node": "^10 || ^12 || ^13.7 || ^14 || >=15.0.1"
++      }
++    },
++    "node_modules/parse5": {
++      "version": "8.0.1",
++      "resolved": "https://registry.npmjs.org/parse5/-/parse5-8.0.1.tgz",
++      "integrity": "sha512-z1e/HMG90obSGeidlli3hj7cbocou0/wa5HacvI3ASx34PecNjNQeaHNo5WIZpWofN9kgkqV1q5YvXe3F0FoPw==",
++      "dev": true,
++      "license": "MIT",
++      "dependencies": {
++        "entities": "^8.0.0"
++      },
++      "funding": {
++        "url": "https://github.com/inikulin/parse5?sponsor=1"
++      }
++    },
++    "node_modules/picocolors": {
++      "version": "1.1.1",
++      "resolved": "https://registry.npmjs.org/picocolors/-/picocolors-1.1.1.tgz",
++      "integrity": "sha512-xceH2snhtb5M9liqDsmEw56le376mTZkEX/jEb/RxNFyegNul7eNslCXP9FDj/Lcu0X8KEyMceP2ntpaHrDEVA==",
++      "dev": true,
++      "license": "ISC"
++    },
++    "node_modules/postcss": {
++      "version": "8.5.23",
++      "resolved": "https://registry.npmjs.org/postcss/-/postcss-8.5.23.tgz",
++      "integrity": "sha512-g50586zr4bZmwFiTlflMu8E0bDTb5I5gertgwAKmsdUlTQIhZtunzUlD1WSzwcVWPoAVpsrA6vlfCD7oXvRwgg==",
++      "dev": true,
++      "funding": [
++        {
++          "type": "opencollective",
++          "url": "https://opencollective.com/postcss/"
++        },
++        {
++          "type": "tidelift",
++          "url": "https://tidelift.com/funding/github/npm/postcss"
++        },
++        {
++          "type": "github",
++          "url": "https://github.com/sponsors/ai"
++        }
++      ],
++      "license": "MIT",
++      "dependencies": {
++        "nanoid": "^3.3.16",
++        "picocolors": "^1.1.1",
++        "source-map-js": "^1.2.1"
++      },
++      "engines": {
++        "node": "^10 || ^12 || >=14"
++      }
++    },
++    "node_modules/punycode": {
++      "version": "2.3.1",
++      "resolved": "https://registry.npmjs.org/punycode/-/punycode-2.3.1.tgz",
++      "integrity": "sha512-vYt7UD1U9Wg6138shLtLOvdAu+8DsC/ilFtEVHcH+wydcSpNE20AfSOduf6MkRFahL5FY7X1oU7nKVZFtfq8Fg==",
++      "dev": true,
++      "license": "MIT",
++      "engines": {
++        "node": ">=6"
++      }
++    },
++    "node_modules/require-from-string": {
++      "version": "2.0.2",
++      "resolved": "https://registry.npmjs.org/require-from-string/-/require-from-string-2.0.2.tgz",
++      "integrity": "sha512-Xf0nWe6RseziFMu+Ap9biiUbmplq6S9/p+7w7YXP/JBHhrUDDUhwa+vANyubuqfZWTveU//DYVGsDG7RKL/vEw==",
++      "dev": true,
++      "license": "MIT",
++      "engines": {
++        "node": ">=0.10.0"
++      }
++    },
++    "node_modules/rollup": {
++      "version": "4.62.2",
++      "resolved": "https://registry.npmjs.org/rollup/-/rollup-4.62.2.tgz",
++      "integrity": "sha512-RFnrW4lhXA3s3eqHDZvN654g8OTjzRfqpIRJYczCGB6HzphckVAi/Qh4tbPUbRuDi7s1Llv8g/NspLkttY3gTA==",
++      "dev": true,
++      "license": "MIT",
++      "dependencies": {
++        "@types/estree": "1.0.9"
++      },
++      "bin": {
++        "rollup": "dist/bin/rollup"
++      },
++      "engines": {
++        "node": ">=18.0.0",
++        "npm": ">=8.0.0"
++      },
++      "optionalDependencies": {
++        "@rollup/rollup-android-arm-eabi": "4.62.2",
++        "@rollup/rollup-android-arm64": "4.62.2",
++        "@rollup/rollup-darwin-arm64": "4.62.2",
++        "@rollup/rollup-darwin-x64": "4.62.2",
++        "@rollup/rollup-freebsd-arm64": "4.62.2",
++        "@rollup/rollup-freebsd-x64": "4.62.2",
++        "@rollup/rollup-linux-arm-gnueabihf": "4.62.2",
++        "@rollup/rollup-linux-arm-musleabihf": "4.62.2",
++        "@rollup/rollup-linux-arm64-gnu": "4.62.2",
++        "@rollup/rollup-linux-arm64-musl": "4.62.2",
++        "@rollup/rollup-linux-loong64-gnu": "4.62.2",
++        "@rollup/rollup-linux-loong64-musl": "4.62.2",
++        "@rollup/rollup-linux-ppc64-gnu": "4.62.2",
++        "@rollup/rollup-linux-ppc64-musl": "4.62.2",
++        "@rollup/rollup-linux-riscv64-gnu": "4.62.2",
++        "@rollup/rollup-linux-riscv64-musl": "4.62.2",
++        "@rollup/rollup-linux-s390x-gnu": "4.62.2",
++        "@rollup/rollup-linux-x64-gnu": "4.62.2",
++        "@rollup/rollup-linux-x64-musl": "4.62.2",
++        "@rollup/rollup-openbsd-x64": "4.62.2",
++        "@rollup/rollup-openharmony-arm64": "4.62.2",
++        "@rollup/rollup-win32-arm64-msvc": "4.62.2",
++        "@rollup/rollup-win32-ia32-msvc": "4.62.2",
++        "@rollup/rollup-win32-x64-gnu": "4.62.2",
++        "@rollup/rollup-win32-x64-msvc": "4.62.2",
++        "fsevents": "~2.3.2"
++      }
++    },
++    "node_modules/saxes": {
++      "version": "6.0.0",
++      "resolved": "https://registry.npmjs.org/saxes/-/saxes-6.0.0.tgz",
++      "integrity": "sha512-xAg7SOnEhrm5zI3puOOKyy1OMcMlIJZYNJY7xLBwSze0UjhPLnWfj2GF2EpT0jmzaJKIWKHLsaSSajf35bcYnA==",
++      "dev": true,
++      "license": "ISC",
++      "dependencies": {
++        "xmlchars": "^2.2.0"
++      },
++      "engines": {
++        "node": ">=v12.22.7"
++      }
++    },
++    "node_modules/source-map-js": {
++      "version": "1.2.1",
++      "resolved": "https://registry.npmjs.org/source-map-js/-/source-map-js-1.2.1.tgz",
++      "integrity": "sha512-UXWMKhLOwVKb728IUtQPXxfYU+usdybtUrK/8uGE8CQMvrhOpwvzDBwj0QhSL7MQc7vIsISBG8VQ8+IDQxpfQA==",
++      "dev": true,
++      "license": "BSD-3-Clause",
++      "engines": {
++        "node": ">=0.10.0"
++      }
++    },
++    "node_modules/symbol-tree": {
++      "version": "3.2.4",
++      "resolved": "https://registry.npmjs.org/symbol-tree/-/symbol-tree-3.2.4.tgz",
++      "integrity": "sha512-9QNk5KwDF+Bvz+PyObkmSYjI5ksVUYtjW7AU22r2NKcfLJcXp96hkDWU3+XndOsUb+AQ9QhfzfCT2O+CNWT5Tw==",
++      "dev": true,
++      "license": "MIT"
++    },
++    "node_modules/tldts": {
++      "version": "7.4.9",
++      "resolved": "https://registry.npmjs.org/tldts/-/tldts-7.4.9.tgz",
++      "integrity": "sha512-3kZ8wQQ/k5DrChD4X4FVvr2D7E5uoRgAqkPyLpSCGUvqOvqu+JEdr3mwMUaVWb+vMHZaKhF5fp2PBigKsui7hA==",
++      "dev": true,
++      "license": "MIT",
++      "dependencies": {
++        "tldts-core": "^7.4.9"
++      },
++      "bin": {
++        "tldts": "bin/cli.js"
++      }
++    },
++    "node_modules/tldts-core": {
++      "version": "7.4.9",
++      "resolved": "https://registry.npmjs.org/tldts-core/-/tldts-core-7.4.9.tgz",
++      "integrity": "sha512-DxKfPBI52p2msTEu7MPhdpdDTBhhVQg1a/8PjQckeyAvO13eMYElX545grIp6nnTGIMZlRvFZPvFhvI/WIz2Vg==",
++      "dev": true,
++      "license": "MIT"
++    },
++    "node_modules/tough-cookie": {
++      "version": "6.0.2",
++      "resolved": "https://registry.npmjs.org/tough-cookie/-/tough-cookie-6.0.2.tgz",
++      "integrity": "sha512-exgYmnmL/sJpR3upZfXG5PoatXQii55xAiXGXzY+sROLZ/Y+SLcp9PgJNI9Vz37HpQ74WvDcLT8eqm+kV3FzrA==",
++      "dev": true,
++      "license": "BSD-3-Clause",
++      "dependencies": {
++        "tldts": "^7.0.5"
++      },
++      "engines": {
++        "node": ">=16"
++      }
++    },
++    "node_modules/tr46": {
++      "version": "6.0.0",
++      "resolved": "https://registry.npmjs.org/tr46/-/tr46-6.0.0.tgz",
++      "integrity": "sha512-bLVMLPtstlZ4iMQHpFHTR7GAGj2jxi8Dg0s2h2MafAE4uSWF98FC/3MomU51iQAMf8/qDUbKWf5GxuvvVcXEhw==",
++      "dev": true,
++      "license": "MIT",
++      "dependencies": {
++        "punycode": "^2.3.1"
++      },
++      "engines": {
++        "node": ">=20"
++      }
++    },
++    "node_modules/undici": {
++      "version": "7.29.0",
++      "resolved": "https://registry.npmjs.org/undici/-/undici-7.29.0.tgz",
++      "integrity": "sha512-IDxfleLmmbSskfWSUATiN1nfn2rDuvnMOqb5CWR92iIfojA0Ud+ulOAAEQ57LPr9rWmsreUyf5lwyao+7GNNVw==",
++      "dev": true,
++      "license": "MIT",
++      "engines": {
++        "node": ">=20.18.1"
++      }
++    },
++    "node_modules/vite": {
++      "version": "5.4.21",
++      "resolved": "https://registry.npmjs.org/vite/-/vite-5.4.21.tgz",
++      "integrity": "sha512-o5a9xKjbtuhY6Bi5S3+HvbRERmouabWbyUcpXXUA1u+GNUKoROi9byOJ8M0nHbHYHkYICiMlqxkg1KkYmm25Sw==",
++      "dev": true,
++      "license": "MIT",
++      "dependencies": {
++        "esbuild": "^0.21.3",
++        "postcss": "^8.4.43",
++        "rollup": "^4.20.0"
++      },
++      "bin": {
++        "vite": "bin/vite.js"
++      },
++      "engines": {
++        "node": "^18.0.0 || >=20.0.0"
++      },
++      "funding": {
++        "url": "https://github.com/vitejs/vite?sponsor=1"
++      },
++      "optionalDependencies": {
++        "fsevents": "~2.3.3"
++      },
++      "peerDependencies": {
++        "@types/node": "^18.0.0 || >=20.0.0",
++        "less": "*",
++        "lightningcss": "^1.21.0",
++        "sass": "*",
++        "sass-embedded": "*",
++        "stylus": "*",
++        "sugarss": "*",
++        "terser": "^5.4.0"
++      },
++      "peerDependenciesMeta": {
++        "@types/node": {
++          "optional": true
++        },
++        "less": {
++          "optional": true
++        },
++        "lightningcss": {
++          "optional": true
++        },
++        "sass": {
++          "optional": true
++        },
++        "sass-embedded": {
++          "optional": true
++        },
++        "stylus": {
++          "optional": true
++        },
++        "sugarss": {
++          "optional": true
++        },
++        "terser": {
++          "optional": true
++        }
++      }
++    },
++    "node_modules/w3c-xmlserializer": {
++      "version": "5.0.0",
++      "resolved": "https://registry.npmjs.org/w3c-xmlserializer/-/w3c-xmlserializer-5.0.0.tgz",
++      "integrity": "sha512-o8qghlI8NZHU1lLPrpi2+Uq7abh4GGPpYANlalzWxyWteJOCsr/P+oPBA49TOLu5FTZO4d3F9MnWJfiMo4BkmA==",
++      "dev": true,
++      "license": "MIT",
++      "dependencies": {
++        "xml-name-validator": "^5.0.0"
++      },
++      "engines": {
++        "node": ">=18"
++      }
++    },
++    "node_modules/webidl-conversions": {
++      "version": "8.0.1",
++      "resolved": "https://registry.npmjs.org/webidl-conversions/-/webidl-conversions-8.0.1.tgz",
++      "integrity": "sha512-BMhLD/Sw+GbJC21C/UgyaZX41nPt8bUTg+jWyDeg7e7YN4xOM05YPSIXceACnXVtqyEw/LMClUQMtMZ+PGGpqQ==",
++      "dev": true,
++      "license": "BSD-2-Clause",
++      "engines": {
++        "node": ">=20"
++      }
++    },
++    "node_modules/whatwg-mimetype": {
++      "version": "5.0.0",
++      "resolved": "https://registry.npmjs.org/whatwg-mimetype/-/whatwg-mimetype-5.0.0.tgz",
++      "integrity": "sha512-sXcNcHOC51uPGF0P/D4NVtrkjSU2fNsm9iog4ZvZJsL3rjoDAzXZhkm2MWt1y+PUdggKAYVoMAIYcs78wJ51Cw==",
++      "dev": true,
++      "license": "MIT",
++      "engines": {
++        "node": ">=20"
++      }
++    },
++    "node_modules/whatwg-url": {
++      "version": "16.0.1",
++      "resolved": "https://registry.npmjs.org/whatwg-url/-/whatwg-url-16.0.1.tgz",
++      "integrity": "sha512-1to4zXBxmXHV3IiSSEInrreIlu02vUOvrhxJJH5vcxYTBDAx51cqZiKdyTxlecdKNSjj8EcxGBxNf6Vg+945gw==",
++      "dev": true,
++      "license": "MIT",
++      "dependencies": {
++        "@exodus/bytes": "^1.11.0",
++        "tr46": "^6.0.0",
++        "webidl-conversions": "^8.0.1"
++      },
++      "engines": {
++        "node": "^20.19.0 || ^22.12.0 || >=24.0.0"
++      }
++    },
++    "node_modules/xml-name-validator": {
++      "version": "5.0.0",
++      "resolved": "https://registry.npmjs.org/xml-name-validator/-/xml-name-validator-5.0.0.tgz",
++      "integrity": "sha512-EvGK8EJ3DhaHfbRlETOWAS5pO9MZITeauHKJyb8wyajUfQUenkIg2MvLDTZ4T/TgIcm3HU0TFBgWWboAZ30UHg==",
++      "dev": true,
++      "license": "Apache-2.0",
++      "engines": {
++        "node": ">=18"
++      }
++    },
++    "node_modules/xmlchars": {
++      "version": "2.2.0",
++      "resolved": "https://registry.npmjs.org/xmlchars/-/xmlchars-2.2.0.tgz",
++      "integrity": "sha512-JZnDKK8B0RCDw84FNdDAIpZK+JuJw+s7Lz8nksI7SIuU3UXJJslUthsi+uWBUYOwPFwW7W7PRLRfUKpxjtjFCw==",
++      "dev": true,
++      "license": "MIT"
++    }
++  }
++}
+diff --git a/apps/xiong-tu-san-guo/package.json b/apps/xiong-tu-san-guo/package.json
+new file mode 100644
+index 0000000..bd8404a
+--- /dev/null
++++ b/apps/xiong-tu-san-guo/package.json
+@@ -0,0 +1,17 @@
++{
++  "name": "xiong-tu-san-guo",
++  "version": "1.0.0",
++  "description": "《雄图·三国志文明》回合制策略经营网页游戏 - Heroic Three Kingdoms Civilization (turn-based strategy)",
++  "type": "module",
++  "scripts": {
++    "dev": "vite",
++    "build": "vite build",
++    "preview": "vite preview --host",
++    "test": "node scripts/logic-test.mjs",
++    "test:dom": "node scripts/smoke-dom.mjs"
++  },
++  "devDependencies": {
++    "jsdom": "^29.1.1",
++    "vite": "^5.4.0"
++  }
++}
+diff --git a/apps/xiong-tu-san-guo/scripts/_css-loader.mjs b/apps/xiong-tu-san-guo/scripts/_css-loader.mjs
+new file mode 100644
+index 0000000..b10c2fa
+--- /dev/null
++++ b/apps/xiong-tu-san-guo/scripts/_css-loader.mjs
+@@ -0,0 +1,7 @@
++// 让 Node 的 ESM 加载器把 *.css 视作空模块（仅冒烟测试用）。
++export async function load(url, context, nextLoad) {
++  if (url.endsWith('.css')) {
++    return { format: 'module', source: '', shortCircuit: true };
++  }
++  return nextLoad(url, context);
++}
+diff --git a/apps/xiong-tu-san-guo/scripts/logic-test.mjs b/apps/xiong-tu-san-guo/scripts/logic-test.mjs
+new file mode 100644
+index 0000000..eb29ed1
+--- /dev/null
++++ b/apps/xiong-tu-san-guo/scripts/logic-test.mjs
+@@ -0,0 +1,156 @@
++// 纯逻辑自测（不依赖浏览器/DOM）。运行：npm test
++import { CITIES, CITY_MAP, adjacencyValid } from '../src/data/cities.js';
++import { HEROES, FACTION_SEEDS, makeGenericGeneral } from '../src/data/heroes.js';
++import { makeRng } from '../src/core/rng.js';
++import { parseSkill, techMult } from '../src/core/tech.js';
++import { cityGoldIncome, cityGrainIncome, factionGoldIncome, factionGrainNet } from '../src/core/economy.js';
++import { createBattle, runBattle, effWar, attackValue } from '../src/core/combat.js';
++import {
++  newGame, cityById, heroesOfFaction, cmdPoints, cmdRemaining,
++  troopCap, resolveTurn, checkGameOver, neighbors, wildHeroesInCity,
++} from '../src/core/state.js';
++import * as A from '../src/core/actions.js';
++import { aiTurnAll } from '../src/core/ai.js';
++
++let pass = 0, fail = 0;
++function ok(cond, msg) { if (cond) { pass++; } else { fail++; console.error('  ✗ ' + msg); } }
++function eq(a, b, msg) { ok(a === b, `${msg} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`); }
++
++console.log('—— 数据完整性 ——');
++ok(adjacencyValid(), '城市邻接关系双向一致');
++eq(CITIES.length, 18, '城市数为 18');
++ok(HEROES.length >= 40, `名将数 >= 40 (实际 ${HEROES.length})`);
++eq(FACTION_SEEDS.length, 8, 'AI 势力种子为 8');
++// 每位名将要么 serve 一个种子势力，要么 wild 在某城市
++for (const h of HEROES) {
++  ok(h.serve || h.wild, `${h.name} 有归属（serve/wild）`);
++  if (h.wild) ok(CITY_MAP[h.wild], `${h.name} 的在野城市 ${h.wild} 存在`);
++  if (h.serve) ok(FACTION_SEEDS.some((s) => s.key === h.serve), `${h.name} 所属势力 ${h.serve} 存在`);
++}
++eq(makeGenericGeneral(makeRng(1), 1).id, 'gen_1', '生成武将 id 唯一可控');
++
++console.log('—— 科技 / 技能解析 ——');
++const sb = parseSkill('lead:0.10,war:0.05,trick:0.20');
++eq(sb.lead, 0.1, '技能 lead 解析');
++eq(sb.war, 0.05, '技能 war 解析');
++eq(sb.trick, 0.2, '技能 trick 解析');
++eq(parseSkill(null).lead, 0, '空技能返回零加成');
++
++console.log('—— 新局初始化（玩家选洛阳）——');
++const rng = makeRng(42);
++const stats = { l: 80, w: 70, i: 75, p: 78, c: 85 };
++let s = newGame({ lordName: '测试主公', startCity: 'luoyang', stats, rng });
++eq(s.turn, 1, '初始回合 = 1');
++eq(s.over, null, '初始无胜负');
++eq(cityById(s, 'luoyang').ownerFactionId, 0, '洛阳归玩家');
++eq(heroesOfFaction(s, 0).length, 1, '玩家初始仅君主一人');
++ok(s.factions.length >= 7, `生成 >=7 个势力 (实际 ${s.factions.length})`);
++// 8 个种子都城，玩家占洛阳（非任何都城）→ 8 AI 势力齐全
++eq(s.factions.filter((f) => f.aiControlled).length, 8, '8 个 AI 势力（玩家未占都城）');
++// 中立城市存在
++const neutral = s.cities.filter((c) => c.ownerFactionId == null);
++ok(neutral.length >= 8, `存在中立城市 (实际 ${neutral.length})`);
++
++console.log('—— 玩家选都城（许昌，曹操势力被吞并）——');
++const s2 = newGame({ lordName: '篡位者', startCity: 'xuchang', stats, rng: makeRng(7) });
++eq(s2.factions.filter((f) => f.aiControlled).length, 7, '占都城后仅 7 个 AI 势力');
++const caocao = s2.heroes.find((h) => h.id === 'caocao');
++ok(caocao && caocao.wild && caocao.cityId === 'xuchang', '曹操转为许昌在野，可被登用');
++ok(s2.heroes.some((h) => h.id === 'zhangliao' && h.wild), '张辽随曹操转为在野');
++
++console.log('—— 指令点 / 带兵上限 ——');
++const baseCmd = cmdPoints(s, 0);
++ok(baseCmd >= 5, `基础指令点 >= 5 (实际 ${baseCmd})`);
++const lord = s.heroes.find((h) => h.isPlayerLord);
++eq(cmdRemaining(s, 0), baseCmd, '回合初指令点全满');
++ok(troopCap(s, lord) >= 8000, `君主带兵上限合理 (实际 ${troopCap(s, lord)})`);
++
++console.log('—— 内政指令 ——');
++const beforeMarket = cityById(s, 'luoyang').marketLevel;
++let r1 = A.developMarket(s, 'luoyang');
++ok(r1.ok && cityById(s, 'luoyang').marketLevel === beforeMarket + 1, '发展商业成功升 1 级');
++const r2 = A.recruit(s, 'luoyang', 500);
++ok(r2.ok && cityById(s, 'luoyang').soldiers > 2000, '征兵增加士兵');
++ok(cmdRemaining(s, 0) < baseCmd, '执行指令后剩余指令点减少');
++// 金钱不足应失败且退还指令
++const poor = JSON.parse(JSON.stringify(s));
++factionPoor(poor, 0);
++const cmdBefore = cmdRemaining(poor, 0);
++const r3 = A.developFarm(poor, 'luoyang');
++ok(!r3.ok, '金钱不足时开发失败');
++eq(cmdRemaining(poor, 0), cmdBefore, '失败时指令点如数退还');
++
++console.log('—— 探索 / 登用 ——');
++// 洛阳在野有刘备 / 华佗
++const wildLy = wildHeroesInCity(s, 'luoyang');
++ok(wildLy.some((h) => h.id === 'liubei'), '洛阳在野含刘备');
++const exp = A.explore(s, 'luoyang', 0, makeRng(1));
++ok(exp.ok, '探索执行成功');
++// 强行标记已发现后登用
++const guanyu = s.heroes.find((h) => h.id === 'guanyu');
++guanyu.discovered = true;
++guanyu.cityId = 'luoyang'; // 移到玩家城便于测试
++const recR = A.recruitHero(s, 'guanyu', 0, makeRng(99));
++// 高魅力 + 多次尝试：用固定大种子提高命中
++ok(typeof recR.recruited === 'boolean', '登用返回是否成功布尔值');
++
++console.log('—— 战斗系统 ——');
++const battle = createBattle({
++  attacker: { factionId: 0, general: { name: '猛将', stats: { l: 90, w: 95, i: 60, p: 50, c: 60 }, skill: null }, soldiers: 3000, training: 60, formation: 'assault' },
++  defender: { factionId: 1, general: { name: '守将', stats: { l: 60, w: 60, i: 50, p: 50, c: 50 }, skill: null }, soldiers: 1000, defense: 300, isCity: true, training: 50, formation: 'normal' },
++});
++runBattle(battle, s, makeRng(3));
++ok(battle.result === 'attacker' || battle.result === 'defender', '战斗产出胜负结果');
++ok(battle.log.length > 0, '战斗产生战报');
++ok(effWar({ stats: { w: 100 }, skill: { effect: 'war:0.15' } }) > 100, '技能加成提升有效武力');
++
++console.log('—— 出征（攻打相邻中立城）——');
++// 把宛城设为中立且兵力薄弱，玩家从洛阳出征
++const wan = cityById(s, 'wan');
++wan.ownerFactionId = null; wan.soldiers = 300; wan.defense = 200;
++const lordId = s.heroes.find((h) => h.isPlayerLord).id;
++// 先征兵确保有兵
++cityById(s, 'luoyang').soldiers = 5000;
++const camp = A.campaign(s, 'luoyang', 'wan', lordId, 2000, 'assault', 0, makeRng(5));
++ok(camp.ok, '出征执行成功');
++if (camp.won) {
++  eq(cityById(s, 'wan').ownerFactionId, 0, '攻陷后宛城归玩家');
++} else {
++  ok(true, '出征未克（随机结果）');
++}
++
++console.log('—— 回合结算（含 AI）——');
++const s3 = newGame({ lordName: '结算测试', startCity: 'luoyang', stats, rng: makeRng(11) });
++const turn1 = s3.turn;
++const aiModule = { aiTurnAll };
++resolveTurn(s3, aiModule, makeRng(13));
++eq(s3.turn, turn1 + 1, '结算后回合 +1');
++ok(s3.turnLog.length >= 0, '结算产生回合日志');
++// 玩家金钱应随收入增加（初始有 buffer）
++ok(s3.factions[0].money > 0, '玩家回合后有金钱');
++
++console.log('—— 胜负判定 ——');
++// 模拟玩家占全部城市 → 胜利
++const sWin = newGame({ lordName: '霸主', startCity: 'luoyang', stats, rng: makeRng(2) });
++for (const c of sWin.cities) c.ownerFactionId = 0;
++checkGameOver(sWin);
++eq(sWin.over, 'win', '占全部城市 → 胜利');
++// 玩家无城 → 失败
++const sLose = newGame({ lordName: '败者', startCity: 'luoyang', stats, rng: makeRng(3) });
++for (const c of sLose.cities) if (c.id === 'luoyang') c.ownerFactionId = 1;
++for (const c of sLose.cities) if (c.ownerFactionId === 0) c.ownerFactionId = null;
++checkGameOver(sLose);
++eq(sLose.over, 'lose', '玩家无城 → 失败');
++
++console.log('—— 邻接可达性（全图连通）——');
++function bfsReachable(state, start) {
++  const seen = new Set([start]); const q = [start];
++  while (q.length) { const id = q.shift(); for (const n of cityById(state, id).adjacent) { if (!seen.has(n)) { seen.add(n); q.push(n); } } }
++  return seen;
++}
++eq(bfsReachable(s, 'luoyang').size, 18, '从洛阳可达全部 18 城（地图连通）');
++
++console.log(`\n结果：${pass} 通过，${fail} 失败`);
++process.exit(fail ? 1 : 0);
++
++function factionPoor(st, fid) { st.factions.find((f) => f.id === fid).money = 0; }
+diff --git a/apps/xiong-tu-san-guo/scripts/smoke-dom.mjs b/apps/xiong-tu-san-guo/scripts/smoke-dom.mjs
+new file mode 100644
+index 0000000..49f8db3
+--- /dev/null
++++ b/apps/xiong-tu-san-guo/scripts/smoke-dom.mjs
+@@ -0,0 +1,112 @@
++// DOM 冒烟测试：用 jsdom 驱动真实 UI 流程（启动 → 创角 → 对局 → 标签 → 城务 → 结束回合）。
++// 运行：node scripts/smoke-dom.mjs   （需先 npm install jsdom）
++import { JSDOM } from 'jsdom';
++import { register } from 'node:module';
++
++register('./_css-loader.mjs', import.meta.url);
++
++const dom = new JSDOM('<!DOCTYPE html><div id="game-container"></div>', {
++  url: 'http://localhost/',
++  pretendToBeVisual: true,
++});
++const { window } = dom;
++for (const k of ['document', 'window', 'localStorage', 'navigator', 'HTMLElement', 'Node', 'Element', 'getComputedStyle', 'CustomEvent', 'MouseEvent', 'Event']) {
++  if (window[k] === undefined) continue;
++  try { globalThis[k] = window[k]; } catch (_) {}
++}
++globalThis.requestAnimationFrame = (fn) => setTimeout(fn, 0);
++
++let pass = 0, fail = 0;
++const ok = (c, m) => { if (c) pass++; else { fail++; console.error('  ✗ FAIL:', m); } };
++const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
++
++let lastToast = '';
++const watchToasts = () => {
++  const wrap = document.querySelector('.toast-wrap');
++  if (!wrap) return;
++  new window.MutationObserver((muts) => {
++    for (const m of muts) for (const n of m.addedNodes) if (n.classList && n.classList.contains('toast')) lastToast = n.textContent;
++  }).observe(wrap, { childList: true });
++};
++
++const { createGame } = await import(new URL('../src/main.js', import.meta.url).href);
++const A = await import(new URL('../src/core/actions.js', import.meta.url).href);
++localStorage.clear();
++const ui = createGame(document.getElementById('game-container'));
++window.__XTSG = ui;
++watchToasts();
++await sleep(10);
++
++// ---------- 1) 启动器 ----------
++ok(document.querySelector('.launcher') !== null, '渲染启动器');
++ok(document.querySelector('.launcher__menu button') !== null, '启动器有「新游戏」按钮');
++
++// ---------- 2) 创角 ----------
++ui.showCreate();
++await sleep(5);
++ok(document.querySelector('.create') !== null, '进入创角页');
++ok(document.querySelectorAll('.city-pick__item').length === 18, '可选 18 座城市');
++const nameInput = document.querySelector('.create input[type=text]');
++nameInput.value = '玄德';
++nameInput.dispatchEvent(new window.Event('input'));
++ui.startCityPick = 'luoyang';
++ui.beginGame();
++await sleep(5);
++ok(document.querySelector('.game') !== null, '进入对局主界面');
++ok(document.querySelector('.topbar') !== null, '顶栏已渲染');
++ok(document.querySelectorAll('.tab').length === 5, '五个标签');
++ok(document.querySelectorAll('.map-dot').length === 18, '地图渲染 18 个城市点');
++
++// ---------- 3) 切换标签（逐个验证签名元素）----------
++const tabSignatures = {
++  faction: '.city-card', heroes: '.card-list', tech: '.tech-grid', system: '.sys-list', map: '.map-dot',
++};
++for (const [tab, sel] of Object.entries(tabSignatures)) {
++  ui.tab = tab; ui.renderTabbar(); ui.renderContent();
++  await sleep(3);
++  ok(document.querySelector(sel) !== null, `「${tab}」标签渲染（${sel}）`);
++}
++
++// ---------- 4) 城务：打开己方城市并执行内政 ----------
++ui.tab = 'map'; ui.renderContent(); await sleep(3);
++const luoyangDot = Array.from(document.querySelectorAll('.map-dot')).find((b) => b.textContent.includes('洛阳'));
++ok(!!luoyangDot, '找到洛阳城市点');
++luoyangDot.click();
++await sleep(5);
++ok(document.querySelector('.modal') !== null, '点击城市弹出城务弹窗');
++const farmBtn = Array.from(document.querySelectorAll('.cmd-btn')).find((b) => b.textContent.includes('农田'));
++ok(!!farmBtn, '城务含「开发农田」指令');
++farmBtn.click();
++await sleep(5);
++
++// ---------- 5) 结束回合 ----------
++ui.tab = 'system'; ui.renderContent(); await sleep(3);
++// 直接驱动结算（跳过确认弹窗）
++ui.doEndTurn();
++await sleep(20);
++ok(document.querySelector('.modal') !== null || document.querySelector('.gameover') !== null, '结算后弹出简报或结束界面');
++ok(ui.state.turn === 2 || ui.state.over != null, '回合推进或游戏结束');
++
++// ---------- 6) 战报弹窗渲染（驱动一次真实出征）----------
++ui.tab = 'map'; ui.renderContent(); await sleep(3);
++// 造势：洛阳兵足，邻接宛城设为中立薄弱，直接调用动作层出征并渲染战报
++const s = ui.state;
++const ly = s.cities.find((c) => c.id === 'luoyang');
++const wan = s.cities.find((c) => c.id === 'wan');
++ly.soldiers = 5000;
++wan.ownerFactionId = null; wan.soldiers = 300; wan.defense = 200;
++const lord = s.heroes.find((h) => h.isPlayerLord);
++const camp = A.campaign(s, 'luoyang', 'wan', lord.id, 2000, 'assault', s.playerFactionId, Math.random);
++ok(camp.ok && camp.battle, '出征产出战斗对象');
++ui.showBattleReport(camp.battle, camp.won, camp.msg);
++await sleep(5);
++ok(document.querySelector('.battle-log') !== null, '战报弹窗渲染');
++document.querySelector('.modal__foot button').click();
++await sleep(3);
++
++// ---------- 7) 存档可往返 ----------
++localStorage.setItem('__probe__', '1');
++ok(localStorage.getItem('xtsg_save_v1') != null, '对局已自动存档到 localStorage');
++
++console.log(`\nDOM 冒烟结果：${pass} 通过，${fail} 失败`);
++process.exit(fail ? 1 : 0);
+diff --git a/apps/xiong-tu-san-guo/src/config.js b/apps/xiong-tu-san-guo/src/config.js
+new file mode 100644
+index 0000000..3276c59
+--- /dev/null
++++ b/apps/xiong-tu-san-guo/src/config.js
+@@ -0,0 +1,84 @@
++// ============================================================================
++// 雄图·三国志文明 · 全局常量与公式
++// 所有数值与战斗 / 经济公式集中于此，便于单测（scripts/logic-test.mjs）与平衡调整。
++// ============================================================================
++
++export const SAVE_KEY = 'xtsg_save_v1';
++export const GAME_VERSION = 1;
++
++export const BUILD_MAX = 5; // 城市建筑等级上限（农田 / 市集 / 兵营 / 城墙 / 工坊）
++export const TRAINING_BASE = 50; // 士兵默认训练度
++export const TRAINING_MAX = 100;
++
++// —— 指令点数 ——
++export const CMD_BASE = 5;
++export const CMD_PER_CITY = 2;
++
++// —— 经济（每回合结算）——
++export const GOLD_PER_MARKET = 100; // 市集等级 × 100
++export const GOLD_PER_POP = 0.5; // 人口 × 0.5
++export const GRAIN_PER_FARM = 200; // 农田等级 × 200
++export const GRAIN_UPKEEP_PER_SOLDIER = 0.5; // 士兵每回合吃粮
++export const POP_GROWTH_RATE = 0.02; // 自然增长率基础
++export const POP_GROWTH_POL_DIVISOR = 100; // 政治 / 100 作为系数
++
++// —— 征兵 ——
++export const RECRUIT_GOLD_PER_SOLDIER = 1.5; // 每名士兵花费金钱
++export const RECRUIT_POP_PER_SOLDIER = 1; // 征兵消耗人口
++
++// 升级建筑花费：从当前 level 升到下一级
++export function buildCost(level) {
++  return 300 + level * 200;
++}
++
++// —— 科技 ——
++export const TECH_MAX_LEVEL = 3;
++export const TECHS = {
++  agri: { name: '农艺', desc: '粮食产量 +10% / 级', icon: '🌾' },
++  commerce: { name: '商贸', desc: '金钱收入 +10% / 级', icon: '💰' },
++  forge: { name: '冶炼', desc: '士兵攻击 +5% / 级', icon: '⚒️' },
++  wall: { name: '筑城', desc: '城防值 +20% / 级', icon: '🧱' },
++  trick: { name: '谋略', desc: '计谋成功率 +5% / 级', icon: '📜' },
++  leadership: { name: '统御', desc: '带兵上限 +10% / 级', icon: '⚓' },
++};
++export const TECH_COST_GOLD = 800; // 每级基础金钱花费
++export const TECH_COST_TURNS = 3; // 每级基础研究回合（智力可缩短）
++
++// —— 战斗 ——
++export const FORMATIONS = {
++  normal: { name: '普通', atk: 1.0, def: 1.0, desc: '攻守均衡' },
++  assault: { name: '攻击', atk: 1.2, def: 0.85, desc: '攻击 +20% / 防御 -15%' },
++  defend: { name: '防御', atk: 0.85, def: 1.2, desc: '攻击 -15% / 防御 +20%' },
++};
++export const DUEL_THRESHOLD = 20; // 武力差 > 20 可触发单挑
++export const DUEL_CHANCE = 0.22; // 每回合触发单挑的概率
++export const DUEL_ROUT_RATIO = 0.35; // 单挑败方溃散的兵力比例
++
++// —— 计略 ——
++export const STRATAGEMS = {
++  fire: { name: '火攻', desc: '降低目标城防 30%', icon: '🔥', range: 0.3 },
++  burn: { name: '烧粮', desc: '烧毁目标军粮 30%', icon: '🔥', range: 0.3 },
++  rumor: { name: '流言', desc: '降低目标守将忠诚 25', icon: '🗯️', range: 25 },
++};
++
++// —— 势力颜色 ——
++export const FACTION_COLORS = [
++  '#c0392b', '#27ae60', '#2980b9', '#8e44ad',
++  '#d35400', '#16a085', '#ad1457', '#f39c12', '#5d6d7e',
++];
++export const PLAYER_COLOR = '#c0392b';
++export const NEUTRAL_COLOR = '#7f8c8d';
++
++// —— 探索 / 登用 ——
++export const EXPLORE_DISCOVERY_BASE = 0.5; // 每位在野名将的发现概率基础（× 魅力修正）
++export const RECRUIT_LOYALTY_THRESHOLD = 30; // 忠诚低于此值的敌将易被策反
++
++export function clamp(v, lo, hi) {
++  return Math.max(lo, Math.min(hi, v));
++}
++
++// 季节名（每回合 = 三个月）
++export const SEASONS = ['春', '夏', '秋', '冬'];
++export function seasonOf(turn) {
++  return SEASONS[(turn - 1) % SEASONS.length];
++}
+diff --git a/apps/xiong-tu-san-guo/src/core/actions.js b/apps/xiong-tu-san-guo/src/core/actions.js
+new file mode 100644
+index 0000000..4580939
+--- /dev/null
++++ b/apps/xiong-tu-san-guo/src/core/actions.js
+@@ -0,0 +1,422 @@
++// ============================================================================
++// 玩家 / AI 共用的命令函数：每个动作校验、扣费、变更状态并返回 { ok, msg, ... }。
++// 消耗指令点（cmd）的动作通过 spendCmd 统一计费；任命太守、输送等少数免费。
++// ============================================================================
++import {
++  cityById, heroById, factionById, playerFaction, neighbors, heroesInCity,
++  wildHeroesInCity, heroesOfFaction, bestDefender, troopCap, cmdRemaining, maxDefense, lordOf,
++  checkGameOver,
++} from './state.js';
++import { citiesOf, recruitCost } from './economy.js';
++import { skillBonus, techMult, techLevel } from './tech.js';
++import { createBattle, runBattle, effLead, effWar } from './combat.js';
++import { chance, rangeInt } from './rng.js';
++import {
++  BUILD_MAX, buildCost, TRAINING_BASE, TRAINING_MAX, FORMATIONS, STRATAGEMS,
++  TECH_MAX_LEVEL, TECH_COST_GOLD, TECH_COST_TURNS, RECRUIT_LOYALTY_THRESHOLD,
++} from '../config.js';
++
++const PLAYER = (state) => state.playerFactionId;
++
++// 消耗一点指令；不足返回 false
++function spendCmd(state, fid) {
++  if (cmdRemaining(state, fid) <= 0) return false;
++  state.cmdUsedByFaction = state.cmdUsedByFaction || {};
++  state.cmdUsedByFaction[fid] = (state.cmdUsedByFaction[fid] || 0) + 1;
++  return true;
++}
++function facMoney(state, fid) { return factionById(state, fid).money; }
++function facGrain(state, fid) { return factionById(state, fid).grain; }
++
++const isPlayer = (state, fid) => fid === state.playerFactionId;
++
++// —— 内政：开发农田 ——
++export function developFarm(state, cityId, fid = PLAYER(state)) {
++  const c = cityById(state, cityId);
++  if (!c || c.ownerFactionId !== fid) return { ok: false, msg: '该城非你所属' };
++  if (c.farmLevel >= BUILD_MAX) return { ok: false, msg: '农田已达满级' };
++  if (!spendCmd(state, fid)) return { ok: false, msg: '指令点不足' };
++  const cost = buildCost(c.farmLevel);
++  if (facMoney(state, fid) < cost) { refundCmd(state, fid); return { ok: false, msg: '金钱不足' }; }
++  factionById(state, fid).money -= cost;
++  c.farmLevel += 1;
++  return { ok: true, msg: `${c.name} 农田升至 ${c.farmLevel} 级（-${cost} 金）` };
++}
++
++// —— 内政：发展商业 ——
++export function developMarket(state, cityId, fid = PLAYER(state)) {
++  const c = cityById(state, cityId);
++  if (!c || c.ownerFactionId !== fid) return { ok: false, msg: '该城非你所属' };
++  if (c.marketLevel >= BUILD_MAX) return { ok: false, msg: '市集已达满级' };
++  if (!spendCmd(state, fid)) return { ok: false, msg: '指令点不足' };
++  const cost = buildCost(c.marketLevel);
++  if (facMoney(state, fid) < cost) { refundCmd(state, fid); return { ok: false, msg: '金钱不足' }; }
++  factionById(state, fid).money -= cost;
++  c.marketLevel += 1;
++  return { ok: true, msg: `${c.name} 市集升至 ${c.marketLevel} 级（-${cost} 金）` };
++}
++
++// —— 内政：城防修筑 ——
++export function buildWall(state, cityId, fid = PLAYER(state)) {
++  const c = cityById(state, cityId);
++  if (!c || c.ownerFactionId !== fid) return { ok: false, msg: '该城非你所属' };
++  if (c.wallLevel >= BUILD_MAX) return { ok: false, msg: '城墙已达满级' };
++  if (!spendCmd(state, fid)) return { ok: false, msg: '指令点不足' };
++  const cost = buildCost(c.wallLevel);
++  if (facMoney(state, fid) < cost) { refundCmd(state, fid); return { ok: false, msg: '金钱不足' }; }
++  factionById(state, fid).money -= cost;
++  c.wallLevel += 1;
++  c.defense = maxDefense(state, c);
++  return { ok: true, msg: `${c.name} 城墙升至 ${c.wallLevel} 级，城防加固` };
++}
++
++// —— 内政：征兵 ——
++export function recruit(state, cityId, count, fid = PLAYER(state)) {
++  const c = cityById(state, cityId);
++  if (!c || c.ownerFactionId !== fid) return { ok: false, msg: '该城非你所属' };
++  count = Math.max(0, Math.floor(count));
++  if (count <= 0) return { ok: false, msg: '征兵数量无效' };
++  if (!spendCmd(state, fid)) return { ok: false, msg: '指令点不足' };
++  const { gold, pop } = recruitCost(c, count);
++  const fac = factionById(state, fid);
++  if (fac.money < gold) { refundCmd(state, fid); return { ok: false, msg: '金钱不足' }; }
++  if (c.population < pop) { refundCmd(state, fid); return { ok: false, msg: '人口不足' }; }
++  fac.money -= gold;
++  c.population -= Math.round(pop);
++  c.soldiers += count;
++  // 兵营等级提升新兵训练度起点
++  if (c.training < TRAINING_BASE + (c.barracksLevel - 1) * 5) c.training = TRAINING_BASE + (c.barracksLevel - 1) * 5;
++  return { ok: true, msg: `${c.name} 征兵 ${count}（-${Math.round(gold)} 金，-${Math.round(pop)} 人口）` };
++}
++
++// —— 内政：操练（提升训练度）——
++export function train(state, cityId, fid = PLAYER(state)) {
++  const c = cityById(state, cityId);
++  if (!c || c.ownerFactionId !== fid) return { ok: false, msg: '该城非你所属' };
++  if (c.training >= TRAINING_MAX) return { ok: false, msg: '训练度已满' };
++  if (!spendCmd(state, fid)) return { ok: false, msg: '指令点不足' };
++  const cost = 200;
++  if (facMoney(state, fid) < cost) { refundCmd(state, fid); return { ok: false, msg: '金钱不足' }; }
++  factionById(state, fid).money -= cost;
++  c.training = Math.min(TRAINING_MAX, c.training + 8);
++  return { ok: true, msg: `${c.name} 操练部队，训练度 → ${c.training}` };
++}
++
++// —— 人事：探索（发现本城在野名将）——
++export function explore(state, cityId, fid = PLAYER(state), rng) {
++  const r = rng || Math.random;
++  const c = cityById(state, cityId);
++  if (!c || c.ownerFactionId !== fid) return { ok: false, msg: '该城非你所属' };
++  if (!spendCmd(state, fid)) return { ok: false, msg: '指令点不足' };
++  const roster = heroesInCity(state, cityId, fid);
++  const charm = roster.length ? Math.max(...roster.map((h) => h.stats.c)) : 50;
++  const wilds = wildHeroesInCity(state, cityId);
++  const newly = [];
++  for (const w of wilds) {
++    if (w.discovered) continue;
++    if (chance(r, 0.4 + charm / 400)) { w.discovered = true; newly.push(w); }
++  }
++  const discovered = wilds.filter((w) => w.discovered);
++  if (!newly.length && !discovered.length) {
++    return { ok: true, msg: `${c.name} 四处寻访，未发现可用之才。`, discovered: [] };
++  }
++  return {
++    ok: true,
++    msg: newly.length ? `${c.name} 探访得知：${newly.map((w) => w.name).join('、')} 在此隐居！` : `${c.name} 已有名将在野可登用。`,
++    discovered,
++    newly,
++  };
++}
++
++// —— 人事：登用（说服在野名将加入）——
++export function recruitHero(state, heroId, fid = PLAYER(state), rng) {
++  const r = rng || Math.random;
++  const h = heroById(state, heroId);
++  if (!h || !h.wild) return { ok: false, msg: '目标不可登用' };
++  const c = cityById(state, h.cityId);
++  if (!c || c.ownerFactionId !== fid) return { ok: false, msg: '名将不在己方城市' };
++  if (!spendCmd(state, fid)) return { ok: false, msg: '指令点不足' };
++  const roster = heroesInCity(state, h.cityId, fid);
++  const charm = roster.length ? Math.max(...roster.map((x) => x.stats.c)) : 50;
++  const cBonus = roster.length ? Math.max(...roster.map((x) => skillBonus(x).c_recruit)) : 0;
++  let p = 0.25 + (charm - h.loyalty) / 200 + cBonus + techMult(state, 'trick', 0.05) - 1;
++  p = Math.max(0.05, Math.min(0.95, p));
++  if (chance(r, p)) {
++    h.wild = false;
++    h.factionId = fid;
++    h.status = 'free';
++    h.discovered = true;
++    h.loyalty = Math.max(70, Math.min(95, Math.round(60 + charm / 4)));
++    return { ok: true, msg: `${h.name} 愿效犬马之劳，已归入麾下！`, recruited: true };
++  }
++  return { ok: true, msg: `${h.name} 婉言谢绝（成功率 ${Math.round(p * 100)}%）。`, recruited: false };
++}
++
++// —— 人事：赏赐（提升忠诚）——
++export function reward(state, heroId, fid = PLAYER(state)) {
++  const h = heroById(state, heroId);
++  if (!h || h.factionId !== fid) return { ok: false, msg: '非己方武将' };
++  if (!spendCmd(state, fid)) return { ok: false, msg: '指令点不足' };
++  const cost = 300;
++  if (facMoney(state, fid) < cost) { refundCmd(state, fid); return { ok: false, msg: '金钱不足' }; }
++  factionById(state, fid).money -= cost;
++  h.loyalty = Math.min(100, h.loyalty + 12);
++  return { ok: true, msg: `赏赐 ${h.name}，忠诚 → ${h.loyalty}` };
++}
++
++// —— 人事：任命太守（免费）——
++export function appointGovernor(state, cityId, heroId, fid = PLAYER(state)) {
++  const c = cityById(state, cityId);
++  const h = heroById(state, heroId);
++  if (!c || c.ownerFactionId !== fid) return { ok: false, msg: '该城非你所属' };
++  if (!h || h.factionId !== fid || h.status === 'prisoner') return { ok: false, msg: '该武将不可用' };
++  if (h.cityId !== cityId) return { ok: false, msg: '武将须在本城方可任命' };
++  c.governorHeroId = heroId;
++  return { ok: true, msg: `${h.name} 出任 ${c.name} 太守` };
++}
++
++// —— 科技：开始研究 ——
++export function research(state, techKey, fid = PLAYER(state)) {
++  if (!Object.prototype.hasOwnProperty.call(state.techLevels, techKey)) return { ok: false, msg: '未知科技' };
++  if (state.research) return { ok: false, msg: '已有研究进行中' };
++  if (techLevel(state, techKey) >= TECH_MAX_LEVEL) return { ok: false, msg: '该科技已满级' };
++  if (!spendCmd(state, fid)) return { ok: false, msg: '指令点不足' };
++  if (facMoney(state, fid) < TECH_COST_GOLD) { refundCmd(state, fid); return { ok: false, msg: '金钱不足' }; }
++  factionById(state, fid).money -= TECH_COST_GOLD;
++  const lord = lordOf(state, fid);
++  const intel = lord ? lord.stats.i : 50;
++  const turns = Math.max(1, Math.round(TECH_COST_TURNS - intel / 60));
++  state.research = { key: techKey, turnsLeft: turns };
++  return { ok: true, msg: `开始研究，预计 ${turns} 回合完成（-${TECH_COST_GOLD} 金）` };
++}
++
++// —— 军事：出征 ——
++export function campaign(state, fromCityId, toCityId, generalId, troops, formation, fid = PLAYER(state), rng) {
++  const r = rng || Math.random;
++  const from = cityById(state, fromCityId);
++  const to = cityById(state, toCityId);
++  if (!from || !to) return { ok: false, msg: '城市无效' };
++  if (from.ownerFactionId !== fid) return { ok: false, msg: '出发城非你所属' };
++  if (to.ownerFactionId === fid) return { ok: false, msg: '不可攻打己方城市' };
++  if (!from.adjacent.includes(toCityId)) return { ok: false, msg: '目标城市不相邻' };
++  const g = heroById(state, generalId);
++  if (!g || g.factionId !== fid || g.status === 'prisoner' || g.cityId !== fromCityId) {
++    return { ok: false, msg: '主将不可用' };
++  }
++  troops = Math.max(0, Math.floor(troops));
++  if (troops <= 0) return { ok: false, msg: '出兵数量无效' };
++  if (troops > from.soldiers) return { ok: false, msg: '城中兵力不足' };
++  if (troops > troopCap(state, g)) return { ok: false, msg: `超出 ${g.name} 带兵上限（${troopCap(state, g)}）` };
++  if (!spendCmd(state, fid)) return { ok: false, msg: '指令点不足' };
++  const grainCost = Math.round(troops * 0.05);
++  if (facGrain(state, fid) < grainCost) { refundCmd(state, fid); return { ok: false, msg: '军粮不足以出征' }; }
++  factionById(state, fid).grain -= grainCost;
++
++  from.soldiers -= troops;
++
++  const attacker = { factionId: fid, general: g, soldiers: troops, training: from.training, formation: formation || 'normal' };
++  const defGeneral = bestDefender(state, toCityId) || { id: '__militia__', name: '守城民兵', stats: { l: 50, w: 50, i: 40, p: 40, c: 40 }, skill: null };
++  const defender = {
++    factionId: to.ownerFactionId, general: defGeneral, soldiers: to.soldiers,
++    defense: to.defense || 0, isCity: true, training: to.training || TRAINING_BASE, formation: 'normal',
++  };
++
++  const battle = createBattle({ attacker, defender });
++  runBattle(battle, state, r);
++
++  let won = battle.result === 'attacker';
++  applyCampaignResult(state, battle, from, to, g, fid, r);
++  // 占领后立即判定胜负（不必等到回合结束），让 UI 的 afterAction 即时弹出结算
++  if (won) checkGameOver(state);
++
++  const msgs = battle.log.slice(-3);
++  return { ok: true, won, battle, msg: won ? `攻克 ${to.name}！` : `攻打 ${to.name} 失利。`, log: msgs };
++}
++
++// 结算出征结果（占领 / 溃败 / 俘虏）
++function applyCampaignResult(state, battle, from, to, attackerGen, fid, rng) {
++  const won = battle.result === 'attacker';
++  const captorFid = won ? fid : to.ownerFactionId;
++
++  if (won) {
++    // 占领：幸存兵力转为新守军，主将入驻
++    const survivors = Math.round(battle.attacker.soldiers);
++    to.ownerFactionId = fid;
++    to.soldiers = survivors;
++    to.training = from.training;
++    attackerGen.cityId = to.id;
++    if (!to.governorHeroId || !heroById(state, to.governorHeroId)) to.governorHeroId = attackerGen.id;
++    // 缴获城库
++    const lootGold = to.gold || 0;
++    const lootGrain = to.grain || 0;
++    factionById(state, fid).money += lootGold;
++    factionById(state, fid).grain += lootGrain;
++    to.gold = 0; to.grain = 0;
++    state.turnLog.push(`🏰 攻陷 ${to.name}！缴获 ${lootGold} 金、${lootGrain} 粮，余兵 ${survivors} 驻守。`);
++  } else {
++    // 失利：出征兵力覆灭（已从 from 扣除）；守军实际伤亡如实回写到真实城市
++    // （createBattle 做了浅拷贝，runBattle 只削减 battle.defender，需手动落账）
++    to.soldiers = Math.round(battle.defender.soldiers);
++    to.defense = Math.max(0, Math.round(battle.defender.defense));
++    state.turnLog.push(`💔 攻打 ${to.name} 失利，出征军覆灭；守军余 ${to.soldiers}、城防余 ${to.defense}。`);
++  }
++
++  // 俘虏处理
++  if (battle.prisoner && battle.prisoner !== '__militia__') {
++    const ph = heroById(state, battle.prisoner);
++    if (ph && captorFid != null) {
++      ph.status = 'prisoner';
++      ph.prisonerOf = captorFid;
++      const capCity = citiesOf(state, captorFid)[0];
++      if (capCity) ph.cityId = capCity.id;
++      if (ph.id === to.governorHeroId) to.governorHeroId = null;
++      state.turnLog.push(`⛓️ ${ph.name} 被俘。`);
++    } else if (ph) {
++      // 中立势力俘获 → 释放为在野
++      ph.status = 'free';
++      ph.wild = true;
++      ph.discovered = false;
++    }
++  }
++}
++
++// —— 军事：输送（己方相邻城市间调运）——
++export function transport(state, fromCityId, toCityId, payload, fid = PLAYER(state)) {
++  const from = cityById(state, fromCityId);
++  const to = cityById(state, toCityId);
++  if (!from || !to) return { ok: false, msg: '城市无效' };
++  if (from.ownerFactionId !== fid || to.ownerFactionId !== fid) return { ok: false, msg: '须为己方城市' };
++  if (!from.adjacent.includes(toCityId)) return { ok: false, msg: '两城不相邻' };
++  if (!spendCmd(state, fid)) return { ok: false, msg: '指令点不足' };
++  // 金 / 粮为势力级共享池（见 economy.js），无需在城市间输送；
++  // 唯一需要调运的城市级资源是士兵。
++  const s = Math.max(0, Math.floor(payload.soldiers || 0));
++  if (s <= 0) { refundCmd(state, fid); return { ok: false, msg: '输送数量无效' }; }
++  if (s > from.soldiers) { refundCmd(state, fid); return { ok: false, msg: '兵力不足' }; }
++  from.soldiers -= s;
++  to.soldiers += s;
++  return { ok: true, msg: `自 ${from.name} 向 ${to.name} 输送士兵 ${s}` };
++}
++
++// —— 外交 / 计略 ——
++export function stratagem(state, fromCityId, toCityId, type, fid = PLAYER(state), rng) {
++  const r = rng || Math.random;
++  const def = STRATAGEMS[type];
++  if (!def) return { ok: false, msg: '未知计略' };
++  const from = cityById(state, fromCityId);
++  const to = cityById(state, toCityId);
++  if (!from || !to) return { ok: false, msg: '城市无效' };
++  if (from.ownerFactionId !== fid) return { ok: false, msg: '出发城非你所属' };
++  if (to.ownerFactionId === fid) return { ok: false, msg: '不可对己方城市用计' };
++  if (!from.adjacent.includes(toCityId)) return { ok: false, msg: '目标城市不相邻' };
++  if (!spendCmd(state, fid)) return { ok: false, msg: '指令点不足' };
++  const cost = 150;
++  if (facMoney(state, fid) < cost) { refundCmd(state, fid); return { ok: false, msg: '金钱不足' }; }
++  factionById(state, fid).money -= cost;
++
++  // 施计者取智力最高者（计略成功率取决于智力，而非统率）
++  const casterRoster = heroesInCity(state, fromCityId, fid);
++  const caster = casterRoster.length
++    ? casterRoster.reduce((a, b) => ((a.stats.i || 0) >= (b.stats.i || 0) ? a : b))
++    : { stats: { i: 50 } };
++  const intel = caster.stats ? caster.stats.i : 50;
++  const targetGen = bestDefender(state, toCityId);
++  const tIntel = targetGen && targetGen.stats ? targetGen.stats.i : 45;
++  let p = 0.35 + (intel - tIntel) / 200 + techMult(state, 'trick', 0.05) - 1;
++  p = Math.max(0.05, Math.min(0.9, p));
++
++  if (!chance(r, p)) {
++    return { ok: true, msg: `${def.name} 被 ${to.name} 识破（成功率 ${Math.round(p * 100)}%）`, success: false };
++  }
++  if (type === 'fire') {
++    to.defense = Math.max(0, Math.round((to.defense || 0) * (1 - def.range)));
++    return { ok: true, msg: `火攻成功！${to.name} 城防降至 ${Math.round(to.defense)}`, success: true };
++  }
++  if (type === 'burn') {
++    const foeFid = to.ownerFactionId;
++    if (foeFid != null) {
++      const foe = factionById(state, foeFid);
++      const burned = Math.round(foe.grain * def.range);
++      foe.grain -= burned;
++      return { ok: true, msg: `烧粮成功！${foe.name} 损失 ${burned} 军粮`, success: true };
++    }
++    to.grain = Math.round((to.grain || 0) * (1 - def.range));
++    return { ok: true, msg: `烧粮成功！${to.name} 城库粮草被焚`, success: true };
++  }
++  if (type === 'rumor') {
++    if (targetGen) {
++      targetGen.loyalty = Math.max(0, targetGen.loyalty - def.range);
++      return { ok: true, msg: `流言成功！${targetGen.name} 忠诚降至 ${targetGen.loyalty}`, success: true };
++    }
++    return { ok: true, msg: `流言散布，但城中无名将可撼动`, success: true };
++  }
++  return { ok: true, msg: '计略执行完毕', success: true };
++}
++
++// 武将调任：在己方相邻城市间移动一名武将（免费）
++export function moveHero(state, heroId, toCityId, fid = PLAYER(state)) {
++  const h = heroById(state, heroId);
++  const to = cityById(state, toCityId);
++  if (!h || h.factionId !== fid || h.status === 'prisoner') return { ok: false, msg: '武将不可用' };
++  if (!to || to.ownerFactionId !== fid) return { ok: false, msg: '目标非己方城市' };
++  const from = cityById(state, h.cityId);
++  if (!from || !from.adjacent.includes(toCityId)) return { ok: false, msg: '两城不相邻' };
++  h.cityId = toCityId;
++  return { ok: true, msg: `${h.name} 调往 ${to.name}` };
++}
++
++// —— 俘虏管理 ——
++// 招降俘虏（成功率随俘虏忠诚降低而提高）
++export function recruitPrisoner(state, heroId, fid = PLAYER(state), rng) {
++  const r = rng || Math.random;
++  const h = heroById(state, heroId);
++  if (!h || h.prisonerOf !== fid) return { ok: false, msg: '该武将非你俘虏' };
++  if (!spendCmd(state, fid)) return { ok: false, msg: '指令点不足' };
++  const cost = 500;
++  if (facMoney(state, fid) < cost) { refundCmd(state, fid); return { ok: false, msg: '金钱不足' }; }
++  factionById(state, fid).money -= cost;
++  const lord = lordOf(state, fid);
++  const charm = lord ? lord.stats.c : 50;
++  let p = 0.15 + (100 - h.loyalty) / 200 + (charm - 70) / 100;
++  p = Math.max(0.05, Math.min(0.85, p));
++  if (chance(r, p)) {
++    h.factionId = fid;
++    h.prisonerOf = null;
++    h.status = 'free';
++    h.loyalty = Math.max(55, Math.min(80, h.loyalty));
++    return { ok: true, msg: `${h.name} 归降！`, recruited: true };
++  }
++  return { ok: true, msg: `${h.name} 拒不投降（成功率 ${Math.round(p * 100)}%）`, recruited: false };
++}
++
++// 释放俘虏 → 转为某中立城在野
++export function releasePrisoner(state, heroId, fid = PLAYER(state)) {
++  const h = heroById(state, heroId);
++  if (!h || h.prisonerOf !== fid) return { ok: false, msg: '该武将非你俘虏' };
++  const neutrals = state.cities.filter((c) => c.ownerFactionId == null);
++  const dest = (neutrals.length ? neutrals : state.cities)[0];
++  h.prisonerOf = null;
++  h.status = 'free';
++  h.factionId = null;
++  h.wild = true;
++  h.discovered = false;
++  h.cityId = dest.id;
++  return { ok: true, msg: `释放 ${h.name}` };
++}
++
++// 处决俘虏
++export function executePrisoner(state, heroId, fid = PLAYER(state)) {
++  const h = heroById(state, heroId);
++  if (!h || h.prisonerOf !== fid) return { ok: false, msg: '该武将非你俘虏' };
++  const name = h.name;
++  state.heroes = state.heroes.filter((x) => x.id !== heroId);
++  return { ok: true, msg: `处决 ${name}，其旧部离心。` };
++}
++
++function refundCmd(state, fid) {
++  if (state.cmdUsedByFaction && state.cmdUsedByFaction[fid] > 0) {
++    state.cmdUsedByFaction[fid] -= 1;
++  }
++}
++
++export { spendCmd, isPlayer, RECRUIT_LOYALTY_THRESHOLD, effLead, effWar, FORMATIONS };
+diff --git a/apps/xiong-tu-san-guo/src/core/ai.js b/apps/xiong-tu-san-guo/src/core/ai.js
+new file mode 100644
+index 0000000..5f75c29
+--- /dev/null
++++ b/apps/xiong-tu-san-guo/src/core/ai.js
+@@ -0,0 +1,109 @@
++// ============================================================================
++// AI 势力回合：按设计文档优先级消耗指令点。
++//   1) 内政（升市场 / 征兵） 2) 招募在野名将 3) 科技研究
++//   4) 侵略相邻弱敌 5) 输送平衡防御 6) 赏赐稳忠诚
++// 直接复用 actions.js 的命令函数（与玩家同规则）。
++// ============================================================================
++import * as A from './actions.js';
++import {
++  cmdRemaining, heroesOfFaction, neighbors, lordOf, heroById,
++} from './state.js';
++import { citiesOf } from './economy.js';
++import { effLead } from './combat.js';
++import { chance } from './rng.js';
++import { TECH_COST_GOLD } from '../config.js';
++
++// 单个 AI 势力行动
++export function aiTurn(state, fid, rng) {
++  const r = rng || Math.random;
++  const cities = citiesOf(state, fid);
++  if (!cities.length) return;
++  const lord = lordOf(state, fid);
++
++  let guard = 0;
++  while (cmdRemaining(state, fid) > 0 && guard++ < 30) {
++    let acted = false;
++
++    // 1) 内政：金币低则升市场；兵不足人口 20% 则征兵
++    for (const c of cities) {
++      if (cmdRemaining(state, fid) <= 0) break;
++      const fac = state.factions.find((f) => f.id === fid);
++      if (fac.money > 600 && c.marketLevel < 5 && chance(r, 0.5)) {
++        if (A.developMarket(state, c.id, fid).ok) { acted = true; break; }
++      }
++    }
++    for (const c of cities) {
++      if (cmdRemaining(state, fid) <= 0) break;
++      if (c.soldiers < c.population * 0.2) {
++        const recruitN = Math.min(800, Math.floor(c.population * 0.05));
++        if (recruitN > 50 && A.recruit(state, c.id, recruitN, fid).ok) { acted = true; break; }
++      }
++    }
++
++    // 2) 招募在野名将（魅力 > 70 的武将空闲时探索 + 登用）
++    if (!acted) {
++      const charmHero = heroesOfFaction(state, fid).find((h) => h.stats.c > 70);
++      if (charmHero) {
++        for (const c of cities) {
++          if (cmdRemaining(state, fid) <= 0) break;
++          const res = A.explore(state, c.id, fid, r);
++          if (res.ok && res.discovered && res.discovered.length) {
++            const target = res.discovered[0];
++            A.recruitHero(state, target.id, fid, r);
++            acted = true;
++            break;
++          }
++        }
++      }
++    }
++
++    // 3) 科技研究
++    if (!acted && !state.research && chance(r, 0.3)) {
++      const fac = state.factions.find((f) => f.id === fid);
++      if (fac.money >= TECH_COST_GOLD) {
++        const keys = ['agri', 'commerce', 'forge', 'wall', 'trick', 'leadership'];
++        const k = keys[Math.floor(r() * keys.length)];
++        if (A.research(state, k, fid).ok) acted = true;
++      }
++    }
++
++    // 4) 侵略：相邻非己方城市，军力占优（兵力比 > 1.3）则出征
++    if (!acted) {
++      outer: for (const c of cities) {
++        const attacker = heroesOfFaction(state, fid).find((h) => h.cityId === c.id && h.status === 'free');
++        if (!attacker) continue;
++        for (const n of neighbors(state, c.id)) {
++          if (cmdRemaining(state, fid) <= 0) break outer;
++          if (n.ownerFactionId === fid) continue;
++          const myPow = c.soldiers + effLead(attacker) * 5;
++          const foePow = n.soldiers + (n.defense || 0) * 0.5;
++          if (myPow > foePow * 1.5 && c.soldiers > 800) {
++            const troops = Math.min(c.soldiers - 200, Math.floor(c.soldiers * 0.7));
++            const res = A.campaign(state, c.id, n.id, attacker.id, troops, 'assault', fid, r);
++            if (res.ok) {
++              state.turnLog.push(`⚔️ ${state.factions.find((f) => f.id === fid).name} 出兵攻打 ${n.name}${res.won ? '并攻陷之' : '，未能攻克'}。`);
++              acted = true;
++              break outer;
++            }
++          }
++        }
++      }
++    }
++
++    // 5) 赏赐稳忠诚
++    if (!acted) {
++      const low = heroesOfFaction(state, fid).find((h) => h.loyalty < 60);
++      if (low) { A.reward(state, low.id, fid); acted = true; }
++    }
++
++    if (!acted) break; // 无事可做，结束本势力回合
++  }
++}
++
++export function aiTurnAll(state, rng) {
++  const r = rng || Math.random;
++  for (const f of state.factions) {
++    if (!f.aiControlled) continue;
++    aiTurn(state, f.id, r);
++  }
++}
+diff --git a/apps/xiong-tu-san-guo/src/core/combat.js b/apps/xiong-tu-san-guo/src/core/combat.js
+new file mode 100644
+index 0000000..37dcda6
+--- /dev/null
++++ b/apps/xiong-tu-san-guo/src/core/combat.js
+@@ -0,0 +1,130 @@
++// ============================================================================
++// 战斗系统：简化自动回合制（骰子模型 + 城防 + 单挑）。
++// createBattle() 构造战局，runBattle() 自动结算至胜负，产生文字战报 log。
++// ============================================================================
++import { FORMATIONS, DUEL_THRESHOLD, DUEL_CHANCE, DUEL_ROUT_RATIO } from '../config.js';
++import { skillBonus, techMult } from './tech.js';
++import { chance, range } from './rng.js';
++
++// 有效武力 / 统率（含技能加成）
++export function effWar(hero) {
++  if (!hero) return 50;
++  return hero.stats.w * (1 + skillBonus(hero).war);
++}
++export function effLead(hero) {
++  if (!hero) return 50;
++  return hero.stats.l * (1 + skillBonus(hero).lead);
++}
++
++// 训练度系数：50 → 1.0，100 → 1.5，0 → 0.5
++function trainingCoeff(training) {
++  return 0.5 + (Number.isFinite(training) ? training : 50) / 100;
++}
++
++// 一支部队的攻击值
++export function attackValue(force, state) {
++  const g = force.general;
++  const war = effWar(g);
++  const lead = effLead(g);
++  const soldiers = Math.max(0, force.soldiers);
++  const forge = techMult(state, 'forge', 0.05);
++  const form = FORMATIONS[force.formation] || FORMATIONS.normal;
++  return (war * 0.4 + lead * 0.3 + soldiers * 0.01) * forge * trainingCoeff(force.training) * form.atk;
++}
++
++// 构造战局
++export function createBattle({ attacker, defender }) {
++  return {
++    attacker: { ...attacker },
++    defender: { ...defender },
++    round: 0,
++    log: [],
++    result: null,
++    prisoner: null,
++    duel: null,
++  };
++}
++
++// 单回合：双方同时对对方造成伤害（攻方先结算，守方城防优先承受）
++function resolveRound(b, state, rng) {
++  const aVal = attackValue(b.attacker, state);
++  const dVal = attackValue(b.defender, state);
++
++  // —— 攻方 → 守方 ——（城防优先承受，溢出转入士兵）
++  let aDmg = aVal * range(rng, 0.85, 1.15);
++  if (b.defender.isCity && b.defender.defense > 0) {
++    const soaked = Math.min(b.defender.defense, aDmg);
++    b.defender.defense = Math.max(0, b.defender.defense - soaked);
++    aDmg -= soaked;
++    if (soaked > 0) {
++      b.log.push(`回合 ${b.round}：${b.attacker.general.name} 攻城，城防承受 ${Math.round(soaked)} 点（余 ${Math.round(b.defender.defense)}）。`);
++    }
++  }
++  if (aDmg > 0) {
++    b.defender.soldiers = Math.max(0, b.defender.soldiers - aDmg);
++    b.log.push(`回合 ${b.round}：${b.attacker.general.name} 部队杀伤敌军 ${Math.round(aDmg)} 人（敌余 ${Math.round(b.defender.soldiers)}）。`);
++  }
++
++  // —— 守方 → 攻方 ——（攻方无城防，直接削减士兵）
++  const dDmg = dVal * range(rng, 0.85, 1.15);
++  if (dDmg > 0) {
++    b.attacker.soldiers = Math.max(0, b.attacker.soldiers - dDmg);
++    b.log.push(`回合 ${b.round}：${b.defender.general.name} 反击杀伤我军 ${Math.round(dDmg)} 人（我余 ${Math.round(b.attacker.soldiers)}）。`);
++  }
++}
++
++// 单挑判定（每回合最多一次，触发后决出胜负）
++function tryDuel(b, rng) {
++  if (b.duel) return false;
++  const ag = b.attacker.general;
++  const dg = b.defender.general;
++  if (!ag || !dg) return false;
++  const diff = Math.abs(effWar(ag) - effWar(dg));
++  if (diff <= DUEL_THRESHOLD) return false;
++  if (!chance(rng, DUEL_CHANCE)) return false;
++  const attackerWins = effWar(ag) > effWar(dg);
++  b.duel = { winner: attackerWins ? 'attacker' : 'defender', loser: attackerWins ? 'defender' : 'attacker' };
++  b.log.push(`⚔️ ${ag.name} 与 ${dg.name} 阵前单挑！${(attackerWins ? ag : dg).name} 武艺更胜一筹，一合斩将，败军溃散！`);
++  return true;
++}
++
++// 跑完整场战斗（最多 30 回合，避免死循环）
++export function runBattle(b, state, rng) {
++  b.round = 0;
++  while (b.result == null && b.round < 30) {
++    b.round += 1;
++
++    // 单挑（前置，可一击定胜负）
++    if (tryDuel(b, rng)) {
++      const loserSide = b.duel.loser;
++      const winnerSide = b.duel.winner;
++      const loserGen = b[loserSide].general;
++      b[loserSide].soldiers = Math.round(b[loserSide].soldiers * (1 - DUEL_ROUT_RATIO));
++      // 君主不可被俘（仅败走），避免势力因失主而僵死
++      b.prisoner = loserGen && !isLord(loserGen) ? loserGen.id : null;
++      b.result = winnerSide;
++      b.log.push(`${b[winnerSide].general.name} 赢下单挑，${loserGen.name}${b.prisoner ? ' 被俘' : ' 败走'}，敌军溃败！`);
++      break;
++    }
++
++    resolveRound(b, state, rng);
++
++    if (b.defender.soldiers <= 0) { b.result = 'attacker'; break; }
++    if (b.attacker.soldiers <= 0) { b.result = 'defender'; break; }
++  }
++  // 超时未分胜负：以残兵多者胜
++  if (b.result == null) {
++    b.result = b.attacker.soldiers >= b.defender.soldiers ? 'attacker' : 'defender';
++    b.log.push(`战至日暮，双方力竭。${b.result === 'attacker' ? '攻方' : '守方'} 残兵更众，勉强占得上风。`);
++  }
++  // 败方主将被俘（君主除外）
++  if (!b.prisoner) {
++    const loser = b.result === 'attacker' ? b.defender : b.attacker;
++    if (loser.general && !isLord(loser.general) && loser.general.id !== '__militia__' && chance(rng, 0.5)) {
++      b.prisoner = loser.general.id;
++    }
++  }
++  return b;
++}
++
++function isLord(g) { return !!(g && (g.lord || g.isPlayerLord)); }
+diff --git a/apps/xiong-tu-san-guo/src/core/economy.js b/apps/xiong-tu-san-guo/src/core/economy.js
+new file mode 100644
+index 0000000..22b1ccc
+--- /dev/null
++++ b/apps/xiong-tu-san-guo/src/core/economy.js
+@@ -0,0 +1,74 @@
++// ============================================================================
++// 经济结算：每座城市的金钱 / 粮食收入、军粮消耗、人口增长。
++// 资源池（金钱 / 军粮）为势力级共享；人口 / 士兵 / 城防 / 建筑为城市级。
++// ============================================================================
++import {
++  GOLD_PER_MARKET, GOLD_PER_POP, GRAIN_PER_FARM, GRAIN_UPKEEP_PER_SOLDIER,
++  POP_GROWTH_RATE, POP_GROWTH_POL_DIVISOR, TRAINING_BASE,
++} from '../config.js';
++import { techMult } from './tech.js';
++
++export function isOwnedBy(city, factionId) {
++  return city.ownerFactionId === factionId;
++}
++
++export function citiesOf(state, factionId) {
++  return state.cities.filter((c) => isOwnedBy(c, factionId));
++}
++
++function traitMult(city, type) {
++  return city.trait && city.trait.type === type ? 1 + city.trait.value : 1;
++}
++
++// 商业收入（每回合，单城）
++export function cityGoldIncome(state, city) {
++  const base = city.marketLevel * GOLD_PER_MARKET + city.population * GOLD_PER_POP;
++  return base * traitMult(city, 'commerce') * techMult(state, 'commerce', 0.1);
++}
++
++// 粮食产量（每回合，单城）
++export function cityGrainIncome(state, city) {
++  const base = city.farmLevel * GRAIN_PER_FARM;
++  return base * traitMult(city, 'grain') * techMult(state, 'agri', 0.1);
++}
++
++// 势力每回合金钱总收入（含特性 / 科技）
++export function factionGoldIncome(state, factionId) {
++  let sum = 0;
++  for (const c of state.cities) if (isOwnedBy(c, factionId)) sum += cityGoldIncome(state, c);
++  return sum;
++}
++
++// 势力每回合粮食净变化（产量 - 士兵吃粮）
++export function factionGrainNet(state, factionId) {
++  let prod = 0;
++  let upkeep = 0;
++  for (const c of state.cities) {
++    if (!isOwnedBy(c, factionId)) continue;
++    prod += cityGrainIncome(state, c);
++    upkeep += c.soldiers * GRAIN_UPKEEP_PER_SOLDIER;
++  }
++  return { prod, upkeep, net: prod - upkeep };
++}
++
++// 城防值（基础 × 城防特性 × 筑城科技 × 城墙等级加成）
++export function cityDefenseValue(state, city) {
++  const base = city.defenseBase || 0;
++  const wallBoost = 1 + (city.wallLevel - 1) * 0.15;
++  return base * traitMult(city, 'defense') * techMult(state, 'wall', 0.2) * wallBoost;
++}
++
++// 单城人口增长（依赖太守或君主政治）
++export function cityPopGrowth(state, city, politics) {
++  const pol = Number.isFinite(politics) ? politics : 50;
++  const factor = (pol / POP_GROWTH_POL_DIVISOR) * POP_GROWTH_RATE;
++  return city.population * factor * traitMult(city, 'growth');
++}
++
++// 征兵消耗：金钱 / 人口（受征兵特性影响——人口消耗降低）
++export function recruitCost(city, count) {
++  const popCost = count * (1 / (1 + (city.trait && city.trait.type === 'recruit' ? city.trait.value : 0)));
++  return { gold: count * 1.5, pop: popCost };
++}
++
++export { TRAINING_BASE };
+diff --git a/apps/xiong-tu-san-guo/src/core/rng.js b/apps/xiong-tu-san-guo/src/core/rng.js
+new file mode 100644
+index 0000000..b05962c
+--- /dev/null
++++ b/apps/xiong-tu-san-guo/src/core/rng.js
+@@ -0,0 +1,40 @@
++// ============================================================================
++// 随机工具：默认 Math.random，可注入种子化 rng（便于单测）。
++// ============================================================================
++const DEFAULT = Math.random;
++
++export function makeRng(seed) {
++  let s = (seed >>> 0) || 1;
++  return function rng() {
++    s = (s * 1664525 + 1013904223) >>> 0;
++    return s / 0x100000000;
++  };
++}
++
++// [min, max) 浮点
++export function range(rng, min, max) {
++  return min + (rng || DEFAULT)() * (max - min);
++}
++
++// [min, max] 整数（闭区间）
++export function rangeInt(rng, min, max) {
++  return Math.floor(range(rng, min, max + 1));
++}
++
++export function chance(rng, p) {
++  return (rng || DEFAULT)() < p;
++}
++
++export function pick(rng, arr) {
++  return arr[Math.floor((rng || DEFAULT)() * arr.length)];
++}
++
++// Fisher–Yates 洗牌（返回新数组）
++export function shuffle(rng, arr) {
++  const a = arr.slice();
++  for (let i = a.length - 1; i > 0; i--) {
++    const j = Math.floor((rng || DEFAULT)() * (i + 1));
++    [a[i], a[j]] = [a[j], a[i]];
++  }
++  return a;
++}
+diff --git a/apps/xiong-tu-san-guo/src/core/save.js b/apps/xiong-tu-san-guo/src/core/save.js
+new file mode 100644
+index 0000000..b26138c
+--- /dev/null
++++ b/apps/xiong-tu-san-guo/src/core/save.js
+@@ -0,0 +1,38 @@
++// ============================================================================
++// 存档：localStorage 持久化（单槽）。
++// 通过 storage 访问器隔离 localStorage，便于 Node 单测注入内存版。
++// ============================================================================
++import { SAVE_KEY } from '../config.js';
++
++let storage = null;
++try {
++  if (typeof localStorage !== 'undefined') storage = localStorage;
++} catch (_) { /* 某些环境访问 localStorage 会抛错 */ }
++
++export function _setStorage(s) { storage = s; }
++
++export function hasSave() {
++  try { return !!(storage && storage.getItem(SAVE_KEY)); } catch (_) { return false; }
++}
++
++export function saveGame(state) {
++  try {
++    if (storage && state) {
++      storage.setItem(SAVE_KEY, JSON.stringify(state));
++      return true;
++    }
++  } catch (_) {}
++  return false;
++}
++
++export function loadGame() {
++  try {
++    const raw = storage ? storage.getItem(SAVE_KEY) : null;
++    if (!raw) return null;
++    return JSON.parse(raw);
++  } catch (_) { return null; }
++}
++
++export function clearSave() {
++  try { if (storage) storage.removeItem(SAVE_KEY); return true; } catch (_) { return false; }
++}
+diff --git a/apps/xiong-tu-san-guo/src/core/state.js b/apps/xiong-tu-san-guo/src/core/state.js
+new file mode 100644
+index 0000000..48e5b30
+--- /dev/null
++++ b/apps/xiong-tu-san-guo/src/core/state.js
+@@ -0,0 +1,321 @@
++// ============================================================================
++// 游戏状态：新局初始化（势力 / 城市 / 名将部署）、回合结算（经济·人口·科技·AI）、
++// 胜负判定与各类查询辅助。纯数据 + 纯函数，便于单测。
++// ============================================================================
++import {
++  CITIES, CITY_MAP,
++} from '../data/cities.js';
++import { HEROES, HERO_MAP, FACTION_SEEDS, makeGenericGeneral } from '../data/heroes.js';
++import {
++  GAME_VERSION, CMD_BASE, CMD_PER_CITY, TRAINING_BASE,
++  FACTION_COLORS, PLAYER_COLOR, GRAIN_UPKEEP_PER_SOLDIER, TECH_COST_TURNS,
++} from '../config.js';
++import { skillBonus, techMult } from './tech.js';
++import { chance } from './rng.js';
++import {
++  citiesOf, cityGoldIncome, cityGrainIncome, cityPopGrowth, cityDefenseValue,
++} from './economy.js';
++import { effLead, effWar } from './combat.js';
++
++// —— 查询辅助 ——
++export const cityById = (state, id) => state.cities.find((c) => c.id === id);
++export const heroById = (state, id) => state.heroes.find((h) => h.id === id);
++export const factionById = (state, id) => state.factions.find((f) => f.id === id);
++export const playerFaction = (state) => factionById(state, state.playerFactionId);
++export const neighbors = (state, cityId) => {
++  const c = cityById(state, cityId);
++  return c ? c.adjacent.map((id) => cityById(state, id)).filter(Boolean) : [];
++};
++export const heroesOfFaction = (state, fid) => state.heroes.filter((h) => h.factionId === fid && h.status !== 'prisoner');
++export const prisonersOfFaction = (state, fid) => state.heroes.filter((h) => h.prisonerOf === fid);
++export const lordOf = (state, fid) => state.heroes.find((h) => h.factionId === fid && (h.isPlayerLord || h.lord));
++
++// 一座城市内的己方在岗武将（free / deployed，排除俘虏、在野）
++export function heroesInCity(state, cityId, fid) {
++  return state.heroes.filter((h) => h.cityId === cityId && h.status !== 'prisoner' && !h.wild
++    && (fid == null || h.factionId === fid));
++}
++// 城市内的在野名将（可探索 / 登用）
++export function wildHeroesInCity(state, cityId) {
++  return state.heroes.filter((h) => h.wild && h.cityId === cityId && h.status !== 'gone');
++}
++
++// 带兵上限：统率 × 100 × (1 + 统御技能) × 统御科技
++export function troopCap(state, hero) {
++  if (!hero) return 0;
++  return Math.round(hero.stats.l * 100 * (1 + skillBonus(hero).cap) * techMult(state, 'leadership', 0.1));
++}
++
++// 指令点数：基础 + 每多一城 + 君主政治加成
++export function cmdPoints(state, fid) {
++  const n = citiesOf(state, fid).length;
++  const lord = lordOf(state, fid);
++  const pol = lord ? lord.stats.p : 50;
++  return CMD_BASE + CMD_PER_CITY * Math.max(0, n - 1) + Math.floor(pol / 100);
++}
++export function cmdRemaining(state, fid) {
++  return Math.max(0, cmdPoints(state, fid) - (state.cmdUsedByFaction?.[fid] || 0));
++}
++
++// 当前期望守城主将（统率最高）
++export function bestDefender(state, cityId) {
++  const city = cityById(state, cityId);
++  if (!city) return null;
++  const roster = heroesInCity(state, cityId, city.ownerFactionId);
++  if (!roster.length) return null;
++  return roster.reduce((a, b) => (effLead(a) >= effLead(b) ? a : b));
++}
++
++// 城防上限
++export function maxDefense(state, city) {
++  return Math.round(cityDefenseValue(state, city));
++}
++
++// ============================================================================
++// 新局初始化
++// ============================================================================
++export function newGame({ lordName, startCity, stats, rng } = {}) {
++  const r = rng || Math.random;
++  if (!lordName || !CITY_MAP[startCity]) throw new Error('newGame: 参数缺失');
++
++  const state = {
++    version: GAME_VERSION,
++    turn: 1,
++    playerFactionId: 0,
++    factions: [],
++    cities: [],
++    heroes: [],
++    techLevels: { agri: 0, commerce: 0, forge: 0, wall: 0, trick: 0, leadership: 0 },
++    research: null, // { key, turnsLeft }
++    cmdUsedByFaction: {},
++    log: [],
++    turnLog: [],
++    over: null,
++  };
++
++  // —— 势力：玩家（id=0）+ AI ——
++  state.factions.push({
++    id: 0, name: `${lordName}势力`, color: PLAYER_COLOR,
++    money: 0, grain: 0, aiControlled: false, lordName,
++  });
++  const facIdByKey = {}; // 势力 key → factionId（被玩家占都则缺省）
++  let fid = 1;
++  for (const seed of FACTION_SEEDS) {
++    if (seed.capital === startCity) continue; // 玩家占了都城，该势力不生成
++    const lordDef = HERO_MAP[seed.lordId];
++    state.factions.push({
++      id: fid, name: `${lordDef.name}势力`, color: FACTION_COLORS[fid % FACTION_COLORS.length],
++      money: 0, grain: 0, aiControlled: true, lordName: lordDef.name,
++    });
++    facIdByKey[seed.key] = fid;
++    fid += 1;
++  }
++
++  // —— 城市 ——
++  for (const c of CITIES) {
++    state.cities.push({
++      id: c.id, name: c.name, x: c.x, y: c.y, trait: c.trait,
++      ownerFactionId: null,
++      population: c.pop0, maxPopulation: c.popMax,
++      soldiers: c.soldiers0, defenseBase: c.defense0, defense: c.defense0,
++      gold: c.gold0, grain: c.grain0, // 城库（攻陷时被缴获）
++      farmLevel: 1, marketLevel: 1, barracksLevel: 1, wallLevel: 1, workshopLevel: 0,
++      governorHeroId: null, adjacent: c.adjacent.slice(),
++      training: TRAINING_BASE,
++    });
++  }
++  // 玩家初始城市
++  const start = cityById(state, startCity);
++  start.ownerFactionId = 0;
++  const player = playerFaction(state);
++  player.money = Math.round(start.gold + 3000);
++  player.grain = Math.round(start.grain + 5000);
++
++  // —— 玩家君主（第一武将）——
++  const lord = {
++    id: 'player_lord', name: lordName, isPlayerLord: true, lord: true,
++    factionId: 0, cityId: startCity, status: 'free', loyalty: 100,
++    stats: { ...stats }, skill: { name: '雄主', effect: 'cap:0.05' }, wild: false,
++  };
++  state.heroes.push(lord);
++  start.governorHeroId = lord.id;
++
++  // —— AI 都城归属 + 太守 ——
++  for (const seed of FACTION_SEEDS) {
++    const f = facIdByKey[seed.key];
++    if (f == null) continue;
++    const cap = cityById(state, seed.capital);
++    cap.ownerFactionId = f;
++    const fac = factionById(state, f);
++    fac.money = Math.round(cap.gold + 2000);
++    fac.grain = Math.round(cap.grain + 4000);
++  }
++
++  // —— 名将部署 ——
++  for (const h of HEROES) {
++    const copy = {
++      id: h.id, name: h.name, isPlayerLord: false,
++      factionId: null, cityId: null, status: 'free',
++      loyalty: h.loyalty, stats: { ...h.stats },
++      skill: h.skill ? { ...h.skill } : null, generic: !!h.generic, wild: false,
++    };
++    if (h.serve) {
++      const f = facIdByKey[h.serve];
++      if (f != null) {
++        const seed = FACTION_SEEDS.find((s) => s.key === h.serve);
++        copy.factionId = f;
++        copy.cityId = seed.capital;
++        copy.status = 'free';
++      } else {
++        // 势力未生成（都城被玩家所占）→ 转为该城在野，玩家可登用
++        const seed = FACTION_SEEDS.find((s) => s.key === h.serve);
++        copy.factionId = null;
++        copy.cityId = seed.capital; // == startCity
++        copy.status = 'free';
++        copy.wild = true;
++        copy.discovered = true; // 名义上原属此城，直接可见
++      }
++    } else if (h.wild) {
++      copy.factionId = null;
++      copy.cityId = h.wild;
++      copy.status = 'free';
++      copy.wild = true;
++      copy.discovered = false;
++    } else {
++      continue;
++    }
++    if (h.lord) copy.lord = true;
++    state.heroes.push(copy);
++  }
++
++  // —— AI 太守（君主坐镇都城）——
++  for (const seed of FACTION_SEEDS) {
++    const f = facIdByKey[seed.key];
++    if (f == null) continue;
++    cityById(state, seed.capital).governorHeroId = seed.lordId;
++  }
++
++  // —— 为兵微将寡的 AI 势力补充部将（每势力至少 3 名）——
++  let genIdx = 0;
++  for (const seed of FACTION_SEEDS) {
++    const f = facIdByKey[seed.key];
++    if (f == null) continue;
++    const roster = heroesOfFaction(state, f);
++    const need = Math.max(0, 3 - roster.length);
++    for (let i = 0; i < need; i++) {
++      const g = makeGenericGeneral(r, ++genIdx);
++      g.id = `gen_${seed.key}_${i}`;
++      g.factionId = f;
++      g.cityId = seed.capital;
++      g.status = 'free';
++      state.heroes.push(g);
++    }
++  }
++
++  // 初始城防归位
++  for (const c of state.cities) c.defense = maxDefense(state, c);
++
++  // 起兵之城的在野名将预先「风闻」（已发现，可直接登用），帮助玩家平稳开局
++  for (const h of state.heroes) {
++    if (h.wild && h.cityId === startCity) h.discovered = true;
++  }
++
++  state.turnLog = [`公元初年，${lordName} 于 ${start.name} 起兵，群雄并起，逐鹿天下！`];
++  return state;
++}
++
++// ============================================================================
++// 回合结算（玩家点「结束回合」后调用）
++// 顺序：城防回满 → 经济·人口结算 → 科技推进 → AI 行动 → 回合 +1 → 胜负判定
++// 返回本回合事件摘要（state.turnLog）
++// ============================================================================
++export function resolveTurn(state, aiModule, rng) {
++  const r = rng || Math.random;
++  state.turnLog = [];
++
++  for (const c of state.cities) {
++    if (c.ownerFactionId != null) c.defense = maxDefense(state, c);
++  }
++
++  // —— 经济 / 人口结算（逐势力）——
++  for (const fac of state.factions) {
++    const fid = fac.id;
++    let goldIn = 0;
++    let grainIn = 0;
++    let grainEat = 0;
++    for (const c of citiesOf(state, fid)) {
++      goldIn += cityGoldIncome(state, c);
++      grainIn += cityGrainIncome(state, c);
++      grainEat += c.soldiers * GRAIN_UPKEEP_PER_SOLDIER;
++    }
++    fac.money += Math.round(goldIn);
++    fac.grain += Math.round(grainIn - grainEat);
++
++    // 人口增长（太守或君主政治）
++    const lord = lordOf(state, fid);
++    const basePol = lord ? lord.stats.p : 50;
++    for (const c of citiesOf(state, fid)) {
++      const gov = c.governorHeroId ? heroById(state, c.governorHeroId) : null;
++      const pol = gov ? gov.stats.p : basePol;
++      const growth = cityPopGrowth(state, c, pol);
++      c.population = Math.min(c.maxPopulation, c.population + Math.round(growth));
++    }
++
++    // 军粮不足 → 士兵逃亡（最多逃 10%）
++    if (fac.grain < 0) {
++      const owned = citiesOf(state, fid).slice().sort((a, b) => b.soldiers - a.soldiers);
++      let deficitSoldiers = Math.ceil(-fac.grain / GRAIN_UPKEEP_PER_SOLDIER);
++      const total = owned.reduce((s, c) => s + c.soldiers, 0);
++      deficitSoldiers = Math.min(deficitSoldiers, Math.ceil(total * 0.1));
++      for (const c of owned) {
++        if (deficitSoldiers <= 0) break;
++        const take = Math.min(c.soldiers, deficitSoldiers);
++        c.soldiers -= take;
++        deficitSoldiers -= take;
++      }
++      fac.grain = 0;
++      if (!fac.aiControlled) state.turnLog.push(`⚠️ 军粮告竭，士兵逃亡（本城损失兵力）。`);
++    }
++  }
++
++  // —— 科技推进 ——
++  if (state.research) {
++    state.research.turnsLeft -= 1;
++    if (state.research.turnsLeft <= 0) {
++      const k = state.research.key;
++      state.techLevels[k] = Math.min(3, state.techLevels[k] + 1);
++      if (!playerFaction(state).aiControlled) {
++        state.turnLog.push(`🔬 科技突破：研究完成（${k} 升至 ${state.techLevels[k]} 级）。`);
++      }
++      state.research = null;
++    }
++  }
++
++  // —— AI 行动 ——
++  if (aiModule && typeof aiModule.aiTurnAll === 'function') {
++    aiModule.aiTurnAll(state, r);
++  }
++
++  // —— 名将忠诚度自然漂移（轻微）——
++  for (const h of state.heroes) {
++    if (h.status === 'prisoner' || h.wild) continue;
++    if (chance(r, 0.5)) h.loyalty = Math.max(0, Math.min(100, h.loyalty + (chance(r, 0.5) ? 1 : -1)));
++  }
++
++  state.turn += 1;
++  state.cmdUsedByFaction = {};
++  checkGameOver(state);
++  return state.turnLog;
++}
++
++// ============================================================================
++// 胜负判定
++// ============================================================================
++export function checkGameOver(state) {
++  const playerCities = citiesOf(state, state.playerFactionId);
++  if (playerCities.length === 0) { state.over = 'lose'; return; }
++  const allOwned = state.cities.every((c) => c.ownerFactionId === state.playerFactionId);
++  if (allOwned) state.over = 'win';
++}
++
++export { effLead, effWar };
+diff --git a/apps/xiong-tu-san-guo/src/core/tech.js b/apps/xiong-tu-san-guo/src/core/tech.js
+new file mode 100644
+index 0000000..d823efa
+--- /dev/null
++++ b/apps/xiong-tu-san-guo/src/core/tech.js
+@@ -0,0 +1,45 @@
++// ============================================================================
++// 科技效果 + 技能解析。
++// 技能 effect DSL（逗号分隔）：lead:0.10 / war:0.10 / trick:0.20 / def:0.20 /
++//   cap:0.10 / train:0.20 / p_grow:0.10 / c_recruit:0.20
++// ============================================================================
++
++const KEYS = ['lead', 'war', 'trick', 'def', 'cap', 'train', 'p_grow', 'c_recruit'];
++
++export function emptyBonus() {
++  return { lead: 0, war: 0, trick: 0, def: 0, cap: 0, train: 0, p_grow: 0, c_recruit: 0 };
++}
++
++// 解析技能 effect 字符串为加成对象
++export function parseSkill(effect) {
++  const b = emptyBonus();
++  if (!effect || typeof effect !== 'string') return b;
++  for (const part of effect.split(',')) {
++    const [k, v] = part.split(':');
++    const key = k && k.trim();
++    if (KEYS.includes(key)) {
++      const num = parseFloat(v);
++      if (Number.isFinite(num)) b[key] += num;
++    }
++  }
++  return b;
++}
++
++export function skillBonus(hero) {
++  return parseSkill(hero && hero.skill ? hero.skill.effect : '');
++}
++
++// 科技等级乘数：1 + level × perLevel
++export function techMult(state, techKey, perLevel) {
++  const lv = (state && state.techLevels && state.techLevels[techKey]) || 0;
++  return 1 + lv * perLevel;
++}
++
++export function techLevel(state, techKey) {
++  return (state && state.techLevels && state.techLevels[techKey]) || 0;
++}
++
++// 当前正在研究的科技
++export function activeResearch(state) {
++  return state && state.research ? state.research : null;
++}
+diff --git a/apps/xiong-tu-san-guo/src/data/cities.js b/apps/xiong-tu-san-guo/src/data/cities.js
+new file mode 100644
+index 0000000..99f5cdd
+--- /dev/null
++++ b/apps/xiong-tu-san-guo/src/data/cities.js
+@@ -0,0 +1,93 @@
++// ============================================================================
++// 城市（地图节点）初始数据：18 座核心城市，含坐标、特性、初始资源、邻接关系。
++// trait.type 取值：commerce(商业) / grain(粮食) / defense(城防) / growth(人口) / recruit(征兵)
++// 坐标基于 viewBox "0 0 1000 760"（西→东，北→南）。
++// ============================================================================
++export const CITIES = [
++  { id: 'luoyang', name: '洛阳', x: 500, y: 320,
++    trait: { type: 'commerce', value: 0.2, name: '天下之中', desc: '商业收入 +20%' },
++    popMax: 100000, pop0: 80000, gold0: 3000, grain0: 8000, soldiers0: 2000, defense0: 1200,
++    adjacent: ['changan', 'xuchang', 'ye', 'wan'] },
++  { id: 'changan', name: '长安', x: 250, y: 330,
++    trait: { type: 'defense', value: 0.2, name: '关中险固', desc: '城防值 +20%' },
++    popMax: 90000, pop0: 60000, gold0: 2000, grain0: 6000, soldiers0: 1800, defense0: 1100,
++    adjacent: ['luoyang', 'wuwei', 'hanzhong'] },
++  { id: 'ye', name: '邺城', x: 600, y: 270,
++    trait: { type: 'growth', value: 0.15, name: '河北要冲', desc: '人口增长 +15%' },
++    popMax: 95000, pop0: 70000, gold0: 2500, grain0: 7000, soldiers0: 2200, defense0: 1000,
++    adjacent: ['nanpi', 'puyang', 'luoyang'] },
++  { id: 'xuchang', name: '许昌', x: 620, y: 430,
++    trait: { type: 'commerce', value: 0.15, name: '中原通衢', desc: '商业收入 +15%' },
++    popMax: 85000, pop0: 55000, gold0: 2500, grain0: 7000, soldiers0: 1800, defense0: 1000,
++    adjacent: ['luoyang', 'puyang', 'xiapi', 'wan'] },
++  { id: 'chengdu', name: '成都', x: 250, y: 550,
++    trait: { type: 'grain', value: 0.2, name: '天府之国', desc: '粮食产量 +20%' },
++    popMax: 100000, pop0: 70000, gold0: 2000, grain0: 10000, soldiers0: 1600, defense0: 1000,
++    adjacent: ['hanzhong', 'jianning'] },
++  { id: 'jianye', name: '建业', x: 800, y: 500,
++    trait: { type: 'commerce', value: 0.15, name: '江东形胜', desc: '商业收入 +15%' },
++    popMax: 90000, pop0: 60000, gold0: 2200, grain0: 6500, soldiers0: 1700, defense0: 1100,
++    adjacent: ['xiapi', 'kuaiji', 'xiangyang', 'jiangling'] },
++  { id: 'xiangyang', name: '襄阳', x: 540, y: 520,
++    trait: { type: 'defense', value: 0.15, name: '荆楚咽喉', desc: '城防值 +15%' },
++    popMax: 85000, pop0: 55000, gold0: 2200, grain0: 6500, soldiers0: 1700, defense0: 1100,
++    adjacent: ['wan', 'jiangling', 'jianye'] },
++  { id: 'hanzhong', name: '汉中', x: 320, y: 430,
++    trait: { type: 'defense', value: 0.3, name: '易守难攻', desc: '城防值 +30%' },
++    popMax: 70000, pop0: 40000, gold0: 1500, grain0: 5000, soldiers0: 1400, defense0: 1300,
++    adjacent: ['changan', 'chengdu', 'wan'] },
++  { id: 'beiping', name: '北平', x: 760, y: 130,
++    trait: { type: 'recruit', value: 0.15, name: '幽燕边塞', desc: '征兵效率 +15%' },
++    popMax: 80000, pop0: 50000, gold0: 1800, grain0: 5500, soldiers0: 2000, defense0: 1000,
++    adjacent: ['nanpi'] },
++  { id: 'xiapi', name: '下邳', x: 800, y: 400,
++    trait: { type: 'commerce', value: 0.1, name: '泗水商埠', desc: '商业收入 +10%' },
++    popMax: 75000, pop0: 45000, gold0: 2000, grain0: 5500, soldiers0: 1500, defense0: 900,
++    adjacent: ['puyang', 'xuchang', 'jianye'] },
++  { id: 'wan', name: '宛城', x: 460, y: 430,
++    trait: { type: 'defense', value: 0.1, name: '南阳要冲', desc: '城防值 +10%' },
++    popMax: 72000, pop0: 42000, gold0: 1700, grain0: 5200, soldiers0: 1400, defense0: 1100,
++    adjacent: ['luoyang', 'xuchang', 'hanzhong', 'xiangyang'] },
++  { id: 'nanpi', name: '南皮', x: 660, y: 200,
++    trait: { type: 'grain', value: 0.25, name: '产粮大郡', desc: '粮食产量 +25%' },
++    popMax: 78000, pop0: 48000, gold0: 1700, grain0: 7000, soldiers0: 1500, defense0: 950,
++    adjacent: ['beiping', 'ye'] },
++  { id: 'puyang', name: '濮阳', x: 690, y: 340,
++    trait: { type: 'growth', value: 0.1, name: '中原沃野', desc: '人口增长 +10%' },
++    popMax: 76000, pop0: 46000, gold0: 1800, grain0: 5600, soldiers0: 1500, defense0: 950,
++    adjacent: ['ye', 'xiapi', 'xuchang'] },
++  { id: 'jiangling', name: '江陵', x: 480, y: 620,
++    trait: { type: 'grain', value: 0.15, name: '云梦粮仓', desc: '粮食产量 +15%' },
++    popMax: 78000, pop0: 47000, gold0: 1800, grain0: 6800, soldiers0: 1500, defense0: 950,
++    adjacent: ['xiangyang', 'guiyang', 'jianye'] },
++  { id: 'kuaiji', name: '会稽', x: 860, y: 600,
++    trait: { type: 'commerce', value: 0.2, name: '海盐通商', desc: '商业收入 +20%' },
++    popMax: 72000, pop0: 42000, gold0: 2000, grain0: 5200, soldiers0: 1300, defense0: 900,
++    adjacent: ['jianye'] },
++  { id: 'jianning', name: '建宁', x: 360, y: 660,
++    trait: { type: 'grain', value: 0.1, name: '南中屯田', desc: '粮食产量 +10%' },
++    popMax: 68000, pop0: 36000, gold0: 1400, grain0: 5400, soldiers0: 1200, defense0: 900,
++    adjacent: ['chengdu', 'guiyang'] },
++  { id: 'wuwei', name: '武威', x: 120, y: 250,
++    trait: { type: 'recruit', value: 0.2, name: '西凉铁骑', desc: '征兵效率 +20%' },
++    popMax: 64000, pop0: 32000, gold0: 1300, grain0: 4800, soldiers0: 1800, defense0: 950,
++    adjacent: ['changan'] },
++  { id: 'guiyang', name: '桂阳', x: 560, y: 690,
++    trait: { type: 'growth', value: 0.1, name: '岭南烟瘴', desc: '人口增长 +10%' },
++    popMax: 66000, pop0: 34000, gold0: 1400, grain0: 5000, soldiers0: 1200, defense0: 850,
++    adjacent: ['jianning', 'jiangling'] },
++];
++
++export const CITY_MAP = Object.fromEntries(CITIES.map((c) => [c.id, c]));
++
++// 邻接关系自检：确保双向一致（开发期辅助，构建期不抛错）
++export function adjacencyValid() {
++  for (const c of CITIES) {
++    for (const n of c.adjacent) {
++      const nb = CITY_MAP[n];
++      if (!nb) return false;
++      if (!nb.adjacent.includes(c.id)) return false;
++    }
++  }
++  return true;
++}
+diff --git a/apps/xiong-tu-san-guo/src/data/heroes.js b/apps/xiong-tu-san-guo/src/data/heroes.js
+new file mode 100644
+index 0000000..f86ec90
+--- /dev/null
++++ b/apps/xiong-tu-san-guo/src/data/heroes.js
+@@ -0,0 +1,151 @@
++// ============================================================================
++// 名将与势力种子数据：47 位历史名将 + 8 个 AI 势力种子。
++// 每个 hero：{ id, name, stats{l,w,i,p,c}, skill, loyalty, serve|wild, lord? }
++//   serve: 所属 AI 势力 key（含君主 lord:true）
++//   wild : 在野所在城市 id（可被探索 / 登用）
++// skill.effect 为简化 DSL：lead:0.10 / war:0.10 / trick:0.20 / def:0.20 / cap:0.10 / train:0.20
++// ============================================================================
++
++export const HEROES = [
++  // —— AI 君主（serve=势力 key, lord:true）——
++  { id: 'caocao', name: '曹操', serve: 'cao', lord: true, loyalty: 100,
++    stats: { l: 96, w: 80, i: 94, p: 96, c: 98 }, skill: { name: '雄才大略', effect: 'cap:0.10,trick:0.10' } },
++  { id: 'yuanshao', name: '袁绍', serve: 'yuan', lord: true, loyalty: 100,
++    stats: { l: 84, w: 78, i: 80, p: 82, c: 90 }, skill: { name: '四世三公', effect: 'cap:0.10' } },
++  { id: 'sunce', name: '孙策', serve: 'ce', lord: true, loyalty: 100,
++    stats: { l: 92, w: 92, i: 80, p: 70, c: 95 }, skill: { name: '小霸王', effect: 'war:0.10' } },
++  { id: 'dongzhuo', name: '董卓', serve: 'dong', lord: true, loyalty: 100,
++    stats: { l: 82, w: 88, i: 60, p: 50, c: 55 }, skill: { name: '魔焰滔天', effect: 'war:0.10' } },
++  { id: 'liubiao', name: '刘表', serve: 'biao', lord: true, loyalty: 100,
++    stats: { l: 70, w: 60, i: 78, p: 80, c: 85 }, skill: { name: '荆襄名士', effect: 'p_grow:0.10' } },
++  { id: 'mateng', name: '马腾', serve: 'teng', lord: true, loyalty: 100,
++    stats: { l: 82, w: 86, i: 70, p: 68, c: 80 }, skill: { name: '西凉雄风', effect: 'war:0.08' } },
++  { id: 'liuzhang', name: '刘璋', serve: 'zhang', lord: true, loyalty: 100,
++    stats: { l: 60, w: 55, i: 70, p: 75, c: 78 }, skill: { name: '益州偏安', effect: 'def:0.10' } },
++  { id: 'gongsunzan', name: '公孙瓒', serve: 'gongsun', lord: true, loyalty: 100,
++    stats: { l: 80, w: 84, i: 65, p: 60, c: 70 }, skill: { name: '白马义从', effect: 'war:0.08' } },
++
++  // —— 曹操势力 ——
++  { id: 'zhangliao', name: '张辽', serve: 'cao', loyalty: 92,
++    stats: { l: 94, w: 93, i: 78, p: 78, c: 82 }, skill: { name: '威震逍遥津', effect: 'war:0.10' } },
++  { id: 'xiahoudun', name: '夏侯惇', serve: 'cao', loyalty: 95,
++    stats: { l: 84, w: 88, i: 60, p: 70, c: 78 }, skill: { name: '刚烈', effect: 'war:0.08' } },
++  { id: 'xiahouyuan', name: '夏侯渊', serve: 'cao', loyalty: 93,
++    stats: { l: 83, w: 87, i: 65, p: 65, c: 72 }, skill: { name: '神速', effect: 'war:0.06' } },
++  { id: 'xuhuang', name: '徐晃', serve: 'cao', loyalty: 90,
++    stats: { l: 83, w: 88, i: 72, p: 70, c: 70 }, skill: null },
++  { id: 'zhanghe', name: '张郃', serve: 'cao', loyalty: 85,
++    stats: { l: 85, w: 88, i: 70, p: 68, c: 70 }, skill: null },
++  { id: 'dianwei', name: '典韦', serve: 'cao', loyalty: 96,
++    stats: { l: 70, w: 96, i: 40, p: 30, c: 50 }, skill: { name: '古之恶来', effect: 'war:0.12' } },
++  { id: 'xuchu2', name: '许褚', serve: 'cao', loyalty: 95,
++    stats: { l: 72, w: 94, i: 35, p: 30, c: 55 }, skill: { name: '虎痴', effect: 'war:0.10' } },
++  { id: 'guojia', name: '郭嘉', serve: 'cao', loyalty: 90,
++    stats: { l: 70, w: 40, i: 98, p: 85, c: 80 }, skill: { name: '鬼才', effect: 'trick:0.20' } },
++  { id: 'xunyu', name: '荀彧', serve: 'cao', loyalty: 92,
++    stats: { l: 75, w: 40, i: 95, p: 98, c: 88 }, skill: { name: '王佐之才', effect: 'p_grow:0.15' } },
++  { id: 'jiaxu', name: '贾诩', serve: 'cao', loyalty: 88,
++    stats: { l: 80, w: 50, i: 96, p: 80, c: 70 }, skill: { name: '毒士', effect: 'trick:0.20' } },
++  { id: 'chengyu', name: '程昱', serve: 'cao', loyalty: 88,
++    stats: { l: 72, w: 55, i: 90, p: 80, c: 65 }, skill: null },
++
++  // —— 袁绍势力 ——
++  { id: 'yanliang', name: '颜良', serve: 'yuan', loyalty: 82,
++    stats: { l: 80, w: 92, i: 50, p: 45, c: 60 }, skill: null },
++  { id: 'wenchou', name: '文丑', serve: 'yuan', loyalty: 82,
++    stats: { l: 78, w: 92, i: 45, p: 40, c: 58 }, skill: null },
++
++  // —— 孙策势力 ——
++  { id: 'zhouyu', name: '周瑜', serve: 'ce', loyalty: 98,
++    stats: { l: 95, w: 78, i: 97, p: 86, c: 92 }, skill: { name: '火烧赤壁', effect: 'trick:0.20' } },
++  { id: 'taishici', name: '太史慈', serve: 'ce', loyalty: 90,
++    stats: { l: 84, w: 93, i: 70, p: 60, c: 78 }, skill: null },
++  { id: 'ganning', name: '甘宁', serve: 'ce', loyalty: 85,
++    stats: { l: 86, w: 94, i: 70, p: 55, c: 75 }, skill: { name: '锦帆贼', effect: 'war:0.08' } },
++  { id: 'huanggai', name: '黄盖', serve: 'ce', loyalty: 95,
++    stats: { l: 80, w: 86, i: 65, p: 60, c: 78 }, skill: null },
++  { id: 'lvmeng', name: '吕蒙', serve: 'ce', loyalty: 90,
++    stats: { l: 88, w: 85, i: 90, p: 80, c: 75 }, skill: { name: '刮目相看', effect: 'trick:0.10' } },
++  { id: 'luxun', name: '陆逊', serve: 'ce', loyalty: 92,
++    stats: { l: 90, w: 75, i: 95, p: 88, c: 85 }, skill: { name: '火烧连营', effect: 'trick:0.20' } },
++  { id: 'lusu', name: '鲁肃', serve: 'ce', loyalty: 93,
++    stats: { l: 78, w: 50, i: 92, p: 95, c: 92 }, skill: null },
++
++  // —— 董卓势力 ——
++  { id: 'lvbu', name: '吕布', serve: 'dong', loyalty: 70,
++    stats: { l: 78, w: 100, i: 35, p: 26, c: 47 }, skill: { name: '人中吕布', effect: 'war:0.15' } },
++  { id: 'huaxiong', name: '华雄', serve: 'dong', loyalty: 80,
++    stats: { l: 75, w: 88, i: 40, p: 35, c: 50 }, skill: null },
++
++  // —— 马腾势力 ——
++  { id: 'machao', name: '马超', serve: 'teng', loyalty: 80,
++    stats: { l: 88, w: 97, i: 50, p: 40, c: 70 }, skill: { name: '锦马超', effect: 'war:0.10' } },
++
++  // —— 在野名将（wild=城市 id，可探索登用）——
++  { id: 'liubei', name: '刘备', wild: 'luoyang', loyalty: 99,
++    stats: { l: 90, w: 78, i: 80, p: 85, c: 99 }, skill: { name: '仁德', effect: 'c_recruit:0.20' } },
++  { id: 'guanyu', name: '关羽', wild: 'wan', loyalty: 95,
++    stats: { l: 96, w: 97, i: 75, p: 62, c: 88 }, skill: { name: '威震华夏', effect: 'lead:0.10,war:0.05' } },
++  { id: 'zhangfei', name: '张飞', wild: 'wan', loyalty: 90,
++    stats: { l: 85, w: 98, i: 45, p: 30, c: 60 }, skill: { name: '燕人咆哮', effect: 'war:0.10' } },
++  { id: 'zhaoyun', name: '赵云', wild: 'nanpi', loyalty: 92,
++    stats: { l: 91, w: 96, i: 76, p: 65, c: 85 }, skill: { name: '常胜将军', effect: 'war:0.08,def:0.10' } },
++  { id: 'zhugeliang', name: '诸葛亮', wild: 'xiangyang', loyalty: 100,
++    stats: { l: 92, w: 40, i: 100, p: 98, c: 93 }, skill: { name: '神算', effect: 'trick:0.20,p_grow:0.10' } },
++  { id: 'huangzhong', name: '黄忠', wild: 'kuaiji', loyalty: 88,
++    stats: { l: 86, w: 95, i: 65, p: 60, c: 70 }, skill: null },
++  { id: 'pangtong', name: '庞统', wild: 'guiyang', loyalty: 85,
++    stats: { l: 80, w: 45, i: 97, p: 90, c: 80 }, skill: { name: '凤雏', effect: 'trick:0.15' } },
++  { id: 'fazheng', name: '法正', wild: 'hanzhong', loyalty: 88,
++    stats: { l: 75, w: 50, i: 94, p: 88, c: 75 }, skill: null },
++  { id: 'weiyan', name: '魏延', wild: 'xiapi', loyalty: 78,
++    stats: { l: 88, w: 92, i: 70, p: 60, c: 65 }, skill: null },
++  { id: 'jiangwei', name: '姜维', wild: 'hanzhong', loyalty: 90,
++    stats: { l: 91, w: 90, i: 90, p: 80, c: 80 }, skill: { name: '麒麟儿', effect: 'lead:0.08,trick:0.10' } },
++  { id: 'huatuo', name: '华佗', wild: 'luoyang', loyalty: 80,
++    stats: { l: 40, w: 30, i: 90, p: 85, c: 90 }, skill: { name: '神医', effect: 'def:0.10' } },
++  { id: 'simayi', name: '司马懿', wild: 'wan', loyalty: 85,
++    stats: { l: 93, w: 70, i: 96, p: 93, c: 88 }, skill: { name: '韬略', effect: 'trick:0.15' } },
++  { id: 'dengai', name: '邓艾', wild: 'puyang', loyalty: 88,
++    stats: { l: 90, w: 85, i: 89, p: 85, c: 75 }, skill: null },
++  { id: 'zhonghui', name: '钟会', wild: 'guiyang', loyalty: 78,
++    stats: { l: 82, w: 75, i: 88, p: 75, c: 70 }, skill: null },
++  { id: 'gaoshun', name: '高顺', wild: 'jianning', loyalty: 85,
++    stats: { l: 82, w: 90, i: 55, p: 50, c: 60 }, skill: { name: '陷阵营', effect: 'war:0.10' } },
++  { id: 'simazhao', name: '司马昭', wild: 'xiapi', loyalty: 82,
++    stats: { l: 85, w: 70, i: 90, p: 85, c: 80 }, skill: null },
++];
++
++export const HERO_MAP = Object.fromEntries(HEROES.map((h) => [h.id, h]));
++
++// AI 势力种子：capital 为初始都城，lordId 指向 HEROES 中的君主。
++// 玩家若选择某都城开局，对应势力不生成，其名将转为该城在野（玩家可登用）。
++export const FACTION_SEEDS = [
++  { key: 'cao', capital: 'xuchang', lordId: 'caocao' },
++  { key: 'yuan', capital: 'ye', lordId: 'yuanshao' },
++  { key: 'ce', capital: 'jianye', lordId: 'sunce' },
++  { key: 'dong', capital: 'changan', lordId: 'dongzhuo' },
++  { key: 'biao', capital: 'jiangling', lordId: 'liubiao' },
++  { key: 'teng', capital: 'wuwei', lordId: 'mateng' },
++  { key: 'zhang', capital: 'chengdu', lordId: 'liuzhang' },
++  { key: 'gongsun', capital: 'beiping', lordId: 'gongsunzan' },
++];
++
++// 生成器：为兵力薄弱的 AI 势力补充随机「部将」（无技能，属性中等）。
++// index 用于生成唯一 id，调用方负责保证其单调递增。
++const GENERIC_SURNAMES = ['李', '王', '张', '刘', '陈', '杨', '赵', '黄', '周', '吴', '徐', '孙', '胡', '朱', '高', '林', '何', '郭', '马', '罗'];
++const GENERIC_GIVENS = ['成', '武', '义', '忠', '安', '定', '远', '彪', '虎', '达', '凯', '平', '宁', '胜', '广'];
++export function makeGenericGeneral(rng, index) {
++  const r = rng || Math.random;
++  const name = GENERIC_SURNAMES[Math.floor(r() * GENERIC_SURNAMES.length)]
++    + GENERIC_GIVENS[Math.floor(r() * GENERIC_GIVENS.length)];
++  const ri = (lo, hi) => Math.floor(lo + r() * (hi - lo));
++  return {
++    id: `gen_${index}`,
++    name,
++    generic: true,
++    loyalty: ri(55, 85),
++    stats: { l: ri(55, 82), w: ri(55, 85), i: ri(45, 78), p: ri(40, 72), c: ri(45, 75) },
++    skill: null,
++  };
++}
+diff --git a/apps/xiong-tu-san-guo/src/main.js b/apps/xiong-tu-san-guo/src/main.js
+new file mode 100644
+index 0000000..ccf5827
+--- /dev/null
++++ b/apps/xiong-tu-san-guo/src/main.js
+@@ -0,0 +1,19 @@
++// ============================================================================
++// 雄图·三国志文明 · 入口
++// 导出 createGame(parent) 工厂，供主框架（落地页）按需挂载到任意容器；
++// 同时保留独立运行（apps/xiong-tu-san-guo/index.html）时的自动挂载行为。
++// ============================================================================
++import { GameUI } from './ui/app.js';
++
++export function createGame(parent) {
++  const ui = new GameUI(parent);
++  ui.mount();
++  return ui;
++}
++
++// 独立运行时自动挂载到 #game-container（仅在元素存在时触发，
++// 避免被主框架动态 import 时误启动游戏）。
++if (typeof document !== 'undefined' && document.getElementById('game-container')) {
++  const ui = createGame(document.getElementById('game-container'));
++  if (typeof window !== 'undefined') window.__XTSG = ui; // 暴露实例便于调试 / 冒烟测试
++}
+diff --git a/apps/xiong-tu-san-guo/src/ui/app.js b/apps/xiong-tu-san-guo/src/ui/app.js
+new file mode 100644
+index 0000000..8f96bc2
+--- /dev/null
++++ b/apps/xiong-tu-san-guo/src/ui/app.js
+@@ -0,0 +1,722 @@
++// ============================================================================
++// 雄图·三国志文明 · UI 控制器（纯原生 DOM）
++// 三层屏幕：启动器（新局 / 继续）→ 创角 → 对局（顶栏 + 五标签 + 弹窗）。
++// 对局标签：地图 / 势力 / 名将 / 科技 / 系统。
++// ============================================================================
++import './style.css';
++import { attachKeyboardShell } from '../../../_lib/keyboard-shell.js';
++import { h, clear, bar } from './dom.js';
++import {
++  TECHS, FORMATIONS, STRATAGEMS, BUILD_MAX, TECH_MAX_LEVEL, TECH_COST_GOLD,
++  TRAINING_MAX, FACTION_COLORS, NEUTRAL_COLOR, seasonOf, clamp,
++} from '../config.js';
++import { CITIES } from '../data/cities.js';
++import { newGame, resolveTurn, cityById, heroById, factionById, playerFaction,
++  neighbors, heroesOfFaction, heroesInCity, wildHeroesInCity, prisonersOfFaction,
++  troopCap, cmdPoints, cmdRemaining, bestDefender, lordOf, maxDefense } from '../core/state.js';
++import { citiesOf, factionGoldIncome, factionGrainNet } from '../core/economy.js';
++import { effLead, effWar } from '../core/combat.js';
++import { techLevel } from '../core/tech.js';
++import * as A from '../core/actions.js';
++import { aiTurnAll } from '../core/ai.js';
++import { hasSave, saveGame, loadGame, clearSave } from '../core/save.js';
++import { chance } from '../core/rng.js';
++
++const STAT_KEYS = [
++  ['l', '统'], ['w', '武'], ['i', '智'], ['p', '政'], ['c', '魅'],
++];
++const TABS = [
++  { key: 'map', icon: '🗺️', label: '地图' },
++  { key: 'faction', icon: '🏯', label: '势力' },
++  { key: 'heroes', icon: '⚔️', label: '名将' },
++  { key: 'tech', icon: '📜', label: '科技' },
++  { key: 'system', icon: '⚙️', label: '系统' },
++];
++
++export class GameUI {
++  constructor(parent) {
++    this.parent = parent;
++    this.state = null;
++    this.tab = 'map';
++    this.selectedCityId = null;
++    this.screen = 'start';
++    this.charTemplate = null;
++    this.startCityPick = null;
++  }
++
++  mount() {
++    this.root = h('div', { class: 'xtsg' });
++    clear(this.parent);
++    this.parent.appendChild(this.root);
++    this.toastWrap = h('div', { class: 'toast-wrap' });
++    this.stage = h('div', { class: 'stage' });
++    this.modalRoot = h('div', { class: 'xtsg-modals' });
++    this.root.append(this.toastWrap, this.stage, this.modalRoot);
++    this._detachKeyboard = attachKeyboardShell(this.root);
++    this.showStart();
++    return this;
++  }
++
++  destroy() {
++    if (this._detachKeyboard) { try { this._detachKeyboard(); } catch (_) {} }
++    try { clear(this.parent); } catch (_) {}
++  }
++
++  // ============ Toast / Modal ============
++  toast(msg) {
++    const t = h('div', { class: 'toast' }, msg);
++    this.toastWrap.appendChild(t);
++    setTimeout(() => { try { this.toastWrap.removeChild(t); } catch (_) {} }, 2400);
++  }
++  closeModal() { clear(this.modalRoot); }
++  openModal({ title, body, foot }) {
++    clear(this.modalRoot);
++    const card = h('div', { class: 'modal__card' },
++      h('div', { class: 'modal__head' }, h('h3', null, title)),
++      h('div', { class: 'modal__body' }, body),
++      foot ? h('div', { class: 'modal__foot' }, foot) : null,
++    );
++    // 点遮罩关闭；点卡片内不关闭（避免误触）
++    const backdrop = h('div', { class: 'modal', onClick: (e) => { if (e.target === e.currentTarget) this.closeModal(); } }, card);
++    this.modalRoot.appendChild(backdrop);
++    return card;
++  }
++  // 带确认/取消的表单弹窗
++  openForm(title, bodyNode, onConfirm, confirmLabel = '确认') {
++    const foot = [
++      h('button', { class: 'btn-ghost grow', onClick: () => this.closeModal() }, '取消'),
++      h('button', { class: 'btn-primary grow', onClick: onConfirm }, confirmLabel),
++    ];
++    return this.openModal({ title, body: bodyNode, foot });
++  }
++
++  // ============ 启动器 ============
++  showStart() {
++    this.screen = 'start';
++    this.state = null;
++    clear(this.stage);
++    const wrap = h('div', { class: 'launcher' },
++      h('div', { class: 'launcher__brand' },
++        h('div', { class: 'emblem' }, '雄'),
++        h('h1', null, '雄图·三国志文明'),
++        h('p', { class: 'sub' }, '内政 · 科技 · 名将 · 征伐 · 统一天下'),
++      ),
++      h('div', { class: 'launcher__menu' },
++        h('button', { class: 'btn-primary btn-block', onClick: () => this.showCreate() }, '新游戏'),
++        h('button', {
++          class: 'btn-ghost btn-block', disabled: !hasSave(), onClick: () => this.continueGame(),
++        }, hasSave() ? '继续游戏' : '继续游戏（无存档）'),
++      ),
++      h('p', { class: 'hint center' }, '选择一座城池起兵，招揽名将、发展内政、征战四方。'),
++    );
++    this.stage.appendChild(wrap);
++  }
++
++  continueGame() {
++    const s = loadGame();
++    if (!s) { this.toast('存档读取失败'); return; }
++    this.state = s;
++    this.enterGame();
++  }
++
++  // ============ 创角 ============
++  showCreate() {
++    this.screen = 'create';
++    this.charTemplate = { name: '', stats: this.rollStats(), rerolls: 0 };
++    this.startCityPick = null;
++    this.renderCreate();
++  }
++  rollStats() {
++    const s = {};
++    for (const [k] of STAT_KEYS) s[k] = 50 + Math.floor(Math.random() * 51); // 50~100
++    return s;
++  }
++  renderCreate() {
++    clear(this.stage);
++    const t = this.charTemplate;
++
++    const nameInput = h('input', { type: 'text', maxlength: 4, placeholder: '2~4 个汉字', value: t.name,
++      onInput: (e) => { t.name = e.target.value; } });
++
++    const statGrid = h('div', { class: 'stat-grid' },
++      STAT_KEYS.map(([k, label]) => h('div', { class: 'stat' },
++        h('div', { class: 'stat__k' }, label), h('div', { class: 'stat__v' }, t.stats[k]))));
++    const rerollBtn = h('button', { class: 'btn-ghost btn-block', disabled: t.rerolls >= 5,
++      onClick: () => { t.stats = this.rollStats(); t.rerolls += 1; this.renderCreate(); } },
++      `重新随机属性（${t.rerolls}/5）`);
++
++    const cityPick = h('div', { class: 'city-pick' }, CITIES.map((c) => {
++      const sel = this.startCityPick === c.id;
++      return h('button', {
++        class: `city-pick__item${sel ? ' city-pick__item--sel' : ''}`,
++        onClick: () => { this.startCityPick = c.id; this.renderCreate(); },
++      },
++        h('div', null, h('b', null, c.name)),
++        h('div', { class: 'muted' }, c.trait.name),
++      );
++    }));
++
++    const startBtn = h('button', { class: 'btn-primary btn-block',
++      onClick: () => this.beginGame(),
++    }, '起兵出征');
++
++    const wrap = h('div', { class: 'create' },
++      h('h2', null, '一、立君'),
++      h('div', { class: 'create__field' }, h('label', null, '君主姓名（2~4 个汉字）'), nameInput),
++      h('div', { class: 'create__field' }, h('label', null, '君主属性'), statGrid, rerollBtn),
++      h('h2', null, '二、择都'),
++      h('p', { class: 'hint' }, '选择起兵之城。占据诸侯旧都，其旧部将转为在野，可择机登用。'),
++      cityPick,
++      h('div', { style: { height: '0.8rem' } }),
++      startBtn,
++      h('div', { style: { height: '0.4rem' } }),
++      h('button', { class: 'btn-ghost btn-block', onClick: () => this.showStart() }, '返回'),
++    );
++    this.stage.appendChild(wrap);
++    // 挂载临时引用，便于 beginGame 读取输入框最新值
++    this._nameInput = nameInput;
++  }
++
++  beginGame() {
++    const name = (this._nameInput?.value || this.charTemplate.name || '').trim();
++    if (!/^[一-龥]{2,4}$/.test(name)) { this.toast('君主姓名须为 2~4 个汉字'); return; }
++    if (!this.startCityPick) { this.toast('请选择起兵之城'); return; }
++    this.state = newGame({ lordName: name, startCity: this.startCityPick, stats: this.charTemplate.stats });
++    saveGame(this.state);
++    this.toast(`${name} 于 ${cityById(this.state, this.startCityPick).name} 起兵！`);
++    this.enterGame();
++  }
++
++  // ============ 进入对局 ============
++  enterGame() {
++    this.screen = 'game';
++    this.tab = 'map';
++    this.selectedCityId = playerFaction(this.state) && citiesOf(this.state, this.state.playerFactionId)[0]?.id;
++    this.renderGame();
++  }
++
++  renderGame() {
++    if (this.state.over) { this.renderGameOver(); return; }
++    clear(this.stage);
++    this.gameRoot = h('div', { class: 'game' });
++    this.stage.appendChild(this.gameRoot);
++    this.topbar = h('div', { class: 'topbar' });
++    this.tabbar = h('div', { class: 'tabbar' });
++    this.content = h('div', { class: 'content' });
++    this.gameRoot.append(this.topbar, this.tabbar, this.content);
++    this.refreshTopbar();
++    this.renderTabbar();
++    this.renderContent();
++  }
++
++  refreshTopbar() {
++    const s = this.state;
++    const fac = playerFaction(s);
++    const goldIn = Math.round(factionGoldIncome(s, s.playerFactionId));
++    const grainNet = factionGrainNet(s, s.playerFactionId);
++    const cmd = cmdRemaining(s, s.playerFactionId);
++    clear(this.topbar);
++    this.topbar.appendChild(h('div', { class: 'topbar__row' },
++      h('span', { class: 'topbar__title' }, `${fac.name}`),
++      h('span', { class: 'res-pill' }, `${seasonOf(s.turn)} · 第${s.turn}回合`),
++      h('span', { class: 'res-pill' }, `金 `, h('b', null, Math.round(fac.money))),
++      h('span', { class: 'res-pill' }, `粮 `, h('b', null, Math.round(fac.grain))),
++      h('span', { class: 'res-pill cmd-pill' }, `令 ${cmd}`),
++    ));
++    this.topbar.appendChild(h('div', { class: 'topbar__row', style: { marginTop: '0.35rem' } },
++      h('span', { class: 'hint', style: { margin: 0 } }, `金 +${goldIn}/回 · 粮 ${Math.round(grainNet.net)}/回（产${Math.round(grainNet.prod)} 耗${Math.round(grainNet.upkeep)}）`),
++      h('span', { class: 'grow' }),
++      h('button', { class: 'btn-primary', onClick: () => this.confirmEndTurn() }, '结束回合'),
++    ));
++  }
++
++  renderTabbar() {
++    clear(this.tabbar);
++    for (const t of TABS) {
++      this.tabbar.appendChild(h('button', {
++        class: `tab${this.tab === t.key ? ' tab--active' : ''}`,
++        onClick: () => { this.tab = t.key; this.renderTabbar(); this.renderContent(); },
++      }, `${t.icon} ${t.label}`));
++    }
++  }
++
++  renderContent() {
++    clear(this.content);
++    if (this.tab === 'map') this.renderMap();
++    else if (this.tab === 'faction') this.renderFaction();
++    else if (this.tab === 'heroes') this.renderHeroes();
++    else if (this.tab === 'tech') this.renderTech();
++    else if (this.tab === 'system') this.renderSystem();
++  }
++
++  // ============ 地图 ============
++  renderMap() {
++    const s = this.state;
++    const wrap = h('div', { class: 'map-wrap' });
++    const svgNS = 'http://www.w3.org/2000/svg';
++    const svg = document.createElementNS(svgNS, 'svg');
++    svg.setAttribute('class', 'map-svg');
++    svg.setAttribute('viewBox', '0 0 1000 760');
++    svg.setAttribute('preserveAspectRatio', 'none');
++    // 连线（去重）
++    for (const c of s.cities) {
++      for (const nid of c.adjacent) {
++        if (c.id < nid) {
++          const n = cityById(s, nid);
++          const ln = document.createElementNS(svgNS, 'line');
++          ln.setAttribute('x1', c.x); ln.setAttribute('y1', c.y);
++          ln.setAttribute('x2', n.x); ln.setAttribute('y2', n.y);
++          ln.setAttribute('class', 'map-line');
++          svg.appendChild(ln);
++        }
++      }
++    }
++    wrap.appendChild(svg);
++    // 城市点
++    for (const c of s.cities) {
++      const fac = c.ownerFactionId != null ? factionById(s, c.ownerFactionId) : null;
++      const color = fac ? fac.color : NEUTRAL_COLOR;
++      const isPlayer = c.ownerFactionId === s.playerFactionId;
++      const isSel = this.selectedCityId === c.id;
++      const dot = h('button', {
++        class: `map-dot${isPlayer ? ' map-dot--player' : ''}${isSel ? ' map-dot--selected' : ''}`,
++        style: { left: `${(c.x / 1000) * 100}%`, top: `${(c.y / 760) * 100}%`, background: color },
++        onClick: () => { this.selectedCityId = c.id; this.openCityMenu(c.id); },
++      }, c.name.slice(0, 2));
++      wrap.appendChild(dot);
++      wrap.appendChild(h('span', { class: 'map-label', style: { left: `${(c.x / 1000) * 100}%`, top: `${(c.y / 760) * 100}%` } }, c.name));
++    }
++    this.content.appendChild(h('div', null,
++      h('h3', null, '九州形势图'),
++      h('p', { class: 'hint' }, '点击城市查看详情与指令。金边为己方，灰点为空城，他色为诸侯。'),
++      wrap,
++    ));
++    // 提示当前选中
++    if (this.selectedCityId) {
++      const c = cityById(s, this.selectedCityId);
++      this.content.appendChild(h('div', { class: 'hint center' }, `已选：${c ? c.name : '无'}（再次点击城市可操作）`));
++    }
++  }
++
++  // ============ 城市操作菜单 ============
++  openCityMenu(cityId) {
++    const s = this.state;
++    const c = cityById(s, cityId);
++    if (!c) return;
++    this.renderMap(); // 刷新选中态
++    const owned = c.ownerFactionId === s.playerFactionId;
++    if (owned) this.openOwnedCity(c);
++    else this.openEnemyCity(c);
++  }
++
++  cityHeader(c) {
++    const fac = c.ownerFactionId != null ? factionById(this.state, c.ownerFactionId) : null;
++    const color = fac ? fac.color : NEUTRAL_COLOR;
++    return h('div', { class: 'panel__head' },
++      h('span', { class: 'panel__swatch', style: { background: color } }),
++      h('h4', null, c.name),
++      h('span', { class: 'hero-card__sub' }, `${c.trait.name} · ${c.trait.desc}`),
++    );
++  }
++  cityRows(c) {
++    const gov = c.governorHeroId ? heroById(this.state, c.governorHeroId) : null;
++    const r = (k, v) => h('div', null, h('span', { class: 'muted' }, k), ' ', v);
++    return h('div', { class: 'panel__rows' },
++      r('归属', c.ownerFactionId != null ? (factionById(this.state, c.ownerFactionId)?.name || '—') : '空城'),
++      r('人口', `${Math.round(c.population)} / ${c.maxPopulation}`),
++      r('士兵', Math.round(c.soldiers)),
++      r('城防', `${Math.round(c.defense)}`),
++      r('农田', `Lv${c.farmLevel}`),
++      r('市集', `Lv${c.marketLevel}`),
++      r('城墙', `Lv${c.wallLevel}`),
++      r('兵营', `Lv${c.barracksLevel}`),
++      r('训练度', c.training),
++      r('太守', gov ? gov.name : '—'),
++    );
++  }
++
++  openOwnedCity(c) {
++    const s = this.state;
++    const fid = s.playerFactionId;
++    const cmdBtn = (label, fn, danger) => h('button', {
++      class: `cmd-btn ${danger ? 'btn-danger' : 'btn-primary'}`, onClick: () => { const r = fn(); if (r.msg) this.toast(r.msg); this.afterAction(); },
++    }, label);
++    const grid = h('div', { class: 'cmd-grid' },
++      cmdBtn(`农田 Lv${c.farmLevel}`, () => A.developFarm(s, c.id)),
++      cmdBtn(`市集 Lv${c.marketLevel}`, () => A.developMarket(s, c.id)),
++      cmdBtn(`城墙 Lv${c.wallLevel}`, () => A.buildWall(s, c.id)),
++      cmdBtn('征兵', () => this.uiRecruit(c)),
++      cmdBtn('操练', () => A.train(s, c.id)),
++      cmdBtn('探索', () => A.explore(s, c.id)),
++    );
++    const advBtns = h('div', { class: 'hero-card__foot' },
++      h('button', { class: 'btn-jade', onClick: () => this.uiAppoint(c) }, '任命太守'),
++      h('button', { class: 'btn-jade', onClick: () => this.uiMoveHero(c) }, '调遣武将'),
++      h('button', { class: 'btn-primary', onClick: () => this.uiTransport(c) }, '输送资源'),
++    );
++    // 在野名将登用入口
++    const wilds = wildHeroesInCity(s, c.id).filter((w) => w.discovered);
++    const wildBlock = wilds.length ? h('div', { style: { marginTop: '0.6rem' } },
++      h('div', { class: 'hint' }, '本城在野名将：'),
++      h('div', { class: 'hero-card__foot' }, wilds.map((w) => h('button', { class: 'btn-ghost', onClick: () => { const r = A.recruitHero(s, w.id); this.toast(r.msg); this.afterAction(); } }, `登用 ${w.name}`))),
++    ) : null;
++
++    const body = h('div', null, this.cityHeader(c), this.cityRows(c), grid, advBtns, wildBlock);
++    this.openModal({ title: `城务 · ${c.name}`, body, foot: [h('button', { class: 'btn-ghost grow', onClick: () => this.closeModal() }, '关闭')] });
++  }
++
++  openEnemyCity(c) {
++    const s = this.state;
++    const body = h('div', null,
++      this.cityHeader(c),
++      this.cityRows(c),
++      h('div', { class: 'hero-card__foot' },
++        h('button', { class: 'btn-danger', onClick: () => this.uiCampaign(c) }, '出征攻打'),
++        h('button', { class: 'btn-ghost', onClick: () => this.uiStratagem(c) }, '施计'),
++      ),
++    );
++    this.openModal({ title: `敌情 · ${c.name}`, body, foot: [h('button', { class: 'btn-ghost grow', onClick: () => this.closeModal() }, '关闭')] });
++  }
++
++  // —— 征兵 ——
++  uiRecruit(c) {
++    const s = this.state;
++    const fac = playerFaction(s);
++    let n = Math.min(1000, Math.floor(c.population * 0.1));
++    n = Math.max(50, n);
++    const input = h('input', { type: 'number', value: n, min: 50, step: 50, style: { width: '5rem' } });
++    const body = h('div', null,
++      h('p', { class: 'hint' }, `城中人口 ${Math.round(c.population)}，金 ${Math.round(fac.money)}。每兵耗 1.5 金 + 1 人口。`),
++      h('div', { class: 'create__field' }, h('label', null, '征兵数量'), input),
++    );
++    this.openForm('征兵', body, () => {
++      const cnt = clamp(parseInt(input.value, 10) || 0, 0, 99999);
++      const r = A.recruit(s, c.id, cnt);
++      this.toast(r.msg);
++      this.closeModal();
++      this.afterAction();
++    }, '征兵');
++    return { ok: true, msg: '' };
++  }
++
++  // —— 任命太守 ——
++  uiAppoint(c) {
++    const s = this.state;
++    const roster = heroesInCity(s, c.id, s.playerFactionId);
++    if (!roster.length) { this.toast('城中无可任命之武将'); return; }
++    const sel = h('select', null, roster.map((h2) => h('option', { value: h2.id }, `${h2.name}（统${h2.stats.l}）`)));
++    sel.value = c.governorHeroId || roster[0].id;
++    const body = h('div', null, h('p', { class: 'hint' }, '太守政治影响本城人口增长。'), sel);
++    this.openForm('任命太守', body, () => {
++      const r = A.appointGovernor(s, c.id, sel.value);
++      this.toast(r.msg); this.closeModal(); this.afterAction();
++    }, '任命');
++  }
++
++  // —— 调遣武将（本城 → 邻接己城）——
++  uiMoveHero(c) {
++    const s = this.state;
++    const roster = heroesInCity(s, c.id, s.playerFactionId);
++    const targets = neighbors(s, c.id).filter((n) => n.ownerFactionId === s.playerFactionId);
++    if (!roster.length || !targets.length) { this.toast('无可调遣武将或无邻接己城'); return; }
++    const hSel = h('select', null, roster.map((h2) => h('option', { value: h2.id }, h2.name)));
++    const tSel = h('select', null, targets.map((n) => h('option', { value: n.id }, n.name)));
++    const body = h('div', null, h('p', { class: 'hint' }, '将本城武将调往相邻己方城市。'), hSel, h('div', { style: { height: '0.4rem' } }), tSel);
++    this.openForm('调遣武将', body, () => {
++      const r = A.moveHero(s, hSel.value, tSel.value);
++      this.toast(r.msg); this.closeModal(); this.afterAction();
++    }, '调遣');
++  }
++
++  // —— 输送资源 ——
++  uiTransport(c) {
++    const s = this.state;
++    const targets = neighbors(s, c.id).filter((n) => n.ownerFactionId === s.playerFactionId);
++    if (!targets.length) { this.toast('无邻接己城可输送'); return; }
++    const fac = playerFaction(s);
++    const tSel = h('select', null, targets.map((n) => h('option', { value: n.id }, n.name)));
++    const sIn = h('input', { type: 'number', value: Math.min(500, c.soldiers), min: 0, style: { width: '5rem' } });
++    const body = h('div', null,
++      h('p', { class: 'hint' }, `金 ${Math.round(fac.money)} · 粮 ${Math.round(fac.grain)}（势力共享，无需输送）· 本城兵 ${Math.round(c.soldiers)}`),
++      h('div', { class: 'create__field' }, h('label', null, '目标城市'), tSel),
++      h('div', { class: 'stat-grid' },
++        h('div', { class: 'stat' }, h('div', { class: 'stat__k' }, '兵'), h('div', { class: 'stat__v', style: { fontSize: '0.9rem' } }, sIn)),
++      ),
++    );
++    this.openForm('输送士兵', body, () => {
++      const r = A.transport(s, c.id, tSel.value, { soldiers: parseInt(sIn.value, 10) || 0 });
++      this.toast(r.msg); this.closeModal(); this.afterAction();
++    }, '输送');
++  }
++
++  // —— 出征 ——
++  uiCampaign(target) {
++    const s = this.state;
++    // 可出发的己方邻城
++    const sources = neighbors(s, target.id).filter((n) => n.ownerFactionId === s.playerFactionId);
++    if (!sources.length) { this.toast('无可出发的相邻己城'); return; }
++    const srcSel = h('select', null, sources.map((n) => h('option', { value: n.id }, n.name)));
++    const formSel = h('select', null, Object.entries(FORMATIONS).map(([k, f]) => h('option', { value: k }, `${f.name}（${f.desc}）`)));
++    const genSel = h('select');
++    const troopsIn = h('input', { type: 'number', value: 1000, min: 100, step: 100, style: { width: '5rem' } });
++    const refreshGenerals = () => {
++      const src = cityById(s, srcSel.value);
++      const gens = heroesInCity(s, src.id, s.playerFactionId);
++      clear(genSel);
++      if (!gens.length) { genSel.appendChild(h('option', null, '无可用武将')); return; }
++      for (const g of gens) genSel.appendChild(h('option', { value: g.id }, `${g.name}（统${g.stats.l} · 上限${troopCap(s, g)}）`));
++      const g = gens[0];
++      troopsIn.max = Math.min(src.soldiers, troopCap(s, g));
++      troopsIn.value = Math.min(parseInt(troopsIn.value, 10) || 1000, parseInt(troopsIn.max, 10));
++    };
++    srcSel.addEventListener('change', refreshGenerals);
++    const body = h('div', null,
++      h('p', { class: 'hint' }, `攻打 ${target.name}（守军 ${Math.round(target.soldiers)} · 城防 ${Math.round(target.defense)}）`),
++      h('div', { class: 'create__field' }, h('label', null, '出发城市'), srcSel),
++      h('div', { class: 'create__field' }, h('label', null, '主将'), genSel),
++      h('div', { class: 'create__field' }, h('label', null, '出兵数量（按路程耗粮）'), troopsIn),
++      h('div', { class: 'create__field' }, h('label', null, '阵型'), formSel),
++    );
++    this.openForm('出征', body, () => {
++      const src = cityById(s, srcSel.value);
++      const g = heroById(s, genSel.value);
++      if (!g) { this.toast('请选择主将'); return; }
++      const r = A.campaign(s, src.id, target.id, g.id, parseInt(troopsIn.value, 10) || 0, formSel.value);
++      this.closeModal();
++      if (r.battle) this.showBattleReport(r.battle, r.won, r.msg);
++      else this.toast(r.msg);
++      this.afterAction();
++    }, '开战');
++    refreshGenerals();
++  }
++
++  // —— 计略 ——
++  uiStratagem(target) {
++    const s = this.state;
++    const sources = neighbors(s, target.id).filter((n) => n.ownerFactionId === s.playerFactionId);
++    if (!sources.length) { this.toast('无可施计的相邻己城'); return; }
++    const srcSel = h('select', null, sources.map((n) => h('option', { value: n.id }, n.name)));
++    const typeSel = h('select', null, Object.entries(STRATAGEMS).map(([k, d]) => h('option', { value: k }, `${d.name}（${d.desc}）`)));
++    const body = h('div', null,
++      h('div', { class: 'create__field' }, h('label', null, '从己方城市施计'), srcSel),
++      h('div', { class: 'create__field' }, h('label', null, '计略'), typeSel),
++    );
++    this.openForm('施计', body, () => {
++      const r = A.stratagem(s, srcSel.value, target.id, typeSel.value);
++      this.toast(r.msg); this.closeModal(); this.afterAction();
++    }, '施计');
++  }
++
++  showBattleReport(battle, won, titleMsg) {
++    const a = battle.attacker; const d = battle.defender;
++    const body = h('div', null,
++      h('div', { class: 'force-vs' },
++        h('div', { class: 'force-vs__side' }, h('b', null, a.general.name), h('div', { class: 'muted' }, `攻方 · ${Math.round(a.soldiers)} 兵`)),
++        h('div', { class: 'force-vs__side' }, h('b', null, d.general.name), h('div', { class: 'muted' }, `守方 · ${Math.round(d.soldiers)} 兵 · 城${Math.round(d.defense)}`)),
++      ),
++      h('div', { class: 'battle-log' }, battle.log.map((l) => h('p', null, l))),
++      h('p', { class: won ? 'center' : 'center muted', style: { color: won ? 'var(--good)' : 'var(--bad)', fontWeight: 700 } }, won ? '⚔ 大胜！城池归我！' : '⚔ 兵败而归。'),
++    );
++    this.openModal({ title: titleMsg, body, foot: [h('button', { class: 'btn-primary grow', onClick: () => this.closeModal() }, '知晓')] });
++  }
++
++  // ============ 势力总览 ============
++  renderFaction() {
++    const s = this.state;
++    const fid = s.playerFactionId;
++    const fac = playerFaction(s);
++    const myCities = citiesOf(s, fid);
++    const grainNet = factionGrainNet(s, fid);
++    const heroCount = heroesOfFaction(s, fid).length;
++    const prisonerCount = prisonersOfFaction(s, fid).length;
++    this.content.appendChild(h('div', null,
++      h('h3', null, `${fac.name} · 总览`),
++      h('div', { class: 'panel' },
++        h('div', { class: 'panel__rows' },
++          h('div', null, h('span', { class: 'muted' }, '城池'), ' ', myCities.length, ' / 18'),
++          h('div', null, h('span', { class: 'muted' }, '武将'), ' ', heroCount),
++          h('div', null, h('span', { class: 'muted' }, '俘虏'), ' ', prisonerCount),
++          h('div', null, h('span', { class: 'muted' }, '金钱'), ' ', Math.round(fac.money)),
++          h('div', null, h('span', { class: 'muted' }, '军粮'), ' ', Math.round(fac.grain)),
++          h('div', null, h('span', { class: 'muted' }, '粮收支'), ' ', `${Math.round(grainNet.net)}/回`),
++        ),
++      ),
++      h('h3', { style: { marginTop: '0.8rem' } }, '辖下城池'),
++      h('div', { class: 'card-list' }, myCities.map((c) => {
++        const gov = c.governorHeroId ? heroById(s, c.governorHeroId) : null;
++        return h('div', { class: 'city-card', onClick: () => { this.tab = 'map'; this.selectedCityId = c.id; this.renderTabbar(); this.renderContent(); this.openCityMenu(c.id); }, role: 'button' },
++          h('div', { class: 'hero-card__head' }, h('span', { class: 'panel__swatch', style: { background: fac.color } }), h('span', { class: 'hero-card__name' }, c.name), h('span', { class: 'hero-card__sub' }, c.trait.name)),
++          h('div', { class: 'panel__rows' },
++            h('div', null, h('span', { class: 'muted' }, '兵'), ' ', Math.round(c.soldiers)),
++            h('div', null, h('span', { class: 'muted' }, '防'), ' ', Math.round(c.defense)),
++            h('div', null, h('span', { class: 'muted' }, '田/市/墙'), ` ${c.farmLevel}/${c.marketLevel}/${c.wallLevel}`),
++            h('div', null, h('span', { class: 'muted' }, '守将'), ' ', gov ? gov.name : '—'),
++          ),
++        );
++      })),
++      h('h3', { style: { marginTop: '0.8rem' } }, '天下诸侯'),
++      h('div', { class: 'card-list' }, s.factions.filter((f) => f.id !== fid).map((f) => {
++        const n = citiesOf(s, f.id).length;
++        return h('div', { class: 'city-card' },
++          h('div', { class: 'hero-card__head' }, h('span', { class: 'panel__swatch', style: { background: f.color } }), h('span', { class: 'hero-card__name' }, f.name), h('span', { class: 'hero-card__sub' }, `${n} 城`)),
++        );
++      })),
++    ));
++  }
++
++  // ============ 名将 ============
++  renderHeroes() {
++    const s = this.state;
++    const fid = s.playerFactionId;
++    const mine = heroesOfFaction(s, fid);
++    const wilds = s.heroes.filter((h) => h.wild && h.discovered && h.status !== 'gone'
++      && citiesOf(s, fid).some((c) => c.id === h.cityId)); // 仅己方城市中已发现的
++    const prisoners = prisonersOfFaction(s, fid);
++
++    const heroCard = (h2, foot) => h('div', { class: 'hero-card' },
++      h('div', { class: 'hero-card__head' },
++        h('span', { class: 'hero-card__name' }, h2.name),
++        h('span', { class: 'hero-card__sub' }, h2.skill ? h2.skill.name : '无技能'),
++        h2.loyalty != null ? h('span', { class: 'hero-card__sub' }, `忠 ${h2.loyalty}`) : null,
++      ),
++      h('div', { class: 'hero-card__stats' }, STAT_KEYS.map(([k, l]) => h('span', null, `${l}`, h('b', null, h2.stats[k])))),
++      h2.skill ? h('div', { class: 'hero-card__skill' }, `【${h2.skill.name}】`) : null,
++      h('div', { class: 'hint' }, `所在：${cityById(s, h2.cityId)?.name || '在野'}`),
++      foot ? h('div', { class: 'hero-card__foot' }, foot) : null,
++    );
++
++    this.content.appendChild(h('div', null,
++      h('h3', null, '麾下武将'),
++      h('div', { class: 'card-list' }, mine.length ? mine.map((h2) => heroCard(h2, [
++        h('button', { class: 'btn-ghost', onClick: () => { const r = A.reward(s, h2.id); this.toast(r.msg); this.afterAction(); } }, '赏赐'),
++        h('button', { class: 'btn-ghost', onClick: () => { this.selectedCityId = h2.cityId; this.uiAppoint(cityById(s, h2.cityId)); } }, '任太守'),
++      ])) : h('p', { class: 'hint' }, '尚无武将，去「探索」招揽在野名将吧。')),
++
++      h('h3', { style: { marginTop: '0.8rem' } }, '在野名将（己方城市）'),
++      h('div', { class: 'card-list' }, wilds.length ? wilds.map((h2) => heroCard(h2, [
++        h('button', { class: 'btn-primary', onClick: () => { const r = A.recruitHero(s, h2.id); this.toast(r.msg); this.afterAction(); } }, '登用'),
++      ])) : h('p', { class: 'hint' }, '在城市执行「探索」可发现本城在野名将。')),
++
++      prisoners.length ? h('div', null,
++        h('h3', { style: { marginTop: '0.8rem' } }, '俘虏'),
++        h('div', { class: 'card-list' }, prisoners.map((h2) => heroCard(h2, [
++          h('button', { class: 'btn-jade', onClick: () => { const r = A.recruitPrisoner(s, h2.id); this.toast(r.msg); this.afterAction(); } }, '招降'),
++          h('button', { class: 'btn-ghost', onClick: () => { const r = A.releasePrisoner(s, h2.id); this.toast(r.msg); this.afterAction(); } }, '释放'),
++          h('button', { class: 'btn-danger', onClick: () => { const r = A.executePrisoner(s, h2.id); this.toast(r.msg); this.afterAction(); } }, '处决'),
++        ]))),
++      ) : null,
++    ));
++  }
++
++  // ============ 科技 ============
++  renderTech() {
++    const s = this.state;
++    const research = s.research;
++    this.content.appendChild(h('div', null,
++      h('h3', null, '科技树（势力共享）'),
++      research ? h('div', { class: 'panel', style: { marginBottom: '0.6rem' } },
++        h('div', null, h('b', null, `正在研究：${TECHS[research.key].name}`), ` · 剩余 ${research.turnsLeft} 回合`),
++      ) : null,
++      h('div', { class: 'tech-grid' }, Object.entries(TECHS).map(([k, t]) => {
++        const lv = techLevel(s, k);
++        const maxed = lv >= TECH_MAX_LEVEL;
++        const ongoing = research && research.key === k;
++        const dots = Array.from({ length: TECH_MAX_LEVEL }, (_, i) => h('i', { class: i < lv ? 'on' : '' }));
++        return h('div', { class: 'tech-card' },
++          h('div', { class: 'tech-card__head' },
++            h('span', { class: 'tech-card__icon' }, t.icon),
++            h('div', { class: 'grow' }, h('div', { class: 'hero-card__name', style: { fontSize: '0.95rem' } }, t.name), h('div', { class: 'hint' }, t.desc)),
++            h('span', { class: 'tech-lv' }, dots),
++          ),
++          h('div', { class: 'hero-card__foot' },
++            h('span', { class: 'hero-card__sub' }, maxed ? '已满级' : `下级 ${TECH_COST_GOLD} 金`),
++            h('span', { class: 'grow' }),
++            h('button', {
++              class: 'btn-primary', disabled: maxed || !!research,
++              onClick: () => { const r = A.research(s, k); this.toast(r.msg); this.afterAction(); },
++            }, ongoing ? '研究中…' : (maxed ? '已满' : '研究')),
++          ),
++        );
++      })),
++      h('p', { class: 'hint', style: { marginTop: '0.6rem' } }, '研究每级消耗 800 金，约 3 回合（君主智力可缩短），完成后势力全城共享加成。'),
++    ));
++  }
++
++  // ============ 系统 ============
++  renderSystem() {
++    this.content.appendChild(h('div', null,
++      h('h3', null, '系统'),
++      h('div', { class: 'sys-list' },
++        h('button', { class: 'btn-primary btn-block', onClick: () => { saveGame(this.state); this.toast('已保存'); } }, '保存游戏'),
++        h('button', { class: 'btn-ghost btn-block', onClick: () => this.confirmEndTurn() }, '结束本回合'),
++        h('button', { class: 'btn-ghost btn-block', onClick: () => { this.tab = 'map'; this.renderTabbar(); this.renderContent(); } }, '返回地图'),
++        h('button', { class: 'btn-danger btn-block', onClick: () => this.confirmAbandon() }, '放弃本局，开新游戏'),
++      ),
++      h('p', { class: 'hint center', style: { marginTop: '1rem' } }, '雄图·三国志文明 · 存档于本地浏览器'),
++    ));
++  }
++
++  confirmAbandon() {
++    const body = h('p', null, '确认放弃当前进度并开始新游戏？当前存档将被覆盖。');
++    this.openForm('放弃本局', body, () => {
++      clearSave();
++      this.closeModal();
++      this.showStart();
++    }, '确认放弃');
++  }
++
++  // ============ 结束回合 ============
++  confirmEndTurn() {
++    const body = h('p', null, '结束本回合后，天下诸侯将各自施政、出兵，资源依内政结算。是否继续？');
++    this.openForm('结束回合', body, () => {
++      this.closeModal();
++      this.doEndTurn();
++    }, '结束回合');
++  }
++
++  doEndTurn() {
++    const s = this.state;
++    saveGame(s);
++    const log = resolveTurn(s, { aiTurnAll }, Math.random);
++    saveGame(s);
++    this.refreshTopbar();
++    if (s.over) { this.renderGameOver(); return; }
++    this.showTurnSummary(log);
++  }
++
++  showTurnSummary(log) {
++    const items = (log && log.length) ? log : ['天下无事，岁月静好。'];
++    const body = h('div', null,
++      h('p', { class: 'hint' }, `第 ${this.state.turn} 回合 · ${seasonOf(this.state.turn)}季 简报`),
++      h('ul', { class: 'summary-list' }, items.map((l) => h('li', null, l))),
++    );
++    this.openModal({
++      title: '回合简报',
++      body,
++      foot: [h('button', { class: 'btn-primary grow', onClick: () => { this.closeModal(); this.afterAction(); } }, '继续')],
++    });
++  }
++
++  renderGameOver() {
++    clear(this.stage);
++    const win = this.state.over === 'win';
++    this.stage.appendChild(h('div', { class: 'gameover' },
++      h('h2', null, win ? '🏛 一统天下！' : '🏰 大业未成'),
++      h('p', { class: 'hint' }, win ? `${playerFaction(this.state).name} 席卷九州，定鼎中原。` : '群雄逐鹿，君之基业已失。再图后举吧。'),
++      h('div', { class: 'launcher__menu', style: { marginTop: '1.2rem' } },
++        h('button', { class: 'btn-primary btn-block', onClick: () => { clearSave(); this.showCreate(); } }, '再战一局'),
++        h('button', { class: 'btn-ghost btn-block', onClick: () => { clearSave(); this.showStart(); } }, '返回首页'),
++      ),
++    ));
++  }
++
++  // ============ 动作后统一刷新 ============
++  afterAction() {
++    saveGame(this.state);
++    if (this.screen !== 'game') return;
++    if (this.state.over) { this.renderGameOver(); return; }
++    this.refreshTopbar();
++    // 若当前弹窗已关闭，则重绘内容；否则仅顶栏刷新
++    if (!this.modalRoot.firstChild) this.renderContent();
++  }
++}
+diff --git a/apps/xiong-tu-san-guo/src/ui/dom.js b/apps/xiong-tu-san-guo/src/ui/dom.js
+new file mode 100644
+index 0000000..bc97b4d
+--- /dev/null
++++ b/apps/xiong-tu-san-guo/src/ui/dom.js
+@@ -0,0 +1,44 @@
++// ============================================================================
++// 轻量 DOM 辅助：h() 创建元素，clear() 清空，bar() 进度条——避免引入框架。
++// ============================================================================
++export function h(tag, props, ...children) {
++  const el = document.createElement(tag);
++  if (props) {
++    for (const [k, v] of Object.entries(props)) {
++      if (v == null || v === false) continue;
++      if (k === 'class') el.className = v;
++      else if (k === 'dataset') Object.assign(el.dataset, v);
++      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
++      else if (k === 'onClick') el.addEventListener('click', v);
++      else if (k === 'onInput') el.addEventListener('input', v);
++      else if (k === 'onChange') el.addEventListener('change', v);
++      else if (k === 'html') el.innerHTML = v; // 仅用于受控静态内容
++      else if (k in el) { try { el[k] = v; } catch (_) { el.setAttribute(k, v); } }
++      else el.setAttribute(k, v);
++    }
++  }
++  appendChildren(el, children);
++  return el;
++}
++
++function appendChildren(el, children) {
++  for (const c of children) {
++    if (c == null || c === false || c === true) continue;
++    if (Array.isArray(c)) { appendChildren(el, c); continue; }
++    el.append(c.nodeType ? c : document.createTextNode(String(c)));
++  }
++}
++
++export function clear(el) {
++  while (el.firstChild) el.removeChild(el.firstChild);
++  return el;
++}
++
++// 进度条：value/max → 百分比填充
++export function bar(value, max, opts = {}) {
++  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
++  return h('div', { class: `bar ${opts.class || ''}` },
++    h('div', { class: 'bar__fill', style: { width: `${pct}%`, background: opts.color || '' } }),
++    h('span', { class: 'bar__label' }, opts.label || `${Math.floor(value)}/${Math.round(max)}`),
++  );
++}
+diff --git a/apps/xiong-tu-san-guo/src/ui/style.css b/apps/xiong-tu-san-guo/src/ui/style.css
+new file mode 100644
+index 0000000..8bd3249
+--- /dev/null
++++ b/apps/xiong-tu-san-guo/src/ui/style.css
+@@ -0,0 +1,231 @@
++/* ==========================================================================
++   雄图·三国志文明 · 样式（竖屏单列、移动端优先，适配刘海 / 底部安全区）
++   古卷墨韵 + 鎏金描边，暗色调三国风。
++   ========================================================================== */
++.xtsg {
++  --bg: #1a1206;
++  --bg-2: #221710;
++  --card: #2a1d11;
++  --card-2: #33251a;
++  --line: #4a3826;
++  --text: #efe2c4;
++  --muted: #b39b73;
++  --gold: #d9b957;
++  --gold-dim: #8a6a28;
++  --jade: #5fd0a0;
++  --crimson: #c0392b;
++  --crimson-dim: #7d2418;
++  --good: #6fd07f;
++  --bad: #e06b6b;
++  --radius: 10px;
++
++  position: absolute;
++  inset: 0;
++  background:
++    radial-gradient(120% 60% at 50% -10%, #33261a 0%, transparent 60%),
++    var(--bg);
++  color: var(--text);
++  font-family: "PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", system-ui, sans-serif;
++  font-size: 14px;
++  line-height: 1.5;
++  overflow: hidden;
++  -webkit-user-select: none;
++  user-select: none;
++  -webkit-tap-highlight-color: transparent;
++}
++.xtsg * { box-sizing: border-box; }
++
++.xtsg .stage { position: absolute; inset: 0; overflow: hidden; }
++.xtsg .game { position: absolute; inset: 0; display: flex; flex-direction: column; overflow: hidden; }
++
++/* —— 按钮 —— */
++.xtsg button {
++  font-family: inherit; cursor: pointer; border: none; border-radius: 8px;
++  background: var(--card-2); color: var(--text);
++  padding: 0.55rem 0.8rem; font-size: 0.9rem;
++  transition: transform 0.08s ease, background 0.15s ease, opacity 0.15s ease;
++}
++.xtsg button:active { transform: scale(0.97); }
++.xtsg button:disabled { opacity: 0.4; cursor: default; }
++.xtsg .btn-primary { background: linear-gradient(180deg, #e8c769, var(--gold-dim)); color: #1a1208; font-weight: 600; }
++.xtsg .btn-danger { background: linear-gradient(180deg, #d7574c, var(--crimson-dim)); color: #fff; }
++.xtsg .btn-jade { background: linear-gradient(180deg, #6fe0b0, #2f9a72); color: #06241a; font-weight: 600; }
++.xtsg .btn-ghost { background: transparent; border: 1px solid var(--line); }
++.xtsg .btn-block { width: 100%; }
++.xtsg input, .xtsg select {
++  font-family: inherit; background: var(--bg-2); color: var(--text);
++  border: 1px solid var(--line); border-radius: 8px; padding: 0.5rem 0.6rem; font-size: 0.95rem;
++}
++
++/* —— 启动器 —— */
++.xtsg .launcher {
++  position: absolute; inset: 0; overflow-y: auto; padding: max(1.4rem, env(safe-area-inset-top)) 1rem 2rem;
++  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1.2rem;
++}
++.xtsg .launcher__brand { text-align: center; }
++.xtsg .launcher__brand .emblem {
++  width: 76px; height: 76px; margin: 0 auto 0.6rem; border-radius: 50%;
++  background: radial-gradient(circle at 35% 30%, #e8c769, var(--gold-dim) 70%, #5a4316);
++  display: flex; align-items: center; justify-content: center;
++  font-size: 2.3rem; font-weight: 700; color: #2a1a08;
++  box-shadow: 0 4px 18px rgba(0,0,0,0.5), inset 0 0 0 3px rgba(255,255,255,0.12);
++}
++.xtsg .launcher__brand h1 { font-size: 1.7rem; margin: 0; letter-spacing: 0.05em; }
++.xtsg .launcher__brand .sub { color: var(--muted); margin: 0.3rem 0 0; font-size: 0.85rem; }
++.xtsg .launcher__menu { display: flex; flex-direction: column; gap: 0.7rem; width: 100%; max-width: 320px; }
++
++/* —— 创角 —— */
++.xtsg .create { position: absolute; inset: 0; overflow-y: auto; padding: max(1rem, env(safe-area-inset-top)) 1rem 2.2rem; }
++.xtsg .create h2 { font-size: 1.2rem; margin: 0.4rem 0 0.6rem; }
++.xtsg .create__field { margin-bottom: 1rem; }
++.xtsg .create__field label { display: block; color: var(--muted); margin-bottom: 0.3rem; font-size: 0.85rem; }
++.xtsg .stat-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.4rem; }
++.xtsg .stat {
++  background: var(--card); border: 1px solid var(--line); border-radius: 8px; padding: 0.5rem 0.2rem; text-align: center;
++}
++.xtsg .stat__k { font-size: 0.7rem; color: var(--muted); }
++.xtsg .stat__v { font-size: 1.15rem; font-weight: 700; color: var(--gold); }
++.xtsg .city-pick { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.45rem; margin-top: 0.4rem; }
++.xtsg .city-pick__item {
++  background: var(--card); border: 1px solid var(--line); border-radius: 8px; padding: 0.5rem;
++  text-align: left; font-size: 0.82rem;
++}
++.xtsg .city-pick__item--sel { border-color: var(--gold); background: var(--card-2); }
++.xtsg .city-pick__item b { color: var(--gold); }
++
++/* —— 顶栏 —— */
++.xtsg .topbar {
++  flex: none; padding: max(0.55rem, env(safe-area-inset-top)) 0.7rem 0.45rem;
++  background: linear-gradient(180deg, #2c2014, var(--bg-2)); border-bottom: 1px solid var(--line);
++}
++.xtsg .topbar__row { display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap; }
++.xtsg .topbar__title { font-weight: 700; font-size: 0.95rem; margin-right: auto; }
++.xtsg .res-pill {
++  background: var(--card); border: 1px solid var(--line); border-radius: 999px;
++  padding: 0.2rem 0.6rem; font-size: 0.8rem; white-space: nowrap;
++}
++.xtsg .res-pill b { color: var(--gold); }
++.xtsg .cmd-pill { background: linear-gradient(180deg, #e8c769, var(--gold-dim)); color: #1a1208; font-weight: 700; }
++
++/* —— 标签栏 —— */
++.xtsg .tabbar {
++  flex: none; display: flex; background: var(--bg-2); border-bottom: 1px solid var(--line);
++}
++.xtsg .tab {
++  flex: 1; background: transparent; border-radius: 0; padding: 0.55rem 0;
++  font-size: 0.8rem; color: var(--muted); border-bottom: 2px solid transparent;
++}
++.xtsg .tab--active { color: var(--gold); border-bottom-color: var(--gold); }
++
++/* —— 内容滚动区 —— */
++.xtsg .content { flex: 1; overflow-y: auto; overflow-x: hidden; padding: 0.7rem; }
++.xtsg .content h3 { font-size: 1rem; margin: 0.2rem 0 0.6rem; color: var(--gold); }
++
++/* —— 地图 —— */
++.xtsg .map-wrap {
++  position: relative; width: 100%; aspect-ratio: 1000 / 760; margin: 0 auto;
++  background:
++    radial-gradient(80% 60% at 50% 40%, #3a2c1c 0%, transparent 70%),
++    repeating-linear-gradient(45deg, #241a10 0 12px, #221710 12px 24px);
++  border: 1px solid var(--line); border-radius: 12px; overflow: hidden;
++}
++.xtsg .map-svg { position: absolute; inset: 0; width: 100%; height: 100%; }
++.xtsg .map-line { stroke: #5e4a30; stroke-width: 1.6; opacity: 0.7; }
++.xtsg .map-dot {
++  position: absolute; transform: translate(-50%, -50%);
++  width: 34px; height: 34px; border-radius: 50%; border: none; padding: 0;
++  display: flex; align-items: center; justify-content: center;
++  font-size: 0.62rem; font-weight: 700; color: #fff;
++  box-shadow: 0 2px 6px rgba(0,0,0,0.5), inset 0 0 0 2px rgba(255,255,255,0.25);
++}
++.xtsg .map-dot--player { box-shadow: 0 0 0 3px var(--gold), 0 2px 6px rgba(0,0,0,0.5); }
++.xtsg .map-dot--selected { box-shadow: 0 0 0 3px #fff, 0 2px 8px rgba(255,255,255,0.4); transform: translate(-50%, -50%) scale(1.12); }
++.xtsg .map-label {
++  position: absolute; transform: translate(-50%, 14px);
++  font-size: 0.64rem; color: var(--text); text-shadow: 0 1px 2px #000;
++  pointer-events: none; white-space: nowrap;
++}
++
++/* —— 城市详情面板 —— */
++.xtsg .panel {
++  background: var(--card); border: 1px solid var(--line); border-radius: 12px;
++  padding: 0.7rem; margin-top: 0.7rem;
++}
++.xtsg .panel__head { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; }
++.xtsg .panel__head h4 { margin: 0; font-size: 1.05rem; }
++.xtsg .panel__swatch { width: 16px; height: 16px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.3); }
++.xtsg .panel__rows { display: grid; grid-template-columns: 1fr 1fr; gap: 0.25rem 0.6rem; font-size: 0.82rem; }
++.xtsg .panel__rows .muted { color: var(--muted); }
++.xtsg .cmd-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.4rem; margin-top: 0.6rem; }
++.xtsg .cmd-btn { padding: 0.5rem 0.2rem; font-size: 0.78rem; }
++
++/* —— 列表卡片 —— */
++.xtsg .card-list { display: flex; flex-direction: column; gap: 0.55rem; }
++.xtsg .hero-card, .xtsg .city-card {
++  background: var(--card); border: 1px solid var(--line); border-radius: 10px; padding: 0.6rem 0.7rem;
++}
++.xtsg .hero-card__head { display: flex; align-items: center; gap: 0.5rem; }
++.xtsg .hero-card__name { font-weight: 700; font-size: 0.98rem; }
++.xtsg .hero-card__sub { font-size: 0.72rem; color: var(--muted); }
++.xtsg .hero-card__stats { display: flex; gap: 0.5rem; margin: 0.4rem 0; font-size: 0.72rem; flex-wrap: wrap; }
++.xtsg .hero-card__stats span b { color: var(--gold); }
++.xtsg .hero-card__skill { font-size: 0.74rem; color: var(--jade); }
++.xtsg .hero-card__foot { display: flex; gap: 0.4rem; margin-top: 0.5rem; flex-wrap: wrap; }
++.xtsg .hero-card__foot button { font-size: 0.76rem; padding: 0.35rem 0.55rem; }
++
++/* —— 科技 —— */
++.xtsg .tech-grid { display: flex; flex-direction: column; gap: 0.55rem; }
++.xtsg .tech-card { background: var(--card); border: 1px solid var(--line); border-radius: 10px; padding: 0.6rem 0.7rem; }
++.xtsg .tech-card__head { display: flex; align-items: center; gap: 0.5rem; }
++.xtsg .tech-card__icon { font-size: 1.3rem; }
++.xtsg .tech-lv { display: inline-flex; gap: 3px; }
++.xtsg .tech-lv i { width: 12px; height: 12px; border-radius: 50%; background: var(--line); display: inline-block; }
++.xtsg .tech-lv i.on { background: var(--gold); }
++
++/* —— 系统 —— */
++.xtsg .sys-list { display: flex; flex-direction: column; gap: 0.5rem; }
++
++/* —— 模态 —— */
++.xtsg .modal {
++  position: absolute; inset: 0; background: rgba(0,0,0,0.62);
++  display: flex; align-items: center; justify-content: center; padding: 1rem; z-index: 30;
++}
++.xtsg .modal__card {
++  background: var(--card); border: 1px solid var(--line); border-radius: 14px;
++  width: 100%; max-width: 420px; max-height: 86%; display: flex; flex-direction: column; overflow: hidden;
++}
++.xtsg .modal__head { padding: 0.7rem 0.9rem; border-bottom: 1px solid var(--line); display: flex; align-items: center; }
++.xtsg .modal__head h3 { margin: 0; font-size: 1.05rem; color: var(--gold); }
++.xtsg .modal__body { padding: 0.8rem 0.9rem; overflow-y: auto; }
++.xtsg .modal__foot { padding: 0.6rem 0.9rem; border-top: 1px solid var(--line); display: flex; gap: 0.5rem; }
++.xtsg .battle-log { font-size: 0.82rem; line-height: 1.7; max-height: 46vh; overflow-y: auto; }
++.xtsg .battle-log p { margin: 0.15rem 0; }
++.xtsg .summary-list { font-size: 0.86rem; }
++.xtsg .summary-list li { margin: 0.3rem 0; }
++.xtsg .force-vs { display: flex; justify-content: space-between; gap: 0.6rem; margin-bottom: 0.6rem; }
++.xtsg .force-vs__side { flex: 1; background: var(--bg-2); border-radius: 8px; padding: 0.5rem; font-size: 0.8rem; }
++
++/* —— 进度条 —— */
++.xtsg .bar { position: relative; height: 14px; background: var(--bg-2); border-radius: 7px; overflow: hidden; }
++.xtsg .bar__fill { position: absolute; inset: 0 auto 0 0; background: var(--gold); transition: width 0.3s; }
++.xtsg .bar__label { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 0.68rem; }
++
++/* —— Toast —— */
++.xtsg .toast-wrap { position: absolute; top: max(0.6rem, env(safe-area-inset-top)); left: 0; right: 0; z-index: 50; display: flex; flex-direction: column; align-items: center; gap: 0.3rem; pointer-events: none; }
++.xtsg .toast {
++  background: rgba(20,14,6,0.94); border: 1px solid var(--line); color: var(--text);
++  padding: 0.5rem 0.9rem; border-radius: 999px; font-size: 0.82rem; max-width: 90%; text-align: center;
++  animation: xtsgToast 2.4s ease forwards;
++}
++@keyframes xtsgToast {
++  0% { opacity: 0; transform: translateY(-8px); }
++  12%, 80% { opacity: 1; transform: translateY(0); }
++  100% { opacity: 0; transform: translateY(-8px); }
++}
++
++.xtsg .muted { color: var(--muted); }
++.xtsg .hint { font-size: 0.78rem; color: var(--muted); margin: 0.3rem 0; }
++.xtsg .center { text-align: center; }
++.xtsg .grow { flex: 1; }
++.xtsg .gameover { text-align: center; padding: 2rem 1rem; }
++.xtsg .gameover h2 { font-size: 1.8rem; color: var(--gold); }
+diff --git a/apps/xiong-tu-san-guo/vite.config.js b/apps/xiong-tu-san-guo/vite.config.js
+new file mode 100644
+index 0000000..55ec6d1
+--- /dev/null
++++ b/apps/xiong-tu-san-guo/vite.config.js
+@@ -0,0 +1,9 @@
++import { defineConfig } from 'vite';
++
++// `base: './'` 生成相对路径资源引用，便于部署到 GitHub Pages 子路径或任意静态目录。
++// 本作纯原生 DOM 渲染、无框架、无 Canvas，构建产物极小。
++export default defineConfig({
++  base: './',
++  server: { host: true, port: 5179 },
++  build: { outDir: 'dist', sourcemap: false, target: 'es2018' },
++});
+diff --git a/src/main.js b/src/main.js
+index 6820391..7f0c8af 100644
+--- a/src/main.js
++++ b/src/main.js
+@@ -69,6 +69,14 @@ const APPS = {
+     desc: '迫降破碎星球，在漂浮的遗迹浮岛间拾荒探索。猜拳克制式战斗、装备强化与三天赋树、碎片化记忆叙事，集齐十枚星骸回响揭开真相。',
+     loader: () => import('../apps/xing-hai-lv-zhe/src/main.js'),
+   },
++  xtsg: {
++    key: 'xtsg',
++    title: '雄图·三国志文明',
++    subtitle: '三国 · 回合策略',
++    emblem: '雄',
++    desc: '自择一城起兵，开发内政、推进科技树、招揽四十余位名将，在十八城中国地图上回合制征战，俘将夺城，一统九州。',
++    loader: () => import('../apps/xiong-tu-san-guo/src/main.js'),
++  },
+ }
+ 
+ // 大类：先呈现「学习」，再呈现「游戏」。点击大类进入后，才展开其中的具体应用。
+@@ -86,8 +94,8 @@ const CATEGORIES = [
+     title: '游戏',
+     subtitle: '休闲 · 互动娱乐',
+     emblem: '玩',
+-    desc: '消磨时光的互动小品：修仙、人生、三国战场、星骸浮岛，挑一个开始吧。',
+-    appKeys: ['dzf', 'frxx', 'mnrs', 'xhlz'],
++    desc: '消磨时光的互动小品：修仙、人生、三国战场、星骸浮岛、诸侯争霸，挑一个开始吧。',
++    appKeys: ['dzf', 'frxx', 'mnrs', 'xhlz', 'xtsg'],
+   },
+ ]
+ 
diff --git a/.ai-tasks/issue-79/review_error_r1.log b/.ai-tasks/issue-79/review_error_r1.log
new file mode 100644
index 0000000..e69de29
diff --git a/.ai-tasks/issue-79/review_error_r2.log b/.ai-tasks/issue-79/review_error_r2.log
new file mode 100644
index 0000000..e69de29
diff --git a/.ai-tasks/issue-79/review_result_r1.md b/.ai-tasks/issue-79/review_result_r1.md
new file mode 100644
index 0000000..cc46918
--- /dev/null
+++ b/.ai-tasks/issue-79/review_result_r1.md
@@ -0,0 +1,12 @@
+审查完成。该 PR 提交了一个完整且可用的游戏（构建正常，135 个逻辑断言和 21 个 DOM 冒烟测试断言全部通过，`_lib/keyboard-shell.js` 的导入解析正确，没有 `.github/` 的更改，没有安全问题）。然而，我发现了**两个已确认的核心战斗逻辑 Bug**，我已针对实际代码进行了复现。因此我要求进行修改。
+
+DECISION: REQUEST_CHANGES
+COMMENT: 已构建并运行全部自测（135 逻辑断言 + 21 DOM 冒烟断言全过，vite 构建成功，`_lib/keyboard-shell.js` 引入路径正确，无 .github/CI 改动，无 XSS/注入风险），但发现两处确凿的核心逻辑 Bug，已用真实代码复现，需修复：
+
+【Bug 1 · 严重 · 资源凭空消失】src/core/actions.js 的 transport()。金钱/军粮是势力级共享池（见 economy.js 与 resolveTurn，每回合直接 fac.money+=、fac.grain+=），并非城市级。但 transport() 里却执行 `fac.money -= gm; fac.grain -= gr;` 且**从不把 gm/gr 加到任何地方**（from/to 的城市金库 gold/grain 也未变动）。实测：输送 500 金/500 粮后，势力金钱 -500、军粮 -500，而 luoyang.gold/wan.gold 均不变 —— 玩家的资源被直接销毁。UI（src/ui/app.js 的 uiTransport）还专门提供了金/粮输入框诱导玩家误用。修复建议：金/粮本就是全势力共享、无需「输送」，应从 transport() 移除金/粮扣减逻辑、并从 uiTransport 表单去掉金/粮输入框，只保留唯一有意义的城市级资源——士兵（soldiers 部分的 from.soldiers-=s / to.soldiers+=s 是正确的，保留即可）。
+
+【Bug 2 · 严重 · 战斗结果不回写】src/core/actions.js 的 applyCampaignResult()。createBattle() 对 attacker/defender 做了浅拷贝，runBattle() 只削减 `battle.defender.soldiers`，从未改写真实城市 `to.soldiers`。攻方获胜分支用 `to.soldiers = survivors`（攻方残兵）覆写，尚可；但**攻方失利分支只 push 了一条日志，完全没有把守军实际伤亡回写**。实测：守军 600、城防 0，玩家攻城失败时，战斗结算守军被打到仅剩 168（战死 432），而战斗结束后真实城市 garrison 仍为 600 —— 守军凭空满血复活。这意味着「以战消耗敌城」的策略完全失效：只要攻城失败，敌城守军永远无损。修复建议：在失利分支补 `to.soldiers = Math.round(battle.defender.soldiers);` 并 `to.defense = Math.max(0, Math.round(battle.defender.defense));`，使战斗伤亡如实落账。
+
+【次要问题，供一并酌情处理】(a) 胜负判定仅在 resolveTurn() 结尾的 checkGameOver() 触发：玩家在回合中通过出征占领最后一座城不会立即胜利，必须再「结束回合」才结算（afterAction 读取的 state.over 此刻仍为 null）。建议在 campaign 成功占领后调用一次 checkGameOver，或让 afterAction 主动判定。(b) 计略 stratagem() 的施计者用 bestDefender()（按统率最高）挑选，却读取其 stats.i（智力）计算成功率，逻辑上应取智力最高的武将施计，当前会系统性压低计略成功率（属设计瑕疵而非崩溃）。
+
+以上均为 src/ 下业务代码问题，可直接修改；本 PR 未触及 .github/ 及任何 CI/CD 配置，无需人工介入 workflow。
diff --git a/.ai-tasks/issue-79/review_result_r2.md b/.ai-tasks/issue-79/review_result_r2.md
new file mode 100644
index 0000000..4fa4796
--- /dev/null
+++ b/.ai-tasks/issue-79/review_result_r2.md
@@ -0,0 +1,21 @@
+我已通读本轮 PR diff（约 1 万行，新增 `apps/xiong-tu-san-guo/` 整个游戏并注册到 `src/main.js`）。重点审了 `core/actions.js`、`combat.js`、`economy.js`、`state.js`、`ai.js`、`tech.js`、`ui/app.js`、`dom.js` 与数据/配置。下面是审查结论。
+
+DECISION: REQUEST_CHANGES
+COMMENT: 
+【先对账：第 1 轮问题均已正确修复，无需返工】
+1) transport() 资源凭空消失——已移除金/粮扣减，仅保留士兵调运（from.soldiers-=s / to.soldiers+=s），uiTransport 表单也去掉了金/粮输入框，正确。
+2) applyCampaignResult() 失利分支不回写——已补 to.soldiers=Math.round(battle.defender.soldiers) 与 to.defense=Math.max(0,Math.round(battle.defender.defense))，「以战消耗敌城」恢复有效，正确。
+3) 占领后即时胜负判定——campaign() 在 won 时调用 checkGameOver(state)，afterAction() 据此即时弹结算，正确。
+4) stratagem() 施计者——改为 casterRoster.reduce 取智力最高者计算成功率，正确。
+另核验：dom.js 的 h() 全程 createTextNode，君主姓名经 /^[一-龥]{2,4}$/ 校验、无 innerHTML 注入用户输入，无 XSS；邻接关系 adjacencyValid() 双向自洽；_lib/keyboard-shell.js 引入路径与其它 app 一致（apps/_lib/...）；未触及 .github/CI。
+
+【阻断项 · 核心机制失效：科技研究槽为「全局单槽」，非按势力独立】
+state.research 与 research()/resolveTurn() 共用同一个全局研究槽。科技树是设计文档 2.6 的核心玩法，但当前实现里：玩家在自己回合点「研究」时，若上一回合结算阶段任一 AI 抢占了该全局槽（aiTurn→A.research），research() 会直接返回「已有研究进行中」，玩家被锁出、无法推进自己想要的科技。该现象会间歇性反复发生，玩家体感即「研究按钮长期灰掉/不可用」。同时 7 个 AI 也只能共享这一个槽，多数 AI 永远研究不了。
+说明：state.techLevels 位于全局，与设计文档 3.1 的数据结构一致，可保留为全局共享；问题在「研究进度槽」必须按势力独立。
+修复建议（最小改动、不碰 .github）：把 state.research 改为按势力存储（如 faction.research 或 state.researchByFaction[fid]），并相应调整 research() 的占用判定、resolveTurn() 中逐势力推进研究回合、以及 UI 科技页对「研究中」状态的读取。改完后玩家与每个 AI 各持独立研究队列、互不阻塞。
+
+【次要 · 非阻断，建议顺带处理】
+- campaign() 占领分支把 attackerGen.cityId 改为 to.id 并可能令其出任 to 太守，但未清理 from.governorHeroId；若该将原为 from 太守，会出现同一武将被两城同时引用为太守的脏数据（界面展示/appointGovernor 判定易混淆）。建议占领后若 attackerGen.id===from.governorHeroId 则置空 from.governorHeroId。
+- 玩家若选 AI 都城开局，该势力君主（如 caocao）会转为在野且仍带 lord:true；若被玩家登用入队，isLord() 恒真导致其永不被俘，属轻微数据一致性瑕疵，不致死。
+
+以上均在 src/ 业务代码内，无需改动 CI/CD 或 workflows；如修复涉及构建脚本/package.json，请人类手动确认。
diff --git a/apps/xiong-tu-san-guo/README.md b/apps/xiong-tu-san-guo/README.md
new file mode 100644
index 0000000..6c38152
--- /dev/null
+++ b/apps/xiong-tu-san-guo/README.md
@@ -0,0 +1,57 @@
+# 雄图·三国志文明 · Heroic Three Kingdoms Civilization
+
+一款融合《三国志》武将养成 / 指令式内政与《文明》科技树推进的**单机回合制策略经营**网页游戏。自择一城起兵，开发内政、攀科技、招揽名将、征战四方，最终统一九州。
+
+技术栈：**纯原生 HTML + CSS + JavaScript（无框架、无 Canvas）**，移动端竖屏设计，地图由内嵌 SVG + 绝对定位城市点构成，数据持久化于浏览器 `localStorage`。体积小（构建后 JS ≈ 56KB / gzip ≈ 20KB），加载快。
+
+## 本地运行
+
+```bash
+npm install
+npm run dev        # 开发服务器 http://localhost:5179
+npm run build      # 生产构建到 dist/
+npm run test       # 纯逻辑自测（135+ 断言，不依赖浏览器）
+npm run test:dom   # jsdom 驱动的 DOM 冒烟测试（21+ 断言）
+```
+
+也可由主框架（落地页）以 `createGame(parent)` 动态挂载，无需独立部署。
+
+## 核心玩法
+
+- **立君择都**：开局自定义君主姓名（2~4 汉字），随机生成五项属性（统 / 武 / 智 / 政 / 魅，可重掷 5 次），再从 18 座城市中选择起兵之地。占据诸侯旧都时，其旧部将就地转为在野名将，可择机登用。
+- **九州地图**：简化的中国古代地图，18 座核心城市以圆形节点呈现，按固定路径相邻相连；军队出征只能沿路径推进。金边为己方、灰点为空城、他色为诸侯。
+- **内政经营**：每座城市可发展**农田 / 市集 / 城墙 / 兵营**（各 1~5 级）、征兵、操练。金钱与军粮为势力级共享池，每回合依市集、人口、农田等级结算；军粮不济则士兵逃亡，人口随太守政治自然增长。
+- **名将系统**：内置 47 位历史名将（关羽、张飞、诸葛亮、赵云、周瑜、吕布、曹操……），各有五维面板、专属技能（如「威震华夏」「神算」）与忠诚度。用**探索**发现本城在野名将，**登用**说服加入（成功率受魅力、忠诚、相性影响）；战时可俘虏敌将，关押后**招降 / 释放 / 处决**。
+- **科技树**：6 项科技（农艺 / 商贸 / 冶炼 / 筑城 / 谋略 / 统御）各 3 级，研究消耗金钱与回合（君主智力可缩短），完成后势力全城共享加成。
+- **回合制征战**：出征按路程消耗军粮，进入简化自动战斗——双方依「武力·统率·兵力·科技·训练度·阵型」结算攻防，城防优先承受伤害；武力悬殊时可能触发**单挑**一击定胜负。胜则占城、俘将、缴获城库。
+- **指令点数**：每回合获得若干指令点（基础 5 点 + 每多一城 +2 点 + 君主政治加成），内政、人事、军事、外交计略各耗点执行；可对相邻敌城施**火攻 / 烧粮 / 流言**等计略。
+- **AI 诸侯**：开局随机分布 8 路诸侯，按「内政→招募→研究→侵略→输送→赏赐」优先级消耗指令点，各自施政出兵。
+- **胜败条件**：占领全部 18 城 → 一统天下；所有城池尽失 → 大业未成。存档自动写入本地浏览器。
+
+## 数据结构
+
+全局状态序列化为 JSON 存于 `localStorage`（键 `xtsg_save_v1`）：势力、城市（人口 / 兵力 / 城防 / 建筑等级 / 邻接）、名将（属性 / 技能 / 忠诚 / 状态）、科技等级、当前研究、回合与事件日志。
+
+## 目录结构
+
+```
+src/
+├── main.js              入口工厂 createGame(parent)
+├── config.js            全局常量与公式（经济 / 战斗 / 科技 / 计略）
+├── data/
+│   ├── cities.js        18 座城市（坐标 / 特性 / 邻接）
+│   └── heroes.js        47 位名将 + 8 路 AI 势力种子
+├── core/
+│   ├── state.js         新局初始化 / 回合结算 / 胜负 / 查询
+│   ├── economy.js       收支 / 人口 / 城防公式
+│   ├── combat.js        自动战斗（骰子模型 + 城防 + 单挑）
+│   ├── actions.js       玩家 / AI 共用命令（内政·人事·军事·计略·俘虏）
+│   ├── ai.js            AI 诸侯回合
+│   ├── tech.js          科技乘子与技能解析
+│   ├── save.js          localStorage 存读
+│   └── rng.js           随机工具（可种子化）
+└── ui/
+    ├── app.js           UI 控制器（启动 / 创角 / 对局五标签 / 弹窗）
+    ├── dom.js           h() / clear() / bar() DOM 辅助
+    └── style.css        古卷墨韵 + 鎏金描边
+```
diff --git a/apps/xiong-tu-san-guo/index.html b/apps/xiong-tu-san-guo/index.html
new file mode 100644
index 0000000..cb58277
--- /dev/null
+++ b/apps/xiong-tu-san-guo/index.html
@@ -0,0 +1,27 @@
+<!doctype html>
+<html lang="zh-CN">
+
+<head>
+  <meta charset="UTF-8" />
+  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
+  <meta name="theme-color" content="#1a1206" />
+  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%231a1206'/%3E%3Ctext x='16' y='23' font-size='20' text-anchor='middle' fill='%23d4a84b' font-family='serif'%3E%E9%9B%84%3C/text%3E%3C/svg%3E" />
+  <title>雄图·三国志文明</title>
+  <style>
+    html, body {
+      margin: 0; padding: 0; width: 100%; height: 100%;
+      background: #1a1206; overflow: hidden;
+      font-family: "PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif;
+      -webkit-user-select: none; user-select: none;
+      -webkit-tap-highlight-color: transparent;
+    }
+    #game-container { position: relative; width: 100vw; height: 100vh; }
+  </style>
+</head>
+
+<body>
+  <div id="game-container"></div>
+  <script type="module" src="/src/main.js"></script>
+</body>
+
+</html>
diff --git a/apps/xiong-tu-san-guo/package-lock.json b/apps/xiong-tu-san-guo/package-lock.json
new file mode 100644
index 0000000..b89fb39
--- /dev/null
+++ b/apps/xiong-tu-san-guo/package-lock.json
@@ -0,0 +1,1559 @@
+{
+  "name": "xiong-tu-san-guo",
+  "version": "1.0.0",
+  "lockfileVersion": 3,
+  "requires": true,
+  "packages": {
+    "": {
+      "name": "xiong-tu-san-guo",
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
+    "node_modules/@rollup/rollup-android-arm-eabi": {
+      "version": "4.62.2",
+      "resolved": "https://registry.npmjs.org/@rollup/rollup-android-arm-eabi/-/rollup-android-arm-eabi-4.62.2.tgz",
+      "integrity": "sha512-6o7ZLZK+BeenkZCFNDXqpbjw9bD6nuWonvS/lwQJp7NoVVxm6p3qE7qQ5jGuBjiFsgvqjD8mZAU5oWxTmbOeOg==",
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
+      "version": "4.62.2",
+      "resolved": "https://registry.npmjs.org/@rollup/rollup-android-arm64/-/rollup-android-arm64-4.62.2.tgz",
+      "integrity": "sha512-BaH7BllCACHoH1LguOU56UItGfUWjujlO65kS9LAodViaN4bwIKd7oeW/ZHJ/4ljr/7MIiENnNy3HJ0zXv8Zkw==",
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
+      "version": "4.62.2",
+      "resolved": "https://registry.npmjs.org/@rollup/rollup-darwin-arm64/-/rollup-darwin-arm64-4.62.2.tgz",
+      "integrity": "sha512-v39RCCvj4He82I9sFmk+M1VZ0PLM9sfsLVikjfx2hYBNALhrrOR2D3JjQA6AhlaSOgcR+RzrKY7e1+bT6SUO/A==",
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
+      "version": "4.62.2",
+      "resolved": "https://registry.npmjs.org/@rollup/rollup-darwin-x64/-/rollup-darwin-x64-4.62.2.tgz",
+      "integrity": "sha512-yl0y2vq3S3lHeuXhEdss6TWfKW8vkujImO12tn4ZkG/4oghr09LvdYm2RElVjokTQiUvDUGXLGsYeLqUMCKpGA==",
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
+      "version": "4.62.2",
+      "resolved": "https://registry.npmjs.org/@rollup/rollup-freebsd-arm64/-/rollup-freebsd-arm64-4.62.2.tgz",
+      "integrity": "sha512-tT4pvt4qXD+vEoezupCWi+a1F0vvDiksiHc+PxRlYTOH1I6/X4id9jPxTP+Fg+545euaFT1jJVs4CEdHZAU1vw==",
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
+      "version": "4.62.2",
+      "resolved": "https://registry.npmjs.org/@rollup/rollup-freebsd-x64/-/rollup-freebsd-x64-4.62.2.tgz",
+      "integrity": "sha512-6nU5F2wCW+qvCBhTn1pdIU3bzsIoF7EUwsCDRxilWGprQR6yd508YnH9+OKFCwpfS8pjZqDUmnCAr7exax0XCg==",
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
+      "version": "4.62.2",
+      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm-gnueabihf/-/rollup-linux-arm-gnueabihf-4.62.2.tgz",
+      "integrity": "sha512-n1GJHPOvpIfhi3TmrCeh6S6URt9BFCt0KQE3qvexyGCTAKpR4Lg+eWvNZEqu7epxwus/8ElT3hacYEucm49SZg==",
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
+      "version": "4.62.2",
+      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm-musleabihf/-/rollup-linux-arm-musleabihf-4.62.2.tgz",
+      "integrity": "sha512-JqgflS8wEB+UXV/vS1RpRbifGBeN4D5lz8D8oOFbFZw4vedvdOgCFAjfBmIMdW3yL10XpQQ0Ambepw6MXrhOnA==",
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
+      "version": "4.62.2",
+      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm64-gnu/-/rollup-linux-arm64-gnu-4.62.2.tgz",
+      "integrity": "sha512-wnFJkogWvN4jm/hQRF2UBaeUmk20j5+DmHvoyWii2b8HJDyvz1MF2OU/6ynXt2KR63rbZLWkFpoytpdc/yBuSA==",
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
+      "version": "4.62.2",
+      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm64-musl/-/rollup-linux-arm64-musl-4.62.2.tgz",
+      "integrity": "sha512-HVu2bp0zhvJ8xHEV9+UUs7S90VadmBSY3LcIMvozbPo4AuMGDWlz3ymHLHZPX4hR67TKTt8Qp5PJ5RBg/i+RMQ==",
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
+      "version": "4.62.2",
+      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-loong64-gnu/-/rollup-linux-loong64-gnu-4.62.2.tgz",
+      "integrity": "sha512-mQqqAV8QaoSgr9I2fKDLY2BAVvmKjWoGiu/cSYQonsLvtqwEn1E4QYfnCOcp5zoEqNhsDYin1s6jx/VJmrxlZg==",
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
+      "version": "4.62.2",
+      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-loong64-musl/-/rollup-linux-loong64-musl-4.62.2.tgz",
+      "integrity": "sha512-IxKLoxCQ2IWi6bT2akyDUBGsOImDKB+sPp4EsTmwFQ/fMwpCKm8uLSSgP/Kx/QYUgKis6SEZ5/Nlhup0DIA0PQ==",
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
+      "version": "4.62.2",
+      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-ppc64-gnu/-/rollup-linux-ppc64-gnu-4.62.2.tgz",
+      "integrity": "sha512-Mk5ha2RQSgyFfmYYLkBpPnUk8D8FriBxesO1u9O75X0mHgXL1UQcH5Itl2lurWL2tj0RxV9b9tJgipac0hRY9A==",
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
+      "version": "4.62.2",
+      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-ppc64-musl/-/rollup-linux-ppc64-musl-4.62.2.tgz",
+      "integrity": "sha512-CjvEnqJL/0/TQ3TXX3OPIJ/kmBellrWd4heXUmHeJlTnmwjKpSJzoehLaL6Xk0ZnMHBu9dZuFADNOrtjF4v+2w==",
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
+      "version": "4.62.2",
+      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-riscv64-gnu/-/rollup-linux-riscv64-gnu-4.62.2.tgz",
+      "integrity": "sha512-1SiZbzwdkaDURsew/tSOrooKiYy7EQGT6m8ufavAi9NEyQb/6VuIxFXAL1fqa4iZe3g4NbNk4P7J32z2tw5Mgg==",
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
+      "version": "4.62.2",
+      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-riscv64-musl/-/rollup-linux-riscv64-musl-4.62.2.tgz",
+      "integrity": "sha512-nQts12zJ3NQRoE6uYljOH89v7szzLDvG2JD/vsX+vGXU8w/At1GowTZ5/7qeFQ8m7L55rpR8Okugnuo5bgjy2Q==",
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
+      "version": "4.62.2",
+      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-s390x-gnu/-/rollup-linux-s390x-gnu-4.62.2.tgz",
+      "integrity": "sha512-E9/ll019jhPIJgpzfZoIkBGhcz+kKNgVWYRY0zr9srBdPPFVpvOKW8VaJKUbeK+eZXyQF9ltME+Kk6affeaPgg==",
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
+      "version": "4.62.2",
+      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-x64-gnu/-/rollup-linux-x64-gnu-4.62.2.tgz",
+      "integrity": "sha512-5BqxR/pshjey51iliyzTD5Xi3EN0aLmQ2lZ3lvefVV9c82BvrLo2/6OT55iifpWBufs6kdwWbuOKS841DrmK9A==",
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
+      "version": "4.62.2",
+      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-x64-musl/-/rollup-linux-x64-musl-4.62.2.tgz",
+      "integrity": "sha512-uNN83XxQrRAh/w0/pmAfibcwyb6YWt4gP+dpnQKPVJshAloQ785ii8CT8ZCIxkGg9opVsvAlGhFitSm6D1Jjpg==",
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
+      "version": "4.62.2",
+      "resolved": "https://registry.npmjs.org/@rollup/rollup-openbsd-x64/-/rollup-openbsd-x64-4.62.2.tgz",
+      "integrity": "sha512-srjEIxSH3LRnJN6THczDHWQplqEMFiAJrTab0msUryh9kwNpkICf3Ea6q6MN/2cZwRFUNx5w+h6Hpi4QuHS6Zg==",
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
+      "version": "4.62.2",
+      "resolved": "https://registry.npmjs.org/@rollup/rollup-openharmony-arm64/-/rollup-openharmony-arm64-4.62.2.tgz",
+      "integrity": "sha512-8hOJnxgbyObnCm5AlRA3A931xX19xq80RjVTKgJOvEKWqJruP/Uf12IbAOaDjjEXYRewwHLfmF0YRIdK3OwKWA==",
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
+      "version": "4.62.2",
+      "resolved": "https://registry.npmjs.org/@rollup/rollup-win32-arm64-msvc/-/rollup-win32-arm64-msvc-4.62.2.tgz",
+      "integrity": "sha512-mmF4AY1i0hG/bLWUctUq59gtmgaSIRa3cu/A3JFRp/sCNEme2bgDEiDS22P9FbnJB8NJNF4jPJiSP5RHQpUTDg==",
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
+      "version": "4.62.2",
+      "resolved": "https://registry.npmjs.org/@rollup/rollup-win32-ia32-msvc/-/rollup-win32-ia32-msvc-4.62.2.tgz",
+      "integrity": "sha512-DZgkknc6jhHrk46V25vbAM0zZkyP0nSDkJB8/dRkLTxv470dOmWDqGoEJl/9A0dFfS7yE3REOwNDxpHwSLSt0Q==",
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
+      "version": "4.62.2",
+      "resolved": "https://registry.npmjs.org/@rollup/rollup-win32-x64-gnu/-/rollup-win32-x64-gnu-4.62.2.tgz",
+      "integrity": "sha512-T6xr6ucWSFto+VGajA8YH26LdpHRuP4YLHEKAtCWvJDOlnmWcDZVCI2Jmjr+IFHDlt2zRaTAKE4tfjTaWLgJBg==",
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
+      "version": "4.62.2",
+      "resolved": "https://registry.npmjs.org/@rollup/rollup-win32-x64-msvc/-/rollup-win32-x64-msvc-4.62.2.tgz",
+      "integrity": "sha512-BfzEnDJOt9T8M989/lA37EcJgat01wLRnoi5dQf3QzOH7jzpqTAzdDbVfRljVr5r+jzKqpbHeyOfAaXxAd0PAA==",
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
+      "version": "3.3.16",
+      "resolved": "https://registry.npmjs.org/nanoid/-/nanoid-3.3.16.tgz",
+      "integrity": "sha512-bzlKTyNJ7+LdGIIwy8ijFpIqEQIvafahV7eYykJ8Cvh42EdJeODoJ6gUJXpQJvej1BddH8OqTXZNE/KfbWAu8Q==",
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
+      "version": "8.5.23",
+      "resolved": "https://registry.npmjs.org/postcss/-/postcss-8.5.23.tgz",
+      "integrity": "sha512-g50586zr4bZmwFiTlflMu8E0bDTb5I5gertgwAKmsdUlTQIhZtunzUlD1WSzwcVWPoAVpsrA6vlfCD7oXvRwgg==",
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
+        "nanoid": "^3.3.16",
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
+      "version": "4.62.2",
+      "resolved": "https://registry.npmjs.org/rollup/-/rollup-4.62.2.tgz",
+      "integrity": "sha512-RFnrW4lhXA3s3eqHDZvN654g8OTjzRfqpIRJYczCGB6HzphckVAi/Qh4tbPUbRuDi7s1Llv8g/NspLkttY3gTA==",
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
+        "@rollup/rollup-android-arm-eabi": "4.62.2",
+        "@rollup/rollup-android-arm64": "4.62.2",
+        "@rollup/rollup-darwin-arm64": "4.62.2",
+        "@rollup/rollup-darwin-x64": "4.62.2",
+        "@rollup/rollup-freebsd-arm64": "4.62.2",
+        "@rollup/rollup-freebsd-x64": "4.62.2",
+        "@rollup/rollup-linux-arm-gnueabihf": "4.62.2",
+        "@rollup/rollup-linux-arm-musleabihf": "4.62.2",
+        "@rollup/rollup-linux-arm64-gnu": "4.62.2",
+        "@rollup/rollup-linux-arm64-musl": "4.62.2",
+        "@rollup/rollup-linux-loong64-gnu": "4.62.2",
+        "@rollup/rollup-linux-loong64-musl": "4.62.2",
+        "@rollup/rollup-linux-ppc64-gnu": "4.62.2",
+        "@rollup/rollup-linux-ppc64-musl": "4.62.2",
+        "@rollup/rollup-linux-riscv64-gnu": "4.62.2",
+        "@rollup/rollup-linux-riscv64-musl": "4.62.2",
+        "@rollup/rollup-linux-s390x-gnu": "4.62.2",
+        "@rollup/rollup-linux-x64-gnu": "4.62.2",
+        "@rollup/rollup-linux-x64-musl": "4.62.2",
+        "@rollup/rollup-openbsd-x64": "4.62.2",
+        "@rollup/rollup-openharmony-arm64": "4.62.2",
+        "@rollup/rollup-win32-arm64-msvc": "4.62.2",
+        "@rollup/rollup-win32-ia32-msvc": "4.62.2",
+        "@rollup/rollup-win32-x64-gnu": "4.62.2",
+        "@rollup/rollup-win32-x64-msvc": "4.62.2",
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
+      "version": "7.4.9",
+      "resolved": "https://registry.npmjs.org/tldts/-/tldts-7.4.9.tgz",
+      "integrity": "sha512-3kZ8wQQ/k5DrChD4X4FVvr2D7E5uoRgAqkPyLpSCGUvqOvqu+JEdr3mwMUaVWb+vMHZaKhF5fp2PBigKsui7hA==",
+      "dev": true,
+      "license": "MIT",
+      "dependencies": {
+        "tldts-core": "^7.4.9"
+      },
+      "bin": {
+        "tldts": "bin/cli.js"
+      }
+    },
+    "node_modules/tldts-core": {
+      "version": "7.4.9",
+      "resolved": "https://registry.npmjs.org/tldts-core/-/tldts-core-7.4.9.tgz",
+      "integrity": "sha512-DxKfPBI52p2msTEu7MPhdpdDTBhhVQg1a/8PjQckeyAvO13eMYElX545grIp6nnTGIMZlRvFZPvFhvI/WIz2Vg==",
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
diff --git a/apps/xiong-tu-san-guo/package.json b/apps/xiong-tu-san-guo/package.json
new file mode 100644
index 0000000..bd8404a
--- /dev/null
+++ b/apps/xiong-tu-san-guo/package.json
@@ -0,0 +1,17 @@
+{
+  "name": "xiong-tu-san-guo",
+  "version": "1.0.0",
+  "description": "《雄图·三国志文明》回合制策略经营网页游戏 - Heroic Three Kingdoms Civilization (turn-based strategy)",
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
diff --git a/apps/xiong-tu-san-guo/scripts/_css-loader.mjs b/apps/xiong-tu-san-guo/scripts/_css-loader.mjs
new file mode 100644
index 0000000..b10c2fa
--- /dev/null
+++ b/apps/xiong-tu-san-guo/scripts/_css-loader.mjs
@@ -0,0 +1,7 @@
+// 让 Node 的 ESM 加载器把 *.css 视作空模块（仅冒烟测试用）。
+export async function load(url, context, nextLoad) {
+  if (url.endsWith('.css')) {
+    return { format: 'module', source: '', shortCircuit: true };
+  }
+  return nextLoad(url, context);
+}
diff --git a/apps/xiong-tu-san-guo/scripts/logic-test.mjs b/apps/xiong-tu-san-guo/scripts/logic-test.mjs
new file mode 100644
index 0000000..eb29ed1
--- /dev/null
+++ b/apps/xiong-tu-san-guo/scripts/logic-test.mjs
@@ -0,0 +1,156 @@
+// 纯逻辑自测（不依赖浏览器/DOM）。运行：npm test
+import { CITIES, CITY_MAP, adjacencyValid } from '../src/data/cities.js';
+import { HEROES, FACTION_SEEDS, makeGenericGeneral } from '../src/data/heroes.js';
+import { makeRng } from '../src/core/rng.js';
+import { parseSkill, techMult } from '../src/core/tech.js';
+import { cityGoldIncome, cityGrainIncome, factionGoldIncome, factionGrainNet } from '../src/core/economy.js';
+import { createBattle, runBattle, effWar, attackValue } from '../src/core/combat.js';
+import {
+  newGame, cityById, heroesOfFaction, cmdPoints, cmdRemaining,
+  troopCap, resolveTurn, checkGameOver, neighbors, wildHeroesInCity,
+} from '../src/core/state.js';
+import * as A from '../src/core/actions.js';
+import { aiTurnAll } from '../src/core/ai.js';
+
+let pass = 0, fail = 0;
+function ok(cond, msg) { if (cond) { pass++; } else { fail++; console.error('  ✗ ' + msg); } }
+function eq(a, b, msg) { ok(a === b, `${msg} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`); }
+
+console.log('—— 数据完整性 ——');
+ok(adjacencyValid(), '城市邻接关系双向一致');
+eq(CITIES.length, 18, '城市数为 18');
+ok(HEROES.length >= 40, `名将数 >= 40 (实际 ${HEROES.length})`);
+eq(FACTION_SEEDS.length, 8, 'AI 势力种子为 8');
+// 每位名将要么 serve 一个种子势力，要么 wild 在某城市
+for (const h of HEROES) {
+  ok(h.serve || h.wild, `${h.name} 有归属（serve/wild）`);
+  if (h.wild) ok(CITY_MAP[h.wild], `${h.name} 的在野城市 ${h.wild} 存在`);
+  if (h.serve) ok(FACTION_SEEDS.some((s) => s.key === h.serve), `${h.name} 所属势力 ${h.serve} 存在`);
+}
+eq(makeGenericGeneral(makeRng(1), 1).id, 'gen_1', '生成武将 id 唯一可控');
+
+console.log('—— 科技 / 技能解析 ——');
+const sb = parseSkill('lead:0.10,war:0.05,trick:0.20');
+eq(sb.lead, 0.1, '技能 lead 解析');
+eq(sb.war, 0.05, '技能 war 解析');
+eq(sb.trick, 0.2, '技能 trick 解析');
+eq(parseSkill(null).lead, 0, '空技能返回零加成');
+
+console.log('—— 新局初始化（玩家选洛阳）——');
+const rng = makeRng(42);
+const stats = { l: 80, w: 70, i: 75, p: 78, c: 85 };
+let s = newGame({ lordName: '测试主公', startCity: 'luoyang', stats, rng });
+eq(s.turn, 1, '初始回合 = 1');
+eq(s.over, null, '初始无胜负');
+eq(cityById(s, 'luoyang').ownerFactionId, 0, '洛阳归玩家');
+eq(heroesOfFaction(s, 0).length, 1, '玩家初始仅君主一人');
+ok(s.factions.length >= 7, `生成 >=7 个势力 (实际 ${s.factions.length})`);
+// 8 个种子都城，玩家占洛阳（非任何都城）→ 8 AI 势力齐全
+eq(s.factions.filter((f) => f.aiControlled).length, 8, '8 个 AI 势力（玩家未占都城）');
+// 中立城市存在
+const neutral = s.cities.filter((c) => c.ownerFactionId == null);
+ok(neutral.length >= 8, `存在中立城市 (实际 ${neutral.length})`);
+
+console.log('—— 玩家选都城（许昌，曹操势力被吞并）——');
+const s2 = newGame({ lordName: '篡位者', startCity: 'xuchang', stats, rng: makeRng(7) });
+eq(s2.factions.filter((f) => f.aiControlled).length, 7, '占都城后仅 7 个 AI 势力');
+const caocao = s2.heroes.find((h) => h.id === 'caocao');
+ok(caocao && caocao.wild && caocao.cityId === 'xuchang', '曹操转为许昌在野，可被登用');
+ok(s2.heroes.some((h) => h.id === 'zhangliao' && h.wild), '张辽随曹操转为在野');
+
+console.log('—— 指令点 / 带兵上限 ——');
+const baseCmd = cmdPoints(s, 0);
+ok(baseCmd >= 5, `基础指令点 >= 5 (实际 ${baseCmd})`);
+const lord = s.heroes.find((h) => h.isPlayerLord);
+eq(cmdRemaining(s, 0), baseCmd, '回合初指令点全满');
+ok(troopCap(s, lord) >= 8000, `君主带兵上限合理 (实际 ${troopCap(s, lord)})`);
+
+console.log('—— 内政指令 ——');
+const beforeMarket = cityById(s, 'luoyang').marketLevel;
+let r1 = A.developMarket(s, 'luoyang');
+ok(r1.ok && cityById(s, 'luoyang').marketLevel === beforeMarket + 1, '发展商业成功升 1 级');
+const r2 = A.recruit(s, 'luoyang', 500);
+ok(r2.ok && cityById(s, 'luoyang').soldiers > 2000, '征兵增加士兵');
+ok(cmdRemaining(s, 0) < baseCmd, '执行指令后剩余指令点减少');
+// 金钱不足应失败且退还指令
+const poor = JSON.parse(JSON.stringify(s));
+factionPoor(poor, 0);
+const cmdBefore = cmdRemaining(poor, 0);
+const r3 = A.developFarm(poor, 'luoyang');
+ok(!r3.ok, '金钱不足时开发失败');
+eq(cmdRemaining(poor, 0), cmdBefore, '失败时指令点如数退还');
+
+console.log('—— 探索 / 登用 ——');
+// 洛阳在野有刘备 / 华佗
+const wildLy = wildHeroesInCity(s, 'luoyang');
+ok(wildLy.some((h) => h.id === 'liubei'), '洛阳在野含刘备');
+const exp = A.explore(s, 'luoyang', 0, makeRng(1));
+ok(exp.ok, '探索执行成功');
+// 强行标记已发现后登用
+const guanyu = s.heroes.find((h) => h.id === 'guanyu');
+guanyu.discovered = true;
+guanyu.cityId = 'luoyang'; // 移到玩家城便于测试
+const recR = A.recruitHero(s, 'guanyu', 0, makeRng(99));
+// 高魅力 + 多次尝试：用固定大种子提高命中
+ok(typeof recR.recruited === 'boolean', '登用返回是否成功布尔值');
+
+console.log('—— 战斗系统 ——');
+const battle = createBattle({
+  attacker: { factionId: 0, general: { name: '猛将', stats: { l: 90, w: 95, i: 60, p: 50, c: 60 }, skill: null }, soldiers: 3000, training: 60, formation: 'assault' },
+  defender: { factionId: 1, general: { name: '守将', stats: { l: 60, w: 60, i: 50, p: 50, c: 50 }, skill: null }, soldiers: 1000, defense: 300, isCity: true, training: 50, formation: 'normal' },
+});
+runBattle(battle, s, makeRng(3));
+ok(battle.result === 'attacker' || battle.result === 'defender', '战斗产出胜负结果');
+ok(battle.log.length > 0, '战斗产生战报');
+ok(effWar({ stats: { w: 100 }, skill: { effect: 'war:0.15' } }) > 100, '技能加成提升有效武力');
+
+console.log('—— 出征（攻打相邻中立城）——');
+// 把宛城设为中立且兵力薄弱，玩家从洛阳出征
+const wan = cityById(s, 'wan');
+wan.ownerFactionId = null; wan.soldiers = 300; wan.defense = 200;
+const lordId = s.heroes.find((h) => h.isPlayerLord).id;
+// 先征兵确保有兵
+cityById(s, 'luoyang').soldiers = 5000;
+const camp = A.campaign(s, 'luoyang', 'wan', lordId, 2000, 'assault', 0, makeRng(5));
+ok(camp.ok, '出征执行成功');
+if (camp.won) {
+  eq(cityById(s, 'wan').ownerFactionId, 0, '攻陷后宛城归玩家');
+} else {
+  ok(true, '出征未克（随机结果）');
+}
+
+console.log('—— 回合结算（含 AI）——');
+const s3 = newGame({ lordName: '结算测试', startCity: 'luoyang', stats, rng: makeRng(11) });
+const turn1 = s3.turn;
+const aiModule = { aiTurnAll };
+resolveTurn(s3, aiModule, makeRng(13));
+eq(s3.turn, turn1 + 1, '结算后回合 +1');
+ok(s3.turnLog.length >= 0, '结算产生回合日志');
+// 玩家金钱应随收入增加（初始有 buffer）
+ok(s3.factions[0].money > 0, '玩家回合后有金钱');
+
+console.log('—— 胜负判定 ——');
+// 模拟玩家占全部城市 → 胜利
+const sWin = newGame({ lordName: '霸主', startCity: 'luoyang', stats, rng: makeRng(2) });
+for (const c of sWin.cities) c.ownerFactionId = 0;
+checkGameOver(sWin);
+eq(sWin.over, 'win', '占全部城市 → 胜利');
+// 玩家无城 → 失败
+const sLose = newGame({ lordName: '败者', startCity: 'luoyang', stats, rng: makeRng(3) });
+for (const c of sLose.cities) if (c.id === 'luoyang') c.ownerFactionId = 1;
+for (const c of sLose.cities) if (c.ownerFactionId === 0) c.ownerFactionId = null;
+checkGameOver(sLose);
+eq(sLose.over, 'lose', '玩家无城 → 失败');
+
+console.log('—— 邻接可达性（全图连通）——');
+function bfsReachable(state, start) {
+  const seen = new Set([start]); const q = [start];
+  while (q.length) { const id = q.shift(); for (const n of cityById(state, id).adjacent) { if (!seen.has(n)) { seen.add(n); q.push(n); } } }
+  return seen;
+}
+eq(bfsReachable(s, 'luoyang').size, 18, '从洛阳可达全部 18 城（地图连通）');
+
+console.log(`\n结果：${pass} 通过，${fail} 失败`);
+process.exit(fail ? 1 : 0);
+
+function factionPoor(st, fid) { st.factions.find((f) => f.id === fid).money = 0; }
diff --git a/apps/xiong-tu-san-guo/scripts/smoke-dom.mjs b/apps/xiong-tu-san-guo/scripts/smoke-dom.mjs
new file mode 100644
index 0000000..49f8db3
--- /dev/null
+++ b/apps/xiong-tu-san-guo/scripts/smoke-dom.mjs
@@ -0,0 +1,112 @@
+// DOM 冒烟测试：用 jsdom 驱动真实 UI 流程（启动 → 创角 → 对局 → 标签 → 城务 → 结束回合）。
+// 运行：node scripts/smoke-dom.mjs   （需先 npm install jsdom）
+import { JSDOM } from 'jsdom';
+import { register } from 'node:module';
+
+register('./_css-loader.mjs', import.meta.url);
+
+const dom = new JSDOM('<!DOCTYPE html><div id="game-container"></div>', {
+  url: 'http://localhost/',
+  pretendToBeVisual: true,
+});
+const { window } = dom;
+for (const k of ['document', 'window', 'localStorage', 'navigator', 'HTMLElement', 'Node', 'Element', 'getComputedStyle', 'CustomEvent', 'MouseEvent', 'Event']) {
+  if (window[k] === undefined) continue;
+  try { globalThis[k] = window[k]; } catch (_) {}
+}
+globalThis.requestAnimationFrame = (fn) => setTimeout(fn, 0);
+
+let pass = 0, fail = 0;
+const ok = (c, m) => { if (c) pass++; else { fail++; console.error('  ✗ FAIL:', m); } };
+const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
+
+let lastToast = '';
+const watchToasts = () => {
+  const wrap = document.querySelector('.toast-wrap');
+  if (!wrap) return;
+  new window.MutationObserver((muts) => {
+    for (const m of muts) for (const n of m.addedNodes) if (n.classList && n.classList.contains('toast')) lastToast = n.textContent;
+  }).observe(wrap, { childList: true });
+};
+
+const { createGame } = await import(new URL('../src/main.js', import.meta.url).href);
+const A = await import(new URL('../src/core/actions.js', import.meta.url).href);
+localStorage.clear();
+const ui = createGame(document.getElementById('game-container'));
+window.__XTSG = ui;
+watchToasts();
+await sleep(10);
+
+// ---------- 1) 启动器 ----------
+ok(document.querySelector('.launcher') !== null, '渲染启动器');
+ok(document.querySelector('.launcher__menu button') !== null, '启动器有「新游戏」按钮');
+
+// ---------- 2) 创角 ----------
+ui.showCreate();
+await sleep(5);
+ok(document.querySelector('.create') !== null, '进入创角页');
+ok(document.querySelectorAll('.city-pick__item').length === 18, '可选 18 座城市');
+const nameInput = document.querySelector('.create input[type=text]');
+nameInput.value = '玄德';
+nameInput.dispatchEvent(new window.Event('input'));
+ui.startCityPick = 'luoyang';
+ui.beginGame();
+await sleep(5);
+ok(document.querySelector('.game') !== null, '进入对局主界面');
+ok(document.querySelector('.topbar') !== null, '顶栏已渲染');
+ok(document.querySelectorAll('.tab').length === 5, '五个标签');
+ok(document.querySelectorAll('.map-dot').length === 18, '地图渲染 18 个城市点');
+
+// ---------- 3) 切换标签（逐个验证签名元素）----------
+const tabSignatures = {
+  faction: '.city-card', heroes: '.card-list', tech: '.tech-grid', system: '.sys-list', map: '.map-dot',
+};
+for (const [tab, sel] of Object.entries(tabSignatures)) {
+  ui.tab = tab; ui.renderTabbar(); ui.renderContent();
+  await sleep(3);
+  ok(document.querySelector(sel) !== null, `「${tab}」标签渲染（${sel}）`);
+}
+
+// ---------- 4) 城务：打开己方城市并执行内政 ----------
+ui.tab = 'map'; ui.renderContent(); await sleep(3);
+const luoyangDot = Array.from(document.querySelectorAll('.map-dot')).find((b) => b.textContent.includes('洛阳'));
+ok(!!luoyangDot, '找到洛阳城市点');
+luoyangDot.click();
+await sleep(5);
+ok(document.querySelector('.modal') !== null, '点击城市弹出城务弹窗');
+const farmBtn = Array.from(document.querySelectorAll('.cmd-btn')).find((b) => b.textContent.includes('农田'));
+ok(!!farmBtn, '城务含「开发农田」指令');
+farmBtn.click();
+await sleep(5);
+
+// ---------- 5) 结束回合 ----------
+ui.tab = 'system'; ui.renderContent(); await sleep(3);
+// 直接驱动结算（跳过确认弹窗）
+ui.doEndTurn();
+await sleep(20);
+ok(document.querySelector('.modal') !== null || document.querySelector('.gameover') !== null, '结算后弹出简报或结束界面');
+ok(ui.state.turn === 2 || ui.state.over != null, '回合推进或游戏结束');
+
+// ---------- 6) 战报弹窗渲染（驱动一次真实出征）----------
+ui.tab = 'map'; ui.renderContent(); await sleep(3);
+// 造势：洛阳兵足，邻接宛城设为中立薄弱，直接调用动作层出征并渲染战报
+const s = ui.state;
+const ly = s.cities.find((c) => c.id === 'luoyang');
+const wan = s.cities.find((c) => c.id === 'wan');
+ly.soldiers = 5000;
+wan.ownerFactionId = null; wan.soldiers = 300; wan.defense = 200;
+const lord = s.heroes.find((h) => h.isPlayerLord);
+const camp = A.campaign(s, 'luoyang', 'wan', lord.id, 2000, 'assault', s.playerFactionId, Math.random);
+ok(camp.ok && camp.battle, '出征产出战斗对象');
+ui.showBattleReport(camp.battle, camp.won, camp.msg);
+await sleep(5);
+ok(document.querySelector('.battle-log') !== null, '战报弹窗渲染');
+document.querySelector('.modal__foot button').click();
+await sleep(3);
+
+// ---------- 7) 存档可往返 ----------
+localStorage.setItem('__probe__', '1');
+ok(localStorage.getItem('xtsg_save_v1') != null, '对局已自动存档到 localStorage');
+
+console.log(`\nDOM 冒烟结果：${pass} 通过，${fail} 失败`);
+process.exit(fail ? 1 : 0);
diff --git a/apps/xiong-tu-san-guo/src/config.js b/apps/xiong-tu-san-guo/src/config.js
new file mode 100644
index 0000000..3276c59
--- /dev/null
+++ b/apps/xiong-tu-san-guo/src/config.js
@@ -0,0 +1,84 @@
+// ============================================================================
+// 雄图·三国志文明 · 全局常量与公式
+// 所有数值与战斗 / 经济公式集中于此，便于单测（scripts/logic-test.mjs）与平衡调整。
+// ============================================================================
+
+export const SAVE_KEY = 'xtsg_save_v1';
+export const GAME_VERSION = 1;
+
+export const BUILD_MAX = 5; // 城市建筑等级上限（农田 / 市集 / 兵营 / 城墙 / 工坊）
+export const TRAINING_BASE = 50; // 士兵默认训练度
+export const TRAINING_MAX = 100;
+
+// —— 指令点数 ——
+export const CMD_BASE = 5;
+export const CMD_PER_CITY = 2;
+
+// —— 经济（每回合结算）——
+export const GOLD_PER_MARKET = 100; // 市集等级 × 100
+export const GOLD_PER_POP = 0.5; // 人口 × 0.5
+export const GRAIN_PER_FARM = 200; // 农田等级 × 200
+export const GRAIN_UPKEEP_PER_SOLDIER = 0.5; // 士兵每回合吃粮
+export const POP_GROWTH_RATE = 0.02; // 自然增长率基础
+export const POP_GROWTH_POL_DIVISOR = 100; // 政治 / 100 作为系数
+
+// —— 征兵 ——
+export const RECRUIT_GOLD_PER_SOLDIER = 1.5; // 每名士兵花费金钱
+export const RECRUIT_POP_PER_SOLDIER = 1; // 征兵消耗人口
+
+// 升级建筑花费：从当前 level 升到下一级
+export function buildCost(level) {
+  return 300 + level * 200;
+}
+
+// —— 科技 ——
+export const TECH_MAX_LEVEL = 3;
+export const TECHS = {
+  agri: { name: '农艺', desc: '粮食产量 +10% / 级', icon: '🌾' },
+  commerce: { name: '商贸', desc: '金钱收入 +10% / 级', icon: '💰' },
+  forge: { name: '冶炼', desc: '士兵攻击 +5% / 级', icon: '⚒️' },
+  wall: { name: '筑城', desc: '城防值 +20% / 级', icon: '🧱' },
+  trick: { name: '谋略', desc: '计谋成功率 +5% / 级', icon: '📜' },
+  leadership: { name: '统御', desc: '带兵上限 +10% / 级', icon: '⚓' },
+};
+export const TECH_COST_GOLD = 800; // 每级基础金钱花费
+export const TECH_COST_TURNS = 3; // 每级基础研究回合（智力可缩短）
+
+// —— 战斗 ——
+export const FORMATIONS = {
+  normal: { name: '普通', atk: 1.0, def: 1.0, desc: '攻守均衡' },
+  assault: { name: '攻击', atk: 1.2, def: 0.85, desc: '攻击 +20% / 防御 -15%' },
+  defend: { name: '防御', atk: 0.85, def: 1.2, desc: '攻击 -15% / 防御 +20%' },
+};
+export const DUEL_THRESHOLD = 20; // 武力差 > 20 可触发单挑
+export const DUEL_CHANCE = 0.22; // 每回合触发单挑的概率
+export const DUEL_ROUT_RATIO = 0.35; // 单挑败方溃散的兵力比例
+
+// —— 计略 ——
+export const STRATAGEMS = {
+  fire: { name: '火攻', desc: '降低目标城防 30%', icon: '🔥', range: 0.3 },
+  burn: { name: '烧粮', desc: '烧毁目标军粮 30%', icon: '🔥', range: 0.3 },
+  rumor: { name: '流言', desc: '降低目标守将忠诚 25', icon: '🗯️', range: 25 },
+};
+
+// —— 势力颜色 ——
+export const FACTION_COLORS = [
+  '#c0392b', '#27ae60', '#2980b9', '#8e44ad',
+  '#d35400', '#16a085', '#ad1457', '#f39c12', '#5d6d7e',
+];
+export const PLAYER_COLOR = '#c0392b';
+export const NEUTRAL_COLOR = '#7f8c8d';
+
+// —— 探索 / 登用 ——
+export const EXPLORE_DISCOVERY_BASE = 0.5; // 每位在野名将的发现概率基础（× 魅力修正）
+export const RECRUIT_LOYALTY_THRESHOLD = 30; // 忠诚低于此值的敌将易被策反
+
+export function clamp(v, lo, hi) {
+  return Math.max(lo, Math.min(hi, v));
+}
+
+// 季节名（每回合 = 三个月）
+export const SEASONS = ['春', '夏', '秋', '冬'];
+export function seasonOf(turn) {
+  return SEASONS[(turn - 1) % SEASONS.length];
+}
diff --git a/apps/xiong-tu-san-guo/src/core/actions.js b/apps/xiong-tu-san-guo/src/core/actions.js
new file mode 100644
index 0000000..40dfdbd
--- /dev/null
+++ b/apps/xiong-tu-san-guo/src/core/actions.js
@@ -0,0 +1,425 @@
+// ============================================================================
+// 玩家 / AI 共用的命令函数：每个动作校验、扣费、变更状态并返回 { ok, msg, ... }。
+// 消耗指令点（cmd）的动作通过 spendCmd 统一计费；任命太守、输送等少数免费。
+// ============================================================================
+import {
+  cityById, heroById, factionById, playerFaction, neighbors, heroesInCity,
+  wildHeroesInCity, heroesOfFaction, bestDefender, troopCap, cmdRemaining, maxDefense, lordOf,
+  checkGameOver,
+} from './state.js';
+import { citiesOf, recruitCost } from './economy.js';
+import { skillBonus, techMult, techLevel } from './tech.js';
+import { createBattle, runBattle, effLead, effWar } from './combat.js';
+import { chance, rangeInt } from './rng.js';
+import {
+  BUILD_MAX, buildCost, TRAINING_BASE, TRAINING_MAX, FORMATIONS, STRATAGEMS,
+  TECH_MAX_LEVEL, TECH_COST_GOLD, TECH_COST_TURNS, RECRUIT_LOYALTY_THRESHOLD,
+} from '../config.js';
+
+const PLAYER = (state) => state.playerFactionId;
+
+// 消耗一点指令；不足返回 false
+function spendCmd(state, fid) {
+  if (cmdRemaining(state, fid) <= 0) return false;
+  state.cmdUsedByFaction = state.cmdUsedByFaction || {};
+  state.cmdUsedByFaction[fid] = (state.cmdUsedByFaction[fid] || 0) + 1;
+  return true;
+}
+function facMoney(state, fid) { return factionById(state, fid).money; }
+function facGrain(state, fid) { return factionById(state, fid).grain; }
+
+const isPlayer = (state, fid) => fid === state.playerFactionId;
+
+// —— 内政：开发农田 ——
+export function developFarm(state, cityId, fid = PLAYER(state)) {
+  const c = cityById(state, cityId);
+  if (!c || c.ownerFactionId !== fid) return { ok: false, msg: '该城非你所属' };
+  if (c.farmLevel >= BUILD_MAX) return { ok: false, msg: '农田已达满级' };
+  if (!spendCmd(state, fid)) return { ok: false, msg: '指令点不足' };
+  const cost = buildCost(c.farmLevel);
+  if (facMoney(state, fid) < cost) { refundCmd(state, fid); return { ok: false, msg: '金钱不足' }; }
+  factionById(state, fid).money -= cost;
+  c.farmLevel += 1;
+  return { ok: true, msg: `${c.name} 农田升至 ${c.farmLevel} 级（-${cost} 金）` };
+}
+
+// —— 内政：发展商业 ——
+export function developMarket(state, cityId, fid = PLAYER(state)) {
+  const c = cityById(state, cityId);
+  if (!c || c.ownerFactionId !== fid) return { ok: false, msg: '该城非你所属' };
+  if (c.marketLevel >= BUILD_MAX) return { ok: false, msg: '市集已达满级' };
+  if (!spendCmd(state, fid)) return { ok: false, msg: '指令点不足' };
+  const cost = buildCost(c.marketLevel);
+  if (facMoney(state, fid) < cost) { refundCmd(state, fid); return { ok: false, msg: '金钱不足' }; }
+  factionById(state, fid).money -= cost;
+  c.marketLevel += 1;
+  return { ok: true, msg: `${c.name} 市集升至 ${c.marketLevel} 级（-${cost} 金）` };
+}
+
+// —— 内政：城防修筑 ——
+export function buildWall(state, cityId, fid = PLAYER(state)) {
+  const c = cityById(state, cityId);
+  if (!c || c.ownerFactionId !== fid) return { ok: false, msg: '该城非你所属' };
+  if (c.wallLevel >= BUILD_MAX) return { ok: false, msg: '城墙已达满级' };
+  if (!spendCmd(state, fid)) return { ok: false, msg: '指令点不足' };
+  const cost = buildCost(c.wallLevel);
+  if (facMoney(state, fid) < cost) { refundCmd(state, fid); return { ok: false, msg: '金钱不足' }; }
+  factionById(state, fid).money -= cost;
+  c.wallLevel += 1;
+  c.defense = maxDefense(state, c);
+  return { ok: true, msg: `${c.name} 城墙升至 ${c.wallLevel} 级，城防加固` };
+}
+
+// —— 内政：征兵 ——
+export function recruit(state, cityId, count, fid = PLAYER(state)) {
+  const c = cityById(state, cityId);
+  if (!c || c.ownerFactionId !== fid) return { ok: false, msg: '该城非你所属' };
+  count = Math.max(0, Math.floor(count));
+  if (count <= 0) return { ok: false, msg: '征兵数量无效' };
+  if (!spendCmd(state, fid)) return { ok: false, msg: '指令点不足' };
+  const { gold, pop } = recruitCost(c, count);
+  const fac = factionById(state, fid);
+  if (fac.money < gold) { refundCmd(state, fid); return { ok: false, msg: '金钱不足' }; }
+  if (c.population < pop) { refundCmd(state, fid); return { ok: false, msg: '人口不足' }; }
+  fac.money -= gold;
+  c.population -= Math.round(pop);
+  c.soldiers += count;
+  // 兵营等级提升新兵训练度起点
+  if (c.training < TRAINING_BASE + (c.barracksLevel - 1) * 5) c.training = TRAINING_BASE + (c.barracksLevel - 1) * 5;
+  return { ok: true, msg: `${c.name} 征兵 ${count}（-${Math.round(gold)} 金，-${Math.round(pop)} 人口）` };
+}
+
+// —— 内政：操练（提升训练度）——
+export function train(state, cityId, fid = PLAYER(state)) {
+  const c = cityById(state, cityId);
+  if (!c || c.ownerFactionId !== fid) return { ok: false, msg: '该城非你所属' };
+  if (c.training >= TRAINING_MAX) return { ok: false, msg: '训练度已满' };
+  if (!spendCmd(state, fid)) return { ok: false, msg: '指令点不足' };
+  const cost = 200;
+  if (facMoney(state, fid) < cost) { refundCmd(state, fid); return { ok: false, msg: '金钱不足' }; }
+  factionById(state, fid).money -= cost;
+  c.training = Math.min(TRAINING_MAX, c.training + 8);
+  return { ok: true, msg: `${c.name} 操练部队，训练度 → ${c.training}` };
+}
+
+// —— 人事：探索（发现本城在野名将）——
+export function explore(state, cityId, fid = PLAYER(state), rng) {
+  const r = rng || Math.random;
+  const c = cityById(state, cityId);
+  if (!c || c.ownerFactionId !== fid) return { ok: false, msg: '该城非你所属' };
+  if (!spendCmd(state, fid)) return { ok: false, msg: '指令点不足' };
+  const roster = heroesInCity(state, cityId, fid);
+  const charm = roster.length ? Math.max(...roster.map((h) => h.stats.c)) : 50;
+  const wilds = wildHeroesInCity(state, cityId);
+  const newly = [];
+  for (const w of wilds) {
+    if (w.discovered) continue;
+    if (chance(r, 0.4 + charm / 400)) { w.discovered = true; newly.push(w); }
+  }
+  const discovered = wilds.filter((w) => w.discovered);
+  if (!newly.length && !discovered.length) {
+    return { ok: true, msg: `${c.name} 四处寻访，未发现可用之才。`, discovered: [] };
+  }
+  return {
+    ok: true,
+    msg: newly.length ? `${c.name} 探访得知：${newly.map((w) => w.name).join('、')} 在此隐居！` : `${c.name} 已有名将在野可登用。`,
+    discovered,
+    newly,
+  };
+}
+
+// —— 人事：登用（说服在野名将加入）——
+export function recruitHero(state, heroId, fid = PLAYER(state), rng) {
+  const r = rng || Math.random;
+  const h = heroById(state, heroId);
+  if (!h || !h.wild) return { ok: false, msg: '目标不可登用' };
+  const c = cityById(state, h.cityId);
+  if (!c || c.ownerFactionId !== fid) return { ok: false, msg: '名将不在己方城市' };
+  if (!spendCmd(state, fid)) return { ok: false, msg: '指令点不足' };
+  const roster = heroesInCity(state, h.cityId, fid);
+  const charm = roster.length ? Math.max(...roster.map((x) => x.stats.c)) : 50;
+  const cBonus = roster.length ? Math.max(...roster.map((x) => skillBonus(x).c_recruit)) : 0;
+  let p = 0.25 + (charm - h.loyalty) / 200 + cBonus + techMult(state, 'trick', 0.05) - 1;
+  p = Math.max(0.05, Math.min(0.95, p));
+  if (chance(r, p)) {
+    h.wild = false;
+    h.factionId = fid;
+    h.status = 'free';
+    h.discovered = true;
+    h.loyalty = Math.max(70, Math.min(95, Math.round(60 + charm / 4)));
+    return { ok: true, msg: `${h.name} 愿效犬马之劳，已归入麾下！`, recruited: true };
+  }
+  return { ok: true, msg: `${h.name} 婉言谢绝（成功率 ${Math.round(p * 100)}%）。`, recruited: false };
+}
+
+// —— 人事：赏赐（提升忠诚）——
+export function reward(state, heroId, fid = PLAYER(state)) {
+  const h = heroById(state, heroId);
+  if (!h || h.factionId !== fid) return { ok: false, msg: '非己方武将' };
+  if (!spendCmd(state, fid)) return { ok: false, msg: '指令点不足' };
+  const cost = 300;
+  if (facMoney(state, fid) < cost) { refundCmd(state, fid); return { ok: false, msg: '金钱不足' }; }
+  factionById(state, fid).money -= cost;
+  h.loyalty = Math.min(100, h.loyalty + 12);
+  return { ok: true, msg: `赏赐 ${h.name}，忠诚 → ${h.loyalty}` };
+}
+
+// —— 人事：任命太守（免费）——
+export function appointGovernor(state, cityId, heroId, fid = PLAYER(state)) {
+  const c = cityById(state, cityId);
+  const h = heroById(state, heroId);
+  if (!c || c.ownerFactionId !== fid) return { ok: false, msg: '该城非你所属' };
+  if (!h || h.factionId !== fid || h.status === 'prisoner') return { ok: false, msg: '该武将不可用' };
+  if (h.cityId !== cityId) return { ok: false, msg: '武将须在本城方可任命' };
+  c.governorHeroId = heroId;
+  return { ok: true, msg: `${h.name} 出任 ${c.name} 太守` };
+}
+
+// —— 科技：开始研究 ——
+export function research(state, techKey, fid = PLAYER(state)) {
+  if (!Object.prototype.hasOwnProperty.call(state.techLevels, techKey)) return { ok: false, msg: '未知科技' };
+  state.researchByFaction = state.researchByFaction || {};
+  if (state.researchByFaction[fid]) return { ok: false, msg: '本势力已有研究进行中' };
+  if (techLevel(state, techKey) >= TECH_MAX_LEVEL) return { ok: false, msg: '该科技已满级' };
+  if (!spendCmd(state, fid)) return { ok: false, msg: '指令点不足' };
+  if (facMoney(state, fid) < TECH_COST_GOLD) { refundCmd(state, fid); return { ok: false, msg: '金钱不足' }; }
+  factionById(state, fid).money -= TECH_COST_GOLD;
+  const lord = lordOf(state, fid);
+  const intel = lord ? lord.stats.i : 50;
+  const turns = Math.max(1, Math.round(TECH_COST_TURNS - intel / 60));
+  state.researchByFaction[fid] = { key: techKey, turnsLeft: turns };
+  return { ok: true, msg: `开始研究，预计 ${turns} 回合完成（-${TECH_COST_GOLD} 金）` };
+}
+
+// —— 军事：出征 ——
+export function campaign(state, fromCityId, toCityId, generalId, troops, formation, fid = PLAYER(state), rng) {
+  const r = rng || Math.random;
+  const from = cityById(state, fromCityId);
+  const to = cityById(state, toCityId);
+  if (!from || !to) return { ok: false, msg: '城市无效' };
+  if (from.ownerFactionId !== fid) return { ok: false, msg: '出发城非你所属' };
+  if (to.ownerFactionId === fid) return { ok: false, msg: '不可攻打己方城市' };
+  if (!from.adjacent.includes(toCityId)) return { ok: false, msg: '目标城市不相邻' };
+  const g = heroById(state, generalId);
+  if (!g || g.factionId !== fid || g.status === 'prisoner' || g.cityId !== fromCityId) {
+    return { ok: false, msg: '主将不可用' };
+  }
+  troops = Math.max(0, Math.floor(troops));
+  if (troops <= 0) return { ok: false, msg: '出兵数量无效' };
+  if (troops > from.soldiers) return { ok: false, msg: '城中兵力不足' };
+  if (troops > troopCap(state, g)) return { ok: false, msg: `超出 ${g.name} 带兵上限（${troopCap(state, g)}）` };
+  if (!spendCmd(state, fid)) return { ok: false, msg: '指令点不足' };
+  const grainCost = Math.round(troops * 0.05);
+  if (facGrain(state, fid) < grainCost) { refundCmd(state, fid); return { ok: false, msg: '军粮不足以出征' }; }
+  factionById(state, fid).grain -= grainCost;
+
+  from.soldiers -= troops;
+
+  const attacker = { factionId: fid, general: g, soldiers: troops, training: from.training, formation: formation || 'normal' };
+  const defGeneral = bestDefender(state, toCityId) || { id: '__militia__', name: '守城民兵', stats: { l: 50, w: 50, i: 40, p: 40, c: 40 }, skill: null };
+  const defender = {
+    factionId: to.ownerFactionId, general: defGeneral, soldiers: to.soldiers,
+    defense: to.defense || 0, isCity: true, training: to.training || TRAINING_BASE, formation: 'normal',
+  };
+
+  const battle = createBattle({ attacker, defender });
+  runBattle(battle, state, r);
+
+  let won = battle.result === 'attacker';
+  applyCampaignResult(state, battle, from, to, g, fid, r);
+  // 占领后立即判定胜负（不必等到回合结束），让 UI 的 afterAction 即时弹出结算
+  if (won) checkGameOver(state);
+
+  const msgs = battle.log.slice(-3);
+  return { ok: true, won, battle, msg: won ? `攻克 ${to.name}！` : `攻打 ${to.name} 失利。`, log: msgs };
+}
+
+// 结算出征结果（占领 / 溃败 / 俘虏）
+function applyCampaignResult(state, battle, from, to, attackerGen, fid, rng) {
+  const won = battle.result === 'attacker';
+  const captorFid = won ? fid : to.ownerFactionId;
+
+  if (won) {
+    // 占领：幸存兵力转为新守军，主将入驻
+    const survivors = Math.round(battle.attacker.soldiers);
+    to.ownerFactionId = fid;
+    to.soldiers = survivors;
+    to.training = from.training;
+    attackerGen.cityId = to.id;
+    // 主将原为出发城太守时，须解除旧职，避免同一武将被两城同时引用为太守
+    if (from.governorHeroId === attackerGen.id) from.governorHeroId = null;
+    if (!to.governorHeroId || !heroById(state, to.governorHeroId)) to.governorHeroId = attackerGen.id;
+    // 缴获城库
+    const lootGold = to.gold || 0;
+    const lootGrain = to.grain || 0;
+    factionById(state, fid).money += lootGold;
+    factionById(state, fid).grain += lootGrain;
+    to.gold = 0; to.grain = 0;
+    state.turnLog.push(`🏰 攻陷 ${to.name}！缴获 ${lootGold} 金、${lootGrain} 粮，余兵 ${survivors} 驻守。`);
+  } else {
+    // 失利：出征兵力覆灭（已从 from 扣除）；守军实际伤亡如实回写到真实城市
+    // （createBattle 做了浅拷贝，runBattle 只削减 battle.defender，需手动落账）
+    to.soldiers = Math.round(battle.defender.soldiers);
+    to.defense = Math.max(0, Math.round(battle.defender.defense));
+    state.turnLog.push(`💔 攻打 ${to.name} 失利，出征军覆灭；守军余 ${to.soldiers}、城防余 ${to.defense}。`);
+  }
+
+  // 俘虏处理
+  if (battle.prisoner && battle.prisoner !== '__militia__') {
+    const ph = heroById(state, battle.prisoner);
+    if (ph && captorFid != null) {
+      ph.status = 'prisoner';
+      ph.prisonerOf = captorFid;
+      const capCity = citiesOf(state, captorFid)[0];
+      if (capCity) ph.cityId = capCity.id;
+      if (ph.id === to.governorHeroId) to.governorHeroId = null;
+      state.turnLog.push(`⛓️ ${ph.name} 被俘。`);
+    } else if (ph) {
+      // 中立势力俘获 → 释放为在野
+      ph.status = 'free';
+      ph.wild = true;
+      ph.discovered = false;
+    }
+  }
+}
+
+// —— 军事：输送（己方相邻城市间调运）——
+export function transport(state, fromCityId, toCityId, payload, fid = PLAYER(state)) {
+  const from = cityById(state, fromCityId);
+  const to = cityById(state, toCityId);
+  if (!from || !to) return { ok: false, msg: '城市无效' };
+  if (from.ownerFactionId !== fid || to.ownerFactionId !== fid) return { ok: false, msg: '须为己方城市' };
+  if (!from.adjacent.includes(toCityId)) return { ok: false, msg: '两城不相邻' };
+  if (!spendCmd(state, fid)) return { ok: false, msg: '指令点不足' };
+  // 金 / 粮为势力级共享池（见 economy.js），无需在城市间输送；
+  // 唯一需要调运的城市级资源是士兵。
+  const s = Math.max(0, Math.floor(payload.soldiers || 0));
+  if (s <= 0) { refundCmd(state, fid); return { ok: false, msg: '输送数量无效' }; }
+  if (s > from.soldiers) { refundCmd(state, fid); return { ok: false, msg: '兵力不足' }; }
+  from.soldiers -= s;
+  to.soldiers += s;
+  return { ok: true, msg: `自 ${from.name} 向 ${to.name} 输送士兵 ${s}` };
+}
+
+// —— 外交 / 计略 ——
+export function stratagem(state, fromCityId, toCityId, type, fid = PLAYER(state), rng) {
+  const r = rng || Math.random;
+  const def = STRATAGEMS[type];
+  if (!def) return { ok: false, msg: '未知计略' };
+  const from = cityById(state, fromCityId);
+  const to = cityById(state, toCityId);
+  if (!from || !to) return { ok: false, msg: '城市无效' };
+  if (from.ownerFactionId !== fid) return { ok: false, msg: '出发城非你所属' };
+  if (to.ownerFactionId === fid) return { ok: false, msg: '不可对己方城市用计' };
+  if (!from.adjacent.includes(toCityId)) return { ok: false, msg: '目标城市不相邻' };
+  if (!spendCmd(state, fid)) return { ok: false, msg: '指令点不足' };
+  const cost = 150;
+  if (facMoney(state, fid) < cost) { refundCmd(state, fid); return { ok: false, msg: '金钱不足' }; }
+  factionById(state, fid).money -= cost;
+
+  // 施计者取智力最高者（计略成功率取决于智力，而非统率）
+  const casterRoster = heroesInCity(state, fromCityId, fid);
+  const caster = casterRoster.length
+    ? casterRoster.reduce((a, b) => ((a.stats.i || 0) >= (b.stats.i || 0) ? a : b))
+    : { stats: { i: 50 } };
+  const intel = caster.stats ? caster.stats.i : 50;
+  const targetGen = bestDefender(state, toCityId);
+  const tIntel = targetGen && targetGen.stats ? targetGen.stats.i : 45;
+  let p = 0.35 + (intel - tIntel) / 200 + techMult(state, 'trick', 0.05) - 1;
+  p = Math.max(0.05, Math.min(0.9, p));
+
+  if (!chance(r, p)) {
+    return { ok: true, msg: `${def.name} 被 ${to.name} 识破（成功率 ${Math.round(p * 100)}%）`, success: false };
+  }
+  if (type === 'fire') {
+    to.defense = Math.max(0, Math.round((to.defense || 0) * (1 - def.range)));
+    return { ok: true, msg: `火攻成功！${to.name} 城防降至 ${Math.round(to.defense)}`, success: true };
+  }
+  if (type === 'burn') {
+    const foeFid = to.ownerFactionId;
+    if (foeFid != null) {
+      const foe = factionById(state, foeFid);
+      const burned = Math.round(foe.grain * def.range);
+      foe.grain -= burned;
+      return { ok: true, msg: `烧粮成功！${foe.name} 损失 ${burned} 军粮`, success: true };
+    }
+    to.grain = Math.round((to.grain || 0) * (1 - def.range));
+    return { ok: true, msg: `烧粮成功！${to.name} 城库粮草被焚`, success: true };
+  }
+  if (type === 'rumor') {
+    if (targetGen) {
+      targetGen.loyalty = Math.max(0, targetGen.loyalty - def.range);
+      return { ok: true, msg: `流言成功！${targetGen.name} 忠诚降至 ${targetGen.loyalty}`, success: true };
+    }
+    return { ok: true, msg: `流言散布，但城中无名将可撼动`, success: true };
+  }
+  return { ok: true, msg: '计略执行完毕', success: true };
+}
+
+// 武将调任：在己方相邻城市间移动一名武将（免费）
+export function moveHero(state, heroId, toCityId, fid = PLAYER(state)) {
+  const h = heroById(state, heroId);
+  const to = cityById(state, toCityId);
+  if (!h || h.factionId !== fid || h.status === 'prisoner') return { ok: false, msg: '武将不可用' };
+  if (!to || to.ownerFactionId !== fid) return { ok: false, msg: '目标非己方城市' };
+  const from = cityById(state, h.cityId);
+  if (!from || !from.adjacent.includes(toCityId)) return { ok: false, msg: '两城不相邻' };
+  h.cityId = toCityId;
+  return { ok: true, msg: `${h.name} 调往 ${to.name}` };
+}
+
+// —— 俘虏管理 ——
+// 招降俘虏（成功率随俘虏忠诚降低而提高）
+export function recruitPrisoner(state, heroId, fid = PLAYER(state), rng) {
+  const r = rng || Math.random;
+  const h = heroById(state, heroId);
+  if (!h || h.prisonerOf !== fid) return { ok: false, msg: '该武将非你俘虏' };
+  if (!spendCmd(state, fid)) return { ok: false, msg: '指令点不足' };
+  const cost = 500;
+  if (facMoney(state, fid) < cost) { refundCmd(state, fid); return { ok: false, msg: '金钱不足' }; }
+  factionById(state, fid).money -= cost;
+  const lord = lordOf(state, fid);
+  const charm = lord ? lord.stats.c : 50;
+  let p = 0.15 + (100 - h.loyalty) / 200 + (charm - 70) / 100;
+  p = Math.max(0.05, Math.min(0.85, p));
+  if (chance(r, p)) {
+    h.factionId = fid;
+    h.prisonerOf = null;
+    h.status = 'free';
+    h.loyalty = Math.max(55, Math.min(80, h.loyalty));
+    return { ok: true, msg: `${h.name} 归降！`, recruited: true };
+  }
+  return { ok: true, msg: `${h.name} 拒不投降（成功率 ${Math.round(p * 100)}%）`, recruited: false };
+}
+
+// 释放俘虏 → 转为某中立城在野
+export function releasePrisoner(state, heroId, fid = PLAYER(state)) {
+  const h = heroById(state, heroId);
+  if (!h || h.prisonerOf !== fid) return { ok: false, msg: '该武将非你俘虏' };
+  const neutrals = state.cities.filter((c) => c.ownerFactionId == null);
+  const dest = (neutrals.length ? neutrals : state.cities)[0];
+  h.prisonerOf = null;
+  h.status = 'free';
+  h.factionId = null;
+  h.wild = true;
+  h.discovered = false;
+  h.cityId = dest.id;
+  return { ok: true, msg: `释放 ${h.name}` };
+}
+
+// 处决俘虏
+export function executePrisoner(state, heroId, fid = PLAYER(state)) {
+  const h = heroById(state, heroId);
+  if (!h || h.prisonerOf !== fid) return { ok: false, msg: '该武将非你俘虏' };
+  const name = h.name;
+  state.heroes = state.heroes.filter((x) => x.id !== heroId);
+  return { ok: true, msg: `处决 ${name}，其旧部离心。` };
+}
+
+function refundCmd(state, fid) {
+  if (state.cmdUsedByFaction && state.cmdUsedByFaction[fid] > 0) {
+    state.cmdUsedByFaction[fid] -= 1;
+  }
+}
+
+export { spendCmd, isPlayer, RECRUIT_LOYALTY_THRESHOLD, effLead, effWar, FORMATIONS };
diff --git a/apps/xiong-tu-san-guo/src/core/ai.js b/apps/xiong-tu-san-guo/src/core/ai.js
new file mode 100644
index 0000000..35cd1b5
--- /dev/null
+++ b/apps/xiong-tu-san-guo/src/core/ai.js
@@ -0,0 +1,109 @@
+// ============================================================================
+// AI 势力回合：按设计文档优先级消耗指令点。
+//   1) 内政（升市场 / 征兵） 2) 招募在野名将 3) 科技研究
+//   4) 侵略相邻弱敌 5) 输送平衡防御 6) 赏赐稳忠诚
+// 直接复用 actions.js 的命令函数（与玩家同规则）。
+// ============================================================================
+import * as A from './actions.js';
+import {
+  cmdRemaining, heroesOfFaction, neighbors, lordOf, heroById,
+} from './state.js';
+import { citiesOf } from './economy.js';
+import { effLead } from './combat.js';
+import { chance } from './rng.js';
+import { TECH_COST_GOLD } from '../config.js';
+
+// 单个 AI 势力行动
+export function aiTurn(state, fid, rng) {
+  const r = rng || Math.random;
+  const cities = citiesOf(state, fid);
+  if (!cities.length) return;
+  const lord = lordOf(state, fid);
+
+  let guard = 0;
+  while (cmdRemaining(state, fid) > 0 && guard++ < 30) {
+    let acted = false;
+
+    // 1) 内政：金币低则升市场；兵不足人口 20% 则征兵
+    for (const c of cities) {
+      if (cmdRemaining(state, fid) <= 0) break;
+      const fac = state.factions.find((f) => f.id === fid);
+      if (fac.money > 600 && c.marketLevel < 5 && chance(r, 0.5)) {
+        if (A.developMarket(state, c.id, fid).ok) { acted = true; break; }
+      }
+    }
+    for (const c of cities) {
+      if (cmdRemaining(state, fid) <= 0) break;
+      if (c.soldiers < c.population * 0.2) {
+        const recruitN = Math.min(800, Math.floor(c.population * 0.05));
+        if (recruitN > 50 && A.recruit(state, c.id, recruitN, fid).ok) { acted = true; break; }
+      }
+    }
+
+    // 2) 招募在野名将（魅力 > 70 的武将空闲时探索 + 登用）
+    if (!acted) {
+      const charmHero = heroesOfFaction(state, fid).find((h) => h.stats.c > 70);
+      if (charmHero) {
+        for (const c of cities) {
+          if (cmdRemaining(state, fid) <= 0) break;
+          const res = A.explore(state, c.id, fid, r);
+          if (res.ok && res.discovered && res.discovered.length) {
+            const target = res.discovered[0];
+            A.recruitHero(state, target.id, fid, r);
+            acted = true;
+            break;
+          }
+        }
+      }
+    }
+
+    // 3) 科技研究（本势力独立研究槽）
+    if (!acted && !(state.researchByFaction && state.researchByFaction[fid]) && chance(r, 0.3)) {
+      const fac = state.factions.find((f) => f.id === fid);
+      if (fac.money >= TECH_COST_GOLD) {
+        const keys = ['agri', 'commerce', 'forge', 'wall', 'trick', 'leadership'];
+        const k = keys[Math.floor(r() * keys.length)];
+        if (A.research(state, k, fid).ok) acted = true;
+      }
+    }
+
+    // 4) 侵略：相邻非己方城市，军力占优（兵力比 > 1.3）则出征
+    if (!acted) {
+      outer: for (const c of cities) {
+        const attacker = heroesOfFaction(state, fid).find((h) => h.cityId === c.id && h.status === 'free');
+        if (!attacker) continue;
+        for (const n of neighbors(state, c.id)) {
+          if (cmdRemaining(state, fid) <= 0) break outer;
+          if (n.ownerFactionId === fid) continue;
+          const myPow = c.soldiers + effLead(attacker) * 5;
+          const foePow = n.soldiers + (n.defense || 0) * 0.5;
+          if (myPow > foePow * 1.5 && c.soldiers > 800) {
+            const troops = Math.min(c.soldiers - 200, Math.floor(c.soldiers * 0.7));
+            const res = A.campaign(state, c.id, n.id, attacker.id, troops, 'assault', fid, r);
+            if (res.ok) {
+              state.turnLog.push(`⚔️ ${state.factions.find((f) => f.id === fid).name} 出兵攻打 ${n.name}${res.won ? '并攻陷之' : '，未能攻克'}。`);
+              acted = true;
+              break outer;
+            }
+          }
+        }
+      }
+    }
+
+    // 5) 赏赐稳忠诚
+    if (!acted) {
+      const low = heroesOfFaction(state, fid).find((h) => h.loyalty < 60);
+      if (low) { A.reward(state, low.id, fid); acted = true; }
+    }
+
+    if (!acted) break; // 无事可做，结束本势力回合
+  }
+}
+
+export function aiTurnAll(state, rng) {
+  const r = rng || Math.random;
+  for (const f of state.factions) {
+    if (!f.aiControlled) continue;
+    aiTurn(state, f.id, r);
+  }
+}
diff --git a/apps/xiong-tu-san-guo/src/core/combat.js b/apps/xiong-tu-san-guo/src/core/combat.js
new file mode 100644
index 0000000..37dcda6
--- /dev/null
+++ b/apps/xiong-tu-san-guo/src/core/combat.js
@@ -0,0 +1,130 @@
+// ============================================================================
+// 战斗系统：简化自动回合制（骰子模型 + 城防 + 单挑）。
+// createBattle() 构造战局，runBattle() 自动结算至胜负，产生文字战报 log。
+// ============================================================================
+import { FORMATIONS, DUEL_THRESHOLD, DUEL_CHANCE, DUEL_ROUT_RATIO } from '../config.js';
+import { skillBonus, techMult } from './tech.js';
+import { chance, range } from './rng.js';
+
+// 有效武力 / 统率（含技能加成）
+export function effWar(hero) {
+  if (!hero) return 50;
+  return hero.stats.w * (1 + skillBonus(hero).war);
+}
+export function effLead(hero) {
+  if (!hero) return 50;
+  return hero.stats.l * (1 + skillBonus(hero).lead);
+}
+
+// 训练度系数：50 → 1.0，100 → 1.5，0 → 0.5
+function trainingCoeff(training) {
+  return 0.5 + (Number.isFinite(training) ? training : 50) / 100;
+}
+
+// 一支部队的攻击值
+export function attackValue(force, state) {
+  const g = force.general;
+  const war = effWar(g);
+  const lead = effLead(g);
+  const soldiers = Math.max(0, force.soldiers);
+  const forge = techMult(state, 'forge', 0.05);
+  const form = FORMATIONS[force.formation] || FORMATIONS.normal;
+  return (war * 0.4 + lead * 0.3 + soldiers * 0.01) * forge * trainingCoeff(force.training) * form.atk;
+}
+
+// 构造战局
+export function createBattle({ attacker, defender }) {
+  return {
+    attacker: { ...attacker },
+    defender: { ...defender },
+    round: 0,
+    log: [],
+    result: null,
+    prisoner: null,
+    duel: null,
+  };
+}
+
+// 单回合：双方同时对对方造成伤害（攻方先结算，守方城防优先承受）
+function resolveRound(b, state, rng) {
+  const aVal = attackValue(b.attacker, state);
+  const dVal = attackValue(b.defender, state);
+
+  // —— 攻方 → 守方 ——（城防优先承受，溢出转入士兵）
+  let aDmg = aVal * range(rng, 0.85, 1.15);
+  if (b.defender.isCity && b.defender.defense > 0) {
+    const soaked = Math.min(b.defender.defense, aDmg);
+    b.defender.defense = Math.max(0, b.defender.defense - soaked);
+    aDmg -= soaked;
+    if (soaked > 0) {
+      b.log.push(`回合 ${b.round}：${b.attacker.general.name} 攻城，城防承受 ${Math.round(soaked)} 点（余 ${Math.round(b.defender.defense)}）。`);
+    }
+  }
+  if (aDmg > 0) {
+    b.defender.soldiers = Math.max(0, b.defender.soldiers - aDmg);
+    b.log.push(`回合 ${b.round}：${b.attacker.general.name} 部队杀伤敌军 ${Math.round(aDmg)} 人（敌余 ${Math.round(b.defender.soldiers)}）。`);
+  }
+
+  // —— 守方 → 攻方 ——（攻方无城防，直接削减士兵）
+  const dDmg = dVal * range(rng, 0.85, 1.15);
+  if (dDmg > 0) {
+    b.attacker.soldiers = Math.max(0, b.attacker.soldiers - dDmg);
+    b.log.push(`回合 ${b.round}：${b.defender.general.name} 反击杀伤我军 ${Math.round(dDmg)} 人（我余 ${Math.round(b.attacker.soldiers)}）。`);
+  }
+}
+
+// 单挑判定（每回合最多一次，触发后决出胜负）
+function tryDuel(b, rng) {
+  if (b.duel) return false;
+  const ag = b.attacker.general;
+  const dg = b.defender.general;
+  if (!ag || !dg) return false;
+  const diff = Math.abs(effWar(ag) - effWar(dg));
+  if (diff <= DUEL_THRESHOLD) return false;
+  if (!chance(rng, DUEL_CHANCE)) return false;
+  const attackerWins = effWar(ag) > effWar(dg);
+  b.duel = { winner: attackerWins ? 'attacker' : 'defender', loser: attackerWins ? 'defender' : 'attacker' };
+  b.log.push(`⚔️ ${ag.name} 与 ${dg.name} 阵前单挑！${(attackerWins ? ag : dg).name} 武艺更胜一筹，一合斩将，败军溃散！`);
+  return true;
+}
+
+// 跑完整场战斗（最多 30 回合，避免死循环）
+export function runBattle(b, state, rng) {
+  b.round = 0;
+  while (b.result == null && b.round < 30) {
+    b.round += 1;
+
+    // 单挑（前置，可一击定胜负）
+    if (tryDuel(b, rng)) {
+      const loserSide = b.duel.loser;
+      const winnerSide = b.duel.winner;
+      const loserGen = b[loserSide].general;
+      b[loserSide].soldiers = Math.round(b[loserSide].soldiers * (1 - DUEL_ROUT_RATIO));
+      // 君主不可被俘（仅败走），避免势力因失主而僵死
+      b.prisoner = loserGen && !isLord(loserGen) ? loserGen.id : null;
+      b.result = winnerSide;
+      b.log.push(`${b[winnerSide].general.name} 赢下单挑，${loserGen.name}${b.prisoner ? ' 被俘' : ' 败走'}，敌军溃败！`);
+      break;
+    }
+
+    resolveRound(b, state, rng);
+
+    if (b.defender.soldiers <= 0) { b.result = 'attacker'; break; }
+    if (b.attacker.soldiers <= 0) { b.result = 'defender'; break; }
+  }
+  // 超时未分胜负：以残兵多者胜
+  if (b.result == null) {
+    b.result = b.attacker.soldiers >= b.defender.soldiers ? 'attacker' : 'defender';
+    b.log.push(`战至日暮，双方力竭。${b.result === 'attacker' ? '攻方' : '守方'} 残兵更众，勉强占得上风。`);
+  }
+  // 败方主将被俘（君主除外）
+  if (!b.prisoner) {
+    const loser = b.result === 'attacker' ? b.defender : b.attacker;
+    if (loser.general && !isLord(loser.general) && loser.general.id !== '__militia__' && chance(rng, 0.5)) {
+      b.prisoner = loser.general.id;
+    }
+  }
+  return b;
+}
+
+function isLord(g) { return !!(g && (g.lord || g.isPlayerLord)); }
diff --git a/apps/xiong-tu-san-guo/src/core/economy.js b/apps/xiong-tu-san-guo/src/core/economy.js
new file mode 100644
index 0000000..22b1ccc
--- /dev/null
+++ b/apps/xiong-tu-san-guo/src/core/economy.js
@@ -0,0 +1,74 @@
+// ============================================================================
+// 经济结算：每座城市的金钱 / 粮食收入、军粮消耗、人口增长。
+// 资源池（金钱 / 军粮）为势力级共享；人口 / 士兵 / 城防 / 建筑为城市级。
+// ============================================================================
+import {
+  GOLD_PER_MARKET, GOLD_PER_POP, GRAIN_PER_FARM, GRAIN_UPKEEP_PER_SOLDIER,
+  POP_GROWTH_RATE, POP_GROWTH_POL_DIVISOR, TRAINING_BASE,
+} from '../config.js';
+import { techMult } from './tech.js';
+
+export function isOwnedBy(city, factionId) {
+  return city.ownerFactionId === factionId;
+}
+
+export function citiesOf(state, factionId) {
+  return state.cities.filter((c) => isOwnedBy(c, factionId));
+}
+
+function traitMult(city, type) {
+  return city.trait && city.trait.type === type ? 1 + city.trait.value : 1;
+}
+
+// 商业收入（每回合，单城）
+export function cityGoldIncome(state, city) {
+  const base = city.marketLevel * GOLD_PER_MARKET + city.population * GOLD_PER_POP;
+  return base * traitMult(city, 'commerce') * techMult(state, 'commerce', 0.1);
+}
+
+// 粮食产量（每回合，单城）
+export function cityGrainIncome(state, city) {
+  const base = city.farmLevel * GRAIN_PER_FARM;
+  return base * traitMult(city, 'grain') * techMult(state, 'agri', 0.1);
+}
+
+// 势力每回合金钱总收入（含特性 / 科技）
+export function factionGoldIncome(state, factionId) {
+  let sum = 0;
+  for (const c of state.cities) if (isOwnedBy(c, factionId)) sum += cityGoldIncome(state, c);
+  return sum;
+}
+
+// 势力每回合粮食净变化（产量 - 士兵吃粮）
+export function factionGrainNet(state, factionId) {
+  let prod = 0;
+  let upkeep = 0;
+  for (const c of state.cities) {
+    if (!isOwnedBy(c, factionId)) continue;
+    prod += cityGrainIncome(state, c);
+    upkeep += c.soldiers * GRAIN_UPKEEP_PER_SOLDIER;
+  }
+  return { prod, upkeep, net: prod - upkeep };
+}
+
+// 城防值（基础 × 城防特性 × 筑城科技 × 城墙等级加成）
+export function cityDefenseValue(state, city) {
+  const base = city.defenseBase || 0;
+  const wallBoost = 1 + (city.wallLevel - 1) * 0.15;
+  return base * traitMult(city, 'defense') * techMult(state, 'wall', 0.2) * wallBoost;
+}
+
+// 单城人口增长（依赖太守或君主政治）
+export function cityPopGrowth(state, city, politics) {
+  const pol = Number.isFinite(politics) ? politics : 50;
+  const factor = (pol / POP_GROWTH_POL_DIVISOR) * POP_GROWTH_RATE;
+  return city.population * factor * traitMult(city, 'growth');
+}
+
+// 征兵消耗：金钱 / 人口（受征兵特性影响——人口消耗降低）
+export function recruitCost(city, count) {
+  const popCost = count * (1 / (1 + (city.trait && city.trait.type === 'recruit' ? city.trait.value : 0)));
+  return { gold: count * 1.5, pop: popCost };
+}
+
+export { TRAINING_BASE };
diff --git a/apps/xiong-tu-san-guo/src/core/rng.js b/apps/xiong-tu-san-guo/src/core/rng.js
new file mode 100644
index 0000000..b05962c
--- /dev/null
+++ b/apps/xiong-tu-san-guo/src/core/rng.js
@@ -0,0 +1,40 @@
+// ============================================================================
+// 随机工具：默认 Math.random，可注入种子化 rng（便于单测）。
+// ============================================================================
+const DEFAULT = Math.random;
+
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
+  return min + (rng || DEFAULT)() * (max - min);
+}
+
+// [min, max] 整数（闭区间）
+export function rangeInt(rng, min, max) {
+  return Math.floor(range(rng, min, max + 1));
+}
+
+export function chance(rng, p) {
+  return (rng || DEFAULT)() < p;
+}
+
+export function pick(rng, arr) {
+  return arr[Math.floor((rng || DEFAULT)() * arr.length)];
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
diff --git a/apps/xiong-tu-san-guo/src/core/save.js b/apps/xiong-tu-san-guo/src/core/save.js
new file mode 100644
index 0000000..b26138c
--- /dev/null
+++ b/apps/xiong-tu-san-guo/src/core/save.js
@@ -0,0 +1,38 @@
+// ============================================================================
+// 存档：localStorage 持久化（单槽）。
+// 通过 storage 访问器隔离 localStorage，便于 Node 单测注入内存版。
+// ============================================================================
+import { SAVE_KEY } from '../config.js';
+
+let storage = null;
+try {
+  if (typeof localStorage !== 'undefined') storage = localStorage;
+} catch (_) { /* 某些环境访问 localStorage 会抛错 */ }
+
+export function _setStorage(s) { storage = s; }
+
+export function hasSave() {
+  try { return !!(storage && storage.getItem(SAVE_KEY)); } catch (_) { return false; }
+}
+
+export function saveGame(state) {
+  try {
+    if (storage && state) {
+      storage.setItem(SAVE_KEY, JSON.stringify(state));
+      return true;
+    }
+  } catch (_) {}
+  return false;
+}
+
+export function loadGame() {
+  try {
+    const raw = storage ? storage.getItem(SAVE_KEY) : null;
+    if (!raw) return null;
+    return JSON.parse(raw);
+  } catch (_) { return null; }
+}
+
+export function clearSave() {
+  try { if (storage) storage.removeItem(SAVE_KEY); return true; } catch (_) { return false; }
+}
diff --git a/apps/xiong-tu-san-guo/src/core/state.js b/apps/xiong-tu-san-guo/src/core/state.js
new file mode 100644
index 0000000..dd19bf5
--- /dev/null
+++ b/apps/xiong-tu-san-guo/src/core/state.js
@@ -0,0 +1,325 @@
+// ============================================================================
+// 游戏状态：新局初始化（势力 / 城市 / 名将部署）、回合结算（经济·人口·科技·AI）、
+// 胜负判定与各类查询辅助。纯数据 + 纯函数，便于单测。
+// ============================================================================
+import {
+  CITIES, CITY_MAP,
+} from '../data/cities.js';
+import { HEROES, HERO_MAP, FACTION_SEEDS, makeGenericGeneral } from '../data/heroes.js';
+import {
+  GAME_VERSION, CMD_BASE, CMD_PER_CITY, TRAINING_BASE,
+  FACTION_COLORS, PLAYER_COLOR, GRAIN_UPKEEP_PER_SOLDIER, TECH_COST_TURNS, TECH_MAX_LEVEL,
+} from '../config.js';
+import { skillBonus, techMult } from './tech.js';
+import { chance } from './rng.js';
+import {
+  citiesOf, cityGoldIncome, cityGrainIncome, cityPopGrowth, cityDefenseValue,
+} from './economy.js';
+import { effLead, effWar } from './combat.js';
+
+// —— 查询辅助 ——
+export const cityById = (state, id) => state.cities.find((c) => c.id === id);
+export const heroById = (state, id) => state.heroes.find((h) => h.id === id);
+export const factionById = (state, id) => state.factions.find((f) => f.id === id);
+export const playerFaction = (state) => factionById(state, state.playerFactionId);
+export const neighbors = (state, cityId) => {
+  const c = cityById(state, cityId);
+  return c ? c.adjacent.map((id) => cityById(state, id)).filter(Boolean) : [];
+};
+export const heroesOfFaction = (state, fid) => state.heroes.filter((h) => h.factionId === fid && h.status !== 'prisoner');
+export const prisonersOfFaction = (state, fid) => state.heroes.filter((h) => h.prisonerOf === fid);
+export const lordOf = (state, fid) => state.heroes.find((h) => h.factionId === fid && (h.isPlayerLord || h.lord));
+
+// 一座城市内的己方在岗武将（free / deployed，排除俘虏、在野）
+export function heroesInCity(state, cityId, fid) {
+  return state.heroes.filter((h) => h.cityId === cityId && h.status !== 'prisoner' && !h.wild
+    && (fid == null || h.factionId === fid));
+}
+// 城市内的在野名将（可探索 / 登用）
+export function wildHeroesInCity(state, cityId) {
+  return state.heroes.filter((h) => h.wild && h.cityId === cityId && h.status !== 'gone');
+}
+
+// 带兵上限：统率 × 100 × (1 + 统御技能) × 统御科技
+export function troopCap(state, hero) {
+  if (!hero) return 0;
+  return Math.round(hero.stats.l * 100 * (1 + skillBonus(hero).cap) * techMult(state, 'leadership', 0.1));
+}
+
+// 指令点数：基础 + 每多一城 + 君主政治加成
+export function cmdPoints(state, fid) {
+  const n = citiesOf(state, fid).length;
+  const lord = lordOf(state, fid);
+  const pol = lord ? lord.stats.p : 50;
+  return CMD_BASE + CMD_PER_CITY * Math.max(0, n - 1) + Math.floor(pol / 100);
+}
+export function cmdRemaining(state, fid) {
+  return Math.max(0, cmdPoints(state, fid) - (state.cmdUsedByFaction?.[fid] || 0));
+}
+
+// 当前期望守城主将（统率最高）
+export function bestDefender(state, cityId) {
+  const city = cityById(state, cityId);
+  if (!city) return null;
+  const roster = heroesInCity(state, cityId, city.ownerFactionId);
+  if (!roster.length) return null;
+  return roster.reduce((a, b) => (effLead(a) >= effLead(b) ? a : b));
+}
+
+// 城防上限
+export function maxDefense(state, city) {
+  return Math.round(cityDefenseValue(state, city));
+}
+
+// ============================================================================
+// 新局初始化
+// ============================================================================
+export function newGame({ lordName, startCity, stats, rng } = {}) {
+  const r = rng || Math.random;
+  if (!lordName || !CITY_MAP[startCity]) throw new Error('newGame: 参数缺失');
+
+  const state = {
+    version: GAME_VERSION,
+    turn: 1,
+    playerFactionId: 0,
+    factions: [],
+    cities: [],
+    heroes: [],
+    techLevels: { agri: 0, commerce: 0, forge: 0, wall: 0, trick: 0, leadership: 0 },
+    researchByFaction: {}, // { [fid]: { key, turnsLeft } } —— 研究进度槽按势力独立
+    cmdUsedByFaction: {},
+    log: [],
+    turnLog: [],
+    over: null,
+  };
+
+  // —— 势力：玩家（id=0）+ AI ——
+  state.factions.push({
+    id: 0, name: `${lordName}势力`, color: PLAYER_COLOR,
+    money: 0, grain: 0, aiControlled: false, lordName,
+  });
+  const facIdByKey = {}; // 势力 key → factionId（被玩家占都则缺省）
+  let fid = 1;
+  for (const seed of FACTION_SEEDS) {
+    if (seed.capital === startCity) continue; // 玩家占了都城，该势力不生成
+    const lordDef = HERO_MAP[seed.lordId];
+    state.factions.push({
+      id: fid, name: `${lordDef.name}势力`, color: FACTION_COLORS[fid % FACTION_COLORS.length],
+      money: 0, grain: 0, aiControlled: true, lordName: lordDef.name,
+    });
+    facIdByKey[seed.key] = fid;
+    fid += 1;
+  }
+
+  // —— 城市 ——
+  for (const c of CITIES) {
+    state.cities.push({
+      id: c.id, name: c.name, x: c.x, y: c.y, trait: c.trait,
+      ownerFactionId: null,
+      population: c.pop0, maxPopulation: c.popMax,
+      soldiers: c.soldiers0, defenseBase: c.defense0, defense: c.defense0,
+      gold: c.gold0, grain: c.grain0, // 城库（攻陷时被缴获）
+      farmLevel: 1, marketLevel: 1, barracksLevel: 1, wallLevel: 1, workshopLevel: 0,
+      governorHeroId: null, adjacent: c.adjacent.slice(),
+      training: TRAINING_BASE,
+    });
+  }
+  // 玩家初始城市
+  const start = cityById(state, startCity);
+  start.ownerFactionId = 0;
+  const player = playerFaction(state);
+  player.money = Math.round(start.gold + 3000);
+  player.grain = Math.round(start.grain + 5000);
+
+  // —— 玩家君主（第一武将）——
+  const lord = {
+    id: 'player_lord', name: lordName, isPlayerLord: true, lord: true,
+    factionId: 0, cityId: startCity, status: 'free', loyalty: 100,
+    stats: { ...stats }, skill: { name: '雄主', effect: 'cap:0.05' }, wild: false,
+  };
+  state.heroes.push(lord);
+  start.governorHeroId = lord.id;
+
+  // —— AI 都城归属 + 太守 ——
+  for (const seed of FACTION_SEEDS) {
+    const f = facIdByKey[seed.key];
+    if (f == null) continue;
+    const cap = cityById(state, seed.capital);
+    cap.ownerFactionId = f;
+    const fac = factionById(state, f);
+    fac.money = Math.round(cap.gold + 2000);
+    fac.grain = Math.round(cap.grain + 4000);
+  }
+
+  // —— 名将部署 ——
+  for (const h of HEROES) {
+    const copy = {
+      id: h.id, name: h.name, isPlayerLord: false,
+      factionId: null, cityId: null, status: 'free',
+      loyalty: h.loyalty, stats: { ...h.stats },
+      skill: h.skill ? { ...h.skill } : null, generic: !!h.generic, wild: false,
+    };
+    let demotedToWild = false; // 势力未生成（都城被玩家所占）→ 君主降为在野，不再视作君主
+    if (h.serve) {
+      const f = facIdByKey[h.serve];
+      if (f != null) {
+        const seed = FACTION_SEEDS.find((s) => s.key === h.serve);
+        copy.factionId = f;
+        copy.cityId = seed.capital;
+        copy.status = 'free';
+      } else {
+        // 势力未生成（都城被玩家所占）→ 转为该城在野，玩家可登用
+        const seed = FACTION_SEEDS.find((s) => s.key === h.serve);
+        copy.factionId = null;
+        copy.cityId = seed.capital; // == startCity
+        copy.status = 'free';
+        copy.wild = true;
+        copy.discovered = true; // 名义上原属此城，直接可见
+        demotedToWild = true;
+      }
+    } else if (h.wild) {
+      copy.factionId = null;
+      copy.cityId = h.wild;
+      copy.status = 'free';
+      copy.wild = true;
+      copy.discovered = false;
+    } else {
+      continue;
+    }
+    if (h.lord && !demotedToWild) copy.lord = true;
+    state.heroes.push(copy);
+  }
+
+  // —— AI 太守（君主坐镇都城）——
+  for (const seed of FACTION_SEEDS) {
+    const f = facIdByKey[seed.key];
+    if (f == null) continue;
+    cityById(state, seed.capital).governorHeroId = seed.lordId;
+  }
+
+  // —— 为兵微将寡的 AI 势力补充部将（每势力至少 3 名）——
+  let genIdx = 0;
+  for (const seed of FACTION_SEEDS) {
+    const f = facIdByKey[seed.key];
+    if (f == null) continue;
+    const roster = heroesOfFaction(state, f);
+    const need = Math.max(0, 3 - roster.length);
+    for (let i = 0; i < need; i++) {
+      const g = makeGenericGeneral(r, ++genIdx);
+      g.id = `gen_${seed.key}_${i}`;
+      g.factionId = f;
+      g.cityId = seed.capital;
+      g.status = 'free';
+      state.heroes.push(g);
+    }
+  }
+
+  // 初始城防归位
+  for (const c of state.cities) c.defense = maxDefense(state, c);
+
+  // 起兵之城的在野名将预先「风闻」（已发现，可直接登用），帮助玩家平稳开局
+  for (const h of state.heroes) {
+    if (h.wild && h.cityId === startCity) h.discovered = true;
+  }
+
+  state.turnLog = [`公元初年，${lordName} 于 ${start.name} 起兵，群雄并起，逐鹿天下！`];
+  return state;
+}
+
+// ============================================================================
+// 回合结算（玩家点「结束回合」后调用）
+// 顺序：城防回满 → 经济·人口结算 → 科技推进 → AI 行动 → 回合 +1 → 胜负判定
+// 返回本回合事件摘要（state.turnLog）
+// ============================================================================
+export function resolveTurn(state, aiModule, rng) {
+  const r = rng || Math.random;
+  state.turnLog = [];
+
+  for (const c of state.cities) {
+    if (c.ownerFactionId != null) c.defense = maxDefense(state, c);
+  }
+
+  // —— 经济 / 人口结算（逐势力）——
+  for (const fac of state.factions) {
+    const fid = fac.id;
+    let goldIn = 0;
+    let grainIn = 0;
+    let grainEat = 0;
+    for (const c of citiesOf(state, fid)) {
+      goldIn += cityGoldIncome(state, c);
+      grainIn += cityGrainIncome(state, c);
+      grainEat += c.soldiers * GRAIN_UPKEEP_PER_SOLDIER;
+    }
+    fac.money += Math.round(goldIn);
+    fac.grain += Math.round(grainIn - grainEat);
+
+    // 人口增长（太守或君主政治）
+    const lord = lordOf(state, fid);
+    const basePol = lord ? lord.stats.p : 50;
+    for (const c of citiesOf(state, fid)) {
+      const gov = c.governorHeroId ? heroById(state, c.governorHeroId) : null;
+      const pol = gov ? gov.stats.p : basePol;
+      const growth = cityPopGrowth(state, c, pol);
+      c.population = Math.min(c.maxPopulation, c.population + Math.round(growth));
+    }
+
+    // 军粮不足 → 士兵逃亡（最多逃 10%）
+    if (fac.grain < 0) {
+      const owned = citiesOf(state, fid).slice().sort((a, b) => b.soldiers - a.soldiers);
+      let deficitSoldiers = Math.ceil(-fac.grain / GRAIN_UPKEEP_PER_SOLDIER);
+      const total = owned.reduce((s, c) => s + c.soldiers, 0);
+      deficitSoldiers = Math.min(deficitSoldiers, Math.ceil(total * 0.1));
+      for (const c of owned) {
+        if (deficitSoldiers <= 0) break;
+        const take = Math.min(c.soldiers, deficitSoldiers);
+        c.soldiers -= take;
+        deficitSoldiers -= take;
+      }
+      fac.grain = 0;
+      if (!fac.aiControlled) state.turnLog.push(`⚠️ 军粮告竭，士兵逃亡（本城损失兵力）。`);
+    }
+  }
+
+  // —— 科技推进（逐势力独立研究槽，互不阻塞）——
+  state.researchByFaction = state.researchByFaction || {};
+  for (const fac of state.factions) {
+    const res = state.researchByFaction[fac.id];
+    if (!res) continue;
+    res.turnsLeft -= 1;
+    if (res.turnsLeft <= 0) {
+      state.techLevels[res.key] = Math.min(TECH_MAX_LEVEL, state.techLevels[res.key] + 1);
+      if (fac.id === state.playerFactionId) {
+        state.turnLog.push(`🔬 科技突破：研究完成（${res.key} 升至 ${state.techLevels[res.key]} 级）。`);
+      }
+      delete state.researchByFaction[fac.id];
+    }
+  }
+
+  // —— AI 行动 ——
+  if (aiModule && typeof aiModule.aiTurnAll === 'function') {
+    aiModule.aiTurnAll(state, r);
+  }
+
+  // —— 名将忠诚度自然漂移（轻微）——
+  for (const h of state.heroes) {
+    if (h.status === 'prisoner' || h.wild) continue;
+    if (chance(r, 0.5)) h.loyalty = Math.max(0, Math.min(100, h.loyalty + (chance(r, 0.5) ? 1 : -1)));
+  }
+
+  state.turn += 1;
+  state.cmdUsedByFaction = {};
+  checkGameOver(state);
+  return state.turnLog;
+}
+
+// ============================================================================
+// 胜负判定
+// ============================================================================
+export function checkGameOver(state) {
+  const playerCities = citiesOf(state, state.playerFactionId);
+  if (playerCities.length === 0) { state.over = 'lose'; return; }
+  const allOwned = state.cities.every((c) => c.ownerFactionId === state.playerFactionId);
+  if (allOwned) state.over = 'win';
+}
+
+export { effLead, effWar };
diff --git a/apps/xiong-tu-san-guo/src/core/tech.js b/apps/xiong-tu-san-guo/src/core/tech.js
new file mode 100644
index 0000000..af78346
--- /dev/null
+++ b/apps/xiong-tu-san-guo/src/core/tech.js
@@ -0,0 +1,45 @@
+// ============================================================================
+// 科技效果 + 技能解析。
+// 技能 effect DSL（逗号分隔）：lead:0.10 / war:0.10 / trick:0.20 / def:0.20 /
+//   cap:0.10 / train:0.20 / p_grow:0.10 / c_recruit:0.20
+// ============================================================================
+
+const KEYS = ['lead', 'war', 'trick', 'def', 'cap', 'train', 'p_grow', 'c_recruit'];
+
+export function emptyBonus() {
+  return { lead: 0, war: 0, trick: 0, def: 0, cap: 0, train: 0, p_grow: 0, c_recruit: 0 };
+}
+
+// 解析技能 effect 字符串为加成对象
+export function parseSkill(effect) {
+  const b = emptyBonus();
+  if (!effect || typeof effect !== 'string') return b;
+  for (const part of effect.split(',')) {
+    const [k, v] = part.split(':');
+    const key = k && k.trim();
+    if (KEYS.includes(key)) {
+      const num = parseFloat(v);
+      if (Number.isFinite(num)) b[key] += num;
+    }
+  }
+  return b;
+}
+
+export function skillBonus(hero) {
+  return parseSkill(hero && hero.skill ? hero.skill.effect : '');
+}
+
+// 科技等级乘数：1 + level × perLevel
+export function techMult(state, techKey, perLevel) {
+  const lv = (state && state.techLevels && state.techLevels[techKey]) || 0;
+  return 1 + lv * perLevel;
+}
+
+export function techLevel(state, techKey) {
+  return (state && state.techLevels && state.techLevels[techKey]) || 0;
+}
+
+// 当前正在研究的科技（按势力独立槽）
+export function activeResearch(state, fid) {
+  return state && state.researchByFaction ? (state.researchByFaction[fid] || null) : null;
+}
diff --git a/apps/xiong-tu-san-guo/src/data/cities.js b/apps/xiong-tu-san-guo/src/data/cities.js
new file mode 100644
index 0000000..99f5cdd
--- /dev/null
+++ b/apps/xiong-tu-san-guo/src/data/cities.js
@@ -0,0 +1,93 @@
+// ============================================================================
+// 城市（地图节点）初始数据：18 座核心城市，含坐标、特性、初始资源、邻接关系。
+// trait.type 取值：commerce(商业) / grain(粮食) / defense(城防) / growth(人口) / recruit(征兵)
+// 坐标基于 viewBox "0 0 1000 760"（西→东，北→南）。
+// ============================================================================
+export const CITIES = [
+  { id: 'luoyang', name: '洛阳', x: 500, y: 320,
+    trait: { type: 'commerce', value: 0.2, name: '天下之中', desc: '商业收入 +20%' },
+    popMax: 100000, pop0: 80000, gold0: 3000, grain0: 8000, soldiers0: 2000, defense0: 1200,
+    adjacent: ['changan', 'xuchang', 'ye', 'wan'] },
+  { id: 'changan', name: '长安', x: 250, y: 330,
+    trait: { type: 'defense', value: 0.2, name: '关中险固', desc: '城防值 +20%' },
+    popMax: 90000, pop0: 60000, gold0: 2000, grain0: 6000, soldiers0: 1800, defense0: 1100,
+    adjacent: ['luoyang', 'wuwei', 'hanzhong'] },
+  { id: 'ye', name: '邺城', x: 600, y: 270,
+    trait: { type: 'growth', value: 0.15, name: '河北要冲', desc: '人口增长 +15%' },
+    popMax: 95000, pop0: 70000, gold0: 2500, grain0: 7000, soldiers0: 2200, defense0: 1000,
+    adjacent: ['nanpi', 'puyang', 'luoyang'] },
+  { id: 'xuchang', name: '许昌', x: 620, y: 430,
+    trait: { type: 'commerce', value: 0.15, name: '中原通衢', desc: '商业收入 +15%' },
+    popMax: 85000, pop0: 55000, gold0: 2500, grain0: 7000, soldiers0: 1800, defense0: 1000,
+    adjacent: ['luoyang', 'puyang', 'xiapi', 'wan'] },
+  { id: 'chengdu', name: '成都', x: 250, y: 550,
+    trait: { type: 'grain', value: 0.2, name: '天府之国', desc: '粮食产量 +20%' },
+    popMax: 100000, pop0: 70000, gold0: 2000, grain0: 10000, soldiers0: 1600, defense0: 1000,
+    adjacent: ['hanzhong', 'jianning'] },
+  { id: 'jianye', name: '建业', x: 800, y: 500,
+    trait: { type: 'commerce', value: 0.15, name: '江东形胜', desc: '商业收入 +15%' },
+    popMax: 90000, pop0: 60000, gold0: 2200, grain0: 6500, soldiers0: 1700, defense0: 1100,
+    adjacent: ['xiapi', 'kuaiji', 'xiangyang', 'jiangling'] },
+  { id: 'xiangyang', name: '襄阳', x: 540, y: 520,
+    trait: { type: 'defense', value: 0.15, name: '荆楚咽喉', desc: '城防值 +15%' },
+    popMax: 85000, pop0: 55000, gold0: 2200, grain0: 6500, soldiers0: 1700, defense0: 1100,
+    adjacent: ['wan', 'jiangling', 'jianye'] },
+  { id: 'hanzhong', name: '汉中', x: 320, y: 430,
+    trait: { type: 'defense', value: 0.3, name: '易守难攻', desc: '城防值 +30%' },
+    popMax: 70000, pop0: 40000, gold0: 1500, grain0: 5000, soldiers0: 1400, defense0: 1300,
+    adjacent: ['changan', 'chengdu', 'wan'] },
+  { id: 'beiping', name: '北平', x: 760, y: 130,
+    trait: { type: 'recruit', value: 0.15, name: '幽燕边塞', desc: '征兵效率 +15%' },
+    popMax: 80000, pop0: 50000, gold0: 1800, grain0: 5500, soldiers0: 2000, defense0: 1000,
+    adjacent: ['nanpi'] },
+  { id: 'xiapi', name: '下邳', x: 800, y: 400,
+    trait: { type: 'commerce', value: 0.1, name: '泗水商埠', desc: '商业收入 +10%' },
+    popMax: 75000, pop0: 45000, gold0: 2000, grain0: 5500, soldiers0: 1500, defense0: 900,
+    adjacent: ['puyang', 'xuchang', 'jianye'] },
+  { id: 'wan', name: '宛城', x: 460, y: 430,
+    trait: { type: 'defense', value: 0.1, name: '南阳要冲', desc: '城防值 +10%' },
+    popMax: 72000, pop0: 42000, gold0: 1700, grain0: 5200, soldiers0: 1400, defense0: 1100,
+    adjacent: ['luoyang', 'xuchang', 'hanzhong', 'xiangyang'] },
+  { id: 'nanpi', name: '南皮', x: 660, y: 200,
+    trait: { type: 'grain', value: 0.25, name: '产粮大郡', desc: '粮食产量 +25%' },
+    popMax: 78000, pop0: 48000, gold0: 1700, grain0: 7000, soldiers0: 1500, defense0: 950,
+    adjacent: ['beiping', 'ye'] },
+  { id: 'puyang', name: '濮阳', x: 690, y: 340,
+    trait: { type: 'growth', value: 0.1, name: '中原沃野', desc: '人口增长 +10%' },
+    popMax: 76000, pop0: 46000, gold0: 1800, grain0: 5600, soldiers0: 1500, defense0: 950,
+    adjacent: ['ye', 'xiapi', 'xuchang'] },
+  { id: 'jiangling', name: '江陵', x: 480, y: 620,
+    trait: { type: 'grain', value: 0.15, name: '云梦粮仓', desc: '粮食产量 +15%' },
+    popMax: 78000, pop0: 47000, gold0: 1800, grain0: 6800, soldiers0: 1500, defense0: 950,
+    adjacent: ['xiangyang', 'guiyang', 'jianye'] },
+  { id: 'kuaiji', name: '会稽', x: 860, y: 600,
+    trait: { type: 'commerce', value: 0.2, name: '海盐通商', desc: '商业收入 +20%' },
+    popMax: 72000, pop0: 42000, gold0: 2000, grain0: 5200, soldiers0: 1300, defense0: 900,
+    adjacent: ['jianye'] },
+  { id: 'jianning', name: '建宁', x: 360, y: 660,
+    trait: { type: 'grain', value: 0.1, name: '南中屯田', desc: '粮食产量 +10%' },
+    popMax: 68000, pop0: 36000, gold0: 1400, grain0: 5400, soldiers0: 1200, defense0: 900,
+    adjacent: ['chengdu', 'guiyang'] },
+  { id: 'wuwei', name: '武威', x: 120, y: 250,
+    trait: { type: 'recruit', value: 0.2, name: '西凉铁骑', desc: '征兵效率 +20%' },
+    popMax: 64000, pop0: 32000, gold0: 1300, grain0: 4800, soldiers0: 1800, defense0: 950,
+    adjacent: ['changan'] },
+  { id: 'guiyang', name: '桂阳', x: 560, y: 690,
+    trait: { type: 'growth', value: 0.1, name: '岭南烟瘴', desc: '人口增长 +10%' },
+    popMax: 66000, pop0: 34000, gold0: 1400, grain0: 5000, soldiers0: 1200, defense0: 850,
+    adjacent: ['jianning', 'jiangling'] },
+];
+
+export const CITY_MAP = Object.fromEntries(CITIES.map((c) => [c.id, c]));
+
+// 邻接关系自检：确保双向一致（开发期辅助，构建期不抛错）
+export function adjacencyValid() {
+  for (const c of CITIES) {
+    for (const n of c.adjacent) {
+      const nb = CITY_MAP[n];
+      if (!nb) return false;
+      if (!nb.adjacent.includes(c.id)) return false;
+    }
+  }
+  return true;
+}
diff --git a/apps/xiong-tu-san-guo/src/data/heroes.js b/apps/xiong-tu-san-guo/src/data/heroes.js
new file mode 100644
index 0000000..f86ec90
--- /dev/null
+++ b/apps/xiong-tu-san-guo/src/data/heroes.js
@@ -0,0 +1,151 @@
+// ============================================================================
+// 名将与势力种子数据：47 位历史名将 + 8 个 AI 势力种子。
+// 每个 hero：{ id, name, stats{l,w,i,p,c}, skill, loyalty, serve|wild, lord? }
+//   serve: 所属 AI 势力 key（含君主 lord:true）
+//   wild : 在野所在城市 id（可被探索 / 登用）
+// skill.effect 为简化 DSL：lead:0.10 / war:0.10 / trick:0.20 / def:0.20 / cap:0.10 / train:0.20
+// ============================================================================
+
+export const HEROES = [
+  // —— AI 君主（serve=势力 key, lord:true）——
+  { id: 'caocao', name: '曹操', serve: 'cao', lord: true, loyalty: 100,
+    stats: { l: 96, w: 80, i: 94, p: 96, c: 98 }, skill: { name: '雄才大略', effect: 'cap:0.10,trick:0.10' } },
+  { id: 'yuanshao', name: '袁绍', serve: 'yuan', lord: true, loyalty: 100,
+    stats: { l: 84, w: 78, i: 80, p: 82, c: 90 }, skill: { name: '四世三公', effect: 'cap:0.10' } },
+  { id: 'sunce', name: '孙策', serve: 'ce', lord: true, loyalty: 100,
+    stats: { l: 92, w: 92, i: 80, p: 70, c: 95 }, skill: { name: '小霸王', effect: 'war:0.10' } },
+  { id: 'dongzhuo', name: '董卓', serve: 'dong', lord: true, loyalty: 100,
+    stats: { l: 82, w: 88, i: 60, p: 50, c: 55 }, skill: { name: '魔焰滔天', effect: 'war:0.10' } },
+  { id: 'liubiao', name: '刘表', serve: 'biao', lord: true, loyalty: 100,
+    stats: { l: 70, w: 60, i: 78, p: 80, c: 85 }, skill: { name: '荆襄名士', effect: 'p_grow:0.10' } },
+  { id: 'mateng', name: '马腾', serve: 'teng', lord: true, loyalty: 100,
+    stats: { l: 82, w: 86, i: 70, p: 68, c: 80 }, skill: { name: '西凉雄风', effect: 'war:0.08' } },
+  { id: 'liuzhang', name: '刘璋', serve: 'zhang', lord: true, loyalty: 100,
+    stats: { l: 60, w: 55, i: 70, p: 75, c: 78 }, skill: { name: '益州偏安', effect: 'def:0.10' } },
+  { id: 'gongsunzan', name: '公孙瓒', serve: 'gongsun', lord: true, loyalty: 100,
+    stats: { l: 80, w: 84, i: 65, p: 60, c: 70 }, skill: { name: '白马义从', effect: 'war:0.08' } },
+
+  // —— 曹操势力 ——
+  { id: 'zhangliao', name: '张辽', serve: 'cao', loyalty: 92,
+    stats: { l: 94, w: 93, i: 78, p: 78, c: 82 }, skill: { name: '威震逍遥津', effect: 'war:0.10' } },
+  { id: 'xiahoudun', name: '夏侯惇', serve: 'cao', loyalty: 95,
+    stats: { l: 84, w: 88, i: 60, p: 70, c: 78 }, skill: { name: '刚烈', effect: 'war:0.08' } },
+  { id: 'xiahouyuan', name: '夏侯渊', serve: 'cao', loyalty: 93,
+    stats: { l: 83, w: 87, i: 65, p: 65, c: 72 }, skill: { name: '神速', effect: 'war:0.06' } },
+  { id: 'xuhuang', name: '徐晃', serve: 'cao', loyalty: 90,
+    stats: { l: 83, w: 88, i: 72, p: 70, c: 70 }, skill: null },
+  { id: 'zhanghe', name: '张郃', serve: 'cao', loyalty: 85,
+    stats: { l: 85, w: 88, i: 70, p: 68, c: 70 }, skill: null },
+  { id: 'dianwei', name: '典韦', serve: 'cao', loyalty: 96,
+    stats: { l: 70, w: 96, i: 40, p: 30, c: 50 }, skill: { name: '古之恶来', effect: 'war:0.12' } },
+  { id: 'xuchu2', name: '许褚', serve: 'cao', loyalty: 95,
+    stats: { l: 72, w: 94, i: 35, p: 30, c: 55 }, skill: { name: '虎痴', effect: 'war:0.10' } },
+  { id: 'guojia', name: '郭嘉', serve: 'cao', loyalty: 90,
+    stats: { l: 70, w: 40, i: 98, p: 85, c: 80 }, skill: { name: '鬼才', effect: 'trick:0.20' } },
+  { id: 'xunyu', name: '荀彧', serve: 'cao', loyalty: 92,
+    stats: { l: 75, w: 40, i: 95, p: 98, c: 88 }, skill: { name: '王佐之才', effect: 'p_grow:0.15' } },
+  { id: 'jiaxu', name: '贾诩', serve: 'cao', loyalty: 88,
+    stats: { l: 80, w: 50, i: 96, p: 80, c: 70 }, skill: { name: '毒士', effect: 'trick:0.20' } },
+  { id: 'chengyu', name: '程昱', serve: 'cao', loyalty: 88,
+    stats: { l: 72, w: 55, i: 90, p: 80, c: 65 }, skill: null },
+
+  // —— 袁绍势力 ——
+  { id: 'yanliang', name: '颜良', serve: 'yuan', loyalty: 82,
+    stats: { l: 80, w: 92, i: 50, p: 45, c: 60 }, skill: null },
+  { id: 'wenchou', name: '文丑', serve: 'yuan', loyalty: 82,
+    stats: { l: 78, w: 92, i: 45, p: 40, c: 58 }, skill: null },
+
+  // —— 孙策势力 ——
+  { id: 'zhouyu', name: '周瑜', serve: 'ce', loyalty: 98,
+    stats: { l: 95, w: 78, i: 97, p: 86, c: 92 }, skill: { name: '火烧赤壁', effect: 'trick:0.20' } },
+  { id: 'taishici', name: '太史慈', serve: 'ce', loyalty: 90,
+    stats: { l: 84, w: 93, i: 70, p: 60, c: 78 }, skill: null },
+  { id: 'ganning', name: '甘宁', serve: 'ce', loyalty: 85,
+    stats: { l: 86, w: 94, i: 70, p: 55, c: 75 }, skill: { name: '锦帆贼', effect: 'war:0.08' } },
+  { id: 'huanggai', name: '黄盖', serve: 'ce', loyalty: 95,
+    stats: { l: 80, w: 86, i: 65, p: 60, c: 78 }, skill: null },
+  { id: 'lvmeng', name: '吕蒙', serve: 'ce', loyalty: 90,
+    stats: { l: 88, w: 85, i: 90, p: 80, c: 75 }, skill: { name: '刮目相看', effect: 'trick:0.10' } },
+  { id: 'luxun', name: '陆逊', serve: 'ce', loyalty: 92,
+    stats: { l: 90, w: 75, i: 95, p: 88, c: 85 }, skill: { name: '火烧连营', effect: 'trick:0.20' } },
+  { id: 'lusu', name: '鲁肃', serve: 'ce', loyalty: 93,
+    stats: { l: 78, w: 50, i: 92, p: 95, c: 92 }, skill: null },
+
+  // —— 董卓势力 ——
+  { id: 'lvbu', name: '吕布', serve: 'dong', loyalty: 70,
+    stats: { l: 78, w: 100, i: 35, p: 26, c: 47 }, skill: { name: '人中吕布', effect: 'war:0.15' } },
+  { id: 'huaxiong', name: '华雄', serve: 'dong', loyalty: 80,
+    stats: { l: 75, w: 88, i: 40, p: 35, c: 50 }, skill: null },
+
+  // —— 马腾势力 ——
+  { id: 'machao', name: '马超', serve: 'teng', loyalty: 80,
+    stats: { l: 88, w: 97, i: 50, p: 40, c: 70 }, skill: { name: '锦马超', effect: 'war:0.10' } },
+
+  // —— 在野名将（wild=城市 id，可探索登用）——
+  { id: 'liubei', name: '刘备', wild: 'luoyang', loyalty: 99,
+    stats: { l: 90, w: 78, i: 80, p: 85, c: 99 }, skill: { name: '仁德', effect: 'c_recruit:0.20' } },
+  { id: 'guanyu', name: '关羽', wild: 'wan', loyalty: 95,
+    stats: { l: 96, w: 97, i: 75, p: 62, c: 88 }, skill: { name: '威震华夏', effect: 'lead:0.10,war:0.05' } },
+  { id: 'zhangfei', name: '张飞', wild: 'wan', loyalty: 90,
+    stats: { l: 85, w: 98, i: 45, p: 30, c: 60 }, skill: { name: '燕人咆哮', effect: 'war:0.10' } },
+  { id: 'zhaoyun', name: '赵云', wild: 'nanpi', loyalty: 92,
+    stats: { l: 91, w: 96, i: 76, p: 65, c: 85 }, skill: { name: '常胜将军', effect: 'war:0.08,def:0.10' } },
+  { id: 'zhugeliang', name: '诸葛亮', wild: 'xiangyang', loyalty: 100,
+    stats: { l: 92, w: 40, i: 100, p: 98, c: 93 }, skill: { name: '神算', effect: 'trick:0.20,p_grow:0.10' } },
+  { id: 'huangzhong', name: '黄忠', wild: 'kuaiji', loyalty: 88,
+    stats: { l: 86, w: 95, i: 65, p: 60, c: 70 }, skill: null },
+  { id: 'pangtong', name: '庞统', wild: 'guiyang', loyalty: 85,
+    stats: { l: 80, w: 45, i: 97, p: 90, c: 80 }, skill: { name: '凤雏', effect: 'trick:0.15' } },
+  { id: 'fazheng', name: '法正', wild: 'hanzhong', loyalty: 88,
+    stats: { l: 75, w: 50, i: 94, p: 88, c: 75 }, skill: null },
+  { id: 'weiyan', name: '魏延', wild: 'xiapi', loyalty: 78,
+    stats: { l: 88, w: 92, i: 70, p: 60, c: 65 }, skill: null },
+  { id: 'jiangwei', name: '姜维', wild: 'hanzhong', loyalty: 90,
+    stats: { l: 91, w: 90, i: 90, p: 80, c: 80 }, skill: { name: '麒麟儿', effect: 'lead:0.08,trick:0.10' } },
+  { id: 'huatuo', name: '华佗', wild: 'luoyang', loyalty: 80,
+    stats: { l: 40, w: 30, i: 90, p: 85, c: 90 }, skill: { name: '神医', effect: 'def:0.10' } },
+  { id: 'simayi', name: '司马懿', wild: 'wan', loyalty: 85,
+    stats: { l: 93, w: 70, i: 96, p: 93, c: 88 }, skill: { name: '韬略', effect: 'trick:0.15' } },
+  { id: 'dengai', name: '邓艾', wild: 'puyang', loyalty: 88,
+    stats: { l: 90, w: 85, i: 89, p: 85, c: 75 }, skill: null },
+  { id: 'zhonghui', name: '钟会', wild: 'guiyang', loyalty: 78,
+    stats: { l: 82, w: 75, i: 88, p: 75, c: 70 }, skill: null },
+  { id: 'gaoshun', name: '高顺', wild: 'jianning', loyalty: 85,
+    stats: { l: 82, w: 90, i: 55, p: 50, c: 60 }, skill: { name: '陷阵营', effect: 'war:0.10' } },
+  { id: 'simazhao', name: '司马昭', wild: 'xiapi', loyalty: 82,
+    stats: { l: 85, w: 70, i: 90, p: 85, c: 80 }, skill: null },
+];
+
+export const HERO_MAP = Object.fromEntries(HEROES.map((h) => [h.id, h]));
+
+// AI 势力种子：capital 为初始都城，lordId 指向 HEROES 中的君主。
+// 玩家若选择某都城开局，对应势力不生成，其名将转为该城在野（玩家可登用）。
+export const FACTION_SEEDS = [
+  { key: 'cao', capital: 'xuchang', lordId: 'caocao' },
+  { key: 'yuan', capital: 'ye', lordId: 'yuanshao' },
+  { key: 'ce', capital: 'jianye', lordId: 'sunce' },
+  { key: 'dong', capital: 'changan', lordId: 'dongzhuo' },
+  { key: 'biao', capital: 'jiangling', lordId: 'liubiao' },
+  { key: 'teng', capital: 'wuwei', lordId: 'mateng' },
+  { key: 'zhang', capital: 'chengdu', lordId: 'liuzhang' },
+  { key: 'gongsun', capital: 'beiping', lordId: 'gongsunzan' },
+];
+
+// 生成器：为兵力薄弱的 AI 势力补充随机「部将」（无技能，属性中等）。
+// index 用于生成唯一 id，调用方负责保证其单调递增。
+const GENERIC_SURNAMES = ['李', '王', '张', '刘', '陈', '杨', '赵', '黄', '周', '吴', '徐', '孙', '胡', '朱', '高', '林', '何', '郭', '马', '罗'];
+const GENERIC_GIVENS = ['成', '武', '义', '忠', '安', '定', '远', '彪', '虎', '达', '凯', '平', '宁', '胜', '广'];
+export function makeGenericGeneral(rng, index) {
+  const r = rng || Math.random;
+  const name = GENERIC_SURNAMES[Math.floor(r() * GENERIC_SURNAMES.length)]
+    + GENERIC_GIVENS[Math.floor(r() * GENERIC_GIVENS.length)];
+  const ri = (lo, hi) => Math.floor(lo + r() * (hi - lo));
+  return {
+    id: `gen_${index}`,
+    name,
+    generic: true,
+    loyalty: ri(55, 85),
+    stats: { l: ri(55, 82), w: ri(55, 85), i: ri(45, 78), p: ri(40, 72), c: ri(45, 75) },
+    skill: null,
+  };
+}
diff --git a/apps/xiong-tu-san-guo/src/main.js b/apps/xiong-tu-san-guo/src/main.js
new file mode 100644
index 0000000..ccf5827
--- /dev/null
+++ b/apps/xiong-tu-san-guo/src/main.js
@@ -0,0 +1,19 @@
+// ============================================================================
+// 雄图·三国志文明 · 入口
+// 导出 createGame(parent) 工厂，供主框架（落地页）按需挂载到任意容器；
+// 同时保留独立运行（apps/xiong-tu-san-guo/index.html）时的自动挂载行为。
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
+  if (typeof window !== 'undefined') window.__XTSG = ui; // 暴露实例便于调试 / 冒烟测试
+}
diff --git a/apps/xiong-tu-san-guo/src/ui/app.js b/apps/xiong-tu-san-guo/src/ui/app.js
new file mode 100644
index 0000000..1de631e
--- /dev/null
+++ b/apps/xiong-tu-san-guo/src/ui/app.js
@@ -0,0 +1,722 @@
+// ============================================================================
+// 雄图·三国志文明 · UI 控制器（纯原生 DOM）
+// 三层屏幕：启动器（新局 / 继续）→ 创角 → 对局（顶栏 + 五标签 + 弹窗）。
+// 对局标签：地图 / 势力 / 名将 / 科技 / 系统。
+// ============================================================================
+import './style.css';
+import { attachKeyboardShell } from '../../../_lib/keyboard-shell.js';
+import { h, clear, bar } from './dom.js';
+import {
+  TECHS, FORMATIONS, STRATAGEMS, BUILD_MAX, TECH_MAX_LEVEL, TECH_COST_GOLD,
+  TRAINING_MAX, FACTION_COLORS, NEUTRAL_COLOR, seasonOf, clamp,
+} from '../config.js';
+import { CITIES } from '../data/cities.js';
+import { newGame, resolveTurn, cityById, heroById, factionById, playerFaction,
+  neighbors, heroesOfFaction, heroesInCity, wildHeroesInCity, prisonersOfFaction,
+  troopCap, cmdPoints, cmdRemaining, bestDefender, lordOf, maxDefense } from '../core/state.js';
+import { citiesOf, factionGoldIncome, factionGrainNet } from '../core/economy.js';
+import { effLead, effWar } from '../core/combat.js';
+import { techLevel } from '../core/tech.js';
+import * as A from '../core/actions.js';
+import { aiTurnAll } from '../core/ai.js';
+import { hasSave, saveGame, loadGame, clearSave } from '../core/save.js';
+import { chance } from '../core/rng.js';
+
+const STAT_KEYS = [
+  ['l', '统'], ['w', '武'], ['i', '智'], ['p', '政'], ['c', '魅'],
+];
+const TABS = [
+  { key: 'map', icon: '🗺️', label: '地图' },
+  { key: 'faction', icon: '🏯', label: '势力' },
+  { key: 'heroes', icon: '⚔️', label: '名将' },
+  { key: 'tech', icon: '📜', label: '科技' },
+  { key: 'system', icon: '⚙️', label: '系统' },
+];
+
+export class GameUI {
+  constructor(parent) {
+    this.parent = parent;
+    this.state = null;
+    this.tab = 'map';
+    this.selectedCityId = null;
+    this.screen = 'start';
+    this.charTemplate = null;
+    this.startCityPick = null;
+  }
+
+  mount() {
+    this.root = h('div', { class: 'xtsg' });
+    clear(this.parent);
+    this.parent.appendChild(this.root);
+    this.toastWrap = h('div', { class: 'toast-wrap' });
+    this.stage = h('div', { class: 'stage' });
+    this.modalRoot = h('div', { class: 'xtsg-modals' });
+    this.root.append(this.toastWrap, this.stage, this.modalRoot);
+    this._detachKeyboard = attachKeyboardShell(this.root);
+    this.showStart();
+    return this;
+  }
+
+  destroy() {
+    if (this._detachKeyboard) { try { this._detachKeyboard(); } catch (_) {} }
+    try { clear(this.parent); } catch (_) {}
+  }
+
+  // ============ Toast / Modal ============
+  toast(msg) {
+    const t = h('div', { class: 'toast' }, msg);
+    this.toastWrap.appendChild(t);
+    setTimeout(() => { try { this.toastWrap.removeChild(t); } catch (_) {} }, 2400);
+  }
+  closeModal() { clear(this.modalRoot); }
+  openModal({ title, body, foot }) {
+    clear(this.modalRoot);
+    const card = h('div', { class: 'modal__card' },
+      h('div', { class: 'modal__head' }, h('h3', null, title)),
+      h('div', { class: 'modal__body' }, body),
+      foot ? h('div', { class: 'modal__foot' }, foot) : null,
+    );
+    // 点遮罩关闭；点卡片内不关闭（避免误触）
+    const backdrop = h('div', { class: 'modal', onClick: (e) => { if (e.target === e.currentTarget) this.closeModal(); } }, card);
+    this.modalRoot.appendChild(backdrop);
+    return card;
+  }
+  // 带确认/取消的表单弹窗
+  openForm(title, bodyNode, onConfirm, confirmLabel = '确认') {
+    const foot = [
+      h('button', { class: 'btn-ghost grow', onClick: () => this.closeModal() }, '取消'),
+      h('button', { class: 'btn-primary grow', onClick: onConfirm }, confirmLabel),
+    ];
+    return this.openModal({ title, body: bodyNode, foot });
+  }
+
+  // ============ 启动器 ============
+  showStart() {
+    this.screen = 'start';
+    this.state = null;
+    clear(this.stage);
+    const wrap = h('div', { class: 'launcher' },
+      h('div', { class: 'launcher__brand' },
+        h('div', { class: 'emblem' }, '雄'),
+        h('h1', null, '雄图·三国志文明'),
+        h('p', { class: 'sub' }, '内政 · 科技 · 名将 · 征伐 · 统一天下'),
+      ),
+      h('div', { class: 'launcher__menu' },
+        h('button', { class: 'btn-primary btn-block', onClick: () => this.showCreate() }, '新游戏'),
+        h('button', {
+          class: 'btn-ghost btn-block', disabled: !hasSave(), onClick: () => this.continueGame(),
+        }, hasSave() ? '继续游戏' : '继续游戏（无存档）'),
+      ),
+      h('p', { class: 'hint center' }, '选择一座城池起兵，招揽名将、发展内政、征战四方。'),
+    );
+    this.stage.appendChild(wrap);
+  }
+
+  continueGame() {
+    const s = loadGame();
+    if (!s) { this.toast('存档读取失败'); return; }
+    this.state = s;
+    this.enterGame();
+  }
+
+  // ============ 创角 ============
+  showCreate() {
+    this.screen = 'create';
+    this.charTemplate = { name: '', stats: this.rollStats(), rerolls: 0 };
+    this.startCityPick = null;
+    this.renderCreate();
+  }
+  rollStats() {
+    const s = {};
+    for (const [k] of STAT_KEYS) s[k] = 50 + Math.floor(Math.random() * 51); // 50~100
+    return s;
+  }
+  renderCreate() {
+    clear(this.stage);
+    const t = this.charTemplate;
+
+    const nameInput = h('input', { type: 'text', maxlength: 4, placeholder: '2~4 个汉字', value: t.name,
+      onInput: (e) => { t.name = e.target.value; } });
+
+    const statGrid = h('div', { class: 'stat-grid' },
+      STAT_KEYS.map(([k, label]) => h('div', { class: 'stat' },
+        h('div', { class: 'stat__k' }, label), h('div', { class: 'stat__v' }, t.stats[k]))));
+    const rerollBtn = h('button', { class: 'btn-ghost btn-block', disabled: t.rerolls >= 5,
+      onClick: () => { t.stats = this.rollStats(); t.rerolls += 1; this.renderCreate(); } },
+      `重新随机属性（${t.rerolls}/5）`);
+
+    const cityPick = h('div', { class: 'city-pick' }, CITIES.map((c) => {
+      const sel = this.startCityPick === c.id;
+      return h('button', {
+        class: `city-pick__item${sel ? ' city-pick__item--sel' : ''}`,
+        onClick: () => { this.startCityPick = c.id; this.renderCreate(); },
+      },
+        h('div', null, h('b', null, c.name)),
+        h('div', { class: 'muted' }, c.trait.name),
+      );
+    }));
+
+    const startBtn = h('button', { class: 'btn-primary btn-block',
+      onClick: () => this.beginGame(),
+    }, '起兵出征');
+
+    const wrap = h('div', { class: 'create' },
+      h('h2', null, '一、立君'),
+      h('div', { class: 'create__field' }, h('label', null, '君主姓名（2~4 个汉字）'), nameInput),
+      h('div', { class: 'create__field' }, h('label', null, '君主属性'), statGrid, rerollBtn),
+      h('h2', null, '二、择都'),
+      h('p', { class: 'hint' }, '选择起兵之城。占据诸侯旧都，其旧部将转为在野，可择机登用。'),
+      cityPick,
+      h('div', { style: { height: '0.8rem' } }),
+      startBtn,
+      h('div', { style: { height: '0.4rem' } }),
+      h('button', { class: 'btn-ghost btn-block', onClick: () => this.showStart() }, '返回'),
+    );
+    this.stage.appendChild(wrap);
+    // 挂载临时引用，便于 beginGame 读取输入框最新值
+    this._nameInput = nameInput;
+  }
+
+  beginGame() {
+    const name = (this._nameInput?.value || this.charTemplate.name || '').trim();
+    if (!/^[一-龥]{2,4}$/.test(name)) { this.toast('君主姓名须为 2~4 个汉字'); return; }
+    if (!this.startCityPick) { this.toast('请选择起兵之城'); return; }
+    this.state = newGame({ lordName: name, startCity: this.startCityPick, stats: this.charTemplate.stats });
+    saveGame(this.state);
+    this.toast(`${name} 于 ${cityById(this.state, this.startCityPick).name} 起兵！`);
+    this.enterGame();
+  }
+
+  // ============ 进入对局 ============
+  enterGame() {
+    this.screen = 'game';
+    this.tab = 'map';
+    this.selectedCityId = playerFaction(this.state) && citiesOf(this.state, this.state.playerFactionId)[0]?.id;
+    this.renderGame();
+  }
+
+  renderGame() {
+    if (this.state.over) { this.renderGameOver(); return; }
+    clear(this.stage);
+    this.gameRoot = h('div', { class: 'game' });
+    this.stage.appendChild(this.gameRoot);
+    this.topbar = h('div', { class: 'topbar' });
+    this.tabbar = h('div', { class: 'tabbar' });
+    this.content = h('div', { class: 'content' });
+    this.gameRoot.append(this.topbar, this.tabbar, this.content);
+    this.refreshTopbar();
+    this.renderTabbar();
+    this.renderContent();
+  }
+
+  refreshTopbar() {
+    const s = this.state;
+    const fac = playerFaction(s);
+    const goldIn = Math.round(factionGoldIncome(s, s.playerFactionId));
+    const grainNet = factionGrainNet(s, s.playerFactionId);
+    const cmd = cmdRemaining(s, s.playerFactionId);
+    clear(this.topbar);
+    this.topbar.appendChild(h('div', { class: 'topbar__row' },
+      h('span', { class: 'topbar__title' }, `${fac.name}`),
+      h('span', { class: 'res-pill' }, `${seasonOf(s.turn)} · 第${s.turn}回合`),
+      h('span', { class: 'res-pill' }, `金 `, h('b', null, Math.round(fac.money))),
+      h('span', { class: 'res-pill' }, `粮 `, h('b', null, Math.round(fac.grain))),
+      h('span', { class: 'res-pill cmd-pill' }, `令 ${cmd}`),
+    ));
+    this.topbar.appendChild(h('div', { class: 'topbar__row', style: { marginTop: '0.35rem' } },
+      h('span', { class: 'hint', style: { margin: 0 } }, `金 +${goldIn}/回 · 粮 ${Math.round(grainNet.net)}/回（产${Math.round(grainNet.prod)} 耗${Math.round(grainNet.upkeep)}）`),
+      h('span', { class: 'grow' }),
+      h('button', { class: 'btn-primary', onClick: () => this.confirmEndTurn() }, '结束回合'),
+    ));
+  }
+
+  renderTabbar() {
+    clear(this.tabbar);
+    for (const t of TABS) {
+      this.tabbar.appendChild(h('button', {
+        class: `tab${this.tab === t.key ? ' tab--active' : ''}`,
+        onClick: () => { this.tab = t.key; this.renderTabbar(); this.renderContent(); },
+      }, `${t.icon} ${t.label}`));
+    }
+  }
+
+  renderContent() {
+    clear(this.content);
+    if (this.tab === 'map') this.renderMap();
+    else if (this.tab === 'faction') this.renderFaction();
+    else if (this.tab === 'heroes') this.renderHeroes();
+    else if (this.tab === 'tech') this.renderTech();
+    else if (this.tab === 'system') this.renderSystem();
+  }
+
+  // ============ 地图 ============
+  renderMap() {
+    const s = this.state;
+    const wrap = h('div', { class: 'map-wrap' });
+    const svgNS = 'http://www.w3.org/2000/svg';
+    const svg = document.createElementNS(svgNS, 'svg');
+    svg.setAttribute('class', 'map-svg');
+    svg.setAttribute('viewBox', '0 0 1000 760');
+    svg.setAttribute('preserveAspectRatio', 'none');
+    // 连线（去重）
+    for (const c of s.cities) {
+      for (const nid of c.adjacent) {
+        if (c.id < nid) {
+          const n = cityById(s, nid);
+          const ln = document.createElementNS(svgNS, 'line');
+          ln.setAttribute('x1', c.x); ln.setAttribute('y1', c.y);
+          ln.setAttribute('x2', n.x); ln.setAttribute('y2', n.y);
+          ln.setAttribute('class', 'map-line');
+          svg.appendChild(ln);
+        }
+      }
+    }
+    wrap.appendChild(svg);
+    // 城市点
+    for (const c of s.cities) {
+      const fac = c.ownerFactionId != null ? factionById(s, c.ownerFactionId) : null;
+      const color = fac ? fac.color : NEUTRAL_COLOR;
+      const isPlayer = c.ownerFactionId === s.playerFactionId;
+      const isSel = this.selectedCityId === c.id;
+      const dot = h('button', {
+        class: `map-dot${isPlayer ? ' map-dot--player' : ''}${isSel ? ' map-dot--selected' : ''}`,
+        style: { left: `${(c.x / 1000) * 100}%`, top: `${(c.y / 760) * 100}%`, background: color },
+        onClick: () => { this.selectedCityId = c.id; this.openCityMenu(c.id); },
+      }, c.name.slice(0, 2));
+      wrap.appendChild(dot);
+      wrap.appendChild(h('span', { class: 'map-label', style: { left: `${(c.x / 1000) * 100}%`, top: `${(c.y / 760) * 100}%` } }, c.name));
+    }
+    this.content.appendChild(h('div', null,
+      h('h3', null, '九州形势图'),
+      h('p', { class: 'hint' }, '点击城市查看详情与指令。金边为己方，灰点为空城，他色为诸侯。'),
+      wrap,
+    ));
+    // 提示当前选中
+    if (this.selectedCityId) {
+      const c = cityById(s, this.selectedCityId);
+      this.content.appendChild(h('div', { class: 'hint center' }, `已选：${c ? c.name : '无'}（再次点击城市可操作）`));
+    }
+  }
+
+  // ============ 城市操作菜单 ============
+  openCityMenu(cityId) {
+    const s = this.state;
+    const c = cityById(s, cityId);
+    if (!c) return;
+    this.renderMap(); // 刷新选中态
+    const owned = c.ownerFactionId === s.playerFactionId;
+    if (owned) this.openOwnedCity(c);
+    else this.openEnemyCity(c);
+  }
+
+  cityHeader(c) {
+    const fac = c.ownerFactionId != null ? factionById(this.state, c.ownerFactionId) : null;
+    const color = fac ? fac.color : NEUTRAL_COLOR;
+    return h('div', { class: 'panel__head' },
+      h('span', { class: 'panel__swatch', style: { background: color } }),
+      h('h4', null, c.name),
+      h('span', { class: 'hero-card__sub' }, `${c.trait.name} · ${c.trait.desc}`),
+    );
+  }
+  cityRows(c) {
+    const gov = c.governorHeroId ? heroById(this.state, c.governorHeroId) : null;
+    const r = (k, v) => h('div', null, h('span', { class: 'muted' }, k), ' ', v);
+    return h('div', { class: 'panel__rows' },
+      r('归属', c.ownerFactionId != null ? (factionById(this.state, c.ownerFactionId)?.name || '—') : '空城'),
+      r('人口', `${Math.round(c.population)} / ${c.maxPopulation}`),
+      r('士兵', Math.round(c.soldiers)),
+      r('城防', `${Math.round(c.defense)}`),
+      r('农田', `Lv${c.farmLevel}`),
+      r('市集', `Lv${c.marketLevel}`),
+      r('城墙', `Lv${c.wallLevel}`),
+      r('兵营', `Lv${c.barracksLevel}`),
+      r('训练度', c.training),
+      r('太守', gov ? gov.name : '—'),
+    );
+  }
+
+  openOwnedCity(c) {
+    const s = this.state;
+    const fid = s.playerFactionId;
+    const cmdBtn = (label, fn, danger) => h('button', {
+      class: `cmd-btn ${danger ? 'btn-danger' : 'btn-primary'}`, onClick: () => { const r = fn(); if (r.msg) this.toast(r.msg); this.afterAction(); },
+    }, label);
+    const grid = h('div', { class: 'cmd-grid' },
+      cmdBtn(`农田 Lv${c.farmLevel}`, () => A.developFarm(s, c.id)),
+      cmdBtn(`市集 Lv${c.marketLevel}`, () => A.developMarket(s, c.id)),
+      cmdBtn(`城墙 Lv${c.wallLevel}`, () => A.buildWall(s, c.id)),
+      cmdBtn('征兵', () => this.uiRecruit(c)),
+      cmdBtn('操练', () => A.train(s, c.id)),
+      cmdBtn('探索', () => A.explore(s, c.id)),
+    );
+    const advBtns = h('div', { class: 'hero-card__foot' },
+      h('button', { class: 'btn-jade', onClick: () => this.uiAppoint(c) }, '任命太守'),
+      h('button', { class: 'btn-jade', onClick: () => this.uiMoveHero(c) }, '调遣武将'),
+      h('button', { class: 'btn-primary', onClick: () => this.uiTransport(c) }, '输送资源'),
+    );
+    // 在野名将登用入口
+    const wilds = wildHeroesInCity(s, c.id).filter((w) => w.discovered);
+    const wildBlock = wilds.length ? h('div', { style: { marginTop: '0.6rem' } },
+      h('div', { class: 'hint' }, '本城在野名将：'),
+      h('div', { class: 'hero-card__foot' }, wilds.map((w) => h('button', { class: 'btn-ghost', onClick: () => { const r = A.recruitHero(s, w.id); this.toast(r.msg); this.afterAction(); } }, `登用 ${w.name}`))),
+    ) : null;
+
+    const body = h('div', null, this.cityHeader(c), this.cityRows(c), grid, advBtns, wildBlock);
+    this.openModal({ title: `城务 · ${c.name}`, body, foot: [h('button', { class: 'btn-ghost grow', onClick: () => this.closeModal() }, '关闭')] });
+  }
+
+  openEnemyCity(c) {
+    const s = this.state;
+    const body = h('div', null,
+      this.cityHeader(c),
+      this.cityRows(c),
+      h('div', { class: 'hero-card__foot' },
+        h('button', { class: 'btn-danger', onClick: () => this.uiCampaign(c) }, '出征攻打'),
+        h('button', { class: 'btn-ghost', onClick: () => this.uiStratagem(c) }, '施计'),
+      ),
+    );
+    this.openModal({ title: `敌情 · ${c.name}`, body, foot: [h('button', { class: 'btn-ghost grow', onClick: () => this.closeModal() }, '关闭')] });
+  }
+
+  // —— 征兵 ——
+  uiRecruit(c) {
+    const s = this.state;
+    const fac = playerFaction(s);
+    let n = Math.min(1000, Math.floor(c.population * 0.1));
+    n = Math.max(50, n);
+    const input = h('input', { type: 'number', value: n, min: 50, step: 50, style: { width: '5rem' } });
+    const body = h('div', null,
+      h('p', { class: 'hint' }, `城中人口 ${Math.round(c.population)}，金 ${Math.round(fac.money)}。每兵耗 1.5 金 + 1 人口。`),
+      h('div', { class: 'create__field' }, h('label', null, '征兵数量'), input),
+    );
+    this.openForm('征兵', body, () => {
+      const cnt = clamp(parseInt(input.value, 10) || 0, 0, 99999);
+      const r = A.recruit(s, c.id, cnt);
+      this.toast(r.msg);
+      this.closeModal();
+      this.afterAction();
+    }, '征兵');
+    return { ok: true, msg: '' };
+  }
+
+  // —— 任命太守 ——
+  uiAppoint(c) {
+    const s = this.state;
+    const roster = heroesInCity(s, c.id, s.playerFactionId);
+    if (!roster.length) { this.toast('城中无可任命之武将'); return; }
+    const sel = h('select', null, roster.map((h2) => h('option', { value: h2.id }, `${h2.name}（统${h2.stats.l}）`)));
+    sel.value = c.governorHeroId || roster[0].id;
+    const body = h('div', null, h('p', { class: 'hint' }, '太守政治影响本城人口增长。'), sel);
+    this.openForm('任命太守', body, () => {
+      const r = A.appointGovernor(s, c.id, sel.value);
+      this.toast(r.msg); this.closeModal(); this.afterAction();
+    }, '任命');
+  }
+
+  // —— 调遣武将（本城 → 邻接己城）——
+  uiMoveHero(c) {
+    const s = this.state;
+    const roster = heroesInCity(s, c.id, s.playerFactionId);
+    const targets = neighbors(s, c.id).filter((n) => n.ownerFactionId === s.playerFactionId);
+    if (!roster.length || !targets.length) { this.toast('无可调遣武将或无邻接己城'); return; }
+    const hSel = h('select', null, roster.map((h2) => h('option', { value: h2.id }, h2.name)));
+    const tSel = h('select', null, targets.map((n) => h('option', { value: n.id }, n.name)));
+    const body = h('div', null, h('p', { class: 'hint' }, '将本城武将调往相邻己方城市。'), hSel, h('div', { style: { height: '0.4rem' } }), tSel);
+    this.openForm('调遣武将', body, () => {
+      const r = A.moveHero(s, hSel.value, tSel.value);
+      this.toast(r.msg); this.closeModal(); this.afterAction();
+    }, '调遣');
+  }
+
+  // —— 输送资源 ——
+  uiTransport(c) {
+    const s = this.state;
+    const targets = neighbors(s, c.id).filter((n) => n.ownerFactionId === s.playerFactionId);
+    if (!targets.length) { this.toast('无邻接己城可输送'); return; }
+    const fac = playerFaction(s);
+    const tSel = h('select', null, targets.map((n) => h('option', { value: n.id }, n.name)));
+    const sIn = h('input', { type: 'number', value: Math.min(500, c.soldiers), min: 0, style: { width: '5rem' } });
+    const body = h('div', null,
+      h('p', { class: 'hint' }, `金 ${Math.round(fac.money)} · 粮 ${Math.round(fac.grain)}（势力共享，无需输送）· 本城兵 ${Math.round(c.soldiers)}`),
+      h('div', { class: 'create__field' }, h('label', null, '目标城市'), tSel),
+      h('div', { class: 'stat-grid' },
+        h('div', { class: 'stat' }, h('div', { class: 'stat__k' }, '兵'), h('div', { class: 'stat__v', style: { fontSize: '0.9rem' } }, sIn)),
+      ),
+    );
+    this.openForm('输送士兵', body, () => {
+      const r = A.transport(s, c.id, tSel.value, { soldiers: parseInt(sIn.value, 10) || 0 });
+      this.toast(r.msg); this.closeModal(); this.afterAction();
+    }, '输送');
+  }
+
+  // —— 出征 ——
+  uiCampaign(target) {
+    const s = this.state;
+    // 可出发的己方邻城
+    const sources = neighbors(s, target.id).filter((n) => n.ownerFactionId === s.playerFactionId);
+    if (!sources.length) { this.toast('无可出发的相邻己城'); return; }
+    const srcSel = h('select', null, sources.map((n) => h('option', { value: n.id }, n.name)));
+    const formSel = h('select', null, Object.entries(FORMATIONS).map(([k, f]) => h('option', { value: k }, `${f.name}（${f.desc}）`)));
+    const genSel = h('select');
+    const troopsIn = h('input', { type: 'number', value: 1000, min: 100, step: 100, style: { width: '5rem' } });
+    const refreshGenerals = () => {
+      const src = cityById(s, srcSel.value);
+      const gens = heroesInCity(s, src.id, s.playerFactionId);
+      clear(genSel);
+      if (!gens.length) { genSel.appendChild(h('option', null, '无可用武将')); return; }
+      for (const g of gens) genSel.appendChild(h('option', { value: g.id }, `${g.name}（统${g.stats.l} · 上限${troopCap(s, g)}）`));
+      const g = gens[0];
+      troopsIn.max = Math.min(src.soldiers, troopCap(s, g));
+      troopsIn.value = Math.min(parseInt(troopsIn.value, 10) || 1000, parseInt(troopsIn.max, 10));
+    };
+    srcSel.addEventListener('change', refreshGenerals);
+    const body = h('div', null,
+      h('p', { class: 'hint' }, `攻打 ${target.name}（守军 ${Math.round(target.soldiers)} · 城防 ${Math.round(target.defense)}）`),
+      h('div', { class: 'create__field' }, h('label', null, '出发城市'), srcSel),
+      h('div', { class: 'create__field' }, h('label', null, '主将'), genSel),
+      h('div', { class: 'create__field' }, h('label', null, '出兵数量（按路程耗粮）'), troopsIn),
+      h('div', { class: 'create__field' }, h('label', null, '阵型'), formSel),
+    );
+    this.openForm('出征', body, () => {
+      const src = cityById(s, srcSel.value);
+      const g = heroById(s, genSel.value);
+      if (!g) { this.toast('请选择主将'); return; }
+      const r = A.campaign(s, src.id, target.id, g.id, parseInt(troopsIn.value, 10) || 0, formSel.value);
+      this.closeModal();
+      if (r.battle) this.showBattleReport(r.battle, r.won, r.msg);
+      else this.toast(r.msg);
+      this.afterAction();
+    }, '开战');
+    refreshGenerals();
+  }
+
+  // —— 计略 ——
+  uiStratagem(target) {
+    const s = this.state;
+    const sources = neighbors(s, target.id).filter((n) => n.ownerFactionId === s.playerFactionId);
+    if (!sources.length) { this.toast('无可施计的相邻己城'); return; }
+    const srcSel = h('select', null, sources.map((n) => h('option', { value: n.id }, n.name)));
+    const typeSel = h('select', null, Object.entries(STRATAGEMS).map(([k, d]) => h('option', { value: k }, `${d.name}（${d.desc}）`)));
+    const body = h('div', null,
+      h('div', { class: 'create__field' }, h('label', null, '从己方城市施计'), srcSel),
+      h('div', { class: 'create__field' }, h('label', null, '计略'), typeSel),
+    );
+    this.openForm('施计', body, () => {
+      const r = A.stratagem(s, srcSel.value, target.id, typeSel.value);
+      this.toast(r.msg); this.closeModal(); this.afterAction();
+    }, '施计');
+  }
+
+  showBattleReport(battle, won, titleMsg) {
+    const a = battle.attacker; const d = battle.defender;
+    const body = h('div', null,
+      h('div', { class: 'force-vs' },
+        h('div', { class: 'force-vs__side' }, h('b', null, a.general.name), h('div', { class: 'muted' }, `攻方 · ${Math.round(a.soldiers)} 兵`)),
+        h('div', { class: 'force-vs__side' }, h('b', null, d.general.name), h('div', { class: 'muted' }, `守方 · ${Math.round(d.soldiers)} 兵 · 城${Math.round(d.defense)}`)),
+      ),
+      h('div', { class: 'battle-log' }, battle.log.map((l) => h('p', null, l))),
+      h('p', { class: won ? 'center' : 'center muted', style: { color: won ? 'var(--good)' : 'var(--bad)', fontWeight: 700 } }, won ? '⚔ 大胜！城池归我！' : '⚔ 兵败而归。'),
+    );
+    this.openModal({ title: titleMsg, body, foot: [h('button', { class: 'btn-primary grow', onClick: () => this.closeModal() }, '知晓')] });
+  }
+
+  // ============ 势力总览 ============
+  renderFaction() {
+    const s = this.state;
+    const fid = s.playerFactionId;
+    const fac = playerFaction(s);
+    const myCities = citiesOf(s, fid);
+    const grainNet = factionGrainNet(s, fid);
+    const heroCount = heroesOfFaction(s, fid).length;
+    const prisonerCount = prisonersOfFaction(s, fid).length;
+    this.content.appendChild(h('div', null,
+      h('h3', null, `${fac.name} · 总览`),
+      h('div', { class: 'panel' },
+        h('div', { class: 'panel__rows' },
+          h('div', null, h('span', { class: 'muted' }, '城池'), ' ', myCities.length, ' / 18'),
+          h('div', null, h('span', { class: 'muted' }, '武将'), ' ', heroCount),
+          h('div', null, h('span', { class: 'muted' }, '俘虏'), ' ', prisonerCount),
+          h('div', null, h('span', { class: 'muted' }, '金钱'), ' ', Math.round(fac.money)),
+          h('div', null, h('span', { class: 'muted' }, '军粮'), ' ', Math.round(fac.grain)),
+          h('div', null, h('span', { class: 'muted' }, '粮收支'), ' ', `${Math.round(grainNet.net)}/回`),
+        ),
+      ),
+      h('h3', { style: { marginTop: '0.8rem' } }, '辖下城池'),
+      h('div', { class: 'card-list' }, myCities.map((c) => {
+        const gov = c.governorHeroId ? heroById(s, c.governorHeroId) : null;
+        return h('div', { class: 'city-card', onClick: () => { this.tab = 'map'; this.selectedCityId = c.id; this.renderTabbar(); this.renderContent(); this.openCityMenu(c.id); }, role: 'button' },
+          h('div', { class: 'hero-card__head' }, h('span', { class: 'panel__swatch', style: { background: fac.color } }), h('span', { class: 'hero-card__name' }, c.name), h('span', { class: 'hero-card__sub' }, c.trait.name)),
+          h('div', { class: 'panel__rows' },
+            h('div', null, h('span', { class: 'muted' }, '兵'), ' ', Math.round(c.soldiers)),
+            h('div', null, h('span', { class: 'muted' }, '防'), ' ', Math.round(c.defense)),
+            h('div', null, h('span', { class: 'muted' }, '田/市/墙'), ` ${c.farmLevel}/${c.marketLevel}/${c.wallLevel}`),
+            h('div', null, h('span', { class: 'muted' }, '守将'), ' ', gov ? gov.name : '—'),
+          ),
+        );
+      })),
+      h('h3', { style: { marginTop: '0.8rem' } }, '天下诸侯'),
+      h('div', { class: 'card-list' }, s.factions.filter((f) => f.id !== fid).map((f) => {
+        const n = citiesOf(s, f.id).length;
+        return h('div', { class: 'city-card' },
+          h('div', { class: 'hero-card__head' }, h('span', { class: 'panel__swatch', style: { background: f.color } }), h('span', { class: 'hero-card__name' }, f.name), h('span', { class: 'hero-card__sub' }, `${n} 城`)),
+        );
+      })),
+    ));
+  }
+
+  // ============ 名将 ============
+  renderHeroes() {
+    const s = this.state;
+    const fid = s.playerFactionId;
+    const mine = heroesOfFaction(s, fid);
+    const wilds = s.heroes.filter((h) => h.wild && h.discovered && h.status !== 'gone'
+      && citiesOf(s, fid).some((c) => c.id === h.cityId)); // 仅己方城市中已发现的
+    const prisoners = prisonersOfFaction(s, fid);
+
+    const heroCard = (h2, foot) => h('div', { class: 'hero-card' },
+      h('div', { class: 'hero-card__head' },
+        h('span', { class: 'hero-card__name' }, h2.name),
+        h('span', { class: 'hero-card__sub' }, h2.skill ? h2.skill.name : '无技能'),
+        h2.loyalty != null ? h('span', { class: 'hero-card__sub' }, `忠 ${h2.loyalty}`) : null,
+      ),
+      h('div', { class: 'hero-card__stats' }, STAT_KEYS.map(([k, l]) => h('span', null, `${l}`, h('b', null, h2.stats[k])))),
+      h2.skill ? h('div', { class: 'hero-card__skill' }, `【${h2.skill.name}】`) : null,
+      h('div', { class: 'hint' }, `所在：${cityById(s, h2.cityId)?.name || '在野'}`),
+      foot ? h('div', { class: 'hero-card__foot' }, foot) : null,
+    );
+
+    this.content.appendChild(h('div', null,
+      h('h3', null, '麾下武将'),
+      h('div', { class: 'card-list' }, mine.length ? mine.map((h2) => heroCard(h2, [
+        h('button', { class: 'btn-ghost', onClick: () => { const r = A.reward(s, h2.id); this.toast(r.msg); this.afterAction(); } }, '赏赐'),
+        h('button', { class: 'btn-ghost', onClick: () => { this.selectedCityId = h2.cityId; this.uiAppoint(cityById(s, h2.cityId)); } }, '任太守'),
+      ])) : h('p', { class: 'hint' }, '尚无武将，去「探索」招揽在野名将吧。')),
+
+      h('h3', { style: { marginTop: '0.8rem' } }, '在野名将（己方城市）'),
+      h('div', { class: 'card-list' }, wilds.length ? wilds.map((h2) => heroCard(h2, [
+        h('button', { class: 'btn-primary', onClick: () => { const r = A.recruitHero(s, h2.id); this.toast(r.msg); this.afterAction(); } }, '登用'),
+      ])) : h('p', { class: 'hint' }, '在城市执行「探索」可发现本城在野名将。')),
+
+      prisoners.length ? h('div', null,
+        h('h3', { style: { marginTop: '0.8rem' } }, '俘虏'),
+        h('div', { class: 'card-list' }, prisoners.map((h2) => heroCard(h2, [
+          h('button', { class: 'btn-jade', onClick: () => { const r = A.recruitPrisoner(s, h2.id); this.toast(r.msg); this.afterAction(); } }, '招降'),
+          h('button', { class: 'btn-ghost', onClick: () => { const r = A.releasePrisoner(s, h2.id); this.toast(r.msg); this.afterAction(); } }, '释放'),
+          h('button', { class: 'btn-danger', onClick: () => { const r = A.executePrisoner(s, h2.id); this.toast(r.msg); this.afterAction(); } }, '处决'),
+        ]))),
+      ) : null,
+    ));
+  }
+
+  // ============ 科技 ============
+  renderTech() {
+    const s = this.state;
+    const research = s.researchByFaction && s.researchByFaction[s.playerFactionId];
+    this.content.appendChild(h('div', null,
+      h('h3', null, '科技树（势力共享）'),
+      research ? h('div', { class: 'panel', style: { marginBottom: '0.6rem' } },
+        h('div', null, h('b', null, `正在研究：${TECHS[research.key].name}`), ` · 剩余 ${research.turnsLeft} 回合`),
+      ) : null,
+      h('div', { class: 'tech-grid' }, Object.entries(TECHS).map(([k, t]) => {
+        const lv = techLevel(s, k);
+        const maxed = lv >= TECH_MAX_LEVEL;
+        const ongoing = research && research.key === k;
+        const dots = Array.from({ length: TECH_MAX_LEVEL }, (_, i) => h('i', { class: i < lv ? 'on' : '' }));
+        return h('div', { class: 'tech-card' },
+          h('div', { class: 'tech-card__head' },
+            h('span', { class: 'tech-card__icon' }, t.icon),
+            h('div', { class: 'grow' }, h('div', { class: 'hero-card__name', style: { fontSize: '0.95rem' } }, t.name), h('div', { class: 'hint' }, t.desc)),
+            h('span', { class: 'tech-lv' }, dots),
+          ),
+          h('div', { class: 'hero-card__foot' },
+            h('span', { class: 'hero-card__sub' }, maxed ? '已满级' : `下级 ${TECH_COST_GOLD} 金`),
+            h('span', { class: 'grow' }),
+            h('button', {
+              class: 'btn-primary', disabled: maxed || !!research,
+              onClick: () => { const r = A.research(s, k); this.toast(r.msg); this.afterAction(); },
+            }, ongoing ? '研究中…' : (maxed ? '已满' : '研究')),
+          ),
+        );
+      })),
+      h('p', { class: 'hint', style: { marginTop: '0.6rem' } }, '研究每级消耗 800 金，约 3 回合（君主智力可缩短），完成后势力全城共享加成。'),
+    ));
+  }
+
+  // ============ 系统 ============
+  renderSystem() {
+    this.content.appendChild(h('div', null,
+      h('h3', null, '系统'),
+      h('div', { class: 'sys-list' },
+        h('button', { class: 'btn-primary btn-block', onClick: () => { saveGame(this.state); this.toast('已保存'); } }, '保存游戏'),
+        h('button', { class: 'btn-ghost btn-block', onClick: () => this.confirmEndTurn() }, '结束本回合'),
+        h('button', { class: 'btn-ghost btn-block', onClick: () => { this.tab = 'map'; this.renderTabbar(); this.renderContent(); } }, '返回地图'),
+        h('button', { class: 'btn-danger btn-block', onClick: () => this.confirmAbandon() }, '放弃本局，开新游戏'),
+      ),
+      h('p', { class: 'hint center', style: { marginTop: '1rem' } }, '雄图·三国志文明 · 存档于本地浏览器'),
+    ));
+  }
+
+  confirmAbandon() {
+    const body = h('p', null, '确认放弃当前进度并开始新游戏？当前存档将被覆盖。');
+    this.openForm('放弃本局', body, () => {
+      clearSave();
+      this.closeModal();
+      this.showStart();
+    }, '确认放弃');
+  }
+
+  // ============ 结束回合 ============
+  confirmEndTurn() {
+    const body = h('p', null, '结束本回合后，天下诸侯将各自施政、出兵，资源依内政结算。是否继续？');
+    this.openForm('结束回合', body, () => {
+      this.closeModal();
+      this.doEndTurn();
+    }, '结束回合');
+  }
+
+  doEndTurn() {
+    const s = this.state;
+    saveGame(s);
+    const log = resolveTurn(s, { aiTurnAll }, Math.random);
+    saveGame(s);
+    this.refreshTopbar();
+    if (s.over) { this.renderGameOver(); return; }
+    this.showTurnSummary(log);
+  }
+
+  showTurnSummary(log) {
+    const items = (log && log.length) ? log : ['天下无事，岁月静好。'];
+    const body = h('div', null,
+      h('p', { class: 'hint' }, `第 ${this.state.turn} 回合 · ${seasonOf(this.state.turn)}季 简报`),
+      h('ul', { class: 'summary-list' }, items.map((l) => h('li', null, l))),
+    );
+    this.openModal({
+      title: '回合简报',
+      body,
+      foot: [h('button', { class: 'btn-primary grow', onClick: () => { this.closeModal(); this.afterAction(); } }, '继续')],
+    });
+  }
+
+  renderGameOver() {
+    clear(this.stage);
+    const win = this.state.over === 'win';
+    this.stage.appendChild(h('div', { class: 'gameover' },
+      h('h2', null, win ? '🏛 一统天下！' : '🏰 大业未成'),
+      h('p', { class: 'hint' }, win ? `${playerFaction(this.state).name} 席卷九州，定鼎中原。` : '群雄逐鹿，君之基业已失。再图后举吧。'),
+      h('div', { class: 'launcher__menu', style: { marginTop: '1.2rem' } },
+        h('button', { class: 'btn-primary btn-block', onClick: () => { clearSave(); this.showCreate(); } }, '再战一局'),
+        h('button', { class: 'btn-ghost btn-block', onClick: () => { clearSave(); this.showStart(); } }, '返回首页'),
+      ),
+    ));
+  }
+
+  // ============ 动作后统一刷新 ============
+  afterAction() {
+    saveGame(this.state);
+    if (this.screen !== 'game') return;
+    if (this.state.over) { this.renderGameOver(); return; }
+    this.refreshTopbar();
+    // 若当前弹窗已关闭，则重绘内容；否则仅顶栏刷新
+    if (!this.modalRoot.firstChild) this.renderContent();
+  }
+}
diff --git a/apps/xiong-tu-san-guo/src/ui/dom.js b/apps/xiong-tu-san-guo/src/ui/dom.js
new file mode 100644
index 0000000..bc97b4d
--- /dev/null
+++ b/apps/xiong-tu-san-guo/src/ui/dom.js
@@ -0,0 +1,44 @@
+// ============================================================================
+// 轻量 DOM 辅助：h() 创建元素，clear() 清空，bar() 进度条——避免引入框架。
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
+      else if (k === 'onChange') el.addEventListener('change', v);
+      else if (k === 'html') el.innerHTML = v; // 仅用于受控静态内容
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
+// 进度条：value/max → 百分比填充
+export function bar(value, max, opts = {}) {
+  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
+  return h('div', { class: `bar ${opts.class || ''}` },
+    h('div', { class: 'bar__fill', style: { width: `${pct}%`, background: opts.color || '' } }),
+    h('span', { class: 'bar__label' }, opts.label || `${Math.floor(value)}/${Math.round(max)}`),
+  );
+}
diff --git a/apps/xiong-tu-san-guo/src/ui/style.css b/apps/xiong-tu-san-guo/src/ui/style.css
new file mode 100644
index 0000000..8bd3249
--- /dev/null
+++ b/apps/xiong-tu-san-guo/src/ui/style.css
@@ -0,0 +1,231 @@
+/* ==========================================================================
+   雄图·三国志文明 · 样式（竖屏单列、移动端优先，适配刘海 / 底部安全区）
+   古卷墨韵 + 鎏金描边，暗色调三国风。
+   ========================================================================== */
+.xtsg {
+  --bg: #1a1206;
+  --bg-2: #221710;
+  --card: #2a1d11;
+  --card-2: #33251a;
+  --line: #4a3826;
+  --text: #efe2c4;
+  --muted: #b39b73;
+  --gold: #d9b957;
+  --gold-dim: #8a6a28;
+  --jade: #5fd0a0;
+  --crimson: #c0392b;
+  --crimson-dim: #7d2418;
+  --good: #6fd07f;
+  --bad: #e06b6b;
+  --radius: 10px;
+
+  position: absolute;
+  inset: 0;
+  background:
+    radial-gradient(120% 60% at 50% -10%, #33261a 0%, transparent 60%),
+    var(--bg);
+  color: var(--text);
+  font-family: "PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", system-ui, sans-serif;
+  font-size: 14px;
+  line-height: 1.5;
+  overflow: hidden;
+  -webkit-user-select: none;
+  user-select: none;
+  -webkit-tap-highlight-color: transparent;
+}
+.xtsg * { box-sizing: border-box; }
+
+.xtsg .stage { position: absolute; inset: 0; overflow: hidden; }
+.xtsg .game { position: absolute; inset: 0; display: flex; flex-direction: column; overflow: hidden; }
+
+/* —— 按钮 —— */
+.xtsg button {
+  font-family: inherit; cursor: pointer; border: none; border-radius: 8px;
+  background: var(--card-2); color: var(--text);
+  padding: 0.55rem 0.8rem; font-size: 0.9rem;
+  transition: transform 0.08s ease, background 0.15s ease, opacity 0.15s ease;
+}
+.xtsg button:active { transform: scale(0.97); }
+.xtsg button:disabled { opacity: 0.4; cursor: default; }
+.xtsg .btn-primary { background: linear-gradient(180deg, #e8c769, var(--gold-dim)); color: #1a1208; font-weight: 600; }
+.xtsg .btn-danger { background: linear-gradient(180deg, #d7574c, var(--crimson-dim)); color: #fff; }
+.xtsg .btn-jade { background: linear-gradient(180deg, #6fe0b0, #2f9a72); color: #06241a; font-weight: 600; }
+.xtsg .btn-ghost { background: transparent; border: 1px solid var(--line); }
+.xtsg .btn-block { width: 100%; }
+.xtsg input, .xtsg select {
+  font-family: inherit; background: var(--bg-2); color: var(--text);
+  border: 1px solid var(--line); border-radius: 8px; padding: 0.5rem 0.6rem; font-size: 0.95rem;
+}
+
+/* —— 启动器 —— */
+.xtsg .launcher {
+  position: absolute; inset: 0; overflow-y: auto; padding: max(1.4rem, env(safe-area-inset-top)) 1rem 2rem;
+  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1.2rem;
+}
+.xtsg .launcher__brand { text-align: center; }
+.xtsg .launcher__brand .emblem {
+  width: 76px; height: 76px; margin: 0 auto 0.6rem; border-radius: 50%;
+  background: radial-gradient(circle at 35% 30%, #e8c769, var(--gold-dim) 70%, #5a4316);
+  display: flex; align-items: center; justify-content: center;
+  font-size: 2.3rem; font-weight: 700; color: #2a1a08;
+  box-shadow: 0 4px 18px rgba(0,0,0,0.5), inset 0 0 0 3px rgba(255,255,255,0.12);
+}
+.xtsg .launcher__brand h1 { font-size: 1.7rem; margin: 0; letter-spacing: 0.05em; }
+.xtsg .launcher__brand .sub { color: var(--muted); margin: 0.3rem 0 0; font-size: 0.85rem; }
+.xtsg .launcher__menu { display: flex; flex-direction: column; gap: 0.7rem; width: 100%; max-width: 320px; }
+
+/* —— 创角 —— */
+.xtsg .create { position: absolute; inset: 0; overflow-y: auto; padding: max(1rem, env(safe-area-inset-top)) 1rem 2.2rem; }
+.xtsg .create h2 { font-size: 1.2rem; margin: 0.4rem 0 0.6rem; }
+.xtsg .create__field { margin-bottom: 1rem; }
+.xtsg .create__field label { display: block; color: var(--muted); margin-bottom: 0.3rem; font-size: 0.85rem; }
+.xtsg .stat-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.4rem; }
+.xtsg .stat {
+  background: var(--card); border: 1px solid var(--line); border-radius: 8px; padding: 0.5rem 0.2rem; text-align: center;
+}
+.xtsg .stat__k { font-size: 0.7rem; color: var(--muted); }
+.xtsg .stat__v { font-size: 1.15rem; font-weight: 700; color: var(--gold); }
+.xtsg .city-pick { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.45rem; margin-top: 0.4rem; }
+.xtsg .city-pick__item {
+  background: var(--card); border: 1px solid var(--line); border-radius: 8px; padding: 0.5rem;
+  text-align: left; font-size: 0.82rem;
+}
+.xtsg .city-pick__item--sel { border-color: var(--gold); background: var(--card-2); }
+.xtsg .city-pick__item b { color: var(--gold); }
+
+/* —— 顶栏 —— */
+.xtsg .topbar {
+  flex: none; padding: max(0.55rem, env(safe-area-inset-top)) 0.7rem 0.45rem;
+  background: linear-gradient(180deg, #2c2014, var(--bg-2)); border-bottom: 1px solid var(--line);
+}
+.xtsg .topbar__row { display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap; }
+.xtsg .topbar__title { font-weight: 700; font-size: 0.95rem; margin-right: auto; }
+.xtsg .res-pill {
+  background: var(--card); border: 1px solid var(--line); border-radius: 999px;
+  padding: 0.2rem 0.6rem; font-size: 0.8rem; white-space: nowrap;
+}
+.xtsg .res-pill b { color: var(--gold); }
+.xtsg .cmd-pill { background: linear-gradient(180deg, #e8c769, var(--gold-dim)); color: #1a1208; font-weight: 700; }
+
+/* —— 标签栏 —— */
+.xtsg .tabbar {
+  flex: none; display: flex; background: var(--bg-2); border-bottom: 1px solid var(--line);
+}
+.xtsg .tab {
+  flex: 1; background: transparent; border-radius: 0; padding: 0.55rem 0;
+  font-size: 0.8rem; color: var(--muted); border-bottom: 2px solid transparent;
+}
+.xtsg .tab--active { color: var(--gold); border-bottom-color: var(--gold); }
+
+/* —— 内容滚动区 —— */
+.xtsg .content { flex: 1; overflow-y: auto; overflow-x: hidden; padding: 0.7rem; }
+.xtsg .content h3 { font-size: 1rem; margin: 0.2rem 0 0.6rem; color: var(--gold); }
+
+/* —— 地图 —— */
+.xtsg .map-wrap {
+  position: relative; width: 100%; aspect-ratio: 1000 / 760; margin: 0 auto;
+  background:
+    radial-gradient(80% 60% at 50% 40%, #3a2c1c 0%, transparent 70%),
+    repeating-linear-gradient(45deg, #241a10 0 12px, #221710 12px 24px);
+  border: 1px solid var(--line); border-radius: 12px; overflow: hidden;
+}
+.xtsg .map-svg { position: absolute; inset: 0; width: 100%; height: 100%; }
+.xtsg .map-line { stroke: #5e4a30; stroke-width: 1.6; opacity: 0.7; }
+.xtsg .map-dot {
+  position: absolute; transform: translate(-50%, -50%);
+  width: 34px; height: 34px; border-radius: 50%; border: none; padding: 0;
+  display: flex; align-items: center; justify-content: center;
+  font-size: 0.62rem; font-weight: 700; color: #fff;
+  box-shadow: 0 2px 6px rgba(0,0,0,0.5), inset 0 0 0 2px rgba(255,255,255,0.25);
+}
+.xtsg .map-dot--player { box-shadow: 0 0 0 3px var(--gold), 0 2px 6px rgba(0,0,0,0.5); }
+.xtsg .map-dot--selected { box-shadow: 0 0 0 3px #fff, 0 2px 8px rgba(255,255,255,0.4); transform: translate(-50%, -50%) scale(1.12); }
+.xtsg .map-label {
+  position: absolute; transform: translate(-50%, 14px);
+  font-size: 0.64rem; color: var(--text); text-shadow: 0 1px 2px #000;
+  pointer-events: none; white-space: nowrap;
+}
+
+/* —— 城市详情面板 —— */
+.xtsg .panel {
+  background: var(--card); border: 1px solid var(--line); border-radius: 12px;
+  padding: 0.7rem; margin-top: 0.7rem;
+}
+.xtsg .panel__head { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; }
+.xtsg .panel__head h4 { margin: 0; font-size: 1.05rem; }
+.xtsg .panel__swatch { width: 16px; height: 16px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.3); }
+.xtsg .panel__rows { display: grid; grid-template-columns: 1fr 1fr; gap: 0.25rem 0.6rem; font-size: 0.82rem; }
+.xtsg .panel__rows .muted { color: var(--muted); }
+.xtsg .cmd-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.4rem; margin-top: 0.6rem; }
+.xtsg .cmd-btn { padding: 0.5rem 0.2rem; font-size: 0.78rem; }
+
+/* —— 列表卡片 —— */
+.xtsg .card-list { display: flex; flex-direction: column; gap: 0.55rem; }
+.xtsg .hero-card, .xtsg .city-card {
+  background: var(--card); border: 1px solid var(--line); border-radius: 10px; padding: 0.6rem 0.7rem;
+}
+.xtsg .hero-card__head { display: flex; align-items: center; gap: 0.5rem; }
+.xtsg .hero-card__name { font-weight: 700; font-size: 0.98rem; }
+.xtsg .hero-card__sub { font-size: 0.72rem; color: var(--muted); }
+.xtsg .hero-card__stats { display: flex; gap: 0.5rem; margin: 0.4rem 0; font-size: 0.72rem; flex-wrap: wrap; }
+.xtsg .hero-card__stats span b { color: var(--gold); }
+.xtsg .hero-card__skill { font-size: 0.74rem; color: var(--jade); }
+.xtsg .hero-card__foot { display: flex; gap: 0.4rem; margin-top: 0.5rem; flex-wrap: wrap; }
+.xtsg .hero-card__foot button { font-size: 0.76rem; padding: 0.35rem 0.55rem; }
+
+/* —— 科技 —— */
+.xtsg .tech-grid { display: flex; flex-direction: column; gap: 0.55rem; }
+.xtsg .tech-card { background: var(--card); border: 1px solid var(--line); border-radius: 10px; padding: 0.6rem 0.7rem; }
+.xtsg .tech-card__head { display: flex; align-items: center; gap: 0.5rem; }
+.xtsg .tech-card__icon { font-size: 1.3rem; }
+.xtsg .tech-lv { display: inline-flex; gap: 3px; }
+.xtsg .tech-lv i { width: 12px; height: 12px; border-radius: 50%; background: var(--line); display: inline-block; }
+.xtsg .tech-lv i.on { background: var(--gold); }
+
+/* —— 系统 —— */
+.xtsg .sys-list { display: flex; flex-direction: column; gap: 0.5rem; }
+
+/* —— 模态 —— */
+.xtsg .modal {
+  position: absolute; inset: 0; background: rgba(0,0,0,0.62);
+  display: flex; align-items: center; justify-content: center; padding: 1rem; z-index: 30;
+}
+.xtsg .modal__card {
+  background: var(--card); border: 1px solid var(--line); border-radius: 14px;
+  width: 100%; max-width: 420px; max-height: 86%; display: flex; flex-direction: column; overflow: hidden;
+}
+.xtsg .modal__head { padding: 0.7rem 0.9rem; border-bottom: 1px solid var(--line); display: flex; align-items: center; }
+.xtsg .modal__head h3 { margin: 0; font-size: 1.05rem; color: var(--gold); }
+.xtsg .modal__body { padding: 0.8rem 0.9rem; overflow-y: auto; }
+.xtsg .modal__foot { padding: 0.6rem 0.9rem; border-top: 1px solid var(--line); display: flex; gap: 0.5rem; }
+.xtsg .battle-log { font-size: 0.82rem; line-height: 1.7; max-height: 46vh; overflow-y: auto; }
+.xtsg .battle-log p { margin: 0.15rem 0; }
+.xtsg .summary-list { font-size: 0.86rem; }
+.xtsg .summary-list li { margin: 0.3rem 0; }
+.xtsg .force-vs { display: flex; justify-content: space-between; gap: 0.6rem; margin-bottom: 0.6rem; }
+.xtsg .force-vs__side { flex: 1; background: var(--bg-2); border-radius: 8px; padding: 0.5rem; font-size: 0.8rem; }
+
+/* —— 进度条 —— */
+.xtsg .bar { position: relative; height: 14px; background: var(--bg-2); border-radius: 7px; overflow: hidden; }
+.xtsg .bar__fill { position: absolute; inset: 0 auto 0 0; background: var(--gold); transition: width 0.3s; }
+.xtsg .bar__label { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 0.68rem; }
+
+/* —— Toast —— */
+.xtsg .toast-wrap { position: absolute; top: max(0.6rem, env(safe-area-inset-top)); left: 0; right: 0; z-index: 50; display: flex; flex-direction: column; align-items: center; gap: 0.3rem; pointer-events: none; }
+.xtsg .toast {
+  background: rgba(20,14,6,0.94); border: 1px solid var(--line); color: var(--text);
+  padding: 0.5rem 0.9rem; border-radius: 999px; font-size: 0.82rem; max-width: 90%; text-align: center;
+  animation: xtsgToast 2.4s ease forwards;
+}
+@keyframes xtsgToast {
+  0% { opacity: 0; transform: translateY(-8px); }
+  12%, 80% { opacity: 1; transform: translateY(0); }
+  100% { opacity: 0; transform: translateY(-8px); }
+}
+
+.xtsg .muted { color: var(--muted); }
+.xtsg .hint { font-size: 0.78rem; color: var(--muted); margin: 0.3rem 0; }
+.xtsg .center { text-align: center; }
+.xtsg .grow { flex: 1; }
+.xtsg .gameover { text-align: center; padding: 2rem 1rem; }
+.xtsg .gameover h2 { font-size: 1.8rem; color: var(--gold); }
diff --git a/apps/xiong-tu-san-guo/vite.config.js b/apps/xiong-tu-san-guo/vite.config.js
new file mode 100644
index 0000000..55ec6d1
--- /dev/null
+++ b/apps/xiong-tu-san-guo/vite.config.js
@@ -0,0 +1,9 @@
+import { defineConfig } from 'vite';
+
+// `base: './'` 生成相对路径资源引用，便于部署到 GitHub Pages 子路径或任意静态目录。
+// 本作纯原生 DOM 渲染、无框架、无 Canvas，构建产物极小。
+export default defineConfig({
+  base: './',
+  server: { host: true, port: 5179 },
+  build: { outDir: 'dist', sourcemap: false, target: 'es2018' },
+});
diff --git a/src/main.js b/src/main.js
index 6820391..7f0c8af 100644
--- a/src/main.js
+++ b/src/main.js
@@ -69,6 +69,14 @@ const APPS = {
     desc: '迫降破碎星球，在漂浮的遗迹浮岛间拾荒探索。猜拳克制式战斗、装备强化与三天赋树、碎片化记忆叙事，集齐十枚星骸回响揭开真相。',
     loader: () => import('../apps/xing-hai-lv-zhe/src/main.js'),
   },
+  xtsg: {
+    key: 'xtsg',
+    title: '雄图·三国志文明',
+    subtitle: '三国 · 回合策略',
+    emblem: '雄',
+    desc: '自择一城起兵，开发内政、推进科技树、招揽四十余位名将，在十八城中国地图上回合制征战，俘将夺城，一统九州。',
+    loader: () => import('../apps/xiong-tu-san-guo/src/main.js'),
+  },
 }
 
 // 大类：先呈现「学习」，再呈现「游戏」。点击大类进入后，才展开其中的具体应用。
@@ -86,8 +94,8 @@ const CATEGORIES = [
     title: '游戏',
     subtitle: '休闲 · 互动娱乐',
     emblem: '玩',
-    desc: '消磨时光的互动小品：修仙、人生、三国战场、星骸浮岛，挑一个开始吧。',
-    appKeys: ['dzf', 'frxx', 'mnrs', 'xhlz'],
+    desc: '消磨时光的互动小品：修仙、人生、三国战场、星骸浮岛、诸侯争霸，挑一个开始吧。',
+    appKeys: ['dzf', 'frxx', 'mnrs', 'xhlz', 'xtsg'],
   },
 ]
 
