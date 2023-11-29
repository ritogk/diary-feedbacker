import { EnvType } from "./env-manger"
import { GetParameterCommand, SSMClient } from "@aws-sdk/client-ssm"

const getSsmParameter = async (parameterName: string): Promise<string> => {
  const ssmClient = new SSMClient({ region: "ap-northeast-1" })
  try {
    const command = new GetParameterCommand({
      Name: parameterName,
      WithDecryption: true, // 暗号化されたパラメータの場合はtrueに設定
    })
    const response = await ssmClient.send(command)
    return response.Parameter?.Value ?? ""
  } catch (error) {
    console.error("Error getting parameter:", error)
    return ""
  }
}

export const getEnv = async (): Promise<EnvType> => {
  return {
    notionSecret: process.env.NOTION_SECRET ?? "",
    notionDiaryDatabaseId: process.env.NOTION_DIARY_DATABASE_ID ?? "",
    lineChannelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN ?? "",
    linePushUserId: await getSsmParameter("/line/user-id"),
    openaiApiKey: process.env.OPENAI_API_KEY ?? "",
  }
}
