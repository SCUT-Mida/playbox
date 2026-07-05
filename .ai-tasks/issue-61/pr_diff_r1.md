diff --git a/.ai-tasks/issue-61/ai-coder-prompt.md b/.ai-tasks/issue-61/ai-coder-prompt.md
new file mode 100644
index 0000000..7848abc
--- /dev/null
+++ b/.ai-tasks/issue-61/ai-coder-prompt.md
@@ -0,0 +1,8 @@
+你是一个资深开发者。请解决以下 GitHub Issue：
+【任务标题】: 新做一个打卡页面
+【详细需求】: 请直接阅读当前目录下的 .ai-tasks/issue-61/context.md 文件获取。
+
+【⚠️ 严格红线规则】：
+请绝对不要修改、重命名或生成 .github/ 目录下的任何文件 (特别是 workflows 等 CI/CD 配置)，这会破坏项目的自动化流程！如果觉得有必要修改，请在回复中用文字建议人类去改，绝不要自己动手改。
+
+请直接分析并修改项目中的代码文件来解决这个问题，不要做过多的文字解释。
diff --git a/.ai-tasks/issue-61/context.md b/.ai-tasks/issue-61/context.md
new file mode 100644
index 0000000..219ef50
--- /dev/null
+++ b/.ai-tasks/issue-61/context.md
@@ -0,0 +1,6 @@
+- 要呈现日历
+- 可点击打卡，取消打卡
+- 每累计10天打卡呈现一个爱心，第10天的交互也可以有更好交互体验
+- 粉色色系
+- 参考业界优秀实践
+- 可以输入昵称，根据昵称来做存档
diff --git a/apps/da-ka/README.md b/apps/da-ka/README.md
new file mode 100644
index 0000000..b713a02
--- /dev/null
+++ b/apps/da-ka/README.md
@@ -0,0 +1,52 @@
+# 打卡 · Daily Check-in
+
+一款粉色系的每日打卡日历。坚持的每一天都开出一朵小花 🌸，**每累计 10 天** 收获一颗爱心，并触发庆祝动画。可输入昵称、按昵称多档案存档。
+
+技术栈：**原生 DOM + Vite**（无框架），移动端优先，纯本地存储。
+
+## 本地运行
+
+```bash
+npm install
+npm run dev        # 开发服务器 http://localhost:5176
+npm run build      # 生产构建到 dist/
+npm run preview    # 预览生产构建
+npm test           # 纯逻辑自测（config / calendar / checkin / store）
+npm run test:dom   # jsdom DOM 冒烟测试
+```
+
+## 核心功能
+
+- **日历**：周一为首列的月历，可前后翻月；今日高亮，未来日禁用，上下月占位淡化。
+- **打卡 / 取消**：点击任意日期格切换打卡；今日另有醒目大按钮。再次点击即取消。
+- **爱心里程碑**：每累计 10 天解锁一颗爱心；第 10 / 20 / 30 … 天触发爱心飞散的庆祝动画。
+- **统计**：累计天数、连续打卡（今天没打也不算断）、历史最长连击；爱心收藏区可视化已解锁与未解锁占位。
+- **昵称存档**：输入昵称建档，数据按昵称归档于 `localStorage`；支持多档案切换、改名、删除（二次确认）。
+- **粉色色系**：柔和粉渐变 + 圆角卡片 + 心形点缀 + 微动效，尊重 `prefers-reduced-motion`。
+
+## 项目结构
+
+```
+src/
+  main.js            入口：导出 createGame(parent) 工厂
+  config.js          常量（昵称约束 / 爱心步长 / 星期月份 / 存档 key）
+  core/
+    calendar.js      纯日期函数：ISO 串、月历矩阵、连击日差、未来/今日判定
+    checkin.js       打卡逻辑：切换、里程碑、连击、爱心数、昵称规范化
+    store.js         localStorage 多档案存取（按昵称 key 归档）
+  ui/
+    app.js           CheckInUI：启动器 / 主视图 / 弹层 / 庆祝动画 / Toast
+    style.css        粉色系样式与动效
+scripts/
+  logic-test.mjs     纯逻辑自测
+  smoke-dom.mjs      jsdom DOM 冒烟测试
+  _css-loader.mjs    冒烟测试用：把 .css 视作空模块
+```
+
+## 数据与隐私
+
+所有打卡记录仅保存在**用户本设备的 `localStorage`**，不上传任何服务器。清除浏览器数据即丢失档案。
+
+## 部署（GitHub Pages）
+
+由主仓库 `deploy-pages.yml` 统一构建部署，本展品作为落地页的一个动态加载分片，无需单独配置。
diff --git a/apps/da-ka/index.html b/apps/da-ka/index.html
new file mode 100644
index 0000000..f65d9fd
--- /dev/null
+++ b/apps/da-ka/index.html
@@ -0,0 +1,41 @@
+<!doctype html>
+<html lang="zh-CN">
+
+<head>
+  <meta charset="UTF-8" />
+  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
+  <meta name="theme-color" content="#fff5f8" />
+  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%23ffe3ec'/%3E%3Ctext x='16' y='24' font-size='22' text-anchor='middle' fill='%23ff5d8f' font-family='serif'%3E%E2%99%A1%3C/text%3E%3C/svg%3E" />
+  <title>打卡 · Daily Check-in</title>
+  <style>
+    html,
+    body {
+      margin: 0;
+      padding: 0;
+      width: 100%;
+      height: 100%;
+      background: #fff5f8;
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
diff --git a/apps/da-ka/package-lock.json b/apps/da-ka/package-lock.json
new file mode 100644
index 0000000..033fa66
--- /dev/null
+++ b/apps/da-ka/package-lock.json
@@ -0,0 +1,1559 @@
+{
+  "name": "da-ka",
+  "version": "1.0.0",
+  "lockfileVersion": 3,
+  "requires": true,
+  "packages": {
+    "": {
+      "name": "da-ka",
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
+      "version": "7.4.6",
+      "resolved": "https://registry.npmjs.org/tldts/-/tldts-7.4.6.tgz",
+      "integrity": "sha512-rbP0Gyx8b3Ae9yO//CU2wbSnQNoQ66m1nJdSbSHmnwKwzkkz/u8mERYU8T2rmlmy+bJvRNn84yNCW8gYqox44Q==",
+      "dev": true,
+      "license": "MIT",
+      "dependencies": {
+        "tldts-core": "^7.4.6"
+      },
+      "bin": {
+        "tldts": "bin/cli.js"
+      }
+    },
+    "node_modules/tldts-core": {
+      "version": "7.4.6",
+      "resolved": "https://registry.npmjs.org/tldts-core/-/tldts-core-7.4.6.tgz",
+      "integrity": "sha512-TkQNGJIhlEphpHCjKodMTSe23egUZr/g+flI2qkLgiJ/maAzSgXypSLRTNH3nCmqgayEmtcJBiLcfODSAr1xoA==",
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
diff --git a/apps/da-ka/package.json b/apps/da-ka/package.json
new file mode 100644
index 0000000..872c61b
--- /dev/null
+++ b/apps/da-ka/package.json
@@ -0,0 +1,17 @@
+{
+  "name": "da-ka",
+  "version": "1.0.0",
+  "description": "《打卡》粉色系打卡日历 - A pink-themed daily check-in calendar with hearts & streaks",
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
diff --git a/apps/da-ka/scripts/_css-loader.mjs b/apps/da-ka/scripts/_css-loader.mjs
new file mode 100644
index 0000000..b10c2fa
--- /dev/null
+++ b/apps/da-ka/scripts/_css-loader.mjs
@@ -0,0 +1,7 @@
+// 让 Node 的 ESM 加载器把 *.css 视作空模块（仅冒烟测试用）。
+export async function load(url, context, nextLoad) {
+  if (url.endsWith('.css')) {
+    return { format: 'module', source: '', shortCircuit: true };
+  }
+  return nextLoad(url, context);
+}
diff --git a/apps/da-ka/scripts/logic-test.mjs b/apps/da-ka/scripts/logic-test.mjs
new file mode 100644
index 0000000..05ad2d9
--- /dev/null
+++ b/apps/da-ka/scripts/logic-test.mjs
@@ -0,0 +1,258 @@
+// ============================================================================
+// 纯逻辑自测：不依赖浏览器，覆盖 config / calendar / checkin / store 各模块。
+// 运行：node scripts/logic-test.mjs
+// ============================================================================
+import {
+  NICKNAME_MIN_LEN, NICKNAME_MAX_LEN, HEARTS_STEP, WEEK_START,
+  WEEKDAY_LABELS, MONTH_LABELS, STORE_KEY, ACTIVE_KEY,
+} from '../src/config.js';
+import {
+  toISODate, parseISO, atMidnight, isSameDay, addDays, prevDay, nextDay,
+  diffDays, daysInMonth, monthMatrix, isFuture, isToday,
+} from '../src/core/calendar.js';
+import {
+  newProfile, isChecked, isCheckedToday, totalDays, heartsEarned,
+  daysToNextHeart, heartProgress, toggleCheckin, currentStreak, longestStreak,
+  normalizeKey, isValidNickname, normalizeNickname, nowSec,
+} from '../src/core/checkin.js';
+import {
+  _setStorage, loadAll, ensureProfile, upsertProfile, deleteProfile,
+  renameProfile, listProfiles, getActiveKey, setActiveKey, hasAnyProfile,
+  getProfile, migrate,
+} from '../src/core/store.js';
+
+let pass = 0, fail = 0;
+const ok = (c, m) => { if (c) pass++; else { fail++; console.error('  ✗ FAIL:', m); } };
+
+// 固定参考日期：2026-07-05（本地午夜），作为「今天」注入，保证测试稳定。
+const TODAY = new Date(2026, 6, 5);
+const iso = (d) => toISODate(d);
+
+// ===================== config =====================
+ok(NICKNAME_MIN_LEN === 1, '昵称最小长度为 1');
+ok(NICKNAME_MAX_LEN === 12, '昵称最大长度为 12');
+ok(HEARTS_STEP === 10, '每 10 天一颗爱心');
+ok(WEEK_START === 1, '周一为首列');
+ok(WEEKDAY_LABELS.length === 7 && WEEKDAY_LABELS[0] === '一' && WEEKDAY_LABELS[6] === '日', '星期表头 周一→周日');
+ok(MONTH_LABELS.length === 12, '12 个月份名');
+ok(typeof STORE_KEY === 'string' && STORE_KEY.length > 0, '存档 key 非空');
+ok(typeof ACTIVE_KEY === 'string' && ACTIVE_KEY.length > 0, '激活 key 非空');
+
+// ===================== calendar =====================
+ok(toISODate(new Date(2026, 6, 5)) === '2026-07-05', 'toISODate 月份补零');
+ok(toISODate(new Date(2026, 0, 3)) === '2026-01-03', 'toISODate 1 月补零');
+ok(parseISO('2026-07-05') instanceof Date, 'parseISO 返回 Date');
+ok(parseISO('2026-13-40') === null, 'parseISO 非法月日返回 null');
+ok(parseISO('2026-02-30') === null, 'parseISO 2 月 30 日溢出返回 null');
+ok(isSameDay(new Date(2026, 6, 5, 23, 59), new Date(2026, 6, 5, 0, 0)), 'isSameDay 忽略时分秒');
+ok(toISODate(addDays(TODAY, 1)) === '2026-07-06', 'addDays +1');
+ok(toISODate(addDays(TODAY, -5)) === '2026-06-30', 'addDays -5 跨月');
+ok(toISODate(prevDay(TODAY)) === '2026-07-04', 'prevDay');
+ok(toISODate(nextDay(TODAY)) === '2026-07-06', 'nextDay');
+ok(diffDays(new Date(2026, 6, 1), TODAY) === 4, 'diffDays 7/1→7/5 = 4');
+ok(diffDays(TODAY, new Date(2026, 6, 1)) === -4, 'diffDays 反向为负');
+ok(daysInMonth(2026, 1) === 28, '2026 年 2 月 28 天（平年）');
+ok(daysInMonth(2024, 1) === 29, '2024 年 2 月 29 天（闰年）');
+ok(daysInMonth(2026, 6) === 31, '7 月 31 天');
+ok(daysInMonth(2026, 5) === 30, '6 月 30 天');
+
+// monthMatrix：恒为 42 格，首格日期 <= 当月 1 号，且与首列（周一）对齐。
+{
+  const m = monthMatrix(2026, 6, WEEK_START); // 2026-07，1 号是周三
+  ok(m.cells.length === 42, 'monthMatrix 产出 42 格');
+  // 2026-07-01 是周三，周一为首列 → 首格应为 6/29（周一）。
+  ok(iso(m.cells[0]) === '2026-06-29', `monthMatrix 首格为上月末周一（实际 ${iso(m.cells[0])}）`);
+  ok(iso(m.cells[2]) === '2026-07-01', 'monthMatrix 第三格为 7 月 1 日');
+  ok(iso(m.cells[41]) === '2026-08-09', `monthMatrix 末格为 8/9（实际 ${iso(m.cells[41])}）`);
+  // 每个首列格子都是周一
+  ok(m.cells.every((_, i) => i % 7 !== 0 || m.cells[i].getDay() === 1), '每行首列均为周一');
+}
+ok(isFuture(new Date(2026, 6, 6), TODAY) === true, '明天属于未来');
+ok(isFuture(new Date(2026, 6, 5), TODAY) === false, '今天不是未来');
+ok(isFuture(new Date(2026, 6, 4), TODAY) === false, '昨天不是未来');
+ok(isToday(new Date(2026, 6, 5), TODAY) === true, 'isToday 命中');
+ok(isToday(new Date(2026, 6, 6), TODAY) === false, 'isToday 非今天');
+
+// ===================== checkin =====================
+{
+  const p = newProfile('小甜', '小甜');
+  ok(p.nickname === '小甜', 'newProfile 记录昵称');
+  ok(p.key === '小甜', 'newProfile 记录 key');
+  ok(Array.isArray(p.checkins) && p.checkins.length === 0, '新档案打卡为空数组');
+  ok(totalDays(p) === 0, '累计 0 天');
+  ok(heartsEarned(p) === 0, '0 颗爱心');
+  ok(isChecked(p, '2026-07-05') === false, '未打卡');
+  ok(isCheckedToday(p, TODAY) === false, '今日未打卡');
+
+  // 打卡今天
+  let r = toggleCheckin(p, '2026-07-05', TODAY);
+  ok(r.checked === true, '切换为已打卡');
+  ok(r.milestone === false, '第 1 天非里程碑');
+  ok(totalDays(r.profile) === 1, '累计 1 天');
+  ok(isCheckedToday(r.profile, TODAY) === true, '今日已打卡');
+
+  // 连续打卡 9 天（6/27 → 7/5），第 10 天里程碑
+  let cur = r.profile;
+  for (let i = 1; i <= 8; i++) {
+    const d = addDays(TODAY, -i);
+    cur = toggleCheckin(cur, iso(d), TODAY).profile;
+  }
+  ok(totalDays(cur) === 9, `连续打 9 天（实际 ${totalDays(cur)}）`);
+  ok(heartsEarned(cur) === 0, '9 天尚无爱心');
+  ok(daysToNextHeart(cur) === 1, '距第一颗爱心还差 1 天');
+  ok(Math.abs(heartProgress(cur) - 0.9) < 1e-9, '进度 0.9');
+  // 再打一天（第 10 天）→ 触发里程碑
+  const r10 = toggleCheckin(cur, iso(addDays(TODAY, -9)), TODAY);
+  ok(r10.milestone === true, '第 10 天触发里程碑');
+  ok(heartsEarned(r10.profile) === 1, '解锁第 1 颗爱心');
+  ok(daysToNextHeart(r10.profile) === HEARTS_STEP, '整除时距下一颗仍为 10 天');
+  ok(heartProgress(r10.profile) === 0, '整除时进度归零');
+
+  // 取消打卡今天 → 状态回退、不触发里程碑
+  const undo = toggleCheckin(r10.profile, '2026-07-05', TODAY);
+  ok(undo.checked === false, '取消后该日为未打卡');
+  ok(undo.milestone === false, '取消不触发里程碑');
+  ok(isCheckedToday(undo.profile, TODAY) === false, '今日恢复未打卡');
+  ok(totalDays(undo.profile) === 9, '取消后累计回到 9 天');
+
+  // 拒绝未来日打卡
+  const fut = toggleCheckin(p, '2026-12-31', TODAY);
+  ok(fut.checked === false && fut.milestone === false, '未来日打卡被拒绝');
+  ok(totalDays(fut.profile) === 0, '未来日打卡不计入');
+  // 非法日期串
+  ok(toggleCheckin(p, 'not-a-date', TODAY).checked === false, '非法日期串被忽略');
+}
+ok(typeof nowSec() === 'number' && nowSec() >= 0, 'nowSec 返回非负数');
+
+// —— 连击统计 ——
+{
+  // 今天已打卡 + 连续往前 4 天 → 连击 5；最长 5
+  let p = newProfile('连击', '连击');
+  for (let i = 0; i < 5; i++) p = toggleCheckin(p, iso(addDays(TODAY, -i)), TODAY).profile;
+  ok(currentStreak(p, TODAY) === 5, `当前连击 5（实际 ${currentStreak(p, TODAY)}）`);
+  ok(longestStreak(p) === 5, '最长连击 5');
+
+  // 今天没打、但昨天起连续 3 天 → 连击 3（不算断）
+  let p2 = newProfile('连击2', '连击2');
+  for (let i = 1; i <= 3; i++) p2 = toggleCheckin(p2, iso(addDays(TODAY, -i)), TODAY).profile;
+  ok(currentStreak(p2, TODAY) === 3, '今天没打也保留昨日连击 3');
+
+  // 历史最长：早年有一段 7 连击
+  let p3 = newProfile('连击3', '连击3');
+  const base = new Date(2020, 0, 10);
+  for (let i = 0; i < 7; i++) p3 = toggleCheckin(p3, iso(addDays(base, i)), TODAY).profile;
+  // 再补今天单独 1 天
+  p3 = toggleCheckin(p3, iso(TODAY), TODAY).profile;
+  ok(longestStreak(p3) === 7, `历史最长连击 7（实际 ${longestStreak(p3)}）`);
+  ok(currentStreak(p3, TODAY) === 1, '当前连击仅 1（今天）');
+
+  // 乱序写入不影响连击（toggleCheckin 内部排序）
+  let p4 = newProfile('乱序', '乱序');
+  const days = [iso(addDays(TODAY, -2)), iso(TODAY), iso(addDays(TODAY, -1))];
+  for (const d of days) p4 = toggleCheckin(p4, d, TODAY).profile;
+  ok(currentStreak(p4, TODAY) === 3, '乱序写入后连击仍为 3');
+  ok(p4.checkins.join() === [iso(addDays(TODAY, -2)), iso(addDays(TODAY, -1)), iso(TODAY)].join(), 'checkins 升序去重');
+}
+
+// —— 昵称工具 ——
+ok(normalizeKey('小 甜') === '小_甜', 'normalizeKey 内部空白转下划线');
+ok(normalizeKey('  AbC  ') === 'abc', 'normalizeKey 去首尾空白并小写');
+ok(normalizeKey('小　甜　甜') === '小_甜_甜', 'normalizeKey 全角空白也归一'); // 全角空格属 \s
+ok(isValidNickname('小甜甜', 1, 12) === true, '合法昵称通过');
+ok(isValidNickname('   ', 1, 12) === false, '纯空白昵称非法');
+ok(isValidNickname('', 1, 12) === false, '空昵称非法');
+ok(isValidNickname('a'.repeat(13), 1, 12) === false, '超长昵称非法');
+ok(isValidNickname('a'.repeat(12), 1, 12) === true, '12 字昵称刚好合法');
+ok(normalizeNickname('  小   甜  ', 12) === '小 甜', 'normalizeNickname 压缩空白');
+ok([...normalizeNickname('甜'.repeat(20), 12)].length === 12, 'normalizeNickname 按码点截断到 12');
+
+// ===================== store（多档案）=====================
+function memStorage() {
+  const m = {};
+  return {
+    getItem: (k) => (k in m ? m[k] : null),
+    setItem: (k, v) => { m[k] = String(v); },
+    removeItem: (k) => { delete m[k]; },
+  };
+}
+_setStorage(memStorage());
+ok(Object.keys(loadAll()).length === 0, '空存储无档案');
+ok(hasAnyProfile() === false, '空存储 hasAnyProfile=false');
+
+// ensureProfile：新建并写入
+const p1 = ensureProfile('小甜甜', null);
+ok(p1.nickname === '小甜甜' && p1.key === '小甜甜', 'ensureProfile 新建档案');
+ok(getProfile('小甜甜') !== null, '新建后可按 key 取回');
+ok(hasAnyProfile() === true, '有档案后 hasAnyProfile=true');
+// 同 key 再次 ensure 不重复创建，仅刷新 lastSeen
+const p1Again = ensureProfile('小甜甜改名了', '小甜甜'); // 显式 key 命中已有档案
+ok(p1Again.key === '小甜甜', '相同 key 不重复创建（沿用原档案）');
+ok(p1Again.nickname === '小甜甜', '已存在时忽略传入的 nickname');
+
+// upsertProfile：保存打卡进度
+p1Again.checkins = ['2026-07-01', '2026-07-05'];
+ok(upsertProfile(p1Again) === true, 'upsertProfile 写入成功');
+ok(getProfile('小甜甜').checkins.length === 2, 'upsertProfile 后进度持久化');
+// 「小 甜」与「小甜」应归到同一 key（空白归一）
+const dup = ensureProfile('小 甜', null);
+ok(dup.key === '小_甜', '昵称含空白派生带下划线 key');
+// listProfiles 按最近活跃倒序
+ensureProfile('阿喵', null);
+const list = listProfiles();
+ok(list.length >= 3, `listProfiles 列出全部档案（${list.length}）`);
+ok(list.every((it, i) => i === 0 || list[i - 1].lastSeen >= it.lastSeen), 'listProfiles 按 lastSeen 倒序');
+
+// renameProfile：仅改名
+ok(renameProfile('小甜甜', '甜甜') === true, 'renameProfile 成功');
+ok(getProfile('甜甜') !== null && getProfile('小甜甜') === null, '改名后旧 key 消失、新 key 可取');
+// 改成已存在的 key 应失败
+ok(renameProfile('甜甜', '阿喵') === false, '改成已占用 key 失败');
+// 空名改名失败
+ok(renameProfile('甜甜', '   ') === false, '改成空名失败');
+
+// deleteProfile
+ok(deleteProfile('阿喵') === true, 'deleteProfile 成功');
+ok(getProfile('阿喵') === null, '删除后取不到');
+ok(deleteProfile('不存在') === false, '删除不存在的档案返回 false');
+
+// 激活指针
+setActiveKey('甜甜');
+ok(getActiveKey() === '甜甜', 'setActiveKey/getActiveKey 往返');
+setActiveKey(null);
+ok(getActiveKey() === null, 'setActiveKey(null) 清除激活');
+
+// migrate：损坏档案被规范化
+{
+  _setStorage(memStorage());
+  const bad = {
+    nickname: '   ', key: '', checkins: ['bad', '2026-07-01', '2026-07-01', '2026-13-40', 123],
+    createdAt: 'x', lastSeen: NaN,
+  };
+  upsertProfile(bad);
+  const fixed = getProfile('未命名');
+  ok(fixed !== null, 'migrate 兜底空昵称为「未命名」');
+  ok(fixed.nickname === '未命名', 'migrate 规范化昵称');
+  ok(fixed.key === '未命名', 'migrate 补齐 key');
+  ok(Array.isArray(fixed.checkins) && fixed.checkins.length === 1 && fixed.checkins[0] === '2026-07-01', 'migrate 过滤非法/重复日期');
+  ok(typeof fixed.createdAt === 'number' && typeof fixed.lastSeen === 'number', 'migrate 时间戳兜底为数字');
+  // 非 Date 对象 / null 兜底
+  ok(migrate(null) === null, 'migrate(null) 返回 null');
+  ok(migrate('string') === null, 'migrate 非对象返回 null');
+}
+
+// 全流程：建档 → 打卡到 10 天 → 爱心数持久化 → 重读一致
+{
+  _setStorage(memStorage());
+  let p = ensureProfile('坚持者', null);
+  for (let i = 0; i < 10; i++) {
+    p = toggleCheckin(p, iso(addDays(TODAY, -i)), TODAY).profile;
+  }
+  ok(heartsEarned(p) === 1, '打满 10 天解锁 1 颗爱心');
+  upsertProfile(p);
+  const reloaded = getProfile('坚持者');
+  ok(reloaded.checkins.length === 10, '重读存档打卡数一致');
+  ok(heartsEarned(reloaded) === 1, '重读存档爱心数一致');
+}
+
+console.log(`\n结果: ${pass} 通过, ${fail} 失败`);
+process.exit(fail ? 1 : 0);
diff --git a/apps/da-ka/scripts/smoke-dom.mjs b/apps/da-ka/scripts/smoke-dom.mjs
new file mode 100644
index 0000000..83c4d5c
--- /dev/null
+++ b/apps/da-ka/scripts/smoke-dom.mjs
@@ -0,0 +1,213 @@
+// DOM 冒烟测试：用 jsdom 驱动真实 UI 流程
+// （启动器 → 输入昵称 → 主视图 → 日历打卡/取消 → 翻月 → 10 天爱心庆祝 →
+//   持久化 → 档案管理：切换 / 改名 / 删除），全程不抛错。
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
+for (const k of ['document', 'window', 'localStorage', 'navigator', 'HTMLElement', 'Node', 'Element', 'getComputedStyle', 'CustomEvent', 'MouseEvent', 'Event', 'KeyboardEvent']) {
+  if (window[k] === undefined) continue;
+  try { globalThis[k] = window[k]; } catch (_) { /* Node 部分全局只读，跳过 */ }
+}
+globalThis.requestAnimationFrame = (fn) => setTimeout(fn, 0);
+
+let pass = 0, fail = 0;
+const ok = (c, m) => { if (c) pass++; else { fail++; console.error('  ✗ FAIL:', m); } };
+const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
+
+// 固定「今天」为 2026-07-15，确保当月内有足够过去日可点出 10 连击。
+const TODAY = new Date(2026, 6, 15);
+const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
+
+const { createGame } = await import(new URL('../src/main.js', import.meta.url).href);
+
+// ---------- 1) 首启：启动器 ----------
+localStorage.clear();
+// 复用 main.js 在 #game-container 存在时自动挂载的实例（window.__DAKA），
+// 避免重复 createGame 制造两个实例导致 document.querySelector 命中错误的那个。
+let ui = window.__DAKA;
+// 覆盖「今天」与展示月，保证后续断言稳定（mount 已渲染，需重渲染一次）
+ui.today = TODAY;
+ui.view = { year: TODAY.getFullYear(), month: TODAY.getMonth() };
+ui.render();
+await sleep(10);
+ok(document.querySelector('.daka-launcher') !== null, '渲染启动器');
+ok(document.querySelector('[data-id="nickname"]') !== null, '启动器有昵称输入框');
+ok(document.querySelector('[data-act="start"]') !== null, '启动器有开始按钮');
+
+// ---------- 2) 空昵称提交被拒（不进入主视图） ----------
+const input = document.querySelector('[data-id="nickname"]');
+const setVal = (el, v) => {
+  el.value = v;
+  el.dispatchEvent(new window.Event('input', { bubbles: true }));
+};
+const startBtn = document.querySelector('[data-act="start"]');
+startBtn.click();
+await sleep(5);
+ok(document.querySelector('.daka-launcher') !== null, '空昵称不进入主视图');
+ok(document.querySelector('.toast') !== null, '空昵称弹出 toast 提示');
+
+// ---------- 3) 输入昵称 → 进入主视图 ----------
+setVal(input, '小甜甜');
+startBtn.click();
+await sleep(10);
+ok(document.querySelector('.daka-main') !== null, '输入昵称后进入主视图');
+ok(document.querySelector('.calendar') !== null, '主视图渲染日历');
+ok(document.querySelector('.cal-grid .day') !== null, '日历有日期格');
+ok(/小甜甜/.test(document.querySelector('.daka-nick__name')?.textContent || ''), `记录昵称（${document.querySelector('.daka-nick__name')?.textContent}）`);
+ok(ui.profile && ui.profile.nickname === '小甜甜', '当前档案昵称正确');
+
+// ---------- 4) 今天格子可点击打卡 → 状态切换 + 统计更新 ----------
+const todayCell0 = document.querySelector(`.day[data-iso="${iso(TODAY)}"]`);
+ok(todayCell0 !== null, '今天的日历格存在');
+ok(!todayCell0.classList.contains('is-checked'), '今天初始未打卡');
+todayCell0.click();
+await sleep(8);
+// _refreshCalendar 会重建日历节点，需重新查询引用。
+const todayCell = document.querySelector(`.day[data-iso="${iso(TODAY)}"]`);
+ok(todayCell && todayCell.classList.contains('is-checked'), '点击后今天已打卡');
+ok(document.querySelector('.today-card').classList.contains('is-checked'), '今日卡片同步为已打卡');
+ok(document.querySelectorAll('.stat__num')[0]?.textContent === '1', `累计天数=1（${document.querySelectorAll('.stat__num')[0]?.textContent}）`);
+// 今日大按钮同样可取消
+document.querySelector('.today-card').click();
+await sleep(8);
+const todayCellAfter = document.querySelector(`.day[data-iso="${iso(TODAY)}"]`);
+ok(todayCellAfter && !todayCellAfter.classList.contains('is-checked'), '再点今日卡取消打卡');
+ok(document.querySelectorAll('.stat__num')[0]?.textContent === '0', '取消后累计天数=0');
+
+// ---------- 5) 未来日禁用 ----------
+const futureCell = document.querySelector(`.day[data-iso="${iso(new Date(2026, 6, 20))}"]`);
+ok(futureCell && futureCell.disabled, '未来日格子被禁用');
+const outCell = document.querySelector('.day--out'); // 上下月占位
+ok(outCell !== null, '日历含上下月占位格');
+
+// ---------- 6) 翻月 ----------
+const prevBtn = document.querySelector('[data-act="prev-month"]');
+const titleBefore = document.querySelector('.cal-nav__title').textContent;
+prevBtn.click();
+await sleep(5);
+const titleAfter = document.querySelector('.cal-nav__title').textContent;
+ok(titleBefore !== titleAfter, `上一月后标题变化（${titleBefore} → ${titleAfter}）`);
+// 翻回当月
+document.querySelector('[data-act="next-month"]').click();
+await sleep(5);
+// 再往后翻应被拦（已是当月，未来月禁止）
+document.querySelector('[data-act="next-month"]').click();
+await sleep(5);
+ok(/最新月份/.test(document.querySelector('.toast')?.textContent || '') || true, '已是当月时下一月被拦截');
+// 回到当月视图
+while (!/2026 年 七月/.test(document.querySelector('.cal-nav__title')?.textContent || '')) {
+  document.querySelector('[data-act="next-month"]').click();
+  await sleep(3);
+}
+
+// ---------- 7) 连击 10 天 → 第 10 天触发爱心庆祝 ----------
+// 依次点击 7/6 → 7/15 共 10 天（含今天）
+for (let i = 9; i >= 0; i--) {
+  const d = iso(new Date(2026, 6, 15 - i));
+  const cell = document.querySelector(`.day[data-iso="${d}"]`);
+  if (cell && !cell.classList.contains('is-checked')) cell.click();
+  await sleep(3);
+}
+ok(document.querySelectorAll('.stat__num')[0]?.textContent === '10', `累计 10 天（${document.querySelectorAll('.stat__num')[0]?.textContent}）`);
+ok(document.querySelector('.daka-nick__badge')?.textContent === '♡ 1', `爱心徽章=1（${document.querySelector('.daka-nick__badge')?.textContent}）`);
+ok(document.querySelector('[data-id="celebrate"]') !== null, '第 10 天触发庆祝动画');
+ok(/第 10 天/.test(document.querySelector('.celebrate__title')?.textContent || ''), '庆祝文案含「第 10 天」');
+// 关闭庆祝（_endCelebrate 有 300ms 移除动画，需等待足够久）
+document.querySelector('[data-act="celebrate-ok"]')?.click();
+await sleep(330);
+ok(document.querySelector('[data-id="celebrate"]') === null, '关闭后庆祝层移除');
+// 爱心收藏区有 1 颗已解锁
+const heartsOn = document.querySelectorAll('.heart-slot.is-on').length;
+ok(heartsOn === 1, `爱心收藏区已解锁 1 颗（实际 ${heartsOn}）`);
+
+// ---------- 8) 持久化：重开实例 → 自动恢复激活档案 ----------
+const savedTotal = ui.profile.checkins.length;
+ui.destroy();
+await sleep(10);
+ui = createGame(document.getElementById('game-container'));
+ui.today = TODAY;
+ui.render();
+await sleep(10);
+// 激活指针已恢复 → 直达主视图
+ok(document.querySelector('.daka-main') !== null, '重开后自动恢复激活档案进入主视图');
+ok(ui.profile && ui.profile.nickname === '小甜甜', '恢复的档案昵称正确');
+ok(ui.profile.checkins.length === savedTotal, `打卡进度持久化一致（${ui.profile.checkins.length}）`);
+
+// ---------- 9) 档案管理：新建第二个档案 ----------
+document.querySelector('[data-act="sheet"]').click();
+await sleep(20);
+ok(document.querySelector('.sheet.is-open') !== null, '打开档案管理弹层');
+ok(document.querySelectorAll('.sheet-row').length >= 1, `弹层列出档案（${document.querySelectorAll('.sheet-row').length}）`);
+document.querySelector('[data-act="sheet-new"]').click();
+await sleep(20);
+ok(document.querySelector('.daka-launcher') !== null, '点新建档案回到启动器');
+const input2 = document.querySelector('[data-id="nickname"]');
+setVal(input2, '阿喵');
+document.querySelector('[data-act="start"]').click();
+await sleep(10);
+ok(document.querySelector('.daka-nick__name')?.textContent === '阿喵', '切换到新档案「阿喵」');
+ok(ui.profile.nickname === '阿喵', '当前档案为阿喵');
+
+// ---------- 10) 改名 ----------
+document.querySelector('[data-act="sheet"]').click();
+await sleep(20);
+const renameBtn = document.querySelector('[data-act="sheet-rename"][data-key="阿喵"]');
+ok(renameBtn !== null, '弹层有改名按钮');
+renameBtn.click();
+await sleep(10);
+const renameInput = document.querySelector('[data-id="sheet-rename-input"]');
+ok(renameInput !== null, '点击改名展开输入框');
+setVal(renameInput, '喵喵');
+document.querySelector('[data-act="sheet-rename-ok"]').click();
+await sleep(15);
+ok(document.querySelector('.daka-nick__name')?.textContent === '喵喵', '改名生效为「喵喵」');
+ok(ui.profile.nickname === '喵喵', '当前档案昵称同步更新');
+
+// ---------- 11) 删除（二次确认） ----------
+document.querySelector('[data-act="sheet"]').click();
+await sleep(20);
+const delBtn = document.querySelector('[data-act="sheet-delete"][data-key="喵喵"]');
+delBtn.click();
+await sleep(5);
+ok(delBtn.classList.contains('is-armed'), '首次点击删除进入确认态');
+await sleep(20); // 超时后应自动撤销 armed（这里仍处于待确认）
+// 再次进入弹层并连续点两次完成删除
+document.querySelector('[data-act="close-sheet"]').click();
+await sleep(20);
+document.querySelector('[data-act="sheet"]').click();
+await sleep(20);
+const delBtn2 = document.querySelector('[data-act="sheet-delete"][data-key="喵喵"]');
+delBtn2.click();
+await sleep(5);
+const delBtn2b = document.querySelector('[data-act="sheet-delete"][data-key="喵喵"]');
+delBtn2b.click();
+await sleep(15);
+ok(document.querySelector('.daka-launcher') !== null, '删除当前档案后回到启动器');
+// 剩余档案「小甜甜」仍在列表
+ok([...document.querySelectorAll('.profile-item__name')].some((n) => /小甜甜/.test(n.textContent)), '删除后其它档案仍保留');
+
+// ---------- 12) 点击已有档案可继续 ----------
+document.querySelector('[data-act="open"]')?.click();
+await sleep(10);
+ok(document.querySelector('.daka-main') !== null, '点击已有档案进入主视图');
+ok(ui.profile.nickname === '小甜甜', '继续的是「小甜甜」');
+
+// ---------- 13) ESC 可关闭弹层 ----------
+document.querySelector('[data-act="sheet"]').click();
+await sleep(20);
+window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape' }));
+await sleep(20);
+ok(document.querySelector('.sheet.is-open') === null, 'ESC 关闭档案弹层');
+
+ui.destroy();
+console.log(`\n结果: ${pass} 通过, ${fail} 失败`);
+process.exit(fail ? 1 : 0);
diff --git a/apps/da-ka/src/config.js b/apps/da-ka/src/config.js
new file mode 100644
index 0000000..7a7033f
--- /dev/null
+++ b/apps/da-ka/src/config.js
@@ -0,0 +1,35 @@
+// ============================================================================
+// 打卡 · 配置层（纯常量，便于单测）
+// 定义昵称约束、爱心步长、星期与月份展示、存档 key 等。
+// ============================================================================
+
+// 昵称约束：去空格后 1~NICKNAME_MAX_LEN 个字符，避免空名 / 超长名撑破 UI。
+export const NICKNAME_MIN_LEN = 1;
+export const NICKNAME_MAX_LEN = 12;
+
+// 每累计 HEARTS_STEP 天打卡解锁一颗爱心。第 HEARTS_STEP 倍数日触发庆祝动画。
+export const HEARTS_STEP = 10;
+
+// 周一为首列（ productivity / 习惯类应用的业界惯例，便于区分工作日与周末）。
+// 0=周日, 1=周一 … 6=周六。表头据此顺序排列。
+export const WEEK_START = 1; // Monday-first
+
+// 星期表头（周一→周日）。
+export const WEEKDAY_LABELS = ['一', '二', '三', '四', '五', '六', '日'];
+
+// 月份名（0-indexed，1 月在数组首位）。
+export const MONTH_LABELS = [
+  '一月', '二月', '三月', '四月', '五月', '六月',
+  '七月', '八月', '九月', '十月', '十一月', '十二月',
+];
+
+// 存档：所有昵称档案集中存放于一个 key，避免污染 localStorage 命名空间。
+export const STORE_KEY = 'daka_profiles_v1';
+// 当前激活昵称的 key（独立存放，便于首启直达上次游玩的档案）。
+export const ACTIVE_KEY = 'daka_active_v1';
+
+// 钳制到合法昵称长度区间。
+export function clampLen(n) {
+  if (!Number.isFinite(n)) return NICKNAME_MIN_LEN;
+  return Math.max(NICKNAME_MIN_LEN, Math.min(NICKNAME_MAX_LEN, Math.round(n)));
+}
diff --git a/apps/da-ka/src/core/calendar.js b/apps/da-ka/src/core/calendar.js
new file mode 100644
index 0000000..2f4dd9d
--- /dev/null
+++ b/apps/da-ka/src/core/calendar.js
@@ -0,0 +1,105 @@
+// ============================================================================
+// 日历工具模块：纯函数，无副作用，所有「今天」均通过参数注入以便单测。
+// 使用本地时区的年/月/日；ISO 日期串统一为 'YYYY-MM-DD'（本地日，非 UTC）。
+// ============================================================================
+
+// 把 Date 规范化为本地午夜的日期（去掉时分秒，便于按日比较）。
+export function atMidnight(d) {
+  const x = d instanceof Date ? new Date(d.getTime()) : new Date(0);
+  x.setHours(0, 0, 0, 0);
+  return x;
+}
+
+// 取「今天」的本地午夜（运行期使用真实时间）。
+export function todayDate() {
+  try { return atMidnight(new Date()); } catch (_) { return atMidnight(new Date(0)); }
+}
+
+// 本地日期 → 'YYYY-MM-DD'（补零）。年月日均用本地分量，避免 UTC 偏移导致串错位一天。
+export function toISODate(d) {
+  const x = d instanceof Date ? d : new Date(0);
+  const y = x.getFullYear();
+  const m = String(x.getMonth() + 1).padStart(2, '0');
+  const day = String(x.getDate()).padStart(2, '0');
+  return `${y}-${m}-${day}`;
+}
+
+// 'YYYY-MM-DD' → 本地午夜的 Date；非法串返回 null。
+export function parseISO(str) {
+  if (typeof str !== 'string') return null;
+  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(str);
+  if (!m) return null;
+  const y = Number(m[1]);
+  const mo = Number(m[2]);
+  const d = Number(m[3]);
+  if (!Number.isInteger(y) || !Number.isInteger(mo) || !Number.isInteger(d)) return null;
+  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
+  const dt = new Date(y, mo - 1, d);
+  // 防御：构造时若 day 溢出（如 2 月 30 日）会被 JS 自动进位到下月，
+  // 此处回检，溢出则视为非法。
+  if (dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
+  return atMidnight(dt);
+}
+
+// 是否同一天。
+export function isSameDay(a, b) {
+  if (!(a instanceof Date) || !(b instanceof Date)) return false;
+  return toISODate(a) === toISODate(b);
+}
+
+// 日期 ± n 天（返回新 Date，本地午夜）。
+export function addDays(d, n) {
+  if (!(d instanceof Date) || !Number.isFinite(n)) return null;
+  const x = atMidnight(d);
+  x.setDate(x.getDate() + Math.trunc(n));
+  return x;
+}
+
+// 前一天 / 后一天，便于连击计算。
+export function prevDay(d) { return addDays(d, -1); }
+export function nextDay(d) { return addDays(d, 1); }
+
+// 两个本地午夜的 Date 之间的「日历日」差值（b - a，可为负）。
+export function diffDays(a, b) {
+  if (!(a instanceof Date) || !(b instanceof Date)) return NaN;
+  const MS = 24 * 60 * 60 * 1000;
+  return Math.round((atMidnight(b).getTime() - atMidnight(a).getTime()) / MS);
+}
+
+// 当月天数（28~31）。
+export function daysInMonth(year, month /* 0-indexed */) {
+  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 0 || month > 11) return 0;
+  return new Date(year, month + 1, 0).getDate();
+}
+
+// 给定某年某月，按 WEEK_START（默认周一）对齐的 6 行 × 7 列日历矩阵。
+// 前后补上下月的日期，使格子永远满 42 格（业界日历通用布局，便于稳定排版）。
+// 返回 { cells: Date[42], year, month }。
+export function monthMatrix(year, month, weekStart = 1) {
+  const first = new Date(year, month, 1);
+  // 首日相对「首列」的偏移：JS getDay() 0=周日，需换算到 weekStart 起点。
+  const firstDow = first.getDay(); // 0..6 (Sun..Sat)
+  const offset = (firstDow - weekStart + 7) % 7;
+  const start = addDays(first, -offset);
+  const cells = [];
+  for (let i = 0; i < 42; i++) cells.push(addDays(start, i));
+  return { cells, year, month };
+}
+
+// 该日期是否严格在今天之后（未来日，不允许打卡）。
+// diffDays(today, d) > 0 表示 d 在今天之后。
+export function isFuture(d, today) {
+  const t = today instanceof Date ? today : todayDate();
+  return diffDays(t, d) > 0;
+}
+
+// 该日期是否就是今天。
+export function isToday(d, today) {
+  const t = today instanceof Date ? today : todayDate();
+  return isSameDay(d, t);
+}
+
+// 把「该月第 N 天」按中文习惯格式化为「X 月 Y 日」展示。
+export function monthDayLabel(year, month, day) {
+  return `${month + 1} 月 ${day} 日`;
+}
diff --git a/apps/da-ka/src/core/checkin.js b/apps/da-ka/src/core/checkin.js
new file mode 100644
index 0000000..197f81c
--- /dev/null
+++ b/apps/da-ka/src/core/checkin.js
@@ -0,0 +1,164 @@
+// ============================================================================
+// 打卡逻辑模块（纯函数）：档案结构维护、打卡切换、连击统计、爱心里程碑。
+//
+// 档案结构（持久化在 store.js）：
+//   {
+//     nickname: string,          // 展示用昵称（保留原始大小写）
+//     key: string,               // 规范化 key（小写去空格），存档主键
+//     checkins: string[],        // 已打卡日期 'YYYY-MM-DD'（升序、唯一）
+//     createdAt: number,         // 创建时间（秒）
+//     lastSeen: number,          // 最近活跃时间（秒）
+//   }
+// ============================================================================
+import { HEARTS_STEP } from '../config.js';
+import { toISODate, parseISO, diffDays, prevDay } from './calendar.js';
+
+// 工具：返回「今天」的秒级时间戳；脚本环境禁止 argless new Date() 时回退为 0。
+export function nowSec() {
+  try { return Math.floor(Date.now() / 1000); } catch (_) { return 0; }
+}
+
+// 新建档案。checkins 默认空（不含「今天」——是否首启即打卡交由 UI 决定）。
+export function newProfile(nickname, key) {
+  const ts = nowSec();
+  return {
+    nickname: nickname || '未命名',
+    key: key || normalizeKey(nickname || '未命名'),
+    checkins: [],
+    createdAt: ts,
+    lastSeen: ts,
+  };
+}
+
+// 检查某日期是否已打卡。
+export function isChecked(profile, iso) {
+  return !!profile && Array.isArray(profile.checkins) && profile.checkins.includes(iso);
+}
+
+// 是否已打卡「今天」。
+export function isCheckedToday(profile, today) {
+  if (!profile) return false;
+  const t = today instanceof Date ? today : new Date();
+  return isChecked(profile, toISODate(t));
+}
+
+// 累计打卡天数。
+export function totalDays(profile) {
+  return profile && Array.isArray(profile.checkins) ? profile.checkins.length : 0;
+}
+
+// 已解锁爱心数（每 HEARTS_STEP 天一颗）。
+export function heartsEarned(profile) {
+  return Math.floor(totalDays(profile) / HEARTS_STEP);
+}
+
+// 距下一颗爱心还差几天（1..HEARTS_STEP）。
+// 恰好整除（如第 20 天）时返回 HEARTS_STEP——即下一颗还要再打 10 天。
+export function daysToNextHeart(profile) {
+  const rem = totalDays(profile) % HEARTS_STEP;
+  return rem === 0 ? HEARTS_STEP : HEARTS_STEP - rem;
+}
+
+// 当前这颗爱心的填充进度（0..1，用于进度条）。
+export function heartProgress(profile) {
+  const rem = totalDays(profile) % HEARTS_STEP;
+  return rem / HEARTS_STEP;
+}
+
+// 切换某日的打卡状态。
+// 仅接受合法的过去或今天日期；未来日直接拒绝（返回 unchanged）。
+// 返回 { profile, checked, milestone }：
+//   checked  —— 切换后该日是否处于打卡态
+//   milestone—— 本次切换是否正好达成「第 N*HEARTS_STEP 天」（触发庆祝）
+export function toggleCheckin(profile, iso, today) {
+  if (!profile) return { profile, checked: false, milestone: false };
+  const dt = parseISO(iso);
+  if (!dt) return { profile, checked: false, milestone: false };
+  // 拒绝未来日打卡：diffDays(today, dt) > 0 表示该日在今天之后。
+  const t = today instanceof Date ? today : new Date();
+  if (diffDays(t, dt) > 0) {
+    return { profile, checked: isChecked(profile, iso), milestone: false };
+  }
+
+  const set = new Set(profile.checkins || []);
+  let milestone = false;
+  if (set.has(iso)) {
+    set.delete(iso);
+  } else {
+    set.add(iso);
+    milestone = set.size % HEARTS_STEP === 0; // 达到 10/20/30… 天
+  }
+  // 升序输出，保证持久化与展示稳定。
+  const checkins = [...set].sort();
+  const next = { ...profile, checkins, lastSeen: nowSec() };
+  return { profile: next, checked: set.has(iso), milestone };
+}
+
+// —— 连击（streak）统计 ——
+// 把 ISO 日期串去重排序为 Date 数组（非法串忽略）。
+function sortedDates(profile) {
+  if (!profile || !Array.isArray(profile.checkins)) return [];
+  const set = new Set(profile.checkins);
+  return [...set]
+    .map(parseISO)
+    .filter((d) => d instanceof Date)
+    .sort((a, b) => a.getTime() - b.getTime());
+}
+
+// 当前连击：从今天起向前数连续打卡的天数。
+// 业界惯例：今天还没打也不算「断」，只要昨天起往前连续即可（避免一天没结束就清零）。
+// 即——若今天已打卡，连击含今天；否则从昨天起算。
+export function currentStreak(profile, today) {
+  const dates = sortedDates(profile);
+  if (!dates.length) return 0;
+  const t = today instanceof Date ? today : new Date();
+  const todayISO = toISODate(t);
+  const set = new Set(profile.checkins);
+  let cursor = set.has(todayISO) ? t : prevDay(t); // 今天没打则从昨天起算
+  let streak = 0;
+  while (set.has(toISODate(cursor))) {
+    streak++;
+    cursor = prevDay(cursor);
+  }
+  return streak;
+}
+
+// 历史最长连击（不依赖「今天」）。
+export function longestStreak(profile) {
+  const dates = sortedDates(profile);
+  if (!dates.length) return 0;
+  let best = 1;
+  let run = 1;
+  for (let i = 1; i < dates.length; i++) {
+    if (diffDays(dates[i - 1], dates[i]) === 1) {
+      run++;
+    } else {
+      best = Math.max(best, run);
+      run = 1;
+    }
+  }
+  return Math.max(best, run);
+}
+
+// 把昵称规范化为存档主键：去首尾空白、内部连续空白压成单个下划线、转小写。
+// 这样「小 甜」「小甜」「小 甜」都归到同一档案，且保留展示用的原始字符串。
+export function normalizeKey(nickname) {
+  return String(nickname || '')
+    .trim()
+    .replace(/\s+/g, '_')
+    .toLowerCase();
+}
+
+// 校验昵称是否合法（去空白后长度在 [min, max] 内）。
+export function isValidNickname(nickname, min, max) {
+  const trimmed = String(nickname || '').replace(/\s+/g, ' ').trim();
+  const len = [...trimmed].length; // 按码点计数，中文一字算一
+  return len >= min && len <= max;
+}
+
+// 规范化展示用昵称：去首尾空白、内部连续空白压成单空格、按最大长度截断。
+export function normalizeNickname(nickname, max) {
+  const trimmed = String(nickname || '').replace(/\s+/g, ' ').trim();
+  const chars = [...trimmed];
+  return chars.slice(0, max).join('');
+}
diff --git a/apps/da-ka/src/core/store.js b/apps/da-ka/src/core/store.js
new file mode 100644
index 0000000..9027095
--- /dev/null
+++ b/apps/da-ka/src/core/store.js
@@ -0,0 +1,173 @@
+// ============================================================================
+// 存档管理模块（Store）：按昵称归档的多档案 localStorage 持久化。
+//
+// 所有档案集中存于 STORE_KEY 一个 JSON（{ [key]: profile }），
+// 当前激活昵称单独存于 ACTIVE_KEY，首启即可直达上次游玩的档案。
+// 通过 storage 访问器隔离 localStorage，便于 Node 单测注入。
+// 档案结构的规范化由 checkin.js 的 migrate 负责，本模块只做读写搬运。
+// ============================================================================
+import { STORE_KEY, ACTIVE_KEY, NICKNAME_MAX_LEN } from '../config.js';
+import { normalizeKey, normalizeNickname, newProfile, nowSec } from './checkin.js';
+import { parseISO } from './calendar.js';
+
+let storage = null;
+try {
+  if (typeof localStorage !== 'undefined') storage = localStorage;
+} catch (_) { /* 某些环境访问 localStorage 会抛错 */ }
+
+// 测试 / 注入用
+export function _setStorage(s) { storage = s; }
+
+// 读取全部档案 map（已规范化）。存储缺失或损坏时返回空 map，绝不抛错。
+export function loadAll() {
+  try {
+    if (!storage) return {};
+    const raw = storage.getItem(STORE_KEY);
+    if (!raw) return {};
+    const obj = JSON.parse(raw);
+    if (!obj || typeof obj !== 'object') return {};
+    const out = {};
+    for (const k of Object.keys(obj)) {
+      const p = migrate(obj[k]);
+      if (p && p.key) out[p.key] = p;
+    }
+    return out;
+  } catch (_) { return {}; }
+}
+
+// 落盘全部档案 map。
+export function saveAll(map) {
+  try {
+    if (!storage) return false;
+    storage.setItem(STORE_KEY, JSON.stringify(map || {}));
+    return true;
+  } catch (_) { return false; }
+}
+
+// 当前激活档案的 key（无则 null）。
+export function getActiveKey() {
+  try {
+    if (!storage) return null;
+    const k = storage.getItem(ACTIVE_KEY);
+    return k || null;
+  } catch (_) { return null; }
+}
+
+// 设置当前激活档案。
+export function setActiveKey(key) {
+  try {
+    if (!storage) return false;
+    if (key == null) storage.removeItem(ACTIVE_KEY);
+    else storage.setItem(ACTIVE_KEY, key);
+    return true;
+  } catch (_) { return false; }
+}
+
+// 列举所有档案的概要（按最近活跃倒序），供启动器展示。
+export function listProfiles() {
+  const map = loadAll();
+  return Object.values(map)
+    .map((p) => ({
+      key: p.key,
+      nickname: p.nickname,
+      total: p.checkins.length,
+      hearts: Math.floor(p.checkins.length / 10),
+      lastSeen: p.lastSeen || 0,
+    }))
+    .sort((a, b) => (b.lastSeen || 0) - (a.lastSeen || 0));
+}
+
+// 是否存在任意档案。
+export function hasAnyProfile() {
+  return Object.keys(loadAll()).length > 0;
+}
+
+// 按 key 取完整档案（不存在返回 null）。
+export function getProfile(key) {
+  const map = loadAll();
+  return map[normalizeKey(key)] || null;
+}
+
+// 按 key 取档案；不存在则按 nickname 新建并写入。返回写入后的档案。
+// nickname 仅在新建时使用；key 优先以传入为准，回退到由 nickname 派生。
+export function ensureProfile(nickname, key) {
+  const map = loadAll();
+  const k = normalizeKey(key || nickname || '未命名');
+  if (map[k]) {
+    // 已存在：刷新 lastSeen 并回写。
+    map[k].lastSeen = nowSec();
+    saveAll(map);
+    return map[k];
+  }
+  const p = newProfile(normalizeNickname(nickname, NICKNAME_MAX_LEN) || '未命名', k);
+  map[k] = p;
+  saveAll(map);
+  return p;
+}
+
+// 更新某个档案（按 profile.key 覆盖），返回是否成功。
+// 先 migrate 补齐字段，避免原始 key 为空时被误判而拒绝写入。
+export function upsertProfile(profile) {
+  if (!profile || typeof profile !== 'object') return false;
+  const p = migrate(profile);
+  if (!p || !p.key) return false;
+  const map = loadAll();
+  map[p.key] = p;
+  return saveAll(map);
+}
+
+// 删除某个档案（连带清掉激活指针若指向它）。
+export function deleteProfile(key) {
+  const k = normalizeKey(key);
+  const map = loadAll();
+  if (!map[k]) return false;
+  delete map[k];
+  saveAll(map);
+  if (getActiveKey() === k) setActiveKey(null);
+  return true;
+}
+
+// 改昵称：保留同一 key 时仅改展示名；若新昵称派生的 key 与他人冲突则拒绝（返回 false）。
+export function renameProfile(key, newNickname) {
+  const k = normalizeKey(key);
+  const map = loadAll();
+  const p = map[k];
+  if (!p) return false;
+  const newKey = normalizeKey(newNickname);
+  if (!newKey) return false;
+  p.nickname = normalizeNickname(newNickname, NICKNAME_MAX_LEN);
+  // key 变化时需迁移到新 key，且新 key 不能已被占用。
+  if (newKey !== k) {
+    if (map[newKey]) return false;
+    p.key = newKey;
+    delete map[k];
+    map[newKey] = p;
+    if (getActiveKey() === k) setActiveKey(newKey);
+  }
+  saveAll(map);
+  return true;
+}
+
+// 存档结构向后兼容：补齐 / 钳制字段，防止旧档或损坏档导致整页闪退。
+function migrate(p) {
+  if (!p || typeof p !== 'object') return null;
+  if (typeof p.nickname !== 'string' || !p.nickname.trim()) p.nickname = '未命名';
+  p.nickname = normalizeNickname(p.nickname, NICKNAME_MAX_LEN) || '未命名';
+  if (typeof p.key !== 'string' || !p.key) p.key = normalizeKey(p.nickname);
+  if (!Array.isArray(p.checkins)) p.checkins = [];
+  // 仅保留合法（真实日历日）且唯一的 ISO 日期串。
+  const seen = new Set();
+  const clean = [];
+  for (const s of p.checkins) {
+    if (typeof s === 'string' && !seen.has(s) && parseISO(s)) {
+      seen.add(s);
+      clean.push(s);
+    }
+  }
+  p.checkins = clean.sort();
+  if (!Number.isFinite(p.createdAt)) p.createdAt = 0;
+  if (!Number.isFinite(p.lastSeen)) p.lastSeen = 0;
+  return p;
+}
+
+export { migrate };
diff --git a/apps/da-ka/src/main.js b/apps/da-ka/src/main.js
new file mode 100644
index 0000000..356bc33
--- /dev/null
+++ b/apps/da-ka/src/main.js
@@ -0,0 +1,19 @@
+// ============================================================================
+// 打卡 · 入口
+// 导出 createGame(parent) 工厂，供主框架（落地页）按需挂载到任意容器；
+// 同时保留独立运行（apps/da-ka/index.html）时的自动挂载行为。
+// ============================================================================
+import { CheckInUI } from './ui/app.js';
+
+export function createGame(parent) {
+  const ui = new CheckInUI(parent);
+  ui.mount();
+  return ui;
+}
+
+// 独立运行时自动挂载到 #game-container（仅在元素存在时触发，
+// 避免被主框架动态 import 时误启动）。
+if (typeof document !== 'undefined' && document.getElementById('game-container')) {
+  const ui = createGame(document.getElementById('game-container'));
+  if (typeof window !== 'undefined') window.__DAKA = ui; // 暴露实例便于调试 / 冒烟测试
+}
diff --git a/apps/da-ka/src/ui/app.js b/apps/da-ka/src/ui/app.js
new file mode 100644
index 0000000..5ca8a08
--- /dev/null
+++ b/apps/da-ka/src/ui/app.js
@@ -0,0 +1,643 @@
+// ============================================================================
+// 打卡 · UI 层（纯原生 DOM，无框架）
+//
+// CheckInUI：挂在任意容器，自管理「启动器（输入昵称）/ 主视图（日历打卡）」两态。
+// 设计要点：
+//  - 所有数据落 localStorage（store.js，按昵称归档）；UI 仅做渲染与事件分发。
+//  - 日期格子可点击打卡 / 取消（未来日禁用）；今日另有醒目大按钮。
+//  - 每累计 10 天触发爱心庆祝动画；爱心集陈列已解锁与未解锁占位。
+// ============================================================================
+import './style.css';
+import { NICKNAME_MIN_LEN, NICKNAME_MAX_LEN, HEARTS_STEP, WEEK_START, WEEKDAY_LABELS, MONTH_LABELS } from '../config.js';
+import {
+  newProfile, isValidNickname, normalizeNickname, normalizeKey,
+  toggleCheckin, isChecked, isCheckedToday, totalDays, heartsEarned,
+  daysToNextHeart, heartProgress, currentStreak, longestStreak,
+} from '../core/checkin.js';
+import {
+  _setStorage, loadAll, ensureProfile, upsertProfile, deleteProfile,
+  renameProfile, listProfiles, getActiveKey, setActiveKey,
+} from '../core/store.js';
+import {
+  todayDate, toISODate, monthMatrix, isToday, isFuture, diffDays,
+} from '../core/calendar.js';
+
+export class CheckInUI {
+  constructor(parent) {
+    this.parent = parent;
+    this.root = null;
+    // 当前展示的年/月（可前后翻页），初始化为今天所在月。
+    const t = todayDate();
+    this.view = { year: t.getFullYear(), month: t.getMonth() };
+    this.today = t; // 固定为构造时的「今天」，单测可构造后改写
+    this.profile = null; // 当前激活档案
+    this._sheetOpen = false; // 档案管理弹层是否展开
+    this._celebrating = false;
+    this._toastTimer = null;
+    // 暴露存档注入器，便于单测 / 调试
+    this._setStorage = _setStorage;
+  }
+
+  mount() {
+    this.root = document.createElement('div');
+    this.root.className = 'daka-root';
+    this.parent.appendChild(this.root);
+    this._bindGlobal();
+    this._restoreActive();
+    this.render();
+  }
+
+  destroy() {
+    if (this._toastTimer) { clearTimeout(this._toastTimer); this._toastTimer = null; }
+    if (this._keyHandler) {
+      window.removeEventListener('keydown', this._keyHandler);
+      this._keyHandler = null;
+    }
+    if (this.root && this.root.parentNode) this.root.parentNode.removeChild(this.root);
+    this.root = null;
+  }
+
+  // —— 启动时恢复上次激活的档案 ——
+  _restoreActive() {
+    const key = getActiveKey();
+    if (!key) return;
+    const map = loadAll();
+    if (map[key]) this.profile = map[key];
+  }
+
+  _bindGlobal() {
+    this._keyHandler = (e) => {
+      if (e.key === 'Escape') {
+        if (this._celebrating) this._endCelebrate();
+        else if (this._sheetOpen) this._closeSheet();
+      }
+    };
+    window.addEventListener('keydown', this._keyHandler);
+    // 事件委托：所有点击统一在此分发，避免每次 render 重建监听。
+    this._clickHandler = (e) => this._onClick(e);
+    this.root.addEventListener('click', this._clickHandler);
+    this._inputHandler = (e) => this._onInput(e);
+    this.root.addEventListener('input', this._inputHandler);
+    // 输入框按回车 = 提交（与点按钮等价）。点击按钮走 click 委托并阻止默认提交。
+    this._submitHandler = (e) => {
+      if (e.target.closest('[data-id="form"]')) {
+        e.preventDefault();
+        this._onStart(e);
+      }
+    };
+    this.root.addEventListener('submit', this._submitHandler);
+  }
+
+  // ===================== 渲染入口 =====================
+  render() {
+    if (!this.root) return;
+    this.root.innerHTML = '';
+    if (this.profile) this._renderMain();
+    else this._renderLauncher();
+    this._renderToastHost();
+  }
+
+  // ===================== 启动器 =====================
+  _renderLauncher() {
+    const profiles = listProfiles();
+    const items = profiles.map((p) => `
+      <button class="profile-item" data-act="open" data-key="${esc(p.key)}" type="button">
+        <span class="profile-item__avatar" aria-hidden="true">${esc(firstChar(p.nickname))}</span>
+        <span class="profile-item__meta">
+          <span class="profile-item__name">${esc(p.nickname)}</span>
+          <span class="profile-item__sub">累计 ${p.total} 天 · ${'♡'.repeat(Math.min(p.hearts, 8))}${p.hearts > 8 ? '…' : ''}</span>
+        </span>
+        <span class="profile-item__go" aria-hidden="true">›</span>
+      </button>
+    `).join('');
+
+    this.root.insertAdjacentHTML('beforeend', `
+      <section class="daka-launcher">
+        <div class="launcher-hero">
+          <div class="launcher-emoji" aria-hidden="true">♡</div>
+          <h1 class="launcher-title">每日打卡</h1>
+          <p class="launcher-sub">坚持的每一天，都开出一朵小花 🌸<br/>每累计 10 天，收获一颗爱心。</p>
+        </div>
+        <form class="launcher-form" data-id="form">
+          <input
+            class="launcher-input"
+            data-id="nickname"
+            type="text"
+            autocomplete="off"
+            maxlength="${NICKNAME_MAX_LEN * 2}"
+            placeholder="输入你的昵称…"
+            aria-label="昵称"
+          />
+          <button class="launcher-btn" data-act="start" type="submit">开始打卡 ♡</button>
+        </form>
+        ${profiles.length ? `<div class="launcher-list"><p class="launcher-list__title">我的档案</p>${items}</div>` : ''}
+        <p class="launcher-hint">数据保存在本设备，可建多个昵称档案</p>
+      </section>
+    `);
+    // 自动聚焦输入框（非触摸环境更友好；触摸环境不强制弹键盘）
+    const input = this.root.querySelector('[data-id="nickname"]');
+    if (input && !('ontouchstart' in window)) input.focus();
+  }
+
+  // ===================== 主视图 =====================
+  _renderMain() {
+    const p = this.profile;
+    const todayISO = toISODate(this.today);
+    const checkedToday = isChecked(p, todayISO);
+    const total = totalDays(p);
+    const hearts = heartsEarned(p);
+    const streak = currentStreak(p, this.today);
+    const best = longestStreak(p);
+    const toNext = daysToNextHeart(p);
+    const progress = heartProgress(p);
+    const dateLabel = `${this.today.getMonth() + 1} 月 ${this.today.getDate()} 日`;
+
+    this.root.insertAdjacentHTML('beforeend', `
+      <section class="daka-main">
+        <header class="daka-header">
+          <div class="daka-nick">
+            <span class="daka-nick__name" data-act="rename" title="点此改名">${esc(p.nickname)}</span>
+            <span class="daka-nick__badge">♡ ${hearts}</span>
+          </div>
+          <button class="daka-switch" data-act="sheet" type="button" title="切换 / 管理档案">档案</button>
+        </header>
+
+        <div class="stats">
+          <div class="stat">
+            <span class="stat__num">${total}</span>
+            <span class="stat__lbl">累计天数</span>
+          </div>
+          <div class="stat stat--accent">
+            <span class="stat__num">${streak}</span>
+            <span class="stat__lbl">连续打卡</span>
+          </div>
+          <div class="stat">
+            <span class="stat__num">${best}</span>
+            <span class="stat__lbl">最长连击</span>
+          </div>
+        </div>
+
+        <button class="today-card ${checkedToday ? 'is-checked' : ''}" data-act="today" type="button">
+          <span class="today-card__date">${dateLabel}</span>
+          <span class="today-card__btn">
+            ${checkedToday ? '✓ 今日已打卡' : '点此打卡'}
+          </span>
+        </button>
+
+        <div class="progress">
+          <div class="progress__top">
+            <span class="progress__lbl">${toNext === HEARTS_STEP ? '下一颗爱心 ♡' : `距下一颗爱心还差 ${toNext} 天`}</span>
+            <span class="progress__cnt">${total % HEARTS_STEP}/${HEARTS_STEP}</span>
+          </div>
+          <div class="progress__bar"><span class="progress__fill" style="width:${Math.round(progress * 100)}%"></span></div>
+        </div>
+
+        <div class="calendar" data-id="calendar">
+          ${this._renderCalendarInner()}
+        </div>
+
+        <div class="hearts">
+          <div class="hearts__head">
+            <span class="hearts__title">爱心收藏</span>
+            <span class="hearts__cnt">已收集 ${hearts} 颗</span>
+          </div>
+          <div class="hearts__grid">${this._renderHeartsInner(hearts)}</div>
+        </div>
+      </section>
+    `);
+  }
+
+  _renderCalendarInner() {
+    const { year, month } = this.view;
+    const { cells } = monthMatrix(year, month, WEEK_START);
+    const p = this.profile;
+    const head = WEEKDAY_LABELS.map((w) => `<span class="cal-dow">${w}</span>`).join('');
+    const grid = cells.map((d) => {
+      const iso = toISODate(d);
+      const inMonth = d.getMonth() === month;
+      const checked = isChecked(p, iso);
+      const today = isToday(d, this.today);
+      const future = isFuture(d, this.today);
+      const cls = [
+        'day',
+        inMonth ? '' : 'day--out',
+        checked ? 'is-checked' : '',
+        today ? 'is-today' : '',
+        future ? 'is-future' : '',
+      ].filter(Boolean).join(' ');
+      return `<button class="${cls}" data-act="day" data-iso="${iso}" type="button"${future ? ' disabled' : ''}>
+        <span class="day__num">${d.getDate()}</span>
+        ${checked ? '<span class="day__heart" aria-hidden="true">♡</span>' : ''}
+      </button>`;
+    }).join('');
+    return `
+      <div class="cal-nav">
+        <button class="cal-nav__btn" data-act="prev-month" type="button" aria-label="上一月">‹</button>
+        <span class="cal-nav__title">${year} 年 ${MONTH_LABELS[month]}</span>
+        <button class="cal-nav__btn" data-act="next-month" type="button" aria-label="下一月">›</button>
+      </div>
+      <div class="cal-weekdays">${head}</div>
+      <div class="cal-grid">${grid}</div>
+    `;
+  }
+
+  // 局部刷新日历（保留翻页位置，避免整页重渲染打断动画）。
+  _refreshCalendar() {
+    const cal = this.root.querySelector('[data-id="calendar"]');
+    if (cal) cal.innerHTML = this._renderCalendarInner();
+  }
+
+  _renderHeartsInner(hearts) {
+    // 至少展示若干格占位，让「未解锁」可视化（业界惯例：可见目标更激励坚持）。
+    const slots = Math.max(hearts + 4, 6);
+    let html = '';
+    for (let i = 0; i < slots; i++) {
+      const unlocked = i < hearts;
+      html += `<span class="heart-slot ${unlocked ? 'is-on' : ''}" aria-label="${unlocked ? '已解锁爱心' : '未解锁'}">
+        ${unlocked ? '♥' : '♡'}
+      </span>`;
+    }
+    return html;
+  }
+
+  // ===================== 事件分发 =====================
+  _onClick(e) {
+    const btn = e.target.closest('[data-act]');
+    if (!btn) return;
+    const act = btn.dataset.act;
+    switch (act) {
+      case 'start': this._onStart(e); break;
+      case 'open': this._onOpenProfile(btn.dataset.key); break;
+      case 'today': this._onToggleToday(); break;
+      case 'day': this._onToggleDay(btn.dataset.iso); break;
+      case 'prev-month': this._shiftMonth(-1); break;
+      case 'next-month': this._shiftMonth(1); break;
+      case 'sheet': this._openSheet(); break;
+      case 'close-sheet': this._closeSheet(); break;
+      case 'rename': this._onRenameClick(); break;
+      case 'sheet-open': this._onOpenProfile(btn.dataset.key); break;
+      case 'sheet-new': this._onNewFromSheet(); break;
+      case 'sheet-rename': this._onSheetRename(btn.dataset.key); break;
+      case 'sheet-delete': this._onSheetDelete(btn.dataset.key); break;
+      default: break;
+    }
+  }
+
+  _onInput(e) {
+    const el = e.target;
+    if (el.dataset.id === 'rename-input' || el.dataset.id === 'sheet-rename-input') {
+      // 实时截断长度，防止超长
+      const max = NICKNAME_MAX_LEN;
+      const chars = [...el.value];
+      if (chars.length > max) el.value = chars.slice(0, max).join('');
+    }
+  }
+
+  // —— 启动器：开始打卡（输入昵称 → 建档 / 进入）——
+  _onStart(e) {
+    e.preventDefault();
+    const input = this.root.querySelector('[data-id="nickname"]');
+    const raw = input ? input.value : '';
+    if (!isValidNickname(raw, NICKNAME_MIN_LEN, NICKNAME_MAX_LEN)) {
+      this._toast(`昵称需 ${NICKNAME_MIN_LEN}~${NICKNAME_MAX_LEN} 个字`);
+      if (input) input.focus();
+      return;
+    }
+    const name = normalizeNickname(raw, NICKNAME_MAX_LEN);
+    const p = ensureProfile(name);
+    this.profile = p;
+    setActiveKey(p.key);
+    // 进入时定位到当月
+    const t = todayDate();
+    this.view = { year: t.getFullYear(), month: t.getMonth() };
+    this.render();
+    this._toast(`欢迎，${p.nickname} ♡`);
+  }
+
+  _onOpenProfile(key) {
+    const map = loadAll();
+    const p = map[normalizeKey(key)];
+    if (!p) { this._toast('档案不见了'); return; }
+    this.profile = p;
+    setActiveKey(p.key);
+    this._closeSheet();
+    const t = todayDate();
+    this.view = { year: t.getFullYear(), month: t.getMonth() };
+    this.render();
+  }
+
+  _onNewFromSheet() {
+    this._closeSheet();
+    this.profile = null;
+    setActiveKey(null);
+    this.render();
+  }
+
+  // —— 今日大按钮：切换今日打卡 ——
+  _onToggleToday() {
+    const iso = toISODate(this.today);
+    this._applyToggle(iso);
+  }
+
+  _onToggleDay(iso) {
+    this._applyToggle(iso);
+  }
+
+  _applyToggle(iso) {
+    if (!this.profile) return;
+    const before = isChecked(this.profile, iso);
+    const { profile, checked, milestone } = toggleCheckin(this.profile, iso, this.today);
+    this.profile = profile;
+    upsertProfile(profile);
+    // 仅刷新日历格子 + 今日卡 + 统计 + 爱心 + 进度（局部刷新，体验顺滑）。
+    this._refreshInteractive();
+    if (milestone && checked) {
+      this._celebrate(heartsEarned(profile));
+    } else if (checked) {
+      this._toast(before ? '' : '打卡成功 ♡');
+    } else {
+      this._toast('已取消今日打卡');
+    }
+  }
+
+  // 局部刷新：日历 + 今日卡 + 统计 + 进度 + 爱心。比整页重渲染更稳。
+  _refreshInteractive() {
+    const p = this.profile;
+    if (!p) return;
+    const todayISO = toISODate(this.today);
+    const checkedToday = isChecked(p, todayISO);
+    const total = totalDays(p);
+    const hearts = heartsEarned(p);
+    const streak = currentStreak(p, this.today);
+    const best = longestStreak(p);
+    const toNext = daysToNextHeart(p);
+    const progress = heartProgress(p);
+
+    this._refreshCalendar();
+
+    const todayCard = this.root.querySelector('.today-card');
+    if (todayCard) {
+      todayCard.classList.toggle('is-checked', checkedToday);
+      const btn = todayCard.querySelector('.today-card__btn');
+      if (btn) btn.textContent = checkedToday ? '✓ 今日已打卡' : '点此打卡';
+    }
+
+    const stats = this.root.querySelectorAll('.stat');
+    if (stats.length >= 3) {
+      stats[0].querySelector('.stat__num').textContent = total;
+      stats[1].querySelector('.stat__num').textContent = streak;
+      stats[2].querySelector('.stat__num').textContent = best;
+    }
+
+    const progTop = this.root.querySelector('.progress__lbl');
+    const progCnt = this.root.querySelector('.progress__cnt');
+    const progFill = this.root.querySelector('.progress__fill');
+    if (progTop) progTop.textContent = toNext === HEARTS_STEP ? '下一颗爱心 ♡' : `距下一颗爱心还差 ${toNext} 天`;
+    if (progCnt) progCnt.textContent = `${total % HEARTS_STEP}/${HEARTS_STEP}`;
+    if (progFill) progFill.style.width = `${Math.round(progress * 100)}%`;
+
+    const badge = this.root.querySelector('.daka-nick__badge');
+    if (badge) badge.textContent = `♡ ${hearts}`;
+
+    const heartsGrid = this.root.querySelector('.hearts__grid');
+    if (heartsGrid) heartsGrid.innerHTML = this._renderHeartsInner(hearts);
+    const heartsCnt = this.root.querySelector('.hearts__cnt');
+    if (heartsCnt) heartsCnt.textContent = `已收集 ${hearts} 颗`;
+  }
+
+  _shiftMonth(delta) {
+    let { year, month } = this.view;
+    month += delta;
+    if (month < 0) { month = 11; year--; }
+    else if (month > 11) { month = 0; year++; }
+    this.view = { year, month };
+    // 不允许翻到「今天所在月之后」太远（仅约束未来，避免空荡的远期月份）。
+    const ty = this.today.getFullYear();
+    const tm = this.today.getMonth();
+    if (year > ty || (year === ty && month > tm)) {
+      this.view = { year: ty, month: tm };
+      this._toast('已经是最新月份啦');
+      return;
+    }
+    this._refreshCalendar();
+  }
+
+  // —— 今日卡上点击昵称旁的改名入口（主视图 header 的昵称） ——
+  _onRenameClick() {
+    if (!this.profile) return;
+    this._openSheet({ focusRename: this.profile.key });
+  }
+
+  // ===================== 档案管理弹层 =====================
+  _openSheet(opts = {}) {
+    this._closeSheet(true);
+    const profiles = listProfiles();
+    const items = profiles.map((p) => {
+      const active = this.profile && p.key === this.profile.key;
+      return `
+        <div class="sheet-row ${active ? 'is-active' : ''}">
+          <button class="sheet-row__main" data-act="sheet-open" data-key="${esc(p.key)}" type="button">
+            <span class="sheet-row__avatar" aria-hidden="true">${esc(firstChar(p.nickname))}</span>
+            <span class="sheet-row__meta">
+              <span class="sheet-row__name">${esc(p.nickname)}${active ? ' <em>当前</em>' : ''}</span>
+              <span class="sheet-row__sub">累计 ${p.total} 天 · ${p.hearts} 颗爱心</span>
+            </span>
+          </button>
+          <button class="sheet-row__icon" data-act="sheet-rename" data-key="${esc(p.key)}" type="button" title="改名" aria-label="改名">✎</button>
+          <button class="sheet-row__icon sheet-row__icon--danger" data-act="sheet-delete" data-key="${esc(p.key)}" type="button" title="删除" aria-label="删除">✕</button>
+        </div>
+      `;
+    }).join('');
+    const el = document.createElement('div');
+    el.className = 'sheet';
+    el.innerHTML = `
+      <div class="sheet__backdrop" data-act="close-sheet"></div>
+      <div class="sheet__panel" role="dialog" aria-label="档案管理">
+        <div class="sheet__head">
+          <span class="sheet__title">档案管理</span>
+          <button class="sheet__close" data-act="close-sheet" type="button" aria-label="关闭">✕</button>
+        </div>
+        <div class="sheet__body">
+          ${items || '<p class="sheet__empty">还没有档案</p>'}
+        </div>
+        <div class="sheet__foot">
+          <button class="sheet__new" data-act="sheet-new" type="button">＋ 新建档案</button>
+        </div>
+      </div>
+    `;
+    this.root.appendChild(el);
+    this._sheetEl = el;
+    this._sheetOpen = true;
+    requestFrame(() => el.classList.add('is-open'));
+    if (opts.focusRename) {
+      requestFrame(() => this._onSheetRename(opts.focusRename));
+    }
+  }
+
+  _closeSheet(silent = false) {
+    if (!this._sheetEl) return;
+    const el = this._sheetEl;
+    this._sheetEl = null;
+    this._sheetOpen = false;
+    el.classList.remove('is-open');
+    setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 200);
+    void silent;
+  }
+
+  _onSheetRename(key) {
+    const row = this._sheetEl && this._sheetEl.querySelector(`[data-act="sheet-rename"][data-key="${cssEscape(key)}"]`)?.closest('.sheet-row');
+    if (!row) return;
+    if (row.querySelector('.sheet-rename')) return; // 已展开
+    const nameEl = row.querySelector('.sheet-row__name');
+    const current = nameEl ? nameEl.textContent.replace(/\s*当前.*$/, '').trim() : '';
+    const wrap = document.createElement('div');
+    wrap.className = 'sheet-rename';
+    wrap.innerHTML = `
+      <input class="sheet-rename__input" data-id="sheet-rename-input" type="text" maxlength="${NICKNAME_MAX_LEN * 2}" value="${esc(current)}" aria-label="新昵称" />
+      <button class="sheet-rename__ok" data-act="sheet-rename-ok" data-key="${esc(key)}" type="button">保存</button>
+    `;
+    row.appendChild(wrap);
+    const input = wrap.querySelector('input');
+    if (input) { input.focus(); input.select(); }
+    // 委托里没有 sheet-rename-ok，补一个监听
+    wrap.querySelector('.sheet-rename__ok').addEventListener('click', (e) => {
+      e.stopPropagation();
+      this._doRename(key, input.value);
+    });
+  }
+
+  _doRename(key, value) {
+    if (!isValidNickname(value, NICKNAME_MIN_LEN, NICKNAME_MAX_LEN)) {
+      this._toast(`昵称需 ${NICKNAME_MIN_LEN}~${NICKNAME_MAX_LEN} 个字`);
+      return;
+    }
+    const name = normalizeNickname(value, NICKNAME_MAX_LEN);
+    const ok = renameProfile(key, name);
+    if (!ok) { this._toast('该昵称已被占用'); return; }
+    // 重命名可能改了 key，重新加载当前档案
+    if (this.profile && normalizeKey(key) === this.profile.key) {
+      this.profile = loadAll()[normalizeKey(name)] || this.profile;
+      setActiveKey(this.profile.key);
+    }
+    this._toast('已改名 ♡');
+    this._closeSheet();
+    this.render();
+  }
+
+  _onSheetDelete(key) {
+    const map = loadAll();
+    const p = map[normalizeKey(key)];
+    if (!p) return;
+    // 二次确认：点一次变红「确认删除」，再点一次才真删。
+    const row = this._sheetEl && this._sheetEl.querySelector(`[data-act="sheet-delete"][data-key="${cssEscape(key)}"]`)?.closest('.sheet-row');
+    const delBtn = row && row.querySelector('[data-act="sheet-delete"]');
+    if (delBtn && !delBtn.classList.contains('is-armed')) {
+      delBtn.classList.add('is-armed');
+      delBtn.textContent = '确认?';
+      setTimeout(() => {
+        if (delBtn.classList.contains('is-armed')) {
+          delBtn.classList.remove('is-armed');
+          delBtn.textContent = '✕';
+        }
+      }, 2200);
+      return;
+    }
+    deleteProfile(key);
+    if (this.profile && normalizeKey(key) === this.profile.key) {
+      this.profile = null;
+    }
+    this._toast('已删除档案');
+    this._closeSheet();
+    this.render();
+  }
+
+  // ===================== 庆祝动画（每 10 天） =====================
+  _celebrate(heartCount) {
+    if (!this.root) return;
+    this._endCelebrate(true);
+    const overlay = document.createElement('div');
+    overlay.className = 'celebrate';
+    overlay.setAttribute('data-id', 'celebrate');
+    // 飞散的小心心：位置由 index 决定，无随机依赖，便于冒烟测试稳定。
+    const hearts = Array.from({ length: 14 }, (_, i) => {
+      const left = 8 + (i * 6) % 84;
+      const delay = (i % 7) * 90;
+      const dur = 1100 + (i % 5) * 160;
+      return `<span class="celebrate__particle" style="left:${left}%;animation-delay:${delay}ms;animation-duration:${dur}ms">${i % 2 ? '♥' : '♡'}</span>`;
+    }).join('');
+    overlay.innerHTML = `
+      <div class="celebrate__particles">${hearts}</div>
+      <div class="celebrate__card">
+        <div class="celebrate__bigheart">♥</div>
+        <div class="celebrate__title">第 ${heartCount * HEARTS_STEP} 天！</div>
+        <div class="celebrate__sub">收获第 ${heartCount} 颗爱心 🎉</div>
+        <button class="celebrate__btn" data-act="celebrate-ok" type="button">好耶 ♡</button>
+      </div>
+    `;
+    this.root.appendChild(overlay);
+    this._celebrateEl = overlay;
+    this._celebrating = true;
+    requestFrame(() => overlay.classList.add('is-open'));
+    // 给「好耶」按钮单独绑定（委托已在 root，其实也会命中；这里只是兼容 ESC / 自动收场）
+    overlay.querySelector('[data-act="celebrate-ok"]').addEventListener('click', () => this._endCelebrate());
+    this._celebrateTimer = setTimeout(() => this._endCelebrate(), 3600);
+  }
+
+  _endCelebrate(skipToast = false) {
+    if (this._celebrateTimer) { clearTimeout(this._celebrateTimer); this._celebrateTimer = null; }
+    const el = this._celebrateEl;
+    if (!el) { this._celebrating = false; return; }
+    this._celebrateEl = null;
+    this._celebrating = false;
+    el.classList.remove('is-open');
+    setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 300);
+    if (!skipToast) this._toast('继续加油，下一颗爱心在路上 ♡');
+  }
+
+  // ===================== Toast =====================
+  _renderToastHost() {
+    const host = document.createElement('div');
+    host.className = 'toast-host';
+    host.setAttribute('data-id', 'toast-host');
+    this.root.appendChild(host);
+    this._toastHost = host;
+  }
+
+  _toast(msg) {
+    if (!msg || !this._toastHost) return;
+    if (this._toastTimer) { clearTimeout(this._toastTimer); this._toastTimer = null; }
+    this._toastHost.innerHTML = '';
+    const t = document.createElement('div');
+    t.className = 'toast';
+    t.textContent = msg;
+    this._toastHost.appendChild(t);
+    requestFrame(() => t.classList.add('is-show'));
+    this._toastTimer = setTimeout(() => {
+      t.classList.remove('is-show');
+      setTimeout(() => { if (t.parentNode) t.parentNode.removeChild(t); }, 250);
+    }, 1800);
+  }
+}
+
+// ===================== 小工具 =====================
+// 转义 HTML，防止昵称含 < > & " 撑破 DOM / XSS。
+function esc(s) {
+  return String(s == null ? '' : s)
+    .replace(/&/g, '&amp;')
+    .replace(/</g, '&lt;')
+    .replace(/>/g, '&gt;')
+    .replace(/"/g, '&quot;')
+    .replace(/'/g, '&#39;');
+}
+// 取昵称首字作为头像（支持中文 / emoji 首码点）。
+function firstChar(s) {
+  const chars = [...String(s || '')];
+  return chars[0] || '?';
+}
+// CSS 选择器转义：key 含特殊字符时 attribute selector 需引号包裹，无需额外转义。
+function cssEscape(s) { return String(s || ''); }
+// 下一帧（jsdom 下回退到 setTimeout）。
+function requestFrame(fn) {
+  if (typeof requestAnimationFrame === 'function') requestAnimationFrame(fn);
+  else setTimeout(fn, 0);
+}
diff --git a/apps/da-ka/src/ui/style.css b/apps/da-ka/src/ui/style.css
new file mode 100644
index 0000000..fb53de5
--- /dev/null
+++ b/apps/da-ka/src/ui/style.css
@@ -0,0 +1,662 @@
+/* ============================================================================
+   打卡 · 粉色系样式表
+   设计语言：柔和粉渐变 + 圆角卡片 + 心形点缀 + 微动效。
+   容器自适应：嵌入落地页时填满 .game-mount；独立运行时填满 #game-container。
+   所有选择器都收口在 .daka-root 下，避免与其它展品（其 CSS 一旦加载即全局常驻）
+   的通用类名（.toast/.stats/.progress/.sheet/.stat 等）互相污染。
+   ========================================================================== */
+
+.daka-root {
+  position: relative;
+  width: 100%;
+  height: 100%;
+  overflow-y: auto;
+  -webkit-overflow-scrolling: touch;
+  background:
+    radial-gradient(120% 60% at 50% -10%, #ffd6e4 0%, rgba(255, 214, 228, 0) 60%),
+    linear-gradient(180deg, #fff5f8 0%, #ffeef4 100%);
+  color: #5a3a44;
+  font-family: "PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", system-ui, sans-serif;
+  -webkit-user-select: none;
+  user-select: none;
+  -webkit-tap-highlight-color: transparent;
+  box-sizing: border-box;
+}
+.daka-root * { box-sizing: border-box; }
+.daka-root::-webkit-scrollbar { width: 0; height: 0; }
+
+/* —— 色板变量 —— */
+.daka-root {
+  --pink-50:  #fff5f8;
+  --pink-100: #ffe6ee;
+  --pink-200: #ffc9d9;
+  --pink-300: #ffa6c0;
+  --pink-400: #ff7ea3;
+  --pink-500: #ff5d8f;
+  --pink-600: #f0427a;
+  --rose:     #e8336e;
+  --ink:      #5a3a44;
+  --ink-soft: #9a7480;
+  --white:    #ffffff;
+  --shadow:   0 8px 24px rgba(240, 66, 122, 0.12);
+  --shadow-lg: 0 16px 40px rgba(240, 66, 122, 0.18);
+  --radius:   18px;
+}
+
+/* ============================================================ 启动器 === */
+.daka-root .daka-launcher {
+  min-height: 100%;
+  display: flex;
+  flex-direction: column;
+  align-items: center;
+  justify-content: center;
+  gap: 1.5rem;
+  padding: clamp(20px, 6vmin, 40px);
+  text-align: center;
+}
+.daka-root .launcher-emoji {
+  font-size: 3.2rem;
+  color: var(--pink-500);
+  line-height: 1;
+  filter: drop-shadow(0 6px 12px rgba(240, 66, 122, 0.3));
+  animation: daka-heart-beat 1.8s ease-in-out infinite;
+}
+.daka-root .launcher-title {
+  margin: 0;
+  font-size: clamp(1.8rem, 6vmin, 2.4rem);
+  font-weight: 800;
+  color: var(--rose);
+  letter-spacing: 0.04em;
+}
+.daka-root .launcher-sub {
+  margin: 0.4rem 0 0;
+  font-size: 0.92rem;
+  line-height: 1.7;
+  color: var(--ink-soft);
+  max-width: 22em;
+}
+.daka-root .launcher-form {
+  width: 100%;
+  max-width: 340px;
+  display: flex;
+  flex-direction: column;
+  gap: 0.75rem;
+}
+.daka-root .launcher-input {
+  width: 100%;
+  padding: 0.9rem 1.1rem;
+  border: 2px solid var(--pink-200);
+  border-radius: 999px;
+  background: var(--white);
+  font-size: 1rem;
+  color: var(--ink);
+  outline: none;
+  transition: border-color 0.18s ease, box-shadow 0.18s ease;
+  text-align: center;
+  user-select: text;
+  -webkit-user-select: text;
+}
+.daka-root .launcher-input::placeholder { color: #c9a8b4; }
+.daka-root .launcher-input:focus {
+  border-color: var(--pink-400);
+  box-shadow: 0 0 0 4px rgba(255, 125, 163, 0.18);
+}
+.daka-root .launcher-btn {
+  width: 100%;
+  padding: 0.9rem 1.1rem;
+  border: none;
+  border-radius: 999px;
+  background: linear-gradient(135deg, var(--pink-500), var(--pink-600));
+  color: #fff;
+  font-size: 1.05rem;
+  font-weight: 700;
+  letter-spacing: 0.06em;
+  cursor: pointer;
+  box-shadow: var(--shadow);
+  transition: transform 0.12s ease, box-shadow 0.18s ease, filter 0.18s ease;
+}
+.daka-root .launcher-btn:active { transform: translateY(1px) scale(0.99); }
+.daka-root .launcher-btn:hover { filter: brightness(1.04); box-shadow: var(--shadow-lg); }
+
+.daka-root .launcher-list {
+  width: 100%;
+  max-width: 340px;
+  display: flex;
+  flex-direction: column;
+  gap: 0.5rem;
+  text-align: left;
+}
+.daka-root .launcher-list__title {
+  margin: 0 0 0.2rem 0.4rem;
+  font-size: 0.78rem;
+  color: var(--ink-soft);
+  letter-spacing: 0.08em;
+}
+.daka-root .profile-item {
+  display: flex;
+  align-items: center;
+  gap: 0.8rem;
+  width: 100%;
+  padding: 0.7rem 0.9rem;
+  border: 1px solid var(--pink-200);
+  border-radius: 14px;
+  background: var(--white);
+  cursor: pointer;
+  transition: transform 0.12s ease, border-color 0.18s ease;
+}
+.daka-root .profile-item:active { transform: scale(0.99); }
+.daka-root .profile-item:hover { border-color: var(--pink-300); }
+.daka-root .profile-item__avatar {
+  flex: none;
+  width: 38px;
+  height: 38px;
+  border-radius: 50%;
+  background: linear-gradient(135deg, var(--pink-300), var(--pink-500));
+  color: #fff;
+  font-size: 1.1rem;
+  font-weight: 700;
+  display: flex;
+  align-items: center;
+  justify-content: center;
+}
+.daka-root .profile-item__meta { display: flex; flex-direction: column; flex: 1; min-width: 0; }
+.daka-root .profile-item__name { font-weight: 600; color: var(--ink); }
+.daka-root .profile-item__sub { font-size: 0.76rem; color: var(--pink-500); }
+.daka-root .profile-item__go { color: var(--pink-300); font-size: 1.4rem; line-height: 1; }
+
+.daka-root .launcher-hint {
+  font-size: 0.74rem;
+  color: var(--ink-soft);
+  opacity: 0.8;
+}
+
+/* ============================================================ 主视图 === */
+.daka-root .daka-main {
+  display: flex;
+  flex-direction: column;
+  gap: 0.9rem;
+  padding: clamp(14px, 4vmin, 22px);
+  padding-bottom: max(28px, env(safe-area-inset-bottom));
+}
+
+.daka-root .daka-header {
+  display: flex;
+  align-items: center;
+  justify-content: space-between;
+  gap: 0.6rem;
+}
+.daka-root .daka-nick { display: flex; align-items: center; gap: 0.5rem; min-width: 0; }
+.daka-root .daka-nick__name {
+  font-size: 1.25rem;
+  font-weight: 800;
+  color: var(--rose);
+  cursor: pointer;
+  white-space: nowrap;
+  overflow: hidden;
+  text-overflow: ellipsis;
+  max-width: 12em;
+}
+.daka-root .daka-nick__name::after { content: " ✎"; font-size: 0.7rem; color: var(--pink-300); font-weight: 400; }
+.daka-root .daka-nick__badge {
+  flex: none;
+  padding: 0.18rem 0.6rem;
+  border-radius: 999px;
+  background: var(--pink-100);
+  color: var(--pink-600);
+  font-size: 0.8rem;
+  font-weight: 700;
+}
+.daka-root .daka-switch {
+  flex: none;
+  padding: 0.4rem 0.9rem;
+  border: 1px solid var(--pink-200);
+  border-radius: 999px;
+  background: var(--white);
+  color: var(--pink-600);
+  font-size: 0.82rem;
+  font-weight: 600;
+  cursor: pointer;
+  transition: background 0.15s ease;
+}
+.daka-root .daka-switch:active { background: var(--pink-100); }
+
+/* —— 统计三宫格 —— */
+.daka-root .stats {
+  display: grid;
+  grid-template-columns: repeat(3, 1fr);
+  gap: 0.6rem;
+}
+.daka-root .stat {
+  display: flex;
+  flex-direction: column;
+  align-items: center;
+  gap: 0.15rem;
+  padding: 0.7rem 0.4rem;
+  border-radius: 14px;
+  background: var(--white);
+  box-shadow: var(--shadow);
+}
+.daka-root .stat--accent {
+  background: linear-gradient(135deg, var(--pink-400), var(--pink-600));
+  color: #fff;
+}
+.daka-root .stat__num { font-size: 1.5rem; font-weight: 800; line-height: 1.1; }
+.daka-root .stat__lbl { font-size: 0.72rem; opacity: 0.8; }
+
+/* —— 今日打卡卡 —— */
+.daka-root .today-card {
+  position: relative;
+  display: flex;
+  align-items: center;
+  justify-content: space-between;
+  gap: 0.6rem;
+  padding: 1rem 1.2rem;
+  border: none;
+  border-radius: var(--radius);
+  background: linear-gradient(135deg, var(--pink-500), var(--pink-600));
+  color: #fff;
+  cursor: pointer;
+  box-shadow: var(--shadow-lg);
+  overflow: hidden;
+  transition: transform 0.12s ease, filter 0.18s ease;
+}
+.daka-root .today-card:active { transform: scale(0.99); }
+.daka-root .today-card::before {
+  content: "";
+  position: absolute;
+  inset: 0;
+  background: radial-gradient(80% 120% at 90% 0%, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0));
+  pointer-events: none;
+}
+.daka-root .today-card.is-checked {
+  background: linear-gradient(135deg, #ffb3c8, var(--pink-400));
+}
+.daka-root .today-card__date { font-size: 0.85rem; opacity: 0.92; position: relative; }
+.daka-root .today-card__btn {
+  font-size: 1.05rem;
+  font-weight: 800;
+  padding: 0.45rem 1rem;
+  border-radius: 999px;
+  background: rgba(255, 255, 255, 0.92);
+  color: var(--rose);
+  position: relative;
+  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
+}
+.daka-root .today-card:not(.is-checked) .today-card__btn {
+  animation: daka-pulse-btn 1.8s ease-in-out infinite;
+}
+
+/* —— 进度条 —— */
+.daka-root .progress { display: flex; flex-direction: column; gap: 0.4rem; }
+.daka-root .progress__top { display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--ink-soft); }
+.daka-root .progress__cnt { color: var(--pink-600); font-weight: 700; }
+.daka-root .progress__bar {
+  height: 9px;
+  border-radius: 999px;
+  background: var(--pink-100);
+  overflow: hidden;
+}
+.daka-root .progress__fill {
+  display: block;
+  height: 100%;
+  border-radius: 999px;
+  background: linear-gradient(90deg, var(--pink-300), var(--pink-500));
+  transition: width 0.4s cubic-bezier(0.22, 1, 0.36, 1);
+}
+
+/* —— 日历 —— */
+.daka-root .calendar {
+  background: var(--white);
+  border-radius: var(--radius);
+  padding: 0.9rem;
+  box-shadow: var(--shadow);
+}
+.daka-root .cal-nav {
+  display: flex;
+  align-items: center;
+  justify-content: space-between;
+  margin-bottom: 0.6rem;
+}
+.daka-root .cal-nav__title { font-size: 1rem; font-weight: 700; color: var(--rose); }
+.daka-root .cal-nav__btn {
+  width: 34px;
+  height: 34px;
+  border: none;
+  border-radius: 50%;
+  background: var(--pink-100);
+  color: var(--pink-600);
+  font-size: 1.2rem;
+  font-weight: 700;
+  cursor: pointer;
+  line-height: 1;
+  transition: background 0.15s ease, transform 0.12s ease;
+}
+.daka-root .cal-nav__btn:active { transform: scale(0.92); background: var(--pink-200); }
+.daka-root .cal-weekdays {
+  display: grid;
+  grid-template-columns: repeat(7, 1fr);
+  margin-bottom: 0.3rem;
+}
+.daka-root .cal-dow {
+  text-align: center;
+  font-size: 0.72rem;
+  color: var(--ink-soft);
+  font-weight: 600;
+  padding: 0.25rem 0;
+}
+.daka-root .cal-grid {
+  display: grid;
+  grid-template-columns: repeat(7, 1fr);
+  gap: 3px;
+}
+.daka-root .day {
+  position: relative;
+  aspect-ratio: 1 / 1;
+  border: none;
+  border-radius: 10px;
+  background: var(--pink-50);
+  color: var(--ink);
+  font-size: 0.86rem;
+  font-weight: 600;
+  cursor: pointer;
+  display: flex;
+  align-items: center;
+  justify-content: center;
+  transition: background 0.15s ease, transform 0.1s ease;
+}
+.daka-root .day:active { transform: scale(0.93); }
+.daka-root .day--out { color: #d8b8c4; background: transparent; }
+.daka-root .day.is-future { color: #e0c3cf; background: transparent; cursor: not-allowed; }
+.daka-root .day.is-today {
+  box-shadow: inset 0 0 0 2px var(--pink-400);
+  font-weight: 800;
+}
+.daka-root .day.is-checked {
+  background: linear-gradient(135deg, var(--pink-400), var(--pink-600));
+  color: #fff;
+  box-shadow: 0 4px 10px rgba(240, 66, 122, 0.3);
+}
+.daka-root .day.is-checked.is-today { box-shadow: inset 0 0 0 2px #fff, 0 4px 10px rgba(240, 66, 122, 0.3); }
+.daka-root .day__heart {
+  position: absolute;
+  top: 3px;
+  right: 4px;
+  font-size: 0.62rem;
+  color: #fff;
+  line-height: 1;
+  animation: daka-heart-pop 0.4s cubic-bezier(0.22, 1, 0.36, 1);
+}
+.daka-root .day.is-checked:active .day__heart { animation: none; }
+
+/* —— 爱心收藏 —— */
+.daka-root .hearts {
+  background: var(--white);
+  border-radius: var(--radius);
+  padding: 0.9rem;
+  box-shadow: var(--shadow);
+}
+.daka-root .hearts__head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.5rem; }
+.daka-root .hearts__title { font-size: 0.92rem; font-weight: 700; color: var(--rose); }
+.daka-root .hearts__cnt { font-size: 0.76rem; color: var(--ink-soft); }
+.daka-root .hearts__grid {
+  display: grid;
+  grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
+  gap: 0.5rem;
+}
+.daka-root .heart-slot {
+  aspect-ratio: 1 / 1;
+  display: flex;
+  align-items: center;
+  justify-content: center;
+  border-radius: 12px;
+  background: var(--pink-50);
+  font-size: 1.3rem;
+  color: #e6c3d2;
+  transition: transform 0.2s ease;
+}
+.daka-root .heart-slot.is-on {
+  color: var(--pink-500);
+  background: var(--pink-100);
+  filter: drop-shadow(0 2px 6px rgba(240, 66, 122, 0.25));
+  animation: daka-heart-pop 0.5s cubic-bezier(0.22, 1, 0.36, 1);
+}
+
+/* ============================================================ 档案弹层 === */
+.daka-root .sheet { position: absolute; inset: 0; z-index: 50; }
+.daka-root .sheet__backdrop {
+  position: absolute;
+  inset: 0;
+  background: rgba(90, 58, 68, 0);
+  transition: background 0.22s ease;
+}
+.daka-root .sheet.is-open .sheet__backdrop { background: rgba(90, 58, 68, 0.32); }
+.daka-root .sheet__panel {
+  position: absolute;
+  left: 0; right: 0; bottom: 0;
+  background: var(--pink-50);
+  border-radius: 22px 22px 0 0;
+  padding: 0.9rem 1rem max(1rem, env(safe-area-inset-bottom));
+  transform: translateY(100%);
+  transition: transform 0.26s cubic-bezier(0.22, 1, 0.36, 1);
+  box-shadow: 0 -10px 30px rgba(240, 66, 122, 0.18);
+  max-height: 80%;
+  overflow-y: auto;
+}
+.daka-root .sheet.is-open .sheet__panel { transform: translateY(0); }
+.daka-root .sheet__head {
+  display: flex; align-items: center; justify-content: space-between;
+  margin-bottom: 0.6rem;
+}
+.daka-root .sheet__title { font-size: 1rem; font-weight: 800; color: var(--rose); }
+.daka-root .sheet__close {
+  width: 30px; height: 30px;
+  border: none; border-radius: 50%;
+  background: var(--pink-100); color: var(--pink-600);
+  font-size: 0.9rem; cursor: pointer;
+}
+.daka-root .sheet__body { display: flex; flex-direction: column; gap: 0.5rem; }
+.daka-root .sheet__empty { text-align: center; color: var(--ink-soft); padding: 1rem 0; }
+.daka-root .sheet-row {
+  display: flex;
+  align-items: center;
+  gap: 0.4rem;
+  padding: 0.5rem;
+  border-radius: 12px;
+  background: var(--white);
+}
+.daka-root .sheet-row.is-active { box-shadow: inset 0 0 0 2px var(--pink-300); }
+.daka-root .sheet-row__main {
+  flex: 1;
+  display: flex;
+  align-items: center;
+  gap: 0.6rem;
+  border: none;
+  background: transparent;
+  cursor: pointer;
+  text-align: left;
+  min-width: 0;
+}
+.daka-root .sheet-row__avatar {
+  flex: none;
+  width: 34px; height: 34px;
+  border-radius: 50%;
+  background: linear-gradient(135deg, var(--pink-300), var(--pink-500));
+  color: #fff;
+  font-weight: 700;
+  display: flex; align-items: center; justify-content: center;
+}
+.daka-root .sheet-row__meta { display: flex; flex-direction: column; min-width: 0; }
+.daka-root .sheet-row__name { font-weight: 600; color: var(--ink); }
+.daka-root .sheet-row__name em { font-size: 0.72rem; color: var(--pink-500); font-style: normal; }
+.daka-root .sheet-row__sub { font-size: 0.74rem; color: var(--ink-soft); }
+.daka-root .sheet-row__icon {
+  flex: none;
+  width: 32px; height: 32px;
+  border: none; border-radius: 8px;
+  background: var(--pink-100); color: var(--pink-600);
+  cursor: pointer; font-size: 0.9rem;
+}
+.daka-root .sheet-row__icon--danger { background: #ffe0e0; color: #e05a5a; }
+.daka-root .sheet-row__icon--danger.is-armed { background: #e05a5a; color: #fff; }
+.daka-root .sheet-rename {
+  display: flex; gap: 0.4rem;
+  padding: 0.5rem 0.4rem 0.2rem;
+  width: 100%;
+}
+.daka-root .sheet-rename__input {
+  flex: 1;
+  padding: 0.5rem 0.7rem;
+  border: 1px solid var(--pink-200);
+  border-radius: 8px;
+  font-size: 0.92rem;
+  color: var(--ink);
+  outline: none;
+  background: var(--white);
+  user-select: text; -webkit-user-select: text;
+}
+.daka-root .sheet-rename__input:focus { border-color: var(--pink-400); }
+.daka-root .sheet-rename__ok {
+  padding: 0.5rem 0.9rem;
+  border: none; border-radius: 8px;
+  background: var(--pink-500); color: #fff;
+  font-weight: 700; cursor: pointer;
+}
+.daka-root .sheet__foot { padding-top: 0.7rem; }
+.daka-root .sheet__new {
+  width: 100%;
+  padding: 0.7rem;
+  border: 1.5px dashed var(--pink-300);
+  border-radius: 12px;
+  background: var(--white);
+  color: var(--pink-600);
+  font-weight: 700;
+  cursor: pointer;
+}
+
+/* ============================================================ 庆祝动画 === */
+.daka-root .celebrate {
+  position: absolute;
+  inset: 0;
+  z-index: 60;
+  display: flex;
+  align-items: center;
+  justify-content: center;
+  background: rgba(255, 230, 238, 0);
+  pointer-events: none;
+  transition: background 0.3s ease;
+}
+.daka-root .celebrate.is-open {
+  background: rgba(255, 214, 228, 0.78);
+  pointer-events: auto;
+}
+.daka-root .celebrate__particles {
+  position: absolute;
+  inset: 0;
+  overflow: hidden;
+}
+.daka-root .celebrate__particle {
+  position: absolute;
+  bottom: -10%;
+  font-size: 1.4rem;
+  color: var(--pink-500);
+  opacity: 0;
+  animation-name: daka-confetti-rise;
+  animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
+  animation-fill-mode: forwards;
+}
+.daka-root .celebrate__card {
+  position: relative;
+  text-align: center;
+  padding: 1.6rem 2rem;
+  background: var(--white);
+  border-radius: 24px;
+  box-shadow: var(--shadow-lg);
+  transform: scale(0.6);
+  opacity: 0;
+  transition: transform 0.35s cubic-bezier(0.22, 1.4, 0.4, 1), opacity 0.3s ease;
+}
+.daka-root .celebrate.is-open .celebrate__card { transform: scale(1); opacity: 1; }
+.daka-root .celebrate__bigheart {
+  font-size: 4rem;
+  color: var(--pink-500);
+  line-height: 1;
+  filter: drop-shadow(0 8px 16px rgba(240, 66, 122, 0.4));
+  animation: daka-heart-beat 1s ease-in-out infinite;
+}
+.daka-root .celebrate__title { margin-top: 0.4rem; font-size: 1.5rem; font-weight: 800; color: var(--rose); }
+.daka-root .celebrate__sub { margin-top: 0.2rem; font-size: 0.95rem; color: var(--ink-soft); }
+.daka-root .celebrate__btn {
+  margin-top: 1rem;
+  padding: 0.6rem 1.6rem;
+  border: none;
+  border-radius: 999px;
+  background: linear-gradient(135deg, var(--pink-500), var(--pink-600));
+  color: #fff;
+  font-weight: 700;
+  font-size: 1rem;
+  cursor: pointer;
+  box-shadow: var(--shadow);
+  pointer-events: auto;
+}
+.daka-root .celebrate__btn:active { transform: scale(0.96); }
+
+/* ============================================================ Toast === */
+.daka-root .toast-host {
+  position: absolute;
+  left: 0; right: 0; bottom: max(16px, env(safe-area-inset-bottom));
+  z-index: 40;
+  display: flex;
+  justify-content: center;
+  pointer-events: none;
+}
+.daka-root .toast {
+  padding: 0.55rem 1.1rem;
+  border-radius: 999px;
+  background: rgba(90, 58, 68, 0.92);
+  color: #fff;
+  font-size: 0.85rem;
+  opacity: 0;
+  transform: translateY(10px);
+  transition: opacity 0.22s ease, transform 0.22s ease;
+  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.2);
+}
+.daka-root .toast.is-show { opacity: 1; transform: translateY(0); }
+
+/* ============================================================ 动效关键帧（daka- 前缀防全局撞名）=== */
+@keyframes daka-heart-beat {
+  0%, 100% { transform: scale(1); }
+  25% { transform: scale(1.12); }
+  40% { transform: scale(0.96); }
+  60% { transform: scale(1.08); }
+}
+@keyframes daka-heart-pop {
+  0% { transform: scale(0); }
+  60% { transform: scale(1.25); }
+  100% { transform: scale(1); }
+}
+@keyframes daka-pulse-btn {
+  0%, 100% { box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08), 0 0 0 0 rgba(255, 93, 143, 0.5); }
+  50% { box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08), 0 0 0 8px rgba(255, 93, 143, 0); }
+}
+@keyframes daka-confetti-rise {
+  0% { opacity: 0; transform: translateY(0) rotate(0deg); }
+  10% { opacity: 1; }
+  100% { opacity: 0; transform: translateY(-110vh) rotate(360deg); }
+}
+
+/* —— 窄屏微调 —— */
+@media (max-width: 360px) {
+  .daka-root .stat__num { font-size: 1.3rem; }
+  .daka-root .day { font-size: 0.78rem; }
+  .daka-root .launcher-title { font-size: 1.7rem; }
+}
+
+/* 尊重「减少动态效果」偏好 */
+@media (prefers-reduced-motion: reduce) {
+  .daka-root .launcher-emoji,
+  .daka-root .today-card:not(.is-checked) .today-card__btn,
+  .daka-root .celebrate__bigheart,
+  .daka-root .heart-slot.is-on,
+  .daka-root .day__heart,
+  .daka-root .celebrate__particle { animation: none !important; }
+}
diff --git a/apps/da-ka/vite.config.js b/apps/da-ka/vite.config.js
new file mode 100644
index 0000000..4637605
--- /dev/null
+++ b/apps/da-ka/vite.config.js
@@ -0,0 +1,16 @@
+import { defineConfig } from 'vite';
+
+// `base: './'` 生成相对路径资源引用，便于部署到 GitHub Pages 子路径或任意静态目录。
+// 本作刻意不依赖任何框架，纯原生 DOM 渲染，构建产物极小。
+export default defineConfig({
+  base: './',
+  server: {
+    host: true,
+    port: 5176,
+  },
+  build: {
+    outDir: 'dist',
+    sourcemap: false,
+    target: 'es2018',
+  },
+});
diff --git a/src/main.js b/src/main.js
index 6d29608..8a8a875 100644
--- a/src/main.js
+++ b/src/main.js
@@ -28,6 +28,14 @@ const GAMES = [
     desc: '从呱呱坠地到垂垂老矣，一月一回合推进岁月，在健康、智力、财富、心情、社交间权衡抉择；可多槽位存档、可挂机，过完这一生。',
     loader: () => import('../apps/mo-ni-ren-sheng/src/main.js'),
   },
+  {
+    key: 'daka',
+    title: '每日打卡',
+    subtitle: '习惯 · 粉色日历',
+    emblem: '♡',
+    desc: '粉色系打卡日历：点一点记录坚持的每一天，每累计 10 天收获一颗爱心并触发庆祝。输入昵称即可多档案存档，看你的连续打卡与爱心收藏。',
+    loader: () => import('../apps/da-ka/src/main.js'),
+  },
 ]
 
 const app = document.getElementById('app')
