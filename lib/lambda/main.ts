const { Client } = require("@notionhq/client")
import * as line from "@line/bot-sdk"
import { OpenAI } from "openai"
import { getEnvironment } from "./environment"

export const handler = async () => {
  const env = await getEnvironment()

  const notionToken = env.notionSecret
  const databaseId = env.notionDiaryDabaseId

  // Initializing a client
  const notion = new Client({
    auth: notionToken,
  })
  // データベースの日付が2023-11/14のものを取得する
  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      property: "Date",
      date: {
        equals: "2023-11-15",
      },
    },
  })
  const pages = response.results
  if (pages.length > 0) {
    const page = pages[0]
    // ページ内に含まれるブロックの内容を出力する
    const response = await notion.blocks.children.list({
      block_id: page.id,
    })
    // テキストのみ出力する
    response.results.forEach((block: any) => {
      if (block.type === "paragraph" && block.paragraph.rich_text.length > 0) {
        console.log(block.paragraph.rich_text[0].plain_text)
      }
    })

    // pageのmentalプロパティに値を書き込む
    const response2 = await notion.pages.update({
      page_id: page.id,
      properties: {
        mental: {
          number: 5,
        },
      },
    })

    // 指定のuser_idにプッシュ通知を行う
    const client = new line.messagingApi.MessagingApiClient({
      channelAccessToken: env.lineChannelAccessToken,
    })
    const userId = env.linePushUserId
    const message = {
      type: "text",
      text: "Hello, world",
    }
    const res = await client.pushMessage({ to: userId, messages: [message] })
    console.log(res)

    const openai = new OpenAI({
      apiKey: env.openaiApiKey,
    })

    // チャットする
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      max_tokens: 800,
      messages: [
        {
          role: "system",
          content: `
  あなたはプロの臨床心理士です。
  以下の制約条件と入力された日記をもとに出力してください。
  
  # 制約条件:
  テンプレート以外を出力する事は禁止です。
  出力はjson形式です。
  入力と目標をもとに50文字以内のタイトルをつけ、@titleに埋め込んで下さい。文字列型です。
  入力と目標をもとにフィードバックを150文字以内で@feedbackに埋め込んで下さい。文字列型です。
  入力と目標をもとにメンタルを0-10段階で評価し、数値で@mentalに埋め込んで下さい。数値型です。
  入力と目標をもとに改善提案を150文字以内で@suggestionに埋め込んで下さい。文字列型です。
  入力と目標をもとに良い点を3つあげて@positivity埋め込んで下さい。配列で文字列型です。
  入力と目標をもとに悪い点を1つ@negativityに埋め込んで下さい。文字列型です。
  
  # 目標
  会社で認められるようになる。
  
  # テンプレート
  {"title":@title, "feedback":@feedback, "mental":@mental, "suggestion":@suggestion, "positivity":@positivity, "negativity":@negativity}
      `,
        },
        {
          role: "user",
          content: `
          今日はやつと散歩しにいったが、理解できない事を永遠と聞かされると人間って疲れるんだなあと感じた。
            `,
        },
      ],
    })
    console.log(completion.choices[0]?.message.content)
    // トークン消費量を確認する
    console.log(completion.usage?.total_tokens)
  }
}
