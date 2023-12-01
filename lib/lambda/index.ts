import { EnvManger } from "./core/env/env-manger"
import { DiaryManager } from "./core/diary-manager"
import { DiaryFeedbacker } from "./core/diary-feedbacker/diary-feedbacker"
import { Notification } from "./core/notification/notification"
import * as MessageGenerater from "./core/notification/message-generater"

export const handler = async (event: any) => {
  return new Promise(async (resolve, reject) => {
    try {
      const envManager = new EnvManger()
      const env = await envManager.getEnv()

      const diaryManager = new DiaryManager(
        env.notionSecret,
        env.notionDiaryDatabaseId
      )

      // 今日日付の日記を取得する
      console.log("[st] fetch today diary")
      const today = new Date()
      await diaryManager.load(today)
      const diary = diaryManager.getDiary()
      if (diary === "") {
        console.log("[message] empty diary")
        reject("diary not found")
      }
      console.log("[ed] fetch today diary")

      // 日記のフィードバックを受け取る
      console.log("[st] generate feedback")
      const diaryFeedbacker = new DiaryFeedbacker(env.openaiApiKey)
      const feedback = await diaryFeedbacker.generate(diary)
      console.log("[ed] generate feedback")

      // 日記にフィードバックを書き込む
      console.log("[st] write diary")
      diaryManager.write(
        feedback.title,
        feedback.summary,
        feedback.mental,
        feedback.feedback,
        feedback.suggestion,
        feedback.positivity.join(", "),
        feedback.negativity
      )
      console.log("[ed] write diary")

      // 通知する
      console.log("[st] notice")
      const notification = new Notification(env.lineChannelAccessToken)
      await notification.notice(
        env.linePushUserId,
        MessageGenerater.generate(feedback)
      )
      console.log("[ed] notice")

      resolve({
        statusCode: 200,
        body: JSON.stringify("success"),
      })
    } catch (error) {
      reject(error)
    }
  })
}
