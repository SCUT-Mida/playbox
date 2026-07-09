# Playbox · 玩盒子

> 用 GitHub Actions + Claude Code 搭一条 **「提 Issue → AI 写码 → AI 审查修复 → 自动合并 → 自动部署」** 的全自动流水线。
> Issue 是 idea，流水线是工厂，Pages 是橱窗。

---

## 流水线全貌

```
 ┌──────────┐     ┌───────────┐     ┌─────────────────────┐
 │  你提     │────▶│  AI Coder │────▶│  AI Review & Fix    │
 │  Issue   │     │  写码推 PR │     │                     │
 │打ai-task │     └───────────┘     │  ┌───────────────┐  │
 └──────────┘                       │  │  Claude 审查   │  │
                                    │  └───────┬───────┘  │
                                    └──────────┼──────────┘
                                          通过 │ 不通过
                                     ┌────────┴────────┐
                                     ▼                 ▼
                              ┌────────────┐    ┌────────────┐
                              │ 合并+关Issue│    │ 内联修复    │
                              │（squash）  │    │ +推送       │
                              └──────┬─────┘    └──────┬─────┘
                                     │                 │ 推送触发 synchronize
                                     │                 ▼
                                     │          重新审查（循环）
                                     │          直到通过或达上限
                                     ▼
                              ┌──────────────┐
                              │ Deploy Pages │
                              │  构建+部署    │
                              └──────────────┘
```

三个工作流自动接力，审查-修复循环全程无需人工介入。

---

## 工作流详解

| 工作流 | 文件 | 触发条件 | 干什么 |
|---|---|---|---|
| **AI Coder** | `ai-coder.yml` | Issue 被打上 `ai-task` 标签 | 读 Issue → Claude Code 实现 → 推送到 `ai-fix/issue-N` 分支 → 开 PR |
| **AI Review & Fix** | `ai-reviewer.yml` | PR 创建 / PR 有新提交（synchronize） | 取 diff → Claude Code 审查 → APPROVE 则合并关单；REQUEST_CHANGES 则在同一 job 内修复代码并推送，触发新一轮审查 |
| **Deploy Pages** | `deploy-pages.yml` | push 到 `main` | `npm ci && npm run build` → 部署 `dist/` 到 GitHub Pages |

**审查-修复闭环**：Review & Fix Pipeline 审查不通过时，直接在同一个 workflow job 内调用 Claude Code 修复代码并推送。推送使用 `PAT_TOKEN` 认证（而非默认的 `GITHUB_TOKEN`），确保能正常触发 PR 的 `synchronize` 事件，自动开启新一轮审查——审查→修复→推送→再审查，循环直到审查通过后自动合并。达到最大轮次（8 轮）时自动评论通知人工介入。

> **为什么不再有独立的 Fixer 工作流？** 原架构中 Fixer 通过 `issue_comment` 事件触发（Reviewer 在 PR 评论 `/claude-fix`），但 GitHub 对 `issue_comment` 触发的工作流强制要求人工点击「Approve and Run」。将修复逻辑内联到 Reviewer 后，整个循环仅依赖 `pull_request` 事件，配合 `PAT_TOKEN` 推送，实现零人工审批的全自动审查-修复循环。

---

## `.ai-tasks/` 交互文档系统

流水线各角色之间不直接传参，而是通过 `.ai-tasks/issue-N/` 目录下的 **Markdown 文档** 交换信息。每条 workflow 各自内联生成自己的提示词文件（曾经有一个共享脚本 `generate-ai-task.sh`，但因为 workflow 从 main 运行而脚本从 PR 分支 checkout，版本容易不一致，已删除改为内联）。

```
.ai-tasks/
  issue-3/                       # 每个 Issue 运行时自动建一个目录
    context.md                   #   coder 写入：Issue 原文
    ai-coder-prompt.md           #   coder 的提示词（workflow 内联生成）
    pr_diff_r1.md                #   reviewer 第 1 轮：git diff origin/main...HEAD
    ai-reviewer-prompt_r1.md     #   reviewer 第 1 轮的提示词（workflow 内联生成）
    review_result_r1.md          #   reviewer 第 1 轮输出（含 DECISION + COMMENT，仅 CI 临时存在，不提交）
    review_error_r1.log          #   reviewer 第 1 轮 stderr 日志（仅 CI 临时存在，不提交）
    fixer-feedback_r1.md         #   审查不通过时的审查意见（reviewer 直接写入，不再通过 PR 评论中转）
    fixer-prompt_r1.md           #   fixer 第 1 轮的提示词（workflow 内联生成）
    ...                          #   多轮修复时文件名带递增轮次号 _r2 ...
```

**轮次计算**：通过统计已提交的 `fixer-feedback_r*.md` 文件数量推算当前是第几轮（每轮修复会提交一个 feedback 文件），文件名带 `_r${N}` 后缀，天然支持无限轮次循环。最大轮次保护为 8 轮，超出后评论通知人工介入。

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
│   ├── ai-reviewer.yml       # PR → 审查 → 修复 → 合并（一体化）
│   └── deploy-pages.yml      # main → Pages 部署
├── .ai-tasks/                     # 运行时生成的提示词/审查文档（每 Issue 一个子目录）
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
