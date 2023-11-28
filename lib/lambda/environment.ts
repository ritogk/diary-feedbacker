import { EnvironmentType } from "./environmentType"
import * as dotenv from "dotenv"
dotenv.config()

export const envorinment: EnvironmentType = {
  notionSecret: process.env.NOTION_SECRET ?? "",
  notionDiaryDabaseId: process.env.NOTION_DIARY_DATABASE_ID ?? "",
  lineChannelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN ?? "",
  linePushUserId: process.env.LINE_PUSH_USER_ID ?? "",
  openaiApiKey: process.env.OPENAI_API_KEY ?? "",
}
