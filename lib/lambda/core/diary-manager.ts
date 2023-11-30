import { Client } from "@notionhq/client"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import timezone from "dayjs/plugin/timezone"

export type DiaryManagerType = {
  getDiary(): string
  load(date: Date): Promise<void>
  write(
    title: string,
    summary: string,
    mental: number,
    feedback: string,
    suggestion: string,
    positivity: string,
    negativity: string
  ): Promise<boolean>
}

export class DiaryManager implements DiaryManagerType {
  private readonly client: Client
  private page = { id: "", text: "" }
  private readonly dayjs = dayjs
  constructor(secret: string, private readonly diaryDatabaseId: string) {
    this.client = new Client({
      auth: secret,
    })
    this.dayjs.extend(utc)
    this.dayjs.extend(timezone)
  }

  getDiary(): string {
    return this.page.text
  }

  load = async (today: Date): Promise<void> => {
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
      this.page = { id: pages[0].id, text: diaryBlocks.join("\n") }
    }
    return
  }

  write = async (
    title: string,
    summary: string,
    mental: number,
    feedback: string,
    suggestion: string,
    positivity: string,
    negativity: string
  ): Promise<boolean> => {
    await this.client.pages.update({
      page_id: this.page.id,
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
        Summary: {
          rich_text: [
            {
              text: {
                content: summary,
              },
            },
          ],
        },
        Mental: {
          number: mental,
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
        Suggestion: {
          rich_text: [
            {
              text: {
                content: suggestion,
              },
            },
          ],
        },
        Positivity: {
          rich_text: [
            {
              text: {
                content: positivity,
              },
            },
          ],
        },
        Negativity: {
          rich_text: [
            {
              text: {
                content: negativity,
              },
            },
          ],
        },
      },
    })

    return true
  }
}
