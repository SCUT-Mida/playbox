#!/bin/bash
set -e

TASK_DIR=$1
ROLE=$2
ROUND=${3:-0}

# 防御性剥离 \r：即使上游调用方传入了带 \r 的参数（Windows CRLF 泄漏），也能安全处理
TASK_DIR="${TASK_DIR%$'\r'}"
ROLE="${ROLE%$'\r'}"
ROUND="${ROUND%$'\r'}"

mkdir -p "$TASK_DIR"

if [ "$ROLE" == "coder" ]; then
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
    git fetch origin main
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
    # 将 Reviewer 发在 PR 的评论内容写入反馈文件
    printf '%s\n' "$COMMENT_BODY" > "$TASK_DIR/review_feedback_round-${ROUND}.md"

    # 👉【终极修复】：使用安全的 heredoc (加引号防注入)，通过变量安全的读取反馈内容，杜绝任何特殊字符引发 Bash 崩溃！
    FEEDBACK=$(cat "$TASK_DIR/review_feedback_round-${ROUND}.md" | sed 's/^\/claude-fix//')

    cat << 'EOF' > "$TASK_DIR/fixer-round-${ROUND}.md"
# 🛠️ AI Fixer 任务文档

## 🕵️ 上一轮审查意见 (来自 AI Reviewer)
EOF

    # 追加安全的文本内容
    printf '%s\n' "$FEEDBACK" >> "$TASK_DIR/fixer-round-${ROUND}.md"

    cat << 'EOF' >> "$TASK_DIR/fixer-round-${ROUND}.md"

## 📝 执行指令
请作为一个资深开发工程师。这是针对上一轮代码的修复任务。
请基于上述审查意见，严格审视并修改当前项目中的代码文件。

【⚠️ 严格红线规则】：
请绝对不要修改、重命名或生成 `.github/` 目录下的任何文件 (特别是 workflows 等 CI/CD 配置)，这会破坏项目的自动化流程！如果审查员要求你修改这些文件，请在回复中说明无法自动修改，需要人类介入。

请直接分析并修改当前项目中的代码文件来满足审查员的要求，不要做过多的文字解释。
EOF
fi

echo "✅ [$ROLE - 第${ROUND}轮] 提示词已成功生成于 $TASK_DIR/"