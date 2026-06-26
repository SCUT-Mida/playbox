# Playbox · 玩盒子

> 用 GitHub Actions + Claude Code 搭一条 **「提 Issue → AI 写码 → AI 审查 → AI 修复 → 自动合并 → 自动部署」** 的全自动流水线。
> Issue 是 idea，流水线是工厂，Pages 是橱窗。

---

## 流水线全貌

```
 ┌──────────┐     ┌───────────┐     ┌─────────────┐     ┌────────────┐
 │  你提     │────▶│  AI Coder │────▶│ AI Reviewer │────▶│ Auto Merger│
 │  Issue   │     │  写码推 PR │     │   审 diff    │     │  合并关单   │
 │打ai-task │     └───────────┘     └──────┬──────┘     └─────┬──────┘
 └──────────┘                              │                   │
                                     不通过 │ 通过              │
                                           ▼                   ▼
                                    ┌─────────────┐      ┌────────────┐
                                    │  AI Fixer   │      │ Deploy Pages│
                                    │ 按意见修复   │      │  构建部署   │
                                    └──────┬──────┘      └────────────┘
                                           │ 推送新代码
                                           ▼
                                    重新触发 Reviewer（synchronize）
                                           │
                                      循环直到通过
```

五个工作流自动接力，全程无需人工介入（除了最后想看一眼审查意见的话可以手动 approve）。

---

## 工作流详解

| 工作流 | 文件 | 触发条件 | 干什么 |
|---|---|---|---|
| **AI Coder** | `ai-coder.yml` | Issue 被打上 `ai-task` 标签 | 读 Issue → Claude Code 实现 → 推送到 `ai-fix/issue-N` 分支 → 开 PR |
| **AI Reviewer** | `ai-reviewer.yml` | PR 创建 / PR 有新提交（synchronize） | 取 diff → Claude Code 审查 → 输出 `APPROVE` 或 `REQUEST_CHANGES` + 意见 |
| **AI Fixer** | `ai-fixer.yml` | PR 评论里出现 `/claude-fix` | 读审查意见 → Claude Code 修码 → 推送 → 触发新一轮 Reviewer |
| **Auto Merger** | `auto-merge.yml` | PR 收到 approve 状态的 review | squash 合并 → 删分支 → 关 Issue |
| **Deploy Pages** | `deploy-pages.yml` | push 到 `main` | `npm ci && npm run build` → 部署 `dist/` 到 GitHub Pages |

**审查-修复闭环**：Reviewer 不通过时会在 PR 评论里发 `/claude-fix`，这条评论触发 Fixer；Fixer 推送新代码后又触发 Reviewer 的 `synchronize`——两人来回拉扯直到 Reviewer 满意 approve，Merger 接力合并。

---

## `.ai-tasks/` 交互文档系统

流水线各角色之间不直接传参，而是通过 `.ai-tasks/issue-N/` 目录下的 **Markdown 文档** 交换信息。一个核心脚本 [`generate-ai-task.sh`](.ai-tasks/scripts/generate-ai-task.sh) 负责按角色和轮次生成提示词文件。

```
.ai-tasks/
  scripts/
    generate-ai-task.sh          # 提示词生成脚本（coder / reviewer / fixer 三种角色）
  issue-3/                       # 每个 Issue 运行时自动建一个目录
    context.md                   #   coder 写入：Issue 原文
    ai-coder-prompt.md           #   coder 的提示词
    pr_diff_r1.md                #   reviewer 第 1 轮：git diff origin/main...HEAD
    ai-reviewer-prompt_r1.md     #   reviewer 第 1 轮的提示词
    review_result_r1.md          #   reviewer 第 1 轮输出（含 DECISION + COMMENT）
    review_feedback_round-1.md   #   fixer 第 1 轮：从 PR 评论提取的审查意见
    fixer-round-1.md             #   fixer 第 1 轮的提示词
    ...                          #   多轮修复时文件名带递增轮次号 _r2 / round-2 ...
```

