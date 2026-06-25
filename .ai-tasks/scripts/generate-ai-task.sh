#!/bin/bash
set -e

# 接收参数：目录、角色、轮次 (Coder 默认为 0)
TASK_DIR=$1
ROLE=$2
ROUND=${3:-0}

mkdir -p "$TASK_DIR"

# ==========================================
# 核心逻辑：根据不同角色和轮次组装 MD 文件
# ==========================================

if [ "$ROLE" == "coder" ]; then
    # Coder 通过环境变量 $ISSUE_BODY 获取内容
    printf '%s\n' "$ISSUE_BODY" > "$TASK_DIR/context.md"
    cat << EOF > "$TASK_DIR/ai-coder-prompt.md"
你是一个资深开发者。请解决以下 GitHub Issue：
【任务标题】: $ISSUE_TITLE
【详细需求】: 请直接阅读当前目录下的 \`${TASK_DIR}/context.md\` 文件获取。

【⚠️ 严格红线规则】：
请绝对不要修改、重命名或生成 \`.github/\` 目录下的任何文件 (特别是 workflows 等 CI/CD 配置)，这会破坏项目的自动化流程！如果觉得有必要修改，请在回复中用文字建议人类去改，绝不要自己动手改。

请直接分析并修改项目中的代码文件来解决这个问题，不要做过多的文字解释。
EOF

elif [ "$ROLE" == "reviewer" ]; then
    # 👇【绝佳设计】脚本自己执行 git 命令抓取 diff
    # 确保拿到最新的 main 分支代码
    git fetch origin main

    # 获取当前分支与 main 的差异，保存为带轮次的 md 文件
    git diff origin/main...HEAD > "$TASK_DIR/pr_diff_r${ROUND}.md"

    cat << EOF > "$TASK_DIR/ai-reviewer-prompt_r${ROUND}.md"
你是一个极其严格、甚至有些刁钻的资深代码审查员。
这是代码提交后的【第 ${ROUND} 轮】审查。
请阅读当前目录下的 \`${TASK_DIR}/pr_diff_r${ROUND}.md\` 文件，这是本次 PR 的代码变更。

请检查是否有 Bug、逻辑错误、安全问题或性能瓶颈。
请严格按照以下纯文本格式输出你的审查结果，不要输出其他任何内容：
DECISION: APPROVE 或 REQUEST_CHANGES
COMMENT: 你的详细审查意见 (如果你的意见中涉及需要修改 CI/CD 或 workflows，请告知人类手动处理)
EOF

elif [ "$ROLE" == "fixer" ]; then
    # Fixer 通过环境变量 $COMMENT_BODY 获取意见
    printf '%s\n' "$COMMENT_BODY" > "$TASK_DIR/review_feedback_r${ROUND}.md"

    cat << EOF > "$TASK_DIR/ai-fixer-prompt_r${ROUND}.md"
请作为一个资深开发工程师。这是针对上一轮代码的【第 ${ROUND} 轮】修复任务。
以下是代码审查员给你的修改建议：
请阅读当前目录下的 \`${TASK_DIR}/review_feedback_r${ROUND}.md\` 文件获取详细内容 (注意：忽略第一行的 "/claude-fix" 指令前缀)。

【⚠️ 严格红线规则】：
请绝对不要修改、重命名或生成 \`.github/\` 目录下的任何文件 (特别是 workflows 等 CI/CD 配置)，这会破坏项目的自动化流程！如果审查员要求你修改这些文件，请在回复中说明无法自动修改，需要人类介入。

请直接分析并修改当前项目中的代码文件来满足审查员的要求，不要做过多的文字解释。
EOF

fi

echo "✅ [$ROLE - 第${ROUND}轮] 提示词已成功生成于 $TASK_DIR/"