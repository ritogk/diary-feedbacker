import * as line from "@line/bot-sdk"
import { OpenAI } from "openai"
import { EnvManger } from "./env/env-manger"
import { DiaryManager } from "./diary-manager"
import { DiaryFeedbacker } from "./diary-feedbacker"

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

  // フィードバックを受け取る
  const diaryFeedbacker = new DiaryFeedbacker(env.openaiApiKey)
  const feedback = await diaryFeedbacker.generate(diary.text)

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
    text: JSON.stringify(feedback),
  }
  const res = await client.pushMessage({ to: userId, messages: [message] })
  console.log(res)
}
