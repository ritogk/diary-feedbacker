import { EnvManger } from "./core/env/env-manger"
import { DiaryManager } from "./core/diary-manager"
import { DiaryFeedbacker } from "./core/diary-feedbacker"
import { Notification } from "./core/notification/notification"
import * as MessageGenerater from "./core/notification/message-generater"

export const handler = async () => {
  const envManager = new EnvManger()
  const env = await envManager.getEnv()

  const diaryManager = new DiaryManager(
    env.notionSecret,
    env.notionDiaryDatabaseId
  )

  // 今日日付をyyyy-mm-dd形式で取得する
  console.log("[st] get today diary")
  const today = new Date()
  const diary = await diaryManager.read(today)
  if (diary.text === "") {
    console.log("no diary")
    return
  }
  console.log("[ed] get today diary")

  // フィードバックを受け取る
  console.log("[st] generate feedback")
  const diaryFeedbacker = new DiaryFeedbacker(env.openaiApiKey)
  const feedback = await diaryFeedbacker.generate(diary.text)
  console.log("[ed] generate feedback")

  // notionページに書き込む
  console.log("[st] write diary")
  diaryManager.write(
    diary.id,
    feedback.title,
    feedback.feedback,
    feedback.mental
  )
  console.log("[ed] write diary")

  // 通知する
  console.log("[st] notice")
  const notification = new Notification(env.lineChannelAccessToken)
  notification.notice(env.linePushUserId, MessageGenerater.generate(feedback))
  console.log("[ed] notice")
}
