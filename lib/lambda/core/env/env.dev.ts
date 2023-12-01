import { EnvType } from "./env-manger"
import * as dotenv from "dotenv"
import * as path from "path"

export const getEnv = async (): Promise<EnvType> => {
  dotenv.config({ path: path.join(__dirname, "local.env") })
  return {
    notionSecret: process.env.NOTION_SECRET ?? "",
    notionDiaryDatabaseId: process.env.NOTION_DIARY_DATABASE_ID ?? "",
    lineChannelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN ?? "",
    linePushUserId: process.env.LINE_PUSH_USER_ID ?? "",
    openaiApiKey: process.env.OPENAI_API_KEY ?? "",
  }
}
