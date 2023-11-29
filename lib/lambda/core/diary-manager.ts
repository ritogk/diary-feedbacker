import { Client } from "@notionhq/client"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import timezone from "dayjs/plugin/timezone"

export type DiaryManagerType = {
  read(date: Date): Promise<{ id: string; text: string }>
  write(
    id: string,
    title: string,
    feedback: string,
    mental: number
  ): Promise<boolean>
}

export class DiaryManager implements DiaryManagerType {
  private readonly client: Client
  private readonly dayjs = dayjs
  constructor(secret: string, private readonly diaryDatabaseId: string) {
    this.client = new Client({
      auth: secret,
    })
    this.dayjs.extend(utc)
    this.dayjs.extend(timezone)
  }

  read = async (today: Date): Promise<{ id: string; text: string }> => {
    const todayFormatted = this.dayjs(today)
      .tz("Asia/Tokyo")
      .format("YYYY-MM-DD")
    const response = await this.client.databases.query({
      database_id: this.diaryDatabaseId,
      filter: {
        property: "Date",
        date: {
          equals: todayFormatted,
        },
      },
    })

    const pages = response.results
    const diaryBlocks: string[] = []
    if (pages.length > 0) {
      const page = pages[0]
      // ページ内に含まれるブロックの内容を出力する
      const response = await this.client.blocks.children.list({
        block_id: page.id,
      })
      // テキストのみ出力する
      response.results.forEach((block: any) => {
        if (
          block.type === "paragraph" &&
          block.paragraph.rich_text.length > 0
        ) {
          diaryBlocks.push(block.paragraph.rich_text[0].plain_text)
        }
      })
    }
    return { id: pages[0] ? pages[0].id : "", text: diaryBlocks.join("\n") }
  }

  write = async (
    id: string,
    title: string,
    feedback: string,
    mental: number
  ): Promise<boolean> => {
    await this.client.pages.update({
      page_id: id,
      properties: {
        title: {
          title: [
            {
              text: {
                content: title,
              },
            },
          ],
        },
        Feedback: {
          rich_text: [
            {
              text: {
                content: feedback,
              },
            },
          ],
        },
        Mental: {
          number: mental,
        },
      },
    })

    return true
  }
}
