diff --git a/.ai-tasks/issue-3/ai-coder-prompt.md b/.ai-tasks/issue-3/ai-coder-prompt.md
new file mode 100644
index 0000000..5220d2c
--- /dev/null
+++ b/.ai-tasks/issue-3/ai-coder-prompt.md
@@ -0,0 +1,8 @@
+你是一个资深开发者。请解决以下 GitHub Issue：
+【任务标题】: 实现一个三国主题的塔防游戏
+【详细需求】: 请直接阅读当前目录下的 `.ai-tasks/issue-3/context.md` 文件获取。
+
+【⚠️ 严格红线规则】：
+请绝对不要修改、重命名或生成 `.github/` 目录下的任何文件 (特别是 workflows 等 CI/CD 配置)，这会破坏项目的自动化流程！如果觉得有必要修改，请在回复中用文字建议人类去改，绝不要自己动手改。
+
+请直接分析并修改项目中的代码文件来解决这个问题，不要做过多的文字解释。
diff --git a/.ai-tasks/issue-3/context.md b/.ai-tasks/issue-3/context.md
new file mode 100644
index 0000000..33642d9
--- /dev/null
+++ b/.ai-tasks/issue-3/context.md
@@ -0,0 +1,128 @@
+# 游戏设计方案：《鼎足三分》（Three Kingdoms: Tactical Defense）
+
+## 1. 游戏愿景
+一款基于 Web 的移动端塔防游戏。玩家扮演主公，通过部署三国名将（作为防御塔）阻击敌军，利用名将间的**羁绊阵法**和**战场策略**改变战局。
+
+---
+
+## 2. 核心玩法机制 (Mechanics)
+
+### 2.1 武将塔 (Generals as Towers)
+武将不再是静态建筑，而是具有方向性和技能的单位。
+*   **近战型（Melee）：** 部署在地面道路，具有 `Block`（阻挡数）属性，能直接拦截敌人。
+*   **远程型（Range）：** 部署在道路两侧高地，优先攻击最前方的敌人。
+*   **策士型（Mage）：** 造成法术伤害或减速，对重甲兵有效。
+
+### 2.2 羁绊与阵法系统 (Bonds & Formations)
+*   **检测逻辑：** 当特定武将在彼此的邻近格（8格）时激活。
+*   **示例：** 
+    *   **五虎上将：** 关羽、张飞同时在场时，全场蜀军攻击力 +20%。
+    *   **卧龙凤雏：** 诸葛亮、庞统相邻时，技能冷却缩减 30%。
+
+### 2.3 动态战场
+*   **气势值 (Morale)：** 击杀敌人获取，用于释放全局大招（如“火烧连营”）。
+*   **路径变化：** 部分关卡（如赤壁）路径会随波次改变（船只移动）。
+
+---
+
+## 3. 技术架构 (Technical Architecture)
+
+### 3.1 技术栈
+*   **引擎：** Phaser 3 (JavaScript/TypeScript)
+*   **构建工具：** Vite
+*   **部署：** GitHub Pages
+*   **适配：** 移动端优先，支持 Canvas 自动缩放 (Scale.FIT)
+
+### 3.2 核心类结构 (Class Structure)
+*   `GameScene`: 主循环，处理输入和碰撞检测。
+*   `Unit`: 基类。
+    *   `General`: 包含属性（ATK, RNG, CD）、技能、骨骼动画状态。
+    *   `Enemy`: 包含移动逻辑、血条、护甲属性。
+*   `MapManager`: 解析 Tilemap（建议使用 JSON 格式），管理可行走路径。
+*   `WaveManager`: 控制敌人生成序列。
+*   `BondManager`: 每当部署/移除武将时，重新扫描并激活羁绊 Buff。
+
+---
+
+## 4. 视觉与交互设计 (UI/UX)
+
+### 4.1 布局
+*   **上方：** 玩家生命值（桃）、资源量（金）、波次进度。
+*   **中间：** 12x8 或 16x9 的网格战场。
+*   **下方：** 武将选择栏（卡牌式），拖拽部署。
+
+### 4.2 手机端适配
+*   **操作：** 拖拽部署，点击武将弹出升级/撤退菜单。
+*   **方向：** 强制横屏（Landscape）。
+
+---
+
+## 5. 数据字典 (Data Schema) - 供 Agent 生成配置
+```json
+{
+  "generals": [
+    {
+      "id": "guanyu",
+      "name": "关羽",
+      "class": "MELEE",
+      "cost": 150,
+      "hp": 500,
+      "atk": 80,
+      "range": 1,
+      "block": 2,
+      "skill": "青龙偃月：对周围一格造成3倍伤害"
+    }
+  ],
+  "enemies": [
+    {
+      "id": "cavalry",
+      "name": "魏国骑兵",
+      "hp": 200,
+      "speed": 100,
+      "armor": "PHYSICAL"
+    }
+  ]
+}
+```
+
+---
+
+## 6. 开发路线图 (Roadmap for Code Agent)
+
+### 第一阶段：基础设施 (MVP)
+1.  **环境搭建：** Vite + Phaser 3 模板，配置 GitHub Actions 自动部署。
+2.  **网格系统：** 实现基础的地形分类（路、高地、基地）。
+3.  **核心循环：** 实现简单的“敌人沿路走”和“高地武将自动射击”。
+
+### 第二阶段：核心战斗逻辑
+1.  **近战阻挡：** 实现敌人被拦截在武将面前的逻辑。
+2.  **技能系统：** 实现 CD 冷却和范围伤害计算。
+3.  **UI 构建：** 实现底部拖拽武将到地图的交互。
+
+### 第三阶段：深度策略
+1.  **羁绊系统实现：** 编写 `BondManager` 扫描相邻单位。
+2.  **数值平衡：** 引入护甲计算（物理/法术）。
+3.  **特效增强：** 接入泼墨风格的打击特效。
+
+### 第四阶段：关卡与部署
+1.  **关卡配置：** 通过 JSON 加载不同地图。
+2.  **部署上线：** 完成 `gh-pages` 分支配置，确保手机通过 URL 直接访问。
+
+---
+
+## 7. 给 Code Agent 的首条启动指令
+
+> "请开始执行《鼎足三分》项目的第一阶段任务：
+> 1. 使用 Vite + Phaser 3 初始化项目。
+> 2. 配置一个 `1334x750` 的移动端适配画布。
+> 3. 实现一个简单的地图（用方块代表路和高地）。
+> 4. 实现一个 `Enemy` 类，让它能沿着预设的坐标路径移动。
+> 5. 编写一个 `.github/workflows/deploy.yml` 文件，以便代码推送到 GitHub 后自动部署到 Pages。"
+
+---
+
+## 8. 手机端测试 Checklist
+*   [ ] 页面在 iOS/Android 浏览器中是否能全屏？
+*   [ ] 触摸拖拽武将卡牌是否灵敏？
+*   [ ] 同屏 20 个单位时，手机端帧率是否保持 60FPS？
+*   [ ] 手机横竖屏切换时，画面是否会自动适配居中？
diff --git a/.ai-tasks/scripts/generate-ai-task.sh b/.ai-tasks/scripts/generate-ai-task.sh
old mode 100644
new mode 100755
diff --git a/.gitignore b/.gitignore
index 485dee6..91a2da6 100644
--- a/.gitignore
+++ b/.gitignore
@@ -1 +1,5 @@
 .idea
