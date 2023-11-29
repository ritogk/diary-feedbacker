export type DiaryFeedbackerType = {
  generate(diary: string): Promise<FeedbackType>
}

export type FeedbackType = {
  title: string
  feedback: string
  mental: number
  suggestion: string
  positivity: string[]
  negativity: string
}
