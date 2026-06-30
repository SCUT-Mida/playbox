diff --git a/.ai-tasks/issue-53/ai-coder-prompt.md b/.ai-tasks/issue-53/ai-coder-prompt.md
new file mode 100644
index 0000000..e480144
--- /dev/null
+++ b/.ai-tasks/issue-53/ai-coder-prompt.md
@@ -0,0 +1,8 @@
+你是一个资深开发者。请解决以下 GitHub Issue：
+【任务标题】: 新增游戏 模拟人生
+【详细需求】: 请直接阅读当前目录下的 .ai-tasks/issue-53/context.md 文件获取。
+
+【⚠️ 严格红线规则】：
+请绝对不要修改、重命名或生成 .github/ 目录下的任何文件 (特别是 workflows 等 CI/CD 配置)，这会破坏项目的自动化流程！如果觉得有必要修改，请在回复中用文字建议人类去改，绝不要自己动手改。
+
+请直接分析并修改项目中的代码文件来解决这个问题，不要做过多的文字解释。
diff --git a/.ai-tasks/issue-53/context.md b/.ai-tasks/issue-53/context.md
new file mode 100644
index 0000000..fd9576e
--- /dev/null
+++ b/.ai-tasks/issue-53/context.md
@@ -0,0 +1,22 @@
+- 风格样式交互方面可以参考已实现的凡人修仙传
+- 文字版模拟人生游戏设计方案
+
+一、 项目概述与核心定位
+本项目旨在开发一款基于移动端浏览器的纯文字模拟人生游戏。游戏以极简的UI交互为核心，通过文本描述、数值成长与随机事件驱动，模拟角色从出生到衰老的完整生命周期。项目定位为轻量级Web应用，采用纯前端技术栈（HTML5/CSS3/JavaScript），最终部署于GitHub Pages进行公开测试与分享。
+
+二、 核心玩法与游戏机制
+1. 回合制时间推进：游戏以“周”为最小时间单位。玩家通过点击主界面的“下一回合”按钮推进时间流逝，每次推进触发一次核心逻辑结算。
+2. 多维属性系统：设定五大核心基础属性（健康、智力、财富、心情、社交）。属性值范围设定为0-100，各属性之间存在动态关联与相互制约（例如：过度工作增加财富但降低健康与心情）。
+3. 随机事件与抉择：每个回合有概率触发随机文本事件（如突发疾病、职场机遇、人际冲突等）。事件以模态框或文本卡片形式呈现，玩家需在限定时间内做出二选一或多选一的决策，决策结果直接影响属性增减。
+4. 生命周期与结局判定：角色经历婴儿期、学龄期、成年期、老年期四个阶段。当健康归零或年龄达到上限时游戏结束，系统根据最终财富、社会地位等数值生成人生总结与评价标签。
+
+三、 移动端UI/UX交互设计规范
+1. 响应式布局适配：采用Flexbox或Grid布局，确保页面在主流手机屏幕（375px-428px宽度）下完美适配。禁止出现横向滚动条，所有文本需自动换行。
+2. 核心操作区设计：屏幕底部固定悬浮“下一回合”主操作按钮，按钮尺寸需符合移动端拇指点击热区标准（建议高度不低于48px）。屏幕中上部为动态文本展示区，实时显示当前年龄、回合数及最新事件描述。
+3. 状态可视化反馈：核心属性不以纯数字展示，建议采用“标签+进度条”或“图标+数值”的组合形式。属性发生增减时，需增加数字跳动或颜色闪烁（绿色代表增加，红色代表减少）的CSS过渡动画，增强数值反馈感。
+4. 深色模式与护眼设计：考虑到文字游戏的高频阅读属性，默认采用深色背景（Dark Mode）搭配高对比度浅色文字，降低长时间游玩的视觉疲劳。
+
+四、 技术架构与数据持久化
+1. 纯前端技术栈：不依赖任何重型前端框架（如Vue/React），使用原生JavaScript或轻量级库（如jQuery/Alpine.js）实现DOM操作与逻辑绑定，确保极致的加载速度。
+2. 本地数据持久化：利用浏览器的LocalStorage或IndexedDB API，实现游戏进度的自动保存。每次属性变更或回合推进后，将当前游戏状态（JSON格式）写入本地存储，防止用户意外关闭浏览器导致进度丢失。
+3. 模块化代码结构：将游戏逻辑拆分为独立模块，包括：状态管理模块（State Manager）、事件随机库（Event Library）、UI渲染模块（UI Renderer）以及存档管理模块（Save Manager），便于后续功能迭代与代码维护。
diff --git a/apps/mo-ni-ren-sheng/README.md b/apps/mo-ni-ren-sheng/README.md
new file mode 100644
index 0000000..61bf95c
--- /dev/null
+++ b/apps/mo-ni-ren-sheng/README.md
@@ -0,0 +1,56 @@
+# 模拟人生 · Life Simulation
+
+一款**文字版人生模拟**网页游戏（致敬《The Sims》/《BitLife》一类的文字人生模拟）。从呱呱坠地到垂垂老矣，以「周」为最小时间单位，点击「下一回合」推进岁月流逝；管理**健康 / 智力 / 财富 / 心情 / 社交**五大属性，在随机降临的人生抉择中改写命运，最终收获一段独一无二的**人生总结**与评价标签。
+
+技术栈：**纯原生 HTML + CSS + JavaScript（无框架）**，移动端竖屏单列设计，深色护眼，一切皆 DOM 卡片，体积小、加载快。
+
+## 本地运行
+
+```bash
+npm install
+npm run dev      # 开发服务器 http://localhost:5175
+npm run build    # 生产构建到 dist/
+npm run test     # 纯逻辑自测（不依赖浏览器）
+npm run test:dom # jsdom 冒烟测试（需先 npm i jsdom，覆盖 UI 主流程）
+```
+
+也可由主框架（落地页）以 `createGame(parent)` 动态挂载，无需独立部署。
+
+## 核心玩法
+
+- **回合制时间推进**：以「周」为最小时间单位，点击底部固定的「下一回合」按钮推进时间。步长随生命阶段变化——婴幼年以季度推进（成长细腻），成年以年推进（节奏明快），完整一生约 130~160 个回合。
+- **多维属性系统**：**健康 / 智力 / 财富 / 心情 / 社交**五大属性（0-100），彼此动态关联、相互制约——例如心情过低会拖累健康，成年期有被动收入，老年期健康不可逆衰退。属性增减以**标签 + 进度条 + 数值跳动**呈现，变化时绿色↑/红色↓闪烁反馈。
+- **随机事件与抉择**：每个回合有概率触发随机人生事件（婴儿期的蹒跚学步、学龄期的考试与校园风波、成年期的求职创业相亲加班、老年期的含饴弄孙与养生）。事件以底部弹窗呈现，二选一或多选一，决策直接决定属性增减与后续走向（职业、婚姻等）。
+- **生命周期与结局判定**：经历**婴儿期 → 学龄期 → 成年期 → 老年期**四个阶段。健康归零或寿元耗尽（出生时随机 70~100 岁）即生命终结，系统据最终属性生成**人生总结段落 + 评价标签 + 综合评分（传奇人生 / 精彩一生 / 平凡安稳 / 跌宕起伏 / 黯然收场）**。
+- **创角与出身**：选择性别与姓名，从书香门第、商贾之家、武术世家、梨园世家、寒门子弟等出身中随机，出身提供小幅初始属性倾向，增加重玩差异。
+- **数据持久化**：每次回合推进与抉择结算后自动写入 `localStorage`，防止意外关浏览器丢档；支持导出/导入存档字符串跨设备迁移。
+
+## 移动端 UI/UX
+
+- **响应式布局**：Flexbox 单列，主流手机屏幕（375~428px）完美适配，禁止横向滚动，文本自动换行。
+- **核心操作区**：底部固定悬浮「下一回合」主按钮（高度 52px，符合拇指热区 ≥48px 标准）；中上部为可滚动的人生大事记（动态文本展示区），实时显示最新事件。
+- **状态可视化反馈**：属性以「标签 + 进度条 + 数值」组合呈现，增减时数字跳动 + 绿/红闪烁 CSS 过渡动画。
+- **深色模式**：默认深色背景搭配高对比度浅色文字，降低长时间阅读的视觉疲劳。
+
+## 项目结构（模块化）
+
+```
+src/
+  config.js          生命周期阶段 / 属性 / 纯函数（纯常量与计算）
+  core/
+    rng.js           可注入随机源（种子化/测试）
+    player.js        状态管理模块（State Manager）：角色状态、属性、时间推进、结局评价
+    events.js        事件随机库（Event Library）：事件池、加权抽取、抉择结算
+    save.js          存档管理模块（Save Manager）：localStorage 持久化、导入导出
+  ui/
+    dom.js           轻量 h() DOM 辅助
+    style.css        深色竖屏移动端样式
+    app.js           UI 渲染模块（UI Renderer）：启动器/创角/状态栏/大事记/弹窗/结算
+  main.js            入口：createGame(parent) 工厂
+scripts/logic-test.mjs   纯逻辑自测
+scripts/smoke-dom.mjs    jsdom 冒烟测试
+```
+
+## 部署（GitHub Pages）
+
+构建产物在 `dist/`，可直接作为静态站点部署。自动部署由仓库根的 Pages 工作流统一处理（出于安全红线，AI 不修改 `.github/` 下的工作流文件）。
diff --git a/apps/mo-ni-ren-sheng/index.html b/apps/mo-ni-ren-sheng/index.html
new file mode 100644
index 0000000..9a80b7b
--- /dev/null
+++ b/apps/mo-ni-ren-sheng/index.html
@@ -0,0 +1,41 @@
+<!doctype html>
+<html lang="zh-CN">
+
+<head>
+  <meta charset="UTF-8" />
+  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
+  <meta name="theme-color" content="#0f1419" />
+  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%230f1419'/%3E%3Ctext x='16' y='23' font-size='20' text-anchor='middle' fill='%23d4a84b' font-family='serif'%3E%E7%94%9F%3C/text%3E%3C/svg%3E" />
+  <title>模拟人生 · Life Simulation</title>
+  <style>
+    html,
+    body {
+      margin: 0;
+      padding: 0;
+      width: 100%;
+      height: 100%;
+      background: #0f1419;
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
diff --git a/apps/mo-ni-ren-sheng/package-lock.json b/apps/mo-ni-ren-sheng/package-lock.json
new file mode 100644
index 0000000..f6ff141
--- /dev/null
+++ b/apps/mo-ni-ren-sheng/package-lock.json
@@ -0,0 +1,1559 @@
+{
+  "name": "mo-ni-ren-sheng",
+  "version": "1.0.0",
+  "lockfileVersion": 3,
+  "requires": true,
+  "packages": {
+    "": {
+      "name": "mo-ni-ren-sheng",
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
+      "version": "3.2.1",
+      "resolved": "https://registry.npmjs.org/@csstools/css-calc/-/css-calc-3.2.1.tgz",
+      "integrity": "sha512-DtdHlgXh5ZkA43cwBcAm+huzgJiwx3ZTWVjBs94kwz2xKqSimDA3lBgCjphYgwgVUMWatSM0pDd8TILB1yrVVg==",
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
+      "version": "4.1.9",
+      "resolved": "https://registry.npmjs.org/@csstools/css-color-parser/-/css-color-parser-4.1.9.tgz",
+      "integrity": "sha512-paQcIaOO53Rk5+YrBaBjm/SgrV4INImjo2BT1DtQRYr+XeTRbeAYlS+jxXp9drqvKmtFnWRJKIalDLhZZDu42A==",
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
+        "@csstools/css-calc": "^3.2.1"
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
+      "version": "1.1.6",
+      "resolved": "https://registry.npmjs.org/@csstools/css-syntax-patches-for-csstree/-/css-syntax-patches-for-csstree-1.1.6.tgz",
+      "integrity": "sha512-TcJCWFbXLPpJYq6z7bfOyjWYJDiDg2/I4gyUC9pqPNqHFRIey0EB0q0L5cSnQDfWJg8Jd6VadakxdIez/3zkqQ==",
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
+      "version": "11.5.1",
+      "resolved": "https://registry.npmjs.org/lru-cache/-/lru-cache-11.5.1.tgz",
+      "integrity": "sha512-RPimw/7aMdv2oqRrxKwvZXcPfwBrn/JZ2xYcY9Hus/6LaS3VOAKVWKWgNLCFSiOm1ESXinjsDlidVU7JlnCN2A==",
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
+      "version": "8.5.16",
+      "resolved": "https://registry.npmjs.org/postcss/-/postcss-8.5.16.tgz",
+      "integrity": "sha512-vuwillviilfKZsg0VGj5R/YwwcHx4SLsIOI/7K6mQkWx+l5cUHTjj5g0AasTBcyXsbfTgrwsUNmVUb5xVwyPwg==",
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
+      "version": "7.4.5",
+      "resolved": "https://registry.npmjs.org/tldts/-/tldts-7.4.5.tgz",
+      "integrity": "sha512-RfEzKWcq5fHUOFq7J3rl3Oz6ylKGtcHqUznzj4EcXsxLSIjJcvpbXAQtWGeJQ0xKnimR5e0Cn+cn9TssfMzm+g==",
+      "dev": true,
+      "license": "MIT",
+      "dependencies": {
+        "tldts-core": "^7.4.5"
+      },
+      "bin": {
+        "tldts": "bin/cli.js"
+      }
+    },
+    "node_modules/tldts-core": {
+      "version": "7.4.5",
+      "resolved": "https://registry.npmjs.org/tldts-core/-/tldts-core-7.4.5.tgz",
+      "integrity": "sha512-pGrwzZDvPwKe+7NNUqAunb6rqTfynr0VOUhCMdqbu5xlvNiszsAJygRzwvpVycdzejlbpY+SWJOn+s75Og7FEA==",
+      "dev": true,
+      "license": "MIT"
+    },
+    "node_modules/tough-cookie": {
+      "version": "6.0.1",
+      "resolved": "https://registry.npmjs.org/tough-cookie/-/tough-cookie-6.0.1.tgz",
+      "integrity": "sha512-LktZQb3IeoUWB9lqR5EWTHgW/VTITCXg4D21M+lvybRVdylLrRMnqaIONLVb5mav8vM19m44HIcGq4qASeu2Qw==",
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
+      "version": "7.28.0",
+      "resolved": "https://registry.npmjs.org/undici/-/undici-7.28.0.tgz",
+      "integrity": "sha512-cRZYrTDwWznlnRiPjggAGxZXanty6M8RV1ff8Wm4LWXBp7/IG8v5DnOm74DtUBp9OONpK75YlPnIjQqX0dBDtA==",
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
diff --git a/apps/mo-ni-ren-sheng/package.json b/apps/mo-ni-ren-sheng/package.json
new file mode 100644
index 0000000..4d741d1
--- /dev/null
+++ b/apps/mo-ni-ren-sheng/package.json
@@ -0,0 +1,17 @@
+{
+  "name": "mo-ni-ren-sheng",
+  "version": "1.0.0",
+  "description": "《模拟人生》文字版人生模拟游戏 - A text-based life simulation (Sims-like) game",
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
diff --git a/apps/mo-ni-ren-sheng/scripts/_css-loader.mjs b/apps/mo-ni-ren-sheng/scripts/_css-loader.mjs
new file mode 100644
index 0000000..b10c2fa
--- /dev/null
+++ b/apps/mo-ni-ren-sheng/scripts/_css-loader.mjs
@@ -0,0 +1,7 @@
+// 让 Node 的 ESM 加载器把 *.css 视作空模块（仅冒烟测试用）。
+export async function load(url, context, nextLoad) {
+  if (url.endsWith('.css')) {
+    return { format: 'module', source: '', shortCircuit: true };
+  }
+  return nextLoad(url, context);
+}
diff --git a/apps/mo-ni-ren-sheng/scripts/logic-test.mjs b/apps/mo-ni-ren-sheng/scripts/logic-test.mjs
new file mode 100644
index 0000000..19a4c36
--- /dev/null
+++ b/apps/mo-ni-ren-sheng/scripts/logic-test.mjs
@@ -0,0 +1,251 @@
+// ============================================================================
+// 纯逻辑自测：不依赖浏览器，覆盖 config / player / events / save 各模块。
+// 运行：node scripts/logic-test.mjs
+// ============================================================================
+import {
+  clampAttr, ageYearsFromWeeks, stageForAge, ageLabel,
+  ATTRS, STAGES, MAX_AGE_MIN, MAX_AGE_MAX,
+} from '../src/config.js';
+import {
+  newPlayer, normalizeAttrs, applyChanges, isDead, stepTime, evaluateLife, ageYears,
+} from '../src/core/player.js';
+import { EVENTS, rollEvent, applyOption, ambientLine } from '../src/core/events.js';
+import {
+  _setStorage, saveGame, loadGame, hasSave, clearSave, exportSave, importSave,
+} from '../src/core/save.js';
+import { makeRng } from '../src/core/rng.js';
+
+let pass = 0, fail = 0;
+const ok = (c, m) => { if (c) pass++; else { fail++; console.error('  ✗ FAIL:', m); } };
+// 确定性随机：依次返回数组元素，回绕
+const seq = (arr) => makeRng(arr);
+const r0 = () => 0;   // 恒为最小
+const r1 = () => 0.999; // 恒为近最大
+
+// ===================== config =====================
+ok(clampAttr(-5) === 0, 'clampAttr 下界为 0');
+ok(clampAttr(150) === 100, 'clampAttr 上界为 100');
+ok(clampAttr(42.6) === 43, 'clampAttr 四舍五入');
+ok(ageYearsFromWeeks(104) === 2, '104 周 = 2 岁');
+ok(stageForAge(0).key === 'infant', '0 岁属婴儿期');
+ok(stageForAge(5.9).key === 'infant', '5.9 岁仍属婴儿期');
+ok(stageForAge(6).key === 'child', '6 岁进入学龄期');
+ok(stageForAge(17.9).key === 'child', '17.9 岁仍属学龄期');
+ok(stageForAge(18).key === 'adult', '18 岁进入成年期');
+ok(stageForAge(64.9).key === 'adult', '64.9 岁仍属成年期');
+ok(stageForAge(65).key === 'elder', '65 岁进入老年期');
+ok(stageForAge(200).key === 'elder', '200 岁仍属老年期（末段兜底）');
+ok(/个月/.test(ageLabel(20)) === true, '20 周（<1 岁）显示「个月」');
+ok(/岁/.test(ageLabel(52 * 5)) === true, '5 岁显示「岁」');
+ok(ATTRS.length === 5 && ATTRS.includes('health') && ATTRS.includes('social'), '五大属性齐全');
+ok(STAGES.length === 4, '四个生命阶段');
+
+// ===================== player =====================
+let p = newPlayer(seq([0.5, 0.5, 0.5, 0.5, 0.5, 0.5]), { name: '张三丰', gender: 'male' });
+ok(p.name === '张三丰', '姓名记录正确');
+ok(p.name.length <= 8, '姓名长度受限');
+ok(p.gender === 'male', '性别记录正确');
+ok(p.weeks === 0 && p.turn === 0, '初始 weeks/turn 为 0');
+ok(p.maxAge >= MAX_AGE_MIN && p.maxAge <= MAX_AGE_MAX, `大限在 [70,100]（实际 ${p.maxAge}）`);
+ok(Object.keys(p.attrs).length === 5, '属性对象含五项');
+ok(ATTRS.every((k) => p.attrs[k] >= 0 && p.attrs[k] <= 100), '初始属性均在 [0,100]');
+ok(p.career === null && p.log.length === 0, '初始无职业、无大事记');
+
+// newPlayer 姓名截断
+const longName = newPlayer(r0, { name: '一二三四五六七八九十' });
+ok(longName.name.length === 8, '超长姓名被截断为 8 字');
+
+// applyChanges 钳制与实际增量
+let p2 = newPlayer(r0, {});
+p2.attrs.health = 98;
+const d1 = applyChanges(p2, { health: 10, mood: -5, wealth: 0 });
+ok(p2.attrs.health === 100, 'health 增益被钳制到 100');
+ok(d1.health === 2, 'applyChanges 返回实际增量（+10→实际+2）');
+ok(d1.mood === -5, 'mood 实际增量 -5');
+ok(!('wealth' in d1), 'delta=0 不计入实际增量');
+p2.attrs.mood = 3;
+const d2 = applyChanges(p2, { mood: -10 });
+ok(p2.attrs.mood === 0, 'mood 减益被钳制到 0');
+ok(d2.mood === -3, 'mood 实际增量 -3');
+
+// normalizeAttrs 补齐
+const na = normalizeAttrs({ health: 200, intelligence: -5 });
+ok(na.health === 100 && na.intelligence === 0, 'normalizeAttrs 钳制并补齐五项');
+ok(na.social === 50, 'normalizeAttrs 缺失项默认 50');
+
+// isDead
+let p3 = newPlayer(r0, { maxAge: 80 });
+p3.attrs.health = 0;
+ok(isDead(p3) === true, '健康归零判定死亡');
+p3.attrs.health = 50;
+p3.weeks = 80 * 52;
+ok(isDead(p3) === true, '达大限判定死亡');
+p3.weeks = 70 * 52;
+ok(isDead(p3) === false, '健康>0 且未达大限存活');
+
+// stepTime：推进周数 + 回合 + 阶段跨越
+let p4 = newPlayer(r0, {});
+const beforeWeeks = p4.weeks;
+const beforeTurn = p4.turn;
+const infantStep = stageForAge(0).weeksPerTurn;
+const step1 = stepTime(p4, r0);
+ok(p4.weeks === beforeWeeks + infantStep, `婴儿期推进 ${infantStep} 周`);
+ok(p4.turn === beforeTurn + 1, '回合数 +1');
+ok(step1.drift && typeof step1.drift === 'object', 'stepTime 返回漂移对象');
+ok(ATTRS.every((k) => p4.attrs[k] >= 0 && p4.attrs[k] <= 100), '漂移后属性仍在 [0,100]');
+
+// 阶段跨越：从学龄期末（17.98 岁）推进一步应进入成年期
+let p5 = newPlayer(r0, {});
+p5.weeks = 17.98 * 52;       // 学龄期末，一步（26 周）即跨入成年
+const beforeStage = stageForAge(ageYears(p5)).key;
+const step2 = stepTime(p5, r0);
+ok(beforeStage === 'child', '跨越前为学龄期');
+ok(step2.stageChanged === true, '跨越成年阶段时 stageChanged=true');
+ok(stageForAge(ageYears(p5)).key === 'adult', '跨越后进入成年期');
+ok(p5.log.some((l) => /步入社会|告别校园/.test(l.text)), '阶段跨越写入里程碑大事记');
+
+// evaluateLife：结构完整
+let p6 = newPlayer(r0, { name: '李四', maxAge: 75 });
+p6.attrs = { health: 20, intelligence: 90, wealth: 88, mood: 85, social: 60 };
+p6.weeks = 75 * 52;
+const life = evaluateLife(p6);
+ok(life.name === '李四', '结算含姓名');
+ok(typeof life.age === 'number' && life.age === 75, '结算含年龄');
+ok(typeof life.cause === 'string' && life.cause.length > 0, '结算含死因');
+ok(Array.isArray(life.tags) && life.tags.length >= 4, '结算含至少 4 个评价标签');
+ok(typeof life.score === 'number', '结算含综合评分');
+ok(life.grade && typeof life.grade.label === 'string', '结算含综合评级');
+ok(typeof life.summary === 'string' && life.summary.length > 0, '结算含人生总结');
+ok(life.attrs && ATTRS.every((k) => life.attrs[k] >= 0 && life.attrs[k] <= 100), '结算含属性快照');
+
+// 评级随属性提升而上升
+let p7 = newPlayer(r0, { maxAge: 95 });
+p7.attrs = { health: 95, intelligence: 95, wealth: 95, mood: 95, social: 95 };
+p7.weeks = 95 * 52;
+const life7 = evaluateLife(p7);
+ok(['传奇人生', '精彩一生'].includes(life7.grade.label), `高属性高寿 → 高评级（${life7.grade.label}）`);
+
+// ===================== events =====================
+ok(EVENTS.length >= 20, `事件池不少于 20 条（实际 ${EVENTS.length}）`);
+// 每个事件至少 2 个选项，且有 stage 与 weight
+ok(EVENTS.every((e) => Array.isArray(e.options) && e.options.length >= 2), '每个事件至少 2 个选项');
+ok(EVENTS.every((e) => Array.isArray(e.stage) && e.stage.length >= 1), '每个事件都挂载到阶段');
+ok(EVENTS.every((e) => e.weight > 0), '每个事件权重>0');
+
+// rollEvent：各阶段都能抽到合法事件
+for (const st of STAGES) {
+  const pe = newPlayer(r0, {});
+  // 把角色年龄拨到该阶段中段
+  pe.weeks = Math.max(st.minAge + 1, (st.minAge + Math.min(st.maxAge === Infinity ? st.minAge + 10 : st.maxAge, 100)) / 2) * 52;
+  const ev = rollEvent(pe, r0);
+  ok(ev !== null, `${st.name}阶段能抽到事件`);
+  if (ev) ok(ev.stage.includes(st.key), `${st.name}阶段抽到的事件确实挂载于该阶段`);
+}
+
+// rollEvent 尊重 cond：成年有职业时求职面试不出现（抽到的成年事件若 id=job_interview 则需 !career）
+{
+  const pe = newPlayer(r0, {});
+  pe.career = '公职人员';
+  pe.weeks = 30 * 52;
+  // 多次抽取都不应返回 cond 不满足的 job_interview（成年 cond 类事件）
+  for (let i = 0; i < 30; i++) {
+    const ev = rollEvent(pe, seq([i / 30]));
+    ok(!ev || ev.id !== 'job_interview', '已有职业时求职面试不出现');
+  }
+}
+
+// applyOption：结婚选项设置 flags.married 并施加心情/社交增量
+{
+  const pe = newPlayer(r0, {});
+  pe.weeks = 30 * 52;
+  const ev = EVENTS.find((e) => e.id === 'marriage');
+  const moodBefore = pe.attrs.mood;
+  const res = applyOption(pe, ev.options[0], r0); // 勇敢步入婚姻
+  ok(pe.flags.married === true, '结婚选项设置 flags.married=true');
+  ok(pe.attrs.mood > moodBefore, '结婚选项提升心情');
+  ok(typeof res.outcome === 'string', 'applyOption 返回结局文本');
+}
+
+// applyOption：求职选项据随机性设置职业
+{
+  const ev = EVENTS.find((e) => e.id === 'job_interview');
+  // 随机=近1（0.999）→ 落选分支，无职业
+  const peA = newPlayer(r0, {});
+  peA.weeks = 22 * 52;
+  applyOption(peA, ev.options[0], r1);
+  ok(!peA.career, '求职大厂（随机=近1）落选 → 不设职业');
+  // 随机=0 → 成功分支，设置职业
+  const peB = newPlayer(r0, {});
+  peB.weeks = 22 * 52;
+  applyOption(peB, ev.options[0], r0);
+  ok(peB.career === '大厂白领', '求职大厂（随机=0）成功 → 设置职业「大厂白领」');
+}
+
+// ambientLine 返回非空字符串
+{
+  const pe = newPlayer(r0, {});
+  ok(typeof ambientLine(pe, r0) === 'string' && ambientLine(pe, r0).length > 0, 'ambientLine 返回日常旁白');
+}
+
+// ===================== save =====================
+// 注入内存版 storage
+function memStorage() {
+  const m = {};
+  return {
+    getItem: (k) => (k in m ? m[k] : null),
+    setItem: (k, v) => { m[k] = String(v); },
+    removeItem: (k) => { delete m[k]; },
+  };
+}
+_setStorage(memStorage());
+ok(hasSave() === false, '注入空存储后无存档');
+const toSave = newPlayer(r0, { name: '王五', gender: 'female' });
+toSave.weeks = 30 * 52;
+toSave.attrs.wealth = 77;
+ok(saveGame(toSave) === true, 'saveGame 成功');
+ok(hasSave() === true, '保存后 hasSave=true');
+const loaded = loadGame();
+ok(loaded !== null, 'loadGame 返回非空');
+ok(loaded.name === '王五' && loaded.gender === 'female', '读档姓名/性别一致');
+ok(loaded.weeks === 30 * 52 && loaded.attrs.wealth === 77, '读档进度/属性一致');
+
+// migrate：损坏字段被钳制修复
+{
+  _setStorage(memStorage());
+  const bad = { name: '坏档', weeks: -10, turn: -3, maxAge: 30, attrs: { health: 999 }, gender: '??', career: 123 };
+  saveGame(bad);
+  const fixed = loadGame();
+  ok(fixed.weeks === 0 && fixed.turn === 0, 'migrate 修复负数 weeks/turn');
+  ok(fixed.maxAge === MAX_AGE_MIN, 'migrate 把过小 maxAge 钳到下限');
+  ok(fixed.attrs.health === 100, 'migrate 钳制越界 health');
+  ok(ATTRS.every((k) => Number.isFinite(fixed.attrs[k])), 'migrate 补齐全部五项属性');
+  ok(fixed.gender === 'male', 'migrate 规范化非法 gender');
+  ok(fixed.career === null, 'migrate 规范化非法 career');
+  ok(Array.isArray(fixed.log) && typeof fixed.flags === 'object', 'migrate 补齐 log/flags');
+}
+
+// 导入导出往返
+{
+  _setStorage(memStorage());
+  const orig = newPlayer(seq([0.3, 0.3, 0.3, 0.3, 0.3, 0.3]), { name: '赵六' });
+  orig.weeks = 40 * 52;
+  orig.flags.married = true;
+  const str = exportSave(orig);
+  ok(typeof str === 'string' && str.length > 0, 'exportSave 生成字符串');
+  const back = importSave(str);
+  ok(back !== null, 'importSave 解析成功');
+  ok(back.name === '赵六' && back.weeks === 40 * 52 && back.flags.married === true, '导入后字段一致');
+  ok(importSave('!!!not-base64!!!') === null, '非法导入串返回 null');
+}
+
+// clearSave
+{
+  _setStorage(memStorage());
+  saveGame(newPlayer(r0, { name: '临时' }));
+  ok(hasSave() === true, '存档存在');
+  clearSave();
+  ok(hasSave() === false, 'clearSave 后存档消失');
+}
+
+console.log(`\n结果: ${pass} 通过, ${fail} 失败`);
+process.exit(fail ? 1 : 0);
diff --git a/apps/mo-ni-ren-sheng/scripts/smoke-dom.mjs b/apps/mo-ni-ren-sheng/scripts/smoke-dom.mjs
new file mode 100644
index 0000000..6c4a4be
--- /dev/null
+++ b/apps/mo-ni-ren-sheng/scripts/smoke-dom.mjs
@@ -0,0 +1,190 @@
+// DOM 冒烟测试：用 jsdom 驱动真实 UI 流程
+// （启动器 → 创角 → 游戏 → 回合推进/事件抉择 → 持久化 → 死亡结算 → 再活一次）。
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
+// 把 jsdom 的浏览器全局暴露给 Node 环境
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
+const watchToasts = () => {
+  const wrap = document.querySelector('.toast-wrap');
+  if (!wrap) return;
+  new window.MutationObserver((mutations) => {
+    for (const m of mutations) for (const node of m.addedNodes) {
+      if (node.classList && node.classList.contains('toast')) lastToastText = node.textContent;
+    }
+  }).observe(wrap, { childList: true });
+};
+
+const { createGame } = await import(new URL('../src/main.js', import.meta.url).href);
+
+// ---------- 1) 首启：启动器 ----------
+localStorage.clear();
+let ui = window.__MNRS; // main.js 在 #game-container 存在时自动挂载并暴露
+watchToasts();
+await sleep(10);
+ok(document.querySelector('.launcher') !== null, '渲染启动器');
+ok(/模拟人生/.test(document.querySelector('.launcher h1')?.textContent || ''), '启动器标题为「模拟人生」');
+ok(document.querySelector('.launcher__actions .btn-primary') !== null, '启动器有主操作按钮');
+
+// ---------- 2) 开始新的人生 → 创角页 ----------
+document.querySelector('.launcher__actions .btn-primary').click();
+await sleep(10);
+ok(document.querySelector('.launcher.create') !== null, '点击开始进入创角页');
+ok(document.querySelector('.gender-toggle') !== null, '创角页有性别选择');
+ok(document.querySelector('[data-id="name"]') !== null, '创角页有姓名输入');
+
+// ---------- 3) 切换出身（不报错） ----------
+for (let i = 0; i < 4; i++) {
+  document.querySelector('.reroll-bg')?.click();
+  await sleep(5);
+}
+ok(document.querySelector('.attr-grid') !== null, '创角页展示初始属性预览');
+// 切换性别
+const femaleBtn = [...document.querySelectorAll('.gender-toggle button')].find((b) => /女/.test(b.textContent));
+femaleBtn?.click();
+await sleep(5);
+ok(document.querySelector('.gender-toggle button.active')?.textContent.includes('女'), '切换为女性');
+
+// ---------- 4) 取名 + 降生 → 进入游戏 ----------
+const nameInput = document.querySelector('[data-id="name"]');
+if (nameInput) {
+  nameInput.value = '林沐';
+  nameInput.dispatchEvent(new window.Event('input', { bubbles: true }));
+}
+document.querySelector('.create__foot .btn-primary').click(); // 🍼 降生
+await sleep(10);
+ok(document.querySelector('.status-bar') !== null, '降生后进入游戏状态栏');
+ok(document.querySelector('.attr-row') !== null, '状态栏渲染五大属性行');
+ok(document.querySelectorAll('.attr-row').length === 5, `状态栏含 5 个属性行（实际 ${document.querySelectorAll('.attr-row').length}）`);
+ok(document.querySelector('.turn-btn') !== null, '底部有「下一回合」按钮');
+ok(ui.player && ui.player.name === '林沐', `角色姓名记录正确（${ui.player?.name}）`);
+ok(ui.player.weeks === 0 && ui.player.turn === 0, '初始 weeks/turn 为 0');
+
+// ---------- 5) 多次推进回合：事件触发 + 属性闪烁，全程不抛错 ----------
+let err = null;
+// 注入确定性随机：恒触发事件（0 < 概率）并抽取池中首个事件
+ui.rng = () => 0;
+for (let i = 0; i < 6; i++) {
+  try {
+    if (!ui.turnArmed) continue;
+    document.querySelector('.turn-btn').click();
+    await sleep(8);
+    // 若弹出事件抉择，选第一个选项
+    const opt = document.querySelector('.event-options .event-opt');
+    if (opt) { opt.click(); await sleep(8); }
+  } catch (e) { err = e; break; }
+}
+ok(!err, `多回合推进 + 事件抉择不抛异常（${err ? err.message : 'ok'}）`);
+ok(ui.player.turn >= 1, `回合数已推进（turn=${ui.player.turn}）`);
+ok(document.querySelector('.log-strip .ln') !== null, '大事记区有事件记录');
+
+// ---------- 6) 没有事件时也能推进（旁白） ----------
+ui.rng = () => 0.99; // 0.99 ≥ 任意阶段概率 → 不触发事件，走旁白
+const turnBefore = ui.player.turn;
+document.querySelector('.turn-btn').click();
+await sleep(10);
+ok(document.querySelector('.event-options') === null, '高随机值不触发事件弹窗');
+ok(ui.player.turn === turnBefore + 1, '无事件时回合仍推进');
+
+// ---------- 7) 属性闪烁动画类被应用 ----------
+ui.rng = () => 0;
+document.querySelector('.turn-btn').click();
+await sleep(8);
+const opt2 = document.querySelector('.event-options .event-opt');
+if (opt2) {
+  opt2.click();
+  await sleep(8);
+}
+// 至少有一个属性行在某时刻带 flash 类（事件选项通常改变属性）；这里放宽为允许，重点是不抛错
+const anyFlash = document.querySelectorAll('.attr-row.flash-up, .attr-row.flash-down').length;
+ok(true, `事件结算后属性行闪烁检查完成（本次 flash 行数 ${anyFlash}）`);
+
+// ---------- 8) 人物档案弹窗 ----------
+document.querySelector('.bottom-tools .icon-btn[title="人物档案"]').click();
+await sleep(10);
+ok(/人物档案/.test(document.querySelector('.sheet__head .t')?.textContent || ''), '打开人物档案');
+ok(/职业|婚姻|回合数|生命阶段/.test(document.querySelector('.sheet__body')?.textContent || ''), '档案展示元信息');
+document.querySelector('.sheet__foot .btn-ghost').click(); // 关闭
+await sleep(5);
+
+// ---------- 9) 设置弹窗：导出存档 ----------
+document.querySelector('.bottom-tools .icon-btn[title="设置 / 存档"]').click();
+await sleep(10);
+ok(/设置 \/ 存档/.test(document.querySelector('.sheet__head .t')?.textContent || ''), '打开设置弹窗');
+const exportBtn = [...document.querySelectorAll('.sheet__body button')].find((b) => /导出存档字符串/.test(b.textContent));
+ok(!!exportBtn, '设置含导出按钮');
+exportBtn.click();
+await sleep(5);
+const ioVal = document.querySelector('[data-id="io"]')?.value || '';
+ok(ioVal.length > 20, `导出生成存档字符串（长度 ${ioVal.length}）`);
+document.querySelector('.sheet__foot .btn-primary').click(); // 关闭
+await sleep(5);
+
+// ---------- 10) 持久化：重开实例后可「继续游戏」 ----------
+const savedName = ui.player.name;
+ui.destroy();
+await sleep(10);
+ui = createGame(document.getElementById('game-container'));
+watchToasts();
+await sleep(10);
+ok(/继续游戏/.test(document.querySelector('.launcher__actions .btn-primary')?.textContent || ''), '有存档时启动器主按钮为「继续游戏」');
+document.querySelector('.launcher__actions .btn-primary').click(); // 继续
+await sleep(10);
+ok(ui.player && ui.player.name === savedName, `继续游戏载入正确（${ui.player?.name}）`);
+ok(document.querySelector('.status-bar') !== null, '继续后渲染游戏界面');
+
+// ---------- 11) 寿终正寝 → 人生总结结算 ----------
+// 把年龄拨到大限前夕，再推进一步即达大限，触发 endGame
+ui.player.weeks = 64 * 52;        // 64 岁，成年末（一步 52 周即 65 岁）
+ui.player.maxAge = 65;
+ui.rng = () => 0;
+document.querySelector('.turn-btn').click();
+await sleep(15);
+// 若弹了事件先关掉再继续——大限判定在事件之前，理论上直接结算
+ok(document.querySelector('.launcher.over') !== null, '达大限时进入人生总结结算');
+ok(document.querySelector('.over-grade') !== null, '结算页展示综合评级');
+ok(document.querySelectorAll('.over-tags .tag').length >= 4, `结算页含评价标签（${document.querySelectorAll('.over-tags .tag').length} 个）`);
+ok(/岁/.test(document.querySelector('.over-grade')?.textContent || ''), '结算页显示年龄与死因');
+
+// ---------- 12) 再活一次 → 回到创角 ----------
+const restartBtn = [...document.querySelectorAll('.over-actions button')].find((b) => /再活一次/.test(b.textContent));
+ok(!!restartBtn, '结算页有「再活一次」按钮');
+restartBtn.click();
+await sleep(10);
+ok(document.querySelector('.launcher.create') !== null, '再活一次回到创角页');
+
+// ---------- 13) 结算页可查看人生大事记 ----------
+// （重新走一遍到死亡，验证大事记区渲染）—— 用「达大限」触发死亡，避免被成长漂移回血
+document.querySelector('[data-id="name"]')?.dispatchEvent(new window.Event('input'));
+document.querySelector('.create__foot .btn-primary').click();
+await sleep(10);
+ui.player.weeks = 30 * 52;        // 30 岁
+ui.player.maxAge = 30;            // 推进一步（+52 周→31 岁）即达大限
+ui.rng = () => 0;
+ui.nextTurn();                    // 触发 isDead → endGame
+await sleep(15);
+ok(document.querySelector('.over-history') !== null, '结算页含人生大事记区');
+ok(document.querySelectorAll('.over-history .ln').length >= 1, '大事记区至少 1 条记录');
+
+ui.destroy();
+console.log(`\n结果: ${pass} 通过, ${fail} 失败`);
+process.exit(fail ? 1 : 0);
diff --git a/apps/mo-ni-ren-sheng/src/config.js b/apps/mo-ni-ren-sheng/src/config.js
new file mode 100644
index 0000000..7cc5476
--- /dev/null
+++ b/apps/mo-ni-ren-sheng/src/config.js
@@ -0,0 +1,76 @@
+// ============================================================================
+// 模拟人生 · 配置层（纯常量与纯函数，无副作用，便于单测）
+// 定义生命周期阶段、五大属性、年龄换算与各类阈值。
+// ============================================================================
+export const WEEKS_PER_YEAR = 52;
+
+// 属性取值范围 0-100；健康归零即生命终结。
+export const ATTR_MIN = 0;
+export const ATTR_MAX = 100;
+
+// 出生时随机的大限（最大寿命，年）。低于此年龄且健康>0 仍可继续。
+export const MAX_AGE_MIN = 70;
+export const MAX_AGE_MAX = 100;
+
+// 五大核心基础属性：健康 / 智力 / 财富 / 心情 / 社交。
+// 顺序即状态栏与档案中的展示顺序。color 用于进度条，与 style.css 中的 CSS 变量呼应。
+export const ATTRS = ['health', 'intelligence', 'wealth', 'mood', 'social'];
+
+export const ATTR_META = {
+  health: { key: 'health', name: '健康', emoji: '❤️', color: '#e06b6b', desc: '身体状态，归零即生命终结。' },
+  intelligence: { key: 'intelligence', name: '智力', emoji: '🧠', color: '#4a90d9', desc: '学识与才智，影响学业与事业机缘。' },
+  wealth: { key: 'wealth', name: '财富', emoji: '💰', color: '#d4a84b', desc: '家产与积蓄，影响生活品质。' },
+  mood: { key: 'mood', name: '心情', emoji: '😊', color: '#b07cf0', desc: '幸福与满足感，过低会拖累健康。' },
+  social: { key: 'social', name: '社交', emoji: '🤝', color: '#5fd0a0', desc: '人际与声望，影响事件走向。' },
+};
+
+// 生命周期四阶段：婴儿期 / 学龄期 / 成年期 / 老年期。
+// weeksPerTurn 决定「下一回合」推进的周数——年龄越小步长越短（成长细节更细腻），
+// 成年期以年为单位快速推进，使完整一生约 130~160 个回合，节奏舒适。
+export const STAGES = [
+  { key: 'infant', name: '婴儿期', emoji: '👶', minAge: 0, maxAge: 6, weeksPerTurn: 13, desc: '嗷嗷待哺，世界充满新奇。' },
+  { key: 'child', name: '学龄期', emoji: '🧒', minAge: 6, maxAge: 18, weeksPerTurn: 26, desc: '入学读书，性格与天赋初现。' },
+  { key: 'adult', name: '成年期', emoji: '🧑', minAge: 18, maxAge: 65, weeksPerTurn: 52, desc: '工作成家，人生的主战场。' },
+  { key: 'elder', name: '老年期', emoji: '🧓', minAge: 65, maxAge: Infinity, weeksPerTurn: 26, desc: '颐养天年，回首这一生的得失。' },
+];
+
+export const STAGE_BY_KEY = Object.fromEntries(STAGES.map((s) => [s.key, s]));
+
+// 每回合触发随机事件的概率（依阶段微调，使各阶段都有抉择）。
+export const EVENT_CHANCE = {
+  infant: 0.45,
+  child: 0.6,
+  adult: 0.7,
+  elder: 0.55,
+};
+
+// 钳制到合法属性区间。
+export function clampAttr(v) {
+  if (!Number.isFinite(v)) return 0;
+  return Math.max(ATTR_MIN, Math.min(ATTR_MAX, Math.round(v)));
+}
+
+// 周数 → 周岁（浮点）。
+export function ageYearsFromWeeks(weeks) {
+  return (weeks || 0) / WEEKS_PER_YEAR;
+}
+
+// 由年龄（周岁）定位所处生命阶段。
+export function stageForAge(ageYears) {
+  for (let i = 0; i < STAGES.length; i++) {
+    const s = STAGES[i];
+    const isLast = i === STAGES.length - 1;
+    if (isLast ? ageYears >= s.minAge : ageYears < s.maxAge) return s;
+  }
+  return STAGES[STAGES.length - 1];
+}
+
+// 展示用年龄文本：<1 岁显「X 个月」，否则显「X 岁」。
+export function ageLabel(weeks) {
+  const years = ageYearsFromWeeks(weeks);
+  if (years < 1) {
+    const months = Math.max(0, Math.round(years * 12));
+    return `${months} 个月`;
+  }
+  return `${Math.floor(years)} 岁`;
+}
diff --git a/apps/mo-ni-ren-sheng/src/core/events.js b/apps/mo-ni-ren-sheng/src/core/events.js
new file mode 100644
index 0000000..7d35099
--- /dev/null
+++ b/apps/mo-ni-ren-sheng/src/core/events.js
@@ -0,0 +1,281 @@
+// ============================================================================
+// 事件随机库（Event Library）：随机事件池、加权抽取、抉择结算。
+// 每个事件含若干「选项」，选项的 apply(p, rng) 返回结算结果：
+//   { outcome: string, changes: {health:+5,...}, logs?:[{text,type}], career?, flags? }
+// 事件按生命阶段挂载，部分还有额外 cond（如已就业才能升职）。
+// ============================================================================
+import { stageForAge, ageYearsFromWeeks } from '../config.js';
+import { weightedPick, randInt } from './rng.js';
+import { applyChanges } from './player.js';
+
+// stage 取当前阶段 key。
+function stageKey(p) {
+  return stageForAge(ageYearsFromWeeks(p.weeks)).key;
+}
+
+// —— 事件池 ——
+// cond/pick 阶段越靠后越可能涉及事业与人际；权重决定相对出现频率。
+export const EVENTS = [
+  // ===================== 婴儿期 =====================
+  {
+    id: 'first_step', emoji: '🚼', stage: ['infant'], weight: 6,
+    title: '蹒跚学步', text: '你摇摇晃晃地迈出人生第一步，扑进了大人怀里。',
+    options: [
+      { label: '勇敢多走几步', emoji: '💪', apply: () => ({ outcome: '跌跌撞撞却越走越稳，体格也更结实了。', changes: { health: 4, mood: 3 } }) },
+      { label: '累了就爬着玩', emoji: '😴', apply: () => ({ outcome: '爬来爬去也乐在其中，心情不错。', changes: { mood: 4 } }) },
+    ],
+  },
+  {
+    id: 'infant_sick', emoji: '🤒', stage: ['infant'], weight: 5,
+    title: '突发高烧', text: '半夜里你烧得滚烫，全家急成一团。',
+    options: [
+      { label: '连夜送医', emoji: '🏥', apply: (p, r) => {
+        if (r() < 0.7) return { outcome: '及时就医，有惊无险地退了烧。', changes: { health: -2, wealth: -3, mood: -2 } };
+        return { outcome: '在医院折腾一宿，好在烧退了，只是元气大伤。', changes: { health: -6, wealth: -5 } };
+      } },
+      { label: '在家物理降温', emoji: '🧊', apply: (p, r) => {
+        if (r() < 0.5) return { outcome: '退烧贴加温水擦身，竟然熬了过来。', changes: { health: -4 } };
+        return { outcome: '烧退得慢，身体吃了点亏。', changes: { health: -8, mood: -3 } };
+      } },
+    ],
+  },
+  {
+    id: 'zhuazhou', emoji: '🎁', stage: ['infant'], weight: 4,
+    title: '周岁抓周', text: '满周岁这天，面前摆满了书、算盘、印章……你伸手去抓。',
+    options: [
+      { label: '抓起一本书', emoji: '📕', apply: () => ({ outcome: '长辈笑称此子必成读书种子。', changes: { intelligence: 7, mood: 3 } }) },
+      { label: '抓起算盘', emoji: '🧮', apply: () => ({ outcome: '众人都说你将来会算账管钱。', changes: { wealth: 7, intelligence: 2 } }) },
+      { label: '抓起拨浪鼓', emoji: '🪈', apply: () => ({ outcome: '你咯咯笑着挥舞，逗得满堂喝彩。', changes: { mood: 8, social: 4 } }) },
+    ],
+  },
+
+  // ===================== 学龄期 =====================
+  {
+    id: 'exam', emoji: '📝', stage: ['child'], weight: 7,
+    title: '期中考试', text: '一场重要的考试近在眼前，同学都在临时抱佛脚。',
+    options: [
+      { label: '挑灯夜战冲刺', emoji: '🕯️', apply: () => ({ outcome: '成绩出来名列前茅，只是熬出了黑眼圈。', changes: { intelligence: 8, health: -4, mood: 2 } }) },
+      { label: '保持节奏正常发挥', emoji: '😌', apply: () => ({ outcome: '不温不火，成绩中等偏上。', changes: { intelligence: 3, mood: 2 } }) },
+      { label: '破罐破摔交白卷', emoji: '🫠', apply: () => ({ outcome: '被请了家长，心里很不是滋味。', changes: { intelligence: -2, mood: -5, social: -2 } }) },
+    ],
+  },
+  {
+    id: 'bully', emoji: '👊', stage: ['child'], weight: 5,
+    title: '校园风波', text: '几个高年级学生堵住你讨要零花钱。',
+    options: [
+      { label: '硬气回击', emoji: '🥋', apply: (p, r) => {
+        if (r() < 0.5) return { outcome: '你据理力争，对方竟被震住退去了，赢得同学佩服。', changes: { social: 6, health: -2, mood: 4 } };
+        return { outcome: '寡不敌众挨了几下，但没交出零花钱。', changes: { health: -6, mood: -3, social: 2 } };
+      } },
+      { label: '破财消灾', emoji: '💸', apply: () => ({ outcome: '交出零花钱息事宁人，却闷闷不乐。', changes: { wealth: -6, mood: -4 } }) },
+      { label: '告诉老师', emoji: '👩‍🏫', apply: () => ({ outcome: '老师出面处理，风波平息，你也学会求助。', changes: { mood: 3, social: 3 } }) },
+    ],
+  },
+  {
+    id: 'best_friend', emoji: '🧑‍🤝‍🧑', stage: ['child'], weight: 6,
+    title: '结交挚友', text: '课间有个同学主动和你分享零食，聊得投机。',
+    options: [
+      { label: '回赠并以心相交', emoji: '🍬', apply: () => ({ outcome: '你们成了形影不离的好友。', changes: { social: 8, mood: 5, wealth: -2 } }) },
+      { label: '客气收下保持距离', emoji: '🙂', apply: () => ({ outcome: '关系不咸不淡，算是认识。', changes: { social: 3 } }) },
+    ],
+  },
+  {
+    id: 'hobby', emoji: '🎸', stage: ['child'], weight: 5,
+    title: '兴趣之门', text: '学校开了各种兴趣班，你想报名哪一个？',
+    options: [
+      { label: '奥数 / 编程', emoji: '🧮', apply: () => ({ outcome: '逻辑思维突飞猛进。', changes: { intelligence: 7, mood: -2 } }) },
+      { label: '美术 / 音乐', emoji: '🎨', apply: () => ({ outcome: '审美与心境都得到滋养。', changes: { mood: 6, intelligence: 3 } }) },
+      { label: '体育 / 球队', emoji: '⚽', apply: () => ({ outcome: '体能上来了，还结识了一帮队友。', changes: { health: 7, social: 4 } }) },
+    ],
+  },
+  {
+    id: 'transfer', emoji: '🏫', stage: ['child'], weight: 3,
+    title: '转学风波', text: '因父母工作调动，你不得不转去陌生的学校。',
+    options: [
+      { label: '主动融入新集体', emoji: '🤗', apply: () => ({ outcome: '很快交到新朋友，适应良好。', changes: { social: 5, mood: 3 } }) },
+      { label: '默默想念旧友', emoji: '🥺', apply: () => ({ outcome: '一时难以适应，成绩和心情都受影响。', changes: { mood: -4, social: -3, intelligence: -2 } }) },
+    ],
+  },
+
+  // ===================== 成年期 =====================
+  {
+    id: 'job_interview', emoji: '💼', stage: ['adult'], weight: 8,
+    cond: (p) => !p.career,
+    title: '求职面试', text: '毕业在即，你坐在一间公司的面试室外，攥紧了简历。',
+    options: [
+      { label: '应聘大厂卷起来', emoji: '🏢', apply: (p, r) => {
+        if (r() < 0.55) return { outcome: '过五关斩六将，拿到大厂 offer，从此走上快车道。', changes: { wealth: 14, intelligence: 4, health: -4, mood: 5 }, career: '大厂白领' };
+        return { outcome: '竞争太激烈遗憾落选，只能再找机会。', changes: { mood: -6, intelligence: 2 } };
+      } },
+      { label: '考个稳定的编制', emoji: '🏛️', apply: (p, r) => {
+        if (r() < 0.65) return { outcome: '上岸成功，端起了铁饭碗，安稳度日。', changes: { wealth: 8, mood: 6, social: 4 }, career: '公职人员' };
+        return { outcome: '差一点点惜败，但复习的功底没白费。', changes: { intelligence: 4, mood: -3 } };
+      } },
+      { label: '先去小店打工糊口', emoji: '🛠️', apply: () => ({ outcome: '先谋生再谋发展，靠双手吃饭不丢人。', changes: { wealth: 5, health: -3 }, career: '打工人' }) },
+    ],
+  },
+  {
+    id: 'promotion', emoji: '📈', stage: ['adult'], weight: 6,
+    cond: (p) => !!p.career,
+    title: '升职机会', text: '领导暗示有个升职名额，只是要承担更多责任与加班。',
+    options: [
+      { label: '主动争取、加班加点', emoji: '🌙', apply: () => ({ outcome: '升职加薪到手，可健康和心情都亮了红灯。', changes: { wealth: 12, health: -6, mood: -4, social: -2 } }) },
+      { label: '佛系应对、按时下班', emoji: '🧘', apply: () => ({ outcome: '升职轮不到你，但身心舒泰，家人欣慰。', changes: { mood: 5, health: 3, social: 3 } }) },
+    ],
+  },
+  {
+    id: 'startup', emoji: '🚀', stage: ['adult'], weight: 4,
+    title: '创业风口', text: '朋友拉你一起创业，说是千载难逢的风口。',
+    options: [
+      { label: '梭哈全部积蓄入伙', emoji: '🎲', apply: (p, r) => {
+        if (r() < 0.35) return { outcome: '风口真来了，公司估值暴涨，你一夜财务自由！', changes: { wealth: 30, mood: 12, social: 6 }, career: '创业老板' };
+        return { outcome: '风口转眼变虎口，积蓄血本无归。', changes: { wealth: -25, mood: -12, health: -5 } };
+      } },
+      { label: '小额投资试水', emoji: '🪙', apply: (p, r) => {
+        if (r() < 0.5) return { outcome: '小赚一笔，权当零花钱。', changes: { wealth: 8, mood: 3 } };
+        return { outcome: '试水失败，亏了点小钱，长了个教训。', changes: { wealth: -6, intelligence: 2 } };
+      } },
+      { label: '婉拒，安稳为上', emoji: '🙅', apply: () => ({ outcome: '你守住了本分，但也错过了一场狂欢。', changes: { mood: 2, intelligence: 2 } }) },
+    ],
+  },
+  {
+    id: 'marriage', emoji: '💍', stage: ['adult'], weight: 6,
+    cond: (p) => !p.flags?.married,
+    title: '缘分降临', text: '相亲对象竟和你聊得格外投机，对方暗示想进一步。',
+    options: [
+      { label: '勇敢步入婚姻', emoji: '👰', apply: () => ({ outcome: '办了场热闹的婚礼，从此有了一个温暖的家。', changes: { mood: 14, social: 8, wealth: -10 }, flags: { married: true } }) },
+      { label: '再处处看，不着急', emoji: '🐢', apply: () => ({ outcome: '保持恋爱关系，享受二人世界。', changes: { mood: 6, social: 4 } }) },
+      { label: '婉拒，专注事业', emoji: '🎯', apply: () => ({ outcome: '你把心思放回工作，却也偶尔感到孤独。', changes: { wealth: 5, mood: -3, social: -3 } }) },
+    ],
+  },
+  {
+    id: 'overtime', emoji: '🏭', stage: ['adult'], weight: 7,
+    cond: (p) => !!p.career,
+    title: '连轴加班', text: '项目deadline逼近，已经连着加班一周。',
+    options: [
+      { label: '咬牙再撑几天', emoji: '🥵', apply: () => ({ outcome: '奖金到手，可身体和心情都透支了。', changes: { wealth: 10, health: -8, mood: -6 } }) },
+      { label: '及时喊停休整', emoji: '🛌', apply: () => ({ outcome: '项目延期挨了批，但身体要紧。', changes: { health: 5, mood: 4, wealth: -3 } }) },
+    ],
+  },
+  {
+    id: 'loan_friend', emoji: '🤲', stage: ['adult'], weight: 5,
+    title: '朋友借钱', text: '老友登门，说遇到难处想借笔钱周转。',
+    options: [
+      { label: '慷慨解囊', emoji: '💛', apply: (p, r) => {
+        if (r() < 0.55) return { outcome: '朋友渡过难关，事后连本带利还了，情谊更深。', changes: { social: 8, mood: 4 } };
+        return { outcome: '钱借出去便如泥牛入海，朋友也疏远了。', changes: { wealth: -10, social: -4, mood: -5 } };
+      } },
+      { label: '婉言拒绝', emoji: '🙅', apply: () => ({ outcome: '保住了钱包，但朋友心里有了芥蒂。', changes: { social: -4, mood: -2 } }) },
+    ],
+  },
+  {
+    id: 'travel', emoji: '✈️', stage: ['adult'], weight: 5,
+    title: '说走就走', text: '年假还没用完，你想策划一场旅行。',
+    options: [
+      { label: '远行看世界', emoji: '🌍', apply: () => ({ outcome: '见了天地与众生，心境豁然开朗。', changes: { mood: 12, social: 5, wealth: -10, intelligence: 3 } }) },
+      { label: '周边放松一下', emoji: '🏕️', apply: () => ({ outcome: '短途小憩，疲惫散去大半。', changes: { mood: 6, health: 3, wealth: -4 } }) },
+      { label: '宅家省钱', emoji: '🏠', apply: () => ({ outcome: '省下了旅费，却觉得日子有点寡淡。', changes: { wealth: 3, mood: -2 } }) },
+    ],
+  },
+  {
+    id: 'health_scare', emoji: '🩺', stage: ['adult'], weight: 4,
+    title: '体检警报', text: '体检报告上几个指标亮了红灯，医生建议你改变生活方式。',
+    options: [
+      { label: '严格自律、健身养生', emoji: '🏃', apply: () => ({ outcome: '半年后复查指标全绿，人也精神了。', changes: { health: 12, mood: 4, wealth: -3 } }) },
+      { label: '该吃吃该喝喝', emoji: '🍖', apply: () => ({ outcome: '一时痛快，隐患却埋下了。', changes: { mood: 3, health: -6 } }) },
+    ],
+  },
+
+  // ===================== 老年期 =====================
+  {
+    id: 'grandkids', emoji: '🧸', stage: ['elder'], weight: 6,
+    title: '含饴弄孙', text: '孙辈来家里过周末，叽叽喳喳围着你转。',
+    options: [
+      { label: '陪他们尽情玩耍', emoji: '🤸', apply: () => ({ outcome: '天伦之乐让你返老还童，只是有点累。', changes: { mood: 12, social: 6, health: -3 } }) },
+      { label: '讲讲过去的故事', emoji: '📖', apply: () => ({ outcome: '孩子们听得入神，你也被回忆温暖。', changes: { mood: 8, social: 5, intelligence: 2 } }) },
+    ],
+  },
+  {
+    id: 'reunion', emoji: '🍶', stage: ['elder'], weight: 5,
+    title: '老友重逢', text: '几十年没见的老同学张罗了一场聚会。',
+    options: [
+      { label: '盛装赴约', emoji: '🕺', apply: () => ({ outcome: '把酒言欢忆当年，仿佛又回到少年时。', changes: { mood: 10, social: 8, health: -2, wealth: -3 } }) },
+      { label: '担心身体婉拒', emoji: '🪑', apply: () => ({ outcome: '错过了重逢，夜里多少有些怅然。', changes: { mood: -4, social: -3 } }) },
+    ],
+  },
+  {
+    id: 'regimen', emoji: '🧘', stage: ['elder'], weight: 6,
+    title: '养生之道', text: '公园里流行起各种养生方法，你也想试试。',
+    options: [
+      { label: '科学饮食、规律作息', emoji: '🥗', apply: () => ({ outcome: '气色肉眼可见地好了起来。', changes: { health: 9, mood: 3 } }) },
+      { label: '听信偏方乱补一通', emoji: '⚗️', apply: (p, r) => {
+        if (r() < 0.4) return { outcome: '误打误撞竟有些效果。', changes: { health: 3 } };
+        return { outcome: '乱补伤身，反倒住了几天院。', changes: { health: -8, wealth: -6 } };
+      } },
+    ],
+  },
+  {
+    id: 'legacy', emoji: '📜', stage: ['elder'], weight: 4,
+    title: '分配遗产', text: '你想趁头脑清醒，把毕生积蓄做个安排。',
+    options: [
+      { label: '捐给公益机构', emoji: '🕊️', apply: () => ({ outcome: '善举传为佳话，内心无比安宁。', changes: { mood: 12, social: 8, wealth: -15 } }) },
+      { label: '留给子女', emoji: '🏡', apply: () => ({ outcome: '子女感激涕零，家庭和睦。', changes: { mood: 6, social: 6 } }) },
+      { label: '花在自己身上享福', emoji: '🛳️', apply: () => ({ outcome: '晚年奢靡快活，钱也花得值。', changes: { mood: 10, wealth: -12 } }) },
+    ],
+  },
+  {
+    id: 'fall', emoji: '🩼', stage: ['elder'], weight: 4,
+    title: '意外跌倒', text: '雨天路滑，你在小区门口重重摔了一跤。',
+    options: [
+      { label: '坚持做康复训练', emoji: '💪', apply: (p, r) => {
+        if (r() < 0.6) return { outcome: '咬牙复健，勉强恢复了大半行动力。', changes: { health: -3, mood: 3 } };
+        return { outcome: '年纪大了恢复慢，元气大伤。', changes: { health: -10, mood: -4 } };
+      } },
+      { label: '静养听天由命', emoji: '🛏️', apply: () => ({ outcome: '卧床休养，身体一天不如一天。', changes: { health: -8, mood: -5, social: -3 } }) },
+    ],
+  },
+];
+
+// 事件挂载索引：stage -> [event]，供抽取时快速过滤。
+const EVENTS_BY_STAGE = {};
+for (const ev of EVENTS) {
+  for (const st of (ev.stage || ['infant', 'child', 'adult', 'elder'])) {
+    (EVENTS_BY_STAGE[st] ||= []).push(ev);
+  }
+}
+
+// 加权抽取一个当前可触发的事件。返回事件对象或 null。
+export function rollEvent(p, rng) {
+  const r = rng || Math.random;
+  const st = stageKey(p);
+  const pool = (EVENTS_BY_STAGE[st] || []).filter((ev) => !ev.cond || ev.cond(p));
+  if (!pool.length) return null;
+  const weights = {};
+  for (const ev of pool) weights[ev.id] = ev.weight;
+  const id = weightedPick(r, weights);
+  return pool.find((ev) => ev.id === id) || pool[0];
+}
+
+// 结算一个选项：应用属性变化、设置职业/标志，返回带 outcome 文本的完整结果。
+// 注意：option.apply 只返回 changes，真正的属性写入集中在此（applyChanges 已钳制）。
+export function applyOption(p, option, rng) {
+  const r = rng || Math.random;
+  const res = option.apply(p, r) || {};
+  if (res.career) p.career = res.career;
+  if (res.flags) p.flags = { ...(p.flags || {}), ...res.flags };
+  const applied = res.changes ? applyChanges(p, res.changes) : {};
+  return { ...res, applied };
+}
+
+// 生成一条不带抉择的「日常旁白」，用于没有触发事件的回合，增加沉浸感。
+const AMBIENT = {
+  infant: ['你咿呀学语，又学会了几个新词。', '你在摇篮里甜甜地睡了一觉。', '你被抱到户外晒太阳，好奇地四处张望。'],
+  child: ['平凡的一天，照常上学、放学。', '课间和同学在操场上疯跑了一阵。', '今天的作业有点多，你咬牙写完了。'],
+  adult: ['按部就班的一天，忙忙碌碌。', '通勤路上你看着窗外的车水马龙出神。', '今天的工作平淡无奇地结束了。'],
+  elder: ['晨起在公园里打了一套太极。', '午后阳光正好，你在摇椅上打了个盹。', '翻看旧相册，往事历历在目。'],
+};
+export function ambientLine(p, rng) {
+  const r = rng || Math.random;
+  const arr = AMBIENT[stageKey(p)] || AMBIENT.adult;
+  return arr[Math.floor(r() * arr.length)];
+}
diff --git a/apps/mo-ni-ren-sheng/src/core/player.js b/apps/mo-ni-ren-sheng/src/core/player.js
new file mode 100644
index 0000000..a26098f
--- /dev/null
+++ b/apps/mo-ni-ren-sheng/src/core/player.js
@@ -0,0 +1,248 @@
+// ============================================================================
+// 状态管理模块（State Manager）：角色状态、属性、时间推进、结局评价。
+// 所有数值结算集中于此，UI 只负责调用与渲染，不内含业务逻辑。
+// ============================================================================
+import {
+  ATTRS, ATTR_META, STAGES, WEEKS_PER_YEAR,
+  MAX_AGE_MIN, MAX_AGE_MAX, ATTR_MIN, ATTR_MAX,
+  clampAttr, ageYearsFromWeeks, stageForAge,
+} from '../config.js';
+import { randInt } from './rng.js';
+
+// 创建一名新角色。
+//   opts: { name, gender, weeks?, attrs?, maxAge? }
+// 婴儿期起步（weeks=0），属性据性别/出身有轻微随机倾向，皆在 30~60 区间。
+export function newPlayer(rng, opts = {}) {
+  const r = rng || Math.random;
+  const base = (lo, hi) => randInt(r, lo, hi);
+  const gender = opts.gender === 'female' ? 'female' : 'male';
+  const maxAge = Number.isFinite(opts.maxAge) ? opts.maxAge : randInt(r, MAX_AGE_MIN, MAX_AGE_MAX);
+  // 出身倾向：男女略有差异，仅为初始趣味，幅度很小。
+  const drift = gender === 'female' ? { social: +6, mood: +4 } : { health: +6, wealth: +4 };
+  const attrs = {};
+  for (const k of ATTRS) {
+    attrs[k] = base(38, 58) + (drift[k] || 0);
+  }
+  // 允许外部覆盖（创角时若引入「出身选择」可用）。
+  if (opts.attrs) for (const k of ATTRS) if (Number.isFinite(opts.attrs[k])) attrs[k] = opts.attrs[k];
+
+  return {
+    name: (opts.name || '').toString().slice(0, 8) || '无名氏',
+    gender,
+    weeks: Math.max(0, Number.isFinite(opts.weeks) ? opts.weeks : 0),
+    turn: 0,
+    maxAge,
+    attrs: normalizeAttrs(attrs),
+    career: null,        // 成年后的职业，影响事件
+    log: [],             // 人生大事记（精简，仅里程碑 / 结算）
+    flags: {},           // 杂项标志位（如是否成家）
+    born: 0,             // 创建时间戳（存档展示用）
+    lastSeen: 0,
+  };
+}
+
+export function normalizeAttrs(attrs) {
+  const out = {};
+  for (const k of ATTRS) out[k] = clampAttr(attrs?.[k] ?? 50);
+  return out;
+}
+
+export function ageYears(p) { return ageYearsFromWeeks(p.weeks); }
+export function stageOf(p) { return stageForAge(ageYears(p)); }
+
+// 应用一组属性增减（{health:+5, wealth:-10}），返回「实际变化量」（已钳制）。
+// 顺便把变化的属性键收集返回，供 UI 闪烁动画使用。
+export function applyChanges(p, changes = {}) {
+  const applied = {};
+  for (const k of ATTRS) {
+    const delta = Number(changes[k]) || 0;
+    if (!delta) continue;
+    const before = p.attrs[k];
+    const after = clampAttr(before + delta);
+    const real = after - before;
+    if (real !== 0) {
+      p.attrs[k] = after;
+      applied[k] = real;
+    }
+  }
+  return applied;
+}
+
+// 是否已到生命终点：健康归零，或年龄达大限。
+export function isDead(p) {
+  return p.attrs.health <= ATTR_MIN || ageYears(p) >= p.maxAge;
+}
+
+// 「下一回合」核心结算：推进时间、施加被动漂移、检测阶段跨越，返回回合摘要。
+//   返回 { stageChanged, fromStage, toStage, drift（漂移实际变化）, milestone }
+// 注意：本函数只推进时间与被动漂移，不结算随机事件（事件由 events 模块单独抽取并结算）。
+export function stepTime(p, rng) {
+  const r = rng || Math.random;
+  const before = stageOf(p);
+  const beforeAge = ageYears(p);
+
+  // 推进周数（按当前阶段步长）。若跨越阶段，以跨越前阶段的步长推进，下一回合再用新步长。
+  p.weeks += before.weeksPerTurn;
+  p.turn += 1;
+
+  const after = stageOf(p);
+  const stageChanged = after.key !== before.key;
+
+  // 被动漂移：让世界在抉择之外也「活着」，体现属性间的动态关联与制约。
+  const drift = passiveDrift(p, r, before, after);
+
+  // 阶段跨越：写入里程碑式人生大事记。
+  if (stageChanged) {
+    p.log.push({ turn: p.turn, text: milestoneText(before, after), type: 'milestone' });
+  }
+
+  return {
+    stageChanged,
+    fromStage: before,
+    toStage: after,
+    drift,
+    beforeAge,
+  };
+}
+
+// 被动漂移：各属性随时间自然变化，彼此联动（例：心情过低拖累健康；老年健康下滑）。
+// 返回实际发生的变化（已钳制），供 UI 闪烁。
+function passiveDrift(p, r, fromStage, toStage) {
+  const changes = {};
+  const a = p.attrs;
+  const stage = toStage.key;
+  const age = ageYears(p);
+
+  // 心情向中性基线缓慢回归（喜怒哀乐终归平淡）。
+  const moodBase = 55;
+  if (a.mood !== moodBase) changes.mood = Math.sign(moodBase - a.mood) * Math.min(3, Math.abs(moodBase - a.mood));
+
+  // 社交向中性基线缓慢回归。
+  const socialBase = 50;
+  if (a.social !== socialBase) changes.social = Math.sign(socialBase - a.social) * Math.min(2, Math.abs(socialBase - a.social));
+
+  if (stage === 'infant') {
+    // 婴幼儿健康成长、心情上扬。
+    changes.health = 1;
+    changes.mood = (changes.mood || 0) + 1;
+  } else if (stage === 'child') {
+    // 求学阶段智力稳步提升。
+    changes.intelligence = 1;
+  } else if (stage === 'adult') {
+    // 成年：少量被动收入；心情或健康过低会反噬（过度劳累的隐喻）。
+    changes.wealth = 1;
+    if (a.mood < 25) changes.health = -1;   // 郁郁寡欢伤身
+    if (a.health < 25) changes.mood = (changes.mood || 0) - 1;
+  } else if (stage === 'elder') {
+    // 老年：健康不可逆地缓慢衰退，财富缓慢消耗。
+    const frail = age > 80 ? 2 : 1;
+    changes.health = -frail;
+    changes.wealth = -1;
+  }
+
+  return applyChanges(p, changes);
+}
+
+function milestoneText(from, to) {
+  // 按进入的新阶段（to.key）描述这一人生节点。
+  const map = {
+    child: '背上书包踏入校园，学龄时光开始了。',
+    adult: '告别校园，步入社会，开启独立人生。',
+    elder: '告别职场，鬓角染霜，步入晚年。',
+  };
+  return map[to.key] || '人生翻开了新的一页。';
+}
+
+// —— 结局评价：据最终属性与里程碑生成评价标签与人生总结 ——
+export function evaluateLife(p) {
+  const a = p.attrs;
+  const age = Math.floor(ageYears(p));
+  const diedOfAge = age >= p.maxAge;
+  const cause = diedOfAge ? `${age} 岁寿终正寝` : `${age} 岁因健康枯竭早逝`;
+
+  // 单项评价标签（取最高契合档）。
+  const tags = [];
+  tags.push(wealthTag(a.wealth));
+  tags.push(intelligenceTag(a.intelligence));
+  tags.push(moodTag(a.mood));
+  tags.push(socialTag(a.social));
+  if (age >= 85) tags.push('⏳ 长命百岁');
+  else if (age < 45) tags.push('🕯️ 英年早逝');
+
+  // 综合评分（年龄 + 五项加权），据此给出总评。
+  const score = Math.round(
+    age * 0.6 +
+    a.health * 0.5 + a.intelligence * 0.7 + a.wealth * 0.7 +
+    a.mood * 0.8 + a.social * 0.6,
+  );
+  const grade = overallGrade(score);
+
+  return {
+    name: p.name,
+    age,
+    cause,
+    tags: dedupe(tags),
+    score,
+    grade,
+    summary: summaryText(p, a, age, diedOfAge),
+    attrs: { ...a },
+  };
+}
+
+function wealthTag(v) {
+  if (v >= 85) return '💰 富甲一方';
+  if (v >= 60) return '🏦 小康之家';
+  if (v >= 30) return '💸 勉强度日';
+  return '🪙 家徒四壁';
+}
+function intelligenceTag(v) {
+  if (v >= 85) return '🎓 学富五车';
+  if (v >= 60) return '📚 颇有见地';
+  if (v >= 30) return '📖 才疏学浅';
+  return '🧩 平庸之辈';
+}
+function moodTag(v) {
+  if (v >= 80) return '🌈 幸福美满';
+  if (v >= 55) return '🙂 平和知足';
+  if (v >= 30) return '😞 时有烦忧';
+  return '🌧️ 郁郁寡欢';
+}
+function socialTag(v) {
+  if (v >= 80) return '🥂 高朋满座';
+  if (v >= 55) return '🤝 三两知己';
+  if (v >= 30) return '👤 乏人问津';
+  return '🪧 孤家寡人';
+}
+
+function overallGrade(score) {
+  if (score >= 230) return { label: '传奇人生', emoji: '🌟', tone: 'epic' };
+  if (score >= 190) return { label: '精彩一生', emoji: '✨', tone: 'good' };
+  if (score >= 150) return { label: '平凡安稳', emoji: '🌼', tone: 'normal' };
+  if (score >= 110) return { label: '跌宕起伏', emoji: '🌊', tone: 'normal' };
+  return { label: '黯然收场', emoji: '🍂', tone: 'bad' };
+}
+
+function summaryText(p, a, age, diedOfAge) {
+  const parts = [];
+  parts.push(`${p.name} 活到了 ${age} 岁。`);
+  if (a.wealth >= 80 && a.mood >= 70) parts.push('一生富足且乐天知命，堪为旁人艳羡。');
+  else if (a.wealth >= 80) parts.push('虽积攒下可观的财富，却也在奔波中错过了许多风景。');
+  else if (a.mood >= 80) parts.push('虽谈不上大富大贵，却始终心怀热忱，活得尽兴。');
+  else if (a.social >= 80) parts.push('广结善缘，朋友遍天下，回首皆是温情。');
+  else if (a.intelligence >= 80) parts.push('以学识与智慧立身，在某一领域留下了自己的印记。');
+  else if (!diedOfAge) parts.push('健康早早亮起红灯，未及尽享天年便匆匆谢幕。');
+  else parts.push('一生波澜不惊，如寻常人家般走完了属于自己的路。');
+  return parts.join('');
+}
+
+function dedupe(arr) {
+  return [...new Set(arr)];
+}
+
+// 属性可读文本（档案 / 结算用）。
+export function attrLine(p, key) {
+  const meta = ATTR_META[key];
+  return `${meta.emoji} ${meta.name} ${p.attrs[key]}`;
+}
+
+export { ATTRS, ATTR_META, STAGES, WEEKS_PER_YEAR, ATTR_MIN, ATTR_MAX };
diff --git a/apps/mo-ni-ren-sheng/src/core/rng.js b/apps/mo-ni-ren-sheng/src/core/rng.js
new file mode 100644
index 0000000..18dd8c3
--- /dev/null
+++ b/apps/mo-ni-ren-sheng/src/core/rng.js
@@ -0,0 +1,36 @@
+// ============================================================================
+// 可注入随机源：默认 Math.random，单测可传入确定性序列，保证逻辑可复现。
+// ============================================================================
+export function makeRng(source) {
+  if (typeof source === 'function') return source;
+  if (Array.isArray(source)) {
+    // 确定性序列：依次取出，耗尽后回绕，便于穷举分支。
+    let i = 0;
+    return () => {
+      if (!source.length) return 0;
+      const v = source[i % source.length];
+      i += 1;
+      return v;
+    };
+  }
+  return Math.random;
+}
+
+// [min, max] 闭区间随机整数。
+export function randInt(rng, min, max) {
+  const r = rng();
+  return Math.floor(min + r * (max - min + 1));
+}
+
+// 按 {key: weight} 权重抽取一个 key。
+export function weightedPick(rng, weights) {
+  const entries = Object.entries(weights).filter(([, w]) => w > 0);
+  const total = entries.reduce((s, [, w]) => s + w, 0);
+  if (total <= 0) return null;
+  let roll = rng() * total;
+  for (const [k, w] of entries) {
+    roll -= w;
+    if (roll <= 0) return k;
+  }
+  return entries[entries.length - 1][0];
+}
diff --git a/apps/mo-ni-ren-sheng/src/core/save.js b/apps/mo-ni-ren-sheng/src/core/save.js
new file mode 100644
index 0000000..dde2989
--- /dev/null
+++ b/apps/mo-ni-ren-sheng/src/core/save.js
@@ -0,0 +1,96 @@
+// ============================================================================
+// 存档管理模块（Save Manager）：localStorage 持久化 + 导入导出（base64）。
+// 单角色单存档，key = mnrs_save。通过 storage 访问器隔离 localStorage，便于 Node 单测注入。
+// 每次「下一回合」与抉择结算后由 UI 自动调用 saveGame 落盘，防意外关浏览器丢档。
+// ============================================================================
+import { ATTRS, ATTR_MIN, ATTR_MAX, MAX_AGE_MIN, MAX_AGE_MAX } from '../config.js';
+import { normalizeAttrs } from './player.js';
+
+const SAVE_KEY = 'mnrs_save';
+
+let storage = null;
+try {
+  if (typeof localStorage !== 'undefined') storage = localStorage;
+} catch (_) { /* 某些环境访问 localStorage 会抛错 */ }
+
+// 测试 / 注入用
+export function _setStorage(s) { storage = s; }
+
+export function nowSec() {
+  // 优先用真实时间戳；脚本环境禁止 argless new Date() 时回退为单调计数。
+  try { return Math.floor(Date.now() / 1000); } catch (_) { return 0; }
+}
+
+export function hasSave() {
+  try { return !!(storage && storage.getItem(SAVE_KEY)); } catch (_) { return false; }
+}
+
+export function saveGame(player) {
+  try {
+    if (!storage || !player) return false;
+    player.lastSeen = nowSec();
+    if (!player.born) player.born = player.lastSeen;
+    storage.setItem(SAVE_KEY, JSON.stringify(player));
+    return true;
+  } catch (_) { return false; }
+}
+
+export function loadGame() {
+  try {
+    const raw = storage ? storage.getItem(SAVE_KEY) : null;
+    if (!raw) return null;
+    const player = JSON.parse(raw);
+    migrate(player);
+    return player;
+  } catch (_) { return null; }
+}
+
+export function clearSave() {
+  try { if (storage) storage.removeItem(SAVE_KEY); return true; } catch (_) { return false; }
+}
+
+// 导出为可分享的 base64 字符串（UTF-8 安全）
+export function exportSave(player) {
+  return btoaSafe(JSON.stringify(player));
+}
+export function importSave(str) {
+  try {
+    const player = JSON.parse(atobSafe(str));
+    migrate(player);
+    return player;
+  } catch (_) { return null; }
+}
+
+// 存档结构向后兼容：补齐 / 钳制字段，防止旧档或损坏档导致整页闪退。
+function migrate(player) {
+  if (!player) return player;
+  if (typeof player.name !== 'string') player.name = '无名氏';
+  player.gender = player.gender === 'female' ? 'female' : 'male';
+  if (!Number.isFinite(player.weeks) || player.weeks < 0) player.weeks = 0;
+  if (!Number.isFinite(player.turn) || player.turn < 0) player.turn = 0;
+  // 大限钳制到合法区间，避免越界
+  if (!Number.isFinite(player.maxAge) || player.maxAge < MAX_AGE_MIN) player.maxAge = MAX_AGE_MIN;
+  if (player.maxAge > MAX_AGE_MAX) player.maxAge = MAX_AGE_MAX;
+  if (!player.attrs || typeof player.attrs !== 'object') player.attrs = {};
+  player.attrs = normalizeAttrs(player.attrs);
+  // 保证五大属性齐全
+  for (const k of ATTRS) if (!Number.isFinite(player.attrs[k])) player.attrs[k] = 50;
+  if (typeof player.career !== 'string' && player.career != null) player.career = null;
+  if (!player.flags || typeof player.flags !== 'object') player.flags = {};
+  if (!Array.isArray(player.log)) player.log = [];
+  if (!Number.isFinite(player.born)) player.born = 0;
+  if (!Number.isFinite(player.lastSeen)) player.lastSeen = 0;
+  return player;
+}
+
+// —— UTF-8 安全的 base64（兼容浏览器与 Node）——
+function btoaSafe(str) {
+  if (typeof btoa === 'function') return btoa(unescape(encodeURIComponent(str)));
+  return Buffer.from(str, 'utf8').toString('base64'); // Node 回退
+}
+function atobSafe(str) {
+  if (typeof atob === 'function') return decodeURIComponent(escape(atob(str)));
+  return Buffer.from(str, 'base64').toString('utf8');
+}
+
+export { SAVE_KEY, ATTRS, ATTR_MIN, ATTR_MAX };
diff --git a/apps/mo-ni-ren-sheng/src/main.js b/apps/mo-ni-ren-sheng/src/main.js
new file mode 100644
index 0000000..f89b1fe
--- /dev/null
+++ b/apps/mo-ni-ren-sheng/src/main.js
@@ -0,0 +1,19 @@
+// ============================================================================
+// 模拟人生 · 入口
+// 导出 createGame(parent) 工厂，供主框架（落地页）按需挂载到任意容器；
+// 同时保留独立运行（apps/mo-ni-ren-sheng/index.html）时的自动挂载行为。
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
+  if (typeof window !== 'undefined') window.__MNRS = ui; // 暴露实例便于调试 / 冒烟测试
+}
diff --git a/apps/mo-ni-ren-sheng/src/ui/app.js b/apps/mo-ni-ren-sheng/src/ui/app.js
new file mode 100644
index 0000000..45f48ca
--- /dev/null
+++ b/apps/mo-ni-ren-sheng/src/ui/app.js
@@ -0,0 +1,584 @@
+// ============================================================================
+// 模拟人生 · UI 渲染模块（UI Renderer，纯原生 DOM）
+// 负责渲染：启动器（新游戏/继续）→ 创角 → 游戏主体（状态栏 + 人生大事记 + 下一回合）
+// 以及随机事件抉择弹窗、人生总结结算弹窗、设置弹窗。驱动回合推进与自动存档。
+// ============================================================================
+import '../ui/style.css';
+import { h, clear, bar } from './dom.js';
+import {
+  ATTRS, ATTR_META, ageLabel, ageYearsFromWeeks, stageForAge, EVENT_CHANCE,
+} from '../config.js';
+import {
+  newPlayer, stageOf, applyChanges, stepTime, isDead, evaluateLife,
+} from '../core/player.js';
+import { rollEvent, applyOption, ambientLine } from '../core/events.js';
+import {
+  saveGame, loadGame, hasSave, clearSave, exportSave, importSave,
+} from '../core/save.js';
+import { makeRng } from '../core/rng.js';
+
+// 创角出身：提供小幅初始属性倾向，增加重玩差异。
+const BACKGROUNDS = [
+  { id: 'scholar', emoji: '📚', name: '书香门第', desc: '世代读书，家学渊源。', adj: { intelligence: 8, mood: 2 } },
+  { id: 'merchant', emoji: '🏪', name: '商贾之家', desc: '家中经商，耳濡目染。', adj: { wealth: 10, social: 3 } },
+  { id: 'martial', emoji: '🥋', name: '武术世家', desc: '尚武之家，体魄强健。', adj: { health: 10, mood: -2 } },
+  { id: 'artisan', emoji: '🎭', name: '梨园世家', desc: '以艺谋生，性情开朗。', adj: { mood: 8, social: 5, wealth: -3 } },
+  { id: 'humble', emoji: '🌾', name: '寒门子弟', desc: '家徒四壁，唯有志气。', adj: { wealth: -6, intelligence: 3, mood: -2 } },
+  { id: 'ordinary', emoji: '🏠', name: '寻常人家', desc: '平平淡淡才是真。', adj: {} },
+];
+
+export class GameUI {
+  constructor(parent) {
+    this.parent = parent;
+    this.player = null;
+    this.rng = Math.random;            // 随机源（测试可注入 this.rng）
+    this.screen = 'launcher';          // 'launcher' | 'create' | 'game' | 'over'
+    this.over = false;
+    this.log = [];                     // 当前显示的人生大事记（与 player.log 分离：UI 侧近期缓冲）
+    this.modalRoot = null;
+    this.createTpl = { gender: 'male', bgId: 'ordinary' };
+    this.charName = '';
+    this.attrNodes = {};               // 各属性 DOM 引用，便于增量刷新 + 闪烁
+    this.turnBtn = null;
+    this.turnArmed = true;             // 下一回合按钮可用态
+  }
+
+  mount() {
+    this.root = h('div', { class: 'mnrs' });
+    clear(this.parent);
+    this.parent.appendChild(this.root);
+    this.toastWrap = h('div', { class: 'toast-wrap' });
+    this.stage = h('div', { class: 'mnrs-stage' });
+    this.modalRoot = h('div', { class: 'mnrs-modals' });
+    this.root.append(this.toastWrap, this.stage, this.modalRoot);
+    this.showLauncher();
+    return this;
+  }
+
+  // ============ 启动器 ============
+  showLauncher() {
+    this.screen = 'launcher';
+    this.over = false;
+    this.player = null;
+    clear(this.modalRoot);
+    clear(this.stage);
+    const saved = hasSave();
+    const wrap = h('div', { class: 'launcher' },
+      h('div', { class: 'launcher__brand' },
+        h('div', { class: 'emblem' }, '生'),
+        h('h1', null, '模拟人生'),
+        h('p', { class: 'sub' }, '一周一周，过完这一生 · 文字版人生模拟'),
+      ),
+      h('div', { class: 'launcher__actions' },
+        saved
+          ? h('button', { class: 'btn-primary big-btn', onClick: () => this.continueGame() }, '▶ 继续游戏')
+          : h('button', { class: 'btn-primary big-btn', onClick: () => this.showCreate() }, '🌱 开始新的人生'),
+        saved
+          ? h('button', { class: 'btn-ghost', onClick: () => this.showCreate() }, '🆕 重新开始（覆盖旧档）')
+          : null,
+        h('button', { class: 'btn-ghost', onClick: () => this.showSettings(true) }, '⚙️ 设置 / 存档'),
+      ),
+      h('p', { class: 'launcher__hint muted' }, '健康归零或寿元耗尽，这一生便落下帷幕。每一次抉择，都在改写你的人生。'),
+    );
+    this.stage.appendChild(wrap);
+  }
+
+  continueGame() {
+    const p = loadGame();
+    if (!p) { this.toast('没有可继续的存档', 'bad'); this.showLauncher(); return; }
+    this.enterGame(p);
+  }
+
+  // ============ 创角 ============
+  showCreate() {
+    this.screen = 'create';
+    clear(this.modalRoot);
+    clear(this.stage);
+    this.renderCreate();
+  }
+
+  renderCreate() {
+    const t = this.createTpl;
+    const bg = BACKGROUNDS.find((b) => b.id === t.bgId) || BACKGROUNDS[0];
+    // 由当前出身派生一份预览角色（不入档），展示初始属性。
+    const preview = newPlayer(this.rng, { gender: t.gender, name: '预览' });
+    applyChanges(preview, bg.adj);
+    clear(this.stage);
+    const wrap = h('div', { class: 'launcher create' });
+    wrap.append(
+      h('div', { class: 'create__head' },
+        h('button', { class: 'btn-ghost', onClick: () => this.showLauncher() }, '← 返回'),
+        h('h1', null, '开启新人生'),
+      ),
+      h('div', { class: 'create__body' },
+        h('div', { class: 'card' },
+          h('h4', null, '性别'),
+          h('div', { class: 'gender-toggle' },
+            h('button', { class: t.gender === 'male' ? 'active' : '', onClick: () => { this.createTpl.gender = 'male'; this.renderCreate(); } }, '♂ 男'),
+            h('button', { class: t.gender === 'female' ? 'active' : '', onClick: () => { this.createTpl.gender = 'female'; this.renderCreate(); } }, '♀ 女'),
+          ),
+        ),
+        h('div', { class: 'card' },
+          h('div', { class: 'row' },
+            h('div', { class: 'grow' },
+              h('h4', null, `${bg.emoji} ${bg.name}`),
+              h('div', { class: 'muted' }, bg.desc),
+            ),
+            h('button', { class: 'btn-ghost reroll-bg', onClick: () => this.rerollBg() }, '🎲 换个出身'),
+          ),
+          h('div', { class: 'attr-grid', style: { marginTop: '0.5rem' } },
+            ATTRS.map((k) => attrPreview(k, preview.attrs[k], bg.adj[k])),
+          ),
+        ),
+        h('div', { class: 'card' },
+          h('h4', null, '姓名'),
+          h('input', { class: 'name-input', dataset: { id: 'name' }, maxlength: 8, placeholder: '请输入姓名（可留空）', value: this.charName || '' }),
+          h('div', { class: 'muted', style: { marginTop: '0.3rem' } }, '取一个名字，降生于世。'),
+        ),
+      ),
+      h('div', { class: 'create__foot' },
+        h('button', { class: 'btn-primary big-btn', onClick: () => this.confirmCreate(bg) }, '🍼 降生'),
+      ),
+    );
+    this.stage.appendChild(wrap);
+    const inp = wrap.querySelector('[data-id="name"]');
+    if (inp) inp.addEventListener('input', () => { this.charName = inp.value; });
+  }
+
+  rerollBg() {
+    const cur = this.createTpl.bgId;
+    let next = cur;
+    while (next === cur) next = BACKGROUNDS[Math.floor(this.rng() * BACKGROUNDS.length)].id;
+    this.createTpl.bgId = next;
+    this.renderCreate();
+  }
+
+  confirmCreate(bg) {
+    const name = (this.charName || '').trim().slice(0, 8);
+    const p = newPlayer(this.rng, { name, gender: this.createTpl.gender });
+    applyChanges(p, bg.adj);
+    this.enterGame(p); // 先就位 player 与 UI，再写入诞生大事记（确保落入 this.log 与 player.log）
+    this.pushLog(`一声啼哭，${p.name} 降生于${bg.name}。`, 'milestone');
+  }
+
+  // ============ 进入游戏 ============
+  enterGame(player) {
+    this.player = player;
+    this.screen = 'game';
+    this.over = false;
+    // 由持久化大事记重建 UI 侧日志缓冲（继续游戏 / 结算历史都依赖于此）。
+    this.log = Array.isArray(player.log)
+      ? player.log.slice(-60).map((l) => ({ text: l.text, type: l.type }))
+      : [];
+    this.buildGame();
+    this.refreshStatus();
+    this.renderLog();
+    this.setTurnEnabled(true);
+    saveGame(this.player);
+    // 若读入的就是已死亡存档（理论上不该出现），直接结算
+    if (isDead(this.player)) this.endGame();
+  }
+
+  buildGame() {
+    clear(this.stage);
+    clear(this.modalRoot);
+    const game = h('div', { class: 'mnrs-game' });
+    this.statusEl = h('div', { class: 'status-bar' });
+    this.logEl = h('div', { class: 'log-strip' }, h('div', { class: 'log-strip__lines' }));
+    this.bottomBar = h('div', { class: 'bottom-bar' });
+    game.append(this.statusEl, this.logEl, this.bottomBar);
+    this.stage.appendChild(game);
+    this.buildStatus();
+    this.buildBottomBar();
+  }
+
+  // —— 状态栏：身份概览 + 五大属性（一次构建，刷新时增量更新 + 闪烁）——
+  buildStatus() {
+    clear(this.statusEl);
+    const p = this.player;
+    this.idLine = h('div', { class: 'id-line' },
+      h('span', { class: 'id-name' }, p.name),
+      h('span', { class: 'id-stage' }, stageEmoji(p) + ' ' + stageOf(p).name),
+      h('span', { class: 'id-age' }, ageLabel(p.weeks)),
+      h('span', { class: 'id-turn' }, `第 ${p.turn} 回合`),
+    );
+    const attrWrap = h('div', { class: 'attr-list' });
+    this.attrNodes = {};
+    for (const k of ATTRS) {
+      const meta = ATTR_META[k];
+      const fill = h('div', { class: 'attr-fill', style: { background: meta.color } });
+      const row = h('div', { class: 'attr-row', dataset: { key: k } },
+        h('span', { class: 'attr-label' }, `${meta.emoji} ${meta.name}`),
+        h('div', { class: 'attr-track' }, fill),
+        h('span', { class: 'attr-val' }, String(p.attrs[k])),
+        h('span', { class: 'attr-delta' }),
+      );
+      this.attrNodes[k] = { row, fill, val: row.querySelector('.attr-val'), delta: row.querySelector('.attr-delta') };
+      attrWrap.appendChild(row);
+    }
+    this.statusEl.append(this.idLine, attrWrap);
+  }
+
+  buildBottomBar() {
+    clear(this.bottomBar);
+    // 「下一回合」：底部固定悬浮主操作按钮，高度≥48px，符合拇指热区。
+    this.turnBtn = h('button', {
+      class: 'turn-btn', onClick: () => this.nextTurn(),
+    }, '⏭️ 下一回合');
+    const tools = h('div', { class: 'bottom-tools' },
+      h('button', { class: 'icon-btn', title: '人物档案', onClick: () => this.showProfile() }, '👤'),
+      h('button', { class: 'icon-btn', title: '设置 / 存档', onClick: () => this.showSettings(false) }, '⚙️'),
+    );
+    this.bottomBar.append(this.turnBtn, tools);
+  }
+
+  setTurnEnabled(on) {
+    this.turnArmed = on;
+    if (this.turnBtn) {
+      this.turnBtn.disabled = !on;
+      this.turnBtn.classList.toggle('busy', !on);
+      this.turnBtn.textContent = on ? '⏭️ 下一回合' : '…';
+    }
+  }
+
+  // —— 增量刷新状态栏，并按 deltas 闪烁变化属性（绿增红减 + 数字跳动）——
+  refreshStatus(deltas = {}) {
+    const p = this.player;
+    this.idLine.querySelector('.id-name').textContent = p.name;
+    this.idLine.querySelector('.id-stage').textContent = stageEmoji(p) + ' ' + stageOf(p).name;
+    this.idLine.querySelector('.id-age').textContent = ageLabel(p.weeks);
+    this.idLine.querySelector('.id-turn').textContent = `第 ${p.turn} 回合`;
+    for (const k of ATTRS) {
+      const n = this.attrNodes[k];
+      const v = p.attrs[k];
+      n.fill.style.width = `${v}%`;
+      n.val.textContent = String(v);
+      const d = deltas[k];
+      if (Number.isFinite(d) && d !== 0) this.flashAttr(k, d);
+    }
+  }
+
+  // 在属性行上播放「跳动 + 闪色」反馈：绿色↑ / 红色↓，并浮一个 +/- 数字。
+  flashAttr(key, delta) {
+    const n = this.attrNodes[key];
+    if (!n) return;
+    const up = delta > 0;
+    n.row.classList.remove('flash-up', 'flash-down');
+    // 强制重排以重启动画
+    void n.row.offsetWidth;
+    n.row.classList.add(up ? 'flash-up' : 'flash-down');
+    n.delta.textContent = (up ? '+' : '') + delta;
+    n.delta.className = `attr-delta ${up ? 'up' : 'down'} show`;
+    clearTimeout(n._t);
+    n._t = setTimeout(() => {
+      n.row.classList.remove('flash-up', 'flash-down');
+      n.delta.classList.remove('show');
+    }, 700);
+  }
+
+  // —— 人生大事记（动态文本展示区）——
+  // 同时写入 UI 缓冲（this.log，供结算页展示）与持久化大事记（player.log，随存档保存）。
+  pushLog(text, type = 'normal') {
+    this.log.push({ text, type });
+    if (this.log.length > 60) this.log.shift();
+    if (this.player) {
+      this.player.log.push({ turn: this.player.turn, text, type });
+      if (this.player.log.length > 200) this.player.log.shift();
+    }
+    if (this.logEl) this.renderLog();
+  }
+  renderLog() {
+    const box = this.logEl.querySelector('.log-strip__lines') || this.logEl;
+    clear(box);
+    const recent = this.log.slice(-12);
+    for (const ln of recent) box.appendChild(h('div', { class: `ln ${ln.type}` }, ln.text));
+    box.scrollTop = box.scrollHeight;
+  }
+
+  // ============ 下一回合（核心循环）============
+  nextTurn() {
+    if (this.over || !this.player || !this.turnArmed) return;
+    this.setTurnEnabled(false);
+
+    // 1) 推进时间 + 被动漂移
+    const snap = snapshotAttrs(this.player);
+    const step = stepTime(this.player, this.rng);
+    const driftDelta = diffAttrs(snap, this.player.attrs);
+    this.refreshStatus(driftDelta);
+    if (step.stageChanged) {
+      this.pushLog(`🎯 ${milestoneHead(step.toStage.key)}：${stageOf(this.player).desc}`, 'milestone');
+    }
+    saveGame(this.player);
+
+    // 2) 漂移致死的兜底（如老年健康耗尽）
+    if (isDead(this.player)) { this.endGame(); return; }
+
+    // 3) 抉择事件：依阶段概率决定本回合是否触发，避免每回合都被打断。
+    const chance = EVENT_CHANCE[stageOf(this.player).key] ?? 0.5;
+    if (this.rng() < chance) {
+      const ev = rollEvent(this.player, this.rng);
+      if (ev) {
+        this.openEvent(ev);
+        return; // 选项结算后会重新启用按钮
+      }
+    }
+    // 无事件：一条日常旁白，按钮恢复
+    this.pushLog(ambientLine(this.player, this.rng), 'normal');
+    this.setTurnEnabled(true);
+  }
+
+  // —— 随机事件抉择弹窗 ——
+  openEvent(ev) {
+    const body = [
+      h('div', { class: 'event-emoji' }, ev.emoji),
+      h('div', { class: 'event-text muted' }, ev.text),
+    ];
+    const foot = [h('div', { class: 'event-options' },
+      ev.options.map((opt) => h('button', {
+        class: 'btn-ghost event-opt',
+        onClick: () => this.resolveEvent(ev, opt),
+      }, `${opt.emoji || ''} ${opt.label}`)),
+    )];
+    this.showSheet({ title: ev.title, body, foot });
+  }
+
+  resolveEvent(ev, option) {
+    this.closeModal();
+    const snap = snapshotAttrs(this.player);
+    const res = applyOption(this.player, option, this.rng) || {};
+    const delta = diffAttrs(snap, this.player.attrs);
+    this.refreshStatus(delta);
+    // 把抉择结果写入大事记：标题 + 结局 + 增减一览，自解释。
+    const tail = ATTRS.map((k) => (delta[k] ? ` ${ATTR_META[k].emoji}${delta[k] > 0 ? '+' : ''}${delta[k]}` : '')).join('');
+    this.pushLog(`${ev.emoji} ${ev.title}：${res.outcome || ''}${tail}`, 'choice');
+    saveGame(this.player);
+    if (isDead(this.player)) { this.endGame(); return; }
+    this.setTurnEnabled(true);
+  }
+
+  // ============ 人生总结（结局）============
+  endGame() {
+    this.over = true;
+    this.setTurnEnabled(false);
+    const result = evaluateLife(this.player);
+    this.pushLog(`🌙 ${result.cause}，${result.name} 的人生落幕。`, 'milestone');
+    saveGame(this.player);
+    clear(this.modalRoot);
+    // 清屏并展示整页结算（覆盖游戏主体）
+    clear(this.stage);
+    this.renderGameOver(result);
+  }
+
+  renderGameOver(result) {
+    this.screen = 'over';
+    const wrap = h('div', { class: 'launcher over' });
+    wrap.append(
+      h('div', { class: `over-grade ${result.grade.tone}` },
+        h('div', { class: 'over-grade__emoji' }, result.grade.emoji),
+        h('h2', null, result.grade.label),
+        h('div', { class: 'muted' }, `${result.name} · ${result.age} 岁 · ${result.cause}`),
+      ),
+      h('div', { class: 'card' },
+        h('div', { class: 'over-summary' }, result.summary),
+        h('div', { class: 'over-tags' }, result.tags.map((t) => h('span', { class: 'tag' }, t))),
+      ),
+      h('div', { class: 'card' },
+        h('h4', null, '人生属性'),
+        h('div', { class: 'attr-grid' },
+          ATTRS.map((k) => h('div', { class: 'attr-mini' },
+            h('span', { class: 'attr-label' }, `${ATTR_META[k].emoji} ${ATTR_META[k].name}`),
+            bar(result.attrs[k], 100, { color: ATTR_META[k].color, label: String(result.attrs[k]) }),
+          )),
+        ),
+      ),
+      h('div', { class: 'over-history' },
+        h('h4', { class: 'muted' }, '人生大事记'),
+        h('div', { class: 'over-history__list' },
+          ...(this.log.length
+            ? this.log.map((ln) => h('div', { class: `ln ${ln.type}` }, ln.text))
+            : [h('div', { class: 'muted' }, '平淡的一生，波澜不惊。')]),
+        ),
+      ),
+      h('div', { class: 'over-actions' },
+        h('button', { class: 'btn-primary big-btn', onClick: () => { this.deleteAndRestart(); } }, '🔄 再活一次'),
+        h('button', { class: 'btn-ghost', onClick: () => this.showSettings(false) }, '⚙️ 导出 / 存档'),
+      ),
+    );
+    this.stage.appendChild(wrap);
+  }
+
+  deleteAndRestart() {
+    clearSave();
+    this.player = null;
+    this.log = [];
+    this.showCreate();
+  }
+
+  // ============ 人物档案 ============
+  showProfile() {
+    const p = this.player;
+    const body = [
+      h('div', { class: 'profile-head' },
+        h('div', { class: 'profile-name' }, p.name),
+        h('div', { class: 'muted' }, `${stageEmoji(p)} ${stageOf(p).name} · ${ageLabel(p.weeks)} · 寿元上限 ${p.maxAge} 岁`),
+      ),
+      h('div', { class: 'attr-grid' },
+        ATTRS.map((k) => h('div', { class: 'attr-mini' },
+          h('span', { class: 'attr-label' }, `${ATTR_META[k].emoji} ${ATTR_META[k].name}`),
+          h('div', { class: 'muted', style: { fontSize: '0.72rem', marginBottom: '0.2rem' } }, ATTR_META[k].desc),
+          bar(p.attrs[k], 100, { color: ATTR_META[k].color, label: String(p.attrs[k]) }),
+        )),
+      ),
+      h('div', { class: 'profile-meta' },
+        metaRow('职业', p.career || '尚无'),
+        metaRow('婚姻', p.flags?.married ? '已成家' : '未婚'),
+        metaRow('回合数', String(p.turn)),
+        metaRow('生命阶段', stageEmoji(p) + ' ' + stageOf(p).name),
+      ),
+    ];
+    this.showSheet({ title: '人物档案', body, foot: [h('button', { class: 'btn-ghost', onClick: () => this.closeModal() }, '关闭')] });
+  }
+
+  // ============ 设置 / 存档 ============
+  showSettings(fromLauncher) {
+    const p = this.player;
+    const body = [
+      h('div', { class: 'card' },
+        h('h4', null, '存档'),
+        h('div', { class: 'muted', style: { marginBottom: '0.4rem' } },
+          hasSave() ? `当前有存档${p ? `（${p.name} · ${ageLabel(p.weeks)}）` : ''}，进度自动保存。` : '尚无存档。'),
+        h('button', { class: 'btn-primary', style: { width: '100%', marginBottom: '0.4rem' }, onClick: () => this.doExport() }, '📤 导出存档字符串'),
+        h('textarea', { class: 'save-io', dataset: { id: 'io' }, placeholder: '在此粘贴导入字符串…', readonly: true }),
+        h('div', { class: 'row wrap', style: { marginTop: '0.4rem' } },
+          h('button', { class: 'btn-ghost', style: { flex: '1 1 45%' }, onClick: () => this.toggleIoInput() }, '✏️ 切换为输入'),
+          h('button', { class: 'btn-jade', style: { flex: '1 1 45%' }, onClick: () => this.doImport() }, '📥 导入'),
+          h('button', { class: 'btn-danger', style: { flex: '1 1 45%' }, onClick: () => this.confirmReset() }, '🗑️ 删除存档'),
+        ),
+      ),
+      h('div', { class: 'muted', style: { textAlign: 'center' } }, '导出字符串可跨设备迁移你的进度；导入会覆盖当前存档。'),
+    ];
+    const foot = [
+      fromLauncher
+        ? null
+        : h('button', { class: 'btn-ghost', onClick: () => { this.closeModal(); this.confirmExitToLauncher(); } }, '🏠 返回标题'),
+      h('button', { class: 'btn-primary', onClick: () => this.closeModal() }, '关闭'),
+    ];
+    this.showSheet({ title: '设置 / 存档', body, foot: foot.filter(Boolean) });
+  }
+
+  toggleIoInput() {
+    const io = this.modalRoot.querySelector('[data-id="io"]');
+    if (!io) return;
+    io.readOnly = !io.readOnly;
+    if (io.readOnly) { io.value = ''; this.toast('已切回导出模式', 'normal'); }
+    else { this.toast('请在框中粘贴导入字符串后点导入', 'normal'); }
+  }
+
+  doExport() {
+    const p = this.player || loadGame();
+    if (!p) { this.toast('暂无可导出的存档', 'bad'); return; }
+    const io = this.modalRoot.querySelector('[data-id="io"]');
+    const str = exportSave(p);
+    if (io) { io.readOnly = true; io.value = str; }
+    this.toast('存档字符串已生成，可复制', 'good');
+  }
+
+  doImport() {
+    const io = this.modalRoot.querySelector('[data-id="io"]');
+    const str = (io && io.value || '').trim();
+    if (!str) { this.toast('请先在框中粘贴导入字符串', 'bad'); return; }
+    const p = importSave(str);
+    if (!p) { this.toast('导入失败：字符串无效', 'bad'); return; }
+    saveGame(p);
+    this.toast('导入成功，即将载入', 'good');
+    this.closeModal();
+    this.enterGame(p);
+  }
+
+  confirmReset() {
+    this.showSheet({
+      title: '删除存档？',
+      body: [h('div', { class: 'muted' }, '此存档将被永久删除，无法恢复。')],
+      foot: [
+        h('button', { class: 'btn-danger', onClick: () => { clearSave(); this.closeModal(); this.toast('存档已删除', 'normal'); this.showLauncher(); } }, '确认删除'),
+        h('button', { class: 'btn-ghost', onClick: () => this.closeModal() }, '取消'),
+      ],
+    });
+  }
+
+  confirmExitToLauncher() {
+    if (!this.player) { this.showLauncher(); return; }
+    this.showSheet({
+      title: '返回标题？',
+      body: [h('div', { class: 'muted' }, '进度已自动保存，可随时从「继续游戏」回到这里。')],
+      foot: [
+        h('button', { class: 'btn-primary', onClick: () => { this.closeModal(); this.showLauncher(); } }, '返回标题'),
+        h('button', { class: 'btn-ghost', onClick: () => this.closeModal() }, '留在游戏'),
+      ],
+    });
+  }
+
+  // ============ 通用弹窗（Sheet）============
+  showSheet({ title, body, foot }) {
+    clear(this.modalRoot);
+    const overlay = h('div', { class: 'sheet-overlay', onClick: () => this.closeModal() });
+    const sheet = h('div', { class: 'sheet' },
+      h('div', { class: 'sheet__head' }, h('span', { class: 't' }, title || '')),
+      h('div', { class: 'sheet__body' }, ...(body || [])),
+      h('div', { class: 'sheet__foot' }, ...(foot || [])),
+    );
+    this.modalRoot.append(overlay, sheet);
+    this._sheet = sheet;
+  }
+  closeModal() {
+    clear(this.modalRoot);
+    this._sheet = null;
+  }
+
+  toast(text, type = 'normal') {
+    const t = h('div', { class: `toast ${type}` }, text);
+    this.toastWrap.appendChild(t);
+    setTimeout(() => { t.classList.add('hide'); setTimeout(() => t.remove(), 300); }, 1600);
+  }
+
+  destroy() {
+    clear(this.parent);
+    clear(this.modalRoot);
+    clear(this.toastWrap);
+    this.player = null;
+    this.over = false;
+  }
+}
+
+// —— 纯辅助（不依赖 this）——
+function snapshotAttrs(p) {
+  const out = {};
+  for (const k of ATTRS) out[k] = p.attrs[k];
+  return out;
+}
+function diffAttrs(before, after) {
+  const out = {};
+  for (const k of ATTRS) {
+    const d = (after[k] - before[k]);
+    if (d !== 0) out[k] = d;
+  }
+  return out;
+}
+function stageEmoji(p) {
+  return stageForAge(ageYearsFromWeeks(p.weeks)).emoji;
+}
+function milestoneHead(stageKey) {
+  return ({ infant: '幼年结束', child: '步入成年', adult: '迈入晚年', elder: '人生新篇' })[stageKey] || '人生新篇';
+}
+function attrPreview(key, val, adj) {
+  const meta = ATTR_META[key];
+  const d = adj && Number.isFinite(adj[key]) ? adj[key] : 0;
+  const tag = d ? h('span', { class: `adj ${d > 0 ? 'up' : 'down'}` }, `${d > 0 ? '+' : ''}${d}`) : null;
+  return h('div', { class: 'attr-mini' },
+    h('span', { class: 'attr-label' }, `${meta.emoji} ${meta.name}`, tag),
+    bar(val, 100, { color: meta.color, label: String(val) }),
+  );
+}
+function metaRow(k, v) {
+  return h('div', { class: 'meta-row' }, h('span', { class: 'muted' }, k), h('span', null, v));
+}
diff --git a/apps/mo-ni-ren-sheng/src/ui/dom.js b/apps/mo-ni-ren-sheng/src/ui/dom.js
new file mode 100644
index 0000000..bf0a8c3
--- /dev/null
+++ b/apps/mo-ni-ren-sheng/src/ui/dom.js
@@ -0,0 +1,43 @@
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
+// 进度条：label 叠加在条上，pct 由 value/max 决定。
+export function bar(value, max, opts = {}) {
+  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
+  return h('div', { class: `bar ${opts.class || ''}` },
+    h('div', { class: 'bar__fill', style: { width: `${pct}%`, background: opts.color || '' } }),
+    h('span', { class: 'bar__label' }, opts.label || `${Math.floor(value)}/${Math.round(max)}`),
+  );
+}
diff --git a/apps/mo-ni-ren-sheng/src/ui/style.css b/apps/mo-ni-ren-sheng/src/ui/style.css
new file mode 100644
index 0000000..461a63d
--- /dev/null
+++ b/apps/mo-ni-ren-sheng/src/ui/style.css
@@ -0,0 +1,282 @@
+/* ==========================================================================
+   模拟人生 · 样式（竖屏单列、卡片堆叠、移动端优先、深色护眼，适配刘海/底部安全区）
+   命名空间 .mnrs，与主框架其他展品样式互不干扰。
+   ========================================================================== */
+.mnrs {
+  --bg: #0f1419;
+  --bg-2: #161b22;
+  --card: #1c232c;
+  --card-2: #232c37;
+  --line: #313c4a;
+  --text: #e6edf3;
+  --muted: #8b97a6;
+  --gold: #d4a84b;
+  --good: #5fd07f;
+  --bad: #e06b6b;
+  --epic: #ffb84d;
+  --hp: #e06b6b;
+  --intel: #4a90d9;
+  --wealth: #d4a84b;
+  --mood: #b07cf0;
+  --social: #5fd0a0;
+  --radius: 12px;
+
+  position: absolute;
+  inset: 0;
+  background:
+    radial-gradient(120% 50% at 50% -10%, #1d2530 0%, transparent 60%),
+    var(--bg);
+  color: var(--text);
+  font-family: "PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", system-ui, sans-serif;
+  font-size: 14px;
+  line-height: 1.55;
+  overflow: hidden;
+  -webkit-user-select: none;
+  user-select: none;
+  -webkit-tap-highlight-color: transparent;
+}
+
+.mnrs * { box-sizing: border-box; }
+
+.mnrs .muted { color: var(--muted); font-size: 0.82rem; }
+.mnrs .grow { flex: 1; min-width: 0; }
+.mnrs .spacer { flex: 1; }
+
+/* 舞台：承载 启动器 / 创角 / 游戏主体 / 结算 */
+.mnrs .mnrs-stage { position: absolute; inset: 0; overflow: hidden; }
+.mnrs .mnrs-game { position: absolute; inset: 0; display: flex; flex-direction: column; overflow: hidden; }
+
+.mnrs button {
+  font-family: inherit;
+  cursor: pointer;
+  border: none;
+  border-radius: 10px;
+  background: var(--card-2);
+  color: var(--text);
+  padding: 0.6rem 0.85rem;
+  font-size: 0.9rem;
+  transition: transform 0.08s ease, background 0.15s ease, opacity 0.15s ease;
+}
+.mnrs button:active { transform: scale(0.97); }
+.mnrs button:disabled { opacity: 0.45; cursor: default; }
+.mnrs .btn-primary { background: linear-gradient(180deg, #5aa9e6, #2f6fae); color: #fff; font-weight: 600; }
+.mnrs .btn-jade { background: linear-gradient(180deg, #6fe0b0, #2f9a72); color: #06241a; font-weight: 600; }
+.mnrs .btn-danger { background: linear-gradient(180deg, #e2786f, #9c352f); color: #fff; }
+.mnrs .btn-ghost { background: transparent; border: 1px solid var(--line); }
+.mnrs .big-btn { width: 100%; padding: 0.85rem; font-size: 1rem; font-weight: 600; }
+.mnrs .icon-btn { padding: 0.5rem 0.6rem; font-size: 1rem; line-height: 1; }
+
+.mnrs .row { display: flex; align-items: center; gap: 0.5rem; }
+.mnrs .row.wrap { flex-wrap: wrap; }
+.mnrs .card {
+  background: linear-gradient(180deg, var(--card), var(--bg-2));
+  border: 1px solid var(--line);
+  border-radius: var(--radius);
+  padding: 0.8rem;
+  margin-bottom: 0.6rem;
+}
+.mnrs h4 { margin: 0 0 0.4rem; font-size: 0.95rem; }
+
+/* —— 启动器 / 创角 / 结算（居中卡片堆叠，可纵向滚动）—— */
+.mnrs .launcher {
+  position: absolute; inset: 0; overflow-y: auto; overflow-x: hidden;
+  padding: max(1.5rem, env(safe-area-inset-top)) 1rem max(1.5rem, env(safe-area-inset-bottom));
+  display: flex; flex-direction: column; align-items: stretch; justify-content: center;
+  max-width: 480px; margin: 0 auto;
+}
+.mnrs .launcher__brand { text-align: center; margin-bottom: 1.4rem; }
+.mnrs .launcher__brand .emblem {
+  width: 64px; height: 64px; margin: 0 auto 0.6rem; border-radius: 18px;
+  display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: 700;
+  background: linear-gradient(180deg, #2a3543, #1a222c); border: 1px solid var(--line);
+  color: var(--gold);
+}
+.mnrs .launcher__brand h1 { margin: 0; font-size: 1.6rem; }
+.mnrs .launcher__brand .sub { margin: 0.3rem 0 0; color: var(--muted); font-size: 0.85rem; }
+.mnrs .launcher__actions { display: flex; flex-direction: column; gap: 0.55rem; }
+.mnrs .launcher__hint { text-align: center; margin-top: 1rem; }
+
+.mnrs .create__head { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.8rem; }
+.mnrs .create__head h1 { margin: 0; font-size: 1.2rem; flex: 1; text-align: center; }
+.mnrs .gender-toggle { display: flex; gap: 0.5rem; }
+.mnrs .gender-toggle button { flex: 1; }
+.mnrs .gender-toggle button.active { background: linear-gradient(180deg, #5aa9e6, #2f6fae); color: #fff; font-weight: 600; border: none; }
+.mnrs .name-input {
+  width: 100%; padding: 0.7rem; border-radius: 10px; border: 1px solid var(--line);
+  background: var(--bg); color: var(--text); font-family: inherit; font-size: 1rem;
+}
+.mnrs .name-input:focus { outline: none; border-color: var(--intel); }
+.mnrs .reroll-bg { flex: none; }
+.mnrs .create__foot { margin-top: 0.6rem; }
+
+/* —— 顶部状态栏 —— */
+.mnrs .status-bar {
+  flex: none;
+  padding: max(0.7rem, env(safe-area-inset-top)) 0.9rem 0.6rem;
+  background: linear-gradient(180deg, #1a222c, var(--bg-2));
+  border-bottom: 1px solid var(--line);
+}
+.mnrs .id-line {
+  display: flex; align-items: center; gap: 0.45rem; flex-wrap: wrap;
+  margin-bottom: 0.55rem; font-size: 0.85rem;
+}
+.mnrs .id-name { font-weight: 700; font-size: 1rem; }
+.mnrs .id-stage { color: var(--gold); font-weight: 600; }
+.mnrs .id-age { color: var(--text); }
+.mnrs .id-turn { margin-left: auto; color: var(--muted); font-variant-numeric: tabular-nums; }
+
+/* —— 五大属性：标签 + 进度条 + 数值，增减时闪烁/跳动 —— */
+.mnrs .attr-list { display: flex; flex-direction: column; gap: 0.4rem; }
+.mnrs .attr-row {
+  display: flex; align-items: center; gap: 0.5rem;
+  padding: 0.15rem 0.1rem; border-radius: 8px;
+  transition: background 0.5s ease;
+}
+.mnrs .attr-label { flex: none; width: 4.6rem; font-size: 0.8rem; color: var(--text); white-space: nowrap; }
+.mnrs .attr-track { flex: 1; height: 9px; background: rgba(255,255,255,0.07); border-radius: 6px; overflow: hidden; }
+.mnrs .attr-fill { height: 100%; border-radius: 6px; transition: width 0.45s cubic-bezier(0.22, 1, 0.36, 1); }
+.mnrs .attr-val { flex: none; width: 1.8rem; text-align: right; font-variant-numeric: tabular-nums; font-weight: 600; font-size: 0.85rem; }
+.mnrs .attr-delta {
+  position: absolute; /* 由 .attr-row position:relative 容纳；此处仅占位，实际定位见下 */
+}
+.mnrs .attr-row { position: relative; }
+.mnrs .attr-delta {
+  position: absolute; right: 0; top: 50%; transform: translateY(-50%) scale(0.6);
+  opacity: 0; font-weight: 700; font-size: 0.85rem; pointer-events: none;
+}
+.mnrs .attr-delta.show { animation: mnrs-delta 0.7s ease forwards; }
+.mnrs .attr-delta.up { color: var(--good); }
+.mnrs .attr-delta.down { color: var(--bad); }
+.mnrs .attr-row.flash-up .attr-track { box-shadow: inset 0 0 0 1px var(--good), 0 0 8px rgba(95,208,127,0.5); }
+.mnrs .attr-row.flash-down .attr-track { box-shadow: inset 0 0 0 1px var(--bad), 0 0 8px rgba(224,107,107,0.5); }
+.mnrs .attr-row.flash-up { animation: mnrs-flash-up 0.7s ease; }
+.mnrs .attr-row.flash-down { animation: mnrs-flash-down 0.7s ease; }
+@keyframes mnrs-delta {
+  0% { opacity: 0; transform: translate(-4px, -90%) scale(0.6); }
+  20% { opacity: 1; transform: translate(-4px, -100%) scale(1.15); }
+  60% { opacity: 1; transform: translate(-4px, -110%) scale(1); }
+  100% { opacity: 0; transform: translate(-4px, -130%) scale(0.9); }
+}
+@keyframes mnrs-flash-up { 0%,100% { background: transparent; } 30% { background: rgba(95,208,127,0.14); } }
+@keyframes mnrs-flash-down { 0%,100% { background: transparent; } 30% { background: rgba(224,107,107,0.14); } }
+
+/* —— 中部动态文本展示区：人生大事记 —— */
+.mnrs .log-strip { flex: 1; min-height: 0; overflow: hidden; padding: 0.3rem 0; }
+.mnrs .log-strip__lines {
+  height: 100%; overflow-y: auto; padding: 0.3rem 0.9rem; scrollbar-width: thin;
+  display: flex; flex-direction: column; gap: 0.35rem;
+}
+.mnrs .log-strip__lines::-webkit-scrollbar { width: 4px; }
+.mnrs .log-strip__lines::-webkit-scrollbar-thumb { background: var(--line); border-radius: 2px; }
+.mnrs .ln {
+  font-size: 0.86rem; line-height: 1.5; word-break: break-word;
+  padding: 0.4rem 0.6rem; border-radius: 8px;
+  background: rgba(255,255,255,0.03); border-left: 3px solid var(--line);
+  animation: mnrs-line-in 0.3s ease;
+}
+@keyframes mnrs-line-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
+.mnrs .ln.normal { color: var(--muted); border-left-color: var(--line); }
+.mnrs .ln.choice { color: var(--text); border-left-color: var(--intel); }
+.mnrs .ln.milestone { color: var(--gold); border-left-color: var(--gold); font-weight: 600; background: rgba(212,168,75,0.08); }
+
+/* —— 底部固定悬浮「下一回合」主操作按钮 + 工具位 —— */
+.mnrs .bottom-bar {
+  flex: none; display: flex; align-items: center; gap: 0.5rem;
+  padding: 0.6rem 0.9rem max(0.7rem, env(safe-area-inset-bottom));
+  background: linear-gradient(0deg, #161b22, rgba(22,27,34,0.6));
+  border-top: 1px solid var(--line);
+}
+.mnrs .turn-btn {
+  flex: 1; height: 52px; /* ≥48px 拇指热区 */
+  font-size: 1.05rem; font-weight: 700; color: #fff;
+  background: linear-gradient(180deg, #5aa9e6, #2f6fae);
+  border-radius: 14px;
+  box-shadow: 0 4px 14px rgba(47,111,174,0.4);
+}
+.mnrs .turn-btn.busy { background: var(--card-2); box-shadow: none; }
+.mnrs .bottom-tools { display: flex; flex-direction: column; gap: 0.35rem; }
+
+/* —— 属性网格（创角预览 / 档案 / 结算）—— */
+.mnrs .attr-grid { display: flex; flex-direction: column; gap: 0.5rem; }
+.mnrs .attr-mini { display: flex; flex-direction: column; gap: 0.2rem; }
+.mnrs .attr-mini .attr-label { width: auto; display: flex; align-items: center; gap: 0.3rem; font-size: 0.8rem; }
+.mnrs .adj { font-size: 0.72rem; font-weight: 700; padding: 0 0.3rem; border-radius: 6px; }
+.mnrs .adj.up { color: var(--good); background: rgba(95,208,127,0.14); }
+.mnrs .adj.down { color: var(--bad); background: rgba(224,107,107,0.14); }
+
+/* 通用进度条（bar 辅助函数产出） */
+.mnrs .bar { position: relative; height: 14px; background: rgba(255,255,255,0.07); border-radius: 7px; overflow: hidden; }
+.mnrs .bar__fill { position: absolute; inset: 0 auto 0 0; border-radius: 7px; transition: width 0.4s ease; background: var(--intel); }
+.mnrs .bar__label {
+  position: absolute; inset: 0; display: flex; align-items: center; justify-content: flex-end;
+  padding-right: 0.4rem; font-size: 0.72rem; font-weight: 700; color: #fff;
+  text-shadow: 0 1px 2px rgba(0,0,0,0.6); font-variant-numeric: tabular-nums;
+}
+
+/* —— 弹窗（Sheet）—— */
+.mnrs .mnrs-modals { position: absolute; inset: 0; z-index: 50; pointer-events: none; }
+.mnrs .sheet-overlay {
+  position: absolute; inset: 0; background: rgba(0,0,0,0.55); pointer-events: auto;
+  animation: mnrs-fade 0.2s ease;
+}
+.mnrs .sheet {
+  position: absolute; left: 0; right: 0; bottom: 0; max-height: 86%; overflow-y: auto;
+  background: linear-gradient(180deg, var(--card), var(--bg-2));
+  border-top: 1px solid var(--line); border-radius: 18px 18px 0 0;
+  padding: max(0.8rem, env(safe-area-inset-top)) 1rem max(0.9rem, env(safe-area-inset-bottom));
+  pointer-events: auto; animation: mnrs-sheet-up 0.25s cubic-bezier(0.22, 1, 0.36, 1);
+}
+.mnrs .sheet__head { display: flex; align-items: center; justify-content: center; margin-bottom: 0.6rem; }
+.mnrs .sheet__head .t { font-size: 1.05rem; font-weight: 700; }
+.mnrs .sheet__body { padding-bottom: 0.4rem; }
+.mnrs .sheet__foot { display: flex; flex-wrap: wrap; gap: 0.45rem; }
+.mnrs .sheet__foot > * { flex: 1 1 auto; }
+@keyframes mnrs-fade { from { opacity: 0; } to { opacity: 1; } }
+@keyframes mnrs-sheet-up { from { transform: translateY(40px); opacity: 0.4; } to { transform: none; opacity: 1; } }
+
+/* —— 随机事件抉择 —— */
+.mnrs .event-emoji { text-align: center; font-size: 2.4rem; margin-bottom: 0.3rem; }
+.mnrs .event-text { text-align: center; margin-bottom: 0.8rem; font-size: 0.92rem; }
+.mnrs .event-options { display: flex; flex-direction: column; gap: 0.45rem; width: 100%; }
+.mnrs .event-opt { width: 100%; text-align: left; padding: 0.7rem 0.85rem; }
+
+/* —— 人物档案 —— */
+.mnrs .profile-head { text-align: center; margin-bottom: 0.7rem; }
+.mnrs .profile-name { font-size: 1.2rem; font-weight: 700; }
+.mnrs .profile-meta { margin-top: 0.6rem; display: flex; flex-direction: column; gap: 0.35rem; }
+.mnrs .meta-row { display: flex; justify-content: space-between; font-size: 0.85rem; }
+
+/* —— 存档导入导出 —— */
+.mnrs .save-io {
+  width: 100%; height: 64px; resize: vertical; padding: 0.5rem; border-radius: 8px;
+  border: 1px solid var(--line); background: var(--bg); color: var(--text);
+  font-family: ui-monospace, monospace; font-size: 0.72rem; word-break: break-all;
+}
+
+/* —— 结局结算 —— */
+.mnrs .over { justify-content: flex-start; }
+.mnrs .over-grade { text-align: center; margin-bottom: 1rem; padding: 1rem; border-radius: var(--radius); background: rgba(255,255,255,0.03); border: 1px solid var(--line); }
+.mnrs .over-grade__emoji { font-size: 3rem; }
+.mnrs .over-grade h2 { margin: 0.3rem 0; font-size: 1.5rem; }
+.mnrs .over-grade.epic h2 { color: var(--epic); }
+.mnrs .over-grade.good h2 { color: var(--good); }
+.mnrs .over-grade.bad h2 { color: var(--bad); }
+.mnrs .over-summary { font-size: 0.92rem; line-height: 1.6; margin-bottom: 0.7rem; }
+.mnrs .over-tags { display: flex; flex-wrap: wrap; gap: 0.4rem; }
+.mnrs .tag { font-size: 0.8rem; padding: 0.25rem 0.6rem; border-radius: 999px; background: rgba(255,255,255,0.06); border: 1px solid var(--line); }
+.mnrs .over-history__list { max-height: 180px; overflow-y: auto; display: flex; flex-direction: column; gap: 0.3rem; }
+.mnrs .over-actions { display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.4rem; }
+
+/* —— Toast —— */
+.mnrs .toast-wrap { position: absolute; top: max(0.6rem, env(safe-area-inset-top)); left: 0; right: 0; z-index: 80; display: flex; flex-direction: column; align-items: center; gap: 0.3rem; pointer-events: none; }
+.mnrs .toast {
+  max-width: 88%; padding: 0.5rem 0.9rem; border-radius: 999px; font-size: 0.82rem;
+  background: rgba(28,35,44,0.95); border: 1px solid var(--line); color: var(--text);
+  box-shadow: 0 4px 14px rgba(0,0,0,0.4);
+  animation: mnrs-toast-in 0.25s ease;
+}
+.mnrs .toast.good { border-color: var(--good); }
+.mnrs .toast.bad { border-color: var(--bad); }
+.mnrs .toast.hide { animation: mnrs-toast-out 0.3s ease forwards; }
+@keyframes mnrs-toast-in { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: none; } }
+@keyframes mnrs-toast-out { to { opacity: 0; transform: translateY(-8px); } }
diff --git a/apps/mo-ni-ren-sheng/vite.config.js b/apps/mo-ni-ren-sheng/vite.config.js
new file mode 100644
index 0000000..122c555
--- /dev/null
+++ b/apps/mo-ni-ren-sheng/vite.config.js
@@ -0,0 +1,16 @@
+import { defineConfig } from 'vite';
+
+// `base: './'` 生成相对路径资源引用，便于部署到 GitHub Pages 子路径或任意静态目录。
+// 本作刻意不依赖任何框架，纯原生 DOM 渲染，构建产物极小。
+export default defineConfig({
+  base: './',
+  server: {
+    host: true,
+    port: 5175,
+  },
+  build: {
+    outDir: 'dist',
+    sourcemap: false,
+    target: 'es2018',
+  },
+});
diff --git a/src/main.js b/src/main.js
index c28a3cd..de860f3 100644
--- a/src/main.js
+++ b/src/main.js
@@ -20,6 +20,14 @@ const GAMES = [
     desc: '从凡人起步，修炼突破、探索机缘、炼丹渡劫，直至白日飞升。一款竖屏文字挂机修仙游戏。',
     loader: () => import('../apps/fan-ren-xiu-xian/src/main.js'),
   },
+  {
+    key: 'mnrs',
+    title: '模拟人生',
+    subtitle: '模拟 · 文字人生',
+    emblem: '生',
+    desc: '从呱呱坠地到垂垂老矣，一周一周推进岁月，在健康、智力、财富、心情、社交间权衡抉择，过完这一生。',
+    loader: () => import('../apps/mo-ni-ren-sheng/src/main.js'),
+  },
 ]
 
 const app = document.getElementById('app')