+node_modules
+dist
+.DS_Store
+*.log
diff --git a/README.md b/README.md
new file mode 100644
index 0000000..1988eb6
--- /dev/null
+++ b/README.md
@@ -0,0 +1,38 @@
+# 鼎足三分 · Three Kingdoms: Tactical Defense
+
+一款基于 Web 的移动端三国主题塔防游戏。玩家扮演主公，部署三国名将（武将塔）阻击敌军，利用**羁绊阵法**与**气势大招**改写战局。
+
+技术栈：**Phaser 3 + Vite**，移动端优先，Canvas 自适应缩放（`Scale.FIT`），强制横屏。
+
+## 本地运行
+
+```bash
+npm install
+npm run dev      # 开发服务器 http://localhost:5173
+npm run build    # 生产构建到 dist/
+npm run preview  # 预览生产构建
+```
+
+## 核心玩法
+
+- **武将职业**：近战（路面阻挡）/ 远程（高地射击）/ 策士（法术范围）。从底部卡牌**拖拽**到棋盘部署，点击已部署武将可**升级 / 撤退**。
+- **护甲克制**：重甲惧法、魔抗惧物——合理搭配职业才能破阵。
+- **羁绊阵法**：相邻部署特定武将自动激活（五虎上将、卧龙凤雏、群雄逐鹿……）。
+- **气势大招**：击杀积累气势，满 100 可释放**火烧连营**清场。
+- **关卡**：黄巾之乱（教学）、虎牢关（含 BOSS）。
+
+## 项目结构
+
+```
+src/
+  config.js            常量、网格/像素互转、伤害公式
+  data/                武将 / 敌军 / 羁绊 / 关卡 数据字典
+  managers/            MapManager / WaveManager / BondManager
+  entities/            Enemy / General / Projectile
+  scenes/              Boot / Preload / Menu / Game / UI / GameOver
+  utils/Fx.js          泼墨风格打击特效
+```
+
+## 部署（GitHub Pages）
+
+构建产物在 `dist/`，可直接作为静态站点部署。若需推送自动部署到 GitHub Pages，请由维护者新增一个 `.github/workflows/deploy.yml`（出于安全红线，AI 不自动创建 `.github/` 下的工作流文件）。
diff --git a/index.html b/index.html
new file mode 100644
index 0000000..1814519
--- /dev/null
+++ b/index.html
@@ -0,0 +1,70 @@
+<!doctype html>
+<html lang="zh-CN">
+
+<head>
+  <meta charset="UTF-8" />
+  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
+  <meta name="theme-color" content="#1a1410" />
+  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%231f1812'/%3E%3Ctext x='16' y='23' font-size='22' text-anchor='middle' fill='%23ead9b6' font-family='serif'%3E%E9%BC%8E%3C/text%3E%3C/svg%3E" />
+  <title>鼎足三分 · Three Kingdoms Defense</title>
+  <style>
+    html,
+    body {
+      margin: 0;
+      padding: 0;
+      width: 100%;
+      height: 100%;
+      background: #1a1410;
+      overflow: hidden;
+      font-family: "PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif;
+      -webkit-user-select: none;
+      user-select: none;
+      -webkit-tap-highlight-color: transparent;
+    }
+
+    #game-container {
+      width: 100vw;
+      height: 100vh;
+      display: flex;
+      align-items: center;
+      justify-content: center;
+    }
+
+    canvas {
+      touch-action: none;
+    }
+
+    /* 强制横屏：竖屏时给出旋转提示遮罩 */
+    #orientation-hint {
+      display: none;
+      position: fixed;
+      inset: 0;
+      background: #1a1410;
+      color: #e8d9b5;
+      z-index: 10;
+      align-items: center;
+      justify-content: center;
+      text-align: center;
+      padding: 24px;
+    }
+
+    @media (orientation: portrait) {
+      #orientation-hint {
+        display: flex;
+      }
+    }
+  </style>
+</head>
+
+<body>
+  <div id="game-container"></div>
+  <div id="orientation-hint">
+    <div>
+      <h1 style="font-size: 30px; margin: 0 0 12px;">📱 请横屏游玩</h1>
+      <p style="font-size: 16px; opacity: 0.85;">《鼎足三分》为横屏设计，请旋转设备以获得最佳体验。</p>
+    </div>
+  </div>
+  <script type="module" src="/src/main.js"></script>
+</body>
+
+</html>
diff --git a/package-lock.json b/package-lock.json
new file mode 100644
index 0000000..92aab52
--- /dev/null
+++ b/package-lock.json
@@ -0,0 +1,1044 @@
+{
+  "name": "ding-zu-san-fen",
+  "version": "1.0.0",
+  "lockfileVersion": 3,
+  "requires": true,
+  "packages": {
+    "": {
+      "name": "ding-zu-san-fen",
+      "version": "1.0.0",
+      "dependencies": {
+        "phaser": "^3.80.0"
+      },
+      "devDependencies": {
+        "vite": "^5.4.0"
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
+    "node_modules/eventemitter3": {
+      "version": "5.0.4",
+      "resolved": "https://registry.npmjs.org/eventemitter3/-/eventemitter3-5.0.4.tgz",
+      "integrity": "sha512-mlsTRyGaPBjPedk6Bvw+aqbsXDtoAyAzm5MO7JgU+yVRyMQ5O8bD4Kcci7BS85f93veegeCPkL8R4GLClnjLFw==",
+      "license": "MIT"
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
+    "node_modules/nanoid": {
+      "version": "3.3.15",
+      "resolved": "https://registry.npmjs.org/nanoid/-/nanoid-3.3.15.tgz",
+      "integrity": "sha512-y7Wygv/7mEOvxTuEQDB8StXdMRBWf1kR/tlhAzBRUFkB2jfcLOAxO/SHmOO2zgz1pVgK29/kyupn059/bCHdjA==",
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
+    "node_modules/phaser": {
+      "version": "3.90.0",
+      "resolved": "https://registry.npmjs.org/phaser/-/phaser-3.90.0.tgz",
+      "integrity": "sha512-/cziz/5ZIn02uDkC9RzN8VF9x3Gs3XdFFf9nkiMEQT3p7hQlWuyjy4QWosU802qqno2YSLn2BfqwOKLv/sSVfQ==",
+      "license": "MIT",
+      "dependencies": {
+        "eventemitter3": "^5.0.1"
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
+      "version": "8.5.15",
+      "resolved": "https://registry.npmjs.org/postcss/-/postcss-8.5.15.tgz",
+      "integrity": "sha512-FfR8sjd4em2T6fb3I2MwAJU7HWVMr9zba+enmQeeWFfCbm+UOC/0X4DS8XtpUTMwWMGbjKYP7xjfNekzyGmB3A==",
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
+        "nanoid": "^3.3.12",
+        "picocolors": "^1.1.1",
+        "source-map-js": "^1.2.1"
+      },
+      "engines": {
+        "node": "^10 || ^12 || >=14"
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
+    }
+  }
+}
diff --git a/package.json b/package.json
new file mode 100644
index 0000000..899d531
--- /dev/null
+++ b/package.json
@@ -0,0 +1,18 @@
+{
+  "name": "ding-zu-san-fen",
+  "version": "1.0.0",
+  "description": "《鼎足三分》三国主题塔防游戏 - Three Kingdoms: Tactical Defense",
+  "type": "module",
+  "scripts": {
+    "dev": "vite",
+    "build": "vite build",
+    "preview": "vite preview --host",
+    "test": "node scripts/logic-test.mjs"
+  },
+  "dependencies": {
+    "phaser": "^3.80.0"
+  },
+  "devDependencies": {
+    "vite": "^5.4.0"
+  }
+}
diff --git a/scripts/logic-test.mjs b/scripts/logic-test.mjs
new file mode 100644
index 0000000..e2a1b12
--- /dev/null
+++ b/scripts/logic-test.mjs
@@ -0,0 +1,122 @@
+// 纯逻辑自测（不依赖 Phaser / 浏览器）
+import {
+  computeDamage, cellKey,
+} from '../src/config.js';
+import MapManager from '../src/managers/MapManager.js';
+import WaveManager from '../src/managers/WaveManager.js';
+import BondManager from '../src/managers/BondManager.js';
+import { LEVELS, LEVEL_LIST } from '../src/data/levels.js';
+import { GENERAL_BY_ID, LEVEL_MULT, upgradeCost, retreatRefund } from '../src/data/generals.js';
+import { ENEMIES } from '../src/data/enemies.js';
+
+let pass = 0;
+let fail = 0;
+const ok = (cond, msg) => {
+  if (cond) { pass++; }
+  else { fail++; console.error('  ✗ FAIL:', msg); }
+};
+const near = (a, b, eps = 0.001) => Math.abs(a - b) <= eps;
+
+// ---------- 伤害公式 ----------
+console.log('— computeDamage —');
+ok(near(computeDamage(100, 'PHYSICAL', 'NONE'), 100), 'phys/none');
+ok(near(computeDamage(100, 'PHYSICAL', 'HEAVY'), 40), 'phys/heavy 0.4');
+ok(near(computeDamage(100, 'PHYSICAL', 'PHYSICAL'), 50), 'phys/phys 0.5');
+ok(near(computeDamage(100, 'MAGIC', 'HEAVY'), 150), 'magic/heavy 1.5');
+ok(near(computeDamage(100, 'MAGIC', 'MAGIC'), 40), 'magic/magic 0.4');
+ok(near(computeDamage(100, 'MAGIC', 'NONE'), 100), 'magic/none');
+
+// ---------- 关卡 / 地图 ----------
+console.log('— MapManager —');
+for (const key of LEVEL_LIST) {
+  const lv = LEVELS[key];
+  const m = new MapManager(lv);
+  ok(m.length > 100, `${key}: path length > 100 (${Math.round(m.length)})`);
+  ok(m.waypoints.length >= 2, `${key}: waypoints`);
+  let roads = 0; let highs = 0;
+  for (const [, t] of m.slots) { if (t === 'road') roads++; else highs++; }
+  ok(roads >= 4, `${key}: road slots >= 4 (got ${roads})`);
+  ok(highs >= 8, `${key}: high slots >= 8 (got ${highs})`);
+  const p0 = m.pointAt(0);
+  const pEnd = m.pointAt(m.length);
+  ok(p0.x !== undefined && pEnd.x !== undefined, `${key}: pointAt returns coords`);
+  // 中间点应在路径上
+  const pMid = m.pointAt(m.length / 2);
+  ok(pMid.x !== p0.x || pMid.y !== p0.y, `${key}: mid point differs from start`);
+  // base 在右侧出场
+  ok(pEnd.x > 1000, `${key}: base near right edge (x=${Math.round(pEnd.x)})`);
+}
+
+// ---------- 羁绊 ----------
+console.log('— BondManager —');
+function mkGen(id, col, row) {
+  return { def: GENERAL_BY_ID[id], col, row, buffAtk: 1, buffCd: 1, buffHp: 1 };
+}
+let bm = new BondManager();
+let active = bm.recompute([mkGen('guanyu', 1, 1), mkGen('zhangfei', 1, 2)]);
+let ids = active.map((b) => b.id);
+ok(ids.includes('wuhu'), 'wuhu active with 2 五虎');
+ok(!ids.includes('taoyuan'), 'taoyuan NOT active without 赵云');
+
+bm = new BondManager();
+const gs = [
+  mkGen('guanyu', 1, 1), mkGen('zhangfei', 1, 2), mkGen('zhaoyun', 1, 3),
+  mkGen('zhuge', 2, 1), mkGen('pangtong', 2, 2),
+  mkGen('lvbu', 5, 5), mkGen('diaochan', 5, 6),
+];
+active = bm.recompute(gs);
+ids = active.map((b) => b.id);
+ok(ids.includes('wuhu'), 'wuhu active (3 五虎)');
+ok(ids.includes('taoyuan'), 'taoyuan active (关张赵全在场)');
+ok(ids.includes('wolong'), 'wolong active (亮统相邻)');
+ok(ids.includes('qunxiong'), 'qunxiong active (吕蝉相邻)');
+const guanyu = gs.find((g) => g.def.id === 'guanyu');
+// 五虎(+25%) * 桃园(+20%) = 1.5
+ok(near(guanyu.buffAtk, 1.25 * 1.2), `guanyu atk buff = 1.5 (got ${guanyu.buffAtk})`);
+const zhuge = gs.find((g) => g.def.id === 'zhuge');
+ok(near(zhuge.buffCd, 0.7), `zhuge cd buff = 0.7 (got ${zhuge.buffCd})`);
+const lvbu = gs.find((g) => g.def.id === 'lvbu');
+ok(near(lvbu.buffAtk, 1.5), `lvbu atk buff = 1.5 (got ${lvbu.buffAtk})`);
+
+// 不相邻的卧龙凤雏不应激活
+bm = new BondManager();
+active = bm.recompute([mkGen('zhuge', 1, 1), mkGen('pangtong', 9, 9)]);
+ok(!active.map((b) => b.id).includes('wolong'), 'wolong NOT active when far apart');
+
+// ---------- 波次 ----------
+console.log('— WaveManager —');
+for (const key of LEVEL_LIST) {
+  const lv = LEVELS[key];
+  let spawned = 0;
+  const wm = new WaveManager(lv.waves, () => { spawned++; });
+  let cleared = false;
+  ok(wm.startNextWave() === true, `${key}: start wave 1`);
+  // 模拟足够长时间（含波间 4s 空档），alive 恒为 0
+  for (let i = 0; i < 20000; i++) {
+    wm.update(1 / 20, 0);
+    wm.tickBetween(1 / 20);
+    if (wm.state === 'cleared') { cleared = true; break; }
+  }
+  ok(cleared, `${key}: all waves clearable within time`);
+  // 期望总生成数 = 所有小项 count 之和
+  const expected = lv.waves.reduce((sum, wave) => sum + wave.reduce((s, g) => s + g.count, 0), 0);
+  ok(spawned === expected, `${key}: spawned ${spawned} === expected ${expected}`);
+}
+
+// ---------- 升级 / 撤退数值 ----------
+console.log('— upgrade/retreat —');
+const def = GENERAL_BY_ID.guanyu;
+ok(upgradeCost(def, 1) > 0, 'upgrade cost > 0');
+ok(retreatRefund(def, 1) > 0, 'retreat refund > 0');
+ok(retreatRefund(def, 2) >= retreatRefund(def, 1), 'higher level refunds more');
+ok(LEVEL_MULT.atk[2] > LEVEL_MULT.atk[0], 'level mult increases atk');
+
+// ---------- 敌军数据完整性 ----------
+console.log('— enemies —');
+for (const [k, e] of Object.entries(ENEMIES)) {
+  ok(e.hp > 0 && e.speed > 0 && e.gold > 0, `enemy ${k} valid`);
+  ok(['NONE', 'PHYSICAL', 'HEAVY', 'MAGIC'].includes(e.armor), `enemy ${k} armor type valid`);
+}
+
+console.log(`\n结果: ${pass} 通过, ${fail} 失败`);
+process.exit(fail ? 1 : 0);
diff --git a/src/config.js b/src/config.js
new file mode 100644
index 0000000..560e68b
--- /dev/null
+++ b/src/config.js
@@ -0,0 +1,107 @@
+// 全局常量与工具函数 —— 画布尺寸、网格、配色、伤害公式
+
+// 画布逻辑分辨率（移动端优先，Scale.FIT 自动缩放到任意屏幕）
+export const GAME_WIDTH = 1334;
+export const GAME_HEIGHT = 750;
+
+// 网格战场：20 列 x 9 行，单元格 60px
+export const TILE = 60;
+export const MAP_COLS = 20;
+export const MAP_ROWS = 9;
+export const MAP_WIDTH = MAP_COLS * TILE; // 1200
+export const MAP_HEIGHT = MAP_ROWS * TILE; // 540
+
+// 战场在画布中的偏移（居中，上方留 HUD，下方留武将栏）
+export const MAP_X = Math.floor((GAME_WIDTH - MAP_WIDTH) / 2); // 67
+export const MAP_Y = 110;
+
+// 高地（远程/策士）与路面（近战阻挡）槽位类型
+export const SLOT = {
+  HIGH: 'high', // 高地：RANGE / MAGE
+  ROAD: 'road', // 路面：MELEE
+};
+
+// 武将职业 → 可放置槽位类型
+export function slotTypeForClass(cls) {
+  return cls === 'MELEE' ? SLOT.ROAD : SLOT.HIGH;
+}
+
+// 配色（泼墨 / 竹简 风格）
+export const COLORS = {
+  bg: 0x1f1812,
+  parchment: 0xead9b6,
+  parchmentDark: 0xd6c094,
+  ink: 0x2c2418,
+  inkSoft: 0x4a3f30,
+  path: 0xcda45f,
+  pathEdge: 0x9a7232,
+  highland: 0x8fae6b,
+  highlandEdge: 0x5d7240,
+  highlandAlt: 0x7d9a5e,
+  road: 0xb9924f,
+  roadEdge: 0x8a6831,
+  base: 0xb03a2e,
+  baseEdge: 0x7d2620,
+  gold: 0xf0c040,
+  peach: 0xf08a78,
+  morale: 0x57c0e8,
+  valid: 0x5fd06a,
+  invalid: 0xe55757,
+  white: 0xffffff,
+  faction: {
+    蜀: 0x3da563,
+    魏: 0x4a7fc0,
+    吴: 0xcc4f36,
+    群: 0x9b78c4,
+  },
+};
+
+// 网格 ↔ 像素 互转
+export function gridToPixel(col, row) {
+  return {
+    x: MAP_X + col * TILE + TILE / 2,
+    y: MAP_Y + row * TILE + TILE / 2,
+  };
+}
+
+export function pixelToGrid(x, y) {
+  return {
+    col: Math.floor((x - MAP_X) / TILE),
+    row: Math.floor((y - MAP_Y) / TILE),
+  };
+}
+
+export function cellKey(col, row) {
+  return `${col},${row}`;
+}
+
+export function inBounds(col, row) {
+  return col >= 0 && col < MAP_COLS && row >= 0 && row < MAP_ROWS;
+}
+
+export function dist(ax, ay, bx, by) {
+  const dx = ax - bx;
+  const dy = ay - by;
+  return Math.sqrt(dx * dx + dy * dy);
+}
+
+// 护甲减伤：策士(法术)对重甲有额外加成
+// armor: NONE | PHYSICAL | HEAVY | MAGIC
+export function computeDamage(base, dmgType, armor) {
+  if (dmgType === 'MAGIC') {
+    if (armor === 'MAGIC') return base * 0.4;
+    if (armor === 'HEAVY') return base * 1.5; // 重甲惧法
+    return base;
+  }
+  // PHYSICAL
+  if (armor === 'HEAVY') return base * 0.4;
+  if (armor === 'PHYSICAL') return base * 0.5;
+  return base;
+}
+
+// 限制帧间隔，避免后台切回时超大 dt 炸毁物理
+export function clampDt(dt) {
+  if (dt > 0.05) return 0.05;
+  if (dt < 0) return 0;
+  return dt;
+}
diff --git a/src/data/bonds.js b/src/data/bonds.js
new file mode 100644
index 0000000..9588b1b
--- /dev/null
+++ b/src/data/bonds.js
@@ -0,0 +1,67 @@
+// 羁绊 / 阵法 数据
+// 每条羁绊：
+//   name, desc: 名称与说明
+//   test(ctx): 是否激活（ctx 提供 countTag / countFaction / areAdjacent）
+//   effect(generals): 激活时给对应武将叠加 buff（修改 g.buffAtk / g.buffCd）
+export const BONDS = [
+  {
+    id: 'wuhu',
+    name: '五虎上将',
+    desc: '2 名及以上【五虎】在场：蜀军攻击 +25%',
+    test: (c) => c.countTag('五虎') >= 2,
+    effect: (gs) => {
+      for (const g of gs) if (g.def.faction === '蜀') g.buffAtk *= 1.25;
+    },
+  },
+  {
+    id: 'wolong',
+    name: '卧龙凤雏',
+    desc: '诸葛亮与庞统相邻：技能冷却 -30%',
+    test: (c) => c.areAdjacent(['zhuge', 'pangtong']),
+    effect: (gs) => {
+      for (const g of gs) if (g.def.id === 'zhuge' || g.def.id === 'pangtong') g.buffCd *= 0.7;
+    },
+  },
+  {
+    id: 'weiwu',
+    name: '魏武强兵',
+    desc: '2 名及以上【魏】将在场：魏军攻击 +15%',
+    test: (c) => c.countFaction('魏') >= 2,
+    effect: (gs) => {
+      for (const g of gs) if (g.def.faction === '魏') g.buffAtk *= 1.15;
+    },
+  },
+  {
+    id: 'dongwu',
+    name: '东吴水战',
+    desc: '2 名及以上【吴】将在场：吴军攻击 +12%、攻速 +10%',
+    test: (c) => c.countFaction('吴') >= 2,
+    effect: (gs) => {
+      for (const g of gs) if (g.def.faction === '吴') {
+        g.buffAtk *= 1.12;
+        g.buffCd *= 0.9;
+      }
+    },
+  },
+  {
+    id: 'qunxiong',
+    name: '群雄逐鹿',
+    desc: '吕布与貂蝉相邻：吕布攻击 +50%',
+    test: (c) => c.areAdjacent(['lvbu', 'diaochan']),
+    effect: (gs) => {
+      for (const g of gs) if (g.def.id === 'lvbu') g.buffAtk *= 1.5;
+    },
+  },
+  {
+    id: 'taoyuan',
+    name: '桃园之义',
+    desc: '关羽、张飞、赵云同时在场：三将攻击 +20%、血量 +20%',
+    test: (c) => c.byId['guanyu'] && c.byId['zhangfei'] && c.byId['zhaoyun'],
+    effect: (gs) => {
+      for (const g of gs) if (['guanyu', 'zhangfei', 'zhaoyun'].includes(g.def.id)) {
+        g.buffAtk *= 1.2;
+        g.buffHp *= 1.2;
+      }
+    },
+  },
+];
diff --git a/src/data/enemies.js b/src/data/enemies.js
new file mode 100644
index 0000000..446c155
--- /dev/null
+++ b/src/data/enemies.js
@@ -0,0 +1,37 @@
+// 敌军数据字典
+// armor: NONE | PHYSICAL(物理减伤) | HEAVY(重甲·惧法) | MAGIC(魔抗·惧物)
+// speed: px/秒；dmg: 对近战武将造成的伤害；gold: 击杀奖励；morale: 气势奖励
+export const ENEMIES = {
+  yellowturban: {
+    name: '黄巾兵', hp: 200, speed: 55, armor: 'NONE', dmg: 8, atkCD: 1.0,
+    gold: 8, morale: 3, color: 0xd9b14a, shape: 'tri',
+  },
+  scout: {
+    name: '黄巾斥候', hp: 130, speed: 145, armor: 'NONE', dmg: 6, atkCD: 0.8,
+    gold: 7, morale: 2, color: 0xd6e08a, shape: 'tri',
+  },
+  cavalry: {
+    name: '魏国骑兵', hp: 300, speed: 100, armor: 'PHYSICAL', dmg: 16, atkCD: 0.9,
+    gold: 16, morale: 4, color: 0x6f9bd6, shape: 'diamond',
+  },
+  warlock: {
+    name: '妖术军师', hp: 340, speed: 50, armor: 'MAGIC', dmg: 18, atkCD: 1.1,
+    gold: 20, morale: 5, color: 0xb08bd6, shape: 'circle',
+  },
+  shield: {
+    name: '重甲盾兵', hp: 780, speed: 40, armor: 'HEAVY', dmg: 20, atkCD: 1.2,
+    gold: 26, morale: 7, color: 0x9aa0a6, shape: 'rect',
+  },
+  shu_soldier: {
+    name: '蜀地叛军', hp: 260, speed: 70, armor: 'NONE', dmg: 12, atkCD: 1.0,
+    gold: 12, morale: 4, color: 0x6bbf7f, shape: 'diamond',
+  },
+  boss_zhangjiao: {
+    name: '天公将军·张角', hp: 6000, speed: 32, armor: 'HEAVY', dmg: 45, atkCD: 1.0,
+    gold: 220, morale: 80, color: 0xc8a23a, shape: 'hex', boss: true, leakLives: 5,
+  },
+  boss_dongzhuo: {
+    name: '相国·董卓', hp: 11000, speed: 30, armor: 'HEAVY', dmg: 55, atkCD: 1.0,
+    gold: 360, morale: 120, color: 0x8c6d3f, shape: 'hex', boss: true, leakLives: 8,
+  },
+};
diff --git a/src/data/generals.js b/src/data/generals.js
new file mode 100644
index 0000000..7dda529
--- /dev/null
+++ b/src/data/generals.js
@@ -0,0 +1,123 @@
+// 武将数据字典
+// cls: MELEE(近战/阻挡) | RANGE(远程) | MAGE(策士/法术)
+// tags: 用于羁绊判定（如 五虎、魏、吴）
+// skill.type: AOE(范围) | SNIPE(单体爆发) | SPELL(法术范围+状态)
+//   AOE:   { radius(格), mult }        围绕自身范围伤害 = atk*mult
+//   SNIPE: { mult }                     对目标造成 atk*mult
+//   SPELL: { radius(格), mult, slow?, burn? } 范围法术 + 减速/燃烧
+export const GENERALS = [
+  // ---------- 蜀 · 五虎 / 卧龙凤雏 ----------
+  {
+    id: 'guanyu', name: '关羽', char: '关', faction: '蜀', cls: 'MELEE', tags: ['五虎'],
+    cost: 160, hp: 1300, atk: 58, range: 1.1, block: 2, atkCD: 0.85, dmgType: 'PHYSICAL',
+    skill: { name: '青龙偃月', type: 'AOE', cd: 8, radius: 1.6, mult: 3 },
+    desc: '近战 · 阻挡 2 · 范围斩击',
+  },
+  {
+    id: 'zhangfei', name: '张飞', char: '张', faction: '蜀', cls: 'MELEE', tags: ['五虎'],
+    cost: 170, hp: 1900, atk: 46, range: 1.0, block: 3, atkCD: 1.0, dmgType: 'PHYSICAL',
+    skill: { name: '丈八蛇矛', type: 'AOE', cd: 9, radius: 1.4, mult: 2.6 },
+    desc: '肉盾 · 阻挡 3 · 高血厚甲',
+  },
+  {
+    id: 'zhaoyun', name: '赵云', char: '赵', faction: '蜀', cls: 'MELEE', tags: ['五虎'],
+    cost: 150, hp: 1150, atk: 56, range: 1.1, block: 2, atkCD: 0.7, dmgType: 'PHYSICAL',
+    skill: { name: '七进七出', type: 'AOE', cd: 7, radius: 1.8, mult: 2.2 },
+    desc: '近战 · 攻速快 · 灵动突进',
+  },
+  {
+    id: 'machao', name: '马超', char: '马', faction: '蜀', cls: 'MELEE', tags: ['五虎'],
+    cost: 150, hp: 1200, atk: 57, range: 1.1, block: 2, atkCD: 0.78, dmgType: 'PHYSICAL',
+    skill: { name: '银甲冲锋', type: 'AOE', cd: 8, radius: 1.6, mult: 2.5 },
+    desc: '近战 · 西凉铁骑',
+  },
+  {
+    id: 'huangzhong', name: '黄忠', char: '黄', faction: '蜀', cls: 'RANGE', tags: ['五虎'],
+    cost: 180, hp: 620, atk: 72, range: 3.6, block: 0, atkCD: 1.1, dmgType: 'PHYSICAL',
+    skill: { name: '百步穿杨', type: 'SNIPE', cd: 10, mult: 5 },
+    desc: '远程 · 射程极远 · 单发爆头',
+  },
+  {
+    id: 'zhuge', name: '诸葛亮', char: '亮', faction: '蜀', cls: 'MAGE', tags: ['蜀'],
+    cost: 200, hp: 560, atk: 52, range: 2.9, block: 0, atkCD: 1.4, dmgType: 'MAGIC',
+    skill: { name: '八阵图', type: 'SPELL', cd: 11, radius: 2.0, mult: 2, slow: { factor: 0.45, dur: 2.5 } },
+    desc: '策士 · 法术范围 · 减速',
+  },
+  {
+    id: 'pangtong', name: '庞统', char: '统', faction: '蜀', cls: 'MAGE', tags: ['蜀'],
+    cost: 190, hp: 520, atk: 55, range: 2.7, block: 0, atkCD: 1.5, dmgType: 'MAGIC',
+    skill: { name: '火连环', type: 'SPELL', cd: 10, radius: 2.0, mult: 2.2, burn: { dps: 30, dur: 3 } },
+    desc: '策士 · 法术范围 · 灼烧',
+  },
+
+  // ---------- 魏 ----------
+  {
+    id: 'caocao', name: '曹操', char: '曹', faction: '魏', cls: 'RANGE', tags: ['魏'],
+    cost: 190, hp: 720, atk: 64, range: 3.3, block: 0, atkCD: 1.0, dmgType: 'PHYSICAL',
+    skill: { name: '奸雄', type: 'SNIPE', cd: 10, mult: 4 },
+    desc: '远程 · 雄主 · 统御三军',
+  },
+  {
+    id: 'sima', name: '司马懿', char: '懿', faction: '魏', cls: 'MAGE', tags: ['魏'],
+    cost: 195, hp: 560, atk: 53, range: 2.9, block: 0, atkCD: 1.3, dmgType: 'MAGIC',
+    skill: { name: '鬼谋', type: 'SPELL', cd: 11, radius: 2.0, mult: 1.8, slow: { factor: 0.5, dur: 2.5 } },
+    desc: '策士 · 法术 · 深谋减速',
+  },
+  {
+    id: 'xiahou', name: '夏侯惇', char: '夏', faction: '魏', cls: 'MELEE', tags: ['魏'],
+    cost: 160, hp: 1600, atk: 51, range: 1.0, block: 3, atkCD: 0.9, dmgType: 'PHYSICAL',
+    skill: { name: '刚烈', type: 'AOE', cd: 9, radius: 1.5, mult: 2.6 },
+    desc: '肉盾 · 阻挡 3 · 魏之刚烈',
+  },
+
+  // ---------- 吴 ----------
+  {
+    id: 'zhouyu', name: '周瑜', char: '瑜', faction: '吴', cls: 'MAGE', tags: ['吴'],
+    cost: 195, hp: 540, atk: 55, range: 2.8, block: 0, atkCD: 1.4, dmgType: 'MAGIC',
+    skill: { name: '火攻', type: 'SPELL', cd: 10, radius: 2.2, mult: 2.0, burn: { dps: 35, dur: 3 } },
+    desc: '策士 · 烈火 · 群体灼烧',
+  },
+  {
+    id: 'sunce', name: '孙策', char: '策', faction: '吴', cls: 'MELEE', tags: ['吴'],
+    cost: 150, hp: 1250, atk: 57, range: 1.1, block: 2, atkCD: 0.78, dmgType: 'PHYSICAL',
+    skill: { name: '小霸王', type: 'AOE', cd: 8, radius: 1.6, mult: 2.5 },
+    desc: '近战 · 江东小霸王',
+  },
+
+  // ---------- 群雄 ----------
+  {
+    id: 'lvbu', name: '吕布', char: '吕', faction: '群', cls: 'MELEE', tags: ['群'],
+    cost: 240, hp: 1700, atk: 78, range: 1.3, block: 2, atkCD: 0.7, dmgType: 'PHYSICAL',
+    skill: { name: '无双', type: 'AOE', cd: 9, radius: 1.9, mult: 3 },
+    desc: '近战 · 三国第一猛将',
+  },
+  {
+    id: 'diaochan', name: '貂蝉', char: '蝉', faction: '群', cls: 'MAGE', tags: ['群'],
+    cost: 185, hp: 520, atk: 49, range: 2.7, block: 0, atkCD: 1.3, dmgType: 'MAGIC',
+    skill: { name: '连环', type: 'SPELL', cd: 11, radius: 2.0, mult: 1.6, slow: { factor: 0.4, dur: 3 } },
+    desc: '策士 · 倾国 · 群体迟滞',
+  },
+];
+
+export const GENERAL_BY_ID = Object.fromEntries(GENERALS.map((g) => [g.id, g]));
+
+// 升级数值（每级相对 1 级）
+export const LEVEL_MULT = {
+  atk: [1.0, 1.4, 1.9], // 攻击倍率
+  hp: [1.0, 1.5, 2.2], // 血量倍率
+  speed: [1.0, 1.15, 1.3], // 攻速/冷却倍率
+};
+
+export const MAX_LEVEL = 3;
+
+// 升级所需金币（按武将基础费用）
+export function upgradeCost(def, currentLevel) {
+  return Math.round(def.cost * (0.8 + currentLevel * 0.7));
+}
+
+// 撤退返还（按累计投入）
+export function retreatRefund(def, level) {
+  let invested = def.cost;
+  for (let l = 1; l < level; l++) invested += upgradeCost(def, l);
+  return Math.round(invested * 0.7);
+}
diff --git a/src/data/levels.js b/src/data/levels.js
new file mode 100644
index 0000000..5b82006
--- /dev/null
+++ b/src/data/levels.js
@@ -0,0 +1,66 @@
+// 关卡数据
+// path: 敌军行进航点（网格 col/row，首尾可越界用于入场/离场）
+// roadSlots: 路面槽位（近战可部署，位于路径上）—— 格式 [col,row,...]
+//   高地槽位由 MapManager 自动依据"邻近路径且非路径"生成
+// waves: 每波由若干 {enemy, count, interval, start(秒)} 组构成，按时间轴生成
+export const LEVELS = {
+  huangjin: {
+    key: 'huangjin',
+    name: '黄巾之乱',
+    subtitle: '初出茅庐 · 教学关卡',
+    startGold: 320,
+    startLives: 12,
+    bgTone: 0x3a3326,
+    // 蛇形路径：左入场 → 上行 → 下行 → 右离场
+    path: [
+      [-1, 2], [4, 2], [4, 6], [15, 6], [15, 2], [20, 2],
+    ],
+    roadSlots: [
+      2, 2, 3, 2,
+      6, 6, 8, 6, 10, 6, 12, 6,
+      16, 2, 17, 2, 18, 2,
+    ],
+    waves: [
+      [{ enemy: 'yellowturban', count: 6, interval: 1.2, start: 0 }],
+      [{ enemy: 'yellowturban', count: 8, interval: 1.0, start: 0 }],
+      [{ enemy: 'yellowturban', count: 6, interval: 0.9, start: 0 }, { enemy: 'scout', count: 4, interval: 0.7, start: 4 }],
+      [{ enemy: 'shu_soldier', count: 8, interval: 1.0, start: 0 }],
+      [{ enemy: 'cavalry', count: 5, interval: 1.4, start: 0 }, { enemy: 'yellowturban', count: 6, interval: 0.8, start: 3 }],
+      [{ enemy: 'warlock', count: 4, interval: 1.6, start: 0 }, { enemy: 'shield', count: 3, interval: 2.0, start: 2 }],
+      [{ enemy: 'cavalry', count: 8, interval: 1.0, start: 0 }, { enemy: 'scout', count: 8, interval: 0.5, start: 5 }],
+      [{ enemy: 'shield', count: 5, interval: 1.8, start: 0 }, { enemy: 'warlock', count: 4, interval: 1.4, start: 3 }, { enemy: 'boss_zhangjiao', count: 1, interval: 1, start: 9 }],
+    ],
+  },
+
+  hulao: {
+    key: 'hulao',
+    name: '虎牢关',
+    subtitle: '三英战吕布 · 进阶挑战',
+    startGold: 380,
+    startLives: 12,
+    bgTone: 0x39302a,
+    path: [
+      [-1, 1], [3, 1], [3, 4], [10, 4], [10, 1], [16, 1], [16, 7], [6, 7], [6, 5], [20, 5],
+    ],
+    roadSlots: [
+      1, 1, 2, 1,
+      4, 4, 6, 4, 8, 4,
+      11, 1, 13, 1,
+      16, 4, 16, 6,
+      8, 7, 10, 7, 12, 7,
+      7, 5,
+    ],
+    waves: [
+      [{ enemy: 'yellowturban', count: 10, interval: 0.9, start: 0 }],
+      [{ enemy: 'cavalry', count: 6, interval: 1.1, start: 0 }, { enemy: 'scout', count: 6, interval: 0.6, start: 2 }],
+      [{ enemy: 'shu_soldier', count: 12, interval: 0.8, start: 0 }, { enemy: 'warlock', count: 3, interval: 1.8, start: 3 }],
+      [{ enemy: 'shield', count: 5, interval: 1.6, start: 0 }, { enemy: 'cavalry', count: 6, interval: 1.0, start: 4 }],
+      [{ enemy: 'warlock', count: 6, interval: 1.2, start: 0 }, { enemy: 'yellowturban', count: 10, interval: 0.6, start: 2 }],
+      [{ enemy: 'cavalry', count: 12, interval: 0.7, start: 0 }],
+      [{ enemy: 'shield', count: 7, interval: 1.4, start: 0 }, { enemy: 'warlock', count: 5, interval: 1.2, start: 3 }, { enemy: 'scout', count: 10, interval: 0.4, start: 6 }],
+      [{ enemy: 'cavalry', count: 8, interval: 0.8, start: 0 }, { enemy: 'shield', count: 6, interval: 1.5, start: 4 }, { enemy: 'boss_dongzhuo', count: 1, interval: 1, start: 10 }],
+    ],
+  },
+};
+
+export const LEVEL_LIST = ['huangjin', 'hulao'];
diff --git a/src/entities/Enemy.js b/src/entities/Enemy.js
new file mode 100644
index 0000000..eafc482
--- /dev/null
+++ b/src/entities/Enemy.js
@@ -0,0 +1,233 @@
+// Enemy: 敌军单位 —— 沿路径移动、可被近战阻挡、护甲减伤、状态效果
+import { TILE, COLORS, computeDamage } from '../config.js';
+import { ENEMIES } from '../data/enemies.js';
+
+const HP_BAR_W = TILE * 0.72;
+const HP_BAR_H = 5;
+
+export default class Enemy {
+  constructor(scene, key, progress = 0) {
+    this.scene = scene;
+    this.def = ENEMIES[key];
+    this.key = key;
+    this.progress = progress;
+
+    this.maxHp = this.def.hp;
+    this.hp = this.maxHp;
+    this.baseSpeed = this.def.speed;
+    this.armor = this.def.armor;
+    this.boss = !!this.def.boss;
+
+    // 状态效果
+    this.slowT = 0;
+    this.slowFactor = 1;
+    this.burnT = 0;
+    this.burnDps = 0;
+
+    // 阻挡 / 攻击近战武将
+    this.blockedBy = null;
+    this.atkTimer = 0;
+
+    this.alive = true;
+    this.dying = false;
+    this.id = Enemy._uid++;
+
+    this._build();
+  }
+
+  static _uid = 0;
+
+  _build() {
+    const s = this.scene;
+    const scale = this.boss ? 1.5 : 1.0;
+    this.container = s.add.container(0, 0);
+    this.container.setDepth(30);
+
+    // 阴影
+    this.shadow = s.add.graphics();
+    this.shadow.fillStyle(0x000000, 0.28);
+    this.shadow.fillEllipse(0, 6, TILE * 0.5 * scale, TILE * 0.22 * scale);
+    this.container.add(this.shadow);
+
+    // 本体
+    const body = s.add.graphics();
+    const r = (TILE * 0.32) * scale;
+    this._drawShape(body, r);
+    body.fillStyle(this.def.color, 1);
+    body.lineStyle(2.5, COLORS.ink, 1);
+    this._drawShape(body, r);
+    body.fillPath();
+    body.strokePath();
+    this.container.add(body);
+    this.body = body;
+
+    // 血条
+    this.hpBg = s.add.graphics();
+    this.hpFill = s.add.graphics();
+    const by = -r - 10;
+    this.hpBgY = by;
+    this.container.add(this.hpBg);
+    this.container.add(this.hpFill);
+
+    // 状态点
+    this.statusFx = s.add.graphics();
+    this.container.add(this.statusFx);
+
+    if (this.boss) {
+      const label = s.add.text(0, -r - 22, this.def.name, {
+        fontFamily: '"PingFang SC","Microsoft YaHei",sans-serif',
+        fontSize: '16px',
+        color: '#ffe08a',
+        stroke: '#2c2418',
+        strokeThickness: 3,
+      }).setOrigin(0.5);
+      this.container.add(label);
+      this.bossLabel = label;
+    }
+
+    this._refreshHpBar();
+  }
+
+  _drawShape(g, r) {
+    const sh = this.def.shape;
+    g.beginPath();
+    if (sh === 'circle' || sh === 'hex') {
+      const sides = sh === 'hex' ? 6 : 24;
+      for (let i = 0; i < sides; i++) {
+        const a = (i / sides) * Math.PI * 2 - Math.PI / 2;
+        const px = Math.cos(a) * r;
+        const py = Math.sin(a) * r;
+        if (i === 0) g.moveTo(px, py);
+        else g.lineTo(px, py);
+      }
+      g.closePath();
+    } else if (sh === 'diamond') {
+      g.moveTo(0, -r);
+      g.lineTo(r, 0);
+      g.lineTo(0, r);
+      g.lineTo(-r, 0);
+      g.closePath();
+    } else if (sh === 'rect') {
+      const w = r * 1.5;
+      g.moveTo(-w * 0.5, -r * 0.8);
+      g.lineTo(w * 0.5, -r * 0.8);
+      g.lineTo(w * 0.5, r * 0.8);
+      g.lineTo(-w * 0.5, r * 0.8);
+      g.closePath();
+    } else {
+      // tri
+      g.moveTo(0, -r);
+      g.lineTo(r * 0.9, r * 0.7);
+      g.lineTo(-r * 0.9, r * 0.7);
+      g.closePath();
+    }
+  }
+
+  applySlow(factor, dur) {
+    this.slowFactor = Math.min(this.slowFactor, factor);
+    this.slowT = Math.max(this.slowT, dur);
+  }
+
+  applyBurn(dps, dur) {
+    this.burnDps = Math.max(this.burnDps, dps);
+    this.burnT = Math.max(this.burnT, dur);
+  }
+
+  takeDamage(baseAmount, dmgType) {
+    if (!this.alive) return 0;
+    const amount = computeDamage(baseAmount, dmgType, this.armor);
+    this.hp -= amount;
+    // 受击闪白
+    this.body.setAlpha(0.45);
+    this.scene.time.delayedCall(60, () => this.body && this.body.setAlpha(1));
+    if (this.hp <= 0 && !this.dying) {
+      this.dying = true;
+      this.alive = false;
+    }
+    this._refreshHpBar();
+    return amount;
+  }
+
+  _refreshHpBar() {
+    const ratio = Math.max(0, this.hp / this.maxHp);
+    const w = HP_BAR_W;
+    const y = this.hpBgY;
+    this.hpBg.clear();
+    this.hpBg.fillStyle(0x000000, 0.5);
+    this.hpBg.fillRect(-w / 2 - 1, y - 1, w + 2, HP_BAR_H + 2);
+    this.hpFill.clear();
+    const col = ratio > 0.5 ? 0x6fd06a : ratio > 0.25 ? 0xe8c14a : 0xe05a4a;
+    this.hpFill.fillStyle(col, 1);
+    this.hpFill.fillRect(-w / 2, y, w * ratio, HP_BAR_H);
+  }
+
+  get x() {
+    return this.container.x;
+  }
+  get y() {
+    return this.container.y;
+  }
+  get pos() {
+    return { x: this.container.x, y: this.container.y };
+  }
+
+  effectiveSpeed() {
+    return this.baseSpeed * (this.slowT > 0 ? this.slowFactor : 1);
+  }
+
+  update(dt, scene) {
+    if (!this.alive) return;
+
+    // 燃烧
+    if (this.burnT > 0) {
+      this.takeDamage(this.burnDps * dt, 'MAGIC');
+      this.burnT -= dt;
+      if (!this.alive) return;
+    }
+    // 减速衰减
+    if (this.slowT > 0) {
+      this.slowT -= dt;
+      if (this.slowT <= 0) this.slowFactor = 1;
+    }
+
+    if (this.blockedBy && this.blockedBy.alive) {
+      // 被阻挡：攻击近战武将
+      this.atkTimer -= dt;
+      if (this.atkTimer <= 0) {
+        this.atkTimer = this.def.atkCD;
+        this.blockedBy.takeDamageFromEnemy(this.def.dmg);
+      }
+    } else {
+      this.blockedBy = null;
+      // 前进
+      this.progress += this.effectiveSpeed() * dt;
+      if (this.progress >= scene.map.length) {
+        // 抵达基地
+        scene.onLeak(this);
+        return;
+      }
+    }
+
+    // 更新位置
+    const p = scene.map.pointAt(this.progress);
+    this.container.x = p.x;
+    this.container.y = p.y;
+
+    // 状态特效
+    this.statusFx.clear();
+    let ox = -10;
+    if (this.slowT > 0) {
+      this.statusFx.fillStyle(COLORS.morale, 1);
+      this.statusFx.fillCircle(ox, -22, 3);
+      ox += 8;
+    }
+    if (this.burnT > 0) {
+      this.statusFx.fillStyle(0xff7a2a, 1);
+      this.statusFx.fillCircle(ox, -22, 3);
+    }
+  }
+
+  destroy() {
+    this.container.destroy();
+  }
+}
diff --git a/src/entities/General.js b/src/entities/General.js
new file mode 100644
index 0000000..cf380d8
--- /dev/null
+++ b/src/entities/General.js
@@ -0,0 +1,312 @@
+// General: 武将塔 —— 近战(阻挡)/远程(射击)/策士(法术)，含技能与羁绊 buff
+import { TILE, COLORS, gridToPixel } from '../config.js';
+import { LEVEL_MULT } from '../data/generals.js';
+
+export default class General {
+  constructor(scene, def, col, row) {
+    this.scene = scene;
+    this.def = def;
+    this.col = col;
+    this.row = row;
+    const p = gridToPixel(col, row);
+    this.x = p.x;
+    this.y = p.y;
+
+    this.level = 1;
+    this.alive = true;
+
+    // 羁绊倍率（由 BondManager 写入）
+    this.buffAtk = 1;
+    this.buffCd = 1;
+    this.buffHp = 1;
+
+    this.atkTimer = 0.4; // 部署后短暂延迟再攻击
+    this.skillTimer = def.skill.cd;
+    this.atkAnim = 0;
+    this.skillAnim = 0;
+
+    this.blockedEnemies = [];
+
+    this.maxHp = this._computeMaxHp();
+    this.hp = this.maxHp;
+
+    this.showRange = false;
+    this._build();
+  }
+
+  get cls() {
+    return this.def.cls;
+  }
+
+  _computeMaxHp() {
+    return Math.round(this.def.hp * LEVEL_MULT.hp[this.level - 1] * this.buffHp);
+  }
+  get atk() {
+    return this.def.atk * LEVEL_MULT.atk[this.level - 1] * this.buffAtk;
+  }
+  get rangePx() {
+    return this.def.range * TILE;
+  }
+  get atkInterval() {
+    return this.def.atkCD / LEVEL_MULT.speed[this.level - 1] * this.buffCd;
+  }
+  get skillInterval() {
+    return this.def.skill.cd / LEVEL_MULT.speed[this.level - 1] * this.buffCd;
+  }
+
+  _build() {
+    const s = this.scene;
+    this.container = s.add.container(this.x, this.y);
+    this.container.setDepth(50);
+
+    const fac = COLORS.faction[this.def.faction] || COLORS.ink;
+    const r = TILE * 0.34;
+
+    // 阵营底盘
+    const base = s.add.graphics();
+    base.fillStyle(0x000000, 0.25);
+    base.fillCircle(2, 4, r + 3);
+    base.fillStyle(fac, 0.95);
+    base.fillCircle(0, 0, r + 3);
+    base.lineStyle(2.5, COLORS.ink, 1);
+    base.strokeCircle(0, 0, r + 3);
+    this.container.add(base);
+    this.baseGfx = base;
+
+    // 内圈
+    const inner = s.add.graphics();
+    inner.fillStyle(0xf5ecd6, 0.96);
+    inner.fillCircle(0, 0, r - 1);
+    this.container.add(inner);
+
+    // 武将名（单字）
+    this.nameText = s.add.text(0, -1, this.def.char, {
+      fontFamily: '"PingFang SC","Microsoft YaHei",sans-serif',
+      fontSize: '22px',
+      color: '#2c2418',
+      fontStyle: 'bold',
+    }).setOrigin(0.5);
+    this.container.add(this.nameText);
+
+    // 职业色环（细圈）区分近战/远程/策士
+    const ringCol = this.def.cls === 'MELEE' ? 0xd24d3a : this.def.cls === 'RANGE' ? 0x3f8f6a : 0x7a57c4;
+    const ring = s.add.graphics();
+    ring.lineStyle(3, ringCol, 1);
+    ring.strokeCircle(0, 0, r + 6.5);
+    this.container.add(ring);
+    this.ring = ring;
+
+    // 等级标记
+    this.levelFx = s.add.graphics();
+    this.container.add(this.levelFx);
+    this._drawLevel();
+
+    // 技能就绪光点
+    this.skillFx = s.add.graphics();
+    this.container.add(this.skillFx);
+
+    // 血条（仅受伤时显示）
+    this.hpFx = s.add.graphics();
+    this.container.add(this.hpFx);
+
+    // 射程指示
+    this.rangeFx = s.add.graphics();
+    this.container.add(this.rangeFx);
+  }
+
+  _drawLevel() {
+    this.levelFx.clear();
+    if (this.level <= 1) return;
+    for (let i = 0; i < this.level - 1; i++) {
+      this.levelFx.fillStyle(COLORS.gold, 1);
+      this.levelFx.fillCircle(-10 + i * 9, 20, 3);
+    }
+  }
+
+  setShowRange(show) {
+    this.showRange = show;
+    this.rangeFx.clear();
+    if (!show) return;
+    this.rangeFx.lineStyle(2, 0xffffff, 0.35);
+    this.rangeFx.fillStyle(0xffffff, 0.06);
+    this.rangeFx.fillCircle(0, 0, this.rangePx);
+    this.rangeFx.strokeCircle(0, 0, this.rangePx);
+  }
+
+  pulse(amount = 1.12) {
+    this.container.scale = amount;
+    this.scene.tweens.add({
+      targets: this.container,
+      scale: 1,
+      duration: 140,
+      ease: 'Quad.Out',
+    });
+  }
+
+  refreshBonds() {
+    // 羁绊变化后重算上限，保留当前血量比例
+    const newMax = this._computeMaxHp();
+    if (newMax !== this.maxHp) {
+      const ratio = this.hp / this.maxHp;
+      this.maxHp = newMax;
+      this.hp = Math.min(newMax, Math.max(1, Math.round(newMax * ratio)));
+    }
+  }
+
+  upgrade() {
+    if (this.level >= 3) return false;
+    this.level++;
+    this.maxHp = this._computeMaxHp();
+    this.hp = this.maxHp; // 升级回满
+    this._drawLevel();
+    this.pulse(1.18);
+    return true;
+  }
+
+  takeDamageFromEnemy(dmg) {
+    if (!this.alive) return;
+    this.hp -= dmg;
+    this.nameText.setAlpha(0.5);
+    this.scene.time.delayedCall(70, () => this.nameText && this.nameText.setAlpha(1));
+    if (this.hp <= 0) {
+      this.hp = 0;
+      this.alive = false;
+    }
+    this._drawHp();
+  }
+
+  _drawHp() {
+    this.hpFx.clear();
+    if (this.hp >= this.maxHp) return;
+    const w = TILE * 0.7;
+    const y = 28;
+    const ratio = Math.max(0, this.hp / this.maxHp);
+    this.hpFx.fillStyle(0x000000, 0.5);
+    this.hpFx.fillRect(-w / 2 - 1, y - 1, w + 2, 6);
+    const col = ratio > 0.5 ? 0x6fd06a : ratio > 0.25 ? 0xe8c14a : 0xe05a4a;
+    this.hpFx.fillStyle(col, 1);
+    this.hpFx.fillRect(-w / 2, y, w * ratio, 4);
+  }
+
+  // 选取目标（最前方 = progress 最大）；近战优先命中被阻挡者
+  acquireTarget(enemies) {
+    const range = this.rangePx;
+    let best = null;
+    let bestProg = -1;
+    if (this.def.cls === 'MELEE' && this.blockedEnemies.length) {
+      for (const e of this.blockedEnemies) {
+        if (!e.alive) continue;
+        if (e.progress > bestProg) {
+          bestProg = e.progress;
+          best = e;
+        }
+      }
+      if (best) return best;
+    }
+    for (const e of enemies) {
+      if (!e.alive) continue;
+      const dx = e.x - this.x;
+      const dy = e.y - this.y;
+      if (dx * dx + dy * dy <= range * range) {
+        if (e.progress > bestProg) {
+          bestProg = e.progress;
+          best = e;
+        }
+      }
+    }
+    return best;
+  }
+
+  update(dt, scene) {
+    if (!this.alive) return;
+
+    // 技能就绪指示
+    this.skillFx.clear();
+    if (this.skillTimer <= 0) {
+      this.skillFx.fillStyle(COLORS.gold, 0.9);
+      this.skillFx.fillCircle(15, -15, 4 + Math.sin(scene.time.now / 180) * 1.2);
+      this.skillFx.lineStyle(1.5, 0xffffff, 0.6);
+      this.skillFx.strokeCircle(15, -15, 6);
+    }
+
+    // 技能冷却
+    this.skillTimer -= dt;
+    if (this.skillTimer <= 0) {
+      const target = this.acquireTarget(scene.enemies);
+      if (target) {
+        this.triggerSkill(target, scene);
+        this.skillTimer = this.skillInterval;
+      }
+    }
+
+    // 普通攻击
+    this.atkTimer -= dt;
+    if (this.atkTimer <= 0) {
+      const target = this.acquireTarget(scene.enemies);
+      if (target) {
+        this.attack(target, scene);
+        this.atkTimer = this.atkInterval;
+      } else {
+        this.atkTimer = 0.15; // 无目标时短轮询
+      }
+    }
+  }
+
+  attack(target, scene) {
+    const dmg = this.atk;
+    if (this.def.cls === 'MELEE') {
+      target.takeDamage(dmg, this.def.dmgType);
+      scene.fx.slash(target.x, target.y, 0xffe9a8);
+      this.pulse(1.12);
+      return;
+    }
+    const kind = this.def.cls === 'MAGE' ? 'magic' : 'arrow';
+    scene.spawnProjectile(this.x, this.y - 6, target, {
+      damage: dmg,
+      dmgType: this.def.dmgType,
+      kind,
+      color: this.def.cls === 'MAGE' ? 0xb08bd6 : 0xfff0c0,
+    });
+    this.pulse(1.1);
+  }
+
+  triggerSkill(target, scene) {
+    const skill = this.def.skill;
+    this.pulse(1.25);
+
+    if (skill.type === 'AOE') {
+      // 围绕自身的范围物理/法术伤害
+      const radius = skill.radius * TILE;
+      scene.fx.impact(this.x, this.y, radius, COLORS.gold);
+      for (const e of scene.enemies) {
+        if (!e.alive) continue;
+        const dx = e.x - this.x;
+        const dy = e.y - this.y;
+        if (dx * dx + dy * dy <= radius * radius) {
+          e.takeDamage(this.atk * skill.mult, this.def.dmgType);
+        }
+      }
+    } else if (skill.type === 'SNIPE') {
+      scene.fx.beam(this.x, this.y - 6, target.x, target.y, 0xfff2b0);
+      target.takeDamage(this.atk * skill.mult, this.def.dmgType);
+    } else if (skill.type === 'SPELL') {
+      const radius = skill.radius * TILE;
+      scene.fx.impact(target.x, target.y, radius, 0xb08bd6);
+      for (const e of scene.enemies) {
+        if (!e.alive) continue;
+        const dx = e.x - target.x;
+        const dy = e.y - target.y;
+        if (dx * dx + dy * dy <= radius * radius) {
+          e.takeDamage(this.atk * skill.mult, 'MAGIC');
+          if (skill.slow) e.applySlow(skill.slow.factor, skill.slow.dur);
+          if (skill.burn) e.applyBurn(skill.burn.dps, skill.burn.dur);
+        }
+      }
+    }
+  }
+
+  destroy() {
+    this.alive = false;
+    this.container.destroy();
+  }
+}
diff --git a/src/entities/Projectile.js b/src/entities/Projectile.js
new file mode 100644
index 0000000..25ca9f3
--- /dev/null
+++ b/src/entities/Projectile.js
@@ -0,0 +1,67 @@
+// Projectile: 投射物（箭矢 / 法球 / 火焰）—— 追踪目标命中后造成伤害
+import { COLORS } from '../config.js';
+
+export default class Projectile {
+  constructor(scene, x, y, target, opts) {
+    this.scene = scene;
+    this.x = x;
+    this.y = y;
+    this.target = target;
+    this.damage = opts.damage;
+    this.dmgType = opts.dmgType;
+    this.kind = opts.kind || 'arrow';
+    this.color = opts.color || 0xfff0c0;
+    this.speed = this.kind === 'magic' ? 620 : 820;
+    this.dead = false;
+
+    this.gfx = scene.add.graphics();
+    this.gfx.setDepth(45);
+  }
+
+  update(dt, scene) {
+    if (this.dead) return;
+    const t = this.target;
+    if (!t || !t.alive) {
+      this.kill();
+      return;
+    }
+    const dx = t.x - this.x;
+    const dy = t.y - this.y;
+    const d = Math.hypot(dx, dy);
+    const step = this.speed * dt;
+
+    this.gfx.clear();
+    if (d <= step + 6) {
+      // 命中
+      t.takeDamage(this.damage, this.dmgType);
+      scene.fx.spark(t.x, t.y, this.color);
+      this.kill();
+      return;
+    }
+    const nx = dx / d;
+    const ny = dy / d;
+    this.x += nx * step;
+    this.y += ny * step;
+
+    if (this.kind === 'arrow') {
+      const ang = Math.atan2(ny, nx);
+      this.gfx.lineStyle(3, this.color, 1);
+      this.gfx.lineBetween(
+        this.x - Math.cos(ang) * 9,
+        this.y - Math.sin(ang) * 9,
+        this.x + Math.cos(ang) * 5,
+        this.y + Math.sin(ang) * 5,
+      );
+    } else {
+      this.gfx.fillStyle(this.color, 0.95);
+      this.gfx.fillCircle(this.x, this.y, 6);
+      this.gfx.fillStyle(0xffffff, 0.7);
+      this.gfx.fillCircle(this.x, this.y, 2.5);
+    }
+  }
+
+  kill() {
+    this.dead = true;
+    this.gfx.destroy();
+  }
+}
diff --git a/src/main.js b/src/main.js
new file mode 100644
index 0000000..cb92ba3
--- /dev/null
+++ b/src/main.js
@@ -0,0 +1,32 @@
+import Phaser from 'phaser';
+import { GAME_WIDTH, GAME_HEIGHT, COLORS } from './config.js';
+import BootScene from './scenes/BootScene.js';
+import PreloadScene from './scenes/PreloadScene.js';
+import MenuScene from './scenes/MenuScene.js';
+import GameScene from './scenes/GameScene.js';
+import UIScene from './scenes/UIScene.js';
+import GameOverScene from './scenes/GameOverScene.js';
+
+// 全局配置：移动端优先，Scale.FIT 自适应缩放并居中
+const game = new Phaser.Game({
+  type: Phaser.AUTO,
+  parent: 'game-container',
+  backgroundColor: '#1f1812',
+  antialias: true,
+  roundPixels: true,
+  scale: {
+    mode: Phaser.Scale.FIT,
+    autoCenter: Phaser.Scale.CENTER_BOTH,
+    width: GAME_WIDTH,
+    height: GAME_HEIGHT,
+  },
+  render: {
+    pixelArt: false,
+  },
+  scene: [BootScene, PreloadScene, MenuScene, GameScene, UIScene, GameOverScene],
+});
+
+// 暴露实例便于调试 / 自动化冒烟测试
+if (typeof window !== 'undefined') {
+  window.__GAME = game;
+}
diff --git a/src/managers/BondManager.js b/src/managers/BondManager.js
new file mode 100644
index 0000000..5b22182
--- /dev/null
+++ b/src/managers/BondManager.js
@@ -0,0 +1,72 @@
+// BondManager: 每次部署/移除武将时重新扫描，激活羁绊 Buff
+import { BONDS } from '../data/bonds.js';
+import { cellKey } from '../config.js';
+
+export default class BondManager {
+  constructor() {
+    this.active = []; // 当前激活的羁绊列表
+  }
+
+  // 重新计算所有武将的 buff 字段，并返回激活的羁绊
+  // generals: General 实例数组（已部署）
+  recompute(generals) {
+    // 重置每位武将的临时倍率
+    for (const g of generals) {
+      g.buffAtk = 1;
+      g.buffCd = 1;
+      g.buffHp = 1;
+    }
+
+    const byId = {};
+    for (const g of generals) {
+      byId[g.def.id] = g;
+    }
+
+    const ctx = {
+      generals,
+      byId,
+      countTag: (t) => generals.filter((g) => g.def.tags && g.def.tags.includes(t)).length,
+      countFaction: (f) => generals.filter((g) => g.def.faction === f).length,
+      areAdjacent: (ids) => this._areAdjacent(ids, byId),
+    };
+
+    const active = [];
+    for (const bond of BONDS) {
+      try {
+        if (bond.test(ctx)) {
+          active.push(bond);
+          bond.effect(generals);
+        }
+      } catch (e) {
+        // 单条羁绊异常不应影响其它
+        console.warn('Bond eval failed', bond.id, e);
+      }
+    }
+
+    this.active = active;
+    return active;
+  }
+
+  _areAdjacent(ids, byId) {
+    const members = [];
+    for (const id of ids) {
+      if (!byId[id]) return false;
+      members.push(byId[id]);
+    }
+    // 任一成员在 8 邻域内有另一成员即视为成阵
+    for (let i = 0; i < members.length; i++) {
+      let near = false;
+      for (let j = 0; j < members.length; j++) {
+        if (i === j) continue;
+        const dc = Math.abs(members[i].col - members[j].col);
+        const dr = Math.abs(members[i].row - members[j].row);
+        if (dc <= 1 && dr <= 1) {
+          near = true;
+          break;
+        }
+      }
+      if (!near) return false;
+    }
+    return true;
+  }
+}
diff --git a/src/managers/MapManager.js b/src/managers/MapManager.js
new file mode 100644
index 0000000..707d25a
--- /dev/null
+++ b/src/managers/MapManager.js
@@ -0,0 +1,125 @@
+// MapManager: 解析关卡数据，管理可行走路径与可部署槽位
+import { TILE, MAP_COLS, MAP_ROWS, gridToPixel, cellKey, inBounds, SLOT } from '../config.js';
+
+export default class MapManager {
+  constructor(level) {
+    this.level = level;
+    this.segments = [];
+    this.length = 0;
+    this.pathCells = new Set();
+    this.slots = new Map(); // cellKey -> 'road' | 'high'
+    this._build();
+  }
+
+  _build() {
+    // 1) 像素航点
+    const pts = this.level.path.map(([c, r]) => gridToPixel(c, r));
+    this.waypoints = pts;
+
+    // 2) 分段累计长度
+    let acc = 0;
+    for (let i = 0; i < pts.length - 1; i++) {
+      const a = pts[i];
+      const b = pts[i + 1];
+      const len = Math.hypot(b.x - a.x, b.y - a.y);
+      this.segments.push({ ax: a.x, ay: a.y, bx: b.x, by: b.y, len, start: acc });
+      acc += len;
+    }
+    this.length = Math.max(1, acc);
+
+    // 3) 光栅化路径格子
+    for (let i = 0; i < pts.length; i++) {
+      const { x, y } = pts[i];
+      const col = Math.floor((x - gridToPixel(0, 0).x + TILE / 2) / TILE);
+      const row = Math.floor((y - gridToPixel(0, 0).y + TILE / 2) / TILE);
+      this._markPath(col, row);
+    }
+    for (const seg of this.segments) {
+      const steps = Math.ceil(seg.len / (TILE * 0.25));
+      for (let s = 0; s <= steps; s++) {
+        const t = s / steps;
+        const x = seg.ax + (seg.bx - seg.ax) * t;
+        const y = seg.ay + (seg.by - seg.ay) * t;
+        const origin = gridToPixel(0, 0);
+        const col = Math.floor((x - origin.x + TILE / 2) / TILE);
+        const row = Math.floor((y - origin.y + TILE / 2) / TILE);
+        this._markPath(col, row);
+      }
+    }
+
+    // 4) 路面槽位（近战）—— 来自关卡配置
+    const rs = this.level.roadSlots || [];
+    for (let i = 0; i < rs.length; i += 2) {
+      const col = rs[i];
+      const row = rs[i + 1];
+      if (inBounds(col, row)) this.slots.set(cellKey(col, row), SLOT.ROAD);
+    }
+
+    // 5) 高地槽位（远程/策士）—— 邻近路径的非路径格
+    for (let col = 0; col < MAP_COLS; col++) {
+      for (let row = 0; row < MAP_ROWS; row++) {
+        const key = cellKey(col, row);
+        if (this.pathCells.has(key)) continue;
+        if (this.slots.has(key)) continue;
+        if (this._adjacentToPath(col, row)) this.slots.set(key, SLOT.HIGH);
+      }
+    }
+  }
+
+  _markPath(col, row) {
+    if (!inBounds(col, row)) return;
+    this.pathCells.add(cellKey(col, row));
+  }
+
+  _adjacentToPath(col, row) {
+    for (let dc = -1; dc <= 1; dc++) {
+      for (let dr = -1; dr <= 1; dr++) {
+        if (dc === 0 && dr === 0) continue;
+        if (this.pathCells.has(cellKey(col + dc, row + dr))) return true;
+      }
+    }
+    return false;
+  }
+
+  // 沿路径按累计进度取坐标（用于敌军位置）
+  pointAt(progress) {
+    if (progress <= 0) {
+      const s = this.segments[0];
+      return { x: s.ax, y: s.ay, angle: Math.atan2(s.by - s.ay, s.bx - s.ax) };
+    }
+    if (progress >= this.length) {
+      const s = this.segments[this.segments.length - 1];
+      return { x: s.bx, y: s.by, angle: Math.atan2(s.by - s.ay, s.bx - s.ax) };
+    }
+    for (const s of this.segments) {
+      if (progress <= s.start + s.len) {
+        const t = (progress - s.start) / s.len;
+        return {
+          x: s.ax + (s.bx - s.ax) * t,
+          y: s.ay + (s.by - s.ay) * t,
+          angle: Math.atan2(s.by - s.ay, s.bx - s.ax),
+        };
+      }
+    }
+    const s = this.segments[this.segments.length - 1];
+    return { x: s.bx, y: s.by, angle: 0 };
+  }
+
+  getSlot(col, row) {
+    return this.slots.get(cellKey(col, row)) || null;
+  }
+
+  hasPath(col, row) {
+    return this.pathCells.has(cellKey(col, row));
+  }
+
+  // 路径终点（基地）像素
+  getBase() {
+    return this.waypoints[this.waypoints.length - 1];
+  }
+
+  // 路径起点像素
+  getStart() {
+    return this.waypoints[0];
+  }
+}
diff --git a/src/managers/WaveManager.js b/src/managers/WaveManager.js
new file mode 100644
index 0000000..a9d5ab1
--- /dev/null
+++ b/src/managers/WaveManager.js
@@ -0,0 +1,98 @@
+// WaveManager: 控制敌军生成序列
+// 将每波拆解为按时间轴触发的 spawn 事件，逐帧推进时间并回调生成。
+export default class WaveManager {
+  constructor(waves, spawnFn) {
+    this.waves = waves; // [[group,...], ...]
+    this.spawnFn = spawnFn; // (enemyKey) => void
+    this.waveIndex = -1; // 当前已开始的波（-1 表示尚未开始）
+    this.state = 'idle'; // idle | running | between | cleared
+    this.queue = []; // 当前波待生成事件 {time, key, spawned}
+    this.timer = 0;
+    this.spawnedCount = 0;
+    this.betweenDelay = 0;
+  }
+
+  get totalWaves() {
+    return this.waves.length;
+  }
+
+  get currentWaveNumber() {
+    return this.waveIndex + 1; // 1-based；idle 时为 0
+  }
+
+  // 开始下一波（返回 true 表示成功开始）
+  startNextWave() {
+    if (this.state === 'running') return false;
+    const next = this.waveIndex + 1;
+    if (next >= this.waves.length) return false;
+    this.waveIndex = next;
+    this._loadWave(next);
+    this.state = 'running';
+    this.timer = 0;
+    return true;
+  }
+
+  _loadWave(idx) {
+    const groups = this.waves[idx];
+    this.queue = [];
+    for (const g of groups) {
+      for (let i = 0; i < g.count; i++) {
+        this.queue.push({
+          time: g.start + i * g.interval,
+          key: g.enemy,
+          spawned: false,
+        });
+      }
+    }
+    this.queue.sort((a, b) => a.time - b.time);
+    this.spawnedCount = 0;
+  }
+
+  // 是否还有未生成 / 未清剿的内容
+  get isWaveActive() {
+    return this.state === 'running';
+  }
+
+  // 该波是否已全部生成完毕
+  get waveSpawnDone() {
+    return this.state === 'running' && this.queue.every((e) => e.spawned);
+  }
+
+  update(dt, aliveEnemyCount) {
+    if (this.state !== 'running') return;
+
+    this.timer += dt;
+    for (const ev of this.queue) {
+      if (!ev.spawned && this.timer >= ev.time) {
+        ev.spawned = true;
+        this.spawnedCount++;
+        this.spawnFn(ev.key);
+      }
+    }
+
+    // 当全部生成且场上无敌人 → 进入波间空档
+    if (this.waveSpawnDone && aliveEnemyCount === 0) {
+      if (this.waveIndex + 1 >= this.waves.length) {
+        this.state = 'cleared'; // 全部通关
+      } else {
+        this.state = 'between';
+        this.betweenDelay = 4.0; // 自动进入下一波的倒计时
+      }
+    }
+  }
+
+  // 处理波间倒计时；返回是否刚自动开启了下一波
+  tickBetween(dt) {
+    if (this.state !== 'between') return false;
+    this.betweenDelay -= dt;
+    if (this.betweenDelay <= 0) {
+      this.startNextWave();
+      return true;
+    }
+    return false;
+  }
+
+  get betweenRemaining() {
+    return Math.max(0, Math.ceil(this.betweenDelay));
+  }
+}
diff --git a/src/scenes/BootScene.js b/src/scenes/BootScene.js
new file mode 100644
index 0000000..8a423fb
--- /dev/null
+++ b/src/scenes/BootScene.js
@@ -0,0 +1,19 @@
+import Phaser from 'phaser';
+import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../config.js';
+
+// BootScene: 初始化全局设置，随后进入预加载
+export default class BootScene extends Phaser.Scene {
+  constructor() {
+    super('BootScene');
+  }
+
+  create() {
+    this.cameras.main.setBackgroundColor(COLORS.bg);
+    // 让文本在缩放下更清晰
+    if (this.add.text) {
+      const probe = this.add.text(0, 0, '', { fontSize: '12px' });
+      probe.destroy();
+    }
+    this.scene.start('PreloadScene');
+  }
+}
diff --git a/src/scenes/GameOverScene.js b/src/scenes/GameOverScene.js
new file mode 100644
index 0000000..c5d7854
--- /dev/null
+++ b/src/scenes/GameOverScene.js
@@ -0,0 +1,101 @@
+import Phaser from 'phaser';
+import { COLORS } from '../config.js';
+import { LEVELS } from '../data/levels.js';
+
+// GameOverScene: 胜负结算覆盖层（GameScene 与 UIScene 已暂停）
+export default class GameOverScene extends Phaser.Scene {
+  constructor() {
+    super('GameOverScene');
+  }
+
+  create() {
+    const { width, height } = this.scale;
+    const result = this.registry.get('result') || 'win';
+    const levelKey = this.registry.get('levelKey');
+    const lv = LEVELS[levelKey];
+
+    // 半透明遮罩
+    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.55);
+    overlay.setDepth(90);
+
+    const win = result === 'win';
+    const panel = this.add.container(width / 2, height / 2);
+    panel.setDepth(91);
+
+    const pw = 560;
+    const ph = 360;
+    const g = this.add.graphics();
+    g.fillStyle(0x4a3c2a, 1);
+    g.fillRoundedRect(-pw / 2, -ph / 2, pw, ph, 18);
+    g.lineStyle(4, win ? COLORS.gold : COLORS.base, 1);
+    g.strokeRoundedRect(-pw / 2, -ph / 2, pw, ph, 18);
+    panel.add(g);
+
+    panel.add(this.add.text(0, -120, win ? '荡平天下' : '兵败城破', {
+      fontFamily: 'serif',
+      fontSize: '64px',
+      color: win ? '#ffe08a' : '#f08a78',
+      stroke: '#1a1410',
+      strokeThickness: 8,
+    }).setOrigin(0.5));
+
+    panel.add(this.add.text(0, -52, win
+      ? `「${lv ? lv.name : ''}」之战，大获全胜！`
+      : `「${lv ? lv.name : ''}」失守，卷土重来吧。`, {
+      fontFamily: '"PingFang SC",sans-serif',
+      fontSize: '22px',
+      color: '#e8d9b5',
+    }).setOrigin(0.5));
+
+    this._button(panel, -130, 60, 220, 64, '再 战 一 局', COLORS.gold, () => {
+      this.scene.stop('GameOverScene');
+      this.scene.stop('UIScene');
+      this.scene.restart('GameScene');
+    });
+
+    this._button(panel, 130, 60, 220, 64, '返回主菜单', 0x6b5a40, () => {
+      this.scene.stop('GameOverScene');
+      this.scene.stop('UIScene');
+      this.scene.stop('GameScene');
+      this.scene.start('MenuScene');
+    });
+
+    panel.setScale(0.8);
+    panel.setAlpha(0);
+    this.tweens.add({
+      targets: panel,
+      scale: 1,
+      alpha: 1,
+      duration: 280,
+      ease: 'Back.Out',
+    });
+  }
+
+  _button(parent, x, y, w, h, label, color, onClick) {
+    const cont = this.add.container(x, y);
+    const g = this.add.graphics();
+    g.fillStyle(0x000000, 0.3);
+    g.fillRoundedRect(-w / 2 + 2, -h / 2 + 3, w, h, 12);
+    g.fillStyle(color, 1);
+    g.fillRoundedRect(-w / 2, -h / 2, w, h, 12);
+    g.lineStyle(2, 0x2c2418, 0.8);
+    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 12);
+    cont.add(g);
+    cont.add(this.add.text(0, 0, label, {
+      fontFamily: '"PingFang SC",sans-serif',
+      fontSize: '24px',
+      color: '#2c2418',
+      fontStyle: 'bold',
+    }).setOrigin(0.5));
+    const zone = this.add.zone(x, y, w, h);
+    zone.setInteractive({ useHandCursor: true });
+    zone.on('pointerover', () => cont.setScale(1.04));
+    zone.on('pointerout', () => cont.setScale(1));
+    zone.on('pointerdown', () => {
+      this.tweens.add({ targets: cont, scale: 0.94, duration: 70, yoyo: true });
+      this.time.delayedCall(80, onClick);
+    });
+    parent.add(cont);
+    // zone 不加入容器（独立定位），保持可交互
+  }
+}
diff --git a/src/scenes/GameScene.js b/src/scenes/GameScene.js
new file mode 100644
index 0000000..f5556d8
--- /dev/null
+++ b/src/scenes/GameScene.js
@@ -0,0 +1,466 @@
+import Phaser from 'phaser';
+import {
+  GAME_WIDTH, GAME_HEIGHT, TILE, MAP_COLS, MAP_ROWS, MAP_X, MAP_Y, MAP_WIDTH, MAP_HEIGHT,
+  COLORS, gridToPixel, pixelToGrid, cellKey, inBounds, dist, clampDt, slotTypeForClass, SLOT,
+} from '../config.js';
+import { LEVELS } from '../data/levels.js';
+import { GENERAL_BY_ID, upgradeCost, retreatRefund, MAX_LEVEL } from '../data/generals.js';
+import MapManager from '../managers/MapManager.js';
+import WaveManager from '../managers/WaveManager.js';
+import BondManager from '../managers/BondManager.js';
+import Enemy from '../entities/Enemy.js';
+import General from '../entities/General.js';
+import Projectile from '../entities/Projectile.js';
+import Fx from '../utils/Fx.js';
+
+const ULT_COST = 100;
+const ULT_DAMAGE = 900;
+const EARLY_BONUS = 25;
+
+// GameScene: 主循环 —— 输入(交由 UIScene)、战斗逻辑、碰撞/伤害、胜负判定
+export default class GameScene extends Phaser.Scene {
+  constructor() {
+    super('GameScene');
+  }
+
+  init(data) {
+    this.levelKey = (data && data.levelKey) || this.registry.get('levelKey') || 'huangjin';
+    this.registry.set('levelKey', this.levelKey);
+  }
+
+  create() {
+    const level = LEVELS[this.levelKey] || LEVELS.huangjin;
+    this.level = level;
+    this.cameras.main.setBackgroundColor(level.bgTone);
+
+    // 状态
+    this.gold = level.startGold;
+    this.maxLives = level.startLives;
+    this.lives = level.startLives;
+    this.morale = 0;
+    this.ended = false;
+    this.result = null;
+
+    // 管理器 / 集合
+    this.map = new MapManager(level);
+    this.bondManager = new BondManager();
+    this.fx = new Fx(this);
+    this.enemies = [];
+    this.generals = new Map(); // cellKey -> General
+    this.projectiles = [];
+    this._bondsDirty = true;
+
+    this.waveManager = new WaveManager(level.waves, (k) => this.spawnEnemy(k));
+
+    // 渲染棋盘
+    this._renderBoard();
+
+    // 高亮与提示图层（动态）
+    this.hoverGfx = this.add.graphics().setDepth(70);
+    this.selectionGfx = this.add.graphics().setDepth(69);
+
+    this._stateAcc = 0;
+    this._emitState();
+
+    // 启动 UI 层
+    this.scene.launch('UIScene');
+
+    // 事件：UIScene 通知部署/操作时统一从这里改状态
+    this.events.on('shutdown', () => this._cleanup());
+  }
+
+  // ---------------- 棋盘渲染 ----------------
+  _renderBoard() {
+    const g = this.add.graphics().setDepth(0);
+    // 战场底板
+    g.fillStyle(0x000000, 0.25);
+    g.fillRoundedRect(MAP_X - 10, MAP_Y - 10, MAP_WIDTH + 20, MAP_HEIGHT + 20, 12);
+    g.fillStyle(COLORS.parchmentDark, 1);
+    g.fillRoundedRect(MAP_X - 6, MAP_Y - 6, MAP_WIDTH + 12, MAP_HEIGHT + 12, 10);
+    g.fillStyle(0xe3cf9f, 1);
+    g.fillRect(MAP_X, MAP_Y, MAP_WIDTH, MAP_HEIGHT);
+
+    // 网格细线
+    g.lineStyle(1, 0xcbb482, 0.5);
+    for (let c = 0; c <= MAP_COLS; c++) {
+      g.lineBetween(MAP_X + c * TILE, MAP_Y, MAP_X + c * TILE, MAP_Y + MAP_HEIGHT);
+    }
+    for (let r = 0; r <= MAP_ROWS; r++) {
+      g.lineBetween(MAP_X, MAP_Y + r * TILE, MAP_X + MAP_WIDTH, MAP_Y + r * TILE);
+    }
+
+    // 路径格
+    for (const key of this.map.pathCells) {
+      const [c, r] = key.split(',').map(Number);
+      const x = MAP_X + c * TILE;
+      const y = MAP_Y + r * TILE;
+      g.fillStyle(COLORS.path, 1);
+      g.fillRect(x + 1, y + 1, TILE - 2, TILE - 2);
+      g.lineStyle(1, COLORS.pathEdge, 0.4);
+      g.strokeRect(x + 1, y + 1, TILE - 2, TILE - 2);
+    }
+
+    // 路径中线（方向指引）
+    const wp = this.map.waypoints;
+    g.lineStyle(TILE * 0.34, 0xc39a52, 0.6);
+    g.beginPath();
+    g.moveTo(wp[0].x, wp[0].y);
+    for (let i = 1; i < wp.length; i++) g.lineTo(wp[i].x, wp[i].y);
+    g.strokePath();
+    g.lineStyle(2, 0xf0d9a0, 0.7);
+    g.beginPath();
+    g.moveTo(wp[0].x, wp[0].y);
+    for (let i = 1; i < wp.length; i++) g.lineTo(wp[i].x, wp[i].y);
+    g.strokePath();
+
+    // 高地（可部署远程/策士）
+    for (const [key, type] of this.map.slots) {
+      if (type !== SLOT.HIGH) continue;
+      const [c, r] = key.split(',').map(Number);
+      const cx = MAP_X + c * TILE + TILE / 2;
+      const cy = MAP_Y + r * TILE + TILE / 2;
+      g.fillStyle(COLORS.highlandAlt, 0.95);
+      g.fillRoundedRect(cx - TILE / 2 + 4, cy - TILE / 2 + 4, TILE - 8, TILE - 8, 8);
+      g.lineStyle(2, COLORS.highlandEdge, 0.9);
+      g.strokeRoundedRect(cx - TILE / 2 + 4, cy - TILE / 2 + 4, TILE - 8, TILE - 8, 8);
+    }
+
+    // 路面部署位（近战）标记
+    for (const [key, type] of this.map.slots) {
+      if (type !== SLOT.ROAD) continue;
+      const [c, r] = key.split(',').map(Number);
+      const cx = MAP_X + c * TILE + TILE / 2;
+      const cy = MAP_Y + r * TILE + TILE / 2;
+      g.lineStyle(2, 0x8a5a2a, 0.8);
+      g.strokeCircle(cx, cy, TILE * 0.28);
+      g.fillStyle(0x8a5a2a, 0.18);
+      g.fillCircle(cx, cy, TILE * 0.28);
+    }
+
+    // 基地（营寨）
+    const base = this.map.getBase();
+    g.fillStyle(0x000000, 0.3);
+    g.fillRoundedRect(base.x - 4, base.y - 30, 56, 60, 8);
+    g.fillStyle(COLORS.base, 1);
+    g.fillRoundedRect(base.x - 6, base.y - 32, 52, 60, 8);
+    g.lineStyle(3, COLORS.baseEdge, 1);
+    g.strokeRoundedRect(base.x - 6, base.y - 32, 52, 60, 8);
+    this.add.text(base.x + 20, base.y - 2, '主营', {
+      fontFamily: '"PingFang SC",serif',
+      fontSize: '20px',
+      color: '#ffe6d8',
+      stroke: '#3a1410',
+      strokeThickness: 3,
+    }).setOrigin(0.5).setDepth(2);
+
+    // 入口标记
+    const start = this.map.getStart();
+    const arrow = this.add.text(start.x + 14, start.y, '⇉', {
+      fontSize: '28px',
+      color: '#9a6a32',
+    }).setOrigin(0.5).setDepth(2);
+    this.tweens.add({ targets: arrow, x: start.x + 26, duration: 600, yoyo: true, repeat: -1 });
+  }
+
+  // ---------------- 主循环 ----------------
+  update(time, delta) {
+    if (this.ended) return;
+    const dt = clampDt(delta / 1000);
+
+    // 波次推进
+    const aliveCount = this.enemies.reduce((n, e) => n + (e.alive ? 1 : 0), 0);
+    this.waveManager.update(dt, aliveCount);
+    if (this.waveManager.state === 'between') {
+      this.waveManager.tickBetween(dt);
+    }
+
+    // 阻挡分配
+    this._assignBlocks();
+
+    // 更新实体
+    for (const e of this.enemies) e.update(dt, this);
+    for (const g of this.generals.values()) g.update(dt, this);
+    for (const p of this.projectiles) p.update(dt, this);
+
+    // 结算死亡 / 漏怪
+    const remaining = [];
+    for (const e of this.enemies) {
+      if (e.alive) {
+        remaining.push(e);
+        continue;
+      }
+      if (e.leaked) {
+        this._handleLeak(e);
+      } else {
+        this._handleKill(e);
+      }
+      e.destroy();
+    }
+    this.enemies = remaining;
+
+    // 清理投射物
+    if (this.projectiles.some((p) => p.dead)) {
+      this.projectiles = this.projectiles.filter((p) => !p.dead);
+    }
+
+    // 清理阵亡武将
+    let generalLost = false;
+    for (const [key, g] of this.generals) {
+      if (!g.alive) {
+        g.destroy();
+        this.generals.delete(key);
+        generalLost = true;
+      }
+    }
+    if (generalLost || this._bondsDirty) {
+      this._recomputeBonds();
+      this._bondsDirty = false;
+    }
+
+    this._checkEnd();
+
+    // 节流推送状态
+    this._stateAcc += dt;
+    if (this._stateAcc >= 0.1) {
+      this._stateAcc = 0;
+      this._emitState();
+    }
+  }
+
+  _assignBlocks() {
+    for (const g of this.generals.values()) g.blockedEnemies = [];
+    const melee = [];
+    for (const g of this.generals.values()) {
+      if (g.cls === 'MELEE' && g.alive) melee.push(g);
+    }
+    const rr = TILE * 1.08;
+    const rr2 = rr * rr;
+    for (const e of this.enemies) {
+      e.blockedBy = null;
+      if (!e.alive || e.progress >= this.map.length) continue;
+      for (const g of melee) {
+        if (g.blockedEnemies.length >= g.def.block) continue;
+        const dx = e.x - g.x;
+        const dy = e.y - g.y;
+        if (dx * dx + dy * dy <= rr2) {
+          e.blockedBy = g;
+          g.blockedEnemies.push(e);
+          break;
+        }
+      }
+    }
+  }
+
+  // ---------------- 生成 / 结算 ----------------
+  spawnEnemy(key) {
+    const e = new Enemy(this, key, 0);
+    const p = this.map.pointAt(0);
+    e.container.x = p.x;
+    e.container.y = p.y;
+    this.enemies.push(e);
+    this._emitState();
+  }
+
+  _handleKill(e) {
+    this.gold += e.def.gold;
+    this.morale = Math.min(100, this.morale + e.def.morale);
+    this.fx.spark(e.x, e.y, e.def.color);
+    this._emitState();
+  }
+
+  _handleLeak(e) {
+    const loss = e.def.leakLives || 1;
+    this.lives -= loss;
+    this.fx.impact(this.map.getBase().x + 20, this.map.getBase().y, 60, COLORS.base);
+    this._emitState();
+  }
+
+  // ---------------- 部署 / 操作 ----------------
+  getSlotInfoAt(px, py) {
+    const { col, row } = pixelToGrid(px, py);
+    if (!inBounds(col, row)) return null;
+    const type = this.map.getSlot(col, row);
+    if (!type) return null;
+    return {
+      col, row, type,
+      occupied: this.generals.has(cellKey(col, row)),
+    };
+  }
+
+  canPlace(id, col, row) {
+    const slot = this.getSlotInfoAt(gridToPixel(col, row).x, gridToPixel(col, row).y);
+    if (!slot) return false;
+    const def = GENERAL_BY_ID[id];
+    if (!def) return false;
+    if (slotTypeForClass(def.cls) !== slot.type) return false;
+    if (slot.occupied) return false;
+    if (this.gold < def.cost) return false;
+    return true;
+  }
+
+  tryPlace(id, col, row) {
+    if (!this.canPlace(id, col, row)) return false;
+    const def = GENERAL_BY_ID[id];
+    this.gold -= def.cost;
+    const g = new General(this, def, col, row);
+    this.generals.set(cellKey(col, row), g);
+    this._bondsDirty = true;
+    this.fx.impact(g.x, g.y, TILE * 0.8, COLORS.faction[def.faction] || COLORS.gold);
+    this._emitState();
+    return true;
+  }
+
+  upgradeGeneral(g) {
+    if (!g || !g.alive || g.level >= MAX_LEVEL) return false;
+    const cost = upgradeCost(g.def, g.level);
+    if (this.gold < cost) return false;
+    this.gold -= cost;
+    g.upgrade();
+    this._bondsDirty = true;
+    this.fx.impact(g.x, g.y, TILE * 0.9, COLORS.gold);
+    this._emitState();
+    return true;
+  }
+
+  retreatGeneral(g) {
+    if (!g || !g.alive) return false;
+    const refund = retreatRefund(g.def, g.level);
+    this.gold += refund;
+    const key = cellKey(g.col, g.row);
+    g.destroy();
+    this.generals.delete(key);
+    this._bondsDirty = true;
+    this._emitState();
+    return refund;
+  }
+
+  useUltimate() {
+    if (this.morale < ULT_COST || this.ended) return false;
+    this.morale -= ULT_COST;
+    this.fx.fireAssault(this.map.waypoints);
+    for (const e of this.enemies) {
+      if (!e.alive) continue;
+      e.takeDamage(ULT_DAMAGE, 'MAGIC');
+      e.applyBurn(40, 3);
+    }
+    this._emitState();
+    return true;
+  }
+
+  startNextWave() {
+    const started = this.waveManager.startNextWave();
+    if (started && this.waveManager.state === 'running') {
+      // 提前召唤奖励
+      this.gold += EARLY_BONUS;
+      this._emitState();
+    }
+    return started;
+  }
+
+  // 选中武将（由 UIScene 调用，控制射程显示）
+  selectGeneral(g) {
+    if (this._selected) this._selected.setShowRange(false);
+    this._selected = g || null;
+    if (g) g.setShowRange(true);
+    this._drawSelection();
+  }
+
+  _drawSelection() {
+    this.selectionGfx.clear();
+    if (!this._selected || !this._selected.alive) return;
+    const g = this._selected;
+    this.selectionGfx.lineStyle(3, COLORS.gold, 0.9);
+    this.selectionGfx.strokeCircle(g.x, g.y, TILE * 0.42);
+  }
+
+  getGeneralAt(px, py) {
+    let best = null;
+    let bestD = TILE * 0.46;
+    for (const g of this.generals.values()) {
+      if (!g.alive) continue;
+      const d = dist(px, py, g.x, g.y);
+      if (d <= bestD) {
+        bestD = d;
+        best = g;
+      }
+    }
+    return best;
+  }
+
+  spawnProjectile(x, y, target, opts) {
+    const p = new Projectile(this, x, y, target, opts);
+    this.projectiles.push(p);
+  }
+
+  _recomputeBonds() {
+    const list = [...this.generals.values()].filter((g) => g.alive);
+    this.bondManager.recompute(list);
+    for (const g of list) g.refreshBonds();
+  }
+
+  // ---------------- 胜负 ----------------
+  _checkEnd() {
+    if (this.ended) return;
+    if (this.lives <= 0) {
+      this.lives = 0;
+      return this._endGame('lose');
+    }
+    if (this.waveManager.state === 'cleared' && this.enemies.length === 0) {
+      this._endGame('win');
+    }
+  }
+
+  _endGame(result) {
+    if (this.ended) return;
+    this.ended = true;
+    this.result = result;
+    this.registry.set('result', result);
+    this.registry.set('levelKey', this.levelKey);
+    this.scene.launch('GameOverScene');
+    this.scene.pause();
+    this.scene.pause('UIScene');
+  }
+
+  // ---------------- 状态广播 ----------------
+  _emitState() {
+    this.events.emit('state', {
+      gold: Math.floor(this.gold),
+      lives: this.lives,
+      maxLives: this.maxLives,
+      morale: Math.floor(this.morale),
+      ultCost: ULT_COST,
+      ultReady: this.morale >= ULT_COST,
+      wave: this.waveManager.currentWaveNumber,
+      totalWaves: this.waveManager.totalWaves,
+      waveState: this.waveManager.state,
+      betweenRemaining: this.waveManager.betweenRemaining,
+      enemiesAlive: this.enemies.reduce((n, e) => n + (e.alive ? 1 : 0), 0),
+      bonds: this.bondManager.active.map((b) => ({ id: b.id, name: b.name, desc: b.desc })),
+      deployedCount: this.generals.size,
+    });
+  }
+
+  _cleanup() {
+    this.selectGeneral(null);
+  }
+
+  get ULT_COST() { return ULT_COST; }
+
+  // 部署悬停高亮（由 UIScene 拖拽时调用）
+  setHover(col, row, valid) {
+    this.hoverGfx.clear();
+    if (col == null || row == null) return;
+    const x = MAP_X + col * TILE;
+    const y = MAP_Y + row * TILE;
+    const c = valid ? COLORS.valid : COLORS.invalid;
+    const c2 = valid ? 0x2f9e3a : 0xb13b3b;
+    this.hoverGfx.fillStyle(c, 0.35);
+    this.hoverGfx.fillRoundedRect(x + 3, y + 3, TILE - 6, TILE - 6, 6);
+    this.hoverGfx.lineStyle(3, c2, 0.95);
+    this.hoverGfx.strokeRoundedRect(x + 3, y + 3, TILE - 6, TILE - 6, 6);
+  }
+
+  clearHover() {
+    this.hoverGfx.clear();
+  }
+}
diff --git a/src/scenes/MenuScene.js b/src/scenes/MenuScene.js
new file mode 100644
index 0000000..d52f9ed
--- /dev/null
+++ b/src/scenes/MenuScene.js
@@ -0,0 +1,111 @@
+import Phaser from 'phaser';
+import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../config.js';
+import { LEVELS, LEVEL_LIST } from '../data/levels.js';
+import { GENERALS } from '../data/generals.js';
+
+// MenuScene: 标题、关卡选择、玩法说明
+export default class MenuScene extends Phaser.Scene {
+  constructor() {
+    super('MenuScene');
+  }
+
+  create() {
+    const { width, height } = this.scale;
+    const cam = this.cameras.main;
+    cam.setBackgroundColor(COLORS.bg);
+
+    // 背景竹简纹理
+    const bg = this.add.graphics();
+    bg.fillStyle(0x2a2018, 1);
+    bg.fillRect(0, 0, width, height);
+    for (let y = 0; y < height; y += 26) {
+      bg.lineStyle(1, 0x3a2e22, 0.5);
+      bg.lineBetween(0, y, width, y);
+    }
+    bg.fillStyle(COLORS.parchment, 0.06);
+    bg.fillRect(0, 0, width, height);
+
+    // 标题
+    this.add.text(width / 2, 110, '鼎足三分', {
+      fontFamily: 'serif',
+      fontSize: '86px',
+      color: '#ead9b6',
+      stroke: '#1a1410',
+      strokeThickness: 10,
+    }).setOrigin(0.5).setAlpha(0.96);
+
+    this.add.text(width / 2, 178, '三 国 · 战 略 塔 防', {
+      fontFamily: '"PingFang SC",sans-serif',
+      fontSize: '24px',
+      color: '#c9a35a',
+    }).setOrigin(0.5);
+
+    // 关卡按钮
+    const startY = 280;
+    LEVEL_LIST.forEach((key, i) => {
+      const lv = LEVELS[key];
+      const y = startY + i * 120;
+      this._levelCard(width / 2, y, lv);
+    });
+
+    // 玩法说明
+    const tipY = height - 132;
+    const tips = [
+      '🪙 拖拽底部武将卡部署：近战放路面、远程/策士放高地',
+      '⚔️ 相邻武将触发【羁绊阵法】；击杀积累气势，释放【火烧连营】大招',
+      '🛡️ 重甲惧法、魔抗惧物 —— 合理搭配职业与羁绊方能鼎足三分',
+    ];
+    tips.forEach((t, i) => {
+      this.add.text(width / 2, tipY + i * 26, t, {
+        fontFamily: '"PingFang SC",sans-serif',
+        fontSize: '16px',
+        color: '#b9a47e',
+      }).setOrigin(0.5);
+    });
+  }
+
+  _levelCard(cx, cy, lv) {
+    const w = 520;
+    const h = 96;
+    const cont = this.add.container(cx, cy);
+
+    const g = this.add.graphics();
+    g.fillStyle(0x000000, 0.3);
+    g.fillRoundedRect(-w / 2 + 3, -h / 2 + 4, w, h, 14);
+    g.fillStyle(0x4a3c2a, 1);
+    g.fillRoundedRect(-w / 2, -h / 2, w, h, 14);
+    g.lineStyle(3, COLORS.gold, 0.8);
+    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 14);
+    cont.add(g);
+
+    cont.add(this.add.text(-w / 2 + 28, -18, lv.name, {
+      fontFamily: 'serif',
+      fontSize: '34px',
+      color: '#f0d9a8',
+    }).setOrigin(0, 0.5));
+
+    cont.add(this.add.text(-w / 2 + 30, 20, `${lv.subtitle} · 共 ${lv.waves.length} 波`, {
+      fontFamily: '"PingFang SC",sans-serif',
+      fontSize: '16px',
+      color: '#cdb888',
+    }).setOrigin(0, 0.5));
+
+    cont.add(this.add.text(w / 2 - 30, 0, '▶ 出征', {
+      fontFamily: '"PingFang SC",sans-serif',
+      fontSize: '22px',
+      color: '#ffe08a',
+    }).setOrigin(1, 0.5));
+
+    const zone = this.add.zone(cx, cy, w, h);
+    zone.setInteractive({ useHandCursor: true });
+    zone.on('pointerover', () => cont.setAlpha(0.92));
+    zone.on('pointerout', () => cont.setAlpha(1));
+    zone.on('pointerdown', () => {
+      this.tweens.add({ targets: cont, scale: 0.96, duration: 80, yoyo: true });
+      this.time.delayedCall(90, () => {
+        this.registry.set('levelKey', lv.key);
+        this.scene.start('GameScene', { levelKey: lv.key });
+      });
+    });
+  }
+}
diff --git a/src/scenes/PreloadScene.js b/src/scenes/PreloadScene.js
new file mode 100644
index 0000000..5642b2b
--- /dev/null
+++ b/src/scenes/PreloadScene.js
@@ -0,0 +1,37 @@
+import Phaser from 'phaser';
+import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../config.js';
+
+// PreloadScene: 当前全部素材由 Graphics 程序化绘制，无外部资源加载
+export default class PreloadScene extends Phaser.Scene {
+  constructor() {
+    super('PreloadScene');
+  }
+
+  create() {
+    const { width, height } = this.scale;
+    this.cameras.main.setBackgroundColor(COLORS.bg);
+
+    const title = this.add.text(width / 2, height / 2 - 24, '鼎足三分', {
+      fontFamily: '"PingFang SC","Microsoft YaHei",serif',
+      fontSize: '52px',
+      color: '#ead9b6',
+      stroke: '#2c2418',
+      strokeThickness: 6,
+    }).setOrigin(0.5);
+
+    const sub = this.add.text(width / 2, height / 2 + 28, 'Three Kingdoms · Tactical Defense', {
+      fontFamily: 'serif',
+      fontSize: '20px',
+      color: '#c9b78f',
+    }).setOrigin(0.5);
+
+    this.tweens.add({
+      targets: [title, sub],
+      alpha: { from: 0, to: 1 },
+      duration: 400,
+      ease: 'Quad.Out',
+    });
+
+    this.time.delayedCall(500, () => this.scene.start('MenuScene'));
+  }
+}
diff --git a/src/scenes/UIScene.js b/src/scenes/UIScene.js
new file mode 100644
index 0000000..3d28a93
--- /dev/null
+++ b/src/scenes/UIScene.js
@@ -0,0 +1,600 @@
+import Phaser from 'phaser';
+import {
+  GAME_WIDTH, GAME_HEIGHT, TILE, slotTypeForClass, COLORS,
+} from '../config.js';
+import { GENERALS } from '../data/generals.js';
+import { upgradeCost, retreatRefund, MAX_LEVEL } from '../data/generals.js';
+
+// 布局常量
+const HUD_TOP = 8;
+const HUD_H = 96; // 8 .. 104
+const CARD_BAR_TOP = 656;
+const CARD_BAR_H = 92; // 656 .. 748
+const CARD_W = 82;
+const CARD_GAP = 6;
+const CARD_CY = CARD_BAR_TOP + CARD_BAR_H / 2;
+
+const MORALE_BAR_X = 300;
+const MORALE_BAR_W = 240;
+
+// UIScene: 顶部 HUD + 底部武将卡（拖拽部署）+ 武将操作菜单 + 大招/波次控制
+export default class UIScene extends Phaser.Scene {
+  constructor() {
+    super('UIScene');
+  }
+
+  create() {
+    this.gameScene = this.scene.get('GameScene');
+    this.drag = null;
+    this.cards = []; // { def, container, dim, rect:{x,y,w,h} }
+    this._topButtons = [];
+    this._menuButtons = [];
+    this._menu = null;
+    this._selected = null;
+    this._lastBondIds = null;
+
+    this._buildTopHud();
+    this._buildCardBar();
+
+    this.input.on('pointerdown', (p) => this._onDown(p));
+    this.input.on('pointermove', (p) => this._onMove(p));
+    this.input.on('pointerup', (p) => this._onUp(p));
+
+    this.gameScene.events.on('state', (s) => this._onState(s));
+    // 初次拉取一次状态
+    this._onState(this._collectState());
+  }
+
+  _collectState() {
+    const g = this.gameScene;
+    return {
+      gold: Math.floor(g.gold),
+      lives: g.lives,
+      maxLives: g.maxLives,
+      morale: Math.floor(g.morale),
+      ultCost: g.ULT_COST,
+      ultReady: g.morale >= g.ULT_COST,
+      wave: g.waveManager.currentWaveNumber,
+      totalWaves: g.waveManager.totalWaves,
+      waveState: g.waveManager.state,
+      betweenRemaining: g.waveManager.betweenRemaining,
+      enemiesAlive: g.enemies.reduce((n, e) => n + (e.alive ? 1 : 0), 0),
+      bonds: g.bondManager.active.map((b) => ({ id: b.id, name: b.name, desc: b.desc })),
+      deployedCount: g.generals.size,
+    };
+  }
+
+  // ---------------- 顶部 HUD ----------------
+  _buildTopHud() {
+    const g = this.add.graphics().setDepth(5);
+    g.fillStyle(0x000000, 0.28);
+    g.fillRoundedRect(6, HUD_TOP + 3, GAME_WIDTH - 12, HUD_H, 14);
+    g.fillStyle(0x3a2e20, 0.96);
+    g.fillRoundedRect(6, HUD_TOP, GAME_WIDTH - 12, HUD_H, 14);
+    g.lineStyle(2, COLORS.gold, 0.5);
+    g.strokeRoundedRect(6, HUD_TOP, GAME_WIDTH - 12, HUD_H, 14);
+
+    const cy = HUD_TOP + 30;
+
+    // 生命（桃）
+    this._pill(60, cy, 0xf08a78, '桃', '#3a1410');
+    this.livesText = this.add.text(96, cy, '12', {
+      fontFamily: 'serif', fontSize: '26px', color: '#ffd9cf', fontStyle: 'bold',
+    }).setOrigin(0, 0.5).setDepth(6);
+
+    // 金币（金）
+    this._pill(168, cy, COLORS.gold, '金', '#2c2418');
+    this.goldText = this.add.text(204, cy, '0', {
+      fontFamily: 'serif', fontSize: '26px', color: '#ffe9a8', fontStyle: 'bold',
+    }).setOrigin(0, 0.5).setDepth(6);
+
+    // 气势条
+    const bx = MORALE_BAR_X;
+    const by = cy;
+    this.add.text(bx, by - 16, '气势', {
+      fontFamily: '"PingFang SC",sans-serif', fontSize: '14px', color: '#bcd6e6',
+    }).setOrigin(0, 1).setDepth(6);
+    const barBg = this.add.graphics().setDepth(6);
+    barBg.fillStyle(0x10100c, 0.8);
+    barBg.fillRoundedRect(bx, by - 8, MORALE_BAR_W, 16, 8);
+    this.moraleBarBg = barBg;
+    this.moraleFill = this.add.graphics().setDepth(6);
+    this.moraleText = this.add.text(bx + MORALE_BAR_W - 4, by, '0/100', {
+      fontFamily: '"PingFang SC",sans-serif', fontSize: '13px', color: '#dff3ff',
+    }).setOrigin(1, 0.5).setDepth(7);
+
+    // 火烧连营 大招按钮
+    this.ultContainer = this.add.container(620, cy).setDepth(6);
+    this._buildButton(this.ultContainer, 150, 40, '火烧连营', 0xb23a1e, '#ffe6d8');
+    this.ultContainer.add(this.add.text(0, 0, '', {
+      fontFamily: '"PingFang SC",sans-serif', fontSize: '11px', color: '#ffd9c8',
+    }).setOrigin(0.5).setName('cost'));
+    // 调整文字位置：主标题上、cost 下
+    this.ultContainer.getByName('cost') && this.ultContainer.getByName('cost').setPosition(0, 13);
+
+    // 波次信息
+    this.waveText = this.add.text(740, cy - 10, '准备出征', {
+      fontFamily: '"PingFang SC",serif', fontSize: '22px', color: '#ffe9b8', fontStyle: 'bold',
+    }).setOrigin(0, 0.5).setDepth(6);
+    this.waveSubText = this.add.text(740, cy + 14, '', {
+      fontFamily: '"PingFang SC",sans-serif', fontSize: '14px', color: '#cbb888',
+    }).setOrigin(0, 0.5).setDepth(6);
+
+    // 召唤下一波按钮
+    this.ctaContainer = this.add.container(1200, cy).setDepth(6);
+    this._buildButton(this.ctaContainer, 180, 44, '开始第一波', 0x2f7d4a, '#eafff0');
+
+    // 羁绊行
+    this.bondsContainer = this.add.container(GAME_WIDTH / 2, HUD_TOP + 80).setDepth(6);
+  }
+
+  _pill(cx, cy, color, label, textColor) {
+    const c = this.add.container(cx, cy).setDepth(6);
+    const g = this.add.graphics();
+    g.fillStyle(0x000000, 0.3);
+    g.fillCircle(2, 3, 17);
+    g.fillStyle(color, 1);
+    g.fillCircle(0, 0, 17);
+    g.lineStyle(2, COLORS.ink, 0.8);
+    g.strokeCircle(0, 0, 17);
+    c.add(g);
+    c.add(this.add.text(0, 0, label, {
+      fontFamily: 'serif', fontSize: '18px', color: textColor, fontStyle: 'bold',
+    }).setOrigin(0.5));
+  }
+
+  _buildButton(parent, w, h, label, color, textColor) {
+    // 在容器内绘制按钮背景与文字（文字名为 'label'）
+    const g = this.add.graphics();
+    g.fillStyle(0x000000, 0.3);
+    g.fillRoundedRect(-w / 2 + 2, -h / 2 + 3, w, h, 10);
+    g.fillStyle(color, 1);
+    g.fillRoundedRect(-w / 2, -h / 2, w, h, 10);
+    g.lineStyle(2, COLORS.ink, 0.7);
+    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 10);
+    parent.add(g);
+    const t = this.add.text(0, 0, label, {
+      fontFamily: '"PingFang SC",sans-serif', fontSize: '18px', color: textColor, fontStyle: 'bold',
+    }).setOrigin(0.5).setName('label');
+    parent.add(t);
+    parent._bw = w;
+    parent._bh = h;
+  }
+
+  _setBtnLabel(parent, label) {
+    const t = parent.getByName('label');
+    if (t) t.setText(label);
+  }
+
+  // ---------------- 武将卡栏 ----------------
+  _buildCardBar() {
+    const g = this.add.graphics().setDepth(5);
+    g.fillStyle(0x000000, 0.3);
+    g.fillRoundedRect(6, CARD_BAR_TOP + 3, GAME_WIDTH - 12, CARD_BAR_H, 14);
+    g.fillStyle(0x2c2218, 0.97);
+    g.fillRoundedRect(6, CARD_BAR_TOP, GAME_WIDTH - 12, CARD_BAR_H, 14);
+    g.lineStyle(2, COLORS.gold, 0.4);
+    g.strokeRoundedRect(6, CARD_BAR_TOP, GAME_WIDTH - 12, CARD_BAR_H, 14);
+
+    this.add.text(20, CARD_BAR_TOP + CARD_BAR_H / 2, '将', {
+      fontFamily: 'serif', fontSize: '20px', color: '#c9a35a',
+    }).setOrigin(0, 0.5).setDepth(6).setAlpha(0.7);
+
+    const count = GENERALS.length;
+    const totalW = count * CARD_W + (count - 1) * CARD_GAP;
+    const startX = (GAME_WIDTH - totalW) / 2 + CARD_W / 2;
+    GENERALS.forEach((def, i) => {
+      const cx = startX + i * (CARD_W + CARD_GAP);
+      this.cards.push(this._buildCard(cx, CARD_CY, def));
+    });
+  }
+
+  _buildCard(cx, cy, def) {
+    const cont = this.add.container(cx, cy).setDepth(6);
+    const fac = COLORS.faction[def.faction] || COLORS.ink;
+    const w = CARD_W;
+    const h = 80;
+
+    const g = this.add.graphics();
+    g.fillStyle(0x000000, 0.35);
+    g.fillRoundedRect(-w / 2 + 2, -h / 2 + 3, w, h, 8);
+    g.fillStyle(0x4a3a28, 1);
+    g.fillRoundedRect(-w / 2, -h / 2, w, h, 8);
+    g.fillStyle(fac, 1);
+    g.fillRoundedRect(-w / 2, -h / 2, w, 26, 8);
+    g.fillRect(-w / 2, -h / 2 + 16, w, 12);
+    g.lineStyle(2, 0x1a1410, 0.6);
+    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 8);
+    cont.add(g);
+
+    cont.add(this.add.text(0, -h / 2 + 13, def.char, {
+      fontFamily: 'serif', fontSize: '18px', color: '#ffffff', fontStyle: 'bold',
+    }).setOrigin(0.5));
+
+    cont.add(this.add.text(0, 6, def.name, {
+      fontFamily: '"PingFang SC",sans-serif', fontSize: '15px', color: '#f0dcae',
+    }).setOrigin(0.5));
+
+    const clsLabel = def.cls === 'MELEE' ? '近战' : def.cls === 'RANGE' ? '远程' : '策士';
+    cont.add(this.add.text(0, 22, clsLabel, {
+      fontFamily: '"PingFang SC",sans-serif', fontSize: '10px', color: '#cdb888',
+    }).setOrigin(0.5));
+
+    // 费用角标
+    const costBg = this.add.graphics();
+    costBg.fillStyle(0x1a1410, 0.85);
+    costBg.fillCircle(w / 2 - 8, -h / 2 + 8, 11);
+    costBg.lineStyle(1.5, COLORS.gold, 1);
+    costBg.strokeCircle(w / 2 - 8, -h / 2 + 8, 11);
+    cont.add(costBg);
+    cont.add(this.add.text(w / 2 - 8, -h / 2 + 8, String(def.cost), {
+      fontFamily: 'serif', fontSize: '12px', color: '#ffe08a', fontStyle: 'bold',
+    }).setOrigin(0.5).setName('cost'));
+
+    // 不可负担时的遮罩
+    const dim = this.add.graphics();
+    dim.fillStyle(0x10100c, 0.55);
+    dim.fillRoundedRect(-w / 2, -h / 2, w, h, 8);
+    dim.setVisible(false);
+    cont.add(dim);
+
+    return { def, container: cont, dim, rect: { x: cx - w / 2, y: cy - h / 2, w, h } };
+  }
+
+  // ---------------- 输入 ----------------
+  _onDown(p) {
+    const px = p.x;
+    const py = p.y;
+    const gs = this.gameScene;
+
+    // 1) 菜单按钮
+    if (this._menu && this._menu.visible) {
+      const btn = this._hitRects(this._menuButtons, px, py);
+      if (btn) {
+        btn.action();
+        this._refreshMenu();
+        return;
+      }
+    }
+
+    // 2) 顶部按钮（大招 / 召唤波次）
+    const tb = this._hitTopButtons(px, py);
+    if (tb) {
+      tb.action();
+      return;
+    }
+
+    // 3) 选中已有武将
+    const gen = gs.getGeneralAt(px, py);
+    if (gen) {
+      this._openMenu(gen);
+      return;
+    }
+
+    // 4) 拖拽武将卡
+    const card = this._hitRects(this.cards.map((c) => ({ rect: c.rect, ref: c })), px, py);
+    if (card && card.ref) {
+      this._closeMenu();
+      this._startDrag(card.ref.def, px, py);
+      return;
+    }
+
+    // 5) 空白处 → 取消选中
+    this._closeMenu();
+  }
+
+  _onMove(p) {
+    if (!this.drag) return;
+    const px = p.x;
+    const py = p.y;
+    this.drag.ghost.setPosition(px, py);
+    const slot = this.gameScene.getSlotInfoAt(px, py);
+    if (slot) {
+      const valid = this._placementValid(this.drag.def, slot);
+      this.gameScene.setHover(slot.col, slot.row, valid);
+      this.drag.valid = valid;
+      this.drag.col = slot.col;
+      this.drag.row = slot.row;
+    } else {
+      this.gameScene.clearHover();
+      this.drag.valid = false;
+      this.drag.col = null;
+    }
+  }
+
+  _onUp(p) {
+    if (!this.drag) return;
+    const d = this.drag;
+    if (d.valid && d.col != null) {
+      this.gameScene.tryPlace(d.def.id, d.col, d.row);
+    }
+    this.gameScene.clearHover();
+    if (d.ghost) d.ghost.destroy();
+    this.drag = null;
+  }
+
+  _placementValid(def, slot) {
+    if (!slot) return false;
+    if (slotTypeForClass(def.cls) !== slot.type) return false;
+    if (slot.occupied) return false;
+    if (this.gameScene.gold < def.cost) return false;
+    return true;
+  }
+
+  _startDrag(def, px, py) {
+    const ghost = this.add.container(px, py).setDepth(80);
+    const fac = COLORS.faction[def.faction] || COLORS.ink;
+    const r = TILE * 0.34;
+    const g = this.add.graphics();
+    g.fillStyle(0x000000, 0.3);
+    g.fillCircle(2, 4, r + 3);
+    g.fillStyle(fac, 0.92);
+    g.fillCircle(0, 0, r + 3);
+    g.lineStyle(2.5, COLORS.ink, 1);
+    g.strokeCircle(0, 0, r + 3);
+    g.fillStyle(0xf5ecd6, 0.95);
+    g.fillCircle(0, 0, r - 1);
+    ghost.add(g);
+    ghost.add(this.add.text(0, -1, def.char, {
+      fontFamily: 'serif', fontSize: '22px', color: '#2c2418', fontStyle: 'bold',
+    }).setOrigin(0.5));
+    ghost.setAlpha(0.85);
+    ghost.setScale(1.05);
+    this.drag = { def, ghost, valid: false, col: null, row: null };
+  }
+
+  _hitRects(list, px, py) {
+    for (const item of list) {
+      const r = item.rect;
+      if (px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h) return item;
+    }
+    return null;
+  }
+
+  _hitTopButtons(px, py) {
+    for (const b of this._topButtons) {
+      if (!b.enabled || !b.visible) continue;
+      const r = b.rect;
+      if (px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h) return b;
+    }
+    return null;
+  }
+
+  // ---------------- 武将操作菜单 ----------------
+  _openMenu(general) {
+    this._selected = general;
+    this.gameScene.selectGeneral(general);
+    this._buildMenu();
+  }
+
+  _refreshMenu() {
+    if (!this._selected || !this._selected.alive || !this._selected.container.active) {
+      this._closeMenu();
+      return;
+    }
+    this._buildMenu();
+  }
+
+  _buildMenu() {
+    if (this._menu) this._menu.destroy(true);
+    this._menuButtons = [];
+    const gs = this.gameScene;
+    const g = this._selected;
+    if (!g || !g.alive) {
+      this._menu = null;
+      return;
+    }
+
+    // 面板位置（贴在武将上方，超界则下移/夹紧）
+    const w = 196;
+    const h = 168;
+    let cx = g.x;
+    let cy = g.y - h / 2 - TILE * 0.6;
+    cx = Phaser.Math.Clamp(cx, w / 2 + 12, GAME_WIDTH - w / 2 - 12);
+    cy = Phaser.Math.Clamp(cy, h / 2 + 12, GAME_HEIGHT - CARD_BAR_TOP - h / 2 - 6);
+
+    const cont = this.add.container(cx, cy).setDepth(85);
+    const bg = this.add.graphics();
+    bg.fillStyle(0x000000, 0.35);
+    bg.fillRoundedRect(-w / 2 + 3, -h / 2 + 4, w, h, 12);
+    bg.fillStyle(0x4a3a28, 0.98);
+    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 12);
+    bg.lineStyle(3, COLORS.gold, 0.9);
+    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 12);
+    cont.add(bg);
+
+    const fac = COLORS.faction[g.def.faction] || COLORS.ink;
+    cont.add(this.add.text(0, -h / 2 + 22, `${g.def.name} · Lv.${g.level}`, {
+      fontFamily: 'serif', fontSize: '20px', color: '#ffe9b8', fontStyle: 'bold',
+    }).setOrigin(0.5));
+
+    const atk = Math.round(g.atk);
+    const statTxt = g.def.cls === 'MELEE'
+      ? `攻 ${atk}  血 ${Math.round(g.hp)}/${g.maxHp}\n挡 ${g.def.block}  程 ${g.def.range.toFixed(1)}`
+      : `攻 ${atk}  程 ${g.def.range.toFixed(1)}\n${g.def.cls === 'MAGE' ? '法术伤害' : '物理伤害'} · ${g.def.atkCD.toFixed(2)}s`;
+    cont.add(this.add.text(0, -h / 2 + 58, statTxt, {
+      fontFamily: '"PingFang SC",sans-serif', fontSize: '13px', color: '#e6d4ac', align: 'center',
+    }).setOrigin(0.5).setLineSpacing(3));
+
+    // 按钮区
+    const by = h / 2 - 24;
+    const bw = 80;
+    const bh = 34;
+
+    // 升级
+    const upMax = g.level >= MAX_LEVEL;
+    const upCost = upgradeCost(g.def, g.level);
+    const upLabel = upMax ? '已满级' : `升级 ${upCost}`;
+    this._mkMenuBtn(cont, -48, by, bw, bh, upLabel, upMax ? 0x555049 : 0x2f7d4a, () => {
+      if (!upMax) gs.upgradeGeneral(g);
+    }, { disabled: upMax || gs.gold < upCost });
+
+    // 撤退
+    const refund = retreatRefund(g.def, g.level);
+    this._mkMenuBtn(cont, 48, by, bw, bh, `撤退 +${refund}`, 0x8a4a3a, () => {
+      gs.retreatGeneral(g);
+      this._closeMenu();
+    });
+
+    // 关闭
+    this._mkMenuBtn(cont, 0, by - bh - 8, bw, bh, '关闭', 0x5a4a36, () => this._closeMenu());
+
+    this._menu = cont;
+  }
+
+  _mkMenuBtn(parent, lx, ly, w, h, label, color, action, opts = {}) {
+    const disabled = !!opts.disabled;
+    const g = this.add.graphics();
+    g.fillStyle(0x000000, 0.3);
+    g.fillRoundedRect(lx - w / 2 + 2, ly - h / 2 + 2, w, h, 8);
+    g.fillStyle(color, disabled ? 0.5 : 1);
+    g.fillRoundedRect(lx - w / 2, ly - h / 2, w, h, 8);
+    g.lineStyle(1.5, COLORS.ink, 0.6);
+    g.strokeRoundedRect(lx - w / 2, ly - h / 2, w, h, 8);
+    parent.add(g);
+    parent.add(this.add.text(lx, ly, label, {
+      fontFamily: '"PingFang SC",sans-serif', fontSize: '14px', color: '#fff', fontStyle: 'bold',
+    }).setOrigin(0.5));
+    this._menuButtons.push({
+      rect: { x: parent.x + lx - w / 2, y: parent.y + ly - h / 2, w, h },
+      action,
+    });
+  }
+
+  _closeMenu() {
+    if (this._menu) {
+      this._menu.destroy(true);
+      this._menu = null;
+    }
+    this._menuButtons = [];
+    this._selected = null;
+    this.gameScene.selectGeneral(null);
+  }
+
+  // ---------------- 状态刷新 ----------------
+  _onState(s) {
+    this.lastState = s;
+    this.livesText.setText(String(s.lives));
+    if (s.lives <= 3) this.livesText.setColor('#ff8a78');
+    else this.livesText.setColor('#ffd9cf');
+
+    this.goldText.setText(String(s.gold));
+
+    // 气势条
+    const ratio = Math.max(0, Math.min(1, s.morale / s.ultCost));
+    this.moraleFill.clear();
+    this.moraleFill.fillStyle(s.ultReady ? 0xff8a3a : COLORS.morale, 1);
+    this.moraleFill.fillRoundedRect(MORALE_BAR_X, HUD_TOP + 22, MORALE_BAR_W * ratio, 16, 8);
+    this.moraleText.setText(`${s.morale}/${s.ultCost}`);
+
+    // 大招按钮
+    this.ultContainer.setAlpha(s.ultReady ? 1 : 0.5);
+    const costTxt = this.ultContainer.getByName('cost');
+    if (costTxt) costTxt.setText(s.ultReady ? '-ready-' : `需 ${s.ultCost}`);
+
+    // 顶部按钮注册
+    this._topButtons = [
+      {
+        rect: { x: this.ultContainer.x - this.ultContainer._bw / 2, y: this.ultContainer.y - this.ultContainer._bh / 2, w: this.ultContainer._bw, h: this.ultContainer._bh },
+        action: () => this.gameScene.useUltimate(),
+        enabled: s.ultReady,
+        visible: true,
+      },
+    ];
+
+    // 波次文本
+    const ws = s.waveState;
+    let main = '';
+    let sub = '';
+    if (ws === 'idle') {
+      main = '准备出征';
+      sub = `共 ${s.totalWaves} 波敌军`;
+    } else if (ws === 'running') {
+      main = `第 ${s.wave} / ${s.totalWaves} 波`;
+      sub = `残敌 ${s.enemiesAlive}`;
+    } else if (ws === 'between') {
+      main = `第 ${s.wave} / ${s.totalWaves} 波 · 结束`;
+      sub = `下一波 ${s.betweenRemaining}s 后开启`;
+    } else if (ws === 'cleared') {
+      main = '扫平千军';
+      sub = '最后一波已清剿';
+    }
+    this.waveText.setText(main);
+    this.waveSubText.setText(sub);
+
+    // 召唤按钮
+    let ctaLabel = '';
+    let ctaEnabled = false;
+    if (ws === 'idle') {
+      ctaLabel = '开始第一波';
+      ctaEnabled = true;
+    } else if (ws === 'between') {
+      ctaLabel = `提前迎战 (+25金)`;
+      ctaEnabled = true;
+    }
+    this._setBtnLabel(this.ctaContainer, ctaLabel || '——');
+    this.ctaContainer.setAlpha(ctaEnabled ? 1 : 0.4);
+    this.ctaContainer.setVisible(ws === 'idle' || ws === 'between');
+    this._topButtons.push({
+      rect: { x: this.ctaContainer.x - this.ctaContainer._bw / 2, y: this.ctaContainer.y - this.ctaContainer._bh / 2, w: this.ctaContainer._bw, h: this.ctaContainer._bh },
+      action: () => this.gameScene.startNextWave(),
+      enabled: ctaEnabled,
+      visible: this.ctaContainer.visible,
+    });
+
+    // 武将卡可负担状态
+    for (const card of this.cards) {
+      card.dim.setVisible(this.gameScene.gold < card.def.cost);
+    }
+
+    // 羁绊展示
+    const ids = s.bonds.map((b) => b.id).sort().join(',');
+    if (ids !== this._lastBondIds) {
+      this._lastBondIds = ids;
+      this._renderBonds(s.bonds);
+    }
+
+    // 菜单数值随金币/等级刷新
+    if (this._selected) this._refreshMenu();
+  }
+
+  _renderBonds(bonds) {
+    this.bondsContainer.removeAll(true);
+    if (!bonds.length) {
+      const t = this.add.text(0, 0, '部署相邻武将以激活羁绊阵法', {
+        fontFamily: '"PingFang SC",sans-serif', fontSize: '13px', color: '#9a8a6a',
+      }).setOrigin(0.5);
+      this.bondsContainer.add(t);
+      return;
+    }
+    const gap = 8;
+    const items = bonds.map((b) => {
+      const c = this.add.container(0, 0);
+      const g = this.add.graphics();
+      g.fillStyle(0x2a4a32, 0.9);
+      g.fillRoundedRect(-50, -12, 100, 24, 8);
+      g.lineStyle(1.5, COLORS.gold, 0.7);
+      g.strokeRoundedRect(-50, -12, 100, 24, 8);
+      c.add(g);
+      c.add(this.add.text(0, 0, b.name, {
+        fontFamily: '"PingFang SC",sans-serif', fontSize: '13px', color: '#ffe9a8', fontStyle: 'bold',
+      }).setOrigin(0.5));
+      c._w = 100;
+      return c;
+    });
+    const total = items.reduce((n, c) => n + c._w, 0) + gap * (items.length - 1);
+    let x = -total / 2;
+    for (const c of items) {
+      c.x = x + c._w / 2;
+      this.bondsContainer.add(c);
+      x += c._w + gap;
+    }
+  }
+
+  update() {
+    // 选中武将的描边跟随
+    if (this._selected) {
+      this.gameScene._drawSelection();
+    }
+  }
+}
diff --git a/src/utils/Fx.js b/src/utils/Fx.js
new file mode 100644
index 0000000..9b34715
--- /dev/null
+++ b/src/utils/Fx.js
@@ -0,0 +1,158 @@
+// Fx: 泼墨风格打击特效 —— 短暂图形 + 淡出回收
+import { COLORS } from '../config.js';
+
+export default class Fx {
+  constructor(scene) {
+    this.scene = scene;
+  }
+
+  // 近战劈砍：十字墨痕
+  slash(x, y, color = 0xffe9a8) {
+    const s = this.scene;
+    const g = s.add.graphics();
+    g.setDepth(60);
+    const ang = Math.random() * Math.PI;
+    const len = 18;
+    g.lineStyle(4, color, 1);
+    g.lineBetween(
+      x - Math.cos(ang) * len,
+      y - Math.sin(ang) * len,
+      x + Math.cos(ang) * len,
+      y + Math.sin(ang) * len,
+    );
+    g.lineStyle(2, COLORS.ink, 0.6);
+    g.lineBetween(
+      x - Math.cos(ang + 1.2) * len * 0.8,
+      y - Math.sin(ang + 1.2) * len * 0.8,
+      x + Math.cos(ang + 1.2) * len * 0.8,
+      y + Math.sin(ang + 1.2) * len * 0.8,
+    );
+    s.tweens.add({
+      targets: g,
+      alpha: 0,
+      scaleX: 1.5,
+      scaleY: 1.5,
+      duration: 180,
+      onComplete: () => g.destroy(),
+    });
+  }
+
+  // 范围冲击：扩散墨环
+  impact(x, y, radius, color = COLORS.gold) {
+    const s = this.scene;
+    const g = s.add.graphics();
+    g.setDepth(58);
+    g.fillStyle(color, 0.18);
+    g.fillCircle(x, y, radius * 0.4);
+    g.lineStyle(4, color, 0.9);
+    g.strokeCircle(x, y, radius * 0.4);
+    s.tweens.add({
+      targets: g,
+      alpha: 0,
+      duration: 360,
+      ease: 'Quad.Out',
+      onUpdate: (tween) => {
+        const p = tween.progress;
+        g.clear();
+        g.fillStyle(color, 0.18 * (1 - p));
+        g.fillCircle(x, y, radius * (0.4 + p * 0.6));
+        g.lineStyle(4, color, 0.9 * (1 - p));
+        g.strokeCircle(x, y, radius * (0.4 + p * 0.6));
+      },
+      onComplete: () => g.destroy(),
+    });
+  }
+
+  // 单体射线（狙击）
+  beam(x1, y1, x2, y2, color = 0xfff2b0) {
+    const s = this.scene;
+    const g = s.add.graphics();
+    g.setDepth(59);
+    g.lineStyle(5, color, 1);
+    g.lineBetween(x1, y1, x2, y2);
+    g.lineStyle(2, 0xffffff, 0.9);
+    g.lineBetween(x1, y1, x2, y2);
+    s.tweens.add({
+      targets: g,
+      alpha: 0,
+      duration: 200,
+      onComplete: () => g.destroy(),
+    });
+  }
+
+  // 命中火星
+  spark(x, y, color = 0xffe9a8) {
+    const s = this.scene;
+    const g = s.add.graphics();
+    g.setDepth(60);
+    const n = 4;
+    for (let i = 0; i < n; i++) {
+      const a = (i / n) * Math.PI * 2;
+      g.fillStyle(color, 1);
+      g.fillCircle(x + Math.cos(a) * 4, y + Math.sin(a) * 4, 2);
+    }
+    s.tweens.add({
+      targets: g,
+      alpha: 0,
+      duration: 180,
+      onComplete: () => g.destroy(),
+    });
+  }
+
+  // 终极技：火烧连营 —— 沿路径燃起连环火，全屏暖光
+  fireAssault(path) {
+    const s = this.scene;
+    // 全屏暖色闪烁
+    const flash = s.add.rectangle(
+      s.scale.width / 2,
+      s.scale.height / 2,
+      s.scale.width,
+      s.scale.height,
+      0xff7a2a,
+      0.0,
+    );
+    flash.setDepth(80);
+    flash.setScrollFactor(0);
+    s.tweens.add({
+      targets: flash,
+      fillAlpha: 0.32,
+      duration: 120,
+      yoyo: true,
+      hold: 120,
+      onComplete: () => flash.destroy(),
+    });
+    // 沿路径每隔一段点燃
+    const waypoints = path || [];
+    for (let i = 0; i < waypoints.length; i++) {
+      const wp = waypoints[i];
+      s.time.delayedCall(i * 70, () => {
+        this.impact(wp.x, wp.y, 70, 0xff7a2a);
+        this._firePillar(wp.x, wp.y);
+      });
+    }
+  }
+
+  _firePillar(x, y) {
+    const s = this.scene;
+    const g = s.add.graphics();
+    g.setDepth(57);
+    const draw = (alpha, scale) => {
+      g.clear();
+      g.fillStyle(0xff6a1a, 0.5 * alpha);
+      g.fillEllipse(x, y, 26 * scale, 50 * scale);
+      g.fillStyle(0xffd24a, 0.7 * alpha);
+      g.fillEllipse(x, y - 6 * scale, 16 * scale, 32 * scale);
+    };
+    let t = 0;
+    s.time.addEvent({
+      delay: 40,
+      repeat: 12,
+      callback: () => {
+        t += 1;
+        const a = t < 6 ? t / 6 : 1 - (t - 6) / 7;
+        draw(Math.max(0, a), 0.6 + t * 0.12);
+      },
+      onComplete: () => g.destroy(),
+    });
+  }
+}
diff --git a/vite.config.js b/vite.config.js
new file mode 100644
index 0000000..7934169
--- /dev/null
+++ b/vite.config.js
@@ -0,0 +1,17 @@
+import { defineConfig } from 'vite';
+
+// `base: './'` 生成相对路径资源引用，便于部署到 GitHub Pages 子路径或任意静态目录。
+export default defineConfig({
+  base: './',
+  server: {
+    host: true,
+    port: 5173,
+  },
+  build: {
+    outDir: 'dist',
+    sourcemap: false,
+    target: 'es2018',
+    // Phaser 引擎本身约 1.5MB，属正常体积
+    chunkSizeWarningLimit: 1600,
+  },
+});
