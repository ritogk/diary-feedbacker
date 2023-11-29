import * as line from "@line/bot-sdk"
import { OpenAI } from "openai"
import { EnvManger } from "./env/env-manger"
import { DiaryManager } from "./diary-manager"

export const handler = async () => {
  const envManager = new EnvManger()
  const env = await envManager.getEnv()

  const diaryManager = new DiaryManager(
    env.notionSecret,
    env.notionDiaryDatabaseId
  )

  // 今日日付をyyyy-mm-dd形式で取得する
  const today = new Date()
  const diary = await diaryManager.read(today)

  // チャットする
  const openai = new OpenAI({
    apiKey: env.openaiApiKey,
  })

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
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
  
  # 目標
  会社で認められるようになる。
  
  # テンプレート
  {"title":@title, "feedback":@feedback, "mental":@mental, "suggestion":@suggestion, "positivity":@positivity, "negativity":@negativity}
      `,
      },
      {
        role: "user",
        content: diary.text,
      },
    ],
  })
  console.log(completion.choices[0]?.message.content)
  // トークン消費量を確認する
  console.log(completion.usage?.total_tokens)

  const feedback = JSON.parse(completion.choices[0]?.message.content ?? "")

  // notionページに書き込む
  diaryManager.write(
    diary.id,
    feedback.title,
    feedback.feedback,
    feedback.mental
  )

  // 指定のuser_idにプッシュ通知を行う
  const client = new line.messagingApi.MessagingApiClient({
    channelAccessToken: env.lineChannelAccessToken,
  })
  const userId = env.linePushUserId
  const message = {
    type: "text",
    text: completion.choices[0]?.message.content,
  }
  const res = await client.pushMessage({ to: userId, messages: [message] })
  console.log(res)
}
