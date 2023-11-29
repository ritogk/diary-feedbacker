import { NotificationType } from "./notification-type"
import * as line from "@line/bot-sdk"

export class Notification implements NotificationType {
  private readonly client: line.messagingApi.MessagingApiClient
  constructor(channelAccessToken: string) {
    this.client = new line.messagingApi.MessagingApiClient({
      channelAccessToken: channelAccessToken,
    })
  }

  notice = async (id: string, text: string): Promise<boolean> => {
    const res = await this.client.pushMessage({
      to: id,
      messages: [
        {
          type: "text",
          text: text,
        },
      ],
    })
    return true
  }
}
