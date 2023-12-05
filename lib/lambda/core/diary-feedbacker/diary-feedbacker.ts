import { OpenAI } from "openai"
import { FeedbackType, generatePrompt } from "./prompt"

export type DiaryFeedbackerType = {
  generate(diary: string, goal: string): Promise<FeedbackType>
}

export class DiaryFeedbacker implements DiaryFeedbackerType {
  private readonly openai: OpenAI
  constructor(openAIApiKey: string) {
    this.openai = new OpenAI({
      apiKey: openAIApiKey,
    })
  }
  generate = async (diary: string, goal: string): Promise<FeedbackType> => {
    const completion = await this.openai.chat.completions.create({
      // model: "gpt-3.5-turbo",
      model: "gpt-4",
      max_tokens: 800,
      messages: [
        {
          role: "system",
          content: generatePrompt(goal),
        },
        {
          role: "user",
          content: diary,
        },
      ],
    })

    // console.log(completion.usage?.total_tokens)
    if (!completion.choices[0]?.message.content) {
      return {
        summary: "",
        feedback: "",
        title: "",
        mental: 0,
        suggestion: "",
        positivity: [],
        negativity: "",
      }
    }

    return JSON.parse(completion.choices[0]?.message.content) as FeedbackType
  }
}
