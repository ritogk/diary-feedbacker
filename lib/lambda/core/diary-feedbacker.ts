import { OpenAI } from "openai"

export type DiaryFeedbackerType = {
  generate(diary: string): Promise<FeedbackType>
}

export type FeedbackType = {
  title: string
  summary: string
  feedback: string
  mental: number
  suggestion: string
  positivity: string[]
  negativity: string
}

export class DiaryFeedbacker implements DiaryFeedbackerType {
  private readonly openai: OpenAI
  constructor(openAIApiKey: string) {
    this.openai = new OpenAI({
      apiKey: openAIApiKey,
    })
  }
  generate = async (diary: string): Promise<FeedbackType> => {
    const completion = await this.openai.chat.completions.create({
      // model: "gpt-3.5-turbo",
      model: "gpt-4",
      max_tokens: 800,
      messages: [
        {
          role: "system",
          content: `
    あなたはプロの臨床心理士です。
    以下の制約条件と入力された日記をもとに出力してください。
    
    # 制約条件:
    テンプレート以外を出力する事は禁止です。
    出力はjson形式です。
    入力と目標をもとに50文字以内のタイトルをつけ、@titleに埋め込んで下さい。文字列型です。
    入力と目標をもとにフィードバックを150文字以内で@feedbackに埋め込んで下さい。文字列型です。
    入力と目標をもとにメンタルを0-10段階で評価し、数値で@mentalに埋め込んで下さい。数値型です。
    入力と目標をもとに改善提案を150文字以内で@suggestionに埋め込んで下さい。文字列型です。
    入力と目標をもとに良い点を3つあげて@positivity埋め込んで下さい。配列で文字列型です。
    入力と目標をもとに悪い点を1つ@negativityに埋め込んで下さい。文字列型です。
    入力をもとに本人目線で要約を行い、文字数は元の文章の文字数の半分以下にして@summaryに埋め込んで下さい。文字列型です。
    
    # 目標
    会社で認められるようになる。
    
    # テンプレート
    {"title":@title, "feedback":@feedback, "mental":@mental, "suggestion":@suggestion, "positivity":@positivity, "negativity":@negativity, "summary":@summary}
        `,
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
