import { FeedbackType } from "@/core/diary-feedbacker/prompt"
export const generate = (feedback: FeedbackType): string => {
  const message = `今日も1日お疲れ様でした！
私が感じた事をお伝えしますね。

■タイトル
${feedback.title}

■フィードバック
${feedback.feedback}

■メンタル(0~10)
${feedback.mental}

■改善提案
${feedback.suggestion}

■良い所
${feedback.positivity.join("\n")}

■悪い所
${feedback.negativity}

■要約
${feedback.summary}
`
  return message
}
