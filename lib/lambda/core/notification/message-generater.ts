import { FeedbackType } from "@/core/diary-feedbacker/prompt"
export const generate = (feedback: FeedbackType): string => {
  const message = `■タイトル
${feedback.title}

■フィードバック
${feedback.feedback}

■メンタル
${feedback.mental}

■改善提案
${feedback.suggestion}

■良い所
${feedback.positivity.join("\n")}

■悪い所
${feedback.negativity}`
  return message
}
