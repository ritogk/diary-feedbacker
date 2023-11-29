import * as dev from "./env.dev"
import * as prod from "./env.prod"
import * as dotenv from "dotenv"
dotenv.config()

export type EnvType = {
  notionSecret: string
  notionDiaryDabaseId: string
  lineChannelAccessToken: string
  linePushUserId: string
  openaiApiKey: string
}

export type ModeType = "dev" | "prod"

export class EnvManger {
  private mode: ModeType
  constructor() {
    console.log(process.env.MODE)
    this.mode = process.env.MODE === "prod" ? "prod" : "dev"
  }
  async getEnv(): Promise<EnvType> {
    return this.mode === "dev" ? await dev.getEnv() : await prod.getEnv()
  }
}
