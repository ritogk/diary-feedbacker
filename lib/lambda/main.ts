import { EnvManger } from "./env/env-manger"
import { DiaryManager } from "./diary-manager"
import { DiaryFeedbacker } from "./diary-feedbacker"
import { Notification } from "./notification"

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

  // 通知する
  const notification = new Notification(env.lineChannelAccessToken)
  notification.notice(env.linePushUserId, JSON.stringify(feedback))
}