**轮次计算**：Reviewer 和 Fixer 各自通过 `find` 统计已有文件数量来推算当前是第几轮，文件名带 `_r${N}` 或 `-round-${N}` 后缀，天然支持无限轮次循环。

---

## 红线规则

所有角色的提示词里都写了同一条硬约束：

> **绝对不要修改、重命名或生成 `.github/` 目录下的任何文件。**
> 如果觉得 CI/CD 需要改，在回复里用文字建议人类去改，绝不自己动手。

这样 Claude Code 能放手改业务代码，但碰不到流水线自身——防止 AI 把自己的"产线"拆了。

---

## 快速上手

### 1. Fork / Clone 这个仓库

### 2. 配置 Secrets

仓库 **Settings → Secrets and variables → Actions** 里加两条：

| Secret 名 | 用途 | 怎么拿 |
|---|---|---|
| `GLM_API_KEY` | 智谱 GLM 的 API Key，作为 Claude Code 的 `ANTHROPIC_AUTH_TOKEN` | [智谱开放平台](https://open.bigmodel.cn/) → API Keys |
| `PAT_TOKEN` | GitHub Personal Access Token（需要 repo + workflow 权限），给 `gh` CLI 用 | GitHub → Settings → Developer settings → PAT (classic) → 勾 `repo` |

### 3. 配置 GitHub Pages

仓库 **Settings → Pages → Source** 选 **「GitHub Actions」**（不是 Deploy from a branch）。
这样 `deploy-pages.yml` 才有权限部署。

### 4. 提一个 Issue 试试

- 新建 Issue，写清楚你想要什么功能
- 给 Issue 打上 **`ai-task`** 标签
- 几秒后 AI Coder 就会开始干活，去 Actions 页面看日志

### 5. 看结果

- PR 页面看审查意见和修复过程
- 合并后 Pages 自动部署，去 `https://<你的用户名>.github.io/<仓库名>/` 看效果

---

## 模型配置

工作流通过智谱的 Anthropic 兼容端点把 Claude Code 接到 GLM 上：

```yaml
ANTHROPIC_BASE_URL:          https://open.bigmodel.cn/api/anthropic
ANTHROPIC_DEFAULT_HAIKU_MODEL:  glm-4.7
ANTHROPIC_DEFAULT_SONNET_MODEL: glm-5.2[1m]
ANTHROPIC_DEFAULT_OPUS_MODEL:   glm-5.2[1m]
ANTHROPIC_AUTH_TOKEN:        ${{ secrets.GLM_API_KEY }}
```

Claude Code 以 `--dangerously-skip-permissions` 模式运行（全自动，不弹权限确认）。

---

## 目录结构

```
playbox/
├── .github/workflows/
│   ├── ai-coder.yml          # Issue → 写码 → PR
│   ├── ai-reviewer.yml       # PR → 审查
│   ├── ai-fixer.yml          /claude-fix → 修复
│   ├── auto-merge.yml        # approve → 合并
│   └── deploy-pages.yml      # main → Pages 部署
├── .ai-tasks/
│   └── scripts/
│       └── generate-ai-task.sh   # 提示词生成核心脚本
├── .gitattributes            # 强制 YAML/sh 用 LF（防 CRLF 泄漏）
├── index.html                # 主框架入口
├── src/                      # 主框架源码（落地页）
├── vite.config.js            # base: './' 兼容 Pages 子路径
└── package.json
```

---

## 本地开发

```bash
npm install
npm run dev       # 开发服务器 http://localhost:5173
npm run build     # 生产构建 → dist/
npm run preview   # 预览构建产物
```

主框架是一个最小 Vite 静态站，作为 Pages 的部署基座。Issue 开发的功能（游戏、工具、demo）会通过流水线合并进来，逐步充实这个"橱窗"。
